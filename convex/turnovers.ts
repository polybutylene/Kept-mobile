import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const regenerateTurnovers = internalMutation({
  args: { homeId: v.id("homes") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("turnovers")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .collect();
    for (const t of existing.filter((t) => t.status !== "completed")) {
      const checklists = await ctx.db
        .query("turnoverChecklists")
        .withIndex("by_turnover", (q) => q.eq("turnoverId", t._id))
        .collect();
      for (const cl of checklists) await ctx.db.delete(cl._id);
      await ctx.db.delete(t._id);
    }

    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_home_checkin", (q) => q.eq("homeId", args.homeId))
      .collect();
    const active = bookings
      .filter((b) => b.status === "confirmed" || b.status === "pending")
      .sort((a, b) => a.checkIn.localeCompare(b.checkIn));

    for (let i = 0; i < active.length - 1; i++) {
      const current = active[i];
      const next = active[i + 1];
      const checkoutMs = new Date(current.checkOut).getTime();
      const checkinMs = new Date(next.checkIn).getTime();
      const windowMinutes = Math.max(0, Math.round((checkinMs - checkoutMs) / 60000));

      const now = new Date().toISOString();
      let status: "upcoming" | "in_progress" | "completed" = "upcoming";
      if (current.checkOut <= now && next.checkIn >= now) status = "in_progress";
      else if (next.checkIn < now) status = "completed";

      const turnoverId = await ctx.db.insert("turnovers", {
        homeId: args.homeId,
        checkoutTime: current.checkOut,
        nextCheckinTime: next.checkIn,
        windowMinutes,
        status,
        bookingBeforeId: current._id,
        bookingAfterId: next._id,
      });

      const defaultChecklist = [
        { category: "cleaning" as const, name: "Full property clean", sortOrder: 1 },
        { category: "cleaning" as const, name: "Laundry - all linens and towels", sortOrder: 2 },
        { category: "cleaning" as const, name: "Restock supplies (soap, paper towels, etc.)", sortOrder: 3 },
        { category: "inspection" as const, name: "Check HVAC - thermostat working", sortOrder: 4 },
        { category: "inspection" as const, name: "Check for leaks under sinks", sortOrder: 5 },
        { category: "inspection" as const, name: "Test all appliances", sortOrder: 6 },
        { category: "inspection" as const, name: "Check smoke/CO detectors", sortOrder: 7 },
        { category: "inspection" as const, name: "Inspect for damage from prior guest", sortOrder: 8 },
      ];

      for (const item of defaultChecklist) {
        await ctx.db.insert("turnoverChecklists", {
          turnoverId,
          homeId: args.homeId,
          category: item.category,
          name: item.name,
          isCompleted: false,
          sortOrder: item.sortOrder,
        });
      }
    }
  },
});

export const getUpcomingTurnovers = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const profile = await ctx.db.query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId)).first();
    if (!profile) return [];
    const homes = await ctx.db.query("homes")
      .withIndex("by_owner_active", (q) => q.eq("ownerId", profile._id).eq("isArchived", false))
      .collect();

    const now = new Date().toISOString();
    const allTurnovers = [];
    for (const home of homes) {
      const turnovers = await ctx.db.query("turnovers")
        .withIndex("by_home", (q) => q.eq("homeId", home._id))
        .collect();
      for (const t of turnovers.filter((t) => t.nextCheckinTime >= now && t.status !== "completed")) {
        allTurnovers.push({ ...t, homeName: home.name || home.addressLine1 });
      }
    }
    allTurnovers.sort((a, b) => a.checkoutTime.localeCompare(b.checkoutTime));
    return allTurnovers.slice(0, args.limit ?? 10);
  },
});

export const getTurnoversForHome = query({
  args: {
    homeId: v.id("homes"),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let turnovers = await ctx.db.query("turnovers")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .collect();
    if (args.startDate) {
      turnovers = turnovers.filter((t) => t.nextCheckinTime >= args.startDate!);
    }
    if (args.endDate) {
      turnovers = turnovers.filter((t) => t.checkoutTime <= args.endDate!);
    }
    return turnovers.sort((a, b) => a.checkoutTime.localeCompare(b.checkoutTime));
  },
});

export const getAllPortfolioTurnovers = query({
  args: {
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const profile = await ctx.db.query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId)).first();
    if (!profile) return [];
    const homes = await ctx.db.query("homes")
      .withIndex("by_owner_active", (q) => q.eq("ownerId", profile._id).eq("isArchived", false))
      .collect();
    const result = [];
    for (const home of homes) {
      let turnovers = await ctx.db.query("turnovers")
        .withIndex("by_home", (q) => q.eq("homeId", home._id))
        .collect();
      if (args.startDate) turnovers = turnovers.filter((t) => t.nextCheckinTime >= args.startDate!);
      if (args.endDate) turnovers = turnovers.filter((t) => t.checkoutTime <= args.endDate!);
      for (const t of turnovers) {
        result.push({ ...t, homeName: home.name || home.addressLine1 });
      }
    }
    return result.sort((a, b) => a.checkoutTime.localeCompare(b.checkoutTime));
  },
});

export const getTurnoverChecklist = query({
  args: { turnoverId: v.id("turnovers") },
  handler: async (ctx, args) => {
    return await ctx.db.query("turnoverChecklists")
      .withIndex("by_turnover", (q) => q.eq("turnoverId", args.turnoverId))
      .collect();
  },
});

export const toggleChecklistItem = mutation({
  args: { itemId: v.id("turnoverChecklists") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const item = await ctx.db.get(args.itemId);
    if (!item) throw new Error("Checklist item not found");
    await ctx.db.patch(args.itemId, {
      isCompleted: !item.isCompleted,
      completedAt: !item.isCompleted ? Date.now() : undefined,
    });
  },
});

export const addChecklistItem = mutation({
  args: {
    turnoverId: v.id("turnovers"),
    homeId: v.id("homes"),
    category: v.union(
      v.literal("cleaning"), v.literal("inspection"),
      v.literal("maintenance"), v.literal("aesthetic")
    ),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db.query("turnoverChecklists")
      .withIndex("by_turnover", (q) => q.eq("turnoverId", args.turnoverId))
      .collect();
    const maxOrder = existing.reduce((max, i) => Math.max(max, i.sortOrder), 0);
    await ctx.db.insert("turnoverChecklists", {
      turnoverId: args.turnoverId,
      homeId: args.homeId,
      category: args.category,
      name: args.name,
      isCompleted: false,
      sortOrder: maxOrder + 1,
    });
  },
});
