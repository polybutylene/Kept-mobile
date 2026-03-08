import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { serviceType, lineItemCategory } from "./schema";
import { calculateConfidence } from "./lib/confidence";
import { conditionalFailureProbability, calculateAge } from "./lib/weibull";
import { createInvoiceChangeRecord } from "./lib/forecastDiff";

/**
 * Create a new service event (invoice/service record)
 */
export const createServiceEvent = mutation({
  args: {
    homeId: v.id("homes"),
    systemId: v.optional(v.id("systems")),
    incidentId: v.optional(v.id("incidents")),
    packetId: v.optional(v.id("homePackets")),
    
    eventType: serviceType,
    eventDate: v.string(),
    description: v.string(),
    
    providerName: v.optional(v.string()),
    providerPhone: v.optional(v.string()),
    providerEmail: v.optional(v.string()),
    
    totalCost: v.number(),
    wasDiy: v.boolean(),
    estimatedCostAtTime: v.optional(v.number()),
    
    warrantyMonths: v.optional(v.number()),
    warrantyNotes: v.optional(v.string()),
    
    tags: v.optional(v.array(v.string())),
    
    // Line items (optional)
    lineItems: v.optional(v.array(v.object({
      category: lineItemCategory,
      description: v.string(),
      amount: v.number(),
      quantity: v.optional(v.number()),
    }))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const home = await ctx.db.get(args.homeId);
    if (!home) throw new Error("Home not found");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) {
      throw new Error("Not authorized");
    }

    // Calculate warranty expiry
    let warrantyExpires: string | undefined;
    if (args.warrantyMonths) {
      const date = new Date(args.eventDate);
      date.setMonth(date.getMonth() + args.warrantyMonths);
      warrantyExpires = date.toISOString().split("T")[0];
    }

    // Create service event
    const eventId = await ctx.db.insert("homeownerServiceEvents", {
      homeId: args.homeId,
      systemId: args.systemId,
      incidentId: args.incidentId,
      packetId: args.packetId,
      eventType: args.eventType,
      eventDate: args.eventDate,
      description: args.description,
      providerName: args.providerName,
      providerPhone: args.providerPhone,
      providerEmail: args.providerEmail,
      totalCost: args.totalCost,
      wasDiy: args.wasDiy,
      estimatedCostAtTime: args.estimatedCostAtTime,
      warrantyMonths: args.warrantyMonths,
      warrantyExpires,
      warrantyNotes: args.warrantyNotes,
      tags: args.tags,
    });

    // Create line items if provided
    if (args.lineItems && args.lineItems.length > 0) {
      for (const item of args.lineItems) {
        await ctx.db.insert("serviceLineItems", {
          serviceEventId: eventId,
          category: item.category,
          description: item.description,
          amount: item.amount,
          quantity: item.quantity,
        });
      }
    }

    // Update system if provided
    if (args.systemId) {
      const updates: Record<string, any> = {
        lastServiceDate: args.eventDate,
      };
      
      // If this was a repair, track repair cost
      if (args.eventType === "repair") {
        updates.lastRepairCost = args.totalCost;
      }
      
      // If this was a replacement, update replacement date and clear old data
      if (args.eventType === "replacement") {
        updates.installDate = args.eventDate;
        updates.lastRepairCost = undefined;
        // Reset health score for new system
        updates.healthScore = 100;
        updates.estimatedReplacementYear = undefined;
      }

      await ctx.db.patch(args.systemId, updates);
    }

    // Link to incident if provided
    if (args.incidentId) {
      await ctx.db.patch(args.incidentId, {
        serviceEventId: eventId,
        status: "resolved",
        resolvedAt: Date.now(),
      });
    }

    // Create forecast snapshot to track the change
    const systems = await ctx.db
      .query("systems")
      .withIndex("by_home_active", (q) =>
        q.eq("homeId", args.homeId).eq("isArchived", false)
      )
      .collect();

    const systemTypeIds = [...new Set(systems.map((s) => s.systemTypeId))];
    const systemTypes = await Promise.all(
      systemTypeIds.map((id) => ctx.db.get(id))
    );
    const validSystemTypes = systemTypes.filter((st) => st !== null);

    // Get system name for change record
    let systemName: string | undefined;
    if (args.systemId) {
      const system = await ctx.db.get(args.systemId);
      if (system) {
        const systemType = validSystemTypes.find(st => st && st._id === system.systemTypeId);
        systemName = system.name || systemType?.name;
      }
    }

    // Create change record
    const changeRecord = createInvoiceChangeRecord(
      args.eventType,
      systemName,
      args.totalCost,
      args.estimatedCostAtTime
    );

    // Calculate confidence and forecast summary
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    const twoYearsAgoStr = twoYearsAgo.toISOString().split("T")[0];

    const recentEvents = await ctx.db
      .query("homeownerServiceEvents")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .filter((q) => q.gte(q.field("eventDate"), twoYearsAgoStr))
      .collect();

    const confidenceResult = calculateConfidence({
      home,
      systems,
      systemTypes: validSystemTypes as any[],
      recentServiceEvents: recentEvents.length,
    });

    // Calculate simplified forecast
    let year1Total = 0;
    let year5Total = 0;
    let year10Total = 0;

    for (const system of systems) {
      const systemType = validSystemTypes.find((st) => st && st._id === system.systemTypeId);
      if (!systemType) continue;

      const age = calculateAge(system.installDate, home.yearBuilt);
      const lifespan = systemType.defaultLifespanYears;
      const ageRatio = age / lifespan;

      const maintenancePerYear = systemType.defaultReplacementCostMid * 0.02;
      const repairMultiplier = Math.min(2.5, Math.exp(ageRatio * 0.8));
      const repairPerYear = systemType.defaultReplacementCostMid * 0.02 * repairMultiplier;

      const failProb5 = conditionalFailureProbability(age, 5, systemType.weibullShape, systemType.weibullScale);
      const failProb10 = conditionalFailureProbability(age, 10, systemType.weibullShape, systemType.weibullScale);

      year1Total += maintenancePerYear + repairPerYear;
      year5Total += (maintenancePerYear + repairPerYear) * 5 + (failProb5 > 0.5 ? systemType.defaultReplacementCostMid : 0);
      year10Total += (maintenancePerYear + repairPerYear) * 10 + (failProb10 > 0.5 ? systemType.defaultReplacementCostMid : 0);
    }

    // Create snapshot
    await ctx.db.insert("forecastSnapshots", {
      homeId: args.homeId,
      snapshotDate: Date.now(),
      triggerType: "invoice_added",
      triggerDescription: `Recorded ${args.eventType}: ${args.description}`,
      confidenceScore: confidenceResult.score,
      forecastSummary: {
        year1Total: Math.round(year1Total),
        year5Total: Math.round(year5Total),
        year10Total: Math.round(year10Total),
      },
      changes: [changeRecord],
    });

    return {
      eventId,
      message: "Service event recorded",
      forecastUpdated: true,
    };
  },
});

