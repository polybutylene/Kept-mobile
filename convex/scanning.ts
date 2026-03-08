import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { internalMutation, internalQuery, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Upload a document for scanning
 */
export const uploadDocument = mutation({
  args: {
    homeId: v.optional(v.id("homes")),
    serviceCallId: v.optional(v.id("serviceCalls")),
    systemId: v.optional(v.id("systems")),
    documentType: v.union(
      v.literal("invoice"),
      v.literal("quote"),
      v.literal("warranty"),
      v.literal("model_plate"),
      v.literal("manual"),
      v.literal("receipt"),
      v.literal("other")
    ),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileSize: v.optional(v.number()),
    mimeType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError({ message: "Not authenticated. Please sign in." });

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile) throw new ConvexError({ message: "Profile not found. Complete onboarding first." });

    // Check limits for model plate scanning
    if (args.documentType === "model_plate") {
      let featureFlags = await ctx.db
        .query("featureFlags")
        .withIndex("by_tier", (q) => q.eq("tier", profile.tier))
        .first();

      // Fallback: if no flags for this tier, try "homeowner" (covers deprecated tiers)
      if (!featureFlags) {
        featureFlags = await ctx.db
          .query("featureFlags")
          .withIndex("by_tier", (q) => q.eq("tier", "homeowner"))
          .first();
      }

      if (!featureFlags) {
        throw new ConvexError({
          message: "Scan is not available: feature flags are missing. Run the feature flags seed in Convex (e.g. npx convex run seed/featureFlags:seed).",
        });
      }

      if (!featureFlags.canScanModelPlates) {
        throw new ConvexError({ message: "Model plate scanning is a Pro feature. Upgrade to scan." });
      }

      const monthlyLimit = featureFlags.monthlyScanLimit ?? 0;

      if (args.homeId) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

        const docs = await ctx.db
          .query("serviceDocuments")
          .withIndex("by_home", (q) => q.eq("homeId", args.homeId!))
          .collect();

        const recentScans = docs.filter(
          (d) =>
            d.documentType === "model_plate" &&
            d.uploadedBy === profile._id &&
            d._creationTime >= startOfMonth
        );

        if (recentScans.length >= monthlyLimit) {
          throw new ConvexError({
            message: `Monthly scan limit reached (${monthlyLimit}/month). Upgrade for more.`,
          });
        }
      }
    }

    try {
      const documentId = await ctx.db.insert("serviceDocuments", {
        homeId: args.homeId,
        serviceCallId: args.serviceCallId,
        systemId: args.systemId,
        uploadedBy: profile._id,
        documentType: args.documentType,
        storageId: args.storageId,
        fileName: args.fileName,
        fileSize: args.fileSize ?? undefined,
        mimeType: args.mimeType ?? undefined,
        parseStatus: "pending",
      });
      return documentId;
    } catch (e: any) {
      throw new ConvexError({
        message: e?.message?.includes("schema") || e?.message?.includes("validation")
          ? "Invalid document data. Please try a different image or file."
          : "Failed to save scan. Please try again.",
      });
    }
  },
});

// Internal functions for the action to call

export const getDocument = internalQuery({
  args: {
    documentId: v.id("serviceDocuments"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.documentId);
  },
});

export const updateDocumentStatus = internalMutation({
  args: {
    documentId: v.id("serviceDocuments"),
    parseStatus: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    parseError: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.documentId, {
      parseStatus: args.parseStatus,
      ...(args.parseError && { parseError: args.parseError }),
    });
  },
});

export const updateDocumentWithExtractedData = internalMutation({
  args: {
    documentId: v.id("serviceDocuments"),
    extractedData: v.any(),
    parseStatus: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
  },
  handler: async (ctx, args) => {
    // Sanitize extractedData to only include fields defined in the schema.
    // Claude may return extra fields or wrong types that fail Convex validation.
    const STRING_KEYS = new Set([
      "vendor", "date", "modelNumber", "serialNumber", "manufacturer",
      "warrantyInfo", "warrantyExpiry", "yearManufactured", "btuRating",
      "voltage", "refrigerantType", "seerRating", "ampsRating",
      "phaseType", "capacityInfo",
    ]);

    const raw = args.extractedData ?? {};
    const sanitized: Record<string, unknown> = {};

    for (const key of Object.keys(raw)) {
      const val = raw[key];
      if (val === undefined || val === null) continue;

      if (STRING_KEYS.has(key)) {
        // Schema expects strings — Claude sometimes returns numbers
        sanitized[key] = typeof val === "number" ? String(val) : val;
      } else if (key === "totalAmount") {
        const num = typeof val === "number" ? val : parseFloat(String(val));
        if (!Number.isNaN(num)) sanitized[key] = num;
      } else if (key === "lineItems" && Array.isArray(val)) {
        // Sanitize nested objects to only keep schema-valid fields
        sanitized[key] = val
          .filter((item: any) => item && typeof item === "object")
          .map((item: any) => ({
            description: String(item.description ?? ""),
            amount: typeof item.amount === "number" ? item.amount : 0,
          }));
      }
    }

    await ctx.db.patch(args.documentId, {
      extractedData: sanitized,
      parseStatus: args.parseStatus,
    });
  },
});

