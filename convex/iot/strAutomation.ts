import { v } from "convex/values";
import { mutation, internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * STR Automation Rules Engine
 *
 * Manages automation rules that trigger device actions based on events
 * (guest check-in/checkout, vacancy periods, threshold crossings).
 * Rules are created from pre-built templates or custom configurations.
 */

// ============================================================
// Pre-built Automation Templates
// ============================================================

export const STR_AUTOMATION_TEMPLATES = [
  {
    name: "Pre-cool before guest arrival",
    description: "Set AC to 72°F two hours before check-in time",
    ruleType: "guest_checkin",
    trigger: { event: "booking_checkin", conditions: { timeOffset: -120 } },
    actionTemplate: { actionType: "set_temperature", parameters: { temperature: 72, mode: "cool" } },
    requiredDeviceType: "thermostat",
  },
  {
    name: "Eco mode during vacancy",
    description: "Set thermostat to eco mode when property is vacant",
    ruleType: "vacancy",
    trigger: { event: "booking_checkout", conditions: { timeOffset: 60 } },
    actionTemplate: { actionType: "set_temperature", parameters: { temperature: 85, mode: "eco" } },
    requiredDeviceType: "thermostat",
  },
  {
    name: "Generate guest lock code",
    description: "Create a unique access code 24 hours before check-in",
    ruleType: "guest_checkin",
    trigger: { event: "booking_checkin", conditions: { timeOffset: -1440 } },
    actionTemplate: { actionType: "set_guest_code", parameters: {} },
    requiredDeviceType: "smart_lock",
  },
  {
    name: "Remove guest lock code",
    description: "Delete the guest access code 2 hours after checkout",
    ruleType: "guest_checkout",
    trigger: { event: "booking_checkout", conditions: { timeOffset: 120 } },
    actionTemplate: { actionType: "remove_guest_code", parameters: {} },
    requiredDeviceType: "smart_lock",
  },
  {
    name: "Turnover lights on",
    description: "Turn on all lights when turnover team arrives",
    ruleType: "turnover",
    trigger: { event: "device_state_change", conditions: { readingType: "lock_state" } },
    actionTemplate: { actionType: "turn_on_lights", parameters: { lightScene: "bright" } },
    requiredDeviceType: "light",
  },
  {
    name: "Water shutoff during extended vacancy",
    description: "Close water valve if property is vacant for 7+ days",
    ruleType: "vacancy",
    trigger: { event: "booking_checkout", conditions: { timeOffset: 10080 } },
    actionTemplate: { actionType: "shutoff_water", parameters: {} },
    requiredDeviceType: "water_shutoff",
  },
  {
    name: "Freeze protection",
    description: "Turn heat to 65°F if indoor temp drops below 55°F",
    ruleType: "threshold",
    trigger: { event: "reading_threshold", conditions: { readingType: "temperature", threshold: 55, operator: "below" } },
    actionTemplate: { actionType: "set_temperature", parameters: { temperature: 65, mode: "heat" } },
    requiredDeviceType: "thermostat",
  },
  {
    name: "Leak auto-shutoff",
    description: "Close water valve immediately if any leak sensor triggers",
    ruleType: "threshold",
    trigger: { event: "reading_threshold", conditions: { readingType: "leak_detected", threshold: 1, operator: "equals" } },
    actionTemplate: { actionType: "close_valve", parameters: {} },
    requiredDeviceType: "water_shutoff",
  },
] as const;

// ============================================================
// Create Automation Rule
// ============================================================

export const createAutomationRule = mutation({
  args: {
    homeId: v.id("homes"),
    propertyId: v.optional(v.id("properties")),
    deviceId: v.id("iotDevices"),
    ruleName: v.string(),
    ruleType: v.string(),
    trigger: v.object({
      event: v.string(),
      conditions: v.optional(v.object({
        timeOffset: v.optional(v.number()),
        readingType: v.optional(v.string()),
        threshold: v.optional(v.number()),
        operator: v.optional(v.string()),
      })),
    }),
    actionType: v.string(),
    actionParameters: v.optional(v.object({
      temperature: v.optional(v.number()),
      mode: v.optional(v.string()),
      lockCode: v.optional(v.string()),
      lightScene: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return ctx.db.insert("strAutomationRules", {
      userId,
      homeId: args.homeId,
      propertyId: args.propertyId,
      ruleName: args.ruleName,
      ruleType: args.ruleType,
      isEnabled: true,
      trigger: args.trigger,
      action: {
        deviceId: args.deviceId,
        actionType: args.actionType,
        parameters: args.actionParameters,
      },
      createdAt: Date.now(),
    });
  },
});

export const toggleAutomationRule = mutation({
  args: {
    ruleId: v.id("strAutomationRules"),
    isEnabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.patch(args.ruleId, { isEnabled: args.isEnabled });
  },
});

export const deleteAutomationRule = mutation({
  args: { ruleId: v.id("strAutomationRules") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.delete(args.ruleId);
  },
});

// ============================================================
// Evaluate Threshold-Based Rules
// ============================================================

export const evaluateThresholdRules = internalMutation({
  args: {
    homeId: v.id("homes"),
    readingType: v.string(),
    value: v.number(),
  },
  handler: async (ctx, args) => {
    const rules = await ctx.db
      .query("strAutomationRules")
      .withIndex("by_homeId", (q) => q.eq("homeId", args.homeId))
      .filter((q) =>
        q.and(
          q.eq(q.field("isEnabled"), true),
          q.eq(q.field("ruleType"), "threshold")
        )
      )
      .collect();

    for (const rule of rules) {
      const conditions = rule.trigger.conditions;
      if (!conditions?.readingType || conditions.readingType !== args.readingType) continue;

      const threshold = conditions.threshold ?? 0;
      const operator = conditions.operator ?? "above";
      let triggered = false;

      switch (operator) {
        case "above": triggered = args.value > threshold; break;
        case "below": triggered = args.value < threshold; break;
        case "equals": triggered = args.value === threshold; break;
      }

      if (triggered) {
        await ctx.db.patch(rule._id, { lastTriggeredAt: Date.now() });

        await ctx.scheduler.runAfter(0, internal.iot.sync.internalExecuteDeviceAction, {
          deviceId: rule.action.deviceId,
          actionType: rule.action.actionType,
          parameters: rule.action.parameters ?? {},
        });
      }
    }
  },
});