/**
 * Add line items to an existing service event
 */
export const addLineItems = mutation({
  args: {
    serviceEventId: v.id("homeownerServiceEvents"),
    items: v.array(v.object({
      category: lineItemCategory,
      description: v.string(),
      amount: v.number(),
      quantity: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const event = await ctx.db.get(args.serviceEventId);
    if (!event) throw new Error("Service event not found");

    const home = await ctx.db.get(event.homeId);
    if (!home) throw new Error("Home not found");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) {
      throw new Error("Not authorized");
    }

    for (const item of args.items) {
      await ctx.db.insert("serviceLineItems", {
        serviceEventId: args.serviceEventId,
        category: item.category,
        description: item.description,
        amount: item.amount,
        quantity: item.quantity,
      });
    }

    return true;
  },
});

/**
 * Get service history for a home
 */
export const getServiceHistory = query({
  args: {
    homeId: v.id("homes"),
    systemId: v.optional(v.id("systems")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const home = await ctx.db.get(args.homeId);
    if (!home) return [];

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) return [];

    let events;
    if (args.systemId) {
      events = await ctx.db
        .query("homeownerServiceEvents")
        .withIndex("by_system", (q) => q.eq("systemId", args.systemId))
        .order("desc")
        .take(args.limit || 50);
    } else {
      events = await ctx.db
        .query("homeownerServiceEvents")
        .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
        .order("desc")
        .take(args.limit || 50);
    }

    // Enrich with system info
    const enriched = await Promise.all(
      events.map(async (event) => {
        let systemName: string | undefined;
        if (event.systemId) {
          const system = await ctx.db.get(event.systemId);
          if (system) {
            const systemType = await ctx.db.get(system.systemTypeId);
            systemName = system.name || systemType?.name;
          }
        }
        return { ...event, systemName };
      })
    );

    return enriched;
  },
});

/**
 * Get a single service event with line items
 */
export const getServiceEvent = query({
  args: {
    eventId: v.id("homeownerServiceEvents"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const event = await ctx.db.get(args.eventId);
    if (!event) return null;

    const home = await ctx.db.get(event.homeId);
    if (!home) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) return null;

    // Get line items
    const lineItems = await ctx.db
      .query("serviceLineItems")
      .withIndex("by_event", (q) => q.eq("serviceEventId", args.eventId))
      .collect();

    // Get system info
    let system = null;
    let systemType = null;
    if (event.systemId) {
      system = await ctx.db.get(event.systemId);
      if (system) {
        systemType = await ctx.db.get(system.systemTypeId);
      }
    }

    return {
      ...event,
      lineItems,
      system: system ? {
        id: system._id,
        name: system.name || systemType?.name,
        category: systemType?.category,
      } : null,
    };
  },
});

/**
 * Get service event stats for a home
 */
export const getServiceStats = query({
  args: {
    homeId: v.id("homes"),
    years: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const home = await ctx.db.get(args.homeId);
    if (!home) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) return null;

    const yearsBack = args.years || 2;
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - yearsBack);
    const cutoffStr = cutoffDate.toISOString().split("T")[0];

    const events = await ctx.db
      .query("homeownerServiceEvents")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .filter((q) => q.gte(q.field("eventDate"), cutoffStr))
      .collect();

    let totalSpent = 0;
    let diyCount = 0;
    let proCount = 0;
    let diySavings = 0;
    
    for (const event of events) {
      totalSpent += event.totalCost;
      if (event.wasDiy) {
        diyCount++;
        if (event.estimatedCostAtTime) {
          diySavings += Math.max(0, event.estimatedCostAtTime - event.totalCost);
        }
      } else {
        proCount++;
      }
    }

    return {
      totalEvents: events.length,
      totalSpent,
      diyCount,
      proCount,
      diySavings,
      averageCost: events.length > 0 ? totalSpent / events.length : 0,
    };
  },
});
