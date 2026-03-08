import { internalMutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";

export const storePost = internalMutation({
  args: {
    platform: v.union(v.literal("facebook"), v.literal("instagram"), v.literal("x")),
    content: v.string(),
    hashtags: v.array(v.string()),
    mediaPrompt: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("scheduled"), v.literal("published"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("socialPosts", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getContentCalendar = internalQuery({
  args: {},
  handler: async (ctx) => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekOf = weekStart.toISOString().split("T")[0];

    const calendar = await ctx.db
      .query("contentCalendar")
      .withIndex("by_weekOf", (q) => q.eq("weekOf", weekOf))
      .first();

    return calendar?.theme ?? null;
  },
});

export const getDraftPosts = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("socialPosts")
      .withIndex("by_status", (q) => q.eq("status", "draft"))
      .collect();
  },
});

export const updatePostSchedule = internalMutation({
  args: {
    postId: v.id("socialPosts"),
    scheduledFor: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.postId, {
      scheduledFor: args.scheduledFor,
      status: "scheduled",
    });
  },
});
