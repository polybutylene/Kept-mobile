import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";
import { incidentUrgency, incidentStatus, recommendedAction } from "./schema";
import { TRIAGE_FLOWS, getFlowById, evaluateTriageOutcome } from "./lib/triageFlows";

/**
 * Get available triage flows
 * Returns flows filtered by user's systems if homeId provided
 */
export const getTriageFlows = query({
  args: {
    homeId: v.optional(v.id("homes")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Return all flows with basic info
    // If homeId provided, we could filter by installed systems
    const flows = TRIAGE_FLOWS.map(flow => ({
      id: flow.id,
      category: flow.category,
      symptom: flow.symptom,
      shortDescription: flow.shortDescription,
      icon: flow.icon,
    }));

    // Group by category
    const plumbing = flows.filter(f => f.category === "plumbing");
    const hvac = flows.filter(f => f.category === "hvac");

    return {
      plumbing,
      hvac,
      all: flows,
    };
  },
});

/**
 * Get a specific triage flow details
 */
export const getTriageFlow = query({
  args: {
    flowId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const flow = getFlowById(args.flowId);
    if (!flow) return null;

    return {
      id: flow.id,
      category: flow.category,
      symptom: flow.symptom,
      shortDescription: flow.shortDescription,
      icon: flow.icon,
      immediateWarnings: flow.immediateWarnings,
      shutoffGuidance: flow.shutoffGuidance,
      questions: flow.questions,
      packetTemplate: flow.packetTemplate,
    };
  },
});

/**
 * Get open incidents for a home
 */
export const getOpenIncidents = query({
  args: {
    homeId: v.id("homes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const home = await ctx.db.get(args.homeId);
    if (!home) return [];

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) return [];

    const incidents = await ctx.db
      .query("incidents")
      .withIndex("by_home_status", (q) =>
        q.eq("homeId", args.homeId)
      )
      .filter((q) =>
        q.and(
          q.neq(q.field("status"), "resolved"),
          q.neq(q.field("status"), "closed")
        )
      )
      .order("desc")
      .collect();

    // Enrich with system info
    const enriched = await Promise.all(
      incidents.map(async (incident) => {
        let systemName = undefined;
        if (incident.systemId) {
          const system = await ctx.db.get(incident.systemId);
          if (system) {
            const systemType = await ctx.db.get(system.systemTypeId);
            systemName = system.name || systemType?.name;
          }
        }
        return {
          ...incident,
          systemName,
        };
      })
    );

    return enriched;
  },
});

/**
 * Get all incidents for a home (including resolved)
 */
export const getIncidents = query({
  args: {
    homeId: v.id("homes"),
    includeResolved: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const home = await ctx.db.get(args.homeId);
    if (!home) return [];

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) return [];

    let incidents = await ctx.db
      .query("incidents")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .order("desc")
      .take(args.limit || 50);

    if (!args.includeResolved) {
      incidents = incidents.filter(
        (i) => i.status !== "resolved" && i.status !== "closed"
      );
    }

    // Enrich with system info
    const enriched = await Promise.all(
      incidents.map(async (incident) => {
        let systemName = undefined;
        if (incident.systemId) {
          const system = await ctx.db.get(incident.systemId);
          if (system) {
            const systemType = await ctx.db.get(system.systemTypeId);
            systemName = system.name || systemType?.name;
          }
        }
        return {
          ...incident,
          systemName,
        };
      })
    );

    return enriched;
  },
});

/**
 * Get a single incident with full details
 */
export const getIncident = query({
  args: {
    incidentId: v.id("incidents"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const incident = await ctx.db.get(args.incidentId);
    if (!incident) return null;

    const home = await ctx.db.get(incident.homeId);
    if (!home) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) return null;

    // Get related data
    let system = null;
    let systemType = null;
    if (incident.systemId) {
      system = await ctx.db.get(incident.systemId);
      if (system) {
        systemType = await ctx.db.get(system.systemTypeId);
      }
    }

    let packet = null;
    if (incident.packetId) {
      packet = await ctx.db.get(incident.packetId);
    }

    let serviceEvent = null;
    if (incident.serviceEventId) {
      serviceEvent = await ctx.db.get(incident.serviceEventId);
    }

    // Get flow details
    const flow = getFlowById(incident.issueId);

    return {
      ...incident,
      system: system ? {
        id: system._id,
        name: system.name || systemType?.name,
        category: systemType?.category,
      } : null,
      packet,
      serviceEvent,
      flow: flow ? {
        symptom: flow.symptom,
        packetTemplate: flow.packetTemplate,
      } : null,
    };
  },
});

