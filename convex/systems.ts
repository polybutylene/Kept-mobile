import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByHome = query({
  args: { homeId: v.id("homes") },
  handler: async (ctx, args) => {
    const systems = await ctx.db
      .query("systems")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .collect();

    const activeSystems = systems.filter((s) => !s.isArchived);

    // Enrich with system type data
    const enriched = await Promise.all(
      activeSystems.map(async (system) => {
        const systemType = await ctx.db.get(system.systemTypeId);
        return { ...system, systemType };
      })
    );

    return enriched;
  },
});

export const getById = query({
  args: { systemId: v.id("systems") },
  handler: async (ctx, args) => {
    const system = await ctx.db.get(args.systemId);
    if (!system) return null;

    const systemType = await ctx.db.get(system.systemTypeId);

    // Get related maintenance tasks
    const tasks = await ctx.db
      .query("maintenanceTasks")
      .withIndex("by_system", (q) => q.eq("systemId", args.systemId))
      .collect();

    // Get forecast
    const forecast = await ctx.db
      .query("forecastResults")
      .withIndex("by_system", (q) => q.eq("systemId", args.systemId))
      .order("desc")
      .first();

    return { ...system, systemType, tasks, forecast };
  },
});

export const create = mutation({
  args: {
    homeId: v.id("homes"),
    systemTypeId: v.id("systemTypes"),
    name: v.string(),
    locationInHome: v.optional(v.string()),
    manufacturer: v.optional(v.string()),
    modelNumber: v.optional(v.string()),
    serialNumber: v.optional(v.string()),
    installDate: v.optional(v.string()),
    purchaseDate: v.optional(v.string()),
    warrantyExpiry: v.optional(v.string()),
    conditionNotes: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    weibullShape: v.optional(v.number()),
    weibullScale: v.optional(v.number()),
    weibullLocation: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const systemId = await ctx.db.insert("systems", {
      ...args,
      healthScore: 100,
      remainingLifePercent: 100,
      needsAttention: false,
      isArchived: false,
    });

    // Update home systems count
    const home = await ctx.db.get(args.homeId);
    if (home) {
      const systems = await ctx.db
        .query("systems")
        .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
        .collect();
      const activeCount = systems.filter((s) => !s.isArchived).length;
      await ctx.db.patch(args.homeId, { systemsCount: activeCount });
    }

    return systemId;
  },
});

export const update = mutation({
  args: {
    systemId: v.id("systems"),
    name: v.optional(v.string()),
    locationInHome: v.optional(v.string()),
    manufacturer: v.optional(v.string()),
    modelNumber: v.optional(v.string()),
    serialNumber: v.optional(v.string()),
    installDate: v.optional(v.string()),
    purchaseDate: v.optional(v.string()),
    warrantyExpiry: v.optional(v.string()),
    conditionNotes: v.optional(v.string()),
    lastServiceDate: v.optional(v.string()),
    healthScore: v.optional(v.number()),
    remainingLifePercent: v.optional(v.number()),
    estimatedReplacementYear: v.optional(v.number()),
    estimatedReplacementCost: v.optional(v.number()),
    needsAttention: v.optional(v.boolean()),
    photoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { systemId, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, val]) => val !== undefined)
    );
    await ctx.db.patch(systemId, filtered);
  },
});

export const remove = mutation({
  args: { systemId: v.id("systems") },
  handler: async (ctx, args) => {
    const system = await ctx.db.get(args.systemId);
    if (!system) throw new Error("System not found");

    // Soft delete
    await ctx.db.patch(args.systemId, { isArchived: true });

    // Update home systems count
    const systems = await ctx.db
      .query("systems")
      .withIndex("by_home", (q) => q.eq("homeId", system.homeId))
      .collect();
    const activeCount = systems.filter((s) => !s.isArchived && s._id !== args.systemId).length;
    await ctx.db.patch(system.homeId, { systemsCount: activeCount });
  },
});
