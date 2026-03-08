import { internalQuery, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getDocument = internalQuery({
  args: { documentId: v.id("vaultDocuments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.documentId);
  },
});

export const getSystem = internalQuery({
  args: { systemId: v.id("systems") },
  handler: async (ctx, args) => {
    const system = await ctx.db.get(args.systemId);
    if (!system) return null;
    const systemType = system.systemTypeId ? await ctx.db.get(system.systemTypeId) : null;
    return {
      ...system,
      systemTypeName: systemType?.name ?? null,
      filterSize: system.conditionNotes?.match(/filter[:\s]*(\d+x\d+x\d+)/i)?.[1] ?? null,
    };
  },
});

export const getProfile = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
  },
});

export const getBySystem = query({
  args: { systemId: v.id("systems") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("manualIntelligence")
      .withIndex("by_systemId", (q) => q.eq("systemId", args.systemId))
      .first();
  },
});

export const getByDocument = query({
  args: { documentId: v.id("vaultDocuments") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("manualIntelligence")
      .withIndex("by_sourceDocument", (q) => q.eq("sourceDocumentId", args.documentId))
      .first();
  },
});

export const getIntelligenceForAdvisor = internalQuery({
  args: { systemId: v.id("systems") },
  handler: async (ctx, args) => {
    const intelligence = await ctx.db
      .query("manualIntelligence")
      .withIndex("by_systemId", (q) => q.eq("systemId", args.systemId))
      .first();

    if (!intelligence || intelligence.extractionStatus !== "completed") return null;
    return intelligence;
  },
});
