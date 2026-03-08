import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { serviceCallStatus, serviceType, replacementChoice } from "./schema";

/**
 * Get all service calls for a home
 */
export const getHomeServiceCalls = query({
  args: {
    homeId: v.id("homes"),
    status: v.optional(serviceCallStatus),
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

    let serviceCalls;
    if (args.status) {
      serviceCalls = await ctx.db
        .query("serviceCalls")
        .withIndex("by_home_status", (q) =>
          q.eq("homeId", args.homeId).eq("status", args.status!)
        )
        .order("desc")
        .collect();
    } else {
      serviceCalls = await ctx.db
        .query("serviceCalls")
        .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
        .order("desc")
        .collect();
    }

    // Enrich with system data
    const enriched = await Promise.all(
      serviceCalls.map(async (call) => {
        const system = await ctx.db.get(call.systemId);
        const systemType = system
          ? await ctx.db.get(system.systemTypeId)
          : null;
        return {
          ...call,
          system: system
            ? {
                _id: system._id,
                name: system.name,
                manufacturer: system.manufacturer,
                modelNumber: system.modelNumber,
                healthScore: system.healthScore,
              }
            : null,
          systemType: systemType
            ? {
                name: systemType.name,
                category: systemType.category,
              }
            : null,
        };
      })
    );

    return enriched;
  },
});

/**
 * Get a single service call by ID
 */
export const getServiceCall = query({
  args: {
    serviceCallId: v.id("serviceCalls"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const serviceCall = await ctx.db.get(args.serviceCallId);
    if (!serviceCall) return null;

    const home = await ctx.db.get(serviceCall.homeId);
    if (!home) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) return null;

    // Enrich with related data
    const system = await ctx.db.get(serviceCall.systemId);
    const systemType = system ? await ctx.db.get(system.systemTypeId) : null;
    const selectedProduct = serviceCall.selectedProductId
      ? await ctx.db.get(serviceCall.selectedProductId)
      : null;

    // Get documents for this service call
    const documents = await ctx.db
      .query("serviceDocuments")
      .withIndex("by_serviceCall", (q) =>
        q.eq("serviceCallId", args.serviceCallId)
      )
      .collect();

    return {
      ...serviceCall,
      system: system
        ? {
            _id: system._id,
            name: system.name,
            manufacturer: system.manufacturer,
            modelNumber: system.modelNumber,
            serialNumber: system.serialNumber,
            installDate: system.installDate,
            healthScore: system.healthScore,
            remainingLifePercent: system.remainingLifePercent,
            estimatedReplacementYear: system.estimatedReplacementYear,
            lastServiceDate: system.lastServiceDate,
          }
        : null,
      systemType: systemType
        ? {
            _id: systemType._id,
            name: systemType.name,
            category: systemType.category,
            defaultLifespanYears: systemType.defaultLifespanYears,
          }
        : null,
      selectedProduct,
      documents,
    };
  },
});

/**
 * Get service calls for a specific system
 */
export const getSystemServiceCalls = query({
  args: {
    systemId: v.id("systems"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const system = await ctx.db.get(args.systemId);
    if (!system || !system.homeId) return [];

    const home = await ctx.db.get(system.homeId);
    if (!home) return [];

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) return [];

    return await ctx.db
      .query("serviceCalls")
      .withIndex("by_system", (q) => q.eq("systemId", args.systemId))
      .order("desc")
      .collect();
  },
});

/**
 * Create a new service call (Before phase)
 */
export const createServiceCall = mutation({
  args: {
    homeId: v.id("homes"),
    systemId: v.id("systems"),
    serviceType: serviceType,
    symptomDescription: v.optional(v.string()),
    plannedQuestions: v.optional(v.array(v.string())),
    selectedProductId: v.optional(v.id("products")),
    replacementChoice: v.optional(replacementChoice),
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

    const system = await ctx.db.get(args.systemId);
    if (!system || system.homeId !== args.homeId) {
      throw new Error("System not found in this home");
    }

    const serviceCallId = await ctx.db.insert("serviceCalls", {
      homeId: args.homeId,
      systemId: args.systemId,
      createdBy: profile._id,
      status: "planning",
      serviceType: args.serviceType,
      symptomDescription: args.symptomDescription,
      plannedQuestions: args.plannedQuestions || [],
      selectedProductId: args.selectedProductId,
      replacementChoice: args.replacementChoice,
      wasDiy: false,
      wasReplacement: args.serviceType === "replacement",
    });

    // Log activity
    await ctx.db.insert("activityLog", {
      userId: profile._id,
      homeId: args.homeId,
      systemId: args.systemId,
      action: "system_added", // We could add a new action type
      description: `Started planning ${args.serviceType} service call for ${system.name || "system"}`,
    });

    return serviceCallId;
  },
});

