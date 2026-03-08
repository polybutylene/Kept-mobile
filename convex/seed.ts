import { mutation } from "./_generated/server";
import { allMaintenanceTemplates } from "./data/maintenanceTemplates";
import { allSystemIssues } from "./data/systemIssues";
import { allClimateModifiers } from "./data/climateModifiers";
import { allPreventativeCareGuidelines } from "./data/preventativeCare";
import { getRegionalMultiplierSeedData, REGIONAL_CATEGORIES } from "./data/regionalCostMultipliers";

/**
 * Seed the database with system types, maintenance templates, and feature flags
 * Run once after deployment: npx convex run seed:seedAll
 */

export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existingTypes = await ctx.db.query("systemTypes").first();
    if (existingTypes) {
      console.log("Database already seeded, skipping...");
      return { success: true, message: "Already seeded" };
    }

    // Seed system types
    const systemTypeIds = await seedSystemTypes(ctx);
    
    // Seed maintenance templates
    await seedMaintenanceTemplates(ctx, systemTypeIds);
    
    // Seed feature flags
    await seedFeatureFlags(ctx);

    return { success: true, message: "Database seeded successfully" };
  },
});

/**
 * Seed products and questions for Service Call Companion
 * Run after seedAll: npx convex run seed:seedServiceCallData
 */
export const seedServiceCallData = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existingQuestions = await ctx.db.query("technicianQuestions").first();
    if (existingQuestions) {
      console.log("Service call data already seeded, skipping...");
      return { success: true, message: "Already seeded" };
    }

    // Get system type IDs
    const systemTypes = await ctx.db.query("systemTypes").collect();
    const systemTypeMap: Record<string, any> = {};
    for (const st of systemTypes) {
      systemTypeMap[st.name] = st._id;
    }

    // Seed technician questions
    await seedTechnicianQuestions(ctx, systemTypeMap);

    // Seed products
    await seedProducts(ctx, systemTypeMap);

    return { success: true, message: "Service call data seeded successfully" };
  },
});

/**
 * Seed comprehensive maintenance templates and system issues.
 * Safe to run multiple times; will replace existing template + issue data.
 * Run: npx convex run seed:seedMaintenanceLibrary
 */
export const seedMaintenanceLibrary = mutation({
  args: {},
  handler: async (ctx) => {
    // Build system type name -> id map
    const systemTypes = await ctx.db.query("systemTypes").collect();
    const systemTypeMap: Record<string, any> = {};
    for (const st of systemTypes) {
      systemTypeMap[st.name] = st._id;
    }

    // Wipe existing maintenance templates and issues to avoid duplicates
    const existingTemplates = await ctx.db.query("maintenanceTaskTemplates").collect();
    for (const t of existingTemplates) {
      await ctx.db.delete(t._id);
    }

    const existingIssues = await ctx.db.query("issuesBySystemType").collect();
    for (const i of existingIssues) {
      await ctx.db.delete(i._id);
    }

    // Insert maintenance templates
    for (const template of allMaintenanceTemplates) {
      const systemTypeId = systemTypeMap[template.systemTypeName];
      if (!systemTypeId) {
        console.warn(`Missing system type for template: ${template.systemTypeName}`);
        continue;
      }

      await ctx.db.insert("maintenanceTaskTemplates", {
        systemTypeId,
        name: template.name,
        description: template.description,
        quickSkim: template.quickSkim,
        frequencyMonths: template.frequencyMonths,
        priority: template.priority,
        difficulty: template.difficulty,
        estimatedTimeMinutes: template.estimatedTimeMinutes,
        diyCostLow: template.diyCostLow,
        diyCostHigh: template.diyCostHigh,
        proCostLow: template.proCostLow,
        proCostHigh: template.proCostHigh,
        diySteps: template.diySteps,
        commonMistakes: template.commonMistakes,
        whenToCallPro: template.whenToCallPro,
        healthImpactIfSkipped: template.healthImpactIfSkipped,
        seasonPreference: template.seasonPreference,
        optimalMonths: template.optimalMonths,
        requiredTools: template.requiredTools,
        requiredMaterials: template.requiredMaterials,
        safetyWarnings: template.safetyWarnings,
        safetyLevel: template.safetyLevel,
        deepDiveContent: template.deepDiveContent,
        urgencyByAge: template.urgencyByAge,
      });
    }

    // Insert system issues
    for (const issue of allSystemIssues) {
      const systemTypeId = systemTypeMap[issue.systemTypeName];
      if (!systemTypeId) {
        console.warn(`Missing system type for issue: ${issue.systemTypeName}`);
        continue;
      }

      await ctx.db.insert("issuesBySystemType", {
        systemTypeId,
        issueName: issue.issueName,
        description: issue.description,
        baseOccurrenceRate: issue.baseOccurrenceRate,
        weibullShape: issue.weibullShape,
        weibullScale: issue.weibullScale,
        symptoms: issue.symptoms,
        earlyWarningSigns: issue.earlyWarningSigns,
        severity: issue.severity,
        repairCostLow: issue.repairCostLow,
        repairCostHigh: issue.repairCostHigh,
        isDiyFixable: issue.isDiyFixable,
        diyDifficulty: issue.diyDifficulty,
        diyFixSteps: issue.diyFixSteps,
        preventionTips: issue.preventionTips,
        relatedMaintenanceTasks: issue.relatedMaintenanceTasks,
        preventionEffectiveness: issue.preventionEffectiveness,
        sortOrder: issue.sortOrder,
        isActive: true,
      });
    }

    return {
      success: true,
      message: "Maintenance templates and issues seeded successfully",
      templatesInserted: allMaintenanceTemplates.length,
      issuesInserted: allSystemIssues.length,
    };
  },
});

/**
 * Seed climate modifiers and preventative care guidelines.
 * Safe to run multiple times; will replace existing data.
 * Run: npx convex run seed:seedSystemProfiles
 */
export const seedSystemProfiles = mutation({
  args: {},
  handler: async (ctx) => {
    // Build system type name -> id map
    const systemTypes = await ctx.db.query("systemTypes").collect();
    const systemTypeMap: Record<string, any> = {};
    for (const st of systemTypes) {
      systemTypeMap[st.name] = st._id;
    }

    // Wipe existing climate modifiers to avoid duplicates
    const existingModifiers = await ctx.db.query("climateModifiers").collect();
    for (const m of existingModifiers) {
      await ctx.db.delete(m._id);
    }

    // Wipe existing preventative care guidelines
    const existingGuidelines = await ctx.db.query("preventativeCareGuidelines").collect();
    for (const g of existingGuidelines) {
      await ctx.db.delete(g._id);
    }

    // Insert climate modifiers
    let modifiersInserted = 0;
    for (const modifier of allClimateModifiers) {
      const systemTypeId = systemTypeMap[modifier.systemTypeName];
      if (!systemTypeId) {
        console.warn(`Missing system type for climate modifier: ${modifier.systemTypeName}`);
        continue;
      }

      await ctx.db.insert("climateModifiers", {
        climateZoneId: modifier.climateZoneId,
        climateZoneName: modifier.climateZoneName,
        systemTypeId,
        regions: modifier.regions,
        climateFactors: modifier.climateFactors,
        impactDescription: modifier.impactDescription,
        lifespanModifierPercent: modifier.lifespanModifierPercent,
        adjustedLifespanMin: modifier.adjustedLifespanMin,
        adjustedLifespanMax: modifier.adjustedLifespanMax,
        adjustedLifespanMedian: modifier.adjustedLifespanMedian,
        weibullScaleAdjustment: modifier.weibullScaleAdjustment,
        adjustedWeibullScale: modifier.adjustedWeibullScale,
        weibullShapeNotes: modifier.weibullShapeNotes,
        maintenanceAdjustments: modifier.maintenanceAdjustments,
        additionalTasks: modifier.additionalTasks,
        additionalGuidelines: modifier.additionalGuidelines,
        troubleshootingAdjustments: modifier.troubleshootingAdjustments,
        isActive: true,
      });
      modifiersInserted++;
    }

    // Insert preventative care guidelines
    let guidelinesInserted = 0;
    for (const guideline of allPreventativeCareGuidelines) {
      const systemTypeId = systemTypeMap[guideline.systemTypeName];
      if (!systemTypeId) {
        console.warn(`Missing system type for guideline: ${guideline.systemTypeName}`);
        continue;
      }

      await ctx.db.insert("preventativeCareGuidelines", {
        systemTypeId,
        guidelineId: guideline.guidelineId,
        name: guideline.name,
        description: guideline.description,
        lifespanExtensionEstimate: guideline.lifespanExtensionEstimate,
        costCategory: guideline.costCategory,
        costEstimate: guideline.costEstimate,
        implementationNotes: guideline.implementationNotes,
        sortOrder: guideline.sortOrder,
        isActive: true,
      });
      guidelinesInserted++;
    }

    return {
      success: true,
      message: "System profiles seeded successfully",
      climateModifiersInserted: modifiersInserted,
      preventativeCareGuidelinesInserted: guidelinesInserted,
    };
  },
});

/**
 * Seed regional cost multipliers from the Kept Price Index.
 * Run: npx convex run seed:seedRegionalCosts
 */
export const seedRegionalCosts = mutation({
  args: {},
  handler: async (ctx) => {
    // Clear existing regional multipliers
    const existing = await ctx.db.query("regionalCostMultipliers").collect();
    for (const row of existing) {
      await ctx.db.delete(row._id);
    }

    const entries = getRegionalMultiplierSeedData();
    let inserted = 0;
    const now = Date.now();

    for (const entry of entries) {
      for (const category of REGIONAL_CATEGORIES) {
        await ctx.db.insert("regionalCostMultipliers", {
          state: entry.state,
          systemCategory: category,
          multiplier: entry.multiplier,
          laborMultiplier: entry.laborMultiplier,
          partsMultiplier: entry.partsMultiplier,
          confidence: "high",
          sampleCount: 0,
          lastUpdated: now,
        });
        inserted++;
      }
    }

    return { success: true, inserted };
  },
});

