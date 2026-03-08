import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// ════════════════════════════════════════════════════════════════════════
// EVENT-BASED TRIGGERS
// These are user-facing mutations called from the iOS app or backend
// hooks that enqueue agent workflows for processing.
// ════════════════════════════════════════════════════════════════════════

// ─── onWeatherAlert ──────────────────────────────────────────────────
// Called by external weather service webhook. Deduplicates by alertId,
// finds geographically affected homes, and enqueues workflows.

export const onWeatherAlert = mutation({
  args: {
    alertId: v.string(),
    alertType: v.string(),
    severity: v.union(
      v.literal("minor"),
      v.literal("moderate"),
      v.literal("severe"),
      v.literal("extreme")
    ),
    affectedArea: v.object({
      lat: v.number(),
      lng: v.number(),
      radiusKm: v.number(),
    }),
    headline: v.string(),
    description: v.string(),
    startTime: v.number(),
    endTime: v.number(),
  },
  handler: async (ctx, args) => {
    // Deduplicate by alertId
    const existing = await ctx.db
      .query("weatherAlerts")
      .withIndex("by_alertId", (q) => q.eq("alertId", args.alertId))
      .first();

    if (existing) {
      console.log(`[onWeatherAlert] Duplicate alert ${args.alertId}, skipping`);
      return existing._id;
    }

    // Store the weather alert
    const weatherAlertId = await ctx.db.insert("weatherAlerts", {
      ...args,
      processed: false,
      createdAt: Date.now(),
    });

    // Find homes within the affected radius using approximate distance
    const { lat, lng, radiusKm } = args.affectedArea;
    const homes = await ctx.db.query("homes").collect();
    const affectedHomes = homes.filter((home) => {
      if (!home.latitude || !home.longitude) return false;
      const dLat = home.latitude - lat;
      const dLng = home.longitude - lng;
      // Approximate distance in km (1 degree ≈ 111 km)
      const approxKm = Math.sqrt(dLat * dLat + dLng * dLng) * 111;
      return approxKm <= radiusKm;
    });

    // Enqueue a workflow for each affected home
    for (const home of affectedHomes) {
      if (!home.userId) continue;
      await ctx.scheduler.runAfter(0, internal.triggers.enqueueWorkflow, {
        userId: home.userId,
        homeId: home._id,
        triggerType: "weatherAlert" as const,
        triggerDetails: {
          weatherAlertId,
          metadata: {
            alertType: args.alertType,
            severity: args.severity,
            headline: args.headline,
          },
        },
      });
    }

    await ctx.db.patch(weatherAlertId, { processed: true });
    console.log(`[onWeatherAlert] Alert ${args.alertId} affected ${affectedHomes.length} homes`);
    return weatherAlertId;
  },
});

// ─── onUserSymptomReport ─────────────────────────────────────────────
// Called when a user describes a symptom ("My AC is making a clicking
// noise"). Enqueues symptom diagnosis workflow.

export const onUserSymptomReport = mutation({
  args: {
    userId: v.id("users"),
    homeId: v.id("homes"),
    systemId: v.optional(v.id("systems")),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const workflowId = await ctx.db.insert("agentWorkflows", {
      userId: args.userId,
      homeId: args.homeId,
      triggerType: "userSymptomReport",
      triggerDetails: {
        systemId: args.systemId,
        userMessage: args.message,
      },
      status: "queued",
      createdAt: Date.now(),
    });

    await ctx.scheduler.runAfter(0, internal.agent.engine.run, { workflowId });
    return workflowId;
  },
});

// ─── onUserPhotoUpload ───────────────────────────────────────────────
// Called when a user uploads a photo for AI analysis (rating plate,
// visible damage, system condition). Enqueues photo analysis workflow.

export const onUserPhotoUpload = mutation({
  args: {
    userId: v.id("users"),
    homeId: v.id("homes"),
    systemId: v.optional(v.id("systems")),
    storageId: v.string(),
    context: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const workflowId = await ctx.db.insert("agentWorkflows", {
      userId: args.userId,
      homeId: args.homeId,
      triggerType: "userPhotoUpload",
      triggerDetails: {
        systemId: args.systemId,
        photoStorageId: args.storageId,
        userMessage: args.context,
      },
      status: "queued",
      createdAt: Date.now(),
    });

    await ctx.scheduler.runAfter(0, internal.agent.engine.run, { workflowId });
    return workflowId;
  },
});

// ─── onUserQuoteInput ────────────────────────────────────────────────
// Called when a user enters a contractor quote for evaluation. The agent
// compares against regional cost data and system age to assess fairness.

export const onUserQuoteInput = mutation({
  args: {
    userId: v.id("users"),
    homeId: v.id("homes"),
    systemId: v.id("systems"),
    quoteAmountCents: v.number(),
    contractorName: v.optional(v.string()),
    scopeDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const workflowId = await ctx.db.insert("agentWorkflows", {
      userId: args.userId,
      homeId: args.homeId,
      triggerType: "userQuoteInput",
      triggerDetails: {
        systemId: args.systemId,
        quoteAmountCents: args.quoteAmountCents,
        userMessage: args.scopeDescription,
        metadata: { contractorName: args.contractorName },
      },
      status: "queued",
      createdAt: Date.now(),
    });

    await ctx.scheduler.runAfter(0, internal.agent.engine.run, { workflowId });
    return workflowId;
  },
});

