/**
 * Rate Limiting for AI Features
 *
 * Per-user daily limits based on subscription tier.
 * Prevents runaway API costs while keeping the experience smooth.
 */

import { QueryCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

// Daily message limits per tier
const DAILY_LIMITS: Record<string, { chatMessages: number; vaultAnalyses: number; walkthroughPhotos: number }> = {
  free: { chatMessages: 50, vaultAnalyses: 5, walkthroughPhotos: 10 },
  homeowner: { chatMessages: 200, vaultAnalyses: 50, walkthroughPhotos: 100 },
  // Legacy tiers — map to homeowner limits
  homeowner_pro: { chatMessages: 200, vaultAnalyses: 50, walkthroughPhotos: 100 },
  pro_plus: { chatMessages: 200, vaultAnalyses: 50, walkthroughPhotos: 100 },
  property_manager: { chatMessages: 200, vaultAnalyses: 50, walkthroughPhotos: 100 },
};

/**
 * Check if a user is within their daily rate limit for a feature.
 * Returns whether the request is allowed and how many remain.
 */
export async function checkRateLimit(
  ctx: QueryCtx,
  userId: Id<"userProfiles">,
  feature: "chat" | "vault_analysis" | "walkthrough"
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  // Get user's tier
  const profile = await ctx.db.get(userId);
  if (!profile) return { allowed: false, remaining: 0, limit: 0 };

  const tier = profile.tier || "free";
  const limits = DAILY_LIMITS[tier] ?? DAILY_LIMITS.free;

  // Calculate start of today (UTC)
  const now = Date.now();
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const startOfDay = todayStart.getTime();

  let usage = 0;
  let limit = 0;

  switch (feature) {
    case "chat": {
      limit = limits.chatMessages;
      // Count today's messages sent by this user across all conversations
      const conversations = await ctx.db
        .query("conversations")
        .withIndex("by_user", (q) => q.eq("userId", userId).eq("status", "active"))
        .collect();

      for (const conv of conversations) {
        const messages = await ctx.db
          .query("aiMessages")
          .withIndex("by_conversation", (q) => q.eq("conversationId", conv._id))
          .collect();

        usage += messages.filter(
          (m) => m.role === "user" && m.createdAt >= startOfDay
        ).length;
      }
      break;
    }
    case "vault_analysis":
      limit = limits.vaultAnalyses;
      // Would count analysis logs for today — simplified for now
      usage = 0;
      break;
    case "walkthrough":
      limit = limits.walkthroughPhotos;
      usage = 0;
      break;
  }

  const remaining = Math.max(0, limit - usage);
  return {
    allowed: usage < limit,
    remaining,
    limit,
  };
}
