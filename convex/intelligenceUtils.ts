/**
 * Intelligence Utilities
 *
 * Weibull curve fitting, guardrails, outlier detection, and bootstrap data.
 * Pure functions — no Convex runtime dependencies.
 */

// ============================================================
// WEIBULL MAXIMUM LIKELIHOOD ESTIMATION
// ============================================================

export function fitWeibull(lifespans: number[]): { shape: number; scale: number } {
  const n = lifespans.length;
  if (n < 3) {
    const mean = lifespans.reduce((a, b) => a + b, 0) / n;
    return { shape: 2.5, scale: Math.round(mean * 100) / 100 };
  }

  let beta = 2.0;
  const maxIterations = 100;
  const tolerance = 0.0001;

  for (let iter = 0; iter < maxIterations; iter++) {
    const sumLnT = lifespans.reduce((sum, t) => sum + Math.log(Math.max(t, 0.01)), 0);
    const sumTBeta = lifespans.reduce((sum, t) => sum + Math.pow(Math.max(t, 0.01), beta), 0);
    const sumTBetaLnT = lifespans.reduce((sum, t) => sum + Math.pow(Math.max(t, 0.01), beta) * Math.log(Math.max(t, 0.01)), 0);

    if (sumTBeta === 0) break;

    const f = (n / beta) + sumLnT - (n * sumTBetaLnT / sumTBeta);
    const sumTBetaLnT2 = lifespans.reduce(
      (sum, t) => sum + Math.pow(Math.max(t, 0.01), beta) * Math.pow(Math.log(Math.max(t, 0.01)), 2),
      0
    );
    const fPrime = -(n / (beta * beta)) -
      (n * (sumTBetaLnT2 * sumTBeta - sumTBetaLnT * sumTBetaLnT) / (sumTBeta * sumTBeta));

    if (fPrime === 0) break;

    const betaNew = beta - f / fPrime;
    if (Math.abs(betaNew - beta) < tolerance) {
      beta = betaNew;
      break;
    }
    beta = Math.max(0.1, betaNew);
  }

  const eta = Math.pow(
    lifespans.reduce((sum, t) => sum + Math.pow(Math.max(t, 0.01), beta), 0) / n,
    1 / beta
  );

  return {
    shape: Math.round(beta * 100) / 100,
    scale: Math.round(eta * 100) / 100,
  };
}

// ============================================================
// BLENDING: Bootstrap + Real Data
// ============================================================

export function blendWeibullParams(
  bootstrapShape: number,
  bootstrapScale: number,
  realShape: number,
  realScale: number,
  realSampleSize: number,
): { shape: number; scale: number } {
  // Bayesian-style: real data weight increases with sample size
  // At 10 obs: ~20% real. At 50: ~100% real.
  const realWeight = Math.min(realSampleSize / 50, 1.0);
  const bootstrapWeight = 1.0 - realWeight;

  return {
    shape: Math.round((bootstrapShape * bootstrapWeight + realShape * realWeight) * 100) / 100,
    scale: Math.round((bootstrapScale * bootstrapWeight + realScale * realWeight) * 100) / 100,
  };
}

// ============================================================
// GUARDRAILS
// ============================================================

export const INTELLIGENCE_GUARDRAILS = {
  MIN_RELIABILITY_SAMPLE: 10,
  MIN_TROUBLESHOOTING_SAMPLE: 5,
  MIN_COST_SAMPLE: 5,
  MIN_SEASONAL_SAMPLE: 12,
  MIN_PRODUCT_SAMPLE: 10,

  MAX_AGE_DAYS_RELIABILITY: 90,
  MAX_AGE_DAYS_COSTS: 30,
  MAX_AGE_DAYS_TROUBLESHOOTING: 60,
  MAX_AGE_DAYS_SEASONAL: 180,

  MAX_WEIBULL_DEVIATION: 0.5,
  MAX_COST_DEVIATION: 3.0,

  HIGH_CONFIDENCE: 50,
  MEDIUM_CONFIDENCE: 20,
  LOW_CONFIDENCE: 10,
} as const;

export function getConfidenceLevel(sampleSize: number): "high" | "medium" | "low" {
  if (sampleSize >= INTELLIGENCE_GUARDRAILS.HIGH_CONFIDENCE) return "high";
  if (sampleSize >= INTELLIGENCE_GUARDRAILS.MEDIUM_CONFIDENCE) return "medium";
  return "low";
}

