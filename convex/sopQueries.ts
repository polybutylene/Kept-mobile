import { query } from "./_generated/server";
import { v } from "convex/values";

export const getSystemSOP = query({
  args: { systemId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sopSystems")
      .withIndex("by_systemId", (q) => q.eq("systemId", args.systemId))
      .first();
  },
});

export const getSystemsByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sopSystems")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
  },
});

export const getAllSystems = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("sopSystems").collect();
  },
});

export const getSystemDefects = query({
  args: { systemId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sopDefects")
      .withIndex("by_systemId", (q) => q.eq("systemId", args.systemId))
      .collect();
  },
});

export const getDefectsBySeverity = query({
  args: { severity: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sopDefects")
      .withIndex("by_severity", (q) => q.eq("severity", args.severity))
      .collect();
  },
});

export const getReportTemplates = query({
  args: { systemId: v.string(), condition: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("sopReportTemplates")
      .withIndex("by_systemId", (q) => q.eq("systemId", args.systemId))
      .collect();
    if (args.condition) {
      return results.filter((r) => r.condition === args.condition);
    }
    return results;
  },
});

export const getReportTemplateByDefect = query({
  args: { defectType: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sopReportTemplates")
      .withIndex("by_defectType", (q) => q.eq("defectType", args.defectType))
      .collect();
  },
});

export const getFloridaInspection = query({
  args: { inspectionType: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("floridaInspections")
      .withIndex("by_inspectionType", (q) =>
        q.eq("inspectionType", args.inspectionType)
      )
      .first();
  },
});

export const getAllFloridaInspections = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("floridaInspections").collect();
  },
});

export const getScopeAndLimitations = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("sopSystems")
      .withIndex("by_systemId", (q) => q.eq("systemId", "scope_and_limitations"))
      .first();
  },
});
