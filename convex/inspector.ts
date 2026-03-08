import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";

const DEFAULT_SYSTEMS: { category: string; systemName: string }[] = [
  { category: "hvac", systemName: "Air Conditioner" },
  { category: "hvac", systemName: "Furnace / Air Handler" },
  { category: "hvac", systemName: "Ductwork" },
  { category: "plumbing", systemName: "Water Heater" },
  { category: "plumbing", systemName: "Supply Lines" },
  { category: "plumbing", systemName: "Drain / Waste / Vent" },
  { category: "electrical", systemName: "Main Panel" },
  { category: "electrical", systemName: "Wiring" },
  { category: "roof", systemName: "Roof Covering" },
  { category: "exterior", systemName: "Siding / Cladding" },
  { category: "exterior", systemName: "Windows / Doors" },
  { category: "interior_surfaces", systemName: "Flooring" },
  { category: "interior_surfaces", systemName: "Countertops" },
  { category: "interior_surfaces", systemName: "Walls / Paint" },
  { category: "interior_surfaces", systemName: "Tile (Wet Areas)" },
  { category: "appliances", systemName: "Kitchen Appliances" },
];

async function getInspectorCtx(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");

  const profile = await ctx.db
    .query("userProfiles")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .first();
  if (!profile) throw new Error("User profile not found");

  const inspector = await ctx.db
    .query("inspectorProfiles")
    .withIndex("by_userId", (q: any) => q.eq("userId", profile._id))
    .first();

  return { userId, profile, inspector };
}

// 1. Get current user's inspector profile
export const getInspectorProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!profile) return null;

    const inspector = await ctx.db
      .query("inspectorProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", profile._id))
      .first();

    return inspector;
  },
});

// 2. Create new inspector profile
export const createInspectorProfile = mutation({
  args: {
    companyName: v.string(),
    licenseNumber: v.optional(v.string()),
    licenseState: v.optional(v.string()),
    yearsExperience: v.string(),
    inspectionsPerMonth: v.optional(v.string()),
    serviceAreaZips: v.array(v.string()),
    phone: v.string(),
    email: v.string(),
    website: v.optional(v.string()),
    plan: v.optional(
      v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise"))
    ),
  },
  handler: async (ctx, args) => {
    const { profile } = await getInspectorCtx(ctx);

    const existing = await ctx.db
      .query("inspectorProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", profile._id))
      .first();
    if (existing) throw new Error("Inspector profile already exists");

    const profileId = await ctx.db.insert("inspectorProfiles", {
      userId: profile._id,
      companyName: args.companyName,
      licenseNumber: args.licenseNumber,
      licenseState: args.licenseState,
      yearsExperience: args.yearsExperience,
      inspectionsPerMonth: args.inspectionsPerMonth,
      serviceAreaZips: args.serviceAreaZips,
      plan: args.plan ?? "pro",
      contactInfo: {
        phone: args.phone,
        email: args.email,
        website: args.website,
      },
      stats: {
        totalInspections: 0,
        activeSubscribers: 0,
        totalCommission: 0,
      },
      isActive: true,
      createdAt: Date.now(),
    });

    return profileId;
  },
});

