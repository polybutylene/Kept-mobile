/**
 * Health Points Gamification System
 * 
 * Risk-weighted HP scoring tied to Weibull-based forecasting.
 * Every HP earned or lost represents real risk reduction or exposure.
 */

import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { getProfileFromAuthId } from "./lib/permissions";
import { 
  calculateSystemHP, 
  calculateHomeHP, 
  calculateMaintenanceHP,
  calculateSystemAddedHP,
  calculateReplacementHP,
  calculateDailyDecay,
  SystemHPInput,
} from "./lib/hpCalculator";
import { awardHealthPoints } from "./lib/healthPoints";

// Inline Weibull functions (backup in case lib bundling fails)
function inlineCalculateSystemAge(installDate: string | null | undefined): number {
  if (!installDate) return 5; // Default assumption if no install date
  const install = new Date(installDate);
  const now = new Date();
  const ageMs = now.getTime() - install.getTime();
  const ageYears = ageMs / (1000 * 60 * 60 * 24 * 365.25);
  return Math.max(0, ageYears);
}

function inlineWeibullSurvival(age: number, shape: number = 2.5, scale: number = 15): number {
  if (age <= 0) return 1;
  return Math.exp(-Math.pow(age / scale, shape));
}

// Damage potential defaults by category
const INLINE_CATEGORY_DAMAGE: Record<string, number> = {
  plumbing: 25000,
  hvac: 8000,
  appliances: 5000,
  electrical: 15000,
  structural: 30000,
  exterior: 10000,
};

function inlineGetDamageBase(system: { 
  failureMode?: string | null; 
  category?: string | null;
  damagePotentialBase?: number | null;
}): number {
  // Use explicit damage base if set
  if (system.damagePotentialBase && system.damagePotentialBase > 0) {
    return system.damagePotentialBase;
  }
  // Fall back to category default
  if (system.category) {
    return INLINE_CATEGORY_DAMAGE[system.category] ?? 5000;
  }
  return 5000;
}
import {
  TIER_DEFINITIONS,
  getTierDefinition,
  getNextTier,
  evaluateTier,
  hpToNextTier,
  tierProgress,
  TierRequirementStatus,
  HPTier,
} from "./lib/tiers";
import { hpTier, hpEventType } from "./schema";
import { Doc, Id } from "./_generated/dataModel";

// Re-export for backward compatibility
export { DEFAULT_BUNDLES, awardHealthPoints } from "./lib/healthPoints";

async function getMitigationMap(ctx: any, homeId: Id<"homes">): Promise<Record<string, number[]>> {
  const mitigations = await ctx.db
    .query("systemMitigations")
    .withIndex("by_home", (q: any) => q.eq("homeId", homeId))
    .collect();

  const map: Record<string, number[]> = {};
  for (const mitigation of mitigations) {
    const key = mitigation.systemId as unknown as string;
    if (!map[key]) map[key] = [];
    map[key].push(mitigation.reductionFactor);
  }

  return map;
}

function buildMitigationRecommendations(
  damageExposureToReplacementRatio: number,
  existingTypes: Set<string>
): Array<{ label: string; reductionFactor: number }> {
  if (damageExposureToReplacementRatio <= 3) return [];

  const recommendations = [
    { type: "leak_sensor", label: "Add leak detection sensors (reduces exposure ~40%)", reductionFactor: 0.6 },
    { type: "auto_shutoff", label: "Install an auto-shutoff valve (reduces exposure ~60%)", reductionFactor: 0.4 },
    { type: "whole_home_monitor", label: "Consider whole-home water monitoring (reduces exposure ~70%)", reductionFactor: 0.3 },
  ];

  return recommendations
    .filter((rec) => !existingTypes.has(rec.type))
    .map((rec) => ({ label: rec.label, reductionFactor: rec.reductionFactor }));
}

/**
 * Get the HP state for a home (or create if doesn't exist)
 */
