// convex/lib/triageFlows.ts
// Triage flow definitions for home incident wizard

export interface TriageQuestion {
  id: string;
  text: string;
  options: {
    value: string;
    label: string;
    nextQuestionId?: string;
  }[];
}

export interface TriageOutcome {
  condition: (answers: Record<string, string>) => boolean;
  urgency: "monitor" | "schedule" | "urgent";
  likelyCauses: string[];
  diySteps?: string[];
  proRecommendation?: string;
}

export interface ShutoffGuidance {
  type: "water" | "gas" | "electrical" | "hvac";
  instructions: string[];
  whenRequired: string;
}

export interface PacketTemplate {
  suggestedQuestions: string[];
  docsToCollect: string[];
  photoChecklist: string[];
}

export interface TriageFlow {
  id: string;
  category: "plumbing" | "hvac" | "electrical" | "appliances";
  systemTypeMatch?: string; // Matches against systemType.name
  symptom: string;
  shortDescription: string;
  icon: string;
  
  // Safety first
  immediateWarnings: string[];
  shutoffGuidance?: ShutoffGuidance;
  
  // Guided questions (max 3-4)
  questions: TriageQuestion[];
  
  // Decision tree outputs
  outcomes: TriageOutcome[];
  
  // Default outcome if no conditions match
  defaultOutcome: {
    urgency: "monitor" | "schedule" | "urgent";
    likelyCauses: string[];
    proRecommendation: string;
  };
  
  // For packet generation
  packetTemplate: PacketTemplate;
}

// =====================================================
// PLUMBING ISSUES (5)
// =====================================================

const leakUnderSink: TriageFlow = {
  id: "leak-under-sink",
  category: "plumbing",
  symptom: "Water under kitchen or bathroom sink",
  shortDescription: "Leak visible under a sink",
  icon: "💧",
  
  immediateWarnings: [
    "If water is actively dripping, place a bucket or container to catch water",
    "Check if water is near electrical outlets - if so, turn off the circuit breaker first",
    "Dry the area to prevent water damage to cabinets",
  ],
  
  shutoffGuidance: {
    type: "water",
    instructions: [
      "Look under the sink for shut-off valves (usually chrome knobs or handles)",
      "Turn the valves clockwise to close them",
      "If no shut-off valves, locate your main water shut-off",
      "Test by turning on the faucet - no water should come out",
    ],
    whenRequired: "If water is actively spraying or pooling",
  },
  
  questions: [
    {
      id: "location",
      text: "Where exactly is the water coming from?",
      options: [
        { value: "drain_pipe", label: "Drain pipes (below the sink basin)", nextQuestionId: "drain_when" },
        { value: "supply_line", label: "Supply lines (coming from wall)", nextQuestionId: "supply_amount" },
        { value: "faucet_base", label: "Base of the faucet", nextQuestionId: "faucet_age" },
        { value: "unsure", label: "Not sure / Multiple spots" },
      ],
    },
    {
      id: "drain_when",
      text: "When does the leak occur?",
      options: [
        { value: "always", label: "Water always present" },
        { value: "when_running", label: "Only when water is running" },
        { value: "after_use", label: "After using the sink" },
      ],
    },
    {
      id: "supply_amount",
      text: "How much water is leaking?",
      options: [
        { value: "drip", label: "Slow drip" },
        { value: "steady", label: "Steady stream" },
        { value: "spray", label: "Spraying water" },
      ],
    },
    {
      id: "faucet_age",
      text: "How old is the faucet?",
      options: [
        { value: "new", label: "Less than 5 years" },
        { value: "medium", label: "5-15 years" },
        { value: "old", label: "Over 15 years" },
      ],
    },
  ],
  
  outcomes: [
    {
      condition: (a) => a.location === "supply_line" && a.supply_amount === "spray",
      urgency: "urgent",
      likelyCauses: ["Failed supply line connection", "Corroded supply valve", "Burst supply line"],
      diySteps: ["Turn off water immediately at the shut-off valve"],
      proRecommendation: "Call a plumber immediately - water damage risk is high",
    },
    {
      condition: (a) => a.location === "supply_line" && a.supply_amount === "drip",
      urgency: "schedule",
      likelyCauses: ["Loose connection", "Worn washer", "Minor corrosion"],
      diySteps: [
        "Turn off water at the shut-off valve",
        "Try tightening the connection with an adjustable wrench",
        "If still leaking, the supply line may need replacement",
      ],
    },
    {
      condition: (a) => a.location === "drain_pipe",
      urgency: "schedule",
      likelyCauses: ["Loose drain connections", "Worn P-trap gaskets", "Cracked pipe"],
      diySteps: [
        "Place a bucket under the pipes",
        "Hand-tighten the slip nuts on the P-trap",
        "Check for visible cracks in the plastic pipes",
      ],
    },
    {
      condition: (a) => a.location === "faucet_base" && a.faucet_age === "old",
      urgency: "schedule",
      likelyCauses: ["Worn O-rings", "Failed faucet seals", "Faucet may need replacement"],
      diySteps: [
        "Try tightening the faucet mounting nuts from below",
        "Check if water is coming from the spout base vs spray head",
      ],
    },
  ],
  
  defaultOutcome: {
    urgency: "schedule",
    likelyCauses: ["Connection issue", "Worn seals or gaskets"],
    proRecommendation: "Schedule a plumber to diagnose and repair within a week",
  },
  
  packetTemplate: {
    suggestedQuestions: [
      "What's causing the leak exactly?",
      "Can this be repaired or does it need replacement?",
      "Is there any water damage to the cabinet that needs attention?",
      "How can I prevent this in the future?",
    ],
    docsToCollect: ["Invoice", "Warranty info for any parts replaced"],
    photoChecklist: [
      "Photo of the leak location",
      "Photo under the sink showing all pipes",
      "Photo of any water damage",
    ],
  },
};

const toiletRunning: TriageFlow = {
  id: "toilet-running",
  category: "plumbing",
  symptom: "Toilet runs continuously or won't stop",
  shortDescription: "Running or constantly filling toilet",
  icon: "🚽",
  
  immediateWarnings: [
    "A running toilet can waste 200+ gallons of water per day",
    "If water is overflowing onto the floor, turn off the toilet's water supply immediately",
  ],
  
  shutoffGuidance: {
    type: "water",
    instructions: [
      "Locate the shut-off valve behind the toilet near the floor",
      "Turn the valve clockwise until it stops",
      "Flush the toilet once - the tank should not refill",
    ],
    whenRequired: "If water is overflowing or you can't stop the running",
  },
  
  questions: [
    {
      id: "behavior",
      text: "What's the toilet doing?",
      options: [
        { value: "runs_constantly", label: "Runs non-stop", nextQuestionId: "jiggle" },
        { value: "runs_intermittent", label: "Starts and stops on its own", nextQuestionId: "fill_level" },
        { value: "slow_fill", label: "Takes forever to fill", nextQuestionId: "water_pressure" },
        { value: "overflowing", label: "Water overflowing from tank or bowl" },
      ],
    },
    {
      id: "jiggle",
      text: "Does jiggling the handle stop it?",
      options: [
        { value: "yes", label: "Yes, temporarily" },
        { value: "no", label: "No effect" },
      ],
    },
    {
      id: "fill_level",
      text: "Is the water level in the tank too high?",
      options: [
        { value: "yes", label: "Yes, near or at the overflow tube" },
        { value: "no", label: "No, water level seems normal" },
        { value: "unsure", label: "Not sure how to check" },
      ],
    },
    {
      id: "water_pressure",
      text: "Have you noticed low water pressure elsewhere?",
      options: [
        { value: "yes", label: "Yes, other fixtures too" },
        { value: "no", label: "No, just this toilet" },
      ],
    },
  ],
  
  outcomes: [
    {
      condition: (a) => a.behavior === "overflowing",
      urgency: "urgent",
      likelyCauses: ["Clog causing backup", "Failed fill valve", "Blocked drain vent"],
      diySteps: ["Turn off water immediately", "Do not flush again"],
      proRecommendation: "Call a plumber immediately if plunging doesn't clear the clog",
    },
    {
      condition: (a) => a.behavior === "runs_constantly" && a.jiggle === "yes",
      urgency: "schedule",
      likelyCauses: ["Worn flapper", "Flapper chain too long/short"],
      diySteps: [
        "Open the tank lid and check the flapper (rubber seal at bottom)",
        "Adjust the chain so there's about 1/2 inch of slack",
        "If flapper looks warped or doesn't seal, replace it ($5-10 at hardware store)",
      ],
    },
    {
      condition: (a) => a.behavior === "runs_constantly" && a.jiggle === "no",
      urgency: "schedule",
      likelyCauses: ["Failed fill valve", "Cracked overflow tube", "Worn flush valve"],
      diySteps: [
        "Check if water is flowing into overflow tube - if yes, adjust fill valve height",
        "Fill valves are DIY-replaceable but require some comfort with plumbing",
      ],
    },
    {
      condition: (a) => a.behavior === "runs_intermittent" && a.fill_level === "yes",
      urgency: "schedule",
      likelyCauses: ["Fill valve set too high", "Float needs adjustment"],
      diySteps: [
        "Adjust the float (ball or cup style) to lower the water level",
        "Water should be about 1 inch below overflow tube",
      ],
    },
  ],
  
  defaultOutcome: {
    urgency: "schedule",
    likelyCauses: ["Worn internal parts", "Float or flapper issue"],
    proRecommendation: "A plumber can diagnose and often fix in under an hour",
  },
  
  packetTemplate: {
    suggestedQuestions: [
      "Which part is causing the issue?",
      "Would you recommend replacing individual parts or the whole mechanism?",
      "Is my toilet worth repairing or should I consider replacement?",
    ],
    docsToCollect: ["Invoice", "Part receipts if applicable"],
    photoChecklist: [
      "Photo of inside the tank",
      "Photo of the toilet model number (usually inside lid or behind seat)",
    ],
  },
};

