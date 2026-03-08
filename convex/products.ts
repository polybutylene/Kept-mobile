import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { productTier } from "./schema";

/**
 * Get all products for a system type
 */
export const getProductsBySystemType = query({
  args: {
    systemTypeId: v.id("systemTypes"),
    tier: v.optional(productTier),
  },
  handler: async (ctx, args) => {
    let products;
    if (args.tier) {
      products = await ctx.db
        .query("products")
        .withIndex("by_systemType_tier", (q) =>
          q.eq("systemTypeId", args.systemTypeId).eq("tier", args.tier!)
        )
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();
    } else {
      products = await ctx.db
        .query("products")
        .withIndex("by_systemType", (q) =>
          q.eq("systemTypeId", args.systemTypeId)
        )
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();
    }

    // Group by tier for easy consumption
    const byTier = {
      economy: products.filter((p) => p.tier === "economy"),
      standard: products.filter((p) => p.tier === "standard"),
      premium: products.filter((p) => p.tier === "premium"),
      luxury: products.filter((p) => p.tier === "luxury"),
    };

    return {
      all: products,
      byTier,
    };
  },
});

/**
 * Get a single product by ID
 */
export const getProduct = query({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) return null;

    const systemType = await ctx.db.get(product.systemTypeId);
    return {
      ...product,
      systemType: systemType
        ? {
            name: systemType.name,
            category: systemType.category,
          }
        : null,
    };
  },
});

/**
 * Get products by brand
 */
