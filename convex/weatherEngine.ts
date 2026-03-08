import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";

export const getActiveAlerts = query({
  args: { homeId: v.id("homes") },
  handler: async (ctx, { homeId }) => {
    const alerts = await ctx.db
      .query("weatherChecklistAlerts")
      .withIndex("by_home", (q) => q.eq("homeId", homeId))
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "active"),
          q.eq(q.field("status"), "acknowledged")
        )
      )
      .collect();

    const enriched = await Promise.all(
      alerts.map(async (alert) => {
        const template = await ctx.db.get(alert.templateId);
        const trigger = await ctx.db.get(alert.triggerId);
        return { ...alert, template, trigger };
      })
    );

    return enriched;
  },
});

export const getAlertDetail = query({
  args: { alertId: v.id("weatherChecklistAlerts") },
  handler: async (ctx, { alertId }) => {
    const alert = await ctx.db.get(alertId);
    if (!alert) return null;

    const template = await ctx.db.get(alert.templateId);
    const trigger = await ctx.db.get(alert.triggerId);

    const tasks = await Promise.all(
      alert.tasksGenerated.map(async (taskId) => {
        return ctx.db.get(taskId);
      })
    );

    return {
      ...alert,
      template,
      trigger,
      tasks: tasks.filter(Boolean),
    };
  },
});

export const acknowledgeAlert = mutation({
  args: { alertId: v.id("weatherChecklistAlerts") },
  handler: async (ctx, { alertId }) => {
    await ctx.db.patch(alertId, {
      status: "acknowledged",
      acknowledgedAt: Date.now(),
    });
  },
});

export const completeAlert = mutation({
  args: { alertId: v.id("weatherChecklistAlerts") },
  handler: async (ctx, { alertId }) => {
    await ctx.db.patch(alertId, {
      status: "completed",
      completedAt: Date.now(),
    });
  },
});

