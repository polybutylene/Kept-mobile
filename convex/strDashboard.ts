import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc } from "./_generated/dataModel";

/**
 * Get portfolio overview for STR dashboard — aggregates health, costs, alerts
 */
export const getPortfolioOverview = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile) return null;

    const homes = await ctx.db
      .query("homes")
      .withIndex("by_owner_active", (q) =>
        q.eq("ownerId", profile._id).eq("isArchived", false)
      )
      .collect();

    if (homes.length === 0) {
      return {
        propertyCount: 0,
        totalSystems: 0,
        avgHealth: 100,
        upcomingTasks: 0,
        overdueTasks: 0,
        dueSoonTasks: 0,
        totalAnnualCost: 0,
        properties: [],
      };
    }

    let totalSystems = 0;
    let upcomingTasks = 0;
    let overdueTasks = 0;
    let dueSoonTasks = 0;
    const properties: Array<{
      id: string;
      name: string;
      address: string;
      healthScore: number;
      systemsCount: number;
      overdueCount: number;
    }> = [];

    for (const home of homes) {
      const systems = await ctx.db
        .query("systems")
        .withIndex("by_home_active", (q) =>
          q.eq("homeId", home._id).eq("isArchived", false)
        )
        .collect();

      totalSystems += systems.length;

      const tasks = await ctx.db
        .query("scheduledMaintenance")
        .withIndex("by_home", (q) => q.eq("homeId", home._id))
        .collect();

      const active = tasks.filter(
        (t) => !["completed", "skipped"].includes(t.status)
      );

      const overdueForHome = active.filter((t) => t.status === "overdue").length;
      const dueForHome = active.filter((t) => t.status === "due").length;

      overdueTasks += overdueForHome;
      dueSoonTasks += dueForHome;
      upcomingTasks += active.filter((t) => t.status === "upcoming").length;

      properties.push({
        id: home._id,
        name: home.name || home.addressLine1,
        address: `${home.addressLine1}, ${home.city}`,
        healthScore: home.overallHealthScore,
        systemsCount: systems.length,
        overdueCount: overdueForHome,
      });
    }

    const avgHealth =
      Math.round(homes.reduce((sum, h) => sum + h.overallHealthScore, 0) / homes.length);

    return {
      propertyCount: homes.length,
      totalSystems,
      avgHealth,
      upcomingTasks,
      overdueTasks,
      dueSoonTasks,
      totalAnnualCost: 0,
      properties: properties.sort((a, b) => a.healthScore - b.healthScore),
    };
  },
});

/**
 * Get active alerts across all properties
 */
export const getActiveAlerts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile) return [];

    const homes = await ctx.db
      .query("homes")
      .withIndex("by_owner_active", (q) =>
        q.eq("ownerId", profile._id).eq("isArchived", false)
      )
      .collect();

    const alerts: Array<{
      id: string;
      type: "overdue" | "due_soon" | "system_critical" | "weather";
      severity: "high" | "medium" | "low";
      title: string;
      description: string;
      propertyName: string;
      propertyId: string;
      timestamp: number;
    }> = [];

    for (const home of homes) {
      const propName = home.name || home.addressLine1;

      const tasks = await ctx.db
        .query("scheduledMaintenance")
        .withIndex("by_home_status", (q) =>
          q.eq("homeId", home._id).eq("status", "overdue")
        )
        .collect();

      for (const task of tasks) {
        alerts.push({
          id: task._id,
          type: "overdue",
          severity: task.priority === "critical" ? "high" : "medium",
          title: `Overdue: ${task.name}`,
          description: `Task was due ${task.dueDate}`,
          propertyName: propName,
          propertyId: home._id,
          timestamp: task._creationTime,
        });
      }

      const dueTasks = await ctx.db
        .query("scheduledMaintenance")
        .withIndex("by_home_status", (q) =>
          q.eq("homeId", home._id).eq("status", "due")
        )
        .collect();

      for (const task of dueTasks) {
        alerts.push({
          id: task._id,
          type: "due_soon",
          severity: "low",
          title: `Due Soon: ${task.name}`,
          description: `Due ${task.dueDate}`,
          propertyName: propName,
          propertyId: home._id,
          timestamp: task._creationTime,
        });
      }

      const criticalSystems = await ctx.db
        .query("systems")
        .withIndex("by_home_active", (q) =>
          q.eq("homeId", home._id).eq("isArchived", false)
        )
        .filter((q) => q.lt(q.field("healthScore"), 30))
        .collect();

      for (const system of criticalSystems) {
        alerts.push({
          id: system._id,
          type: "system_critical",
          severity: "high",
          title: `Critical: ${system.name}`,
          description: `Health score ${system.healthScore}% — replacement may be needed`,
          propertyName: propName,
          propertyId: home._id,
          timestamp: system._creationTime,
        });
      }
    }

    return alerts.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  },
});

