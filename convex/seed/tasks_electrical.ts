import { internalMutation } from "../_generated/server";

// ─────────────────────────────────────────────────────────────────────────────
// ELECTRICAL Maintenance Tasks — 12 tasks across 7 component types
// Source: NEC (National Electrical Code), NFPA, manufacturer guidelines,
//         and field experience from licensed electricians.
// Cost basis: 2025 US National Average
// ─────────────────────────────────────────────────────────────────────────────

const electricalMaintenanceTasks = [
  // ================================================================
  // MAIN PANEL  (componentTemplateKey: "main_panel")
  // ================================================================
  {
    key: "elec_mpnl_001",
    componentTemplateKey: "main_panel",
    systemCategory: "electrical",
    name: "Main Panel Visual Inspection",
    description:
      "Perform a professional visual inspection of the main electrical panel for signs of overheating, corrosion, moisture intrusion, burnt wiring, and code violations. This is the nerve center of your home's electrical system.",
    whyItMatters:
      "Electrical fires cause over 50,000 home fires per year in the US. Many start inside the panel from loose connections, corroded busbars, or overloaded circuits. A visual inspection by a licensed electrician catches problems long before they become emergencies.",
    instructions: [
      "SAFETY: Only a licensed electrician should open and inspect the inner panel cover (dead front). Homeowners should NEVER remove the dead front cover.",
      "Electrician turns off the main breaker and verifies power is off with a non-contact voltage tester",
      "Remove the dead front cover and inspect the interior",
      "Check for signs of overheating: discolored wires, melted insulation, or burn marks on bus bars",
      "Inspect all breaker connections for tightness and corrosion",
      "Look for signs of moisture intrusion — rust, water stains, or green copper corrosion",
      "Verify all circuits are properly labeled in the panel directory",
      "Check for double-tapped breakers (two wires on one breaker terminal — code violation unless listed for it)",
      "Inspect the main breaker for signs of overheating or damage",
      "Verify the grounding and bonding connections are intact and tight",
      "Look for evidence of pest intrusion (droppings, nesting material, chewed insulation)",
      "Check for proper wire gauge matching to breaker amperage (undersized wire is a fire hazard)",
      "Reinstall the dead front cover and restore power",
      "Provide written report of findings and any recommended corrections",
    ],
    frequency: {
      intervalMonths: 12,
      seasonalAdjustments: {
        note: "Annual inspection recommended. More frequent in homes over 30 years old or with Federal Pacific, Zinsco, or Pushmatic panels.",
      },
      triggerConditions: [
        "Burning smell near the panel",
        "Frequent breaker trips",
        "Visible scorch marks on panel cover",
        "After any major electrical work",
        "Home purchase or sale",
      ],
    },
    difficulty: "professional" as const,
    diyFriendly: false,
    estimatedMinutes: 45,
    toolsRequired: [
      "non-contact voltage tester",
      "insulated screwdriver set",
      "flashlight",
      "multimeter",
      "infrared thermometer or thermal camera",
    ],
    materialsCost: { low: 0, high: 0 },
    professionalCost: { low: 150, high: 350 },
    skipConsequences: {
      shortTerm:
        "Loose connections worsen and generate heat; corrosion spreads unnoticed",
      longTerm:
        "FIRE HAZARD — loose connections cause arcing that can ignite surrounding materials; corroded busbars fail, causing loss of power to entire circuits; overloaded circuits melt wire insulation",
      costOfNeglect:
        "A $150-$350 annual inspection prevents house fires. The average electrical fire causes $50,000+ in damage.",
    },
    safetyNotes: [
      "DANGER: Homeowners should NEVER remove the dead front (inner) panel cover — lethal voltages are exposed even with the main breaker off (the utility feed lugs remain live)",
      "Only a licensed electrician should perform this inspection",
      "If you see scorch marks, smell burning, or hear crackling/buzzing from the panel, call an electrician immediately — do not attempt to inspect it yourself",
    ],
    seasonalRelevance: ["spring", "fall"],
    priority: "critical" as const,
    tags: [
      "panel",
      "inspection",
      "professional",
      "annual",
      "fire-safety",
      "electrical",
    ],
  },
  {
    key: "elec_mpnl_002",
    componentTemplateKey: "main_panel",
    systemCategory: "electrical",
    name: "Tighten Panel Connections and Thermal Scan",
    description:
      "A licensed electrician re-torques all bus bar connections, breaker terminals, neutral/ground bar screws, and performs a thermal scan to identify hot spots caused by high-resistance connections.",
    whyItMatters:
      "Thermal cycling from daily load changes gradually loosens electrical connections. A connection that was tight at installation can work loose over 5-10 years. Loose connections create resistance, resistance creates heat, and heat starts fires. A thermal scan detects dangerous hot spots invisible to the naked eye.",
    instructions: [
      "SAFETY: This task requires a licensed electrician — panel work involves lethal voltages",
      "Electrician turns off the main breaker and verifies de-energized state",
      "Remove the dead front cover",
      "Using a calibrated torque screwdriver, re-torque all breaker terminal screws to manufacturer specification",
      "Re-torque the main breaker lugs",
      "Re-torque all neutral bar and ground bar screws",
      "Check for and correct any double-tapped neutrals (code violation)",
      "Restore power to the panel with the dead front off (briefly, for thermal scan)",
      "Perform thermal scan with an infrared camera under normal load conditions",
      "Any connection showing more than 20°F above ambient indicates a problem",
      "Document hot spots with thermal images for the homeowner's records",
      "De-energize, address any connections requiring immediate correction",
      "Reinstall dead front cover and restore power",
      "Provide written report with thermal images and recommendations",
    ],
    frequency: {
      intervalMonths: 36,
      seasonalAdjustments: {
        note: "Every 3 years for panels less than 20 years old. Annually for panels over 30 years old or for Federal Pacific (FPE), Zinsco, or Pushmatic panels.",
      },
    },
    difficulty: "professional" as const,
    diyFriendly: false,
    estimatedMinutes: 60,
    toolsRequired: [
      "calibrated torque screwdriver",
      "infrared thermal camera",
      "non-contact voltage tester",
      "multimeter",
      "insulated tools",
    ],
    materialsCost: { low: 0, high: 0 },
    professionalCost: { low: 200, high: 500 },
    skipConsequences: {
      shortTerm:
        "Loose connections generate heat that degrades wire insulation; intermittent power on affected circuits",
      longTerm:
        "FIRE HAZARD — arcing from loose connections is a leading cause of electrical fires; melted bus bars require full panel replacement ($2,000-$4,000+)",
      costOfNeglect:
        "A $200-$500 retorque and thermal scan prevents catastrophic panel failure. Federal Pacific and Zinsco panels are especially prone to connection failures.",
    },
    safetyNotes: [
      "DANGER: Only a licensed electrician should perform this work — lethal voltages are present",
      "The thermal scan portion requires the panel to be energized with the cover off — extremely dangerous without proper training and PPE",
      "If your home has a Federal Pacific (FPE), Zinsco, or Pushmatic panel, discuss full panel replacement with your electrician",
    ],
    seasonalRelevance: ["spring"],
    priority: "high" as const,
    tags: [
      "panel",
      "torque",
      "thermal-scan",
      "professional",
      "fire-safety",
      "electrical",
    ],
  },
  {
    key: "elec_mpnl_003",
    componentTemplateKey: "main_panel",
    systemCategory: "electrical",
    name: "Check Grounding and Bonding System",
    description:
      "Verify the integrity of the home's electrical grounding system including the grounding electrode conductor, ground rods, water pipe bonds, and equipment grounding throughout the panel.",
    whyItMatters:
      "Grounding is your safety net — it gives fault current a safe path to earth instead of through you. A broken or corroded ground means your breakers may not trip during a fault, and metal surfaces in your home could become energized. After lightning strikes, the grounding system often sustains hidden damage.",
    instructions: [
      "SAFETY: Grounding system inspection requires a licensed electrician",
      "Inspect the grounding electrode conductor (GEC) from the panel to the ground rod(s)",
      "Verify the GEC is continuous with no splices (unless irreversible compression connectors were used)",
      "Check the ground rod clamp for tightness and corrosion — replace if corroded",
      "If the home has a metallic water supply, verify the water pipe bonding jumper is present and connected",
      "Check for bonding jumpers across the water meter and any dielectric unions",
      "Verify the gas piping bonding connection if applicable",
      "In the panel, verify the neutral-to-ground bond is present in the main panel only (not in sub-panels)",
      "Check that all ground wires in the panel are properly terminated on the ground bar",
      "Test grounding effectiveness with a ground impedance tester — resistance should be below 25 ohms (NEC requirement)",
      "For homes with supplemental ground rods, check connections at each rod",
      "Document findings and recommend corrections for any deficiencies",
    ],
    frequency: {
      intervalMonths: 36,
      triggerConditions: [
        "After lightning strike near the home",
        "After water line replacement (may break water pipe bond)",
        "After panel upgrade or modification",
        "Tingling sensation when touching metal surfaces or appliances",
      ],
    },
    difficulty: "professional" as const,
    diyFriendly: false,
    estimatedMinutes: 45,
    toolsRequired: [
      "ground impedance tester",
      "multimeter",
      "non-contact voltage tester",
      "insulated tools",
      "flashlight",
    ],
    materialsCost: { low: 0, high: 50 },
    professionalCost: { low: 150, high: 400 },
    skipConsequences: {
      shortTerm:
        "Breakers may not trip during ground faults; nuisance GFCI tripping from improper grounding",
      longTerm:
        "ELECTROCUTION RISK — metal surfaces can become energized without a proper ground path; surge protectors cannot function without proper grounding; lightning damage risk increases dramatically",
      costOfNeglect:
        "A broken ground connection makes every safety device in your home less effective. Ground rod replacement is $150-$300; the liability of no grounding is immeasurable.",
    },
    safetyNotes: [
      "DANGER: A home without proper grounding has no safety net — fault current has nowhere to go except through people and equipment",
      "If you feel a tingle or shock from any metal surface (faucet, appliance, light switch plate), call an electrician immediately",
      "Do not assume grounding is intact just because everything appears to work — grounding failures are invisible until something goes wrong",
    ],
    seasonalRelevance: ["spring"],
    priority: "high" as const,
    tags: [
      "grounding",
      "bonding",
      "safety",
      "professional",
      "panel",
      "electrical",
    ],
  },

  // ================================================================
  // GFCI OUTLETS  (componentTemplateKey: "gfci_outlets")
  // ================================================================
  {
    key: "elec_gfci_001",
    componentTemplateKey: "gfci_outlets",
    systemCategory: "electrical",
    name: "Test and Reset GFCI Outlets",
    description:
      "Press the TEST button on every GFCI outlet and GFCI breaker in the home to verify the ground-fault protection trips properly, then press RESET to restore power. GFCI protection is required in kitchens, bathrooms, garages, outdoors, basements, and near any water source.",
    whyItMatters:
      "GFCI outlets prevent electrocution by detecting tiny current imbalances (as little as 5 milliamps) and cutting power in 1/40th of a second. But the internal mechanism can fail silently — the outlet still works, but the life-saving trip function doesn't. Monthly testing is the only way to know it's still protecting you.",
    instructions: [
      "Locate all GFCI outlets in the home — check kitchens, bathrooms, garages, basements, laundry rooms, and outdoor outlets",
      "Also check the breaker panel for GFCI breakers (they have a TEST button on the breaker itself)",
      "For each GFCI outlet: plug in a nightlight or small lamp so you can see when power cuts",
      "Press the TEST button firmly — you should hear a click and the power should cut off immediately",
      "If the GFCI does NOT trip (power stays on), the device has failed and must be replaced immediately",
      "Press the RESET button to restore power — the light should come back on",
      "Verify that downstream outlets also lost power during the test (GFCIs protect multiple outlets downstream)",
      "For GFCI breakers in the panel: press TEST, verify the breaker trips, then reset it",
      "Note any GFCIs that trip slowly, feel hot, are discolored, or make crackling sounds — replace these",
      "Replace any GFCI outlet older than 10-15 years, even if it still passes testing (internal components degrade)",
    ],
    frequency: {
      intervalMonths: 1,
      seasonalAdjustments: {
        note: "Monthly testing is recommended by the NEC and all GFCI manufacturers. Takes less than 5 minutes for the entire home.",
      },
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 10,
    toolsRequired: ["none — just press the TEST and RESET buttons"],
    materialsCost: { low: 0, high: 0 },
    professionalCost: { low: 0, high: 0 },
    skipConsequences: {
      shortTerm:
        "A failed GFCI provides zero electrocution protection while still appearing to work normally",
      longTerm:
        "ELECTROCUTION RISK — GFCIs degrade over time and can fail silently; a 15-year-old GFCI has a significantly higher failure rate even if it has never tripped",
      costOfNeglect:
        "GFCI replacement is $15-$25 per outlet (DIY) or $75-$150 per outlet (electrician). The cost of not having working GFCI protection near water is potentially fatal.",
    },
    safetyNotes: [
      "This is one of the most important safety checks in your home — GFCI protection prevents electrocution",
      "If any GFCI fails the test (doesn't trip), stop using that outlet and have it replaced immediately",
      "Outdoor GFCIs and those in garages are exposed to moisture and temperature extremes — they fail more often",
      "Replace all GFCIs that are more than 15 years old regardless of test results",
    ],
    seasonalRelevance: ["spring", "summer", "fall", "winter"],
    priority: "critical" as const,
    tags: [
      "gfci",
      "outlets",
      "safety",
      "monthly",
      "diy",
      "electrocution-prevention",
      "electrical",
    ],
  },

  // ================================================================
  // WHOLE HOUSE SURGE PROTECTOR  (componentTemplateKey: "whole_house_surge")
  // ================================================================
  {
    key: "elec_whsp_001",
    componentTemplateKey: "whole_house_surge",
    systemCategory: "electrical",
    name: "Check Whole-House Surge Protector Status",
    description:
      "Verify the whole-house surge protection device (SPD) is operational by checking the LED indicator lights and ensuring it has not been sacrificed by a previous surge event. Surge protectors are sacrificial devices — they absorb surges until their capacity is exhausted.",
    whyItMatters:
      "A whole-house surge protector can absorb dozens of small surges from appliance cycling, grid switching, and nearby lightning strikes — but it has a finite capacity. Once it's absorbed enough energy, it's depleted and provides zero protection while still appearing installed. The indicator light is the only way to know if it's still protecting your home.",
    instructions: [
      "Locate the whole-house surge protector — typically installed at or near the main electrical panel",
      "Check the LED indicator light(s) on the device",
      "GREEN light (or solid LED) = protection active — the device is functioning",
      "RED light, NO light, or flashing = protection depleted or device failure — replacement needed",
      "Consult the specific manufacturer's manual for your model's indicator meanings (they vary by brand)",
      "Verify the device is still securely mounted and wiring is intact (visual check only — do not open the panel)",
      "Check the breaker feeding the surge protector is in the ON position (some models have a dedicated 2-pole breaker)",
      "If the surge protector has been in service for more than 5-7 years, consider proactive replacement even if the indicator shows green",
      "Note the installation date if known — write it on the device with a permanent marker for future reference",
      "If the SPD needs replacement, contact a licensed electrician — this requires working inside the panel",
    ],
    frequency: {
      intervalMonths: 3,
      seasonalAdjustments: {
        note: "Quarterly checks recommended. Check immediately after any known lightning strike in your area or after a power outage.",
      },
      triggerConditions: [
        "After thunderstorms or lightning in the area",
        "After a power outage or grid event",
        "Electronics behaving erratically",
        "Appliance failures without apparent cause",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 5,
    toolsRequired: ["none — visual check of indicator lights only"],
    materialsCost: { low: 0, high: 0 },
    professionalCost: { low: 150, high: 400 },
    skipConsequences: {
      shortTerm:
        "Depleted surge protector provides zero protection while appearing installed; next surge event damages electronics and appliances",
      longTerm:
        "A single unprotected surge can destroy HVAC control boards ($300-$800), refrigerators, smart home systems, computers, and TVs simultaneously — total loss easily exceeds $5,000-$15,000",
      costOfNeglect:
        "Whole-house SPD replacement costs $150-$400 installed. A single lightning-induced surge can destroy $5,000-$15,000+ in electronics and appliance control boards.",
    },
    safetyNotes: [
      "Checking the indicator light is safe and requires no tools — just look at the device",
      "Do NOT open the electrical panel to inspect the surge protector connections — that requires an electrician",
      "Whole-house surge protectors work best in combination with point-of-use surge strips for sensitive electronics",
      "Ensure your home's grounding system is intact — surge protectors cannot function without proper grounding",
    ],
    seasonalRelevance: ["spring", "summer", "fall", "winter"],
    priority: "high" as const,
    tags: [
      "surge-protector",
      "spd",
      "lightning",
      "diy",
      "quarterly",
      "electronics-protection",
      "electrical",
    ],
  },

  // ================================================================
  // STANDBY GENERATOR  (componentTemplateKey: "generator_standby")
  // ================================================================
  {
    key: "elec_gen_001",
    componentTemplateKey: "generator_standby",
    systemCategory: "electrical",
    name: "Generator Monthly Exercise Run",
    description:
      "Run the standby generator under load for 15-30 minutes to keep the engine lubricated, charge the battery, burn off moisture, and verify the automatic transfer switch (ATS) operates correctly.",
    whyItMatters:
      "A generator that sits idle for months may not start when you need it most. Engine oil settles, seals dry out, fuel degrades, and batteries discharge. Most modern standby generators have a built-in weekly exercise cycle — verify it's enabled and actually running. The worst time to discover your generator doesn't work is during a power outage.",
    instructions: [
      "Check if your generator has an automatic weekly exercise schedule programmed — most Generac, Kohler, and Cummins units do",
      "Verify the exercise schedule is enabled on the generator controller (check the display panel)",
      "If no auto-exercise, manually initiate an exercise run from the generator controller",
      "Let the generator run under load for at least 15-30 minutes",
      "During the run, check the generator display for any fault codes or warnings",
      "Listen for smooth engine operation — no knocking, misfiring, or unusual vibration",
      "Verify the automatic transfer switch (ATS) activated — your home should have briefly switched to generator power",
      "Check the area around the generator for fuel leaks, oil leaks, or coolant leaks",
      "Verify the exhaust system is intact and directing exhaust away from the home and any air intakes",
      "After the run, check the generator controller for the battery voltage reading (should be 12.4V+ for lead-acid)",
      "Log the run hours from the hour meter for your maintenance records",
    ],
    frequency: {
      intervalMonths: 1,
      seasonalAdjustments: {
        note: "Monthly verification that the weekly auto-exercise is running. Most units auto-exercise weekly, but the auto-schedule can be accidentally disabled or the exercise may fail silently.",
      },
    },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 30,
    toolsRequired: ["none for basic exercise run verification"],
    materialsCost: { low: 0, high: 0 },
    professionalCost: { low: 0, high: 0 },
    skipConsequences: {
      shortTerm:
        "Engine oil doesn't circulate, causing dry-start wear; battery discharges and may not crank the engine",
      longTerm:
        "Generator fails to start during power outage when needed most; fuel system gums up from stale fuel; internal corrosion from moisture accumulation",
      costOfNeglect:
        "A generator that won't start during a multi-day outage means spoiled food ($300-$500), frozen pipes in winter ($5,000-$20,000), and sump pump failure leading to basement flooding ($10,000+).",
    },
    safetyNotes: [
      "Never run a portable generator indoors or in an enclosed space — carbon monoxide is lethal",
      "Standby generators have permanent outdoor installations with proper exhaust routing, but verify exhaust is not blowing toward windows or air intakes",
      "Keep the area around the generator clear of debris, leaves, and snow (2 feet minimum clearance)",
    ],
    seasonalRelevance: ["spring", "summer", "fall", "winter"],
    priority: "high" as const,
    tags: [
      "generator",
      "exercise",
      "monthly",
      "diy",
      "standby-power",
      "electrical",
    ],
  },
  {
    key: "elec_gen_002",
    componentTemplateKey: "generator_standby",
    systemCategory: "electrical",
    name: "Generator Annual Oil and Filter Change",
    description:
      "Change the engine oil, oil filter, and air filter on the standby generator per manufacturer specifications. Like any internal combustion engine, regular oil changes are essential for longevity.",
    whyItMatters:
      "Standby generators run at a constant speed under heavy load — much harder duty than a car engine. Dirty oil breaks down faster under these conditions. Most manufacturers specify oil changes every 100-200 running hours OR annually, whichever comes first. Even with minimal runtime, oil degrades from moisture and oxidation over 12 months.",
    instructions: [
      "Turn off the generator and disconnect it from automatic start (set to OFF or MANUAL to prevent accidental start during service)",
      "Let the engine cool if it was recently running (at least 15 minutes)",
      "Locate the oil drain plug and place a drain pan underneath",
      "Remove the drain plug and allow oil to drain completely (5-10 minutes)",
      "While oil is draining, remove and replace the oil filter — apply a thin film of new oil to the new filter gasket",
      "Reinstall the drain plug with a new washer if applicable",
      "Fill with the manufacturer-specified oil type and quantity (typically 10W-30 or 5W-30 synthetic)",
      "Check the dipstick — fill to the full mark but do not overfill",
      "Remove the air filter cover and replace the air filter element",
      "For liquid-cooled generators, check the coolant level and top off if needed",
      "Check and replace the spark plug(s) if at the recommended interval",
      "Return the generator to AUTO mode so it responds to power outages",
      "Log the service with date, hours, oil type, and filter part numbers",
    ],
    frequency: {
      intervalMonths: 12,
      seasonalAdjustments: {
        note: "Annual oil change minimum. If the generator runs extensively (e.g., after a hurricane or extended outage), change oil after every 100-200 hours of runtime per manufacturer specs.",
      },
      triggerConditions: [
        "After extended runtime (50+ hours during an outage)",
        "Oil appears dark or gritty on dipstick",
        "Low oil pressure warning on generator controller",
      ],
    },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 45,
    toolsRequired: [
      "socket set or wrench for drain plug",
      "oil filter wrench",
      "drain pan",
      "funnel",
      "rags or shop towels",
    ],
    materialsCost: { low: 30, high: 75 },
    professionalCost: { low: 200, high: 400 },
    skipConsequences: {
      shortTerm:
        "Dirty oil loses lubrication properties; engine runs hotter and less efficiently",
      longTerm:
        "Accelerated engine wear leading to premature failure; sludge buildup clogs oil passages; engine seizure during an extended outage when you need it most",
      costOfNeglect:
        "A $30-$75 oil change prevents a $3,000-$8,000 engine replacement. Generator engines are specialty items with long lead times.",
    },
    safetyNotes: [
      "CRITICAL: Set the generator to OFF or MANUAL before servicing — prevent accidental start while your hands are in the engine compartment",
      "Let the engine cool before draining oil to avoid burns",
      "Dispose of used oil at an auto parts store or recycling center — never pour down drains",
      "Return the generator to AUTO mode after service is complete",
    ],
    seasonalRelevance: ["spring"],
    priority: "high" as const,
    tags: [
      "generator",
      "oil-change",
      "annual",
      "diy",
      "engine-maintenance",
      "electrical",
    ],
  },
  {
    key: "elec_gen_003",
    componentTemplateKey: "generator_standby",
    systemCategory: "electrical",
    name: "Inspect Generator Fuel System",
    description:
      "Inspect the fuel supply system for your standby generator — natural gas line connections, propane tank levels and regulators, or diesel fuel quality and tank integrity. Fuel issues are the #2 cause of generator no-start after battery failure.",
    whyItMatters:
      "Natural gas generators depend on the gas utility staying operational (which it usually does during storms). Propane generators depend on having fuel in the tank. Diesel generators depend on clean, fresh fuel. In all cases, fuel system leaks, regulator failures, or supply issues mean no power when the grid goes down.",
    instructions: [
      "For NATURAL GAS generators: verify the gas shutoff valve to the generator is in the OPEN position",
      "Check all visible gas line connections for corrosion or damage",
      "Use a gas leak detector solution (soapy water) on accessible fittings — bubbles indicate a leak",
      "For PROPANE generators: check the tank gauge — maintain at least 30% minimum for emergency readiness",
      "Inspect the propane regulator for damage, spider webs (spiders love regulators), and proper venting",
      "Verify the propane tank shutoff valve operates smoothly",
      "For DIESEL generators: check the fuel level in the tank",
      "Inspect diesel fuel for water contamination (use a fuel sampling pump or water-detection paste)",
      "Check fuel filters for discoloration or restriction",
      "Add diesel fuel stabilizer if the fuel is older than 6 months",
      "For all fuel types: inspect the fuel line from the supply to the generator for damage, kinks, or animal chewing",
      "Verify the fuel supply can deliver adequate flow for full-load operation",
    ],
    frequency: {
      intervalMonths: 6,
      seasonalAdjustments: {
        note: "Inspect in spring (before storm season) and fall (before winter storms). For propane, check tank level monthly during winter.",
      },
      triggerConditions: [
        "Generator fails to start or runs rough",
        "Smell of gas near the generator",
        "After seismic activity",
        "Propane tank gauge below 30%",
      ],
    },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 20,
    toolsRequired: [
      "gas leak detection solution or electronic gas sniffer",
      "flashlight",
      "fuel sampling supplies (for diesel)",
    ],
    materialsCost: { low: 0, high: 25 },
    professionalCost: { low: 100, high: 250 },
    skipConsequences: {
      shortTerm:
        "Gas leak goes undetected (safety hazard); low propane means the generator shuts down mid-outage; contaminated diesel causes engine damage",
      longTerm:
        "GAS LEAK RISK — undetected gas leaks near ignition sources are explosive; diesel fuel degradation requires expensive fuel system cleaning ($500-$1,500); propane regulator failure means no fuel delivery",
      costOfNeglect:
        "A $100-$250 fuel system inspection prevents no-start emergencies and potential gas leak hazards.",
    },
    safetyNotes: [
      "If you smell gas strongly near the generator, do NOT start it — leave the area and call your gas utility or propane supplier immediately",
      "Never use an open flame to check for gas leaks — use soapy water or an electronic gas sniffer",
      "Propane is heavier than air and pools in low areas — check for leaks at ground level",
      "Diesel fuel is flammable — keep away from ignition sources during inspection",
    ],
    seasonalRelevance: ["spring", "fall"],
    priority: "high" as const,
    tags: [
      "generator",
      "fuel-system",
      "semi-annual",
      "diy",
      "safety",
      "electrical",
    ],
  },

  // ================================================================
  // EV CHARGER  (componentTemplateKey: "ev_charger")
  // ================================================================
  {
    key: "elec_evc_001",
    componentTemplateKey: "ev_charger",
    systemCategory: "electrical",
    name: "Inspect and Clean EV Charger",
    description:
      "Inspect the Level 2 EV charger connector, cable, mounting, and indicator lights. Clean the connector contacts and check for physical damage from outdoor exposure, UV degradation, and daily use.",
    whyItMatters:
      "EV charger cables are handled daily — plugged and unplugged, sometimes in rain, snow, or extreme heat. The connector pins carry 30-50 amps and must make clean contact every time. Corroded or damaged contacts create resistance, which creates heat, which can melt the connector or the vehicle's charge port — a $500-$2,000 repair on the vehicle side.",
    instructions: [
      "Unplug the charger from the vehicle and ensure the charger is in standby (not actively charging)",
      "Inspect the charging connector (J1772 or NACS) for bent, corroded, or blackened pins",
      "Check the connector housing for cracks, chips, or melting",
      "Clean the connector pins with a dry, lint-free cloth — do not use water or solvents",
      "Use compressed air to blow out any debris from the connector receptacle",
      "Inspect the entire length of the charging cable for cuts, abrasion, kinks, or exposed wiring",
      "Check the cable strain relief where it enters the charger unit and the connector — this is the most common failure point",
      "Verify the charger's indicator lights show normal status (green/ready — refer to manufacturer manual)",
      "Check the wall-mount bracket or pedestal for looseness or damage",
      "For outdoor installations, verify the NEMA enclosure rating is intact — check door gaskets and weatherproofing",
      "Clean the charger housing exterior with a damp cloth",
      "Test a full charge cycle to verify proper operation and confirm the vehicle accepts the full charge rate",
    ],
    frequency: {
      intervalMonths: 6,
      seasonalAdjustments: {
        note: "Semi-annual inspection. Monthly visual checks of the connector are recommended for outdoor installations.",
      },
      triggerConditions: [
        "Charging slower than usual",
        "Error messages on charger or vehicle",
        "Visible damage to connector or cable",
        "Charger exposed to flooding or storm damage",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 15,
    toolsRequired: [
      "lint-free cloth",
      "compressed air (optional)",
      "flashlight",
    ],
    materialsCost: { low: 0, high: 5 },
    professionalCost: { low: 75, high: 200 },
    skipConsequences: {
      shortTerm:
        "Corroded connector pins cause intermittent charging failures; dirty contacts increase resistance and heat buildup",
      longTerm:
        "Melted connector damages both the charger AND the vehicle charge port ($500-$2,000 vehicle repair); cable insulation failure from UV or physical damage creates shock hazard; water intrusion into outdoor units causes ground faults",
      costOfNeglect:
        "A $15 inspection prevents a $500-$2,000 vehicle charge port repair and $300-$800 charger replacement.",
    },
    safetyNotes: [
      "Always ensure the charger is not actively charging before inspecting the connector",
      "Never use water or liquid cleaners on the connector pins",
      "If the connector pins are blackened or melted, stop using the charger and have it professionally inspected",
      "EV charger circuits should be on a dedicated breaker — verify it has not been shared with other loads",
    ],
    seasonalRelevance: ["spring", "fall"],
    priority: "medium" as const,
    tags: [
      "ev-charger",
      "connector",
      "inspection",
      "diy",
      "semi-annual",
      "electrical",
    ],
  },

  // ================================================================
  // SMOKE DETECTORS  (componentTemplateKey: "smoke_detectors")
  // ================================================================
  {
    key: "elec_smkd_001",
    componentTemplateKey: "smoke_detectors",
    systemCategory: "electrical",
    name: "Test Smoke and CO Detectors Monthly",
    description:
      "Press the TEST button on every smoke detector and carbon monoxide detector in the home to verify the alarm sounds. Confirm all units are powered (hardwired indicator light or battery status).",
    whyItMatters:
      "Working smoke detectors cut the risk of dying in a home fire by 55% (NFPA). But a detector with dead batteries or a failed sensor provides zero protection. The test button verifies the horn works and the electronics are functional. It takes 2 minutes to walk through your home and press every button — do it when you test your GFCI outlets.",
    instructions: [
      "Walk through every room and hallway — there should be a smoke detector in every bedroom, outside each sleeping area, and on every level of the home",
      "For each detector, press and hold the TEST button until the alarm sounds (usually 3-5 seconds)",
      "The alarm should be loud and clear — if weak or intermittent, replace the batteries or the unit",
      "For hardwired detectors with battery backup, check the power indicator LED (usually green)",
      "If pressing TEST produces no sound, try replacing the batteries first",
      "If new batteries don't fix it, the detector has failed and must be replaced immediately",
      "For interconnected detectors (hardwired), verify that triggering one unit causes all units to alarm",
      "Check for CO detectors near bedrooms and on every level — test these the same way",
      "Check the manufacture date on the back of each unit (printed on a label)",
      "Replace smoke detectors older than 10 years and CO detectors older than 5-7 years, regardless of test results",
    ],
    frequency: {
      intervalMonths: 1,
      seasonalAdjustments: {
        note: "Monthly testing recommended by NFPA and all detector manufacturers. Pair with GFCI testing for a quick 5-minute monthly safety check.",
      },
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 10,
    toolsRequired: ["none — just press the TEST button on each unit"],
    materialsCost: { low: 0, high: 0 },
    professionalCost: { low: 0, high: 0 },
    skipConsequences: {
      shortTerm:
        "A non-functional detector provides zero warning — you won't know until a fire or CO event occurs",
      longTerm:
        "LIFE SAFETY RISK — the risk of dying in a home fire doubles without working smoke detectors; CO detectors with dead batteries provide no warning of carbon monoxide leaks",
      costOfNeglect:
        "Working smoke detectors reduce the risk of death in a home fire by 55%. Testing takes 2 minutes and costs nothing.",
    },
    safetyNotes: [
      "This is the single most important safety check in your home",
      "If any detector fails testing, replace it immediately — do not wait",
      "Warn household members before testing so the alarm doesn't cause panic",
      "If your detectors are more than 10 years old, replace all of them now — the sensors degrade over time",
    ],
    seasonalRelevance: ["spring", "summer", "fall", "winter"],
    priority: "critical" as const,
    tags: [
      "smoke-detector",
      "co-detector",
      "fire-safety",
      "monthly",
      "diy",
      "life-safety",
      "electrical",
    ],
  },
  {
    key: "elec_smkd_002",
    componentTemplateKey: "smoke_detectors",
    systemCategory: "electrical",
    name: "Replace Smoke Detector Batteries",
    description:
      "Replace batteries in all battery-powered and battery-backup smoke and CO detectors. For units with sealed 10-year lithium batteries, verify the unit is still within its service life.",
    whyItMatters:
      "The annoying 3 AM chirp from a low battery leads most people to pull the battery — and then never replace it. The NFPA reports that nearly one-quarter of smoke detector failures are due to dead or missing batteries. Replace proactively twice a year when you change your clocks for daylight saving time, and you'll never hear that midnight chirp.",
    instructions: [
      "Gather the correct batteries — most detectors use 9V or AA (check your model)",
      "For each detector, twist or slide the unit off its mounting plate",
      "Open the battery compartment and remove the old batteries",
      "Insert fresh, high-quality alkaline or lithium batteries with correct polarity",
      "Reattach the detector to the mounting plate — most twist to lock",
      "Press the TEST button to verify the new battery powers the unit and the alarm sounds",
      "For 10-year sealed lithium battery units, check the manufacture date stamped on the back",
      "If a sealed unit is older than 10 years, replace the entire detector (battery is not replaceable)",
      "For hardwired units with battery backup, the backup battery still needs replacement even though the unit has AC power",
      "Write the battery replacement date on a small label or directly on the detector housing",
      "Dispose of old batteries properly — many hardware stores accept batteries for recycling",
    ],
    frequency: {
      intervalMonths: 6,
      seasonalAdjustments: {
        note: "Replace batteries every 6 months — use daylight saving time changes (March and November) as your reminder. For 10-year sealed battery units, replace the entire unit at the 10-year mark.",
      },
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 15,
    toolsRequired: ["step stool or ladder", "replacement batteries (9V or AA)"],
    materialsCost: { low: 5, high: 20 },
    professionalCost: { low: 0, high: 0 },
    skipConsequences: {
      shortTerm:
        "Low battery chirping leads to battery removal — leaving the detector non-functional; false sense of security from a detector with no battery",
      longTerm:
        "LIFE SAFETY RISK — a smoke detector without a working battery provides zero protection; 24% of smoke detector failures are due to dead or missing batteries (NFPA)",
      costOfNeglect:
        "Batteries cost $5-$20 for the entire home. There is no acceptable excuse for dead smoke detector batteries.",
    },
    safetyNotes: [
      "Replace batteries proactively — don't wait for the low-battery chirp",
      "Use the daylight saving time change as your twice-yearly reminder",
      "Never remove a battery to stop chirping without replacing it immediately",
      "10-year sealed lithium battery units should be replaced entirely at 10 years — do not attempt to open them",
    ],
    seasonalRelevance: ["spring", "fall"],
    priority: "critical" as const,
    tags: [
      "smoke-detector",
      "batteries",
      "fire-safety",
      "semi-annual",
      "diy",
      "life-safety",
      "electrical",
    ],
  },

  // ================================================================
  // CEILING FANS  (componentTemplateKey: "ceiling_fans")
  // ================================================================
  {
    key: "elec_cfan_001",
    componentTemplateKey: "ceiling_fans",
    systemCategory: "electrical",
    name: "Clean, Balance, and Reverse Ceiling Fan",
    description:
      "Clean the fan blades and motor housing, check for wobble and balance issues, and reverse the blade direction seasonally — counterclockwise in summer (downdraft for cooling) and clockwise in winter (updraft to redistribute warm air from the ceiling).",
    whyItMatters:
      "Dusty fan blades fling dust throughout the room every time the fan runs — aggravating allergies and coating furniture. A wobbling fan isn't just annoying — it stresses the mounting bracket and electrical box, and a fan that falls from the ceiling is a serious injury and liability risk. Reversing direction seasonally can save 10-15% on heating costs by pushing warm ceiling air back down.",
    instructions: [
      "Turn off the fan and wait for blades to stop completely",
      "Place a drop cloth or old sheet under the fan to catch falling dust",
      "Use a damp microfiber cloth or a pillowcase slipped over each blade to clean both sides simultaneously",
      "For heavy buildup, use a mild all-purpose cleaner sprayed onto the cloth (not the blade — drips can damage the motor)",
      "Wipe down the motor housing and any light fixtures",
      "Turn the fan on medium speed and observe for wobble",
      "If the fan wobbles, use a fan balancing kit (usually included with the fan or $5 at hardware stores)",
      "Attach the clip-on balancing weight to each blade one at a time, running the fan to find which blade is unbalanced",
      "Once identified, apply the adhesive balancing weight to the top center of the offending blade",
      "Check the blade screws (where blade attaches to blade iron) — tighten if loose",
      "Check the mounting screws at the ceiling bracket — tighten if loose",
      "Locate the direction switch on the motor housing (small toggle switch)",
      "Set to COUNTERCLOCKWISE for summer (you should feel a breeze directly below)",
      "Set to CLOCKWISE for winter (fan gently pushes air up, redistributing warm air without a draft)",
      "Verify the fan runs smoothly at all speed settings",
    ],
    frequency: {
      intervalMonths: 6,
      seasonalAdjustments: {
        note: "Clean and reverse direction twice per year — spring (switch to counterclockwise for summer) and fall (switch to clockwise for winter). Clean more often in dusty environments.",
      },
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 20,
    toolsRequired: [
      "step stool or ladder",
      "microfiber cloth or old pillowcase",
      "screwdriver",
      "fan balancing kit (if wobbling)",
    ],
    materialsCost: { low: 0, high: 10 },
    professionalCost: { low: 50, high: 100 },
    skipConsequences: {
      shortTerm:
        "Dusty blades spread allergens throughout the room; wobbling creates annoying noise and vibration",
      longTerm:
        "Severe wobble stresses the mounting bracket and ceiling electrical box — a falling fan is a serious injury risk; running in the wrong direction wastes energy (summer clockwise pushes warm air down from the ceiling)",
      costOfNeglect:
        "Reversing direction seasonally can save 10-15% on heating costs. A $5 balancing kit fixes wobble that could otherwise lead to a fan falling from the ceiling.",
    },
    safetyNotes: [
      "Ensure the fan is OFF and fully stopped before cleaning — fan blades can cause serious hand injuries",
      "Use a stable step stool — never stand on chairs or unstable surfaces",
      "If the fan wobbles severely or the mounting bracket is visibly loose from the ceiling, stop using the fan and have an electrician verify the mounting box is rated for fan support (standard outlet boxes are NOT rated for fans)",
      "Ceiling fans must be mounted to fan-rated electrical boxes — if you hear creaking or see movement at the ceiling mount, call an electrician",
    ],
    seasonalRelevance: ["spring", "fall"],
    priority: "medium" as const,
    tags: [
      "ceiling-fan",
      "cleaning",
      "balancing",
      "seasonal",
      "diy",
      "semi-annual",
      "energy-savings",
      "electrical",
    ],
  },
];

export const seed = internalMutation({
  handler: async (ctx) => {
    let inserted = 0;
    let skipped = 0;

    for (const task of electricalMaintenanceTasks) {
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
      `[tasks_electrical] Seeded ${inserted} electrical maintenance tasks (${skipped} already existed)`
    );
    return { inserted, skipped, total: electricalMaintenanceTasks.length };
  },
});
