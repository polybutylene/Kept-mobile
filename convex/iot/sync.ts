"use node";

/**
 * IoT Sync Engine
 *
 * Handles OAuth connection, device polling, token refresh, reading storage,
 * and alert threshold checking. Called by cron jobs at platform-specific intervals.
 */

import { v } from "convex/values";
import { action, internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { getAdapter } from "./adapters";
import { getPlatformConfig } from "./platforms";

// ============================================================
// OAuth Connection Flow
// ============================================================

export const connectDevice = action({
  args: {
    platform: v.string(),
    authCode: v.string(),
    redirectUri: v.string(),
    homeId: v.id("homes"),
    systemId: v.optional(v.id("systems")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const adapter = getAdapter(args.platform);
    const tokens = await adapter.authenticate(args.authCode, args.redirectUri);
    const devices = await adapter.listDevices(tokens.accessToken);

    const config = getPlatformConfig(args.platform);
    const deviceIds: string[] = [];

    for (const device of devices) {
      const deviceId = await ctx.runMutation(internal.iot.mutations.createDevice, {
        userId,
        homeId: args.homeId,
        systemId: args.systemId,
        platform: args.platform,
        deviceType: device.type,
        externalDeviceId: device.externalId,
        deviceName: device.name,
        deviceModel: device.model,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiry: Date.now() + tokens.expiresIn * 1000,
        capabilities: device.capabilities,
        syncIntervalMinutes: config?.pollIntervalMinutes ?? 15,
      });
      deviceIds.push(deviceId);
    }

    return { deviceCount: devices.length, deviceIds };
  },
});

// ============================================================
// Device Polling
// ============================================================

export const pollDevicesByType = internalAction({
  args: { deviceType: v.string() },
  handler: async (ctx, args) => {
    const devices: any[] = await ctx.runQuery(internal.iot.queries.getConnectedDevicesByType, {
      deviceType: args.deviceType,
    });

    for (const device of devices) {
      try {
        const adapter = getAdapter(device.platform);

        let accessToken = device.accessToken;
        if (device.tokenExpiry && Date.now() > device.tokenExpiry - 300_000 && device.refreshToken) {
          const tokens = await adapter.refreshToken(device.refreshToken);
          await ctx.runMutation(internal.iot.mutations.updateTokens, {
            deviceId: device._id,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            tokenExpiry: Date.now() + tokens.expiresIn * 1000,
          });
          accessToken = tokens.accessToken;
        }

        const readings = await adapter.getReadings(accessToken, device.externalDeviceId);

        for (const reading of readings) {
          await ctx.runMutation(internal.iot.mutations.insertReading, {
            deviceId: device._id,
            homeId: device.homeId,
            systemId: device.systemId,
            readingType: reading.readingType,
            value: reading.value,
            unit: reading.unit,
            timestamp: reading.timestamp,
          });
        }

        await ctx.runMutation(internal.iot.mutations.updateDeviceStatus, {
          deviceId: device._id,
          connectionStatus: "connected",
          lastSyncAt: Date.now(),
          lastSeenAt: Date.now(),
        });

        await ctx.runMutation(internal.iot.alerts.checkThresholds, {
          device,
          readings,
        });
      } catch (error: any) {
        const status = error?.message?.includes("401") || error?.message?.includes("403")
          ? "token_expired"
          : "error";
        await ctx.runMutation(internal.iot.mutations.updateDeviceStatus, {
          deviceId: device._id,
          connectionStatus: status,
          lastError: String(error?.message ?? error),
        });
      }
    }
  },
});

// ============================================================
// Execute Device Action
// ============================================================

export const executeDeviceAction = action({
  args: {
    deviceId: v.id("iotDevices"),
    actionType: v.string(),
    parameters: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const device: any = await ctx.runQuery(internal.iot.queries.getDevice, { deviceId: args.deviceId });
    if (!device) throw new Error("Device not found");
    if (!device.autoActionsEnabled && args.actionType !== "lock" && args.actionType !== "unlock") {
      throw new Error("Auto-actions are disabled for this device. Enable them in device settings.");
    }

    const adapter = getAdapter(device.platform);
    const result = await adapter.executeAction(device.accessToken, device.externalDeviceId, {
      actionType: args.actionType,
      parameters: args.parameters ?? {},
    });

    return result;
  },
});

// ============================================================
// Disconnect Device
// ============================================================

export const internalExecuteDeviceAction = internalAction({
  args: {
    deviceId: v.id("iotDevices"),
    actionType: v.string(),
    parameters: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const device: any = await ctx.runQuery(internal.iot.queries.getDevice, { deviceId: args.deviceId });
    if (!device) throw new Error("Device not found");

    const adapter = getAdapter(device.platform);
    return adapter.executeAction(device.accessToken, device.externalDeviceId, {
      actionType: args.actionType,
      parameters: args.parameters ?? {},
    });
  },
});

export const disconnectDevice = action({
  args: { deviceId: v.id("iotDevices") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.runMutation(internal.iot.mutations.deleteDevice, { deviceId: args.deviceId });
    return { success: true };
  },
});
