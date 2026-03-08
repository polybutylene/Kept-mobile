import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";
import {
  getProfileFromAuthId,
  getUserPortfolioId,
  assertPortfolioAccess,
} from "./lib/permissions";
import { awardHealthPoints } from "./lib/healthPoints";
import {
  workOrderStatus,
  workOrderCategory,
  maintenancePriority,
} from "./schema";

// Valid state transitions for work orders
const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ["submitted", "cancelled"],
  submitted: ["triaged", "cancelled"],
  triaged: ["open", "assigned", "cancelled"],
  open: ["assigned", "scheduled", "cancelled", "on_hold"],
  assigned: ["scheduled", "in_progress", "open", "cancelled", "on_hold"],
  scheduled: ["in_progress", "assigned", "cancelled", "on_hold"],
  in_progress: ["pending_review", "completed", "on_hold"],
  pending_review: ["completed", "in_progress", "verified"],
  completed: ["verified", "in_progress"], // Can reopen if issues found
  verified: [], // Terminal state
  cancelled: [], // Terminal state
  on_hold: ["open", "assigned", "scheduled", "cancelled"],
};

// SLA targets by priority (in hours)
const SLA_HOURS: Record<string, number> = {
  critical: 4,
  high: 24,
  medium: 72,
  low: 168, // 1 week
  routine: 336, // 2 weeks
};

/**
 * Check if a status transition is valid
 */
function isValidTransition(from: string, to: string): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Calculate SLA deadline based on priority
 */
function calculateSlaDealine(priority: string, createdAt: number): number {
  const hours = SLA_HOURS[priority] ?? 72;
  return createdAt + hours * 60 * 60 * 1000;
}

/**
 * Log a work order event
 */
async function logWorkOrderEvent(
  ctx: any,
  workOrderId: Id<"workOrders">,
  userId: Id<"userProfiles">,
  eventType: string,
  previousValue?: string,
  newValue?: string,
  note?: string,
  metadata?: any
) {
  await ctx.db.insert("workOrderEvents", {
    workOrderId,
    userId,
    eventType: eventType as any,
    previousValue,
    newValue,
    note,
    metadata,
  });
}

// =====================================================
// QUERIES
// =====================================================

/**
 * Get all work orders for the manager's portfolio
 */
export const listWorkOrders = query({
  args: {
    status: v.optional(workOrderStatus),
    priority: v.optional(maintenancePriority),
    homeId: v.optional(v.id("homes")),
    workerId: v.optional(v.id("maintenanceWorkers")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile || profile.tier !== "property_manager") return [];

    // Get all work orders for this manager
    let query = ctx.db
      .query("workOrders")
      .withIndex("by_manager_status", (q) => q.eq("managerId", profile._id));

    let workOrders = await query.collect();

    // Apply filters
    if (args.status) {
      workOrders = workOrders.filter((wo) => wo.status === args.status);
    }
    if (args.priority) {
      workOrders = workOrders.filter((wo) => wo.priority === args.priority);
    }
    if (args.homeId) {
      workOrders = workOrders.filter((wo) => wo.homeId === args.homeId);
    }
    if (args.workerId) {
      workOrders = workOrders.filter((wo) => wo.workerId === args.workerId);
    }

    // Limit results
    if (args.limit) {
      workOrders = workOrders.slice(0, args.limit);
    }

    // Enrich with related data
    const enriched = await Promise.all(
      workOrders.map(async (wo) => {
        const home = await ctx.db.get(wo.homeId);
        const worker = wo.workerId ? await ctx.db.get(wo.workerId) : null;
        const system = wo.systemId ? await ctx.db.get(wo.systemId) : null;
        const unit = wo.unitId ? await ctx.db.get(wo.unitId) : null;

        // Check SLA status
        const isOverdue = wo.slaTargetAt ? Date.now() > wo.slaTargetAt : false;
        const hoursUntilSla = wo.slaTargetAt
          ? Math.round((wo.slaTargetAt - Date.now()) / (1000 * 60 * 60))
          : null;

        return {
          ...wo,
          homeName: home?.name || home?.addressLine1,
          homeAddress: home
            ? `${home.addressLine1}, ${home.city}, ${home.state}`
            : undefined,
          unitLabel: unit?.unitLabel,
          workerName: worker?.name,
          systemName: system?.name,
          isOverdue,
          hoursUntilSla,
        };
      })
    );

    // Sort by priority and creation time
    return enriched.sort((a, b) => {
      const priorityOrder = ["critical", "high", "medium", "low", "routine"];
      const aPriority = priorityOrder.indexOf(a.priority);
      const bPriority = priorityOrder.indexOf(b.priority);
      if (aPriority !== bPriority) return aPriority - bPriority;
      return b._creationTime - a._creationTime;
    });
  },
});

