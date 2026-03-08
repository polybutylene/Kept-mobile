import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

export const createHome = internalMutation({
  args: {
    inspectionId: v.id("inspections"),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    zip: v.string(),
    yearBuilt: v.number(),
    squareFootage: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("homes", {
      name: args.address,
      addressLine1: args.address,
      city: args.city,
      state: args.state,
      zipCode: args.zip,
      yearBuilt: args.yearBuilt,
      squareFootage: args.squareFootage,
      overallHealthScore: 75,
      systemsCount: 0,
      isArchived: false,
    } as any);
  },
});

export const createSystem = internalMutation({
  args: {
    homeId: v.id("homes"),
    name: v.string(),
    category: v.string(),
    manufacturer: v.optional(v.string()),
    modelNumber: v.optional(v.string()),
    serialNumber: v.optional(v.string()),
    yearManufactured: v.optional(v.number()),
    healthScore: v.number(),
    condition: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const systemTypes = await ctx.db.query("systemTypes").collect();
    const match = systemTypes.find((st: any) => st.category === args.category) || systemTypes[0];
    if (!match) return;

    const age = args.yearManufactured ? new Date().getFullYear() - args.yearManufactured : 0;
    const lifespan = (match as any).defaultLifespanYears || 15;
    const remainingLife = Math.max(0, lifespan - age);

    await ctx.db.insert("systems", {
      homeId: args.homeId,
      systemTypeId: match._id,
      name: args.name,
      manufacturer: args.manufacturer,
      modelNumber: args.modelNumber,
      serialNumber: args.serialNumber,
      installDate: args.yearManufactured ? new Date(args.yearManufactured, 0, 1).toISOString() : undefined,
      healthScore: args.healthScore,
      remainingLifePercent: Math.max(0, Math.min(100, (remainingLife / lifespan) * 100)),
      estimatedReplacementYear: args.yearManufactured ? args.yearManufactured + Math.round(lifespan) : undefined,
      estimatedReplacementCost: (match as any).defaultReplacementCostMid || 5000,
      needsAttention: args.condition === "poor" || args.condition === "immediate_attention",
      conditionNotes: args.notes,
      isArchived: false,
    } as any);
  },
});
