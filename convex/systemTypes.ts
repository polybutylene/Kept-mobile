import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("systemTypes").collect();
  },
});

export const getById = query({
  args: { systemTypeId: v.id("systemTypes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.systemTypeId);
  },
});

export const getByKey = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("systemTypes")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
  },
});

export const listByCategory = query({
  args: {
    category: v.union(
      v.literal("hvac"),
      v.literal("plumbing"),
      v.literal("electrical"),
      v.literal("appliances"),
      v.literal("structural"),
      v.literal("exterior")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("systemTypes")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
  },
});

// Seed function to populate system type defaults.
// Only seeds if the table is empty or data is missing key fields.
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("systemTypes").first();
    if (existing && existing.key) return "Already seeded (has key fields)";

    // Weibull parameters calibrated from NAHB/BoA (2007), AHRI field data,
    // ASHRAE equipment life studies, manufacturer warranty data, and field-calibrated
    // domain knowledge (v2.0) for roofing, electrical, and plumbing.
    // Scale (η) is in MONTHS. Southeast US baseline.
    const systemTypes = [
      // ──── HVAC ────────────────────────────────────────────────────────
      {
        key: "hvac_ac",
        category: "hvac" as const,
        name: "Air Conditioner (Central)",
        description: "Central air conditioning split system condenser",
        iconName: "snowflake",
        defaultLifespanYears: 15.5,
        weibullShape: 2.8,
        weibullScale: 186,
        weibullLocation: 12,
        defaultReplacementCostLow: 5500,
        defaultReplacementCostMid: 7500,
        defaultReplacementCostHigh: 16000,
      },
      {
        key: "hvac_furnace",
        category: "hvac" as const,
        name: "Furnace",
        description: "Gas or electric furnace — heat exchanger is critical long-life component",
        iconName: "flame",
        defaultLifespanYears: 20,
        weibullShape: 3.5,
        weibullScale: 240,
        weibullLocation: 24,
        defaultReplacementCostLow: 6000,
        defaultReplacementCostMid: 8000,
        defaultReplacementCostHigh: 17000,
      },
      {
        key: "heat_pump",
        category: "hvac" as const,
        name: "Heat Pump System",
        description: "Dual-mode heat pump — runs year-round for heating AND cooling. 2-3× compressor hours vs AC-only.",
        iconName: "arrow.left.arrow.right",
        defaultLifespanYears: 13.5,
        weibullShape: 2.5,
        weibullScale: 162,       // 13.5yr × 12mo — doubled duty reduces life
        weibullLocation: 12,
        defaultReplacementCostLow: 6500,
        defaultReplacementCostMid: 8500,
        defaultReplacementCostHigh: 20000,
      },
      // ──── WATER HEATERS ───────────────────────────────────────────────
      {
        key: "water_heater_tank",
        category: "plumbing" as const,
        name: "Water Heater (Tank)",
        description: "Traditional tank water heater — anode rod depletion is primary failure driver",
        iconName: "drop.fill",
        defaultLifespanYears: 11.5,
        weibullShape: 3.0,
        weibullScale: 138,
        weibullLocation: 6,
        defaultReplacementCostLow: 1200,
        defaultReplacementCostMid: 1800,
        defaultReplacementCostHigh: 3000,
      },
      {
        key: "water_heater_tankless",
        category: "plumbing" as const,
        name: "Water Heater (Tankless)",
        description: "On-demand tankless water heater — requires annual descaling in hard water",
        iconName: "drop.fill",
        defaultLifespanYears: 18,
        weibullShape: 2.5,
        weibullScale: 216,
        weibullLocation: 12,
        defaultReplacementCostLow: 2800,
        defaultReplacementCostMid: 3500,
        defaultReplacementCostHigh: 6000,
      },
      // ──── ROOFING ─────────────────────────────────────────────────────
      {
        key: "roof_shingle",
        category: "structural" as const,
        name: "Roof (3-Tab Shingle)",
        description: "Asphalt 3-tab shingles — SE heat/UV cuts lifespan 25-35% vs northern baselines. Declining market share post-2010.",
        iconName: "house.fill",
        defaultLifespanYears: 17,
        weibullShape: 3.2,       // Strong wear-out from UV + granule loss
        weibullScale: 204,       // 17yr × 12mo — SE Gulf Coast baseline
        weibullLocation: 24,
        defaultReplacementCostLow: 8500,
        defaultReplacementCostMid: 11000,
        defaultReplacementCostHigh: 14000,
      },
      {
        key: "roof_architectural",
        category: "structural" as const,
        name: "Roof (Architectural Shingle)",
        description: "Dimensional/laminate shingles — thicker, wind-rated 110-130 mph. SE US default since ~2010.",
        iconName: "house.fill",
        defaultLifespanYears: 22,
        weibullShape: 2.8,       // Delamination adds mid-life failure mode
        weibullScale: 264,       // 22yr × 12mo
        weibullLocation: 36,
        defaultReplacementCostLow: 10000,
        defaultReplacementCostMid: 14000,
        defaultReplacementCostHigh: 18000,
      },
      {
        key: "roof_tile",
        category: "structural" as const,
        name: "Roof (Clay/Concrete Tile)",
        description: "Tile roof — tiles last 35-45yr but underlayment beneath fails at 20-30yr. Two-layer system most homeowners don't understand.",
        iconName: "house.fill",
        defaultLifespanYears: 40,
        weibullShape: 2.0,       // Underlayment-driven; tiles themselves are very durable
        weibullScale: 480,       // 40yr avg × 12mo (clay 45, concrete 35)
        weibullLocation: 60,
        defaultReplacementCostLow: 15000,
        defaultReplacementCostMid: 22500,
        defaultReplacementCostHigh: 30000,
      },
      {
        key: "roof_metal",
        category: "structural" as const,
        name: "Roof (Metal Standing Seam)",
        description: "Standing seam metal roof — very flat hazard curve. Concealed fasteners >> exposed. Insurance discounts 15-25% in FL/Gulf Coast.",
        iconName: "house.fill",
        defaultLifespanYears: 45,
        weibullShape: 1.8,       // Flat hazard: installation defects (early) or sealant degradation (late)
        weibullScale: 540,       // 45yr × 12mo
        weibullLocation: 60,
        defaultReplacementCostLow: 14000,
        defaultReplacementCostMid: 21000,
        defaultReplacementCostHigh: 28000,
      },
      {
        key: "roof_flat",
        category: "structural" as const,
        name: "Roof (Flat/Low-Slope)",
        description: "TPO, EPDM, or modified bitumen flat roof — ponding water is universal accelerant. Track separately from sloped sections.",
        iconName: "house.fill",
        defaultLifespanYears: 18,
        weibullShape: 3.0,       // TPO baseline; seam welds are #1 failure
        weibullScale: 216,       // 18yr × 12mo
        weibullLocation: 12,
        defaultReplacementCostLow: 6000,
        defaultReplacementCostMid: 10000,
        defaultReplacementCostHigh: 14000,
      },
      // ──── PLUMBING — SUPPLY ───────────────────────────────────────────
      {
        key: "plumbing_main",
        category: "plumbing" as const,
        name: "Plumbing Supply (Copper)",
        description: "Copper supply lines — wire rarely fails; connections, junction boxes, and insulation are failure points.",
        iconName: "pipe.and.drop",
        defaultLifespanYears: 50,
        weibullShape: 2.5,
        weibullScale: 600,       // 50yr × 12mo
        weibullLocation: 60,
        defaultReplacementCostLow: 5000,
        defaultReplacementCostMid: 8500,
        defaultReplacementCostHigh: 12000,
      },
      {
        key: "plumbing_cpvc",
        category: "plumbing" as const,
        name: "Plumbing Supply (CPVC)",
        description: "CPVC supply lines — becomes brittle with age, SHATTERS rather than leaks. Common in SE homes 1985-2010. More failure-prone than expected.",
        iconName: "pipe.and.drop",
        defaultLifespanYears: 22,
        weibullShape: 3.5,       // High β = clear aging; brittleness is predictable
        weibullScale: 264,       // 22yr × 12mo
        weibullLocation: 24,
        defaultReplacementCostLow: 4500,
        defaultReplacementCostMid: 7000,
        defaultReplacementCostHigh: 10000,
      },
      {
        key: "plumbing_galvanized",
        category: "plumbing" as const,
        name: "Plumbing Supply (Galvanized)",
        description: "Galvanized steel supply — corrodes inside-out. Progressive pressure reduction before leaks. Any galvanized > 40yr = approaching full failure.",
        iconName: "pipe.and.drop",
        defaultLifespanYears: 40,
        weibullShape: 3.5,
        weibullScale: 480,       // 40yr × 12mo
        weibullLocation: 60,
        defaultReplacementCostLow: 5500,
        defaultReplacementCostMid: 8500,
        defaultReplacementCostHigh: 12000,
      },
      {
        key: "plumbing_polybutylene",
        category: "plumbing" as const,
        name: "⚠️ Plumbing Supply (Polybutylene)",
        description: "CRITICAL SAFETY GOTCHA: Polybutylene degrades from inside with chlorinated water. Cascading failures once started. 6-10M homes affected (1978-1995). FULL REPIPE is the ONLY recommendation.",
        iconName: "exclamationmark.triangle.fill",
        defaultLifespanYears: 23,
        weibullShape: 4.0,       // Very steep β — cascading failures cluster
        weibullScale: 276,       // 23yr × 12mo
        weibullLocation: 24,
        defaultReplacementCostLow: 5000,
        defaultReplacementCostMid: 8500,
        defaultReplacementCostHigh: 12000,
      },
      // ──── PLUMBING — DRAIN & SEWER ────────────────────────────────────
      {
        key: "plumbing_drain",
        category: "plumbing" as const,
        name: "Drain Lines (Cast Iron)",
        description: "Cast iron drain lines — tuberculation, pitting, hub joint cracks. Below-slab degrades faster in high water tables.",
        iconName: "arrow.down.circle",
        defaultLifespanYears: 45,
        weibullShape: 3.0,
        weibullScale: 540,       // avg of above-grade (50yr) and below-slab (40yr)
        weibullLocation: 60,
        defaultReplacementCostLow: 8000,
        defaultReplacementCostMid: 12000,
        defaultReplacementCostHigh: 25000,
      },
      {
        key: "sewer_line",
        category: "plumbing" as const,
        name: "Main Sewer Line",
        description: "Sewer line from home to street — material varies (PVC, cast iron, clay, Orangeburg). Root intrusion and ground settling are primary issues.",
        iconName: "arrow.down.circle",
        defaultLifespanYears: 40,
        weibullShape: 2.5,
        weibullScale: 480,       // Material-dependent; clay/Orangeburg much shorter
        weibullLocation: 60,
        defaultReplacementCostLow: 3000,
        defaultReplacementCostMid: 8000,
        defaultReplacementCostHigh: 15000,
      },
      // ──── ELECTRICAL ──────────────────────────────────────────────────
      {
        key: "electrical_panel",
        category: "electrical" as const,
        name: "Electrical Panel",
        description: "Main breaker panel (Square D, Siemens, Eaton, GE). ⚠️ Federal Pacific / Zinsco / Pushmatic panels require IMMEDIATE replacement regardless of age.",
        iconName: "bolt.fill",
        defaultLifespanYears: 38,
        weibullShape: 2.2,
        weibullScale: 456,       // 38yr × 12mo (quality manufacturers; coastal: 30yr/360mo)
        weibullLocation: 60,
        defaultReplacementCostLow: 2000,
        defaultReplacementCostMid: 3500,
        defaultReplacementCostHigh: 6500,
      },
      {
        key: "electrical_wiring",
        category: "electrical" as const,
        name: "Electrical Wiring",
        description: "Home electrical wiring (copper post-1970s). ⚠️ Aluminum wiring (1965-1976) and knob-and-tube (pre-1950) are critical safety concerns.",
        iconName: "cable.connector",
        defaultLifespanYears: 55,
        weibullShape: 1.8,       // Wire rarely fails; connections and insulation are failure points
        weibullScale: 660,       // 55yr × 12mo
        weibullLocation: 120,
        defaultReplacementCostLow: 8000,
        defaultReplacementCostMid: 12000,
        defaultReplacementCostHigh: 22000,
      },
      // ──── PLUMBING — OTHER ────────────────────────────────────────────
      {
        key: "septic_system",
        category: "plumbing" as const,
        name: "Septic System",
        description: "Residential septic tank and drain field",
        iconName: "drop.triangle",
        defaultLifespanYears: 30,
        weibullShape: 2.0,
        weibullScale: 360,
        weibullLocation: 60,
        defaultReplacementCostLow: 5000,
        defaultReplacementCostMid: 8000,
        defaultReplacementCostHigh: 15000,
      },
      {
        key: "well_pump",
        category: "plumbing" as const,
        name: "Well Pump",
        description: "Water well pump system",
        iconName: "arrow.up.circle",
        defaultLifespanYears: 12,
        weibullShape: 3.5,
        weibullScale: 144,
        weibullLocation: 12,
        defaultReplacementCostLow: 1500,
        defaultReplacementCostMid: 2500,
        defaultReplacementCostHigh: 4000,
      },
      // ──── APPLIANCES (calibrated with Gulf Coast humidity adjustments) ──
      {
        key: "appliance_dishwasher",
        category: "appliances" as const,
        name: "Dishwasher",
        description: "Built-in dishwasher. #1 life-extending task: clean filter basket monthly. Pump motor + control board are primary failures.",
        iconName: "dishwasher",
        defaultLifespanYears: 11,
        weibullShape: 2.0,       // Mixed failure modes
        weibullScale: 132,       // 11yr × 12mo
        weibullLocation: 6,
        defaultReplacementCostLow: 500,
        defaultReplacementCostMid: 900,
        defaultReplacementCostHigh: 1300,
      },
      {
        key: "appliance_washer",
        category: "appliances" as const,
        name: "Washing Machine",
        description: "Clothes washer. Front-load: 9-12yr, bearing failure is expensive. Top-load: 12-14yr, transmission is expensive. #1 task: avoid overloading.",
        iconName: "washer",
        defaultLifespanYears: 12,
        weibullShape: 2.2,       // Front-load ages faster
        weibullScale: 144,       // 12yr avg × 12mo
        weibullLocation: 6,
        defaultReplacementCostLow: 550,
        defaultReplacementCostMid: 1100,
        defaultReplacementCostHigh: 1600,
      },
      {
        key: "appliance_dryer",
        category: "appliances" as const,
        name: "Dryer",
        description: "Clothes dryer (electric or gas). #1 task: clean FULL exhaust vent duct annually — restricted venting is a leading cause of house fires.",
        iconName: "dryer",
        defaultLifespanYears: 15,
        weibullShape: 1.9,       // Long life if venting is maintained
        weibullScale: 180,       // 15yr × 12mo
        weibullLocation: 6,
        defaultReplacementCostLow: 500,
        defaultReplacementCostMid: 1000,
        defaultReplacementCostHigh: 1400,
      },
      {
        key: "appliance_refrigerator",
        category: "appliances" as const,
        name: "Refrigerator",
        description: "Kitchen refrigerator. Standard top/bottom: 14-17yr. French door: 11-14yr. #1 task: vacuum condenser coils every 6-12mo (quarterly with pets).",
        iconName: "refrigerator",
        defaultLifespanYears: 16,
        weibullShape: 1.8,       // Mixed failure modes
        weibullScale: 192,       // 16yr avg × 12mo
        weibullLocation: 12,
        defaultReplacementCostLow: 900,
        defaultReplacementCostMid: 2200,
        defaultReplacementCostHigh: 3500,
      },
      {
        key: "garbage_disposal",
        category: "appliances" as const,
        name: "Garbage Disposal",
        description: "In-sink garbage disposal. ⅓ HP units last ~8yr; ¾+ HP last ~12yr. Almost always replace-not-repair due to low installed cost.",
        iconName: "drop.circle",
        defaultLifespanYears: 11,
        weibullShape: 2.5,
        weibullScale: 132,       // 11yr × 12mo
        weibullLocation: 6,
        defaultReplacementCostLow: 200,
        defaultReplacementCostMid: 400,
        defaultReplacementCostHigh: 600,
      },
      {
        key: "range_oven",
        category: "appliances" as const,
        name: "Range / Oven",
        description: "Kitchen range or oven (gas or electric). Gas: 15-18yr. Electric: 13-16yr. Igniters and elements are common low-cost repairs.",
        iconName: "oven.fill",
        defaultLifespanYears: 17,
        weibullShape: 1.6,       // Flat failure curve; components fail individually
        weibullScale: 204,       // 17yr avg × 12mo
        weibullLocation: 12,
        defaultReplacementCostLow: 700,
        defaultReplacementCostMid: 1800,
        defaultReplacementCostHigh: 2800,
      },
      // ──── EXTERIOR (calibrated for Gulf Coast) ────────────────────────
      {
        key: "garage_door",
        category: "exterior" as const,
        name: "Garage Door & Opener",
        description: "Garage door panel (20-30yr), opener (10-15yr), springs (7-12yr). Spring breakage is most common service call and a safety hazard.",
        iconName: "door.garage.closed",
        defaultLifespanYears: 25,
        weibullShape: 2.0,       // Door panel life
        weibullScale: 300,       // 25yr × 12mo
        weibullLocation: 12,
        defaultReplacementCostLow: 1000,
        defaultReplacementCostMid: 2000,
        defaultReplacementCostHigh: 3500,
      },
      {
        key: "exterior_paint",
        category: "exterior" as const,
        name: "Exterior Paint",
        description: "Exterior paint. Gulf Coast wood substrate: 5-8yr. Fiber cement: 8-12yr. Repaint when chalking begins, before peeling — peeling increases prep cost 40-60%.",
        iconName: "paintbrush.fill",
        defaultLifespanYears: 7,
        weibullShape: 3.0,       // Clear aging pattern (UV/weather driven)
        weibullScale: 84,        // 7yr × 12mo (wood, Gulf Coast baseline)
        weibullLocation: 6,
        defaultReplacementCostLow: 3000,
        defaultReplacementCostMid: 5000,
        defaultReplacementCostHigh: 8000,
      },
      {
        key: "windows",
        category: "structural" as const,
        name: "Windows",
        description: "Residential windows. IGU seal failure (fogging) = primary failure at 15-25yr. Impact-rated windows offer 15-40% insurance premium discounts in FL/Gulf Coast.",
        iconName: "window.vertical.open",
        defaultLifespanYears: 20,
        weibullShape: 2.2,       // IGU seal is the failure point
        weibullScale: 240,       // 20yr × 12mo (seal life; frame lasts 30+yr)
        weibullLocation: 60,
        defaultReplacementCostLow: 400,
        defaultReplacementCostMid: 700,
        defaultReplacementCostHigh: 1800,
      },
      {
        key: "siding_vinyl",
        category: "exterior" as const,
        name: "Siding (Vinyl)",
        description: "Vinyl exterior siding. Warping from heat, impact cracking, wind uplift at seams. 25-40yr lifespan.",
        iconName: "rectangle.split.3x3",
        defaultLifespanYears: 32,
        weibullShape: 2.5,
        weibullScale: 384,       // 32yr × 12mo
        weibullLocation: 60,
        defaultReplacementCostLow: 8000,
        defaultReplacementCostMid: 12000,
        defaultReplacementCostHigh: 18000,
      },
      {
        key: "sump_pump",
        category: "exterior" as const,
        name: "Sump Pump",
        description: "Sump pump system. Float switch + motor burnout are primary failures. Battery backup ESSENTIAL in Gulf Coast — storm outages coincide with peak water events.",
        iconName: "arrow.up.arrow.down",
        defaultLifespanYears: 9,
        weibullShape: 2.5,
        weibullScale: 108,       // 9yr × 12mo
        weibullLocation: 6,
        defaultReplacementCostLow: 500,
        defaultReplacementCostMid: 1000,
        defaultReplacementCostHigh: 1500,
      },
      {
        key: "driveway",
        category: "exterior" as const,
        name: "Driveway",
        description: "Driveway surface. Concrete: 25-40yr. Asphalt: 15-25yr (sealcoat every 3-5yr extends life 40-60%). SE expansive clay soils drive settlement cracking.",
        iconName: "road.lanes",
        defaultLifespanYears: 24,
        weibullShape: 2.0,
        weibullScale: 288,       // 24yr avg × 12mo
        weibullLocation: 60,
        defaultReplacementCostLow: 4000,
        defaultReplacementCostMid: 6000,
        defaultReplacementCostHigh: 12000,
      },
      {
        key: "gutters",
        category: "exterior" as const,
        name: "Gutters & Downspouts",
        description: "Gutter system. Aluminum: 20-30yr. 6\" K-style is Gulf Coast standard (4\" undersized for downpours). #1 correctable contributor to foundation and siding water damage.",
        iconName: "cloud.rain",
        defaultLifespanYears: 22,
        weibullShape: 2.0,
        weibullScale: 264,       // 22yr × 12mo (aluminum)
        weibullLocation: 12,
        defaultReplacementCostLow: 1200,
        defaultReplacementCostMid: 2000,
        defaultReplacementCostHigh: 3500,
      },
      {
        key: "fence",
        category: "exterior" as const,
        name: "Fence",
        description: "Property fencing. Wood PT pine: 10-18yr SE (posts rot at grade in 5-8yr w/o concrete footer). Vinyl: 20-30yr. Aluminum: 20-40yr.",
        iconName: "rectangle.split.3x1",
        defaultLifespanYears: 14,
        weibullShape: 2.5,
        weibullScale: 168,       // 14yr × 12mo (PT pine SE baseline)
        weibullLocation: 12,
        defaultReplacementCostLow: 2000,
        defaultReplacementCostMid: 4000,
        defaultReplacementCostHigh: 8000,
      },
    ];

    for (const st of systemTypes) {
      await ctx.db.insert("systemTypes", st);
    }

    return `Seeded ${systemTypes.length} system types`;
  },
});