/**
 * Get work orders grouped by status (for kanban view)
 */
export const getWorkOrdersByStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile || profile.tier !== "property_manager") return null;

    const workOrders = await ctx.db
      .query("workOrders")
      .withIndex("by_manager_status", (q) => q.eq("managerId", profile._id))
      .collect();

    // Group by status
    const grouped: Record<string, any[]> = {
      submitted: [],
      triaged: [],
      open: [],
      assigned: [],
      scheduled: [],
      in_progress: [],
      pending_review: [],
      completed: [],
    };

    const enrichedOrders = await Promise.all(
      workOrders.map(async (wo) => {
        const [home, worker] = await Promise.all([
          ctx.db.get(wo.homeId),
          wo.workerId ? ctx.db.get(wo.workerId) : null,
        ]);
        return {
          ...wo,
          homeName: home?.name || home?.addressLine1,
          workerName: worker?.name,
          isOverdue: wo.slaTargetAt ? Date.now() > wo.slaTargetAt : false,
        };
      })
    );

    for (const wo of enrichedOrders) {
      if (grouped[wo.status]) {
        grouped[wo.status].push(wo);
      }
    }

    // Sort each group by priority
    const priorityOrder = ["critical", "high", "medium", "low", "routine"];
    for (const status of Object.keys(grouped)) {
      grouped[status].sort((a, b) => {
        const aPriority = priorityOrder.indexOf(a.priority);
        const bPriority = priorityOrder.indexOf(b.priority);
        return aPriority - bPriority;
      });
    }

    return grouped;
  },
});

/**
 * Get a single work order with full details
 */
export const getWorkOrder = query({
  args: {
    workOrderId: v.id("workOrders"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) return null;

    const workOrder = await ctx.db.get(args.workOrderId);
    if (!workOrder) return null;

    // Verify access
    if (workOrder.managerId !== profile._id) {
      // Check if user is staff or unit owner
      // For now, just check manager access
      return null;
    }

    // Get related data
    const home = await ctx.db.get(workOrder.homeId);
    const worker = workOrder.workerId
      ? await ctx.db.get(workOrder.workerId)
      : null;
    const system = workOrder.systemId
      ? await ctx.db.get(workOrder.systemId)
      : null;
    const unit = workOrder.unitId ? await ctx.db.get(workOrder.unitId) : null;
    const incident = workOrder.incidentId
      ? await ctx.db.get(workOrder.incidentId)
      : null;
    const packet = workOrder.packetId
      ? await ctx.db.get(workOrder.packetId)
      : null;
    const serviceRequest = workOrder.serviceRequestId
      ? await ctx.db.get(workOrder.serviceRequestId)
      : null;

    // Get event history
    const events = await ctx.db
      .query("workOrderEvents")
      .withIndex("by_workOrder", (q) => q.eq("workOrderId", args.workOrderId))
      .collect();

    // Enrich events with user names
    const enrichedEvents = await Promise.all(
      events.map(async (event) => {
        const user = await ctx.db.get(event.userId);
        return {
          ...event,
          userName: user?.fullName || user?.email || "Unknown",
        };
      })
    );

    // Get attachments
    const attachments = await ctx.db
      .query("workOrderAttachments")
      .withIndex("by_workOrder", (q) => q.eq("workOrderId", args.workOrderId))
      .collect();

    return {
      ...workOrder,
      home,
      worker,
      system,
      unit,
      incident,
      packet,
      serviceRequest,
      events: enrichedEvents.sort((a, b) => b._creationTime - a._creationTime),
      attachments,
      isOverdue: workOrder.slaTargetAt
        ? Date.now() > workOrder.slaTargetAt
        : false,
    };
  },
});

// =====================================================
// MUTATIONS
// =====================================================

/**
 * Create a new work order
 */
