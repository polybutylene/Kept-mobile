import { internalMutation } from "../_generated/server";
import { HVAC_CATALOG, PLUMBING_CATALOG } from "./catalog_hvac_plumbing";
import {
  ELECTRICAL_CATALOG,
  ROOF_CATALOG,
  EXTERIOR_CATALOG,
} from "./catalog_electrical_exterior";
import {
  INTERIOR_CATALOG,
  APPLIANCE_CATALOG,
  SAFETY_CATALOG,
  STRUCTURAL_CATALOG,
  LANDSCAPE_CATALOG,
} from "./catalog_interior_appliance_safety";
import { HVAC_PLUMBING_TASKS } from "./taskcatalog_hvac_plumbing";
import { ELECTRICAL_ROOF_EXTERIOR_TASKS } from "./taskcatalog_electrical_roof_exterior";
import { INTERIOR_OTHER_TASKS } from "./taskcatalog_interior_other";

const ALL_SYSTEM_CATALOG = [
  ...HVAC_CATALOG,
  ...PLUMBING_CATALOG,
  ...ELECTRICAL_CATALOG,
  ...ROOF_CATALOG,
  ...EXTERIOR_CATALOG,
  ...INTERIOR_CATALOG,
  ...APPLIANCE_CATALOG,
  ...SAFETY_CATALOG,
  ...STRUCTURAL_CATALOG,
  ...LANDSCAPE_CATALOG,
];

const ALL_MAINTENANCE_TASKS = [
  ...HVAC_PLUMBING_TASKS,
  ...ELECTRICAL_ROOF_EXTERIOR_TASKS,
  ...INTERIOR_OTHER_TASKS,
];

export const seedSystemCatalog = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("systemCatalog").collect();
    if (existing.length > 0) {
      console.log("System catalog already seeded");
      return;
    }
    for (const entry of ALL_SYSTEM_CATALOG) {
      await ctx.db.insert("systemCatalog", { ...entry });
    }
    console.log(`Seeded ${ALL_SYSTEM_CATALOG.length} system catalog entries`);
  },
});

export const seedMaintenanceTaskCatalog = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("maintenanceTaskCatalog").collect();
    if (existing.length > 0) {
      console.log("Maintenance task catalog already seeded");
      return;
    }
    for (const entry of ALL_MAINTENANCE_TASKS) {
      await ctx.db.insert("maintenanceTaskCatalog", { ...entry });
    }
    console.log(
      `Seeded ${ALL_MAINTENANCE_TASKS.length} maintenance task catalog entries`
    );
  },
});

export const clearAndReseedCatalog = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Delete all systemCatalog rows
    const allSystems = await ctx.db.query("systemCatalog").collect();
    for (const row of allSystems) {
      await ctx.db.delete(row._id);
    }
    console.log(`Deleted ${allSystems.length} system catalog rows`);

    // Delete all maintenanceTaskCatalog rows
    const allTasks = await ctx.db.query("maintenanceTaskCatalog").collect();
    for (const row of allTasks) {
      await ctx.db.delete(row._id);
    }
    console.log(`Deleted ${allTasks.length} maintenance task catalog rows`);

    // Seed system catalog
    for (const entry of ALL_SYSTEM_CATALOG) {
      await ctx.db.insert("systemCatalog", { ...entry });
    }
    console.log(`Seeded ${ALL_SYSTEM_CATALOG.length} system catalog entries`);

    // Seed maintenance task catalog
    for (const entry of ALL_MAINTENANCE_TASKS) {
      await ctx.db.insert("maintenanceTaskCatalog", { ...entry });
    }
    console.log(
      `Seeded ${ALL_MAINTENANCE_TASKS.length} maintenance task catalog entries`
    );
  },
});
