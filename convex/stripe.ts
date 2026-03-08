"use node";

/**
 * Stripe actions — create checkout sessions and customer portal sessions.
 *
 * Environment variables required:
 *   STRIPE_SECRET_KEY — sk_test_xxx or sk_live_xxx
 *   STRIPE_PRICE_MONTHLY — price_xxx
 *   STRIPE_PRICE_YEARLY — price_xxx
 *   APP_URL — https://kept.systems
 */

import Stripe from "stripe";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key);
}

// ============================================================
// Create Checkout Session
// ============================================================

export const createCheckoutSession = action({
  args: {
    billingPeriod: v.union(v.literal("monthly"), v.literal("yearly")),
  },
  handler: async (ctx, args): Promise<{ url: string | null }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.runQuery(internal.ai.queries.getProfileByUserId, { userId });
    if (!profile) throw new Error("User profile not found");

    const stripe = getStripe();

    const priceId =
      args.billingPeriod === "monthly"
        ? process.env.STRIPE_PRICE_MONTHLY
        : process.env.STRIPE_PRICE_YEARLY;

    if (!priceId) {
      throw new Error(
        `STRIPE_PRICE_${args.billingPeriod.toUpperCase()} environment variable is not set`
      );
    }

    const appUrl = process.env.APP_URL ?? "https://kept.systems";

    // Check if user already has a Stripe customer ID
    const existingSub = await ctx.runQuery(internal.subscriptions.getSubscriptionByUserId, {
      userId,
    });

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/settings/subscription?success=true`,
      cancel_url: `${appUrl}/settings/subscription?canceled=true`,
      subscription_data: {
        metadata: {
          userId: userId,
          convexProfileId: profile._id,
        },
      },
      metadata: {
        userId: userId,
        convexProfileId: profile._id,
      },
    };

    // Reuse existing Stripe customer if they have one
    if (existingSub?.stripeCustomerId) {
      sessionParams.customer = existingSub.stripeCustomerId;
    } else {
      sessionParams.customer_email = profile.email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return { url: session.url };
  },
});

// ============================================================
// Create Customer Portal Session
// ============================================================

export const createPortalSession = action({
  args: {},
  handler: async (ctx): Promise<{ url: string }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const sub = await ctx.runQuery(internal.subscriptions.getSubscriptionByUserId, {
      userId,
    });

    let stripeCustomerId = sub?.stripeCustomerId;

    // If no subscription record exists, look up the Stripe customer by email.
    // This handles founding members who paid before their account was created
    // and whose webhook didn't properly link their Stripe data.
    if (!stripeCustomerId) {
      const profile = await ctx.runQuery(internal.ai.queries.getProfileByUserId, { userId });
      if (!profile?.email) {
        throw new Error("No active subscription found. Subscribe first.");
      }

      const stripe = getStripe();
      const customers = await stripe.customers.list({
        email: profile.email,
        limit: 1,
      });

      if (customers.data.length === 0) {
        throw new Error("No active subscription found. Subscribe first.");
      }

      stripeCustomerId = customers.data[0].id;

      // Auto-repair: create the missing subscription record so future
      // calls don't need to look up Stripe again.
      const subscriptions = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: "active",
        limit: 1,
      });

      if (subscriptions.data.length > 0) {
        const activeSub = subscriptions.data[0];
        const priceId = activeSub.items.data[0]?.price?.id;
        const priceInterval = activeSub.items.data[0]?.price?.recurring?.interval;

        await ctx.runMutation(internal.subscriptions.upsertSubscription, {
          userId,
          stripeCustomerId,
          stripeSubscriptionId: activeSub.id,
          stripePriceId: priceId,
          status: activeSub.status === "trialing" ? "trialing" : "active",
          billingPeriod: priceInterval === "year" ? "yearly" : "monthly",
          cancelAtPeriodEnd: activeSub.cancel_at_period_end,
        });
        console.log(`[stripe portal] Auto-repaired subscription for ${profile.email}`);
      }
    }

    const stripe = getStripe();
    const appUrl = process.env.APP_URL ?? "https://kept.systems";

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${appUrl}/settings/subscription`,
    });

    return { url: session.url };
  },
});

// ============================================================
// Create Founding Member Checkout
//
// Same plans as regular subscriptions ($10.99/mo or $99/yr)
// but with NO free trial — founders pay upfront to help build
// the product. Includes founding member metadata so the webhook
// can grant the permanent Founding Member badge.
// ============================================================

export const createFoundingMemberCheckout = action({
  args: {
    email: v.string(),
    firstName: v.optional(v.string()),
    waitlistId: v.optional(v.string()),
    billingPeriod: v.union(v.literal("monthly"), v.literal("yearly")),
  },
  handler: async (ctx, args): Promise<{ url: string | null }> => {
    const stripe = getStripe();
    const appUrl = process.env.APP_URL ?? "https://kept.systems";

    const priceId =
      args.billingPeriod === "monthly"
        ? process.env.STRIPE_PRICE_MONTHLY
        : process.env.STRIPE_PRICE_YEARLY;

    if (!priceId) {
      throw new Error(
        `STRIPE_PRICE_${args.billingPeriod.toUpperCase()} environment variable is not set`
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: args.email,
      // No trial_period_days — founders pay upfront
      success_url: `${appUrl}/waitlist/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/waitlist?canceled=true`,
      subscription_data: {
        metadata: {
          tier: "founding_member",
          source: "waitlist_founding_member",
          waitlist_id: args.waitlistId ?? "",
          first_name: args.firstName ?? "",
        },
      },
      metadata: {
        tier: "founding_member",
        source: "waitlist_founding_member",
        waitlist_id: args.waitlistId ?? "",
        first_name: args.firstName ?? "",
        billing_period: args.billingPeriod,
      },
    });

    return { url: session.url };
  },
});
