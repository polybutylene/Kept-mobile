"use node";

/**
 * Voice Concierge — AI phone agent that schedules service appointments
 *
 * Premium users can request Kept to call service providers on their behalf.
 * Uses Bland AI for voice calls, with Stratum Co. routing for internal leads.
 */

import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";

// ============================================================
// Bland AI Client
// ============================================================

const BLAND_API_URL = "https://api.bland.ai/v1";

async function initiateCall(args: {
  phoneNumber: string;
  task: string;
  voice?: string;
  maxDuration?: number;
  metadata?: Record<string, string>;
  transferPhone?: string;
}): Promise<{ callId: string; status: string }> {
  const apiKey = process.env.BLAND_API_KEY;
  if (!apiKey) throw new Error("BLAND_API_KEY not configured");

  const response = await fetch(`${BLAND_API_URL}/calls`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify({
      phone_number: args.phoneNumber,
      task: args.task,
      voice: args.voice || "maya",
      max_duration: args.maxDuration || 5,
      wait_for_greeting: true,
      record: true,
      metadata: args.metadata || {},
      transfer_phone_number: args.transferPhone,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Bland AI call failed: ${err}`);
  }

  return response.json();
}

async function getCallStatus(callId: string): Promise<{
  status: string;
  duration: number;
  transcript: string;
}> {
  const apiKey = process.env.BLAND_API_KEY;
  if (!apiKey) throw new Error("BLAND_API_KEY not configured");

  const response = await fetch(`${BLAND_API_URL}/calls/${callId}`, {
    headers: { Authorization: apiKey },
  });
  return response.json();
}

// ============================================================
// Conversation Prompt Builder
// ============================================================

function buildCallPrompt(request: any, provider: any): string {
  const sys = request.systemContext;

  return `You are calling on behalf of a homeowner to schedule a ${request.requestType} appointment.

YOUR IDENTITY:
- You are Kept, a home maintenance assistant calling on behalf of a homeowner
- Be professional, friendly, and efficient
- You are NOT the homeowner — you are their scheduling assistant

THE SERVICE NEEDED:
- Service type: ${request.serviceCategory} ${request.requestType}
- Description: ${request.description}
${sys ? `- Equipment: ${sys.make || ""} ${sys.model || ""}, approximately ${sys.age || "unknown"} years old` : ""}
${sys?.issue ? `- Issue: ${sys.issue}` : ""}
- Urgency: ${request.urgency === "emergency" ? "Urgent — needs attention ASAP" : request.urgency === "soon" ? "Within the next week" : "Flexible, within 2-3 weeks"}

HOMEOWNER INFORMATION:
- Location: ${request.homeownerAddress}
- Availability: ${request.preferredDays?.join(", ") || "Flexible"}, ${request.preferredTimeWindow || "flexible time"}
- Contact: ${request.homeownerPhone}

YOUR GOALS:
1. Identify yourself: "Hi, I'm calling from Kept, a home maintenance service, on behalf of a homeowner in the area."
2. Describe the service needed
3. Ask if they service the area and handle this type of work
4. If yes, ask about earliest availability
5. Share homeowner's availability preferences
6. Confirm appointment date, time, and any cost estimate
7. Provide homeowner's contact number
8. Thank them and end

IF ASKED QUESTIONS YOU CAN'T ANSWER:
- "I'd be happy to have the homeowner call you directly. Their number is ${request.homeownerPhone}."

IF THEY CAN'T HELP:
- Thank them politely and end the call

IF VOICEMAIL:
- "Hi, this is Kept calling on behalf of a homeowner who needs ${request.serviceCategory} service. Please call back at ${request.homeownerPhone}. Thank you."

RULES:
- Never share info beyond what's listed
- Never agree to pricing — just note what they quote
- Keep under 3 minutes
- Be warm but efficient`;
}

// ============================================================
// Create Service Request
// ============================================================

export const createServiceRequest = action({
  args: {
    systemId: v.optional(v.id("systems")),
    requestType: v.string(),
    serviceCategory: v.string(),
    description: v.string(),
    urgency: v.string(),
    preferredDays: v.optional(v.array(v.string())),
    preferredTimeWindow: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<any> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile: any = await ctx.runQuery(internal.manualIntelligenceQueries.getProfile, { userId });
    if (!profile) throw new Error("Profile not found");
    if (profile.tier !== "premium") {
      throw new Error("Voice Concierge requires Kept Premium");
    }

    let systemContext: any = undefined;
    if (args.systemId) {
      const system: any = await ctx.runQuery(internal.manualIntelligenceQueries.getSystem, {
        systemId: args.systemId,
      });
      if (system) {
        systemContext = {
          make: system.manufacturer,
          model: system.modelNumber,
          age: system.installDate
            ? Math.floor((Date.now() - new Date(system.installDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
            : undefined,
          issue: args.description,
          healthScore: system.healthScore,
        };
      }
    }

    // Get homeowner's primary home for address
    const homes: any[] = await ctx.runQuery(internal.voiceConciergeQueries.getUserHomes, { userId });
    const home = homes[0];

    const requestId = await ctx.runMutation(internal.voiceConciergeMutations.createRequest, {
      userId,
      systemId: args.systemId,
      requestType: args.requestType,
      serviceCategory: args.serviceCategory,
      description: args.description,
      urgency: args.urgency,
      systemContext,
      preferredDays: args.preferredDays,
      preferredTimeWindow: args.preferredTimeWindow,
      homeownerPhone: profile.phone || "",
      homeownerAddress: home
        ? `${home.addressLine1 || ""}, ${home.city || ""}, ${home.state || ""} ${home.zipCode || ""}`
        : "",
    });

    // Start calling providers asynchronously
    await ctx.scheduler.runAfter(0, internal.voiceConcierge.executeServiceCalls, { requestId });

    return requestId;
  },
});

// ============================================================
// Execute Service Calls (Background)
// ============================================================

export const executeServiceCalls = internalAction({
  args: { requestId: v.id("voiceServiceRequests") },
  handler: async (ctx, args) => {
    const request: any = await ctx.runQuery(internal.voiceConciergeQueries.getRequest, {
      requestId: args.requestId,
    });
    if (!request) return;

    const providers: any[] = await ctx.runQuery(internal.voiceConciergeQueries.getProviders, {
      category: request.serviceCategory,
    });

    if (providers.length === 0) {
      await ctx.runMutation(internal.voiceConciergeMutations.updateRequestStatus, {
        requestId: args.requestId,
        status: "failed",
      });
      return;
    }

    await ctx.runMutation(internal.voiceConciergeMutations.updateRequestStatus, {
      requestId: args.requestId,
      status: "calling",
    });

    // Sort: Stratum Co. first, then preferred, then by rating
    const sorted = [...providers].sort((a, b) => {
      if (a.isStratumCo && !b.isStratumCo) return -1;
      if (!a.isStratumCo && b.isStratumCo) return 1;
      if (a.isPreferred && !b.isPreferred) return -1;
      if (!a.isPreferred && b.isPreferred) return 1;
      return (b.rating || 0) - (a.rating || 0);
    });

    for (const provider of sorted.slice(0, 3)) {
      // For Stratum Co., route internally
      if (provider.isStratumCo) {
        await ctx.runMutation(internal.voiceConciergeMutations.recordCallAttempt, {
          requestId: args.requestId,
          attempt: {
            providerName: provider.name,
            providerPhone: provider.phone,
            callStartedAt: Date.now(),
            callEndedAt: Date.now(),
            duration: 0,
            outcome: "scheduled",
            notes: "Routed internally to Stratum Co.",
          },
        });

        await ctx.runMutation(internal.voiceConciergeMutations.markScheduled, {
          requestId: args.requestId,
          provider: provider.name,
          providerPhone: provider.phone,
        });

        try {
          const profileId: any = await ctx.runQuery(
            internal.voiceConciergeQueries.getProfileIdForUser,
            { userId: request.userId }
          );
          if (profileId) {
            await ctx.scheduler.runAfter(0, internal.pushNotifications.sendPushNotification, {
              userId: profileId,
              title: "Service appointment scheduled",
              body: `${provider.name} will contact you to confirm your ${request.serviceCategory} appointment.`,
            });
          }
        } catch { /* push is non-critical */ }

        return;
      }

      // External providers — use Bland AI
      try {
        const prompt = buildCallPrompt(request, provider);
        const { callId } = await initiateCall({
          phoneNumber: provider.phone,
          task: prompt,
          voice: "maya",
          maxDuration: 5,
          metadata: { requestId: args.requestId },
          transferPhone: request.homeownerPhone,
        });

        // Poll for completion (up to 5 minutes)
        let callComplete = false;
        let attempts = 0;
        while (!callComplete && attempts < 30) {
          await new Promise((resolve) => setTimeout(resolve, 10000));
          const status = await getCallStatus(callId);

          if (status.status === "completed" || status.status === "failed") {
            callComplete = true;
            const outcome = parseCallOutcome(status.transcript);

            await ctx.runMutation(internal.voiceConciergeMutations.recordCallAttempt, {
              requestId: args.requestId,
              attempt: {
                providerName: provider.name,
                providerPhone: provider.phone,
                callId,
                callStartedAt: Date.now() - status.duration * 1000,
                callEndedAt: Date.now(),
                duration: status.duration,
                outcome: outcome.result,
                notes: outcome.notes,
                transcript: status.transcript,
              },
            });

            if (outcome.result === "scheduled") {
              await ctx.runMutation(internal.voiceConciergeMutations.markScheduled, {
                requestId: args.requestId,
                provider: provider.name,
                providerPhone: provider.phone,
                appointmentTime: outcome.appointmentTime,
                estimatedCost: outcome.estimatedCost,
              });

              try {
                const pid: any = await ctx.runQuery(
                  internal.voiceConciergeQueries.getProfileIdForUser,
                  { userId: request.userId }
                );
                if (pid) {
                  await ctx.scheduler.runAfter(0, internal.pushNotifications.sendPushNotification, {
                    userId: pid,
                    title: "Service appointment scheduled",
                    body: `${provider.name} is scheduled${outcome.appointmentTime ? ` for ${outcome.appointmentTime}` : ""}. They may call to confirm.`,
                  });
                }
              } catch { /* push is non-critical */ }

              return;
            }
          }
          attempts++;
        }
      } catch (error) {
        console.error(`[voiceConcierge] Call to ${provider.name} failed:`, error);
        continue;
      }
    }

    // All calls exhausted
    await ctx.runMutation(internal.voiceConciergeMutations.updateRequestStatus, {
      requestId: args.requestId,
      status: "failed",
    });

    try {
      const pid2: any = await ctx.runQuery(
        internal.voiceConciergeQueries.getProfileIdForUser,
        { userId: request.userId }
      );
      if (pid2) {
        await ctx.scheduler.runAfter(0, internal.pushNotifications.sendPushNotification, {
          userId: pid2,
          title: "Could not schedule appointment",
          body: `We weren't able to reach a provider for your ${request.serviceCategory} request. You can try again or call directly.`,
        });
      }
    } catch { /* push is non-critical */ }
  },
});

