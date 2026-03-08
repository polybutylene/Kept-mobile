import { v } from "convex/values";
import { mutation, internalMutation } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ============================================================
// Internal Mutations (used by sync engine)
// ============================================================

export const createDevice = internalMutation({
  args: {
    userId: v.id("users"),
    homeId: v.id("homes"),
    systemId: v.optional(v.id("systems")),
    platform: v.string(),
    deviceType: v.string(),
    externalDeviceId: v.string(),
    deviceName: v.string(),
    deviceModel: v.optional(v.string()),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    tokenExpiry: v.optional(v.number()),
    capabilities: v.array(v.string()),
    syncIntervalMinutes: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("iotDevices")
      .withIndex("by_homeId", (q) => q.eq("homeId", args.homeId))
      .filter((q) =>
        q.and(
          q.eq(q.field("platform"), args.platform),
          q.eq(q.field("externalDeviceId"), args.externalDeviceId)
        )
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        accessToken: args.accessToken,
        refreshToken: args.refreshToken,
        tokenExpiry: args.tokenExpiry,
        connectionStatus: "connected",
        lastSeenAt: Date.now(),
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return ctx.db.insert("iotDevices", {
      userId: args.userId,
      homeId: args.homeId,
      systemId: args.systemId,
      platform: args.platform,
      deviceType: args.deviceType,
      externalDeviceId: args.externalDeviceId,
      deviceName: args.deviceName,
      deviceModel: args.deviceModel,
      accessToken: args.accessToken,
      refreshToken: args.refreshToken,
      tokenExpiry: args.tokenExpiry,
      connectionStatus: "connected",
      lastSeenAt: Date.now(),
      capabilities: args.capabilities,
      syncIntervalMinutes: args.syncIntervalMinutes,
      alertsEnabled: true,
      autoActionsEnabled: false,
      connectedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateTokens = internalMutation({
  args: {
    deviceId: v.id("iotDevices"),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    tokenExpiry: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.deviceId, {
      accessToken: args.accessToken,
      refreshToken: args.refreshToken,
      tokenExpiry: args.tokenExpiry,
      updatedAt: Date.now(),
    });
  },
});

export const updateDeviceStatus = internalMutation({
  args: {
    deviceId: v.id("iotDevices"),
    connectionStatus: v.string(),
    lastSyncAt: v.optional(v.number()),
    lastSeenAt: v.optional(v.number()),
    lastError: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const patch: any = { connectionStatus: args.connectionStatus, updatedAt: Date.now() };
    if (args.lastSyncAt) patch.lastSyncAt = args.lastSyncAt;
    if (args.lastSeenAt) patch.lastSeenAt = args.lastSeenAt;
    if (args.lastError !== undefined) patch.lastError = args.lastError;
    await ctx.db.patch(args.deviceId, patch);
  },
});

export const insertReading = internalMutation({
  args: {
    deviceId: v.id("iotDevices"),
    homeId: v.id("homes"),
    systemId: v.optional(v.id("systems")),
    readingType: v.string(),
    value: v.number(),
    unit: v.string(),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("iotReadings", {
      deviceId: args.deviceId,
      homeId: args.homeId,
      systemId: args.systemId,
      readingType: args.readingType,
      value: args.value,
      unit: args.unit,
      granularity: "raw",
      periodStart: args.timestamp,
      timestamp: args.timestamp,
    });
  },
});

export const insertAggregate = internalMutation({
  args: {
    deviceId: v.id("iotDevices"),
    homeId: v.id("homes"),
    systemId: v.optional(v.id("systems")),
    period: v.string(),
    periodStart: v.number(),
    periodEnd: v.number(),
    readingType: v.string(),
    sum: v.optional(v.number()),
    avg: v.optional(v.number()),
    min: v.optional(v.number()),
    max: v.optional(v.number()),
    count: v.number(),
    changeFromPrevious: v.optional(v.number()),
    trendDirection: v.optional(v.string()),
    isAnomaly: v.optional(v.boolean()),
    anomalyDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("iotAggregates", {
      ...args,
      computedAt: Date.now(),
    });
  },
});

export const deleteReading = internalMutation({
  args: { readingId: v.id("iotReadings") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.readingId);
  },
});

export const deleteDevice = internalMutation({
  args: { deviceId: v.id("iotDevices") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.deviceId);
  },
});

export const createAlert = internalMutation({
  args: {
    userId: v.id("users"),
    deviceId: v.id("iotDevices"),
    homeId: v.id("homes"),
    systemId: v.optional(v.id("systems")),
    alertType: v.string(),
    severity: v.string(),
    title: v.string(),
    message: v.string(),
    triggerReading: v.optional(v.object({
      readingType: v.string(),
      value: v.number(),
      threshold: v.number(),
    })),
    autoActionTaken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("iotAlerts", {
      ...args,
      status: "active",
      createdAt: Date.now(),
    });
  },
});

// ============================================================
// Public Mutations (used by frontend)
// ============================================================

export const updateDeviceSettings = mutation({
  args: {
    deviceId: v.id("iotDevices"),
    alertsEnabled: v.optional(v.boolean()),
    autoActionsEnabled: v.optional(v.boolean()),
    deviceName: v.optional(v.string()),
    systemId: v.optional(v.id("systems")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const patch: any = { updatedAt: Date.now() };
    if (args.alertsEnabled !== undefined) patch.alertsEnabled = args.alertsEnabled;
    if (args.autoActionsEnabled !== undefined) patch.autoActionsEnabled = args.autoActionsEnabled;
    if (args.deviceName !== undefined) patch.deviceName = args.deviceName;
    if (args.systemId !== undefined) patch.systemId = args.systemId;

    await ctx.db.patch(args.deviceId, patch);
  },
});

export const acknowledgeAlert = mutation({
  args: { alertId: v.id("iotAlerts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.patch(args.alertId, { status: "acknowledged", acknowledgedAt: Date.now() });
  },
});

export const resolveAlert = mutation({
  args: { alertId: v.id("iotAlerts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.patch(args.alertId, { status: "resolved", resolvedAt: Date.now() });
  },
});
