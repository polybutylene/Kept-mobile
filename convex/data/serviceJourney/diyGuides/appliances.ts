import { DIYGuide } from "./types";

export const applianceGuides: DIYGuide[] = [
  {
    issueSlug: "dishwasher_not_cleaning",
    title: "Clean Your Dishwasher Filter",
    applicableTo: ["dishwasher", "appliances"],
    difficulty: "easy",
    estimatedTime: "10 minutes",
    toolsNeeded: ["Soft brush or toothbrush"],
    safetyWarnings: [],
    steps: [
      {
        stepNumber: 1,
        title: "Locate the filter",
        instruction: "Remove the bottom rack. The filter is a cylindrical screen at the bottom center of the dishwasher tub. Twist it counterclockwise to remove.",
        details: "Most modern dishwashers have a manual clean filter (they stopped using self-cleaning grinders years ago). If you've never cleaned it, prepare for some buildup.",
      },
      {
        stepNumber: 2,
        title: "Clean the filter",
        instruction: "Rinse the filter under warm running water. Use a soft brush to gently scrub away food particles and grease. Don't use a wire brush — it'll damage the mesh.",
      },
      {
        stepNumber: 3,
        title: "Reinstall and run a clean cycle",
        instruction: "Place the filter back and twist clockwise to lock. Run an empty cycle on the hottest setting with a cup of white vinegar on the top rack to clean the interior.",
        details: "Clean the filter monthly for best results. A clogged filter is the most common reason dishes come out dirty or with residue.",
      },
    ],
  },
  {
    issueSlug: "fridge_filter",
    title: "Replace Your Refrigerator Water Filter",
    applicableTo: ["refrigerator", "appliances"],
    difficulty: "easy",
    estimatedTime: "5 minutes",
    toolsNeeded: ["Replacement filter (check your fridge model for the right type)"],
    safetyWarnings: [],
    steps: [
      {
        stepNumber: 1,
        title: "Find and remove the old filter",
        instruction: "Most filters are inside the fridge (upper right corner) or in the base grille. Turn the old filter counterclockwise (or push the release button) to remove it.",
        details: "Check your owner's manual if you can't find it. Common locations: behind the bottom grille, inside the upper right of the fridge compartment, or in the back wall.",
      },
      {
        stepNumber: 2,
        title: "Install the new filter",
        instruction: "Remove the cap from the new filter (if applicable). Insert it and turn clockwise until it clicks. Reset the filter indicator light (usually by pressing and holding the filter button for 3–5 seconds).",
      },
      {
        stepNumber: 3,
        title: "Flush the new filter",
        instruction: "Run 2–3 gallons of water through the dispenser to flush carbon fines from the new filter. The first few glasses may be gray — that's normal.",
        details: "Replace every 6 months or when the filter light comes on. Hard water areas like Northwest Florida may need more frequent replacement.",
      },
    ],
  },
  {
    issueSlug: "dryer_vent_clogged",
    title: "Clean Your Dryer Vent",
    applicableTo: ["dryer", "appliances"],
    difficulty: "moderate",
    estimatedTime: "30–45 minutes",
    toolsNeeded: ["Dryer vent brush kit (long flexible rod)", "Vacuum", "Screwdriver"],
    safetyWarnings: [
      "A clogged dryer vent is a fire hazard. The U.S. Fire Administration reports 2,900 dryer fires per year.",
      "Unplug the dryer before working behind it.",
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Disconnect the vent",
        instruction: "Unplug the dryer and pull it away from the wall. Disconnect the vent hose from the back of the dryer (usually held on by a clamp).",
        safetyNote: "If it's a gas dryer, be careful not to kink the gas line. If you smell gas at any point, stop and call your gas company.",
      },
      {
        stepNumber: 2,
        title: "Clean the vent duct",
        instruction: "Insert the vent brush into the duct and push it through to the outside vent. Rotate the brush as you push and pull to dislodge lint buildup. Vacuum out loose lint.",
        details: "If your vent run is longer than 10 feet or has multiple elbows, it may need professional cleaning with a powered rotary brush.",
      },
      {
        stepNumber: 3,
        title: "Check the exterior vent",
        instruction: "Go outside and check the vent hood/flap. Clear any lint buildup and make sure the flap opens freely.",
        details: "The exterior flap should open when the dryer is running and close when it's off. A stuck flap allows pests and moisture into the duct.",
      },
      {
        stepNumber: 4,
        title: "Reconnect and test",
        instruction: "Reattach the vent hose, push the dryer back, and plug it in. Run the dryer on a no-heat/air-only cycle for a few minutes. Go outside and verify you feel strong airflow from the exterior vent.",
        details: "Clean the lint trap after every load and the full vent duct at least once a year. In humid climates like Florida, moisture can make lint stick more aggressively.",
      },
    ],
  },
];
