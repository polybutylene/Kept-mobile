import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import { serviceRequestCategory, serviceRequestPriority, serviceRequestStatus } from "./schema";

/**
 * Submit a service request (resident -> PM)
 */
export const submitRequest = mutation({
  args: {
    homeId: v.id("homes"),
    category: serviceRequestCategory,
    priority: serviceRequestPriority,
    title: v.string(),
    description: v.string(),
    systemId: v.optional(v.id("systems")),
    photoStorageIds: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile) throw new Error("Profile not found");

    // Verify user has access to this home
    const isManagedResident =
      profile.tier === "managed_homeowner" || profile.tier === "tenant";

    if (isManagedResident) {
      const membership = await ctx.db
        .query("managedMembers")
        .withIndex("by_member", (q) => q.eq("memberId", profile._id))
        .filter((q) =>
          q.and(
            q.eq(q.field("homeId"), args.homeId),
            q.eq(q.field("status"), "active")
          )
        )
        .first();

      if (!membership) {
        throw new Error("You don't have access to this property");
      }
    } else {
      // Regular homeowner - check they own the home
      const home = await ctx.db.get(args.homeId);
      if (!home || home.ownerId !== profile._id) {
        throw new Error("Home not found or access denied");
      }
    }

    const requestId = await ctx.db.insert("serviceRequests", {
      homeId: args.homeId,
      submittedBy: profile._id,
      systemId: args.systemId,
      category: args.category,
      priority: args.priority,
      title: args.title,
      description: args.description,
      photoStorageIds: args.photoStorageIds,
      status: "submitted",
    });

    return { requestId };
  },
});

/**
 * Get my submitted requests (for residents)
 */
export const getMyRequests = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile) return [];

    const requests = await ctx.db
      .query("serviceRequests")
      .withIndex("by_submitter", (q) => q.eq("submittedBy", profile._id))
      .collect();

    // Enrich with home and system info
    const enriched = await Promise.all(
      requests.map(async (request) => {
        const home = await ctx.db.get(request.homeId);
        const system = request.systemId
          ? await ctx.db.get(request.systemId)
          : null;
        const systemType = system
          ? await ctx.db.get(system.systemTypeId)
          : null;

        return {
          ...request,
          homeName: home?.name || home?.addressLine1 || "Unknown",
          systemName: system?.name || systemType?.name || null,
        };
      })
    );

    return enriched.sort((a, b) => b._creationTime - a._creationTime);
  },
});

/**
 * Get all requests for a PM (across all their properties)
 */
export const getRequestsForManager = query({
  args: {
    homeId: v.optional(v.id("homes")),
    status: v.optional(serviceRequestStatus),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || profile.tier !== "property_manager") return [];

    // Get all homes owned by this PM
    const homes = await ctx.db
      .query("homes")
      .withIndex("by_owner_active", (q) =>
        q.eq("ownerId", profile._id).eq("isArchived", false)
      )
      .collect();

    const homeIds = new Set(homes.map((h) => h._id));

    // Get requests for these homes
    let requests;
    if (args.homeId) {
      if (!homeIds.has(args.homeId)) return [];
      const targetHomeId = args.homeId;
      requests = await ctx.db
        .query("serviceRequests")
        .withIndex("by_home", (q) => q.eq("homeId", targetHomeId))
        .collect();
    } else {
      // Get all requests for all homes
      const allRequests = [];
      for (const home of homes) {
        const homeRequests = await ctx.db
          .query("serviceRequests")
          .withIndex("by_home", (q) => q.eq("homeId", home._id))
          .collect();
        allRequests.push(...homeRequests);
      }
      requests = allRequests;
    }

    // Filter by status if provided
    if (args.status) {
      requests = requests.filter((r) => r.status === args.status);
    }

    // Enrich with submitter, home, and system info
    const enriched = await Promise.all(
      requests.map(async (request) => {
        const submitter = request.submittedBy
          ? await ctx.db.get(request.submittedBy)
          : null;
        const home = await ctx.db.get(request.homeId);
        const system = request.systemId
          ? await ctx.db.get(request.systemId)
          : null;
        const systemType = system
          ? await ctx.db.get(system.systemTypeId)
          : null;
        const worker = request.assignedWorkerId
          ? await ctx.db.get(request.assignedWorkerId)
          : null;

        const submitterProfile = submitter as { fullName?: string; email?: string } | null;

        return {
          ...request,
          submitterName: submitterProfile?.fullName || submitterProfile?.email || request.renterName || "Unknown",
          submitterEmail: submitterProfile?.email || request.renterEmail || "",
          homeName: home?.name || home?.addressLine1 || "Unknown",
          homeAddress: home
            ? `${home.addressLine1}, ${home.city}, ${home.state}`
            : "",
          systemName: system?.name || systemType?.name || null,
          assignedWorkerName: worker?.name || null,
        };
      })
    );

    return enriched.sort((a, b) => {
      const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
      const aPriority = priorityOrder[a.priority] ?? 4;
      const bPriority = priorityOrder[b.priority] ?? 4;
      if (aPriority !== bPriority) return aPriority - bPriority;
      return b._creationTime - a._creationTime;
    });
  },
});

