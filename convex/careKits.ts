import { v } from "convex/values";
import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ============================================================
// Queries
// ============================================================

export const getProductsForTask = query({
  args: {
    taskType: v.string(),
    systemId: v.optional(v.id("systems")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const links = await ctx.db
      .query("taskProductLinks")
      .withIndex("by_taskType", (q) => q.eq("taskType", args.taskType))
      .collect();

    if (links.length === 0) return [];

    const system = args.systemId ? await ctx.db.get(args.systemId) : null;
    const systemType = system?.systemTypeId
      ? await ctx.db.get(system.systemTypeId)
      : null;

    const results: Array<{
      product: any;
      matchReason: string;
      confidence: "exact" | "compatible" | "universal";
      isPrimary: boolean;
    }> = [];

    for (const link of links) {
      for (const productId of link.productIds) {
        let products: any[];
        if (productId.includes("*")) {
          const prefix = productId.replace("*", "");
          const all = await ctx.db
            .query("careKitProducts")
            .withIndex("by_productId")
            .collect();
          products = all.filter((p) => p.productId.startsWith(prefix) && p.isActive);
        } else {
          const all = await ctx.db
            .query("careKitProducts")
            .withIndex("by_productId")
            .collect();
          products = all.filter((p) => p.productId === productId && p.isActive);
        }

        for (const product of products) {
          if (product.matchType === "filter_size" && system) {
            const filterSize = system.conditionNotes?.match(/filter[:\s]*(\d+x\d+x\d+)/i)?.[1];
            if (filterSize && product.matchCriteria?.filterSize === filterSize) {
              results.push({
                product,
                matchReason: `Matched by filter size: ${filterSize}`,
                confidence: "exact",
                isPrimary: link.isPrimary,
              });
            }
          } else if (product.matchType === "system_type" && systemType) {
            const typeMatch =
              product.matchCriteria?.systemTypes?.includes(systemType.category) ||
              product.matchCriteria?.applianceType === systemType.category;
            if (typeMatch) {
              results.push({
                product,
                matchReason: `Compatible with your ${systemType.name}`,
                confidence: "compatible",
                isPrimary: link.isPrimary,
              });
            }
          } else if (product.matchType === "universal") {
            results.push({
              product,
              matchReason: "Recommended for all homes",
              confidence: "universal",
              isPrimary: link.isPrimary,
            });
          }
        }
      }
    }

    const order = { exact: 0, compatible: 1, universal: 2 };
    return results.sort((a, b) => order[a.confidence] - order[b.confidence]);
  },
});

export const getCareKitForTask = query({
  args: { taskId: v.id("scheduledMaintenance") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!profile) return null;

    const isPremium = profile.tier === "premium";
    const task = await ctx.db.get(args.taskId);
    if (!task) return null;

    const taskType = task.name
      ?.toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");

    const links = await ctx.db
      .query("taskProductLinks")
      .withIndex("by_taskType", (q) => q.eq("taskType", taskType ?? ""))
      .collect();

    if (links.length === 0) {
      const categoryLinks = await ctx.db
        .query("taskProductLinks")
        .withIndex("by_taskType", (q) => q.eq("taskType", task.category ?? ""))
        .collect();
      if (categoryLinks.length === 0) return null;
    }

    return { isPremium, taskType, hasProducts: links.length > 0 };
  },
});

// ============================================================
// Mutations
// ============================================================

export const trackPurchaseClick = mutation({
  args: {
    productId: v.string(),
    retailer: v.string(),
    taskId: v.optional(v.id("scheduledMaintenance")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;

    if (args.taskId) {
      const existing = await ctx.db
        .query("purchaseReminders")
        .withIndex("by_taskId", (q) => q.eq("taskId", args.taskId!))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          status: "clicked",
          clickedAt: Date.now(),
        });
        return;
      }
    }

    await ctx.db.insert("purchaseReminders", {
      userId,
      taskId: args.taskId!,
      productId: args.productId,
      reminderDate: Date.now(),
      status: "clicked",
      clickedAt: Date.now(),
    });
  },
});

