/**
 * Scan Result Validator
 *
 * Catches bad parses, OCR errors, and safety concerns before data
 * enters the system. Runs after Claude Vision extraction and serial
 * decoding to flag issues for user review.
 */

import type { DecodedPlateData } from "./modelDecoder";

export interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  safetyAlerts: string[];
  corrections: Array<{
    field: string;
    original: string;
    suggested: string;
    reason: string;
  }>;
  confidenceOverride?: "high" | "medium" | "low";
}

interface ScanExtraction {
  manufacturer?: string;
  modelNumber?: string;
  serialNumber?: string;
  yearManufactured?: string | number;
  confidence?: {
    overall?: string;
    modelNumber?: string;
    serialNumber?: string;
    manufacturer?: string;
    uncertainCharacters?: string[];
  };
  safetyFlags?: string[];
  plateQuality?: string;
}

const MAX_REASONABLE_AGE: Record<string, number> = {
  central_ac: 35,
  heat_pump: 30,
  furnace: 40,
  air_handler: 35,
  packaged_unit: 30,
  ductless_indoor: 25,
  ductless_outdoor: 25,
  multi_zone_outdoor: 25,
  water_heater_tank: 25,
  water_heater_tankless: 25,
  electrical_panel: 80,
  dishwasher: 25,
  refrigerator: 30,
  washer: 25,
  dryer: 30,
  range: 30,
  microwave: 20,
  garbage_disposal: 20,
  water_softener: 25,
};

const OCR_CONFUSION_PATTERNS: Array<{
  pattern: RegExp;
  suggestion: string;
  reason: string;
}> = [
  { pattern: /O(\d)/, suggestion: "0$1", reason: "Letter O may be digit 0" },
  { pattern: /(\d)O/, suggestion: "$10", reason: "Letter O may be digit 0" },
  { pattern: /l(\d)/, suggestion: "1$1", reason: "Lowercase L may be digit 1" },
  { pattern: /I(\d{2,})/, suggestion: "1$1", reason: "Letter I may be digit 1" },
  { pattern: /(\d)I(\d)/, suggestion: "$11$2", reason: "Letter I may be digit 1" },
  { pattern: /S(\d{2,})/, suggestion: "5$1", reason: "Letter S may be digit 5" },
  { pattern: /(\d)B(\d)/, suggestion: "$18$2", reason: "Letter B may be digit 8" },
  { pattern: /Z(\d{2,})/, suggestion: "2$1", reason: "Letter Z may be digit 2" },
];

const DEFECTIVE_EQUIPMENT: Array<{
  patterns: string[];
  alert: string;
}> = [
  {
    patterns: ["federal pacific", "fpe", "stab-lok", "stab lok", "federal pacific electric"],
    alert: "⚠️ SAFETY: Federal Pacific (FPE) Stab-Lok panel detected. These panels have a documented high failure rate — breakers may not trip under overload. Recommend immediate evaluation by a licensed electrician.",
  },
  {
    patterns: ["zinsco", "gte sylvania", "sylvania-zinsco", "magnetrip"],
    alert: "⚠️ SAFETY: Zinsco panel detected. These panels have known breaker failure issues — breakers may melt to the bus bar and fail to trip. Recommend evaluation by a licensed electrician.",
  },
  {
    patterns: ["polybutylene", "poly-b", "pb pipe", "quest", "vanguard"],
    alert: "⚠️ MATERIAL: Polybutylene piping component detected. This material is known to be failure-prone. Recommend professional evaluation for replacement.",
  },
  {
    patterns: ["kitec"],
    alert: "⚠️ MATERIAL: Kitec plumbing detected. This product is subject to a class-action settlement due to premature failure. Recommend professional evaluation.",
  },
];

