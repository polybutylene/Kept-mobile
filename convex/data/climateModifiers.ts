// Climate Modifiers — Region-specific adjustments to system Weibull parameters
// Source: Field-calibrated system profiles authored by Solomon (8 years HVAC/plumbing field experience)
// Each entry = one climate zone × one system type combination

export interface ClimateModifier {
  climateZoneId: string;
  climateZoneName: string;
  systemTypeName: string; // Matches systemTypes.name
  regions: string[];
  climateFactors: string[];
  impactDescription: string;
  lifespanModifierPercent: number;
  adjustedLifespanMin: number;
  adjustedLifespanMax: number;
  adjustedLifespanMedian: number;
  weibullScaleAdjustment: number;
  adjustedWeibullScale: number;
  weibullShapeNotes?: string;
  maintenanceAdjustments?: {
    taskName: string;
    originalFrequencyMonths: number;
    adjustedFrequencyMonths: number;
    rationale: string;
  }[];
  additionalTasks?: {
    taskName: string;
    frequency: string;
    description: string;
    rationale: string;
    seasonalRelevance?: string[];
  }[];
  additionalGuidelines?: string[];
  troubleshootingAdjustments?: {
    symptomName: string;
    adjustment: string;
  }[];
}

// ============================================
// WATER HEATER (TANK) — 8 CLIMATE ZONES
// National baseline: β=3.0, η=11.0, lifespan 8-12 yrs, median 10
// ============================================

