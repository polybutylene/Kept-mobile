import { ServiceCallPrep } from "./types";
import { waterHeaterPreps } from "./waterHeater";
import { hvacPreps } from "./hvac";
import { plumbingPreps } from "./plumbing";
import { electricalPreps } from "./electrical";
import { appliancePreps } from "./appliances";

export type { ServiceCallPrep } from "./types";

const ALL_PREPS: ServiceCallPrep[] = [
  ...waterHeaterPreps,
  ...hvacPreps,
  ...plumbingPreps,
  ...electricalPreps,
  ...appliancePreps,
];

/**
 * Get service call prep data by issue slug
 */
export function getServiceCallPrep(issueSlug: string): ServiceCallPrep | null {
  return ALL_PREPS.find((p) => p.issueSlug === issueSlug) || null;
}

/**
 * Get the best-matching service call prep for a system category
 */
export function getServiceCallPrepForCategory(category: string): ServiceCallPrep | null {
  const normalized = category.toLowerCase();

  // Try direct match first
  const direct = ALL_PREPS.find((p) => p.issueSlug === `general_${normalized}`);
  if (direct) return direct;

  // Try by category
  const byCategory = ALL_PREPS.find((p) => p.systemCategory === normalized);
  if (byCategory) return byCategory;

  // Water heater specific matching
  if (normalized.includes("water_heater") || normalized.includes("water heater")) {
    return ALL_PREPS.find((p) => p.issueSlug === "general_water_heater") || null;
  }

  // HVAC specific matching
  if (["ac", "air_conditioner", "heat_pump", "furnace", "air_handler"].some(k => normalized.includes(k))) {
    return ALL_PREPS.find((p) => p.issueSlug === "general_hvac") || null;
  }

  return null;
}
