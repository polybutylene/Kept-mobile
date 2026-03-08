import { mutation } from "./_generated/server";

// ═══════════════════════════════════════════════════════════════════════════
// InterNACHI Standards of Practice (SOP) Seed Data
// Reference: https://www.nachi.org/sop.htm
// ═══════════════════════════════════════════════════════════════════════════

// ── 3.1 Roof ──────────────────────────────────────────────────────────────

const ROOF_SYSTEM = {
  sectionNumber: "3.1",
  systemId: "roof",
  systemName: "Roof",
  category: "structural",
  shallInspect: [
    "Roof-covering materials",
    "Gutters",
    "Downspouts",
    "Vents, flashing, skylights, chimney and other roof penetrations",
    "General structure of the roof from readily accessible panels, doors or stairs",
  ],
  shallDescribe: [
    "Type of roof-covering materials",
    "Methods used to inspect the roof",
  ],
  shallReport: ["Observed indications of active roof leaks"],
  notRequired: [
    "Walk on any roof surface",
    "Predict the service life expectancy",
    "Inspect underground downspout diverter drainage pipes",
    "Remove snow, ice, debris, or other conditions that prohibit the observation of the roof surfaces",
    "Inspect antennae, satellite dishes, lightning arresters, de-icing equipment, or similar attachments",
    "Walk on any roof areas that appear to be unsafe",
    "Walk on any roof areas if doing so might cause damage",
    "Warrant or certify the roof",
    "Confirm proper fastening or installation of any roof-covering material",
    "Perform a water test on any roof surface",
  ],
  floridaSpecific: [
    "Wind mitigation inspection (Form OIR-B1-1802) required for insurance discounts",
    "Hurricane strap/clip verification at roof-to-wall connection",
    "FBC post-2002 roof installations must meet Miami-Dade wind load standards",
    "Secondary water resistance (SWR) layer inspection common",
    "Insurance premiums tied heavily to roof age and covering type",
    "Hip roof design qualifies for additional insurance credit",
  ],
  inspectionTips: [
    "Always photograph all six roof planes if accessible",
    "Document the roof covering type and approximate age",
    "Note any visible patching or previous repair work",
    "Inspect flashing at all penetrations and transitions",
    "Check gutter slope and downspout discharge locations",
    "Look for biological growth (moss, algae, lichen)",
    "Note any visible sagging or structural deformation",
  ],
  liabilityNotes: [
    "Never guarantee remaining roof life — use language like estimated or approximate",
    "Document method of inspection (ground, ladder, drone, walked)",
    "If unable to inspect, clearly state the reason and limitation",
    "Photograph and report any condition that deviates from standard practice",
  ],
};

// ── 3.2 Exterior ──────────────────────────────────────────────────────────

const EXTERIOR_SYSTEM = {
  sectionNumber: "3.2",
  systemId: "exterior",
  systemName: "Exterior",
  category: "exterior",
  shallInspect: [
    "Wall-covering materials, flashing and trim",
    "Entryway doors and a representative number of windows",
    "Garage door operators",
    "Decks, balconies, stoops, steps, areaways, porches and applicable railings",
    "Eaves, soffits and fascia",
    "Vegetation, grading, drainage and retaining walls with respect to their effect on the condition of the building",
    "Walkways, patios and driveways leading to dwelling entrances",
    "Attached or adjacent decks, balconies, stoops, steps, porches, patios, and their associated railings",
    "Garage door operators including entrapment protection devices",
  ],
  shallDescribe: ["Type of exterior wall-covering materials"],
  shallReport: [
    "Vegetation in contact with or growing over exterior surfaces",
    "Deficiencies in the condition of the exterior wall covering",
    "Deficiencies in the condition of exterior doors and windows",
  ],
  notRequired: [
    "Inspect or test swimming pools, spas, hot tubs, or their equipment",
    "Inspect or test irrigation systems",
    "Inspect or test underground utilities, fences, or recreational facilities",
    "Inspect seawalls, break-walls, or docks",
    "Inspect erosion-control or earth-stabilization measures",
    "Inspect for the presence of pests, wood-destroying organisms, or wood-destroying insects",
    "Inspect exterior accent or landscape lighting",
    "Inspect or test water features, fountains, or ponds",
    "Inspect or test outbuildings, storage buildings, or detached structures",
    "Inspect or test playground equipment",
    "Inspect screening, shutters, awnings, or security bars",
    "Inspect or test garage door operator remote-control transmitters",
    "Inspect or test underground storage tanks",
    "Inspect septic or other private sewage disposal systems",
    "Inspect or test well systems",
    "Inspect or test solar, wind, or geothermal systems",
  ],
  floridaSpecific: [
    "Hurricane shutters — verify type, condition, and operability for wind mitigation credit",
    "Impact-rated windows and doors — look for permanent labels and certification marks",
    "Stucco/EIFS cracking common due to thermal expansion in Florida climate",
    "CBS (concrete block and stucco) construction is predominant — check for spalling",
    "Lanai and pool cage screening — note condition and attachment",
    "Termite and WDO (wood-destroying organism) damage common — note visible evidence",
    "Grade and drainage critical due to flat terrain and high water table",
  ],
  inspectionTips: [
    "Walk the full perimeter of the structure",
    "Probe wood trim and siding near grade level for moisture damage",
    "Test garage door auto-reverse with 2x4 and photoelectric eye",
    "Check caulking at windows, doors, and penetrations",
    "Note all trip hazards on walkways and driveways",
  ],
  liabilityNotes: [
    "WDO inspection is a separate license in most states — do not provide WDO opinions",
    "Pool/spa inspection requires separate certification in many jurisdictions",
    "Document inaccessible areas clearly",
  ],
};

// ── 3.3 Foundation ────────────────────────────────────────────────────────