export const waterHeaterTankClimateModifiers: ClimateModifier[] = [
  // 1. Gulf Coast / Subtropical
  {
    climateZoneId: "gulf_coast_subtropical",
    climateZoneName: "Gulf Coast / Subtropical",
    systemTypeName: "Water Heater (Tank)",
    regions: [
      "Gulf Coast FL (Panama City, Pensacola, Tampa)",
      "Coastal LA",
      "TX Gulf Coast (Houston, Corpus Christi)",
      "Coastal AL/MS"
    ],
    climateFactors: ["high_humidity", "salt_air", "hard_water", "hurricane_zone", "warm_inlet_water", "sandy_soil"],
    impactDescription: "One of the hardest environments for electric water heaters in the country. Extremely hard water (180-300+ ppm CaCO3 from limestone aquifer), high ambient humidity (annual average 75%+), and salt air exposure (within 15 miles of coast) creates a triple threat. Hard water accelerates sediment and anode depletion at ~1.5x national rate. Humidity accelerates external corrosion. Salt air compounds the corrosion. Warm inlet water (70-80°F) accelerates chemical reactions causing scale and corrosion.",
    lifespanModifierPercent: -20,
    adjustedLifespanMin: 6,
    adjustedLifespanMax: 10,
    adjustedLifespanMedian: 8,
    weibullScaleAdjustment: 0.80,
    adjustedWeibullScale: 8.8,
    weibullShapeNotes: "Shape parameter remains ~3.0 — the failure mode is the same (wear-out), it simply occurs faster. The curve shifts left without significantly changing shape.",
    maintenanceAdjustments: [
      {
        taskName: "Flush Tank and Drain Sediment",
        originalFrequencyMonths: 12,
        adjustedFrequencyMonths: 6,
        rationale: "Hard water from FL limestone aquifer (commonly 200-300 ppm) produces sediment at ~2x national rate."
      },
      {
        taskName: "Inspect Anode Rod Condition",
        originalFrequencyMonths: 24,
        adjustedFrequencyMonths: 12,
        rationale: "Hard water consumes magnesium anode rods 30-50% faster. Budget for replacement every 3 years."
      },
      {
        taskName: "Inspect Electrical Connections and High-Limit Reset",
        originalFrequencyMonths: 12,
        adjustedFrequencyMonths: 6,
        rationale: "Humidity and salt air cause accelerated corrosion of electrical terminals and junction box components."
      },
      {
        taskName: "Inspect for Leaks, Moisture, and Corrosion",
        originalFrequencyMonths: 3,
        adjustedFrequencyMonths: 1,
        rationale: "Compressed lifespan and accelerated corrosion make early leak detection even more critical."
      }
    ],
    additionalTasks: [
      {
        taskName: "Inspect Exterior for Salt Air Corrosion",
        frequency: "semi_annual",
        description: "Check all exposed metal surfaces — fittings, flex connectors, element access panel screws, and the tank jacket — for salt air corrosion (white or green oxidation on copper/brass, red rust on steel). Wipe surfaces and apply corrosion inhibitor spray.",
        rationale: "Within 15 miles of the Gulf Coast, salt air corrosion is a measurable accelerant on all exposed metals."
      }
    ],
    additionalGuidelines: [
      "Water softener installation is more strongly recommended in this zone than any other — the hard water from the limestone aquifer is the primary lifespan reducer. A softener can shift the adjusted lifespan from 6-10 years back toward the 9-12 year national baseline.",
      "Hurricane preparedness: Know the location of your water supply shutoff and water heater breaker. If evacuation is ordered, turn off both. After outages exceeding 72 hours, flush and sanitize the tank with hydrogen peroxide.",
      "Flood risk: If at grade level in a flood-prone area, consider elevating on a platform (18-24 inches). Water heaters submerged in floodwater must be replaced.",
      "Consider proactive replacement at 7-8 years instead of the national 8-10 year guideline."
    ],
    troubleshootingAdjustments: [
      {
        symptomName: "Rusty or Discolored Hot Water",
        adjustment: "Prioritize anode rod inspection first. In this water chemistry, anode rods deplete 30-50% faster. A 5-year-old heater may have a fully consumed rod that would still have 2-3 years of life in softer water."
      },
      {
        symptomName: "Popping or Rumbling Noises",
        adjustment: "Expect this to present earlier (3-4 years) than national average (5-7 years) due to accelerated sediment from hard water. Do not dismiss as normal aging."
      }
    ]
  },

  // 2. Coastal Northeast
  {
    climateZoneId: "coastal_northeast",
    climateZoneName: "Coastal Northeast",
    systemTypeName: "Water Heater (Tank)",
    regions: [
      "Coastal MA (Boston, Cape Cod)",
      "Coastal CT",
      "Long Island NY",
      "Coastal NJ",
      "Coastal RI",
      "Coastal ME/NH"
    ],
    climateFactors: ["freeze_thaw", "salt_air", "cold_inlet_water", "moderate_hard_water", "noreasters", "seasonal_demand_variation"],
    impactDescription: "Moderate-to-hard water (80-180 ppm), significant freeze-thaw risk for installations in unheated spaces, salt air corrosion within 5-10 miles of coast, and cold inlet water (38-50°F in winter) that increases recovery demand and thermal stress. Water heaters in unheated basements experience wide temperature swings that accelerate fitting fatigue.",
    lifespanModifierPercent: -8,
    adjustedLifespanMin: 7,
    adjustedLifespanMax: 11,
    adjustedLifespanMedian: 9,
    weibullScaleAdjustment: 0.92,
    adjustedWeibullScale: 10.1,
    weibullShapeNotes: "Shape parameter remains ~3.0. Slightly steeper late-life failure rate from thermal cycling stress on fittings.",
    maintenanceAdjustments: [
      {
        taskName: "Inspect Electrical Connections and High-Limit Reset",
        originalFrequencyMonths: 12,
        adjustedFrequencyMonths: 12,
        rationale: "Standard frequency adequate. Increase to semi-annual for coastal properties within 5 miles of the ocean."
      }
    ],
    additionalTasks: [
      {
        taskName: "Verify Freeze Protection for Unheated Installations",
        frequency: "annual",
        description: "For water heaters in unheated basements, garages, or crawl spaces: verify space temperature stays above 40°F during coldest weather. Insulate exposed supply lines and T&P discharge pipe. Consider heat tape on supply piping if space cannot be kept above freezing.",
        rationale: "The tank won't freeze (stored hot water and heating cycles prevent it), but supply lines, drain valve, and T&P discharge pipe can freeze and burst.",
        seasonalRelevance: ["fall"]
      }
    ],
    additionalGuidelines: [
      "Cold inlet water temperatures (38-45°F in winter) increase energy consumption 15-25% in winter. Insulating hot water pipes provides proportionally greater energy savings here than in warm-climate zones.",
      "During nor'easters and extended power outages in freezing conditions, the primary risk is frozen supply lines. If power will be out >24 hours in below-freezing conditions with the heater in an unheated space, shut off water and drain the tank."
    ],
    troubleshootingAdjustments: [
      {
        symptomName: "Water Around Base of Tank",
        adjustment: "In winter, check for condensation before assuming a leak. Cold inlet water entering a warm tank in a cool basement produces heavy condensation that can drip and pool. This is normal and resolves as the tank heats up."
      }
    ]
  },

  // 3. Upper Midwest / Great Lakes
  {
    climateZoneId: "upper_midwest_great_lakes",
    climateZoneName: "Upper Midwest / Great Lakes",
    systemTypeName: "Water Heater (Tank)",
    regions: ["MN", "WI", "MI", "Northern OH", "Northern IN", "Northern IL (Chicago)", "IA", "ND/SD"],
    climateFactors: ["extreme_cold", "ice_dams", "cold_inlet_water", "moderate_hard_water", "high_seasonal_demand", "road_salt_contamination_well_water"],
    impactDescription: "Very cold inlet water (35-42°F for extended winter periods), extreme ambient cold (basements may drop to 50-55°F), and moderate-to-hard water (100-200 ppm). Water heaters work significantly harder during 5-6 month winters, increasing element wear and thermostat cycling. Main risk factor is cold-weather installation vulnerability: supply lines in exterior walls or unheated rooms can freeze.",
    lifespanModifierPercent: -8,
    adjustedLifespanMin: 7,
    adjustedLifespanMax: 11,
    adjustedLifespanMedian: 9,
    weibullScaleAdjustment: 0.92,
    adjustedWeibullScale: 10.1,
    weibullShapeNotes: "Shape parameter remains ~3.0. Increased thermal cycling from cold inlet water is the primary accelerant.",
    maintenanceAdjustments: [
      {
        taskName: "Flush Tank and Drain Sediment",
        originalFrequencyMonths: 12,
        adjustedFrequencyMonths: 12,
        rationale: "Standard frequency adequate for most Great Lakes area water. Increase to semi-annual if hardness exceeds 180 ppm."
      }
    ],
    additionalTasks: [
      {
        taskName: "Pre-Winter Freeze Protection Verification",
        frequency: "annual",
        description: "Before the first hard freeze: verify all supply lines to and from the water heater are insulated, especially runs through exterior walls, rim joists, or unheated spaces. Check T&P discharge pipe insulation. Ensure the space stays above 45°F during extreme cold.",
        rationale: "Extended periods of -10°F to -30°F are not unusual. Supply line freeze events are a leading cause of catastrophic water damage in this region.",
        seasonalRelevance: ["fall"]
      }
    ],
    additionalGuidelines: [
      "Cold inlet water (35-42°F) means the temperature differential is 30-40% greater than warm-climate zones. Annual energy consumption increases 20-30%. Consider upgrading to a hybrid heat pump unit.",
      "In older homes with plumbing through exterior walls, consider rerouting supply lines to interior walls. A burst supply line while the homeowner is away is the nightmare scenario."
    ]
  },

  // 4. Desert Southwest
  {
    climateZoneId: "desert_southwest",
    climateZoneName: "Desert Southwest",
    systemTypeName: "Water Heater (Tank)",
    regions: ["Phoenix/Tucson AZ", "Las Vegas/Henderson NV", "Albuquerque/Santa Fe NM", "El Paso TX", "Palm Springs/Inland Empire CA"],
    climateFactors: ["extreme_heat", "extreme_hard_water", "high_uv", "dry_air", "high_inlet_water_temp", "minimal_humidity"],
    impactDescription: "Arguably the most destructive environment for tank water heaters due to extremely hard water — often 250-400+ ppm CaCO3, some of the hardest municipal water in the nation. Massive sediment accumulation (an inch or more per year without flushing), rapid scale on elements, and accelerated anode rod consumption. Low humidity means virtually no exterior corrosion. But high ambient temps (garage installations in Phoenix regularly exceed 130°F in summer) combined with warm inlet water (75-85°F) accelerate chemical reactions. Dramatically compressed lifespan driven almost entirely by water chemistry.",
    lifespanModifierPercent: -25,
    adjustedLifespanMin: 5,
    adjustedLifespanMax: 9,
    adjustedLifespanMedian: 7,
    weibullScaleAdjustment: 0.75,
    adjustedWeibullScale: 8.25,
    weibullShapeNotes: "Shape parameter may increase to β≈3.5 due to dominant hard water degradation. Failure distribution becomes more tightly concentrated — nearly all units fail within a narrower band (5-9 years).",
    maintenanceAdjustments: [
      {
        taskName: "Flush Tank and Drain Sediment",
        originalFrequencyMonths: 12,
        adjustedFrequencyMonths: 3,
        rationale: "At 250-400 ppm water hardness, sediment accumulates fast enough to bury a lower element within 12-18 months without intervention. Quarterly flushing is necessary."
      },
      {
        taskName: "Inspect Anode Rod Condition",
        originalFrequencyMonths: 24,
        adjustedFrequencyMonths: 12,
        rationale: "Anode rods in Desert Southwest water typically deplete in 2-3 years, half the national average. Plan for replacement every 2 years."
      }
    ],
    additionalGuidelines: [
      "A water softener is NOT optional in this climate zone — it is essential. Hard water alone cuts life by 30-40%. A properly functioning softener can shift lifespan from 5-9 years back toward 8-11 years.",
      "Consider proactive replacement at 5-6 years if no water softener is installed. By year 7 without treatment, failure probability exceeds 60%.",
      "If installed in a garage, monitor summer ambient temperatures. Sustained temps above 120°F accelerate all degradation mechanisms."
    ]
  },

  // 5. Pacific Northwest
  {
    climateZoneId: "pacific_northwest",
    climateZoneName: "Pacific Northwest",
    systemTypeName: "Water Heater (Tank)",
    regions: ["Portland OR", "Seattle/Tacoma WA", "Eugene OR", "Olympia WA", "Coastal OR/WA"],
    climateFactors: ["persistent_moisture", "soft_water", "mild_temperatures", "moss_algae", "moderate_inlet_water_temp"],
    impactDescription: "One of the most favorable environments for electric water heater longevity. Very soft water (15-60 ppm CaCO3 from snowmelt/rain-fed reservoirs) means minimal sediment and slower anode consumption. Mild temperatures year-round reduce thermal stress. Primary concern is persistent moisture — ambient humidity and condensation in unheated spaces can cause external corrosion. Overall lifespan typically at or slightly above national average.",
    lifespanModifierPercent: 8,
    adjustedLifespanMin: 9,
    adjustedLifespanMax: 13,
    adjustedLifespanMedian: 11,
    weibullScaleAdjustment: 1.08,
    adjustedWeibullScale: 11.9,
    weibullShapeNotes: "Shape parameter remains ~3.0. The curve shifts right (longer life) without changing shape.",
    maintenanceAdjustments: [
      {
        taskName: "Flush Tank and Drain Sediment",
        originalFrequencyMonths: 12,
        adjustedFrequencyMonths: 24,
        rationale: "With very soft water, sediment accumulation is minimal. Annual check is still wise, but flushing every 2 years is typically sufficient."
      }
    ],
    additionalTasks: [
      {
        taskName: "Manage Moisture in Installation Space",
        frequency: "semi_annual",
        description: "In basements and crawl spaces, check for condensation on the tank exterior, standing moisture around the base, and mildew growth. Run a dehumidifier during wet seasons or improve ventilation.",
        rationale: "Pacific Northwest homes often struggle with basement and crawl space moisture, which accelerates external corrosion of fittings and electrical components.",
        seasonalRelevance: ["fall", "spring"]
      }
    ],
    additionalGuidelines: [
      "This is one of the few regions where a water softener is unnecessary for water heater protection. Save the money and invest in a leak detector and expansion tank instead.",
      "Proactive replacement planning at 10-11 years (rather than 8-10) is appropriate here, provided maintenance has been performed."
    ]
  },

  // 6. Mountain West
  {
    climateZoneId: "mountain_west",
    climateZoneName: "Mountain West",
    systemTypeName: "Water Heater (Tank)",
    regions: ["Denver/Colorado Springs CO", "Salt Lake City UT", "Boise ID", "Billings MT", "Reno NV (transitional)", "Cheyenne WY"],
    climateFactors: ["altitude", "high_uv", "freeze_thaw", "dry_air", "hard_water_variable", "cold_inlet_water"],
    impactDescription: "Defined by altitude effects, significant temperature swings (diurnal variation 30-40°F common), and highly variable water hardness depending on the specific municipal source. Denver metro (50-100 ppm, relatively soft) vs Salt Lake City area (200-300 ppm, very hard). At altitude (5,000-8,000+ feet), water boils at lower temperature. UV exposure at altitude is 25-40% more intense, degrading exposed plastic components faster.",
    lifespanModifierPercent: -8,
    adjustedLifespanMin: 7,
    adjustedLifespanMax: 11,
    adjustedLifespanMedian: 9,
    weibullScaleAdjustment: 0.92,
    adjustedWeibullScale: 10.1,
    weibullShapeNotes: "Shape parameter remains ~3.0. Modifier is highly dependent on local water hardness — in SLC area, should be closer to Desert Southwest profile (η×0.80).",
    maintenanceAdjustments: [
      {
        taskName: "Flush Tank and Drain Sediment",
        originalFrequencyMonths: 12,
        adjustedFrequencyMonths: 12,
        rationale: "Ranges from biennial (Denver, soft water) to quarterly (SLC, hard water). Know your local water hardness."
      }
    ],
    additionalTasks: [
      {
        taskName: "Verify T&P Valve Rating for Altitude",
        frequency: "once",
        description: "At altitude, water boils ~1.8°F lower per 1,000 feet elevation. At 5,280 feet (Denver), water boils at ~202°F. Standard T&P valves rated at 210°F provide less margin. Verify rating is appropriate; consider a 200°F-rated valve for installations above 5,000 feet.",
        rationale: "Reduced boiling point margin means the T&P valve may be slightly less responsive to an overheating event."
      }
    ],
    additionalGuidelines: [
      "Check your local water utility's annual water quality report for hardness data. The Mountain West is a patchwork — your neighbor two miles away may have completely different water chemistry.",
      "UV degradation of exposed plastic supply lines and drain valve components is accelerated at altitude. Replace with UV-resistant materials or shield from direct sun."
    ]
  },

  // 7. Deep South / Piedmont
  {
    climateZoneId: "deep_south_piedmont",
    climateZoneName: "Deep South / Piedmont",
    systemTypeName: "Water Heater (Tank)",
    regions: ["Atlanta GA", "Birmingham AL", "Jackson MS", "Columbia SC", "Charlotte NC (transitional)", "Piedmont regions of GA/AL/SC"],
    climateFactors: ["high_humidity", "clay_soil", "termites", "moderate_hard_water", "warm_inlet_water", "thunderstorm_power_outages"],
    impactDescription: "Shares Gulf Coast's humidity concerns but without salt air and with less extreme hard water (80-150 ppm typical). High humidity (65-80%) drives external corrosion. Clay soil creates foundation settling that can stress plumbing connections. Termite risk relevant for wood platforms near the water heater. Thunderstorm frequency drives above-average power surge risk.",
    lifespanModifierPercent: -12,
    adjustedLifespanMin: 7,
    adjustedLifespanMax: 11,
    adjustedLifespanMedian: 9,
    weibullScaleAdjustment: 0.88,
    adjustedWeibullScale: 9.7,
    weibullShapeNotes: "Shape parameter remains ~3.0. Moderate acceleration of wear-out from humidity and water chemistry.",
    maintenanceAdjustments: [
      {
        taskName: "Flush Tank and Drain Sediment",
        originalFrequencyMonths: 12,
        adjustedFrequencyMonths: 12,
        rationale: "Standard annual frequency appropriate for moderate water hardness. Increase to semi-annual if local hardness exceeds 150 ppm."
      },
      {
        taskName: "Inspect Electrical Connections and High-Limit Reset",
        originalFrequencyMonths: 12,
        adjustedFrequencyMonths: 12,
        rationale: "Humidity-driven corrosion warrants careful annual inspection. Apply dielectric grease to wire connections as preventative measure."
      }
    ],
    additionalTasks: [
      {
        taskName: "Verify Whole-Home Surge Protection",
        frequency: "annual",
        description: "The Deep South experiences some of the highest lightning strike density in the US. Verify whole-home surge protector is installed and indicator light shows it is functional.",
        rationale: "A $200 surge protector can prevent a $300+ water heater control board or thermostat replacement."
      }
    ],
    additionalGuidelines: [
      "Humidity management in the installation space is important. In crawl space or garage installations, ensure adequate ventilation.",
      "If the water heater is on a wooden platform, include it in your annual termite inspection route."
    ]
  },

  // 8. Mid-Atlantic / Temperate
  {
    climateZoneId: "mid_atlantic_temperate",
    climateZoneName: "Mid-Atlantic / Temperate",
    systemTypeName: "Water Heater (Tank)",
    regions: ["Northern VA (DC suburbs)", "MD (Baltimore area)", "PA (Philadelphia, Pittsburgh)", "DE", "Southern NJ (inland)"],
    climateFactors: ["seasonal_variation", "moderate_hard_water", "freeze_thaw_moderate", "balanced_humidity", "seasonal_demand_shifts"],
    impactDescription: "Closest approximation to the national baseline. Moderate water hardness (80-140 ppm), seasonally variable humidity, temperatures 15-95°F across the year, basement installations standard. No single dominant stressor — instead, moderate levels of all common degradation factors. Primary consideration is seasonal demand variation and moderate freeze risk for plumbing in unheated zones.",
    lifespanModifierPercent: -3,
    adjustedLifespanMin: 8,
    adjustedLifespanMax: 12,
    adjustedLifespanMedian: 10,
    weibullScaleAdjustment: 0.97,
    adjustedWeibullScale: 10.7,
    weibullShapeNotes: "Shape parameter remains ~3.0. Essentially the national baseline with minimal negative adjustment for seasonal cycling.",
    additionalGuidelines: [
      "All standard maintenance and preventative care guidelines apply without modification. Focus on the fundamentals: annual flush, anode rod monitoring, leak detection, and proactive replacement planning at year 8-10.",
      "The biggest risk factor in this zone is complacency — because the climate is not extreme, homeowners assume the water heater will last forever. The failure curve still applies."
    ]
  }
];

