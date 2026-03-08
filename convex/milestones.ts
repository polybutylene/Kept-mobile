import { query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

const MILESTONE_DEFS = [
  {
    type: "system_outlasted_median",
    icon: "🏆",
    template: (data: any) =>
      `Your ${data.systemName} just turned ${data.age} — outlasting ${data.percent}% of similar units in your area!`,
  },
  {
    type: "perfect_month",
    icon: "⭐",
    template: (data: any) =>
      `Perfect month! You completed all ${data.count} maintenance tasks on time in ${data.month}.`,
  },
  {
    type: "streak_milestone",
    icon: "🔥",
    template: (data: any) =>
      `${data.weeks}-week maintenance streak! You haven't missed a task since ${data.startDate}.`,
  },
  {
    type: "diy_savings_milestone",
    icon: "💰",
    template: (data: any) =>
      `You've saved $${data.amount} by doing maintenance yourself through Kept!`,
  },
  {
    type: "prevented_cost_milestone",
    icon: "🛡️",
    template: (data: any) =>
      `Kept estimates your preventive maintenance has avoided $${data.amount} in emergency repairs.`,
  },
  {
    type: "first_year_anniversary",
    icon: "🎂",
    template: () =>
      `Happy Kept-iversary! One year of smarter homeownership.`,
  },
  {
    type: "systems_milestone",
    icon: "📊",
    template: (data: any) =>
      `You're now tracking ${data.count} systems in Kept. Your home has never been this well-documented.`,
  },
];

export const createMilestone = internalMutation({
  args: {
    userId: v.id("users"),
    homeId: v.id("homes"),
    systemId: v.optional(v.id("systems")),
    milestoneType: v.string(),
    title: v.string(),
    description: v.string(),
    value: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const def = MILESTONE_DEFS.find((d) => d.type === args.milestoneType);

    const id = await ctx.db.insert("milestoneEvents", {
      userId: args.userId,
      homeId: args.homeId,
      systemId: args.systemId,
      milestoneType: args.milestoneType,
      title: args.title,
      description: args.description,
      icon: def?.icon ?? "🎉",
      value: args.value,
      isRead: false,
      isDismissed: false,
      createdAt: Date.now(),
    });

    await ctx.runMutation(internal.timeline.logEvent, {
      userId: args.userId,
      homeId: args.homeId,
      systemId: args.systemId,
      eventType: "milestone",
      title: args.title,
      description: args.description,
      icon: def?.icon ?? "🎉",
      color: "gold",
      performedBy: "system",
    });

    return id;
  },
});

export const getUnreadMilestones = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email!))
      .first();
    if (!user) return [];

    return await ctx.db
      .query("milestoneEvents")
      .withIndex("by_userId_unread", (q) =>
        q.eq("userId", user._id).eq("isRead", false),
      )
      .take(20);
  },
});

export const getMilestonesForHome = query({
  args: { homeId: v.id("homes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("milestoneEvents")
      .withIndex("by_homeId", (q) => q.eq("homeId", args.homeId))
      .order("desc")
      .take(50);
  },
});

export const markMilestoneRead = internalMutation({
  args: { milestoneId: v.id("milestoneEvents") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.milestoneId, { isRead: true });
  },
});

export const dismissMilestone = internalMutation({
  args: { milestoneId: v.id("milestoneEvents") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.milestoneId, {
      isRead: true,
      isDismissed: true,
    });
  },
});
