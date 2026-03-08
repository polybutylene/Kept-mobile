import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const logError = internalMutation({
  args: {
    functionName: v.string(),
    error: v.string(),
    stack: v.optional(v.string()),
    args: v.optional(v.string()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("errorLogs", {
      functionName: args.functionName,
      error: args.error,
      stack: args.stack,
      args: args.args,
      userId: args.userId,
      timestamp: Date.now(),
    });
  },
});

export const getRecentErrors = query({
  args: {
    limit: v.optional(v.number()),
    functionName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    if (args.functionName) {
      return await ctx.db
        .query("errorLogs")
        .withIndex("by_functionName", (q) =>
          q.eq("functionName", args.functionName!)
        )
        .order("desc")
        .take(limit);
    }

    return await ctx.db
      .query("errorLogs")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit);
  },
});

export const getErrorStats = query({
  args: {
    windowMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const windowMs = args.windowMs ?? 3_600_000;
    const since = Date.now() - windowMs;

    const errors = await ctx.db
      .query("errorLogs")
      .withIndex("by_timestamp")
      .order("desc")
      .take(1000);

    const recent = errors.filter((e) => e.timestamp >= since);
    const byFunction: Record<string, number> = {};
    for (const err of recent) {
      byFunction[err.functionName] = (byFunction[err.functionName] ?? 0) + 1;
    }

    const topErrors = Object.entries(byFunction)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([fn, count]) => ({ functionName: fn, count }));

    return {
      totalErrors: recent.length,
      windowMs,
      topErrors,
      errorRate: recent.length > 0
        ? `${recent.length} errors in last ${Math.round(windowMs / 60000)} minutes`
        : "No errors",
    };
  },
});

export const cleanupOldErrors = internalMutation({
  args: {},
  handler: async (ctx) => {
    const thirtyDaysAgo = Date.now() - 30 * 86_400_000;
    const old = await ctx.db
      .query("errorLogs")
      .withIndex("by_timestamp", (q) => q.lt("timestamp", thirtyDaysAgo))
      .take(500);

    for (const record of old) {
      await ctx.db.delete(record._id);
    }

    return { deleted: old.length };
  },
});