// ============================================================
// Internal — Seed product catalog
// ============================================================

export const seedProductCatalog = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("careKitProducts").first();
    if (existing) return;

    const products = [
      {
        productId: "drain-bioenzyme-monthly",
        name: "Bio-Clean Drain Septic Bacteria (2 lb)",
        category: "drain_care",
        subcategory: "bioenzyme",
        description: "All-natural bioenzyme drain maintainer. Pour monthly to prevent buildup. Safe for septic.",
        matchType: "universal",
        matchCriteria: { systemTypes: ["plumbing"] },
        purchaseLinks: [
          { retailer: "amazon", url: "https://amazon.com/dp/B000BVA4SK?tag=kept-20", primeEligible: true },
        ],
        estimatedPrice: { low: 42, high: 55 },
        isActive: true,
      },
      {
        productId: "drain-enzyme-pods",
        name: "Green Gobbler Enzyme Drain Cleaner Pods (12-Pack)",
        category: "drain_care",
        subcategory: "bioenzyme",
        description: "Pre-measured enzyme pods for monthly drain maintenance. Drop one pod per drain monthly.",
        matchType: "universal",
        matchCriteria: { systemTypes: ["plumbing"] },
        purchaseLinks: [
          { retailer: "amazon", url: "https://amazon.com/dp/B07HGR2S5K?tag=kept-20", primeEligible: true },
        ],
        estimatedPrice: { low: 18, high: 28 },
        isActive: true,
      },
      {
        productId: "condensate-line-tablets",
        name: "AC Condensate Drain Line Cleaning Tablets (6-Pack)",
        category: "drain_care",
        subcategory: "condensate",
        description: "Drop in your AC condensate drain pan monthly during cooling season. Prevents the #1 AC service call.",
        matchType: "system_type",
        matchCriteria: { systemTypes: ["hvac"] },
        purchaseLinks: [
          { retailer: "amazon", url: "https://amazon.com/dp/B004FLK11A?tag=kept-20", primeEligible: true },
        ],
        estimatedPrice: { low: 8, high: 14 },
        isActive: true,
      },
      {
        productId: "wh-flush-kit",
        name: "Water Heater Flush Kit with Hose Adapter",
        category: "water_heater",
        description: "Complete kit for annual water heater flushing. Extends tank life by 3-5 years.",
        matchType: "system_type",
        matchCriteria: { systemTypes: ["water_heater"] },
        purchaseLinks: [
          { retailer: "amazon", url: "https://amazon.com/dp/B07BK41D8X?tag=kept-20", primeEligible: true },
        ],
        estimatedPrice: { low: 18, high: 30 },
        isActive: true,
      },
      {
        productId: "wh-anode-rod-aluminum",
        name: "Aluminum/Zinc Anode Rod — Universal Fit",
        category: "water_heater",
        description: "Sacrificial anode rod. Replace every 3-5 years to prevent tank corrosion. Fits most 40-50 gallon tanks.",
        matchType: "system_type",
        matchCriteria: { systemTypes: ["water_heater"] },
        purchaseLinks: [
          { retailer: "amazon", url: "https://amazon.com/dp/B01FH2VQIG?tag=kept-20", primeEligible: true },
        ],
        estimatedPrice: { low: 22, high: 38 },
        isActive: true,
      },
      {
        productId: "dishwasher-cleaner",
        name: "Affresh Dishwasher Cleaner (6 Tablets)",
        category: "appliance",
        subcategory: "dishwasher",
        description: "Monthly cleaning tablets to remove limescale, grease, and odor. Run on empty hot cycle.",
        matchType: "system_type",
        matchCriteria: { applianceType: "appliances" },
        purchaseLinks: [
          { retailer: "amazon", url: "https://amazon.com/dp/B00SXV7JFI?tag=kept-20", primeEligible: true },
        ],
        estimatedPrice: { low: 8, high: 14 },
        isActive: true,
      },
      {
        productId: "washing-machine-cleaner",
        name: "Affresh Washing Machine Cleaner (6 Tablets)",
        category: "appliance",
        subcategory: "washing_machine",
        description: "Monthly cleaning tablets for front-load and top-load washers. Removes residue and odor.",
        matchType: "system_type",
        matchCriteria: { applianceType: "appliances" },
        purchaseLinks: [
          { retailer: "amazon", url: "https://amazon.com/dp/B00FCIOBZO?tag=kept-20", primeEligible: true },
        ],
        estimatedPrice: { low: 9, high: 14 },
        isActive: true,
      },
      {
        productId: "dryer-vent-brush-kit",
        name: "Dryer Vent Cleaning Brush Kit (12 ft)",
        category: "appliance",
        subcategory: "dryer",
        description: "Flexible brush kit for annual dryer vent cleaning. Reduces fire risk. Works with drill attachment.",
        matchType: "system_type",
        matchCriteria: { applianceType: "appliances" },
        purchaseLinks: [
          { retailer: "amazon", url: "https://amazon.com/dp/B01IHZP1NC?tag=kept-20", primeEligible: true },
        ],
        estimatedPrice: { low: 18, high: 28 },
        isActive: true,
      },
      {
        productId: "smoke-detector-batteries-9v",
        name: "9V Batteries for Smoke Detectors (8-Pack)",
        category: "general",
        subcategory: "safety",
        description: "Long-life 9V batteries for smoke and CO detectors. Replace annually.",
        matchType: "universal",
        purchaseLinks: [
          { retailer: "amazon", url: "https://amazon.com/dp/B0BH8HYQG5?tag=kept-20", primeEligible: true },
        ],
        estimatedPrice: { low: 12, high: 20 },
        isActive: true,
      },
      {
        productId: "kitchen-bath-caulk",
        name: "GE Silicone Kitchen & Bath Caulk (Clear, 2-Pack)",
        category: "general",
        subcategory: "sealing",
        description: "100% silicone caulk for resealing kitchen sink, bathtub, and shower. Mold-resistant.",
        matchType: "universal",
        purchaseLinks: [
          { retailer: "amazon", url: "https://amazon.com/dp/B002DSMY30?tag=kept-20", primeEligible: true },
        ],
        estimatedPrice: { low: 10, high: 16 },
        isActive: true,
      },
    ];

    for (const p of products) {
      await ctx.db.insert("careKitProducts", p);
    }

    const taskLinks = [
      { taskType: "drain_maintenance", productIds: ["drain-bioenzyme-monthly", "drain-enzyme-pods"], isPrimary: true },
      { taskType: "condensate_line_clean", productIds: ["condensate-line-tablets"], isPrimary: true },
      { taskType: "water_heater_flush", productIds: ["wh-flush-kit"], isPrimary: true },
      { taskType: "anode_rod_inspection", productIds: ["wh-anode-rod-aluminum"], isPrimary: false, notes: "Only if replacement needed" },
      { taskType: "dishwasher_clean", productIds: ["dishwasher-cleaner"], isPrimary: true },
      { taskType: "washing_machine_clean", productIds: ["washing-machine-cleaner"], isPrimary: true },
      { taskType: "dryer_vent_clean", productIds: ["dryer-vent-brush-kit"], isPrimary: true },
      { taskType: "smoke_detector_battery", productIds: ["smoke-detector-batteries-9v"], isPrimary: true },
      { taskType: "caulk_reseal", productIds: ["kitchen-bath-caulk"], isPrimary: true },
    ];

    for (const link of taskLinks) {
      await ctx.db.insert("taskProductLinks", link);
    }
  },
});