export function isStale(lastUpdated: number, maxAgeDays: number): boolean {
  const age = Date.now() - lastUpdated;
  return age > maxAgeDays * 24 * 60 * 60 * 1000;
}

export function isOutlierCost(
  reportedCost: number,
  medianCost: number,
): boolean {
  return reportedCost > medianCost * 3 || reportedCost < medianCost * 0.1;
}

const REASONABLE_LIFESPAN_RANGES: Record<string, { min: number; max: number }> = {
  "Central Air Conditioner": { min: 3, max: 30 },
  "Gas Furnace": { min: 5, max: 40 },
  "Heat Pump": { min: 3, max: 25 },
  "Tank Water Heater (Gas)": { min: 2, max: 25 },
  "Tank Water Heater (Electric)": { min: 2, max: 25 },
  "Tankless Water Heater": { min: 5, max: 30 },
  "Asphalt Shingle Roof": { min: 5, max: 50 },
  "Dishwasher": { min: 2, max: 20 },
  "Refrigerator": { min: 3, max: 30 },
  "Washing Machine": { min: 3, max: 20 },
  "Dryer": { min: 3, max: 25 },
  "Electrical Panel": { min: 10, max: 60 },
  "Water Softener": { min: 3, max: 25 },
  "Garbage Disposal": { min: 2, max: 20 },
};

export function isOutlierLifespan(age: number, systemType: string): boolean {
  const range = REASONABLE_LIFESPAN_RANGES[systemType];
  if (!range) return false;
  return age < range.min || age > range.max;
}

// ============================================================
// BOOTSTRAP SEED DATA — Industry averages for Bay/Walton County
// ============================================================

export interface BootstrapReliability {
  systemType: string;
  make?: string;
  region?: string;
  climateZone?: string;
  weibullShape: number;
  weibullScale: number;
  medianLifespan: number;
  p10Lifespan: number;
  p90Lifespan: number;
  defaultWeibullScale: number;
  adjustmentFactor: number;
  commonFailureModes: { mode: string; frequency: number; averageAgeAtFailure: number }[];
  preFailureSymptoms: { symptom: string; frequencyPercent: number; averageLeadTime: number }[];
}

