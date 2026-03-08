import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";
import {
  getProfileFromAuthId,
  getUserPortfolioId,
  assertPortfolioAccess,
} from "./lib/permissions";
import { systemCategory, maintenancePriority } from "./schema";

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
// VENDOR MANAGEMENT
// =====================================================

/**
 * Create a new vendor
 */
export const create = mutation({
  args: {
    companyName: v.string(),
    contactName: v.optional(v.string()),
    email: v.string(),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    specialties: v.array(systemCategory),
    serviceArea: v.optional(v.array(v.string())),
    isInsured: v.optional(v.boolean()),
    isLicensed: v.optional(v.boolean()),
    defaultHourlyRate: v.optional(v.number()),
    minimumServiceFee: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) throw new Error("Profile not found");

    const portfolioId = await getUserPortfolioId(ctx, profile._id);
    if (!portfolioId) throw new Error("Portfolio not found");

    // Check for existing vendor with same email
    const existing = await ctx.db
      .query("vendors")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (existing && existing.portfolioId === portfolioId) {
      throw new Error("A vendor with this email already exists");
    }

    const vendorId = await ctx.db.insert("vendors", {
      portfolioId,
      companyName: args.companyName,
      contactName: args.contactName,
      email: args.email.toLowerCase(),
      phone: args.phone,
      website: args.website,
      specialties: args.specialties,
      serviceArea: args.serviceArea,
      isInsured: args.isInsured ?? false,
      isLicensed: args.isLicensed ?? false,
      w9OnFile: false,
      coiOnFile: false,
      defaultHourlyRate: args.defaultHourlyRate,
      minimumServiceFee: args.minimumServiceFee,
      isActive: true,
      isPreferred: false,
      notes: args.notes,
      totalJobs: 0,
      completedJobs: 0,
    });

    return { vendorId };
  },
});

/**
 * List all vendors for the portfolio
 */
export const list = query({
  args: {
    specialty: v.optional(systemCategory),
    activeOnly: v.optional(v.boolean()),
    preferredOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) return [];

    const portfolioId = await getUserPortfolioId(ctx, profile._id);
    if (!portfolioId) return [];

    let vendors = await ctx.db
      .query("vendors")
      .withIndex("by_portfolio", (q) => q.eq("portfolioId", portfolioId))
      .collect();

    // Apply filters
    if (args.activeOnly !== false) {
      vendors = vendors.filter((v) => v.isActive);
    }
    if (args.preferredOnly) {
      vendors = vendors.filter((v) => v.isPreferred);
    }
    if (args.specialty) {
      vendors = vendors.filter((v) => v.specialties.includes(args.specialty!));
    }

    // Enrich with compliance status
    return vendors.map((vendor) => ({
      ...vendor,
      complianceStatus: getComplianceStatus(vendor),
    }));
  },
});

/**
 * Get a single vendor with details
 */
export const get = query({
  args: {
    vendorId: v.id("vendors"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) return null;

    const vendor = await ctx.db.get(args.vendorId);
    if (!vendor) return null;

    const portfolioId = await getUserPortfolioId(ctx, profile._id);
    if (vendor.portfolioId !== portfolioId) return null;

    // Get vendor members
    const members = await ctx.db
      .query("vendorMembers")
      .withIndex("by_vendor", (q) => q.eq("vendorId", args.vendorId))
      .collect();

    // Get ratings
    const ratings = await ctx.db
      .query("vendorRatings")
      .withIndex("by_vendor", (q) => q.eq("vendorId", args.vendorId))
      .collect();

    // Get recent work orders
    const workOrders = await ctx.db
      .query("workOrders")
      .withIndex("by_assignedVendor", (q) => q.eq("assignedVendorId", args.vendorId))
      .take(10);

    return {
      ...vendor,
      members,
      ratings,
      recentWorkOrders: workOrders,
      complianceStatus: getComplianceStatus(vendor),
    };
  },
});

/**
 * Update vendor details
 */
