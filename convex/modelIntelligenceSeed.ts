import { mutation } from "./_generated/server";

/**
 * Seed manufacturer and model data
 * Run with: npx convex run modelIntelligenceSeed:seedManufacturers
 */
export const seedManufacturers = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db
      .query("manufacturers")
      .filter((q) => q.eq(q.field("name"), "Carrier"))
      .first();

    if (existing) {
      return { message: "Already seeded" };
    }

    // =========================================
    // HVAC MANUFACTURERS
    // =========================================

    const carrierId = await ctx.db.insert("manufacturers", {
      name: "Carrier",
      aliases: ["Carrier Corporation", "Carrier Global"],
      website: "https://www.carrier.com",
      supportPhone: "1-800-227-7437",
      supportUrl: "https://www.carrier.com/residential/en/us/for-owners/",
      warrantyLookupUrl: "https://www.carrier.com/residential/en/us/for-owners/warranty/",
      categories: ["hvac"],
      isActive: true,
    });

    const traneId = await ctx.db.insert("manufacturers", {
      name: "Trane",
      aliases: ["Trane Technologies", "American Standard"],
      website: "https://www.trane.com",
      supportPhone: "1-800-945-5884",
      supportUrl: "https://www.trane.com/residential/en/for-owners/",
      categories: ["hvac"],
      isActive: true,
    });

    const lennoxId = await ctx.db.insert("manufacturers", {
      name: "Lennox",
      aliases: ["Lennox International", "Lennox Industries"],
      website: "https://www.lennox.com",
      supportPhone: "1-800-953-6669",
      supportUrl: "https://www.lennox.com/owners",
      categories: ["hvac"],
      isActive: true,
    });

    const rheemId = await ctx.db.insert("manufacturers", {
      name: "Rheem",
      aliases: ["Rheem Manufacturing", "Ruud"],
      website: "https://www.rheem.com",
      supportPhone: "1-800-432-8373",
      supportUrl: "https://www.rheem.com/support/",
      categories: ["hvac", "plumbing"],
      isActive: true,
    });

    const goodmanId = await ctx.db.insert("manufacturers", {
      name: "Goodman",
      aliases: ["Goodman Manufacturing", "Amana"],
      website: "https://www.goodmanmfg.com",
      supportPhone: "1-888-593-4822",
      supportUrl: "https://www.goodmanmfg.com/resources/homeowner",
      categories: ["hvac"],
      isActive: true,
    });

    // =========================================
    // PLUMBING MANUFACTURERS
    // =========================================

    const aoSmithId = await ctx.db.insert("manufacturers", {
      name: "A.O. Smith",
      aliases: ["AO Smith", "A O Smith"],
      website: "https://www.hotwater.com",
      supportPhone: "1-800-527-1953",
      supportUrl: "https://www.hotwater.com/support/",
      warrantyLookupUrl: "https://www.hotwater.com/support/warranty/",
      categories: ["plumbing"],
      isActive: true,
    });

    const bradfordWhiteId = await ctx.db.insert("manufacturers", {
      name: "Bradford White",
      aliases: ["Bradford-White"],
      website: "https://www.bradfordwhite.com",
      supportPhone: "1-800-523-2931",
      supportUrl: "https://www.bradfordwhite.com/for-homeowners/",
      categories: ["plumbing"],
      isActive: true,
    });

    const moenId = await ctx.db.insert("manufacturers", {
      name: "Moen",
      aliases: ["Moen Incorporated"],
      website: "https://www.moen.com",
      supportPhone: "1-800-289-6636",
      supportUrl: "https://www.moen.com/customer-support",
      partsLookupUrl: "https://www.moen.com/parts",
      categories: ["plumbing"],
      isActive: true,
    });

    const deltaId = await ctx.db.insert("manufacturers", {
      name: "Delta",
      aliases: ["Delta Faucet", "Delta Faucet Company"],
      website: "https://www.deltafaucet.com",
      supportPhone: "1-800-345-3358",
      supportUrl: "https://www.deltafaucet.com/customer-support",
      partsLookupUrl: "https://www.deltafaucet.com/parts",
      categories: ["plumbing"],
      isActive: true,
    });

    const kohlerPlumbingId = await ctx.db.insert("manufacturers", {
      name: "Kohler",
      aliases: ["Kohler Co."],
      website: "https://www.kohler.com",
      supportPhone: "1-800-456-4537",
      supportUrl: "https://www.kohler.com/en/support",
      partsLookupUrl: "https://www.kohler.com/en/parts",
      categories: ["plumbing"],
      isActive: true,
    });

    // =========================================
    // APPLIANCE MANUFACTURERS
    // =========================================

    const geAppliancesId = await ctx.db.insert("manufacturers", {
      name: "GE Appliances",
      aliases: ["General Electric", "GE", "GE Profile", "Haier"],
      website: "https://www.geappliances.com",
      supportPhone: "1-800-432-2737",
      supportUrl: "https://www.geappliances.com/ge/service-and-support/",
      partsLookupUrl: "https://www.geapplianceparts.com",
      categories: ["appliances"],
      isActive: true,
    });

    const whirlpoolId = await ctx.db.insert("manufacturers", {
      name: "Whirlpool",
      aliases: ["Whirlpool Corporation", "Maytag", "KitchenAid", "Amana"],
      website: "https://www.whirlpool.com",
      supportPhone: "1-866-698-2538",
      supportUrl: "https://www.whirlpool.com/services.html",
      partsLookupUrl: "https://www.whirlpoolparts.com",
      categories: ["appliances"],
      isActive: true,
    });

    const samsungId = await ctx.db.insert("manufacturers", {
      name: "Samsung",
      aliases: ["Samsung Electronics"],
      website: "https://www.samsung.com",
      supportPhone: "1-800-726-7864",
      supportUrl: "https://www.samsung.com/us/support/",
      categories: ["appliances"],
      isActive: true,
    });

    const lgId = await ctx.db.insert("manufacturers", {
      name: "LG",
      aliases: ["LG Electronics", "LG USA"],
      website: "https://www.lg.com",
      supportPhone: "1-800-243-0000",
      supportUrl: "https://www.lg.com/us/support",
      categories: ["appliances"],
      isActive: true,
    });

    // =========================================
    // SERIAL NUMBER PATTERNS
    // =========================================

    // Carrier serial pattern (common format: WWYY######)
    await ctx.db.insert("serialPatterns", {
      manufacturerId: carrierId,
      pattern: "^[0-9]{4}[A-Z0-9]+$",
      description: "Week/Year format - first 2 digits are week, next 2 are year",
      yearPosition: {
        start: 2,
        length: 2,
        format: "year_2digit",
      },
      exampleSerial: "2519A12345",
      exampleDecoded: "Week 25 of 2019",
    });

    // Trane serial pattern (common format: Year letter + Week)
    await ctx.db.insert("serialPatterns", {
      manufacturerId: traneId,
      pattern: "^[A-Z][0-9]{2}[A-Z0-9]+$",
      description: "Year letter (A=2001, B=2002...) followed by week number",
      yearPosition: {
        start: 0,
        length: 1,
        format: "year_letter",
      },
      exampleSerial: "T25B12345",
      exampleDecoded: "2020 (T=20th letter = 2020)",
    });

    // Rheem/Ruud serial pattern
    await ctx.db.insert("serialPatterns", {
      manufacturerId: rheemId,
      pattern: "^[A-Z][0-9]{2}[0-9]{2}[A-Z0-9]+$",
      description: "Month letter + Week + Year digits",
      yearPosition: {
        start: 3,
        length: 2,
        format: "year_2digit",
      },
      monthPosition: {
        start: 0,
        length: 1,
        format: "month_letter",
      },
      exampleSerial: "F0119123456",
      exampleDecoded: "June (F=6th month), 2019",
    });

    // A.O. Smith water heater serial pattern
    await ctx.db.insert("serialPatterns", {
      manufacturerId: aoSmithId,
      pattern: "^[0-9]{4}[A-Z0-9]+$",
      description: "Year (2 digits) + Month (2 digits) at start",
      yearPosition: {
        start: 0,
        length: 2,
        format: "year_2digit",
      },
      monthPosition: {
        start: 2,
        length: 2,
        format: "month_2digit",
      },
      exampleSerial: "1906A123456",
      exampleDecoded: "June 2019",
    });

    return {
      message: "Seeded manufacturer data",
      manufacturers: 13,
      serialPatterns: 4,
    };
  },
});

