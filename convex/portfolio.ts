import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";
import { conditionalFailureProbability, calculateAge } from "./lib/weibull";
import {
  getPortfolioAccess,
  assertPortfolioAccess,
  assertPropertyAccess,
  getUserPortfolioId,
  canEdit,
  canManageTeam,
  getProfileFromAuthId,
} from "./lib/permissions";
import {
  portfolioSubscriptionStatus,
  portfolioPlan,
  portfolioMemberRole,
  unitStatus,
  propertyType,
} from "./schema";

/**
 * Generate a random token for invites
 */
function generateToken(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// =====================================================
// PORTFOLIO ACCOUNT MANAGEMENT
// =====================================================

/**
 * Create a new portfolio account for a property manager
 * Called during PM onboarding
 */
export const createPortfolio = mutation({
  args: {
    name: v.string(),
    supportEmail: v.optional(v.string()),
    supportPhone: v.optional(v.string()),
    website: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) throw new Error("Profile not found");
    if (profile.tier !== "property_manager") {
      throw new Error("Only property managers can create portfolios");
    }

    // Check if portfolio already exists
    const existingPortfolio = await getUserPortfolioId(ctx, profile._id);
    if (existingPortfolio) {
      throw new Error("Portfolio already exists");
    }

    // Create portfolio account
    const portfolioId = await ctx.db.insert("portfolioAccounts", {
      name: args.name,
      ownerId: profile._id,
      subscriptionStatus: "active",
      plan: "starter",
      seatLimit: 19,
      currentSeats: 0,
      supportEmail: args.supportEmail,
      supportPhone: args.supportPhone,
      website: args.website,
    });

    // Create billing plan
    await ctx.db.insert("billingPlans", {
      portfolioId,
      basePrice: 49.99,
      perOwnerPrice: 4.0,
      ownerCount: 0,
      billingInterval: "monthly",
      nextBillDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
    });

    // Add owner as portfolio member with owner_admin role
    await ctx.db.insert("portfolioMembers", {
      portfolioId,
      userId: profile._id,
      role: "owner_admin",
      invitedAt: Date.now(),
      acceptedAt: Date.now(),
      isActive: true,
    });

    return { portfolioId };
  },
});

/**
 * Get current user's portfolio
 */
export const getPortfolio = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) return null;

    const portfolio = await ctx.db
      .query("portfolioAccounts")
      .withIndex("by_owner", (q) => q.eq("ownerId", profile._id))
      .first();

    if (!portfolio) return null;

    // Get billing plan
    const billingPlan = await ctx.db
      .query("billingPlans")
      .withIndex("by_portfolio", (q) => q.eq("portfolioId", portfolio._id))
      .first();

    // Get property count
    const properties = await ctx.db
      .query("properties")
      .withIndex("by_portfolio_active", (q) =>
        q.eq("portfolioId", portfolio._id).eq("isArchived", false)
      )
      .collect();

    // Get total units
    const units = await ctx.db
      .query("units")
      .withIndex("by_portfolio", (q) => q.eq("portfolioId", portfolio._id))
      .collect();

    const activeOwners = units.filter((u) => u.status === "owner_active").length;

    return {
      ...portfolio,
      billingPlan,
      propertyCount: properties.length,
      totalUnits: units.length,
      activeOwners,
    };
  },
});

/**
 * Update portfolio settings
 */
export const updatePortfolio = mutation({
  args: {
    name: v.optional(v.string()),
    supportEmail: v.optional(v.string()),
    supportPhone: v.optional(v.string()),
    website: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) throw new Error("Profile not found");

    const portfolioId = await getUserPortfolioId(ctx, profile._id);
    if (!portfolioId) throw new Error("Portfolio not found");

    const access = await getPortfolioAccess(ctx, portfolioId, profile._id);
    if (!access || !canEdit(access.role)) {
      throw new Error("Permission denied");
    }

    const updates: Record<string, string | undefined> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.supportEmail !== undefined) updates.supportEmail = args.supportEmail;
    if (args.supportPhone !== undefined) updates.supportPhone = args.supportPhone;
    if (args.website !== undefined) updates.website = args.website;
    if (args.logoUrl !== undefined) updates.logoUrl = args.logoUrl;

    await ctx.db.patch(portfolioId, updates);
    return { success: true };
  },
});

// =====================================================
// PROPERTY MANAGEMENT
// =====================================================

/**
 * Create a new property in the portfolio
 */
