/**
 * Client-facing queries and mutations for the Upgrade Planning system.
 * These are called by the iOS SwiftUI views.
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ════════════════════════════════════════════════════════════════════
// QUERIES
// ════════════════════════════════════════════════════════════════════

/** Get all upgrade comparisons for the authenticated user. */
export const listComparisons = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) return [];

    const comparisons = await ctx.db
      .query("upgradeComparisons")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    // Filter out old dismissed ones, keep active
    return comparisons.filter(
      (c) => c.status !== "dismissed" && c.status !== "completed"
    );
  },
});

/** Get a single upgrade comparison by ID. */
export const getComparison = query({
  args: { comparisonId: v.id("upgradeComparisons") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const comparison = await ctx.db.get(args.comparisonId);
    if (!comparison) return null;

    // Verify ownership
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user || comparison.userId !== user._id) return null;

    return comparison;
  },
});

/** Get upgrade comparison for a specific system. */
export const getComparisonForSystem = query({
  args: { systemId: v.id("systems") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) return null;

    return await ctx.db
      .query("upgradeComparisons")
      .withIndex("by_systemId", (q) => q.eq("systemId", args.systemId))
      .order("desc")
      .first();
  },
});

/** Get quotes for an upgrade comparison. */
export const listQuotes = query({
  args: { comparisonId: v.id("upgradeComparisons") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("upgradeQuotes")
      .withIndex("by_comparisonId", (q) => q.eq("comparisonId", args.comparisonId))
      .collect();
  },
});

/** Get the savings plan for a system's upgrade. */
export const getSavingsPlan = query({
  args: { systemId: v.id("systems") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) return null;

    return await ctx.db
      .query("savingsPlans")
      .withIndex("by_systemId", (q) => q.eq("systemId", args.systemId))
      .order("desc")
      .first();
  },
});

