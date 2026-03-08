// Comprehensive Maintenance Task Templates
// Organized by system category for institutional-level coverage

export interface MaintenanceTemplate {
  systemTypeName: string;
  name: string;
  description: string;
  quickSkim: string[];
  frequencyMonths: number;
  priority: "critical" | "high" | "medium" | "low" | "routine";
  difficulty: "easy" | "moderate" | "hard" | "pro_only";
  estimatedTimeMinutes: number;
  diyCostLow: number;
  diyCostHigh: number;
  proCostLow: number;
  proCostHigh: number;
  diySteps: string[];
  commonMistakes: string[];
  whenToCallPro: string[];
  healthImpactIfSkipped: number;
  // New fields
  seasonPreference?: "spring" | "summer" | "fall" | "winter" | "any";
  optimalMonths?: number[];
  requiredTools?: string[];
  requiredMaterials?: { name: string; estimatedCost?: number }[];
  safetyWarnings?: string[];
  safetyLevel?: "safe" | "caution" | "danger";
  deepDiveContent?: {
    whyItMatters: string;
    scienceBehind?: string;
    failureModes?: string[];
    proTips?: string[];
  };
  urgencyByAge?: {
    baseUrgency: number;
    increasePerYear: number;
    maxMultiplier: number;
  };
}

// ============================================
// HVAC MAINTENANCE TEMPLATES
// ============================================
export const hvacTemplates: MaintenanceTemplate[] = [
  // Central Air Conditioner
  {
    systemTypeName: "Central Air Conditioner",
    name: "Replace HVAC Filter",
    description: "Replace the air filter to maintain airflow and efficiency",
    quickSkim: [
      "Check filter size on old filter or manual",
      "Slide out old filter, note airflow direction arrow",
      "Insert new filter with arrow pointing toward unit",
      "Set reminder for next replacement"
    ],
    frequencyMonths: 3,
    priority: "medium",
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCostLow: 5,
    diyCostHigh: 25,
    proCostLow: 75,
    proCostHigh: 150,
    diySteps: [
      "Turn off HVAC system at thermostat",
      "Locate the filter - usually in return air duct, air handler, or furnace",
      "Note the filter size printed on the frame (e.g., 16x25x1)",
      "Note the airflow direction arrow on the current filter",
      "Slide out the old filter",
      "Inspect the old filter - if it's dark gray/black, you waited too long",
      "Insert new filter with airflow arrow pointing toward the blower/furnace",
      "Turn system back on",
      "Write the date on the filter frame for tracking"
    ],
    commonMistakes: [
      "Installing filter backwards (arrow should point toward unit)",
      "Using wrong size filter that doesn't seal properly",
      "Forgetting to turn system off during replacement",
      "Waiting too long between replacements (change monthly if you have pets)"
    ],
    whenToCallPro: [
      "If you can't locate the filter",
      "If the filter housing is damaged or missing",
      "If system makes unusual noises after filter change",
      "If you notice reduced airflow even with new filter"
    ],
    healthImpactIfSkipped: 0.05,
    seasonPreference: "any",
    requiredTools: ["None required"],
    requiredMaterials: [{ name: "HVAC filter (check size)", estimatedCost: 15 }],
    safetyWarnings: ["Turn off system before changing filter"],
    safetyLevel: "safe",
    deepDiveContent: {
      whyItMatters: "A dirty filter restricts airflow, forcing your system to work harder. This increases energy bills by 5-15% and accelerates wear on the compressor and blower motor.",
      scienceBehind: "Filters capture particles 0.3-10 microns in size. As they load with debris, static pressure increases across the filter. When pressure drop exceeds 0.5 inches water column, efficiency drops significantly.",
      failureModes: [
        "Frozen evaporator coil from restricted airflow",
        "Compressor overheating and premature failure",
        "Blower motor burnout from increased load"
      ],
      proTips: [
        "Higher MERV ratings (11-13) catch more particles but may restrict airflow in older systems",
        "Check filter monthly during peak usage seasons",
        "Consider a filter subscription service for automatic delivery"
      ]
    },
    urgencyByAge: { baseUrgency: 1.0, increasePerYear: 0.02, maxMultiplier: 1.3 }
  },
  {
    systemTypeName: "Central Air Conditioner",
    name: "Annual AC Tune-Up",
    description: "Professional inspection and maintenance of air conditioning system",
    quickSkim: [
      "Schedule in spring before cooling season",
      "Pro checks refrigerant, electrical, and mechanical components",
      "Includes coil cleaning and system optimization",
      "Typically 1-2 hours, catches problems early"
    ],
    frequencyMonths: 12,
    priority: "high",
    difficulty: "pro_only",
    estimatedTimeMinutes: 90,
    diyCostLow: 0,
    diyCostHigh: 0,
    proCostLow: 100,
    proCostHigh: 200,
    diySteps: [],
    commonMistakes: [
      "Skipping annual maintenance to save money",
      "Waiting until something breaks to call a pro",
      "Not addressing small issues found during tune-up"
    ],
    whenToCallPro: [
      "This is a professional-only task",
      "Schedule 2-4 weeks before cooling season starts"
    ],
    healthImpactIfSkipped: 0.08,
    seasonPreference: "spring",
    optimalMonths: [3, 4, 5],
    safetyLevel: "safe",
    deepDiveContent: {
      whyItMatters: "Annual maintenance can extend system life by 5+ years and improve efficiency by 10-25%. It also validates manufacturer warranties that often require documented annual service.",
      scienceBehind: "Refrigerant charge, electrical connections, and mechanical components all degrade over time. A 10% refrigerant undercharge reduces efficiency by 20%. Loose electrical connections cause resistance heating that damages components.",
      failureModes: [
        "Compressor failure from low refrigerant",
        "Electrical fire from loose connections",
        "Complete system breakdown on hottest day of year"
      ],
      proTips: [
        "Ask for a written report of all findings",
        "Get quotes for any recommended repairs before authorizing",
        "Schedule at the same time each year for consistent tracking"
      ]
    },
    urgencyByAge: { baseUrgency: 1.0, increasePerYear: 0.05, maxMultiplier: 1.5 }
  },
  {
    systemTypeName: "Central Air Conditioner",
    name: "Clean Condenser Coils",
    description: "Remove debris from outdoor unit coils to maintain heat transfer efficiency",
    quickSkim: [
      "Turn off power at disconnect box",
      "Remove large debris by hand",
      "Spray coils with garden hose from inside out",
      "Allow to dry before restoring power"
    ],
    frequencyMonths: 12,
    priority: "medium",
    difficulty: "moderate",
    estimatedTimeMinutes: 45,
    diyCostLow: 0,
    diyCostHigh: 20,
    proCostLow: 100,
    proCostHigh: 200,
    diySteps: [
      "Turn off power at the outdoor disconnect box (pull the disconnect)",
      "Remove any visible debris (leaves, grass clippings, twigs) from around unit",
      "Use a soft brush to gently remove debris from fins",
      "Spray coils with garden hose from inside out (not a pressure washer)",
      "Apply coil cleaner if coils are heavily soiled (follow product directions)",
      "Straighten any bent fins with a fin comb",
      "Clear 2-foot radius around unit of vegetation",
      "Restore power at disconnect box"
    ],
    commonMistakes: [
      "Using a pressure washer (damages fins)",
      "Spraying from outside in (pushes debris deeper)",
      "Forgetting to turn off power first",
      "Bending fins with too much pressure"
    ],
    whenToCallPro: [
      "If fins are severely bent or damaged",
      "If you notice refrigerant leak signs (ice, hissing)",
      "If system still struggles after cleaning"
    ],
    healthImpactIfSkipped: 0.06,
    seasonPreference: "spring",
    optimalMonths: [3, 4, 5],
    requiredTools: ["Garden hose", "Soft brush", "Fin comb (optional)"],
    requiredMaterials: [{ name: "Coil cleaner (optional)", estimatedCost: 12 }],
    safetyWarnings: [
      "Always turn off power at disconnect before cleaning",
      "Wear safety glasses to protect from debris"
    ],
    safetyLevel: "caution",
    deepDiveContent: {
      whyItMatters: "Dirty condenser coils can increase energy consumption by 30% and cause compressor failure. The outdoor unit must reject heat efficiently - debris acts as insulation preventing this.",
      scienceBehind: "Condenser coils transfer heat from refrigerant to outdoor air. Thermal resistance increases with debris buildup. A 1°F increase in condensing temperature raises energy use by 2%.",
      failureModes: [
        "Compressor overheating from high head pressure",
        "Reduced cooling capacity",
        "Premature compressor failure"
      ],
      proTips: [
        "Clean in spring before peak cooling season",
        "Consider a coil guard to reduce debris accumulation",
        "Keep landscaping 2+ feet from unit"
      ]
    },
    urgencyByAge: { baseUrgency: 1.0, increasePerYear: 0.03, maxMultiplier: 1.4 }
  },
  {
    systemTypeName: "Central Air Conditioner",
    name: "Clear Condensate Drain Line",
    description: "Flush the AC drain line to prevent clogs and water damage",
    quickSkim: [
      "Locate drain line near indoor unit (PVC pipe)",
      "Pour 1 cup vinegar or bleach down access point",
      "Wait 30 minutes, then flush with water",
      "Check outdoor drain for flow"
    ],
    frequencyMonths: 6,
    priority: "medium",
    difficulty: "easy",
    estimatedTimeMinutes: 15,
    diyCostLow: 0,
    diyCostHigh: 5,
    proCostLow: 75,
    proCostHigh: 150,
    diySteps: [
      "Locate the condensate drain line - typically a PVC pipe near the indoor unit",
      "Find the access point (usually a T-fitting or cap)",
      "Remove the cap or access cover",
      "Pour 1 cup of distilled white vinegar or diluted bleach down the drain",
      "Wait 30 minutes for the solution to work",
      "Flush with warm water (about 1 gallon)",
      "Go outside and verify water is draining from the line exit",
      "Replace the access cap"
    ],
    commonMistakes: [
      "Using too much bleach (can damage PVC over time)",
      "Not flushing with water after treatment",
      "Ignoring warning signs like water near indoor unit"
    ],
    whenToCallPro: [
      "If drain is completely clogged and won't clear",
      "If you see water damage near indoor unit",
      "If drain pan is overflowing"
    ],
    healthImpactIfSkipped: 0.04,
    seasonPreference: "spring",
    optimalMonths: [3, 4, 9],
    requiredTools: ["None required"],
    requiredMaterials: [{ name: "Distilled white vinegar", estimatedCost: 3 }],
    safetyLevel: "safe",
    deepDiveContent: {
      whyItMatters: "A clogged drain can cause water damage to ceilings, walls, and floors. It can also trigger the safety float switch, shutting down your AC on hot days.",
      scienceBehind: "The evaporator coil produces 5-20 gallons of condensate per day in humid conditions. Algae and mold thrive in this moist environment, creating biofilm that eventually clogs the drain.",
      failureModes: [
        "Water damage to home structure",
        "Mold growth in and around HVAC system",
        "AC shutdown from float switch activation"
      ],
      proTips: [
        "Install condensate drain pan tablets for continuous treatment",
        "Check drain monthly during cooling season",
        "Consider a drain line cleaning kit with brush attachment"
      ]
    }
  },
  {
    systemTypeName: "Central Air Conditioner",
    name: "Inspect Refrigerant Lines",
    description: "Check insulation on refrigerant lines and look for damage",
    quickSkim: [
      "Visually inspect copper lines from outdoor to indoor unit",
      "Check foam insulation for damage or gaps",
      "Look for oil stains indicating leaks",
      "Feel for ice buildup (indicates problems)"
    ],
    frequencyMonths: 12,
    priority: "medium",
    difficulty: "easy",
    estimatedTimeMinutes: 15,
    diyCostLow: 0,
    diyCostHigh: 20,
    proCostLow: 75,
    proCostHigh: 150,
    diySteps: [
      "Locate the two copper refrigerant lines connecting outdoor and indoor units",
      "The larger line (suction line) should be insulated with foam",
      "Visually inspect insulation for cracks, gaps, or missing sections",
      "Check for oil stains around connections (indicates refrigerant leak)",
      "Feel the insulated line during operation - should be cool, not frozen",
      "Replace any damaged insulation with foam pipe insulation",
      "Report any oil stains to HVAC technician"
    ],
    commonMistakes: [
      "Ignoring damaged insulation",
      "Missing oil stain signs of refrigerant leaks",
      "Not reporting ice buildup to a professional"
    ],
    whenToCallPro: [
      "If you see oil stains (refrigerant leak)",
      "If lines are frozen (multiple causes, all need diagnosis)",
      "If you suspect damage from animals or weather"
    ],
    healthImpactIfSkipped: 0.03,
    seasonPreference: "spring",
    optimalMonths: [3, 4, 5],
    requiredTools: ["Flashlight"],
    requiredMaterials: [{ name: "Foam pipe insulation (if needed)", estimatedCost: 10 }],
    safetyLevel: "safe",
    deepDiveContent: {
      whyItMatters: "Damaged insulation wastes energy and can cause condensation that damages ceilings. Refrigerant leaks harm the environment and cause expensive compressor damage.",
      scienceBehind: "The suction line carries cold refrigerant (around 40°F). Without insulation, it absorbs heat from surroundings, reducing system efficiency and causing condensation.",
      failureModes: [
        "Energy waste from uninsulated lines",
        "Water damage from condensation",
        "Compressor failure from refrigerant loss"
      ]
    }
  },

  // Gas Furnace
  {
    systemTypeName: "Gas Furnace",
    name: "Annual Furnace Tune-Up",
    description: "Professional inspection of gas furnace before heating season",
    quickSkim: [
      "Schedule in fall before heating season",
      "Pro checks heat exchanger, burners, and safety controls",
      "Includes combustion analysis and carbon monoxide check",
      "Critical for safety and efficiency"
    ],
    frequencyMonths: 12,
    priority: "critical",
    difficulty: "pro_only",
    estimatedTimeMinutes: 90,
    diyCostLow: 0,
    diyCostHigh: 0,
    proCostLow: 100,
    proCostHigh: 200,
    diySteps: [],
    commonMistakes: [
      "Skipping annual maintenance",
      "Waiting until furnace fails to call a pro",
      "Not having carbon monoxide detectors installed"
    ],
    whenToCallPro: [
      "This is a professional-only task",
      "Schedule 4-6 weeks before heating season"
    ],
    healthImpactIfSkipped: 0.10,
    seasonPreference: "fall",
    optimalMonths: [9, 10],
    safetyWarnings: [
      "Never attempt to repair gas furnace components yourself",
      "Install CO detectors on every level of home"
    ],
    safetyLevel: "danger",
    deepDiveContent: {
      whyItMatters: "A cracked heat exchanger can leak carbon monoxide into your home - a deadly, odorless gas. Annual inspection is the only way to detect this before it becomes dangerous.",
      scienceBehind: "The heat exchanger undergoes thermal stress with every heating cycle, expanding and contracting. Over time, this causes metal fatigue and potential cracks. Combustion gases (including CO) can then mix with household air.",
      failureModes: [
        "Carbon monoxide poisoning from cracked heat exchanger",
        "Gas leak from failed connections",
        "Complete heating failure on coldest day"
      ],
      proTips: [
        "Always get a combustion analysis report",
        "Ask about heat exchanger condition specifically",
        "Consider a maintenance agreement for priority service"
      ]
    },
    urgencyByAge: { baseUrgency: 1.0, increasePerYear: 0.08, maxMultiplier: 2.0 }
  },
  {
    systemTypeName: "Gas Furnace",
    name: "Replace Furnace Filter",
    description: "Replace the air filter to maintain airflow and efficiency",
    quickSkim: [
      "Same filter as AC if you have central air",
      "Check monthly during heating season",
      "Replace when visibly dirty",
      "More frequent with pets or allergies"
    ],
    frequencyMonths: 3,
    priority: "medium",
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCostLow: 5,
    diyCostHigh: 25,
    proCostLow: 75,
    proCostHigh: 150,
    diySteps: [
      "Turn off furnace at thermostat",
      "Locate filter (usually in return duct or furnace cabinet)",
      "Note filter size and airflow direction arrow",
      "Remove old filter",
      "Insert new filter with arrow pointing toward furnace",
      "Turn furnace back on"
    ],
    commonMistakes: [
      "Installing filter backwards",
      "Using wrong size filter",
      "Waiting too long between changes"
    ],
    whenToCallPro: [
      "If you can't locate the filter",
      "If furnace makes unusual noises after filter change"
    ],
    healthImpactIfSkipped: 0.05,
    seasonPreference: "any",
    requiredMaterials: [{ name: "Furnace filter", estimatedCost: 15 }],
    safetyLevel: "safe"
  },
  {
    systemTypeName: "Gas Furnace",
    name: "Test Carbon Monoxide Detectors",
    description: "Test all CO detectors and replace batteries",
    quickSkim: [
      "Press test button on each detector",
      "Replace batteries annually",
      "Replace detector every 5-7 years",
      "Install on every level of home"
    ],
    frequencyMonths: 6,
    priority: "critical",
    difficulty: "easy",
    estimatedTimeMinutes: 15,
    diyCostLow: 0,
    diyCostHigh: 30,
    proCostLow: 75,
    proCostHigh: 150,
    diySteps: [
      "Locate all CO detectors in your home",
      "Press and hold the test button on each detector",
      "Confirm alarm sounds (if not, replace batteries or unit)",
      "Check manufacture date - replace units older than 5-7 years",
      "Replace batteries (most need annual replacement)",
      "Vacuum dust from detector vents"
    ],
    commonMistakes: [
      "Only having one CO detector for entire home",
      "Ignoring low battery warnings",
      "Not replacing old detectors"
    ],
    whenToCallPro: [
      "If detector keeps alarming after battery replacement",
      "If you smell gas or suspect CO leak - LEAVE and call 911"
    ],
    healthImpactIfSkipped: 0.02,
    seasonPreference: "fall",
    optimalMonths: [10, 11],
    requiredMaterials: [{ name: "9V batteries (or lithium)", estimatedCost: 10 }],
    safetyWarnings: [
      "If CO detector alarms, leave home immediately and call 911",
      "Never ignore a CO detector alarm"
    ],
    safetyLevel: "safe",
    deepDiveContent: {
      whyItMatters: "Carbon monoxide is odorless and colorless. Working detectors are your only protection against this silent killer. Approximately 400 Americans die from unintentional CO poisoning annually.",
      failureModes: [
        "CO poisoning from undetected furnace leak",
        "Detector failure from dead batteries",
        "Expired detector not functioning properly"
      ]
    }
  },
  {
    systemTypeName: "Gas Furnace",
    name: "Clean Furnace Burners",
    description: "Remove dust and debris from gas burner assembly",
    quickSkim: [
      "Pro-recommended but DIY possible for experienced homeowners",
      "Shut off gas and power first",
      "Use vacuum to remove dust from burners",
      "Inspect flame color (should be blue)"
    ],
    frequencyMonths: 24,
    priority: "medium",
    difficulty: "moderate",
    estimatedTimeMinutes: 45,
    diyCostLow: 0,
    diyCostHigh: 10,
    proCostLow: 100,
    proCostHigh: 175,
    diySteps: [
      "Turn off gas supply at shutoff valve",
      "Turn off power to furnace at breaker",
      "Wait 30 minutes for furnace to cool",
      "Remove furnace access panel",
      "Locate burner assembly (tubes or ports where flame appears)",
      "Use soft brush to remove loose dust",
      "Vacuum around burners carefully (do not bend anything)",
      "Inspect burner ports for clogs",
      "Replace access panel",
      "Restore gas and power",
      "Test system and observe flame color (should be blue)"
    ],
    commonMistakes: [
      "Not shutting off gas before cleaning",
      "Bending or damaging burner components",
      "Using compressed air (can push debris into valves)"
    ],
    whenToCallPro: [
      "If flame is yellow or orange (indicates problem)",
      "If you smell gas after reassembly",
      "If you're uncomfortable working around gas"
    ],
    healthImpactIfSkipped: 0.04,
    seasonPreference: "fall",
    optimalMonths: [9, 10],
    requiredTools: ["Soft brush", "Vacuum with hose attachment", "Screwdriver"],
    safetyWarnings: [
      "Always shut off gas before working on burners",
      "Wait for furnace to cool completely",
      "If you smell gas, leave immediately and call utility company"
    ],
    safetyLevel: "danger"
  },

  // Heat Pump
  {
    systemTypeName: "Heat Pump",
    name: "Replace Heat Pump Filter",
    description: "Replace air filter for optimal heat pump performance",
    quickSkim: [
      "Same process as AC filter replacement",
      "More critical in heat pump - runs year-round",
      "Check monthly, replace every 1-3 months",
      "Clean filter = efficient operation"
    ],
    frequencyMonths: 3,
    priority: "medium",
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCostLow: 5,
    diyCostHigh: 25,
    proCostLow: 75,
    proCostHigh: 150,
    diySteps: [
      "Turn off heat pump at thermostat",
      "Locate filter in air handler or return duct",
      "Note filter size and airflow direction",
      "Remove old filter",
      "Insert new filter with arrow toward air handler",
      "Turn system back on"
    ],
    commonMistakes: [
      "Not changing filter frequently enough (heat pumps run more than AC-only systems)",
      "Installing filter backwards"
    ],
    whenToCallPro: [
      "If system shows error codes",
      "If airflow seems restricted even with new filter"
    ],
    healthImpactIfSkipped: 0.05,
    seasonPreference: "any",
    requiredMaterials: [{ name: "Air filter", estimatedCost: 15 }],
    safetyLevel: "safe",
    deepDiveContent: {
      whyItMatters: "Heat pumps run year-round for both heating and cooling, making filter maintenance even more critical than AC-only systems. A dirty filter in heating mode can cause the system to rely more on expensive auxiliary heat."
    }
  },
  {
    systemTypeName: "Heat Pump",
    name: "Annual Heat Pump Tune-Up",
    description: "Professional maintenance for both heating and cooling modes",
    quickSkim: [
      "Schedule twice yearly for optimal performance",
      "Spring for cooling, fall for heating",
      "Pro checks refrigerant, defrost cycle, and reversing valve",
      "Critical for efficiency and longevity"
    ],
    frequencyMonths: 12,
    priority: "high",
    difficulty: "pro_only",
    estimatedTimeMinutes: 90,
    diyCostLow: 0,
    diyCostHigh: 0,
    proCostLow: 125,
    proCostHigh: 225,
    diySteps: [],
    commonMistakes: [
      "Only servicing in spring (heat pumps need fall service too)",
      "Ignoring efficiency drops in heating mode"
    ],
    whenToCallPro: [
      "This is a professional-only task",
      "Schedule in spring AND fall for best results"
    ],
    healthImpactIfSkipped: 0.08,
    seasonPreference: "spring",
    optimalMonths: [3, 4, 9, 10],
    safetyLevel: "safe",
    deepDiveContent: {
      whyItMatters: "Heat pumps are complex systems with reversing valves and defrost cycles. Professional maintenance catches issues before they cause expensive repairs or force reliance on backup heat.",
      scienceBehind: "The reversing valve changes refrigerant flow direction between heating and cooling. Defrost cycles prevent ice buildup on outdoor coils. Both require professional diagnostics.",
      failureModes: [
        "Reversing valve failure (stuck in one mode)",
        "Defrost failure causing ice damage",
        "Compressor failure from refrigerant issues"
      ]
    },
    urgencyByAge: { baseUrgency: 1.0, increasePerYear: 0.06, maxMultiplier: 1.6 }
  },
  {
    systemTypeName: "Heat Pump",
    name: "Clear Outdoor Unit of Snow/Ice",
    description: "Remove snow accumulation from heat pump outdoor unit",
    quickSkim: [
      "Check unit after snowstorms",
      "Gently remove snow by hand or soft broom",
      "Never use sharp tools to remove ice",
      "Ensure 2-foot clearance around unit"
    ],
    frequencyMonths: 1,
    priority: "high",
    difficulty: "easy",
    estimatedTimeMinutes: 15,
    diyCostLow: 0,
    diyCostHigh: 0,
    proCostLow: 75,
    proCostHigh: 150,
    diySteps: [
      "Check outdoor unit after any significant snowfall",
      "Remove snow accumulation with soft broom or by hand",
      "Never use shovel or sharp tools (can damage fins)",
      "Clear snow 2 feet around the unit",
      "Check that unit is elevated above typical snow line",
      "If ice is present, do NOT chip it off - call pro"
    ],
    commonMistakes: [
      "Using sharp tools to remove ice (damages coils)",
      "Ignoring snow buildup around unit",
      "Running defrost cycle excessively"
    ],
    whenToCallPro: [
      "If unit is encased in ice",
      "If defrost cycle runs constantly",
      "If unit makes unusual noises"
    ],
    healthImpactIfSkipped: 0.03,
    seasonPreference: "winter",
    optimalMonths: [12, 1, 2, 3],
    safetyLevel: "safe"
  },

  // Ductwork
  {
    systemTypeName: "Ductwork",
    name: "Inspect Visible Ductwork",
    description: "Check accessible ducts for damage, leaks, and insulation issues",
    quickSkim: [
      "Look for disconnected joints or visible damage",
      "Check for gaps where ducts meet vents",
      "Feel for air leaks with wet hand while system runs",
      "Inspect insulation for damage or moisture"
    ],
    frequencyMonths: 12,
    priority: "medium",
    difficulty: "easy",
    estimatedTimeMinutes: 30,
    diyCostLow: 0,
    diyCostHigh: 25,
    proCostLow: 100,
    proCostHigh: 200,
    diySteps: [
      "Turn on HVAC system to create airflow",
      "Access basement, attic, or crawlspace where ducts are visible",
      "Look for disconnected joints or obvious damage",
      "Feel for air leaks at joints with wet hand (you'll feel cool air)",
      "Check insulation for damage, moisture, or gaps",
      "Seal small leaks with mastic sealant or metal tape (not duct tape!)",
      "Note any significant damage for professional repair"
    ],
    commonMistakes: [
      "Using cloth duct tape (fails within years)",
      "Ignoring ducts in unconditioned spaces",
      "Missing leaks at boot connections (where ducts meet vents)"
    ],
    whenToCallPro: [
      "If ducts are in inaccessible areas",
      "For duct cleaning (don't DIY)",
      "If you find significant damage or disconnections"
    ],
    healthImpactIfSkipped: 0.04,
    seasonPreference: "fall",
    optimalMonths: [9, 10, 11],
    requiredTools: ["Flashlight", "Ladder"],
    requiredMaterials: [{ name: "Mastic sealant or metal tape", estimatedCost: 15 }],
    safetyLevel: "caution",
    deepDiveContent: {
      whyItMatters: "Leaky ducts can waste 20-30% of conditioned air. In unconditioned spaces, this means heating/cooling the attic or crawlspace instead of your living areas.",
      scienceBehind: "Ducts in unconditioned spaces experience large temperature differentials. A duct carrying 55°F air through a 130°F attic works very hard. Any leak compounds energy waste exponentially."
    }
  },
  {
    systemTypeName: "Ductwork",
    name: "Professional Duct Cleaning",
    description: "Complete cleaning of entire duct system by certified professional",
    quickSkim: [
      "Recommended every 3-5 years",
      "More frequently with allergies, pets, or recent construction",
      "Look for NADCA-certified contractors",
      "Expect 2-4 hours for typical home"
    ],
    frequencyMonths: 48,
    priority: "low",
    difficulty: "pro_only",
    estimatedTimeMinutes: 180,
    diyCostLow: 0,
    diyCostHigh: 0,
    proCostLow: 300,
    proCostHigh: 500,
    diySteps: [],
    commonMistakes: [
      "Hiring unqualified contractors",
      "Falling for $99 whole-house scam offers",
      "Cleaning ducts unnecessarily"
    ],
    whenToCallPro: [
      "After major renovation or construction",
      "After pest infestation",
      "If you see visible mold growth in ducts",
      "If family members have unexplained allergies"
    ],
    healthImpactIfSkipped: 0.02,
    seasonPreference: "any",
    safetyLevel: "safe",
    deepDiveContent: {
      whyItMatters: "While not always necessary, duct cleaning can improve indoor air quality and system efficiency in specific situations. The EPA recommends cleaning only when there's visible mold, pest infestation, or excessive debris.",
      proTips: [
        "Get quotes from 3 NADCA-certified contractors",
        "Avoid $99 whole-house specials (usually scams)",
        "Ask to see before/after camera footage"
      ]
    }
  },
  {
    systemTypeName: "Ductwork",
    name: "Clean Supply and Return Vents",
    description: "Remove and clean all supply and return air vent covers",
    quickSkim: [
      "Remove vent covers and wash with soap and water",
      "Vacuum inside duct opening",
      "Replace any damaged or rusty vents",
      "Ensure vents aren't blocked by furniture"
    ],
    frequencyMonths: 6,
    priority: "routine",
    difficulty: "easy",
    estimatedTimeMinutes: 45,
    diyCostLow: 0,
    diyCostHigh: 10,
    proCostLow: 75,
    proCostHigh: 125,
    diySteps: [
      "Turn off HVAC system",
      "Remove vent covers (most lift off or unscrew)",
      "Wash covers with warm soapy water",
      "Let covers dry completely",
      "Vacuum inside duct opening as far as attachment reaches",
      "Wipe down edges of duct opening",
      "Reinstall dry vent covers",
      "Check that furniture isn't blocking airflow"
    ],
    commonMistakes: [
      "Reinstalling wet vent covers (causes rust)",
      "Blocking vents with furniture or rugs",
      "Never cleaning return air vents (they collect the most dust)"
    ],
    whenToCallPro: [
      "If you see mold inside ducts",
      "If duct openings are damaged"
    ],
    healthImpactIfSkipped: 0.02,
    seasonPreference: "any",
    requiredTools: ["Screwdriver", "Vacuum"],
    safetyLevel: "safe"
  },

  // Thermostat
  {
    systemTypeName: "Thermostat",
    name: "Replace Thermostat Batteries",
    description: "Replace batteries to prevent system shutdowns",
    quickSkim: [
      "Most thermostats use AA or AAA batteries",
      "Low battery indicator usually appears on screen",
      "Replace annually as preventive measure",
      "Some smart thermostats have rechargeable batteries"
    ],
    frequencyMonths: 12,
    priority: "medium",
    difficulty: "easy",
    estimatedTimeMinutes: 5,
    diyCostLow: 3,
    diyCostHigh: 10,
    proCostLow: 50,
    proCostHigh: 100,
    diySteps: [
      "Pull thermostat face plate off mounting plate (or open battery door)",
      "Note battery type and orientation",
      "Remove old batteries",
      "Insert new batteries with correct polarity",
      "Reattach face plate or close battery door",
      "Verify thermostat powers on and displays correctly"
    ],
    commonMistakes: [
      "Waiting until batteries die completely (loses programming)",
      "Using wrong battery type"
    ],
    whenToCallPro: [
      "If thermostat won't power on after battery replacement",
      "If display is blank or garbled"
    ],
    healthImpactIfSkipped: 0.02,
    seasonPreference: "fall",
    optimalMonths: [9, 10],
    requiredMaterials: [{ name: "AA or AAA batteries", estimatedCost: 5 }],
    safetyLevel: "safe"
  },
  {
    systemTypeName: "Thermostat",
    name: "Update Thermostat Programming",
    description: "Adjust schedule for seasonal changes and optimize energy savings",
    quickSkim: [
      "Update schedule for daylight saving time changes",
      "Set heating/cooling temperature setbacks",
      "Program for work/school schedules",
      "Enable vacation mode when traveling"
    ],
    frequencyMonths: 6,
    priority: "routine",
    difficulty: "easy",
    estimatedTimeMinutes: 15,
    diyCostLow: 0,
    diyCostHigh: 0,
    proCostLow: 50,
    proCostHigh: 100,
    diySteps: [
      "Review current programming on thermostat or app",
      "Update wake/sleep times for family schedule",
      "Set appropriate temperature setbacks (68°F heating, 78°F cooling when away)",
      "Enable smart features like geofencing if available",
      "Set up vacation mode for upcoming travel",
      "Verify system responds to manual adjustments"
    ],
    commonMistakes: [
      "Setting temperatures too extreme during setback periods",
      "Not updating for daylight saving time",
      "Disabling programming entirely out of frustration"
    ],
    whenToCallPro: [
      "If thermostat doesn't respond to programming",
      "If system doesn't follow the schedule"
    ],
    healthImpactIfSkipped: 0.01,
    seasonPreference: "any",
    safetyLevel: "safe",
    deepDiveContent: {
      whyItMatters: "Proper thermostat programming can save 10-15% on heating and cooling costs. A 10°F setback for 8 hours daily saves approximately 10% annually.",
      proTips: [
        "Don't set back temperature more than 10°F (recovery takes too long)",
        "Consider a smart thermostat that learns your schedule",
        "Heat pumps may need different setback strategies"
      ]
    }
  },
  {
    systemTypeName: "Thermostat",
    name: "Clean Thermostat Interior",
    description: "Remove dust from thermostat sensors for accurate readings",
    quickSkim: [
      "Remove cover carefully",
      "Use soft brush or canned air to remove dust",
      "Don't touch sensor elements directly",
      "Helps maintain accurate temperature readings"
    ],
    frequencyMonths: 12,
    priority: "routine",
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCostLow: 0,
    diyCostHigh: 5,
    proCostLow: 50,
    proCostHigh: 100,
    diySteps: [
      "Turn off HVAC system",
      "Remove thermostat cover (most snap or unscrew)",
      "Use soft brush or can of compressed air to remove dust",
      "Pay attention to sensor area but don't touch directly",
      "Wipe exterior with dry cloth",
      "Replace cover",
      "Turn system back on and verify operation"
    ],
    commonMistakes: [
      "Using wet cloth that can damage electronics",
      "Touching sensor elements with fingers (oils affect accuracy)",
      "Using excessive force to remove cover"
    ],
    whenToCallPro: [
      "If thermostat reads temperature inaccurately",
      "If internal components appear damaged"
    ],
    healthImpactIfSkipped: 0.01,
    seasonPreference: "any",
    requiredTools: ["Soft brush or canned air"],
    safetyLevel: "safe"
  }
];