async function seedSystemTypes(ctx: any) {
  const systemTypes = [
    // HVAC
    {
      category: "hvac" as const,
      name: "Central Air Conditioner",
      description: "Central cooling system with outdoor condenser and indoor evaporator coil",
      defaultLifespanYears: 16,
      weibullShape: 2.8,
      weibullScale: 16.5,
      defaultReplacementCostLow: 3300,
      defaultReplacementCostMid: 6900,
      defaultReplacementCostHigh: 12800,
      maintenanceImpactFactor: 1.15,
      sortOrder: 1,
      isActive: true,
    },
    {
      category: "hvac" as const,
      name: "Gas Furnace",
      description: "Natural gas-powered heating system with heat exchanger and blower",
      defaultLifespanYears: 19,
      weibullShape: 3.5,
      weibullScale: 22.0,
      defaultReplacementCostLow: 2100,
      defaultReplacementCostMid: 5100,
      defaultReplacementCostHigh: 9600,
      maintenanceImpactFactor: 1.1,
      sortOrder: 2,
      isActive: true,
    },
    {
      category: "hvac" as const,
      name: "Heat Pump",
      description: "Combined heating and cooling system using refrigerant cycle",
      defaultLifespanYears: 16,
      weibullShape: 2.5,
      weibullScale: 15.0,
      defaultReplacementCostLow: 3700,
      defaultReplacementCostMid: 8700,
      defaultReplacementCostHigh: 19000,
      maintenanceImpactFactor: 1.2,
      sortOrder: 3,
      isActive: true,
    },
    {
      category: "hvac" as const,
      name: "Ductwork",
      description: "Air distribution system including supply and return ducts",
      defaultLifespanYears: 20,
      weibullShape: 2.0,
      weibullScale: 18.0,
      defaultReplacementCostLow: 800,
      defaultReplacementCostMid: 5600,
      defaultReplacementCostHigh: 13000,
      maintenanceImpactFactor: 1.0,
      sortOrder: 4,
      isActive: true,
    },
    {
      category: "hvac" as const,
      name: "Thermostat",
      description: "Temperature control device (smart or programmable)",
      defaultLifespanYears: 9,
      weibullShape: 1.8,
      weibullScale: 9.0,
      defaultReplacementCostLow: 160,
      defaultReplacementCostMid: 315,
      defaultReplacementCostHigh: 450,
      maintenanceImpactFactor: 1.0,
      sortOrder: 5,
      isActive: true,
    },

    // PLUMBING
    {
      category: "plumbing" as const,
      name: "Water Heater (Tank)",
      description: "Traditional storage tank water heater (electric). β=3.0 reflects wear-out failure: progressive tank corrosion once anode rod is consumed, element calcification, thermostat drift. η=11 years represents characteristic life under national baseline conditions (moderate hardness 60-120 ppm, 50 gal/day draw, 120°F setpoint, no proactive anode replacement). At 11 years ~63.2% of units will have failed. Consequential damage potential: Critical ($10K-$50K+ water damage from tank rupture).",
      defaultLifespanYears: 11,
      weibullShape: 3.2,
      weibullScale: 12.0,
      defaultReplacementCostLow: 780,
      defaultReplacementCostMid: 1600,
      defaultReplacementCostHigh: 3000,
      maintenanceImpactFactor: 1.25,
      sortOrder: 10,
      isActive: true,
    },
    {
      category: "plumbing" as const,
      name: "Water Heater (Tankless)",
      description: "On-demand water heating system without storage tank",
      defaultLifespanYears: 20,
      weibullShape: 2.5,
      weibullScale: 22.0,
      defaultReplacementCostLow: 1900,
      defaultReplacementCostMid: 3400,
      defaultReplacementCostHigh: 5400,
      maintenanceImpactFactor: 1.15,
      sortOrder: 11,
      isActive: true,
    },
    {
      category: "plumbing" as const,
      name: "Water Softener",
      description: "Ion-exchange system for reducing water hardness",
      defaultLifespanYears: 16,
      weibullShape: 2.5,
      weibullScale: 14.0,
      defaultReplacementCostLow: 600,
      defaultReplacementCostMid: 2700,
      defaultReplacementCostHigh: 6500,
      maintenanceImpactFactor: 1.1,
      sortOrder: 12,
      isActive: true,
    },
    {
      category: "plumbing" as const,
      name: "Main Sewer Line",
      description: "Primary drainage pipe from home to municipal sewer or septic",
      defaultLifespanYears: 33,
      weibullShape: 2.8,
      weibullScale: 55.0,
      defaultReplacementCostLow: 2500,
      defaultReplacementCostMid: 9750,
      defaultReplacementCostHigh: 23000,
      maintenanceImpactFactor: 1.0,
      sortOrder: 13,
      isActive: true,
    },
    {
      category: "plumbing" as const,
      name: "Garbage Disposal",
      description: "Electric food waste grinder installed in kitchen sink",
      defaultLifespanYears: 10,
      weibullShape: 2.2,
      weibullScale: 11.0,
      defaultReplacementCostLow: 150,
      defaultReplacementCostMid: 350,
      defaultReplacementCostHigh: 600,
      maintenanceImpactFactor: 1.0,
      sortOrder: 14,
      isActive: true,
    },
    {
      category: "plumbing" as const,
      name: "Drain System",
      description: "Whole-house drain lines including kitchen, bath, and floor drains",
      defaultLifespanYears: 50,
      weibullShape: 3.5,
      weibullScale: 55.0,
      defaultReplacementCostLow: 2000,
      defaultReplacementCostMid: 5000,
      defaultReplacementCostHigh: 12000,
      maintenanceImpactFactor: 1.3,
      sortOrder: 15,
      isActive: true,
    },
    {
      category: "plumbing" as const,
      name: "Septic System",
      description: "On-site sewage treatment including tank and drain field",
      defaultLifespanYears: 23,
      weibullShape: 3.0,
      weibullScale: 27.5,
      defaultReplacementCostLow: 5000,
      defaultReplacementCostMid: 14000,
      defaultReplacementCostHigh: 26000,
      maintenanceImpactFactor: 1.4,
      sortOrder: 16,
      isActive: true,
    },
    {
      category: "plumbing" as const,
      name: "Well Pump",
      description: "Submersible or jet pump for private well water supply",
      defaultLifespanYears: 11,
      weibullShape: 2.8,
      weibullScale: 16.5,
      defaultReplacementCostLow: 700,
      defaultReplacementCostMid: 2300,
      defaultReplacementCostHigh: 4500,
      maintenanceImpactFactor: 1.1,
      sortOrder: 17,
      isActive: true,
    },
    {
      category: "plumbing" as const,
      name: "Sump Pump",
      description: "Basement or crawlspace pump for water removal and flood prevention",
      defaultLifespanYears: 10,
      weibullShape: 2.5,
      weibullScale: 11.0,
      defaultReplacementCostLow: 300,
      defaultReplacementCostMid: 800,
      defaultReplacementCostHigh: 1500,
      maintenanceImpactFactor: 1.2,
      sortOrder: 18,
      isActive: true,
    },
    {
      category: "plumbing" as const,
      name: "Pressure Tank",
      description: "Water pressure storage tank for well systems",
      defaultLifespanYears: 15,
      weibullShape: 2.8,
      weibullScale: 16.5,
      defaultReplacementCostLow: 300,
      defaultReplacementCostMid: 600,
      defaultReplacementCostHigh: 1200,
      maintenanceImpactFactor: 1.0,
      sortOrder: 19,
      isActive: true,
    },

    // ELECTRICAL
    {
      category: "electrical" as const,
      name: "Electrical Panel",
      description: "Main breaker box distributing power throughout the home",
      defaultLifespanYears: 34,
      weibullShape: 3.0,
      weibullScale: 35.0,
      defaultReplacementCostLow: 2300,
      defaultReplacementCostMid: 5600,
      defaultReplacementCostHigh: 12000,
      maintenanceImpactFactor: 1.0,
      sortOrder: 20,
      isActive: true,
    },
    {
      category: "electrical" as const,
      name: "Wiring (Whole Home)",
      description: "Complete electrical wiring throughout the house",
      defaultLifespanYears: 40,
      weibullShape: 4.0,
      weibullScale: 44.0,
      defaultReplacementCostLow: 8000,
      defaultReplacementCostMid: 16000,
      defaultReplacementCostHigh: 29000,
      maintenanceImpactFactor: 1.0,
      sortOrder: 21,
      isActive: true,
    },

    // APPLIANCES
    {
      category: "appliances" as const,
      name: "Refrigerator",
      description: "Kitchen refrigerator/freezer unit",
      defaultLifespanYears: 14,
      weibullShape: 2.5,
      weibullScale: 14.0,
      defaultReplacementCostLow: 450,
      defaultReplacementCostMid: 2750,
      defaultReplacementCostHigh: 15500,
      maintenanceImpactFactor: 1.1,
      sortOrder: 30,
      isActive: true,
    },
    {
      category: "appliances" as const,
      name: "Dishwasher",
      description: "Built-in or portable dishwashing machine",
      defaultLifespanYears: 11,
      weibullShape: 2.0,
      weibullScale: 12.0,
      defaultReplacementCostLow: 500,
      defaultReplacementCostMid: 1130,
      defaultReplacementCostHigh: 2800,
      maintenanceImpactFactor: 1.15,
      sortOrder: 31,
      isActive: true,
    },
    {
      category: "appliances" as const,
      name: "Washing Machine",
      description: "Clothes washer (top-load or front-load)",
      defaultLifespanYears: 12,
      weibullShape: 2.2,
      weibullScale: 13.0,
      defaultReplacementCostLow: 450,
      defaultReplacementCostMid: 1150,
      defaultReplacementCostHigh: 2400,
      maintenanceImpactFactor: 1.1,
      sortOrder: 32,
      isActive: true,
    },
    {
      category: "appliances" as const,
      name: "Dryer",
      description: "Clothes dryer (gas or electric)",
      defaultLifespanYears: 13,
      weibullShape: 2.5,
      weibullScale: 15.0,
      defaultReplacementCostLow: 400,
      defaultReplacementCostMid: 975,
      defaultReplacementCostHigh: 2000,
      maintenanceImpactFactor: 1.15,
      sortOrder: 33,
      isActive: true,
    },
    {
      category: "appliances" as const,
      name: "Oven/Range",
      description: "Cooking stove with oven (gas or electric)",
      defaultLifespanYears: 16,
      weibullShape: 3.0,
      weibullScale: 17.0,
      defaultReplacementCostLow: 550,
      defaultReplacementCostMid: 3000,
      defaultReplacementCostHigh: 12800,
      maintenanceImpactFactor: 1.0,
      sortOrder: 34,
      isActive: true,
    },

    // STRUCTURAL
    {
      category: "structural" as const,
      name: "Roof (Asphalt Shingle)",
      description: "Asphalt shingle roofing system including underlayment",
      defaultLifespanYears: 25,
      weibullShape: 3.5,
      weibullScale: 28.0,
      defaultReplacementCostLow: 5400,
      defaultReplacementCostMid: 11200,
      defaultReplacementCostHigh: 25000,
      maintenanceImpactFactor: 1.2,
      sortOrder: 40,
      isActive: true,
    },
    {
      category: "structural" as const,
      name: "Foundation",
      description: "Home's foundation (slab, crawlspace, or basement)",
      defaultLifespanYears: 100,
      weibullShape: 4.0,
      weibullScale: 110.0,
      defaultReplacementCostLow: 5000,
      defaultReplacementCostMid: 15000,
      defaultReplacementCostHigh: 40000,
      maintenanceImpactFactor: 1.0,
      sortOrder: 41,
      isActive: true,
    },
    {
      category: "structural" as const,
      name: "Windows",
      description: "Home windows (double-pane or triple-pane)",
      defaultLifespanYears: 24,
      weibullShape: 3.0,
      weibullScale: 22.0,
      defaultReplacementCostLow: 2500,
      defaultReplacementCostMid: 8500,
      defaultReplacementCostHigh: 22000,
      maintenanceImpactFactor: 1.0,
      sortOrder: 42,
      isActive: true,
    },

    // EXTERIOR
    {
      category: "exterior" as const,
      name: "Exterior Paint",
      description: "Exterior house paint and trim",
      defaultLifespanYears: 7,
      weibullShape: 2.0,
      weibullScale: 11.0,
      defaultReplacementCostLow: 3500,
      defaultReplacementCostMid: 6000,
      defaultReplacementCostHigh: 9000,
      maintenanceImpactFactor: 1.0,
      sortOrder: 50,
      isActive: true,
    },
    {
      category: "exterior" as const,
      name: "Driveway (Concrete)",
      description: "Concrete driveway and walkways",
      defaultLifespanYears: 30,
      weibullShape: 3.5,
      weibullScale: 33.0,
      defaultReplacementCostLow: 2000,
      defaultReplacementCostMid: 5000,
      defaultReplacementCostHigh: 10000,
      maintenanceImpactFactor: 1.0,
      sortOrder: 51,
      isActive: true,
    },
    {
      category: "exterior" as const,
      name: "Garage Door & Opener",
      description: "Garage door system including automatic opener",
      defaultLifespanYears: 25,
      weibullShape: 3.5,
      weibullScale: 28.0,
      defaultReplacementCostLow: 1000,
      defaultReplacementCostMid: 3000,
      defaultReplacementCostHigh: 8000,
      maintenanceImpactFactor: 1.1,
      sortOrder: 52,
      isActive: true,
    },
    {
      category: "exterior" as const,
      name: "Fence (Wood)",
      description: "Wooden privacy or decorative fencing",
      defaultLifespanYears: 15,
      weibullShape: 2.5,
      weibullScale: 16.5,
      defaultReplacementCostLow: 1500,
      defaultReplacementCostMid: 3500,
      defaultReplacementCostHigh: 6000,
      maintenanceImpactFactor: 1.2,
      sortOrder: 53,
      isActive: true,
    },
    {
      category: "appliances" as const,
      name: "Microwave",
      description: "Built-in or countertop microwave oven",
      defaultLifespanYears: 9,
      weibullShape: 2.3,
      weibullScale: 9.9,
      defaultReplacementCostLow: 100,
      defaultReplacementCostMid: 300,
      defaultReplacementCostHigh: 700,
      maintenanceImpactFactor: 1.0,
      sortOrder: 35,
      isActive: true,
    },
    {
      category: "appliances" as const,
      name: "Garbage Disposal",
      description: "In-sink food waste disposal unit",
      defaultLifespanYears: 10,
      weibullShape: 2.5,
      weibullScale: 11.0,
      defaultReplacementCostLow: 100,
      defaultReplacementCostMid: 250,
      defaultReplacementCostHigh: 500,
      maintenanceImpactFactor: 1.1,
      sortOrder: 36,
      isActive: true,
    },
    {
      category: "appliances" as const,
      name: "Freezer",
      description: "Standalone chest or upright freezer",
      defaultLifespanYears: 15,
      weibullShape: 2.8,
      weibullScale: 16.5,
      defaultReplacementCostLow: 300,
      defaultReplacementCostMid: 600,
      defaultReplacementCostHigh: 1200,
      maintenanceImpactFactor: 1.0,
      sortOrder: 37,
      isActive: true,
    },
  ];

  const ids: Record<string, any> = {};
  for (const systemType of systemTypes) {
    const id = await ctx.db.insert("systemTypes", systemType);
    ids[systemType.name] = id;
  }
  
  return ids;
}