const FOUNDATION_SYSTEM = {
  sectionNumber: "3.3",
  systemId: "foundation",
  systemName: "Foundation, Basement, and Crawlspace",
  category: "structural",
  shallInspect: [
    "Foundation",
    "Basement",
    "Crawlspace",
    "Structural components including foundation walls and floor framing",
  ],
  shallDescribe: [
    "Type of foundation",
    "Methods used to inspect under-floor crawlspace or basement",
  ],
  shallReport: [
    "Observed indications of wood in contact with or near soil",
    "Observed indications of active water penetration",
    "Observed indications of possible foundation movement such as sheetrock cracks, out-of-square door frames, and separations of components",
    "Observed cutting, notching, and boring of framing members that may present a structural or safety concern",
  ],
  notRequired: [
    "Enter any area that is unsafe or not readily accessible",
    "Provide engineering or architectural opinions",
    "Provide opinions regarding adequacy of structural systems or components",
    "Enter under-floor crawlspaces that have less than 24 inches of vertical clearance",
    "Enter under-floor crawlspaces that have evidence of unsafe conditions",
    "Move stored items, debris, or other obstructions",
    "Operate sump pumps with inaccessible floats",
  ],
  floridaSpecific: [
    "Slab-on-grade construction predominant — look for edge cracking and settling",
    "Post-tension slab systems common — identify PT cables, never core or cut",
    "Crawlspace moisture issues critical due to high humidity and water table",
    "Hurricane Michael (2018) revealed widespread foundation issues in the Panhandle",
    "Expansive soils in parts of central Florida — check for heaving patterns",
    "Sinkholes are a significant concern in certain Florida counties",
    "Verify flood zone status — foundation type affects flood insurance requirements",
  ],
  inspectionTips: [
    "Measure visible cracks and note direction (horizontal more concerning than vertical)",
    "Check for efflorescence on foundation walls indicating moisture movement",
    "Verify proper crawlspace ventilation and vapor barriers",
    "Look for signs of previous foundation repair (piers, patches, epoxy injection)",
  ],
  liabilityNotes: [
    "Foundation opinions require engineering certification in most states",
    "Use observational language — note indications rather than diagnose causes",
    "Sinkhole determination requires geological testing — do not speculate",
  ],
};

// ── 3.4 Heating ───────────────────────────────────────────────────────────

const HEATING_SYSTEM = {
  sectionNumber: "3.4",
  systemId: "heating",
  systemName: "Heating",
  category: "mechanical",
  shallInspect: ["Heating systems using normal operating controls"],
  shallDescribe: [
    "Energy source",
    "Heating method by distinguishing between forced air, gravity, and radiant type systems and describing the fuel source",
    "Type of heating system",
  ],
  shallReport: ["Observed indications of abnormal operating conditions"],
  notRequired: [
    "Inspect or evaluate the interior of flues or chimneys, fire chambers, heat exchangers, combustion air systems, fresh-air intakes, humidifiers, dehumidifiers, electronic air filters, geothermal systems, or solar heating systems",
    "Inspect fuel tanks or their condition",
    "Determine the uniformity, temperature, flow, balance, distribution, size, capacity, BTU, or supply adequacy of the heating system",
    "Light or ignite pilot flames",
    "Activate heating, heat pump systems, or other heating systems when ambient temperatures or other circumstances are not conducive to safe operation or may damage the equipment",
    "Override thermostat controls or automatic safety controls",
    "Provide opinions regarding the adequacy of the system to heat the building",
    "Evaluate whether the type or condition of the installed heating system is appropriate or matches the age of the building",
  ],
  floridaSpecific: [
    "Heat pumps predominant in Florida — verify heating mode operation when safe",
    "Many Florida homes have electric resistance heat strips only",
    "Furnaces less common — when present, check for code compliance",
    "Gas heating systems rare in Florida except LP in rural areas",
    "Heat pump auxiliary/emergency heat strip verification important",
  ],
  inspectionTips: [
    "Run the system through a full heating cycle",
    "Check temperature differential at supply and return",
    "Inspect visible ductwork for damage, disconnections, or gaps",
    "Check thermostat operation and calibration",
    "Note the age and general condition of the equipment",
  ],
  liabilityNotes: [
    "Do not operate if ambient temperature exceeds manufacturer safe operating range",
    "Document if system was not operated and state the reason",
    "Heat exchanger inspection is specifically excluded from general home inspection",
  ],
};

// ── 3.5 Cooling ───────────────────────────────────────────────────────────

const COOLING_SYSTEM = {
  sectionNumber: "3.5",
  systemId: "cooling",
  systemName: "Cooling",
  category: "mechanical",
  shallInspect: ["Cooling systems using normal operating controls"],
  shallDescribe: ["Energy source", "Type of cooling system"],
  shallReport: ["Observed indications of abnormal operating conditions"],
  notRequired: [
    "Determine the uniformity, temperature, flow, balance, distribution, size, capacity, BTU, or supply adequacy of the cooling system",
    "Inspect window-mounted air conditioning units or portable cooling units",
    "Inspect or determine refrigerant type or detect the presence of refrigerant leaks",
    "Activate cooling systems when ambient temperatures or other circumstances are not conducive to safe operation or may damage the equipment (generally below 60\u00b0F / 16\u00b0C)",
    "Provide opinions regarding the adequacy of the system to cool the building",
  ],
  floridaSpecific: [
    "Condensate drain line is #1 source of water damage claims in Florida",
    "SEER rating requirements: minimum 15 SEER for new installs in Florida (2023+)",
    "4-point inspection includes HVAC age and condition for insurance",
    "Verify float switch or secondary drain pan for attic-mounted air handlers",
    "Salt air corrosion of condenser coils in coastal areas — note condition",
    "Two-stage or variable-speed systems common for humidity control",
    "UV light and dehumidification systems common — note if present",
    "Check for proper refrigerant line insulation — critical in Florida heat",
  ],
  inspectionTips: [
    "Run the system for at least 10\u201315 minutes and measure temperature split",
    "Normal temperature split is 15\u201322\u00b0F between supply and return",
    "Check condensate drain line and secondary drain/float switch",
    "Inspect disconnect and electrical connections at condenser",
    "Note refrigerant line insulation condition",
    "Check for ice formation on refrigerant lines",
  ],
  liabilityNotes: [
    "Do not operate below 60\u00b0F ambient — risk of compressor damage",
    "Refrigerant leak detection requires EPA certification — do not perform",
    "Document temperature readings and outdoor ambient conditions",
  ],
};

// ── 3.6 Plumbing ──────────────────────────────────────────────────────────