export const evaluateWeatherTriggers = internalMutation({
  args: {
    homeId: v.id("homes"),
    userId: v.id("userProfiles"),
    temperature: v.optional(v.number()),
    windSpeed: v.optional(v.number()),
    precipitation: v.optional(v.number()),
    humidity: v.optional(v.number()),
    forecast: v.string(),
    alertCodes: v.array(v.string()),
    climateZone: v.string(),
  },
  handler: async (ctx, args) => {
    const activeTriggers = await ctx.db
      .query("weatherTriggers")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    const matchedTriggers: typeof activeTriggers = [];

    for (const trigger of activeTriggers) {
      if (!trigger.applicableRegions.includes(args.climateZone)) continue;

      let matches = false;

      switch (trigger.triggerType) {
        case "freeze_warning":
          matches = (args.temperature !== undefined && args.temperature <= 32) ||
            args.alertCodes.some((c) => c.includes("freeze") || c.includes("frost"));
          break;
        case "heat_wave":
          matches = (args.temperature !== undefined && args.temperature >= 95) ||
            args.alertCodes.some((c) => c.includes("heat") || c.includes("excessive"));
          break;
        case "hurricane_watch":
          matches = args.alertCodes.some((c) =>
            c.includes("hurricane") || c.includes("tropical")
          );
          break;
        case "heavy_rain":
          matches = (args.precipitation !== undefined && args.precipitation >= 2) ||
            args.alertCodes.some((c) => c.includes("rain") || c.includes("flood"));
          break;
        case "hail_warning":
          matches = args.alertCodes.some((c) => c.includes("hail"));
          break;
        case "tornado_watch":
          matches = args.alertCodes.some((c) => c.includes("tornado"));
          break;
        case "snow_storm":
          matches = args.alertCodes.some((c) =>
            c.includes("snow") || c.includes("blizzard") || c.includes("winter storm")
          );
          break;
        case "ice_storm":
          matches = args.alertCodes.some((c) =>
            c.includes("ice") || c.includes("freezing rain") || c.includes("sleet")
          );
          break;
        case "high_wind":
          matches = (args.windSpeed !== undefined && args.windSpeed >= 50) ||
            args.alertCodes.some((c) => c.includes("wind"));
          break;
        case "flooding":
          matches = args.alertCodes.some((c) => c.includes("flood"));
          break;
        case "drought":
          matches = args.alertCodes.some((c) =>
            c.includes("drought") || c.includes("fire weather")
          );
          break;
        case "wildfire_risk":
          matches = args.alertCodes.some((c) =>
            c.includes("fire") || c.includes("red flag")
          );
          break;
        case "extreme_cold":
          matches = (args.temperature !== undefined && args.temperature <= 0) ||
            args.alertCodes.some((c) => c.includes("wind chill") || c.includes("extreme cold"));
          break;
        case "spring_thaw":
          matches = args.alertCodes.some((c) => c.includes("thaw"));
          break;
        case "humidity_alert":
          matches = args.humidity !== undefined && args.humidity >= 80;
          break;
      }

      if (matches) matchedTriggers.push(trigger);
    }

    const now = Date.now();
    const createdAlerts: string[] = [];

    for (const trigger of matchedTriggers) {
      const recentAlert = await ctx.db
        .query("weatherChecklistAlerts")
        .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
        .filter((q) =>
          q.and(
            q.eq(q.field("triggerType"), trigger.triggerType),
            q.or(
              q.eq(q.field("status"), "active"),
              q.eq(q.field("status"), "acknowledged")
            )
          )
        )
        .first();

      if (recentAlert) continue;

      const template = await ctx.db
        .query("weatherChecklistTemplates")
        .withIndex("by_trigger_type", (q) => q.eq("triggerType", trigger.triggerType))
        .first();

      if (!template) continue;

      const taskIds: any[] = [];
      const dueDateStr = new Date(now + 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      for (const task of template.tasks) {
        const taskId = await ctx.db.insert("scheduledMaintenance", {
          homeId: args.homeId,
          name: task.title,
          description: task.description,
          dueDate: dueDateStr,
          status: "upcoming",
          priority: task.priority === "urgent" ? "critical" : task.priority,
          isRecurring: false,
          category: task.category as any,
          diyCostLow: task.estimatedCost ?? 0,
          diyCostHigh: task.estimatedCost ? task.estimatedCost * 2 : 0,
          proCostLow: (task.estimatedCost ?? 0) * 3,
          proCostHigh: (task.estimatedCost ?? 0) * 5,
          snoozeCount: 0,
        });
        taskIds.push(taskId);
      }

      const expiresAt = now + 7 * 24 * 60 * 60 * 1000;

      const alertId = await ctx.db.insert("weatherChecklistAlerts", {
        homeId: args.homeId,
        userId: args.userId,
        triggerId: trigger._id,
        templateId: template._id,
        triggerType: trigger.triggerType,
        severity: trigger.severity,
        weatherData: {
          temperature: args.temperature,
          windSpeed: args.windSpeed,
          precipitation: args.precipitation,
          humidity: args.humidity,
          forecast: args.forecast,
          source: "weather.gov",
          alertTitle: trigger.name,
        },
        tasksGenerated: taskIds,
        status: "active",
        sentAt: now,
        expiresAt,
      });

      createdAlerts.push(alertId);

      await ctx.db.insert("appNotifications", {
        userId: args.userId,
        type: "weather_alert",
        title: `${trigger.name}`,
        body: `${template.tasks.length} tasks to protect your home. Tap to view checklist.`,
        data: { alertId, triggerType: trigger.triggerType },
        read: false,
        sentAt: now,
      });
    }

    return { matchedTriggers: matchedTriggers.length, alertsCreated: createdAlerts.length };
  },
});

export const expireOldAlerts = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const activeAlerts = await ctx.db
      .query("weatherChecklistAlerts")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    for (const alert of activeAlerts) {
      if (alert.expiresAt < now) {
        await ctx.db.patch(alert._id, { status: "expired" });
      }
    }
  },
});

export const getAllTriggers = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db
      .query("weatherTriggers")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

export const getTemplateForTrigger = query({
  args: { triggerType: v.string() },
  handler: async (ctx, { triggerType }) => {
    return ctx.db
      .query("weatherChecklistTemplates")
      .withIndex("by_trigger_type", (q) => q.eq("triggerType", triggerType))
      .first();
  },
});
