/**
 * Subscription state management — internal mutations for webhook handlers
 * and a public query for the frontend.
 */

import { query, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// ============================================================
// Public query — current user's subscription
// ============================================================

export const getMySubscription = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
  },
});

// ============================================================
// Internal queries — used by stripe.ts actions and webhook
// ============================================================

export const getSubscriptionByUserId = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
  },
});

export const getSubscriptionByStripeId = internalQuery({
  args: { stripeSubscriptionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_stripeSubscriptionId", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId)
      )
      .first();
  },
});

// ============================================================
// Internal mutations — called by webhook handler only
// ============================================================

const subscriptionStatus = v.union(
  v.literal("active"),
  v.literal("past_due"),
  v.literal("canceled"),
  v.literal("trialing"),
  v.literal("incomplete")
);

/**
 * Create or update a subscription row and sync the user's tier.
 */
export const upsertSubscription = internalMutation({
  args: {
    userId: v.id("users"),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.optional(v.string()),
    status: subscriptionStatus,
    billingPeriod: v.union(v.literal("monthly"), v.literal("yearly")),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.boolean(),
    trialEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Find the user's profile
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!profile) {
      console.error(`[subscriptions] No profile found for userId ${args.userId}`);
      return;
    }

    // Determine the tier based on subscription status and price
    let tier: "free" | "homeowner" | "premium" = "free";
    if (args.status === "active" || args.status === "trialing") {
      const premiumPriceIds = (process.env.STRIPE_PREMIUM_PRICE_IDS ?? "").split(",").filter(Boolean);
      tier = premiumPriceIds.includes(args.stripePriceId ?? "") ? "premium" : "homeowner";
    }

    // Check for existing subscription
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripeSubscriptionId", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        stripePriceId: args.stripePriceId,
        billingPeriod: args.billingPeriod,
        currentPeriodStart: args.currentPeriodStart,
        currentPeriodEnd: args.currentPeriodEnd,
        cancelAtPeriodEnd: args.cancelAtPeriodEnd,
        trialEnd: args.trialEnd,
        tier,
      });
    } else {
      await ctx.db.insert("subscriptions", {
        userId: args.userId,
        profileId: profile._id,
        tier,
        status: args.status,
        stripeCustomerId: args.stripeCustomerId,
        stripeSubscriptionId: args.stripeSubscriptionId,
        stripePriceId: args.stripePriceId,
        billingPeriod: args.billingPeriod,
        currentPeriodStart: args.currentPeriodStart,
        currentPeriodEnd: args.currentPeriodEnd,
        cancelAtPeriodEnd: args.cancelAtPeriodEnd,
        trialEnd: args.trialEnd,
      });
    }

    // Sync tier to user profile
    if (profile.tier !== tier) {
      await ctx.db.patch(profile._id, { tier });
      console.log(`[subscriptions] Updated ${profile.email} tier: ${profile.tier} → ${tier}`);
    }
  },
});

/**
 * Handle subscription canceled — downgrade to free.
 */
export const handleSubscriptionCanceled = internalMutation({
  args: {
    stripeSubscriptionId: v.string(),
  },
  handler: async (ctx, args) => {
    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripeSubscriptionId", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId)
      )
      .first();

    if (!sub) {
      console.error(`[subscriptions] No subscription found for ${args.stripeSubscriptionId}`);
      return;
    }

    await ctx.db.patch(sub._id, { status: "canceled", cancelAtPeriodEnd: false });

    // Downgrade profile
    const profile = await ctx.db.get(sub.profileId);
    if (profile && profile.tier !== "free") {
      await ctx.db.patch(profile._id, { tier: "free" as const });
      console.log(`[subscriptions] Canceled — downgraded ${profile.email} to free`);
    }
  },
});

/**
 * Handle failed payment — mark subscription as past_due.
 */
export const handlePaymentFailed = internalMutation({
  args: {
    stripeSubscriptionId: v.string(),
  },
  handler: async (ctx, args) => {
    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripeSubscriptionId", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId)
      )
      .first();

    if (!sub) {
      console.error(`[subscriptions] No subscription found for ${args.stripeSubscriptionId}`);
      return;
    }

    await ctx.db.patch(sub._id, { status: "past_due" });
    console.log(`[subscriptions] Payment failed for subscription ${args.stripeSubscriptionId}`);
  },
});
