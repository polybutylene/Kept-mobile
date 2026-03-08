import { internalMutation } from "../_generated/server";

// ─────────────────────────────────────────────────────────────────────────────
// APPLIANCE Maintenance Tasks — 15 tasks across 6 component types
// Source: Manufacturer service manuals, appliance technician field experience,
//         ENERGY STAR guidelines, and Consumer Product Safety Commission data.
// Cost basis: 2025 US National Average
// ─────────────────────────────────────────────────────────────────────────────

const applianceMaintenanceTasks = [
  // ================================================================
  // REFRIGERATOR  (componentTemplateKey: "refrigerator")
  // ================================================================
  {
    key: "appl_ref_001",
    componentTemplateKey: "refrigerator",
    systemCategory: "appliances",
    name: "Clean Condenser Coils",
    description:
      "Vacuum and brush the condenser coils on the back or bottom of the refrigerator to remove dust, pet hair, and grease buildup. The condenser coils dissipate heat from the refrigeration cycle — when they're caked in dust, the compressor runs longer, hotter, and harder.",
    whyItMatters:
      "Dirty condenser coils are the #1 cause of premature refrigerator compressor failure. A quarter-inch of dust on the coils forces the compressor to run up to 35% longer per cycle, increasing energy consumption by $50-$100/year and cutting the compressor's lifespan in half. This is the single most impactful appliance maintenance task you can do.",
    instructions: [
      "Unplug the refrigerator or turn off the circuit breaker — the compressor and fan must be off",
      "Locate the condenser coils: on older models they're on the back of the unit; on modern models they're underneath behind a kick plate",
      "For bottom-mounted coils, remove the kick plate or grille at the base of the refrigerator (usually snaps or unscrews)",
      "Use a refrigerator coil brush (long, narrow bristle brush designed for this) to gently loosen dust and debris from the coil fins",
      "Vacuum the loosened debris with a crevice attachment — work carefully to avoid bending the delicate fins",
      "For back-mounted coils, pull the refrigerator away from the wall and vacuum/brush the coils directly",
      "While you have access, vacuum the condenser fan blade and motor (bottom-coil models have a fan next to the coils)",
      "Clean the floor area under and behind the refrigerator — dust bunnies get pulled into the coils by the fan",
      "Reinstall the kick plate, push the refrigerator back into position (leave 1 inch clearance from the wall for airflow)",
      "Plug the refrigerator back in and verify the compressor and fans start running",
    ],
    frequency: {
      intervalMonths: 6,
      seasonalAdjustments: {
        note: "Every 6 months for most homes. Every 3 months if you have shedding pets — pet hair is the worst coil clogger. Annual may suffice in pet-free homes with clean environments.",
      },
      triggerConditions: [
        "Refrigerator running constantly or cycling more frequently than normal",
        "Back or bottom of the refrigerator feels excessively hot",
        "Food not staying cold enough despite correct thermostat settings",
        "Higher than normal electric bill with no other explanation",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 20,
    toolsRequired: [
      "refrigerator coil brush (long, narrow bristle brush — $8-$12 at hardware stores)",
      "vacuum with crevice attachment",
      "flashlight",
    ],
    materialsCost: { low: 0, high: 12 },
    professionalCost: { low: 100, high: 200 },
    skipConsequences: {
      shortTerm:
        "Compressor runs 25-35% longer per cycle; energy consumption increases $50-$100/year; refrigerator interior may not hold proper temperature",
      longTerm:
        "Premature compressor failure — a $400-$800 repair that often exceeds the value of the refrigerator; condenser fan motor burnout from overwork; total refrigerator replacement needed 5-7 years early",
      costOfNeglect:
        "A $0-$12 cleaning every 6 months prevents a $400-$800 compressor replacement and saves $50-$100/year in electricity",
    },
    safetyNotes: [
      "Always unplug the refrigerator before cleaning the coils — the condenser fan can cause injury",
      "Be careful not to bend or crush the thin aluminum coil fins — bent fins restrict airflow almost as much as dust",
      "When pulling the refrigerator away from the wall, watch for the water supply line (if you have an ice maker) — kinking or tearing this line causes flooding",
      "Ensure 1 inch minimum clearance between the back of the refrigerator and the wall for proper airflow",
    ],
    seasonalRelevance: ["spring", "fall"],
    priority: "high" as const,
    tags: [
      "refrigerator",
      "condenser-coils",
      "cleaning",
      "diy",
      "semi-annual",
      "energy-savings",
      "appliances",
    ],
  },
  {
    key: "appl_ref_002",
    componentTemplateKey: "refrigerator",
    systemCategory: "appliances",
    name: "Check Door Seals and Clean Gaskets",
    description:
      "Inspect and clean the door gaskets (rubber seals) on both the refrigerator and freezer doors. Test the seal strength and check for cracks, tears, mold, or hardening that allows cold air to escape.",
    whyItMatters:
      "A worn or dirty door gasket lets cold air leak out 24 hours a day. The compressor works overtime to compensate, driving up your electric bill and shortening its life. A simple dollar-bill test tells you instantly if the seal is failing — and cleaning the gasket with warm soapy water restores most seals to like-new condition.",
    instructions: [
      "Open the refrigerator door and visually inspect the entire gasket for cracks, tears, warping, or mold",
      "Perform the dollar-bill test: close the door on a dollar bill so it's half in, half out",
      "Try to pull the dollar bill out — you should feel firm resistance along the entire gasket perimeter",
      "If the bill slides out easily at any point, the seal is compromised at that location",
      "Clean the gasket with warm water and a few drops of dish soap using a soft cloth",
      "Pay special attention to the folds and grooves where mold and food residue collect",
      "For mold in the gasket folds, use a solution of 1:1 water and white vinegar with an old toothbrush",
      "Dry the gasket thoroughly after cleaning",
      "Apply a thin coat of petroleum jelly or food-grade silicone to the gasket to keep it supple and improve the seal",
      "Repeat the dollar-bill test after cleaning — most gaskets seal much better once clean",
      "If the gasket is cracked, hardened, or still fails the dollar-bill test after cleaning, order a replacement gasket from the manufacturer",
      "Check that the door hinges are tight and the door closes evenly — a sagging door causes uneven gasket contact",
    ],
    frequency: {
      intervalMonths: 6,
      seasonalAdjustments: {
        note: "Every 6 months. Check more frequently in humid climates where mold grows faster in gasket folds.",
      },
      triggerConditions: [
        "Visible condensation or frost forming inside the refrigerator or freezer",
        "Refrigerator running constantly",
        "Visible mold on the gasket",
        "Door doesn't close firmly or bounces open",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 15,
    toolsRequired: [
      "soft cloth",
      "dish soap",
      "white vinegar (for mold)",
      "old toothbrush",
      "petroleum jelly or food-grade silicone lubricant",
      "dollar bill (for seal test)",
    ],
    materialsCost: { low: 0, high: 5 },
    professionalCost: { low: 75, high: 150 },
    skipConsequences: {
      shortTerm:
        "Cold air leaks 24/7, increasing compressor run time and energy consumption; condensation and frost buildup inside the refrigerator or freezer",
      longTerm:
        "Compressor overwork leads to premature failure; ice buildup damages food and interior components; mold in the gasket becomes a health concern and makes the gasket deteriorate faster",
      costOfNeglect:
        "A leaking gasket wastes $30-$80/year in electricity. A replacement gasket costs $50-$150 — far less than the compressor damage from ignoring it.",
    },
    safetyNotes: [
      "Mold in gasket folds can trigger allergies — wear gloves if you're sensitive",
      "Do not use bleach on door gaskets — it degrades the rubber and causes cracking",
      "If the gasket is heavily molded, clean and dry thoroughly, then monitor for regrowth",
    ],
    seasonalRelevance: ["spring", "fall"],
    priority: "medium" as const,
    tags: [
      "refrigerator",
      "door-seal",
      "gasket",
      "cleaning",
      "diy",
      "semi-annual",
      "energy-savings",
      "appliances",
    ],
  },
  {
    key: "appl_ref_003",
    componentTemplateKey: "refrigerator",
    systemCategory: "appliances",
    name: "Replace Water Filter and Clear Drain Line",
    description:
      "Replace the refrigerator's built-in water filter that supplies the ice maker and water dispenser, and clear the defrost drain line to prevent water pooling inside the refrigerator or leaking onto the floor.",
    whyItMatters:
      "An expired water filter loses its ability to remove contaminants — and eventually restricts flow so severely that the ice maker stops producing or the dispenser slows to a trickle. The defrost drain line is a separate issue but equally common: a clogged drain causes water to pool at the bottom of the refrigerator or freezer, then leak onto your kitchen floor.",
    instructions: [
      "WATER FILTER: Locate the filter — common locations are inside the upper right of the fridge, in the base grille, or in the back",
      "Note the filter model number (printed on the old filter or in the owner's manual)",
      "Turn off the ice maker before changing the filter to prevent air from entering the ice system",
      "Remove the old filter — twist counterclockwise (most models) or press the release button",
      "Remove any protective caps from the new filter and insert it — twist clockwise until it locks",
      "Run 2-3 gallons of water through the dispenser to flush the new filter (water will be cloudy at first — this is normal carbon fines)",
      "Reset the filter indicator light per the owner's manual (usually press and hold a button for 3-5 seconds)",
      "Turn the ice maker back on and discard the first 1-2 batches of ice",
      "DRAIN LINE: Locate the defrost drain hole at the bottom back wall of the refrigerator compartment (or freezer in some models)",
      "If you see standing water or ice near the drain, it's clogged",
      "Use a turkey baster filled with warm water to flush the drain line, or use a pipe cleaner to gently clear debris",
      "Pour a small amount of warm water with a teaspoon of baking soda into the drain to deodorize and prevent algae growth",
      "Check the drain pan underneath the refrigerator — empty and clean if needed (most models evaporate the water naturally)",
    ],
    frequency: {
      intervalMonths: 6,
      seasonalAdjustments: {
        note: "Replace the water filter every 6 months or per the manufacturer's recommended gallon capacity (typically 200-300 gallons). Clear the drain line annually or whenever you notice water pooling.",
      },
      triggerConditions: [
        "Filter indicator light turns on",
        "Water dispenser flow is noticeably slower",
        "Ice has an off taste or odor",
        "Water pooling at the bottom of the refrigerator or on the floor beneath it",
        "Ice forming on the back wall of the freezer",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 15,
    toolsRequired: [
      "replacement water filter (check model number)",
      "turkey baster or pipe cleaner (for drain line)",
      "towels",
    ],
    materialsCost: { low: 20, high: 60 },
    professionalCost: { low: 100, high: 200 },
    skipConsequences: {
      shortTerm:
        "Expired filter stops removing contaminants — chlorine taste, sediment, and potential bacteria pass through; slow dispenser and ice maker shutdown from restricted flow",
      longTerm:
        "Clogged drain line causes water damage to refrigerator interior, warped shelves, and mold growth; water leaking onto kitchen floor damages flooring and subfloor; bacterial growth in the old filter can make the water supply worse than unfiltered tap water",
      costOfNeglect:
        "A $25-$60 filter every 6 months protects your family's water quality. A clogged drain line creates $200-$500+ in water damage if left unchecked.",
    },
    safetyNotes: [
      "Use only manufacturer-approved or NSF-certified replacement filters — cheap knockoffs may not filter contaminants effectively and can restrict flow",
      "Always flush 2-3 gallons through a new filter before drinking — carbon fines are harmless but unpleasant",
      "If the drain line is severely frozen, use a hair dryer on low heat to thaw — never use boiling water directly on plastic components",
    ],
    seasonalRelevance: ["spring", "fall"],
    priority: "medium" as const,
    tags: [
      "refrigerator",
      "water-filter",
      "drain-line",
      "diy",
      "semi-annual",
      "water-quality",
      "appliances",
    ],
  },

  // ================================================================
  // DISHWASHER  (componentTemplateKey: "dishwasher")
  // ================================================================
  {
    key: "appl_dsh_001",
    componentTemplateKey: "dishwasher",
    systemCategory: "appliances",
    name: "Clean Filter and Run Cleaning Cycle",
    description:
      "Remove and clean the dishwasher's filter assembly, then run a dedicated cleaning cycle with a dishwasher cleaner or white vinegar to dissolve grease, mineral deposits, and food residue from the spray system, pump, and interior walls.",
    whyItMatters:
      "Modern dishwashers use a manual-clean filter instead of the old self-cleaning hard food disposers. If you never clean it, food particles recirculate in the wash water and redeposit on your 'clean' dishes — producing a gritty film and foul odor. Most people don't even know the filter exists, and it's the #1 cause of dishwasher complaints.",
    instructions: [
      "Locate the filter assembly — it's on the bottom of the dishwasher tub, usually below the lower spray arm",
      "Remove the lower dish rack for access",
      "Twist the cylindrical filter counterclockwise and lift it out (most models have a cylindrical upper filter and a flat mesh lower filter)",
      "Rinse both filter components under hot running water",
      "Use a soft brush (old toothbrush) to scrub away stuck food particles and grease",
      "For heavy buildup, soak the filters in warm water with a tablespoon of dish soap for 15 minutes",
      "Inspect the filter housing in the dishwasher tub — wipe out any debris trapped in the sump area",
      "Reinstall the filter assembly — twist clockwise until it locks into place",
      "Replace the lower rack",
      "Place a dishwasher cleaning tablet in the detergent dispenser — or place a cup of white vinegar upright on the top rack",
      "Run a hot water cycle (heavy or sanitize cycle) with the dishwasher empty",
      "After the cycle, wipe down the door edges, gasket, and interior sidewalls with a damp cloth — these areas don't get spray coverage",
    ],
    frequency: {
      intervalMonths: 1,
      seasonalAdjustments: {
        note: "Clean the filter monthly. Run a full cleaning cycle monthly or whenever dishes come out with a film or odor. Heavy-use households should clean the filter every 2 weeks.",
      },
      triggerConditions: [
        "Dishes come out with a gritty film or food particles",
        "Dishwasher has a foul odor when opened",
        "Standing water in the bottom of the tub after a cycle",
        "Dishes not getting clean despite proper detergent and cycle selection",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 15,
    toolsRequired: [
      "soft brush or old toothbrush",
      "dishwasher cleaning tablets or white vinegar",
      "damp cloth",
    ],
    materialsCost: { low: 0, high: 8 },
    professionalCost: { low: 75, high: 150 },
    skipConsequences: {
      shortTerm:
        "Food particles recirculate and deposit on clean dishes; foul odor permeates the kitchen every time the dishwasher is opened; cloudy glassware and gritty plates",
      longTerm:
        "Clogged filter restricts water flow to the spray arms, dramatically reducing cleaning performance; grease buildup in the pump and spray system causes mechanical failure; mineral deposits eventually block spray arm nozzles permanently",
      costOfNeglect:
        "A free 10-minute filter cleaning monthly prevents the most common dishwasher complaint — dishes that come out dirty",
    },
    safetyNotes: [
      "Never use bleach and vinegar together — the combination produces toxic chlorine gas",
      "Run your kitchen sink hot water for 30 seconds before starting the dishwasher — this ensures the first fill is hot, improving cleaning performance",
      "Do not use regular dish soap in a dishwasher — it creates excessive suds that can overflow and damage the machine",
    ],
    seasonalRelevance: ["spring", "summer", "fall", "winter"],
    priority: "high" as const,
    tags: [
      "dishwasher",
      "filter",
      "cleaning",
      "diy",
      "monthly",
      "appliances",
    ],
  },
  {
    key: "appl_dsh_002",
    componentTemplateKey: "dishwasher",
    systemCategory: "appliances",
    name: "Inspect Spray Arms and Door Seal",
    description:
      "Remove and inspect the upper and lower spray arms for clogged nozzles, cracks, or bearing wear. Check the door gasket for mold, tears, and proper sealing to prevent leaks.",
    whyItMatters:
      "Each spray arm nozzle is precisely angled to hit specific rack zones. A single clogged nozzle creates a dead zone where dishes don't get clean. Mineral deposits and food debris gradually plug these tiny holes — especially in hard-water areas. The door gasket prevents leaks, and a deteriorated seal lets water escape onto your kitchen floor during every cycle.",
    instructions: [
      "Remove the lower and upper dish racks",
      "Remove the lower spray arm — most pull straight up or unscrew from a center hub",
      "Remove the upper spray arm — usually clips or unscrews from a tower or manifold",
      "Hold each spray arm up to a light and look through the nozzle holes — they should be clear",
      "Use a toothpick or thin wire to clear any clogged nozzle holes",
      "Soak the spray arms in warm water with white vinegar for 30 minutes to dissolve mineral deposits",
      "Rinse thoroughly under running water and verify all holes are open",
      "Check the spray arm bearings/bushings — the arms should spin freely with no wobble or grinding",
      "If a spray arm is cracked, warped, or the bearing is worn, replace it ($15-$40 from the manufacturer)",
      "Reinstall the spray arms and verify they spin freely without hitting the racks",
      "Inspect the door gasket — run your finger along the entire seal looking for tears, hardening, or gaps",
      "Clean the gasket and the door edges with warm soapy water — mold and buildup accumulate in the folds",
      "Close the door and check for any visible gaps in the seal; run a cycle and watch for drips at the door base",
    ],
    frequency: {
      intervalMonths: 6,
      seasonalAdjustments: {
        note: "Every 6 months for most households. Every 3 months in hard-water areas where mineral deposits clog nozzles faster.",
      },
      triggerConditions: [
        "Dishes in certain rack positions consistently come out dirty (dead zone from clogged nozzle)",
        "Visible mineral deposits on the spray arms",
        "Water leaking from the dishwasher door during a cycle",
        "Spray arms not spinning freely or making clicking/grinding noises",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 20,
    toolsRequired: [
      "toothpick or thin wire (for clearing nozzles)",
      "white vinegar (for soaking)",
      "soft cloth",
      "bowl or basin (for soaking spray arms)",
    ],
    materialsCost: { low: 0, high: 5 },
    professionalCost: { low: 100, high: 200 },
    skipConsequences: {
      shortTerm:
        "Clogged nozzles create dead zones where dishes don't get cleaned; leaking door gasket damages kitchen flooring",
      longTerm:
        "Mineral deposits permanently block spray arm nozzles, requiring replacement; chronic door leaks cause mold growth under the dishwasher and damage subfloor and adjacent cabinets",
      costOfNeglect:
        "A 15-minute spray arm cleaning prevents the 'mystery dirty dishes' problem that leads to unnecessary service calls ($150-$250)",
    },
    safetyNotes: [
      "Turn off the dishwasher and ensure no cycle is running before removing spray arms",
      "The spray arm center hub may be hot if the dishwasher recently ran — let it cool",
      "If the door seal is leaking, address it promptly — water under the dishwasher can damage the electrical components beneath the tub",
    ],
    seasonalRelevance: ["spring", "fall"],
    priority: "medium" as const,
    tags: [
      "dishwasher",
      "spray-arms",
      "door-seal",
      "inspection",
      "diy",
      "semi-annual",
      "appliances",
    ],
  },

  // ================================================================
  // WASHING MACHINE  (componentTemplateKey: "washing_machine")
  // ================================================================
  {
    key: "appl_wsh_001",
    componentTemplateKey: "washing_machine",
    systemCategory: "appliances",
    name: "Clean Drum, Dispenser, and Door Seal",
    description:
      "Run a drum cleaning cycle, scrub the detergent/fabric softener dispenser, and thoroughly clean the door gasket (front-loaders) to eliminate mold, mildew, and detergent residue that cause musty laundry odor.",
    whyItMatters:
      "The musty smell on 'clean' laundry isn't coming from the clothes — it's coming from the washing machine. Front-loaders are especially prone to mold growth in the door gasket fold where water and detergent residue sit between cycles. Top-loaders accumulate detergent buildup and mildew around the agitator and tub rim. If your washer smells bad, your clothes carry that smell.",
    instructions: [
      "DOOR SEAL (front-loaders): Peel back the rubber door gasket and inspect the fold — this is where mold and debris hide",
      "Wipe out the gasket fold with a cloth dampened with a 1:1 mixture of water and white vinegar",
      "For heavy mold, use a soft brush with the vinegar solution — scrub all the way around the gasket",
      "Remove any hair pins, coins, or small items trapped in the gasket fold (extremely common)",
      "DISPENSER: Pull out the detergent and fabric softener dispenser drawer (most slide or lift out completely)",
      "Soak the dispenser in hot water with dish soap for 15 minutes",
      "Scrub all compartments with a small brush — pay attention to the fabric softener compartment where residue gels",
      "Clean the dispenser housing (the cavity where the drawer sits) with a damp cloth — mold grows here too",
      "Reinstall the dispenser drawer",
      "DRUM CLEANING: Add a washing machine cleaning tablet to the drum, or use 2 cups of white vinegar in the detergent dispenser",
      "Run the hottest cycle available (many machines have a dedicated 'Clean Washer' or 'Tub Clean' cycle)",
      "After the cycle, leave the door open for several hours to air dry the drum and gasket",
      "Always leave the door ajar between loads to allow air circulation and prevent mold growth",
    ],
    frequency: {
      intervalMonths: 1,
      seasonalAdjustments: {
        note: "Monthly for front-loaders (they trap moisture and are prone to mold). Every 1-2 months for top-loaders. More frequently in humid climates.",
      },
      triggerConditions: [
        "Musty or mildew smell from the machine or clean laundry",
        "Visible mold or dark spots on the door gasket",
        "Detergent residue on clothes after washing",
        "Fabric softener not dispensing properly (clogged dispenser)",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 20,
    toolsRequired: [
      "white vinegar or washing machine cleaner tablets",
      "soft brush or old toothbrush",
      "microfiber cloth",
      "dish soap",
    ],
    materialsCost: { low: 0, high: 10 },
    professionalCost: { low: 75, high: 150 },
    skipConsequences: {
      shortTerm:
        "Musty odor transfers to clean laundry; visible mold in the door gasket; detergent residue leaves white marks on dark clothes",
      longTerm:
        "Mold permanently stains the door gasket, requiring a $150-$300 gasket replacement; bacterial biofilm in the drum causes skin irritation for sensitive individuals; clogged dispensers lead to poor cleaning performance",
      costOfNeglect:
        "A free monthly cleaning prevents the $150-$300 door gasket replacement that becomes necessary when mold is embedded in the rubber",
    },
    safetyNotes: [
      "Never mix bleach and vinegar — the combination produces toxic chlorine gas",
      "If using bleach for mold remediation, run a separate rinse cycle after to remove all bleach before washing clothes",
      "Always leave the washer door open between loads — this single habit prevents 90% of washing machine mold issues",
    ],
    seasonalRelevance: ["spring", "summer", "fall", "winter"],
    priority: "high" as const,
    tags: [
      "washing-machine",
      "cleaning",
      "mold",
      "gasket",
      "dispenser",
      "diy",
      "monthly",
      "appliances",
    ],
  },
  {
    key: "appl_wsh_002",
    componentTemplateKey: "washing_machine",
    systemCategory: "appliances",
    name: "Inspect Hoses and Connections",
    description:
      "Inspect the hot and cold water supply hoses for bulging, cracking, corrosion, or leaks at the connections. Washing machine hose failures are one of the top causes of catastrophic home water damage.",
    whyItMatters:
      "A burst washing machine hose releases 400-600 gallons of water per hour — and if you're at work or asleep, a single hose failure can cause $10,000-$50,000+ in water damage before anyone notices. Insurance companies rank washing machine hose failures among the top 5 causes of residential water damage claims. Replacing hoses every 5 years costs $20 and takes 10 minutes.",
    instructions: [
      "Pull the washing machine away from the wall enough to access the back",
      "Visually inspect both the hot and cold water supply hoses from the wall valves to the machine connections",
      "Look for bulging, blistering, cracking, or worn spots on rubber hoses — any of these mean replacement is overdue",
      "Check both connection points (wall valve and machine inlet) for drips, corrosion, or mineral buildup",
      "Gently feel along each hose for soft spots or bubbling under the surface (incipient failure)",
      "Check the hose age — rubber hoses should be replaced every 3-5 years regardless of appearance",
      "If you have rubber hoses, upgrade to braided stainless steel hoses ($15-$25/pair) — they're burst-resistant and last 8-10 years",
      "Verify the wall shutoff valves turn freely — test by closing and reopening them",
      "If the valves are seized or dripping when operated, have a plumber replace them with quarter-turn ball valves",
      "Check the drain hose for proper placement — it should be secured 34-36 inches above the floor in the standpipe or laundry tub",
      "Consider installing an automatic shutoff valve system that detects leaks and closes the water supply ($100-$300 installed)",
    ],
    frequency: {
      intervalMonths: 6,
      seasonalAdjustments: {
        note: "Visual inspection every 6 months. Replace rubber hoses every 3-5 years. Replace braided stainless steel hoses every 8-10 years. Inspect immediately before extended vacations.",
      },
      triggerConditions: [
        "Any visible bulging, cracking, or drip at the hose connections",
        "Hoses are more than 5 years old (rubber) or 10 years old (stainless braided)",
        "Rust stains on the wall behind the washer (indicates slow leak at connections)",
        "Before leaving home for vacation — consider shutting off the supply valves",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 10,
    toolsRequired: [
      "flashlight",
      "adjustable pliers (for tightening connections if needed)",
    ],
    materialsCost: { low: 0, high: 25 },
    professionalCost: { low: 75, high: 175 },
    skipConsequences: {
      shortTerm:
        "Slow leak at connections causes hidden mold growth behind the washer; bulging hose can burst at any time without warning",
      longTerm:
        "Catastrophic hose failure floods the laundry room and adjacent areas — 400-600 gallons per hour; $10,000-$50,000+ in water damage including flooring, drywall, and personal property; mold remediation costs add thousands more",
      costOfNeglect:
        "A $15-$25 pair of braided stainless steel hoses every 5-8 years prevents one of the most expensive and common homeowner insurance claims",
    },
    safetyNotes: [
      "Turn off the water supply valves whenever you leave for vacation — this single step eliminates the risk of catastrophic flooding while away",
      "If your shutoff valves are seized and won't turn, do NOT force them — the valve stem can break and cause flooding. Have a plumber replace them.",
      "Never use Teflon tape on washing machine hose connections — the rubber washer inside the coupling makes the seal. Teflon tape can interfere with proper seating.",
    ],
    seasonalRelevance: ["spring", "fall"],
    priority: "critical" as const,
    tags: [
      "washing-machine",
      "hoses",
      "water-damage",
      "inspection",
      "diy",
      "semi-annual",
      "flood-prevention",
      "appliances",
    ],
  },
  {
    key: "appl_wsh_003",
    componentTemplateKey: "washing_machine",
    systemCategory: "appliances",
    name: "Level Machine and Check for Vibration",
    description:
      "Verify the washing machine is level in all directions and the leveling feet are properly adjusted. An unleveled washer vibrates excessively during the spin cycle, which damages the machine, the floor, and anything nearby.",
    whyItMatters:
      "A washing machine spins the drum at 1,000-1,600 RPM. At those speeds, even a quarter-inch tilt creates a massive imbalance that shakes the entire machine violently. The internal shock absorbers and suspension springs absorb some of this, but constant unbalanced spinning wears them out fast — turning a $50 leveling fix into a $300-$500 suspension repair.",
    instructions: [
      "Place a bubble level on top of the washer — check front-to-back and side-to-side",
      "If not level, locate the leveling feet at the bottom corners of the machine (all four corners)",
      "Most leveling feet thread in and out — turn clockwise to raise, counterclockwise to lower",
      "Adjust the front feet first — they're accessible without moving the machine",
      "Many machines have self-adjusting rear legs — lift the front of the machine 4-6 inches and set it back down firmly. The rear legs should self-level.",
      "Recheck with the level after each adjustment",
      "Once level, tighten the lock nuts on the leveling feet so they don't vibrate loose",
      "Rock the machine by pushing on the top corners — it should not wobble or rock in any direction",
      "Run a spin cycle with a normal load and observe — the machine should vibrate slightly but not walk or bang",
      "If the machine still vibrates excessively when level, check for worn shock absorbers or suspension springs (professional diagnosis needed)",
      "For machines on a pedestal, verify the pedestal is also level and the machine is properly secured to it",
    ],
    frequency: {
      intervalMonths: 12,
      seasonalAdjustments: {
        note: "Check annually and whenever the machine starts vibrating excessively or walking during spin cycles. Recheck after any time the machine is moved (filter cleaning, hose inspection, etc.).",
      },
      triggerConditions: [
        "Excessive vibration or banging during spin cycle",
        "Machine moves or 'walks' across the floor during spin",
        "Loud thumping from the machine",
        "After moving or reinstalling the machine",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 15,
    toolsRequired: [
      "bubble level",
      "adjustable wrench or pliers (for lock nuts on leveling feet)",
    ],
    materialsCost: { low: 0, high: 0 },
    professionalCost: { low: 75, high: 150 },
    skipConsequences: {
      shortTerm:
        "Violent vibration during spin cycle causes the machine to walk across the floor; banging noises annoy the household and neighbors (in apartments); unbalanced loads trigger error codes and incomplete cycles",
      longTerm:
        "Premature failure of shock absorbers and suspension springs ($200-$500 repair); cracked concrete pedestal or damaged flooring from repeated impact; drum bearing failure from chronic imbalance ($300-$600 repair)",
      costOfNeglect:
        "5 minutes with a bubble level prevents $200-$600 in suspension and bearing repairs caused by chronic imbalance",
    },
    safetyNotes: [
      "A violently vibrating washer can disconnect water hoses, causing flooding",
      "If the machine is banging hard enough to move, stop the cycle immediately — continuing damages the suspension and can break the tub",
      "On upper floors or elevated platforms, excessive vibration is a structural concern — ensure the floor can handle the dynamic load",
    ],
    seasonalRelevance: ["spring"],
    priority: "medium" as const,
    tags: [
      "washing-machine",
      "leveling",
      "vibration",
      "diy",
      "annual",
      "appliances",
    ],
  },

  // ================================================================
  // DRYER  (componentTemplateKey: "dryer")
  // ================================================================
  {
    key: "appl_dry_001",
    componentTemplateKey: "dryer",
    systemCategory: "appliances",
    name: "Deep Clean Lint Trap and Housing",
    description:
      "Remove the lint screen and deep clean the lint trap housing (the slot the screen slides into) to remove accumulated lint that the screen doesn't catch. Clean the lint screen itself with soap and water to remove dryer sheet residue that blocks airflow.",
    whyItMatters:
      "Even if you clean the lint screen after every load (and you should), fine lint passes through the screen and accumulates in the housing below. Over time, this buildup restricts airflow through the dryer — forcing the heating element to work harder, increasing dry times, and creating a fire hazard. Dryer fires cause an estimated 2,900 home fires per year in the US, and lint buildup is the leading cause.",
    instructions: [
      "Remove the lint screen from the dryer",
      "Roll the screen under warm running water — if water pools on the screen instead of passing through, dryer sheet residue is blocking the mesh",
      "Wash the screen with warm water and a few drops of dish soap, scrubbing gently with a soft brush",
      "Rinse thoroughly and let the screen dry completely before reinstalling",
      "Using a dryer lint brush (long, narrow flexible brush) or a vacuum crevice attachment, clean deep inside the lint trap housing",
      "You'll be surprised how much lint accumulates in this cavity — especially at the bottom where it compacts",
      "Use a flashlight to verify the housing is clear all the way down",
      "Remove the exhaust duct from the back of the dryer and vacuum the lint from the duct connection point on the dryer",
      "Clean around and behind the dryer — lint accumulates on the floor around the unit",
      "Reinstall the screen and verify it seats properly in the housing",
    ],
    frequency: {
      intervalMonths: 3,
      seasonalAdjustments: {
        note: "Deep clean the housing quarterly. Clean the lint screen after EVERY load. Wash the screen with soap and water monthly if you use dryer sheets (they leave an invisible residue that blocks airflow).",
      },
      triggerConditions: [
        "Clothes take longer than one cycle to dry",
        "Dryer runs hot to the touch on the exterior",
        "Laundry room feels excessively warm or humid during drying",
        "Burning smell from the dryer",
        "Lint screen passes water pooling test (dryer sheet residue)",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 15,
    toolsRequired: [
      "dryer lint brush (long flexible brush — $8-$12)",
      "vacuum with crevice attachment",
      "dish soap and soft brush (for screen cleaning)",
      "flashlight",
    ],
    materialsCost: { low: 0, high: 12 },
    professionalCost: { low: 75, high: 150 },
    skipConsequences: {
      shortTerm:
        "Extended drying times waste energy and money; dryer overheats and cycles the high-limit thermostat; clothes come out still damp",
      longTerm:
        "FIRE HAZARD — lint accumulation in the housing and duct is the #1 cause of dryer fires; heating element burns out from overwork ($100-$250 repair); thermal fuse blows repeatedly",
      costOfNeglect:
        "2,900 dryer fires per year in the US are caused by lint buildup. A 10-minute quarterly cleaning is the most important fire prevention task for any dryer owner.",
    },
    safetyNotes: [
      "FIRE SAFETY: Never run a dryer without the lint screen in place",
      "If you smell burning from the dryer, stop it immediately, unplug it, and inspect for lint ignition",
      "Dryer sheets reduce screen airflow by 25-75% over time — wash the screen with soap monthly if you use them",
      "Never leave a dryer running when you leave the house or go to sleep",
    ],
    seasonalRelevance: ["spring", "summer", "fall", "winter"],
    priority: "critical" as const,
    tags: [
      "dryer",
      "lint-trap",
      "fire-safety",
      "cleaning",
      "diy",
      "quarterly",
      "appliances",
    ],
  },
  {
    key: "appl_dry_002",
    componentTemplateKey: "dryer",
    systemCategory: "appliances",
    name: "Clean and Inspect Vent Duct",
    description:
      "Disconnect, inspect, and clean the dryer exhaust vent duct from the back of the dryer to the exterior termination point. Verify the exterior vent flap opens freely and the duct has no kinks, sags, or crushing.",
    whyItMatters:
      "The vent duct carries heat, moisture, and lint from the dryer to the outside. A clogged vent is a fire waiting to happen — lint accumulates in duct bends, at the exterior flap, and in any sagging sections. Beyond the fire risk, a restricted vent doubles drying time, quadruples energy waste, and causes the dryer to overheat. The CPSC and every dryer manufacturer recommend annual vent cleaning.",
    instructions: [
      "Unplug the dryer (electric) or turn off the gas supply (gas dryers) — CRITICAL for gas dryers",
      "Pull the dryer away from the wall to access the vent duct connection",
      "Disconnect the vent duct from the dryer exhaust port — loosen the clamp or tape",
      "Inspect the duct material — if it's flexible white vinyl or foil-only (not foil with wire reinforcement), replace it with rigid or semi-rigid aluminum duct. Vinyl is a fire hazard and violates code.",
      "Use a dryer vent cleaning kit (long flexible brush that attaches to a drill) to brush out the entire duct length from inside",
      "Alternatively, use a leaf blower to blow lint out from the dryer end toward the exterior",
      "Go outside and locate the exterior vent termination — remove the cover and clean out accumulated lint",
      "Verify the vent flap opens freely and closes fully — a stuck-open flap lets cold air, insects, and rodents into the duct",
      "Check the vent flap screen if present — heavy lint buildup on screens is common and restricts flow (some codes have removed screen requirements for this reason)",
      "Reassemble the duct connections — use foil tape (not duct tape) at all joints. Duct tape deteriorates from heat and falls off.",
      "Push the dryer back into position, ensuring the duct is not kinked, crushed, or excessively bent",
      "Run the dryer on air-only (no heat) for 5 minutes and verify strong airflow at the exterior vent",
    ],
    frequency: {
      intervalMonths: 12,
      seasonalAdjustments: {
        note: "Annual cleaning is the minimum. Every 6 months for long duct runs (over 15 feet), ducts with multiple bends, or heavy-use households. Professional cleaning recommended for inaccessible or complex duct routing.",
      },
      triggerConditions: [
        "Clothes take more than one cycle to dry",
        "Exterior of the dryer is hot to the touch",
        "Laundry room is excessively warm or humid during drying",
        "Exterior vent flap barely opens when dryer is running (restricted airflow)",
        "Burning or musty smell from the dryer",
      ],
    },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 45,
    toolsRequired: [
      "dryer vent cleaning brush kit (flexible rods that attach to a drill — $20-$40)",
      "screwdriver or nut driver (for duct clamps)",
      "foil tape (not duct tape — foil tape is heat-rated)",
      "vacuum with crevice attachment",
      "flashlight",
    ],
    materialsCost: { low: 5, high: 40 },
    professionalCost: { low: 100, high: 250 },
    skipConsequences: {
      shortTerm:
        "Extended drying times waste energy; dryer overheats and trips the thermal fuse ($10-$20 part but a service call to diagnose); laundry room humidity increases",
      longTerm:
        "FIRE HAZARD — clogged dryer vents are the leading cause of residential dryer fires; carbon monoxide risk from gas dryers with restricted vents (exhaust backs up into the laundry room); premature dryer failure from chronic overheating",
      costOfNeglect:
        "A $100-$250 professional vent cleaning (or a $20-$40 DIY kit) prevents $5,000-$50,000+ in fire damage. This is non-negotiable maintenance.",
    },
    safetyNotes: [
      "CRITICAL for gas dryers: Turn off the gas supply before disconnecting the vent duct — if you accidentally disconnect the gas line, you have a gas leak",
      "Never use white plastic vinyl ducting — it's a fire hazard and violates code in every jurisdiction. Use rigid or semi-rigid aluminum only.",
      "Use foil tape at all duct joints — regular duct tape fails from heat exposure within 1-2 years",
      "If your dryer vent run exceeds 25 feet or has more than 2 ninety-degree bends, consider installing a dryer vent booster fan",
      "Gas dryer exhaust contains carbon monoxide — a restricted vent can push CO back into the home",
    ],
    seasonalRelevance: ["fall"],
    priority: "critical" as const,
    tags: [
      "dryer",
      "vent-duct",
      "fire-safety",
      "cleaning",
      "diy",
      "annual",
      "co-safety",
      "appliances",
    ],
  },

  // ================================================================
  // OVEN / RANGE  (componentTemplateKey: "oven_range")
  // ================================================================
  {
    key: "appl_ovn_001",
    componentTemplateKey: "oven_range",
    systemCategory: "appliances",
    name: "Deep Clean Oven Interior",
    description:
      "Perform a thorough cleaning of the oven interior using either the self-clean cycle or manual cleaning method. Remove baked-on grease, food splatter, and carbon buildup from oven walls, floor, racks, and door glass.",
    whyItMatters:
      "Baked-on grease and food residue don't just look bad — they smoke, smell, and can catch fire during high-heat cooking. Carbon buildup on the oven floor acts as an insulator, creating hot spots that burn food on the bottom while undercooking the top. A clean oven heats more evenly, smells better, and is safer.",
    instructions: [
      "FOR SELF-CLEAN CYCLE: Remove all racks, broiler pans, and thermometers from the oven (the extreme heat warps racks and damages thermometers)",
      "Wipe up any large food pieces or pooled grease from the oven floor — heavy debris during self-clean produces excessive smoke",
      "Lock the oven door (most self-clean cycles auto-lock) and select the self-clean cycle (typically 2-4 hours at 800-900°F)",
      "Ventilate the kitchen — open windows or run the range hood. The cycle produces smoke and odor.",
      "After the cycle completes and the oven cools (1-2 hours), wipe out the white ash residue with a damp cloth",
      "FOR MANUAL CLEANING: Remove racks and soak them in the bathtub with hot water and dish soap (or use a commercial oven rack cleaner)",
      "Apply a commercial oven cleaner or a paste of baking soda and water to the oven interior (avoid heating elements and gas igniters)",
      "Let the cleaner sit for 4-12 hours (overnight is ideal) with the door closed",
      "Wipe out the loosened grease and residue with damp cloths — multiple passes may be needed",
      "For the oven door glass (between the panes), most doors can be partially disassembled to clean the inner glass",
      "Scrub the oven racks with a non-scratch pad, rinse, dry, and reinstall",
      "Clean the oven door gasket gently — do not soak it in cleaner or scrub aggressively",
    ],
    frequency: {
      intervalMonths: 3,
      seasonalAdjustments: {
        note: "Every 3-6 months depending on use. Heavy cooks may need monthly cleaning. Always clean before the holidays when the oven will be in heavy use.",
      },
      triggerConditions: [
        "Smoke or burning smell when the oven is on (from baked-on residue)",
        "Visible grease or food buildup on oven walls or floor",
        "Food burning on the bottom more than normal (carbon buildup creating hot spots)",
        "Oven door glass is opaque from grease splatter between the panes",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 30,
    toolsRequired: [
      "commercial oven cleaner or baking soda paste",
      "rubber gloves",
      "damp cloths or sponges",
      "non-scratch scrub pad (for racks)",
    ],
    materialsCost: { low: 0, high: 10 },
    professionalCost: { low: 100, high: 200 },
    skipConsequences: {
      shortTerm:
        "Smoke and burning odor from residue every time the oven is used; grease spatters on oven walls become permanently baked-on carbon; uneven heating from carbon buildup",
      longTerm:
        "Grease buildup can ignite during high-heat cooking or broiling — oven fires are a real risk; carbon deposits on the oven floor permanently damage the enamel surface; baked-on grease corrodes oven components",
      costOfNeglect:
        "Regular cleaning prevents oven fires and extends the life of the oven interior. A $5 can of oven cleaner is far cheaper than a kitchen fire.",
    },
    safetyNotes: [
      "SELF-CLEAN CAUTION: The extreme heat (800-900°F) can trip the thermal fuse or damage the door lock mechanism on older ovens — some technicians recommend manual cleaning for ovens over 10 years old",
      "Keep children and pets away during self-clean cycles — the oven exterior becomes extremely hot",
      "Ventilate well during self-clean — fumes can irritate lungs, and Teflon-coated items left inside produce toxic fumes",
      "Commercial oven cleaners are caustic — wear rubber gloves and avoid skin/eye contact",
      "Never use oven cleaner on self-cleaning oven surfaces — the cleaner damages the special enamel coating",
    ],
    seasonalRelevance: ["spring", "fall"],
    priority: "medium" as const,
    tags: [
      "oven",
      "range",
      "cleaning",
      "grease",
      "diy",
      "quarterly",
      "fire-safety",
      "appliances",
    ],
  },
  {
    key: "appl_ovn_002",
    componentTemplateKey: "oven_range",
    systemCategory: "appliances",
    name: "Check Burner Flames and Inspect Igniters",
    description:
      "Inspect gas range burner flames for proper color, shape, and evenness. Clean burner ports, check igniter operation, and verify all burners light promptly and burn efficiently. For electric ranges, inspect heating elements for damage.",
    whyItMatters:
      "A properly adjusted gas burner produces blue flames with small yellow tips. Orange or yellow flames indicate incomplete combustion — the burner is producing carbon monoxide and wasting gas. Clogged burner ports cause uneven flames that heat cookware unevenly and can create dangerous flare-ups. Slow or non-functional igniters mean reaching for matches, which is both inconvenient and a safety risk.",
    instructions: [
      "FOR GAS RANGES: Turn on each burner one at a time and observe the flame",
      "Proper flame: blue with small yellow tips, even all the way around the burner, 1-1.5 inches tall",
      "Yellow or orange flames: burner ports are clogged or the air shutter needs adjustment",
      "Uneven flame (tall on one side, low on the other): clogged burner ports on the low side",
      "Turn off the burner and let it cool completely before cleaning",
      "Remove the burner cap and burner head — soak in warm soapy water for 15 minutes",
      "Use a straight pin or needle to clear each individual burner port hole — do NOT use a toothpick (it can break off inside)",
      "Clean the igniter electrode with a soft dry cloth — grease on the electrode prevents sparking",
      "Reassemble the burner, ensuring the cap sits flat and level on the burner head",
      "Relight and verify even blue flames all the way around",
      "Test each igniter — all burners should click and light within 2-3 seconds of turning the knob",
      "FOR ELECTRIC RANGES: Turn on each heating element and verify it glows evenly — dark spots indicate a failing element",
      "Check for visible cracks, blistering, or pitting on electric coil elements — replace if damaged",
      "For glass-top ranges, check for cracks in the glass surface — a cracked cooktop is a shock hazard",
    ],
    frequency: {
      intervalMonths: 6,
      seasonalAdjustments: {
        note: "Every 6 months. Clean burner ports whenever you notice uneven flames or slow lighting. Immediately investigate any burner producing yellow/orange flames.",
      },
      triggerConditions: [
        "Yellow or orange flames instead of blue",
        "Burner lights on one side but not the other (clogged ports)",
        "Igniter clicks but burner won't light",
        "Burner produces soot on the bottom of cookware",
        "Gas smell without the burner being on",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 20,
    toolsRequired: [
      "straight pin or needle (for clearing burner ports)",
      "soft dry cloth (for igniter cleaning)",
      "dish soap (for soaking burner components)",
      "soft brush",
    ],
    materialsCost: { low: 0, high: 5 },
    professionalCost: { low: 100, high: 200 },
    skipConsequences: {
      shortTerm:
        "Uneven cooking from clogged burner ports; carbon monoxide production from yellow/orange flames; soot deposits on cookware and kitchen surfaces",
      longTerm:
        "Chronic CO exposure from poorly combusting burners (headaches, fatigue); igniter failure requires part replacement ($40-$80 plus service call); grease buildup around burner ports becomes a flare-up risk",
      costOfNeglect:
        "A 15-minute burner cleaning prevents CO exposure, improves cooking performance, and extends the life of the igniter components",
    },
    safetyNotes: [
      "If you smell gas without any burner being on, do NOT attempt to light anything — leave the house and call your gas utility immediately",
      "Yellow/orange flames produce carbon monoxide — ensure your kitchen has adequate ventilation and a working CO detector",
      "Let burner components cool completely before handling — burner heads retain heat for several minutes",
      "Never use a toothpick to clean burner ports — they break off inside and permanently block the hole",
      "For glass-top ranges, a cracked cooktop surface is an electrocution risk — stop using the damaged element and have it repaired",
    ],
    seasonalRelevance: ["spring", "fall"],
    priority: "high" as const,
    tags: [
      "oven",
      "range",
      "burners",
      "igniters",
      "gas-safety",
      "diy",
      "semi-annual",
      "appliances",
    ],
  },
  {
    key: "appl_ovn_003",
    componentTemplateKey: "oven_range",
    systemCategory: "appliances",
    name: "Inspect Door Gasket and Calibrate Temperature",
    description:
      "Check the oven door gasket for deterioration and verify the oven reaches accurate temperatures using a standalone oven thermometer. A worn gasket leaks heat, and an uncalibrated oven ruins baked goods and wastes energy.",
    whyItMatters:
      "Most home ovens are off by 25-50°F — some by even more. That's enough to ruin a roast, undercook a turkey, or burn every batch of cookies. The door gasket keeps that heat inside, and a worn gasket that leaks hot air makes temperature accuracy even worse. A $7 oven thermometer tells you the truth about your oven's temperature, and calibration is often a simple adjustment.",
    instructions: [
      "DOOR GASKET: With the oven cold, inspect the gasket (fiberglass or rubber seal around the oven door opening)",
      "Look for fraying, hardening, gaps, tears, or sections that have pulled away from the channel",
      "Close the oven door and feel around the edges for hot air escaping during preheating — any warmth indicates a gasket leak",
      "If the gasket is damaged, order a replacement from the manufacturer — most clip or press into a channel and are easy to replace ($20-$60)",
      "Do NOT use the oven with a severely damaged gasket — heat loss increases energy use by 20%+ and creates a burn risk on the exterior surface",
      "TEMPERATURE CALIBRATION: Place a standalone oven thermometer in the center of the middle rack",
      "Preheat the oven to 350°F and wait 20 minutes after it signals 'preheated' for the temperature to stabilize",
      "Read the thermometer — it should read 350°F ± 10°F",
      "If it's off by more than 15°F, consult your owner's manual for the calibration adjustment procedure",
      "Most ovens allow calibration via the control panel — typically accessed through a button combination or settings menu",
      "Adjust in 5-degree increments and retest until the thermometer reads accurately at 350°F",
      "Test at 250°F and 450°F as well to verify accuracy across the range",
      "If the oven cannot be calibrated through the controls, an appliance technician can adjust the thermostat sensor ($100-$200)",
    ],
    frequency: {
      intervalMonths: 12,
      seasonalAdjustments: {
        note: "Annual check is sufficient for most ovens. Check the gasket every 6 months if the oven exterior gets unusually hot during use. Recalibrate whenever baking results seem consistently off.",
      },
      triggerConditions: [
        "Baked goods consistently over- or under-cooking at recommended temperatures",
        "Oven exterior becomes excessively hot during use (gasket leak)",
        "Visible damage or gaps in the door gasket",
        "Oven takes much longer to preheat than usual",
        "After a self-clean cycle (the extreme heat can warp gaskets)",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 30,
    toolsRequired: [
      "standalone oven thermometer ($7-$15 at any kitchen store)",
      "owner's manual (for calibration instructions)",
    ],
    materialsCost: { low: 7, high: 60 },
    professionalCost: { low: 100, high: 200 },
    skipConsequences: {
      shortTerm:
        "Inconsistent cooking results — overcooked or undercooked food at standard recipes; heat leaking from a worn gasket makes the kitchen uncomfortably warm",
      longTerm:
        "A 50°F-off oven wastes energy on every use for years; a failed gasket increases external surface temperature to burn-risk levels and dramatically increases energy consumption; uncalibrated ovens cause food safety issues with undercooked meats",
      costOfNeglect:
        "A $7 oven thermometer and 5 minutes of calibration fix the 'my oven doesn't cook right' problem that frustrates millions of home cooks",
    },
    safetyNotes: [
      "A worn gasket can cause the oven exterior to exceed 200°F — a burn risk for children and pets",
      "During the self-clean cycle, the gasket experiences extreme temperatures that accelerate wear — inspect after every self-clean",
      "If the oven temperature is off by more than 50°F, the temperature sensor may be failing — have it tested by a professional before relying on calibration alone",
    ],
    seasonalRelevance: ["fall"],
    priority: "medium" as const,
    tags: [
      "oven",
      "range",
      "door-gasket",
      "temperature",
      "calibration",
      "diy",
      "annual",
      "appliances",
    ],
  },

  // ================================================================
  // RANGE HOOD  (componentTemplateKey: "range_hood")
  // ================================================================
  {
    key: "appl_rgh_001",
    componentTemplateKey: "range_hood",
    systemCategory: "appliances",
    name: "Clean or Replace Grease Filters",
    description:
      "Remove and deep clean the metal mesh grease filters in the range hood, or replace charcoal filters in ductless (recirculating) models. Grease-saturated filters restrict airflow, reduce hood effectiveness, and are a fire hazard directly above your cooktop.",
    whyItMatters:
      "The grease filter is the first line of defense — it captures airborne grease before it enters the ductwork or fan motor. A saturated filter does two things, both bad: it stops trapping grease (so grease now coats the duct interior and fan), and it restricts airflow (so smoke and cooking fumes stay in your kitchen). Worst case, a grease-saturated filter above an open flame ignites.",
    instructions: [
      "Turn off the range hood and let the filters cool if the hood was recently running",
      "Remove the grease filters — most slide out, unclip, or have a latch mechanism",
      "FOR METAL MESH FILTERS: Place in the dishwasher on a hot cycle with a degreasing detergent",
      "If no dishwasher, soak in very hot water with a generous amount of dish soap and 1/4 cup baking soda for 15-30 minutes",
      "Scrub with a non-scratch brush to remove remaining grease, rinse thoroughly, and let dry before reinstalling",
      "FOR CHARCOAL FILTERS (ductless/recirculating hoods): These cannot be cleaned — replace with new filters per manufacturer specs",
      "Charcoal filters should be replaced every 3-6 months depending on cooking frequency",
      "While filters are out, wipe down the interior of the hood with a degreasing cleaner — especially around the fan intake area",
      "Clean the exterior of the hood with a stainless steel cleaner or warm soapy water (depending on finish)",
      "Reinstall the clean filters and verify they seat properly in the filter tracks",
    ],
    frequency: {
      intervalMonths: 2,
      seasonalAdjustments: {
        note: "Every 1-2 months for heavy cooking (frying, wok cooking, grilling). Every 2-3 months for average use. Charcoal filters (ductless hoods) should be replaced every 3-6 months — they cannot be cleaned.",
      },
      triggerConditions: [
        "Visible grease dripping from the filter or hood",
        "Range hood is noticeably less effective at clearing smoke",
        "Grease buildup visible on the filter when you look up at it",
        "Kitchen smells linger longer than usual after cooking",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 20,
    toolsRequired: [
      "dish soap and baking soda (for soaking)",
      "non-scratch brush",
      "degreasing cleaner",
      "replacement charcoal filters (for ductless hoods)",
    ],
    materialsCost: { low: 0, high: 30 },
    professionalCost: { low: 75, high: 150 },
    skipConsequences: {
      shortTerm:
        "Hood can't clear smoke and cooking fumes — kitchen fills with grease-laden air; grease drips from saturated filter onto the cooktop",
      longTerm:
        "FIRE HAZARD — grease-saturated filters above gas burners can ignite; grease coats the duct interior, creating a grease fire pathway to the roof; fan motor burns out from restricted airflow and grease contamination",
      costOfNeglect:
        "A free filter wash every 1-2 months prevents grease fires and keeps your kitchen air clean. Restaurant grease fires start the same way — saturated filters and grease-coated ducts.",
    },
    safetyNotes: [
      "A grease-soaked filter above an open gas flame is a fire risk — clean filters promptly when they become visibly saturated",
      "When cooking with high heat (frying, searing), always run the range hood — it removes grease particles, smoke, and combustion byproducts from gas burners",
      "If your range hood vents to the outside, verify the exterior vent flap operates freely and isn't blocked — a blocked exhaust duct is a fire hazard when combined with grease buildup",
    ],
    seasonalRelevance: ["spring", "summer", "fall", "winter"],
    priority: "high" as const,
    tags: [
      "range-hood",
      "grease-filter",
      "cleaning",
      "fire-safety",
      "diy",
      "bi-monthly",
      "appliances",
    ],
  },
  {
    key: "appl_rgh_002",
    componentTemplateKey: "range_hood",
    systemCategory: "appliances",
    name: "Clean Fan and Check Motor Operation",
    description:
      "Access and clean the range hood fan blades, housing, and check the motor for proper operation across all speed settings. Grease-coated fan blades become unbalanced, noisy, and less effective at moving air.",
    whyItMatters:
      "Grease that bypasses the filter coats the fan blades and housing interior. Grease-laden blades are heavier and unbalanced, causing vibration, bearing wear, and noise. Over time, the motor strains against grease-thickened bearings until it burns out — and a range hood without a working fan is just a decorative box above your stove.",
    instructions: [
      "Unplug the range hood or turn off the circuit breaker — working around a fan motor requires power to be off",
      "Remove the grease filters to access the fan assembly",
      "Depending on your model, the fan assembly may be accessible from below or may require removing a cover panel",
      "Spray the fan blades and housing with a degreasing kitchen cleaner — let it sit for 5-10 minutes",
      "Wipe the fan blades carefully with a cloth or soft brush — remove all grease buildup",
      "For heavy grease deposits, use a plastic scraper to remove thick layers before wiping",
      "Clean the fan housing interior with a degreasing cleaner and cloth",
      "Check that the fan spins freely by hand — it should rotate smoothly without grinding, sticking, or excessive wobble",
      "If the fan wobbles, check for grease buildup on one side (uneven weight) or a loose fan blade on the shaft",
      "Restore power and test the fan on all speed settings — listen for unusual sounds (grinding, squealing, humming without spinning)",
      "Verify the fan moves a noticeable amount of air on high speed — hold a paper towel near the intake to confirm suction",
      "If the fan runs but moves little air, the duct may be blocked — inspect the ductwork for grease buildup or blockage",
    ],
    frequency: {
      intervalMonths: 6,
      seasonalAdjustments: {
        note: "Every 6-12 months depending on cooking habits. Heavy frying and wok cooking increases grease bypass to the fan. Clean more frequently if you notice the fan becoming louder.",
      },
      triggerConditions: [
        "Fan is louder than normal or makes grinding/squealing sounds",
        "Fan vibrates noticeably at higher speeds",
        "Fan runs but doesn't seem to move much air",
        "Visible grease buildup on fan blades when looking up past the filters",
        "Fan doesn't turn on or only works on some speed settings",
      ],
    },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 30,
    toolsRequired: [
      "degreasing kitchen cleaner",
      "soft cloths and brush",
      "screwdriver (for accessing fan housing on some models)",
      "plastic scraper (for heavy grease)",
      "flashlight",
    ],
    materialsCost: { low: 0, high: 10 },
    professionalCost: { low: 100, high: 250 },
    skipConsequences: {
      shortTerm:
        "Noisy, vibrating fan that's annoying enough to discourage use; reduced airflow means smoke and grease linger in the kitchen",
      longTerm:
        "Fan motor burns out from grease-laden bearings and imbalance ($150-$400 motor replacement or full hood replacement); grease buildup in the ductwork above the fan creates a grease fire pathway; complete range hood failure leaves the kitchen without ventilation",
      costOfNeglect:
        "A 20-minute fan cleaning twice a year prevents a $150-$400 motor replacement and maintains the kitchen ventilation your family depends on",
    },
    safetyNotes: [
      "Always disconnect power before cleaning the fan — fan blades can cause injury if the motor activates",
      "Degreasing sprays are flammable — do not use them near an open flame or hot burner",
      "If the motor makes grinding noises or smells like burning, stop using it and have it inspected — a failing motor near grease is a fire risk",
      "Never operate the range hood without the grease filters installed — the filters protect the fan and ductwork from direct grease exposure",
    ],
    seasonalRelevance: ["spring", "fall"],
    priority: "medium" as const,
    tags: [
      "range-hood",
      "fan",
      "motor",
      "cleaning",
      "diy",
      "semi-annual",
      "appliances",
    ],
  },
];

export const seed = internalMutation({
  handler: async (ctx) => {
    let inserted = 0;
    let skipped = 0;

    for (const task of applianceMaintenanceTasks) {
      // Check if task already exists by key
      const existing = await ctx.db
        .query("maintenanceTasks")
        .withIndex("by_key", (q) => q.eq("key", task.key))
        .first();

      if (existing) {
        skipped++;
        continue;
      }

      await ctx.db.insert("maintenanceTasks", task);
      inserted++;
    }

    console.log(
      `[tasks_appliances] Seeded ${inserted} appliance maintenance tasks (${skipped} already existed)`
    );
    return { inserted, skipped, total: applianceMaintenanceTasks.length };
  },
});
