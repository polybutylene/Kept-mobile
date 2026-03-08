import { v } from "convex/values";
import { query, mutation, QueryCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";
import {
  weibullSurvival,
  conditionalFailureProbability,
  expectedRemainingLife,
  calculateAge,
} from "./lib/weibull";
import { calculateConfidence, getConfidenceDescription, getConfidenceColor } from "./lib/confidence";
import { compareForecastSnapshots, ForecastChange } from "./lib/forecastDiff";
import { snapshotTriggerType } from "./schema";
import { BASE_COST_MULTIPLIER } from "./lib/constants";

/**
 * Look up climate-adjusted Weibull scale for a system.
 * If the home has a climateZoneId and a matching climateModifier exists,
 * multiply the base scale by the weibullScaleAdjustment.
 * Otherwise return the base scale unchanged.
 */
async function getClimateAdjustedScale(
  ctx: { db: QueryCtx["db"] },
  baseScale: number,
  systemTypeId: Id<"systemTypes">,
  climateZoneId: string | undefined
): Promise<number> {
  if (!climateZoneId) return baseScale;

  const modifier = await ctx.db
    .query("climateModifiers")
    .withIndex("by_zone_system", (q) =>
      q.eq("climateZoneId", climateZoneId).eq("systemTypeId", systemTypeId)
    )
    .first();

  if (modifier && modifier.weibullScaleAdjustment) {
    return baseScale * modifier.weibullScaleAdjustment;
  }

  return baseScale;
}

/**
 * Look up regional cost multiplier for a home's state and system category.
 * Falls back to BASE_COST_MULTIPLIER (1.20) when no per-state data exists,
 * applying a 20% markup over national averages as the baseline.
 */
async function getRegionalCostMultiplier(
  ctx: { db: QueryCtx["db"] },
  state: string | undefined,
  systemCategory: string
): Promise<number> {
  if (!state) return BASE_COST_MULTIPLIER;

  const modifier = await ctx.db
    .query("regionalCostMultipliers")
    .withIndex("by_state_category", (q) =>
      q.eq("state", state).eq("systemCategory", systemCategory as any)
    )
    .first();

  return modifier?.multiplier ?? BASE_COST_MULTIPLIER;
}

/**
 * Get forecast for a single system
 */
export const getSystemForecast = query({
  args: {
    systemId: v.id("systems"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const system = await ctx.db.get(args.systemId);
    if (!system || !system.homeId) return null;

    const home = await ctx.db.get(system.homeId);
    if (!home) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) return null;

    const systemType = await ctx.db.get(system.systemTypeId);
    if (!systemType) return null;

    const age = calculateAge(system.installDate, home.yearBuilt);
    const shape = systemType.weibullShape;
    const baseScale = systemType.weibullScale;

    // Apply climate zone adjustment to Weibull scale
    const scale = await getClimateAdjustedScale(
      ctx, baseScale, system.systemTypeId, home.climateZoneId ?? undefined
    );

    // Calculate probabilities
    const failureProb1yr = conditionalFailureProbability(age, 1, shape, scale);
    const failureProb3yr = conditionalFailureProbability(age, 3, shape, scale);
    const failureProb5yr = conditionalFailureProbability(age, 5, shape, scale);

    // Calculate expected remaining life
    const remainingLife = expectedRemainingLife(age, shape, scale);

    // Estimate replacement year
    const currentYear = new Date().getFullYear();
    const replacementYear = Math.round(currentYear + remainingLife);

    // Calculate confidence level based on data quality
    let confidence = "medium";
    if (system.manufacturer && system.modelNumber && system.installDate) {
      confidence = "high";
    } else if (!system.installDate) {
      confidence = "low";
    }

    const climateAdjusted = scale !== baseScale;

    const costMultiplier = await getRegionalCostMultiplier(
      ctx, home.state, systemType.category
    );

    return {
      systemId: system._id,
      systemName: system.name || systemType.name,
      category: systemType.category,
      ageYears: Math.round(age * 10) / 10,
      healthScore: system.healthScore,
      defaultLifespan: systemType.defaultLifespanYears,
      expectedRemainingLife: Math.round(remainingLife * 10) / 10,
      failureProb1yr: Math.round(failureProb1yr * 10) / 10,
      failureProb3yr: Math.round(failureProb3yr * 10) / 10,
      failureProb5yr: Math.round(failureProb5yr * 10) / 10,
      estimatedReplacementYear: replacementYear,
      estimatedReplacementCostLow: Math.round(systemType.defaultReplacementCostLow * costMultiplier),
      estimatedReplacementCostMid: Math.round(systemType.defaultReplacementCostMid * costMultiplier),
      estimatedReplacementCostHigh: Math.round(systemType.defaultReplacementCostHigh * costMultiplier),
      confidence,
      climateAdjusted,
      survivalProbability: Math.round(weibullSurvival(age, shape, scale) * 100),
    };
  },
});

/**
 * Get forecast for all systems in a home
 */
export const getHomeForecast = query({
  args: {
    homeId: v.id("homes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const home = await ctx.db.get(args.homeId);
    if (!home) return [];

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) return [];

    const systems = await ctx.db
      .query("systems")
      .withIndex("by_home_active", (q) =>
        q.eq("homeId", args.homeId).eq("isArchived", false)
      )
      .collect();

    const forecasts = await Promise.all(
      systems.map(async (system) => {
        const systemType = await ctx.db.get(system.systemTypeId);
        if (!systemType) return null;

        const age = calculateAge(system.installDate, home.yearBuilt);
        const shape = systemType.weibullShape;
        const baseScale = systemType.weibullScale;
        const scale = await getClimateAdjustedScale(
          ctx, baseScale, system.systemTypeId, home.climateZoneId ?? undefined
        );

        const failureProb1yr = conditionalFailureProbability(age, 1, shape, scale);
        const failureProb3yr = conditionalFailureProbability(age, 3, shape, scale);
        const failureProb5yr = conditionalFailureProbability(age, 5, shape, scale);
        const remainingLife = expectedRemainingLife(age, shape, scale);

        const currentYear = new Date().getFullYear();
        const replacementYear = Math.round(currentYear + remainingLife);

        return {
          systemId: system._id,
          systemName: system.name || systemType.name,
          category: systemType.category,
          ageYears: Math.round(age * 10) / 10,
          healthScore: system.healthScore,
          defaultLifespan: systemType.defaultLifespanYears,
          expectedRemainingLife: Math.round(remainingLife * 10) / 10,
          failureProb1yr: Math.round(failureProb1yr * 10) / 10,
          failureProb3yr: Math.round(failureProb3yr * 10) / 10,
          failureProb5yr: Math.round(failureProb5yr * 10) / 10,
          estimatedReplacementYear: replacementYear,
          estimatedReplacementCostLow: systemType.defaultReplacementCostLow,
          estimatedReplacementCostMid: systemType.defaultReplacementCostMid,
          estimatedReplacementCostHigh: systemType.defaultReplacementCostHigh,
          climateAdjusted: scale !== baseScale,
          survivalProbability: Math.round(weibullSurvival(age, shape, scale) * 100),
        };
      })
    );

    return forecasts.filter((f) => f !== null);
  },
});

// Default inflation rate for home maintenance costs
// Based on Bureau of Labor Statistics data, home maintenance costs typically increase 3-4% annually
const DEFAULT_ANNUAL_INFLATION_RATE = 0.035; // 3.5%

/**
 * Apply inflation to a base cost for future years
 */
function applyInflation(baseCost: number, yearsInFuture: number, inflationRate: number = DEFAULT_ANNUAL_INFLATION_RATE): number {
  return baseCost * Math.pow(1 + inflationRate, yearsInFuture);
}

/**
 * Calculate age-adjusted maintenance urgency multiplier
 * Older systems need more frequent and thorough maintenance
 */
function getAgeUrgencyMultiplier(systemAge: number, lifespan: number): number {
  const ageRatio = systemAge / lifespan;
  
  if (ageRatio < 0.3) return 1.0;       // New system, standard maintenance
  if (ageRatio < 0.5) return 1.1;       // Aging, slightly more attention
  if (ageRatio < 0.7) return 1.25;      // Mature, increased maintenance needs
  if (ageRatio < 0.85) return 1.5;      // Near end of life, significant increase
  return 1.75;                           // Past typical lifespan, maximum attention
}

/**
 * Get budget forecast for a home with inflation adjustments
 */
export const getBudgetForecast = query({
  args: {
    homeId: v.id("homes"),
    years: v.optional(v.number()),
    diyMix: v.optional(v.number()), // 0-1, percentage of tasks DIY
    inflationRate: v.optional(v.number()), // Annual inflation rate (default 3.5%)
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const home = await ctx.db.get(args.homeId);
    if (!home) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) return null;

    // Check feature flag
    const featureFlags = await ctx.db
      .query("featureFlags")
      .withIndex("by_tier", (q) => q.eq("tier", profile.tier))
      .first();

    if (!featureFlags?.canViewForecast) {
      return null;
    }

    const projectionYears = args.years || 5;
    const currentYear = new Date().getFullYear();
    const diyMix = args.diyMix ?? 0.5;
    const inflationRate = args.inflationRate ?? DEFAULT_ANNUAL_INFLATION_RATE;

    const allSystems = await ctx.db
      .query("systems")
      .withIndex("by_home_active", (q) =>
        q.eq("homeId", args.homeId).eq("isArchived", false)
      )
      .collect();

    // Exclude HOA/COA-managed systems from owner forecasts
    const hoaResponsibilities = await ctx.db
      .query("hoaResponsibilities")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .collect();
    const hoaManagedCategories = new Set(
      hoaResponsibilities.filter((r) => r.responsibleParty !== "owner").map((r) => r.systemCategory)
    );
    const systems = allSystems.filter((s) => {
      const systemType = allSystems.length > 0 ? true : true; // all pass if no HOA rules
      return true; // HOA filtering is by task-level hoaManaged flag
    });

    // Get all scheduled maintenance tasks
    const tasks = await ctx.db
      .query("scheduledMaintenance")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .collect();

    const activeTasks = tasks.filter(
      (t) => !["completed", "skipped"].includes(t.status) && !t.hoaManaged
    );

    // Get all maintenance templates for building a comprehensive maintenance schedule
    const allTemplates = await ctx.db.query("maintenanceTaskTemplates").collect();

    // Build a map of templates by system type ID
    const templatesBySystemType = new Map<string, typeof allTemplates>();
    for (const template of allTemplates) {
      const existing = templatesBySystemType.get(template.systemTypeId.toString()) || [];
      existing.push(template);
      templatesBySystemType.set(template.systemTypeId.toString(), existing);
    }

    // Initialize yearly projections
    const yearlyData: Array<{
      year: number;
      maintenanceCost: number;
      maintenanceCostNominal: number; // Before inflation
      repairCost: number;
      repairCostNominal: number;
      replacementCost: number;
      replacementCostNominal: number;
      plumbingReserve: number;
      totalCost: number;
      inflationAdjustment: number;
    }> = [];

    let totalPotentialDiySavings = 0;

    // Track per-system breakdowns for the first year (used by CostBreakdown UI)
    const systemRepairBreakdown: Array<{
      systemId: string;
      systemName: string;
      category: string;
      repairCost: number;
      failureProb1yr: number;
      ageYears: number;
      defaultLifespan: number;
      healthScore: number;
    }> = [];
    const systemMaintenanceBreakdown: Array<{
      systemId: string;
      systemName: string;
      category: string;
      maintenanceCost: number;
    }> = [];

    for (let i = 0; i < projectionYears; i++) {
      const year = currentYear + i;
      let maintenanceCostNominal = 0;
      let repairCostNominal = 0;
      let replacementCostNominal = 0;
      let yearDiySavingsNominal = 0;

      // Calculate routine maintenance costs from templates (system-age-aware)
      for (const system of systems) {
        const systemType = await ctx.db.get(system.systemTypeId);
        if (!systemType) continue;

        const currentAge = calculateAge(system.installDate, home.yearBuilt);
        const ageInYear = currentAge + i;
        const ageMultiplier = getAgeUrgencyMultiplier(ageInYear, systemType.defaultLifespanYears);

        // Get templates for this system type
        const templates = templatesBySystemType.get(system.systemTypeId.toString()) || [];
        let systemMaintenanceNominal = 0;
        let systemPotentialSavingsNominal = 0;

        const maintenanceCostMult = await getRegionalCostMultiplier(
          ctx, home.state, systemType.category
        );

        for (const template of templates) {
          const occurrencesPerYear = 12 / template.frequencyMonths;
          
          const diyAvg = ((template.diyCostLow || 0) + (template.diyCostHigh || 0)) / 2 * maintenanceCostMult;
          const proAvg = ((template.proCostLow || 0) + (template.proCostHigh || 0)) / 2 * maintenanceCostMult;
          
          const adjustedDiyAvg = diyAvg * ageMultiplier;
          const adjustedProAvg = proAvg * ageMultiplier;
          
          // Calculate annual cost with DIY mix
          const annualCost = (adjustedDiyAvg * diyMix + adjustedProAvg * (1 - diyMix)) * occurrencesPerYear;
          systemMaintenanceNominal += annualCost;
          
          const savings = Math.max(0, adjustedProAvg - adjustedDiyAvg) * occurrencesPerYear;
          systemPotentialSavingsNominal += savings;
        }

        // Apply maintenance impact factor + cap to prevent runaway costs
        const impactFactor = systemType.maintenanceImpactFactor ?? 1;
        const rawMaintenance = systemMaintenanceNominal * impactFactor;
        const maintenanceCap =
          systemType.defaultReplacementCostMid * 0.02 * ageMultiplier * impactFactor;

        const cappedMaintenance = Math.min(rawMaintenance, maintenanceCap);
        maintenanceCostNominal += cappedMaintenance;

        // Track first-year per-system maintenance
        if (i === 0) {
          systemMaintenanceBreakdown.push({
            systemId: system._id,
            systemName: system.name || systemType?.name || "System",
            category: systemType.category,
            maintenanceCost: Math.round(cappedMaintenance),
          });
        }

        if (rawMaintenance > 0) {
          const capRatio = cappedMaintenance / rawMaintenance;
          yearDiySavingsNominal +=
            systemPotentialSavingsNominal * impactFactor * capRatio;
        }
      }

      // Also include any manually scheduled tasks
      for (const task of activeTasks) {
        const taskYear = new Date(task.dueDate).getFullYear();
        const isThisYear = taskYear === year;
        
        let isRecurringInstance = false;
        if (task.isRecurring && task.recurrenceMonths) {
          let nextDate = new Date(task.dueDate);
          while (nextDate.getFullYear() <= year) {
            if (nextDate.getFullYear() === year) {
              isRecurringInstance = true;
              break;
            }
            nextDate.setMonth(nextDate.getMonth() + task.recurrenceMonths);
          }
        }

        if ((isThisYear || isRecurringInstance) && !task.templateId) {
          const taskMult = BASE_COST_MULTIPLIER;
          const diyAvg = ((task.diyCostLow || 0) + (task.diyCostHigh || 0)) / 2 * taskMult;
          const proAvg = ((task.proCostLow || 0) + (task.proCostHigh || 0)) / 2 * taskMult;
          maintenanceCostNominal += diyAvg * diyMix + proAvg * (1 - diyMix);
          yearDiySavingsNominal += Math.max(0, proAvg - diyAvg);
        }
      }

      // Calculate repair and replacement costs from systems
      let plumbingRepairCostNominal = 0;
      
      for (const system of systems) {
        const systemType = await ctx.db.get(system.systemTypeId);
        if (!systemType) continue;

        // Get regional cost multiplier for this system category
        const costMultiplier = await getRegionalCostMultiplier(
          ctx, home.state, systemType.category
        );

        const currentAge = calculateAge(system.installDate, home.yearBuilt);
        const ageInYear = currentAge + i;

        // Age-adjusted repair cost: base 2% of replacement cost, scaled by age ratio
        const ageRatio = ageInYear / systemType.defaultLifespanYears;
        // Use exponential growth for repair costs as system ages
        const repairMultiplier = Math.min(2.5, Math.exp(ageRatio * 0.8));
        let annualRepairCost = systemType.defaultReplacementCostMid * costMultiplier * 0.02 * repairMultiplier;
        
        // Plumbing has higher unpredictability
        if (systemType.category === "plumbing") {
          const plumbingBuffer = 1.2;
          const homeAge = home.yearBuilt ? new Date().getFullYear() - home.yearBuilt : 0;
          const homeAgeBuffer = homeAge > 50 ? 1.3 : homeAge > 30 ? 1.15 : 1.0;
          annualRepairCost = annualRepairCost * plumbingBuffer * homeAgeBuffer;
          plumbingRepairCostNominal += annualRepairCost;
        }
        
        repairCostNominal += annualRepairCost;

        // Track first-year per-system repair costs
        if (i === 0) {
          const shape = systemType.weibullShape;
          const baseScale = systemType.weibullScale;
          const scaleForProb = await getClimateAdjustedScale(
            ctx, baseScale, system.systemTypeId, home.climateZoneId ?? undefined
          );
          const failProb = conditionalFailureProbability(
            currentAge, 1, shape, scaleForProb
          );
          systemRepairBreakdown.push({
            systemId: system._id,
            systemName: system.name || systemType?.name || "System",
            category: systemType.category,
            repairCost: Math.round(annualRepairCost),
            failureProb1yr: Math.round(failProb),
            ageYears: Math.round(currentAge * 10) / 10,
            defaultLifespan: systemType.defaultLifespanYears,
            healthScore: system.healthScore ?? 0,
          });
        }

        // Check if replacement is likely this year (with climate adjustment)
        const shape = systemType.weibullShape;
        const baseScale = systemType.weibullScale;
        const scale = await getClimateAdjustedScale(
          ctx, baseScale, system.systemTypeId, home.climateZoneId ?? undefined
        );
        const failureProbThisYear = conditionalFailureProbability(
          ageInYear - 1,
          1,
          shape,
          scale
        );

        // Apply regional cost multiplier to replacement costs
        const adjustedReplacementCost = systemType.defaultReplacementCostMid * costMultiplier;

        if (failureProbThisYear > 60) {
          replacementCostNominal += adjustedReplacementCost;
        } else if (system.estimatedReplacementYear === year) {
          replacementCostNominal += adjustedReplacementCost;
        }
      }
      
      const plumbingReserveNominal = plumbingRepairCostNominal * 0.15;

      // Apply inflation to get real (future dollar) costs
      const maintenanceCost = applyInflation(maintenanceCostNominal, i, inflationRate);
      const repairCost = applyInflation(repairCostNominal, i, inflationRate);
      const replacementCost = applyInflation(replacementCostNominal, i, inflationRate);
      const plumbingReserve = applyInflation(plumbingReserveNominal, i, inflationRate);
      
      const totalNominal = maintenanceCostNominal + repairCostNominal + replacementCostNominal + plumbingReserveNominal;
      const totalCost = maintenanceCost + repairCost + replacementCost + plumbingReserve;
      const inflationAdjustment = totalCost - totalNominal;

      yearlyData.push({
        year,
        maintenanceCost: Math.round(maintenanceCost),
        maintenanceCostNominal: Math.round(maintenanceCostNominal),
        repairCost: Math.round(repairCost),
        repairCostNominal: Math.round(repairCostNominal),
        replacementCost: Math.round(replacementCost),
        replacementCostNominal: Math.round(replacementCostNominal),
        plumbingReserve: Math.round(plumbingReserve),
        totalCost: Math.round(totalCost),
        inflationAdjustment: Math.round(inflationAdjustment),
      });
      
      totalPotentialDiySavings += applyInflation(yearDiySavingsNominal, i, inflationRate);
    }

    // Calculate totals
    const totalMaintenance = yearlyData.reduce((sum, y) => sum + y.maintenanceCost, 0);
    const totalMaintenanceNominal = yearlyData.reduce((sum, y) => sum + y.maintenanceCostNominal, 0);
    const totalRepairs = yearlyData.reduce((sum, y) => sum + y.repairCost, 0);
    const totalReplacements = yearlyData.reduce((sum, y) => sum + y.replacementCost, 0);
    const totalPlumbingReserve = yearlyData.reduce((sum, y) => sum + y.plumbingReserve, 0);
    const totalInflationAdjustment = yearlyData.reduce((sum, y) => sum + y.inflationAdjustment, 0);
    const grandTotal = totalMaintenance + totalRepairs + totalReplacements + totalPlumbingReserve;

    // Add 15% cushion for unexpected costs
    const cushion = 1.15;

    const peakSpendingYear = yearlyData.reduce(
      (max, y) => (y.totalCost > max.totalCost ? y : max),
      yearlyData[0]
    );

    const bestSystem = systems.reduce<Doc<"systems"> | null>((best, s) => {
      if (!best) return s;
      return s.healthScore > best.healthScore ? s : best;
    }, null);
    
    let bestSystemName = "HVAC";
    if (bestSystem) {
      const type = await ctx.db.get(bestSystem.systemTypeId);
      bestSystemName = bestSystem.name ?? type?.name ?? "System";
    }

    return {
      yearlyBreakdown: yearlyData,
      totals: {
        maintenance: Math.round(totalMaintenance * cushion),
        maintenanceNominal: Math.round(totalMaintenanceNominal * cushion),
        repairs: Math.round(totalRepairs * cushion),
        replacements: Math.round(totalReplacements * cushion),
        plumbingReserve: Math.round(totalPlumbingReserve * cushion),
        grandTotal: Math.round(grandTotal * cushion),
        inflationAdjustment: Math.round(totalInflationAdjustment * cushion),
      },
      summary: {
        perYear: Math.round((grandTotal * cushion) / projectionYears),
        perMonth: Math.round((grandTotal * cushion) / projectionYears / 12),
        perPaycheck: Math.round((grandTotal * cushion) / projectionYears / 26),
      },
      insights: {
        totalDiySavings: Math.round(totalPotentialDiySavings * diyMix),
        annualDiySavings: Math.round((totalPotentialDiySavings / projectionYears) * diyMix),
        peakYear: peakSpendingYear.year,
        peakAmount: Math.round(peakSpendingYear.totalCost * cushion),
        bestPerformingSystem: bestSystemName,
        inflationRate: Math.round(inflationRate * 1000) / 10, // As percentage
        inflationImpact: Math.round(totalInflationAdjustment),
        plumbingNote: totalPlumbingReserve > 0 
          ? "Includes plumbing reserve for unexpected drain/pipe issues" 
          : undefined,
      },
      projectionYears,
      assumptions: {
        inflationRate: Math.round(inflationRate * 1000) / 10,
        diyMix: Math.round(diyMix * 100),
        cushionPercent: 15,
      },
      systemRepairBreakdown: systemRepairBreakdown
        .map((s) => ({
          ...s,
          repairCost: Math.round(s.repairCost * cushion),
        }))
        .sort((a, b) => b.repairCost - a.repairCost),
      systemMaintenanceBreakdown: systemMaintenanceBreakdown
        .map((s) => ({
          ...s,
          maintenanceCost: Math.round(s.maintenanceCost * cushion),
        }))
        .sort((a, b) => b.maintenanceCost - a.maintenanceCost),
    };
  },
});

