import { ReplacementTree } from "./types";
import { waterHeaterTree } from "./waterHeater";
import { hvacTree } from "./hvac";

export type {
  ReplacementTree,
  DecisionStep,
  DecisionOption,
  RecommendationRule,
} from "./types";

const SLUG_MAP: Record<string, ReplacementTree> = {
  water_heater: waterHeaterTree,
  tank_water_heater: waterHeaterTree,
  tankless_water_heater: waterHeaterTree,
  water_heater_tank: waterHeaterTree,
  water_heater_tankless: waterHeaterTree,
  water_heating: waterHeaterTree,
  hvac: hvacTree,
  central_ac: hvacTree,
  central_ac_split: hvacTree,
  central_air_conditioner: hvacTree,
  gas_furnace: hvacTree,
  furnace: hvacTree,
  heat_pump: hvacTree,
  mini_split: hvacTree,
};

interface KeywordRule {
  keywords: string[];
  tree: ReplacementTree;
}

const KEYWORD_RULES: KeywordRule[] = [
  { keywords: ["water heater", "water_heater", "water heating"], tree: waterHeaterTree },
  { keywords: ["central air", "central_ac", "air conditioner"], tree: hvacTree },
  { keywords: ["furnace"], tree: hvacTree },
  { keywords: ["heat pump", "heat_pump"], tree: hvacTree },
  { keywords: ["mini split", "mini_split", "minisplit", "ductless"], tree: hvacTree },
  { keywords: ["hvac"], tree: hvacTree },
];

function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_|_$/g, "");
}

export function getReplacementTree(systemType: string): ReplacementTree | null {
  if (SLUG_MAP[systemType]) {
    return SLUG_MAP[systemType];
  }
  const slug = normalize(systemType);
  if (SLUG_MAP[slug]) {
    return SLUG_MAP[slug];
  }
  const lower = systemType.toLowerCase();
  for (const rule of KEYWORD_RULES) {
    for (const keyword of rule.keywords) {
      if (lower.includes(keyword)) {
        return rule.tree;
      }
    }
  }
  return null;
}

export function getAvailableReplacementTypes(): string[] {
  return [...new Set(Object.values(SLUG_MAP).map((t) => t.systemType))];
}