async function seedMaintenanceTemplates(ctx: any, systemTypeIds: Record<string, any>) {
  const templates = [
    // Central Air Conditioner
    {
      systemTypeId: systemTypeIds["Central Air Conditioner"],
      name: "Replace HVAC Filter",
      description: "Replace the air filter to maintain airflow and efficiency",
      quickSkim: [
        "Check filter size on old filter or manual",
        "Slide out old filter, note airflow direction arrow",
        "Insert new filter with arrow pointing toward unit",
        "Set reminder for next replacement"
      ],
      frequencyMonths: 3,
      priority: "medium" as const,
      difficulty: "easy" as const,
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
    },
    {
      systemTypeId: systemTypeIds["Central Air Conditioner"],
      name: "Annual AC Tune-Up",
      description: "Professional inspection and maintenance of air conditioning system",
      quickSkim: [
        "Schedule in spring before cooling season",
        "Tech checks refrigerant, coils, electrical",
        "Expect 1-2 hours for thorough service",
        "Should include coil cleaning and leak check"
      ],
      frequencyMonths: 12,
      priority: "high" as const,
      difficulty: "pro_only" as const,
      estimatedTimeMinutes: 90,
      diyCostLow: 0,
      diyCostHigh: 0,
      proCostLow: 100,
      proCostHigh: 200,
      diySteps: [],
      commonMistakes: [
        "Skipping annual tune-ups to save money (costs more in repairs)",
        "Scheduling during peak summer when techs are busy",
        "Not asking for a detailed report of findings"
      ],
      whenToCallPro: [
        "This is always a professional service",
        "Schedule in March-April for best availability and pricing"
      ],
      healthImpactIfSkipped: 0.08,
    },
    {
      systemTypeId: systemTypeIds["Central Air Conditioner"],
      name: "Clean AC Condenser Coils",
      description: "Clean outdoor unit coils to maintain cooling efficiency",
      quickSkim: [
        "Turn off power at disconnect box",
        "Spray coils from inside out with garden hose",
        "Never use pressure washer - damages fins",
        "Trim vegetation 2 feet from unit"
      ],
      frequencyMonths: 12,
      priority: "medium" as const,
      difficulty: "moderate" as const,
      estimatedTimeMinutes: 45,
      diyCostLow: 0,
      diyCostHigh: 20,
      proCostLow: 100,
      proCostHigh: 200,
      diySteps: [
        "Turn off power at the outdoor disconnect box",
        "Remove any debris (leaves, twigs) from around unit",
        "Use garden hose to spray coils from inside out",
        "Apply coil cleaner if heavily soiled (available at hardware stores)",
        "Let cleaner sit 10-15 minutes, then rinse thoroughly",
        "Straighten any bent fins with a fin comb",
        "Clear vegetation at least 2 feet from all sides",
        "Restore power"
      ],
      commonMistakes: [
        "Using a pressure washer (damages delicate fins)",
        "Spraying from outside in (pushes debris deeper)",
        "Forgetting to turn off power first",
        "Bending fins while cleaning"
      ],
      whenToCallPro: [
        "If coils are severely clogged or damaged",
        "If refrigerant lines show signs of damage",
        "If you're not comfortable working with electrical disconnect"
      ],
      healthImpactIfSkipped: 0.06,
    },

    // Gas Furnace
    {
      systemTypeId: systemTypeIds["Gas Furnace"],
      name: "Annual Furnace Inspection",
      description: "Professional safety inspection of gas furnace and heat exchanger",
      quickSkim: [
        "Critical for carbon monoxide safety",
        "Tech checks heat exchanger for cracks",
        "Includes burner and ignition inspection",
        "Schedule in fall before heating season"
      ],
      frequencyMonths: 12,
      priority: "critical" as const,
      difficulty: "pro_only" as const,
      estimatedTimeMinutes: 60,
      diyCostLow: 0,
      diyCostHigh: 0,
      proCostLow: 80,
      proCostHigh: 150,
      diySteps: [],
      commonMistakes: [
        "Skipping inspection (cracked heat exchangers leak carbon monoxide)",
        "Waiting until furnace breaks to call for service",
        "Not testing CO detectors after inspection"
      ],
      whenToCallPro: [
        "This is always a professional service",
        "Immediately if you smell gas or hear unusual noises",
        "If pilot light keeps going out"
      ],
      healthImpactIfSkipped: 0.10,
    },

    // Water Heater (Tank)
    {
      systemTypeId: systemTypeIds["Water Heater (Tank)"],
      name: "Flush Water Heater",
      description: "Drain sediment from tank to maintain efficiency and extend life",
      quickSkim: [
        "Turn off power/gas and water supply",
        "Connect hose to drain valve at bottom",
        "Open valve and drain until water runs clear",
        "Watch for rust - sign of failing tank"
      ],
      frequencyMonths: 12,
      priority: "high" as const,
      difficulty: "moderate" as const,
      estimatedTimeMinutes: 45,
      diyCostLow: 0,
      diyCostHigh: 0,
      proCostLow: 100,
      proCostHigh: 200,
      diySteps: [
        "Turn off power (electric) or set to pilot (gas)",
        "Turn off cold water supply valve at top of heater",
        "Connect garden hose to drain valve at bottom",
        "Run hose to floor drain or outside",
        "Open a hot water faucet somewhere in house to break vacuum",
        "Open drain valve and let water flow",
        "Drain until water runs clear (may take 5-15 minutes)",
        "Close drain valve",
        "Turn on cold water supply",
        "Wait for tank to fill (hot faucet will stop sputtering)",
        "Close hot faucet and restore power/gas"
      ],
      commonMistakes: [
        "Not turning off power before draining (burns out electric elements)",
        "Forgetting to open hot faucet (creates vacuum, tank won't drain)",
        "Not draining long enough to clear sediment",
        "Forcing stuck drain valve (call pro if stuck)"
      ],
      whenToCallPro: [
        "If drain valve is stuck or leaking",
        "If water is rusty (tank may be failing)",
        "If you're not comfortable with gas appliances",
        "If tank is making popping or rumbling noises"
      ],
      healthImpactIfSkipped: 0.07,
    },
    {
      systemTypeId: systemTypeIds["Water Heater (Tank)"],
      name: "Test T&P Relief Valve",
      description: "Test the temperature and pressure relief valve for safety",
      quickSkim: [
        "Critical safety device - prevents explosions",
        "Lift lever briefly to test",
        "Water should flow then stop when released",
        "Replace if it drips or doesn't release"
      ],
      frequencyMonths: 12,
      priority: "high" as const,
      difficulty: "easy" as const,
      estimatedTimeMinutes: 5,
      diyCostLow: 0,
      diyCostHigh: 0,
      proCostLow: 50,
      proCostHigh: 100,
      diySteps: [
        "Locate the T&P valve on side or top of water heater",
        "Place bucket under the discharge pipe",
        "Lift the lever for 2-3 seconds",
        "Hot water should flow out the pipe",
        "Release lever - flow should stop completely",
        "If it drips or doesn't flow, replace the valve"
      ],
      commonMistakes: [
        "Never blocking or capping the discharge pipe",
        "Holding lever too long (wastes water, may not reseat)",
        "Ignoring a dripping valve (call pro to replace)"
      ],
      whenToCallPro: [
        "If valve doesn't release water when tested",
        "If valve continues dripping after test",
        "If discharge pipe is missing or improperly routed"
      ],
      healthImpactIfSkipped: 0.04,
    },

    // Roof
    {
      systemTypeId: systemTypeIds["Roof (Asphalt Shingle)"],
      name: "Inspect Roof",
      description: "Visual inspection of roof condition and flashings",
      quickSkim: [
        "Use binoculars from ground - don't climb",
        "Look for missing, curled, or cracked shingles",
        "Check flashing around vents and chimney",
        "Inspect gutters for shingle granules"
      ],
      frequencyMonths: 6,
      priority: "high" as const,
      difficulty: "easy" as const,
      estimatedTimeMinutes: 20,
      diyCostLow: 0,
      diyCostHigh: 0,
      proCostLow: 100,
      proCostHigh: 300,
      diySteps: [
        "Use binoculars to inspect roof from ground level",
        "Look for missing, curled, cracked, or buckling shingles",
        "Check metal flashings around chimney, vents, and valleys",
        "Look for moss or algae growth",
        "Check gutters for excessive shingle granules (sign of wear)",
        "Look inside attic for daylight, water stains, or mold",
        "Document issues with photos for contractor reference"
      ],
      commonMistakes: [
        "Walking on roof (dangerous and can damage shingles)",
        "Ignoring small issues until they become leaks",
        "Power washing shingles (removes protective granules)"
      ],
      whenToCallPro: [
        "For any roof access or repairs",
        "If you see missing or damaged shingles",
        "If you notice water stains in attic or ceilings",
        "After severe storms or hail"
      ],
      healthImpactIfSkipped: 0.06,
    },
    {
      systemTypeId: systemTypeIds["Roof (Asphalt Shingle)"],
      name: "Clean Gutters",
      description: "Remove debris from gutters and check downspouts",
      quickSkim: [
        "Use ladder stabilizer for safety",
        "Scoop debris, don't push into downspouts",
        "Flush with hose to test flow",
        "Check that downspouts direct water away"
      ],
      frequencyMonths: 6,
      priority: "medium" as const,
      difficulty: "moderate" as const,
      estimatedTimeMinutes: 60,
      diyCostLow: 0,
      diyCostHigh: 20,
      proCostLow: 100,
      proCostHigh: 250,
      diySteps: [
        "Set up ladder safely with stabilizer if available",
        "Wear work gloves and safety glasses",
        "Remove large debris by hand into bucket",
        "Use gutter scoop for remaining debris",
        "Flush gutters with garden hose",
        "Check that water flows freely through downspouts",
        "Clear any downspout clogs with plumber's snake",
        "Ensure downspouts direct water 4-6 feet from foundation"
      ],
      commonMistakes: [
        "Not using ladder safely (leading cause of home injury)",
        "Pushing debris into downspouts (causes clogs)",
        "Not checking downspout extensions",
        "Forgetting inside corners where debris accumulates"
      ],
      whenToCallPro: [
        "If you're not comfortable on ladders",
        "For multi-story homes",
        "If gutters are sagging or pulling away",
        "To install gutter guards"
      ],
      healthImpactIfSkipped: 0.05,
    },

    // Dishwasher
    {
      systemTypeId: systemTypeIds["Dishwasher"],
      name: "Clean Dishwasher Filter",
      description: "Remove and clean the filter to prevent odors and improve cleaning",
      quickSkim: [
        "Filter is usually under lower spray arm",
        "Twist to remove, rinse under water",
        "Check for food debris clogging holes",
        "Run empty cycle with vinegar monthly"
      ],
      frequencyMonths: 1,
      priority: "low" as const,
      difficulty: "easy" as const,
      estimatedTimeMinutes: 10,
      diyCostLow: 0,
      diyCostHigh: 0,
      proCostLow: 50,
      proCostHigh: 100,
      diySteps: [
        "Remove lower dish rack",
        "Locate filter assembly at bottom center",
        "Twist and lift to remove filter",
        "Rinse under warm running water",
        "Use soft brush to remove stuck debris",
        "Check spray arm holes for clogs",
        "Reinstall filter (twist to lock)",
        "Run empty hot cycle with 1 cup white vinegar"
      ],
      commonMistakes: [
        "Not cleaning filter monthly (causes odors)",
        "Using harsh chemicals instead of vinegar",
        "Forgetting to check spray arm holes"
      ],
      whenToCallPro: [
        "If dishwasher won't drain",
        "If dishes aren't getting clean despite maintenance",
        "If you notice leaks during operation"
      ],
      healthImpactIfSkipped: 0.02,
    },

    // Dryer
    {
      systemTypeId: systemTypeIds["Dryer"],
      name: "Clean Dryer Vent",
      description: "Clean lint from dryer vent duct to prevent fires",
      quickSkim: [
        "FIRE HAZARD - this is critical",
        "Disconnect duct and clean with brush/vacuum",
        "Check outside vent flap opens freely",
        "Replace crushed or kinked flexible ducts"
      ],
      frequencyMonths: 12,
      priority: "critical" as const,
      difficulty: "moderate" as const,
      estimatedTimeMinutes: 45,
      diyCostLow: 0,
      diyCostHigh: 30,
      proCostLow: 100,
      proCostHigh: 200,
      diySteps: [
        "Unplug dryer or turn off gas valve",
        "Pull dryer away from wall",
        "Disconnect the vent duct from dryer",
        "Use a dryer vent brush kit to clean inside duct",
        "Vacuum lint from dryer's exhaust port",
        "Go outside and clean lint from exterior vent",
        "Ensure exterior flap opens and closes freely",
        "Reconnect duct (use metal clamps, not screws)",
        "Push dryer back, avoiding crushing duct",
        "Plug in and test"
      ],
      commonMistakes: [
        "Never venting dryer indoors (moisture and lint hazard)",
        "Using vinyl or foil ducts (fire hazard - use rigid metal)",
        "Crushing duct when pushing dryer back",
        "Using screws to connect duct (catch lint)"
      ],
      whenToCallPro: [
        "If dryer is taking multiple cycles to dry clothes",
        "If you smell burning when dryer runs",
        "For long vent runs or rooftop vents",
        "If exterior vent won't open"
      ],
      healthImpactIfSkipped: 0.08,
    },

    // Refrigerator
    {
      systemTypeId: systemTypeIds["Refrigerator"],
      name: "Clean Refrigerator Coils",
      description: "Clean dust from condenser coils to maintain efficiency",
      quickSkim: [
        "Coils are on back or underneath",
        "Unplug fridge, use coil brush or vacuum",
        "Pet owners should clean more often",
        "Dirty coils increase energy bills"
      ],
      frequencyMonths: 12,
      priority: "medium" as const,
      difficulty: "easy" as const,
      estimatedTimeMinutes: 20,
      diyCostLow: 0,
      diyCostHigh: 15,
      proCostLow: 75,
      proCostHigh: 150,
      diySteps: [
        "Unplug refrigerator",
        "Locate coils (back of unit or behind front grille)",
        "If behind grille: snap off grille at bottom front",
        "Use refrigerator coil brush (long, flexible) to remove dust",
        "Vacuum loose dust and debris",
        "Replace grille or move fridge back",
        "Plug in refrigerator"
      ],
      commonMistakes: [
        "Forgetting to unplug before cleaning",
        "Not cleaning often enough if you have pets",
        "Bending or damaging coil fins"
      ],
      whenToCallPro: [
        "If fridge is running constantly",
        "If food isn't staying cold despite cleaning",
        "If you hear unusual compressor noises"
      ],
      healthImpactIfSkipped: 0.04,
    },

    // Electrical Panel
    {
      systemTypeId: systemTypeIds["Electrical Panel"],
      name: "Test GFCI Outlets",
      description: "Test ground fault circuit interrupter outlets for proper function",
      quickSkim: [
        "Press TEST button - outlet should shut off",
        "Press RESET to restore power",
        "Test all GFCIs in kitchen, bath, garage, outdoor",
        "Replace if TEST doesn't trip the outlet"
      ],
      frequencyMonths: 1,
      priority: "high" as const,
      difficulty: "easy" as const,
      estimatedTimeMinutes: 10,
      diyCostLow: 0,
      diyCostHigh: 0,
      proCostLow: 50,
      proCostHigh: 100,
      diySteps: [
        "Locate all GFCI outlets (kitchen, bathrooms, garage, outdoor, basement)",
        "Press the TEST button on each GFCI",
        "Power to outlet should cut off (plug in lamp to verify)",
        "Press RESET button to restore power",
        "If outlet doesn't trip or won't reset, it needs replacement"
      ],
      commonMistakes: [
        "Not testing monthly as recommended",
        "Confusing GFCI with regular outlets",
        "Not knowing that one GFCI may protect multiple outlets downstream"
      ],
      whenToCallPro: [
        "If GFCI doesn't trip when tested",
        "If GFCI won't reset",
        "If GFCI trips frequently",
        "To install new GFCI outlets"
      ],
      healthImpactIfSkipped: 0.03,
    },

    // Garage Door
    {
      systemTypeId: systemTypeIds["Garage Door & Opener"],
      name: "Lubricate Garage Door",
      description: "Lubricate moving parts and test safety features",
      quickSkim: [
        "Use silicone or lithium spray, not WD-40",
        "Spray hinges, rollers, tracks, springs",
        "Test auto-reverse by placing 2x4 under door",
        "Check photo-eye alignment"
      ],
      frequencyMonths: 6,
      priority: "medium" as const,
      difficulty: "easy" as const,
      estimatedTimeMinutes: 20,
      diyCostLow: 5,
      diyCostHigh: 15,
      proCostLow: 75,
      proCostHigh: 150,
      diySteps: [
        "Spray silicone lubricant on hinges",
        "Lubricate roller bearings (not nylon rollers)",
        "Spray pivot points on door arms",
        "Lightly lubricate track sides",
        "Test auto-reverse: place 2x4 on floor where door lands",
        "Close door - should reverse on contact",
        "Test photo-eye: wave object through beam while closing",
        "Door should reverse immediately",
        "Tighten any loose hardware"
      ],
      commonMistakes: [
        "Using WD-40 (attracts dust, not a lubricant)",
        "Trying to adjust torsion springs (extremely dangerous)",
        "Not testing safety features",
        "Over-lubricating tracks (attracts dirt)"
      ],
      whenToCallPro: [
        "For any spring adjustment or replacement",
        "If door is off-track",
        "If opener motor is straining",
        "If cables are frayed or broken"
      ],
      healthImpactIfSkipped: 0.03,
    },

    // =====================================================
    // DRAIN SYSTEM MAINTENANCE (Critical for preventing stoppages)
    // =====================================================
    {
      systemTypeId: systemTypeIds["Drain System"],
      name: "Apply Drain Enzyme Treatment",
      description: "Apply bio-enzyme drain cleaner to break down organic buildup and prevent clogs",
      quickSkim: [
        "Bio-enzymes eat organic matter safely",
        "Pour down each drain monthly",
        "Best applied at night to sit overnight",
        "Prevents 80% of drain clogs",
        "Safe for septic systems unlike chemical cleaners"
      ],
      frequencyMonths: 1,
      priority: "medium" as const,
      difficulty: "easy" as const,
      estimatedTimeMinutes: 10,
      diyCostLow: 5,
      diyCostHigh: 15,
      proCostLow: 75,
      proCostHigh: 150,
      diySteps: [
        "Purchase bio-enzyme drain cleaner (Bio-Clean, Green Gobbler, or similar)",
        "Run warm water down each drain for 30 seconds",
        "Turn off water and pour recommended amount into drain",
        "Kitchen sink: focus on disposal side if applicable",
        "Bathroom sinks: pour directly into overflow hole too",
        "Shower/tub: pour into drain and let sit",
        "Do NOT run water for at least 6-8 hours (overnight is best)",
        "The enzymes multiply and eat organic buildup while you sleep",
        "Resume normal use in the morning",
        "Repeat monthly for prevention"
      ],
      commonMistakes: [
        "Using chemical drain cleaners (kills enzymes and damages pipes)",
        "Running water too soon after application",
        "Not treating all drains in the house",
        "Using hot water instead of warm (kills enzymes)",
        "Expecting instant results (enzymes work gradually)"
      ],
      whenToCallPro: [
        "If drain is completely blocked (enzymes are preventive)",
        "If multiple drains are slow simultaneously (main line issue)",
        "If you smell sewer gas from drains",
        "If DIY treatments haven't improved slow drains after 2-3 months"
      ],
      healthImpactIfSkipped: 0.05,
    },
    {
      systemTypeId: systemTypeIds["Drain System"],
      name: "Clean P-Traps",
      description: "Remove and clean P-traps under sinks to remove buildup and check for leaks",
      quickSkim: [
        "P-trap is the curved pipe under sinks",
        "Catches debris and maintains water seal",
        "Place bucket underneath before removing",
        "Check gaskets for wear while apart",
        "Common source of slow drains and odors"
      ],
      frequencyMonths: 6,
      priority: "low" as const,
      difficulty: "easy" as const,
      estimatedTimeMinutes: 20,
      diyCostLow: 0,
      diyCostHigh: 10,
      proCostLow: 75,
      proCostHigh: 150,
      diySteps: [
        "Place bucket or pan under the P-trap",
        "If plastic: unscrew slip nuts by hand",
        "If metal: use channel-lock pliers (wrap with cloth to prevent scratches)",
        "Carefully lower P-trap - water will spill out",
        "Remove any debris, hair, or buildup",
        "Check inside the trap for corrosion or damage",
        "Inspect rubber gaskets/washers - replace if cracked",
        "Use a bottle brush to clean inside thoroughly",
        "Reassemble in reverse order - hand-tight plus 1/4 turn",
        "Run water and check for leaks",
        "If leaking, tighten slightly or replace gaskets"
      ],
      commonMistakes: [
        "Over-tightening slip nuts (cracks plastic)",
        "Forgetting the bucket (water damage)",
        "Losing the gaskets or reassembling without them",
        "Not checking for leaks after reassembly",
        "Cross-threading the slip nuts"
      ],
      whenToCallPro: [
        "If P-trap is corroded or damaged",
        "If you can't stop a leak after reassembly",
        "If pipes are old and fragile",
        "If there's mold or water damage around the area"
      ],
      healthImpactIfSkipped: 0.03,
    },
    {
      systemTypeId: systemTypeIds["Drain System"],
      name: "Flush Main Drain Lines",
      description: "Hot water flush of main drain lines to clear minor buildup and check for slow drainage",
      quickSkim: [
        "Boil large pot of water for each drain",
        "Pour slowly to maximize contact time",
        "Watch for slow drainage indicating buildup",
        "More effective than cold water",
        "Do monthly between enzyme treatments"
      ],
      frequencyMonths: 12,
      priority: "medium" as const,
      difficulty: "easy" as const,
      estimatedTimeMinutes: 30,
      diyCostLow: 0,
      diyCostHigh: 0,
      proCostLow: 100,
      proCostHigh: 200,
      diySteps: [
        "Start with the drain furthest from the main sewer line",
        "Boil a large pot (3-4 quarts) of water",
        "Pour slowly down the drain in 2-3 stages",
        "Allow water to work for 10 seconds between pours",
        "Watch drainage speed - note any slow drains",
        "For kitchen sinks: run disposal briefly after flush",
        "For bathtub: remove drain stopper first",
        "Move to each drain working toward main line",
        "Flush toilets last with normal flushes",
        "Document any slow drains for future reference"
      ],
      commonMistakes: [
        "Pouring boiling water into toilet (can crack porcelain)",
        "Using boiling water on PVC pipes (use very hot, not boiling)",
        "Pouring too fast - doesn't contact pipe walls",
        "Ignoring slow drains as 'minor'"
      ],
      whenToCallPro: [
        "If any drain is significantly slow",
        "If multiple drains are slow",
        "If you hear gurgling from other drains",
        "If there are recurring backups"
      ],
      healthImpactIfSkipped: 0.04,
    },
    {
      systemTypeId: systemTypeIds["Drain System"],
      name: "Professional Drain Jetting",
      description: "Hydro-jetting service to scour drain lines with high-pressure water",
      quickSkim: [
        "High-pressure water scours pipe walls",
        "Removes grease, scale, roots, and buildup",
        "More effective than snaking",
        "Preventive every 2 years, reactive when needed",
        "Pro-only service due to equipment"
      ],
      frequencyMonths: 24,
      priority: "high" as const,
      difficulty: "pro_only" as const,
      estimatedTimeMinutes: 120,
      diyCostLow: 0,
      diyCostHigh: 0,
      proCostLow: 300,
      proCostHigh: 600,
      diySteps: [],
      commonMistakes: [
        "Waiting until complete blockage to schedule",
        "Skipping camera inspection first (may damage weak pipes)",
        "Using cheap services that don't jet the full line",
        "Not addressing root cause after jetting"
      ],
      whenToCallPro: [
        "This is always a professional service",
        "Schedule preventively every 18-24 months",
        "Schedule immediately if main line is slow",
        "After camera inspection reveals buildup"
      ],
      healthImpactIfSkipped: 0.08,
    },
    {
      systemTypeId: systemTypeIds["Drain System"],
      name: "Camera Inspection (Sewer)",
      description: "Video camera inspection of main sewer line to identify problems before emergency",
      quickSkim: [
        "Camera shows inside of pipes",
        "Identifies roots, cracks, bellies, offsets",
        "Documents pipe condition for insurance",
        "Guides repair decisions",
        "Do every 3-5 years or before buying a home"
      ],
      frequencyMonths: 36,
      priority: "medium" as const,
      difficulty: "pro_only" as const,
      estimatedTimeMinutes: 60,
      diyCostLow: 0,
      diyCostHigh: 0,
      proCostLow: 200,
      proCostHigh: 400,
      diySteps: [],
      commonMistakes: [
        "Never inspecting until there's a problem",
        "Not getting a recording/report",
        "Using cheap services with poor cameras",
        "Ignoring minor issues found during inspection"
      ],
      whenToCallPro: [
        "This is always a professional service",
        "Before buying a home (non-negotiable)",
        "After purchasing an older home",
        "If experiencing recurring drain issues"
      ],
      healthImpactIfSkipped: 0.05,
    },

    // =====================================================
    // WATER HEATER (TANKLESS)
    // =====================================================
    {
      systemTypeId: systemTypeIds["Water Heater (Tankless)"],
      name: "Descale/Flush Tankless Water Heater",
      description: "Flush with vinegar to remove mineral scale buildup from heat exchanger",
      quickSkim: [
        "Scale buildup reduces efficiency and damages unit",
        "Requires circulation pump and vinegar",
        "Takes about 1-2 hours",
        "Critical in hard water areas",
        "Most warranties require annual descaling"
      ],
      frequencyMonths: 12,
      priority: "high" as const,
      difficulty: "moderate" as const,
      estimatedTimeMinutes: 90,
      diyCostLow: 20,
      diyCostHigh: 50,
      proCostLow: 150,
      proCostHigh: 300,
      diySteps: [
        "Turn off gas or power to unit",
        "Close cold water inlet and hot water outlet valves",
        "Connect circulation pump hoses to service ports",
        "Place pump in 5-gallon bucket with 4 gallons white vinegar",
        "Connect return hose to bucket",
        "Open service port valves",
        "Run pump for 45-60 minutes to circulate vinegar",
        "Observe vinegar for scale particles",
        "Close service ports, disconnect hoses",
        "Open cold water inlet and flush unit for 5 minutes",
        "Close cold water, open hot water outlet",
        "Restore power/gas and test"
      ],
      commonMistakes: [
        "Using harsh chemicals instead of vinegar",
        "Not circulating long enough",
        "Forgetting to flush out vinegar after",
        "Not closing valves before disconnecting hoses",
        "Skipping descaling in hard water areas"
      ],
      whenToCallPro: [
        "If error codes appear after descaling",
        "If you're not comfortable with the procedure",
        "If unit is still under warranty (may require pro service)",
        "If water flow rate doesn't improve after descaling"
      ],
      healthImpactIfSkipped: 0.10,
    },
    {
      systemTypeId: systemTypeIds["Water Heater (Tankless)"],
      name: "Clean Tankless Inlet Filter",
      description: "Clean the inlet water filter screen to maintain flow rate",
      quickSkim: [
        "Located where cold water enters unit",
        "Catches sediment before heat exchanger",
        "Takes 5 minutes to clean",
        "Check every 6 months",
        "Dirty filter = error codes"
      ],
      frequencyMonths: 6,
      priority: "medium" as const,
      difficulty: "easy" as const,
      estimatedTimeMinutes: 15,
      diyCostLow: 0,
      diyCostHigh: 0,
      proCostLow: 75,
      proCostHigh: 125,
      diySteps: [
        "Turn off cold water supply to unit",
        "Place towel below to catch drips",
        "Locate inlet filter (check manual for location)",
        "Unscrew filter housing carefully",
        "Remove screen filter",
        "Rinse under running water",
        "Use soft brush for stubborn debris",
        "Inspect for damage - replace if torn",
        "Reinstall filter and housing",
        "Turn on water and check for leaks"
      ],
      commonMistakes: [
        "Forgetting to turn off water first",
        "Over-tightening filter housing",
        "Installing filter backwards",
        "Not checking for leaks after"
      ],
      whenToCallPro: [
        "If filter housing is stuck or damaged",
        "If you can't locate the filter",
        "If leaking after reinstallation",
        "If unit shows errors after filter cleaning"
      ],
      healthImpactIfSkipped: 0.04,
    },
    {
      systemTypeId: systemTypeIds["Water Heater (Tankless)"],
      name: "Check Tankless Venting",
      description: "Inspect venting for blockages, proper slope, and connection integrity",
      quickSkim: [
        "Blocked vent = carbon monoxide risk",
        "Check for bird nests, debris at termination",
        "Verify all joints are sealed",
        "Ensure proper slope for condensate drainage",
        "Gas units only - electric don't have vents"
      ],
      frequencyMonths: 12,
      priority: "high" as const,
      difficulty: "easy" as const,
      estimatedTimeMinutes: 20,
      diyCostLow: 0,
      diyCostHigh: 0,
      proCostLow: 75,
      proCostHigh: 150,
      diySteps: [
        "Locate vent termination outside (usually on wall or roof)",
        "Check for bird nests, wasp nests, or debris",
        "Verify screen is intact and not clogged",
        "Inside: visually inspect all vent joints",
        "Look for signs of condensation leaks",
        "Verify vent slopes toward unit (for condensate)",
        "Check that no vent supports have come loose",
        "Ensure nothing is stored near vent intake/exhaust"
      ],
      commonMistakes: [
        "Ignoring small gaps in vent joints",
        "Blocking vent intake with storage",
        "Not checking after storms",
        "Removing vent screen (insects can enter)"
      ],
      whenToCallPro: [
        "If you smell gas or exhaust",
        "If vent is damaged or disconnected",
        "If CO detector alarms",
        "For annual professional inspection"
      ],
      healthImpactIfSkipped: 0.08,
    },
    {
      systemTypeId: systemTypeIds["Water Heater (Tankless)"],
      name: "Annual Tankless Professional Service",
      description: "Professional inspection, descaling verification, and performance check",
      quickSkim: [
        "Comprehensive system check",
        "Verifies all safety systems",
        "May be required for warranty",
        "Catches problems early",
        "Includes combustion analysis for gas units"
      ],
      frequencyMonths: 12,
      priority: "high" as const,
      difficulty: "pro_only" as const,
      estimatedTimeMinutes: 60,
      diyCostLow: 0,
      diyCostHigh: 0,
      proCostLow: 150,
      proCostHigh: 250,
      diySteps: [],
      commonMistakes: [
        "Skipping to save money",
        "Using unlicensed service providers",
        "Not keeping service records for warranty"
      ],
      whenToCallPro: [
        "This is always a professional service",
        "Schedule annually in fall before heavy use",
        "Schedule immediately if error codes appear"
      ],
      healthImpactIfSkipped: 0.06,
    },

    // =====================================================
    // WATER SOFTENER
    // =====================================================
    {
      systemTypeId: systemTypeIds["Water Softener"],
      name: "Check and Refill Salt",
      description: "Check salt level in brine tank and refill as needed",
      quickSkim: [
        "Salt should be 2/3 to 3/4 full",
        "Use high-purity pellets, not rock salt",
        "Watch for salt bridges (crust on top)",
        "Check monthly, refill as needed",
        "Running out of salt = hard water"
      ],
      frequencyMonths: 1,
      priority: "medium" as const,
      difficulty: "easy" as const,
      estimatedTimeMinutes: 15,
      diyCostLow: 5,
      diyCostHigh: 20,
      proCostLow: 50,
      proCostHigh: 100,
      diySteps: [
        "Lift brine tank lid",
        "Check salt level - should be at least half full",
        "Look for salt bridges: push broom handle down to check",
        "If bridge exists: break it up with broom handle",
        "Add salt to bring level to 2/3 full",
        "Use high-purity pellets (99.5%+ pure)",
        "Avoid overfilling (causes bridging)",
        "Close lid securely"
      ],
      commonMistakes: [
        "Using rock salt instead of pellets (more impurities)",
        "Overfilling the tank",
        "Not breaking up salt bridges",
        "Letting tank run completely empty",
        "Mixing different salt types"
      ],
      whenToCallPro: [
        "If water feels hard despite full salt",
        "If salt isn't going down",
        "If you see rust in the brine tank",
        "If the unit isn't regenerating"
      ],
      healthImpactIfSkipped: 0.05,
    },
    {
      systemTypeId: systemTypeIds["Water Softener"],
      name: "Clean Brine Tank",
      description: "Annual cleaning of the brine tank to remove sludge and insoluble salt",
      quickSkim: [
        "Salt impurities accumulate at bottom",
        "Causes musty taste and smell",
        "Do when salt is low",
        "Takes about an hour",
        "Prevents efficiency loss"
      ],
      frequencyMonths: 12,
      priority: "medium" as const,
      difficulty: "moderate" as const,
      estimatedTimeMinutes: 60,
      diyCostLow: 0,
      diyCostHigh: 10,
      proCostLow: 100,
      proCostHigh: 200,
      diySteps: [
        "Wait until salt level is low",
        "Scoop out remaining salt with plastic scoop",
        "Disconnect brine line if accessible",
        "Remove brine well assembly if removable",
        "Scrub tank interior with dish soap and water",
        "Rinse thoroughly - no soap residue",
        "Clean brine well and float if applicable",
        "Reassemble components",
        "Add fresh salt to 2/3 full",
        "Run manual regeneration cycle"
      ],
      commonMistakes: [
        "Using harsh chemicals to clean",
        "Not rinsing thoroughly (soap affects softening)",
        "Forgetting to reconnect brine line",
        "Not running regeneration after cleaning"
      ],
      whenToCallPro: [
        "If you can't access brine components",
        "If there's mold or significant buildup",
        "If the unit is older and parts are fragile",
        "If you notice rust or damage"
      ],
      healthImpactIfSkipped: 0.04,
    },
    {
      systemTypeId: systemTypeIds["Water Softener"],
      name: "Sanitize Resin Bed",
      description: "Sanitize the resin bed to remove bacteria, iron, and organic buildup",
      quickSkim: [
        "Resin beads can harbor bacteria",
        "Use water softener cleaner or bleach",
        "Run after if water smells musty",
        "Safe for resin beads",
        "Restores softening capacity"
      ],
      frequencyMonths: 12,
      priority: "medium" as const,
      difficulty: "easy" as const,
      estimatedTimeMinutes: 15,
      diyCostLow: 5,
      diyCostHigh: 20,
      proCostLow: 75,
      proCostHigh: 150,
      diySteps: [
        "Purchase resin cleaner (Iron Out, Res Up, or similar)",
        "Follow product instructions for amount",
        "Pour cleaner into brine well or salt tank",
        "Run manual regeneration cycle",
        "For heavy iron: repeat process",
        "Alternative: 1/2 cup household bleach in brine well",
        "Always follow with regeneration cycle"
      ],
      commonMistakes: [
        "Using too much cleaner",
        "Not running regeneration after",
        "Using wrong type of cleaner",
        "Skipping when water has high iron"
      ],
      whenToCallPro: [
        "If water still smells after treatment",
        "If you have very high iron levels",
        "If resin needs replacement",
        "If water quality doesn't improve"
      ],
      healthImpactIfSkipped: 0.03,
    },
    {
      systemTypeId: systemTypeIds["Water Softener"],
      name: "Check Regeneration Cycle",
      description: "Verify the softener is regenerating properly and at the right frequency",
      quickSkim: [
        "Regeneration restores resin capacity",
        "Usually runs at night automatically",
        "Listen for running water during cycle",
        "Check timer/control settings",
        "Improper regeneration = hard water"
      ],
      frequencyMonths: 3,
      priority: "low" as const,
      difficulty: "easy" as const,
      estimatedTimeMinutes: 15,
      diyCostLow: 0,
      diyCostHigh: 0,
      proCostLow: 50,
      proCostHigh: 100,
      diySteps: [
        "Check control panel for error codes",
        "Verify current time is correct on timer",
        "Note regeneration schedule/frequency",
        "Listen during scheduled regeneration time",
        "Check that brine tank water level drops during cycle",
        "After regeneration: test water hardness with test strip",
        "Adjust frequency if water is hard between cycles"
      ],
      commonMistakes: [
        "Not setting time correctly after power outage",
        "Regenerating too frequently (wastes salt)",
        "Regenerating too infrequently (hard water)",
        "Ignoring error codes"
      ],
      whenToCallPro: [
        "If unit won't regenerate",
        "If error codes persist",
        "If water hardness doesn't improve after regeneration",
        "To adjust settings on complex units"
      ],
      healthImpactIfSkipped: 0.02,
    },

    // =====================================================
    // GARBAGE DISPOSAL
    // =====================================================
    {
      systemTypeId: systemTypeIds["Garbage Disposal"],
      name: "Clean Garbage Disposal",
      description: "Clean disposal to remove odors and buildup",
      quickSkim: [
        "Ice + salt cleans blades",
        "Citrus peels freshen smell",
        "Baking soda + vinegar deep cleans",
        "Run cold water during use",
        "Never use hands to clear jams"
      ],
      frequencyMonths: 1,
      priority: "low" as const,
      difficulty: "easy" as const,
      estimatedTimeMinutes: 10,
      diyCostLow: 0,
      diyCostHigh: 5,
      proCostLow: 50,
      proCostHigh: 100,
      diySteps: [
        "Turn off disposal and unplug if possible",
        "Use flashlight to check for debris",
        "Remove visible debris with tongs (never hands)",
        "Pour 1/2 cup baking soda into disposal",
        "Add 1 cup white vinegar - let foam for 5 minutes",
        "Plug in and run cold water",
        "Turn on disposal and add 2 cups ice + 1 cup rock salt",
        "Run until ice is gone",
        "Finish with citrus peels for fresh scent"
      ],
      commonMistakes: [
        "Using hot water (melts grease onto blades)",
        "Putting hand in disposal",
        "Using harsh chemicals",
        "Running without water"
      ],
      whenToCallPro: [
        "If disposal won't turn on",
        "If it hums but won't spin",
        "If there's a leak under the unit",
        "If odors persist after cleaning"
      ],
      healthImpactIfSkipped: 0.02,
    },
    {
      systemTypeId: systemTypeIds["Garbage Disposal"],
      name: "Sharpen Disposal Blades",
      description: "Use ice to sharpen impeller blades and improve grinding",
      quickSkim: [
        "Ice sharpens the impeller blades",
        "Add rock salt for extra abrasion",
        "Run until ice is fully processed",
        "Do quarterly for best performance",
        "Takes just 2 minutes"
      ],
      frequencyMonths: 3,
      priority: "low" as const,
      difficulty: "easy" as const,
      estimatedTimeMinutes: 5,
      diyCostLow: 0,
      diyCostHigh: 2,
      proCostLow: 50,
      proCostHigh: 75,
      diySteps: [
        "Fill disposal with ice cubes (2-3 cups)",
        "Add 1/2 cup rock salt",
        "Turn on cold water",
        "Run disposal until ice is processed",
        "Listen for smoother operation",
        "Run cold water for 30 seconds after"
      ],
      commonMistakes: [
        "Using hot water with ice",
        "Not running enough ice",
        "Running disposal without water"
      ],
      whenToCallPro: [
        "If disposal struggles with soft food",
        "If blades are visibly damaged",
        "If grinding doesn't improve after treatment"
      ],
      healthImpactIfSkipped: 0.01,
    },
    {
      systemTypeId: systemTypeIds["Garbage Disposal"],
      name: "Check Disposal for Leaks",
      description: "Inspect disposal connections for leaks and corrosion",
      quickSkim: [
        "Check mounting flange at sink",
        "Check discharge pipe connection",
        "Look for water stains under sink",
        "Tighten connections if dripping",
        "Leaks cause cabinet damage"
      ],
      frequencyMonths: 6,
      priority: "medium" as const,
      difficulty: "easy" as const,
      estimatedTimeMinutes: 10,
      diyCostLow: 0,
      diyCostHigh: 10,
      proCostLow: 75,
      proCostHigh: 150,
      diySteps: [
        "Clear items from under sink",
        "Place paper towels under disposal",
        "Run water and disposal for 1 minute",
        "Check paper towels for water",
        "Inspect flange seal at sink opening",
        "Check discharge pipe connection",
        "Check dishwasher drain connection if applicable",
        "Tighten any loose connections",
        "If leak at flange: may need to reseat disposal"
      ],
      commonMistakes: [
        "Ignoring small drips",
        "Over-tightening plastic connections",
        "Not checking after garbage disposal vibration"
      ],
      whenToCallPro: [
        "If leak is at the flange/mounting",
        "If disposal body is cracked",
        "If internal seals are failing",
        "If there's water damage to cabinet"
      ],
      healthImpactIfSkipped: 0.03,
    },

    // =====================================================
    // MAIN SEWER LINE
    // =====================================================
    {
      systemTypeId: systemTypeIds["Main Sewer Line"],
      name: "Root Treatment",
      description: "Apply root killer to prevent root intrusion in sewer line",
      quickSkim: [
        "Roots seek sewer line moisture",
        "Copper sulfate or foaming root killer",
        "Flush down toilet nearest to main line",
        "Apply before roots become major blockage",
        "Do annually if you have trees near line"
      ],
      frequencyMonths: 12,
      priority: "high" as const,
      difficulty: "easy" as const,
      estimatedTimeMinutes: 10,
      diyCostLow: 15,
      diyCostHigh: 40,
      proCostLow: 100,
      proCostHigh: 200,
      diySteps: [
        "Purchase root killer (RootX, copper sulfate, or similar)",
        "Identify toilet closest to main sewer line (usually lowest floor)",
        "Follow product instructions for amount",
        "Pour or flush into toilet as directed",
        "Do NOT use other drains for 6-8 hours",
        "Best applied before bed",
        "Repeat every 6-12 months if you have trees near sewer line",
        "Consider foam products for best coverage"
      ],
      commonMistakes: [
        "Using too little product",
        "Flushing other drains too soon",
        "Waiting until there's a blockage",
        "Not using regularly if trees are present"
      ],
      whenToCallPro: [
        "If you have recurring root blockages",
        "If drains are already slow",
        "For mechanical root cutting (severe cases)",
        "If you're unsure about tree proximity to line"
      ],
      healthImpactIfSkipped: 0.07,
    },
    {
      systemTypeId: systemTypeIds["Main Sewer Line"],
      name: "Professional Sewer Inspection",
      description: "Professional camera inspection and assessment of main sewer line",
      quickSkim: [
        "Camera reveals pipe condition",
        "Identifies roots, cracks, bellies, offsets",
        "Essential for older homes",
        "Required before buying a home",
        "Guides repair vs replace decisions"
      ],
      frequencyMonths: 24,
      priority: "high" as const,
      difficulty: "pro_only" as const,
      estimatedTimeMinutes: 60,
      diyCostLow: 0,
      diyCostHigh: 0,
      proCostLow: 200,
      proCostHigh: 400,
      diySteps: [],
      commonMistakes: [
        "Skipping inspection on older homes",
        "Not getting a recording of the inspection",
        "Ignoring minor issues found"
      ],
      whenToCallPro: [
        "This is always a professional service",
        "Every 2-3 years for older homes",
        "Before purchasing any home",
        "After any sewer backup"
      ],
      healthImpactIfSkipped: 0.06,
    },
    {
      systemTypeId: systemTypeIds["Main Sewer Line"],
      name: "Check Cleanout Access",
      description: "Locate and verify access to sewer cleanout for emergencies",
      quickSkim: [
        "Cleanout is your access point for emergencies",
        "Usually a capped pipe in yard or basement",
        "Make sure you know where it is",
        "Keep area clear and accessible",
        "Cap should be removable"
      ],
      frequencyMonths: 12,
      priority: "medium" as const,
      difficulty: "easy" as const,
      estimatedTimeMinutes: 15,
      diyCostLow: 0,
      diyCostHigh: 0,
      proCostLow: 50,
      proCostHigh: 100,
      diySteps: [
        "Locate sewer cleanout (check yard, basement, or near foundation)",
        "Mark location if not obvious",
        "Clear any vegetation or debris from around it",
        "Verify cap can be removed (don't fully remove - just check)",
        "If cap is stuck: apply penetrating oil",
        "Note location for emergencies",
        "Take photo of location for records"
      ],
      commonMistakes: [
        "Not knowing where cleanout is",
        "Covering cleanout with landscaping",
        "Fully removing cap (can release sewer gas)",
        "Forcing a rusted cap"
      ],
      whenToCallPro: [
        "If you can't find the cleanout",
        "If cap is corroded shut",
        "If there's no cleanout (may need to install one)",
        "If cap is leaking"
      ],
      healthImpactIfSkipped: 0.02,
    },

    // =====================================================
    // SEPTIC SYSTEM
    // =====================================================
    {
      systemTypeId: systemTypeIds["Septic System"],
      name: "Pump Septic Tank",
      description: "Professional pumping to remove accumulated solids from septic tank",
      quickSkim: [
        "Critical maintenance - don't skip",
        "Prevents backups and drain field damage",
        "Every 3-5 years for typical family",
        "More often for garbage disposals",
        "Much cheaper than drain field replacement"
      ],
      frequencyMonths: 36,
      priority: "critical" as const,
      difficulty: "pro_only" as const,
      estimatedTimeMinutes: 60,
      diyCostLow: 0,
      diyCostHigh: 0,
      proCostLow: 300,
      proCostHigh: 600,
      diySteps: [],
      commonMistakes: [
        "Waiting too long between pumping",
        "Not pumping after heavy use periods",
        "Using septic additives instead of pumping",
        "Not getting all compartments pumped"
      ],
      whenToCallPro: [
        "This is always a professional service",
        "Every 3-5 years minimum",
        "Immediately if drains are slow",
        "If you smell sewage outside"
      ],
      healthImpactIfSkipped: 0.15,
    },
    {
      systemTypeId: systemTypeIds["Septic System"],
      name: "Inspect Drain Field",
      description: "Visual inspection of drain field area for problems",
      quickSkim: [
        "Drain field disperses treated water",
        "Look for wet spots or lush grass patches",
        "Sewage smell = failing field",
        "Keep vehicles and structures off field",
        "Most expensive part to replace"
      ],
      frequencyMonths: 12,
      priority: "high" as const,
      difficulty: "easy" as const,
      estimatedTimeMinutes: 20,
      diyCostLow: 0,
      diyCostHigh: 0,
      proCostLow: 100,
      proCostHigh: 200,
      diySteps: [
        "Walk the drain field area",
        "Look for unusually green or lush grass",
        "Check for wet or soggy areas",
        "Smell for sewage odors",
        "Note any standing water",
        "Check that nothing is built over field",
        "Verify no vehicles drive over field",
        "Document any concerns with photos"
      ],
      commonMistakes: [
        "Parking vehicles on drain field",
        "Planting trees or shrubs over field",
        "Building structures over field",
        "Ignoring wet spots"
      ],
      whenToCallPro: [
        "If you see wet spots or standing water",
        "If there's sewage smell",
        "If grass is unusually green in one area",
        "For professional inspection with dye test"
      ],
      healthImpactIfSkipped: 0.08,
    },
    {
      systemTypeId: systemTypeIds["Septic System"],
      name: "Add Bacterial Additive",
      description: "Add beneficial bacteria to maintain healthy septic tank biology",
      quickSkim: [
        "Bacteria break down waste",
        "Harsh cleaners kill good bacteria",
        "Monthly additive helps maintain balance",
        "Not a substitute for pumping",
        "Use septic-safe products"
      ],
      frequencyMonths: 1,
      priority: "medium" as const,
      difficulty: "easy" as const,
      estimatedTimeMinutes: 5,
      diyCostLow: 5,
      diyCostHigh: 15,
      proCostLow: 50,
      proCostHigh: 100,
      diySteps: [
        "Purchase septic-safe bacterial additive",
        "Follow product instructions for amount",
        "Flush down toilet (any toilet in house)",
        "Best applied monthly",
        "Use septic-safe household products to protect bacteria"
      ],
      commonMistakes: [
        "Using additives as substitute for pumping",
        "Using antibacterial soaps excessively",
        "Flushing harmful chemicals",
        "Using too much or too little additive"
      ],
      whenToCallPro: [
        "If system seems slow despite treatments",
        "If you've used harsh chemicals recently",
        "For professional assessment of bacteria levels"
      ],
      healthImpactIfSkipped: 0.03,
    },
    {
      systemTypeId: systemTypeIds["Septic System"],
      name: "Check Septic Tank Levels",
      description: "Professional measurement of scum and sludge levels in tank",
      quickSkim: [
        "Determines when pumping is needed",
        "Measures scum (top) and sludge (bottom)",
        "Pump when sludge is 1/3 of tank",
        "Done by septic service company",
        "Can extend time between pumping if levels are low"
      ],
      frequencyMonths: 12,
      priority: "medium" as const,
      difficulty: "pro_only" as const,
      estimatedTimeMinutes: 30,
      diyCostLow: 0,
      diyCostHigh: 0,
      proCostLow: 100,
      proCostHigh: 200,
      diySteps: [],
      commonMistakes: [
        "Opening tank without proper training",
        "Not checking levels between pumping",
        "Guessing when to pump instead of measuring"
      ],
      whenToCallPro: [
        "This is always a professional service",
        "Annually to optimize pumping schedule",
        "If you notice any slow drains"
      ],
      healthImpactIfSkipped: 0.04,
    },

    // =====================================================
    // WELL PUMP
    // =====================================================
    {
      systemTypeId: systemTypeIds["Well Pump"],
      name: "Test Water Quality",
      description: "Annual water quality testing for bacteria and contaminants",
      quickSkim: [
        "Private wells aren't regulated",
        "Test for coliform bacteria annually",
        "Test for nitrates if near agriculture",
        "Test if water looks, smells, or tastes different",
        "Kits available at health department"
      ],
      frequencyMonths: 12,
      priority: "high" as const,
      difficulty: "easy" as const,
      estimatedTimeMinutes: 30,
      diyCostLow: 20,
      diyCostHigh: 100,
      proCostLow: 100,
      proCostHigh: 300,
      diySteps: [
        "Contact local health department or lab for test kit",
        "Follow collection instructions exactly",
        "Typically: run water 5 minutes, collect in sterile container",
        "Keep sample cold and deliver same day",
        "Request testing for: coliform bacteria, nitrates, pH",
        "Consider testing for: hardness, iron, manganese",
        "Review results with lab or health department",
        "Retest if any positive results"
      ],
      commonMistakes: [
        "Contaminating sample during collection",
        "Not testing regularly",
        "Ignoring changes in water quality",
        "Using unaccredited testing labs"
      ],
      whenToCallPro: [
        "If any tests come back positive",
        "If water appearance changes",
        "If anyone in household gets sick",
        "For comprehensive water analysis"
      ],
      healthImpactIfSkipped: 0.08,
    },
    {
      systemTypeId: systemTypeIds["Well Pump"],
      name: "Check Pressure Tank",
      description: "Check pressure tank operation and air charge",
      quickSkim: [
        "Pressure tank stores water and maintains pressure",
        "Air bladder can lose charge over time",
        "Rapid pump cycling = tank problem",
        "Check pressure with tire gauge",
        "Tank should have 2 PSI less than cut-in"
      ],
      frequencyMonths: 6,
      priority: "medium" as const,
      difficulty: "moderate" as const,
      estimatedTimeMinutes: 20,
      diyCostLow: 0,
      diyCostHigh: 5,
      proCostLow: 75,
      proCostHigh: 150,
      diySteps: [
        "Turn off power to pump",
        "Open faucet to drain pressure",
        "Locate air valve on top of tank (like tire valve)",
        "Use tire gauge to check air pressure",
        "Pressure should be 2 PSI below pump cut-in (typically 28 PSI)",
        "If low: add air with bicycle pump or compressor",
        "If waterlogged (no air): bladder may be failed",
        "Turn power back on and test"
      ],
      commonMistakes: [
        "Checking pressure with system pressurized",
        "Over-inflating bladder",
        "Not checking when pump cycles rapidly",
        "Using wrong pressure settings"
      ],
      whenToCallPro: [
        "If tank is waterlogged (no air space)",
        "If bladder is ruptured",
        "If pump cycles very frequently",
        "To replace pressure tank"
      ],
      healthImpactIfSkipped: 0.05,
    },
    {
      systemTypeId: systemTypeIds["Well Pump"],
      name: "Inspect Well Pump Electrical",
      description: "Visual inspection of electrical connections and control box",
      quickSkim: [
        "Loose connections cause pump failure",
        "Check for corrosion on terminals",
        "Listen for contactor chattering",
        "Burnt smell = problem",
        "Turn off power before inspection"
      ],
      frequencyMonths: 12,
      priority: "high" as const,
      difficulty: "moderate" as const,
      estimatedTimeMinutes: 20,
      diyCostLow: 0,
      diyCostHigh: 0,
      proCostLow: 100,
      proCostHigh: 200,
      diySteps: [
        "Turn off power at breaker",
        "Locate pump control box (usually near pressure tank)",
        "Open cover and visually inspect",
        "Look for burnt or discolored wires",
        "Check that all connections are tight",
        "Look for corrosion or moisture",
        "Check that cover gasket seals properly",
        "Note any burnt smell",
        "Close cover and restore power"
      ],
      commonMistakes: [
        "Inspecting with power on",
        "Touching terminals or wires",
        "Ignoring small amounts of corrosion",
        "Not checking regularly"
      ],
      whenToCallPro: [
        "If you see burnt wires or components",
        "If there's corrosion on terminals",
        "If pump won't start or runs continuously",
        "For any electrical repairs"
      ],
      healthImpactIfSkipped: 0.06,
    },
    {
      systemTypeId: systemTypeIds["Well Pump"],
      name: "Professional Well Service",
      description: "Professional inspection and service of well pump system",
      quickSkim: [
        "Comprehensive system check",
        "Flow rate and pressure testing",
        "Pump amp draw measurement",
        "Well depth and static level check",
        "Identifies problems before failure"
      ],
      frequencyMonths: 24,
      priority: "high" as const,
      difficulty: "pro_only" as const,
      estimatedTimeMinutes: 90,
      diyCostLow: 0,
      diyCostHigh: 0,
      proCostLow: 150,
      proCostHigh: 300,
      diySteps: [],
      commonMistakes: [
        "Skipping professional inspections",
        "Waiting until pump fails",
        "Using unlicensed well contractors"
      ],
      whenToCallPro: [
        "This is always a professional service",
        "Every 2 years minimum",
        "Immediately if pump behavior changes",
        "If water pressure drops"
      ],
      healthImpactIfSkipped: 0.07,
    },

    // =====================================================
    // SUMP PUMP
    // =====================================================
    {
      systemTypeId: systemTypeIds["Sump Pump"],
      name: "Test Sump Pump",
      description: "Test sump pump operation by pouring water into pit",
      quickSkim: [
        "Critical for flood prevention",
        "Test by pouring water in pit",
        "Pump should turn on automatically",
        "Check that it shuts off properly",
        "Test quarterly, especially before rainy season"
      ],
      frequencyMonths: 3,
      priority: "high" as const,
      difficulty: "easy" as const,
      estimatedTimeMinutes: 15,
      diyCostLow: 0,
      diyCostHigh: 0,
      proCostLow: 75,
      proCostHigh: 125,
      diySteps: [
        "Locate sump pit and remove cover",
        "Pour 5 gallons of water into pit",
        "Pump should turn on when float rises",
        "Water should be pumped out quickly",
        "Pump should shut off when water is low",
        "Check that check valve prevents backflow",
        "Listen for unusual noises",
        "Replace cover securely"
      ],
      commonMistakes: [
        "Not testing regularly",
        "Testing with not enough water",
        "Ignoring slow pump operation",
        "Not testing before storm season"
      ],
      whenToCallPro: [
        "If pump doesn't turn on",
        "If pump runs but doesn't evacuate water",
        "If pump makes grinding noises",
        "If pump runs continuously"
      ],
      healthImpactIfSkipped: 0.08,
    },
    {
      systemTypeId: systemTypeIds["Sump Pump"],
      name: "Clean Sump Pump and Pit",
      description: "Clean debris from sump pit and pump intake",
      quickSkim: [
        "Debris clogs pump intake",
        "Gravel and sediment accumulate",
        "Dirty pit causes pump failure",
        "Clean annually minimum",
        "Check screen/intake for blockages"
      ],
      frequencyMonths: 12,
      priority: "medium" as const,
      difficulty: "moderate" as const,
      estimatedTimeMinutes: 45,
      diyCostLow: 0,
      diyCostHigh: 10,
      proCostLow: 100,
      proCostHigh: 200,
      diySteps: [
        "Unplug pump from power",
        "Remove pump from pit",
        "Clean pump exterior with water",
        "Check intake screen and clear debris",
        "Scoop debris from pit bottom",
        "Remove accumulated gravel/sediment",
        "Check pit walls for cracks",
        "Reinstall pump and plug in",
        "Test operation with water"
      ],
      commonMistakes: [
        "Not unplugging pump first",
        "Leaving debris in pit",
        "Damaging pump when removing",
        "Not testing after cleaning"
      ],
      whenToCallPro: [
        "If pit is cracked or damaged",
        "If pump is corroded or damaged",
        "If significant water is entering constantly",
        "If pit needs resizing"
      ],
      healthImpactIfSkipped: 0.05,
    },
    {
      systemTypeId: systemTypeIds["Sump Pump"],
      name: "Check Discharge Line",
      description: "Inspect discharge pipe for blockages and proper drainage",
      quickSkim: [
        "Discharge carries water away from home",
        "Check for clogs and freezing",
        "Ensure it drains away from foundation",
        "Install freeze protection if needed",
        "Check valve prevents backflow"
      ],
      frequencyMonths: 6,
      priority: "medium" as const,
      difficulty: "easy" as const,
      estimatedTimeMinutes: 15,
      diyCostLow: 0,
      diyCostHigh: 20,
      proCostLow: 75,
      proCostHigh: 150,
      diySteps: [
        "Trace discharge line from pump to outlet",
        "Check for kinks or damage",
        "Verify outlet is 10+ feet from foundation",
        "Ensure water flows downhill away from home",
        "Check that outlet isn't blocked",
        "Inspect check valve for proper operation",
        "In winter: check for ice blockages",
        "Consider adding discharge line freeze protection"
      ],
      commonMistakes: [
        "Discharge too close to foundation",
        "Not checking in winter",
        "Ignoring check valve issues",
        "Blocking discharge with landscaping"
      ],
      whenToCallPro: [
        "If discharge line is underground and clogged",
        "To install freeze protection",
        "If water is pooling near foundation",
        "To reroute discharge line"
      ],
      healthImpactIfSkipped: 0.04,
    },
    {
      systemTypeId: systemTypeIds["Sump Pump"],
      name: "Replace Battery Backup",
      description: "Replace or test battery backup for sump pump",
      quickSkim: [
        "Power outages often coincide with storms",
        "Battery backup keeps pump running",
        "Batteries last 3-5 years",
        "Test backup operation annually",
        "Consider water-powered backup as secondary"
      ],
      frequencyMonths: 36,
      priority: "medium" as const,
      difficulty: "moderate" as const,
      estimatedTimeMinutes: 30,
      diyCostLow: 100,
      diyCostHigh: 300,
      proCostLow: 200,
      proCostHigh: 400,
      diySteps: [
        "Check battery backup system status lights",
        "Test by unplugging primary pump power",
        "Pour water in pit to trigger backup",
        "Backup should turn on and pump water",
        "If battery is 3+ years old: replace",
        "Match battery specifications to system",
        "Dispose of old battery properly",
        "Reset system and verify operation"
      ],
      commonMistakes: [
        "Not testing backup regularly",
        "Using wrong battery type",
        "Forgetting to test after battery replacement",
        "Not having backup at all"
      ],
      whenToCallPro: [
        "To install battery backup system",
        "If backup isn't working properly",
        "To install secondary backup system",
        "For whole-house generator integration"
      ],
      healthImpactIfSkipped: 0.06,
    },
  ];

  for (const template of templates) {
    if (template.systemTypeId) {
      await ctx.db.insert("maintenanceTaskTemplates", template);
    }
  }
}

