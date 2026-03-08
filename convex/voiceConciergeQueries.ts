import { internalQuery, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getRequest = internalQuery({
  args: { requestId: v.id("voiceServiceRequests") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.requestId);
  },
});

export const getProviders = internalQuery({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("serviceProviders")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
  },
});

export const getUserHomes = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    if (!profile) return [];

    return await ctx.db
      .query("homes")
      .withIndex("by_owner", (q) => q.eq("ownerId", profile._id))
      .collect();
  },
});

export const getProfileIdForUser = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    return profile?._id ?? null;
  },
});

export const getMyServiceRequests = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("voiceServiceRequests")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);
  },
});

export const getServiceRequest = query({
  args: { requestId: v.id("voiceServiceRequests") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const request = await ctx.db.get(args.requestId);
    if (!request || request.userId !== userId) return null;
    return request;
  },
});
