"use node";

/**
 * Aggregation Action — Entry point for nightly intelligence aggregation.
 * Runs as a Node.js action and calls mutations for each aggregation phase.
 */

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

export const runFullAggregation = internalAction(async (ctx) => {
  const now = Date.now();
  console.log(`[Intelligence] Starting nightly aggregation at ${new Date(now).toISOString()}`);

  await ctx.runMutation(internal.aggregation.aggregateSystemReliability);
  await ctx.runMutation(internal.aggregation.aggregateRegionalCosts);
  await ctx.runMutation(internal.aggregation.aggregateTroubleshooting);
  await ctx.runMutation(internal.aggregation.aggregateSeasonalPatterns);

  console.log(`[Intelligence] Aggregation complete`);
});

export const seedBootstrapData = internalAction(async (ctx) => {
  console.log("[Intelligence] Seeding bootstrap reliability data...");

  const { BOOTSTRAP_RELIABILITY, BOOTSTRAP_COSTS } = await import("./intelligenceUtils");

  for (const profile of BOOTSTRAP_RELIABILITY) {
    await ctx.runMutation(internal.aggregation.upsertReliabilityProfile, {
      systemType: profile.systemType,
      make: profile.make,
      region: profile.region,
      climateZone: profile.climateZone,
      sampleSize: 0,
      isBootstrapped: true,
      weibullShape: profile.weibullShape,
      weibullScale: profile.weibullScale,
      medianLifespan: profile.medianLifespan,
      p10Lifespan: profile.p10Lifespan,
      p90Lifespan: profile.p90Lifespan,
      defaultWeibullScale: profile.defaultWeibullScale,
      adjustmentFactor: profile.adjustmentFactor,
      commonFailureModes: profile.commonFailureModes,
      preFailureSymptoms: profile.preFailureSymptoms,
    });
  }

  console.log("[Intelligence] Seeding bootstrap cost data...");
  for (const cost of BOOTSTRAP_COSTS) {
    await ctx.runMutation(internal.aggregation.upsertCostBenchmark, {
      region: cost.region,
      serviceCategory: cost.serviceCategory,
      costType: cost.costType,
      sampleSize: 0,
      averageCost: cost.averageCost,
      medianCost: cost.medianCost,
      p25Cost: cost.p25Cost,
      p75Cost: cost.p75Cost,
      minCost: cost.minCost,
      maxCost: cost.maxCost,
      costTrend: cost.costTrend,
    });
  }

  console.log("[Intelligence] Bootstrap seeding complete");
});
