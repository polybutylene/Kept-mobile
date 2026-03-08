import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Calculate issue probability based on system age using Weibull distribution
 * P(failure at age t) = 1 - exp(-(t/scale)^shape)
 */
function calculateIssueProbability(
  age: number,
  baseRate: number,
  weibullShape: number,
  weibullScale: number
): number {
  if (age <= 0) return baseRate;
  
  // Weibull cumulative distribution function
  const weibullProb = 1 - Math.exp(-Math.pow(age / weibullScale, weibullShape));
  
  // Combine base rate with age-adjusted probability
  // As system ages, probability approaches Weibull prediction
  const combinedProb = baseRate + (1 - baseRate) * weibullProb;
  
  return Math.min(combinedProb, 0.99); // Cap at 99%
}

/**
 * Get issues for a specific system type with probability calculations
 */
export const getIssuesForSystemType = query({
  args: {
    systemTypeId: v.id("systemTypes"),
    systemAge: v.optional(v.number()), // Age in years for probability calculation
  },
  handler: async (ctx, args) => {
    const issues = await ctx.db
      .query("issuesBySystemType")
      .withIndex("by_systemType", (q) => q.eq("systemTypeId", args.systemTypeId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Calculate probabilities if age is provided
    const issuesWithProbability = issues.map((issue) => {
      let probability3yr = 0;
      let probability5yr = 0;
      let currentProbability = 0;
      
      if (args.systemAge !== undefined) {
        currentProbability = calculateIssueProbability(
          args.systemAge,
          issue.baseOccurrenceRate,
          issue.weibullShape,
          issue.weibullScale
        );
        probability3yr = calculateIssueProbability(
          args.systemAge + 3,
          issue.baseOccurrenceRate,
          issue.weibullShape,
          issue.weibullScale
        );
        probability5yr = calculateIssueProbability(
          args.systemAge + 5,
          issue.baseOccurrenceRate,
          issue.weibullShape,
          issue.weibullScale
        );
      }
      
      return {
        ...issue,
        currentProbability: Math.round(currentProbability * 100),
        probability3yr: Math.round(probability3yr * 100),
        probability5yr: Math.round(probability5yr * 100),
      };
    });

    // Sort by current probability (highest first)
    return issuesWithProbability.sort((a, b) => b.currentProbability - a.currentProbability);
  },
});

/**
 * Get issues for a specific installed system (uses system's actual age)
 */
export const getIssuesForSystem = query({
  args: {
    systemId: v.id("systems"),
  },
  handler: async (ctx, args) => {
    const system = await ctx.db.get(args.systemId);
    if (!system) return [];

    // Calculate system age
    let systemAge = 0;
    if (system.installDate) {
      const installDate = new Date(system.installDate);
      const now = new Date();
      systemAge = (now.getTime() - installDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    }

    const issues = await ctx.db
      .query("issuesBySystemType")
      .withIndex("by_systemType", (q) => q.eq("systemTypeId", system.systemTypeId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const issuesWithProbability = issues.map((issue) => {
      const currentProbability = calculateIssueProbability(
        systemAge,
        issue.baseOccurrenceRate,
        issue.weibullShape,
        issue.weibullScale
      );
      const probability3yr = calculateIssueProbability(
        systemAge + 3,
        issue.baseOccurrenceRate,
        issue.weibullShape,
        issue.weibullScale
      );
      const probability5yr = calculateIssueProbability(
        systemAge + 5,
        issue.baseOccurrenceRate,
        issue.weibullShape,
        issue.weibullScale
      );
      
      return {
        ...issue,
        systemAge: Math.round(systemAge * 10) / 10,
        currentProbability: Math.round(currentProbability * 100),
        probability3yr: Math.round(probability3yr * 100),
        probability5yr: Math.round(probability5yr * 100),
      };
    });

    return issuesWithProbability.sort((a, b) => b.currentProbability - a.currentProbability);
  },
});

/**
 * Get all issues for a home across all systems
 */
export const getIssuesForHome = query({
  args: {
    homeId: v.id("homes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const systems = await ctx.db
      .query("systems")
      .withIndex("by_home_active", (q) =>
        q.eq("homeId", args.homeId).eq("isArchived", false)
      )
      .collect();

    const allIssues = [];
    const now = new Date();

    for (const system of systems) {
      const systemType = await ctx.db.get(system.systemTypeId);
      
      let systemAge = 0;
      if (system.installDate) {
        const installDate = new Date(system.installDate);
        systemAge = (now.getTime() - installDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      }

      const issues = await ctx.db
        .query("issuesBySystemType")
        .withIndex("by_systemType", (q) => q.eq("systemTypeId", system.systemTypeId))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();

      for (const issue of issues) {
        const currentProbability = calculateIssueProbability(
          systemAge,
          issue.baseOccurrenceRate,
          issue.weibullShape,
          issue.weibullScale
        );
        
        // Only include issues with >10% probability
        if (currentProbability > 0.1) {
          allIssues.push({
            ...issue,
            systemId: system._id,
            systemName: system.name || systemType?.name || "Unknown System",
            systemAge: Math.round(systemAge * 10) / 10,
            currentProbability: Math.round(currentProbability * 100),
          });
        }
      }
    }

    return allIssues.sort((a, b) => b.currentProbability - a.currentProbability);
  },
});

/**
 * Get high-priority issues for dashboard alert
 */
export const getHighPriorityIssues = query({
  args: {
    homeId: v.id("homes"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const systems = await ctx.db
      .query("systems")
      .withIndex("by_home_active", (q) =>
        q.eq("homeId", args.homeId).eq("isArchived", false)
      )
      .collect();

    const highPriorityIssues = [];
    const now = new Date();

    for (const system of systems) {
      const systemType = await ctx.db.get(system.systemTypeId);
      
      let systemAge = 0;
      if (system.installDate) {
        const installDate = new Date(system.installDate);
        systemAge = (now.getTime() - installDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      }

      const issues = await ctx.db
        .query("issuesBySystemType")
        .withIndex("by_systemType", (q) => q.eq("systemTypeId", system.systemTypeId))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();

      for (const issue of issues) {
        const currentProbability = calculateIssueProbability(
          systemAge,
          issue.baseOccurrenceRate,
          issue.weibullShape,
          issue.weibullScale
        );
        
        // Include critical/major issues with >25% probability
        if (currentProbability > 0.25 && (issue.severity === "critical" || issue.severity === "major")) {
          highPriorityIssues.push({
            issueId: issue._id,
            issueName: issue.issueName,
            severity: issue.severity,
            systemId: system._id,
            systemName: system.name || systemType?.name || "Unknown System",
            probability: Math.round(currentProbability * 100),
            repairCostLow: issue.repairCostLow,
            repairCostHigh: issue.repairCostHigh,
          });
        }
      }
    }

    const sorted = highPriorityIssues.sort((a, b) => b.probability - a.probability);
    return args.limit ? sorted.slice(0, args.limit) : sorted;
  },
});
