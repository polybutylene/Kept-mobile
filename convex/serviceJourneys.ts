/**
 * Service Journeys — Full lifecycle engine for home issues
 *
 * Manages the complete arc: triage → DIY / service prep → post-service → replacement → resolved.
 * Each journey is linked to a conversation, home, and system. State transitions are enforced.
 */

import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id, Doc } from "./_generated/dataModel";
import {
  weibullSurvival,
  conditionalFailureProbability,
  expectedRemainingLife,
  calculateAge,
} from "./lib/weibull";

// Valid state transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  triaging: ["diagnosed"],
  diagnosed: ["diy_in_progress", "prep_service_call", "planning_replacement"],
  diy_in_progress: ["diy_completed"],
  diy_completed: ["resolved", "prep_service_call", "planning_replacement"],
  prep_service_call: ["awaiting_service"],
  awaiting_service: ["post_service"],
  post_service: ["resolved", "planning_replacement", "monitoring"],
  planning_replacement: ["executing_replacement"],
  executing_replacement: ["resolved", "monitoring"],
  resolved: ["monitoring"],
  monitoring: [],
};

// ============================================================
// Queries
// ============================================================

/**
 * Get a service journey by ID
 */
export const getJourney = query({
  args: { journeyId: v.id("serviceJourneys") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const journey = await ctx.db.get(args.journeyId);
    if (!journey) return null;

    // Fetch associated system info
    const system = await ctx.db.get(journey.systemId);
    let systemTypeName: string | undefined;
    let systemName: string | undefined;
    if (system) {
      systemName = system.name;
      const systemType = await ctx.db.get(system.systemTypeId);
      systemTypeName = systemType?.name;
    }

    return { ...journey, systemName: systemName || systemTypeName, systemTypeName };
  },
});

/**
 * Get the active service journey for a conversation.
 * Prioritizes non-completed/non-abandoned sessions.
 */
export const getJourneyByConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const journeys = await ctx.db
      .query("serviceJourneys")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    if (journeys.length === 0) return null;

    // Prefer active (non-resolved, non-monitoring) journeys
    const active = journeys.filter(
      (j) => j.status !== "resolved" && j.status !== "monitoring"
    );

    if (active.length > 0) {
      return active.sort((a, b) => b.createdAt - a.createdAt)[0];
    }

    return journeys.sort((a, b) => b.createdAt - a.createdAt)[0];
  },
});

/**
 * Internal: get journey by conversation (for AI context building)
 */
export const getJourneyByConversationInternal = internalQuery({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const journeys = await ctx.db
      .query("serviceJourneys")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    if (journeys.length === 0) return null;

    const active = journeys.filter(
      (j) => j.status !== "resolved" && j.status !== "monitoring"
    );

    if (active.length > 0) {
      return active.sort((a, b) => b.createdAt - a.createdAt)[0];
    }

    return journeys.sort((a, b) => b.createdAt - a.createdAt)[0];
  },
});

/**
 * Build journey context string for AI system prompt
 */