export const create = mutation({
  args: {
    homeId: v.id("homes"),
    unitId: v.optional(v.id("units")),
    systemId: v.optional(v.id("systems")),
    category: workOrderCategory,
    priority: maintenancePriority,
    title: v.string(),
    description: v.optional(v.string()),
    preferredWindow: v.optional(
      v.object({
        startDate: v.string(),
        endDate: v.string(),
        timePreference: v.optional(
          v.union(
            v.literal("morning"),
            v.literal("afternoon"),
            v.literal("evening"),
            v.literal("anytime")
          )
        ),
      })
    ),
    accessNotes: v.optional(v.string()),
    contactOnSite: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    estimatedHours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) throw new Error("Profile not found");

    // Verify home ownership
    const home = await ctx.db.get(args.homeId);
    if (!home || home.ownerId !== profile._id) {
      throw new Error("Home not found or access denied");
    }

    const portfolioId = await getUserPortfolioId(ctx, profile._id);
    const slaTargetAt = calculateSlaDealine(args.priority, Date.now());

    const workOrderId = await ctx.db.insert("workOrders", {
      managerId: profile._id,
      portfolioId: portfolioId || undefined,
      homeId: args.homeId,
      unitId: args.unitId,
      systemId: args.systemId,
      category: args.category,
      status: "open",
      priority: args.priority,
      title: args.title,
      description: args.description,
      preferredWindow: args.preferredWindow,
      accessNotes: args.accessNotes,
      contactOnSite: args.contactOnSite,
      contactPhone: args.contactPhone,
      estimatedHours: args.estimatedHours,
      slaTargetAt,
    });

    // Log creation event
    await logWorkOrderEvent(ctx, workOrderId, profile._id, "created", undefined, "open");

    return { workOrderId };
  },
});

/**
 * Create work order from an incident
 */
export const createFromIncident = mutation({
  args: {
    incidentId: v.id("incidents"),
    category: v.optional(workOrderCategory),
    priority: v.optional(maintenancePriority),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) throw new Error("Profile not found");

    const incident = await ctx.db.get(args.incidentId);
    if (!incident) throw new Error("Incident not found");

    const home = await ctx.db.get(incident.homeId);
    if (!home || home.ownerId !== profile._id) {
      throw new Error("Access denied");
    }

    // Determine priority from incident urgency
    let priority = args.priority;
    if (!priority) {
      priority =
        incident.urgency === "urgent"
          ? "high"
          : incident.urgency === "schedule"
          ? "medium"
          : "low";
    }

    const portfolioId = await getUserPortfolioId(ctx, profile._id);
    const slaTargetAt = calculateSlaDealine(priority, Date.now());

    const workOrderId = await ctx.db.insert("workOrders", {
      managerId: profile._id,
      portfolioId: portfolioId || undefined,
      homeId: incident.homeId,
      systemId: incident.systemId,
      incidentId: args.incidentId,
      packetId: incident.packetId,
      category: args.category || "repair",
      status: "triaged",
      priority,
      title: args.title || `Incident: ${incident.symptomDescription.slice(0, 50)}`,
      description: args.description || incident.symptomDescription,
      slaTargetAt,
    });

    // Update incident status
    await ctx.db.patch(args.incidentId, {
      status: "service_scheduled",
    });

    await logWorkOrderEvent(
      ctx,
      workOrderId,
      profile._id,
      "created",
      undefined,
      "triaged",
      "Created from incident"
    );

    return { workOrderId };
  },
});

/**
 * Create work order from a service request
 */
