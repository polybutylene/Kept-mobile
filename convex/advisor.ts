import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getConversations = query({
  args: { homeId: v.id("homes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) return [];

    return await ctx.db
      .query("advisorConversations")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .collect();
  },
});

export const getConversationById = query({
  args: { conversationId: v.id("advisorConversations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.conversationId);
  },
});

export const createConversation = mutation({
  args: {
    homeId: v.id("homes"),
    title: v.optional(v.string()),
    initialMessage: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) throw new Error("User not found");

    const now = Date.now();
    return await ctx.db.insert("advisorConversations", {
      userId: user._id,
      homeId: args.homeId,
      title: args.title,
      messages: [
        {
          role: "user",
          content: args.initialMessage,
          timestamp: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const addMessage = mutation({
  args: {
    conversationId: v.id("advisorConversations"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    const messages = [
      ...conversation.messages,
      {
        role: args.role,
        content: args.content,
        imageUrl: args.imageUrl,
        timestamp: Date.now(),
      },
    ];

    await ctx.db.patch(args.conversationId, {
      messages,
      updatedAt: Date.now(),
    });
  },
});
