"use node";

/**
 * Chat Action — Core conversational AI
 *
 * This is the main entry point for the AI advisor.
 * Both web (Next.js) and mobile (React Native) call this same action.
 */

import { action } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { callClaude, extractResponseText } from "./claude";
import { buildAdvisorSystemPrompt } from "./prompts";
import { getAuthUserId } from "@convex-dev/auth/server";

// ============================================================
// Send Message — main chat action
// ============================================================

export const sendMessage = action({
  args: {
    conversationId: v.optional(v.id("conversations")),
    homeId: v.id("homes"),
    userMessage: v.string(),
    focusSystemId: v.optional(v.id("systems")),
    troubleshootingSessionId: v.optional(v.id("troubleshootingSessions")),
  },
  handler: async (ctx, args): Promise<{
    conversationId: Id<"conversations">;
    messageContent: string;
    references: { type: string; id: string; label: string }[] | undefined;
    suggestedActions: { type: string; label: string; metadata?: unknown }[] | undefined;
  }> => {
    // 1. Authenticate
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Look up user profile
    const profile: { _id: Id<"userProfiles"> } | null = await ctx.runQuery(
      internal.ai.queries.getProfileByUserId,
      { userId }
    );
    if (!profile) throw new Error("User profile not found");

    // 2. Create or fetch conversation FIRST so we can always return it
    const conversationId: Id<"conversations"> = args.conversationId ?? await ctx.runMutation(
      internal.ai.chatMutations.createConversation,
      {
        homeId: args.homeId,
        userId: profile._id,
        title: args.userMessage.slice(0, 80),
      }
    );

    // 3. Save the user's message (before rate check so user sees their own message)
    await ctx.runMutation(internal.ai.chatMutations.saveMessage, {
      conversationId,
      role: "user",
      content: args.userMessage,
    });

    // 4. Check rate limit AFTER saving the user message
    // This way the conversation + user message are always persisted,
    // and the frontend can set activeConversationId even if rate-limited.
    const rateLimit = await ctx.runQuery(
      internal.ai.queries.checkChatRateLimit,
      { userId: profile._id }
    ) as { allowed: boolean; remaining: number; limit: number };

    if (!rateLimit.allowed) {
      // Save a system message explaining the limit, then return normally
      await ctx.runMutation(internal.ai.chatMutations.saveMessage, {
        conversationId,
        role: "assistant",
        content: `You've reached your daily message limit (${rateLimit.limit} messages/day). Your limit resets at midnight UTC. Upgrade to the Homeowner plan for 200 messages/day.`,
      });

      return {
        conversationId,
        messageContent: `You've reached your daily message limit (${rateLimit.limit} messages/day). Your limit resets at midnight UTC.`,
        references: undefined,
        suggestedActions: undefined,
      };
    }

    // 5. Build context, call Claude, and save response
    // Wrapped in try/catch so we always return conversationId to the frontend
    try {
      const homeContext = await ctx.runQuery(
        internal.ai.queries.getHomeContextInternal,
        { homeId: args.homeId }
      );

      // Build optional focus context
      let forecastContext = null;
      let documentContext = null;
      let knowledgeContext = null;
      if (args.focusSystemId) {
        forecastContext = await ctx.runQuery(
          internal.ai.queries.getForecastContextInternal,
          { systemId: args.focusSystemId }
        );
        documentContext = await ctx.runQuery(
          internal.ai.queries.getDocumentContextInternal,
          { homeId: args.homeId, systemId: args.focusSystemId }
        );
        knowledgeContext = await ctx.runQuery(
          internal.ai.queries.getKnowledgeContextInternal,
          { systemId: args.focusSystemId }
        );
      } else {
        // Always include vault context even without a focused system
        try {
          documentContext = await ctx.runQuery(
            internal.ai.queries.getDocumentContextInternal,
            { homeId: args.homeId }
          );
        } catch {
          // Vault context is non-critical
        }
      }

      // Always build maintenance context (overdue/upcoming tasks)
      const maintenanceContext = await ctx.runQuery(
        internal.ai.queries.getMaintenanceContextInternal,
        { homeId: args.homeId }
      );

      // Build troubleshooting context if escalated from a session
      let troubleshootingContext = null;
      if (args.troubleshootingSessionId) {
        troubleshootingContext = await ctx.runQuery(
          internal.ai.queries.getTroubleshootingContextInternal,
          { sessionId: args.troubleshootingSessionId }
        );
      }

      // Build journey context if there's an active service journey
      let journeyContext: string | null = null;
      try {
        journeyContext = await ctx.runQuery(
          internal.serviceJourneys.getJourneyContext,
          { conversationId }
        );
      } catch {
        // Journey context is non-critical
      }

      // Build system prompt with full context
      let systemPrompt = buildAdvisorSystemPrompt(
        homeContext,
        forecastContext,
        documentContext,
        maintenanceContext,
        troubleshootingContext,
        journeyContext,
        knowledgeContext
      );

      // === CONTINUOUS LEARNING: Inject intelligence context ===
      let intelligenceSystemType: string | undefined;
      let intelligenceMake: string | undefined;
      let intelligenceRegion: string | undefined;

      if (args.focusSystemId) {
        try {
          const focusedSystem: any = await ctx.runQuery(
            internal.ai.queries.getHomeContextInternal,
            { homeId: args.homeId }
          );
          if (focusedSystem?.systems) {
            const matched = focusedSystem.systems.find(
              (s: any) => s.id === args.focusSystemId
            );
            if (matched) {
              intelligenceSystemType = matched.systemTypeName || matched.name;
              intelligenceMake = matched.manufacturer;
            }
          }
        } catch { /* non-critical */ }
      }

      if (homeContext) {
        const hc = homeContext as any;
        if (hc.city && hc.state) {
          intelligenceRegion = `${hc.city}, ${hc.state}`;
        }
      }

      const questionCategory = classifyQuestionCategory(args.userMessage);

      try {
        const intelligenceContext = await ctx.runQuery(
          internal.intelligence.getIntelligenceContext,
          {
            systemType: intelligenceSystemType,
            systemMake: intelligenceMake,
            region: intelligenceRegion,
            questionCategory,
            questionText: args.userMessage,
          }
        );

        if (intelligenceContext) {
          systemPrompt += intelligenceContext;
          systemPrompt += INTELLIGENCE_ADDENDUM;
        }
      } catch {
        // Intelligence context is non-critical — use default knowledge
      }

      // === PREMIUM: Inject manual intelligence if available ===
      if (args.focusSystemId) {
        try {
          const isPremium = (profile as any)?.tier === "premium" ||
            ((await ctx.runQuery(internal.ai.queries.getProfileByUserId, { userId })) as any)?.tier === "premium";

          if (isPremium) {
            const manualIntel: any = await ctx.runQuery(
              internal.manualIntelligenceQueries.getIntelligenceForAdvisor,
              { systemId: args.focusSystemId }
            );

            if (manualIntel) {
              systemPrompt += buildManualIntelligenceContext(manualIntel, args.userMessage);
            }

            // === PREMIUM: Inject IoT device data if available ===
            systemPrompt += await buildIoTContext(ctx, args.focusSystemId, args.userMessage);
          }
        } catch {
          // Manual intelligence and IoT context are non-critical
        }
      }

      // Get conversation history
      const history = await ctx.runQuery(
        internal.ai.queries.getConversationHistoryInternal,
        { conversationId, maxMessages: 20 }
      );

      // Call Claude
      const claudeMessages = [
        ...history.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        { role: "user" as const, content: args.userMessage },
      ];

      const response = await callClaude({
        systemPrompt,
        messages: claudeMessages,
        maxTokens: 2048,
        temperature: 0.7,
      });

      const assistantContent = extractResponseText(response);

      // Parse structured references and actions from the response
      const references = parseReferences(assistantContent);
      const suggestedActions = parseActions(assistantContent);
      const cleanContent = stripTags(assistantContent);

      // Save assistant response
      await ctx.runMutation(internal.ai.chatMutations.saveMessage, {
        conversationId,
        role: "assistant",
        content: cleanContent,
        references,
        suggestedActions,
        tokenUsage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          model: response.model,
        },
      });

      // Update conversation metadata
      await ctx.runMutation(internal.ai.chatMutations.updateConversation, {
        conversationId,
        lastMessageAt: Date.now(),
        referencedSystemIds: args.focusSystemId
          ? [args.focusSystemId]
          : undefined,
      });

      // === CONTINUOUS LEARNING: Log this interaction for future aggregation ===
      try {
        let systemSnapshot: { systemType: string; make?: string; model?: string; age?: number; healthScore?: number; condition?: string } | undefined;
        if (args.focusSystemId && intelligenceSystemType) {
          systemSnapshot = {
            systemType: intelligenceSystemType,
            make: intelligenceMake,
          };
        }

        await ctx.runMutation(internal.intelligence.logAdvisorInteraction, {
          userId: profile._id,
          sessionId: conversationId as string,
          systemId: args.focusSystemId,
          questionCategory,
          questionText: args.userMessage,
          responseText: cleanContent.slice(0, 2000),
          recommendationType: classifyRecommendationType(cleanContent),
          recommendedAction: extractRecommendedAction(cleanContent),
          systemSnapshot,
          region: intelligenceRegion,
        });
      } catch {
        // Logging is non-critical — never block the chat
      }


      // Auto-process packet and journey actions server-side
      if (suggestedActions && suggestedActions.length > 0) {
        for (const act of suggestedActions) {
          try {
            // Home Packet — save mode selector message
            if (act.type === "show_packet_selector") {
              await ctx.runMutation(internal.ai.chatMutations.saveMessage, {
                conversationId,
                role: "assistant",
                content: "",
                structuredContent: {
                  type: "packet_mode_selector",
                  payload: {},
                },
              });
            }

            if (act.type === "start_journey") {
              const meta = act.metadata as { systemId?: string; symptom?: string } | undefined;
              if (meta?.systemId) {
                // Check if a journey already exists for this conversation
                const existingJourney = await ctx.runQuery(
                  internal.serviceJourneys.getJourneyByConversationInternal,
                  { conversationId }
                );
                if (!existingJourney) {
                  await ctx.runMutation(internal.serviceJourneys.startJourneyInternal, {
                    homeId: args.homeId,
                    systemId: meta.systemId as Id<"systems">,
                    conversationId,
                    userId: profile._id,
                    symptom: meta.symptom,
                  });
                }
              }
            }

            if (act.type === "update_diagnosis") {
              const meta = act.metadata as {
                likelyCause?: string;
                severity?: string;
                urgencyNote?: string;
                isDiyAppropriate?: boolean;
              } | undefined;
              if (meta?.likelyCause) {
                const activeJourney = await ctx.runQuery(
                  internal.serviceJourneys.getJourneyByConversationInternal,
                  { conversationId }
                );
                if (activeJourney && activeJourney.status === "triaging") {
                  await ctx.runMutation(internal.serviceJourneys.updateDiagnosisInternal, {
                    journeyId: activeJourney._id,
                    likelyCause: meta.likelyCause,
                    severity: (meta.severity as "low" | "moderate" | "high" | "emergency") || "moderate",
                    urgencyNote: meta.urgencyNote || "",
                    isDiyAppropriate: meta.isDiyAppropriate ?? false,
                    diagnosticAnswers: [],
                  });
                }
              }
            }
          } catch (e) {
            // Journey action processing is non-critical — don't fail the chat
            console.error("Failed to auto-process journey action:", act.type, e);
          }
        }
      }

      return {
        conversationId,
        messageContent: cleanContent,
        references,
        suggestedActions,
      };
    } catch (error: unknown) {
      // If the AI call fails, save an error message so the user sees something
      const errorMsg = error instanceof Error ? error.message : "An unexpected error occurred";
      console.error("Chat AI error:", errorMsg);

      await ctx.runMutation(internal.ai.chatMutations.saveMessage, {
        conversationId,
        role: "assistant",
        content: `Sorry, I wasn't able to respond right now. (${errorMsg}). Please try again.`,
      });

      return {
        conversationId,
        messageContent: `Sorry, I wasn't able to respond right now. Please try again.`,
        references: undefined,
        suggestedActions: undefined,
      };
    }
  },
});

