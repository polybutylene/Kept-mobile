/**
 * Runtime-Adjusted Weibull Predictions
 *
 * Standard Weibull uses AGE (years) as the time variable.
 * IoT-enhanced Weibull uses ACTUAL RUNTIME HOURS — dramatically more
 * accurate because a lightly-used AC (800 hrs/yr) and a heavily-used
 * AC (3000 hrs/yr) have very different failure curves.
 */

export interface IoTEnhancedPrediction {
  ageBasedPrediction: {
    remainingYearsLow: number;
    remainingYearsHigh: number;
    confidence: "low" | "medium" | "high";
  };
  runtimeBasedPrediction?: {
    remainingRuntimeHoursLow: number;
    remainingRuntimeHoursHigh: number;
    remainingYearsLow: number;
    remainingYearsHigh: number;
    confidence: "high";
    annualRuntimeHours: number;
    totalRuntimeHours: number;
  };
  usageIntensity?: {
    score: number;
    label: string;
    comparedToAverage: string;
  };
  anomalyWarning?: {
    detected: boolean;
    description: string;
    suggestedAction: string;
  };
}

interface AggregateRecord {
  readingType: string;
  period: string;
  sum?: number;
  avg?: number;
  trendDirection?: string;
  isAnomaly?: boolean;
  anomalyDescription?: string;
  periodStart: number;
}

const RUNTIME_PARAMS: Record<string, { scaleLow: number; scaleHigh: number }> = {
  central_ac:                 { scaleLow: 30000, scaleHigh: 55000 },
  heat_pump:                  { scaleLow: 28000, scaleHigh: 50000 },
  furnace_gas:                { scaleLow: 50000, scaleHigh: 100000 },
  water_heater_tank_gas:      { scaleLow: 25000, scaleHigh: 45000 },
  water_heater_tank_electric: { scaleLow: 20000, scaleHigh: 40000 },
  refrigerator:               { scaleLow: 60000, scaleHigh: 100000 },
  dishwasher:                 { scaleLow: 3000,  scaleHigh: 6000 },
  washing_machine:            { scaleLow: 4000,  scaleHigh: 8000 },
};

const NATIONAL_AVG_HOURS: Record<string, number> = {
  central_ac:                 1800,
  heat_pump:                  2200,
  furnace_gas:                1200,
  water_heater_tank_gas:      2000,
  water_heater_tank_electric: 2400,
  refrigerator:               5000,
  dishwasher:                 400,
  washing_machine:            500,
};

export function computeIoTEnhancedPrediction(
  systemType: string,
  systemAge: number,
  iotAggregates: AggregateRecord[],
  weibullParams: { shape: number; scale: number },
): IoTEnhancedPrediction {
  const ageBased = computeAgeBased(systemAge, weibullParams);

  const runtimeReadings = iotAggregates.filter(
    (a) => a.readingType.includes("runtime") && a.period === "monthly" && a.sum != null
  );

  if (runtimeReadings.length < 3) {
    return { ageBasedPrediction: ageBased };
  }

  const totalMonthlyRuntime = runtimeReadings.reduce((sum, r) => sum + (r.sum ?? 0), 0);
  const monthsCovered = runtimeReadings.length;
  const annualRuntimeHours = (totalMonthlyRuntime / monthsCovered) * 12 / 60;
  const totalRuntimeHours = annualRuntimeHours * systemAge;

  const runtimeWeibull = RUNTIME_PARAMS[systemType];
  if (!runtimeWeibull) {
    return { ageBasedPrediction: ageBased };
  }

  const remainingHoursLow = runtimeWeibull.scaleLow - totalRuntimeHours;
  const remainingHoursHigh = runtimeWeibull.scaleHigh - totalRuntimeHours;
  const remainingYearsLow = Math.max(0, remainingHoursLow / annualRuntimeHours);
  const remainingYearsHigh = Math.max(0, remainingHoursHigh / annualRuntimeHours);

  const nationalAvg = NATIONAL_AVG_HOURS[systemType] ?? 2000;
  const intensityScore = Math.min(100, Math.round((annualRuntimeHours / nationalAvg) * 50));
  const intensityLabel = intensityScore < 35 ? "Light" : intensityScore < 65 ? "Average" : intensityScore < 85 ? "Heavy" : "Extreme";

  const intensityDiff = Math.round(Math.abs(1 - intensityScore / 50) * 100);
  const comparedToAverage = intensityScore < 50
    ? `${intensityDiff}% below average`
    : intensityScore > 50
    ? `${intensityDiff}% above average`
    : "About average";

  const anomaly = detectRuntimeAnomaly(iotAggregates);

  return {
    ageBasedPrediction: ageBased,
    runtimeBasedPrediction: {
      remainingRuntimeHoursLow: Math.max(0, Math.round(remainingHoursLow)),
      remainingRuntimeHoursHigh: Math.max(0, Math.round(remainingHoursHigh)),
      remainingYearsLow: Math.round(remainingYearsLow * 10) / 10,
      remainingYearsHigh: Math.round(remainingYearsHigh * 10) / 10,
      confidence: "high",
      annualRuntimeHours: Math.round(annualRuntimeHours),
      totalRuntimeHours: Math.round(totalRuntimeHours),
    },
    usageIntensity: {
      score: intensityScore,
      label: intensityLabel,
      comparedToAverage,
    },
    anomalyWarning: anomaly,
  };
}

