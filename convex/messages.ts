import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";
import {
  getProfileFromAuthId,
  getUserPortfolioId,
} from "./lib/permissions";

// =====================================================
// CONVERSATIONS
// =====================================================

/**
 * Create a conversation for a work order
 */
export const createConversationForWorkOrder = mutation({
  args: {
    workOrderId: v.id("workOrders"),
    subject: v.optional(v.string()),
    initialMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) throw new Error("Profile not found");

    const workOrder = await ctx.db.get(args.workOrderId);
    if (!workOrder) throw new Error("Work order not found");

    // Check if conversation already exists
    const existing = await ctx.db
      .query("portfolioConversations")
      .withIndex("by_workOrder", (q) => q.eq("workOrderId", args.workOrderId))
      .first();

    if (existing) {
      return { conversationId: existing._id };
    }

    const portfolioId = await getUserPortfolioId(ctx, profile._id);
    if (!portfolioId) throw new Error("Portfolio not found");

    // Create conversation
    const conversationId = await ctx.db.insert("portfolioConversations", {
      portfolioId,
      contextType: "work_order",
      workOrderId: args.workOrderId,
      subject: args.subject || workOrder.title,
      status: "active",
      unreadCount: 0,
    });

    // Add creator as participant
    await ctx.db.insert("portfolioConversationParticipants", {
      conversationId,
      userId: profile._id,
      role: "manager",
      notifyEmail: true,
      notifyInApp: true,
      unreadCount: 0,
      isActive: true,
    });

    // Add assigned worker/vendor if any
    if (workOrder.workerId) {
      const worker = await ctx.db.get(workOrder.workerId);
      if (worker) {
        // Workers don't have userProfiles, so we skip adding them as participants
        // In a full implementation, workers would have linked user accounts
      }
    }

    // Add unit owner if work order is for a unit
    if (workOrder.unitId) {
      const unit = await ctx.db.get(workOrder.unitId);
      if (unit?.ownerUserId) {
        await ctx.db.insert("portfolioConversationParticipants", {
          conversationId,
          userId: unit.ownerUserId,
          role: "owner",
          notifyEmail: true,
          notifyInApp: true,
          unreadCount: 0,
          isActive: true,
        });
      }
    }

    // Send initial message if provided
    if (args.initialMessage) {
      await ctx.db.insert("portfolioMessages", {
        conversationId,
        senderId: profile._id,
        content: args.initialMessage,
        contentType: "text",
        isEdited: false,
        isDeleted: false,
      });

      await ctx.db.patch(conversationId, {
        lastMessageAt: Date.now(),
        lastMessagePreview: args.initialMessage.slice(0, 100),
      });
    }

    return { conversationId };
  },
});

/**
 * Create a conversation for a unit
 */
export const createConversationForUnit = mutation({
  args: {
    unitId: v.id("units"),
    subject: v.string(),
    initialMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) throw new Error("Profile not found");

    const unit = await ctx.db.get(args.unitId);
    if (!unit) throw new Error("Unit not found");

    const portfolioId = await getUserPortfolioId(ctx, profile._id);
    if (!portfolioId) throw new Error("Portfolio not found");

    // Create conversation
    const conversationId = await ctx.db.insert("portfolioConversations", {
      portfolioId,
      contextType: "unit",
      unitId: args.unitId,
      subject: args.subject,
      status: "active",
      unreadCount: 0,
    });

    // Add creator as participant
    await ctx.db.insert("portfolioConversationParticipants", {
      conversationId,
      userId: profile._id,
      role: "manager",
      notifyEmail: true,
      notifyInApp: true,
      unreadCount: 0,
      isActive: true,
    });

    // Add unit owner if exists
    if (unit.ownerUserId) {
      await ctx.db.insert("portfolioConversationParticipants", {
        conversationId,
        userId: unit.ownerUserId,
        role: "owner",
        notifyEmail: true,
        notifyInApp: true,
        unreadCount: 0,
        isActive: true,
      });
    }

    // Send initial message if provided
    if (args.initialMessage) {
      await ctx.db.insert("portfolioMessages", {
        conversationId,
        senderId: profile._id,
        content: args.initialMessage,
        contentType: "text",
        isEdited: false,
        isDeleted: false,
      });

      await ctx.db.patch(conversationId, {
        lastMessageAt: Date.now(),
        lastMessagePreview: args.initialMessage.slice(0, 100),
      });
    }

    return { conversationId };
  },
});

/**
 * List conversations for the current user
 */