/**
 * Get upcoming maintenance across all properties (next 7 days)
 */
export const getUpcomingMaintenance = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile) return [];

    const homes = await ctx.db
      .query("homes")
      .withIndex("by_owner_active", (q) =>
        q.eq("ownerId", profile._id).eq("isArchived", false)
      )
      .collect();

    const now = new Date();
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + (args.days ?? 7));

    const tasks: Array<{
      id: string;
      name: string;
      dueDate: string;
      status: string;
      priority: string;
      category: string;
      propertyName: string;
      propertyId: string;
    }> = [];

    for (const home of homes) {
      const homeTasks = await ctx.db
        .query("scheduledMaintenance")
        .withIndex("by_home", (q) => q.eq("homeId", home._id))
        .collect();

      const upcoming = homeTasks.filter((t) => {
        if (["completed", "skipped"].includes(t.status)) return false;
        const due = new Date(t.dueDate);
        return due <= maxDate;
      });

      for (const t of upcoming) {
        tasks.push({
          id: t._id,
          name: t.name,
          dueDate: t.dueDate,
          status: t.status,
          priority: t.priority,
          category: t.category ?? "other",
          propertyName: home.name || home.addressLine1 || "Property",
          propertyId: home._id,
        });
      }
    }

    return tasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  },
});

/**
 * Get cost analysis across portfolio
 */
export const getCostAnalysis = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile) return null;

    const homes = await ctx.db
      .query("homes")
      .withIndex("by_owner_active", (q) =>
        q.eq("ownerId", profile._id).eq("isArchived", false)
      )
      .collect();

    const byCategory: Record<string, { maintenance: number; replacement: number }> = {};
    let totalMaintenance = 0;
    let totalReplacement = 0;

    for (const home of homes) {
      const tasks = await ctx.db
        .query("scheduledMaintenance")
        .withIndex("by_home", (q) => q.eq("homeId", home._id))
        .filter((q) => q.eq(q.field("status"), "completed"))
        .collect();

      for (const task of tasks) {
        const cat = task.category || "other";
        if (!byCategory[cat]) byCategory[cat] = { maintenance: 0, replacement: 0 };

        const cost = task.costActual
          ?? ((task.proCostLow || 0) + (task.proCostHigh || 0)) / 2;

        byCategory[cat].maintenance += cost;
        totalMaintenance += cost;
      }

      const systems = await ctx.db
        .query("systems")
        .withIndex("by_home_active", (q) =>
          q.eq("homeId", home._id).eq("isArchived", false)
        )
        .collect();

      for (const system of systems) {
        if (system.estimatedReplacementYear && system.estimatedReplacementCost) {
          const currentYear = new Date().getFullYear();
          if (system.estimatedReplacementYear <= currentYear + 5) {
            const systemType = await ctx.db.get(system.systemTypeId);
            const cat = systemType?.category || "other";
            if (!byCategory[cat]) byCategory[cat] = { maintenance: 0, replacement: 0 };
            byCategory[cat].replacement += system.estimatedReplacementCost;
            totalReplacement += system.estimatedReplacementCost;
          }
        }
      }
    }

    return {
      totalMaintenance: Math.round(totalMaintenance),
      totalReplacement: Math.round(totalReplacement),
      grandTotal: Math.round(totalMaintenance + totalReplacement),
      byCategory: Object.entries(byCategory).map(([category, costs]) => ({
        category,
        maintenance: Math.round(costs.maintenance),
        replacement: Math.round(costs.replacement),
        total: Math.round(costs.maintenance + costs.replacement),
      })),
    };
  },
});

/**
 * Portfolio risk heatmap data — system health by category for each property
 */