/**
 * Apply extracted data from a model plate scan to a system
 */
export const applyModelPlateData = mutation({
  args: {
    systemId: v.id("systems"),
    manufacturer: v.optional(v.string()),
    modelNumber: v.optional(v.string()),
    serialNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const system = await ctx.db.get(args.systemId);
    if (!system) throw new Error("System not found");

    const updates: any = {};
    if (args.manufacturer) updates.manufacturer = args.manufacturer;
    if (args.modelNumber) updates.modelNumber = args.modelNumber;
    if (args.serialNumber) updates.serialNumber = args.serialNumber;

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(args.systemId, updates);
    }

    return await ctx.db.get(args.systemId);
  },
});

/**
 * Get upload URL for a new document
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Get all documents for a service call
 */
export const getServiceCallDocuments = mutation({
  args: {
    serviceCallId: v.id("serviceCalls"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("serviceDocuments")
      .withIndex("by_serviceCall", (q) => q.eq("serviceCallId", args.serviceCallId))
      .collect();
  },
});

/**
 * Link extracted cost data to a service call and record for analytics
 */
export const linkCostToServiceCall = internalMutation({
  args: {
    serviceCallId: v.id("serviceCalls"),
    amount: v.number(),
    costType: v.union(v.literal("quoted"), v.literal("actual")),
    vendor: v.optional(v.string()),
    documentId: v.id("serviceDocuments"),
  },
  handler: async (ctx, args) => {
    // Get the service call
    const serviceCall = await ctx.db.get(args.serviceCallId);
    if (!serviceCall) {
      console.error("Service call not found:", args.serviceCallId);
      return;
    }

    // Update the service call with the cost
    const updateField = args.costType === "quoted" ? "quotedCost" : "actualCost";
    await ctx.db.patch(args.serviceCallId, {
      [updateField]: args.amount,
      ...(args.vendor && !serviceCall.companyName && { companyName: args.vendor }),
    });

    // Get home for regional context
    const home = await ctx.db.get(serviceCall.homeId);
    if (!home) return;

    // Get system type
    const system = await ctx.db.get(serviceCall.systemId);
    if (!system) return;

    // Record in cost history for ML/analytics
    await ctx.db.insert("costHistory", {
      homeId: serviceCall.homeId,
      systemId: serviceCall.systemId,
      systemTypeId: system.systemTypeId,
      serviceCallId: args.serviceCallId,
      documentId: args.documentId,
      costType: args.costType,
      amount: args.amount,
      wasDiy: serviceCall.wasDiy || false,
      vendor: args.vendor,
      description: `${serviceCall.serviceType} - ${system.name || "System"}`,
      serviceType: serviceCall.serviceType === "maintenance" 
        ? "maintenance" 
        : serviceCall.serviceType === "replacement" 
          ? "replacement" 
          : "repair",
      state: home.state || "Unknown",
      city: home.city,
      zipCode: home.zipCode,
      climateZone: home.climateZone,
      homeAge: home.yearBuilt ? new Date().getFullYear() - home.yearBuilt : undefined,
      homeSquareFootage: home.squareFootage,
      serviceDate: serviceCall.completedDate
        ? new Date(serviceCall.completedDate).getTime()
        : Date.now(),
      recordedAt: Date.now(),
    });

    console.log(`Linked ${args.costType} cost $${args.amount} to service call ${args.serviceCallId}`);
  },
});

/**
 * Log a scan correction for accuracy tracking
 */
export const logScanCorrection = mutation({
  args: {
    documentId: v.optional(v.id("serviceDocuments")),
    homeId: v.optional(v.id("homes")),
    systemId: v.optional(v.id("systems")),
    originalManufacturer: v.optional(v.string()),
    originalModel: v.optional(v.string()),
    originalSerial: v.optional(v.string()),
    originalDecodedYear: v.optional(v.number()),
    correctedManufacturer: v.optional(v.string()),
    correctedModel: v.optional(v.string()),
    correctedSerial: v.optional(v.string()),
    correctedYear: v.optional(v.number()),
    correctionType: v.string(),
    correctionNote: v.optional(v.string()),
    platePhotoStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!profile) throw new ConvexError("No profile");

    await ctx.db.insert("scanCorrections", {
      ...args,
      userId: profile._id,
      createdAt: Date.now(),
    });
  },
});
