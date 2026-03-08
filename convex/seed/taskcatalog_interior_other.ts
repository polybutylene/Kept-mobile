// Maintenance Task Catalog — Interior, Appliance, Safety, Structural, Landscape
// 111 entries covering all homeowner-facing maintenance tasks
// Frequencies calibrated from manufacturer recommendations, NAHB data, NFPA standards,
// and 8 years of HVAC/plumbing field experience in Florida.

interface ClimateAdjustment {
  climateZone: string;
  adjustedFrequencyDays: number;
  reason: string;
}

interface CostRange {
  low: number;
  high: number;
}

interface TaskCatalogEntry {
  taskId: string;
  taskName: string;
  category: string;
  applicableSystemIds: string[];
  frequencyType: string;
  frequencyValue: number;
  frequencyUnit: "days";
  seasonalMonths?: number[];
  climateAdjustments?: ClimateAdjustment[];
  difficulty: string;
  estimatedTimeMinutes: number;
  diyCost: CostRange;
  proCost: CostRange;
  shortDescription: string;
  detailedInstructions: string;
  whyItMatters: string;
  whatHappensIfSkipped: string;
  toolsNeeded: string[];
  suppliesNeeded: string[];
  careKitProductIds: string[];
  estimatedSavings: string;
  source: "industry_standard";
  isActive: true;
  lastUpdated: number;
}

// ============================================================
// INTERIOR TASKS (49 entries)
// ============================================================