export const list = query({
  args: {
    status: v.optional(v.union(v.literal("active"), v.literal("archived"), v.literal("closed"))),
    contextType: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) return [];

    // Get user's participations
    const participations = await ctx.db
      .query("portfolioConversationParticipants")
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    if (participations.length === 0) return [];

    // Get conversations
    const conversations = await Promise.all(
      participations.map(async (p) => {
        const conversation = await ctx.db.get(p.conversationId);
        if (!conversation) return null;

        // Apply filters
        if (args.status && conversation.status !== args.status) return null;
        if (args.contextType && conversation.contextType !== args.contextType) return null;

        // Get context info
        let contextInfo: any = {};
        if (conversation.workOrderId) {
          const workOrder = await ctx.db.get(conversation.workOrderId);
          contextInfo.workOrderTitle = workOrder?.title;
        }
        if (conversation.unitId) {
          const unit = await ctx.db.get(conversation.unitId);
          contextInfo.unitLabel = unit?.unitLabel;
          if (unit?.propertyId) {
            const property = await ctx.db.get(unit.propertyId);
            contextInfo.propertyName = property?.name;
          }
        }

        // Get participant count
        const participants = await ctx.db
          .query("portfolioConversationParticipants")
          .withIndex("by_conversation", (q) => q.eq("conversationId", conversation._id))
          .filter((q) => q.eq(q.field("isActive"), true))
          .collect();

        return {
          ...conversation,
          ...contextInfo,
          participantCount: participants.length,
          myUnreadCount: p.unreadCount,
        };
      })
    );

    // Filter out nulls and sort by last message
    const filtered = conversations
      .filter((c): c is NonNullable<typeof c> => c !== null)
      .sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0));

    return args.limit ? filtered.slice(0, args.limit) : filtered;
  },
});

/**
 * Get a single conversation with messages
 */
export const getThread = query({
  args: {
    conversationId: v.id("portfolioConversations"),
    limit: v.optional(v.number()),
    before: v.optional(v.number()), // For pagination
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) return null;

    // Check if user is a participant
    const participation = await ctx.db
      .query("portfolioConversationParticipants")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .filter((q) =>
        q.and(q.eq(q.field("userId"), profile._id), q.eq(q.field("isActive"), true))
      )
      .first();

    if (!participation) return null;

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return null;

    // Get messages
    let messagesQuery = ctx.db
      .query("portfolioMessages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId));

    let messages = await messagesQuery.collect();

    // Filter by before if provided
    if (args.before) {
      messages = messages.filter((m) => m._creationTime < args.before!);
    }

    // Sort by creation time (newest first for pagination, then reverse for display)
    messages = messages
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, args.limit || 50);

    // Enrich messages with sender info
    const enrichedMessages = await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.senderId);
        return {
          ...message,
          senderName: sender?.fullName || sender?.email || "Unknown",
          senderAvatar: sender?.avatarUrl,
          isOwn: message.senderId === profile._id,
        };
      })
    );

    // Get participants
    const participants = await ctx.db
      .query("portfolioConversationParticipants")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const enrichedParticipants = await Promise.all(
      participants.map(async (p) => {
        const user = await ctx.db.get(p.userId);
        return {
          ...p,
          userName: user?.fullName || user?.email || "Unknown",
          userAvatar: user?.avatarUrl,
        };
      })
    );

    // Get context info
    let contextInfo: any = {};
    if (conversation.workOrderId) {
      const workOrder = await ctx.db.get(conversation.workOrderId);
      contextInfo.workOrder = workOrder;
    }
    if (conversation.unitId) {
      const unit = await ctx.db.get(conversation.unitId);
      contextInfo.unit = unit;
    }

    return {
      conversation,
      messages: enrichedMessages.reverse(), // Reverse for chronological order
      participants: enrichedParticipants,
      ...contextInfo,
      hasMore: messages.length === (args.limit || 50),
    };
  },
});

// =====================================================
// MESSAGES
// =====================================================

/**
 * Send a message in a conversation
 */
