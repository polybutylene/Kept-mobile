import { DIYGuide } from "./types";
import { waterHeaterGuides } from "./waterHeater";
import { hvacGuides } from "./hvac";
import { plumbingGuides } from "./plumbing";
import { electricalGuides } from "./electrical";
import { applianceGuides } from "./appliances";

export type { DIYGuide, DIYStep, DIYStepTroubleshooting, DIYGuideCompletion } from "./types";

const ALL_GUIDES: DIYGuide[] = [
  ...waterHeaterGuides,
  ...hvacGuides,
  ...plumbingGuides,
  ...electricalGuides,
  ...applianceGuides,
];

/**
 * Find a DIY guide by issue slug
 */
export function getDIYGuide(issueSlug: string): DIYGuide | null {
  return ALL_GUIDES.find((g) => g.issueSlug === issueSlug) || null;
}

/**
 * Find all DIY guides applicable to a system type
 */
export function getDIYGuidesForSystemType(systemType: string): DIYGuide[] {
  const normalized = systemType.toLowerCase().replace(/[\s()-]+/g, "_");
  return ALL_GUIDES.filter((g) =>
    g.applicableTo.some((slug) => normalized.includes(slug) || slug.includes(normalized))
  );
}

/**
 * Get all available DIY guide slugs
 */
export function getAllDIYGuideSlugs(): string[] {
  return ALL_GUIDES.map((g) => g.issueSlug);
}
