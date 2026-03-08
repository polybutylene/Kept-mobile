import { internalMutation } from "../_generated/server";

/**
 * Seed cross-references between maintenance tasks, diagnostic trees, and nodes.
 *
 * This links:
 * 1. maintenanceTaskTemplates → diagnosticTrees (via relatedDiagnosticSlugs)
 * 2. diagnosticNodes → maintenanceTasks (via relatedCareTaskKey)
 *
 * Run this AFTER seeding diagnostic trees and maintenance tasks.
 */

// ============================================================
// Cross-reference maps
// ============================================================

/**
 * Map: maintenanceTaskTemplate name pattern → diagnostic tree slugs
 * We match templates by name substring since template IDs vary per deployment.
 */
const TEMPLATE_TO_DIAGNOSTIC_SLUGS: {
  namePattern: string;
  systemTypeNamePattern: string;
  slugs: string[];
}[] = [
  // HVAC → Troubleshooting
  {
    namePattern: "Replace Air Filter",
    systemTypeNamePattern: "Central Air",
    slugs: ["ac-not-cooling", "furnace-not-heating", "strange-hvac-noises"],
  },
  {
    namePattern: "Clean Condenser",
    systemTypeNamePattern: "Central Air",
    slugs: ["ac-not-cooling"],
  },
  {
    namePattern: "Inspect Refrigerant",
    systemTypeNamePattern: "Central Air",
    slugs: ["ac-not-cooling"],
  },
  {
    namePattern: "Check Thermostat",
    systemTypeNamePattern: "",
    slugs: ["thermostat-not-responding", "furnace-not-heating", "ac-not-cooling"],
  },
  {
    namePattern: "Inspect Heat Exchanger",
    systemTypeNamePattern: "Furnace",
    slugs: ["furnace-not-heating"],
  },
  {
    namePattern: "Clean Burner",
    systemTypeNamePattern: "Furnace",
    slugs: ["furnace-not-heating"],
  },
  {
    namePattern: "Lubricate Blower",
    systemTypeNamePattern: "",
    slugs: ["strange-hvac-noises"],
  },
  {
    namePattern: "Check Heat Pump",
    systemTypeNamePattern: "Heat Pump",
    slugs: ["heat-pump-not-heating"],
  },
  {
    namePattern: "Inspect Defrost",
    systemTypeNamePattern: "Heat Pump",
    slugs: ["heat-pump-not-heating"],
  },
  // Plumbing → Troubleshooting
  {
    namePattern: "Flush Water Heater",
    systemTypeNamePattern: "Water Heater",
    slugs: ["no-hot-water"],
  },
  {
    namePattern: "Check Anode Rod",
    systemTypeNamePattern: "Water Heater",
    slugs: ["no-hot-water"],
  },
  {
    namePattern: "Test T&P",
    systemTypeNamePattern: "Water Heater",
    slugs: ["no-hot-water"],
  },
  {
    namePattern: "Inspect Flapper",
    systemTypeNamePattern: "Toilet",
    slugs: ["toilet-running"],
  },
  {
    namePattern: "Water Pressure",
    systemTypeNamePattern: "",
    slugs: ["low-water-pressure"],
  },
  {
    namePattern: "Clean Drain",
    systemTypeNamePattern: "",
    slugs: ["clogged-drain"],
  },
  {
    namePattern: "Replace Faucet",
    systemTypeNamePattern: "",
    slugs: ["leaking-faucet"],
  },
  // Electrical → Troubleshooting
  {
    namePattern: "Test GFCI",
    systemTypeNamePattern: "",
    slugs: ["outlets-not-working"],
  },
  {
    namePattern: "Inspect Panel",
    systemTypeNamePattern: "",
    slugs: ["circuit-breaker-tripping", "lights-flickering"],
  },
  {
    namePattern: "Test Smoke",
    systemTypeNamePattern: "",
    slugs: ["outlets-not-working"],
  },
  // Appliances → Troubleshooting
  {
    namePattern: "Clean Condenser Coils",
    systemTypeNamePattern: "Refrigerator",
    slugs: ["refrigerator-not-cooling"],
  },
  {
    namePattern: "Check Door Seal",
    systemTypeNamePattern: "Refrigerator",
    slugs: ["refrigerator-not-cooling"],
  },
  {
    namePattern: "Inspect Hoses",
    systemTypeNamePattern: "Washing",
    slugs: ["washing-machine-not-draining"],
  },
  {
    namePattern: "Clean Filter",
    systemTypeNamePattern: "Washing",
    slugs: ["washing-machine-not-draining"],
  },
];

/**
 * Map: diagnostic tree slug + node key → care task key
 * Links diagnostic result/action nodes to preventive maintenance tasks.
 */
