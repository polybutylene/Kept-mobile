import { ReplacementTree } from "./types";

/**
 * HVAC Replacement Decision Tree
 *
 * Covers: central AC, furnace, heat pump, mini-split
 * Walks through: system type → priorities → fuel/config → budget → recommendation
 */
export const hvacTree: ReplacementTree = {
  systemType: "hvac",
  displayName: "HVAC System",
  steps: [
    {
      id: "system_scope",
      question: "What are you looking to replace?",
      contextNote: "Helps me focus the recommendation on the right equipment.",
      options: [
        {
          label: "AC only",
          description: "Cooling is the problem — heating works fine.",
          value: "ac_only",
          nextStepId: "priorities",
        },
        {
          label: "Furnace / heating only",
          description: "Heating needs replacing — AC is fine or not needed.",
          value: "heat_only",
          nextStepId: "priorities",
        },
        {
          label: "Full system (heating + cooling)",
          description: "Time to replace the whole setup — both units are aging.",
          value: "full_system",
          nextStepId: "priorities",
        },
        {
          label: "Not sure — help me figure it out",
          description: "Let's look at what makes sense based on your system's condition.",
          value: "unsure",
          nextStepId: "priorities",
        },
      ],
    },
    {
      id: "priorities",
      question: "What's most important to you?",
      contextNote: "This shapes whether we lean toward value, efficiency, or comfort.",
      options: [
        {
          label: "Lowest upfront cost",
          description: "Get reliable cooling/heating without breaking the bank.",
          value: "low_cost",
          nextStepId: "home_size",
        },
        {
          label: "Lowest energy bills",
          description: "Higher efficiency = lower monthly bills over 15–20 years.",
          value: "efficiency",
          nextStepId: "home_size",
        },
        {
          label: "Best comfort & quietness",
          description: "Even temps room-to-room, variable speed, whisper-quiet operation.",
          value: "comfort",
          nextStepId: "home_size",
        },
        {
          label: "Most eco-friendly",
          description: "Heat pump tech — no combustion, runs on electricity.",
          value: "eco",
          nextStepId: "home_size",
        },
      ],
    },
    {
      id: "home_size",
      question: "How big is the space you're conditioning?",
      contextNote: "This determines the right equipment size. Oversized units short-cycle and waste energy.",
      autoFillFromProfile: "squareFootage",
      options: [
        {
          label: "Under 1,500 sq ft",
          description: "Small home, condo, or apartment — typically 1.5–2 ton system.",
          value: "small",
          nextStepId: "budget_hvac",
        },
        {
          label: "1,500 – 2,500 sq ft",
          description: "Average home — typically 2.5–3.5 ton system.",
          value: "medium",
          nextStepId: "budget_hvac",
        },
        {
          label: "2,500 – 4,000 sq ft",
          description: "Larger home — typically 3.5–5 ton system.",
          value: "large",
          nextStepId: "budget_hvac",
        },
        {
          label: "Over 4,000 sq ft",
          description: "May need multiple zones or a larger capacity system.",
          value: "xlarge",
          nextStepId: "budget_hvac",
        },
      ],
    },
    {
      id: "budget_hvac",
      question: "What's your budget range for the installed system?",
      contextNote: "Full HVAC costs vary widely — these include equipment, labor, and permits.",
      options: [
        {
          label: "Under $5,000",
          description: "Basic replacement — entry-level efficiency.",
          value: "under_5k",
          nextStepId: "recommend",
        },
        {
          label: "$5,000 – $10,000",
          description: "Mid-range — good efficiency with solid warranties.",
          value: "5k_10k",
          nextStepId: "recommend",
        },
        {
          label: "$10,000 – $15,000",
          description: "Premium — high-efficiency, variable speed, smart features.",
          value: "10k_15k",
          nextStepId: "recommend",
        },
        {
          label: "Budget is flexible",
          description: "Show me the best option for my situation.",
          value: "flexible",
          nextStepId: "recommend",
        },
      ],
    },
  ],
  recommendations: [
    // AC ONLY — LOW COST
    {
      conditions: { system_scope: ["ac_only", "unsure"], priorities: "low_cost", budget_hvac: ["under_5k", "5k_10k"] },
      recommendation: {
        productType: "14 SEER2 Central Air Conditioner",
        estimatedCost: { low: 3500, high: 5500 },
        estimatedLifespan: { low: 15, high: 20 },
        rationaleParts: [
          "A 14 SEER2 unit is today's entry-level efficiency — solid and reliable",
          "Meets current federal minimum standards",
          "Quick install since it's a straightforward like-for-like replacement",
        ],
      },
      alternative: {
        productType: "16 SEER2 Central AC",
        estimatedCost: { low: 4500, high: 7000 },
        tradeoffNote: "About $500–$1,000 more upfront but 10–15% lower cooling bills.",
      },
    },
    // AC ONLY — EFFICIENCY/ECO
    {
      conditions: { system_scope: ["ac_only", "unsure"], priorities: ["efficiency", "eco"], budget_hvac: ["5k_10k", "10k_15k", "flexible"] },
      recommendation: {
        productType: "18–20 SEER2 Variable-Speed Central AC or Heat Pump",
        estimatedCost: { low: 6000, high: 12000 },
        estimatedLifespan: { low: 15, high: 20 },
        annualSavings: 400,
        rationaleParts: [
          "A variable-speed system adjusts output to match the load — runs more, but gentler and far more efficiently",
          "Dehumidifies better in humid climates, which matters in Florida",
          "Heat pump version gives you efficient heating too at minimal extra cost",
        ],
      },
      alternative: {
        productType: "16 SEER2 Single-Stage AC",
        estimatedCost: { low: 4500, high: 7000 },
        tradeoffNote: "Simpler system, lower upfront — still a meaningful upgrade from older units.",
      },
    },
    // AC ONLY — COMFORT
    {
      conditions: { system_scope: ["ac_only", "unsure"], priorities: "comfort" },
      recommendation: {
        productType: "20+ SEER2 Variable-Speed Inverter Heat Pump",
        specificProduct: "Carrier Infinity / Trane XV20i / Daikin Fit",
        estimatedCost: { low: 8000, high: 14000 },
        estimatedLifespan: { low: 15, high: 20 },
        annualSavings: 500,
        rationaleParts: [
          "Variable-speed inverter technology is the gold standard for comfort",
          "Maintains temperature within 0.5°F — no hot/cold swings",
          "Whisper-quiet operation, especially compared to single-stage units",
        ],
      },
      alternative: {
        productType: "Two-Stage 17 SEER2 AC",
        estimatedCost: { low: 5500, high: 8500 },
        tradeoffNote: "Two-stage is a big comfort upgrade over single-stage at a lower price point.",
      },
    },
    // FULL SYSTEM — LOW COST
    {
      conditions: { system_scope: "full_system", priorities: "low_cost" },
      recommendation: {
        productType: "14 SEER2 AC + 80% AFUE Gas Furnace Package",
        estimatedCost: { low: 6000, high: 9000 },
        estimatedLifespan: { low: 15, high: 20 },
        rationaleParts: [
          "A matched AC + furnace package is the most cost-effective full system replacement",
          "80% AFUE furnace is entry-level but reliable — fine for mild heating climates",
          "Both units matched from the same manufacturer ensures proper sizing and warranty",
        ],
      },
      alternative: {
        productType: "Heat Pump System (single unit does both heating & cooling)",
        estimatedCost: { low: 7000, high: 11000 },
        tradeoffNote: "One unit handles both heating and cooling — simpler and more efficient in mild climates.",
      },
    },
    // FULL SYSTEM — EFFICIENCY/ECO
    {
      conditions: { system_scope: "full_system", priorities: ["efficiency", "eco"] },
      recommendation: {
        productType: "Heat Pump System (16–18 SEER2, 9+ HSPF2)",
        estimatedCost: { low: 8000, high: 13000 },
        estimatedLifespan: { low: 15, high: 20 },
        annualSavings: 600,
        rationaleParts: [
          "A heat pump handles both heating and cooling with one unit — no gas needed",
          "3–4x more efficient than a furnace for heating in mild climates",
          "Qualifies for federal tax credits up to $2,000 under the Inflation Reduction Act",
        ],
      },
      alternative: {
        productType: "96% AFUE Gas Furnace + 16 SEER2 AC",
        estimatedCost: { low: 7500, high: 11000 },
        tradeoffNote: "If you prefer staying on gas, a high-efficiency furnace + mid-range AC is the best gas combo.",
      },
    },
    // HEAT ONLY — LOW COST
    {
      conditions: { system_scope: "heat_only", priorities: "low_cost" },
      recommendation: {
        productType: "80% AFUE Gas Furnace",
        estimatedCost: { low: 2500, high: 4500 },
        estimatedLifespan: { low: 15, high: 20 },
        rationaleParts: [
          "An 80% AFUE furnace is the entry-level gas option — reliable and affordable",
          "Uses non-condensing venting, so existing flue typically works as-is",
          "Good choice if heating costs aren't a huge part of your utility bills",
        ],
      },
      alternative: {
        productType: "96% AFUE Condensing Gas Furnace",
        estimatedCost: { low: 3500, high: 5500 },
        tradeoffNote: "Squeezes more heat from the same gas — worth it if winters are cold.",
      },
    },
    // HEAT ONLY — EFFICIENCY
    {
      conditions: { system_scope: "heat_only", priorities: ["efficiency", "eco", "comfort"] },
      recommendation: {
        productType: "Heat Pump (dual fuel optional)",
        estimatedCost: { low: 5000, high: 9000 },
        estimatedLifespan: { low: 15, high: 20 },
        annualSavings: 400,
        rationaleParts: [
          "A heat pump is the most efficient heating option in mild-to-moderate climates",
          "Also gives you cooling if you don't already have AC",
          "Dual-fuel option adds a gas furnace backup for extreme cold snaps",
        ],
      },
      alternative: {
        productType: "96% AFUE Condensing Gas Furnace",
        estimatedCost: { low: 3500, high: 5500 },
        tradeoffNote: "If you prefer gas, a condensing furnace extracts maximum efficiency.",
      },
    },
  ],
  actionPlan: {
    steps: [
      {
        stepId: "load_calc",
        label: "Request a Manual J load calculation with your quotes",
        actionType: "get_quotes",
      },
      {
        stepId: "quotes",
        label: "Get 2–3 quotes from licensed HVAC contractors",
        actionType: "get_quotes",
      },
      {
        stepId: "rebates",
        label: "Check for utility rebates and federal tax credits",
        actionType: "check_rebates",
      },
      {
        stepId: "schedule",
        label: "Schedule the installation (spring/fall is usually cheapest)",
        actionType: "schedule",
      },
      {
        stepId: "monitor",
        label: "Set up Kept monitoring for the new system",
        actionType: "setup_monitoring",
      },
    ],
  },
};
