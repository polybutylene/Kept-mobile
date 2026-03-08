import { internalMutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";

export const getUserContext = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return { user: null, homes: [] };

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!profile) return { user: { name: user.name, email: user.email }, homes: [] };

    const homes = await ctx.db
      .query("homes")
      .withIndex("by_owner", (q) => q.eq("ownerId", profile._id))
      .collect();

    const homesSummary = [];
    for (const home of homes.slice(0, 5)) {
      const systems = await ctx.db
        .query("systems")
        .withIndex("by_home", (q) => q.eq("homeId", home._id))
        .collect();

      const systemTypes = await Promise.all(
        systems.slice(0, 10).map(async (s) => {
          const sType = await ctx.db.get(s.systemTypeId);
          return {
            name: s.name,
            category: sType?.category ?? "unknown",
            healthScore: s.healthScore,
            installDate: s.installDate,
          };
        })
      );

      homesSummary.push({
        name: home.name,
        healthScore: home.overallHealthScore,
        systemCount: systems.length,
        systems: systemTypes,
      });
    }

    return {
      user: { name: profile.fullName, email: profile.email, tier: profile.tier },
      homes: homesSummary,
    };
  },
});

export const searchKnowledgeBase = internalQuery({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("supportKnowledgeBase")
      .withSearchIndex("search_content", (q) => q.search("content", args.query))
      .take(3);
  },
});

export const getConversation = internalQuery({
  args: { conversationId: v.id("supportConversations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.conversationId);
  },
});

export const createConversation = internalMutation({
  args: {
    userId: v.id("users"),
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
        content: v.string(),
        timestamp: v.number(),
      })
    ),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("supportConversations", {
      userId: args.userId,
      messages: args.messages,
      status: "active",
      category: args.category,
    });
  },
});

export const appendMessage = internalMutation({
  args: {
    conversationId: v.id("supportConversations"),
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
        content: v.string(),
        timestamp: v.number(),
      })
    ),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const convo = await ctx.db.get(args.conversationId);
    if (!convo) throw new Error("Conversation not found");

    await ctx.db.patch(args.conversationId, {
      messages: [...convo.messages, ...args.messages],
      category: args.category,
    });
  },
});

export const escalateConversation = internalMutation({
  args: { conversationId: v.id("supportConversations") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, {
      status: "escalated",
      escalatedAt: Date.now(),
    });
  },
});

export const resolveConversation = internalMutation({
  args: { conversationId: v.id("supportConversations") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, {
      status: "resolved",
      resolvedAt: Date.now(),
    });
  },
});