export const createProperty = mutation({
  args: {
    name: v.string(),
    addressLine1: v.string(),
    addressLine2: v.optional(v.string()),
    city: v.string(),
    state: v.string(),
    zipCode: v.string(),
    propertyType: propertyType,
    yearBuilt: v.optional(v.number()),
    totalUnits: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) throw new Error("Profile not found");

    const portfolioId = await getUserPortfolioId(ctx, profile._id);
    if (!portfolioId) throw new Error("Portfolio not found");

    const access = await getPortfolioAccess(ctx, portfolioId, profile._id);
    if (!access || !canEdit(access.role)) {
      throw new Error("Permission denied");
    }

    const propertyId = await ctx.db.insert("properties", {
      portfolioId,
      name: args.name,
      addressLine1: args.addressLine1,
      addressLine2: args.addressLine2,
      city: args.city,
      state: args.state,
      zipCode: args.zipCode,
      propertyType: args.propertyType,
      yearBuilt: args.yearBuilt,
      totalUnits: args.totalUnits || 0,
      activeUnits: 0,
      isArchived: false,
    });

    return { propertyId };
  },
});

/**
 * List all properties in the portfolio
 */
export const listProperties = query({
  args: {
    includeArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) return [];

    const portfolioId = await getUserPortfolioId(ctx, profile._id);
    if (!portfolioId) return [];

    let query = ctx.db
      .query("properties")
      .withIndex("by_portfolio", (q) => q.eq("portfolioId", portfolioId));

    const properties = await query.collect();

    // Filter archived unless requested
    const filtered = args.includeArchived
      ? properties
      : properties.filter((p) => !p.isArchived);

    // Enrich with unit counts
    const enriched = await Promise.all(
      filtered.map(async (property) => {
        const units = await ctx.db
          .query("units")
          .withIndex("by_property", (q) => q.eq("propertyId", property._id))
          .collect();

        const activeOwners = units.filter((u) => u.status === "owner_active").length;
        const pendingInvites = units.filter((u) => u.status === "pending_invite").length;

        return {
          ...property,
          unitCount: units.length,
          activeOwners,
          pendingInvites,
        };
      })
    );

    return enriched;
  },
});

/**
 * Get a single property with all its units
 */
export const getProperty = query({
  args: {
    propertyId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) return null;

    let property: any;
    try {
      property = await ctx.db.get(args.propertyId as any);
    } catch {
      return null;
    }
    if (!property || !property.portfolioId) return null;

    const portfolioId = property.portfolioId as Id<"portfolioAccounts">;
    const propId = property._id as Id<"properties">;

    // Verify access
    const access = await getPortfolioAccess(ctx, portfolioId, profile._id);
    if (!access) return null;

    // Get units
    const units = await ctx.db
      .query("units")
      .withIndex("by_property", (q) => q.eq("propertyId", propId))
      .collect();

    // Enrich units with owner info
    const enrichedUnits = await Promise.all(
      units.map(async (unit) => {
        let ownerProfile = null;
        if (unit.ownerUserId) {
          ownerProfile = await ctx.db.get(unit.ownerUserId);
        }
        
        // Check for pending invite
        const pendingInvite = await ctx.db
          .query("ownerInvites")
          .withIndex("by_unit", (q) => q.eq("unitId", unit._id))
          .filter((q) => q.eq(q.field("acceptedAt"), undefined))
          .first();

        return {
          ...unit,
          ownerProfile: ownerProfile
            ? { name: ownerProfile.fullName, email: ownerProfile.email }
            : null,
          pendingInvite: pendingInvite
            ? { email: pendingInvite.email, expiresAt: pendingInvite.expiresAt }
            : null,
        };
      })
    );

    return {
      ...property,
      units: enrichedUnits.sort((a, b) => a.unitLabel.localeCompare(b.unitLabel)),
    };
  },
});

/**
 * Update a property
 */
export const updateProperty = mutation({
  args: {
    propertyId: v.id("properties"),
    name: v.optional(v.string()),
    addressLine1: v.optional(v.string()),
    addressLine2: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    propertyType: v.optional(propertyType),
    yearBuilt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) throw new Error("Profile not found");

    await assertPropertyAccess(ctx, args.propertyId, profile._id, "admin");

    const { propertyId, ...updates } = args;
    await ctx.db.patch(propertyId, updates);
    return { success: true };
  },
});

// =====================================================
// UNIT MANAGEMENT
// =====================================================

/**
 * Add units to a property
 */
