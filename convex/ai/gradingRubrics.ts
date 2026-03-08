/**
 * Condition Grading Rubrics
 *
 * 1-10 scale definitions for AI condition assessment.
 * System-specific criteria augment the base rubric.
 */

import { GradeDefinition } from "./prompts";

export const BASE_RUBRIC: GradeDefinition[] = [
  { grade: 10, label: "Excellent / New", description: "New or like-new condition. No visible wear, damage, corrosion, or aging. All labels and markings are clean and legible. Installation appears professional and complete." },
  { grade: 9, label: "Near Perfect", description: "Minimal signs of use. Negligible cosmetic wear. Fully functional appearance. Would be difficult to distinguish from new without close inspection." },
  { grade: 8, label: "Very Good", description: "Light cosmetic wear consistent with age. Minor dust or surface discoloration. All components appear intact and properly connected. No functional concerns visible." },
  { grade: 7, label: "Good", description: "Normal wear for age. Some surface discoloration, minor cosmetic blemishes. No signs of leaking, corrosion, or mechanical damage. Well-maintained appearance." },
  { grade: 6, label: "Above Average", description: "Moderate wear visible but no red flags. Some accumulated grime, light surface oxidation, or cosmetic damage. Appears functional but could benefit from maintenance." },
  { grade: 5, label: "Average / Fair", description: "Typical condition for a system past its midlife. Noticeable wear, some surface corrosion or discoloration. May have minor cosmetic damage. Maintenance is due or overdue." },
  { grade: 4, label: "Below Average", description: "Significant wear visible. Moderate corrosion, staining, or physical deterioration. One or more components show signs of age-related degradation. Professional inspection recommended." },
  { grade: 3, label: "Poor", description: "Substantial deterioration. Heavy corrosion, visible damage, potential leaks, or compromised connections. Multiple signs of advanced aging. Repair or replacement planning should begin." },
  { grade: 2, label: "Very Poor", description: "Severe deterioration. Major structural, mechanical, or safety concerns visible. Active damage, extensive corrosion, evidence of failure or malfunction. Immediate professional assessment needed." },
  { grade: 1, label: "Critical / Failed", description: "System appears non-functional, dangerous, or has clearly failed. Evidence of active failure: flooding, fire damage, structural collapse, or electrical hazard. Immediate action required." },
];

export const SYSTEM_SPECIFIC_CRITERIA: Record<string, string[]> = {
  hvac: [
    "Check for refrigerant line insulation condition",
    "Look for ice buildup or unusual frost patterns",
    "Assess condenser coil cleanliness and fin condition",
    "Check for vibration damage or loose mounting",
    "Look for electrical connection condition at disconnect",
  ],
  plumbing: [
    "Check for mineral buildup at connections and valves",
    "Look for water staining suggesting slow leaks",
    "Assess pipe material and any galvanic corrosion at transitions",
    "Check for proper support and hanging of exposed pipes",
    "Look for signs of previous repairs (patches, clamps, tape)",
  ],
  electrical: [
    "Check for double-tapped breakers",
    "Look for scorch marks or discoloration on breakers or bus bars",
    "Assess wire condition where visible (cracking, discoloration)",
    "Check for proper neutral-ground bonding",
    "Look for evidence of DIY modifications or non-standard wiring",
  ],
  appliances: [
    "Check for unusual wear patterns on seals and gaskets",
    "Look for rust or corrosion on exposed metal components",
    "Assess overall cleanliness (indicates maintenance habits)",
    "Check for water staining underneath or behind the unit",
    "Look for model/serial label readability for age verification",
  ],
  structural: [
    "Check for cracks in foundation, walls, or beams",
    "Look for sagging or uneven floors",
    "Assess moisture damage or water intrusion signs",
    "Check for pest damage (termites, carpenter ants)",
    "Look for settlement cracks vs structural cracks",
  ],
  exterior: [
    "Check for curling, cracking, or missing shingles",
    "Look for granule loss in gutters",
    "Assess flashing condition around penetrations and valleys",
    "Check for sagging or uneven roof lines",
    "Look for moss, algae, or mold growth",
  ],
};
