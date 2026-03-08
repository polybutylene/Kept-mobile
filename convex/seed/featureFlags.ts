import { internalMutation } from "../_generated/server";

/**
 * Seed or update feature flags for current tier model.
 *
 * Two tiers:
 * - "free" (Free Trial) — full access for 7 days
 * - "homeowner" ($10.99/mo or $99/yr) — full access ongoing
 *
 * This mutation is idempotent: it deletes any existing flags and re-inserts.
 * Run: npx convex run seed/featureFlags:seed
 */

const FEATURE_FLAGS = [
  {
    tier: "free" as const,
    maxHomes: 2,
    maxSystemsPerHome: 999,
    canViewDiyInstructions: true,
    canViewCostBreakdown: true,
    canViewForecast: true,
    canViewHealthDrivers: true,
    canScanModelPlates: true,
    monthlyScanLimit: 999,
    canSharePackets: true,
    monthlyPacketLimit: 999,
    canViewQuickSkim: true,
    canExportReports: true,
    hasPriorityNotifications: true,
    hasWebDashboard: true,
  },
  {
    tier: "homeowner" as const,
    maxHomes: 2,
    maxSystemsPerHome: 999,
    canViewDiyInstructions: true,
    canViewCostBreakdown: true,
    canViewForecast: true,
    canViewHealthDrivers: true,
    canScanModelPlates: true,
    monthlyScanLimit: 999,
    canSharePackets: true,
    monthlyPacketLimit: 999,
    canViewQuickSkim: true,
    canExportReports: true,
    hasPriorityNotifications: true,
    hasWebDashboard: true,
  },
];

export const seed = internalMutation({
  handler: async (ctx) => {
    // Delete any existing feature flags
    const existing = await ctx.db.query("featureFlags").collect();
    for (const flag of existing) {
      await ctx.db.delete(flag._id);
    }

    // Insert the current flags
    for (const flag of FEATURE_FLAGS) {
      await ctx.db.insert("featureFlags", flag);
    }

    console.log(`Seeded ${FEATURE_FLAGS.length} feature flag tiers (replaced ${existing.length} existing)`);
  },
});
