import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import {
  getUserPortfolioId,
  getPortfolioAccess,
  canManageBilling,
  getProfileFromAuthId,
} from "./lib/permissions";

/**
 * Get portfolio billing summary
 */
export const getPortfolioBillingSummary = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) return null;

    const portfolioId = await getUserPortfolioId(ctx, profile._id);
    if (!portfolioId) return null;

    const portfolio = await ctx.db.get(portfolioId);
    if (!portfolio) return null;

    const billingPlan = await ctx.db
      .query("billingPlans")
      .withIndex("by_portfolio", (q) => q.eq("portfolioId", portfolioId))
      .first();

    if (!billingPlan) return null;

    // Calculate current monthly cost
    const baseCost = billingPlan.basePrice;
    const ownerCost = billingPlan.ownerCount * billingPlan.perOwnerPrice;
    const totalMonthlyCost = baseCost + ownerCost;

    // Get owner breakdown by status
    const units = await ctx.db
      .query("units")
      .withIndex("by_portfolio", (q) => q.eq("portfolioId", portfolioId))
      .collect();

    const activeOwners = units.filter((u) => u.status === "owner_active").length;
    const pendingInvites = units.filter((u) => u.status === "pending_invite").length;
    const vacantUnits = units.filter((u) => u.status === "vacant").length;

    // Calculate projected cost if all pending invites accept
    const projectedOwnerCost = (activeOwners + pendingInvites) * billingPlan.perOwnerPrice;
    const projectedMonthlyCost = baseCost + projectedOwnerCost;

    return {
      plan: portfolio.plan,
      subscriptionStatus: portfolio.subscriptionStatus,
      seatLimit: portfolio.seatLimit,
      currentSeats: portfolio.currentSeats,
      availableSeats: portfolio.seatLimit - portfolio.currentSeats,
      
      billing: {
        basePrice: billingPlan.basePrice,
        perOwnerPrice: billingPlan.perOwnerPrice,
        ownerCount: billingPlan.ownerCount,
        billingInterval: billingPlan.billingInterval,
        nextBillDate: billingPlan.nextBillDate,
        lastBillDate: billingPlan.lastBillDate,
        lastBillAmount: billingPlan.lastBillAmount,
      },

      costs: {
        baseCost,
        ownerCost,
        totalMonthlyCost,
        totalYearlyCost: totalMonthlyCost * 12,
        projectedMonthlyCost,
      },

      breakdown: {
        activeOwners,
        pendingInvites,
        vacantUnits,
        totalUnits: units.length,
      },

      breakdown_display: [
        { label: "Platform Base", amount: baseCost },
        { label: `Active Owners (${activeOwners} × $${billingPlan.perOwnerPrice})`, amount: activeOwners * billingPlan.perOwnerPrice },
      ],
    };
  },
});

/**
 * Recalculate owner count from actual data
 * Used to sync billing with actual active owners
 */
export const recalculateOwnerCount = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) throw new Error("Profile not found");

    const portfolioId = await getUserPortfolioId(ctx, profile._id);
    if (!portfolioId) {
      return { success: false, reason: "portfolio_not_found" };
    }

    const access = await getPortfolioAccess(ctx, portfolioId, profile._id);
    if (!access || !canManageBilling(access.role)) {
      throw new Error("Permission denied");
    }

    // Count actual active owners
    const units = await ctx.db
      .query("units")
      .withIndex("by_portfolio", (q) => q.eq("portfolioId", portfolioId))
      .collect();

    const activeOwners = units.filter((u) => u.status === "owner_active").length;

    // Update portfolio
    await ctx.db.patch(portfolioId, {
      currentSeats: activeOwners,
    });

    // Update billing plan
    const billingPlan = await ctx.db
      .query("billingPlans")
      .withIndex("by_portfolio", (q) => q.eq("portfolioId", portfolioId))
      .first();

    if (billingPlan) {
      await ctx.db.patch(billingPlan._id, {
        ownerCount: activeOwners,
      });
    }

    return { activeOwners };
  },
});

/**
 * Get billing history (for future implementation with Stripe)
 */
export const getBillingHistory = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) return [];

    const portfolioId = await getUserPortfolioId(ctx, profile._id);
    if (!portfolioId) return [];

    // For now, return empty array. In future, this would fetch from Stripe
    // or a billing_history table
    return [];
  },
});

/**
 * Update billing interval (monthly/yearly)
 */
export const updateBillingInterval = mutation({
  args: {
    interval: v.union(v.literal("monthly"), v.literal("yearly")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) throw new Error("Profile not found");

    const portfolioId = await getUserPortfolioId(ctx, profile._id);
    if (!portfolioId) {
      return { success: false, reason: "portfolio_not_found" };
    }

    const access = await getPortfolioAccess(ctx, portfolioId, profile._id);
    if (!access || !canManageBilling(access.role)) {
      throw new Error("Permission denied");
    }

    const billingPlan = await ctx.db
      .query("billingPlans")
      .withIndex("by_portfolio", (q) => q.eq("portfolioId", portfolioId))
      .first();

    if (!billingPlan) throw new Error("Billing plan not found");

    await ctx.db.patch(billingPlan._id, {
      billingInterval: args.interval,
    });

    return { success: true };
  },
});

/**
 * Get seat usage details
 */
export const getSeatUsage = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) return null;

    const portfolioId = await getUserPortfolioId(ctx, profile._id);
    if (!portfolioId) return null;

    const portfolio = await ctx.db.get(portfolioId);
    if (!portfolio) return null;

    // Get detailed breakdown by property
    const properties = await ctx.db
      .query("properties")
      .withIndex("by_portfolio_active", (q) =>
        q.eq("portfolioId", portfolioId).eq("isArchived", false)
      )
      .collect();

    const propertyBreakdown = await Promise.all(
      properties.map(async (property) => {
        const units = await ctx.db
          .query("units")
          .withIndex("by_property", (q) => q.eq("propertyId", property._id))
          .collect();

        const activeOwners = units.filter((u) => u.status === "owner_active").length;
        const pendingInvites = units.filter((u) => u.status === "pending_invite").length;

        return {
          propertyId: property._id,
          propertyName: property.name,
          totalUnits: units.length,
          activeOwners,
          pendingInvites,
          vacant: units.filter((u) => u.status === "vacant").length,
        };
      })
    );

    const totals = propertyBreakdown.reduce(
      (acc, p) => ({
        totalUnits: acc.totalUnits + p.totalUnits,
        activeOwners: acc.activeOwners + p.activeOwners,
        pendingInvites: acc.pendingInvites + p.pendingInvites,
        vacant: acc.vacant + p.vacant,
      }),
      { totalUnits: 0, activeOwners: 0, pendingInvites: 0, vacant: 0 }
    );

    return {
      seatLimit: portfolio.seatLimit,
      currentSeats: portfolio.currentSeats,
      availableSeats: portfolio.seatLimit - portfolio.currentSeats,
      usagePercent: Math.round((portfolio.currentSeats / portfolio.seatLimit) * 100),
      totals,
      byProperty: propertyBreakdown,
    };
  },
});
