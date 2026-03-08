"use node";

/**
 * AI Triage Engine for Renter Service Requests
 *
 * Analyzes incoming service requests against the property's system health data,
 * maintenance history, and Weibull forecasts to produce a two-axis priority score:
 *   - System Health Concern (0-100) — impact on property longevity
 *   - Renter Experience Concern (0-100) — impact on tenant satisfaction/safety
 *
 * Composite: systemHealth * 0.4 + experience * 0.6
 */

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";

interface TriageResult {
  priorityScore: number;
  compositeScore?: number;
  priorityLevel: string;
  systemHealthConcern: number;
  experienceConcern: number;
  matchedSystem?: string;
  matchedSystemName?: string;
  reasoning: string;
  recommendation: string;
  estimatedCost?: string;
  suggestedTimeline: string;
}

export const triageRequest = internalAction({
  args: {
    requestId: v.id("serviceRequests"),
    homeId: v.id("homes"),
    category: v.string(),
    area: v.string(),
    title: v.string(),
    description: v.string(),
    urgency: v.string(),
  },
  handler: async (ctx, args) => {
    const context = await ctx.runQuery(
      internal.serviceRequests.getTriageContext,
      { homeId: args.homeId }
    );

    if (!context) {
      console.error("[triage] Could not load context for home:", args.homeId);
      return;
    }

    const systemsList = context.systems
      .map(
        (s: any) =>
          `- ${s.name} (${s.typeName}, ${s.category}): health=${s.healthScore ?? "?"}/100, ` +
          `age=${s.installDate ? Math.floor((Date.now() - new Date(s.installDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : "?"} yrs, ` +
          `lifespan=${s.defaultLifespanYears ?? "?"} yrs, remaining=${s.remainingLifePercent ?? "?"}%`
      )
      .join("\n");

    const recentMaint = context.recentMaintenance
      .map((t: any) => `- ${t.name} (${t.category}) — completed ${t.completedDate ? new Date(t.completedDate).toLocaleDateString() : "unknown"}`)
      .join("\n") || "None";

    const openIssues = context.openIssues
      .map((t: any) => `- ${t.name} (${t.category}, ${t.status}, priority: ${t.priority})`)
      .join("\n") || "None";

    const prompt = `You are Kept's home maintenance triage agent. A renter has submitted a service request.
Analyze this request and provide a triage assessment.

PROPERTY DATA:
- Property: ${context.property.name}, ${context.property.city ?? ""} ${context.property.state ?? ""}, built ${context.property.yearBuilt ?? "unknown"}
- Systems tracked:
${systemsList || "No systems tracked"}
- Recent maintenance:
${recentMaint}
- Known issues:
${openIssues}

SERVICE REQUEST:
- Category: ${args.category}
- Area: ${args.area}
- Summary: ${args.title}
- Description: ${args.description}
- Renter-reported urgency: ${args.urgency}

TRIAGE INSTRUCTIONS:
Score the request on two independent axes (0-100 each):

1. SYSTEM HEALTH CONCERN (0-100):
How much does this request indicate a systemic issue that could worsen, cause damage, or affect the property's long-term health? Consider: Does this match a system already flagged as declining? Is this a symptom of a known failure pattern? Could ignoring this lead to cascading damage (water damage, mold, electrical fire)?

2. RENTER EXPERIENCE CONCERN (0-100):
How much does this issue impact the renter's daily comfort, safety, or satisfaction with the property? Consider: Is this a safety hazard? Does it affect habitability (no hot water, no AC in summer, no heat in winter)? Is it a nuisance that affects their quality of life? Could this lead to a negative review or early lease termination?

Then provide:
- compositeScore: weighted average (system health 40%, experience 60%)
- priorityLevel: "critical" (80-100), "high" (60-79), "medium" (40-59), "low" (0-39)
- suggestedTimeline: "immediate", "within_24h", "within_week", "can_schedule"
- recommendation: 2-3 sentence actionable recommendation for the manager
- reasoning: brief explanation of your scoring logic
- estimatedCost: rough cost range if you can estimate, or null
- matchedSystem: the _id of the tracked system this most likely relates to (if any), or null
- matchedSystemName: the name of that system, or null

Respond with ONLY a JSON object, no markdown fences or extra text.`;

    try {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        console.error("[triage] ANTHROPIC_API_KEY not configured");
        return;
      }

      const response = await fetch(ANTHROPIC_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 1024,
          temperature: 0.3,
          system: "You are a home maintenance triage AI. Respond only with valid JSON.",
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        console.error("[triage] Claude API error:", response.status, err);
        return;
      }

      const data = await response.json();
      const text = data.content
        ?.filter((b: { type: string }) => b.type === "text")
        .map((b: { text: string }) => b.text)
        .join("") ?? "";

      let parsed: TriageResult;
      try {
        const cleaned = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
        parsed = JSON.parse(cleaned);
      } catch {
        console.error("[triage] Failed to parse Claude response:", text.slice(0, 500));
        return;
      }

      // Apply override rules
      let priorityScore = parsed.priorityScore ?? parsed.compositeScore ?? 50;
      let priorityLevel = parsed.priorityLevel ?? "medium";
      let suggestedTimeline = parsed.suggestedTimeline ?? "within_week";
      const systemHealthConcern = parsed.systemHealthConcern ?? 50;
      let experienceConcern = parsed.experienceConcern ?? 50;

      const descLower = args.description.toLowerCase() + " " + args.title.toLowerCase();

      if (args.urgency === "emergency") {
        if (priorityScore < 60) priorityScore = 60;
        if (priorityLevel === "low" || priorityLevel === "medium") priorityLevel = "high";
        if (suggestedTimeline === "can_schedule" || suggestedTimeline === "within_week") {
          suggestedTimeline = "immediate";
        }
      }

      if (/gas\s*smell|spark|smoke|fire/i.test(descLower)) {
        priorityLevel = "critical";
        priorityScore = Math.max(priorityScore, 95);
        suggestedTimeline = "immediate";
      }

      if (/water|flood|leak|burst/i.test(descLower) && priorityScore < 60) {
        priorityLevel = priorityLevel === "low" ? "high" : priorityLevel;
        priorityScore = Math.max(priorityScore, 60);
      }

      if (/no\s*(heat|ac|air\s*condition|hot\s*water)/i.test(descLower)) {
        experienceConcern = Math.max(experienceConcern, 80);
        if (priorityScore < 70) priorityScore = 70;
        if (priorityLevel === "low" || priorityLevel === "medium") priorityLevel = "high";
      }

      // Match system ID from context
      let matchedSystemId: Id<"systems"> | undefined;
      let matchedSystemName: string | undefined;
      let matchedSystemHealth: number | undefined;

      if (parsed.matchedSystem || parsed.matchedSystemName) {
        const match = context.systems.find(
          (s: any) =>
            s._id === parsed.matchedSystem ||
            s.name?.toLowerCase() === parsed.matchedSystemName?.toLowerCase() ||
            s.typeName?.toLowerCase() === parsed.matchedSystemName?.toLowerCase()
        );
        if (match) {
          matchedSystemId = match._id as Id<"systems">;
          matchedSystemName = match.name ?? match.typeName;
          matchedSystemHealth = match.healthScore ?? undefined;
          if (matchedSystemHealth != null && matchedSystemHealth < 30) {
            priorityScore = Math.min(100, priorityScore + 20);
          }
        }
      }

      const mappedPriority =
        priorityLevel === "critical" ? "urgent" :
        priorityLevel === "high" ? "high" :
        priorityLevel === "medium" ? "medium" : "low";

      await ctx.runMutation(internal.serviceRequests.updateTriageResults, {
        requestId: args.requestId,
        aiTriage: {
          priorityScore,
          priorityLevel,
          systemHealthConcern,
          experienceConcern,
          matchedSystemId,
          matchedSystemName,
          matchedSystemHealth,
          reasoning: parsed.reasoning ?? "",
          recommendation: parsed.recommendation ?? "",
          estimatedCost: parsed.estimatedCost ?? undefined,
          suggestedTimeline,
          autoScheduled: false,
        },
        priority: mappedPriority,
      });

      // Send manager notification via email
      await ctx.runAction(internal.serviceRequestTriage.notifyManager, {
        requestId: args.requestId,
        homeId: args.homeId,
        title: args.title,
        priorityLevel,
        recommendation: parsed.recommendation ?? "",
        suggestedTimeline,
      });
    } catch (error) {
      console.error("[triage] Unexpected error:", error);
    }
  },
});

