import { ServiceCallPrep } from "./types";

export const waterHeaterPreps: ServiceCallPrep[] = [
  {
    issueSlug: "general_water_heater",
    systemCategory: "plumbing",
    expectations: {
      typicalDuration: "30–60 minutes",
      costRange: { low: 75, high: 200 },
      whatTechWillDo: [
        "Check the heating elements with a multimeter",
        "Inspect the anode rod condition",
        "Test the T&P relief valve",
        "Check for sediment buildup",
        "Inspect connections for corrosion",
        "Check water temperature output",
      ],
      dontDecideOnSpot: "If they recommend replacement, don't decide on the spot — Kept can help you compare options and get multiple quotes first.",
    },
    questionsToAsk: [
      {
        question: "How does the anode rod look? Has it been replaced before?",
        context: "The anode rod protects the tank from corrosion. If it's spent, the tank itself is deteriorating.",
      },
      {
        question: "Is the sediment buildup bad enough that a flush will help, or is the tank too far gone?",
        context: "Helps you understand if maintenance can extend the tank's life or if it's past the point of return.",
      },
      {
        question: "If you're recommending replacement, can I get the diagnosis in writing so I can get a second quote?",
        context: "A good tech will have no problem putting their findings in writing. It protects both parties.",
      },
      {
        question: "What's the warranty on any parts you install?",
        context: "Standard is 1 year on parts and labor. Less than that is below industry norm.",
      },
      {
        question: "Is there anything I should be doing for regular maintenance on this unit?",
        context: "A good tech educates the homeowner. Annual flushing and anode rod checks extend tank life significantly.",
      },
    ],
    redFlags: [
      {
        flag: "Recommends full replacement without testing the elements or inspecting the tank first",
        explanation: "A proper diagnosis should come before any replacement recommendation. Jumping to replacement is a sales tactic.",
      },
      {
        flag: "Pressures you to decide on replacement immediately — 'I have a unit on the truck'",
        explanation: "This is a high-pressure sales move. A replacement is a $1,500–4,000 decision — you deserve time to compare options.",
      },
      {
        flag: "Quotes significantly above $150–200 for a standard diagnostic on an electric tank",
        explanation: "A diagnostic fee of $75–150 is normal. Anything above $200 for just looking at it is high.",
      },
      {
        flag: "Won't provide a written diagnosis or itemized quote when asked",
        explanation: "Transparency is a baseline expectation. No written diagnosis means no accountability.",
      },
      {
        flag: "Suggests repairs totaling more than 50% of replacement cost on an aging unit",
        explanation: "If repair costs approach half the replacement cost on a unit nearing end of life, replacement usually makes more financial sense.",
      },
    ],
  },
  {
    issueSlug: "water_heater_leak",
    systemCategory: "plumbing",
    expectations: {
      typicalDuration: "30–90 minutes",
      costRange: { low: 100, high: 350 },
      whatTechWillDo: [
        "Identify the source of the leak",
        "Check fittings and connections",
        "Inspect the T&P valve and discharge",
        "Check the tank bottom for rust-through",
        "Test water pressure",
      ],
      dontDecideOnSpot: "A leaking tank (not fittings) usually means replacement. But get at least two quotes before committing.",
    },
    questionsToAsk: [
      {
        question: "Is the leak coming from a fitting, the valve, or the tank itself?",
        context: "Fitting/valve leaks are repairable. A tank leak means the steel has corroded through — that's replacement territory.",
      },
      {
        question: "Is there any sign of a slow leak that's been happening for a while?",
        context: "Rust stains, mineral deposits, or warped flooring near the tank suggest a long-term issue that may have caused secondary damage.",
      },
      {
        question: "Should I consider a drain pan if I don't have one?",
        context: "A drain pan under the water heater catches leaks before they damage flooring. Required by code in some areas, cheap insurance in all of them.",
      },
    ],
    redFlags: [
      {
        flag: "Diagnoses a 'tank leak' without showing you where the water is actually coming from",
        explanation: "Water running down from a leaking fitting can look like a tank leak. A good tech traces the water to its source.",
      },
      {
        flag: "Quotes emergency premium pricing for a non-emergency leak",
        explanation: "A slow drip isn't an emergency. If they're charging emergency rates, push back or schedule a standard appointment.",
      },
    ],
  },
];
