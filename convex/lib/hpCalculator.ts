/**
 * HP Calculation Engine v2
 * 
 * Ties Health Points directly to Weibull-based risk forecasting.
 * Every HP earned or lost represents real risk reduction or exposure.
 * 
 * Formula: System HP = BaseValue × SurvivalProb × ConditionMult × DocBonus
 * Where:
 *   - BaseValue = ReplacementCost / 100
 *   - SurvivalProb = 1 - Weibull CDF at current age
 *   - ConditionMult = Multiplier based on condition (1.0 to 0.2)
 *   - DocBonus = 1.2 if fully documented, 1.0 otherwise
 */

import { Id, Doc } from "../_generated/dataModel";

// Condition multipliers
export const CONDITION_MULTIPLIERS: Record<string, number> = {
  excellent: 1.0,
  good: 0.9,
  fair: 0.7,
  poor: 0.4,
  critical: 0.2,
};

// HP earning rates for different actions
export const HP_EARNING_RATES = {
  // System actions
  systemAdded: 0.5, // BaseValue × 0.5
  systemReplaced: 1.0, // Full risk value recovered
  
  // Maintenance actions
  maintenanceLogged: 0.15, // BaseValue × 0.15
  diagnosticCompleted: 25, // Flat 25 HP
  documentUploaded: 10, // Flat 10 HP
  
  // Budget actions
  budgetGoalSet: 0.005, // GoalAmount / 200
  budgetFunded: 0.01, // AmountFunded / 100
  
  // Campaign bonuses (defined in campaigns.ts)
  
  // Bonus multipliers
  onTimeBonus: 1.25, // 25% bonus for on-time completion
  streakBonusPerWeek: 5, // +5 HP per week of streak
};

// Decay rates
export const DECAY_RATES = {
  maintenanceLapsePerMonth: 0.02, // 2% per month overdue
  maintenanceLapseMax: 0.10, // Cap at 10%
};

export const DAMAGE_BASE_BY_FAILURE_MODE: Record<string, number> = {
  catastrophic: 8000,
  progressive: 3000,
  minor: 1500,
  non_damaging: 0,
};

const DAMAGE_KEYWORD_BASES: Array<{ keywords: string[]; base: number }> = [
  { keywords: ["supply line", "braided", "supply"], base: 15000 },
  { keywords: ["water heater"], base: 8000 },
  { keywords: ["toilet"], base: 10000 },
  { keywords: ["washing machine", "washer"], base: 12000 },
  { keywords: ["sewer", "main sewer"], base: 7000 },
  { keywords: ["condensate", "drain"], base: 3000 },
  { keywords: ["evaporator", "coil"], base: 2000 },
  { keywords: ["roof", "leak"], base: 5000 },
  { keywords: ["hvac", "furnace", "heat pump", "air conditioner", "ac unit", "air handler"], base: 2000 },
  { keywords: ["plumbing", "pipe", "faucet", "sink"], base: 5000 },
  { keywords: ["electrical", "panel", "breaker", "wiring"], base: 3000 },
  { keywords: ["appliance", "refrigerator", "dishwasher", "dryer", "oven", "range"], base: 2000 },
  { keywords: ["garage", "door"], base: 500 },
  { keywords: ["window", "door"], base: 1000 },
];

const LOCATION_MULTIPLIERS: Record<string, number> = {
  basement: 1.0,
  first: 1.5,
  second: 2.5,
  third: 2.5,
  attic: 2.0,
  exterior: 0.5,
};

/**
 * Calculate Weibull survival probability
 * R(t) = exp(-(t/scale)^shape)
 */
export function weibullSurvival(age: number, shape: number, scale: number): number {
  if (age <= 0) return 1.0;
  if (scale <= 0) return 0.0;
  
  const probability = Math.exp(-Math.pow(age / scale, shape));
  return Math.max(0, Math.min(1, probability));
}

/**
 * Calculate Weibull CDF (failure probability)
 * F(t) = 1 - R(t) = 1 - exp(-(t/scale)^shape)
 */
export function weibullCDF(age: number, shape: number, scale: number): number {
  return 1 - weibullSurvival(age, shape, scale);
}

/**
 * Calculate the rate of change in failure probability over a time period
 * Used for decay calculations
 */
