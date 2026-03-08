import { internalMutation } from "../_generated/server";

// ─────────────────────────────────────────────────────────────────────────────
// STRUCTURAL Maintenance Tasks — 10 tasks across 5 component types
// Source: IRC (International Residential Code), roofing manufacturers,
//         structural engineers, and home inspection industry standards.
// Cost basis: 2025 US National Average
// ─────────────────────────────────────────────────────────────────────────────

const structuralMaintenanceTasks = [
  // ================================================================
  // ASPHALT SHINGLE ROOF  (componentTemplateKey: "asphalt_shingle_roof")
  // ================================================================
  {
    key: "struc_roof_001",
    componentTemplateKey: "asphalt_shingle_roof",
    systemCategory: "structural",
    name: "Inspect Shingles for Damage",
    description:
      "Perform a visual inspection of the asphalt shingle roof from the ground with binoculars and, if safely accessible, from a ladder at the roof edge. Look for missing, cracked, curling, or blistering shingles, as well as granule loss, moss growth, and debris accumulation.",
    whyItMatters:
      "Your roof is your home's first line of defense against water damage. A single missing or cracked shingle exposes the underlayment to UV degradation and water intrusion. Once water gets under the shingles, it can travel along the roof deck for feet before dripping into your attic — causing rot, mold, and ceiling damage far from the visible defect. Catching shingle damage early means a $10-$50 repair instead of a $500-$2,000 leak remediation.",
    instructions: [
      "From the ground, use binoculars to scan every visible roof slope — start at the ridge and work downward",
      "Look for missing shingles (exposed black underlayment patches), curling edges, and cracked or broken tabs",
      "Check for blistering — raised bubbles on the shingle surface indicate moisture trapped in the shingle layers",
      "Look for dark streaks or patches — these may be algae growth (cosmetic) or areas of heavy granule loss (functional damage)",
      "Check the gutters for excessive granule accumulation — some granule loss is normal on new roofs, but heavy loss on older roofs indicates shingle wear",
      "Inspect valleys, hip ridges, and any areas where roof planes intersect — these high-stress areas fail first",
      "Look for moss or lichen growth — moss retains moisture against the shingle surface and accelerates deterioration",
      "After storms, inspect for wind-lifted shingles (shingles that are raised or partially detached from the row below)",
      "If safe to access from a ladder, check the first few courses of shingles at the eaves for ice dam damage and starter strip integrity",
      "Document any damage with photos and GPS or location notes for your roofer",
      "For roofs over 15 years old, look for widespread granule loss and shingle brittleness — signs the roof is approaching end of life",
    ],
    frequency: {
      intervalMonths: 6,
      seasonalAdjustments: {
        note: "Inspect in spring (after winter ice, snow, and freeze-thaw cycles) and fall (before winter arrives). Inspect immediately after any severe storm with high winds or hail.",
      },
      triggerConditions: [
        "After severe thunderstorms, high winds, or hail",
        "Visible shingle debris in the yard or gutters",
        "Water stains on the ceiling or attic rafters",
        "Daylight visible through the roof deck from inside the attic",
        "Neighbors getting roof replacements (hail damage is often area-wide)",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 30,
    toolsRequired: [
      "binoculars (for ground-level inspection)",
      "camera or smartphone (for documenting damage)",
      "ladder (only if safe roof-edge access is possible — do not walk on the roof)",
    ],
    materialsCost: { low: 0, high: 0 },
    professionalCost: { low: 150, high: 400 },
    skipConsequences: {
      shortTerm:
        "Missing or cracked shingles allow water under the roof surface during the next rainstorm; granule loss accelerates UV degradation of exposed asphalt",
      longTerm:
        "Persistent water intrusion causes roof deck rot, attic mold, and ceiling/wall damage; undetected damage voids warranty claims if not reported promptly; a $10-$50 shingle repair becomes a $5,000-$15,000 roof replacement when underlying damage spreads",
      costOfNeglect:
        "A free binocular inspection twice a year catches $10-$50 repairs before they become $500-$2,000 leak remediations or a premature $8,000-$15,000 roof replacement",
    },
    safetyNotes: [
      "Do NOT walk on the roof unless you have proper safety equipment and experience — falls from roofs are a leading cause of homeowner injury and death",
      "Use binoculars from the ground for the safest inspection method",
      "If you must use a ladder, follow the 4-to-1 rule: for every 4 feet of height, the base should be 1 foot from the wall",
      "Wet, mossy, or frost-covered roofs are extremely slippery — never access under these conditions",
      "If significant damage is found, hire a licensed roofing contractor for a professional assessment",
    ],
    seasonalRelevance: ["spring", "fall"],
    priority: "high" as const,
    tags: [
      "roof",
      "shingles",
      "inspection",
      "diy",
      "semi-annual",
      "water-damage",
      "structural",
    ],
  },
  {
    key: "struc_roof_002",
    componentTemplateKey: "asphalt_shingle_roof",
    systemCategory: "structural",
    name: "Clean Gutters and Downspouts",
    description:
      "Remove leaves, debris, and sediment from all roof gutters and flush downspouts to ensure water flows freely from the roof to the ground drainage system. Clogged gutters are the single most common cause of preventable water damage to foundations, fascia, and siding.",
    whyItMatters:
      "Gutters exist for one purpose: directing thousands of gallons of rainwater away from your foundation. A single clogged gutter section during a heavy rain overflows directly against the house — saturating fascia boards, soaking siding, and dumping water at the foundation perimeter. This causes fascia rot, siding damage, basement leaks, and foundation erosion. It's the most important exterior maintenance task most homeowners neglect.",
    instructions: [
      "Set up a sturdy extension ladder on level ground — use a ladder standoff to avoid crushing the gutter",
      "Wear work gloves — gutters contain sharp debris, shingle grit, and decomposing organic matter",
      "Starting at the end opposite the downspout, scoop out debris by hand or with a gutter scoop",
      "Place debris in a bucket hung from the ladder or drop it onto a tarp below (not on the roof — it washes back in)",
      "Work your way toward the downspout, clearing the entire gutter run",
      "Check for standing water after clearing debris — standing water indicates a gutter slope problem or sag",
      "Flush each gutter run with a garden hose from the high end toward the downspout",
      "Watch the water flow from the downspout exit — it should flow freely and rapidly",
      "If a downspout is clogged, disconnect the bottom elbow and flush from the top, or use a plumber's snake",
      "Verify downspout extensions or splash blocks direct water at least 4-6 feet from the foundation",
      "Inspect gutters for rust holes, separated joints, loose hangers, and sagging sections — repair before the next rain",
      "Check for gutter overflow stains on the fascia below the gutter (dark streaks indicate chronic overflow)",
    ],
    frequency: {
      intervalMonths: 6,
      seasonalAdjustments: {
        note: "Clean in late spring (after pollen and seed pods) and late fall (after leaf drop). Homes surrounded by trees may need quarterly cleaning or gutter guard installation.",
      },
      triggerConditions: [
        "Visible debris or plants growing from gutters",
        "Water overflowing gutters during rain",
        "Staining on fascia boards below the gutter line",
        "Water pooling near the foundation after rain",
        "Ice dams forming at the eaves in winter (clogged gutters contribute to ice dams)",
      ],
    },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 60,
    toolsRequired: [
      "extension ladder with ladder standoff",
      "work gloves (heavy-duty)",
      "gutter scoop or garden trowel",
      "bucket or tarp",
      "garden hose with spray nozzle",
      "plumber's snake (for clogged downspouts)",
    ],
    materialsCost: { low: 0, high: 15 },
    professionalCost: { low: 100, high: 250 },
    skipConsequences: {
      shortTerm:
        "Gutter overflow during rain dumps water directly against the house — soaking fascia, siding, and saturating soil at the foundation; standing water in gutters breeds mosquitoes",
      longTerm:
        "Fascia board rot requires replacement ($500-$1,500 per section); foundation water damage causes basement leaks and can cost $2,000-$10,000+ to remediate; ice dams in winter force water under shingles and into the attic; gutter weight from debris and standing water pulls hangers loose and damages the fascia",
      costOfNeglect:
        "A $0-$15 gutter cleaning twice a year prevents the #1 cause of preventable foundation and fascia damage. Professional cleaning costs $100-$250 — still far cheaper than the damage from clogged gutters.",
    },
    safetyNotes: [
      "Ladder falls are one of the most common homeowner injuries — use a sturdy extension ladder on level ground and maintain three points of contact at all times",
      "Never lean a ladder directly against the gutter — it will crush and deform. Use a ladder standoff or stabilizer.",
      "Consider hiring a professional if your home is more than one story — the risk of a fall from a two-story ladder is significant",
      "Power lines near the roofline are a lethal hazard — maintain at least 10 feet of clearance from power lines when using a ladder",
      "Wet leaves and gutter debris are slippery — wear shoes with good grip if working on a ladder",
    ],
    seasonalRelevance: ["spring", "fall"],
    priority: "critical" as const,
    tags: [
      "gutters",
      "downspouts",
      "cleaning",
      "diy",
      "semi-annual",
      "water-damage",
      "foundation",
      "structural",
    ],
  },
  {
    key: "struc_roof_003",
    componentTemplateKey: "asphalt_shingle_roof",
    systemCategory: "structural",
    name: "Check Roof Flashing and Penetration Seals",
    description:
      "Inspect all roof flashing — at chimneys, plumbing vents, skylights, dormers, and wall-to-roof transitions — for lifted edges, cracked sealant, rust, and separation. Flashing failures are the most common source of roof leaks, even on roofs with perfect shingles.",
    whyItMatters:
      "Flashing is the thin metal barrier at every roof penetration and transition. It's the weakest link in any roofing system because it relies on sealant and mechanical fastening rather than the overlapping shingle design. Sealant degrades in 5-10 years, metal corrodes, and thermal expansion slowly works flashing loose. The vast majority of roof leaks originate at flashing — not at shingles.",
    instructions: [
      "Using binoculars from the ground, inspect all visible flashing locations: chimneys, plumbing vent boots, skylights, dormers, and wall-to-roof intersections",
      "Look for flashing that has lifted away from the surface, revealing gaps where water can enter",
      "Check chimney flashing specifically — step flashing along the sides and counter-flashing embedded in the mortar joints",
      "Look for rust or corrosion on metal flashing — galvanized steel flashing eventually rusts through",
      "Check plumbing vent boots (the rubber collars around pipe penetrations) — rubber cracks and splits from UV exposure within 10-15 years",
      "Inspect skylight flashing and the sealant around skylight frames — skylights are notorious leak sources",
      "From inside the attic, inspect the underside of the roof around all penetrations for water stains or daylight",
      "Check for cracked or missing sealant (roof cement, caulk) around flashing edges",
      "If accessible, apply roofing sealant to any small gaps or lifted edges as a temporary repair",
      "For significant flashing damage, hire a licensed roofer — improper flashing repair causes more leaks than it fixes",
    ],
    frequency: {
      intervalMonths: 12,
      seasonalAdjustments: {
        note: "Annual inspection in spring or fall. Inspect from the attic interior during heavy rain — active leaks at penetrations are easy to spot.",
      },
      triggerConditions: [
        "Water stains on ceilings or walls below roof penetrations",
        "Active dripping in the attic during rain",
        "Visible rust or lifted flashing from ground level",
        "After high winds that can lift flashing edges",
        "Chimney mortar showing deterioration (mortar cracks allow water behind counter-flashing)",
      ],
    },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 30,
    toolsRequired: [
      "binoculars",
      "flashlight (for attic inspection)",
      "roofing sealant or roof cement (for minor repairs)",
      "caulk gun",
    ],
    materialsCost: { low: 0, high: 25 },
    professionalCost: { low: 150, high: 500 },
    skipConsequences: {
      shortTerm:
        "Water enters around flashing gaps during rain and travels along roof deck; staining appears on ceilings and walls below the penetration",
      longTerm:
        "Persistent leaks at flashing cause roof deck rot, rafter damage, attic mold, and interior wall damage; chimney flashing failure can rot the entire chimney chase structure; a $50-$200 flashing repair becomes a $2,000-$5,000 structural repair when deck rot and mold spread",
      costOfNeglect:
        "Flashing is the most common source of roof leaks. A $50-$200 sealant or flashing repair prevents thousands in water damage and structural rot.",
    },
    safetyNotes: [
      "Inspect from the ground with binoculars and from the attic interior whenever possible — avoid walking on the roof",
      "If you must access the roof for minor sealant repairs, use proper fall protection",
      "Never apply sealant as a substitute for proper flashing repair — sealant is a temporary measure, not a permanent fix",
      "If the chimney mortar is deteriorating, address that separately — crumbling mortar allows water behind the counter-flashing regardless of the flashing condition",
    ],
    seasonalRelevance: ["spring", "fall"],
    priority: "high" as const,
    tags: [
      "roof",
      "flashing",
      "inspection",
      "leak-prevention",
      "diy",
      "annual",
      "structural",
    ],
  },
  {
    key: "struc_roof_004",
    componentTemplateKey: "asphalt_shingle_roof",
    systemCategory: "structural",
    name: "Check Attic Ventilation",
    description:
      "Verify the attic ventilation system is functioning properly by checking soffit vents, ridge vents, gable vents, and powered attic ventilators for blockages. Proper attic ventilation prevents moisture buildup, ice dams, and premature shingle deterioration from excessive heat.",
    whyItMatters:
      "An under-ventilated attic traps heat and moisture — in summer, attic temperatures can exceed 150°F, baking the shingles from below and shortening their lifespan by 25-50%. In winter, warm moist air from the living space rises into the attic and condenses on cold surfaces, causing mold, rot, and ice dams. Most shingle manufacturers require proper attic ventilation as a condition of their warranty.",
    instructions: [
      "Go into the attic and visually check all soffit vents from the inside — look for blockages from insulation, debris, or paint",
      "Each soffit vent (or continuous soffit strip) should have a clear airflow path from outside into the attic",
      "Install or reposition rafter baffles (ventilation chutes) over each soffit vent to keep insulation from blocking airflow",
      "Check the ridge vent (if installed) from inside the attic — you should see daylight through the ridge opening",
      "For gable vents, verify they are not blocked by stored items, insulation, or animal nests",
      "Check for signs of inadequate ventilation: condensation on roof deck or rafters, frost in winter, mold or mildew, or a musty smell",
      "In summer, check the attic temperature — it should be within 10-15°F of the outside temperature with proper ventilation",
      "Verify the overall ventilation ratio: the NFA (net free area) of intake vents should roughly equal the NFA of exhaust vents",
      "Do not mix powered ventilators with ridge vents — the powered vent can short-circuit ridge vent airflow by pulling conditioned air from the living space",
      "Check for bathroom exhaust fans venting into the attic instead of outside — this is a major moisture source and a code violation",
    ],
    frequency: {
      intervalMonths: 12,
      seasonalAdjustments: {
        note: "Annual inspection, ideally in fall before winter. Check again in late winter if you see ice dams forming at the eaves.",
      },
      triggerConditions: [
        "Ice dams forming at the eaves in winter",
        "Excessive attic heat in summer (attic much hotter than outside)",
        "Mold or mildew visible on attic surfaces",
        "Condensation or frost on the underside of the roof deck",
        "Shingle warranty requires documentation of adequate ventilation",
      ],
    },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 30,
    toolsRequired: [
      "flashlight",
      "rafter baffles/ventilation chutes (if needed — $1-$2 each)",
      "thermometer (to check attic temperature in summer)",
    ],
    materialsCost: { low: 0, high: 50 },
    professionalCost: { low: 150, high: 400 },
    skipConsequences: {
      shortTerm:
        "Attic overheats in summer, baking shingles from below and raising cooling costs; moisture accumulates on attic surfaces in winter",
      longTerm:
        "Premature shingle failure (25-50% reduced lifespan) from excessive attic heat; ice dams cause water intrusion under shingles and into the home; mold growth on attic sheathing and rafters requires $2,000-$8,000+ remediation; shingle warranty voided due to inadequate ventilation",
      costOfNeglect:
        "A $0-$50 ventilation check prevents premature shingle failure that leads to an $8,000-$15,000 roof replacement years early",
    },
    safetyNotes: [
      "Walk only on attic joists or on plywood placed across joists — stepping between joists can put your foot through the ceiling below",
      "Wear a dust mask in the attic — insulation fibers and mold spores are respiratory hazards",
      "Attics are extremely hot in summer — limit time and bring water to prevent heat exhaustion",
      "Watch for exposed electrical wiring and nail points protruding through the roof deck",
    ],
    seasonalRelevance: ["fall"],
    priority: "high" as const,
    tags: [
      "roof",
      "attic",
      "ventilation",
      "ice-dams",
      "diy",
      "annual",
      "energy-efficiency",
      "structural",
    ],
  },

  // ================================================================
  // FOUNDATION — SLAB  (componentTemplateKey: "foundation_slab")
  // ================================================================
  {
    key: "struc_fnd_001",
    componentTemplateKey: "foundation_slab",
    systemCategory: "structural",
    name: "Check Foundation for Cracks and Settling",
    description:
      "Walk the entire perimeter of the home and inspect all visible foundation surfaces for new cracks, crack growth, spalling, efflorescence (white mineral deposits), and signs of differential settling. Measure and photograph any existing cracks to track progression over time.",
    whyItMatters:
      "Hairline cracks in concrete are normal and expected — concrete shrinks as it cures. But cracks that are growing, wider than 1/4 inch, stair-stepping through mortar joints, or showing vertical displacement (one side higher than the other) indicate active structural movement. Catching foundation problems early — while they're still cosmetic — prevents the $10,000-$50,000+ underpinning and structural repair costs that come from ignoring progressive settlement.",
    instructions: [
      "Walk the entire exterior perimeter of the foundation, examining all visible concrete or block surfaces",
      "Look for cracks — note the type: vertical, horizontal, diagonal, or stair-step (through mortar joints in block foundations)",
      "Measure the width of any cracks with a crack comparator card or ruler — note if wider than a hairline (1/16 inch)",
      "Check for differential displacement at cracks — run your finger across the crack to feel if one side is higher than the other",
      "Mark the end of each crack with a pencil and date — this lets you track if the crack is growing over time",
      "For cracks wider than 1/4 inch or showing vertical displacement, tape a crack monitor across the crack to measure movement",
      "Look for efflorescence (white powder or crystalline deposits) — this indicates water is migrating through the concrete",
      "Check for spalling (surface flaking or chipping) — common in freeze-thaw climates where water enters pores and expands",
      "Inspect the soil around the foundation — soil pulling away from the foundation indicates shrinkage that causes settlement",
      "Look for signs of settling inside the home: sticking doors, cracked drywall at door/window corners, sloping floors",
      "If horizontal cracks are found in a block or poured wall (especially at mid-height), consult a structural engineer immediately — this indicates lateral pressure from soil",
    ],
    frequency: {
      intervalMonths: 6,
      seasonalAdjustments: {
        note: "Inspect in spring (after freeze-thaw cycles) and late summer (after dry periods that cause soil shrinkage). In expansive clay soil regions, inspect quarterly.",
      },
      triggerConditions: [
        "New cracks appearing in drywall, especially at door and window corners",
        "Doors or windows that suddenly stick or won't latch",
        "Visible new cracks in the foundation",
        "Floors that feel sloped or uneven",
        "After extended drought followed by heavy rain (soil expansion/contraction cycle)",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 30,
    toolsRequired: [
      "crack comparator card or ruler (for measuring crack width)",
      "pencil and tape (for marking crack endpoints)",
      "camera or smartphone (for documentation)",
      "flashlight",
      "crack monitors (optional — for tracking movement on significant cracks)",
    ],
    materialsCost: { low: 0, high: 20 },
    professionalCost: { low: 250, high: 600 },
    skipConsequences: {
      shortTerm:
        "Active cracks go unmonitored and unrepaired; water enters through cracks and causes interior moisture problems; small cosmetic cracks widen into structural concerns",
      longTerm:
        "Progressive settlement leads to structural failure requiring $10,000-$50,000+ in underpinning or foundation repair; water intrusion through unrepaired cracks causes chronic mold issues; resale value drops dramatically with visible foundation problems",
      costOfNeglect:
        "A free visual inspection twice a year catches $200-$500 crack repairs before they become $10,000-$50,000+ structural interventions",
    },
    safetyNotes: [
      "Foundation inspection is a visual task — no heavy lifting or hazardous work is involved",
      "If you find horizontal cracks in a foundation wall, do not ignore them — horizontal cracks indicate lateral pressure and potential wall failure. Consult a structural engineer.",
      "Never attempt to repair structural cracks yourself — cosmetic crack sealing is fine, but structural cracks require professional engineering evaluation",
    ],
    seasonalRelevance: ["spring", "fall"],
    priority: "critical" as const,
    tags: [
      "foundation",
      "cracks",
      "settling",
      "inspection",
      "diy",
      "semi-annual",
      "structural",
    ],
  },
  {
    key: "struc_fnd_002",
    componentTemplateKey: "foundation_slab",
    systemCategory: "structural",
    name: "Inspect Foundation Drainage and Grading",
    description:
      "Verify that the soil grade slopes away from the foundation on all sides and that all drainage components — downspout extensions, French drains, swales, and window well drains — are functioning properly to direct water away from the home.",
    whyItMatters:
      "Water is the #1 enemy of foundations. Proper grading and drainage are the cheapest and most effective foundation protection available. The ground should slope away from the foundation at a minimum of 6 inches of fall over the first 10 feet. When grading settles, erodes, or landscaping redirects water toward the house, hydrostatic pressure builds against the foundation — causing leaks, efflorescence, and eventually structural damage.",
    instructions: [
      "Walk the entire perimeter of the home and evaluate the soil grade — the ground should slope noticeably away from the foundation",
      "Use a 10-foot straightedge or string level to verify: minimum 6 inches of fall over the first 10 feet from the foundation",
      "Look for areas where soil has settled, creating negative grade (soil sloping toward the foundation)",
      "Check that no flower beds, mulch, or landscaping have built up soil against the foundation above the sill plate or siding line",
      "Verify all downspout extensions are intact and discharging at least 4-6 feet from the foundation",
      "Check underground downspout drain lines (if present) by running water from a hose into the top — verify it exits at the discharge point",
      "Inspect window wells for debris accumulation and standing water — clean out and verify drains are clear",
      "Check French drains (if installed) for surface blockages and verify outlet is discharging properly",
      "Look for erosion patterns that indicate concentrated water flow against the foundation",
      "After a heavy rain, walk the perimeter and observe where water is collecting or flowing — this is the most revealing inspection",
    ],
    frequency: {
      intervalMonths: 12,
      seasonalAdjustments: {
        note: "Annual inspection in spring. Re-evaluate after any landscaping changes, grading work, or construction near the foundation. Inspect during or immediately after a heavy rain for the most useful data.",
      },
      triggerConditions: [
        "Water in the basement or crawl space after rain",
        "Efflorescence (white deposits) on foundation walls",
        "Soil pulling away from the foundation (shrinkage gap)",
        "After new landscaping, patio, or sidewalk installation",
        "Gutter downspout extensions missing or disconnected",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 30,
    toolsRequired: [
      "10-foot straightedge or string level (for checking grade)",
      "garden hose (for testing downspout drains)",
      "shovel (for minor grading corrections)",
    ],
    materialsCost: { low: 0, high: 50 },
    professionalCost: { low: 200, high: 600 },
    skipConsequences: {
      shortTerm:
        "Water pools against the foundation during rain; hydrostatic pressure forces water through cracks and joints; basement or crawl space moisture increases",
      longTerm:
        "Chronic water pressure causes foundation wall cracking and bowing; persistent moisture causes mold in the basement or crawl space; foundation erosion undermines footings; remediation costs $3,000-$15,000+ for waterproofing and grading correction",
      costOfNeglect:
        "Adding soil to correct grading costs $50-$200 in topsoil. Ignoring negative grading leads to $3,000-$15,000+ in foundation waterproofing and repair.",
    },
    safetyNotes: [
      "Keep soil grade at least 6-8 inches below the siding or sill plate — soil contact with wood framing causes rot and invites termites",
      "Do not pile mulch or landscaping materials against the foundation — maintain 4-6 inches of clearance",
      "Underground drain lines can collapse or clog — test them annually by running water from the top",
    ],
    seasonalRelevance: ["spring"],
    priority: "high" as const,
    tags: [
      "foundation",
      "drainage",
      "grading",
      "water-management",
      "diy",
      "annual",
      "structural",
    ],
  },

  // ================================================================
  // FOUNDATION — BASEMENT  (componentTemplateKey: "foundation_basement")
  // ================================================================
  {
    key: "struc_bsmt_001",
    componentTemplateKey: "foundation_basement",
    systemCategory: "structural",
    name: "Inspect Basement Walls for Water Intrusion and Cracks",
    description:
      "Inspect all basement walls and the floor-to-wall joint for evidence of water intrusion, active leaking, efflorescence, mold, and structural cracking. The floor-to-wall joint (cove joint) is the most common entry point for groundwater in poured concrete basements.",
    whyItMatters:
      "Basement water intrusion is one of the most common and costly homeowner problems — 60% of US homes have some form of below-grade moisture issue. Water enters through cracks, the cove joint, tie rod holes (in poured walls), window wells, and through the concrete itself via capillary action. Early detection and correction prevents mold growth, structural damage, and the $5,000-$20,000 interior waterproofing systems that become necessary when problems are ignored.",
    instructions: [
      "Inspect all basement walls systematically — start in one corner and work your way around the entire perimeter",
      "Look for water stains (mineral deposits, tide marks, or discoloration) on walls and floor",
      "Check the cove joint (where the floor meets the wall) for dampness, water stains, or active seeping",
      "In poured concrete basements, inspect tie rod holes for water stains or active leaking",
      "Look for efflorescence — white crystalline deposits on the wall surface indicate water movement through the concrete",
      "Check for mold or mildew — especially in corners, behind stored items, and at the base of walls",
      "Measure and document any wall cracks using the same method as exterior inspection",
      "Look for horizontal cracks at mid-wall height — these are the most serious and indicate lateral soil pressure",
      "Check for wall bowing or inward displacement — sight along the wall from each corner to detect bulging",
      "Inspect the basement floor for cracks, heaving, or wet spots — especially after rain events",
      "Check that any existing waterproofing systems (sump pump, interior drainage, vapor barriers) are functioning",
      "Use a moisture meter on suspect areas to quantify moisture levels in the concrete",
    ],
    frequency: {
      intervalMonths: 6,
      seasonalAdjustments: {
        note: "Inspect in spring (when groundwater levels are highest from snowmelt and spring rain) and fall. Inspect immediately after any heavy rain event.",
      },
      triggerConditions: [
        "Musty smell in the basement",
        "Visible water, dampness, or staining on walls or floor",
        "Mold growth anywhere in the basement",
        "High humidity readings in the basement (above 60%)",
        "Sump pump running frequently or continuously",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 30,
    toolsRequired: [
      "flashlight",
      "moisture meter (pin-type or pinless — $25-$50)",
      "crack comparator card or ruler",
      "camera or smartphone for documentation",
    ],
    materialsCost: { low: 0, high: 25 },
    professionalCost: { low: 200, high: 500 },
    skipConsequences: {
      shortTerm:
        "Undetected water intrusion creates ideal conditions for mold growth; stored items in the basement are damaged by moisture",
      longTerm:
        "Chronic moisture leads to extensive mold remediation ($2,000-$10,000); structural damage from wall bowing or cracking requires $10,000-$50,000+ in repair; basement becomes unusable due to persistent water and mold issues; resale value significantly impacted",
      costOfNeglect:
        "A free inspection twice a year catches problems when they're $200-$1,000 fixes instead of $5,000-$20,000 waterproofing projects",
    },
    safetyNotes: [
      "If you see mold, do not disturb large areas (over 10 square feet) — professional remediation is recommended for large mold colonies",
      "Wear a dust mask or N95 respirator when inspecting areas with visible mold",
      "Horizontal cracks in basement walls are a structural concern — consult a structural engineer, not just a waterproofing contractor",
      "Never ignore a bowing basement wall — progressive inward displacement can lead to wall collapse",
    ],
    seasonalRelevance: ["spring", "fall"],
    priority: "critical" as const,
    tags: [
      "basement",
      "foundation",
      "water-intrusion",
      "inspection",
      "diy",
      "semi-annual",
      "mold",
      "structural",
    ],
  },

  // ================================================================
  // ATTIC INSULATION  (componentTemplateKey: "attic_insulation")
  // ================================================================
  {
    key: "struc_ins_001",
    componentTemplateKey: "attic_insulation",
    systemCategory: "structural",
    name: "Inspect Insulation Depth and Condition",
    description:
      "Measure attic insulation depth in multiple locations, check for compression, displacement, water damage, animal damage, and verify that insulation is not blocking soffit ventilation. The Department of Energy recommends R-38 to R-60 for most US attic applications — equivalent to 10-16 inches of fiberglass batts or blown-in cellulose.",
    whyItMatters:
      "Insulation is your primary thermal boundary — it keeps heated and cooled air inside the living space. But insulation doesn't last forever in perfect condition: it compresses over time (especially blown-in fiberglass), gets displaced by animals and service work, absorbs moisture from roof leaks, and gets pushed aside when homeowners store items in the attic. Every inch of missing or damaged insulation is a hole in your thermal envelope, driving up energy bills and making your HVAC work harder.",
    instructions: [
      "Enter the attic and allow your eyes to adjust — use a bright flashlight",
      "Measure insulation depth at 6-8 locations spread across the attic — record each measurement",
      "Target depth: R-38 minimum (10 inches fiberglass batts, 10.5 inches cellulose, 7 inches spray foam). R-49 to R-60 is recommended for cold climates.",
      "Check for bare spots or thin areas — these are thermal short circuits that disproportionately increase heat loss",
      "Look for areas where insulation has been displaced by foot traffic, stored items, or animal activity",
      "Check insulation around the attic hatch or pull-down stairs — this is the most commonly under-insulated area",
      "Look for water-stained or wet insulation — this indicates a roof leak above and the wet insulation should be removed and replaced",
      "Check for animal damage — rodents and squirrels tunnel through insulation and contaminate it with urine and droppings",
      "Verify that insulation is not blocking soffit vents — install rafter baffles where needed to maintain airflow",
      "Check insulation around recessed light cans — ensure proper clearance (IC-rated cans allow insulation contact; non-IC-rated cans require 3 inches of clearance to prevent fire)",
      "If insulation depth is significantly below the recommended level, plan for additional insulation installation",
    ],
    frequency: {
      intervalMonths: 12,
      seasonalAdjustments: {
        note: "Annual inspection in fall before winter. Inspect after any roof leak event to check for water-damaged insulation.",
      },
      triggerConditions: [
        "Unusually high heating or cooling bills",
        "Cold spots or drafts near ceilings in winter",
        "Ice dams forming (can indicate heat loss from insufficient insulation)",
        "After any roof repair or HVAC work in the attic that may have displaced insulation",
        "Animal activity sounds in the attic",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 30,
    toolsRequired: [
      "tape measure or ruler (for measuring insulation depth)",
      "flashlight (bright — the attic is dark)",
      "dust mask or N95 respirator (insulation fibers are respiratory irritants)",
      "long sleeves and gloves (fiberglass is a skin irritant)",
    ],
    materialsCost: { low: 0, high: 0 },
    professionalCost: { low: 100, high: 300 },
    skipConsequences: {
      shortTerm:
        "Thin or missing insulation causes cold spots on ceilings in winter and excessive heat gain in summer; HVAC runs longer to compensate, increasing energy bills by 15-30%",
      longTerm:
        "Water-damaged insulation loses most of its R-value and becomes a mold incubator; compressed insulation never recovers its original loft; animal-contaminated insulation is a health hazard; energy waste accumulates to thousands of dollars over years",
      costOfNeglect:
        "Proper insulation levels can reduce heating and cooling costs by 15-30%. A $1,500-$3,000 insulation upgrade typically pays for itself in 2-4 years through energy savings.",
    },
    safetyNotes: [
      "Always wear a dust mask or N95 respirator in the attic — insulation fibers, dust, and potential mold spores are respiratory hazards",
      "Wear long sleeves, long pants, and gloves when handling fiberglass insulation — the fibers cause skin irritation",
      "Walk only on attic joists or on plywood laid across joists — the ceiling drywall between joists will not support your weight",
      "Attics are extremely hot in summer — limit time and stay hydrated to prevent heat exhaustion",
      "Watch for exposed nails protruding through the roof deck — a hard hat or bump cap is recommended",
    ],
    seasonalRelevance: ["fall"],
    priority: "high" as const,
    tags: [
      "insulation",
      "attic",
      "inspection",
      "energy-efficiency",
      "diy",
      "annual",
      "structural",
    ],
  },
  {
    key: "struc_ins_002",
    componentTemplateKey: "attic_insulation",
    systemCategory: "structural",
    name: "Check for Moisture, Mold, and Pest Activity",
    description:
      "Inspect the attic for moisture issues (condensation, roof leaks, plumbing leaks), mold growth on sheathing and rafters, and evidence of animal intrusion — droppings, nesting material, chewed wiring, and contaminated insulation.",
    whyItMatters:
      "The attic is out of sight and out of mind — which is exactly why problems grow unchecked for years. A small roof leak can saturate insulation and rot sheathing for months before staining appears on the ceiling below. A family of raccoons can destroy thousands of dollars of insulation in a single nesting season. And mold on attic sheathing — often from bathroom fans venting into the attic instead of outside — can spread to cover hundreds of square feet before anyone notices.",
    instructions: [
      "Enter the attic with a bright flashlight and slowly scan all roof sheathing, rafters, and insulation surfaces",
      "Look for dark staining on the underside of the roof sheathing — water stains from roof leaks are typically dark brown or black",
      "Check around all penetrations (plumbing vents, electrical conduits, chimney chase) for water stains on nearby sheathing",
      "Look for mold — it appears as black, green, or white fuzzy growth on wood surfaces",
      "Check for condensation or frost on the underside of the roof deck (winter issue from inadequate ventilation or moisture sources)",
      "Verify all bathroom exhaust fans vent to the exterior — not into the attic. Fans dumping humid air into the attic are the #1 cause of attic mold.",
      "Look for dryer vents or kitchen exhaust accidentally routed into the attic",
      "Check for animal evidence: droppings (mouse, bat, raccoon, squirrel), nesting material, chewed wood, and gnawed wiring",
      "If you find chewed electrical wiring, have an electrician inspect and repair immediately — this is a fire hazard",
      "Check soffit areas for gaps that allow animal entry — daylight visible from inside the soffit area indicates a potential entry point",
      "If significant mold (over 10 square feet) is found, get a professional assessment before attempting remediation",
    ],
    frequency: {
      intervalMonths: 12,
      seasonalAdjustments: {
        note: "Annual inspection, ideally in spring when winter moisture damage is visible but before summer heat makes attic entry miserable. Inspect after any known roof leak.",
      },
      triggerConditions: [
        "Musty or moldy smell in upstairs rooms",
        "Scratching, scurrying, or chirping sounds from the attic",
        "Water stains on ceilings below the attic",
        "High humidity levels in the home despite HVAC operation",
        "After ice dam events in winter",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 25,
    toolsRequired: [
      "bright flashlight or headlamp",
      "N95 respirator (essential — mold spores and animal droppings are health hazards)",
      "camera or smartphone (for documentation)",
    ],
    materialsCost: { low: 0, high: 0 },
    professionalCost: { low: 150, high: 400 },
    skipConsequences: {
      shortTerm:
        "Mold continues to spread on sheathing and rafters; animal contamination of insulation worsens; chewed wiring creates fire risk; roof leak damage spreads to larger areas",
      longTerm:
        "Extensive mold remediation costs $3,000-$10,000+; animal damage to insulation and wiring requires $2,000-$8,000 in removal, cleanup, and re-insulation; rotted roof sheathing requires partial roof deck replacement during re-roofing; health effects from mold exposure",
      costOfNeglect:
        "A free annual attic inspection catches problems when they're manageable — mold removal at 10 square feet costs $500; at 500 square feet, it costs $5,000-$10,000",
    },
    safetyNotes: [
      "ALWAYS wear an N95 respirator in the attic — mold spores and animal droppings (especially bat and bird droppings) can cause serious respiratory illness",
      "If you find bat droppings (guano), do not disturb — bat guano can carry Histoplasma fungus. Professional wildlife removal is recommended.",
      "Do not touch dead animals or large accumulations of droppings — call a wildlife removal professional",
      "If extensive mold is present, leave the attic and consult a mold remediation professional — disturbing large mold colonies releases massive amounts of spores",
    ],
    seasonalRelevance: ["spring"],
    priority: "high" as const,
    tags: [
      "attic",
      "moisture",
      "mold",
      "pests",
      "inspection",
      "diy",
      "annual",
      "structural",
    ],
  },

  // ================================================================
  // WINDOWS — DOUBLE PANE  (componentTemplateKey: "windows_double_pane")
  // ================================================================
  {
    key: "struc_win_001",
    componentTemplateKey: "windows_double_pane",
    systemCategory: "structural",
    name: "Check Window Seals and Caulking",
    description:
      "Inspect the exterior caulking around all window frames and check the insulated glass unit (IGU) seals for failure. Failed IGU seals cause fogging between the panes, and deteriorated exterior caulking allows water and air infiltration around the window frame.",
    whyItMatters:
      "Windows are the thinnest part of your building envelope — they have less than 1/10th the insulation value of the surrounding wall. The caulking around the window frame is the only thing sealing the gap between the window and the rough opening. When caulking deteriorates, water and air bypass the window entirely and enter the wall cavity, causing hidden rot, mold, and energy loss. Failed IGU seals (fogging between panes) mean the insulating gas has escaped and the window's thermal performance has dropped by 30-50%.",
    instructions: [
      "Walk the exterior of the home and inspect the caulking around every window frame",
      "Look for cracked, peeling, missing, or shrunken caulking — especially at the top and sides of the window",
      "Note: the bottom of the window frame (sill) should NOT be caulked — it needs to be open as a weep drainage path",
      "Look for gaps between the window frame and the siding or trim where caulking has failed",
      "Check for water stains or rot on window trim and sills — indicators of water intrusion behind failed caulking",
      "From inside, inspect each double-pane window for fogging, condensation, or haze between the glass panes",
      "Fogging that cannot be wiped away from either surface means the IGU seal has failed",
      "Mark or list every window with failed IGU seals — these can often be replaced without replacing the entire window",
      "For windows with failed caulking: remove the old caulking completely, clean the surfaces, and apply a high-quality exterior silicone or polyurethane caulk",
      "Apply caulking in temperatures above 40°F for proper adhesion and curing",
      "Check window weep holes (small drainage slots at the bottom of the frame) — clear any blockages with a toothpick",
    ],
    frequency: {
      intervalMonths: 12,
      seasonalAdjustments: {
        note: "Annual inspection in fall before winter, when caulking failures cause the most energy loss and water damage. Re-caulk in spring or fall when temperatures are moderate.",
      },
      triggerConditions: [
        "Fogging or condensation between window panes that cannot be wiped off",
        "Drafts felt near windows in winter",
        "Water stains on interior window trim or sills",
        "Visible caulking deterioration from the outside",
        "Higher than expected heating or cooling bills",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 45,
    toolsRequired: [
      "caulk gun",
      "exterior-grade silicone or polyurethane caulk",
      "caulk removal tool or utility knife (for removing old caulking)",
      "painter's tape (for clean caulk lines)",
      "toothpick (for clearing weep holes)",
    ],
    materialsCost: { low: 5, high: 30 },
    professionalCost: { low: 150, high: 400 },
    skipConsequences: {
      shortTerm:
        "Air infiltration around window frames increases heating and cooling costs; water enters behind the window frame during driving rain, soaking the wall cavity",
      longTerm:
        "Chronic water intrusion behind window frames causes framing rot, mold in the wall cavity, and potential structural damage; failed IGU seals reduce window thermal performance by 30-50%, wasting energy for years; rot around window frames eventually requires full window replacement ($300-$1,000 per window)",
      costOfNeglect:
        "A tube of quality caulk costs $5-$12 and takes 5 minutes per window. Replacing a rot-damaged window frame costs $300-$1,000+. Replacing the entire window costs $500-$1,500+.",
    },
    safetyNotes: [
      "Use a stable ladder for second-story windows — never lean out of a window to inspect or caulk the exterior",
      "Silicone caulk is difficult to remove once applied — use painter's tape for clean lines",
      "Do not caulk the bottom of the window frame — this blocks the weep drainage system and traps water inside the frame",
    ],
    seasonalRelevance: ["fall"],
    priority: "high" as const,
    tags: [
      "windows",
      "caulking",
      "seals",
      "energy-efficiency",
      "diy",
      "annual",
      "structural",
    ],
  },
  {
    key: "struc_win_002",
    componentTemplateKey: "windows_double_pane",
    systemCategory: "structural",
    name: "Inspect Weatherstripping and Clean Window Tracks",
    description:
      "Check the weatherstripping on all operable windows (single-hung, double-hung, casement, and sliding) for compression, tearing, gaps, and effectiveness. Clean all window tracks, sills, and hardware to ensure smooth operation and a tight seal when closed.",
    whyItMatters:
      "Weatherstripping is the compressible seal between the moving sash and the window frame. Over 10-15 years, it compresses permanently, tears, and hardens — losing its ability to block air and water. Dirty or debris-filled tracks prevent the sash from seating fully, creating gaps even when the window is 'closed.' Air leakage through worn weatherstripping can account for 10-25% of a home's heating and cooling losses.",
    instructions: [
      "Open and close each operable window — it should move smoothly without excessive force",
      "With the window closed, inspect the weatherstripping around the sash perimeter for compression set (permanently flattened), tears, gaps, or missing sections",
      "Run your hand slowly along the closed window edges — you should feel no air movement. Any draft indicates a weatherstripping failure.",
      "For a more precise test, hold a lit incense stick near the closed window edges — smoke deflection shows air leaks",
      "Check the meeting rail weatherstripping on double-hung windows (where the upper and lower sash meet in the middle)",
      "For sliding windows, check the pile weatherstripping (fuzzy strip) in the tracks for wear and compression",
      "Vacuum all window tracks to remove dirt, dead insects, and debris that prevent the sash from seating fully",
      "Clean the tracks with a damp cloth and mild all-purpose cleaner",
      "Lubricate window tracks with a dry silicone spray (not WD-40 or oil-based lubricants, which attract dirt)",
      "Test all window locks and latches — the latch pulls the sash tight against the weatherstripping for a proper seal",
      "For casement windows, check the compression weatherstripping in the frame groove — replace if permanently compressed or cracked",
      "Replace any damaged weatherstripping — most types are available at hardware stores and are simple peel-and-stick or press-in installation",
    ],
    frequency: {
      intervalMonths: 12,
      seasonalAdjustments: {
        note: "Annual inspection in fall before heating season when weatherstripping matters most for energy efficiency and comfort. Clean tracks in spring after winter debris accumulation.",
      },
      triggerConditions: [
        "Drafts felt near closed windows",
        "Windows difficult to open, close, or lock",
        "Visible daylight around closed sash edges",
        "Increased heating or cooling bills",
        "Road noise louder than usual (sound travels through air leaks)",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 45,
    toolsRequired: [
      "vacuum with crevice attachment (for tracks)",
      "damp cloth and mild cleaner",
      "dry silicone spray lubricant",
      "replacement weatherstripping (if needed — $3-$10 per window at hardware stores)",
      "incense stick or smoke pencil (optional — for air leak detection)",
    ],
    materialsCost: { low: 0, high: 30 },
    professionalCost: { low: 100, high: 300 },
    skipConsequences: {
      shortTerm:
        "Air leaks around windows cause drafts, cold spots, and increased heating costs; dirt in tracks makes windows difficult to operate, discouraging use for ventilation",
      longTerm:
        "Worn weatherstripping wastes 10-25% of heating and cooling energy; windows that are difficult to operate eventually get stuck permanently; water infiltration through failed weatherstripping damages window sills and wall framing",
      costOfNeglect:
        "Replacing weatherstripping costs $3-$10 per window DIY. The energy savings from proper sealing easily exceed $100-$300/year for a typical home.",
    },
    safetyNotes: [
      "Do not force a stuck window — forced operation can break the sash, crack the glass, or damage the frame",
      "Use dry silicone lubricant only — oil-based lubricants attract dirt and gum up the tracks worse than before",
      "If a window is stuck shut and cannot be freed, consider having a window professional service it — some windows have tilt-in sashes with hidden release mechanisms",
    ],
    seasonalRelevance: ["fall"],
    priority: "medium" as const,
    tags: [
      "windows",
      "weatherstripping",
      "tracks",
      "energy-efficiency",
      "diy",
      "annual",
      "structural",
    ],
  },
];

export const seed = internalMutation({
  handler: async (ctx) => {
    let inserted = 0;
    let skipped = 0;

    for (const task of structuralMaintenanceTasks) {
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
      `[tasks_structural] Seeded ${inserted} structural maintenance tasks (${skipped} already existed)`
    );
    return { inserted, skipped, total: structuralMaintenanceTasks.length };
  },
});