function computeAgeBased(
  age: number,
  params: { shape: number; scale: number }
): IoTEnhancedPrediction["ageBasedPrediction"] {
  const expectedRemaining = params.scale * Math.exp(
    lgamma(1 + 1 / params.shape)
  ) - age;

  const confidence: "low" | "medium" | "high" =
    age < params.scale * 0.3 ? "low" : age < params.scale * 0.7 ? "medium" : "high";

  return {
    remainingYearsLow: Math.max(0, Math.round((expectedRemaining * 0.7) * 10) / 10),
    remainingYearsHigh: Math.max(0, Math.round((expectedRemaining * 1.3) * 10) / 10),
    confidence,
  };
}

function lgamma(x: number): number {
  const c = [
    76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5,
  ];
  let y = x;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) {
    ser += c[j] / ++y;
  }
  return -tmp + Math.log(2.5066282746310005 * ser / x);
}

function detectRuntimeAnomaly(
  aggregates: AggregateRecord[]
): IoTEnhancedPrediction["anomalyWarning"] | undefined {
  const monthly = aggregates
    .filter((a) => a.period === "monthly" && a.readingType.includes("runtime"))
    .sort((a, b) => b.periodStart - a.periodStart)
    .slice(0, 6);

  if (monthly.length < 3) return undefined;

  let increasingMonths = 0;
  for (let i = 0; i < monthly.length - 1; i++) {
    const current = monthly[i].sum ?? monthly[i].avg ?? 0;
    const previous = monthly[i + 1].sum ?? monthly[i + 1].avg ?? 0;
    if (previous > 0 && current > previous * 1.05) {
      increasingMonths++;
    }
  }

  if (increasingMonths >= 3) {
    return {
      detected: true,
      description: `Runtime has been increasing for ${increasingMonths} consecutive months. This often indicates degradation — dirty coils, low refrigerant, or a failing compressor.`,
      suggestedAction: "Schedule an HVAC inspection to catch issues before a breakdown.",
    };
  }

  const anomalies = aggregates.filter((a) => a.isAnomaly);
  if (anomalies.length > 0) {
    return {
      detected: true,
      description: anomalies[0].anomalyDescription ?? "Unusual reading pattern detected.",
      suggestedAction: "Review device readings and consider scheduling a professional inspection.",
    };
  }

  return undefined;
}

export function computeIoTAdjustedHealthScore(
  baseHealthScore: number,
  iotData: {
    usageIntensity: number;
    energyTrend: string;
    anomalyDetected: boolean;
    runtimeBasedRemainingYears: number;
    ageBasedRemainingYears: number;
  }
): number {
  let adjustment = 0;

  if (iotData.usageIntensity > 70) {
    adjustment -= (iotData.usageIntensity - 70) * 0.3;
  }

  if (iotData.energyTrend === "increasing") adjustment -= 5;

  if (iotData.anomalyDetected) adjustment -= 10;

  const predictionGap = iotData.ageBasedRemainingYears - iotData.runtimeBasedRemainingYears;
  if (predictionGap > 2) adjustment -= predictionGap * 3;

  return Math.max(0, Math.min(100, baseHealthScore + adjustment));
}
