import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ════════════════════════════════════════════════════════════════════
// Agent Settings (Preferences) — get and update.
// Used by the iOS AgentSettingsView.
// ════════════════════════════════════════════════════════════════════

const DEFAULT_SETTINGS = {
  pushNotifications: true,
  emailDigest: false,
  autoApproveLowRisk: false,
  frequency: "realtime" as const,
  agentPaused: false,
};

// ── Query: Get current settings ───────────────────────────────────

export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return DEFAULT_SETTINGS;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) return DEFAULT_SETTINGS;

    const settings = await ctx.db
      .query("agentSettings")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    if (!settings) return DEFAULT_SETTINGS;

    return {
      pushNotifications: settings.pushNotifications,
      emailDigest: settings.emailDigest,
      autoApproveLowRisk: settings.autoApproveLowRisk,
      frequency: settings.frequency,
      agentPaused: settings.agentPaused,
    };
  },
});

// ── Mutation: Update settings ─────────────────────────────────────

export const update = mutation({
  args: {
    pushNotifications: v.boolean(),
    emailDigest: v.boolean(),
    autoApproveLowRisk: v.boolean(),
    frequency: v.union(
      v.literal("realtime"),
      v.literal("daily"),
      v.literal("weekly")
    ),
    agentPaused: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) throw new Error("User not found");

    const existing = await ctx.db
      .query("agentSettings")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        pushNotifications: args.pushNotifications,
        emailDigest: args.emailDigest,
        autoApproveLowRisk: args.autoApproveLowRisk,
        frequency: args.frequency,
        agentPaused: args.agentPaused,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("agentSettings", {
        userId: user._id,
        pushNotifications: args.pushNotifications,
        emailDigest: args.emailDigest,
        autoApproveLowRisk: args.autoApproveLowRisk,
        frequency: args.frequency,
        agentPaused: args.agentPaused,
        updatedAt: now,
      });
    }
  },
});