const PLUMBING_SYSTEM = {
  sectionNumber: "3.6",
  systemId: "plumbing",
  systemName: "Plumbing",
  category: "mechanical",
  shallInspect: [
    "Main water supply shut-off valve",
    "Main fuel supply shut-off valve",
    "Water heating equipment, including the energy source, venting connections, temperature/pressure-relief (TPR) valves, and discharge piping",
    "Interior water supply and distribution systems including all fixtures and faucets by running water",
    "All toilets for proper operation by flushing",
    "All sinks, tubs and showers for functional flow",
    "Drain, waste and vent systems",
    "Drainage sump pumps with accessible floats",
  ],
  shallDescribe: [
    "Water supply and distribution piping materials, including visible supply, drain, waste, and vent pipes",
    "Water heating equipment, including energy source",
    "Location of main water supply and fuel shut-off valves",
  ],
  shallReport: [
    "Observed indications of leaks or abnormal flow",
    "Absence of water supply shut-off valves",
  ],
  notRequired: [
    "Operate any valves that are not regularly operated by the homeowner",
    "Inspect or test shower pans, tub/shower surrounds, or enclosures for leakage",
    "Inspect or test the water quality or determine the potability of any water supply",
    "Inspect water-conditioning or water-filtering systems or equipment",
    "Determine the size, temperature, age, life expectancy, or adequacy of the water heater",
    "Inspect private water supply systems or water storage tanks",
    "Inspect private or public sewage disposal systems",
    "Inspect hot tub, spa, or pool plumbing",
    "Inspect solar, tankless, or on-demand water heating systems when there is insufficient water flow to activate the system",
    "Inspect fire sprinkler systems",
    "Observe water supply and distribution piping that is concealed or underground",
    "Inspect gas supply system for leaks",
    "Determine whether water supply and waste disposal systems are public or private",
    "Inspect or determine the condition of galvanized pipes, polybutylene pipes, or lead pipes unless readily visible",
    "Inspect pressure-assist or similar toilet flush systems",
    "Inspect floor drains in garages or other areas",
    "Inspect clothes washer connections",
    "Test sump pumps or verify proper drainage away from the building",
    "Determine the adequacy of combustion air for fuel-burning appliances",
  ],
  floridaSpecific: [
    "Polybutylene (PB) piping — class-action settlement; insurers may deny coverage",
    "CPVC piping becomes brittle in Florida attics due to extreme heat",
    "Chinese drywall (2001-2009) corrodes copper plumbing — look for blackened pipes",
    "T&P discharge must terminate within 6 inches of floor or to exterior — not into drain",
    "Water heater strapping required in some jurisdictions",
    "Cast iron drain pipes under slab are common and frequently deteriorated in pre-1975 homes",
    "Well water systems common in rural areas — note if present",
  ],
  inspectionTips: [
    "Run all fixtures simultaneously to test functional flow",
    "Check under all sinks for leaks and proper drain configuration",
    "Verify T&P valve is not capped, plugged, or improperly discharged",
    "Test water heater temperature at nearest fixture (should be 120\u00b0F or less)",
    "Check visible supply lines for material type and condition",
    "Flush all toilets and verify proper fill and shut-off",
  ],
  liabilityNotes: [
    "PB piping identification is critical — document clearly with photos",
    "Water quality testing is outside scope — refer to specialists",
    "Sewer scope is a separate service — recommend when cast iron present",
  ],
};

// ── 3.7 Electrical ────────────────────────────────────────────────────────

const ELECTRICAL_SYSTEM = {
  sectionNumber: "3.7",
  systemId: "electrical",
  systemName: "Electrical",
  category: "electrical",
  shallInspect: [
    "Service drop/lateral",
    "Service entrance conductors, cables, and raceways",
    "Service equipment and main disconnects",
    "Service grounding",
    "Interior components of service panels and sub panels",
    "Conductors",
    "Overcurrent protection devices (breakers and fuses)",
    "A representative number of installed lighting fixtures, switches, and receptacles",
    "Ground fault circuit interrupters (GFCI) and arc fault circuit interrupters (AFCI)",
    "Smoke and carbon monoxide detectors",
  ],
  shallDescribe: [
    "Amperage and voltage rating of the service",
    "Location of main disconnect and sub panels",
    "Type of branch circuit wiring",
    "Presence or absence of smoke and carbon monoxide detectors",
  ],
  shallReport: [
    "Observed absence of smoke detectors",
    "Presence of solid conductor aluminum branch circuit wiring",
    "Observed absence of AFCI protection",
    "Observed absence of GFCI protection where required",
    "Deficiencies in the integrity of the service entrance conductors",
    "Observed indications of improper or hazardous wiring",
  ],
  notRequired: [
    "Insert any tool, probe, or testing device inside the panels",
    "Test or operate any over-current device except GFCI and AFCI breakers",
    "Dismantle any electrical device or control",
    "Test every outlet, switch, or fixture",
    "Move any object, furniture, or appliance to gain access",
    "Test smoke or carbon monoxide detectors that are not battery-operated",
    "Measure amperage, voltage, or impedance",
    "Inspect private or emergency electrical supply sources, including but not limited to generators, windmills, solar panels, or battery storage",
    "Inspect low-voltage systems such as doorbells, intercoms, or landscape lighting",
    "Determine the service capacity or adequacy",
    "Inspect ancillary wiring not a part of the primary electrical distribution system",
    "Inspect subterranean wiring or conduit",
    "Inspect fire or burglar alarm systems",
  ],
  floridaSpecific: [
    "AFCI protection required on all bedroom circuits in homes built or renovated after 2014 (FBC)",
    "Aluminum branch circuit wiring (1965-1973 era) — significant fire hazard, report prominently",
    "Federal Pacific Electric (FPE) Stab-Lok panels — known failure to trip, recommend replacement",
    "Zinsco/GTE-Sylvania panels — known overheating and failure issues, recommend evaluation",
    "GFCI required: kitchens, bathrooms, garages, exteriors, laundry, pools within 20 feet",
    "4-point inspection requires panel age, type, and conductor material documentation",
    "Lightning surge protection highly recommended in Florida — note if present",
  ],
  inspectionTips: [
    "Remove panel covers and photograph the interior",
    "Check for double-tapped breakers and improper multi-wire circuits",
    "Test all accessible GFCI outlets with a tester",
    "Test AFCI breakers using the test button",
    "Verify proper grounding and bonding at service entrance",
    "Check for open junction boxes and exposed wiring",
    "Note the panel manufacturer, model, and amperage rating",
  ],
  liabilityNotes: [
    "FPE and Zinsco panels — always recommend evaluation by licensed electrician",
    "Aluminum wiring — describe the hazard clearly and recommend evaluation",
    "Never reset a tripped breaker — document and recommend evaluation",
    "Electrical work requires licensed electricians in Florida",
  ],
};

// ── 3.8 Fireplace ─────────────────────────────────────────────────────────

