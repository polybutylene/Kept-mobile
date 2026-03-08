"use node";

/**
 * Manual Intelligence — Extracts structured data from equipment manuals
 *
 * When a Premium user uploads a manual to the Smart Vault, this pipeline:
 * 1. Reads the document images/PDF
 * 2. Uses Claude to extract maintenance, troubleshooting, warranty, specs
 * 3. Stores structured data for AI Advisor context injection
 * 4. Auto-creates maintenance tasks from manufacturer schedules
 */

import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { callClaude, fileToBase64, extractResponseText, ClaudeContentBlock } from "./ai/claude";
import { getAuthUserId } from "@convex-dev/auth/server";

const EXTRACTION_PROMPT = `You are extracting structured information from a home equipment manual or product documentation.
The goal is to pull out ACTIONABLE information that helps a homeowner maintain this equipment.

Extract the following categories. For each, extract ONLY what the manual explicitly states.
Do not infer, assume, or add recommendations beyond what is written in the document.

CATEGORIES TO EXTRACT:

1. MAINTENANCE SCHEDULE — For each task the manufacturer recommends:
   - Task name, frequency, step-by-step instructions (brief), any warnings

2. TROUBLESHOOTING — For each problem/symptom:
   - Symptom, possible causes, DIY fixes, when to call a pro, severity

3. WARRANTY — Duration, coverage, exclusions, claim process, registration, transferability

4. SPECIFICATIONS — Filter size, capacity, voltage, fuel type, part numbers, dimensions

5. SAFETY WARNINGS — All safety warnings exactly as stated

6. CARE INSTRUCTIONS — Cleaning, seasonal prep, storage, do's and don'ts

Respond ONLY with a valid JSON object (no markdown, no code blocks):

{
  "maintenanceSchedule": [{"task":"","frequency":"","instructions":"","manufacturerWarning":""}],
  "troubleshooting": [{"symptom":"","possibleCauses":[],"diyFixes":[],"whenToCallPro":"","severity":""}],
  "warranty": {"duration":"","coverageDescription":"","exclusions":[],"claimProcess":"","registrationRequired":false,"transferable":false},
  "specifications": {"filterSize":"","capacity":"","voltage":"","fuelType":"","compatibleParts":[],"dimensions":""},
  "safetyWarnings": [],
  "careInstructions": [{"area":"","instruction":""}]
}

If a section has no relevant content, set it to null.`;

export const extractFromManual = internalAction({
  args: {
    userId: v.id("users"),
    systemId: v.id("systems"),
    documentId: v.id("vaultDocuments"),
    intelligenceId: v.id("manualIntelligence"),
  },
  handler: async (ctx, args) => {
    try {
      const doc: any = await ctx.runQuery(internal.manualIntelligenceQueries.getDocument, {
        documentId: args.documentId,
      });
      if (!doc) {
        await ctx.runMutation(internal.manualIntelligenceMutations.updateStatus, {
          intelligenceId: args.intelligenceId,
          status: "failed",
        });
        return;
      }

      const system: any = await ctx.runQuery(internal.manualIntelligenceQueries.getSystem, {
        systemId: args.systemId,
      });

      const content: ClaudeContentBlock[] = [];

      if (doc.storageId) {
        try {
          const file = await fileToBase64(ctx, doc.storageId);
          if (file.mediaType.startsWith("image/")) {
            content.push({
              type: "image",
              source: { type: "base64", media_type: file.mediaType, data: file.data },
            });
          } else {
            content.push({
              type: "document",
              source: { type: "base64", media_type: file.mediaType, data: file.data },
            });
          }
        } catch {
          // If file conversion fails, proceed with text-only
        }
      }

      const systemDesc = system
        ? `${system.manufacturer || "Unknown"} ${system.modelNumber || ""} (${system.systemTypeName || "equipment"})`
        : "home equipment";

      content.push({
        type: "text",
        text: `This is the manual for a ${systemDesc}. Extract all actionable maintenance, troubleshooting, warranty, and care information.`,
      });

      const response = await callClaude({
        systemPrompt: EXTRACTION_PROMPT,
        messages: [{ role: "user", content }],
        maxTokens: 4000,
        temperature: 0.3,
        enablePdfSupport: true,
      });

      const text = extractResponseText(response);
      const cleaned = text.replace(/```json|```/g, "").trim();
      let extracted: any;

      try {
        extracted = JSON.parse(cleaned);
      } catch {
        await ctx.runMutation(internal.manualIntelligenceMutations.updateStatus, {
          intelligenceId: args.intelligenceId,
          status: "failed",
        });
        return;
      }

      await ctx.runMutation(internal.manualIntelligenceMutations.saveExtraction, {
        intelligenceId: args.intelligenceId,
        maintenanceSchedule: extracted.maintenanceSchedule || null,
        troubleshooting: extracted.troubleshooting || null,
        warranty: extracted.warranty || null,
        specifications: extracted.specifications || null,
        safetyWarnings: extracted.safetyWarnings || null,
        careInstructions: extracted.careInstructions || null,
        rawExtractedText: cleaned,
      });

      // Update system filter size if extracted and not already set
      if (extracted.specifications?.filterSize && system && !system.filterSize) {
        await ctx.runMutation(internal.manualIntelligenceMutations.updateSystemFilterSize, {
          systemId: args.systemId,
          filterSize: extracted.specifications.filterSize,
        });
      }
    } catch (error) {
      console.error("[manualIntelligence] Extraction failed:", error);
      await ctx.runMutation(internal.manualIntelligenceMutations.updateStatus, {
        intelligenceId: args.intelligenceId,
        status: "failed",
      });
    }
  },
});

export const triggerExtraction = action({
  args: {
    documentId: v.id("vaultDocuments"),
    systemId: v.id("systems"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile: any = await ctx.runQuery(internal.manualIntelligenceQueries.getProfile, {
      userId,
    });
    if (!profile) throw new Error("Profile not found");

    const isPremium = profile.tier === "premium";

    const intelligenceId: Id<"manualIntelligence"> = await ctx.runMutation(
      internal.manualIntelligenceMutations.createIntelligence,
      {
        userId,
        systemId: args.systemId,
        sourceDocumentId: args.documentId,
        status: isPremium ? "processing" : "pending_upgrade",
      }
    );

    if (!isPremium) {
      return { status: "pending_upgrade", intelligenceId };
    }

    await ctx.scheduler.runAfter(0, internal.manualIntelligence.extractFromManual, {
      userId,
      systemId: args.systemId,
      documentId: args.documentId,
      intelligenceId,
    });

    return { status: "processing", intelligenceId };
  },
});
