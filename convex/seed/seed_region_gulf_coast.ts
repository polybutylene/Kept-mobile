import { internalMutation } from "../_generated/server";

const gulfCoastProfile = {
  key: "gulf_coast",
  name: "Gulf Coast",
  climateZones: ["1A", "2A"],
  states: [
    "FL (Panhandle, Big Bend, Gulf Coast)",
    "AL (Mobile, Baldwin County, south)",
    "MS (Biloxi, Gulfport, south)",
    "LA (entire state)",
    "TX (Beaumont to Corpus Christi Gulf corridor)",
  ],
  majorCities: [
    "Pensacola", "Fort Walton Beach", "Destin", "Panama City", "DeFuniak Springs",
    "Tallahassee", "Mobile", "Biloxi", "Gulfport", "New Orleans", "Baton Rouge",
    "Lake Charles", "Beaumont", "Houston", "Galveston", "Corpus Christi",
  ],
  climate: {
    avgSummerHighF: 92,
    avgWinterLowF: 41,
    avgAnnualRainfallInches: 65,
    avgHumidityPercent: 76,
    heatingDegreeDays: 1600,
    coolingDegreeDays: 2700,
  },
  environmentalStressors: [
    {
      factor: "humidity",
      severity: "extreme" as const,
      description: "Sustained high relative humidity (60-95% RH) across 8-10 months of the year. Summer dewpoints regularly exceed 75°F. Drives mold growth, wood rot, condensation on cold surfaces, and accelerated corrosion of all metal components. The single most impactful environmental factor on Gulf Coast home maintenance.",
      affectedSystems: ["hvac", "roofing", "exterior", "foundation", "plumbing", "electrical", "appliances"],
    },
    {
      factor: "salt_air",
      severity: "high" as const,
      description: "Chloride-laden air within 10 miles of the coastline causes aggressive corrosion on exposed metals. HVAC condenser coils, roof fasteners, electrical connections, and exterior hardware are primary targets. Effect diminishes significantly beyond 5 miles inland but remains measurable to 15-20 miles.",
      affectedSystems: ["hvac", "roofing", "exterior", "electrical", "garage", "pool_spa"],
    },
    {
      factor: "hurricanes_tropical_storms",
      severity: "high" as const,
      description: "Hurricane season June 1 - November 30 with peak activity August 15 - October 15. Gulf Coast is exposed to landfalling storms from the Gulf of Mexico with minimal weakening over warm water. Category 1-5 winds (74-157+ mph), storm surge (3-25+ feet in extreme events), inland flooding from heavy rainfall (10-20+ inches in slow-moving storms). NW Florida Panhandle is historically one of the most hurricane-impacted coastlines in the US (Hurricane Michael 2018 Cat 5, Hurricane Sally 2020 Cat 2, Hurricane Ivan 2004 Cat 3).",
      affectedSystems: ["roofing", "exterior", "foundation", "electrical", "irrigation", "pool_spa", "garage"],
    },
    {
      factor: "termites",
      severity: "high" as const,
      description: "Formosan subterranean termites (most destructive species in US) and Eastern subterranean termites thrive in warm, moist Gulf Coast soil. Year-round activity with swarm season March-June. Formosan colonies can contain millions of individuals and consume wood at rates far exceeding native species. Annual termite bond/warranty is standard practice in the region.",
      affectedSystems: ["foundation", "exterior", "roofing"],
    },
    {
      factor: "lightning",
      severity: "high" as const,
      description: "Gulf Coast has among the highest lightning strike density in the continental US. Northwest Florida averages 80-100+ thunderstorm days per year. Tampa-Orlando corridor is the 'Lightning Capital of North America' but the entire Gulf Coast is extremely active. Lightning is the #1 cause of HVAC compressor failure, electronics damage, and power surge events in the region.",
      affectedSystems: ["electrical", "hvac", "smart_home", "appliances", "pool_spa"],
    },
    {
      factor: "heavy_rainfall",
      severity: "high" as const,
      description: "65+ inches of annual rainfall, often delivered in intense afternoon thunderstorms producing 1-3 inches per hour. Flash flooding common in areas with poor drainage. Challenges roof drainage systems, foundation grading, and crawlspace moisture management. Rain combined with sandy soil creates unique drainage patterns.",
      affectedSystems: ["roofing", "foundation", "plumbing", "irrigation"],
    },
    {
      factor: "uv_exposure",
      severity: "moderate" as const,
      description: "High UV index (8-11) throughout the long summer season accelerates degradation of asphalt roofing, exterior paint, sealants, wood finishes, and plastic components. Roof surface temperatures can reach 150-170°F in direct summer sun.",
      affectedSystems: ["roofing", "exterior", "pool_spa"],
    },
    {
      factor: "sandy_soil",
      severity: "moderate" as const,
      description: "Predominantly sandy soil with low bearing capacity and rapid drainage. Coastal areas may have high water tables. Some inland areas have clay pockets that expand and contract with moisture. Sand provides poor support for traditional foundations but drains well, reducing some hydrostatic pressure concerns. Slab-on-grade is the dominant foundation type.",
      affectedSystems: ["foundation", "septic_well", "irrigation"],
    },
    {
      factor: "hard_water_varies",
      severity: "moderate" as const,
      description: "Water hardness varies significantly by source. Municipal water in coastal cities: typically moderate (80-150 ppm). Well water in inland areas: can be very hard (150-400 ppm) with high iron content. Florida Panhandle well water often has sulfur (rotten egg smell). Water treatment is common on well systems.",
      affectedSystems: ["plumbing", "water_heating", "appliances"],
    },
    {
      factor: "occasional_freeze",
      severity: "moderate" as const,
      description: "Gulf Coast experiences 5-15 nights below 32°F per winter, with occasional hard freeze events (24-28°F for 4+ hours). Homes are NOT built for extreme cold — pipes are in exterior walls and attics without insulation, hose bibs are rarely frost-proof, and heat sources are undersized. A single hard freeze can cause catastrophic pipe bursts because homes lack cold-weather protection. The February 2021 polar vortex caused massive pipe burst damage across the Gulf Coast.",
      affectedSystems: ["plumbing", "hvac", "irrigation", "exterior"],
    },
    {
      factor: "mold",
      severity: "high" as const,
      description: "Warm temperatures + extreme humidity = ideal mold conditions year-round. Mold can begin growing on organic materials within 24-48 hours of moisture exposure. Bathroom exhaust ventilation, HVAC dehumidification, and vapor barriers are critical. Crawlspace mold is extremely common. Post-storm mold remediation is a major secondary damage vector.",
      affectedSystems: ["hvac", "foundation", "exterior", "roofing"],
    },
  ],
  seasonalProfile: {
    spring: {
      months: ["March", "April", "May"],
      conditions: "Rapid warming from 70s to 90s. Humidity rising sharply. Thunderstorm season intensifying. Heavy pollen season (pine, oak). Hurricane prep window opens.",
      priorities: [
        "HVAC cooling system tune-up before summer demand (schedule in March)",
        "Change HVAC filter — heavy pollen clogs filters in 2-3 weeks",
        "Full exterior inspection after mild winter: roof, siding, paint, caulk",
        "Gutter cleaning after pollen season ends (late April)",
        "Termite inspection (annual swarm season peaks March-May)",
        "Test smoke/CO detectors (spring forward time change reminder)",
        "Pressure wash exterior before summer heat makes it miserable",
        "Check irrigation system for winter damage, adjust schedule for spring",
        "Hurricane prep planning: review insurance, check shutters/plywood, stock supplies",
        "Service pool equipment before heavy use season",
      ],
    },
    summer: {
      months: ["June", "July", "August"],
      conditions: "Extreme heat 90-100°F+ with heat index 105-115°F. Very high humidity 80-95% RH. Daily afternoon thunderstorms. Peak hurricane season August-September. HVAC runs 18-24 hours/day.",
      priorities: [
        "HVAC filter change MONTHLY (not quarterly) — maximum dust, pollen, and humidity load",
        "Monitor condensate drain weekly — clogged drains are #1 HVAC service call in summer. Pour 1 cup white vinegar monthly.",
        "Check condensate pump operation if applicable",
        "Run bathroom exhaust fans during and 15 minutes after every shower",
        "Monitor indoor humidity: target 45-55% RH. Whole-house dehumidifier essential.",
        "Inspect attic for moisture, mold, and proper ventilation",
        "Hurricane season active: maintain readiness supplies and check shutters",
        "Check weather stripping and door seals — AC efficiency depends on tight envelope",
        "Water heater: lower thermostat to 120°F if not already (warm inlet water means less heating needed)",
        "Pool chemistry check weekly — hot temps and heavy use demand more attention",
        "Inspect outdoor HVAC unit: clear debris, check for ant nests in disconnect (fire ants love electrical components)",
      ],
    },
    fall: {
      months: ["September", "October", "November"],
      conditions: "Hurricane season continues through November. Temperatures slowly dropping from 90s to 60s. Humidity decreasing. Fall leaf drop begins October. First frost possible late November in Panhandle.",
      priorities: [
        "Post-hurricane inspection if any storm impact (roof, windows, siding, trees)",
        "Roof inspection before winter rain season: check for shingle damage from summer storms",
        "Gutter cleaning after leaf drop (November)",
        "HVAC transition: clean/replace filter, test heating mode before you need it",
        "Caulk and seal exterior gaps before winter (windows, doors, penetrations)",
        "Winterize outdoor faucets: install insulated covers on hose bibs",
        "Service water heater: flush tank, test TPR valve (cooler water demands make this ideal timing)",
        "Test whole-house surge protector — check indicator light",
        "Check dryer vent for lint buildup (fire prevention)",
        "Inspect weather stripping on doors and windows",
        "Fall fertilization for lawn (if applicable) before dormancy",
      ],
    },
    winter: {
      months: ["December", "January", "February"],
      conditions: "Mild 50s-60s°F daytime, 35-45°F overnight. Occasional hard freezes (25-32°F) that last 4-12 hours. Rare extended freeze events. Low humidity relative to summer. Lowest HVAC demand of the year.",
      priorities: [
        "FREEZE PROTOCOL: When overnight lows forecast below 32°F — drip faucets, open cabinet doors, disconnect hoses, cover hose bibs, keep heat at 55°F+ minimum",
        "Know your main water shutoff valve location and verify it works BEFORE you need it",
        "If extended freeze (below 28°F for 6+ hours): drip all faucets (hot and cold), open cabinet doors, consider leaving garage door cracked if water lines run through garage walls",
        "Change HVAC filter (quarterly OK in winter — lower demand)",
        "Check heating system operation — Gulf Coast furnaces sit idle 9 months and may need ignitor cleaning",
        "Test smoke/CO detectors (especially CO — heating season means combustion appliances running)",
        "Inspect attic insulation — visible from access hatch. R-30 minimum recommended for Gulf Coast.",
        "Best time to schedule HVAC replacement: contractors are slowest, pricing is 10-20% lower",
        "Best time to schedule roof inspection/repairs: roofers are available and weather is mild",
        "Water heater maintenance: January is ideal for tank flush and anode rod inspection",
      ],
    },
  },
  buildingCodeNotes: [
    "Florida Building Code (FBC) 8th Edition (2023) governs all FL Gulf Coast construction — one of the most stringent codes in the US",
    "FBC Wind Speed Requirements: 150+ mph design wind speed in coastal Panhandle counties (Escambia through Bay). Inland counties 130-140 mph.",
    "Wind-Borne Debris Region (WBDR): Requires impact-rated windows/doors or approved shutters within 1 mile of coast in HVHZ, varies by county elsewhere",
    "FBC requires roof-to-wall hurricane straps (Simpson H2.5A or equivalent) on all new construction and re-roofing",
    "FBC requires secondary water barrier (sealed roof deck) for re-roofing in HVHZ zones",
    "FBC Energy Code requires R-30 attic insulation (Climate Zone 2A), R-13 wall insulation",
    "IRC Section R301.2.1.2 governs wind speed requirements outside Florida's specific code jurisdiction",
    "Alabama, Mississippi, Louisiana each have their own adoption of IRC with amendments — generally less stringent than FBC but still include wind provisions for coastal counties",
    "All Gulf Coast jurisdictions require GFCI protection per NEC 210.8 in kitchens, bathrooms, garages, outdoors, laundry, crawlspaces, and within 6 feet of sinks",
    "Water heater installations require expansion tanks (where closed systems exist), TPR discharge to within 6 inches of floor or outside, and earthquake strapping is NOT required in Gulf Coast (low seismic risk)",
    "Septic systems governed by county health departments with specific setback, soil testing, and capacity requirements",
  ],
  insuranceConsiderations: [
    "Named storm / hurricane deductible: 2-5% of dwelling value (separate from standard $1000-$2500 deductible). On a $300K home, that's $6K-$15K out of pocket before insurance pays for wind damage.",
    "Flood insurance: REQUIRED in FEMA-designated flood zones (AE, VE, AH zones). NOT included in standard homeowners. NFIP policies or private flood insurance required. Average NFIP premium: $800-$2500/year on Gulf Coast.",
    "Citizens Property Insurance (FL state insurer of last resort): If private insurance unavailable or unaffordable. Has specific inspection requirements and limits.",
    "Four-Point Inspection: Required by most FL insurers for homes 25+ years old. Inspects roof, electrical, plumbing, HVAC. Failed inspection = no insurance or high surcharge.",
    "Wind Mitigation Inspection: Inspects hurricane-resistant features (roof shape, roof-to-wall connections, roof covering, opening protection, secondary water barrier). Can reduce wind premium 10-45%. Cost: $100-$200 for the inspection. ROI is immediate.",
    "Roof age: Many Gulf Coast insurers will not write or renew policies with roofs over 15-20 years old. Some require roof replacement before issuing new policy.",
    "Sinkhole coverage: Important in central FL counties. Not applicable to most Panhandle/coastal areas but check.",
    "Keep Kept vault photos as insurance documentation: timestamped photos of home condition, equipment, and belongings can accelerate claims and prevent disputes.",
    "Document pre-storm condition annually: walk-around video + photos in May before hurricane season. Store in cloud (Kept vault).",
  ],
  weibullZoneKey: "hotHumid",
};

export const seed = internalMutation({
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("regionalProfiles")
      .withIndex("by_key", (q) => q.eq("key", gulfCoastProfile.key))
      .first();
    if (!existing) {
      await ctx.db.insert("regionalProfiles", gulfCoastProfile);
      console.log("Seeded Gulf Coast regional profile");
    } else {
      console.log("Gulf Coast regional profile already exists");
    }
  },
});
