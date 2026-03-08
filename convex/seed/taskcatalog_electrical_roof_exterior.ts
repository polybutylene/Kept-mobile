// ─────────────────────────────────────────────────────────────────────────────
// Maintenance Task Catalog — Electrical, Roof & Exterior
// 67 tasks: 9 Electrical · 9 Roof · 49 Exterior
// Source: NFPA, NEC, NRCA, manufacturer maintenance manuals, field experience
// Cost basis: 2025 US National Average
// Regional focus: Florida Panhandle / Gulf Coast hot-humid
// ─────────────────────────────────────────────────────────────────────────────

interface CostRange {
  low: number;
  high: number;
}

interface ClimateAdjustment {
  climateZone: string;
  adjustedFrequencyDays: number;
  reason: string;
}

interface TaskCatalogEntry {
  taskId: string;
  taskName: string;
  category: string;
  applicableSystemIds: string[];
  frequencyType: "interval" | "seasonal" | "condition_based";
  frequencyValue: number;
  frequencyUnit: "days";
  seasonalMonths?: number[];
  climateAdjustments?: ClimateAdjustment[];
  difficulty: "easy" | "moderate" | "hard" | "professional";
  estimatedTimeMinutes: number;
  diyCost: CostRange;
  proCost: CostRange;
  shortDescription: string;
  detailedInstructions: string;
  whyItMatters: string;
  whatHappensIfSkipped: string;
  toolsNeeded: string[];
  suppliesNeeded: string[];
  careKitProductIds: string[];
  estimatedSavings: string;
  source: "industry_standard";
  isActive: true;
  lastUpdated: number;
}

// ============================================================
// ELECTRICAL — 9 Tasks
// ============================================================

const ELECTRICAL_TASKS: TaskCatalogEntry[] = [
  // ────────────────────────────────────────────
  // 1. Panel Visual Inspection
  // ────────────────────────────────────────────
  {
    taskId: "electrical.panel_inspection",
    taskName: "Visual Panel Inspection",
    category: "electrical",
    applicableSystemIds: ["electrical.main_panel", "electrical.sub_panel"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 180, reason: "Humidity accelerates corrosion inside panels; condensation on bus bars causes arcing" },
      { climateZone: "gulf_coast", adjustedFrequencyDays: 180, reason: "Salt air and moisture create corrosion on connections and breakers" },
    ],
    difficulty: "easy",
    estimatedTimeMinutes: 15,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 75, high: 150 },
    shortDescription: "Visually inspect electrical panel for scorching, corrosion, tripped breakers, and signs of overheating.",
    detailedInstructions:
      "1. Stand on a dry surface and wear rubber-soled shoes. Never touch bus bars or wiring inside the panel.\n" +
      "2. Open the panel door (outer cover only — do NOT remove the dead front cover).\n" +
      "3. Look for any signs of scorching, burn marks, or melted plastic on or around breakers.\n" +
      "4. Check for rust, corrosion, or greenish-white deposits on the panel box or visible wiring.\n" +
      "5. Note any breakers that have tripped to the middle position and reset them by flipping fully off, then on.\n" +
      "6. Sniff for any burning or acrid odor — this indicates an active overheating issue.\n" +
      "7. Check that the panel directory (label) is accurate and all breakers are identified.\n" +
      "8. Look at the ground around the panel for signs of water intrusion or insect nesting.\n" +
      "9. Close the panel door and ensure the latch catches securely.\n" +
      "10. If you find scorching, melting, or persistent burning smell, stop using that circuit and call an electrician immediately.",
    whyItMatters: "Electrical panels are the nerve center of your home. Loose connections, corrosion, and overloaded circuits cause over 50,000 house fires per year in the US. A 15-minute visual check catches problems before they become emergencies.",
    whatHappensIfSkipped: "Corrosion progresses silently. Loose connections overheat and arc. A panel that looks fine on the outside can have melted bus bars behind the cover. The first sign of a skipped inspection is often a house fire or total panel failure during a storm when you need power most.",
    toolsNeeded: ["Flashlight"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Catching a failing breaker early saves $200-500 vs. emergency electrician call. Preventing a panel fire is priceless.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ────────────────────────────────────────────
  // 2. Exercise All Breakers
  // ────────────────────────────────────────────
  {
    taskId: "electrical.breaker_exercise",
    taskName: "Exercise All Circuit Breakers",
    category: "electrical",
    applicableSystemIds: ["electrical.main_panel", "electrical.sub_panel"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 180, reason: "Humidity causes internal corrosion that makes breakers stick faster" },
      { climateZone: "gulf_coast", adjustedFrequencyDays: 180, reason: "Salt air accelerates contact corrosion inside breaker mechanisms" },
    ],
    difficulty: "easy",
    estimatedTimeMinutes: 20,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 75, high: 150 },
    shortDescription: "Toggle each breaker fully off and back on to prevent internal contacts from seizing due to corrosion.",
    detailedInstructions:
      "1. Notify everyone in the household that power will be interrupted circuit by circuit.\n" +
      "2. Turn off sensitive electronics (computers, gaming consoles) to protect them from power cycling.\n" +
      "3. Starting at the top of the panel, firmly flip the first breaker fully to the OFF position.\n" +
      "4. Wait 5 seconds, then flip it firmly back to ON. You should feel a solid, positive click.\n" +
      "5. If a breaker feels sticky, stiff, or won't stay in position, mark it — it may need replacement.\n" +
      "6. Repeat for every breaker in the panel, working top to bottom.\n" +
      "7. Do NOT exercise the main breaker unless you are prepared for a full power outage.\n" +
      "8. After completing all breakers, verify that all circuits are back on (check a light or outlet on each).\n" +
      "9. Reset any clocks or devices that lost their settings.\n" +
      "10. Record any sticky or problematic breakers and schedule an electrician for replacement.",
    whyItMatters: "Circuit breakers are mechanical safety devices. If a breaker's internal contacts corrode and seize, it cannot trip during an overload or short circuit — defeating its entire purpose. Exercising them annually keeps the mechanism free.",
    whatHappensIfSkipped: "Breakers seize in the ON position and fail to trip during a short circuit or overload. This turns a $15 breaker replacement into a potential electrical fire. In humid climates, breakers can seize in as little as 2-3 years without exercising.",
    toolsNeeded: ["Flashlight"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Prevents stuck breakers that cost $150-300 each for emergency replacement. Avoiding one electrical fire saves tens of thousands.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ────────────────────────────────────────────
  // 3. Surge Protector Indicator Check
  // ────────────────────────────────────────────
  {
    taskId: "electrical.surge_protector_check",
    taskName: "Check Surge Protector Indicator",
    category: "electrical",
    applicableSystemIds: ["electrical.whole_house_surge"],
    frequencyType: "interval",
    frequencyValue: 30,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 14, reason: "Florida averages 80+ thunderstorm days/year — lightning events deplete surge protection rapidly" },
      { climateZone: "gulf_coast", adjustedFrequencyDays: 14, reason: "Extreme lightning frequency means surge capacity can be consumed in a single storm season" },
    ],
    difficulty: "easy",
    estimatedTimeMinutes: 5,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 50, high: 100 },
    shortDescription: "Verify the LED indicator on your whole-house surge protector confirms protection is active.",
    detailedInstructions:
      "1. Locate the whole-house surge protector — typically mounted on or near the main electrical panel.\n" +
      "2. Look for the LED indicator light on the unit. Green = protected; red or no light = depleted.\n" +
      "3. If the indicator shows green/protected, no action needed. Record the check date.\n" +
      "4. If the indicator shows red, flashing, or is dark, the surge protector has absorbed its capacity and needs replacement.\n" +
      "5. Check the unit for any visible signs of damage — burn marks, melted housing, or acrid smell.\n" +
      "6. If depleted, do NOT delay replacement — your entire electrical system is unprotected from the next surge.\n" +
      "7. Contact a licensed electrician to replace the unit (installation requires working inside the panel).\n" +
      "8. After any major storm, check the indicator as an extra precaution even if not yet due.",
    whyItMatters: "A whole-house surge protector sacrifices itself to save your HVAC system, appliances, and electronics from lightning strikes and utility surges. Once depleted, it provides zero protection — but looks the same from the outside. The only way to know is to check the indicator.",
    whatHappensIfSkipped: "A depleted surge protector is the same as having no surge protector. The next lightning strike or utility surge hits your $5,000 HVAC compressor, $2,000 refrigerator, and every electronic device in the home with full force. In Florida, this is not a matter of if — it's when.",
    toolsNeeded: ["Flashlight"],
    suppliesNeeded: [],
    careKitProductIds: ["surge_protector_replacement"],
    estimatedSavings: "A $150-300 surge protector replacement prevents $3,000-15,000 in equipment damage from a single lightning event.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ────────────────────────────────────────────
  // 4. Thermal Scan of Panel
  // ────────────────────────────────────────────
  {
    taskId: "electrical.thermal_scan",
    taskName: "Thermal Scan of Electrical Panel",
    category: "electrical",
    applicableSystemIds: ["electrical.main_panel", "electrical.sub_panel"],
    frequencyType: "interval",
    frequencyValue: 730,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 365, reason: "Humidity-driven corrosion creates hot spots faster; annual scans recommended in Gulf Coast" },
    ],
    difficulty: "professional",
    estimatedTimeMinutes: 30,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 150, high: 350 },
    shortDescription: "Professional infrared thermal scan of the electrical panel to detect hot spots, loose connections, and overloaded circuits.",
    detailedInstructions:
      "1. This task requires a licensed electrician with an infrared (IR) thermal camera.\n" +
      "2. The electrician will remove the dead front cover to expose all breakers and wiring connections.\n" +
      "3. Circuits should be under typical load during the scan — run normal appliances and HVAC.\n" +
      "4. The IR camera captures heat signatures across all breakers, bus bars, neutral bar, and connections.\n" +
      "5. Hot spots above 30°F over ambient indicate a serious problem — loose connections or failing breakers.\n" +
      "6. The electrician documents findings with thermal images showing temperature readings.\n" +
      "7. Any hot spots found are repaired immediately — typically tightening connections or replacing breakers.\n" +
      "8. After repairs, a follow-up scan confirms the issue is resolved.\n" +
      "9. The report should be kept with your home records for insurance documentation.\n" +
      "10. Schedule this every 2 years, or annually if your panel is over 20 years old.",
    whyItMatters: "Loose electrical connections are invisible to the naked eye but generate significant heat. A thermal scan is the only way to find these hidden hot spots before they cause a fire. Insurance companies increasingly require or incentivize thermal scans.",
    whatHappensIfSkipped: "A loose connection at 300°F slowly chars the surrounding insulation and panel components. By the time you smell burning or see scorching, significant damage has occurred. Thermal scanning catches problems at the early heat stage — months or years before visible damage.",
    toolsNeeded: ["IR thermal camera (professional equipment)"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Professional scan costs $150-350. Finding and fixing a loose connection before it causes a fire saves $10,000-100,000+ in fire damage.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ────────────────────────────────────────────
  // 5. Generator Exercise Test
  // ────────────────────────────────────────────
  {
    taskId: "electrical.generator_exercise_test",
    taskName: "Run Generator Exercise Test",
    category: "electrical",
    applicableSystemIds: ["electrical.generator_standby"],
    frequencyType: "interval",
    frequencyValue: 30,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 14, reason: "Hurricane season (Jun-Nov) demands higher readiness; moisture in fuel systems and condensation require more frequent runs" },
      { climateZone: "gulf_coast", adjustedFrequencyDays: 14, reason: "Storm preparedness is critical in hurricane-prone Gulf Coast — generators must be ready on short notice" },
    ],
    seasonalMonths: [6, 7, 8, 9, 10, 11],
    difficulty: "easy",
    estimatedTimeMinutes: 20,
    diyCost: { low: 0, high: 5 },
    proCost: { low: 75, high: 150 },
    shortDescription: "Run the generator for 15 minutes under load to keep the engine lubricated, battery charged, and fuel system clear.",
    detailedInstructions:
      "1. Check the generator's oil level on the dipstick — add oil if below the full mark.\n" +
      "2. Visually inspect the area around the generator for debris, animal nests, or obstructions.\n" +
      "3. Most standby generators have an automatic weekly exercise schedule — verify it is set and active.\n" +
      "4. If running manually, switch the generator to the MANUAL or TEST position on the controller.\n" +
      "5. Allow the generator to start and reach operating temperature (2-3 minutes).\n" +
      "6. Apply load by turning on several large appliances (AC, dryer, oven) or use the transfer switch load test.\n" +
      "7. Run under load for a minimum of 15 minutes — this burns off moisture and carbon deposits.\n" +
      "8. Monitor the unit for unusual sounds, vibrations, smoke, or fluid leaks.\n" +
      "9. After the run, switch back to AUTO mode so it's ready for the next power outage.\n" +
      "10. Record the run hours from the hour meter and note any issues.",
    whyItMatters: "A generator that sits idle develops stale fuel, corroded battery terminals, and dried-out seals. The worst time to discover your generator won't start is during a hurricane power outage when you need it for refrigeration, medical equipment, and safety.",
    whatHappensIfSkipped: "Fuel varnishes and clogs the carburetor or fuel injectors. The battery dies from disuse. Engine oil settles and leaves cylinder walls unprotected. When the next hurricane knocks out power for 5-14 days, you have a $15,000 lawn ornament instead of backup power.",
    toolsNeeded: ["None (generator controller)"],
    suppliesNeeded: ["Engine oil (if low)"],
    careKitProductIds: [],
    estimatedSavings: "Monthly exercise prevents $500-2,000 in generator repair bills. Having working backup power during a hurricane prevents $5,000-20,000 in spoiled food, hotel costs, and property damage.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ────────────────────────────────────────────
  // 6. Generator Oil Change
  // ────────────────────────────────────────────
  {
    taskId: "electrical.generator_oil_change",
    taskName: "Generator Oil Change",
    category: "electrical",
    applicableSystemIds: ["electrical.generator_standby"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 200, reason: "Extended run hours during hurricane season and heat stress demand more frequent oil changes" },
    ],
    difficulty: "moderate",
    estimatedTimeMinutes: 45,
    diyCost: { low: 15, high: 40 },
    proCost: { low: 100, high: 200 },
    shortDescription: "Change generator engine oil and oil filter per manufacturer schedule or every 200 operating hours.",
    detailedInstructions:
      "1. Run the generator for 5 minutes to warm the oil — warm oil drains more completely.\n" +
      "2. Turn off the generator and disconnect the battery (negative terminal first) for safety.\n" +
      "3. Place a drain pan under the oil drain plug.\n" +
      "4. Remove the drain plug and allow all oil to drain completely (5-10 minutes).\n" +
      "5. Remove and replace the oil filter. Apply a thin film of new oil to the new filter gasket before installing.\n" +
      "6. Reinstall the drain plug with a new crush washer if specified by the manufacturer.\n" +
      "7. Fill with the manufacturer-specified oil type and quantity (typically 10W-30 or synthetic 5W-30).\n" +
      "8. Reconnect the battery (positive terminal first).\n" +
      "9. Run the generator for 2 minutes, then shut off and recheck the oil level. Top off if needed.\n" +
      "10. Record the oil change date and hour meter reading. Dispose of used oil at a recycling center.",
    whyItMatters: "Generator engines run under high load and heat. Oil breaks down faster than in a car because generators often run at full rated output. Clean oil prevents premature engine wear and ensures the generator delivers full power when needed.",
    whatHappensIfSkipped: "Degraded oil loses its lubricating properties and becomes acidic, eating away at bearings and cylinder walls. The engine seizes or loses compression. A new generator engine costs $3,000-8,000 — far more than a $30 oil change.",
    toolsNeeded: ["Socket wrench set", "Oil filter wrench", "Drain pan", "Funnel", "Shop rags"],
    suppliesNeeded: ["Engine oil (per manufacturer spec)", "Oil filter", "Drain plug crush washer"],
    careKitProductIds: [],
    estimatedSavings: "A $30 oil change prevents $3,000-8,000 in engine rebuild costs.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ────────────────────────────────────────────
  // 7. Generator Battery Check
  // ────────────────────────────────────────────
  {
    taskId: "electrical.generator_battery_check",
    taskName: "Generator Battery Check",
    category: "electrical",
    applicableSystemIds: ["electrical.generator_standby"],
    frequencyType: "interval",
    frequencyValue: 180,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 90, reason: "Extreme heat accelerates battery degradation; check quarterly in hot climates" },
    ],
    difficulty: "easy",
    estimatedTimeMinutes: 15,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 50, high: 100 },
    shortDescription: "Check the generator starting battery for corrosion, proper voltage, and secure connections.",
    detailedInstructions:
      "1. Locate the generator battery compartment (consult your owner's manual for location).\n" +
      "2. Visually inspect battery terminals for white or greenish corrosion buildup.\n" +
      "3. If corrosion is present, clean terminals with a baking soda and water solution and a wire brush.\n" +
      "4. Check that both battery cables are tight — wiggle them to confirm they don't move.\n" +
      "5. Use a multimeter to check battery voltage: a healthy battery reads 12.6V or higher.\n" +
      "6. If voltage is below 12.4V, the battery is undercharged — check the charger is functioning.\n" +
      "7. If voltage is below 12.0V, the battery likely needs replacement.\n" +
      "8. Check the battery charger indicator light — it should show the charger is active and maintaining charge.\n" +
      "9. For flooded batteries, check electrolyte level and add distilled water if plates are exposed.\n" +
      "10. Record the voltage reading and any maintenance performed.",
    whyItMatters: "The battery is the only way your standby generator starts during a power outage. If the battery is dead, the generator cannot start — and it's always discovered at the worst possible time during a blackout.",
    whatHappensIfSkipped: "Battery terminals corrode, breaking the electrical connection. The battery slowly dies from sulfation. During the next power outage, the generator sits silent while your home goes dark. Generator batteries in hot climates typically last only 2-3 years.",
    toolsNeeded: ["Multimeter", "Wire brush", "Adjustable wrench"],
    suppliesNeeded: ["Baking soda", "Distilled water (for flooded batteries)", "Terminal protector spray"],
    careKitProductIds: [],
    estimatedSavings: "A $75-150 battery replacement is far cheaper than the $500-2,000 consequences of a generator that won't start during a hurricane.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ────────────────────────────────────────────
  // 8. Generator Professional Annual Service
  // ────────────────────────────────────────────
  {
    taskId: "electrical.generator_annual_service",
    taskName: "Generator Professional Service",
    category: "electrical",
    applicableSystemIds: ["electrical.generator_standby"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "professional",
    estimatedTimeMinutes: 120,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 200, high: 500 },
    shortDescription: "Comprehensive professional service including oil change, filter replacement, load bank test, transfer switch test, and full system inspection.",
    detailedInstructions:
      "1. A certified generator technician performs a complete visual and mechanical inspection.\n" +
      "2. Engine oil and oil filter are changed (if not recently done).\n" +
      "3. Air filter is inspected and replaced if dirty.\n" +
      "4. Spark plugs are inspected and replaced as needed (every 2 years or 200 hours typically).\n" +
      "5. Coolant level and condition are checked (liquid-cooled units); coolant is replaced per schedule.\n" +
      "6. The automatic transfer switch (ATS) is tested for proper operation — simulating a utility outage.\n" +
      "7. A load bank test is performed to verify the generator can deliver full rated output.\n" +
      "8. All electrical connections are inspected and tightened.\n" +
      "9. Fuel system is inspected for leaks; fuel filter is replaced.\n" +
      "10. The technician provides a service report documenting findings, repairs, and recommendations.",
    whyItMatters: "Standby generators are complex machines with engines, electrical systems, fuel systems, and automatic controls. Professional service catches wear items before they fail and verifies the entire system works as designed — including the critical transfer switch.",
    whatHappensIfSkipped: "Small problems compound: a worn spark plug reduces starting reliability, a clogged fuel filter starves the engine under load, a corroded transfer switch contact fails to switch. During a hurricane, multiple small issues combine into total failure when you need the generator most.",
    toolsNeeded: ["Professional generator service tools"],
    suppliesNeeded: ["Oil", "Oil filter", "Air filter", "Spark plugs", "Fuel filter", "Coolant"],
    careKitProductIds: [],
    estimatedSavings: "Annual $300 service maintains a $10,000-30,000 investment and prevents $2,000-5,000 in major repairs.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ────────────────────────────────────────────
  // 9. EV Charger Inspection
  // ────────────────────────────────────────────
  {
    taskId: "electrical.ev_charger_inspection",
    taskName: "EV Charger Inspection",
    category: "electrical",
    applicableSystemIds: ["electrical.ev_charger"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 180, reason: "Humidity and heat degrade cable insulation and connector pins faster; check biannually in hot climates" },
      { climateZone: "gulf_coast", adjustedFrequencyDays: 180, reason: "Salt air corrodes connector pins; outdoor or garage-mounted units see accelerated wear" },
    ],
    difficulty: "moderate",
    estimatedTimeMinutes: 20,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 100, high: 200 },
    shortDescription: "Inspect EV charger cable, connector, mounting, and connections for wear, damage, and overheating signs.",
    detailedInstructions:
      "1. Unplug the charger from the vehicle and power off the unit if it has a disconnect.\n" +
      "2. Inspect the full length of the charging cable for cuts, cracks, kinks, or exposed wire.\n" +
      "3. Examine the connector (J1772 or Tesla) for burn marks, discoloration, or bent pins.\n" +
      "4. Check the connector release button for smooth operation.\n" +
      "5. Inspect the wall-mount bracket or pedestal for secure mounting — tighten if loose.\n" +
      "6. For hardwired units, check the conduit and junction box for any signs of overheating or damage.\n" +
      "7. For plug-in units, inspect the NEMA 14-50 or 6-50 plug for scorch marks or loose fit in the outlet.\n" +
      "8. Clean the connector pins with a dry cloth — never use water or solvents on electrical contacts.\n" +
      "9. Power the unit back on and verify the status indicator shows normal operation.\n" +
      "10. Test a charge session to confirm the vehicle charges at the expected rate.",
    whyItMatters: "EV chargers draw 30-50 amps continuously for hours — more sustained load than almost anything else in your home. A loose connection or damaged cable at these amperages generates dangerous heat. Regular inspection ensures safe, reliable charging.",
    whatHappensIfSkipped: "A damaged cable can overheat and start a fire. Corroded connector pins reduce charging speed and can arc. A loose wall plug at 50 amps generates enough heat to melt the outlet and ignite surrounding materials. EV charger fires, while rare, cause significant garage and vehicle damage.",
    toolsNeeded: ["Flashlight", "Screwdriver"],
    suppliesNeeded: ["Dry cleaning cloth"],
    careKitProductIds: [],
    estimatedSavings: "Preventing a charger-related fire saves thousands in property damage. Catching a failing connector early avoids $300-800 in charger replacement.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
];

