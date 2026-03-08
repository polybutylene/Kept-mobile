/**
 * Insight Internal Mutations
 *
 * Internal mutations for creating and managing AI insights.
 */

import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Create a new AI insight
 */
export const createInsight = internalMutation({
  args: {
    homeId: v.id("homes"),
    userId: v.id("userProfiles"),
    type: v.union(
      v.literal("maintenance_reminder"),
      v.literal("condition_alert"),
      v.literal("cost_forecast"),
      v.literal("seasonal_tip"),
      v.literal("warranty_expiring"),
      v.literal("upload_suggestion"),
      v.literal("efficiency_tip")
    ),
    title: v.string(),
    body: v.string(),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    relatedSystemId: v.optional(v.id("systems")),
    suggestedAction: v.optional(
      v.object({
        type: v.string(),
        label: v.string(),
        metadata: v.optional(v.any()),
      })
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("aiInsights", {
      homeId: args.homeId,
      userId: args.userId,
      type: args.type,
      title: args.title,
      body: args.body,
      priority: args.priority,
      relatedSystemId: args.relatedSystemId,
      suggestedAction: args.suggestedAction,
      isRead: false,
      isDismissed: false,
      generatedAt: Date.now(),
    });
  },
});

/**
 * Clean up expired insights
 */
export const cleanupExpired = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Get all insights with expiration
    const allInsights = await ctx.db.query("aiInsights").collect();

    for (const insight of allInsights) {
      if (insight.expiresAt && insight.expiresAt < now) {
        await ctx.db.patch(insight._id, { isDismissed: true });
      }
    }
  },
});