export const send = mutation({
  args: {
    conversationId: v.id("portfolioConversations"),
    content: v.string(),
    attachments: v.optional(
      v.array(
        v.object({
          storageId: v.id("_storage"),
          fileName: v.string(),
          fileType: v.string(),
          fileSize: v.optional(v.number()),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) throw new Error("Profile not found");

    // Check if user is a participant
    const participation = await ctx.db
      .query("portfolioConversationParticipants")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .filter((q) =>
        q.and(q.eq(q.field("userId"), profile._id), q.eq(q.field("isActive"), true))
      )
      .first();

    if (!participation) {
      throw new Error("You are not a participant in this conversation");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    if (conversation.status !== "active") {
      throw new Error("Cannot send messages to a closed conversation");
    }

    // Create message
    const messageId = await ctx.db.insert("portfolioMessages", {
      conversationId: args.conversationId,
      senderId: profile._id,
      content: args.content,
      contentType: args.attachments?.length ? "attachment" : "text",
      attachments: args.attachments,
      isEdited: false,
      isDeleted: false,
    });

    // Update conversation
    await ctx.db.patch(args.conversationId, {
      lastMessageAt: Date.now(),
      lastMessagePreview: args.content.slice(0, 100),
    });

    // Update unread counts for other participants
    const participants = await ctx.db
      .query("portfolioConversationParticipants")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .filter((q) =>
        q.and(q.neq(q.field("userId"), profile._id), q.eq(q.field("isActive"), true))
      )
      .collect();

    for (const participant of participants) {
      await ctx.db.patch(participant._id, {
        unreadCount: participant.unreadCount + 1,
      });
    }

    // Mark sender's messages as read
    await ctx.db.patch(participation._id, {
      lastReadAt: Date.now(),
      unreadCount: 0,
    });

    return { messageId };
  },
});

/**
 * Mark messages as read
 */
export const markAsRead = mutation({
  args: {
    conversationId: v.id("portfolioConversations"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) throw new Error("Profile not found");

    const participation = await ctx.db
      .query("portfolioConversationParticipants")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .filter((q) => q.eq(q.field("userId"), profile._id))
      .first();

    if (!participation) return { success: false };

    await ctx.db.patch(participation._id, {
      lastReadAt: Date.now(),
      unreadCount: 0,
    });

    return { success: true };
  },
});

/**
 * Get unread count for the current user
 */
export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) return 0;

    const participations = await ctx.db
      .query("portfolioConversationParticipants")
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return participations.reduce((sum, p) => sum + p.unreadCount, 0);
  },
});

/**
 * Archive a conversation
 */
export const archiveConversation = mutation({
  args: {
    conversationId: v.id("portfolioConversations"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) throw new Error("Profile not found");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    await ctx.db.patch(args.conversationId, {
      status: "archived",
    });

    return { success: true };
  },
});

/**
 * Close a conversation
 */
export const closeConversation = mutation({
  args: {
    conversationId: v.id("portfolioConversations"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) throw new Error("Profile not found");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    await ctx.db.patch(args.conversationId, {
      status: "closed",
    });

    // Add system message
    await ctx.db.insert("portfolioMessages", {
      conversationId: args.conversationId,
      senderId: profile._id,
      content: "Conversation closed",
      contentType: "system",
      isEdited: false,
      isDeleted: false,
    });

    return { success: true };
  },
});

/**
 * Add a participant to a conversation
 */
export const addParticipant = mutation({
  args: {
    conversationId: v.id("portfolioConversations"),
    userId: v.id("userProfiles"),
    role: v.union(
      v.literal("manager"),
      v.literal("staff"),
      v.literal("owner"),
      v.literal("tenant"),
      v.literal("vendor")
    ),
  },
  handler: async (ctx, args) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) throw new Error("Not authenticated");

    const profile = await getProfileFromAuthId(ctx, authUserId);
    if (!profile) throw new Error("Profile not found");

    // Check if already a participant
    const existing = await ctx.db
      .query("portfolioConversationParticipants")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (existing) {
      if (existing.isActive) {
        throw new Error("User is already a participant");
      }
      // Reactivate
      await ctx.db.patch(existing._id, {
        isActive: true,
        leftAt: undefined,
        unreadCount: 0,
      });
      return { participantId: existing._id };
    }

    const participantId = await ctx.db.insert("portfolioConversationParticipants", {
      conversationId: args.conversationId,
      userId: args.userId,
      role: args.role,
      notifyEmail: true,
      notifyInApp: true,
      unreadCount: 0,
      isActive: true,
    });

    // Add system message
    const user = await ctx.db.get(args.userId);
    await ctx.db.insert("portfolioMessages", {
      conversationId: args.conversationId,
      senderId: profile._id,
      content: `${user?.fullName || user?.email || "Someone"} was added to the conversation`,
      contentType: "system",
      isEdited: false,
      isDeleted: false,
    });

    return { participantId };
  },
});