export const getJourneyContext = internalQuery({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const journeys = await ctx.db
      .query("serviceJourneys")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    const active = journeys.filter(
      (j) => j.status !== "resolved" && j.status !== "monitoring"
    );
    const journey = active.length > 0
      ? active.sort((a, b) => b.createdAt - a.createdAt)[0]
      : null;

    if (!journey) return null;

    // Fetch system info for context
    const system = await ctx.db.get(journey.systemId);
    let systemTypeName = "Unknown";
    let systemTypeCategory = "other";
    let weibullShape = 2.0;
    let weibullScale = 15.0;
    if (system) {
      const systemType = await ctx.db.get(system.systemTypeId);
      if (systemType) {
        systemTypeName = systemType.name;
        systemTypeCategory = systemType.category;
        weibullShape = systemType.weibullShape;
        weibullScale = systemType.weibullScale;
      }
    }

    // Build age + forecast data
    let systemAge = 0;
    let failureProb1yr = 0;
    let remainingLife = 0;
    if (system?.installDate) {
      systemAge = calculateAge(system.installDate, undefined);
      failureProb1yr = conditionalFailureProbability(systemAge, 1, weibullShape, weibullScale);
      remainingLife = expectedRemainingLife(systemAge, weibullShape, weibullScale);
    }

    let contextParts: string[] = [
      `\n## ACTIVE SERVICE JOURNEY`,
      `System: ${system?.name || systemTypeName} (${systemTypeCategory})`,
      `System Age: ${systemAge.toFixed(1)} years`,
      `Failure Probability (1yr): ${(failureProb1yr * 100).toFixed(0)}%`,
      `Remaining Life Estimate: ${remainingLife.toFixed(1)} years`,
      `Journey Status: ${journey.status}`,
    ];

    if (journey.diagnosis) {
      contextParts.push(`\nDiagnosis:`);
      contextParts.push(`  Likely Cause: ${journey.diagnosis.likelyCause}`);
      contextParts.push(`  Severity: ${journey.diagnosis.severity}`);
      contextParts.push(`  Urgency: ${journey.diagnosis.urgencyNote}`);
      contextParts.push(`  DIY Appropriate: ${journey.diagnosis.isDiyAppropriate ? "Yes" : "No"}`);
      if (journey.diagnosis.diagnosticAnswers.length > 0) {
        contextParts.push(`  Diagnostic Q&A:`);
        for (const qa of journey.diagnosis.diagnosticAnswers) {
          contextParts.push(`    Q: ${qa.question}`);
          contextParts.push(`    A: ${qa.answer}`);
        }
      }
    }

    if (journey.diyAttempt) {
      contextParts.push(`\nDIY Attempt:`);
      contextParts.push(`  Progress: Step ${journey.diyAttempt.currentStep} of ${journey.diyAttempt.stepsTotal}`);
      contextParts.push(`  Completed Steps: ${journey.diyAttempt.stepsCompleted}`);
      if (journey.diyAttempt.outcome) {
        contextParts.push(`  Outcome: ${journey.diyAttempt.outcome}`);
      }
    }

    if (journey.serviceCallPrep) {
      contextParts.push(`\nService Call Prep: Completed`);
      if (journey.serviceCallPrep.expectedCostRange) {
        contextParts.push(`  Expected Cost: $${journey.serviceCallPrep.expectedCostRange.low}–$${journey.serviceCallPrep.expectedCostRange.high}`);
      }
    }

    if (journey.serviceRecord) {
      contextParts.push(`\nService Record:`);
      contextParts.push(`  Provider: ${journey.serviceRecord.providerName}`);
      contextParts.push(`  Cost: $${journey.serviceRecord.cost}`);
      contextParts.push(`  Work: ${journey.serviceRecord.workPerformed.join(", ")}`);
      if (journey.serviceRecord.techNotes) {
        contextParts.push(`  Tech Notes: ${journey.serviceRecord.techNotes}`);
      }
    }

    if (journey.quotes && journey.quotes.length > 0) {
      contextParts.push(`\nQuotes: ${journey.quotes.length} received`);
      for (const q of journey.quotes) {
        contextParts.push(`  - ${q.providerName}: $${q.totalCost} (${q.unitQuoted})${q.isChosen ? " ← CHOSEN" : ""}`);
      }
    }

    return contextParts.join("\n");
  },
});

// ============================================================
// Mutations
// ============================================================

/**
 * Start a new service journey
 */
export const startJourney = mutation({
  args: {
    homeId: v.id("homes"),
    systemId: v.id("systems"),
    conversationId: v.id("conversations"),
    symptom: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Look up the userProfile
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!profile) throw new Error("User profile not found");

    // Get system info
    const system = await ctx.db.get(args.systemId);
    if (!system) throw new Error("System not found");

    const systemType = await ctx.db.get(system.systemTypeId);
    const systemTypeName = systemType?.name?.toLowerCase().replace(/[\s-]+/g, "_") || "unknown";

    const now = Date.now();

    const journeyId = await ctx.db.insert("serviceJourneys", {
      homeId: args.homeId,
      systemId: args.systemId,
      conversationId: args.conversationId,
      userId: profile._id,
      systemType: systemTypeName,
      status: "triaging",
      createdAt: now,
      updatedAt: now,
    });

    return journeyId;
  },
});

/**
 * Internal: start a journey from AI action handler
 */
