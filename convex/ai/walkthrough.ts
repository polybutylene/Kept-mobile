"use node";

/**
 * Walkthrough Onboarding — AI Photo Analysis
 *
 * Takes photos of home areas and uses Claude Vision to detect
 * and identify home systems and components.
 */

import { action } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { callClaude, fileToBase64, extractResponseText } from "./claude";
import { buildWalkthroughPrompt } from "./prompts";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Analyze a photo from the walkthrough flow
 */
export const analyzePhoto = action({
  args: {
    walkthroughSessionId: v.id("walkthroughSessions"),
    homeId: v.id("homes"),
    storageId: v.id("_storage"),
    area: v.string(),
  },
  handler: async (ctx, args): Promise<{ detections: Array<{
    systemType: string; name: string; brand?: string | null; model?: string | null;
    serialNumber?: string | null; estimatedAge?: string | null; condition?: string;
    details?: string | null; confidence: number;
  }> }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // 1. Convert image to base64 for Claude Vision
    const { data, mediaType } = await fileToBase64(ctx, args.storageId);

    // 2. Build the walkthrough prompt for this area
    const systemPrompt = buildWalkthroughPrompt(args.area);

    // 3. Call Claude with vision
    const response = await callClaude({
      systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data },
            },
            {
              type: "text",
              text: `Analyze this photo from my ${args.area}. Identify all home systems and components visible.`,
            },
          ],
        },
      ],
      maxTokens: 2048,
      temperature: 0.3, // Lower temperature for consistent structured output
    });

    // 4. Parse the JSON response
    const responseText = extractResponseText(response);

    let detections: Array<{
      systemType: string;
      name: string;
      brand?: string | null;
      model?: string | null;
      serialNumber?: string | null;
      estimatedAge?: string | null;
      condition?: string;
      details?: string | null;
      confidence: number;
    }>;

    try {
      // Strip markdown code fences if present
      const cleaned = responseText.replace(/```json\n?|```/g, "").trim();
      detections = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse walkthrough response:", responseText);
      detections = [];
    }

    // 5. Update the walkthrough session with detected systems
    await ctx.runMutation(internal.ai.walkthroughMutations.addDetections, {
      sessionId: args.walkthroughSessionId,
      area: args.area,
      detections: detections.map((d) => ({
        systemType: d.systemType,
        name: d.name,
        confidence: d.confidence,
        details: {
          brand: d.brand ?? null,
          model: d.model ?? null,
          serialNumber: d.serialNumber ?? null,
          estimatedAge: d.estimatedAge ?? null,
          condition: d.condition ?? "unknown",
          notes: d.details ?? null,
        },
        confirmed: false,
      })),
    });

    return { detections };
  },
});
