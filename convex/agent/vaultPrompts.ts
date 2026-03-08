/**
 * AI Analysis Prompt Templates for the Document & Image Vault.
 *
 * These templates are designed for Claude's vision capabilities and will be used
 * when condition grading and code compliance features are enabled.
 *
 * STATUS: STUBBED — Not called by any production code yet.
 */

// ════════════════════════════════════════════════════════════════════
// SYSTEM CATEGORIES
// ════════════════════════════════════════════════════════════════════

export type SystemCategory =
  | "hvac"
  | "plumbing"
  | "electrical"
  | "appliances"
  | "structural"
  | "exterior";

// ════════════════════════════════════════════════════════════════════
// CONDITION GRADING PROMPTS
// ════════════════════════════════════════════════════════════════════

/**
 * Prompts for AI condition grading, one per system category.
 * Each prompt asks Claude Vision to assess a photo and return a structured
 * condition grade (1-10) with notes and confidence.
 */
export const CONDITION_GRADE_PROMPTS: Record<SystemCategory, string> = {
  hvac: `You are an experienced HVAC technician assessing the condition of an HVAC system from a photo.

Evaluate the following aspects visible in the image:
- Overall unit cleanliness and physical condition
- Rust, corrosion, or oxidation on the cabinet, coils, or connections
- Condition of the condenser/evaporator fins (bent, damaged, dirty)
- Visible refrigerant or oil stains suggesting leaks
- Condition of electrical connections, wiring, and disconnect
- Ductwork condition (if visible): tears, gaps, sagging, mold
- Age-related wear patterns (faded labels, worn paint, degraded rubber)
- Drainage: condensate line condition, standing water
- Any visible modifications, patches, or repairs

Return a JSON object with:
{
  "conditionGrade": <1-10 integer>,
  "conditionNotes": "<2-3 sentence assessment>",
  "conditionConfidence": <0.0-1.0>,
  "keyObservations": ["<specific observations from the image>"],
  "recommendedActions": ["<if any immediate concerns>"]
}`,

  plumbing: `You are a licensed master plumber assessing the condition of a plumbing system or component from a photo.

Evaluate the following aspects visible in the image:
- Pipe material and condition (copper: green patina/pinhole potential; galvanized: rust/scale; PVC: yellowing/brittleness; PEX: UV exposure)
- Joint and fitting condition (soldered, threaded, crimped, push-fit)
- Signs of active or past leaks (water stains, mineral deposits, corrosion)
- Water heater condition (if visible): tank condition, anode rod access, T&P valve, sediment buildup
- Valve condition: corrosion, mineral buildup, handle integrity
- Supply line condition: braided stainless vs. rubber, age indicators
- Drainage: proper slope, trap condition, clean-out access
- Code compliance indicators: proper strapping, clearances, expansion tanks

Return a JSON object with:
{
  "conditionGrade": <1-10 integer>,
  "conditionNotes": "<2-3 sentence assessment>",
  "conditionConfidence": <0.0-1.0>,
  "keyObservations": ["<specific observations from the image>"],
  "recommendedActions": ["<if any immediate concerns>"]
}`,

  electrical: `You are a licensed electrician assessing the condition of an electrical system from a photo.

Evaluate the following aspects visible in the image:
- Panel condition: rust, heat damage, scorch marks, melted components
- Panel brand (flag Federal Pacific/Stab-Lok, Zinsco, or Pushmatic as safety hazards)
- Breaker condition: proper seating, signs of tripping, double-tapped breakers
- Wiring condition: insulation integrity, proper colors, aluminum vs. copper
- Grounding: visible ground bus, green/bare copper
- GFCI/AFCI protection presence where visible
- Junction boxes: properly covered, not overfilled
- Conduit and wire management: professional vs. amateur installation
- Signs of DIY work or unpermitted modifications
- Labeling: panel schedule accuracy

Return a JSON object with:
{
  "conditionGrade": <1-10 integer>,
  "conditionNotes": "<2-3 sentence assessment>",
  "conditionConfidence": <0.0-1.0>,
  "keyObservations": ["<specific observations from the image>"],
  "recommendedActions": ["<if any immediate concerns>"],
  "safetyFlags": ["<any immediate safety concerns>"]
}`,

  appliances: `You are a home appliance technician assessing the condition of a home appliance from a photo.

Evaluate the following aspects visible in the image:
- Overall physical condition and cleanliness
- Control panel condition: buttons, displays, knobs
- Door/lid condition: seals, gaskets, hinges
- Internal components (if visible): racks, shelves, filters, drums
- Signs of water damage, rust, or corrosion
- Model/age indicators from data plates or serial numbers
- Noise or vibration indicators (loose parts, worn mounts)
- Signs of previous repairs

Return a JSON object with:
{
  "conditionGrade": <1-10 integer>,
  "conditionNotes": "<2-3 sentence assessment>",
  "conditionConfidence": <0.0-1.0>,
  "keyObservations": ["<specific observations from the image>"],
  "recommendedActions": ["<if any immediate concerns>"]
}`,

  structural: `You are a home inspector assessing the structural condition of a home component from a photo.

Evaluate the following aspects visible in the image:
- Foundation: cracks (hairline vs. structural), efflorescence, water intrusion
- Framing: wood rot, insect damage, sagging, improper notching/boring
- Load-bearing indicators: header condition, post/beam connections
- Moisture damage: staining, mold, swelling, delamination
- Insulation condition (if visible): gaps, compression, moisture damage
- Crawlspace/basement conditions: standing water, vapor barrier, ventilation

Return a JSON object with:
{
  "conditionGrade": <1-10 integer>,
  "conditionNotes": "<2-3 sentence assessment>",
  "conditionConfidence": <0.0-1.0>,
  "keyObservations": ["<specific observations from the image>"],
  "recommendedActions": ["<if any immediate concerns>"]
}`,

  exterior: `You are a home inspector assessing the exterior condition of a home from a photo.

Evaluate the following aspects visible in the image:
- Roofing: shingle condition (curling, cracking, granule loss, missing), flashing, ridge caps
- Siding: condition, gaps, rot, paint/stain deterioration
- Windows: seal condition, glazing, frame integrity, water damage
- Gutters: sagging, debris, damage, proper slope, downspout connections
- Trim and fascia: rot, paint condition, animal damage
- Grading and drainage: proper slope away from foundation
- Decking/porches: structural integrity, surface condition, railing security

Return a JSON object with:
{
  "conditionGrade": <1-10 integer>,
  "conditionNotes": "<2-3 sentence assessment>",
  "conditionConfidence": <0.0-1.0>,
  "keyObservations": ["<specific observations from the image>"],
  "recommendedActions": ["<if any immediate concerns>"]
}`,
};

