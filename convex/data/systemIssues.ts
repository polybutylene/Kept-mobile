// Common issues by system type with Weibull probability curves
// Powers the "Common Issues" section in System Hub pages

export interface SystemIssue {
  systemTypeName: string;
  issueName: string;
  description: string;
  // Weibull probability modeling
  baseOccurrenceRate: number; // Annual probability at year 0 (0-1)
  weibullShape: number; // k parameter (>1 = increasing failure rate)
  weibullScale: number; // λ parameter (years)
  // Symptoms & Detection
  symptoms: string[];
  earlyWarningSigns?: string[];
  // Severity & Cost
  severity: "minor" | "moderate" | "major" | "critical";
  repairCostLow: number;
  repairCostHigh: number;
  // DIY info
  isDiyFixable: boolean;
  diyDifficulty?: "easy" | "moderate" | "hard";
  diyFixSteps?: string[];
  // Prevention
  preventionTips?: string[];
  relatedMaintenanceTasks?: string[];
  preventionEffectiveness?: number; // 0-1
  sortOrder: number;
}

// ============================================
// HVAC ISSUES
// ============================================
export const hvacIssues: SystemIssue[] = [
  // Central Air Conditioner
  {
    systemTypeName: "Central Air Conditioner",
    issueName: "Refrigerant Leak",
    description: "Loss of refrigerant through damaged lines or connections",
    baseOccurrenceRate: 0.02,
    weibullShape: 2.5,
    weibullScale: 12,
    symptoms: [
      "AC runs but doesn't cool well",
      "Ice forming on refrigerant lines",
      "Hissing or bubbling sounds",
      "Higher than normal electric bills"
    ],
    earlyWarningSigns: [
      "Slightly reduced cooling capacity",
      "System running longer than usual"
    ],
    severity: "moderate",
    repairCostLow: 200,
    repairCostHigh: 1500,
    isDiyFixable: false,
    preventionTips: [
      "Annual professional tune-up",
      "Keep outdoor unit clear of debris",
      "Inspect refrigerant lines annually"
    ],
    relatedMaintenanceTasks: ["Annual AC Tune-Up", "Inspect Refrigerant Lines"],
    preventionEffectiveness: 0.4,
    sortOrder: 1
  },
  {
    systemTypeName: "Central Air Conditioner",
    issueName: "Capacitor Failure",
    description: "Start or run capacitor fails, preventing compressor or fan operation",
    baseOccurrenceRate: 0.03,
    weibullShape: 2.0,
    weibullScale: 8,
    symptoms: [
      "AC won't start",
      "Humming sound but no cooling",
      "Fan not spinning",
      "AC starts then shuts off quickly"
    ],
    earlyWarningSigns: [
      "Slow startup",
      "Clicking sounds at startup"
    ],
    severity: "minor",
    repairCostLow: 100,
    repairCostHigh: 300,
    isDiyFixable: false,
    preventionTips: [
      "Annual tune-up includes capacitor testing",
      "Protect outdoor unit from power surges"
    ],
    relatedMaintenanceTasks: ["Annual AC Tune-Up"],
    preventionEffectiveness: 0.3,
    sortOrder: 2
  },
  {
    systemTypeName: "Central Air Conditioner",
    issueName: "Compressor Failure",
    description: "Main compressor motor fails, requiring major repair or replacement",
    baseOccurrenceRate: 0.01,
    weibullShape: 3.5,
    weibullScale: 15,
    symptoms: [
      "No cooling at all",
      "Outdoor unit runs but no cold air",
      "Loud grinding or clanking noises",
      "Circuit breaker tripping repeatedly"
    ],
    earlyWarningSigns: [
      "Reduced cooling over time",
      "Hard starting",
      "Unusual vibration"
    ],
    severity: "critical",
    repairCostLow: 1400,
    repairCostHigh: 3700,
    isDiyFixable: false,
    preventionTips: [
      "Change filters regularly",
      "Annual professional maintenance",
      "Keep refrigerant at proper level",
      "Protect from power surges"
    ],
    relatedMaintenanceTasks: ["Replace HVAC Filter", "Annual AC Tune-Up", "Clean Condenser Coils"],
    preventionEffectiveness: 0.5,
    sortOrder: 3
  },
  {
    systemTypeName: "Central Air Conditioner",
    issueName: "Frozen Evaporator Coil",
    description: "Ice forms on indoor coil, blocking airflow and reducing cooling",
    baseOccurrenceRate: 0.05,
    weibullShape: 1.5,
    weibullScale: 10,
    symptoms: [
      "Warm air from vents",
      "Ice visible on indoor unit",
      "Water dripping from indoor unit",
      "System running constantly"
    ],
    earlyWarningSigns: [
      "Reduced airflow",
      "Frost on refrigerant line"
    ],
    severity: "moderate",
    repairCostLow: 100,
    repairCostHigh: 400,
    isDiyFixable: true,
    diyDifficulty: "easy",
    diyFixSteps: [
      "Turn off AC, run fan only to thaw",
      "Check and replace air filter",
      "Ensure vents are open and unblocked",
      "If problem persists, call pro (may be refrigerant issue)"
    ],
    preventionTips: [
      "Change filters regularly",
      "Keep vents open and unblocked",
      "Ensure adequate airflow"
    ],
    relatedMaintenanceTasks: ["Replace HVAC Filter"],
    preventionEffectiveness: 0.7,
    sortOrder: 4
  },
  {
    systemTypeName: "Central Air Conditioner",
    issueName: "Fan Motor Failure",
    description: "Condenser or blower fan motor fails",
    baseOccurrenceRate: 0.02,
    weibullShape: 2.2,
    weibullScale: 12,
    symptoms: [
      "Fan not spinning",
      "Loud humming or buzzing",
      "AC overheating and shutting off",
      "Burning smell"
    ],
    earlyWarningSigns: [
      "Squealing or grinding noises",
      "Intermittent fan operation"
    ],
    severity: "moderate",
    repairCostLow: 300,
    repairCostHigh: 800,
    isDiyFixable: false,
    preventionTips: [
      "Keep outdoor unit clean",
      "Annual maintenance",
      "Don't obstruct airflow around unit"
    ],
    relatedMaintenanceTasks: ["Clean Condenser Coils", "Annual AC Tune-Up"],
    preventionEffectiveness: 0.4,
    sortOrder: 5
  },

  // Gas Furnace
  {
    systemTypeName: "Gas Furnace",
    issueName: "Cracked Heat Exchanger",
    description: "Crack in heat exchanger allows combustion gases into home air",
    baseOccurrenceRate: 0.005,
    weibullShape: 4.0,
    weibullScale: 20,
    symptoms: [
      "Carbon monoxide detector alarm",
      "Soot around furnace",
      "Yellow or flickering flame (should be blue)",
      "Strong odor when furnace runs",
      "Family members experiencing headaches or flu-like symptoms"
    ],
    earlyWarningSigns: [
      "Visible corrosion on heat exchanger",
      "Flame disturbance when blower starts"
    ],
    severity: "critical",
    repairCostLow: 1500,
    repairCostHigh: 3000,
    isDiyFixable: false,
    preventionTips: [
      "Annual professional inspection",
      "Change filters regularly",
      "Install CO detectors on every level"
    ],
    relatedMaintenanceTasks: ["Annual Furnace Tune-Up", "Test Carbon Monoxide Detectors"],
    preventionEffectiveness: 0.6,
    sortOrder: 1
  },
  {
    systemTypeName: "Gas Furnace",
    issueName: "Igniter Failure",
    description: "Hot surface igniter or pilot light system fails",
    baseOccurrenceRate: 0.04,
    weibullShape: 1.8,
    weibullScale: 5,
    symptoms: [
      "No heat",
      "Furnace tries to start but doesn't ignite",
      "Clicking sounds with no ignition"
    ],
    earlyWarningSigns: [
      "Delayed ignition",
      "Multiple attempts to light"
    ],
    severity: "minor",
    repairCostLow: 100,
    repairCostHigh: 300,
    isDiyFixable: false,
    preventionTips: [
      "Annual tune-up",
      "Keep furnace area clean"
    ],
    relatedMaintenanceTasks: ["Annual Furnace Tune-Up"],
    preventionEffectiveness: 0.3,
    sortOrder: 2
  },
  {
    systemTypeName: "Gas Furnace",
    issueName: "Blower Motor Failure",
    description: "Blower motor fails, preventing air circulation",
    baseOccurrenceRate: 0.02,
    weibullShape: 2.5,
    weibullScale: 15,
    symptoms: [
      "No air from vents",
      "Furnace runs but no airflow",
      "Loud humming or squealing",
      "Furnace overheating and shutting off"
    ],
    earlyWarningSigns: [
      "Reduced airflow",
      "Unusual noises from blower"
    ],
    severity: "moderate",
    repairCostLow: 400,
    repairCostHigh: 1000,
    isDiyFixable: false,
    preventionTips: [
      "Change filters regularly",
      "Annual maintenance",
      "Ensure registers are open"
    ],
    relatedMaintenanceTasks: ["Replace Furnace Filter", "Annual Furnace Tune-Up"],
    preventionEffectiveness: 0.4,
    sortOrder: 3
  },

  // Heat Pump
  {
    systemTypeName: "Heat Pump",
    issueName: "Reversing Valve Failure",
    description: "Valve that switches between heating and cooling modes fails",
    baseOccurrenceRate: 0.02,
    weibullShape: 2.0,
    weibullScale: 12,
    symptoms: [
      "Stuck in heating or cooling mode",
      "Can't switch between modes",
      "Incorrect temperature air from vents"
    ],
    earlyWarningSigns: [
      "Slow mode transition",
      "Temperature inconsistency"
    ],
    severity: "moderate",
    repairCostLow: 400,
    repairCostHigh: 1200,
    isDiyFixable: false,
    preventionTips: [
      "Annual professional tune-up",
      "Regular filter changes"
    ],
    relatedMaintenanceTasks: ["Annual Heat Pump Tune-Up"],
    preventionEffectiveness: 0.3,
    sortOrder: 1
  },
  {
    systemTypeName: "Heat Pump",
    issueName: "Defrost Cycle Failure",
    description: "System can't defrost outdoor coil in winter",
    baseOccurrenceRate: 0.03,
    weibullShape: 1.8,
    weibullScale: 10,
    symptoms: [
      "Ice buildup on outdoor unit",
      "Poor heating performance",
      "System running constantly in winter"
    ],
    earlyWarningSigns: [
      "Frost that doesn't clear",
      "Extended defrost cycles"
    ],
    severity: "moderate",
    repairCostLow: 200,
    repairCostHigh: 600,
    isDiyFixable: false,
    preventionTips: [
      "Keep outdoor unit clear of snow",
      "Annual maintenance",
      "Ensure proper airflow around unit"
    ],
    relatedMaintenanceTasks: ["Clear Outdoor Unit of Snow/Ice", "Annual Heat Pump Tune-Up"],
    preventionEffectiveness: 0.5,
    sortOrder: 2
  }
];