export const update = mutation({
  args: {
    vendorId: v.id("vendors"),
    companyName: v.optional(v.string()),
    contactName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    specialties: v.optional(v.array(systemCategory)),
    serviceArea: v.optional(v.array(v.string())),
    defaultHourlyRate: v.optional(v.number()),
    minimumServiceFee: v.optional(v.number()),
    emergencyRateMultiplier: v.optional(v.number()),
    isPreferred: v.optional(v.boolean()),
    isActive: v.optional(v.boolean()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) throw new Error("Profile not found");

    const vendor = await ctx.db.get(args.vendorId);
    if (!vendor) throw new Error("Vendor not found");

    const portfolioId = await getUserPortfolioId(ctx, profile._id);
    if (vendor.portfolioId !== portfolioId) {
      throw new Error("Access denied");
    }

    const { vendorId, ...updates } = args;
    await ctx.db.patch(vendorId, updates);

    return { success: true };
  },
});

/**
 * Update vendor compliance documents
 */
export const updateCompliance = mutation({
  args: {
    vendorId: v.id("vendors"),
    isInsured: v.optional(v.boolean()),
    insuranceExpiry: v.optional(v.string()),
    isLicensed: v.optional(v.boolean()),
    licenseNumber: v.optional(v.string()),
    licenseExpiry: v.optional(v.string()),
    w9OnFile: v.optional(v.boolean()),
    coiOnFile: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) throw new Error("Profile not found");

    const vendor = await ctx.db.get(args.vendorId);
    if (!vendor) throw new Error("Vendor not found");

    const portfolioId = await getUserPortfolioId(ctx, profile._id);
    if (vendor.portfolioId !== portfolioId) {
      throw new Error("Access denied");
    }

    const { vendorId, ...updates } = args;
    await ctx.db.patch(vendorId, updates);

    return { success: true };
  },
});

/**
 * Invite a vendor to join the portfolio
 */
export const invite = mutation({
  args: {
    email: v.string(),
    companyName: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) throw new Error("Profile not found");

    const portfolioId = await getUserPortfolioId(ctx, profile._id);
    if (!portfolioId) throw new Error("Portfolio not found");

    // Check for existing invite
    const existing = await ctx.db
      .query("vendorInvites")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .filter((q) => q.eq(q.field("portfolioId"), portfolioId))
      .first();

    if (existing && !existing.acceptedAt) {
      throw new Error("An invite is already pending for this email");
    }

    const token = generateToken();
    const expiresAt = Date.now() + 14 * 24 * 60 * 60 * 1000; // 14 days

    const inviteId = await ctx.db.insert("vendorInvites", {
      portfolioId,
      invitedByUserId: profile._id,
      email: args.email.toLowerCase(),
      companyName: args.companyName,
      token,
      expiresAt,
    });

    return { inviteId, token };
  },
});

/**
 * Get pending vendor invites
 */
export const getInvites = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) return [];

    const portfolioId = await getUserPortfolioId(ctx, profile._id);
    if (!portfolioId) return [];

    const invites = await ctx.db
      .query("vendorInvites")
      .withIndex("by_portfolio", (q) => q.eq("portfolioId", portfolioId))
      .collect();

    return invites.map((invite) => ({
      ...invite,
      isPending: !invite.acceptedAt && invite.expiresAt > Date.now(),
      isExpired: !invite.acceptedAt && invite.expiresAt <= Date.now(),
    }));
  },
});

/**
 * Rate a vendor after completing a job
 */