const NODE_TO_CARE_TASK: {
  treeSlug: string;
  nodeKey: string;
  careTaskKey: string;
}[] = [
  // AC Not Cooling results → HVAC care tasks
  {
    treeSlug: "ac-not-cooling",
    nodeKey: "result_dirty_filter",
    careTaskKey: "hvac_cac_001", // Replace Air Filter
  },
  {
    treeSlug: "ac-not-cooling",
    nodeKey: "result_dirty_coils",
    careTaskKey: "hvac_cac_002", // Clean Outdoor Condenser Coils
  },
  // Furnace Not Heating results
  {
    treeSlug: "furnace-not-heating",
    nodeKey: "result_dirty_filter",
    careTaskKey: "hvac_cac_001", // Replace Air Filter
  },
  // No Hot Water results → plumbing care tasks
  {
    treeSlug: "no-hot-water",
    nodeKey: "result_pilot_relit",
    careTaskKey: "plumb_twh_001", // Flush sediment
  },
  {
    treeSlug: "no-hot-water",
    nodeKey: "result_sediment",
    careTaskKey: "plumb_twh_001", // Flush sediment
  },
  // Toilet Running → plumbing
  {
    treeSlug: "toilet-running",
    nodeKey: "result_flapper",
    careTaskKey: "plumb_twh_001", // (would be toilet-specific if we had one)
  },
  // Refrigerator Not Cooling → appliance care tasks
  {
    treeSlug: "refrigerator-not-cooling",
    nodeKey: "result_dirty_coils",
    careTaskKey: "appl_ref_001", // Clean Condenser Coils
  },
  {
    treeSlug: "refrigerator-not-cooling",
    nodeKey: "result_bad_seal",
    careTaskKey: "appl_ref_002", // Check Door Seals
  },
  // Washing Machine Not Draining → appliance care
  {
    treeSlug: "washing-machine-not-draining",
    nodeKey: "result_clogged_filter",
    careTaskKey: "appl_wsh_001", // Clean Drum/Dispenser
  },
  // Clogged Drain → plumbing
  {
    treeSlug: "clogged-drain",
    nodeKey: "result_cleared",
    careTaskKey: "plumb_twh_001", // Would link to drain maintenance
  },
  // Low Water Pressure
  {
    treeSlug: "low-water-pressure",
    nodeKey: "result_prv_adjustment",
    careTaskKey: "plumb_twh_001",
  },
  // Circuit Breaker Tripping → electrical
  {
    treeSlug: "circuit-breaker-tripping",
    nodeKey: "result_overloaded",
    careTaskKey: "elec_gfci_001", // Test GFCIs
  },
  // Outlets Not Working → electrical
  {
    treeSlug: "outlets-not-working",
    nodeKey: "result_gfci_reset",
    careTaskKey: "elec_gfci_001", // Test GFCIs
  },
  // Lights Flickering
  {
    treeSlug: "lights-flickering",
    nodeKey: "result_loose_bulb",
    careTaskKey: "elec_gfci_001",
  },
];

// ============================================================
// Seed mutation
// ============================================================

export const seed = internalMutation({
  handler: async (ctx) => {
    let templatePatches = 0;
    let nodePatches = 0;
    let templateSkips = 0;
    let nodeSkips = 0;

    // 1. Patch maintenanceTaskTemplates with relatedDiagnosticSlugs
    const allTemplates = await ctx.db.query("maintenanceTaskTemplates").collect();

    for (const mapping of TEMPLATE_TO_DIAGNOSTIC_SLUGS) {
      // Find matching templates
      const matches = allTemplates.filter((t) => {
        const nameMatch = t.name.toLowerCase().includes(mapping.namePattern.toLowerCase());
        if (!mapping.systemTypeNamePattern) return nameMatch;
        // We don't have systemType name directly, so just match by name pattern
        return nameMatch;
      });

      for (const template of matches) {
        // Merge new slugs with any existing
        const existingSlugs = template.relatedDiagnosticSlugs ?? [];
        const newSlugs = [...new Set([...existingSlugs, ...mapping.slugs])];

        if (newSlugs.length === existingSlugs.length) {
          templateSkips++;
          continue;
        }

        await ctx.db.patch(template._id, {
          relatedDiagnosticSlugs: newSlugs,
        });
        templatePatches++;
      }
    }

    // 2. Patch diagnosticNodes with relatedCareTaskKey
    for (const mapping of NODE_TO_CARE_TASK) {
      // Find the tree
      const tree = await ctx.db
        .query("diagnosticTrees")
        .withIndex("by_slug", (q) => q.eq("slug", mapping.treeSlug))
        .first();
      if (!tree) continue;

      // Find the specific node
      const node = await ctx.db
        .query("diagnosticNodes")
        .withIndex("by_nodeKey", (q) =>
          q.eq("treeId", tree._id).eq("nodeKey", mapping.nodeKey)
        )
        .first();
      if (!node) continue;

      if (node.relatedCareTaskKey === mapping.careTaskKey) {
        nodeSkips++;
        continue;
      }

      await ctx.db.patch(node._id, {
        relatedCareTaskKey: mapping.careTaskKey,
      });
      nodePatches++;
    }

    console.log(
      `[crossReferences] Patched ${templatePatches} templates (${templateSkips} already had slugs), ${nodePatches} nodes (${nodeSkips} already linked)`
    );
    return { templatePatches, templateSkips, nodePatches, nodeSkips };
  },
});