// ============================================
// HVAC (CENTRAL AC / HEAT PUMP) — 8 CLIMATE ZONES
// National baseline: β=2.5, η=15.0, lifespan 12-20 yrs, median 15
// ============================================

export const hvacClimateModifiers: ClimateModifier[] = [
  // 1. Gulf Coast / Subtropical
  {
    climateZoneId: "gulf_coast_subtropical",
    climateZoneName: "Gulf Coast / Subtropical",
    systemTypeName: "Central Air Conditioner",
    regions: [
      "Gulf Coast FL (Panama City, Pensacola, Tampa)",
      "Coastal LA",
      "TX Gulf Coast (Houston, Corpus Christi)",
      "Coastal AL/MS"
    ],
    climateFactors: ["continuous_run_cycles", "salt_air", "high_humidity", "hurricane_zone", "organic_growth", "lightning"],
    impactDescription: "One of the most demanding environments for HVAC equipment in the country. Systems run 8-10 months per year, often 18+ hours/day in summer. Salt air within 15 miles of the coast accelerates condenser coil corrosion. High humidity promotes mold and algae growth in drain lines and on evaporator coils. Lightning and power surges are a constant threat. The continuous operational demand compresses compressor life significantly.",
    lifespanModifierPercent: -18,
    adjustedLifespanMin: 10,
    adjustedLifespanMax: 16,
    adjustedLifespanMedian: 12,
    weibullScaleAdjustment: 0.82,
    adjustedWeibullScale: 12.3,
    weibullShapeNotes: "Shape parameter remains ~2.5. The curve shifts left substantially due to operational hours being 2-3x that of moderate-climate zones.",
    maintenanceAdjustments: [
      {
        taskName: "Replace Air Filter",
        originalFrequencyMonths: 3,
        adjustedFrequencyMonths: 1,
        rationale: "Near-continuous operation means filters clog faster. Monthly checks are mandatory; replacement every 1-2 months during cooling season."
      },
      {
        taskName: "Clear Condensate Drain Line",
        originalFrequencyMonths: 6,
        adjustedFrequencyMonths: 1,
        rationale: "Algae growth in the drain line is the #1 cause of AC shutoffs in this climate. Monthly vinegar treatment is essential."
      },
      {
        taskName: "Clean Outdoor Condenser Coil",
        originalFrequencyMonths: 12,
        adjustedFrequencyMonths: 6,
        rationale: "Salt air and organic debris (mold, pollen, cottonwood) accumulate rapidly on condenser fins. Semi-annual cleaning maintains efficiency."
      },
      {
        taskName: "Professional HVAC Tune-up",
        originalFrequencyMonths: 12,
        adjustedFrequencyMonths: 12,
        rationale: "Annual tune-up remains standard, but schedule for early spring (March) before the summer rush."
      }
    ],
    additionalTasks: [
      {
        taskName: "Inspect for Salt Air Corrosion on Condenser",
        frequency: "semi_annual",
        description: "Check condenser coil fins, copper refrigerant lines, and electrical connections for salt air corrosion (white or green oxidation). Apply coil coating if within 5 miles of the coast.",
        rationale: "Salt air corrosion is the primary accelerant for condenser coil failure in coastal Gulf Coast zones.",
        seasonalRelevance: ["spring", "fall"]
      },
      {
        taskName: "Verify Surge Protection",
        frequency: "annual",
        description: "Confirm whole-home surge protector is installed and indicator shows it's functional. NW Florida has among the highest lightning strike density in the US.",
        rationale: "A $200 surge protector prevents $1,000+ in compressor, control board, and capacitor replacements from lightning surges."
      }
    ],
    additionalGuidelines: [
      "Consider proactive replacement at 10-12 years instead of the national 13-15 year guideline. By year 12 in this climate, failure probability exceeds 50%.",
      "When replacing, choose a unit with coastal-rated (marine-treated) condenser coils if within 15 miles of the coast. The upcharge is $200-400 but adds 3-5 years of corrosion resistance.",
      "Oversizing is the biggest installation mistake in humid climates. An oversized unit short-cycles, fails to dehumidify, and creates indoor comfort problems. Proper Manual J load calculation is critical."
    ],
    troubleshootingAdjustments: [
      {
        symptomName: "AC Not Cooling Sufficiently",
        adjustment: "Before assuming low refrigerant, check the condensate drain line (clogged line triggers float switch shutoff), the filter (monthly changes needed here), and condenser cleanliness. These three causes account for 70% of 'AC not cooling' calls in this climate."
      },
      {
        symptomName: "Ice on Refrigerant Lines",
        adjustment: "In addition to standard causes (low refrigerant, dirty filter), check for mold/algae buildup on the evaporator coil restricting airflow. This is extremely common in high-humidity zones."
      }
    ]
  },

  // 2. Desert Southwest
  {
    climateZoneId: "desert_southwest",
    climateZoneName: "Desert Southwest",
    systemTypeName: "Central Air Conditioner",
    regions: ["Phoenix/Tucson AZ", "Las Vegas/Henderson NV", "Albuquerque NM", "El Paso TX", "Palm Springs CA"],
    climateFactors: ["extreme_heat", "dust", "high_uv", "dry_air", "wide_temp_swings"],
    impactDescription: "Extreme heat (115°F+ ambient) forces condenser units to work against enormous temperature differentials. Fine desert dust and sand infiltrate condenser fins and blower motors. UV radiation degrades exposed plastic and rubber components (capacitor housings, wire insulation, drain pans) faster than any other region. Systems run 6-8 months but at extreme intensity — a Phoenix summer hour is equivalent to 2+ hours in a moderate climate.",
    lifespanModifierPercent: -12,
    adjustedLifespanMin: 10,
    adjustedLifespanMax: 17,
    adjustedLifespanMedian: 13,
    weibullScaleAdjustment: 0.88,
    adjustedWeibullScale: 13.2,
    maintenanceAdjustments: [
      {
        taskName: "Replace Air Filter",
        originalFrequencyMonths: 3,
        adjustedFrequencyMonths: 1,
        rationale: "Desert dust, construction dust, and monsoon-season particulates clog filters rapidly. Monthly replacement during cooling season."
      },
      {
        taskName: "Clean Outdoor Condenser Coil",
        originalFrequencyMonths: 12,
        adjustedFrequencyMonths: 4,
        rationale: "Fine dust embeds in condenser fins and hardens. Three cleanings per year (pre-season, mid-summer, post-monsoon) maintain efficiency."
      }
    ],
    additionalGuidelines: [
      "During extreme heat events (115°F+), the AC may not cool below 78-80°F. This is a design limitation, not a malfunction — the system is working as hard as it can against the temperature differential.",
      "UV damage to capacitors is a leading cause of failure in Desert Southwest. Have capacitors checked annually during tune-up.",
      "Shade structures or awnings over the condenser unit can reduce its workload 10-15% by keeping direct sun off the coil."
    ]
  },

  // 3. Upper Midwest / Great Lakes
  {
    climateZoneId: "upper_midwest_great_lakes",
    climateZoneName: "Upper Midwest / Great Lakes",
    systemTypeName: "Central Air Conditioner",
    regions: ["MN", "WI", "MI", "Northern OH", "Northern IN", "Chicago IL", "IA"],
    climateFactors: ["short_cooling_season", "extreme_cold_storage", "road_salt", "freeze_thaw"],
    impactDescription: "Short cooling season (3-4 months) means less operational wear but 6-8 months of dormancy where the outdoor unit sits in extreme cold, ice, and road salt environments. Freeze-thaw cycles stress the condenser cabinet, and road salt accelerates corrosion. Overall lifespan is slightly above average due to lower operational hours.",
    lifespanModifierPercent: 8,
    adjustedLifespanMin: 13,
    adjustedLifespanMax: 22,
    adjustedLifespanMedian: 16,
    weibullScaleAdjustment: 1.08,
    adjustedWeibullScale: 16.2,
    maintenanceAdjustments: [
      {
        taskName: "Clean Outdoor Condenser Coil",
        originalFrequencyMonths: 12,
        adjustedFrequencyMonths: 12,
        rationale: "Standard annual cleaning in spring before cooling season. Also clear cottonwood seed buildup if present (common in Great Lakes states)."
      }
    ],
    additionalTasks: [
      {
        taskName: "Winter Condenser Protection",
        frequency: "annual",
        description: "In fall, clear debris from around and on top of the condenser. Consider a breathable cover (not a sealed tarp) to keep ice and heavy snow off the unit. Remove the cover before spring startup.",
        rationale: "Heavy ice accumulation and road salt spray (for units near driveways) accelerate cabinet and coil corrosion during the dormant season.",
        seasonalRelevance: ["fall"]
      }
    ],
    additionalGuidelines: [
      "Proactive replacement at 15-16 years is appropriate here. Systems last longer but efficiency technology advances make replacement worthwhile even before failure.",
      "Heat pump adoption is growing in this region. Modern cold-climate heat pumps work efficiently down to -15°F. Consider this for replacement planning."
    ]
  },

  // 4. Pacific Northwest
  {
    climateZoneId: "pacific_northwest",
    climateZoneName: "Pacific Northwest",
    systemTypeName: "Central Air Conditioner",
    regions: ["Portland OR", "Seattle WA", "Eugene OR", "Olympia WA"],
    climateFactors: ["mild_temperatures", "persistent_moisture", "moss_algae", "short_cooling_season"],
    impactDescription: "Mild climate with a very short cooling season (6-10 weeks). Systems run relatively few hours annually, extending mechanical life. However, persistent moisture promotes moss, algae, and organic growth on outdoor units. Many homes historically lacked AC — it's becoming more common with warming trends.",
    lifespanModifierPercent: 12,
    adjustedLifespanMin: 14,
    adjustedLifespanMax: 22,
    adjustedLifespanMedian: 17,
    weibullScaleAdjustment: 1.12,
    adjustedWeibullScale: 16.8,
    additionalGuidelines: [
      "Given the short cooling season, ductless mini-splits are increasingly popular and highly efficient for this climate.",
      "Heat pump systems provide excellent value here — they heat efficiently for the mild winters and cool for the brief summers."
    ]
  },
];

