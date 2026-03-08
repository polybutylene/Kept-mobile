/**
 * Seasonal Campaign Definitions
 * 
 * Four seasonal campaigns per year aligned with actual home maintenance needs.
 * Each campaign has a checklist of actions, HP values, and bonus for completion.
 */

import { getRegionalSeasons } from "./climateZones";

export type CampaignType = "spring" | "summer" | "fall" | "winter";

export interface CampaignChecklistItem {
  id: string;
  description: string;
  hpValue: number;
  systemCategory?: string;
  taskKeywords?: string[];
  instructions?: string;
  articleSlugs?: string[];
}

export interface CampaignDefinition {
  type: CampaignType;
  name: string;
  theme: string;
  color: string;
  colorClass: string;
  icon: string;
  startMonth: number; // 1-12
  startDay: number;
  endMonth: number;
  endDay: number;
  whyItMatters: string;
  checklist: CampaignChecklistItem[];
  completionBonusHP: number;
  badgeText: string;
}

/**
 * Seasonal Campaign Definitions
 */
export const CAMPAIGN_DEFINITIONS: CampaignDefinition[] = [
  {
    type: "spring",
    name: "Spring Readiness",
    theme: "Recover from winter, prepare for storms",
    color: "#86EFAC",
    colorClass: "green-300",
    icon: "Flower2",
    startMonth: 3, // March
    startDay: 1,
    endMonth: 4, // April
    endDay: 30,
    whyItMatters: "Homes that complete spring prep have 68% fewer emergency AC calls in summer and catch roof damage before it becomes interior water damage.",
    checklist: [
      {
        id: "spring_roof",
        description: "Inspect roof for winter damage",
        hpValue: 100,
        systemCategory: "structural",
        taskKeywords: ["roof", "inspect", "shingle"],
        instructions: "Look for missing shingles, damaged flashing, and signs of leaks in the attic.",
        articleSlugs: ["how-to-inspect-your-roof-from-the-ground", "spring-maintenance-master-checklist"],
      },
      {
        id: "spring_gutters",
        description: "Clean gutters and downspouts",
        hpValue: 50,
        systemCategory: "exterior",
        taskKeywords: ["gutter", "downspout", "clean"],
        instructions: "Remove debris, check for proper drainage, and ensure downspouts direct water away from foundation.",
        articleSlugs: ["how-to-clean-and-inspect-your-gutters", "gutter-guards-types-costs-and-what-actually-works"],
      },
      {
        id: "spring_ac",
        description: "Service AC before summer demand",
        hpValue: 150,
        systemCategory: "hvac",
        taskKeywords: ["ac", "air conditioning", "hvac", "service", "tune"],
        instructions: "Schedule professional AC tune-up or clean filters, check refrigerant, and test cooling.",
        articleSlugs: ["pre-summer-ac-readiness-checklist", "hvac-annual-maintenance-checklist"],
      },
      {
        id: "spring_sump",
        description: "Check sump pump operation",
        hpValue: 75,
        systemCategory: "plumbing",
        taskKeywords: ["sump", "pump", "basement"],
        instructions: "Pour water into pit to test pump activation, check discharge line, test backup battery if equipped.",
        articleSlugs: ["plumbing-inspection-checklist-what-to-check-yearly"],
      },
      {
        id: "spring_exterior",
        description: "Inspect exterior for cracks/gaps",
        hpValue: 50,
        systemCategory: "exterior",
        taskKeywords: ["caulk", "seal", "exterior", "crack"],
        instructions: "Walk around home looking for foundation cracks, gaps around windows/doors, and damaged siding.",
        articleSlugs: ["how-to-check-your-homes-exterior-caulking-and-seals", "spring-exterior-maintenance-checklist"],
      },
    ],
    completionBonusHP: 200,
    badgeText: "Spring Ready",
  },
  {
    type: "summer",
    name: "Summer Readiness",
    theme: "Peak performance and efficiency",
    color: "#FDE047",
    colorClass: "yellow-300",
    icon: "Sun",
    startMonth: 6, // June
    startDay: 1,
    endMonth: 7, // July
    endDay: 31,
    whyItMatters: "Summer puts maximum stress on your cooling and water systems. A mid-year checkup prevents August breakdowns when every technician is booked.",
    checklist: [
      {
        id: "summer_filter",
        description: "Replace AC filters",
        hpValue: 25,
        systemCategory: "hvac",
        taskKeywords: ["filter", "ac", "hvac"],
        instructions: "Replace or clean HVAC filters. Check monthly during heavy use seasons.",
        articleSlugs: ["how-to-replace-your-hvac-air-filter", "summer-seasonal-maintenance-master-checklist"],
      },
      {
        id: "summer_fridge",
        description: "Check refrigerator coils and seals",
        hpValue: 50,
        systemCategory: "appliances",
        taskKeywords: ["refrigerator", "fridge", "coil", "seal"],
        instructions: "Clean condenser coils, check door seals, verify temperature settings.",
        articleSlugs: ["how-to-clean-your-refrigerator-coils", "kitchen-appliance-maintenance-checklist"],
      },
      {
        id: "summer_irrigation",
        description: "Inspect irrigation system",
        hpValue: 50,
        systemCategory: "exterior",
        taskKeywords: ["irrigation", "sprinkler", "water"],
        instructions: "Check for leaks, adjust spray patterns, verify timer settings.",
        articleSlugs: ["how-to-maintain-your-lawn-irrigation-system", "broken-irrigation-head-or-dry-zone"],
      },
      {
        id: "summer_detectors",
        description: "Test smoke and CO detectors",
        hpValue: 75,
        systemCategory: "electrical",
        taskKeywords: ["smoke", "detector", "carbon monoxide", "co", "alarm"],
        instructions: "Press test button on each detector, replace batteries if needed, check expiration dates.",
        articleSlugs: ["how-to-test-your-smoke-and-co-detectors", "electrical-safety-inspection-checklist"],
      },
      {
        id: "summer_water_heater",
        description: "Service water heater",
        hpValue: 100,
        systemCategory: "plumbing",
        taskKeywords: ["water heater", "flush", "anode"],
        instructions: "Flush sediment, check anode rod, test pressure relief valve.",
        articleSlugs: ["how-to-flush-your-water-heater-tank", "water-heater-annual-maintenance-checklist"],
      },
    ],
    completionBonusHP: 150,
    badgeText: "Summer Ready",
  },
  {
    type: "fall",
    name: "Fall Readiness",
    theme: "Prepare for heating season and freezing temps",
    color: "#FB923C",
    colorClass: "orange-400",
    icon: "Leaf",
    startMonth: 9, // September
    startDay: 1,
    endMonth: 10, // October
    endDay: 31,
    whyItMatters: "Homes completing Fall Readiness have 73% fewer emergency heating calls November through February. Frozen pipe claims drop to near zero.",
    checklist: [
      {
        id: "fall_heating",
        description: "Service heating system",
        hpValue: 150,
        systemCategory: "hvac",
        taskKeywords: ["furnace", "heating", "hvac", "service", "tune"],
        instructions: "Schedule professional furnace tune-up or replace filter, check ignition, test heating.",
        articleSlugs: ["hvac-annual-maintenance-checklist", "fall-seasonal-maintenance-checklist"],
      },
      {
        id: "fall_furnace_filter",
        description: "Replace furnace filter",
        hpValue: 25,
        systemCategory: "hvac",
        taskKeywords: ["furnace", "filter"],
        instructions: "Install fresh filter before heating season begins.",
        articleSlugs: ["how-to-replace-your-hvac-air-filter"],
      },
      {
        id: "fall_chimney",
        description: "Inspect/clean chimney if applicable",
        hpValue: 100,
        systemCategory: "hvac",
        taskKeywords: ["chimney", "fireplace", "flue", "sweep"],
        instructions: "Have chimney inspected and cleaned if you use fireplace or wood stove.",
        articleSlugs: ["fall-seasonal-maintenance-checklist"],
      },
      {
        id: "fall_pipes",
        description: "Check pipe insulation",
        hpValue: 75,
        systemCategory: "plumbing",
        taskKeywords: ["pipe", "insulation", "freeze"],
        instructions: "Insulate exposed pipes in unheated areas. Know where your main shut-off is located.",
        articleSlugs: ["how-to-insulate-exposed-pipes", "pre-freeze-plumbing-prep-checklist"],
      },
      {
        id: "fall_gutters",
        description: "Clear leaves from gutters and drains",
        hpValue: 50,
        systemCategory: "exterior",
        taskKeywords: ["gutter", "leaf", "drain", "clean"],
        instructions: "Remove fallen leaves, check for proper drainage before winter.",
        articleSlugs: ["how-to-clean-and-inspect-your-gutters", "fall-exterior-wrap-up-checklist"],
      },
      {
        id: "fall_thermostat",
        description: "Test thermostat and program for winter",
        hpValue: 25,
        systemCategory: "hvac",
        taskKeywords: ["thermostat", "program", "schedule"],
        instructions: "Test heating mode, set winter schedule, replace batteries if needed.",
        articleSlugs: ["how-to-change-your-thermostat-batteries-and-check-if-its-actually", "how-to-program-your-thermostat-for-energy-savings"],
      },
    ],
    completionBonusHP: 200,
    badgeText: "Fall Ready",
  },
  {
    type: "winter",
    name: "Winter Readiness",
    theme: "Protect against the cold, plan for spring",
    color: "#7DD3FC",
    colorClass: "sky-300",
    icon: "Snowflake",
    startMonth: 12, // December
    startDay: 1,
    endMonth: 1, // January (next year)
    endDay: 15,
    whyItMatters: "Winter is planning season. The actions you take now set up your entire year and help you budget accurately for what's ahead.",
    checklist: [
      {
        id: "winter_heating_check",
        description: "Confirm heating system operating efficiently",
        hpValue: 50,
        systemCategory: "hvac",
        taskKeywords: ["heating", "furnace", "check"],
        instructions: "Monitor heating performance, check for unusual sounds or smells, verify even heating.",
        articleSlugs: ["hvac-annual-maintenance-checklist", "winter-seasonal-maintenance-master-checklist"],
      },
      {
        id: "winter_weather_stripping",
        description: "Check weather stripping on doors/windows",
        hpValue: 50,
        systemCategory: "exterior",
        taskKeywords: ["weather", "stripping", "door", "window", "seal"],
        instructions: "Feel for drafts, replace worn weather stripping, check caulk around windows.",
        articleSlugs: ["how-to-check-your-homes-exterior-caulking-and-seals", "winter-seasonal-maintenance-master-checklist"],
      },
      {
        id: "winter_shutoff",
        description: "Know your water shutoff location",
        hpValue: 25,
        systemCategory: "plumbing",
        taskKeywords: ["shutoff", "valve", "water", "main"],
        instructions: "Locate and test main water shutoff. Know how to turn it off quickly in emergency.",
        articleSlugs: ["how-to-shut-off-your-water-main-and-individual", "emergency-shut-off-guide-water-gas-and-electrical"],
      },
      {
        id: "winter_forecast",
        description: "Review 12-month forecast and set budget goals",
        hpValue: 100,
        taskKeywords: ["forecast", "budget", "plan"],
        instructions: "Review your Kept forecast, identify upcoming replacements, set savings goals.",
        articleSlugs: ["the-true-cost-of-homeownership-budgeting-for-maintenance"],
      },
      {
        id: "winter_warranties",
        description: "Document any system warranties expiring this year",
        hpValue: 50,
        taskKeywords: ["warranty", "document", "expir"],
        instructions: "Check warranty dates, note which systems may need attention before coverage ends.",
        articleSlugs: ["moving-out-selling-your-home-maintenance-documentation"],
      },
    ],
    completionBonusHP: 100,
    badgeText: "Winter Ready",
  },
];

