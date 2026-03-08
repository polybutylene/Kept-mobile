/**
 * Safety Boundaries — DIY-safe vs pro-only classification
 *
 * Used by the AI prompt and the updateDiagnosis mutation to ensure
 * homeowners are never guided through work that requires a licensed pro.
 */

export interface SafetyRule {
  category: string;
  keywords: string[];
  isDiyAppropriate: boolean;
  reason?: string;
}

export interface EmergencyRule {
  keywords: string[];
  instruction: string;
}

// ============================================================
// Emergency rules — these bypass all other logic
// ============================================================

export const EMERGENCY_RULES: EmergencyRule[] = [
  {
    keywords: ["gas smell", "smell gas", "gas leak", "rotten egg", "sulfur smell"],
    instruction: "STOP — Leave the house immediately. Do NOT flip any switches, light matches, or use your phone inside. Once outside, call 911 or your gas company's emergency line. Do not re-enter until cleared by a professional.",
  },
  {
    keywords: ["sparking", "electrical fire", "smoke from outlet", "burning smell electrical", "arcing"],
    instruction: "STOP — If safe to do so, turn off the breaker for that circuit. Do not touch the sparking outlet or device. If there is active fire or smoke, leave the house and call 911.",
  },
  {
    keywords: ["flooding", "burst pipe", "water gushing", "water spraying", "major leak"],
    instruction: "First — turn off the main water shutoff valve to stop the flow. It's usually near the meter or where the water line enters the house. Then call a plumber for emergency service. Move valuables away from the water if safe.",
  },
  {
    keywords: ["carbon monoxide", "co detector", "co alarm", "co2 alarm"],
    instruction: "STOP — Leave the house immediately with all people and pets. Call 911 from outside. Do not re-enter until emergency services have cleared the home. Carbon monoxide is odorless and lethal.",
  },
  {
    keywords: ["sewage backup", "sewage in house", "sewage smell coming up"],
    instruction: "Do not use any water fixtures (toilets, sinks, showers). Open windows for ventilation. Call a plumber for emergency service. Sewage backup is a health hazard — avoid contact with the water.",
  },
];

// ============================================================
// Pro-only rules — NEVER guide DIY for these
// ============================================================

export const PRO_ONLY_RULES: SafetyRule[] = [
  {
    category: "gas",
    keywords: ["gas line", "gas valve", "gas pipe", "gas connection", "gas leak repair", "gas appliance installation"],
    isDiyAppropriate: false,
    reason: "Gas work requires a licensed technician. Improper gas work can cause explosions, fires, or carbon monoxide poisoning.",
  },
  {
    category: "electrical_panel",
    keywords: ["electrical panel", "breaker panel", "main panel", "subpanel", "service entrance", "meter base", "200 amp", "electrical service"],
    isDiyAppropriate: false,
    reason: "Electrical panel work involves lethal voltages. This must be done by a licensed electrician with permits.",
  },
  {
    category: "refrigerant",
    keywords: ["refrigerant", "freon", "r-410a", "r-22", "recharge ac", "add freon", "low refrigerant"],
    isDiyAppropriate: false,
    reason: "Handling refrigerant requires EPA Section 608 certification. It's also illegal for unlicensed individuals to purchase or handle it.",
  },
  {
    category: "main_sewer",
    keywords: ["main sewer", "sewer line", "main drain", "main line clog", "sewer backup", "tree roots in pipe"],
    isDiyAppropriate: false,
    reason: "Main sewer line work requires specialized equipment (hydro-jetting, camera inspection) and professional expertise.",
  },
  {
    category: "structural",
    keywords: ["foundation", "foundation crack", "load bearing wall", "roof structure", "roof truss", "structural beam", "joist", "sinking foundation"],
    isDiyAppropriate: false,
    reason: "Structural work affects the integrity of your home. It requires engineering assessment and licensed contractors.",
  },
  {
    category: "roof",
    keywords: ["roof repair", "roof leak repair", "shingle replacement", "roof penetration", "flashing repair"],
    isDiyAppropriate: false,
    reason: "Roof work involves fall risk and waterproofing expertise. Improper repairs often make leaks worse.",
  },
  {
    category: "hvac_install",
    keywords: ["install ac", "install furnace", "install heat pump", "ductwork modification", "duct replacement"],
    isDiyAppropriate: false,
    reason: "HVAC installation requires proper sizing, refrigerant handling, and electrical work. Permits are required.",
  },
  {
    category: "water_heater_install",
    keywords: ["install water heater", "replace water heater", "water heater installation"],
    isDiyAppropriate: false,
    reason: "Water heater installation involves plumbing, electrical/gas connections, and code compliance. Permits are required.",
  },
];

// ============================================================
// DIY-safe rules — these are appropriate for guided DIY
// ============================================================

export const DIY_SAFE_RULES: SafetyRule[] = [
  {
    category: "water_heater_maintenance",
    keywords: ["flush water heater", "drain water heater", "sediment", "popping noise water heater", "no hot water", "pilot light", "reset water heater", "tp valve test", "anode rod inspection"],
    isDiyAppropriate: true,
  },
  {
    category: "hvac_filter",
    keywords: ["hvac filter", "air filter", "replace filter", "dirty filter", "change filter"],
    isDiyAppropriate: true,
  },
  {
    category: "hvac_maintenance",
    keywords: ["clean condenser", "clean coils", "drain line", "condensate drain", "thermostat setting", "thermostat battery", "ac not cooling filter"],
    isDiyAppropriate: true,
  },
  {
    category: "plumbing_drain",
    keywords: ["clogged drain", "slow drain", "clear drain", "plunger", "drain clog", "sink drain"],
    isDiyAppropriate: true,
  },
  {
    category: "plumbing_toilet",
    keywords: ["running toilet", "toilet flapper", "toilet won't stop running", "toilet handle", "toilet fill valve"],
    isDiyAppropriate: true,
  },
  {
    category: "plumbing_faucet",
    keywords: ["dripping faucet", "faucet leak", "faucet cartridge", "aerator", "low pressure faucet"],
    isDiyAppropriate: true,
  },
  {
    category: "electrical_reset",
    keywords: ["tripped breaker", "reset breaker", "gfci", "reset gfci", "outlet not working", "light not working"],
    isDiyAppropriate: true,
  },
  {
    category: "appliance_maintenance",
    keywords: ["dishwasher filter", "fridge filter", "dryer vent", "dryer lint", "garbage disposal", "washing machine filter"],
    isDiyAppropriate: true,
  },
];

/**
 * Check if symptoms indicate an emergency
 */
export function checkForEmergency(symptomText: string): EmergencyRule | null {
  const lower = symptomText.toLowerCase();
  for (const rule of EMERGENCY_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return rule;
    }
  }
  return null;
}

/**
 * Check if the issue is safe for DIY guidance
 */
export function assessDiySafety(symptomText: string): {
  isDiyAppropriate: boolean;
  reason?: string;
  matchedCategory?: string;
} {
  const lower = symptomText.toLowerCase();

  // Check pro-only rules first
  for (const rule of PRO_ONLY_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return {
        isDiyAppropriate: false,
        reason: rule.reason,
        matchedCategory: rule.category,
      };
    }
  }

  // Check DIY-safe rules
  for (const rule of DIY_SAFE_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return {
        isDiyAppropriate: true,
        matchedCategory: rule.category,
      };
    }
  }

  // Default: uncertain — let the AI decide based on context
  return { isDiyAppropriate: false, reason: "Unable to determine DIY safety from symptoms — recommend consulting a professional." };
}