export function weibullDecayRate(
  currentAge: number,
  shape: number,
  scale: number,
  periodDays: number = 30
): number {
  const currentProb = weibullCDF(currentAge, shape, scale);
  const futureAge = currentAge + (periodDays / 365);
  const futureProb = weibullCDF(futureAge, shape, scale);
  
  return futureProb - currentProb;
}

/**
 * Get condition multiplier from health score
 */
export function getConditionFromHealthScore(healthScore: number): string {
  if (healthScore >= 90) return "excellent";
  if (healthScore >= 70) return "good";
  if (healthScore >= 50) return "fair";
  if (healthScore >= 30) return "poor";
  return "critical";
}

/**
 * Check if a system is fully documented
 */
export function isFullyDocumented(system: {
  installDate?: string | null;
  modelNumber?: string | null;
  lastServiceDate?: string | null;
  manufacturer?: string | null;
}): boolean {
  return !!(
    system.installDate &&
    system.modelNumber &&
    (system.lastServiceDate || system.manufacturer)
  );
}

/**
 * Calculate system age in years
 */
export function calculateSystemAge(installDate: string | null | undefined): number {
  if (!installDate) return 5; // Default assumption if no install date
  
  const install = new Date(installDate);
  const now = new Date();
  const ageMs = now.getTime() - install.getTime();
  const ageYears = ageMs / (1000 * 60 * 60 * 24 * 365.25);
  
  return Math.max(0, ageYears);
}

/**
 * Calculate HP contribution for a single system
 */
export interface SystemHPInput {
  estimatedReplacementCost: number | null | undefined;
  healthScore: number;
  installDate: string | null | undefined;
  modelNumber: string | null | undefined;
  lastServiceDate: string | null | undefined;
  manufacturer: string | null | undefined;
  weibullShape: number;
  weibullScale: number;
  locationFloor?: string | null;
  locationRoom?: string | null;
  failureMode?: string | null;
  damagePotentialBase?: number | null;
  category?: string | null;
}

export interface SystemHPResult {
  currentHP: number;
  maxHP: number;
  baseValue: number;
  survivalProbability: number;
  conditionMultiplier: number;
  documentationBonus: number;
  systemAge: number;
  monthlyAgingDecay: number;
}

export function calculateSystemHP(input: SystemHPInput): SystemHPResult {
  // Base value = replacement cost / 100
  const replacementCost = input.estimatedReplacementCost || 5000;
  const baseValue = replacementCost / 100;
  
  // System age
  const systemAge = calculateSystemAge(input.installDate);
  
  // Survival probability from Weibull
  const survivalProbability = weibullSurvival(
    systemAge,
    input.weibullShape || 2.5,
    input.weibullScale || 15
  );
  
  // Condition multiplier from health score
  const condition = getConditionFromHealthScore(input.healthScore);
  const conditionMultiplier = CONDITION_MULTIPLIERS[condition] || 0.7;
  
  // Documentation bonus
  const documentationBonus = isFullyDocumented(input) ? 1.2 : 1.0;
  
  // Calculate current HP
  const currentHP = baseValue * survivalProbability * conditionMultiplier * documentationBonus;
  
  // Max HP (new system, excellent condition, fully documented)
  const maxHP = baseValue * 1.0 * 1.0 * 1.2;
  
  // Monthly aging decay based on Weibull curve
  const decayRate = weibullDecayRate(systemAge, input.weibullShape || 2.5, input.weibullScale || 15);
  const monthlyAgingDecay = baseValue * decayRate * conditionMultiplier * documentationBonus;
  
  return {
    currentHP: Math.round(currentHP * 10) / 10, // Round to 1 decimal
    maxHP: Math.round(maxHP * 10) / 10,
    baseValue: Math.round(baseValue * 10) / 10,
    survivalProbability: Math.round(survivalProbability * 1000) / 1000,
    conditionMultiplier,
    documentationBonus,
    systemAge: Math.round(systemAge * 10) / 10,
    monthlyAgingDecay: Math.round(monthlyAgingDecay * 10) / 10,
  };
}

/**
 * Calculate total home HP from all systems
 */
export interface HomeHPInput {
  systems: Array<SystemHPInput & { id: string; name: string }>;
  overdueTaskCount: number;
  homeValue?: number | null;
  mitigationBySystemId?: Record<string, number[]>;
}

