/**
 * Upgrade Planning Agent Tools — definitions and mutations.
 *
 * Tools:
 * 1. generate_upgrade_comparison — research-only, no approval needed
 * 2. create_upgrade_savings_plan — requires approval (modifies finances)
 * 3. initiate_upgrade_planning — research-only, queues notification
 * 4. model_financing_scenario — pure calculation, no side effects
 */

import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import {
  getUpgradePath,
  calculateTCO,
  calculatePaybackMonths,
  classifyUpgradeUrgency,
  generateConversationStarter,
  type UpgradeTier,
} from "./upgradeData";

// ════════════════════════════════════════════════════════════════════
// TOOL DEFINITIONS (added to AGENT_TOOLS in tools.ts)
// ════════════════════════════════════════════════════════════════════

interface ToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required: string[];
  };
}

export const UPGRADE_TOOLS: ToolDefinition[] = [
  {
    name: "generate_upgrade_comparison",
    description:
      "Creates a side-by-side comparison of replacement/upgrade options for a specific system, " +
      "including installed cost, operating cost difference, payback period, total cost of ownership, " +
      "rebate eligibility, and Kept's recommendation with reasoning. Research only — no action taken.",
    input_schema: {
      type: "object" as const,
      properties: {
        systemId: { type: "string", description: "The _id of the system to compare upgrades for" },
        includeFinancing: {
          type: "boolean",
          description: "Whether to model financing options alongside cash scenarios",
        },
        triggerReason: {
          type: "string",
          description: "Why this comparison is being generated (threshold, user request, seasonal, symptom)",
        },
      },
      required: ["systemId", "triggerReason"],
    },
  },
  {
    name: "create_upgrade_savings_plan",
    description:
      "Once user selects a replacement/upgrade option, creates a personalized savings plan with " +
      "monthly targets, timeline, and milestones. Factors in available rebates to reduce the target.",
    input_schema: {
      type: "object" as const,
      properties: {
        systemId: { type: "string", description: "The _id of the system" },
        comparisonId: { type: "string", description: "The _id of the upgradeComparison" },
        selectedTier: {
          type: "string",
          enum: ["same_for_same", "moderate_upgrade", "technology_change"],
        },
        estimatedCost: { type: "number", description: "Midpoint of cost range" },
        targetDate: { type: "string", description: "ISO date when funds should be ready" },
        applyRebates: { type: "boolean", description: "Reduce target by expected rebate amounts" },
      },
      required: ["systemId", "comparisonId", "selectedTier", "estimatedCost", "targetDate"],
    },
  },
  {
    name: "initiate_upgrade_planning",
    description:
      "Proactive trigger tool. When a system crosses a planning threshold, generates the upgrade " +
      "comparison and presents it as an interactive decision guide with a personalized conversation " +
      "starter. Does NOT require approval — just presenting information.",
    input_schema: {
      type: "object" as const,
      properties: {
        systemId: { type: "string", description: "The _id of the system" },
        triggerReason: {
          type: "string",
          description: "Why now — threshold crossed, user request, seasonal opportunity, gotcha factor",
        },
        urgency: {
          type: "string",
          enum: ["low", "medium", "high", "critical"],
        },
      },
      required: ["systemId", "triggerReason", "urgency"],
    },
  },
  {
    name: "model_financing_scenario",
    description:
      "For higher-cost upgrades, models what financing would look like (home equity, personal loan, " +
      "manufacturer financing). Purely informational — no connection to any lender.",
    input_schema: {
      type: "object" as const,
      properties: {
        estimatedCost: { type: "number", description: "Total cost to finance" },
        scenarios: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: {
                type: "string",
                enum: ["home_equity", "personal_loan", "manufacturer_financing", "credit_card"],
              },
              apr: { type: "number", description: "Annual percentage rate" },
              termMonths: { type: "number", description: "Loan term in months" },
            },
          },
          description: "Financing scenarios to model",
        },
      },
      required: ["estimatedCost", "scenarios"],
    },
  },
];

// ════════════════════════════════════════════════════════════════════
// TOOL MUTATIONS
// ════════════════════════════════════════════════════════════════════

/**
 * Generate a full upgrade comparison for a system.
 * Looks up the system's type, finds upgrade path data, calculates TCO,
 * and stores the comparison for the user to review.
 */