// ============================================
// PLUMBING MAINTENANCE TEMPLATES
// ============================================
export const plumbingTemplates: MaintenanceTemplate[] = [
  // ============================================
  // Water Heater (Tank) — 8 tasks from field-calibrated system profile
  // Source: convex/data/profiles/tank_water_heater_electric.json
  // ============================================
  {
    systemTypeName: "Water Heater (Tank)",
    name: "Flush Tank and Drain Sediment",
    description: "Draining several gallons from the bottom of the tank removes accumulated mineral sediment (calcium carbonate, magnesium, and silica) that settles out of heated water. In electric heaters, this sediment buries the lower heating element, forcing it to work harder and overheat — which accelerates element failure and can crack the glass lining of the tank itself.",
    quickSkim: [
      "Turn off breaker FIRST — never drain with power on (dry-fired elements burn out instantly)",
      "Connect garden hose to drain valve, route to floor drain or exterior",
      "Open a hot faucet to break vacuum, then open drain valve",
      "Drain until water runs clear (5-10 minutes typically)",
      "Refill tank completely before restoring power — confirm steady flow from open faucet"
    ],
    frequencyMonths: 12,
    priority: "high",
    difficulty: "moderate",
    estimatedTimeMinutes: 30,
    diyCostLow: 0,
    diyCostHigh: 0,
    proCostLow: 100,
    proCostHigh: 200,
    diySteps: [
      "Turn off the dedicated circuit breaker for the water heater (typically a 30-amp double-pole breaker labeled 'Water Heater' or 'WH'). Confirm it is OFF — never drain an electric water heater with the power on, as exposing dry elements to power will burn them out within minutes.",
      "Turn off the cold water supply valve at the top of the heater by rotating it clockwise until it stops.",
      "Open a hot water faucet at the nearest sink or bathtub. This breaks the vacuum inside the tank and allows it to drain freely. Leave this faucet open throughout the process.",
      "Connect a standard garden hose to the drain valve at the bottom of the tank (threaded spigot, usually brass or plastic, within 6 inches of the tank bottom).",
      "Route the hose to a floor drain, exterior door, or driveway. If none accessible, drain into 5-gallon buckets. Make sure the hose end is lower than the drain valve.",
      "Open the drain valve. Water will be HOT. Keep hands, feet, children, and pets clear.",
      "Let the tank drain for 5-10 minutes or until the water runs clear. Watch for gritty, sandy sediment or white flakes in the first few gallons.",
      "If flow is slow or stops, briefly open and close the cold water supply valve in short bursts (2-3 seconds) to stir up sediment. If the valve is completely blocked, do not force it.",
      "Once water runs clear, close the drain valve firmly. Remove the garden hose.",
      "Turn the cold water supply valve back on fully.",
      "Wait at the open hot water faucet. Initially you will get air sputtering and bursts of water. Once a steady, full stream flows with no air, close the faucet.",
      "Turn the circuit breaker back ON only after confirming the tank is completely full. Energizing heating elements in a partially filled or empty tank will destroy them almost immediately (dry-firing)."
    ],
    commonMistakes: [
      "Turning power back on before tank is completely full (dry-firing destroys elements instantly)",
      "Not opening a hot faucet to break vacuum (tank won't drain properly)",
      "Forcing a stuck drain valve (risk of breaking it with 50 gallons behind it)",
      "Draining hot water onto areas where people or pets walk"
    ],
    whenToCallPro: [
      "If drain valve is completely blocked by sediment and won't flow",
      "If water coming out looks like brown or rusty tea (not just sandy) — tank lining is likely compromised",
      "If drain valve breaks or won't reseal after draining"
    ],
    healthImpactIfSkipped: 0.08,
    seasonPreference: "any",
    requiredTools: [
      "Standard garden hose",
      "Flat-head screwdriver or channel-lock pliers (for drain valve)",
      "Bucket (if no floor drain available)",
      "Work gloves (water will be hot)"
    ],
    safetyWarnings: [
      "Water will be at or near the thermostat setting (typically 120°F). At 120°F, skin burns occur with prolonged contact. At 140°F, serious burns can happen in seconds.",
      "NEVER turn the circuit breaker on until the tank is completely full and all air has been purged.",
      "If the drain valve is stuck, corroded, or cracked, do not apply excessive force. A broken drain valve with 50 gallons of hot water behind it is an emergency."
    ],
    safetyLevel: "caution",
    deepDiveContent: {
      whyItMatters: "Skipping annual flushes allows 1-3 inches of sediment to accumulate per year depending on water hardness. After 3-5 years without flushing, sediment can bury the lower element entirely, reducing effective tank capacity by 15-30% and accelerating element failure. Estimated lifespan reduction: 2-3 years. In hard water areas, the reduction can reach 4-5 years.",
      scienceBehind: "Minerals (calcium carbonate, magnesium, silica) precipitate out of heated water and settle at the tank bottom. The sediment layer insulates the lower heating element from the water, causing it to overheat and potentially crack the glass lining of the tank itself.",
      failureModes: [
        "Lower element buried in sediment, overheating and failing",
        "Glass tank lining cracked from localized overheating",
        "Effective capacity reduced 15-30%",
        "Recovery time significantly increased"
      ],
      proTips: [
        "If you have never flushed the tank and it is more than 5 years old, buy a replacement brass drain valve and a 3/4-inch hose cap before you start. There is a real chance the original valve will not seal properly after being opened for the first time in years.",
        "You do not always need a full drain. For routine maintenance, draining 5-8 gallons captures most loose sediment.",
        "If the water coming out looks like brown or rusty tea — not just sandy but actually discolored — the tank lining is likely compromised. Start budgeting for replacement."
      ]
    },
    urgencyByAge: { baseUrgency: 1.0, increasePerYear: 0.08, maxMultiplier: 1.8 }
  },
  {
    systemTypeName: "Water Heater (Tank)",
    name: "Test T&P Relief Valve",
    description: "The T&P relief valve is a critical safety device designed to open and release water if tank temperature exceeds 210°F or internal pressure exceeds 150 PSI. Testing it annually confirms it is functional and will protect against catastrophic overpressure. A stuck T&P valve on a malfunctioning heater is the scenario behind every water heater explosion you have ever seen on the news.",
    quickSkim: [
      "Place bucket under T&P discharge pipe — water will be HOT",
      "Lift the metal lever arm firmly for 3-5 seconds — water should rush through discharge pipe",
      "Release lever — it should snap closed and flow should stop completely within seconds",
      "If valve won't open, won't release water, or keeps dripping after release → replace it ($15-$25 part)"
    ],
    frequencyMonths: 12,
    priority: "critical",
    difficulty: "easy",
    estimatedTimeMinutes: 5,
    diyCostLow: 0,
    diyCostHigh: 0,
    proCostLow: 80,
    proCostHigh: 150,
    diySteps: [
      "Locate the T&P relief valve on the side or top of the water heater. It has a metal lever arm and a discharge pipe (usually 3/4-inch copper or CPVC) that runs down to within 6 inches of the floor or to an exterior drain.",
      "Place a bucket under the end of the discharge pipe, or have a towel ready. The water that comes out will be hot.",
      "Lift the lever arm on the T&P valve up firmly until you hear water rushing through the discharge pipe. Hold it open for 3-5 seconds.",
      "Release the lever. It should snap back to the closed position, and the water flow should stop completely within a few seconds.",
      "If the valve does not open when lifted, does not release water, or continues to drip after being released, the valve needs replacement. T&P valves cost $15-$25."
    ],
    commonMistakes: [
      "Being afraid to test the valve (better to find a failure during a controlled test than during an emergency)",
      "Capping or plugging the discharge pipe because it dripped occasionally (defeats the entire safety purpose)",
      "Not having a bucket ready (hot water will spray)"
    ],
    whenToCallPro: [
      "If the T&P valve is visibly corroded, has mineral deposits crusted around it, or the lever is frozen and will not move",
      "If the valve continues dripping after testing — most common cause is thermal expansion in a closed system (needs expansion tank, not valve replacement)",
      "If no discharge pipe is installed (code violation)"
    ],
    healthImpactIfSkipped: 0.09,
    seasonPreference: "any",
    requiredTools: [
      "Bucket or towel (to catch discharge water)"
    ],
    safetyWarnings: [
      "Water released during testing will be at full tank temperature (typically 120-140°F). Keep hands and body clear of the discharge point.",
      "Never remove or cap a T&P valve. It is the only thing standing between a water heater and a potential pressure vessel failure.",
      "If the T&P valve is visibly corroded or the lever is frozen, do not force it. Call a plumber to replace it."
    ],
    safetyLevel: "caution",
    deepDiveContent: {
      whyItMatters: "A non-functional T&P valve removes the last line of defense against catastrophic overpressure. While extremely rare (modern thermostats have redundant high-limit switches), the consequence of combined thermostat failure and stuck T&P valve is an uncontrolled pressure vessel.",
      scienceBehind: "Water expands approximately 2% when heated from 50°F to 120°F. In a closed system, this expansion creates enormous pressure. The T&P valve is rated to open at 150 PSI or 210°F.",
      proTips: [
        "Some homeowners are afraid to test the T&P valve because they heard it might not reseat. That is actually a sign the valve was already failing — better to find out during a controlled test.",
        "Check that the discharge pipe is properly routed — it should terminate within 6 inches of the floor or drain to the exterior. It should NEVER be capped, plugged, or reduced in diameter.",
        "If your T&P valve discharges intermittently on its own, the most common cause is thermal expansion from a closed plumbing system with no expansion tank — not a faulty valve."
      ]
    }
  },
  {
    systemTypeName: "Water Heater (Tank)",
    name: "Inspect Anode Rod Condition",
    description: "The anode rod is a sacrificial metal rod (typically magnesium or aluminum) suspended inside the tank. It corrodes intentionally, attracting the electrochemical reactions that would otherwise eat through the tank's glass-lined steel walls. Once the anode rod is consumed, the tank itself becomes the sacrificial element. Inspecting every 2-3 years and replacing when depleted is the single most effective way to extend tank life.",
    quickSkim: [
      "This is the #1 most neglected maintenance item — and the #1 lifespan extender (adds 3-6 years)",
      "Located at top of tank — requires 1-1/16\" socket and breaker bar (or impact wrench)",
      "Healthy rod has substantial metal mass; depleted rod is a thin bare wire",
      "Replace when more than 50% consumed — magnesium rod costs $20-$30",
      "In softened water, check ANNUALLY (sodium ions consume rods faster)"
    ],
    frequencyMonths: 24,
    priority: "high",
    difficulty: "hard",
    estimatedTimeMinutes: 45,
    diyCostLow: 20,
    diyCostHigh: 35,
    proCostLow: 150,
    proCostHigh: 300,
    diySteps: [
      "Turn off the circuit breaker for the water heater. Turn off the cold water supply valve.",
      "Open a hot water faucet to relieve pressure in the tank.",
      "Locate the anode rod port on top of the tank — a hex-head fitting, sometimes hidden under the cosmetic top cover. Some tanks have the anode rod integrated into the hot water outlet.",
      "Using a 1-1/16 inch socket on a breaker bar (or impact wrench), loosen the anode rod by turning counterclockwise. This WILL be tight. Have a helper hold the tank or use a ratcheting strap secured to a wall stud.",
      "Once loose, carefully pull the anode rod straight up out of the tank. Standard rods are 33-44 inches long — make sure you have enough ceiling clearance. If not, segmented (flexible) replacement rods are available.",
      "Inspect the rod: A healthy rod still has a steel wire core surrounded by sacrificial metal (looks bumpy and corroded but has substantial mass). A depleted rod will be reduced to a thin wire with little or no metal remaining.",
      "If the rod is less than 50% consumed, reinstall it with fresh Teflon tape (6+ wraps clockwise on the threads). If more than 50% consumed or down to the wire, replace it.",
      "Thread the new rod in by hand to avoid cross-threading, then tighten firmly with the socket. Apply Teflon tape to the threads before installation.",
      "Close the hot water faucet, turn the cold supply back on, let the tank refill, purge air, and then turn the breaker back on."
    ],
    commonMistakes: [
      "Never checking the anode rod at all — most homeowners and many plumbers skip this entirely",
      "Not using an impact wrench (rods are often seized from corrosion and mineral deposits)",
      "Not accounting for ceiling clearance (standard rods are 33-44 inches long)",
      "Using the wrong rod material for your water chemistry"
    ],
    whenToCallPro: [
      "If the anode rod hex fitting is corroded and you cannot remove the rod without risk of damaging the tank fitting — stripping or cracking the port is a non-repairable failure",
      "If you see persistent rust-colored water from a tank 8+ years old (likely end-of-life corrosion)",
      "If headroom above tank is limited and you're not comfortable with the extraction"
    ],
    healthImpactIfSkipped: 0.10,
    seasonPreference: "any",
    requiredTools: [
      "1-1/16 inch socket with breaker bar",
      "Ratchet and socket set",
      "Impact wrench (extremely helpful — rods are often seized)",
      "Helper to hold the tank steady (or a strap)"
    ],
    requiredMaterials: [
      { name: "Replacement magnesium anode rod", estimatedCost: 25 },
      { name: "Pipe thread sealant tape (Teflon tape)", estimatedCost: 3 }
    ],
    safetyWarnings: [
      "The tank is full of hot water. Even with the power off, the water remains at temperature for hours. Be cautious of splashing when removing the rod.",
      "Use proper body mechanics with the breaker bar to avoid back injury.",
      "If the anode rod port is corroded and you cannot remove the rod without risk of damaging the tank fitting, stop and call a professional."
    ],
    safetyLevel: "caution",
    deepDiveContent: {
      whyItMatters: "Once the anode rod is fully consumed (typically 4-6 years depending on water chemistry), tank corrosion begins immediately. You will not see external signs until it is far too late. The difference between a water heater that lasts 8 years and one that lasts 14 years often comes down to whether anyone ever checked the anode rod.",
      scienceBehind: "Galvanic (sacrificial) corrosion causes the more reactive metal (magnesium or aluminum anode) to corrode preferentially, protecting the less reactive steel tank. Once the anode is consumed, the steel becomes the anode in any remaining galvanic couples and corrodes from the inside out.",
      failureModes: [
        "Unprotected tank corrosion from inside out (invisible until failure)",
        "Pinhole leaks developing at weld seams",
        "Complete tank rupture releasing 40-80 gallons"
      ],
      proTips: [
        "Most homeowners have never seen their anode rod — and most plumbers do not check it on routine service calls unless specifically asked. If you do nothing else on this list, do this one.",
        "If your tank is in a location with limited overhead clearance, buy a segmented or flexible anode rod. They fold as you insert them.",
        "Softened water (from a water softener) actually consumes anode rods FASTER than hard water. If you have a softener, check annually, not every 2 years."
      ]
    },
    urgencyByAge: { baseUrgency: 1.0, increasePerYear: 0.12, maxMultiplier: 2.0 }
  },
  {
    systemTypeName: "Water Heater (Tank)",
    name: "Inspect Electrical Connections and High-Limit Reset",
    description: "Electric water heaters run on 240V circuits. Over time, wire connections can loosen from thermal cycling, corrosion can develop (especially in humid environments), and the high-limit safety switch (ECO) can trip from overheating events. Inspecting electrical components annually catches wiring issues before they become fire hazards.",
    quickSkim: [
      "Turn OFF breaker first, then verify with non-contact voltage tester — 240V is lethal",
      "Check junction box for blackened, melted, or loose wire connections",
      "Check if the red high-limit reset button on upper thermostat has tripped (popped out)",
      "If high-limit trips repeatedly after reset → failing thermostat or grounded element, call a pro"
    ],
    frequencyMonths: 12,
    priority: "medium",
    difficulty: "moderate",
    estimatedTimeMinutes: 15,
    diyCostLow: 0,
    diyCostHigh: 0,
    proCostLow: 100,
    proCostHigh: 200,
    diySteps: [
      "Turn OFF the circuit breaker for the water heater.",
      "Use a non-contact voltage tester at the junction box cover and both element access panels to confirm power is OFF. Do not proceed until you get a confirmed no-voltage reading.",
      "Remove the junction box cover (usually 1-2 screws). Inspect wire connections — look for blackened, melted, or discolored wire insulation, green corrosion on copper conductors, or loose wire nuts.",
      "Gently tug each wire connection to confirm it is secure. Tighten any loose wire nuts or terminal screws.",
      "Remove the upper element access panel (held by 2 screws). Pull back the insulation to expose the upper thermostat.",
      "Locate the red high-limit reset button (ECO) on the upper thermostat. If it is popped out, it has tripped. Press it firmly to reset. If it trips again within a few days, call a professional.",
      "Visually inspect thermostat and element wire connections for corrosion or loose screws.",
      "Replace the insulation and access panel covers. Restore power at the breaker."
    ],
    commonMistakes: [
      "Trusting breaker labels without verifying power is off with a voltage tester",
      "Repeatedly pressing the high-limit reset without diagnosing the underlying cause",
      "Working near electrical components without proper tools"
    ],
    whenToCallPro: [
      "If you see melted wire insulation, scorch marks, or smell burned plastic — do not restore power",
      "If the high-limit reset trips again within 24-48 hours after reset",
      "If you are not comfortable working around 240V electrical components"
    ],
    healthImpactIfSkipped: 0.07,
    seasonPreference: "any",
    requiredTools: [
      "Non-contact voltage tester (essential — $15-$25)",
      "Phillips and flat-head screwdrivers",
      "Flashlight"
    ],
    safetyWarnings: [
      "Electric water heaters operate on 240 volts. Contact with energized components can cause serious injury or death. ALWAYS turn off the breaker AND verify with a voltage tester before touching any wires or terminals.",
      "Do not attempt to test elements or thermostats with a multimeter while the circuit is energized.",
      "If you see melted wire insulation, scorch marks, or smell burned plastic, do not restore power. Call a licensed electrician."
    ],
    safetyLevel: "danger",
    deepDiveContent: {
      whyItMatters: "Loose electrical connections are a leading cause of house fires involving water heaters. Corroded connections increase resistance, generate heat, and can melt wire insulation. A tripped high-limit reset that is repeatedly pressed back in without diagnosing the cause indicates a thermostat or element problem that will worsen.",
      scienceBehind: "Thermal cycling causes metal connections to expand and contract, gradually loosening over time. Increased resistance at a loose connection generates localized heat (P=I²R), which can ignite surrounding insulation or wire sheathing.",
      proTips: [
        "A non-contact voltage tester is a $20 tool that can save your life. Use it every single time you work near electrical components. Never trust a breaker label without verifying.",
        "If the high-limit trips and there is no obvious cause, the most likely issue is a grounded element — where the heating coil contacts the metal sheath. This creates continuous heating that bypasses the thermostat.",
        "In humid climates, check for condensation or mineral staining inside the access panels. Moisture accelerates corrosion of electrical contacts."
      ]
    },
    urgencyByAge: { baseUrgency: 1.0, increasePerYear: 0.05, maxMultiplier: 1.5 }
  },
  {
    systemTypeName: "Water Heater (Tank)",
    name: "Inspect for Leaks, Moisture, and Corrosion",
    description: "A hands-and-eyes walk-around of the water heater and its connections catches slow leaks, early corrosion, and moisture intrusion before they become catastrophic failures. Most water heater floods do not start as sudden ruptures — they start as slow weeps that are invisible unless someone is looking.",
    quickSkim: [
      "Run a dry paper towel along every fitting and connection — even a tiny seep will show",
      "Check T&P valve discharge pipe for drips or mineral staining",
      "Look at the tank bottom and drip pan for standing water or rust stains",
      "Rust stains on the exterior at the bottom weld seam = terminal tank corrosion, start budgeting for replacement"
    ],
    frequencyMonths: 3,
    priority: "high",
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCostLow: 0,
    diyCostHigh: 0,
    proCostLow: 0,
    proCostHigh: 0,
    diySteps: [
      "Start at the top of the water heater. Inspect the cold water inlet and hot water outlet connections. Look for mineral deposits (white or green crust), moisture, drips, or corrosion on fittings.",
      "Run a dry paper towel or tissue along each connection and fitting. Even a barely-visible seep will show on a dry paper towel.",
      "Check the T&P relief valve and its discharge pipe. Look for drips, mineral staining, or water tracks down the pipe or tank exterior.",
      "Inspect both element access panels. Look for rust stains, moisture, or mineral deposits leaking from behind the panels — this can indicate an element gasket failure or tank wall corrosion.",
      "Check the drain valve at the bottom of the tank for drips or mineral deposits.",
      "Look at the tank bottom and the floor beneath it. Check the drip pan (if installed) for standing water. Feel underneath the tank jacket for moisture.",
      "Check surrounding walls and floor for any water staining, warping, or mold that might indicate a slow leak."
    ],
    commonMistakes: [
      "Only doing a visual glance from a distance (you need to get close and touch fittings with a paper towel)",
      "Not checking behind the water heater or in the drip pan",
      "Ignoring small mineral deposits (they indicate the beginning of a leak)"
    ],
    whenToCallPro: [
      "If you find standing water and cannot identify the source — turn off cold water supply and breaker as a precaution",
      "If you see rust stains on the exterior at the bottom weld seam (tank lining has failed, replacement needed)",
      "If element access panels show active moisture (gasket or tank wall failure)"
    ],
    healthImpactIfSkipped: 0.09,
    seasonPreference: "any",
    requiredTools: [
      "Flashlight",
      "Paper towel or tissue (to detect slow drips)",
      "Mirror (optional, for hard-to-see connections)"
    ],
    safetyWarnings: [
      "Do not touch electrical components during a visual inspection without first verifying the power is off.",
      "If you find standing water on or around the water heater and cannot identify the source, turn off the cold water supply and the circuit breaker as a precaution."
    ],
    safetyLevel: "safe",
    deepDiveContent: {
      whyItMatters: "Catching a slow leak early can be the difference between a $15 fitting replacement and a $40,000 water damage claim. Many catastrophic tank failures show warning signs — mineral staining at fittings, rust streaks on the tank exterior, moisture in the drip pan — weeks or months before full failure.",
      proTips: [
        "The most dangerous leak is the one you cannot see. In garage closet installations, pull the access door fully open and look behind and under the tank with a flashlight.",
        "Rust stains on the outside of the tank at the bottom — particularly around the weld seam — are almost always terminal. The glass lining has failed internally.",
        "Take a photo during each inspection and save it. Having a visual history makes it easy to spot changes over time."
      ]
    }
  },
  {
    systemTypeName: "Water Heater (Tank)",
    name: "Verify Thermostat Temperature Setting",
    description: "Confirming the thermostat is set to the recommended 120°F prevents scalding, reduces energy waste, and slows mineral sediment accumulation. Many water heaters ship at 140°F from the factory — costing more to operate, accelerating tank wear, and posing a burn risk.",
    quickSkim: [
      "Recommended setting: 120°F (reduces energy cost 8-12% vs 140°F and slows sediment buildup)",
      "Most electric water heater thermostats have vague marks, not actual numbers — verify with a tap thermometer",
      "Running at 140°F increases energy consumption, accelerates mineral precipitation, and increases scald risk",
      "Below 120°F risks Legionella bacteria growth — CDC recommends 120°F minimum"
    ],
    frequencyMonths: 12,
    priority: "low",
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCostLow: 0,
    diyCostHigh: 0,
    proCostLow: 75,
    proCostHigh: 125,
    diySteps: [
      "Turn off the circuit breaker for the water heater.",
      "Remove the upper element access panel (2 screws). Pull back the insulation.",
      "Locate the thermostat dial. Most have a non-numbered dial with an arrow or hash marks. The 'warm' or middle setting is typically around 120°F.",
      "If adjustment is needed, use a flat-head screwdriver to rotate the dial. If there is also a lower thermostat (behind the lower access panel), set it to the same position.",
      "Replace insulation and panels. Restore power. Wait 2-3 hours, then test the hot water temperature at the nearest faucet using a kitchen thermometer. Adjust if needed."
    ],
    commonMistakes: [
      "Trusting the dial markings (they are deliberately vague — always verify with a thermometer at the tap)",
      "Setting both thermostats to different temperatures",
      "Setting below 120°F (Legionella risk)"
    ],
    whenToCallPro: [
      "If adjusting the thermostat does not change the output temperature after 2-3 hours (thermostat may need replacement)"
    ],
    healthImpactIfSkipped: 0.04,
    seasonPreference: "any",
    requiredTools: [
      "Flat-head screwdriver",
      "Kitchen thermometer (to verify at the tap)"
    ],
    safetyWarnings: [
      "Always turn off the breaker before removing access panels.",
      "Setting the thermostat above 125°F significantly increases scald risk. At 140°F, a serious burn can occur in under 5 seconds."
    ],
    safetyLevel: "caution",
    deepDiveContent: {
      whyItMatters: "Running at 140°F vs 120°F increases energy consumption by 8-12%, accelerates mineral precipitation (sediment), and increases anode rod consumption. Over the heater's life, this translates to $200-$400 in excess energy cost and measurably faster tank degradation.",
      proTips: [
        "If you have a dishwasher without a built-in booster heater, you may want to set to 130°F for effective sanitization. Most modern dishwashers have internal heaters that compensate for 120°F supply.",
        "If you have immunocompromised household members, the CDC recommends 120°F minimum to prevent Legionella growth."
      ]
    }
  },
  {
    systemTypeName: "Water Heater (Tank)",
    name: "Check Expansion Tank (If Equipped)",
    description: "A thermal expansion tank absorbs the increased water volume when cold water is heated (water expands ~2% when heated from 50°F to 120°F). In closed plumbing systems (those with backflow preventers or check valves), this expansion has nowhere to go — it pressurizes the entire system and can cause T&P valve weeping, fitting stress, and premature tank failure.",
    quickSkim: [
      "Tap on the tank with your knuckle — top half should sound hollow (air), bottom half solid (water)",
      "If the entire tank sounds solid and heavy → bladder has failed, tank is waterlogged",
      "Check air pre-charge pressure with a tire gauge at the Schrader valve — should match your water supply pressure (40-80 PSI)",
      "If Schrader valve leaks water when depressed → internal bladder is ruptured, replace the tank"
    ],
    frequencyMonths: 12,
    priority: "medium",
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCostLow: 0,
    diyCostHigh: 0,
    proCostLow: 100,
    proCostHigh: 200,
    diySteps: [
      "Locate the expansion tank — typically a small (2-5 gallon) cylindrical tank mounted on the cold water supply line near the water heater, often hanging from the piping.",
      "Tap on the tank with your knuckle. A properly functioning expansion tank should sound hollow on the top half (air) and solid on the bottom half (water). If the entire tank sounds solid and heavy, the bladder has likely failed.",
      "Locate the Schrader valve (identical to a tire valve) on the top or side. Using a tire pressure gauge, check the air pre-charge pressure.",
      "The pre-charge pressure should match your incoming water supply pressure (typically 40-80 PSI). Use a hose bib pressure gauge if you don't know your water pressure.",
      "If the pressure is low, use a bicycle pump or small compressor to add air. If the Schrader valve leaks water when depressed, the internal bladder has ruptured and the tank needs replacement."
    ],
    commonMistakes: [
      "Not checking expansion tank when T&P valve drips intermittently (waterlogged expansion tank is the most common cause)",
      "Over-pressurizing the expansion tank above water supply pressure",
      "Never checking the expansion tank after initial installation"
    ],
    whenToCallPro: [
      "If expansion tank needs replacement (professional installation recommended)",
      "If you don't have an expansion tank but have a closed plumbing system (needs installation)"
    ],
    healthImpactIfSkipped: 0.05,
    seasonPreference: "any",
    requiredTools: [
      "Tire pressure gauge",
      "Bicycle pump or small air compressor (if re-charging is needed)"
    ],
    safetyWarnings: [
      "Do not over-pressurize the expansion tank — setting above water supply pressure will push water back and defeat its purpose.",
      "If expansion tank support bracket is corroded, the waterlogged weight can stress piping connections."
    ],
    safetyLevel: "safe",
    deepDiveContent: {
      whyItMatters: "A waterlogged expansion tank provides zero protection. The entire system pressure cycles with each heating cycle, stressing fittings, valves, and the tank itself. This is a frequent contributing cause of premature T&P valve discharge and can reduce water heater lifespan by 1-2 years.",
      proTips: [
        "A waterlogged expansion tank is one of the most common causes of a T&P valve that drips intermittently. Before replacing a T&P valve for dripping, check the expansion tank first.",
        "Expansion tanks have a lifespan of about 5-8 years. The internal rubber bladder degrades over time.",
        "Not every home needs an expansion tank. If your plumbing system is 'open' (no backflow preventer), thermal expansion can push back into the municipal supply."
      ]
    }
  },
  {
    systemTypeName: "Water Heater (Tank)",
    name: "Check Drip Pan and Drain Line",
    description: "A drip pan installed under the water heater is the last line of defense against water damage from a tank leak. The pan should be properly sized, undamaged, and connected to a drain line that routes water to a visible location. Many drip pans are installed at construction and never checked again — they fill with dust and debris that can clog the drain line when it matters most.",
    quickSkim: [
      "Check drip pan for standing water (if any → investigate the source immediately), rust, debris, or cracks",
      "Clear any dust, insulation debris, or sediment from the pan",
      "Follow drain line to its exit point — confirm it's not kinked, disconnected, or clogged",
      "Pour 8 oz of water into the pan and confirm it drains to the exit point"
    ],
    frequencyMonths: 6,
    priority: "medium",
    difficulty: "easy",
    estimatedTimeMinutes: 5,
    diyCostLow: 0,
    diyCostHigh: 0,
    proCostLow: 0,
    proCostHigh: 0,
    diySteps: [
      "Visually inspect the drip pan for standing water, rust stains, debris, or cracks. Any standing water indicates an active leak — investigate the source before proceeding.",
      "Clear any dust, insulation debris, or sediment from the pan. Use a vacuum or damp towels.",
      "Locate where the drain line exits the pan and follow it to its termination point. Confirm the line is not kinked, disconnected, or clogged.",
      "Pour a small cup of water (8 oz) into the drip pan and confirm it drains through the drain line to its exit point. Watch for slow flow indicating a partial clog.",
      "If the drain line is clogged, use a wet/dry vacuum on the outlet end to clear the blockage, or flush with a garden hose."
    ],
    commonMistakes: [
      "Never checking the drip pan after it was installed at construction",
      "Having a drip pan without a drain line (it's just a 2-gallon bucket — overflows in under a minute on a full tank failure)",
      "Ignoring standing water in the drip pan"
    ],
    whenToCallPro: [
      "If you find standing water in the drip pan and cannot identify the source",
      "If no drip pan is installed (should be installed — code requirement in most jurisdictions)"
    ],
    healthImpactIfSkipped: 0.06,
    seasonPreference: "any",
    requiredTools: [
      "Flashlight",
      "Wet/dry vacuum or towels (if debris is found)"
    ],
    safetyWarnings: [
      "If you find standing water in the drip pan, do not ignore it. Identify the source before it becomes a major leak."
    ],
    safetyLevel: "safe",
    deepDiveContent: {
      whyItMatters: "A drip pan is only useful if the drain line is clear. I have seen dozens of flood claims where a drip pan was present but the drain line was clogged — the pan filled and overflowed within minutes, providing zero protection.",
      proTips: [
        "If your water heater does not have a drip pan, install one. Drip pans cost $15-$25 and are a minimal investment against catastrophic water damage.",
        "In attic installations, the drip pan and drain line are absolutely critical — and also the hardest to check.",
        "A drip pan without a drain line is just a bucket. The drain line is what matters."
      ]
    }
  },

  // Water Heater (Tankless)
  {
    systemTypeName: "Water Heater (Tankless)",
    name: "Descale Tankless Water Heater",
    description: "Flush mineral deposits from heat exchanger using vinegar solution",
    quickSkim: [
      "Required annually, more often with hard water",
      "Uses pump to circulate vinegar through unit",
      "Prevents scale buildup on heat exchanger",
      "Critical for maintaining efficiency"
    ],
    frequencyMonths: 12,
    priority: "high",
    difficulty: "moderate",
    estimatedTimeMinutes: 90,
    diyCostLow: 20,
    diyCostHigh: 50,
    proCostLow: 150,
    proCostHigh: 250,
    diySteps: [
      "Turn off gas/electric and close water isolation valves",
      "Connect descaling kit: pump, bucket, and hoses to service ports",
      "Fill bucket with 4-5 gallons of white vinegar",
      "Run pump to circulate vinegar through unit for 45-60 minutes",
      "Drain vinegar and rinse with fresh water for 5 minutes",
      "Remove hoses and close service ports",
      "Open isolation valves and restore power",
      "Run hot water to verify operation"
    ],
    commonMistakes: [
      "Not isolating the unit properly (vinegar goes into house pipes)",
      "Using too strong of chemicals (can damage heat exchanger)",
      "Not rinsing thoroughly after descaling"
    ],
    whenToCallPro: [
      "If error codes appear after descaling",
      "If unit won't fire after procedure",
      "First time descaling (watch pro do it once)"
    ],
    healthImpactIfSkipped: 0.08,
    seasonPreference: "any",
    requiredTools: ["Descaling kit (pump, hoses, bucket)"],
    requiredMaterials: [{ name: "White vinegar (4-5 gallons)", estimatedCost: 15 }],
    safetyLevel: "caution",
    deepDiveContent: {
      whyItMatters: "Scale buildup on the heat exchanger reduces heat transfer efficiency and can cause overheating and premature failure. In hard water areas, scale can reduce efficiency by 30% in just one year.",
      scienceBehind: "Calcium and magnesium precipitate out of heated water, coating the heat exchanger. This insulating layer forces the unit to work harder, reducing flow rates and causing error codes.",
      failureModes: [
        "Error codes from overheating",
        "Reduced hot water flow rate",
        "Premature heat exchanger failure"
      ],
      proTips: [
        "In hard water (>7 grains), descale every 6 months",
        "Install a water softener to reduce scale formation",
        "Buy a descaling kit for around $100 - pays for itself quickly"
      ]
    },
    urgencyByAge: { baseUrgency: 1.0, increasePerYear: 0.05, maxMultiplier: 1.5 }
  },
  {
    systemTypeName: "Water Heater (Tankless)",
    name: "Clean Inlet Water Filter",
    description: "Remove and clean the inlet filter screen to maintain water flow",
    quickSkim: [
      "Located at cold water inlet",
      "Unscrew, rinse, replace",
      "Prevents debris from entering unit",
      "Takes only 5 minutes"
    ],
    frequencyMonths: 6,
    priority: "medium",
    difficulty: "easy",
    estimatedTimeMinutes: 15,
    diyCostLow: 0,
    diyCostHigh: 0,
    proCostLow: 75,
    proCostHigh: 125,
    diySteps: [
      "Turn off cold water supply to unit",
      "Place towel under inlet connection",
      "Locate inlet filter at cold water connection",
      "Unscrew filter housing or remove filter screen",
      "Rinse filter under running water",
      "Reinstall filter (check o-ring condition)",
      "Turn water supply back on",
      "Check for leaks"
    ],
    commonMistakes: [
      "Forgetting to turn off water first",
      "Losing small filter screen",
      "Not checking o-ring for damage"
    ],
    whenToCallPro: [
      "If filter housing is damaged",
      "If you notice low water pressure after cleaning"
    ],
    healthImpactIfSkipped: 0.03,
    seasonPreference: "any",
    safetyLevel: "safe"
  },

  // Water Softener
  {
    systemTypeName: "Water Softener",
    name: "Add Salt to Brine Tank",
    description: "Check and refill salt level in water softener brine tank",
    quickSkim: [
      "Check salt level monthly",
      "Add salt when level is below 1/4 full",
      "Use pellet or cube salt (not rock salt)",
      "Don't overfill - leave 4 inches from top"
    ],
    frequencyMonths: 1,
    priority: "medium",
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCostLow: 5,
    diyCostHigh: 25,
    proCostLow: 50,
    proCostHigh: 100,
    diySteps: [
      "Remove brine tank lid",
      "Check salt level (should be above water level)",
      "If salt is below 1/4 full, add more",
      "Use water softener pellets or cubes (solar salt)",
      "Pour salt slowly to avoid bridging",
      "Leave 4-6 inches of space at top",
      "Replace lid"
    ],
    commonMistakes: [
      "Using rock salt (creates more sediment)",
      "Overfilling tank (causes bridging)",
      "Ignoring low salt until water feels hard"
    ],
    whenToCallPro: [
      "If salt bridge has formed (salt stuck to sides)",
      "If water doesn't feel soft despite adequate salt",
      "If brine tank has visible mold or sediment"
    ],
    healthImpactIfSkipped: 0.03,
    seasonPreference: "any",
    requiredMaterials: [{ name: "Water softener salt (40 lb bag)", estimatedCost: 8 }],
    safetyLevel: "safe"
  },
  {
    systemTypeName: "Water Softener",
    name: "Clean Brine Tank",
    description: "Remove sludge and clean brine tank for optimal performance",
    quickSkim: [
      "Do this when tank is nearly empty of salt",
      "Scoop out remaining salt and sludge",
      "Scrub with soapy water",
      "Rinse thoroughly before adding fresh salt"
    ],
    frequencyMonths: 12,
    priority: "low",
    difficulty: "moderate",
    estimatedTimeMinutes: 60,
    diyCostLow: 0,
    diyCostHigh: 10,
    proCostLow: 100,
    proCostHigh: 175,
    diySteps: [
      "Wait until salt level is very low",
      "Put softener in bypass mode",
      "Scoop out remaining salt into bucket",
      "Disconnect brine tank from softener (note connections)",
      "Dump out remaining brine water",
      "Scrub inside with dish soap and warm water",
      "Pay attention to bottom where sludge accumulates",
      "Rinse thoroughly multiple times",
      "Reconnect tank",
      "Add fresh salt",
      "Take softener out of bypass mode",
      "Initiate manual regeneration cycle"
    ],
    commonMistakes: [
      "Not putting softener in bypass first",
      "Not rinsing soap thoroughly (affects regeneration)",
      "Forgetting to initiate regeneration after cleaning"
    ],
    whenToCallPro: [
      "If you find significant mold growth",
      "If tank is cracked or damaged",
      "If unsure about bypass operation"
    ],
    healthImpactIfSkipped: 0.02,
    seasonPreference: "any",
    requiredTools: ["Bucket", "Scrub brush"],
    safetyLevel: "safe",
    deepDiveContent: {
      whyItMatters: "Sludge and insoluble material accumulate at the bottom of the brine tank over time. This can clog the brine line and prevent proper regeneration, leading to hard water breakthrough.",
      proTips: [
        "Clean when you notice salt mushing at the bottom",
        "Consider switching salt brands if sludge accumulates quickly",
        "Clean more frequently with lower-quality salt"
      ]
    }
  },
  {
    systemTypeName: "Water Softener",
    name: "Check and Adjust Settings",
    description: "Verify regeneration settings match current water usage and hardness",
    quickSkim: [
      "Check hardness setting matches water test results",
      "Verify regeneration frequency is appropriate",
      "Adjust if household size changes",
      "Set regeneration time for low-use hours (2-4 AM)"
    ],
    frequencyMonths: 12,
    priority: "routine",
    difficulty: "easy",
    estimatedTimeMinutes: 15,
    diyCostLow: 0,
    diyCostHigh: 15,
    proCostLow: 75,
    proCostHigh: 125,
    diySteps: [
      "Obtain water hardness test (kit or water utility report)",
      "Access softener control panel",
      "Check hardness setting (grains per gallon)",
      "Adjust to match actual water hardness",
      "Check regeneration frequency (should match usage)",
      "Set regeneration time to 2-4 AM",
      "Verify current time is correct on display"
    ],
    commonMistakes: [
      "Setting hardness too high (wastes salt)",
      "Setting hardness too low (incomplete softening)",
      "Regenerating too frequently"
    ],
    whenToCallPro: [
      "If you're unsure of your water hardness",
      "If water feels hard despite correct settings",
      "For initial setup after moving"
    ],
    healthImpactIfSkipped: 0.01,
    seasonPreference: "any",
    requiredMaterials: [{ name: "Water hardness test kit", estimatedCost: 10 }],
    safetyLevel: "safe"
  },

  // Drain System
  {
    systemTypeName: "Drain System",
    name: "Monthly Enzyme Drain Treatment",
    description: "Apply enzyme treatment to maintain healthy drains and prevent buildup",
    quickSkim: [
      "Pour enzyme cleaner down each drain monthly",
      "Works overnight while drains are idle",
      "Safe for pipes and septic systems",
      "Prevents organic buildup before it becomes a clog"
    ],
    frequencyMonths: 1,
    priority: "routine",
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCostLow: 3,
    diyCostHigh: 10,
    proCostLow: 50,
    proCostHigh: 100,
    diySteps: [
      "Purchase enzyme-based drain maintainer (not chemical cleaner)",
      "Apply to each drain according to product directions",
      "Kitchen sink: double dose due to grease",
      "Bathroom drains: focus on shower/tub",
      "Apply before bed so enzymes work overnight",
      "Run water in morning to flush"
    ],
    commonMistakes: [
      "Using chemical drain cleaner instead of enzymes",
      "Not treating all drains",
      "Using too infrequently"
    ],
    whenToCallPro: [
      "If drains are already slow (treatment won't clear existing clogs)",
      "For professional hydro-jetting of main line"
    ],
    healthImpactIfSkipped: 0.02,
    seasonPreference: "any",
    requiredMaterials: [{ name: "Enzyme drain maintainer", estimatedCost: 15 }],
    safetyLevel: "safe",
    deepDiveContent: {
      whyItMatters: "Enzyme treatments contain bacteria that digest organic matter (grease, hair, soap scum) before it accumulates into clogs. Unlike chemical cleaners, they're safe for pipes and septic systems.",
      scienceBehind: "Enzyme cleaners use beneficial bacteria that produce enzymes breaking down organic waste. The bacteria colonize the pipe walls and continue working between treatments."
    }
  },
  {
    systemTypeName: "Drain System",
    name: "Clean P-Traps",
    description: "Remove and clean P-trap under sinks to remove clogs and odors",
    quickSkim: [
      "Place bucket under P-trap",
      "Unscrew slip nuts by hand",
      "Remove trap and clean debris",
      "Reassemble and check for leaks"
    ],
    frequencyMonths: 12,
    priority: "routine",
    difficulty: "easy",
    estimatedTimeMinutes: 20,
    diyCostLow: 0,
    diyCostHigh: 0,
    proCostLow: 75,
    proCostHigh: 125,
    diySteps: [
      "Place bucket under P-trap to catch water",
      "Loosen slip nuts on both ends of P-trap (usually hand-tight)",
      "Remove P-trap - water will drain into bucket",
      "Clean inside of P-trap (use bottle brush)",
      "Check for cracks or corrosion",
      "Clean pipe connections while accessible",
      "Reinstall P-trap (don't overtighten)",
      "Run water and check for leaks"
    ],
    commonMistakes: [
      "Not having bucket ready (makes a mess)",
      "Overtightening plastic slip nuts (cracks them)",
      "Losing the slip nut washers"
    ],
    whenToCallPro: [
      "If P-trap is corroded and needs replacement",
      "If clog is beyond the P-trap"
    ],
    healthImpactIfSkipped: 0.02,
    seasonPreference: "any",
    requiredTools: ["Bucket", "Bottle brush"],
    safetyLevel: "safe"
  },
  {
    systemTypeName: "Drain System",
    name: "Professional Drain Jetting",
    description: "High-pressure water jetting to clear main drain line",
    quickSkim: [
      "Professional service using high-pressure water",
      "Clears years of buildup from main line",
      "Recommended every 2-5 years depending on issues",
      "More effective than snaking for grease/scale"
    ],
    frequencyMonths: 36,
    priority: "low",
    difficulty: "pro_only",
    estimatedTimeMinutes: 120,
    diyCostLow: 0,
    diyCostHigh: 0,
    proCostLow: 300,
    proCostHigh: 600,
    diySteps: [],
    commonMistakes: [
      "Waiting until complete backup to schedule",
      "Choosing jetting when snaking would suffice"
    ],
    whenToCallPro: [
      "This is a professional-only service",
      "Schedule if you have recurring slow drains",
      "After camera inspection reveals buildup"
    ],
    healthImpactIfSkipped: 0.03,
    seasonPreference: "any",
    safetyLevel: "safe",
    deepDiveContent: {
      whyItMatters: "Hydro-jetting uses 3,000-4,000 PSI water pressure to scour pipe walls clean. Unlike snaking, which punches a hole through clogs, jetting removes all buildup and is more effective long-term.",
      proTips: [
        "Always get camera inspection first to assess pipe condition",
        "Older clay or cast iron pipes may not tolerate jetting",
        "Ask about maintenance jetting plans for discounted recurring service"
      ]
    }
  },

  // Garbage Disposal
  {
    systemTypeName: "Garbage Disposal",
    name: "Clean and Deodorize Disposal",
    description: "Clean disposal grinding chamber to eliminate odors",
    quickSkim: [
      "Run ice cubes to clean blades",
      "Follow with citrus peels for freshness",
      "Flush with cold water",
      "Do weekly to prevent odors"
    ],
    frequencyMonths: 1,
    priority: "routine",
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCostLow: 0,
    diyCostHigh: 5,
    proCostLow: 50,
    proCostHigh: 100,
    diySteps: [
      "Run cold water",
      "Pour 2 cups of ice cubes into disposal",
      "Turn on disposal and let ice grind completely",
      "Add 1/2 cup baking soda",
      "Follow with 1 cup white vinegar",
      "Let fizz for 5 minutes",
      "Flush with cold water while running disposal",
      "Optional: grind lemon or orange peel for freshness"
    ],
    commonMistakes: [
      "Using hot water (melts grease, causes buildup downstream)",
      "Never cleaning disposal (odors build up)",
      "Using harsh chemical cleaners"
    ],
    whenToCallPro: [
      "If odor persists after cleaning",
      "If disposal jams frequently",
      "If disposal leaks from bottom"
    ],
    healthImpactIfSkipped: 0.01,
    seasonPreference: "any",
    requiredMaterials: [
      { name: "Ice cubes", estimatedCost: 0 },
      { name: "Baking soda", estimatedCost: 2 },
      { name: "White vinegar", estimatedCost: 3 }
    ],
    safetyLevel: "safe"
  },
  {
    systemTypeName: "Garbage Disposal",
    name: "Reset and Check Disposal",
    description: "Check disposal operation and reset if needed",
    quickSkim: [
      "If disposal hums but doesn't grind, it's jammed",
      "Press reset button on bottom of unit",
      "Use hex key in center hole to free jam",
      "Never put hand inside disposal"
    ],
    frequencyMonths: 12,
    priority: "routine",
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCostLow: 0,
    diyCostHigh: 10,
    proCostLow: 75,
    proCostHigh: 125,
    diySteps: [
      "Turn off disposal and unplug or turn off breaker",
      "Look underneath disposal for red reset button",
      "If popped out, press to reset",
      "Locate hex key hole in center bottom of disposal",
      "Insert 1/4 inch Allen wrench",
      "Turn back and forth to free any jammed items",
      "Remove any debris from drain opening using tongs (never hands)",
      "Restore power and test"
    ],
    commonMistakes: [
      "Putting hand inside disposal (dangerous!)",
      "Not cutting power before attempting to clear jam",
      "Continuing to run jammed disposal"
    ],
    whenToCallPro: [
      "If disposal won't reset after clearing jam",
      "If motor hums but turntable doesn't move",
      "If disposal leaks"
    ],
    healthImpactIfSkipped: 0.01,
    seasonPreference: "any",
    requiredTools: ["1/4 inch Allen wrench", "Flashlight", "Tongs"],
    safetyWarnings: [
      "Never put hand or fingers inside disposal",
      "Always disconnect power before working on disposal"
    ],
    safetyLevel: "caution"
  },

  // Sump Pump
  {
    systemTypeName: "Sump Pump",
    name: "Test Sump Pump Operation",
    description: "Verify sump pump activates and pumps water properly",
    quickSkim: [
      "Pour 5 gallons of water into pit",
      "Pump should activate and empty pit",
      "Check discharge for proper flow",
      "Test monthly during rainy season"
    ],
    frequencyMonths: 3,
    priority: "high",
    difficulty: "easy",
    estimatedTimeMinutes: 15,
    diyCostLow: 0,
    diyCostHigh: 0,
    proCostLow: 75,
    proCostHigh: 150,
    diySteps: [
      "Locate sump pit (usually in basement corner)",
      "Remove pit cover",
      "Slowly pour 5 gallons of water into pit",
      "Float switch should activate pump",
      "Pump should empty pit within 30 seconds",
      "Listen for abnormal sounds",
      "Go outside and verify water exits discharge pipe",
      "Replace pit cover"
    ],
    commonMistakes: [
      "Never testing pump until it fails",
      "Ignoring slow pumping times",
      "Not checking discharge pipe for blockage"
    ],
    whenToCallPro: [
      "If pump doesn't activate",
      "If pump runs but doesn't empty pit",
      "If pump runs continuously",
      "If you hear grinding or burning smell"
    ],
    healthImpactIfSkipped: 0.06,
    seasonPreference: "spring",
    optimalMonths: [3, 4, 5],
    requiredTools: ["5-gallon bucket of water"],
    safetyLevel: "safe",
    deepDiveContent: {
      whyItMatters: "A failed sump pump means a flooded basement. Testing ensures the pump works before you need it. Most pump failures happen when the pump has been idle and then faces a heavy storm.",
      failureModes: [
        "Float switch stuck (pump won't activate)",
        "Impeller clogged with debris",
        "Check valve failed (water flows back)",
        "Discharge pipe frozen or clogged"
      ],
      proTips: [
        "Test monthly during rainy season",
        "Consider a battery backup system",
        "Install a water alarm in pit as early warning"
      ]
    },
    urgencyByAge: { baseUrgency: 1.0, increasePerYear: 0.1, maxMultiplier: 2.0 }
  },
  {
    systemTypeName: "Sump Pump",
    name: "Clean Sump Pit and Pump",
    description: "Remove debris from sump pit and clean pump intake",
    quickSkim: [
      "Remove pump from pit",
      "Clean debris from pit bottom",
      "Rinse pump and clear intake",
      "Check discharge line for obstructions"
    ],
    frequencyMonths: 12,
    priority: "medium",
    difficulty: "moderate",
    estimatedTimeMinutes: 45,
    diyCostLow: 0,
    diyCostHigh: 0,
    proCostLow: 100,
    proCostHigh: 175,
    diySteps: [
      "Unplug sump pump",
      "Remove pump from pit (note discharge connection)",
      "Scoop debris from pit bottom into bucket",
      "Rinse inside of pit with hose",
      "Clean pump intake screen/grate",
      "Check float switch moves freely",
      "Inspect discharge pipe connection",
      "Reinstall pump in pit",
      "Reconnect discharge line",
      "Plug in and test with water"
    ],
    commonMistakes: [
      "Not unplugging pump first",
      "Forgetting how discharge was connected",
      "Not testing after reinstallation"
    ],
    whenToCallPro: [
      "If pump is very heavy or difficult to remove",
      "If you find cracks in pit",
      "If pump shows signs of damage"
    ],
    healthImpactIfSkipped: 0.04,
    seasonPreference: "spring",
    optimalMonths: [3, 4],
    requiredTools: ["Bucket", "Garden hose", "Brush"],
    safetyWarnings: [
      "Always unplug pump before removing",
      "Wear gloves when cleaning pit"
    ],
    safetyLevel: "caution"
  },
  {
    systemTypeName: "Sump Pump",
    name: "Replace Battery Backup",
    description: "Replace battery in backup sump pump system",
    quickSkim: [
      "Check battery condition annually",
      "Replace every 2-3 years",
      "Test backup operation after replacement",
      "Critical for power outage protection"
    ],
    frequencyMonths: 36,
    priority: "medium",
    difficulty: "moderate",
    estimatedTimeMinutes: 30,
    diyCostLow: 100,
    diyCostHigh: 200,
    proCostLow: 200,
    proCostHigh: 350,
    diySteps: [
      "Check battery backup system indicator lights",
      "If battery is 2-3 years old, plan replacement",
      "Purchase correct replacement battery",
      "Disconnect old battery (negative terminal first)",
      "Remove old battery",
      "Install new battery",
      "Connect positive terminal, then negative",
      "Reset system and test backup operation"
    ],
    commonMistakes: [
      "Waiting until battery fails during storm",
      "Using wrong battery type",
      "Not testing backup after installation"
    ],
    whenToCallPro: [
      "If unsure which battery to purchase",
      "If system shows error codes after battery replacement"
    ],
    healthImpactIfSkipped: 0.05,
    seasonPreference: "spring",
    optimalMonths: [3, 4],
    requiredMaterials: [{ name: "Replacement battery", estimatedCost: 150 }],
    safetyLevel: "caution"
  },

  // Septic System
  {
    systemTypeName: "Septic System",
    name: "Pump Septic Tank",
    description: "Professional pumping of septic tank to remove solids",
    quickSkim: [
      "Required every 3-5 years depending on usage",
      "More frequent for larger families",
      "Never wait until backup occurs",
      "Keep pumping records"
    ],
    frequencyMonths: 48,
    priority: "critical",
    difficulty: "pro_only",
    estimatedTimeMinutes: 120,
    diyCostLow: 0,
    diyCostHigh: 0,
    proCostLow: 300,
    proCostHigh: 600,
    diySteps: [],
    commonMistakes: [
      "Waiting until system backs up",
      "Not keeping pumping records",
      "Flushing non-biodegradables"
    ],
    whenToCallPro: [
      "This is a professional-only service",
      "Schedule based on household size: 2 people = every 5 years, 4 people = every 3 years",
      "Immediately if drains slow or sewage odor appears"
    ],
    healthImpactIfSkipped: 0.10,
    seasonPreference: "any",
    safetyLevel: "safe",
    deepDiveContent: {
      whyItMatters: "Septic tanks separate solids from liquids. If not pumped, solids overflow into drain field, clogging it permanently. Drain field replacement costs $10,000-$30,000.",
      scienceBehind: "Bacteria in the tank break down organic waste, but inorganic solids accumulate. When solids exceed 1/3 of tank volume, they begin passing to drain field.",
      failureModes: [
        "Drain field failure (extremely expensive)",
        "Sewage backup into home",
        "Groundwater contamination",
        "Septic odors in yard"
      ],
      proTips: [
        "Keep a septic maintenance log",
        "Know your tank location and access lid",
        "Never drive vehicles over drain field"
      ]
    },
    urgencyByAge: { baseUrgency: 1.0, increasePerYear: 0.03, maxMultiplier: 1.3 }
  },
  {
    systemTypeName: "Septic System",
    name: "Septic System Inspection",
    description: "Professional inspection of septic tank and drain field",
    quickSkim: [
      "Recommended every 3 years",
      "Checks tank levels, baffles, and drain field",
      "Often done with pumping",
      "May include camera inspection"
    ],
    frequencyMonths: 36,
    priority: "high",
    difficulty: "pro_only",
    estimatedTimeMinutes: 60,
    diyCostLow: 0,
    diyCostHigh: 0,
    proCostLow: 200,
    proCostHigh: 400,
    diySteps: [],
    commonMistakes: [
      "Skipping inspections between pumpings",
      "Not getting inspection when buying home"
    ],
    whenToCallPro: [
      "This is a professional-only service",
      "Required for home sale in most areas",
      "If you notice slow drains or odors"
    ],
    healthImpactIfSkipped: 0.05,
    seasonPreference: "any",
    safetyLevel: "safe"
  },
  {
    systemTypeName: "Septic System",
    name: "Add Bacterial Additive",
    description: "Add beneficial bacteria to maintain healthy septic tank biology",
    quickSkim: [
      "Flush bacteria additive monthly",
      "Helps break down solids",
      "Especially important after antibiotics use",
      "Cannot replace pumping"
    ],
    frequencyMonths: 1,
    priority: "routine",
    difficulty: "easy",
    estimatedTimeMinutes: 5,
    diyCostLow: 5,
    diyCostHigh: 15,
    proCostLow: 0,
    proCostHigh: 0,
    diySteps: [
      "Purchase septic-specific bacterial additive",
      "Follow product instructions (usually flush down toilet)",
      "Best to add before bed (long idle time)",
      "Avoid heavy water use for 6-8 hours after"
    ],
    commonMistakes: [
      "Using additives as substitute for pumping (they're not)",
      "Using chemical additives (kills beneficial bacteria)",
      "Adding after using bleach or antibacterial cleaners"
    ],
    whenToCallPro: [
      "If system shows signs of failure despite treatment"
    ],
    healthImpactIfSkipped: 0.01,
    seasonPreference: "any",
    requiredMaterials: [{ name: "Septic bacterial additive", estimatedCost: 10 }],
    safetyLevel: "safe"
  },

  // Well Pump
  {
    systemTypeName: "Well Pump",
    name: "Test Water Quality",
    description: "Annual water quality testing for bacteria and contaminants",
    quickSkim: [
      "Test for coliform bacteria annually",
      "Test for nitrates if near agriculture",
      "Use certified lab for accurate results",
      "Required for home sale"
    ],
    frequencyMonths: 12,
    priority: "high",
    difficulty: "easy",
    estimatedTimeMinutes: 15,
    diyCostLow: 25,
    diyCostHigh: 150,
    proCostLow: 100,
    proCostHigh: 250,
    diySteps: [
      "Obtain water testing kit from county health dept or lab",
      "Follow collection instructions exactly",
      "Run water 5 minutes before collecting sample",
      "Use sterile container provided",
      "Don't touch inside of container",
      "Keep sample cool and deliver to lab within 24 hours",
      "Review results and address any issues"
    ],
    commonMistakes: [
      "Using non-sterile container",
      "Not running water before sampling",
      "Letting sample sit too long before testing"
    ],
    whenToCallPro: [
      "If test shows bacteria present (needs shock chlorination)",
      "If nitrates or other contaminants detected",
      "For comprehensive water quality analysis"
    ],
    healthImpactIfSkipped: 0.04,
    seasonPreference: "spring",
    optimalMonths: [3, 4, 5],
    requiredMaterials: [{ name: "Water testing kit", estimatedCost: 50 }],
    safetyLevel: "safe",
    deepDiveContent: {
      whyItMatters: "Private wells aren't regulated by EPA. You're responsible for ensuring water safety. Contamination can occur suddenly from flooding, septic issues, or agricultural runoff.",
      proTips: [
        "Test more frequently if near farms or septic systems",
        "Test after any flooding or well repairs",
        "Keep records of all test results"
      ]
    }
  },
  {
    systemTypeName: "Well Pump",
    name: "Check Pressure Tank",
    description: "Verify pressure tank pre-charge and operation",
    quickSkim: [
      "Check air pressure when tank is empty",
      "Should be 2 PSI below cut-in pressure",
      "Waterlogged tank = pump short cycling",
      "Typical pre-charge is 28-38 PSI"
    ],
    frequencyMonths: 12,
    priority: "medium",
    difficulty: "moderate",
    estimatedTimeMinutes: 30,
    diyCostLow: 0,
    diyCostHigh: 0,
    proCostLow: 100,
    proCostHigh: 175,
    diySteps: [
      "Turn off power to well pump",
      "Open a faucet to drain pressure tank completely",
      "Locate air valve on top of pressure tank (like tire valve)",
      "Use tire gauge to check air pressure",
      "Should be 2 PSI below cut-in pressure (typically 28 PSI if cut-in is 30)",
      "Add air with compressor or bike pump if needed",
      "Close faucet and restore power",
      "Monitor pump cycling (should run 1-2 min per cycle)"
    ],
    commonMistakes: [
      "Checking pressure with tank full (inaccurate)",
      "Ignoring short-cycling pump (damages pump)",
      "Adding too much air pressure"
    ],
    whenToCallPro: [
      "If tank won't hold air (bladder failure)",
      "If pump cycles every few seconds",
      "If tank is more than 15 years old"
    ],
    healthImpactIfSkipped: 0.04,
    seasonPreference: "any",
    requiredTools: ["Tire pressure gauge", "Air compressor or bike pump"],
    safetyLevel: "caution",
    deepDiveContent: {
      whyItMatters: "The pressure tank prevents the pump from short-cycling (turning on/off rapidly). Short-cycling overheats the pump motor and can reduce pump life from 15 years to 3-5 years.",
      scienceBehind: "Bladder tanks use a rubber bladder to separate air and water. Air pressure on one side compresses as water fills the other. When air leaks or bladder fails, the tank becomes waterlogged."
    },
    urgencyByAge: { baseUrgency: 1.0, increasePerYear: 0.08, maxMultiplier: 1.8 }
  },

  // Pressure Tank
  {
    systemTypeName: "Pressure Tank",
    name: "Check Air Pre-Charge",
    description: "Verify and adjust air pressure in well pressure tank",
    quickSkim: [
      "Same as well pump pressure tank check",
      "Critical for pump longevity",
      "Check annually minimum",
      "Pre-charge = cut-in PSI minus 2"
    ],
    frequencyMonths: 12,
    priority: "medium",
    difficulty: "moderate",
    estimatedTimeMinutes: 30,
    diyCostLow: 0,
    diyCostHigh: 0,
    proCostLow: 100,
    proCostHigh: 175,
    diySteps: [
      "Turn off power to well pump",
      "Drain tank completely by opening faucet",
      "Check air pressure at Schrader valve on tank",
      "Adjust to 2 PSI below cut-in pressure",
      "Restore power and check pump operation"
    ],
    commonMistakes: [
      "Checking pressure with water in tank",
      "Not matching pre-charge to pressure switch settings"
    ],
    whenToCallPro: [
      "If tank won't hold air pressure",
      "If pump short-cycles despite correct pre-charge"
    ],
    healthImpactIfSkipped: 0.04,
    seasonPreference: "any",
    requiredTools: ["Tire pressure gauge", "Air compressor"],
    safetyLevel: "caution"
  },

  // Main Sewer Line
  {
    systemTypeName: "Main Sewer Line",
    name: "Camera Inspection",
    description: "Professional video inspection of main sewer line",
    quickSkim: [
      "Recommended every 5-10 years",
      "Essential before buying older home",
      "Identifies root intrusion, cracks, bellies",
      "Guides appropriate repair methods"
    ],
    frequencyMonths: 60,
    priority: "medium",
    difficulty: "pro_only",
    estimatedTimeMinutes: 60,
    diyCostLow: 0,
    diyCostHigh: 0,
    proCostLow: 200,
    proCostHigh: 400,
    diySteps: [],
    commonMistakes: [
      "Skipping inspection when buying older home",
      "Not getting inspection after repeated backups"
    ],
    whenToCallPro: [
      "This is a professional-only service",
      "Before buying home with trees near sewer line",
      "After repeated drain problems"
    ],
    healthImpactIfSkipped: 0.03,
    seasonPreference: "any",
    safetyLevel: "safe",
    deepDiveContent: {
      whyItMatters: "Sewer line problems are invisible until they cause backups. Camera inspection reveals issues while repairs are still affordable. A small root intrusion ($300 to jet) is much cheaper than a collapsed line ($10,000+).",
      proTips: [
        "Get video recording of inspection",
        "Ask for written report with distances from cleanout",
        "Compare to previous inspections if available"
      ]
    }
  },
  {
    systemTypeName: "Main Sewer Line",
    name: "Root Treatment",
    description: "Apply root killer to prevent tree root intrusion in sewer line",
    quickSkim: [
      "Flush root killer twice yearly",
      "Prevents roots from growing back after jetting",
      "Won't clear existing blockages",
      "Safe for trees when used as directed"
    ],
    frequencyMonths: 6,
    priority: "medium",
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCostLow: 20,
    diyCostHigh: 40,
    proCostLow: 100,
    proCostHigh: 175,
    diySteps: [
      "Purchase root killer (copper sulfate or foaming type)",
      "Follow package directions exactly",
      "Typically flush down toilet closest to main cleanout",
      "Best to apply before bed (longer contact time)",
      "Avoid heavy water use for 8-12 hours",
      "Repeat every 6 months"
    ],
    commonMistakes: [
      "Using as cure for existing blockage (it's prevention only)",
      "Using too much (can damage lawn)",
      "Using in septic system (check product compatibility)"
    ],
    whenToCallPro: [
      "If drains are already slow (need jetting first)",
      "If roots have been identified in line"
    ],
    healthImpactIfSkipped: 0.02,
    seasonPreference: "spring",
    optimalMonths: [3, 4, 9, 10],
    requiredMaterials: [{ name: "Root killer", estimatedCost: 30 }],
    safetyLevel: "safe"
  }
];

