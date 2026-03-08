import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { getProfileFromAuthId } from "./lib/permissions";
import { weatherAdvisorySeverity, weatherAdvisoryType } from "./schema";

export const getAdvisoriesForHome = query({
  args: {
    homeId: v.id("homes"),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) return [];

    const home = await ctx.db.get(args.homeId);
    if (!home || home.ownerId !== profile._id) return [];

    if (args.includeInactive) {
      return await ctx.db
        .query("weatherAdvisories")
        .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
        .order("desc")
        .collect();
    }

    return await ctx.db
      .query("weatherAdvisories")
      .withIndex("by_home_active", (q) =>
        q.eq("homeId", args.homeId).eq("isActive", true)
      )
      .order("desc")
      .collect();
  },
});

export const getAdvisoryBadge = query({
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

    const advisories = await ctx.db
      .query("weatherAdvisories")
      .withIndex("by_home_active", (q) =>
        q.eq("homeId", args.homeId).eq("isActive", true)
      )
      .collect();

    if (advisories.length === 0) return { count: 0, severity: null };

    const severityRank: Record<string, number> = {
      advisory: 1,
      watch: 2,
      warning: 3,
    };

    const highest = advisories.reduce((acc, adv) => {
      const rank = severityRank[adv.severity] || 0;
      return rank > acc.rank ? { severity: adv.severity, rank } : acc;
    }, { severity: "advisory", rank: 1 });

    return { count: advisories.length, severity: highest.severity };
  },
});

export const getNotificationPrefs = query({
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

    const prefs = await ctx.db
      .query("weatherNotificationPrefs")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .first();

    return prefs || { homeId: args.homeId, channels: ["email"] as const };
  },
});

export const updateNotificationPrefs = mutation({
  args: {
    homeId: v.id("homes"),
    channels: v.array(v.union(v.literal("email"), v.literal("sms"))),
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

    const existing = await ctx.db
      .query("weatherNotificationPrefs")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { channels: args.channels });
      return existing._id;
    }

    return await ctx.db.insert("weatherNotificationPrefs", {
      homeId: args.homeId,
      channels: args.channels,
    });
  },
});

export const upsertHomeAdvisories = internalMutation({
  args: {
    homeId: v.id("homes"),
    advisories: v.array(v.object({
      advisoryType: weatherAdvisoryType,
      severity: weatherAdvisorySeverity,
      title: v.string(),
      description: v.string(),
      startsAt: v.optional(v.number()),
      expiresAt: v.optional(v.number()),
      actions: v.array(v.object({
        actionId: v.string(),
        priority: v.union(
          v.literal("critical"),
          v.literal("high"),
          v.literal("medium"),
          v.literal("low")
        ),
        title: v.string(),
        description: v.string(),
        relatedSystemCategory: v.optional(v.union(
          v.literal("hvac"),
          v.literal("plumbing"),
          v.literal("electrical"),
          v.literal("appliances"),
          v.literal("structural"),
          v.literal("exterior")
        )),
        estimatedMinutes: v.optional(v.number()),
      })),
      source: v.union(v.literal("forecast"), v.literal("alert")),
    })),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const existing = await ctx.db
      .query("weatherAdvisories")
      .withIndex("by_home_active", (q) =>
        q.eq("homeId", args.homeId).eq("isActive", true)
      )
      .collect();

    for (const adv of existing) {
      await ctx.db.patch(adv._id, { isActive: false });
    }

    const inserted = [];
    for (const advisory of args.advisories) {
      const id = await ctx.db.insert("weatherAdvisories", {
        homeId: args.homeId,
        advisoryType: advisory.advisoryType,
        severity: advisory.severity,
        title: advisory.title,
        description: advisory.description,
        startsAt: advisory.startsAt,
        expiresAt: advisory.expiresAt,
        actions: advisory.actions,
        source: advisory.source,
        createdAt: now,
        isActive: true,
      });
      inserted.push(id);
    }

    return inserted;
  },
});