/**
 * Get a single request by ID
 */
export const getRequest = query({
  args: {
    requestId: v.id("serviceRequests"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile) return null;

    const request = await ctx.db.get(args.requestId);
    if (!request) return null;

    // Check access — submitter, owner, or manager
    const isSubmitter = request.submittedBy === profile._id;
    const isManager = request.managerId === profile._id;
    const home = await ctx.db.get(request.homeId);
    const isOwner = home?.ownerId === profile._id;

    if (!isSubmitter && !isOwner && !isManager) return null;

    const submitter = request.submittedBy
      ? await ctx.db.get(request.submittedBy)
      : null;
    const system = request.systemId
      ? await ctx.db.get(request.systemId)
      : null;
    const systemType = system ? await ctx.db.get(system.systemTypeId) : null;
    const worker = request.assignedWorkerId
      ? await ctx.db.get(request.assignedWorkerId)
      : null;

    const submitterProfile = submitter as { fullName?: string; email?: string } | null;

    return {
      ...request,
      submitterName: submitterProfile?.fullName || submitterProfile?.email || request.renterName || "Unknown",
      submitterEmail: submitterProfile?.email || request.renterEmail || "",
      homeName: home?.name || home?.addressLine1 || "Unknown",
      homeAddress: home
        ? `${home.addressLine1}, ${home.city}, ${home.state}`
        : "",
      systemName: system?.name || systemType?.name || null,
      assignedWorkerName: worker?.name || null,
    };
  },
});

/**
 * Update request status (PM only)
 */
export const updateRequestStatus = mutation({
  args: {
    requestId: v.id("serviceRequests"),
    status: serviceRequestStatus,
    pmNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || profile.tier !== "property_manager") {
      throw new Error("Only property managers can update request status");
    }

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Request not found");

    const home = await ctx.db.get(request.homeId);
    if (!home || home.ownerId !== profile._id) {
      throw new Error("Access denied");
    }

    const updates: any = { status: args.status };
    if (args.pmNotes) {
      updates.pmNotes = args.pmNotes;
    }
    if (args.status === "resolved" || args.status === "closed") {
      updates.resolvedAt = Date.now();
    }

    await ctx.db.patch(args.requestId, updates);
    return { success: true };
  },
});

/**
 * Assign a worker to a request (PM only)
 */