// ============================================
// PLUMBING ISSUES
// ============================================
export const plumbingIssues: SystemIssue[] = [
  // ============================================
  // Water Heater (Tank) — 10 issues from field-calibrated system profile
  // Source: convex/data/profiles/tank_water_heater_electric.json
  // ============================================
  {
    systemTypeName: "Water Heater (Tank)",
    issueName: "No Hot Water",
    description: "No hot water at any faucet. Cold water works normally. Water heater making no sound or heating activity. Most common cause is a tripped breaker (30 seconds to check).",
    baseOccurrenceRate: 0.05,
    weibullShape: 2.0,
    weibullScale: 9,
    symptoms: [
      "No hot water at any faucet in the home",
      "Cold water works normally",
      "Water heater is silent (no heating activity)",
      "Circuit breaker may be in tripped (middle) position"
    ],
    earlyWarningSigns: [
      "Breaker that has tripped before",
      "Occasional lukewarm water",
      "High-limit reset popping out"
    ],
    severity: "moderate",
    repairCostLow: 0,
    repairCostHigh: 300,
    isDiyFixable: true,
    diyDifficulty: "easy",
    diyFixSteps: [
      "Check the electrical panel — locate the water heater breaker (typically 30A double-pole)",
      "If breaker is tripped (middle position), turn fully OFF then firmly back ON",
      "Wait 20-30 minutes and check for warm water at the nearest faucet",
      "If breaker holds, monitor for recurrence. If it trips again within 24-48 hours, call a pro",
      "If breaker was not tripped: turn off breaker, remove upper access panel, check red high-limit reset button — if popped out, press firmly to reset"
    ],
    preventionTips: [
      "Install a whole-home surge protector to prevent power surge damage",
      "Test high-limit reset button during annual electrical inspection",
      "Flush tank annually to prevent sediment from overheating elements"
    ],
    relatedMaintenanceTasks: ["Inspect Electrical Connections and High-Limit Reset", "Flush Tank and Drain Sediment"],
    preventionEffectiveness: 0.4,
    sortOrder: 1
  },
  {
    systemTypeName: "Water Heater (Tank)",
    issueName: "Insufficient Hot Water",
    description: "Hot water runs out faster than expected — some hot water available but doesn't last through a normal shower or dishwashing cycle. Recovery time between uses seems longer than it used to be.",
    baseOccurrenceRate: 0.06,
    weibullShape: 2.5,
    weibullScale: 8,
    symptoms: [
      "Hot water runs out after 5-10 minutes (instead of 15-20+)",
      "Lukewarm water only — never truly hot",
      "Recovery time between uses exceeds 45-60 minutes",
      "Popping or rumbling sounds during heating (sediment indicator)"
    ],
    earlyWarningSigns: [
      "Gradual decrease in hot water duration over weeks/months",
      "Slight temperature inconsistency",
      "Tank making more noise during heating cycles"
    ],
    severity: "minor",
    repairCostLow: 0,
    repairCostHigh: 250,
    isDiyFixable: true,
    diyDifficulty: "moderate",
    diyFixSteps: [
      "First: flush the tank to remove sediment that may be insulating the lower element",
      "If that doesn't help: check thermostat setting — verify it hasn't been turned down",
      "Measure hot water temperature at the tap — if below 115°F with thermostat at 120°F mark, thermostat may have drifted",
      "Consider whether household demand has increased (new members, appliances)"
    ],
    preventionTips: [
      "Flush tank annually (or semi-annually in hard water areas) to prevent sediment from burying the lower element",
      "Keep thermostat at 120°F — verify with a tap thermometer",
      "Stagger hot water usage (don't run dishwasher and showers simultaneously)"
    ],
    relatedMaintenanceTasks: ["Flush Tank and Drain Sediment", "Verify Thermostat Temperature Setting"],
    preventionEffectiveness: 0.5,
    sortOrder: 2
  },
  {
    systemTypeName: "Water Heater (Tank)",
    issueName: "Rusty or Discolored Hot Water",
    description: "Hot water appears rusty, brown, orange, or reddish when first turned on. Cold water runs clear. Often indicates active corrosion inside the tank — a precursor to tank failure.",
    baseOccurrenceRate: 0.03,
    weibullShape: 3.5,
    weibullScale: 10,
    symptoms: [
      "Hot water is rusty, brown, orange, or reddish",
      "Cold water runs clear (confirming source is the water heater)",
      "Discoloration may clear after running faucet for 30-60 seconds",
      "May be constant or intermittent"
    ],
    earlyWarningSigns: [
      "Slight discoloration that clears quickly (early corrosion)",
      "Metallic taste in hot water",
      "Gritty sediment in faucet aerator screens"
    ],
    severity: "major",
    repairCostLow: 25,
    repairCostHigh: 2500,
    isDiyFixable: false,
    preventionTips: [
      "Inspect and replace anode rod every 2-3 years (single most effective prevention)",
      "Flush tank annually to remove corrosion byproducts",
      "Install a water softener in hard water areas to slow corrosion"
    ],
    relatedMaintenanceTasks: ["Inspect Anode Rod Condition", "Flush Tank and Drain Sediment"],
    preventionEffectiveness: 0.7,
    sortOrder: 3
  },
  {
    systemTypeName: "Water Heater (Tank)",
    issueName: "Popping or Rumbling Noises",
    description: "Tank makes popping, crackling, rumbling, or knocking sounds during heating cycles. This is the classic sound of sediment buildup — heating element heats the sediment layer, trapping water underneath that flashes to steam.",
    baseOccurrenceRate: 0.08,
    weibullShape: 2.0,
    weibullScale: 7,
    symptoms: [
      "Popping, crackling sounds during heating cycles",
      "Rumbling or knocking that may be heard in adjacent rooms",
      "Sounds are intermittent or coincide with recovery after hot water use"
    ],
    earlyWarningSigns: [
      "Faint popping sounds that gradually get louder over months",
      "Slightly longer recovery times",
      "Sandy sediment visible when draining a gallon from the drain valve"
    ],
    severity: "minor",
    repairCostLow: 0,
    repairCostHigh: 350,
    isDiyFixable: true,
    diyDifficulty: "moderate",
    diyFixSteps: [
      "Perform a full tank flush — this is the primary remedy",
      "In severe cases, flush 2-3 times or let cold supply stir sediment between drains",
      "Drain a gallon into a white bucket first to assess sediment level",
      "If flushing doesn't resolve the noise, elements may need professional cleaning or replacement"
    ],
    preventionTips: [
      "Flush tank annually (quarterly in hard water areas >250 ppm)",
      "Install a water softener if hardness exceeds 150 ppm",
      "Don't wait until noises are loud — even faint popping means sediment is accumulating"
    ],
    relatedMaintenanceTasks: ["Flush Tank and Drain Sediment"],
    preventionEffectiveness: 0.8,
    sortOrder: 4
  },
  {
    systemTypeName: "Water Heater (Tank)",
    issueName: "Water Around Base of Tank",
    description: "Water pooling on the floor around the base or standing water in the drip pan. Requires immediate investigation — could be a minor fitting drip or the beginning of catastrophic tank failure.",
    baseOccurrenceRate: 0.04,
    weibullShape: 3.5,
    weibullScale: 11,
    symptoms: [
      "Water pooling on the floor around the base",
      "Standing water in the drip pan",
      "Moisture or rust stains on nearby walls/floor",
      "Musty or mildew smell near water heater"
    ],
    earlyWarningSigns: [
      "Small mineral deposits (white or green) at fittings",
      "Slight dampness under tank or in drip pan",
      "Rust streaks on tank exterior near bottom weld seam"
    ],
    severity: "critical",
    repairCostLow: 15,
    repairCostHigh: 2500,
    isDiyFixable: false,
    preventionTips: [
      "Quarterly visual leak inspection (10 minutes — paper towel test on all fittings)",
      "Install a smart water leak detector in the drip pan ($20-$40)",
      "Maintain drip pan drain line — test semi-annually",
      "Inspect and replace anode rod to prevent internal corrosion"
    ],
    relatedMaintenanceTasks: ["Inspect for Leaks, Moisture, and Corrosion", "Check Drip Pan and Drain Line", "Inspect Anode Rod Condition"],
    preventionEffectiveness: 0.6,
    sortOrder: 5
  },
  {
    systemTypeName: "Water Heater (Tank)",
    issueName: "T&P Valve Continuous Discharge",
    description: "T&P relief valve periodically opens and releases hot water through the discharge pipe, or drips constantly. Usually a thermal expansion issue in a closed plumbing system, not a defective valve.",
    baseOccurrenceRate: 0.04,
    weibullShape: 1.8,
    weibullScale: 8,
    symptoms: [
      "Water dripping or flowing from T&P discharge pipe",
      "Periodic hissing/rushing from the valve",
      "Water on the floor near the discharge pipe termination"
    ],
    earlyWarningSigns: [
      "Minor dripping that coincides with heating cycles",
      "Mineral deposits building up on discharge pipe",
      "Slight increase in water pressure readings"
    ],
    severity: "moderate",
    repairCostLow: 50,
    repairCostHigh: 500,
    isDiyFixable: false,
    diyFixSteps: [
      "Check if home has a closed plumbing system (look for a PRV or check valve on the main water line)",
      "If closed system with no expansion tank → that's likely the cause",
      "Check if discharge happens primarily during/after heating cycles (confirms thermal expansion)",
      "Do NOT cap, plug, or restrict the T&P discharge pipe"
    ],
    preventionTips: [
      "Install a thermal expansion tank on the cold water supply line",
      "Check expansion tank air charge annually",
      "Test T&P valve annually and replace every 5-7 years"
    ],
    relatedMaintenanceTasks: ["Test T&P Relief Valve", "Check Expansion Tank (If Equipped)"],
    preventionEffectiveness: 0.8,
    sortOrder: 6
  },
  {
    systemTypeName: "Water Heater (Tank)",
    issueName: "Rotten Egg / Sulfur Smell in Hot Water",
    description: "Hot water has a sulfur or rotten egg odor. Caused by sulfate-reducing bacteria feeding on hydrogen gas produced by the magnesium anode rod's reaction with water. Not a health hazard but extremely unpleasant.",
    baseOccurrenceRate: 0.03,
    weibullShape: 1.5,
    weibullScale: 6,
    symptoms: [
      "Sulfur or rotten egg smell from hot water only",
      "Smell is strongest when tap is first turned on",
      "Cold water does not have the odor",
      "Worse after heater has sat unused for several hours"
    ],
    earlyWarningSigns: [
      "Faint metallic or mineral taste in hot water",
      "Very slight sulfur smell that's easy to dismiss"
    ],
    severity: "minor",
    repairCostLow: 25,
    repairCostHigh: 250,
    isDiyFixable: true,
    diyDifficulty: "hard",
    diyFixSteps: [
      "First: determine if smell is from hot water only (water heater issue) or both hot and cold (supply issue)",
      "If hot only: replace magnesium anode rod with aluminum/zinc alloy rod (zinc inhibits bacterial growth)",
      "After rod replacement, flush tank with hydrogen peroxide solution (2 pints of 3% per 40 gallons) to kill existing bacteria",
      "Alternative: install a powered anode rod ($80-$150) — uses electrical current, never depletes, eliminates bacteria food source"
    ],
    preventionTips: [
      "Use aluminum/zinc anode rod instead of magnesium in areas with high sulfate water",
      "Maintain thermostat at 120°F minimum (bacteria thrive in cooler water)",
      "Consider a powered anode rod for a permanent solution"
    ],
    relatedMaintenanceTasks: ["Inspect Anode Rod Condition"],
    preventionEffectiveness: 0.9,
    sortOrder: 7
  },
  {
    systemTypeName: "Water Heater (Tank)",
    issueName: "Circuit Breaker Keeps Tripping",
    description: "The circuit breaker for the water heater trips repeatedly. Indicates a short circuit, grounded element, or wiring fault — potential fire hazard. Do not continue resetting the breaker.",
    baseOccurrenceRate: 0.03,
    weibullShape: 2.5,
    weibullScale: 9,
    symptoms: [
      "Breaker trips immediately upon being reset",
      "Breaker trips after a few hours of operation (during heating cycle)",
      "Burning smell near water heater or electrical panel",
      "Scorch marks on junction box or wire insulation"
    ],
    earlyWarningSigns: [
      "Occasional breaker trips that become more frequent",
      "Warm or discolored wire connections in junction box",
      "Slight burning smell near access panels"
    ],
    severity: "critical",
    repairCostLow: 200,
    repairCostHigh: 400,
    isDiyFixable: false,
    preventionTips: [
      "Annual inspection of electrical connections and junction box",
      "Install a whole-home surge protector",
      "Flush tank regularly to reduce sediment stress on elements",
      "Replace elements and thermostats proactively at 8-10 years"
    ],
    relatedMaintenanceTasks: ["Inspect Electrical Connections and High-Limit Reset"],
    preventionEffectiveness: 0.5,
    sortOrder: 8
  },
  {
    systemTypeName: "Water Heater (Tank)",
    issueName: "Water Too Hot / Overheating",
    description: "Hot water at faucets is excessively hot — much hotter than the thermostat setting. Water may produce visible steam. Scalding risk is present, especially for children and elderly.",
    baseOccurrenceRate: 0.02,
    weibullShape: 2.0,
    weibullScale: 10,
    symptoms: [
      "Water is noticeably hotter than normal at faucets",
      "Visible steam from hot water tap",
      "Water temperature exceeds 140°F at the tap",
      "High-limit reset tripping repeatedly"
    ],
    earlyWarningSigns: [
      "Gradual increase in hot water temperature",
      "Water feels slightly hotter than usual over weeks",
      "T&P valve occasionally dripping (responding to high temp)"
    ],
    severity: "critical",
    repairCostLow: 15,
    repairCostHigh: 300,
    isDiyFixable: true,
    diyDifficulty: "easy",
    diyFixSteps: [
      "FIRST: If water is steaming at the tap, turn off the circuit breaker immediately",
      "Check the thermostat setting — it may have been accidentally adjusted",
      "Adjust to 120°F per the thermostat verification maintenance task",
      "If adjusting thermostat doesn't change output temperature → thermostat contacts may be stuck (call a pro)"
    ],
    preventionTips: [
      "Verify thermostat setting annually with a tap thermometer",
      "Set both upper and lower thermostats to the same position",
      "Consider installing thermostatic mixing valves at point-of-use fixtures for permanent scald protection"
    ],
    relatedMaintenanceTasks: ["Verify Thermostat Temperature Setting", "Test T&P Relief Valve"],
    preventionEffectiveness: 0.6,
    sortOrder: 9
  },
  {
    systemTypeName: "Water Heater (Tank)",
    issueName: "Slow Recovery / High Energy Bills",
    description: "Water heater takes noticeably longer to reheat after heavy use and/or electric bills have increased without usage change. Indicates declining efficiency from scale buildup or element degradation.",
    baseOccurrenceRate: 0.06,
    weibullShape: 2.0,
    weibullScale: 8,
    symptoms: [
      "Recovery time after heavy use is 1-2 hours instead of 30-45 minutes",
      "Electric bills have increased 10-20% without usage change",
      "Tank exterior feels warmer than it used to (insulation degradation)",
      "Popping sounds during heating (element scale)"
    ],
    earlyWarningSigns: [
      "Slightly longer recovery times developing gradually",
      "Minor electric bill increase over several months",
      "Heating cycles running longer/more frequently"
    ],
    severity: "minor",
    repairCostLow: 0,
    repairCostHigh: 350,
    isDiyFixable: true,
    diyDifficulty: "moderate",
    diyFixSteps: [
      "Flush the tank to remove loose sediment insulating elements from water",
      "If flush doesn't improve recovery: elements may need professional removal and descaling or replacement",
      "Check if tank exterior is warm (add insulation blanket if so — $15-$40)",
      "Insulate the first 6-10 feet of hot water pipes from the heater"
    ],
    preventionTips: [
      "Flush tank annually (quarterly in hard water areas)",
      "Insulate hot water pipes within 10 feet of the heater",
      "Add a tank insulation blanket if the heater is in an unconditioned space",
      "Budget for element replacement at 8-10 years"
    ],
    relatedMaintenanceTasks: ["Flush Tank and Drain Sediment"],
    preventionEffectiveness: 0.6,
    sortOrder: 10
  },

  // Sump Pump
  {
    systemTypeName: "Sump Pump",
    issueName: "Pump Motor Failure",
    description: "Sump pump motor burns out and won't run",
    baseOccurrenceRate: 0.03,
    weibullShape: 2.5,
    weibullScale: 10,
    symptoms: [
      "Pump doesn't run when water rises",
      "Humming sound but no pumping",
      "Burning smell"
    ],
    earlyWarningSigns: [
      "Struggling sounds",
      "Slow pumping",
      "Running hot"
    ],
    severity: "critical",
    repairCostLow: 350,
    repairCostHigh: 700,
    isDiyFixable: true,
    diyDifficulty: "moderate",
    diyFixSteps: [
      "Unplug pump",
      "Disconnect discharge line",
      "Remove pump from pit",
      "Install new pump",
      "Reconnect discharge",
      "Test with water"
    ],
    preventionTips: [
      "Test pump every 3 months",
      "Clean pump and pit annually",
      "Consider battery backup"
    ],
    relatedMaintenanceTasks: ["Test Sump Pump Operation", "Clean Sump Pit and Pump"],
    preventionEffectiveness: 0.5,
    sortOrder: 1
  },
  {
    systemTypeName: "Sump Pump",
    issueName: "Float Switch Failure",
    description: "Float switch gets stuck and doesn't activate pump",
    baseOccurrenceRate: 0.05,
    weibullShape: 1.8,
    weibullScale: 7,
    symptoms: [
      "Pump doesn't turn on when water rises",
      "Pump runs continuously",
      "Pump cycles on/off rapidly"
    ],
    earlyWarningSigns: [
      "Intermittent operation",
      "Debris around float"
    ],
    severity: "major",
    repairCostLow: 75,
    repairCostHigh: 200,
    isDiyFixable: true,
    diyDifficulty: "easy",
    diyFixSteps: [
      "Unplug pump",
      "Check float for obstruction",
      "Clean debris from pit",
      "Ensure float moves freely",
      "Test by lifting float manually"
    ],
    preventionTips: [
      "Keep pit clean of debris",
      "Test pump regularly",
      "Consider vertical float switch"
    ],
    relatedMaintenanceTasks: ["Clean Sump Pit and Pump", "Test Sump Pump Operation"],
    preventionEffectiveness: 0.6,
    sortOrder: 2
  },

  // Main Sewer Line
  {
    systemTypeName: "Main Sewer Line",
    issueName: "Root Intrusion",
    description: "Tree roots enter and clog sewer line through joints",
    baseOccurrenceRate: 0.03,
    weibullShape: 2.0,
    weibullScale: 20,
    symptoms: [
      "Slow drains throughout house",
      "Gurgling sounds in drains",
      "Sewage odor",
      "Frequent drain backups"
    ],
    earlyWarningSigns: [
      "Gradually slowing drains",
      "Lush patch of grass over sewer line"
    ],
    severity: "major",
    repairCostLow: 300,
    repairCostHigh: 1500,
    isDiyFixable: false,
    preventionTips: [
      "Root treatment every 6 months if trees nearby",
      "Camera inspection every 5 years",
      "Don't plant trees near sewer line"
    ],
    relatedMaintenanceTasks: ["Root Treatment", "Camera Inspection"],
    preventionEffectiveness: 0.6,
    sortOrder: 1
  },
  {
    systemTypeName: "Main Sewer Line",
    issueName: "Line Collapse",
    description: "Section of sewer line collapses due to age or ground movement",
    baseOccurrenceRate: 0.005,
    weibullShape: 4.5,
    weibullScale: 50,
    symptoms: [
      "Complete drain stoppage",
      "Sewage backup in lowest fixtures",
      "Sinkholes in yard",
      "Persistent sewage odor"
    ],
    earlyWarningSigns: [
      "Increasing frequency of clogs",
      "Visible sags in camera inspection"
    ],
    severity: "critical",
    repairCostLow: 3000,
    repairCostHigh: 15000,
    isDiyFixable: false,
    preventionTips: [
      "Regular camera inspections",
      "Address bellies/sags when found",
      "Trenchless repair when possible"
    ],
    relatedMaintenanceTasks: ["Camera Inspection"],
    preventionEffectiveness: 0.3,
    sortOrder: 2
  },

  // Septic System
  {
    systemTypeName: "Septic System",
    issueName: "Drain Field Failure",
    description: "Drain field becomes saturated and can't absorb effluent",
    baseOccurrenceRate: 0.01,
    weibullShape: 3.0,
    weibullScale: 25,
    symptoms: [
      "Sewage odor in yard",
      "Wet, soggy ground over drain field",
      "Bright green grass over drain field",
      "Slow drains throughout house",
      "Sewage backup"
    ],
    earlyWarningSigns: [
      "Slightly soggy drain field",
      "Increasing pump frequency"
    ],
    severity: "critical",
    repairCostLow: 5000,
    repairCostHigh: 30000,
    isDiyFixable: false,
    preventionTips: [
      "Pump tank every 3-5 years",
      "Don't drive over drain field",
      "Divert surface water away",
      "Don't flush non-biodegradables"
    ],
    relatedMaintenanceTasks: ["Pump Septic Tank", "Septic System Inspection"],
    preventionEffectiveness: 0.7,
    sortOrder: 1
  }
];