/**
 * Update service call - Before phase (planning)
 */
export const updatePlanningPhase = mutation({
  args: {
    serviceCallId: v.id("serviceCalls"),
    symptomDescription: v.optional(v.string()),
    plannedQuestions: v.optional(v.array(v.string())),
    selectedProductId: v.optional(v.id("products")),
    replacementChoice: v.optional(replacementChoice),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const serviceCall = await ctx.db.get(args.serviceCallId);
    if (!serviceCall) throw new Error("Service call not found");

    const home = await ctx.db.get(serviceCall.homeId);
    if (!home) throw new Error("Home not found");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) {
      throw new Error("Not authorized");
    }

    const { serviceCallId, ...updates } = args;
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    await ctx.db.patch(args.serviceCallId, cleanUpdates);
    return await ctx.db.get(args.serviceCallId);
  },
});

/**
 * Schedule the service call
 */
export const scheduleServiceCall = mutation({
  args: {
    serviceCallId: v.id("serviceCalls"),
    scheduledDate: v.string(),
    companyName: v.optional(v.string()),
    companyPhone: v.optional(v.string()),
    technicianName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const serviceCall = await ctx.db.get(args.serviceCallId);
    if (!serviceCall) throw new Error("Service call not found");

    const home = await ctx.db.get(serviceCall.homeId);
    if (!home) throw new Error("Home not found");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.serviceCallId, {
      status: "scheduled",
      scheduledDate: args.scheduledDate,
      companyName: args.companyName,
      companyPhone: args.companyPhone,
      technicianName: args.technicianName,
    });

    return await ctx.db.get(args.serviceCallId);
  },
});

/**
 * Start the service call (technician arrived)
 */
export const startServiceCall = mutation({
  args: {
    serviceCallId: v.id("serviceCalls"),
    technicianName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const serviceCall = await ctx.db.get(args.serviceCallId);
    if (!serviceCall) throw new Error("Service call not found");

    const home = await ctx.db.get(serviceCall.homeId);
    if (!home) throw new Error("Home not found");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.serviceCallId, {
      status: "in_progress",
      ...(args.technicianName && { technicianName: args.technicianName }),
    });

    return await ctx.db.get(args.serviceCallId);
  },
});

/**
 * Update during phase (notes, question responses)
 */
export const updateDuringPhase = mutation({
  args: {
    serviceCallId: v.id("serviceCalls"),
    technicianName: v.optional(v.string()),
    technicianNotes: v.optional(v.string()),
    questionResponses: v.optional(
      v.array(
        v.object({
          question: v.string(),
          response: v.optional(v.string()),
          rating: v.optional(v.number()),
        })
      )
    ),
    qualificationScore: v.optional(v.number()),
    quotedCost: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const serviceCall = await ctx.db.get(args.serviceCallId);
    if (!serviceCall) throw new Error("Service call not found");

    const home = await ctx.db.get(serviceCall.homeId);
    if (!home) throw new Error("Home not found");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) {
      throw new Error("Not authorized");
    }

    const { serviceCallId, ...updates } = args;
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    await ctx.db.patch(args.serviceCallId, cleanUpdates);
    return await ctx.db.get(args.serviceCallId);
  },
});

/**
 * Complete the service call (After phase)
 */