export const getHPState = query({
  args: {
    homeId: v.id("homes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) return null;

    const home = await ctx.db.get(args.homeId);
    if (!home || home.ownerId !== profile._id) return null;

    // Get or calculate HP state
    let hpState = await ctx.db
      .query("homeHPState")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .first();

    // If no state exists, calculate it
    if (!hpState) {
      // Calculate from systems
      const systems = await ctx.db
        .query("systems")
        .withIndex("by_home_active", (q) => 
          q.eq("homeId", args.homeId).eq("isArchived", false)
        )
        .collect();

      const systemInputs: Array<SystemHPInput & { id: string; name: string }> = [];
      
      for (const system of systems) {
        const systemType = await ctx.db.get(system.systemTypeId);
        if (!systemType) continue;

        systemInputs.push({
          id: system._id as unknown as string,
          name: system.name || systemType.name,
          estimatedReplacementCost: system.estimatedReplacementCost,
          healthScore: system.healthScore ?? 50,
          installDate: system.installDate,
          modelNumber: system.modelNumber,
          lastServiceDate: system.lastServiceDate,
          manufacturer: system.manufacturer,
          weibullShape: systemType.weibullShape,
          weibullScale: systemType.weibullScale,
          locationFloor: system.locationFloor,
          locationRoom: system.locationRoom,
          failureMode: system.failureMode,
          damagePotentialBase: system.damagePotentialBase,
          category: systemType.category,
        });
      }

      // Count overdue tasks
      const overdueTasks = await ctx.db
        .query("scheduledMaintenance")
        .withIndex("by_home_status", (q) => 
          q.eq("homeId", args.homeId).eq("status", "overdue")
        )
        .collect();

      const mitigationBySystemId = await getMitigationMap(ctx, args.homeId);
      const mitigationTypes = new Set<string>();
      const mitigationRows = await ctx.db
        .query("systemMitigations")
        .withIndex("by_home", (q: any) => q.eq("homeId", args.homeId))
        .collect();
      for (const mitigation of mitigationRows) {
        mitigationTypes.add(mitigation.mitigationType);
      }

      const homeHP = calculateHomeHP({
        systems: systemInputs,
        overdueTaskCount: overdueTasks.length,
        homeValue: home.homeValue ?? null,
        mitigationBySystemId,
      });

      // INLINE ENRICHMENT: Compute risk fields directly here to bypass lib bundling issues
      const enrichedContributions = systemInputs.map((sys, idx) => {
        const original = homeHP.systemContributions[idx] || {};
        const systemAge = inlineCalculateSystemAge(sys.installDate);
        const survivalProb = inlineWeibullSurvival(systemAge, sys.weibullShape ?? 2.5, sys.weibullScale ?? 15);
        const failureProb = Math.max(0, 1 - survivalProb);
        const damageBase = inlineGetDamageBase({ 
          failureMode: sys.failureMode, 
          category: sys.category,
          damagePotentialBase: sys.damagePotentialBase,
        });
        const replacementCost = sys.estimatedReplacementCost || 5000;
        const replacementAtRisk = Math.round(replacementCost * failureProb);
        const damageExposure = Math.round(failureProb * damageBase);
        
        return {
          systemId: sys.id,
          systemName: sys.name,
          currentHP: original.currentHP ?? 0,
          maxHP: original.maxHP ?? 0,
          monthlyDecay: original.monthlyDecay ?? 0,
          replacementAtRisk,
          damageExposure,
          systemAge: Math.round(systemAge * 10) / 10,
          survivalProbability: Math.round(survivalProb * 1000) / 1000,
          failureProbability: Math.round(failureProb * 1000) / 1000,
          damageBase,
          category: sys.category || 'unknown',
        };
      });

      // Recalculate totals from enriched contributions
      const totalReplacementAtRisk = enrichedContributions.reduce((sum, c) => sum + c.replacementAtRisk, 0);
      const totalDamageExposure = enrichedContributions.reduce((sum, c) => sum + c.damageExposure, 0);

      // Get tier requirements status
      const reqStatus = await getTierRequirementStatus(ctx, args.homeId, profile._id);
      const { tier } = evaluateTier(homeHP.currentHP, reqStatus);

      // Return calculated state (not persisted yet)
      return {
        homeId: args.homeId,
        currentHP: homeHP.currentHP,
        maxPossibleHP: homeHP.maxPossibleHP,
        dollarValueProtected: homeHP.dollarValueProtected,
        dollarValueAtRisk: homeHP.dollarValueAtRisk,
        replacementAtRisk: totalReplacementAtRisk,
        damageExposure: totalDamageExposure,
        damageExposureRaw: homeHP.damageExposureRaw,
        damageExposureMultiplier: homeHP.damageExposureMultiplier,
        damageExposureToReplacementRatio: homeHP.damageExposureToReplacementRatio,
        currentTier: tier,
        tierDefinition: getTierDefinition(tier),
        nextTier: getNextTier(tier),
        hpToNextTier: hpToNextTier(homeHP.currentHP, tier),
        tierProgress: tierProgress(homeHP.currentHP, tier),
        tierRequirementsMet: reqStatus,
        mitigationRecommendations: buildMitigationRecommendations(
          homeHP.damageExposureToReplacementRatio,
          mitigationTypes
        ),
        lifetimeHPEarned: 0,
        lifetimeHPDecayed: 0,
        monthlyDecayRate: homeHP.monthlyAgingDecay,
        overdueDecayRate: homeHP.overdueDecayRate,
        streakDaysWithoutLapse: 0,
        hpChangeThisWeek: 0,
        hpChangeThisMonth: 0,
        systemContributions: enrichedContributions,
        // Debug info
        _debug: {
          codePath: "no_hpState_v4_inline",
          timestamp: new Date().toISOString(),
          systemCount: systemInputs.length,
          contributionCount: enrichedContributions.length,
          firstSystemInput: systemInputs[0] ? {
            name: systemInputs[0].name,
            installDate: systemInputs[0].installDate,
            healthScore: systemInputs[0].healthScore,
            weibullShape: systemInputs[0].weibullShape,
            weibullScale: systemInputs[0].weibullScale,
            category: systemInputs[0].category,
          } : null,
          firstContribution: enrichedContributions[0] || null,
          totals: {
            replacementAtRisk: totalReplacementAtRisk,
            damageExposure: totalDamageExposure,
          },
        },
      };
    }

    // Get current tier definition
    const tierDef = getTierDefinition(hpState.currentTier as HPTier);
    const nextTier = getNextTier(hpState.currentTier as HPTier);

    // Get system contributions
    const contributions = await ctx.db
      .query("systemHPContribution")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .collect();

    // Recalculate replacement risk and damage exposure if needed
    const systems = await ctx.db
      .query("systems")
      .withIndex("by_home_active", (q) =>
        q.eq("homeId", args.homeId).eq("isArchived", false)
      )
      .collect();

    const systemInputs: Array<SystemHPInput & { id: string; name: string }> = [];
    for (const system of systems) {
      const systemType = await ctx.db.get(system.systemTypeId);
      if (!systemType) continue;
      systemInputs.push({
        id: system._id as unknown as string,
        name: system.name || systemType.name,
        estimatedReplacementCost: system.estimatedReplacementCost,
        healthScore: system.healthScore ?? 50,
        installDate: system.installDate,
        modelNumber: system.modelNumber,
        lastServiceDate: system.lastServiceDate,
        manufacturer: system.manufacturer,
        weibullShape: systemType.weibullShape,
        weibullScale: systemType.weibullScale,
        locationFloor: system.locationFloor,
        locationRoom: system.locationRoom,
        failureMode: system.failureMode,
        damagePotentialBase: system.damagePotentialBase,
        category: systemType.category,
      });
    }

    const overdueTasks = await ctx.db
      .query("scheduledMaintenance")
      .withIndex("by_home_status", (q) =>
        q.eq("homeId", args.homeId).eq("status", "overdue")
      )
      .collect();

    const mitigationBySystemId = await getMitigationMap(ctx, args.homeId);
    const mitigationTypes = new Set<string>();
    const mitigationRows = await ctx.db
      .query("systemMitigations")
      .withIndex("by_home", (q: any) => q.eq("homeId", args.homeId))
      .collect();
    for (const mitigation of mitigationRows) {
      mitigationTypes.add(mitigation.mitigationType);
    }

    const riskSnapshot = calculateHomeHP({
      systems: systemInputs,
      overdueTaskCount: overdueTasks.length,
      homeValue: home.homeValue ?? null,
      mitigationBySystemId,
    });

    // INLINE ENRICHMENT: Compute risk fields directly here to bypass lib bundling issues
    const enrichedContributions = systemInputs.map((sys, idx) => {
      const original = riskSnapshot.systemContributions[idx] || {};
      const systemAge = inlineCalculateSystemAge(sys.installDate);
      const survivalProb = inlineWeibullSurvival(systemAge, sys.weibullShape ?? 2.5, sys.weibullScale ?? 15);
      const failureProb = Math.max(0, 1 - survivalProb);
      const damageBase = inlineGetDamageBase({ 
        failureMode: sys.failureMode, 
        category: sys.category,
        damagePotentialBase: sys.damagePotentialBase,
      });
      const replacementCost = sys.estimatedReplacementCost || 5000;
      const replacementAtRisk = Math.round(replacementCost * failureProb);
      const damageExposure = Math.round(failureProb * damageBase);
      
      return {
        systemId: sys.id,
        systemName: sys.name,
        currentHP: original.currentHP ?? 0,
        maxHP: original.maxHP ?? 0,
        monthlyDecay: original.monthlyDecay ?? 0,
        replacementAtRisk,
        damageExposure,
        systemAge: Math.round(systemAge * 10) / 10,
        survivalProbability: Math.round(survivalProb * 1000) / 1000,
        failureProbability: Math.round(failureProb * 1000) / 1000,
        damageBase,
        category: sys.category || 'unknown',
      };
    });

    // Recalculate totals from enriched contributions
    const totalReplacementAtRisk = enrichedContributions.reduce((sum, c) => sum + c.replacementAtRisk, 0);
    const totalDamageExposure = enrichedContributions.reduce((sum, c) => sum + c.damageExposure, 0);

    // Always use fresh risk calculations (not cached values)
    return {
      ...hpState,
      currentHP: riskSnapshot.currentHP,
      maxPossibleHP: riskSnapshot.maxPossibleHP,
      dollarValueProtected: riskSnapshot.dollarValueProtected,
      dollarValueAtRisk: riskSnapshot.dollarValueAtRisk,
      replacementAtRisk: totalReplacementAtRisk,
      damageExposure: totalDamageExposure,
      damageExposureRaw: riskSnapshot.damageExposureRaw,
      damageExposureMultiplier: riskSnapshot.damageExposureMultiplier,
      damageExposureToReplacementRatio: riskSnapshot.damageExposureToReplacementRatio,
      monthlyDecayRate: riskSnapshot.monthlyAgingDecay,
      overdueDecayRate: riskSnapshot.overdueDecayRate,
      mitigationRecommendations: buildMitigationRecommendations(
        riskSnapshot.damageExposureToReplacementRatio,
        mitigationTypes
      ),
      tierDefinition: tierDef,
      nextTier,
      hpToNextTier: hpToNextTier(riskSnapshot.currentHP, hpState.currentTier as HPTier),
      tierProgress: tierProgress(riskSnapshot.currentHP, hpState.currentTier as HPTier),
      systemContributions: enrichedContributions,
      // Debug info
      _debug: {
        codePath: "has_hpState_v4_inline",
        timestamp: new Date().toISOString(),
        systemCount: systemInputs.length,
        contributionCount: enrichedContributions.length,
        firstSystemInput: systemInputs[0] ? {
          name: systemInputs[0].name,
          installDate: systemInputs[0].installDate,
          healthScore: systemInputs[0].healthScore,
          weibullShape: systemInputs[0].weibullShape,
          weibullScale: systemInputs[0].weibullScale,
          category: systemInputs[0].category,
        } : null,
        firstContribution: enrichedContributions[0] || null,
        totals: {
          replacementAtRisk: totalReplacementAtRisk,
          damageExposure: totalDamageExposure,
        },
      },
    };
  },
});

/**
 * Get HP history events for a home
 */
export const getHPHistory = query({
  args: {
    homeId: v.id("homes"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) return [];

    const home = await ctx.db.get(args.homeId);
    if (!home || home.ownerId !== profile._id) return [];

    // Try new hpEvents table first
    const newEvents = await ctx.db
      .query("hpEvents")
      .withIndex("by_home_date", (q) => q.eq("homeId", args.homeId))
      .order("desc")
      .take(args.limit || 25);

    if (newEvents.length > 0) {
      return newEvents;
    }

    // Fall back to old healthPointsEvents
    const oldEvents = await ctx.db
      .query("healthPointsEvents")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .order("desc")
      .take(args.limit || 25);

    // Transform old events to new format
    return oldEvents.map(e => ({
      _id: e._id,
      _creationTime: e._creationTime,
      homeId: e.homeId,
      systemId: e.systemId,
      eventType: "earn" as const,
      hpChange: e.points,
      newBalance: 0,
      reason: e.sourceType,
      description: e.reason || e.sourceType,
      metadata: e.metadata,
      occurredAt: e.occurredAt,
    }));
  },
});

/**
 * Get all tier definitions
 */
export const getTiers = query({
  args: {},
  handler: async () => {
    return TIER_DEFINITIONS;
  },
});

/**
 * Debug query to see HP calculation details
 */
export const debugHPCalculation = query({
  args: {
    homeId: v.id("homes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) return null;

    const home = await ctx.db.get(args.homeId);
    if (!home || home.ownerId !== profile._id) return null;

    const systems = await ctx.db
      .query("systems")
      .withIndex("by_home_active", (q) => 
        q.eq("homeId", args.homeId).eq("isArchived", false)
      )
      .collect();

    const debugSystems = [];
    
    for (const system of systems) {
      const systemType = await ctx.db.get(system.systemTypeId);
      if (!systemType) continue;

      const systemHP = calculateSystemHP({
        estimatedReplacementCost: system.estimatedReplacementCost,
        healthScore: system.healthScore,
        installDate: system.installDate,
        modelNumber: system.modelNumber,
        lastServiceDate: system.lastServiceDate,
        manufacturer: system.manufacturer,
        weibullShape: systemType.weibullShape,
        weibullScale: systemType.weibullScale,
        locationFloor: system.locationFloor,
        locationRoom: system.locationRoom,
        failureMode: system.failureMode,
        damagePotentialBase: system.damagePotentialBase,
        category: systemType.category,
      });

      const failureProbability = Math.max(0, 1 - systemHP.survivalProbability);
      const replacementCost = system.estimatedReplacementCost || 5000;
      
      debugSystems.push({
        name: system.name || systemType.name,
        category: systemType.category,
        installDate: system.installDate,
        systemAge: systemHP.systemAge,
        healthScore: system.healthScore,
        replacementCost,
        survivalProbability: systemHP.survivalProbability,
        failureProbability,
        failureMode: system.failureMode,
        damagePotentialBase: system.damagePotentialBase,
        locationFloor: system.locationFloor,
        currentHP: systemHP.currentHP,
        replacementAtRisk: Math.round(replacementCost * failureProbability),
      });
    }

    return {
      systemCount: systems.length,
      homeValue: home.homeValue,
      systems: debugSystems,
    };
  },
});

/**
 * Award HP for an action
 */
export const awardHP = mutation({
  args: {
    homeId: v.id("homes"),
    systemId: v.optional(v.id("systems")),
    eventType: hpEventType,
    hpChange: v.number(),
    reason: v.string(),
    description: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) throw new Error("Profile not found");

    const home = await ctx.db.get(args.homeId);
    if (!home || home.ownerId !== profile._id) {
      throw new Error("Permission denied");
    }

    // Get or create HP state
    let hpState = await ctx.db
      .query("homeHPState")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .first();

    const now = Date.now();

    if (!hpState) {
      // Create initial state
      const systems = await ctx.db
        .query("systems")
        .withIndex("by_home_active", (q) => 
          q.eq("homeId", args.homeId).eq("isArchived", false)
        )
        .collect();

      const systemInputs: Array<SystemHPInput & { id: string; name: string }> = [];
      for (const system of systems) {
        const systemType = await ctx.db.get(system.systemTypeId);
        if (!systemType) continue;
        systemInputs.push({
          id: system._id,
          name: system.name || systemType.name,
          estimatedReplacementCost: system.estimatedReplacementCost,
          healthScore: system.healthScore,
          installDate: system.installDate,
          modelNumber: system.modelNumber,
          lastServiceDate: system.lastServiceDate,
          manufacturer: system.manufacturer,
          weibullShape: systemType.weibullShape,
          weibullScale: systemType.weibullScale,
          locationFloor: system.locationFloor,
          locationRoom: system.locationRoom,
          failureMode: system.failureMode,
          damagePotentialBase: system.damagePotentialBase,
          category: systemType.category,
        });
      }

      const overdueTasks = await ctx.db
        .query("scheduledMaintenance")
        .withIndex("by_home_status", (q) => 
          q.eq("homeId", args.homeId).eq("status", "overdue")
        )
        .collect();

      const homeHP = calculateHomeHP({
        systems: systemInputs,
        overdueTaskCount: overdueTasks.length,
        homeValue: home.homeValue ?? null,
        mitigationBySystemId: await getMitigationMap(ctx, args.homeId),
      });

      const reqStatus = await getTierRequirementStatus(ctx, args.homeId, profile._id);
      const { tier } = evaluateTier(homeHP.currentHP, reqStatus);

      const stateId = await ctx.db.insert("homeHPState", {
        homeId: args.homeId,
        currentHP: homeHP.currentHP,
        maxPossibleHP: homeHP.maxPossibleHP,
        dollarValueProtected: homeHP.dollarValueProtected,
        dollarValueAtRisk: homeHP.dollarValueAtRisk,
        replacementAtRisk: homeHP.replacementAtRisk,
        damageExposure: homeHP.damageExposure,
        damageExposureRaw: homeHP.damageExposureRaw,
        damageExposureMultiplier: homeHP.damageExposureMultiplier,
        damageExposureToReplacementRatio: homeHP.damageExposureToReplacementRatio,
        currentTier: tier,
        tierAchievedAt: now,
        tierRequirementsMet: reqStatus,
        lifetimeHPEarned: 0,
        lifetimeHPDecayed: 0,
        lastDecayCalculation: now,
        monthlyDecayRate: homeHP.monthlyAgingDecay,
        overdueDecayRate: homeHP.overdueDecayRate,
        streakDaysWithoutLapse: 0,
        hpChangeThisWeek: 0,
        hpChangeThisMonth: 0,
      });

      hpState = await ctx.db.get(stateId);
    }

    if (!hpState) throw new Error("Failed to create HP state");

    // Calculate new balance
    const newHP = Math.max(0, hpState.currentHP + args.hpChange);
    const newBalance = newHP;

    // Update lifetime stats
    let lifetimeEarned = hpState.lifetimeHPEarned;
    let lifetimeDecayed = hpState.lifetimeHPDecayed;
    
    if (args.hpChange > 0) {
      lifetimeEarned += args.hpChange;
    } else {
      lifetimeDecayed += Math.abs(args.hpChange);
    }

    // Update weekly/monthly changes
    let weeklyChange = hpState.hpChangeThisWeek + args.hpChange;
    let monthlyChange = hpState.hpChangeThisMonth + args.hpChange;

    // Check for tier change
    const reqStatus = await getTierRequirementStatus(ctx, args.homeId, profile._id);
    const { tier: newTier } = evaluateTier(newHP, reqStatus);
    const tierChanged = newTier !== hpState.currentTier;

    // Insert event
    await ctx.db.insert("hpEvents", {
      homeId: args.homeId,
      systemId: args.systemId,
      eventType: args.eventType,
      hpChange: args.hpChange,
      newBalance,
      reason: args.reason,
      description: args.description,
      metadata: tierChanged ? {
        ...args.metadata,
        previousTier: hpState.currentTier,
        newTier,
      } : args.metadata,
      occurredAt: now,
    });

    // If tier changed, insert a tier change event
    if (tierChanged) {
      await ctx.db.insert("hpEvents", {
        homeId: args.homeId,
        eventType: "tier_change",
        hpChange: 0,
        newBalance,
        reason: "tier_change",
        description: `Advanced to ${getTierDefinition(newTier).displayName} tier`,
        metadata: {
          previousTier: hpState.currentTier,
          newTier,
        },
        occurredAt: now,
      });
    }

    // Update HP state
    await ctx.db.patch(hpState._id, {
      currentHP: newHP,
      dollarValueProtected: newHP * 100,
      dollarValueAtRisk: Math.max(0, hpState.maxPossibleHP - newHP) * 100,
      currentTier: newTier,
      tierAchievedAt: tierChanged ? now : hpState.tierAchievedAt,
      tierRequirementsMet: reqStatus,
      lifetimeHPEarned: lifetimeEarned,
      lifetimeHPDecayed: lifetimeDecayed,
      hpChangeThisWeek: weeklyChange,
      hpChangeThisMonth: monthlyChange,
    });

    return {
      newHP,
      tierChanged,
      newTier,
      previousTier: hpState.currentTier,
    };
  },
});

/**
 * Ensure homeHPState exists for a given home.
 * Creates it from scratch if missing. Safe to call multiple times (idempotent).
 */
export const ensureHPState = internalMutation({
  args: { homeId: v.id("homes") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("homeHPState")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .first();
    if (existing) return existing._id;

    const home = await ctx.db.get(args.homeId);
    if (!home) throw new Error("Home not found");

    const systems = await ctx.db
      .query("systems")
      .withIndex("by_home_active", (q) =>
        q.eq("homeId", args.homeId).eq("isArchived", false)
      )
      .collect();

    const systemInputs: Array<SystemHPInput & { id: string; name: string }> = [];
    for (const system of systems) {
      const systemType = await ctx.db.get(system.systemTypeId);
      if (!systemType) continue;
      systemInputs.push({
        id: system._id,
        name: system.name || systemType.name,
        estimatedReplacementCost: system.estimatedReplacementCost,
        healthScore: system.healthScore,
        installDate: system.installDate,
        modelNumber: system.modelNumber,
        lastServiceDate: system.lastServiceDate,
        manufacturer: system.manufacturer,
        weibullShape: systemType.weibullShape,
        weibullScale: systemType.weibullScale,
        locationFloor: system.locationFloor,
        locationRoom: system.locationRoom,
        failureMode: system.failureMode,
        damagePotentialBase: system.damagePotentialBase,
        category: systemType.category,
      });
    }

    const overdueTasks = await ctx.db
      .query("scheduledMaintenance")
      .withIndex("by_home_status", (q) =>
        q.eq("homeId", args.homeId).eq("status", "overdue")
      )
      .collect();

    const homeHP = calculateHomeHP({
      systems: systemInputs,
      overdueTaskCount: overdueTasks.length,
      homeValue: home.homeValue ?? null,
      mitigationBySystemId: await getMitigationMap(ctx, args.homeId),
    });

    const now = Date.now();
    const ownerId = home.ownerId;
    let profile = null;
    if (ownerId) {
      profile = await ctx.db.get(ownerId);
    }
    const reqStatus: TierRequirementStatus = profile
      ? await getTierRequirementStatus(ctx, args.homeId, profile._id)
      : {
          majorSystemsDocumented: false,
          noSystemsCritical: false,
          allInstallDatesSet: false,
          maintenanceCurrent: false,
          budgetFundedPercent: 0,
          campaignsCompleted: 0,
          streakDaysWithoutLapse: 0,
        };
    const { tier } = evaluateTier(homeHP.currentHP, reqStatus);

    const stateId = await ctx.db.insert("homeHPState", {
      homeId: args.homeId,
      currentHP: homeHP.currentHP,
      maxPossibleHP: homeHP.maxPossibleHP,
      dollarValueProtected: homeHP.dollarValueProtected,
      dollarValueAtRisk: homeHP.dollarValueAtRisk,
      replacementAtRisk: homeHP.replacementAtRisk,
      damageExposure: homeHP.damageExposure,
      damageExposureRaw: homeHP.damageExposureRaw,
      damageExposureMultiplier: homeHP.damageExposureMultiplier,
      damageExposureToReplacementRatio: homeHP.damageExposureToReplacementRatio,
      currentTier: tier,
      tierAchievedAt: now,
      tierRequirementsMet: reqStatus as TierRequirementStatus,
      lifetimeHPEarned: 0,
      lifetimeHPDecayed: 0,
      lastDecayCalculation: now,
      monthlyDecayRate: homeHP.monthlyAgingDecay,
      overdueDecayRate: homeHP.overdueDecayRate,
      streakDaysWithoutLapse: 0,
      hpChangeThisWeek: 0,
      hpChangeThisMonth: 0,
    });
    return stateId;
  },
});

/**
 * Recalculate HP for a home (after system changes)
 */
export const recalculateHomeHP = mutation({
  args: {
    homeId: v.id("homes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) throw new Error("Profile not found");

    const home = await ctx.db.get(args.homeId);
    if (!home || home.ownerId !== profile._id) {
      throw new Error("Permission denied");
    }

    // Get all active systems
    const systems = await ctx.db
      .query("systems")
      .withIndex("by_home_active", (q) => 
        q.eq("homeId", args.homeId).eq("isArchived", false)
      )
      .collect();

    const systemInputs: Array<SystemHPInput & { id: string; name: string }> = [];
    
    for (const system of systems) {
      const systemType = await ctx.db.get(system.systemTypeId);
      if (!systemType) continue;

      const input = {
        id: system._id,
        name: system.name || systemType.name,
        estimatedReplacementCost: system.estimatedReplacementCost,
        healthScore: system.healthScore,
        installDate: system.installDate,
        modelNumber: system.modelNumber,
        lastServiceDate: system.lastServiceDate,
        manufacturer: system.manufacturer,
        weibullShape: systemType.weibullShape,
        weibullScale: systemType.weibullScale,
        locationFloor: system.locationFloor,
        locationRoom: system.locationRoom,
        failureMode: system.failureMode,
        damagePotentialBase: system.damagePotentialBase,
        category: systemType.category,
      };

      systemInputs.push(input);

      // Calculate and store individual system HP
      const systemHP = calculateSystemHP(input);
      
      // Upsert systemHPContribution
      const existing = await ctx.db
        .query("systemHPContribution")
        .withIndex("by_system", (q) => q.eq("systemId", system._id))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          currentHP: systemHP.currentHP,
          maxHP: systemHP.maxHP,
          baseValue: systemHP.baseValue,
          survivalProbability: systemHP.survivalProbability,
          conditionMultiplier: systemHP.conditionMultiplier,
          documentationBonus: systemHP.documentationBonus,
          monthlyAgingDecay: systemHP.monthlyAgingDecay,
          lapseDecay: 0,
          lastCalculated: Date.now(),
          systemAge: systemHP.systemAge,
          weibullShape: input.weibullShape,
          weibullScale: input.weibullScale,
        });
      } else {
        await ctx.db.insert("systemHPContribution", {
          systemId: system._id,
          homeId: args.homeId,
          currentHP: systemHP.currentHP,
          maxHP: systemHP.maxHP,
          baseValue: systemHP.baseValue,
          survivalProbability: systemHP.survivalProbability,
          conditionMultiplier: systemHP.conditionMultiplier,
          documentationBonus: systemHP.documentationBonus,
          monthlyAgingDecay: systemHP.monthlyAgingDecay,
          lapseDecay: 0,
          lastCalculated: Date.now(),
          systemAge: systemHP.systemAge,
          weibullShape: input.weibullShape,
          weibullScale: input.weibullScale,
        });
      }
    }

    // Count overdue tasks
    const overdueTasks = await ctx.db
      .query("scheduledMaintenance")
      .withIndex("by_home_status", (q) => 
        q.eq("homeId", args.homeId).eq("status", "overdue")
      )
      .collect();

    const homeHP = calculateHomeHP({
      systems: systemInputs,
      overdueTaskCount: overdueTasks.length,
      homeValue: home.homeValue ?? null,
      mitigationBySystemId: await getMitigationMap(ctx, args.homeId),
    });

    // Get tier requirements status
    const reqStatus = await getTierRequirementStatus(ctx, args.homeId, profile._id);
    const { tier } = evaluateTier(homeHP.currentHP, reqStatus);

    const now = Date.now();

    // Update or create HP state
    let hpState = await ctx.db
      .query("homeHPState")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .first();

    if (hpState) {
      const tierChanged = tier !== hpState.currentTier;
      
      await ctx.db.patch(hpState._id, {
        currentHP: homeHP.currentHP,
        maxPossibleHP: homeHP.maxPossibleHP,
        dollarValueProtected: homeHP.dollarValueProtected,
        dollarValueAtRisk: homeHP.dollarValueAtRisk,
        replacementAtRisk: homeHP.replacementAtRisk,
        damageExposure: homeHP.damageExposure,
        damageExposureRaw: homeHP.damageExposureRaw,
        damageExposureMultiplier: homeHP.damageExposureMultiplier,
        damageExposureToReplacementRatio: homeHP.damageExposureToReplacementRatio,
        currentTier: tier,
        tierAchievedAt: tierChanged ? now : hpState.tierAchievedAt,
        tierRequirementsMet: reqStatus,
        monthlyDecayRate: homeHP.monthlyAgingDecay,
        overdueDecayRate: homeHP.overdueDecayRate,
      });
    } else {
      await ctx.db.insert("homeHPState", {
        homeId: args.homeId,
        currentHP: homeHP.currentHP,
        maxPossibleHP: homeHP.maxPossibleHP,
        dollarValueProtected: homeHP.dollarValueProtected,
        dollarValueAtRisk: homeHP.dollarValueAtRisk,
        replacementAtRisk: homeHP.replacementAtRisk,
        damageExposure: homeHP.damageExposure,
        damageExposureRaw: homeHP.damageExposureRaw,
        damageExposureMultiplier: homeHP.damageExposureMultiplier,
        damageExposureToReplacementRatio: homeHP.damageExposureToReplacementRatio,
        currentTier: tier,
        tierAchievedAt: now,
        tierRequirementsMet: reqStatus,
        lifetimeHPEarned: 0,
        lifetimeHPDecayed: 0,
        lastDecayCalculation: now,
        monthlyDecayRate: homeHP.monthlyAgingDecay,
        overdueDecayRate: homeHP.overdueDecayRate,
        streakDaysWithoutLapse: 0,
        hpChangeThisWeek: 0,
        hpChangeThisMonth: 0,
      });
    }

    return homeHP;
  },
});

