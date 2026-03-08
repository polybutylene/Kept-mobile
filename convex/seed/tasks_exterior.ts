import { internalMutation } from "../_generated/server";

// ─────────────────────────────────────────────────────────────────────────────
// EXTERIOR Maintenance Tasks — 12 tasks across 7 component types
// Source: Manufacturer guidelines, building science best practices,
//         and field experience from contractors and home inspectors.
// Cost basis: 2025 US National Average
// ─────────────────────────────────────────────────────────────────────────────

const exteriorMaintenanceTasks = [
  // ================================================================
  // VINYL SIDING  (componentTemplateKey: "vinyl_siding")
  // ================================================================
  {
    key: "ext_sid_001",
    componentTemplateKey: "vinyl_siding",
    systemCategory: "exterior",
    name: "Clean and Power Wash Siding",
    description:
      "Clean the entire exterior vinyl siding surface using a garden hose with a soft brush or a low-pressure power washer to remove dirt, mildew, algae, pollen, and atmospheric grime that accumulate over the year. Work from bottom to top to prevent streak marks.",
    whyItMatters:
      "Vinyl siding is marketed as low-maintenance, not no-maintenance. Dirt and biological growth (mildew, algae, mold) don't just look bad — they trap moisture against the siding surface, stain permanently if left too long, and create a breeding ground for organisms that eventually work behind the siding. Regular cleaning keeps the siding looking fresh and prevents the kind of deep staining that no amount of cleaning can remove.",
    instructions: [
      "Choose your method: garden hose with a long-handled soft bristle brush, or a power washer on LOW pressure (no more than 1,300 PSI)",
      "CRITICAL: If using a power washer, never aim upward under the siding laps — water forced under the siding causes moisture damage to the sheathing and framing",
      "Mix a cleaning solution: for general cleaning, use 1/3 cup powdered laundry detergent + 2/3 cup powdered household cleaner + 1 gallon of water",
      "For mildew and algae (green or black staining), add 1 quart of bleach to the solution, or use a commercial vinyl siding cleaner",
      "Start at the bottom of the wall and work upward — this prevents dirty runoff from creating streaks on dry siding below",
      "Apply the cleaning solution with a soft brush or pump sprayer and let it dwell for 5-10 minutes (don't let it dry)",
      "Scrub stubborn spots with a soft bristle brush — never use abrasive pads or steel wool on vinyl",
      "Rinse from top to bottom with clean water to wash away all cleaning solution and loosened grime",
      "Pay extra attention to north-facing walls (most mildew growth), areas under eaves (least rain-washed), and near landscaping (soil splash)",
      "Inspect the siding while cleaning — you'll notice damage more easily when the surface is clean and you're close up",
    ],
    frequency: {
      intervalMonths: 12,
      seasonalAdjustments: {
        note: "Annual cleaning in spring or early summer. Homes in humid climates, near trees, or with north-facing exposure may need semi-annual cleaning. Clean before any exterior painting or caulking work.",
      },
      triggerConditions: [
        "Visible green or black mildew/algae growth on the siding",
        "General dinginess or discoloration, especially on north-facing walls",
        "Preparing the home for sale (curb appeal)",
        "Before re-caulking or inspecting siding for damage",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 120,
    toolsRequired: [
      "garden hose with spray nozzle or low-pressure power washer (1,300 PSI max)",
      "long-handled soft bristle brush",
      "pump sprayer or bucket (for cleaning solution)",
      "cleaning solution (detergent/cleaner mix or commercial vinyl siding cleaner)",
    ],
    materialsCost: { low: 5, high: 30 },
    professionalCost: { low: 200, high: 500 },
    skipConsequences: {
      shortTerm:
        "Mildew and algae growth accelerates and spreads to larger areas; dirt and grime become permanently embedded in the vinyl surface texture",
      longTerm:
        "Deep staining that cannot be removed even with aggressive cleaning; mildew works behind siding laps and onto sheathing, causing hidden moisture damage; curb appeal deteriorates significantly, affecting home value",
      costOfNeglect:
        "An annual cleaning costs $5-$30 DIY or $200-$500 professional. Permanently stained siding panels cost $200-$500+ per section to replace.",
    },
    safetyNotes: [
      "NEVER aim a power washer upward under siding laps — water forced behind the siding causes sheathing damage, mold, and rot",
      "Keep pressure below 1,300 PSI — higher pressure can crack vinyl siding, especially in cold weather when vinyl is brittle",
      "Bleach solutions can damage landscaping — wet plants before and after, or cover sensitive plants with plastic sheeting",
      "Wear eye protection when using a power washer or overhead cleaning solutions",
    ],
    seasonalRelevance: ["spring"],
    priority: "medium" as const,
    tags: [
      "siding",
      "vinyl",
      "cleaning",
      "power-wash",
      "diy",
      "annual",
      "curb-appeal",
      "exterior",
    ],
  },
  {
    key: "ext_sid_002",
    componentTemplateKey: "vinyl_siding",
    systemCategory: "exterior",
    name: "Inspect Siding for Damage and Check Caulking",
    description:
      "Walk the entire home perimeter and inspect vinyl siding for cracks, warping, loose panels, holes, and impact damage. Check caulking at all siding terminations — around windows, doors, trim, and penetrations (hose bibs, light fixtures, vents).",
    whyItMatters:
      "Vinyl siding is the outermost layer of your home's weather barrier, but it's not waterproof by itself — it's a rain screen designed to shed most water while allowing any moisture that gets behind it to drain and dry. Cracks, holes, and loose panels allow water, wind, and pests direct access behind the siding. Failed caulking at penetrations and trim is the #1 path for water intrusion into the wall cavity.",
    instructions: [
      "Walk the entire perimeter of the home, examining all siding surfaces from foundation to soffit",
      "Look for cracked panels — vinyl becomes brittle in extreme cold and can crack from impact (baseballs, lawn equipment, hail)",
      "Check for warped or buckled panels — this indicates panels installed too tightly without expansion room, or excessive heat exposure (reflected sunlight from nearby windows)",
      "Verify all panels are locked into the panel below — push gently at the bottom edge to feel the lock engagement",
      "Look for loose or displaced panels, especially after storms with high winds",
      "Check for holes from woodpecker damage, insect boring, or impact — any hole in the siding is a moisture and pest entry point",
      "Inspect caulking around all windows and doors — look for cracked, peeling, or missing caulk",
      "Check caulking around penetrations: hose bibs, dryer vents, exhaust fans, light fixtures, and electrical outlets",
      "Inspect the J-channel and trim pieces around windows, doors, corners, and soffits for gaps or separation",
      "Check the bottom course of siding at the foundation — ensure the starter strip is intact and the siding hasn't been pulled off by ice, animals, or landscaping equipment",
      "Replace damaged panels and re-caulk any failed joints before the next rain season",
    ],
    frequency: {
      intervalMonths: 12,
      seasonalAdjustments: {
        note: "Annual inspection in spring after winter freeze-thaw cycles and storms. Inspect immediately after severe hail or wind storms.",
      },
      triggerConditions: [
        "After severe weather — hail, high winds, or ice storms",
        "Visible damage from lawn equipment, impact, or animal activity",
        "Water stains on interior walls near exterior walls",
        "Pests entering the home (gaps in siding are entry points)",
        "Higher than expected heating or cooling bills (air infiltration through gaps)",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 30,
    toolsRequired: [
      "caulk gun with exterior-grade caulk",
      "zip tool (vinyl siding removal tool — $5 at hardware stores, essential for panel replacement)",
      "replacement panels (if damage is found — match manufacturer and color)",
      "ladder (for upper-story inspection)",
    ],
    materialsCost: { low: 5, high: 50 },
    professionalCost: { low: 150, high: 400 },
    skipConsequences: {
      shortTerm:
        "Water enters through cracks and failed caulking, wetting the sheathing and wall cavity; pests (mice, insects, birds) enter through gaps and holes",
      longTerm:
        "Hidden moisture damage causes sheathing rot and mold growth inside the wall cavity — invisible until drywall damage appears inside; pest infestation behind the siding can cause extensive damage to insulation and wiring; repair costs escalate from a $10 caulk job to $2,000-$5,000+ wall cavity remediation",
      costOfNeglect:
        "A $5-$50 annual inspection and caulk touchup prevents the hidden wall cavity damage that costs thousands to remediate",
    },
    safetyNotes: [
      "Use a stable ladder for upper-story inspections — never overreach from a ladder",
      "A vinyl siding zip tool ($5) makes panel removal and replacement easy and prevents damage to surrounding panels",
      "Do not caulk the bottom edge of siding panels — this blocks the weep drainage path that allows moisture behind the siding to escape",
    ],
    seasonalRelevance: ["spring"],
    priority: "high" as const,
    tags: [
      "siding",
      "vinyl",
      "inspection",
      "caulking",
      "diy",
      "annual",
      "exterior",
    ],
  },

  // ================================================================
  // WOOD DECK  (componentTemplateKey: "wood_deck")
  // ================================================================
  {
    key: "ext_dck_001",
    componentTemplateKey: "wood_deck",
    systemCategory: "exterior",
    name: "Clean and Seal Deck",
    description:
      "Deep clean the wood deck surface to remove dirt, mildew, graying, and old finish, then apply a penetrating wood sealer or stain to protect the wood from moisture, UV damage, and decay. This is the single most important maintenance task for extending a wood deck's life.",
    whyItMatters:
      "Unprotected wood decking absorbs water like a sponge. Every rain cycle swells the wood, and every dry spell shrinks it — this constant expansion and contraction cracks the surface, opens grain, and accelerates rot. UV exposure breaks down lignin (the glue holding wood fibers together), turning the surface gray and fuzzy. A quality penetrating sealer blocks moisture absorption and UV degradation — the two forces that destroy wood decks. A sealed deck lasts 20-30 years; an unsealed deck starts rotting in 3-5.",
    instructions: [
      "Clear all furniture, planters, and items from the deck surface",
      "Sweep the deck thoroughly, paying attention to gaps between boards where debris traps moisture",
      "Apply a deck cleaner or brightener per product directions — use an oxygen bleach-based cleaner (sodium percarbonate) rather than chlorine bleach, which damages wood fibers",
      "Scrub the deck surface with a stiff brush or use a power washer at moderate pressure (1,200-1,500 PSI, fan tip, 6-8 inches from surface)",
      "CRITICAL: Keep the power washer moving — holding in one spot carves visible lines into the wood grain",
      "Work in manageable sections, rinsing thoroughly as you go",
      "Allow the deck to dry completely — at least 48-72 hours of dry weather before applying sealer",
      "Test moisture content: sprinkle water on the deck — if it beads up, the wood is too wet for sealer. If it soaks in within 10 seconds, it's ready.",
      "Apply penetrating oil-based sealer or semi-transparent stain with a brush, roller, or pump sprayer",
      "Work the sealer into the wood grain, back-brushing any puddles or excess",
      "Apply to railings, stairs, and all horizontal surfaces — horizontal surfaces weather fastest",
      "Do not walk on the sealed deck for 24-48 hours per product directions",
      "Apply sealer in temperatures between 50-80°F with no rain forecast for 48 hours",
    ],
    frequency: {
      intervalMonths: 24,
      seasonalAdjustments: {
        note: "Every 2-3 years for penetrating oil sealers. Annually for clear sealers in harsh climates. Film-forming sealers (solid stains) may last 3-5 years. Perform the water bead test annually to determine if re-sealing is needed.",
      },
      triggerConditions: [
        "Water no longer beads on the deck surface (soaks in immediately)",
        "Wood has grayed significantly",
        "Visible mildew or green algae growth on deck boards",
        "Splinters becoming common on the deck surface",
        "Previous sealer is visibly worn, peeling, or flaking",
      ],
    },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 240,
    toolsRequired: [
      "power washer (1,200-1,500 PSI) or stiff deck brush",
      "deck cleaner/brightener (oxygen bleach-based)",
      "pump sprayer or paint roller and tray",
      "paintbrush (for railings and detail work)",
      "penetrating deck sealer or semi-transparent stain",
      "drop cloths or plastic sheeting (to protect adjacent surfaces)",
    ],
    materialsCost: { low: 75, high: 200 },
    professionalCost: { low: 400, high: 1000 },
    skipConsequences: {
      shortTerm:
        "Wood absorbs moisture freely, accelerating grain-raising, splitting, and mildew growth; UV exposure grays the surface and breaks down the wood fibers; splinters become common",
      longTerm:
        "Unprotected wood decking rots from the inside out — joists and beams hidden beneath the deck boards are even more vulnerable; deck boards need premature replacement at $8-$15 per linear foot; structural failure from rotted joists is a safety hazard; a $150 sealing job every 2 years prevents a $5,000-$15,000 deck rebuild",
      costOfNeglect:
        "Sealing costs $75-$200 DIY every 2-3 years. A full deck rebuild due to rot costs $5,000-$15,000+. Sealing is the highest-ROI maintenance task for any wood deck.",
    },
    safetyNotes: [
      "Deck cleaners and sealers contain chemicals — wear gloves, eye protection, and work in well-ventilated conditions",
      "Power washers can cause serious injury — never point at people, pets, or plants at close range",
      "If using a power washer on the deck, use a fan tip (25° or 40°) and maintain 6-8 inches from the surface — a zero-degree tip will gouge the wood",
      "Protect nearby landscaping from deck cleaner runoff — wet plants before and after application",
      "Oil-based sealers and stains are flammable — dispose of rags properly (spread flat to dry or submerge in water) to prevent spontaneous combustion",
    ],
    seasonalRelevance: ["spring", "fall"],
    priority: "high" as const,
    tags: [
      "deck",
      "wood",
      "cleaning",
      "sealing",
      "diy",
      "biennial",
      "exterior",
    ],
  },
  {
    key: "ext_dck_002",
    componentTemplateKey: "wood_deck",
    systemCategory: "exterior",
    name: "Inspect Deck Structure for Rot and Fastener Condition",
    description:
      "Inspect the deck's structural components — ledger board, joists, beams, posts, and footings — for rot, insect damage, and corrosion. Check all fasteners (screws, bolts, joist hangers, and post bases) for rust, looseness, and structural adequacy. Deck structural failures cause serious injuries every year.",
    whyItMatters:
      "Deck collapses are not rare — the North American Deck and Railing Association estimates over 2 million decks in the US are structurally deficient. The most common failure points are the ledger board connection to the house (the #1 cause of deck collapse), rotted posts and beams hidden from view, and corroded joist hangers. Structural inspection catches these life-safety issues before failure.",
    instructions: [
      "Start at the ledger board (where the deck attaches to the house) — this is the most critical connection",
      "Check for signs of rot at the ledger by probing with an awl or screwdriver — soft wood indicates decay",
      "Verify the ledger is secured with lag screws or through-bolts (not just nails or deck screws) into the house rim joist",
      "Check for proper ledger flashing — water should not be able to run down the house wall and behind the ledger",
      "Crawl under the deck (if accessible) and inspect all joists, beams, and posts",
      "Probe all joist ends (where they meet the ledger and the beam) with a screwdriver — soft spots indicate rot",
      "Inspect all joist hangers for rust, missing nails, and proper installation (all nail holes should be filled with the correct joist hanger nails)",
      "Check posts for rot at the base (where they meet the ground or footing) — this is the most common rot location",
      "Verify posts are secured to footings with post bases or anchors — posts should not be directly buried in soil",
      "Check beam-to-post connections for proper hardware — beams sitting on top of notched posts should have through-bolts or approved connectors",
      "Inspect stair stringers for cracks, rot, and secure mounting at top and bottom",
      "Check railing posts for stability — grab each post and push firmly. Any movement indicates a failing connection.",
      "Tighten any loose bolts and replace any rusted or damaged hardware",
    ],
    frequency: {
      intervalMonths: 12,
      seasonalAdjustments: {
        note: "Annual structural inspection in spring. More frequent inspection for decks over 15 years old, decks elevated more than 4 feet off the ground, or decks that carry hot tubs or heavy loads.",
      },
      triggerConditions: [
        "Visible rot on any structural member",
        "Railing posts feel loose when pushed",
        "Deck feels bouncy, spongy, or unstable when walked on",
        "Visible rust on joist hangers or hardware",
        "Deck more than 15 years old with no prior structural inspection",
      ],
    },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 45,
    toolsRequired: [
      "flashlight",
      "screwdriver or awl (for probing for rot)",
      "wrench set (for tightening bolts)",
      "camera or smartphone (for documentation)",
    ],
    materialsCost: { low: 0, high: 50 },
    professionalCost: { low: 200, high: 500 },
    skipConsequences: {
      shortTerm:
        "Rot progresses silently in hidden structural members; loose hardware weakens connections; corroded joist hangers lose load capacity",
      longTerm:
        "SAFETY HAZARD — deck collapse can cause serious injury or death; ledger board failure causes the entire deck to separate from the house; repair costs escalate from $200-$500 hardware replacement to $5,000-$15,000+ full rebuild; liability if guests are injured on a structurally deficient deck",
      costOfNeglect:
        "An annual structural inspection catches problems when they're $100-$500 repairs. A deck collapse causes $10,000-$50,000+ in rebuild costs, medical expenses, and liability.",
    },
    safetyNotes: [
      "Deck collapse is a serious life-safety hazard — do not ignore structural concerns",
      "The ledger board connection is the #1 cause of deck collapse — if it's not properly flashed and fastened, have it professionally evaluated",
      "Never use deck screws as structural fasteners for ledger, beam, or post connections — use lag screws, through-bolts, or approved structural connectors",
      "If you find significant rot in structural members, stop using the deck until repairs are made",
      "Decks elevated more than 30 inches off the ground may require a building permit for repairs — check local codes",
    ],
    seasonalRelevance: ["spring"],
    priority: "critical" as const,
    tags: [
      "deck",
      "wood",
      "structural",
      "inspection",
      "safety",
      "diy",
      "annual",
      "exterior",
    ],
  },

  // ================================================================
  // CONCRETE DRIVEWAY  (componentTemplateKey: "concrete_driveway")
  // ================================================================
  {
    key: "ext_drv_001",
    componentTemplateKey: "concrete_driveway",
    systemCategory: "exterior",
    name: "Seal Driveway Cracks and Apply Sealer",
    description:
      "Fill all cracks in the concrete driveway with a flexible concrete crack filler, and apply a penetrating concrete sealer to protect the surface from water absorption, freeze-thaw damage, road salt, and oil staining.",
    whyItMatters:
      "Concrete is porous — it absorbs water like a hard sponge. In freeze-thaw climates, absorbed water expands when it freezes, creating internal pressure that spalls (pops off) the surface layer. Each freeze-thaw cycle widens existing cracks and creates new ones. Road salt and deicing chemicals accelerate this damage by lowering the freezing point and allowing more freeze-thaw cycles per winter. A penetrating sealer blocks water absorption and dramatically extends the driveway's life.",
    instructions: [
      "Clean the driveway thoroughly — power wash or scrub with a degreaser to remove oil stains, dirt, and organic growth",
      "Let the concrete dry completely — at least 48 hours of dry weather",
      "For cracks up to 1/2 inch wide, use a flexible polyurethane or silicone concrete crack filler applied with a caulk gun",
      "For cracks wider than 1/2 inch, use a backer rod pressed into the crack first, then apply filler over it",
      "For hairline cracks, use a pourable concrete crack filler that flows into narrow spaces",
      "Let crack filler cure per product directions (typically 24-48 hours)",
      "Apply a penetrating concrete sealer (silane or siloxane-based) with a pump sprayer or roller",
      "Apply in thin, even coats — two light coats are better than one heavy coat",
      "Penetrating sealers soak into the concrete without changing the appearance — they don't create a film on the surface",
      "Do not use acrylic or topical sealers on driveways — they become slippery when wet and peel in freeze-thaw conditions",
      "Allow 24 hours of cure time before driving on the sealed surface",
      "Apply sealer in temperatures between 50-80°F with no rain forecast for 24 hours",
    ],
    frequency: {
      intervalMonths: 24,
      seasonalAdjustments: {
        note: "Seal every 2-3 years in freeze-thaw climates. Every 3-5 years in mild climates. Perform the water absorption test annually: pour water on the concrete — if it darkens and absorbs immediately, re-sealing is needed.",
      },
      triggerConditions: [
        "Water absorbs into the concrete surface instead of beading",
        "New cracks appearing or existing cracks widening",
        "Surface spalling (flaking or popping) visible",
        "Before winter in freeze-thaw climates",
        "Oil and chemical stains penetrating the concrete easily",
      ],
    },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 120,
    toolsRequired: [
      "power washer or stiff brush and degreaser",
      "caulk gun with polyurethane crack filler",
      "backer rod (for wide cracks)",
      "pump sprayer or roller (for sealer application)",
      "penetrating concrete sealer (silane/siloxane-based)",
    ],
    materialsCost: { low: 50, high: 150 },
    professionalCost: { low: 300, high: 800 },
    skipConsequences: {
      shortTerm:
        "Water freely absorbs into the concrete, accelerating freeze-thaw spalling; unfilled cracks widen with each freeze-thaw cycle; oil and chemical stains become permanent",
      longTerm:
        "Surface spalling exposes aggregate and creates an increasingly rough, deteriorated surface; expanding cracks become trip hazards; severe freeze-thaw damage requires full slab replacement ($6-$12 per square foot); driveway settling from water undermining the base",
      costOfNeglect:
        "Sealing costs $50-$150 DIY every 2-3 years. Replacing a spalled, cracked driveway costs $3,000-$8,000+ for a typical two-car driveway.",
    },
    safetyNotes: [
      "Concrete sealers contain VOCs — work in well-ventilated conditions and wear a respirator if applying in an enclosed or semi-enclosed area",
      "Sealed concrete can be slippery when wet — avoid topical (film-forming) sealers on driveways and walkways. Penetrating sealers do not create a slippery surface.",
      "Do not apply sealer in direct hot sunlight — it can flash-dry and not penetrate properly",
    ],
    seasonalRelevance: ["fall"],
    priority: "medium" as const,
    tags: [
      "driveway",
      "concrete",
      "sealing",
      "cracks",
      "diy",
      "biennial",
      "exterior",
    ],
  },

  // ================================================================
  // GARAGE DOOR  (componentTemplateKey: "garage_door")
  // ================================================================
  {
    key: "ext_gar_001",
    componentTemplateKey: "garage_door",
    systemCategory: "exterior",
    name: "Lubricate Garage Door Hardware",
    description:
      "Lubricate all moving parts of the garage door system — hinges, rollers, tracks, springs, bearing plates, and the opener chain or screw drive. Proper lubrication reduces noise, friction, and wear on the opener motor, extending the life of the entire system.",
    whyItMatters:
      "A garage door is the largest moving object in your home — it cycles 1,000-1,500 times per year for a typical two-car household. Every cycle stresses hinges, rollers, springs, and the opener motor. Without lubrication, metal-on-metal friction accelerates wear, increases noise, and forces the opener motor to work harder. A $5 can of lubricant every 6 months prevents the $200-$500 roller/hinge replacements and the $250-$500 opener motor burnout that come from running dry.",
    instructions: [
      "Close the garage door completely",
      "Use a white lithium grease or silicone-based garage door lubricant — NOT WD-40 (WD-40 is a solvent, not a lubricant, and it strips existing lubrication)",
      "Apply a small amount of lubricant to each hinge pivot point (where the hinge pin passes through)",
      "Lubricate each roller — both the roller itself and the roller stem where it rotates in the hinge bracket",
      "For steel rollers, apply lubricant to the bearing at each end. Nylon rollers with sealed bearings may not need lubrication — check manufacturer guidance.",
      "Apply a light coat of lubricant along the full length of the torsion springs (above the door) — this prevents rust and reduces stress noise",
      "Lubricate the bearing plates on each side of the torsion spring assembly",
      "For chain-drive openers, apply lubricant to the chain and sprocket. For screw-drive openers, lubricate the full length of the drive screw.",
      "Wipe down (do not lubricate) the inside of the vertical tracks with a clean rag — tracks should be clean and dry for proper roller contact",
      "Open and close the door 2-3 times to distribute the lubricant",
      "Listen for any squeaking or grinding that persists after lubrication — this may indicate a failing roller or worn bearing",
    ],
    frequency: {
      intervalMonths: 6,
      seasonalAdjustments: {
        note: "Every 6 months — spring and fall. In cold climates, lubricate in fall before winter when lubricant thickens and cold metal contracts.",
      },
      triggerConditions: [
        "Squeaking, grinding, or scraping noises during door operation",
        "Door operates more slowly than normal or the opener strains",
        "Visible rust on springs, hinges, or rollers",
        "After replacing any hardware component",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 15,
    toolsRequired: [
      "white lithium grease or silicone-based garage door lubricant spray",
      "clean rag or shop towel",
      "step stool (for reaching upper hinges and springs)",
    ],
    materialsCost: { low: 5, high: 15 },
    professionalCost: { low: 75, high: 150 },
    skipConsequences: {
      shortTerm:
        "Noisy, squeaky door operation; increased friction forces the opener motor to work harder; rollers and hinges wear faster",
      longTerm:
        "Premature roller failure ($15-$30 each × 12 rollers = $180-$360 for a set); opener motor burnout from excessive load ($250-$500 replacement); spring breakage from rust and stress corrosion ($200-$400 for spring replacement); dry hinges bind and cause the door to operate unevenly, stressing the track system",
      costOfNeglect:
        "A $5-$15 can of lubricant twice a year prevents hundreds in premature hardware and opener replacement",
    },
    safetyNotes: [
      "NEVER touch or attempt to adjust torsion springs — they are under extreme tension and can cause serious injury or death if they release unexpectedly",
      "Lubricating the springs from a safe distance with spray lubricant is fine — just don't try to adjust, remove, or work on the spring mechanism",
      "Keep lubricant off the garage floor — it creates a slip hazard. Wipe up any drips immediately.",
      "Do not use WD-40 as a lubricant — it evaporates quickly, strips existing lubrication, and attracts dust",
    ],
    seasonalRelevance: ["spring", "fall"],
    priority: "medium" as const,
    tags: [
      "garage-door",
      "lubrication",
      "hardware",
      "diy",
      "semi-annual",
      "exterior",
    ],
  },
  {
    key: "ext_gar_002",
    componentTemplateKey: "garage_door",
    systemCategory: "exterior",
    name: "Test Safety Reverse and Check Weather Seal",
    description:
      "Test the garage door opener's auto-reverse safety mechanism (both the photo-eye sensors and the mechanical force sensor) and inspect the bottom weather seal and side/top weatherstripping for damage and effectiveness.",
    whyItMatters:
      "Federal law requires all garage door openers manufactured after 1993 to have an auto-reverse mechanism. This feature prevents the 30,000+ garage door injuries that occur annually — including crushing injuries to children and pets. A malfunctioning safety reverse turns your garage door into a 200-400 pound descending weight with no way to stop it. Testing takes 60 seconds and could save a life. The weather seal keeps out rain, snow, leaves, insects, and rodents — a torn seal is an open invitation.",
    instructions: [
      "PHOTO-EYE TEST: With the door open, press the close button",
      "While the door is closing, wave a broom handle or cardboard box through the photo-eye beam (the sensors near the floor on each side of the door)",
      "The door should immediately reverse back to the open position",
      "If the door does not reverse, STOP USING THE OPENER and realign or replace the photo-eye sensors",
      "Clean the photo-eye lenses with a soft cloth — dust, cobwebs, or condensation can cause false readings",
      "FORCE SENSOR TEST: Place a 2×4 flat on the ground in the center of the door opening",
      "Press the close button — the door should contact the 2×4 and immediately reverse",
      "If the door does not reverse upon contact, adjust the force setting on the opener (consult the owner's manual)",
      "If adjustment doesn't resolve it, have a professional service the opener",
      "WEATHER SEAL: Inspect the bottom rubber seal (astragal) for cracks, tears, gaps, and hardening",
      "Close the door and look for daylight gaps at the bottom, sides, and top of the door",
      "Check the side and top weatherstripping (attached to the door frame) for compression, tearing, or missing sections",
      "Replace the bottom seal if it's cracked, torn, or no longer makes full contact with the floor",
      "Replace side and top weatherstripping if daylight is visible around the closed door",
    ],
    frequency: {
      intervalMonths: 6,
      seasonalAdjustments: {
        note: "Test safety features every 6 months and after any opener maintenance. Replace the weather seal before winter to keep out cold air, snow, and pests.",
      },
      triggerConditions: [
        "Garage door doesn't reverse when photo-eye beam is broken",
        "Door doesn't reverse when contacting an object",
        "Visible light at the bottom or sides of the closed door",
        "Water, snow, or leaves blowing into the garage under the door",
        "Rodent or insect entry into the garage",
        "After any opener repair or adjustment",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 15,
    toolsRequired: [
      "2×4 lumber (for force reversal test)",
      "broom handle or cardboard box (for photo-eye test)",
      "soft cloth (for cleaning photo-eye sensors)",
      "step stool (for inspecting top weatherstripping)",
    ],
    materialsCost: { low: 0, high: 40 },
    professionalCost: { low: 75, high: 200 },
    skipConsequences: {
      shortTerm:
        "Malfunctioning safety reverse creates a crushing hazard for children, pets, and objects under the closing door; damaged weather seal allows water, pests, and cold air into the garage",
      longTerm:
        "SAFETY HAZARD — a 200-400 pound door with no auto-reverse can cause serious injury or death; chronic water intrusion through a damaged seal damages items stored in the garage and can reach the interior wall; pest entry through gaps leads to infestation",
      costOfNeglect:
        "A 60-second safety test twice a year prevents a potential tragedy. A $15-$40 weather seal replacement prevents garage water damage and pest entry.",
    },
    safetyNotes: [
      "This is a LIFE SAFETY check — a non-reversing garage door has caused fatalities, especially to children",
      "If the auto-reverse doesn't work on either test, disconnect the opener and operate the door manually until it's repaired",
      "Never allow children to play with or operate the garage door opener",
      "Federal law (UL 325) requires both photo-eye sensors AND force reversal on all openers since 1993 — if your opener lacks these, it should be replaced",
    ],
    seasonalRelevance: ["spring", "fall"],
    priority: "critical" as const,
    tags: [
      "garage-door",
      "safety",
      "auto-reverse",
      "weather-seal",
      "diy",
      "semi-annual",
      "exterior",
    ],
  },

  // ================================================================
  // WOOD FENCE  (componentTemplateKey: "fence_wood")
  // ================================================================
  {
    key: "ext_fnc_001",
    componentTemplateKey: "fence_wood",
    systemCategory: "exterior",
    name: "Inspect Fence for Rot, Leaning, and Damage",
    description:
      "Walk the entire fence line and inspect all posts, rails, pickets, and gates for rot, insect damage, leaning, loose fasteners, and storm damage. Pay special attention to fence posts at ground level — this is where rot starts and where failure begins.",
    whyItMatters:
      "A wood fence fails from the bottom up and from the posts outward. The post base is in constant contact with moisture in the soil — even pressure-treated posts rot at ground level over 10-15 years. Once a post fails, the weight of the rails and pickets pulls adjacent posts, creating a cascading lean. Catching a single rotted post early ($50-$100 repair) prevents the domino effect that requires replacing entire fence sections ($500-$2,000+).",
    instructions: [
      "Walk the entire fence line on both sides, examining every post, rail, and picket",
      "Check each post for rot at ground level — push firmly at the base. A solid post won't move; a rotted post will flex.",
      "Probe the base of suspect posts with a screwdriver — if it sinks in easily, the post is rotted and needs replacement",
      "Check for leaning posts or sections — sight along the fence line from one end. Any lean indicates post failure or soil erosion at the base.",
      "Inspect all rails (horizontal members) for sagging, cracking, and rot at the rail-to-post connection",
      "Check pickets (vertical boards) for warping, cracking, missing pieces, and loose fasteners",
      "Tighten or replace any loose nails or screws — loose fasteners weaken connections and allow wind to catch and leverage boards",
      "Inspect gates for sagging, proper latch operation, and hinge condition",
      "If gates sag, install a gate anti-sag kit (turnbuckle and cable) or replace worn hinges",
      "Check for damage from tree branches, vines, or vegetation growing against the fence — vegetation traps moisture and accelerates rot",
      "Clear any soil or mulch that has built up against the base of fence posts — soil contact accelerates rot even in treated wood",
      "Note any damaged sections for repair or replacement before the next season",
    ],
    frequency: {
      intervalMonths: 12,
      seasonalAdjustments: {
        note: "Annual inspection in spring after winter storms and freeze-thaw cycles. Inspect immediately after severe wind storms.",
      },
      triggerConditions: [
        "Visible fence leaning or post movement",
        "After severe wind storms",
        "Gate won't latch or swings open/closed on its own",
        "Visible rot or discoloration at the base of posts",
        "Neighbors reporting shared fence damage",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 30,
    toolsRequired: [
      "screwdriver or awl (for probing rot)",
      "drill/driver with screws (for tightening loose fasteners)",
      "level (for checking post plumb)",
      "camera or smartphone (for documentation)",
    ],
    materialsCost: { low: 0, high: 20 },
    professionalCost: { low: 100, high: 300 },
    skipConsequences: {
      shortTerm:
        "Rotted posts lean progressively; loose pickets blow off in wind; sagging gates stop functioning",
      longTerm:
        "Single post failure cascades into adjacent sections — the entire fence leans and collapses in sections; replacement cost escalates from $50-$100 per post to $500-$2,000+ per fence section; property boundary disputes if the fence fails and is not repaired promptly",
      costOfNeglect:
        "Replacing a single rotted post costs $50-$100 DIY. Ignoring it until the entire section collapses costs $500-$2,000+ to rebuild.",
    },
    safetyNotes: [
      "Fence posts are often set in concrete footings — replacing a post requires digging out the old footing, which is heavy labor",
      "If the fence is on a property line, discuss repairs with your neighbor before starting work — shared fences often have shared cost responsibilities",
      "Check for underground utilities before digging to replace fence posts — call 811 before you dig",
    ],
    seasonalRelevance: ["spring"],
    priority: "medium" as const,
    tags: [
      "fence",
      "wood",
      "inspection",
      "rot",
      "diy",
      "annual",
      "exterior",
    ],
  },
  {
    key: "ext_fnc_002",
    componentTemplateKey: "fence_wood",
    systemCategory: "exterior",
    name: "Stain or Seal Fence",
    description:
      "Apply a penetrating wood stain or sealer to the entire fence to protect against moisture absorption, UV damage, mildew growth, and premature rot. Like deck sealing, this is the most impactful maintenance task for extending a wood fence's lifespan.",
    whyItMatters:
      "An unsealed wood fence is fully exposed to rain, sun, snow, and ground moisture from all directions — with no roof to shelter it. UV radiation breaks down the wood surface within 6-12 months, turning it gray and fuzzy. Moisture absorption causes swelling, cracking, and accelerates rot and mildew. A quality penetrating stain or sealer blocks moisture and UV, doubling or tripling the fence's lifespan.",
    instructions: [
      "Clean the fence with a power washer (1,200-1,500 PSI) or scrub brush and deck cleaner to remove dirt, mildew, and gray weathered wood fibers",
      "For mildew-covered fences, use an oxygen bleach cleaner to kill the mildew before sealing",
      "Allow the fence to dry completely — 48-72 hours of dry weather minimum",
      "Choose a penetrating oil-based stain (semi-transparent for natural wood appearance) or a clear penetrating sealer",
      "Apply stain/sealer with a pump sprayer for efficiency, then back-brush to work the product into the wood grain",
      "A paint roller with a thick nap also works well for fence boards",
      "Apply to both sides of the fence if accessible — the back side is often more vulnerable to moisture since it receives less sun and airflow",
      "Pay special attention to end grain (tops of pickets and posts) — end grain absorbs 10-15x more moisture than face grain",
      "Apply a second coat if the first coat is absorbed completely within 15 minutes",
      "Apply in temperatures between 50-80°F with no rain forecast for 48 hours",
      "Seal the tops of fence posts with post caps or a heavy application of sealer — post tops absorb moisture directly into the end grain and are the first place to rot",
    ],
    frequency: {
      intervalMonths: 36,
      seasonalAdjustments: {
        note: "Every 2-3 years for penetrating oil stains. Every 1-2 years for clear sealers. Annually for fences in full sun or harsh climates. Perform the water test annually to check protection.",
      },
      triggerConditions: [
        "Water soaks into the wood instead of beading on the surface",
        "Wood has grayed significantly from UV exposure",
        "Visible mildew or green algae growth",
        "Surface checks (small cracks along the grain) developing in the wood",
        "New fence — seal within 3-6 months of installation after the wood has dried",
      ],
    },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 180,
    toolsRequired: [
      "power washer (1,200-1,500 PSI) or scrub brush",
      "pump sprayer or paint roller with thick nap",
      "paintbrush (for detail work and end grain)",
      "penetrating wood stain or sealer",
      "drop cloths (to protect landscaping and concrete)",
    ],
    materialsCost: { low: 50, high: 200 },
    professionalCost: { low: 300, high: 800 },
    skipConsequences: {
      shortTerm:
        "Unprotected wood grays from UV, absorbs moisture freely, and begins developing surface checks and cracks; mildew colonizes the damp wood surface",
      longTerm:
        "Accelerated rot — especially at post bases and end grain; fence lifespan reduced from 15-20 years (sealed) to 7-10 years (unsealed); premature fence replacement at $15-$40 per linear foot; warped and split boards from chronic moisture cycling",
      costOfNeglect:
        "Sealing a fence costs $50-$200 DIY every 2-3 years. Replacing a 100-foot fence costs $1,500-$4,000+. Sealing easily doubles the fence's usable lifespan.",
    },
    safetyNotes: [
      "Oil-based stains and sealers are flammable — dispose of rags by spreading flat to dry outdoors or submerging in water. Wadded-up rags soaked in oil-based product can spontaneously combust.",
      "Wear gloves and eye protection when applying stain — oil-based products are skin irritants",
      "Protect adjacent landscaping from overspray and runoff — cover plants with plastic sheeting",
      "Work in well-ventilated conditions when using oil-based products",
    ],
    seasonalRelevance: ["spring", "fall"],
    priority: "medium" as const,
    tags: [
      "fence",
      "wood",
      "staining",
      "sealing",
      "diy",
      "triennial",
      "exterior",
    ],
  },

  // ================================================================
  // IRRIGATION SYSTEM  (componentTemplateKey: "irrigation_system")
  // ================================================================
  {
    key: "ext_irr_001",
    componentTemplateKey: "irrigation_system",
    systemCategory: "exterior",
    name: "Spring Startup and Head Adjustment",
    description:
      "Perform the annual spring activation of the irrigation system — slowly pressurize the system, inspect all zones for proper operation, adjust sprinkler heads for correct coverage, check for leaks, and program the controller for the current season's watering schedule.",
    whyItMatters:
      "An irrigation system that ran perfectly last fall has been sitting dormant for months — seals dry out, heads shift from frost heave, and controller programming resets after power outages. A proper spring startup catches leaks, broken heads, and misdirected spray before you waste thousands of gallons of water on driveways, sidewalks, and your neighbor's yard. A 10-minute system check can save $50-$200/month in water waste.",
    instructions: [
      "Locate the main irrigation shutoff valve and slowly open it — open gradually over 2-3 minutes to avoid water hammer that can damage pipes and fittings",
      "With the system pressurized, walk the entire system and check for leaks at all visible pipe connections, valve boxes, and heads",
      "Run each zone manually from the controller, one at a time",
      "For each zone, check every sprinkler head: pop up height, spray pattern, direction, and coverage",
      "Adjust heads that are spraying driveways, sidewalks, or house walls — wasted water and potential moisture damage",
      "Clean clogged nozzles — remove the nozzle, rinse debris, and reinstall",
      "Replace any broken, cracked, or sunken heads ($3-$10 each at hardware stores)",
      "Check rotor heads for proper rotation arc and throw distance — adjust with the provided key or flat screwdriver",
      "Inspect valve boxes for standing water (indicates a leak) and for damage to valve solenoids and wiring",
      "Program the controller for the current season — adjust run times, start times, and watering days per local water restrictions and landscape needs",
      "If the system has a rain sensor, test it by pressing the sensor spindle — it should interrupt the system",
      "Check the backflow prevention device for proper operation — this prevents irrigation water from contaminating the potable water supply",
    ],
    frequency: {
      intervalMonths: 12,
      seasonalAdjustments: {
        note: "Perform spring startup when frost danger has passed (typically April-May depending on climate zone). Adjust the controller monthly throughout the watering season as temperatures and rainfall patterns change.",
      },
      triggerConditions: [
        "Beginning of the irrigation season (after last frost)",
        "After any plumbing work on the main water supply",
        "After landscape renovations that may have damaged buried pipes",
        "Unusually high water bills (may indicate a leak in the irrigation system)",
      ],
    },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 60,
    toolsRequired: [
      "flat screwdriver or rotor adjustment key",
      "replacement sprinkler heads and nozzles (have a few on hand)",
      "irrigation system controller manual",
      "small flags or stakes (for marking problem areas)",
    ],
    materialsCost: { low: 0, high: 30 },
    professionalCost: { low: 75, high: 200 },
    skipConsequences: {
      shortTerm:
        "Broken heads spray geysers, wasting water and creating mud; misdirected heads water pavement instead of lawn; leaks in the system waste water and undermine soil",
      longTerm:
        "Undetected leaks waste $50-$200/month in water and can undermine foundations and driveways; misdirected spray against the house causes siding damage and moisture intrusion; broken backflow preventer creates a potable water contamination risk",
      costOfNeglect:
        "A 60-minute spring checkup prevents $50-$200/month in water waste and catches leaks before they undermine hardscape and foundations",
    },
    safetyNotes: [
      "Open the main valve slowly — sudden pressurization can burst weakened pipes and fittings, especially after winter freeze damage",
      "The backflow prevention device is a health safety requirement — it prevents irrigation water (which may contain fertilizer, pesticides, and soil bacteria) from flowing back into your drinking water supply",
      "Check local water restrictions before programming the controller — many municipalities have mandatory watering schedules",
    ],
    seasonalRelevance: ["spring"],
    priority: "high" as const,
    tags: [
      "irrigation",
      "sprinkler",
      "startup",
      "spring",
      "diy",
      "annual",
      "water-conservation",
      "exterior",
    ],
  },
  {
    key: "ext_irr_002",
    componentTemplateKey: "irrigation_system",
    systemCategory: "exterior",
    name: "Winterize Irrigation System",
    description:
      "Prepare the irrigation system for winter by blowing out all water with compressed air, draining valves and backflow preventers, shutting off the water supply, and insulating above-ground components. Water left in the system freezes, expands, and cracks pipes and fittings — the most common and expensive irrigation repair.",
    whyItMatters:
      "Water expands approximately 9% when it freezes. That expansion creates enough force to crack PVC pipe, burst brass fittings, and destroy valve diaphragms. A single freeze event can damage dozens of fittings throughout the system — and you won't know until spring when you turn the water on and geysers erupt from underground. Professional winterization costs $75-$150. Repairing freeze damage costs $500-$2,000+.",
    instructions: [
      "Shut off the main irrigation water supply valve (usually in the basement or near the main water entry)",
      "Open the drain valve downstream of the shutoff to relieve pressure",
      "Connect an air compressor to the irrigation system's blow-out port (typically a quick-connect fitting near the backflow preventer)",
      "Use a compressor capable of 40-80 PSI and 10+ CFM — do NOT exceed 80 PSI for PVC or 50 PSI for polyethylene pipe",
      "Starting with the zone farthest from the compressor, activate each zone from the controller while the compressor blows air through the system",
      "Run air through each zone for 2-3 minutes or until no more water exits the sprinkler heads",
      "Repeat each zone 2-3 times to ensure all water is expelled, including low-spot accumulations",
      "Drain the backflow prevention device — open the test cocks and drain petcocks to remove all trapped water",
      "Insulate the backflow preventer and any above-ground piping with foam insulation tape or a protective cover",
      "Shut off the controller or set it to rain mode (prevents the system from running during winter)",
      "Remove and store the rain sensor battery if applicable",
      "Mark the blow-out date in your maintenance records",
    ],
    frequency: {
      intervalMonths: 12,
      seasonalAdjustments: {
        note: "Perform before the first hard freeze — typically October-November depending on climate zone. Schedule professional winterization service in September if you don't own a suitable compressor.",
      },
      triggerConditions: [
        "First hard freeze (32°F or below) approaching in the forecast",
        "End of the watering season",
        "Before extended winter travel or vacation",
      ],
    },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 45,
    toolsRequired: [
      "air compressor (10+ CFM at 40-80 PSI) with blow-out adapter",
      "controller access (for running zones during blowout)",
      "foam insulation tape or backflow preventer cover",
      "adjustable wrench (for backflow preventer drain petcocks)",
    ],
    materialsCost: { low: 5, high: 20 },
    professionalCost: { low: 75, high: 150 },
    skipConsequences: {
      shortTerm:
        "First freeze cracks any pipe, fitting, or valve with trapped water; damage is invisible underground until spring startup",
      longTerm:
        "Extensive underground pipe repairs — each cracked fitting costs $50-$150+ to excavate and repair; destroyed valves ($75-$200 each to replace); cracked backflow preventer ($200-$500 to replace); total freeze damage repair commonly reaches $500-$2,000+",
      costOfNeglect:
        "Winterization costs $75-$150 professional or $5-$20 DIY (if you own a compressor). Freeze damage repair costs $500-$2,000+. This is non-negotiable in freeze climates.",
    },
    safetyNotes: [
      "Do NOT exceed 80 PSI for PVC systems or 50 PSI for polyethylene systems — excessive pressure can damage pipes and fittings",
      "Never stand over a sprinkler head while blowing out the system — heads can pop up forcefully and eject debris",
      "Wear safety glasses during the blowout — debris and water spray from the heads",
      "If you smell gas while digging near irrigation lines, stop immediately and call 811 — gas lines are sometimes run in the same trench as irrigation",
    ],
    seasonalRelevance: ["fall"],
    priority: "critical" as const,
    tags: [
      "irrigation",
      "sprinkler",
      "winterize",
      "fall",
      "diy",
      "annual",
      "freeze-protection",
      "exterior",
    ],
  },

  // ================================================================
  // EXTERIOR PAINT  (componentTemplateKey: "exterior_paint")
  // ================================================================
  {
    key: "ext_pnt_001",
    componentTemplateKey: "exterior_paint",
    systemCategory: "exterior",
    name: "Inspect Exterior Paint for Peeling, Fading, and Damage",
    description:
      "Walk the entire exterior of the home and inspect all painted surfaces — siding, trim, fascia, soffits, window frames, doors, and railings — for peeling, blistering, chalking, fading, cracking, and bare wood exposure. Paint is not just cosmetic — it's the primary moisture barrier protecting wood surfaces from rot.",
    whyItMatters:
      "Exterior paint serves two critical functions: protecting the underlying material from moisture and UV damage, and making the home look good. When paint fails (peels, cracks, or chalks), the exposed wood absorbs water freely, beginning the rot process within one to two seasons. Paint failure typically starts in small areas — a few blisters on the south-facing trim, peeling at a window sill — that are easy to touch up. Waiting until the failure is widespread turns a $50-$200 touch-up into a $3,000-$8,000+ full exterior repaint.",
    instructions: [
      "Walk the entire exterior perimeter, examining all painted surfaces systematically",
      "Start with the south and west faces — these receive the most sun and UV exposure, and paint fails here first",
      "Look for peeling (paint lifting off the surface in sheets or flakes) — indicates adhesion failure from moisture, age, or surface prep problems",
      "Check for blistering (bubbles in the paint film) — usually caused by moisture vapor pushing outward from the wood or painting in direct hot sunlight",
      "Look for chalking — rub your hand across the paint surface. If you get a powdery residue on your fingers, the paint binder is breaking down.",
      "Check for cracking and alligatoring (a pattern of cracks resembling alligator skin) — indicates paint that has hardened and lost elasticity",
      "Inspect all horizontal surfaces first: window sills, porch railings, deck rails, and the tops of trim boards — these hold water and fail fastest",
      "Check areas where different materials meet: wood-to-masonry, wood-to-vinyl, trim-to-siding — paint failure at transitions is common",
      "Look for bare wood anywhere — any exposed wood needs immediate attention before rot begins",
      "Check for mildew growth on painted surfaces (dark spots or streaks) — clean with a mildew wash before repainting",
      "Document problem areas with photos and note the severity: touch-up (small spots), section repaint, or full repaint needed",
      "For high areas, use binoculars — do not climb a ladder just to inspect. Save the ladder for repair work.",
    ],
    frequency: {
      intervalMonths: 12,
      seasonalAdjustments: {
        note: "Annual inspection in spring to catch winter damage before the painting season begins. Exterior painting is best done in late spring through early fall when temperatures are 50-85°F.",
      },
      triggerConditions: [
        "Visible peeling, blistering, or bare wood on any exterior surface",
        "Paint is more than 7-10 years old (typical acrylic latex exterior paint lifespan)",
        "Preparing the home for sale",
        "After severe weather events (hail, prolonged UV exposure, wind-driven rain)",
        "Mildew or mold growth on painted surfaces",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 30,
    toolsRequired: [
      "binoculars (for inspecting high areas safely)",
      "camera or smartphone (for documenting problem areas)",
      "notepad (for recording locations and severity of paint failure)",
    ],
    materialsCost: { low: 0, high: 0 },
    professionalCost: { low: 100, high: 300 },
    skipConsequences: {
      shortTerm:
        "Small paint failures expand rapidly once moisture reaches the wood; bare wood absorbs water and begins the rot process; curb appeal deteriorates",
      longTerm:
        "Wood rot in trim, fascia, window frames, and siding requires costly material replacement ($500-$2,000+ per section) before repainting; a $50-$200 touch-up becomes a $3,000-$8,000+ full exterior repaint with extensive wood repair; rotted window frames and door frames compromise weathertightness and security",
      costOfNeglect:
        "An annual paint inspection and $50-$200 touch-up maintains the finish and prevents wood rot. Ignoring failing paint leads to $3,000-$8,000+ in repainting plus wood replacement.",
    },
    safetyNotes: [
      "Inspect from the ground whenever possible — use binoculars for high areas",
      "If the home was built before 1978, the exterior paint may contain lead. Do not sand, scrape, or disturb pre-1978 paint without proper lead-safe practices (EPA RRP Rule).",
      "Any home built before 1978 should be tested for lead paint before any scraping or sanding work begins",
    ],
    seasonalRelevance: ["spring"],
    priority: "high" as const,
    tags: [
      "paint",
      "exterior",
      "inspection",
      "curb-appeal",
      "diy",
      "annual",
      "moisture-protection",
    ],
  },
];

export const seed = internalMutation({
  handler: async (ctx) => {
    let inserted = 0;
    let skipped = 0;

    for (const task of exteriorMaintenanceTasks) {
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
      `[tasks_exterior] Seeded ${inserted} exterior maintenance tasks (${skipped} already existed)`
    );
    return { inserted, skipped, total: exteriorMaintenanceTasks.length };
  },
});