export const completeServiceCall = mutation({
  args: {
    serviceCallId: v.id("serviceCalls"),
    diagnosis: v.optional(v.string()),
    workPerformed: v.optional(v.string()),
    actualCost: v.optional(v.number()),
    wasDiy: v.optional(v.boolean()),
    wasReplacement: v.optional(v.boolean()),
    serviceRating: v.optional(v.number()),
    serviceNotes: v.optional(v.string()),
    wouldRecommend: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const serviceCall = await ctx.db.get(args.serviceCallId);
    if (!serviceCall) throw new Error("Service call not found");

    const home = await ctx.db.get(serviceCall.homeId);
    if (!home) throw new Error("Home not found");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) {
      throw new Error("Not authorized");
    }

    const completedDate = new Date().toISOString().split("T")[0];

    await ctx.db.patch(args.serviceCallId, {
      status: "completed",
      completedDate,
      diagnosis: args.diagnosis,
      workPerformed: args.workPerformed,
      actualCost: args.actualCost,
      wasDiy: args.wasDiy ?? false,
      wasReplacement: args.wasReplacement ?? serviceCall.wasReplacement,
      serviceRating: args.serviceRating,
      serviceNotes: args.serviceNotes,
      wouldRecommend: args.wouldRecommend,
    });

    // Update system's last service date
    await ctx.db.patch(serviceCall.systemId, {
      lastServiceDate: completedDate,
    });

    // Log activity
    await ctx.db.insert("activityLog", {
      userId: profile._id,
      homeId: serviceCall.homeId,
      systemId: serviceCall.systemId,
      action: "task_completed",
      description: `Completed ${serviceCall.serviceType} service call`,
      metadata: {
        actualCost: args.actualCost,
        wasDiy: args.wasDiy,
      },
    });

    return await ctx.db.get(args.serviceCallId);
  },
});

/**
 * Mark service call for follow-up
 */
export const markForFollowUp = mutation({
  args: {
    serviceCallId: v.id("serviceCalls"),
    followUpNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const serviceCall = await ctx.db.get(args.serviceCallId);
    if (!serviceCall) throw new Error("Service call not found");

    const home = await ctx.db.get(serviceCall.homeId);
    if (!home) throw new Error("Home not found");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.serviceCallId, {
      status: "follow_up",
      ...(args.followUpNotes && { serviceNotes: args.followUpNotes }),
    });

    return await ctx.db.get(args.serviceCallId);
  },
});

/**
 * Delete a service call
 */
export const deleteServiceCall = mutation({
  args: {
    serviceCallId: v.id("serviceCalls"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const serviceCall = await ctx.db.get(args.serviceCallId);
    if (!serviceCall) throw new Error("Service call not found");

    const home = await ctx.db.get(serviceCall.homeId);
    if (!home) throw new Error("Home not found");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) {
      throw new Error("Not authorized");
    }

    // Delete associated documents first
    const documents = await ctx.db
      .query("serviceDocuments")
      .withIndex("by_serviceCall", (q) =>
        q.eq("serviceCallId", args.serviceCallId)
      )
      .collect();

    for (const doc of documents) {
      await ctx.db.delete(doc._id);
    }

    await ctx.db.delete(args.serviceCallId);
    return true;
  },
});

/**
 * Get service call statistics for a home
 */
export const getServiceCallStats = query({
  args: {
    homeId: v.id("homes"),
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

    const serviceCalls = await ctx.db
      .query("serviceCalls")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .collect();

    const totalCalls = serviceCalls.length;
    const completedCalls = serviceCalls.filter(
      (c) => c.status === "completed"
    ).length;
    const activeCalls = serviceCalls.filter((c) =>
      ["planning", "scheduled", "in_progress"].includes(c.status)
    ).length;
    const totalSpent = serviceCalls.reduce(
      (sum, c) => sum + (c.actualCost || 0),
      0
    );
    const diyCount = serviceCalls.filter((c) => c.wasDiy).length;
    const replacementCount = serviceCalls.filter((c) => c.wasReplacement).length;

    return {
      totalCalls,
      completedCalls,
      activeCalls,
      totalSpent,
      diyCount,
      replacementCount,
      avgRating:
        serviceCalls.filter((c) => c.serviceRating).length > 0
          ? serviceCalls.reduce((sum, c) => sum + (c.serviceRating || 0), 0) /
            serviceCalls.filter((c) => c.serviceRating).length
          : null,
    };
  },
});