// ============================================
// PLUMBING (SUPPLY/DRAIN SYSTEMS) — KEY CLIMATE ZONES
// National baseline: varies by component
// ============================================

export const plumbingClimateModifiers: ClimateModifier[] = [
  // Gulf Coast — Hard Water + Humidity
  {
    climateZoneId: "gulf_coast_subtropical",
    climateZoneName: "Gulf Coast / Subtropical",
    systemTypeName: "Plumbing System",
    regions: [
      "Gulf Coast FL", "Coastal LA", "TX Gulf Coast", "Coastal AL/MS"
    ],
    climateFactors: ["hard_water", "high_humidity", "warm_temperatures", "limestone_aquifer", "hurricane_zone"],
    impactDescription: "Extremely hard water (180-300+ ppm CaCO3) from the limestone aquifer is the dominant factor. Scale buildup affects every water-connected fixture and appliance: faucets, shower heads, dishwashers, ice makers, and supply lines. Warm temperatures accelerate chemical reactions. High humidity causes condensation on cold water pipes and can corrode exposed metal fittings. Hard water also reduces the effectiveness and lifespan of water softeners.",
    lifespanModifierPercent: -15,
    adjustedLifespanMin: 0,
    adjustedLifespanMax: 0,
    adjustedLifespanMedian: 0,
    weibullScaleAdjustment: 0.85,
    adjustedWeibullScale: 0,
    maintenanceAdjustments: [
      {
        taskName: "Clean Faucet Aerators",
        originalFrequencyMonths: 12,
        adjustedFrequencyMonths: 6,
        rationale: "Hard water mineral buildup clogs aerator screens twice as fast. Semi-annual cleaning with vinegar soak."
      },
      {
        taskName: "Inspect Supply Line Connections",
        originalFrequencyMonths: 12,
        adjustedFrequencyMonths: 6,
        rationale: "Humidity and hard water deposits on threaded connections can mask slow leaks. Semi-annual visual inspection."
      }
    ],
    additionalTasks: [
      {
        taskName: "Test and Maintain Water Softener",
        frequency: "monthly",
        description: "Check salt levels, clean the brine tank annually, and verify the softener is regenerating properly. In Gulf Coast hard water, a softener is essential for protecting all plumbing and water-using appliances.",
        rationale: "A working water softener extends the life of water heaters, faucets, dishwashers, and washing machines by 30-50% in this water chemistry.",
        seasonalRelevance: ["spring", "summer", "fall", "winter"]
      }
    ],
    additionalGuidelines: [
      "A whole-house water softener is the single most impactful investment for plumbing longevity in this region.",
      "PEX piping resists scale better than copper in hard water. If repiping, PEX is the preferred material.",
      "Tankless water heaters require regular descaling (every 6-12 months) in this water chemistry."
    ]
  },

  // Desert Southwest — Extreme Hard Water
  {
    climateZoneId: "desert_southwest",
    climateZoneName: "Desert Southwest",
    systemTypeName: "Plumbing System",
    regions: ["Phoenix AZ", "Las Vegas NV", "Albuquerque NM", "El Paso TX"],
    climateFactors: ["extreme_hard_water", "dry_air", "high_uv", "extreme_heat"],
    impactDescription: "The hardest municipal water in the nation (250-400+ ppm). Scale buildup is aggressive and relentless. Outdoor plumbing components (hose bibs, irrigation valves) face extreme UV and heat degradation. Despite the dry climate, interior condensation on cold water lines is minimal — the dominant issue is purely water chemistry.",
    lifespanModifierPercent: -20,
    adjustedLifespanMin: 0,
    adjustedLifespanMax: 0,
    adjustedLifespanMedian: 0,
    weibullScaleAdjustment: 0.80,
    adjustedWeibullScale: 0,
    maintenanceAdjustments: [
      {
        taskName: "Clean Faucet Aerators",
        originalFrequencyMonths: 12,
        adjustedFrequencyMonths: 3,
        rationale: "Extreme hard water requires quarterly aerator cleaning. Heavy calcium deposits are visible within 2-3 months."
      }
    ],
    additionalGuidelines: [
      "Water softener is NOT optional — it is essential for protecting all plumbing and appliances.",
      "Reverse osmosis systems for drinking water are near-universal in this region and highly recommended.",
      "UV-rated pipe materials are critical for any outdoor or exposed plumbing runs."
    ]
  },

  // Upper Midwest — Freeze Risk
  {
    climateZoneId: "upper_midwest_great_lakes",
    climateZoneName: "Upper Midwest / Great Lakes",
    systemTypeName: "Plumbing System",
    regions: ["MN", "WI", "MI", "Northern OH", "Northern IN", "Chicago IL"],
    climateFactors: ["extreme_cold", "freeze_risk", "road_salt_contamination", "seasonal_demand_variation"],
    impactDescription: "The dominant risk factor is pipe freezing. Extended periods of -10°F to -30°F can freeze supply lines in exterior walls, crawl spaces, and unheated areas. A burst pipe while the homeowner is away is the single most catastrophic plumbing event — capable of causing $50,000+ in water damage. Moderate hard water (100-200 ppm) is secondary concern.",
    lifespanModifierPercent: -8,
    adjustedLifespanMin: 0,
    adjustedLifespanMax: 0,
    adjustedLifespanMedian: 0,
    weibullScaleAdjustment: 0.92,
    adjustedWeibullScale: 0,
    additionalTasks: [
      {
        taskName: "Pre-Winter Pipe Freeze Protection",
        frequency: "annual",
        description: "Before the first hard freeze: insulate exposed supply lines, disconnect and drain garden hoses, close interior shutoffs to outdoor spigots, verify heat tape on vulnerable lines is functional.",
        rationale: "A burst pipe from freezing is the most expensive plumbing emergency in this region. Prevention costs $20-50; the repair and water damage can exceed $10,000.",
        seasonalRelevance: ["fall"]
      }
    ],
    additionalGuidelines: [
      "If leaving the home unoccupied during winter, set the thermostat to at least 55°F and open cabinet doors under sinks on exterior walls.",
      "Consider a smart water shutoff valve and leak detector. These can prevent catastrophic damage from burst pipes while you're away.",
      "When remodeling, relocate plumbing from exterior walls to interior walls whenever possible."
    ]
  },
];

