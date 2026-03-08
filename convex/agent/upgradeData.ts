/**
 * Upgrade Path Knowledge Base — Domain data for all system categories.
 *
 * Pricing: Southeast US baseline, 2025-2026 installed costs.
 * Lifespans: Based on Weibull-distribution lifecycle data.
 * Operating costs: Monthly estimates for typical SE US household.
 *
 * This data drives the generate_upgrade_comparison tool and the
 * Upgrade Planning Journey in the iOS client.
 */

// ════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════

export interface UpgradeTier {
  tier: "same_for_same" | "moderate_upgrade" | "technology_change";
  label: string;
  description: string;
  installedCostLow: number;
  installedCostHigh: number;
  /** Monthly operating cost estimate */
  monthlyOperatingCost: number;
  estimatedLifespanLow: number;
  estimatedLifespanHigh: number;
  /** Weibull parameters for this tier (shifted curve for upgraded systems) */
  weibullShape: number;
  weibullScale: number;
  rebates: Rebate[];
  compatibilityNotes: string[];
  whileYoureAtIt: string[];
  homeValueImpact: "none" | "minor" | "moderate" | "significant";
  regionalNotes?: string;
}

export interface Rebate {
  source: string;
  amount: number;
  requirements: string;
}

export interface UpgradePathEntry {
  /** Matches systemTypes.key in the database */
  systemTypeKeys: string[];
  category: string;
  currentSystemLabel: string;
  currentMonthlyOperatingCost: number;
  /** Gotcha factors that force replacement regardless of condition */
  gotchaFactors: GotchaFactor[];
  tiers: UpgradeTier[];
}

export interface GotchaFactor {
  trigger: string;
  description: string;
  severity: "advisory" | "urgent" | "mandatory";
}

// ════════════════════════════════════════════════════════════════════
// WATER HEATERS
// ════════════════════════════════════════════════════════════════════

export const WATER_HEATER_GAS_TANK: UpgradePathEntry = {
  systemTypeKeys: ["water_heater_tank"],
  category: "plumbing",
  currentSystemLabel: "Standard Gas Tank (40-50 gal, 0.58-0.62 EF)",
  currentMonthlyOperatingCost: 45,
  gotchaFactors: [
    {
      trigger: "age_over_10",
      description: "Tank water heaters over 10 years have increasing risk of catastrophic tank failure and water damage.",
      severity: "advisory",
    },
    {
      trigger: "rusty_water",
      description: "Rusty hot water indicates anode rod failure and active tank corrosion. Replacement is imminent.",
      severity: "urgent",
    },
  ],
  tiers: [
    {
      tier: "same_for_same",
      label: "Standard Gas Tank",
      description:
        "Replace with an equivalent 40-50 gallon gas tank water heater (0.62-0.65 EF). " +
        "Lowest cost, no efficiency gain, restarts the clock at baseline.",
      installedCostLow: 1400,
      installedCostHigh: 1800,
      monthlyOperatingCost: 42,
      estimatedLifespanLow: 10,
      estimatedLifespanHigh: 13,
      weibullShape: 3.5,
      weibullScale: 138,
      rebates: [],
      compatibilityNotes: [
        "Direct swap — same gas line, venting, and connections",
        "Verify T&P valve discharge pipe meets current code",
      ],
      whileYoureAtIt: [
        "Replace supply lines with braided stainless ($15-25)",
        "Add thermal expansion tank if required by code ($150-250)",
        "Install earthquake straps if in seismic zone",
        "Flush and inspect gas supply line",
      ],
      homeValueImpact: "none",
    },
    {
      tier: "moderate_upgrade",
      label: "High-Efficiency Gas Tank or Hybrid Heat Pump",
      description:
        "Step up to a high-efficiency gas tank (0.67+ EF) or hybrid electric heat pump water heater " +
        "(3.5+ UEF). Measurable energy savings, potentially longer lifespan.",
      installedCostLow: 2200,
      installedCostHigh: 3000,
      monthlyOperatingCost: 25,
      estimatedLifespanLow: 12,
      estimatedLifespanHigh: 15,
      weibullShape: 3.8,
      weibullScale: 162,
      rebates: [
        {
          source: "Utility rebate (varies by provider)",
          amount: 300,
          requirements: "Must meet ENERGY STAR specifications",
        },
        {
          source: "Federal 25C Tax Credit (hybrid heat pump only)",
          amount: 2000,
          requirements: "Heat pump water heater meeting CEE Tier 1+ efficiency. Must be primary residence.",
        },
      ],
      compatibilityNotes: [
        "High-eff gas tank: direct swap, same connections",
        "Hybrid heat pump: needs 240V outlet nearby, adequate clearance for air intake (700+ sq ft open space)",
        "Hybrid models produce cool air — can benefit a garage but may increase heating costs in conditioned space",
      ],
      whileYoureAtIt: [
        "Replace supply lines with braided stainless ($15-25)",
        "Add thermal expansion tank ($150-250)",
        "Install drip pan and drain if not present ($50-100)",
        "Upgrade insulation on first 6 feet of hot water pipe ($20-40 DIY)",
      ],
      homeValueImpact: "minor",
    },
    {
      tier: "technology_change",
      label: "Tankless Gas Water Heater",
      description:
        "Go tankless. Continuous hot water, no standby heat loss, dramatically lower " +
        "operating costs. Takes up zero floor space. Nearly double the lifespan of a tank unit.",
      installedCostLow: 3500,
      installedCostHigh: 5000,
      monthlyOperatingCost: 18,
      estimatedLifespanLow: 18,
      estimatedLifespanHigh: 22,
      weibullShape: 4.2,
      weibullScale: 240,
      rebates: [
        {
          source: "Federal 25C Tax Credit",
          amount: 2000,
          requirements: "Must meet 0.95+ UEF. Primary residence only.",
        },
        {
          source: "Utility rebate (varies)",
          amount: 200,
          requirements: "ENERGY STAR certified tankless",
        },
      ],
      compatibilityNotes: [
        "May require gas line upgrade to 3/4\" to support higher BTU demand",
        "Requires new Category III stainless steel venting (cannot reuse standard B-vent)",
        "Needs dedicated 120V outlet for electronics",
        "Annual descaling required in hard water areas (15-min DIY or $150 pro service)",
        "May experience brief cold-water sandwich during sequential draws",
      ],
      whileYoureAtIt: [
        "Install recirculation pump for instant hot water at distant fixtures ($200-400)",
        "Add whole-house water filtration to extend unit life in hard water areas ($300-600)",
        "Upgrade gas line while gas work is already open ($200-500)",
        "Install point-of-use electric heater at kitchen sink if far from unit ($150-250)",
      ],
      homeValueImpact: "moderate",
      regionalNotes:
        "Tankless performance is affected by groundwater temperature. In SE US (groundwater 65-75°F), " +
        "tankless units perform well year-round. In northern climates (40-50°F groundwater), a larger " +
        "unit or multiple units may be needed.",
    },
  ],
};

