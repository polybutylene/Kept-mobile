import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

export const createBooking = mutation({
  args: {
    homeId: v.id("homes"),
    checkIn: v.string(),
    checkOut: v.string(),
    guestName: v.optional(v.string()),
    guestCount: v.optional(v.number()),
    platform: v.optional(v.union(
      v.literal("airbnb"), v.literal("vrbo"),
      v.literal("booking_com"), v.literal("direct"), v.literal("other")
    )),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const bookingId = await ctx.db.insert("bookings", {
      homeId: args.homeId,
      checkIn: args.checkIn,
      checkOut: args.checkOut,
      guestName: args.guestName,
      guestCount: args.guestCount,
      platform: args.platform,
      status: "confirmed",
      notes: args.notes,
      source: "manual",
    });
    await ctx.scheduler.runAfter(0, internal.turnovers.regenerateTurnovers, { homeId: args.homeId });
    return bookingId;
  },
});

export const updateBooking = mutation({
  args: {
    bookingId: v.id("bookings"),
    checkIn: v.optional(v.string()),
    checkOut: v.optional(v.string()),
    guestName: v.optional(v.string()),
    guestCount: v.optional(v.number()),
    status: v.optional(v.union(
      v.literal("confirmed"), v.literal("pending"),
      v.literal("cancelled"), v.literal("completed")
    )),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const { bookingId, ...updates } = args;
    const booking = await ctx.db.get(bookingId);
    if (!booking) throw new Error("Booking not found");
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, val]) => val !== undefined)
    );
    await ctx.db.patch(bookingId, filtered);
    await ctx.scheduler.runAfter(0, internal.turnovers.regenerateTurnovers, { homeId: booking.homeId });
  },
});

export const deleteBooking = mutation({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found");
    await ctx.db.delete(args.bookingId);
    await ctx.scheduler.runAfter(0, internal.turnovers.regenerateTurnovers, { homeId: booking.homeId });
  },
});

export const getBookingsForHome = query({
  args: {
    homeId: v.id("homes"),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let bookings = await ctx.db
      .query("bookings")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .collect();
    if (args.startDate) {
      bookings = bookings.filter((b) => b.checkOut >= args.startDate!);
    }
    if (args.endDate) {
      bookings = bookings.filter((b) => b.checkIn <= args.endDate!);
    }
    return bookings.filter((b) => b.status !== "cancelled");
  },
});

export const getBookingsForPortfolio = query({
  args: {
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const profile = await ctx.db.query("userProfiles").withIndex("by_userId", (q) => q.eq("userId", userId)).first();
    if (!profile) return [];
    const homes = await ctx.db.query("homes").withIndex("by_owner", (q) => q.eq("ownerId", profile._id)).collect();
    const allBookings = [];
    for (const home of homes) {
      let bookings = await ctx.db
        .query("bookings")
        .withIndex("by_home", (q) => q.eq("homeId", home._id))
        .collect();
      if (args.startDate) bookings = bookings.filter((b) => b.checkOut >= args.startDate!);
      if (args.endDate) bookings = bookings.filter((b) => b.checkIn <= args.endDate!);
      for (const b of bookings.filter((b) => b.status !== "cancelled")) {
        allBookings.push({ ...b, homeName: home.name || home.addressLine1 });
      }
    }
    return allBookings;
  },
});

export const getOccupancySnapshot = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const profile = await ctx.db.query("userProfiles").withIndex("by_userId", (q) => q.eq("userId", userId)).first();
    if (!profile) return [];
    const homes = await ctx.db.query("homes").withIndex("by_owner_active", (q) => q.eq("ownerId", profile._id).eq("isArchived", false)).collect();
    const now = new Date().toISOString();
    const result = [];
    for (const home of homes) {
      const bookings = await ctx.db
        .query("bookings")
        .withIndex("by_home", (q) => q.eq("homeId", home._id))
        .collect();
      const active = bookings.filter(
        (b) => b.status === "confirmed" && b.checkIn <= now && b.checkOut >= now
      );
      const turnovers = await ctx.db
        .query("turnovers")
        .withIndex("by_home", (q) => q.eq("homeId", home._id))
        .collect();
      const inTurnover = turnovers.some(
        (t) => t.status === "in_progress" || (t.checkoutTime <= now && t.nextCheckinTime >= now)
      );
      let status: "occupied" | "vacant" | "turnover" | "blocked" = "vacant";
      if (active.length > 0) status = "occupied";
      else if (inTurnover) status = "turnover";
      result.push({
        homeId: home._id,
        homeName: home.name || home.addressLine1,
        status,
      });
    }
    return result;
  },
});

export const upsertFromIcal = internalMutation({
  args: {
    homeId: v.id("homes"),
    icalFeedId: v.id("icalFeeds"),
    events: v.array(v.object({
      externalId: v.string(),
      checkIn: v.string(),
      checkOut: v.string(),
      summary: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    for (const event of args.events) {
      const existing = await ctx.db
        .query("bookings")
        .withIndex("by_externalId", (q) => q.eq("externalId", event.externalId))
        .first();
      if (existing) {
        await ctx.db.patch(existing._id, {
          checkIn: event.checkIn,
          checkOut: event.checkOut,
          guestName: event.summary,
        });
      } else {
        await ctx.db.insert("bookings", {
          homeId: args.homeId,
          checkIn: event.checkIn,
          checkOut: event.checkOut,
          guestName: event.summary,
          status: "confirmed",
          source: "ical",
          icalFeedId: args.icalFeedId,
          externalId: event.externalId,
        });
      }
    }
    await ctx.scheduler.runAfter(0, internal.turnovers.regenerateTurnovers, { homeId: args.homeId });
  },
});
