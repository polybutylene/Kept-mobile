import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { DIAGNOSTICS_DB } from "./lib/diagnostics";

/**
 * Generate a random share token
 */
function generateShareToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 12; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Create a home packet
 */
export const createPacket = mutation({
  args: {
    homeId: v.id("homes"),
    title: v.string(),
    symptom: v.optional(v.string()),
    systemTypeId: v.optional(v.id("systemTypes")), // New field
    category: v.optional(v.string()), // To look up diagnostics
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

    if (!profile) {
      throw new Error("Profile not found for user");
    }
    
    if (home.ownerId !== profile._id) {
      console.log("Authorization mismatch:", { 
        homeOwnerId: home.ownerId, 
        profileId: profile._id 
      });
      throw new Error(`Not authorized - home owner mismatch`);
    }

    // Check limits
    const featureFlags = await ctx.db
      .query("featureFlags")
      .withIndex("by_tier", (q) => q.eq("tier", profile.tier))
      .first();

    const monthlyLimit = featureFlags?.monthlyPacketLimit ?? 1;

    // Calculate start of current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const homePackets = await ctx.db
      .query("homePackets")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .collect();

    const thisMonthPackets = homePackets.filter((p) => p._creationTime >= startOfMonth);

    if (thisMonthPackets.length >= monthlyLimit) {
      throw new Error(`Monthly packet limit reached (${monthlyLimit}/month). Subscribe to Kept. for unlimited packets.`);
    }

    // Gather packet data
    const systems = await ctx.db
      .query("systems")
      .withIndex("by_home_active", (q) =>
        q.eq("homeId", args.homeId).eq("isArchived", false)
      )
      .collect();

    const tasks = await ctx.db
      .query("scheduledMaintenance")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .collect();

    const overdueTasks = tasks.filter((t) => t.status === "overdue");
    const recentCompleted = tasks
      .filter((t) => t.status === "completed")
      .sort(
        (a, b) =>
          new Date(b.completedDate || 0).getTime() -
          new Date(a.completedDate || 0).getTime()
      )
      .slice(0, 10);

    // Enrich systems with type data
    const enrichedSystems = await Promise.all(
      systems.map(async (system) => {
        const systemType = await ctx.db.get(system.systemTypeId);
        return {
          name: system.name,
          category: systemType?.category,
          manufacturer: system.manufacturer,
          modelNumber: system.modelNumber,
          serialNumber: system.serialNumber,
          installDate: system.installDate,
          healthScore: system.healthScore,
          estimatedReplacementYear: system.estimatedReplacementYear,
        };
      })
    );

    // Fetch Diagnostic Data if available
    let diagnosticData = null;
    if (args.category && args.symptom) {
      const categoryDiagnostics = DIAGNOSTICS_DB[args.category] || [];
      // Simple fuzzy match or direct ID match logic could go here.
      // For now, exact match on symptom string ID or Title if passed
      // Ideally args.symptom is the ID from the selection UI
      const diagnostic = categoryDiagnostics.find(d => d.id === args.symptom || d.symptom === args.symptom);
      if (diagnostic) {
        diagnosticData = diagnostic;
      }
    }

    const packetData = {
      homeInfo: {
        address: `${home.addressLine1}${home.addressLine2 ? `, ${home.addressLine2}` : ""}`,
        city: home.city,
        state: home.state,
        zipCode: home.zipCode,
        yearBuilt: home.yearBuilt,
        squareFootage: home.squareFootage,
        overallHealthScore: home.overallHealthScore,
      },
      symptom: args.symptom,
      diagnosticData, // Add diagnostics to packet data
      systems: enrichedSystems,
      overdueTasks: overdueTasks.map((t) => ({
        name: t.name,
        dueDate: t.dueDate,
        priority: t.priority,
      })),
      recentMaintenance: recentCompleted.map((t) => ({
        name: t.name,
        completedDate: t.completedDate,
        wasDiy: t.wasDiy,
      })),
      generatedAt: Date.now(),
    };

    const packetId = await ctx.db.insert("homePackets", {
      homeId: args.homeId,
      createdBy: profile._id,
      title: args.title,
      symptom: args.symptom,
      systemTypeId: args.systemTypeId,
      packetData,
      isShared: false,
      viewsCount: 0,
    });

    return packetId;
  },
});

/**
 * Get available diagnostics for a category
 */
export const getDiagnostics = query({
  args: {
    category: v.string(),
  },
  handler: async (ctx, args) => {
    // This is public/static data, no auth needed technically, but good practice
    return DIAGNOSTICS_DB[args.category] || [];
  },
});

/**
 * Get packets for a home
 */
export const getHomePackets = query({
  args: {
    homeId: v.id("homes"),
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

    return await ctx.db
      .query("homePackets")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .order("desc")
      .collect();
  },
});

/**
 * Get a single packet
 */
export const getPacket = query({
  args: {
    packetId: v.id("homePackets"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const packet = await ctx.db.get(args.packetId);
    if (!packet) return null;

    const home = await ctx.db.get(packet.homeId);
    if (!home) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) return null;

    return packet;
  },
});

/**
 * Share a packet (generate share token)
 */
export const sharePacket = mutation({
  args: {
    packetId: v.id("homePackets"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const packet = await ctx.db.get(args.packetId);
    if (!packet) throw new Error("Packet not found");

    const home = await ctx.db.get(packet.homeId);
    if (!home) throw new Error("Home not found");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) {
      throw new Error("Not authorized");
    }

    // Check feature flags
    const featureFlags = await ctx.db
      .query("featureFlags")
      .withIndex("by_tier", (q) => q.eq("tier", profile.tier))
      .first();

    if (!featureFlags?.canSharePackets) {
      throw new Error("Subscribe to Kept. to share packets");
    }

    const shareToken = generateShareToken();

    await ctx.db.patch(args.packetId, {
      shareToken,
      isShared: true,
      sharedAt: Date.now(),
    });

    return shareToken;
  },
});

/**
 * Get shared packet by token (public - no auth required)
 */
export const getSharedPacket = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const packet = await ctx.db
      .query("homePackets")
      .withIndex("by_shareToken", (q) => q.eq("shareToken", args.token))
      .first();

    if (!packet || !packet.isShared) return null;

    // Increment view count (would need a mutation for this)
    return {
      title: packet.title,
      symptom: packet.symptom,
      packetData: packet.packetData,
      sharedAt: packet.sharedAt,
    };
  },
});

/**
 * Increment packet view count
 */
export const incrementPacketViews = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const packet = await ctx.db
      .query("homePackets")
      .withIndex("by_shareToken", (q) => q.eq("shareToken", args.token))
      .first();

    if (!packet || !packet.isShared) return false;

    await ctx.db.patch(packet._id, {
      viewsCount: packet.viewsCount + 1,
    });

    return true;
  },
});

/**
 * Unshare a packet
 */
export const unsharePacket = mutation({
  args: {
    packetId: v.id("homePackets"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const packet = await ctx.db.get(args.packetId);
    if (!packet) throw new Error("Packet not found");

    const home = await ctx.db.get(packet.homeId);
    if (!home) throw new Error("Home not found");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.packetId, {
      shareToken: undefined,
      isShared: false,
    });

    return true;
  },
});

/**
 * Delete a packet
 */
export const deletePacket = mutation({
  args: {
    packetId: v.id("homePackets"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const packet = await ctx.db.get(args.packetId);
    if (!packet) throw new Error("Packet not found");

    const home = await ctx.db.get(packet.homeId);
    if (!home) throw new Error("Home not found");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(args.packetId);

    return true;
  },
});
