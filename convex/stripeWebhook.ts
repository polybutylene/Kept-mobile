"use node";

/**
 * Stripe Webhook Processing — internal action that verifies and processes
 * Stripe events. Called by the HTTP route handler in http.ts.
 *
 * Environment variables required:
 *   STRIPE_SECRET_KEY — sk_test_xxx or sk_live_xxx
 *   STRIPE_WEBHOOK_SECRET — whsec_xxx
 */

import Stripe from "stripe";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key);
}

/**
 * Process a raw Stripe webhook event. Called from the httpAction in http.ts.
 */
export const processWebhookEvent = internalAction({
  args: {
    body: v.string(),
    signature: v.string(),
  },
  handler: async (ctx, args) => {
    const stripe = getStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not set");
    }

    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(args.body, args.signature, webhookSecret);
    } catch (err) {
      console.error("[stripe webhook] Signature verification failed:", err);
      throw new Error("Invalid signature");
    }

    console.log(`[stripe webhook] Received event: ${event.type} (${event.id})`);

    switch (event.type) {
      // ─── Checkout completed ───────────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // ─── Founding Member checkout ────────────────────────
        // Founding members use the same subscription plans but with
        // no free trial. Detected by:
        //  1. Metadata on API-created sessions
        //  2. Email match against waitlist founding_member_intent records
        //     (for Stripe Payment Link checkouts that don't carry metadata)
        //  3. Legacy: one-time $99 payment amount
        const isFoundingByMetadata =
          session.metadata?.source === "waitlist_founding_member" ||
          session.metadata?.tier === "founding_member";

        const checkoutEmail = session.customer_email ?? session.customer_details?.email;
        const isFoundingByWaitlist = checkoutEmail
          ? await ctx.runQuery(internal.waitlist.isFoundingMemberIntent, {
              email: checkoutEmail,
            })
          : false;

        // Legacy fallback: one-time $99 payment from old flow
        const isFoundingByAmount =
          session.mode === "payment" &&
          session.amount_total === 9900 &&
          !session.metadata?.userId;

        if (isFoundingByMetadata || isFoundingByWaitlist || isFoundingByAmount) {
          const email = session.customer_email ?? session.customer_details?.email;
          const customerId = session.customer as string | null;
          const paymentIntentId = session.payment_intent as string | null;
          const subscriptionId = session.subscription as string | null;

          if (email) {
            // Confirm founding member in waitlist + upgrade profile if exists
            await ctx.runMutation(internal.waitlist.confirmFoundingMember, {
              email,
              stripePaymentId: paymentIntentId ?? subscriptionId ?? session.id,
              stripeCustomerId: customerId ?? "",
              amountPaid: session.amount_total ?? 0,
            });
            console.log(`[stripe webhook] Founding member confirmed: ${email}`);

            // For subscription-mode checkouts, also create a subscription
            // record so the user can manage billing via the Stripe portal.
            if (session.mode === "subscription" && subscriptionId && customerId) {
              const subscription = await stripe.subscriptions.retrieve(subscriptionId);
              const priceId = subscription.items.data[0]?.price?.id;
              const priceInterval = subscription.items.data[0]?.price?.recurring?.interval;

              // Look up the user's auth ID from the profile
              const profile = await ctx.runQuery(internal.waitlist.getProfileByEmail, {
                email,
              });

              if (profile?.userId) {
                await ctx.runMutation(internal.subscriptions.upsertSubscription, {
                  userId: profile.userId,
                  stripeCustomerId: customerId,
                  stripeSubscriptionId: subscriptionId,
                  stripePriceId: priceId,
                  status: subscription.status === "trialing" ? "trialing" : "active",
                  billingPeriod: priceInterval === "year" ? "yearly" : "monthly",
                  currentPeriodStart: subscription.start_date
                    ? subscription.start_date * 1000
                    : undefined,
                  currentPeriodEnd: subscription.cancel_at
                    ? subscription.cancel_at * 1000
                    : undefined,
                  cancelAtPeriodEnd: subscription.cancel_at_period_end,
                  trialEnd: subscription.trial_end
                    ? subscription.trial_end * 1000
                    : undefined,
                });
                console.log(`[stripe webhook] Created subscription record for founding member: ${email}`);
              } else {
                console.log(`[stripe webhook] Founding member ${email} has no app account yet — subscription record will be created when they sign up`);
              }
            }
          } else {
            console.error("[stripe webhook] No email on founding member checkout session");
          }

          break;
        }

        // ─── Regular subscription checkout ────────────────────
        // userId can come from:
        //  1. metadata.userId (API-created checkout sessions)
        //  2. client_reference_id (Payment Link checkouts)
        //  3. Email lookup (fallback for Payment Links without client_reference_id)
        let userId = (session.metadata?.userId || session.client_reference_id) as Id<"users"> | undefined;
        const subscriptionId = session.subscription as string | null;
        const customerId = session.customer as string | null;

        if (!subscriptionId || !customerId) {
          console.error("[stripe webhook] Missing subscription/customer on checkout session", {
            userId,
            subscriptionId,
            customerId,
          });
          break;
        }

        // If no userId from metadata or client_reference_id, look up by email
        if (!userId) {
          const sessionEmail = session.customer_email ?? session.customer_details?.email;
          if (sessionEmail) {
            const profile = await ctx.runQuery(internal.waitlist.getProfileByEmail, {
              email: sessionEmail,
            });
            if (profile?.userId) {
              userId = profile.userId;
              console.log(`[stripe webhook] Resolved userId from email: ${sessionEmail}`);
            }
          }
        }

        if (!userId) {
          console.error("[stripe webhook] Could not resolve userId for checkout session", {
            sessionId: session.id,
            email: session.customer_email ?? session.customer_details?.email,
          });
          break;
        }

        // Fetch the full subscription to get price info
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price?.id;
        const priceInterval = subscription.items.data[0]?.price?.recurring?.interval;

        // Attach userId to the Stripe subscription metadata so future
        // update/cancel events can identify the user without email lookup
        try {
          await stripe.subscriptions.update(subscriptionId, {
            metadata: { userId: userId, source: "kept_web" },
          });
        } catch (metaErr) {
          console.warn("[stripe webhook] Failed to update subscription metadata:", metaErr);
        }

        await ctx.runMutation(internal.subscriptions.upsertSubscription, {
          userId,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          stripePriceId: priceId,
          status: subscription.status === "trialing" ? "trialing" : "active",
          billingPeriod: priceInterval === "year" ? "yearly" : "monthly",
          currentPeriodStart: subscription.start_date
            ? subscription.start_date * 1000
            : undefined,
          currentPeriodEnd: subscription.cancel_at
            ? subscription.cancel_at * 1000
            : undefined,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          trialEnd: subscription.trial_end
            ? subscription.trial_end * 1000
            : undefined,
        });

        console.log(`[stripe webhook] Checkout completed for user ${userId}`);
        break;
      }

      // ─── Subscription updated ─────────────────────────────
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.id;
        const customerId = subscription.customer as string;
        const priceId = subscription.items.data[0]?.price?.id;
        const priceInterval = subscription.items.data[0]?.price?.recurring?.interval;

        let userId = subscription.metadata?.userId as Id<"users"> | undefined;

        // Fallback: look up userId from existing subscription record by Stripe subscription ID
        if (!userId) {
          const existingSub = await ctx.runQuery(internal.subscriptions.getSubscriptionByStripeId, {
            stripeSubscriptionId: subscriptionId,
          });
          if (existingSub?.userId) {
            userId = existingSub.userId;
            console.log(`[stripe webhook] Resolved userId from existing subscription record`);
          }
        }

        if (!userId) {
          console.warn("[stripe webhook] No userId for subscription update, skipping", { subscriptionId });
          break;
        }

        // Map Stripe status
        let status: "active" | "past_due" | "canceled" | "trialing" | "incomplete";
        switch (subscription.status) {
          case "active":
            status = "active";
            break;
          case "trialing":
            status = "trialing";
            break;
          case "past_due":
            status = "past_due";
            break;
          case "canceled":
          case "unpaid":
            status = "canceled";
            break;
          default:
            status = "incomplete";
        }

        await ctx.runMutation(internal.subscriptions.upsertSubscription, {
          userId,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          stripePriceId: priceId,
          status,
          billingPeriod: priceInterval === "year" ? "yearly" : "monthly",
          currentPeriodStart: subscription.start_date
            ? subscription.start_date * 1000
            : undefined,
          currentPeriodEnd: subscription.cancel_at
            ? subscription.cancel_at * 1000
            : undefined,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          trialEnd: subscription.trial_end
            ? subscription.trial_end * 1000
            : undefined,
        });

        console.log(`[stripe webhook] Subscription ${subscriptionId} updated to ${status}`);
        break;
      }

      // ─── Subscription deleted ─────────────────────────────
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await ctx.runMutation(internal.subscriptions.handleSubscriptionCanceled, {
          stripeSubscriptionId: subscription.id,
        });
        console.log(`[stripe webhook] Subscription ${subscription.id} deleted/canceled`);
        break;
      }

      // ─── Payment failed ───────────────────────────────────
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        // In Stripe 2026 API, subscription is under parent.subscription_details
        const subscriptionId =
          invoice.parent?.type === "subscription_details"
            ? (typeof invoice.parent.subscription_details?.subscription === "string"
                ? invoice.parent.subscription_details.subscription
                : invoice.parent.subscription_details?.subscription?.id)
            : null;

        if (subscriptionId) {
          await ctx.runMutation(internal.subscriptions.handlePaymentFailed, {
            stripeSubscriptionId: subscriptionId,
          });
          console.log(`[stripe webhook] Payment failed for subscription ${subscriptionId}`);
        }
        break;
      }

      default:
        console.log(`[stripe webhook] Unhandled event type: ${event.type}`);
    }
  },
});