// ════════════════════════════════════════════════════════════════════
// CODE COMPLIANCE PROMPTS
// ════════════════════════════════════════════════════════════════════

/**
 * Prompts for AI code compliance checking, one per relevant system category.
 * These prompt Claude Vision to assess installations against building codes.
 */
export const COMPLIANCE_CHECK_PROMPTS: Record<string, string> = {
  plumbing: `You are a building code inspector reviewing a plumbing installation for compliance with the International Residential Code (IRC) and the Uniform Plumbing Code (UPC).

Assess the following in the image:
- Water heater: earthquake strapping (IRC M2005.1), T&P valve discharge (IRC P2804.6.1), expansion tank (IRC P2903.4.1), clearances from combustibles, venting (gas units), drain pan
- Supply lines: proper support/strapping intervals (IRC P2605), material compatibility, isolation valves
- Drain lines: proper slope (1/4" per foot), trap configurations, cleanout access (IRC P3005)
- Connections: approved fittings for the pipe material, no mixing incompatible metals without dielectric unions
- Venting: proper vent sizing and termination, AAV usage compliance

For each potential issue, return:
{
  "complianceFlags": [
    {
      "code": "<IRC/UPC section>",
      "description": "<human-readable issue>",
      "severity": "info" | "warning" | "violation",
      "recommendation": "<what to do about it>"
    }
  ]
}`,

  electrical: `You are a building code inspector reviewing an electrical installation for compliance with the National Electrical Code (NEC/NFPA 70).

Assess the following in the image:
- Panel: proper labeling, working clearance (NEC 110.26), breaker compatibility, no double-tapped breakers
- Wiring: proper gauge for circuit amperage, correct color coding, no exposed conductors
- GFCI: required in kitchens, bathrooms, garages, outdoors, unfinished basements (NEC 210.8)
- AFCI: required in bedrooms and living areas (NEC 210.12)
- Junction boxes: properly covered, not overfilled (NEC 314.16)
- Grounding: continuous ground path, proper bonding
- Panel brand safety: Flag Federal Pacific/Stab-Lok, Zinsco, or Pushmatic panels

For each potential issue, return:
{
  "complianceFlags": [
    {
      "code": "<NEC section>",
      "description": "<human-readable issue>",
      "severity": "info" | "warning" | "violation",
      "recommendation": "<what to do about it>"
    }
  ]
}`,

  hvac: `You are a building code inspector reviewing an HVAC installation for compliance with the International Mechanical Code (IMC) and International Residential Code (IRC).

Assess the following in the image:
- Equipment clearances from combustibles (IRC M1306)
- Combustion air requirements for gas appliances (IRC G2407)
- Venting: proper B-vent or direct vent installation, clearances, termination (IRC G2427)
- Refrigerant line insulation
- Condensate disposal: proper drainage, trap, and termination (IRC M1411)
- Ductwork: proper connections, sealing, support, and insulation (IRC M1601)
- Disconnect: required within sight of equipment (NEC 440.14)
- Filter access

For each potential issue, return:
{
  "complianceFlags": [
    {
      "code": "<IRC/IMC section>",
      "description": "<human-readable issue>",
      "severity": "info" | "warning" | "violation",
      "recommendation": "<what to do about it>"
    }
  ]
}`,

  structural: `You are a building inspector reviewing a structural installation for compliance with the International Residential Code (IRC).

Assess the following in the image:
- Foundation: proper reinforcement, cracks that may indicate settlement
- Framing: proper fastener patterns, header sizing, load path continuity (IRC R602)
- Roof framing: rafter/truss connections, hurricane clips/straps (IRC R802)
- Deck: proper ledger board attachment, joist hangers, post bases (IRC R507)
- Guardrails: height (36" min residential), baluster spacing (4" max), structural attachment

For each potential issue, return:
{
  "complianceFlags": [
    {
      "code": "<IRC section>",
      "description": "<human-readable issue>",
      "severity": "info" | "warning" | "violation",
      "recommendation": "<what to do about it>"
    }
  ]
}`,
};

