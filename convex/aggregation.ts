/**
 * Aggregation Mutations
 *
 * Nightly aggregation logic. Called by aggregationAction.ts.
 * These are Convex mutations (no "use node") that read/write the DB.
 */

import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import {
  fitWeibull,
  blendWeibullParams,
  isOutlierLifespan,
  INTELLIGENCE_GUARDRAILS,
  BOOTSTRAP_RELIABILITY,
} from "./intelligenceUtils";

export const aggregateSystemReliability = internalMutation({
  handler: async (ctx) => {
    const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);

    const events = await ctx.db
      .query("systemEvents")
      .filter((q) => q.gte(q.field("createdAt"), oneYearAgo))
      .collect();

    if (events.length === 0) return;

    const groups = new Map<string, typeof events>();

    for (const event of events) {
      if (isOutlierLifespan(event.ageAtEvent, event.systemType)) continue;

      const globalKey = `${event.systemType}::__all__::__all__`;
      if (!groups.has(globalKey)) groups.set(globalKey, []);
      groups.get(globalKey)!.push(event);

      if (event.make) {
        const brandKey = `${event.systemType}::${event.make}::__all__`;
        if (!groups.has(brandKey)) groups.set(brandKey, []);
        groups.get(brandKey)!.push(event);
      }

      if (event.region) {
        const regionKey = `${event.systemType}::__all__::${event.region}`;
        if (!groups.has(regionKey)) groups.set(regionKey, []);
        groups.get(regionKey)!.push(event);
      }

      if (event.make && event.region) {
        const specificKey = `${event.systemType}::${event.make}::${event.region}`;
        if (!groups.has(specificKey)) groups.set(specificKey, []);
        groups.get(specificKey)!.push(event);
      }
    }

    for (const [key, groupEvents] of groups) {
      if (groupEvents.length < INTELLIGENCE_GUARDRAILS.MIN_RELIABILITY_SAMPLE) continue;

      const [systemType, makeRaw, regionRaw] = key.split("::");
      const make = makeRaw === "__all__" ? undefined : makeRaw;
      const region = regionRaw === "__all__" ? undefined : regionRaw;

      const ages = groupEvents.map((e) => e.ageAtEvent).sort((a, b) => a - b);
      const medianLifespan = ages[Math.floor(ages.length / 2)];
      const p10 = ages[Math.floor(ages.length * 0.1)];
      const p90 = ages[Math.floor(ages.length * 0.9)];

      let { shape, scale } = fitWeibull(ages);

      // Blend with bootstrap if available
      const bootstrap = BOOTSTRAP_RELIABILITY.find(
        (b) => b.systemType === systemType &&
          (b.make ?? undefined) === make &&
          (b.region ?? undefined) === region
      );
      if (bootstrap) {
        const blended = blendWeibullParams(
          bootstrap.weibullShape, bootstrap.weibullScale,
          shape, scale,
          groupEvents.length
        );
        shape = blended.shape;
        scale = blended.scale;
      }

      const defaultScale = bootstrap?.defaultWeibullScale ?? scale;
      const adjustmentFactor = Math.round((scale / defaultScale) * 100) / 100;

      // Compute failure modes
      const modeMap = new Map<string, { count: number; ages: number[] }>();
      for (const e of groupEvents) {
        if (e.failureMode) {
          if (!modeMap.has(e.failureMode)) modeMap.set(e.failureMode, { count: 0, ages: [] });
          const m = modeMap.get(e.failureMode)!;
          m.count++;
          m.ages.push(e.ageAtEvent);
        }
      }
      const commonFailureModes = Array.from(modeMap.entries())
        .map(([mode, data]) => ({
          mode,
          frequency: Math.round((data.count / groupEvents.length) * 100) / 100,
          averageAgeAtFailure: Math.round(data.ages.reduce((a, b) => a + b, 0) / data.ages.length),
        }))
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 5);

      // Compute pre-failure symptoms
      const symptomMap = new Map<string, number>();
      for (const e of groupEvents) {
        if (e.symptoms) {
          for (const s of e.symptoms) {
            symptomMap.set(s, (symptomMap.get(s) || 0) + 1);
          }
        }
      }
      const preFailureSymptoms = Array.from(symptomMap.entries())
        .map(([symptom, count]) => ({
          symptom,
          frequencyPercent: Math.round((count / groupEvents.length) * 100),
          averageLeadTime: 3, // Default; would need separate symptom-timing data
        }))
        .sort((a, b) => b.frequencyPercent - a.frequencyPercent)
        .slice(0, 5);

      // Upsert
      const existing = await ctx.db
        .query("systemReliabilityProfiles")
        .withIndex("by_systemType", (q) => q.eq("systemType", systemType))
        .filter((q) => q.and(
          make ? q.eq(q.field("make"), make) : q.eq(q.field("make"), undefined),
          region ? q.eq(q.field("region"), region) : q.eq(q.field("region"), undefined)
        ))
        .first();

      const data = {
        systemType,
        make,
        region,
        sampleSize: groupEvents.length,
        isBootstrapped: false,
        weibullShape: shape,
        weibullScale: scale,
        medianLifespan,
        p10Lifespan: p10,
        p90Lifespan: p90,
        defaultWeibullScale: defaultScale,
        adjustmentFactor,
        commonFailureModes: commonFailureModes.length > 0
          ? commonFailureModes
          : (bootstrap?.commonFailureModes ?? []),
        preFailureSymptoms: preFailureSymptoms.length > 0
          ? preFailureSymptoms
          : (bootstrap?.preFailureSymptoms ?? []),
        lastUpdated: Date.now(),
      };

      if (existing) {
        await ctx.db.patch(existing._id, data);
      } else {
        await ctx.db.insert("systemReliabilityProfiles", data);
      }
    }
  },
});