// ============================================
// ELECTRICAL MAINTENANCE TEMPLATES
// ============================================
export const electricalTemplates: MaintenanceTemplate[] = [
  // Electrical Panel
  {
    systemTypeName: "Electrical Panel",
    name: "Visual Inspection of Panel",
    description: "Check electrical panel for signs of problems",
    quickSkim: [
      "Look for rust, corrosion, or burn marks",
      "Check for tripped breakers",
      "Listen for buzzing or crackling",
      "Feel for excessive heat"
    ],
    frequencyMonths: 12,
    priority: "high",
    difficulty: "easy",
    estimatedTimeMinutes: 15,
    diyCostLow: 0,
    diyCostHigh: 0,
    proCostLow: 100,
    proCostHigh: 200,
    diySteps: [
      "Stand in front of electrical panel",
      "Open panel cover (usually hinged or removable)",
      "Visual check: look for rust, corrosion, or burn marks",
      "Look for any tripped breakers (handle in middle position)",
      "Listen for buzzing or crackling sounds",
      "Feel around panel for excessive heat (don't touch wires)",
      "Note any breakers that trip frequently",
      "Close panel cover"
    ],
    commonMistakes: [
      "Touching wires or breaker contacts",
      "Ignoring signs of problems",
      "Not noting which breakers trip frequently"
    ],
    whenToCallPro: [
      "If you see burn marks or melting",
      "If you hear buzzing or crackling",
      "If breakers trip frequently",
      "If panel feels hot",
      "If you smell burning"
    ],
    healthImpactIfSkipped: 0.04,
    seasonPreference: "any",
    safetyWarnings: [
      "Never touch wires or breaker contacts",
      "Keep panel area clear of flammable materials",
      "If in doubt, call an electrician"
    ],
    safetyLevel: "caution",
    deepDiveContent: {
      whyItMatters: "Electrical problems cause 50,000 home fires annually. Early detection of panel issues prevents fires and equipment damage.",
      failureModes: [
        "Electrical fire from arcing or overheating",
        "Equipment damage from power surges",
        "Shock hazard from faulty breakers"
      ],
      proTips: [
        "Take a photo of your panel for reference",
        "Label all breakers clearly",
        "Know how to shut off main breaker in emergency"
      ]
    },
    urgencyByAge: { baseUrgency: 1.0, increasePerYear: 0.05, maxMultiplier: 1.5 }
  },
  {
    systemTypeName: "Electrical Panel",
    name: "Test GFCI/AFCI Breakers",
    description: "Test ground fault and arc fault breakers for proper operation",
    quickSkim: [
      "Press TEST button on GFCI/AFCI breakers",
      "Breaker should trip immediately",
      "Reset breaker after test",
      "Replace if test fails"
    ],
    frequencyMonths: 6,
    priority: "high",
    difficulty: "easy",
    estimatedTimeMinutes: 15,
    diyCostLow: 0,
    diyCostHigh: 0,
    proCostLow: 75,
    proCostHigh: 150,
    diySteps: [
      "Locate GFCI/AFCI breakers in panel (have TEST button)",
      "Note which circuits will lose power during test",
      "Press TEST button firmly",
      "Breaker should trip to OFF or middle position",
      "If breaker doesn't trip, it needs replacement",
      "Reset breaker by pushing fully OFF then ON",
      "Verify power is restored to circuit"
    ],
    commonMistakes: [
      "Never testing these safety devices",
      "Not knowing which breakers are GFCI/AFCI",
      "Ignoring failed tests"
    ],
    whenToCallPro: [
      "If any GFCI/AFCI fails to trip during test",
      "If breaker won't reset after tripping"
    ],
    healthImpactIfSkipped: 0.03,
    seasonPreference: "any",
    safetyLevel: "safe",
    deepDiveContent: {
      whyItMatters: "GFCI breakers prevent electrocution. AFCI breakers prevent fires from arc faults. Testing ensures these life-saving devices work when needed."
    }
  },
  {
    systemTypeName: "Electrical Panel",
    name: "Professional Electrical Inspection",
    description: "Licensed electrician inspection of entire electrical system",
    quickSkim: [
      "Recommended every 5 years",
      "Required when buying older home",
      "Checks panel capacity, wiring, and safety",
      "Identifies code violations"
    ],
    frequencyMonths: 60,
    priority: "medium",
    difficulty: "pro_only",
    estimatedTimeMinutes: 120,
    diyCostLow: 0,
    diyCostHigh: 0,
    proCostLow: 200,
    proCostHigh: 400,
    diySteps: [],
    commonMistakes: [
      "Never having electrical system inspected",
      "Ignoring recommendation after adding major appliances"
    ],
    whenToCallPro: [
      "This is a professional-only service",
      "Before buying older home",
      "After adding major electrical loads (EV charger, hot tub)",
      "If you experience frequent breaker trips"
    ],
    healthImpactIfSkipped: 0.04,
    seasonPreference: "any",
    safetyLevel: "safe"
  },

  // Wiring (Whole Home)
  {
    systemTypeName: "Wiring (Whole Home)",
    name: "Test Outlet Grounding",
    description: "Verify outlets are properly grounded using outlet tester",
    quickSkim: [
      "Plug tester into each outlet",
      "Check indicator lights",
      "Identifies open ground, reverse polarity, etc.",
      "Inexpensive and easy"
    ],
    frequencyMonths: 24,
    priority: "medium",
    difficulty: "easy",
    estimatedTimeMinutes: 30,
    diyCostLow: 10,
    diyCostHigh: 20,
    proCostLow: 100,
    proCostHigh: 200,
    diySteps: [
      "Purchase outlet tester ($10-15 at hardware store)",
      "Plug tester into each 3-prong outlet",
      "Check lights against chart on tester",
      "Note any outlets showing problems",
      "Check GFCI outlets by pressing TEST button on tester",
      "Document problem outlets for electrician"
    ],
    commonMistakes: [
      "Only testing a few outlets",
      "Ignoring 2-prong outlets (may need upgrading)",
      "Not testing outdoor/garage outlets"
    ],
    whenToCallPro: [
      "For any outlet showing wiring problems",
      "To upgrade 2-prong outlets to grounded",
      "If multiple outlets show same problem"
    ],
    healthImpactIfSkipped: 0.02,
    seasonPreference: "any",
    requiredTools: ["Outlet tester"],
    safetyLevel: "safe"
  },
  {
    systemTypeName: "Wiring (Whole Home)",
    name: "Check Smoke/CO Detector Wiring",
    description: "Verify hardwired smoke and CO detectors function properly",
    quickSkim: [
      "Test each hardwired detector",
      "All interconnected units should alarm together",
      "Check backup batteries",
      "Replace detectors every 10 years"
    ],
    frequencyMonths: 6,
    priority: "critical",
    difficulty: "easy",
    estimatedTimeMinutes: 20,
    diyCostLow: 0,
    diyCostHigh: 20,
    proCostLow: 75,
    proCostHigh: 150,
    diySteps: [
      "Locate all hardwired smoke and CO detectors",
      "Press test button on one detector",
      "Verify ALL interconnected detectors alarm simultaneously",
      "Test each detector individually",
      "Check backup battery status (most have indicator)",
      "Replace backup batteries if low",
      "Check manufacture date - replace units older than 10 years"
    ],
    commonMistakes: [
      "Only testing one detector (misses interconnection issues)",
      "Ignoring backup battery maintenance",
      "Keeping old detectors past 10-year life"
    ],
    whenToCallPro: [
      "If detectors don't interconnect properly",
      "If hardwired detector won't power on",
      "To add detectors to interconnected system"
    ],
    healthImpactIfSkipped: 0.02,
    seasonPreference: "fall",
    optimalMonths: [10, 11],
    requiredMaterials: [{ name: "9V backup batteries", estimatedCost: 10 }],
    safetyWarnings: [
      "Never disable smoke or CO detectors",
      "If alarm sounds repeatedly, investigate - don't just disconnect"
    ],
    safetyLevel: "safe",
    deepDiveContent: {
      whyItMatters: "Working smoke alarms cut the risk of dying in a home fire in half. Interconnected alarms ensure you hear the alert regardless of where fire starts."
    }
  }
];