/**
 * Helper to get tier requirement status for a home
 */
async function getTierRequirementStatus(
  ctx: any,
  homeId: Id<"homes">,
  profileId: Id<"userProfiles">
): Promise<TierRequirementStatus> {
  // Get systems
  const systems = await ctx.db
    .query("systems")
    .withIndex("by_home_active", (q: any) => 
      q.eq("homeId", homeId).eq("isArchived", false)
    )
    .collect();

  // Check major systems documented (HVAC, water heater, roof categories)
  const majorCategories = ["hvac", "plumbing", "structural"];
  const documentedMajorSystems = systems.filter((s: Doc<"systems">) => 
    s.installDate && s.modelNumber
  );
  const hasMajorSystemType = async (category: string) => {
    for (const sys of systems) {
      const type = await ctx.db.get(sys.systemTypeId);
      if (type?.category === category) return true;
    }
    return false;
  };
  
  // Simplified check - at least 3 systems with install dates
  const majorSystemsDocumented = documentedMajorSystems.length >= 3;

  // No systems in critical condition
  const noSystemsCritical = !systems.some((s: Doc<"systems">) => s.healthScore < 30);

  // All systems have install dates
  const allInstallDatesSet = systems.every((s: Doc<"systems">) => !!s.installDate);

  // Get maintenance tasks
  const tasks = await ctx.db
    .query("scheduledMaintenance")
    .withIndex("by_home", (q: any) => q.eq("homeId", homeId))
    .collect();

  const overdueTasks = tasks.filter((t: Doc<"scheduledMaintenance">) => t.status === "overdue");
  const completedTasks = tasks.filter((t: Doc<"scheduledMaintenance">) => t.status === "completed");

  // Maintenance current (no overdue tasks, at least one completed)
  const maintenanceCurrent = overdueTasks.length === 0 && completedTasks.length > 0;

  // Campaign progress
  const campaigns = await ctx.db
    .query("campaignProgress")
    .withIndex("by_home", (q: any) => q.eq("homeId", homeId))
    .collect();
  const completedCampaigns = campaigns.filter((c: Doc<"campaignProgress">) => c.completedAt);

  // Get HP state for streak
  const hpState = await ctx.db
    .query("homeHPState")
    .withIndex("by_home", (q: any) => q.eq("homeId", homeId))
    .first();

  return {
    majorSystemsDocumented,
    noSystemsCritical,
    allInstallDatesSet,
    maintenanceCurrent,
    budgetFundedPercent: 0, // Would need budget tracking feature
    campaignsCompleted: completedCampaigns.length,
    streakDaysWithoutLapse: hpState?.streakDaysWithoutLapse ?? 0,
  };
}

