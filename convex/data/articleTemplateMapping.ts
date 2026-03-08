/**
 * Maps maintenance task template names to relevant article slugs.
 * Used to populate relatedArticleSlugs on maintenanceTaskTemplates.
 *
 * The keys are lowercase substrings matched against template names.
 * When a template name contains the key, the listed slugs are linked.
 */

export const ARTICLE_TEMPLATE_MAP: Record<string, string[]> = {
  // HVAC
  "replace hvac filter": [
    "how-to-replace-your-hvac-air-filter",
    "hvac-annual-maintenance-checklist",
  ],
  "ac tune-up": [
    "pre-summer-ac-readiness-checklist",
    "hvac-annual-maintenance-checklist",
  ],
  "condensate drain": [
    "how-to-clean-your-ac-condensate-drain-line",
  ],
  "condenser coil": [
    "how-to-clean-your-ac-condenser-coils-outdoor-unit",
  ],
  "refrigerator coil": [
    "how-to-clean-your-refrigerator-coils",
  ],
  "thermostat": [
    "how-to-change-your-thermostat-batteries-and-check-if-its-actually",
    "how-to-program-your-thermostat-for-energy-savings",
  ],
  "ductwork": [
    "how-to-check-your-ductwork-for-obvious-leaks",
    "ductwork-the-hidden-system-that-makes-or-breaks-your-comfort",
  ],
  "return and supply vent": [
    "how-to-clean-your-return-and-supply-vents",
  ],
  "dryer vent": [
    "how-to-clean-your-dryer-vent-and-lint-trap-properly",
  ],
  "lint trap": [
    "how-to-clean-your-dryer-vent-and-lint-trap-properly",
  ],
  "attic": [
    "how-to-inspect-your-attic-what-to-look-for",
  ],

  // Plumbing
  "flush water heater": [
    "how-to-flush-your-water-heater-tank",
    "water-heater-annual-maintenance-checklist",
  ],
  "anode rod": [
    "how-to-check-and-replace-your-anode-rod",
  ],
  "t&p relief valve": [
    "how-to-test-your-tp-relief-valve",
  ],
  "tp relief": [
    "how-to-test-your-tp-relief-valve",
  ],
  "water heater thermostat": [
    "how-to-adjust-your-water-heater-thermostat",
  ],
  "pilot light": [
    "how-to-relight-a-water-heater-pilot-light",
  ],
  "clogged drain": [
    "how-to-clear-a-clogged-drain-sink-shower-tub",
  ],
  "running toilet": [
    "how-to-fix-a-running-toilet",
  ],
  "faucet aerator": [
    "how-to-replace-a-faucet-aerator",
  ],
  "water shut": [
    "how-to-shut-off-your-water-main-and-individual",
  ],
  "insulate pipe": [
    "how-to-insulate-exposed-pipes",
  ],
  "water pressure": [
    "how-to-test-your-water-pressure-and-why-90-of-homeowners-have-no",
  ],
  "garbage disposal": [
    "how-to-maintain-your-garbage-disposal",
  ],
  "hose bib": [
    "how-to-maintain-your-outdoor-faucets-hose-bibs",
  ],
  "washing machine": [
    "how-to-clean-your-washing-machine-including-front-loaders",
    "how-to-level-your-washing-machine-stop-the-shaking",
    "washing-machine-flood-prevention",
  ],

  // Electrical
  "gfci": [
    "how-to-test-your-gfci-outlets",
  ],
  "circuit breaker": [
    "how-to-reset-a-tripped-circuit-breaker",
    "how-to-map-your-circuit-breaker-panel",
  ],
  "smoke detector": [
    "how-to-test-your-smoke-and-co-detectors",
  ],
  "co detector": [
    "how-to-test-your-smoke-and-co-detectors",
  ],
  "light switch": [
    "how-to-replace-a-light-switch-or-outlet-cover",
  ],
  "surge protector": [
    "how-to-use-a-surge-protector-properly",
    "whole-house-surge-protection-why-florida-homes-need-it",
  ],

  // Appliances
  "dishwasher": [
    "how-to-clean-your-dishwasher-filter-spray-arms-and-seals",
    "kitchen-appliance-maintenance-checklist",
  ],
  "refrigerator water filter": [
    "how-to-replace-a-refrigerator-water-filter",
  ],

  // Exterior
  "gutter": [
    "how-to-clean-and-inspect-your-gutters",
    "gutter-guards-types-costs-and-what-actually-works",
  ],
  "roof inspect": [
    "how-to-inspect-your-roof-from-the-ground",
  ],
  "irrigation": [
    "how-to-maintain-your-lawn-irrigation-system",
    "broken-irrigation-head-or-dry-zone",
  ],
  "pressure wash": [
    "how-to-pressure-wash-your-homes-exterior",
  ],
  "caulking": [
    "how-to-check-your-homes-exterior-caulking-and-seals",
  ],
  "foundation": [
    "how-to-check-your-foundation-for-visible-issues",
  ],
};

/**
 * Given a template name, returns matching article slugs from the mapping.
 */
export function getArticleSlugsForTemplate(templateName: string): string[] {
  const lower = templateName.toLowerCase();
  const matched = new Set<string>();

  for (const [key, slugs] of Object.entries(ARTICLE_TEMPLATE_MAP)) {
    if (lower.includes(key)) {
      for (const slug of slugs) {
        matched.add(slug);
      }
    }
  }

  return Array.from(matched);
}
