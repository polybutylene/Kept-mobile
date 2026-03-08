import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const getAlerts = query({
  args: { homeId: v.id("homes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("weatherAdvisories")
      .withIndex("by_home_active", (q) => q.eq("homeId", args.homeId).eq("isActive", true))
      .collect();
  },
});

export const saveAdvisory = mutation({
  args: {
    homeId: v.id("homes"),
    type: v.string(),
    severity: v.union(
      v.literal("watch"),
      v.literal("warning"),
      v.literal("advisory")
    ),
    title: v.string(),
    description: v.string(),
    affectedSystems: v.array(v.string()),
    recommendedActions: v.array(v.string()),
    startsAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("weatherAdvisories", {
      ...args,
      isActive: true,
      fetchedAt: Date.now(),
    });
  },
});

export const deactivateExpired = mutation({
  args: { homeId: v.id("homes") },
  handler: async (ctx, args) => {
    const advisories = await ctx.db
      .query("weatherAdvisories")
      .withIndex("by_home_active", (q) => q.eq("homeId", args.homeId).eq("isActive", true))
      .collect();

    const now = Date.now();
    for (const advisory of advisories) {
      if (advisory.expiresAt && advisory.expiresAt < now) {
        await ctx.db.patch(advisory._id, { isActive: false });
      }
    }
  },
});

export const fetchAlerts = action({
  args: {
    homeId: v.id("homes"),
    latitude: v.number(),
    longitude: v.number(),
  },
  handler: async (ctx, args) => {
    // Fetch from NWS API (free, no key required)
    try {
      const response = await fetch(
        `https://api.weather.gov/alerts/active?point=${args.latitude},${args.longitude}`,
        {
          headers: {
            "User-Agent": "Kept Home Intelligence (contact@keptapp.com)",
            Accept: "application/geo+json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`NWS API error: ${response.status}`);
      }

      const data = await response.json();
      const features = data.features ?? [];

      // Map weather conditions to affected systems
      const weatherSystemMap: Record<string, { systems: string[]; actions: string[] }> = {
        "Freeze Warning": {
          systems: ["plumbing_main", "water_heater_tank", "well_pump"],
          actions: [
            "Insulate exposed pipes",
            "Disconnect outdoor hoses",
            "Set thermostat to at least 55°F",
            "Open cabinet doors under sinks",
          ],
        },
        "Winter Storm Warning": {
          systems: ["roof_shingle", "roof_metal", "plumbing_main", "hvac_furnace"],
          actions: [
            "Clear gutters and downspouts",
            "Check furnace filter",
            "Insulate pipes in unheated areas",
            "Stock emergency supplies",
          ],
        },
        "Hurricane Warning": {
          systems: ["roof_shingle", "roof_metal", "windows", "siding_vinyl", "garage_door"],
          actions: [
            "Secure loose outdoor items",
            "Board up or shutter windows",
            "Test sump pump",
            "Charge backup batteries",
            "Document home condition with photos",
          ],
        },
        "Severe Thunderstorm Warning": {
          systems: ["roof_shingle", "electrical_panel", "windows"],
          actions: [
            "Move vehicles to covered areas",
            "Unplug sensitive electronics",
            "Inspect roof after storm passes",
          ],
        },
        "Excessive Heat Warning": {
          systems: ["hvac_ac", "appliance_refrigerator"],
          actions: [
            "Check/replace AC filter",
            "Inspect refrigerant lines for ice",
            "Keep blinds closed during peak heat",
            "Ensure condenser unit has clearance",
          ],
        },
        "Flash Flood Warning": {
          systems: ["plumbing_main", "septic_system"],
          actions: [
            "Check sump pump operation",
            "Clear gutters and drains",
            "Inspect foundation for water entry",
            "Move valuables from basement",
          ],
        },
      };

      const advisories = [];
      for (const feature of features.slice(0, 5)) {
        const props = feature.properties;
        const event = props.event ?? "Unknown";
        const mapping = weatherSystemMap[event] ?? {
          systems: [],
          actions: ["Monitor conditions and take appropriate precautions"],
        };

        advisories.push({
          homeId: args.homeId,
          type: event,
          severity: mapSeverity(props.severity ?? "Minor"),
          title: event,
          description: props.headline ?? props.description?.substring(0, 300) ?? "",
          affectedSystems: mapping.systems,
          recommendedActions: mapping.actions,
          startsAt: props.onset ? new Date(props.onset).getTime() : undefined,
          expiresAt: props.expires ? new Date(props.expires).getTime() : undefined,
        });
      }

      // Save advisories via mutation
      for (const advisory of advisories) {
        await ctx.runMutation(api.weather.saveAdvisory, advisory);
      }

      return advisories;
    } catch (error) {
      console.error("Weather fetch error:", error);
      return [];
    }
  },
});

function mapSeverity(
  nwsSeverity: string
): "watch" | "warning" | "advisory" {
  switch (nwsSeverity.toLowerCase()) {
    case "extreme":
    case "severe":
      return "warning";
    case "moderate":
      return "watch";
    default:
      return "advisory";
  }
}
