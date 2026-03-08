"use node";

/**
 * Vault AI Analysis — Condition Grading & Code Compliance
 *
 * Analyzes photos of home systems to grade condition (1-10)
 * and check for code compliance issues.
 */

import { action } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { callClaude, fileToBase64, extractResponseText } from "./claude";
import { buildConditionGradingPrompt, buildCompliancePrompt } from "./prompts";
import { BASE_RUBRIC } from "./gradingRubrics";
import { getAuthUserId } from "@convex-dev/auth/server";
import { calculateAge } from "../lib/weibull";

// ============================================================
// CONDITION GRADING
// ============================================================

export const analyzeCondition = action({
  args: {
    documentId: v.id("serviceDocuments"),
  },
  handler: async (ctx, args): Promise<Record<string, unknown>> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // 1. Fetch the document
    const doc: any = await ctx.runQuery(internal.ai.vaultQueries.getDocument, {
      documentId: args.documentId,
    });
    if (!doc) throw new Error("Document not found");
    if (!doc.mimeType?.startsWith("image/")) {
      throw new Error("Condition grading requires an image file");
    }

    // 2. Get system details for context
    let systemType = "other";
    let systemName = "Unknown System";
    let systemAge: number | null = null;

    if (doc.systemId) {
      const systemInfo: any = await ctx.runQuery(
        internal.ai.vaultQueries.getSystemInfo,
        { systemId: doc.systemId }
      );
      if (systemInfo) {
        systemType = systemInfo.category;
        systemName = systemInfo.name;
        systemAge = systemInfo.age;
      }
    }

    try {
      // 3. Convert image to base64
      const { data, mediaType } = await fileToBase64(ctx, doc.storageId);

      // 4. Build prompt with rubric
      const prompt = buildConditionGradingPrompt(
        systemType,
        systemName,
        systemAge,
        BASE_RUBRIC
      );

      // 5. Call Claude Vision
      const response = await callClaude({
        systemPrompt: prompt,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data } },
              { type: "text", text: `Assess the condition of this ${systemName}.` },
            ],
          },
        ],
        maxTokens: 1500,
        temperature: 0.2,
      });

      // 6. Parse structured response
      const responseText = extractResponseText(response);
      const cleaned = responseText.replace(/```json\n?|```/g, "").trim();
      const result = JSON.parse(cleaned);

      // 7. Update the document with AI analysis
      await ctx.runMutation(internal.ai.vaultMutations.updateConditionGrade, {
        documentId: args.documentId,
        conditionGrade: result.conditionGrade,
        conditionLabel: result.conditionLabel,
        confidence: result.confidence,
        observations: result.observations ?? [],
        concerns: result.concerns ?? [],
        recommendations: result.recommendations ?? [],
      });

      // 8. Feed condition grade back to forecasting engine
      if (doc.systemId && result.conditionGrade) {
        await ctx.runMutation(
          internal.ai.vaultMutations.applyConditionAdjustment,
          {
            systemId: doc.systemId,
            conditionGrade: result.conditionGrade,
          }
        );
      }

      return result;
    } catch (error) {
      console.error("Condition analysis failed:", error);
      throw new Error("Failed to analyze condition. Please try again.");
    }
  },
});

// ============================================================
// CODE COMPLIANCE CHECK
// ============================================================

export const checkCompliance = action({
  args: {
    documentId: v.id("serviceDocuments"),
  },
  handler: async (ctx, args): Promise<Record<string, unknown>> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // 1. Fetch document
    const doc: any = await ctx.runQuery(internal.ai.vaultQueries.getDocument, {
      documentId: args.documentId,
    });
    if (!doc) throw new Error("Document not found");
    if (!doc.mimeType?.startsWith("image/")) {
      throw new Error("Compliance checking requires an image file");
    }

    // 2. Get system and home details for context
    let systemType = "other";
    let systemName = "Unknown System";
    let state = "US"; // Default

    if (doc.systemId) {
      const systemInfo: any = await ctx.runQuery(
        internal.ai.vaultQueries.getSystemInfo,
        { systemId: doc.systemId }
      );
      if (systemInfo) {
        systemType = systemInfo.category;
        systemName = systemInfo.name;
        state = systemInfo.homeState || state;
      }
    }

    try {
      // 3. Convert image to base64
      const { data, mediaType } = await fileToBase64(ctx, doc.storageId);

      // 4. Build compliance prompt
      const prompt = buildCompliancePrompt(systemType, systemName, state);

      // 5. Call Claude Vision
      const response = await callClaude({
        systemPrompt: prompt,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data } },
              {
                type: "text",
                text: `Check the installation of this ${systemName} for code compliance in ${state}.`,
              },
            ],
          },
        ],
        maxTokens: 2000,
        temperature: 0.2,
      });

      // 6. Parse structured response
      const responseText = extractResponseText(response);
      const cleaned = responseText.replace(/```json\n?|```/g, "").trim();
      const result = JSON.parse(cleaned);

      // 7. Update the document with compliance flags
      await ctx.runMutation(internal.ai.vaultMutations.updateComplianceFlags, {
        documentId: args.documentId,
        complianceStatus: result.overallCompliance,
        flags: result.flags ?? [],
      });

      return result;
    } catch (error) {
      console.error("Compliance check failed:", error);
      throw new Error("Failed to check compliance. Please try again.");
    }
  },
});