export const rateVendor = mutation({
  args: {
    vendorId: v.id("vendors"),
    workOrderId: v.id("workOrders"),
    overallRating: v.number(),
    qualityRating: v.optional(v.number()),
    timelinessRating: v.optional(v.number()),
    communicationRating: v.optional(v.number()),
    valueRating: v.optional(v.number()),
    comment: v.optional(v.string()),
    wouldRecommend: v.optional(v.boolean()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) throw new Error("Profile not found");

    const vendor = await ctx.db.get(args.vendorId);
    if (!vendor) throw new Error("Vendor not found");

    const workOrder = await ctx.db.get(args.workOrderId);
    if (!workOrder) throw new Error("Work order not found");

    // Validate rating
    if (args.overallRating < 1 || args.overallRating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    await ctx.db.insert("vendorRatings", {
      vendorId: args.vendorId,
      workOrderId: args.workOrderId,
      ratedByUserId: profile._id,
      overallRating: args.overallRating,
      qualityRating: args.qualityRating,
      timelinesRating: args.timelinessRating,
      communicationRating: args.communicationRating,
      valueRating: args.valueRating,
      comment: args.comment,
      wouldRecommend: args.wouldRecommend,
      isPublic: args.isPublic ?? true,
    });

    // Update vendor's average rating
    const allRatings = await ctx.db
      .query("vendorRatings")
      .withIndex("by_vendor", (q) => q.eq("vendorId", args.vendorId))
      .collect();

    const avgRating =
      allRatings.reduce((sum, r) => sum + r.overallRating, 0) / allRatings.length;

    await ctx.db.patch(args.vendorId, {
      avgRating: Math.round(avgRating * 10) / 10,
      completedJobs: vendor.completedJobs + 1,
    });

    return { success: true };
  },
});

// =====================================================
// QUOTE REQUESTS
// =====================================================

/**
 * Create a quote request
 */
export const createQuoteRequest = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: systemCategory,
    priority: maintenancePriority,
    homeId: v.id("homes"),
    unitId: v.optional(v.id("units")),
    systemId: v.optional(v.id("systems")),
    workOrderId: v.optional(v.id("workOrders")),
    neededByDate: v.optional(v.string()),
    preferredWindow: v.optional(
      v.object({
        startDate: v.string(),
        endDate: v.string(),
      })
    ),
    targetVendorIds: v.optional(v.array(v.id("vendors"))),
    broadcastToAll: v.optional(v.boolean()),
    expiresInDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) throw new Error("Profile not found");

    const portfolioId = await getUserPortfolioId(ctx, profile._id);
    if (!portfolioId) throw new Error("Portfolio not found");

    const expiresAt = Date.now() + (args.expiresInDays || 7) * 24 * 60 * 60 * 1000;

    const quoteRequestId = await ctx.db.insert("quoteRequests", {
      portfolioId,
      workOrderId: args.workOrderId,
      createdByUserId: profile._id,
      title: args.title,
      description: args.description,
      category: args.category,
      priority: args.priority,
      homeId: args.homeId,
      unitId: args.unitId,
      systemId: args.systemId,
      neededByDate: args.neededByDate,
      preferredWindow: args.preferredWindow,
      targetVendorIds: args.targetVendorIds,
      broadcastToAll: args.broadcastToAll ?? false,
      status: "sent",
      expiresAt,
    });

    return { quoteRequestId };
  },
});

/**
 * List quote requests
 */
export const listQuoteRequests = query({
  args: {
    status: v.optional(v.string()),
    workOrderId: v.optional(v.id("workOrders")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) return [];

    const portfolioId = await getUserPortfolioId(ctx, profile._id);
    if (!portfolioId) return [];

    let requests = await ctx.db
      .query("quoteRequests")
      .withIndex("by_portfolio", (q) => q.eq("portfolioId", portfolioId))
      .collect();

    if (args.status) {
      requests = requests.filter((r) => r.status === args.status);
    }
    if (args.workOrderId) {
      requests = requests.filter((r) => r.workOrderId === args.workOrderId);
    }

    // Get quote counts for each request
    const enriched = await Promise.all(
      requests.map(async (request) => {
        const quotes = await ctx.db
          .query("vendorQuotes")
          .withIndex("by_quoteRequest", (q) => q.eq("quoteRequestId", request._id))
          .collect();

        return {
          ...request,
          quoteCount: quotes.length,
          lowestQuote: quotes.length > 0
            ? Math.min(...quotes.map((q) => q.totalAmount))
            : null,
          highestQuote: quotes.length > 0
            ? Math.max(...quotes.map((q) => q.totalAmount))
            : null,
        };
      })
    );

    return enriched;
  },
});

