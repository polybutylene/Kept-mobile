import { internalMutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";

export const getReadyPosts = internalQuery({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const scheduled = await ctx.db
      .query("socialPosts")
      .withIndex("by_status", (q) => q.eq("status", "scheduled"))
      .collect();

    return scheduled.filter(
      (p) => p.scheduledFor !== undefined && p.scheduledFor <= now
    );
  },
});

export const markPublished = internalMutation({
  args: { postId: v.id("socialPosts") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.postId, {
      status: "published",
      publishedAt: Date.now(),
    });
  },
});

export const markFailed = internalMutation({
  args: { postId: v.id("socialPosts") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.postId, {
      status: "failed",
    });
  },
});