// ============================================
// ELECTRICAL — KEY CLIMATE ZONES
// National baseline: panels/wiring have 25-40 yr lifespan
// ============================================

export const electricalClimateModifiers: ClimateModifier[] = [
  // Gulf Coast — Lightning + Humidity + Salt
  {
    climateZoneId: "gulf_coast_subtropical",
    climateZoneName: "Gulf Coast / Subtropical",
    systemTypeName: "Electrical Panel",
    regions: [
      "Gulf Coast FL", "Coastal LA", "TX Gulf Coast", "Coastal AL/MS"
    ],
    climateFactors: ["lightning", "high_humidity", "salt_air", "hurricane_zone", "power_surges"],
    impactDescription: "NW Florida and the Gulf Coast have among the highest lightning strike densities in the US. Power surges from lightning damage control boards, capacitors, and sensitive electronics. High humidity corrodes electrical connections, especially in outdoor panels, junction boxes, and HVAC disconnects. Salt air within 15 miles of the coast compounds the corrosion. Hurricane-related power outages and the resulting surges when power is restored create additional stress.",
    lifespanModifierPercent: -12,
    adjustedLifespanMin: 22,
    adjustedLifespanMax: 35,
    adjustedLifespanMedian: 28,
    weibullScaleAdjustment: 0.88,
    adjustedWeibullScale: 30.8,
    maintenanceAdjustments: [
      {
        taskName: "Inspect Panel and Connections",
        originalFrequencyMonths: 24,
        adjustedFrequencyMonths: 12,
        rationale: "Humidity and salt air corrode bus bars, breaker connections, and grounding conductors. Annual professional inspection is critical."
      }
    ],
    additionalTasks: [
      {
        taskName: "Test Whole-Home Surge Protection",
        frequency: "annual",
        description: "Verify the whole-home surge protector is installed at the main panel and its indicator light shows functional status. Test GFCI outlets in kitchens, bathrooms, and exterior locations.",
        rationale: "Lightning is the leading cause of electrical component failure in this region. A $200-400 surge protector prevents thousands in damage.",
        seasonalRelevance: ["spring"]
      },
      {
        taskName: "Inspect Outdoor Electrical Components",
        frequency: "semi_annual",
        description: "Check HVAC disconnect boxes, outdoor outlets, landscape lighting connections, and pool/spa equipment for corrosion, moisture intrusion, and insect nesting.",
        rationale: "Outdoor electrical components in humid, coastal environments degrade rapidly. Ant and wasp nesting in disconnect boxes is common and can cause short circuits."
      }
    ],
    additionalGuidelines: [
      "A whole-home surge protector is NOT optional in the Gulf Coast lightning zone. It should be the first electrical upgrade after moving into any home.",
      "If the electrical panel is a Federal Pacific (FPE) or Zinsco brand, replacement should be prioritized regardless of age. These brands have known safety defects.",
      "100-amp panels may be insufficient for modern Gulf Coast homes (high AC demand + potential heat pump water heater + EV charger). Evaluate panel capacity during any major renovation."
    ]
  },

  // Deep South
  {
    climateZoneId: "deep_south_piedmont",
    climateZoneName: "Deep South / Piedmont",
    systemTypeName: "Electrical Panel",
    regions: ["Atlanta GA", "Birmingham AL", "Jackson MS", "Columbia SC", "Charlotte NC"],
    climateFactors: ["high_humidity", "thunderstorms", "power_outages", "clay_soil_ground_rods"],
    impactDescription: "High thunderstorm frequency (second only to the Gulf Coast) drives above-average power surge risk. High humidity corrodes connections. Clay soil reduces grounding rod effectiveness, potentially compromising the grounding system's ability to safely dissipate surge energy.",
    lifespanModifierPercent: -8,
    adjustedLifespanMin: 23,
    adjustedLifespanMax: 37,
    adjustedLifespanMedian: 30,
    weibullScaleAdjustment: 0.92,
    adjustedWeibullScale: 32.2,
    additionalTasks: [
      {
        taskName: "Test GFCI and AFCI Breakers",
        frequency: "semi_annual",
        description: "Press the test button on all GFCI outlets and AFCI breakers. They should trip immediately. Reset after testing.",
        rationale: "High humidity environments can cause nuisance tripping AND can prevent proper tripping when needed. Regular testing confirms protection."
      }
    ],
    additionalGuidelines: [
      "Whole-home surge protection is strongly recommended in this high-lightning-density region.",
      "If your home has a grounding system in clay soil, have a licensed electrician verify ground resistance. Clay soil can provide poor grounding, reducing surge protection effectiveness."
    ]
  },
];