// ============================================================
// ROOF — 9 Tasks
// ============================================================

const ROOF_TASKS: TaskCatalogEntry[] = [
  // ────────────────────────────────────────────
  // 1. Roof Visual Inspection
  // ────────────────────────────────────────────
  {
    taskId: "roof.visual_inspection",
    taskName: "Roof Visual Inspection",
    category: "roof",
    applicableSystemIds: ["roof.asphalt_shingle", "roof.metal", "roof.tile_concrete"],
    frequencyType: "seasonal",
    frequencyValue: 180,
    frequencyUnit: "days",
    seasonalMonths: [3, 4, 9, 10],
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 120, reason: "Hurricane season demands pre-storm and post-storm inspections; UV damage visible sooner" },
      { climateZone: "gulf_coast", adjustedFrequencyDays: 120, reason: "Storm season and extreme UV require more frequent monitoring" },
    ],
    difficulty: "easy",
    estimatedTimeMinutes: 30,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 100, high: 300 },
    shortDescription: "Biannual visual inspection of roof covering for missing, damaged, or deteriorating materials using binoculars from the ground or a careful walk.",
    detailedInstructions:
      "1. Start from the ground using binoculars — scan all visible roof surfaces systematically.\n" +
      "2. Look for missing, curling, cracked, or buckled shingles (or displaced tiles/lifted metal panels).\n" +
      "3. Check all flashings around chimneys, vents, skylights, and wall junctions for gaps or lifting.\n" +
      "4. Look for dark streaks or stains that indicate algae growth or water channeling.\n" +
      "5. Inspect the ridge line for any sagging, waviness, or missing ridge caps.\n" +
      "6. Check valleys (where two roof planes meet) for accumulated debris or worn material.\n" +
      "7. Examine visible boot flashings around pipe penetrations for cracking or separation.\n" +
      "8. Look at the eaves and fascia for water stains, rot, or paint peeling — signs of roof edge leaks.\n" +
      "9. If safely accessible, walk the roof (soft-soled shoes, dry conditions only) for a closer look.\n" +
      "10. Document any issues with photos and notes for repair scheduling or insurance purposes.",
    whyItMatters: "Your roof is the first line of defense against water intrusion, the most destructive force to a home's structure. Small issues like a missing shingle or cracked boot become major leaks within one rainstorm. Catching damage early keeps repair costs under $500 instead of $5,000+.",
    whatHappensIfSkipped: "A single missing shingle admits water that travels along the decking, soaking insulation, rotting framing, and growing mold — all hidden from view. By the time a ceiling stain appears, thousands of dollars in structural damage has already occurred.",
    toolsNeeded: ["Binoculars", "Camera or smartphone", "Ladder (if walking roof)"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "A $200 inspection that catches a $300 repair prevents $5,000-20,000 in water damage and mold remediation.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ────────────────────────────────────────────
  // 2. Clean Gutters and Downspouts
  // ────────────────────────────────────────────
  {
    taskId: "roof.gutter_clean",
    taskName: "Clean Gutters and Downspouts",
    category: "roof",
    applicableSystemIds: ["exterior.gutters.aluminum"],
    frequencyType: "seasonal",
    frequencyValue: 180,
    frequencyUnit: "days",
    seasonalMonths: [3, 4, 10, 11],
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 90, reason: "Pine needles, oak pollen, and tropical debris clog gutters faster; clean quarterly" },
      { climateZone: "gulf_coast", adjustedFrequencyDays: 90, reason: "Heavy seasonal pollen, leaf drop, and storm debris require quarterly cleaning" },
    ],
    difficulty: "moderate",
    estimatedTimeMinutes: 60,
    diyCost: { low: 0, high: 20 },
    proCost: { low: 100, high: 250 },
    shortDescription: "Remove debris from all gutters and flush downspouts to ensure proper drainage away from the foundation.",
    detailedInstructions:
      "1. Set up a sturdy ladder on firm, level ground. Never lean a ladder against gutters — they will bend.\n" +
      "2. Wear work gloves to protect from sharp metal edges and debris.\n" +
      "3. Starting at a downspout end, scoop debris out of the gutter by hand or with a gutter scoop.\n" +
      "4. Drop debris into a bucket hung on the ladder or onto a tarp below — don't leave piles on the roof.\n" +
      "5. Work your way along each gutter run, moving the ladder frequently (never overreach).\n" +
      "6. After removing solids, flush gutters with a garden hose from the end farthest from the downspout.\n" +
      "7. Watch the water flow into each downspout — slow drainage indicates a clog inside.\n" +
      "8. For clogged downspouts, use a plumber's snake or high-pressure nozzle to clear the blockage.\n" +
      "9. Check that downspout extensions direct water at least 4-6 feet away from the foundation.\n" +
      "10. While cleaning, note any gutter sections that sag, leak at seams, or have damaged hangers.",
    whyItMatters: "Gutters direct thousands of gallons of rainwater away from your foundation every year. When clogged, water overflows directly against the house — eroding soil, saturating foundations, and backing up under roof shingles causing fascia rot and attic leaks.",
    whatHappensIfSkipped: "Clogged gutters overflow and pour water against the foundation, causing settling, cracks, and potential flooding. Standing water in gutters breeds mosquitoes, corrodes metal, and adds weight that pulls gutters off the fascia. In Florida's heavy rains, clogged gutters cause damage within a single storm season.",
    toolsNeeded: ["Sturdy ladder", "Work gloves", "Gutter scoop or trowel", "Garden hose", "Bucket"],
    suppliesNeeded: ["Gutter sealant (for minor leaks found during cleaning)"],
    careKitProductIds: ["gutter_guard", "gutter_sealant"],
    estimatedSavings: "DIY cleaning saves $100-250 per service. Preventing foundation water damage saves $2,000-10,000 in repairs.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ────────────────────────────────────────────
  // 3. Post-Storm Roof Inspection
  // ────────────────────────────────────────────
  {
    taskId: "roof.post_storm_inspection",
    taskName: "Post-Storm Roof Inspection",
    category: "roof",
    applicableSystemIds: ["roof.asphalt_shingle", "roof.metal", "roof.tile_concrete"],
    frequencyType: "condition_based",
    frequencyValue: 0,
    frequencyUnit: "days",
    seasonalMonths: [6, 7, 8, 9, 10, 11],
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 0, reason: "Trigger after any hurricane, tropical storm, or severe thunderstorm with hail or 60+ mph winds" },
      { climateZone: "gulf_coast", adjustedFrequencyDays: 0, reason: "Gulf Coast sees multiple severe weather events per season; inspect after each" },
    ],
    difficulty: "moderate",
    estimatedTimeMinutes: 45,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 150, high: 400 },
    shortDescription: "Inspect the roof after hurricanes, tropical storms, or severe weather for wind damage, debris impact, and water intrusion.",
    detailedInstructions:
      "1. Wait until the storm has fully passed and conditions are safe — no downed power lines or standing water near the home.\n" +
      "2. Walk the perimeter of the home looking for shingles, tiles, or metal panels on the ground.\n" +
      "3. From the ground with binoculars, scan the roof for missing, lifted, or displaced covering material.\n" +
      "4. Check all flashings, ridge caps, and edge metal for lifting or displacement.\n" +
      "5. Look for tree limbs or debris on the roof that may have caused punctures.\n" +
      "6. Inspect the attic (if accessible) with a flashlight for any daylight coming through or signs of moisture.\n" +
      "7. Check ceilings inside the home for new water stains, drips, or bubbling paint.\n" +
      "8. If you find damage, photograph everything thoroughly for insurance documentation.\n" +
      "9. Apply temporary tarping or sealant to any active leaks to prevent further water intrusion.\n" +
      "10. File an insurance claim promptly — most policies require reporting within a specific timeframe after a storm.",
    whyItMatters: "Hurricane and severe storm damage to a roof often looks minor from the ground but creates hidden entry points for water. In Florida, a storm can lift hundreds of shingles, break tile, or unseat metal panels. Prompt inspection and documentation protects your insurance claim and prevents cascading water damage.",
    whatHappensIfSkipped: "Undetected storm damage allows water intrusion with every subsequent rain. Hidden leaks cause mold growth within 48-72 hours in humid climates. Insurance claims have time limits — missing the window means paying for repairs out of pocket. What starts as a $1,000 shingle repair becomes a $15,000 mold remediation.",
    toolsNeeded: ["Binoculars", "Flashlight", "Camera or smartphone", "Ladder"],
    suppliesNeeded: ["Roofing tarp (for emergency cover)", "Roofing cement or sealant"],
    careKitProductIds: [],
    estimatedSavings: "Timely insurance filing recovers $5,000-25,000 in storm damage repairs. Preventing secondary water damage saves an additional $5,000-15,000.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ────────────────────────────────────────────
  // 4. Attic Ventilation Check
  // ────────────────────────────────────────────
  {
    taskId: "roof.attic_ventilation_check",
    taskName: "Check Attic Ventilation",
    category: "roof",
    applicableSystemIds: ["roof.asphalt_shingle", "roof.metal", "roof.tile_concrete"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    seasonalMonths: [4, 5],
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 180, reason: "Attics reach 150°F+ in Florida summers; inadequate ventilation cooks shingles from below and traps moisture" },
    ],
    difficulty: "moderate",
    estimatedTimeMinutes: 30,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 100, high: 250 },
    shortDescription: "Verify soffit vents, ridge vents, and attic fans are clear and functioning to prevent heat and moisture buildup.",
    detailedInstructions:
      "1. From outside, visually check that soffit vents are not blocked by paint, debris, or insulation.\n" +
      "2. Verify ridge vent is intact and not clogged with debris or animal nesting material.\n" +
      "3. Enter the attic during daylight — you should see light through soffit vents (if blocked, they need clearing).\n" +
      "4. Check that insulation is not pushed against or covering soffit vent openings (install baffles if so).\n" +
      "5. Feel for air movement near soffit vents — you should feel a slight draft.\n" +
      "6. If you have a powered attic fan, test its operation: it should activate when attic temp exceeds 100-110°F.\n" +
      "7. Check the attic fan thermostat and humidistat for proper settings.\n" +
      "8. Look for signs of moisture — mold on sheathing, rust on nail tips, or damp insulation.\n" +
      "9. Check gable vents (if present) for screen damage or pest intrusion.\n" +
      "10. The rule of thumb: 1 sq ft of net free ventilation area per 150 sq ft of attic floor (or 1:300 with balanced intake/exhaust).",
    whyItMatters: "Proper attic ventilation is the single most important factor in roof longevity. In hot climates, a poorly ventilated attic reaches 150-170°F, literally baking shingles from below and cutting their lifespan by 25-40%. Trapped moisture causes mold and wood rot on the roof deck.",
    whatHappensIfSkipped: "Shingles deteriorate from both sides — sun above and superheated attic below. The roof deck warps and rots from trapped moisture. Cooling costs spike as the HVAC fights a 160°F heat source directly above it. You replace a roof 5-10 years earlier than necessary — a $10,000-25,000 premature expense.",
    toolsNeeded: ["Flashlight", "Ladder", "Thermometer (optional)"],
    suppliesNeeded: ["Vent baffles (if insulation is blocking soffits)"],
    careKitProductIds: [],
    estimatedSavings: "Proper ventilation extends roof life by 5-10 years, saving $10,000-25,000. Reduces cooling costs by $200-400/year.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ────────────────────────────────────────────
  // 5. Moss/Algae Treatment
  // ────────────────────────────────────────────
  {
    taskId: "roof.moss_algae_treatment",
    taskName: "Treat Moss and Algae",
    category: "roof",
    applicableSystemIds: ["roof.asphalt_shingle", "roof.tile_concrete"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    seasonalMonths: [3, 4],
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 180, reason: "Warm, humid conditions create year-round algae growth; treat biannually in Florida" },
      { climateZone: "gulf_coast", adjustedFrequencyDays: 180, reason: "Persistent humidity and tree shade drive aggressive algae and moss colonization" },
    ],
    difficulty: "moderate",
    estimatedTimeMinutes: 60,
    diyCost: { low: 20, high: 50 },
    proCost: { low: 200, high: 500 },
    shortDescription: "Apply algae/moss treatment to prevent dark staining and biological degradation of roofing material.",
    detailedInstructions:
      "1. Choose a cool, overcast day for treatment — chemicals evaporate too quickly in direct sun.\n" +
      "2. Protect landscaping below by wetting plants and covering sensitive areas with plastic sheeting.\n" +
      "3. Mix a 50/50 solution of household bleach and water in a pump sprayer, or use a commercial roof cleaner.\n" +
      "4. Starting at the ridge, spray the solution evenly across affected areas — work downward.\n" +
      "5. Allow the solution to sit for 15-20 minutes. Do NOT pressure wash — it destroys shingle granules.\n" +
      "6. Rinse gently with a garden hose from the ridge down. Let gravity do the work.\n" +
      "7. For moss, gently scrape thick patches with a soft brush before treatment — never use a wire brush.\n" +
      "8. Install zinc or copper strips along the ridge line to prevent future growth (rain washes down metal ions).\n" +
      "9. Trim overhanging tree branches to increase sunlight and airflow on the roof surface.\n" +
      "10. Rinse landscaping thoroughly after treatment to neutralize any runoff.",
    whyItMatters: "Black algae streaks (Gloeocapsa magma) are not just cosmetic — they feed on the limestone filler in shingles, breaking down the granule bond. Moss roots penetrate between and under shingles, lifting them and creating water entry points. Treatment preserves both appearance and structural integrity.",
    whatHappensIfSkipped: "Algae turns your roof into a dark heat-absorbing surface, increasing cooling costs. Moss growth lifts shingles and allows water penetration. Both organisms hold moisture against the roof surface, accelerating rot. An untreated roof in Florida can lose 5-8 years of lifespan to biological growth alone.",
    toolsNeeded: ["Pump sprayer", "Garden hose", "Soft-bristle brush", "Ladder", "Safety harness"],
    suppliesNeeded: ["Roof cleaning solution or bleach", "Zinc or copper ridge strips", "Plastic sheeting for landscaping"],
    careKitProductIds: [],
    estimatedSavings: "DIY treatment at $30-50 saves $200-500 vs. pro cleaning. Extending roof life by 5+ years saves $10,000-20,000 in premature replacement.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ────────────────────────────────────────────
  // 6. Roof Fastener Check (Metal Roof)
  // ────────────────────────────────────────────
  {
    taskId: "roof.fastener_check",
    taskName: "Check Roof Fasteners and Screws",
    category: "roof",
    applicableSystemIds: ["roof.metal"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    seasonalMonths: [3, 4],
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 180, reason: "Thermal expansion cycles and hurricane-force winds loosen fasteners faster in Gulf Coast climate" },
      { climateZone: "gulf_coast", adjustedFrequencyDays: 180, reason: "Salt air corrodes screw heads and rubber washers; check biannually near coast" },
    ],
    difficulty: "moderate",
    estimatedTimeMinutes: 45,
    diyCost: { low: 5, high: 20 },
    proCost: { low: 150, high: 350 },
    shortDescription: "Inspect exposed fastener metal roof screws for looseness, backed-out screws, and degraded rubber washers.",
    detailedInstructions:
      "1. This task applies to exposed-fastener metal roofs. Standing seam roofs use concealed clips and rarely need this.\n" +
      "2. Safely access the roof in dry conditions with soft-soled shoes.\n" +
      "3. Walk the roof systematically, checking each visible screw.\n" +
      "4. Look for screws that have backed out — they'll be visibly raised above the panel surface.\n" +
      "5. Gently tug on backed-out screws. If loose, tighten with a nut driver to snug (do not overtighten).\n" +
      "6. Check the rubber washers on each screw for cracking, deterioration, or missing pieces.\n" +
      "7. Replace any screws with damaged washers — a compromised washer lets water in around the screw hole.\n" +
      "8. Look for rust staining around screws, which indicates the screw or washer is failing.\n" +
      "9. Check panel overlap seams for gaps or lifting.\n" +
      "10. Document how many screws needed attention and note areas for follow-up.",
    whyItMatters: "Every exposed fastener on a metal roof is a potential leak point. Thermal expansion and contraction cycles — heating to 160°F in sun and cooling at night — slowly back screws out. In hurricane zones, one loose panel can peel off and become a projectile.",
    whatHappensIfSkipped: "Backed-out screws let water penetrate with every rain. Deteriorated washers fail silently. In a hurricane, loose panels catch wind and peel off in sequence — one loose panel can lead to total roof loss. Replacing scattered screws costs $50-200; re-roofing costs $12,000-40,000.",
    toolsNeeded: ["Nut driver or screw gun", "Soft-soled shoes", "Safety harness"],
    suppliesNeeded: ["Replacement metal roofing screws with neoprene washers"],
    careKitProductIds: [],
    estimatedSavings: "A $50 box of screws prevents $500-2,000 in leak repairs. Keeping panels secure prevents catastrophic wind loss.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ────────────────────────────────────────────
  // 7. Flashing Sealant Inspection
  // ────────────────────────────────────────────
  {
    taskId: "roof.sealant_inspection",
    taskName: "Inspect Flashing Sealant",
    category: "roof",
    applicableSystemIds: ["roof.asphalt_shingle", "roof.metal", "roof.tile_concrete"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    seasonalMonths: [3, 4],
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 180, reason: "Extreme UV and thermal cycling degrade sealants twice as fast in Florida" },
      { climateZone: "gulf_coast", adjustedFrequencyDays: 180, reason: "UV, heat, and storm-driven rain demand biannual sealant checks" },
    ],
    difficulty: "moderate",
    estimatedTimeMinutes: 30,
    diyCost: { low: 5, high: 20 },
    proCost: { low: 100, high: 250 },
    shortDescription: "Inspect all flashing sealant around penetrations, valleys, and transitions for cracking, separation, and gaps.",
    detailedInstructions:
      "1. Safely access the roof or use binoculars for a ground-level inspection of visible flashings.\n" +
      "2. Check sealant around all pipe boot flashings — these are the most common leak source.\n" +
      "3. Inspect chimney flashings for gaps between the step flashing and counter flashing.\n" +
      "4. Check skylight flashings for cracked or separated sealant along all four edges.\n" +
      "5. Examine wall-to-roof transitions for lifted or separated flashing.\n" +
      "6. Press on sealant with a finger (if accessible) — it should be flexible, not brittle.\n" +
      "7. Apply fresh roofing sealant (polyurethane or butyl-based) to any cracked or separated areas.\n" +
      "8. For pipe boots with cracked rubber collars, apply a pipe boot repair collar or schedule replacement.\n" +
      "9. Check valley flashings for proper overlap and sealed seams.\n" +
      "10. Document any areas where sealant has failed for follow-up repair.",
    whyItMatters: "Flashings and sealants are where different roof materials meet — and where 90% of roof leaks originate. Sealant is a sacrificial material that degrades from UV and thermal cycling. Annual inspection catches failures before they become leaks.",
    whatHappensIfSkipped: "Every cracked sealant joint is an open invitation for water. Pipe boot leaks are the #1 source of insurance claims for interior water damage. A $10 tube of sealant applied in time prevents $2,000-5,000 in ceiling and drywall repairs.",
    toolsNeeded: ["Caulk gun", "Flashlight", "Putty knife", "Ladder or binoculars"],
    suppliesNeeded: ["Roofing sealant (polyurethane-based)", "Pipe boot repair collar (if needed)"],
    careKitProductIds: [],
    estimatedSavings: "$10-20 in sealant prevents $2,000-5,000 in water damage repairs per leak point.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ────────────────────────────────────────────
  // 8. Re-seat Loose Tiles
  // ────────────────────────────────────────────
  {
    taskId: "roof.tile_reseating",
    taskName: "Re-seat Loose Roof Tiles",
    category: "roof",
    applicableSystemIds: ["roof.tile_concrete"],
    frequencyType: "condition_based",
    frequencyValue: 0,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 0, reason: "Hurricane winds shift tiles; check and re-seat after every significant storm event" },
      { climateZone: "gulf_coast", adjustedFrequencyDays: 0, reason: "Wind-driven rain enters under displaced tiles; prompt re-seating critical" },
    ],
    difficulty: "professional",
    estimatedTimeMinutes: 120,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 200, high: 600 },
    shortDescription: "Professionally re-seat loose, shifted, or displaced concrete or clay roof tiles to restore weather protection.",
    detailedInstructions:
      "1. This task requires a professional roofer — tile roofs are fragile and walking on them incorrectly cracks tiles.\n" +
      "2. The roofer will identify all loose, shifted, cracked, or missing tiles from a systematic roof walk.\n" +
      "3. Loose tiles are carefully lifted and the underlayment beneath is inspected for tears or deterioration.\n" +
      "4. Damaged underlayment sections are patched or noted for larger repair if widespread.\n" +
      "5. Tiles are re-seated in their proper position with correct overlap and alignment.\n" +
      "6. Mechanical fasteners (clips, screws, or wire ties) are inspected and replaced as needed.\n" +
      "7. Adhesive (foam or mortar) is applied per the original installation spec where required.\n" +
      "8. Cracked tiles are replaced with matching spares (keep a supply of matching tiles on hand).\n" +
      "9. Field tiles, hip tiles, and ridge tiles are all checked for secure seating.\n" +
      "10. The roofer provides a report documenting which tiles were serviced and any underlayment concerns.",
    whyItMatters: "A tile roof's covering material can last 50-75 years, but individual tiles shift from wind, thermal movement, and settling. Each displaced tile exposes the underlayment beneath to direct UV and rain — and the underlayment is the actual waterproofing layer.",
    whatHappensIfSkipped: "Displaced tiles expose the underlayment to UV degradation — a process that accelerates rapidly once started. The underlayment cracks and lets water through to the deck. In hurricane zones, loose tiles become high-velocity projectiles that damage neighboring properties and void your wind insurance mitigation credit.",
    toolsNeeded: ["Professional roofing tools", "Tile hooks", "Adhesive applicator"],
    suppliesNeeded: ["Replacement tiles", "Roofing adhesive", "Mechanical fasteners"],
    careKitProductIds: [],
    estimatedSavings: "Re-seating loose tiles at $200-600 prevents $5,000-15,000 in underlayment replacement and water damage repairs.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ────────────────────────────────────────────
  // 9. Underlayment Inspection from Attic
  // ────────────────────────────────────────────
  {
    taskId: "roof.underlayment_inspection",
    taskName: "Inspect Underlayment from Attic",
    category: "roof",
    applicableSystemIds: ["roof.asphalt_shingle", "roof.metal", "roof.tile_concrete"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    seasonalMonths: [9, 10],
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 180, reason: "Florida attic temperatures bake underlayment from below; inspect biannually for early deterioration" },
    ],
    difficulty: "moderate",
    estimatedTimeMinutes: 30,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 100, high: 250 },
    shortDescription: "Inspect the roof underlayment from the attic side for moisture stains, daylight penetration, and deterioration.",
    detailedInstructions:
      "1. Access the attic during or just after rain for the best chance of spotting active leaks.\n" +
      "2. Bring a powerful flashlight and wear a dust mask — attic insulation irritates lungs.\n" +
      "3. Walk only on joists or a plywood walkway — never step on insulation or drywall between joists.\n" +
      "4. Look for any daylight coming through the roof deck — this indicates missing or damaged covering.\n" +
      "5. Check the underside of the roof deck for dark stains, which indicate past or active water penetration.\n" +
      "6. Feel the deck sheathing — it should be dry and firm. Soft or spongy wood means rot.\n" +
      "7. Look for mold or mildew growth on sheathing — white, black, or green patches.\n" +
      "8. Inspect around all roof penetrations (plumbing vents, exhaust fans) for water trails.\n" +
      "9. Check the attic floor insulation for wet spots or compressed areas below leak paths.\n" +
      "10. Note any findings with photos — mark problem areas with painter's tape for easy re-location.",
    whyItMatters: "The roof deck and underlayment are hidden from exterior inspection. Attic-side inspection reveals leaks, moisture problems, and deck deterioration that can't be seen from above. For tile roofs, the underlayment is the actual waterproofing — and it deteriorates years before the tiles.",
    whatHappensIfSkipped: "A slow leak goes undetected from outside for years while it rots the deck, soaks insulation, and grows mold. By the time it reaches the ceiling, the damage has spread far beyond the leak point. Mold remediation in an attic costs $3,000-10,000. Deck replacement during re-roofing adds $5,000-15,000.",
    toolsNeeded: ["Powerful flashlight or headlamp", "Dust mask or N95 respirator", "Painter's tape"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Early detection of a deck leak saves $3,000-15,000 in mold remediation and structural repairs.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
];