export const generateUpgradeComparison = internalMutation({
  args: {
    userId: v.id("users"),
    homeId: v.id("homes"),
    systemId: v.string(),
    workflowId: v.optional(v.id("agentWorkflows")),
    includeFinancing: v.optional(v.boolean()),
    triggerReason: v.string(),
  },
  handler: async (ctx, args) => {
    const sysId = args.systemId as Id<"systems">;
    const system = await ctx.db.get(sysId);
    if (!system || system.homeId !== args.homeId) {
      return { success: false, error: "System not found or access denied" };
    }

    // Get system type for upgrade path lookup
    const systemType = await ctx.db.get(system.systemTypeId);
    if (!systemType || !systemType.key) {
      return { success: false, error: "System type not found or missing key" };
    }

    // Find upgrade path data
    const upgradePath = getUpgradePath(systemType.key);
    if (!upgradePath) {
      return {
        success: false,
        error: `No upgrade path data for system type: ${systemType.key}`,
      };
    }

    // Calculate system age
    let ageYears = 0;
    if (system.installDate) {
      const installed = new Date(system.installDate);
      if (!isNaN(installed.getTime())) {
        ageYears = Math.round(
          ((Date.now() - installed.getTime()) / (365.25 * 24 * 60 * 60 * 1000)) * 10
        ) / 10;
      }
    }

    // Get forecast for Weibull threshold
    const forecast = await ctx.db
      .query("forecastResults")
      .withIndex("by_system", (q) => q.eq("systemId", sysId))
      .first();

    const weibullThreshold = forecast?.cumulativeFailureProbability ?? 0;

    // Check for gotcha factors
    const hasGotcha = upgradePath.gotchaFactors.some((g) => {
      if (g.trigger === "r22_refrigerant" && system.conditionNotes?.toLowerCase().includes("r-22")) return true;
      if (g.trigger === "r22_refrigerant" && system.conditionNotes?.toLowerCase().includes("r22")) return true;
      if (g.trigger === "federal_pacific" && system.manufacturer?.toLowerCase().includes("federal pacific")) return true;
      if (g.trigger === "zinsco" && system.manufacturer?.toLowerCase().includes("zinsco")) return true;
      if (g.trigger === "polybutylene_material") return true; // Always applies for polybutylene type
      if (g.trigger === "age_over_10" && ageYears > 10) return true;
      if (g.trigger === "galvanized_corrosion" && ageYears > 40) return true;
      return false;
    });

    const urgency = classifyUpgradeUrgency(weibullThreshold * 100, hasGotcha, false);
    const baselineTier = upgradePath.tiers[0];

    // Build comparison options
    const options = upgradePath.tiers
      .filter((t) => t.installedCostLow > 0) // Skip "not applicable" tiers
      .map((tier) => {
        const payback = tier.tier !== "same_for_same" && baselineTier
          ? calculatePaybackMonths(baselineTier, tier)
          : null;

        // Determine recommendation tag
        let keptRecommendation: "best_value" | "budget_pick" | "premium_choice" | null = null;
        if (tier.tier === "same_for_same") keptRecommendation = "budget_pick";
        else if (tier.tier === "moderate_upgrade") keptRecommendation = "best_value";
        else if (tier.tier === "technology_change") keptRecommendation = "premium_choice";

        return {
          tier: tier.tier,
          label: tier.label,
          description: tier.description,
          installedCostLow: tier.installedCostLow,
          installedCostHigh: tier.installedCostHigh,
          monthlyOperatingCost: tier.monthlyOperatingCost,
          monthlySavingsVsCurrent:
            upgradePath.currentMonthlyOperatingCost - tier.monthlyOperatingCost,
          estimatedLifespanLow: tier.estimatedLifespanLow,
          estimatedLifespanHigh: tier.estimatedLifespanHigh,
          paybackPeriodMonths: payback,
          totalCostOfOwnership10yr: calculateTCO(tier, 10),
          totalCostOfOwnership15yr: calculateTCO(tier, 15),
          totalCostOfOwnership20yr: calculateTCO(tier, 20),
          rebatesAvailable: tier.rebates.map((r) => ({
            source: r.source,
            amount: r.amount,
            requirements: r.requirements,
          })),
          compatibilityNotes: tier.compatibilityNotes,
          whileYoureAtIt: tier.whileYoureAtIt,
          homeValueImpact: tier.homeValueImpact,
          keptRecommendation,
          reasoning: tier.description,
          newWeibullShape: tier.weibullShape,
          newWeibullScale: tier.weibullScale,
        };
      });

    // Generate recommendation
    const bestValue = options.find((o) => o.keptRecommendation === "best_value") ?? options[0];
    const budgetPick = options.find((o) => o.keptRecommendation === "budget_pick") ?? options[0];

    const recommendation = {
      selectedTier: bestValue.tier,
      reasoning:
        `For your situation, ${bestValue.label} offers the best balance of cost and value. ` +
        (bestValue.paybackPeriodMonths
          ? `The efficiency savings pay back the extra cost in ${Math.round(bestValue.paybackPeriodMonths / 12)} years. `
          : "") +
        `Over 15 years, you'd save $${Math.round(budgetPick.totalCostOfOwnership15yr - bestValue.totalCostOfOwnership15yr).toLocaleString()} ` +
        `compared to the basic replacement.`,
      financialSummary:
        `Total 15-year cost: $${bestValue.totalCostOfOwnership15yr.toLocaleString()} ` +
        `(vs. $${budgetPick.totalCostOfOwnership15yr.toLocaleString()} for basic replacement). ` +
        (bestValue.rebatesAvailable.length > 0
          ? `Available rebates: $${bestValue.rebatesAvailable.reduce((s, r) => s + r.amount, 0).toLocaleString()}.`
          : ""),
    };

    // Generate conversation starter
    const avgLifespan = (baselineTier.estimatedLifespanLow + baselineTier.estimatedLifespanHigh) / 2;
    const conversationStarter = generateConversationStarter(
      system.name,
      Math.round(ageYears),
      baselineTier.estimatedLifespanLow,
      baselineTier.estimatedLifespanHigh,
      urgency
    );

    // Store the comparison
    const comparisonId = await ctx.db.insert("upgradeComparisons", {
      userId: args.userId,
      homeId: args.homeId,
      systemId: sysId,
      workflowId: args.workflowId,
      currentSystem: {
        name: system.name,
        category: systemType.category,
        ageYears: Math.round(ageYears * 10) / 10,
        condition: system.condition,
        monthlyOperatingCost: upgradePath.currentMonthlyOperatingCost,
        weibullThreshold: weibullThreshold * 100,
      },
      options,
      recommendation,
      triggerReason: args.triggerReason,
      urgency,
      conversationStarter,
      status: "generated",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Store insight for activity feed
    await ctx.db.insert("agentInsights", {
      workflowId: args.workflowId ?? ("" as Id<"agentWorkflows">),
      userId: args.userId,
      systemId: sysId,
      insightType: "costAnalysis",
      title: `Upgrade Options for ${system.name}`,
      body: conversationStarter,
      dataPoints: [
        { label: "System Age", value: Math.round(ageYears), unit: "years" },
        { label: "Options Generated", value: options.length },
        { label: "Best Value", value: bestValue.label },
        {
          label: "Potential 15yr Savings",
          value: Math.round(budgetPick.totalCostOfOwnership15yr - bestValue.totalCostOfOwnership15yr),
          unit: "USD",
        },
      ],
      confidence: 0.85,
      createdAt: Date.now(),
    });

    return {
      success: true,
      comparisonId,
      optionCount: options.length,
      recommendedTier: recommendation.selectedTier,
      urgency,
    };
  },
});

/**
 * Create or update a savings plan after user selects an upgrade option.
 */
export const createUpgradeSavingsPlan = internalMutation({
  args: {
    userId: v.id("users"),
    homeId: v.id("homes"),
    systemId: v.string(),
    comparisonId: v.string(),
    selectedTier: v.string(),
    estimatedCost: v.number(),
    targetDate: v.string(),
    applyRebates: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const sysId = args.systemId as Id<"systems">;
    const compId = args.comparisonId as Id<"upgradeComparisons">;

    // Get the comparison to find rebate amounts
    const comparison = await ctx.db.get(compId);
    if (!comparison || comparison.userId !== args.userId) {
      return { success: false, error: "Comparison not found or access denied" };
    }

    const selectedOption = comparison.options.find((o) => o.tier === args.selectedTier);
    if (!selectedOption) {
      return { success: false, error: `Tier ${args.selectedTier} not found in comparison` };
    }

    const rebateOffset = args.applyRebates !== false
      ? selectedOption.rebatesAvailable.reduce((sum, r) => sum + r.amount, 0)
      : 0;

    const netSavingsNeeded = Math.max(0, args.estimatedCost - rebateOffset);

    // Calculate monthly amount based on target date
    const targetDateMs = new Date(args.targetDate).getTime();
    const monthsUntilTarget = Math.max(
      1,
      Math.round((targetDateMs - Date.now()) / (30.44 * 24 * 60 * 60 * 1000))
    );
    const monthlyAmount = Math.ceil(netSavingsNeeded / monthsUntilTarget / 25) * 25; // Round to nearest $25

    // Generate milestones (every 3 months or at key percentages)
    const milestones: Array<{ month: number; amount: number; label: string; reached?: boolean }> = [];
    const quarterlyMonths = Math.ceil(monthsUntilTarget / 4);

    milestones.push({
      month: Math.min(quarterlyMonths, monthsUntilTarget),
      amount: Math.round(netSavingsNeeded * 0.25),
      label: "25% saved — great start!",
    });
    milestones.push({
      month: Math.min(quarterlyMonths * 2, monthsUntilTarget),
      amount: Math.round(netSavingsNeeded * 0.5),
      label: "Halfway there!",
    });
    milestones.push({
      month: Math.min(quarterlyMonths * 3, monthsUntilTarget),
      amount: Math.round(netSavingsNeeded * 0.75),
      label: "Almost ready — time to start getting quotes",
    });
    milestones.push({
      month: monthsUntilTarget,
      amount: netSavingsNeeded,
      label: "Goal reached! Ready to replace.",
    });

    // Check for existing savings plan
    const existing = await ctx.db
      .query("savingsPlans")
      .withIndex("by_systemId", (q) => q.eq("systemId", sysId))
      .first();

    const now = Date.now();

    if (existing && existing.status === "active") {
      // Update existing plan
      await ctx.db.patch(existing._id, {
        targetAmount: args.estimatedCost,
        monthlyAmount,
        comparisonId: compId,
        selectedTier: args.selectedTier,
        rebateOffset,
        netSavingsNeeded,
        targetDate: args.targetDate,
        milestones,
        updatedAt: now,
      });

      // Update comparison status
      await ctx.db.patch(compId, {
        userSelectedTier: args.selectedTier,
        userResponse: "selected_option",
        status: "savings_plan_active",
        updatedAt: now,
      });

      return {
        success: true,
        action: "updated",
        planId: existing._id,
        monthlyAmount,
        netSavingsNeeded,
        rebateOffset,
        monthsUntilTarget,
      };
    }

    // Create new plan
    const planId = await ctx.db.insert("savingsPlans", {
      userId: args.userId,
      homeId: args.homeId,
      systemId: sysId,
      targetAmount: args.estimatedCost,
      currentBalance: 0,
      monthlyAmount,
      status: "active",
      comparisonId: compId,
      selectedTier: args.selectedTier,
      rebateOffset,
      netSavingsNeeded,
      targetDate: args.targetDate,
      milestones,
      createdAt: now,
      updatedAt: now,
    });

    // Update comparison status
    await ctx.db.patch(compId, {
      userSelectedTier: args.selectedTier,
      userResponse: "selected_option",
      status: "savings_plan_active",
      updatedAt: now,
    });

    return {
      success: true,
      action: "created",
      planId,
      monthlyAmount,
      netSavingsNeeded,
      rebateOffset,
      monthsUntilTarget,
    };
  },
});

/**
 * Initiate the upgrade planning journey — the proactive trigger.
 * Generates the comparison if one doesn't exist, then queues the
 * personalized notification.
 */
export const initiateUpgradePlanning = internalMutation({
  args: {
    userId: v.id("users"),
    homeId: v.id("homes"),
    systemId: v.string(),
    workflowId: v.optional(v.id("agentWorkflows")),
    triggerReason: v.string(),
    urgency: v.string(),
  },
  handler: async (ctx, args) => {
    const sysId = args.systemId as Id<"systems">;

    // Check if we already have an active comparison for this system
    const existingComparison = await ctx.db
      .query("upgradeComparisons")
      .withIndex("by_systemId", (q) => q.eq("systemId", sysId))
      .order("desc")
      .first();

    if (
      existingComparison &&
      existingComparison.status !== "dismissed" &&
      existingComparison.status !== "completed" &&
      existingComparison.status !== "remind_later"
    ) {
      return {
        success: true,
        action: "existing_comparison",
        comparisonId: existingComparison._id,
        status: existingComparison.status,
      };
    }

    // Check if dismissed and we should respect that
    if (
      existingComparison?.status === "remind_later" &&
      existingComparison.remindAt &&
      existingComparison.remindAt > Date.now()
    ) {
      return {
        success: true,
        action: "remind_later_active",
        comparisonId: existingComparison._id,
        remindAt: existingComparison.remindAt,
      };
    }

    // No active comparison — this is handled by the engine calling
    // generate_upgrade_comparison after this tool returns.
    // Just create the workflow tracking record.
    const sessionId = args.workflowId ?? await ctx.db.insert("agentWorkflows", {
      userId: args.userId,
      homeId: args.homeId,
      triggerType: "forecastThresholdCrossed",
      triggerDetails: {
        systemId: sysId,
        reason: args.triggerReason,
        urgency: args.urgency,
      },
      triggerSourceId: args.systemId,
      status: "running",
      createdAt: Date.now(),
    });

    // Send notification to draw user into the planning journey
    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "action_required",
      title: "Upgrade Planning Available",
      body: args.triggerReason,
      priority: args.urgency === "critical" ? "critical" : args.urgency === "high" ? "high" : "medium",
      read: false,
      relatedSystemId: sysId,
      createdAt: Date.now(),
    });

    return {
      success: true,
      action: "initiated",
      sessionId,
    };
  },
});