export const WATER_HEATER_ELECTRIC_TANK: UpgradePathEntry = {
  systemTypeKeys: ["water_heater_tank"],
  category: "plumbing",
  currentSystemLabel: "Standard Electric Tank (40-50 gal)",
  currentMonthlyOperatingCost: 55,
  gotchaFactors: [],
  tiers: [
    {
      tier: "same_for_same",
      label: "Standard Electric Tank",
      description: "Replace with equivalent electric tank water heater. Simple swap, same connections.",
      installedCostLow: 1200,
      installedCostHigh: 1600,
      monthlyOperatingCost: 52,
      estimatedLifespanLow: 10,
      estimatedLifespanHigh: 13,
      weibullShape: 3.5,
      weibullScale: 138,
      rebates: [],
      compatibilityNotes: ["Direct swap — same electrical, same plumbing"],
      whileYoureAtIt: [
        "Replace supply lines with braided stainless ($15-25)",
        "Add thermal expansion tank if required ($150-250)",
      ],
      homeValueImpact: "none",
    },
    {
      tier: "moderate_upgrade",
      label: "High-Efficiency Electric Tank",
      description: "Higher-insulation electric tank with improved elements. Modest savings.",
      installedCostLow: 1600,
      installedCostHigh: 2200,
      monthlyOperatingCost: 42,
      estimatedLifespanLow: 10,
      estimatedLifespanHigh: 14,
      weibullShape: 3.6,
      weibullScale: 144,
      rebates: [],
      compatibilityNotes: ["Same connections as standard electric"],
      whileYoureAtIt: [
        "Add timer to heat water during off-peak electricity hours ($30-50 DIY)",
        "Insulate hot water pipes ($20-40 DIY)",
      ],
      homeValueImpact: "none",
    },
    {
      tier: "technology_change",
      label: "Heat Pump Water Heater",
      description:
        "Dramatically lower operating cost — uses 60-70% less electricity than standard electric. " +
        "Eligible for up to $2,000 federal tax credit. The single biggest energy upgrade for " +
        "electric water heater households.",
      installedCostLow: 2800,
      installedCostHigh: 4000,
      monthlyOperatingCost: 18,
      estimatedLifespanLow: 13,
      estimatedLifespanHigh: 16,
      weibullShape: 4.0,
      weibullScale: 174,
      rebates: [
        {
          source: "Federal 25C Tax Credit",
          amount: 2000,
          requirements: "Heat pump water heater, CEE Tier 1+. Primary residence.",
        },
        {
          source: "Utility rebate",
          amount: 400,
          requirements: "ENERGY STAR certified heat pump water heater",
        },
      ],
      compatibilityNotes: [
        "Needs 240V outlet (same as electric tank — usually compatible)",
        "Requires 700+ sq ft of open space around unit for air intake",
        "Produces cool, dehumidified air — great in garage/utility room, not ideal in small closet",
        "Slower recovery time than electric resistance — may need larger tank (50-80 gal)",
      ],
      whileYoureAtIt: [
        "Install condensate drain (heat pump produces moisture) ($50-100)",
        "Add whole-house water filtration ($300-600)",
        "Insulate first 6 feet of hot water pipe ($20-40 DIY)",
      ],
      homeValueImpact: "minor",
      regionalNotes:
        "Heat pump water heaters are ideal in SE US — warm ambient temperatures (above 40°F) maximize " +
        "efficiency. In garages and utility rooms, the cooling effect is a bonus in summer.",
    },
  ],
};

// ════════════════════════════════════════════════════════════════════
// HVAC SYSTEMS
// ════════════════════════════════════════════════════════════════════

