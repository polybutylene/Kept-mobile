/**
 * Recall Queries
 *
 * Both internal queries (for actions) and client-facing queries.
 */

import { query, internalQuery } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// ============================================================
// Internal Queries (used by actions)
// ============================================================

/**
 * Get system details needed for recall checking.
 */
export const getSystemForRecallCheck = internalQuery({
  args: { systemId: v.id("systems") },
  handler: async (ctx, args) => {
    const system = await ctx.db.get(args.systemId);
    if (!system || system.isArchived) return null;

    const systemType = await ctx.db.get(system.systemTypeId);

    return {
      _id: system._id,
      homeId: system.homeId,
      manufacturer: system.manufacturer || null,
      modelNumber: system.modelNumber || null,
      systemTypeName: systemType?.name || null,
    };
  },
});

/**
 * Check if a recall alert already exists for a system + recall number.
 */
export const getExistingAlert = internalQuery({
  args: {
    systemId: v.id("systems"),
    recallNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("recallAlerts")
      .withIndex("by_system", (q) => q.eq("systemId", args.systemId))
      .filter((q) => q.eq(q.field("recallNumber"), args.recallNumber))
      .first();
    return existing;
  },
});

/**
 * Get all active systems that have a manufacturer set,
 * for the weekly cross-reference scan.
 */
export const getAllSystemsWithManufacturer = internalQuery({
  args: {},
  handler: async (ctx) => {
    const allSystems = await ctx.db.query("systems").collect();

    const activeSystems = allSystems.filter(s => !s.isArchived && s.manufacturer);
    const systemTypes = await Promise.all(
      activeSystems.map(system => ctx.db.get(system.systemTypeId))
    );
    const results = activeSystems.map((system, i) => ({
      _id: system._id,
      homeId: system.homeId,
      manufacturer: system.manufacturer,
      modelNumber: system.modelNumber || null,
      systemTypeName: systemTypes[i]?.name || null,
    }));
    return results;
  },
});

// ============================================================
// Client-facing Queries
// ============================================================

/**
 * Get all active (non-dismissed) recall alerts for a home.
 */
export const getRecallAlerts = query({
  args: { homeId: v.id("homes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const alerts = await ctx.db
      .query("recallAlerts")
      .withIndex("by_home", (q) =>
        q.eq("homeId", args.homeId).eq("isDismissed", false)
      )
      .collect();

    return alerts;
  },
});

/**
 * Get recall alerts for a specific system.
 */
export const getSystemRecallAlerts = query({
  args: { systemId: v.id("systems") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const alerts = await ctx.db
      .query("recallAlerts")
      .withIndex("by_system", (q) => q.eq("systemId", args.systemId))
      .filter((q) => q.eq(q.field("isDismissed"), false))
      .collect();

    return alerts;
  },
});

/**
 * Get unread recall alert count for a home.
 */
export const getUnreadRecallCount = query({
  args: { homeId: v.id("homes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const alerts = await ctx.db
      .query("recallAlerts")
      .withIndex("by_home", (q) =>
        q.eq("homeId", args.homeId).eq("isDismissed", false)
      )
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    return alerts.length;
  },
});