/**
 * Start a new incident (first step of triage)
 */
export const startIncident = mutation({
  args: {
    homeId: v.id("homes"),
    issueId: v.string(),
    systemId: v.optional(v.id("systems")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const home = await ctx.db.get(args.homeId);
    if (!home) throw new Error("Home not found");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) {
      throw new Error("Not authorized");
    }

    const flow = getFlowById(args.issueId);
    if (!flow) throw new Error("Invalid issue type");

    // Get system type if system provided
    let systemTypeId: Id<"systemTypes"> | undefined;
    if (args.systemId) {
      const system = await ctx.db.get(args.systemId);
      if (system) {
        systemTypeId = system.systemTypeId;
      }
    }

    const incidentId = await ctx.db.insert("incidents", {
      homeId: args.homeId,
      systemId: args.systemId,
      systemTypeId: systemTypeId,
      issueId: args.issueId,
      symptomDescription: flow.symptom,
      userAnswers: [],
      urgency: "schedule", // Default, will be updated after triage
      likelyCauses: [],
      recommendedAction: "call_pro", // Default, will be updated after triage
      status: "open",
    });

    return {
      incidentId,
      flow: {
        id: flow.id,
        symptom: flow.symptom,
        immediateWarnings: flow.immediateWarnings,
        shutoffGuidance: flow.shutoffGuidance,
        questions: flow.questions,
      },
    };
  },
});

/**
 * Submit triage answers and get result
 */
export const submitTriageAnswers = mutation({
  args: {
    incidentId: v.id("incidents"),
    answers: v.array(
      v.object({
        questionId: v.string(),
        answer: v.string(),
      })
    ),
    safetyStepsTaken: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const incident = await ctx.db.get(args.incidentId);
    if (!incident) throw new Error("Incident not found");

    const home = await ctx.db.get(incident.homeId);
    if (!home) throw new Error("Home not found");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) {
      throw new Error("Not authorized");
    }

    const flow = getFlowById(incident.issueId);
    if (!flow) throw new Error("Invalid issue type");

    // Convert answers array to record
    const answersRecord: Record<string, string> = {};
    for (const answer of args.answers) {
      answersRecord[answer.questionId] = answer.answer;
    }

    // Evaluate outcome
    const outcome = evaluateTriageOutcome(flow, answersRecord);

    // Determine recommended action
    let recommendedAction: "diy" | "monitor" | "call_pro" = "call_pro";
    if (outcome.urgency === "monitor") {
      recommendedAction = outcome.diySteps && outcome.diySteps.length > 0 ? "diy" : "monitor";
    } else if (outcome.diySteps && outcome.diySteps.length > 0 && outcome.urgency !== "urgent") {
      recommendedAction = "diy";
    }

    // Update incident
    await ctx.db.patch(args.incidentId, {
      userAnswers: args.answers,
      safetyStepsTaken: args.safetyStepsTaken,
      urgency: outcome.urgency,
      likelyCauses: outcome.likelyCauses,
      recommendedAction,
    });

    return {
      urgency: outcome.urgency,
      likelyCauses: outcome.likelyCauses,
      diySteps: outcome.diySteps,
      proRecommendation: outcome.proRecommendation,
      recommendedAction,
      packetTemplate: flow.packetTemplate,
    };
  },
});

/**
 * Generate a home packet from an incident
 */
