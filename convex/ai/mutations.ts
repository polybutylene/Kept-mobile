/**
 * AI Client Mutations
 *
 * Mutations exposed to clients (not internal) for managing AI entities.
 */

import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Archive a conversation
 */
export const archiveConversation = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const conv = await ctx.db.get(args.conversationId);
    if (!conv) throw new Error("Conversation not found");

    await ctx.db.patch(args.conversationId, { status: "archived" as const });
  },
});

/**
 * Mark an AI insight as read
 */
export const markInsightRead = mutation({
  args: { insightId: v.id("aiInsights") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;

    await ctx.db.patch(args.insightId, { isRead: true });
  },
});

/**
 * Dismiss an AI insight
 */
export const dismissInsight = mutation({
  args: { insightId: v.id("aiInsights") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;

    await ctx.db.patch(args.insightId, { isDismissed: true });
  },
});