// 3. Update inspector profile fields
export const updateInspectorProfile = mutation({
  args: {
    companyName: v.optional(v.string()),
    licenseNumber: v.optional(v.string()),
    licenseState: v.optional(v.string()),
    yearsExperience: v.optional(v.string()),
    inspectionsPerMonth: v.optional(v.string()),
    serviceAreaZips: v.optional(v.array(v.string())),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    logoStorageId: v.optional(v.id("_storage")),
    brandColors: v.optional(
      v.object({ primary: v.string(), accent: v.string() })
    ),
    reportHeaderText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { inspector } = await getInspectorCtx(ctx);
    if (!inspector) throw new Error("Inspector profile not found");

    const patch: Record<string, any> = {};

    if (args.companyName !== undefined) patch.companyName = args.companyName;
    if (args.licenseNumber !== undefined)
      patch.licenseNumber = args.licenseNumber;
    if (args.licenseState !== undefined) patch.licenseState = args.licenseState;
    if (args.yearsExperience !== undefined)
      patch.yearsExperience = args.yearsExperience;
    if (args.inspectionsPerMonth !== undefined)
      patch.inspectionsPerMonth = args.inspectionsPerMonth;
    if (args.serviceAreaZips !== undefined)
      patch.serviceAreaZips = args.serviceAreaZips;
    if (args.logoStorageId !== undefined)
      patch.logoStorageId = args.logoStorageId;
    if (args.brandColors !== undefined) patch.brandColors = args.brandColors;
    if (args.reportHeaderText !== undefined)
      patch.reportHeaderText = args.reportHeaderText;

    if (
      args.phone !== undefined ||
      args.email !== undefined ||
      args.website !== undefined
    ) {
      patch.contactInfo = {
        phone: args.phone ?? inspector.contactInfo.phone,
        email: args.email ?? inspector.contactInfo.email,
        website: args.website ?? inspector.contactInfo.website,
      };
    }

    await ctx.db.patch(inspector._id, patch);
  },
});

// 4. Inspector dashboard: profile + stats + recent inspections
export const getInspectorDashboard = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!profile) return null;

    const inspector = await ctx.db
      .query("inspectorProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", profile._id))
      .first();
    if (!inspector) return null;

    const recentInspections = await ctx.db
      .query("inspections")
      .withIndex("by_inspector", (q) => q.eq("inspectorId", inspector._id))
      .order("desc")
      .take(10);

    return {
      profile: inspector,
      stats: inspector.stats,
      recentInspections,
    };
  },
});

// 5. List all inspections for current inspector with optional status filter
export const listInspections = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("in_progress"),
        v.literal("completed"),
        v.literal("delivered")
      )
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!profile) return [];

    const inspector = await ctx.db
      .query("inspectorProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", profile._id))
      .first();
    if (!inspector) return [];

    let inspections;
    if (args.status) {
      inspections = await ctx.db
        .query("inspections")
        .withIndex("by_inspector_status", (q) =>
          q.eq("inspectorId", inspector._id).eq("status", args.status!)
        )
        .order("desc")
        .collect();
    } else {
      inspections = await ctx.db
        .query("inspections")
        .withIndex("by_inspector", (q) => q.eq("inspectorId", inspector._id))
        .order("desc")
        .collect();
    }

    return inspections;
  },
});

// 6. Get single inspection with all its systems
export const getInspection = query({
  args: { inspectionId: v.id("inspections") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!profile) return null;

    const inspection = await ctx.db.get(args.inspectionId);
    if (!inspection) return null;

    const inspector = await ctx.db.get(inspection.inspectorId);
    if (!inspector || inspector.userId !== profile._id) return null;

    const systems = await ctx.db
      .query("inspectionSystems")
      .withIndex("by_inspection", (q) =>
        q.eq("inspectionId", args.inspectionId)
      )
      .collect();

    return {
      ...inspection,
      systems: systems.sort((a, b) => a.sortOrder - b.sortOrder),
    };
  },
});

// 7. Create new inspection
export const createInspection = mutation({
  args: {
    propertyAddress: v.string(),
    propertyCity: v.optional(v.string()),
    propertyState: v.optional(v.string()),
    propertyZip: v.optional(v.string()),
    propertyType: v.string(),
    yearBuilt: v.number(),
    squareFootage: v.number(),
    stories: v.number(),
    foundationType: v.string(),
    buyerName: v.string(),
    buyerEmail: v.string(),
    buyerPhone: v.optional(v.string()),
    realtorName: v.optional(v.string()),
    realtorEmail: v.optional(v.string()),
    inspectionDate: v.number(),
  },
  handler: async (ctx, args) => {
    const { inspector } = await getInspectorCtx(ctx);
    if (!inspector) throw new Error("Inspector profile not found");

    const inspectionId = await ctx.db.insert("inspections", {
      inspectorId: inspector._id,
      status: "draft",
      propertyAddress: args.propertyAddress,
      propertyCity: args.propertyCity,
      propertyState: args.propertyState,
      propertyZip: args.propertyZip,
      propertyType: args.propertyType,
      yearBuilt: args.yearBuilt,
      squareFootage: args.squareFootage,
      stories: args.stories,
      foundationType: args.foundationType,
      buyerName: args.buyerName,
      buyerEmail: args.buyerEmail,
      buyerPhone: args.buyerPhone,
      realtorName: args.realtorName,
      realtorEmail: args.realtorEmail,
      inspectionDate: args.inspectionDate,
      systemsTotal: DEFAULT_SYSTEMS.length,
      systemsCompleted: 0,
      concernsCount: 0,
      photosCount: 0,
    });

    await ctx.scheduler.runAfter(
      0,
      internal.inspector.initializeInspectionSystems,
      { inspectionId }
    );

    return inspectionId;
  },
});