export const aggregateRegionalCosts = internalMutation({
  handler: async (ctx) => {
    const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);

    const reports = await ctx.db
      .query("costReports")
      .filter((q) => q.gte(q.field("reportedAt"), oneYearAgo))
      .collect();

    if (reports.length === 0) return;

    const groups = new Map<string, number[]>();
    for (const report of reports) {
      const key = `${report.region}::${report.serviceCategory}::${report.costType}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(report.actualCost);
    }

    for (const [key, costs] of groups) {
      if (costs.length < INTELLIGENCE_GUARDRAILS.MIN_COST_SAMPLE) continue;

      const [region, serviceCategory, costType] = key.split("::");
      const sorted = [...costs].sort((a, b) => a - b);

      await ctx.runMutation(internal.aggregation.upsertCostBenchmark, {
        region,
        serviceCategory,
        costType,
        sampleSize: costs.length,
        averageCost: Math.round(costs.reduce((a, b) => a + b, 0) / costs.length),
        medianCost: Math.round(sorted[Math.floor(sorted.length / 2)]),
        p25Cost: Math.round(sorted[Math.floor(sorted.length * 0.25)]),
        p75Cost: Math.round(sorted[Math.floor(sorted.length * 0.75)]),
        minCost: Math.round(sorted[0]),
        maxCost: Math.round(sorted[sorted.length - 1]),
        costTrend: "stable",
      });
    }
  },
});

export const aggregateTroubleshooting = internalMutation({
  handler: async (ctx) => {
    const sixMonthsAgo = Date.now() - (180 * 24 * 60 * 60 * 1000);

    const interactions = await ctx.db
      .query("advisorInteractions")
      .filter((q) => q.and(
        q.gte(q.field("createdAt"), sixMonthsAgo),
        q.eq(q.field("questionCategory"), "troubleshooting"),
        q.neq(q.field("feedbackRating"), undefined)
      ))
      .collect();

    if (interactions.length === 0) return;

    const groups = new Map<string, typeof interactions>();
    for (const interaction of interactions) {
      const systemType = interaction.systemSnapshot?.systemType || "unknown";
      const symptomKey = extractSymptomFromText(interaction.questionText);
      if (!symptomKey) continue;

      const key = `${systemType}::${symptomKey}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(interaction);
    }

    for (const [key, groupInteractions] of groups) {
      if (groupInteractions.length < INTELLIGENCE_GUARDRAILS.MIN_TROUBLESHOOTING_SAMPLE) continue;

      const [systemType, symptom] = key.split("::");

      const solutionStats = new Map<string, { total: number; resolved: number; costs: number[]; diy: number }>();
      for (const i of groupInteractions) {
        const solution = i.recommendedAction || i.recommendationType;
        if (!solutionStats.has(solution)) solutionStats.set(solution, { total: 0, resolved: 0, costs: [], diy: 0 });
        const s = solutionStats.get(solution)!;
        s.total++;
        if (i.feedbackRating === "helpful") s.resolved++;
        if (i.actualCost) s.costs.push(i.actualCost);
        if (i.followUpAction === "completed_diy") s.diy++;
      }

      const solutions = Array.from(solutionStats.entries())
        .map(([solution, stats]) => ({
          solution,
          resolutionRate: Math.round((stats.resolved / stats.total) * 100) / 100,
          averageCost: stats.costs.length > 0
            ? Math.round(stats.costs.reduce((a, b) => a + b, 0) / stats.costs.length)
            : undefined,
          diySuccess: Math.round((stats.diy / stats.total) * 100) / 100,
          requiresPro: (groupInteractions.filter((i) =>
            (i.recommendedAction || i.recommendationType) === solution && i.followUpAction === "scheduled_service"
          ).length / stats.total) > 0.7,
        }))
        .sort((a, b) => b.resolutionRate - a.resolutionRate);

      const diagnosisStats = new Map<string, { count: number; costs: number[] }>();
      for (const i of groupInteractions) {
        if (i.actualDiagnosis) {
          if (!diagnosisStats.has(i.actualDiagnosis)) diagnosisStats.set(i.actualDiagnosis, { count: 0, costs: [] });
          const d = diagnosisStats.get(i.actualDiagnosis)!;
          d.count++;
          if (i.actualCost) d.costs.push(i.actualCost);
        }
      }

      const proDiagnoses = Array.from(diagnosisStats.entries())
        .map(([diagnosis, stats]) => ({
          diagnosis,
          frequency: Math.round((stats.count / groupInteractions.length) * 100) / 100,
          averageCost: stats.costs.length > 0
            ? Math.round(stats.costs.reduce((a, b) => a + b, 0) / stats.costs.length)
            : 0,
        }))
        .sort((a, b) => b.frequency - a.frequency);

      const existing = await ctx.db
        .query("troubleshootingIntelligence")
        .withIndex("by_systemType_symptom", (q) =>
          q.eq("systemType", systemType).eq("symptom", symptom)
        )
        .first();

      const data = {
        systemType,
        symptom,
        sampleSize: groupInteractions.length,
        solutions,
        proDiagnoses,
        lastUpdated: Date.now(),
      };

      if (existing) {
        await ctx.db.patch(existing._id, data);
      } else {
        await ctx.db.insert("troubleshootingIntelligence", data);
      }
    }
  },
});

