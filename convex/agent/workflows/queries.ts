/**
 * Internal queries for workflow decision tree data access.
 * Each workflow's prepare() function calls these to gather
 * workflow-specific data beyond what gatherAgentContext provides.
 */
import { v } from "convex/values";
import { internalQuery } from "../../_generated/server";

// ── Alert History (Workflow 1: Proactive Replacement) ──────────────

export const getAlertHistoryForSystem = internalQuery({
  args: { systemId: v.id("systems") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("alertHistory")
      .withIndex("by_systemId", (q) => q.eq("systemId", args.systemId))
      .order("desc")
      .collect();
  },
});

export const getAlertHistoryForHome = internalQuery({
  args: { homeId: v.id("homes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("alertHistory")
      .withIndex("by_homeId_createdAt", (q) => q.eq("homeId", args.homeId))
      .order("desc")
      .take(200);
  },
});

// ── Savings Plans (Workflow 1, 6, 7) ───────────────────────────────

export const getSavingsPlanForSystem = internalQuery({
  args: { systemId: v.id("systems") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("savingsPlans")
      .withIndex("by_systemId", (q) => q.eq("systemId", args.systemId))
      .first();
  },
});

export const getSavingsPlansForHome = internalQuery({
  args: { homeId: v.id("homes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("savingsPlans")
      .withIndex("by_homeId", (q) => q.eq("homeId", args.homeId))
      .collect();
  },
});

// ── Weibull Forecast Results (Workflow 1, 3, 5, 6) ────────────────

export const getForecastResultsForHome = internalQuery({
  args: { homeId: v.id("homes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("forecastResults")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .collect();
  },
});

export const getForecastResultForSystem = internalQuery({
  args: { systemId: v.id("systems") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("forecastResults")
      .withIndex("by_system", (q) => q.eq("systemId", args.systemId))
      .first();
  },
});

// ── Maintenance Tasks (Workflow 5) ─────────────────────────────────

export const getMaintenanceTasksForHome = internalQuery({
  args: { homeId: v.id("homes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("maintenanceTasks")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .collect();
  },
});

// ── Quote Records (Workflow 4) ─────────────────────────────────────

export const getQuoteRecordsForSystem = internalQuery({
  args: { systemId: v.id("systems") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("quoteRecords")
      .withIndex("by_systemId", (q) => q.eq("systemId", args.systemId))
      .collect();
  },
});

// ── Sweep Results (Workflow 5) ─────────────────────────────────────

export const getLatestSweep = internalQuery({
  args: { homeId: v.id("homes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sweepResults")
      .withIndex("by_homeId", (q) => q.eq("homeId", args.homeId))
      .order("desc")
      .first();
  },
});

// ── System Archive (Workflow 6) ────────────────────────────────────

export const getSystemArchivesForHome = internalQuery({
  args: { homeId: v.id("homes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("systemArchive")
      .withIndex("by_homeId", (q) => q.eq("homeId", args.homeId))
      .collect();
  },
});

// ── Cost Data (Workflow 4) ─────────────────────────────────────────

export const getCostData = internalQuery({
  args: {
    systemCategory: v.string(),
    systemSubtype: v.string(),
    region: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("costData")
      .withIndex("by_category_subtype_region", (q) =>
        q
          .eq("systemCategory", args.systemCategory)
          .eq("systemSubtype", args.systemSubtype)
          .eq("region", args.region)
      )
      .first();
  },
});

// ── Weather Alerts (Workflow 3) ────────────────────────────────────

export const getWeatherAlertById = internalQuery({
  args: { alertId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("weatherAlerts")
      .withIndex("by_alertId", (q) => q.eq("alertId", args.alertId))
      .first();
  },
});

// ── Maintenance Templates (Workflow 5, 7) ──────────────────────────

export const getMaintenanceTemplatesForType = internalQuery({
  args: { systemTypeId: v.id("systemTypes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("maintenanceTemplates")
      .withIndex("by_system_type", (q) => q.eq("systemTypeId", args.systemTypeId))
      .collect();
  },
});

// ── System Type Lookup ─────────────────────────────────────────────

export const getSystemType = internalQuery({
  args: { systemTypeId: v.id("systemTypes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.systemTypeId);
  },
});

// ── Full System with Type Join ─────────────────────────────────────

export const getSystemWithType = internalQuery({
  args: { systemId: v.id("systems") },
  handler: async (ctx, args) => {
    const system = await ctx.db.get(args.systemId);
    if (!system) return null;
    const systemType = await ctx.db.get(system.systemTypeId);
    return { system, systemType };
  },
});
