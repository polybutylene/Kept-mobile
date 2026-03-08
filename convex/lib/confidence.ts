// convex/lib/confidence.ts
// Forecast confidence scoring based on data completeness

import { Doc } from "../_generated/dataModel";

export interface ConfidenceInput {
  home: Doc<"homes">;
  systems: Doc<"systems">[];
  systemTypes: Doc<"systemTypes">[];
  recentServiceEvents?: number; // Count of service events in last 2 years
}

export interface ConfidenceBreakdown {
  category: string;
  weight: number;
  score: number; // 0-100 for this category
  weightedScore: number; // score * weight
  missingFields: string[];
  improvementTip?: string;
}

export interface ConfidenceResult {
  score: number; // 0-100 overall
  level: "low" | "medium" | "high";
  breakdown: ConfidenceBreakdown[];
  topImprovements: string[]; // Top 3 actions to improve score
}

// Category weights (must sum to 1.0)
const WEIGHTS = {
  homeBasics: 0.20,      // yearBuilt, sqft, zipCode
  systemCoverage: 0.25,  // Having systems entered for major categories
  systemDetails: 0.35,   // installDate, manufacturer, model per system
  recentData: 0.10,      // lastServiceDate < 1yr on systems
  historicalActuals: 0.10, // Service events/invoices in last 2yrs
};

// Major system categories that should be present in most homes
const CORE_SYSTEM_CATEGORIES = ["hvac", "plumbing", "electrical", "appliances"];

/**
 * Calculate forecast confidence score based on data completeness
 */
export function calculateConfidence(input: ConfidenceInput): ConfidenceResult {
  const breakdown: ConfidenceBreakdown[] = [];

  // 1. Home Basics (20%)
  const homeBasicsResult = scoreHomeBasics(input.home);
  breakdown.push({
    category: "Home Basics",
    weight: WEIGHTS.homeBasics,
    score: homeBasicsResult.score,
    weightedScore: homeBasicsResult.score * WEIGHTS.homeBasics,
    missingFields: homeBasicsResult.missingFields,
    improvementTip: homeBasicsResult.tip,
  });

  // 2. System Coverage (25%)
  const systemCoverageResult = scoreSystemCoverage(input.systems, input.systemTypes);
  breakdown.push({
    category: "System Coverage",
    weight: WEIGHTS.systemCoverage,
    score: systemCoverageResult.score,
    weightedScore: systemCoverageResult.score * WEIGHTS.systemCoverage,
    missingFields: systemCoverageResult.missingCategories,
    improvementTip: systemCoverageResult.tip,
  });

  // 3. System Details (35%)
  const systemDetailsResult = scoreSystemDetails(input.systems);
  breakdown.push({
    category: "System Details",
    weight: WEIGHTS.systemDetails,
    score: systemDetailsResult.score,
    weightedScore: systemDetailsResult.score * WEIGHTS.systemDetails,
    missingFields: systemDetailsResult.missingFields,
    improvementTip: systemDetailsResult.tip,
  });

  // 4. Recent Data (10%)
  const recentDataResult = scoreRecentData(input.systems);
  breakdown.push({
    category: "Recent Service Data",
    weight: WEIGHTS.recentData,
    score: recentDataResult.score,
    weightedScore: recentDataResult.score * WEIGHTS.recentData,
    missingFields: recentDataResult.missingFields,
    improvementTip: recentDataResult.tip,
  });

  // 5. Historical Actuals (10%)
  const historicalResult = scoreHistoricalActuals(input.recentServiceEvents || 0);
  breakdown.push({
    category: "Historical Records",
    weight: WEIGHTS.historicalActuals,
    score: historicalResult.score,
    weightedScore: historicalResult.score * WEIGHTS.historicalActuals,
    missingFields: historicalResult.missingFields,
    improvementTip: historicalResult.tip,
  });

  // Calculate overall score
  const overallScore = Math.round(
    breakdown.reduce((sum, b) => sum + b.weightedScore, 0)
  );

  // Determine level
  const level = overallScore >= 70 ? "high" : overallScore >= 40 ? "medium" : "low";

  // Get top improvements
  const topImprovements = getTopImprovements(breakdown);

  return {
    score: overallScore,
    level,
    breakdown,
    topImprovements,
  };
}

