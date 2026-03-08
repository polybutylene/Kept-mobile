import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";

/**
 * Alert Threshold Engine
 *
 * Evaluates incoming device readings against predefined thresholds and
 * creates alerts when conditions are met. Supports auto-actions for
 * critical events (leak shutoff, freeze protection) when enabled.
 */

interface AlertThreshold {
  readingType: string;
  condition: "above" | "below" | "equals";
  threshold: number;
  severity: "info" | "warning" | "critical" | "emergency";
  alertType: string;
  title: string;
  messageTemplate: string;
  autoAction?: { actionType: string; parameters: Record<string, any> };
}

const DEFAULT_THRESHOLDS: AlertThreshold[] = [
  // Water
  {
    readingType: "leak_detected",
    condition: "equals",
    threshold: 1,
    severity: "emergency",
    alertType: "leak_detected",
    title: "Water Leak Detected",
    messageTemplate: "Water leak detected by {deviceName}. Immediate attention required.",
    autoAction: { actionType: "close_valve", parameters: {} },
  },
  {
    readingType: "water_pressure_psi",
    condition: "above",
    threshold: 80,
    severity: "warning",
    alertType: "high_pressure",
    title: "High Water Pressure",
    messageTemplate: "Water pressure is {value} PSI (recommended: 40-60 PSI). High pressure accelerates pipe and fixture wear.",
  },

  // HVAC
  {
    readingType: "temperature",
    condition: "above",
    threshold: 90,
    severity: "warning",
    alertType: "temperature_extreme",
    title: "High Indoor Temperature",
    messageTemplate: "Indoor temperature has reached {value}°F. Your AC may not be keeping up — check filter and thermostat settings.",
  },
  {
    readingType: "temperature",
    condition: "below",
    threshold: 55,
    severity: "critical",
    alertType: "freeze_risk",
    title: "Freeze Risk — Low Temperature",
    messageTemplate: "Indoor temperature dropped to {value}°F. Risk of pipe freeze. Check heating system immediately.",
    autoAction: { actionType: "set_temperature", parameters: { temperature: 65, mode: "heat" } },
  },
  {
    readingType: "hvac_runtime_minutes",
    condition: "above",
    threshold: 1200,
    severity: "warning",
    alertType: "runtime_anomaly",
    title: "HVAC Running Excessively",
    messageTemplate: "Your HVAC ran for {value} minutes today — over 20 hours. The system may be struggling.",
  },

  // Battery
  {
    readingType: "battery_percent",
    condition: "below",
    threshold: 20,
    severity: "warning",
    alertType: "battery_low",
    title: "Device Battery Low",
    messageTemplate: "{deviceName} battery is at {value}%. Replace soon to maintain monitoring coverage.",
  },
];

function evaluateThreshold(
  threshold: AlertThreshold,
  value: number
): boolean {
  switch (threshold.condition) {
    case "above": return value > threshold.threshold;
    case "below": return value < threshold.threshold;
    case "equals": return value === threshold.threshold;
    default: return false;
  }
}

function formatMessage(template: string, vars: Record<string, string | number>): string {
  let msg = template;
  for (const [key, val] of Object.entries(vars)) {
    msg = msg.replace(`{${key}}`, String(val));
  }
  return msg;
}

export const checkThresholds = internalMutation({
  args: {
    device: v.any(),
    readings: v.any(),
  },
  handler: async (ctx, args) => {
    const device = args.device as any;
    const readings = args.readings as Array<{ readingType: string; value: number; unit: string; timestamp: number }>;

    if (!device.alertsEnabled) return;

    for (const reading of readings) {
      for (const threshold of DEFAULT_THRESHOLDS) {
        if (reading.readingType !== threshold.readingType) continue;
        if (!evaluateThreshold(threshold, reading.value)) continue;

        const recentAlert = await ctx.db
          .query("iotAlerts")
          .withIndex("by_homeId", (q) => q.eq("homeId", device.homeId))
          .filter((q) =>
            q.and(
              q.eq(q.field("alertType"), threshold.alertType),
              q.eq(q.field("deviceId"), device._id),
              q.eq(q.field("status"), "active"),
              q.gt(q.field("createdAt"), Date.now() - 4 * 60 * 60 * 1000)
            )
          )
          .first();

        if (recentAlert) continue;

        const message = formatMessage(threshold.messageTemplate, {
          deviceName: device.deviceName,
          value: reading.value,
        });

        let autoActionTaken: string | undefined;
        if (threshold.autoAction && device.autoActionsEnabled) {
          autoActionTaken = threshold.autoAction.actionType;
        }

        await ctx.db.insert("iotAlerts", {
          userId: device.userId,
          deviceId: device._id,
          homeId: device.homeId,
          systemId: device.systemId,
          alertType: threshold.alertType,
          severity: threshold.severity,
          title: threshold.title,
          message,
          triggerReading: {
            readingType: reading.readingType,
            value: reading.value,
            threshold: threshold.threshold,
          },
          autoActionTaken,
          status: "active",
          createdAt: Date.now(),
        });

        if (threshold.severity === "emergency" || threshold.severity === "critical") {
          try {
            const profile = await ctx.db
              .query("userProfiles")
              .withIndex("by_userId", (q) => q.eq("userId", device.userId))
              .first();

            if (profile) {
              await ctx.scheduler.runAfter(0, internal.pushNotifications.sendPushNotification, {
                userId: profile._id,
                title: `⚠️ ${threshold.title}`,
                body: message,
              });
            }
          } catch { /* push is non-critical */ }
        }
      }
    }
  },
});