export interface HomeHPResult {
  currentHP: number;
  maxPossibleHP: number;
  dollarValueProtected: number;
  dollarValueAtRisk: number;
  replacementAtRisk: number;
  damageExposure: number;
  damageExposureRaw: number;
  damageExposureMultiplier: number;
  damageExposureToReplacementRatio: number;
  monthlyAgingDecay: number;
  overdueDecayRate: number;
  systemContributions: Array<{
    systemId: string;
    systemName: string;
    currentHP: number;
    maxHP: number;
    monthlyDecay: number;
    replacementAtRisk: number;
    damageExposure: number;
    systemAge: number;
    survivalProbability: number;
    failureProbability: number;
    damageBase: number;
    category: string;
  }>;
}

export function calculateHomeHP(input: HomeHPInput): HomeHPResult {
  let totalCurrentHP = 0;
  let totalMaxHP = 0;
  let totalMonthlyDecay = 0;
  let totalReplacementAtRisk = 0;
  let totalDamageExposureRaw = 0;
  const systemContributions: HomeHPResult["systemContributions"] = [];
  
  for (const system of input.systems) {
    const result = calculateSystemHP(system);
    const failureProbability = Math.max(0, 1 - result.survivalProbability);
    const replacementCost = system.estimatedReplacementCost || 5000;
    const replacementAtRisk = replacementCost * failureProbability;
    const damageBase = getDamagePotentialBase(system);
    const locationMultiplier = getLocationMultiplier(system.locationFloor);
    const mitigationFactor = getMitigationFactor(
      input.mitigationBySystemId?.[system.id] || []
    );
    const damageExposure = failureProbability * damageBase * locationMultiplier * mitigationFactor;
    
    totalCurrentHP += result.currentHP;
    totalMaxHP += result.maxHP;
    totalMonthlyDecay += result.monthlyAgingDecay;
    totalReplacementAtRisk += replacementAtRisk;
    totalDamageExposureRaw += damageExposure;
    
    systemContributions.push({
      systemId: system.id,
      systemName: system.name,
      currentHP: result.currentHP,
      maxHP: result.maxHP,
      monthlyDecay: result.monthlyAgingDecay,
      replacementAtRisk: Math.round(replacementAtRisk),
      damageExposure: Math.round(damageExposure),
      systemAge: result.systemAge,
      survivalProbability: result.survivalProbability,
      failureProbability,
      damageBase,
      category: system.category || 'unknown',
    });
  }
  
  // Calculate overdue decay (additional penalty for overdue tasks)
  // Each overdue task adds 2% of average system HP as monthly decay
  const avgSystemHP = input.systems.length > 0 ? totalCurrentHP / input.systems.length : 0;
  const overdueDecayRate = input.overdueTaskCount * avgSystemHP * DECAY_RATES.maintenanceLapsePerMonth;
  const damageExposureMultiplier = getHomeValueMultiplier(input.homeValue);
  const damageExposure = totalDamageExposureRaw * damageExposureMultiplier;
  const replacementAtRisk = totalReplacementAtRisk;
  const damageExposureToReplacementRatio = replacementAtRisk > 0
    ? damageExposure / replacementAtRisk
    : 0;
  
  return {
    currentHP: Math.round(totalCurrentHP),
    maxPossibleHP: Math.round(totalMaxHP),
    dollarValueProtected: Math.round(totalCurrentHP * 100),
    dollarValueAtRisk: Math.round((totalMaxHP - totalCurrentHP) * 100),
    replacementAtRisk: Math.round(replacementAtRisk),
    damageExposure: Math.round(damageExposure),
    damageExposureRaw: Math.round(totalDamageExposureRaw),
    damageExposureMultiplier,
    damageExposureToReplacementRatio: Math.round(damageExposureToReplacementRatio * 100) / 100,
    monthlyAgingDecay: Math.round(totalMonthlyDecay),
    overdueDecayRate: Math.round(overdueDecayRate),
    systemContributions,
  };
}

// Default damage potential by system category
const CATEGORY_DAMAGE_DEFAULTS: Record<string, number> = {
  plumbing: 6000,      // Water damage risk
  hvac: 2000,          // Mostly comfort, some water risk from condensate
  electrical: 3000,    // Fire risk
  appliances: 3000,    // Varies, some have water
  structural: 4000,    // Foundation, roof issues
  exterior: 2000,      // Weather exposure
};