export function validateScanResult(
  extraction: ScanExtraction,
  decoded: DecodedPlateData | null,
  equipmentType?: string,
): ValidationResult {
  const warnings: string[] = [];
  const safetyAlerts: string[] = [];
  const corrections: ValidationResult["corrections"] = [];
  const currentYear = new Date().getFullYear();

  // 1. Propagate safety flags from Claude Vision
  if (extraction.safetyFlags?.length) {
    safetyAlerts.push(...extraction.safetyFlags);
  }

  // 2. Date sanity checks
  const decodedYear = decoded?.manufactureYear;
  const explicitYear = extraction.yearManufactured
    ? parseInt(String(extraction.yearManufactured), 10)
    : null;
  const effectiveYear = (explicitYear && !isNaN(explicitYear)) ? explicitYear : decodedYear;

  if (effectiveYear) {
    if (effectiveYear > currentYear + 1) {
      warnings.push(
        `Decoded manufacture year (${effectiveYear}) is in the future. The serial number may have been misread.`
      );
    }
    if (effectiveYear < 1960) {
      warnings.push(
        `Decoded manufacture year (${effectiveYear}) seems too old. Please verify the serial number.`
      );
    }

    const eqType = decoded?.equipmentType || equipmentType || "";
    const maxAge = MAX_REASONABLE_AGE[eqType] || 50;
    const age = currentYear - effectiveYear;
    if (age > maxAge) {
      warnings.push(
        `Decoded age (${age} years) exceeds typical maximum for this equipment type (${maxAge} years). The date may be incorrect or this unit has been replaced.`
      );
    }

    // Cross-validate explicit date vs decoded date
    if (explicitYear && decodedYear && Math.abs(explicitYear - decodedYear) > 2) {
      warnings.push(
        `Plate date (${explicitYear}) differs from serial decode (${decodedYear}) by ${Math.abs(explicitYear - decodedYear)} years. The explicitly printed date is used. Verify if the serial was read correctly.`
      );
    }
  }

  // 3. Model number OCR error detection
  if (extraction.modelNumber) {
    for (const { pattern, suggestion, reason } of OCR_CONFUSION_PATTERNS) {
      if (pattern.test(extraction.modelNumber)) {
        const corrected = extraction.modelNumber.replace(pattern, suggestion);
        corrections.push({
          field: "modelNumber",
          original: extraction.modelNumber,
          suggested: corrected,
          reason,
        });
      }
    }
  }

  // 4. Serial number OCR error detection
  if (extraction.serialNumber) {
    for (const { pattern, suggestion, reason } of OCR_CONFUSION_PATTERNS) {
      if (pattern.test(extraction.serialNumber)) {
        const corrected = extraction.serialNumber.replace(pattern, suggestion);
        corrections.push({
          field: "serialNumber",
          original: extraction.serialNumber,
          suggested: corrected,
          reason,
        });
      }
    }
  }

  // 5. Serial number length checks
  if (extraction.serialNumber) {
    if (extraction.serialNumber.length < 6) {
      warnings.push("Serial number seems too short. Part of the number may be missing.");
    }
    if (extraction.serialNumber.length > 20) {
      warnings.push("Serial number seems unusually long. It may include adjacent text from the plate.");
    }
  }

  // 6. Known defective equipment detection
  const allText = [
    extraction.manufacturer || "",
    extraction.modelNumber || "",
    extraction.serialNumber || "",
  ].join(" ").toLowerCase();

  for (const defect of DEFECTIVE_EQUIPMENT) {
    for (const pattern of defect.patterns) {
      if (allText.includes(pattern)) {
        safetyAlerts.push(defect.alert);
        break;
      }
    }
  }

  // 7. R-22 refrigerant warning (phased out)
  if (allText.includes("r-22") || allText.includes("r22") || allText.includes("freon")) {
    warnings.push(
      "This unit uses R-22 refrigerant, which has been phased out. Replacement refrigerant is expensive. Consider replacement when this unit fails."
    );
  }

  // 8. Confidence assessment
  if (extraction.confidence?.uncertainCharacters?.length) {
    warnings.push(
      `Some characters were uncertain: ${extraction.confidence.uncertainCharacters.join("; ")}. Please verify these fields.`
    );
  }

  if (extraction.plateQuality === "poor") {
    warnings.push(
      "The plate photo quality was poor. Consider rescanning in better lighting or cleaning the plate surface."
    );
  }

  // 9. Cross-validate manufacturer vs model prefix
  if (extraction.manufacturer && extraction.modelNumber) {
    const mfr = extraction.manufacturer.toLowerCase();
    const model = extraction.modelNumber.toUpperCase();
    const mismatch = checkManufacturerModelMismatch(mfr, model);
    if (mismatch) {
      warnings.push(mismatch);
    }
  }

  // Determine overall validity
  const hasSafetyIssue = safetyAlerts.length > 0;
  const hasLowConfidence = extraction.confidence?.overall === "low";
  const isValid = !hasLowConfidence;

  let confidenceOverride: ValidationResult["confidenceOverride"];
  if (hasLowConfidence || extraction.plateQuality === "poor") {
    confidenceOverride = "low";
  } else if (warnings.length > 2 || corrections.length > 1) {
    confidenceOverride = "medium";
  }

  return {
    isValid,
    warnings,
    safetyAlerts,
    corrections,
    confidenceOverride,
  };
}

function checkManufacturerModelMismatch(mfr: string, model: string): string | null {
  const checks: Array<{ mfrPatterns: string[]; modelPrefixes: string[] }> = [
    { mfrPatterns: ["carrier", "bryant", "payne"], modelPrefixes: ["24", "25", "38", "40", "48", "50", "58", "59", "FX"] },
    { mfrPatterns: ["goodman", "amana", "daikin"], modelPrefixes: ["GSX", "GSZ", "GMS", "GMV", "GME", "GSXC", "GSZC", "ASX", "ASZ", "ARUF", "ASPT"] },
    { mfrPatterns: ["trane", "american standard"], modelPrefixes: ["4TT", "4TW", "TWR", "TUH", "TDD", "TWE", "S9V", "TEM"] },
    { mfrPatterns: ["lennox"], modelPrefixes: ["XC", "EL", "SL", "ML", "14AC", "13AC"] },
    { mfrPatterns: ["bosch", "thermador"], modelPrefixes: ["SH", "B0", "HM"] },
  ];

  for (const check of checks) {
    const mfrMatch = check.mfrPatterns.some((p) => mfr.includes(p));
    if (mfrMatch) {
      const prefixMatch = check.modelPrefixes.some((p) => model.startsWith(p));
      if (!prefixMatch && model.length >= 3) {
        return `Model number prefix "${model.substring(0, 3)}" doesn't match expected format for ${mfr}. The manufacturer or model number may have been misread.`;
      }
      break;
    }
  }

  return null;
}