function scoreHomeBasics(home: Doc<"homes">): { score: number; missingFields: string[]; tip?: string } {
  const fields = [
    { name: "Year Built", hasValue: !!home.yearBuilt, weight: 30 },
    { name: "Square Footage", hasValue: !!home.squareFootage, weight: 25 },
    { name: "ZIP Code", hasValue: !!home.zipCode, weight: 15 },
    { name: "Occupancy Type", hasValue: !!home.occupancyType, weight: 10 },
    { name: "Roof Age", hasValue: !!home.roofAgeYears, weight: 10 },
    { name: "Plumbing Material", hasValue: !!home.plumbingSupplyMaterial, weight: 10 },
  ];

  const totalWeight = fields.reduce((sum, f) => sum + f.weight, 0);
  const earnedWeight = fields.filter(f => f.hasValue).reduce((sum, f) => sum + f.weight, 0);
  const score = Math.round((earnedWeight / totalWeight) * 100);
  
  const missingFields = fields.filter(f => !f.hasValue).map(f => f.name);
  
  let tip: string | undefined;
  if (!home.yearBuilt) {
    tip = "Add your home's year built for more accurate system lifespan estimates";
  } else if (!home.squareFootage) {
    tip = "Add square footage to improve maintenance cost estimates";
  }

  return { score, missingFields, tip };
}

function scoreSystemCoverage(
  systems: Doc<"systems">[],
  systemTypes: Doc<"systemTypes">[]
): { score: number; missingCategories: string[]; tip?: string } {
  // Get categories of systems the user has
  const userCategories = new Set<string>();
  for (const system of systems) {
    if (system.isArchived) continue;
    const systemType = systemTypes.find(st => st._id === system.systemTypeId);
    if (systemType) {
      userCategories.add(systemType.category);
    }
  }

  // Check core categories
  const missingCategories: string[] = [];
  for (const category of CORE_SYSTEM_CATEGORIES) {
    if (!userCategories.has(category)) {
      missingCategories.push(category);
    }
  }

  // Score based on coverage
  const coveredCount = CORE_SYSTEM_CATEGORIES.length - missingCategories.length;
  const score = Math.round((coveredCount / CORE_SYSTEM_CATEGORIES.length) * 100);

  let tip: string | undefined;
  if (missingCategories.length > 0) {
    const categoryNames: Record<string, string> = {
      hvac: "HVAC",
      plumbing: "Plumbing",
      electrical: "Electrical",
      appliances: "Appliances",
    };
    tip = `Add your ${categoryNames[missingCategories[0]]} systems for a complete home profile`;
  }

  return { score, missingCategories, tip };
}

function scoreSystemDetails(systems: Doc<"systems">[]): { score: number; missingFields: string[]; tip?: string } {
  if (systems.length === 0) {
    return { 
      score: 0, 
      missingFields: ["No systems added"], 
      tip: "Add your home systems to enable forecasting" 
    };
  }

  const activeSystems = systems.filter(s => !s.isArchived);
  if (activeSystems.length === 0) {
    return { 
      score: 0, 
      missingFields: ["No active systems"], 
      tip: "Add your home systems to enable forecasting" 
    };
  }

  let totalPoints = 0;
  let earnedPoints = 0;
  const missingFieldsSet = new Set<string>();

  for (const system of activeSystems) {
    // Install date is most important (40 points)
    totalPoints += 40;
    if (system.installDate) {
      earnedPoints += 40;
    } else {
      missingFieldsSet.add("Install dates");
    }

    // Manufacturer (30 points)
    totalPoints += 30;
    if (system.manufacturer) {
      earnedPoints += 30;
    } else {
      missingFieldsSet.add("Manufacturer info");
    }

    // Model number (20 points)
    totalPoints += 20;
    if (system.modelNumber) {
      earnedPoints += 20;
    } else {
      missingFieldsSet.add("Model numbers");
    }

    // Serial number (10 points)
    totalPoints += 10;
    if (system.serialNumber) {
      earnedPoints += 10;
    } else {
      missingFieldsSet.add("Serial numbers");
    }
  }

  const score = Math.round((earnedPoints / totalPoints) * 100);
  const missingFields = Array.from(missingFieldsSet);

  let tip: string | undefined;
  if (missingFieldsSet.has("Install dates")) {
    tip = "Add install dates to your systems for accurate age-based forecasts";
  } else if (missingFieldsSet.has("Manufacturer info")) {
    tip = "Add manufacturer info for system-specific maintenance recommendations";
  }

  return { score, missingFields, tip };
}