// ============================================
// APPLIANCE ISSUES  
// ============================================
export const applianceIssues: SystemIssue[] = [
  // Refrigerator
  {
    systemTypeName: "Refrigerator",
    issueName: "Compressor Failure",
    description: "Refrigerator compressor fails, no cooling",
    baseOccurrenceRate: 0.01,
    weibullShape: 3.5,
    weibullScale: 15,
    symptoms: [
      "Refrigerator not cold",
      "Clicking sounds but no running",
      "Very hot compressor"
    ],
    earlyWarningSigns: [
      "Compressor running constantly",
      "Reduced cooling capacity"
    ],
    severity: "critical",
    repairCostLow: 400,
    repairCostHigh: 900,
    isDiyFixable: false,
    preventionTips: [
      "Clean condenser coils annually",
      "Ensure proper ventilation",
      "Keep door seals clean"
    ],
    relatedMaintenanceTasks: ["Clean Condenser Coils"],
    preventionEffectiveness: 0.5,
    sortOrder: 1
  },
  {
    systemTypeName: "Refrigerator",
    issueName: "Evaporator Fan Failure",
    description: "Fan that circulates cold air fails",
    baseOccurrenceRate: 0.03,
    weibullShape: 2.0,
    weibullScale: 10,
    symptoms: [
      "Freezer cold but fridge warm",
      "No air circulation sounds",
      "Frost buildup in freezer"
    ],
    severity: "moderate",
    repairCostLow: 150,
    repairCostHigh: 400,
    isDiyFixable: true,
    diyDifficulty: "moderate",
    diyFixSteps: [
      "Unplug refrigerator",
      "Remove freezer panel",
      "Disconnect and remove fan",
      "Install new fan",
      "Reassemble and test"
    ],
    preventionTips: [
      "Defrost if frost builds up",
      "Don't block air vents in freezer"
    ],
    preventionEffectiveness: 0.3,
    sortOrder: 2
  },

  // Dryer
  {
    systemTypeName: "Dryer",
    issueName: "Heating Element Failure",
    description: "Electric dryer heating element burns out",
    baseOccurrenceRate: 0.04,
    weibullShape: 2.0,
    weibullScale: 8,
    symptoms: [
      "Dryer runs but no heat",
      "Clothes still damp after full cycle",
      "Lower than normal temperature"
    ],
    severity: "minor",
    repairCostLow: 150,
    repairCostHigh: 300,
    isDiyFixable: true,
    diyDifficulty: "moderate",
    diyFixSteps: [
      "Unplug dryer",
      "Remove back panel",
      "Locate and test heating element",
      "Replace if faulty",
      "Reassemble and test"
    ],
    preventionTips: [
      "Keep lint trap and vent clean",
      "Don't overload dryer"
    ],
    relatedMaintenanceTasks: ["Clean Dryer Vent Duct"],
    preventionEffectiveness: 0.4,
    sortOrder: 1
  },
  {
    systemTypeName: "Dryer",
    issueName: "Thermal Fuse Failure",
    description: "Safety fuse blows due to overheating",
    baseOccurrenceRate: 0.05,
    weibullShape: 1.5,
    weibullScale: 6,
    symptoms: [
      "Dryer won't start at all",
      "Drum spins but no heat"
    ],
    severity: "minor",
    repairCostLow: 50,
    repairCostHigh: 150,
    isDiyFixable: true,
    diyDifficulty: "moderate",
    diyFixSteps: [
      "Unplug dryer",
      "Locate thermal fuse (usually on blower housing)",
      "Test with multimeter",
      "Replace if faulty",
      "Clean vent to prevent recurrence"
    ],
    preventionTips: [
      "Keep dryer vent clean",
      "Don't overload dryer",
      "Regular lint trap cleaning"
    ],
    relatedMaintenanceTasks: ["Clean Dryer Vent Duct", "Clean Lint Trap"],
    preventionEffectiveness: 0.7,
    sortOrder: 2
  }
];

