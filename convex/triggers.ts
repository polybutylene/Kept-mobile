import { internalMutation, internalAction, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

// ════════════════════════════════════════════════════════════════════════
// HELPER: Enqueue an agent workflow
// ════════════════════════════════════════════════════════════════════════

export const enqueueWorkflow = internalMutation({
  args: {
    userId: v.id("users"),
    homeId: v.optional(v.id("homes")),
    triggerType: v.string(),
    triggerDetails: v.any(),
  },
  handler: async (ctx, args) => {
    const workflowId = await ctx.db.insert("agentWorkflows", {
      userId: args.userId,
      homeId: args.homeId,
      triggerType: args.triggerType as Doc<"agentWorkflows">["triggerType"],
      triggerDetails: args.triggerDetails,
      status: "queued",
      createdAt: Date.now(),
    });
    // Immediately schedule the agent engine to process this workflow
    await ctx.scheduler.runAfter(0, internal.agent.engine.run, { workflowId });
    return workflowId;
  },
});

// ════════════════════════════════════════════════════════════════════════
// BATCH QUERY: Collect all forecast data in one pass
// ════════════════════════════════════════════════════════════════════════

export const getAllForecastsWithSystems = internalQuery({
  args: {},
  handler: async (ctx) => {
    // Pull all forecastResults (the actual table name in our schema)
    const forecasts = await ctx.db.query("forecastResults").collect();

    // Batch-load associated systems
    const systemIds = [...new Set(forecasts.map((f) => f.systemId))];
    const systems = await Promise.all(
      systemIds.map((id) => ctx.db.get(id))
    );
    const systemMap: Record<string, Doc<"systems">> = {};
    for (const s of systems) {
      if (s) systemMap[s._id] = s;
    }

    // Batch-load associated homes
    const homeIds = [...new Set(
      Object.values(systemMap).map((s) => s.homeId)
    )];
    const homes = await Promise.all(homeIds.map((id) => ctx.db.get(id)));
    const homeMap: Record<string, Doc<"homes">> = {};
    for (const h of homes) {
      if (h) homeMap[h._id] = h;
    }

    return { forecasts, systemMap, homeMap };
  },
});

// ════════════════════════════════════════════════════════════════════════
// DAILY FORECAST SWEEP
// Checks all forecasts for cumulative failure probability threshold
// crossings and enqueues agent workflows for each one.
// ════════════════════════════════════════════════════════════════════════

const THRESHOLDS = [0.40, 0.60, 0.75, 0.90] as const;

function findCrossedThreshold(
  cfp: number,
  lastThreshold: number | undefined
): number | null {
  const currentThreshold = lastThreshold ?? 0;
  for (const t of THRESHOLDS) {
    if (cfp >= t && currentThreshold < t) {
      return t;
    }
  }
  return null;
}

export const dailyForecastSweep = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log("[dailyForecastSweep] Starting batch forecast check");
    const { forecasts, systemMap, homeMap } = await ctx.runQuery(
      internal.triggers.getAllForecastsWithSystems
    );

    const crossings: Array<{
      forecast: Doc<"forecastResults">;
      system: Doc<"systems">;
      home: Doc<"homes">;
      threshold: number;
    }> = [];

    for (const forecast of forecasts) {
      const system = systemMap[forecast.systemId];
      if (!system) continue;
      const home = homeMap[system.homeId];
      if (!home) continue;

      // Use cumulativeFailureProbability if present, otherwise derive from
      // failureProbabilityNext5Years as a reasonable proxy
      const cfp = forecast.cumulativeFailureProbability
        ?? forecast.failureProbabilityNext5Years
        ?? 0;

      const crossed = findCrossedThreshold(cfp, forecast.nextThreshold);
      if (crossed !== null) {
        crossings.push({ forecast, system, home, threshold: crossed });
      }
    }

    console.log(`[dailyForecastSweep] Found ${crossings.length} threshold crossings`);

    for (const { forecast, system, home, threshold } of crossings) {
      // Mark this threshold as processed so it won't fire again
      await ctx.runMutation(internal.triggers.markThresholdProcessed, {
        forecastId: forecast._id,
        nextThreshold: THRESHOLDS[THRESHOLDS.indexOf(threshold as typeof THRESHOLDS[number]) + 1] ?? 1.0,
      });

      // Enqueue agent workflow — userId comes from home
      if (home.userId) {
        await ctx.runMutation(internal.triggers.enqueueWorkflow, {
          userId: home.userId,
          homeId: home._id,
          triggerType: "forecastThresholdCrossed",
          triggerDetails: {
            systemId: system._id,
            forecastId: forecast._id,
            thresholdCrossed: threshold,
          },
        });
      }
    }

    console.log(`[dailyForecastSweep] Complete. Enqueued ${crossings.length} workflows.`);
  },
});