export const createFromServiceRequest = mutation({
  args: {
    serviceRequestId: v.id("serviceRequests"),
    category: v.optional(workOrderCategory),
    priority: v.optional(maintenancePriority),
    workerId: v.optional(v.id("maintenanceWorkers")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) throw new Error("Profile not found");

    const serviceRequest = await ctx.db.get(args.serviceRequestId);
    if (!serviceRequest) throw new Error("Service request not found");

    const home = await ctx.db.get(serviceRequest.homeId);
    if (!home || home.ownerId !== profile._id) {
      throw new Error("Access denied");
    }

    type WorkOrderPriority =
      | "low"
      | "medium"
      | "high"
      | "critical"
      | "routine";
    type WorkOrderCategory =
      | "repair"
      | "maintenance"
      | "emergency"
      | "inspection"
      | "improvement";

    const priorityMap: Record<string, WorkOrderPriority> = {
      urgent: "critical",
      high: "high",
      medium: "medium",
      low: "low",
    };

    const categoryMap: Record<string, WorkOrderCategory> = {
      repair: "repair",
      maintenance: "maintenance",
      emergency: "emergency",
      question: "inspection",
    };

    const resolvedPriority = (args.priority ??
      priorityMap[serviceRequest.priority] ??
      "medium") as WorkOrderPriority;

    const resolvedCategory = (args.category ??
      categoryMap[serviceRequest.category] ??
      "repair") as WorkOrderCategory;

    const portfolioId = await getUserPortfolioId(ctx, profile._id);
    const slaTargetAt = calculateSlaDealine(resolvedPriority, Date.now());

    const workOrderId = await ctx.db.insert("workOrders", {
      managerId: profile._id,
      portfolioId: portfolioId || undefined,
      homeId: serviceRequest.homeId,
      systemId: serviceRequest.systemId,
      serviceRequestId: args.serviceRequestId,
      workerId: args.workerId,
      category: resolvedCategory,
      status: args.workerId ? "assigned" : "triaged",
      priority: resolvedPriority,
      title: serviceRequest.title,
      description: serviceRequest.description,
      slaTargetAt,
    });

    // Update service request status
    await ctx.db.patch(args.serviceRequestId, {
      status: "in_progress",
      workOrderId,
    });

    await logWorkOrderEvent(
      ctx,
      workOrderId,
      profile._id,
      "created",
      undefined,
      args.workerId ? "assigned" : "triaged",
      "Created from service request"
    );

    return { workOrderId };
  },
});

/**
 * Update work order status with state machine validation
 */
export const updateStatus = mutation({
  args: {
    workOrderId: v.id("workOrders"),
    newStatus: workOrderStatus,
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) throw new Error("Profile not found");

    const workOrder = await ctx.db.get(args.workOrderId);
    if (!workOrder) throw new Error("Work order not found");

    if (workOrder.managerId !== profile._id) {
      throw new Error("Access denied");
    }

    // Validate state transition
    if (!isValidTransition(workOrder.status, args.newStatus)) {
      throw new Error(
        `Invalid status transition from ${workOrder.status} to ${args.newStatus}`
      );
    }

    const oldStatus = workOrder.status;

    // Update work order
    const updates: Record<string, any> = {
      status: args.newStatus,
    };

    // Set completion date if completing
    if (args.newStatus === "completed" || args.newStatus === "verified") {
      updates.completedDate = new Date().toISOString().split("T")[0];
      updates.slaMet = workOrder.slaTargetAt
        ? Date.now() <= workOrder.slaTargetAt
        : true;
    }

    await ctx.db.patch(args.workOrderId, updates);

    // Log the event
    await logWorkOrderEvent(
      ctx,
      args.workOrderId,
      profile._id,
      "status_changed",
      oldStatus,
      args.newStatus,
      args.note
    );

    return { success: true };
  },
});

/**
 * Assign work order to a worker
 */
export const assign = mutation({
  args: {
    workOrderId: v.id("workOrders"),
    workerId: v.id("maintenanceWorkers"),
    scheduledDate: v.optional(v.string()),
    scheduledTime: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) throw new Error("Profile not found");

    const workOrder = await ctx.db.get(args.workOrderId);
    if (!workOrder) throw new Error("Work order not found");

    if (workOrder.managerId !== profile._id) {
      throw new Error("Access denied");
    }

    const worker = await ctx.db.get(args.workerId);
    if (!worker) throw new Error("Worker not found");

    const oldStatus = workOrder.status;
    const newStatus = args.scheduledDate ? "scheduled" : "assigned";

    // Validate transition
    if (!isValidTransition(oldStatus, newStatus)) {
      throw new Error(`Cannot assign work order in ${oldStatus} status`);
    }

    // Get worker's hourly rate
    let hourlyRateSnapshot = worker.defaultHourlyRate;
    if (!hourlyRateSnapshot) {
      const settings = await ctx.db
        .query("organizationSettings")
        .withIndex("by_manager", (q) => q.eq("managerId", profile._id))
        .first();
      hourlyRateSnapshot = settings?.defaultLaborRate;
    }

    await ctx.db.patch(args.workOrderId, {
      workerId: args.workerId,
      status: newStatus,
      scheduledDate: args.scheduledDate,
      scheduledTime: args.scheduledTime,
      hourlyRateSnapshot,
    });

    await logWorkOrderEvent(
      ctx,
      args.workOrderId,
      profile._id,
      "assigned",
      undefined,
      worker.name,
      args.note
    );

    if (args.scheduledDate) {
      await logWorkOrderEvent(
        ctx,
        args.workOrderId,
        profile._id,
        "scheduled",
        undefined,
        args.scheduledDate
      );
    }

    return { success: true };
  },
});

