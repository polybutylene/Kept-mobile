import { internalMutation } from "../_generated/server";

const systemCategories = [
  {
    key: "hvac",
    name: "HVAC",
    description: "Heating, ventilation, air conditioning, and indoor air quality systems",
    icon: "thermometer",
    sortOrder: 1,
    subsystems: ["cooling", "heating", "ventilation", "air_quality", "ductwork", "controls"],
  },
  {
    key: "plumbing",
    name: "Plumbing",
    description: "Water supply, drain/waste/vent, fixtures, and water treatment systems",
    icon: "droplets",
    sortOrder: 2,
    subsystems: ["water_supply", "dwv", "fixtures", "water_treatment", "gas_piping"],
  },
  {
    key: "water_heating",
    name: "Water Heating",
    description: "Domestic hot water production and distribution systems",
    icon: "flame",
    sortOrder: 3,
    subsystems: ["tank", "tankless", "heat_pump", "solar_thermal", "recirculation"],
  },
  {
    key: "electrical",
    name: "Electrical",
    description: "Power distribution, wiring, lighting, and surge protection",
    icon: "zap",
    sortOrder: 4,
    subsystems: ["service_panel", "wiring", "lighting", "outlets_switches", "surge_protection", "backup_power"],
  },
  {
    key: "roofing",
    name: "Roofing",
    description: "Roof coverings, flashing, gutters, and attic ventilation",
    icon: "home",
    sortOrder: 5,
    subsystems: ["covering", "flashing_sealants", "gutters_downspouts", "ventilation", "structure"],
  },
  {
    key: "exterior",
    name: "Exterior & Envelope",
    description: "Siding, windows, doors, paint, decking, and building envelope",
    icon: "building",
    sortOrder: 6,
    subsystems: ["siding", "windows", "doors", "paint_coatings", "decking_porches", "fencing"],
  },
  {
    key: "foundation",
    name: "Foundation & Structure",
    description: "Foundation, framing, insulation, and crawlspace/basement systems",
    icon: "layers",
    sortOrder: 7,
    subsystems: ["foundation", "framing", "insulation", "crawlspace", "basement", "moisture_barrier"],
  },
  {
    key: "appliances",
    name: "Appliances",
    description: "Kitchen, laundry, and utility appliances",
    icon: "refrigerator",
    sortOrder: 8,
    subsystems: ["kitchen", "laundry", "utility"],
  },
  {
    key: "garage",
    name: "Garage",
    description: "Garage doors, openers, flooring, and storage systems",
    icon: "warehouse",
    sortOrder: 9,
    subsystems: ["doors", "openers", "flooring"],
  },
  {
    key: "fire_safety",
    name: "Fire & Life Safety",
    description: "Smoke detectors, CO detectors, fire extinguishers, and sprinkler systems",
    icon: "shield-alert",
    sortOrder: 10,
    subsystems: ["smoke_detection", "co_detection", "extinguishers", "sprinklers"],
  },
  {
    key: "security",
    name: "Security",
    description: "Locks, alarm systems, cameras, and access control",
    icon: "lock",
    sortOrder: 11,
    subsystems: ["locks", "alarm", "cameras", "access_control"],
  },
  {
    key: "pool_spa",
    name: "Pool & Spa",
    description: "Pool and spa pumps, heaters, filters, surfaces, and automation",
    icon: "waves",
    sortOrder: 12,
    subsystems: ["pumps_motors", "heating", "filtration", "surfaces", "automation", "safety"],
  },
  {
    key: "irrigation",
    name: "Irrigation & Landscaping",
    description: "Sprinkler systems, drainage, hardscaping, and retaining walls",
    icon: "sprout",
    sortOrder: 13,
    subsystems: ["sprinklers", "drainage", "hardscaping", "retaining_walls"],
  },
  {
    key: "septic_well",
    name: "Septic & Well",
    description: "Septic tanks, drain fields, well pumps, and pressure tanks",
    icon: "cylinder",
    sortOrder: 14,
    subsystems: ["septic", "well", "pressure_system"],
  },
  {
    key: "solar_renewable",
    name: "Solar & Renewable Energy",
    description: "Solar panels, inverters, battery storage, and EV charging",
    icon: "sun",
    sortOrder: 15,
    subsystems: ["solar_panels", "inverters", "battery_storage", "ev_charging"],
  },
  {
    key: "smart_home",
    name: "Smart Home",
    description: "Smart thermostats, hubs, automated systems, and connected devices",
    icon: "wifi",
    sortOrder: 16,
    subsystems: ["thermostats", "hubs", "sensors", "automation"],
  },
];

export const seed = internalMutation({
  handler: async (ctx) => {
    for (const cat of systemCategories) {
      const existing = await ctx.db
        .query("systemCategories")
        .withIndex("by_key", (q) => q.eq("key", cat.key))
        .first();
      if (!existing) {
        await ctx.db.insert("systemCategories", cat);
      }
    }
    console.log(`Seeded ${systemCategories.length} system categories`);
  },
});