/**
 * Get campaign definition by type
 */
export function getCampaignDefinition(type: CampaignType): CampaignDefinition {
  const campaign = CAMPAIGN_DEFINITIONS.find(c => c.type === type);
  if (!campaign) throw new Error(`Unknown campaign type: ${type}`);
  return campaign;
}

export type CampaignPhase = "pre_season" | "active" | "mid_season" | "closing" | "off_season";

export interface CampaignStatus {
  campaign: CampaignDefinition;
  phase: CampaignPhase;
  daysRemaining: number;
  daysUntilStart: number;
  totalAvailableHP: number;
}

/**
 * Derive the start and end dates of a campaign for the given climate zone.
 * Uses the zone's regional season months to determine the window,
 * falling back to the campaign's hardcoded dates if no zone is provided.
 */
function getCampaignWindow(
  campaign: CampaignDefinition,
  climateZoneId?: string | null,
  referenceDate?: Date
) {
  const now = referenceDate ?? new Date();
  const year = now.getFullYear();

  let startMonth = campaign.startMonth;
  let endMonth = campaign.endMonth;

  if (climateZoneId) {
    const seasons = getRegionalSeasons(climateZoneId);
    const seasonMonths: number[] = seasons[campaign.type] ?? [];
    if (seasonMonths.length > 0) {
      startMonth = seasonMonths[0];
      endMonth = seasonMonths[seasonMonths.length - 1];
    }
  }

  let startDate = new Date(year, startMonth - 1, campaign.startDay);
  const wraps = startMonth > endMonth;
  let endDate = new Date(wraps ? year + 1 : year, endMonth - 1, campaign.endDay, 23, 59, 59);

  // If the window has already fully passed, shift to next year
  if (endDate < now && !wraps) {
    startDate = new Date(year + 1, startMonth - 1, campaign.startDay);
    endDate = new Date(year + 1, endMonth - 1, campaign.endDay, 23, 59, 59);
  }

  return { startDate, endDate };
}

