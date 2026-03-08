import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { noticeType, noticeTargetType, deliveryChannel } from "./schema";
import { internal } from "./_generated/api";

/**
 * Create a new notice (PM only)
 */
export const createNotice = mutation({
  args: {
    title: v.string(),
    body: v.string(),
    noticeType: noticeType,
    targetType: noticeTargetType,
    targetIds: v.array(v.string()),
    deliveryChannels: v.array(deliveryChannel),
    scheduledFor: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || profile.tier !== "property_manager") {
      throw new Error("Only property managers can create notices");
    }

    // Calculate total recipients based on target type
    let totalRecipients = 0;

    if (args.targetType === "all") {
      // All active managed members
      const members = await ctx.db
        .query("managedMembers")
        .withIndex("by_manager_status", (q) =>
          q.eq("managerId", profile._id).eq("status", "active")
        )
        .collect();
      totalRecipients = members.length;
    } else if (args.targetType === "property_group") {
      // Members in homes with matching property groups
      const homes = await ctx.db
        .query("homes")
        .withIndex("by_owner", (q) => q.eq("ownerId", profile._id))
        .collect();
      
      const matchingHomeIds = homes
        .filter((h) => args.targetIds.includes(h.propertyGroup || ""))
        .map((h) => h._id);

      for (const homeId of matchingHomeIds) {
        const members = await ctx.db
          .query("managedMembers")
          .withIndex("by_home", (q) => q.eq("homeId", homeId))
          .filter((q) => q.eq(q.field("status"), "active"))
          .collect();
        totalRecipients += members.length;
      }
    } else if (args.targetType === "property") {
      // Members in specific properties
      for (const homeId of args.targetIds) {
        const members = await ctx.db
          .query("managedMembers")
          .withIndex("by_home", (q) => q.eq("homeId", homeId as any))
          .filter((q) => q.eq(q.field("status"), "active"))
          .collect();
        totalRecipients += members.length;
      }
    } else if (args.targetType === "individual") {
      totalRecipients = args.targetIds.length;
    }

    const noticeId = await ctx.db.insert("serviceNotices", {
      managerId: profile._id,
      title: args.title,
      body: args.body,
      noticeType: args.noticeType,
      targetType: args.targetType,
      targetIds: args.targetIds,
      deliveryChannels: args.deliveryChannels,
      scheduledFor: args.scheduledFor,
      totalRecipients,
      deliveredCount: 0,
    });

    // If not scheduled, send immediately
    if (!args.scheduledFor) {
      await ctx.scheduler.runAfter(0, internal.notices.processNotice, { noticeId });
    }

    return { noticeId, totalRecipients };
  },
});

/**
 * Internal: Process and send a notice to all recipients
 */
export const processNotice = internalMutation({
  args: {
    noticeId: v.id("serviceNotices"),
  },
  handler: async (ctx, args) => {
    const notice = await ctx.db.get(args.noticeId);
    if (!notice) return;

    // Mark as sent
    await ctx.db.patch(args.noticeId, { sentAt: Date.now() });

    // Get recipient member IDs based on target type
    const recipientMemberIds: string[] = [];

    if (notice.targetType === "all") {
      const members = await ctx.db
        .query("managedMembers")
        .withIndex("by_manager_status", (q) =>
          q.eq("managerId", notice.managerId).eq("status", "active")
        )
        .collect();
      recipientMemberIds.push(...members.map((m) => m.memberId));
    } else if (notice.targetType === "property_group") {
      const homes = await ctx.db
        .query("homes")
        .withIndex("by_owner", (q) => q.eq("ownerId", notice.managerId))
        .collect();

      const matchingHomeIds = homes
        .filter((h) => notice.targetIds.includes(h.propertyGroup || ""))
        .map((h) => h._id);

      for (const homeId of matchingHomeIds) {
        const members = await ctx.db
          .query("managedMembers")
          .withIndex("by_home", (q) => q.eq("homeId", homeId))
          .filter((q) => q.eq(q.field("status"), "active"))
          .collect();
        recipientMemberIds.push(...members.map((m) => m.memberId));
      }
    } else if (notice.targetType === "property") {
      for (const homeId of notice.targetIds) {
        const members = await ctx.db
          .query("managedMembers")
          .withIndex("by_home", (q) => q.eq("homeId", homeId as any))
          .filter((q) => q.eq(q.field("status"), "active"))
          .collect();
        recipientMemberIds.push(...members.map((m) => m.memberId));
      }
    } else if (notice.targetType === "individual") {
      recipientMemberIds.push(...(notice.targetIds as string[]));
    }

    // Create delivery records for each recipient and channel
    let deliveredCount = 0;
    for (const recipientId of recipientMemberIds) {
      for (const channel of notice.deliveryChannels) {
        await ctx.db.insert("notificationDeliveries", {
          noticeId: args.noticeId,
          recipientId: recipientId as any,
          channel,
          status: channel === "in_app" ? "delivered" : "pending",
          deliveredAt: channel === "in_app" ? Date.now() : undefined,
        });

        if (channel === "in_app") {
          deliveredCount++;
        }
      }
    }

    await ctx.db.patch(args.noticeId, { deliveredCount });

    // Schedule email/SMS delivery via external actions
    // (These would be implemented in notifications.ts with Resend/Twilio)
  },
});