// ============================================
// BACKWARD COMPATIBILITY QUERIES
// ============================================

/**
 * Get bundle progress (backward compatible with old system)
 */
export const getBundleProgress = query({
  args: {
    homeId: v.optional(v.id("homes")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) return null;

    if (args.homeId) {
      const homeId = args.homeId;
      const home = await ctx.db.get(homeId);
      if (!home || home.ownerId !== profile._id) return null;

      // Get HP state
      const hpState = await ctx.db
        .query("homeHPState")
        .withIndex("by_home", (q) => q.eq("homeId", homeId))
        .first();

      if (hpState) {
        const tierDef = getTierDefinition(hpState.currentTier as HPTier);
        const nextTier = getNextTier(hpState.currentTier as HPTier);
        
        return {
          currentPoints: hpState.currentHP,
          lifetimePoints: hpState.lifetimeHPEarned,
          currentTier: hpState.currentTier,
          tierName: tierDef.displayName,
          tierColor: tierDef.color,
          nextTier: nextTier ? {
            id: nextTier.id,
            name: nextTier.displayName,
            minHP: nextTier.minHP,
            hpNeeded: nextTier.minHP - hpState.currentHP,
          } : null,
          dollarValueProtected: hpState.dollarValueProtected,
          dollarValueAtRisk: hpState.dollarValueAtRisk,
          monthlyDecayRate: hpState.monthlyDecayRate,
          overdueDecayRate: hpState.overdueDecayRate,
          // Legacy bundle format for backward compatibility
          bundles: TIER_DEFINITIONS.map(tier => ({
            key: tier.id,
            name: tier.name,
            description: tier.description,
            pointsRequired: tier.minHP,
            status: hpState.currentHP >= tier.minHP ? "achieved" : "in_progress",
            achievedAt: hpState.currentHP >= tier.minHP ? hpState.tierAchievedAt : null,
          })),
          nextBundle: nextTier ? {
            key: nextTier.id,
            name: nextTier.name,
            pointsRequired: nextTier.minHP,
            remainingPoints: nextTier.minHP - hpState.currentHP,
            progressPercent: tierProgress(hpState.currentHP, hpState.currentTier as HPTier),
          } : null,
        };
      }
    }

    // Fall back to old balance system
    const balance = await ctx.db
      .query("healthPointsBalances")
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
      .filter((q) => q.eq(q.field("homeId"), args.homeId))
      .first();

    const currentPoints = balance?.currentPoints ?? 0;
    const lifetimePoints = balance?.lifetimePoints ?? 0;

    return {
      currentPoints,
      lifetimePoints,
      currentTier: "aware",
      tierName: "Aware",
      tierColor: "#6B7280",
      nextTier: {
        id: "stable",
        name: "Stable",
        minHP: 500,
        hpNeeded: Math.max(0, 500 - currentPoints),
      },
      dollarValueProtected: currentPoints * 100,
      dollarValueAtRisk: 0,
      monthlyDecayRate: 0,
      overdueDecayRate: 0,
      bundles: [],
      nextBundle: null,
    };
  },
});