/**
 * Get quote request with all quotes
 */
export const getQuoteRequest = query({
  args: {
    quoteRequestId: v.id("quoteRequests"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) return null;

    const quoteRequest = await ctx.db.get(args.quoteRequestId);
    if (!quoteRequest) return null;

    const portfolioId = await getUserPortfolioId(ctx, profile._id);
    if (quoteRequest.portfolioId !== portfolioId) return null;

    // Get all quotes
    const quotes = await ctx.db
      .query("vendorQuotes")
      .withIndex("by_quoteRequest", (q) => q.eq("quoteRequestId", args.quoteRequestId))
      .collect();

    // Enrich quotes with vendor info
    const enrichedQuotes = await Promise.all(
      quotes.map(async (quote) => {
        const vendor = await ctx.db.get(quote.vendorId);
        return {
          ...quote,
          vendorName: vendor?.companyName,
          vendorRating: vendor?.avgRating,
        };
      })
    );

    return {
      ...quoteRequest,
      quotes: enrichedQuotes.sort((a, b) => a.totalAmount - b.totalAmount),
    };
  },
});

/**
 * Submit a quote (for vendor use)
 */
export const submitQuote = mutation({
  args: {
    quoteRequestId: v.id("quoteRequests"),
    vendorId: v.id("vendors"),
    totalAmount: v.number(),
    laborCost: v.optional(v.number()),
    materialCost: v.optional(v.number()),
    taxAmount: v.optional(v.number()),
    lineItems: v.optional(
      v.array(
        v.object({
          description: v.string(),
          quantity: v.optional(v.number()),
          unitPrice: v.optional(v.number()),
          amount: v.number(),
        })
      )
    ),
    estimatedDuration: v.optional(v.string()),
    availableStartDate: v.optional(v.string()),
    validUntil: v.optional(v.string()),
    warrantyTerms: v.optional(v.string()),
    paymentTerms: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) throw new Error("Profile not found");

    const quoteRequest = await ctx.db.get(args.quoteRequestId);
    if (!quoteRequest) throw new Error("Quote request not found");

    if (quoteRequest.status !== "sent" && quoteRequest.status !== "quotes_received") {
      throw new Error("Quote request is no longer accepting quotes");
    }

    // Check if vendor already submitted a quote
    const existing = await ctx.db
      .query("vendorQuotes")
      .withIndex("by_quoteRequest", (q) => q.eq("quoteRequestId", args.quoteRequestId))
      .filter((q) => q.eq(q.field("vendorId"), args.vendorId))
      .first();

    if (existing) {
      throw new Error("A quote has already been submitted for this request");
    }

    const quoteId = await ctx.db.insert("vendorQuotes", {
      quoteRequestId: args.quoteRequestId,
      vendorId: args.vendorId,
      submittedByUserId: profile._id,
      totalAmount: args.totalAmount,
      laborCost: args.laborCost,
      materialCost: args.materialCost,
      taxAmount: args.taxAmount,
      lineItems: args.lineItems,
      estimatedDuration: args.estimatedDuration,
      availableStartDate: args.availableStartDate,
      validUntil: args.validUntil,
      warrantyTerms: args.warrantyTerms,
      paymentTerms: args.paymentTerms,
      notes: args.notes,
      status: "submitted",
    });

    // Update quote request status
    await ctx.db.patch(args.quoteRequestId, {
      status: "quotes_received",
    });

    return { quoteId };
  },
});

/**
 * Select a quote and assign vendor to work order
 */