/**
 * Get detailed routine maintenance forecast by system
 * Shows exactly what maintenance is needed and costs by system
 */
export const getRoutineMaintenanceForecast = query({
  args: {
    homeId: v.id("homes"),
    years: v.optional(v.number()),
    diyMix: v.optional(v.number()),
    inflationRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const home = await ctx.db.get(args.homeId);
    if (!home) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) return null;

    // Check feature flag
    const featureFlags = await ctx.db
      .query("featureFlags")
      .withIndex("by_tier", (q) => q.eq("tier", profile.tier))
      .first();

    if (!featureFlags?.canViewForecast) {
      return null;
    }

    const projectionYears = args.years || 5;
    const diyMix = args.diyMix ?? 0.5;
    const inflationRate = args.inflationRate ?? DEFAULT_ANNUAL_INFLATION_RATE;
    const currentYear = new Date().getFullYear();

    const systems = await ctx.db
      .query("systems")
      .withIndex("by_home_active", (q) =>
        q.eq("homeId", args.homeId).eq("isArchived", false)
      )
      .collect();

    const systemMaintenanceForecasts = [];

    for (const system of systems) {
      const systemType = await ctx.db.get(system.systemTypeId);
      if (!systemType) continue;

      const currentAge = calculateAge(system.installDate, home.yearBuilt);

      // Get templates for this system type
      const templates = await ctx.db
        .query("maintenanceTaskTemplates")
        .withIndex("by_systemType", (q) => q.eq("systemTypeId", system.systemTypeId))
        .collect();

      const taskForecasts = [];
      let totalAnnualCostNominal = 0;
      let totalAnnualCostDiy = 0;
      let totalAnnualCostPro = 0;

      const routineCostMult = await getRegionalCostMultiplier(
        ctx, home.state, systemType.category
      );

      for (const template of templates) {
        const occurrencesPerYear = 12 / template.frequencyMonths;
        
        const diyAvg = ((template.diyCostLow || 0) + (template.diyCostHigh || 0)) / 2 * routineCostMult;
        const proAvg = ((template.proCostLow || 0) + (template.proCostHigh || 0)) / 2 * routineCostMult;
        
        const ageMultiplier = getAgeUrgencyMultiplier(currentAge, systemType.defaultLifespanYears);
        const adjustedDiyAvg = diyAvg * ageMultiplier;
        const adjustedProAvg = proAvg * ageMultiplier;
        
        const annualDiyCost = adjustedDiyAvg * occurrencesPerYear;
        const annualProCost = adjustedProAvg * occurrencesPerYear;
        const annualMixedCost = annualDiyCost * diyMix + annualProCost * (1 - diyMix);
        
        totalAnnualCostDiy += annualDiyCost;
        totalAnnualCostPro += annualProCost;
        totalAnnualCostNominal += annualMixedCost;

        taskForecasts.push({
          taskName: template.name,
          frequency: template.frequencyMonths,
          frequencyLabel: template.frequencyMonths === 1 ? "Monthly" :
                         template.frequencyMonths === 3 ? "Quarterly" :
                         template.frequencyMonths === 6 ? "Twice yearly" :
                         template.frequencyMonths === 12 ? "Annually" :
                         `Every ${template.frequencyMonths} months`,
          difficulty: template.difficulty,
          priority: template.priority,
          annualOccurrences: Math.round(occurrencesPerYear * 10) / 10,
          costPerOccurrenceDiy: Math.round(adjustedDiyAvg),
          costPerOccurrencePro: Math.round(adjustedProAvg),
          annualCostDiy: Math.round(annualDiyCost),
          annualCostPro: Math.round(annualProCost),
          annualCostMixed: Math.round(annualMixedCost),
          ageAdjustmentPercent: Math.round((ageMultiplier - 1) * 100),
        });
      }

      // Apply maintenance impact factor + cap to annual totals
      const impactFactor = systemType.maintenanceImpactFactor ?? 1;
      const rawAnnualMixed = totalAnnualCostNominal * impactFactor;
      const rawAnnualDiy = totalAnnualCostDiy * impactFactor;
      const rawAnnualPro = totalAnnualCostPro * impactFactor;
      const annualCap =
        systemType.defaultReplacementCostMid *
        0.02 *
        getAgeUrgencyMultiplier(currentAge, systemType.defaultLifespanYears) *
        impactFactor;
      const capRatio = rawAnnualMixed > 0 ? Math.min(1, annualCap / rawAnnualMixed) : 1;
      const cappedAnnualMixed = rawAnnualMixed * capRatio;
      const cappedAnnualDiy = rawAnnualDiy * capRatio;
      const cappedAnnualPro = rawAnnualPro * capRatio;

      // Calculate multi-year projection with inflation
      const yearlyProjection = [];
      let totalProjectedCost = 0;
      
      for (let i = 0; i < projectionYears; i++) {
        const yearAge = currentAge + i;
        const ageMultiplier = getAgeUrgencyMultiplier(yearAge, systemType.defaultLifespanYears);
        const yearCostNominal =
          cappedAnnualMixed *
          (ageMultiplier / getAgeUrgencyMultiplier(currentAge, systemType.defaultLifespanYears));
        const yearCostInflated = applyInflation(yearCostNominal, i, inflationRate);
        
        totalProjectedCost += yearCostInflated;
        
        yearlyProjection.push({
          year: currentYear + i,
          systemAge: Math.round(yearAge * 10) / 10,
          ageMultiplier: Math.round(ageMultiplier * 100) / 100,
          costNominal: Math.round(yearCostNominal),
          costInflated: Math.round(yearCostInflated),
        });
      }

      systemMaintenanceForecasts.push({
        systemId: system._id,
        systemName: system.name || systemType.name,
        category: systemType.category,
        currentAge: Math.round(currentAge * 10) / 10,
        lifespan: systemType.defaultLifespanYears,
        ageRatio: Math.round((currentAge / systemType.defaultLifespanYears) * 100),
        taskCount: templates.length,
        tasks: taskForecasts.sort((a, b) => {
          const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, routine: 4 };
          return (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4);
        }),
        annualSummary: {
          totalDiy: Math.round(cappedAnnualDiy),
          totalPro: Math.round(cappedAnnualPro),
          totalMixed: Math.round(cappedAnnualMixed),
          potentialSavings: Math.round((cappedAnnualPro - cappedAnnualDiy) * diyMix),
        },
        yearlyProjection,
        totalProjectedCost: Math.round(totalProjectedCost),
      });
    }

    // Sort by total projected cost (highest maintenance needs first)
    systemMaintenanceForecasts.sort((a, b) => b.totalProjectedCost - a.totalProjectedCost);

    // Calculate totals
    const grandTotalProjected = systemMaintenanceForecasts.reduce(
      (sum, s) => sum + s.totalProjectedCost, 0
    );
    const grandTotalAnnualDiy = systemMaintenanceForecasts.reduce(
      (sum, s) => sum + s.annualSummary.totalDiy, 0
    );
    const grandTotalAnnualPro = systemMaintenanceForecasts.reduce(
      (sum, s) => sum + s.annualSummary.totalPro, 0
    );

    return {
      systems: systemMaintenanceForecasts,
      summary: {
        systemCount: systems.length,
        totalTasksPerYear: systemMaintenanceForecasts.reduce(
          (sum, s) => sum + s.tasks.reduce((t, task) => t + task.annualOccurrences, 0), 0
        ),
        annualCostDiy: Math.round(grandTotalAnnualDiy),
        annualCostPro: Math.round(grandTotalAnnualPro),
        annualCostMixed: Math.round(systemMaintenanceForecasts.reduce(
          (sum, s) => sum + s.annualSummary.totalMixed, 0
        )),
        projectedTotalCost: Math.round(grandTotalProjected),
        totalPotentialSavings: Math.round((grandTotalAnnualPro - grandTotalAnnualDiy) * diyMix * projectionYears),
      },
      assumptions: {
        inflationRate: Math.round(inflationRate * 1000) / 10,
        diyMix: Math.round(diyMix * 100),
        projectionYears,
      },
    };
  },
});