/**
 * Get history (backward compatible)
 */
export const getHistory = query({
  args: {
    homeId: v.optional(v.id("homes")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) return [];

    if (args.homeId) {
      const homeId = args.homeId;
      const home = await ctx.db.get(homeId);
      if (!home || home.ownerId !== profile._id) return [];

      // Try new events first
      const newEvents = await ctx.db
        .query("hpEvents")
        .withIndex("by_home_date", (q) => q.eq("homeId", homeId))
        .order("desc")
        .take(args.limit || 25);

      if (newEvents.length > 0) {
        return newEvents.map(e => ({
          _id: e._id,
          points: e.hpChange,
          sourceType: e.reason,
          reason: e.description,
          metadata: e.metadata,
          occurredAt: e.occurredAt,
          eventType: e.eventType,
        }));
      }

      // Fall back to old events
      const events = await ctx.db
        .query("healthPointsEvents")
        .withIndex("by_user", (q) => q.eq("userId", profile._id))
        .filter((q) => q.eq(q.field("homeId"), homeId))
        .order("desc")
        .take(args.limit || 25);

      return events;
    }

    // No homeId provided, query by user only
    const events = await ctx.db
      .query("healthPointsEvents")
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
      .order("desc")
      .take(args.limit || 25);

    return events;
  },
});