export const HVAC_AC_FURNACE: UpgradePathEntry = {
  systemTypeKeys: ["hvac_ac", "hvac_furnace"],
  category: "hvac",
  currentSystemLabel: "Central AC (14 SEER) + Gas Furnace",
  currentMonthlyOperatingCost: 185,
  gotchaFactors: [
    {
      trigger: "r22_refrigerant",
      description:
        "R-22 refrigerant is fully phased out. Remaining stock costs $100-200/lb. " +
        "Any refrigerant leak makes repair economically unviable — forced upgrade.",
      severity: "mandatory",
    },
    {
      trigger: "compressor_failure_over_10yr",
      description:
        "Compressor replacement on a system over 10 years old typically exceeds 50% of " +
        "replacement cost. The 50% rule says replace, not repair.",
      severity: "urgent",
    },
  ],
  tiers: [
    {
      tier: "same_for_same",
      label: "Standard AC (15-16 SEER2) + Gas Furnace",
      description:
        "Replace with a new standard-efficiency system. Minimum code-compliant unit. " +
        "Modest efficiency improvement over 14 SEER due to new minimum standards (15 SEER2).",
      installedCostLow: 6500,
      installedCostHigh: 9000,
      monthlyOperatingCost: 165,
      estimatedLifespanLow: 14,
      estimatedLifespanHigh: 18,
      weibullShape: 3.2,
      weibullScale: 192,
      rebates: [],
      compatibilityNotes: [
        "Direct replacement if ductwork is in good condition",
        "New R-410A or R-454B refrigerant (if replacing R-22 system, line set may need replacement)",
        "Verify ductwork sizing — oversized or undersized ducts hurt efficiency",
      ],
      whileYoureAtIt: [
        "Seal and insulate ductwork ($300-800 — can save 20-30% on energy)",
        "Add UV light air purification to air handler ($200-400)",
        "Replace thermostat with smart thermostat ($150-250)",
        "Check and seal air handler drain pan and condensate line",
      ],
      homeValueImpact: "minor",
    },
    {
      tier: "moderate_upgrade",
      label: "High-Efficiency AC (18-20 SEER2) + Variable-Speed Furnace",
      description:
        "Two-stage or variable-speed system with improved humidity control, quieter operation, " +
        "and significantly lower utility bills. Better temperature consistency throughout the home.",
      installedCostLow: 9500,
      installedCostHigh: 14000,
      monthlyOperatingCost: 130,
      estimatedLifespanLow: 16,
      estimatedLifespanHigh: 20,
      weibullShape: 3.5,
      weibullScale: 216,
      rebates: [
        {
          source: "Utility rebate (varies)",
          amount: 500,
          requirements: "18+ SEER2, ENERGY STAR Most Efficient",
        },
      ],
      compatibilityNotes: [
        "Variable-speed indoor unit may require larger return air duct",
        "Requires matched indoor/outdoor components for rated efficiency",
        "Smart thermostat recommended to maximize variable-speed benefits",
      ],
      whileYoureAtIt: [
        "Seal and insulate ductwork ($300-800)",
        "Add whole-home dehumidifier if in humid climate ($1,200-2,000)",
        "Upgrade air filtration to MERV-13 ($200-400 for compatible filter rack)",
        "Add UV light air purification ($200-400)",
        "Replace thermostat with communicating smart thermostat ($200-300)",
      ],
      homeValueImpact: "moderate",
    },
    {
      tier: "technology_change",
      label: "Ducted Heat Pump (18+ SEER2)",
      description:
        "Eliminate gas dependency entirely. Heat pump provides both heating and cooling " +
        "from a single system. Dramatically lower operating costs in mild-to-moderate climates. " +
        "Ideal for Gulf Coast and SE US where heating demand is moderate.",
      installedCostLow: 12000,
      installedCostHigh: 18000,
      monthlyOperatingCost: 110,
      estimatedLifespanLow: 16,
      estimatedLifespanHigh: 22,
      weibullShape: 3.6,
      weibullScale: 228,
      rebates: [
        {
          source: "Federal 25C Tax Credit",
          amount: 2000,
          requirements: "Heat pump meeting CEE Tier 1+ (typically 16+ SEER2 / 9+ HSPF2). Primary residence.",
        },
        {
          source: "IRA High-Efficiency Electric Home Rebate",
          amount: 8000,
          requirements:
            "Income-qualified households (up to 150% area median income). " +
            "Amount varies by income level.",
        },
        {
          source: "Utility rebate",
          amount: 750,
          requirements: "ENERGY STAR certified heat pump",
        },
      ],
      compatibilityNotes: [
        "May require electrical panel upgrade (200A) if home currently has 100A service",
        "Existing ductwork typically compatible, but sizing should be verified",
        "In rare extreme-cold events (<25°F sustained), supplemental electric heat strips activate",
        "Gas line can be capped — no need to remove, but gas bill goes to $0",
        "Check if gas company charges a minimum monthly fee even with no usage",
      ],
      whileYoureAtIt: [
        "Upgrade to 200A panel if needed ($1,800-3,500) — also enables EV charger",
        "Add whole-home surge protector ($200-400)",
        "Seal and insulate ductwork ($300-800)",
        "Add attic insulation to R-38+ if below standard ($1,500-3,000)",
        "Install smart thermostat with heat pump optimization ($200-300)",
      ],
      homeValueImpact: "significant",
      regionalNotes:
        "Heat pumps are exceptional in the Gulf Coast region. With mild winters (rarely below 30°F), " +
        "heat pump efficiency stays high year-round. COP of 3-4 means you get 3-4x the heat energy " +
        "per dollar compared to gas. This is the #1 upgrade recommendation for SE US homeowners.",
    },
  ],
};

// ════════════════════════════════════════════════════════════════════
// ROOFING
// ════════════════════════════════════════════════════════════════════