/**
 * Complete a work order and create service event
 */
export const complete = mutation({
  args: {
    workOrderId: v.id("workOrders"),
    resolutionSummary: v.string(),
    actualHours: v.optional(v.number()),
    materialCost: v.optional(v.number()),
    partsUsed: v.optional(
      v.array(
        v.object({
          name: v.string(),
          quantity: v.number(),
          cost: v.optional(v.number()),
        })
      )
    ),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) throw new Error("Profile not found");

    const workOrder = await ctx.db.get(args.workOrderId);
    if (!workOrder) throw new Error("Work order not found");

    if (workOrder.managerId !== profile._id) {
      throw new Error("Access denied");
    }

    // Validate transition
    if (!isValidTransition(workOrder.status, "completed")) {
      throw new Error(`Cannot complete work order in ${workOrder.status} status`);
    }

    // Calculate total cost
    const laborCost =
      (args.actualHours || workOrder.actualHours || 0) *
      (workOrder.hourlyRateSnapshot || 0);
    const totalMaterialCost =
      args.materialCost ||
      (args.partsUsed?.reduce((sum, p) => sum + (p.cost || 0) * p.quantity, 0) ??
        0);
    const totalCost = laborCost + totalMaterialCost;

    // Update work order
    await ctx.db.patch(args.workOrderId, {
      status: "completed",
      completedDate: new Date().toISOString().split("T")[0],
      resolutionSummary: args.resolutionSummary,
      actualHours: args.actualHours || workOrder.actualHours,
      materialCost: totalMaterialCost,
      laborCost,
      totalCost,
      partsUsed: args.partsUsed,
      slaMet: workOrder.slaTargetAt ? Date.now() <= workOrder.slaTargetAt : true,
    });

    // Create service event
    const serviceEventId = await ctx.db.insert("homeownerServiceEvents", {
      homeId: workOrder.homeId,
      systemId: workOrder.systemId,
      incidentId: workOrder.incidentId,
      packetId: workOrder.packetId,
      eventType: workOrder.category === "maintenance" ? "maintenance" : "repair",
      eventDate: new Date().toISOString().split("T")[0],
      description: args.resolutionSummary,
      totalCost,
      wasDiy: false,
    });

    // Link service event to work order
    await ctx.db.patch(args.workOrderId, { serviceEventId });

    // Update incident if linked
    if (workOrder.incidentId) {
      await ctx.db.patch(workOrder.incidentId, {
        status: "resolved",
        resolvedAt: Date.now(),
        resolutionNotes: args.resolutionSummary,
        serviceEventId,
      });
    }

    // Update service request if linked
    if (workOrder.serviceRequestId) {
      await ctx.db.patch(workOrder.serviceRequestId, {
        status: "resolved",
        resolvedAt: Date.now(),
        resolutionSummary: args.resolutionSummary,
      });
    }

    await logWorkOrderEvent(
      ctx,
      args.workOrderId,
      profile._id,
      "completed",
      workOrder.status,
      "completed",
      args.note
    );

    const basePointsByPriority: Record<string, number> = {
      routine: 8,
      low: 10,
      medium: 15,
      high: 20,
      critical: 30,
    };
    const basePoints = basePointsByPriority[workOrder.priority] ?? 12;

    await awardHealthPoints(ctx, {
      userId: profile._id,
      portfolioId: workOrder.portfolioId || undefined,
      homeId: workOrder.homeId,
      systemId: workOrder.systemId,
      workOrderId: workOrder._id,
      sourceType: "work_order_completed",
      points: basePoints,
      reason: workOrder.title,
      metadata: { priority: workOrder.priority },
    });

    if (workOrder.slaTargetAt && Date.now() <= workOrder.slaTargetAt) {
      await awardHealthPoints(ctx, {
        userId: profile._id,
        portfolioId: workOrder.portfolioId || undefined,
        homeId: workOrder.homeId,
        systemId: workOrder.systemId,
        workOrderId: workOrder._id,
        sourceType: "work_order_on_time",
        points: 12,
        reason: "Completed within SLA",
      });
    }

    return { success: true, serviceEventId };
  },
});

