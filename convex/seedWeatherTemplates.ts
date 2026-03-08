import { mutation } from "./_generated/server";

export const seedWeatherTriggers = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("weatherTriggers").first();
    if (existing) {
      return { status: "already_seeded", triggers: 0, templates: 0 };
    }

    const triggers: Array<{
      name: string;
      description: string;
      triggerType: any;
      severity: any;
      applicableRegions: string[];
      applicableStates?: string[];
    }> = [
      { name: "Freeze Warning", description: "Temperatures dropping below 32°F within 24 hours", triggerType: "freeze_warning", severity: "warning", applicableRegions: ["3A", "3B", "4A", "4B", "4C", "5A", "5B", "6A", "6B", "7"] },
      { name: "Heat Wave", description: "Temperatures above 95°F for 3+ consecutive days", triggerType: "heat_wave", severity: "watch", applicableRegions: ["1A", "2A", "2B", "3A", "3B"] },
      { name: "Hurricane Watch", description: "Hurricane or tropical storm advisory issued", triggerType: "hurricane_watch", severity: "emergency", applicableRegions: ["1A", "2A", "3A"], applicableStates: ["FL", "TX", "LA", "MS", "AL", "GA", "SC", "NC"] },
      { name: "Heavy Rain", description: "Expected precipitation >2 inches in 24 hours", triggerType: "heavy_rain", severity: "watch", applicableRegions: ["1A", "2A", "3A", "4A", "4C"] },
      { name: "Hail Warning", description: "Hail advisory issued for the area", triggerType: "hail_warning", severity: "warning", applicableRegions: ["3A", "4A", "5A"], applicableStates: ["TX", "OK", "KS", "NE", "CO", "SD"] },
      { name: "Tornado Watch", description: "Tornado watch or warning issued", triggerType: "tornado_watch", severity: "emergency", applicableRegions: ["3A", "4A", "5A"] },
      { name: "Snow Storm", description: "Expected snowfall >6 inches", triggerType: "snow_storm", severity: "warning", applicableRegions: ["4A", "5A", "5B", "6A", "6B", "7"] },
      { name: "Ice Storm", description: "Freezing rain advisory with significant ice accumulation expected", triggerType: "ice_storm", severity: "warning", applicableRegions: ["3A", "4A", "5A", "6A"] },
      { name: "High Wind", description: "Sustained winds >50mph or gusts >70mph", triggerType: "high_wind", severity: "warning", applicableRegions: ["1A", "2A", "2B", "3A", "3B", "4A", "4B", "4C", "5A", "5B", "6A", "6B", "7"] },
      { name: "Flooding", description: "Flood watch or warning issued", triggerType: "flooding", severity: "warning", applicableRegions: ["1A", "2A", "3A", "4A", "4C"] },
      { name: "Drought", description: "Extended dry period affecting home landscape and foundation", triggerType: "drought", severity: "advisory", applicableRegions: ["2B", "3B", "4A"] },
      { name: "Wildfire Risk", description: "High fire danger with red flag warnings", triggerType: "wildfire_risk", severity: "emergency", applicableRegions: ["2B", "3B", "4B", "5B", "6B"], applicableStates: ["CA", "CO", "MT", "OR", "WA", "AZ", "NM"] },
      { name: "Extreme Cold", description: "Wind chill below 0°F", triggerType: "extreme_cold", severity: "warning", applicableRegions: ["5A", "5B", "6A", "6B", "7"] },
      { name: "Spring Thaw", description: "Rapid temperature increase after extended freeze period", triggerType: "spring_thaw", severity: "advisory", applicableRegions: ["4A", "5A", "5B", "6A", "6B", "7"] },
      { name: "Humidity Alert", description: "Sustained indoor humidity >80% risking mold growth", triggerType: "humidity_alert", severity: "advisory", applicableRegions: ["1A", "2A", "3A", "4C"] },
    ];

    const now = Date.now();
    const triggerIds: Record<string, any> = {};

    for (const t of triggers) {
      const id = await ctx.db.insert("weatherTriggers", {
        ...t,
        isActive: true,
      });
      triggerIds[t.triggerType] = id;
    }

    // ── Checklist Templates ──

    const templates: Array<{
      triggerType: string;
      title: string;
      description: string;
      preparationLeadDays: number;
      climateZones: string[];
      tasks: Array<{
        title: string;
        description: string;
        priority: "low" | "medium" | "high" | "urgent";
        category: string;
        estimatedMinutes: number;
        estimatedCost?: number;
        pointsValue: number;
        diyDifficulty: "easy" | "moderate" | "hard" | "professional";
        proTip?: string;
      }>;
    }> = [
      {
        triggerType: "freeze_warning",
        title: "Freeze Protection Checklist",
        description: "Protect your plumbing and home before temperatures drop below freezing",
        preparationLeadDays: 1,
        climateZones: ["3A", "3B", "4A", "4B", "4C", "5A", "5B", "6A", "6B", "7"],
        tasks: [
          { title: "Insulate exposed pipes", description: "Wrap foam insulation around any exposed pipes in crawl spaces, attics, and garages", priority: "urgent", category: "plumbing", estimatedMinutes: 15, estimatedCost: 15, pointsValue: 50, diyDifficulty: "easy", proTip: "From 80% of emergency plumbing calls I responded to for frozen pipes, the homeowner had exposed pipes in the crawl space they didn't know about." },
          { title: "Open cabinet doors under sinks", description: "Allow warm air to reach pipes on exterior walls", priority: "high", category: "plumbing", estimatedMinutes: 5, pointsValue: 20, diyDifficulty: "easy" },
          { title: "Set thermostats to minimum 55°F", description: "Never let indoor temperature drop below 55°F, even when away", priority: "high", category: "hvac", estimatedMinutes: 5, pointsValue: 20, diyDifficulty: "easy" },
          { title: "Disconnect and drain outdoor hoses", description: "Remove hoses from spigots and drain remaining water", priority: "high", category: "plumbing", estimatedMinutes: 15, pointsValue: 40, diyDifficulty: "easy" },
          { title: "Cover outdoor faucets", description: "Install insulated faucet covers on all exterior hose bibs", priority: "high", category: "plumbing", estimatedMinutes: 10, estimatedCost: 10, pointsValue: 30, diyDifficulty: "easy" },
          { title: "Check attic insulation", description: "Verify insulation is adequate in vulnerable areas above unheated spaces", priority: "medium", category: "insulation", estimatedMinutes: 20, pointsValue: 40, diyDifficulty: "moderate" },
        ],
      },
      {
        triggerType: "hurricane_watch",
        title: "Hurricane Preparation Checklist",
        description: "Secure your home and prepare for hurricane-force winds and flooding",
        preparationLeadDays: 3,
        climateZones: ["1A", "2A", "3A"],
        tasks: [
          { title: "Secure outdoor furniture and items", description: "Bring in or tie down all outdoor furniture, decorations, and loose items", priority: "urgent", category: "exterior", estimatedMinutes: 60, pointsValue: 80, diyDifficulty: "easy" },
          { title: "Install hurricane shutters or board windows", description: "Protect all windows with shutters or 5/8-inch plywood", priority: "urgent", category: "exterior", estimatedMinutes: 120, estimatedCost: 200, pointsValue: 150, diyDifficulty: "hard" },
          { title: "Fill bathtubs with water", description: "Fill bathtubs for flushing toilets if water service is interrupted", priority: "high", category: "plumbing", estimatedMinutes: 10, pointsValue: 30, diyDifficulty: "easy" },
          { title: "Test sump pump and backup battery", description: "Verify sump pump activates and backup battery is charged", priority: "high", category: "plumbing", estimatedMinutes: 15, pointsValue: 50, diyDifficulty: "moderate" },
          { title: "Document home systems with photos", description: "Photograph all major systems and rooms for insurance documentation", priority: "high", category: "general", estimatedMinutes: 30, pointsValue: 60, diyDifficulty: "easy" },
          { title: "Clear gutters and downspouts", description: "Ensure all drainage paths are clear for heavy rain", priority: "high", category: "exterior", estimatedMinutes: 45, pointsValue: 60, diyDifficulty: "moderate" },
          { title: "Trim overhanging tree branches", description: "Remove branches that could break and damage the home", priority: "high", category: "exterior", estimatedMinutes: 60, estimatedCost: 150, pointsValue: 80, diyDifficulty: "professional", proTip: "If branches are within 6 feet of your roof or power lines, call an arborist. One of the most common post-storm claims is tree damage to roofing." },
          { title: "Check roof for loose shingles", description: "Inspect and secure any loose shingles or flashing", priority: "high", category: "roofing", estimatedMinutes: 20, pointsValue: 50, diyDifficulty: "moderate" },
        ],
      },
      {
        triggerType: "heat_wave",
        title: "Heat Wave Preparation Checklist",
        description: "Keep your cooling system efficient and your home comfortable during extreme heat",
        preparationLeadDays: 1,
        climateZones: ["1A", "2A", "2B", "3A", "3B"],
        tasks: [
          { title: "Replace HVAC filters", description: "Install fresh filters to maximize airflow and cooling efficiency", priority: "high", category: "hvac", estimatedMinutes: 15, estimatedCost: 20, pointsValue: 40, diyDifficulty: "easy" },
          { title: "Clean condenser coils on outdoor AC unit", description: "Spray down the outdoor unit to remove debris and improve heat transfer", priority: "high", category: "hvac", estimatedMinutes: 30, pointsValue: 60, diyDifficulty: "moderate", proTip: "A dirty condenser can reduce AC efficiency by 30%. I've seen units fail in heat waves solely because the outdoor coils were caked with cottonwood fuzz." },
          { title: "Check thermostat programming", description: "Set a consistent schedule — don't turn AC off completely when away", priority: "medium", category: "hvac", estimatedMinutes: 10, pointsValue: 30, diyDifficulty: "easy" },
          { title: "Inspect weatherstripping", description: "Check seals on doors and windows to prevent cool air from escaping", priority: "medium", category: "exterior", estimatedMinutes: 20, estimatedCost: 15, pointsValue: 40, diyDifficulty: "easy" },
          { title: "Check attic ventilation", description: "Ensure attic vents and fans are clear and functioning to reduce heat buildup", priority: "medium", category: "insulation", estimatedMinutes: 15, pointsValue: 40, diyDifficulty: "moderate" },
          { title: "Set ceiling fans counterclockwise", description: "Counterclockwise rotation pushes air down for a cooling wind-chill effect", priority: "low", category: "electrical", estimatedMinutes: 5, pointsValue: 20, diyDifficulty: "easy" },
        ],
      },
      {
        triggerType: "heavy_rain",
        title: "Heavy Rain Preparation Checklist",
        description: "Prevent water intrusion and flooding damage before heavy rainfall",
        preparationLeadDays: 1,
        climateZones: ["1A", "2A", "3A", "4A", "4C"],
        tasks: [
          { title: "Clear gutters and downspouts", description: "Remove debris so water drains properly away from foundation", priority: "high", category: "exterior", estimatedMinutes: 30, pointsValue: 50, diyDifficulty: "moderate" },
          { title: "Test sump pump", description: "Pour water into pit to verify pump activates", priority: "high", category: "plumbing", estimatedMinutes: 10, pointsValue: 40, diyDifficulty: "easy" },
          { title: "Check window wells for debris", description: "Clear any leaves or dirt blocking basement window drainage", priority: "medium", category: "exterior", estimatedMinutes: 15, pointsValue: 30, diyDifficulty: "easy" },
          { title: "Verify downspout extensions", description: "Ensure downspouts direct water at least 4 feet from foundation", priority: "high", category: "exterior", estimatedMinutes: 15, estimatedCost: 20, pointsValue: 40, diyDifficulty: "easy" },
          { title: "Inspect basement for existing moisture", description: "Look for damp spots, efflorescence, or active leaks before rain arrives", priority: "medium", category: "foundation", estimatedMinutes: 15, pointsValue: 30, diyDifficulty: "easy" },
        ],
      },
      {
        triggerType: "tornado_watch",
        title: "Tornado Preparation Checklist",
        description: "Secure your home and identify shelter before severe storms arrive",
        preparationLeadDays: 0,
        climateZones: ["3A", "4A", "5A"],
        tasks: [
          { title: "Identify safe room or shelter", description: "Interior room on lowest floor, away from windows (bathroom, closet, basement)", priority: "urgent", category: "general", estimatedMinutes: 5, pointsValue: 40, diyDifficulty: "easy" },
          { title: "Secure loose outdoor items", description: "Bring in or anchor anything that could become a projectile", priority: "urgent", category: "exterior", estimatedMinutes: 20, pointsValue: 40, diyDifficulty: "easy" },
          { title: "Close and latch all windows and doors", description: "Sealed windows reduce wind damage if outer envelope is breached", priority: "high", category: "exterior", estimatedMinutes: 10, pointsValue: 30, diyDifficulty: "easy" },
          { title: "Photograph home exterior and major systems", description: "Quick documentation for insurance if damage occurs", priority: "high", category: "general", estimatedMinutes: 10, pointsValue: 30, diyDifficulty: "easy" },
          { title: "Charge devices and locate flashlights", description: "Prepare for potential power outage", priority: "high", category: "electrical", estimatedMinutes: 5, pointsValue: 20, diyDifficulty: "easy" },
        ],
      },
      {
        triggerType: "snow_storm",
        title: "Snow Storm Preparation Checklist",
        description: "Prepare your home for heavy snowfall and potential power outages",
        preparationLeadDays: 1,
        climateZones: ["4A", "5A", "5B", "6A", "6B", "7"],
        tasks: [
          { title: "Test heating system", description: "Verify furnace operates properly before storm arrives", priority: "urgent", category: "hvac", estimatedMinutes: 10, pointsValue: 40, diyDifficulty: "easy" },
          { title: "Insulate pipes in vulnerable areas", description: "Add insulation to pipes near exterior walls and in unheated spaces", priority: "high", category: "plumbing", estimatedMinutes: 20, estimatedCost: 15, pointsValue: 40, diyDifficulty: "easy" },
          { title: "Clear snow from roof vents", description: "After storm, ensure exhaust vents are not blocked by snow", priority: "high", category: "hvac", estimatedMinutes: 15, pointsValue: 30, diyDifficulty: "moderate" },
          { title: "Stock emergency supplies", description: "Water, flashlights, batteries, blankets for potential power outage", priority: "high", category: "general", estimatedMinutes: 30, estimatedCost: 50, pointsValue: 30, diyDifficulty: "easy" },
          { title: "Know your shut-off valves", description: "Locate water main, gas valve, and electrical panel", priority: "high", category: "plumbing", estimatedMinutes: 10, pointsValue: 30, diyDifficulty: "easy", proTip: "In 8 years of service calls, I can't count how many homeowners couldn't find their main water shutoff during a pipe burst. Label it now." },
        ],
      },
      {
        triggerType: "ice_storm",
        title: "Ice Storm Preparation Checklist",
        description: "Protect against ice damage to trees, power lines, and your home",
        preparationLeadDays: 1,
        climateZones: ["3A", "4A", "5A", "6A"],
        tasks: [
          { title: "Trim vulnerable tree branches", description: "Remove dead or overhanging branches that could snap under ice weight", priority: "high", category: "exterior", estimatedMinutes: 60, estimatedCost: 100, pointsValue: 60, diyDifficulty: "professional" },
          { title: "Stock de-icing supplies", description: "Have salt or calcium chloride ready for walkways and steps", priority: "high", category: "exterior", estimatedMinutes: 10, estimatedCost: 20, pointsValue: 20, diyDifficulty: "easy" },
          { title: "Test backup heating source", description: "Verify space heaters, fireplace, or generator are operational", priority: "high", category: "hvac", estimatedMinutes: 15, pointsValue: 40, diyDifficulty: "easy" },
          { title: "Insulate outdoor pipes and faucets", description: "Ice storms combine cold with moisture — double protection needed", priority: "urgent", category: "plumbing", estimatedMinutes: 15, estimatedCost: 15, pointsValue: 40, diyDifficulty: "easy" },
        ],
      },
      {
        triggerType: "high_wind",
        title: "High Wind Preparation Checklist",
        description: "Secure your home against damaging wind gusts",
        preparationLeadDays: 1,
        climateZones: ["1A", "2A", "2B", "3A", "3B", "4A", "4B", "4C", "5A", "5B", "6A", "6B", "7"],
        tasks: [
          { title: "Secure outdoor items", description: "Anchor or bring in patio furniture, trash cans, and decorations", priority: "urgent", category: "exterior", estimatedMinutes: 20, pointsValue: 40, diyDifficulty: "easy" },
          { title: "Inspect roof attachments", description: "Check that satellite dishes, antennas, and solar panels are secure", priority: "high", category: "roofing", estimatedMinutes: 15, pointsValue: 40, diyDifficulty: "moderate" },
          { title: "Close and lock all windows", description: "Latched windows resist pressure better than simply closed ones", priority: "high", category: "exterior", estimatedMinutes: 5, pointsValue: 20, diyDifficulty: "easy" },
          { title: "Park vehicles away from trees", description: "Reduce risk of branch damage to vehicles", priority: "medium", category: "general", estimatedMinutes: 5, pointsValue: 10, diyDifficulty: "easy" },
        ],
      },
      {
        triggerType: "flooding",
        title: "Flood Preparation Checklist",
        description: "Minimize water damage risk before flooding occurs",
        preparationLeadDays: 1,
        climateZones: ["1A", "2A", "3A", "4A", "4C"],
        tasks: [
          { title: "Test sump pump and backup", description: "Verify primary and battery backup sump pumps are working", priority: "urgent", category: "plumbing", estimatedMinutes: 15, pointsValue: 50, diyDifficulty: "easy" },
          { title: "Move valuables to higher ground", description: "Elevate electronics, documents, and irreplaceable items from ground floor or basement", priority: "urgent", category: "general", estimatedMinutes: 30, pointsValue: 40, diyDifficulty: "easy" },
          { title: "Clear floor drains", description: "Ensure basement floor drains are not blocked", priority: "high", category: "plumbing", estimatedMinutes: 10, pointsValue: 30, diyDifficulty: "easy" },
          { title: "Install check valve on sewer line", description: "Prevents sewage backflow during flooding", priority: "high", category: "plumbing", estimatedMinutes: 120, estimatedCost: 200, pointsValue: 80, diyDifficulty: "professional", proTip: "Sewage backflow during floods is one of the most expensive and disgusting cleanups I've seen. A $200 check valve can prevent $15,000 in damage." },
          { title: "Document home condition with photos", description: "Pre-flood documentation helps with insurance claims", priority: "high", category: "general", estimatedMinutes: 15, pointsValue: 30, diyDifficulty: "easy" },
        ],
      },
      {
        triggerType: "drought",
        title: "Drought Protection Checklist",
        description: "Protect your foundation and landscaping during extended dry periods",
        preparationLeadDays: 7,
        climateZones: ["2B", "3B", "4A"],
        tasks: [
          { title: "Water foundation perimeter", description: "Use soaker hose 18 inches from foundation to prevent soil shrinkage and cracking", priority: "high", category: "foundation", estimatedMinutes: 15, pointsValue: 50, diyDifficulty: "easy", proTip: "Foundation repair averages $4,000-$12,000. A $30 soaker hose running 20 minutes every few days during drought is the cheapest insurance you'll ever buy." },
          { title: "Check for foundation cracks", description: "Inspect interior and exterior for new or widening cracks", priority: "high", category: "foundation", estimatedMinutes: 20, pointsValue: 40, diyDifficulty: "easy" },
          { title: "Adjust irrigation schedule", description: "Water deeply but less frequently to encourage deep root growth", priority: "medium", category: "exterior", estimatedMinutes: 10, pointsValue: 20, diyDifficulty: "easy" },
          { title: "Mulch around foundation plantings", description: "3 inches of mulch retains moisture and reduces soil temperature", priority: "medium", category: "exterior", estimatedMinutes: 30, estimatedCost: 25, pointsValue: 30, diyDifficulty: "easy" },
        ],
      },
      {
        triggerType: "wildfire_risk",
        title: "Wildfire Defensible Space Checklist",
        description: "Create defensible space and reduce fire risk to your home",
        preparationLeadDays: 2,
        climateZones: ["2B", "3B", "4B", "5B", "6B"],
        tasks: [
          { title: "Clear vegetation within 5 feet of home", description: "Remove all dead plants, leaves, and flammable materials from Zone 0", priority: "urgent", category: "exterior", estimatedMinutes: 60, pointsValue: 80, diyDifficulty: "moderate" },
          { title: "Clean gutters of dry debris", description: "Remove leaves and pine needles that could ignite from embers", priority: "urgent", category: "exterior", estimatedMinutes: 30, pointsValue: 50, diyDifficulty: "moderate" },
          { title: "Close all windows and vents", description: "Prevent ember intrusion — consider mesh screens on vents", priority: "high", category: "exterior", estimatedMinutes: 15, pointsValue: 30, diyDifficulty: "easy" },
          { title: "Move propane tanks and firewood", description: "Relocate at least 30 feet from structures", priority: "urgent", category: "exterior", estimatedMinutes: 30, pointsValue: 40, diyDifficulty: "moderate" },
          { title: "Connect hoses and fill pools/tubs", description: "Have water sources ready for firefighter access if needed", priority: "high", category: "general", estimatedMinutes: 15, pointsValue: 30, diyDifficulty: "easy" },
        ],
      },
      {
        triggerType: "extreme_cold",
        title: "Extreme Cold Protection Checklist",
        description: "Protect your home systems from dangerously low temperatures and wind chill",
        preparationLeadDays: 1,
        climateZones: ["5A", "5B", "6A", "6B", "7"],
        tasks: [
          { title: "Run faucets at a trickle", description: "Keep water moving through pipes on exterior walls to prevent freezing", priority: "urgent", category: "plumbing", estimatedMinutes: 5, pointsValue: 30, diyDifficulty: "easy" },
          { title: "Wrap exposed pipes with heat tape", description: "Electric heat tape on vulnerable pipes provides active freeze protection", priority: "urgent", category: "plumbing", estimatedMinutes: 30, estimatedCost: 30, pointsValue: 50, diyDifficulty: "moderate" },
          { title: "Seal basement and crawl space openings", description: "Block cold air intrusion with foam board or weatherstripping", priority: "high", category: "insulation", estimatedMinutes: 30, estimatedCost: 20, pointsValue: 40, diyDifficulty: "moderate" },
          { title: "Check furnace operation", description: "Verify furnace is running efficiently — this is not the time for a breakdown", priority: "urgent", category: "hvac", estimatedMinutes: 10, pointsValue: 30, diyDifficulty: "easy" },
          { title: "Open kitchen and bathroom cabinets", description: "Let warm air circulate to pipes on exterior walls", priority: "high", category: "plumbing", estimatedMinutes: 5, pointsValue: 20, diyDifficulty: "easy" },
        ],
      },
      {
        triggerType: "spring_thaw",
        title: "Spring Thaw Monitoring Checklist",
        description: "Watch for damage as temperatures rise rapidly after a freeze",
        preparationLeadDays: 1,
        climateZones: ["4A", "5A", "5B", "6A", "6B", "7"],
        tasks: [
          { title: "Inspect foundation for frost heave cracks", description: "Rapid thaw can cause foundation movement — look for new cracks", priority: "high", category: "foundation", estimatedMinutes: 20, pointsValue: 50, diyDifficulty: "easy" },
          { title: "Check for ice dam damage on roof", description: "Look for water stains on ceilings and walls under eaves", priority: "high", category: "roofing", estimatedMinutes: 15, pointsValue: 40, diyDifficulty: "easy" },
          { title: "Test sump pump before ground thaw", description: "Snowmelt increases groundwater — verify sump pump is ready", priority: "high", category: "plumbing", estimatedMinutes: 10, pointsValue: 40, diyDifficulty: "easy" },
          { title: "Inspect pipes for freeze damage", description: "Look for bulging, cracked, or leaking pipes that may have frozen", priority: "urgent", category: "plumbing", estimatedMinutes: 20, pointsValue: 50, diyDifficulty: "easy", proTip: "Pipes can freeze and crack without leaking until they thaw. I've seen homes with no visible issues during a freeze that flooded the day it warmed up." },
        ],
      },
      {
        triggerType: "humidity_alert",
        title: "High Humidity Protection Checklist",
        description: "Prevent mold growth and moisture damage during sustained high humidity",
        preparationLeadDays: 1,
        climateZones: ["1A", "2A", "3A", "4C"],
        tasks: [
          { title: "Run dehumidifier in basement/crawl space", description: "Target 30-50% relative humidity to prevent mold growth", priority: "high", category: "hvac", estimatedMinutes: 10, pointsValue: 40, diyDifficulty: "easy" },
          { title: "Check bathroom exhaust fans", description: "Verify fans vent to the exterior, not the attic", priority: "high", category: "hvac", estimatedMinutes: 15, pointsValue: 30, diyDifficulty: "easy" },
          { title: "Inspect for mold in vulnerable areas", description: "Check behind toilets, under sinks, and in closets on exterior walls", priority: "high", category: "general", estimatedMinutes: 20, pointsValue: 40, diyDifficulty: "easy" },
          { title: "Clean AC drain line", description: "Clogged condensate drains cause overflow and water damage during high humidity", priority: "high", category: "hvac", estimatedMinutes: 15, pointsValue: 40, diyDifficulty: "moderate", proTip: "A clogged AC condensate line was the #1 cause of water damage calls I responded to in summer. A $2 cup of vinegar poured down the line monthly prevents it." },
        ],
      },
      {
        triggerType: "hail_warning",
        title: "Hail Preparation Checklist",
        description: "Protect vehicles and exterior surfaces before hail arrives",
        preparationLeadDays: 0,
        climateZones: ["3A", "4A", "5A"],
        tasks: [
          { title: "Move vehicles to covered parking", description: "Garage or covered structure protects against hail damage", priority: "urgent", category: "general", estimatedMinutes: 5, pointsValue: 30, diyDifficulty: "easy" },
          { title: "Cover exposed outdoor equipment", description: "Protect AC condenser, grill, and other outdoor equipment with heavy blankets or covers", priority: "high", category: "exterior", estimatedMinutes: 15, estimatedCost: 20, pointsValue: 30, diyDifficulty: "easy" },
          { title: "Document roof condition pre-storm", description: "Photograph roof from ground level for insurance baseline", priority: "high", category: "roofing", estimatedMinutes: 10, pointsValue: 30, diyDifficulty: "easy" },
          { title: "Close window blinds and curtains", description: "Provides secondary protection if a window is broken by hail", priority: "medium", category: "exterior", estimatedMinutes: 5, pointsValue: 10, diyDifficulty: "easy" },
        ],
      },
    ];

    let templateCount = 0;
    for (const t of templates) {
      const triggerId = triggerIds[t.triggerType];
      if (!triggerId) continue;

      await ctx.db.insert("weatherChecklistTemplates", {
        triggerId,
        triggerType: t.triggerType,
        title: t.title,
        description: t.description,
        tasks: t.tasks,
        preparationLeadDays: t.preparationLeadDays,
        climateZones: t.climateZones,
        createdAt: now,
      });
      templateCount++;
    }

    return { status: "seeded", triggers: triggers.length, templates: templateCount };
  },
});
