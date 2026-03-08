"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const createKeptProfileFromInspection = action({
  args: { inspectionId: v.id("inspections") },
  handler: async (ctx, args): Promise<{ homeId: Id<"homes"> }> => {
    const inspection = await ctx.runQuery(api.inspector.getInspection, {
      inspectionId: args.inspectionId,
    });
    if (!inspection) throw new Error("Inspection not found");

    const homeId: Id<"homes"> = await ctx.runMutation(internal.inspectorHandoffHelpers.createHome, {
      inspectionId: args.inspectionId,
      address: inspection.propertyAddress,
      city: inspection.propertyCity || "",
      state: inspection.propertyState || "",
      zip: inspection.propertyZip || "",
      yearBuilt: inspection.yearBuilt,
      squareFootage: inspection.squareFootage,
    });

    for (const sys of inspection.systems || []) {
      const healthScore =
        sys.condition === "good" ? 85 :
        sys.condition === "fair" ? 65 :
        sys.condition === "poor" ? 40 : 20;
      await ctx.runMutation(internal.inspectorHandoffHelpers.createSystem, {
        homeId,
        name: sys.systemName,
        category: sys.category,
        manufacturer: sys.make || undefined,
        modelNumber: sys.model || undefined,
        serialNumber: sys.serialNumber || undefined,
        yearManufactured: sys.yearManufactured || undefined,
        healthScore,
        condition: sys.condition,
        notes: sys.notes || undefined,
      });
    }

    await ctx.runMutation(api.inspector.updateInspection, {
      inspectionId: args.inspectionId,
      keptHomeId: homeId,
    });

    return { homeId };
  },
});
