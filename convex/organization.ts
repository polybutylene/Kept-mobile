import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { workOrderCategory } from "./schema";

/**
 * Get organization settings for the current manager
 */
export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || profile.tier !== "property_manager") return null;

    return await ctx.db
      .query("organizationSettings")
      .withIndex("by_manager", (q) => q.eq("managerId", profile._id))
      .first();
  },
});

/**
 * Update organization settings
 */
export const updateSettings = mutation({
  args: {
    companyName: v.string(),
    defaultLaborRate: v.number(),
    defaultMaterialMarkup: v.number(),
    inflationRateOverride: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || profile.tier !== "property_manager") {
      throw new Error("Unauthorized");
    }

    const existing = await ctx.db
      .query("organizationSettings")
      .withIndex("by_manager", (q) => q.eq("managerId", profile._id))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("organizationSettings", {
        managerId: profile._id,
        ...args,
      });
    }
  },
});

/**
 * Get all workers for the manager
 */
export const getWorkers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || profile.tier !== "property_manager") return [];

    return await ctx.db
      .query("maintenanceWorkers")
      .withIndex("by_manager_active", (q) =>
        q.eq("managerId", profile._id).eq("isActive", true)
      )
      .collect();
  },
});

/**
 * Add a new worker
 */
export const addWorker = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    type: v.union(v.literal("internal"), v.literal("vendor")),
    specialties: v.optional(v.array(v.union(
      v.literal("hvac"),
      v.literal("plumbing"),
      v.literal("electrical"),
      v.literal("appliances"),
      v.literal("structural"),
      v.literal("exterior")
    ))),
    defaultHourlyRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || profile.tier !== "property_manager") {
      throw new Error("Unauthorized");
    }

    await ctx.db.insert("maintenanceWorkers", {
      managerId: profile._id,
      isActive: true,
      ...args,
    });
  },
});

/**
 * Create a work order
 */
export const createWorkOrder = mutation({
  args: {
    homeId: v.id("homes"),
    taskId: v.optional(v.id("scheduledMaintenance")),
    workerId: v.optional(v.id("maintenanceWorkers")),
    category: v.optional(workOrderCategory),
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.union(
      v.literal("critical"),
      v.literal("high"),
      v.literal("medium"),
      v.literal("low"),
      v.literal("routine")
    ),
    scheduledDate: v.optional(v.string()),
    estimatedHours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || profile.tier !== "property_manager") {
      throw new Error("Unauthorized");
    }

    // Verify home ownership
    const home = await ctx.db.get(args.homeId);
    if (!home || home.ownerId !== profile._id) {
      throw new Error("Home not found");
    }

    // Get default rate if worker assigned
    let hourlyRateSnapshot = undefined;
    if (args.workerId) {
      const worker = await ctx.db.get(args.workerId);
      if (worker) {
        hourlyRateSnapshot = worker.defaultHourlyRate;
      }
    }
    
    // If no specific rate, fetch org default
    if (!hourlyRateSnapshot) {
      const settings = await ctx.db
        .query("organizationSettings")
        .withIndex("by_manager", (q) => q.eq("managerId", profile._id))
        .first();
      if (settings) {
        hourlyRateSnapshot = settings.defaultLaborRate;
      }
    }

    await ctx.db.insert("workOrders", {
      managerId: profile._id,
      status: args.workerId ? "assigned" : "open",
      category: args.category ?? "maintenance",
      hourlyRateSnapshot,
      ...args,
    });

    // Update linked task status if applicable
    if (args.taskId) {
      await ctx.db.patch(args.taskId, {
        status: "upcoming", // or custom status for "assigned" if we add it
        assignedTo: args.workerId ? (await ctx.db.get(args.workerId))?.name : undefined,
        assignedAt: Date.now(),
      });
    }
  },
});

/**
 * Get work orders with filtering
 */
export const getWorkOrders = query({
  args: {
    status: v.optional(v.string()),
    workerId: v.optional(v.id("maintenanceWorkers")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || profile.tier !== "property_manager") return [];

    let q = ctx.db
      .query("workOrders")
      .withIndex("by_manager_status", (q) => q.eq("managerId", profile._id));

    // Note: status filter on index requires exact match or range. 
    // Here we're fetching all for manager and filtering in memory if status not in index query
    // Optimally we'd have specific indexes or use .filter()
    
    const orders = await q.collect();
    
    const workers = await ctx.db
        .query("maintenanceWorkers")
        .withIndex("by_manager_active", (q) => q.eq("managerId", profile._id))
        .collect();
    
    const homes = await ctx.db
        .query("homes")
        .withIndex("by_owner", (q) => q.eq("ownerId", profile._id))
        .collect();

    // Join data
    return orders.map(order => {
        const worker = workers.find(w => w._id === order.workerId);
        const home = homes.find(h => h._id === order.homeId);
        return {
            ...order,
            workerName: worker?.name,
            homeName: home?.name || home?.addressLine1,
        };
    }).filter(o => !args.status || o.status === args.status);
  },
});

/**
 * Get billing summary for managed residents
 */
export const getBillingSummary = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || profile.tier !== "property_manager") return null;

    // Get actual counts from managedMembers
    const members = await ctx.db
      .query("managedMembers")
      .withIndex("by_manager_status", (q) =>
        q.eq("managerId", profile._id).eq("status", "active")
      )
      .collect();

    const homeownerCount = members.filter((m) => m.role === "homeowner").length;
    const tenantCount = members.filter((m) => m.role === "tenant").length;

    const homeownerCost = homeownerCount * 4;
    const tenantCost = tenantCount * 2;
    const totalMonthlyCost = homeownerCost + tenantCost;

    // Base PM subscription cost
    const basePmCost = 49.99;

    return {
      homeownerCount,
      tenantCount,
      totalSeats: homeownerCount + tenantCount,
      homeownerCost,
      tenantCost,
      totalSeatCost: totalMonthlyCost,
      basePmCost,
      totalMonthlyCost: basePmCost + totalMonthlyCost,
      breakdown: {
        pm: { label: "Property Manager Base", cost: basePmCost },
        homeowners: { label: `Homeowners (${homeownerCount} × $4)`, cost: homeownerCost },
        tenants: { label: `Tenants (${tenantCount} × $2)`, cost: tenantCost },
      },
    };
  },
});

/**
 * Sync seat counts to organization settings (called after member changes)
 */
export const syncSeatCounts = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || profile.tier !== "property_manager") {
      throw new Error("Unauthorized");
    }

    const members = await ctx.db
      .query("managedMembers")
      .withIndex("by_manager_status", (q) =>
        q.eq("managerId", profile._id).eq("status", "active")
      )
      .collect();

    const homeownerCount = members.filter((m) => m.role === "homeowner").length;
    const tenantCount = members.filter((m) => m.role === "tenant").length;

    const settings = await ctx.db
      .query("organizationSettings")
      .withIndex("by_manager", (q) => q.eq("managerId", profile._id))
      .first();

    if (settings) {
      await ctx.db.patch(settings._id, {
        activeHomeownerSeats: homeownerCount,
        activeTenantSeats: tenantCount,
      });
    }

    return { homeownerCount, tenantCount };
  },
});
