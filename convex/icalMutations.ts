import { v } from "convex/values";
import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

export const insertFeed = internalMutation({
  args: {
    homeId: v.id("homes"),
    ownerId: v.id("userProfiles"),
    platformName: v.string(),
    feedUrl: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("icalFeeds", {
      homeId: args.homeId,
      ownerId: args.ownerId,
      platformName: args.platformName,
      feedUrl: args.feedUrl,
      syncIntervalMinutes: 240,
      isActive: true,
    });
  },
});

export const getFeed = internalQuery({
  args: { feedId: v.id("icalFeeds") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.feedId);
  },
});

export const updateFeedStatus = internalMutation({
  args: {
    feedId: v.id("icalFeeds"),
    status: v.union(v.literal("success"), v.literal("error")),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.feedId, {
      lastSyncedAt: Date.now(),
      lastSyncStatus: args.status,
      lastSyncError: args.error,
    });
  },
});

export const getActiveFeeds = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("icalFeeds")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

export const getFeedsForHome = query({
  args: { homeId: v.id("homes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("icalFeeds")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .collect();
  },
});

export const getAllFeeds = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const profile = await ctx.db.query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId)).first();
    if (!profile) return [];
    const homes = await ctx.db.query("homes")
      .withIndex("by_owner_active", (q) => q.eq("ownerId", profile._id).eq("isArchived", false))
      .collect();
    const feeds = [];
    for (const home of homes) {
      const homeFeeds = await ctx.db.query("icalFeeds")
        .withIndex("by_home", (q) => q.eq("homeId", home._id))
        .collect();
      for (const feed of homeFeeds) {
        feeds.push({ ...feed, homeName: home.name || home.addressLine1 });
      }
    }
    return feeds;
  },
});

export const removeFeed = mutation({
  args: { feedId: v.id("icalFeeds") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.patch(args.feedId, { isActive: false });
  },
});

export const addIcalFeed = mutation({
  args: {
    homeId: v.id("homes"),
    platformName: v.string(),
    feedUrl: v.string(),
    ownerId: v.optional(v.id("userProfiles")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    let ownerId = args.ownerId;
    if (!ownerId) {
      const profile = await ctx.db
        .query("userProfiles")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .first();
      if (!profile) throw new Error("Profile not found");
      ownerId = profile._id;
    }

    const feedId = await ctx.db.insert("icalFeeds", {
      homeId: args.homeId,
      ownerId,
      platformName: args.platformName,
      feedUrl: args.feedUrl,
      syncIntervalMinutes: 15,
      isActive: true,
    });
    await ctx.scheduler.runAfter(0, internal.ical.syncFeedAction, { feedId });
    return feedId;
  },
});
