import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getHouseholdMembers = query({
  args: { homeId: v.id("homes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("householdMembers")
      .withIndex("by_homeId", (q) => q.eq("homeId", args.homeId))
      .take(20);
  },
});

export const getMyHouseholds = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email!))
      .first();
    if (!user) return [];

    const memberships = await ctx.db
      .query("householdMembers")
      .withIndex("by_memberUserId", (q) => q.eq("memberUserId", user._id))
      .take(20);

    const homes = await Promise.all(
      memberships
        .filter((m) => m.status === "accepted")
        .map((m) => ctx.db.get(m.homeId)),
    );

    return homes.filter((h): h is NonNullable<typeof h> => h != null);
  },
});

export const inviteMember = mutation({
  args: {
    homeId: v.id("homes"),
    email: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email!))
      .first();
    if (!user) throw new Error("User not found");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();
    if (!profile) throw new Error("Profile not found");

    const home = await ctx.db.get(args.homeId);
    if (!home || home.ownerId !== profile._id)
      throw new Error("Not authorized");

    const existing = await ctx.db
      .query("householdMembers")
      .withIndex("by_memberEmail", (q) => q.eq("memberEmail", args.email))
      .first();
    if (existing && existing.homeId === args.homeId)
      throw new Error("Already invited");

    const memberUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();

    return await ctx.db.insert("householdMembers", {
      homeId: args.homeId,
      ownerUserId: user._id,
      memberUserId: memberUser?._id,
      memberEmail: args.email,
      role: args.role,
      status: "pending",
      invitedAt: Date.now(),
    });
  },
});

export const acceptInvite = mutation({
  args: { inviteId: v.id("householdMembers") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email!))
      .first();
    if (!user) throw new Error("User not found");

    const invite = await ctx.db.get(args.inviteId);
    if (!invite) throw new Error("Invite not found");
    if (invite.memberEmail !== identity.email)
      throw new Error("Not authorized");

    await ctx.db.patch(args.inviteId, {
      memberUserId: user._id,
      status: "accepted",
      joinedAt: Date.now(),
    });
  },
});

export const removeMember = mutation({
  args: { memberId: v.id("householdMembers") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email!))
      .first();
    if (!user) throw new Error("User not found");

    const member = await ctx.db.get(args.memberId);
    if (!member) throw new Error("Member not found");
    if (member.ownerUserId !== user._id)
      throw new Error("Not authorized");

    await ctx.db.delete(args.memberId);
  },
});
