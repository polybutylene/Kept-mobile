import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const createIntelligence = internalMutation({
  args: {
    userId: v.id("users"),
    systemId: v.id("systems"),
    sourceDocumentId: v.id("vaultDocuments"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("manualIntelligence", {
      userId: args.userId,
      systemId: args.systemId,
      sourceDocumentId: args.sourceDocumentId,
      extractionStatus: args.status,
    });
  },
});

export const updateStatus = internalMutation({
  args: {
    intelligenceId: v.id("manualIntelligence"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.intelligenceId, { extractionStatus: args.status });
  },
});

export const saveExtraction = internalMutation({
  args: {
    intelligenceId: v.id("manualIntelligence"),
    maintenanceSchedule: v.any(),
    troubleshooting: v.any(),
    warranty: v.any(),
    specifications: v.any(),
    safetyWarnings: v.any(),
    careInstructions: v.any(),
    rawExtractedText: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.intelligenceId, {
      extractionStatus: "completed",
      extractedAt: Date.now(),
      maintenanceSchedule: args.maintenanceSchedule ?? undefined,
      troubleshooting: args.troubleshooting ?? undefined,
      warranty: args.warranty ?? undefined,
      specifications: args.specifications ?? undefined,
      safetyWarnings: args.safetyWarnings ?? undefined,
      careInstructions: args.careInstructions ?? undefined,
      rawExtractedText: args.rawExtractedText,
    });
  },
});

export const updateSystemFilterSize = internalMutation({
  args: {
    systemId: v.id("systems"),
    filterSize: v.string(),
  },
  handler: async (ctx, args) => {
    const system = await ctx.db.get(args.systemId);
    if (!system) return;
    const notes = system.conditionNotes
      ? `${system.conditionNotes}\nFilter size: ${args.filterSize}`
      : `Filter size: ${args.filterSize}`;
    await ctx.db.patch(args.systemId, { conditionNotes: notes });
  },
});
