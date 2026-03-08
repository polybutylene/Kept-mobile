import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const getBySystem = query({
  args: { systemId: v.id("systems") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("forecastResults")
      .withIndex("by_system", (q) => q.eq("systemId", args.systemId))
      .order("desc")
      .first();
  },
});

export const listByHome = query({
  args: { homeId: v.id("homes") },
  handler: async (ctx, args) => {
    const forecasts = await ctx.db
      .query("forecastResults")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .collect();

    // Get unique latest forecast per system
    const latestBySystem = new Map<string, typeof forecasts[0]>();
    for (const f of forecasts) {
      const existing = latestBySystem.get(f.systemId);
      if (!existing || f.calculatedAt > existing.calculatedAt) {
        latestBySystem.set(f.systemId, f);
      }
    }

    // Enrich with system data
    const enriched = await Promise.all(
      Array.from(latestBySystem.values()).map(async (forecast) => {
        const system = await ctx.db.get(forecast.systemId);
        let systemType = null;
        if (system) {
          systemType = await ctx.db.get(system.systemTypeId);
        }
        return { ...forecast, system, systemType };
      })
    );

    return enriched;
  },
});

export const saveForecast = mutation({
  args: {
    systemId: v.id("systems"),
    homeId: v.id("homes"),
    currentAgeMonths: v.number(),
    reliabilityAtCurrentAge: v.number(),
    failureProbabilityNextYear: v.number(),
    failureProbabilityNext5Years: v.number(),
    medianRemainingLifeMonths: v.number(),
    estimatedReplacementCost: v.number(),
    monthlyBudgetRecommendation: v.number(),
    riskCategory: v.union(
      v.literal("low"),
      v.literal("moderate"),
      v.literal("elevated"),
      v.literal("critical")
    ),
    confidenceIntervalLow: v.number(),
    confidenceIntervalHigh: v.number(),
  },
  handler: async (ctx, args) => {
    // Remove old forecast for this system
    const existing = await ctx.db
      .query("forecastResults")
      .withIndex("by_system", (q) => q.eq("systemId", args.systemId))
      .collect();

    for (const old of existing) {
      await ctx.db.delete(old._id);
    }

    return await ctx.db.insert("forecastResults", {
      ...args,
      calculatedAt: Date.now(),
    });
  },
});

export const recalculate = action({
  args: { homeId: v.id("homes") },
  handler: async (ctx, args) => {
    // This action triggers recalculation.
    // The actual Weibull math runs on the iOS client and results
    // are sent back via saveForecast mutation.
    // Alternatively, it can run server-side for push notification triggers.

    // For server-side recalculation, we'd need the Weibull engine in TS.
    // For now, this serves as a trigger for the iOS client to recalculate.
    return { status: "recalculation_triggered", homeId: args.homeId };
  },
});
