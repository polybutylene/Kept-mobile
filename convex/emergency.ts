import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const EMERGENCY_TRIAGE: Record<string, {
  immediateAction: string;
  doNot: string[];
  shutoffType: string;
  callOrder: string[];
  icon: string;
}> = {
  water: {
    immediateAction: "Shut off your water at the main shutoff valve immediately.",
    doNot: [
      "Do not use electrical appliances near standing water",
      "Do not ignore small leaks — they escalate fast",
    ],
    shutoffType: "water_main",
    callOrder: ["emergency_plumber", "water_utility"],
    icon: "💧",
  },
  hvac: {
    immediateAction: "Check your thermostat settings and breaker panel. If your system is making unusual noises or smells, turn it off at the thermostat.",
    doNot: [
      "Do not keep running a system that smells like burning",
      "Do not attempt to repair refrigerant lines yourself",
    ],
    shutoffType: "thermostat",
    callOrder: ["emergency_hvac"],
    icon: "❄️",
  },
  electrical: {
    immediateAction: "If you see sparks or smell burning, turn off the main breaker immediately. Do not touch any exposed wires.",
    doNot: [
      "Do not touch exposed wires or damaged outlets",
      "Do not use water near electrical hazards",
      "Do not flip breakers repeatedly if they keep tripping",
    ],
    shutoffType: "main_breaker",
    callOrder: ["911", "emergency_electrician"],
    icon: "⚡",
  },
  gas: {
    immediateAction: "LEAVE THE HOUSE IMMEDIATELY. Do not turn on/off any lights or switches. From outside, call 911 and your gas company.",
    doNot: [
      "Do NOT use your phone inside the house",
      "Do NOT turn on/off any lights or switches",
      "Do NOT start any vehicles in the garage",
      "Do NOT use any open flames",
    ],
    shutoffType: "gas_main",
    callOrder: ["911", "gas_company"],
    icon: "🔥",
  },
  other: {
    immediateAction: "Assess the situation. If anyone is in danger, call 911 first.",
    doNot: [],
    shutoffType: "varies",
    callOrder: ["911"],
    icon: "🏠",
  },
};

export const getEmergencyTriage = query({
  args: {
    emergencyType: v.string(),
    homeId: v.optional(v.id("homes")),
  },
  handler: async (ctx, args) => {
    const triage = EMERGENCY_TRIAGE[args.emergencyType] ?? EMERGENCY_TRIAGE.other;

    let shutoffLocations: Array<{
      type: string;
      location: string | null;
      instructions: string | null;
    }> = [];

    if (args.homeId) {
      const systems = await ctx.db
        .query("systems")
        .withIndex("by_home", (q) => q.eq("homeId", args.homeId!))
        .take(100);

      for (const sys of systems) {
        if (sys.locationInHome && sys.name?.toLowerCase().includes("shutoff")) {
          shutoffLocations.push({
            type: sys.name,
            location: sys.locationInHome,
            instructions: sys.conditionNotes ?? null,
          });
        }
      }
    }

    return {
      ...triage,
      shutoffLocations,
      emergencyType: args.emergencyType,
    };
  },
});

export const getEmergencyContacts = query({
  args: { homeId: v.id("homes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("emergencyContacts")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .take(20);
  },
});

export const getShutoffLocations = query({
  args: { homeId: v.id("homes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("emergencyContacts")
      .withIndex("by_home_category", (q) =>
        q.eq("homeId", args.homeId).eq("category", "shutoff"),
      )
      .take(20);
  },
});

export const addEmergencyContact = mutation({
  args: {
    homeId: v.id("homes"),
    category: v.union(v.literal("trusted_pro"), v.literal("shutoff")),
    type: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
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

export const updateEmergencyContact = mutation({
  args: {
    contactId: v.id("emergencyContacts"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { contactId, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined),
    );
    await ctx.db.patch(contactId, {
      ...filtered,
      updatedAt: Date.now(),
    });
  },
});

export const deleteEmergencyContact = mutation({
  args: { contactId: v.id("emergencyContacts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.contactId);
  },
});
