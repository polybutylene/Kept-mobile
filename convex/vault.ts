/**
 * Document & Image Vault — client-facing mutations and queries.
 *
 * Vault items are scoped to authenticated users and their homes.
 * Files are stored in Convex _storage with CDN-backed URLs.
 */

import { query, mutation, action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// ════════════════════════════════════════════════════════════════════
// VALIDATORS (reused across mutations)
// ════════════════════════════════════════════════════════════════════

const vaultTypeValidator = v.union(
  v.literal("photo"),
  v.literal("document"),
  v.literal("receipt"),
  v.literal("warranty"),
  v.literal("inspection_report"),
  v.literal("permit"),
  v.literal("manual"),
  v.literal("insurance"),
  v.literal("other")
);

// ════════════════════════════════════════════════════════════════════
// FILE UPLOAD URL GENERATION
// ════════════════════════════════════════════════════════════════════

/** Generate an upload URL for the client to upload a file directly to Convex storage. */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

// ════════════════════════════════════════════════════════════════════
// MUTATIONS
// ════════════════════════════════════════════════════════════════════

/** Upload (register) a vault item after the file has been uploaded to storage. */
export const upload = mutation({
  args: {
    homeId: v.id("homes"),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    type: vaultTypeValidator,
    title: v.string(),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    systemId: v.optional(v.id("systems")),
    capturedAt: v.optional(v.string()),
    imageMetadata: v.optional(v.object({
      width: v.optional(v.number()),
      height: v.optional(v.number()),
      exifDate: v.optional(v.string()),
      location: v.optional(v.object({
        latitude: v.number(),
        longitude: v.number(),
      })),
    })),
    financialMetadata: v.optional(v.object({
      amount: v.optional(v.number()),
      vendor: v.optional(v.string()),
      purchaseDate: v.optional(v.string()),
      warrantyExpiration: v.optional(v.string()),
    })),
    documentMetadata: v.optional(v.object({
      pageCount: v.optional(v.number()),
      expirationDate: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) throw new Error("User not found");

    // Verify user owns this home
    const home = await ctx.db.get(args.homeId);
    if (!home || home.userId !== user._id) throw new Error("Home not found or access denied");

    // Verify system belongs to home if provided
    if (args.systemId) {
      const system = await ctx.db.get(args.systemId);
      if (!system || system.homeId !== args.homeId) {
        throw new Error("System not found or doesn't belong to this home");
      }
    }

    // Enforce file size limits
    const isImage = args.fileType.startsWith("image/");
    const maxSize = isImage ? 25 * 1024 * 1024 : 50 * 1024 * 1024; // 25MB images, 50MB docs
    if (args.fileSize > maxSize) {
      throw new Error(`File too large. Maximum ${isImage ? "25MB" : "50MB"} allowed.`);
    }

    const now = new Date().toISOString();

    const itemId = await ctx.db.insert("vaultItems", {
      homeId: args.homeId,
      userId: user._id,
      type: args.type,
      systemId: args.systemId,
      title: args.title,
      description: args.description,
      tags: args.tags,
      storageId: args.storageId,
      fileName: args.fileName,
      fileType: args.fileType,
      fileSize: args.fileSize,
      imageMetadata: args.imageMetadata ? { ...args.imageMetadata } : undefined,
      financialMetadata: args.financialMetadata,
      documentMetadata: args.documentMetadata
        ? { ...args.documentMetadata }
        : undefined,
      capturedAt: args.capturedAt ?? now,
      uploadedAt: now,
      isArchived: false,
      isFavorite: false,
    });

    // Schedule thumbnail generation for images
    if (isImage) {
      await ctx.scheduler.runAfter(0, internal.vault.generateThumbnailInternal, {
        vaultItemId: itemId,
        storageId: args.storageId,
      });
    }

    return itemId;
  },
});

/** Batch upload — register multiple vault items at once (gallery import). */
export const batchUpload = mutation({
  args: {
    homeId: v.id("homes"),
    items: v.array(v.object({
      storageId: v.id("_storage"),
      fileName: v.string(),
      fileType: v.string(),
      fileSize: v.number(),
      type: vaultTypeValidator,
      title: v.string(),
      systemId: v.optional(v.id("systems")),
      capturedAt: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) throw new Error("User not found");

    const home = await ctx.db.get(args.homeId);
    if (!home || home.userId !== user._id) throw new Error("Access denied");

    const now = new Date().toISOString();
    const itemIds: string[] = [];

    for (const item of args.items) {
      const id = await ctx.db.insert("vaultItems", {
        homeId: args.homeId,
        userId: user._id,
        type: item.type,
        systemId: item.systemId,
        title: item.title,
        storageId: item.storageId,
        fileName: item.fileName,
        fileType: item.fileType,
        fileSize: item.fileSize,
        capturedAt: item.capturedAt ?? now,
        uploadedAt: now,
        isArchived: false,
        isFavorite: false,
      });
      itemIds.push(id);

      // Schedule thumbnail for images
      if (item.fileType.startsWith("image/")) {
        await ctx.scheduler.runAfter(0, internal.vault.generateThumbnailInternal, {
          vaultItemId: id,
          storageId: item.storageId,
        });
      }
    }

    return itemIds;
  },
});

/** Update vault item metadata. */
export const updateItem = mutation({
  args: {
    vaultItemId: v.id("vaultItems"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    type: v.optional(vaultTypeValidator),
    systemId: v.optional(v.id("systems")),
    capturedAt: v.optional(v.string()),
    financialMetadata: v.optional(v.object({
      amount: v.optional(v.number()),
      vendor: v.optional(v.string()),
      purchaseDate: v.optional(v.string()),
      warrantyExpiration: v.optional(v.string()),
    })),
    documentMetadata: v.optional(v.object({
      pageCount: v.optional(v.number()),
      expirationDate: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const item = await ctx.db.get(args.vaultItemId);
    if (!item) throw new Error("Item not found");

    // Verify ownership
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user || item.userId !== user._id) throw new Error("Access denied");

    const updates: Record<string, unknown> = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.tags !== undefined) updates.tags = args.tags;
    if (args.type !== undefined) updates.type = args.type;
    if (args.systemId !== undefined) updates.systemId = args.systemId;
    if (args.capturedAt !== undefined) updates.capturedAt = args.capturedAt;
    if (args.financialMetadata !== undefined) updates.financialMetadata = args.financialMetadata;
    if (args.documentMetadata !== undefined) updates.documentMetadata = args.documentMetadata;

    await ctx.db.patch(args.vaultItemId, updates);
  },
});

/** Archive (soft delete) a vault item. */
export const archiveItem = mutation({
  args: { vaultItemId: v.id("vaultItems") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const item = await ctx.db.get(args.vaultItemId);
    if (!item) throw new Error("Item not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user || item.userId !== user._id) throw new Error("Access denied");

    await ctx.db.patch(args.vaultItemId, { isArchived: true });
  },
});

/** Toggle favorite status on a vault item. */
export const toggleFavorite = mutation({
  args: { vaultItemId: v.id("vaultItems") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const item = await ctx.db.get(args.vaultItemId);
    if (!item) throw new Error("Item not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user || item.userId !== user._id) throw new Error("Access denied");

    await ctx.db.patch(args.vaultItemId, { isFavorite: !item.isFavorite });
  },
});

/** Link an existing vault item to a system (or unlink by passing undefined). */
export const linkToSystem = mutation({
  args: {
    vaultItemId: v.id("vaultItems"),
    systemId: v.optional(v.id("systems")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const item = await ctx.db.get(args.vaultItemId);
    if (!item) throw new Error("Item not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user || item.userId !== user._id) throw new Error("Access denied");

    // Verify system belongs to the same home
    if (args.systemId) {
      const system = await ctx.db.get(args.systemId);
      if (!system || system.homeId !== item.homeId) {
        throw new Error("System not found or doesn't belong to this home");
      }
    }

    await ctx.db.patch(args.vaultItemId, { systemId: args.systemId });
  },
});

/** Request AI analysis (FUTURE — stubbed). */
export const requestAnalysis = mutation({
  args: {
    vaultItemId: v.id("vaultItems"),
    analysisType: v.union(v.literal("condition_grade"), v.literal("code_compliance")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) throw new Error("User not found");

    const item = await ctx.db.get(args.vaultItemId);
    if (!item || item.userId !== user._id) throw new Error("Access denied");

    if (!item.fileType.startsWith("image/")) {
      throw new Error("AI analysis is only available for images");
    }

    const logId = await ctx.db.insert("vaultAnalysisLog", {
      vaultItemId: args.vaultItemId,
      userId: user._id,
      analysisType: args.analysisType,
      status: "pending",
      requestedAt: new Date().toISOString(),
    });

    // FUTURE: Schedule the actual AI analysis action here
    // await ctx.scheduler.runAfter(0, internal.vault.analyzeConditionInternal, { ... });

    return logId;
  },
});

// ════════════════════════════════════════════════════════════════════
// QUERIES
// ════════════════════════════════════════════════════════════════════

/** Get all vault items for a home with optional filtering. */
export const getByHome = query({
  args: {
    homeId: v.id("homes"),
    type: v.optional(v.string()),
    systemId: v.optional(v.id("systems")),
    favoritesOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    let items;

    if (args.favoritesOnly) {
      items = await ctx.db
        .query("vaultItems")
        .withIndex("by_home_favorites", (q) =>
          q.eq("homeId", args.homeId).eq("isFavorite", true).eq("isArchived", false)
        )
        .collect();
    } else if (args.systemId) {
      items = await ctx.db
        .query("vaultItems")
        .withIndex("by_system", (q) =>
          q.eq("systemId", args.systemId).eq("isArchived", false)
        )
        .collect();
    } else if (args.type) {
      items = await ctx.db
        .query("vaultItems")
        .withIndex("by_type", (q) =>
          q.eq("homeId", args.homeId).eq("type", args.type as any).eq("isArchived", false)
        )
        .collect();
    } else {
      items = await ctx.db
        .query("vaultItems")
        .withIndex("by_home", (q) =>
          q.eq("homeId", args.homeId).eq("isArchived", false)
        )
        .collect();
    }

    // Resolve storage URLs and system names
    const resolved = await Promise.all(
      items.map(async (item) => {
        const fileUrl = await ctx.storage.getUrl(item.storageId);
        const thumbnailUrl = item.imageMetadata?.thumbnailStorageId
          ? await ctx.storage.getUrl(item.imageMetadata.thumbnailStorageId)
          : null;

        let systemName: string | null = null;
        if (item.systemId) {
          const system = await ctx.db.get(item.systemId);
          systemName = system?.name ?? null;
        }

        return {
          ...item,
          fileUrl,
          thumbnailUrl,
          systemName,
        };
      })
    );

    // Sort by capturedAt descending
    return resolved.sort(
      (a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()
    );
  },
});

/** Get vault items for a specific system. Used by SystemDetailView and agent context. */
export const getBySystem = query({
  args: { systemId: v.id("systems") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const items = await ctx.db
      .query("vaultItems")
      .withIndex("by_system", (q) =>
        q.eq("systemId", args.systemId).eq("isArchived", false)
      )
      .collect();

    return await Promise.all(
      items.map(async (item) => ({
        ...item,
        fileUrl: await ctx.storage.getUrl(item.storageId),
        thumbnailUrl: item.imageMetadata?.thumbnailStorageId
          ? await ctx.storage.getUrl(item.imageMetadata.thumbnailStorageId)
          : null,
      }))
    );
  },
});

/** Search vault items by title. */
export const search = query({
  args: {
    homeId: v.id("homes"),
    searchQuery: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const results = await ctx.db
      .query("vaultItems")
      .withSearchIndex("search_vault", (q) =>
        q.search("title", args.searchQuery)
          .eq("homeId", args.homeId)
          .eq("isArchived", false)
      )
      .take(50);

    return await Promise.all(
      results.map(async (item) => ({
        ...item,
        fileUrl: await ctx.storage.getUrl(item.storageId),
        thumbnailUrl: item.imageMetadata?.thumbnailStorageId
          ? await ctx.storage.getUrl(item.imageMetadata.thumbnailStorageId)
          : null,
      }))
    );
  },
});

/** Get items with expiring warranties or documents. */
export const getExpiring = query({
  args: {
    homeId: v.id("homes"),
    withinDays: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // Get all warranty and permit items for this home
    const warranties = await ctx.db
      .query("vaultItems")
      .withIndex("by_type", (q) =>
        q.eq("homeId", args.homeId).eq("type", "warranty").eq("isArchived", false)
      )
      .collect();

    const permits = await ctx.db
      .query("vaultItems")
      .withIndex("by_type", (q) =>
        q.eq("homeId", args.homeId).eq("type", "permit").eq("isArchived", false)
      )
      .collect();

    const insurance = await ctx.db
      .query("vaultItems")
      .withIndex("by_type", (q) =>
        q.eq("homeId", args.homeId).eq("type", "insurance").eq("isArchived", false)
      )
      .collect();

    const allItems = [...warranties, ...permits, ...insurance];
    const cutoffDate = new Date(Date.now() + args.withinDays * 24 * 60 * 60 * 1000);
    const now = new Date();

    return allItems.filter((item) => {
      const expDate =
        item.financialMetadata?.warrantyExpiration ??
        item.documentMetadata?.expirationDate;
      if (!expDate) return false;
      const exp = new Date(expDate);
      return exp > now && exp <= cutoffDate;
    });
  },
});

/** Get vault stats for a home. */
export const getStats = query({
  args: { homeId: v.id("homes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const items = await ctx.db
      .query("vaultItems")
      .withIndex("by_home", (q) =>
        q.eq("homeId", args.homeId).eq("isArchived", false)
      )
      .collect();

    const countByType: Record<string, number> = {};
    let totalSize = 0;

    for (const item of items) {
      countByType[item.type] = (countByType[item.type] ?? 0) + 1;
      totalSize += item.fileSize;
    }

    return {
      totalItems: items.length,
      totalSize,
      countByType,
      favoriteCount: items.filter((i) => i.isFavorite).length,
    };
  },
});

/** Get a single vault item by ID with resolved URLs. */
export const getItem = query({
  args: { vaultItemId: v.id("vaultItems") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const item = await ctx.db.get(args.vaultItemId);
    if (!item || item.isArchived) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user || item.userId !== user._id) return null;

    const fileUrl = await ctx.storage.getUrl(item.storageId);
    const thumbnailUrl = item.imageMetadata?.thumbnailStorageId
      ? await ctx.storage.getUrl(item.imageMetadata.thumbnailStorageId)
      : null;

    let systemName: string | null = null;
    if (item.systemId) {
      const system = await ctx.db.get(item.systemId);
      systemName = system?.name ?? null;
    }

    return { ...item, fileUrl, thumbnailUrl, systemName };
  },
});

// ════════════════════════════════════════════════════════════════════
// INTERNAL MUTATIONS (called by scheduled actions)
// ════════════════════════════════════════════════════════════════════

/** Update thumbnail storage ID after generation. */
export const updateThumbnail = internalMutation({
  args: {
    vaultItemId: v.id("vaultItems"),
    thumbnailStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.vaultItemId);
    if (!item) return;

    await ctx.db.patch(args.vaultItemId, {
      imageMetadata: {
        ...(item.imageMetadata ?? {}),
        thumbnailStorageId: args.thumbnailStorageId,
      },
    });
  },
});

/** Store extracted text from document processing. */
export const updateExtractedText = internalMutation({
  args: {
    vaultItemId: v.id("vaultItems"),
    extractedText: v.string(),
    pageCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.vaultItemId);
    if (!item) return;

    await ctx.db.patch(args.vaultItemId, {
      documentMetadata: {
        ...(item.documentMetadata ?? {}),
        extractedText: args.extractedText,
        pageCount: args.pageCount,
      },
    });
  },
});

// ════════════════════════════════════════════════════════════════════
// ACTIONS (async processing)
// ════════════════════════════════════════════════════════════════════

/**
 * Generate a thumbnail for an uploaded image.
 * Uses sharp-like processing (Convex Node.js action).
 *
 * Note: In production, this would use the `sharp` library to resize.
 * For now, we store a reference that the client can use with Convex's
 * image transformation URL parameters.
 */
export const generateThumbnailInternal = action({
  args: {
    vaultItemId: v.id("vaultItems"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    // For the MVP, we rely on client-side thumbnail display using the
    // full image URL. Convex storage URLs can be consumed with resize
    // parameters by the iOS client using AsyncImage.
    //
    // Full implementation with sharp would:
    // 1. Fetch the blob: const blob = await ctx.storage.get(args.storageId)
    // 2. Resize to 300px wide: await sharp(buffer).resize(300).jpeg().toBuffer()
    // 3. Upload thumbnail: const thumbnailId = await ctx.storage.store(resized)
    // 4. Update the vault item: await ctx.runMutation(internal.vault.updateThumbnail, ...)
    //
    // For now, skip actual processing and let the client handle thumbnail sizing.
    // This action placeholder ensures the architecture is ready.
    console.log(`Thumbnail generation placeholder for vault item: ${args.vaultItemId}`);
  },
});