/**
 * Get the currently active campaign (if any), factoring in the user's climate zone.
 */
export function getActiveCampaignType(climateZoneId?: string | null): CampaignType | null {
  const now = new Date();
  for (const campaign of CAMPAIGN_DEFINITIONS) {
    const { startDate, endDate } = getCampaignWindow(campaign, climateZoneId, now);
    if (now >= startDate && now <= endDate) {
      return campaign.type;
    }
  }
  return null;
}

/**
 * Get full campaign status with phase, timing, and HP info.
 */
export function getCampaignStatus(climateZoneId?: string | null): CampaignStatus | null {
  const now = new Date();
  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  // Check for active campaign first
  for (const campaign of CAMPAIGN_DEFINITIONS) {
    const { startDate, endDate } = getCampaignWindow(campaign, climateZoneId, now);

    if (now >= startDate && now <= endDate) {
      const totalDuration = (endDate.getTime() - startDate.getTime()) / MS_PER_DAY;
      const elapsed = (now.getTime() - startDate.getTime()) / MS_PER_DAY;
      const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / MS_PER_DAY);

      let phase: CampaignPhase = "active";
      if (daysRemaining <= 14) phase = "closing";
      else if (elapsed > totalDuration * 0.5) phase = "mid_season";

      return {
        campaign,
        phase,
        daysRemaining,
        daysUntilStart: 0,
        totalAvailableHP: calculateCampaignMaxHP(campaign),
      };
    }

    // Pre-season check: within 14 days before start
    const daysUntilStart = Math.ceil((startDate.getTime() - now.getTime()) / MS_PER_DAY);
    if (daysUntilStart > 0 && daysUntilStart <= 14) {
      return {
        campaign,
        phase: "pre_season",
        daysRemaining: 0,
        daysUntilStart,
        totalAvailableHP: calculateCampaignMaxHP(campaign),
      };
    }
  }

  // Find next upcoming campaign
  let nearestCampaign: CampaignDefinition | null = null;
  let nearestDays = Infinity;

  for (const campaign of CAMPAIGN_DEFINITIONS) {
    const { startDate } = getCampaignWindow(campaign, climateZoneId, now);
    const daysUntil = Math.ceil((startDate.getTime() - now.getTime()) / MS_PER_DAY);
    if (daysUntil > 0 && daysUntil < nearestDays) {
      nearestDays = daysUntil;
      nearestCampaign = campaign;
    }
  }

  if (nearestCampaign) {
    return {
      campaign: nearestCampaign,
      phase: "off_season",
      daysRemaining: 0,
      daysUntilStart: nearestDays,
      totalAvailableHP: calculateCampaignMaxHP(nearestCampaign),
    };
  }

  return null;
}

