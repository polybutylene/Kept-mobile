/**
 * Decision Tree Types for Guided Replacement Planning
 *
 * Each system type has a decision tree that walks the homeowner through
 * a series of questions to arrive at a personalized recommendation.
 */

export interface DecisionStep {
  id: string;
  question: string;
  contextNote?: string; // Brief explainer shown above the options
  options: DecisionOption[];
  autoFillFromProfile?: string; // Key from home profile to pre-select (e.g. "utilityType")
}

export interface DecisionOption {
  label: string;
  description?: string; // One-line micro-explainer
  value: string;
  nextStepId: string | "recommend"; // Branch to next step or trigger recommendation
}

export interface RecommendationRule {
  /** Conditions: map of stepId → selected value(s) that trigger this rule */
  conditions: Record<string, string | string[]>;
  /** The recommendation to show */
  recommendation: {
    productType: string;
    specificProduct?: string;
    estimatedCost: { low: number; high: number };
    estimatedLifespan: { low: number; high: number };
    annualSavings?: number;
    rationaleParts: string[]; // Assembled into a personalized rationale
  };
  /** Optional alternative */
  alternative?: {
    productType: string;
    estimatedCost: { low: number; high: number };
    tradeoffNote: string;
  };
}

export interface ActionPlanTemplate {
  steps: {
    stepId: string;
    label: string;
    actionType: "find_pros" | "check_rebates" | "schedule" | "setup_monitoring" | "get_quotes";
  }[];
}

export interface ReplacementTree {
  systemType: string; // e.g. "water_heater", "central_ac"
  displayName: string;
  steps: DecisionStep[];
  recommendations: RecommendationRule[];
  actionPlan: ActionPlanTemplate;
}