/**
 * Get systems that need attention (high failure probability or low health)
 */
export const getSystemsNeedingAttention = query({
  args: {
    homeId: v.id("homes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const home = await ctx.db.get(args.homeId);
    if (!home) return [];

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) return [];

    const systems = await ctx.db
      .query("systems")
      .withIndex("by_home_active", (q) =>
        q.eq("homeId", args.homeId).eq("isArchived", false)
      )
      .collect();

    const needsAttention = [];

    for (const system of systems) {
      const systemType = await ctx.db.get(system.systemTypeId);
      if (!systemType) continue;

      const age = calculateAge(system.installDate, home.yearBuilt);
      const shape = systemType.weibullShape;
      const baseScale = systemType.weibullScale;
      const scale = await getClimateAdjustedScale(
        ctx, baseScale, system.systemTypeId, home.climateZoneId ?? undefined
      );
      const failureProb1yr = conditionalFailureProbability(age, 1, shape, scale);
      const remainingLifePercent =
        system.remainingLifePercent ??
        Math.max(0, 100 - (age / systemType.defaultLifespanYears) * 100);

      // Flag if health < 50 OR 1yr failure > 30% OR remaining life < 20%
      if (
        system.healthScore < 50 ||
        failureProb1yr > 30 ||
        remainingLifePercent < 20
      ) {
        needsAttention.push({
          system: {
            ...system,
            systemType,
          },
          ageYears: Math.round(age * 10) / 10,
          failureProb1yr: Math.round(failureProb1yr * 10) / 10,
          remainingLifePercent: Math.round(remainingLifePercent),
          reason:
            system.healthScore < 50
              ? "Low health score"
              : failureProb1yr > 30
                ? "High failure risk"
                : "Near end of life",
        });
      }
    }

    // Sort by health score (lowest first)
    return needsAttention.sort(
      (a, b) => a.system.healthScore - b.system.healthScore
    );
  },
});