// ============================================
// APPLIANCES MAINTENANCE TEMPLATES
// ============================================
export const applianceTemplates: MaintenanceTemplate[] = [
  // Refrigerator
  {
    systemTypeName: "Refrigerator",
    name: "Clean Condenser Coils",
    description: "Remove dust from refrigerator condenser coils for efficient operation",
    quickSkim: [
      "Locate coils (back or underneath fridge)",
      "Unplug refrigerator first",
      "Vacuum or brush coils clean",
      "Critical for efficiency and longevity"
    ],
    frequencyMonths: 12,
    priority: "medium",
    difficulty: "easy",
    estimatedTimeMinutes: 20,
    diyCostLow: 0,
    diyCostHigh: 15,
    proCostLow: 75,
    proCostHigh: 150,
    diySteps: [
      "Unplug refrigerator from outlet",
      "Locate condenser coils (back of fridge or behind bottom grille)",
      "If behind grille, remove grille (usually snaps off)",
      "Use coil brush or vacuum with brush attachment",
      "Gently remove dust and debris from coils",
      "Vacuum loose debris from floor",
      "Replace grille",
      "Plug refrigerator back in"
    ],
    commonMistakes: [
      "Never cleaning coils (shortens compressor life)",
      "Forgetting to unplug first",
      "Using too much force on coils"
    ],
    whenToCallPro: [
      "If coils are damaged",
      "If fridge still runs hot after cleaning",
      "If you can't access the coils"
    ],
    healthImpactIfSkipped: 0.05,
    seasonPreference: "any",
    requiredTools: ["Coil brush or vacuum"],
    safetyLevel: "safe",
    deepDiveContent: {
      whyItMatters: "Dirty coils make the compressor work harder, increasing energy use by 25% and shortening compressor life. This is the #1 cause of premature refrigerator failure.",
      failureModes: [
        "Compressor overheating and failure",
        "Increased energy consumption",
        "Food spoilage from inadequate cooling"
      ],
      proTips: [
        "Clean every 6 months if you have pets",
        "Check door seals at the same time",
        "Keep 1-2 inches of space behind fridge for airflow"
      ]
    },
    urgencyByAge: { baseUrgency: 1.0, increasePerYear: 0.05, maxMultiplier: 1.5 }
  },
  {
    systemTypeName: "Refrigerator",
    name: "Check and Clean Door Seals",
    description: "Inspect and clean refrigerator door gaskets",
    quickSkim: [
      "Visual check for cracks or gaps",
      "Dollar bill test: close door on bill, pull - should resist",
      "Clean with mild soap and water",
      "Replace if damaged"
    ],
    frequencyMonths: 6,
    priority: "routine",
    difficulty: "easy",
    estimatedTimeMinutes: 15,
    diyCostLow: 0,
    diyCostHigh: 50,
    proCostLow: 100,
    proCostHigh: 200,
    diySteps: [
      "Inspect door gaskets for cracks, tears, or gaps",
      "Clean gaskets with mild soap and warm water",
      "Dry thoroughly",
      "Perform dollar bill test: close door on bill",
      "Pull bill out - should feel resistance",
      "Test at multiple points around door",
      "If bill pulls out easily, gasket needs replacement"
    ],
    commonMistakes: [
      "Ignoring sticky or dirty gaskets",
      "Not testing seal all around door",
      "Trying to repair severely damaged gaskets"
    ],
    whenToCallPro: [
      "If gasket needs replacement (can DIY but tricky)",
      "If door is warped or misaligned"
    ],
    healthImpactIfSkipped: 0.02,
    seasonPreference: "any",
    safetyLevel: "safe"
  },
  {
    systemTypeName: "Refrigerator",
    name: "Replace Water Filter",
    description: "Replace refrigerator water/ice filter",
    quickSkim: [
      "Replace every 6 months",
      "Check filter indicator light",
      "Use correct replacement filter",
      "Flush new filter before use"
    ],
    frequencyMonths: 6,
    priority: "routine",
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCostLow: 20,
    diyCostHigh: 60,
    proCostLow: 75,
    proCostHigh: 150,
    diySteps: [
      "Locate water filter (usually inside fridge or in base grille)",
      "Note filter model number for replacement",
      "Turn off water supply if filter is in base grille",
      "Remove old filter (twist, push, or pull depending on model)",
      "Remove cap from new filter if present",
      "Install new filter",
      "Run 2-3 gallons through dispenser to flush",
      "Reset filter indicator if applicable"
    ],
    commonMistakes: [
      "Using wrong filter model",
      "Not flushing new filter (causes black specks)",
      "Ignoring filter indicator"
    ],
    whenToCallPro: [
      "If water continues to taste bad after filter change",
      "If filter housing is damaged"
    ],
    healthImpactIfSkipped: 0.01,
    seasonPreference: "any",
    requiredMaterials: [{ name: "Replacement water filter", estimatedCost: 40 }],
    safetyLevel: "safe"
  },

  // Dishwasher
  {
    systemTypeName: "Dishwasher",
    name: "Clean Filter and Spray Arms",
    description: "Remove and clean dishwasher filter and spray arms",
    quickSkim: [
      "Remove and clean filter monthly",
      "Check spray arm holes for clogs",
      "Use toothpick to clear holes",
      "Rinse filter under running water"
    ],
    frequencyMonths: 1,
    priority: "routine",
    difficulty: "easy",
    estimatedTimeMinutes: 15,
    diyCostLow: 0,
    diyCostHigh: 0,
    proCostLow: 75,
    proCostHigh: 125,
    diySteps: [
      "Remove bottom rack",
      "Locate and remove filter (usually twist or lift out)",
      "Rinse filter under running water",
      "Use soft brush to remove stuck debris",
      "Check spray arms for clogged holes",
      "Use toothpick to clear blocked holes",
      "Wipe inside of dishwasher door edges",
      "Reinstall filter securely"
    ],
    commonMistakes: [
      "Not knowing dishwasher has a filter",
      "Running without filter properly installed",
      "Only cleaning filter, ignoring spray arms"
    ],
    whenToCallPro: [
      "If dishes still come out dirty after cleaning",
      "If water won't drain properly",
      "If spray arms won't spin freely"
    ],
    healthImpactIfSkipped: 0.03,
    seasonPreference: "any",
    requiredTools: ["Soft brush", "Toothpick"],
    safetyLevel: "safe"
  },
  {
    systemTypeName: "Dishwasher",
    name: "Run Cleaning Cycle",
    description: "Run dishwasher cleaner to remove buildup and odors",
    quickSkim: [
      "Use dishwasher cleaner monthly",
      "Run empty cycle on hottest setting",
      "Removes grease, limescale, and odors",
      "Alternative: cup of white vinegar"
    ],
    frequencyMonths: 1,
    priority: "routine",
    difficulty: "easy",
    estimatedTimeMinutes: 5,
    diyCostLow: 0,
    diyCostHigh: 8,
    proCostLow: 0,
    proCostHigh: 0,
    diySteps: [
      "Remove any dishes from dishwasher",
      "Place dishwasher cleaner tablet in bottom (or 2 cups vinegar in bowl on top rack)",
      "Run hottest, longest cycle",
      "Wipe door edges and gasket after cycle",
      "Leave door cracked to dry interior"
    ],
    commonMistakes: [
      "Running with dishes (cleaner is for empty machine)",
      "Using too much cleaner",
      "Not wiping gasket area"
    ],
    whenToCallPro: [
      "If odors persist after cleaning",
      "If you notice mold growth"
    ],
    healthImpactIfSkipped: 0.01,
    seasonPreference: "any",
    requiredMaterials: [{ name: "Dishwasher cleaner", estimatedCost: 5 }],
    safetyLevel: "safe"
  },

  // Washing Machine
  {
    systemTypeName: "Washing Machine",
    name: "Clean Washer Drum and Gasket",
    description: "Run cleaning cycle and wipe gasket to prevent mold and odors",
    quickSkim: [
      "Run tub clean cycle monthly",
      "Wipe front-loader gasket after each use",
      "Leave door open between loads",
      "Prevents mold and mildew"
    ],
    frequencyMonths: 1,
    priority: "medium",
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCostLow: 0,
    diyCostHigh: 10,
    proCostLow: 75,
    proCostHigh: 125,
    diySteps: [
      "Run tub clean or sanitize cycle (use washing machine cleaner)",
      "For front-loaders: pull back door gasket and wipe with cloth",
      "Check gasket folds for trapped debris or mold",
      "Clean detergent dispenser drawer",
      "Wipe exterior and control panel",
      "Leave door and dispenser open to dry"
    ],
    commonMistakes: [
      "Closing door immediately after each load (traps moisture)",
      "Ignoring gasket on front-loaders",
      "Using too much detergent (causes buildup)"
    ],
    whenToCallPro: [
      "If mold is extensive in gasket",
      "If odors persist after cleaning"
    ],
    healthImpactIfSkipped: 0.03,
    seasonPreference: "any",
    requiredMaterials: [{ name: "Washing machine cleaner", estimatedCost: 8 }],
    safetyLevel: "safe",
    deepDiveContent: {
      whyItMatters: "Front-load washers are prone to mold and mildew in the door gasket. This causes musty odors that transfer to clothes. Regular cleaning prevents mold growth.",
      proTips: [
        "Always leave door and dispenser open after use",
        "Use HE detergent in correct amount",
        "Wipe gasket after every load for best results"
      ]
    }
  },
  {
    systemTypeName: "Washing Machine",
    name: "Inspect Water Supply Hoses",
    description: "Check washer hoses for bulges, cracks, or leaks",
    quickSkim: [
      "Look for bulges, cracks, or wear",
      "Check connections for drips",
      "Replace rubber hoses every 5 years",
      "Consider braided stainless steel hoses"
    ],
    frequencyMonths: 12,
    priority: "high",
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCostLow: 0,
    diyCostHigh: 40,
    proCostLow: 100,
    proCostHigh: 175,
    diySteps: [
      "Pull washer away from wall to access hoses",
      "Visually inspect both hot and cold hoses",
      "Look for bulges, cracks, or worn spots",
      "Check connections at wall and washer for drips",
      "Feel hoses for soft spots",
      "Replace rubber hoses every 5 years (or immediately if damaged)",
      "Consider upgrading to braided stainless steel"
    ],
    commonMistakes: [
      "Never inspecting hoses (leading cause of flooding)",
      "Reusing old hoses when moving washer",
      "Over-tightening connections"
    ],
    whenToCallPro: [
      "If you're not comfortable replacing hoses",
      "If shutoff valves are stuck"
    ],
    healthImpactIfSkipped: 0.06,
    seasonPreference: "any",
    requiredMaterials: [{ name: "Braided stainless hoses (pair)", estimatedCost: 30 }],
    safetyLevel: "safe",
    deepDiveContent: {
      whyItMatters: "Washer hose failures cause $150 million in water damage annually in the US. A burst hose can release 650 gallons per hour. This is a top insurance claim.",
      failureModes: [
        "Catastrophic flooding from burst hose",
        "Slow leak causing hidden water damage",
        "Mold from undetected moisture"
      ],
      proTips: [
        "Turn off water supply when traveling",
        "Install an automatic shutoff valve for peace of mind",
        "Keep insurance-required water sensor near washer"
      ]
    },
    urgencyByAge: { baseUrgency: 1.0, increasePerYear: 0.15, maxMultiplier: 2.5 }
  },

  // Dryer
  {
    systemTypeName: "Dryer",
    name: "Clean Lint Trap",
    description: "Remove lint from trap before every load",
    quickSkim: [
      "Clean before EVERY load",
      "Remove visible lint",
      "Wash screen monthly with soap",
      "Dryer sheet residue reduces airflow"
    ],
    frequencyMonths: 1,
    priority: "high",
    difficulty: "easy",
    estimatedTimeMinutes: 5,
    diyCostLow: 0,
    diyCostHigh: 0,
    proCostLow: 0,
    proCostHigh: 0,
    diySteps: [
      "Remove lint trap from dryer",
      "Remove visible lint by hand or with brush",
      "Monthly: wash screen with warm soapy water",
      "Let dry completely before reinstalling",
      "Vacuum inside lint trap slot occasionally"
    ],
    commonMistakes: [
      "Not cleaning before every load",
      "Only removing visible lint, ignoring buildup on screen",
      "Forgetting to clean inside the trap slot"
    ],
    whenToCallPro: [
      "If dryer takes longer than normal to dry clothes",
      "If dryer or laundry room feels hot during operation"
    ],
    healthImpactIfSkipped: 0.04,
    seasonPreference: "any",
    safetyWarnings: [
      "Lint buildup is a leading cause of dryer fires",
      "If clothes are very hot after drying, check vent immediately"
    ],
    safetyLevel: "safe"
  },
  {
    systemTypeName: "Dryer",
    name: "Clean Dryer Vent Duct",
    description: "Remove lint buildup from entire vent system from dryer to exterior",
    quickSkim: [
      "Critical fire safety task",
      "Clean duct from dryer to outside vent",
      "Use vent cleaning brush or hire pro",
      "Should be done annually minimum"
    ],
    frequencyMonths: 12,
    priority: "critical",
    difficulty: "moderate",
    estimatedTimeMinutes: 45,
    diyCostLow: 20,
    diyCostHigh: 40,
    proCostLow: 100,
    proCostHigh: 200,
    diySteps: [
      "Unplug dryer and pull away from wall",
      "Disconnect vent duct from back of dryer",
      "Use vent cleaning brush kit (available at hardware stores)",
      "Brush through duct from dryer end toward outside",
      "Go outside and clean exterior vent hood",
      "Vacuum loose lint from behind dryer",
      "Reconnect duct securely (use metal tape, not screws)",
      "Push dryer back, leaving some slack in vent"
    ],
    commonMistakes: [
      "Never cleaning the full vent run",
      "Using plastic or foil duct (fire hazard)",
      "Crushing duct when pushing dryer back"
    ],
    whenToCallPro: [
      "If vent runs through wall or roof",
      "If dryer still takes too long after cleaning",
      "For long or complex vent runs"
    ],
    healthImpactIfSkipped: 0.08,
    seasonPreference: "fall",
    optimalMonths: [9, 10, 11],
    requiredTools: ["Vent cleaning brush kit", "Vacuum"],
    safetyWarnings: [
      "Lint is highly flammable - dryer fires cause 15,000+ fires annually",
      "Don't use screws in duct (catch lint)"
    ],
    safetyLevel: "caution",
    deepDiveContent: {
      whyItMatters: "Dryers cause 15,500 home fires annually, and lint buildup is the leading cause. A clogged vent also wastes energy and shortens dryer life.",
      scienceBehind: "Lint is extremely flammable and accumulates in vent ductwork over time. Combined with the high heat of dryer exhaust, conditions become dangerous. Restricted airflow also causes dryer to overheat.",
      failureModes: [
        "Dryer fire",
        "Dryer overheating and shutting down",
        "Carbon monoxide backup (gas dryers)",
        "Premature dryer failure"
      ],
      proTips: [
        "Use rigid metal duct, not flexible foil",
        "Keep vent run as short and straight as possible",
        "Clean more frequently if you have pets"
      ]
    },
    urgencyByAge: { baseUrgency: 1.0, increasePerYear: 0.05, maxMultiplier: 1.5 }
  },

  // Oven/Range
  {
    systemTypeName: "Oven/Range",
    name: "Clean Range Hood Filter",
    description: "Remove and clean grease filter in range hood",
    quickSkim: [
      "Remove filter from range hood",
      "Soak in hot soapy water or run through dishwasher",
      "Let dry before reinstalling",
      "Clean monthly for heavy cooking"
    ],
    frequencyMonths: 3,
    priority: "routine",
    difficulty: "easy",
    estimatedTimeMinutes: 20,
    diyCostLow: 0,
    diyCostHigh: 0,
    proCostLow: 50,
    proCostHigh: 100,
    diySteps: [
      "Turn off range hood",
      "Remove grease filter (usually slides or pops out)",
      "Soak in hot water with dish soap or degreaser",
      "For heavy grease: add 1/4 cup baking soda to water",
      "Let soak 15-20 minutes",
      "Scrub gently with brush",
      "Rinse and let dry completely",
      "Reinstall filter"
    ],
    commonMistakes: [
      "Never cleaning filter (reduces effectiveness, fire hazard)",
      "Reinstalling while wet",
      "Using harsh chemicals that damage filter"
    ],
    whenToCallPro: [
      "If hood doesn't vent properly after filter cleaning",
      "If ductwork needs cleaning"
    ],
    healthImpactIfSkipped: 0.02,
    seasonPreference: "any",
    requiredTools: ["Dish soap or degreaser", "Brush"],
    safetyLevel: "safe"
  },
  {
    systemTypeName: "Oven/Range",
    name: "Self-Clean Oven Cycle",
    description: "Run oven self-clean cycle to remove baked-on residue",
    quickSkim: [
      "Remove racks before self-clean",
      "Expect some smoke and odor",
      "Door locks during cycle",
      "Wipe ash after cooling"
    ],
    frequencyMonths: 6,
    priority: "routine",
    difficulty: "easy",
    estimatedTimeMinutes: 240,
    diyCostLow: 0,
    diyCostHigh: 0,
    proCostLow: 0,
    proCostHigh: 0,
    diySteps: [
      "Remove oven racks (high heat can damage them)",
      "Remove large food debris from oven floor",
      "Close door and select self-clean cycle",
      "Choose duration based on soil level (2-4 hours)",
      "Ventilate kitchen during cycle",
      "Door will lock during cycle",
      "After cooling (may take several hours), wipe ash with damp cloth"
    ],
    commonMistakes: [
      "Leaving racks in during self-clean",
      "Running cycle with heavy food debris",
      "Not ventilating kitchen"
    ],
    whenToCallPro: [
      "If door doesn't unlock after cycle",
      "If heating elements don't work after cycle",
      "If excessive smoke occurs"
    ],
    healthImpactIfSkipped: 0.01,
    seasonPreference: "any",
    safetyWarnings: [
      "Keep children and pets away during cycle",
      "Ensure kitchen is well-ventilated",
      "Do not leave home during cycle"
    ],
    safetyLevel: "caution"
  },
  {
    systemTypeName: "Oven/Range",
    name: "Inspect Gas Line Connections",
    description: "Check gas connections for leaks using soapy water",
    quickSkim: [
      "Apply soapy water to connections",
      "Bubbles indicate gas leak",
      "Check flexible gas connector condition",
      "If you smell gas, leave and call gas company"
    ],
    frequencyMonths: 12,
    priority: "high",
    difficulty: "easy",
    estimatedTimeMinutes: 15,
    diyCostLow: 0,
    diyCostHigh: 0,
    proCostLow: 75,
    proCostHigh: 150,
    diySteps: [
      "Mix 50/50 solution of dish soap and water",
      "Apply solution to gas line connections at range",
      "Watch for bubbles forming (indicates leak)",
      "Check flexible connector for cracks or damage",
      "Verify connector is less than 5 feet long (code requirement)"
    ],
    commonMistakes: [
      "Never checking gas connections",
      "Using old or damaged flexible connectors",
      "Ignoring faint gas odors"
    ],
    whenToCallPro: [
      "If you detect any gas leak (even small)",
      "If flexible connector needs replacement",
      "If you smell gas but can't find source"
    ],
    healthImpactIfSkipped: 0.04,
    seasonPreference: "any",
    safetyWarnings: [
      "If you smell gas strongly, leave house and call gas company from outside",
      "Don't create sparks or flames during leak check"
    ],
    safetyLevel: "danger"
  }
];