export const addUnits = mutation({
  args: {
    propertyId: v.id("properties"),
    units: v.array(
      v.object({
        unitLabel: v.string(),
        ownerEmail: v.optional(v.string()),
        ownerName: v.optional(v.string()),
        floor: v.optional(v.number()),
        bedrooms: v.optional(v.number()),
        bathrooms: v.optional(v.number()),
        squareFootage: v.optional(v.number()),
        notes: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) throw new Error("Profile not found");

    const property = await ctx.db.get(args.propertyId);
    if (!property) throw new Error("Property not found");

    await assertPortfolioAccess(ctx, property.portfolioId, profile._id, "admin");

    // Check seat limit
    const portfolio = await ctx.db.get(property.portfolioId);
    if (!portfolio) throw new Error("Portfolio not found");

    const unitsWithEmail = args.units.filter((u) => u.ownerEmail);
    if (portfolio.currentSeats + unitsWithEmail.length > portfolio.seatLimit) {
      throw new Error(
        `Adding these units would exceed your seat limit of ${portfolio.seatLimit}`
      );
    }

    const createdUnits = [];

    for (const unit of args.units) {
      const unitId = await ctx.db.insert("units", {
        propertyId: args.propertyId,
        portfolioId: property.portfolioId,
        unitLabel: unit.unitLabel,
        ownerEmail: unit.ownerEmail?.toLowerCase(),
        ownerName: unit.ownerName,
        status: unit.ownerEmail ? "pending_invite" : "vacant",
        floor: unit.floor,
        bedrooms: unit.bedrooms,
        bathrooms: unit.bathrooms,
        squareFootage: unit.squareFootage,
        notes: unit.notes,
      });

      createdUnits.push(unitId);

      // If owner email provided, create invite automatically
      if (unit.ownerEmail) {
        await ctx.db.insert("ownerInvites", {
          unitId,
          portfolioId: property.portfolioId,
          email: unit.ownerEmail.toLowerCase(),
          ownerName: unit.ownerName,
          token: generateToken(),
          expiresAt: Date.now() + 14 * 24 * 60 * 60 * 1000, // 14 days
          invitedByUserId: profile._id,
          reminderCount: 0,
        });
      }
    }

    // Update property total units count
    await ctx.db.patch(args.propertyId, {
      totalUnits: property.totalUnits + args.units.length,
    });

    return { unitIds: createdUnits };
  },
});

/**
 * Import units from CSV data
 * Expects pre-parsed array of unit objects
 */
export const importUnits = mutation({
  args: {
    propertyId: v.id("properties"),
    units: v.array(
      v.object({
        unitLabel: v.string(),
        ownerEmail: v.optional(v.string()),
        ownerName: v.optional(v.string()),
        floor: v.optional(v.number()),
        bedrooms: v.optional(v.number()),
        bathrooms: v.optional(v.number()),
        squareFootage: v.optional(v.number()),
      })
    ),
    sendInvites: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) throw new Error("Profile not found");

    const property = await ctx.db.get(args.propertyId);
    if (!property) throw new Error("Property not found");

    await assertPortfolioAccess(ctx, property.portfolioId, profile._id, "admin");

    // Validate and check for duplicates
    const existingUnits = await ctx.db
      .query("units")
      .withIndex("by_property", (q) => q.eq("propertyId", args.propertyId))
      .collect();

    const existingLabels = new Set(existingUnits.map((u) => u.unitLabel));
    const duplicates = args.units.filter((u) => existingLabels.has(u.unitLabel));

    if (duplicates.length > 0) {
      throw new Error(
        `Duplicate unit labels found: ${duplicates.map((d) => d.unitLabel).join(", ")}`
      );
    }

    // Check seat limit
    const portfolio = await ctx.db.get(property.portfolioId);
    if (!portfolio) throw new Error("Portfolio not found");

    const unitsWithEmail = args.units.filter((u) => u.ownerEmail);
    if (
      args.sendInvites &&
      portfolio.currentSeats + unitsWithEmail.length > portfolio.seatLimit
    ) {
      throw new Error(
        `Importing with invites would exceed your seat limit of ${portfolio.seatLimit}`
      );
    }

    let imported = 0;
    let invitesSent = 0;

    for (const unit of args.units) {
      const unitId = await ctx.db.insert("units", {
        propertyId: args.propertyId,
        portfolioId: property.portfolioId,
        unitLabel: unit.unitLabel,
        ownerEmail: unit.ownerEmail?.toLowerCase(),
        ownerName: unit.ownerName,
        status: args.sendInvites && unit.ownerEmail ? "pending_invite" : "vacant",
        floor: unit.floor,
        bedrooms: unit.bedrooms,
        bathrooms: unit.bathrooms,
        squareFootage: unit.squareFootage,
      });

      imported++;

      // Create invite if requested and email provided
      if (args.sendInvites && unit.ownerEmail) {
        await ctx.db.insert("ownerInvites", {
          unitId,
          portfolioId: property.portfolioId,
          email: unit.ownerEmail.toLowerCase(),
          ownerName: unit.ownerName,
          token: generateToken(),
          expiresAt: Date.now() + 14 * 24 * 60 * 60 * 1000,
          invitedByUserId: profile._id,
          reminderCount: 0,
        });
        invitesSent++;
      }
    }

    // Update property total units count
    await ctx.db.patch(args.propertyId, {
      totalUnits: property.totalUnits + imported,
    });

    return { imported, invitesSent };
  },
});

// =====================================================
// OWNER INVITATIONS
// =====================================================

/**
 * Send invites to unit owners
 */
export const inviteOwners = mutation({
  args: {
    invites: v.array(
      v.object({
        unitId: v.id("units"),
        email: v.string(),
        ownerName: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) throw new Error("Profile not found");

    const results = [];

    for (const invite of args.invites) {
      const unit = await ctx.db.get(invite.unitId);
      if (!unit) {
        results.push({ unitId: invite.unitId, success: false, error: "Unit not found" });
        continue;
      }

      // Check permission
      const access = await getPortfolioAccess(ctx, unit.portfolioId, profile._id);
      if (!access || !canEdit(access.role)) {
        results.push({
          unitId: invite.unitId,
          success: false,
          error: "Permission denied",
        });
        continue;
      }

      // Check if already has active invite
      const existingInvite = await ctx.db
        .query("ownerInvites")
        .withIndex("by_unit", (q) => q.eq("unitId", invite.unitId))
        .filter((q) =>
          q.and(
            q.eq(q.field("acceptedAt"), undefined),
            q.gt(q.field("expiresAt"), Date.now())
          )
        )
        .first();

      if (existingInvite) {
        results.push({
          unitId: invite.unitId,
          success: false,
          error: "Active invite already exists",
        });
        continue;
      }

      // Check seat limit
      const portfolio = await ctx.db.get(unit.portfolioId);
      if (!portfolio || portfolio.currentSeats >= portfolio.seatLimit) {
        results.push({
          unitId: invite.unitId,
          success: false,
          error: "Seat limit reached",
        });
        continue;
      }

      // Create invite
      const token = generateToken();
      await ctx.db.insert("ownerInvites", {
        unitId: invite.unitId,
        portfolioId: unit.portfolioId,
        email: invite.email.toLowerCase(),
        ownerName: invite.ownerName,
        token,
        expiresAt: Date.now() + 14 * 24 * 60 * 60 * 1000, // 14 days
        invitedByUserId: profile._id,
        reminderCount: 0,
      });

      // Update unit status and email
      await ctx.db.patch(invite.unitId, {
        ownerEmail: invite.email.toLowerCase(),
        ownerName: invite.ownerName,
        status: "pending_invite",
      });

      results.push({ unitId: invite.unitId, success: true, token });
    }

    return { results };
  },
});

/**
 * Get owner invite by token (public query for invite acceptance page)
 */
export const getOwnerInvite = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const invite = await ctx.db
      .query("ownerInvites")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!invite) return null;

    const unit = await ctx.db.get(invite.unitId);
    if (!unit) return null;

    const property = await ctx.db.get(unit.propertyId);
    if (!property) return null;

    const portfolio = await ctx.db.get(invite.portfolioId);
    if (!portfolio) return null;

    const invitedBy = await ctx.db.get(invite.invitedByUserId);

    return {
      token: invite.token,
      email: invite.email,
      ownerName: invite.ownerName,
      expiresAt: invite.expiresAt,
      isExpired: invite.expiresAt <= Date.now(),
      isAccepted: !!invite.acceptedAt,
      unit: {
        id: unit._id,
        label: unit.unitLabel,
        floor: unit.floor,
        bedrooms: unit.bedrooms,
        bathrooms: unit.bathrooms,
      },
      property: {
        id: property._id,
        name: property.name,
        address: `${property.addressLine1}, ${property.city}, ${property.state} ${property.zipCode}`,
      },
      portfolio: {
        id: portfolio._id,
        name: portfolio.name,
        supportEmail: portfolio.supportEmail,
        supportPhone: portfolio.supportPhone,
      },
      invitedBy: invitedBy?.fullName || invitedBy?.email || "Property Manager",
    };
  },
});

