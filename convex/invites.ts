import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { managedRole } from "./schema";

/**
 * Generate a random invite token
 */
function generateToken(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Create an invite for a resident (homeowner or tenant)
 */
export const createInvite = mutation({
  args: {
    homeId: v.id("homes"),
    email: v.string(),
    role: managedRole,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || profile.tier !== "property_manager") {
      throw new Error("Only property managers can invite residents");
    }

    // Verify the home belongs to this PM
    const home = await ctx.db.get(args.homeId);
    if (!home || home.ownerId !== profile._id) {
      throw new Error("Home not found or access denied");
    }

    // Check for existing pending invite
    const existingInvite = await ctx.db
      .query("memberInvites")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .filter((q) => q.eq(q.field("homeId"), args.homeId))
      .first();

    if (existingInvite && !existingInvite.acceptedAt) {
      throw new Error("An invite is already pending for this email");
    }

    // Check for existing member
    const existingMember = await ctx.db
      .query("managedMembers")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    // Get user profiles to check email
    for (const member of existingMember) {
      const memberProfile = await ctx.db.get(member.memberId);
      if (memberProfile?.email.toLowerCase() === args.email.toLowerCase()) {
        throw new Error("This user is already a member of this property");
      }
    }

    const token = generateToken();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    const inviteId = await ctx.db.insert("memberInvites", {
      managerId: profile._id,
      homeId: args.homeId,
      email: args.email.toLowerCase(),
      role: args.role,
      inviteToken: token,
      expiresAt,
    });

    return { inviteId, token };
  },
});

/**
 * Get all invites for a property manager
 */
export const getInvitesForManager = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || profile.tier !== "property_manager") return [];

    const invites = await ctx.db
      .query("memberInvites")
      .withIndex("by_manager", (q) => q.eq("managerId", profile._id))
      .collect();

    // Enrich with home info
    const enriched = await Promise.all(
      invites.map(async (invite) => {
        const home = await ctx.db.get(invite.homeId);
        return {
          ...invite,
          homeName: home?.name || home?.addressLine1 || "Unknown",
          isPending: !invite.acceptedAt && invite.expiresAt > Date.now(),
          isExpired: !invite.acceptedAt && invite.expiresAt <= Date.now(),
        };
      })
    );

    return enriched.sort((a, b) => b._creationTime - a._creationTime);
  },
});

/**
 * Get invite details by token (for accept flow)
 */
export const getInviteByToken = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const invite = await ctx.db
      .query("memberInvites")
      .withIndex("by_token", (q) => q.eq("inviteToken", args.token))
      .first();

    if (!invite) return null;

    const home = await ctx.db.get(invite.homeId);
    const manager = await ctx.db.get(invite.managerId);

    return {
      ...invite,
      homeName: home?.name || home?.addressLine1,
      homeAddress: home ? `${home.addressLine1}, ${home.city}, ${home.state}` : "",
      managerName: manager?.fullName || manager?.email,
      isExpired: invite.expiresAt <= Date.now(),
      isAccepted: !!invite.acceptedAt,
    };
  },
});

/**
 * Accept an invite - creates or upgrades user account and links to PM
 */
export const acceptInvite = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Please sign in to accept the invite");

    const invite = await ctx.db
      .query("memberInvites")
      .withIndex("by_token", (q) => q.eq("inviteToken", args.token))
      .first();

    if (!invite) throw new Error("Invite not found");
    if (invite.acceptedAt) throw new Error("Invite already accepted");
    if (invite.expiresAt <= Date.now()) throw new Error("Invite has expired");

    // Get or create user profile
    let profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile) {
      // Create profile with managed tier
      const tier = invite.role === "homeowner" ? "managed_homeowner" : "tenant";
      
      const newProfileId = await ctx.db.insert("userProfiles", {
        userId,
        email: invite.email,
        tier,
        maxHomes: 1,
        referralCode: generateToken().slice(0, 8),
      });
      
      // Refetch to get full object
      const newProfile = await ctx.db.get(newProfileId);
      if (!newProfile) throw new Error("Failed to create profile");
      profile = newProfile;
    } else {
      // Update existing profile tier
      const tier = invite.role === "homeowner" ? "managed_homeowner" : "tenant";
      await ctx.db.patch(profile._id, { tier });
    }

    // Create managed member link
    await ctx.db.insert("managedMembers", {
      managerId: invite.managerId,
      memberId: profile._id,
      homeId: invite.homeId,
      role: invite.role,
      monthlyRate: invite.role === "homeowner" ? 4 : 2,
      status: "active",
      invitedAt: invite._creationTime,
      activatedAt: Date.now(),
    });

    // Mark invite as accepted
    await ctx.db.patch(invite._id, { acceptedAt: Date.now() });

    // Update PM's seat counts
    const settings = await ctx.db
      .query("organizationSettings")
      .withIndex("by_manager", (q) => q.eq("managerId", invite.managerId))
      .first();

    if (settings) {
      if (invite.role === "homeowner") {
        await ctx.db.patch(settings._id, {
          activeHomeownerSeats: (settings.activeHomeownerSeats || 0) + 1,
        });
      } else {
        await ctx.db.patch(settings._id, {
          activeTenantSeats: (settings.activeTenantSeats || 0) + 1,
        });
      }
    }

    return { success: true, homeId: invite.homeId };
  },
});

