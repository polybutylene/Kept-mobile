export interface SeasonalCampaign {
  id: string;
  name: string;
  emoji: string;
  months: number[];
  description: string;
  taskIds: string[];
}

export const SEASONAL_CAMPAIGNS: Record<string, SeasonalCampaign> = {
  spring_maintenance: {
    id: "spring_maintenance",
    name: "Spring Maintenance",
    emoji: "🌱",
    months: [3, 4],
    description:
      "Get your home ready for the heat. Spring is your best window for inspections, cleaning, and sealing before the FL summer hits.",
    taskIds: [
      // HVAC
      "hvac_cac_004",
      "hvac_cac_001",
      "hvac_cac_002",
      "hvac_cac_003",
      "hvac_cac_008",
      // Roof
      "roof.visual_inspection",
      "roof.gutter_clean",
      // Exterior
      "exterior.pressure_wash",
      "exterior.siding_caulk_check",
      "exterior.window_seal_inspect",
      "exterior.deck_clean",
      "exterior.deck_stain_seal",
      // Plumbing
      "plumb_twh_001",
      "plumb_twh_002",
      "plumb_twh_003",
      // Interior
      "task.interior.granite.seal",
      "task.interior.shower_tile.recaulk",
      "task.interior.tile.reseal_grout",
      // Appliances
      "task.appliance.fridge.clean_coils",
      "task.appliance.washer.inspect_hoses",
      // Safety
      "task.safety.smoke.replace_batteries",
      // Landscape
      "task.landscape.irrigation.inspect_heads",
      "task.landscape.lawn.fertilize",
    ],
  },
  hurricane_prep: {
    id: "hurricane_prep",
    name: "Hurricane Prep",
    emoji: "🌀",
    months: [5, 6],
    description:
      "Hurricane season starts June 1st. Complete these tasks while everything is calm and contractors are available.",
    taskIds: [
      "plumb_msl_001",
      "plumb_msl_002",
      "task.landscape.trees.inspect_hazard",
      "task.safety.smoke.test_monthly",
      "task.safety.co.test_monthly",
      "electrical.generator_exercise_test",
      "electrical.generator_oil_change",
      "exterior.garage_opener_safety_test",
      "roof.post_storm_inspection",
      "task.landscape.trees.prune",
    ],
  },
  mid_summer_check: {
    id: "mid_summer_check",
    name: "Mid-Summer AC Check",
    emoji: "☀️",
    months: [7],
    description:
      "Your AC has been working hard for 3 months. A quick check now prevents a breakdown in the worst heat.",
    taskIds: [
      "hvac_cac_001",
      "hvac_cac_003",
      "hvac_cac_006",
      "task.appliance.fridge.clean_coils",
    ],
  },
  fall_winterization: {
    id: "fall_winterization",
    name: "Fall Prep",
    emoji: "🍂",
    months: [10, 11],
    description:
      "Prepare your home for cooler weather, freeze protection, and holiday hosting.",
    taskIds: [
      // HVAC
      "hvac_cac_001",
      "hvac_hp_003",
      "hvac_hp_004",
      "hvac_gf_002",
      "hvac_gf_006",
      // Roof
      "roof.visual_inspection",
      "roof.gutter_clean",
      // Exterior
      "exterior.door_weatherstrip_check",
      "exterior.window_seal_inspect",
      // Plumbing
      "plumb_twh_001",
      "plumb_msl_001",
      // Appliances
      "task.appliance.dryer.clean_vent_duct",
      // Safety
      "task.safety.smoke.replace_batteries",
      // Landscape
      "task.landscape.irrigation.winterize",
      "task.landscape.lawn.aerate",
    ],
  },
};

export function getCampaignForMonth(month: number): string | null {
  for (const [key, campaign] of Object.entries(SEASONAL_CAMPAIGNS)) {
    if (campaign.months.includes(month)) return key;
  }
  return null;
}

export function getSeasonForMonth(month: number): string {
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "fall";
  return "winter";
}