/**
 * Accept an owner invite - creates home record and links to unit
 */
export const acceptOwnerInvite = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Please sign in to accept the invite");

    const invite = await ctx.db
      .query("ownerInvites")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!invite) throw new Error("Invite not found");
    if (invite.acceptedAt) throw new Error("Invite already accepted");
    if (invite.expiresAt <= Date.now()) throw new Error("Invite has expired");

    const unit = await ctx.db.get(invite.unitId);
    if (!unit) throw new Error("Unit not found");

    const property = await ctx.db.get(unit.propertyId);
    if (!property) throw new Error("Property not found");

    const portfolio = await ctx.db.get(invite.portfolioId);
    if (!portfolio) throw new Error("Portfolio not found");

    // Get or create user profile
    let profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile) {
      // Create profile with managed_homeowner tier
      const profileId = await ctx.db.insert("userProfiles", {
        userId,
        email: invite.email,
        fullName: invite.ownerName,
        tier: "managed_homeowner",
        maxHomes: 1,
        referralCode: generateToken().slice(0, 8),
      });
      profile = await ctx.db.get(profileId);
      if (!profile) throw new Error("Failed to create profile");
    } else {
      // Update existing profile tier if needed
      if (profile.tier === "free") {
        await ctx.db.patch(profile._id, { tier: "managed_homeowner" });
      }
    }

    // Create home record for this unit
    const homeId = await ctx.db.insert("homes", {
      ownerId: profile._id,
      name: `Unit ${unit.unitLabel} - ${property.name}`,
      addressLine1: property.addressLine1,
      addressLine2: unit.unitLabel,
      city: property.city,
      state: property.state,
      zipCode: property.zipCode,
      yearBuilt: property.yearBuilt,
      squareFootage: unit.squareFootage,
      overallHealthScore: 100,
      systemsCount: 0,
      isArchived: false,
      propertyType: property.propertyType,
    });

    // Update unit with owner info
    await ctx.db.patch(unit._id, {
      homeId,
      ownerUserId: profile._id,
      ownerName: profile.fullName || invite.ownerName,
      status: "owner_active",
    });

    // Mark invite as accepted
    await ctx.db.patch(invite._id, { acceptedAt: Date.now() });

    // Update portfolio seat count
    await ctx.db.patch(portfolio._id, {
      currentSeats: portfolio.currentSeats + 1,
    });

    // Update property active units count
    await ctx.db.patch(property._id, {
      activeUnits: property.activeUnits + 1,
    });

    // Update billing plan owner count
    const billingPlan = await ctx.db
      .query("billingPlans")
      .withIndex("by_portfolio", (q) => q.eq("portfolioId", portfolio._id))
      .first();

    if (billingPlan) {
      await ctx.db.patch(billingPlan._id, {
        ownerCount: billingPlan.ownerCount + 1,
      });
    }

    return { success: true, homeId };
  },
});