// ============================================
// STRUCTURAL ISSUES
// ============================================
export const structuralIssues: SystemIssue[] = [
  // Roof
  {
    systemTypeName: "Roof (Asphalt Shingle)",
    issueName: "Shingle Damage",
    description: "Missing, cracked, or curling shingles",
    baseOccurrenceRate: 0.03,
    weibullShape: 2.5,
    weibullScale: 18,
    symptoms: [
      "Visible missing shingles",
      "Curling or buckling shingles",
      "Granules in gutters",
      "Leaks in attic"
    ],
    earlyWarningSigns: [
      "Granule loss",
      "Minor curling at edges"
    ],
    severity: "moderate",
    repairCostLow: 150,
    repairCostHigh: 500,
    isDiyFixable: false,
    preventionTips: [
      "Regular visual inspection",
      "Trim overhanging branches",
      "Clean gutters regularly"
    ],
    relatedMaintenanceTasks: ["Visual Roof Inspection", "Clean Gutters and Downspouts"],
    preventionEffectiveness: 0.3,
    sortOrder: 1
  },
  {
    systemTypeName: "Roof (Asphalt Shingle)",
    issueName: "Flashing Failure",
    description: "Metal flashing around penetrations deteriorates",
    baseOccurrenceRate: 0.02,
    weibullShape: 2.0,
    weibullScale: 15,
    symptoms: [
      "Leaks around chimney or vents",
      "Visible rust or gaps",
      "Water stains on ceiling near roof penetrations"
    ],
    severity: "moderate",
    repairCostLow: 200,
    repairCostHigh: 600,
    isDiyFixable: false,
    preventionTips: [
      "Annual professional inspection",
      "Look for rust or lifting"
    ],
    relatedMaintenanceTasks: ["Professional Roof Inspection"],
    preventionEffectiveness: 0.4,
    sortOrder: 2
  },

  // Foundation
  {
    systemTypeName: "Foundation",
    issueName: "Settlement Cracking",
    description: "Vertical cracks from normal settling",
    baseOccurrenceRate: 0.1,
    weibullShape: 1.5,
    weibullScale: 10,
    symptoms: [
      "Vertical cracks in foundation",
      "Cracks wider at top than bottom",
      "Minor water seepage"
    ],
    earlyWarningSigns: [
      "Hairline cracks appearing"
    ],
    severity: "minor",
    repairCostLow: 100,
    repairCostHigh: 500,
    isDiyFixable: true,
    diyDifficulty: "easy",
    diyFixSteps: [
      "Clean crack with wire brush",
      "Apply hydraulic cement or epoxy filler",
      "Monitor for continued movement"
    ],
    preventionTips: [
      "Maintain proper drainage",
      "Monitor cracks over time"
    ],
    relatedMaintenanceTasks: ["Inspect Foundation for Cracks", "Maintain Drainage Away from Foundation"],
    preventionEffectiveness: 0.3,
    sortOrder: 1
  },
  {
    systemTypeName: "Foundation",
    issueName: "Lateral Pressure Cracking",
    description: "Horizontal cracks from soil pressure against foundation",
    baseOccurrenceRate: 0.02,
    weibullShape: 3.0,
    weibullScale: 30,
    symptoms: [
      "Horizontal cracks in basement walls",
      "Wall bowing inward",
      "Water infiltration",
      "Stair-step cracks in block"
    ],
    earlyWarningSigns: [
      "Minor horizontal cracks",
      "Slight inward bow"
    ],
    severity: "critical",
    repairCostLow: 5000,
    repairCostHigh: 25000,
    isDiyFixable: false,
    preventionTips: [
      "Maintain proper drainage",
      "Keep gutters clean",
      "Don't plant large trees near foundation"
    ],
    relatedMaintenanceTasks: ["Inspect Foundation for Cracks", "Maintain Drainage Away from Foundation"],
    preventionEffectiveness: 0.5,
    sortOrder: 2
  }
];