/**
 * Get upcoming replacements
 */
export const getUpcomingReplacements = query({
  args: {
    homeId: v.id("homes"),
    years: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const home = await ctx.db.get(args.homeId);
    if (!home) return [];

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) return [];

    const maxYear = new Date().getFullYear() + (args.years || 5);

    const systems = await ctx.db
      .query("systems")
      .withIndex("by_home_active", (q) =>
        q.eq("homeId", args.homeId).eq("isArchived", false)
      )
      .collect();

    const upcoming = [];

    for (const system of systems) {
      if (
        system.estimatedReplacementYear &&
        system.estimatedReplacementYear <= maxYear
      ) {
        const systemType = await ctx.db.get(system.systemTypeId);
        if (!systemType) continue;

        const age = calculateAge(system.installDate, home.yearBuilt);
        const costMultiplier = await getRegionalCostMultiplier(
          ctx, home.state, systemType.category
        );

        upcoming.push({
          systemId: system._id,
          systemName: system.name || systemType.name,
          category: systemType.category,
          ageYears: Math.round(age * 10) / 10,
          lifespan: systemType.defaultLifespanYears,
          replacementYear: system.estimatedReplacementYear,
          costLow: Math.round(systemType.defaultReplacementCostLow * costMultiplier),
          costMid: Math.round(systemType.defaultReplacementCostMid * costMultiplier),
          costHigh: Math.round(systemType.defaultReplacementCostHigh * costMultiplier),
          healthScore: system.healthScore,
        });
      }
    }

    // Sort by replacement year
    return upcoming.sort((a, b) => a.replacementYear - b.replacementYear);
  },
});