/**
 * Resend an owner invite
 */
export const resendOwnerInvite = mutation({
  args: {
    unitId: v.id("units"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) throw new Error("Profile not found");

    const unit = await ctx.db.get(args.unitId);
    if (!unit) throw new Error("Unit not found");

    await assertPortfolioAccess(ctx, unit.portfolioId, profile._id, "admin");

    // Find existing invite
    const existingInvite = await ctx.db
      .query("ownerInvites")
      .withIndex("by_unit", (q) => q.eq("unitId", args.unitId))
      .filter((q) => q.eq(q.field("acceptedAt"), undefined))
      .first();

    if (!existingInvite) {
      throw new Error("No pending invite found for this unit");
    }

    // Generate new token and extend expiry
    const newToken = generateToken();
    await ctx.db.patch(existingInvite._id, {
      token: newToken,
      expiresAt: Date.now() + 14 * 24 * 60 * 60 * 1000,
      reminderSentAt: Date.now(),
      reminderCount: existingInvite.reminderCount + 1,
    });

    return { token: newToken };
  },
});

/**
 * Cancel an owner invite
 */
export const cancelOwnerInvite = mutation({
  args: {
    unitId: v.id("units"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) throw new Error("Profile not found");

    const unit = await ctx.db.get(args.unitId);
    if (!unit) throw new Error("Unit not found");

    await assertPortfolioAccess(ctx, unit.portfolioId, profile._id, "admin");

    // Find and delete existing invite
    const existingInvite = await ctx.db
      .query("ownerInvites")
      .withIndex("by_unit", (q) => q.eq("unitId", args.unitId))
      .filter((q) => q.eq(q.field("acceptedAt"), undefined))
      .first();

    if (existingInvite) {
      await ctx.db.delete(existingInvite._id);
    }

    // Update unit status
    await ctx.db.patch(args.unitId, {
      status: "vacant",
      ownerEmail: undefined,
    });

    return { success: true };
  },
});

/**
 * Get portfolio summary for property managers
 */