const FIREPLACE_SYSTEM = {
  sectionNumber: "3.8",
  systemId: "fireplace",
  systemName: "Fireplace",
  category: "interior",
  shallInspect: [
    "Readily accessible and visible portions of fireplaces and chimneys",
    "Lintels above fireplace openings",
    "Damper door by opening and closing when readily accessible",
    "Cleanout door and frames",
  ],
  shallDescribe: [
    "Type of fireplace (masonry, factory-built/prefabricated, gas logs, etc.)",
  ],
  shallReport: [
    "Observed evidence of damage to the firebox or chimney",
    "Absence or improper operation of damper",
  ],
  notRequired: [
    "Inspect the interior of any chimney flue or vent",
    "Inspect the fire screening, doors, or mantels",
    "Determine the need for a chimney sweep or cleaning",
    "Operate gas fireplace inserts or gas logs",
    "Light pilot lights or ignite fires",
    "Determine the draft characteristics or adequacy",
    "Move or remove fireplace inserts, stoves, screen assemblies, or other components",
    "Perform a smoke test",
  ],
  floridaSpecific: [
    "Gas log fireplaces common — verify gas shut-off valve accessibility",
    "Prefabricated/zero-clearance fireplaces predominant in Florida construction",
    "Wood-burning fireplaces less common — check for proper clearances when present",
    "Decorative-only fireplaces — verify they are not connected to gas supply",
  ],
  inspectionTips: [
    "Visually inspect the firebox for cracked firebrick or refractory panels",
    "Test damper operation if accessible",
    "Look for creosote buildup in visible portions",
    "Check hearth extension dimensions for code compliance",
    "Verify gas shut-off valve is accessible and labeled",
  ],
  liabilityNotes: [
    "Chimney interior inspection requires Level II NFPA certification",
    "Do not start fires or operate gas appliances for testing",
    "Document all visible conditions and recommend chimney sweep when appropriate",
  ],
};

// ── 3.9 Attic ─────────────────────────────────────────────────────────────

const ATTIC_SYSTEM = {
  sectionNumber: "3.9",
  systemId: "attic",
  systemName: "Attic, Insulation, and Ventilation",
  category: "structural",
  shallInspect: [
    "Insulation in unfinished spaces, including attic, foundation, and crawlspace",
    "Ventilation of unfinished spaces, including attic, foundation, and crawlspace",
    "Mechanical exhaust systems in kitchen, bathrooms, and laundry areas",
    "General condition of attic space and components",
  ],
  shallDescribe: [
    "Type of insulation observed",
    "Approximate average depth of insulation observed",
    "Methods used to inspect the attic",
  ],
  shallReport: [
    "Observed absence of insulation in unfinished spaces",
    "Observed absence of ventilation in unfinished spaces",
    "Bathroom exhaust systems that terminate inside the building",
  ],
  notRequired: [
    "Enter any attic that is not readily accessible or where entry could cause damage or pose a safety hazard",
    "Move, touch, or disturb insulation",
    "Move, touch, or disturb vapor retarders",
    "Break or otherwise damage the surface finish or weather seal on or around access panels or covers",
    "Identify the composition or R-value of insulation material",
  ],
  floridaSpecific: [
    "Attic temperatures can exceed 140\u00b0F in summer — time inspections accordingly",
    "Radiant barriers common and recommended in Florida — note presence",
    "R-30 minimum insulation recommended for Florida attic spaces",
    "Soffit vents must not be blocked by insulation — critical for moisture control",
    "Bathroom exhaust venting into attic is a major mold risk in Florida humidity",
    "Look for daylight through roof sheathing — indicates potential water intrusion",
    "Truss uplift and roof-to-wall connections visible from attic — document for wind mitigation",
  ],
  inspectionTips: [
    "Photograph attic access location and conditions",
    "Measure insulation depth in multiple locations",
    "Check for proper ventilation (soffit intake + ridge/gable exhaust)",
    "Look for signs of water intrusion, staining, or mold",
    "Verify bathroom and kitchen exhausts terminate to exterior",
    "Check for pest activity (rodents, insects, wildlife)",
  ],
  liabilityNotes: [
    "Do not enter if unsafe — document reason and recommend specialist",
    "Vermiculite insulation may contain asbestos — do not disturb, recommend testing",
    "Use observational language for suspected mold — recommend testing by specialist",
  ],
};

// ── 3.10 Interior ─────────────────────────────────────────────────────────

const INTERIOR_SYSTEM = {
  sectionNumber: "3.10",
  systemId: "interior",
  systemName: "Interior",
  category: "interior",
  shallInspect: [
    "Walls, ceilings and floors",
    "Steps, stairways and railings",
    "Countertops and a representative number of installed cabinets",
    "A representative number of doors and windows",
    "Garage vehicle doors and the operation of garage vehicle door openers using normal operating controls",
    "Safety reverse mechanism on all garage vehicle doors",
  ],
  shallDescribe: ["Type of floor covering", "Type of wall covering"],
  shallReport: [
    "Baluster spacing that permits the passage of an object greater than four inches in diameter",
    "Absence of safety glass where required",
    "Absence of or improper operation of safety reverse mechanism on garage vehicle doors",
  ],
  notRequired: [
    "Inspect paint, wallpaper, or other finish treatments on the interior walls, ceilings, and floors",
    "Inspect central vacuum systems",
    "Inspect for safety glazing",
    "Inspect security systems or components",
    "Inspect or evaluate the fire resistive qualities of materials or assemblies",
    "Inspect or evaluate interior acoustic characteristics of any building component or system",
    "Move furniture, stored items, or other obstructions",
    "Move suspended ceiling tiles",
    "Inspect or operate built-in appliances",
    "Inspect items not permanently installed",
    "Determine the condition of floor or wall coverings concealed by furniture or stored items",
    "Inspect for environmental hazards (lead, asbestos, mold, radon, formaldehyde)",
    "Determine the presence or absence of pest infestation",
    "Determine the presence or condition of drywall or other interior structural components",
    "Operate or test key-operated locks",
    "Determine the operability of windows in high-rise buildings",
  ],
  floridaSpecific: [
    "Impact-rated windows and sliding glass doors — check for permanent labels",
    "Sliding glass door track and roller condition critical for hurricane prep",
    "Tile floors common — check for hollow spots indicating delamination",
    "Moisture-related baseboard damage common in slab-on-grade construction",
    "Verify garage door opener safety reverse mechanism (2 tests: physical and photoelectric)",
    "Chinese drywall indicators: blackened copper, sulfur odor, corrosion on coils",
    "Interior moisture staining near windows may indicate failed window seals or wind-driven rain intrusion",
  ],
  inspectionTips: [
    "Test representative sample of windows for operation and locking",
    "Check all stairway handrails for security",
    "Test garage door auto-reverse with 2x4 on floor",
    "Test garage door photoelectric sensors",
    "Note any evidence of water damage on ceilings and walls",
    "Check cabinet doors and drawers for proper operation",
  ],
  liabilityNotes: [
    "Environmental testing (mold, lead, asbestos, radon) is outside scope — always refer",
    "Cosmetic conditions are not defects — do not report paint chips or scuffs",
    "Garage door safety reverse is a mandatory reportable item",
  ],
};

// ── All Systems Array ─────────────────────────────────────────────────────