// ============================================================
// Helper: Parse [REF:type:id:label] tags from Claude's response
// ============================================================

function parseReferences(content: string) {
  const refRegex = /\[REF:(\w+):([^:]+):([^\]]+)\]/g;
  const refs: { type: string; id: string; label: string }[] = [];
  let match;
  while ((match = refRegex.exec(content)) !== null) {
    refs.push({ type: match[1], id: match[2], label: match[3] });
  }
  return refs.length > 0 ? refs : undefined;
}

// ============================================================
// Helper: Parse [ACTION:type:label:metadata] tags
// ============================================================

function parseActions(content: string) {
  const actionRegex = /\[ACTION:(\w+):([^:]+):?([^\]]*)\]/g;
  const actions: { type: string; label: string; metadata?: unknown }[] = [];
  let match;
  while ((match = actionRegex.exec(content)) !== null) {
    let metadata;
    try {
      metadata = match[3] ? JSON.parse(match[3]) : undefined;
    } catch {
      // If metadata isn't valid JSON, skip it
    }
    actions.push({ type: match[1], label: match[2], metadata });
  }
  return actions.length > 0 ? actions : undefined;
}

// ============================================================
// Helper: Strip reference and action tags for clean display
// ============================================================

function stripTags(content: string): string {
  return content
    .replace(/\[REF:[^\]]+\]/g, "")
    .replace(/\[ACTION:[^\]]+\]/g, "")
    .replace(/\n{3,}/g, "\n\n") // collapse excessive newlines
    .trim();
}

