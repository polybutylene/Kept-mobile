/**
 * HP Tier Definitions and Requirements
 * 
 * Tiers are based on HP thresholds AND specific requirements.
 * Users must meet BOTH the HP threshold and the requirements to achieve a tier.
 */

import { Id } from "../_generated/dataModel";

export type HPTier = "aware" | "stable" | "protected" | "optimized" | "exemplary";

export interface TierDefinition {
  id: HPTier;
  name: string;
  displayName: string;
  minHP: number;
  maxHP: number | null; // null for exemplary (no upper limit)
  color: string;
  colorClass: string;
  icon: string;
  statusMessage: string;
  description: string;
  requirements: TierRequirement[];
  unlockedFeatures: string[];
}

export interface TierRequirement {
  id: string;
  description: string;
  shortDescription: string;
}

export interface TierRequirementStatus {
  majorSystemsDocumented: boolean;
  noSystemsCritical: boolean;
  allInstallDatesSet: boolean;
  maintenanceCurrent: boolean;
  budgetFundedPercent: number;
  campaignsCompleted: number;
  streakDaysWithoutLapse: number;
}

/**
 * Tier definitions with HP thresholds, requirements, and features
 */
export const TIER_DEFINITIONS: TierDefinition[] = [
  {
    id: "aware",
    name: "AWARE",
    displayName: "Aware",
    minHP: 0,
    maxHP: 499,
    color: "#6B7280",
    colorClass: "gray-500",
    icon: "Sprout",
    statusMessage: "Getting started",
    description: "You've taken the first step. Document your home's systems to understand what you're working with.",
    requirements: [
      { id: "has_home", description: "Add at least one home", shortDescription: "Home added" },
    ],
    unlockedFeatures: [
      "Basic dashboard with home health score",
      "System list with age tracking",
      "12-month cost forecast (basic accuracy)",
    ],
  },
  {
    id: "stable",
    name: "STABLE",
    displayName: "Stable",
    minHP: 500,
    maxHP: 1499,
    color: "#3B82F6",
    colorClass: "blue-500",
    icon: "Shield",
    statusMessage: "Foundation secured",
    description: "Your home's foundation is solid. You know what you have and nothing is in crisis mode.",
    requirements: [
      { id: "major_systems", description: "All major systems documented (HVAC, water heater, roof)", shortDescription: "Major systems documented" },
      { id: "no_critical", description: "No systems in critical condition", shortDescription: "No critical systems" },
      { id: "one_maintenance", description: "At least one maintenance action logged", shortDescription: "1+ maintenance logged" },
    ],
    unlockedFeatures: [
      "Detailed Weibull charts per system",
      "Maintenance reminder notifications",
      "DIY guide access",
      "Export basic home report",
    ],
  },
  {
    id: "protected",
    name: "PROTECTED",
    displayName: "Protected",
    minHP: 1500,
    maxHP: 2499,
    color: "#10B981",
    colorClass: "emerald-500",
    icon: "Umbrella",
    statusMessage: "Ahead of failures",
    description: "You're no longer reactive. You see what's coming and you're preparing for it.",
    requirements: [
      { id: "all_install_dates", description: "All systems documented with install dates", shortDescription: "All install dates set" },
      { id: "no_past_lifespan", description: "No systems past median lifespan without a replacement plan", shortDescription: "Replacement plans set" },
      { id: "emergency_fund", description: "Emergency fund covers at least one major replacement", shortDescription: "Emergency fund ready" },
      { id: "hvac_wh_current", description: "Preventive maintenance current on HVAC and water heater", shortDescription: "HVAC/WH maintained" },
    ],
    unlockedFeatures: [
      "3-year rolling forecast with confidence bands",
      "Insurance-ready home health report export",
      "Seasonal campaign participation",
      "System comparison recommendations",
    ],
  },
  {
    id: "optimized",
    name: "OPTIMIZED",
    displayName: "Optimized",
    minHP: 2500,
    maxHP: 3999,
    color: "#8B5CF6",
    colorClass: "violet-500",
    icon: "TrendingUp",
    statusMessage: "Running like a business",
    description: "Your home operates like a well-managed asset. Surprises are rare, and you're building equity through maintenance.",
    requirements: [
      { id: "all_maintenance_current", description: "Preventive maintenance current on all systems", shortDescription: "All maintenance current" },
      { id: "budget_50", description: "3-year replacement budget at least 50% funded", shortDescription: "Budget 50%+ funded" },
      { id: "no_orange_red", description: "All systems in green or yellow zone (none in orange or red)", shortDescription: "No at-risk systems" },
      { id: "two_campaigns", description: "Complete at least 2 seasonal campaigns", shortDescription: "2+ campaigns done" },
    ],
    unlockedFeatures: [
      "5-year detailed forecast",
      "Vendor discount program access",
      "Resale health certificate generation",
      "Priority support",
    ],
  },
  {
    id: "exemplary",
    name: "EXEMPLARY",
    displayName: "Exemplary",
    minHP: 4000,
    maxHP: null,
    color: "#F59E0B",
    colorClass: "amber-500",
    icon: "Trophy",
    statusMessage: "Top 5% of homeowners",
    description: "You're in elite territory. Your home is positioned for maximum value retention and minimal surprise costs.",
    requirements: [
      { id: "all_optimized", description: "All Optimized requirements maintained", shortDescription: "Optimized maintained" },
      { id: "budget_100", description: "5-year replacement budget fully funded", shortDescription: "Budget fully funded" },
      { id: "no_lapse_6mo", description: "No HP decay from maintenance lapses for 6+ months", shortDescription: "6mo streak" },
      { id: "full_documentation", description: "All systems documented with photos and manuals", shortDescription: "Full documentation" },
    ],
    unlockedFeatures: [
      "Lifetime forecast modeling",
      "Beta feature access",
      "Potential partner benefits (insurance discounts, lender perks)",
      "Exemplary home badge for resale",
    ],
  },
];

