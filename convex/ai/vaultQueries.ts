/**
 * Vault Internal Queries
 *
 * Internal queries used by vault analysis actions.
 */

import { internalQuery } from "../_generated/server";
import { v } from "convex/values";
import { calculateAge } from "../lib/weibull";

/**
 * Get a service document by ID (internal)
 */
export const getDocument = internalQuery({
  args: { documentId: v.id("serviceDocuments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.documentId);
  },
});

/**
 * Get system info for AI context (internal)
 */
export const getSystemInfo = internalQuery({
  args: { systemId: v.id("systems") },
  handler: async (ctx, args) => {
    const system = await ctx.db.get(args.systemId);
    if (!system) return null;

    const systemType = await ctx.db.get(system.systemTypeId);
    if (!systemType) return null;

    const home = await ctx.db.get(system.homeId);

    const age = calculateAge(system.installDate, home?.yearBuilt);

    return {
      name: system.name || systemType.name,
      category: systemType.category,
      age: Math.round(age * 10) / 10,
      homeState: home?.state || null,
    };
  },
});
