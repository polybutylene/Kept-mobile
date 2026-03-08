/**
 * Replacement Sessions — Guided replacement planning flows
 *
 * Manages the lifecycle of a replacement planning session:
 * 1. Start session (assess the system)
 * 2. Record decisions (step through the tree)
 * 3. Generate recommendation (based on decisions)
 * 4. Create action plan
 * 5. Track action plan completion
 */

import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";
import { getReplacementTree } from "./data/replacementTrees";

// ============================================================
// Queries
// ============================================================

/**
 * Get a replacement session by ID
 */
export const getSession = query({
  args: { sessionId: v.id("replacementSessions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const session = await ctx.db.get(args.sessionId);
    if (!session) return null;

    // Fetch associated system info
    const system = await ctx.db.get(session.systemId);
    let systemTypeName: string | undefined;
    if (system) {
      const systemType = await ctx.db.get(system.systemTypeId);
      systemTypeName = systemType?.name;
    }

    return { ...session, systemName: system?.name || systemTypeName, systemTypeName };
  },
});

/**
 * Get the latest active replacement session for a conversation.
 * Prioritizes non-completed/non-abandoned sessions.
 * If multiple sessions exist, returns the most recent one.
 */
export const getSessionByConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const sessions = await ctx.db
      .query("replacementSessions")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    if (sessions.length === 0) return null;

    // Prefer active (non-completed, non-abandoned) sessions
    const active = sessions.filter(
      (s) => s.status !== "completed" && s.status !== "abandoned"
    );

    if (active.length > 0) {
      // Return the most recently started active session
      return active.sort((a, b) => b.startedAt - a.startedAt)[0];
    }

    // Otherwise return the most recent session of any status
    return sessions.sort((a, b) => b.startedAt - a.startedAt)[0];
  },
});

/**
 * Get the current decision step for a session
 */