// ============================================================
// Intelligence Addendum — injected when intelligence data is available
// ============================================================

const INTELLIGENCE_ADDENDUM = `

## INTELLIGENCE SYSTEM

You have access to aggregated, anonymized data from Kept's user base. This data
represents real-world outcomes — actual failure ages, actual repair costs, actual
troubleshooting resolution rates — from real homeowners with similar systems in
similar regions.

RULES FOR USING INTELLIGENCE DATA:

1. ALWAYS prefer intelligence-backed recommendations over generic knowledge when
   available. Real outcomes beat theoretical advice.

2. CITE your data naturally: "Based on data from 200+ similar water heaters in
   your area, the most common cause of this symptom is..."
   Never say: "Based on our database" or "According to our records."

3. RANK troubleshooting suggestions by resolution rate. The solution that works
   most often goes first, not the cheapest or easiest.

4. When regional cost benchmarks are available, use THOSE numbers instead of
   national estimates. Say: "In Bay County, a typical HVAC service call runs
   $85-$150" — not "HVAC service calls typically cost $75-$200."

5. Seasonal alerts should be PROACTIVE. If the intelligence shows their system
   type has elevated failure rates this month, lead with: "Heads up — [system
   type] issues spike this time of year in your area. Here's what to watch for..."

6. When Weibull data has been refined by real outcomes, use the refined curve
   for predictions. Note: "Based on real-world data from [N] similar systems..."

7. NEVER reveal individual user data. All intelligence is aggregated and anonymized.

8. Note confidence levels. "Based on 200 data points" is strong. "Based on
   12 data points" is directional but less certain — say so.

9. When intelligence data CONTRADICTS the manufacturer manual, present both:
   "Your Carrier manual recommends filter changes every 90 days. However, based
   on data from 150+ similar systems in Florida's climate, most homeowners find
   that 60-day changes perform better due to higher pollen and humidity."

10. If no intelligence data is available for a query, just use your standard
    knowledge — don't mention the absence of data.
`;