export const getPortfolioSummary = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile) return null;

    // Check if property manager
    if (profile.tier !== "property_manager") {
      return null;
    }

    // Get all homes
    const homes = await ctx.db
      .query("homes")
      .withIndex("by_owner_active", (q) =>
        q.eq("ownerId", profile._id).eq("isArchived", false)
      )
      .collect();

    // Calculate stats
    const totalProperties = homes.length;
    const avgHealth =
      homes.length > 0
        ? Math.round(
            homes.reduce((sum, h) => sum + h.overallHealthScore, 0) / homes.length
          )
        : 100;

    // Count overdue tasks across all properties
    let totalOverdue = 0;
    let totalDeferredMaintenance = 0;

    for (const home of homes) {
      const tasks = await ctx.db
        .query("scheduledMaintenance")
        .withIndex("by_home_status", (q) =>
          q.eq("homeId", home._id).eq("status", "overdue")
        )
        .collect();

      totalOverdue += tasks.length;

      // Calculate deferred maintenance cost
      for (const task of tasks) {
        const avgCost =
          ((task.proCostLow || 0) + (task.proCostHigh || 0)) / 2 ||
          ((task.diyCostLow || 0) + (task.diyCostHigh || 0)) / 2;
        totalDeferredMaintenance += avgCost;
      }
    }

    return {
      totalProperties,
      avgHealth,
      totalOverdue,
      totalDeferredMaintenance: Math.round(totalDeferredMaintenance),
    };
  },
});

/**
 * Get portfolio health breakdown (for chart)
 */
export const getPortfolioHealthBreakdown = query({
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
      .withIndex("by_owner_active", (q) =>
        q.eq("ownerId", profile._id).eq("isArchived", false)
      )
      .collect();

    // Resolve property IDs via units table
    const results = await Promise.all(
      homes.map(async (home) => {
        const unit = await ctx.db
          .query("units")
          .filter((q) => q.eq(q.field("homeId"), home._id))
          .first();
        return {
          id: home._id,
          propertyId: unit?.propertyId ?? null,
          name: home.name || home.addressLine1,
          address: home.addressLine1,
          city: home.city,
          state: home.state,
          healthScore: home.overallHealthScore,
          systemsCount: home.systemsCount,
          overdueCount: 0,
          propertyGroup: home.propertyGroup,
          propertyType: home.propertyType,
        };
      })
    );

    // Sort by health score (ascending - worst first)
    return results.sort((a, b) => a.healthScore - b.healthScore);
  },
});

/**
 * Get properties needing attention
 */
export const getPropertiesNeedingAttention = query({
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
      .withIndex("by_owner_active", (q) =>
        q.eq("ownerId", profile._id).eq("isArchived", false)
      )
      .collect();

    const needsAttention = [];

    for (const home of homes) {
      const overdueTasks = await ctx.db
        .query("scheduledMaintenance")
        .withIndex("by_home_status", (q) =>
          q.eq("homeId", home._id).eq("status", "overdue")
        )
        .collect();

      // Get next major expense
      const systems = await ctx.db
        .query("systems")
        .withIndex("by_home_active", (q) =>
          q.eq("homeId", home._id).eq("isArchived", false)
        )
        .collect();

      let nextMajorExpense: {
        systemName: string;
        year: number;
        cost: number;
      } | null = null;

      const currentYear = new Date().getFullYear();

      for (const system of systems) {
        if (
          system.estimatedReplacementYear &&
          system.estimatedReplacementYear <= currentYear + 3
        ) {
          const systemType = await ctx.db.get(system.systemTypeId);
          if (systemType) {
            if (
              !nextMajorExpense ||
              system.estimatedReplacementYear < nextMajorExpense.year
            ) {
              nextMajorExpense = {
                systemName: system.name || systemType.name,
                year: system.estimatedReplacementYear,
                cost: systemType.defaultReplacementCostMid,
              };
            }
          }
        }
      }

      // Include if health < 60 OR has overdue tasks
      if (home.overallHealthScore < 60 || overdueTasks.length > 0) {
        needsAttention.push({
          id: home._id,
          name: home.name || home.addressLine1,
          healthScore: home.overallHealthScore,
          overdueCount: overdueTasks.length,
          nextMajorExpense,
          propertyGroup: home.propertyGroup,
        });
      }
    }

    // Sort by health score (worst first)
    return needsAttention.sort((a, b) => a.healthScore - b.healthScore);
  },
});

/**
 * Get major replacements across all properties
 */
