
/**
 * Continuous Learning Intelligence System
 *
 * Outcome tracking mutations, intelligence queries, and context builder.
 * All learning happens through anonymized, aggregated statistics.
 */

import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

// ============================================================
// OUTCOME TRACKING — Advisor Feedback
// ============================================================

export const submitAdvisorFeedback = mutation({
  args: {
    interactionId: v.id("advisorInteractions"),
    rating: v.string(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(args.interactionId, {
      feedbackRating: args.rating,
      feedbackNote: args.note,
      feedbackAt: Date.now(),
    });
  },
});

export const submitAdvisorFollowUp = mutation({
  args: {
    interactionId: v.id("advisorInteractions"),
    followUpAction: v.string(),
    actualDiagnosis: v.optional(v.string()),
    actualCost: v.optional(v.number()),
    advisorWasAccurate: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(args.interactionId, {
      followUpAction: args.followUpAction,
      followUpAt: Date.now(),
      actualDiagnosis: args.actualDiagnosis,
      actualCost: args.actualCost,
      advisorWasAccurate: args.advisorWasAccurate,
    });
  },
});

// ============================================================
// OUTCOME TRACKING — Task Outcomes
// ============================================================

export const recordTaskOutcome = mutation({
  args: {
    taskId: v.id("scheduledMaintenance"),
    completionMethod: v.optional(v.string()),
    difficultyRating: v.optional(v.string()),
    timeSpentMinutes: v.optional(v.number()),
    outcomeRating: v.optional(v.string()),
    outcomeNote: v.optional(v.string()),
    diyCost: v.optional(v.number()),
    proCost: v.optional(v.number()),
    productUsed: v.optional(v.string()),
    productEffective: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!profile) throw new Error("Profile not found");

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    const home = await ctx.db.get(task.homeId);
    let region: string | undefined;
    if (home) {
      region = home.city && home.state ? `${home.city}, ${home.state}` : undefined;
    }

    let systemType: string | undefined;
    let systemMake: string | undefined;
    let systemAge: number | undefined;

    if (task.systemId) {
      const system = await ctx.db.get(task.systemId);
      if (system) {
        systemMake = system.manufacturer ?? undefined;
        systemAge = system.installDate
          ? Math.floor((Date.now() - new Date(system.installDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
          : undefined;
        if (system.systemTypeId) {
          const st = await ctx.db.get(system.systemTypeId);
          systemType = st?.name ?? undefined;
        }
      }
    }

    await ctx.db.insert("taskOutcomes", {
      userId: profile._id,
      taskId: args.taskId,
      systemId: task.systemId ?? undefined,
      taskType: task.name,
      taskSource: task.templateId ? "kept_default" : "user_created",
      completedAt: Date.now(),
      completionMethod: args.completionMethod,
      difficultyRating: args.difficultyRating,
      timeSpentMinutes: args.timeSpentMinutes,
      outcomeRating: args.outcomeRating,
      outcomeNote: args.outcomeNote,
      diyCost: args.diyCost,
      proCost: args.proCost,
      productUsed: args.productUsed,
      productEffective: args.productEffective,
      region,
      systemType,
      systemMake,
      systemAge,
      createdAt: Date.now(),
    });
  },
});

// ============================================================
// OUTCOME TRACKING — System Events (failures/replacements)
// ============================================================

export const reportSystemEvent = mutation({
  args: {
    systemId: v.id("systems"),
    eventType: v.string(),
    failureMode: v.optional(v.string()),
    symptoms: v.optional(v.array(v.string())),
    wasGradual: v.optional(v.boolean()),
    repairCost: v.optional(v.number()),
    replacementCost: v.optional(v.number()),
    wasWarrantyCovered: v.optional(v.boolean()),
    providerDiagnosis: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!profile) throw new Error("Profile not found");

    const system = await ctx.db.get(args.systemId);
    if (!system) throw new Error("System not found");

    const home = await ctx.db.get(system.homeId);
    let region: string | undefined;
    let climateZone: string | undefined;
    if (home) {
      region = home.city && home.state ? `${home.city}, ${home.state}` : undefined;
      climateZone = home.climateZone != null ? String(home.climateZone) : undefined;
    }

    const installYear = system.installDate
      ? new Date(system.installDate).getFullYear()
      : undefined;
    const currentYear = new Date().getFullYear();
    const ageAtEvent = installYear ? currentYear - installYear : 0;

    let systemTypeName = "unknown";
    if (system.systemTypeId) {
      const st = await ctx.db.get(system.systemTypeId);
      if (st) systemTypeName = st.name;
    }

    const keptPredictedFailureYear = system.estimatedReplacementYear ?? undefined;
    const predictionError = keptPredictedFailureYear
      ? currentYear - keptPredictedFailureYear
      : undefined;

    await ctx.db.insert("systemEvents", {
      userId: profile._id,
      systemId: args.systemId,
      eventType: args.eventType,
      eventDate: Date.now(),
      systemType: systemTypeName,
      make: system.manufacturer ?? undefined,
      model: system.modelNumber ?? undefined,
      ageAtEvent,
      healthScoreAtEvent: system.healthScore != null ? Number(system.healthScore) : undefined,
      failureMode: args.failureMode,
      symptoms: args.symptoms,
      wasGradual: args.wasGradual,
      repairCost: args.repairCost,
      replacementCost: args.replacementCost,
      wasWarrantyCovered: args.wasWarrantyCovered,
      providerDiagnosis: args.providerDiagnosis,
      keptPredictedFailureYear,
      actualFailureYear: currentYear,
      predictionError,
      region,
      climateZone,
      createdAt: Date.now(),
    });
  },
});

// ============================================================
// OUTCOME TRACKING — Cost Reports
// ============================================================

export const reportCost = mutation({
  args: {
    systemId: v.optional(v.id("systems")),
    costType: v.string(),
    serviceCategory: v.string(),
    description: v.string(),
    actualCost: v.number(),
    keptEstimateLow: v.optional(v.number()),
    keptEstimateHigh: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!profile) throw new Error("Profile not found");

    let region = "Unknown";
    let zipCode: string | undefined;
    let systemType: string | undefined;
    let systemMake: string | undefined;

    if (args.systemId) {
      const system = await ctx.db.get(args.systemId);
      if (system) {
        systemMake = system.manufacturer ?? undefined;
        if (system.systemTypeId) {
          const st = await ctx.db.get(system.systemTypeId);
          systemType = st?.name ?? undefined;
        }
        const home = await ctx.db.get(system.homeId);
        if (home) {
          region = home.city && home.state ? `${home.city}, ${home.state}` : "Unknown";
          zipCode = home.zipCode ?? undefined;
        }
      }
    }

    await ctx.db.insert("costReports", {
      userId: profile._id,
      systemId: args.systemId,
      costType: args.costType,
      serviceCategory: args.serviceCategory,
      description: args.description,
      actualCost: args.actualCost,
      systemType,
      systemMake,
      region,
      zipCode,
      keptEstimateLow: args.keptEstimateLow,
      keptEstimateHigh: args.keptEstimateHigh,
      reportedAt: Date.now(),
    });
  },
});

// ============================================================
// INTERNAL: Log advisor interaction (called from chat action)
// ============================================================

export const logAdvisorInteraction = internalMutation({
  args: {
    userId: v.id("userProfiles"),
    sessionId: v.string(),
    systemId: v.optional(v.id("systems")),
    questionCategory: v.string(),
    questionText: v.string(),
    responseText: v.string(),
    recommendationType: v.string(),
    recommendedAction: v.optional(v.string()),
    systemSnapshot: v.optional(v.object({
      systemType: v.string(),
      make: v.optional(v.string()),
      model: v.optional(v.string()),
      age: v.optional(v.number()),
      healthScore: v.optional(v.number()),
      condition: v.optional(v.string()),
    })),
    region: v.optional(v.string()),
    climateZone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("advisorInteractions", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// ============================================================
// INTELLIGENCE CONTEXT — Build context for advisor calls
// ============================================================

export const getIntelligenceContext = internalQuery({
  args: {
    systemType: v.optional(v.string()),
    systemMake: v.optional(v.string()),
    region: v.optional(v.string()),
    questionCategory: v.optional(v.string()),
    questionText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let contextParts: string[] = [];
    let hasIntelligence = false;

    // 1. System Reliability Data
    if (args.systemType) {
      const profile = await findBestReliabilityProfile(
        ctx, args.systemType, args.systemMake, args.region
      );

      if (profile && profile.sampleSize >= 10) {
        hasIntelligence = true;
        let reliabilityCtx = `### SYSTEM RELIABILITY (based on ${profile.sampleSize} similar systems${profile.region ? ` in ${profile.region}` : ""})
- Typical lifespan: ${profile.p10Lifespan}–${profile.p90Lifespan} years (median: ${profile.medianLifespan} years)`;

        if (profile.adjustmentFactor < 0.9) {
          reliabilityCtx += `\n- ⚠️ This system type tends to fail ${Math.round((1 - profile.adjustmentFactor) * 100)}% earlier than national average in this region`;
        } else if (profile.adjustmentFactor > 1.1) {
          reliabilityCtx += `\n- ✅ This system type tends to last ${Math.round((profile.adjustmentFactor - 1) * 100)}% longer than national average in this region`;
        }

        if (profile.preFailureSymptoms.length > 0) {
          reliabilityCtx += `\n- Common warning signs before failure:`;
          profile.preFailureSymptoms.slice(0, 3).forEach((s: any) => {
            reliabilityCtx += `\n  • ${s.symptom} (seen in ${Math.round(s.frequencyPercent)}% of failures, typically ${s.averageLeadTime} months before)`;
          });
        }

        if (profile.commonFailureModes.length > 0) {
          reliabilityCtx += `\n- Most common failure types:`;
          profile.commonFailureModes.slice(0, 3).forEach((f: any) => {
            reliabilityCtx += `\n  • ${f.mode} (${Math.round(f.frequency * 100)}% of failures, avg age: ${f.averageAgeAtFailure} years)`;
          });
        }

        contextParts.push(reliabilityCtx);
      }
    }

    // 2. Troubleshooting Intelligence
    if (args.questionCategory === "troubleshooting" && args.systemType && args.questionText) {
      const symptomKey = extractSymptomKeywords(args.questionText);
      if (symptomKey) {
        const troubleshooting = await ctx.db
          .query("troubleshootingIntelligence")
          .withIndex("by_systemType_symptom", (q) =>
            q.eq("systemType", args.systemType!).eq("symptom", symptomKey)
          )
          .first();

        if (troubleshooting && troubleshooting.sampleSize >= 5) {
          hasIntelligence = true;
          let tsCtx = `### TROUBLESHOOTING INTELLIGENCE (based on ${troubleshooting.sampleSize} similar cases)\nMost effective solutions (ranked by resolution rate):`;

          troubleshooting.solutions.slice(0, 4).forEach((s, i) => {
            tsCtx += `\n${i + 1}. ${s.solution} — ${Math.round(s.resolutionRate * 100)}% resolution rate`;
            if (s.averageCost) tsCtx += ` (avg cost: $${Math.round(s.averageCost)})`;
            if (s.requiresPro) tsCtx += ` [usually requires professional]`;
            else tsCtx += ` (${Math.round(s.diySuccess * 100)}% DIY success)`;
          });

          if (troubleshooting.proDiagnoses.length > 0) {
            tsCtx += `\n\nWhen professionals diagnose this issue, they most commonly find:`;
            troubleshooting.proDiagnoses.slice(0, 3).forEach((d) => {
              tsCtx += `\n- ${d.diagnosis} (${Math.round(d.frequency * 100)}% of cases, avg repair: $${Math.round(d.averageCost)})`;
            });
          }

          contextParts.push(tsCtx);
        }
      }
    }

    // 3. Regional Cost Benchmarks
    if (args.region && (args.questionCategory === "cost" || args.questionCategory === "troubleshooting")) {
      const serviceCategory = systemTypeToServiceCategory(args.systemType);
      if (serviceCategory) {
        const costs = await ctx.db
          .query("regionalCostBenchmarks")
          .withIndex("by_region_category", (q) =>
            q.eq("region", args.region!).eq("serviceCategory", serviceCategory)
          )
          .collect();

        if (costs.length > 0) {
          hasIntelligence = true;
          let costCtx = `### LOCAL COST BENCHMARKS (${args.region})`;
          costs.forEach((c) => {
            costCtx += `\n- ${c.costType}: $${c.p25Cost}–$${c.p75Cost} typical range (median: $${c.medianCost}, based on ${c.sampleSize} reports)`;
          });
          contextParts.push(costCtx);
        }
      }
    }

    // 4. Seasonal Patterns
    if (args.region && args.systemType) {
      const currentMonth = new Date().getMonth() + 1;
      const patterns = await ctx.db
        .query("seasonalPatterns")
        .withIndex("by_region_system", (q) =>
          q.eq("region", args.region!).eq("systemType", args.systemType!)
        )
        .first();

      if (patterns) {
        const thisMonth = patterns.monthlyData.find((m) => m.month === currentMonth);
        const nextMonth = patterns.monthlyData.find((m) => m.month === (currentMonth % 12) + 1);

        if (thisMonth && thisMonth.issueFrequency > 1.3) {
          hasIntelligence = true;
          const monthNames = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
          let seasonCtx = `### SEASONAL ALERT\nThis system type sees ${Math.round(thisMonth.issueFrequency * 100 - 100)}% more issues than average in ${monthNames[currentMonth]} in ${args.region}.`;
          if (thisMonth.topIssues.length > 0) {
            seasonCtx += `\nCommon issues this month: ${thisMonth.topIssues.join(", ")}`;
          }
          if (nextMonth && nextMonth.proactiveTasks.length > 0) {
            seasonCtx += `\nProactive steps to take now: ${nextMonth.proactiveTasks.join("; ")}`;
          }
          contextParts.push(seasonCtx);
        }
      }
    }

    if (!hasIntelligence) {
      return null;
    }

    return `\n## KEPT INTELLIGENCE (from aggregated, anonymized user data)\n${contextParts.join("\n\n")}`;
  },
});

// ============================================================
// HELPERS
// ============================================================

async function findBestReliabilityProfile(
  ctx: any,
  systemType: string,
  make?: string | null,
  region?: string | null,
) {
  if (make && region) {
    const specific = await ctx.db
      .query("systemReliabilityProfiles")
      .withIndex("by_systemType", (q: any) => q.eq("systemType", systemType))
      .filter((q: any) => q.and(
        q.eq(q.field("make"), make),
        q.eq(q.field("region"), region)
      ))
      .first();
    if (specific && specific.sampleSize >= 10) return specific;
  }

  if (make) {
    const brandOnly = await ctx.db
      .query("systemReliabilityProfiles")
      .withIndex("by_make", (q: any) => q.eq("make", make))
      .filter((q: any) => q.eq(q.field("systemType"), systemType))
      .first();
    if (brandOnly && brandOnly.sampleSize >= 10) return brandOnly;
  }

  if (region) {
    const regionOnly = await ctx.db
      .query("systemReliabilityProfiles")
      .withIndex("by_region", (q: any) => q.eq("region", region))
      .filter((q: any) => q.eq(q.field("systemType"), systemType))
      .first();
    if (regionOnly && regionOnly.sampleSize >= 10) return regionOnly;
  }

  return await ctx.db
    .query("systemReliabilityProfiles")
    .withIndex("by_systemType", (q: any) => q.eq("systemType", systemType))
    .filter((q: any) => q.and(
      q.eq(q.field("make"), undefined),
      q.eq(q.field("region"), undefined)
    ))
    .first();
}

function extractSymptomKeywords(text: string): string | null {
  const lower = text.toLowerCase();
  const symptomPatterns: Record<string, string[]> = {
    "not_cooling": ["not cooling", "no cold air", "won't cool", "warm air", "not blowing cold"],
    "not_heating": ["not heating", "no heat", "won't heat", "cold air blowing"],
    "leaking": ["leaking", "leak", "water on floor", "dripping", "pooling water"],
    "strange_noise": ["noise", "loud", "banging", "clicking", "humming", "buzzing", "rattling", "grinding"],
    "not_starting": ["won't start", "not turning on", "dead", "no power", "not running"],
    "high_bills": ["high bills", "energy bill", "electricity cost", "using too much"],
    "bad_smell": ["smell", "odor", "rotten egg", "burning smell", "musty"],
    "low_pressure": ["low pressure", "weak flow", "no pressure", "slow drain"],
    "short_cycling": ["short cycling", "turning on and off", "keeps stopping", "cycles quickly"],
    "ice_buildup": ["ice", "frozen", "frost", "freezing up"],
  };

  for (const [key, patterns] of Object.entries(symptomPatterns)) {
    if (patterns.some((p) => lower.includes(p))) {
      return key;
    }
  }
  return null;
}

function systemTypeToServiceCategory(systemType?: string | null): string | null {
  if (!systemType) return null;
  const lower = systemType.toLowerCase();
  if (lower.includes("ac") || lower.includes("hvac") || lower.includes("furnace") || lower.includes("heat")) return "hvac";
  if (lower.includes("water") || lower.includes("plumb") || lower.includes("drain") || lower.includes("sewer")) return "plumbing";
  if (lower.includes("electric") || lower.includes("panel") || lower.includes("wiring")) return "electrical";
  if (lower.includes("roof") || lower.includes("gutter") || lower.includes("siding")) return "exterior";
  if (lower.includes("dishwasher") || lower.includes("washer") || lower.includes("dryer") || lower.includes("refrigerator")) return "appliances";
  return null;
}

// Classify question intent for routing
export function classifyQuestion(text: string): string {
  const lower = text.toLowerCase();
  if (lower.match(/cost|price|how much|estimate|budget|afford|expensive|cheap/)) return "cost";
  if (lower.match(/broken|not working|failed|leak|noise|smell|issue|problem|wrong|help/)) return "troubleshooting";
  if (lower.match(/maintain|maintenance|service|filter|clean|inspect|check|tune/)) return "maintenance";
  if (lower.match(/warrant|coverage|claim|expire/)) return "warranty";
  return "general";
}

// Classify what the advisor recommended
export function classifyRecommendation(text: string): string {
  const lower = text.toLowerCase();
  if (lower.match(/replace|new unit|time for a new|upgrade/)) return "replace";
  if (lower.match(/call a pro|hire|technician|licensed|professional/)) return "schedule_service";
  if (lower.match(/diy|yourself|you can|try this|here's how/)) return "diy_fix";
  if (lower.match(/keep an eye|monitor|watch for|check back/)) return "monitor";
  if (lower.match(/schedule|maintenance|service|tune-up/)) return "maintenance_task";
  return "informational";
}