export const ROOF_SHINGLE: UpgradePathEntry = {
  systemTypeKeys: ["roof_shingle", "roof_architectural"],
  category: "structural",
  currentSystemLabel: "Asphalt Shingle Roof (3-Tab or Architectural)",
  currentMonthlyOperatingCost: 0, // No direct operating cost
  gotchaFactors: [
    {
      trigger: "multiple_layers",
      description:
        "If roof already has 2+ layers, building code requires full tear-off before re-roofing. " +
        "Adds $1,000-3,000 to any replacement.",
      severity: "advisory",
    },
    {
      trigger: "hurricane_zone_3tab",
      description:
        "In hurricane zones, 3-tab shingles over 15 years may be uninsurable. " +
        "Many FL/Gulf Coast insurers now require architectural or higher-rated roofing.",
      severity: "mandatory",
    },
    {
      trigger: "active_leak",
      description: "Active roof leak causes compounding damage. Every week of delay increases repair scope.",
      severity: "urgent",
    },
  ],
  tiers: [
    {
      tier: "same_for_same",
      label: "Architectural Shingle (30-Year Rated)",
      description:
        "Standard replacement with architectural (dimensional) shingles. Most roofers default to " +
        "architectural now — true 3-tab is increasingly rare. Better wind rating than 3-tab.",
      installedCostLow: 8000,
      installedCostHigh: 14000,
      monthlyOperatingCost: 0,
      estimatedLifespanLow: 20,
      estimatedLifespanHigh: 30,
      weibullShape: 3.0,
      weibullScale: 300,
      rebates: [],
      compatibilityNotes: [
        "Standard installation on existing roof deck",
        "Verify decking is in good condition (add $2-4/sqft for replacement sections)",
        "Underlayment included in most quotes — verify it's synthetic, not felt paper",
      ],
      whileYoureAtIt: [
        "Add ridge vent if not present ($500-1,000 — dramatically improves attic ventilation)",
        "Upgrade attic insulation while roof is open ($1,500-3,000)",
        "Install ice & water shield in valleys and at eaves ($300-600)",
        "Replace pipe boots and flashing ($200-400)",
        "Add drip edge if missing ($200-400)",
      ],
      homeValueImpact: "moderate",
    },
    {
      tier: "moderate_upgrade",
      label: "Impact-Resistant Architectural (Class 4)",
      description:
        "Class 4 impact-rated shingles withstand hail and debris. Significant insurance discounts " +
        "in hurricane and hail zones — often 10-28% off wind/hail premium. Better wind rating " +
        "(130+ mph).",
      installedCostLow: 10000,
      installedCostHigh: 18000,
      monthlyOperatingCost: 0,
      estimatedLifespanLow: 25,
      estimatedLifespanHigh: 35,
      weibullShape: 3.2,
      weibullScale: 360,
      rebates: [
        {
          source: "Insurance premium discount (FL/Gulf Coast)",
          amount: 600,
          requirements:
            "Class 4 impact rating verified by permit inspection. Savings is annual, " +
            "compounding — $600/year = $6,000 over 10 years.",
        },
      ],
      compatibilityNotes: [
        "Same installation as standard architectural",
        "Slightly heavier — verify roof structure can handle (almost always yes)",
        "Must use manufacturer-specified nailing pattern for warranty and insurance credit",
      ],
      whileYoureAtIt: [
        "Add ridge vent ($500-1,000)",
        "Upgrade attic insulation ($1,500-3,000)",
        "Install hurricane straps/clips if not present ($1,000-2,500) — major insurance credit",
        "Replace all flashing and pipe boots ($200-400)",
      ],
      homeValueImpact: "significant",
      regionalNotes:
        "In Florida and Gulf Coast hurricane zones, impact-resistant shingles are one of the " +
        "highest-ROI upgrades due to insurance premium reductions. The insurance savings alone " +
        "can pay for the upgrade premium within 3-5 years.",
    },
    {
      tier: "technology_change",
      label: "Metal Standing Seam Roof",
      description:
        "50+ year lifespan, highest wind rating (160+ mph), energy-reflective surface reduces " +
        "cooling costs, and typically the highest insurance discount available. The last roof " +
        "you'll ever need.",
      installedCostLow: 18000,
      installedCostHigh: 30000,
      monthlyOperatingCost: -15, // Reduces cooling costs
      estimatedLifespanLow: 40,
      estimatedLifespanHigh: 60,
      weibullShape: 4.5,
      weibullScale: 600,
      rebates: [
        {
          source: "Insurance discount (FL/Gulf Coast)",
          amount: 900,
          requirements:
            "Metal roof with wind rating. Annual savings — $9,000+ over 10 years.",
        },
        {
          source: "Energy efficiency credit",
          amount: 500,
          requirements: "ENERGY STAR reflective metal roofing",
        },
      ],
      compatibilityNotes: [
        "Lighter than shingles — no structural concerns",
        "Full tear-off of existing shingles required",
        "Specialized installation — requires experienced metal roofing contractor",
        "Can be noisy in heavy rain without proper underlayment and insulation",
        "Panels expand/contract with temperature — fastener system must accommodate",
      ],
      whileYoureAtIt: [
        "Add radiant barrier in attic ($1,000-2,000 — works synergistically with metal roof)",
        "Upgrade attic insulation to R-38+ ($1,500-3,000)",
        "Install ridge vent system designed for metal roofing ($500-800)",
        "Add solar panels (metal roof is ideal mounting surface, no penetrations needed with clamp system)",
      ],
      homeValueImpact: "significant",
      regionalNotes:
        "Metal roofing has exceptional ROI in hurricane zones and hot climates. " +
        "The combination of lower cooling costs, insurance discounts, and 50+ year lifespan " +
        "makes it cost-competitive with architectural shingles over 20+ years despite the " +
        "higher upfront cost.",
    },
  ],
};

// ════════════════════════════════════════════════════════════════════
// ELECTRICAL
// ════════════════════════════════════════════════════════════════════