export const markThresholdProcessed = internalMutation({
  args: {
    forecastId: v.id("forecastResults"),
    nextThreshold: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.forecastId, { nextThreshold: args.nextThreshold });
  },
});

// ════════════════════════════════════════════════════════════════════════
// WEEKLY MAINTENANCE REVIEW
// Finds tasks overdue by >14 days and groups them by user for review.
// ════════════════════════════════════════════════════════════════════════

export const getOverdueTasks = internalQuery({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const overdueThresholdMs = 14 * 24 * 60 * 60 * 1000; // 14 days

    // Query all maintenance tasks and filter for significantly overdue ones
    const tasks = await ctx.db.query("maintenanceTasks").collect();
    const overdue = tasks.filter((t) => {
      if (!t.dueDate) return false;
      // dueDate is stored as a string (ISO format) in our schema
      const dueTimestamp = new Date(t.dueDate).getTime();
      return dueTimestamp < now - overdueThresholdMs && t.status !== "completed" && t.status !== "skipped";
    });

    // Batch-load systems
    const systemIds = [...new Set(overdue.map((t) => t.systemId).filter(Boolean))] as Id<"systems">[];
    const systems = await Promise.all(systemIds.map((id) => ctx.db.get(id)));
    const systemMap: Record<string, Doc<"systems">> = {};
    for (const s of systems) {
      if (s) systemMap[s._id] = s;
    }

    // Batch-load homes (tasks have homeId directly)
    const homeIds = [...new Set(overdue.map((t) => t.homeId))];
    const homes = await Promise.all(homeIds.map((id) => ctx.db.get(id)));
    const homeMap: Record<string, Doc<"homes">> = {};
    for (const h of homes) {
      if (h) homeMap[h._id] = h;
    }

    return { overdueTasks: overdue, systemMap, homeMap };
  },
});

export const weeklyMaintenanceReview = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log("[weeklyMaintenanceReview] Starting overdue task check");
    const { overdueTasks, homeMap } = await ctx.runQuery(
      internal.triggers.getOverdueTasks
    );

    // Group overdue tasks by user (via home → userId)
    const groupedByUser = new Map<
      string,
      Array<{ task: Doc<"maintenanceTasks">; homeId: Id<"homes"> }>
    >();

    for (const task of overdueTasks) {
      const home = homeMap[task.homeId];
      if (!home || !home.userId) continue;

      const userId = home.userId as string;
      if (!groupedByUser.has(userId)) groupedByUser.set(userId, []);
      groupedByUser.get(userId)!.push({ task, homeId: home._id });
    }

    console.log(`[weeklyMaintenanceReview] ${groupedByUser.size} users with overdue tasks`);

    for (const [userId, items] of groupedByUser) {
      const homeId = items[0].homeId;
      await ctx.runMutation(internal.triggers.enqueueWorkflow, {
        userId: userId as Id<"users">,
        homeId,
        triggerType: "maintenanceOverdue",
        triggerDetails: {
          metadata: {
            overdueTaskIds: items.map((i) => i.task._id),
            overdueCount: items.length,
          },
        },
      });
    }
  },
});

// ════════════════════════════════════════════════════════════════════════
// SEASONAL SWEEP
// Runs quarterly (Jan/Apr/Jul/Oct). Enqueues a seasonal review workflow
// for every active home.
// ════════════════════════════════════════════════════════════════════════