const noHotWater: TriageFlow = {
  id: "no-hot-water",
  category: "plumbing",
  systemTypeMatch: "Water Heater",
  symptom: "No hot water or water not hot enough",
  shortDescription: "Water heater not providing hot water",
  icon: "🔥",
  
  immediateWarnings: [
    "If you smell gas near a gas water heater, leave immediately and call your gas company",
    "If you see water pooling around the water heater, it may be leaking",
    "Do not attempt to light a gas pilot if you smell gas",
  ],
  
  shutoffGuidance: {
    type: "gas",
    instructions: [
      "For gas water heaters: Turn the dial on the gas valve to 'OFF'",
      "For electric water heaters: Turn off the breaker labeled 'Water Heater'",
      "If leaking, also turn off the cold water supply valve on top of the unit",
    ],
    whenRequired: "If you smell gas, see sparking, or notice significant leaking",
  },
  
  questions: [
    {
      id: "heater_type",
      text: "What type of water heater do you have?",
      options: [
        { value: "gas_tank", label: "Gas (tank with a vent pipe)", nextQuestionId: "pilot" },
        { value: "electric_tank", label: "Electric (no vent, 2 elements)", nextQuestionId: "breaker" },
        { value: "tankless", label: "Tankless (on-demand unit)", nextQuestionId: "tankless_display" },
        { value: "unsure", label: "Not sure" },
      ],
    },
    {
      id: "pilot",
      text: "Is the pilot light on? (Look through the small window at the bottom)",
      options: [
        { value: "yes", label: "Yes, I see a flame" },
        { value: "no", label: "No flame visible" },
        { value: "cant_see", label: "Can't tell / No window" },
      ],
    },
    {
      id: "breaker",
      text: "Have you checked the circuit breaker?",
      options: [
        { value: "on", label: "It's on" },
        { value: "tripped", label: "It was tripped, I reset it" },
        { value: "not_checked", label: "Haven't checked yet" },
      ],
    },
    {
      id: "tankless_display",
      text: "Does the unit show an error code?",
      options: [
        { value: "yes", label: "Yes, there's an error code" },
        { value: "no", label: "No error, just no hot water" },
        { value: "no_power", label: "Unit doesn't seem to have power" },
      ],
    },
  ],
  
  outcomes: [
    {
      condition: (a) => a.heater_type === "gas_tank" && a.pilot === "no",
      urgency: "schedule",
      likelyCauses: ["Pilot light went out", "Thermocouple failure", "Gas supply issue"],
      diySteps: [
        "Wait 5 minutes to let any gas dissipate",
        "Follow the relighting instructions on the unit's label",
        "If pilot won't stay lit, the thermocouple likely needs replacement",
      ],
    },
    {
      condition: (a) => a.heater_type === "electric_tank" && a.breaker === "tripped",
      urgency: "monitor",
      likelyCauses: ["Heating element drew too much power", "Electrical issue"],
      diySteps: [
        "If breaker trips again, don't reset - call an electrician or plumber",
        "Wait 30-60 minutes after resetting for water to heat up",
      ],
    },
    {
      condition: (a) => a.heater_type === "electric_tank" && a.breaker === "on",
      urgency: "schedule",
      likelyCauses: ["Failed heating element", "Bad thermostat", "Sediment buildup"],
      proRecommendation: "Electric water heaters usually need professional diagnosis",
    },
    {
      condition: (a) => a.heater_type === "tankless" && a.tankless_display === "yes",
      urgency: "schedule",
      likelyCauses: ["Flow sensor issue", "Ignition failure", "Scale buildup"],
      proRecommendation: "Tankless units often need professional service - note the error code",
    },
  ],
  
  defaultOutcome: {
    urgency: "schedule",
    likelyCauses: ["Age-related failure", "Thermostat issue", "Heating element failure"],
    proRecommendation: "Schedule a plumber to diagnose within 1-2 days",
  },
  
  packetTemplate: {
    suggestedQuestions: [
      "What's wrong with my water heater?",
      "Should I repair or replace it?",
      "How old is too old for a water heater?",
      "What efficiency options are available if I replace it?",
    ],
    docsToCollect: ["Invoice", "Warranty information", "Manual if replacing"],
    photoChecklist: [
      "Photo of the water heater data plate (age, model, serial)",
      "Photo showing any error codes",
      "Photo of the installation area (for replacement quotes)",
    ],
  },
};

const lowWaterPressure: TriageFlow = {
  id: "low-water-pressure",
  category: "plumbing",
  symptom: "Weak water flow from faucets or showers",
  shortDescription: "Low water pressure throughout home",
  icon: "🚿",
  
  immediateWarnings: [
    "Sudden pressure loss to the entire house could indicate a main line break",
    "If you hear water running when nothing is on, you may have a leak",
  ],
  
  questions: [
    {
      id: "scope",
      text: "Where are you experiencing low pressure?",
      options: [
        { value: "one_fixture", label: "Just one faucet/shower", nextQuestionId: "fixture_type" },
        { value: "one_room", label: "One bathroom/kitchen", nextQuestionId: "hot_cold" },
        { value: "whole_house", label: "Entire house", nextQuestionId: "sudden" },
      ],
    },
    {
      id: "fixture_type",
      text: "What type of fixture?",
      options: [
        { value: "faucet", label: "Faucet" },
        { value: "shower", label: "Shower head" },
        { value: "toilet", label: "Toilet fills slowly" },
      ],
    },
    {
      id: "hot_cold",
      text: "Is it affecting hot water, cold water, or both?",
      options: [
        { value: "both", label: "Both hot and cold" },
        { value: "hot_only", label: "Hot water only" },
        { value: "cold_only", label: "Cold water only" },
      ],
    },
    {
      id: "sudden",
      text: "Did this happen suddenly or gradually?",
      options: [
        { value: "sudden", label: "Suddenly (today/yesterday)" },
        { value: "gradual", label: "Gradually over weeks/months" },
        { value: "always", label: "It's always been like this" },
      ],
    },
  ],
  
  outcomes: [
    {
      condition: (a) => a.scope === "one_fixture" && a.fixture_type === "faucet",
      urgency: "monitor",
      likelyCauses: ["Clogged aerator", "Debris in faucet cartridge"],
      diySteps: [
        "Unscrew the aerator from the faucet tip",
        "Clean sediment from the screen",
        "Soak in vinegar overnight if heavily scaled",
        "Reinstall and test",
      ],
    },
    {
      condition: (a) => a.scope === "one_fixture" && a.fixture_type === "shower",
      urgency: "monitor",
      likelyCauses: ["Clogged showerhead", "Scale buildup"],
      diySteps: [
        "Remove showerhead and soak in vinegar for a few hours",
        "Use a toothpick to clear spray holes",
        "Consider replacing if very old",
      ],
    },
    {
      condition: (a) => a.hot_cold === "hot_only",
      urgency: "schedule",
      likelyCauses: ["Water heater issue", "Sediment in water heater", "Failing dip tube"],
      proRecommendation: "Have your water heater inspected and possibly flushed",
    },
    {
      condition: (a) => a.scope === "whole_house" && a.sudden === "sudden",
      urgency: "urgent",
      likelyCauses: ["Main line issue", "Water main break", "Pressure regulator failure"],
      diySteps: ["Check if neighbors have same issue", "Contact water utility"],
      proRecommendation: "If neighbors are fine, call a plumber - could be main line or PRV",
    },
    {
      condition: (a) => a.scope === "whole_house" && a.sudden === "gradual",
      urgency: "schedule",
      likelyCauses: ["Corroded galvanized pipes", "Mineral buildup", "Failing pressure regulator"],
      proRecommendation: "Schedule a plumber to assess - may need pipe replacement",
    },
  ],
  
  defaultOutcome: {
    urgency: "schedule",
    likelyCauses: ["Mineral buildup", "Pipe corrosion", "Fixture clog"],
    proRecommendation: "A plumber can assess and recommend solutions",
  },
  
  packetTemplate: {
    suggestedQuestions: [
      "What's causing my low pressure?",
      "Do I need to repipe my house?",
      "Would a pressure booster help?",
      "Is my water quality contributing to this?",
    ],
    docsToCollect: ["Invoice", "Any test results"],
    photoChecklist: [
      "Photo of affected fixture(s)",
      "Photo of pressure regulator if accessible",
      "Photo of exposed pipes if visible",
    ],
  },
};

const sewerSmell: TriageFlow = {
  id: "sewer-smell",
  category: "plumbing",
  symptom: "Sewer odor or drain backup",
  shortDescription: "Bad smell from drains or sewage backup",
  icon: "🦨",
  
  immediateWarnings: [
    "Sewer gas contains methane - ensure good ventilation",
    "If sewage is backing up, don't use any drains until resolved",
    "Sewage exposure requires proper cleanup to prevent health issues",
  ],
  
  shutoffGuidance: {
    type: "water",
    instructions: [
      "If sewage is backing up, stop using all water in the house",
      "Don't flush toilets or run any drains",
      "If backup is severe, shut off main water to prevent more water entering drains",
    ],
    whenRequired: "If there's active sewage backup into the home",
  },
  
  questions: [
    {
      id: "type",
      text: "What are you experiencing?",
      options: [
        { value: "smell_only", label: "Just a bad smell", nextQuestionId: "smell_location" },
        { value: "slow_drains", label: "Smell + slow drains", nextQuestionId: "which_drains" },
        { value: "backup", label: "Sewage backing up", nextQuestionId: "backup_location" },
      ],
    },
    {
      id: "smell_location",
      text: "Where is the smell coming from?",
      options: [
        { value: "one_drain", label: "One specific drain" },
        { value: "bathroom", label: "Whole bathroom" },
        { value: "basement", label: "Basement/lowest level" },
        { value: "outside", label: "Near the house exterior" },
      ],
    },
    {
      id: "which_drains",
      text: "Which drains are slow?",
      options: [
        { value: "one", label: "Just one fixture" },
        { value: "multiple_room", label: "Multiple in one room" },
        { value: "whole_house", label: "Throughout the house" },
      ],
    },
    {
      id: "backup_location",
      text: "Where is it backing up?",
      options: [
        { value: "lowest_drain", label: "Basement floor drain or tub" },
        { value: "toilet", label: "Toilet(s)" },
        { value: "multiple", label: "Multiple locations" },
      ],
    },
  ],
  
  outcomes: [
    {
      condition: (a) => a.type === "backup",
      urgency: "urgent",
      likelyCauses: ["Main sewer line clog", "Tree roots in sewer", "Collapsed pipe"],
      proRecommendation: "Call a drain specialist immediately - they can camera the line",
    },
    {
      condition: (a) => a.type === "smell_only" && a.smell_location === "one_drain",
      urgency: "monitor",
      likelyCauses: ["Dry P-trap", "Debris in drain"],
      diySteps: [
        "Pour water down the drain - P-traps can dry out and let sewer gas in",
        "Pour a cup of baking soda followed by vinegar, wait 15 min, flush with hot water",
        "If smell persists, the vent pipe may be blocked",
      ],
    },
    {
      condition: (a) => a.type === "slow_drains" && a.which_drains === "whole_house",
      urgency: "schedule",
      likelyCauses: ["Main line partial clog", "Venting issue", "Roots entering pipe"],
      proRecommendation: "Schedule a drain specialist - main line may need snaking or jetting",
    },
    {
      condition: (a) => a.smell_location === "outside",
      urgency: "schedule",
      likelyCauses: ["Septic tank issue", "Sewer cleanout cap missing", "Vent pipe issue"],
      diySteps: ["Check if sewer cleanout caps are in place (usually white PVC pipes in yard)"],
    },
  ],
  
  defaultOutcome: {
    urgency: "schedule",
    likelyCauses: ["P-trap issue", "Partial clog", "Vent blockage"],
    proRecommendation: "A plumber can diagnose the source and fix it",
  },
  
  packetTemplate: {
    suggestedQuestions: [
      "What's causing the smell/backup?",
      "Is my sewer line damaged?",
      "Do I need a camera inspection?",
      "How can I prevent this in the future?",
    ],
    docsToCollect: ["Invoice", "Camera inspection report if done"],
    photoChecklist: [
      "Photo of affected drain(s)",
      "Photo of any backup or standing water",
      "Photo of cleanout location if known",
    ],
  },
};