export const assignRequest = mutation({
  args: {
    requestId: v.id("serviceRequests"),
    workerId: v.id("maintenanceWorkers"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || profile.tier !== "property_manager") {
      throw new Error("Only property managers can assign workers");
    }

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Request not found");

    const home = await ctx.db.get(request.homeId);
    if (!home || home.ownerId !== profile._id) {
      throw new Error("Access denied");
    }

    const worker = await ctx.db.get(args.workerId);
    if (!worker || worker.managerId !== profile._id) {
      throw new Error("Worker not found");
    }

    await ctx.db.patch(args.requestId, {
      assignedWorkerId: args.workerId,
      status: "in_progress",
    });

    return { success: true };
  },
});

/**
 * Resolve a request with summary (PM only)
 */
export const resolveRequest = mutation({
  args: {
    requestId: v.id("serviceRequests"),
    resolutionSummary: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || profile.tier !== "property_manager") {
      throw new Error("Only property managers can resolve requests");
    }

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Request not found");

    const home = await ctx.db.get(request.homeId);
    if (!home || home.ownerId !== profile._id) {
      throw new Error("Access denied");
    }

    await ctx.db.patch(args.requestId, {
      status: "resolved",
      resolutionSummary: args.resolutionSummary,
      resolvedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Get request counts by status for PM dashboard
 */
export const getRequestCounts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || profile.tier !== "property_manager") return null;

    const homes = await ctx.db
      .query("homes")
      .withIndex("by_owner_active", (q) =>
        q.eq("ownerId", profile._id).eq("isArchived", false)
      )
      .collect();

    const counts: Record<string, number> = {
      submitted: 0,
      acknowledged: 0,
      in_progress: 0,
      scheduled: 0,
      resolved: 0,
      closed: 0,
      total: 0,
      urgent: 0,
    };

    for (const home of homes) {
      const requests = await ctx.db
        .query("serviceRequests")
        .withIndex("by_home", (q) => q.eq("homeId", home._id))
        .collect();

      for (const req of requests) {
        if (counts[req.status] !== undefined) counts[req.status]++;
        counts.total++;
        if (req.priority === "urgent" && req.status !== "resolved" && req.status !== "closed") {
          counts.urgent++;
        }
      }
    }

    return counts;
  },
});

// ============================================================
// Internal functions for public renter portal (no auth)
// ============================================================

/**
 * Submit a service request from the public renter portal.
 * Called by HTTP endpoint — no user auth required.
 */
export const submitPortalRequest = internalMutation({
  args: {
    homeId: v.id("homes"),
    managerId: v.id("userProfiles"),
    linkId: v.string(),
    category: v.string(),
    area: v.string(),
    title: v.string(),
    description: v.string(),
    urgency: v.string(),
    photoStorageIds: v.optional(v.array(v.id("_storage"))),
    renterName: v.string(),
    renterEmail: v.optional(v.string()),
    renterPhone: v.optional(v.string()),
    unitLabel: v.optional(v.string()),
    availableTimes: v.optional(v.string()),
    permissionToEnter: v.boolean(),
  },
  handler: async (ctx, args) => {
    const priorityFromUrgency: Record<string, string> = {
      emergency: "urgent",
      urgent: "high",
      soon: "medium",
      not_urgent: "low",
    };

    const now = Date.now();

    const requestId = await ctx.db.insert("serviceRequests", {
      homeId: args.homeId,
      managerId: args.managerId,
      linkId: args.linkId,
      category: args.category,
      priority: priorityFromUrgency[args.urgency] ?? "medium",
      title: args.title,
      description: args.description,
      status: "submitted",
      photoStorageIds: args.photoStorageIds,
      renterName: args.renterName,
      renterEmail: args.renterEmail,
      renterPhone: args.renterPhone,
      unitLabel: args.unitLabel,
      area: args.area,
      urgency: args.urgency,
      availableTimes: args.availableTimes,
      permissionToEnter: args.permissionToEnter,
      updatedAt: now,
    });

    return { requestId };
  },
});

/**
 * Check rate limit for a given link — max 5 submissions per 24h
 */