// ============================================================
// Parse call outcome from transcript
// ============================================================

function parseCallOutcome(transcript: string): {
  result: string;
  notes: string;
  appointmentTime?: string;
  estimatedCost?: string;
} {
  const lower = (transcript || "").toLowerCase();

  if (lower.includes("scheduled") || lower.includes("appointment") || lower.includes("confirmed") || lower.includes("see you")) {
    const timeMatch = transcript.match(/(\w+day|tomorrow|next week)[\s,]*(?:at\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
    const costMatch = transcript.match(/\$(\d+(?:\.\d{2})?)/);

    return {
      result: "scheduled",
      notes: "Appointment confirmed via phone call",
      appointmentTime: timeMatch ? `${timeMatch[1]} ${timeMatch[2] || ""}`.trim() : undefined,
      estimatedCost: costMatch ? `$${costMatch[1]}` : undefined,
    };
  }

  if (lower.includes("voicemail") || lower.includes("leave a message")) {
    return { result: "voicemail", notes: "Left voicemail" };
  }

  if (lower.includes("callback") || lower.includes("call back") || lower.includes("call you back")) {
    return { result: "callback", notes: "Provider will call back" };
  }

  if (lower.includes("don't service") || lower.includes("can't help") || lower.includes("not available")) {
    return { result: "declined", notes: "Provider unable to service" };
  }

  return { result: "no_answer", notes: "No clear outcome from call" };
}
