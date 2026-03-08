/**
 * Shared constants for the Kept forecasting and cost engine.
 */

/**
 * Base cost multiplier applied when no regional data exists.
 * Now set to 1.0 because seed prices reflect accurate national averages
 * from the Kept Price Index (Feb 2026). Per-state multipliers in the
 * regionalCostMultipliers table handle geographic adjustments.
 */
export const BASE_COST_MULTIPLIER = 1.0;