// =====================================================
// HVAC ISSUES (5)
// =====================================================

const noCooling: TriageFlow = {
  id: "no-cooling",
  category: "hvac",
  systemTypeMatch: "Central Air Conditioning",
  symptom: "AC running but not cooling",
  shortDescription: "Air conditioning not providing cold air",
  icon: "❄️",
  
  immediateWarnings: [
    "If you see ice on the unit or refrigerant lines, turn the system off",
    "Never open the refrigerant lines - refrigerant is hazardous",
    "In extreme heat, consider temporary cooling solutions while waiting for repair",
  ],
  
  shutoffGuidance: {
    type: "hvac",
    instructions: [
      "Set thermostat to OFF (not just raising temperature)",
      "For outdoor unit: there may be a disconnect box nearby you can switch off",
      "If ice is present, run fan only mode to help defrost",
    ],
    whenRequired: "If the outdoor unit is making unusual noises or you see ice buildup",
  },
  
  questions: [
    {
      id: "fan_running",
      text: "Is the outdoor unit (condenser) running?",
      options: [
        { value: "yes", label: "Yes, fan is spinning", nextQuestionId: "air_temp" },
        { value: "no", label: "No, it's not running", nextQuestionId: "thermostat_set" },
        { value: "noise", label: "Making unusual noise", nextQuestionId: "noise_type" },
      ],
    },
    {
      id: "air_temp",
      text: "What's the air from the vents like?",
      options: [
        { value: "warm", label: "Warm air" },
        { value: "cool_not_cold", label: "Cool but not cold" },
        { value: "weak", label: "Cold but very weak airflow" },
      ],
    },
    {
      id: "thermostat_set",
      text: "Is the thermostat set correctly?",
      options: [
        { value: "yes", label: "Yes, set to cool below current temp" },
        { value: "check_batteries", label: "Display is blank or faint" },
        { value: "unsure", label: "Not sure" },
      ],
    },
    {
      id: "noise_type",
      text: "What kind of noise?",
      options: [
        { value: "buzzing", label: "Buzzing or humming" },
        { value: "grinding", label: "Grinding or squealing" },
        { value: "clicking", label: "Clicking repeatedly" },
      ],
    },
  ],
  
  outcomes: [
    {
      condition: (a) => a.fan_running === "no" && a.thermostat_set === "check_batteries",
      urgency: "monitor",
      likelyCauses: ["Dead thermostat batteries", "Thermostat power issue"],
      diySteps: [
        "Replace thermostat batteries (usually AA or AAA)",
        "Check circuit breakers for HVAC system",
        "Try turning thermostat off and on again",
      ],
    },
    {
      condition: (a) => a.fan_running === "no" && a.thermostat_set === "yes",
      urgency: "schedule",
      likelyCauses: ["Tripped breaker", "Capacitor failure", "Contactor failure"],
      diySteps: [
        "Check both circuit breakers (usually one for indoor, one for outdoor unit)",
        "Check the disconnect box near the outdoor unit",
      ],
      proRecommendation: "If breakers are fine, the capacitor or contactor likely needs replacement",
    },
    {
      condition: (a) => a.air_temp === "warm",
      urgency: "schedule",
      likelyCauses: ["Low refrigerant", "Compressor issue", "Reversing valve stuck (heat pump)"],
      proRecommendation: "HVAC technician needed - likely a refrigerant or compressor issue",
    },
    {
      condition: (a) => a.air_temp === "weak",
      urgency: "schedule",
      likelyCauses: ["Dirty air filter", "Frozen evaporator coil", "Duct leak"],
      diySteps: [
        "Check and replace air filter if dirty",
        "Check for ice on the indoor unit - if frozen, turn off and let defrost",
        "Inspect visible ductwork for disconnections",
      ],
    },
    {
      condition: (a) => a.noise_type === "grinding",
      urgency: "urgent",
      likelyCauses: ["Motor bearing failure", "Fan blade hitting something"],
      diySteps: ["Turn system off immediately to prevent further damage"],
      proRecommendation: "Call HVAC technician - running it could cause more damage",
    },
  ],
  
  defaultOutcome: {
    urgency: "schedule",
    likelyCauses: ["Refrigerant issue", "Electrical component failure", "Dirty coils"],
    proRecommendation: "Schedule an HVAC technician for diagnosis",
  },
  
  packetTemplate: {
    suggestedQuestions: [
      "What's causing my AC not to cool?",
      "Does my system need refrigerant, and why is it low?",
      "How old is my system and is repair cost-effective?",
      "What maintenance should I do to prevent this?",
    ],
    docsToCollect: ["Invoice", "Service report", "Warranty info"],
    photoChecklist: [
      "Photo of thermostat settings/display",
      "Photo of outdoor unit",
      "Photo of air filter condition",
      "Photo of any ice buildup",
    ],
  },
};

const noHeating: TriageFlow = {
  id: "no-heating",
  category: "hvac",
  systemTypeMatch: "Furnace",
  symptom: "Furnace not heating",
  shortDescription: "No heat when heating is turned on",
  icon: "🔥",
  
  immediateWarnings: [
    "If you smell gas, leave immediately and call your gas company from outside",
    "Never try to restart a furnace more than twice if it keeps shutting down",
    "Carbon monoxide is odorless - ensure you have working CO detectors",
  ],
  
  shutoffGuidance: {
    type: "gas",
    instructions: [
      "If you smell gas: Leave immediately, don't operate light switches, call gas company",
      "For normal shutdown: Set thermostat to OFF",
      "Furnace switch (looks like a light switch) is usually near the unit",
    ],
    whenRequired: "If you smell gas or the furnace is making alarming noises",
  },
  
  questions: [
    {
      id: "furnace_type",
      text: "What type of heating system?",
      options: [
        { value: "gas", label: "Gas furnace", nextQuestionId: "blower" },
        { value: "electric", label: "Electric furnace/heat pump", nextQuestionId: "blower" },
        { value: "oil", label: "Oil furnace", nextQuestionId: "oil_delivery" },
        { value: "unsure", label: "Not sure" },
      ],
    },
    {
      id: "blower",
      text: "Is the blower (fan) running?",
      options: [
        { value: "yes", label: "Yes, but air is cold", nextQuestionId: "ignition" },
        { value: "no", label: "No, nothing is happening", nextQuestionId: "thermostat_check" },
        { value: "short_cycle", label: "Turns on briefly then shuts off" },
      ],
    },
    {
      id: "ignition",
      text: "For gas furnace: Does it try to ignite?",
      options: [
        { value: "clicks_no_flame", label: "Clicks but no flame" },
        { value: "lights_then_stops", label: "Lights briefly then goes out" },
        { value: "no_sound", label: "No ignition sounds at all" },
      ],
    },
    {
      id: "thermostat_check",
      text: "Have you checked the thermostat?",
      options: [
        { value: "set_correct", label: "Set to heat, above current temp" },
        { value: "blank", label: "Display is blank" },
        { value: "error", label: "Showing an error" },
      ],
    },
    {
      id: "oil_delivery",
      text: "When was your last oil delivery?",
      options: [
        { value: "recent", label: "Within the last month" },
        { value: "while_ago", label: "More than a month ago" },
        { value: "unsure", label: "Not sure" },
      ],
    },
  ],
  
  outcomes: [
    {
      condition: (a) => a.blower === "no" && a.thermostat_check === "blank",
      urgency: "monitor",
      likelyCauses: ["Thermostat batteries dead", "Power issue"],
      diySteps: [
        "Replace thermostat batteries",
        "Check circuit breaker for furnace",
        "Check the furnace's power switch",
      ],
    },
    {
      condition: (a) => a.blower === "short_cycle",
      urgency: "schedule",
      likelyCauses: ["Dirty flame sensor", "Overheating safety switch", "Clogged filter"],
      diySteps: [
        "Check and replace air filter",
        "Ensure all vents are open and unblocked",
        "Flame sensor cleaning is possible but requires care",
      ],
    },
    {
      condition: (a) => a.ignition === "clicks_no_flame",
      urgency: "schedule",
      likelyCauses: ["Ignitor failure", "Gas valve issue", "Gas supply problem"],
      proRecommendation: "HVAC technician needed - electrical or gas valve component",
    },
    {
      condition: (a) => a.ignition === "lights_then_stops",
      urgency: "schedule",
      likelyCauses: ["Dirty flame sensor", "Weak ignitor", "Gas pressure issue"],
      diySteps: [
        "This is often a dirty flame sensor - a tech can clean or replace for ~$100-200",
      ],
    },
    {
      condition: (a) => a.furnace_type === "oil" && a.oil_delivery === "while_ago",
      urgency: "monitor",
      likelyCauses: ["Out of fuel", "Clogged fuel filter"],
      diySteps: [
        "Check oil tank level (most have a gauge)",
        "Schedule oil delivery if low",
        "Press the reset button ONCE if you ran out of oil and refilled",
      ],
    },
  ],
  
  defaultOutcome: {
    urgency: "schedule",
    likelyCauses: ["Ignition issue", "Control board failure", "Gas valve problem"],
    proRecommendation: "Schedule HVAC service - heating issues need prompt attention",
  },
  
  packetTemplate: {
    suggestedQuestions: [
      "What's preventing my furnace from heating?",
      "Is my furnace safe to operate?",
      "Should I repair or replace at this age?",
      "What regular maintenance should I do?",
    ],
    docsToCollect: ["Invoice", "Service report", "Carbon monoxide test results"],
    photoChecklist: [
      "Photo of furnace data plate (age, model)",
      "Photo of thermostat display",
      "Photo of air filter",
      "Photo of any error lights/codes on furnace",
    ],
  },
};

