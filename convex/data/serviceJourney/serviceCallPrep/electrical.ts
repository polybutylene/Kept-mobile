import { ServiceCallPrep } from "./types";

export const electricalPreps: ServiceCallPrep[] = [
  {
    issueSlug: "general_electrical",
    systemCategory: "electrical",
    expectations: {
      typicalDuration: "45–90 minutes",
      costRange: { low: 100, high: 300 },
      whatTechWillDo: [
        "Inspect the electrical panel for issues",
        "Test circuits with a multimeter",
        "Check for loose connections",
        "Verify proper grounding",
        "Inspect outlets and switches",
        "Check for code violations",
      ],
      dontDecideOnSpot: "Electrical work is safety-critical. For any rewiring or panel work, always get a second opinion and verify the electrician is licensed and insured.",
    },
    questionsToAsk: [
      {
        question: "Is my electrical panel up to current code?",
        context: "Older panels (Federal Pacific, Zinsco) have known safety issues. Knowing your panel's status matters for insurance and safety.",
      },
      {
        question: "Will this work require a permit?",
        context: "Many electrical modifications require permits by law. Unpermitted work can affect your insurance coverage and home resale.",
      },
      {
        question: "Is the circuit overloaded, or is there a wiring issue?",
        context: "Overloaded circuits need redistribution. Wiring issues can indicate deeper problems that need addressing.",
      },
    ],
    redFlags: [
      {
        flag: "Offers to do the work without pulling a permit when one is required",
        explanation: "Skipping permits saves the contractor time but puts you at risk. Unpermitted electrical work can void your insurance.",
      },
      {
        flag: "Recommends a full panel replacement for a single circuit issue",
        explanation: "Unless your panel is a known-defective brand (Federal Pacific, Zinsco) or severely outdated, a single circuit problem rarely needs a full replacement.",
      },
      {
        flag: "Can't or won't explain the problem in plain terms",
        explanation: "Electrical work can be complex, but a good electrician can explain what's wrong and why the repair is needed.",
      },
    ],
  },
];
