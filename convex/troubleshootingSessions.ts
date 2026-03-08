/**
 * Troubleshooting Sessions — Track user paths through diagnostic trees
 *
 * Records which nodes a user visited, what they selected, and the outcome.
 * Used for:
 * 1. Resuming abandoned sessions
 * 2. Passing context to the AI advisor on escalation
 * 3. Analytics on common diagnostic paths
 */

import { query, mutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// ============================================================
// Queries
// ============================================================

/**
 * Get a single session by ID
 */
export const getSession = query({
  args: { sessionId: v.id("troubleshootingSessions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const session = await ctx.db.get(args.sessionId);
    if (!session) return null;

    // Fetch the associated diagnostic tree
    const tree = await ctx.db.get(session.diagnosticTreeId);

    return { ...session, tree };
  },
});

/**
 * Get recent sessions for a user
 */
export const getUserSessions = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!profile) return [];

    const sessions = await ctx.db
      .query("troubleshootingSessions")
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
      .order("desc")
      .take(args.limit ?? 20);

    // Enrich with tree data
    const enriched = await Promise.all(
      sessions.map(async (session) => {
        const tree = await ctx.db.get(session.diagnosticTreeId);
        return { ...session, tree };
      })
    );

    return enriched;
  },
});

/**
 * Get sessions for a specific home
 */
export const getHomeSessions = query({
  args: { homeId: v.id("homes"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const sessions = await ctx.db
      .query("troubleshootingSessions")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .order("desc")
      .take(args.limit ?? 20);

    const enriched = await Promise.all(
      sessions.map(async (session) => {
        const tree = await ctx.db.get(session.diagnosticTreeId);
        return { ...session, tree };
      })
    );

    return enriched;
  },
});

// ============================================================
// Internal queries (used by AI actions)
// ============================================================

/**
 * Get session with full tree and node data for AI context
 */
export const getSessionForAI = internalQuery({
  args: { sessionId: v.id("troubleshootingSessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) return null;

    const tree = await ctx.db.get(session.diagnosticTreeId);
    if (!tree) return null;

    // Fetch all nodes for this tree to build context
    const nodes = await ctx.db
      .query("diagnosticNodes")
      .withIndex("by_tree", (q) => q.eq("treeId", tree._id))
      .collect();

    // Build a summary of the path taken
    const pathSummary = session.nodesVisited.map((visit) => {
      const node = nodes.find((n) => n.nodeKey === visit.nodeKey);
      return {
        nodeKey: visit.nodeKey,
        title: node?.title ?? visit.nodeKey,
        nodeType: node?.nodeType ?? "unknown",
        selectedOption: visit.selectedOption,
      };
    });

    // Get the current (last) node
    const lastVisit =
      session.nodesVisited[session.nodesVisited.length - 1];
    const currentNode = lastVisit
      ? nodes.find((n) => n.nodeKey === lastVisit.nodeKey)
      : null;

    return {
      sessionId: session._id,
      symptom: tree.entrySymptom,
      guideName: tree.title,
      systemCategory: tree.systemCategory,
      pathSummary,
      currentNode: currentNode
        ? {
            nodeKey: currentNode.nodeKey,
            title: currentNode.title,
            nodeType: currentNode.nodeType,
            content: currentNode.contentMarkdown,
            severity: currentNode.severity,
            recommendedAction: currentNode.recommendedAction,
            shouldCallPro: currentNode.shouldCallPro,
          }
        : null,
      outcome: session.outcome,
    };
  },
});

// ============================================================
// Mutations
// ============================================================

/**
 * Start a new troubleshooting session
 */
export const startSession = mutation({
  args: {
    diagnosticTreeId: v.id("diagnosticTrees"),
    homeId: v.id("homes"),
    systemId: v.optional(v.id("systems")),
    initialNodeKey: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!profile) throw new Error("User profile not found");

    const sessionId = await ctx.db.insert("troubleshootingSessions", {
      userId: profile._id,
      diagnosticTreeId: args.diagnosticTreeId,
      homeId: args.homeId,
      systemId: args.systemId,
      nodesVisited: [
        {
          nodeKey: args.initialNodeKey,
          timestamp: Date.now(),
        },
      ],
      outcome: "in_progress",
      startedAt: Date.now(),
    });

    return sessionId;
  },
});

/**
 * Record a node visit (user advanced to next step)
 */
export const recordNodeVisit = mutation({
  args: {
    sessionId: v.id("troubleshootingSessions"),
    nodeKey: v.string(),
    selectedOption: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    const updatedVisits = [
      ...session.nodesVisited,
      {
        nodeKey: args.nodeKey,
        selectedOption: args.selectedOption,
        timestamp: Date.now(),
      },
    ];

    await ctx.db.patch(args.sessionId, {
      nodesVisited: updatedVisits,
    });
  },
});

/**
 * Complete a session with an outcome
 */
export const completeSession = mutation({
  args: {
    sessionId: v.id("troubleshootingSessions"),
    outcome: v.union(
      v.literal("resolved_diy"),
      v.literal("scheduled_pro"),
      v.literal("escalated_to_advisor"),
      v.literal("abandoned"),
      v.literal("in_progress")
    ),
    finalNodeKey: v.optional(v.string()),
    wasHelpful: v.optional(v.boolean()),
    feedbackNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    await ctx.db.patch(args.sessionId, {
      outcome: args.outcome,
      finalNodeKey: args.finalNodeKey,
      wasHelpful: args.wasHelpful,
      feedbackNote: args.feedbackNote,
      completedAt: Date.now(),
    });

    // Update diagnostic tree completion count
    if (
      args.outcome === "resolved_diy" ||
      args.outcome === "scheduled_pro"
    ) {
      const tree = await ctx.db.get(session.diagnosticTreeId);
      if (tree) {
        await ctx.db.patch(session.diagnosticTreeId, {
          completionCount: tree.completionCount + 1,
        });
      }
    }
  },
});