/**
 * Get next upcoming campaign
 */
export function getNextCampaign(climateZoneId?: string | null): { campaign: CampaignDefinition; startsIn: number } | null {
  const now = new Date();

  let nearestCampaign: CampaignDefinition | null = null;
  let nearestDays = Infinity;

  for (const campaign of CAMPAIGN_DEFINITIONS) {
    const { startDate } = getCampaignWindow(campaign, climateZoneId, now);
    const daysUntil = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil > 0 && daysUntil < nearestDays) {
      nearestDays = daysUntil;
      nearestCampaign = campaign;
    }
  }

  if (nearestCampaign) {
    return { campaign: nearestCampaign, startsIn: nearestDays };
  }

  return null;
}

/**
 * Calculate campaign end date for a given year
 */
export function getCampaignEndDate(campaign: CampaignDefinition, year: number): Date {
  // Handle year wrap for winter campaign
  const endYear = campaign.startMonth > campaign.endMonth ? year + 1 : year;
  return new Date(endYear, campaign.endMonth - 1, campaign.endDay, 23, 59, 59);
}

/**
 * Generate campaign ID for a given type and year
 */
export function generateCampaignId(type: CampaignType, year: number): string {
  return `${type}_${year}`;
}

/**
 * Calculate total possible HP for a campaign
 */
export function calculateCampaignMaxHP(campaign: CampaignDefinition): number {
  const checklistHP = campaign.checklist.reduce((sum, item) => sum + item.hpValue, 0);
  return checklistHP + campaign.completionBonusHP;
}