const INTERIOR_TASKS: TaskCatalogEntry[] = [
  {
    taskId: "task.interior.hardwood.clean",
    taskName: "Clean Hardwood Floors",
    category: "interior",
    applicableSystemIds: ["interior.flooring.hardwood"],
    frequencyType: "interval",
    frequencyValue: 7,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 30,
    diyCost: { low: 0, high: 5 },
    proCost: { low: 80, high: 150 },
    shortDescription: "Dust mop and damp mop hardwood floors to prevent grit buildup that scratches finish.",
    detailedInstructions:
      "1. Remove loose items, rugs, and furniture pads from the floor area.\n" +
      "2. Dust mop or vacuum with a hard-floor attachment — work from the far corner toward the exit.\n" +
      "3. Mix hardwood floor cleaner per label directions (never use vinegar, steam, or wet Swiffer on real wood).\n" +
      "4. Damp mop in sections using a flat microfiber mop wrung almost dry.\n" +
      "5. Wipe up any standing moisture immediately — water is hardwood's enemy.\n" +
      "6. Replace furniture pads if they look compressed or dirty.\n" +
      "7. Check for new scratches or dull spots while cleaning.",
    whyItMatters: "Grit and sand act like sandpaper under foot traffic. Regular cleaning preserves the finish coat and delays a $3–8/sqft refinish by years.",
    whatHappensIfSkipped: "Micro-scratches accumulate and dull the finish within months. Once the polyurethane wears through, the raw wood absorbs moisture and stains, requiring full sanding and refinishing ($2,000–$5,000 for an average home).",
    toolsNeeded: ["Microfiber dust mop", "Flat microfiber wet mop", "Vacuum with hard-floor attachment"],
    suppliesNeeded: ["Hardwood floor cleaner (Bona, Murphy's, or manufacturer-recommended)", "Clean microfiber pads"],
    careKitProductIds: ["hardwood_cleaner", "microfiber_mop"],
    estimatedSavings: "Extends time between $2,000–$5,000 refinishes by 3–5 years",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.hardwood.inspect_finish",
    taskName: "Inspect Hardwood Finish Wear",
    category: "interior",
    applicableSystemIds: ["interior.flooring.hardwood"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 15,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Visually inspect hardwood finish for wear-through, scratches, and water damage.",
    detailedInstructions:
      "1. Walk the entire floor in good natural light, looking for dull traffic lanes.\n" +
      "2. Drip a few drops of water on high-traffic areas — if it soaks in instead of beading, the finish is compromised.\n" +
      "3. Check transitions at doorways and kitchen edges for finish wear.\n" +
      "4. Look for dark spots indicating moisture penetration.\n" +
      "5. Inspect near exterior doors and sliding glass doors for sun bleaching.\n" +
      "6. Note any board cupping, crowning, or gaps between planks.\n" +
      "7. Record findings and schedule refinishing if finish is worn through in any area.",
    whyItMatters: "Catching finish wear early lets you do a simple screen-and-recoat ($1–2/sqft) instead of a full sand-and-refinish ($3–8/sqft).",
    whatHappensIfSkipped: "Worn finish allows moisture to reach the wood substrate, causing warping, dark stains, and potential mold growth underneath — turning a $1,500 recoat into a $5,000+ full refinish or board replacement.",
    toolsNeeded: ["Flashlight"],
    suppliesNeeded: ["Small cup of water for bead test"],
    careKitProductIds: [],
    estimatedSavings: "Early screen-and-recoat saves $1,500–$3,500 vs full refinish",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.hardwood.refinish",
    taskName: "Refinish Hardwood Floors",
    category: "interior",
    applicableSystemIds: ["interior.flooring.hardwood"],
    frequencyType: "interval",
    frequencyValue: 2190,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 1825, reason: "Humidity and higher foot traffic on barefoot-friendly floors accelerate finish wear in Florida homes" },
    ],
    difficulty: "professional",
    estimatedTimeMinutes: 2880,
    diyCost: { low: 500, high: 1500 },
    proCost: { low: 2000, high: 5000 },
    shortDescription: "Sand and apply new finish coats to restore hardwood floors to like-new condition.",
    detailedInstructions:
      "1. Remove all furniture and seal HVAC vents with plastic to prevent dust circulation.\n" +
      "2. Sand floors using a drum sander (coarse to fine grit progression: 36→60→100).\n" +
      "3. Edge sand along walls and in corners with an edger sander.\n" +
      "4. Vacuum and tack-cloth the entire surface — any dust will show in the finish.\n" +
      "5. Apply stain if desired, working in sections and wiping excess.\n" +
      "6. Apply first coat of polyurethane (water-based for lower VOC, oil-based for richer color).\n" +
      "7. Lightly sand between coats with 220-grit screen.\n" +
      "8. Apply second and third coats, allowing full cure time between each.",
    whyItMatters: "Refinishing restores the protective barrier and extends hardwood life by 15–25 years per cycle. A well-maintained hardwood floor adds $5,000–$10,000 to home value.",
    whatHappensIfSkipped: "Without refinishing, worn areas allow moisture damage that warps boards. Full board replacement costs $8–15/sqft vs $2–5/sqft for refinishing. Severely damaged hardwood may need to be ripped out entirely.",
    toolsNeeded: ["Drum sander", "Edger sander", "Buffer/screen", "Vacuum", "Tack cloths", "Applicator pads"],
    suppliesNeeded: ["Sandpaper (36, 60, 100 grit)", "220-grit screens", "Polyurethane finish", "Stain (optional)", "Painter's tape", "Plastic sheeting for vents"],
    careKitProductIds: [],
    estimatedSavings: "Preserves $5,000–$10,000 in home value; avoids $8,000–$15,000 board replacement",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.lvp.clean",
    taskName: "Clean LVP Floors",
    category: "interior",
    applicableSystemIds: ["interior.flooring.lvp"],
    frequencyType: "interval",
    frequencyValue: 7,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 20,
    diyCost: { low: 0, high: 5 },
    proCost: { low: 60, high: 120 },
    shortDescription: "Sweep and damp mop luxury vinyl plank floors to maintain appearance and prevent grit damage.",
    detailedInstructions:
      "1. Sweep or vacuum with a soft-bristle hard-floor attachment.\n" +
      "2. Mix a mild vinyl floor cleaner — avoid bleach, abrasive cleaners, or wax-based products.\n" +
      "3. Damp mop in sections using a microfiber mop.\n" +
      "4. Do not use a steam mop — heat can warp vinyl planks and break adhesive bonds.\n" +
      "5. Wipe up excess water, especially at plank seams.\n" +
      "6. Check for any lifted edges or gaps at seams while mopping.",
    whyItMatters: "Regular cleaning prevents grit from scratching the wear layer, which is the only barrier protecting the core. Once the wear layer is compromised, the plank must be replaced.",
    whatHappensIfSkipped: "Grit acts as sandpaper and wears through the thin wear layer (6–20 mil). Damaged LVP cannot be refinished like hardwood — individual planks must be replaced at $3–8/sqft installed.",
    toolsNeeded: ["Broom or vacuum", "Microfiber mop"],
    suppliesNeeded: ["Vinyl floor cleaner"],
    careKitProductIds: ["vinyl_floor_cleaner", "microfiber_mop"],
    estimatedSavings: "Extends wear layer life, delaying $2,000–$5,000 replacement by 5+ years",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.lvp.inspect",
    taskName: "Inspect LVP for Damage",
    category: "interior",
    applicableSystemIds: ["interior.flooring.lvp"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 15,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Check LVP floors for lifted edges, gaps, discoloration, and wear-through.",
    detailedInstructions:
      "1. Walk every room in natural light, looking for lifted plank edges.\n" +
      "2. Check seams near kitchens and bathrooms for swelling or moisture damage.\n" +
      "3. Look for scratches, gouges, or wear-through in high-traffic paths.\n" +
      "4. Press on any suspicious soft spots — this may indicate subfloor moisture.\n" +
      "5. Check transition strips at doorways for looseness.\n" +
      "6. Note any clicking or hollow sounds when walked on, indicating adhesive failure.",
    whyItMatters: "Catching a single lifted plank early means a $20 repair. Letting moisture infiltrate through gaps can damage the subfloor underneath, turning it into a $2,000+ repair.",
    whatHappensIfSkipped: "Moisture seeps through damaged seams, causing mold growth on the subfloor. Subfloor replacement under LVP costs $3,000–$8,000 depending on the area.",
    toolsNeeded: ["Flashlight"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Prevents $2,000–$8,000 subfloor damage from undetected moisture",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.laminate.clean",
    taskName: "Clean Laminate Floors",
    category: "interior",
    applicableSystemIds: ["interior.flooring.laminate"],
    frequencyType: "interval",
    frequencyValue: 7,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 20,
    diyCost: { low: 0, high: 5 },
    proCost: { low: 60, high: 120 },
    shortDescription: "Dust mop and spot-clean laminate floors — never use excessive water on laminate.",
    detailedInstructions:
      "1. Sweep or vacuum with hard-floor setting (no beater bar).\n" +
      "2. Spot clean stains with a barely damp cloth — ring out all excess water.\n" +
      "3. Never use a wet mop, steam mop, or leave standing water on laminate.\n" +
      "4. Use a laminate-specific cleaner if needed (avoid wax, polish, or oil-based products).\n" +
      "5. Dry any damp areas immediately.\n" +
      "6. Place mats at exterior entries to trap grit before it reaches laminate.",
    whyItMatters: "Laminate's fiberboard core absorbs water like a sponge. Even small amounts of moisture cause irreversible swelling. Keeping it dry is the single most important thing.",
    whatHappensIfSkipped: "Grit scratches the thin decorative layer, and moisture causes the fiberboard core to swell permanently. Swollen laminate must be replaced — you cannot repair it. Replacement costs $2–5/sqft.",
    toolsNeeded: ["Broom or vacuum", "Microfiber cloth"],
    suppliesNeeded: ["Laminate floor cleaner"],
    careKitProductIds: ["laminate_cleaner"],
    estimatedSavings: "Extends floor life by 5+ years, saving $1,500–$3,500 in early replacement",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.laminate.inspect",
    taskName: "Inspect Laminate Floors",
    category: "interior",
    applicableSystemIds: ["interior.flooring.laminate"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 15,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Inspect laminate for swelling, peaking, gaps, and delamination.",
    detailedInstructions:
      "1. Walk every room listening for hollow sounds or creaking.\n" +
      "2. Look for swollen or peaked edges at plank joints.\n" +
      "3. Check near dishwashers, fridges, and bathrooms for water damage.\n" +
      "4. Inspect transition strips and thresholds for looseness.\n" +
      "5. Look for peeling or chipping of the decorative layer.\n" +
      "6. Note any musty smell that may indicate trapped moisture or mold under the floor.",
    whyItMatters: "Laminate is the most moisture-sensitive flooring type. Early detection of swelling means you can replace a few planks ($50–100) instead of an entire room ($1,500–$3,000).",
    whatHappensIfSkipped: "Swollen planks push against each other causing peak damage across large areas. Mold can grow unseen on the subfloor underneath. Full-room replacement plus mold remediation can cost $3,000–$8,000.",
    toolsNeeded: ["Flashlight"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Early catch saves $2,000–$7,000 vs full-room replacement with mold remediation",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.tile.clean_grout",
    taskName: "Clean Tile Grout",
    category: "interior",
    applicableSystemIds: ["interior.flooring.tile", "interior.backsplash.tile"],
    frequencyType: "interval",
    frequencyValue: 30,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 21, reason: "Florida humidity promotes faster mold and mildew growth in grout lines" },
    ],
    difficulty: "easy",
    estimatedTimeMinutes: 45,
    diyCost: { low: 5, high: 15 },
    proCost: { low: 150, high: 350 },
    shortDescription: "Scrub grout lines to remove mildew, staining, and buildup that degrade grout integrity.",
    detailedInstructions:
      "1. Sweep or vacuum the tile floor first to remove loose debris.\n" +
      "2. Apply grout cleaner (or a paste of baking soda and water) along grout lines.\n" +
      "3. Let the cleaner sit for 5–10 minutes to loosen buildup.\n" +
      "4. Scrub grout lines with a stiff nylon brush — work in small sections.\n" +
      "5. Rinse thoroughly with clean water and mop up residue.\n" +
      "6. Dry the area with a towel or fan to prevent moisture sitting in grout.\n" +
      "7. If stains persist, apply oxygen bleach solution and let sit 30 minutes before scrubbing.",
    whyItMatters: "Grout is porous and absorbs moisture, stains, and mold. Regular cleaning prevents grout breakdown that leads to loose tiles and water penetration to the subfloor.",
    whatHappensIfSkipped: "Mold and mildew embed deep in grout, causing permanent discoloration and grout crumbling. Failed grout lets water reach the substrate, potentially causing $1,500–$5,000 in subfloor and tile damage.",
    toolsNeeded: ["Stiff nylon grout brush", "Bucket", "Mop"],
    suppliesNeeded: ["Grout cleaner or baking soda", "Oxygen bleach (optional)"],
    careKitProductIds: ["grout_cleaner", "grout_brush"],
    estimatedSavings: "Prevents $500–$2,000 grout repair/replacement and potential $3,000+ water damage",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.tile.reseal_grout",
    taskName: "Reseal Tile Grout",
    category: "interior",
    applicableSystemIds: ["interior.flooring.tile", "interior.backsplash.tile"],
    frequencyType: "interval",
    frequencyValue: 548,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 365, reason: "Higher moisture exposure in humid climates breaks down sealant faster" },
    ],
    difficulty: "moderate",
    estimatedTimeMinutes: 120,
    diyCost: { low: 15, high: 40 },
    proCost: { low: 200, high: 500 },
    shortDescription: "Apply penetrating sealer to grout lines to prevent moisture absorption, staining, and mold.",
    detailedInstructions:
      "1. Clean all grout thoroughly and let dry completely (24 hours minimum).\n" +
      "2. Test current seal by dropping water on grout — if it absorbs within 30 seconds, resealing is needed.\n" +
      "3. Apply penetrating grout sealer using a small applicator bottle or brush.\n" +
      "4. Work in 3-foot sections, wiping excess sealer off tile faces within 5 minutes.\n" +
      "5. Allow first coat to dry per product directions (usually 1–2 hours).\n" +
      "6. Apply second coat for maximum protection.\n" +
      "7. Allow full cure (24–48 hours) before getting grout wet.",
    whyItMatters: "Sealed grout repels water and stains, preventing the #1 cause of tile failure: water penetrating through grout to the substrate underneath.",
    whatHappensIfSkipped: "Unsealed grout absorbs water with every mopping and shower, leading to mold growth, grout crumbling, loose tiles, and eventually subfloor rot. Repairs range from $500 for regrout to $5,000+ for full tear-out.",
    toolsNeeded: ["Grout sealer applicator bottle", "Clean rags", "Gloves"],
    suppliesNeeded: ["Penetrating grout sealer (silicone or fluoropolymer based)"],
    careKitProductIds: ["grout_sealer"],
    estimatedSavings: "$15–40 sealer prevents $500–$5,000 in grout and subfloor repairs",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.tile.inspect",
    taskName: "Inspect Tile and Grout",
    category: "interior",
    applicableSystemIds: ["interior.flooring.tile", "interior.backsplash.tile"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 15,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Check tile and grout for cracks, loose tiles, and grout deterioration.",
    detailedInstructions:
      "1. Walk the tile floor listening for hollow sounds (tap test) — indicates tile debonding.\n" +
      "2. Press on tiles near wet areas to check for flex — this indicates substrate damage.\n" +
      "3. Examine grout lines for cracking, crumbling, or missing sections.\n" +
      "4. Check caulk joints where tile meets tub, shower pan, and countertops.\n" +
      "5. Look for cracked or chipped tiles, especially at doorways and high-traffic areas.\n" +
      "6. Drop water on grout to test seal integrity.",
    whyItMatters: "A single cracked grout line or loose tile near a shower can allow water behind the wall, causing thousands in damage before you notice any signs on the surface.",
    whatHappensIfSkipped: "Loose tiles allow water to reach the subfloor/wall sheathing. In bathrooms, this causes hidden mold and structural rot. Shower pan failures from neglected grout cost $3,000–$10,000 to repair.",
    toolsNeeded: ["Flashlight"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Prevents $3,000–$10,000 in hidden water damage by catching issues early",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.carpet.vacuum",
    taskName: "Vacuum Carpet",
    category: "interior",
    applicableSystemIds: ["interior.flooring.carpet"],
    frequencyType: "interval",
    frequencyValue: 3,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 20,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 50, high: 100 },
    shortDescription: "Vacuum all carpeted areas to remove dirt, allergens, and grit that wear down carpet fibers.",
    detailedInstructions:
      "1. Pick up toys, shoes, and small items from the floor.\n" +
      "2. Use a vacuum with a HEPA filter and beater bar/brush roll.\n" +
      "3. Vacuum high-traffic areas with slow, overlapping passes.\n" +
      "4. Use the crevice tool along baseboards and in corners.\n" +
      "5. Move lighter furniture periodically to vacuum underneath.\n" +
      "6. Empty or replace the vacuum bag/canister when half full for best suction.",
    whyItMatters: "80% of carpet soiling is dry particulate that can be removed by vacuuming. Regular vacuuming prevents grit from cutting carpet fibers at the base, which causes matting and premature wear.",
    whatHappensIfSkipped: "Embedded grit cuts fibers at the base, causing permanent matting and traffic lanes within 1–2 years. A carpet that should last 10–15 years may need replacement in 5–7 years ($3–6/sqft installed).",
    toolsNeeded: ["Vacuum cleaner with HEPA filter", "Crevice attachment"],
    suppliesNeeded: ["Replacement vacuum bags/filters"],
    careKitProductIds: [],
    estimatedSavings: "Extends carpet life by 3–5 years, saving $2,000–$5,000 in early replacement",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.carpet.deep_clean",
    taskName: "Deep Clean / Shampoo Carpet",
    category: "interior",
    applicableSystemIds: ["interior.flooring.carpet"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 270, reason: "Higher humidity increases mold/mildew risk in carpet padding; more frequent cleaning prevents buildup" },
    ],
    difficulty: "moderate",
    estimatedTimeMinutes: 180,
    diyCost: { low: 30, high: 75 },
    proCost: { low: 150, high: 400 },
    shortDescription: "Hot water extraction or steam cleaning to remove deep-embedded dirt, allergens, and stains.",
    detailedInstructions:
      "1. Vacuum thoroughly first — deep cleaning is not a substitute for vacuuming.\n" +
      "2. Pre-treat heavy stains and high-traffic lanes with carpet pre-spray.\n" +
      "3. Fill carpet cleaner with hot (not boiling) water and cleaning solution.\n" +
      "4. Make slow passes with the extractor, overlapping each stroke.\n" +
      "5. Make a second dry pass to extract maximum moisture.\n" +
      "6. Open windows and run fans to speed drying — carpet should dry within 6–12 hours.\n" +
      "7. Do not walk on carpet until fully dry to prevent resoiling.",
    whyItMatters: "Deep cleaning removes the 20% of soil that vacuuming can't reach: body oils, cooking residue, and allergens trapped deep in fibers and padding. Most carpet warranties require annual professional cleaning.",
    whatHappensIfSkipped: "Oils and grime permanently bond to fibers, causing color change and odors. Carpet padding harbors mold in humid climates. Allergen levels spike, affecting indoor air quality. Warranty may be voided.",
    toolsNeeded: ["Carpet extractor/steam cleaner (rent or own)", "Vacuum"],
    suppliesNeeded: ["Carpet cleaning solution", "Pre-spray spot treatment"],
    careKitProductIds: ["carpet_cleaner"],
    estimatedSavings: "Maintains carpet warranty and extends life 3–5 years ($2,000–$5,000 value)",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.carpet.inspect",
    taskName: "Inspect Carpet Condition",
    category: "interior",
    applicableSystemIds: ["interior.flooring.carpet"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 15,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Check carpet for wear patterns, stains, rippling, and padding breakdown.",
    detailedInstructions:
      "1. Examine high-traffic areas for matting and fiber loss.\n" +
      "2. Check for ripples or buckling that indicate stretched carpet or padding failure.\n" +
      "3. Look along seams for separation or fraying.\n" +
      "4. Check near exterior doors for discoloration from sunlight.\n" +
      "5. Pull back carpet at one edge to inspect padding condition if possible.\n" +
      "6. Note any persistent odors that may indicate mold in padding.",
    whyItMatters: "Identifying carpet issues early lets you make targeted repairs (re-stretching, patching) instead of full replacement.",
    whatHappensIfSkipped: "Buckled carpet becomes a trip hazard. Separated seams worsen rapidly. Mold in padding goes undetected, causing health issues and requiring carpet plus padding replacement ($4–8/sqft).",
    toolsNeeded: ["Flashlight"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Re-stretching ($100–200) vs replacement ($2,000–$5,000)",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.epoxy.clean",
    taskName: "Clean Epoxy Floor",
    category: "interior",
    applicableSystemIds: ["interior.flooring.epoxy"],
    frequencyType: "interval",
    frequencyValue: 30,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 30,
    diyCost: { low: 0, high: 5 },
    proCost: { low: 80, high: 150 },
    shortDescription: "Sweep and mop epoxy garage/utility floor to prevent chemical staining and surface degradation.",
    detailedInstructions:
      "1. Sweep or blow out loose debris and dust.\n" +
      "2. Clean up any oil, coolant, or chemical spills immediately with absorbent.\n" +
      "3. Mop with warm water and a pH-neutral cleaner.\n" +
      "4. Do not use citrus cleaners, vinegar, or harsh degreasers — they break down the epoxy.\n" +
      "5. Rinse with clean water and squeegee dry.\n" +
      "6. Check for any chips or peeling spots while cleaning.",
    whyItMatters: "Epoxy protects the concrete underneath from moisture, chemicals, and staining. Keeping it clean prevents chemical attack on the coating.",
    whatHappensIfSkipped: "Automotive fluids and road salt eat through epoxy coating. Once compromised, moisture gets under the coating causing peeling and flaking. Recoating an entire garage floor costs $1,500–$3,500.",
    toolsNeeded: ["Broom", "Mop", "Squeegee"],
    suppliesNeeded: ["pH-neutral floor cleaner"],
    careKitProductIds: [],
    estimatedSavings: "Extends epoxy life by 5+ years, saving $1,500–$3,500 in recoating",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.epoxy.inspect",
    taskName: "Inspect Epoxy Floor for Chips/Peeling",
    category: "interior",
    applicableSystemIds: ["interior.flooring.epoxy"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 15,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Inspect epoxy coating for chips, peeling, hot tire marks, and adhesion failure.",
    detailedInstructions:
      "1. Move vehicles out and inspect the entire floor in good light.\n" +
      "2. Look for chips or gouges from dropped tools or heavy objects.\n" +
      "3. Check hot tire pickup areas where vehicles park regularly.\n" +
      "4. Press on any bubbled or lifted areas to assess adhesion.\n" +
      "5. Check edges and corners where peeling typically starts.\n" +
      "6. Note problem areas — small chips can be touched up with epoxy patch kits.",
    whyItMatters: "Small chips and peeling edges spread quickly once started. A $20 patch kit can fix a chip, but once peeling spreads, the entire floor needs recoating.",
    whatHappensIfSkipped: "Small chips grow into large delaminated areas. Moisture penetrates underneath, causing the coating to bubble and peel across the entire floor. Full re-prep and recoat: $2,000–$4,000.",
    toolsNeeded: ["Flashlight"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "$20 touch-up prevents $2,000–$4,000 full recoat",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.granite.clean",
    taskName: "Clean Granite Countertops",
    category: "interior",
    applicableSystemIds: ["interior.countertop.granite"],
    frequencyType: "interval",
    frequencyValue: 7,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCost: { low: 0, high: 5 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Wipe down granite countertops with pH-neutral cleaner to prevent etching and staining.",
    detailedInstructions:
      "1. Wipe the surface with a soft cloth and warm water to remove crumbs and debris.\n" +
      "2. Spray granite-specific cleaner (or mild dish soap diluted in water).\n" +
      "3. Wipe clean with a microfiber cloth.\n" +
      "4. Avoid acidic cleaners (vinegar, lemon, Windex) — they etch the surface.\n" +
      "5. Blot spills immediately, especially wine, citrus, and coffee.\n" +
      "6. Buff dry with a clean cloth to prevent water spots.",
    whyItMatters: "Granite is porous despite being hard. Acidic substances etch the polish and stains can penetrate if the seal is compromised. Proper cleaning preserves the factory polish.",
    whatHappensIfSkipped: "Acidic residue dulls the polish over time. Stains set into the stone permanently. Professional re-polishing costs $200–$500; severe damage requires slab replacement at $2,000–$5,000.",
    toolsNeeded: ["Microfiber cloths"],
    suppliesNeeded: ["Granite cleaner or mild dish soap"],
    careKitProductIds: ["granite_cleaner"],
    estimatedSavings: "Maintains factory polish, avoiding $200–$500 professional re-polishing",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.granite.seal",
    taskName: "Seal Granite Countertops",
    category: "interior",
    applicableSystemIds: ["interior.countertop.granite"],
    frequencyType: "interval",
    frequencyValue: 548,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 30,
    diyCost: { low: 15, high: 30 },
    proCost: { low: 100, high: 250 },
    shortDescription: "Apply penetrating sealer to granite countertops to repel water, oil, and stains.",
    detailedInstructions:
      "1. Clean countertop thoroughly and let dry completely.\n" +
      "2. Test current seal: drop water on the surface — if it beads, seal is good; if it darkens/absorbs, resealing is needed.\n" +
      "3. Apply granite sealer in small sections with a clean cloth.\n" +
      "4. Let sealer absorb for 15–20 minutes (per product directions).\n" +
      "5. Wipe off all excess with a clean, dry cloth — do not let it dry on the surface.\n" +
      "6. Apply second coat for maximum protection.\n" +
      "7. Allow 24 hours to cure before using the countertop normally.",
    whyItMatters: "The sealer creates an invisible barrier that prevents stains from penetrating granite's natural pores. A $15 bottle protects a $3,000–$5,000 countertop investment.",
    whatHappensIfSkipped: "Without sealant, coffee, wine, and cooking oils stain granite permanently. Stain removal requires poulticing ($50–150 professional), and severe stains require slab replacement ($2,000–$5,000).",
    toolsNeeded: ["Clean cloths", "Gloves"],
    suppliesNeeded: ["Granite penetrating sealer"],
    careKitProductIds: ["granite_sealer"],
    estimatedSavings: "$15–30 sealer protects $3,000–$5,000 countertop investment",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.quartz.clean",
    taskName: "Clean Quartz Countertops",
    category: "interior",
    applicableSystemIds: ["interior.countertop.quartz"],
    frequencyType: "interval",
    frequencyValue: 7,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCost: { low: 0, high: 5 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Wipe quartz countertops with mild soap and water to maintain appearance.",
    detailedInstructions:
      "1. Wipe surface with warm water and a soft cloth to remove debris.\n" +
      "2. Apply mild dish soap to a damp cloth for deeper cleaning.\n" +
      "3. Avoid abrasive pads or scouring powders — quartz resin can scratch.\n" +
      "4. Clean up permanent marker, adhesives, or dried food with isopropyl alcohol on a cloth.\n" +
      "5. Avoid harsh chemicals: bleach, oven cleaner, and paint strippers damage the resin.\n" +
      "6. Wipe dry to prevent water spots.",
    whyItMatters: "While quartz is engineered to be non-porous, the resin binder can be damaged by harsh chemicals and heat. Gentle cleaning preserves the surface integrity.",
    whatHappensIfSkipped: "Dried-on food and chemical residue can dull the engineered finish. While quartz is more forgiving than granite, heat damage and chemical etching are permanent and require professional repair ($200–$400) or slab replacement.",
    toolsNeeded: ["Soft cloths"],
    suppliesNeeded: ["Mild dish soap"],
    careKitProductIds: [],
    estimatedSavings: "Prevents $200–$400 professional surface repair",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.quartz.inspect",
    taskName: "Inspect Quartz Seams and Surface",
    category: "interior",
    applicableSystemIds: ["interior.countertop.quartz"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Inspect quartz countertop seams, edges, and surface for chips, discoloration, and separation.",
    detailedInstructions:
      "1. Run your hand along all seams feeling for separation or lippage.\n" +
      "2. Check edges, especially around sinks and cooktops, for chips.\n" +
      "3. Look for discoloration near heat sources (quartz can yellow from sustained heat).\n" +
      "4. Verify caulk joints where countertop meets backsplash and wall.\n" +
      "5. Check undermount sink clips and adhesive for looseness.\n" +
      "6. Note any visible cracks — even hairline cracks in quartz spread quickly.",
    whyItMatters: "Quartz seams can separate due to house settling or adhesive failure. Catching separation early prevents water damage to the cabinets below.",
    whatHappensIfSkipped: "Separated seams allow water into cabinets causing wood swelling and mold. A dropped undermount sink can crack the countertop. Crack repairs cost $200–500; slab replacement costs $2,000–$5,000.",
    toolsNeeded: ["Flashlight"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Early seam repair ($100–200) vs slab replacement ($2,000–$5,000)",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.marble.clean",
    taskName: "Clean Marble Surfaces",
    category: "interior",
    applicableSystemIds: ["interior.countertop.marble"],
    frequencyType: "interval",
    frequencyValue: 7,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 15,
    diyCost: { low: 0, high: 5 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Clean marble with pH-neutral cleaner — marble is extremely acid-sensitive.",
    detailedInstructions:
      "1. Dust the surface first with a dry soft cloth.\n" +
      "2. Dampen a cloth with warm water and a few drops of pH-neutral stone soap.\n" +
      "3. Wipe gently — never use circular motions on polished marble (causes swirl marks).\n" +
      "4. Immediately blot any acidic spills: citrus, wine, vinegar, tomato sauce.\n" +
      "5. Never use vinegar, Windex, generic bathroom cleaners, or anything acidic.\n" +
      "6. Dry with a soft cloth to prevent water spots and mineral deposits.",
    whyItMatters: "Marble is calcite-based and reacts chemically with any acid, causing permanent etch marks (dull spots). Once etched, only professional honing can remove them.",
    whatHappensIfSkipped: "Acid etching creates dull spots that worsen over time. Dirt and grime embed into marble's open pores. Professional honing and polishing costs $3–8/sqft. Severe damage requires slab replacement.",
    toolsNeeded: ["Soft cloths"],
    suppliesNeeded: ["pH-neutral stone soap"],
    careKitProductIds: ["marble_cleaner"],
    estimatedSavings: "Avoids $300–$800 professional honing/polishing per occurrence",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.marble.seal",
    taskName: "Seal Marble Surfaces",
    category: "interior",
    applicableSystemIds: ["interior.countertop.marble"],
    frequencyType: "interval",
    frequencyValue: 270,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 180, reason: "High humidity in Florida breaks down marble sealant faster; bathrooms need more frequent sealing" },
    ],
    difficulty: "easy",
    estimatedTimeMinutes: 30,
    diyCost: { low: 15, high: 35 },
    proCost: { low: 150, high: 300 },
    shortDescription: "Apply impregnating sealer to marble to protect against staining and moisture absorption.",
    detailedInstructions:
      "1. Clean marble thoroughly and allow 24 hours to dry.\n" +
      "2. Test current seal with the water drop test — if water soaks in, resealing is needed.\n" +
      "3. Apply marble-specific impregnating sealer with a clean cloth in small sections.\n" +
      "4. Allow sealer to penetrate for 15–20 minutes.\n" +
      "5. Wipe off all residue — excess sealer left to dry creates haze.\n" +
      "6. Apply a second coat for best protection.\n" +
      "7. Allow 24-hour cure before normal use.",
    whyItMatters: "Marble is the most porous common countertop material. Sealing buys you time to wipe up spills before they stain permanently.",
    whatHappensIfSkipped: "Unsealed marble stains within seconds from coffee, wine, or cooking oil. Once stained, removal requires professional poulticing ($100–300) or honing ($3–8/sqft). Deep stains may be permanent.",
    toolsNeeded: ["Clean cloths", "Gloves"],
    suppliesNeeded: ["Marble impregnating sealer"],
    careKitProductIds: ["marble_sealer"],
    estimatedSavings: "$15–35 sealer prevents $100–$800 in stain removal and polishing",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.marble.polish",
    taskName: "Polish Marble Surfaces",
    category: "interior",
    applicableSystemIds: ["interior.countertop.marble"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "moderate",
    estimatedTimeMinutes: 60,
    diyCost: { low: 20, high: 50 },
    proCost: { low: 200, high: 500 },
    shortDescription: "Restore marble shine with polishing compound to remove light etch marks and dullness.",
    detailedInstructions:
      "1. Clean the marble surface thoroughly and dry completely.\n" +
      "2. Apply marble polishing powder or cream to a damp soft cloth.\n" +
      "3. Work in small sections, buffing in straight lines (not circles).\n" +
      "4. Apply moderate pressure and rework areas with visible etch marks.\n" +
      "5. Wipe off polishing residue with a clean damp cloth.\n" +
      "6. Buff dry with a soft cloth to reveal the shine.\n" +
      "7. Seal immediately after polishing for best protection.",
    whyItMatters: "Annual polishing removes accumulated light etch marks and restores the reflective finish. It's maintenance-level work that prevents the need for professional honing.",
    whatHappensIfSkipped: "Etch marks accumulate and the surface becomes progressively duller. Eventually only professional diamond honing ($5–10/sqft) can restore the finish.",
    toolsNeeded: ["Soft cloths", "Buffing pad"],
    suppliesNeeded: ["Marble polishing powder or cream"],
    careKitProductIds: ["marble_polish"],
    estimatedSavings: "$20–50 DIY polish vs $500–$1,500 professional honing",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.laminate_counter.clean",
    taskName: "Clean Laminate Countertops",
    category: "interior",
    applicableSystemIds: ["interior.countertop.laminate"],
    frequencyType: "interval",
    frequencyValue: 7,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCost: { low: 0, high: 3 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Wipe laminate countertops with mild cleaner — avoid abrasives that damage the decorative layer.",
    detailedInstructions:
      "1. Wipe with warm soapy water and a soft cloth or sponge.\n" +
      "2. For tougher stains, use a baking soda paste applied gently.\n" +
      "3. Never use abrasive pads, steel wool, or scouring powder.\n" +
      "4. Avoid leaving standing water, especially at seams and edges.\n" +
      "5. Clean up acidic spills promptly — prolonged contact can cause discoloration.\n" +
      "6. Dry the surface after cleaning.",
    whyItMatters: "Laminate countertops are affordable but the decorative layer is thin. Proper cleaning prevents scratches that expose the particleboard core to moisture.",
    whatHappensIfSkipped: "Scratches in the decorative layer allow moisture to reach the particleboard, causing irreversible swelling. Laminate countertop replacement costs $500–$2,000 per section.",
    toolsNeeded: ["Soft cloth or sponge"],
    suppliesNeeded: ["Mild dish soap", "Baking soda (for stains)"],
    careKitProductIds: [],
    estimatedSavings: "Prevents premature replacement ($500–$2,000)",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.laminate_counter.inspect_seams",
    taskName: "Inspect Laminate Countertop Seams",
    category: "interior",
    applicableSystemIds: ["interior.countertop.laminate"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Check laminate seams, edges, and backsplash joints for lifting, swelling, or water damage.",
    detailedInstructions:
      "1. Inspect all seams where two laminate pieces meet.\n" +
      "2. Check edges near sinks for lifting or bubbling.\n" +
      "3. Look for swelling at seams, which indicates moisture penetration.\n" +
      "4. Verify the backsplash caulk joint is intact.\n" +
      "5. Press along edges to check for delamination from the substrate.\n" +
      "6. Apply seam filler or contact cement to any lifted edges immediately.",
    whyItMatters: "A lifted edge near the sink is the #1 failure point for laminate countertops. Catching it early means a $5 tube of seam filler vs a $1,000 countertop replacement.",
    whatHappensIfSkipped: "Water infiltrates through lifted seams, swelling the particleboard underneath. Once swollen, the damage is permanent and the section must be replaced ($500–$2,000).",
    toolsNeeded: ["Flashlight"],
    suppliesNeeded: ["Laminate seam filler (if needed)"],
    careKitProductIds: [],
    estimatedSavings: "$5 seam repair prevents $500–$2,000 replacement",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.butcher_block.oil",
    taskName: "Oil Butcher Block Countertop",
    category: "interior",
    applicableSystemIds: ["interior.countertop.butcher_block"],
    frequencyType: "interval",
    frequencyValue: 30,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 20,
    diyCost: { low: 5, high: 15 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Apply food-safe mineral oil to butcher block to prevent drying, cracking, and bacteria absorption.",
    detailedInstructions:
      "1. Clean the surface with mild soap and warm water, then dry completely.\n" +
      "2. Apply a generous coat of food-grade mineral oil with a clean cloth.\n" +
      "3. Work the oil in the direction of the wood grain.\n" +
      "4. Let the oil soak in for at least 4 hours (overnight is best).\n" +
      "5. Wipe off any excess oil with a clean dry cloth.\n" +
      "6. Apply board cream/wax on top for extra protection (optional).\n" +
      "7. Oil more frequently if the wood looks dry or light in color.",
    whyItMatters: "Wood is organic and dries out without regular oiling. Dry butcher block cracks, warps, and harbors bacteria in the open grain. Monthly oiling keeps the wood sealed and food-safe.",
    whatHappensIfSkipped: "The wood dries, cracks, and splits. Cracks harbor bacteria and become impossible to sanitize. A warped or cracked butcher block requires sanding and refinishing ($200–$400) or full replacement ($500–$2,000).",
    toolsNeeded: ["Clean cloths"],
    suppliesNeeded: ["Food-grade mineral oil", "Board cream/wax (optional)"],
    careKitProductIds: ["mineral_oil", "board_cream"],
    estimatedSavings: "$5–15/month prevents $500–$2,000 replacement",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.butcher_block.sand_refinish",
    taskName: "Sand & Refinish Butcher Block",
    category: "interior",
    applicableSystemIds: ["interior.countertop.butcher_block"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "moderate",
    estimatedTimeMinutes: 120,
    diyCost: { low: 20, high: 50 },
    proCost: { low: 200, high: 400 },
    shortDescription: "Sand out scratches, stains, and knife marks, then re-oil for a refreshed butcher block surface.",
    detailedInstructions:
      "1. Remove everything from the countertop.\n" +
      "2. Sand with 120-grit sandpaper to remove stains, scratches, and knife marks.\n" +
      "3. Progress to 180-grit, then 220-grit for a smooth finish.\n" +
      "4. Wipe off all sanding dust with a tack cloth.\n" +
      "5. Apply a generous coat of food-grade mineral oil.\n" +
      "6. Let soak overnight, then apply a second coat.\n" +
      "7. Apply board cream/wax as a final seal.",
    whyItMatters: "Butcher block is one of the few countertop materials you can fully restore yourself. Annual sanding removes accumulated damage and brings the surface back to new condition.",
    whatHappensIfSkipped: "Knife cuts and stains accumulate, eventually reaching a point where deep sanding removes too much material. Heavily damaged butcher block must be replaced ($500–$2,000).",
    toolsNeeded: ["Orbital sander or sanding block", "Tack cloths", "Clean cloths"],
    suppliesNeeded: ["Sandpaper (120, 180, 220 grit)", "Food-grade mineral oil", "Board cream/wax"],
    careKitProductIds: ["mineral_oil", "board_cream"],
    estimatedSavings: "$20–50 DIY refinish vs $200–$400 professional or $500–$2,000 replacement",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.paint.touch_up",
    taskName: "Touch Up Interior Paint",
    category: "interior",
    applicableSystemIds: ["interior.finishes.paint"],
    frequencyType: "condition_based",
    frequencyValue: 180,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 30,
    diyCost: { low: 5, high: 20 },
    proCost: { low: 100, high: 250 },
    shortDescription: "Touch up scuffs, nail holes, and minor wall damage with matching paint.",
    detailedInstructions:
      "1. Inspect walls for scuff marks, nail holes, and dings.\n" +
      "2. Fill nail holes and dings with lightweight spackle and let dry.\n" +
      "3. Sand spackle smooth with 220-grit sandpaper.\n" +
      "4. Clean the area to remove dust.\n" +
      "5. Apply matching paint with a small brush or mini roller.\n" +
      "6. Feather the edges to blend with the surrounding paint.\n" +
      "7. Apply a second coat if needed after the first dries.",
    whyItMatters: "Regular touch-ups maintain your home's appearance and protect drywall from moisture. Well-maintained paint directly impacts home value and buyer perception.",
    whatHappensIfSkipped: "Small damage worsens — scuffs become stains, cracks spread, and moisture reaches unprotected drywall. Deferred maintenance means full-room repainting ($300–$800/room) instead of quick touch-ups.",
    toolsNeeded: ["Small brush", "220-grit sandpaper", "Putty knife"],
    suppliesNeeded: ["Matching paint", "Lightweight spackle"],
    careKitProductIds: [],
    estimatedSavings: "$5–20 touch-up vs $300–$800 full room repaint",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.paint.repaint",
    taskName: "Full Interior Repaint",
    category: "interior",
    applicableSystemIds: ["interior.finishes.paint"],
    frequencyType: "interval",
    frequencyValue: 2555,
    frequencyUnit: "days",
    difficulty: "hard",
    estimatedTimeMinutes: 4800,
    diyCost: { low: 200, high: 600 },
    proCost: { low: 2000, high: 6000 },
    shortDescription: "Full interior repaint including prep, primer, and two coats for a refreshed look.",
    detailedInstructions:
      "1. Move furniture to the center of rooms and cover with drop cloths.\n" +
      "2. Clean walls to remove dust, cobwebs, and grease (TSP solution for kitchens).\n" +
      "3. Fill all holes, cracks, and dings with spackle; sand smooth when dry.\n" +
      "4. Apply painter's tape to trim, ceiling edges, and fixtures.\n" +
      "5. Prime any patched areas and stained spots.\n" +
      "6. Apply first coat with roller (W-pattern) and brush for cutting in.\n" +
      "7. Allow proper dry time, then apply second coat.\n" +
      "8. Remove tape while final coat is still slightly tacky for clean lines.",
    whyItMatters: "Fresh paint is the single highest-ROI home improvement. A full repaint returns 100–200% of its cost at resale and protects drywall from moisture and damage.",
    whatHappensIfSkipped: "Paint fades, yellows, and chips over time. Unprotected drywall absorbs moisture, leading to staining and mold. A home with worn paint can lose $5,000–$15,000 in perceived value.",
    toolsNeeded: ["Roller frames and covers", "Brushes (2\" and 3\")", "Painter's tape", "Drop cloths", "Paint trays", "Extension pole", "Stepladder"],
    suppliesNeeded: ["Interior paint (1 gallon per 350 sqft)", "Primer", "Spackle", "220-grit sandpaper", "TSP cleaner"],
    careKitProductIds: [],
    estimatedSavings: "100–200% ROI at resale; protects against $5,000+ in moisture damage",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.backsplash.clean_grout",
    taskName: "Clean Backsplash Grout",
    category: "interior",
    applicableSystemIds: ["interior.backsplash.tile"],
    frequencyType: "interval",
    frequencyValue: 30,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 20,
    diyCost: { low: 3, high: 10 },
    proCost: { low: 100, high: 200 },
    shortDescription: "Scrub backsplash grout to remove cooking grease and prevent mold behind the stove and sink.",
    detailedInstructions:
      "1. Spray grout lines with kitchen degreaser or grout cleaner.\n" +
      "2. Let solution sit for 5 minutes to break down cooking grease.\n" +
      "3. Scrub with a grout brush or old toothbrush.\n" +
      "4. Pay extra attention to grout behind the stove and near the sink.\n" +
      "5. Rinse with a damp cloth and dry.\n" +
      "6. Check for any crumbling or missing grout while cleaning.",
    whyItMatters: "Kitchen backsplash grout collects cooking grease and moisture daily. If not cleaned, grease attracts mold and breaks down grout from the inside.",
    whatHappensIfSkipped: "Grease-saturated grout turns black, crumbles, and allows moisture behind the backsplash. Regrout costs $200–$500; if moisture reaches drywall, repair can cost $1,000+.",
    toolsNeeded: ["Grout brush or old toothbrush"],
    suppliesNeeded: ["Kitchen degreaser or grout cleaner"],
    careKitProductIds: ["grout_cleaner", "grout_brush"],
    estimatedSavings: "Prevents $200–$1,000 in grout repair and moisture damage",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.backsplash.reseal",
    taskName: "Reseal Backsplash Grout",
    category: "interior",
    applicableSystemIds: ["interior.backsplash.tile"],
    frequencyType: "interval",
    frequencyValue: 912,
    frequencyUnit: "days",
    difficulty: "moderate",
    estimatedTimeMinutes: 45,
    diyCost: { low: 10, high: 25 },
    proCost: { low: 150, high: 300 },
    shortDescription: "Apply grout sealer to backsplash to protect against grease and moisture penetration.",
    detailedInstructions:
      "1. Clean grout thoroughly and let dry for 24 hours.\n" +
      "2. Apply grout sealer using a small applicator bottle or brush.\n" +
      "3. Work in small sections, wiping excess off tile faces within 5 minutes.\n" +
      "4. Apply a second coat after the first dries.\n" +
      "5. Allow 24 hours to cure before exposing to water or cooking splatter.\n" +
      "6. Test seal effectiveness by dropping water on grout — it should bead.",
    whyItMatters: "Sealed grout resists grease and moisture absorption, keeping your backsplash looking clean longer and preventing behind-tile moisture damage.",
    whatHappensIfSkipped: "Unsealed grout absorbs cooking grease and water, promoting mold growth and grout deterioration. Failed grout allows moisture behind tiles, potentially causing drywall damage ($500–$2,000).",
    toolsNeeded: ["Grout sealer applicator", "Clean cloths"],
    suppliesNeeded: ["Grout sealer"],
    careKitProductIds: ["grout_sealer"],
    estimatedSavings: "$10–25 sealer prevents $500–$2,000 in moisture damage",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.shower_tile.clean_grout",
    taskName: "Clean Shower Grout",
    category: "interior",
    applicableSystemIds: ["interior.bathroom.shower_tile"],
    frequencyType: "interval",
    frequencyValue: 14,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 7, reason: "Florida humidity dramatically accelerates mold and mildew growth in shower grout" },
    ],
    difficulty: "easy",
    estimatedTimeMinutes: 20,
    diyCost: { low: 3, high: 10 },
    proCost: { low: 100, high: 200 },
    shortDescription: "Scrub shower grout to prevent mold/mildew that breaks down grout and causes water intrusion.",
    detailedInstructions:
      "1. Spray shower grout with bathroom mold/mildew cleaner.\n" +
      "2. Let cleaner sit for 10 minutes (ventilate the bathroom well).\n" +
      "3. Scrub grout lines with a stiff brush, focusing on corners and floor joints.\n" +
      "4. Pay special attention to the grout line where the wall meets the shower pan/tub.\n" +
      "5. Rinse thoroughly with the shower head.\n" +
      "6. Squeegee walls after every shower to slow mold growth between cleanings.\n" +
      "7. Run the exhaust fan for 20 minutes after showering.",
    whyItMatters: "Shower grout is the first line of defense against water reaching the wall cavity behind your shower. Mold weakens grout, creating pathways for water damage.",
    whatHappensIfSkipped: "Mold penetrates deep into grout, which crumbles and allows water behind the tiles. Hidden water damage behind shower walls is one of the most expensive home repairs: $3,000–$10,000 for full shower rebuild.",
    toolsNeeded: ["Grout brush", "Squeegee"],
    suppliesNeeded: ["Bathroom mold/mildew cleaner"],
    careKitProductIds: ["grout_cleaner", "grout_brush", "shower_squeegee"],
    estimatedSavings: "Prevents $3,000–$10,000 shower rebuild from water damage",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.shower_tile.reseal_grout",
    taskName: "Reseal Shower Grout",
    category: "interior",
    applicableSystemIds: ["interior.bathroom.shower_tile"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 270, reason: "Constant moisture exposure in humid climates breaks down grout sealer faster" },
    ],
    difficulty: "moderate",
    estimatedTimeMinutes: 60,
    diyCost: { low: 15, high: 35 },
    proCost: { low: 200, high: 400 },
    shortDescription: "Apply penetrating sealer to shower grout to maintain the water barrier between tiles.",
    detailedInstructions:
      "1. Clean all grout thoroughly and allow to dry completely (24+ hours — no showers).\n" +
      "2. Apply penetrating grout sealer with an applicator bottle or small brush.\n" +
      "3. Cover all grout lines including floor, walls, and corners.\n" +
      "4. Wipe excess sealer off tile faces within 5 minutes.\n" +
      "5. Apply a second coat after first coat dries.\n" +
      "6. Allow 48-hour cure before using the shower.\n" +
      "7. Test by splashing water on grout — it should bead, not absorb.",
    whyItMatters: "Shower grout takes more water abuse than any other grout in the house. Annual resealing is essential to prevent water from passing through grout joints into the wall cavity.",
    whatHappensIfSkipped: "Water passes through unsealed grout into the wall sheathing and framing. Over time, this causes mold, rot, and structural damage. Full shower tear-out and rebuild: $5,000–$12,000.",
    toolsNeeded: ["Sealer applicator bottle", "Clean rags", "Gloves"],
    suppliesNeeded: ["Penetrating grout sealer"],
    careKitProductIds: ["grout_sealer"],
    estimatedSavings: "$15–35 sealer prevents $5,000–$12,000 shower rebuild",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.shower_tile.recaulk",
    taskName: "Recaulk Shower",
    category: "interior",
    applicableSystemIds: ["interior.bathroom.shower_tile"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 270, reason: "Florida heat and humidity break down silicone caulk faster" },
    ],
    difficulty: "easy",
    estimatedTimeMinutes: 60,
    diyCost: { low: 8, high: 20 },
    proCost: { low: 150, high: 300 },
    shortDescription: "Remove old caulk and apply new silicone caulk at all shower joints — CRITICAL for water damage prevention.",
    detailedInstructions:
      "1. Remove old caulk completely using a caulk removal tool and razor blade.\n" +
      "2. Clean the joint with isopropyl alcohol to remove residue and mildew.\n" +
      "3. Let the area dry completely (use a fan to speed up).\n" +
      "4. Apply painter's tape on both sides of the joint for clean lines.\n" +
      "5. Apply 100% silicone caulk (NOT latex or acrylic) in a continuous bead.\n" +
      "6. Smooth the caulk with a wet finger or caulk finishing tool.\n" +
      "7. Remove tape immediately while caulk is still wet.\n" +
      "8. Allow 24 hours to cure before using the shower.",
    whyItMatters: "Caulk joints are the MOST critical waterproofing element in a shower. Every seam where tile meets tub, pan, or another surface relies on caulk — not grout — to keep water out. This is the single most cost-effective maintenance task in your bathroom.",
    whatHappensIfSkipped: "Failed caulk allows water behind tile at every shower use. Within months, this causes mold growth in the wall cavity, rotted framing, and damaged subfloor. Shower/tub surround water damage repairs cost $3,000–$10,000. Insurance often denies these claims as 'deferred maintenance.'",
    toolsNeeded: ["Caulk removal tool", "Razor blade", "Caulk gun", "Painter's tape"],
    suppliesNeeded: ["100% silicone caulk (mildew-resistant)", "Isopropyl alcohol", "Clean rags"],
    careKitProductIds: ["silicone_caulk", "caulk_tool"],
    estimatedSavings: "$8–20 in caulk prevents $3,000–$10,000 water damage — best ROI in home maintenance",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.cabinets.clean",
    taskName: "Clean Cabinets",
    category: "interior",
    applicableSystemIds: ["interior.cabinets.kitchen", "interior.cabinets.bathroom"],
    frequencyType: "interval",
    frequencyValue: 30,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 30,
    diyCost: { low: 0, high: 5 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Clean cabinet exteriors to remove grease buildup that damages finish over time.",
    detailedInstructions:
      "1. Mix warm water with a few drops of dish soap.\n" +
      "2. Wipe cabinet faces and edges with a soft damp cloth.\n" +
      "3. Pay extra attention to cabinets above the stove — grease accumulates heavily here.\n" +
      "4. Clean handles and knobs where hand oils collect.\n" +
      "5. Dry immediately with a clean cloth — standing water damages cabinet finish.\n" +
      "6. For tough grease, use a solution of warm water and white vinegar.",
    whyItMatters: "Cooking grease and hand oils gradually strip cabinet finish. Regular cleaning prevents the sticky buildup that leads to permanent finish damage and the need for refinishing.",
    whatHappensIfSkipped: "Grease buildup becomes sticky and attracts dust, creating a grime layer that eats through finish. Once the finish is compromised, moisture damages the wood. Cabinet refinishing costs $2,000–$5,000; replacement costs $8,000–$25,000.",
    toolsNeeded: ["Soft cloths", "Bucket"],
    suppliesNeeded: ["Dish soap", "White vinegar (for tough grease)"],
    careKitProductIds: [],
    estimatedSavings: "Extends cabinet life 10+ years, delaying $2,000–$5,000 refinishing",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.cabinets.adjust_hinges",
    taskName: "Adjust Cabinet Hinges",
    category: "interior",
    applicableSystemIds: ["interior.cabinets.kitchen", "interior.cabinets.bathroom"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 30,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 75, high: 150 },
    shortDescription: "Adjust cabinet hinges so doors hang straight, close properly, and don't stress the hinge mounting screws.",
    detailedInstructions:
      "1. Open and close every cabinet door, noting any that sag, rub, or don't close flush.\n" +
      "2. Tighten all hinge screws — loose screws are the #1 cause of sagging doors.\n" +
      "3. If screw holes are stripped, remove the screw, fill with a wooden toothpick and wood glue, let dry, and re-drive.\n" +
      "4. Adjust European-style hinges using the three adjustment screws (in/out, up/down, left/right).\n" +
      "5. Check soft-close mechanisms if equipped — replace any that have failed.\n" +
      "6. Lubricate hinges with a drop of silicone spray (not WD-40 which attracts dust).",
    whyItMatters: "Sagging cabinet doors put stress on the mounting screws, which eventually rip out of the wood. A 2-minute adjustment prevents a $200 cabinet door repair.",
    whatHappensIfSkipped: "Sagging doors put increasing stress on screws, eventually stripping the holes. Stripped hinge holes require wood filler and longer screws. Severe cases need new doors ($150–$300 each) or complete cabinet replacement.",
    toolsNeeded: ["Phillips screwdriver", "Drill (optional)"],
    suppliesNeeded: ["Wooden toothpicks", "Wood glue", "Silicone spray lubricant"],
    careKitProductIds: [],
    estimatedSavings: "Prevents $150–$300/door replacement from hinge failure",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.cabinets.inspect",
    taskName: "Inspect Cabinet Structure",
    category: "interior",
    applicableSystemIds: ["interior.cabinets.kitchen", "interior.cabinets.bathroom"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 20,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Inspect cabinet boxes for water damage, delamination, and structural issues inside and underneath.",
    detailedInstructions:
      "1. Open all cabinet doors and look inside for water stains or warping.\n" +
      "2. Check under the kitchen sink for signs of leaks or moisture.\n" +
      "3. Check under the bathroom vanity sink for the same.\n" +
      "4. Feel the cabinet floor near plumbing for softness or swelling.\n" +
      "5. Look at the bottom of cabinets near the floor for any water wicking.\n" +
      "6. Check drawer slides and shelf clips for proper function.",
    whyItMatters: "Cabinet interiors are the first place to show signs of plumbing leaks. Catching a small leak early ($50 repair) prevents thousands in water damage to cabinets, flooring, and subfloor.",
    whatHappensIfSkipped: "A slow sink leak destroys the cabinet floor, which then fails under the weight of stored items. Water spreads to adjacent cabinets and the subfloor underneath. Replacing water-damaged lower kitchen cabinets costs $3,000–$8,000.",
    toolsNeeded: ["Flashlight"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Catches $50 plumbing leaks before they become $3,000–$8,000 cabinet/floor damage",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.vanity.clean",
    taskName: "Clean Bathroom Vanity",
    category: "interior",
    applicableSystemIds: ["interior.bathroom.vanity"],
    frequencyType: "interval",
    frequencyValue: 30,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 15,
    diyCost: { low: 0, high: 3 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Clean vanity top, cabinet, and check for water damage from daily bathroom use.",
    detailedInstructions:
      "1. Wipe vanity top with appropriate cleaner for the material (granite, marble, cultured marble, laminate).\n" +
      "2. Clean around the faucet base where water and soap scum collect.\n" +
      "3. Wipe the cabinet face with a damp cloth and dry immediately.\n" +
      "4. Check for water pooling near the sink edge or backsplash.\n" +
      "5. Open the cabinet and check underneath for drips or moisture.\n" +
      "6. Ensure the P-trap and supply lines show no signs of corrosion or leaks.",
    whyItMatters: "Bathroom vanities receive constant moisture exposure. Regular cleaning and inspection prevents water damage to the cabinet and floor below.",
    whatHappensIfSkipped: "Water seeps under the vanity top, damaging the cabinet structure. Mold grows in the enclosed space. Vanity replacement including plumbing disconnection costs $500–$2,500.",
    toolsNeeded: ["Soft cloths"],
    suppliesNeeded: ["Appropriate surface cleaner"],
    careKitProductIds: [],
    estimatedSavings: "Prevents $500–$2,500 vanity replacement",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.vanity.inspect_moisture",
    taskName: "Inspect Vanity for Moisture Damage",
    category: "interior",
    applicableSystemIds: ["interior.bathroom.vanity"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Deep inspection of vanity cabinet, floor, and surrounding areas for hidden moisture damage.",
    detailedInstructions:
      "1. Remove stored items from under the vanity to fully inspect.\n" +
      "2. Feel the cabinet floor for soft spots, swelling, or delamination.\n" +
      "3. Check all pipe connections for slow drips (place paper towel underneath to test).\n" +
      "4. Look for mold or musty odor inside the cabinet.\n" +
      "5. Check the floor around the vanity base for soft spots or discoloration.\n" +
      "6. Verify the caulk seal between vanity and wall is intact.",
    whyItMatters: "Slow leaks under bathroom vanities are extremely common and often go unnoticed for months. By the time you see damage on the outside, the floor underneath may already be rotted.",
    whatHappensIfSkipped: "Hidden slow leaks destroy the vanity floor, spread to subfloor, and promote mold. Vanity replacement plus subfloor repair plus mold remediation: $2,000–$6,000.",
    toolsNeeded: ["Flashlight", "Paper towels (for drip testing)"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Catches slow leaks early, preventing $2,000–$6,000 in water/mold damage",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.vanity.recaulk",
    taskName: "Recaulk Vanity to Wall",
    category: "interior",
    applicableSystemIds: ["interior.bathroom.vanity"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 30,
    diyCost: { low: 5, high: 12 },
    proCost: { low: 75, high: 150 },
    shortDescription: "Remove old caulk and apply fresh silicone caulk where vanity meets wall to prevent water intrusion.",
    detailedInstructions:
      "1. Remove old caulk with a caulk removal tool.\n" +
      "2. Clean the joint with isopropyl alcohol.\n" +
      "3. Let dry completely.\n" +
      "4. Apply painter's tape for clean lines.\n" +
      "5. Apply silicone caulk in a steady bead.\n" +
      "6. Smooth with a wet finger or caulk tool.\n" +
      "7. Remove tape while caulk is wet.\n" +
      "8. Allow 24 hours to cure.",
    whyItMatters: "The joint between vanity and wall catches splash water daily. Without intact caulk, water runs behind the vanity and down the wall, causing hidden damage.",
    whatHappensIfSkipped: "Water wicks behind the vanity, rotting the wall and floor. This is a common source of bathroom mold. Drywall and floor repair: $1,000–$3,000.",
    toolsNeeded: ["Caulk removal tool", "Caulk gun", "Painter's tape"],
    suppliesNeeded: ["100% silicone caulk", "Isopropyl alcohol"],
    careKitProductIds: ["silicone_caulk"],
    estimatedSavings: "$5–12 caulk prevents $1,000–$3,000 water damage",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.wh_closet.inspect_pan",
    taskName: "Inspect Water Heater Drain Pan",
    category: "interior",
    applicableSystemIds: ["interior.utility.wh_closet"],
    frequencyType: "interval",
    frequencyValue: 180,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 5,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Check that the water heater drain pan is present, undamaged, and has a clear drain line.",
    detailedInstructions:
      "1. Locate the water heater drain pan underneath the unit.\n" +
      "2. Check for standing water in the pan — ANY water means the unit is leaking.\n" +
      "3. Verify the pan drain line runs to the exterior or an appropriate drain.\n" +
      "4. Check the pan for rust, cracks, or corrosion.\n" +
      "5. If no pan is present, install one (required by code for interior installations).\n" +
      "6. Check the temperature and pressure (T&P) relief valve discharge pipe.",
    whyItMatters: "A water heater holds 40–80 gallons. When the tank fails, the drain pan is the only thing preventing catastrophic water damage to your home. Many insurance claims from water heater failures are denied if no drain pan was present.",
    whatHappensIfSkipped: "When the tank inevitably leaks or fails, 40–80 gallons of water (potentially hot) flood the surrounding area. Interior water heaters can cause $5,000–$15,000+ in damage without a functional drain pan and drain line.",
    toolsNeeded: ["Flashlight"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Prevents $5,000–$15,000 catastrophic water damage from tank failure",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.wh_closet.check_drain",
    taskName: "Check Water Heater Drain Line",
    category: "interior",
    applicableSystemIds: ["interior.utility.wh_closet"],
    frequencyType: "interval",
    frequencyValue: 180,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Verify the water heater drain pan line and T&P relief valve discharge are clear and properly routed.",
    detailedInstructions:
      "1. Trace the drain pan line from the pan to where it terminates (should be exterior or floor drain).\n" +
      "2. Pour a small cup of water into the pan to verify the drain line flows freely.\n" +
      "3. Check the T&P relief valve discharge pipe — it should terminate within 6 inches of the floor or route outside.\n" +
      "4. Verify the discharge pipe has no caps, plugs, or restrictions.\n" +
      "5. Check for mineral buildup or corrosion at pipe connections.\n" +
      "6. Verify the shutoff valve on the cold water supply is accessible and functional.",
    whyItMatters: "If the drain pan catches a leak but the drain line is clogged, the pan overflows and the protection is useless. The T&P valve is a critical safety device that must be able to discharge freely.",
    whatHappensIfSkipped: "Clogged drain lines mean the safety pan provides no protection. A blocked T&P discharge creates a potential explosion hazard from over-pressure. Both scenarios can result in $5,000–$15,000+ damage.",
    toolsNeeded: ["Flashlight", "Small cup of water"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Ensures $0 cost safety systems work when needed, preventing $5,000–$15,000 damage",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.attic_access.inspect",
    taskName: "Inspect Attic Access",
    category: "interior",
    applicableSystemIds: ["interior.utility.attic_access"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Check attic access panel/hatch for proper seal, insulation, and weather stripping.",
    detailedInstructions:
      "1. Locate all attic access points (hallway, garage, closet).\n" +
      "2. Check that the access panel sits flush and isn't warped.\n" +
      "3. Verify weather stripping around the frame is intact.\n" +
      "4. Check for air leaks — hold a piece of tissue near the edges; movement indicates leaks.\n" +
      "5. Verify the panel has insulation attached to the attic-side face.\n" +
      "6. Open the access and do a quick visual of the attic space above.",
    whyItMatters: "An unsealed attic access is one of the biggest sources of energy loss in a home. Conditioned air escaping to the attic increases your HVAC costs by 10–20%.",
    whatHappensIfSkipped: "Conditioned air leaks into the attic, raising energy costs $200–$500/year. In humid climates, warm moist air entering the attic causes condensation on roof sheathing, promoting mold and wood rot.",
    toolsNeeded: ["Flashlight", "Tissue paper (for air leak test)"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Saves $200–$500/year in energy costs when properly sealed",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.attic_access.insulate",
    taskName: "Check Attic Access Insulation",
    category: "interior",
    applicableSystemIds: ["interior.utility.attic_access"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 15,
    diyCost: { low: 10, high: 30 },
    proCost: { low: 75, high: 150 },
    shortDescription: "Ensure attic access panel has adequate insulation and a tight seal to prevent energy loss.",
    detailedInstructions:
      "1. Remove the attic access panel and check for insulation on the attic side.\n" +
      "2. Insulation should match the R-value of the surrounding ceiling (R-30 to R-60).\n" +
      "3. If uninsulated, cut rigid foam board to fit and glue to the panel's attic side.\n" +
      "4. Add or replace weather stripping around the frame opening.\n" +
      "5. For pull-down stairs, install an insulated attic stair cover box.\n" +
      "6. Verify the panel seats tightly when closed.",
    whyItMatters: "An uninsulated attic access is a thermal hole in your ceiling. Even with R-38 in the rest of the attic, an uninsulated access negates the benefit in the surrounding area.",
    whatHappensIfSkipped: "Energy loss of $200–$500/year through the thermal bridge. In humid climates, condensation can form on the uninsulated panel, dripping onto the ceiling below and causing water stains or mold.",
    toolsNeeded: ["Utility knife", "Measuring tape"],
    suppliesNeeded: ["Rigid foam insulation board", "Construction adhesive", "Weather stripping"],
    careKitProductIds: [],
    estimatedSavings: "$10–30 insulation saves $200–$500/year in energy costs",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.gas_fireplace.inspect",
    taskName: "Gas Fireplace Inspection",
    category: "interior",
    applicableSystemIds: ["interior.fireplace.gas"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    seasonalMonths: [9, 10],
    difficulty: "professional",
    estimatedTimeMinutes: 60,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 150, high: 300 },
    shortDescription: "Professional inspection of gas fireplace for safe operation before heating season.",
    detailedInstructions:
      "1. Schedule a certified gas fireplace technician for pre-season inspection.\n" +
      "2. Technician checks gas valve operation and leak tests all connections.\n" +
      "3. Inspect burner assembly for corrosion, blockages, or damage.\n" +
      "4. Check pilot assembly and thermocouple/thermopile function.\n" +
      "5. Inspect venting system for blockages, corrosion, or improper connections.\n" +
      "6. Test carbon monoxide levels during operation.\n" +
      "7. Verify remote/wall switch controls function properly.",
    whyItMatters: "Gas fireplace malfunctions can cause carbon monoxide poisoning and house fires. Annual professional inspection is essential for safe operation.",
    whatHappensIfSkipped: "Gas leaks, cracked heat exchangers, or blocked vents can produce carbon monoxide — a colorless, odorless gas that kills over 400 Americans yearly. A cracked firebox can also start a house fire.",
    toolsNeeded: [],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "$150–300 inspection prevents potential gas leak disasters and ensures safe heating",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.gas_fireplace.clean_glass",
    taskName: "Clean Fireplace Glass",
    category: "interior",
    applicableSystemIds: ["interior.fireplace.gas"],
    frequencyType: "condition_based",
    frequencyValue: 90,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 15,
    diyCost: { low: 5, high: 10 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Clean fireplace glass panel to remove white film and soot for clear viewing.",
    detailedInstructions:
      "1. Ensure the fireplace is completely cool (off for at least 3 hours).\n" +
      "2. Open or remove the glass panel per manufacturer instructions.\n" +
      "3. Apply fireplace glass cleaner (NOT regular glass cleaner — it will streak and damage).\n" +
      "4. Wipe with a soft cloth or paper towel.\n" +
      "5. For stubborn white film, use a razor blade at 45° angle gently.\n" +
      "6. Reinstall the glass panel securely.\n" +
      "7. Check the gasket around the glass while it's removed.",
    whyItMatters: "Clean glass allows you to see the flames clearly and spot any irregular flame patterns that indicate burner problems.",
    whatHappensIfSkipped: "Buildup on the glass is cosmetic, but it obscures your view of the burner — you won't notice irregular flames that indicate potential safety issues. Heavy buildup can also permanently etch the glass ($200–$500 to replace).",
    toolsNeeded: ["Soft cloths"],
    suppliesNeeded: ["Fireplace glass cleaner"],
    careKitProductIds: [],
    estimatedSavings: "Prevents $200–$500 glass replacement from permanent etching",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.interior.gas_fireplace.annual_service",
    taskName: "Annual Fireplace Service",
    category: "interior",
    applicableSystemIds: ["interior.fireplace.gas"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    seasonalMonths: [9, 10],
    difficulty: "professional",
    estimatedTimeMinutes: 90,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 200, high: 400 },
    shortDescription: "Full professional service including cleaning, adjustment, and safety testing of the gas fireplace.",
    detailedInstructions:
      "1. Schedule certified technician before heating season.\n" +
      "2. Technician removes logs/media and cleans the burner assembly.\n" +
      "3. Clean and adjust pilot assembly.\n" +
      "4. Check and clean thermocouple and thermopile.\n" +
      "5. Test gas pressure at the valve and manifold.\n" +
      "6. Clean the glass and check gaskets.\n" +
      "7. Reassemble and test full operation.\n" +
      "8. Provide service report with findings.",
    whyItMatters: "Annual service ensures safe, efficient operation and catches developing problems before they become dangerous or costly during the season you need heat most.",
    whatHappensIfSkipped: "Dirty burners produce more soot and carbon monoxide. Failed thermocouples cause the fireplace to stop working when you need it. Neglected gas fireplaces are a leading cause of residential gas-related incidents.",
    toolsNeeded: [],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Extends fireplace life and prevents $500–$2,000 emergency repairs during heating season",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
];

// ============================================================
// APPLIANCE TASKS (21 entries)
// ============================================================

const APPLIANCE_TASKS: TaskCatalogEntry[] = [
  {
    taskId: "task.appliance.fridge.clean_coils",
    taskName: "Clean Refrigerator Coils",
    category: "appliance",
    applicableSystemIds: ["appliance.refrigerator"],
    frequencyType: "interval",
    frequencyValue: 180,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 120, reason: "Florida heat makes the compressor work harder; clean coils are critical for efficiency in warm climates" },
    ],
    difficulty: "easy",
    estimatedTimeMinutes: 20,
    diyCost: { low: 0, high: 5 },
    proCost: { low: 80, high: 150 },
    shortDescription: "Vacuum refrigerator condenser coils to restore cooling efficiency — saves 15–25% on energy.",
    detailedInstructions:
      "1. Unplug the refrigerator or turn off the breaker.\n" +
      "2. Locate condenser coils — either behind (pull fridge out) or underneath (remove kick plate).\n" +
      "3. Vacuum coils with a brush attachment, removing dust, pet hair, and debris.\n" +
      "4. Use a coil cleaning brush to reach between tight coil fins.\n" +
      "5. Vacuum any debris that fell on the floor.\n" +
      "6. Replace the kick plate or push the fridge back (leave 1\" gap from wall for airflow).\n" +
      "7. Restore power.",
    whyItMatters: "Dirty condenser coils force the compressor to work 15–25% harder to maintain temperature. This wastes electricity and dramatically shortens compressor life (the most expensive component).",
    whatHappensIfSkipped: "Compressor runs constantly, raising energy bills $50–$150/year. Overworked compressor fails 3–5 years early. Compressor replacement: $500–$1,200. Often cheaper to replace the entire fridge at that point.",
    toolsNeeded: ["Vacuum with brush attachment", "Coil cleaning brush"],
    suppliesNeeded: [],
    careKitProductIds: ["coil_brush"],
    estimatedSavings: "Saves $50–$150/year in energy + extends compressor life 3–5 years ($500–$1,200 value)",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.appliance.fridge.replace_water_filter",
    taskName: "Replace Refrigerator Water Filter",
    category: "appliance",
    applicableSystemIds: ["appliance.refrigerator"],
    frequencyType: "interval",
    frequencyValue: 180,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 5,
    diyCost: { low: 20, high: 50 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Replace the built-in water filter to maintain clean drinking water and ice quality.",
    detailedInstructions:
      "1. Locate the water filter (usually inside the fridge, in the base grille, or in the back).\n" +
      "2. Turn off the water supply to the fridge (optional but reduces mess).\n" +
      "3. Remove the old filter by twisting or pushing the release button.\n" +
      "4. Remove the cap from the new filter and transfer it from the old filter if applicable.\n" +
      "5. Insert the new filter and lock into place.\n" +
      "6. Run 2–3 gallons of water through the dispenser to flush carbon fines.\n" +
      "7. Reset the filter indicator light per your model's instructions.",
    whyItMatters: "Water filters have a limited capacity. Once exhausted, they no longer remove contaminants and can actually release trapped particles back into your water.",
    whatHappensIfSkipped: "Exhausted filters grow bacteria and release accumulated contaminants. Water tastes and smells bad. Reduced flow can damage the water inlet valve ($80–$200 repair).",
    toolsNeeded: [],
    suppliesNeeded: ["Replacement water filter (model-specific)"],
    careKitProductIds: ["fridge_water_filter"],
    estimatedSavings: "$20–50 filter prevents $80–$200 inlet valve damage and maintains water quality",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.appliance.fridge.check_seals",
    taskName: "Check Refrigerator Door Seals",
    category: "appliance",
    applicableSystemIds: ["appliance.refrigerator"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Test door gaskets with the dollar bill test to ensure a proper seal — failed seals waste energy.",
    detailedInstructions:
      "1. Close a dollar bill in the door so half is inside and half is outside.\n" +
      "2. Try to pull the bill out — you should feel resistance. If it slides out easily, the seal is failing.\n" +
      "3. Test at multiple points around each door (top, bottom, sides, corners).\n" +
      "4. Check both fresh food and freezer doors.\n" +
      "5. Inspect gaskets visually for cracks, tears, or deformation.\n" +
      "6. Clean gaskets with warm soapy water — grime prevents proper sealing.\n" +
      "7. If seals fail the test, order replacement gaskets for your model.",
    whyItMatters: "A failed door seal lets warm air in constantly, forcing the compressor to run more. This wastes $50–$100/year in electricity and shortens compressor life.",
    whatHappensIfSkipped: "The compressor works overtime to compensate for warm air infiltration. Energy bills increase $50–$100/year. Excess moisture from leaking seals causes ice buildup and can damage the evaporator. Gasket replacement: $50–$150 DIY.",
    toolsNeeded: ["Dollar bill"],
    suppliesNeeded: ["Warm soapy water for cleaning"],
    careKitProductIds: [],
    estimatedSavings: "$50–$100/year in energy savings; extends compressor life",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.appliance.dishwasher.clean_filter",
    taskName: "Clean Dishwasher Filter",
    category: "appliance",
    applicableSystemIds: ["appliance.dishwasher"],
    frequencyType: "interval",
    frequencyValue: 30,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Clean the dishwasher filter — the #1 missed maintenance task. Dirty filters cause odors and poor cleaning.",
    detailedInstructions:
      "1. Remove the bottom rack to access the filter assembly (usually near the center or back).\n" +
      "2. Twist and lift out the cylindrical filter and flat mesh filter underneath.\n" +
      "3. Rinse both pieces under running water.\n" +
      "4. Use a soft brush (old toothbrush) to scrub away trapped food and grease.\n" +
      "5. Check the sump area under the filter for debris — remove anything you find.\n" +
      "6. Reassemble the filter (make sure it locks into place).\n" +
      "7. Run an empty cycle with a dishwasher cleaner tablet monthly.",
    whyItMatters: "Modern dishwashers have manual-clean filters (older models had self-cleaning grinders). A clogged filter recirculates dirty water over your dishes and breeds bacteria that causes the 'dishwasher smell.'",
    whatHappensIfSkipped: "Dishes come out dirty or with a film. Foul odor develops. Food buildup clogs the drain pump ($150–$250 repair). Bacteria from the filter contaminates every wash load.",
    toolsNeeded: ["Soft brush or old toothbrush"],
    suppliesNeeded: ["Dishwasher cleaner tablets (optional)"],
    careKitProductIds: ["dishwasher_cleaner"],
    estimatedSavings: "Prevents $150–$250 drain pump repairs and extends dishwasher life 2–3 years",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.appliance.dishwasher.clean_spray_arms",
    taskName: "Clean Dishwasher Spray Arms",
    category: "appliance",
    applicableSystemIds: ["appliance.dishwasher"],
    frequencyType: "interval",
    frequencyValue: 90,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 15,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Clear clogged spray arm holes to restore proper water distribution and cleaning performance.",
    detailedInstructions:
      "1. Remove the upper and lower spray arms (usually twist or pull to release).\n" +
      "2. Hold arms under running water and shake out trapped debris.\n" +
      "3. Use a toothpick or thin wire to clear each spray hole.\n" +
      "4. Check for mineral buildup (white crusty deposits) and soak in vinegar if needed.\n" +
      "5. Rinse thoroughly and reinstall.\n" +
      "6. Verify arms spin freely after reinstalling.",
    whyItMatters: "Clogged spray holes mean uneven water distribution — some areas get blasted while others barely get wet. This is the most common cause of 'my dishwasher doesn't clean well.'",
    whatHappensIfSkipped: "Uneven cleaning leads to rewashing dishes by hand, wasting water and time. Hard water deposits eventually crack spray arm plastic, requiring replacement ($30–$80 per arm).",
    toolsNeeded: ["Toothpick or thin wire"],
    suppliesNeeded: ["White vinegar (for mineral buildup)"],
    careKitProductIds: [],
    estimatedSavings: "Restores cleaning performance; prevents $30–$80 spray arm replacement",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.appliance.dishwasher.inspect_hoses",
    taskName: "Inspect Dishwasher Hoses",
    category: "appliance",
    applicableSystemIds: ["appliance.dishwasher"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Check dishwasher supply and drain hoses for wear, kinks, and potential leak points.",
    detailedInstructions:
      "1. Turn off dishwasher and pull it forward slightly to access the hoses (may need to remove kick plate).\n" +
      "2. Inspect the water supply hose for bulges, cracks, or kinks.\n" +
      "3. Check the drain hose for clogs, kinks, or loose connections.\n" +
      "4. Look for moisture or water stains on the floor underneath.\n" +
      "5. Verify the high drain loop (hose should loop up to the underside of the counter) to prevent backflow.\n" +
      "6. Tighten any loose clamps or connections.",
    whyItMatters: "Dishwasher hose failures cause sudden flooding in the kitchen. A $10 hose replacement prevents thousands in water damage to cabinets and flooring.",
    whatHappensIfSkipped: "Old hoses crack and burst, flooding the kitchen. Water damages cabinets, subfloor, and can reach adjacent rooms. Average water damage claim from appliance hose failure: $3,000–$8,000.",
    toolsNeeded: ["Flashlight", "Adjustable pliers"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "$10 hose replacement prevents $3,000–$8,000 water damage",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.appliance.washer.clean_drum",
    taskName: "Clean Washing Machine Drum",
    category: "appliance",
    applicableSystemIds: ["appliance.washer"],
    frequencyType: "interval",
    frequencyValue: 30,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 21, reason: "Florida humidity accelerates mold and mildew growth inside washer drums, especially front-loaders" },
    ],
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCost: { low: 2, high: 8 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Run a cleaning cycle to prevent mold, mildew, and odor buildup inside the washing machine.",
    detailedInstructions:
      "1. Remove any clothes from the drum.\n" +
      "2. Add a washing machine cleaning tablet or 2 cups of white vinegar to the drum.\n" +
      "3. Run the hottest/longest cycle available (many machines have a 'Clean Washer' cycle).\n" +
      "4. After the cycle, wipe the door gasket/seal with a dry cloth (front-loaders).\n" +
      "5. Leave the door open after every wash to air dry the drum.\n" +
      "6. Wipe the detergent dispenser drawer clean.\n" +
      "7. For front-loaders, check and clean the door boot gasket folds where mold hides.",
    whyItMatters: "Washing machines are dark, damp environments — perfect for mold and bacteria. Without regular cleaning, every wash transfers mold spores to your clothes.",
    whatHappensIfSkipped: "Mold grows in the drum and door gasket (front-loaders are especially prone). Clothes smell musty after washing. Severe mold in the gasket requires replacement ($150–$300 part + labor).",
    toolsNeeded: ["Clean cloths"],
    suppliesNeeded: ["Washing machine cleaner tablets or white vinegar"],
    careKitProductIds: ["washer_cleaner"],
    estimatedSavings: "Prevents $150–$300 gasket replacement and maintains clothes freshness",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.appliance.washer.clean_filter",
    taskName: "Clean Washer Lint/Drain Filter",
    category: "appliance",
    applicableSystemIds: ["appliance.washer"],
    frequencyType: "interval",
    frequencyValue: 30,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Clean the washer drain pump filter to prevent clogs, flooding, and error codes.",
    detailedInstructions:
      "1. Locate the drain pump filter (front-loaders: behind small door panel at bottom front).\n" +
      "2. Place towels and a shallow pan under the filter access door.\n" +
      "3. Open the access door and pull out the drain hose (if present) — drain residual water into the pan.\n" +
      "4. Slowly unscrew the filter cap — water will flow out.\n" +
      "5. Remove trapped lint, coins, hair ties, and debris from the filter.\n" +
      "6. Check the filter housing cavity for debris.\n" +
      "7. Reinstall the filter, tighten securely, and close the access door.",
    whyItMatters: "A clogged drain filter prevents the washer from draining properly, triggers error codes, and forces the drain pump to overwork. It's the #1 cause of 'my washer won't drain' service calls.",
    whatHappensIfSkipped: "Washer fails to drain, leaving clothes in standing water. The drain pump burns out ($150–$300 repair). Overflowing water damages the laundry room floor.",
    toolsNeeded: ["Towels", "Shallow pan"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Prevents $150–$300 drain pump replacement",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.appliance.washer.inspect_hoses",
    taskName: "Inspect Washer Supply Hoses",
    category: "appliance",
    applicableSystemIds: ["appliance.washer"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCost: { low: 0, high: 20 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Inspect hot and cold supply hoses for bulging, cracking, or corrosion — burst hoses cause $5,000+ damage.",
    detailedInstructions:
      "1. Pull the washer forward enough to see the supply hose connections.\n" +
      "2. Inspect both hot and cold supply hoses their full length.\n" +
      "3. Look for: bulges, blisters, cracks, kinks, or corrosion at the connections.\n" +
      "4. Feel hoses for soft spots or stiffness.\n" +
      "5. Check that connections are hand-tight plus 1/4 turn with pliers.\n" +
      "6. If hoses are rubber (not braided stainless), replace every 3–5 years regardless of appearance.\n" +
      "7. Turn off supply valves when leaving for vacation.",
    whyItMatters: "Washing machine hose failure is the #1 cause of residential water damage claims. A burst hose can discharge 500+ gallons per hour. Insurance companies report the average claim at $5,000–$10,000.",
    whatHappensIfSkipped: "A burst supply hose while you're at work or on vacation can flood your entire home. Average damage: $5,000–$10,000. Some claims exceed $50,000 for multi-story homes. Braided stainless steel hoses cost $15–25 and last 8–10 years.",
    toolsNeeded: ["Flashlight", "Adjustable pliers"],
    suppliesNeeded: ["Braided stainless steel hoses (if replacement needed, $15–25)"],
    careKitProductIds: ["braided_washer_hoses"],
    estimatedSavings: "$15–25 hoses prevent $5,000–$10,000+ average water damage claim",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.appliance.dryer.clean_lint_trap",
    taskName: "Deep Clean Dryer Lint Trap",
    category: "appliance",
    applicableSystemIds: ["appliance.dryer"],
    frequencyType: "interval",
    frequencyValue: 90,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 15,
    diyCost: { low: 0, high: 5 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Deep clean the lint trap and housing beyond daily lint removal to restore airflow and prevent fires.",
    detailedInstructions:
      "1. Remove the lint screen and peel off visible lint (you should do this before every load).\n" +
      "2. Wash the screen with hot soapy water to remove dryer sheet residue that blocks airflow.\n" +
      "3. Rinse and let dry completely before reinserting.\n" +
      "4. Use a lint trap brush to clean deep inside the lint trap housing.\n" +
      "5. Vacuum the lint trap slot with a crevice attachment.\n" +
      "6. Run the dryer on air-only for 5 minutes to blow out loosened debris.",
    whyItMatters: "Dryer sheet residue creates an invisible film on the lint screen that blocks airflow even when it looks clean. This film is a major contributor to dryer fires.",
    whatHappensIfSkipped: "Restricted airflow causes the dryer to overheat. Per NFPA, failure to clean dryers causes 34% of the 2,900 home dryer fires reported annually. Overheating also damages clothes and burns out the heating element ($100–$300 repair).",
    toolsNeeded: ["Lint trap cleaning brush", "Vacuum with crevice attachment"],
    suppliesNeeded: ["Dish soap"],
    careKitProductIds: ["lint_trap_brush"],
    estimatedSavings: "Fire prevention + saves $100–$300 in heating element repairs",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.appliance.dryer.clean_vent_duct",
    taskName: "Clean Dryer Vent Duct",
    category: "appliance",
    applicableSystemIds: ["appliance.dryer"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "moderate",
    estimatedTimeMinutes: 60,
    diyCost: { low: 15, high: 30 },
    proCost: { low: 100, high: 200 },
    shortDescription: "Clean the entire dryer vent duct from dryer to exterior — CRITICAL FIRE PREVENTION task.",
    detailedInstructions:
      "1. Unplug the dryer (or turn off gas valve for gas dryers).\n" +
      "2. Pull the dryer away from the wall and disconnect the vent hose from the dryer.\n" +
      "3. Insert a dryer vent cleaning brush kit into the duct and push through to the exterior.\n" +
      "4. Rotate the brush while pushing and pulling to dislodge lint buildup.\n" +
      "5. Go outside and clean from the exterior vent opening inward.\n" +
      "6. Verify the exterior vent flap opens and closes freely.\n" +
      "7. Reconnect the vent hose and push dryer back (don't crush the hose).\n" +
      "8. Run the dryer on air-only for 10 minutes and check airflow at the exterior vent.",
    whyItMatters: "Lint is highly flammable. The NFPA reports 2,900 home dryer fires annually, causing $35 million in property damage. Failure to clean the dryer vent is the leading cause. This is one of the most important maintenance tasks in your home.",
    whatHappensIfSkipped: "Lint accumulation in the vent duct is the #1 cause of dryer fires (2,900/year per NFPA). Beyond fire risk, a clogged vent doubles drying time, wastes $100–$200/year in energy, and burns out the heating element prematurely.",
    toolsNeeded: ["Dryer vent cleaning brush kit", "Vacuum", "Screwdriver"],
    suppliesNeeded: [],
    careKitProductIds: ["dryer_vent_brush_kit"],
    estimatedSavings: "Prevents dryer fires (avg $35M/year in damage nationwide) + saves $100–$200/year in energy",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.appliance.dryer.inspect_exhaust",
    taskName: "Inspect Dryer Exhaust",
    category: "appliance",
    applicableSystemIds: ["appliance.dryer"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Check dryer exhaust vent termination, duct material, and connections for safety compliance.",
    detailedInstructions:
      "1. Go outside and locate the dryer exhaust vent termination.\n" +
      "2. Verify the flap opens when dryer runs and closes when it stops.\n" +
      "3. Check for lint buildup around the exterior vent opening.\n" +
      "4. Verify the duct material is rigid or semi-rigid metal (not plastic or foil accordion).\n" +
      "5. Check all duct connections for gaps or disconnections.\n" +
      "6. Measure the total duct run — should not exceed 25 feet (subtract 5 feet per 90° elbow).",
    whyItMatters: "Improper duct material (vinyl or foil accordion) is a fire hazard. Disconnected ducts vent hot, moist air into the wall cavity causing mold. Stuck vent flaps let pests into the duct.",
    whatHappensIfSkipped: "Vinyl ducts can melt and ignite from dryer heat. Disconnected ducts cause mold in walls ($2,000–$5,000 remediation). Pest nests in vents block airflow and create fire hazards.",
    toolsNeeded: ["Flashlight"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Prevents fire hazards and $2,000–$5,000 mold remediation from duct disconnection",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.appliance.range_gas.clean_burners",
    taskName: "Clean Gas Range Burners",
    category: "appliance",
    applicableSystemIds: ["appliance.range_gas"],
    frequencyType: "interval",
    frequencyValue: 30,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 20,
    diyCost: { low: 0, high: 5 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Clean gas burner caps, grates, and ports for even flame pattern and efficient cooking.",
    detailedInstructions:
      "1. Remove burner grates and caps (ensure stove is cool and off).\n" +
      "2. Soak grates and caps in warm soapy water for 15 minutes.\n" +
      "3. Scrub with a non-abrasive sponge to remove food and grease.\n" +
      "4. Use a toothpick or needle to clear clogged burner ports (the small holes around the burner head).\n" +
      "5. Clean the burner base and igniter area with a damp cloth.\n" +
      "6. Dry all components completely before reassembling.\n" +
      "7. Test each burner — flame should be blue and even around the entire burner.",
    whyItMatters: "Clogged burner ports cause uneven flames, which waste gas and cook unevenly. Yellow or orange flames indicate incomplete combustion, producing excess carbon monoxide.",
    whatHappensIfSkipped: "Clogged ports cause yellow flames (incomplete combustion and higher CO production). Boil-overs corrode the igniter, causing ignition failure ($75–$150 repair). Severe buildup can require burner replacement.",
    toolsNeeded: ["Non-abrasive sponge", "Toothpick or needle"],
    suppliesNeeded: ["Dish soap"],
    careKitProductIds: [],
    estimatedSavings: "Prevents $75–$150 igniter repair and ensures safe, efficient gas combustion",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.appliance.range_gas.check_igniter",
    taskName: "Check Gas Range Igniter Function",
    category: "appliance",
    applicableSystemIds: ["appliance.range_gas"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Test each burner and oven igniter for reliable ignition — failed igniters leak unburned gas.",
    detailedInstructions:
      "1. Turn each burner on individually and count how many clicks until ignition.\n" +
      "2. Ignition should occur within 2–3 clicks. Longer means the igniter needs cleaning or replacement.\n" +
      "3. Turn on the oven and listen for the igniter glow and gas release (should light within 60 seconds).\n" +
      "4. If you smell gas without ignition, turn off immediately and ventilate.\n" +
      "5. Check that the electronic ignition sparks are visible at each burner.\n" +
      "6. Clean igniters with a dry toothbrush if they're slow to light.",
    whyItMatters: "A slow or failed igniter releases unburned gas into your kitchen before ignition. This is both a health hazard and a safety risk.",
    whatHappensIfSkipped: "Failed igniters release gas without burning it, creating explosion risk and carbon monoxide exposure. Igniter replacement is $75–$150 — much cheaper than gas-related emergency.",
    toolsNeeded: ["Dry toothbrush"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Prevents gas safety hazards; $75–$150 igniter replacement vs emergency",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.appliance.range_gas.inspect_gas_line",
    taskName: "Inspect Gas Line Connection",
    category: "appliance",
    applicableSystemIds: ["appliance.range_gas"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "professional",
    estimatedTimeMinutes: 15,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 75, high: 150 },
    shortDescription: "Professional inspection of gas line connection, flex connector, and shutoff valve behind the range.",
    detailedInstructions:
      "1. Have a qualified technician pull the range forward to access the gas connection.\n" +
      "2. Inspect the flex connector for kinks, corrosion, or damage.\n" +
      "3. Apply leak detection solution (soapy water) to all connections.\n" +
      "4. Bubbles indicate a gas leak — tighten or replace the connection.\n" +
      "5. Verify the shutoff valve behind the range turns freely.\n" +
      "6. Check the flex connector age — replace if older than 10 years or if it's an uncoated brass connector (recalled).",
    whyItMatters: "Gas leaks cause explosions and carbon monoxide poisoning. The connection behind the range is often the most neglected gas connection in the home because it's hidden.",
    whatHappensIfSkipped: "Slow gas leaks can go undetected for months. Old brass flex connectors crack without warning. Gas line failures have caused house explosions. Annual inspection is the only way to catch developing problems.",
    toolsNeeded: [],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "$75–150 inspection prevents potentially catastrophic gas leak",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.appliance.range_electric.clean_elements",
    taskName: "Clean Electric Range Elements",
    category: "appliance",
    applicableSystemIds: ["appliance.range_electric"],
    frequencyType: "interval",
    frequencyValue: 90,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 20,
    diyCost: { low: 0, high: 5 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Clean electric coils or smooth-top surface for efficient heat transfer and safe operation.",
    detailedInstructions:
      "1. Ensure the range is completely cool and turned off.\n" +
      "2. For coil elements: lift or remove coils, clean the drip pans with warm soapy water or replace if heavily burned.\n" +
      "3. Wipe the area under the elements with a damp cloth.\n" +
      "4. For smooth-top: apply ceramic cooktop cleaner and scrub with the designated pad.\n" +
      "5. Use a razor blade scraper at 45° to remove burned-on spills from glass tops.\n" +
      "6. Clean the oven interior if visible spills have occurred.",
    whyItMatters: "Burned-on spills reduce heat transfer efficiency and can damage smooth-top surfaces permanently. Clean elements heat evenly and use less energy.",
    whatHappensIfSkipped: "Burned-on food carbonizes and becomes impossible to remove. On smooth-tops, burned sugar fuses to the glass and causes permanent pitting ($300–$800 glass top replacement). Dirty coils waste energy.",
    toolsNeeded: ["Sponge", "Razor blade scraper (for smooth-top)"],
    suppliesNeeded: ["Dish soap", "Ceramic cooktop cleaner (for smooth-top)", "Replacement drip pans (optional)"],
    careKitProductIds: ["cooktop_cleaner"],
    estimatedSavings: "Prevents $300–$800 glass-top replacement; maintains energy efficiency",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.appliance.range_electric.inspect",
    taskName: "Inspect Electric Range",
    category: "appliance",
    applicableSystemIds: ["appliance.range_electric"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Inspect electric range for element failures, oven accuracy, and electrical safety.",
    detailedInstructions:
      "1. Turn on each burner and verify it heats evenly (no cold spots or partial heating).\n" +
      "2. Check coil element connections — they should plug in snugly with no arcing or sparking.\n" +
      "3. Test the oven with an oven thermometer — set to 350°F and compare readings.\n" +
      "4. Check the oven door seal for gaps or damage.\n" +
      "5. Verify all control knobs turn smoothly and accurately.\n" +
      "6. Check the power cord and outlet for burn marks or loose connection.",
    whyItMatters: "A failing element can arc and spark at the connection, potentially causing a fire. Inaccurate oven temperature wastes energy and ruins food.",
    whatHappensIfSkipped: "Arcing element connections can ignite surrounding material. Damaged oven seals waste energy and cause uneven cooking. Element replacement: $20–$80 DIY; ignoring arcing can cause a fire.",
    toolsNeeded: ["Oven thermometer", "Flashlight"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Prevents fire hazard from arcing; $20–$80 element replacement",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.appliance.range_hood.clean_filter",
    taskName: "Clean Range Hood Filter",
    category: "appliance",
    applicableSystemIds: ["appliance.range_hood"],
    frequencyType: "interval",
    frequencyValue: 30,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 15,
    diyCost: { low: 0, high: 3 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Clean the range hood grease filter to maintain ventilation and prevent grease fire risk.",
    detailedInstructions:
      "1. Remove the grease filter(s) from the hood (usually slide or snap out).\n" +
      "2. Soak in hot water with dish soap and baking soda for 15 minutes.\n" +
      "3. Scrub with a brush to remove grease buildup.\n" +
      "4. Rinse thoroughly and let dry completely.\n" +
      "5. If filters are aluminum mesh, you can also run them through the dishwasher.\n" +
      "6. Wipe the hood interior and exterior while filters are out.\n" +
      "7. Reinstall dry filters.",
    whyItMatters: "A grease-saturated filter doesn't filter anything and becomes a fire hazard. It also reduces airflow, allowing cooking grease to coat your kitchen surfaces and cabinets.",
    whatHappensIfSkipped: "Grease-saturated filters are a fire hazard above the stove. Reduced airflow causes grease to coat kitchen cabinets and ceiling. Kitchen grease damage and cabinet refinishing: $2,000–$5,000.",
    toolsNeeded: ["Brush"],
    suppliesNeeded: ["Dish soap", "Baking soda"],
    careKitProductIds: [],
    estimatedSavings: "Fire prevention + prevents $2,000–$5,000 kitchen grease damage",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.appliance.range_hood.clean_duct",
    taskName: "Clean Range Hood Duct",
    category: "appliance",
    applicableSystemIds: ["appliance.range_hood"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "moderate",
    estimatedTimeMinutes: 45,
    diyCost: { low: 10, high: 25 },
    proCost: { low: 150, high: 300 },
    shortDescription: "Clean the range hood exhaust duct to remove accumulated grease that creates a fire hazard.",
    detailedInstructions:
      "1. Turn off the range hood and disconnect power.\n" +
      "2. Remove the grease filter and any accessible duct sections.\n" +
      "3. Apply degreaser to the interior of accessible duct surfaces.\n" +
      "4. Scrub with a long-handled brush.\n" +
      "5. Wipe clean and rinse duct sections.\n" +
      "6. Check the exterior vent cap for grease buildup and clean.\n" +
      "7. Reassemble all components.\n" +
      "8. Test the fan to ensure proper airflow.",
    whyItMatters: "Grease accumulates inside the duct over time, creating a fire hazard. Commercial kitchens clean ducts quarterly — residential kitchens should do it at least annually.",
    whatHappensIfSkipped: "Grease-lined ducts are a direct fire pathway from the stove to the roof. Duct fires cause $10,000–$50,000+ in damage and can destroy a home. Blocked ducts also make the hood ineffective.",
    toolsNeeded: ["Long-handled brush", "Screwdriver"],
    suppliesNeeded: ["Degreaser spray", "Rags"],
    careKitProductIds: [],
    estimatedSavings: "Fire prevention + maintains kitchen ventilation effectiveness",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.appliance.range_hood.inspect",
    taskName: "Inspect Range Hood",
    category: "appliance",
    applicableSystemIds: ["appliance.range_hood"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Check range hood fan, light, duct connection, and overall function.",
    detailedInstructions:
      "1. Turn on the hood fan at each speed — listen for unusual noises or vibration.\n" +
      "2. Hold a piece of paper near the filter — it should be drawn toward the hood when fan is on.\n" +
      "3. Check the light(s) for function.\n" +
      "4. Check the exterior vent — verify the damper opens when the fan runs and closes when it stops.\n" +
      "5. Look for grease drips on the stove or walls that indicate the hood isn't capturing properly.\n" +
      "6. If the hood is recirculating (no duct), replace the charcoal filter per manufacturer schedule.",
    whyItMatters: "A non-functional range hood means cooking fumes, grease, and moisture go directly into your kitchen air. This damages cabinets, promotes mold, and degrades indoor air quality.",
    whatHappensIfSkipped: "Cooking moisture causes mold on cabinets and ceiling above the stove. Grease settles on all kitchen surfaces. Poor indoor air quality from cooking fumes. Fan motor burnout: $100–$300.",
    toolsNeeded: ["Piece of paper (for airflow test)"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Prevents $100–$300 fan replacement and $2,000+ grease/moisture damage",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.appliance.microwave.clean",
    taskName: "Clean Microwave Interior",
    category: "appliance",
    applicableSystemIds: ["appliance.microwave"],
    frequencyType: "interval",
    frequencyValue: 30,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCost: { low: 0, high: 2 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Steam clean the microwave interior to remove food splatter and prevent odors.",
    detailedInstructions:
      "1. Place a microwave-safe bowl with 1 cup water and 2 tablespoons vinegar inside.\n" +
      "2. Microwave on high for 5 minutes — the steam loosens dried food.\n" +
      "3. Let it sit for 2 minutes with the door closed (steam continues to work).\n" +
      "4. Remove the bowl carefully (it's hot) and the turntable.\n" +
      "5. Wipe the interior with a damp cloth — food should wipe off easily.\n" +
      "6. Clean the turntable with soap and water.\n" +
      "7. Wipe the door seal and exterior with a damp cloth.",
    whyItMatters: "Food splatter absorbs microwave energy, creating hot spots that waste power and can damage the interior coating. Burned-on food also harbors bacteria.",
    whatHappensIfSkipped: "Food burns onto the interior and eventually damages the coating, which can spark. The turntable mechanism seizes. Severe neglect shortens the magnetron life, and microwave replacement costs $150–$500.",
    toolsNeeded: ["Microwave-safe bowl", "Clean cloths"],
    suppliesNeeded: ["White vinegar"],
    careKitProductIds: [],
    estimatedSavings: "Extends microwave life, preventing $150–$500 premature replacement",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.appliance.microwave.inspect_door_seal",
    taskName: "Inspect Microwave Door Seal",
    category: "appliance",
    applicableSystemIds: ["appliance.microwave"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 5,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Check the microwave door seal, hinges, and latch for proper closure and radiation containment.",
    detailedInstructions:
      "1. Inspect the door seal gasket for cracks, tears, or food buildup.\n" +
      "2. Clean the seal and the mating surface on the microwave body.\n" +
      "3. Close the door and check for gaps or misalignment.\n" +
      "4. Test the door latch — it should close firmly with a positive click.\n" +
      "5. If the door doesn't close properly, stop using the microwave until repaired.\n" +
      "6. Check the door hinges for looseness.",
    whyItMatters: "The door seal is the primary radiation containment barrier. A damaged seal can allow microwave radiation leakage, which is a safety hazard.",
    whatHappensIfSkipped: "A damaged door seal can leak microwave radiation. Misaligned latches prevent the safety interlock from working properly. If the safety interlock fails, the microwave could run with the door open. Replace the unit if door damage is found — repair is often not cost-effective.",
    toolsNeeded: [],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Safety inspection — prevents radiation leakage from damaged seal",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
];

// ============================================================
// SAFETY TASKS (12 entries)
// ============================================================

const SAFETY_TASKS: TaskCatalogEntry[] = [
  {
    taskId: "task.safety.smoke.test_monthly",
    taskName: "Test Smoke Detectors",
    category: "safety",
    applicableSystemIds: ["safety.smoke_detector"],
    frequencyType: "interval",
    frequencyValue: 30,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Press the test button on every smoke detector to verify it sounds the alarm.",
    detailedInstructions:
      "1. Notify household members you're testing alarms (so they don't panic).\n" +
      "2. Stand under each smoke detector and press and hold the test button.\n" +
      "3. The alarm should sound loudly within 5 seconds.\n" +
      "4. If interconnected, verify all alarms sound when one is tested.\n" +
      "5. If the alarm doesn't sound or is weak, replace batteries immediately.\n" +
      "6. If new batteries don't fix it, replace the unit.\n" +
      "7. Test all units including basement, attic, and garage detectors.",
    whyItMatters: "Smoke detectors save lives, but only if they work. NFPA reports that 3 out of 5 fire deaths occur in homes with no working smoke alarms. Monthly testing takes 5 minutes and could save your family.",
    whatHappensIfSkipped: "Non-functional smoke detectors provide no warning during a fire. You won't know they've failed until there's a fire. House fire fatality risk increases 55% without working smoke alarms.",
    toolsNeeded: [],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Life safety — priceless. Also reduces home insurance rates by 5–15%",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.safety.smoke.replace_batteries",
    taskName: "Replace Smoke Detector Batteries",
    category: "safety",
    applicableSystemIds: ["safety.smoke_detector"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 15,
    diyCost: { low: 5, high: 15 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Replace batteries in all smoke detectors annually, even if they haven't chirped yet.",
    detailedInstructions:
      "1. Twist or slide the detector off its mounting plate.\n" +
      "2. Open the battery compartment.\n" +
      "3. Replace with the correct battery type (usually 9V or AA — check your model).\n" +
      "4. Use high-quality name-brand batteries, not dollar-store batteries.\n" +
      "5. Reinstall the detector and press the test button.\n" +
      "6. If the unit uses a sealed 10-year lithium battery, no battery replacement is needed — replace the entire unit at 10 years.\n" +
      "7. Write the installation date on the back of each unit with a marker.",
    whyItMatters: "Batteries lose charge gradually. By the time the 'low battery' chirp sounds, the detector may have been operating at reduced sensitivity for weeks.",
    whatHappensIfSkipped: "Dead batteries = dead smoke detector. The annoying chirp causes many people to remove batteries and forget to replace them. 25% of smoke detector failures are due to dead or missing batteries.",
    toolsNeeded: ["Step stool or ladder"],
    suppliesNeeded: ["9V or AA batteries (model-specific)", "Marker"],
    careKitProductIds: ["smoke_detector_batteries"],
    estimatedSavings: "$5–15 in batteries protects lives and maintains home insurance compliance",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.safety.smoke.replace_unit",
    taskName: "Replace Smoke Detector Unit",
    category: "safety",
    applicableSystemIds: ["safety.smoke_detector"],
    frequencyType: "interval",
    frequencyValue: 3650,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCost: { low: 20, high: 40 },
    proCost: { low: 50, high: 100 },
    shortDescription: "Replace smoke detector units every 10 years as sensors degrade over time.",
    detailedInstructions:
      "1. Check the manufacture date on the back of each detector.\n" +
      "2. If older than 10 years, replace the unit.\n" +
      "3. Twist the old unit off its mounting plate.\n" +
      "4. Install the new mounting plate if needed (may be compatible with existing).\n" +
      "5. Install batteries and attach the new detector.\n" +
      "6. Press test button to verify.\n" +
      "7. Write the installation date on the back with a marker.\n" +
      "8. Consider upgrading to 10-year sealed lithium battery models to eliminate annual battery changes.",
    whyItMatters: "Smoke detector sensors degrade chemically over time, reducing sensitivity. After 10 years, they may not detect smoke reliably even though the test button still works.",
    whatHappensIfSkipped: "Aged sensors have reduced sensitivity — the test button tests the circuit, not the sensor's ability to detect smoke. A 15-year-old detector may fail to alert you to a real fire.",
    toolsNeeded: ["Screwdriver", "Step stool or ladder"],
    suppliesNeeded: ["New smoke detector(s)", "Batteries (if not sealed unit)"],
    careKitProductIds: [],
    estimatedSavings: "$20–40 detector replacement — legally required and life-critical",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.safety.co.test_monthly",
    taskName: "Test CO Detectors",
    category: "safety",
    applicableSystemIds: ["safety.co_detector"],
    frequencyType: "interval",
    frequencyValue: 30,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 5,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Press the test button on every carbon monoxide detector to verify proper operation.",
    detailedInstructions:
      "1. Locate all CO detectors in the home (should be near sleeping areas and on every level).\n" +
      "2. Press and hold the test button for 5 seconds.\n" +
      "3. The alarm should sound — verify it's loud enough to wake sleeping occupants.\n" +
      "4. Check the display for battery level and any error codes.\n" +
      "5. If the alarm doesn't sound, replace batteries or the unit.\n" +
      "6. Verify CO detectors are placed at proper height (varies by manufacturer — check manual).",
    whyItMatters: "Carbon monoxide is colorless and odorless — it kills over 400 Americans annually. CO detectors are the ONLY way to detect a leak before it's too late.",
    whatHappensIfSkipped: "A non-functional CO detector provides zero warning. CO poisoning symptoms mimic the flu, so victims often don't realize what's happening until it's too late. Over 400 deaths and 20,000 ER visits per year from CO.",
    toolsNeeded: [],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Life safety — CO kills 400+ Americans annually",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.safety.co.replace_batteries",
    taskName: "Replace CO Detector Batteries",
    category: "safety",
    applicableSystemIds: ["safety.co_detector"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCost: { low: 5, high: 10 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Replace CO detector batteries annually, regardless of chirp status.",
    detailedInstructions:
      "1. Remove the CO detector from its mounting.\n" +
      "2. Open the battery compartment and remove old batteries.\n" +
      "3. Insert new high-quality batteries (correct type per your model).\n" +
      "4. Reinstall the detector and press the test button.\n" +
      "5. Verify the display shows current readings (if digital model).\n" +
      "6. Write the battery replacement date on the unit.",
    whyItMatters: "CO detectors with dead batteries are useless. Annual replacement ensures they're always ready to protect your family.",
    whatHappensIfSkipped: "Dead batteries = no CO protection. Unlike smoke detectors, you can't 'smell' the danger. A single night with a malfunctioning furnace and a dead CO detector can be fatal.",
    toolsNeeded: ["Step stool or ladder"],
    suppliesNeeded: ["Batteries (model-specific)"],
    careKitProductIds: [],
    estimatedSavings: "$5–10 in batteries protects against CO poisoning — 400+ deaths/year",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.safety.co.replace_unit",
    taskName: "Replace CO Detector Unit",
    category: "safety",
    applicableSystemIds: ["safety.co_detector"],
    frequencyType: "interval",
    frequencyValue: 2555,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCost: { low: 25, high: 50 },
    proCost: { low: 50, high: 100 },
    shortDescription: "Replace CO detector units every 7 years as the electrochemical sensor degrades.",
    detailedInstructions:
      "1. Check the manufacture date on each CO detector.\n" +
      "2. CO detectors have a 5–7 year lifespan (shorter than smoke detectors).\n" +
      "3. Remove the old unit from its mounting plate.\n" +
      "4. Install a new unit (consider combo smoke/CO detectors).\n" +
      "5. Press test button to verify operation.\n" +
      "6. Write installation date on the back.\n" +
      "7. Dispose of old unit properly (some municipalities have specific disposal requirements).",
    whyItMatters: "CO detector sensors degrade faster than smoke detector sensors. A 10-year-old CO detector likely provides little to no protection, even if the test button works.",
    whatHappensIfSkipped: "Degraded sensors won't detect dangerous CO levels. Unlike smoke detectors (10-year life), CO detectors MUST be replaced at 5–7 years. $25–50 replacement is trivial compared to the risk.",
    toolsNeeded: ["Screwdriver", "Step stool or ladder"],
    suppliesNeeded: ["New CO detector(s)"],
    careKitProductIds: [],
    estimatedSavings: "$25–50 replacement protects against CO poisoning",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.safety.extinguisher.check_pressure",
    taskName: "Check Fire Extinguisher Pressure",
    category: "safety",
    applicableSystemIds: ["safety.fire_extinguisher"],
    frequencyType: "interval",
    frequencyValue: 30,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 2,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Verify fire extinguisher pressure gauge is in the green zone — takes 10 seconds per unit.",
    detailedInstructions:
      "1. Locate all fire extinguishers in your home (kitchen, garage, laundry room, each floor).\n" +
      "2. Check the pressure gauge — the needle should be in the green zone.\n" +
      "3. If the needle is in the red zone (under-pressured or over-pressured), the extinguisher needs service or replacement.\n" +
      "4. Verify the pull pin is intact and the tamper seal is not broken.\n" +
      "5. Ensure the extinguisher is easily accessible (not buried behind items).",
    whyItMatters: "A fire extinguisher is useless if it's empty or depressurized. A 10-second monthly check ensures it'll work when you need it.",
    whatHappensIfSkipped: "In a kitchen fire emergency, you grab the extinguisher and nothing comes out. A small fire that could have been extinguished in seconds grows to a structure fire. Average kitchen fire damage: $25,000+.",
    toolsNeeded: [],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Ensures fire suppression capability — prevents $25,000+ fire damage",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.safety.extinguisher.inspect",
    taskName: "Annual Fire Extinguisher Inspection",
    category: "safety",
    applicableSystemIds: ["safety.fire_extinguisher"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 20, high: 50 },
    shortDescription: "Thorough annual inspection of fire extinguisher condition, pressure, and accessibility.",
    detailedInstructions:
      "1. Verify the pressure gauge is in the green zone.\n" +
      "2. Check the manufacturing date and last service date.\n" +
      "3. Inspect the body for dents, corrosion, or damage.\n" +
      "4. Check the hose and nozzle for cracks or blockages.\n" +
      "5. Turn the extinguisher upside down and shake to prevent the dry chemical from packing/hardening.\n" +
      "6. Verify the pull pin and tamper seal are intact.\n" +
      "7. Ensure it's the right type for its location (ABC for general, K for kitchen).",
    whyItMatters: "Annual inspection catches issues a quick pressure check won't: corroded bodies can rupture, packed chemicals won't discharge, and damaged hoses prevent effective use.",
    whatHappensIfSkipped: "A corroded extinguisher can explode under pressure. Packed dry chemical won't discharge properly. Damaged hoses spray chemicals in uncontrolled directions. All of these fail when you need the extinguisher most.",
    toolsNeeded: [],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Ensures fire readiness — potential to prevent total home loss",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.safety.extinguisher.replace",
    taskName: "Replace Fire Extinguisher",
    category: "safety",
    applicableSystemIds: ["safety.fire_extinguisher"],
    frequencyType: "interval",
    frequencyValue: 4015,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 5,
    diyCost: { low: 30, high: 60 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Replace fire extinguishers every 10–12 years as the unit degrades over time.",
    detailedInstructions:
      "1. Check the manufacture date on the label.\n" +
      "2. Disposable extinguishers should be replaced every 10–12 years.\n" +
      "3. Purchase a new ABC-rated extinguisher (5 lb minimum for home use).\n" +
      "4. Mount at easily accessible locations: kitchen, garage, laundry, each floor.\n" +
      "5. Mount height: 3.5–5 feet from the floor.\n" +
      "6. Dispose of old extinguishers at your local fire department or hazardous waste facility.\n" +
      "7. Review proper PASS technique: Pull pin, Aim low, Squeeze handle, Sweep side to side.",
    whyItMatters: "Old extinguishers lose pressure, develop corrosion, and the chemicals degrade. A $30–60 replacement ensures reliable fire suppression for another decade.",
    whatHappensIfSkipped: "An old extinguisher may not discharge properly, or the body may rupture under pressure. Fire departments recommend replacement at 10–12 years regardless of pressure gauge reading.",
    toolsNeeded: ["Mounting bracket (included with new unit)"],
    suppliesNeeded: ["New ABC-rated fire extinguisher (5 lb minimum)"],
    careKitProductIds: [],
    estimatedSavings: "$30–60 replacement ensures fire protection worth tens of thousands in prevented damage",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.safety.radon.check_manometer",
    taskName: "Check Radon Manometer",
    category: "safety",
    applicableSystemIds: ["safety.radon_system"],
    frequencyType: "interval",
    frequencyValue: 30,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 1,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Check the radon system manometer to verify the mitigation fan is creating proper suction.",
    detailedInstructions:
      "1. Locate the manometer (U-tube gauge) on the radon mitigation pipe.\n" +
      "2. Verify the liquid levels are uneven — this means the fan is creating suction.\n" +
      "3. If the liquid levels are even, the fan may have failed.\n" +
      "4. Note the reading — significant changes from the baseline may indicate system problems.\n" +
      "5. If the fan has failed, contact a radon mitigation professional.",
    whyItMatters: "The manometer is the only visual indicator that your radon system is working. A 5-second glance confirms the fan is pulling radon gas from under your home.",
    whatHappensIfSkipped: "A failed radon fan means radon gas accumulates in your home undetected. Radon is the #2 cause of lung cancer (after smoking), killing 21,000 Americans annually. You can't see, smell, or taste it.",
    toolsNeeded: [],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Life safety — radon causes 21,000 lung cancer deaths/year in the US",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.safety.radon.inspect_fan",
    taskName: "Inspect Radon Mitigation Fan",
    category: "safety",
    applicableSystemIds: ["safety.radon_system"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 75, high: 150 },
    shortDescription: "Inspect the radon fan, piping, and system for proper operation and physical condition.",
    detailedInstructions:
      "1. Locate the radon fan (usually in the attic, garage, or mounted on the exterior).\n" +
      "2. Listen for the fan — it should produce a steady hum.\n" +
      "3. Feel the pipe above the fan — slight vibration confirms operation.\n" +
      "4. Check the manometer reading against the baseline.\n" +
      "5. Inspect the pipe for cracks, disconnections, or damage.\n" +
      "6. Check that the exhaust terminates above the roofline.\n" +
      "7. Radon fans typically last 5–8 years — plan replacement if approaching that age.",
    whyItMatters: "The radon fan is a continuously running mechanical device that will eventually fail. Annual inspection catches signs of impending failure before radon levels rise.",
    whatHappensIfSkipped: "A failing fan gradually loses suction, allowing radon levels to rise over weeks or months. You won't know until you test. Fan replacement: $300–$600 installed. Missing a failed fan: potential lung cancer risk.",
    toolsNeeded: ["Flashlight"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Ensures continuous radon protection — fan replacement $300–$600 when needed",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.safety.radon.test_levels",
    taskName: "Test Radon Levels",
    category: "safety",
    applicableSystemIds: ["safety.radon_system"],
    frequencyType: "interval",
    frequencyValue: 180,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 5,
    diyCost: { low: 10, high: 30 },
    proCost: { low: 100, high: 200 },
    shortDescription: "Test indoor radon levels to verify the mitigation system is keeping levels below 4 pCi/L.",
    detailedInstructions:
      "1. Purchase a short-term radon test kit or use a continuous radon monitor.\n" +
      "2. Place the test device in the lowest living area (basement or first floor).\n" +
      "3. Keep windows and doors closed for 12 hours before and during the test.\n" +
      "4. Leave the test kit in place for the specified duration (2–7 days for short-term).\n" +
      "5. Mail the kit to the lab or read the digital monitor.\n" +
      "6. EPA action level is 4 pCi/L — if results are above this, the system needs servicing.\n" +
      "7. Keep records of all test results.",
    whyItMatters: "Even with a mitigation system, radon levels can change due to geological shifts, system degradation, or home modifications. Regular testing is the only way to confirm protection.",
    whatHappensIfSkipped: "Elevated radon exposure causes lung cancer. The EPA estimates that 1 in 15 homes has elevated radon. Without testing, you have no way to know if your mitigation system is actually keeping levels safe.",
    toolsNeeded: [],
    suppliesNeeded: ["Short-term radon test kit or continuous radon monitor"],
    careKitProductIds: ["radon_test_kit"],
    estimatedSavings: "$10–30 test verifies protection against lung cancer risk",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
];

// ============================================================
// STRUCTURAL TASKS (9 entries)
// ============================================================

const STRUCTURAL_TASKS: TaskCatalogEntry[] = [
  {
    taskId: "task.structural.slab.inspect_cracks",
    taskName: "Inspect Slab for Cracks",
    category: "structural",
    applicableSystemIds: ["structural.foundation.slab"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 270, reason: "Florida's expansive clay soils and water table fluctuations increase foundation movement" },
    ],
    difficulty: "easy",
    estimatedTimeMinutes: 20,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Inspect visible slab areas for new cracks, crack growth, and signs of foundation movement.",
    detailedInstructions:
      "1. Walk the perimeter of the home checking the visible slab edge for cracks.\n" +
      "2. Inside, check garage floor for cracks (most visible slab area).\n" +
      "3. Look for new cracks in tile, especially diagonal cracks near doors.\n" +
      "4. Check for sticking doors or windows that didn't stick before.\n" +
      "5. Measure and photograph any cracks wider than 1/8 inch.\n" +
      "6. Mark crack ends with tape and date to monitor growth.\n" +
      "7. If cracks are wider than 1/4 inch or showing vertical displacement, consult a structural engineer.",
    whyItMatters: "Foundation cracks are normal but monitoring their progression is critical. Stable hairline cracks are cosmetic; growing cracks indicate active settlement that requires intervention.",
    whatHappensIfSkipped: "Unmonitored foundation movement leads to structural damage throughout the home: cracked walls, sticking doors, plumbing leaks from shifted pipes. Foundation repair: $5,000–$30,000+.",
    toolsNeeded: ["Measuring tape", "Camera/phone", "Painter's tape", "Marker"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Early detection saves $10,000–$20,000 vs letting foundation issues worsen",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.structural.slab.drainage_check",
    taskName: "Check Drainage Around Foundation",
    category: "structural",
    applicableSystemIds: ["structural.foundation.slab"],
    frequencyType: "interval",
    frequencyValue: 180,
    frequencyUnit: "days",
    seasonalMonths: [3, 4, 9, 10],
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 120, reason: "Florida rainy season (June-September) demands more frequent drainage checks" },
    ],
    difficulty: "easy",
    estimatedTimeMinutes: 20,
    diyCost: { low: 0, high: 50 },
    proCost: { low: 100, high: 300 },
    shortDescription: "Verify that water drains away from the foundation on all sides — the #1 rule of foundation health.",
    detailedInstructions:
      "1. Walk the perimeter during or just after a rain event.\n" +
      "2. Check that the grade slopes away from the foundation (6 inches drop in the first 10 feet).\n" +
      "3. Look for ponding water within 3 feet of the foundation.\n" +
      "4. Verify downspouts discharge at least 4 feet from the foundation.\n" +
      "5. Check that flower beds and mulch haven't created reverse grades against the house.\n" +
      "6. Verify french drains and swales are clear and flowing.\n" +
      "7. Add soil or adjust grading if water is ponding near the foundation.",
    whyItMatters: "Water is the #1 enemy of foundations. Saturated soil expands and pushes against the slab; dry soil contracts and lets the slab settle. Proper drainage maintains consistent moisture levels.",
    whatHappensIfSkipped: "Water pooling against the foundation causes erosion, settlement, and hydrostatic pressure. Over time, this leads to foundation cracks, shifting, and water intrusion. Foundation repair: $5,000–$30,000+.",
    toolsNeeded: ["Level (optional)", "Flashlight"],
    suppliesNeeded: ["Topsoil for grading adjustments (if needed)"],
    careKitProductIds: [],
    estimatedSavings: "Proper drainage prevents $5,000–$30,000 foundation repair",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.structural.crawl.inspect_moisture",
    taskName: "Inspect Crawlspace Moisture",
    category: "structural",
    applicableSystemIds: ["structural.foundation.crawlspace"],
    frequencyType: "interval",
    frequencyValue: 180,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 90, reason: "Florida humidity creates extreme moisture conditions in crawlspaces; mold and wood rot develop rapidly" },
    ],
    difficulty: "moderate",
    estimatedTimeMinutes: 30,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 100, high: 250 },
    shortDescription: "Enter or inspect the crawlspace for standing water, moisture, mold, and structural concerns.",
    detailedInstructions:
      "1. Wear appropriate PPE: N95 respirator, gloves, long sleeves, knee pads.\n" +
      "2. Check for standing water or muddy conditions (indicates drainage problem).\n" +
      "3. Look for white fuzzy mold on floor joists and subfloor sheathing.\n" +
      "4. Check for dark staining on wood that indicates ongoing moisture.\n" +
      "5. Verify the vapor barrier is intact and covering the soil surface.\n" +
      "6. Check for pest evidence: termite tubes, rodent droppings, insect damage.\n" +
      "7. Verify HVAC ductwork in the crawlspace is intact and connected.",
    whyItMatters: "The crawlspace is out of sight but directly under your living space. Moisture in the crawlspace creates mold that affects your indoor air quality (40% of indoor air comes from the crawlspace).",
    whatHappensIfSkipped: "Unchecked moisture causes mold, wood rot in floor joists, and pest infestations. Mold remediation: $2,000–$10,000. Floor joist sistering/replacement: $5,000–$15,000. These costs compound when problems go undetected.",
    toolsNeeded: ["N95 respirator", "Flashlight", "Gloves", "Knee pads"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Early detection prevents $5,000–$25,000 in mold, rot, and structural repair",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.structural.crawl.check_vapor_barrier",
    taskName: "Check Crawlspace Vapor Barrier",
    category: "structural",
    applicableSystemIds: ["structural.foundation.crawlspace"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "moderate",
    estimatedTimeMinutes: 20,
    diyCost: { low: 0, high: 50 },
    proCost: { low: 100, high: 300 },
    shortDescription: "Verify the crawlspace vapor barrier is intact and properly covering the exposed soil.",
    detailedInstructions:
      "1. Enter the crawlspace with proper PPE.\n" +
      "2. Check that the vapor barrier covers the entire soil surface.\n" +
      "3. Look for tears, punctures, or pulled-back sections.\n" +
      "4. Verify seams overlap by at least 6 inches.\n" +
      "5. Check that the barrier extends up the foundation walls (sealed crawlspace) or is weighted at edges.\n" +
      "6. Repair tears with vapor barrier tape.\n" +
      "7. Check for water pooling on top of the barrier (indicates drainage issues).",
    whyItMatters: "The vapor barrier prevents ground moisture from evaporating into the crawlspace. Without it, humidity levels skyrocket, causing mold and wood rot on floor joists and subfloor.",
    whatHappensIfSkipped: "Soil moisture evaporates directly into the crawlspace, creating 80–90% humidity. This causes rapid mold growth and wood rot. Complete vapor barrier installation: $1,500–$4,000. Repairs from neglected moisture: $5,000–$20,000.",
    toolsNeeded: ["N95 respirator", "Flashlight", "Gloves"],
    suppliesNeeded: ["Vapor barrier tape (for repairs)", "6-mil polyethylene (if sections need replacement)"],
    careKitProductIds: [],
    estimatedSavings: "Maintains moisture control, preventing $5,000–$20,000 in mold and structural damage",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.structural.crawl.pest_inspection",
    taskName: "Crawlspace Pest Inspection",
    category: "structural",
    applicableSystemIds: ["structural.foundation.crawlspace"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "professional",
    estimatedTimeMinutes: 45,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 75, high: 200 },
    shortDescription: "Professional inspection for termites, wood-destroying organisms, and pest activity in the crawlspace.",
    detailedInstructions:
      "1. Schedule a licensed pest control professional for the inspection.\n" +
      "2. Inspector checks for subterranean termite mud tubes on foundation walls and piers.\n" +
      "3. Probe wood members for termite damage (sounds hollow when tapped).\n" +
      "4. Look for carpenter ant frass (sawdust-like debris).\n" +
      "5. Check for rodent entry points, droppings, and gnaw damage.\n" +
      "6. Inspect for standing water that attracts mosquitoes and other pests.\n" +
      "7. Receive a written WDO (Wood-Destroying Organism) report.",
    whyItMatters: "Subterranean termites cause $5 billion in damage annually in the US. They enter through crawlspaces and can destroy floor joists and subfloor before any visible signs appear in the living space above.",
    whatHappensIfSkipped: "Termite colonies consume wood silently for years before damage becomes visible. By the time you see termite damage upstairs, the structural damage is severe. Average termite repair: $3,000–$10,000. In Florida, termite damage is common and costly.",
    toolsNeeded: [],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "$75–200 inspection prevents $3,000–$10,000+ termite damage",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.structural.framing.inspect",
    taskName: "Inspect Visible Framing",
    category: "structural",
    applicableSystemIds: ["structural.framing"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "moderate",
    estimatedTimeMinutes: 30,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 100, high: 250 },
    shortDescription: "Inspect exposed framing in attic, basement, garage, and crawlspace for damage and deterioration.",
    detailedInstructions:
      "1. Check attic framing: rafters, trusses, and collar ties for cracks or sagging.\n" +
      "2. Look for water stains on framing that indicate roof leaks.\n" +
      "3. In the basement/crawlspace, check floor joists for cracks, notches, or sagging.\n" +
      "4. Look for signs of wood-destroying insects: mud tubes, frass, hollow-sounding wood.\n" +
      "5. Check garage framing visible in the ceiling for proper fire-rated drywall coverage.\n" +
      "6. Look for any modifications (cut joists, removed headers) that may compromise structure.",
    whyItMatters: "Framing is the skeleton of your home. Catching a cracked joist or termite damage early allows targeted repair instead of emergency structural work.",
    whatHappensIfSkipped: "Undetected framing damage progresses until floors sag, walls crack, or ceilings bow. Emergency structural repairs cost $5,000–$20,000+. A sagging floor joist caught early can be sistered for $300–$500.",
    toolsNeeded: ["Flashlight", "Screwdriver or awl (for probing wood)"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "$300–500 early joist repair vs $5,000–$20,000 emergency structural work",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.structural.framing.wdo_inspection",
    taskName: "WDO / Termite Inspection",
    category: "structural",
    applicableSystemIds: ["structural.framing"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 365, reason: "Annual WDO inspection is required in Florida for most homeowner insurance policies; termite pressure is extreme year-round" },
    ],
    difficulty: "professional",
    estimatedTimeMinutes: 60,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 75, high: 200 },
    shortDescription: "Professional Wood-Destroying Organism inspection — required annually in Florida for most insurance policies.",
    detailedInstructions:
      "1. Schedule a licensed WDO inspector (separate from regular pest control in many states).\n" +
      "2. Inspector examines the entire structure: foundation, framing, siding, and trim.\n" +
      "3. Check for subterranean termites (mud tubes), drywood termites (frass pellets), and dampwood termites.\n" +
      "4. Inspect for carpenter ants, wood-boring beetles, and other WDOs.\n" +
      "5. Check moisture conditions that attract WDOs.\n" +
      "6. Receive a formal WDO report (NPMA-33 form).\n" +
      "7. Keep reports on file — required for insurance and real estate transactions.",
    whyItMatters: "In Florida, termites are not a matter of 'if' but 'when.' Annual WDO inspections are required by most homeowner insurance policies. Termites cause more damage than fires, floods, and storms combined in Florida.",
    whatHappensIfSkipped: "Without annual inspection, termite colonies can silently destroy structural wood for years. Average termite damage repair: $3,000–$10,000. Severe infestations require $15,000–$30,000+ in structural repair. Insurance may deny claims without current WDO report.",
    toolsNeeded: [],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "$75–200/year inspection prevents $3,000–$30,000 termite damage; required for FL insurance",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.structural.attic_insulation.inspect",
    taskName: "Inspect Attic Insulation",
    category: "structural",
    applicableSystemIds: ["structural.insulation.attic"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 20,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Check attic insulation depth, condition, and coverage for energy efficiency.",
    detailedInstructions:
      "1. Access the attic safely (use a sturdy ladder and step only on joists or walkboards).\n" +
      "2. Measure insulation depth in multiple locations with a ruler.\n" +
      "3. Florida minimum: R-30 (10-12 inches of blown fiberglass or 8-9 inches of cellulose).\n" +
      "4. Check for bare spots, compressed areas, or displaced insulation.\n" +
      "5. Look for signs of pest activity (tunneling, droppings, nesting).\n" +
      "6. Check that insulation isn't blocking soffit vents.\n" +
      "7. Look for moisture stains that indicate roof leaks reaching the insulation.",
    whyItMatters: "Inadequate attic insulation is the #1 source of energy waste in homes. In Florida, 25–40% of cooling costs come through the attic if not properly insulated.",
    whatHappensIfSkipped: "Thin or missing insulation forces your AC to work significantly harder. Energy waste of $300–$800/year in Florida. Moisture from condensation can develop in improperly insulated attics, promoting mold.",
    toolsNeeded: ["Ruler or measuring tape", "Flashlight", "N95 mask (for fiberglass)"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Proper insulation saves $300–$800/year in energy costs",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.structural.attic_insulation.add_depth",
    taskName: "Add Attic Insulation Depth",
    category: "structural",
    applicableSystemIds: ["structural.insulation.attic"],
    frequencyType: "condition_based",
    frequencyValue: 1825,
    frequencyUnit: "days",
    difficulty: "moderate",
    estimatedTimeMinutes: 480,
    diyCost: { low: 300, high: 800 },
    proCost: { low: 800, high: 2000 },
    shortDescription: "Add blown-in or batt insulation to bring attic to recommended R-value for your climate zone.",
    detailedInstructions:
      "1. Calculate the R-value gap: measure current depth and determine target (R-38 to R-60 depending on zone).\n" +
      "2. Rent a blown-in insulation machine from a home improvement store (usually free with insulation purchase).\n" +
      "3. Seal all air leaks first: around pipes, wires, recessed lights, and ductwork penetrations.\n" +
      "4. Install baffles at soffit vents to maintain airflow.\n" +
      "5. Blow insulation to the target depth, working from far corners toward the attic access.\n" +
      "6. Maintain consistent depth throughout — use depth markers.\n" +
      "7. Do NOT block soffit vents, bathroom exhaust vents, or recessed light cans (unless IC-rated).",
    whyItMatters: "Adding insulation is one of the highest-ROI home improvements. Every dollar spent returns $2–4 in energy savings over the insulation's lifetime. Most homes built before 2000 are under-insulated.",
    whatHappensIfSkipped: "Continued energy waste of $300–$800/year. In humid climates, temperature differentials cause condensation that leads to mold in the attic. Under-insulated attics also reduce home comfort significantly.",
    toolsNeeded: ["Blown-in insulation machine (rental)", "Utility knife", "Staple gun", "Safety goggles", "N95 respirator"],
    suppliesNeeded: ["Blown-in insulation bags", "Insulation baffles", "Air sealing foam/caulk", "Depth markers"],
    careKitProductIds: [],
    estimatedSavings: "$300–$800/year energy savings; $2–4 return per dollar invested",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
];

// ============================================================
// LANDSCAPE TASKS (20 entries)
// ============================================================

const LANDSCAPE_TASKS: TaskCatalogEntry[] = [
  {
    taskId: "task.landscape.irrigation.inspect_heads",
    taskName: "Inspect Sprinkler Heads",
    category: "landscape",
    applicableSystemIds: ["landscape.irrigation"],
    frequencyType: "interval",
    frequencyValue: 90,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 30,
    diyCost: { low: 0, high: 10 },
    proCost: { low: 50, high: 100 },
    shortDescription: "Run each irrigation zone and check sprinkler heads for clogs, misalignment, and damage.",
    detailedInstructions:
      "1. Manually run each irrigation zone from the controller.\n" +
      "2. Walk each zone while running, checking every head.\n" +
      "3. Look for: clogged nozzles, heads stuck down, broken risers, misaligned spray patterns.\n" +
      "4. Clear clogged nozzles with a small wire or by removing and rinsing.\n" +
      "5. Adjust heads that are spraying sidewalks, driveways, or buildings.\n" +
      "6. Replace broken heads or cracked risers.\n" +
      "7. Check for low-pressure zones that indicate a line leak.",
    whyItMatters: "One misaligned or clogged head creates a dry spot that stresses grass and plants while wasting water spraying pavement. Irrigation wastes 50%+ of water when not properly maintained.",
    whatHappensIfSkipped: "Dry spots in the lawn turn brown and die. Overwatered areas develop fungus. Broken heads waste thousands of gallons per month. Average water waste from unmaintained irrigation: $30–$100/month.",
    toolsNeeded: ["Small wire or nozzle cleaning tool", "Screwdriver"],
    suppliesNeeded: ["Replacement sprinkler heads (if needed)", "Replacement risers (if needed)"],
    careKitProductIds: [],
    estimatedSavings: "Saves $30–$100/month in wasted water + prevents $500–$1,500 in lawn replacement",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.landscape.irrigation.seasonal_adjust",
    taskName: "Adjust Irrigation Schedule Seasonally",
    category: "landscape",
    applicableSystemIds: ["landscape.irrigation"],
    frequencyType: "seasonal",
    frequencyValue: 90,
    frequencyUnit: "days",
    seasonalMonths: [3, 6, 9, 12],
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 90, reason: "Florida seasonal watering restrictions require schedule adjustments; summer rain reduces need for irrigation" },
    ],
    difficulty: "easy",
    estimatedTimeMinutes: 15,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 40, high: 80 },
    shortDescription: "Adjust watering days, times, and duration for the current season and weather conditions.",
    detailedInstructions:
      "1. Review current watering schedule on the controller.\n" +
      "2. Adjust based on season: summer (more frequent but less per session), winter (less frequent).\n" +
      "3. In Florida, follow local water management district restrictions (typically 2 days/week).\n" +
      "4. Set watering times to early morning (4–6 AM) to minimize evaporation.\n" +
      "5. Reduce run times during rainy season — your lawn may not need irrigation at all in summer.\n" +
      "6. If you have a rain sensor, verify it's functioning (override irrigation during rain).\n" +
      "7. Consider a smart controller that adjusts automatically based on weather data.",
    whyItMatters: "Running summer settings in winter overwatering creates fungus. Running winter settings in summer underwatering stresses grass. Seasonal adjustment matches water delivery to actual plant needs.",
    whatHappensIfSkipped: "Overwatering causes fungus, root rot, and wastes water ($50–$200/month). Underwatering stresses lawn and landscapes. Violating local water restrictions can result in fines ($50–$500).",
    toolsNeeded: [],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Saves $50–$200/month in water + prevents fungus and fines ($50–$500)",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.landscape.irrigation.backflow_test",
    taskName: "Backflow Preventer Test",
    category: "landscape",
    applicableSystemIds: ["landscape.irrigation"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "professional",
    estimatedTimeMinutes: 30,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 75, high: 150 },
    shortDescription: "Annual certified backflow preventer test — required by most municipalities to protect drinking water.",
    detailedInstructions:
      "1. Schedule a certified backflow tester (required by most local water utilities).\n" +
      "2. The tester connects a test kit to the backflow preventer device.\n" +
      "3. They test both check valves and the relief valve for proper operation.\n" +
      "4. A passing test means the device prevents irrigation water from contaminating your drinking water supply.\n" +
      "5. If it fails, the device must be repaired or replaced before the irrigation system can be used.\n" +
      "6. The tester files the results with your local water utility.\n" +
      "7. Keep a copy of the test report for your records.",
    whyItMatters: "The backflow preventer is the only barrier between fertilizers, pesticides, and bacteria in your irrigation system and your family's drinking water. Annual testing is required by law in most areas.",
    whatHappensIfSkipped: "Without a functioning backflow preventer, irrigation water (containing fertilizer, pesticides, dog waste) can be siphoned back into your drinking water supply. Failure to test can result in water service disconnection.",
    toolsNeeded: [],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Protects drinking water supply; avoids $200+ fines and water service disconnection",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.landscape.irrigation.winterize",
    taskName: "Winterize Irrigation System",
    category: "landscape",
    applicableSystemIds: ["landscape.irrigation"],
    frequencyType: "seasonal",
    frequencyValue: 365,
    frequencyUnit: "days",
    seasonalMonths: [10, 11],
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 0, reason: "Generally not needed in South Florida; North Florida may need winterization during rare hard freeze events" },
    ],
    difficulty: "moderate",
    estimatedTimeMinutes: 60,
    diyCost: { low: 0, high: 20 },
    proCost: { low: 75, high: 150 },
    shortDescription: "Blow out irrigation lines before freezing temperatures to prevent pipe and fitting damage.",
    detailedInstructions:
      "1. Shut off the water supply to the irrigation system.\n" +
      "2. Open the drain valves at the lowest points in the system.\n" +
      "3. Connect an air compressor to the irrigation system blowout port.\n" +
      "4. Set compressor to 50 PSI maximum (higher pressure damages PVC and fittings).\n" +
      "5. Blow out each zone individually, running for 2–3 minutes until only mist exits the heads.\n" +
      "6. Insulate the backflow preventer with a cover or towels.\n" +
      "7. Turn off the controller or set to 'rain' mode for winter.",
    whyItMatters: "Water expands when it freezes, cracking PVC pipes, fittings, and the backflow preventer. One freeze event can cause $500–$2,000+ in irrigation repairs.",
    whatHappensIfSkipped: "Frozen water cracks pipes underground, at the backflow preventer, and at valve manifolds. You won't know until spring when you turn on the system and find multiple leaks. Typical freeze damage repair: $500–$2,000.",
    toolsNeeded: ["Air compressor (min 10 CFM)", "Compressor-to-irrigation adapter"],
    suppliesNeeded: ["Insulating cover for backflow preventer"],
    careKitProductIds: [],
    estimatedSavings: "Prevents $500–$2,000 in freeze damage to irrigation components",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.landscape.lawn.mow",
    taskName: "Mow Lawn",
    category: "landscape",
    applicableSystemIds: ["landscape.lawn"],
    frequencyType: "interval",
    frequencyValue: 7,
    frequencyUnit: "days",
    seasonalMonths: [3, 4, 5, 6, 7, 8, 9, 10],
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 5, reason: "Florida warm-season grasses grow rapidly during summer and may need mowing every 5 days" },
    ],
    difficulty: "easy",
    estimatedTimeMinutes: 45,
    diyCost: { low: 3, high: 8 },
    proCost: { low: 30, high: 75 },
    shortDescription: "Mow at the proper height for your grass type — never remove more than 1/3 of the blade length.",
    detailedInstructions:
      "1. Check mower blade sharpness — dull blades tear grass, causing brown tips.\n" +
      "2. Set mowing height for your grass type (St. Augustine: 3.5–4\", Bermuda: 1–2\", Zoysia: 1.5–2.5\").\n" +
      "3. Never remove more than 1/3 of the grass blade in a single mowing.\n" +
      "4. Mow when grass is dry for a clean cut.\n" +
      "5. Alternate mowing patterns each time to prevent soil compaction and rut formation.\n" +
      "6. Leave grass clippings on the lawn (mulch mowing) — they return nutrients to the soil.\n" +
      "7. Edge along sidewalks and driveways for a clean appearance.",
    whyItMatters: "Proper mowing height is the most important factor in lawn health. Cutting too short ('scalping') stresses grass, weakens roots, and invites weeds and disease.",
    whatHappensIfSkipped: "Overgrown grass requires removal of more than 1/3, shocking the plant. Irregular mowing leads to weed invasion, thatch buildup, and uneven turf. Lawn renovation from severe neglect: $1,000–$3,000.",
    toolsNeeded: ["Lawn mower", "String trimmer/edger"],
    suppliesNeeded: ["Fuel or charged battery"],
    careKitProductIds: [],
    estimatedSavings: "Maintains lawn health, preventing $1,000–$3,000 renovation",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.landscape.lawn.fertilize",
    taskName: "Fertilize Lawn",
    category: "landscape",
    applicableSystemIds: ["landscape.lawn"],
    frequencyType: "seasonal",
    frequencyValue: 90,
    frequencyUnit: "days",
    seasonalMonths: [3, 5, 9, 11],
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 60, reason: "Florida soils are sandy with low nutrient retention; more frequent light applications are better than heavy doses" },
    ],
    difficulty: "easy",
    estimatedTimeMinutes: 30,
    diyCost: { low: 20, high: 50 },
    proCost: { low: 50, high: 120 },
    shortDescription: "Apply seasonal fertilizer matched to your grass type and local soil conditions.",
    detailedInstructions:
      "1. Identify your grass type and choose the appropriate fertilizer (N-P-K ratio).\n" +
      "2. In Florida, use a 'Florida-friendly' fertilizer (low or no phosphorus per local ordinance).\n" +
      "3. Apply with a broadcast spreader at the recommended rate — more is NOT better.\n" +
      "4. Walk at a consistent pace in overlapping passes for even coverage.\n" +
      "5. Water in lightly after application (0.25 inches).\n" +
      "6. Do not fertilize before heavy rain — runoff contaminates waterways.\n" +
      "7. Follow local blackout periods (many FL counties ban fertilizer June–September).",
    whyItMatters: "Proper fertilization feeds grass roots, thickens turf, and crowds out weeds naturally. It's the foundation of a healthy lawn that resists drought, pests, and disease.",
    whatHappensIfSkipped: "Thin, pale grass allows weeds to establish. Without nitrogen, grass can't recover from stress. A neglected lawn requires overseeding or sodding ($500–$2,000) to restore.",
    toolsNeeded: ["Broadcast spreader"],
    suppliesNeeded: ["Lawn fertilizer (appropriate N-P-K for grass type and season)"],
    careKitProductIds: ["lawn_fertilizer"],
    estimatedSavings: "$20–50 fertilizer maintains a lawn worth $2,000–$5,000 in curb appeal",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.landscape.lawn.aerate",
    taskName: "Aerate Lawn",
    category: "landscape",
    applicableSystemIds: ["landscape.lawn"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    seasonalMonths: [3, 4, 9, 10],
    difficulty: "moderate",
    estimatedTimeMinutes: 120,
    diyCost: { low: 40, high: 80 },
    proCost: { low: 100, high: 250 },
    shortDescription: "Core aerate the lawn to reduce compaction and allow air, water, and nutrients to reach roots.",
    detailedInstructions:
      "1. Water the lawn the day before to soften soil (but not soggy).\n" +
      "2. Rent a core aerator from a home improvement store.\n" +
      "3. Make two passes over the entire lawn in different directions.\n" +
      "4. Leave soil plugs on the surface — they'll break down in 1–2 weeks.\n" +
      "5. Apply fertilizer and/or overseeding immediately after aeration for best results.\n" +
      "6. Water regularly for the next 2 weeks to help the lawn recover.\n" +
      "7. Aerate warm-season grasses in spring; cool-season grasses in fall.",
    whyItMatters: "Foot traffic, mowing, and natural settling compacts soil over time. Compacted soil starves grass roots of oxygen and prevents water infiltration. Aeration reverses this.",
    whatHappensIfSkipped: "Compacted soil causes shallow root systems, poor drainage, and increased runoff. Grass thins and weeds take over. Severe compaction requires re-grading and re-sodding ($2,000–$5,000).",
    toolsNeeded: ["Core aerator (rental)"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "$40–80 aeration prevents $2,000–$5,000 lawn renovation from severe compaction",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.landscape.lawn.pest_treatment",
    taskName: "Lawn Pest / Grub Treatment",
    category: "landscape",
    applicableSystemIds: ["landscape.lawn"],
    frequencyType: "seasonal",
    frequencyValue: 90,
    frequencyUnit: "days",
    seasonalMonths: [4, 5, 6, 9],
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 60, reason: "Florida's warm climate supports year-round pest activity including chinch bugs, sod webworms, and army worms" },
    ],
    difficulty: "easy",
    estimatedTimeMinutes: 30,
    diyCost: { low: 15, high: 40 },
    proCost: { low: 50, high: 150 },
    shortDescription: "Apply preventive pest treatment and inspect for grubs, chinch bugs, and other lawn-destroying pests.",
    detailedInstructions:
      "1. Inspect the lawn for signs of pest damage: irregular brown patches, birds feeding heavily.\n" +
      "2. Check for grubs: cut a 1-sqft section of turf and peel back — more than 5 grubs/sqft warrants treatment.\n" +
      "3. Check for chinch bugs (Florida): part the grass at the edge of a brown patch and look for tiny black/white insects.\n" +
      "4. Apply appropriate granular or liquid treatment for the identified pest.\n" +
      "5. Water in the treatment per label directions.\n" +
      "6. Monitor treated areas for recovery over the next 2–3 weeks.\n" +
      "7. Preventive applications in spring are more effective than reactive treatments.",
    whyItMatters: "A single grub or chinch bug infestation can destroy an entire lawn in weeks. Preventive treatment costs $15–40; replacing destroyed sod costs $500–$2,000+.",
    whatHappensIfSkipped: "Grubs eat grass roots, causing turf to die in large patches. Chinch bugs (Florida's #1 lawn pest) can kill St. Augustine grass in days during hot weather. Full sod replacement: $500–$2,000+.",
    toolsNeeded: ["Broadcast spreader (for granular)", "Hose-end sprayer (for liquid)"],
    suppliesNeeded: ["Lawn insecticide (appropriate for pest type)"],
    careKitProductIds: ["lawn_pest_control"],
    estimatedSavings: "$15–40 treatment prevents $500–$2,000+ sod replacement",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.landscape.trees.prune",
    taskName: "Prune Trees",
    category: "landscape",
    applicableSystemIds: ["landscape.trees"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    seasonalMonths: [1, 2, 12],
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 365, reason: "Pre-hurricane pruning is essential in Florida; schedule before June 1 hurricane season start" },
    ],
    difficulty: "moderate",
    estimatedTimeMinutes: 120,
    diyCost: { low: 0, high: 50 },
    proCost: { low: 200, high: 800 },
    shortDescription: "Prune dead, damaged, and crossing branches to maintain tree health and prevent storm damage.",
    detailedInstructions:
      "1. Identify dead, dying, or diseased branches (no leaves, bark falling off, fungus present).\n" +
      "2. Remove crossing branches that rub against each other.\n" +
      "3. Prune branches that touch or hang over the roof.\n" +
      "4. Maintain clearance from the house (at least 10 feet from the roof).\n" +
      "5. Make proper pruning cuts just outside the branch collar — never flush with the trunk.\n" +
      "6. Do not remove more than 25% of the canopy in a single season.\n" +
      "7. For large trees or branches near power lines, hire a certified arborist.",
    whyItMatters: "Dead branches fall in storms, damaging roofs, vehicles, and people. In Florida, proper tree pruning before hurricane season is essential for protecting your home and neighbors.",
    whatHappensIfSkipped: "Falling branches damage roofs ($1,000–$10,000+ per incident). Overgrown trees touching the roof promote moisture damage and pest entry. In hurricanes, unpruned trees are the #1 cause of structural damage to neighboring homes.",
    toolsNeeded: ["Pruning shears", "Lopping shears", "Pruning saw", "Pole pruner (for high branches)"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Prevents $1,000–$10,000+ storm damage from falling limbs",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.landscape.trees.inspect_hazard",
    taskName: "Inspect Trees for Hazards",
    category: "landscape",
    applicableSystemIds: ["landscape.trees"],
    frequencyType: "interval",
    frequencyValue: 180,
    frequencyUnit: "days",
    seasonalMonths: [3, 4, 9, 10],
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 120, reason: "Florida trees face hurricane-force winds; more frequent inspection catches developing hazards before storm season" },
    ],
    difficulty: "easy",
    estimatedTimeMinutes: 30,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 100, high: 300 },
    shortDescription: "Assess trees for structural hazards including dead wood, root damage, leaning, and disease.",
    detailedInstructions:
      "1. Stand back and look at each tree's overall shape — is it leaning significantly?\n" +
      "2. Check the trunk for cracks, cavities, or peeling bark.\n" +
      "3. Look for mushrooms or fungal conks at the base — this indicates root or trunk rot.\n" +
      "4. Check for raised soil on one side of the tree (indicates root failure).\n" +
      "5. Look up into the canopy for dead branches (no leaves when rest of tree is leafy).\n" +
      "6. After storms, check for hanging broken branches ('widow makers').\n" +
      "7. If hazards are found, consult a certified arborist for risk assessment.",
    whyItMatters: "A tree that appears healthy can have internal rot that makes it a ticking time bomb in the next storm. Regular inspection is especially critical in Florida before hurricane season.",
    whatHappensIfSkipped: "A hazard tree falling on your home can cause $10,000–$100,000+ in damage. Falling on a neighbor's property makes you liable. Tree removal after a fall costs 2–3x more than proactive removal.",
    toolsNeeded: ["Binoculars (for canopy inspection)"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Proactive removal ($500–$2,000) vs emergency removal + damage ($10,000–$100,000+)",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.landscape.shrubs.trim",
    taskName: "Trim Shrubs",
    category: "landscape",
    applicableSystemIds: ["landscape.shrubs"],
    frequencyType: "interval",
    frequencyValue: 90,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 60, reason: "Florida's year-round growing season means shrubs grow faster and need more frequent trimming" },
    ],
    difficulty: "easy",
    estimatedTimeMinutes: 60,
    diyCost: { low: 0, high: 10 },
    proCost: { low: 50, high: 150 },
    shortDescription: "Trim shrubs to maintain shape, keep them away from the house, and promote healthy growth.",
    detailedInstructions:
      "1. Maintain at least 12 inches of clearance between shrubs and the house siding.\n" +
      "2. Trim the top narrower than the bottom to allow light to reach lower branches.\n" +
      "3. Remove dead or diseased branches at the base.\n" +
      "4. Clean up clippings — don't let them pile against the house.\n" +
      "5. Check for pest or disease while trimming.\n" +
      "6. Don't shear into old wood — most shrubs won't regrow from bare branches.",
    whyItMatters: "Overgrown shrubs against the house trap moisture, provide pest pathways, and hide foundation problems. Proper trimming allows airflow that prevents moisture damage to siding and foundation.",
    whatHappensIfSkipped: "Shrubs touching the house create moisture problems, pest bridges, and hide damage. Overgrown foundation plantings can crack siding and provide termite pathways. Siding repair from moisture damage: $500–$3,000.",
    toolsNeeded: ["Hedge shears or powered hedge trimmer", "Pruning shears", "Rake"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Prevents $500–$3,000 siding damage from moisture and pests",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.landscape.pool.clean",
    taskName: "Clean Pool",
    category: "landscape",
    applicableSystemIds: ["landscape.pool"],
    frequencyType: "interval",
    frequencyValue: 7,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 30,
    diyCost: { low: 5, high: 15 },
    proCost: { low: 100, high: 200 },
    shortDescription: "Skim, brush, and vacuum the pool to maintain water clarity and prevent algae growth.",
    detailedInstructions:
      "1. Skim the surface with a leaf net to remove floating debris.\n" +
      "2. Brush walls and floor starting from the shallow end, working toward the main drain.\n" +
      "3. Pay extra attention to corners, steps, and behind ladders where algae starts.\n" +
      "4. Vacuum the pool floor (manual or auto-cleaner).\n" +
      "5. Clean the waterline tile to prevent calcium buildup.\n" +
      "6. Empty skimmer baskets.\n" +
      "7. Backwash or clean the filter if pressure gauge reads 8–10 PSI above clean baseline.",
    whyItMatters: "Regular cleaning prevents algae from taking hold. Once algae blooms, it takes days and significant chemical cost to clear. Prevention is 10x cheaper than treatment.",
    whatHappensIfSkipped: "Algae blooms within 1–2 weeks of neglect, turning water green. Chemical shock treatment costs $50–$200. Stained pool surfaces require acid washing ($300–$600). Algae can damage the filter system.",
    toolsNeeded: ["Pool skimmer net", "Pool brush", "Pool vacuum or auto-cleaner"],
    suppliesNeeded: ["Pool cleaning chemicals"],
    careKitProductIds: ["pool_brush", "pool_skimmer"],
    estimatedSavings: "Prevents $50–$600 algae treatment and surface staining",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.landscape.pool.balance_chemistry",
    taskName: "Balance Pool Chemistry",
    category: "landscape",
    applicableSystemIds: ["landscape.pool"],
    frequencyType: "interval",
    frequencyValue: 7,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 3, reason: "Florida sun and heat burn off chlorine faster and promote algae growth; testing 2–3x/week is recommended" },
    ],
    difficulty: "easy",
    estimatedTimeMinutes: 15,
    diyCost: { low: 10, high: 30 },
    proCost: { low: 100, high: 200 },
    shortDescription: "Test and adjust pool water chemistry to maintain safe, clear water and protect pool equipment.",
    detailedInstructions:
      "1. Test water using test strips or a liquid test kit.\n" +
      "2. Check free chlorine (target: 1–3 ppm), pH (target: 7.2–7.6), and alkalinity (target: 80–120 ppm).\n" +
      "3. Adjust chlorine first: add liquid chlorine or tablets as needed.\n" +
      "4. Adjust pH: muriatic acid to lower, soda ash to raise.\n" +
      "5. Adjust alkalinity: baking soda to raise, muriatic acid to lower.\n" +
      "6. Check CYA (stabilizer) monthly: target 30–50 ppm for non-salt, 60–80 ppm for salt pools.\n" +
      "7. Run the pump for at least 8 hours after chemical adjustments.",
    whyItMatters: "Balanced water chemistry prevents algae, protects equipment from corrosion or scale, and keeps swimmers safe. Unbalanced water is the #1 cause of pool equipment failure.",
    whatHappensIfSkipped: "Low chlorine allows algae and bacteria. Low pH corrodes equipment ($500–$2,000 in damage). High pH causes scale buildup on surfaces and inside heaters. Unbalanced water shortens pool surface life by years.",
    toolsNeeded: ["Pool test kit or test strips"],
    suppliesNeeded: ["Chlorine (liquid or tablets)", "Muriatic acid", "Soda ash", "Baking soda"],
    careKitProductIds: ["pool_test_kit", "pool_chemicals"],
    estimatedSavings: "Protects $5,000–$15,000 in pool equipment and surfaces from chemical damage",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.landscape.pool.inspect_surface",
    taskName: "Inspect Pool Surface",
    category: "landscape",
    applicableSystemIds: ["landscape.pool"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 20,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Inspect pool surface finish for staining, etching, delamination, and rough spots.",
    detailedInstructions:
      "1. Walk around the pool and visually inspect the surface above and below waterline.\n" +
      "2. Run your hand along the surface — it should be smooth, not rough or sandy.\n" +
      "3. Look for discoloration, staining patterns, or chalky deposits.\n" +
      "4. Check for cracks in the plaster/pebble finish.\n" +
      "5. Look for brown/rust stains that indicate rebar showing through (serious issue).\n" +
      "6. Check the tile band along the waterline for loose or cracked tiles.\n" +
      "7. Note the overall condition — rough surfaces cut feet and harbor algae.",
    whyItMatters: "Pool surface condition affects water chemistry balance, comfort, and aesthetics. Catching deterioration early may allow spot repairs instead of full resurfacing.",
    whatHappensIfSkipped: "Deteriorating pool surfaces harbor algae in rough areas, making maintenance harder. Exposed rebar causes rust staining. Full pool resurfacing costs $5,000–$15,000 depending on the finish selected.",
    toolsNeeded: ["Goggles (for underwater inspection)"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Early spot repair ($200–$500) vs full resurfacing ($5,000–$15,000)",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.landscape.pool.resurface",
    taskName: "Resurface Pool",
    category: "landscape",
    applicableSystemIds: ["landscape.pool"],
    frequencyType: "interval",
    frequencyValue: 4563,
    frequencyUnit: "days",
    difficulty: "professional",
    estimatedTimeMinutes: 14400,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 5000, high: 15000 },
    shortDescription: "Professional pool resurfacing to restore the interior finish when it becomes rough or deteriorated.",
    detailedInstructions:
      "1. Hire a licensed pool contractor for an assessment.\n" +
      "2. Choose the finish type: basic plaster (8–12 years), quartz (12–15 years), or pebble (15–20+ years).\n" +
      "3. The pool is drained and the old surface is prepared (chipped out or acid etched).\n" +
      "4. New surface material is applied by hand-troweling.\n" +
      "5. Pool is filled and startup chemistry is carefully managed.\n" +
      "6. Brush the pool 2x daily for the first 2 weeks to remove plaster dust.\n" +
      "7. Maintain precise chemistry during the 30-day curing period.",
    whyItMatters: "The pool surface is the barrier between the pool water and the concrete shell. A deteriorated surface allows water to penetrate the shell, causing structural damage and constant chemistry problems.",
    whatHappensIfSkipped: "Severely deteriorated surfaces harbor algae, cut swimmers' feet, and lose structural integrity. Water penetrates the shell, causing delamination that makes resurfacing more expensive. Shell repair adds $2,000–$5,000 to resurfacing cost.",
    toolsNeeded: [],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Timely resurfacing ($5,000–$15,000) vs delayed with shell repair ($7,000–$20,000)",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.landscape.pool_pump.clean_basket",
    taskName: "Clean Pool Pump Basket",
    category: "landscape",
    applicableSystemIds: ["landscape.pool_pump"],
    frequencyType: "interval",
    frequencyValue: 7,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 5,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Empty the pump strainer basket to maintain proper flow and prevent pump damage.",
    detailedInstructions:
      "1. Turn off the pool pump.\n" +
      "2. Close the suction-side valve(s) if equipped.\n" +
      "3. Open the pump lid (may need to release the locking ring or unscrew the lid).\n" +
      "4. Remove the strainer basket and dump out debris.\n" +
      "5. Rinse the basket with a hose.\n" +
      "6. Check the basket for cracks — a cracked basket lets debris into the impeller.\n" +
      "7. Reinstall the basket, verify the lid O-ring is seated, and close the lid.\n" +
      "8. Open the valves and restart the pump — verify it primes within 1–2 minutes.",
    whyItMatters: "A clogged pump basket starves the pump of water, causing it to run dry and overheat. Dry running destroys the pump seal and motor in minutes.",
    whatHappensIfSkipped: "Debris clogs the basket, reducing flow and causing the pump to work harder. Eventually, debris bypasses and clogs the impeller ($200–$400 repair). Running dry burns the seal ($150–$250 repair) or motor ($500–$1,000).",
    toolsNeeded: ["Garden hose"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Prevents $150–$1,000 pump seal/motor failure",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.landscape.pool_pump.inspect_seal",
    taskName: "Inspect Pool Pump Seal",
    category: "landscape",
    applicableSystemIds: ["landscape.pool_pump"],
    frequencyType: "interval",
    frequencyValue: 180,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 10,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 50, high: 100 },
    shortDescription: "Check the pump lid seal, shaft seal, and connections for leaks that indicate seal failure.",
    detailedInstructions:
      "1. While the pump is running, look for water leaking from the pump housing.\n" +
      "2. Check the lid O-ring for cracks, flattening, or debris.\n" +
      "3. Look for water dripping from the bottom of the pump (shaft seal failure).\n" +
      "4. Check all plumbing connections for weeping.\n" +
      "5. Listen for unusual sounds: cavitation (sucking air), grinding, or high-pitched whining.\n" +
      "6. If the shaft seal is leaking, schedule replacement promptly — water reaching the motor is catastrophic.",
    whyItMatters: "Pump seals are the most common failure point. A leaking shaft seal lets water reach the motor bearings and windings, destroying the motor.",
    whatHappensIfSkipped: "A $25 shaft seal leak becomes a $500–$1,000 motor replacement if water reaches the motor. Air leaks through a bad lid O-ring reduce pump efficiency and can cause the pump to lose prime.",
    toolsNeeded: ["Flashlight"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "$25 seal replacement prevents $500–$1,000 motor failure",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.landscape.pool_pump.lubricate",
    taskName: "Lubricate Pool Pump O-Rings",
    category: "landscape",
    applicableSystemIds: ["landscape.pool_pump"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "moderate",
    estimatedTimeMinutes: 20,
    diyCost: { low: 5, high: 10 },
    proCost: { low: 50, high: 100 },
    shortDescription: "Lubricate pump lid O-ring and other seals to maintain proper seal and extend seal life.",
    detailedInstructions:
      "1. Turn off the pump and close the suction valve.\n" +
      "2. Open the pump lid and remove the O-ring.\n" +
      "3. Clean the O-ring and its groove of any debris.\n" +
      "4. Inspect the O-ring for cracks, flat spots, or stretching.\n" +
      "5. Apply a thin coat of silicone-based O-ring lubricant (NOT petroleum-based).\n" +
      "6. Reseat the O-ring in its groove.\n" +
      "7. Close the lid, open valves, and restart the pump — verify no air leaks.",
    whyItMatters: "O-rings dry out and crack over time, especially in the Florida sun. Regular lubrication keeps them pliable and extends their life, maintaining a proper seal.",
    whatHappensIfSkipped: "Dry O-rings crack and allow air into the system. Air leaks reduce pump efficiency, cause noise, and can lead to loss of prime. Chronic air leaks can damage the pump motor.",
    toolsNeeded: [],
    suppliesNeeded: ["Silicone O-ring lubricant (NOT petroleum-based)"],
    careKitProductIds: ["oring_lubricant"],
    estimatedSavings: "$5–10 lubricant extends O-ring life and prevents air leak problems",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.landscape.pool_heater.inspect",
    taskName: "Inspect Pool Heater",
    category: "landscape",
    applicableSystemIds: ["landscape.pool_heater"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    seasonalMonths: [9, 10],
    difficulty: "moderate",
    estimatedTimeMinutes: 30,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 100, high: 250 },
    shortDescription: "Inspect pool heater for proper operation, corrosion, and gas/electrical safety before heating season.",
    detailedInstructions:
      "1. Visually inspect the heater cabinet for corrosion, pest nests, and debris.\n" +
      "2. Check the exhaust vent for blockages (leaves, nests, rust).\n" +
      "3. For gas heaters: inspect the gas line connection for leaks (soapy water test).\n" +
      "4. Check for soot around the burner area (indicates combustion problems).\n" +
      "5. Start the heater and verify it ignites and heats properly.\n" +
      "6. Check the temperature display matches actual water temperature.\n" +
      "7. For heat pumps: check the evaporator coil for debris and clean if needed.",
    whyItMatters: "Pool heaters contain gas burners or high-voltage electrical components. Annual inspection ensures safe operation and catches developing problems before peak heating season.",
    whatHappensIfSkipped: "Gas heaters with blocked vents produce carbon monoxide. Corroded heat exchangers leak water into the firebox. Neglected heaters fail when you need them most. Heat exchanger replacement: $800–$2,000.",
    toolsNeeded: ["Flashlight", "Garden hose"],
    suppliesNeeded: ["Soapy water (for gas leak test)"],
    careKitProductIds: [],
    estimatedSavings: "Prevents $800–$2,000 heat exchanger failure and ensures safe operation",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.landscape.pool_heater.descale",
    taskName: "Descale Pool Heater",
    category: "landscape",
    applicableSystemIds: ["landscape.pool_heater"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "moderate",
    estimatedTimeMinutes: 60,
    diyCost: { low: 15, high: 40 },
    proCost: { low: 150, high: 300 },
    shortDescription: "Remove scale buildup from the heat exchanger to maintain heating efficiency and prevent damage.",
    detailedInstructions:
      "1. Turn off the heater and let it cool completely.\n" +
      "2. Close the isolation valves on either side of the heater.\n" +
      "3. Connect a submersible pump and bucket to circulate descaling solution through the heat exchanger.\n" +
      "4. Fill the bucket with water and add pool heater descaling solution per directions.\n" +
      "5. Circulate the solution for 30–45 minutes.\n" +
      "6. Flush with clean water for 15 minutes.\n" +
      "7. Open isolation valves, restore flow, and test heater operation.",
    whyItMatters: "Scale insulates the heat exchanger, forcing the heater to work harder and longer. A scaled heat exchanger can overheat and crack, requiring expensive replacement.",
    whatHappensIfSkipped: "Scale reduces heating efficiency by 25–50%, wasting $200–$500/year in gas or electricity. Severe scale causes the heat exchanger to overheat and crack ($800–$2,000 replacement). Scale is the #1 killer of pool heaters.",
    toolsNeeded: ["Submersible pump", "5-gallon bucket", "Hoses"],
    suppliesNeeded: ["Pool heater descaling solution"],
    careKitProductIds: ["heater_descaler"],
    estimatedSavings: "Saves $200–$500/year in energy + prevents $800–$2,000 heat exchanger failure",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.landscape.pool_heater.clean",
    taskName: "Clean Pool Heater",
    category: "landscape",
    applicableSystemIds: ["landscape.pool_heater"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "moderate",
    estimatedTimeMinutes: 45,
    diyCost: { low: 0, high: 10 },
    proCost: { low: 100, high: 200 },
    shortDescription: "Clean the pool heater cabinet, burner assembly, and air intake for safe, efficient operation.",
    detailedInstructions:
      "1. Turn off the heater and gas supply (or electrical disconnect for heat pumps).\n" +
      "2. Remove the cabinet panels to access the interior.\n" +
      "3. Remove leaves, debris, and spider webs from the cabinet.\n" +
      "4. For gas heaters: carefully vacuum or brush the burner tray area.\n" +
      "5. For heat pumps: clean the evaporator coil with a garden hose (gentle pressure from inside out).\n" +
      "6. Check for rust and corrosion on all components.\n" +
      "7. Reassemble, restore gas/power, and test operation.",
    whyItMatters: "Debris and pests inside the heater cabinet can block airflow, cause ignition problems, and create fire hazards. Clean heaters run safely and efficiently.",
    whatHappensIfSkipped: "Debris on burners causes incomplete combustion and soot buildup. Spider webs can block gas orifices. Blocked airflow on heat pumps reduces efficiency by 30%+. Pest nests can cause electrical shorts.",
    toolsNeeded: ["Screwdriver", "Vacuum or shop vac", "Garden hose"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Maintains heater efficiency and safety; prevents $500–$1,500 in avoidable repairs",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.landscape.screen_enclosure.inspect",
    taskName: "Inspect Screen Enclosure",
    category: "landscape",
    applicableSystemIds: ["landscape.screen_enclosure"],
    frequencyType: "interval",
    frequencyValue: 180,
    frequencyUnit: "days",
    climateAdjustments: [
      { climateZone: "hot_humid", adjustedFrequencyDays: 120, reason: "Florida sun, storms, and hurricanes degrade screens faster; inspect before and after storm season" },
    ],
    difficulty: "easy",
    estimatedTimeMinutes: 20,
    diyCost: { low: 0, high: 0 },
    proCost: { low: 0, high: 0 },
    shortDescription: "Inspect screen enclosure for tears, loose screens, structural damage, and hardware condition.",
    detailedInstructions:
      "1. Walk the perimeter and look at all screen panels for tears or holes.\n" +
      "2. Check the spline (rubber gasket) that holds the screen in the frame channels.\n" +
      "3. Look for bent or damaged frame members.\n" +
      "4. Check all screws and fasteners at structural connections.\n" +
      "5. Verify the screen door closes and latches properly.\n" +
      "6. Check the roof panels for sagging screens that collect water and debris.\n" +
      "7. After any storm, do an immediate re-inspection.",
    whyItMatters: "Even a small tear allows mosquitoes and bugs to enter the screened area, defeating the purpose. Structural damage that goes unrepaired worsens rapidly in wind.",
    whatHappensIfSkipped: "Small tears grow with each wind event. Loose frame members can fail in storms, causing section collapse. Screen enclosure replacement: $5,000–$15,000. Partial repairs caught early: $100–$500.",
    toolsNeeded: ["Flashlight"],
    suppliesNeeded: [],
    careKitProductIds: [],
    estimatedSavings: "Early repair ($100–$500) vs section/full replacement ($2,000–$15,000)",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.landscape.screen_enclosure.clean",
    taskName: "Clean Screen Enclosure",
    category: "landscape",
    applicableSystemIds: ["landscape.screen_enclosure"],
    frequencyType: "interval",
    frequencyValue: 365,
    frequencyUnit: "days",
    difficulty: "moderate",
    estimatedTimeMinutes: 120,
    diyCost: { low: 10, high: 30 },
    proCost: { low: 150, high: 350 },
    shortDescription: "Clean screen enclosure panels and frame to remove mold, mildew, and pollen buildup.",
    detailedInstructions:
      "1. Mix a cleaning solution: warm water with a small amount of mild detergent or screen cleaner.\n" +
      "2. Wet the screens gently with a garden hose (low pressure — high pressure tears screens).\n" +
      "3. Apply cleaning solution with a soft brush or sponge on an extension pole.\n" +
      "4. Scrub gently, working from top to bottom.\n" +
      "5. Rinse thoroughly with the garden hose.\n" +
      "6. Clean the aluminum frame members with the same solution.\n" +
      "7. Check for any loose spline or tears while cleaning.",
    whyItMatters: "Mold and pollen buildup on screens blocks airflow, reduces visibility, and accelerates screen degradation. Regular cleaning extends screen life significantly.",
    whatHappensIfSkipped: "Mold and algae eat into screen material, weakening it. Pollen and dust reduce airflow by 30–50%. Screens become opaque and unsightly. Premature full re-screening: $2,000–$5,000.",
    toolsNeeded: ["Garden hose", "Soft brush on extension pole", "Bucket"],
    suppliesNeeded: ["Mild detergent or screen cleaner"],
    careKitProductIds: [],
    estimatedSavings: "Extends screen life, delaying $2,000–$5,000 re-screening by 5+ years",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    taskId: "task.landscape.screen_enclosure.patch_screen",
    taskName: "Patch Screen Tears",
    category: "landscape",
    applicableSystemIds: ["landscape.screen_enclosure"],
    frequencyType: "condition_based",
    frequencyValue: 180,
    frequencyUnit: "days",
    difficulty: "easy",
    estimatedTimeMinutes: 20,
    diyCost: { low: 5, high: 15 },
    proCost: { low: 50, high: 100 },
    shortDescription: "Repair small screen tears and holes with patch kits or re-screening individual panels.",
    detailedInstructions:
      "1. For small tears (under 2 inches): apply a self-adhesive screen patch over the tear.\n" +
      "2. For larger tears: remove the spline from the damaged panel.\n" +
      "3. Cut new screen material 2 inches larger than the frame opening.\n" +
      "4. Lay the new screen over the frame and press the spline into the channel with a spline roller.\n" +
      "5. Work opposite sides, pulling the screen taut as you go.\n" +
      "6. Trim excess screen with a utility knife.\n" +
      "7. For fiberglass screen, use a crease tool if available for a tighter fit.",
    whyItMatters: "A $5 screen patch takes 10 minutes and keeps bugs out. Left unrepaired, the tear grows with every wind gust, eventually requiring a full panel re-screen.",
    whatHappensIfSkipped: "Small tears grow into large holes. Mosquitoes, no-see-ums, and other pests enter the screened area. Eventually the entire panel fails, requiring replacement ($50–$150 per panel professionally installed).",
    toolsNeeded: ["Spline roller", "Utility knife", "Flathead screwdriver (for spline removal)"],
    suppliesNeeded: ["Screen patch kit or screen material", "Spline (if re-screening)"],
    careKitProductIds: ["screen_patch_kit"],
    estimatedSavings: "$5 patch prevents $50–$150 professional panel replacement",
    source: "industry_standard",
    isActive: true,
    lastUpdated: Date.now(),
  },
];

// ============================================================
// COMBINED EXPORT
// ============================================================

export const INTERIOR_OTHER_TASKS: TaskCatalogEntry[] = [
  ...INTERIOR_TASKS,
  ...APPLIANCE_TASKS,
  ...SAFETY_TASKS,
  ...STRUCTURAL_TASKS,
  ...LANDSCAPE_TASKS,
];
