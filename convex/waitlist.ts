/**
 * Waitlist — mutations, queries, and referral logic for the
 * pre-launch waitlist and founding member flow.
 */

import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

// ============================================================
// Join free waitlist
// ============================================================

export const joinWaitlist = mutation({
  args: {
    email: v.string(),
    firstName: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    emailOptIn: v.boolean(),
    referredBy: v.optional(v.string()),
    source: v.optional(v.string()),
    utmSource: v.optional(v.string()),
    utmMedium: v.optional(v.string()),
    utmCampaign: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();

    // Check for existing entry
    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existing) {
      return {
        id: existing._id,
        position: existing.position,
        tier: existing.tier,
        alreadyExists: true,
      };
    }

    // Get next position number
    const lastEntry = await ctx.db
      .query("waitlist")
      .withIndex("by_position")
      .order("desc")
      .first();
    const position = (lastEntry?.position ?? 0) + 1;

    // Generate referral code
    const referralCode = generateReferralCode(email);

    const id = await ctx.db.insert("waitlist", {
      email,
      firstName: args.firstName,
      zipCode: args.zipCode,
      tier: "free",
      position,
      emailOptIn: args.emailOptIn,
      referredBy: args.referredBy,
      referralCode,
      referralCount: 0,
      source: args.source,
      utmSource: args.utmSource,
      utmMedium: args.utmMedium,
      utmCampaign: args.utmCampaign,
      convertedToUser: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // If referred, increment referrer's count
    if (args.referredBy) {
      const refCode = args.referredBy;
      const referrer = await ctx.db
        .query("waitlist")
        .withIndex("by_referralCode", (q) => q.eq("referralCode", refCode))
        .first();
      if (referrer) {
        await ctx.db.patch(referrer._id, {
          referralCount: referrer.referralCount + 1,
        });
      }
    }

    return { id, position, tier: "free" as const, alreadyExists: false };
  },
});

// ============================================================
// Register founding member intent (pre-Stripe redirect)
// ============================================================

export const registerFoundingMemberIntent = mutation({
  args: {
    email: v.string(),
    firstName: v.optional(v.string()),
    source: v.optional(v.string()),
    utmSource: v.optional(v.string()),
    utmMedium: v.optional(v.string()),
    utmCampaign: v.optional(v.string()),
    referredBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();

    // Check for existing
    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existing) {
      // Upgrade to intent if they were free
      if (existing.tier === "free") {
        await ctx.db.patch(existing._id, {
          tier: "founding_member_intent",
          updatedAt: Date.now(),
        });
      }
      return { waitlistId: existing._id, position: existing.position };
    }

    // Create new entry as founding_member_intent
    const lastEntry = await ctx.db
      .query("waitlist")
      .withIndex("by_position")
      .order("desc")
      .first();
    const position = (lastEntry?.position ?? 0) + 1;
    const referralCode = generateReferralCode(email);

    const id = await ctx.db.insert("waitlist", {
      email,
      firstName: args.firstName,
      tier: "founding_member_intent",
      position,
      emailOptIn: true,
      referredBy: args.referredBy,
      referralCode,
      referralCount: 0,
      source: args.source,
      utmSource: args.utmSource,
      utmMedium: args.utmMedium,
      utmCampaign: args.utmCampaign,
      convertedToUser: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Track referral
    if (args.referredBy) {
      const refCode = args.referredBy;
      const referrer = await ctx.db
        .query("waitlist")
        .withIndex("by_referralCode", (q) => q.eq("referralCode", refCode))
        .first();
      if (referrer) {
        await ctx.db.patch(referrer._id, {
          referralCount: referrer.referralCount + 1,
        });
      }
    }

    return { waitlistId: id, position };
  },
});

// ============================================================
// Confirm founding member payment (called from webhook)
// ============================================================

export const confirmFoundingMember = internalMutation({
  args: {
    email: v.string(),
    stripePaymentId: v.string(),
    stripeCustomerId: v.string(),
    amountPaid: v.number(),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();
    const now = Date.now();

    const entry = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (entry) {
      await ctx.db.patch(entry._id, {
        tier: "founding_member",
        stripePaymentId: args.stripePaymentId,
        stripeCustomerId: args.stripeCustomerId,
        amountPaid: args.amountPaid,
        paymentStatus: "completed",
        updatedAt: now,
      });
      console.log(`[waitlist] Confirmed founding member: ${email}`);
    } else {
      console.error(`[waitlist] No entry found for email: ${email}`);
    }

    // If the user already has an app account, upgrade them immediately
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, {
        tier: "homeowner",
        maxHomes: 2,
        isFoundingMember: true,
        foundingMemberSince: existingProfile.foundingMemberSince ?? now,
      });
      console.log(`[waitlist] Upgraded existing profile to homeowner: ${email}`);
    }
  },
});

