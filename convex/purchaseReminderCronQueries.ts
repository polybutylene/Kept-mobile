import { internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const getUpcomingTasks = internalQuery({
  args: { from: v.number(), to: v.number() },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("scheduledMaintenance")
      .collect();

    return tasks.filter((t) => {
      if (t.status === "completed" || t.status === "skipped") return false;
      if (!t.dueDate) return false;
      const dueMs = new Date(t.dueDate).getTime();
      return dueMs >= args.from && dueMs <= args.to;
    });
  },
});

export const getHomeOwner = internalQuery({
  args: { homeId: v.id("homes") },
  handler: async (ctx, args) => {
    const home = await ctx.db.get(args.homeId);
    if (!home) return null;

    const profile = await ctx.db.get(home.ownerId);
    if (!profile) return null;

    return {
      profileId: profile._id,
      userId: profile.userId,
      tier: profile.tier,
    };
  },
});

export const getExistingReminder = internalQuery({
  args: { taskId: v.id("scheduledMaintenance") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("purchaseReminders")
      .withIndex("by_taskId", (q) => q.eq("taskId", args.taskId))
      .first();
  },
});

export const getProductsForTaskType = internalQuery({
  args: { taskType: v.string() },
  handler: async (ctx, args) => {
    const links = await ctx.db
      .query("taskProductLinks")
      .withIndex("by_taskType", (q) => q.eq("taskType", args.taskType))
      .collect();

    if (links.length === 0) return [];

    const allProducts = await ctx.db.query("careKitProducts").collect();
    const matched: any[] = [];

    for (const link of links) {
      for (const prodId of link.productIds) {
        const p = allProducts.find((pr) => pr.productId === prodId);
        if (p && p.isActive) matched.push(p);
      }
    }

    return matched;
  },
});

export const createReminder = internalMutation({
  args: {
    userId: v.id("users"),
    taskId: v.id("scheduledMaintenance"),
    productId: v.string(),
    purchaseUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("purchaseReminders", {
      userId: args.userId,
      taskId: args.taskId,
      productId: args.productId,
      reminderDate: Date.now(),
      status: "sent",
      purchaseUrl: args.purchaseUrl,
      sentAt: Date.now(),
    });
  },
});
