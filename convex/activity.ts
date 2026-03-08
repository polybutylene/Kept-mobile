import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Get activity log for a user (for property managers)
 */
export const getUserActivity = query({
  args: {
    limit: v.optional(v.number()),
    homeId: v.optional(v.id("homes")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile) return [];

    let activities;

    if (args.homeId) {
      activities = await ctx.db
        .query("activityLog")
        .withIndex("by_home", (q) => q.eq("homeId", args.homeId!))
        .order("desc")
        .take(args.limit || 50);
    } else {
      activities = await ctx.db
        .query("activityLog")
        .withIndex("by_user", (q) => q.eq("userId", profile._id))
        .order("desc")
        .take(args.limit || 50);
    }

    // Enrich with home and task data
    const enriched = await Promise.all(
      activities.map(async (activity) => {
        const home = activity.homeId
          ? await ctx.db.get(activity.homeId)
          : null;
        const task = activity.taskId
          ? await ctx.db.get(activity.taskId)
          : null;
        const system = activity.systemId
          ? await ctx.db.get(activity.systemId)
          : null;

        return {
          ...activity,
          home,
          task,
          system,
        };
      })
    );

    return enriched;
  },
});

/**
 * Get activity grouped by date (for display)
 */
export const getActivityByDate = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile) return [];

    const activities = await ctx.db
      .query("activityLog")
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
      .order("desc")
      .take(args.limit || 100);

    // Group by date
    const grouped: Record<
      string,
      Array<{
        id: string;
        action: string;
        description: string;
        timestamp: number;
        homeName?: string;
      }>
    > = {};

    for (const activity of activities) {
      const date = new Date(activity._creationTime)
        .toISOString()
        .split("T")[0];

      if (!grouped[date]) {
        grouped[date] = [];
      }

      const home = activity.homeId
        ? await ctx.db.get(activity.homeId)
        : null;

      grouped[date].push({
        id: activity._id,
        action: activity.action,
        description: activity.description,
        timestamp: activity._creationTime,
        homeName: home?.name || home?.addressLine1,
      });
    }

    // Convert to array
    return Object.entries(grouped).map(([date, items]) => ({
      date,
      items,
    }));
  },
});