// ============================================================
// Public stats for social proof counter
// ============================================================

export const getWaitlistStats = query({
  handler: async (ctx) => {
    const all = await ctx.db.query("waitlist").collect();
    const freeCount = all.filter((e) => e.tier === "free" || e.tier === "founding_member_intent").length;
    const foundingMemberCount = all.filter((e) => e.tier === "founding_member").length;
    return {
      totalWaitlist: all.length,
      freeCount,
      foundingMemberCount,
    };
  },
});

// ============================================================
// Admin queries
// ============================================================

export const getWaitlistAdmin = query({
  handler: async (ctx) => {
    const all = await ctx.db
      .query("waitlist")
      .order("desc")
      .collect();

    // Stats by source
    const bySource: Record<string, { total: number; paid: number }> = {};
    const byZip: Record<string, number> = {};

    for (const entry of all) {
      const src = entry.source ?? "direct";
      if (!bySource[src]) bySource[src] = { total: 0, paid: 0 };
      bySource[src].total++;
      if (entry.tier === "founding_member") bySource[src].paid++;

      if (entry.zipCode) {
        byZip[entry.zipCode] = (byZip[entry.zipCode] ?? 0) + 1;
      }
    }

    const freeCount = all.filter((e) => e.tier === "free" || e.tier === "founding_member_intent").length;
    const foundingCount = all.filter((e) => e.tier === "founding_member").length;
    const revenue = all
      .filter((e) => e.tier === "founding_member" && e.paymentStatus === "completed")
      .reduce((sum, e) => sum + (e.amountPaid ?? 0), 0);

    return {
      totalSignups: all.length,
      freeCount,
      foundingMemberCount: foundingCount,
      revenue: Math.round(revenue / 100), // cents to dollars
      conversionRate: all.length > 0 ? Math.round((foundingCount / all.length) * 1000) / 10 : 0,
      bySource,
      topZipCodes: Object.entries(byZip)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10),
      recentSignups: all.slice(0, 20).map((e) => ({
        id: e._id,
        email: e.email,
        firstName: e.firstName,
        tier: e.tier,
        source: e.source ?? "direct",
        position: e.position,
        createdAt: e.createdAt,
        paymentStatus: e.paymentStatus,
      })),
    };
  },
});

// ============================================================
// Internal: check if an email is a founding member intent
// Used by the Stripe webhook to identify Payment Link checkouts.
// ============================================================

export const isFoundingMemberIntent = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();
    const entry = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!entry) return false;
    return (
      entry.tier === "founding_member_intent" ||
      entry.tier === "founding_member"
    );
  },
});

// ============================================================
// Internal: look up a userProfile by email (for webhook use)
// ============================================================

export const getProfileByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();
    return await ctx.db
      .query("userProfiles")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
  },
});

// ============================================================
// Helpers
// ============================================================

function generateReferralCode(email: string): string {
  const hash = email.split("").reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  return `KEPT-${Math.abs(hash).toString(36).toUpperCase().slice(0, 6)}`;
}