/**
 * Record upgrade (backward compatible)
 */
export const recordUpgrade = mutation({
  args: {
    homeId: v.optional(v.id("homes")),
    systemId: v.optional(v.id("systems")),
    label: v.string(),
    points: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) throw new Error("Profile not found");

    if (!args.homeId) {
      throw new Error("homeId is required");
    }

    const home = await ctx.db.get(args.homeId);
    if (!home || home.ownerId !== profile._id) {
      throw new Error("Permission denied");
    }

    // Calculate HP based on system if provided
    let hp = args.points ?? 50;
    
    if (args.systemId) {
      const system = await ctx.db.get(args.systemId);
      if (system) {
        hp = calculateSystemAddedHP(
          system.estimatedReplacementCost || 5000,
          !!(system.installDate && system.modelNumber)
        );
      }
    }

    // Use new award system
    const result = await ctx.db.insert("hpEvents", {
      homeId: args.homeId,
      systemId: args.systemId,
      eventType: "earn",
      hpChange: hp,
      newBalance: 0, // Will be updated
      reason: "document_uploaded",
      description: args.label,
      metadata: { label: args.label },
      occurredAt: Date.now(),
    });

    // Also use old system for backward compatibility
    await awardHealthPoints(ctx, {
      userId: profile._id,
      homeId: args.homeId,
      systemId: args.systemId,
      sourceType: "upgrade_documented",
      points: hp,
      reason: args.label,
      metadata: { label: args.label },
    });

    return { success: true, hpAwarded: hp };
  },
});

