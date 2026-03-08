import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Validators for service type
const serviceType = v.union(
  v.literal("repair"),
  v.literal("replacement"),
  v.literal("maintenance"),
  v.literal("inspection")
);

const costType = v.union(
  v.literal("actual"),
  v.literal("quoted"),
  v.literal("estimated")
);

/**
 * Record a cost data point for analytics
 * Called when service calls are completed or invoices are processed
 */
export const recordCostData = mutation({
  args: {
    homeId: v.id("homes"),
    systemId: v.optional(v.id("systems")),
    systemTypeId: v.id("systemTypes"),
    serviceCallId: v.optional(v.id("serviceCalls")),
    taskId: v.optional(v.id("scheduledMaintenance")),
    documentId: v.optional(v.id("serviceDocuments")),
    costType: costType,
    amount: v.number(),
    wasDiy: v.boolean(),
    vendor: v.optional(v.string()),
    description: v.optional(v.string()),
    serviceType: serviceType,
    serviceDate: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get home for regional context
    const home = await ctx.db.get(args.homeId);
    if (!home) throw new Error("Home not found");

    // Verify ownership
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) {
      throw new Error("Not authorized");
    }

    // Calculate home age
    const homeAge = home.yearBuilt
      ? new Date().getFullYear() - home.yearBuilt
      : undefined;

    // Insert cost history record
    const costHistoryId = await ctx.db.insert("costHistory", {
      homeId: args.homeId,
      systemId: args.systemId,
      systemTypeId: args.systemTypeId,
      serviceCallId: args.serviceCallId,
      taskId: args.taskId,
      documentId: args.documentId,
      costType: args.costType,
      amount: args.amount,
      wasDiy: args.wasDiy,
      vendor: args.vendor,
      description: args.description,
      serviceType: args.serviceType,
      state: home.state || "Unknown",
      city: home.city,
      zipCode: home.zipCode,
      climateZone: home.climateZone,
      homeAge,
      homeSquareFootage: home.squareFootage,
      serviceDate: args.serviceDate,
      recordedAt: Date.now(),
    });

    // Update regional aggregates (async, non-blocking)
    // This would ideally be done via a scheduled function for better performance
    await updateRegionalAggregates(ctx, {
      state: home.state || "Unknown",
      systemTypeId: args.systemTypeId,
      serviceType: args.serviceType,
      amount: args.amount,
    });

    return costHistoryId;
  },
});

/**
 * Internal function to update regional cost aggregates
 */
async function updateRegionalAggregates(
  ctx: any,
  data: {
    state: string;
    systemTypeId: any;
    serviceType: string;
    amount: number;
  }
) {
  // Find existing aggregate for this region/system/service type
  const existing = await ctx.db
    .query("regionalCostData")
    .withIndex("by_region_system", (q: any) =>
      q.eq("state", data.state).eq("systemTypeId", data.systemTypeId)
    )
    .filter((q: any) => q.eq(q.field("serviceType"), data.serviceType))
    .first();

  if (existing) {
    // Update existing aggregate
    const newCount = existing.sampleCount + 1;
    const newAvg =
      (existing.avgCost * existing.sampleCount + data.amount) / newCount;
    const newMin = Math.min(existing.minCost, data.amount);
    const newMax = Math.max(existing.maxCost, data.amount);

    await ctx.db.patch(existing._id, {
      avgCost: Math.round(newAvg),
      minCost: newMin,
      maxCost: newMax,
      sampleCount: newCount,
      lastUpdated: Date.now(),
    });
  } else {
    // Create new aggregate
    await ctx.db.insert("regionalCostData", {
      state: data.state,
      systemTypeId: data.systemTypeId,
      serviceType: data.serviceType as any,
      avgCost: data.amount,
      minCost: data.amount,
      maxCost: data.amount,
      sampleCount: 1,
      lastUpdated: Date.now(),
    });
  }
}

/**
 * Get regional cost data for a system type
 */
export const getRegionalCostData = query({
  args: {
    systemTypeId: v.id("systemTypes"),
    state: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    let query = ctx.db
      .query("regionalCostData")
      .withIndex("by_system_type", (q) => q.eq("systemTypeId", args.systemTypeId));

    if (args.state) {
      query = ctx.db
        .query("regionalCostData")
        .withIndex("by_region_system", (q) =>
          q.eq("state", args.state!).eq("systemTypeId", args.systemTypeId)
        );
    }

    const data = await query.collect();

    return {
      byServiceType: data.reduce(
        (acc, d) => {
          acc[d.serviceType] = {
            avgCost: d.avgCost,
            minCost: d.minCost,
            maxCost: d.maxCost,
            sampleCount: d.sampleCount,
          };
          return acc;
        },
        {} as Record<string, any>
      ),
      totalSamples: data.reduce((sum, d) => sum + d.sampleCount, 0),
    };
  },
});

/**
 * Get cost trends over time for ML analysis
 */
export const getCostTrends = query({
  args: {
    systemTypeId: v.optional(v.id("systemTypes")),
    state: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Get user profile
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile) return [];

    // Users can only see their own data
    const homes = await ctx.db
      .query("homes")
      .withIndex("by_owner", (q) => q.eq("ownerId", profile._id))
      .collect();

    const homeIds = homes.map((h) => h._id);
    
    let data = await ctx.db.query("costHistory").take(500);
    data = data.filter((d) => homeIds.includes(d.homeId));

    if (args.systemTypeId) {
      data = data.filter((d) => d.systemTypeId === args.systemTypeId);
    }
    if (args.state) {
      data = data.filter((d) => d.state === args.state);
    }
    if (args.startDate) {
      data = data.filter((d) => d.serviceDate >= args.startDate!);
    }
    if (args.endDate) {
      data = data.filter((d) => d.serviceDate <= args.endDate!);
    }

    // Return anonymized data for ML training
    return data.slice(0, args.limit || 1000).map((d) => ({
      systemTypeId: d.systemTypeId,
      serviceType: d.serviceType,
      costType: d.costType,
      amount: d.amount,
      wasDiy: d.wasDiy,
      state: d.state,
      climateZone: d.climateZone,
      homeAge: d.homeAge,
      serviceDate: d.serviceDate,
    }));
  },
});