// ============================================================
// EXTERIOR — 49 Tasks
// ============================================================

const EXTERIOR_TASKS: TaskCatalogEntry[] = [
  // ================================================================
  // GUTTERS & DOWNSPOUTS (3 tasks)
  // ================================================================

  // ────────────────────────────────────────────
  // 1. Clean Gutters
  // ────────────────────────────────────────────
  {
    taskId: "exterior.gutter_clean",
    taskName: "Clean Gutters",
    category: "exterior",
    applicableSystemIds: ["exterior.gutters.aluminum"],
    frequencyType: "seasonal",
    frequencyValue: 180,
    frequencyUnit: "days",
    seasonalMonths: [3, 4, 10, 11],
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 90, reason: "Pine needles, oak debris, and heavy tropical rains demand quarterly cleaning" },
      { climateZone: "gulf_coast", adjustedFrequencyDays: 90, reason: "Year-round foliage drop and intense rainstorms clog gutters faster" },
    ],
    difficulty: "moderate",
    estimatedTimeMinutes: 60,
    diyCost: { low: 0, high: 20 },
    proCost: { low: 100, high: 250 },
    shortDescription: "Remove leaves, debris, and sediment from all gutters to maintain proper water drainage.",
    detailedInstructions:
      "1. Set up a sturdy extension ladder on firm, level ground. Use a ladder stabilizer to avoid denting gutters.\n" +
      "2. Wear heavy work gloves — metal gutter edges and hidden screws can cause deep cuts.\n" +
      "3. Start at the end opposite the downspout. Scoop debris by hand or with a plastic gutter scoop.\n" +
      "4. Deposit debris into a bucket or onto a ground tarp — never push debris into downspouts.\n" +
      "5. Move the ladder frequently. Never lean more than arm's reach to either side.\n" +
      "6. After removing solids, flush the entire gutter run with a garden hose toward the downspout.\n" +
      "7. Watch the flow rate at the downspout — slow flow means a partial clog inside.\n" +
      "8. Clear clogged downspouts with a plumber's snake fed from the top or a pressure nozzle from the bottom.\n" +
      "9. While cleaning, check for standing water in sections — this indicates improper slope (should be ¼\" drop per 10 ft).\n" +
      "10. Note any rust spots, separated seams, or sagging sections for repair.",
    whyItMatters: "Gutters are your home's rainwater management system. In Florida, a typical home channels 1,000+ gallons per hour during heavy rain. Clogged gutters overflow against the house, undermining foundations and saturating walls.",
    whatHappensIfSkipped: "Overflowing gutters pour water directly against the foundation, causing erosion, settling, and potential flooding. Debris decomposes into a moist paste that corrodes aluminum and weighs down gutter hangers. Standing water breeds mosquitoes — a health concern in Gulf Coast climates.",
    toolsNeeded: ["Extension ladder", "Ladder stabilizer", "Work gloves", "Gutter scoop", "Garden hose", "Bucket"],
    suppliesNeeded: ["Gutter sealant (for minor leaks)"],
    careKitProductIds: ["gutter_guard", "gutter_sealant"],
    estimatedSavings: "DIY saves $100-250 per cleaning. Preventing foundation damage saves $2,000-10,000.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ────────────────────────────────────────────
  // 2. Inspect Gutter Hangers and Slope
  // ────────────────────────────────────────────
  {
    taskId: "exterior.gutter_inspect_hangers",
    taskName: "Inspect Gutter Hangers and Slope",
    category: "exterior",
    applicableSystemIds: ["exterior.gutters.aluminum"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 180, reason: "Heavy rain loads and debris weight stress hangers more in tropical climates" },
    ],
    difficulty: "easy",
    estimatedTimeMinutes: 20,
    diyCost: { low: 0, high: 10 },
    proCost: { low: 75, high: 150 },
    shortDescription: "Check gutter hangers for secure attachment and verify proper slope toward downspouts.",
    detailedInstructions:
      "1. From a ladder, visually inspect each gutter hanger along the full run.\n" +
      "2. Gently push up on the gutter between hangers — there should be minimal flex or sag.\n" +
      "3. If a section sags, the hanger has pulled loose from the fascia. Reattach with a longer screw into solid wood.\n" +
      "4. Check hanger spacing — they should be every 24-36 inches (closer in heavy rainfall areas).\n" +
      "5. Look for rust or corrosion on metal hangers.\n" +
      "6. Verify slope by running water from a hose — water should flow steadily toward each downspout with no ponding.\n" +
      "7. Ideal slope is ¼ inch drop per 10 feet of gutter run.\n" +
      "8. For runs longer than 40 feet, there should be a downspout at each end with a high point in the middle.\n" +
      "9. Adjust hangers up or down to correct slope if water pools in sections.\n" +
      "10. Replace any bent, corroded, or broken hangers.",
    whyItMatters: "Gutters only work when properly sloped and securely attached. A sagging gutter holds standing water that breeds mosquitoes, adds weight stress, and eventually pulls away from the fascia entirely — usually during a storm when you need it most.",
    whatHappensIfSkipped: "Sagging gutters pool water, overflow at the low point (often at the foundation), and add increasing weight that accelerates the sag. Eventually the gutter separates from the fascia, causing fascia rot and leaving the roof edge unprotected from runoff.",
    toolsNeeded: ["Ladder", "Drill/driver", "Level or string line", "Garden hose"],
    suppliesNeeded: ["Replacement gutter hangers", "3-inch stainless steel screws"],
    careKitProductIds: [],
    estimatedSavings: "A $10 hanger replacement prevents gutter failure and $500-1,500 in fascia repair.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ────────────────────────────────────────────
  // 3. Check Downspout Extensions
  // ────────────────────────────────────────────
  {
    taskId: "exterior.downspout_check",
    taskName: "Check Downspout Extensions",
    category: "exterior",
    applicableSystemIds: ["exterior.gutters.aluminum"],
    frequencyType: "seasonal",
    frequencyValue: 180,
    frequencyUnit: "days",
    seasonalMonths: [3, 9],
    difficulty: "easy",
    estimatedTimeMinutes: 15,
    diyCost: { low: 0, high: 15 },
    proCost: { low: 50, high: 100 },
    shortDescription: "Verify downspout extensions direct water at least 4-6 feet away from the foundation.",
    detailedInstructions:
      "1. Walk the perimeter and locate every downspout discharge point.\n" +
      "2. Verify each downspout has an extension or splash block directing water away from the foundation.\n" +
      "3. Measure the discharge distance — water should exit at least 4-6 feet from the foundation wall.\n" +
      "4. Check that extensions point downhill, away from the house — not toward a walkway or neighbor's property.\n" +
      "5. Re-attach any extensions that have been knocked off by lawn equipment or foot traffic.\n" +
      "6. For underground drain lines, run water from a hose into the downspout and verify it exits at the pop-up emitter.\n" +
      "7. If the underground line is slow, it may be clogged — snake or flush with a pressure washer.\n" +
      "8. Check splash blocks for proper positioning — they should be angled away from the house.\n" +
      "9. Look for erosion patterns near discharge points that indicate concentrated water flow.\n" +
      "10. Add extensions or redirect drainage if any downspout discharges too close to the foundation.",
    whyItMatters: "Every downspout concentrates hundreds of gallons per hour at a single point. If that point is next to the foundation, the water saturates the soil, causes hydrostatic pressure against the foundation wall, and leads to settling, cracking, and basement or slab moisture issues.",
    whatHappensIfSkipped: "Foundation soil erodes and settles unevenly, causing cracks in the foundation and walls. Water migrates under the slab or through block walls. In Florida's sandy soils, foundation erosion from concentrated downspout discharge is one of the most common causes of settling.",
    toolsNeeded: ["Tape measure", "Garden hose"],
    suppliesNeeded: ["Downspout extensions (if missing)", "Splash blocks"],
    careKitProductIds: [],
    estimatedSavings: "A $15 extension prevents $3,000-10,000 in foundation repair costs.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // SIDING (9 tasks)
  // ================================================================

  // ────────────────────────────────────────────
  // 4. Wash Siding
  // ────────────────────────────────────────────
  {
    taskId: "exterior.siding_wash",
    taskName: "Wash Siding",
    category: "exterior",
    applicableSystemIds: ["exterior.siding.vinyl", "exterior.siding.hardie_fiber_cement", "exterior.siding.wood"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 180, reason: "Mold, mildew, and algae grow rapidly on shaded siding in humid climates" },
      { climateZone: "gulf_coast", adjustedFrequencyDays: 180, reason: "Salt deposits, pollen, and biological growth require biannual washing" },
    ],
    difficulty: "moderate",
    estimatedTimeMinutes: 120,
    diyCost: { low: 10, high: 30 },
    proCost: { low: 200, high: 500 },
    shortDescription: "Wash all siding to remove dirt, mildew, algae, and pollutants that degrade the finish.",
    detailedInstructions:
      "1. Mix a cleaning solution: 1/3 cup laundry detergent + 2/3 cup TSP + 1 quart bleach per gallon of water.\n" +
      "2. Wet landscaping and cover sensitive plants with plastic sheeting.\n" +
      "3. Start at the bottom and work up to prevent streaking from dirty runoff.\n" +
      "4. Apply solution with a soft-bristle brush on an extension handle or a pump sprayer.\n" +
      "5. Let the solution dwell for 5-10 minutes but do not allow it to dry on the surface.\n" +
      "6. Rinse from top down with a garden hose. For stubborn areas, use a pressure washer at low pressure (under 1,500 PSI).\n" +
      "7. For vinyl siding, always spray at eye level or below — never aim upward under the lap, which forces water behind panels.\n" +
      "8. For wood siding, use the lowest effective pressure to avoid gouging the wood grain.\n" +
      "9. Pay extra attention to north-facing and shaded walls where mold thrives.\n" +
      "10. Rinse landscaping thoroughly after completion.",
    whyItMatters: "Dirt, mold, and biological growth do more than look bad — they hold moisture against siding and feed on paint and finish materials. Annual washing removes these threats and lets you spot damage hidden beneath grime.",
    whatHappensIfSkipped: "Mold and algae colonies establish permanent residence, staining and degrading the siding finish. On wood siding, biological growth accelerates rot. On vinyl, trapped moisture behind algae films causes the backing to deteriorate. Siding replacement costs $5,000-30,000.",
    toolsNeeded: ["Garden hose with spray nozzle", "Soft-bristle brush with extension handle", "Pump sprayer", "Pressure washer (optional)"],
    suppliesNeeded: ["Laundry detergent", "TSP (trisodium phosphate)", "Bleach", "Plastic sheeting for plants"],
    careKitProductIds: [],
    estimatedSavings: "DIY wash at $15-30 saves $200-500 vs. professional cleaning. Prevents premature siding replacement worth $5,000+.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ────────────────────────────────────────────
  // 5. Inspect Siding
  // ────────────────────────────────────────────
  {
    taskId: "exterior.siding_inspect",
    taskName: "Inspect Siding",
    category: "exterior",
    applicableSystemIds: ["exterior.siding.vinyl", "exterior.siding.hardie_fiber_cement", "exterior.siding.wood"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 180, reason: "UV and moisture damage progresses faster; biannual inspection catches problems earlier" },
    ],
    difficulty: "easy",
    estimatedTimeMinutes: 30,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 75, high: 150 },
    shortDescription: "Walk the perimeter and inspect all siding for cracks, warping, loose pieces, gaps, and signs of water intrusion.",
    detailedInstructions:
      "1. Walk slowly around the entire exterior, examining siding at ground level, mid-height, and eaves.\n" +
      "2. Look for cracked, warped, buckled, or missing siding panels or boards.\n" +
      "3. Press on suspect areas — soft spots indicate rot behind the siding (especially on wood and fiber cement).\n" +
      "4. Check for gaps between siding panels that have widened from expansion/contraction.\n" +
      "5. Look for discoloration or staining that could indicate water getting behind the siding.\n" +
      "6. Inspect the bottom edge of siding — it should be at least 6 inches above the soil line.\n" +
      "7. Check where siding meets trim, windows, doors, and corners for gaps or separation.\n" +
      "8. Look for insect damage — carpenter ants and termites leave sawdust-like frass or mud tubes.\n" +
      "9. Note any paint peeling, chalking, or fading — early signs the finish needs attention.\n" +
      "10. Photograph and document all issues for repair scheduling.",
    whyItMatters: "Siding is your home's exterior armor. Small cracks and gaps admit water behind the siding, where it has no way to dry out. Hidden moisture causes rot, mold, and structural damage that costs 10-50x more to fix than the original siding defect.",
    whatHappensIfSkipped: "Hairline cracks widen into entry points for water and insects. A single season of undetected water intrusion behind siding can rot the sheathing and framing. By the time damage becomes visible from inside, remediation requires siding removal, sheathing replacement, and mold treatment — easily $5,000-20,000.",
    toolsNeeded: ["Flashlight", "Screwdriver (for probing soft spots)", "Camera"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Early detection of water intrusion saves $5,000-20,000 in rot and mold remediation.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ────────────────────────────────────────────
  // 6. Check Caulk Around Penetrations
  // ────────────────────────────────────────────
  {
    taskId: "exterior.siding_caulk_check",
    taskName: "Check Caulk Around Penetrations",
    category: "exterior",
    applicableSystemIds: ["exterior.siding.vinyl", "exterior.siding.hardie_fiber_cement", "exterior.siding.wood"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 180, reason: "UV and heat cycles degrade caulk faster; humid climate drives moisture through failed seals" },
    ],
    difficulty: "easy",
    estimatedTimeMinutes: 30,
    diyCost: { low: 5, high: 15 },
    proCost: { low: 75, high: 200 },
    shortDescription: "Inspect and repair caulk seals where pipes, vents, wires, and fixtures penetrate the siding.",
    detailedInstructions:
      "1. Walk the exterior and identify every penetration through the siding: electrical conduit, hose bibs, dryer vents, gas lines, cable/internet lines, AC line sets, etc.\n" +
      "2. Examine the caulk seal around each penetration for cracking, gaps, or complete failure.\n" +
      "3. Press on caulk with a finger — it should be flexible and adhered on both sides. Brittle or peeling caulk has failed.\n" +
      "4. Remove failed caulk with a putty knife or 5-in-1 tool.\n" +
      "5. Clean the surfaces with a damp rag to ensure new caulk will adhere.\n" +
      "6. Apply a continuous bead of exterior-grade paintable silicone or polyurethane caulk.\n" +
      "7. Tool the bead with a wet finger or caulk tool for a smooth, concave profile.\n" +
      "8. Don't forget less obvious penetrations: doorbell wires, security camera mounts, exterior outlet covers.\n" +
      "9. Check where trim boards meet siding — caulk these joints as well.\n" +
      "10. Allow caulk to cure per manufacturer directions before rain exposure.",
    whyItMatters: "Every hole in your siding envelope is a potential water entry point. Caulk is the seal that keeps water out, but it has a limited lifespan — typically 5-10 years before UV and thermal cycling cause it to crack and fail. A $5 tube of caulk prevents thousands in water damage.",
    whatHappensIfSkipped: "Failed caulk lets water wick into the wall cavity behind every penetration. Water travels down framing, soaking insulation and causing hidden mold. A single failed caulk joint around a hose bib can rot the sill plate and attract termites — repairs start at $2,000.",
    toolsNeeded: ["Caulk gun", "Putty knife or 5-in-1 tool", "Damp rag"],
    suppliesNeeded: ["Exterior-grade caulk (paintable silicone or polyurethane)"],
    careKitProductIds: ["exterior_caulk"],
    estimatedSavings: "A $5-10 tube of caulk prevents $2,000-5,000 in water damage per failed seal.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ────────────────────────────────────────────
  // 7. Repaint Siding
  // ────────────────────────────────────────────
  {
    taskId: "exterior.siding_repaint",
    taskName: "Repaint Siding",
    category: "exterior",
    applicableSystemIds: ["exterior.siding.hardie_fiber_cement", "exterior.siding.wood"],
    frequencyType: "interval",
    frequencyValue: 2190,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 1825, reason: "Extreme UV and humidity cut paint life to 5 years in Florida vs. 7-10 years in moderate climates" },
      { climateZone: "gulf_coast", adjustedFrequencyDays: 1825, reason: "Salt air, UV, and moisture demand repainting every 5 years" },
    ],
    difficulty: "professional",
    estimatedTimeMinutes: 2400,
    diyCost: { low: 500, high: 1500 },
    proCost: { low: 3000, high: 8000 },
    shortDescription: "Repaint all exterior siding surfaces to restore UV protection and weather resistance (every 5-8 years).",
    detailedInstructions:
      "1. Pressure wash the entire exterior and allow 2-3 days to dry completely.\n" +
      "2. Scrape all loose, peeling, or flaking paint with a paint scraper.\n" +
      "3. Sand rough areas smooth with 80-120 grit sandpaper.\n" +
      "4. Repair any damaged siding, fill holes and cracks with exterior wood filler, and caulk all joints.\n" +
      "5. Apply primer to bare wood, bare fiber cement, and stain-blocking primer over any knots or tannin bleed.\n" +
      "6. Apply first coat of 100% acrylic exterior paint. Use a brush for cutting in and a roller or sprayer for field areas.\n" +
      "7. Allow proper drying time per manufacturer specs (typically 4+ hours between coats).\n" +
      "8. Apply second coat for complete coverage and maximum durability.\n" +
      "9. Paint in the shade — follow the sun around the house. Never paint in direct sunlight or on hot surfaces.\n" +
      "10. Clean up properly and store leftover paint (labeled) for touch-ups.",
    whyItMatters: "Paint is your siding's UV shield and moisture barrier. Once paint chalks, cracks, and peels, the bare substrate is exposed to sun, rain, and biological attack. For wood siding, paint failure leads directly to rot. For fiber cement, moisture absorption degrades the material from within.",
    whatHappensIfSkipped: "Paint failure exposes siding to the elements. Wood siding rots within 2-3 years of paint failure in humid climates. Fiber cement absorbs moisture, swells, and eventually crumbles. What could have been a $5,000 repaint becomes a $15,000-30,000 siding replacement.",
    toolsNeeded: ["Pressure washer", "Paint scrapers", "Sandpaper (80-120 grit)", "Paintbrushes", "Rollers", "Airless sprayer (optional)", "Drop cloths", "Ladder", "Painter's tape"],
    suppliesNeeded: ["Exterior primer", "100% acrylic exterior paint (2 coats)", "Exterior caulk", "Wood filler"],
    careKitProductIds: ["exterior_caulk", "touch_up_paint"],
    estimatedSavings: "A $5,000 repaint prevents $15,000-30,000 in siding replacement from paint failure.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ────────────────────────────────────────────
  // 8. Inspect Stucco for Cracks
  // ────────────────────────────────────────────
  {
    taskId: "exterior.stucco_crack_inspect",
    taskName: "Inspect Stucco for Cracks",
    category: "exterior",
    applicableSystemIds: ["exterior.siding.stucco"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 180, reason: "Wind-driven rain forces water into hairline cracks; Florida stucco fails more from moisture than age" },
      { climateZone: "gulf_coast", adjustedFrequencyDays: 180, reason: "Tropical rains exploit every crack; biannual inspection critical" },
    ],
    difficulty: "easy",
    estimatedTimeMinutes: 30,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 75, high: 150 },
    shortDescription: "Walk the exterior and inspect all stucco surfaces for hairline cracks, spalling, staining, and bulging.",
    detailedInstructions:
      "1. Walk slowly around the entire home examining all stucco surfaces from 2-3 feet away.\n" +
      "2. Look for hairline cracks — they often radiate from window and door corners (stress cracks).\n" +
      "3. Check for diagonal cracks, which may indicate foundation settling.\n" +
      "4. Look for staining below cracks — dark streaks indicate water is entering and carrying dirt out.\n" +
      "5. Check for bulging or soft areas by pressing firmly on the stucco. A hollow sound means the stucco has separated from the lath.\n" +
      "6. Inspect the bottom 12 inches of stucco at the foundation line for moisture wicking and efflorescence.\n" +
      "7. Look around all windows and doors for cracks where caulk has failed.\n" +
      "8. Check where stucco meets dissimilar materials (wood trim, stone, metal) for separation.\n" +
      "9. Note the size and location of every crack: hairline (<1/16\"), moderate (1/16\"-1/8\"), or severe (>1/8\").\n" +
      "10. Mark cracks with painter's tape or chalk for repair scheduling.",
    whyItMatters: "Stucco looks impervious but is actually porous — and every crack is a direct path for water to reach the wood framing behind it. In Florida, where 60+ inches of wind-driven rain falls annually, even hairline stucco cracks cause devastating hidden moisture damage.",
    whatHappensIfSkipped: "Wind-driven rain forces water through cracks during every storm. The moisture saturates the building paper, wets the sheathing, and rots the framing — all completely hidden behind the stucco. The first visible sign is usually interior wall staining or mold, by which point damage is extensive. Stucco remediation for moisture damage averages $15,000-40,000.",
    toolsNeeded: ["Flashlight", "Painter's tape or chalk", "Camera"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Early crack detection and repair at $50-200 prevents $15,000-40,000 in moisture remediation.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ────────────────────────────────────────────
  // 9. Wash Stucco
  // ────────────────────────────────────────────
  {
    taskId: "exterior.stucco_wash",
    taskName: "Wash Stucco",
    category: "exterior",
    applicableSystemIds: ["exterior.siding.stucco"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 180, reason: "Mold and algae establish quickly on textured stucco in humid climates" },
    ],
    difficulty: "moderate",
    estimatedTimeMinutes: 90,
    diyCost: { low: 15, high: 40 },
    proCost: { low: 200, high: 500 },
    shortDescription: "Clean stucco surfaces to remove mold, mildew, dirt, and algae staining.",
    detailedInstructions:
      "1. Pre-wet all landscaping and cover sensitive plants with plastic.\n" +
      "2. Mix cleaning solution: 1 part bleach to 4 parts water with a small amount of dish soap.\n" +
      "3. Apply solution with a pump sprayer from bottom up to prevent streaking.\n" +
      "4. Let dwell 10-15 minutes but do not let it dry.\n" +
      "5. Scrub stubborn stains with a soft-bristle brush on an extension handle.\n" +
      "6. Rinse from top down with a garden hose or pressure washer at LOW pressure (under 1,500 PSI).\n" +
      "7. Keep the pressure washer nozzle at least 12 inches from the surface and use a wide fan tip (25° or 40°).\n" +
      "8. Do NOT use high pressure on stucco — it gouges the surface and drives water into the wall.\n" +
      "9. Pay extra attention to areas under eaves and overhangs where mold thrives in shade.\n" +
      "10. Rinse landscaping thoroughly after cleaning.",
    whyItMatters: "Stucco's textured surface traps dirt and provides a perfect substrate for mold and algae growth. Biological growth holds moisture against the surface, accelerating degradation. Cleaning removes these threats and reveals cracks or damage hidden beneath grime.",
    whatHappensIfSkipped: "Black mold and green algae staining becomes permanent. The biological growth holds moisture that eventually penetrates the stucco and causes hidden rot. Your home looks neglected, reducing curb appeal and property value by 5-10%.",
    toolsNeeded: ["Pump sprayer", "Soft-bristle brush with extension", "Garden hose", "Pressure washer (low PSI)"],
    suppliesNeeded: ["Bleach", "Dish soap", "Plastic sheeting for landscaping"],
    careKitProductIds: [],
    estimatedSavings: "DIY wash at $20-40 saves $200-500 vs. professional service. Preserves stucco finish and curb appeal.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ────────────────────────────────────────────
  // 10. Repair Stucco Caulk
  // ────────────────────────────────────────────
  {
    taskId: "exterior.stucco_caulk_repair",
    taskName: "Repair Stucco Caulk",
    category: "exterior",
    applicableSystemIds: ["exterior.siding.stucco"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 180, reason: "UV and thermal cycles degrade caulk faster; biannual repair prevents water intrusion" },
    ],
    difficulty: "moderate",
    estimatedTimeMinutes: 60,
    diyCost: { low: 10, high: 30 },
    proCost: { low: 100, high: 300 },
    shortDescription: "Remove failed caulk and re-seal joints around windows, doors, and penetrations in stucco walls.",
    detailedInstructions:
      "1. Identify all caulk joints that have cracked, pulled away, or deteriorated from the stucco inspection.\n" +
      "2. Use a utility knife and putty knife to remove all old, failed caulk completely.\n" +
      "3. Clean the joint surfaces with a wire brush and wipe with a damp cloth.\n" +
      "4. For gaps wider than ¼ inch, insert a foam backer rod before caulking.\n" +
      "5. Use a high-quality, paintable elastomeric sealant rated for stucco/masonry.\n" +
      "6. Cut the caulk tube tip at a 45° angle, sized to the joint width.\n" +
      "7. Apply a continuous bead, filling the joint completely with no voids.\n" +
      "8. Tool the bead with a wet finger or caulk tool for a smooth, concave finish.\n" +
      "9. Caulk all window and door perimeters, pipe penetrations, and where stucco meets dissimilar materials.\n" +
      "10. Allow full cure time (typically 24-48 hours) before painting or rain exposure.",
    whyItMatters: "Caulk joints in stucco are the front line defense at every opening in the wall. When caulk fails, water enters the wall cavity at the exact points where framing concentrates — around windows and doors. These are the most damage-prone areas in any home.",
    whatHappensIfSkipped: "Water infiltrates at every failed caulk joint during rain. Window sills rot, door frames decay, and mold establishes in the wall cavity. In stucco homes, failed caulk at windows is the number-one cause of hidden moisture damage — often not discovered until a remodel or sale inspection.",
    toolsNeeded: ["Caulk gun", "Utility knife", "Putty knife", "Wire brush", "Damp cloth"],
    suppliesNeeded: ["Elastomeric sealant for stucco/masonry", "Foam backer rod"],
    careKitProductIds: ["exterior_caulk"],
    estimatedSavings: "A $20 repair prevents $3,000-10,000 in window and framing rot repair.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ────────────────────────────────────────────
  // 11. Check for Wood Rot
  // ────────────────────────────────────────────
  {
    taskId: "exterior.wood_rot_check",
    taskName: "Check for Wood Rot",
    category: "exterior",
    applicableSystemIds: ["exterior.siding.wood", "exterior.entry_doors", "exterior.deck_wood", "exterior.fence_wood"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 180, reason: "Wood rot progresses 2-3x faster in tropical humidity; check biannually" },
      { climateZone: "gulf_coast", adjustedFrequencyDays: 180, reason: "Continuous moisture and warmth create ideal conditions for fungal wood decay" },
    ],
    difficulty: "moderate",
    estimatedTimeMinutes: 30,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 75, high: 200 },
    shortDescription: "Probe all exposed wood surfaces for soft spots, fungal growth, and structural decay.",
    detailedInstructions:
      "1. Check all areas where wood contacts or is close to soil, concrete, or masonry — rot starts here.\n" +
      "2. Use a screwdriver or awl to probe suspect areas — push firmly into the wood.\n" +
      "3. Healthy wood resists the probe. Rotted wood feels soft, spongy, or crumbles.\n" +
      "4. Check window sills, door frames, and thresholds — these collect water and rot first.\n" +
      "5. Inspect trim boards, fascia, and soffit for soft spots, especially at joints.\n" +
      "6. Check deck posts where they meet the ground or sit in post brackets.\n" +
      "7. Look for peeling paint that bubbles — moisture under paint causes adhesion failure and indicates rot beneath.\n" +
      "8. Check behind downspouts and at any location where water concentrates.\n" +
      "9. Look for fungal fruiting bodies (mushrooms) growing on or from wood surfaces — a sign of advanced rot.\n" +
      "10. Document all rot locations and assess whether repair or replacement is needed.",
    whyItMatters: "Wood rot is a fungal infection that spreads aggressively in moist conditions. Once established, rot advances through healthy wood and compromises structural integrity. In Florida's humid climate, rot can destroy a window frame in a single season if left unchecked.",
    whatHappensIfSkipped: "Rot spreads from the initial infection point into surrounding framing and structural members. A rotted window sill becomes a rotted wall stud, becomes a rotted floor joist. Untreated rot also attracts termites and carpenter ants, compounding the damage. What starts as a $200 sill repair becomes a $5,000-15,000 structural repair.",
    toolsNeeded: ["Screwdriver or awl", "Flashlight", "Camera"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Catching rot early limits repair to $200-500 vs. $5,000-15,000 for advanced structural damage.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ────────────────────────────────────────────
  // 12. Re-stain/Paint Wood Siding
  // ────────────────────────────────────────────
  {
    taskId: "exterior.wood_siding_stain_paint",
    taskName: "Re-stain or Paint Wood Siding",
    category: "exterior",
    applicableSystemIds: ["exterior.siding.wood"],
    frequencyType: "interval",
    frequencyValue: 1460,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 1095, reason: "UV and moisture cut stain/paint life to 3 years on wood siding in Florida" },
      { climateZone: "gulf_coast", adjustedFrequencyDays: 1095, reason: "Extreme UV and humidity demand restaining every 3 years" },
    ],
    difficulty: "hard",
    estimatedTimeMinutes: 2400,
    diyCost: { low: 300, high: 1000 },
    proCost: { low: 3000, high: 8000 },
    shortDescription: "Re-stain or repaint all wood siding to restore UV protection and moisture barrier (every 3-5 years).",
    detailedInstructions:
      "1. Pressure wash all wood siding at low pressure (under 1,200 PSI) to remove dirt and loose finish.\n" +
      "2. Allow 3-5 days of dry weather for the wood to dry completely.\n" +
      "3. Scrape any loose or peeling paint/stain. Sand smooth with 80-grit sandpaper.\n" +
      "4. Replace any boards with advanced rot — they cannot be saved with stain or paint.\n" +
      "5. Treat bare wood with a wood preservative or borate-based anti-fungal treatment.\n" +
      "6. For paint: apply a high-quality acrylic primer followed by two coats of 100% acrylic paint.\n" +
      "7. For stain: apply two coats of penetrating semi-transparent or solid stain per manufacturer directions.\n" +
      "8. Work in the shade — follow the sun around the house. Apply when temps are 50-85°F.\n" +
      "9. Pay extra attention to end grain, joints, and horizontal surfaces where water penetrates most.\n" +
      "10. Maintain a supply of touch-up stain/paint for spot repairs between full applications.",
    whyItMatters: "The stain or paint on wood siding is literally its life support — without it, UV breaks down the wood fibers and moisture initiates rot. In hot-humid climates, the window between finish failure and active rot is measured in months, not years.",
    whatHappensIfSkipped: "Bare wood absorbs moisture, swells, and contracts with every rain cycle. UV turns the surface gray and fibrous. Fungal spores colonize within weeks. In Florida, unprotected wood siding begins rotting within 1-2 years. A $3,000 restain becomes a $15,000-28,000 siding replacement.",
    toolsNeeded: ["Pressure washer", "Scrapers", "Sandpaper", "Paintbrushes and rollers", "Airless sprayer (optional)", "Drop cloths"],
    suppliesNeeded: ["Wood preservative", "Exterior primer (for paint)", "Exterior paint or stain", "Caulk"],
    careKitProductIds: [],
    estimatedSavings: "A $3,000 restain prevents $15,000-28,000 in wood siding replacement.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // WINDOWS (4 tasks)
  // ================================================================

  {
    taskId: "exterior.window_seal_inspect",
    taskName: "Inspect Window Seals",
    category: "exterior",
    applicableSystemIds: ["exterior.windows"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 180, reason: "UV degrades window seals rapidly; failed seals reduce hurricane resistance" },
    ],
    difficulty: "easy",
    estimatedTimeMinutes: 20,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 75, high: 150 },
    shortDescription: "Inspect all window seals for fogging between panes, condensation, and seal failure.",
    detailedInstructions:
      "1. Check each window from inside on a cool morning when condensation is most visible.\n" +
      "2. Look for fogging, hazing, or moisture between double-pane glass — this means the seal has failed.\n" +
      "3. Note windows where you feel a draft when closed — the seal or weatherstripping has failed.\n" +
      "4. From outside, inspect the glazing compound (putty) around the glass for cracks or gaps.\n" +
      "5. Check the frame-to-wall seal (where the window frame meets the siding/stucco).\n" +
      "6. Look for water stains on the interior sill or wall below the window.\n" +
      "7. Operate each window — it should open and close smoothly. Difficult operation indicates frame warping.\n" +
      "8. Check window screens for tears or poor fit.\n" +
      "9. For impact-rated windows, verify the laminated glass shows no delamination or clouding.\n" +
      "10. Failed dual-pane seals require glass replacement (not the entire window) — costs $150-400 per window.",
    whyItMatters: "Window seals keep conditioned air in and weather out. Failed seals waste energy, allow moisture intrusion, and compromise hurricane protection. Catching seal failure early means replacing glass, not entire windows.",
    whatHappensIfSkipped: "Failed seals worsen over time — fogging becomes permanent haze, energy efficiency drops, and moisture enters the wall. Eventually the glass panes flex differently and stress the frame. In hurricane zones, compromised seals reduce the window's wind and debris resistance.",
    toolsNeeded: ["Flashlight"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Replacing a $200 glass panel saves $500-1,500 vs. full window replacement when caught early.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  {
    taskId: "exterior.window_weatherstrip_check",
    taskName: "Check Window Weatherstripping",
    category: "exterior",
    applicableSystemIds: ["exterior.windows"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 20,
    diyCost: { low: 0, high: 20 },
    proCost: { low: 50, high: 100 },
    shortDescription: "Inspect window weatherstripping for compression, cracking, and gaps that allow air and water infiltration.",
    detailedInstructions:
      "1. Open each window and examine the weatherstripping along all edges of the sash.\n" +
      "2. Look for cracked, hardened, compressed, or missing weatherstripping material.\n" +
      "3. Close the window and check for visible daylight around any edge — light means air and water can enter.\n" +
      "4. Hold a lit incense stick or thin piece of tissue near window edges on a windy day to detect drafts.\n" +
      "5. Replace any damaged or worn weatherstripping with the same type (foam, V-strip, or compression bulb).\n" +
      "6. Clean the channel before installing new weatherstripping — dirt prevents adhesion.\n" +
      "7. For sliding windows, check the pile (fuzzy) weatherstrip in the tracks for wear.\n" +
      "8. For casement windows, check the compression seal around the frame perimeter.\n" +
      "9. Check the meeting rail seal on double-hung windows where upper and lower sashes meet.\n" +
      "10. After replacing, close the window and verify a snug fit with no visible gaps.",
    whyItMatters: "Weatherstripping is the gasket that seals the movable parts of a window. When it fails, conditioned air escapes and unconditioned air (plus moisture, dust, and insects) enters. It's one of the cheapest and highest-impact energy improvements you can make.",
    whatHappensIfSkipped: "Failed weatherstripping wastes $100-300/year in energy costs per home. It admits moisture that damages sills and framing. In hurricane zones, poor seals allow wind-driven rain inside during storms. Insects find the gaps too — ants, roaches, and even snakes enter through failed window weatherstripping.",
    toolsNeeded: ["Putty knife (for removing old weatherstrip)", "Scissors or utility knife"],
    suppliesNeeded: ["Replacement weatherstripping (match existing type)"],
    careKitProductIds: [],
    estimatedSavings: "A $10-20 weatherstrip replacement saves $100-300/year in energy costs.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  {
    taskId: "exterior.window_wash",
    taskName: "Clean Windows",
    category: "exterior",
    applicableSystemIds: ["exterior.windows"],
    frequencyType: "seasonal",
    frequencyValue: 180,
    frequencyUnit: "days",
    seasonalMonths: [4, 10],
    difficulty: "easy",
    estimatedTimeMinutes: 90,
    diyCost: { low: 5, high: 15 },
    proCost: { low: 150, high: 400 },
    shortDescription: "Clean all interior and exterior window glass, frames, and tracks for clarity and proper operation.",
    detailedInstructions:
      "1. Remove screens and wash them with soapy water and a soft brush. Rinse and set aside to dry.\n" +
      "2. Clean window tracks and sills with a vacuum and damp cloth — debris buildup prevents proper closing.\n" +
      "3. Mix window cleaning solution: 1 part white vinegar to 10 parts water, or use commercial glass cleaner.\n" +
      "4. Wash exterior glass first with a sponge or strip washer using the solution.\n" +
      "5. Squeegee from top to bottom in overlapping strokes for a streak-free finish.\n" +
      "6. Wipe the squeegee blade with a lint-free cloth between strokes.\n" +
      "7. Clean interior glass the same way.\n" +
      "8. Wipe all window frames and sills with a damp cloth to remove dust and grime.\n" +
      "9. Lubricate window tracks with a silicone spray for smooth operation.\n" +
      "10. Reinstall clean screens after all glass is dry.",
    whyItMatters: "Clean windows aren't just aesthetic — dirty tracks and frames prevent proper closing, compromising weather sealing. Mineral deposits from hard water and salt air etch glass permanently if not cleaned regularly. Window washing also doubles as an inspection opportunity.",
    whatHappensIfSkipped: "Hard water and salt deposits etch glass surfaces permanently — no amount of cleaning removes etched glass. Dirty tracks jam window operation, which discourages opening for ventilation and hides weatherstripping failures. Neglected windows reduce home value and curb appeal.",
    toolsNeeded: ["Squeegee", "Sponge or strip washer", "Bucket", "Lint-free cloths", "Vacuum (for tracks)"],
    suppliesNeeded: ["Window cleaning solution or white vinegar", "Silicone spray lubricant"],
    careKitProductIds: [],
    estimatedSavings: "DIY window cleaning saves $150-400 vs. professional service. Prevents permanent glass etching from mineral deposits.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  {
    taskId: "exterior.window_hardware_lubricate",
    taskName: "Lubricate Window Hardware",
    category: "exterior",
    applicableSystemIds: ["exterior.windows"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 20,
    diyCost: { low: 5, high: 10 },
    proCost: { low: 50, high: 100 },
    shortDescription: "Lubricate all window locks, hinges, operators, and tracks for smooth operation and proper sealing.",
    detailedInstructions:
      "1. Open each window and locate all moving hardware — locks, hinges, crank operators, and slides.\n" +
      "2. Clean hardware of dirt and old lubricant with a dry cloth.\n" +
      "3. Apply a light coat of silicone-based lubricant to lock mechanisms (do not use WD-40 — it attracts dirt).\n" +
      "4. For crank-operated casement windows, lubricate the gear mechanism and the track the arm rides in.\n" +
      "5. For double-hung windows, lubricate the balances (springs or counterweights) and the track channels.\n" +
      "6. For sliding windows, clean and lubricate the bottom track.\n" +
      "7. Work each mechanism several times to distribute lubricant.\n" +
      "8. Check that locks engage fully and hold the window tight against the weatherstripping.\n" +
      "9. Tighten any loose screws on handles, locks, or hinges.\n" +
      "10. Test each window for smooth operation — it should open, close, and lock easily with one hand.",
    whyItMatters: "Window hardware that operates smoothly ensures windows seal properly when closed. Stiff or broken hardware means windows don't close completely, wasting energy and compromising weather protection. In hurricane zones, a window that won't lock is a critical safety vulnerability.",
    whatHappensIfSkipped: "Hardware corrodes and seizes, especially in coastal environments. Locks fail to engage, leaving windows unsecured. Crank operators strip their gears, requiring $100-300 replacement. A window that won't fully close or lock is an energy drain, security risk, and hurricane liability.",
    toolsNeeded: ["Screwdriver", "Dry cloth"],
    suppliesNeeded: ["Silicone-based lubricant spray"],
    careKitProductIds: [],
    estimatedSavings: "A $5 can of lubricant prevents $100-300 in hardware replacement costs per window.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // DOORS (3 tasks)
  // ================================================================

  {
    taskId: "exterior.door_weatherstrip_check",
    taskName: "Check Door Weatherstripping",
    category: "exterior",
    applicableSystemIds: ["exterior.entry_doors"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 15,
    diyCost: { low: 5, high: 25 },
    proCost: { low: 50, high: 100 },
    shortDescription: "Inspect and replace door weatherstripping and threshold seals to prevent air and water infiltration.",
    detailedInstructions:
      "1. Close the door and check for visible daylight around all four edges from inside.\n" +
      "2. Feel for drafts around the door perimeter on a windy day.\n" +
      "3. Check the bottom door sweep or threshold seal — it should create a tight seal with no visible gap.\n" +
      "4. Examine the compression weatherstripping in the door frame for cracks, tears, or compression set.\n" +
      "5. Check the threshold for wear, looseness, or damage.\n" +
      "6. Replace worn weatherstripping by removing the old material and installing the same type.\n" +
      "7. For door sweeps, adjust or replace to close the gap at the bottom.\n" +
      "8. For adjustable thresholds, turn the screws to raise the threshold until it contacts the door bottom.\n" +
      "9. Close the door and verify a snug seal on all sides — you should feel slight resistance.\n" +
      "10. Check the door closer or automatic return to ensure it pulls the door fully into the seal.",
    whyItMatters: "Exterior doors are one of the largest openings in the building envelope. Failed weatherstripping lets in hot/cold air, rain, dust, insects, and even small animals. A properly sealed door can reduce energy costs by $50-100/year per door.",
    whatHappensIfSkipped: "Air infiltration at an unsealed door wastes $50-100/year in energy per door. Water enters below the threshold and rots the subfloor. Insects use the gap as a highway. In hurricane zones, unsealed doors allow wind-driven rain to flood the interior during storms.",
    toolsNeeded: ["Screwdriver", "Utility knife", "Putty knife"],
    suppliesNeeded: ["Replacement weatherstripping", "Door sweep (if needed)", "Threshold screws"],
    careKitProductIds: [],
    estimatedSavings: "A $10-25 weatherstrip replacement saves $50-100/year in energy and prevents water damage.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  {
    taskId: "exterior.door_hardware_lubricate",
    taskName: "Lubricate Door Hardware",
    category: "exterior",
    applicableSystemIds: ["exterior.entry_doors"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 15,
    diyCost: { low: 5, high: 10 },
    proCost: { low: 50, high: 75 },
    shortDescription: "Lubricate all door locks, hinges, and latches for smooth operation and to prevent corrosion.",
    detailedInstructions:
      "1. Open each exterior door and work the hinges back and forth.\n" +
      "2. Apply a drop of silicone lubricant or dry graphite to each hinge pin.\n" +
      "3. Work the door open and closed several times to distribute lubricant.\n" +
      "4. Apply graphite or silicone spray into the lock keyway — insert and remove the key several times.\n" +
      "5. Lubricate the deadbolt throw by extending and retracting it with the door open.\n" +
      "6. Check the strike plate alignment — the latch and deadbolt should engage without force.\n" +
      "7. Tighten hinge screws — loose hinges cause the door to sag and bind.\n" +
      "8. For sagging doors, replace one top hinge screw with a 3-inch screw that reaches the framing stud.\n" +
      "9. Lubricate the door closer mechanism if present.\n" +
      "10. Test the lock from both sides to confirm smooth operation.",
    whyItMatters: "Door hardware is used thousands of times per year. Without lubrication, hinges wear grooves, locks jam, and latches fail. In an emergency evacuation, a stuck lock or jammed door is a life safety issue.",
    whatHappensIfSkipped: "Hinges squeak and eventually grind, wearing the hinge pin and enlarging the knuckle hole. Locks become stiff and eventually jam — requiring a locksmith at $100-200 for an emergency call. Sagging doors damage the frame and don't seal properly.",
    toolsNeeded: ["Screwdriver"],
    suppliesNeeded: ["Silicone lubricant or dry graphite", "3-inch screws (for hinge repair)"],
    careKitProductIds: [],
    estimatedSavings: "A $5 lubricant application prevents $100-200 locksmith calls and $200-400 hinge/hardware replacement.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  {
    taskId: "exterior.door_finish_inspect",
    taskName: "Inspect Door Finish",
    category: "exterior",
    applicableSystemIds: ["exterior.entry_doors"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 180, reason: "UV-exposed doors (south/west facing) degrade rapidly in Florida; check biannually" },
    ],
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCost: { low: 0, high: 20 },
    proCost: { low: 50, high: 150 },
    shortDescription: "Inspect the finish on exterior doors for peeling, fading, cracking, and weathering.",
    detailedInstructions:
      "1. Examine each exterior door's finish in good lighting.\n" +
      "2. Look for peeling, cracking, chalking, or blistering paint or stain.\n" +
      "3. Check the bottom edge of the door — this is where moisture damage starts.\n" +
      "4. Feel the surface for roughness that indicates UV breakdown of the finish.\n" +
      "5. For wood doors, look for grain raising and checked (cracked) stain/varnish.\n" +
      "6. For steel doors, look for rust spots, especially at the bottom edge and around hardware cutouts.\n" +
      "7. For fiberglass doors, look for fading and chalking of the finish.\n" +
      "8. Touch up minor issues: sand lightly, prime bare spots, and apply matching paint or stain.\n" +
      "9. South and west-facing doors get the most UV exposure and need more frequent refinishing.\n" +
      "10. If the finish has failed across most of the door, schedule a full strip and refinish.",
    whyItMatters: "The finish on an exterior door protects the door material from UV, moisture, and temperature extremes. Once the finish fails, the door itself deteriorates rapidly — wood doors rot, steel doors rust, and fiberglass doors chalk and crack.",
    whatHappensIfSkipped: "A failed finish exposes the door to the elements. Wood doors warp, crack, and rot — a $500-5,000 replacement. Steel doors rust at the bottom edge, creating a gap and structural weakness. Refinishing a door costs $50-150 — replacing one costs $500-5,000 installed.",
    toolsNeeded: ["Sandpaper (220 grit)", "Paintbrush"],
    suppliesNeeded: ["Touch-up paint or stain", "Primer (for bare spots)"],
    careKitProductIds: ["touch_up_paint"],
    estimatedSavings: "A $50-150 refinish prevents $500-5,000 in door replacement.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // GARAGE DOOR & OPENER (7 tasks)
  // ================================================================

  {
    taskId: "exterior.garage_door_lubricate",
    taskName: "Lubricate Garage Door",
    category: "exterior",
    applicableSystemIds: ["exterior.garage_door"],
    frequencyType: "seasonal",
    frequencyValue: 180,
    frequencyUnit: "days",
    seasonalMonths: [4, 10],
    climateAdjustments: [
      { climateZone: "gulf_coast", adjustedFrequencyDays: 90, reason: "Salt air corrodes springs, rollers, and tracks rapidly; lubricate quarterly near coast" },
    ],
    difficulty: "easy",
    estimatedTimeMinutes: 15,
    diyCost: { low: 5, high: 10 },
    proCost: { low: 50, high: 100 },
    shortDescription: "Lubricate all garage door rollers, hinges, tracks, and springs for smooth, quiet operation.",
    detailedInstructions:
      "1. Close the garage door and disconnect the opener by pulling the emergency release handle.\n" +
      "2. Apply white lithium grease or silicone-based garage door lubricant to each roller (the bearing, not the track).\n" +
      "3. Lubricate every hinge pivot point on both sides of the door.\n" +
      "4. Spray lubricant on the torsion spring(s) above the door — coat the entire length of the coils.\n" +
      "5. Lubricate the spring bearing plates on each side.\n" +
      "6. Apply lubricant to the lock mechanism and keyhole.\n" +
      "7. Wipe the inside of the track with a clean cloth (do NOT grease the track — it causes roller slippage).\n" +
      "8. Reconnect the opener and open/close the door several times to distribute lubricant.\n" +
      "9. Listen for any remaining squeaks or grinding — they indicate a component that needs attention.\n" +
      "10. Wipe any excess lubricant to prevent dripping onto vehicles.",
    whyItMatters: "A garage door is the largest moving component on your home, cycling up to 1,500 times per year. Without lubrication, metal grinds on metal, wearing out rollers, hinges, and springs prematurely. A well-lubricated door also reduces strain on the opener motor.",
    whatHappensIfSkipped: "Dry rollers wear flat spots, creating a loud, rough-operating door. Unlubricated springs corrode and snap prematurely (a dangerous failure). Hinges bind and stress the door panels. The opener motor overworks and burns out. Combined replacement costs: $500-2,000+.",
    toolsNeeded: ["Step ladder"],
    suppliesNeeded: ["White lithium grease or garage door lubricant spray", "Clean rags"],
    careKitProductIds: [],
    estimatedSavings: "A $10 can of lubricant prevents $200-500 in premature roller and hinge replacement, $300-800 in spring replacement.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  {
    taskId: "exterior.garage_door_spring_inspect",
    taskName: "Inspect Garage Door Springs",
    category: "exterior",
    applicableSystemIds: ["exterior.garage_door"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "gulf_coast", adjustedFrequencyDays: 180, reason: "Salt air corrodes springs aggressively; springs fail earlier in coastal environments" },
    ],
    difficulty: "professional",
    estimatedTimeMinutes: 30,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 100, high: 250 },
    shortDescription: "Professional inspection of garage door torsion and extension springs for wear, corrosion, and remaining life.",
    detailedInstructions:
      "1. ⚠️ CRITICAL SAFETY WARNING: Garage door torsion springs are under EXTREME tension — enough force to cause FATAL injury. Multiple people die every year from DIY spring work. This task MUST be performed by a qualified garage door professional. NEVER attempt to adjust, replace, or remove torsion springs yourself. Even touching a wound torsion spring can release catastrophic stored energy.\n" +
      "2. The technician visually inspects torsion springs for signs of wear: gaps between coils (stretching), rust, and deformation.\n" +
      "3. Extension springs (on sides of tracks) are checked for stretched coils, rust, and safety cable condition.\n" +
      "4. Safety cables on extension springs are verified to be intact and properly secured — these prevent a broken spring from becoming a projectile.\n" +
      "5. The technician checks spring balance by disconnecting the opener and lifting the door to waist height — it should stay in place.\n" +
      "6. If the door falls or rises on its own, springs need adjustment or replacement.\n" +
      "7. Spring hardware — cones, bearing plates, and mounting brackets — is inspected for cracks or looseness.\n" +
      "8. The technician measures spring cycle count against the spring's rated life (typically 10,000-25,000 cycles).\n" +
      "9. Corrosion depth is assessed — surface rust is normal, but pitting weakens the spring and accelerates failure.\n" +
      "10. The technician provides a report on spring condition and estimated remaining life.",
    whyItMatters: "Garage door springs counterbalance the full weight of the door (150-400 lbs). When a spring breaks, the door can slam shut with lethal force, or the broken spring whips at high velocity across the garage. Professional inspection identifies springs nearing end of life before this catastrophic failure occurs.",
    whatHappensIfSkipped: "A corroded or worn spring breaks without warning. The 200+ lb door drops instantly, crushing anything beneath it — pets, children, vehicles, or people. The broken spring itself is a high-velocity projectile. Spring replacement costs $200-400. The consequences of an uninspected failure are immeasurable.",
    toolsNeeded: ["Professional garage door tools", "Safety equipment"],
    suppliesNeeded: ["Replacement springs (if needed)", "Safety cables (if missing)"],
    careKitProductIds: [],
    estimatedSavings: "A $150 inspection prevents catastrophic spring failure. Planned spring replacement at $200-400 avoids $500-1,000 emergency service.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  {
    taskId: "exterior.garage_door_balance_test",
    taskName: "Garage Door Balance Test",
    category: "exterior",
    applicableSystemIds: ["exterior.garage_door"],
    frequencyType: "seasonal",
    frequencyValue: 180,
    frequencyUnit: "days",
    seasonalMonths: [4, 10],
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 50, high: 100 },
    shortDescription: "Test garage door spring balance by disconnecting the opener and checking that the door holds position at waist height.",
    detailedInstructions:
      "1. Close the garage door completely.\n" +
      "2. Pull the emergency release handle (usually a red cord hanging from the opener rail) to disconnect the opener.\n" +
      "3. Lift the door manually by hand to about waist height (3-4 feet).\n" +
      "4. Release the door carefully. A properly balanced door should stay in place or drift very slowly.\n" +
      "5. If the door falls rapidly, the springs are weak or broken — call a professional.\n" +
      "6. If the door shoots upward, the springs have too much tension — call a professional.\n" +
      "7. Test at three positions: quarter open, half open, and three-quarters open. The door should hold at each.\n" +
      "8. An unbalanced door forces the opener to work harder, shortening its life.\n" +
      "9. Do NOT attempt to adjust springs yourself — this is professional work only.\n" +
      "10. Reconnect the opener by pulling the release handle toward the door and pressing the opener button.",
    whyItMatters: "An unbalanced garage door puts tremendous strain on the opener motor and hardware. It's also a safety hazard — a door with weak springs can fall unexpectedly with the full weight of the door. The balance test takes 2 minutes and catches spring problems early.",
    whatHappensIfSkipped: "The opener motor overworks compensating for unbalanced springs, burning out 3-5 years early ($250-500 replacement). The door falls unpredictably when the opener is disconnected. Eventually springs fail completely, and the door becomes inoperable.",
    toolsNeeded: [],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Catching spring imbalance early prevents $250-500 in opener replacement from overwork.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  {
    taskId: "exterior.garage_door_weatherstrip",
    taskName: "Replace Garage Door Weatherstrip",
    category: "exterior",
    applicableSystemIds: ["exterior.garage_door"],
    frequencyType: "interval",
    frequencyValue: 910,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 730, reason: "UV and heat degrade rubber weatherstripping faster in Florida" },
    ],
    difficulty: "moderate",
    estimatedTimeMinutes: 45,
    diyCost: { low: 15, high: 40 },
    proCost: { low: 100, high: 200 },
    shortDescription: "Replace the bottom rubber seal and side/top weatherstripping on the garage door.",
    detailedInstructions:
      "1. Open the garage door and support it securely (or have someone hold the opener button).\n" +
      "2. Examine the bottom seal — if cracked, hardened, or flattened, it needs replacement.\n" +
      "3. Slide the old bottom seal out of the retainer track (it pulls out from one end).\n" +
      "4. Clean the retainer track of dirt and debris.\n" +
      "5. Slide the new bottom seal into the retainer from one end, working it across the full width.\n" +
      "6. Check side weatherstripping (vinyl or rubber seals along the door jambs). Replace if cracked or missing.\n" +
      "7. Check the top seal between the door and header — replace if deteriorated.\n" +
      "8. Use silicone spray on the retainer to help new seals slide in smoothly.\n" +
      "9. Close the door and verify the bottom seal contacts the floor evenly with no gaps.\n" +
      "10. Look for daylight from inside — any visible gaps indicate the seal needs adjustment.",
    whyItMatters: "Garage door weatherstripping keeps out rain, wind, dust, insects, and small animals. It also provides thermal insulation, especially if the garage is air-conditioned or houses water heaters and other equipment. In hurricane zones, proper sealing prevents wind-driven rain from flooding the garage.",
    whatHappensIfSkipped: "Water floods under the door during heavy rain, damaging stored items and vehicles. Insects and rodents enter freely. Dust infiltrates, coating everything in the garage. Energy is wasted heating/cooling a garage with a failed seal. In hurricanes, wind-driven rain enters through failed seals and can cause significant interior damage.",
    toolsNeeded: ["Pliers", "Flathead screwdriver", "Tape measure"],
    suppliesNeeded: ["Bottom door seal (measure width first)", "Side weatherstrip (if needed)", "Silicone spray"],
    careKitProductIds: [],
    estimatedSavings: "A $25 seal replacement prevents $500-2,000 in water damage and pest intrusion issues.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  {
    taskId: "exterior.garage_opener_safety_test",
    taskName: "Test Garage Door Auto-Reverse Safety",
    category: "exterior",
    applicableSystemIds: ["exterior.garage_door_opener"],
    frequencyType: "interval",
    frequencyValue: 30,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 5,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 50, high: 75 },
    shortDescription: "Test the garage door opener's auto-reverse safety mechanism and photo-eye sensors monthly.",
    detailedInstructions:
      "1. Place a 2x4 board flat on the ground in the center of the door opening.\n" +
      "2. Press the wall button or remote to close the door.\n" +
      "3. The door should hit the 2x4 and immediately reverse direction. If it does not, the opener needs adjustment.\n" +
      "4. Remove the 2x4 and test the photo-eye sensors.\n" +
      "5. Start closing the door, then wave your foot through the photo-eye beam (6 inches above the floor).\n" +
      "6. The door should immediately stop and reverse. If it does not, clean or align the sensors.\n" +
      "7. Check that both photo-eye LEDs are lit solid (not flickering, which indicates misalignment).\n" +
      "8. Clean photo-eye lenses with a soft cloth — cobwebs and dust cause false triggers.\n" +
      "9. If the door does not reverse for either test, stop using the opener and call for service immediately.\n" +
      "10. This test is required by federal law (UL 325) and protects children and pets from being crushed.",
    whyItMatters: "The auto-reverse mechanism is the single most important safety feature on a garage door opener. It exists to prevent the 200+ lb door from crushing a person, child, or pet. Federal law requires this feature, and monthly testing ensures it works.",
    whatHappensIfSkipped: "A garage door that does not auto-reverse will close on anything in its path with the full force of the motor and door weight. Children, pets, and adults have been killed by malfunctioning garage doors. This is not optional maintenance — it is a life safety test.",
    toolsNeeded: ["2x4 board (about 2 feet long)", "Soft cloth"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "This test costs nothing and prevents irreplaceable harm to people and pets.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  {
    taskId: "exterior.garage_opener_lubricate",
    taskName: "Lubricate Garage Door Opener Chain or Belt",
    category: "exterior",
    applicableSystemIds: ["exterior.garage_door_opener"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCost: { low: 5, high: 10 },
    proCost: { low: 50, high: 75 },
    shortDescription: "Lubricate the garage door opener drive mechanism (chain, belt, or screw) for smooth, quiet operation.",
    detailedInstructions:
      "1. Identify your opener drive type: chain, belt, or screw drive.\n" +
      "2. For chain drives: apply white lithium grease to the chain along its full length.\n" +
      "3. For screw drives: apply lithium grease to the screw shaft from end to end.\n" +
      "4. For belt drives: no lubrication needed on the belt itself. Lubricate only the trolley and rail.\n" +
      "5. Apply lubricant to the trolley (the piece that moves along the rail connected to the door arm).\n" +
      "6. Open and close the door 2-3 times to distribute lubricant along the full travel.\n" +
      "7. Wipe any excess grease that has dripped.\n" +
      "8. Listen for smooth, quiet operation — grinding or clicking indicates a worn component.\n" +
      "9. Check the drive arm connection to the door bracket for tightness.\n" +
      "10. Never spray WD-40 on the drive mechanism — it's a solvent, not a lubricant, and washes off real grease.",
    whyItMatters: "The drive mechanism moves a 200+ lb door up to 1,500 times per year. A dry chain or screw wears rapidly, creating slack that causes jerky operation and accelerated wear on the motor. Proper lubrication keeps the system quiet and extends its life.",
    whatHappensIfSkipped: "A dry chain stretches, creating excess slack that causes the door to jerk and vibrate. Screw drives bind and strip. The motor overworks to compensate, burning out 3-5 years early. Replacing an opener costs $250-500 installed.",
    toolsNeeded: ["Step ladder", "Clean rag"],
    suppliesNeeded: ["White lithium grease"],
    careKitProductIds: [],
    estimatedSavings: "A $5 lubrication prevents premature opener failure — savings of $250-500.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  {
    taskId: "exterior.garage_opener_force_adjust",
    taskName: "Adjust Garage Door Opener Force Settings",
    category: "exterior",
    applicableSystemIds: ["exterior.garage_door_opener"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 15,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 50, high: 100 },
    shortDescription: "Adjust the garage door opener's open and close force settings and travel limits for optimal operation.",
    detailedInstructions:
      "1. Locate the force and travel limit adjustment controls on the opener unit (usually on the back or side).\n" +
      "2. Test the current close force: the door should close fully but not slam with excessive force.\n" +
      "3. Test the current open force: the door should open fully and stop without banging the stop bolts.\n" +
      "4. If the door reverses before fully closing (without obstruction), increase the close force slightly.\n" +
      "5. If the door does not reverse on the 2x4 test, decrease the close force.\n" +
      "6. Adjust in small increments — typically ¼ turn at a time.\n" +
      "7. Test the travel limits: the door should stop fully open with 1-2 inches of gap from the motor unit.\n" +
      "8. The door should close completely against the floor with the seal compressed.\n" +
      "9. After any adjustment, perform the auto-reverse safety test with a 2x4.\n" +
      "10. Most openers have separate adjustments for open force, close force, open travel, and close travel.",
    whyItMatters: "Force settings balance two competing needs: enough force to reliably move the door, but little enough to safely reverse when it contacts an obstruction. As springs age, door alignment shifts, and weatherstripping changes, force settings need periodic adjustment to maintain this balance.",
    whatHappensIfSkipped: "Too much force and the door won't reverse on contact — a crushing hazard. Too little force and the door won't fully close in cold weather or when the springs need lubrication. Improper travel limits cause the door to not close fully (leaving a gap) or to slam into the floor.",
    toolsNeeded: ["Step ladder", "Flathead screwdriver", "2x4 board (for safety test)"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Proper adjustment prevents premature opener wear and ensures life safety compliance.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // DECK (4 tasks)
  // ================================================================

  {
    taskId: "exterior.deck_clean",
    taskName: "Clean Deck",
    category: "exterior",
    applicableSystemIds: ["exterior.deck_wood", "exterior.deck_composite"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    seasonalMonths: [3, 4],
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 180, reason: "Mold, mildew, and algae grow year-round on decks in humid climates" },
    ],
    difficulty: "moderate",
    estimatedTimeMinutes: 120,
    diyCost: { low: 15, high: 40 },
    proCost: { low: 200, high: 400 },
    shortDescription: "Clean all deck surfaces to remove dirt, mold, mildew, and algae buildup.",
    detailedInstructions:
      "1. Remove all furniture, planters, and items from the deck.\n" +
      "2. Sweep the entire deck and remove debris from between boards.\n" +
      "3. Mix a deck cleaning solution per the product label, or use 1 cup oxygen bleach per gallon of water.\n" +
      "4. Apply the solution with a pump sprayer or watering can, covering all surfaces.\n" +
      "5. Let dwell 10-15 minutes. Scrub stubborn areas with a stiff-bristle deck brush.\n" +
      "6. For wood decks: pressure wash at 1,200-1,500 PSI using a fan tip held 6-8 inches from the surface.\n" +
      "7. For composite decks: use low pressure (under 1,200 PSI) or just a garden hose — high pressure damages composite.\n" +
      "8. Work in the direction of the boards, never across them.\n" +
      "9. Allow the deck to dry completely (2-3 days) before applying stain, sealant, or returning furniture.\n" +
      "10. Inspect the deck while cleaning — this is the best time to spot rot, loose boards, and structural issues.",
    whyItMatters: "Mold, mildew, and algae make decks slippery and dangerous. They also hold moisture against the wood, accelerating rot and decay. Cleaning is the essential first step before staining or sealing and the best opportunity to inspect the deck's condition.",
    whatHappensIfSkipped: "Biological growth creates a slippery surface that causes falls. Trapped moisture rots wood from the surface inward. Mold between boards causes hidden joist decay. Stain and sealant won't adhere to a dirty surface, wasting money on products that peel off.",
    toolsNeeded: ["Stiff-bristle deck brush", "Pump sprayer", "Pressure washer (for wood decks)", "Broom"],
    suppliesNeeded: ["Deck cleaning solution or oxygen bleach"],
    careKitProductIds: [],
    estimatedSavings: "DIY cleaning saves $200-400 vs. professional service. Clean decks last 5-10 years longer.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  {
    taskId: "exterior.deck_stain_seal",
    taskName: "Stain and Seal Wood Deck",
    category: "exterior",
    applicableSystemIds: ["exterior.deck_wood"],
    frequencyType: "interval",
    frequencyValue: 910,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 730, reason: "UV and moisture shorten stain life to 2 years in Florida" },
    ],
    difficulty: "moderate",
    estimatedTimeMinutes: 240,
    diyCost: { low: 50, high: 150 },
    proCost: { low: 300, high: 800 },
    shortDescription: "Apply stain and/or sealant to all wood deck surfaces to protect against UV, moisture, and decay.",
    detailedInstructions:
      "1. Clean the deck thoroughly first — stain will not adhere to a dirty surface.\n" +
      "2. If there is old stain, strip it with a deck stripper and brightener per product directions.\n" +
      "3. Allow the deck to dry completely — at least 48 hours after cleaning.\n" +
      "4. Choose a semi-transparent or solid stain with UV protection and mildewcide.\n" +
      "5. Apply stain with a brush, roller, or pump sprayer. Work in manageable sections (2-3 boards wide).\n" +
      "6. Apply in the direction of the wood grain, maintaining a wet edge to avoid lap marks.\n" +
      "7. Coat all exposed surfaces including edges, cut ends, and the underside of railings.\n" +
      "8. Apply a second coat if recommended by the product manufacturer (follow recoat timing exactly).\n" +
      "9. Stain in shade or overcast conditions — direct sun causes flashing and uneven absorption.\n" +
      "10. Allow full cure time (typically 24-48 hours) before walking on the deck or replacing furniture.",
    whyItMatters: "Wood decks are directly exposed to sun, rain, and foot traffic. Without stain and sealant, UV breaks down wood fibers and moisture initiates rot. A properly maintained wood deck lasts 15-25 years. An unprotected one fails in 5-8 years in humid climates.",
    whatHappensIfSkipped: "Unprotected wood grays, cracks, splinters, and begins rotting within 1-2 seasons in Florida. The surface becomes a slip hazard when wet with algae. Replacement of a decayed deck costs $3,000-20,000 — a $100 stain application prevents this.",
    toolsNeeded: ["Paintbrush or stain applicator", "Roller", "Paint tray", "Pump sprayer (optional)"],
    suppliesNeeded: ["Deck stain with UV protection", "Deck stripper (if recoating)", "Deck brightener"],
    careKitProductIds: [],
    estimatedSavings: "A $100 stain application prevents $3,000-20,000 in deck replacement.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  {
    taskId: "exterior.deck_inspect_structure",
    taskName: "Inspect Deck Structure",
    category: "exterior",
    applicableSystemIds: ["exterior.deck_wood", "exterior.deck_composite"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 180, reason: "Moisture and termites accelerate structural decay in Gulf Coast climates" },
    ],
    difficulty: "moderate",
    estimatedTimeMinutes: 30,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 100, high: 250 },
    shortDescription: "Inspect deck joists, posts, beams, ledger board, and connections for rot, insect damage, and structural integrity.",
    detailedInstructions:
      "1. Start underneath the deck — inspect joists, beams, and post bases from below.\n" +
      "2. Probe all wood members with a screwdriver — solid wood resists penetration; rotted wood is soft.\n" +
      "3. Check the ledger board (where the deck connects to the house) — this is the most critical connection.\n" +
      "4. Look for gaps between the ledger and the house wall — water enters here and rots both the ledger and house framing.\n" +
      "5. Verify all joist hangers are present, properly nailed, and not rusting through.\n" +
      "6. Check post bases — wood posts should not sit directly in soil or concrete (use post base hardware).\n" +
      "7. Look for insect damage — termite mud tubes, carpenter ant frass (sawdust), or bore holes.\n" +
      "8. Test railing posts by pushing firmly — they should not wobble or flex.\n" +
      "9. Check all bolts and lag screws at post-to-beam connections for tightness.\n" +
      "10. Stand in different areas and bounce — excessive bounce indicates undersized or damaged joists.",
    whyItMatters: "Deck collapses cause hundreds of injuries annually in the US. The most common failure point is the ledger board connection, followed by rotted posts and corroded hardware. A structural inspection takes 30 minutes and can prevent a catastrophic collapse.",
    whatHappensIfSkipped: "A rotted ledger board fails suddenly under load — the deck separates from the house with everyone on it. Corroded joist hangers snap under weight. Rotted posts buckle. Deck collapses are sudden, violent events that cause serious injuries. Structural repair costs $500-5,000; medical bills and liability from a collapse are unlimited.",
    toolsNeeded: ["Screwdriver or awl", "Flashlight", "Socket wrench"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Catching a structural issue at $500-2,000 prevents catastrophic collapse and potential injuries.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  {
    taskId: "exterior.deck_hardware_check",
    taskName: "Check Deck Hardware and Fasteners",
    category: "exterior",
    applicableSystemIds: ["exterior.deck_wood", "exterior.deck_composite"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 20,
    diyCost: { low: 5, high: 20 },
    proCost: { low: 75, high: 150 },
    shortDescription: "Check and tighten all deck screws, bolts, railing fasteners, and connection hardware.",
    detailedInstructions:
      "1. Walk the entire deck surface looking for raised, popped, or loose screws and nails.\n" +
      "2. Drive popped nails back in or (better) replace them with deck screws.\n" +
      "3. Tighten any loose deck board screws — use a drill/driver on low torque to avoid stripping.\n" +
      "4. Check every railing post base for tight bolts — wobbling railings are a fall hazard.\n" +
      "5. Inspect railing balusters — grab and twist each one. Loose balusters need to be resecured.\n" +
      "6. Check stair stringers and treads for loose fasteners.\n" +
      "7. Inspect all metal hardware (brackets, joist hangers, post bases) for rust and corrosion.\n" +
      "8. Replace any fasteners that are corroded through — use stainless steel or coated deck screws.\n" +
      "9. Check the ledger board lag bolts with a socket wrench — they should be snug.\n" +
      "10. Note any boards that have split around fasteners — they may need replacement.",
    whyItMatters: "Every fastener on a deck is a structural connection. Loose fasteners create movement that accelerates wear, causes squeaking, and reduces the deck's load capacity. A few minutes of tightening each year keeps the deck solid and safe.",
    whatHappensIfSkipped: "Loose boards become trip hazards. Wobbling railings fail when leaned against. Popped nails scratch bare feet. Corroded fasteners lose holding power. The deck gradually becomes unsafe — and liability falls on the homeowner if someone is injured.",
    toolsNeeded: ["Drill/driver", "Socket wrench set", "Hammer"],
    suppliesNeeded: ["Stainless steel or coated deck screws", "Replacement bolts (if needed)"],
    careKitProductIds: [],
    estimatedSavings: "A $10 box of screws prevents trip hazards and maintains structural integrity.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // FENCE (4 tasks)
  // ================================================================

  {
    taskId: "exterior.fence_inspect",
    taskName: "Inspect Fence",
    category: "exterior",
    applicableSystemIds: ["exterior.fence_wood", "exterior.fence_vinyl"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 180, reason: "Termites, moisture, and UV degrade fences faster in tropical climates" },
    ],
    difficulty: "easy",
    estimatedTimeMinutes: 20,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 50, high: 100 },
    shortDescription: "Walk the entire fence line inspecting for leaning, rot, broken boards, loose fasteners, and insect damage.",
    detailedInstructions:
      "1. Walk the entire fence perimeter, examining both sides if accessible.\n" +
      "2. Check for leaning sections — sight along the fence line for posts that are off-vertical.\n" +
      "3. Look for broken, cracked, split, or missing boards or pickets.\n" +
      "4. Check the bottom of wood fence boards for rot where they contact or are close to the ground.\n" +
      "5. Look for termite mud tubes on posts and rails, especially at ground level.\n" +
      "6. Examine gates for proper operation — they should swing freely and latch securely.\n" +
      "7. Check gate hinges for rust, looseness, or sagging.\n" +
      "8. For vinyl fences, look for cracked, discolored, or loose panels.\n" +
      "9. Note any areas where vegetation is growing into or against the fence — this causes damage over time.\n" +
      "10. Document issues and prioritize repairs: leaning posts and broken boards first, cosmetic issues second.",
    whyItMatters: "A fence provides security, privacy, and property definition. Small issues like a leaning post or loose board worsen with every wind event. Regular inspection catches problems when they're a $50 fix instead of a $500 section replacement.",
    whatHappensIfSkipped: "A leaning post stresses the entire section — one storm flattens it. Rot spreads from one board to adjacent boards and into the rails. Broken boards compromise security and let pets escape. A neglected fence lowers property value and creates neighbor disputes.",
    toolsNeeded: ["Flashlight", "Camera"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Early detection of a $50 repair prevents $500-1,000 section replacement.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  {
    taskId: "exterior.fence_stain_seal",
    taskName: "Stain and Seal Wood Fence",
    category: "exterior",
    applicableSystemIds: ["exterior.fence_wood"],
    frequencyType: "interval",
    frequencyValue: 910,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 730, reason: "UV and moisture shorten stain life to 2 years on fences in Florida" },
    ],
    difficulty: "moderate",
    estimatedTimeMinutes: 240,
    diyCost: { low: 50, high: 150 },
    proCost: { low: 300, high: 800 },
    shortDescription: "Apply protective stain and sealant to the entire wood fence to prevent UV damage, moisture absorption, and decay.",
    detailedInstructions:
      "1. Clean the fence with a pressure washer at 1,200-1,500 PSI or scrub with a deck/fence cleaner.\n" +
      "2. Allow 2-3 days to dry completely.\n" +
      "3. Make any repairs before staining — replace rotted boards and reset loose fasteners.\n" +
      "4. Use a pump sprayer to apply stain quickly to both sides of the fence.\n" +
      "5. Back-brush with a brush or roller to work stain into the wood grain and avoid runs.\n" +
      "6. Coat all surfaces: front, back, top edges, and especially end grain where moisture enters fastest.\n" +
      "7. Pay extra attention to posts at ground level — this is where rot starts.\n" +
      "8. Apply a second coat if recommended by the stain manufacturer.\n" +
      "9. Protect landscaping and hardscape from overspray with drop cloths or cardboard.\n" +
      "10. Allow full cure time before contact (typically 24-48 hours).",
    whyItMatters: "Wood fences are fully exposed to weather on both sides with no roof protection. Without stain and sealant, UV turns wood gray and fibrous while moisture initiates rot. Fence boards in Florida rot completely in 3-5 years without protection.",
    whatHappensIfSkipped: "Unprotected fence boards rot from both sides simultaneously. Posts rot at ground level and fall in wind. What started as a $100 stain application becomes a $1,500-10,000 fence replacement.",
    toolsNeeded: ["Pump sprayer", "Paintbrush or roller", "Pressure washer (for cleaning)"],
    suppliesNeeded: ["Fence stain with UV protection and mildewcide", "Fence/deck cleaner"],
    careKitProductIds: [],
    estimatedSavings: "A $100 stain application extends fence life by 5-8 years, saving $1,500-10,000 in replacement.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  {
    taskId: "exterior.fence_post_check",
    taskName: "Check Fence Post Stability",
    category: "exterior",
    applicableSystemIds: ["exterior.fence_wood", "exterior.fence_vinyl"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 180, reason: "Posts rot at ground level within 5-8 years in Florida's wet soil; check biannually" },
    ],
    difficulty: "easy",
    estimatedTimeMinutes: 15,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 50, high: 100 },
    shortDescription: "Push-test every fence post for stability and check for rot, insect damage, or loose footing at ground level.",
    detailedInstructions:
      "1. Start at one end of the fence and push each post firmly back and forth.\n" +
      "2. A solid post barely moves. A compromised post rocks visibly in the ground.\n" +
      "3. Check the post at ground level — probe with a screwdriver for soft, rotted wood.\n" +
      "4. Look for concrete footing that has cracked or heaved, loosening the post.\n" +
      "5. Check for soil erosion around post bases that has exposed the footing.\n" +
      "6. For vinyl fence posts, check the internal wood or metal reinforcement by feeling for flex.\n" +
      "7. Gate posts take the most stress — check these extra carefully.\n" +
      "8. If a post is loose but the above-ground portion is sound, re-set it with new concrete.\n" +
      "9. If the post has rotted at ground level, it needs replacement (or a post repair bracket for a temporary fix).\n" +
      "10. Document any loose posts for repair before the next wind event.",
    whyItMatters: "Fence posts are the skeleton that supports the entire fence. A single rotted post can take down an entire section during a storm. In Florida, where hurricane-force winds test every fence annually, loose posts are a liability waiting to happen.",
    whatHappensIfSkipped: "One loose post puts lateral stress on adjacent posts, creating a domino effect during high winds. The entire fence section lays down in one storm. Emergency fence repair during hurricane season is expensive and often unavailable. A $50 post repair prevents $500-1,000 in section replacement.",
    toolsNeeded: ["Screwdriver (for probing)", "Level"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Catching a loose post early saves $500-1,000 in section replacement after storm damage.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  {
    taskId: "exterior.fence_vinyl_wash",
    taskName: "Wash Vinyl Fence",
    category: "exterior",
    applicableSystemIds: ["exterior.fence_vinyl"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 180, reason: "Mold and algae stain vinyl fences rapidly in humid climates" },
    ],
    difficulty: "easy",
    estimatedTimeMinutes: 60,
    diyCost: { low: 5, high: 15 },
    proCost: { low: 100, high: 250 },
    shortDescription: "Wash vinyl fence panels to remove mold, mildew, dirt, and green algae staining.",
    detailedInstructions:
      "1. Mix a cleaning solution: 1 part white vinegar to 3 parts water, or use a commercial vinyl cleaner.\n" +
      "2. For mold and mildew, add ½ cup bleach per gallon of water.\n" +
      "3. Apply the solution with a pump sprayer, working one section at a time.\n" +
      "4. Let dwell for 5-10 minutes.\n" +
      "5. Scrub with a soft-bristle brush or sponge — avoid abrasive pads that scratch vinyl.\n" +
      "6. Rinse thoroughly with a garden hose from top to bottom.\n" +
      "7. For heavy staining, a pressure washer at under 1,500 PSI with a wide fan tip can be used carefully.\n" +
      "8. Do not use acetone, lacquer thinner, or harsh solvents — they damage vinyl.\n" +
      "9. Clean both sides of the fence if accessible.\n" +
      "10. Maintain a 3-inch gap between soil/mulch and the bottom of the fence to reduce splash-back staining.",
    whyItMatters: "Vinyl fences are marketed as maintenance-free, but in humid climates, mold, mildew, and green algae stain them heavily. Regular washing keeps the fence looking clean and prevents permanent staining that reduces curb appeal and property value.",
    whatHappensIfSkipped: "Mold and algae stains become permanent as they etch into the vinyl surface. The fence turns from white to green or gray. While structurally unaffected, the cosmetic damage reduces property value and makes the home look neglected.",
    toolsNeeded: ["Pump sprayer", "Soft-bristle brush", "Garden hose"],
    suppliesNeeded: ["White vinegar or vinyl fence cleaner", "Bleach (for mold)"],
    careKitProductIds: [],
    estimatedSavings: "Regular washing preserves appearance and prevents permanent staining that devalues the property.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // DRIVEWAY (4 tasks)
  // ================================================================

  {
    taskId: "exterior.driveway_seal",
    taskName: "Seal Concrete Driveway",
    category: "exterior",
    applicableSystemIds: ["exterior.driveway_concrete"],
    frequencyType: "interval",
    frequencyValue: 910,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 730, reason: "UV and moisture degrade sealant faster in Florida's intense sun" },
    ],
    difficulty: "moderate",
    estimatedTimeMinutes: 120,
    diyCost: { low: 30, high: 80 },
    proCost: { low: 200, high: 500 },
    shortDescription: "Apply penetrating or surface sealant to the concrete driveway to protect against moisture, staining, and surface degradation.",
    detailedInstructions:
      "1. Pressure wash the driveway to remove all dirt, oil stains, mold, and debris.\n" +
      "2. Treat oil stains with a degreaser before washing.\n" +
      "3. Fill any cracks with concrete crack filler and allow it to cure (typically 24 hours).\n" +
      "4. Allow the concrete to dry completely — at least 24-48 hours after washing.\n" +
      "5. Choose a sealant: penetrating silane/siloxane sealer for natural look, or acrylic for a glossy finish.\n" +
      "6. Apply sealant with a roller, brush, or pump sprayer per manufacturer directions.\n" +
      "7. Work in manageable sections, maintaining a wet edge to avoid lap marks.\n" +
      "8. Apply a second coat if recommended (typically after the first coat dries for 2-4 hours).\n" +
      "9. Do not seal in direct sun or when temperatures exceed 90°F.\n" +
      "10. Keep traffic off the driveway for the recommended cure time (usually 24-72 hours).",
    whyItMatters: "Concrete is porous and absorbs water, oil, and chemicals. In hot climates, moisture absorption combined with thermal cycling causes surface spalling and scaling. A sealant creates a protective barrier that extends concrete life by decades.",
    whatHappensIfSkipped: "The concrete surface gradually erodes — becoming rough, pitted, and stained. Moisture seeps in and causes surface spalling (flaking). Tree root pressure cracks unprotected concrete more easily. A driveway replacement costs $5,000-15,000.",
    toolsNeeded: ["Pressure washer", "Roller or pump sprayer", "Paint tray"],
    suppliesNeeded: ["Concrete sealer", "Concrete crack filler", "Degreaser"],
    careKitProductIds: [],
    estimatedSavings: "A $50-80 DIY seal job extends driveway life by 5-10 years, deferring $5,000-15,000 in replacement.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  {
    taskId: "exterior.driveway_crack_fill",
    taskName: "Fill Driveway Cracks",
    category: "exterior",
    applicableSystemIds: ["exterior.driveway_concrete"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 30,
    diyCost: { low: 10, high: 30 },
    proCost: { low: 75, high: 200 },
    shortDescription: "Fill cracks in the concrete driveway to prevent water infiltration, weed growth, and crack expansion.",
    detailedInstructions:
      "1. Clean out all cracks with a wire brush and compressed air or a leaf blower.\n" +
      "2. Remove any weeds or grass growing in cracks — pull roots completely.\n" +
      "3. For narrow cracks (under ¼ inch), use a liquid concrete crack filler squeezed directly from the bottle.\n" +
      "4. For wider cracks (¼ inch to ½ inch), use a caulk-style concrete filler with a caulk gun.\n" +
      "5. For large cracks (over ½ inch), fill with sand to within ½ inch of the surface, then top with filler.\n" +
      "6. Smooth the filler level with the concrete surface using a putty knife.\n" +
      "7. Allow full cure time per product directions (typically 24-48 hours).\n" +
      "8. For control joint cracks, use a flexible sealant that allows for continued movement.\n" +
      "9. Monitor filled cracks over time — re-fill any that reopen.\n" +
      "10. Note any cracks that are widening rapidly or show vertical displacement — these indicate foundation movement.",
    whyItMatters: "Every crack in concrete grows. Water enters the crack, reaches the soil beneath, and washes away the support. Tree roots follow cracks. Even in Florida, water intrusion undermines the sub-base and causes settling.",
    whatHappensIfSkipped: "Small cracks widen into large ones. Water undermines the concrete slab, creating voids that cause further cracking and settling. Weeds colonize cracks and their roots accelerate the breakdown. A $10 crack fill prevents a $500 slab section replacement.",
    toolsNeeded: ["Wire brush", "Putty knife", "Caulk gun (for wider cracks)", "Leaf blower or compressed air"],
    suppliesNeeded: ["Concrete crack filler (liquid and/or caulk type)"],
    careKitProductIds: [],
    estimatedSavings: "A $10-30 crack fill prevents $500-2,000 in slab section replacement.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  {
    taskId: "exterior.driveway_sealcoat",
    taskName: "Sealcoat Asphalt Driveway",
    category: "exterior",
    applicableSystemIds: ["exterior.driveway_asphalt"],
    frequencyType: "interval",
    frequencyValue: 910,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 730, reason: "UV and heat oxidize asphalt faster in Florida; sealcoat every 2 years" },
    ],
    difficulty: "moderate",
    estimatedTimeMinutes: 180,
    diyCost: { low: 50, high: 100 },
    proCost: { low: 200, high: 500 },
    shortDescription: "Apply asphalt sealcoat to protect the driveway from UV, water, and chemical damage (every 2-3 years).",
    detailedInstructions:
      "1. Repair all cracks and potholes before sealcoating — sealcoat is protective, not structural.\n" +
      "2. Thoroughly clean the driveway — sweep, blow, and remove all oil stains with degreaser.\n" +
      "3. Edge the driveway with a broom to create clean borders.\n" +
      "4. Stir the sealcoat thoroughly (it settles significantly in the bucket).\n" +
      "5. Pour a ribbon of sealcoat across the driveway width at the far end.\n" +
      "6. Spread with a squeegee applicator or driveway brush, working in thin, even coats.\n" +
      "7. Work backward toward your exit point so you don't seal yourself in.\n" +
      "8. Allow the first coat to dry (typically 4-8 hours or overnight).\n" +
      "9. Apply a second coat perpendicular to the first for complete coverage.\n" +
      "10. Keep traffic off for 24-48 hours. Barricade with caution tape or sawhorses.",
    whyItMatters: "Asphalt is a petroleum product that oxidizes and becomes brittle when exposed to UV and weather. Sealcoat is the sunscreen for your driveway — it blocks UV, repels water, and prevents chemical spills from dissolving the asphalt binder. Without it, asphalt crumbles within 8-10 years.",
    whatHappensIfSkipped: "UV turns the asphalt gray and brittle. Water penetrates the surface, softens the base, and causes potholes. Gasoline and oil from vehicles dissolve unprotected asphalt. A driveway that should last 20+ years with sealcoating fails in 10-12 without it. Replacement costs $2,500-12,000.",
    toolsNeeded: ["Squeegee applicator or driveway brush", "Stir stick", "Broom", "Leaf blower"],
    suppliesNeeded: ["Asphalt sealcoat (typically 2-4 5-gallon buckets)", "Asphalt crack filler", "Degreaser"],
    careKitProductIds: [],
    estimatedSavings: "A $75 DIY sealcoat application extends driveway life by 5-10 years, saving $2,500-12,000 in replacement.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  {
    taskId: "exterior.driveway_crack_repair",
    taskName: "Repair Asphalt Driveway Cracks",
    category: "exterior",
    applicableSystemIds: ["exterior.driveway_asphalt"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 30,
    diyCost: { low: 10, high: 30 },
    proCost: { low: 75, high: 200 },
    shortDescription: "Fill cracks in the asphalt driveway with rubberized crack filler to prevent water damage and pothole formation.",
    detailedInstructions:
      "1. Clean cracks with a wire brush, removing all loose material, dirt, and vegetation.\n" +
      "2. Blow out debris with a leaf blower or compressed air.\n" +
      "3. For narrow cracks (under ½ inch), use a pourable liquid crack filler directly from the bottle.\n" +
      "4. For wider cracks (½ inch to 1 inch), use a rubberized asphalt crack filler from a caulk tube.\n" +
      "5. Fill the crack slightly below the surface — overfilling creates bumps.\n" +
      "6. For very deep cracks, fill in layers, allowing each layer to cure before adding the next.\n" +
      "7. Smooth the surface with a putty knife.\n" +
      "8. Allow full cure time (typically 24-48 hours) before driving on repaired areas.\n" +
      "9. For alligator cracking (interconnected web pattern), the area needs patching, not just filling.\n" +
      "10. Fill cracks before sealcoating for best results.",
    whyItMatters: "Every crack in asphalt is an entry point for water. Water reaches the gravel base, washes it away, and creates a void beneath the surface. The next vehicle load collapses the unsupported asphalt into a pothole. Filling cracks immediately prevents this cascade.",
    whatHappensIfSkipped: "Water undermines the base, creating voids that become potholes. Vegetation roots in cracks and forces them wider. A $10 crack fill prevents $200-500 in pothole patching or $2,500+ in section replacement.",
    toolsNeeded: ["Wire brush", "Leaf blower or compressed air", "Putty knife", "Caulk gun"],
    suppliesNeeded: ["Rubberized asphalt crack filler"],
    careKitProductIds: [],
    estimatedSavings: "A $10-30 crack fill prevents $200-2,500 in pothole repair or section replacement.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // PATIO (3 tasks)
  // ================================================================

  {
    taskId: "exterior.patio_clean",
    taskName: "Clean Patio",
    category: "exterior",
    applicableSystemIds: ["exterior.patio_concrete"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 180, reason: "Algae and mold make patios dangerously slippery in humid climates; clean biannually" },
    ],
    difficulty: "easy",
    estimatedTimeMinutes: 45,
    diyCost: { low: 10, high: 25 },
    proCost: { low: 100, high: 250 },
    shortDescription: "Clean the patio surface to remove dirt, algae, mold, and stains for safety and appearance.",
    detailedInstructions:
      "1. Remove all furniture, planters, and decorations from the patio.\n" +
      "2. Sweep to remove loose debris and leaves.\n" +
      "3. Apply a cleaning solution: oxygen bleach solution or a concrete/patio cleaner.\n" +
      "4. Let the solution dwell for 10-15 minutes.\n" +
      "5. Scrub stubborn stains with a stiff-bristle push broom or deck brush.\n" +
      "6. Rinse with a garden hose or pressure washer (1,500-2,000 PSI for concrete).\n" +
      "7. For pavers, be careful not to blow out the joint sand — use lower pressure.\n" +
      "8. Treat oil and grease stains with a degreaser before general washing.\n" +
      "9. Allow to dry before replacing furniture.\n" +
      "10. Apply a mildew-resistant treatment to shaded areas prone to recurring growth.",
    whyItMatters: "A dirty patio is a slip-and-fall hazard, especially when algae and mold create a film on concrete. Regular cleaning maintains safe walking surfaces and keeps the outdoor living space inviting and usable.",
    whatHappensIfSkipped: "Algae and mold create a slippery film — falls on concrete cause serious injuries. Stains become permanent as they etch into the surface. The patio becomes an unused eyesore instead of a living space.",
    toolsNeeded: ["Stiff-bristle push broom", "Garden hose or pressure washer", "Pump sprayer"],
    suppliesNeeded: ["Patio cleaner or oxygen bleach", "Degreaser (for oil stains)"],
    careKitProductIds: [],
    estimatedSavings: "DIY cleaning saves $100-250. Preventing a slip-and-fall injury is invaluable.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  {
    taskId: "exterior.patio_seal",
    taskName: "Seal Patio",
    category: "exterior",
    applicableSystemIds: ["exterior.patio_concrete"],
    frequencyType: "interval",
    frequencyValue: 910,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 730, reason: "UV and moisture degrade sealant faster in Florida's climate" },
    ],
    difficulty: "moderate",
    estimatedTimeMinutes: 90,
    diyCost: { low: 30, high: 60 },
    proCost: { low: 150, high: 400 },
    shortDescription: "Apply a protective sealant to the patio surface to resist staining, moisture, and surface degradation.",
    detailedInstructions:
      "1. Clean the patio thoroughly and allow it to dry completely (48+ hours).\n" +
      "2. Fill any cracks with concrete filler and let cure.\n" +
      "3. Choose a sealant appropriate for your patio material (penetrating for natural look, acrylic for sheen).\n" +
      "4. Apply with a roller, brush, or pump sprayer in thin, even coats.\n" +
      "5. Work in manageable sections, maintaining a wet edge.\n" +
      "6. For pavers, use a paver-specific sealant that also stabilizes joint sand.\n" +
      "7. Apply a second coat after the first dries (typically 2-4 hours).\n" +
      "8. Do not apply in direct sun or when temperatures exceed 90°F.\n" +
      "9. Allow 24-48 hours of cure time before foot traffic.\n" +
      "10. Keep furniture off for 72 hours to prevent imprinting.",
    whyItMatters: "Sealing a patio protects the surface from staining, reduces algae growth, and prevents moisture absorption that leads to surface spalling. A sealed patio is easier to clean, safer to walk on, and lasts significantly longer.",
    whatHappensIfSkipped: "The concrete surface erodes, becoming rough and pitted. Stains from leaves, rust, and grills become permanent. Moisture absorption causes surface scaling and spalling. Replacement costs $2,000-12,000.",
    toolsNeeded: ["Roller or pump sprayer", "Paint tray", "Brush (for edges)"],
    suppliesNeeded: ["Concrete/paver sealant", "Crack filler (if needed)"],
    careKitProductIds: [],
    estimatedSavings: "A $50 DIY seal extends patio life by 10+ years, deferring $2,000-12,000 in replacement.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  {
    taskId: "exterior.patio_crack_repair",
    taskName: "Repair Patio Cracks",
    category: "exterior",
    applicableSystemIds: ["exterior.patio_concrete"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 30,
    diyCost: { low: 10, high: 25 },
    proCost: { low: 75, high: 200 },
    shortDescription: "Fill and repair cracks in the patio surface to prevent water damage, weed growth, and trip hazards.",
    detailedInstructions:
      "1. Clean all cracks with a wire brush and compressed air to remove dirt and loose material.\n" +
      "2. Pull any weeds and vegetation, including roots.\n" +
      "3. For narrow cracks (under ¼ inch), apply liquid concrete crack filler directly.\n" +
      "4. For wider cracks, use a caulk-style concrete filler or mix a small batch of concrete patch.\n" +
      "5. Smooth the surface flush with the surrounding concrete using a putty knife or trowel.\n" +
      "6. For paver patios, re-level any settled pavers by lifting, adding sand beneath, and re-seating.\n" +
      "7. Refill paver joints with polymeric sand to prevent weed growth and ant colonies.\n" +
      "8. Allow repairs to cure per product directions (24-48 hours typically).\n" +
      "9. Note any cracks that indicate heaving or significant settling — these may need professional assessment.\n" +
      "10. Apply sealant after all repairs have cured for long-term protection.",
    whyItMatters: "Patio cracks are trip hazards and water entry points. Water entering under the patio slab washes away the base material, creating voids that cause further cracking and settling. Prompt crack repair maintains safety and structural integrity.",
    whatHappensIfSkipped: "Cracks widen, creating trip hazards. Water undermines the slab, causing settling and more cracking. Weeds and ant colonies colonize untreated cracks. A $15 repair prevents $200-500 in section replacement.",
    toolsNeeded: ["Wire brush", "Putty knife or trowel", "Compressed air or leaf blower"],
    suppliesNeeded: ["Concrete crack filler", "Polymeric sand (for pavers)"],
    careKitProductIds: [],
    estimatedSavings: "A $15 crack fill prevents $200-500 in section replacement and eliminates trip hazards.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // EXTERIOR PAINT (2 tasks)
  // ================================================================

  {
    taskId: "exterior.paint_inspect",
    taskName: "Inspect Exterior Paint",
    category: "exterior",
    applicableSystemIds: ["exterior.exterior_paint"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 180, reason: "Intense UV, salt air, and humidity cause rapid paint degradation in Florida" },
    ],
    difficulty: "easy",
    estimatedTimeMinutes: 20,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 50, high: 100 },
    shortDescription: "Walk the exterior and inspect all painted surfaces for peeling, chalking, cracking, blistering, and mildew.",
    detailedInstructions:
      "1. Walk the entire exterior examining all painted surfaces in good lighting.\n" +
      "2. Run your hand across the paint — heavy chalk transfer (white powder) means the paint film is breaking down.\n" +
      "3. Look for peeling, flaking, or blistering — these indicate adhesion failure or moisture behind the paint.\n" +
      "4. Check for cracking patterns: alligator cracking (deep) indicates the paint system has failed.\n" +
      "5. Note areas of mildew or mold growth on paint — black spots or patches.\n" +
      "6. Pay special attention to south and west-facing walls that get the most UV exposure.\n" +
      "7. Check trim, fascia, and window/door casings — these often fail before wall paint.\n" +
      "8. Look at paint where it meets caulk lines — separation here means moisture entry.\n" +
      "9. Document areas needing touch-up vs. areas needing full repaint.\n" +
      "10. Plan touch-ups immediately and schedule full repaint when more than 25% of the surface shows failure.",
    whyItMatters: "Exterior paint is both cosmetic and protective. Once the paint film fails, the substrate underneath — wood, stucco, fiber cement, or metal — is exposed to UV, moisture, and biological attack. Catching paint failure early means a touch-up instead of a full repaint.",
    whatHappensIfSkipped: "Failed paint areas grow rapidly as moisture gets under adjacent good paint and peels it off. The exposed substrate degrades — wood rots, stucco absorbs water, metal rusts. A $200 touch-up becomes a $3,000-12,000 full repaint plus substrate repair.",
    toolsNeeded: ["Camera"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Catching paint failure early saves $2,000-10,000 by enabling touch-up instead of full repaint.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  {
    taskId: "exterior.paint_touch_up",
    taskName: "Touch Up Exterior Paint",
    category: "exterior",
    applicableSystemIds: ["exterior.exterior_paint"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 180, reason: "Rapid paint degradation requires more frequent touch-ups in Florida" },
    ],
    difficulty: "moderate",
    estimatedTimeMinutes: 60,
    diyCost: { low: 20, high: 60 },
    proCost: { low: 150, high: 400 },
    shortDescription: "Touch up areas of peeling, chipping, or damaged exterior paint to maintain the protective coating.",
    detailedInstructions:
      "1. Scrape all loose, peeling, and flaking paint from the affected areas with a paint scraper.\n" +
      "2. Sand the edges where old paint meets bare substrate to create a smooth transition (feather edge).\n" +
      "3. Clean the area with a damp cloth to remove dust and debris.\n" +
      "4. Apply primer to all bare substrate — wood, metal, or stucco must be primed before top-coating.\n" +
      "5. Allow primer to dry per manufacturer directions.\n" +
      "6. Apply two coats of matching exterior paint. If you don't have the original color, take a chip to the paint store for matching.\n" +
      "7. Use a brush for trim and detail work, and a mini roller for larger areas.\n" +
      "8. Feather the edges of the new paint into the old paint for a seamless blend.\n" +
      "9. Touch up caulk lines where paint meets sealant if the caulk is also failing.\n" +
      "10. Store remaining paint (sealed tightly) for future touch-ups.",
    whyItMatters: "Touch-up painting is the most cost-effective maintenance you can do for your home's exterior. A $30 touch-up on a damaged area prevents the failure from spreading and protects the substrate from further damage. It also maintains curb appeal and property value.",
    whatHappensIfSkipped: "Paint failure spreads from the damaged area as moisture gets under adjacent good paint. The substrate decays, adding repair costs on top of repainting. What was a 30-minute touch-up becomes part of a $3,000-12,000 full repaint project.",
    toolsNeeded: ["Paint scraper", "Sandpaper (120-150 grit)", "Paintbrush", "Mini roller"],
    suppliesNeeded: ["Exterior primer", "Matching exterior paint", "Painter's tape"],
    careKitProductIds: ["touch_up_paint"],
    estimatedSavings: "A $30 touch-up prevents $500-2,000 in expanded paint failure and substrate damage.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // PRESSURE WASHING (1 task)
  // ================================================================

  {
    taskId: "exterior.pressure_wash",
    taskName: "Pressure Wash Exterior",
    category: "exterior",
    applicableSystemIds: [
      "exterior.exterior_paint",
      "exterior.siding.vinyl",
      "exterior.siding.hardie_fiber_cement",
      "exterior.driveway_concrete",
      "exterior.patio_concrete",
    ],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 180, reason: "Mold, mildew, and algae require biannual pressure washing in Florida" },
    ],
    difficulty: "moderate",
    estimatedTimeMinutes: 180,
    diyCost: { low: 50, high: 100 },
    proCost: { low: 200, high: 500 },
    shortDescription: "Pressure wash all exterior surfaces — siding, driveway, walkways, patio, and concrete — to remove biological growth and staining.",
    detailedInstructions:
      "1. Connect the pressure washer to a water source and select the appropriate nozzle (25° for siding, 15° for concrete).\n" +
      "2. Pre-treat heavily soiled areas with a bleach solution or commercial house wash surfactant.\n" +
      "3. Protect landscaping by wetting plants and covering sensitive areas.\n" +
      "4. For siding: use 1,200-1,500 PSI. Start at the bottom and work up, then rinse from top down.\n" +
      "5. Never aim the nozzle upward under siding laps — this drives water behind the siding.\n" +
      "6. For concrete (driveway, patio, walkways): use 2,500-3,000 PSI with a surface cleaner attachment for even results.\n" +
      "7. Maintain consistent distance (12-18 inches) and speed for uniform cleaning.\n" +
      "8. Use a rotating surface cleaner for large flat areas — it's faster and more even than a wand.\n" +
      "9. Rinse all surfaces thoroughly after cleaning.\n" +
      "10. Allow 48+ hours of drying before sealing or painting any washed surfaces.",
    whyItMatters: "Annual pressure washing removes the accumulation of mold, mildew, algae, dirt, and pollutants that degrade every exterior surface on your home. It's the most impactful single maintenance task for curb appeal and surface preservation.",
    whatHappensIfSkipped: "Biological growth establishes permanently, staining surfaces and holding moisture against them. Concrete becomes dangerously slippery. Siding degrades under layers of growth. The home looks neglected, reducing property value by 5-10%. Surfaces that should last 20+ years fail in half that time.",
    toolsNeeded: ["Pressure washer (gas or electric)", "Various nozzle tips", "Surface cleaner attachment", "Extension wand"],
    suppliesNeeded: ["House wash surfactant or bleach", "Protective plastic sheeting for plants"],
    careKitProductIds: [],
    estimatedSavings: "DIY at $50-100 saves $200-500 vs. pro service. Preserves all exterior surfaces and maintains property value.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // SCREEN ENCLOSURE (5 tasks)
  // ================================================================

  {
    taskId: "exterior.screen_inspect",
    taskName: "Inspect Screen Enclosure",
    category: "exterior",
    applicableSystemIds: ["exterior.screen_enclosure"],
    frequencyType: "seasonal",
    frequencyValue: 180,
    frequencyUnit: "days",
    seasonalMonths: [4, 10],
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 90, reason: "Hurricane season and UV degradation demand quarterly inspection in Florida" },
      { climateZone: "gulf_coast", adjustedFrequencyDays: 90, reason: "Storm debris, salt air, and UV require frequent monitoring" },
    ],
    difficulty: "easy",
    estimatedTimeMinutes: 20,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 50, high: 100 },
    shortDescription: "Inspect the entire screen enclosure for tears, sagging, frame damage, and fastener condition.",
    detailedInstructions:
      "1. Walk inside the enclosure and visually scan all screen panels from floor to roof.\n" +
      "2. Look for tears, holes, and sagging screen material.\n" +
      "3. Check the screen spline (the rubber cord holding the screen in the frame channel) for deterioration.\n" +
      "4. Push gently on screen panels — they should be taut, not saggy or loose.\n" +
      "5. Examine all aluminum frame members for corrosion, cracks, or bending.\n" +
      "6. Check frame-to-frame connections and screws for tightness.\n" +
      "7. Inspect the roof screen panels — these take the most UV damage and fail first.\n" +
      "8. Look for signs of animal damage — squirrels and birds tear through screens.\n" +
      "9. Check the screen door for proper closing, latching, and closer adjustment.\n" +
      "10. Note all issues for repair — small tears should be patched before they become large holes.",
    whyItMatters: "A screen enclosure protects your outdoor living space from insects (including mosquitoes carrying diseases) and keeps debris out of your pool. In Florida, nearly every home has a screen enclosure, and maintaining it is essential for comfortable outdoor living.",
    whatHappensIfSkipped: "Small tears grow into large holes during the next storm. Insects invade the enclosed space — mosquitoes make it unusable during evenings. Loose screen panels catch wind and tear off entirely. Pool screens that fail allow debris and animals into the pool.",
    toolsNeeded: ["Flashlight"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Catching a small tear ($20 patch) prevents a full panel rescreening ($200-500 per panel).",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  {
    taskId: "exterior.screen_clean",
    taskName: "Clean Screen Enclosure",
    category: "exterior",
    applicableSystemIds: ["exterior.screen_enclosure"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 180, reason: "Pollen, mold, and algae clog screens rapidly in humid climates" },
    ],
    difficulty: "moderate",
    estimatedTimeMinutes: 90,
    diyCost: { low: 10, high: 25 },
    proCost: { low: 150, high: 400 },
    shortDescription: "Clean all screen panels and aluminum framing to remove dirt, pollen, mold, and algae.",
    detailedInstructions:
      "1. Remove loose debris by brushing screens gently with a soft-bristle broom.\n" +
      "2. Mix a cleaning solution: mild dish soap and water, or a specialized screen cleaner.\n" +
      "3. Apply solution to screen panels with a garden hose sprayer or pump sprayer.\n" +
      "4. Gently scrub screens with a soft brush or microfiber cloth — never use a stiff brush that stretches the screen.\n" +
      "5. Clean the aluminum frame members with the same solution and a soft brush.\n" +
      "6. For mold and algae on the frame, use a mixture of 1 part bleach to 10 parts water.\n" +
      "7. Rinse all panels and frames thoroughly with a garden hose.\n" +
      "8. Do NOT use a pressure washer on screens — even low pressure tears through screen material.\n" +
      "9. Clean the screen door track to ensure smooth operation.\n" +
      "10. Allow to air dry. Clean screens let in more light and airflow, making the space more pleasant.",
    whyItMatters: "Dirty screens block airflow and light, making the enclosed space dark and stuffy. Mold and algae on frames accelerate corrosion of the aluminum. Clean screens also make tears and damage more visible for timely repair.",
    whatHappensIfSkipped: "Screen mesh clogs with pollen, dirt, and biological growth, blocking up to 50% of airflow. Algae grows on aluminum frames and causes pitting corrosion. The enclosure becomes dark, musty, and unappealing. Clogged roof screens hold water weight during rain, stressing the structure.",
    toolsNeeded: ["Soft-bristle broom", "Garden hose", "Soft brush or microfiber cloth", "Pump sprayer"],
    suppliesNeeded: ["Mild dish soap", "Bleach (for mold on frames)"],
    careKitProductIds: [],
    estimatedSavings: "DIY cleaning saves $150-400 vs. pro service. Clean screens last longer and prevent frame corrosion.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  {
    taskId: "exterior.screen_patch_repair",
    taskName: "Patch Screen Tears",
    category: "exterior",
    applicableSystemIds: ["exterior.screen_enclosure"],
    frequencyType: "condition_based",
    frequencyValue: 0,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 20,
    diyCost: { low: 5, high: 15 },
    proCost: { low: 50, high: 150 },
    shortDescription: "Patch small tears and holes in screen panels before they expand into full panel failures.",
    detailedInstructions:
      "1. Clean the area around the tear to ensure the patch adhesive sticks.\n" +
      "2. For small holes (under 2 inches): apply a screen repair patch (self-adhesive) centered over the hole.\n" +
      "3. Press firmly around all edges of the patch for secure adhesion.\n" +
      "4. For tears (up to 6 inches): use a larger patch. Cut a piece of screen material 2 inches larger than the tear on all sides.\n" +
      "5. Fold the edges of the patch under ½ inch and place it over the tear.\n" +
      "6. Attach the patch with screen patch adhesive or by weaving the folded edges into the existing screen.\n" +
      "7. For tears at a frame channel, re-press the screen into the channel and install new spline.\n" +
      "8. For large tears (over 12 inches) or multiple tears in one panel, full rescreening is more practical.\n" +
      "9. Matching screen material ensures the patch blends in — standard fiberglass screen from any hardware store works.\n" +
      "10. Patches are a temporary fix for large tears — schedule full panel rescreening when practical.",
    whyItMatters: "A small tear in a screen panel is a doorway for mosquitoes, no-see-ums, and other insects. In Florida, where mosquito-borne illness is a real concern, a torn screen defeats the entire purpose of the enclosure. Patching a small tear takes 5 minutes and costs $5.",
    whatHappensIfSkipped: "Small tears expand with every wind gust. Insects enter through the opening. Animals (birds, squirrels, lizards) find the hole and make it bigger. Eventually the entire panel tears out and requires professional rescreening at $200-500 per panel.",
    toolsNeeded: ["Scissors", "Spline roller (for frame channel repairs)"],
    suppliesNeeded: ["Screen repair patches or screen material", "Screen spline (for channel repairs)", "Adhesive"],
    careKitProductIds: [],
    estimatedSavings: "A $5 patch prevents a $200-500 panel rescreening and keeps insects out.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  {
    taskId: "exterior.screen_frame_inspect",
    taskName: "Inspect Screen Enclosure Frame and Fasteners",
    category: "exterior",
    applicableSystemIds: ["exterior.screen_enclosure"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 180, reason: "Salt air and humidity corrode aluminum frames and fasteners; inspect biannually near coast" },
      { climateZone: "gulf_coast", adjustedFrequencyDays: 180, reason: "Corrosion and storm stress demand more frequent structural inspection" },
    ],
    difficulty: "easy",
    estimatedTimeMinutes: 20,
    diyCost: { low: 0, high: 10 },
    proCost: { low: 75, high: 150 },
    shortDescription: "Inspect all aluminum frame members, connections, fasteners, and structural attachments for corrosion and looseness.",
    detailedInstructions:
      "1. Walk the perimeter and examine every vertical post and horizontal beam.\n" +
      "2. Look for corrosion — white powdery deposits on aluminum indicate oxidation.\n" +
      "3. Check all screw connections at frame joints — tighten any that have loosened.\n" +
      "4. Inspect the frame-to-house connection points (where the enclosure attaches to the house).\n" +
      "5. Check the frame-to-deck or frame-to-patio base connections for looseness or rust.\n" +
      "6. Look for bent or bowed frame members — these indicate wind damage or structural stress.\n" +
      "7. Verify that all gusset plates and corner brackets are intact and secured.\n" +
      "8. Check the roof support beams for sagging between posts.\n" +
      "9. Inspect the screen door frame for square alignment — a door that won't close properly indicates frame movement.\n" +
      "10. Replace any severely corroded fasteners with stainless steel screws (standard screws corrode in salt air).",
    whyItMatters: "The aluminum frame is the skeleton of the screen enclosure. Corroded or loose connections weaken the structure, making it vulnerable to wind damage. In hurricane zones, a compromised frame can collapse entirely during a storm, creating a debris hazard.",
    whatHappensIfSkipped: "Corrosion weakens connections progressively. Loose fasteners allow the frame to flex and shift, accelerating wear. During a hurricane, a weakened frame fails catastrophically — the screen enclosure peels away from the house. Replacement costs $3,000-20,000.",
    toolsNeeded: ["Screwdriver or drill/driver", "Flashlight"],
    suppliesNeeded: ["Stainless steel replacement screws"],
    careKitProductIds: [],
    estimatedSavings: "A $10 screw replacement prevents frame failure and $3,000-20,000 in enclosure replacement.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },

  {
    taskId: "exterior.screen_post_storm_check",
    taskName: "Post-Storm Screen Enclosure Check",
    category: "exterior",
    applicableSystemIds: ["exterior.screen_enclosure"],
    frequencyType: "condition_based",
    frequencyValue: 0,
    frequencyUnit: "days",
    seasonalMonths: [6, 7, 8, 9, 10, 11],
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 0, reason: "Inspect after every tropical storm, hurricane, or severe thunderstorm with 50+ mph winds" },
      { climateZone: "gulf_coast", adjustedFrequencyDays: 0, reason: "Screen enclosures are the most hurricane-vulnerable structure on Florida homes" },
    ],
    difficulty: "easy",
    estimatedTimeMinutes: 15,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 50, high: 100 },
    shortDescription: "Inspect the screen enclosure after severe storms for torn panels, frame damage, and connection failures.",
    detailedInstructions:
      "1. Wait until storm conditions have fully passed and it's safe to go outside.\n" +
      "2. Walk the exterior perimeter of the enclosure first, looking for obvious damage from outside.\n" +
      "3. Check for displaced or torn screen panels — strong winds push panels out of the frame channels.\n" +
      "4. Look for bent or broken frame members, especially at roof connections.\n" +
      "5. Check all posts for plumb (vertical) alignment — leaning posts indicate structural stress.\n" +
      "6. Inspect the roof panels — storm debris (branches, projectiles) often punctures the roof screen.\n" +
      "7. Check the frame-to-house attachment points for separation.\n" +
      "8. Remove any debris resting on or against the enclosure — branches add wind load to the structure.\n" +
      "9. Photograph all damage for insurance documentation.\n" +
      "10. Temporary repairs (tarps over torn panels) prevent insects while waiting for professional repair.",
    whyItMatters: "Screen enclosures are the most wind-vulnerable structure on a Florida home. Even tropical-storm-force winds can tear screen panels and bend frames. Prompt post-storm inspection identifies damage for insurance claims and prevents the secondary damage of insects and debris entering the enclosure.",
    whatHappensIfSkipped: "Undetected damage allows insects, animals, and debris into the enclosed space and pool area. Insurance claim windows close — missing the filing deadline means paying out of pocket. Small frame damage compounds into structural failure during the next storm.",
    toolsNeeded: ["Camera or smartphone", "Flashlight"],
    suppliesNeeded: ["Temporary tarp or plastic sheeting (for emergency covering)"],
    careKitProductIds: [],
    estimatedSavings: "Timely insurance filing recovers $1,000-20,000 in storm damage repairs.",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
];

// ============================================================
// Combined Export
// ============================================================

export const ELECTRICAL_ROOF_EXTERIOR_TASKS: TaskCatalogEntry[] = [
  ...ELECTRICAL_TASKS,
  ...ROOF_TASKS,
  ...EXTERIOR_TASKS,
];
