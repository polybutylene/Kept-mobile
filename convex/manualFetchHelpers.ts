import { v } from "convex/values";
import { query, internalQuery, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

function normalizeKey(manufacturer: string, modelNumber: string): string {
  return (manufacturer + "::" + modelNumber)
    .toLowerCase()
    .replace(/[\s\-_\/\\]+/g, "");
}

// ============================================================
// PUBLIC: Query manual status (real-time UI subscription)
// ============================================================

export const getManualForSystem = query({
  args: { systemId: v.id("systems") },
  handler: async (ctx, args) => {
    const system = await ctx.db.get(args.systemId);
    if (!system || !system.manufacturer || !system.modelNumber) return null;

    const key = normalizeKey(system.manufacturer, system.modelNumber);
    const cached = await ctx.db
      .query("manualCache")
      .withIndex("by_normalizedKey", (q) => q.eq("normalizedKey", key))
      .first();

    if (!cached) return null;

    return {
      _id: cached._id,
      title: cached.title,
      sourceUrl: cached.sourceUrl,
      fetchStatus: cached.fetchStatus,
      fetchError: cached.fetchError,
      storageId: cached.storageId,
      vaultDocumentId: cached.vaultDocumentId,
      fileSize: cached.fileSize,
    };
  },
});

// ============================================================
// INTERNAL: Cache queries & mutations
// ============================================================

export const getCachedManualQuery = internalQuery({
  args: { normalizedKey: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("manualCache")
      .withIndex("by_normalizedKey", (q) =>
        q.eq("normalizedKey", args.normalizedKey)
      )
      .first();
  },
});

export const createCacheEntry = internalMutation({
  args: {
    manufacturer: v.string(),
    modelNumber: v.string(),
    normalizedKey: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("manualCache")
      .withIndex("by_normalizedKey", (q) =>
        q.eq("normalizedKey", args.normalizedKey)
      )
      .first();
    if (existing) return existing._id;

    return await ctx.db.insert("manualCache", {
      manufacturer: args.manufacturer,
      modelNumber: args.modelNumber,
      normalizedKey: args.normalizedKey,
      title: args.manufacturer + " " + args.modelNumber + " Manual",
      sourceUrl: "",
      fetchStatus: "searching",
      createdAt: Date.now(),
    });
  },
});

export const touchCache = internalMutation({
  args: { cacheId: v.id("manualCache") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.cacheId, { lastAccessedAt: Date.now() });
  },
});

export const updateCacheStatus = internalMutation({
  args: {
    cacheId: v.id("manualCache"),
    fetchStatus: v.union(
      v.literal("searching"),
      v.literal("downloading"),
      v.literal("stored"),
      v.literal("parsed"),
      v.literal("failed")
    ),
    sourceUrl: v.optional(v.string()),
    title: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    vaultDocumentId: v.optional(v.id("vaultDocuments")),
    fileSize: v.optional(v.number()),
    fetchError: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { cacheId, ...updates } = args;
    const clean: Record<string, any> = {};
    for (const [k, val] of Object.entries(updates)) {
      if (val !== undefined) clean[k] = val;
    }
    await ctx.db.patch(cacheId, clean);
  },
});

export const linkDocumentToSystem = internalMutation({
  args: {
    vaultDocumentId: v.id("vaultDocuments"),
    systemId: v.id("systems"),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.vaultDocumentId);
    if (doc && !doc.linkedSystemId) {
      await ctx.db.patch(args.vaultDocumentId, {
        linkedSystemId: args.systemId,
      });
    }
  },
});

export const createVaultDocumentInternal = internalMutation({
  args: {
    homeId: v.id("homes"),
    uploadedBy: v.id("userProfiles"),
    title: v.string(),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileSize: v.optional(v.number()),
    linkedSystemId: v.optional(v.id("systems")),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const documentId = await ctx.db.insert("vaultDocuments", {
      homeId: args.homeId,
      uploadedBy: args.uploadedBy,
      title: args.title,
      docType: "manual" as any,
      storageId: args.storageId,
      fileName: args.fileName,
      fileSize: args.fileSize,
      mimeType: "application/pdf",
      category: args.category as any,
      linkedSystemId: args.linkedSystemId,
      parseStatus: "pending" as any,
      uploadedAt: Date.now(),
      reviewNeeded: false,
    });

    await ctx.scheduler.runAfter(0, internal.vaultParsing.parseDocument, {
      documentId,
    });

    return documentId;
  },
});

export const getSystemOwnerInfo = internalQuery({
  args: { systemId: v.id("systems") },
  handler: async (ctx, args) => {
    const system = await ctx.db.get(args.systemId);
    if (!system) return null;

    const home = await ctx.db.get(system.homeId);
    if (!home) return null;

    const systemType = await ctx.db.get(system.systemTypeId);

    return {
      homeId: system.homeId,
      profileId: home.ownerId,
      category: systemType?.category,
    };
  },
});