async function seedFeatureFlags(ctx: any) {
  const flags = [
    {
      tier: "free" as const,
      maxHomes: 2,
      maxSystemsPerHome: 999,
      canViewDiyInstructions: true,
      canViewCostBreakdown: true,
      canViewForecast: true,
      canViewHealthDrivers: true,
      canScanModelPlates: true,
      monthlyScanLimit: 999,
      canSharePackets: true,
      monthlyPacketLimit: 999,
      canViewQuickSkim: true,
      canExportReports: true,
      hasPriorityNotifications: true,
      hasWebDashboard: true,
    },
    {
      tier: "homeowner" as const,
      maxHomes: 2,
      maxSystemsPerHome: 999,
      canViewDiyInstructions: true,
      canViewCostBreakdown: true,
      canViewForecast: true,
      canViewHealthDrivers: true,
      canScanModelPlates: true,
      monthlyScanLimit: 999,
      canSharePackets: true,
      monthlyPacketLimit: 999,
      canViewQuickSkim: true,
      canExportReports: true,
      hasPriorityNotifications: true,
      hasWebDashboard: true,
    },
  ];

  for (const flag of flags) {
    await ctx.db.insert("featureFlags", flag);
  }
}

async function seedTechnicianQuestions(ctx: any, systemTypeMap: Record<string, any>) {
  const questions = [
    // General Qualification Questions (apply to all service calls)
    {
      category: "qualification" as const,
      question: "How long have you been working on this type of system?",
      whyAsk: "Experience matters. You want someone who has seen common issues before.",
      goodAnswer: "5+ years of hands-on experience with this specific equipment type",
      redFlag: "Vague answers, less than 2 years, or 'I mostly do other things'",
      sortOrder: 1,
    },
    {
      category: "qualification" as const,
      question: "Are you licensed and insured?",
      whyAsk: "Protects you from liability if something goes wrong",
      goodAnswer: "Yes, with specific license number they can provide",
      redFlag: "Hesitation, 'insurance through my employer' without proof, or no license",
      sortOrder: 2,
    },
    {
      category: "qualification" as const,
      question: "Do you have experience with my specific brand/model?",
      whyAsk: "Familiarity with your equipment means faster, more accurate diagnosis",
      goodAnswer: "Yes, with specific examples of similar jobs",
      redFlag: "Never heard of the brand, or 'they're all the same'",
      sortOrder: 3,
    },
    {
      category: "qualification" as const,
      question: "What certifications do you hold?",
      whyAsk: "Certifications indicate ongoing training and commitment to the trade",
      goodAnswer: "NATE certified, EPA 608, manufacturer certifications",
      redFlag: "No certifications, or expired certifications",
      sortOrder: 4,
    },

    // Diagnosis Questions
    {
      category: "diagnosis" as const,
      question: "What tests did you run to reach this diagnosis?",
      whyAsk: "Good technicians use data, not guesswork. This validates their conclusion.",
      goodAnswer: "Specific readings: voltage, pressure, temperature, amp draw",
      redFlag: "'I can just tell' or unable to explain their process",
      sortOrder: 10,
    },
    {
      category: "diagnosis" as const,
      question: "Can you show me the problem?",
      whyAsk: "Legitimate issues can usually be demonstrated. This builds trust.",
      goodAnswer: "Yes, with willingness to show and explain what they're seeing",
      redFlag: "Refuses to show, or can't point to specific evidence",
      sortOrder: 11,
    },
    {
      category: "diagnosis" as const,
      question: "Could this be caused by something else?",
      whyAsk: "Good technicians consider alternatives. This tests their thoroughness.",
      goodAnswer: "Acknowledges other possibilities and explains why they ruled them out",
      redFlag: "100% certain without checking alternatives, or dismissive",
      sortOrder: 12,
    },
    {
      category: "diagnosis" as const,
      question: "Is this a common problem with this system?",
      whyAsk: "Experienced techs know common failure modes. This validates their expertise.",
      goodAnswer: "Yes/no with explanation of typical issues for your equipment age/type",
      redFlag: "Doesn't know, or every answer is 'very common'",
      sortOrder: 13,
    },

    // Options Questions
    {
      category: "options" as const,
      question: "What are ALL my options here?",
      whyAsk: "You should know the full range from repair to replacement before deciding",
      goodAnswer: "Lists multiple options with pros/cons of each",
      redFlag: "Only offers one solution, especially the most expensive one",
      sortOrder: 20,
    },
    {
      category: "options" as const,
      question: "What would you do if this was your home?",
      whyAsk: "Gets honest advice, not just what's most profitable for them",
      goodAnswer: "Thoughtful answer based on your specific situation and budget",
      redFlag: "Immediately recommends most expensive option",
      sortOrder: 21,
    },
    {
      category: "options" as const,
      question: "What's the expected lifespan of this repair vs replacement?",
      whyAsk: "Helps you calculate true cost over time, not just today's bill",
      goodAnswer: "Specific timeframes: 'This repair should last 3-5 years' vs 'New unit lasts 15-20 years'",
      redFlag: "Can't give estimates, or guarantees unrealistic lifespans",
      sortOrder: 22,
    },

    // Pricing Questions
    {
      category: "pricing" as const,
      question: "Can I get a written estimate before you start?",
      whyAsk: "Protects you from surprise charges. Legitimate companies provide this.",
      goodAnswer: "Yes, with itemized breakdown of parts and labor",
      redFlag: "Refuses, or only gives verbal estimate",
      sortOrder: 30,
    },
    {
      category: "pricing" as const,
      question: "What's included in this price?",
      whyAsk: "Reveals hidden costs and ensures you're comparing apples to apples",
      goodAnswer: "Detailed breakdown: parts, labor, disposal, permits, warranty",
      redFlag: "Vague 'everything', or lots of exclusions revealed later",
      sortOrder: 31,
    },
    {
      category: "pricing" as const,
      question: "Are there any rebates or incentives available?",
      whyAsk: "Good contractors know about utility rebates, tax credits, manufacturer promotions",
      goodAnswer: "Knows current rebates and helps you apply for them",
      redFlag: "Doesn't know about any programs, or discourages you from applying",
      sortOrder: 32,
    },
    {
      category: "pricing" as const,
      question: "Do you charge a diagnostic fee? Is it waived if I hire you?",
      whyAsk: "Standard practice varies. Know what you're paying for upfront.",
      goodAnswer: "Clear policy explained upfront",
      redFlag: "Fee not mentioned until after diagnosis, or fee is unusually high",
      sortOrder: 33,
    },

    // Warranty Questions
    {
      category: "warranty" as const,
      question: "What warranty do you offer on parts and labor?",
      whyAsk: "Warranty length indicates confidence in their work",
      goodAnswer: "At least 1 year on labor, manufacturer warranty on parts",
      redFlag: "No warranty, or only 30-90 days",
      sortOrder: 40,
    },
    {
      category: "warranty" as const,
      question: "What's the process if something goes wrong after the repair?",
      whyAsk: "Tests whether they stand behind their work",
      goodAnswer: "Clear process: call this number, we'll come back at no charge",
      redFlag: "Vague, or charges for return visits during warranty period",
      sortOrder: 41,
    },
    {
      category: "warranty" as const,
      question: "Will this repair void my existing warranty?",
      whyAsk: "Some repairs by non-authorized techs can void manufacturer warranties",
      goodAnswer: "Knows your warranty status and advises accordingly",
      redFlag: "Doesn't know or doesn't care about existing warranties",
      sortOrder: 42,
    },

    // HVAC-Specific Questions
    {
      systemTypeId: systemTypeMap["Central Air Conditioner"],
      category: "diagnosis" as const,
      question: "What's the refrigerant pressure reading?",
      whyAsk: "This is a key diagnostic metric. Good techs measure, not guess.",
      goodAnswer: "Specific PSI readings for high and low side",
      redFlag: "Didn't check, or can't tell you the numbers",
      sortOrder: 100,
    },
    {
      systemTypeId: systemTypeMap["Central Air Conditioner"],
      category: "diagnosis" as const,
      question: "What SEER rating is my current system?",
      whyAsk: "Tests their knowledge of your system and sets baseline for replacement talk",
      goodAnswer: "Can read it from nameplate and explain what it means",
      redFlag: "Doesn't know or can't find it",
      sortOrder: 101,
    },
    {
      systemTypeId: systemTypeMap["Gas Furnace"],
      category: "diagnosis" as const,
      question: "Did you check the heat exchanger for cracks?",
      whyAsk: "Cracked heat exchangers are dangerous (carbon monoxide). Critical safety check.",
      goodAnswer: "Yes, and can show you their inspection method",
      redFlag: "Didn't check, or diagnoses crack without proper inspection",
      sortOrder: 102,
    },

    // Water Heater-Specific Questions
    {
      systemTypeId: systemTypeMap["Water Heater (Tank)"],
      category: "diagnosis" as const,
      question: "How old is my water heater and what's its expected lifespan?",
      whyAsk: "Context for repair vs replace decision",
      goodAnswer: "Reads age from serial number, explains typical lifespan for your type",
      redFlag: "Can't determine age, or pushes replacement on newer units",
      sortOrder: 110,
    },
    {
      systemTypeId: systemTypeMap["Water Heater (Tank)"],
      category: "options" as const,
      question: "Should I consider upgrading to tankless?",
      whyAsk: "Gets honest assessment of whether tankless makes sense for your situation",
      goodAnswer: "Evaluates your usage, gas line capacity, budget, and gives honest recommendation",
      redFlag: "Pushes tankless without assessing your needs, or dismisses it without explanation",
      sortOrder: 111,
    },
  ];

  for (const question of questions) {
    await ctx.db.insert("technicianQuestions", {
      ...question,
      isActive: true,
    });
  }
}