export const getPortfolioReplacements = query({
  args: {
    months: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || profile.tier !== "property_manager") return [];

    const maxMonths = args.months || 24;
    const currentDate = new Date();
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + maxMonths);
    const maxYear = maxDate.getFullYear();

    const homes = await ctx.db
      .query("homes")
      .withIndex("by_owner_active", (q) =>
        q.eq("ownerId", profile._id).eq("isArchived", false)
      )
      .collect();

    const replacements = [];

    for (const home of homes) {
      const systems = await ctx.db
        .query("systems")
        .withIndex("by_home_active", (q) =>
          q.eq("homeId", home._id).eq("isArchived", false)
        )
        .collect();

      for (const system of systems) {
        const systemType = await ctx.db.get(system.systemTypeId);
        if (!systemType) continue;

        const age = calculateAge(system.installDate, home.yearBuilt);
        const remainingLifePercent =
          system.remainingLifePercent ??
          Math.max(0, 100 - (age / systemType.defaultLifespanYears) * 100);

        // Include if replacement year within range OR remaining life < 15%
        if (
          (system.estimatedReplacementYear &&
            system.estimatedReplacementYear <= maxYear) ||
          remainingLifePercent < 15
        ) {
          replacements.push({
            propertyId: home._id,
            propertyName: home.name || home.addressLine1,
            systemId: system._id,
            systemName: system.name || systemType.name,
            category: systemType.category,
            ageYears: Math.round(age * 10) / 10,
            replacementYear: system.estimatedReplacementYear,
            cost: systemType.defaultReplacementCostMid,
            healthScore: system.healthScore,
          });
        }
      }
    }

    // Sort by replacement year, then cost
    return replacements.sort((a, b) => {
      if (a.replacementYear !== b.replacementYear) {
        return (a.replacementYear || 9999) - (b.replacementYear || 9999);
      }
      return b.cost - a.cost;
    });
  },
});

/**
 * Get portfolio budget forecast
 */
export const getPortfolioBudgetForecast = query({
  args: {
    years: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || profile.tier !== "property_manager") return null;

    // Get organization settings for custom rates
    const settings = await ctx.db
      .query("organizationSettings")
      .withIndex("by_manager", (q) => q.eq("managerId", profile._id))
      .first();

    const laborRate = settings?.defaultLaborRate ?? 85; // Default $85/hr if not set
    const materialMarkup = settings?.defaultMaterialMarkup ?? 1.1; // Default 10% markup
    const inflationRate = settings?.inflationRateOverride ?? 0.035;

    const projectionYears = args.years || 5;
    const currentYear = new Date().getFullYear();

    const homes = await ctx.db
      .query("homes")
      .withIndex("by_owner_active", (q) =>
        q.eq("ownerId", profile._id).eq("isArchived", false)
      )
      .collect();

    // Get all templates to look up estimated times
    const templates = await ctx.db.query("maintenanceTaskTemplates").collect();
    const templatesById = new Map(templates.map(t => [t._id, t]));

    // Initialize yearly totals
    const yearlyData: Array<{
      year: number;
      maintenanceCost: number;
      repairCost: number;
      replacementCost: number;
      totalCost: number;
    }> = [];

    for (let i = 0; i < projectionYears; i++) {
      yearlyData.push({
        year: currentYear + i,
        maintenanceCost: 0,
        repairCost: 0,
        replacementCost: 0,
        totalCost: 0,
      });
    }

    // Helper to calculate task cost
    const calculateTaskCost = (task: any, template: any) => {
      // If we have actual historical data, we could mix it in here (future enhancement)
      
      // Calculate based on labor + materials
      const hours = (template?.estimatedTimeMinutes ?? 60) / 60;
      const materialCost = ((task.diyCostLow || 0) + (task.diyCostHigh || 0)) / 2;
      
      const laborCost = hours * laborRate;
      const totalMaterial = materialCost * materialMarkup;
      
      return laborCost + totalMaterial;
    };

    // Aggregate costs from all properties
    for (const home of homes) {
      const systems = await ctx.db
        .query("systems")
        .withIndex("by_home_active", (q) =>
          q.eq("homeId", home._id).eq("isArchived", false)
        )
        .collect();

      const tasks = await ctx.db
        .query("scheduledMaintenance")
        .withIndex("by_home", (q) => q.eq("homeId", home._id))
        .collect();

      const activeTasks = tasks.filter(
        (t) => !["completed", "skipped"].includes(t.status)
      );

      for (let i = 0; i < projectionYears; i++) {
        const year = currentYear + i;
        const inflationFactor = Math.pow(1 + inflationRate, i);

        // Maintenance costs
        for (const task of activeTasks) {
          const template = task.templateId ? templatesById.get(task.templateId) : null;
          const baseCost = calculateTaskCost(task, template);
          
          const taskYear = new Date(task.dueDate).getFullYear();
          if (taskYear === year) {
            yearlyData[i].maintenanceCost += baseCost * inflationFactor;
          }

          // Project recurring tasks
          if (task.isRecurring && task.recurrenceMonths) {
            let nextDate = new Date(task.dueDate);
            while (nextDate.getFullYear() <= year) {
              nextDate.setMonth(nextDate.getMonth() + task.recurrenceMonths);
              if (nextDate.getFullYear() === year) {
                yearlyData[i].maintenanceCost += baseCost * inflationFactor;
              }
            }
          }
        }

        // Repair and replacement costs
        for (const system of systems) {
          const systemType = await ctx.db.get(system.systemTypeId);
          if (!systemType) continue;

          const age = calculateAge(system.installDate, home.yearBuilt);
          const ageInYear = age + i;

          // Repair estimate
          const ageRatio = ageInYear / systemType.defaultLifespanYears;
          // PMs pay pro rates for repairs too
          const baseRepairCost = systemType.defaultReplacementCostMid * 0.02 * Math.min(2.5, ageRatio);
          
          // Apply labor/material adjustments to repair cost estimate (approximate)
          // Assuming repair cost is 50/50 labor/parts usually, but let's just apply inflation for now
          // as we don't have hours for generic repairs.
          // However, we can apply the material markup to the parts portion (50%)
          const adjustedRepairCost = (baseRepairCost * 0.5 * materialMarkup) + (baseRepairCost * 0.5); // Labor portion assumed at market rate in base
          
          yearlyData[i].repairCost += adjustedRepairCost * inflationFactor;

          // Replacement check
          const failureProb = conditionalFailureProbability(
            ageInYear - 1,
            1,
            systemType.weibullShape,
            systemType.weibullScale
          );

          if (failureProb > 60 || system.estimatedReplacementYear === year) {
            const replacementCost = systemType.defaultReplacementCostMid * materialMarkup; // Mark up the unit
            yearlyData[i].replacementCost += replacementCost * inflationFactor;
          }
        }
      }
    }

    // Calculate totals
    for (const year of yearlyData) {
      year.maintenanceCost = Math.round(year.maintenanceCost);
      year.repairCost = Math.round(year.repairCost);
      year.replacementCost = Math.round(year.replacementCost);
      year.totalCost =
        year.maintenanceCost + year.repairCost + year.replacementCost;
    }

    const grandTotal = yearlyData.reduce((sum, y) => sum + y.totalCost, 0);
    const cushion = 1.15;

    return {
      yearlyBreakdown: yearlyData,
      totals: {
        grandTotal: Math.round(grandTotal * cushion),
      },
      summary: {
        perYear: Math.round((grandTotal * cushion) / projectionYears),
        perMonth: Math.round((grandTotal * cushion) / projectionYears / 12),
        perProperty: Math.round(
          (grandTotal * cushion) / projectionYears / Math.max(1, homes.length)
        ),
        recommendedMonthlyReserve: Math.round(
          (grandTotal * cushion) / projectionYears / 12
        ),
        perUnitAssessment: Math.round(
          (grandTotal * cushion) / projectionYears / 12 / Math.max(1, homes.length)
        ),
      },
      propertyCount: homes.length,
      projectionYears,
      assumptions: {
        laborRate,
        materialMarkup,
        inflationRate: Math.round(inflationRate * 1000) / 10, // as percentage display
      },
    };
  },
});