export const startJourneyInternal = internalMutation({
  args: {
    homeId: v.id("homes"),
    systemId: v.id("systems"),
    conversationId: v.id("conversations"),
    userId: v.id("userProfiles"),
    symptom: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const system = await ctx.db.get(args.systemId);
    if (!system) throw new Error("System not found");

    const systemType = await ctx.db.get(system.systemTypeId);
    const systemTypeName = systemType?.name?.toLowerCase().replace(/[\s-]+/g, "_") || "unknown";

    const now = Date.now();

    const journeyId = await ctx.db.insert("serviceJourneys", {
      homeId: args.homeId,
      systemId: args.systemId,
      conversationId: args.conversationId,
      userId: args.userId,
      systemType: systemTypeName,
      status: "triaging",
      createdAt: now,
      updatedAt: now,
    });

    return journeyId;
  },
});

/**
 * Update diagnosis after triage Q&A
 */
export const updateDiagnosis = mutation({
  args: {
    journeyId: v.id("serviceJourneys"),
    likelyCause: v.string(),
    severity: v.union(
      v.literal("low"),
      v.literal("moderate"),
      v.literal("high"),
      v.literal("emergency")
    ),
    urgencyNote: v.string(),
    isDiyAppropriate: v.boolean(),
    diagnosticAnswers: v.array(v.object({
      question: v.string(),
      answer: v.string(),
      timestamp: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const journey = await ctx.db.get(args.journeyId);
    if (!journey) throw new Error("Journey not found");

    await ctx.db.patch(args.journeyId, {
      diagnosis: {
        likelyCause: args.likelyCause,
        severity: args.severity,
        urgencyNote: args.urgencyNote,
        isDiyAppropriate: args.isDiyAppropriate,
        diagnosticAnswers: args.diagnosticAnswers,
      },
      status: "diagnosed",
      updatedAt: Date.now(),
    });
  },
});

/**
 * Internal version of updateDiagnosis for AI action handler
 */
export const updateDiagnosisInternal = internalMutation({
  args: {
    journeyId: v.id("serviceJourneys"),
    likelyCause: v.string(),
    severity: v.union(
      v.literal("low"),
      v.literal("moderate"),
      v.literal("high"),
      v.literal("emergency")
    ),
    urgencyNote: v.string(),
    isDiyAppropriate: v.boolean(),
    diagnosticAnswers: v.array(v.object({
      question: v.string(),
      answer: v.string(),
      timestamp: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const journey = await ctx.db.get(args.journeyId);
    if (!journey) throw new Error("Journey not found");

    await ctx.db.patch(args.journeyId, {
      diagnosis: {
        likelyCause: args.likelyCause,
        severity: args.severity,
        urgencyNote: args.urgencyNote,
        isDiyAppropriate: args.isDiyAppropriate,
        diagnosticAnswers: args.diagnosticAnswers,
      },
      status: "diagnosed",
      updatedAt: Date.now(),
    });
  },
});

/**
 * Advance journey to a new phase (enforce valid transitions)
 */
export const advancePhase = mutation({
  args: {
    journeyId: v.id("serviceJourneys"),
    newStatus: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const journey = await ctx.db.get(args.journeyId);
    if (!journey) throw new Error("Journey not found");

    const allowed = VALID_TRANSITIONS[journey.status] || [];
    if (!allowed.includes(args.newStatus)) {
      throw new Error(
        `Invalid transition: ${journey.status} → ${args.newStatus}. Allowed: ${allowed.join(", ")}`
      );
    }

    const patch: Record<string, unknown> = {
      status: args.newStatus,
      updatedAt: Date.now(),
    };

    if (args.newStatus === "resolved") {
      patch.resolvedAt = Date.now();
    }

    await ctx.db.patch(args.journeyId, patch);
  },
});

/**
 * Internal: advance phase from AI action handler
 */
export const advancePhaseInternal = internalMutation({
  args: {
    journeyId: v.id("serviceJourneys"),
    newStatus: v.string(),
  },
  handler: async (ctx, args) => {
    const journey = await ctx.db.get(args.journeyId);
    if (!journey) throw new Error("Journey not found");

    const allowed = VALID_TRANSITIONS[journey.status] || [];
    if (!allowed.includes(args.newStatus)) {
      throw new Error(
        `Invalid transition: ${journey.status} → ${args.newStatus}. Allowed: ${allowed.join(", ")}`
      );
    }

    const patch: Record<string, unknown> = {
      status: args.newStatus,
      updatedAt: Date.now(),
    };

    if (args.newStatus === "resolved") {
      patch.resolvedAt = Date.now();
    }

    await ctx.db.patch(args.journeyId, patch);
  },
});

/**
 * Start DIY attempt — initialize the DIY tracking state
 */
export const startDiy = mutation({
  args: {
    journeyId: v.id("serviceJourneys"),
    guideSlug: v.optional(v.string()),
    totalSteps: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const journey = await ctx.db.get(args.journeyId);
    if (!journey) throw new Error("Journey not found");

    await ctx.db.patch(args.journeyId, {
      status: "diy_in_progress",
      diyAttempt: {
        guideSlug: args.guideSlug,
        stepsTotal: args.totalSteps,
        stepsCompleted: 0,
        currentStep: 1,
      },
      updatedAt: Date.now(),
    });
  },
});

/**
 * Record DIY step progress
 */
export const recordDiyProgress = mutation({
  args: {
    journeyId: v.id("serviceJourneys"),
    currentStep: v.number(),
    stepsCompleted: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const journey = await ctx.db.get(args.journeyId);
    if (!journey || !journey.diyAttempt) throw new Error("Journey or DIY attempt not found");

    await ctx.db.patch(args.journeyId, {
      diyAttempt: {
        ...journey.diyAttempt,
        currentStep: args.currentStep,
        stepsCompleted: args.stepsCompleted,
      },
      updatedAt: Date.now(),
    });
  },
});

/**
 * Complete DIY attempt
 */
export const completeDiy = mutation({
  args: {
    journeyId: v.id("serviceJourneys"),
    outcome: v.union(
      v.literal("resolved"),
      v.literal("not_resolved"),
      v.literal("abandoned")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const journey = await ctx.db.get(args.journeyId);
    if (!journey || !journey.diyAttempt) throw new Error("Journey or DIY attempt not found");

    await ctx.db.patch(args.journeyId, {
      status: "diy_completed",
      diyAttempt: {
        ...journey.diyAttempt,
        outcome: args.outcome,
        completedAt: Date.now(),
      },
      updatedAt: Date.now(),
    });
  },
});

/**
 * Save service call prep data
 */
export const saveServiceCallPrep = mutation({
  args: {
    journeyId: v.id("serviceJourneys"),
    expectedCostLow: v.optional(v.number()),
    expectedCostHigh: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const journey = await ctx.db.get(args.journeyId);
    if (!journey) throw new Error("Journey not found");

    const costRange = args.expectedCostLow && args.expectedCostHigh
      ? { low: args.expectedCostLow, high: args.expectedCostHigh }
      : undefined;

    await ctx.db.patch(args.journeyId, {
      serviceCallPrep: {
        questionsGenerated: true,
        redFlagsGenerated: true,
        expectedCostRange: costRange,
      },
      status: "prep_service_call",
      updatedAt: Date.now(),
    });
  },
});

/**
 * Mark service prep as complete, move to awaiting service
 */
export const finishServicePrep = mutation({
  args: {
    journeyId: v.id("serviceJourneys"),
    appointmentReminder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const journey = await ctx.db.get(args.journeyId);
    if (!journey) throw new Error("Journey not found");

    const prep = journey.serviceCallPrep || {
      questionsGenerated: true,
      redFlagsGenerated: true,
    };

    await ctx.db.patch(args.journeyId, {
      serviceCallPrep: {
        ...prep,
        appointmentReminder: args.appointmentReminder,
      },
      status: "awaiting_service",
      updatedAt: Date.now(),
    });
  },
});

/**
 * Transition to post-service debrief
 */
export const startPostService = mutation({
  args: { journeyId: v.id("serviceJourneys") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const journey = await ctx.db.get(args.journeyId);
    if (!journey) throw new Error("Journey not found");

    await ctx.db.patch(args.journeyId, {
      status: "post_service",
      updatedAt: Date.now(),
    });
  },
});

/**
 * Save service record after post-service debrief
 */
export const saveServiceRecord = mutation({
  args: {
    journeyId: v.id("serviceJourneys"),
    providerName: v.string(),
    technicianName: v.optional(v.string()),
    date: v.number(),
    cost: v.number(),
    workPerformed: v.array(v.string()),
    techNotes: v.optional(v.string()),
    documents: v.array(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const journey = await ctx.db.get(args.journeyId);
    if (!journey) throw new Error("Journey not found");

    await ctx.db.patch(args.journeyId, {
      serviceRecord: {
        providerName: args.providerName,
        technicianName: args.technicianName,
        date: args.date,
        cost: args.cost,
        workPerformed: args.workPerformed,
        techNotes: args.techNotes,
        documents: args.documents,
        forecastUpdated: false,
      },
      updatedAt: Date.now(),
    });
  },
});

/**
 * Add a document to the service record
 */
export const addServiceDocument = mutation({
  args: {
    journeyId: v.id("serviceJourneys"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const journey = await ctx.db.get(args.journeyId);
    if (!journey) throw new Error("Journey not found");

    const existing = journey.serviceRecord?.documents || [];

    if (journey.serviceRecord) {
      await ctx.db.patch(args.journeyId, {
        serviceRecord: {
          ...journey.serviceRecord,
          documents: [...existing, args.storageId],
        },
        updatedAt: Date.now(),
      });
    } else {
      // Create initial service record with just the document
      await ctx.db.patch(args.journeyId, {
        serviceRecord: {
          providerName: "",
          date: Date.now(),
          cost: 0,
          workPerformed: [],
          documents: [args.storageId],
          forecastUpdated: false,
        },
        updatedAt: Date.now(),
      });
    }
  },
});

/**
 * Update service record with OCR-extracted data
 */
export const updateServiceRecordWithExtractedData = mutation({
  args: {
    journeyId: v.id("serviceJourneys"),
    providerName: v.optional(v.string()),
    cost: v.optional(v.number()),
    workPerformed: v.optional(v.array(v.string())),
    partsUsed: v.optional(v.array(v.string())),
    warrantyInfo: v.optional(v.string()),
    modelSerial: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const journey = await ctx.db.get(args.journeyId);
    if (!journey || !journey.serviceRecord) throw new Error("Journey or service record not found");

    await ctx.db.patch(args.journeyId, {
      serviceRecord: {
        ...journey.serviceRecord,
        providerName: args.providerName || journey.serviceRecord.providerName,
        cost: args.cost ?? journey.serviceRecord.cost,
        workPerformed: args.workPerformed || journey.serviceRecord.workPerformed,
        extractedData: {
          ...journey.serviceRecord.extractedData,
          partsUsed: args.partsUsed || journey.serviceRecord.extractedData?.partsUsed,
          warrantyInfo: args.warrantyInfo || journey.serviceRecord.extractedData?.warrantyInfo,
          modelSerial: args.modelSerial || journey.serviceRecord.extractedData?.modelSerial,
        },
      },
      updatedAt: Date.now(),
    });
  },
});

/**
 * Add a quote to the journey
 */
export const addQuote = mutation({
  args: {
    journeyId: v.id("serviceJourneys"),
    providerName: v.string(),
    unitQuoted: v.string(),
    totalCost: v.number(),
    breakdown: v.optional(v.object({
      labor: v.optional(v.string()),
      permit: v.optional(v.string()),
      disposal: v.optional(v.string()),
    })),
    laborWarranty: v.optional(v.string()),
    documentId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const journey = await ctx.db.get(args.journeyId);
    if (!journey) throw new Error("Journey not found");

    const existing = journey.quotes || [];
    const quoteId = `quote_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    await ctx.db.patch(args.journeyId, {
      quotes: [
        ...existing,
        {
          id: quoteId,
          providerName: args.providerName,
          unitQuoted: args.unitQuoted,
          totalCost: args.totalCost,
          breakdown: args.breakdown,
          laborWarranty: args.laborWarranty,
          documentId: args.documentId,
          isChosen: false,
        },
      ],
      updatedAt: Date.now(),
    });

    return quoteId;
  },
});

/**
 * Choose a quote
 */
export const chooseQuote = mutation({
  args: {
    journeyId: v.id("serviceJourneys"),
    quoteId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const journey = await ctx.db.get(args.journeyId);
    if (!journey || !journey.quotes) throw new Error("Journey or quotes not found");

    const updated = journey.quotes.map((q) => ({
      ...q,
      isChosen: q.id === args.quoteId,
    }));

    await ctx.db.patch(args.journeyId, {
      quotes: updated,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Resolve journey — marks complete, updates system records, awards HP
 */
export const resolveJourney = mutation({
  args: {
    journeyId: v.id("serviceJourneys"),
    transitionTo: v.optional(v.union(v.literal("resolved"), v.literal("monitoring"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const journey = await ctx.db.get(args.journeyId);
    if (!journey) throw new Error("Journey not found");

    const targetStatus = args.transitionTo || "resolved";
    const now = Date.now();

    // Update system.lastServiceDate if there's a service record
    if (journey.serviceRecord && journey.serviceRecord.date) {
      const system = await ctx.db.get(journey.systemId);
      if (system) {
        await ctx.db.patch(journey.systemId, {
          lastServiceDate: new Date(journey.serviceRecord.date).toISOString().split("T")[0],
        });
      }
    }

    await ctx.db.patch(args.journeyId, {
      status: targetStatus,
      resolvedAt: now,
      updatedAt: now,
      serviceRecord: journey.serviceRecord
        ? { ...journey.serviceRecord, forecastUpdated: true }
        : undefined,
    });

    // Award health points for completing a journey
    try {
      const hpState = await ctx.db
        .query("homeHPState")
        .withIndex("by_home", (q) => q.eq("homeId", journey.homeId))
        .first();

      if (hpState) {
        // Award 15 HP for completing a service journey
        let hpChange = 15;
        // Bonus for uploading documents
        if (journey.serviceRecord?.documents && journey.serviceRecord.documents.length > 0) {
          hpChange += 5 * journey.serviceRecord.documents.length;
        }
        // Bonus for completing DIY
        if (journey.diyAttempt?.outcome === "resolved") {
          hpChange += 10;
        }

        const newBalance = hpState.currentHP + hpChange;

        await ctx.db.insert("hpEvents", {
          homeId: journey.homeId,
          systemId: journey.systemId,
          eventType: "earn",
          hpChange,
          newBalance,
          reason: "journey_completed",
          description: `Completed service journey for ${journey.systemType.replace(/_/g, " ")}`,
          occurredAt: now,
        });

        await ctx.db.patch(hpState._id, {
          currentHP: newBalance,
          lifetimeHPEarned: hpState.lifetimeHPEarned + hpChange,
        });
      }
    } catch (e) {
      // HP award is non-critical — don't fail the journey resolution
      console.error("Failed to award HP for journey completion:", e);
    }
  },
});

/**
 * Link a replacement session to this journey
 */
export const linkReplacementSession = mutation({
  args: {
    journeyId: v.id("serviceJourneys"),
    replacementSessionId: v.id("replacementSessions"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(args.journeyId, {
      replacementSessionId: args.replacementSessionId,
      status: "planning_replacement",
      updatedAt: Date.now(),
    });
  },
});

/**
 * Get system forecast data for the diagnosis card
 */
export const getJourneySystemForecast = query({
  args: { journeyId: v.id("serviceJourneys") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const journey = await ctx.db.get(args.journeyId);
    if (!journey) return null;

    const system = await ctx.db.get(journey.systemId);
    if (!system) return null;

    const systemType = await ctx.db.get(system.systemTypeId);
    if (!systemType) return null;

    const weibullShape = systemType.weibullShape;
    const weibullScale = systemType.weibullScale;

    let age = 0;
    if (system.installDate) {
      age = calculateAge(system.installDate, undefined);
    }

    const healthScore = system.healthScore ?? 100;
    const survival = weibullSurvival(age, weibullShape, weibullScale) * 100;
    const failureProb1yr = conditionalFailureProbability(age, 1, weibullShape, weibullScale);
    const failureProb3yr = conditionalFailureProbability(age, 3, weibullShape, weibullScale);
    const remaining = expectedRemainingLife(age, weibullShape, weibullScale);

    return {
      systemName: system.name || systemType.name,
      systemCategory: systemType.category,
      manufacturer: system.manufacturer,
      modelNumber: system.modelNumber,
      age: Math.round(age * 10) / 10,
      healthScore: Math.round(healthScore),
      expectedLifespan: systemType.defaultLifespanYears,
      failureProbability1yr: Math.round(failureProb1yr * 100),
      failureProbability3yr: Math.round(failureProb3yr * 100),
      remainingLife: Math.round(remaining * 10) / 10,
      replacementCostLow: systemType.defaultReplacementCostLow,
      replacementCostHigh: systemType.defaultReplacementCostHigh,
    };
  },
});
