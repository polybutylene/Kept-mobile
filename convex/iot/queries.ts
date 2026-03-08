import { v } from "convex/values";
import { query, internalQuery } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ============================================================
// Internal Queries (used by sync engine and crons)
// ============================================================

export const getConnectedDevicesByType = internalQuery({
  args: { deviceType: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("iotDevices")
      .withIndex("by_deviceType", (q) => q.eq("deviceType", args.deviceType))
      .filter((q) => q.eq(q.field("connectionStatus"), "connected"))
      .collect();
  },
});

export const getDevice = internalQuery({
  args: { deviceId: v.id("iotDevices") },
  handler: async (ctx, args) => {
    return ctx.db.get(args.deviceId);
  },
});

export const getDevicesByHome = internalQuery({
  args: { homeId: v.id("homes") },
  handler: async (ctx, args) => {
    return ctx.db
      .query("iotDevices")
      .withIndex("by_homeId", (q) => q.eq("homeId", args.homeId))
      .collect();
  },
});

export const getReadingsForDevice = internalQuery({
  args: {
    deviceId: v.id("iotDevices"),
    readingType: v.string(),
    since: v.number(),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("iotReadings")
      .withIndex("by_deviceId_type", (q) =>
        q.eq("deviceId", args.deviceId).eq("readingType", args.readingType)
      )
      .filter((q) => q.gte(q.field("timestamp"), args.since))
      .collect();
  },
});

export const getRawReadingsOlderThan = internalQuery({
  args: { cutoff: v.number(), limit: v.number() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("iotReadings")
      .withIndex("by_timestamp")
      .filter((q) =>
        q.and(
          q.lt(q.field("timestamp"), args.cutoff),
          q.eq(q.field("granularity"), "raw")
        )
      )
      .take(args.limit);
  },
});

export const getHourlyReadingsOlderThan = internalQuery({
  args: { cutoff: v.number(), limit: v.number() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("iotReadings")
      .withIndex("by_timestamp")
      .filter((q) =>
        q.and(
          q.lt(q.field("timestamp"), args.cutoff),
          q.eq(q.field("granularity"), "hourly")
        )
      )
      .take(args.limit);
  },
});

export const getAggregatesForSystem = internalQuery({
  args: { systemId: v.id("systems"), period: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("iotAggregates")
      .withIndex("by_systemId_period", (q) =>
        q.eq("systemId", args.systemId).eq("period", args.period)
      )
      .collect();
  },
});

export const getActiveAlertsForHome = internalQuery({
  args: { homeId: v.id("homes") },
  handler: async (ctx, args) => {
    return ctx.db
      .query("iotAlerts")
      .withIndex("by_homeId", (q) => q.eq("homeId", args.homeId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
  },
});

// ============================================================
// Public Queries (used by frontend)
// ============================================================

export const getMyDevices = query({
  args: { homeId: v.id("homes") },
  handler: async (ctx, args) => {
    try {
      const userId = await getAuthUserId(ctx);
      if (!userId) return [];
      return await ctx.db
        .query("iotDevices")
        .withIndex("by_homeId", (q) => q.eq("homeId", args.homeId))
        .collect();
    } catch (e) {
      console.error("[getMyDevices] Error:", e);
      return [];
    }
  },
});

export const getDeviceReadings = query({
  args: {
    deviceId: v.id("iotDevices"),
    readingType: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let q = ctx.db
      .query("iotReadings")
      .withIndex("by_deviceId_timestamp", (q) => q.eq("deviceId", args.deviceId))
      .order("desc");

    const results = await q.take(args.limit ?? 50);

    if (args.readingType) {
      return results.filter((r) => r.readingType === args.readingType);
    }
    return results;
  },
});

export const getSystemAggregates = query({
  args: {
    systemId: v.id("systems"),
    period: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const userId = await getAuthUserId(ctx);
      if (!userId) return [];

      if (args.period) {
        return await ctx.db
          .query("iotAggregates")
          .withIndex("by_systemId_period", (q) =>
            q.eq("systemId", args.systemId).eq("period", args.period!)
          )
          .order("desc")
          .take(24);
      }

      return await ctx.db
        .query("iotAggregates")
        .withIndex("by_systemId_period", (q) => q.eq("systemId", args.systemId))
        .order("desc")
        .take(50);
    } catch (e) {
      console.error("[getSystemAggregates] Error:", e);
      return [];
    }
  },
});

export const getMyAlerts = query({
  args: {
    homeId: v.optional(v.id("homes")),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const userId = await getAuthUserId(ctx);
      if (!userId) return [];

      if (args.homeId) {
        const alerts = await ctx.db
          .query("iotAlerts")
          .withIndex("by_homeId", (q) => q.eq("homeId", args.homeId!))
          .order("desc")
          .take(50);
        if (args.status) return alerts.filter((a) => a.status === args.status);
        return alerts;
      }

      if (args.status) {
        const all = await ctx.db
          .query("iotAlerts")
          .withIndex("by_status", (q) => q.eq("status", args.status!))
          .order("desc")
          .take(200);
        return all.filter((a) => a.userId === userId).slice(0, 50);
      }

      return await ctx.db
        .query("iotAlerts")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .order("desc")
        .take(50);
    } catch (e) {
      console.error("[getMyAlerts] Error:", e);
      return [];
    }
  },
});

export const getMyAutomationRules = query({
  args: { homeId: v.id("homes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return ctx.db
      .query("strAutomationRules")
      .withIndex("by_homeId", (q) => q.eq("homeId", args.homeId))
      .collect();
  },
});
