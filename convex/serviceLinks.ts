import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { serviceLinkType } from "./schema";

function generateLinkId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let result = "";
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const createLink = mutation({
  args: {
    propertyId: v.id("homes"),
    type: serviceLinkType,
    startsAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    renterName: v.optional(v.string()),
    renterEmail: v.optional(v.string()),
    renterPhone: v.optional(v.string()),
    unitLabel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || profile.tier !== "property_manager") {
      throw new Error("Only property managers can create service links");
    }

    const home = await ctx.db.get(args.propertyId);
    if (!home || home.ownerId !== profile._id) {
      throw new Error("Property not found or access denied");
    }

    let linkId = generateLinkId();
    let existing = await ctx.db
      .query("serviceLinks")
      .withIndex("by_linkId", (q) => q.eq("linkId", linkId))
      .first();
    while (existing) {
      linkId = generateLinkId();
      existing = await ctx.db
        .query("serviceLinks")
        .withIndex("by_linkId", (q) => q.eq("linkId", linkId))
        .first();
    }

    const now = Date.now();

    const id = await ctx.db.insert("serviceLinks", {
      linkId,
      propertyId: args.propertyId,
      managerId: profile._id,
      type: args.type,
      startsAt: args.startsAt ?? now,
      expiresAt: args.expiresAt,
      isRevoked: false,
      renterName: args.renterName,
      renterEmail: args.renterEmail,
      renterPhone: args.renterPhone,
      unitLabel: args.unitLabel,
      createdAt: now,
      accessCount: 0,
    });

    return { id, linkId };
  },
});

export const getLinksForProperty = query({
  args: { propertyId: v.id("homes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || profile.tier !== "property_manager") return [];

    const home = await ctx.db.get(args.propertyId);
    if (!home || home.ownerId !== profile._id) return [];

    const links = await ctx.db
      .query("serviceLinks")
      .withIndex("by_propertyId", (q) => q.eq("propertyId", args.propertyId))
      .collect();

    return links.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getLinksForManager = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || profile.tier !== "property_manager") return [];

    const links = await ctx.db
      .query("serviceLinks")
      .withIndex("by_managerId", (q) => q.eq("managerId", profile._id))
      .collect();

    const enriched = await Promise.all(
      links.map(async (link) => {
        const home = await ctx.db.get(link.propertyId);
        return {
          ...link,
          propertyName: home?.name || home?.addressLine1 || "Unknown",
          propertyAddress: home
            ? `${home.addressLine1 || ""}, ${home.city || ""}, ${home.state || ""}`
            : "",
        };
      })
    );

    return enriched.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const revokeLink = mutation({
  args: { linkId: v.id("serviceLinks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile) throw new Error("Profile not found");

    const link = await ctx.db.get(args.linkId);
    if (!link || link.managerId !== profile._id) {
      throw new Error("Link not found or access denied");
    }

    await ctx.db.patch(args.linkId, { isRevoked: true });
    return { success: true };
  },
});

export const deleteLink = mutation({
  args: { linkId: v.id("serviceLinks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile) throw new Error("Profile not found");

    const link = await ctx.db.get(args.linkId);
    if (!link || link.managerId !== profile._id) {
      throw new Error("Link not found or access denied");
    }

    await ctx.db.delete(args.linkId);
    return { success: true };
  },
});

// --- Internal functions for public HTTP endpoints ---

export const validateLinkInternal = internalQuery({
  args: { linkId: v.string() },
  handler: async (ctx, args) => {
    const link = await ctx.db
      .query("serviceLinks")
      .withIndex("by_linkId", (q) => q.eq("linkId", args.linkId))
      .first();

    if (!link) return { valid: false, reason: "not_found" as const };

    if (link.isRevoked) return { valid: false, reason: "revoked" as const };

    const now = Date.now();
    if (link.expiresAt && now > link.expiresAt) {
      return { valid: false, reason: "expired" as const };
    }

    if (now < link.startsAt) {
      return { valid: false, reason: "not_started" as const };
    }

    if (link.type === "one_time" && link.usedAt) {
      return { valid: false, reason: "used" as const };
    }

    const home = await ctx.db.get(link.propertyId);

    return {
      valid: true,
      reason: "ok" as const,
      link: {
        _id: link._id,
        linkId: link.linkId,
        propertyId: link.propertyId,
        managerId: link.managerId,
        type: link.type,
        renterName: link.renterName,
        renterEmail: link.renterEmail,
        renterPhone: link.renterPhone,
        unitLabel: link.unitLabel,
      },
      property: home
        ? {
            name: home.name || home.addressLine1 || "Property",
            city: home.city || "",
            state: home.state || "",
          }
        : null,
    };
  },
});

export const recordLinkAccess = internalMutation({
  args: { linkId: v.string() },
  handler: async (ctx, args) => {
    const link = await ctx.db
      .query("serviceLinks")
      .withIndex("by_linkId", (q) => q.eq("linkId", args.linkId))
      .first();

    if (link) {
      await ctx.db.patch(link._id, {
        lastAccessedAt: Date.now(),
        accessCount: link.accessCount + 1,
      });
    }
  },
});

export const markLinkUsed = internalMutation({
  args: { linkId: v.string() },
  handler: async (ctx, args) => {
    const link = await ctx.db
      .query("serviceLinks")
      .withIndex("by_linkId", (q) => q.eq("linkId", args.linkId))
      .first();

    if (link && link.type === "one_time" && !link.usedAt) {
      await ctx.db.patch(link._id, { usedAt: Date.now() });
    }
  },
});