function scoreRecentData(systems: Doc<"systems">[]): { score: number; missingFields: string[]; tip?: string } {
  const activeSystems = systems.filter(s => !s.isArchived);
  if (activeSystems.length === 0) {
    return { score: 0, missingFields: ["No systems"], tip: "Add systems to track service history" };
  }

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const oneYearAgoStr = oneYearAgo.toISOString().split("T")[0];

  let recentlyServicedCount = 0;
  for (const system of activeSystems) {
    if (system.lastServiceDate && system.lastServiceDate >= oneYearAgoStr) {
      recentlyServicedCount++;
    }
  }

  const score = Math.round((recentlyServicedCount / activeSystems.length) * 100);
  
  const missingFields: string[] = [];
  if (recentlyServicedCount < activeSystems.length) {
    missingFields.push(`${activeSystems.length - recentlyServicedCount} systems without recent service`);
  }

  let tip: string | undefined;
  if (score < 50) {
    tip = "Log recent service dates to improve forecast accuracy";
  }

  return { score, missingFields, tip };
}

function scoreHistoricalActuals(recentServiceEventCount: number): { score: number; missingFields: string[]; tip?: string } {
  // Score based on number of recorded service events in last 2 years
  // 0 events = 0%, 1 = 25%, 2 = 50%, 3 = 75%, 4+ = 100%
  const score = Math.min(100, recentServiceEventCount * 25);
  
  const missingFields: string[] = [];
  if (recentServiceEventCount === 0) {
    missingFields.push("No recorded invoices or service events");
  }

  let tip: string | undefined;
  if (recentServiceEventCount < 2) {
    tip = "Record past invoices to calibrate forecasts with actual costs";
  }

  return { score, missingFields, tip };
}

function getTopImprovements(breakdown: ConfidenceBreakdown[]): string[] {
  const improvements: { tip: string; potential: number }[] = [];

  for (const b of breakdown) {
    if (b.improvementTip && b.score < 100) {
      // Calculate potential improvement (how much this could help overall score)
      const potential = (100 - b.score) * b.weight;
      improvements.push({ tip: b.improvementTip, potential });
    }
  }

  // Sort by potential impact and take top 3
  improvements.sort((a, b) => b.potential - a.potential);
  return improvements.slice(0, 3).map(i => i.tip);
}

/**
 * Get a human-readable description of confidence level
 */
export function getConfidenceDescription(level: "low" | "medium" | "high"): string {
  switch (level) {
    case "high":
      return "Your forecast is well-calibrated based on detailed home and system data.";
    case "medium":
      return "Your forecast is reasonable but could be more accurate with additional details.";
    case "low":
      return "Your forecast is based on limited data. Add more details for better accuracy.";
  }
}

/**
 * Get the color for confidence level display
 */
export function getConfidenceColor(level: "low" | "medium" | "high"): string {
  switch (level) {
    case "high":
      return "emerald";
    case "medium":
      return "amber";
    case "low":
      return "red";
  }
}
