import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const contactCategory = v.union(v.literal("trusted_pro"), v.literal("shutoff"));

async function requireHomeAccess(ctx: any, homeId: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const profile = await ctx.db
    .query("userProfiles")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .first();
  if (!profile) throw new Error("Profile not found");
  const home = await ctx.db.get(homeId);
  if (!home || home.ownerId !== profile._id) throw new Error("Not authorized");
  return { profile, home };
}

export const getContactsForHome = query({
  args: { homeId: v.id("homes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!profile) return [];
    const home = await ctx.db.get(args.homeId);
    if (!home || home.ownerId !== profile._id) return [];

    return await ctx.db
      .query("emergencyContacts")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .collect();
  },
});

export const addContact = mutation({
  args: {
    homeId: v.id("homes"),
    category: contactCategory,
    type: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireHomeAccess(ctx, args.homeId);
    return await ctx.db.insert("emergencyContacts", {
      homeId: args.homeId,
      category: args.category,
      type: args.type,
      name: args.name,
      phone: args.phone,
      location: args.location,
      createdAt: Date.now(),
    });
  },
});

export const updateContact = mutation({
  args: {
    contactId: v.id("emergencyContacts"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const contact = await ctx.db.get(args.contactId);
    if (!contact) throw new Error("Contact not found");
    await requireHomeAccess(ctx, contact.homeId);

    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.phone !== undefined) updates.phone = args.phone;
    if (args.location !== undefined) updates.location = args.location;

    await ctx.db.patch(args.contactId, updates);
  },
});

export const removeContact = mutation({
  args: { contactId: v.id("emergencyContacts") },
  handler: async (ctx, args) => {
    const contact = await ctx.db.get(args.contactId);
    if (!contact) throw new Error("Contact not found");
    await requireHomeAccess(ctx, contact.homeId);
    await ctx.db.delete(args.contactId);
  },
});

export const batchSave = mutation({
  args: {
    homeId: v.id("homes"),
    contacts: v.array(
      v.object({
        category: contactCategory,
        type: v.string(),
        name: v.string(),
        phone: v.optional(v.string()),
        location: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    await requireHomeAccess(ctx, args.homeId);
    const now = Date.now();

    const existing = await ctx.db
      .query("emergencyContacts")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .collect();

    for (const entry of args.contacts) {
      const match = existing.find(
        (e) => e.category === entry.category && e.type === entry.type
      );
      if (match) {
        await ctx.db.patch(match._id, {
          name: entry.name,
          phone: entry.phone,
          location: entry.location,
          updatedAt: now,
        });
      } else {
        await ctx.db.insert("emergencyContacts", {
          homeId: args.homeId,
          category: entry.category,
          type: entry.type,
          name: entry.name,
          phone: entry.phone,
          location: entry.location,
          createdAt: now,
        });
      }
    }
  },
});