export const ELECTRICAL_PANEL: UpgradePathEntry = {
  systemTypeKeys: ["electrical_panel"],
  category: "electrical",
  currentSystemLabel: "100A Electrical Panel",
  currentMonthlyOperatingCost: 0,
  gotchaFactors: [
    {
      trigger: "federal_pacific",
      description:
        "Federal Pacific Stab-Lok panels have a documented 25-30% failure-to-trip rate. " +
        "These are uninsurable in many markets and represent a genuine fire hazard. " +
        "Any replacement is mandatory.",
      severity: "mandatory",
    },
    {
      trigger: "zinsco",
      description:
        "Zinsco/GTE-Sylvania panels have known bus bar and breaker defects. " +
        "Similar to Federal Pacific — replacement is strongly recommended.",
      severity: "mandatory",
    },
    {
      trigger: "ev_charger_needed",
      description:
        "Level 2 EV charger requires 40-60A dedicated circuit. A 100A panel likely " +
        "cannot accommodate this without an upgrade.",
      severity: "advisory",
    },
    {
      trigger: "heat_pump_planned",
      description:
        "Heat pump systems require 200A service. Panel upgrade is a prerequisite.",
      severity: "advisory",
    },
  ],
  tiers: [
    {
      tier: "same_for_same",
      label: "100A Panel Replacement",
      description:
        "Replace the existing 100A panel with a new 100A panel. Addresses safety " +
        "concerns of old/defective panels but doesn't add capacity for modern loads.",
      installedCostLow: 1800,
      installedCostHigh: 2800,
      monthlyOperatingCost: 0,
      estimatedLifespanLow: 30,
      estimatedLifespanHigh: 40,
      weibullShape: 4.0,
      weibullScale: 420,
      rebates: [],
      compatibilityNotes: [
        "Same service entrance cable — no utility coordination needed",
        "May not support future upgrades (EV charger, heat pump, hot tub, etc.)",
        "If panel is Federal Pacific/Zinsco, ANY replacement addresses the safety issue",
      ],
      whileYoureAtIt: [
        "Add whole-home surge protector ($200-400)",
        "Update any aluminum wiring connections with anti-oxidant compound",
        "Label all circuits properly",
      ],
      homeValueImpact: "none",
    },
    {
      tier: "moderate_upgrade",
      label: "150A Panel Upgrade",
      description:
        "Modest capacity increase. Handles most modern loads but may not support " +
        "a full heat pump + EV charger combination.",
      installedCostLow: 2500,
      installedCostHigh: 3500,
      monthlyOperatingCost: 0,
      estimatedLifespanLow: 30,
      estimatedLifespanHigh: 40,
      weibullShape: 4.0,
      weibullScale: 420,
      rebates: [],
      compatibilityNotes: [
        "May require new service entrance cable (adds $500-1,000)",
        "Utility must approve and install new meter base",
        "Sufficient for most homes without heat pump + EV combo",
      ],
      whileYoureAtIt: [
        "Add whole-home surge protector ($200-400)",
        "Install generator interlock kit ($300-500)",
        "Add dedicated circuits for future EV charger, workshop, etc.",
      ],
      homeValueImpact: "minor",
    },
    {
      tier: "technology_change",
      label: "200A Panel Upgrade with Surge Protection",
      description:
        "Full 200A service — the modern standard. Supports heat pump, EV charger, " +
        "hot tub, workshop, and future electrification. Do it right once since you're " +
        "already opening the wall.",
      installedCostLow: 3500,
      installedCostHigh: 5500,
      monthlyOperatingCost: 0,
      estimatedLifespanLow: 35,
      estimatedLifespanHigh: 50,
      weibullShape: 4.5,
      weibullScale: 510,
      rebates: [
        {
          source: "IRA Electrical Panel Upgrade Credit",
          amount: 600,
          requirements: "Panel upgrade enabling electrification. Part of 25C qualified improvements.",
        },
      ],
      compatibilityNotes: [
        "Requires new service entrance cable ($500-1,000)",
        "Utility coordination required — new meter base, possibly new transformer tap",
        "Permit required — inspection will verify all work",
        "May require brief power outage during switchover (coordinate with utility)",
        "If replacing Federal Pacific/Zinsco: do 200A — the marginal cost vs. 100A is small",
      ],
      whileYoureAtIt: [
        "Add whole-home surge protector ($200-400)",
        "Install generator interlock kit ($300-500) or transfer switch ($500-1,200)",
        "Pre-wire for EV charger ($200-400 for conduit and wire to garage)",
        "Add dedicated 240V circuits for future heat pump, water heater, dryer",
        "Install AFCI breakers on all bedroom circuits (now code-required)",
      ],
      homeValueImpact: "significant",
      regionalNotes:
        "In FL and Gulf Coast, whole-home surge protection is especially important due to " +
        "frequent lightning strikes. Generator interlock is valuable for hurricane season outages.",
    },
  ],
};

// ════════════════════════════════════════════════════════════════════
// PLUMBING
// ════════════════════════════════════════════════════════════════════