// ════════════════════════════════════════════════════════════════════
// GRADING RUBRICS
// ════════════════════════════════════════════════════════════════════

export interface GradeDefinition {
  grade: number;
  label: string;
  description: string;
}

/**
 * What each condition grade (1-10) means for each system type.
 * Used by the AI prompt as a grading rubric and by the UI for display.
 */
export const GRADING_RUBRICS: Record<SystemCategory, GradeDefinition[]> = {
  hvac: [
    { grade: 10, label: "Excellent", description: "New or like-new condition. No visible wear, corrosion, or damage. Clean coils, intact fins, clear drain." },
    { grade: 9, label: "Very Good", description: "Minor cosmetic marks. All components intact and clean. No functional concerns." },
    { grade: 8, label: "Good", description: "Minor surface oxidation or dirt. Fins slightly bent in places. Overall well-maintained." },
    { grade: 7, label: "Above Average", description: "Some surface rust or dirt buildup. Fins moderately bent. Drain line shows minor algae." },
    { grade: 6, label: "Fair", description: "Moderate rust, dirt accumulation. Noticeable wear on components. May need service soon." },
    { grade: 5, label: "Below Average", description: "Significant dirt/debris. Rust spreading. Fins badly bent in sections. Overdue for maintenance." },
    { grade: 4, label: "Poor", description: "Heavy corrosion. Components visibly degraded. Refrigerant or oil stains suggest leaks." },
    { grade: 3, label: "Very Poor", description: "Severe deterioration. Major rust, damaged components, possible refrigerant leak evidence." },
    { grade: 2, label: "Critical", description: "Extensive damage. Unit barely functional. Safety concerns possible (electrical, gas)." },
    { grade: 1, label: "Failed", description: "Unit non-functional or dangerous. Immediate replacement required." },
  ],

  plumbing: [
    { grade: 10, label: "Excellent", description: "New installation. Clean pipes, proper supports, no signs of any wear." },
    { grade: 9, label: "Very Good", description: "Like-new. Minor patina on copper. All joints dry. Proper strapping." },
    { grade: 8, label: "Good", description: "Normal aging. Slight mineral deposits. All connections secure and dry." },
    { grade: 7, label: "Above Average", description: "Some mineral buildup. Minor surface corrosion. No active leaks." },
    { grade: 6, label: "Fair", description: "Moderate mineral deposits. Green corrosion on copper fittings. Aging supply lines." },
    { grade: 5, label: "Below Average", description: "Notable corrosion. Staining suggests past minor leak. Valves showing wear." },
    { grade: 4, label: "Poor", description: "Active corrosion spreading. Water stains indicating recurring moisture. Pipes showing age." },
    { grade: 3, label: "Very Poor", description: "Severe corrosion, pinhole leak risk high. Galvanized pipes with heavy scale buildup." },
    { grade: 2, label: "Critical", description: "Active leaks or imminent failure. Polybutylene or severely corroded galvanized throughout." },
    { grade: 1, label: "Failed", description: "Active flooding or complete system failure. Emergency replacement needed." },
  ],

  electrical: [
    { grade: 10, label: "Excellent", description: "Modern panel, proper labeling, all breakers seated, GFCI/AFCI protected where required." },
    { grade: 9, label: "Very Good", description: "Well-organized panel. Minor cosmetic wear. All circuits properly sized." },
    { grade: 8, label: "Good", description: "Functional panel. Most circuits labeled. Some minor housekeeping needed." },
    { grade: 7, label: "Above Average", description: "Panel shows age but functions properly. Labeling incomplete. All breakers seated." },
    { grade: 6, label: "Fair", description: "Aging panel. Some missing knockouts or labels. GFCI protection may be incomplete." },
    { grade: 5, label: "Below Average", description: "Panel approaching end of life. Double-tapped breakers. Missing GFCI/AFCI protection." },
    { grade: 4, label: "Poor", description: "Significant concerns. Corrosion, improper wiring, overloaded circuits visible." },
    { grade: 3, label: "Very Poor", description: "Major safety concerns. Exposed wiring, burnt connections, or recalled panel brand." },
    { grade: 2, label: "Critical", description: "Dangerous condition. Federal Pacific, Zinsco, or severely damaged panel. Immediate replacement." },
    { grade: 1, label: "Failed", description: "Active electrical hazard. Fire risk. Do not use — call electrician immediately." },
  ],

  appliances: [
    { grade: 10, label: "Excellent", description: "New or like-new. All functions working perfectly. No cosmetic damage." },
    { grade: 9, label: "Very Good", description: "Minimal wear. Clean, well-maintained. All features functional." },
    { grade: 8, label: "Good", description: "Normal wear. Minor cosmetic marks. Fully functional." },
    { grade: 7, label: "Above Average", description: "Some visible use. Controls responsive. Seals intact." },
    { grade: 6, label: "Fair", description: "Moderate wear. Some cosmetic damage. All core functions work." },
    { grade: 5, label: "Below Average", description: "Notable wear. Gaskets showing age. Might need service soon." },
    { grade: 4, label: "Poor", description: "Significant wear. Some functions degraded. Gaskets failing." },
    { grade: 3, label: "Very Poor", description: "Major wear. Functions unreliable. Rust or significant damage." },
    { grade: 2, label: "Critical", description: "Barely functional. Most features degraded. Replacement imminent." },
    { grade: 1, label: "Failed", description: "Non-functional. Replacement required." },
  ],

  structural: [
    { grade: 10, label: "Excellent", description: "No cracks, settling, moisture, or damage. Foundation and framing in perfect condition." },
    { grade: 9, label: "Very Good", description: "Hairline settling cracks only. No moisture intrusion. Framing sound." },
    { grade: 8, label: "Good", description: "Normal settling. Minor cosmetic cracks. No structural concerns." },
    { grade: 7, label: "Above Average", description: "Some settling cracks. Minor moisture staining. Framing intact." },
    { grade: 6, label: "Fair", description: "Moderate settling. Cracks widening but not structural. Some moisture history." },
    { grade: 5, label: "Below Average", description: "Wider cracks suggesting active settling. Past moisture intrusion evident." },
    { grade: 4, label: "Poor", description: "Structural cracks present. Active moisture intrusion. Possible wood rot." },
    { grade: 3, label: "Very Poor", description: "Significant structural movement. Active water damage. Wood rot spreading." },
    { grade: 2, label: "Critical", description: "Major structural failure risk. Foundation shifting, active settling, significant rot." },
    { grade: 1, label: "Failed", description: "Structural failure occurring. Unsafe occupancy. Immediate engineering assessment needed." },
  ],

  exterior: [
    { grade: 10, label: "Excellent", description: "New roof, siding, windows. No wear, leaks, or damage." },
    { grade: 9, label: "Very Good", description: "Minor wear only. All components intact and functional." },
    { grade: 8, label: "Good", description: "Normal aging. Roof shingles laying flat. Paint in good condition." },
    { grade: 7, label: "Above Average", description: "Some fading. Minor granule loss on shingles. Gutters functional." },
    { grade: 6, label: "Fair", description: "Moderate wear. Shingle curling beginning. Paint peeling in spots." },
    { grade: 5, label: "Below Average", description: "Notable wear. Shingle curling widespread. Gutters sagging. Paint failing." },
    { grade: 4, label: "Poor", description: "Significant deterioration. Missing shingles. Rot on trim. Gutters failing." },
    { grade: 3, label: "Very Poor", description: "Major deterioration. Active leaks likely. Siding damage. Window seal failures." },
    { grade: 2, label: "Critical", description: "Severe damage. Active leaks. Structural deterioration of exterior components." },
    { grade: 1, label: "Failed", description: "Exterior failed. Active water intrusion. Immediate repair/replacement needed." },
  ],
};