export const getPortfolioRiskHeatmap = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile) return [];

    const homes = await ctx.db
      .query("homes")
      .withIndex("by_owner_active", (q) =>
        q.eq("ownerId", profile._id).eq("isArchived", false)
      )
      .collect();

    const CATEGORIES = ["hvac", "plumbing", "electrical", "appliances", "water_heater", "roofing"];

    const results = [];
    for (const home of homes) {
      const systems = await ctx.db
        .query("systems")
        .withIndex("by_home_active", (q) =>
          q.eq("homeId", home._id).eq("isArchived", false)
        )
        .collect();

      const systemsByCategory: Record<string, { score: number; age: number; name: string } | null> = {};
      for (const system of systems) {
        const systemType = await ctx.db.get(system.systemTypeId);
        const cat = systemType?.category ?? "other";
        if (CATEGORIES.includes(cat)) {
          const age = system.installDate
            ? (Date.now() - new Date(system.installDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
            : 0;
          const existing = systemsByCategory[cat];
          if (!existing || system.healthScore < existing.score) {
            systemsByCategory[cat] = {
              score: system.healthScore,
              age: Math.round(age * 10) / 10,
              name: system.name ?? "Unknown",
            };
          }
        }
      }

      results.push({
        propertyId: home._id,
        propertyName: home.name || home.addressLine1,
        aggregateScore: home.overallHealthScore,
        systems: systemsByCategory,
      });
    }

    return results.sort((a, b) => a.aggregateScore - b.aggregateScore);
  },
});

/**
 * Projected maintenance costs for the next 30/90/180 days
 */
export const getProjectedMaintenanceCost = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile) return null;

    const homes = await ctx.db
      .query("homes")
      .withIndex("by_owner_active", (q) =>
        q.eq("ownerId", profile._id).eq("isArchived", false)
      )
      .collect();

    const now = new Date();
    const day30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const day90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    const day180 = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);

    let cost30 = 0;
    let cost90 = 0;
    let cost180 = 0;
    const byCategory: Record<string, number> = {};

    for (const home of homes) {
      const tasks = await ctx.db
        .query("scheduledMaintenance")
        .withIndex("by_home", (q) => q.eq("homeId", home._id))
        .collect();

      for (const task of tasks) {
        if (["completed", "skipped"].includes(task.status)) continue;
        const due = new Date(task.dueDate);
        if (due > day180) continue;

        const estCost = task.proCostLow && task.proCostHigh
          ? (task.proCostLow + task.proCostHigh) / 2
          : 0;

        if (due <= day30) cost30 += estCost;
        if (due <= day90) cost90 += estCost;
        cost180 += estCost;

        const cat = task.category || "other";
        byCategory[cat] = (byCategory[cat] || 0) + estCost;
      }
    }

    return {
      next30Days: Math.round(cost30),
      next90Days: Math.round(cost90),
      next6Months: Math.round(cost180),
      byCategory: Object.entries(byCategory)
        .map(([category, cost]) => ({ category, cost: Math.round(cost) }))
        .sort((a, b) => b.cost - a.cost),
    };
  },
});

/**
 * At-risk turnovers — upcoming turnovers where systems have health issues
 */
export const getAtRiskTurnovers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile) return [];

    const homes = await ctx.db
      .query("homes")
      .withIndex("by_owner_active", (q) =>
        q.eq("ownerId", profile._id).eq("isArchived", false)
      )
      .collect();

    const now = new Date().toISOString();
    const twoWeeks = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    const results = [];
    for (const home of homes) {
      const turnovers = await ctx.db
        .query("turnovers")
        .withIndex("by_home", (q) => q.eq("homeId", home._id))
        .collect();

      const upcoming = turnovers.filter(
        (t) => t.status !== "completed" && t.nextCheckinTime >= now && t.checkoutTime <= twoWeeks
      );

      if (upcoming.length === 0) continue;

      const systems = await ctx.db
        .query("systems")
        .withIndex("by_home_active", (q) =>
          q.eq("homeId", home._id).eq("isArchived", false)
        )
        .collect();

      const riskySystemsList = systems
        .filter((s) => s.healthScore < 50)
        .map((s) => ({
          name: s.name,
          healthScore: s.healthScore,
          grade: s.healthScore < 30 ? "Critical" : "Poor",
        }));

      for (const turnover of upcoming) {
        results.push({
          id: turnover._id,
          homeName: home.name || home.addressLine1,
          homeId: home._id,
          checkoutTime: turnover.checkoutTime,
          nextCheckinTime: turnover.nextCheckinTime,
          windowMinutes: turnover.windowMinutes,
          riskySystems: riskySystemsList,
          isAtRisk: riskySystemsList.length > 0,
        });
      }
    }

    return results.sort((a, b) => a.checkoutTime.localeCompare(b.checkoutTime));
  },
});
