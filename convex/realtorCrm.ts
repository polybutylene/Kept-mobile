import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getRealtors = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email!))
      .first();
    if (!user) return [];

    const realtors = await ctx.db
      .query("realtorContacts")
      .withIndex("by_inspectorId", (q) => q.eq("inspectorId", user._id))
      .take(100);

    const now = Date.now();
    const sixtyDaysMs = 60 * 24 * 60 * 60 * 1000;

    return realtors.map((r) => ({
      ...r,
      isQuiet:
        r.lastReferralDate != null &&
        now - r.lastReferralDate > sixtyDaysMs,
      daysSinceLastReferral: r.lastReferralDate
        ? Math.floor((now - r.lastReferralDate) / (24 * 60 * 60 * 1000))
        : null,
    }));
  },
});

export const addRealtor = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email!))
      .first();
    if (!user) throw new Error("User not found");

    return await ctx.db.insert("realtorContacts", {
      inspectorId: user._id,
      name: args.name,
      email: args.email,
      phone: args.phone,
      company: args.company,
      totalReferrals: 0,
      referralsThisMonth: 0,
      referralsThisYear: 0,
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const recordReferral = mutation({
  args: { realtorId: v.id("realtorContacts") },
  handler: async (ctx, args) => {
    const realtor = await ctx.db.get(args.realtorId);
    if (!realtor) throw new Error("Realtor not found");

    await ctx.db.patch(args.realtorId, {
      totalReferrals: realtor.totalReferrals + 1,
      referralsThisMonth: realtor.referralsThisMonth + 1,
      referralsThisYear: realtor.referralsThisYear + 1,
      lastReferralDate: Date.now(),
      firstReferralDate: realtor.firstReferralDate ?? Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateRealtor = mutation({
  args: {
    realtorId: v.id("realtorContacts"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { realtorId, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, val]) => val !== undefined),
    );
    await ctx.db.patch(realtorId, { ...filtered, updatedAt: Date.now() });
  },
});

export const recordContact = mutation({
  args: {
    realtorId: v.id("realtorContacts"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.realtorId, {
      lastContactDate: Date.now(),
      notes: args.notes,
      updatedAt: Date.now(),
    });
  },
});

export const getRealtorStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email!))
      .first();
    if (!user) return null;

    const realtors = await ctx.db
      .query("realtorContacts")
      .withIndex("by_inspectorId", (q) => q.eq("inspectorId", user._id))
      .take(100);

    const active = realtors.filter((r) => r.status === "active");
    const totalReferrals = active.reduce(
      (s, r) => s + r.totalReferrals,
      0,
    );
    const thisYear = active.reduce(
      (s, r) => s + r.referralsThisYear,
      0,
    );
    const thisMonth = active.reduce(
      (s, r) => s + r.referralsThisMonth,
      0,
    );

    const now = Date.now();
    const sixtyDays = 60 * 24 * 60 * 60 * 1000;
    const quiet = active.filter(
      (r) =>
        r.lastReferralDate != null &&
        now - r.lastReferralDate > sixtyDays,
    );

    return {
      totalRealtors: active.length,
      totalReferrals,
      referralsThisYear: thisYear,
      referralsThisMonth: thisMonth,
      quietRealtors: quiet.length,
      topRealtor: active.sort(
        (a, b) => b.totalReferrals - a.totalReferrals,
      )[0]?.name ?? null,
    };
  },
});