/**
 * Add a note to a work order
 */
export const addNote = mutation({
  args: {
    workOrderId: v.id("workOrders"),
    note: v.string(),
    isInternal: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) throw new Error("Profile not found");

    const workOrder = await ctx.db.get(args.workOrderId);
    if (!workOrder) throw new Error("Work order not found");

    if (args.isInternal) {
      // Append to internal notes
      const currentNotes = workOrder.internalNotes || "";
      const timestamp = new Date().toISOString();
      const newNote = `[${timestamp}] ${args.note}`;
      await ctx.db.patch(args.workOrderId, {
        internalNotes: currentNotes ? `${currentNotes}\n${newNote}` : newNote,
      });
    } else {
      // Append to regular notes
      const currentNotes = workOrder.notes || "";
      const timestamp = new Date().toISOString();
      const newNote = `[${timestamp}] ${args.note}`;
      await ctx.db.patch(args.workOrderId, {
        notes: currentNotes ? `${currentNotes}\n${newNote}` : newNote,
      });
    }

    await logWorkOrderEvent(
      ctx,
      args.workOrderId,
      profile._id,
      "note_added",
      undefined,
      undefined,
      args.note
    );

    return { success: true };
  },
});

/**
 * Update work order costs
 */
export const updateCosts = mutation({
  args: {
    workOrderId: v.id("workOrders"),
    estimatedHours: v.optional(v.number()),
    actualHours: v.optional(v.number()),
    materialCost: v.optional(v.number()),
    laborCost: v.optional(v.number()),
    vendorInvoiceNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) throw new Error("Profile not found");

    const workOrder = await ctx.db.get(args.workOrderId);
    if (!workOrder) throw new Error("Work order not found");

    if (workOrder.managerId !== profile._id) {
      throw new Error("Access denied");
    }

    const { workOrderId, ...updates } = args;

    // Calculate total if we have both costs
    const materialCost = updates.materialCost ?? workOrder.materialCost ?? 0;
    const laborCost = updates.laborCost ?? workOrder.laborCost ?? 0;
    const totalCost = materialCost + laborCost;

    await ctx.db.patch(workOrderId, {
      ...updates,
      totalCost,
    });

    await logWorkOrderEvent(
      ctx,
      workOrderId,
      profile._id,
      "cost_updated",
      undefined,
      `Total: $${totalCost}`
    );

    return { success: true };
  },
});

/**
 * Get work order statistics
 */
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile || profile.tier !== "property_manager") return null;

    const workOrders = await ctx.db
      .query("workOrders")
      .withIndex("by_manager_status", (q) => q.eq("managerId", profile._id))
      .collect();

    const now = Date.now();

    const stats = {
      total: workOrders.length,
      open: workOrders.filter((wo) =>
        ["submitted", "triaged", "open", "assigned", "scheduled"].includes(wo.status)
      ).length,
      inProgress: workOrders.filter((wo) => wo.status === "in_progress").length,
      pendingReview: workOrders.filter((wo) => wo.status === "pending_review").length,
      completed: workOrders.filter((wo) =>
        ["completed", "verified"].includes(wo.status)
      ).length,
      overdue: workOrders.filter(
        (wo) =>
          wo.slaTargetAt &&
          now > wo.slaTargetAt &&
          !["completed", "verified", "cancelled"].includes(wo.status)
      ).length,
      byPriority: {
        critical: workOrders.filter((wo) => wo.priority === "critical").length,
        high: workOrders.filter((wo) => wo.priority === "high").length,
        medium: workOrders.filter((wo) => wo.priority === "medium").length,
        low: workOrders.filter((wo) => wo.priority === "low").length,
        routine: workOrders.filter((wo) => wo.priority === "routine").length,
      },
      avgCompletionTime: 0, // TODO: Calculate from completed orders
    };

    // Calculate average completion time
    const completedOrders = workOrders.filter(
      (wo) => wo.status === "completed" || wo.status === "verified"
    );
    if (completedOrders.length > 0) {
      const totalTime = completedOrders.reduce((sum, wo) => {
        if (wo.completedDate) {
          const completedAt = new Date(wo.completedDate).getTime();
          return sum + (completedAt - wo._creationTime);
        }
        return sum;
      }, 0);
      stats.avgCompletionTime = Math.round(
        totalTime / completedOrders.length / (1000 * 60 * 60)
      ); // Hours
    }

    return stats;
  },
});
