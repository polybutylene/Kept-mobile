import { query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const generateAnnualReport = internalMutation({
  args: {
    userId: v.id("users"),
    homeId: v.id("homes"),
    year: v.number(),
  },
  handler: async (ctx, args) => {
    const startOfYear = new Date(args.year, 0, 1).getTime();
    const endOfYear = new Date(args.year, 11, 31, 23, 59, 59).getTime();

    const home = await ctx.db.get(args.homeId);
    if (!home) throw new Error("Home not found");

    const systems = await ctx.db
      .query("systems")
      .withIndex("by_home_active", (q) =>
        q.eq("homeId", args.homeId).eq("isArchived", false),
      )
      .take(100);

    const tasks = await ctx.db
      .query("scheduledMaintenance")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .take(500);

    const yearTasks = tasks.filter(
      (t) =>
        t.dueDate &&
        new Date(t.dueDate).getTime() >= startOfYear &&
        new Date(t.dueDate).getTime() <= endOfYear,
    );

    const completedTasks = yearTasks.filter(
      (t) => t.status === "completed",
    );

    const timeline = await ctx.db
      .query("timelineEvents")
      .withIndex("by_homeId_timestamp", (q) =>
        q
          .eq("homeId", args.homeId)
          .gte("timestamp", startOfYear)
          .lte("timestamp", endOfYear),
      )
      .take(500);

    const totalSpent = timeline
      .filter((e) => e.cost && e.cost > 0 && e.costType !== "diy_savings")
      .reduce((sum, e) => sum + (e.cost ?? 0), 0);

    const diySavings = timeline
      .filter((e) => e.costType === "diy_savings")
      .reduce((sum, e) => sum + (e.cost ?? 0), 0);

    const receipts = await ctx.db
      .query("serviceReceipts")
      .withIndex("by_homeId", (q) => q.eq("homeId", args.homeId))
      .take(200);
    const yearReceipts = receipts.filter(
      (r) => r.date >= startOfYear && r.date <= endOfYear,
    );
    const receiptTotal = yearReceipts.reduce(
      (sum, r) => sum + r.amount,
      0,
    );

    const currentYear = new Date().getFullYear();
    const oldestSystem = systems.reduce(
      (oldest, sys) => {
        const age = sys.installDate
          ? currentYear - new Date(sys.installDate).getFullYear()
          : 0;
        return age > (oldest?.age ?? 0)
          ? { name: sys.name ?? "Unknown", age }
          : oldest;
      },
      null as { name: string; age: number } | null,
    );

    const reportData = {
      year: args.year,
      propertyName: home.name ?? home.addressLine1 ?? "My Home",
      tasksCompleted: completedTasks.length,
      tasksTotal: yearTasks.length,
      completionRate:
        yearTasks.length > 0
          ? Math.round(
              (completedTasks.length / yearTasks.length) * 100,
            )
          : 0,
      totalSpent: Math.round(totalSpent + receiptTotal),
      diySavings: Math.round(diySavings),
      systemsTracked: systems.length,
      oldestSystem,
      healthScoreEnd: home.overallHealthScore ?? 0,
      timelineEventCount: timeline.length,
      documentsUploaded: timeline.filter(
        (e) => e.eventType === "document_uploaded",
      ).length,
    };

    const existing = await ctx.db
      .query("annualReports")
      .withIndex("by_homeId_year", (q) =>
        q.eq("homeId", args.homeId).eq("year", args.year),
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        reportData,
        generatedAt: Date.now(),
      });
      return existing._id;
    }

    const shareToken =
      Math.random().toString(36).substring(2) +
      Math.random().toString(36).substring(2);

    return await ctx.db.insert("annualReports", {
      userId: args.userId,
      homeId: args.homeId,
      year: args.year,
      reportData,
      shareToken,
      shareExpiresAt: Date.now() + 90 * 24 * 60 * 60 * 1000,
      generatedAt: Date.now(),
    });
  },
});

export const getAnnualReport = query({
  args: {
    homeId: v.id("homes"),
    year: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("annualReports")
      .withIndex("by_homeId_year", (q) =>
        q.eq("homeId", args.homeId).eq("year", args.year),
      )
      .first();
  },
});

export const getReportByShareToken = query({
  args: { shareToken: v.string() },
  handler: async (ctx, args) => {
    const report = await ctx.db
      .query("annualReports")
      .withIndex("by_shareToken", (q) =>
        q.eq("shareToken", args.shareToken),
      )
      .first();

    if (!report) return null;
    if (report.shareExpiresAt && report.shareExpiresAt < Date.now())
      return null;

    return report;
  },
});

export const getUserReports = query({
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
      .query("annualReports")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(20);
  },
});