export const getProductsByBrand = query({
  args: {
    brand: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_brand", (q) => q.eq("brand", args.brand))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

/**
 * Get replacement options for a system
 * Returns products organized as one-to-one and upgrade options
 */
export const getReplacementOptions = query({
  args: {
    systemId: v.id("systems"),
  },
  handler: async (ctx, args) => {
    const system = await ctx.db.get(args.systemId);
    if (!system) return null;

    const systemType = await ctx.db.get(system.systemTypeId);
    if (!systemType) return null;

    const products = await ctx.db
      .query("products")
      .withIndex("by_systemType", (q) =>
        q.eq("systemTypeId", system.systemTypeId)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Calculate price ranges for display
    const priceRanges = {
      economy: products
        .filter((p) => p.tier === "economy")
        .reduce(
          (acc, p) => ({
            low: Math.min(acc.low, p.msrpLow + p.installCostLow),
            high: Math.max(acc.high, p.msrpHigh + p.installCostHigh),
          }),
          { low: Infinity, high: 0 }
        ),
      standard: products
        .filter((p) => p.tier === "standard")
        .reduce(
          (acc, p) => ({
            low: Math.min(acc.low, p.msrpLow + p.installCostLow),
            high: Math.max(acc.high, p.msrpHigh + p.installCostHigh),
          }),
          { low: Infinity, high: 0 }
        ),
      premium: products
        .filter((p) => p.tier === "premium")
        .reduce(
          (acc, p) => ({
            low: Math.min(acc.low, p.msrpLow + p.installCostLow),
            high: Math.max(acc.high, p.msrpHigh + p.installCostHigh),
          }),
          { low: Infinity, high: 0 }
        ),
      luxury: products
        .filter((p) => p.tier === "luxury")
        .reduce(
          (acc, p) => ({
            low: Math.min(acc.low, p.msrpLow + p.installCostLow),
            high: Math.max(acc.high, p.msrpHigh + p.installCostHigh),
          }),
          { low: Infinity, high: 0 }
        ),
    };

    // Clean up infinity values
    Object.keys(priceRanges).forEach((tier) => {
      const range = priceRanges[tier as keyof typeof priceRanges];
      if (range.low === Infinity) range.low = 0;
      if (range.high === 0) range.high = 0;
    });

    return {
      currentSystem: {
        _id: system._id,
        name: system.name,
        manufacturer: system.manufacturer,
        modelNumber: system.modelNumber,
        healthScore: system.healthScore,
        remainingLifePercent: system.remainingLifePercent,
        estimatedReplacementYear: system.estimatedReplacementYear,
        estimatedReplacementCost: system.estimatedReplacementCost,
      },
      systemType: {
        _id: systemType._id,
        name: systemType.name,
        category: systemType.category,
        defaultLifespanYears: systemType.defaultLifespanYears,
        defaultReplacementCostLow: systemType.defaultReplacementCostLow,
        defaultReplacementCostMid: systemType.defaultReplacementCostMid,
        defaultReplacementCostHigh: systemType.defaultReplacementCostHigh,
      },
      options: {
        oneToOne: products.filter((p) => p.tier === "economy" || p.tier === "standard"),
        upgrades: products.filter((p) => p.tier === "premium" || p.tier === "luxury"),
      },
      byTier: {
        economy: products.filter((p) => p.tier === "economy"),
        standard: products.filter((p) => p.tier === "standard"),
        premium: products.filter((p) => p.tier === "premium"),
        luxury: products.filter((p) => p.tier === "luxury"),
      },
      priceRanges,
    };
  },
});

/**
 * Compare multiple products
 */
export const compareProducts = query({
  args: {
    productIds: v.array(v.id("products")),
  },
  handler: async (ctx, args) => {
    const products = await Promise.all(
      args.productIds.map(async (id) => {
        const product = await ctx.db.get(id);
        if (!product) return null;
        const systemType = await ctx.db.get(product.systemTypeId);
        return {
          ...product,
          systemTypeName: systemType?.name,
        };
      })
    );

    return products.filter(Boolean);
  },
});

/**
 * Search products
 */
export const searchProducts = query({
  args: {
    query: v.string(),
    systemTypeId: v.optional(v.id("systemTypes")),
  },
  handler: async (ctx, args) => {
    const searchLower = args.query.toLowerCase();

    let products;
    if (args.systemTypeId) {
      products = await ctx.db
        .query("products")
        .withIndex("by_systemType", (q) =>
          q.eq("systemTypeId", args.systemTypeId!)
        )
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();
    } else {
      products = await ctx.db
        .query("products")
        .withIndex("by_isActive", (q) => q.eq("isActive", true))
        .collect();
    }

    // Filter by search query
    return products.filter(
      (p) =>
        p.brand.toLowerCase().includes(searchLower) ||
        p.modelLine.toLowerCase().includes(searchLower) ||
        p.modelNumber.toLowerCase().includes(searchLower) ||
        p.features.some((f) => f.toLowerCase().includes(searchLower))
    );
  },
});

/**
 * Get all unique brands
 */
export const getAllBrands = query({
  args: {
    systemTypeId: v.optional(v.id("systemTypes")),
  },
  handler: async (ctx, args) => {
    let products;
    if (args.systemTypeId) {
      products = await ctx.db
        .query("products")
        .withIndex("by_systemType", (q) =>
          q.eq("systemTypeId", args.systemTypeId!)
        )
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();
    } else {
      products = await ctx.db
        .query("products")
        .withIndex("by_isActive", (q) => q.eq("isActive", true))
        .collect();
    }

    const brands = [...new Set(products.map((p) => p.brand))].sort();
    return brands;
  },
});

// ============================================
// ADMIN/SEED MUTATIONS (for populating catalog)
// ============================================

/**
 * Create a new product (admin only in production)
 */
export const createProduct = mutation({
  args: {
    systemTypeId: v.id("systemTypes"),
    brand: v.string(),
    modelLine: v.string(),
    modelNumber: v.string(),
    tier: productTier,
    efficiencyRating: v.optional(v.string()),
    capacityRange: v.optional(v.string()),
    features: v.array(v.string()),
    warrantyYears: v.optional(v.number()),
    expectedLifespan: v.optional(v.number()),
    msrpLow: v.number(),
    msrpHigh: v.number(),
    installCostLow: v.number(),
    installCostHigh: v.number(),
    imageUrl: v.optional(v.string()),
    specSheetUrl: v.optional(v.string()),
    productUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const productId = await ctx.db.insert("products", {
      ...args,
      isActive: true,
    });
    return productId;
  },
});

/**
 * Update a product
 */
export const updateProduct = mutation({
  args: {
    productId: v.id("products"),
    brand: v.optional(v.string()),
    modelLine: v.optional(v.string()),
    modelNumber: v.optional(v.string()),
    tier: v.optional(productTier),
    efficiencyRating: v.optional(v.string()),
    capacityRange: v.optional(v.string()),
    features: v.optional(v.array(v.string())),
    warrantyYears: v.optional(v.number()),
    expectedLifespan: v.optional(v.number()),
    msrpLow: v.optional(v.number()),
    msrpHigh: v.optional(v.number()),
    installCostLow: v.optional(v.number()),
    installCostHigh: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    specSheetUrl: v.optional(v.string()),
    productUrl: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { productId, ...updates } = args;
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    await ctx.db.patch(args.productId, cleanUpdates);
    return await ctx.db.get(args.productId);
  },
});

/**
 * Delete a product (soft delete by setting isActive = false)
 */
export const deleteProduct = mutation({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.productId, { isActive: false });
    return true;
  },
});

/**
 * Bulk create products (for seeding)
 */
export const bulkCreateProducts = mutation({
  args: {
    products: v.array(
      v.object({
        systemTypeId: v.id("systemTypes"),
        brand: v.string(),
        modelLine: v.string(),
        modelNumber: v.string(),
        tier: productTier,
        efficiencyRating: v.optional(v.string()),
        capacityRange: v.optional(v.string()),
        features: v.array(v.string()),
        warrantyYears: v.optional(v.number()),
        expectedLifespan: v.optional(v.number()),
        msrpLow: v.number(),
        msrpHigh: v.number(),
        installCostLow: v.number(),
        installCostHigh: v.number(),
        imageUrl: v.optional(v.string()),
        specSheetUrl: v.optional(v.string()),
        productUrl: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const ids = [];
    for (const product of args.products) {
      const id = await ctx.db.insert("products", {
        ...product,
        isActive: true,
      });
      ids.push(id);
    }
    return ids;
  },
});