/**
 * Get all notices for a PM
 */
export const getNoticesForManager = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || profile.tier !== "property_manager") return [];

    const notices = await ctx.db
      .query("serviceNotices")
      .withIndex("by_manager", (q) => q.eq("managerId", profile._id))
      .collect();

    return notices.sort((a, b) => b._creationTime - a._creationTime);
  },
});

/**
 * Get notices for a resident (their inbox)
 */
export const getNoticesForResident = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile) return [];

    // Get all delivery records for this user
    const deliveries = await ctx.db
      .query("notificationDeliveries")
      .withIndex("by_recipient", (q) => q.eq("recipientId", profile._id))
      .collect();

    // Get unique notice IDs
    const noticeIds = [...new Set(deliveries.map((d) => d.noticeId))];

    // Fetch and enrich notices
    const notices = await Promise.all(
      noticeIds.map(async (noticeId) => {
        const notice = await ctx.db.get(noticeId);
        if (!notice) return null;

        const delivery = deliveries.find(
          (d) => d.noticeId === noticeId && d.channel === "in_app"
        );
        const manager = await ctx.db.get(notice.managerId);

        return {
          ...notice,
          isRead: !!delivery?.readAt,
          readAt: delivery?.readAt,
          managerName: manager?.fullName || manager?.email || "Property Manager",
        };
      })
    );

    return notices
      .filter((n) => n !== null)
      .sort((a, b) => (b?.sentAt || 0) - (a?.sentAt || 0));
  },
});

/**
 * Get unread notice count for a resident
 */
export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile) return 0;

    const unreadDeliveries = await ctx.db
      .query("notificationDeliveries")
      .withIndex("by_recipient_unread", (q) =>
        q.eq("recipientId", profile._id).eq("readAt", undefined)
      )
      .filter((q) => q.eq(q.field("channel"), "in_app"))
      .collect();

    return unreadDeliveries.length;
  },
});

/**
 * Mark a notice as read
 */
export const markNoticeRead = mutation({
  args: {
    noticeId: v.id("serviceNotices"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile) throw new Error("Profile not found");

    // Find the in-app delivery for this user and notice
    const delivery = await ctx.db
      .query("notificationDeliveries")
      .withIndex("by_notice", (q) => q.eq("noticeId", args.noticeId))
      .filter((q) =>
        q.and(
          q.eq(q.field("recipientId"), profile._id),
          q.eq(q.field("channel"), "in_app")
        )
      )
      .first();

    if (delivery && !delivery.readAt) {
      await ctx.db.patch(delivery._id, { readAt: Date.now() });
    }

    return { success: true };
  },
});

/**
 * Delete a notice (PM only, only if not sent)
 */
export const deleteNotice = mutation({
  args: {
    noticeId: v.id("serviceNotices"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile) throw new Error("Profile not found");

    const notice = await ctx.db.get(args.noticeId);
    if (!notice) throw new Error("Notice not found");
    if (notice.managerId !== profile._id) throw new Error("Access denied");
    if (notice.sentAt) throw new Error("Cannot delete a sent notice");

    await ctx.db.delete(args.noticeId);
    return { success: true };
  },
});

/**
 * Get property groups for targeting dropdown
 */
export const getPropertyGroups = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || profile.tier !== "property_manager") return [];

    const homes = await ctx.db
      .query("homes")
      .withIndex("by_owner", (q) => q.eq("ownerId", profile._id))
      .collect();

    const groups = new Set<string>();
    for (const home of homes) {
      if (home.propertyGroup) {
        groups.add(home.propertyGroup);
      }
    }

    return Array.from(groups).sort();
  },
});