// ============================================
// ROOFING — KEY CLIMATE ZONES
// National baseline: asphalt shingle 20-30 yrs, metal 40-60 yrs
// ============================================

export const roofingClimateModifiers: ClimateModifier[] = [
  // Gulf Coast — Hurricanes + UV + Humidity
  {
    climateZoneId: "gulf_coast_subtropical",
    climateZoneName: "Gulf Coast / Subtropical",
    systemTypeName: "Roof (Asphalt Shingle)",
    regions: [
      "Gulf Coast FL", "Coastal LA", "TX Gulf Coast", "Coastal AL/MS"
    ],
    climateFactors: ["hurricane_wind", "high_uv", "high_humidity", "salt_air", "driving_rain", "algae_growth"],
    impactDescription: "Hurricane-force winds are the acute risk. But the chronic stressors are equally damaging: intense UV degrades shingle granules faster than any other factor, high humidity promotes algae (those dark streaks) and moss growth, and driving rain tests flashing and sealant integrity constantly. Salt air accelerates nail and flashing corrosion. Algae-resistant shingles are standard but not immune.",
    lifespanModifierPercent: -20,
    adjustedLifespanMin: 16,
    adjustedLifespanMax: 24,
    adjustedLifespanMedian: 20,
    weibullScaleAdjustment: 0.80,
    adjustedWeibullScale: 20.0,
    maintenanceAdjustments: [
      {
        taskName: "Roof Visual Inspection",
        originalFrequencyMonths: 12,
        adjustedFrequencyMonths: 6,
        rationale: "Semi-annual inspection catches wind damage, lifted shingles, and algae growth early. Inspect after every named storm."
      }
    ],
    additionalTasks: [
      {
        taskName: "Post-Storm Roof Inspection",
        frequency: "as_needed",
        description: "After any tropical storm or hurricane, inspect the roof for missing shingles, lifted flashing, damaged ridge caps, and debris impacts. Document with photos for insurance.",
        rationale: "Storm damage that goes unrepaired leads to leaks, decking rot, and mold within months in this humidity."
      },
      {
        taskName: "Clean Algae Streaks",
        frequency: "annual",
        description: "Apply zinc or copper strip treatment or have the roof soft-washed to remove algae streaks. Don't use a pressure washer.",
        rationale: "Algae feeds on the limestone filler in asphalt shingles, degrading them from the surface down. It's cosmetic at first but reduces lifespan over time.",
        seasonalRelevance: ["fall"]
      }
    ],
    additionalGuidelines: [
      "When replacing, specify impact-rated (Miami-Dade or Florida Building Code compliant) shingles. The premium is 10-15% but provides significantly better wind resistance.",
      "Metal roofing is increasingly popular in the Gulf Coast for its hurricane resistance and 40-60 year lifespan. Consider it for replacement — the upfront cost is higher but the lifetime cost is lower.",
      "Ensure roof-to-wall connections meet current Florida Building Code (hurricane straps/clips on every truss). This is often the weakest point in older homes."
    ]
  },

  // Desert Southwest — UV
  {
    climateZoneId: "desert_southwest",
    climateZoneName: "Desert Southwest",
    systemTypeName: "Roof (Asphalt Shingle)",
    regions: ["Phoenix AZ", "Las Vegas NV", "Albuquerque NM", "El Paso TX"],
    climateFactors: ["extreme_uv", "extreme_heat", "thermal_cycling", "hail_monsoon"],
    impactDescription: "The most UV-intense environment in the US. Extreme UV radiation literally bakes the volatile oils out of asphalt shingles, making them brittle and prone to cracking. Thermal cycling (140°F roof surface in summer, dropping 60+ degrees overnight) fatigues shingle material. Monsoon-season hail adds acute damage risk.",
    lifespanModifierPercent: -25,
    adjustedLifespanMin: 15,
    adjustedLifespanMax: 22,
    adjustedLifespanMedian: 18,
    weibullScaleAdjustment: 0.75,
    adjustedWeibullScale: 18.75,
    additionalGuidelines: [
      "Tile roofing (clay or concrete) is the preferred material in the Desert Southwest — it handles extreme heat and UV far better than asphalt, lasting 40-75 years.",
      "If using asphalt shingles, choose the highest rated product available (30-year rated minimum) and budget for replacement at 15-18 years.",
      "Light-colored or reflective roofing can reduce attic temperatures by 20-30°F and significantly lower cooling costs."
    ]
  },

  // Upper Midwest — Snow + Ice
  {
    climateZoneId: "upper_midwest_great_lakes",
    climateZoneName: "Upper Midwest / Great Lakes",
    systemTypeName: "Roof (Asphalt Shingle)",
    regions: ["MN", "WI", "MI", "Northern OH", "Northern IN", "Chicago IL"],
    climateFactors: ["snow_load", "ice_dams", "freeze_thaw", "hail", "wind"],
    impactDescription: "Ice dams are the signature roof killer in this region. Heat escaping through the attic melts snow on the upper roof, which refreezes at the eaves, creating a dam. Water backs up under shingles and into the home. Hailstorms are frequent in spring and summer. Heavy snow loads stress the structure. Freeze-thaw cycles degrade shingle material over time.",
    lifespanModifierPercent: -10,
    adjustedLifespanMin: 18,
    adjustedLifespanMax: 27,
    adjustedLifespanMedian: 22,
    weibullScaleAdjustment: 0.90,
    adjustedWeibullScale: 22.5,
    additionalTasks: [
      {
        taskName: "Inspect Attic Insulation and Ventilation",
        frequency: "annual",
        description: "Verify attic insulation is adequate (R-49 to R-60 recommended in this zone) and soffit/ridge vents are clear. Proper insulation and ventilation prevents ice dams.",
        rationale: "Ice dams are caused by heat loss from the living space into the attic. Solving the insulation/ventilation problem eliminates the ice dam risk.",
        seasonalRelevance: ["fall"]
      }
    ],
    additionalGuidelines: [
      "Ice and water shield membrane should be installed on the first 3 feet of the roof from the eaves (required by code in most of this zone).",
      "If you're getting ice dams, the solution is attic insulation and air sealing — NOT heat cables. Heat cables are a band-aid.",
      "Impact-resistant shingles (Class 3 or 4) may qualify for insurance discounts and provide genuine protection against frequent hailstorms."
    ]
  },
];

// ============================================
// ALL CLIMATE MODIFIERS EXPORT
// ============================================
export const allClimateModifiers: ClimateModifier[] = [
  ...waterHeaterTankClimateModifiers,
  ...hvacClimateModifiers,
  ...plumbingClimateModifiers,
  ...electricalClimateModifiers,
  ...roofingClimateModifiers,
];
