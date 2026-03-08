import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createCommonArea = mutation({
  args: {
    name: v.string(),
    propertyGroup: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!profile || profile.tier !== "property_manager") {
      throw new Error("Not authorized");
    }

    const commonAreaId = await ctx.db.insert("commonAreas", {
      managerId: profile._id,
      name: args.name,
      propertyGroup: args.propertyGroup,
      isArchived: false,
    });

    return commonAreaId;
  },
});

export const getCommonAreas = query({
  args: {
    includeArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!profile || profile.tier !== "property_manager") return [];

    let commonAreas = await ctx.db
      .query("commonAreas")
      .withIndex("by_manager", (q) => q.eq("managerId", profile._id))
      .collect();

    if (!args.includeArchived) {
      commonAreas = commonAreas.filter((area) => !area.isArchived);
    }

    return commonAreas;
  },
});

export const addSystemToCommonArea = mutation({
  args: {
    systemId: v.id("systems"),
    commonAreaId: v.id("commonAreas"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!profile || profile.tier !== "property_manager") {
      throw new Error("Not authorized");
    }

    const commonArea = await ctx.db.get(args.commonAreaId);
    if (!commonArea || commonArea.managerId !== profile._id) {
      throw new Error("Common area not found");
    }

    const system = await ctx.db.get(args.systemId);
    if (!system) throw new Error("System not found");

    if (system.homeId) {
      const home = await ctx.db.get(system.homeId);
      if (!home || home.ownerId !== profile._id) {
        throw new Error("Not authorized");
      }
    }

    await ctx.db.patch(args.systemId, {
      commonAreaId: args.commonAreaId,
    });

    return true;
  },
});