/** Get multi-system priority plan for a home. */
export const getMultiSystemPlan = query({
  args: { homeId: v.id("homes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("multiSystemPlans")
      .withIndex("by_homeId", (q) => q.eq("homeId", args.homeId))
      .order("desc")
      .first();
  },
});

// ════════════════════════════════════════════════════════════════════
// MUTATIONS (user-initiated actions from the UI)
// ════════════════════════════════════════════════════════════════════

/** User responds to upgrade comparison (show options, remind later, not interested). */
export const respondToComparison = mutation({
  args: {
    comparisonId: v.id("upgradeComparisons"),
    response: v.union(
      v.literal("show_options"),
      v.literal("remind_later"),
      v.literal("not_interested"),
      v.literal("need_to_think")
    ),
    remindInDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const comparison = await ctx.db.get(args.comparisonId);
    if (!comparison) throw new Error("Comparison not found");

    const updates: Record<string, unknown> = {
      userResponse: args.response,
      updatedAt: Date.now(),
    };

    switch (args.response) {
      case "show_options":
        updates.status = "user_reviewing";
        break;
      case "remind_later":
        updates.status = "remind_later";
        updates.remindAt = Date.now() + (args.remindInDays ?? 90) * 24 * 60 * 60 * 1000;
        break;
      case "not_interested":
        updates.status = "dismissed";
        break;
      case "need_to_think":
        updates.status = "presented";
        break;
    }

    await ctx.db.patch(args.comparisonId, updates);
  },
});

/** User selects an upgrade option. */
export const selectUpgradeOption = mutation({
  args: {
    comparisonId: v.id("upgradeComparisons"),
    selectedTier: v.string(),
    targetMonths: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) throw new Error("User not found");

    const comparison = await ctx.db.get(args.comparisonId);
    if (!comparison || comparison.userId !== user._id) {
      throw new Error("Comparison not found");
    }

    const selectedOption = comparison.options.find((o) => o.tier === args.selectedTier);
    if (!selectedOption) throw new Error("Invalid tier");

    const estimatedCost = (selectedOption.installedCostLow + selectedOption.installedCostHigh) / 2;
    const rebateOffset = selectedOption.rebatesAvailable.reduce((s, r) => s + r.amount, 0);
    const netSavingsNeeded = Math.max(0, estimatedCost - rebateOffset);
    const monthlyAmount = Math.ceil(netSavingsNeeded / Math.max(1, args.targetMonths) / 25) * 25;

    const targetDate = new Date(
      Date.now() + args.targetMonths * 30.44 * 24 * 60 * 60 * 1000
    ).toISOString().slice(0, 10);

    // Generate milestones
    const quarterMonths = Math.ceil(args.targetMonths / 4);
    const milestones = [
      { month: quarterMonths, amount: Math.round(netSavingsNeeded * 0.25), label: "25% — great start!" },
      { month: quarterMonths * 2, amount: Math.round(netSavingsNeeded * 0.5), label: "Halfway there!" },
      { month: quarterMonths * 3, amount: Math.round(netSavingsNeeded * 0.75), label: "Time to get quotes" },
      { month: args.targetMonths, amount: netSavingsNeeded, label: "Ready to replace!" },
    ];

    // Create/update savings plan
    const existing = await ctx.db
      .query("savingsPlans")
      .withIndex("by_systemId", (q) => q.eq("systemId", comparison.systemId))
      .first();

    const now = Date.now();

    if (existing && existing.status === "active") {
      await ctx.db.patch(existing._id, {
        targetAmount: estimatedCost,
        monthlyAmount,
        comparisonId: comparison._id,
        selectedTier: args.selectedTier,
        rebateOffset,
        netSavingsNeeded,
        targetDate,
        milestones,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("savingsPlans", {
        userId: user._id,
        homeId: comparison.homeId,
        systemId: comparison.systemId,
        targetAmount: estimatedCost,
        currentBalance: 0,
        monthlyAmount,
        status: "active",
        comparisonId: comparison._id,
        selectedTier: args.selectedTier,
        rebateOffset,
        netSavingsNeeded,
        targetDate,
        milestones,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Update comparison status
    await ctx.db.patch(comparison._id, {
      userSelectedTier: args.selectedTier,
      userResponse: "selected_option",
      status: "savings_plan_active",
      updatedAt: now,
    });
  },
});

/** User adds a contractor quote for their upgrade. */
export const addQuote = mutation({
  args: {
    comparisonId: v.id("upgradeComparisons"),
    contractorName: v.string(),
    totalAmount: v.number(),
    selectedTier: v.string(),
    includesPermit: v.optional(v.boolean()),
    includesDisposal: v.optional(v.boolean()),
    includesWarranty: v.optional(v.boolean()),
    warrantyYears: v.optional(v.number()),
    specificEquipment: v.optional(v.string()),
    timeline: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) throw new Error("User not found");

    const comparison = await ctx.db.get(args.comparisonId);
    if (!comparison || comparison.userId !== user._id) {
      throw new Error("Comparison not found");
    }

    // Basic price assessment against our data
    const selectedOption = comparison.options.find((o) => o.tier === args.selectedTier);
    let agentAssessment: "fair" | "good_value" | "above_average" | "high" | "suspiciously_low" = "fair";
    const missingItems: string[] = [];

    if (selectedOption) {
      const midCost = (selectedOption.installedCostLow + selectedOption.installedCostHigh) / 2;
      const ratio = args.totalAmount / midCost;

      if (ratio < 0.7) agentAssessment = "suspiciously_low";
      else if (ratio < 0.9) agentAssessment = "good_value";
      else if (ratio <= 1.1) agentAssessment = "fair";
      else if (ratio <= 1.3) agentAssessment = "above_average";
      else agentAssessment = "high";

      // Flag missing items
      if (args.includesPermit === false) missingItems.push("Permit not included — verify this is handled separately");
      if (args.includesDisposal === false) missingItems.push("Old equipment disposal not included — budget $100-300 extra");
      if (args.includesWarranty === false) missingItems.push("Warranty details not specified — ask about parts and labor warranty");
    }

    const quoteId = await ctx.db.insert("upgradeQuotes", {
      userId: user._id,
      homeId: comparison.homeId,
      systemId: comparison.systemId,
      comparisonId: comparison._id,
      contractorName: args.contractorName,
      totalAmount: args.totalAmount,
      selectedTier: args.selectedTier,
      includesPermit: args.includesPermit,
      includesDisposal: args.includesDisposal,
      includesWarranty: args.includesWarranty,
      warrantyYears: args.warrantyYears,
      specificEquipment: args.specificEquipment,
      timeline: args.timeline,
      notes: args.notes,
      agentAssessment,
      missingItems: missingItems.length > 0 ? missingItems : undefined,
      createdAt: Date.now(),
    });

    // Update comparison to quotes phase
    if (comparison.status !== "quotes_phase") {
      await ctx.db.patch(comparison._id, {
        status: "quotes_phase",
        updatedAt: Date.now(),
      });
    }

    return quoteId;
  },
});
