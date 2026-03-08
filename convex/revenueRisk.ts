import { query } from "./_generated/server";
import { v } from "convex/values";

const LOST_NIGHTS_BY_SYSTEM: Record<string, number> = {
  "hvac": 4,
  "plumbing": 2,
  "water_heater": 3,
  "electrical": 2,
  "appliance": 1,
  "roof": 5,
};

const EMERGENCY_REPAIR_COST: Record<string, number> = {
  "hvac": 800,
  "plumbing": 500,
  "water_heater": 400,
  "electrical": 600,
  "appliance": 300,
  "roof": 1500,
};

const ANNUAL_PREVENTION_COST: Record<string, number> = {
  "hvac": 150,
  "plumbing": 30,
  "water_heater": 30,
  "electrical": 50,
  "appliance": 20,
  "roof": 100,
};

function getFailureProbNextYear(healthScore: number): number {
  if (healthScore >= 90) return 0.02;
  if (healthScore >= 80) return 0.05;
  if (healthScore >= 70) return 0.10;
  if (healthScore >= 60) return 0.18;
  if (healthScore >= 50) return 0.30;
  if (healthScore >= 40) return 0.45;
  return 0.60;
}

export const calculateRevenueAtRisk = query({
  args: {
    homeId: v.id("homes"),
    averageNightlyRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const nightlyRate = args.averageNightlyRate ?? 200;

    const systems = await ctx.db
      .query("systems")
      .withIndex("by_home_active", (q) =>
        q.eq("homeId", args.homeId).eq("isArchived", false),
      )
      .take(100);

    const systemTypes = await Promise.all(
      systems.map((s) =>
        s.systemTypeId ? ctx.db.get(s.systemTypeId) : null,
      ),
    );

    let totalRisk = 0;
    const risks: Array<{
      systemName: string;
      category: string;
      healthScore: number;
      failureProbability: number;
      lostBookingRevenue: number;
      emergencyRepairCost: number;
      reviewImpact: number;
      preventionCost: number;
      totalRisk: number;
    }> = [];

    for (let i = 0; i < systems.length; i++) {
      const sys = systems[i];
      const sysType = systemTypes[i];
      const score = sys.healthScore ?? 100;

      if (score >= 80) continue;

      const failProb = getFailureProbNextYear(score);
      if (failProb < 0.05) continue;

      const category = sysType?.category ?? "appliance";
      const lostNights = LOST_NIGHTS_BY_SYSTEM[category] ?? 2;
      const repairCost = EMERGENCY_REPAIR_COST[category] ?? 400;
      const preventionCost = ANNUAL_PREVENTION_COST[category] ?? 50;
      const reviewImpact = nightlyRate * 8;

      const sysRisk =
        (lostNights * nightlyRate + repairCost + reviewImpact) * failProb;

      risks.push({
        systemName: sys.name ?? "Unknown System",
        category,
        healthScore: score,
        failureProbability: Math.round(failProb * 100),
        lostBookingRevenue: Math.round(lostNights * nightlyRate * failProb),
        emergencyRepairCost: Math.round(repairCost * failProb),
        reviewImpact: Math.round(reviewImpact * failProb),
        preventionCost,
        totalRisk: Math.round(sysRisk),
      });

      totalRisk += sysRisk;
    }

    risks.sort((a, b) => b.totalRisk - a.totalRisk);

    return {
      totalRevenueAtRisk: Math.round(totalRisk),
      totalPreventionCost: risks.reduce(
        (sum, r) => sum + r.preventionCost,
        0,
      ),
      roi: totalRisk > 0
        ? Math.round(
            totalRisk /
              Math.max(
                1,
                risks.reduce((s, r) => s + r.preventionCost, 0),
              ),
          )
        : 0,
      systemsAtRisk: risks.length,
      risks,
    };
  },
});