const weakAirflow: TriageFlow = {
  id: "weak-airflow",
  category: "hvac",
  symptom: "Poor airflow from vents",
  shortDescription: "Weak or no air coming from vents",
  icon: "💨",
  
  immediateWarnings: [
    "Severely restricted airflow can cause the AC to freeze or the furnace to overheat",
    "If you notice a burning smell with weak airflow, turn off the system",
  ],
  
  questions: [
    {
      id: "scope",
      text: "Which vents have weak airflow?",
      options: [
        { value: "one_vent", label: "Just one vent", nextQuestionId: "vent_condition" },
        { value: "one_room", label: "One room/area", nextQuestionId: "vent_condition" },
        { value: "whole_house", label: "Entire house", nextQuestionId: "filter_check" },
      ],
    },
    {
      id: "vent_condition",
      text: "Is the vent open and unblocked?",
      options: [
        { value: "yes", label: "Yes, fully open" },
        { value: "partial", label: "Partially closed" },
        { value: "blocked", label: "Furniture/items blocking it" },
      ],
    },
    {
      id: "filter_check",
      text: "When did you last change the air filter?",
      options: [
        { value: "recent", label: "Within the last month" },
        { value: "few_months", label: "2-6 months ago" },
        { value: "long_time", label: "More than 6 months / never" },
        { value: "unsure", label: "Not sure" },
      ],
    },
  ],
  
  outcomes: [
    {
      condition: (a) => a.vent_condition === "blocked" || a.vent_condition === "partial",
      urgency: "monitor",
      likelyCauses: ["Blocked or closed vents"],
      diySteps: [
        "Open all vents fully",
        "Move furniture at least 6 inches from vents",
        "Ensure curtains/drapes don't block vents",
      ],
    },
    {
      condition: (a) => a.filter_check === "long_time" || a.filter_check === "unsure",
      urgency: "monitor",
      likelyCauses: ["Clogged air filter"],
      diySteps: [
        "Locate your air filter (usually at return vent or in furnace)",
        "Replace with new filter of same size",
        "Set reminder to replace every 1-3 months",
      ],
    },
    {
      condition: (a) => a.scope === "one_vent" || a.scope === "one_room",
      urgency: "schedule",
      likelyCauses: ["Duct disconnection", "Damper closed", "Duct blockage"],
      proRecommendation: "HVAC tech can inspect ductwork and check damper settings",
    },
    {
      condition: (a) => a.scope === "whole_house" && a.filter_check === "recent",
      urgency: "schedule",
      likelyCauses: ["Blower motor issue", "Duct leaks", "System undersized"],
      proRecommendation: "Have system inspected - could be a blower or ductwork issue",
    },
  ],
  
  defaultOutcome: {
    urgency: "schedule",
    likelyCauses: ["Dirty filter", "Duct issue", "Blower problem"],
    proRecommendation: "Schedule HVAC inspection to diagnose airflow issues",
  },
  
  packetTemplate: {
    suggestedQuestions: [
      "What's causing the weak airflow?",
      "Are my ducts leaking?",
      "Is my system properly sized for my home?",
      "Would duct cleaning help?",
    ],
    docsToCollect: ["Invoice", "Service report"],
    photoChecklist: [
      "Photo of air filter",
      "Photo of affected vents",
      "Photo of accessible ductwork",
    ],
  },
};

const thermostatIssue: TriageFlow = {
  id: "thermostat-issue",
  category: "hvac",
  systemTypeMatch: "Thermostat",
  symptom: "Thermostat not responding correctly",
  shortDescription: "Thermostat display or controls not working",
  icon: "🌡️",
  
  immediateWarnings: [
    "If the display is completely blank, your HVAC won't run",
    "Incorrect thermostat settings can cause system damage",
  ],
  
  questions: [
    {
      id: "display",
      text: "What's the thermostat display showing?",
      options: [
        { value: "blank", label: "Completely blank", nextQuestionId: "battery_type" },
        { value: "working", label: "Display works, but system doesn't respond", nextQuestionId: "call_for" },
        { value: "wrong_temp", label: "Shows wrong temperature", nextQuestionId: "location" },
        { value: "error", label: "Error message or code" },
      ],
    },
    {
      id: "battery_type",
      text: "Does your thermostat use batteries?",
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No, hardwired only" },
        { value: "unsure", label: "Not sure" },
      ],
    },
    {
      id: "call_for",
      text: "What is the system failing to do?",
      options: [
        { value: "heat", label: "Won't start heating" },
        { value: "cool", label: "Won't start cooling" },
        { value: "both", label: "Won't do either" },
        { value: "fan", label: "Fan won't run" },
      ],
    },
    {
      id: "location",
      text: "Where is the thermostat located?",
      options: [
        { value: "good", label: "Interior wall, away from vents" },
        { value: "sun", label: "In direct sunlight" },
        { value: "near_vent", label: "Near a supply vent" },
        { value: "exterior", label: "On an exterior wall" },
      ],
    },
  ],
  
  outcomes: [
    {
      condition: (a) => a.display === "blank" && a.battery_type === "yes",
      urgency: "monitor",
      likelyCauses: ["Dead batteries"],
      diySteps: [
        "Remove thermostat from wall plate",
        "Replace batteries (usually AA or AAA)",
        "Reinstall and wait 30 seconds for reboot",
      ],
    },
    {
      condition: (a) => a.display === "blank" && a.battery_type === "no",
      urgency: "schedule",
      likelyCauses: ["Tripped breaker", "Loose wiring", "Bad transformer"],
      diySteps: [
        "Check HVAC circuit breaker",
        "Check if furnace switch is on",
      ],
      proRecommendation: "If breakers are fine, wiring or transformer issue needs a tech",
    },
    {
      condition: (a) => a.display === "working" && a.call_for === "both",
      urgency: "schedule",
      likelyCauses: ["Bad thermostat", "Wiring issue", "HVAC system problem"],
      proRecommendation: "Could be thermostat failure or a system problem - tech needed",
    },
    {
      condition: (a) => a.display === "wrong_temp" && (a.location === "sun" || a.location === "near_vent"),
      urgency: "monitor",
      likelyCauses: ["Poor thermostat placement"],
      diySteps: [
        "Thermostat may need to be relocated",
        "Keep curtains closed on sunny side",
        "Consider a smart thermostat with remote sensors",
      ],
    },
  ],
  
  defaultOutcome: {
    urgency: "schedule",
    likelyCauses: ["Thermostat failure", "Wiring issue", "Compatibility problem"],
    proRecommendation: "HVAC technician can diagnose and replace if needed",
  },
  
  packetTemplate: {
    suggestedQuestions: [
      "Is the thermostat bad or is it a system issue?",
      "Would a smart thermostat work with my system?",
      "Is my thermostat in a good location?",
    ],
    docsToCollect: ["Invoice", "New thermostat manual/warranty"],
    photoChecklist: [
      "Photo of thermostat display",
      "Photo of thermostat location on wall",
      "Photo behind thermostat (wires) if accessible",
    ],
  },
};

