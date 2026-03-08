import { v } from "convex/values";
import { query, mutation, internalQuery } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { getProfileFromAuthId } from "./lib/permissions";

export const registerToken = mutation({
  args: {
    token: v.string(),
    platform: v.union(v.literal("ios"), v.literal("android")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) throw new Error("Profile not found");

    const existing = await ctx.db
      .query("pushTokens")
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
      .collect();

    const duplicate = existing.find((t) => t.token === args.token);
    if (duplicate) return duplicate._id;

    return ctx.db.insert("pushTokens", {
      userId: profile._id,
      token: args.token,
      platform: args.platform,
      createdAt: Date.now(),
    });
  },
});

export const removeToken = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) return;

    const tokens = await ctx.db
      .query("pushTokens")
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
      .collect();

    for (const t of tokens) {
      if (t.token === args.token) {
        await ctx.db.delete(t._id);
      }
    }
  },
});

export const getUserTokens = internalQuery({
  args: { userId: v.id("userProfiles") },
  handler: async (ctx, { userId }) => {
    return ctx.db
      .query("pushTokens")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});