// ============================================
// INTERNAL MUTATIONS (for scheduled jobs)
// ============================================

/**
 * Run daily HP decay calculation for all homes
 */
export const runDailyDecay = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Get all HP states
    const allHPStates = await ctx.db.query("homeHPState").take(500);
    
    let processed = 0;
    let totalDecay = 0;

    for (const hpState of allHPStates) {
      // Get system contributions for this home
      const contributions = await ctx.db
        .query("systemHPContribution")
        .withIndex("by_home", (q) => q.eq("homeId", hpState.homeId))
        .collect();

      // Calculate decay from aging
      let agingDecay = 0;
      const decayBreakdown: Array<{
        systemId?: Id<"systems">;
        systemName: string;
        decayAmount: number;
        reason: string;
      }> = [];

      for (const contrib of contributions) {
        // Daily decay is monthly decay / 30
        const dailyDecay = contrib.monthlyAgingDecay / 30;
        agingDecay += dailyDecay;

        const system = await ctx.db.get(contrib.systemId);
        decayBreakdown.push({
          systemId: contrib.systemId,
          systemName: system?.name || "System",
          decayAmount: dailyDecay,
          reason: "aging_decay",
        });
      }

      // Get overdue tasks for lapse decay
      const overdueTasks = await ctx.db
        .query("scheduledMaintenance")
        .withIndex("by_home_status", (q) => 
          q.eq("homeId", hpState.homeId).eq("status", "overdue")
        )
        .collect();

      // Calculate lapse decay (2% per overdue task per month, capped at 10%)
      const avgSystemHP = contributions.length > 0 
        ? contributions.reduce((sum, c) => sum + c.currentHP, 0) / contributions.length 
        : 0;
      const monthlyLapseDecay = Math.min(
        overdueTasks.length * avgSystemHP * 0.02,
        avgSystemHP * 0.10
      );
      const dailyLapseDecay = monthlyLapseDecay / 30;

      // Add lapse decay to breakdown
      for (const task of overdueTasks.slice(0, 3)) { // Limit to top 3
        decayBreakdown.push({
          systemId: task.systemId || undefined,
          systemName: task.name,
          decayAmount: dailyLapseDecay / Math.min(overdueTasks.length, 3),
          reason: "maintenance_lapse",
        });
      }

      const totalDailyDecay = Math.round((agingDecay + dailyLapseDecay) * 10) / 10;
      
      if (totalDailyDecay > 0) {
        const newHP = Math.max(0, hpState.currentHP - totalDailyDecay);

        // Insert decay event
        await ctx.db.insert("hpEvents", {
          homeId: hpState.homeId,
          eventType: "decay",
          hpChange: -totalDailyDecay,
          newBalance: newHP,
          reason: "monthly_decay",
          description: `Daily decay: ${totalDailyDecay.toFixed(1)} HP`,
          metadata: {
            decayBreakdown: decayBreakdown.length > 0 ? decayBreakdown : undefined,
          },
          occurredAt: Date.now(),
        });

        // Update HP state
        await ctx.db.patch(hpState._id, {
          currentHP: newHP,
          dollarValueProtected: newHP * 100,
          dollarValueAtRisk: Math.max(0, hpState.maxPossibleHP - newHP) * 100,
          lifetimeHPDecayed: hpState.lifetimeHPDecayed + totalDailyDecay,
          lastDecayCalculation: Date.now(),
          monthlyDecayRate: agingDecay * 30,
          overdueDecayRate: dailyLapseDecay * 30,
          hpChangeThisWeek: hpState.hpChangeThisWeek - totalDailyDecay,
          hpChangeThisMonth: hpState.hpChangeThisMonth - totalDailyDecay,
          // Update streak - reset if there's lapse decay
          streakDaysWithoutLapse: dailyLapseDecay > 0 ? 0 : hpState.streakDaysWithoutLapse + 1,
          lastStreakUpdate: Date.now(),
        });

        totalDecay += totalDailyDecay;
      } else {
        // No decay, just increment streak
        await ctx.db.patch(hpState._id, {
          streakDaysWithoutLapse: hpState.streakDaysWithoutLapse + 1,
          lastStreakUpdate: Date.now(),
          lastDecayCalculation: Date.now(),
        });
      }

      processed++;
    }

    return { processed, totalDecay: Math.round(totalDecay * 10) / 10 };
  },
});

/**
 * Reset weekly HP counters (runs Monday)
 */
export const resetWeeklyCounters = internalMutation({
  args: {},
  handler: async (ctx) => {
    const allHPStates = await ctx.db.query("homeHPState").take(500);
    
    for (const hpState of allHPStates) {
      await ctx.db.patch(hpState._id, {
        hpChangeThisWeek: 0,
      });
    }

    return { reset: allHPStates.length };
  },
});

/**
 * Reset monthly HP counters (runs 1st of month)
 */
export const resetMonthlyCounters = internalMutation({
  args: {},
  handler: async (ctx) => {
    const allHPStates = await ctx.db.query("homeHPState").take(500);
    
    for (const hpState of allHPStates) {
      await ctx.db.patch(hpState._id, {
        hpChangeThisMonth: 0,
      });
    }

    return { reset: allHPStates.length };
  },
});