/**
 * Get tier definition by ID
 */
export function getTierDefinition(tierId: HPTier): TierDefinition {
  const tier = TIER_DEFINITIONS.find(t => t.id === tierId);
  if (!tier) throw new Error(`Unknown tier: ${tierId}`);
  return tier;
}

/**
 * Get tier by HP value (ignoring requirements)
 */
export function getTierByHP(hp: number): TierDefinition {
  // Find the highest tier the HP qualifies for
  for (let i = TIER_DEFINITIONS.length - 1; i >= 0; i--) {
    if (hp >= TIER_DEFINITIONS[i].minHP) {
      return TIER_DEFINITIONS[i];
    }
  }
  return TIER_DEFINITIONS[0]; // Default to AWARE
}

/**
 * Get next tier (if any)
 */
export function getNextTier(currentTier: HPTier): TierDefinition | null {
  const currentIndex = TIER_DEFINITIONS.findIndex(t => t.id === currentTier);
  if (currentIndex === -1 || currentIndex === TIER_DEFINITIONS.length - 1) {
    return null;
  }
  return TIER_DEFINITIONS[currentIndex + 1];
}

/**
 * Get previous tier (if any)
 */
export function getPreviousTier(currentTier: HPTier): TierDefinition | null {
  const currentIndex = TIER_DEFINITIONS.findIndex(t => t.id === currentTier);
  if (currentIndex <= 0) {
    return null;
  }
  return TIER_DEFINITIONS[currentIndex - 1];
}

/**
 * Check if user meets tier requirements
 */