// ============================================================
// Question / recommendation classification helpers
// ============================================================

function classifyQuestionCategory(text: string): string {
  const lower = text.toLowerCase();
  if (lower.match(/cost|price|how much|estimate|budget|afford|expensive|cheap/)) return "cost";
  if (lower.match(/broken|not working|failed|leak|noise|smell|issue|problem|wrong|help/)) return "troubleshooting";
  if (lower.match(/maintain|maintenance|service|filter|clean|inspect|check|tune/)) return "maintenance";
  if (lower.match(/warrant|coverage|claim|expire/)) return "warranty";
  return "general";
}

function classifyRecommendationType(text: string): string {
  const lower = text.toLowerCase();
  if (lower.match(/replace|new unit|time for a new|upgrade/)) return "replace";
  if (lower.match(/call a pro|hire|technician|licensed|professional/)) return "schedule_service";
  if (lower.match(/diy|yourself|you can|try this|here's how/)) return "diy_fix";
  if (lower.match(/keep an eye|monitor|watch for|check back/)) return "monitor";
  if (lower.match(/schedule|maintenance|service|tune-up/)) return "maintenance_task";
  return "informational";
}

function extractRecommendedAction(text: string): string | undefined {
  const actionMatch = text.match(/\[ACTION:(\w+):/);
  return actionMatch?.[1];
}

// ============================================================
// Manual Intelligence Context Builder (Premium)
// ============================================================

function buildManualIntelligenceContext(intelligence: any, userMessage: string): string {
  let ctx = "\n\n## MANUFACTURER MANUAL DATA (from owner's actual manual)\n";

  const lower = userMessage.toLowerCase();
  const isTroubleshooting = /problem|issue|noise|leak|smell|broken|not working|error|won't|clicking|humming|drip/i.test(lower);
  const isMaintenance = /maintain|clean|service|filter|flush|replace|care|how often|schedule/i.test(lower);
  const isWarranty = /warranty|covered|claim|guarantee|void/i.test(lower);
  const isSpecs = /filter size|capacity|part number|compatible|specs|dimensions|model/i.test(lower);

  if (isTroubleshooting && intelligence.troubleshooting?.length) {
    ctx += "### TROUBLESHOOTING (from manufacturer manual):\n";
    for (const t of intelligence.troubleshooting) {
      ctx += `- Symptom: ${t.symptom}\n`;
      ctx += `  Causes: ${t.possibleCauses?.join(", ") ?? "N/A"}\n`;
      ctx += `  Fixes: ${t.diyFixes?.join("; ") ?? "N/A"}\n`;
      ctx += `  Call pro when: ${t.whenToCallPro}\n\n`;
    }
  }

  if (isMaintenance && intelligence.maintenanceSchedule?.length) {
    ctx += "### MAINTENANCE SCHEDULE (from manufacturer manual):\n";
    for (const m of intelligence.maintenanceSchedule) {
      ctx += `- ${m.task}: ${m.frequency}\n  ${m.instructions}\n`;
      if (m.manufacturerWarning) ctx += `  Warning: ${m.manufacturerWarning}\n`;
      ctx += "\n";
    }
  }

  if (isWarranty && intelligence.warranty) {
    const w = intelligence.warranty;
    ctx += "### WARRANTY INFO (from manufacturer manual):\n";
    ctx += `Duration: ${w.duration}\n`;
    ctx += `Coverage: ${w.coverageDescription}\n`;
    if (w.exclusions?.length) ctx += `Exclusions: ${w.exclusions.join(", ")}\n`;
    ctx += `Transferable: ${w.transferable ? "Yes" : "No"}\n`;
    ctx += `Claim process: ${w.claimProcess}\n\n`;
  }

  if (isSpecs && intelligence.specifications) {
    const s = intelligence.specifications;
    ctx += "### SPECIFICATIONS (from manufacturer manual):\n";
    if (s.filterSize) ctx += `Filter size: ${s.filterSize}\n`;
    if (s.capacity) ctx += `Capacity: ${s.capacity}\n`;
    if (s.compatibleParts?.length) ctx += `Compatible parts: ${s.compatibleParts.join(", ")}\n`;
    ctx += "\n";
  }

  if (intelligence.safetyWarnings?.length) {
    ctx += "### SAFETY WARNINGS (from manufacturer manual):\n";
    for (const w of intelligence.safetyWarnings) {
      ctx += `- ${w}\n`;
    }
    ctx += "\n";
  }

  ctx += `IMPORTANT: When referencing manual data, prefix with "According to your manual" so the user knows this is from their specific documentation.\n`;
  return ctx;
}

// ============================================================
// IoT Data Context Builder (Premium)
// ============================================================

async function buildIoTContext(
  ctx: any,
  systemId: any,
  userMessage: string,
): Promise<string> {
  try {
    const devices: any[] = await ctx.runQuery(
      internal.iot.queries.getAggregatesForSystem,
      { systemId, period: "monthly" }
    );

    if (!devices || devices.length === 0) return "";

    const recentAggregates = devices
      .sort((a: any, b: any) => b.periodStart - a.periodStart)
      .slice(0, 6);

    if (recentAggregates.length === 0) return "";

    let iotCtx = "\n\n## LIVE IoT DATA FOR THIS SYSTEM\n";

    const byType: Record<string, any[]> = {};
    for (const agg of recentAggregates) {
      if (!byType[agg.readingType]) byType[agg.readingType] = [];
      byType[agg.readingType].push(agg);
    }

    iotCtx += "Monthly trends (last 6 months):\n";
    for (const [type, aggs] of Object.entries(byType)) {
      const latest = aggs[0];
      const avgStr = latest.avg != null ? `avg ${latest.avg.toFixed(1)}` : "";
      const sumStr = latest.sum != null ? `total ${latest.sum.toFixed(0)}` : "";
      const trendStr = latest.trendDirection ? ` (${latest.trendDirection})` : "";
      iotCtx += `- ${type}: ${[avgStr, sumStr].filter(Boolean).join(", ")}${trendStr}\n`;
    }

    const runtimeAggs = recentAggregates.filter((a: any) =>
      a.readingType.includes("runtime") && a.sum != null
    );
    if (runtimeAggs.length > 0) {
      const totalMonthlyMin = runtimeAggs.reduce((s: number, a: any) => s + (a.sum ?? 0), 0);
      const annualHours = Math.round((totalMonthlyMin / runtimeAggs.length) * 12 / 60);
      iotCtx += `\nEstimated annual runtime: ${annualHours} hours\n`;
    }

    const anomalies = recentAggregates.filter((a: any) => a.isAnomaly);
    if (anomalies.length > 0) {
      iotCtx += "\nAnomalies detected:\n";
      for (const a of anomalies) {
        iotCtx += `- ${a.anomalyDescription ?? "Unusual reading pattern"}\n`;
      }
    }

    iotCtx += `\nINSTRUCTIONS: Use this real-time data to give more precise advice. Instead of "your AC might be working hard," cite the actual runtime hours and compare to average. When IoT data suggests a different timeline than age-based estimates, mention both.\n`;

    return iotCtx;
  } catch {
    return "";
  }
}