export const getCurrentStep = query({
  args: { sessionId: v.id("replacementSessions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const session = await ctx.db.get(args.sessionId);
    if (!session) return null;

    const tree = getReplacementTree(session.systemType);
    if (!tree) return null;

    if (session.currentStep >= tree.steps.length) {
      return { done: true as const, totalSteps: tree.steps.length };
    }

    const step = tree.steps[session.currentStep];
    return {
      done: false as const,
      step,
      stepNumber: session.currentStep + 1,
      totalSteps: tree.steps.length,
    };
  },
});

/**
 * Get the decision tree definition for a system type
 */
export const getDecisionTree = query({
  args: { systemType: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return getReplacementTree(args.systemType);
  },
});

// ============================================================
// Internal queries (used by AI actions)
// ============================================================

export const getSessionInternal = internalQuery({
  args: { sessionId: v.id("replacementSessions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.sessionId);
  },
});

export const getSessionByConversationInternal = internalQuery({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("replacementSessions")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .collect();
    if (sessions.length === 0) return null;
    const active = sessions.filter(
      (s) => s.status !== "completed" && s.status !== "abandoned"
    );
    if (active.length > 0) {
      return active.sort((a, b) => b.startedAt - a.startedAt)[0];
    }
    return sessions.sort((a, b) => b.startedAt - a.startedAt)[0];
  },
});

// ============================================================
// Mutations
// ============================================================

/**
 * Start a new replacement planning session
 */
export const startSession = mutation({
  args: {
    homeId: v.id("homes"),
    systemId: v.id("systems"),
    conversationId: v.id("conversations"),
    systemType: v.string(),
    triggerReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!profile) throw new Error("User profile not found");

    // Verify the decision tree exists
    const tree = getReplacementTree(args.systemType);
    if (!tree) throw new Error(`No replacement tree for system type: ${args.systemType}`);

    // Build assessment from system data
    const system = await ctx.db.get(args.systemId);
    if (!system) throw new Error("System not found");

    const systemType = await ctx.db.get(system.systemTypeId);
    const home = await ctx.db.get(args.homeId);

    // Calculate age
    let age = 0;
    if (system.installDate) {
      age = (Date.now() - new Date(system.installDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    } else if (home?.yearBuilt) {
      age = new Date().getFullYear() - home.yearBuilt;
    }

    // Build condition signals
    const signals: string[] = [];
    if (system.healthScore < 50) signals.push(`Health score: ${Math.round(system.healthScore)}/100`);
    if (system.needsAttention) signals.push("Flagged as needs attention");
    if (system.conditionNotes) signals.push(system.conditionNotes);
    if (age > (systemType?.defaultLifespanYears ?? 15) * 0.8) {
      signals.push(`Approaching end of expected lifespan (${systemType?.defaultLifespanYears ?? "unknown"} years)`);
    }

    const sessionId = await ctx.db.insert("replacementSessions", {
      homeId: args.homeId,
      systemId: args.systemId,
      conversationId: args.conversationId,
      userId: profile._id,
      systemType: args.systemType,
      status: "assessing",
      currentStep: 0,
      decisions: [],
      assessment: {
        systemName: system.name || systemType?.name || "Unknown System",
        systemAge: Math.round(age * 10) / 10,
        healthScore: system.healthScore,
        failureProbability1yr: system.remainingLifePercent
          ? Math.max(0, 100 - system.remainingLifePercent)
          : 0,
        triggerReason: args.triggerReason || "Replacement planning requested",
        conditionSignals: signals,
      },
      startedAt: Date.now(),
    });

    return sessionId;
  },
});

/**
 * Record a decision (user selected an option at a step)
 */
export const recordDecision = mutation({
  args: {
    sessionId: v.id("replacementSessions"),
    stepId: v.string(),
    question: v.string(),
    selectedOption: v.string(),
    selectedValue: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    const tree = getReplacementTree(session.systemType);
    if (!tree) throw new Error("Decision tree not found");

    // Find the selected option to determine next step
    const currentStep = tree.steps[session.currentStep];
    if (!currentStep) throw new Error("Invalid current step");

    const selectedOption = currentStep.options.find((o) => o.value === args.selectedValue);
    if (!selectedOption) throw new Error("Invalid option selected");

    const newDecisions = [
      ...session.decisions,
      {
        stepId: args.stepId,
        question: args.question,
        selectedOption: args.selectedOption,
        selectedValue: args.selectedValue,
        timestamp: Date.now(),
      },
    ];

    // Determine next state
    const isLastStep = selectedOption.nextStepId === "recommend";
    let nextStepIndex = session.currentStep + 1;

    if (!isLastStep) {
      // Find the index of the next step by ID
      const nextIdx = tree.steps.findIndex((s) => s.id === selectedOption.nextStepId);
      if (nextIdx !== -1) nextStepIndex = nextIdx;
    }

    await ctx.db.patch(args.sessionId, {
      decisions: newDecisions,
      currentStep: isLastStep ? tree.steps.length : nextStepIndex,
      status: isLastStep ? "recommended" : "deciding",
    });

    // If this was the last step, generate the recommendation
    if (isLastStep) {
      const recommendation = generateRecommendation(tree, newDecisions);
      if (recommendation) {
        await ctx.db.patch(args.sessionId, {
          recommendation: recommendation.recommendation,
          actionPlan: tree.actionPlan.steps.map((s) => ({
            ...s,
            completed: false,
          })),
          financialContext: {
            emergencySavings:
              "By planning ahead instead of replacing in an emergency, you're likely saving 20–40% on installation costs.",
            rebateInfo:
              "Check energystar.gov/rebates for available rebates in your area.",
          },
        });
      }
    }

    return {
      isLastStep,
      nextStepIndex: isLastStep ? null : nextStepIndex,
    };
  },
});

/**
 * Go back one step in the decision tree.
 * Uses the decision history to find the correct previous step index,
 * which handles non-sequential branching correctly.
 */
export const goBack = mutation({
  args: { sessionId: v.id("replacementSessions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");
    if (session.decisions.length === 0) throw new Error("Already at the first step");

    const tree = getReplacementTree(session.systemType);
    const newDecisions = session.decisions.slice(0, -1);

    // Find the step the user was on before their last decision.
    // The last decision's stepId tells us which step was just answered —
    // that's the step we want to return to.
    const lastDecision = session.decisions[session.decisions.length - 1];
    let previousStepIndex = 0;

    if (tree && lastDecision) {
      const idx = tree.steps.findIndex((s) => s.id === lastDecision.stepId);
      if (idx !== -1) {
        previousStepIndex = idx;
      }
    }

    await ctx.db.patch(args.sessionId, {
      decisions: newDecisions,
      currentStep: previousStepIndex,
      status: newDecisions.length === 0 ? "assessing" : "deciding",
      recommendation: undefined,
      actionPlan: undefined,
      financialContext: undefined,
    });
  },
});

/**
 * Mark an action plan step as completed
 */
export const completeActionStep = mutation({
  args: {
    sessionId: v.id("replacementSessions"),
    stepId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session || !session.actionPlan) throw new Error("Session or action plan not found");

    const updatedPlan = session.actionPlan.map((step) =>
      step.stepId === args.stepId
        ? { ...step, completed: true, completedAt: Date.now() }
        : step
    );

    const allCompleted = updatedPlan.every((s) => s.completed);

    await ctx.db.patch(args.sessionId, {
      actionPlan: updatedPlan,
      status: allCompleted ? "completed" : "planned",
      completedAt: allCompleted ? Date.now() : undefined,
    });
  },
});

/**
 * Save / finalize the replacement plan
 */
export const savePlan = mutation({
  args: { sessionId: v.id("replacementSessions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    await ctx.db.patch(args.sessionId, {
      status: "planned",
    });

    return { success: true };
  },
});