export function checkTierRequirements(
  tier: HPTier,
  status: TierRequirementStatus
): { met: boolean; unmetRequirements: string[] } {
  const tierDef = getTierDefinition(tier);
  const unmetRequirements: string[] = [];

  for (const req of tierDef.requirements) {
    switch (req.id) {
      case "has_home":
        // Always met if we're checking (implies home exists)
        break;
      case "major_systems":
        if (!status.majorSystemsDocumented) {
          unmetRequirements.push(req.shortDescription);
        }
        break;
      case "no_critical":
        if (!status.noSystemsCritical) {
          unmetRequirements.push(req.shortDescription);
        }
        break;
      case "one_maintenance":
      case "hvac_wh_current":
      case "all_maintenance_current":
        if (!status.maintenanceCurrent) {
          unmetRequirements.push(req.shortDescription);
        }
        break;
      case "all_install_dates":
        if (!status.allInstallDatesSet) {
          unmetRequirements.push(req.shortDescription);
        }
        break;
      case "no_past_lifespan":
      case "no_orange_red":
        // These require more complex checking - for now, pass if no critical
        if (!status.noSystemsCritical) {
          unmetRequirements.push(req.shortDescription);
        }
        break;
      case "emergency_fund":
      case "budget_50":
        if (status.budgetFundedPercent < 50) {
          unmetRequirements.push(req.shortDescription);
        }
        break;
      case "budget_100":
        if (status.budgetFundedPercent < 100) {
          unmetRequirements.push(req.shortDescription);
        }
        break;
      case "two_campaigns":
        if (status.campaignsCompleted < 2) {
          unmetRequirements.push(req.shortDescription);
        }
        break;
      case "all_optimized":
        // Check all optimized requirements
        if (!status.maintenanceCurrent || status.budgetFundedPercent < 50 || 
            !status.noSystemsCritical || status.campaignsCompleted < 2) {
          unmetRequirements.push(req.shortDescription);
        }
        break;
      case "no_lapse_6mo":
        if (status.streakDaysWithoutLapse < 180) {
          unmetRequirements.push(req.shortDescription);
        }
        break;
      case "full_documentation":
        // Would need additional tracking - for now, check install dates
        if (!status.allInstallDatesSet) {
          unmetRequirements.push(req.shortDescription);
        }
        break;
    }
  }

  return {
    met: unmetRequirements.length === 0,
    unmetRequirements,
  };
}

/**
 * Evaluate what tier a user should be in based on HP and requirements
 */
export function evaluateTier(
  currentHP: number,
  status: TierRequirementStatus
): { tier: HPTier; unmetRequirements: string[] } {
  // Start from the highest tier and work down
  for (let i = TIER_DEFINITIONS.length - 1; i >= 0; i--) {
    const tierDef = TIER_DEFINITIONS[i];
    
    // Check HP threshold
    if (currentHP < tierDef.minHP) {
      continue;
    }
    
    // Check requirements
    const reqCheck = checkTierRequirements(tierDef.id, status);
    if (reqCheck.met) {
      return { tier: tierDef.id, unmetRequirements: [] };
    }
    
    // If HP qualifies but requirements don't, return this tier with unmet reqs
    // (User will stay at previous tier but see what's needed)
    if (i > 0) {
      // Check previous tiers
      for (let j = i - 1; j >= 0; j--) {
        const prevTier = TIER_DEFINITIONS[j];
        if (currentHP >= prevTier.minHP) {
          const prevCheck = checkTierRequirements(prevTier.id, status);
          if (prevCheck.met) {
            return { tier: prevTier.id, unmetRequirements: reqCheck.unmetRequirements };
          }
        }
      }
    }
  }
  
  // Default to AWARE
  return { tier: "aware", unmetRequirements: [] };
}

/**
 * Calculate HP needed to reach next tier
 */
export function hpToNextTier(currentHP: number, currentTier: HPTier): number | null {
  const nextTier = getNextTier(currentTier);
  if (!nextTier) return null;
  return Math.max(0, nextTier.minHP - currentHP);
}

/**
 * Calculate progress percentage within current tier
 */
export function tierProgress(currentHP: number, currentTier: HPTier): number {
  const tierDef = getTierDefinition(currentTier);
  const nextTier = getNextTier(currentTier);
  
  if (!nextTier) {
    // Exemplary tier - show progress above 4000
    const above = currentHP - tierDef.minHP;
    return Math.min(100, Math.round((above / 1000) * 100));
  }
  
  const tierRange = nextTier.minHP - tierDef.minHP;
  const progress = currentHP - tierDef.minHP;
  return Math.min(100, Math.round((progress / tierRange) * 100));
}