// ============================================
// STRUCTURAL MAINTENANCE TEMPLATES
// ============================================
export const structuralTemplates: MaintenanceTemplate[] = [
  // Roof (Asphalt Shingle)
  {
    systemTypeName: "Roof (Asphalt Shingle)",
    name: "Visual Roof Inspection",
    description: "Ground-level inspection of roof condition",
    quickSkim: [
      "Use binoculars from ground level",
      "Look for missing, curled, or damaged shingles",
      "Check flashing around vents and chimneys",
      "Look for moss or algae growth"
    ],
    frequencyMonths: 6,
    priority: "medium",
    difficulty: "easy",
    estimatedTimeMinutes: 20,
    diyCostLow: 0,
    diyCostHigh: 0,
    proCostLow: 100,
    proCostHigh: 200,
    diySteps: [
      "Walk around house perimeter with binoculars",
      "Look for missing or damaged shingles",
      "Check for curling or buckling shingles",
      "Examine flashing around chimneys, vents, skylights",
      "Look for moss, algae, or dark streaks",
      "Check gutters for granules (sign of wear)",
      "Look for sagging areas in roof line",
      "Note any concerns for professional evaluation"
    ],
    commonMistakes: [
      "Getting on roof without safety equipment",
      "Ignoring small issues until they become big",
      "Not checking after major storms"
    ],
    whenToCallPro: [
      "For roof access (don't climb without training/equipment)",
      "If you see damaged or missing shingles",
      "If you notice dark stains in attic or ceiling"
    ],
    healthImpactIfSkipped: 0.04,
    seasonPreference: "spring",
    optimalMonths: [3, 4, 9, 10],
    requiredTools: ["Binoculars"],
    safetyWarnings: [
      "Do NOT walk on roof without proper safety equipment",
      "Inspect from ground level only"
    ],
    safetyLevel: "safe",
    deepDiveContent: {
      whyItMatters: "Roof damage leads to water intrusion, which causes structural damage, mold, and expensive repairs. Catching problems early saves thousands in repairs.",
      failureModes: [
        "Water infiltration from damaged shingles",
        "Ice dam damage in winter",
        "Wind uplift of loose shingles"
      ],
      proTips: [
        "Check after every major storm",
        "Binoculars allow safe ground-level inspection",
        "Document with photos for comparison over time"
      ]
    },
    urgencyByAge: { baseUrgency: 1.0, increasePerYear: 0.06, maxMultiplier: 1.8 }
  },
  {
    systemTypeName: "Roof (Asphalt Shingle)",
    name: "Professional Roof Inspection",
    description: "Detailed professional inspection of roof system",
    quickSkim: [
      "Recommended annually for older roofs",
      "Pro walks roof and checks all components",
      "Includes attic inspection for leaks",
      "Get written report with photos"
    ],
    frequencyMonths: 24,
    priority: "medium",
    difficulty: "pro_only",
    estimatedTimeMinutes: 60,
    diyCostLow: 0,
    diyCostHigh: 0,
    proCostLow: 150,
    proCostHigh: 350,
    diySteps: [],
    commonMistakes: [
      "Only calling roofer when there's a leak",
      "Not getting multiple opinions on repair recommendations"
    ],
    whenToCallPro: [
      "This is a professional-only service",
      "Schedule before buying/selling home",
      "After major storms",
      "When roof is 15+ years old"
    ],
    healthImpactIfSkipped: 0.05,
    seasonPreference: "fall",
    optimalMonths: [9, 10],
    safetyLevel: "safe",
    urgencyByAge: { baseUrgency: 0.8, increasePerYear: 0.1, maxMultiplier: 2.0 }
  },
  {
    systemTypeName: "Roof (Asphalt Shingle)",
    name: "Clean Gutters and Downspouts",
    description: "Remove debris from gutters and ensure proper drainage",
    quickSkim: [
      "Clean twice yearly minimum",
      "Remove leaves and debris",
      "Flush with hose to check flow",
      "Check downspouts for clogs"
    ],
    frequencyMonths: 6,
    priority: "high",
    difficulty: "moderate",
    estimatedTimeMinutes: 60,
    diyCostLow: 0,
    diyCostHigh: 25,
    proCostLow: 100,
    proCostHigh: 250,
    diySteps: [
      "Set up ladder safely on firm, level ground",
      "Work along gutter removing debris by hand or with scoop",
      "Place debris in bucket hung from ladder",
      "Use garden hose to flush gutters toward downspouts",
      "Verify water flows freely through downspouts",
      "Clear any downspout clogs from top or bottom",
      "Check gutter slope (water should not pool)",
      "Inspect for loose or damaged sections"
    ],
    commonMistakes: [
      "Using unsafe ladder practices",
      "Waiting until gutters overflow",
      "Not checking downspouts for clogs"
    ],
    whenToCallPro: [
      "If uncomfortable on ladders",
      "For multi-story homes",
      "If gutters need repair or replacement"
    ],
    healthImpactIfSkipped: 0.06,
    seasonPreference: "fall",
    optimalMonths: [5, 11],
    requiredTools: ["Ladder", "Gutter scoop", "Garden hose", "Bucket"],
    safetyWarnings: [
      "Use ladder safely - have someone hold it",
      "Don't overreach from ladder",
      "Wear gloves to protect from sharp debris"
    ],
    safetyLevel: "caution",
    deepDiveContent: {
      whyItMatters: "Clogged gutters cause water to overflow near foundation, leading to basement flooding, foundation damage, and landscaping erosion. Ice dams form in clogged gutters.",
      failureModes: [
        "Foundation water damage",
        "Basement flooding",
        "Ice dam formation",
        "Fascia and soffit rot"
      ],
      proTips: [
        "Consider gutter guards to reduce cleaning frequency",
        "Extend downspouts 4-6 feet from foundation",
        "Clean after leaves fall and before winter"
      ]
    }
  },

  // Foundation
  {
    systemTypeName: "Foundation",
    name: "Inspect Foundation for Cracks",
    description: "Visual inspection of visible foundation for cracks and damage",
    quickSkim: [
      "Walk perimeter and inspect visible foundation",
      "Look for new or expanding cracks",
      "Note any stair-step cracks (concerning)",
      "Check for water staining"
    ],
    frequencyMonths: 6,
    priority: "high",
    difficulty: "easy",
    estimatedTimeMinutes: 30,
    diyCostLow: 0,
    diyCostHigh: 0,
    proCostLow: 150,
    proCostHigh: 400,
    diySteps: [
      "Walk around home exterior examining foundation",
      "Look for vertical cracks (common, often cosmetic)",
      "Look for horizontal cracks (more concerning)",
      "Look for stair-step cracks in block foundations (structural)",
      "Check basement/crawlspace walls from inside",
      "Note any new cracks or changes in existing cracks",
      "Mark crack ends with date to monitor growth",
      "Take photos for comparison"
    ],
    commonMistakes: [
      "Ignoring small cracks",
      "Not monitoring cracks over time",
      "Filling cracks without addressing cause"
    ],
    whenToCallPro: [
      "For horizontal cracks (sign of lateral pressure)",
      "For stair-step cracks in block",
      "If cracks are growing rapidly",
      "If you see bowing walls"
    ],
    healthImpactIfSkipped: 0.06,
    seasonPreference: "spring",
    optimalMonths: [3, 4, 9, 10],
    safetyLevel: "safe",
    deepDiveContent: {
      whyItMatters: "Foundation problems are among the most expensive home repairs. Early detection allows for less invasive, less expensive solutions. Catching lateral movement early is critical.",
      scienceBehind: "Foundations crack from soil movement, water pressure, and settling. Vertical cracks are usually settlement and often cosmetic. Horizontal cracks indicate lateral pressure and are structural concerns.",
      failureModes: [
        "Structural failure requiring foundation repair ($10k-$30k+)",
        "Water infiltration into basement",
        "Uneven floors and stuck doors"
      ],
      proTips: [
        "Use painter's tape to date-stamp crack ends",
        "Photograph same spots each inspection",
        "Keep drainage away from foundation"
      ]
    },
    urgencyByAge: { baseUrgency: 0.8, increasePerYear: 0.04, maxMultiplier: 1.5 }
  },
  {
    systemTypeName: "Foundation",
    name: "Maintain Drainage Away from Foundation",
    description: "Ensure water drains away from foundation, not toward it",
    quickSkim: [
      "Ground should slope away from house",
      "Downspouts should discharge 4-6 feet away",
      "Clear debris from foundation area",
      "Add soil if needed for proper grading"
    ],
    frequencyMonths: 12,
    priority: "medium",
    difficulty: "moderate",
    estimatedTimeMinutes: 60,
    diyCostLow: 0,
    diyCostHigh: 50,
    proCostLow: 200,
    proCostHigh: 500,
    diySteps: [
      "Walk perimeter during/after rain to observe drainage",
      "Identify areas where water pools near foundation",
      "Verify 6-inch drop in first 10 feet from foundation",
      "Add topsoil to build up grade if needed",
      "Extend downspouts with splash blocks or extensions",
      "Clear debris from window wells",
      "Ensure landscaping slopes away from house"
    ],
    commonMistakes: [
      "Letting mulch or soil buildup above foundation",
      "Downspouts dumping water against foundation",
      "Ignoring minor pooling"
    ],
    whenToCallPro: [
      "For major grading work",
      "If drainage problems persist despite efforts",
      "For French drain installation"
    ],
    healthImpactIfSkipped: 0.04,
    seasonPreference: "spring",
    optimalMonths: [4, 5],
    requiredTools: ["Shovel", "Rake"],
    requiredMaterials: [{ name: "Topsoil (if needed)", estimatedCost: 30 }],
    safetyLevel: "safe"
  },

  // Windows
  {
    systemTypeName: "Windows",
    name: "Inspect and Clean Window Tracks",
    description: "Clean window tracks and check operation",
    quickSkim: [
      "Vacuum tracks to remove debris",
      "Wipe with damp cloth",
      "Check that windows open/close smoothly",
      "Lubricate tracks if needed"
    ],
    frequencyMonths: 12,
    priority: "routine",
    difficulty: "easy",
    estimatedTimeMinutes: 45,
    diyCostLow: 0,
    diyCostHigh: 10,
    proCostLow: 75,
    proCostHigh: 150,
    diySteps: [
      "Vacuum window tracks with crevice attachment",
      "Wipe tracks with damp cloth",
      "Use old toothbrush for corners",
      "Dry thoroughly",
      "Open and close each window several times",
      "If sticky, apply silicone spray to tracks",
      "Check weatherstripping condition",
      "Clean weep holes (small drainage holes at bottom)"
    ],
    commonMistakes: [
      "Using oil-based lubricant (attracts dirt)",
      "Ignoring stuck windows",
      "Not cleaning weep holes"
    ],
    whenToCallPro: [
      "If windows are painted shut",
      "If frames are damaged",
      "For replacement weatherstripping"
    ],
    healthImpactIfSkipped: 0.02,
    seasonPreference: "spring",
    optimalMonths: [4, 5],
    requiredTools: ["Vacuum", "Cloth", "Silicone spray"],
    safetyLevel: "safe"
  },
  {
    systemTypeName: "Windows",
    name: "Check Caulking and Seals",
    description: "Inspect and repair caulking around window frames",
    quickSkim: [
      "Look for cracked or missing caulk",
      "Check for drafts around frames",
      "Re-caulk as needed",
      "Prevents water damage and energy loss"
    ],
    frequencyMonths: 12,
    priority: "medium",
    difficulty: "easy",
    estimatedTimeMinutes: 60,
    diyCostLow: 5,
    diyCostHigh: 20,
    proCostLow: 100,
    proCostHigh: 200,
    diySteps: [
      "Inspect caulk around all exterior window frames",
      "Look for cracks, gaps, or missing sections",
      "Remove old, failed caulk with putty knife",
      "Clean surface with rubbing alcohol",
      "Apply exterior-grade silicone or latex caulk",
      "Smooth with wet finger or tool",
      "Check interior caulk as well"
    ],
    commonMistakes: [
      "Using interior caulk outside",
      "Caulking over dirty surfaces",
      "Not removing old failed caulk"
    ],
    whenToCallPro: [
      "If window frames are rotting",
      "If glazing (glass seal) is failing",
      "For large-scale recaulking project"
    ],
    healthImpactIfSkipped: 0.03,
    seasonPreference: "fall",
    optimalMonths: [9, 10],
    requiredTools: ["Caulk gun", "Putty knife"],
    requiredMaterials: [{ name: "Exterior caulk", estimatedCost: 8 }],
    safetyLevel: "safe",
    deepDiveContent: {
      whyItMatters: "Failed caulk allows water infiltration, which causes wood rot and mold. It also allows air infiltration, wasting 10-25% of heating/cooling energy.",
      proTips: [
        "Caulk when temperature is above 50°F",
        "Choose caulk rated for 20+ year life",
        "Cut nozzle at angle for clean application"
      ]
    }
  }
];