const hvacNoise: TriageFlow = {
  id: "hvac-noise",
  category: "hvac",
  symptom: "Unusual sounds from HVAC system",
  shortDescription: "Strange noises from heating or cooling equipment",
  icon: "🔊",
  
  immediateWarnings: [
    "Grinding or screeching sounds may indicate a failing motor - turn off to prevent damage",
    "Banging from the furnace could indicate a dangerous condition",
    "A hissing sound might indicate a refrigerant leak",
  ],
  
  shutoffGuidance: {
    type: "hvac",
    instructions: [
      "Set thermostat to OFF to stop the system",
      "If noise continues, check the disconnect switch near the outdoor unit",
      "Turn off the HVAC circuit breaker if needed",
    ],
    whenRequired: "If you hear grinding, loud banging, or screeching",
  },
  
  questions: [
    {
      id: "noise_type",
      text: "What does the noise sound like?",
      options: [
        { value: "grinding", label: "Grinding or squealing", nextQuestionId: "which_unit" },
        { value: "banging", label: "Banging or booming", nextQuestionId: "bang_timing" },
        { value: "rattling", label: "Rattling or vibrating", nextQuestionId: "which_unit" },
        { value: "clicking", label: "Clicking or ticking", nextQuestionId: "click_timing" },
        { value: "hissing", label: "Hissing or whistling", nextQuestionId: "which_unit" },
      ],
    },
    {
      id: "which_unit",
      text: "Where is the noise coming from?",
      options: [
        { value: "outdoor", label: "Outdoor unit (condenser)" },
        { value: "indoor", label: "Indoor unit (furnace/air handler)" },
        { value: "ducts", label: "Ductwork/vents" },
        { value: "unsure", label: "Hard to tell" },
      ],
    },
    {
      id: "bang_timing",
      text: "When does the banging occur?",
      options: [
        { value: "startup", label: "When system starts" },
        { value: "shutdown", label: "When system stops" },
        { value: "running", label: "While running" },
        { value: "random", label: "Randomly" },
      ],
    },
    {
      id: "click_timing",
      text: "How often does it click?",
      options: [
        { value: "once", label: "Once at startup (normal)" },
        { value: "repeated", label: "Repeatedly when trying to start" },
        { value: "constant", label: "Constantly while running" },
      ],
    },
  ],
  
  outcomes: [
    {
      condition: (a) => a.noise_type === "grinding",
      urgency: "urgent",
      likelyCauses: ["Motor bearings failing", "Fan blade damage", "Compressor issue"],
      diySteps: ["Turn off system immediately to prevent further damage"],
      proRecommendation: "Call HVAC tech - running could cause motor burnout",
    },
    {
      condition: (a) => a.noise_type === "banging" && a.bang_timing === "startup",
      urgency: "schedule",
      likelyCauses: ["Delayed ignition (gas furnace)", "Duct expansion/contraction", "Loose blower wheel"],
      proRecommendation: "Have it checked - delayed ignition can be dangerous",
    },
    {
      condition: (a) => a.noise_type === "rattling" && a.which_unit === "ducts",
      urgency: "monitor",
      likelyCauses: ["Loose ductwork", "Debris in ducts", "Duct expansion"],
      diySteps: [
        "Check visible duct connections for looseness",
        "Tighten any accessible screws or clamps",
        "Check vent covers for loose louvers",
      ],
    },
    {
      condition: (a) => a.noise_type === "clicking" && a.click_timing === "repeated",
      urgency: "schedule",
      likelyCauses: ["Failing ignitor", "Bad capacitor", "Relay issue"],
      proRecommendation: "Repeated clicking usually indicates an electrical component failure",
    },
    {
      condition: (a) => a.noise_type === "hissing" && a.which_unit === "outdoor",
      urgency: "urgent",
      likelyCauses: ["Refrigerant leak", "Compressor valve issue"],
      proRecommendation: "May be a refrigerant leak - don't run the AC, call a tech",
    },
    {
      condition: (a) => a.noise_type === "hissing" && a.which_unit === "ducts",
      urgency: "schedule",
      likelyCauses: ["Duct leak", "Duct too small", "Damper partially closed"],
      proRecommendation: "Likely a duct issue - have ductwork inspected",
    },
  ],
  
  defaultOutcome: {
    urgency: "schedule",
    likelyCauses: ["Mechanical wear", "Loose components", "Normal operation sounds"],
    proRecommendation: "Have HVAC technician inspect to identify the source",
  },
  
  packetTemplate: {
    suggestedQuestions: [
      "What's causing the noise?",
      "Is it safe to continue running the system?",
      "Will this lead to bigger problems if ignored?",
      "What's the cost to fix?",
    ],
    docsToCollect: ["Invoice", "Service report"],
    photoChecklist: [
      "Video of the noise if possible",
      "Photo of the unit making noise",
      "Photo of any visible damage or loose parts",
    ],
  },
};

// =====================================================
// ELECTRICAL ISSUES (5)
// =====================================================

const trippingBreaker: TriageFlow = {
  id: "tripping-breaker",
  category: "electrical",
  symptom: "Circuit breaker keeps tripping",
  shortDescription: "Breaker trips repeatedly when reset",
  icon: "⚡",
  
  immediateWarnings: [
    "A repeatedly tripping breaker is a safety mechanism — do NOT hold it in the ON position",
    "If you smell burning or see scorch marks, do NOT reset the breaker — call an electrician",
    "Never replace a breaker with a higher-amperage one — this is a fire hazard",
  ],
  
  shutoffGuidance: {
    type: "electrical",
    instructions: [
      "Leave the tripped breaker in the OFF position",
      "Unplug all devices on that circuit",
      "Try resetting the breaker once",
      "If it trips again immediately, leave it off and call an electrician",
    ],
    whenRequired: "If breaker trips immediately upon reset or you smell burning",
  },
  
  questions: [
    {
      id: "frequency",
      text: "How often does it trip?",
      options: [
        { value: "immediately", label: "Trips immediately when reset", nextQuestionId: "smell" },
        { value: "with_device", label: "Only when using a specific device", nextQuestionId: "which_device" },
        { value: "random", label: "Randomly during the day", nextQuestionId: "load_count" },
      ],
    },
    {
      id: "smell",
      text: "Do you notice any burning smell near the panel?",
      options: [
        { value: "yes", label: "Yes, there's a smell" },
        { value: "no", label: "No smell" },
      ],
    },
    {
      id: "which_device",
      text: "What device triggers the trip?",
      options: [
        { value: "high_draw", label: "Space heater, AC, or hair dryer" },
        { value: "motor", label: "Refrigerator, washer, or vacuum" },
        { value: "small", label: "Lamp, phone charger, or other small device" },
      ],
    },
    {
      id: "load_count",
      text: "How many devices are on this circuit?",
      options: [
        { value: "few", label: "1-3 items" },
        { value: "many", label: "4+ items or multiple power strips" },
        { value: "unsure", label: "Not sure" },
      ],
    },
  ],
  
  outcomes: [
    {
      condition: (a) => a.frequency === "immediately" && a.smell === "yes",
      urgency: "urgent",
      likelyCauses: ["Short circuit in wiring", "Damaged wire insulation", "Failing breaker"],
      proRecommendation: "Call an electrician immediately — possible fire hazard. Do not reset the breaker.",
    },
    {
      condition: (a) => a.frequency === "immediately" && a.smell === "no",
      urgency: "schedule",
      likelyCauses: ["Short circuit in wiring or device", "Ground fault", "Failing breaker"],
      diySteps: [
        "Unplug everything on the circuit",
        "Reset the breaker",
        "Plug items in one at a time to identify the problem device",
      ],
    },
    {
      condition: (a) => a.frequency === "with_device" && a.which_device === "high_draw",
      urgency: "schedule",
      likelyCauses: ["Circuit overloaded", "Device draws too much power", "Shared circuit issue"],
      diySteps: [
        "Check if the device is on a dedicated circuit or shared",
        "Move high-draw devices to different circuits",
        "A 15-amp circuit handles ~1,800 watts; a 20-amp handles ~2,400 watts",
      ],
    },
    {
      condition: (a) => a.frequency === "random" && a.load_count === "many",
      urgency: "schedule",
      likelyCauses: ["Circuit overloaded", "Too many devices on one circuit"],
      diySteps: [
        "Reduce the number of devices on this circuit",
        "Avoid daisy-chaining power strips",
        "Consider having an electrician add additional circuits",
      ],
    },
  ],
  
  defaultOutcome: {
    urgency: "schedule",
    likelyCauses: ["Overloaded circuit", "Faulty device", "Aging breaker"],
    proRecommendation: "Schedule an electrician to inspect the circuit and breaker",
  },
  
  packetTemplate: {
    suggestedQuestions: [
      "What's causing the breaker to trip?",
      "Is my panel safe and up to code?",
      "Do I need additional circuits?",
      "Should I upgrade to a larger panel?",
    ],
    docsToCollect: ["Invoice", "Panel inspection report"],
    photoChecklist: [
      "Photo of breaker panel with tripping breaker identified",
      "Photo of devices on the circuit",
      "Photo of any scorch marks or damage",
    ],
  },
};

const deadOutlet: TriageFlow = {
  id: "dead-outlet",
  category: "electrical",
  symptom: "Outlet not providing power",
  shortDescription: "One or more outlets have no power",
  icon: "🔌",
  
  immediateWarnings: [
    "Do not attempt to open outlets or switches if you're not comfortable with electrical work",
    "If an outlet is sparking, warm, or discolored, turn off the breaker for that circuit",
    "Water near electrical outlets requires immediate breaker shutoff",
  ],
  
  shutoffGuidance: {
    type: "electrical",
    instructions: [
      "If outlet shows signs of damage (warm, discolored, burning smell), turn off the breaker",
      "Use a voltage tester before touching any outlet internals",
    ],
    whenRequired: "If outlet shows signs of overheating, sparking, or water exposure",
  },
  
  questions: [
    {
      id: "how_many",
      text: "How many outlets are affected?",
      options: [
        { value: "one", label: "Just one outlet", nextQuestionId: "outlet_type" },
        { value: "few", label: "Several in one room", nextQuestionId: "gfci_check" },
        { value: "many", label: "Half the house or more", nextQuestionId: "breaker_check" },
      ],
    },
    {
      id: "outlet_type",
      text: "Is it a GFCI outlet (has TEST/RESET buttons)?",
      options: [
        { value: "gfci", label: "Yes, it's a GFCI outlet" },
        { value: "regular", label: "No, regular outlet" },
        { value: "unsure", label: "Not sure" },
      ],
    },
    {
      id: "gfci_check",
      text: "Have you checked nearby GFCI outlets?",
      options: [
        { value: "reset", label: "Found one and reset it" },
        { value: "none_found", label: "Can't find any GFCI outlets" },
        { value: "not_checked", label: "Haven't checked yet" },
      ],
    },
    {
      id: "breaker_check",
      text: "Have you checked the breaker panel?",
      options: [
        { value: "tripped", label: "Found a tripped breaker" },
        { value: "all_on", label: "All breakers appear on" },
        { value: "not_checked", label: "Haven't checked yet" },
      ],
    },
  ],
  
  outcomes: [
    {
      condition: (a) => a.outlet_type === "gfci",
      urgency: "monitor",
      likelyCauses: ["GFCI tripped", "Faulty GFCI outlet"],
      diySteps: [
        "Press the RESET button firmly on the GFCI outlet",
        "If it won't reset, check the breaker panel",
        "GFCI outlets last 10-15 years — old ones may need replacement",
      ],
    },
    {
      condition: (a) => a.how_many === "few" && a.gfci_check === "not_checked",
      urgency: "monitor",
      likelyCauses: ["Tripped GFCI upstream", "Tripped breaker"],
      diySteps: [
        "Check kitchen, bathroom, and garage for GFCI outlets with TEST/RESET buttons",
        "One tripped GFCI can kill power to multiple downstream outlets",
        "Press RESET on any tripped GFCI outlets",
      ],
    },
    {
      condition: (a) => a.how_many === "many" && a.breaker_check === "all_on",
      urgency: "schedule",
      likelyCauses: ["Loose wiring at panel", "Failing breaker", "Upstream connection issue"],
      proRecommendation: "Call an electrician — multiple dead outlets with breakers on suggests a wiring issue",
    },
    {
      condition: (a) => a.breaker_check === "tripped",
      urgency: "monitor",
      likelyCauses: ["Overloaded circuit", "Short circuit"],
      diySteps: [
        "Reset the tripped breaker by flipping it fully OFF then ON",
        "If it trips again, see the 'Tripping Breaker' troubleshooter",
      ],
    },
  ],
  
  defaultOutcome: {
    urgency: "schedule",
    likelyCauses: ["Loose wiring", "Faulty outlet", "GFCI trip"],
    proRecommendation: "An electrician can diagnose and fix safely",
  },
  
  packetTemplate: {
    suggestedQuestions: [
      "What's causing the dead outlet(s)?",
      "Is the wiring safe?",
      "Do I need any outlets replaced?",
      "Are my outlets properly grounded?",
    ],
    docsToCollect: ["Invoice", "Outlet test results"],
    photoChecklist: [
      "Photo of dead outlet(s)",
      "Photo of breaker panel",
      "Photo of any GFCI outlets found",
    ],
  },
};

