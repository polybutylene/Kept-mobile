import { internalMutation } from "../_generated/server";

// ─────────────────────────────────────────────────────────────────────────────
// HVAC Maintenance Tasks — 38 tasks across 7 system types
// Source: Industry standards (ACCA, NATE, ENERGY STAR), manufacturer guidelines,
//         and field experience from thousands of residential service calls.
// Cost basis: 2025 US National Average
// ─────────────────────────────────────────────────────────────────────────────

const hvacMaintenanceTasks = [
  // ================================================================
  // CENTRAL AIR CONDITIONER  (componentTemplateKey: "central_ac_split")
  // ================================================================
  {
    key: "hvac_cac_001",
    componentTemplateKey: "central_ac_split",
    systemCategory: "hvac",
    name: "Replace Air Filter",
    description:
      "Replace or clean the return air filter to maintain proper airflow, indoor air quality, and system efficiency. A clogged filter is the #1 cause of preventable HVAC failures.",
    whyItMatters:
      "A dirty filter starves your system of air, forcing it to work harder, run longer, and break sooner. It's the cheapest, easiest thing you can do — and skipping it is the most expensive mistake.",
    instructions: [
      "Turn off the HVAC system at the thermostat",
      "Locate the return air filter — typically at the return air grille on a wall/ceiling, or inside the air handler/furnace cabinet",
      "Note the filter size printed on the frame (e.g., 16x25x1, 20x20x4)",
      "Slide out the old filter, noting the airflow direction arrow",
      "Inspect the old filter — if gray/dark and you cannot see light through it, it's overdue",
      "Insert new filter with airflow arrow pointing toward the blower/ductwork (away from return air)",
      "Close the filter access panel or grille securely",
      "Turn the system back on and verify airflow at supply registers",
    ],
    frequency: {
      intervalMonths: 1,
      seasonalAdjustments: {
        note: "Every 30 days for 1-inch filters; every 90 days for 4-inch media filters. More often with pets, allergies, or construction nearby.",
      },
      triggerConditions: [
        "Visible dirt buildup on filter",
        "Reduced airflow from vents",
        "Pets in the home",
        "Nearby construction or renovation",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 5,
    toolsRequired: ["none"],
    materialsCost: { low: 3, high: 15 },
    professionalCost: { low: 75, high: 150 },
    skipConsequences: {
      shortTerm:
        "Frozen evaporator coil from restricted airflow; higher energy bills (up to 15% increase)",
      longTerm:
        "Compressor overheating and premature failure; poor indoor air quality and dust accumulation",
      costOfNeglect:
        "A $3-$15 filter change prevents $1,500-$3,000+ compressor replacements",
    },
    safetyNotes: [
      "Write the installation date on the filter frame with a marker",
      "Set a phone reminder for monthly changes",
      "Buy filters in bulk to always have one ready",
    ],
    seasonalRelevance: ["spring", "summer", "fall", "winter"],
    priority: "critical" as const,
    tags: ["filter", "airflow", "diy", "monthly", "efficiency", "central-ac"],
  },
  {
    key: "hvac_cac_002",
    componentTemplateKey: "central_ac_split",
    systemCategory: "hvac",
    name: "Clean Outdoor Condenser Coils",
    description:
      "Remove dirt, debris, grass clippings, and cottonwood from the outdoor condenser coils to maintain heat transfer efficiency.",
    whyItMatters:
      "Dirty condenser coils make your compressor work up to 30% harder, driving up energy bills and dramatically shortening its life. A $5 hose-down prevents a $3,000 compressor replacement.",
    instructions: [
      "Turn off power to the outdoor unit at the disconnect box (usually mounted on the wall nearby) and at the thermostat",
      "Remove any large debris (leaves, sticks, trash) from around and on top of the unit",
      "Clear vegetation — maintain 2 feet of clearance on all sides",
      "Remove the top fan grille if accessible (usually 4-6 screws) and set aside carefully without straining wires",
      "Using a garden hose (NOT a pressure washer), spray the coils from inside out to push debris outward",
      "Apply foaming coil cleaner per manufacturer directions if coils are heavily soiled",
      "Let cleaner sit for 5-10 minutes, then rinse thoroughly from inside out",
      "Use a soft brush to gently straighten any badly bent fins (or use a fin comb)",
      "Reassemble the top grille, restore power, and test the system",
    ],
    frequency: {
      intervalMonths: 12,
      seasonalAdjustments: {
        note: "Twice per year in areas with heavy pollen, cottonwood, or dusty conditions.",
      },
      triggerConditions: [
        "Visible debris on coils",
        "Unit runs longer than usual",
        "Higher energy bills",
      ],
    },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 45,
    toolsRequired: [
      "garden hose with spray nozzle",
      "coil cleaner (no-rinse or foaming)",
      "soft bristle brush",
      "work gloves",
      "safety glasses",
    ],
    materialsCost: { low: 5, high: 20 },
    professionalCost: { low: 100, high: 250 },
    skipConsequences: {
      shortTerm:
        "Unit runs longer and struggles to reach set temperature; system short-cycling",
      longTerm:
        "Compressor overheating leads to costly compressor replacement ($1,500-$3,000+); refrigerant pressures rise, increasing risk of leaks",
      costOfNeglect:
        "Higher energy bills (up to 30% increase from dirty coils)",
    },
    safetyNotes: [
      "Never use a pressure washer — it bends the delicate aluminum fins and can cause refrigerant leaks",
      "A regular garden hose at moderate pressure is all you need",
      "Wear safety glasses when spraying upward",
    ],
    seasonalRelevance: ["spring"],
    priority: "high" as const,
    tags: ["condenser", "coils", "cleaning", "diy", "annual", "central-ac"],
  },
  {
    key: "hvac_cac_003",
    componentTemplateKey: "central_ac_split",
    systemCategory: "hvac",
    name: "Clear Condensate Drain Line",
    description:
      "Flush the condensate drain line to prevent clogs from algae and biofilm buildup, which can cause water damage and system shutdowns.",
    whyItMatters:
      "In humid climates, this is the #1 summer service call. A $2 bottle of vinegar every 3 months prevents a $150+ service call — and potential water damage to your ceilings and walls.",
    instructions: [
      "Turn off the HVAC system",
      "Locate the condensate drain line — a PVC pipe (usually 3/4 inch) exiting near the indoor air handler",
      "Find the access point (T-fitting or cleanout cap) on the drain line near the air handler",
      "Pour 1 cup of distilled white vinegar into the access point using a funnel",
      "Let it sit for 30 minutes to break down algae and biofilm",
      "Flush with warm water to clear the line",
      "Check the outdoor drain termination point to verify water flows freely",
      "Optionally, use a wet/dry vacuum on the outdoor end to suction out any stubborn clogs",
      "Place a condensate drain pan tablet in the drip pan for ongoing algae prevention",
      "Restore system operation and verify the drip pan is draining properly",
    ],
    frequency: {
      intervalMonths: 3,
      seasonalAdjustments: {
        note: "Monthly in high-humidity climates (Gulf Coast, Southeast).",
      },
      triggerConditions: [
        "Water near indoor air handler",
        "System shuts down unexpectedly",
        "Musty odor from vents",
      ],
    },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 15,
    toolsRequired: [
      "distilled white vinegar or drain line cleaner",
      "wet/dry vacuum (optional)",
      "funnel",
    ],
    materialsCost: { low: 2, high: 10 },
    professionalCost: { low: 75, high: 175 },
    skipConsequences: {
      shortTerm:
        "System shuts down via float switch safety (no cooling until cleared); musty odor from standing water",
      longTerm:
        "Water damage to ceilings, walls, and floors from overflowing drain pan; mold growth in and around the air handler; potential structural damage",
      costOfNeglect:
        "A $2 bottle of vinegar quarterly prevents $150+ emergency service calls and thousands in water damage",
    },
    safetyNotes: [
      "In Gulf Coast areas, this is the single most common summer service call",
      "The humidity creates perfect conditions for algae growth",
    ],
    seasonalRelevance: ["summer"],
    priority: "high" as const,
    tags: [
      "condensate",
      "drain",
      "algae",
      "diy",
      "quarterly",
      "water-damage",
      "central-ac",
    ],
  },
  {
    key: "hvac_cac_004",
    componentTemplateKey: "central_ac_split",
    systemCategory: "hvac",
    name: "Professional Annual Tune-Up (Cooling)",
    description:
      "Comprehensive professional inspection and tune-up of the entire cooling system including refrigerant charge check, electrical testing, and safety inspection.",
    whyItMatters:
      "Small problems caught during a $100-$200 tune-up become $1,000+ emergency repairs if missed. This is also the only way to detect refrigerant leaks and heat exchanger cracks early.",
    instructions: [
      "Technician inspects and cleans the outdoor condenser coil",
      "Checks refrigerant charge with manifold gauges — verifies subcooling and superheat",
      "Tests compressor amp draw against manufacturer specifications",
      "Inspects and tests the capacitor (start and run) with a multimeter",
      "Inspects contactor for pitting or burning",
      "Checks all electrical connections and tightens as needed",
      "Measures supply and return air temperature differential (should be 15-20°F)",
      "Inspects the evaporator coil for cleanliness (if accessible)",
      "Verifies condensate drain is clear and float switch is functional",
      "Tests thermostat calibration and operation",
      "Inspects ductwork for visible disconnections or damage",
      "Checks blower motor amp draw and operation",
      "Lubricates moving parts if applicable",
      "Provides written report of findings and recommendations",
    ],
    frequency: {
      intervalMonths: 12,
      seasonalAdjustments: {
        note: "Schedule in early spring (March-April) before peak cooling season for best availability and pricing.",
      },
    },
    difficulty: "professional" as const,
    diyFriendly: false,
    estimatedMinutes: 60,
    toolsRequired: ["professional HVAC tools and gauges"],
    materialsCost: { low: 0, high: 0 },
    professionalCost: { low: 75, high: 200 },
    skipConsequences: {
      shortTerm:
        "Small problems become expensive emergency repairs; system operates at reduced efficiency",
      longTerm:
        "Refrigerant leaks go undetected, damaging the compressor; failed capacitors or contactors cause no-cooling emergencies in peak heat",
      costOfNeglect:
        "Warranty may be voided without documented annual maintenance",
    },
    safetyNotes: [
      "Many HVAC companies offer maintenance plans ($150-$300/year) that include spring and fall tune-ups plus priority scheduling and repair discounts",
      "These often pay for themselves with the first needed repair",
    ],
    seasonalRelevance: ["spring"],
    priority: "high" as const,
    tags: [
      "professional",
      "tune-up",
      "annual",
      "refrigerant",
      "inspection",
      "central-ac",
    ],
  },
  {
    key: "hvac_cac_005",
    componentTemplateKey: "central_ac_split",
    systemCategory: "hvac",
    name: "Inspect and Clean Evaporator Coil",
    description:
      "Clean the indoor evaporator coil to maintain cooling efficiency and prevent mold growth. Located inside the air handler or furnace plenum.",
    whyItMatters:
      "The evaporator coil is the most neglected component in most homes. A dirty coil reduces capacity, causes freezing, and breeds mold that gets pushed into every room.",
    instructions: [
      "Turn off the system at the thermostat and disconnect power",
      "Access the evaporator coil by removing the access panel on the air handler or supply plenum",
      "Inspect the coil with a flashlight — look for dust buildup, mold, or ice damage",
      "Apply no-rinse foaming coil cleaner liberally across the coil surface",
      "The foam will lift dirt and drain into the condensate pan (no rinsing needed)",
      "While open, inspect the condensate drain pan for standing water, cracks, or mold",
      "Clean the drain pan with a mild bleach solution if needed",
      "Replace the access panel and ensure it seals properly",
      "Restore power and monitor operation",
    ],
    frequency: {
      intervalMonths: 12,
      seasonalAdjustments: {
        note: "May need more frequent attention in high-humidity climates.",
      },
    },
    difficulty: "advanced" as const,
    diyFriendly: false,
    estimatedMinutes: 45,
    toolsRequired: [
      "no-rinse evaporator coil cleaner",
      "screwdriver",
      "flashlight",
      "soft brush",
    ],
    materialsCost: { low: 10, high: 25 },
    professionalCost: { low: 100, high: 400 },
    skipConsequences: {
      shortTerm:
        "Reduced cooling capacity and longer run times; frozen coil from restricted airflow",
      longTerm:
        "Mold growth on coil spreading spores into living space; higher humidity levels indoors",
      costOfNeglect:
        "If you can see daylight through the coil, it's reasonably clean. If it looks like a solid wall of grime, it's overdue.",
    },
    safetyNotes: [
      "Disconnect power before accessing the coil",
      "The evaporator coil is the most neglected component in most homes",
    ],
    seasonalRelevance: ["spring"],
    priority: "medium" as const,
    tags: [
      "evaporator",
      "coil",
      "cleaning",
      "mold",
      "annual",
      "central-ac",
    ],
  },
  {
    key: "hvac_cac_006",
    componentTemplateKey: "central_ac_split",
    systemCategory: "hvac",
    name: "Check and Straighten Condenser Fins",
    description:
      "Inspect outdoor unit fins for bending or damage and straighten as needed to maintain proper airflow across the condenser coil.",
    whyItMatters:
      "Bent fins on more than 25% of the coil surface significantly impact performance. A $10 fin comb and 20 minutes can restore efficiency that saves you all summer on electric bills.",
    instructions: [
      "Turn off power to the outdoor unit",
      "Visually inspect all sides of the condenser coil for bent, crushed, or matted fins",
      "Determine the fins-per-inch (FPI) count to select the correct fin comb size",
      "Starting at the bottom, gently pull the fin comb upward through bent sections",
      "Work in small sections — do not force the comb through heavily damaged areas",
      "For minor bends, a butter knife can carefully pry individual fins apart",
      "Restore power and verify the fan operates smoothly",
    ],
    frequency: {
      intervalMonths: 12,
      triggerConditions: [
        "Visible bent fins",
        "Unit near foot traffic or lawn equipment",
      ],
    },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 20,
    toolsRequired: [
      "fin comb (universal or matched to fins-per-inch)",
      "flashlight",
      "work gloves",
    ],
    materialsCost: { low: 8, high: 15 },
    professionalCost: { low: 50, high: 100 },
    skipConsequences: {
      shortTerm:
        "Reduced airflow causes higher head pressure and compressor strain",
      longTerm:
        "System efficiency drops; accelerated compressor wear from elevated operating pressures",
      costOfNeglect:
        "Hot spots on the coil reduce overall heat rejection, wasting energy all season",
    },
    safetyNotes: [
      "Wear work gloves — condenser fins are sharp and can cut",
      "Turn off power before working near the unit",
    ],
    seasonalRelevance: ["spring"],
    priority: "medium" as const,
    tags: ["fins", "condenser", "diy", "annual", "central-ac"],
  },
  {
    key: "hvac_cac_007",
    componentTemplateKey: "central_ac_split",
    systemCategory: "hvac",
    name: "Inspect Refrigerant Lines and Insulation",
    description:
      "Check the insulated copper refrigerant lines (line set) running between the outdoor and indoor units for damage, missing insulation, or refrigerant leak indicators.",
    whyItMatters:
      "Uninsulated suction lines waste energy and drip condensation that damages walls and framing. Oil stains at connections are your early warning of a slow refrigerant leak before it kills the compressor.",
    instructions: [
      "Locate the refrigerant lines — two copper pipes running from the outdoor unit to the indoor unit",
      "The larger pipe (suction line) should be insulated; the smaller pipe (liquid line) may or may not be",
      "Inspect insulation for deterioration, cracking, gaps, or missing sections",
      "Look for oil stains on connections, which indicate potential refrigerant leaks",
      "Check that line set is properly supported and not rubbing against walls or other surfaces",
      "Replace any damaged insulation with foam pipe insulation of the correct diameter",
      "Ensure insulation fits snugly with no gaps, especially at the outdoor and indoor unit connections",
      "If you suspect a leak (oil stains, hissing, reduced cooling), call a licensed HVAC technician",
    ],
    frequency: { intervalMonths: 12 },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 15,
    toolsRequired: [
      "flashlight",
      "pipe insulation (if needed)",
      "UV leak detection light (optional)",
    ],
    materialsCost: { low: 5, high: 20 },
    professionalCost: { low: 75, high: 150 },
    skipConsequences: {
      shortTerm:
        "Energy loss from uninsulated suction line (sweating and condensation)",
      longTerm:
        "Undetected slow refrigerant leaks lead to compressor failure; water damage from condensation dripping onto walls",
      costOfNeglect:
        "Rodent or pest damage to exposed lines can go unnoticed until major damage occurs",
    },
    safetyNotes: [
      "The suction line (larger, insulated one) should feel cold during cooling operation — if warm, you likely have a refrigerant issue",
      "The liquid line (smaller) should feel warm but not hot",
    ],
    seasonalRelevance: ["spring"],
    priority: "medium" as const,
    tags: [
      "refrigerant",
      "insulation",
      "lines",
      "inspection",
      "diy",
      "central-ac",
    ],
  },
  {
    key: "hvac_cac_008",
    componentTemplateKey: "central_ac_split",
    systemCategory: "hvac",
    name: "Test Capacitor Health",
    description:
      "Test the run and start capacitors on the compressor and condenser fan motor. Capacitors are the most common failure point on outdoor AC units.",
    whyItMatters:
      "A weak capacitor doesn't fail all at once — it degrades gradually, making the compressor work harder each start. By the time it fails completely on the hottest day, you're paying emergency rates for a $15-$50 part.",
    instructions: [
      "SAFETY: Capacitors store lethal voltage even when power is off — discharge before handling",
      "Turn off power at the disconnect and breaker",
      "Remove the outdoor unit access panel to expose the capacitor",
      "Discharge the capacitor using an insulated screwdriver across the terminals",
      "Note the rated microfarad (μF) value printed on the capacitor",
      "Disconnect wires (photograph first for reference)",
      "Test with a multimeter set to capacitance — reading should be within ±5% of rated value",
      "Visually inspect for bulging top, oil leaks, or burn marks (signs of failure)",
      "Replace if out of spec or showing physical damage",
      "Reconnect wires per the wiring diagram and restore power",
    ],
    frequency: {
      intervalMonths: 12,
      seasonalAdjustments: {
        note: "Capacitors typically last 10-15 years but can fail prematurely in extreme heat.",
      },
    },
    difficulty: "advanced" as const,
    diyFriendly: false,
    estimatedMinutes: 15,
    toolsRequired: [
      "multimeter with capacitance testing",
      "insulated screwdriver for discharge",
      "safety glasses",
    ],
    materialsCost: { low: 0, high: 0 },
    professionalCost: { low: 75, high: 250 },
    skipConsequences: {
      shortTerm:
        "AC unit hums but won't start; fan runs but compressor doesn't engage",
      longTerm:
        "System starts then immediately trips the breaker; intermittent cooling — works sometimes, doesn't other times",
      costOfNeglect:
        "A $15-50 part with annual testing prevents a $200+ emergency call",
    },
    safetyNotes: [
      "DANGER: Capacitors store lethal voltage even when power is off",
      "Always discharge before handling",
      "Wear safety glasses and use insulated tools only",
    ],
    seasonalRelevance: ["spring"],
    priority: "high" as const,
    tags: [
      "capacitor",
      "electrical",
      "professional",
      "annual",
      "central-ac",
    ],
  },
  {
    key: "hvac_cac_009",
    componentTemplateKey: "central_ac_split",
    systemCategory: "hvac",
    name: "Level the Outdoor Unit Pad",
    description:
      "Verify the outdoor condenser unit is sitting level on its pad. Settling, erosion, or soil movement can cause the unit to tilt, stressing refrigerant lines and affecting oil return to the compressor.",
    whyItMatters:
      "A tilted condenser stresses refrigerant line solder joints and prevents proper oil return. In sandy soil areas, settling is extremely common after heavy rains.",
    instructions: [
      "Place a torpedo level on top of the outdoor unit, checking both side-to-side and front-to-back",
      "Minor tilt (less than 1/4 inch) is acceptable and normal",
      "If significantly off-level, turn off the system and disconnect power",
      "For minor corrections, place composite shims under the low side of the pad",
      "For significant settling, you may need to lift the unit, add gravel beneath the pad, and re-level",
      "Never use wooden shims — they rot and attract termites",
      "Verify refrigerant lines are not kinked or stressed from the tilt",
      "Restore power and recheck the level",
    ],
    frequency: {
      intervalMonths: 12,
      triggerConditions: [
        "After heavy rain",
        "Sandy soil areas",
        "Visible unit tilt",
      ],
    },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 30,
    toolsRequired: [
      "torpedo level",
      "composite shims or plastic leveling pads",
      "shovel (if soil adjustment needed)",
    ],
    materialsCost: { low: 0, high: 50 },
    professionalCost: { low: 100, high: 300 },
    skipConsequences: {
      shortTerm:
        "Vibration increases, causing noise and accelerated wear",
      longTerm:
        "Refrigerant line stress can cause leaks at solder joints; compressor oil doesn't return properly, reducing lubrication",
      costOfNeglect:
        "In extreme cases, the unit can fall off the pad entirely",
    },
    safetyNotes: [
      "Never use wooden shims — they rot and attract termites",
      "A quick level check takes 30 seconds with a torpedo level",
    ],
    seasonalRelevance: ["spring"],
    priority: "low" as const,
    tags: ["pad", "level", "diy", "annual", "central-ac"],
  },
  {
    key: "hvac_cac_010",
    componentTemplateKey: "central_ac_split",
    systemCategory: "hvac",
    name: "Inspect Electrical Disconnect and Wiring",
    description:
      "Inspect the outdoor electrical disconnect box, wiring connections, and contactor for signs of damage, corrosion, or pest intrusion.",
    whyItMatters:
      "Loose connections cause arcing which can start fires. Fire ants in disconnect boxes are a top-3 cause of AC failure in the Southeast — the electromagnetic field literally attracts them.",
    instructions: [
      "Turn off power at the main breaker panel",
      "Open the outdoor disconnect box and inspect for moisture, corrosion, ant infestation, or burnt wires",
      "Check that the disconnect pull-out or breaker is not damaged or discolored",
      "Remove the outdoor unit access panel and inspect the contactor",
      "Look for pitted or burnt contacts on the contactor face",
      "Check all wire connections for tightness — thermal cycling loosens connections over time",
      "Inspect wire insulation for cracking, rodent damage, or sun deterioration",
      "Look for ant nests or wasp nests inside the electrical compartment",
      "Clean any corrosion with electrical contact cleaner",
      "Reassemble, restore power, and test operation",
    ],
    frequency: {
      intervalMonths: 12,
      triggerConditions: [
        "After storms",
        "Tripped breakers",
        "Visible pest activity",
      ],
    },
    difficulty: "advanced" as const,
    diyFriendly: false,
    estimatedMinutes: 20,
    toolsRequired: [
      "insulated screwdriver",
      "multimeter",
      "electrical contact cleaner",
    ],
    materialsCost: { low: 0, high: 0 },
    professionalCost: { low: 75, high: 200 },
    skipConsequences: {
      shortTerm:
        "Fire ants in disconnect boxes cause short circuits and system failures",
      longTerm:
        "Loose connections cause arcing, which can start fires; pitted contactor can weld shut, keeping compressor running continuously",
      costOfNeglect:
        "Corroded contacts increase resistance, raising amp draw and energy costs",
    },
    safetyNotes: [
      "Always disconnect power at the main breaker before inspecting electrical components",
      "Sprinkle ant bait granules around the base of the outdoor unit as prevention",
    ],
    seasonalRelevance: ["spring"],
    priority: "medium" as const,
    tags: [
      "electrical",
      "disconnect",
      "professional",
      "annual",
      "fire-ants",
      "central-ac",
    ],
  },

  // ================================================================
  // GAS FURNACE  (componentTemplateKey: "gas_furnace_single")
  // ================================================================
  {
    key: "hvac_gf_001",
    componentTemplateKey: "gas_furnace_single",
    systemCategory: "hvac",
    name: "Professional Annual Furnace Tune-Up",
    description:
      "Comprehensive professional inspection of the furnace including combustion analysis, heat exchanger inspection, safety controls testing, and cleaning.",
    whyItMatters:
      "A cracked heat exchanger is a safety emergency — carbon monoxide is odorless and lethal. Annual combustion analysis is the only way to detect hairline cracks early. This is not a DIY task.",
    instructions: [
      "Technician performs visual inspection of the entire furnace and venting",
      "Inspects the heat exchanger for cracks using visual inspection and/or combustion analysis",
      "Performs combustion analysis — measures CO, CO2, O2, and stack temperature",
      "Tests gas pressure at the manifold and verifies it matches manufacturer specifications",
      "Cleans and inspects the burner assembly",
      "Cleans or replaces the flame sensor (most common furnace failure point)",
      "Tests the ignition system (hot surface igniter or spark ignition)",
      "Checks the draft inducer motor operation and amp draw",
      "Verifies all safety controls: high limit switch, pressure switch, rollout switch",
      "Inspects and cleans the blower motor and wheel",
      "Checks the flue pipe for proper pitch, secure connections, and corrosion",
      "Tests thermostat operation in heating mode",
      "Measures temperature rise across the heat exchanger (must be within range on data plate)",
      "Provides a written report with CO readings and any recommendations",
    ],
    frequency: {
      intervalMonths: 12,
      seasonalAdjustments: {
        note: "Schedule in early fall (September-October) before heating season.",
      },
    },
    difficulty: "professional" as const,
    diyFriendly: false,
    estimatedMinutes: 60,
    toolsRequired: [
      "professional combustion analyzer",
      "manometer",
      "multimeter",
      "CO detector",
    ],
    materialsCost: { low: 0, high: 0 },
    professionalCost: { low: 80, high: 200 },
    skipConsequences: {
      shortTerm:
        "Dirty flame sensor causes no-heat calls; gas leaks from corroded connections go undetected",
      longTerm:
        "CARBON MONOXIDE RISK — cracked heat exchangers can leak CO into living space; cracked heat exchanger discovered too late means full system replacement ($3,000-$8,000)",
      costOfNeglect:
        "Reduced efficiency — older furnaces can drop 10-20% efficiency without maintenance",
    },
    safetyNotes: [
      "Carbon monoxide is odorless and lethal — professional combustion analysis is essential",
      "Every home with a gas furnace must have CO detectors on every level",
    ],
    seasonalRelevance: ["fall"],
    priority: "critical" as const,
    tags: [
      "professional",
      "furnace",
      "tune-up",
      "safety",
      "co",
      "annual",
      "gas",
    ],
  },
  {
    key: "hvac_gf_002",
    componentTemplateKey: "gas_furnace_single",
    systemCategory: "hvac",
    name: "Clean or Replace Flame Sensor",
    description:
      "Clean the flame sensor rod to remove oxidation buildup. The flame sensor proves to the control board that the burner is lit — when dirty, the furnace lights briefly then shuts down.",
    whyItMatters:
      "This is the #1 most common furnace repair call. A $150+ service call for what is literally a 10-minute cleaning with a piece of sandpaper. If you learn one furnace skill, make it this one.",
    instructions: [
      "Turn off the furnace at the power switch and gas valve",
      "Locate the flame sensor — a thin metal rod mounted near the burners, held by one screw",
      "Remove the single mounting screw and gently pull the sensor out",
      "Lightly sand the metal rod with fine emery cloth or steel wool until it's shiny",
      "Wipe clean with a dry rag — do not touch the cleaned rod with bare fingers (oils from skin cause rapid re-oxidation)",
      "Reinstall the sensor and tighten the mounting screw",
      "Restore gas and power, then run the furnace through a full heating cycle",
      "Verify the furnace stays lit for at least 3-5 minutes without shutting down",
    ],
    frequency: {
      intervalMonths: 12,
      seasonalAdjustments: {
        note: "May need mid-season cleaning in older furnaces.",
      },
    },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 15,
    toolsRequired: [
      "1/4-inch hex driver or screwdriver",
      "fine-grit emery cloth or steel wool",
      "clean rag",
    ],
    materialsCost: { low: 0, high: 15 },
    professionalCost: { low: 75, high: 175 },
    skipConsequences: {
      shortTerm:
        "Furnace ignites then shuts off within 3-10 seconds; repeated ignition attempts followed by lockout",
      longTerm:
        "No heat on the coldest night of the year; furnace error code indicating flame not sensed",
      costOfNeglect:
        "A $150+ service call for a 10-minute cleaning with sandpaper",
    },
    safetyNotes: [
      "Turn off both the power switch AND gas valve before working on the furnace",
      "Do not touch the cleaned rod with bare fingers — oils cause rapid re-oxidation",
    ],
    seasonalRelevance: ["fall"],
    priority: "high" as const,
    tags: [
      "flame-sensor",
      "furnace",
      "diy",
      "annual",
      "common-repair",
      "gas",
    ],
  },
  {
    key: "hvac_gf_003",
    componentTemplateKey: "gas_furnace_single",
    systemCategory: "hvac",
    name: "Inspect and Clean Burner Assembly",
    description:
      "Inspect gas burners for proper flame pattern, carbon buildup, rust, and debris. Clean as needed to ensure efficient and safe combustion.",
    whyItMatters:
      "Spiders love to nest inside gas burner tubes during summer. A single spider web can block a burner port enough to cause delayed ignition — that scary boom when the furnace kicks on.",
    instructions: [
      "Turn off gas supply and electrical power to the furnace",
      "Remove the burner compartment door/access panel",
      "Carefully slide out the burner assembly (may be individual tubes or a ribbon burner)",
      "Vacuum any dust, rust, or debris from the burner ports and combustion chamber",
      "Inspect burner ports for blockage — use compressed air to clear if needed",
      "Look for rust, cracks, or warping on the burner tubes",
      "Inspect the combustion chamber for soot (indicates incomplete combustion)",
      "Check the hot surface igniter for cracks (hold up to light — if you see a crack, replace it)",
      "Reinstall burners, ensuring they seat properly in the mounting brackets",
      "Restore gas and power, observe the flame pattern — should be steady blue with slight yellow tips",
      "A mostly yellow or flickering flame indicates a problem requiring professional attention",
    ],
    frequency: { intervalMonths: 12 },
    difficulty: "advanced" as const,
    diyFriendly: false,
    estimatedMinutes: 30,
    toolsRequired: [
      "screwdriver set",
      "vacuum with brush attachment",
      "flashlight",
      "compressed air",
    ],
    materialsCost: { low: 0, high: 0 },
    professionalCost: { low: 100, high: 250 },
    skipConsequences: {
      shortTerm:
        "Yellow or flickering flames indicate incomplete combustion and CO production; delayed ignition (mini-explosion when furnace lights)",
      longTerm:
        "Soot buildup in the heat exchanger reduces efficiency and indicates dangerous conditions",
      costOfNeglect:
        "Spider webs or insect nests blocking burner ports are extremely common after summer",
    },
    safetyNotes: [
      "A mostly yellow or flickering flame indicates incomplete combustion — call a professional",
      "Always turn off gas supply before inspecting burners",
    ],
    seasonalRelevance: ["fall"],
    priority: "high" as const,
    tags: ["burner", "furnace", "professional", "annual", "safety", "gas"],
  },
  {
    key: "hvac_gf_004",
    componentTemplateKey: "gas_furnace_single",
    systemCategory: "hvac",
    name: "Inspect Flue Pipe and Venting",
    description:
      "Inspect the exhaust flue pipe for proper connections, pitch, corrosion, and blockages. Ensures combustion gases vent safely outside.",
    whyItMatters:
      "A disconnected flue joint in an attic or crawl space can go unnoticed until it's too late. Proper flue inspection is the first line of defense against carbon monoxide — CO detectors are the last.",
    instructions: [
      "Visually trace the entire flue pipe from the furnace to where it exits the home",
      "Check every joint and connection — they should be secure with at least 3 screws per joint",
      "Verify proper upward pitch (1/4 inch per foot minimum) toward the chimney or exterior vent",
      "Look for rust, corrosion, or holes in the flue pipe",
      "Check that the flue pipe is not touching combustible materials (maintain proper clearances)",
      "For high-efficiency furnaces (90%+), inspect the PVC vent pipe for cracks or separation",
      "Check the exterior vent termination for bird nests, wasp nests, ice, or debris",
      "Verify the combustion air intake (if applicable) is clear and unobstructed",
      "Check for any visible soot stains around flue connections (indicates leaks)",
      "Ensure the draft inducer motor pulls adequate draft (listen for it running before burners ignite)",
    ],
    frequency: {
      intervalMonths: 12,
      triggerConditions: [
        "After severe weather",
        "Smell of exhaust indoors",
        "Visible soot around connections",
      ],
    },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 20,
    toolsRequired: [
      "flashlight",
      "screwdriver",
      "foil tape (if needed)",
    ],
    materialsCost: { low: 0, high: 30 },
    professionalCost: { low: 75, high: 200 },
    skipConsequences: {
      shortTerm:
        "Blocked vents cause pressure switch failures and furnace lockouts",
      longTerm:
        "CARBON MONOXIDE POISONING RISK — disconnected or leaking flue pipes vent CO into living space; bird or rodent nests in exterior vents are fire hazards",
      costOfNeglect:
        "Corroded flue pipes can separate at joints, especially in humid climates",
    },
    safetyNotes: [
      "Every home with a gas furnace should have CO detectors on every level",
      "CO detectors are a last line of defense — proper flue inspection is the first line",
    ],
    seasonalRelevance: ["fall"],
    priority: "critical" as const,
    tags: [
      "flue",
      "venting",
      "safety",
      "co",
      "diy",
      "annual",
      "gas",
    ],
  },
  {
    key: "hvac_gf_005",
    componentTemplateKey: "gas_furnace_single",
    systemCategory: "hvac",
    name: "Test Carbon Monoxide Detectors",
    description:
      "Test and verify all CO detectors in the home are functional. Critical safety task for any home with gas appliances.",
    whyItMatters:
      "CO is odorless and colorless — symptoms mimic the flu. An expired detector may pass the test button but not actually detect CO at dangerous levels. Replace all CO detector batteries when you change clocks for daylight saving time.",
    instructions: [
      "Locate all CO detectors in the home — there should be one on every level and near sleeping areas",
      "Press and hold the test button on each unit until it beeps/alarms",
      "If no response, replace the batteries and test again",
      "Check the manufacture date on the back — replace units older than 5-7 years",
      "If you have combo smoke/CO detectors, verify the CO function specifically",
      "Ensure detectors are not blocked by furniture, curtains, or stored items",
      "For plug-in units, verify they are plugged in and the power indicator is on",
      "If any detector fails testing after new batteries, replace it immediately",
    ],
    frequency: { intervalMonths: 1 },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 10,
    toolsRequired: ["none"],
    materialsCost: { low: 0, high: 40 },
    professionalCost: { low: 0, high: 0 },
    skipConsequences: {
      shortTerm:
        "Non-functional CO detector provides zero protection against carbon monoxide",
      longTerm:
        "Low-level chronic CO exposure can cause long-term neurological damage; expired detectors lose sensitivity even if they appear to work",
      costOfNeglect:
        "CO is odorless and colorless — symptoms mimic flu (headache, nausea, dizziness)",
    },
    safetyNotes: [
      "Replace all CO detector batteries when you change clocks for daylight saving time",
      "Check the expiration date: a 7-year-old detector may pass the test button but not actually detect CO at dangerous levels",
    ],
    seasonalRelevance: ["spring", "summer", "fall", "winter"],
    priority: "critical" as const,
    tags: ["co-detector", "safety", "monthly", "diy", "gas"],
  },
  {
    key: "hvac_gf_006",
    componentTemplateKey: "gas_furnace_single",
    systemCategory: "hvac",
    name: "Clean Blower Motor and Wheel",
    description:
      "Clean the blower motor, fan wheel (squirrel cage), and housing to maintain proper airflow. Dust buildup on the blower wheel reduces air volume and increases energy consumption.",
    whyItMatters:
      "A heavily dusted blower wheel can reduce airflow by 20-30%. If you've noticed gradually declining airflow over the years and filter changes don't help, the blower wheel is likely the culprit.",
    instructions: [
      "Turn off the furnace at the power switch and thermostat",
      "Remove the lower access panel to expose the blower compartment",
      "Disconnect the blower motor wiring harness (photograph connections first)",
      "Remove the blower assembly (usually held by 2-4 screws or bolts on a slide-out rail)",
      "Use a vacuum with brush attachment to remove loose dust from the blower wheel blades",
      "Use a soft brush or old toothbrush to clean between the individual blower wheel blades",
      "Clean the interior of the blower housing",
      "Inspect the blower motor for signs of overheating (discoloration, burning smell)",
      "If the motor has oil ports, apply 2-3 drops of electric motor oil (not WD-40)",
      "Reinstall the blower assembly, reconnect wiring, and replace the access panel",
      "Restore power and run the system — listen for smooth, balanced operation",
    ],
    frequency: { intervalMonths: 12 },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 45,
    toolsRequired: [
      "screwdriver set",
      "vacuum with brush attachment",
      "soft brush or toothbrush",
      "flashlight",
    ],
    materialsCost: { low: 0, high: 10 },
    professionalCost: { low: 100, high: 250 },
    skipConsequences: {
      shortTerm:
        "Reduced airflow from supply registers; furnace overheating and cycling on the high-limit switch",
      longTerm:
        "Blower motor premature failure from heat buildup ($300-$800 replacement); noise from wobbling or scraping",
      costOfNeglect:
        "Increased energy bills from blower motor working harder",
    },
    safetyNotes: [
      "Photograph wiring connections before disconnecting",
      "Use electric motor oil on oil ports — never WD-40",
    ],
    seasonalRelevance: ["fall"],
    priority: "medium" as const,
    tags: ["blower", "motor", "cleaning", "diy", "annual", "furnace"],
  },
  {
    key: "hvac_gf_007",
    componentTemplateKey: "gas_furnace_single",
    systemCategory: "hvac",
    name: "Check and Clear Condensate Drain (High-Efficiency Furnace)",
    description:
      "High-efficiency (90%+ AFUE) condensing furnaces produce acidic condensate that must drain properly. Clear the drain line and trap to prevent water damage and system shutdowns.",
    whyItMatters:
      "High-efficiency furnace condensate is acidic (pH 2.9-4.0). A blocked drain causes water damage and can shut down the entire system via pressure switch error.",
    instructions: [
      "Locate the condensate drain trap on the furnace (usually a clear or white U-shaped PVC trap)",
      "Check that the trap has water in it (necessary to prevent exhaust gas backdrafting)",
      "Remove the trap if possible and clean it with warm water and a small brush",
      "Flush the drain line with warm water to verify flow",
      "Pour 1/2 cup of distilled white vinegar through the line to dissolve mineral and algae buildup",
      "Check the condensate pump if the furnace uses one — verify it activates and pumps water out",
      "Inspect the drain termination point to ensure it's not frozen (critical in cold climates)",
      "Verify no standing water around the base of the furnace",
    ],
    frequency: { intervalMonths: 3 },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 15,
    toolsRequired: [
      "distilled white vinegar",
      "small brush",
      "wet/dry vacuum (optional)",
    ],
    materialsCost: { low: 0, high: 10 },
    professionalCost: { low: 75, high: 150 },
    skipConsequences: {
      shortTerm:
        "Water pooling around the furnace base; furnace shuts down on pressure switch error",
      longTerm:
        "Frozen exterior drain line in winter causes backup; acidic condensate can damage concrete floors and corrode nearby metal",
      costOfNeglect:
        "Potential water damage to floors and structure from overflowing condensate",
    },
    safetyNotes: [
      "If drain runs to a septic system, some jurisdictions require a condensate neutralizer kit ($30-$50)",
      "Check the trap has water in it — an empty trap allows exhaust gas backdrafting",
    ],
    seasonalRelevance: ["winter"],
    priority: "high" as const,
    tags: [
      "condensate",
      "drain",
      "high-efficiency",
      "diy",
      "quarterly",
      "furnace",
    ],
  },

  // ================================================================
  // HEAT PUMP  (componentTemplateKey: "heat_pump_split")
  // ================================================================
  {
    key: "hvac_hp_001",
    componentTemplateKey: "heat_pump_split",
    systemCategory: "hvac",
    name: "All Central AC Maintenance Tasks Apply",
    description:
      "A heat pump IS a central air conditioner that can also heat. All central AC maintenance tasks (filter changes, condenser cleaning, condensate drain, annual tune-up, etc.) apply fully to heat pumps.",
    whyItMatters:
      "Heat pumps work harder than standard AC units because they run year-round (cooling AND heating). Components wear faster with 12-month operation vs. 6-month cooling-only use, making maintenance even more critical.",
    instructions: [
      "Complete all Central Air Conditioner maintenance tasks — they apply identically to heat pumps",
    ],
    frequency: {
      intervalMonths: 1,
      seasonalAdjustments: {
        note: "Refer to all tasks under Central Air Conditioner (hvac_cac_001 through hvac_cac_010).",
      },
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 0,
    toolsRequired: [],
    materialsCost: { low: 0, high: 0 },
    professionalCost: { low: 0, high: 0 },
    skipConsequences: {
      shortTerm: "See individual central AC tasks for specific consequences",
      longTerm:
        "Accelerated component wear from year-round operation without proper maintenance",
      costOfNeglect:
        "Heat pumps have higher maintenance stakes because they run 12 months instead of 6",
    },
    safetyNotes: [],
    seasonalRelevance: ["spring", "summer", "fall", "winter"],
    priority: "critical" as const,
    tags: ["heat-pump", "reference", "central-ac"],
  },
  {
    key: "hvac_hp_002",
    componentTemplateKey: "heat_pump_split",
    systemCategory: "hvac",
    name: "Test Defrost Cycle Operation",
    description:
      "Verify the heat pump's defrost cycle activates properly to melt ice buildup on the outdoor coil during cold weather heating operation.",
    whyItMatters:
      "If the defrost cycle fails, the outdoor unit becomes a solid block of ice — severely reducing or eliminating heating. Steam billowing from the unit in winter is normal (it's defrosting); a fully iced-over unit is not.",
    instructions: [
      "During cold weather operation (below 40°F), observe the outdoor unit periodically",
      "Light frost on the coil is normal during heating mode",
      "The defrost cycle should activate automatically every 30-90 minutes (varies by model)",
      "During defrost, you'll hear the unit switch to cooling mode briefly and the outdoor fan will stop",
      "Steam/vapor rising from the outdoor unit during defrost is normal — not a problem",
      "Defrost should complete in 2-10 minutes, then normal heating resumes",
      "If the entire outdoor coil becomes encased in thick ice (not just frost), defrost is not working",
      "Check that the outdoor temperature sensor is clean and properly mounted",
      "Verify the reversing valve makes an audible click when defrost initiates",
    ],
    frequency: { intervalMonths: 12 },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 15,
    toolsRequired: ["none — visual observation only"],
    materialsCost: { low: 0, high: 0 },
    professionalCost: { low: 75, high: 200 },
    skipConsequences: {
      shortTerm:
        "Outdoor unit becomes a solid block of ice; auxiliary heat runs excessively, increasing electric bills",
      longTerm:
        "Compressor damage from liquid refrigerant slugging; bent or crushed condenser fins from ice expansion",
      costOfNeglect:
        "Complete loss of heating if ice completely blocks the coil",
    },
    safetyNotes: [
      "Steam billowing from the outdoor unit in winter is NORMAL — it's the defrost cycle",
      "A fully iced-over unit with no defrost activity IS a problem requiring service",
    ],
    seasonalRelevance: ["fall"],
    priority: "high" as const,
    tags: ["defrost", "heat-pump", "diy", "annual", "winter"],
  },
  {
    key: "hvac_hp_003",
    componentTemplateKey: "heat_pump_split",
    systemCategory: "hvac",
    name: "Verify Emergency/Auxiliary Heat Operation",
    description:
      "Test that the backup electric heat strips (emergency heat) activate properly. These provide supplemental heating when outdoor temperatures drop below the heat pump's effective range.",
    whyItMatters:
      "Discovering your backup heat doesn't work on the coldest night is an emergency. One month of continuous emergency heat can triple your heating bill — if it's running constantly, the heat pump has an issue.",
    instructions: [
      "Switch the thermostat to 'Emergency Heat' mode (or 'EM HEAT')",
      "Set the temperature above current room temperature to call for heat",
      "Within 1-2 minutes, you should feel warm air from the supply registers",
      "The air should be noticeably hot — not just warm (heat strips produce very hot air)",
      "Verify on the outdoor unit that the compressor is NOT running (emergency heat bypasses the heat pump)",
      "Check the thermostat display — it should indicate auxiliary or emergency heat is active",
      "Let it run for 5-10 minutes to confirm sustained operation",
      "Switch back to normal 'Heat' mode after testing",
      "Note: Emergency heat should ONLY be used for testing or if the heat pump fails — it uses 2-3x more electricity",
    ],
    frequency: { intervalMonths: 12 },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 15,
    toolsRequired: ["none"],
    materialsCost: { low: 0, high: 0 },
    professionalCost: { low: 75, high: 175 },
    skipConsequences: {
      shortTerm:
        "If heat strips have failed, you'll have no backup heat during a heat pump malfunction",
      longTerm:
        "A failed sequencer can energize only some heat strips, providing insufficient backup heat",
      costOfNeglect:
        "On the coldest night, discovering your backup heat doesn't work is an expensive emergency",
    },
    safetyNotes: [
      "Emergency heat uses 2-3x more electricity than normal heat pump operation",
      "Only use for testing or if the heat pump fails",
    ],
    seasonalRelevance: ["fall"],
    priority: "high" as const,
    tags: [
      "emergency-heat",
      "heat-strips",
      "heat-pump",
      "diy",
      "annual",
    ],
  },
  {
    key: "hvac_hp_004",
    componentTemplateKey: "heat_pump_split",
    systemCategory: "hvac",
    name: "Check Reversing Valve Operation",
    description:
      "Verify the reversing valve switches properly between heating and cooling modes. This valve reverses refrigerant flow direction — it's what makes a heat pump different from a standard AC.",
    whyItMatters:
      "A reversing valve that's sluggish but eventually works is a warning sign. They rarely fail suddenly — they start sticking intermittently first. A replacement runs $800-$2,000+.",
    instructions: [
      "With the system running in cooling mode, note the operation",
      "Switch the thermostat from 'Cool' to 'Heat'",
      "Within 30-60 seconds, you should hear a distinct click or whoosh from the outdoor unit as the reversing valve shifts",
      "After the switch, verify the outdoor unit is now blowing warm air (in heating mode, it rejects cold air outside)",
      "Switch back to cooling mode and listen for the valve to shift again",
      "Both transitions should be smooth and complete — no prolonged hissing or failure to switch",
      "Test supply air temperature in both modes to confirm proper operation",
    ],
    frequency: { intervalMonths: 6 },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 10,
    toolsRequired: ["none for basic test"],
    materialsCost: { low: 0, high: 0 },
    professionalCost: { low: 100, high: 300 },
    skipConsequences: {
      shortTerm:
        "Partially stuck valve causes poor heating or cooling performance",
      longTerm:
        "Stuck reversing valve locks the system in either heating or cooling — can't do both; compressor damage from incorrect refrigerant flow",
      costOfNeglect:
        "A reversing valve replacement is $800-$2,000+ — one of the most expensive heat pump repairs",
    },
    safetyNotes: [
      "If you notice inconsistent switching, have it checked before it fails completely",
    ],
    seasonalRelevance: ["spring", "fall"],
    priority: "high" as const,
    tags: [
      "reversing-valve",
      "heat-pump",
      "diy",
      "semi-annual",
    ],
  },
  {
    key: "hvac_hp_005",
    componentTemplateKey: "heat_pump_split",
    systemCategory: "hvac",
    name: "Professional Heat Pump Tune-Up (Heating Season)",
    description:
      "Second annual professional tune-up focused on heating mode operation. Heat pumps need two tune-ups per year because they provide both heating and cooling.",
    whyItMatters:
      "Spring checks cooling performance; fall checks heating performance, defrost, and backup heat. Skipping the fall tune-up misses completely different issues than the spring check catches.",
    instructions: [
      "All cooling tune-up checks (condenser coil, capacitor, contacts, refrigerant charge)",
      "Verify heating mode refrigerant charge (subcooling/superheat values differ in heating mode)",
      "Test defrost cycle initiation and completion",
      "Test auxiliary/emergency heat strip operation and amp draw",
      "Inspect heat strip elements for damage or discoloration",
      "Test the sequencer (stages heat strips on in sequence to prevent electrical overload)",
      "Verify reversing valve operation and solenoid coil",
      "Check the accumulator for proper operation (prevents liquid slugging to compressor in heating)",
      "Test outdoor thermostat or balance point settings",
      "Verify proper airflow in heating mode (may differ from cooling)",
      "Test the system through a full defrost cycle while on-site",
    ],
    frequency: { intervalMonths: 12 },
    difficulty: "professional" as const,
    diyFriendly: false,
    estimatedMinutes: 60,
    toolsRequired: ["professional HVAC tools and gauges"],
    materialsCost: { low: 0, high: 0 },
    professionalCost: { low: 80, high: 200 },
    skipConsequences: {
      shortTerm:
        "Heating-specific issues missed by cooling-only tune-up; failed heat strips discovered during cold weather",
      longTerm:
        "Defrost issues not caught until unit ices over completely; refrigerant charge correct for cooling may be incorrect for heating",
      costOfNeglect:
        "Higher heating bills from reduced efficiency",
    },
    safetyNotes: [
      "Heat pumps need TWO tune-ups per year — spring for cooling, fall for heating",
      "The fall check catches completely different issues than the spring check",
    ],
    seasonalRelevance: ["fall"],
    priority: "high" as const,
    tags: [
      "professional",
      "heat-pump",
      "tune-up",
      "annual",
      "heating",
    ],
  },

  // ================================================================
  // DUCTWORK  (componentTemplateKey: "ductwork_metal")
  // ================================================================
  {
    key: "hvac_duct_001",
    componentTemplateKey: "ductwork_metal",
    systemCategory: "hvac",
    name: "Inspect Accessible Ductwork for Damage",
    description:
      "Visually inspect all accessible ductwork in attics, crawl spaces, basements, and utility closets for disconnections, tears, crushed sections, and failed insulation.",
    whyItMatters:
      "Up to 30% of conditioned air can be lost through duct leaks (per ENERGY STAR). Standard gray duct tape is the WORST thing to use on ducts — use foil-backed HVAC tape or mastic sealant instead.",
    instructions: [
      "Access the attic, crawl space, or basement where ductwork is routed",
      "Systematically trace each duct run from the air handler to the register",
      "Look for disconnected sections — a common source of massive energy loss",
      "Check flex duct for crushed, kinked, or sagging sections (restrict airflow)",
      "Inspect insulation wrap for tears, moisture damage, or missing sections",
      "Feel for air leaks at connections while the system is running",
      "Check that all flex duct connections are secured with both a zip tie AND mastic or foil tape",
      "Verify sheet metal joints are sealed with mastic or foil tape (NOT standard duct tape, which fails within 1-2 years)",
      "Look for pest damage — rodents chew through flex duct and insulation",
      "Check for condensation or water stains indicating insulation failures",
    ],
    frequency: {
      intervalMonths: 12,
      triggerConditions: [
        "After any attic or crawl space work",
        "Pest control treatment",
        "Uneven room temperatures",
      ],
    },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 30,
    toolsRequired: [
      "flashlight",
      "foil-backed HVAC tape (NOT duct tape)",
      "mastic sealant",
      "zip ties",
    ],
    materialsCost: { low: 0, high: 30 },
    professionalCost: { low: 100, high: 300 },
    skipConsequences: {
      shortTerm:
        "Rooms that are always too hot or too cold; excessive dust from unfiltered air pulled through leaks",
      longTerm:
        "Up to 30% of conditioned air lost through duct leaks; moisture problems from condensation on uninsulated ducts",
      costOfNeglect:
        "Higher energy bills with no apparent cause",
    },
    safetyNotes: [
      "Standard gray duct tape dries out and falls off within 1-3 years",
      "Use foil-backed HVAC tape or mastic sealant for permanent repairs",
    ],
    seasonalRelevance: ["spring"],
    priority: "high" as const,
    tags: ["ductwork", "inspection", "leaks", "diy", "annual"],
  },
  {
    key: "hvac_duct_002",
    componentTemplateKey: "ductwork_metal",
    systemCategory: "hvac",
    name: "Clean Supply and Return Registers",
    description:
      "Remove, clean, and reinstall all supply registers and return grilles. Dirty registers restrict airflow and circulate dust.",
    whyItMatters:
      "When you remove a register, use your phone flashlight to look down into the duct boot. You'd be surprised what falls in there — toys, pet food, construction debris, and more.",
    instructions: [
      "Turn off the HVAC system",
      "Remove each supply register (most lift out or have 2 screws)",
      "Vacuum inside the visible duct boot (the first 6-12 inches) with a brush attachment",
      "Soak registers in warm soapy water in a tub or sink",
      "Scrub with an old toothbrush to remove caked-on dust",
      "Rinse thoroughly and dry completely before reinstalling",
      "Remove and clean return air grilles the same way",
      "Check that no registers are blocked by furniture, rugs, or drapes",
      "Ensure all register dampers are in the open position (unless intentionally closed for zoning)",
    ],
    frequency: { intervalMonths: 3 },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 30,
    toolsRequired: [
      "screwdriver",
      "vacuum with brush attachment",
      "warm soapy water",
      "old toothbrush",
    ],
    materialsCost: { low: 0, high: 5 },
    professionalCost: { low: 50, high: 100 },
    skipConsequences: {
      shortTerm:
        "Visible dust buildup on registers blows into rooms when system runs; allergy symptoms",
      longTerm:
        "Dark staining on walls and ceilings around registers (dust deposition)",
      costOfNeglect:
        "Reduced airflow from partially blocked registers",
    },
    safetyNotes: [
      "Look inside the duct boot for debris when registers are removed",
    ],
    seasonalRelevance: ["spring", "summer", "fall", "winter"],
    priority: "medium" as const,
    tags: ["registers", "cleaning", "diy", "quarterly", "ductwork"],
  },
  {
    key: "hvac_duct_003",
    componentTemplateKey: "ductwork_metal",
    systemCategory: "hvac",
    name: "Professional Duct Cleaning",
    description:
      "Full professional cleaning of the entire duct system using specialized equipment. Removes accumulated dust, debris, mold, and allergens.",
    whyItMatters:
      "Legitimate duct cleaning costs $300-$800 for a typical home. Beware of $99 whole house duct cleaning offers — these are often bait-and-switch. Look for NADCA certification.",
    instructions: [
      "Hire a reputable NADCA-certified duct cleaning company",
      "The crew should set up a high-powered negative-pressure vacuum connected to the main trunk line",
      "Each supply and return duct is individually cleaned using rotary brushes or compressed air tools",
      "The main trunk lines are cleaned",
      "The air handler blower and evaporator coil should be cleaned as part of the service",
      "The return plenum and filter area are cleaned",
      "All register boots are cleaned",
      "After cleaning, verify all duct connections were not disturbed",
      "Replace the air filter after cleaning",
    ],
    frequency: {
      intervalMonths: 72,
      seasonalAdjustments: {
        note: "Every 5-7 years for most homes. Sooner if: visible mold in ducts, vermin infestation, renovation dust, or after fire/smoke damage. NOT needed annually despite aggressive marketing.",
      },
    },
    difficulty: "professional" as const,
    diyFriendly: false,
    estimatedMinutes: 180,
    toolsRequired: ["professional duct cleaning equipment"],
    materialsCost: { low: 0, high: 0 },
    professionalCost: { low: 300, high: 800 },
    skipConsequences: {
      shortTerm:
        "Excessive dust accumulation; persistent musty or stale odors from supply registers",
      longTerm:
        "Visible mold growth inside ducts; rodent droppings or insect debris in the duct system",
      costOfNeglect:
        "Post-renovation dust settled in the duct system causes ongoing air quality issues",
    },
    safetyNotes: [
      "Look for NADCA certification and check reviews",
      "Beware of $99 whole house duct cleaning offers — usually bait-and-switch",
    ],
    seasonalRelevance: ["spring", "summer", "fall", "winter"],
    priority: "low" as const,
    tags: [
      "duct-cleaning",
      "professional",
      "as-needed",
      "air-quality",
      "ductwork",
    ],
  },
  {
    key: "hvac_duct_004",
    componentTemplateKey: "ductwork_metal",
    systemCategory: "hvac",
    name: "Seal Duct Leaks",
    description:
      "Identify and seal air leaks at duct joints, connections, and penetrations using mastic sealant and/or foil-backed tape. Duct leakage is the single largest source of energy waste in most homes.",
    whyItMatters:
      "ENERGY STAR estimates 20-30% of conditioned air is lost through duct leaks in a typical home. Focus on supply plenums, return plenums, and the first 6 feet of trunk lines — these account for the majority of leakage.",
    instructions: [
      "Run the HVAC system on fan-only mode to pressurize the duct system",
      "In the attic/crawl space, feel for air leaks at every duct joint and connection",
      "A damp hand or incense stick makes air leaks easier to detect",
      "For joints and seams: apply a thick coat of mastic sealant with a brush, fully covering the joint",
      "For gaps larger than 1/4 inch: apply fiberglass mesh tape first, then cover with mastic",
      "For flex duct connections: ensure the inner liner is pulled over the collar and secured with a zip tie, then seal with mastic over the outer jacket",
      "Seal all penetrations where ducts pass through floors, walls, or ceilings",
      "Seal the air handler cabinet seams and filter access door gaps",
      "Allow mastic to dry completely (24 hours) before insulating over it",
      "After sealing, verify improved airflow at supply registers",
    ],
    frequency: {
      intervalMonths: 0,
      seasonalAdjustments: {
        note: "One-time fix for existing leaks. Recheck annually during duct inspection. Seal any new connections after modifications.",
      },
    },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 120,
    toolsRequired: [
      "mastic sealant (bucket)",
      "paintbrush or putty knife",
      "foil-backed HVAC tape",
      "disposable gloves",
      "flashlight",
    ],
    materialsCost: { low: 15, high: 50 },
    professionalCost: { low: 300, high: 1000 },
    skipConsequences: {
      shortTerm:
        "Rooms far from the air handler receive weak airflow; dusty home despite regular filter changes",
      longTerm:
        "20-30% of conditioned air lost through leaks; hot/cold attic or crawl space air pulled in through return side leaks",
      costOfNeglect:
        "System runs longer to reach set temperature, wasting energy year after year",
    },
    safetyNotes: [
      "Sealing just the plenums and first 6 feet of trunk lines can reduce leakage by 50%+",
      "Allow mastic to dry 24 hours before insulating over it",
    ],
    seasonalRelevance: ["spring", "summer", "fall", "winter"],
    priority: "high" as const,
    tags: ["duct-sealing", "mastic", "energy", "diy", "one-time", "ductwork"],
  },

  // ================================================================
  // MINI-SPLIT  (componentTemplateKey: "mini_split_single")
  // ================================================================
  {
    key: "hvac_ms_001",
    componentTemplateKey: "mini_split_single",
    systemCategory: "hvac",
    name: "Clean Indoor Unit Filters",
    description:
      "Remove, wash, and reinstall the reusable mesh filters on each indoor head unit. These filters capture dust before it reaches the evaporator coil.",
    whyItMatters:
      "Mini-split filters are one of the easiest maintenance tasks in your home — they literally slide out. A 2-minute rinse under the faucet prevents the expensive deep cleaning that becomes necessary when neglected.",
    instructions: [
      "Open the front panel of the indoor unit by lifting it upward (consult your model's manual for specific access)",
      "Slide out the mesh filter screens (usually 2 per unit)",
      "Vacuum loose dust with a brush attachment, or rinse under lukewarm running water",
      "If washing, let the filters air dry completely before reinstalling (never reinstall wet)",
      "Inspect the evaporator coil behind the filters — if visibly dirty, schedule a deep cleaning",
      "Slide the clean, dry filters back into their tracks",
      "Close the front panel until it clicks",
    ],
    frequency: {
      intervalMonths: 1,
      seasonalAdjustments: {
        note: "Every 2 weeks during heavy use seasons. Monthly minimum. Washable and reusable — no replacement cost.",
      },
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 10,
    toolsRequired: ["none"],
    materialsCost: { low: 0, high: 0 },
    professionalCost: { low: 0, high: 0 },
    skipConsequences: {
      shortTerm:
        "Visible dust or debris blowing from the unit; reduced cooling/heating output",
      longTerm:
        "Evaporator coil becomes caked with dust requiring professional deep cleaning ($150-$300); musty odor from mold on damp, dirty coil",
      costOfNeglect:
        "Water dripping from the unit from clogged coil condensation overflow",
    },
    safetyNotes: [
      "Never reinstall wet filters — let them air dry completely",
      "Set a bi-weekly reminder for filter cleaning during heavy use seasons",
    ],
    seasonalRelevance: ["spring", "summer", "fall", "winter"],
    priority: "critical" as const,
    tags: ["mini-split", "filter", "diy", "monthly", "reusable"],
  },
  {
    key: "hvac_ms_002",
    componentTemplateKey: "mini_split_single",
    systemCategory: "hvac",
    name: "Deep Clean Indoor Unit (Coil and Blower)",
    description:
      "Comprehensive cleaning of the indoor unit's evaporator coil, blower wheel (barrel fan), and drain pan. Mini-splits are prone to mold and biofilm buildup in humid climates.",
    whyItMatters:
      "In Gulf Coast climates, mini-split indoor units develop mold on the blower wheel within 6-12 months. The blower wheel stays damp and dark — perfect mold conditions. A $25 cleaning kit prevents a $200+ pro cleaning.",
    instructions: [
      "Turn off the unit at the remote and breaker",
      "Open the front panel and remove all filters",
      "Remove any additional covers or louver assemblies (varies by model)",
      "Install the cleaning bib/bag around the unit to catch rinse water and direct it to a bucket",
      "Apply no-rinse coil cleaner or alkaline coil cleaner to the evaporator coil",
      "Using a pump sprayer with warm water, rinse the coil thoroughly (the bag catches all runoff)",
      "Clean the blower wheel (barrel fan) by spraying cleaner between the blades — this is where mold hides",
      "Rotate the blower by hand to access all sections while spraying",
      "Clean the drain pan and verify the condensate drain is flowing",
      "Rinse everything thoroughly and let dry",
      "Apply anti-mold/anti-bacterial treatment spray to the coil and blower",
      "Reassemble all components and restore power",
      "Run the unit on fan mode for 30 minutes to dry internal components",
    ],
    frequency: {
      intervalMonths: 12,
      seasonalAdjustments: {
        note: "Every 6 months in high-humidity areas (Gulf Coast, Southeast, Hawaii).",
      },
    },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 60,
    toolsRequired: [
      "mini-split cleaning kit (pump sprayer and bib/bag)",
      "no-rinse coil cleaner",
      "soft brush",
      "towels",
      "spray bottle",
    ],
    materialsCost: { low: 15, high: 40 },
    professionalCost: { low: 150, high: 350 },
    skipConsequences: {
      shortTerm:
        "Strong musty or mildew smell when the unit runs; reduced airflow and capacity",
      longTerm:
        "Black mold visible on the blower wheel and coil — health hazard; dark particulate blown into the room",
      costOfNeglect:
        "Water leaking or dripping from the indoor unit due to clogged drain",
    },
    safetyNotes: [
      "The blower wheel is the biggest mold offender — it stays damp and dark",
      "Run on fan mode for 30 minutes after cleaning to dry internal components",
    ],
    seasonalRelevance: ["spring"],
    priority: "high" as const,
    tags: [
      "mini-split",
      "deep-cleaning",
      "mold",
      "diy",
      "annual",
    ],
  },
  {
    key: "hvac_ms_003",
    componentTemplateKey: "mini_split_single",
    systemCategory: "hvac",
    name: "Clear Mini-Split Condensate Drain",
    description:
      "Flush and clear the condensate drain line from the indoor unit. Mini-splits use gravity drains or condensate pumps — both require maintenance.",
    whyItMatters:
      "Mini-split condensate leaks cause more hidden wall damage than almost any other HVAC issue. Because the unit is wall-mounted, a blocked drain sends water down inside the wall cavity where you can't see it. Quarterly maintenance is non-negotiable.",
    instructions: [
      "Locate where the condensate drain line exits the indoor unit (usually to one side, running down the wall or through it)",
      "Find the drain line access point or the outdoor termination",
      "Flush with 1/2 cup of distilled white vinegar using a funnel or turkey baster",
      "Let sit 30 minutes, then flush with warm water",
      "Verify water flows freely from the outdoor drain termination",
      "If the unit uses a condensate pump, verify the pump activates and empties the reservoir",
      "Clean the pump reservoir with warm water and vinegar if accessible",
      "Check for any water stains or moisture around the indoor unit mounting area",
    ],
    frequency: { intervalMonths: 3 },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 15,
    toolsRequired: [
      "distilled white vinegar",
      "small funnel or turkey baster",
      "wet/dry vacuum (optional)",
    ],
    materialsCost: { low: 0, high: 10 },
    professionalCost: { low: 75, high: 175 },
    skipConsequences: {
      shortTerm:
        "Water dripping or streaming down the wall from the indoor unit; indoor unit displays drainage error code",
      longTerm:
        "Mold growth behind or around the indoor unit from chronic moisture; drywall damage from water intrusion behind the unit",
      costOfNeglect:
        "Hidden wall damage is far more expensive to repair than quarterly drain maintenance",
    },
    safetyNotes: [
      "Check for water stains around the unit mounting area each time",
      "Wall-mounted units can cause hidden water damage inside wall cavities",
    ],
    seasonalRelevance: ["summer"],
    priority: "high" as const,
    tags: [
      "mini-split",
      "condensate",
      "drain",
      "diy",
      "quarterly",
      "water-damage",
    ],
  },
  {
    key: "hvac_ms_004",
    componentTemplateKey: "mini_split_single",
    systemCategory: "hvac",
    name: "Clean Outdoor Compressor Unit",
    description:
      "Clean the mini-split outdoor unit condenser coil and inspect for debris, damage, and proper clearance. Same principles as central AC condenser cleaning but smaller scale.",
    whyItMatters:
      "Mini-split outdoor units are often installed in tight spaces. Restricted airflow from vegetation or debris is the fastest way to kill a compressor.",
    instructions: [
      "Turn off the system at the indoor unit and outdoor disconnect",
      "Clear all vegetation, leaves, and debris from around the unit (maintain 2 feet clearance)",
      "Remove the outer grille/cover if accessible",
      "Spray the coil from inside out with a garden hose (moderate pressure, never a power washer)",
      "Apply coil cleaner for heavily soiled coils",
      "Check the refrigerant line connections for oil stains (leak indicators)",
      "Inspect the mounting brackets for rust or looseness",
      "Verify the drain hole on the base pan is clear (outdoor units have drain holes for defrost water and rain)",
      "Reassemble, restore power, and test",
    ],
    frequency: { intervalMonths: 12 },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 30,
    toolsRequired: [
      "garden hose",
      "soft brush",
      "coil cleaner (optional)",
    ],
    materialsCost: { low: 5, high: 15 },
    professionalCost: { low: 75, high: 175 },
    skipConsequences: {
      shortTerm:
        "Reduced heating and cooling performance; higher energy consumption",
      longTerm:
        "Compressor overheating from restricted airflow; vegetation growing into the unit causing damage",
      costOfNeglect:
        "Restricted airflow is the fastest way to kill a compressor",
    },
    safetyNotes: [
      "Never use a pressure washer on condenser coils",
      "If vegetation is a recurring problem, install a gravel pad or stone border",
    ],
    seasonalRelevance: ["spring"],
    priority: "high" as const,
    tags: [
      "mini-split",
      "condenser",
      "cleaning",
      "diy",
      "annual",
    ],
  },

  // ================================================================
  // THERMOSTAT  (componentTemplateKey: "thermostat_smart")
  // ================================================================
  {
    key: "hvac_tstat_001",
    componentTemplateKey: "thermostat_smart",
    systemCategory: "hvac",
    name: "Verify Thermostat Calibration",
    description:
      "Check that the thermostat is reading the correct room temperature and responding accurately to temperature changes.",
    whyItMatters:
      "If a thermostat consistently reads high or low, many smart thermostats have a temperature correction/offset setting in their app. A 2°F correction can fix a thermostat without replacing it.",
    instructions: [
      "Place a reliable standalone thermometer next to the thermostat (same wall, same height)",
      "Wait 15-20 minutes for the standalone thermometer to stabilize",
      "Compare the readings — they should be within 1-2°F of each other",
      "If the difference is greater than 3°F, the thermostat may need recalibration",
      "For smart thermostats, check the app for calibration offset settings",
      "Ensure the thermostat is not in direct sunlight, near a heat source, or in a drafty area",
      "Verify the thermostat is mounted on an interior wall (not an exterior wall that heats/cools with outside temps)",
      "For older mercury-bulb thermostats, check that the unit is level on the wall",
    ],
    frequency: { intervalMonths: 12 },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 10,
    toolsRequired: ["separate indoor thermometer or hygrometer"],
    materialsCost: { low: 0, high: 15 },
    professionalCost: { low: 50, high: 125 },
    skipConsequences: {
      shortTerm:
        "System overcools or overheats, wasting energy; rooms feel uncomfortable despite correct thermostat setting",
      longTerm:
        "Frequent cycling from misreads; unnecessary energy waste year-round",
      costOfNeglect:
        "Arguments in the household about thermostat settings that can't be resolved",
    },
    safetyNotes: [
      "Ensure thermostat is on an interior wall, not affected by sunlight or heat sources",
    ],
    seasonalRelevance: ["spring", "fall"],
    priority: "medium" as const,
    tags: [
      "thermostat",
      "calibration",
      "diy",
      "annual",
    ],
  },
  {
    key: "hvac_tstat_002",
    componentTemplateKey: "thermostat_smart",
    systemCategory: "hvac",
    name: "Replace Thermostat Batteries",
    description:
      "Replace batteries in battery-powered or battery-backed thermostats to prevent loss of programming and system shutdown.",
    whyItMatters:
      "Dead thermostat batteries mean a blank screen and no HVAC control at all. Replace proactively — don't wait for the low battery indicator. Some smart thermostats (Nest, Ecobee) charge via the C-wire and don't need batteries.",
    instructions: [
      "Remove the thermostat faceplate from the wall plate (most pull straight off or have a release tab)",
      "Locate the battery compartment (usually on the back of the faceplate or side)",
      "Note the battery type (typically AA or AAA alkaline)",
      "Remove old batteries and insert new ones with correct polarity",
      "Reattach the faceplate to the wall plate",
      "Verify the display is functioning and all settings are retained",
      "Check that the time and schedule are correct",
    ],
    frequency: { intervalMonths: 12 },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 5,
    toolsRequired: ["none"],
    materialsCost: { low: 3, high: 8 },
    professionalCost: { low: 0, high: 0 },
    skipConsequences: {
      shortTerm:
        "Blank thermostat screen — total loss of HVAC control; loss of all programmed schedules",
      longTerm:
        "For battery-only models (no C-wire), dead batteries mean no heating or cooling",
      costOfNeglect:
        "System won't respond to temperature adjustments",
    },
    safetyNotes: [
      "Replace thermostat batteries when you change smoke detector batteries — same schedule",
      "Some smart thermostats (Nest, Ecobee) don't use traditional batteries",
    ],
    seasonalRelevance: ["fall"],
    priority: "medium" as const,
    tags: [
      "thermostat",
      "batteries",
      "diy",
      "annual",
    ],
  },
  {
    key: "hvac_tstat_003",
    componentTemplateKey: "thermostat_smart",
    systemCategory: "hvac",
    name: "Update Smart Thermostat Software",
    description:
      "Ensure smart thermostat firmware and companion app are up to date for optimal performance, security patches, and new features.",
    whyItMatters:
      "Smart thermostat learning algorithms improve with updates. A thermostat running year-old firmware may be missing significant efficiency improvements. It's free performance — just keep it updated.",
    instructions: [
      "Open the thermostat's companion app (Nest, Ecobee, Honeywell Home, etc.)",
      "Navigate to Settings > About or Device Info",
      "Check current firmware version against the manufacturer's latest release",
      "If an update is available, follow the app prompts to install",
      "Do not interrupt the update process — keep the thermostat powered",
      "After updating, verify all schedules and settings are intact",
      "Update the phone app from the App Store or Play Store as well",
      "Verify Wi-Fi connection is stable after the update",
    ],
    frequency: { intervalMonths: 3 },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 5,
    toolsRequired: ["smartphone with thermostat app"],
    materialsCost: { low: 0, high: 0 },
    professionalCost: { low: 0, high: 0 },
    skipConsequences: {
      shortTerm:
        "Security vulnerabilities in outdated firmware; missing energy-saving features",
      longTerm:
        "Compatibility issues with updated phone apps or smart home integrations; known bugs unpatched",
      costOfNeglect:
        "Free performance improvements missed by running outdated firmware",
    },
    safetyNotes: [
      "Do not interrupt the update process — keep the thermostat powered during updates",
    ],
    seasonalRelevance: ["spring", "summer", "fall", "winter"],
    priority: "low" as const,
    tags: [
      "thermostat",
      "smart",
      "firmware",
      "diy",
      "quarterly",
    ],
  },

  // ================================================================
  // EXHAUST FANS  (componentTemplateKey: "bathroom_exhaust_fan")
  // ================================================================
  {
    key: "hvac_exh_001",
    componentTemplateKey: "bathroom_exhaust_fan",
    systemCategory: "hvac",
    name: "Clean Bathroom Exhaust Fan",
    description:
      "Remove and clean the fan cover and impeller to maintain proper airflow. Dust buildup significantly reduces bathroom ventilation effectiveness.",
    whyItMatters:
      "The tissue test is the quickest way to check fan performance: hold a single sheet of tissue up to the grille with the fan on. If it sticks, the fan is pulling adequate air. If it falls, cleaning or replacement is needed.",
    instructions: [
      "Turn off the fan at the switch",
      "Remove the cover/grille — most squeeze inward on spring clips, then pull down",
      "Soak the cover in warm soapy water in the sink",
      "With the cover off, vacuum the fan blade/impeller and housing with a brush attachment",
      "Wipe down the motor housing with a damp cloth (do NOT spray water directly on the motor)",
      "Use a can of compressed air for hard-to-reach areas around the motor",
      "Scrub the cover clean, rinse, and dry completely",
      "Reinstall the cover, ensuring it clips securely",
      "Turn on the fan and verify improved airflow — hold a tissue near the fan; it should be pulled up firmly",
    ],
    frequency: { intervalMonths: 6 },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 20,
    toolsRequired: [
      "step stool",
      "vacuum with brush attachment",
      "warm soapy water",
      "screwdriver (for some models)",
    ],
    materialsCost: { low: 0, high: 5 },
    professionalCost: { low: 50, high: 100 },
    skipConsequences: {
      shortTerm:
        "Bathroom mirror stays foggy long after a shower; fan is noisy but moves little air",
      longTerm:
        "Mold growth on bathroom ceiling, walls, or grout; peeling paint or wallpaper from excess moisture",
      costOfNeglect:
        "Musty bathroom odor that doesn't go away",
    },
    safetyNotes: [
      "Do NOT spray water directly on the motor",
      "Use a step stool — don't stand on toilet seats or bathtub edges",
    ],
    seasonalRelevance: ["spring", "summer", "fall", "winter"],
    priority: "medium" as const,
    tags: [
      "exhaust-fan",
      "bathroom",
      "cleaning",
      "diy",
      "semi-annual",
      "mold",
    ],
  },
  {
    key: "hvac_exh_002",
    componentTemplateKey: "kitchen_range_hood",
    systemCategory: "hvac",
    name: "Clean Range Hood Filters",
    description:
      "Clean or replace the grease filters in the kitchen range hood/vent hood to maintain proper grease capture and ventilation.",
    whyItMatters:
      "The baking soda and boiling water method is incredibly effective — grease literally floats off the filter. Way better than any commercial range hood cleaner and costs almost nothing.",
    instructions: [
      "Remove the metal mesh/baffle grease filters from the hood (usually slide or pop out)",
      "Fill a large pot or sink with very hot water",
      "Add 1/4 cup baking soda and a squirt of degreasing dish soap",
      "Submerge the filters and let soak for 15-30 minutes",
      "Scrub with a non-abrasive brush to remove remaining grease",
      "Rinse thoroughly with hot water",
      "Let air dry completely before reinstalling",
      "For heavily caked filters, repeat the process or use a dishwasher (if manufacturer allows)",
      "For charcoal/carbon filters (recirculating hoods), these cannot be cleaned — replace per manufacturer schedule",
    ],
    frequency: { intervalMonths: 1 },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 20,
    toolsRequired: [
      "large pot or sink",
      "degreasing dish soap",
      "baking soda",
      "non-abrasive brush",
    ],
    materialsCost: { low: 0, high: 10 },
    professionalCost: { low: 0, high: 0 },
    skipConsequences: {
      shortTerm:
        "Grease buildup on kitchen cabinets, walls, and ceiling; reduced ventilation — cooking odors linger",
      longTerm:
        "Range hood becomes a fire hazard with accumulated grease; grease drips from the hood onto the stove during cooking",
      costOfNeglect:
        "Fan struggles and becomes noisy from restricted airflow",
    },
    safetyNotes: [
      "Use very hot water for best degreasing results",
      "Charcoal/carbon filters in recirculating hoods cannot be cleaned — replace them",
    ],
    seasonalRelevance: ["spring", "summer", "fall", "winter"],
    priority: "medium" as const,
    tags: [
      "range-hood",
      "kitchen",
      "grease",
      "cleaning",
      "diy",
      "monthly",
    ],
  },
  {
    key: "hvac_exh_003",
    componentTemplateKey: "bathroom_exhaust_fan",
    systemCategory: "hvac",
    name: "Inspect Exhaust Fan Duct Termination",
    description:
      "Verify that bathroom and kitchen exhaust fans properly vent to the exterior of the home and that the exterior vent flap/damper operates correctly.",
    whyItMatters:
      "About 30% of bathroom exhaust fans in existing homes either vent into the attic (code violation) or have disconnected duct runs. Both cause serious moisture and mold problems. If you've never checked, go look.",
    instructions: [
      "Locate the exterior vent termination for each exhaust fan (usually on the roof, soffit, or exterior wall)",
      "Turn on the fan and verify air is actually exiting at the exterior vent",
      "Check that the damper flap opens when the fan runs and closes when it stops",
      "Look for bird nests, wasp nests, or debris blocking the vent",
      "Verify no screens have been added over the vent (they catch lint and clog)",
      "For roof-mounted terminations, check the flashing for proper sealing",
      "Ensure the duct is not terminated in the attic (common code violation — vents moisture into attic space)",
      "If you can access the duct in the attic, check for disconnections or sagging",
    ],
    frequency: { intervalMonths: 12 },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 15,
    toolsRequired: [
      "flashlight",
      "step ladder for exterior inspection",
    ],
    materialsCost: { low: 0, high: 30 },
    professionalCost: { low: 75, high: 200 },
    skipConsequences: {
      shortTerm:
        "Bird or pest nests block the vent, rendering the fan useless; stuck-open damper allows cold air and insects to enter",
      longTerm:
        "Bathroom fans venting into the attic cause mold, rot, and insulation damage (extremely common problem)",
      costOfNeglect:
        "Disconnected duct in attic means all moisture goes directly into your attic space",
    },
    safetyNotes: [
      "Use a secure ladder for exterior vent inspection",
      "Do not add screens over exterior vent terminations — they catch lint and clog",
    ],
    seasonalRelevance: ["spring"],
    priority: "high" as const,
    tags: [
      "exhaust-fan",
      "vent-termination",
      "inspection",
      "diy",
      "annual",
      "attic",
    ],
  },

  // ================================================================
  // HUMIDIFIER / DEHUMIDIFIER  (componentTemplateKey: "whole_house_dehumidifier")
  // ================================================================
  {
    key: "hvac_hd_001",
    componentTemplateKey: "whole_house_dehumidifier",
    systemCategory: "hvac",
    name: "Replace Humidifier Water Panel/Pad",
    description:
      "Replace the evaporator water panel (pad) in bypass and fan-powered humidifiers. Mineral deposits from water evaporation clog the pad and reduce moisture output.",
    whyItMatters:
      "In hard-water areas, the pad may be completely calcified within a single season. Write the install date on the new water panel with a marker so you know when it was last changed.",
    instructions: [
      "Turn off the humidifier and the HVAC system",
      "Open the humidifier cover/door on the ductwork",
      "Slide out the water distribution tray and water panel assembly",
      "Remove the old water panel from the frame — note how it's oriented",
      "Inspect the water distribution tray for mineral scale buildup — clean with vinegar if needed",
      "Install the new water panel in the frame with the correct orientation",
      "Slide the assembly back into the humidifier housing",
      "Close the cover and restore operation",
      "Set the humidistat to the appropriate level (30-50% depending on outdoor temperature)",
    ],
    frequency: { intervalMonths: 12 },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 15,
    toolsRequired: ["none — hand-removable in most models"],
    materialsCost: { low: 10, high: 25 },
    professionalCost: { low: 75, high: 150 },
    skipConsequences: {
      shortTerm:
        "White mineral crust on the water panel blocks moisture absorption; humidifier runs but home stays dry",
      longTerm:
        "Mineral deposits clog the drain line; standing water promotes bacterial growth; stale or musty odor from ducts",
      costOfNeglect:
        "In hard-water areas, mid-season replacement may also be necessary",
    },
    safetyNotes: [
      "Write the install date on the new water panel with a marker",
      "Consider a mid-season check if you have very hard water",
    ],
    seasonalRelevance: ["fall"],
    priority: "high" as const,
    tags: [
      "humidifier",
      "water-panel",
      "diy",
      "annual",
    ],
  },
  {
    key: "hvac_hd_002",
    componentTemplateKey: "whole_house_dehumidifier",
    systemCategory: "hvac",
    name: "Service Whole-Home Dehumidifier",
    description:
      "Clean the coils, filter, and drain on a whole-home dehumidifier. Essential in humid climates to maintain indoor air quality and prevent mold growth.",
    whyItMatters:
      "In Gulf Coast climates, a whole-home dehumidifier is almost a necessity. The AC alone can't always keep up with humidity, especially during mild shoulder seasons when the AC doesn't run much but humidity is still 80%+.",
    instructions: [
      "Turn off the dehumidifier and disconnect power",
      "Remove and clean or replace the air filter",
      "Vacuum the evaporator and condenser coils with a brush attachment",
      "Apply coil cleaner if coils are visibly dirty",
      "Clean the condensate collection pan with warm water and vinegar",
      "Flush the condensate drain line with vinegar to prevent clogs",
      "Verify the condensate pump operates (if equipped)",
      "Check the humidity sensor/humidistat for proper calibration",
      "Clean the exterior housing and any air intake grilles",
      "Restore power and verify the unit reaches the target humidity level",
    ],
    frequency: { intervalMonths: 6 },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 30,
    toolsRequired: [
      "vacuum with brush attachment",
      "soft brush",
      "coil cleaner",
      "vinegar",
    ],
    materialsCost: { low: 5, high: 20 },
    professionalCost: { low: 100, high: 250 },
    skipConsequences: {
      shortTerm:
        "Indoor humidity above 55% promotes mold, dust mites, and musty odors; condensation on windows",
      longTerm:
        "Mold growth in closets, bathrooms, and under-ventilated areas; increased allergy and asthma symptoms",
      costOfNeglect:
        "Dehumidifier runs constantly without reaching target humidity",
    },
    safetyNotes: [
      "Disconnect power before servicing",
      "Target indoor humidity: 40-55% depending on climate",
    ],
    seasonalRelevance: ["spring"],
    priority: "high" as const,
    tags: [
      "dehumidifier",
      "humidity",
      "cleaning",
      "diy",
      "semi-annual",
      "gulf-coast",
    ],
  },
];

export const seed = internalMutation({
  handler: async (ctx) => {
    let inserted = 0;
    let skipped = 0;

    for (const task of hvacMaintenanceTasks) {
      // Check if task already exists by key
      const existing = await ctx.db
        .query("maintenanceTasks")
        .withIndex("by_key", (q) => q.eq("key", task.key))
        .first();

      if (existing) {
        skipped++;
        continue;
      }

      await ctx.db.insert("maintenanceTasks", task);
      inserted++;
    }

    console.log(
      `[tasks_hvac] Seeded ${inserted} HVAC maintenance tasks (${skipped} already existed)`
    );
    return { inserted, skipped, total: hvacMaintenanceTasks.length };
  },
});
