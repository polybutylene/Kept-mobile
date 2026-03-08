import { ServiceCallPrep } from "./types";

export const plumbingPreps: ServiceCallPrep[] = [
  {
    issueSlug: "general_plumbing",
    systemCategory: "plumbing",
    expectations: {
      typicalDuration: "30–90 minutes",
      costRange: { low: 75, high: 250 },
      whatTechWillDo: [
        "Inspect the area and identify the issue",
        "Check water pressure",
        "Inspect visible pipes and fittings",
        "Test drainage if applicable",
        "Provide a written diagnosis and quote",
      ],
      dontDecideOnSpot: "For any repair over $500, get a second opinion. Plumbing quotes can vary significantly between companies.",
    },
    questionsToAsk: [
      {
        question: "Is this a repair or a temporary fix?",
        context: "Some plumbers patch to get the call done. Make sure the solution addresses the root cause.",
      },
      {
        question: "What type of pipe material am I looking at, and are there any concerns with it?",
        context: "Polybutylene (gray) pipes and galvanized steel pipes have known failure issues. Knowing your pipe type is important for long-term planning.",
      },
      {
        question: "Is this covered under my home warranty or homeowner's insurance?",
        context: "Some water damage and plumbing failures are covered. The tech's documentation can support a claim.",
      },
      {
        question: "Could this issue be related to anything else in the system?",
        context: "Plumbing problems are often interconnected. A slow drain might indicate a bigger issue downstream.",
      },
    ],
    redFlags: [
      {
        flag: "Quotes a flat rate for a job they haven't fully diagnosed",
        explanation: "Flat-rate pricing without diagnosis means they're either overcharging to cover unknowns or will hit you with 'additional findings' later.",
      },
      {
        flag: "Recommends repiping the entire house based on one issue",
        explanation: "One leaky fitting doesn't mean your whole house needs repiping. Unless you have known problematic pipe material (polybutylene), this is likely an upsell.",
      },
      {
        flag: "Charges for a camera inspection without explaining why it's needed",
        explanation: "Camera inspections are useful for drain and sewer issues. But they're often used to find 'additional problems' to sell more work.",
      },
    ],
  },
];
