import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const getReceipts = query({
  args: {
    homeId: v.id("homes"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("serviceReceipts")
      .withIndex("by_homeId", (q) => q.eq("homeId", args.homeId))
      .order("desc")
      .take(args.limit ?? 50);
  },
});

export const getReceiptsBySystem = query({
  args: { systemId: v.id("systems") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("serviceReceipts")
      .withIndex("by_systemId", (q) => q.eq("systemId", args.systemId))
      .order("desc")
      .take(50);
  },
});

export const getReceiptStats = query({
  args: {
    homeId: v.id("homes"),
    year: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const receipts = await ctx.db
      .query("serviceReceipts")
      .withIndex("by_homeId", (q) => q.eq("homeId", args.homeId))
      .take(500);

    const year = args.year ?? new Date().getFullYear();
    const startOfYear = new Date(year, 0, 1).getTime();
    const endOfYear = new Date(year, 11, 31, 23, 59, 59).getTime();

    const yearReceipts = receipts.filter(
      (r) => r.date >= startOfYear && r.date <= endOfYear,
    );

    const totalSpent = yearReceipts.reduce((s, r) => s + r.amount, 0);
    const taxDeductible = yearReceipts
      .filter((r) => r.isTaxDeductible)
      .reduce((s, r) => s + r.amount, 0);

    const byCategory: Record<string, number> = {};
    for (const r of yearReceipts) {
      byCategory[r.category] =
        (byCategory[r.category] ?? 0) + r.amount;
    }

    const byVendor: Record<string, { count: number; total: number }> =
      {};
    for (const r of yearReceipts) {
      if (!byVendor[r.vendor])
        byVendor[r.vendor] = { count: 0, total: 0 };
      byVendor[r.vendor].count++;
      byVendor[r.vendor].total += r.amount;
    }

    return {
      year,
      totalReceipts: yearReceipts.length,
      totalSpent: Math.round(totalSpent),
      taxDeductible: Math.round(taxDeductible),
      byCategory,
      topVendors: Object.entries(byVendor)
        .sort((a, b) => b[1].total - a[1].total)
        .slice(0, 5)
        .map(([name, data]) => ({ name, ...data })),
    };
  },
});

export const addReceipt = mutation({
  args: {
    homeId: v.id("homes"),
    systemId: v.optional(v.id("systems")),
    taskId: v.optional(v.id("scheduledMaintenance")),
    vendor: v.string(),
    description: v.string(),
    amount: v.number(),
    date: v.optional(v.number()),
    category: v.string(),
    receiptImageId: v.optional(v.id("_storage")),
    isTaxDeductible: v.optional(v.boolean()),
    taxCategory: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email!))
      .first();
    if (!user) throw new Error("User not found");

    const receiptId = await ctx.db.insert("serviceReceipts", {
      userId: user._id,
      homeId: args.homeId,
      systemId: args.systemId,
      taskId: args.taskId,
      vendor: args.vendor,
      description: args.description,
      amount: args.amount,
      date: args.date ?? Date.now(),
      category: args.category,
      receiptImageId: args.receiptImageId,
      isTaxDeductible: args.isTaxDeductible ?? false,
      taxCategory: args.taxCategory,
      createdAt: Date.now(),
    });

    await ctx.runMutation(internal.timeline.logEvent, {
      userId: user._id,
      homeId: args.homeId,
      systemId: args.systemId,
      eventType: "receipt_uploaded",
      title: `Receipt: ${args.vendor} — $${args.amount}`,
      description: args.description,
      icon: "🧾",
      color: "gray",
      linkedReceiptId: receiptId,
      cost: args.amount,
      costType: "service",
    });

    return receiptId;
  },
});

export const updateReceiptExtraction = mutation({
  args: {
    receiptId: v.id("serviceReceipts"),
    extractedData: v.object({
      invoiceNumber: v.optional(v.string()),
      vendorAddress: v.optional(v.string()),
      vendorPhone: v.optional(v.string()),
      lineItems: v.optional(
        v.array(
          v.object({ description: v.string(), amount: v.number() }),
        ),
      ),
      taxAmount: v.optional(v.number()),
      warrantyNotes: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.receiptId, {
      extractedData: args.extractedData,
    });
  },
});