export const getAllHomesByUser = internalQuery({
  args: {},
  handler: async (ctx) => {
    const homes = await ctx.db.query("homes").collect();
    // Only include active, non-archived homes with a userId
    return homes.filter((h) => !h.isArchived && h.userId);
  },
});

export const seasonalSweep = internalAction({
  args: {},
  handler: async (ctx) => {
    const now = new Date();
    const quarter = Math.ceil((now.getMonth() + 1) / 3);
    const seasonLabel = ["winter", "spring", "summer", "fall"][quarter - 1];
    console.log(`[seasonalSweep] Starting ${seasonLabel} sweep (Q${quarter})`);

    const homes = await ctx.runQuery(internal.triggers.getAllHomesByUser);

    for (const home of homes) {
      if (!home.userId) continue;
      await ctx.runMutation(internal.triggers.enqueueWorkflow, {
        userId: home.userId,
        homeId: home._id,
        triggerType: "seasonalSweep",
        triggerDetails: {
          metadata: { season: seasonLabel, quarter, year: now.getFullYear() },
        },
      });
    }

    console.log(`[seasonalSweep] Enqueued ${homes.length} seasonal reviews`);
  },
});

// ════════════════════════════════════════════════════════════════════════
// COST DATA REFRESH
// Runs monthly on the 15th. Finds expired cost data entries and enqueues
// a single workflow to refresh them.
// ════════════════════════════════════════════════════════════════════════

export const getExpiredCostData = internalQuery({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db
      .query("costData")
      .withIndex("by_expiresAt")
      .filter((q) => q.lt(q.field("expiresAt"), now))
      .collect();

    const categories = [
      ...new Set(expired.map((c) => `${c.systemCategory}|${c.systemSubtype}|${c.region}`)),
    ];
    return { expiredIds: expired.map((e) => e._id), categories };
  },
});

export const costDataRefresh = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log("[costDataRefresh] Starting monthly cost data refresh");
    const { expiredIds, categories } = await ctx.runQuery(
      internal.triggers.getExpiredCostData
    );

    console.log(`[costDataRefresh] ${expiredIds.length} expired entries across ${categories.length} categories`);

    if (categories.length > 0) {
      // For the cost refresh workflow, we need a valid user ID.
      // Query the first admin/property_manager user, or fall back to the first user.
      const fallbackUser = await ctx.runQuery(internal.triggers.getSystemUser);
      if (fallbackUser) {
        await ctx.runMutation(internal.triggers.enqueueWorkflow, {
          userId: fallbackUser,
          triggerType: "costRefresh",
          triggerDetails: {
            metadata: {
              expiredCount: expiredIds.length,
              categories,
            },
          },
        });
      } else {
        console.log("[costDataRefresh] No users found, skipping workflow");
      }
    }

    console.log("[costDataRefresh] Complete");
  },
});

// Helper: find a system-level user for background workflows
export const getSystemUser = internalQuery({
  args: {},
  handler: async (ctx) => {
    // Prefer property_manager tier users for system-level tasks
    const users = await ctx.db.query("users").collect();
    const pm = users.find((u) => u.tier === "property_manager");
    if (pm) return pm._id;
    // Fall back to first available user
    return users[0]?._id ?? null;
  },
});

// ════════════════════════════════════════════════════════════════════════
// EXPIRE PENDING ACTIONS
// Runs nightly. Transitions stale pending agent actions to expired
// status, preventing action queue buildup.
// ════════════════════════════════════════════════════════════════════════

export const expirePendingActions = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db
      .query("pendingActions")
      .withIndex("by_expiresAt")
      .filter((q) =>
        q.and(
          q.lt(q.field("expiresAt"), now),
          q.eq(q.field("status"), "pending")
        )
      )
      .collect();

    for (const action of expired) {
      await ctx.db.patch(action._id, {
        status: "expired",
        resolvedAt: now,
      });
    }

    if (expired.length > 0) {
      console.log(`[expirePendingActions] Expired ${expired.length} pending actions`);
    }
  },
});
