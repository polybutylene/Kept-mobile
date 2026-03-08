import { internalMutation, internalQuery, query } from "../_generated/server";
import { v } from "convex/values";

export const getKeyword = internalQuery({
  args: { keywordId: v.id("seoKeywords") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.keywordId);
  },
});

export const getQueuedKeywords = internalQuery({
  args: { limit: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("seoKeywords")
      .withIndex("by_status", (q) => q.eq("status", "queued"))
      .take(args.limit);
  },
});

export const updateKeywordStatus = internalMutation({
  args: {
    keywordId: v.id("seoKeywords"),
    status: v.union(v.literal("queued"), v.literal("generating"), v.literal("published")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.keywordId, { status: args.status });
  },
});

export const storeAnswer = internalMutation({
  args: {
    slug: v.string(),
    question: v.string(),
    directAnswer: v.string(),
    fullContent: v.string(),
    metaTitle: v.string(),
    metaDescription: v.string(),
    schemaMarkup: v.string(),
    relatedQuestions: v.array(v.string()),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("answerPages", {
      ...args,
      status: "draft",
      lastUpdated: Date.now(),
    });
  },
});

export const linkKeywordToAnswer = internalMutation({
  args: {
    keywordId: v.id("seoKeywords"),
    answerId: v.id("answerPages"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.keywordId, {
      answerId: args.answerId,
      status: "published",
    });
  },
});

export const publishAnswer = internalMutation({
  args: { answerId: v.id("answerPages") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.answerId, {
      status: "published",
      publishedAt: Date.now(),
      lastUpdated: Date.now(),
    });
  },
});

export const getAnswerBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("answerPages")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});