// ============================================
// EXTERIOR MAINTENANCE TEMPLATES
// ============================================
export const exteriorTemplates: MaintenanceTemplate[] = [
  // Exterior Paint/Siding
  {
    systemTypeName: "Exterior Paint",
    name: "Inspect Exterior Paint Condition",
    description: "Walk property to identify peeling, cracking, or fading paint",
    quickSkim: [
      "Look for peeling or flaking paint",
      "Check for exposed wood",
      "Inspect caulk at trim joints",
      "Note areas for touch-up"
    ],
    frequencyMonths: 12,
    priority: "medium",
    difficulty: "easy",
    estimatedTimeMinutes: 30,
    diyCostLow: 0,
    diyCostHigh: 0,
    proCostLow: 100,
    proCostHigh: 200,
    diySteps: [
      "Walk around entire house exterior",
      "Look at all painted surfaces from ground level",
      "Use binoculars for high areas",
      "Note any peeling, cracking, or blistering",
      "Check for exposed bare wood (needs immediate attention)",
      "Examine trim, fascia, and window frames closely",
      "Take photos of problem areas"
    ],
    commonMistakes: [
      "Only inspecting visible areas",
      "Ignoring small peeling areas",
      "Waiting until major failure to repaint"
    ],
    whenToCallPro: [
      "For high or hard-to-reach areas",
      "If extensive peeling indicates paint failure",
      "For lead paint concerns (pre-1978 homes)"
    ],
    healthImpactIfSkipped: 0.03,
    seasonPreference: "spring",
    optimalMonths: [4, 5],
    safetyLevel: "safe",
    deepDiveContent: {
      whyItMatters: "Paint protects wood siding and trim from moisture damage. Once paint fails, wood absorbs water, causing rot. Touching up small areas prevents expensive full repainting.",
      proTips: [
        "Address peeling immediately - it only spreads",
        "South and west sides deteriorate fastest",
        "Quality paint lasts 10-15 years; budget paint 5-7"
      ]
    },
    urgencyByAge: { baseUrgency: 0.8, increasePerYear: 0.1, maxMultiplier: 2.0 }
  },
  {
    systemTypeName: "Exterior Paint",
    name: "Power Wash Exterior",
    description: "Clean siding, decks, and walkways with pressure washer",
    quickSkim: [
      "Use appropriate pressure for surface type",
      "Work from top to bottom",
      "Keep nozzle moving to avoid damage",
      "Great pre-painting prep"
    ],
    frequencyMonths: 12,
    priority: "routine",
    difficulty: "moderate",
    estimatedTimeMinutes: 180,
    diyCostLow: 50,
    diyCostHigh: 100,
    proCostLow: 200,
    proCostHigh: 500,
    diySteps: [
      "Rent or purchase pressure washer if needed",
      "Use wide spray tip for siding (40°)",
      "Start at top and work down",
      "Keep nozzle 12-18 inches from surface",
      "Keep nozzle moving to prevent damage",
      "Use lower pressure for wood (1500-2000 PSI)",
      "Higher pressure okay for concrete (2500-3000 PSI)"
    ],
    commonMistakes: [
      "Using too much pressure (damages siding)",
      "Spraying up under siding (forces water in)",
      "Holding nozzle too close"
    ],
    whenToCallPro: [
      "For multi-story homes",
      "If unsure about pressure settings",
      "For soft wash of delicate surfaces"
    ],
    healthImpactIfSkipped: 0.01,
    seasonPreference: "spring",
    optimalMonths: [4, 5, 6],
    requiredTools: ["Pressure washer"],
    safetyWarnings: [
      "Wear safety glasses - debris flies",
      "Never point at people, pets, or windows",
      "Start with low pressure, increase as needed"
    ],
    safetyLevel: "caution"
  },

  // Driveway (Concrete)
  {
    systemTypeName: "Driveway (Concrete)",
    name: "Inspect and Repair Cracks",
    description: "Fill small cracks before they grow into major damage",
    quickSkim: [
      "Fill cracks less than 1/2 inch wide",
      "Use concrete crack filler",
      "Prevents water from widening cracks",
      "Best done in spring"
    ],
    frequencyMonths: 12,
    priority: "medium",
    difficulty: "easy",
    estimatedTimeMinutes: 45,
    diyCostLow: 10,
    diyCostHigh: 30,
    proCostLow: 150,
    proCostHigh: 400,
    diySteps: [
      "Clean cracks with wire brush",
      "Remove loose debris with shop vacuum",
      "For small cracks: use concrete crack filler (squeeze bottle)",
      "For larger cracks: use backer rod then caulk-style filler",
      "Overfill slightly (filler shrinks)",
      "Smooth with putty knife",
      "Allow to cure per product directions",
      "Seal entire driveway for best protection"
    ],
    commonMistakes: [
      "Ignoring small cracks",
      "Filling without cleaning first",
      "Using wrong filler type"
    ],
    whenToCallPro: [
      "For cracks wider than 1/2 inch",
      "For heaved or sunken sections",
      "For extensive damage requiring replacement"
    ],
    healthImpactIfSkipped: 0.03,
    seasonPreference: "spring",
    optimalMonths: [4, 5, 9, 10],
    requiredTools: ["Wire brush", "Putty knife"],
    requiredMaterials: [{ name: "Concrete crack filler", estimatedCost: 15 }],
    safetyLevel: "safe",
    deepDiveContent: {
      whyItMatters: "Water enters cracks, freezes, and expands, making cracks larger. A $15 repair today prevents a $5,000 replacement later.",
      proTips: [
        "Best time to repair is spring (moderate temps)",
        "Consider sealing entire driveway after repairs",
        "Mark heaved sections for professional evaluation"
      ]
    }
  },
  {
    systemTypeName: "Driveway (Concrete)",
    name: "Seal Concrete Driveway",
    description: "Apply protective sealer to extend driveway life",
    quickSkim: [
      "Clean thoroughly before sealing",
      "Apply sealer with roller or sprayer",
      "Prevents water and salt damage",
      "Seal every 2-3 years"
    ],
    frequencyMonths: 36,
    priority: "low",
    difficulty: "moderate",
    estimatedTimeMinutes: 180,
    diyCostLow: 50,
    diyCostHigh: 150,
    proCostLow: 200,
    proCostHigh: 500,
    diySteps: [
      "Clean driveway thoroughly (pressure wash recommended)",
      "Repair any cracks first",
      "Allow to dry completely (24-48 hours)",
      "Apply sealer with roller, brush, or pump sprayer",
      "Work in sections, maintain wet edge",
      "Apply thin, even coat",
      "Allow to cure per product directions (usually 24 hours)",
      "Apply second coat if recommended"
    ],
    commonMistakes: [
      "Applying to dirty or damp concrete",
      "Applying too thick (causes peeling)",
      "Sealing too frequently"
    ],
    whenToCallPro: [
      "For large driveways",
      "If decorative concrete",
      "If unsure about product selection"
    ],
    healthImpactIfSkipped: 0.02,
    seasonPreference: "fall",
    optimalMonths: [9, 10],
    requiredTools: ["Roller or sprayer", "Pressure washer"],
    requiredMaterials: [{ name: "Concrete sealer (5 gal)", estimatedCost: 100 }],
    safetyLevel: "safe"
  },

  // Fence (Wood)
  {
    systemTypeName: "Fence (Wood)",
    name: "Inspect Wood Fence",
    description: "Check posts, boards, and hardware for damage",
    quickSkim: [
      "Walk fence line checking all posts",
      "Push on posts to check for rot",
      "Look for loose or missing boards",
      "Check gate hardware"
    ],
    frequencyMonths: 12,
    priority: "medium",
    difficulty: "easy",
    estimatedTimeMinutes: 30,
    diyCostLow: 0,
    diyCostHigh: 0,
    proCostLow: 75,
    proCostHigh: 150,
    diySteps: [
      "Walk entire fence line",
      "Push on each post - should be firm",
      "Look for rot at base of posts (often hidden by dirt)",
      "Check for loose, cracked, or missing boards",
      "Verify rails are attached securely",
      "Open and close gates - should swing freely",
      "Check gate latches and hinges",
      "Note repairs needed"
    ],
    commonMistakes: [
      "Only inspecting from one side",
      "Not checking post bases",
      "Ignoring minor damage until major failure"
    ],
    whenToCallPro: [
      "For multiple rotted posts",
      "If fence is leaning significantly",
      "For major reconstruction"
    ],
    healthImpactIfSkipped: 0.03,
    seasonPreference: "spring",
    optimalMonths: [4, 5],
    safetyLevel: "safe"
  },
  {
    systemTypeName: "Fence (Wood)",
    name: "Stain or Seal Wood Fence",
    description: "Apply protective stain or sealant to wood fence",
    quickSkim: [
      "Clean fence first (pressure wash or scrub)",
      "Apply stain or sealant with sprayer or brush",
      "Protects against rot and UV damage",
      "Reapply every 2-3 years"
    ],
    frequencyMonths: 36,
    priority: "low",
    difficulty: "moderate",
    estimatedTimeMinutes: 480,
    diyCostLow: 75,
    diyCostHigh: 200,
    proCostLow: 500,
    proCostHigh: 1500,
    diySteps: [
      "Clean fence with pressure washer (1500 PSI) or scrub brush",
      "Make any repairs before staining",
      "Allow to dry 24-48 hours",
      "Apply stain/sealant with pump sprayer, brush, or roller",
      "Work from top to bottom",
      "Maintain wet edge to avoid lap marks",
      "Do both sides of fence if accessible",
      "Allow to cure per product directions"
    ],
    commonMistakes: [
      "Staining dirty or wet wood",
      "Not cleaning mildew first",
      "Applying too thick"
    ],
    whenToCallPro: [
      "For very long fences",
      "If fence needs repair first",
      "For hard-to-access areas"
    ],
    healthImpactIfSkipped: 0.03,
    seasonPreference: "spring",
    optimalMonths: [4, 5, 9, 10],
    requiredTools: ["Pump sprayer or brush", "Pressure washer"],
    requiredMaterials: [{ name: "Exterior wood stain (5 gal)", estimatedCost: 150 }],
    safetyLevel: "safe"
  },

  // Garage Door & Opener
  {
    systemTypeName: "Garage Door & Opener",
    name: "Lubricate Garage Door Components",
    description: "Apply lubricant to moving parts for quiet, smooth operation",
    quickSkim: [
      "Use garage door specific lubricant (not WD-40)",
      "Apply to hinges, rollers, springs, tracks",
      "Operate door several times to distribute",
      "Do this twice yearly"
    ],
    frequencyMonths: 6,
    priority: "routine",
    difficulty: "easy",
    estimatedTimeMinutes: 15,
    diyCostLow: 5,
    diyCostHigh: 15,
    proCostLow: 75,
    proCostHigh: 150,
    diySteps: [
      "Disconnect garage door opener (pull release cord)",
      "Apply lubricant to each hinge pivot point",
      "Lubricate roller bearings (not nylon surface)",
      "Apply to spring coils (carefully)",
      "Lubricate lock mechanism",
      "Light spray on track where rollers ride",
      "Reconnect opener",
      "Operate door several times to distribute"
    ],
    commonMistakes: [
      "Using WD-40 (attracts dust, dries out)",
      "Over-lubricating (drips on floor)",
      "Not lubricating springs"
    ],
    whenToCallPro: [
      "If door is off track",
      "If springs are damaged (DANGEROUS to DIY)",
      "If door is very noisy after lubrication"
    ],
    healthImpactIfSkipped: 0.02,
    seasonPreference: "any",
    requiredMaterials: [{ name: "Garage door lubricant", estimatedCost: 8 }],
    safetyWarnings: [
      "Never touch or attempt to adjust torsion springs",
      "Springs under extreme tension - can cause serious injury"
    ],
    safetyLevel: "caution"
  },
  {
    systemTypeName: "Garage Door & Opener",
    name: "Test Garage Door Safety Features",
    description: "Verify auto-reverse and photo-eye safety features work",
    quickSkim: [
      "Test auto-reverse with 2x4 on floor",
      "Test photo-eyes by breaking beam",
      "Both features required for safety",
      "Test monthly"
    ],
    frequencyMonths: 1,
    priority: "high",
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCostLow: 0,
    diyCostHigh: 0,
    proCostLow: 75,
    proCostHigh: 150,
    diySteps: [
      "Test auto-reverse: Place 2x4 flat on floor under door",
      "Close door - should reverse when touching board",
      "If door doesn't reverse, adjust force setting (see manual)",
      "Test photo-eyes: Start closing door",
      "Break beam with foot or object - door should reverse immediately",
      "Clean photo-eye lenses with soft cloth if needed",
      "Test monthly for family safety"
    ],
    commonMistakes: [
      "Never testing safety features",
      "Disabling safety features because they're 'annoying'",
      "Ignoring failed tests"
    ],
    whenToCallPro: [
      "If auto-reverse doesn't work after force adjustment",
      "If photo-eyes are damaged",
      "If opener is very old and lacks safety features"
    ],
    healthImpactIfSkipped: 0.02,
    seasonPreference: "any",
    safetyWarnings: [
      "Garage doors can cause serious injury or death",
      "Keep children away during testing",
      "Never disable safety features"
    ],
    safetyLevel: "safe",
    deepDiveContent: {
      whyItMatters: "Garage doors weigh 150-400+ pounds and cause deaths and serious injuries every year. The auto-reverse and photo-eye features are literally life-saving. Federal law has required these since 1993.",
      proTips: [
        "Test monthly - make it part of your routine",
        "Replace opener if it lacks photo-eyes",
        "Teach children garage door safety"
      ]
    }
  },
  {
    systemTypeName: "Garage Door & Opener",
    name: "Inspect Weather Seals",
    description: "Check and replace worn door seals and weatherstripping",
    quickSkim: [
      "Check bottom seal for cracks or gaps",
      "Inspect side and top weatherstripping",
      "Look for daylight around closed door",
      "Replace damaged seals"
    ],
    frequencyMonths: 12,
    priority: "routine",
    difficulty: "easy",
    estimatedTimeMinutes: 30,
    diyCostLow: 15,
    diyCostHigh: 50,
    proCostLow: 100,
    proCostHigh: 175,
    diySteps: [
      "Close garage door",
      "From inside, look for daylight around edges",
      "Check bottom seal for cracks, tears, or stiffness",
      "Inspect weatherstripping on sides and top",
      "Replace bottom seal if damaged (slides into channel)",
      "Replace side/top weatherstripping if dried or missing",
      "Ensure door sits flat on floor when closed"
    ],
    commonMistakes: [
      "Ignoring damaged seals",
      "Using wrong replacement seal type",
      "Not checking all four sides"
    ],
    whenToCallPro: [
      "If door doesn't sit flat (needs adjustment)",
      "If you can't find correct replacement seal"
    ],
    healthImpactIfSkipped: 0.01,
    seasonPreference: "fall",
    optimalMonths: [9, 10],
    requiredMaterials: [{ name: "Garage door bottom seal", estimatedCost: 25 }],
    safetyLevel: "safe"
  }
];

// ============================================
// COMBINED EXPORT
// ============================================
export const allMaintenanceTemplates: MaintenanceTemplate[] = [
  ...hvacTemplates,
  ...plumbingTemplates,
  ...electricalTemplates,
  ...applianceTemplates,
  ...structuralTemplates,
  ...exteriorTemplates,
];