function getDamagePotentialBase(system: SystemHPInput & { name?: string }): number {
  if (system.damagePotentialBase !== null && system.damagePotentialBase !== undefined) {
    return Math.max(0, system.damagePotentialBase);
  }

  if (system.failureMode && system.failureMode === "non_damaging") {
    return 0;
  }

  if (system.failureMode && DAMAGE_BASE_BY_FAILURE_MODE[system.failureMode]) {
    return DAMAGE_BASE_BY_FAILURE_MODE[system.failureMode];
  }

  const name = (system.name || "").toLowerCase();
  for (const entry of DAMAGE_KEYWORD_BASES) {
    if (entry.keywords.some((keyword) => name.includes(keyword))) {
      return entry.base;
    }
  }

  // Fall back to category-based default
  if (system.category && CATEGORY_DAMAGE_DEFAULTS[system.category]) {
    return CATEGORY_DAMAGE_DEFAULTS[system.category];
  }

  // Ultimate fallback: assume some risk (average home system)
  return 2000;
}

function getLocationMultiplier(locationFloor?: string | null): number {
  if (!locationFloor) return 1.0;
  return LOCATION_MULTIPLIERS[locationFloor] ?? 1.0;
}

function getMitigationFactor(reductions: number[]): number {
  if (!reductions || reductions.length === 0) return 1.0;
  const minReduction = Math.min(...reductions);
  return Math.max(0.3, Math.min(1.0, minReduction));
}

function getHomeValueMultiplier(homeValue?: number | null): number {
  if (!homeValue || homeValue <= 0) return 1.0;
  const multiplier = homeValue / 300000;
  return Math.min(multiplier, 4.0);
}

/**
 * Calculate HP earned for adding a new system
 */
export function calculateSystemAddedHP(replacementCost: number, isFullyDocumented: boolean): number {
  const baseValue = replacementCost / 100;
  const docBonus = isFullyDocumented ? 1.2 : 1.0;
  return Math.round(baseValue * HP_EARNING_RATES.systemAdded * docBonus);
}

/**
 * Calculate HP earned for completing maintenance
 */
export function calculateMaintenanceHP(
  replacementCost: number,
  isOnTime: boolean,
  healthImprovement: number = 0
): number {
  const baseValue = replacementCost / 100;
  let hp = baseValue * HP_EARNING_RATES.maintenanceLogged;
  
  // On-time bonus
  if (isOnTime) {
    hp *= HP_EARNING_RATES.onTimeBonus;
  }
  
  // Health improvement bonus (if significant)
  if (healthImprovement >= 5) {
    hp += 25; // Flat bonus for significant health improvement
  }
  
  return Math.round(hp);
}

/**
 * Calculate HP earned for replacing an aging system
 * Returns the "risk value" that was at stake
 */
export function calculateReplacementHP(
  oldReplacementCost: number,
  oldSurvivalProbability: number
): number {
  const baseValue = oldReplacementCost / 100;
  // The HP gained is the risk that was eliminated
  const riskEliminated = baseValue * (1 - oldSurvivalProbability);
  return Math.round(riskEliminated);
}

/**
 * Calculate daily decay for a home
 */
export function calculateDailyDecay(
  homeHP: HomeHPResult
): {
  totalDecay: number;
  agingDecay: number;
  overdueDecay: number;
  breakdown: Array<{ systemName: string; decay: number; reason: string }>;
} {
  // Daily is monthly / 30
  const agingDecay = homeHP.monthlyAgingDecay / 30;
  const overdueDecay = homeHP.overdueDecayRate / 30;
  
  const breakdown = homeHP.systemContributions.map(sys => ({
    systemName: sys.systemName,
    decay: sys.monthlyDecay / 30,
    reason: "aging_decay",
  }));
  
  return {
    totalDecay: Math.round((agingDecay + overdueDecay) * 10) / 10,
    agingDecay: Math.round(agingDecay * 10) / 10,
    overdueDecay: Math.round(overdueDecay * 10) / 10,
    breakdown,
  };
}

/**
 * Format HP for display with dollar value
 */
export function formatHPWithDollarValue(hp: number): string {
  const dollarValue = hp * 100;
  const formattedDollars = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(dollarValue);
  
  return `${Math.round(hp).toLocaleString()} HP — ${formattedDollars} protected`;
}
