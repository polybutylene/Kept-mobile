// convex/lib/forecastDiff.ts
// Forecast diff engine for comparing snapshots and explaining changes

import { Doc } from "../_generated/dataModel";

export interface ForecastSummary {
  year1Total: number;
  year5Total: number;
  year10Total: number;
}

export interface ForecastChange {
  field: string;
  oldValue?: string;
  newValue: string;
  impactDescription: string;
  costDelta?: number;
}

export interface ForecastDiff {
  hasChanges: boolean;
  summary: {
    year1Delta: number;
    year5Delta: number;
    year10Delta: number;
    overallDirection: "increase" | "decrease" | "unchanged";
    percentChange: number;
  };
  changes: ForecastChange[];
  explanation: string;
}

/**
 * Compare two forecast snapshots and generate a human-readable diff
 */
export function compareForecastSnapshots(
  oldSnapshot: Doc<"forecastSnapshots"> | null,
  newSnapshot: {
    forecastSummary: ForecastSummary;
    confidenceScore: number;
    changes?: ForecastChange[];
  }
): ForecastDiff {
  if (!oldSnapshot) {
    return {
      hasChanges: true,
      summary: {
        year1Delta: newSnapshot.forecastSummary.year1Total,
        year5Delta: newSnapshot.forecastSummary.year5Total,
        year10Delta: newSnapshot.forecastSummary.year10Total,
        overallDirection: "unchanged",
        percentChange: 0,
      },
      changes: newSnapshot.changes || [],
      explanation: "This is your first forecast. As you add more data, your forecast will become more accurate.",
    };
  }

  const year1Delta = newSnapshot.forecastSummary.year1Total - oldSnapshot.forecastSummary.year1Total;
  const year5Delta = newSnapshot.forecastSummary.year5Total - oldSnapshot.forecastSummary.year5Total;
  const year10Delta = newSnapshot.forecastSummary.year10Total - oldSnapshot.forecastSummary.year10Total;

  // Calculate overall percent change based on 5-year forecast (most relevant)
  const percentChange = oldSnapshot.forecastSummary.year5Total > 0
    ? Math.round((year5Delta / oldSnapshot.forecastSummary.year5Total) * 100)
    : 0;

  const overallDirection: "increase" | "decrease" | "unchanged" = 
    year5Delta > 100 ? "increase" : 
    year5Delta < -100 ? "decrease" : 
    "unchanged";

  const changes = newSnapshot.changes || [];
  const explanation = generateExplanation(changes, overallDirection, percentChange);

  return {
    hasChanges: changes.length > 0 || Math.abs(percentChange) > 1,
    summary: {
      year1Delta,
      year5Delta,
      year10Delta,
      overallDirection,
      percentChange,
    },
    changes,
    explanation,
  };
}

/**
 * Generate a human-readable explanation of forecast changes
 */
function generateExplanation(
  changes: ForecastChange[],
  direction: "increase" | "decrease" | "unchanged",
  percentChange: number
): string {
  if (changes.length === 0) {
    return "No significant changes to your forecast.";
  }

  const parts: string[] = [];

  // Summarize the overall change
  if (direction === "increase") {
    parts.push(`Your forecast increased by ${Math.abs(percentChange)}%.`);
  } else if (direction === "decrease") {
    parts.push(`Your forecast decreased by ${Math.abs(percentChange)}%.`);
  }

  // Add specific change explanations
  const significantChanges = changes.filter(c => c.costDelta && Math.abs(c.costDelta) > 50);
  if (significantChanges.length > 0) {
    const changeDescriptions = significantChanges
      .slice(0, 2) // Limit to 2 for readability
      .map(c => c.impactDescription);
    parts.push(...changeDescriptions);
  }

  return parts.join(" ");
}

/**
 * Create change records when home data is updated
 */