export const checkPortalRateLimit = internalQuery({
  args: { linkId: v.string() },
  handler: async (ctx, args) => {
    const requests = await ctx.db
      .query("serviceRequests")
      .withIndex("by_linkId", (q) => q.eq("linkId", args.linkId))
      .collect();

    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recentCount = requests.filter((r) => r._creationTime > oneDayAgo).length;

    return { allowed: recentCount < 5, remaining: Math.max(0, 5 - recentCount) };
  },
});

/**
 * Update AI triage results on a service request
 */
export const updateTriageResults = internalMutation({
  args: {
    requestId: v.id("serviceRequests"),
    aiTriage: v.object({
      priorityScore: v.number(),
      priorityLevel: v.string(),
      systemHealthConcern: v.number(),
      experienceConcern: v.number(),
      matchedSystemId: v.optional(v.id("systems")),
      matchedSystemName: v.optional(v.string()),
      matchedSystemHealth: v.optional(v.number()),
      reasoning: v.string(),
      recommendation: v.string(),
      estimatedCost: v.optional(v.string()),
      suggestedTimeline: v.string(),
      autoScheduled: v.boolean(),
    }),
    priority: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.requestId, {
      aiTriage: args.aiTriage,
      priority: args.priority,
      status: "triaged",
      updatedAt: Date.now(),
    });
  },
});

/**
 * Get full context for AI triage (home, systems, maintenance)
 */
export const getTriageContext = internalQuery({
  args: { homeId: v.id("homes") },
  handler: async (ctx, args) => {
    const home = await ctx.db.get(args.homeId);
    if (!home) return null;

    const systems = await ctx.db
      .query("systems")
      .withIndex("by_home_active", (q) =>
        q.eq("homeId", args.homeId).eq("isArchived", false)
      )
      .collect();

    const enrichedSystems = await Promise.all(
      systems.map(async (sys) => {
        const sysType = await ctx.db.get(sys.systemTypeId);
        return {
          _id: sys._id,
          name: sys.name,
          category: sysType?.category ?? "other",
          typeName: sysType?.name ?? "Unknown",
          healthScore: sys.healthScore ?? null,
          installDate: sys.installDate ?? null,
          defaultLifespanYears: sysType?.defaultLifespanYears ?? null,
          manufacturer: sys.manufacturer ?? null,
          remainingLifePercent: sys.remainingLifePercent ?? null,
        };
      })
    );

    const recentMaintenance = await ctx.db
      .query("scheduledMaintenance")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .collect();

    const last5Completed = recentMaintenance
      .filter((t) => t.status === "completed")
      .sort((a, b) => (Number(b.completedDate) || 0) - (Number(a.completedDate) || 0))
      .slice(0, 5);

    const openIssues = recentMaintenance.filter(
      (t) => t.status === "overdue" || t.status === "due"
    );

    return {
      property: {
        name: home.name || home.addressLine1 || "Property",
        city: home.city,
        state: home.state,
        yearBuilt: home.yearBuilt,
      },
      systems: enrichedSystems,
      recentMaintenance: last5Completed.map((t) => ({
        name: t.name,
        completedDate: t.completedDate,
        category: t.category,
      })),
      openIssues: openIssues.map((t) => ({
        name: t.name,
        status: t.status,
        dueDate: t.dueDate,
        priority: t.priority,
        category: t.category,
      })),
    };
  },
});

/**
 * Get the property owner's email for notification purposes
 */
export const getHomeOwnerEmail = internalQuery({
  args: { homeId: v.id("homes") },
  handler: async (ctx, args) => {
    const home = await ctx.db.get(args.homeId);
    if (!home) return null;

    const ownerProfile = await ctx.db.get(home.ownerId);
    if (!ownerProfile) return null;

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("_id"), ownerProfile.userId))
      .first();

    return {
      ownerEmail: user?.email ?? ownerProfile.email ?? null,
      ownerName: ownerProfile.fullName ?? null,
    };
  },
});