async function seedProducts(ctx: any, systemTypeMap: Record<string, any>) {
  const products = [
    // Central Air Conditioners
    {
      systemTypeId: systemTypeMap["Central Air Conditioner"],
      brand: "Goodman",
      modelLine: "GSX13",
      modelNumber: "GSX130241",
      tier: "economy" as const,
      efficiencyRating: "13 SEER",
      capacityRange: "2-5 ton",
      features: ["Single-stage compressor", "R-410A refrigerant", "10-year parts warranty"],
      warrantyYears: 10,
      expectedLifespan: 12,
      msrpLow: 1200,
      msrpHigh: 1800,
      installCostLow: 2000,
      installCostHigh: 3500,
    },
    {
      systemTypeId: systemTypeMap["Central Air Conditioner"],
      brand: "Carrier",
      modelLine: "Comfort Series",
      modelNumber: "24ACC636A003",
      tier: "standard" as const,
      efficiencyRating: "16 SEER",
      capacityRange: "2-5 ton",
      features: ["Single-stage compressor", "Quiet operation", "10-year parts warranty", "Coastal protection"],
      warrantyYears: 10,
      expectedLifespan: 15,
      msrpLow: 2500,
      msrpHigh: 3500,
      installCostLow: 2500,
      installCostHigh: 4000,
    },
    {
      systemTypeId: systemTypeMap["Central Air Conditioner"],
      brand: "Trane",
      modelLine: "XR17",
      modelNumber: "4TTR7036A1000A",
      tier: "premium" as const,
      efficiencyRating: "17 SEER",
      capacityRange: "2-5 ton",
      features: ["Two-stage compressor", "Quiet operation", "Climatuff compressor", "Spine Fin coil"],
      warrantyYears: 10,
      expectedLifespan: 18,
      msrpLow: 3500,
      msrpHigh: 5000,
      installCostLow: 3000,
      installCostHigh: 4500,
    },
    {
      systemTypeId: systemTypeMap["Central Air Conditioner"],
      brand: "Lennox",
      modelLine: "XC25",
      modelNumber: "XC25-036-230",
      tier: "luxury" as const,
      efficiencyRating: "26 SEER",
      capacityRange: "2-5 ton",
      features: ["Variable-speed compressor", "SilentComfort technology", "Precise Comfort", "iComfort compatible"],
      warrantyYears: 10,
      expectedLifespan: 20,
      msrpLow: 6000,
      msrpHigh: 9000,
      installCostLow: 3500,
      installCostHigh: 5500,
    },

    // Gas Furnaces
    {
      systemTypeId: systemTypeMap["Gas Furnace"],
      brand: "Goodman",
      modelLine: "GMS8",
      modelNumber: "GMS80603AN",
      tier: "economy" as const,
      efficiencyRating: "80% AFUE",
      capacityRange: "60,000-120,000 BTU",
      features: ["Single-stage burner", "Multi-speed blower", "Steel cabinet"],
      warrantyYears: 10,
      expectedLifespan: 15,
      msrpLow: 800,
      msrpHigh: 1200,
      installCostLow: 1500,
      installCostHigh: 2500,
    },
    {
      systemTypeId: systemTypeMap["Gas Furnace"],
      brand: "Carrier",
      modelLine: "Performance 96",
      modelNumber: "59TP6A080E17--14",
      tier: "standard" as const,
      efficiencyRating: "96% AFUE",
      capacityRange: "60,000-120,000 BTU",
      features: ["Two-stage burner", "Variable-speed blower", "Quiet operation"],
      warrantyYears: 10,
      expectedLifespan: 18,
      msrpLow: 1500,
      msrpHigh: 2500,
      installCostLow: 2000,
      installCostHigh: 3500,
    },
    {
      systemTypeId: systemTypeMap["Gas Furnace"],
      brand: "Trane",
      modelLine: "S9V2",
      modelNumber: "S9V2B080D4PSBA",
      tier: "premium" as const,
      efficiencyRating: "97% AFUE",
      capacityRange: "60,000-120,000 BTU",
      features: ["Two-stage burner", "Variable-speed blower", "ComfortLink II compatible"],
      warrantyYears: 10,
      expectedLifespan: 20,
      msrpLow: 2500,
      msrpHigh: 4000,
      installCostLow: 2500,
      installCostHigh: 4000,
    },

    // Water Heaters (Tank)
    {
      systemTypeId: systemTypeMap["Water Heater (Tank)"],
      brand: "Rheem",
      modelLine: "Performance",
      modelNumber: "XG50T06EC36U0",
      tier: "economy" as const,
      efficiencyRating: "0.62 UEF",
      capacityRange: "40-50 gallon",
      features: ["Natural gas", "6-year warranty", "Push-button ignition"],
      warrantyYears: 6,
      expectedLifespan: 10,
      msrpLow: 500,
      msrpHigh: 700,
      installCostLow: 400,
      installCostHigh: 800,
    },
    {
      systemTypeId: systemTypeMap["Water Heater (Tank)"],
      brand: "A.O. Smith",
      modelLine: "Signature 100",
      modelNumber: "G6-UT5050NVR",
      tier: "standard" as const,
      efficiencyRating: "0.70 UEF",
      capacityRange: "40-50 gallon",
      features: ["Natural gas", "9-year warranty", "Self-cleaning system", "Dynaclean dip tube"],
      warrantyYears: 9,
      expectedLifespan: 12,
      msrpLow: 700,
      msrpHigh: 1000,
      installCostLow: 400,
      installCostHigh: 800,
    },
    {
      systemTypeId: systemTypeMap["Water Heater (Tank)"],
      brand: "Bradford White",
      modelLine: "Defender",
      modelNumber: "RG250T6N",
      tier: "premium" as const,
      efficiencyRating: "0.67 UEF",
      capacityRange: "40-50 gallon",
      features: ["Natural gas", "Vitraglas lining", "Hydrojet sediment reduction", "Icon System diagnostics"],
      warrantyYears: 10,
      expectedLifespan: 15,
      msrpLow: 900,
      msrpHigh: 1300,
      installCostLow: 500,
      installCostHigh: 900,
    },

    // Water Heaters (Tankless)
    {
      systemTypeId: systemTypeMap["Water Heater (Tankless)"],
      brand: "Rheem",
      modelLine: "Performance Platinum",
      modelNumber: "ECOH200DVLN-2",
      tier: "standard" as const,
      efficiencyRating: "0.94 UEF",
      capacityRange: "9.5 GPM",
      features: ["Natural gas", "WiFi enabled", "Self-diagnostics", "12-year warranty"],
      warrantyYears: 12,
      expectedLifespan: 20,
      msrpLow: 1200,
      msrpHigh: 1600,
      installCostLow: 1500,
      installCostHigh: 3000,
    },
    {
      systemTypeId: systemTypeMap["Water Heater (Tankless)"],
      brand: "Rinnai",
      modelLine: "RU Series",
      modelNumber: "RUR199iN",
      tier: "premium" as const,
      efficiencyRating: "0.96 UEF",
      capacityRange: "11 GPM",
      features: ["Natural gas", "Recirculation built-in", "WiFi enabled", "ThermaCirc360"],
      warrantyYears: 12,
      expectedLifespan: 20,
      msrpLow: 1800,
      msrpHigh: 2500,
      installCostLow: 1500,
      installCostHigh: 3500,
    },
    {
      systemTypeId: systemTypeMap["Water Heater (Tankless)"],
      brand: "Navien",
      modelLine: "NPE-A2",
      modelNumber: "NPE-240A2",
      tier: "luxury" as const,
      efficiencyRating: "0.97 UEF",
      capacityRange: "11.2 GPM",
      features: ["Natural gas", "Dual stainless heat exchangers", "ComfortFlow recirculation", "NaviLink WiFi"],
      warrantyYears: 15,
      expectedLifespan: 25,
      msrpLow: 2200,
      msrpHigh: 3000,
      installCostLow: 2000,
      installCostHigh: 4000,
    },

    // Refrigerators
    {
      systemTypeId: systemTypeMap["Refrigerator"],
      brand: "Frigidaire",
      modelLine: "FFTR1835VW",
      modelNumber: "FFTR1835VW",
      tier: "economy" as const,
      capacityRange: "18 cu ft",
      features: ["Top freezer", "Adjustable shelves", "Humidity-controlled crispers"],
      warrantyYears: 1,
      expectedLifespan: 12,
      msrpLow: 600,
      msrpHigh: 800,
      installCostLow: 50,
      installCostHigh: 150,
    },
    {
      systemTypeId: systemTypeMap["Refrigerator"],
      brand: "Samsung",
      modelLine: "RF28R7551SG",
      modelNumber: "RF28R7551SG",
      tier: "premium" as const,
      capacityRange: "28 cu ft",
      features: ["French door", "Food Showcase", "FlexZone drawer", "WiFi enabled"],
      warrantyYears: 1,
      expectedLifespan: 15,
      msrpLow: 2500,
      msrpHigh: 3500,
      installCostLow: 100,
      installCostHigh: 250,
    },

    // Dishwashers
    {
      systemTypeId: systemTypeMap["Dishwasher"],
      brand: "Whirlpool",
      modelLine: "WDF520PADM",
      modelNumber: "WDF520PADM",
      tier: "economy" as const,
      features: ["1-hour wash cycle", "Soil sensor", "Heated dry"],
      warrantyYears: 1,
      expectedLifespan: 10,
      msrpLow: 400,
      msrpHigh: 550,
      installCostLow: 150,
      installCostHigh: 300,
    },
    {
      systemTypeId: systemTypeMap["Dishwasher"],
      brand: "Bosch",
      modelLine: "500 Series",
      modelNumber: "SHPM65Z55N",
      tier: "premium" as const,
      efficiencyRating: "ENERGY STAR",
      features: ["44 dBA quiet", "AutoAir dry", "PrecisionWash", "Flexible 3rd rack"],
      warrantyYears: 1,
      expectedLifespan: 12,
      msrpLow: 1000,
      msrpHigh: 1300,
      installCostLow: 150,
      installCostHigh: 300,
    },
  ];

  for (const product of products) {
    await ctx.db.insert("products", {
      ...product,
      features: product.features || [],
      isActive: true,
    });
  }
}