const ALL_SYSTEMS = [
  ROOF_SYSTEM,
  EXTERIOR_SYSTEM,
  FOUNDATION_SYSTEM,
  HEATING_SYSTEM,
  COOLING_SYSTEM,
  PLUMBING_SYSTEM,
  ELECTRICAL_SYSTEM,
  FIREPLACE_SYSTEM,
  ATTIC_SYSTEM,
  INTERIOR_SYSTEM,
];

// ── Defects (16 total) ────────────────────────────────────────────────────

const ALL_DEFECTS = [
  {
    systemId: "roof",
    defectName: "Active roof leak",
    severity: "major",
    description:
      "Evidence of active water intrusion through roof covering or penetrations",
    whatToLookFor: [
      "Water stains on ceilings or walls below roof areas",
      "Daylight visible through roof sheathing from attic",
      "Wet or damp insulation in attic space",
      "Mold or mildew growth on roof sheathing",
      "Dripping observed during or after rainfall",
    ],
    reportLanguage:
      "Active roof leaks were observed as evidenced by [specific observation]. Water intrusion can cause structural damage, mold growth, and insulation deterioration. Recommend immediate evaluation and repair by a qualified roofing contractor.",
    photoGuidance:
      "Photograph the interior evidence (stains, drips) AND the corresponding exterior area. Include wide and close-up shots.",
    isFloridaRelevant: true,
  },
  {
    systemId: "roof",
    defectName: "Damaged roof covering",
    severity: "major",
    description:
      "Roof covering materials showing significant deterioration, damage, or approaching end of serviceable life",
    whatToLookFor: [
      "Missing, cracked, or curling shingles",
      "Granule loss exposing asphalt substrate",
      "Damaged or deteriorated tile, metal, or flat roof membrane",
      "Lifted or unsealed shingle tabs",
      "Visible patches or prior repair work",
    ],
    reportLanguage:
      "The roof covering shows [specific damage observed]. Damaged roof coverings compromise weather protection and may lead to water intrusion. Recommend evaluation by a qualified roofing contractor for repair or replacement.",
    photoGuidance:
      "Wide shot showing the overall roof plane and close-ups of specific damage areas. Include a reference object for scale.",
    isFloridaRelevant: true,
  },
  {
    systemId: "foundation",
    defectName: "Foundation movement indicators",
    severity: "major",
    description:
      "Observable evidence suggesting foundation settlement, heaving, or lateral movement",
    whatToLookFor: [
      "Diagonal cracks in drywall, especially at door and window corners",
      "Doors or windows that stick or will not close properly",
      "Visible cracks in foundation walls (horizontal cracks are most concerning)",
      "Separation between walls and ceiling or floor",
      "Uneven or sloping floors",
      "Gaps at exterior brick or siding joints",
    ],
    reportLanguage:
      "Indications of possible foundation movement were observed, including [specific observations]. Foundation movement can be caused by settlement, expansive soils, or hydrostatic pressure. Recommend evaluation by a qualified structural engineer.",
    photoGuidance:
      "Photograph all visible cracks with a ruler for scale. Include wide shots showing the pattern and close-ups of individual cracks.",
    isFloridaRelevant: true,
  },
  {
    systemId: "foundation",
    defectName: "Active water penetration",
    severity: "major",
    description:
      "Evidence of current water intrusion into basement or crawlspace areas",
    whatToLookFor: [
      "Standing water in basement or crawlspace",
      "Water stains or tide marks on foundation walls",
      "Efflorescence (white mineral deposits) on masonry surfaces",
      "Musty odor indicating chronic moisture",
      "Rust stains on mechanical equipment in basement",
    ],
    reportLanguage:
      "Active water penetration was observed in the [location], as evidenced by [specific observations]. Chronic moisture can cause structural deterioration, mold growth, and damage to mechanical systems. Recommend evaluation by a qualified waterproofing contractor.",
    photoGuidance:
      "Photograph standing water, staining patterns, and efflorescence. Include the entire affected wall or floor area.",
    isFloridaRelevant: true,
  },
  {
    systemId: "electrical",
    defectName: "Federal Pacific / Zinsco panel",
    severity: "safety",
    description:
      "Electrical panel manufactured by Federal Pacific Electric (FPE Stab-Lok) or Zinsco/GTE-Sylvania, known to have significant failure rates",
    whatToLookFor: [
      "Federal Pacific Electric or FPE branding on panel cover",
      "Stab-Lok breakers (distinctive red or orange tips)",
      "Zinsco or GTE-Sylvania branding on panel",
      "Breakers that appear melted or discolored",
      "Panel cover that is warm to the touch",
    ],
    reportLanguage:
      "The electrical panel is a [Federal Pacific Stab-Lok / Zinsco] type. These panels have a documented history of breakers failing to trip during overcurrent conditions, which presents a significant fire hazard. Recommend evaluation and likely replacement by a licensed electrician.",
    photoGuidance:
      "Photograph the panel cover label, interior with cover removed showing breaker arrangement, and any evidence of overheating or melting.",
    isFloridaRelevant: true,
  },
  {
    systemId: "electrical",
    defectName: "Aluminum branch circuit wiring",
    severity: "major",
    description:
      "Solid conductor aluminum wiring used for 15- and 20-amp branch circuits, primarily installed 1965-1973",
    whatToLookFor: [
      "Silver-colored wiring visible at panel, outlets, or junction boxes",
      "AL or ALUMINUM markings on wire insulation jacket",
      "Warm or discolored cover plates on outlets or switches",
      "Flickering lights or intermittent power",
      "Burning smell near outlets or switches",
    ],
    reportLanguage:
      "Solid conductor aluminum branch circuit wiring was observed. Aluminum wiring installed during the 1965-1973 era is a known fire hazard due to oxidation and thermal expansion at connection points. Recommend evaluation by a licensed electrician experienced with aluminum wiring remediation (COPALUM or AlumiConn connectors).",
    photoGuidance:
      "Photograph the wiring at the panel showing AL markings, and any accessible connections. Include close-ups of wire markings.",
    isFloridaRelevant: true,
  },
  {
    systemId: "electrical",
    defectName: "Absent GFCI protection",
    severity: "major",
    description:
      "Ground Fault Circuit Interrupter protection missing in required locations",
    whatToLookFor: [
      "Standard outlets (no test/reset buttons) in bathrooms, kitchens, garages, exterior, laundry, or near pools",
      "Non-functional GFCI outlets (fail to trip when tested)",
      "No GFCI breaker protecting required circuits",
    ],
    reportLanguage:
      "GFCI protection was absent at [specific locations]. GFCI protection is required in wet or damp locations to prevent electrical shock. Recommend installation of GFCI outlets or breakers by a licensed electrician in all required locations.",
    photoGuidance:
      "Photograph non-GFCI outlets in required locations. Include the location context (bathroom counter, kitchen counter near sink, etc.).",
    isFloridaRelevant: true,
  },
  {
    systemId: "electrical",
    defectName: "Absent AFCI protection",
    severity: "moderate",
    description:
      "Arc Fault Circuit Interrupter protection missing on bedroom circuits in post-2014 construction",
    whatToLookFor: [
      "Standard breakers (no test button) on bedroom circuits in post-2014 homes",
      "Non-functional AFCI breakers (fail to trip when tested)",
    ],
    reportLanguage:
      "AFCI protection was not observed on bedroom circuits. For homes built or significantly renovated after 2014, AFCI protection is required by the Florida Building Code on all bedroom circuits. Recommend evaluation and installation by a licensed electrician.",
    photoGuidance:
      "Photograph the breaker panel showing non-AFCI breakers on bedroom circuits. Label which breakers serve which rooms.",
    isFloridaRelevant: true,
  },
  {
    systemId: "plumbing",
    defectName: "Polybutylene piping",
    severity: "major",
    description:
      "Polybutylene (PB) water supply piping, subject to premature failure and class-action settlement",
    whatToLookFor: [
      "Gray, blue, or black flexible plastic piping (not PEX)",
      "PB2110 markings on pipe",
      "Plastic crimp rings at connections (vs. PEX metal rings)",
      "Common in homes built 1978-1995",
      "Often found at water heater connections and main shutoff",
    ],
    reportLanguage:
      "Polybutylene (PB) water supply piping was observed. PB piping is known to be subject to premature failure due to degradation from water treatment chemicals, particularly chlorine. Many insurance companies will not insure homes with PB piping. Recommend evaluation by a licensed plumber and consider complete re-piping.",
    photoGuidance:
      "Photograph the piping with PB markings visible. Show the main supply line and connections. Include close-ups of pipe material markings.",
    isFloridaRelevant: true,
  },
  {
    systemId: "plumbing",
    defectName: "Water heater T&P deficiency",
    severity: "safety",
    description:
      "Temperature and Pressure (T&P) relief valve is absent, improperly installed, capped, or discharge piping is incorrect",
    whatToLookFor: [
      "No T&P valve present on water heater",
      "T&P valve discharge piped upward or into wall",
      "Discharge piping terminating more than 6 inches above floor",
      "T&P valve capped, plugged, or connected to closed system",
      "Discharge piping terminating into drain (code violation)",
    ],
    reportLanguage:
      "The water heater temperature/pressure relief valve [specific deficiency observed]. The T&P valve is a critical safety device designed to prevent catastrophic tank failure. Recommend immediate correction by a licensed plumber to ensure proper T&P valve installation and discharge piping.",
    photoGuidance:
      "Photograph the T&P valve location, discharge piping routing, and termination point. Include the full path of the discharge pipe.",
    isFloridaRelevant: true,
  },
  {
    systemId: "plumbing",
    defectName: "Deficient functional flow",
    severity: "moderate",
    description:
      "Inadequate water pressure or flow rate at fixtures throughout the home",
    whatToLookFor: [
      "Weak water flow when multiple fixtures are running",
      "Noticeable pressure drop at second-floor fixtures",
      "Slow-filling toilets or washing machines",
      "Corroded or restricted supply lines visible",
      "Galvanized supply piping (common cause)",
    ],
    reportLanguage:
      "Deficient functional flow was observed at [specific locations/conditions]. Reduced flow may indicate corroded or restricted supply piping, undersized supply lines, or municipal supply issues. Recommend evaluation by a licensed plumber to determine the cause and appropriate remediation.",
    photoGuidance:
      "Video is most effective for documenting flow issues. Photograph corroded piping and supply line connections.",
    isFloridaRelevant: false,
  },
  {
    systemId: "cooling",
    defectName: "Cooling system did not operate",
    severity: "major",
    description:
      "Air conditioning system failed to activate or cool when operated using normal controls",
    whatToLookFor: [
      "System does not respond to thermostat",
      "Condenser unit does not start",
      "Air handler runs but condenser does not",
      "System runs but produces warm or ambient-temperature air",
      "Unusual noises, vibrations, or odors during operation",
    ],
    reportLanguage:
      "The cooling system did not operate as intended when tested using normal operating controls. [Specific observations.] A non-functional cooling system requires prompt attention, particularly in Florida's climate. Recommend evaluation and repair by a licensed HVAC contractor.",
    photoGuidance:
      "Photograph the thermostat settings, condenser unit, air handler, and any error codes or indicators.",
    isFloridaRelevant: true,
  },
  {
    systemId: "cooling",
    defectName: "Condensate drainage issue",
    severity: "moderate",
    description:
      "Condensate drain line clogged, disconnected, or improperly draining, creating water damage risk",
    whatToLookFor: [
      "Water around air handler or in drain pan",
      "Algae or biological growth in condensate drain line",
      "Disconnected or damaged drain line",
      "Float switch absent on attic-mounted air handlers",
      "Secondary drain pan absent, rusted, or improperly drained",
      "Water stains on ceiling below attic-mounted unit",
    ],
    reportLanguage:
      "Condensate drainage issues were observed at the air handler, including [specific observations]. Condensate drain deficiencies are the leading cause of interior water damage claims in Florida. Recommend correction by a licensed HVAC contractor, including installation of a float safety switch if not present.",
    photoGuidance:
      "Photograph the drain pan, primary and secondary drain lines, and any evidence of overflow or water damage.",
    isFloridaRelevant: true,
  },
  {
    systemId: "exterior",
    defectName: "Garage door safety reverse failure",
    severity: "safety",
    description:
      "Garage door auto-reverse mechanism (physical or photoelectric) fails to operate properly, creating an entrapment hazard",
    whatToLookFor: [
      "Door does not reverse when contacting a 2x4 laid flat on the floor",
      "Photoelectric sensors missing, misaligned, or non-functional",
      "Door lacks auto-reverse mechanism entirely",
      "Excessive force required to trigger reverse",
    ],
    reportLanguage:
      "The garage door safety reverse mechanism [did not function / was absent / photoelectric sensors were non-functional]. Federal law (UL 325) requires all automatic garage door openers to have functioning entrapment protection. This is a safety hazard, particularly for children. Recommend immediate repair or replacement by a qualified garage door technician.",
    photoGuidance:
      "Photograph the garage door opener unit, safety sensors, and test results. Video of the failed reverse test is most effective.",
    isFloridaRelevant: true,
  },
  {
    systemId: "exterior",
    defectName: "Improper baluster spacing",
    severity: "moderate",
    description:
      "Balusters on stairs, railings, or guards spaced more than 4 inches apart, creating a fall or entrapment hazard",
    whatToLookFor: [
      "Balusters that allow a 4-inch sphere to pass through",
      "Missing or damaged balusters",
      "Decorative railings with openings exceeding 4 inches",
      "Horizontal rails that can be used as a climbing aid by children",
    ],
    reportLanguage:
      "Baluster spacing exceeding 4 inches was observed at [location]. The IRC/FBC requires that openings in guards and railings shall not allow passage of a sphere 4 inches in diameter. This presents a fall or entrapment hazard. Recommend correction to comply with current safety standards.",
    photoGuidance:
      "Photograph the baluster spacing with a 4-inch reference object (tennis ball). Include the full railing section and close-ups.",
    isFloridaRelevant: true,
  },
];

