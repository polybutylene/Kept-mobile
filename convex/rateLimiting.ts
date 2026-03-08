import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const checkRateLimit = query({
  args: {
    action: v.string(),
    limit: v.number(),
    windowMs: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { allowed: true, remaining: args.limit, resetsAt: 0 };

    const userId = identity.subject;
    const windowStart = Date.now() - args.windowMs;

    const recentActions = await ctx.db
      .query("rateLimits")
      .withIndex("by_userId_action", (q) =>
        q.eq("userId", userId).eq("action", args.action)
      )
      .filter((q) => q.gte(q.field("timestamp"), windowStart))
      .collect();

    return {
      allowed: recentActions.length < args.limit,
      remaining: Math.max(0, args.limit - recentActions.length),
      resetsAt: windowStart + args.windowMs,
      current: recentActions.length,
    };
  },
});

export const recordAction = mutation({
  args: {
    action: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    await ctx.db.insert("rateLimits", {
      userId: identity.subject,
      action: args.action,
      timestamp: Date.now(),
    });
  },
});

export const enforceRateLimit = mutation({
  args: {
    action: v.string(),
    limit: v.number(),
    windowMs: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;
    const windowStart = Date.now() - args.windowMs;

    const recentActions = await ctx.db
      .query("rateLimits")
      .withIndex("by_userId_action", (q) =>
        q.eq("userId", userId).eq("action", args.action)
      )
      .filter((q) => q.gte(q.field("timestamp"), windowStart))
      .collect();

    if (recentActions.length >= args.limit) {
      throw new Error(
        `Rate limit exceeded for ${args.action}. Limit: ${args.limit} per ${Math.round(args.windowMs / 60000)} minutes. Try again later.`
      );
    }

    await ctx.db.insert("rateLimits", {
      userId,
      action: args.action,
      timestamp: Date.now(),
    });

    return {
      allowed: true,
      remaining: args.limit - recentActions.length - 1,
    };
  },
});

export const cleanupExpiredLimits = mutation({
  args: {},
  handler: async (ctx) => {
    const oneDayAgo = Date.now() - 86_400_000;
    const expired = await ctx.db
      .query("rateLimits")
      .withIndex("by_timestamp", (q) => q.lt("timestamp", oneDayAgo))
      .take(500);

    for (const record of expired) {
      await ctx.db.delete(record._id);
    }

    return { deleted: expired.length };
  },
});