const flickeringLights: TriageFlow = {
  id: "flickering-lights",
  category: "electrical",
  symptom: "Lights flickering or dimming",
  shortDescription: "Lights dim, flicker, or buzz",
  icon: "💡",
  
  immediateWarnings: [
    "Widespread flickering can indicate a serious wiring problem — don't ignore it",
    "If lights dim when turning on appliances, the circuit may be overloaded",
    "Burning smell with flickering lights is an emergency — turn off the breaker",
  ],
  
  questions: [
    {
      id: "scope",
      text: "How many lights are affected?",
      options: [
        { value: "one", label: "Just one light fixture", nextQuestionId: "bulb_type" },
        { value: "one_room", label: "All lights in one room", nextQuestionId: "trigger" },
        { value: "whole_house", label: "Whole house", nextQuestionId: "trigger" },
      ],
    },
    {
      id: "bulb_type",
      text: "What type of bulb?",
      options: [
        { value: "led", label: "LED" },
        { value: "cfl", label: "CFL (spiral)" },
        { value: "incandescent", label: "Incandescent/halogen" },
        { value: "unsure", label: "Not sure" },
      ],
    },
    {
      id: "trigger",
      text: "When does the flickering happen?",
      options: [
        { value: "constant", label: "All the time" },
        { value: "appliance", label: "When an appliance turns on" },
        { value: "wind", label: "During wind or storms" },
        { value: "random", label: "Randomly" },
      ],
    },
  ],
  
  outcomes: [
    {
      condition: (a) => a.scope === "one" && a.bulb_type === "led",
      urgency: "monitor",
      likelyCauses: ["Incompatible LED with dimmer switch", "Loose bulb", "Cheap LED driver"],
      diySteps: [
        "Tighten the bulb in its socket",
        "If on a dimmer, ensure the dimmer is LED-compatible",
        "Try a different brand of LED bulb",
      ],
    },
    {
      condition: (a) => a.trigger === "appliance",
      urgency: "schedule",
      likelyCauses: ["Large appliance on shared circuit", "Undersized wiring", "Loose neutral connection"],
      diySteps: [
        "Note which appliance triggers the dimming",
        "Slight dimming when AC compressor starts can be normal",
        "Severe dimming or dimming with small appliances needs investigation",
      ],
    },
    {
      condition: (a) => a.scope === "whole_house" && a.trigger === "constant",
      urgency: "urgent",
      likelyCauses: ["Loose utility connection", "Failing main breaker", "Neutral wire issue"],
      proRecommendation: "Call electrician or power company — could be a dangerous neutral issue",
    },
    {
      condition: (a) => a.trigger === "wind",
      urgency: "schedule",
      likelyCauses: ["Loose service entrance cable", "Weatherhead connection issue"],
      proRecommendation: "Contact your power company — the connection at the weatherhead may be loose",
    },
  ],
  
  defaultOutcome: {
    urgency: "schedule",
    likelyCauses: ["Loose connection", "Dimmer compatibility", "Wiring issue"],
    proRecommendation: "An electrician can identify the cause safely",
  },
  
  packetTemplate: {
    suggestedQuestions: [
      "What's causing the flickering?",
      "Is this a safety concern?",
      "Do I need to upgrade any wiring or circuits?",
    ],
    docsToCollect: ["Invoice", "Inspection report"],
    photoChecklist: [
      "Video of the flickering if possible",
      "Photo of affected light fixtures",
      "Photo of breaker panel",
    ],
  },
};

const buzzingPanel: TriageFlow = {
  id: "buzzing-panel",
  category: "electrical",
  symptom: "Buzzing from electrical panel",
  shortDescription: "Audible buzzing or humming from breaker panel",
  icon: "🔊",
  
  immediateWarnings: [
    "Loud buzzing from a breaker panel can indicate a serious and dangerous problem",
    "Do NOT open the panel cover if you hear loud buzzing — call an electrician",
    "If you see sparks or smell burning, evacuate and call 911",
  ],
  
  questions: [
    {
      id: "volume",
      text: "How loud is the buzzing?",
      options: [
        { value: "faint", label: "Faint hum, only noticeable up close", nextQuestionId: "constant" },
        { value: "moderate", label: "Noticeable from a few feet away", nextQuestionId: "constant" },
        { value: "loud", label: "Very loud, clearly abnormal" },
      ],
    },
    {
      id: "constant",
      text: "Is the sound constant or intermittent?",
      options: [
        { value: "constant", label: "Constant" },
        { value: "intermittent", label: "Comes and goes" },
        { value: "load_based", label: "Gets louder when using appliances" },
      ],
    },
  ],
  
  outcomes: [
    {
      condition: (a) => a.volume === "loud",
      urgency: "urgent",
      likelyCauses: ["Arcing inside panel", "Failing breaker", "Loose bus bar connection"],
      proRecommendation: "Call electrician immediately — do NOT open the panel. This is a fire risk.",
    },
    {
      condition: (a) => a.volume === "faint" && a.constant === "constant",
      urgency: "monitor",
      likelyCauses: ["Normal transformer hum", "Slightly loose breaker"],
      diySteps: [
        "A very faint 60Hz hum can be normal",
        "If it's new or increasing, schedule an inspection",
      ],
    },
    {
      condition: (a) => a.constant === "load_based",
      urgency: "schedule",
      likelyCauses: ["Overloaded circuit", "Loose connection", "Undersized wiring"],
      proRecommendation: "Have an electrician check connections and load balance",
    },
  ],
  
  defaultOutcome: {
    urgency: "schedule",
    likelyCauses: ["Loose connection", "Aging breaker", "Load imbalance"],
    proRecommendation: "Schedule an electrical inspection — panel issues shouldn't be ignored",
  },
  
  packetTemplate: {
    suggestedQuestions: [
      "What's causing the buzzing?",
      "Is my panel safe?",
      "Does my panel need to be replaced?",
      "Is my home properly grounded?",
    ],
    docsToCollect: ["Invoice", "Panel inspection report"],
    photoChecklist: [
      "Photo of breaker panel (with cover on)",
      "Video of the buzzing sound",
      "Photo of panel label showing amp rating",
    ],
  },
};

const gfciWontReset: TriageFlow = {
  id: "gfci-wont-reset",
  category: "electrical",
  symptom: "GFCI outlet won't reset",
  shortDescription: "GFCI trips immediately or won't stay reset",
  icon: "🔄",
  
  immediateWarnings: [
    "A GFCI that won't reset is doing its job — there may be a ground fault somewhere",
    "Do not bypass or tape the reset button",
    "Check for water intrusion near the outlet or downstream outlets",
  ],
  
  questions: [
    {
      id: "behavior",
      text: "What happens when you press RESET?",
      options: [
        { value: "pops_out", label: "Reset button pops right back out", nextQuestionId: "water" },
        { value: "nothing", label: "Button doesn't click at all", nextQuestionId: "power" },
        { value: "resets_then_trips", label: "Stays for a moment then trips", nextQuestionId: "water" },
      ],
    },
    {
      id: "water",
      text: "Is there any water or moisture near the outlet?",
      options: [
        { value: "yes", label: "Yes, I see moisture" },
        { value: "no", label: "No, it's dry" },
        { value: "recently", label: "There was water recently (rain, spill)" },
      ],
    },
    {
      id: "power",
      text: "Does the GFCI outlet have power from the breaker?",
      options: [
        { value: "yes", label: "Breaker is on" },
        { value: "tripped", label: "Breaker was tripped" },
        { value: "unsure", label: "Not sure which breaker" },
      ],
    },
  ],
  
  outcomes: [
    {
      condition: (a) => a.water === "yes",
      urgency: "schedule",
      likelyCauses: ["Water intrusion causing ground fault", "Moisture in outlet box"],
      diySteps: [
        "Dry the area thoroughly",
        "If outdoors, check that the weather cover is intact",
        "Wait until completely dry before trying to reset",
      ],
    },
    {
      condition: (a) => a.behavior === "nothing" && a.power === "tripped",
      urgency: "monitor",
      likelyCauses: ["Breaker tripped first", "No power to GFCI"],
      diySteps: [
        "Reset the breaker first",
        "Then try resetting the GFCI",
      ],
    },
    {
      condition: (a) => a.behavior === "pops_out" && a.water === "no",
      urgency: "schedule",
      likelyCauses: ["Ground fault in downstream wiring", "Failed GFCI outlet", "Short in connected device"],
      diySteps: [
        "Unplug everything from the GFCI outlet and any outlets downstream of it",
        "Try resetting with nothing plugged in",
        "If it resets, plug items in one at a time to find the problem device",
      ],
    },
  ],
  
  defaultOutcome: {
    urgency: "schedule",
    likelyCauses: ["Failed GFCI", "Downstream wiring issue", "Ground fault"],
    proRecommendation: "An electrician can test and replace the GFCI if needed ($75-150)",
  },
  
  packetTemplate: {
    suggestedQuestions: [
      "What's causing the GFCI to trip?",
      "Is the GFCI outlet bad or is there a wiring issue?",
      "How old are my GFCI outlets and should they be replaced?",
    ],
    docsToCollect: ["Invoice"],
    photoChecklist: [
      "Photo of the GFCI outlet",
      "Photo of nearby water sources if applicable",
      "Photo of breaker panel",
    ],
  },
};