export const PLUMBING_POLYBUTYLENE: UpgradePathEntry = {
  systemTypeKeys: ["plumbing_polybutylene"],
  category: "plumbing",
  currentSystemLabel: "Polybutylene Supply Lines (1978-1995)",
  currentMonthlyOperatingCost: 0,
  gotchaFactors: [
    {
      trigger: "polybutylene_material",
      description:
        "Polybutylene pipe has a documented manufacturing defect — it degrades from the inside " +
        "out when exposed to oxidants in water supply. 6-10 million homes affected. " +
        "Many insurers will not cover homes with polybutylene plumbing, or charge " +
        "a significant premium. Failure is sudden and catastrophic.",
      severity: "mandatory",
    },
  ],
  tiers: [
    {
      tier: "same_for_same",
      label: "This tier does not apply",
      description:
        "Polybutylene cannot be replaced with polybutylene — it's no longer manufactured. " +
        "Minimum replacement is PEX repipe.",
      installedCostLow: 0,
      installedCostHigh: 0,
      monthlyOperatingCost: 0,
      estimatedLifespanLow: 0,
      estimatedLifespanHigh: 0,
      weibullShape: 1,
      weibullScale: 1,
      rebates: [],
      compatibilityNotes: ["Not applicable — polybutylene is obsolete"],
      whileYoureAtIt: [],
      homeValueImpact: "none",
    },
    {
      tier: "moderate_upgrade",
      label: "Full PEX Repipe",
      description:
        "Replace all polybutylene supply lines with PEX (cross-linked polyethylene). " +
        "The standard modern choice — flexible, corrosion-resistant, freeze-resistant, " +
        "and a 50+ year expected lifespan.",
      installedCostLow: 5000,
      installedCostHigh: 10000,
      monthlyOperatingCost: 0,
      estimatedLifespanLow: 40,
      estimatedLifespanHigh: 60,
      weibullShape: 5.0,
      weibullScale: 600,
      rebates: [
        {
          source: "Insurance premium reduction",
          amount: 500,
          requirements:
            "Many insurers offer premium reduction after polybutylene removal. " +
            "Annual savings — compounds over time.",
        },
      ],
      compatibilityNotes: [
        "Requires access to walls — some drywall patches needed ($500-1,500 additional for patching/painting)",
        "Typically 2-3 day job for a standard home",
        "Home is without water during work hours on install days",
        "All fixtures reconnected — opportunity to update shut-off valves",
      ],
      whileYoureAtIt: [
        "Replace all shut-off valves with quarter-turn ball valves ($15-25 each, labor included)",
        "Install whole-home water filtration ($300-600)",
        "Add hose bibs / outdoor faucets if needed ($100-200 each)",
        "Update washing machine supply lines with braided stainless ($15-25)",
      ],
      homeValueImpact: "significant",
      regionalNotes:
        "In SE US, polybutylene repipe is one of the highest-priority home improvements. " +
        "Many homes built 1985-1995 in FL, GA, AL, and TX have polybutylene. " +
        "Insurance companies are increasingly refusing to insure or renew coverage on these homes.",
    },
    {
      tier: "technology_change",
      label: "PEX Repipe with Manifold System",
      description:
        "PEX repipe with home-run manifold plumbing. Each fixture gets its own dedicated PEX " +
        "line from a central manifold with individual shut-off valves. Luxury, but practical — " +
        "isolate any fixture without affecting the rest of the home.",
      installedCostLow: 7000,
      installedCostHigh: 14000,
      monthlyOperatingCost: 0,
      estimatedLifespanLow: 50,
      estimatedLifespanHigh: 70,
      weibullShape: 5.5,
      weibullScale: 720,
      rebates: [
        {
          source: "Insurance premium reduction",
          amount: 500,
          requirements: "Same as standard PEX repipe",
        },
      ],
      compatibilityNotes: [
        "More PEX material used — higher cost but fewer fittings (fewer potential leak points)",
        "Manifold typically installed in utility room or garage",
        "Slightly more wall access needed for running dedicated lines",
        "3-4 day job for standard home",
      ],
      whileYoureAtIt: [
        "Add whole-home water filtration at manifold ($300-600)",
        "Install water leak detection sensors at manifold and key locations ($100-300)",
        "Update all stop valves to quarter-turn ball valves",
        "Add recirculation loop for instant hot water ($200-400)",
      ],
      homeValueImpact: "significant",
    },
  ],
};

export const PLUMBING_GALVANIZED: UpgradePathEntry = {
  systemTypeKeys: ["plumbing_galvanized"],
  category: "plumbing",
  currentSystemLabel: "Galvanized Steel Supply Lines",
  currentMonthlyOperatingCost: 0,
  gotchaFactors: [
    {
      trigger: "galvanized_corrosion",
      description:
        "Galvanized steel pipes corrode from the inside out, restricting flow and " +
        "eventually failing. Rusty water and low pressure are warning signs.",
      severity: "urgent",
    },
  ],
  tiers: [
    {
      tier: "same_for_same",
      label: "Spot Repair",
      description:
        "Replace only the worst sections. Buys time but doesn't solve the underlying problem — " +
        "the remaining galvanized pipe continues to corrode.",
      installedCostLow: 500,
      installedCostHigh: 2000,
      monthlyOperatingCost: 0,
      estimatedLifespanLow: 3,
      estimatedLifespanHigh: 8,
      weibullShape: 2.0,
      weibullScale: 60,
      rebates: [],
      compatibilityNotes: [
        "Each repair creates a galvanic joint (copper to galvanized) that accelerates corrosion nearby",
        "Band-aid approach — more spots will fail",
      ],
      whileYoureAtIt: [],
      homeValueImpact: "none",
    },
    {
      tier: "moderate_upgrade",
      label: "Full PEX Repipe",
      description: "Replace all galvanized supply lines with PEX. Permanent fix.",
      installedCostLow: 5000,
      installedCostHigh: 10000,
      monthlyOperatingCost: 0,
      estimatedLifespanLow: 40,
      estimatedLifespanHigh: 60,
      weibullShape: 5.0,
      weibullScale: 600,
      rebates: [],
      compatibilityNotes: [
        "Some drywall repair needed ($500-1,500)",
        "2-3 day job",
        "Will dramatically improve water pressure",
      ],
      whileYoureAtIt: [
        "Replace all shut-off valves ($15-25 each)",
        "Install whole-home water filtration ($300-600)",
        "Test for lead at joints (galvanized to copper connections can leach lead)",
      ],
      homeValueImpact: "moderate",
    },
    {
      tier: "technology_change",
      label: "PEX Repipe with Whole-Home Filtration",
      description:
        "Full PEX repipe plus whole-home water filtration system. " +
        "Addresses both the pipe degradation and any water quality concerns from years of galvanized pipe.",
      installedCostLow: 6000,
      installedCostHigh: 12000,
      monthlyOperatingCost: 5, // Filter replacement costs
      estimatedLifespanLow: 40,
      estimatedLifespanHigh: 60,
      weibullShape: 5.0,
      weibullScale: 600,
      rebates: [],
      compatibilityNotes: [
        "Filtration system needs main water line access point",
        "Filter replacement every 6-12 months ($50-100)",
      ],
      whileYoureAtIt: [
        "Add water softener if hard water area ($1,500-3,000)",
        "Install pressure regulator if water pressure exceeds 80 PSI ($200-300)",
      ],
      homeValueImpact: "moderate",
    },
  ],
};

