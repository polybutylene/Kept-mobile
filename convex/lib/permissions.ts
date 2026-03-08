import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

/**
 * Permission utilities for homeowner + property manager products
 */

/**
 * Get profile from auth user ID
 */
export async function getProfileFromAuthId(
  ctx: QueryCtx | MutationCtx,
  authUserId: Id<"users">
): Promise<{
  _id: Id<"userProfiles">;
  tier: string;
  email: string;
} | null> {
  const profile = await ctx.db
    .query("userProfiles")
    .withIndex("by_userId", (q) => q.eq("userId", authUserId))
    .first();

  if (!profile) return null;

  return {
    _id: profile._id,
    tier: profile.tier,
    email: profile.email,
  };
}

// =====================================================
// PORTFOLIO PERMISSION HELPERS
// =====================================================

const EDIT_ROLES = ["owner_admin", "admin"];
const TEAM_ROLES = ["owner_admin"];
const BILLING_ROLES = ["owner_admin"];

/**
 * Get the portfolio ID for a given user profile.
 * Checks portfolioAccounts (owner) first, then portfolioMembers.
 */
export async function getUserPortfolioId(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"userProfiles">
): Promise<Id<"portfolioAccounts"> | null> {
  const owned = await ctx.db
    .query("portfolioAccounts")
    .withIndex("by_owner", (q) => q.eq("ownerId", userId))
    .first();

  if (owned) return owned._id;

  const membership = await ctx.db
    .query("portfolioMembers")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .filter((q) => q.eq(q.field("isActive"), true))
    .first();

  return membership?.portfolioId ?? null;
}

/**
 * Get the access record for a user within a portfolio.
 * Returns the member record (with role) or null.
 */
export async function getPortfolioAccess(
  ctx: QueryCtx | MutationCtx,
  portfolioId: Id<"portfolioAccounts">,
  userId: Id<"userProfiles">
): Promise<{ role: string } | null> {
  const portfolio = await ctx.db.get(portfolioId);
  if (!portfolio) return null;

  if (portfolio.ownerId === userId) {
    return { role: "owner_admin" };
  }

  const member = await ctx.db
    .query("portfolioMembers")
    .withIndex("by_portfolio", (q) => q.eq("portfolioId", portfolioId))
    .filter((q) =>
      q.and(q.eq(q.field("userId"), userId), q.eq(q.field("isActive"), true))
    )
    .first();

  if (!member) return null;
  return { role: member.role };
}

/**
 * Assert that a user has at least the given minimum role in a portfolio.
 * Throws if access is denied.
 */
export async function assertPortfolioAccess(
  ctx: QueryCtx | MutationCtx,
  portfolioId: Id<"portfolioAccounts">,
  userId: Id<"userProfiles">,
  minRole: "viewer" | "staff" | "admin" | "owner_admin" = "viewer"
): Promise<void> {
  const access = await getPortfolioAccess(ctx, portfolioId, userId);
  if (!access) {
    throw new Error("Portfolio access denied");
  }

  const rolePriority: Record<string, number> = {
    viewer: 0,
    staff: 1,
    admin: 2,
    owner_admin: 3,
  };

  if ((rolePriority[access.role] ?? -1) < (rolePriority[minRole] ?? 0)) {
    throw new Error("Insufficient portfolio permissions");
  }
}

/**
 * Assert that a user has access to a property (via its portfolio).
 */
export async function assertPropertyAccess(
  ctx: QueryCtx | MutationCtx,
  propertyId: Id<"properties">,
  userId: Id<"userProfiles">,
  minRole: "viewer" | "staff" | "admin" | "owner_admin" = "viewer"
): Promise<void> {
  const property = await ctx.db.get(propertyId);
  if (!property) throw new Error("Property not found");

  await assertPortfolioAccess(ctx, property.portfolioId, userId, minRole);
}

export function canEdit(role: string): boolean {
  return EDIT_ROLES.includes(role);
}

export function canManageTeam(role: string): boolean {
  return TEAM_ROLES.includes(role);
}

export function canManageBilling(role: string): boolean {
  return BILLING_ROLES.includes(role);
}
