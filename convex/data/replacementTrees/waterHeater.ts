import { ReplacementTree } from "./types";

/**
 * Water Heater Replacement Decision Tree
 *
 * Walks through: priorities → utility setup → budget → recommendation
 * Covers: tank (gas/electric), tankless, heat pump water heater
 */
export const waterHeaterTree: ReplacementTree = {
  systemType: "water_heater",
  displayName: "Water Heater",
  steps: [
    {
      id: "priorities",
      question: "What matters most to you for your new water heater?",
      contextNote: "This helps me narrow down the right type for your situation.",
      options: [
        {
          label: "Lowest upfront cost",
          description: "Replace with a similar tank unit — quickest and cheapest to install.",
          value: "low_cost",
          nextStepId: "utility",
        },
        {
          label: "Lowest long-term cost",
          description: "Higher upfront, but saves $200–$400/year on energy bills.",
          value: "efficiency",
          nextStepId: "utility",
        },
        {
          label: "Best performance",
          description: "Never run out of hot water, even with back-to-back showers.",
          value: "performance",
          nextStepId: "utility",
        },
        {
          label: "Most eco-friendly",
          description: "Smallest carbon footprint — heat pump tech is 3–4x more efficient.",
          value: "eco",
          nextStepId: "utility",
        },
      ],
    },
    {
      id: "utility",
      question: "What's your utility setup?",
      contextNote: "This determines which fuel types are available for your replacement.",
      autoFillFromProfile: "utilityType",
      options: [
        {
          label: "Electric only",
          description: "No gas line to the house — all-electric.",
          value: "electric",
          nextStepId: "budget",
        },
        {
          label: "Gas available",
          description: "Natural gas or propane line running to the current unit.",
          value: "gas",
          nextStepId: "budget",
        },
        {
          label: "Not sure",
          description: "Check for a copper or black pipe running to the unit — that's gas.",
          value: "unknown",
          nextStepId: "budget",
        },
      ],
    },
    {
      id: "budget",
      question: "What's your budget comfort zone for installed cost?",
      contextNote: "These ranges include the unit, labor, and basic permit fees.",
      options: [
        {
          label: "Under $1,500",
          description: "Standard tank replacement — most affordable option.",
          value: "under_1500",
          nextStepId: "recommend",
        },
        {
          label: "$1,500 – $3,000",
          description: "Mid-range — opens up better efficiency and tankless options.",
          value: "1500_3000",
          nextStepId: "recommend",
        },
        {
          label: "$3,000 – $5,000",
          description: "Premium — heat pump or high-end tankless territory.",
          value: "3000_5000",
          nextStepId: "recommend",
        },
        {
          label: "Budget is flexible",
          description: "Just show me the best option for my situation.",
          value: "flexible",
          nextStepId: "recommend",
        },
      ],
    },
  ],
  recommendations: [
    // === LOW COST + ELECTRIC ===
    {
      conditions: { priorities: "low_cost", utility: ["electric", "unknown"] },
      recommendation: {
        productType: "Standard Electric Tank Water Heater (50-gal)",
        estimatedCost: { low: 800, high: 1400 },
        estimatedLifespan: { low: 8, high: 12 },
        rationaleParts: [
          "Given your focus on keeping costs down",
          "a standard electric tank is the simplest, fastest replacement",
          "Same footprint as your current unit, so no extra plumbing work",
        ],
      },
      alternative: {
        productType: "Heat Pump Water Heater",
        estimatedCost: { low: 2200, high: 3500 },
        tradeoffNote: "Costs more upfront but cuts water heating bills by 60–70%. Pays for itself in 3–4 years.",
      },
    },
    // === LOW COST + GAS ===
    {
      conditions: { priorities: "low_cost", utility: "gas" },
      recommendation: {
        productType: "Standard Gas Tank Water Heater (50-gal)",
        estimatedCost: { low: 900, high: 1500 },
        estimatedLifespan: { low: 8, high: 12 },
        rationaleParts: [
          "A standard gas tank is the most straightforward replacement",
          "Same hookups, same footprint — minimal install complexity",
          "Gas heats faster than electric, so recovery time is better",
        ],
      },
      alternative: {
        productType: "Gas Tankless Water Heater",
        estimatedCost: { low: 2500, high: 4000 },
        tradeoffNote: "Higher upfront but lasts 20+ years and never runs out of hot water.",
      },
    },
    // === EFFICIENCY + ELECTRIC ===
    {
      conditions: { priorities: "efficiency", utility: ["electric", "unknown"] },
      recommendation: {
        productType: "Heat Pump Water Heater (50-gal)",
        specificProduct: "Rheem ProTerra or A.O. Smith Voltex",
        estimatedCost: { low: 2200, high: 3500 },
        estimatedLifespan: { low: 13, high: 15 },
        annualSavings: 330,
        rationaleParts: [
          "For long-term savings on electric, a heat pump water heater is the clear winner",
          "Uses 60–70% less energy than a standard electric tank",
          "May qualify for federal tax credits and utility rebates",
        ],
      },
      alternative: {
        productType: "Standard Electric Tank (high-efficiency)",
        estimatedCost: { low: 900, high: 1400 },
        tradeoffNote: "Cheaper upfront if the heat pump budget feels too steep right now.",
      },
    },
    // === EFFICIENCY + GAS ===
    {
      conditions: { priorities: "efficiency", utility: "gas" },
      recommendation: {
        productType: "Gas Tankless Water Heater",
        specificProduct: "Rinnai RU199iN or Navien NPE-240A",
        estimatedCost: { low: 2500, high: 4000 },
        estimatedLifespan: { low: 18, high: 22 },
        annualSavings: 200,
        rationaleParts: [
          "For gas efficiency, tankless is the way to go",
          "Heats on demand — no standby losses from keeping a tank hot 24/7",
          "Lasts nearly twice as long as a tank unit",
        ],
      },
      alternative: {
        productType: "High-Efficiency Gas Tank",
        estimatedCost: { low: 1000, high: 1600 },
        tradeoffNote: "Simpler install, lower upfront — still a solid gas option.",
      },
    },
    // === PERFORMANCE + ELECTRIC ===
    {
      conditions: { priorities: "performance", utility: ["electric", "unknown"] },
      recommendation: {
        productType: "Heat Pump Water Heater (80-gal) or Dual-Element Tank",
        estimatedCost: { low: 2500, high: 4000 },
        estimatedLifespan: { low: 12, high: 15 },
        annualSavings: 280,
        rationaleParts: [
          "For performance on electric, a large heat pump unit handles high demand beautifully",
          "80-gallon capacity means back-to-back showers, dishwasher, and laundry without running cold",
          "Heat pump mode for daily use, electric boost for peak demand",
        ],
      },
      alternative: {
        productType: "Standard 80-gal Electric Tank",
        estimatedCost: { low: 1100, high: 1800 },
        tradeoffNote: "Big capacity without the heat pump premium, but higher energy bills.",
      },
    },
    // === PERFORMANCE + GAS ===
    {
      conditions: { priorities: "performance", utility: "gas" },
      recommendation: {
        productType: "Gas Tankless Water Heater (199k BTU)",
        specificProduct: "Rinnai RU199iN or Noritz EZ111",
        estimatedCost: { low: 3000, high: 4500 },
        estimatedLifespan: { low: 18, high: 22 },
        rationaleParts: [
          "For never running out of hot water on gas, tankless is the answer",
          "Heats water endlessly on demand — fill a soaking tub and run the dishwasher simultaneously",
          "At 199k BTU, this handles even the most demanding households",
        ],
      },
      alternative: {
        productType: "75-gal Power Vent Gas Tank",
        estimatedCost: { low: 1800, high: 2800 },
        tradeoffNote: "Big tank = big capacity. Simpler install if tankless feels like overkill.",
      },
    },
    // === ECO + ELECTRIC ===
    {
      conditions: { priorities: "eco", utility: ["electric", "unknown"] },
      recommendation: {
        productType: "Heat Pump Water Heater (50-gal)",
        specificProduct: "Rheem ProTerra Hybrid",
        estimatedCost: { low: 2200, high: 3500 },
        estimatedLifespan: { low: 13, high: 15 },
        annualSavings: 330,
        rationaleParts: [
          "A heat pump water heater is the most environmentally friendly option available",
          "3–4x more efficient than standard electric — uses ambient air heat instead of raw electricity",
          "Federal tax credit of up to $2,000 may apply under the Inflation Reduction Act",
        ],
      },
      alternative: {
        productType: "Solar Water Heater with Electric Backup",
        estimatedCost: { low: 4000, high: 7000 },
        tradeoffNote: "Maximum eco impact but significantly higher install cost and complexity.",
      },
    },
    // === ECO + GAS ===
    {
      conditions: { priorities: "eco", utility: "gas" },
      recommendation: {
        productType: "Heat Pump Water Heater (switching from gas to electric)",
        specificProduct: "Rheem ProTerra or A.O. Smith Voltex",
        estimatedCost: { low: 3000, high: 4500 },
        estimatedLifespan: { low: 13, high: 15 },
        annualSavings: 250,
        rationaleParts: [
          "The greenest move is actually switching from gas to a heat pump electric unit",
          "Eliminates combustion, reduces your home's carbon footprint significantly",
          "May require running a new 240V circuit — factor that into install cost",
        ],
      },
      alternative: {
        productType: "High-Efficiency Condensing Gas Tankless",
        estimatedCost: { low: 2800, high: 4200 },
        tradeoffNote: "Stays on gas but extracts maximum efficiency — 96%+ thermal efficiency.",
      },
    },
  ],
  actionPlan: {
    steps: [
      {
        stepId: "quotes",
        label: "Get 2–3 quotes from licensed plumbers",
        actionType: "get_quotes",
      },
      {
        stepId: "rebates",
        label: "Check for utility rebates and federal tax credits",
        actionType: "check_rebates",
      },
      {
        stepId: "schedule",
        label: "Schedule the installation",
        actionType: "schedule",
      },
      {
        stepId: "monitor",
        label: "Set up Kept monitoring for the new unit",
        actionType: "setup_monitoring",
      },
    ],
  },
};
