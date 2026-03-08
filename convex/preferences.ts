import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Get user maintenance preferences for a home
 */
export const getPreferences = query({
  args: {
    homeId: v.id("homes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile) return null;

    const prefs = await ctx.db
      .query("userMaintenancePreferences")
      .withIndex("by_user_home", (q) =>
        q.eq("userId", profile._id).eq("homeId", args.homeId)
      )
      .first();

    // Return defaults if no preferences exist
    if (!prefs) {
      return {
        focusSystemIds: [],
        hiddenSystemIds: [],
        defaultDetailLevel: "summary" as const,
        showSeasonalBadges: true,
        showCostEstimates: true,
        showDifficultyIndicators: true,
        showAgeAlerts: true,
        reminderDaysBefore: 7,
        seasonalReminders: true,
      };
    }

    return prefs;
  },
});

/**
 * Update user maintenance preferences
 */
export const updatePreferences = mutation({
  args: {
    homeId: v.id("homes"),
    focusSystemIds: v.optional(v.array(v.id("systems"))),
    hiddenSystemIds: v.optional(v.array(v.id("systems"))),
    defaultDetailLevel: v.optional(
      v.union(v.literal("summary"), v.literal("standard"), v.literal("expert"))
    ),
    showSeasonalBadges: v.optional(v.boolean()),
    showCostEstimates: v.optional(v.boolean()),
    showDifficultyIndicators: v.optional(v.boolean()),
    showAgeAlerts: v.optional(v.boolean()),
    reminderDaysBefore: v.optional(v.number()),
    seasonalReminders: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile) throw new Error("Profile not found");

    // Check for existing preferences
    const existing = await ctx.db
      .query("userMaintenancePreferences")
      .withIndex("by_user_home", (q) =>
        q.eq("userId", profile._id).eq("homeId", args.homeId)
      )
      .first();

    const { homeId, ...updates } = args;

    if (existing) {
      // Update existing preferences
      await ctx.db.patch(existing._id, updates);
      return existing._id;
    } else {
      // Create new preferences with defaults
      const newPrefs = await ctx.db.insert("userMaintenancePreferences", {
        userId: profile._id,
        homeId: args.homeId,
        focusSystemIds: args.focusSystemIds ?? [],
        hiddenSystemIds: args.hiddenSystemIds ?? [],
        defaultDetailLevel: args.defaultDetailLevel ?? "summary",
        showSeasonalBadges: args.showSeasonalBadges ?? true,
        showCostEstimates: args.showCostEstimates ?? true,
        showDifficultyIndicators: args.showDifficultyIndicators ?? true,
        showAgeAlerts: args.showAgeAlerts ?? true,
        reminderDaysBefore: args.reminderDaysBefore ?? 7,
        seasonalReminders: args.seasonalReminders ?? true,
      });
      return newPrefs;
    }
  },
});

/**
 * Set focus systems (quick update for system focus)
 */
export const setFocusSystems = mutation({
  args: {
    homeId: v.id("homes"),
    systemIds: v.array(v.id("systems")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile) throw new Error("Profile not found");

    const existing = await ctx.db
      .query("userMaintenancePreferences")
      .withIndex("by_user_home", (q) =>
        q.eq("userId", profile._id).eq("homeId", args.homeId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { focusSystemIds: args.systemIds });
    } else {
      await ctx.db.insert("userMaintenancePreferences", {
        userId: profile._id,
        homeId: args.homeId,
        focusSystemIds: args.systemIds,
        hiddenSystemIds: [],
        defaultDetailLevel: "summary",
        showSeasonalBadges: true,
        showCostEstimates: true,
        showDifficultyIndicators: true,
        showAgeAlerts: true,
        reminderDaysBefore: 7,
        seasonalReminders: true,
      });
    }
  },
});

/**
 * Get current season for seasonal filtering
 */
export function getCurrentSeason(): "spring" | "summer" | "fall" | "winter" {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "fall";
  return "winter";
}