export function createHomeUpdateChanges(
  oldHome: Doc<"homes">,
  newData: Partial<Doc<"homes">>
): ForecastChange[] {
  const changes: ForecastChange[] = [];

  // Year built change
  if (newData.yearBuilt !== undefined && newData.yearBuilt !== oldHome.yearBuilt) {
    const oldAge = oldHome.yearBuilt ? new Date().getFullYear() - oldHome.yearBuilt : undefined;
    const newAge = newData.yearBuilt ? new Date().getFullYear() - newData.yearBuilt : undefined;
    
    changes.push({
      field: "yearBuilt",
      oldValue: oldHome.yearBuilt?.toString(),
      newValue: newData.yearBuilt.toString(),
      impactDescription: newAge 
        ? `Home age updated to ${newAge} years, improving system age estimates.`
        : "Home year built updated.",
    });
  }

  // Square footage change
  if (newData.squareFootage !== undefined && newData.squareFootage !== oldHome.squareFootage) {
    changes.push({
      field: "squareFootage",
      oldValue: oldHome.squareFootage?.toString(),
      newValue: newData.squareFootage.toString(),
      impactDescription: "Square footage updated, adjusting maintenance cost estimates.",
    });
  }

  // Roof age change
  if (newData.roofAgeYears !== undefined && newData.roofAgeYears !== oldHome.roofAgeYears) {
    changes.push({
      field: "roofAgeYears",
      oldValue: oldHome.roofAgeYears?.toString(),
      newValue: newData.roofAgeYears.toString(),
      impactDescription: `Roof age set to ${newData.roofAgeYears} years, updating replacement forecast.`,
    });
  }

  // Plumbing material change
  if (newData.plumbingSupplyMaterial !== undefined && newData.plumbingSupplyMaterial !== oldHome.plumbingSupplyMaterial) {
    const materialDescriptions: Record<string, string> = {
      copper: "Copper pipes typically last 50-70 years.",
      pex: "PEX pipes have a lifespan of 40-50 years.",
      galvanized: "Galvanized pipes may need replacement after 20-50 years.",
      cpvc: "CPVC pipes last around 50-75 years.",
      unknown: "Plumbing material set as unknown.",
    };
    
    changes.push({
      field: "plumbingSupplyMaterial",
      oldValue: oldHome.plumbingSupplyMaterial,
      newValue: newData.plumbingSupplyMaterial,
      impactDescription: materialDescriptions[newData.plumbingSupplyMaterial] || "Plumbing material updated.",
    });
  }

  // Drain material change
  if (newData.drainMaterialType !== undefined && newData.drainMaterialType !== oldHome.drainMaterialType) {
    changes.push({
      field: "drainMaterialType",
      oldValue: oldHome.drainMaterialType,
      newValue: newData.drainMaterialType,
      impactDescription: "Drain material updated, adjusting plumbing forecast.",
    });
  }

  return changes;
}

/**
 * Create change records when a system is added or updated
 */
export function createSystemChangeRecord(
  action: "added" | "updated" | "removed",
  systemName: string,
  details?: { field?: string; oldValue?: string; newValue?: string }
): ForecastChange {
  switch (action) {
    case "added":
      return {
        field: "system",
        newValue: systemName,
        impactDescription: `Added ${systemName} to your home, updating maintenance and replacement forecasts.`,
      };
    case "removed":
      return {
        field: "system",
        oldValue: systemName,
        newValue: "removed",
        impactDescription: `Removed ${systemName} from forecast.`,
      };
    case "updated":
      return {
        field: details?.field || "system",
        oldValue: details?.oldValue,
        newValue: details?.newValue || systemName,
        impactDescription: `Updated ${systemName} details, refining forecast accuracy.`,
      };
  }
}

/**
 * Create change record when an invoice is added
 */
export function createInvoiceChangeRecord(
  eventType: string,
  systemName: string | undefined,
  actualCost: number,
  estimatedCost: number | undefined
): ForecastChange {
  const costDelta = estimatedCost ? actualCost - estimatedCost : undefined;
  
  let impactDescription: string;
  if (costDelta !== undefined) {
    if (costDelta > 0) {
      impactDescription = `Actual cost was $${Math.abs(costDelta).toFixed(0)} higher than estimated. Future forecasts adjusted.`;
    } else if (costDelta < 0) {
      impactDescription = `Actual cost was $${Math.abs(costDelta).toFixed(0)} lower than estimated. Future forecasts adjusted.`;
    } else {
      impactDescription = "Actual cost matched estimate. Forecast validated.";
    }
  } else {
    impactDescription = `Recorded ${eventType} for ${systemName || "home"}. This data improves forecast accuracy.`;
  }

  return {
    field: "serviceEvent",
    newValue: `${eventType}: $${actualCost.toFixed(0)}`,
    impactDescription,
    costDelta,
  };
}

/**
 * Format a cost delta for display
 */
export function formatCostDelta(delta: number): string {
  if (delta === 0) return "No change";
  const sign = delta > 0 ? "+" : "";
  return `${sign}$${delta.toLocaleString()}`;
}

/**
 * Get a color class for a cost delta
 */
export function getCostDeltaColor(delta: number): string {
  if (delta > 0) return "text-red-600"; // Increase = bad (costs more)
  if (delta < 0) return "text-emerald-600"; // Decrease = good (costs less)
  return "text-gray-500";
}

/**
 * Format percentage change for display
 */
export function formatPercentChange(percent: number): string {
  if (percent === 0) return "unchanged";
  const sign = percent > 0 ? "+" : "";
  return `${sign}${percent}%`;
}