/**
 * Add missing appliance system types (Microwave, Garbage Disposal, Freezer).
 * Run once: npx convex run --prod seed:addMissingAppliances
 */
export const addMissingAppliances = mutation({
  handler: async (ctx) => {
    const existing = await ctx.db.query("systemTypes").collect();
    const existingNames = new Set(existing.map((t) => t.name));

    const missing = [
      {
        category: "appliances" as const,
        name: "Microwave",
        description: "Built-in or countertop microwave oven",
        defaultLifespanYears: 9,
        weibullShape: 2.3,
        weibullScale: 9.9,
        defaultReplacementCostLow: 100,
        defaultReplacementCostMid: 300,
        defaultReplacementCostHigh: 700,
        maintenanceImpactFactor: 1.0,
        sortOrder: 35,
        isActive: true,
      },
      {
        category: "appliances" as const,
        name: "Garbage Disposal",
        description: "In-sink food waste disposal unit",
        defaultLifespanYears: 10,
        weibullShape: 2.5,
        weibullScale: 11.0,
        defaultReplacementCostLow: 100,
        defaultReplacementCostMid: 250,
        defaultReplacementCostHigh: 500,
        maintenanceImpactFactor: 1.1,
        sortOrder: 36,
        isActive: true,
      },
      {
        category: "appliances" as const,
        name: "Freezer",
        description: "Standalone chest or upright freezer",
        defaultLifespanYears: 15,
        weibullShape: 2.8,
        weibullScale: 16.5,
        defaultReplacementCostLow: 300,
        defaultReplacementCostMid: 600,
        defaultReplacementCostHigh: 1200,
        maintenanceImpactFactor: 1.0,
        sortOrder: 37,
        isActive: true,
      },
    ];

    const added: string[] = [];
    for (const type of missing) {
      if (!existingNames.has(type.name)) {
        await ctx.db.insert("systemTypes", type);
        added.push(type.name);
      }
    }
    return { added, skipped: missing.map((t) => t.name).filter((n) => !added.includes(n)) };
  },
});