export const selectQuote = mutation({
  args: {
    quoteId: v.id("vendorQuotes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) throw new Error("Profile not found");

    const quote = await ctx.db.get(args.quoteId);
    if (!quote) throw new Error("Quote not found");

    const quoteRequest = await ctx.db.get(quote.quoteRequestId);
    if (!quoteRequest) throw new Error("Quote request not found");

    const portfolioId = await getUserPortfolioId(ctx, profile._id);
    if (quoteRequest.portfolioId !== portfolioId) {
      throw new Error("Access denied");
    }

    // Update the selected quote
    await ctx.db.patch(args.quoteId, {
      status: "accepted",
      acceptedAt: Date.now(),
    });

    // Decline other quotes
    const otherQuotes = await ctx.db
      .query("vendorQuotes")
      .withIndex("by_quoteRequest", (q) => q.eq("quoteRequestId", quote.quoteRequestId))
      .filter((q) => q.neq(q.field("_id"), args.quoteId))
      .collect();

    for (const otherQuote of otherQuotes) {
      await ctx.db.patch(otherQuote._id, {
        status: "declined",
        declineReason: "Another quote was selected",
      });
    }

    // Update quote request status
    await ctx.db.patch(quote.quoteRequestId, {
      status: "quote_selected",
    });

    // If linked to work order, assign vendor
    if (quoteRequest.workOrderId) {
      await ctx.db.patch(quoteRequest.workOrderId, {
        assignedVendorId: quote.vendorId,
        status: "assigned",
        estimatedHours: quote.estimatedDuration
          ? parseFloat(quote.estimatedDuration)
          : undefined,
      });

      // Update vendor's total jobs
      const vendor = await ctx.db.get(quote.vendorId);
      if (vendor) {
        await ctx.db.patch(quote.vendorId, {
          totalJobs: vendor.totalJobs + 1,
        });
      }
    }

    return { success: true };
  },
});

/**
 * Compare quotes side by side
 */
export const compareQuotes = query({
  args: {
    quoteRequestId: v.id("quoteRequests"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) return null;

    const quoteRequest = await ctx.db.get(args.quoteRequestId);
    if (!quoteRequest) return null;

    const portfolioId = await getUserPortfolioId(ctx, profile._id);
    if (quoteRequest.portfolioId !== portfolioId) return null;

    const quotes = await ctx.db
      .query("vendorQuotes")
      .withIndex("by_quoteRequest", (q) => q.eq("quoteRequestId", args.quoteRequestId))
      .collect();

    // Enrich with vendor details
    const comparison = await Promise.all(
      quotes.map(async (quote) => {
        const vendor = await ctx.db.get(quote.vendorId);
        return {
          quoteId: quote._id,
          vendorId: quote.vendorId,
          vendorName: vendor?.companyName,
          vendorRating: vendor?.avgRating,
          totalJobs: vendor?.completedJobs,
          totalAmount: quote.totalAmount,
          laborCost: quote.laborCost,
          materialCost: quote.materialCost,
          estimatedDuration: quote.estimatedDuration,
          availableStartDate: quote.availableStartDate,
          warrantyTerms: quote.warrantyTerms,
          status: quote.status,
        };
      })
    );

    return {
      request: quoteRequest,
      quotes: comparison.sort((a, b) => a.totalAmount - b.totalAmount),
      lowestAmount: Math.min(...comparison.map((q) => q.totalAmount)),
      highestAmount: Math.max(...comparison.map((q) => q.totalAmount)),
      avgAmount:
        comparison.reduce((sum, q) => sum + q.totalAmount, 0) / comparison.length,
    };
  },
});

// Helper function to calculate compliance status
function getComplianceStatus(vendor: any): {
  isCompliant: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  if (!vendor.isInsured) {
    issues.push("Insurance required");
  } else if (vendor.insuranceExpiry) {
    const expiry = new Date(vendor.insuranceExpiry);
    if (expiry < new Date()) {
      issues.push("Insurance expired");
    } else if (expiry < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) {
      issues.push("Insurance expiring soon");
    }
  }

  if (!vendor.isLicensed) {
    issues.push("License required");
  } else if (vendor.licenseExpiry) {
    const expiry = new Date(vendor.licenseExpiry);
    if (expiry < new Date()) {
      issues.push("License expired");
    }
  }

  if (!vendor.w9OnFile) {
    issues.push("W-9 required");
  }

  if (!vendor.coiOnFile) {
    issues.push("COI required");
  }

  return {
    isCompliant: issues.length === 0,
    issues,
  };
}
