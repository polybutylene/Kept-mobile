import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getUserHomes = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) return [];

    const homes = await ctx.db
      .query("homes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return homes.filter((h) => !h.isArchived);
  },
});

export const getById = query({
  args: { homeId: v.id("homes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.homeId);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    addressLine1: v.optional(v.string()),
    addressLine2: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    yearBuilt: v.optional(v.number()),
    squareFootage: v.optional(v.number()),
    climateZone: v.optional(v.number()),
    waterHardness: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) throw new Error("User not found");

    const homeId = await ctx.db.insert("homes", {
      userId: user._id,
      name: args.name,
      addressLine1: args.addressLine1,
      addressLine2: args.addressLine2,
      city: args.city,
      state: args.state,
      zipCode: args.zipCode,
      yearBuilt: args.yearBuilt,
      squareFootage: args.squareFootage,
      climateZone: args.climateZone,
      waterHardness: args.waterHardness,
      overallHealthScore: 100,
      systemsCount: 0,
      isArchived: false,
    });

    return homeId;
  },
});

export const update = mutation({
  args: {
    homeId: v.id("homes"),
    name: v.optional(v.string()),
    addressLine1: v.optional(v.string()),
    addressLine2: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    yearBuilt: v.optional(v.number()),
    squareFootage: v.optional(v.number()),
    climateZone: v.optional(v.number()),
    waterHardness: v.optional(v.string()),
    overallHealthScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { homeId, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, val]) => val !== undefined)
    );
    await ctx.db.patch(homeId, filtered);
  },
});