export const PLUMBING_CAST_IRON: UpgradePathEntry = {
  systemTypeKeys: ["plumbing_drain"],
  category: "plumbing",
  currentSystemLabel: "Cast Iron Drain Lines",
  currentMonthlyOperatingCost: 0,
  gotchaFactors: [
    {
      trigger: "cast_iron_age_over_50",
      description:
        "Cast iron drain pipes over 50 years old are at high risk of interior deterioration, " +
        "channeling, and collapse. Camera inspection is recommended.",
      severity: "advisory",
    },
  ],
  tiers: [
    {
      tier: "same_for_same",
      label: "Spot Repair with PVC Splice",
      description: "Replace only failed sections by cutting out damaged cast iron and splicing in PVC.",
      installedCostLow: 500,
      installedCostHigh: 3000,
      monthlyOperatingCost: 0,
      estimatedLifespanLow: 5,
      estimatedLifespanHigh: 15,
      weibullShape: 2.5,
      weibullScale: 120,
      rebates: [],
      compatibilityNotes: [
        "Fernco couplings connect PVC to cast iron",
        "Remaining cast iron continues to age",
      ],
      whileYoureAtIt: [],
      homeValueImpact: "none",
    },
    {
      tier: "moderate_upgrade",
      label: "Full Drain Line Replacement to PVC",
      description: "Replace all cast iron drain and waste lines with PVC. Permanent solution.",
      installedCostLow: 8000,
      installedCostHigh: 18000,
      monthlyOperatingCost: 0,
      estimatedLifespanLow: 50,
      estimatedLifespanHigh: 100,
      weibullShape: 6.0,
      weibullScale: 900,
      rebates: [],
      compatibilityNotes: [
        "Significant demolition required — floors, walls, possibly slab cuts",
        "5-10 day job depending on access",
        "May need to move out during work",
      ],
      whileYoureAtIt: [
        "Install cleanout access points throughout the system ($100-200 each)",
        "Add backflow prevention valve ($300-500)",
        "Camera-inspect sewer line to property boundary ($200-400)",
      ],
      homeValueImpact: "moderate",
    },
    {
      tier: "technology_change",
      label: "Trenchless Pipe Lining (CIPP)",
      description:
        "Cure-in-place pipe lining — a resin-coated liner is inserted into existing pipes " +
        "and cured in place, creating a new pipe inside the old one. Minimal demolition.",
      installedCostLow: 7000,
      installedCostHigh: 15000,
      monthlyOperatingCost: 0,
      estimatedLifespanLow: 40,
      estimatedLifespanHigh: 60,
      weibullShape: 4.5,
      weibullScale: 600,
      rebates: [],
      compatibilityNotes: [
        "Minimally invasive — often just 1-2 access points needed",
        "Reduces pipe diameter slightly (~5%) — rarely noticeable",
        "Not suitable for completely collapsed sections",
        "Camera inspection required first to assess viability ($200-400)",
      ],
      whileYoureAtIt: [
        "Line the sewer lateral to property line at the same time ($2,000-4,000)",
      ],
      homeValueImpact: "moderate",
      regionalNotes:
        "Trenchless lining is especially valuable in slab-on-grade homes common in FL and SE US, " +
        "where traditional replacement requires cutting through the concrete slab.",
    },
  ],
};

// ════════════════════════════════════════════════════════════════════
// MAJOR APPLIANCES (Summary — shorter entries for high-volume items)
// ════════════════════════════════════════════════════════════════════

export const APPLIANCE_REFRIGERATOR: UpgradePathEntry = {
  systemTypeKeys: ["appliance_refrigerator"],
  category: "appliances",
  currentSystemLabel: "Standard Refrigerator",
  currentMonthlyOperatingCost: 12,
  gotchaFactors: [],
  tiers: [
    {
      tier: "same_for_same",
      label: "Standard Top/Bottom Freezer",
      description: "Basic, reliable refrigerator. Longest-lasting configuration (14-17 years).",
      installedCostLow: 800,
      installedCostHigh: 1400,
      monthlyOperatingCost: 8,
      estimatedLifespanLow: 14,
      estimatedLifespanHigh: 17,
      weibullShape: 3.5,
      weibullScale: 186,
      rebates: [],
      compatibilityNotes: ["Verify dimensions match existing cutout"],
      whileYoureAtIt: ["Clean condenser coils on nearby units", "Check water line if ice maker equipped"],
      homeValueImpact: "none",
    },
    {
      tier: "moderate_upgrade",
      label: "ENERGY STAR French Door",
      description: "French door with bottom freezer. More usable space, better organization, energy efficient.",
      installedCostLow: 1800,
      installedCostHigh: 3000,
      monthlyOperatingCost: 7,
      estimatedLifespanLow: 11,
      estimatedLifespanHigh: 14,
      weibullShape: 3.2,
      weibullScale: 150,
      rebates: [{ source: "Utility rebate", amount: 100, requirements: "ENERGY STAR certified" }],
      compatibilityNotes: ["May need wider opening — French doors need clearance on both sides"],
      whileYoureAtIt: ["Install water line for ice maker if not present ($150-250)"],
      homeValueImpact: "minor",
    },
    {
      tier: "technology_change",
      label: "Counter-Depth Smart Refrigerator",
      description: "Built-in look, smart features, premium efficiency. Highest visual impact for kitchen.",
      installedCostLow: 2500,
      installedCostHigh: 4500,
      monthlyOperatingCost: 6,
      estimatedLifespanLow: 12,
      estimatedLifespanHigh: 15,
      weibullShape: 3.3,
      weibullScale: 162,
      rebates: [],
      compatibilityNotes: ["Counter-depth units have less total storage volume"],
      whileYoureAtIt: ["Dedicated circuit if sharing with other appliances"],
      homeValueImpact: "moderate",
    },
  ],
};