// =====================================================
// APPLIANCE ISSUES (5)
// =====================================================

const fridgeNotCooling: TriageFlow = {
  id: "fridge-not-cooling",
  category: "appliances",
  systemTypeMatch: "Refrigerator",
  symptom: "Refrigerator not keeping food cold",
  shortDescription: "Fridge running but not cooling properly",
  icon: "🧊",
  
  immediateWarnings: [
    "Food safety: Refrigerator should be below 40°F (4°C). Discard perishables if above for 4+ hours.",
    "Do not block the vents between the freezer and fridge compartments",
    "Pull the fridge away from the wall carefully — it's heavy",
  ],
  
  questions: [
    {
      id: "freezer",
      text: "Is the freezer working?",
      options: [
        { value: "yes", label: "Freezer is cold, fridge is warm", nextQuestionId: "vents" },
        { value: "no", label: "Neither freezer nor fridge is cold", nextQuestionId: "running" },
        { value: "partially", label: "Both are warmer than normal" },
      ],
    },
    {
      id: "vents",
      text: "Are the vents between freezer and fridge blocked?",
      options: [
        { value: "blocked", label: "Yes, items are packed against them" },
        { value: "clear", label: "No, vents are clear" },
        { value: "ice", label: "There's ice buildup over the vents" },
      ],
    },
    {
      id: "running",
      text: "Can you hear the compressor running?",
      options: [
        { value: "yes", label: "Yes, it's humming" },
        { value: "no", label: "It's completely silent" },
        { value: "clicking", label: "Clicking on and off" },
      ],
    },
  ],
  
  outcomes: [
    {
      condition: (a) => a.freezer === "yes" && a.vents === "blocked",
      urgency: "monitor",
      likelyCauses: ["Blocked air vents between compartments"],
      diySteps: [
        "Rearrange items to ensure 1-2 inches of clearance around vents",
        "Don't overfill the fridge — air needs to circulate",
        "Wait 24 hours and check temperature",
      ],
    },
    {
      condition: (a) => a.freezer === "yes" && a.vents === "ice",
      urgency: "schedule",
      likelyCauses: ["Defrost system failure", "Failed defrost heater or timer"],
      diySteps: [
        "Unplug the fridge for 24 hours to fully defrost",
        "Place towels to catch water",
        "If it refreezes, the defrost system needs repair",
      ],
    },
    {
      condition: (a) => a.running === "no",
      urgency: "schedule",
      likelyCauses: ["Compressor failure", "Start relay failure", "Bad thermostat"],
      proRecommendation: "Silent compressor usually means a component has failed — needs professional diagnosis",
    },
    {
      condition: (a) => a.running === "clicking",
      urgency: "schedule",
      likelyCauses: ["Failed start relay", "Compressor overheating", "Electrical issue"],
      diySteps: [
        "Unplug the fridge for 10 minutes, then plug back in",
        "If clicking persists, the start relay likely needs replacement ($20-50 part, $100-200 with labor)",
      ],
    },
  ],
  
  defaultOutcome: {
    urgency: "schedule",
    likelyCauses: ["Dirty condenser coils", "Thermostat issue", "Sealed system problem"],
    proRecommendation: "Schedule appliance repair — food safety is a concern",
  },
  
  packetTemplate: {
    suggestedQuestions: [
      "What's wrong with my refrigerator?",
      "Is it worth repairing given its age?",
      "What's the expected cost of repair vs replacement?",
    ],
    docsToCollect: ["Invoice", "Warranty info", "Model/serial number"],
    photoChecklist: [
      "Photo of refrigerator model plate",
      "Photo of any ice buildup",
      "Photo of the condenser coils (behind or underneath)",
    ],
  },
};

const dishwasherNotDraining: TriageFlow = {
  id: "dishwasher-not-draining",
  category: "appliances",
  systemTypeMatch: "Dishwasher",
  symptom: "Standing water in dishwasher",
  shortDescription: "Dishwasher not draining after cycle",
  icon: "🍽️",
  
  immediateWarnings: [
    "Standing water can develop mold and bacteria — address within a day",
    "Do not run another cycle until the drain issue is resolved",
    "Check under the dishwasher for leaks before running it",
  ],
  
  questions: [
    {
      id: "amount",
      text: "How much water is in the bottom?",
      options: [
        { value: "puddle", label: "Small puddle (normal for some models)", nextQuestionId: "recent_change" },
        { value: "inch", label: "About an inch of water", nextQuestionId: "filter_check" },
        { value: "several", label: "Several inches", nextQuestionId: "disposal" },
      ],
    },
    {
      id: "recent_change",
      text: "Did anything change recently?",
      options: [
        { value: "new_disposal", label: "New garbage disposal installed" },
        { value: "plumbing_work", label: "Recent plumbing work" },
        { value: "nothing", label: "Nothing changed" },
      ],
    },
    {
      id: "filter_check",
      text: "Have you checked the dishwasher filter?",
      options: [
        { value: "clean", label: "It's clean" },
        { value: "dirty", label: "It's dirty/clogged" },
        { value: "no_filter", label: "Can't find it" },
      ],
    },
    {
      id: "disposal",
      text: "Do you have a garbage disposal?",
      options: [
        { value: "yes_works", label: "Yes, and it works fine" },
        { value: "yes_clogged", label: "Yes, but it's slow or clogged" },
        { value: "no", label: "No garbage disposal" },
      ],
    },
  ],
  
  outcomes: [
    {
      condition: (a) => a.recent_change === "new_disposal",
      urgency: "monitor",
      likelyCauses: ["Knockout plug not removed from disposal"],
      diySteps: [
        "When a new disposal is installed, the dishwasher knockout plug must be removed",
        "This is the #1 cause of dishwasher drain issues after disposal replacement",
        "The installer should remove this — call them back",
      ],
    },
    {
      condition: (a) => a.filter_check === "dirty",
      urgency: "monitor",
      likelyCauses: ["Clogged filter restricting drainage"],
      diySteps: [
        "Remove the filter (usually twists out at the bottom)",
        "Clean under running water with a soft brush",
        "Reinstall and run a short cycle to test",
      ],
    },
    {
      condition: (a) => a.disposal === "yes_clogged",
      urgency: "monitor",
      likelyCauses: ["Clogged garbage disposal blocking dishwasher drain"],
      diySteps: [
        "Clear the garbage disposal first — the dishwasher drains through it",
        "Run the disposal with plenty of water",
        "Then run the dishwasher",
      ],
    },
    {
      condition: (a) => a.amount === "several",
      urgency: "schedule",
      likelyCauses: ["Drain pump failure", "Clogged drain hose", "Air gap blockage"],
      proRecommendation: "Several inches of standing water often indicates a pump or hose problem",
    },
  ],
  
  defaultOutcome: {
    urgency: "schedule",
    likelyCauses: ["Drain hose kink", "Pump issue", "Clog in drain path"],
    proRecommendation: "An appliance tech can clear the drain path or replace the pump",
  },
  
  packetTemplate: {
    suggestedQuestions: [
      "What's preventing the dishwasher from draining?",
      "Is the drain pump working?",
      "Should I repair or replace the dishwasher?",
    ],
    docsToCollect: ["Invoice", "Model/serial number"],
    photoChecklist: [
      "Photo of standing water in dishwasher",
      "Photo of the filter",
      "Photo of drain hose connection under sink",
    ],
  },
};

const washerLeaking: TriageFlow = {
  id: "washer-leaking",
  category: "appliances",
  systemTypeMatch: "Washing Machine",
  symptom: "Water pooling around washing machine",
  shortDescription: "Washing machine leaking water",
  icon: "🌊",
  
  immediateWarnings: [
    "Water near electrical outlets is a shock hazard — turn off the breaker if water is near outlets",
    "Stop the washing machine immediately if actively leaking",
    "Rubber supply hoses can burst — check for bulging or cracks",
  ],
  
  shutoffGuidance: {
    type: "water",
    instructions: [
      "Turn off both hot and cold water supply valves behind the washer",
      "If you can't reach them, turn off the main water supply",
      "Unplug the washer before moving it",
    ],
    whenRequired: "If water is actively flowing or you see a burst hose",
  },
  
  questions: [
    {
      id: "when",
      text: "When does the leak occur?",
      options: [
        { value: "fill", label: "During the fill cycle", nextQuestionId: "hose_age" },
        { value: "wash", label: "During washing/agitation", nextQuestionId: "location" },
        { value: "drain", label: "During drain/spin", nextQuestionId: "location" },
        { value: "always", label: "Water always present" },
      ],
    },
    {
      id: "hose_age",
      text: "How old are the supply hoses?",
      options: [
        { value: "new", label: "Less than 5 years" },
        { value: "old", label: "5+ years or rubber hoses" },
        { value: "unsure", label: "Not sure" },
      ],
    },
    {
      id: "location",
      text: "Where is the water pooling?",
      options: [
        { value: "front", label: "Front of the machine" },
        { value: "back", label: "Behind the machine" },
        { value: "underneath", label: "Directly underneath" },
      ],
    },
  ],
  
  outcomes: [
    {
      condition: (a) => a.when === "fill" && (a.hose_age === "old" || a.hose_age === "unsure"),
      urgency: "schedule",
      likelyCauses: ["Worn supply hoses", "Loose hose connections"],
      diySteps: [
        "Inspect both supply hoses for bulging, cracking, or drips at connections",
        "Replace rubber hoses with braided stainless steel hoses ($15-30 pair)",
        "Tighten connections by hand plus a quarter turn with pliers",
        "Replace supply hoses every 5 years regardless of condition",
      ],
    },
    {
      condition: (a) => a.location === "front",
      urgency: "schedule",
      likelyCauses: ["Worn door seal (front loader)", "Overloading", "Too much detergent"],
      diySteps: [
        "Check the door gasket for tears, mold, or debris",
        "Clean the door gasket with vinegar solution",
        "Use HE detergent and don't overload",
      ],
    },
    {
      condition: (a) => a.when === "drain" && a.location === "back",
      urgency: "schedule",
      likelyCauses: ["Drain hose loose or cracked", "Drain pump leak"],
      diySteps: [
        "Check that the drain hose is securely in the standpipe",
        "Inspect the hose for cracks",
        "Ensure the standpipe isn't overflowing (clog downstream)",
      ],
    },
  ],
  
  defaultOutcome: {
    urgency: "schedule",
    likelyCauses: ["Hose connection", "Seal failure", "Internal leak"],
    proRecommendation: "An appliance tech can identify and fix the leak source",
  },
  
  packetTemplate: {
    suggestedQuestions: [
      "Where exactly is the leak coming from?",
      "Is it a simple fix or a major repair?",
      "Should I replace the supply hoses as a precaution?",
    ],
    docsToCollect: ["Invoice", "Model/serial number"],
    photoChecklist: [
      "Photo of water pooling location",
      "Photo of supply hoses",
      "Photo of drain hose connection",
    ],
  },
};

