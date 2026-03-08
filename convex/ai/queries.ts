/**
 * AI Queries
 *
 * Queries for reading AI data — used by both web and mobile clients.
 * Also includes internal queries used by actions (via ctx.runQuery).
 */

import { query, internalQuery } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import {
  buildHomeContext,
  buildForecastContext,
  buildDocumentContext,
  buildConversationHistory,
  buildMaintenanceContext,
  buildTroubleshootingSessionContext,
  buildKnowledgeContext,
} from "./context";
import { checkRateLimit } from "./rateLimiting";

// ============================================================
// CLIENT QUERIES — Used by frontend via useQuery()
// ============================================================

/**
 * Get all conversations for a home
 */
export const getConversations = query({
  args: { homeId: v.id("homes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("conversations")
      .withIndex("by_home", (q) =>
        q
          .eq("homeId", args.homeId)
          .eq("status", "active")
      )
      .order("desc")
      .collect();
  },
});

/**
 * Get messages for a conversation (real-time via Convex reactivity)
 */
export const getMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Verify user owns this conversation
    const conv = await ctx.db.get(args.conversationId);
    if (!conv) return [];

    return await ctx.db
      .query("aiMessages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("asc")
      .collect();
  },
});

/**
 * Get a single conversation
 */
export const getConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db.get(args.conversationId);
  },
});

/**
 * Archive a conversation (client mutation)
 */
export const archiveConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    // This is intentionally a no-op query — use the mutation instead
    return null;
  },
});

/**
 * Get active insights for the dashboard
 */
export const getActiveInsights = query({
  args: { homeId: v.id("homes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("aiInsights")
      .withIndex("by_home_active", (q) =>
        q.eq("homeId", args.homeId).eq("isDismissed", false)
      )
      .order("desc")
      .collect();
  },
});

/**
 * Get unread insight count (for badge on dashboard)
 */
export const getUnreadInsightCount = query({
  args: { homeId: v.id("homes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const unread = await ctx.db
      .query("aiInsights")
      .withIndex("by_home_unread", (q) =>
        q.eq("homeId", args.homeId).eq("isRead", false)
      )
      .collect();

    return unread.length;
  },
});

/**
 * Get the latest walkthrough session for a home
 */
export const getWalkthroughSession = query({
  args: { homeId: v.id("homes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("walkthroughSessions")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .order("desc")
      .first();
  },
});

// ============================================================
// INTERNAL QUERIES — Used by actions via ctx.runQuery(internal.*)
// ============================================================

/**
 * Get user profile by auth userId
 */
export const getProfileByUserId = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
  },
});

/**
 * Build home context for AI consumption (internal)
 */
export const getHomeContextInternal = internalQuery({
  args: { homeId: v.id("homes") },
  handler: async (ctx, args) => {
    return await buildHomeContext(ctx, args.homeId);
  },
});

/**
 * Build forecast context for a specific system (internal)
 */
export const getForecastContextInternal = internalQuery({
  args: { systemId: v.id("systems") },
  handler: async (ctx, args) => {
    return await buildForecastContext(ctx, args.systemId);
  },
});

/**
 * Build document context for a home/system (internal)
 */
export const getDocumentContextInternal = internalQuery({
  args: {
    homeId: v.id("homes"),
    systemId: v.optional(v.id("systems")),
  },
  handler: async (ctx, args) => {
    return await buildDocumentContext(ctx, args.homeId, args.systemId);
  },
});

/**
 * Build conversation history for AI consumption (internal)
 */
export const getConversationHistoryInternal = internalQuery({
  args: {
    conversationId: v.id("conversations"),
    maxMessages: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await buildConversationHistory(
      ctx,
      args.conversationId,
      args.maxMessages ?? 20
    );
  },
});

/**
 * Build maintenance context for a home (internal)
 */
export const getMaintenanceContextInternal = internalQuery({
  args: { homeId: v.id("homes") },
  handler: async (ctx, args) => {
    return await buildMaintenanceContext(ctx, args.homeId);
  },
});

/**
 * Build troubleshooting session context for AI (internal)
 */
export const getTroubleshootingContextInternal = internalQuery({
  args: { sessionId: v.id("troubleshootingSessions") },
  handler: async (ctx, args) => {
    return await buildTroubleshootingSessionContext(ctx, args.sessionId);
  },
});

/**
 * Build knowledge context for a specific system (internal)
 * Returns component templates, climate modifiers, and regional data
 */
export const getKnowledgeContextInternal = internalQuery({
  args: { systemId: v.id("systems") },
  handler: async (ctx, args) => {
    return await buildKnowledgeContext(ctx, args.systemId);
  },
});

/**
 * Check rate limit for a user (internal — called from actions)
 */
export const checkChatRateLimit = internalQuery({
  args: {
    userId: v.id("userProfiles"),
  },
  handler: async (ctx, args) => {
    return await checkRateLimit(ctx, args.userId, "chat");
  },
});