// ── Report Templates ──────────────────────────────────────────────────────

const ALL_REPORT_TEMPLATES = [
  { systemId: "roof", condition: "good", defectType: "none", templateText: "The roof covering consists of [material type], approximately [age] years old. The roof covering, flashing, penetrations, and drainage components were inspected and found to be in serviceable condition with no significant deficiencies noted at the time of inspection.", recommendAction: "Continue routine maintenance including annual inspection and gutter cleaning.", severity: "info" },
  { systemId: "roof", condition: "fair", defectType: "aging", templateText: "The roof covering consists of [material type], approximately [age] years old, and is showing signs of normal wear consistent with its age. Minor granule loss and weathering were observed. No active leaks were observed at the time of inspection.", recommendAction: "Plan for roof replacement within the next 3-5 years. Obtain estimates from qualified roofing contractors.", severity: "moderate" },
  { systemId: "roof", condition: "poor", defectType: "active_leak", templateText: "The roof covering consists of [material type] and shows significant deterioration including [specific deficiencies]. Evidence of active water intrusion was observed at [locations]. This condition requires immediate attention to prevent further structural damage.", recommendAction: "Recommend immediate evaluation and repair by a qualified roofing contractor. Budget for potential full roof replacement.", severity: "major" },

  { systemId: "exterior", condition: "good", defectType: "none", templateText: "Exterior wall coverings, trim, doors, windows, and associated components were inspected and found to be in serviceable condition. Grading and drainage appeared adequate. No significant deficiencies noted at the time of inspection.", recommendAction: "Continue routine maintenance including caulking, painting, and drainage management.", severity: "info" },
  { systemId: "exterior", condition: "poor", defectType: "wall_damage", templateText: "The exterior wall covering ([type]) shows [specific deficiencies including cracks, deterioration, missing sections]. These conditions compromise weather protection and may allow water intrusion. Recommend evaluation and repair by a qualified contractor.", recommendAction: "Obtain estimates for exterior wall covering repair or replacement. Address drainage issues contributing to deterioration.", severity: "major" },

  { systemId: "foundation", condition: "good", defectType: "none", templateText: "The foundation ([type]) was inspected and found to be in serviceable condition. No significant cracks, settlement indicators, or structural concerns were observed at the time of inspection.", recommendAction: "Continue monitoring for new cracks or changes. Maintain proper drainage away from foundation.", severity: "info" },
  { systemId: "foundation", condition: "poor", defectType: "movement", templateText: "Indications of possible foundation movement were observed, including [specific observations such as diagonal drywall cracks, sticking doors, floor slope, separation of components]. These conditions may indicate ongoing settlement or structural movement.", recommendAction: "Recommend evaluation by a qualified structural engineer to determine the cause, extent, and appropriate remediation.", severity: "major" },

  { systemId: "heating", condition: "good", defectType: "none", templateText: "The heating system ([type, fuel source]) was operated using normal controls and responded appropriately. Temperature differential was within normal range. No significant deficiencies noted at the time of inspection.", recommendAction: "Continue annual professional maintenance and filter changes per manufacturer recommendations.", severity: "info" },
  { systemId: "heating", condition: "poor", defectType: "malfunction", templateText: "The heating system ([type]) [did not operate / operated abnormally] when tested using normal operating controls. [Specific observations.] A non-functional heating system requires evaluation.", recommendAction: "Recommend evaluation and repair by a licensed HVAC contractor before closing.", severity: "major" },

  { systemId: "cooling", condition: "good", defectType: "none", templateText: "The cooling system ([type, SEER if visible]) was operated using normal controls. Temperature split measured [X]\u00b0F (normal range 15-22\u00b0F). Condensate drainage appeared functional. No significant deficiencies noted at the time of inspection.", recommendAction: "Continue semi-annual professional maintenance. Change filters monthly in Florida climate.", severity: "info" },
  { systemId: "cooling", condition: "poor", defectType: "not_cooling", templateText: "The cooling system did not operate as intended when tested using normal operating controls. [Specific observations.] In Florida's climate, a functional cooling system is essential for both comfort and moisture control.", recommendAction: "Recommend immediate evaluation and repair by a licensed HVAC contractor.", severity: "major" },
  { systemId: "cooling", condition: "fair", defectType: "condensate", templateText: "The cooling system operated but condensate drainage issues were observed, including [specific observations]. Condensate drainage deficiencies are the #1 source of water damage claims in Florida.", recommendAction: "Recommend condensate drain line service and installation of float safety switch by a licensed HVAC contractor.", severity: "moderate" },

  { systemId: "plumbing", condition: "good", defectType: "none", templateText: "The plumbing system was inspected including supply distribution, drain/waste/vent systems, water heating equipment, and fixtures. Functional flow was adequate. No significant deficiencies noted at the time of inspection.", recommendAction: "Continue routine maintenance. Inspect water heater T&P valve annually.", severity: "info" },
  { systemId: "plumbing", condition: "poor", defectType: "polybutylene", templateText: "Polybutylene (PB) water supply piping was observed. PB piping is subject to premature failure and has been the subject of class-action litigation. Many insurance companies will not insure homes with PB piping.", recommendAction: "Recommend evaluation by a licensed plumber. Budget for complete re-piping with modern materials (PEX or copper).", severity: "major" },
  { systemId: "plumbing", condition: "poor", defectType: "tp_deficiency", templateText: "The water heater temperature/pressure relief valve [was absent / was improperly installed / had improper discharge piping]. The T&P valve is a critical safety device. [Specific deficiency description.]", recommendAction: "Recommend immediate correction by a licensed plumber.", severity: "safety" },

  { systemId: "electrical", condition: "good", defectType: "none", templateText: "The electrical system was inspected including service entrance, main panel, branch circuits, and a representative number of outlets, switches, and fixtures. GFCI protection was present in required locations. No significant deficiencies noted at the time of inspection.", recommendAction: "Test GFCI and AFCI devices monthly. Have panel inspected every 5 years.", severity: "info" },
  { systemId: "electrical", condition: "poor", defectType: "fpe_panel", templateText: "The electrical panel is a Federal Pacific Electric (FPE) Stab-Lok type. These panels have a well-documented history of breaker failure, presenting a significant fire hazard. FPE panels are consistently flagged as a safety concern by the home inspection industry.", recommendAction: "Recommend panel replacement by a licensed electrician. This is typically a $1,500-$3,000 repair.", severity: "safety" },
  { systemId: "electrical", condition: "poor", defectType: "aluminum_wiring", templateText: "Solid conductor aluminum branch circuit wiring was observed. This wiring type (1965-1973 era) has an increased risk of overheating at connections due to oxidation and differing thermal expansion rates compared to copper.", recommendAction: "Recommend evaluation by a licensed electrician experienced with aluminum wiring. COPALUM or AlumiConn remediation recommended.", severity: "major" },

  { systemId: "fireplace", condition: "good", defectType: "none", templateText: "The fireplace ([type]) was visually inspected. Firebox, damper, and visible flue components appeared in serviceable condition. No significant deficiencies noted at the time of inspection.", recommendAction: "Have chimney cleaned and inspected annually if wood-burning. Verify gas shut-off valve operation.", severity: "info" },

  { systemId: "attic", condition: "good", defectType: "none", templateText: "The attic space was inspected and found to be in serviceable condition. Insulation ([type], approximately [depth]) was present. Ventilation appeared adequate. Exhaust systems terminated to the building exterior. No significant deficiencies noted.", recommendAction: "Maintain insulation depth. Verify exhaust venting annually. Check for pest activity.", severity: "info" },
  { systemId: "attic", condition: "poor", defectType: "ventilation", templateText: "The attic space showed signs of [inadequate ventilation / improper exhaust termination / insufficient insulation]. [Specific observations.] These conditions can lead to moisture problems, mold growth, and premature roof deterioration.", recommendAction: "Recommend evaluation by a qualified contractor. Address ventilation and insulation deficiencies.", severity: "moderate" },

  { systemId: "interior", condition: "good", defectType: "none", templateText: "Interior components including walls, ceilings, floors, doors, windows, stairs, and railings were inspected and found to be in serviceable condition. Garage door safety reverse mechanism operated properly. No significant deficiencies noted.", recommendAction: "Test garage door safety reverse mechanism monthly. Maintain caulking around windows and wet areas.", severity: "info" },
  { systemId: "interior", condition: "poor", defectType: "safety_reverse", templateText: "The garage door safety reverse mechanism [did not function / was absent]. Federal law requires all automatic garage door openers to have a functioning entrapment protection device. This is a safety hazard.", recommendAction: "Recommend immediate repair or replacement of garage door opener by a qualified technician.", severity: "safety" },
];