// 8. Update inspection fields
export const updateInspection = mutation({
  args: {
    inspectionId: v.id("inspections"),
    propertyAddress: v.optional(v.string()),
    propertyCity: v.optional(v.string()),
    propertyState: v.optional(v.string()),
    propertyZip: v.optional(v.string()),
    propertyType: v.optional(v.string()),
    yearBuilt: v.optional(v.number()),
    squareFootage: v.optional(v.number()),
    stories: v.optional(v.number()),
    foundationType: v.optional(v.string()),
    buyerName: v.optional(v.string()),
    buyerEmail: v.optional(v.string()),
    buyerPhone: v.optional(v.string()),
    realtorName: v.optional(v.string()),
    realtorEmail: v.optional(v.string()),
    inspectionDate: v.optional(v.number()),
    overallCondition: v.optional(v.string()),
    executiveSummary: v.optional(v.string()),
    reportShareToken: v.optional(v.string()),
    keptHomeId: v.optional(v.id("homes")),
    fiveYearCostEstimate: v.optional(v.object({ low: v.number(), high: v.number() })),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("in_progress"),
        v.literal("completed"),
        v.literal("delivered")
      )
    ),
  },
  handler: async (ctx, args) => {
    const { inspector } = await getInspectorCtx(ctx);
    if (!inspector) throw new Error("Inspector profile not found");

    const inspection = await ctx.db.get(args.inspectionId);
    if (!inspection) throw new Error("Inspection not found");
    if (inspection.inspectorId !== inspector._id)
      throw new Error("Not authorized");

    const { inspectionId, ...fields } = args;
    const patch: Record<string, any> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) patch[key] = value;
    }

    await ctx.db.patch(args.inspectionId, patch);
  },
});

// 9. Delete a draft inspection
export const deleteInspection = mutation({
  args: { inspectionId: v.id("inspections") },
  handler: async (ctx, args) => {
    const { inspector } = await getInspectorCtx(ctx);
    if (!inspector) throw new Error("Inspector profile not found");

    const inspection = await ctx.db.get(args.inspectionId);
    if (!inspection) throw new Error("Inspection not found");
    if (inspection.inspectorId !== inspector._id)
      throw new Error("Not authorized");
    if (inspection.status !== "draft")
      throw new Error("Only draft inspections can be deleted");

    const systems = await ctx.db
      .query("inspectionSystems")
      .withIndex("by_inspection", (q) =>
        q.eq("inspectionId", args.inspectionId)
      )
      .collect();

    for (const system of systems) {
      await ctx.db.delete(system._id);
    }

    await ctx.db.delete(args.inspectionId);
  },
});

