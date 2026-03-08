/**
 * Recall Mutations
 *
 * Internal mutations for creating recall alerts,
 * and client-facing mutations for marking read/dismissed.
 */

import { mutation, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// ============================================================
// Internal Mutations (used by actions)
// ============================================================

/**
 * Create recall alert records from CPSC matches.
 */
export const createAlerts = internalMutation({
  args: {
    systemId: v.id("systems"),
    homeId: v.id("homes"),
    matches: v.array(
      v.object({
        recallNumber: v.string(),
        recallDate: v.string(),
        productName: v.string(),
        description: v.string(),
        hazardDescription: v.string(),
        remedyDescription: v.string(),
        recallUrl: v.string(),
        matchScore: v.number(),
        matchedOn: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const match of args.matches) {
      await ctx.db.insert("recallAlerts", {
        systemId: args.systemId,
        homeId: args.homeId,
        recallNumber: match.recallNumber,
        recallDate: match.recallDate,
        productName: match.productName,
        description: match.description,
        hazardDescription: match.hazardDescription,
        remedyDescription: match.remedyDescription,
        recallUrl: match.recallUrl || undefined,
        matchScore: match.matchScore,
        matchedOn: match.matchedOn,
        isRead: false,
        isDismissed: false,
        checkedAt: Date.now(),
      });
    }
  },
});

// ============================================================
// Client-facing Mutations
// ============================================================

/**
 * Mark a recall alert as read.
 */
export const markRead = mutation({
  args: { alertId: v.id("recallAlerts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(args.alertId, { isRead: true });
  },
});

/**
 * Dismiss a recall alert (user has reviewed and acknowledged it).
 */
export const dismiss = mutation({
  args: { alertId: v.id("recallAlerts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(args.alertId, { isDismissed: true });
  },
});