// ── Florida Inspections ───────────────────────────────────────────────────

const FLORIDA_INSPECTIONS = [
  {
    inspectionType: "wind_mitigation",
    formNumber: "OIR-B1-1802",
    description: "Wind mitigation inspection to qualify for insurance premium discounts. Evaluates specific wind-resistant features of the home.",
    requiredSystems: ["roof"],
    requirements: [
      "Building code the home was built to (pre-2002 vs post-2002 FBC)",
      "Roof covering type (FBC or non-FBC compliant)",
      "Roof deck attachment method (plywood thickness, nail spacing, type)",
      "Roof-to-wall connection type (clips, single wraps, double wraps, structural)",
      "Roof geometry (hip vs gable vs flat — hip gets best credit)",
      "Secondary water resistance (self-adhering underlayment at deck)",
      "Opening protection (hurricane shutters, impact glass, none)",
    ],
    notes: [
      "This is a SEPARATE inspection from standard home inspection",
      "Requires attic access to verify roof-to-wall connections",
      "Photos required for each section of the 1802 form",
      "Major insurance savings in Bay and Walton County — always offer this service",
      "Homes built after 2002 to FBC generally qualify for the best discounts",
    ],
  },
  {
    inspectionType: "4_point",
    formNumber: "varies by insurer",
    description: "Insurance-required inspection covering the 4 major systems. Required by many Florida insurers for homes over 20-30 years old.",
    requiredSystems: ["roof", "electrical", "plumbing", "heating"],
    requirements: [
      "Roof: type, age, condition, estimated remaining life",
      "Electrical: panel type, amperage, wiring type, condition",
      "Plumbing: pipe material, water heater age/condition, visible leaks",
      "HVAC: type, age, condition, operational status",
    ],
    notes: [
      "Required by most Florida insurers for homes 20+ years old",
      "Some insurers require for homes 15+ years old",
      "This is a LIMITED inspection — not a full home inspection",
      "Can be offered as an add-on service or standalone",
      "Photos of each system typically required",
      "Insurers may decline coverage based on 4-point findings",
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// Mutations
// ═══════════════════════════════════════════════════════════════════════════

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function insertAllData(ctx: any) {
  let systemCount = 0;
  let defectCount = 0;
  let templateCount = 0;
  let floridaCount = 0;

  for (const system of ALL_SYSTEMS) {
    await ctx.db.insert("sopSystems", { ...system });
    systemCount++;
  }

  for (const defect of ALL_DEFECTS) {
    await ctx.db.insert("sopDefects", { ...defect });
    defectCount++;
  }

  for (const template of ALL_REPORT_TEMPLATES) {
    await ctx.db.insert("sopReportTemplates", { ...template });
    templateCount++;
  }

  for (const inspection of FLORIDA_INSPECTIONS) {
    await ctx.db.insert("floridaInspections", { ...inspection });
    floridaCount++;
  }

  return {
    status: "seeded" as const,
    systems: systemCount,
    defects: defectCount,
    templates: templateCount,
    florida: floridaCount,
  };
}

export const seedSOPData = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("sopSystems").first();
    if (existing) {
      return {
        status: "already_seeded" as const,
        systems: 0,
        defects: 0,
        templates: 0,
        florida: 0,
      };
    }
    return await insertAllData(ctx);
  },
});

export const clearAndReseedSOP = mutation({
  args: {},
  handler: async (ctx) => {
    for (const table of [
      "sopSystems",
      "sopDefects",
      "sopReportTemplates",
      "floridaInspections",
    ] as const) {
      const rows = await ctx.db.query(table).collect();
      for (const row of rows) {
        await ctx.db.delete(row._id);
      }
    }
    return await insertAllData(ctx);
  },
});