// 10. Get all systems for an inspection
export const getInspectionSystems = query({
  args: { inspectionId: v.id("inspections") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const systems = await ctx.db
      .query("inspectionSystems")
      .withIndex("by_inspection", (q) =>
        q.eq("inspectionId", args.inspectionId)
      )
      .collect();

    return systems.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

// 11. Update a single inspection system
export const updateInspectionSystem = mutation({
  args: {
    systemId: v.id("inspectionSystems"),
    condition: v.optional(
      v.union(
        v.literal("good"),
        v.literal("fair"),
        v.literal("poor"),
        v.literal("immediate_attention"),
        v.literal("not_inspected")
      )
    ),
    checklist: v.optional(
      v.array(
        v.object({
          item: v.string(),
          passed: v.boolean(),
          flagged: v.boolean(),
          note: v.optional(v.string()),
        })
      )
    ),
    notes: v.optional(v.string()),
    make: v.optional(v.string()),
    model: v.optional(v.string()),
    serialNumber: v.optional(v.string()),
    yearManufactured: v.optional(v.number()),
    systemType: v.optional(v.string()),
    capacity: v.optional(v.string()),
    fuelType: v.optional(v.string()),
    predictedLife: v.optional(
      v.object({
        remainingYearsLow: v.number(),
        remainingYearsHigh: v.number(),
      })
    ),
    predictedReplacementCost: v.optional(
      v.object({ low: v.number(), high: v.number() })
    ),
    riskLevel: v.optional(
      v.union(
        v.literal("low"),
        v.literal("moderate"),
        v.literal("high"),
        v.literal("critical")
      )
    ),
    maintenanceRecommendations: v.optional(v.array(v.string())),
    isComplete: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { inspector } = await getInspectorCtx(ctx);
    if (!inspector) throw new Error("Inspector profile not found");

    const system = await ctx.db.get(args.systemId);
    if (!system) throw new Error("System not found");

    const inspection = await ctx.db.get(system.inspectionId);
    if (!inspection || inspection.inspectorId !== inspector._id)
      throw new Error("Not authorized");

    const { systemId, ...fields } = args;
    const patch: Record<string, any> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) patch[key] = value;
    }

    await ctx.db.patch(args.systemId, patch);

    // Recount completed systems on the parent inspection
    const allSystems = await ctx.db
      .query("inspectionSystems")
      .withIndex("by_inspection", (q) =>
        q.eq("inspectionId", system.inspectionId)
      )
      .collect();

    const updatedSystem = { ...system, ...patch };
    const completedCount = allSystems.filter((s) =>
      s._id === args.systemId ? updatedSystem.isComplete : s.isComplete
    ).length;

    await ctx.db.patch(system.inspectionId, {
      systemsCompleted: completedCount,
    });
  },
});

// 12. Add a photo to a system's photoStorageIds array
export const addSystemPhoto = mutation({
  args: {
    systemId: v.id("inspectionSystems"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const { inspector } = await getInspectorCtx(ctx);
    if (!inspector) throw new Error("Inspector profile not found");

    const system = await ctx.db.get(args.systemId);
    if (!system) throw new Error("System not found");

    const inspection = await ctx.db.get(system.inspectionId);
    if (!inspection || inspection.inspectorId !== inspector._id)
      throw new Error("Not authorized");

    const updatedPhotos = [...system.photoStorageIds, args.storageId];
    await ctx.db.patch(args.systemId, { photoStorageIds: updatedPhotos });

    // Update total photo count on the inspection
    const allSystems = await ctx.db
      .query("inspectionSystems")
      .withIndex("by_inspection", (q) =>
        q.eq("inspectionId", system.inspectionId)
      )
      .collect();

    const totalPhotos = allSystems.reduce(
      (sum, s) =>
        sum +
        (s._id === args.systemId
          ? updatedPhotos.length
          : s.photoStorageIds.length),
      0
    );

    await ctx.db.patch(system.inspectionId, { photosCount: totalPhotos });
  },
});

// 13. Generate upload URL for file uploads
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

// 14. Complete an inspection
export const completeInspection = mutation({
  args: {
    inspectionId: v.id("inspections"),
    overallCondition: v.optional(v.string()),
    executiveSummary: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { inspector } = await getInspectorCtx(ctx);
    if (!inspector) throw new Error("Inspector profile not found");

    const inspection = await ctx.db.get(args.inspectionId);
    if (!inspection) throw new Error("Inspection not found");
    if (inspection.inspectorId !== inspector._id)
      throw new Error("Not authorized");

    const systems = await ctx.db
      .query("inspectionSystems")
      .withIndex("by_inspection", (q) =>
        q.eq("inspectionId", args.inspectionId)
      )
      .collect();

    const concernsCount = systems.filter(
      (s) => s.condition === "poor" || s.condition === "immediate_attention"
    ).length;

    const now = Date.now();

    await ctx.db.patch(args.inspectionId, {
      status: "completed",
      concernsCount,
      completedAt: now,
      overallCondition: args.overallCondition,
      executiveSummary: args.executiveSummary,
    });

    await ctx.db.patch(inspector._id, {
      stats: {
        ...inspector.stats,
        totalInspections: inspector.stats.totalInspections + 1,
      },
    });
  },
});

// 15. Inspector analytics: metrics, revenue, conversion rate, top realtors
export const getInspectorAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!profile) return null;

    const inspector = await ctx.db
      .query("inspectorProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", profile._id))
      .first();
    if (!inspector) return null;

    const allInspections = await ctx.db
      .query("inspections")
      .withIndex("by_inspector", (q) => q.eq("inspectorId", inspector._id))
      .collect();

    const now = new Date();
    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    ).getTime();
    const startOfQuarter = new Date(
      now.getFullYear(),
      Math.floor(now.getMonth() / 3) * 3,
      1
    ).getTime();
    const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();

    const thisMonth = allInspections.filter(
      (i) => i.inspectionDate >= startOfMonth
    );
    const thisQuarter = allInspections.filter(
      (i) => i.inspectionDate >= startOfQuarter
    );
    const thisYear = allInspections.filter(
      (i) => i.inspectionDate >= startOfYear
    );

    const commissions = await ctx.db
      .query("inspectorCommissions")
      .withIndex("by_inspector", (q) => q.eq("inspectorId", inspector._id))
      .collect();

    const totalRevenue = commissions.reduce((sum, c) => sum + c.amount, 0);

    const completedInspections = allInspections.filter(
      (i) => i.status === "completed" || i.status === "delivered"
    );
    const subscribedCount = completedInspections.filter(
      (i) => i.keptSubscriptionStatus === "active"
    ).length;
    const conversionRate =
      completedInspections.length > 0
        ? subscribedCount / completedInspections.length
        : 0;

    const realtorCounts: Record<string, number> = {};
    for (const i of allInspections) {
      if (i.realtorName) {
        realtorCounts[i.realtorName] =
          (realtorCounts[i.realtorName] || 0) + 1;
      }
    }
    const topRealtors = Object.entries(realtorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    return {
      inspectionsThisMonth: thisMonth.length,
      inspectionsThisQuarter: thisQuarter.length,
      inspectionsThisYear: thisYear.length,
      totalInspections: allInspections.length,
      totalRevenue,
      conversionRate,
      topRealtors,
    };
  },
});

// 16. Internal: populate default system rows after creating an inspection
export const initializeInspectionSystems = internalMutation({
  args: { inspectionId: v.id("inspections") },
  handler: async (ctx, args) => {
    for (let i = 0; i < DEFAULT_SYSTEMS.length; i++) {
      const { category, systemName } = DEFAULT_SYSTEMS[i];
      await ctx.db.insert("inspectionSystems", {
        inspectionId: args.inspectionId,
        category,
        systemName,
        sortOrder: i,
        condition: "not_inspected",
        checklist: [],
        photoStorageIds: [],
        isComplete: false,
      });
    }
  },
});

export const getPublicReport = query({
  args: { shareToken: v.string() },
  handler: async (ctx, args) => {
    const inspection = await ctx.db
      .query("inspections")
      .withIndex("by_shareToken", (q) => q.eq("reportShareToken", args.shareToken))
      .first();
    if (!inspection) return null;

    const systems = await ctx.db
      .query("inspectionSystems")
      .withIndex("by_inspection", (q) => q.eq("inspectionId", inspection._id))
      .collect();

    const inspector = await ctx.db.get(inspection.inspectorId);
    return { inspection, systems, inspector };
  },
});