export const generateIncidentPacket = mutation({
  args: {
    incidentId: v.id("incidents"),
    customSymptomDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const incident = await ctx.db.get(args.incidentId);
    if (!incident) throw new Error("Incident not found");

    const home = await ctx.db.get(incident.homeId);
    if (!home) throw new Error("Home not found");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) {
      throw new Error("Not authorized");
    }

    const flow = getFlowById(incident.issueId);
    if (!flow) throw new Error("Invalid issue type");

    // Get system info for the packet
    let systemName = undefined;
    let systemInfo = undefined;
    if (incident.systemId) {
      const system = await ctx.db.get(incident.systemId);
      if (system) {
        const systemType = await ctx.db.get(system.systemTypeId);
        systemName = system.name || systemType?.name;
        systemInfo = {
          name: systemName,
          manufacturer: system.manufacturer,
          modelNumber: system.modelNumber,
          installDate: system.installDate,
        };
      }
    }

    // Build symptom summary
    const symptomSummary = args.customSymptomDescription || 
      `${flow.symptom}. User reported: ${incident.likelyCauses.join(", ")}`;

    // Build questions based on template
    const questionsToAsk = flow.packetTemplate.suggestedQuestions.map((q, i) => ({
      id: `q${i + 1}`,
      question: q,
      answer: "",
    }));

    // Create home packet - store extended data in packetData
    const packetData = {
      systemId: incident.systemId,
      systemInfo: systemInfo || null,
      status: "planning",
      urgency: incident.urgency,
      likelyCauses: incident.likelyCauses,
      questionsToAsk,
      photoChecklist: flow.packetTemplate.photoChecklist,
      docsToCollect: flow.packetTemplate.docsToCollect,
    };

    const packetId = await ctx.db.insert("homePackets", {
      homeId: incident.homeId,
      createdBy: profile._id,
      title: `${flow.symptom} - ${new Date().toLocaleDateString()}`,
      symptom: symptomSummary,
      systemTypeId: incident.systemTypeId,
      packetData,
      isShared: false,
      viewsCount: 0,
    });

    // Link packet to incident
    await ctx.db.patch(args.incidentId, {
      packetId,
      status: "packet_created",
    });

    return {
      packetId,
      title: `${flow.symptom} - ${new Date().toLocaleDateString()}`,
    };
  },
});

/**
 * Update incident status
 */
export const updateIncidentStatus = mutation({
  args: {
    incidentId: v.id("incidents"),
    status: incidentStatus,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const incident = await ctx.db.get(args.incidentId);
    if (!incident) throw new Error("Incident not found");

    const home = await ctx.db.get(incident.homeId);
    if (!home) throw new Error("Home not found");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.incidentId, { status: args.status });
    return true;
  },
});

/**
 * Resolve an incident
 */
export const resolveIncident = mutation({
  args: {
    incidentId: v.id("incidents"),
    resolutionNotes: v.optional(v.string()),
    serviceEventId: v.optional(v.id("homeownerServiceEvents")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const incident = await ctx.db.get(args.incidentId);
    if (!incident) throw new Error("Incident not found");

    const home = await ctx.db.get(incident.homeId);
    if (!home) throw new Error("Home not found");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.incidentId, {
      status: "resolved",
      resolvedAt: Date.now(),
      resolutionNotes: args.resolutionNotes,
      serviceEventId: args.serviceEventId,
    });

    return true;
  },
});

/**
 * Get incident counts for a home (for badges)
 */
export const getIncidentCounts = query({
  args: {
    homeId: v.id("homes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { open: 0, urgent: 0 };

    const home = await ctx.db.get(args.homeId);
    if (!home) return { open: 0, urgent: 0 };

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) return { open: 0, urgent: 0 };

    const openIncidents = await ctx.db
      .query("incidents")
      .withIndex("by_home_status", (q) => q.eq("homeId", args.homeId))
      .filter((q) =>
        q.and(
          q.neq(q.field("status"), "resolved"),
          q.neq(q.field("status"), "closed")
        )
      )
      .collect();

    const urgentCount = openIncidents.filter(i => i.urgency === "urgent").length;

    return {
      open: openIncidents.length,
      urgent: urgentCount,
    };
  },
});
