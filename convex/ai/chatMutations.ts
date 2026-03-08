/**
 * Chat Internal Mutations
 *
 * Internal mutations called by the chat action — not exposed to clients.
 */

import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

// ============================================================
// Create a new conversation
// ============================================================

export const createConversation = internalMutation({
  args: {
    homeId: v.id("homes"),
    userId: v.id("userProfiles"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("conversations", {
      homeId: args.homeId,
      userId: args.userId,
      title: args.title,
      status: "active",
      lastMessageAt: Date.now(),
    });
  },
});

// ============================================================
// Save a message to a conversation
// ============================================================

export const saveMessage = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    references: v.optional(v.any()),
    suggestedActions: v.optional(v.any()),
    tokenUsage: v.optional(v.any()),
    structuredContent: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("aiMessages", {
      conversationId: args.conversationId,
      role: args.role,
      content: args.content,
      references: args.references,
      suggestedActions: args.suggestedActions,
      tokenUsage: args.tokenUsage,
      structuredContent: args.structuredContent,
      createdAt: Date.now(),
    });
  },
});

// ============================================================
// Update conversation metadata after a message
// ============================================================

export const updateConversation = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    lastMessageAt: v.number(),
    referencedSystemIds: v.optional(v.array(v.id("systems"))),
  },
  handler: async (ctx, args) => {
    const conv = await ctx.db.get(args.conversationId);
    if (!conv) return;

    const updates: Record<string, unknown> = {
      lastMessageAt: args.lastMessageAt,
    };

    if (args.referencedSystemIds) {
      // Merge new system references with existing ones (dedup)
      const existing = conv.referencedSystemIds ?? [];
      const merged = [...new Set([...existing, ...args.referencedSystemIds])];
      updates.referencedSystemIds = merged;
    }

    await ctx.db.patch(args.conversationId, updates);
  },
});

// ============================================================
// Archive a conversation
// ============================================================

export const archiveConversation = internalMutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, { status: "archived" as const });
  },
});
