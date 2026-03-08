import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const createRequest = internalMutation({
  args: {
    userId: v.id("users"),
    systemId: v.optional(v.id("systems")),
    requestType: v.string(),
    serviceCategory: v.string(),
    description: v.string(),
    urgency: v.string(),
    systemContext: v.optional(v.any()),
    preferredDays: v.optional(v.array(v.string())),
    preferredTimeWindow: v.optional(v.string()),
    homeownerPhone: v.string(),
    homeownerAddress: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("voiceServiceRequests", {
      userId: args.userId,
      systemId: args.systemId,
      requestType: args.requestType,
      serviceCategory: args.serviceCategory,
      description: args.description,
      urgency: args.urgency,
      systemContext: args.systemContext,
      preferredDays: args.preferredDays,
      preferredTimeWindow: args.preferredTimeWindow,
      homeownerPhone: args.homeownerPhone,
      homeownerAddress: args.homeownerAddress,
      status: "pending",
      callAttempts: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateRequestStatus = internalMutation({
  args: {
    requestId: v.id("voiceServiceRequests"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.requestId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

export const recordCallAttempt = internalMutation({
  args: {
    requestId: v.id("voiceServiceRequests"),
    attempt: v.object({
      providerName: v.string(),
      providerPhone: v.string(),
      callId: v.optional(v.string()),
      callStartedAt: v.number(),
      callEndedAt: v.optional(v.number()),
      duration: v.optional(v.number()),
      outcome: v.string(),
      notes: v.optional(v.string()),
      transcript: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) return;

    await ctx.db.patch(args.requestId, {
      callAttempts: [...request.callAttempts, args.attempt],
      updatedAt: Date.now(),
    });
  },
});

export const markScheduled = internalMutation({
  args: {
    requestId: v.id("voiceServiceRequests"),
    provider: v.string(),
    providerPhone: v.string(),
    appointmentTime: v.optional(v.string()),
    estimatedCost: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.requestId, {
      status: "scheduled",
      appointmentProvider: args.provider,
      appointmentProviderPhone: args.providerPhone,
      appointmentTime: args.appointmentTime,
      estimatedCost: args.estimatedCost,
      updatedAt: Date.now(),
    });
  },
});
