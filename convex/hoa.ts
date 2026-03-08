import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const SYSTEM_CATEGORIES = [
  "roof", "exterior_walls", "windows_doors_exterior", "foundation",
  "hvac", "water_heater", "plumbing_interior", "plumbing_exterior",
  "electrical_interior", "electrical_exterior", "appliances", "flooring",
  "interior_paint", "exterior_paint", "landscaping", "pest_control",
  "pool_hot_tub", "elevator", "parking_garage", "common_areas",
] as const;

const CONDO_COA_DEFAULTS: Record<string, "owner" | "coa"> = {
  roof: "coa", exterior_walls: "coa", foundation: "coa",
  plumbing_exterior: "coa", electrical_exterior: "coa",
  landscaping: "coa", common_areas: "coa", exterior_paint: "coa",
  elevator: "coa", parking_garage: "coa",
};

const TOWNHOME_HOA_DEFAULTS: Record<string, "owner" | "hoa"> = {
  roof: "hoa", exterior_walls: "hoa", landscaping: "hoa", exterior_paint: "hoa",
};

export const setHoaStatus = mutation({
  args: {
    homeId: v.id("homes"),
    status: v.union(v.literal("hoa"), v.literal("coa"), v.literal("both"), v.literal("none")),
    monthlyFee: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.patch(args.homeId, {
      hoaStatus: args.status,
      hoaMonthlyFee: args.monthlyFee,
    });
  },
});

export const getHoaResponsibilities = query({
  args: { homeId: v.id("homes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("hoaResponsibilities")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .collect();
  },
});

export const setResponsibility = mutation({
  args: {
    homeId: v.id("homes"),
    systemCategory: v.string(),
    responsibleParty: v.union(v.literal("owner"), v.literal("hoa"), v.literal("coa")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("hoaResponsibilities")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .collect();
    const match = existing.find((r) => r.systemCategory === args.systemCategory);
    if (match) {
      await ctx.db.patch(match._id, { responsibleParty: args.responsibleParty, notes: args.notes });
    } else {
      await ctx.db.insert("hoaResponsibilities", {
        homeId: args.homeId,
        systemCategory: args.systemCategory,
        responsibleParty: args.responsibleParty,
        notes: args.notes,
      });
    }
  },
});

export const setBulkResponsibilities = mutation({
  args: {
    homeId: v.id("homes"),
    assignments: v.array(v.object({
      systemCategory: v.string(),
      responsibleParty: v.union(v.literal("owner"), v.literal("hoa"), v.literal("coa")),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("hoaResponsibilities")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .collect();
    for (const item of existing) {
      await ctx.db.delete(item._id);
    }
    for (const assignment of args.assignments) {
      await ctx.db.insert("hoaResponsibilities", {
        homeId: args.homeId,
        systemCategory: assignment.systemCategory,
        responsibleParty: assignment.responsibleParty,
      });
    }
  },
});

export const getOwnerResponsibleCategories = query({
  args: { homeId: v.id("homes") },
  handler: async (ctx, args) => {
    const responsibilities = await ctx.db
      .query("hoaResponsibilities")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .collect();
    if (responsibilities.length === 0) return SYSTEM_CATEGORIES.slice();
    const hoaManaged = new Set(
      responsibilities.filter((r) => r.responsibleParty !== "owner").map((r) => r.systemCategory)
    );
    return SYSTEM_CATEGORIES.filter((cat) => !hoaManaged.has(cat));
  },
});

export const getDefaultResponsibilities = query({
  args: { propertyType: v.string(), hoaStatus: v.string() },
  handler: async (_ctx, args) => {
    const defaults: Array<{ systemCategory: string; responsibleParty: "owner" | "hoa" | "coa" }> = [];
    for (const category of SYSTEM_CATEGORIES) {
      let party: "owner" | "hoa" | "coa" = "owner";
      if (args.propertyType === "condo" && (args.hoaStatus === "coa" || args.hoaStatus === "both")) {
        party = CONDO_COA_DEFAULTS[category] || "owner";
      } else if (args.propertyType === "townhouse" && (args.hoaStatus === "hoa" || args.hoaStatus === "both")) {
        party = TOWNHOME_HOA_DEFAULTS[category] || "owner";
      }
      defaults.push({ systemCategory: category, responsibleParty: party });
    }
    return defaults;
  },
});