// =====================================================
// FORECAST CONFIDENCE & SNAPSHOT FUNCTIONS
// =====================================================

/**
 * Get forecast confidence score and breakdown for a home
 */
export const getForecastConfidence = query({
  args: {
    homeId: v.id("homes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const home = await ctx.db.get(args.homeId);
    if (!home) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) return null;

    // Get systems
    const systems = await ctx.db
      .query("systems")
      .withIndex("by_home_active", (q) =>
        q.eq("homeId", args.homeId).eq("isArchived", false)
      )
      .collect();

    // Get system types
    const systemTypeIds = [...new Set(systems.map((s) => s.systemTypeId))];
    const systemTypes = await Promise.all(
      systemTypeIds.map((id) => ctx.db.get(id))
    );
    const validSystemTypes = systemTypes.filter(
      (st): st is Doc<"systemTypes"> => st !== null
    );

    // Count recent service events (last 2 years)
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    const twoYearsAgoStr = twoYearsAgo.toISOString().split("T")[0];

    const recentEvents = await ctx.db
      .query("homeownerServiceEvents")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .filter((q) => q.gte(q.field("eventDate"), twoYearsAgoStr))
      .collect();

    // Calculate confidence
    const result = calculateConfidence({
      home,
      systems,
      systemTypes: validSystemTypes,
      recentServiceEvents: recentEvents.length,
    });

    return {
      ...result,
      description: getConfidenceDescription(result.level),
      color: getConfidenceColor(result.level),
    };
  },
});