/**
 * Get regional cost multiplier for a location
 */
export const getRegionalMultiplier = query({
  args: {
    state: v.string(),
    systemCategory: v.string(),
  },
  handler: async (ctx, args) => {
    const multiplier = await ctx.db
      .query("regionalCostMultipliers")
      .withIndex("by_state_category", (q) =>
        q.eq("state", args.state).eq("systemCategory", args.systemCategory as any)
      )
      .first();

    if (multiplier) {
      return {
        multiplier: multiplier.multiplier,
        laborMultiplier: multiplier.laborMultiplier,
        partsMultiplier: multiplier.partsMultiplier,
        confidence: multiplier.confidence || "low",
      };
    }

    // Default to 1.0 (national average) if no data
    return {
      multiplier: 1.0,
      laborMultiplier: 1.0,
      partsMultiplier: 1.0,
      confidence: "low" as const,
    };
  },
});

/**
 * Record lifecycle data when a system is replaced
 */
export const recordLifecycleData = mutation({
  args: {
    systemTypeId: v.id("systemTypes"),
    state: v.string(),
    climateZone: v.optional(v.number()),
    actualLifespanYears: v.number(),
    predictedLifespanYears: v.number(),
    installYear: v.number(),
    failureYear: v.number(),
    failureReason: v.optional(v.string()),
    maintenanceFrequency: v.optional(v.string()),
    totalMaintenanceCost: v.optional(v.number()),
    homeAge: v.optional(v.number()),
    waterHardness: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("lifecycleData", {
      ...args,
      recordedAt: Date.now(),
    });
  },
});

/**
 * Get lifecycle statistics for a system type
 */
export const getLifecycleStats = query({
  args: {
    systemTypeId: v.id("systemTypes"),
    state: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    let data = await ctx.db
      .query("lifecycleData")
      .withIndex("by_system_type", (q) => q.eq("systemTypeId", args.systemTypeId))
      .collect();

    if (args.state) {
      data = data.filter((d) => d.state === args.state);
    }

    if (data.length === 0) {
      return null;
    }

    const lifespans = data.map((d) => d.actualLifespanYears);
    const avgLifespan = lifespans.reduce((a, b) => a + b, 0) / lifespans.length;
    const minLifespan = Math.min(...lifespans);
    const maxLifespan = Math.max(...lifespans);

    // Group by maintenance frequency
    const byMaintenance = data.reduce(
      (acc, d) => {
        const freq = d.maintenanceFrequency || "unknown";
        if (!acc[freq]) acc[freq] = [];
        acc[freq].push(d.actualLifespanYears);
        return acc;
      },
      {} as Record<string, number[]>
    );

    const maintenanceImpact = Object.entries(byMaintenance).map(([freq, lifespans]) => ({
      frequency: freq,
      avgLifespan: lifespans.reduce((a, b) => a + b, 0) / lifespans.length,
      sampleCount: lifespans.length,
    }));

    return {
      avgLifespan: Math.round(avgLifespan * 10) / 10,
      minLifespan,
      maxLifespan,
      sampleCount: data.length,
      maintenanceImpact,
    };
  },
});

/**
 * Export cost data for ML training (Pro+ users only)
 */
export const exportMLTrainingData = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || profile.tier === "free") {
      throw new Error("Pro+ tier required for data export");
    }

    // Get user's homes and filter cost history to their data only
    const homes = await ctx.db
      .query("homes")
      .withIndex("by_owner", (q) => q.eq("ownerId", profile._id))
      .collect();
    const homeIds = homes.map((h) => h._id);

    // Get cost history (filtered to user's homes)
    let costData = await ctx.db.query("costHistory").take(500);
    costData = costData.filter((d) => homeIds.includes(d.homeId));
    if (args.startDate) {
      costData = costData.filter((d) => d.serviceDate >= args.startDate!);
    }
    if (args.endDate) {
      costData = costData.filter((d) => d.serviceDate <= args.endDate!);
    }

    // Get lifecycle data
    const lifecycleData = await ctx.db.query("lifecycleData").take(200);

    // Get regional aggregates
    const regionalData = await ctx.db.query("regionalCostData").take(200);

    return {
      costHistory: costData.map((d) => ({
        systemTypeId: d.systemTypeId,
        serviceType: d.serviceType,
        amount: d.amount,
        wasDiy: d.wasDiy,
        state: d.state,
        climateZone: d.climateZone,
        homeAge: d.homeAge,
        homeSquareFootage: d.homeSquareFootage,
        serviceDate: d.serviceDate,
      })),
      lifecycleData: lifecycleData.map((d) => ({
        systemTypeId: d.systemTypeId,
        state: d.state,
        climateZone: d.climateZone,
        actualLifespanYears: d.actualLifespanYears,
        predictedLifespanYears: d.predictedLifespanYears,
        maintenanceFrequency: d.maintenanceFrequency,
        homeAge: d.homeAge,
        waterHardness: d.waterHardness,
      })),
      regionalAggregates: regionalData,
      exportedAt: Date.now(),
      recordCount: {
        costs: costData.length,
        lifecycle: lifecycleData.length,
        regional: regionalData.length,
      },
    };
  },
});
