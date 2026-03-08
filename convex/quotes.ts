import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { quoteStatus } from "./schema";

/**
 * Add a quote from a service provider
 */
export const addQuote = mutation({
  args: {
    homeId: v.id("homes"),
    incidentId: v.optional(v.id("incidents")),
    packetId: v.optional(v.id("homePackets")),
    
    providerName: v.string(),
    providerPhone: v.optional(v.string()),
    quoteDate: v.string(),
    expiresAt: v.optional(v.string()),
    
    scope: v.string(),
    lineItemsText: v.optional(v.string()),
    totalAmount: v.number(),
    
    warrantyOffered: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const home = await ctx.db.get(args.homeId);
    if (!home) throw new Error("Home not found");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) {
      throw new Error("Not authorized");
    }

    const quoteId = await ctx.db.insert("quotes", {
      homeId: args.homeId,
      incidentId: args.incidentId,
      packetId: args.packetId,
      providerName: args.providerName,
      providerPhone: args.providerPhone,
      quoteDate: args.quoteDate,
      expiresAt: args.expiresAt,
      scope: args.scope,
      lineItemsText: args.lineItemsText,
      totalAmount: args.totalAmount,
      warrantyOffered: args.warrantyOffered,
      notes: args.notes,
      status: "pending",
    });

    return quoteId;
  },
});

/**
 * Update quote status (accept, decline, expired)
 */
export const updateQuoteStatus = mutation({
  args: {
    quoteId: v.id("quotes"),
    status: quoteStatus,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const quote = await ctx.db.get(args.quoteId);
    if (!quote) throw new Error("Quote not found");

    const home = await ctx.db.get(quote.homeId);
    if (!home) throw new Error("Home not found");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) {
      throw new Error("Not authorized");
    }

    const updates: Record<string, any> = { status: args.status };
    if (args.status === "accepted") {
      updates.acceptedAt = Date.now();
    }

    await ctx.db.patch(args.quoteId, updates);
    return true;
  },
});

/**
 * Convert an accepted quote to a service event
 */
export const convertQuoteToEvent = mutation({
  args: {
    quoteId: v.id("quotes"),
    eventDate: v.string(),
    wasDiy: v.boolean(),
    actualTotal: v.optional(v.number()),
    description: v.optional(v.string()),
    systemId: v.optional(v.id("systems")),
    warrantyMonths: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const quote = await ctx.db.get(args.quoteId);
    if (!quote) throw new Error("Quote not found");

    const home = await ctx.db.get(quote.homeId);
    if (!home) throw new Error("Home not found");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) {
      throw new Error("Not authorized");
    }

    // Calculate warranty expiry
    let warrantyExpires: string | undefined;
    if (args.warrantyMonths) {
      const date = new Date(args.eventDate);
      date.setMonth(date.getMonth() + args.warrantyMonths);
      warrantyExpires = date.toISOString().split("T")[0];
    }

    // Create service event
    const eventId = await ctx.db.insert("homeownerServiceEvents", {
      homeId: quote.homeId,
      systemId: args.systemId,
      incidentId: quote.incidentId,
      packetId: quote.packetId,
      eventType: "repair", // Default to repair
      eventDate: args.eventDate,
      description: args.description || quote.scope,
      providerName: quote.providerName,
      providerPhone: quote.providerPhone,
      totalCost: args.actualTotal || quote.totalAmount,
      wasDiy: args.wasDiy,
      estimatedCostAtTime: quote.totalAmount, // Original quote amount
      warrantyMonths: args.warrantyMonths,
      warrantyExpires,
      warrantyNotes: quote.warrantyOffered,
    });

    // Update quote with link to event
    await ctx.db.patch(args.quoteId, {
      status: "accepted",
      acceptedAt: Date.now(),
      serviceEventId: eventId,
    });

    // Update system if provided
    if (args.systemId) {
      await ctx.db.patch(args.systemId, {
        lastServiceDate: args.eventDate,
      });
    }

    // Resolve incident if linked
    if (quote.incidentId) {
      await ctx.db.patch(quote.incidentId, {
        serviceEventId: eventId,
        status: "resolved",
        resolvedAt: Date.now(),
      });
    }

    return eventId;
  },
});

/**
 * Get all quotes for a home
 */
export const getQuotesForHome = query({
  args: {
    homeId: v.id("homes"),
    status: v.optional(quoteStatus),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const home = await ctx.db.get(args.homeId);
    if (!home) return [];

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) return [];

    let quotes = await ctx.db
      .query("quotes")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .order("desc")
      .collect();

    if (args.status) {
      quotes = quotes.filter((q) => q.status === args.status);
    }

    return quotes;
  },
});

/**
 * Get quotes for a specific incident
 */
export const getQuotesForIncident = query({
  args: {
    incidentId: v.id("incidents"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const incident = await ctx.db.get(args.incidentId);
    if (!incident) return [];

    const home = await ctx.db.get(incident.homeId);
    if (!home) return [];

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) return [];

    const quotes = await ctx.db
      .query("quotes")
      .withIndex("by_incident", (q) => q.eq("incidentId", args.incidentId))
      .order("desc")
      .collect();

    return quotes;
  },
});

/**
 * Get quotes for a specific packet
 */
export const getQuotesForPacket = query({
  args: {
    packetId: v.id("homePackets"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const packet = await ctx.db.get(args.packetId);
    if (!packet) return [];

    const home = await ctx.db.get(packet.homeId);
    if (!home) return [];

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) return [];

    const quotes = await ctx.db
      .query("quotes")
      .withIndex("by_packet", (q) => q.eq("packetId", args.packetId))
      .order("desc")
      .collect();

    return quotes;
  },
});

/**
 * Get a single quote
 */
export const getQuote = query({
  args: {
    quoteId: v.id("quotes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const quote = await ctx.db.get(args.quoteId);
    if (!quote) return null;

    const home = await ctx.db.get(quote.homeId);
    if (!home) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) return null;

    return quote;
  },
});

/**
 * Delete a quote
 */
export const deleteQuote = mutation({
  args: {
    quoteId: v.id("quotes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const quote = await ctx.db.get(args.quoteId);
    if (!quote) throw new Error("Quote not found");

    const home = await ctx.db.get(quote.homeId);
    if (!home) throw new Error("Home not found");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(args.quoteId);
    return true;
  },
});

/**
 * Compare quotes (helper query)
 */
export const compareQuotes = query({
  args: {
    quoteIds: v.array(v.id("quotes")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const quotes = await Promise.all(
      args.quoteIds.map((id) => ctx.db.get(id))
    );

    const validQuotes = quotes.filter((q) => q !== null);
    if (validQuotes.length === 0) return null;

    // Verify access
    const home = await ctx.db.get(validQuotes[0]!.homeId);
    if (!home) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || home.ownerId !== profile._id) return null;

    // Sort by price
    const sorted = [...validQuotes].sort((a, b) => 
      (a?.totalAmount || 0) - (b?.totalAmount || 0)
    );

    const lowest = sorted[0];
    const highest = sorted[sorted.length - 1];
    const average = sorted.reduce((sum, q) => sum + (q?.totalAmount || 0), 0) / sorted.length;

    return {
      quotes: validQuotes,
      comparison: {
        lowestPrice: lowest?.totalAmount || 0,
        lowestProvider: lowest?.providerName || "",
        highestPrice: highest?.totalAmount || 0,
        highestProvider: highest?.providerName || "",
        averagePrice: Math.round(average),
        priceDifference: (highest?.totalAmount || 0) - (lowest?.totalAmount || 0),
      },
    };
  },
});