/**
 * Get forecast history (recent snapshots) for a home
 */
export const getForecastHistory = query({
  args: {
    homeId: v.id("homes"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const home = await ctx.db.get(args.homeId);
    if (!home) return [];

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) return [];

    const snapshots = await ctx.db
      .query("forecastSnapshots")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .order("desc")
      .take(args.limit || 10);

    return snapshots;
  },
});

/**
 * Get the most recent forecast snapshot for comparison
 */
export const getLatestForecastSnapshot = query({
  args: {
    homeId: v.id("homes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const home = await ctx.db.get(args.homeId);
    if (!home) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) return null;

    return await ctx.db
      .query("forecastSnapshots")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .order("desc")
      .first();
  },
});

/**
 * Create a new forecast snapshot
 * Called after data changes to record the new forecast state
 */
export const createForecastSnapshot = mutation({
  args: {
    homeId: v.id("homes"),
    triggerType: snapshotTriggerType,
    triggerDescription: v.string(),
    changes: v.optional(v.array(v.object({
      field: v.string(),
      oldValue: v.optional(v.string()),
      newValue: v.string(),
      impactDescription: v.string(),
      costDelta: v.optional(v.number()),
    }))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const home = await ctx.db.get(args.homeId);
    if (!home) throw new Error("Home not found");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) {
      throw new Error("Access denied");
    }

    // Get systems for confidence calculation
    const systems = await ctx.db
      .query("systems")
      .withIndex("by_home_active", (q) =>
        q.eq("homeId", args.homeId).eq("isArchived", false)
      )
      .collect();

    const systemTypeIds = [...new Set(systems.map((s) => s.systemTypeId))];
    const systemTypes = await Promise.all(
      systemTypeIds.map((id) => ctx.db.get(id))
    );
    const validSystemTypes = systemTypes.filter(
      (st): st is Doc<"systemTypes"> => st !== null
    );

    // Count recent service events
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    const twoYearsAgoStr = twoYearsAgo.toISOString().split("T")[0];

    const recentEvents = await ctx.db
      .query("homeownerServiceEvents")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .filter((q) => q.gte(q.field("eventDate"), twoYearsAgoStr))
      .collect();

    // Calculate confidence
    const confidenceResult = calculateConfidence({
      home,
      systems,
      systemTypes: validSystemTypes,
      recentServiceEvents: recentEvents.length,
    });

    // Calculate forecast summary (simplified - uses existing getBudgetForecast logic inline)
    // For now, we'll estimate based on system costs
    let year1Total = 0;
    let year5Total = 0;
    let year10Total = 0;

    for (const system of systems) {
      const systemType = validSystemTypes.find(
        (st) => st._id === system.systemTypeId
      );
      if (!systemType) continue;

      const age = calculateAge(system.installDate, home.yearBuilt);
      const lifespan = systemType.defaultLifespanYears;
      const ageRatio = age / lifespan;

      // Regional cost multiplier
      const costMultiplier = await getRegionalCostMultiplier(
        ctx, home.state, systemType.category
      );

      // Estimated annual maintenance (simplified)
      const maintenancePerYear = systemType.defaultReplacementCostMid * costMultiplier * 0.02;
      
      // Repair probability based on age
      const repairMultiplier = Math.min(2.5, Math.exp(ageRatio * 0.8));
      const repairPerYear = systemType.defaultReplacementCostMid * costMultiplier * 0.02 * repairMultiplier;

      // Replacement probability (climate-adjusted)
      const adjScale = await getClimateAdjustedScale(
        ctx, systemType.weibullScale, system.systemTypeId, home.climateZoneId ?? undefined
      );
      const failProb5 = conditionalFailureProbability(age, 5, systemType.weibullShape, adjScale);
      const failProb10 = conditionalFailureProbability(age, 10, systemType.weibullShape, adjScale);

      const adjustedReplacementCost = systemType.defaultReplacementCostMid * costMultiplier;
      year1Total += maintenancePerYear + repairPerYear;
      year5Total += (maintenancePerYear + repairPerYear) * 5 + (failProb5 > 0.5 ? adjustedReplacementCost : 0);
      year10Total += (maintenancePerYear + repairPerYear) * 10 + (failProb10 > 0.5 ? adjustedReplacementCost : 0);
    }

    // Create snapshot
    const snapshotId = await ctx.db.insert("forecastSnapshots", {
      homeId: args.homeId,
      snapshotDate: Date.now(),
      triggerType: args.triggerType,
      triggerDescription: args.triggerDescription,
      confidenceScore: confidenceResult.score,
      forecastSummary: {
        year1Total: Math.round(year1Total),
        year5Total: Math.round(year5Total),
        year10Total: Math.round(year10Total),
      },
      changes: args.changes,
    });

    return snapshotId;
  },
});

/**
 * Get forecast diff between current state and last snapshot
 */
export const getForecastDiff = query({
  args: {
    homeId: v.id("homes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const home = await ctx.db.get(args.homeId);
    if (!home) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) return null;

    // Get latest snapshot
    const latestSnapshot = await ctx.db
      .query("forecastSnapshots")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .order("desc")
      .first();

    // Get previous snapshot (if any)
    const snapshots = await ctx.db
      .query("forecastSnapshots")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .order("desc")
      .take(2);

    const previousSnapshot = snapshots.length > 1 ? snapshots[1] : null;

    if (!latestSnapshot) {
      return null;
    }

    // Compare
    const diff = compareForecastSnapshots(previousSnapshot, {
      forecastSummary: latestSnapshot.forecastSummary,
      confidenceScore: latestSnapshot.confidenceScore,
      changes: latestSnapshot.changes as ForecastChange[] | undefined,
    });

    return {
      ...diff,
      latestSnapshot,
      previousSnapshot,
    };
  },
});
