import { DIYGuide } from "./types";

export const plumbingGuides: DIYGuide[] = [
  {
    issueSlug: "clogged_drain",
    title: "Clear a Clogged Drain",
    applicableTo: ["plumbing", "sink", "shower", "bathtub"],
    difficulty: "easy",
    estimatedTime: "15–30 minutes",
    toolsNeeded: ["Plunger (cup style for sinks, flange for toilets)", "Bucket", "Old towel"],
    safetyWarnings: [
      "Do NOT use chemical drain cleaners on a regular basis — they damage pipes over time.",
      "If multiple drains are slow, it may be a main line issue — call a plumber.",
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Try the plunger first",
        instruction: "Fill the sink/tub with a couple inches of water. Place the plunger over the drain, making a tight seal, and plunge vigorously 15–20 times.",
        details: "For a bathroom sink, plug the overflow hole with a wet towel for better suction. For a double kitchen sink, plug the other drain.",
      },
      {
        stepNumber: 2,
        title: "Clean the P-trap (sinks only)",
        instruction: "If plunging didn't work, place a bucket under the sink's P-trap (the curved pipe section). Unscrew the slip nuts by hand and remove the P-trap. Clear any debris inside.",
        details: "Hair, soap buildup, and food particles collect in the P-trap. Clean it out and reassemble. Hand-tight is usually sufficient — don't over-tighten.",
      },
      {
        stepNumber: 3,
        title: "Try baking soda and vinegar",
        instruction: "Pour 1/2 cup baking soda down the drain, followed by 1/2 cup white vinegar. Cover the drain and wait 15–30 minutes, then flush with hot water.",
        details: "This is a gentler alternative to chemical cleaners. It works well for minor organic buildup. For stubborn clogs, you may need a drain snake.",
      },
      {
        stepNumber: 4,
        title: "Know when to call a pro",
        instruction: "If the drain is still slow after these steps, the clog is deeper in the line. A plumber with a drain snake or camera can locate and clear it.",
        details: "Recurring clogs in the same drain may indicate a pipe issue (bellied pipe, root intrusion, etc.). Multiple slow drains at once almost always means a main line problem.",
      },
    ],
  },
  {
    issueSlug: "running_toilet",
    title: "Fix a Running Toilet",
    applicableTo: ["plumbing", "toilet"],
    difficulty: "easy",
    estimatedTime: "10–20 minutes",
    toolsNeeded: ["Replacement flapper (universal, ~$5 from hardware store)"],
    safetyWarnings: [],
    steps: [
      {
        stepNumber: 1,
        title: "Identify the cause",
        instruction: "Remove the tank lid and watch what happens. If water is trickling into the bowl, the flapper is likely worn. If water is running into the overflow tube, the fill valve needs adjusting.",
        details: "A running toilet wastes 200+ gallons per day. The flapper (rubber seal at the bottom of the tank) is the culprit 90% of the time.",
      },
      {
        stepNumber: 2,
        title: "Replace the flapper",
        instruction: "Turn off the water supply valve behind the toilet (turn clockwise). Flush to empty the tank. Unhook the old flapper from the overflow tube pegs and disconnect the chain. Hook the new flapper on and connect the chain.",
        details: "The chain should have about 1/2 inch of slack. Too tight = the flapper won't seal. Too loose = the flapper won't lift fully when you flush.",
      },
      {
        stepNumber: 3,
        title: "Test and adjust",
        instruction: "Turn the water supply back on and let the tank fill. Flush once and watch — the flapper should seal completely and the water should stop running.",
        details: "If the toilet still runs, try adjusting the float level. The water should stop about 1 inch below the top of the overflow tube. Most fill valves have an adjustment screw or clip.",
      },
    ],
  },
  {
    issueSlug: "low_water_pressure",
    title: "Troubleshoot Low Water Pressure",
    applicableTo: ["plumbing"],
    difficulty: "easy",
    estimatedTime: "10–15 minutes",
    toolsNeeded: [],
    safetyWarnings: [],
    steps: [
      {
        stepNumber: 1,
        title: "Check if it's one fixture or all",
        instruction: "Test hot and cold water at multiple faucets. Is the low pressure at one fixture only, or throughout the house?",
        details: "One fixture = likely a clogged aerator or cartridge. All fixtures = could be a supply issue, partially closed valve, or pressure regulator problem.",
      },
      {
        stepNumber: 2,
        title: "Clean the aerator",
        instruction: "If it's one faucet: unscrew the aerator from the tip of the faucet (turn counterclockwise). Rinse out any debris and sediment. Reinstall.",
        details: "Hard water sediment frequently clogs aerators, especially in Florida. If you see white mineral buildup, soak the aerator in vinegar for 30 minutes.",
      },
      {
        stepNumber: 3,
        title: "Check the main shutoff valve",
        instruction: "Locate your main water shutoff valve (usually near the meter or where the line enters the house). Make sure it's fully open.",
        details: "Sometimes after plumbing work, the valve doesn't get opened all the way. A partially closed main valve reduces pressure to the whole house. If the pressure issue started after recent plumbing work, this is the first thing to check.",
      },
    ],
  },
];
