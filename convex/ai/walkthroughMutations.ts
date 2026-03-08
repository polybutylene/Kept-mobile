/**
 * Walkthrough Internal Mutations
 *
 * Manage walkthrough session state — called by walkthrough actions.
 */

import { mutation, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Create a new walkthrough session (client-facing)
 */
export const createSession = mutation({
  args: {
    homeId: v.id("homes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!profile) throw new Error("Profile not found");

    return await ctx.db.insert("walkthroughSessions", {
      homeId: args.homeId,
      userId: profile._id,
      status: "in_progress",
      completedAreas: [],
      startedAt: Date.now(),
    });
  },
});

/**
 * Add detected systems from a photo analysis (internal — called by action)
 */
export const addDetections = internalMutation({
  args: {
    sessionId: v.id("walkthroughSessions"),
    area: v.string(),
    detections: v.array(
      v.object({
        systemType: v.string(),
        name: v.string(),
        confidence: v.number(),
        details: v.optional(v.any()),
        confirmed: v.boolean(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    const existingAreas = session.completedAreas ?? [];

    // Find existing area entry or create new one
    const areaIndex = existingAreas.findIndex((a) => a.area === args.area);

    if (areaIndex >= 0) {
      // Update existing area — merge detections
      const existing = existingAreas[areaIndex];
      existingAreas[areaIndex] = {
        ...existing,
        photosAnalyzed: existing.photosAnalyzed + 1,
        systemsDetected: [
          ...existing.systemsDetected,
          ...args.detections,
        ],
      };
    } else {
      // New area
      existingAreas.push({
        area: args.area,
        photosAnalyzed: 1,
        systemsDetected: args.detections,
      });
    }

    await ctx.db.patch(args.sessionId, {
      completedAreas: existingAreas,
    });
  },
});

/**
 * Confirm a detected system (client-facing — marks detection as confirmed)
 */
export const confirmDetection = mutation({
  args: {
    sessionId: v.id("walkthroughSessions"),
    area: v.string(),
    detectionIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    const areas = session.completedAreas ?? [];
    const areaEntry = areas.find((a) => a.area === args.area);
    if (!areaEntry) throw new Error("Area not found");

    if (args.detectionIndex >= areaEntry.systemsDetected.length) {
      throw new Error("Detection index out of bounds");
    }

    areaEntry.systemsDetected[args.detectionIndex].confirmed = true;

    await ctx.db.patch(args.sessionId, { completedAreas: areas });
  },
});

/**
 * Reject a detected system (client-facing — removes it from the list)
 */
export const rejectDetection = mutation({
  args: {
    sessionId: v.id("walkthroughSessions"),
    area: v.string(),
    detectionIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    const areas = session.completedAreas ?? [];
    const areaEntry = areas.find((a) => a.area === args.area);
    if (!areaEntry) throw new Error("Area not found");

    areaEntry.systemsDetected.splice(args.detectionIndex, 1);

    await ctx.db.patch(args.sessionId, { completedAreas: areas });
  },
});

/**
 * Complete the walkthrough session (client-facing)
 */
export const completeSession = mutation({
  args: {
    sessionId: v.id("walkthroughSessions"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(args.sessionId, {
      status: "completed" as const,
      completedAt: Date.now(),
    });
  },
});
