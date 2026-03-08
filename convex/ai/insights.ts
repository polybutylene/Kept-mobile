"use node";

/**
 * Proactive Insights — AI-Generated Dashboard Intelligence
 *
 * Generates periodic insights based on home data, season, and system lifecycle.
 * Called by a Convex cron job.
 */

import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { callClaude, extractResponseText } from "./claude";
import { buildInsightsPrompt } from "./prompts";
import { HomeContext } from "./context";
import { getSeasonalContent } from "../data/seasonalContent";

/**
 * Generate insights for a single home
 */
export const generateInsights = internalAction({
  args: {
    homeId: v.id("homes"),
    userId: v.id("userProfiles"),
  },
  handler: async (ctx, args): Promise<void> => {
    // 1. Build full home context
    const homeContext = await ctx.runQuery(
      internal.ai.queries.getHomeContextInternal,
      { homeId: args.homeId }
    ) as HomeContext;

    // Don't generate insights for homes with no systems
    if (homeContext.systems.length === 0) return;

    // 2. Determine season and region
    const now = new Date();
    const month = now.getMonth();
    const season =
      month >= 2 && month <= 4
        ? "spring"
        : month >= 5 && month <= 7
        ? "summer"
        : month >= 8 && month <= 10
        ? "fall"
        : "winter";

    const region = homeContext.home.city && homeContext.home.state
      ? `${homeContext.home.city}, ${homeContext.home.state}`
      : "United States";

    // 3. Build seasonal content context
    const seasonalData = getSeasonalContent(season);
    let seasonalContext: string | null = null;
    if (seasonalData) {
      const taskLines = seasonalData.tasks.map(
        (t) => `- **${t.name}** [${t.priority}] (${t.systemCategory}): ${t.description}${t.tipFromField ? `\n  Field tip: ${t.tipFromField}` : ""}`
      );
      const alertLines = seasonalData.alerts.map(
        (a) => `- **${a.title}** [${a.priority}]: ${a.body}`
      );
      seasonalContext = `### ${seasonalData.season.toUpperCase()} (${seasonalData.months})
${seasonalData.description}

#### Seasonal Tasks
${taskLines.join("\n")}

#### Seasonal Alerts
${alertLines.join("\n")}`;
    }

    // 4. Build insights prompt
    const systemPrompt = buildInsightsPrompt(homeContext, season, region, seasonalContext);

    // 5. Call Claude
    const response = await callClaude({
      systemPrompt,
      messages: [
        {
          role: "user",
          content: "Generate proactive maintenance insights for this home.",
        },
      ],
      maxTokens: 2000,
      temperature: 0.6,
    });

    // 6. Parse response
    const responseText = extractResponseText(response);
    const cleaned = responseText.replace(/```json\n?|```/g, "").trim();

    let insights: Array<{
      type: string;
      title: string;
      body: string;
      priority: string;
      relatedSystemName?: string | null;
      suggestedAction?: { type: string; label: string } | null;
    }>;

    try {
      insights = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse insights:", responseText);
      return;
    }

    // 7. Save insights to database
    for (const insight of insights) {
      // Resolve related system ID from the AI's system name reference
      let relatedSystemId: string | undefined;
      if (insight.relatedSystemName) {
        const matchedSystem = homeContext.systems.find((s) =>
          s.name.toLowerCase().includes(insight.relatedSystemName!.toLowerCase())
        );
        if (matchedSystem) relatedSystemId = matchedSystem.id;
      }

      await ctx.runMutation(internal.ai.insightMutations.createInsight, {
        homeId: args.homeId,
        userId: args.userId,
        type: insight.type as "maintenance_reminder" | "condition_alert" | "cost_forecast" | "seasonal_tip" | "warranty_expiring" | "upload_suggestion" | "efficiency_tip",
        title: insight.title,
        body: insight.body,
        priority: insight.priority as "low" | "medium" | "high" | "urgent",
        relatedSystemId: relatedSystemId as any,
        suggestedAction: insight.suggestedAction ?? undefined,
      });
    }
  },
});

/**
 * Generate insights for ALL active homes
 *
 * This is what the cron job calls — it fans out to per-home generation.
 */
export const generateAllHomeInsights = internalAction({
  args: {},
  handler: async (ctx): Promise<void> => {
    // Get all homes with their owners
    const homes: any[] = await ctx.runQuery(
      internal.ai.insightQueries.getAllActiveHomes
    );

    for (const home of homes) {
      try {
        await ctx.runAction(internal.ai.insights.generateInsights, {
          homeId: home.homeId,
          userId: home.userId,
        });
      } catch (error) {
        console.error(`Failed to generate insights for home ${home.homeId}:`, error);
        // Continue to next home — don't let one failure stop all
      }
    }
  },
});