/**
 * Send email/SMS notification to the property manager about a new service request
 */
export const notifyManager = internalAction({
  args: {
    requestId: v.id("serviceRequests"),
    homeId: v.id("homes"),
    title: v.string(),
    priorityLevel: v.string(),
    recommendation: v.string(),
    suggestedTimeline: v.string(),
  },
  handler: async (ctx, args) => {
    const context = await ctx.runQuery(
      internal.serviceRequests.getTriageContext,
      { homeId: args.homeId }
    );
    if (!context) return;

    const home = await ctx.runQuery(internal.serviceRequests.getHomeOwnerEmail, {
      homeId: args.homeId,
    });

    if (!home?.ownerEmail) return;

    const priorityEmoji =
      args.priorityLevel === "critical" ? "🔴" :
      args.priorityLevel === "high" ? "🟠" :
      args.priorityLevel === "medium" ? "🟡" : "🟢";

    const subject = `${priorityEmoji} New Service Request — ${args.priorityLevel.toUpperCase()}: ${args.title}`;

    const body = `
      <h2 style="color: #111827; margin-top: 0;">${priorityEmoji} ${args.title}</h2>
      <p style="color: #6B7280; margin-bottom: 16px;">
        <strong>${context.property.name}</strong> · ${args.suggestedTimeline.replace(/_/g, " ")}
      </p>
      <div style="background: #F0FDFA; border: 1px solid #99F6E4; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <p style="color: #0D9488; font-weight: 600; margin: 0 0 8px 0; font-size: 13px;">✨ AI Recommendation</p>
        <p style="color: #134E4A; margin: 0;">${args.recommendation}</p>
      </div>
      <a href="https://kept.app/manager/requests" style="display: inline-block; background: #0D9488; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
        Review Request →
      </a>
    `;

    try {
      await ctx.runAction(internal.notifications.sendEmail, {
        to: home.ownerEmail,
        subject,
        body,
      });
    } catch (err) {
      console.error("[triage] Failed to send manager notification email:", err);
    }
  },
});