/**
 * FUTURE: Condition Grade → Weibull Override logic.
 *
 * When condition grading is enabled, this function will adjust the
 * Weibull prediction based on the visual condition assessment.
 *
 * A grade of 8+ on an old system might extend the predicted lifespan,
 * because it suggests this specific unit is outperforming the average.
 *
 * A grade of 3 on a young system might accelerate the prediction,
 * because it suggests premature failure or abuse.
 *
 * This is the key integration point between the vault and the
 * forecasting engine.
 */
export function calculateWeibullAdjustment(
  conditionGrade: number,
  systemAgeYears: number,
  defaultLifespanYears: number,
  baseWeibullShape: number,
  baseWeibullScale: number
): { adjustedShape: number; adjustedScale: number; reasoning: string } {
  const ageRatio = systemAgeYears / defaultLifespanYears;
  const expectedGradeAtAge = Math.max(1, 10 - ageRatio * 8); // Linear degradation model
  const gradeDelta = conditionGrade - expectedGradeAtAge;

  // If the system is in better condition than expected for its age,
  // extend the Weibull scale (shift the curve right).
  // If worse, compress the scale (shift left).
  const scaleFactor = 1 + gradeDelta * 0.05; // 5% per grade point delta
  const adjustedScale = baseWeibullScale * Math.max(0.5, Math.min(1.5, scaleFactor));

  // Shape stays relatively stable — it represents the failure mode,
  // not the individual system condition.
  const adjustedShape = baseWeibullShape;

  let reasoning: string;
  if (gradeDelta > 2) {
    reasoning = `This system is in significantly better condition than typical for its age. Extending predicted lifespan by ${Math.round((scaleFactor - 1) * 100)}%.`;
  } else if (gradeDelta > 0) {
    reasoning = `This system is in slightly better condition than average for its age. Minor lifespan extension applied.`;
  } else if (gradeDelta > -2) {
    reasoning = `This system is aging as expected. No significant adjustment to predictions.`;
  } else {
    reasoning = `This system shows more wear than typical for its age. Predicted lifespan reduced by ${Math.round((1 - scaleFactor) * 100)}%.`;
  }

  return { adjustedShape, adjustedScale, reasoning };
}
