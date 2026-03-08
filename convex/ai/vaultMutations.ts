/**
 * Vault Internal Mutations
 *
 * Internal mutations used by vault analysis actions.
 */

import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Update a document with AI condition grading results
 */
export const updateConditionGrade = internalMutation({
  args: {
    documentId: v.id("serviceDocuments"),
    conditionGrade: v.number(),
    conditionLabel: v.string(),
    confidence: v.number(),
    observations: v.array(v.string()),
    concerns: v.array(v.string()),
    recommendations: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.documentId, {
      aiConditionGrade: args.conditionGrade,
      aiConditionLabel: args.conditionLabel,
      aiConditionConfidence: args.confidence,
      aiConditionObservations: args.observations,
      aiConditionConcerns: args.concerns,
      aiConditionRecommendations: args.recommendations,
      aiAnalyzedAt: Date.now(),
    });
  },
});

/**
 * Update a document with AI compliance check results
 */
export const updateComplianceFlags = internalMutation({
  args: {
    documentId: v.id("serviceDocuments"),
    complianceStatus: v.union(
      v.literal("compliant"),
      v.literal("concerns"),
      v.literal("violations_likely")
    ),
    flags: v.array(
      v.object({
        code: v.string(),
        description: v.string(),
        severity: v.union(
          v.literal("info"),
          v.literal("warning"),
          v.literal("violation")
        ),
        observation: v.string(),
        recommendation: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.documentId, {
      aiComplianceStatus: args.complianceStatus,
      aiComplianceFlags: args.flags,
      aiAnalyzedAt: Date.now(),
    });
  },
});

/**
 * Apply condition grade adjustment to a system's forecasting
 *
 * Condition grades affect the system's health score and forecast:
 * - Grade 8-10: System in better condition than age suggests -> minor health boost
 * - Grade 5-7: Expected for age -> no adjustment
 * - Grade 1-4: Worse than expected -> health penalty, flag for attention
 */
export const applyConditionAdjustment = internalMutation({
  args: {
    systemId: v.id("systems"),
    conditionGrade: v.number(),
  },
  handler: async (ctx, args) => {
    const system = await ctx.db.get(args.systemId);
    if (!system) return;

    // Convert condition grade (1-10) to a health score adjustment
    let conditionNote: string;
    let needsAttention = system.needsAttention;

    if (args.conditionGrade >= 8) {
      conditionNote = `AI condition assessment: ${args.conditionGrade}/10 — better than expected for age`;
    } else if (args.conditionGrade >= 5) {
      conditionNote = `AI condition assessment: ${args.conditionGrade}/10 — typical for age`;
    } else {
      conditionNote = `AI condition assessment: ${args.conditionGrade}/10 — showing signs of deterioration`;
      needsAttention = true;
    }

    await ctx.db.patch(args.systemId, {
      conditionNotes: conditionNote,
      needsAttention,
    });
  },
});