export const BOOTSTRAP_RELIABILITY: BootstrapReliability[] = [
  {
    systemType: "Central Air Conditioner",
    region: "Bay County, FL",
    climateZone: "2A",
    weibullShape: 3.0,
    weibullScale: 14,
    medianLifespan: 13,
    p10Lifespan: 8,
    p90Lifespan: 18,
    defaultWeibullScale: 16.5,
    adjustmentFactor: 0.85,
    commonFailureModes: [
      { mode: "Compressor failure", frequency: 0.35, averageAgeAtFailure: 12 },
      { mode: "Capacitor failure", frequency: 0.25, averageAgeAtFailure: 8 },
      { mode: "Refrigerant leak", frequency: 0.20, averageAgeAtFailure: 10 },
      { mode: "Fan motor burnout", frequency: 0.10, averageAgeAtFailure: 11 },
    ],
    preFailureSymptoms: [
      { symptom: "Reduced cooling output", frequencyPercent: 65, averageLeadTime: 3 },
      { symptom: "Unusual noise from outdoor unit", frequencyPercent: 45, averageLeadTime: 2 },
      { symptom: "Higher-than-normal energy bills", frequencyPercent: 40, averageLeadTime: 6 },
      { symptom: "Ice on refrigerant lines", frequencyPercent: 30, averageLeadTime: 1 },
    ],
  },
  {
    systemType: "Tank Water Heater (Gas)",
    region: "Bay County, FL",
    climateZone: "2A",
    weibullShape: 2.8,
    weibullScale: 11,
    medianLifespan: 10,
    p10Lifespan: 6,
    p90Lifespan: 14,
    defaultWeibullScale: 12,
    adjustmentFactor: 0.92,
    commonFailureModes: [
      { mode: "Tank corrosion/leak", frequency: 0.40, averageAgeAtFailure: 11 },
      { mode: "Thermocouple failure", frequency: 0.20, averageAgeAtFailure: 7 },
      { mode: "Sediment buildup", frequency: 0.25, averageAgeAtFailure: 8 },
      { mode: "Anode rod depletion", frequency: 0.10, averageAgeAtFailure: 6 },
    ],
    preFailureSymptoms: [
      { symptom: "Rusty or discolored hot water", frequencyPercent: 55, averageLeadTime: 4 },
      { symptom: "Popping or rumbling sounds", frequencyPercent: 50, averageLeadTime: 6 },
      { symptom: "Slow recovery time", frequencyPercent: 40, averageLeadTime: 3 },
      { symptom: "Small puddle at base", frequencyPercent: 70, averageLeadTime: 1 },
    ],
  },
  {
    systemType: "Gas Furnace",
    region: "Bay County, FL",
    climateZone: "2A",
    weibullShape: 3.2,
    weibullScale: 22,
    medianLifespan: 20,
    p10Lifespan: 14,
    p90Lifespan: 28,
    defaultWeibullScale: 20,
    adjustmentFactor: 1.1,
    commonFailureModes: [
      { mode: "Heat exchanger crack", frequency: 0.30, averageAgeAtFailure: 18 },
      { mode: "Ignitor failure", frequency: 0.25, averageAgeAtFailure: 10 },
      { mode: "Blower motor failure", frequency: 0.20, averageAgeAtFailure: 15 },
      { mode: "Flame sensor malfunction", frequency: 0.15, averageAgeAtFailure: 8 },
    ],
    preFailureSymptoms: [
      { symptom: "Yellow or flickering flame", frequencyPercent: 45, averageLeadTime: 6 },
      { symptom: "Unusual burning smell", frequencyPercent: 35, averageLeadTime: 2 },
      { symptom: "Short cycling", frequencyPercent: 50, averageLeadTime: 4 },
    ],
  },
  {
    systemType: "Heat Pump",
    region: "Bay County, FL",
    climateZone: "2A",
    weibullShape: 2.9,
    weibullScale: 13,
    medianLifespan: 12,
    p10Lifespan: 7,
    p90Lifespan: 17,
    defaultWeibullScale: 15,
    adjustmentFactor: 0.87,
    commonFailureModes: [
      { mode: "Compressor failure", frequency: 0.35, averageAgeAtFailure: 11 },
      { mode: "Reversing valve failure", frequency: 0.20, averageAgeAtFailure: 9 },
      { mode: "Refrigerant leak", frequency: 0.25, averageAgeAtFailure: 8 },
      { mode: "Defrost control failure", frequency: 0.10, averageAgeAtFailure: 10 },
    ],
    preFailureSymptoms: [
      { symptom: "Unit running constantly", frequencyPercent: 55, averageLeadTime: 4 },
      { symptom: "Reduced heating/cooling", frequencyPercent: 60, averageLeadTime: 3 },
      { symptom: "Unusual vibration", frequencyPercent: 30, averageLeadTime: 2 },
    ],
  },
  {
    systemType: "Asphalt Shingle Roof",
    region: "Bay County, FL",
    climateZone: "2A",
    weibullShape: 3.5,
    weibullScale: 18,
    medianLifespan: 17,
    p10Lifespan: 12,
    p90Lifespan: 23,
    defaultWeibullScale: 25,
    adjustmentFactor: 0.72,
    commonFailureModes: [
      { mode: "Wind damage/shingle loss", frequency: 0.35, averageAgeAtFailure: 15 },
      { mode: "Granule loss/UV degradation", frequency: 0.30, averageAgeAtFailure: 18 },
      { mode: "Flashing failure", frequency: 0.20, averageAgeAtFailure: 14 },
      { mode: "Valley/seam leak", frequency: 0.10, averageAgeAtFailure: 16 },
    ],
    preFailureSymptoms: [
      { symptom: "Granules in gutters", frequencyPercent: 70, averageLeadTime: 12 },
      { symptom: "Curling or buckling shingles", frequencyPercent: 60, averageLeadTime: 18 },
      { symptom: "Interior water stains", frequencyPercent: 45, averageLeadTime: 2 },
    ],
  },
  {
    systemType: "Electrical Panel",
    region: "Bay County, FL",
    climateZone: "2A",
    weibullShape: 3.8,
    weibullScale: 35,
    medianLifespan: 33,
    p10Lifespan: 22,
    p90Lifespan: 45,
    defaultWeibullScale: 40,
    adjustmentFactor: 0.88,
    commonFailureModes: [
      { mode: "Breaker failure", frequency: 0.35, averageAgeAtFailure: 25 },
      { mode: "Bus bar corrosion", frequency: 0.25, averageAgeAtFailure: 30 },
      { mode: "Connection corrosion (salt air)", frequency: 0.25, averageAgeAtFailure: 20 },
    ],
    preFailureSymptoms: [
      { symptom: "Breakers tripping frequently", frequencyPercent: 60, averageLeadTime: 6 },
      { symptom: "Burning smell near panel", frequencyPercent: 40, averageLeadTime: 1 },
      { symptom: "Discolored breakers", frequencyPercent: 35, averageLeadTime: 12 },
    ],
  },
];

