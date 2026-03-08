/**
 * Insight Internal Queries
 *
 * Internal queries used by the insight generation system.
 */

import { internalQuery } from "../_generated/server";

/**
 * Get all active homes with their owner profiles
 * Used by the cron job to fan out insight generation
 */
export const getAllActiveHomes = internalQuery({
  args: {},
  handler: async (ctx) => {
    const homes = await ctx.db
      .query("homes")
      .filter((q) => q.eq(q.field("isArchived"), false))
      .collect();

    const results: { homeId: typeof homes[0]["_id"]; userId: typeof homes[0]["ownerId"] }[] = [];

    for (const home of homes) {
      results.push({
        homeId: home._id,
        userId: home.ownerId,
      });
    }

    return results;
  },
});