// ============================================
// EXTERIOR ISSUES
// ============================================
export const exteriorIssues: SystemIssue[] = [
  // Garage Door
  {
    systemTypeName: "Garage Door & Opener",
    issueName: "Spring Failure",
    description: "Torsion or extension spring breaks",
    baseOccurrenceRate: 0.04,
    weibullShape: 3.0,
    weibullScale: 10,
    symptoms: [
      "Door won't open or very heavy",
      "Loud bang when spring breaks",
      "Visible broken spring",
      "Door crooked when opening"
    ],
    earlyWarningSigns: [
      "Door harder to lift manually",
      "Gaps in spring coils"
    ],
    severity: "moderate",
    repairCostLow: 200,
    repairCostHigh: 400,
    isDiyFixable: false,
    preventionTips: [
      "Lubricate springs twice yearly",
      "Visual inspection for wear"
    ],
    relatedMaintenanceTasks: ["Lubricate Garage Door Components"],
    preventionEffectiveness: 0.3,
    sortOrder: 1
  },
  {
    systemTypeName: "Garage Door & Opener",
    issueName: "Opener Motor Failure",
    description: "Garage door opener motor burns out",
    baseOccurrenceRate: 0.02,
    weibullShape: 2.5,
    weibullScale: 12,
    symptoms: [
      "Motor hums but door doesn't move",
      "Grinding sounds",
      "Burning smell",
      "Door opens partially then stops"
    ],
    earlyWarningSigns: [
      "Slow operation",
      "Increased noise"
    ],
    severity: "minor",
    repairCostLow: 300,
    repairCostHigh: 600,
    isDiyFixable: true,
    diyDifficulty: "moderate",
    diyFixSteps: [
      "Disconnect power",
      "Release door from opener",
      "Remove old opener",
      "Install new opener per instructions",
      "Test safety features"
    ],
    preventionTips: [
      "Lubricate moving parts",
      "Don't force a binding door"
    ],
    relatedMaintenanceTasks: ["Lubricate Garage Door Components"],
    preventionEffectiveness: 0.4,
    sortOrder: 2
  }
];

// ============================================
// COMBINED EXPORT
// ============================================
export const allSystemIssues: SystemIssue[] = [
  ...hvacIssues,
  ...plumbingIssues,
  ...applianceIssues,
  ...structuralIssues,
  ...exteriorIssues,
];