export interface BootstrapCost {
  region: string;
  serviceCategory: string;
  costType: string;
  averageCost: number;
  medianCost: number;
  p25Cost: number;
  p75Cost: number;
  minCost: number;
  maxCost: number;
  costTrend: string;
}

export const BOOTSTRAP_COSTS: BootstrapCost[] = [
  { region: "Bay County, FL", serviceCategory: "hvac", costType: "service_call", averageCost: 125, medianCost: 110, p25Cost: 85, p75Cost: 150, minCost: 65, maxCost: 250, costTrend: "stable" },
  { region: "Bay County, FL", serviceCategory: "hvac", costType: "repair", averageCost: 450, medianCost: 375, p25Cost: 200, p75Cost: 650, minCost: 100, maxCost: 1500, costTrend: "rising" },
  { region: "Bay County, FL", serviceCategory: "hvac", costType: "replacement", averageCost: 7500, medianCost: 7000, p25Cost: 5500, p75Cost: 9500, minCost: 4000, maxCost: 15000, costTrend: "rising" },
  { region: "Bay County, FL", serviceCategory: "plumbing", costType: "service_call", averageCost: 150, medianCost: 135, p25Cost: 95, p75Cost: 200, minCost: 75, maxCost: 350, costTrend: "stable" },
  { region: "Bay County, FL", serviceCategory: "plumbing", costType: "repair", averageCost: 350, medianCost: 300, p25Cost: 150, p75Cost: 500, minCost: 75, maxCost: 1200, costTrend: "stable" },
  { region: "Bay County, FL", serviceCategory: "plumbing", costType: "replacement", averageCost: 4500, medianCost: 4000, p25Cost: 3000, p75Cost: 6000, minCost: 1500, maxCost: 12000, costTrend: "rising" },
  { region: "Bay County, FL", serviceCategory: "electrical", costType: "service_call", averageCost: 130, medianCost: 120, p25Cost: 90, p75Cost: 175, minCost: 70, maxCost: 300, costTrend: "stable" },
  { region: "Bay County, FL", serviceCategory: "electrical", costType: "repair", averageCost: 400, medianCost: 350, p25Cost: 175, p75Cost: 600, minCost: 100, maxCost: 2000, costTrend: "stable" },
  { region: "Bay County, FL", serviceCategory: "exterior", costType: "replacement", averageCost: 12000, medianCost: 11000, p25Cost: 8500, p75Cost: 15000, minCost: 6000, maxCost: 25000, costTrend: "rising" },
  { region: "Bay County, FL", serviceCategory: "appliances", costType: "repair", averageCost: 250, medianCost: 200, p25Cost: 100, p75Cost: 350, minCost: 50, maxCost: 800, costTrend: "stable" },
  { region: "Walton County, FL", serviceCategory: "hvac", costType: "service_call", averageCost: 135, medianCost: 120, p25Cost: 90, p75Cost: 165, minCost: 70, maxCost: 275, costTrend: "stable" },
  { region: "Walton County, FL", serviceCategory: "hvac", costType: "replacement", averageCost: 8000, medianCost: 7500, p25Cost: 6000, p75Cost: 10000, minCost: 4500, maxCost: 16000, costTrend: "rising" },
  { region: "Walton County, FL", serviceCategory: "plumbing", costType: "service_call", averageCost: 160, medianCost: 145, p25Cost: 100, p75Cost: 210, minCost: 80, maxCost: 375, costTrend: "stable" },
  { region: "Walton County, FL", serviceCategory: "plumbing", costType: "replacement", averageCost: 4800, medianCost: 4300, p25Cost: 3200, p75Cost: 6500, minCost: 1600, maxCost: 13000, costTrend: "rising" },
];