// ════════════════════════════════════════════════════════════════════
// LOOKUP & UTILITY FUNCTIONS
// ════════════════════════════════════════════════════════════════════

/** All upgrade paths indexed by system type key */
export const UPGRADE_PATHS: Record<string, UpgradePathEntry[]> = {
  water_heater_tank: [WATER_HEATER_GAS_TANK, WATER_HEATER_ELECTRIC_TANK],
  water_heater_tankless: [WATER_HEATER_GAS_TANK], // Already at highest tier, but can use for reference
  hvac_ac: [HVAC_AC_FURNACE],
  hvac_furnace: [HVAC_AC_FURNACE],
  roof_shingle: [ROOF_SHINGLE],
  roof_architectural: [ROOF_SHINGLE],
  electrical_panel: [ELECTRICAL_PANEL],
  electrical_wiring: [ELECTRICAL_PANEL],
  plumbing_polybutylene: [PLUMBING_POLYBUTYLENE],
  plumbing_galvanized: [PLUMBING_GALVANIZED],
  plumbing_drain: [PLUMBING_CAST_IRON],
  plumbing_cpvc: [PLUMBING_GALVANIZED], // Similar upgrade path
  appliance_refrigerator: [APPLIANCE_REFRIGERATOR],
};

/**
 * Look up upgrade paths for a system type key.
 * Returns the first matching entry, or null if no upgrade data exists.
 */
export function getUpgradePath(systemTypeKey: string): UpgradePathEntry | null {
  const entries = UPGRADE_PATHS[systemTypeKey];
  return entries?.[0] ?? null;
}

/**
 * Calculate total cost of ownership for an upgrade option over N years.
 * Includes: installed cost (midpoint) + operating costs - rebates.
 */
export function calculateTCO(
  tier: UpgradeTier,
  years: number,
  applyRebates: boolean = true
): number {
  const installedCost = (tier.installedCostLow + tier.installedCostHigh) / 2;
  const totalOperating = tier.monthlyOperatingCost * 12 * years;
  const totalRebates = applyRebates
    ? tier.rebates.reduce((sum, r) => sum + r.amount, 0)
    : 0;

  // If lifespan is shorter than the period, add a replacement
  const avgLifespan = (tier.estimatedLifespanLow + tier.estimatedLifespanHigh) / 2;
  const replacements = years > avgLifespan ? Math.floor(years / avgLifespan) : 0;

  return installedCost + totalOperating - totalRebates + (replacements * installedCost);
}

/**
 * Calculate payback period in months for an upgrade tier vs. a baseline tier.
 * Returns null if the upgrade never pays back (e.g., no operating savings).
 */
export function calculatePaybackMonths(
  baseline: UpgradeTier,
  upgrade: UpgradeTier
): number | null {
  const costDifference =
    (upgrade.installedCostLow + upgrade.installedCostHigh) / 2 -
    (baseline.installedCostLow + baseline.installedCostHigh) / 2;

  const monthlySavings = baseline.monthlyOperatingCost - upgrade.monthlyOperatingCost;
  const rebateOffset = upgrade.rebates.reduce((sum, r) => sum + r.amount, 0) -
    baseline.rebates.reduce((sum, r) => sum + r.amount, 0);

  const netCostDifference = costDifference - rebateOffset;

  if (monthlySavings <= 0) return null;
  return Math.ceil(netCostDifference / monthlySavings);
}

/**
 * Determine urgency classification for a system based on Weibull threshold
 * and gotcha factors.
 */
export function classifyUpgradeUrgency(
  weibullThreshold: number,
  hasGotchaFactor: boolean,
  hasSymptom: boolean
): "low" | "medium" | "high" | "critical" {
  if (hasGotchaFactor && weibullThreshold > 85) return "critical";
  if (hasGotchaFactor || weibullThreshold > 85) return "high";
  if (weibullThreshold > 70 || hasSymptom) return "medium";
  return "low";
}

/**
 * Generate a personalized conversation starter for the upgrade planning journey.
 */
export function generateConversationStarter(
  systemName: string,
  ageYears: number,
  lifespanLow: number,
  lifespanHigh: number,
  urgency: "low" | "medium" | "high" | "critical"
): string {
  if (urgency === "critical") {
    return (
      `Your ${systemName} needs attention now. At ${ageYears} years old, it's past its ` +
      `expected lifespan of ${lifespanLow}-${lifespanHigh} years. I've put together your ` +
      `replacement options with real costs for your area so you can make an informed decision ` +
      `quickly — not under pressure.`
    );
  }
  if (urgency === "high") {
    return (
      `Your ${systemName} is ${ageYears} years into a typical ${lifespanLow}-${lifespanHigh} year ` +
      `lifespan. It's time to start planning — before something goes wrong and you're making a ` +
      `big decision under pressure. I've put together your replacement options with real costs ` +
      `for your area. Want to take a look?`
    );
  }
  if (urgency === "medium") {
    return (
      `Your ${systemName} is ${ageYears} years old. With a typical lifespan of ` +
      `${lifespanLow}-${lifespanHigh} years, now is a good time to start thinking about your ` +
      `options. Planning ahead means you can budget gradually and choose the right upgrade — ` +
      `not just the first thing available. I've researched your options.`
    );
  }
  return (
    `Looking ahead — your ${systemName} is ${ageYears} years old, with a typical lifespan of ` +
    `${lifespanLow}-${lifespanHigh} years. No rush at all, but knowing your options now means ` +
    `you can start saving gradually. I've outlined the replacement paths so you know what's ` +
    `coming and what it costs.`
  );
}
