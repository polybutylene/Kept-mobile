import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) return null;

    const state = await ctx.db
      .query("gamificationState")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!state) {
      // Initialize gamification state
      const newState = await ctx.db.insert("gamificationState", {
        userId: user._id,
        healthPoints: 1000,
        level: 1,
        streakDays: 0,
        longestStreak: 0,
        totalTasksCompleted: 0,
        totalPointsEarned: 0,
        achievements: [],
        tier: "pristine",
      });
      return await ctx.db.get(newState);
    }

    return state;
  },
});

export const logAction = mutation({
  args: {
    action: v.union(
      v.literal("task_completed_on_time"),
      v.literal("task_completed_late"),
      v.literal("seasonal_checklist_done"),
      v.literal("system_documented"),
      v.literal("pro_service_logged"),
      v.literal("daily_check_in"),
      v.literal("task_overdue"),
      v.literal("system_elevated_risk"),
      v.literal("system_critical_risk"),
      v.literal("advisory_dismissed")
    ),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) throw new Error("User not found");

    let state = await ctx.db
      .query("gamificationState")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!state) {
      const stateId = await ctx.db.insert("gamificationState", {
        userId: user._id,
        healthPoints: 1000,
        level: 1,
        streakDays: 0,
        longestStreak: 0,
        totalTasksCompleted: 0,
        totalPointsEarned: 0,
        achievements: [],
        tier: "pristine",
      });
      state = (await ctx.db.get(stateId))!;
    }

    // Calculate point changes
    const pointMap: Record<string, number> = {
      task_completed_on_time: 50,
      task_completed_late: 25,
      seasonal_checklist_done: 100,
      system_documented: 75,
      pro_service_logged: 30,
      daily_check_in: 10,
      task_overdue: -5,
      system_elevated_risk: -20,
      system_critical_risk: -50,
      advisory_dismissed: -10,
    };

    const pointChange = pointMap[args.action] ?? 0;
    const newPoints = Math.max(0, Math.min(1000, state.healthPoints + pointChange));

    // Determine tier
    let tier: "pristine" | "well_kept" | "needs_attention" | "at_risk" | "critical";
    if (newPoints >= 900) tier = "pristine";
    else if (newPoints >= 700) tier = "well_kept";
    else if (newPoints >= 500) tier = "needs_attention";
    else if (newPoints >= 300) tier = "at_risk";
    else tier = "critical";

    // Update streak for positive actions
    let streakDays = state.streakDays;
    let longestStreak = state.longestStreak;
    let totalTasksCompleted = state.totalTasksCompleted;
    const totalPointsEarned = pointChange > 0
      ? state.totalPointsEarned + pointChange
      : state.totalPointsEarned;

    if (args.action === "task_completed_on_time" || args.action === "task_completed_late") {
      totalTasksCompleted += 1;

      const today = new Date().toISOString().split("T")[0];
      if (state.lastDailyCheckIn !== today) {
        streakDays += 1;
        longestStreak = Math.max(longestStreak, streakDays);
      }
    }

    // Check for achievements
    const achievements = [...(state.achievements ?? [])];
    if (totalTasksCompleted === 1 && !achievements.includes("first_task")) {
      achievements.push("first_task");
    }
    if (totalTasksCompleted >= 10 && !achievements.includes("ten_tasks")) {
      achievements.push("ten_tasks");
    }
    if (totalTasksCompleted >= 50 && !achievements.includes("fifty_tasks")) {
      achievements.push("fifty_tasks");
    }
    if (streakDays >= 7 && !achievements.includes("week_streak")) {
      achievements.push("week_streak");
    }
    if (streakDays >= 30 && !achievements.includes("month_streak")) {
      achievements.push("month_streak");
    }

    const level = Math.floor(totalPointsEarned / 500) + 1;

    await ctx.db.patch(state._id, {
      healthPoints: newPoints,
      level,
      streakDays,
      longestStreak,
      totalTasksCompleted,
      totalPointsEarned,
      tier,
      achievements,
      lastDailyCheckIn: new Date().toISOString().split("T")[0],
    });

    return { pointChange, newPoints, tier, achievements };
  },
});
