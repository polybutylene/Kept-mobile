import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/// Save or update onboarding progress for a user.
export const saveProgress = mutation({
  args: {
    userId: v.id("users"),
    homeId: v.optional(v.id("homes")),
    completedCategories: v.array(v.string()),
    skippedCategories: v.array(v.string()),
    currentCategory: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if progress already exists for this user
    const existing = await ctx.db
      .query("onboardingProgress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        homeId: args.homeId,
        completedCategories: args.completedCategories,
        skippedCategories: args.skippedCategories,
        currentCategory: args.currentCategory,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("onboardingProgress", {
        userId: args.userId,
        homeId: args.homeId,
        completedCategories: args.completedCategories,
        skippedCategories: args.skippedCategories,
        currentCategory: args.currentCategory,
        isComplete: false,
        startedAt: Date.now(),
      });
    }
  },
});

/// Get onboarding progress for a user.
export const getProgress = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("onboardingProgress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

/// Mark onboarding as complete.
export const markComplete = mutation({
  args: {
    userId: v.id("users"),
    homeId: v.optional(v.id("homes")),
    completedCategories: v.array(v.string()),
    skippedCategories: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("onboardingProgress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        homeId: args.homeId,
        completedCategories: args.completedCategories,
        skippedCategories: args.skippedCategories,
        isComplete: true,
        completedAt: Date.now(),
        currentCategory: undefined,
      });
    } else {
      await ctx.db.insert("onboardingProgress", {
        userId: args.userId,
        homeId: args.homeId,
        completedCategories: args.completedCategories,
        skippedCategories: args.skippedCategories,
        currentCategory: undefined,
        isComplete: true,
        startedAt: Date.now(),
        completedAt: Date.now(),
      });
    }
  },
});
