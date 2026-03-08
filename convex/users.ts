import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getCurrentProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      // Auto-create user on first auth
      return null;
    }

    return user;
  },
});

export const createOrUpdateFromAuth = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: identity.email ?? existing.email,
        fullName: identity.name ?? existing.fullName,
        avatarUrl: identity.pictureUrl ?? existing.avatarUrl,
        lastActiveAt: Date.now(),
      });
      return existing._id;
    }

    const userId = await ctx.db.insert("users", {
      email: identity.email ?? "",
      fullName: identity.name ?? undefined,
      avatarUrl: identity.pictureUrl ?? undefined,
      tokenIdentifier: identity.tokenIdentifier,
      tier: "free",
      healthPoints: 1000,
      streakDays: 0,
      lastActiveAt: Date.now(),
    });

    return userId;
  },
});

export const updateProfile = mutation({
  args: {
    fullName: v.optional(v.string()),
    phone: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      ...(args.fullName !== undefined && { fullName: args.fullName }),
      ...(args.phone !== undefined && { phone: args.phone }),
      ...(args.avatarUrl !== undefined && { avatarUrl: args.avatarUrl }),
    });
  },
});

export const completeOnboarding = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      onboardingCompletedAt: Date.now(),
    });
  },
});
