/**
 * Regional Cost Multipliers — Kept Price Index (Feb 2026)
 *
 * Maps US states to equipment, labor, and combined cost multipliers.
 * Base = 1.0 (national average). Derived from metro/regional analysis.
 */

interface RegionalEntry {
  state: string;
  multiplier: number;
  laborMultiplier: number;
  partsMultiplier: number;
}

// Region-to-state mapping with Excel factors
const REGIONS: { states: string[]; equip: number; labor: number; combined: number }[] = [
  // Northeast — Boston/NYC/DC Metro
  { states: ["MA", "CT", "RI", "NY", "NJ", "DC", "MD"], equip: 1.05, labor: 1.35, combined: 1.20 },
  // Northeast — Rural/Suburban
  { states: ["ME", "NH", "VT", "PA", "DE"], equip: 1.00, labor: 1.15, combined: 1.08 },
  // Southeast — FL Panhandle/Gulf Coast
  { states: ["AL", "MS", "LA"], equip: 0.95, labor: 0.90, combined: 0.93 },
  // Southeast — Atlanta/Charlotte Metro (close to national avg)
  { states: ["GA", "NC", "SC", "TN", "VA", "WV", "KY"], equip: 0.98, labor: 1.00, combined: 0.99 },
  // Southeast — Miami/South FL
  { states: ["FL"], equip: 1.00, labor: 1.10, combined: 1.05 },
  // Midwest — Chicago/Minneapolis Metro
  { states: ["IL", "MN", "WI", "MI"], equip: 1.00, labor: 1.15, combined: 1.08 },
  // Midwest — Rural/Suburban
  { states: ["OH", "IN", "IA", "MO", "KS", "NE", "SD", "ND"], equip: 0.95, labor: 0.85, combined: 0.90 },
  // Southwest — Phoenix/Las Vegas
  { states: ["AZ", "NV", "NM"], equip: 0.98, labor: 0.95, combined: 0.97 },
  // Southwest — Dallas/Houston/San Antonio
  { states: ["TX", "OK", "AR"], equip: 0.95, labor: 0.90, combined: 0.93 },
  // Mountain West — Denver/Salt Lake
  { states: ["CO", "UT", "MT", "WY", "ID"], equip: 1.00, labor: 1.05, combined: 1.03 },
  // Pacific NW — Seattle/Portland
  { states: ["WA", "OR"], equip: 1.05, labor: 1.20, combined: 1.13 },
  // California — Bay Area (applied to whole state as blended)
  { states: ["CA"], equip: 1.05, labor: 1.35, combined: 1.20 },
  // Hawaii
  { states: ["HI"], equip: 1.25, labor: 1.40, combined: 1.33 },
  // Alaska
  { states: ["AK"], equip: 1.30, labor: 1.30, combined: 1.30 },
];

const CATEGORIES = ["hvac", "plumbing", "electrical", "appliances", "structural", "exterior"] as const;

export function getRegionalMultiplierSeedData(): RegionalEntry[] {
  const entries: RegionalEntry[] = [];
  for (const region of REGIONS) {
    for (const state of region.states) {
      entries.push({
        state,
        multiplier: region.combined,
        laborMultiplier: region.labor,
        partsMultiplier: region.equip,
      });
    }
  }
  return entries;
}

export const REGIONAL_CATEGORIES = CATEGORIES;
