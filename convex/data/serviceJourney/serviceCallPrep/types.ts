/**
 * Service Call Prep type definitions
 */

export interface ServiceCallPrep {
  issueSlug: string;
  systemCategory: string;
  expectations: {
    typicalDuration: string;
    costRange: { low: number; high: number };
    whatTechWillDo: string[];
    dontDecideOnSpot: string;
  };
  questionsToAsk: Array<{
    question: string;
    context?: string;
  }>;
  redFlags: Array<{
    flag: string;
    explanation?: string;
  }>;
}
