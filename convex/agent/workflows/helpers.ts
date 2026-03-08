/**
 * Deterministic calculation functions shared by workflow decision trees.
 * Pure TypeScript — no Convex dependencies or database access.
 */

// ═══════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════

export type RiskTier = "RED" | "ORANGE" | "YELLOW" | "GREEN_WATCH" | "GREEN";
export type UrgencyTier = 1 | 2 | 3 | 4;

export interface GotchaFactor {
  id: string;
  description: string;
  severity: "safety_critical" | "financial" | "informational";
  recommendation: string;
}

/** Returned by each workflow's prepare() function. */
export interface WorkflowPreparation {
  /** Pre-computed data formatted as text for the system prompt. */
  additionalContext: string;
  /** Workflow-specific instructions for Claude's decision-making. */
  workflowInstructions: string;
  /** Structured data for engine post-processing. */
  preComputedData: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════════════
// WEIBULL CALCULATIONS
// ═══════════════════════════════════════════════════════════════════════

/** Weibull survival function: R(t) = exp(-(t/λ)^k) */
export function weibullSurvival(ageYears: number, shape: number, scale: number): number {
  if (ageYears <= 0 || scale <= 0 || shape <= 0) return 1;
  return Math.exp(-Math.pow(ageYears / scale, shape));
}

/** Conditional failure probability over a horizon given current age. */
export function weibullFailureProbability(
  ageYears: number,
  horizonYears: number,
  shape: number,
  scale: number,
): number {
  const survivalNow = weibullSurvival(ageYears, shape, scale);
  if (survivalNow <= 0) return 1;
  const survivalFuture = weibullSurvival(ageYears + horizonYears, shape, scale);
  return 1 - survivalFuture / survivalNow;
}

/** Estimated median remaining life from current age. */
export function medianRemainingLife(
  ageYears: number,
  shape: number,
  scale: number,
): number {
  const survivalNow = weibullSurvival(ageYears, shape, scale);
  if (survivalNow <= 0.5) return 0;
  // R(t) = targetSurvival → t = scale * (-ln(target))^(1/shape)
  const targetSurvival = 0.5 * survivalNow;
  const medianAge = scale * Math.pow(-Math.log(targetSurvival), 1 / shape);
  return Math.max(medianAge - ageYears, 0);
}

// ═══════════════════════════════════════════════════════════════════════
// RISK TIER CLASSIFICATION (Workflow 1)
// ═══════════════════════════════════════════════════════════════════════

const TIER_RANK: Record<string, number> = {
  GREEN: 0,
  GREEN_WATCH: 1,
  YELLOW: 2,
  ORANGE: 3,
  RED: 4,
};

/**
 * Classify a system into a risk tier based on failure probabilities.
 * RED: replacement likely within 12 months
 * ORANGE: elevated near-term risk
 * YELLOW: plan-ahead window
 * GREEN_WATCH: first early signal
 * GREEN: no action needed
 */
export function classifyRiskTier(
  pFailure1yr: number,
  pFailure3yr: number,
  pFailure5yr: number,
): RiskTier {
  if (pFailure1yr >= 0.50) return "RED";
  if (pFailure1yr >= 0.25) return "ORANGE";
  if (pFailure3yr >= 0.40) return "YELLOW";
  if (pFailure5yr >= 0.30) return "GREEN_WATCH";
  return "GREEN";
}

export function tierRank(tier: string): number {
  return TIER_RANK[tier] ?? 0;
}

export function isEscalation(currentTier: string, previousTier: string): boolean {
  return tierRank(currentTier) > tierRank(previousTier);
}

// ═══════════════════════════════════════════════════════════════════════
// SAVINGS PLAN CALCULATIONS (Workflow 1, 7)
// ═══════════════════════════════════════════════════════════════════════

/**
 * Calculate monthly savings needed to cover a replacement.
 * Rounds up to nearest $25, with $25/month minimum.
 */
export function calculateMonthlySavings(
  targetCost: number,
  remainingLifeMonths: number,
  currentBalance: number = 0,
): number {
  const gap = Math.max(targetCost - currentBalance, 0);
  const months = Math.max(remainingLifeMonths, 1);
  const raw = gap / months;
  const rounded = Math.ceil(raw / 25) * 25;
  return Math.max(rounded, 25);
}

// ═══════════════════════════════════════════════════════════════════════
// URGENCY CLASSIFICATION (Workflow 2)
// ═══════════════════════════════════════════════════════════════════════

/**
 * Classify symptom urgency:
 * Tier 1 EMERGENCY: Active safety risk, total failure in extreme weather
 * Tier 2 URGENT: System non-functional, progressive leak
 * Tier 3 SOON: Intermittent failure, performance degradation
 * Tier 4 MONITOR: Cosmetic, minor anomaly
 */
export function classifyUrgencyTier(flags: {
  isSafetyCritical: boolean;
  isSystemNonFunctional: boolean;
  isProgressiveFailure: boolean;
  isIntermittent: boolean;
  isCosmetic: boolean;
}): UrgencyTier {
  if (flags.isSafetyCritical) return 1;
  if (flags.isSystemNonFunctional || flags.isProgressiveFailure) return 2;
  if (flags.isIntermittent) return 3;
  if (flags.isCosmetic) return 4;
  return 3; // Default to SOON
}

export const URGENCY_LABELS: Record<UrgencyTier, string> = {
  1: "EMERGENCY",
  2: "URGENT",
  3: "SOON",
  4: "MONITOR",
};

// ═══════════════════════════════════════════════════════════════════════
// WEATHER VULNERABILITY MAPPING (Workflow 3)
// ═══════════════════════════════════════════════════════════════════════

export const WEATHER_VULNERABILITY_MAP: Record<string, string[]> = {
  FREEZE: ["plumbing", "hvac", "exterior"],
  EXTREME_HEAT: ["hvac", "appliances", "electrical"],
  HAIL_WIND: ["structural", "exterior"],
  TORNADO: ["structural", "exterior"],
  HURRICANE: ["structural", "exterior", "electrical", "plumbing"],
  FLOODING: ["structural", "plumbing", "hvac", "electrical"],
  ICE_STORM: ["structural", "exterior", "plumbing"],
  WILDFIRE_SMOKE: ["hvac"],
  LIGHTNING: ["electrical", "hvac", "appliances"],
};

/** Classify NWS alert type into a standardized weather event category. */
export function classifyWeatherEvent(alertType: string): string {
  const n = alertType.toUpperCase().replace(/\s+/g, "_");
  if (n.includes("FREEZE") || n.includes("COLD") || n.includes("WINTER_STORM") || n.includes("FROST")) return "FREEZE";
  if (n.includes("HEAT") || n.includes("EXCESSIVE")) return "EXTREME_HEAT";
  if (n.includes("TORNADO")) return "TORNADO";
  if (n.includes("HURRICANE") || n.includes("TROPICAL")) return "HURRICANE";
  if (n.includes("FLOOD")) return "FLOODING";
  if (n.includes("ICE")) return "ICE_STORM";
  if (n.includes("FIRE") || n.includes("SMOKE")) return "WILDFIRE_SMOKE";
  if (n.includes("LIGHTNING")) return "LIGHTNING";
  if (n.includes("HAIL") || n.includes("THUNDERSTORM") || n.includes("WIND")) return "HAIL_WIND";
  return "HAIL_WIND"; // Default for unclassified severe weather
}

/**
 * Score weather vulnerability for a system (0-100, higher = more vulnerable).
 * Factors: system age, condition, event severity.
 */
export function calculateWeatherRisk(
  systemAgeYears: number,
  conditionPercentile: number, // 0-1, where 1 = excellent condition
  eventSeverity: string,
): number {
  const severityMultiplier: Record<string, number> = {
    extreme: 1.0,
    severe: 0.8,
    moderate: 0.5,
    minor: 0.3,
  };
  const mult = severityMultiplier[eventSeverity.toLowerCase()] ?? 0.5;
  const ageFactor = Math.min(systemAgeYears / 20, 1.0);
  const conditionFactor = 1 - conditionPercentile;
  return Math.round(ageFactor * 40 + conditionFactor * 40 + mult * 20);
}

// ═══════════════════════════════════════════════════════════════════════
// TASK PRIORITY SCORING (Workflow 5)
// ═══════════════════════════════════════════════════════════════════════

/**
 * Score a maintenance task's priority (0-100, higher = more urgent).
 * Used by seasonal sweep to rank and filter tasks.
 */
export function calculateTaskPriority(params: {
  isOverdue: boolean;
  skipRisk: string; // "high" | "medium" | "low"
  systemAgeYears: number;
  pFailure1yr: number;
  seasonRelevance: number; // 0-1
}): number {
  let score = 0;
  if (params.isOverdue) score += 30;
  const skipRiskScore: Record<string, number> = { high: 25, medium: 15, low: 5 };
  score += skipRiskScore[params.skipRisk] ?? 10;
  score += Math.min(params.systemAgeYears / 20, 1.0) * 15;
  score += params.pFailure1yr * 20;
  score += params.seasonRelevance * 10;
  return Math.min(Math.round(score), 100);
}

// ═══════════════════════════════════════════════════════════════════════
// SEASON DETERMINATION (Workflow 5)
// ═══════════════════════════════════════════════════════════════════════

/**
 * Determine the approaching season based on month and climate zone.
 * Climate zones 1-2 (hot/humid) have different seasonal patterns.
 */
export function determineSeason(month: number, climateZone?: number): string {
  if (climateZone && climateZone <= 2) {
    if (month >= 4 && month <= 9) return "summer";
    if (month >= 10 || month <= 1) return "winter";
    return month <= 3 ? "spring" : "fall";
  }
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "fall";
  return "winter";
}

// ═══════════════════════════════════════════════════════════════════════
// QUOTE PRICE CLASSIFICATION (Workflow 4)
// ═══════════════════════════════════════════════════════════════════════

export function classifyQuotePrice(percentile: number): {
  flag: string;
  note: string;
} {
  if (percentile <= 15) return {
    flag: "SUSPICIOUSLY_LOW",
    note: "Well below typical market rates. Verify scope includes all necessary work, materials, and permits.",
  };
  if (percentile <= 40) return {
    flag: "GOOD_VALUE",
    note: "On the lower end of typical pricing — looks like a fair deal.",
  };
  if (percentile <= 70) return {
    flag: "TYPICAL",
    note: "In the normal range for this work in your area.",
  };
  if (percentile <= 90) return {
    flag: "ABOVE_AVERAGE",
    note: "Above average. Could be justified by premium materials or warranty — worth comparing.",
  };
  return {
    flag: "HIGH",
    note: "Significantly above typical market rates.",
  };
}

// ═══════════════════════════════════════════════════════════════════════
// HOME HEALTH SCORE (Workflow 7)
// ═══════════════════════════════════════════════════════════════════════

export function calculateHomeHealthScore(
  systems: Array<{
    healthScore?: number;
    failureProbability1yr: number;
    replacementCost: number;
  }>,
): number {
  if (systems.length === 0) return 100;
  const totalWeight = systems.reduce((sum, s) => sum + Math.max(s.replacementCost, 1), 0);
  const weightedScore = systems.reduce((sum, s) => {
    const score = s.healthScore ?? (1 - s.failureProbability1yr) * 100;
    return sum + score * Math.max(s.replacementCost, 1);
  }, 0);
  return Math.round(Math.max(0, Math.min(100, weightedScore / totalWeight)));
}

// ═══════════════════════════════════════════════════════════════════════
// GOTCHA FACTOR DETECTION (Workflow 1, 7)
// ═══════════════════════════════════════════════════════════════════════

/**
 * Check a system for known gotcha factors — issues that aren't
 * captured by standard Weibull forecasting but have outsized impact.
 */
export function checkGotchaFactors(params: {
  systemType: string;
  systemCategory: string;
  manufacturer?: string;
  installYear?: number;
}): GotchaFactor[] {
  const gotchas: GotchaFactor[] = [];
  const type = params.systemType.toLowerCase();
  const brand = (params.manufacturer ?? "").toLowerCase();
  const cat = params.systemCategory.toLowerCase();
  const year = params.installYear;

  // R-22 refrigerant phase-out (pre-2010 AC/heat pump)
  if (
    (type.includes("ac") || type.includes("air condition") || type.includes("heat pump") || type.includes("central cooling")) &&
    year && year < 2010
  ) {
    gotchas.push({
      id: "r22_refrigerant_phaseout",
      description: "Pre-2010 AC/heat pump likely uses R-22 refrigerant (phased out). Recharging costs $75-$175/lb vs $10-$20/lb for R-410A.",
      severity: "financial",
      recommendation: "Plan replacement rather than expensive R-22 recharges.",
    });
  }

  // Federal Pacific / Zinsco panels (fire hazard)
  if (
    cat === "electrical" &&
    (brand.includes("federal pacific") || brand.includes("zinsco") || brand.includes("sylvania"))
  ) {
    gotchas.push({
      id: "hazardous_electrical_panel",
      description: `${params.manufacturer} panel identified — known fire hazard with documented breaker failure rates.`,
      severity: "safety_critical",
      recommendation: "Replace panel regardless of apparent condition. This is a safety issue.",
    });
  }

  // Polybutylene plumbing (1978-1995)
  if (
    cat === "plumbing" &&
    (type.includes("polybutylene") || type.includes("poly-b") ||
     (year && year >= 1978 && year <= 1995 && type.includes("supply")))
  ) {
    gotchas.push({
      id: "polybutylene_plumbing",
      description: "Polybutylene plumbing (1978-1995) has known defect — pipes deteriorate internally causing hidden leaks and sudden bursts.",
      severity: "safety_critical",
      recommendation: "Recommend full re-pipe. This material will fail — the question is when, not if.",
    });
  }

  // Galvanized steel pipes in pre-1970 homes
  if (cat === "plumbing" && year && year < 1970) {
    gotchas.push({
      id: "galvanized_steel_pipes",
      description: "Pre-1970 plumbing may use galvanized steel — corrodes internally, reducing flow and potentially contaminating water.",
      severity: "financial",
      recommendation: "Camera inspection recommended. Plan for re-pipe within 5-10 years.",
    });
  }

  // Knob-and-tube wiring (pre-1960)
  if (cat === "electrical" && year && year < 1960) {
    gotchas.push({
      id: "knob_and_tube_wiring",
      description: "Pre-1960 home may have knob-and-tube wiring — incompatible with insulation contact and most modern loads.",
      severity: "informational",
      recommendation: "Professional inspection recommended. May affect insurance coverage.",
    });
  }

  // Cast iron drain pipes in older homes
  if (cat === "plumbing" && year && year < 1975 && type.includes("drain")) {
    gotchas.push({
      id: "cast_iron_drain_scaling",
      description: "Pre-1975 cast iron drains may have significant internal scaling. Camera inspection can reveal blockage risk.",
      severity: "financial",
      recommendation: "Sewer camera inspection recommended for homes 50+ years old.",
    });
  }

  // Discontinued brands / models (broad heuristic)
  const discontinuedBrands = ["ge profile", "sears", "kenmore elite"];
  if (discontinuedBrands.some((b) => brand.includes(b)) && year && year < 2015) {
    gotchas.push({
      id: "discontinued_brand",
      description: `${params.manufacturer} parts may be difficult or expensive to source.`,
      severity: "informational",
      recommendation: "Factor parts availability into repair-vs-replace calculations.",
    });
  }

  return gotchas;
}

// ═══════════════════════════════════════════════════════════════════════
// FORMATTING UTILITIES
// ═══════════════════════════════════════════════════════════════════════

export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function formatPercent(p: number): string {
  return `${Math.round(p * 100)}%`;
}

export function monthsBetween(date1: string | number, date2: string | number): number {
  const d1 = typeof date1 === "number" ? new Date(date1) : new Date(date1);
  const d2 = typeof date2 === "number" ? new Date(date2) : new Date(date2);
  return Math.round(
    (d2.getTime() - d1.getTime()) / (30.44 * 24 * 60 * 60 * 1000)
  );
}

export function ageFromInstallDate(installDate?: string): number | undefined {
  if (!installDate) return undefined;
  const d = new Date(installDate);
  if (isNaN(d.getTime())) return undefined;
  return Math.round(((Date.now() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000)) * 10) / 10;
}