const dryerNotHeating: TriageFlow = {
  id: "dryer-not-heating",
  category: "appliances",
  systemTypeMatch: "Dryer",
  symptom: "Dryer tumbles but clothes stay wet",
  shortDescription: "Dryer not producing heat",
  icon: "🔥",
  
  immediateWarnings: [
    "A clogged dryer vent is a fire hazard — check the vent first",
    "Lint buildup is the #1 cause of dryer fires (2,900+ fires/year in the US)",
    "Gas dryer: If you smell gas, turn off the gas valve and ventilate the area",
  ],
  
  shutoffGuidance: {
    type: "gas",
    instructions: [
      "If gas dryer: Turn off the gas valve (usually behind the dryer)",
      "If electric dryer: The breaker is typically a double-pole 30-amp breaker",
      "Unplug the dryer before any inspection or maintenance",
    ],
    whenRequired: "If you smell gas or see sparks",
  },
  
  questions: [
    {
      id: "type",
      text: "Is your dryer gas or electric?",
      options: [
        { value: "gas", label: "Gas", nextQuestionId: "vent_check" },
        { value: "electric", label: "Electric", nextQuestionId: "vent_check" },
        { value: "unsure", label: "Not sure" },
      ],
    },
    {
      id: "vent_check",
      text: "When did you last clean the dryer vent (the duct going outside)?",
      options: [
        { value: "recent", label: "Within the last year" },
        { value: "long_ago", label: "Over a year ago or never" },
        { value: "unsure", label: "Not sure" },
      ],
    },
  ],
  
  outcomes: [
    {
      condition: (a) => a.vent_check === "long_ago" || a.vent_check === "unsure",
      urgency: "schedule",
      likelyCauses: ["Clogged dryer vent", "Lint buildup restricting airflow"],
      diySteps: [
        "Disconnect the dryer vent from the back of the dryer",
        "Clean lint from the vent duct with a dryer vent brush or vacuum",
        "Check the exterior vent flap — it should open when dryer is running",
        "Reconnect and test — dryer vents should be cleaned annually",
      ],
    },
    {
      condition: (a) => a.type === "electric" && a.vent_check === "recent",
      urgency: "schedule",
      likelyCauses: ["Failed heating element", "Bad thermal fuse", "Tripped breaker"],
      diySteps: [
        "Check that both poles of the 30-amp breaker are ON (electric dryers use 240V)",
        "Sometimes one pole trips — the dryer will tumble but not heat",
        "If breakers are fine, heating element or thermal fuse likely needs replacement",
      ],
    },
    {
      condition: (a) => a.type === "gas" && a.vent_check === "recent",
      urgency: "schedule",
      likelyCauses: ["Failed ignitor", "Bad gas valve solenoid", "Clogged burner"],
      proRecommendation: "Gas dryer heating issues usually need a technician for safety",
    },
  ],
  
  defaultOutcome: {
    urgency: "schedule",
    likelyCauses: ["Vent blockage", "Heating component failure", "Thermostat issue"],
    proRecommendation: "Schedule appliance repair — check vent first as a DIY step",
  },
  
  packetTemplate: {
    suggestedQuestions: [
      "What's preventing the dryer from heating?",
      "Is my dryer vent a fire hazard?",
      "Is repair cost-effective for my dryer's age?",
    ],
    docsToCollect: ["Invoice", "Model/serial number"],
    photoChecklist: [
      "Photo of dryer model plate",
      "Photo of dryer vent connection",
      "Photo of exterior vent outlet",
    ],
  },
};

const garbageDisposalJammed: TriageFlow = {
  id: "garbage-disposal-jammed",
  category: "appliances",
  systemTypeMatch: "Garbage Disposal",
  symptom: "Garbage disposal jammed or not working",
  shortDescription: "Disposal hums but won't spin, or won't turn on",
  icon: "🔧",
  
  immediateWarnings: [
    "NEVER put your hand into a garbage disposal, even when off",
    "Always turn off the switch and unplug (or breaker off) before attempting to fix",
    "If the disposal is humming but not spinning, turn it off — the motor can burn out",
  ],
  
  shutoffGuidance: {
    type: "electrical",
    instructions: [
      "Turn off the wall switch for the disposal",
      "Unplug it from under the sink, or turn off the breaker",
      "Verify it's off by flipping the switch",
    ],
    whenRequired: "Before any attempt to unjam or inspect the disposal",
  },
  
  questions: [
    {
      id: "behavior",
      text: "What happens when you flip the switch?",
      options: [
        { value: "hums", label: "It hums but doesn't spin", nextQuestionId: "reset_tried" },
        { value: "nothing", label: "Complete silence", nextQuestionId: "reset_tried" },
        { value: "spins_but", label: "Spins but doesn't grind well" },
      ],
    },
    {
      id: "reset_tried",
      text: "Have you tried the reset button on the bottom of the unit?",
      options: [
        { value: "yes", label: "Yes, pressed it" },
        { value: "no", label: "No / didn't know about it" },
        { value: "wont_stay", label: "It pops back out" },
      ],
    },
  ],
  
  outcomes: [
    {
      condition: (a) => a.behavior === "hums",
      urgency: "monitor",
      likelyCauses: ["Foreign object jamming blades", "Food buildup"],
      diySteps: [
        "Turn off the disposal and unplug it",
        "Use an Allen wrench (1/4 inch) in the hex hole on the bottom of the unit",
        "Turn back and forth to free the jam",
        "Use tongs (never hands) to remove debris from the top",
        "Press the reset button, plug in, and test",
      ],
    },
    {
      condition: (a) => a.behavior === "nothing" && a.reset_tried === "no",
      urgency: "monitor",
      likelyCauses: ["Tripped internal reset", "Tripped breaker"],
      diySteps: [
        "Find the red reset button on the bottom of the disposal unit",
        "Press it firmly — you should feel it click",
        "If that doesn't work, check the circuit breaker",
        "If still nothing, the disposal may need replacement",
      ],
    },
    {
      condition: (a) => a.behavior === "nothing" && a.reset_tried === "wont_stay",
      urgency: "schedule",
      likelyCauses: ["Internal motor failure", "Electrical issue", "Overheated motor"],
      proRecommendation: "If reset won't hold and breaker is fine, the disposal likely needs replacement ($150-400 installed)",
    },
    {
      condition: (a) => a.behavior === "spins_but",
      urgency: "monitor",
      likelyCauses: ["Dull blades", "Insufficient water flow", "Worn flyweight"],
      diySteps: [
        "Run cold water before, during, and after using the disposal",
        "Grind ice cubes to clean and sharpen blades",
        "If blades are very worn, consider replacement",
      ],
    },
  ],
  
  defaultOutcome: {
    urgency: "monitor",
    likelyCauses: ["Jam or reset issue", "Normal wear"],
    proRecommendation: "Most disposal issues are DIY-fixable. If motor has failed, replacement is straightforward.",
  },
  
  packetTemplate: {
    suggestedQuestions: [
      "Is my disposal worth repairing or should I replace it?",
      "What size/power disposal do I need?",
      "Can you install a quieter model?",
    ],
    docsToCollect: ["Invoice"],
    photoChecklist: [
      "Photo of disposal unit under sink",
      "Photo of model label (usually on bottom or side)",
    ],
  },
};

// =====================================================
// EXPORT ALL FLOWS
// =====================================================

export const TRIAGE_FLOWS: TriageFlow[] = [
  // Plumbing (5)
  leakUnderSink,
  toiletRunning,
  noHotWater,
  lowWaterPressure,
  sewerSmell,
  // HVAC (5)
  noCooling,
  noHeating,
  weakAirflow,
  thermostatIssue,
  hvacNoise,
  // Electrical (5)
  trippingBreaker,
  deadOutlet,
  flickeringLights,
  buzzingPanel,
  gfciWontReset,
  // Appliances (5)
  fridgeNotCooling,
  dishwasherNotDraining,
  washerLeaking,
  dryerNotHeating,
  garbageDisposalJammed,
];

/**
 * Get flows filtered by category
 */
export function getFlowsByCategory(category: "plumbing" | "hvac" | "electrical" | "appliances"): TriageFlow[] {
  return TRIAGE_FLOWS.filter(flow => flow.category === category);
}

/**
 * Get a specific flow by ID
 */
export function getFlowById(id: string): TriageFlow | undefined {
  return TRIAGE_FLOWS.find(flow => flow.id === id);
}

/**
 * Evaluate triage answers and return the appropriate outcome
 */
export function evaluateTriageOutcome(
  flow: TriageFlow,
  answers: Record<string, string>
): {
  urgency: "monitor" | "schedule" | "urgent";
  likelyCauses: string[];
  diySteps?: string[];
  proRecommendation?: string;
} {
  // Check each outcome condition
  for (const outcome of flow.outcomes) {
    if (outcome.condition(answers)) {
      return {
        urgency: outcome.urgency,
        likelyCauses: outcome.likelyCauses,
        diySteps: outcome.diySteps,
        proRecommendation: outcome.proRecommendation,
      };
    }
  }
  
  // Return default outcome if no conditions match
  return flow.defaultOutcome;
}
