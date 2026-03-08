/**
 * DIY Guide type definitions
 *
 * Enhanced with field-grade content fields that differentiate Kept
 * from YouTube tutorials: techTip, whatToLookFor, commonMistake,
 * ifSomethingGoesWrong — sourced from 8+ years of field experience.
 */

export interface DIYStepTroubleshooting {
  scenario: string;
  likelyCause: string;
  whatToDo: string;
  bailOutOption: string;
}

export interface DIYStep {
  stepNumber: number;
  title: string;
  instruction: string;
  details?: string;
  safetyNote?: string;
  imageHint?: string;
  /** Field experience insight — the kind of tip only a tech who's done this 500 times would know */
  techTip?: string;
  /** What they'll physically see if they're doing it right (sensory confirmation) */
  whatToLookFor?: string;
  /** The most common mistake homeowners make at this step */
  commonMistake?: string;
  /** What to do if something goes wrong at this step */
  ifSomethingGoesWrong?: DIYStepTroubleshooting[];
}

export interface DIYGuideCompletion {
  /** Steps to verify the fix actually worked */
  verificationSteps: string[];
  /** What "success" looks like after completing the guide */
  expectedResults: string;
  /** Signs that something isn't right even after completion */
  whenToWorry: string[];
  /** When to do this task next */
  nextMaintenance: string;
  /** Other tasks worth doing at the same time */
  relatedTasks: string[];
}

export interface DIYGuide {
  issueSlug: string;
  title: string;
  applicableTo: string[];
  difficulty: "easy" | "moderate" | "hard";
  estimatedTime: string;
  toolsNeeded: string[];
  safetyWarnings: string[];
  steps: DIYStep[];
  /** Decision gate before starting: should the homeowner attempt this? */
  shouldYouDIY?: {
    doItYourself: string[];
    callAPro: string[];
  };
  /** After-completion guidance: verification, what to expect, and next steps */
  completion?: DIYGuideCompletion;
}
