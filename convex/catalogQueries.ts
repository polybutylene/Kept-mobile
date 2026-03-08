import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get all active system catalog entries.
 * Sorted by category, then by systemName.
 */
export const getSystemCatalog = query({
  args: {},
  handler: async (ctx) => {
    const systems = await ctx.db
      .query("systemCatalog")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();
    return systems.sort((a, b) => {
      const cat = (a.category ?? "").localeCompare(b.category ?? "");
      if (cat !== 0) return cat;
      return (a.systemName ?? "").localeCompare(b.systemName ?? "");
    });
  },
});

/**
 * Get systems for a specific category.
 */
export const getSystemsByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("systemCatalog")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

/**
 * Get only homeowner-visible systems.
 */
export const getHomeownerSystems = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("systemCatalog")
      .withIndex("by_visibleToHomeowner", (q) =>
        q.eq("visibleToHomeowner", true)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

/**
 * Get a single system by its catalogId.
 */
export const getSystemByCatalogId = query({
  args: { catalogId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("systemCatalog")
      .withIndex("by_catalogId", (q) => q.eq("catalogId", args.catalogId))
      .first();
  },
});

/**
 * Get systems by tracking level.
 */
export const getSystemsByTrackingLevel = query({
  args: { trackingLevel: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("systemCatalog")
      .withIndex("by_trackingLevel", (q) =>
        q.eq("trackingLevel", args.trackingLevel)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

/**
 * Get all maintenance tasks for a given system catalogId.
 */
export const getTasksForSystem = query({
  args: { catalogId: v.string() },
  handler: async (ctx, args) => {
    const system = await ctx.db
      .query("systemCatalog")
      .withIndex("by_catalogId", (q) => q.eq("catalogId", args.catalogId))
      .first();
    if (!system || !system.maintenanceTaskIds?.length) return [];

    const tasks = await Promise.all(
      system.maintenanceTaskIds.map((taskId) =>
        ctx.db
          .query("maintenanceTaskCatalog")
          .withIndex("by_taskId", (q) => q.eq("taskId", taskId))
          .first()
      )
    );
    return tasks.filter((t): t is NonNullable<typeof t> => t != null);
  },
});

/**
 * Get all tasks for a category.
 */
export const getTasksByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("maintenanceTaskCatalog")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

/**
 * Get a single task by its taskId.
 */
export const getTaskById = query({
  args: { taskId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("maintenanceTaskCatalog")
      .withIndex("by_taskId", (q) => q.eq("taskId", args.taskId))
      .first();
  },
});

/**
 * Get all active maintenance tasks.
 */
export const getAllTasks = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("maintenanceTaskCatalog")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();
  },
});

/**
 * Get counts for dashboard display.
 */
export const getCatalogStats = query({
  args: {},
  handler: async (ctx) => {
    const systems = await ctx.db
      .query("systemCatalog")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();
    const tasks = await ctx.db
      .query("maintenanceTaskCatalog")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();

    const systemsByCategory: Record<string, number> = {};
    const tasksByCategory: Record<string, number> = {};

    for (const s of systems) {
      const cat = s.category ?? "unknown";
      systemsByCategory[cat] = (systemsByCategory[cat] ?? 0) + 1;
    }
    for (const t of tasks) {
      const cat = t.category ?? "unknown";
      tasksByCategory[cat] = (tasksByCategory[cat] ?? 0) + 1;
    }

    return {
      totalSystems: systems.length,
      totalTasks: tasks.length,
      systemsByCategory,
      tasksByCategory,
    };
  },
});

/**
 * Search systems and tasks by name (case-insensitive).
 */
export const searchCatalog = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const term = args.searchTerm.toLowerCase().trim();
    if (!term) return { systems: [], tasks: [] };

    const systems = await ctx.db
      .query("systemCatalog")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();
    const tasks = await ctx.db
      .query("maintenanceTaskCatalog")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();

    const matchingSystems = systems.filter((s) =>
      (s.systemName ?? "").toLowerCase().includes(term)
    );
    const matchingTasks = tasks.filter((t) =>
      (t.taskName ?? "").toLowerCase().includes(term)
    );

    return { systems: matchingSystems, tasks: matchingTasks };
  },
});