// ─── onSystemFailureReport ───────────────────────────────────────────
// Called when a user reports a system failure. Immediately marks the
// system as "failed" and enqueues urgent workflow. Emergency failures
// auto-create an escalation action without waiting for approval.

export const onSystemFailureReport = mutation({
  args: {
    userId: v.id("users"),
    homeId: v.id("homes"),
    systemId: v.id("systems"),
    failureDescription: v.string(),
    isEmergency: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Immediately mark system condition as failed
    await ctx.db.patch(args.systemId, { condition: "failed" });

    const workflowId = await ctx.db.insert("agentWorkflows", {
      userId: args.userId,
      homeId: args.homeId,
      triggerType: "systemFailureReport",
      triggerDetails: {
        systemId: args.systemId,
        userMessage: args.failureDescription,
        metadata: { isEmergency: args.isEmergency },
      },
      status: "queued",
      createdAt: Date.now(),
    });

    await ctx.scheduler.runAfter(0, internal.agent.engine.run, { workflowId });

    // For emergencies, immediately create a critical notification + action item
    // (bypasses the agent loop for instant user visibility)
    if (args.isEmergency) {
      await ctx.db.insert("notifications", {
        userId: args.userId,
        type: "safety",
        title: `EMERGENCY: System Failure Reported`,
        body: `${args.failureDescription}. Immediate professional attention required.`,
        priority: "critical",
        read: false,
        relatedSystemId: args.systemId,
        createdAt: Date.now(),
      });

      await ctx.db.insert("actionItems", {
        userId: args.userId,
        homeId: args.homeId,
        systemId: args.systemId,
        title: `EMERGENCY: ${args.failureDescription}`,
        description: `System has been reported as failed. Contact a licensed professional immediately.`,
        urgency: "critical",
        category: "safety",
        status: "open",
        createdAt: Date.now(),
      });
    }

    return workflowId;
  },
});

// ─── onOnboardingComplete ────────────────────────────────────────────
// Called when a user completes the onboarding walkthrough. Enqueues a
// workflow that generates initial forecasts, maintenance schedules,
// and a welcome insight for all added systems.

export const onOnboardingComplete = mutation({
  args: {
    userId: v.id("users"),
    homeId: v.id("homes"),
    systemIds: v.array(v.id("systems")),
  },
  handler: async (ctx, args) => {
    const workflowId = await ctx.db.insert("agentWorkflows", {
      userId: args.userId,
      homeId: args.homeId,
      triggerType: "onboardingComplete",
      triggerDetails: {
        metadata: {
          systemCount: args.systemIds.length,
          systemIds: args.systemIds,
        },
      },
      status: "queued",
      createdAt: Date.now(),
    });

    await ctx.scheduler.runAfter(0, internal.agent.engine.run, { workflowId });
    return workflowId;
  },
});

// ─── checkForecastThreshold ──────────────────────────────────────────
// Called after updating a forecast to check if a threshold was crossed.
// This is a mutation hook — call it inline after any forecast update.

export const checkForecastThreshold = mutation({
  args: {
    forecastId: v.id("forecastResults"),
  },
  handler: async (ctx, args) => {
    const forecast = await ctx.db.get(args.forecastId);
    if (!forecast) return null;

    const thresholds = [0.40, 0.60, 0.75, 0.90] as const;
    const currentThreshold = forecast.nextThreshold ?? 0;

    // Use cumulativeFailureProbability if present, else derive from 5yr probability
    const cfp = forecast.cumulativeFailureProbability
      ?? forecast.failureProbabilityNext5Years
      ?? 0;

    let crossed: number | null = null;
    for (const t of thresholds) {
      if (cfp >= t && currentThreshold < t) {
        crossed = t;
        break;
      }
    }

    if (crossed === null) return null;

    const system = await ctx.db.get(forecast.systemId);
    if (!system) return null;
    const home = await ctx.db.get(system.homeId);
    if (!home || !home.userId) return null;

    // Advance the next threshold watermark
    const nextIdx = thresholds.indexOf(crossed as typeof thresholds[number]) + 1;
    await ctx.db.patch(args.forecastId, {
      nextThreshold: nextIdx < thresholds.length ? thresholds[nextIdx] : 1.0,
    });

    // Enqueue the agent workflow
    const workflowId = await ctx.db.insert("agentWorkflows", {
      userId: home.userId,
      homeId: home._id,
      triggerType: "forecastThresholdCrossed",
      triggerDetails: {
        systemId: system._id,
        forecastId: forecast._id,
        thresholdCrossed: crossed,
      },
      status: "queued",
      createdAt: Date.now(),
    });

    await ctx.scheduler.runAfter(0, internal.agent.engine.run, { workflowId });
    return workflowId;
  },
});