// ============================================================
// Internal mutations (used by AI actions)
// ============================================================

export const startSessionInternal = internalMutation({
  args: {
    homeId: v.id("homes"),
    systemId: v.id("systems"),
    conversationId: v.id("conversations"),
    userId: v.id("userProfiles"),
    systemType: v.string(),
    assessment: v.object({
      systemName: v.string(),
      systemAge: v.number(),
      healthScore: v.number(),
      failureProbability1yr: v.number(),
      triggerReason: v.string(),
      conditionSignals: v.array(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("replacementSessions", {
      homeId: args.homeId,
      systemId: args.systemId,
      conversationId: args.conversationId,
      userId: args.userId,
      systemType: args.systemType,
      status: "assessing",
      currentStep: 0,
      decisions: [],
      assessment: args.assessment,
      startedAt: Date.now(),
    });
  },
});

// ============================================================
// Helpers
// ============================================================

function generateRecommendation(
  tree: ReturnType<typeof getReplacementTree>,
  decisions: { stepId: string; selectedValue: string }[]
) {
  if (!tree) return null;

  // Build a map of stepId → selectedValue
  const decisionMap: Record<string, string> = {};
  for (const d of decisions) {
    decisionMap[d.stepId] = d.selectedValue;
  }

  // Score each recommendation rule against the decisions
  let bestMatch: (typeof tree.recommendations)[number] | null = null;
  let bestScore = 0;

  for (const rule of tree.recommendations) {
    let score = 0;
    let matches = true;

    for (const [stepId, expected] of Object.entries(rule.conditions)) {
      const actual = decisionMap[stepId];
      if (!actual) {
        // Step not in decisions — skip this condition
        continue;
      }

      if (Array.isArray(expected)) {
        if (expected.includes(actual)) {
          score += 1;
        } else {
          matches = false;
        }
      } else {
        if (actual === expected) {
          score += 1;
        } else {
          matches = false;
        }
      }
    }

    if (matches && score > bestScore) {
      bestScore = score;
      bestMatch = rule;
    }
  }

  if (!bestMatch) {
    // Fallback: use the first recommendation
    bestMatch = tree.recommendations[0];
  }

  if (!bestMatch) return null;

  return {
    recommendation: {
      productType: bestMatch.recommendation.productType,
      specificProduct: bestMatch.recommendation.specificProduct,
      estimatedCost: bestMatch.recommendation.estimatedCost,
      estimatedLifespan: bestMatch.recommendation.estimatedLifespan,
      annualSavings: bestMatch.recommendation.annualSavings,
      rationale: bestMatch.recommendation.rationaleParts.join(". ") + ".",
      alternative: bestMatch.alternative,
    },
  };
}