/**
 * Revoke a pending invite
 */
export const revokeInvite = mutation({
  args: {
    inviteId: v.id("memberInvites"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile) throw new Error("Profile not found");

    const invite = await ctx.db.get(args.inviteId);
    if (!invite) throw new Error("Invite not found");
    if (invite.managerId !== profile._id) throw new Error("Access denied");

    await ctx.db.delete(args.inviteId);
    return { success: true };
  },
});

/**
 * Get all managed members for a PM
 */
export const getManagedMembers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || profile.tier !== "property_manager") return [];

    const members = await ctx.db
      .query("managedMembers")
      .withIndex("by_manager", (q) => q.eq("managerId", profile._id))
      .collect();

    // Enrich with member and home info
    const enriched = await Promise.all(
      members.map(async (member) => {
        const memberProfile = await ctx.db.get(member.memberId);
        const home = await ctx.db.get(member.homeId);
        return {
          ...member,
          memberName: memberProfile?.fullName || memberProfile?.email || "Unknown",
          memberEmail: memberProfile?.email || "",
          homeName: home?.name || home?.addressLine1 || "Unknown",
          homeAddress: home ? `${home.city}, ${home.state}` : "",
        };
      })
    );

    return enriched.sort((a, b) => b.activatedAt || 0 - (a.activatedAt || 0));
  },
});

/**
 * Remove a managed member (deactivate access)
 */
export const removeMember = mutation({
  args: {
    memberId: v.id("managedMembers"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile) throw new Error("Profile not found");

    const member = await ctx.db.get(args.memberId);
    if (!member) throw new Error("Member not found");
    if (member.managerId !== profile._id) throw new Error("Access denied");

    // Update status to cancelled
    await ctx.db.patch(args.memberId, { status: "cancelled" });

    // Update the member's profile tier back to free
    await ctx.db.patch(member.memberId, { tier: "free" });

    // Update PM's seat counts
    const settings = await ctx.db
      .query("organizationSettings")
      .withIndex("by_manager", (q) => q.eq("managerId", profile._id))
      .first();

    if (settings) {
      if (member.role === "homeowner") {
        await ctx.db.patch(settings._id, {
          activeHomeownerSeats: Math.max(0, (settings.activeHomeownerSeats || 1) - 1),
        });
      } else {
        await ctx.db.patch(settings._id, {
          activeTenantSeats: Math.max(0, (settings.activeTenantSeats || 1) - 1),
        });
      }
    }

    return { success: true };
  },
});

/**
 * Resend an invite email
 */
export const resendInvite = mutation({
  args: {
    inviteId: v.id("memberInvites"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile) throw new Error("Profile not found");

    const invite = await ctx.db.get(args.inviteId);
    if (!invite) throw new Error("Invite not found");
    if (invite.managerId !== profile._id) throw new Error("Access denied");
    if (invite.acceptedAt) throw new Error("Invite already accepted");

    // Generate new token and extend expiry
    const newToken = generateToken();
    const newExpiry = Date.now() + 7 * 24 * 60 * 60 * 1000;

    await ctx.db.patch(args.inviteId, {
      inviteToken: newToken,
      expiresAt: newExpiry,
    });

    return { token: newToken };
  },
});

/**
 * Get the home a managed member has access to
 */
export const getMyManagedHome = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile) return null;
    if (profile.tier !== "managed_homeowner" && profile.tier !== "tenant") {
      return null;
    }

    const membership = await ctx.db
      .query("managedMembers")
      .withIndex("by_member", (q) => q.eq("memberId", profile._id))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (!membership) return null;

    const home = await ctx.db.get(membership.homeId);
    const manager = await ctx.db.get(membership.managerId);

    return {
      membership,
      home,
      managerName: manager?.fullName || manager?.email,
      managerPhone: manager?.phone,
    };
  },
});
