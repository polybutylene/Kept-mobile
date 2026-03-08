import { internalMutation } from "../_generated/server";

// ─────────────────────────────────────────────────────────────────────────────
// PLUMBING Maintenance Tasks — 28 tasks across 8 component types
// Source: Industry standards (IAPMO, PHCC), manufacturer guidelines,
//         and field experience from thousands of residential service calls.
// Cost basis: 2025 US National Average
// ─────────────────────────────────────────────────────────────────────────────

const plumbingMaintenanceTasks = [
  // ================================================================
  // TANK WATER HEATER  (componentTemplateKey: "tank_water_heater")
  // ================================================================
  {
    key: "plumb_twh_001",
    componentTemplateKey: "tank_water_heater",
    systemCategory: "plumbing",
    name: "Flush Sediment from Tank",
    description:
      "Drain 3-5 gallons from the tank through the drain valve to remove sediment buildup. In hard-water areas, calcium and mineral deposits accumulate on the tank bottom, insulating the burner from the water and dramatically reducing efficiency.",
    whyItMatters:
      "Sediment acts as an insulating blanket between the burner and the water. Your gas bill creeps up, the tank overheats the bottom steel, and you hear popping and rumbling — that's steam bubbles trapped under a layer of calcium. Left unchecked, the bottom steel weakens and the tank fails years early.",
    instructions: [
      "Turn the gas valve to 'pilot' or flip the electric breaker off — never drain with the burner firing",
      "Connect a garden hose to the drain valve at the bottom of the tank",
      "Run the hose to a floor drain, utility sink, or outside — the water will be scalding hot",
      "Open the drain valve (use a flathead screwdriver if it's a slotted plastic valve)",
      "Open the T&P relief valve lever or a hot water faucet upstairs to break the vacuum",
      "Let 3-5 gallons drain until the water runs mostly clear",
      "If the water is very cloudy or has visible chunks, drain the entire tank and refill",
      "Close the drain valve, close the T&P valve, and let the tank refill completely",
      "Open a hot water faucet upstairs and wait until water flows steadily (tank is full)",
      "Restore gas or electric power — verify the pilot or burner relights",
      "Check the drain valve for drips after closing — a common failure point on older tanks",
    ],
    frequency: {
      intervalMonths: 6,
      seasonalAdjustments: {
        note: "Every 6 months for standard water. Every 3 months in hard-water areas (over 7 gpg). Annual may suffice with a water softener in place.",
      },
      triggerConditions: [
        "Rumbling or popping sounds from the tank",
        "Hot water takes longer to recover",
        "Discolored hot water",
        "Higher gas or electric bills with no other explanation",
      ],
    },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 30,
    toolsRequired: [
      "garden hose",
      "flathead screwdriver (for plastic drain valves)",
      "work gloves (water is scalding)",
      "bucket (if no floor drain nearby)",
    ],
    materialsCost: { low: 0, high: 10 },
    professionalCost: { low: 100, high: 200 },
    skipConsequences: {
      shortTerm:
        "Popping and rumbling noises during heating cycles; gradual increase in energy bills as sediment insulates the heat source",
      longTerm:
        "Tank bottom overheats and weakens, leading to premature tank failure and potential flooding; sediment clogs the drain valve permanently, making future draining impossible without replacement",
      costOfNeglect:
        "A $0 flush every 6 months prevents a $1,200-$2,500 premature tank replacement and potential water damage",
    },
    safetyNotes: [
      "Water from the drain valve is scalding hot (120-140°F+) — wear gloves and keep children and pets away",
      "Never drain the tank with the burner or element on — exposed heating elements burn out instantly without water",
      "If the drain valve won't close completely, you can cap the hose end temporarily and call a plumber to replace the valve",
    ],
    seasonalRelevance: ["spring", "fall"],
    priority: "high" as const,
    tags: [
      "water-heater",
      "sediment",
      "flush",
      "diy",
      "semi-annual",
      "efficiency",
      "tank",
    ],
  },
  {
    key: "plumb_twh_002",
    componentTemplateKey: "tank_water_heater",
    systemCategory: "plumbing",
    name: "Inspect and Replace Anode Rod",
    description:
      "Check the sacrificial anode rod that protects the steel tank from corrosion. The anode rod is designed to corrode instead of the tank walls — once it's consumed, the tank itself starts rusting from the inside out.",
    whyItMatters:
      "The anode rod is the single most important factor in how long your water heater lasts. A $25-$50 anode rod replacement can add 3-5 years to a tank's life. Most homeowners have never even heard of it, and most tanks fail because the anode was never checked.",
    instructions: [
      "Turn off the gas valve or electric breaker",
      "Close the cold water supply valve to the tank",
      "Open a hot water faucet to relieve pressure",
      "Locate the anode rod — usually a hex-head fitting on top of the tank (sometimes hidden under a plastic cap)",
      "Use a 1-1/16 inch socket with a breaker bar to loosen the anode rod — it may be very tight",
      "Have a helper brace the tank (or wedge it against a wall) to prevent the tank from spinning",
      "Pull the rod straight up out of the tank — note the length and diameter",
      "Inspect the rod: if it's less than 1/2 inch thick or has 6+ inches of bare wire exposed, replace it",
      "Apply Teflon tape to the threads of the new anode rod",
      "Insert the new rod and tighten securely (do not over-torque)",
      "For low-clearance installations, use a flexible/segmented anode rod",
      "Restore the cold water supply, close the hot faucet when water flows, and restore power",
    ],
    frequency: {
      intervalMonths: 36,
      seasonalAdjustments: {
        note: "Check every 3 years for standard water. Every 1-2 years in hard-water or softened-water areas (softened water is more aggressive on anodes). Replace when more than 50% consumed.",
      },
      triggerConditions: [
        "Rotten egg smell in hot water (bacteria on depleted anode)",
        "Rusty hot water",
        "Tank is over 5 years old and anode has never been checked",
      ],
    },
    difficulty: "advanced" as const,
    diyFriendly: true,
    estimatedMinutes: 30,
    toolsRequired: [
      "1-1/16 inch deep socket",
      "breaker bar or long-handled ratchet",
      "Teflon tape",
      "replacement anode rod (magnesium or aluminum/zinc)",
    ],
    materialsCost: { low: 20, high: 50 },
    professionalCost: { low: 150, high: 300 },
    skipConsequences: {
      shortTerm:
        "Once the anode is consumed, the tank lining begins corroding; rotten egg smell from sulfate-reducing bacteria colonizing the depleted rod",
      longTerm:
        "Tank interior rusts through, causing leaks and catastrophic tank failure; premature replacement of the entire water heater 3-5 years early",
      costOfNeglect:
        "A $25-$50 anode rod every 3-5 years prevents a $1,200-$2,500 premature tank replacement",
    },
    safetyNotes: [
      "The anode rod can be extremely tight — brace the tank to prevent it from tipping or spinning",
      "If using a powered impact wrench, be very careful not to crack the fitting in the tank top",
      "Powered anodes (electronic) are an alternative that never need replacement but cost $100-$200",
    ],
    seasonalRelevance: ["spring", "fall"],
    priority: "high" as const,
    tags: [
      "water-heater",
      "anode-rod",
      "corrosion",
      "diy",
      "tank",
      "lifespan",
    ],
  },
  {
    key: "plumb_twh_003",
    componentTemplateKey: "tank_water_heater",
    systemCategory: "plumbing",
    name: "Test T&P Relief Valve",
    description:
      "Test the temperature and pressure (T&P) relief valve by lifting the lever to verify it discharges water freely. This valve is the primary safety device preventing tank explosion from runaway pressure or temperature.",
    whyItMatters:
      "The T&P valve is the only thing standing between your water heater and a catastrophic steam explosion. A tank failure without a working T&P valve can launch a water heater through a roof — this is not an exaggeration. It happens every year.",
    instructions: [
      "Verify the discharge pipe from the T&P valve runs downward to within 6 inches of the floor or to a drain — never capped or plugged",
      "Place a bucket under the discharge pipe or verify it terminates at a drain",
      "Lift the T&P valve lever quickly and fully — you should hear water rush into the discharge pipe",
      "Release the lever — the valve should snap shut and stop flowing",
      "If the valve does not discharge water, it is stuck closed — REPLACE IMMEDIATELY",
      "If the valve drips continuously after testing, it may need replacement ($15-$30 part)",
      "Check the valve for corrosion, mineral deposits, or a manufacture date older than 5 years",
      "Verify the discharge pipe is the correct size (usually 3/4 inch) and not reduced",
    ],
    frequency: {
      intervalMonths: 12,
      seasonalAdjustments: {
        note: "Test annually. Replace the T&P valve every 5 years regardless of test results as a safety precaution.",
      },
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 5,
    toolsRequired: ["bucket", "none for basic test"],
    materialsCost: { low: 0, high: 30 },
    professionalCost: { low: 75, high: 150 },
    skipConsequences: {
      shortTerm:
        "A stuck-closed T&P valve provides zero protection against pressure buildup; a leaking T&P valve wastes water and indicates possible tank pressure issues",
      longTerm:
        "Catastrophic tank failure risk — a water heater without a functioning T&P valve can explode with enough force to destroy a home; liability risk if damage occurs with a known failed valve",
      costOfNeglect:
        "A $15-$30 T&P valve replacement is the cheapest insurance against a catastrophic event",
    },
    safetyNotes: [
      "The discharge pipe must NEVER be capped, plugged, or have a valve installed on it",
      "Water discharged during testing is scalding hot — use caution",
      "If you see a drip from the T&P valve between tests, it may indicate excessive tank pressure from a failed expansion tank or thermal expansion issue",
    ],
    seasonalRelevance: ["spring"],
    priority: "critical" as const,
    tags: [
      "water-heater",
      "t&p-valve",
      "safety",
      "diy",
      "annual",
      "tank",
      "pressure",
    ],
  },
  {
    key: "plumb_twh_004",
    componentTemplateKey: "tank_water_heater",
    systemCategory: "plumbing",
    name: "Inspect Flue and Venting (Gas Models)",
    description:
      "Inspect the draft hood, flue pipe, and chimney connection on atmospheric-vent gas water heaters for proper draft, blockages, and signs of backdrafting.",
    whyItMatters:
      "A water heater that backdrafts pushes carbon monoxide into your living space. Unlike a furnace that runs in cycles, a water heater can backdraft for hours during a long recovery — putting out CO the entire time. Proper draft is literally a life-safety issue.",
    instructions: [
      "With the water heater firing, hold a lit match or incense stick near the draft hood opening at the top of the unit",
      "The flame or smoke should be drawn UP into the draft hood — not pushed away or pulled horizontally",
      "If the flame is pushed away or goes out, the unit is backdrafting — this is a CO hazard",
      "Visually inspect the entire flue pipe from the draft hood to the chimney or exterior termination",
      "Check that all flue joints are secured with at least 3 screws per joint",
      "Verify the flue pipe maintains a 1/4 inch per foot upward slope toward the chimney",
      "Look for rust holes, corrosion, or disconnected sections in the flue pipe",
      "Check for melted plastic or scorch marks near the draft hood (indicates combustion issues)",
      "Check the area around the base of the water heater for soot or black marks (rollout)",
      "Verify the combustion air supply is adequate — gas water heaters need airflow to burn safely",
    ],
    frequency: {
      intervalMonths: 12,
      triggerConditions: [
        "CO detector alarm",
        "Soot around the draft hood or burner area",
        "Smell of exhaust near the water heater",
        "Excessive condensation on windows near the unit",
      ],
    },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 15,
    toolsRequired: [
      "match or incense stick (for draft test)",
      "flashlight",
      "screwdriver",
    ],
    materialsCost: { low: 0, high: 20 },
    professionalCost: { low: 75, high: 200 },
    skipConsequences: {
      shortTerm:
        "Backdrafting water heater silently releases carbon monoxide into the home; poor combustion reduces efficiency and accelerates burner wear",
      longTerm:
        "Chronic low-level CO exposure causes headaches, fatigue, and long-term health damage; corroded flue pipes can separate and vent CO directly into the utility room or attic",
      costOfNeglect:
        "Carbon monoxide is odorless and lethal — a simple draft test takes 30 seconds and could save lives",
    },
    safetyNotes: [
      "Every home with a gas water heater must have CO detectors on every level",
      "If you detect backdrafting, turn off the gas to the water heater immediately and call a professional",
      "Common causes of backdrafting: exhaust fans creating negative pressure, blocked chimney, disconnected flue pipe",
    ],
    seasonalRelevance: ["fall"],
    priority: "critical" as const,
    tags: [
      "water-heater",
      "flue",
      "venting",
      "safety",
      "co",
      "gas",
      "annual",
      "tank",
    ],
  },
  {
    key: "plumb_twh_005",
    componentTemplateKey: "tank_water_heater",
    systemCategory: "plumbing",
    name: "Check Thermal Expansion Tank",
    description:
      "Inspect the thermal expansion tank on the cold water supply line for proper pre-charge pressure and signs of failure. The expansion tank absorbs pressure buildup when water is heated in a closed system.",
    whyItMatters:
      "In a closed plumbing system (one with a check valve, pressure-reducing valve, or backflow preventer), heated water has nowhere to expand. Without a functioning expansion tank, every heating cycle sends a pressure spike through the entire system — stressing pipes, fittings, and the T&P valve.",
    instructions: [
      "Locate the expansion tank — a small (2-5 gallon) tank on the cold water line near the water heater",
      "Tap the tank with your knuckle — the top half should sound hollow (air) and the bottom should sound solid (water)",
      "If the entire tank sounds solid (waterlogged), the bladder has failed — replace the tank",
      "Check for rust or corrosion on the tank and fittings",
      "Check for water dripping from the tank or the Schrader valve on top",
      "Using a tire pressure gauge, check the air pre-charge on the Schrader valve (with system pressure off)",
      "Pre-charge should match your home's incoming water pressure (typically 40-60 psi)",
      "If the pre-charge is low, add air with a bicycle pump to match supply pressure",
      "Verify the tank is properly supported — a waterlogged tank is heavy and can stress the pipe connection",
    ],
    frequency: {
      intervalMonths: 12,
      triggerConditions: [
        "T&P valve dripping or discharging periodically",
        "Water hammer when valves close",
        "Visible rust or leaks on the expansion tank",
      ],
    },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 10,
    toolsRequired: [
      "tire pressure gauge",
      "bicycle pump or air compressor",
    ],
    materialsCost: { low: 0, high: 50 },
    professionalCost: { low: 75, high: 200 },
    skipConsequences: {
      shortTerm:
        "T&P valve discharges periodically from excess pressure; water hammer and banging pipes when fixtures close",
      longTerm:
        "Constant pressure cycling fatigues pipe joints and fittings, leading to leaks; premature T&P valve failure from repeated pressure relief",
      costOfNeglect:
        "A $40-$80 expansion tank replacement prevents cumulative pressure damage to your entire plumbing system",
    },
    safetyNotes: [
      "Turn off water supply and relieve pressure before checking the Schrader valve pre-charge",
      "A waterlogged expansion tank can weigh 20+ lbs — ensure the mounting pipe can handle the weight",
    ],
    seasonalRelevance: ["spring"],
    priority: "medium" as const,
    tags: [
      "water-heater",
      "expansion-tank",
      "pressure",
      "diy",
      "annual",
      "tank",
    ],
  },

  // ================================================================
  // TANKLESS WATER HEATER  (componentTemplateKey: "tankless_water_heater")
  // ================================================================
  {
    key: "plumb_tkl_001",
    componentTemplateKey: "tankless_water_heater",
    systemCategory: "plumbing",
    name: "Descale and Flush with Vinegar",
    description:
      "Flush the heat exchanger with food-grade white vinegar to dissolve mineral scale buildup. Scale inside a tankless unit chokes flow, reduces efficiency, and will eventually trigger an error code and shutdown.",
    whyItMatters:
      "Tankless water heaters concentrate minerals at the heat exchanger surface where temperatures are highest. In hard-water areas (over 7 gpg), scale can reduce flow by 50% in under a year. Most manufacturer warranties require documented annual descaling to remain valid.",
    instructions: [
      "Turn off the gas supply or electrical breaker to the unit",
      "Close both the cold water inlet and hot water outlet isolation valves",
      "Connect a submersible pump and hoses to the service ports (cold side pump-in, hot side return to bucket)",
      "Fill a 5-gallon bucket with 4 gallons of undiluted food-grade white vinegar",
      "Place the pump in the bucket, connect the return hose to drain back into the bucket",
      "Open the service port valves and turn on the pump — vinegar circulates through the heat exchanger",
      "Let the vinegar circulate for 45-60 minutes (longer for heavy scale or hard water)",
      "After circulating, turn off the pump and drain the vinegar from the unit",
      "Close the service port valves, open the cold inlet valve, and flush fresh water through the unit for 5 minutes",
      "Open the hot outlet valve and restore gas or power",
      "Run a hot water fixture and verify normal flow rate and temperature",
      "Dispose of the spent vinegar — it will be full of dissolved calcium and mineral deposits",
    ],
    frequency: {
      intervalMonths: 12,
      seasonalAdjustments: {
        note: "Annual for water hardness under 7 gpg. Every 6 months for 7-12 gpg. Every 3-4 months for over 12 gpg. Installing a water softener upstream dramatically reduces descaling frequency.",
      },
      triggerConditions: [
        "Error code indicating scale or flow restriction",
        "Reduced hot water flow rate",
        "Unit cycles on and off during use (minimum flow not met due to scale)",
        "Temperature fluctuations (cold water sandwich effect)",
      ],
    },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 90,
    toolsRequired: [
      "tankless flush kit (submersible pump + two hoses)",
      "5-gallon bucket",
      "4 gallons food-grade white vinegar",
      "adjustable wrench (for service port caps)",
    ],
    materialsCost: { low: 10, high: 25 },
    professionalCost: { low: 150, high: 300 },
    skipConsequences: {
      shortTerm:
        "Reduced hot water flow rate as scale restricts the heat exchanger passages; unit error codes and shutdowns",
      longTerm:
        "Scale permanently damages the heat exchanger, requiring a $500-$1,200 replacement; warranty voided without documented descaling; system fails years before expected lifespan",
      costOfNeglect:
        "$10-$25 in vinegar annually prevents a $500-$1,200 heat exchanger replacement and preserves your warranty",
    },
    safetyNotes: [
      "Use only food-grade white vinegar or manufacturer-approved descaling solution — never use CLR, muriatic acid, or other harsh chemicals that can damage the heat exchanger",
      "Always close both isolation valves before opening service ports",
      "Keep the flush kit — it pays for itself after the first use vs. a $150-$300 professional service",
    ],
    seasonalRelevance: ["spring", "fall"],
    priority: "critical" as const,
    tags: [
      "tankless",
      "descale",
      "flush",
      "diy",
      "annual",
      "water-heater",
      "scale",
    ],
  },
  {
    key: "plumb_tkl_002",
    componentTemplateKey: "tankless_water_heater",
    systemCategory: "plumbing",
    name: "Clean Inlet Water Filter Screen",
    description:
      "Remove and clean the inlet water filter screen on the cold water supply side of the tankless unit. This small mesh screen traps debris before it enters the heat exchanger.",
    whyItMatters:
      "After any plumbing work, municipal main breaks, or if you're on well water, sediment accumulates in this small screen. A partially clogged screen reduces flow below the unit's minimum activation threshold, causing intermittent cold water — one of the most common tankless complaints.",
    instructions: [
      "Turn off the cold water isolation valve to the unit",
      "Place a towel under the unit to catch drips",
      "Locate the inlet filter — usually at the cold water connection on the bottom of the unit",
      "Remove the filter housing with an adjustable wrench or by hand (varies by manufacturer)",
      "Pull out the mesh screen and inspect for sediment, debris, or scale",
      "Rinse the screen under running water, using a soft brush to remove stubborn deposits",
      "Soak in vinegar for 15 minutes if mineral deposits are visible on the mesh",
      "Reinstall the clean screen and filter housing — hand-tight plus a quarter turn",
      "Open the cold water isolation valve and check for leaks at the filter housing",
    ],
    frequency: {
      intervalMonths: 12,
      seasonalAdjustments: {
        note: "Every 6 months on well water or in areas with older municipal pipes. Check immediately after any nearby water main work.",
      },
      triggerConditions: [
        "Reduced hot water flow",
        "Unit fails to activate on low-flow fixtures",
        "After municipal water main breaks or repairs",
        "After well pump or plumbing work",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 10,
    toolsRequired: [
      "adjustable wrench",
      "soft brush",
      "towel",
    ],
    materialsCost: { low: 0, high: 5 },
    professionalCost: { low: 75, high: 150 },
    skipConsequences: {
      shortTerm:
        "Reduced flow rate causes the unit to fail to activate or cycle on and off; intermittent cold water during showers",
      longTerm:
        "Debris bypasses the clogged screen and enters the heat exchanger, causing internal damage; unit error codes become more frequent",
      costOfNeglect:
        "A 5-minute filter cleaning prevents the most common tankless complaint: unexplained cold water",
    },
    safetyNotes: [
      "Always close the cold water isolation valve before removing the filter",
      "Do not over-tighten the filter housing — hand-tight plus a quarter turn is sufficient",
    ],
    seasonalRelevance: ["spring"],
    priority: "medium" as const,
    tags: [
      "tankless",
      "filter",
      "cleaning",
      "diy",
      "annual",
      "water-heater",
    ],
  },
  {
    key: "plumb_tkl_003",
    componentTemplateKey: "tankless_water_heater",
    systemCategory: "plumbing",
    name: "Inspect Venting System (Gas Models)",
    description:
      "Inspect the stainless steel or PVC venting system on gas tankless units for proper connections, slope, termination clearance, and signs of condensation damage.",
    whyItMatters:
      "Gas tankless units produce more condensate than tank water heaters because they extract more heat from combustion gases. Acidic condensate (pH 3-4) dripping back into the unit causes internal corrosion. Improper vent termination can also allow exhaust re-entry into the home.",
    instructions: [
      "Trace the vent pipe from the unit to the exterior termination point",
      "Check all vent joints for tight connections and proper sealant (high-temp silicone or approved sealant)",
      "Verify the correct vent material is used (stainless steel Category III for most non-condensing; PVC or CPVC for condensing units)",
      "Confirm the vent maintains proper slope — concentric vents typically slope back toward the unit to drain condensate",
      "Inspect the exterior vent termination for blockage (bird nests, insect nests, ice, debris)",
      "Verify termination clearances: typically 12 inches from any window, door, or air intake",
      "Check for condensation drips or water stains along the vent run",
      "For condensing units, verify the condensate drain is clear and draining properly",
      "Look for any discoloration or heat damage near vent penetrations through walls or ceilings",
      "Verify the air intake screen (if separate) is clear and unobstructed",
    ],
    frequency: {
      intervalMonths: 12,
      triggerConditions: [
        "Exhaust odor near the unit or exterior vent",
        "Error codes related to combustion or venting",
        "After severe weather or ice storms",
      ],
    },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 15,
    toolsRequired: [
      "flashlight",
      "step ladder (for exterior termination inspection)",
    ],
    materialsCost: { low: 0, high: 30 },
    professionalCost: { low: 100, high: 250 },
    skipConsequences: {
      shortTerm:
        "Blocked vent causes combustion errors and system shutdown; condensate backup corrodes internal components",
      longTerm:
        "CO leakage from degraded vent joints; premature heat exchanger failure from condensate corrosion; ice blockage in winter can crack vent pipes",
      costOfNeglect:
        "Vent-related failures often void the manufacturer warranty",
    },
    safetyNotes: [
      "Never substitute PVC venting on a non-condensing gas tankless unit — the exhaust temperatures can melt PVC and release toxic fumes",
      "If you smell exhaust near the unit, shut off the gas and call a professional immediately",
    ],
    seasonalRelevance: ["fall"],
    priority: "high" as const,
    tags: [
      "tankless",
      "venting",
      "gas",
      "safety",
      "co",
      "annual",
      "water-heater",
    ],
  },

  // ================================================================
  // SUMP PUMP  (componentTemplateKey: "sump_pump")
  // ================================================================
  {
    key: "plumb_sp_001",
    componentTemplateKey: "sump_pump",
    systemCategory: "plumbing",
    name: "Test Float Switch and Pump Operation",
    description:
      "Pour water into the sump pit to verify the float switch activates the pump and water is discharged properly. The float switch is the most common failure point on sump pumps.",
    whyItMatters:
      "Your sump pump sits idle for weeks or months at a time, then needs to work flawlessly during the heaviest rainstorm of the year. A stuck float switch discovered during a downpour means a flooded basement — discovered during a test means a $15 replacement part.",
    instructions: [
      "Unplug the pump and inspect the float switch for debris, mineral buildup, or tangled wires",
      "Clean any debris from the float and its pivot/arm mechanism",
      "Plug the pump back in",
      "Slowly pour 5 gallons of water into the sump pit using a bucket",
      "Watch the float rise — the pump should activate before water reaches 8-12 inches from the top",
      "Verify water is being pumped out and the pit empties",
      "The pump should shut off automatically as the water level drops",
      "If the pump runs but doesn't shut off, the float is stuck in the 'on' position",
      "If the pump doesn't activate at all, test the outlet with another device to rule out electrical issues",
      "Listen for unusual sounds — grinding, rattling, or excessive vibration indicate impeller or bearing problems",
    ],
    frequency: {
      intervalMonths: 3,
      seasonalAdjustments: {
        note: "Test quarterly, but add an extra test before spring rainy season and before fall heavy rains. Monthly testing during peak rain season is ideal.",
      },
      triggerConditions: [
        "Before predicted heavy rainfall",
        "After extended dry periods (pump may have seized)",
        "Unusual sounds from the pit area",
        "Musty smell in the basement",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 10,
    toolsRequired: [
      "5-gallon bucket",
      "flashlight",
    ],
    materialsCost: { low: 0, high: 0 },
    professionalCost: { low: 75, high: 150 },
    skipConsequences: {
      shortTerm:
        "Pump fails to activate during rain, leading to basement flooding; stuck float allows pit to overflow",
      longTerm:
        "Chronic basement water damage including mold growth, foundation damage, and destroyed belongings; seized pump motor from inactivity requires full replacement",
      costOfNeglect:
        "A free 10-minute test prevents $5,000-$30,000+ in basement flood damage",
    },
    safetyNotes: [
      "Never reach into the sump pit while the pump is plugged in",
      "If your sump pump is on a GFCI outlet, test the GFCI button monthly — a tripped GFCI with no alarm means the pump is dead",
      "Consider a water alarm sensor in the pit as a backup alert ($15-$30)",
    ],
    seasonalRelevance: ["spring", "fall"],
    priority: "critical" as const,
    tags: [
      "sump-pump",
      "float-switch",
      "testing",
      "diy",
      "quarterly",
      "flood-prevention",
    ],
  },
  {
    key: "plumb_sp_002",
    componentTemplateKey: "sump_pump",
    systemCategory: "plumbing",
    name: "Clean Sump Pit and Pump Intake",
    description:
      "Remove the pump from the pit, clean the pit of debris, mud, and gravel, and clean the pump intake screen. Debris buildup impedes pump performance and can jam the impeller.",
    whyItMatters:
      "Over time, silt, gravel, and debris wash into the pit and accumulate around the pump intake. A clogged intake screen forces the pump to work harder and overheat, while debris in the pit can jam the float switch in the wrong position.",
    instructions: [
      "Unplug the sump pump from the electrical outlet",
      "Disconnect the discharge pipe from the pump (if a quick-disconnect fitting is installed)",
      "Lift the pump out of the pit — it will be heavy and dirty",
      "Use a wet/dry vacuum to remove all water, silt, mud, and debris from the pit",
      "Inspect the pit walls and bottom for cracks or damage",
      "Clean the pump intake screen with a garden hose — remove any wrapped hair, roots, or debris",
      "Inspect the impeller by looking into the intake — spin it by hand to verify it moves freely",
      "Clean the float switch and its mounting bracket",
      "Lower the pump back into the pit, reconnect the discharge pipe",
      "Plug in the pump and test with water to verify proper operation",
      "Check the check valve on the discharge pipe — it should rattle when shaken (ball check) or move freely (swing check)",
    ],
    frequency: {
      intervalMonths: 12,
      seasonalAdjustments: {
        note: "Clean annually in spring before the rainy season. More frequently in pits that accumulate heavy sediment or iron ochre (orange sludge).",
      },
      triggerConditions: [
        "Visible debris or sediment in the pit",
        "Pump cycling more frequently than normal",
        "Reduced pump discharge volume",
        "Orange sludge (iron ochre) visible in the pit",
      ],
    },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 45,
    toolsRequired: [
      "wet/dry vacuum",
      "garden hose",
      "rubber gloves",
      "5-gallon bucket",
      "flashlight",
    ],
    materialsCost: { low: 0, high: 10 },
    professionalCost: { low: 100, high: 250 },
    skipConsequences: {
      shortTerm:
        "Debris jams the impeller or float switch; pump overheats from restricted intake flow",
      longTerm:
        "Motor burnout from continuous overwork; iron ochre (bacterial slime) clogs the entire pit and check valve; pump replacement needed 3-5 years early",
      costOfNeglect:
        "A yearly pit cleaning extends pump life by years and ensures reliable operation when you need it most",
    },
    safetyNotes: [
      "Always unplug the pump before removing it from the pit",
      "Wear rubber gloves — sump pits can contain bacteria and sewage in combined systems",
      "If you see orange sludge (iron ochre), consider an iron ochre treatment plan — it's a bacterial issue, not just rust",
    ],
    seasonalRelevance: ["spring"],
    priority: "high" as const,
    tags: [
      "sump-pump",
      "cleaning",
      "pit",
      "diy",
      "annual",
      "flood-prevention",
    ],
  },
  {
    key: "plumb_sp_003",
    componentTemplateKey: "sump_pump",
    systemCategory: "plumbing",
    name: "Test Backup Battery and Alarm",
    description:
      "Test the battery backup sump pump system by simulating a power outage. Verify the battery is holding charge, the backup pump activates, and the alarm sounds when the primary pump fails.",
    whyItMatters:
      "The worst time for a power outage is during a severe storm — exactly when your sump pump is working its hardest. A dead backup battery discovered during a flood is heartbreaking. Batteries degrade over 2-3 years and must be tested and replaced proactively.",
    instructions: [
      "Check the battery charge indicator on the backup system panel — most have LED status lights",
      "Unplug the primary sump pump from the wall outlet to simulate a power failure",
      "Pour water into the sump pit until the backup pump activates",
      "Verify the backup pump discharges water properly",
      "Confirm the alarm sounds (audible and/or phone notification, depending on the system)",
      "Note the pump run time — a healthy battery should power the backup pump for 5-7 hours of intermittent use",
      "If the battery is more than 3 years old, replace it proactively regardless of test results",
      "Check battery terminals for corrosion — clean with a wire brush and apply dielectric grease",
      "Plug the primary pump back in and verify it resumes normal operation",
      "Top off the battery with distilled water if it's a lead-acid maintenance type (not sealed AGM)",
    ],
    frequency: {
      intervalMonths: 6,
      seasonalAdjustments: {
        note: "Test every 6 months and before every severe weather season. Replace the battery every 2-3 years — do not wait for it to fail during a storm.",
      },
      triggerConditions: [
        "Battery low alarm or indicator",
        "Before predicted severe storms",
        "Battery is over 2 years old",
        "After a power outage (check how much charge remains)",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 15,
    toolsRequired: [
      "5-gallon bucket",
      "wire brush (for terminal cleaning)",
      "distilled water (for non-sealed batteries)",
    ],
    materialsCost: { low: 0, high: 200 },
    professionalCost: { low: 100, high: 250 },
    skipConsequences: {
      shortTerm:
        "Dead battery during a power outage means zero backup flood protection; corroded terminals prevent the backup pump from activating",
      longTerm:
        "Full basement flood during the next power outage with heavy rain; insurance claims may be denied if backup system was not maintained",
      costOfNeglect:
        "A $100-$200 replacement battery every 2-3 years is trivial compared to $5,000-$30,000+ in flood damage",
    },
    safetyNotes: [
      "Lead-acid batteries produce hydrogen gas during charging — ensure the area is ventilated",
      "Wear safety glasses when handling battery terminals",
      "Plug the primary pump back in immediately after testing — don't leave your home unprotected",
    ],
    seasonalRelevance: ["spring", "fall"],
    priority: "high" as const,
    tags: [
      "sump-pump",
      "battery",
      "backup",
      "testing",
      "diy",
      "semi-annual",
      "flood-prevention",
    ],
  },
  {
    key: "plumb_sp_004",
    componentTemplateKey: "sump_pump",
    systemCategory: "plumbing",
    name: "Inspect Discharge Line and Check Valve",
    description:
      "Inspect the sump pump discharge pipe from the pump to the exterior termination point. Verify the check valve is functioning and the discharge point is clear and properly directed.",
    whyItMatters:
      "A failed check valve means every gallon the pump pushes out flows right back into the pit as soon as the pump shuts off. The pump then cycles on again, pumps the same water out, it flows back — cycling endlessly until the motor burns out. Often within days.",
    instructions: [
      "Trace the discharge pipe from the pump up and out of the home",
      "Verify the check valve is installed within 12-18 inches of the pump (vertical section)",
      "Inspect the check valve for proper orientation — the arrow should point AWAY from the pump (toward discharge)",
      "Listen for the check valve closing after the pump shuts off (a brief thud or click is normal)",
      "If you hear water flowing back into the pit after the pump stops, the check valve has failed",
      "Check the discharge pipe for leaks at all joints and connections",
      "At the exterior termination, verify water discharges at least 6-10 feet from the foundation",
      "Check that the discharge point is not blocked by landscaping, ice, or debris",
      "In winter, check for ice blockages in the discharge line — a frozen line causes the pump to run against a dead head and overheat",
      "Verify the discharge line does not connect to the sanitary sewer (illegal in most jurisdictions and causes sewer backups)",
    ],
    frequency: {
      intervalMonths: 6,
      seasonalAdjustments: {
        note: "Inspect before spring rains and again before winter to prepare for potential ice issues. Monthly exterior checks during freezing weather.",
      },
      triggerConditions: [
        "Pump cycling on and off rapidly (short-cycling)",
        "Water flowing back into the pit after pump stops",
        "Pump runs but pit level doesn't drop",
        "Freezing weather (ice blockage risk)",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 15,
    toolsRequired: [
      "flashlight",
    ],
    materialsCost: { low: 0, high: 30 },
    professionalCost: { low: 75, high: 175 },
    skipConsequences: {
      shortTerm:
        "Failed check valve causes rapid pump cycling, wasting electricity and burning out the motor; ice-blocked discharge line causes pump dead-head and overheat",
      longTerm:
        "Pump motor burns out from continuous cycling against backflow; discharge water pooling near the foundation re-enters the basement, creating an endless cycle",
      costOfNeglect:
        "A $15-$30 check valve replacement prevents a $300-$800 pump motor burnout",
    },
    safetyNotes: [
      "Never discharge sump water into the sanitary sewer — it's illegal in most jurisdictions and can cause sewage backups during heavy rain",
      "If the discharge line freezes, use a heat cable or insulation wrap as prevention in future winters",
    ],
    seasonalRelevance: ["spring", "fall"],
    priority: "high" as const,
    tags: [
      "sump-pump",
      "discharge",
      "check-valve",
      "inspection",
      "diy",
      "semi-annual",
    ],
  },

  // ================================================================
  // WELL PUMP  (componentTemplateKey: "well_pump")
  // ================================================================
  {
    key: "plumb_wp_001",
    componentTemplateKey: "well_pump",
    systemCategory: "plumbing",
    name: "Test Pressure Switch and Check Pressure Tank",
    description:
      "Verify the well pump pressure switch is cycling the pump at the correct cut-in and cut-out pressures. Check the pressure tank for proper pre-charge air pressure — the most common cause of rapid pump cycling.",
    whyItMatters:
      "A waterlogged pressure tank is the #1 well pump service call. When the bladder fails, there's no air cushion, so the pump cycles on and off every few seconds instead of running in long, healthy cycles. This kills well pumps fast — often within months.",
    instructions: [
      "Locate the pressure gauge on the tank or pressure switch — note the current reading",
      "Run a faucet and watch the pressure gauge — the pump should kick on at the cut-in pressure (typically 30 or 40 psi)",
      "Close the faucet and watch the pump build pressure — it should shut off at cut-out (typically 50 or 60 psi)",
      "Standard settings are 30/50 or 40/60 psi — verify against the label on the pressure switch",
      "If the pump cycles on and off rapidly (every few seconds), the pressure tank is likely waterlogged",
      "To check the tank: turn off the pump breaker, drain all pressure by opening a faucet",
      "With the tank empty, check the air pre-charge at the Schrader valve on top using a tire gauge",
      "Pre-charge should be 2 psi below the cut-in pressure (e.g., 28 psi for a 30/50 system)",
      "If no air pressure is present, the bladder has ruptured — replace the pressure tank",
      "If low on air but bladder is intact, add air to the correct pre-charge with a bicycle pump",
      "Restore the pump breaker and verify proper cycling",
    ],
    frequency: {
      intervalMonths: 6,
      triggerConditions: [
        "Pump cycling on and off rapidly (short-cycling)",
        "Low or fluctuating water pressure",
        "Pump runs continuously without shutting off",
        "Water sputtering at faucets",
      ],
    },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 20,
    toolsRequired: [
      "tire pressure gauge",
      "bicycle pump or air compressor",
      "adjustable wrench (for pressure switch adjustment if needed)",
    ],
    materialsCost: { low: 0, high: 10 },
    professionalCost: { low: 100, high: 250 },
    skipConsequences: {
      shortTerm:
        "Rapid pump cycling from a waterlogged tank — pump turns on and off every few seconds; fluctuating water pressure at fixtures",
      longTerm:
        "Premature well pump failure from excessive cycling — pump motors are rated for a limited number of starts; pressure switch contacts burn out from rapid cycling; submersible pump replacement costs $1,000-$3,000+",
      costOfNeglect:
        "A $200-$500 pressure tank replacement prevents a $1,000-$3,000+ submersible pump replacement",
    },
    safetyNotes: [
      "Always turn off the pump breaker before working on the pressure switch or tank",
      "Never adjust the pressure switch beyond the pump's rated capacity",
      "If the pump won't shut off, turn off the breaker immediately — the pump is running against a dead head and will overheat",
    ],
    seasonalRelevance: ["spring", "fall"],
    priority: "high" as const,
    tags: [
      "well-pump",
      "pressure-switch",
      "pressure-tank",
      "diy",
      "semi-annual",
    ],
  },
  {
    key: "plumb_wp_002",
    componentTemplateKey: "well_pump",
    systemCategory: "plumbing",
    name: "Annual Water Quality Testing",
    description:
      "Collect a water sample and test for bacteria (coliform/E. coli), nitrates, pH, hardness, and other contaminants. Well water is not regulated by municipal authorities — testing is entirely the homeowner's responsibility.",
    whyItMatters:
      "Unlike city water, your well has no treatment plant, no testing lab, and no one monitoring it for you. Contamination can enter gradually from agricultural runoff, septic systems, or natural mineral deposits — and you won't taste, see, or smell most contaminants until levels are dangerously high.",
    instructions: [
      "Contact your county health department or a certified lab for a water testing kit",
      "Collect the sample from a faucet nearest to the pressure tank (before any treatment equipment)",
      "Run the water for 3-5 minutes before collecting to purge standing water from pipes",
      "Follow the lab's specific collection instructions — sterilize the faucet tip with rubbing alcohol or flame",
      "Fill the sample container without touching the inside of the cap or container",
      "Label the sample with date, time, and sample location",
      "Deliver or mail the sample to the lab within the timeframe specified (usually within 24 hours for bacteria tests)",
      "Test for at minimum: total coliform bacteria, E. coli, nitrates, pH, and hardness",
      "Consider additional tests for: iron, manganese, sulfur, arsenic, lead, and radon (depending on your region)",
      "Compare results against EPA safe drinking water standards",
      "If bacteria is detected, shock-chlorinate the well and retest in 2 weeks",
    ],
    frequency: {
      intervalMonths: 12,
      seasonalAdjustments: {
        note: "Test annually in spring (after snowmelt and heavy rains that can introduce contamination). Test immediately after any well work, flooding, or changes in water taste/smell/color.",
      },
      triggerConditions: [
        "Change in water taste, odor, or color",
        "After flooding or heavy rains near the well",
        "After any well pump or plumbing work",
        "Illness in the household with no other explanation",
        "Nearby agricultural activity or land use changes",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 20,
    toolsRequired: [
      "water testing kit from certified lab",
      "rubbing alcohol or lighter (for faucet sterilization)",
      "cooler with ice (for sample transport)",
    ],
    materialsCost: { low: 20, high: 150 },
    professionalCost: { low: 100, high: 400 },
    skipConsequences: {
      shortTerm:
        "Bacterial contamination goes undetected — coliform bacteria can be present with no taste or odor; nitrate levels above 10 mg/L are a health risk, especially for infants",
      longTerm:
        "Chronic exposure to arsenic, lead, or radon causes serious long-term health effects; gradual contamination from nearby sources can worsen over years without detection",
      costOfNeglect:
        "A $25-$150 annual water test is trivial compared to the health consequences of drinking contaminated water",
    },
    safetyNotes: [
      "If bacteria is detected, do not drink the water until it's been treated and retested",
      "Shock chlorination is the standard treatment for bacterial contamination in wells",
      "Keep test results filed — they create a baseline for detecting changes over time",
    ],
    seasonalRelevance: ["spring"],
    priority: "critical" as const,
    tags: [
      "well-pump",
      "water-quality",
      "testing",
      "safety",
      "annual",
      "health",
    ],
  },
  {
    key: "plumb_wp_003",
    componentTemplateKey: "well_pump",
    systemCategory: "plumbing",
    name: "Inspect Wellhead and Sanitary Seal",
    description:
      "Inspect the well casing, sanitary seal (well cap), and the area around the wellhead for damage, deterioration, or potential contamination pathways.",
    whyItMatters:
      "The well cap and sanitary seal are your water supply's first line of defense against surface contamination. A cracked cap, missing seal, or damaged casing allows insects, rodents, surface water, and bacteria direct access to your drinking water supply.",
    instructions: [
      "Locate the wellhead — the casing pipe extending above ground level",
      "Verify the well cap is in place, secured, and not cracked or damaged",
      "Check that the sanitary seal (rubber gasket where wires and pipe enter the casing) is intact",
      "Look for any gaps, holes, or cracks in the casing pipe above ground",
      "Ensure the casing extends at least 12 inches above the ground surface (code minimum in most states)",
      "Check that the ground slopes away from the casing in all directions (prevents pooling)",
      "Remove any vegetation growing against the casing — roots can damage the seal",
      "Verify no chemicals, fertilizers, or fuel are stored within 50 feet of the wellhead",
      "Check that the nearest septic system component is at least 50-100 feet away (per local codes)",
      "Look for signs of rodent or insect entry around the cap or seal",
    ],
    frequency: {
      intervalMonths: 12,
      triggerConditions: [
        "After severe weather or flooding",
        "After landscaping or construction near the well",
        "Change in water taste, odor, or color",
        "Positive bacteria test result",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 15,
    toolsRequired: [
      "flashlight",
      "screwdriver (to inspect cap screws)",
    ],
    materialsCost: { low: 0, high: 30 },
    professionalCost: { low: 75, high: 200 },
    skipConsequences: {
      shortTerm:
        "Cracked cap allows insects and rodents to enter the well casing; surface water runoff can enter through gaps and introduce bacteria",
      longTerm:
        "Chronic bacterial contamination of the water supply; degraded casing allows aquifer contamination from surface sources; failed sanitary seal violates most state well codes",
      costOfNeglect:
        "A $30-$75 replacement well cap is far cheaper than remediating a contaminated well ($500-$3,000+)",
    },
    safetyNotes: [
      "Never remove the well cap unless you need to access the well interior — and replace it immediately after",
      "Keep a 50-foot clear zone around the wellhead — no chemicals, fuel storage, or animal waste",
    ],
    seasonalRelevance: ["spring"],
    priority: "high" as const,
    tags: [
      "well-pump",
      "wellhead",
      "inspection",
      "sanitary-seal",
      "diy",
      "annual",
    ],
  },

  // ================================================================
  // WATER SOFTENER  (componentTemplateKey: "water_softener")
  // ================================================================
  {
    key: "plumb_ws_001",
    componentTemplateKey: "water_softener",
    systemCategory: "plumbing",
    name: "Check and Refill Salt",
    description:
      "Inspect the brine tank salt level and refill with the correct type of water softener salt. The softener cannot regenerate without adequate salt, meaning your water goes untreated.",
    whyItMatters:
      "Running out of salt is the most common reason a water softener stops working — and most people don't notice until the hard water spots return on dishes and fixtures. Keeping the tank at least 1/3 full ensures consistent regeneration cycles.",
    instructions: [
      "Remove the brine tank lid and look inside with a flashlight",
      "The salt level should be at least 1/3 of the tank height — ideally half full",
      "If the salt looks like a solid mass with water above it, you may have a salt bridge (see next step)",
      "Push a broom handle gently into the salt — if it hits a hard crust with air/water below, break through it (salt bridge)",
      "Add the correct salt type for your softener: solar salt crystals, pellets, or evaporated salt pellets",
      "Do not mix salt types — pick one and stay consistent",
      "Do not overfill — leave 4-6 inches of space from the top to allow proper dissolving",
      "Check for any salt mushing at the bottom (sludge layer) — if present, the tank needs cleaning",
      "Wipe down the inside tank walls above the salt line to remove salt residue",
    ],
    frequency: {
      intervalMonths: 1,
      seasonalAdjustments: {
        note: "Check monthly. Consumption varies by water usage and hardness — a family of 4 with very hard water may use a 40 lb bag every 4-6 weeks.",
      },
      triggerConditions: [
        "Hard water spots on dishes or fixtures",
        "Soap doesn't lather well",
        "Visible salt level below 1/4 of the tank",
        "Salt bridge visible (solid crust with gap below)",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 10,
    toolsRequired: [
      "flashlight",
      "broom handle (for checking salt bridges)",
    ],
    materialsCost: { low: 5, high: 15 },
    professionalCost: { low: 0, high: 0 },
    skipConsequences: {
      shortTerm:
        "Softener stops regenerating — hard water passes through untreated; hard water spots on fixtures, dishes, and shower doors",
      longTerm:
        "Scale buildup resumes in pipes, water heater, and fixtures; water heater sediment accumulation accelerates dramatically without softened water",
      costOfNeglect:
        "A $5-$15 bag of salt monthly prevents the scale damage that shortens the life of every water-using appliance in your home",
    },
    safetyNotes: [
      "Water softener salt bags are 40 lbs — lift with your legs, not your back",
      "Keep the brine tank lid closed to prevent debris and insects from entering",
    ],
    seasonalRelevance: ["spring", "summer", "fall", "winter"],
    priority: "high" as const,
    tags: [
      "water-softener",
      "salt",
      "refill",
      "diy",
      "monthly",
    ],
  },
  {
    key: "plumb_ws_002",
    componentTemplateKey: "water_softener",
    systemCategory: "plumbing",
    name: "Clean Brine Tank",
    description:
      "Drain, scrub, and sanitize the brine tank to remove salt sludge (mushing), iron fouling, and bacterial growth. A dirty brine tank produces poor-quality brine that doesn't effectively regenerate the resin.",
    whyItMatters:
      "Over time, impurities in the salt settle to the bottom as a thick sludge layer. This sludge reduces the tank's effective capacity and can clog the brine line. Iron bacteria can also colonize the tank, producing a slimy biofilm that affects water quality.",
    instructions: [
      "Initiate a manual regeneration cycle to use up remaining brine",
      "After regeneration, scoop out remaining salt and set aside on a tarp or in buckets",
      "Disconnect the brine line from the tank (note the connection for reassembly)",
      "Tip the tank to drain remaining water — or use a wet/dry vacuum",
      "Scrub the inside of the tank with warm water and dish soap",
      "For iron staining or bacterial slime, use a solution of 1/4 cup bleach in 2 gallons of water",
      "Rinse the tank thoroughly — at least 3 full rinses to remove all soap and bleach",
      "Clean the brine valve and float assembly if accessible",
      "Reassemble, reconnect the brine line, and add fresh salt",
      "Add 3-4 gallons of water to the tank to start the brine solution forming",
      "Run a manual regeneration to verify proper operation",
    ],
    frequency: {
      intervalMonths: 12,
      seasonalAdjustments: {
        note: "Annual cleaning for most systems. Every 6 months if your water has high iron content (visible orange staining).",
      },
      triggerConditions: [
        "Visible sludge at the bottom of the brine tank",
        "Softener not regenerating properly despite having salt",
        "Rotten egg or musty smell from the brine tank",
        "Iron staining in treated water",
      ],
    },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 60,
    toolsRequired: [
      "wet/dry vacuum",
      "scrub brush",
      "dish soap",
      "bleach (for sanitizing)",
      "buckets or tarp (for displaced salt)",
    ],
    materialsCost: { low: 0, high: 10 },
    professionalCost: { low: 100, high: 200 },
    skipConsequences: {
      shortTerm:
        "Salt mushing reduces regeneration effectiveness; slimy biofilm develops from iron bacteria; brine line clogs from sludge",
      longTerm:
        "Resin bed becomes fouled from poor regeneration; softener stops working effectively, allowing hard water through; brine valve failure from sediment buildup",
      costOfNeglect:
        "Annual tank cleaning preserves softener performance and prevents the $300-$500 cost of resin bed replacement",
    },
    safetyNotes: [
      "If using bleach, ensure good ventilation and avoid mixing with other cleaning products",
      "The brine tank can be heavy when full of salt — get help tipping it if needed",
    ],
    seasonalRelevance: ["spring"],
    priority: "medium" as const,
    tags: [
      "water-softener",
      "brine-tank",
      "cleaning",
      "diy",
      "annual",
    ],
  },
  {
    key: "plumb_ws_003",
    componentTemplateKey: "water_softener",
    systemCategory: "plumbing",
    name: "Verify Settings and Regeneration Schedule",
    description:
      "Review and adjust the softener's hardness setting, regeneration frequency, and salt dose to match your current water conditions and household usage.",
    whyItMatters:
      "Most water softeners are set once during installation and never adjusted again. But water hardness can change seasonally, household size changes, and an incorrectly programmed softener either wastes salt and water (over-regenerating) or lets hard water through (under-regenerating).",
    instructions: [
      "Locate your most recent water hardness test result (in grains per gallon — gpg)",
      "Access the softener control valve programming menu (consult your owner's manual)",
      "Verify the hardness setting matches your actual water hardness",
      "If you have iron in your water, add 3-5 gpg to the hardness setting per 1 ppm of iron",
      "Check the regeneration schedule — it should match your household water usage",
      "For demand-initiated systems, verify the 'capacity' or 'reserve' settings are correct for your household size",
      "For timer-based systems, adjust the regeneration day/time — typically 2 AM when water use is lowest",
      "Check the salt dose per regeneration (lbs of salt per cycle) — consult the manual for recommended settings",
      "Verify the current time and day on the controller is correct (power outages can reset it)",
      "Run a manual regeneration after any settings changes to verify proper operation",
    ],
    frequency: {
      intervalMonths: 12,
      triggerConditions: [
        "Water hardness test shows different results than the programmed setting",
        "Household size has changed (more or fewer people)",
        "After a power outage (settings may have reset)",
        "Salt consumption seems unusually high or low",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 15,
    toolsRequired: [
      "owner's manual (or download from manufacturer website)",
      "water hardness test kit or recent lab results",
    ],
    materialsCost: { low: 0, high: 10 },
    professionalCost: { low: 75, high: 150 },
    skipConsequences: {
      shortTerm:
        "Incorrect settings waste salt and water (over-regeneration) or allow hard water through (under-regeneration)",
      longTerm:
        "Resin bed exhaustion from consistent under-regeneration; excessive salt and water waste adds up to hundreds of dollars over time",
      costOfNeglect:
        "Proper settings optimization can save $50-$150/year in salt and water costs while providing better water quality",
    },
    safetyNotes: [
      "Write down your current settings before making any changes — in case you need to revert",
      "If your power goes out, check the clock on the controller — a wrong time means regeneration happens at the wrong time of day",
    ],
    seasonalRelevance: ["spring"],
    priority: "medium" as const,
    tags: [
      "water-softener",
      "settings",
      "programming",
      "diy",
      "annual",
    ],
  },
  {
    key: "plumb_ws_004",
    componentTemplateKey: "water_softener",
    systemCategory: "plumbing",
    name: "Test Water Hardness (Before and After)",
    description:
      "Test water hardness at both the untreated inlet and the treated outlet to verify the softener is removing hardness effectively. This confirms the resin bed is healthy and regeneration is working.",
    whyItMatters:
      "The only way to know if your softener is actually working is to test the output water. Hard water coming through a 'working' softener means the resin bed is exhausted, channeled, or the system is bypassed — and every appliance in your home is accumulating scale damage.",
    instructions: [
      "Purchase a water hardness test kit (test strips or drop test) — available at hardware stores or online",
      "Collect a sample from the untreated supply (before the softener) — test and record the hardness in gpg",
      "Collect a sample from a treated faucet (after the softener, after running for 30 seconds) — test and record",
      "The treated water should read 0-1 gpg (soft). If higher, the softener is not working properly",
      "If treated water is 3+ gpg, check: salt level, bypass valve position, hardness setting, and regeneration schedule",
      "Perform this test at different times — right after regeneration and 2-3 days after to check capacity",
      "If the system works fine after regeneration but fails before the next cycle, the capacity setting is too low for your usage",
      "If the system consistently produces hard water even after regeneration, the resin bed may need replacement or the control valve may be malfunctioning",
    ],
    frequency: {
      intervalMonths: 6,
      triggerConditions: [
        "Hard water spots on dishes or fixtures",
        "Soap doesn't lather well",
        "White scale buildup on faucets or showerheads",
        "After any softener maintenance or repairs",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 10,
    toolsRequired: [
      "water hardness test kit (strips or drop test)",
      "two clean cups for sample collection",
    ],
    materialsCost: { low: 5, high: 15 },
    professionalCost: { low: 75, high: 150 },
    skipConsequences: {
      shortTerm:
        "Hard water passing through an underperforming softener accumulates scale in the water heater and pipes",
      longTerm:
        "Years of undetected hard water throughput causes premature failure of water heaters, dishwashers, and fixtures; scale buildup restricts pipe diameter and reduces flow",
      costOfNeglect:
        "A $10 test kit every 6 months verifies your softener is protecting thousands of dollars in appliances and plumbing",
    },
    safetyNotes: [
      "Make sure you're testing after the softener, not at an untreated outdoor faucet or bypassed line",
      "If you recently regenerated, wait 2 hours before testing to get an accurate post-regeneration reading",
    ],
    seasonalRelevance: ["spring", "fall"],
    priority: "medium" as const,
    tags: [
      "water-softener",
      "hardness-test",
      "testing",
      "diy",
      "semi-annual",
    ],
  },

  // ================================================================
  // WHOLE HOUSE FILTRATION  (componentTemplateKey: "whole_house_filtration")
  // ================================================================
  {
    key: "plumb_whf_001",
    componentTemplateKey: "whole_house_filtration",
    systemCategory: "plumbing",
    name: "Replace Filter Cartridges",
    description:
      "Replace the sediment, carbon, or specialty filter cartridges in the whole-house filtration system. Overdue filters restrict water flow, reduce water quality, and can become a breeding ground for bacteria.",
    whyItMatters:
      "A whole-house filter that hasn't been changed in over a year is worse than having no filter at all. The saturated media can leach captured contaminants back into the water, and the restricted flow stresses your well pump or reduces pressure throughout the house.",
    instructions: [
      "Turn off the water supply upstream of the filtration system",
      "Open a downstream faucet to relieve pressure in the filter housings",
      "Place a bucket under the filter housing to catch spilled water",
      "Use the filter wrench (included with most systems) to unscrew the filter housing",
      "Remove the old cartridge and inspect the housing O-ring for cracks or deformation",
      "Apply a thin coat of food-grade silicone grease to the O-ring before reassembly",
      "Insert the new cartridge — verify it seats properly (correct size and orientation)",
      "Screw the housing back on hand-tight, then snug with the filter wrench (do not over-tighten)",
      "Turn the water supply back on slowly while checking for leaks at the housing seam",
      "Open a faucet and let water run for 5 minutes to flush the new filter and purge air",
      "For carbon filters, run water until the carbon fines (black water) clear completely",
      "Write the installation date on the housing with a marker",
    ],
    frequency: {
      intervalMonths: 6,
      seasonalAdjustments: {
        note: "Every 3-6 months for sediment pre-filters. Every 6-12 months for carbon block filters. Follow manufacturer recommendations and replace sooner if flow is noticeably reduced.",
      },
      triggerConditions: [
        "Noticeable drop in water pressure throughout the house",
        "Discolored or off-tasting water",
        "Pressure gauge differential exceeds 15 psi across the filter",
        "Filter change reminder date has passed",
      ],
    },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 20,
    toolsRequired: [
      "filter wrench (size-matched to housing)",
      "bucket",
      "replacement filter cartridge(s)",
      "food-grade silicone grease (for O-ring)",
    ],
    materialsCost: { low: 15, high: 80 },
    professionalCost: { low: 100, high: 250 },
    skipConsequences: {
      shortTerm:
        "Reduced water pressure throughout the house as the clogged filter restricts flow; water taste and odor deterioration",
      longTerm:
        "Saturated filter can leach captured contaminants back into the water supply; bacterial growth on the spent media; pressure drop stresses the well pump or wastes municipal pressure",
      costOfNeglect:
        "A $20-$80 filter change every 6 months protects your water quality and plumbing system",
    },
    safetyNotes: [
      "Always turn off the water supply before opening filter housings — they are under full system pressure",
      "Check the O-ring every time — a damaged O-ring causes leaks and bypasses the filter",
      "Write the date on the housing so you always know when it was last changed",
    ],
    seasonalRelevance: ["spring", "fall"],
    priority: "high" as const,
    tags: [
      "whole-house-filter",
      "cartridge",
      "replacement",
      "diy",
      "semi-annual",
      "water-quality",
    ],
  },
  {
    key: "plumb_whf_002",
    componentTemplateKey: "whole_house_filtration",
    systemCategory: "plumbing",
    name: "Sanitize Filter Housings",
    description:
      "Disinfect the filter housings during cartridge replacement to eliminate bacterial growth and biofilm that accumulates on housing walls and the filter sump.",
    whyItMatters:
      "The warm, dark, wet interior of a filter housing is an ideal environment for bacterial growth. Simply swapping cartridges without sanitizing the housing means the new filter immediately contacts existing biofilm. Annual sanitization prevents your water filter from becoming a bacteria incubator.",
    instructions: [
      "Perform this during a filter cartridge replacement (when the housing is already open)",
      "After removing the old cartridge, pour out all remaining water from the housing",
      "Mix a sanitizing solution: 1 tablespoon of unscented household bleach per gallon of water",
      "Pour the solution into the housing and scrub the interior walls with a bottle brush",
      "Pay extra attention to the threads and O-ring groove — biofilm hides in grooves",
      "Let the solution sit in the housing for 10-15 minutes",
      "Rinse the housing thoroughly with clean water — at least 3 full rinses",
      "Inspect the O-ring groove for debris and mold, clean as needed",
      "Install the new cartridge and reassemble per the cartridge replacement procedure",
      "Flush the system for 10 minutes after reassembly to purge any residual sanitizer",
    ],
    frequency: {
      intervalMonths: 12,
      seasonalAdjustments: {
        note: "Annually during a scheduled filter change. More frequently if you notice odor or discoloration in the housing or if on well water with known bacterial presence.",
      },
    },
    difficulty: "moderate" as const,
    diyFriendly: true,
    estimatedMinutes: 30,
    toolsRequired: [
      "unscented household bleach",
      "bottle brush or housing cleaning brush",
      "bucket",
      "filter wrench",
    ],
    materialsCost: { low: 0, high: 5 },
    professionalCost: { low: 100, high: 200 },
    skipConsequences: {
      shortTerm:
        "Biofilm on housing walls contaminates the new filter immediately upon installation; musty or earthy taste in filtered water",
      longTerm:
        "Chronic bacterial colonization of the filter system; filter media becomes a breeding ground rather than a barrier; health risk from bacterial contamination of treated water",
      costOfNeglect:
        "A 10-minute sanitization during cartridge change costs essentially nothing and prevents bacterial contamination",
    },
    safetyNotes: [
      "Use only unscented household bleach — no splash-free, scented, or thick gel formulas",
      "Flush thoroughly after sanitization — you should not taste or smell bleach in the treated water",
    ],
    seasonalRelevance: ["spring"],
    priority: "medium" as const,
    tags: [
      "whole-house-filter",
      "sanitize",
      "cleaning",
      "diy",
      "annual",
      "bacteria",
    ],
  },
  {
    key: "plumb_whf_003",
    componentTemplateKey: "whole_house_filtration",
    systemCategory: "plumbing",
    name: "Check Pressure Differential",
    description:
      "Read the pressure gauges before and after the filtration system to determine filter restriction. A growing pressure differential indicates the filter is loading up and approaching the replacement threshold.",
    whyItMatters:
      "Pressure gauges tell you exactly when to change the filter based on actual loading rather than just a calendar date. A clean filter may show 2-3 psi differential; when it reaches 15-20 psi, it's restricting flow and needs replacement. This is the most objective way to schedule filter changes.",
    instructions: [
      "Locate the pressure gauges upstream (before) and downstream (after) the filtration system",
      "If no gauges are installed, consider adding them — inexpensive and incredibly valuable ($5-$15 each)",
      "With a faucet running at normal flow, read both gauges simultaneously",
      "Calculate the differential: upstream pressure minus downstream pressure",
      "A new filter typically shows 2-5 psi differential at normal flow rates",
      "Replace the filter when differential reaches 15-20 psi (or per manufacturer's recommendation)",
      "Record the reading and date in a log — track the trend over time to predict replacement timing",
      "If the differential is 0 or very low even on an old filter, the filter may be bypassed or ruptured",
      "Check that both gauges are reading accurately — they can fail or become clogged",
    ],
    frequency: {
      intervalMonths: 3,
      triggerConditions: [
        "Noticeable drop in water pressure",
        "Filter change date approaching",
        "After periods of heavy water use",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 5,
    toolsRequired: [
      "none (if gauges are installed)",
    ],
    materialsCost: { low: 0, high: 30 },
    professionalCost: { low: 0, high: 0 },
    skipConsequences: {
      shortTerm:
        "Without monitoring, filters are either changed too early (wasting money) or too late (restricting flow and degrading water quality)",
      longTerm:
        "A severely restricted filter can cause well pump damage or significantly reduce household water pressure; a bypassed or ruptured filter provides zero filtration with no indication",
      costOfNeglect:
        "Pressure gauges cost $5-$15 each and let you change filters at the optimal time — not too early, not too late",
    },
    safetyNotes: [
      "If the downstream pressure drops dramatically during use, the filter is critically restricted — replace immediately",
    ],
    seasonalRelevance: ["spring", "summer", "fall", "winter"],
    priority: "medium" as const,
    tags: [
      "whole-house-filter",
      "pressure",
      "monitoring",
      "diy",
      "quarterly",
    ],
  },

  // ================================================================
  // MAIN SEWER LINE  (componentTemplateKey: "main_sewer_line")
  // ================================================================
  {
    key: "plumb_msl_001",
    componentTemplateKey: "main_sewer_line",
    systemCategory: "plumbing",
    name: "Professional Camera Inspection",
    description:
      "Hire a licensed plumber to perform a video camera inspection of the main sewer line from the house to the street connection. This is the only way to see the true condition of the line — root intrusion, bellies, cracks, offsets, and blockages.",
    whyItMatters:
      "A sewer line backup is one of the most damaging and expensive plumbing emergencies a homeowner can face. A $150-$400 camera inspection identifies problems years before they become $5,000-$25,000 emergencies. If your home is over 25 years old and the line has never been scoped, do it now.",
    instructions: [
      "Hire a licensed plumber with camera inspection equipment (verify they provide a recorded video)",
      "The technician inserts a flexible camera through the main cleanout or a drain opening",
      "The camera travels the entire length of the sewer line to the municipal connection or septic tank",
      "The technician documents the line condition: root intrusion, cracks, bellies (sags), offsets, scale buildup",
      "They note the pipe material (clay, cast iron, Orangeburg, PVC) and approximate condition grade",
      "Request a recorded video and written report of findings",
      "The technician should locate and mark the cleanout access point(s) if not already identified",
      "Ask about any recommended preventative maintenance based on findings (root treatment, hydro-jetting, etc.)",
      "Keep the video and report in your home maintenance files — it's a valuable baseline for future comparison",
    ],
    frequency: {
      intervalMonths: 60,
      seasonalAdjustments: {
        note: "Every 5 years for homes with PVC sewer lines in good condition. Every 2-3 years for older clay, cast iron, or Orangeburg pipes. Annually if tree roots are an active problem.",
      },
      triggerConditions: [
        "Slow drains in multiple fixtures simultaneously",
        "Sewage odor in the yard or basement",
        "Gurgling sounds from drains",
        "Before purchasing a home (always scope the sewer before closing)",
        "Before a home warranty expires",
      ],
    },
    difficulty: "professional" as const,
    diyFriendly: false,
    estimatedMinutes: 60,
    toolsRequired: ["professional sewer camera equipment"],
    materialsCost: { low: 0, high: 0 },
    professionalCost: { low: 150, high: 400 },
    skipConsequences: {
      shortTerm:
        "Unknown sewer line condition — problems develop silently until a catastrophic backup occurs",
      longTerm:
        "Root intrusion progresses to complete blockage; bellied sections accumulate grease and debris leading to chronic backups; deteriorating pipe materials (Orangeburg, clay) can collapse without warning",
      costOfNeglect:
        "A $150-$400 camera inspection prevents $5,000-$25,000+ in emergency sewer line repair or replacement",
    },
    safetyNotes: [
      "Always hire a licensed plumber — not a 'drain cleaning' company that may try to upsell unnecessary work",
      "Get the video recording and a written report — some companies use scare tactics with camera footage to sell unneeded pipe lining or replacement",
      "If replacement is recommended, get 2-3 independent opinions",
    ],
    seasonalRelevance: ["spring", "fall"],
    priority: "high" as const,
    tags: [
      "sewer-line",
      "camera",
      "inspection",
      "professional",
      "preventative",
    ],
  },
  {
    key: "plumb_msl_002",
    componentTemplateKey: "main_sewer_line",
    systemCategory: "plumbing",
    name: "Preventative Root Treatment",
    description:
      "Apply a foaming root killer or copper sulfate treatment to the main sewer line to inhibit tree root growth. Roots are the #1 cause of sewer line blockages in homes with clay or cast iron pipes.",
    whyItMatters:
      "Tree roots seek out the moisture and nutrients in sewer lines. They enter through joints, cracks, and pipe connections — especially in clay and cast iron lines. By the time you have a root-caused backup, the roots have been growing for years. Preventative treatment is 10x cheaper than emergency root cutting and repair.",
    instructions: [
      "Determine if tree roots are a risk — trees within 25 feet of the sewer line, especially willows, maples, and poplars",
      "Choose your treatment method: foaming root killer (copper sulfate + dichlobenil) or granular copper sulfate",
      "For foaming root killer (recommended): flush the product down the toilet nearest to the main cleanout per package directions",
      "Treat in the evening when water use is lowest — the product needs 8-12 hours of contact time without being washed away",
      "Do not flush toilets, run showers, or use washing machines for at least 8 hours after treatment",
      "For copper sulfate granules (check local regulations — banned in some areas): flush 2 lbs down the lowest toilet",
      "Repeat the treatment every 6-12 months as a preventative measure",
      "If you've had root issues before, combine chemical treatment with annual mechanical root cutting by a professional",
      "Note: chemical treatment inhibits growth but does not remove existing roots — established roots require mechanical cutting or hydro-jetting",
    ],
    frequency: {
      intervalMonths: 12,
      seasonalAdjustments: {
        note: "Apply in spring when root growth is most active. A second treatment in fall provides year-round protection. Trees near the sewer line need more aggressive treatment schedules.",
      },
      triggerConditions: [
        "History of root intrusion found on camera inspection",
        "Large trees near the sewer line path",
        "Slow-draining fixtures (especially in spring/summer when root growth peaks)",
        "Previous root-cutting service needed",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 15,
    toolsRequired: [
      "foaming root killer product or copper sulfate",
    ],
    materialsCost: { low: 15, high: 40 },
    professionalCost: { low: 150, high: 350 },
    skipConsequences: {
      shortTerm:
        "Root growth accelerates in spring and summer, progressively restricting flow; slow drains worsen over months",
      longTerm:
        "Complete sewer line blockage from root mass; roots expand inside the pipe and crack it further; emergency root cutting ($200-$600) and potential pipe replacement ($5,000-$15,000+)",
      costOfNeglect:
        "A $20-$40 root treatment twice a year prevents $200-$600 emergency root cutting and potential pipe replacement",
    },
    safetyNotes: [
      "Follow all product label directions — some root killers are toxic to fish and should not enter storm drains",
      "Copper sulfate is banned in some municipalities — check local regulations before use",
      "Keep root killer products away from children and pets",
    ],
    seasonalRelevance: ["spring", "fall"],
    priority: "medium" as const,
    tags: [
      "sewer-line",
      "roots",
      "treatment",
      "preventative",
      "diy",
      "annual",
    ],
  },
  {
    key: "plumb_msl_003",
    componentTemplateKey: "main_sewer_line",
    systemCategory: "plumbing",
    name: "Locate and Maintain Cleanout Access",
    description:
      "Locate, mark, and ensure the main sewer cleanout(s) are accessible and functional. The cleanout is the critical access point for clearing blockages and performing camera inspections.",
    whyItMatters:
      "When your sewer backs up at midnight, the plumber needs to find the cleanout fast. A buried, hidden, or frozen-shut cleanout adds $200-$500+ to emergency service as the plumber digs or finds alternative access. Know where it is, mark it, and keep it accessible.",
    instructions: [
      "Locate the main sewer cleanout(s) — typically a 3-4 inch capped pipe at or near ground level",
      "Common locations: near the foundation wall, in the front yard near the sidewalk, in the basement floor, or in a utility room",
      "If the cleanout is buried or hidden, hire a plumber to locate it — then mark it permanently",
      "Mark the cleanout with a visible marker (painted stake, landscape marker, GPS coordinates in your phone)",
      "Verify the cleanout cap can be removed — use a pipe wrench to gently test (do not force)",
      "If the cap is stuck, apply penetrating oil and let it soak, then try again",
      "For plastic cleanout caps: replace if cracked; lubricate the threads with plumber's grease",
      "For brass or cast iron cleanout plugs: replace with a plastic expansion plug if the metal is corroded",
      "Ensure landscaping is not covering or blocking access — maintain a 2-foot clear area around the cleanout",
      "Consider installing a cleanout riser if the current access is at or below grade",
    ],
    frequency: {
      intervalMonths: 12,
      triggerConditions: [
        "Sewer backup emergency — you need to know where the cleanout is NOW",
        "After landscaping changes",
        "New home purchase (locate cleanouts during home inspection)",
        "Cleanout cap broken or missing",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 15,
    toolsRequired: [
      "pipe wrench (for testing cap removal)",
      "penetrating oil (for stuck caps)",
      "landscape marker or paint stake",
    ],
    materialsCost: { low: 0, high: 30 },
    professionalCost: { low: 75, high: 250 },
    skipConsequences: {
      shortTerm:
        "Plumber cannot access the line during an emergency, adding $200-$500+ to the service call; backup continues while access is established",
      longTerm:
        "A buried cleanout becomes increasingly difficult to locate over time; corroded caps seize permanently, requiring excavation to access the line",
      costOfNeglect:
        "Knowing where your cleanout is and keeping it accessible is free — not knowing adds hundreds to every sewer service call",
    },
    safetyNotes: [
      "Never open a cleanout cap during an active backup — the pressurized sewage will spray out",
      "If you suspect a backup, open the cleanout slowly and stand to the side",
      "If you smell sewer gas from a missing or cracked cleanout cap, replace it immediately",
    ],
    seasonalRelevance: ["spring"],
    priority: "medium" as const,
    tags: [
      "sewer-line",
      "cleanout",
      "access",
      "diy",
      "annual",
      "emergency-prep",
    ],
  },

  // ================================================================
  // GARBAGE DISPOSAL  (componentTemplateKey: "garbage_disposal")
  // ================================================================
  {
    key: "plumb_gd_001",
    componentTemplateKey: "garbage_disposal",
    systemCategory: "plumbing",
    name: "Clean and Deodorize Disposal",
    description:
      "Deep clean the garbage disposal grinding chamber, splash guard, and drain to remove food buildup, grease, and bacteria that cause persistent odors.",
    whyItMatters:
      "That smell isn't coming from the drain — it's coming from the underside of the splash guard and the grinding chamber walls where food residue accumulates and decomposes. The disposal grinds food but doesn't clean itself. Five minutes of cleaning eliminates the mystery kitchen stink.",
    instructions: [
      "SAFETY: Verify the disposal is OFF and do not put your hand inside the grinding chamber",
      "Lift and clean the underside of the rubber splash guard — this is where most odor-causing buildup hides",
      "Use an old toothbrush with dish soap to scrub the underside of the splash guard flaps",
      "Drop a handful of ice cubes and 1/2 cup of rock salt into the disposal",
      "Run cold water and turn on the disposal — the ice and salt scrub the grinding chamber walls",
      "Cut a lemon or lime in half and drop it in while running — the citrus degreases and deodorizes",
      "For heavy buildup, pour 1/2 cup baking soda into the disposal, followed by 1 cup of white vinegar",
      "Let it foam for 5-10 minutes, then flush with hot water for 30 seconds",
      "Finish by running cold water for 30 seconds to flush everything through the drain",
    ],
    frequency: {
      intervalMonths: 1,
      seasonalAdjustments: {
        note: "Monthly for heavy use households. Bi-weekly during summer months when heat accelerates bacterial growth and odors.",
      },
      triggerConditions: [
        "Persistent odor from the kitchen sink",
        "Visible buildup under the splash guard",
        "Slow draining in the disposal side of the sink",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 10,
    toolsRequired: [
      "ice cubes",
      "rock salt or coarse salt",
      "lemon or lime",
      "baking soda and vinegar (for deep cleaning)",
      "old toothbrush",
    ],
    materialsCost: { low: 0, high: 5 },
    professionalCost: { low: 0, high: 0 },
    skipConsequences: {
      shortTerm:
        "Persistent foul odor from the kitchen sink that air fresheners can't mask; fruit fly and drain fly breeding in the decomposing residue",
      longTerm:
        "Bacterial biofilm builds up in the drain pipe below the disposal; grease accumulation contributes to drain line blockages downstream",
      costOfNeglect:
        "Free household supplies and 5 minutes prevents the embarrassing kitchen odor that no amount of cleaning seems to fix",
    },
    safetyNotes: [
      "NEVER put your hand inside the grinding chamber — even when the power is off",
      "Use tongs, a toothbrush, or a bottle brush to clean inside the chamber",
      "Always run cold water (not hot) during disposal operation — hot water melts grease and lets it re-solidify in the drain line",
    ],
    seasonalRelevance: ["spring", "summer", "fall", "winter"],
    priority: "low" as const,
    tags: [
      "garbage-disposal",
      "cleaning",
      "deodorize",
      "diy",
      "monthly",
    ],
  },
  {
    key: "plumb_gd_002",
    componentTemplateKey: "garbage_disposal",
    systemCategory: "plumbing",
    name: "Test Reset Button and Overload Protection",
    description:
      "Test the thermal overload reset button on the bottom of the disposal and verify the unit's electrical connections are secure. The reset button is the most commonly needed 'repair' on a garbage disposal.",
    whyItMatters:
      "When a disposal suddenly stops working, 90% of the time it's either the reset button or a tripped breaker — not a dead motor. The reset button is a built-in thermal overload protector that trips when the motor overheats or jams. A 10-second check saves a $150+ service call.",
    instructions: [
      "Turn off the disposal wall switch and verify power is off",
      "Look at the bottom center of the disposal unit (under the sink, facing down)",
      "Locate the small red or black reset button",
      "If the button is popped out (extended), press it firmly until it clicks back in",
      "If it pops back out immediately, the motor may be jammed — use an Allen wrench in the center bottom hex socket to manually rotate the grinding plate and free the jam",
      "After clearing any jam, press the reset button again",
      "Turn on the water and then the disposal — verify it runs normally",
      "If the disposal still won't run after resetting and clearing jams, check the circuit breaker",
      "If the disposal hums but won't spin, it's jammed — turn it off immediately and clear the jam before the overload trips again",
      "Test the GFCI outlet (if applicable) — a tripped GFCI kills the disposal with no warning",
    ],
    frequency: {
      intervalMonths: 6,
      triggerConditions: [
        "Disposal suddenly stops working",
        "Disposal hums but won't spin",
        "After a jam or overload event",
        "No response when switch is flipped",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 5,
    toolsRequired: [
      "1/4-inch Allen wrench (hex key) — usually included with the disposal",
      "flashlight",
    ],
    materialsCost: { low: 0, high: 0 },
    professionalCost: { low: 75, high: 150 },
    skipConsequences: {
      shortTerm:
        "Non-functional disposal — kitchen sink becomes difficult to use; food waste accumulates in the sink",
      longTerm:
        "Repeated jamming and overload trips without clearing the root cause damages the motor windings; disposal motor burns out prematurely",
      costOfNeglect:
        "Learning the reset button and Allen wrench trick saves you $150+ per service call for the most common disposal 'failure'",
    },
    safetyNotes: [
      "NEVER reach into the disposal — even when the power is off, use tongs or pliers to remove stuck objects",
      "Always turn off the wall switch before working under the sink",
      "Keep a 1/4-inch Allen wrench taped to the disposal or nearby — you'll need it eventually",
    ],
    seasonalRelevance: ["spring", "summer", "fall", "winter"],
    priority: "low" as const,
    tags: [
      "garbage-disposal",
      "reset",
      "troubleshooting",
      "diy",
      "semi-annual",
    ],
  },
  {
    key: "plumb_gd_003",
    componentTemplateKey: "garbage_disposal",
    systemCategory: "plumbing",
    name: "Inspect Connections, Flange, and Dishwasher Drain",
    description:
      "Inspect the disposal mounting flange, discharge pipe connection, and dishwasher drain hose connection for leaks, corrosion, and proper installation.",
    whyItMatters:
      "Garbage disposal leaks are insidious — they drip slowly under the sink where you can't see them, causing cabinet damage, mold growth, and subfloor damage for months before discovery. A 5-minute under-sink inspection catches leaks before they cause real damage.",
    instructions: [
      "Clear out everything stored under the kitchen sink for full access",
      "With a dry paper towel, wipe down all connections on the disposal: mounting flange (top), discharge pipe (side), dishwasher inlet (side, smaller connection)",
      "Run the disposal with water flowing for 60 seconds while watching for drips at each connection",
      "Check the mounting flange where the disposal connects to the sink — look for water seeping around the flange ring",
      "If the flange leaks, the mounting bolts may need tightening or the plumber's putty seal needs replacing",
      "Check the discharge pipe connection — the gasket should be in good condition and the connection snug",
      "If a dishwasher is connected, verify the drain hose has a high loop or air gap (prevents backflow into the dishwasher)",
      "Check the dishwasher drain hose connection for leaks and ensure the hose clamp is tight",
      "Look for corrosion on the disposal body — surface rust is cosmetic, but heavy corrosion near connections indicates developing leaks",
      "Check that the disposal is securely mounted and doesn't wobble when running",
    ],
    frequency: {
      intervalMonths: 6,
      triggerConditions: [
        "Musty smell under the kitchen sink",
        "Water stains or warping on the cabinet floor",
        "Disposal wobbles or vibrates excessively",
        "Water pooling under the sink",
      ],
    },
    difficulty: "easy" as const,
    diyFriendly: true,
    estimatedMinutes: 10,
    toolsRequired: [
      "flashlight",
      "paper towels",
      "screwdriver (for tightening clamps if needed)",
    ],
    materialsCost: { low: 0, high: 10 },
    professionalCost: { low: 75, high: 150 },
    skipConsequences: {
      shortTerm:
        "Slow leak damages cabinet floor and contents stored under the sink; dishwasher backflow causes dirty water in the dishwasher tub",
      longTerm:
        "Mold growth under the sink and in the cabinet walls; subfloor water damage and rot; warped or delaminated cabinet bottom requiring replacement",
      costOfNeglect:
        "A 5-minute inspection twice a year prevents hundreds in water damage and mold remediation",
    },
    safetyNotes: [
      "If the dishwasher drain hose does not have a high loop (rising above the disposal connection before dropping down), add one — it prevents sewage backflow into your dishwasher",
      "Do not overtighten connections — disposal gaskets compress and seal with moderate pressure",
    ],
    seasonalRelevance: ["spring", "fall"],
    priority: "medium" as const,
    tags: [
      "garbage-disposal",
      "connections",
      "inspection",
      "leak",
      "diy",
      "semi-annual",
    ],
  },
];

export const seed = internalMutation({
  handler: async (ctx) => {
    let inserted = 0;
    let skipped = 0;

    for (const task of plumbingMaintenanceTasks) {
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
      `[tasks_plumbing] Seeded ${inserted} plumbing maintenance tasks (${skipped} already existed)`
    );
    return { inserted, skipped, total: plumbingMaintenanceTasks.length };
  },
});
