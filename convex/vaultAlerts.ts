import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { vaultAlertStatus } from "./schema";

export const getAlerts = query({
  args: {
    homeId: v.id("homes"),
    status: v.optional(vaultAlertStatus),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let alerts;
    if (args.status) {
      alerts = await ctx.db
        .query("vaultAlerts")
        .withIndex("by_home_and_status", (q: any) =>
          q.eq("homeId", args.homeId).eq("status", args.status)
        )
        .order("desc")
        .collect();
    } else {
      alerts = await ctx.db
        .query("vaultAlerts")
        .withIndex("by_home", (q: any) => q.eq("homeId", args.homeId))
        .order("desc")
        .collect();
    }

    const enriched = await Promise.all(
      alerts.map(async (alert) => {
        const [doc, system] = await Promise.all([
          ctx.db.get(alert.vaultDocumentId),
          alert.systemId ? ctx.db.get(alert.systemId) : null,
        ]);
        return {
          ...alert,
          document: doc ? { title: doc.title, docType: doc.docType } : null,
          system: system ? { name: system.name } : null,
        };
      })
    );
    return enriched;
  },
});

export const getAlertCount = query({
  args: { homeId: v.id("homes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;
    const alerts = await ctx.db
      .query("vaultAlerts")
      .withIndex("by_home_and_status", (q: any) =>
        q.eq("homeId", args.homeId).eq("status", "active")
      )
      .collect();
    return alerts.length;
  },
});

export const dismissAlert = mutation({
  args: { alertId: v.id("vaultAlerts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.patch(args.alertId, { status: "dismissed" });
  },
});

export const resolveAlert = mutation({
  args: { alertId: v.id("vaultAlerts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.patch(args.alertId, { status: "resolved" });
  },
});