export const aggregateSeasonalPatterns = internalMutation({
  handler: async (ctx) => {
    const allEvents = await ctx.db.query("systemEvents").collect();
    if (allEvents.length < INTELLIGENCE_GUARDRAILS.MIN_SEASONAL_SAMPLE) return;

    const patterns = new Map<string, Map<number, { issues: string[]; count: number }>>();

    for (const event of allEvents) {
      if (!event.region) continue;
      const key = `${event.region}::${event.systemType}`;
      const month = new Date(event.eventDate).getMonth() + 1;

      if (!patterns.has(key)) patterns.set(key, new Map());
      const monthMap = patterns.get(key)!;
      if (!monthMap.has(month)) monthMap.set(month, { issues: [], count: 0 });
      const monthData = monthMap.get(month)!;
      monthData.count++;
      if (event.failureMode) monthData.issues.push(event.failureMode);
    }

    for (const [key, monthMap] of patterns) {
      const [region, systemType] = key.split("::");
      const totalEvents = Array.from(monthMap.values()).reduce((sum, m) => sum + m.count, 0);
      if (totalEvents < INTELLIGENCE_GUARDRAILS.MIN_SEASONAL_SAMPLE) continue;

      const averagePerMonth = totalEvents / 12;
      const monthlyData = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const data = monthMap.get(month) || { issues: [], count: 0 };
        const frequency = averagePerMonth > 0
          ? Math.round((data.count / averagePerMonth) * 100) / 100
          : 1.0;

        const issueCounts = new Map<string, number>();
        data.issues.forEach((issue) => issueCounts.set(issue, (issueCounts.get(issue) || 0) + 1));
        const topIssues = Array.from(issueCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([issue]) => issue);

        return { month, issueFrequency: frequency, topIssues, proactiveTasks: [] as string[] };
      });

      const existing = await ctx.db
        .query("seasonalPatterns")
        .withIndex("by_region_system", (q) =>
          q.eq("region", region).eq("systemType", systemType)
        )
        .first();

      const data = {
        region,
        systemType,
        monthlyData,
        sampleSize: totalEvents,
        lastUpdated: Date.now(),
      };

      if (existing) {
        await ctx.db.patch(existing._id, data);
      } else {
        await ctx.db.insert("seasonalPatterns", data);
      }
    }
  },
});