/**
 * Seed sample model data with known issues
 * Run with: npx convex run modelIntelligenceSeed:seedSampleModels
 */
export const seedSampleModels = mutation({
  args: {},
  handler: async (ctx) => {
    // Get Carrier manufacturer
    const carrier = await ctx.db
      .query("manufacturers")
      .filter((q) => q.eq(q.field("name"), "Carrier"))
      .first();
    
    if (!carrier) {
      return { message: "Run seedManufacturers first" };
    }

    // Get central AC system type
    const centralAc = await ctx.db
      .query("systemTypes")
      .filter((q) => q.eq(q.field("name"), "Central Air Conditioner"))
      .first();
    
    if (!centralAc) {
      return { message: "System types not seeded" };
    }

    // Check if already seeded
    const existingModel = await ctx.db
      .query("modelDatabase")
      .withIndex("by_manufacturer", (q) => q.eq("manufacturerId", carrier._id))
      .first();

    if (existingModel) {
      return { message: "Already seeded" };
    }

    // Add sample Carrier model
    const modelId = await ctx.db.insert("modelDatabase", {
      manufacturerId: carrier._id,
      systemTypeId: centralAc._id,
      modelNumber: "24ACC636A003",
      modelPattern: "^24ACC[0-9]{3}A[0-9]{3}$",
      modelSeries: "Comfort Series",
      productName: "Carrier Comfort 16 Central Air Conditioner",
      description: "16 SEER single-stage central air conditioner",
      yearsProduced: {
        start: 2015,
        end: 2022,
      },
      specs: {
        capacity: "3 Ton",
        efficiency: "16 SEER",
        voltage: "208/230V",
      },
      expectedLifespanYears: 15,
      typicalFailurePoints: [
        "Capacitor failure (common after 8-10 years)",
        "Contactor wear",
        "Refrigerant leaks at service valves",
        "Condenser fan motor",
      ],
      manualUrl: "https://www.carrier.com/residential/en/us/products/air-conditioners/24acc6/",
    });

    // Add known issues for this model
    await ctx.db.insert("modelIssues", {
      modelId,
      issueType: "common_failure",
      severity: "warning",
      title: "Run Capacitor Failure",
      description: "The run capacitor in this model series is known to fail prematurely, especially in hot climates. Symptoms include the unit not starting, humming sounds, or the compressor shutting off shortly after starting.",
      symptoms: [
        "AC won't start, just hums",
        "AC starts but shuts off within seconds",
        "Clicking sounds from outdoor unit",
        "AC runs but doesn't cool effectively",
      ],
      fixDescription: "Replace the run capacitor. This is a common DIY repair if you're comfortable working with electrical components. Always discharge the capacitor before handling.",
      diyPossible: true,
      estimatedCost: {
        diyLow: 15,
        diyHigh: 40,
        proLow: 150,
        proHigh: 300,
      },
      partsNeeded: ["Run capacitor (45/5 MFD 440V typical for this model)"],
      isActive: true,
      verifiedAt: Date.now(),
    });

    await ctx.db.insert("modelIssues", {
      modelId,
      issueType: "maintenance_tip",
      severity: "info",
      title: "Coil Cleaning Frequency",
      description: "The condenser coils on this model are tightly spaced and prone to clogging with debris. Clean the coils at least twice per cooling season for optimal efficiency.",
      symptoms: [],
      fixDescription: "Use a coil cleaner spray and garden hose. Spray cleaner on coils, let sit 5-10 minutes, then rinse thoroughly from inside out. Straighten any bent fins with a fin comb.",
      diyPossible: true,
      estimatedCost: {
        diyLow: 10,
        diyHigh: 25,
        proLow: 100,
        proHigh: 200,
      },
      partsNeeded: ["Coil cleaner spray", "Fin comb (optional)"],
      isActive: true,
      verifiedAt: Date.now(),
    });

    await ctx.db.insert("modelIssues", {
      modelId,
      issueType: "efficiency_tip",
      severity: "info",
      title: "Optimal Thermostat Settings",
      description: "This single-stage unit runs most efficiently when the thermostat is set to a consistent temperature rather than adjusted frequently. Consider a programmable thermostat for better efficiency.",
      symptoms: [],
      fixDescription: "Set thermostat to 78°F when home and 85°F when away. Avoid setting below 72°F as this strains the system and increases energy use significantly.",
      diyPossible: true,
      estimatedCost: {
        diyLow: 0,
        diyHigh: 0,
        proLow: 0,
        proHigh: 0,
      },
      isActive: true,
      verifiedAt: Date.now(),
    });

    // Add common parts
    await ctx.db.insert("modelParts", {
      modelId,
      partNumber: "HC98JA046",
      partName: "Run Capacitor",
      description: "45+5 MFD 440V dual run capacitor for compressor and fan motor",
      isOem: true,
      compatiblePartNumbers: ["CPT00660", "CD45+5X440R"],
      estimatedCostLow: 15,
      estimatedCostHigh: 35,
      typicalReplacementIntervalYears: 8,
      failureIndicators: [
        "Bulging or swollen top",
        "Leaking fluid",
        "Burn marks",
        "Capacitance reading below spec",
      ],
    });

    await ctx.db.insert("modelParts", {
      modelId,
      partNumber: "HN67ZJ003",
      partName: "Contactor",
      description: "Single pole 40A contactor for compressor circuit",
      isOem: true,
      compatiblePartNumbers: ["C140A", "DP40242"],
      estimatedCostLow: 20,
      estimatedCostHigh: 50,
      typicalReplacementIntervalYears: 12,
      failureIndicators: [
        "Pitted or burned contacts",
        "Chattering/buzzing sound",
        "Stuck in closed position",
        "Visible arcing",
      ],
    });

    return {
      message: "Seeded sample model data",
      models: 1,
      issues: 3,
      parts: 2,
    };
  },
});