/**
 * Get per-property cost breakdown
 */
export const getPropertyCostBreakdown = query({
  args: {
    years: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || profile.tier !== "property_manager") return [];

    const homes = await ctx.db
      .query("homes")
      .withIndex("by_owner_active", (q) =>
        q.eq("ownerId", profile._id).eq("isArchived", false)
      )
      .collect();

    const projectionYears = [1, 3, 5, 10];
    const currentYear = new Date().getFullYear();

    const breakdown = [];

    for (const home of homes) {
      const costs: Record<number, number> = {};

      for (const years of projectionYears) {
        costs[years] = 0;

        const systems = await ctx.db
          .query("systems")
          .withIndex("by_home_active", (q) =>
            q.eq("homeId", home._id).eq("isArchived", false)
          )
          .collect();

        for (let i = 0; i < years; i++) {
          for (const system of systems) {
            const systemType = await ctx.db.get(system.systemTypeId);
            if (!systemType) continue;

            const age = calculateAge(system.installDate, home.yearBuilt);
            const ageInYear = age + i;

            // Base maintenance + repair
            costs[years] += systemType.defaultReplacementCostMid * 0.03;

            // Replacement if due
            if (
              system.estimatedReplacementYear === currentYear + i ||
              conditionalFailureProbability(
                ageInYear,
                1,
                systemType.weibullShape,
                systemType.weibullScale
              ) > 60
            ) {
              costs[years] += systemType.defaultReplacementCostMid;
            }
          }
        }
      }

      breakdown.push({
        id: home._id,
        name: home.name || home.addressLine1,
        propertyGroup: home.propertyGroup,
        cost1yr: Math.round(costs[1]),
        cost3yr: Math.round(costs[3]),
        cost5yr: Math.round(costs[5]),
        cost10yr: Math.round(costs[10]),
      });
    }

    return breakdown;
  },
});
