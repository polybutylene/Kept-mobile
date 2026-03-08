import { ServiceCallPrep } from "./types";

export const appliancePreps: ServiceCallPrep[] = [
  {
    issueSlug: "general_appliance",
    systemCategory: "appliances",
    expectations: {
      typicalDuration: "30–60 minutes",
      costRange: { low: 75, high: 200 },
      whatTechWillDo: [
        "Diagnose the issue",
        "Test components and circuits",
        "Inspect for wear and damage",
        "Provide a repair-vs-replace recommendation",
        "Order parts if needed (may require a follow-up visit)",
      ],
      dontDecideOnSpot: "For appliances over 8 years old, get a repair quote AND a replacement cost before deciding. The 50% rule applies — if repair costs more than 50% of replacement, replace.",
    },
    questionsToAsk: [
      {
        question: "Is this a common failure for this model?",
        context: "Some appliances have known defects. Knowing this helps you decide if a repair is a one-time fix or a recurring problem.",
      },
      {
        question: "What's the expected lifespan of the replacement part?",
        context: "If the part only lasts 2–3 years and your appliance is already aging, replacement may be more cost-effective.",
      },
      {
        question: "Is the part available, or will it need to be ordered?",
        context: "Common parts are often on the truck. Rare parts can take weeks and may indicate the appliance is being discontinued.",
      },
      {
        question: "Given the age of my unit, does it make more sense to repair or replace?",
        context: "An honest tech will tell you when a repair doesn't make financial sense. The best ones won't upsell you on a repair they know won't last.",
      },
    ],
    redFlags: [
      {
        flag: "Diagnoses the problem without running the appliance or testing components",
        explanation: "A visual-only diagnosis is incomplete. Components need to be tested to confirm they've actually failed.",
      },
      {
        flag: "Charges a diagnostic fee AND refuses to apply it toward the repair",
        explanation: "Most reputable appliance repair companies apply the diagnostic fee to the repair cost if you proceed. If they don't, it's a red flag.",
      },
      {
        flag: "Quotes a repair that exceeds 50% of a new unit's cost",
        explanation: "The 50% rule is widely accepted in the industry. If repair approaches half of replacement cost, you're usually better off replacing.",
      },
    ],
  },
];
