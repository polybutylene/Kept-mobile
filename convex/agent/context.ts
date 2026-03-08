import { v } from "convex/values";
import { internalQuery } from "../_generated/server";
import type { Id, Doc } from "../_generated/dataModel";

/**
 * Single comprehensive query that gathers all context the agent needs.
 * One round-trip from the action to minimize latency.
 *
 * Adapted to the actual Kept schema: systems join through systemTypes
 * for category/name, homes use addressLine1/city/state, etc.
 */
export const gatherAgentContext = internalQuery({
  args: {
    userId: v.id("users"),
    homeId: v.optional(v.id("homes")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error(`User ${args.userId} not found`);

    // Use provided homeId or find the user's first active home
    let home: Doc<"homes"> | null = null;
    if (args.homeId) {
      home = await ctx.db.get(args.homeId);
    } else {
      home = await ctx.db
        .query("homes")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .first();
    }

    if (!home) {
      return {
        user: {
          _id: user._id,
          name: user.fullName ?? user.email,
          preferences: {},
        },
        home: null,
        systems: [],
        forecasts: [],
        maintenanceHistory: [],
        recentAgentActions: [],
        pendingActions: [],
      };
    }

    // Load systems for this home
    const systemsList = await ctx.db
      .query("systems")
      .withIndex("by_home", (q) => q.eq("homeId", home!._id))
      .collect();

    // Batch-load system types for category/name resolution
    const systemTypeIds = [...new Set(systemsList.map((s) => s.systemTypeId))];
    const systemTypes = await Promise.all(
      systemTypeIds.map((id) => ctx.db.get(id))
    );
    const typeMap: Record<string, Doc<"systemTypes">> = {};
    for (const st of systemTypes) {
      if (st) typeMap[st._id] = st;
    }

    // Calculate age from install date
    const calcAge = (installDate?: string): number | undefined => {
      if (!installDate) return undefined;
      const installed = new Date(installDate);
      if (isNaN(installed.getTime())) return undefined;
      const now = new Date();
      return Math.round(
        ((now.getTime() - installed.getTime()) / (365.25 * 24 * 60 * 60 * 1000)) * 10
      ) / 10;
    };

    // Parallel queries for agent context data
    const [forecasts, maintenanceHistory, recentAgentActions, pendingActions] =
      await Promise.all([
        ctx.db
          .query("agentForecasts")
          .withIndex("by_home", (q) => q.eq("homeId", home!._id))
          .collect(),
        ctx.db
          .query("maintenanceHistory")
          .withIndex("by_home", (q) => q.eq("homeId", home!._id))
          .order("desc")
          .take(100),
        ctx.db
          .query("agentActions")
          .withIndex("by_userId_createdAt", (q) => q.eq("userId", args.userId))
          .order("desc")
          .take(30),
        ctx.db
          .query("pendingActions")
          .withIndex("by_userId_status", (q) =>
            q.eq("userId", args.userId).eq("status", "pending")
          )
          .collect(),
      ]);

    return {
      user: {
        _id: user._id,
        name: user.fullName ?? user.email,
        preferences: {},
      },
      home: {
        _id: home._id,
        address: [home.addressLine1, home.city, home.state, home.zipCode]
          .filter(Boolean)
          .join(", "),
        yearBuilt: home.yearBuilt,
        squareFootage: home.squareFootage,
        climateZone: home.climateZone,
        region: home.state,
      },
      systems: systemsList.map((s) => {
        const sType = typeMap[s.systemTypeId];
        return {
          _id: s._id,
          category: sType?.category ?? "unknown",
          type: sType?.name ?? s.name,
          brand: s.manufacturer,
          model: s.modelNumber,
          installDate: s.installDate,
          age: calcAge(s.installDate),
          condition: s.condition,
          lastServiceDate: s.lastServiceDate,
          notes: s.conditionNotes,
        };
      }),
      forecasts: forecasts
        .filter((f) => f.status !== "dismissed")
        .map((f) => ({
          _id: f._id,
          systemId: f.systemId,
          type: f.type,
          title: f.title,
          description: f.description,
          urgency: f.urgency,
          estimatedDate: f.estimatedDate,
          costRangeLow: f.costRangeLow,
          costRangeHigh: f.costRangeHigh,
          status: f.status,
          reasoning: f.reasoning,
          createdBy: f.createdBy,
        })),
      maintenanceHistory: maintenanceHistory.map((h) => ({
        _id: h._id,
        systemId: h.systemId,
        date: h.date,
        description: h.description,
        type: h.type,
        cost: h.cost,
        provider: h.provider,
      })),
      recentAgentActions: recentAgentActions.map((a) => ({
        toolName: a.toolName,
        toolInput: a.toolInput,
        status: a.status,
        executedAt: a.executedAt,
      })),
      pendingActions: pendingActions.map((p) => ({
        _id: p._id,
        toolName: p.toolName,
        reason: p.reason,
        createdAt: p.createdAt,
      })),
    };
  },
});

/**
 * Type for the full agent context returned by gatherAgentContext.
 * Defined explicitly since Convex query return types aren't directly extractable.
 */
export interface AgentContext {
  user: {
    _id: Id<"users">;
    name: string;
    preferences: Record<string, unknown>;
  };
  home: {
    _id: Id<"homes">;
    address: string;
    yearBuilt?: number;
    squareFootage?: number;
    climateZone?: number;
    region?: string;
  } | null;
  systems: Array<{
    _id: Id<"systems">;
    category: string;
    type: string;
    brand?: string;
    model?: string;
    installDate?: string;
    age?: number;
    condition?: string;
    lastServiceDate?: string;
    notes?: string;
  }>;
  forecasts: Array<{
    _id: Id<"agentForecasts">;
    systemId: Id<"systems">;
    type: string;
    title: string;
    description: string;
    urgency: string;
    estimatedDate?: string;
    costRangeLow?: number;
    costRangeHigh?: number;
    status: string;
    reasoning: string;
    createdBy: string;
  }>;
  maintenanceHistory: Array<{
    _id: Id<"maintenanceHistory">;
    systemId: Id<"systems">;
    date: string;
    description: string;
    type: string;
    cost?: number;
    provider?: string;
  }>;
  recentAgentActions: Array<{
    toolName: string;
    toolInput: unknown;
    status: string;
    executedAt: number;
  }>;
  pendingActions: Array<{
    _id: Id<"pendingActions">;
    toolName: string;
    reason: string;
    createdAt: number;
  }>;
}