// ============================================================
// UPSERT HELPERS
// ============================================================

export const upsertReliabilityProfile = internalMutation({
  args: {
    systemType: v.string(),
    make: v.optional(v.string()),
    region: v.optional(v.string()),
    climateZone: v.optional(v.string()),
    sampleSize: v.number(),
    isBootstrapped: v.boolean(),
    weibullShape: v.number(),
    weibullScale: v.number(),
    medianLifespan: v.number(),
    p10Lifespan: v.number(),
    p90Lifespan: v.number(),
    defaultWeibullScale: v.number(),
    adjustmentFactor: v.number(),
    commonFailureModes: v.array(v.object({
      mode: v.string(),
      frequency: v.number(),
      averageAgeAtFailure: v.number(),
    })),
    preFailureSymptoms: v.array(v.object({
      symptom: v.string(),
      frequencyPercent: v.number(),
      averageLeadTime: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("systemReliabilityProfiles")
      .withIndex("by_systemType", (q) => q.eq("systemType", args.systemType))
      .filter((q) => q.and(
        args.make ? q.eq(q.field("make"), args.make) : q.eq(q.field("make"), undefined),
        args.region ? q.eq(q.field("region"), args.region) : q.eq(q.field("region"), undefined)
      ))
      .first();

    const data = { ...args, lastUpdated: Date.now() };
    if (existing) {
      await ctx.db.patch(existing._id, data);
    } else {
      await ctx.db.insert("systemReliabilityProfiles", data);
    }
  },
});

export const upsertCostBenchmark = internalMutation({
  args: {
    region: v.string(),
    serviceCategory: v.string(),
    costType: v.string(),
    sampleSize: v.number(),
    averageCost: v.number(),
    medianCost: v.number(),
    p25Cost: v.number(),
    p75Cost: v.number(),
    minCost: v.number(),
    maxCost: v.number(),
    costTrend: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("regionalCostBenchmarks")
      .withIndex("by_region_category", (q) =>
        q.eq("region", args.region).eq("serviceCategory", args.serviceCategory)
      )
      .filter((q) => q.eq(q.field("costType"), args.costType))
      .first();

    const data = { ...args, lastUpdated: Date.now() };
    if (existing) {
      await ctx.db.patch(existing._id, data);
    } else {
      await ctx.db.insert("regionalCostBenchmarks", data);
    }
  },
});

// ============================================================
// HELPER
// ============================================================

function extractSymptomFromText(text: string): string | null {
  const lower = text.toLowerCase();
  const patterns: Record<string, string[]> = {
    "not_cooling": ["not cooling", "no cold air", "won't cool", "warm air"],
    "not_heating": ["not heating", "no heat", "won't heat"],
    "leaking": ["leaking", "leak", "water on floor", "dripping"],
    "strange_noise": ["noise", "loud", "banging", "clicking", "humming", "buzzing", "rattling"],
    "not_starting": ["won't start", "not turning on", "dead", "no power"],
    "high_bills": ["high bills", "energy bill", "electricity cost"],
    "bad_smell": ["smell", "odor", "rotten egg", "burning smell"],
    "low_pressure": ["low pressure", "weak flow", "no pressure"],
    "short_cycling": ["short cycling", "turning on and off", "keeps stopping"],
    "ice_buildup": ["ice", "frozen", "frost", "freezing up"],
  };

  for (const [key, pats] of Object.entries(patterns)) {
    if (pats.some((p) => lower.includes(p))) return key;
  }
  return null;
}