/**
 * Model financing scenarios — pure calculation, no side effects.
 */
export const modelFinancing = internalMutation({
  args: {
    userId: v.id("users"),
    estimatedCost: v.number(),
    scenarios: v.array(v.object({
      type: v.string(),
      apr: v.number(),
      termMonths: v.number(),
    })),
  },
  handler: async (_ctx, args) => {
    const results = args.scenarios.map((scenario) => {
      const monthlyRate = scenario.apr / 12 / 100;
      let monthlyPayment: number;
      let totalInterest: number;

      if (monthlyRate === 0) {
        monthlyPayment = args.estimatedCost / scenario.termMonths;
        totalInterest = 0;
      } else {
        // Standard amortization formula
        monthlyPayment =
          (args.estimatedCost * monthlyRate * Math.pow(1 + monthlyRate, scenario.termMonths)) /
          (Math.pow(1 + monthlyRate, scenario.termMonths) - 1);
        totalInterest = monthlyPayment * scenario.termMonths - args.estimatedCost;
      }

      const totalCost = args.estimatedCost + totalInterest;

      return {
        type: scenario.type,
        apr: scenario.apr,
        termMonths: scenario.termMonths,
        monthlyPayment: Math.round(monthlyPayment * 100) / 100,
        totalInterestPaid: Math.round(totalInterest * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100,
        comparedToSaving:
          totalInterest > 0
            ? `Financing costs $${Math.round(totalInterest).toLocaleString()} more than saving and paying cash`
            : "0% financing — same total cost as cash",
      };
    });

    // Always recommend cash if timeline allows
    const lowestInterest = Math.min(...results.map((r) => r.totalInterestPaid));
    const recommendation =
      lowestInterest > 500
        ? "If your timeline allows, saving and paying cash avoids " +
          `$${Math.round(lowestInterest).toLocaleString()} or more in interest. ` +
          "Consider financing only if the system fails before you reach your savings target."
        : lowestInterest > 0
          ? "The interest cost is modest. If you need the replacement now, " +
            "financing is reasonable — just pay it off as quickly as possible."
          : "0% financing is available — take advantage of it if offered, " +
            "but keep your savings growing in case the promotional rate ends.";

    return {
      success: true,
      scenarios: results,
      recommendation,
    };
  },
});

// ════════════════════════════════════════════════════════════════════
// QUERY HELPERS
// ════════════════════════════════════════════════════════════════════

/** Get the latest active upgrade comparison for a system. */
export const getActiveComparison = internalQuery({
  args: { systemId: v.id("systems") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("upgradeComparisons")
      .withIndex("by_systemId", (q) => q.eq("systemId", args.systemId))
      .order("desc")
      .first();
  },
});

/** Get all active upgrade comparisons for a user. */
export const getUserComparisons = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("upgradeComparisons")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});
