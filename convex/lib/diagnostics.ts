// convex/lib/diagnostics.ts

export interface DiagnosticIssue {
  id: string;
  symptom: string;
  systemCategory: string; // "hvac", "plumbing", etc.
  description: string;
  understanding: {
    whatItIs: string;
    howItWorks: string;
    keyComponents: string[];
    healthFactorNote?: string;
  };
  possibleCauses: {
    title: string;
    likelihood: "High" | "Moderate" | "Low";
    likelihoodPercent: number; // 0-100
    expectedCostLow: number;
    expectedCostHigh: number;
    diyCheck: string;
  }[];
  diySteps: {
    title: string;
    steps: string[];
    stopCondition: string;
  };
  safetyWarnings: string[];
  redFlags: string[];
  pricingReference: {
    region: string;
    repairLow: number;
    repairHigh: number;
    replaceLow: number;
    replaceHigh: number;
  };
}

export const DIAGNOSTICS_DB: Record<string, DiagnosticIssue[]> = {
  hvac: [
    {
      id: "ac-not-cooling",
      symptom: "AC not cooling",
      systemCategory: "hvac",
      description: "Air conditioner is running but air is warm or not cool enough.",
      understanding: {
        whatItIs: "Your AC removes heat and humidity from indoor air and releases it outside.",
        howItWorks: "Indoor coil absorbs heat → refrigerant carries it outside → outdoor coil releases it → a fan moves air across coils.",
        keyComponents: [
          "Air filter (keeps airflow clean)",
          "Indoor evaporator coil",
          "Outdoor condenser coil",
          "Blower fan",
          "Thermostat/control",
        ],
        healthFactorNote: "HVAC health scores often drop when filter/coil maintenance is missed—those directly map to 'not cooling' complaints.",
      },
      possibleCauses: [
        { title: "Dirty air filter", likelihood: "High", likelihoodPercent: 85, expectedCostLow: 10, expectedCostHigh: 35, diyCheck: "Check filter condition; replace if dirty." },
        { title: "Thermostat issues", likelihood: "Moderate", likelihoodPercent: 60, expectedCostLow: 0, expectedCostHigh: 200, diyCheck: "Confirm mode is COOL and setpoint is below room temp. Replace thermostat batteries if needed." },
        { title: "Frozen evaporator coil", likelihood: "Moderate", likelihoodPercent: 50, expectedCostLow: 100, expectedCostHigh: 400, diyCheck: "Check for ice on refrigerant lines. Turn off AC and run fan only to thaw." },
        { title: "Compressor failure", likelihood: "Low", likelihoodPercent: 15, expectedCostLow: 1400, expectedCostHigh: 3700, diyCheck: "Listen for loud noises or humming from outdoor unit. Requires pro." },
      ],
      diySteps: { title: "Dirty air filter", steps: ["Turn system OFF at thermostat.", "Locate the filter (return grille or near air handler).", "Replace with the correct size; airflow arrow toward furnace/air handler."], stopCondition: "System still won't cool after filter change and 30-60 minutes." },
      safetyWarnings: ["If you smell gas: leave immediately and call your gas company.", "If there's active leaking: shut off water if safe and call a plumber.", "Avoid electrical work unless you're trained."],
      redFlags: ["No written estimate provided", "High-pressure tactics or urgency", "Vague line items on invoice", "Recommends replacement without discussing repair options", "Won't explain the problem"],
      pricingReference: { region: "US National Average", repairLow: 150, repairHigh: 600, replaceLow: 4500, replaceHigh: 8500 },
    },
    {
      id: "ac-running-constantly",
      symptom: "AC running constantly",
      systemCategory: "hvac",
      description: "Air conditioner runs without stopping or cycles too frequently.",
      understanding: {
        whatItIs: "Your AC is struggling to reach the set temperature.",
        howItWorks: "It should cycle on and off to maintain temp. Constant running means it's undersized, dirty, or losing refrigerant.",
        keyComponents: ["Thermostat", "Compressor", "Refrigerant", "Coils"],
      },
      possibleCauses: [
        { title: "Dirty coils", likelihood: "High", likelihoodPercent: 75, expectedCostLow: 100, expectedCostHigh: 300, diyCheck: "Visually inspect outdoor unit for dirt/debris." },
        { title: "Low refrigerant", likelihood: "Moderate", likelihoodPercent: 40, expectedCostLow: 200, expectedCostHigh: 1000, diyCheck: "Look for ice on lines. Pro required to check levels." },
      ],
      diySteps: { title: "Check airflow", steps: ["Ensure all vents are open and unblocked.", "Check air filter.", "Clear debris from around outdoor unit."], stopCondition: "Unit runs for 24+ hours without reaching setpoint." },
      safetyWarnings: ["Don't touch refrigerant lines if icy (risk of burn)."],
      redFlags: ["Topping off refrigerant without looking for a leak"],
      pricingReference: { region: "US National Average", repairLow: 100, repairHigh: 500, replaceLow: 5000, replaceHigh: 9000 },
    },
    {
      id: "furnace-not-heating",
      symptom: "Furnace not heating",
      systemCategory: "hvac",
      description: "Furnace cycles on but doesn't produce warm air.",
      understanding: {
        whatItIs: "Your furnace burns gas or uses electric resistance to heat air that's then distributed through ductwork.",
        howItWorks: "Thermostat calls for heat → ignitor lights burner (gas) or element heats (electric) → blower pushes warm air through ducts.",
        keyComponents: ["Ignitor/pilot", "Gas valve", "Flame sensor", "Blower motor", "Heat exchanger"],
        healthFactorNote: "A furnace that won't heat drops your HVAC health score significantly and may indicate a safety concern.",
      },
      possibleCauses: [
        { title: "Dirty flame sensor", likelihood: "High", likelihoodPercent: 45, expectedCostLow: 80, expectedCostHigh: 200, diyCheck: "Furnace lights briefly then shuts off — classic dirty flame sensor symptom." },
        { title: "Failed ignitor", likelihood: "Moderate", likelihoodPercent: 30, expectedCostLow: 150, expectedCostHigh: 400, diyCheck: "No glow or click from the ignitor area when heat is called for." },
        { title: "Tripped safety switch", likelihood: "Moderate", likelihoodPercent: 25, expectedCostLow: 0, expectedCostHigh: 100, diyCheck: "Check for blinking error codes on the furnace control board." },
        { title: "Gas valve failure", likelihood: "Low", likelihoodPercent: 10, expectedCostLow: 300, expectedCostHigh: 800, diyCheck: "Pro diagnosis required — do not attempt gas valve work." },
      ],
      diySteps: { title: "Basic furnace checks", steps: ["Check thermostat is set to HEAT and above room temp.", "Check air filter — a clogged filter can trip the high-limit switch.", "Check circuit breakers.", "Look for blinking LED error codes on furnace control board (usually visible through a small window)."], stopCondition: "If you smell gas at any point, leave immediately and call your gas company." },
      safetyWarnings: ["If you smell gas, leave immediately — do not flip switches.", "Carbon monoxide is odorless — ensure CO detectors are working.", "Never bypass safety switches on a furnace."],
      redFlags: ["Tech recommends full replacement without checking flame sensor first", "No combustion analysis performed", "Suggests disabling safety switches"],
      pricingReference: { region: "US National Average", repairLow: 100, repairHigh: 500, replaceLow: 3000, replaceHigh: 7500 },
    },
    {
      id: "hvac-strange-noises",
      symptom: "Strange HVAC noises",
      systemCategory: "hvac",
      description: "Unusual sounds like banging, squealing, or rattling from the HVAC system.",
      understanding: {
        whatItIs: "HVAC systems have many moving parts — motors, fans, compressors — that can produce abnormal sounds when wearing out.",
        howItWorks: "Normal operation produces a steady hum. New sounds indicate mechanical wear, loose parts, or component failure.",
        keyComponents: ["Blower motor and bearings", "Fan blades", "Compressor", "Ductwork", "Mounting hardware"],
      },
      possibleCauses: [
        { title: "Loose blower wheel or fan blade", likelihood: "High", likelihoodPercent: 40, expectedCostLow: 50, expectedCostHigh: 200, diyCheck: "Rattling sound from indoor unit, often worse at higher fan speeds." },
        { title: "Failing motor bearings", likelihood: "Moderate", likelihoodPercent: 30, expectedCostLow: 200, expectedCostHigh: 600, diyCheck: "Squealing or grinding that gets louder over time. Turn off to prevent burnout." },
        { title: "Duct expansion/contraction", likelihood: "Moderate", likelihoodPercent: 20, expectedCostLow: 0, expectedCostHigh: 150, diyCheck: "Popping sounds from ductwork when system starts/stops — often normal." },
        { title: "Compressor issue", likelihood: "Low", likelihoodPercent: 10, expectedCostLow: 500, expectedCostHigh: 3000, diyCheck: "Loud humming, buzzing, or clanking from outdoor unit." },
      ],
      diySteps: { title: "Identify the noise", steps: ["Note when the sound occurs (startup, running, shutdown).", "Identify which unit (indoor, outdoor, or ductwork).", "Turn off system if grinding or screeching — continued operation can cause more damage.", "Check for loose screws on vent covers and duct connections."], stopCondition: "Grinding, screeching, or banging from the compressor requires professional service." },
      safetyWarnings: ["Turn off system before inspecting any moving parts.", "Never remove the cover from the outdoor unit while it's running.", "Loud banging from a gas furnace may indicate delayed ignition — a safety concern."],
      redFlags: ["Tech can't identify the noise source", "Recommends full system replacement for a bearing issue"],
      pricingReference: { region: "US National Average", repairLow: 100, repairHigh: 600, replaceLow: 4000, replaceHigh: 8000 },
    },
    {
      id: "high-energy-bills-hvac",
      symptom: "Unexpectedly high energy bills",
      systemCategory: "hvac",
      description: "Energy costs significantly higher than normal with no change in usage patterns.",
      understanding: {
        whatItIs: "Your HVAC system is the largest energy consumer in most homes (40-60% of total energy use).",
        howItWorks: "When HVAC efficiency drops, the system runs longer or harder to maintain temperature, directly increasing energy consumption.",
        keyComponents: ["Air filter", "Ductwork sealing", "Refrigerant charge", "Thermostat programming", "Insulation"],
      },
      possibleCauses: [
        { title: "Dirty or clogged air filter", likelihood: "High", likelihoodPercent: 40, expectedCostLow: 5, expectedCostHigh: 30, diyCheck: "A dirty filter can increase energy use by 5-15%. Check and replace." },
        { title: "Duct leaks", likelihood: "Moderate", likelihoodPercent: 30, expectedCostLow: 200, expectedCostHigh: 800, diyCheck: "Feel for air leaks at duct joints. Typical homes lose 20-30% of conditioned air through duct leaks." },
        { title: "Low refrigerant charge", likelihood: "Moderate", likelihoodPercent: 20, expectedCostLow: 200, expectedCostHigh: 600, diyCheck: "AC runs constantly but doesn't cool well. Pro required to check." },
        { title: "Aging/inefficient equipment", likelihood: "Low", likelihoodPercent: 10, expectedCostLow: 4000, expectedCostHigh: 10000, diyCheck: "Systems older than 15 years may be operating at 50-60% of original efficiency." },
      ],
      diySteps: { title: "Energy efficiency check", steps: ["Replace air filter.", "Check and program thermostat for energy savings (raise 2-3°F in summer, lower 2-3°F in winter).", "Inspect visible ductwork for disconnections or gaps.", "Ensure all vents are open and unblocked.", "Check weatherstripping around doors and windows."], stopCondition: "If bills remain high after basic checks, schedule an energy audit." },
      safetyWarnings: ["Don't seal ducts with standard duct tape — use mastic or foil tape.", "Verify your energy bill isn't higher due to a rate increase before investigating HVAC."],
      redFlags: ["Tech recommends new system without checking ductwork first", "No mention of duct sealing in the estimate"],
      pricingReference: { region: "US National Average", repairLow: 50, repairHigh: 400, replaceLow: 5000, replaceHigh: 12000 },
    },
  ],
  plumbing: [
    {
      id: "no-hot-water",
      symptom: "No hot water",
      systemCategory: "plumbing",
      description: "Water heater is not producing hot water.",
      understanding: {
        whatItIs: "Water heater heats cold water for your home.",
        howItWorks: "Gas burner or electric element heats water in a tank (or tankless coil).",
        keyComponents: ["Burner/Element", "Thermostat", "Pilot light (gas)", "Circuit breaker"],
      },
      possibleCauses: [
        { title: "Pilot light out (Gas)", likelihood: "High", likelihoodPercent: 80, expectedCostLow: 0, expectedCostHigh: 150, diyCheck: "Check if pilot light is lit. Follow instructions on tank to relight." },
        { title: "Tripped breaker (Electric)", likelihood: "High", likelihoodPercent: 70, expectedCostLow: 0, expectedCostHigh: 0, diyCheck: "Check electrical panel for tripped breaker." },
        { title: "Failed heating element", likelihood: "Moderate", likelihoodPercent: 30, expectedCostLow: 150, expectedCostHigh: 350, diyCheck: "Electric water heater: if breaker is on but no hot water, element may be failed." },
        { title: "Sediment buildup", likelihood: "Moderate", likelihoodPercent: 25, expectedCostLow: 100, expectedCostHigh: 250, diyCheck: "Popping or rumbling sounds from tank indicate sediment. Tank may need flushing." },
      ],
      diySteps: { title: "Check basics", steps: ["Check circuit breaker.", "Check pilot light (if gas).", "Check thermostat setting on tank (should be 120°F).", "Listen for rumbling or popping (sediment buildup)."], stopCondition: "Breaker trips immediately after resetting or pilot won't stay lit." },
      safetyWarnings: ["Gas smell = Danger. Leave and call your gas company.", "Never set water heater above 140°F — scald risk.", "If water is pooling at the base, the tank may be corroding — call a plumber."],
      redFlags: ["Pushing for replacement on a new (<6 yr) unit without diagnosis", "Not checking the anode rod condition"],
      pricingReference: { region: "US National Average", repairLow: 150, repairHigh: 400, replaceLow: 1200, replaceHigh: 2500 },
    },
    {
      id: "leaking-pipe",
      symptom: "Leaking or dripping pipe",
      systemCategory: "plumbing",
      description: "Visible water leak from pipe joints, fittings, or pipe body.",
      understanding: {
        whatItIs: "A breach in your plumbing system where water is escaping from its intended path.",
        howItWorks: "Water under pressure flows through supply pipes; drain pipes use gravity. Leaks occur at weak points — joints, corrosion spots, or freeze damage.",
        keyComponents: ["Supply pipes (pressurized)", "Drain pipes (gravity)", "Fittings and joints", "Shut-off valves"],
        healthFactorNote: "Even small leaks waste hundreds of gallons monthly and can cause mold/structural damage.",
      },
      possibleCauses: [
        { title: "Loose fitting or connection", likelihood: "High", likelihoodPercent: 45, expectedCostLow: 0, expectedCostHigh: 100, diyCheck: "Check if the leak is at a threaded joint or compression fitting — may just need tightening." },
        { title: "Corroded pipe", likelihood: "Moderate", likelihoodPercent: 30, expectedCostLow: 150, expectedCostHigh: 500, diyCheck: "Green/white buildup on copper pipes or rust on galvanized pipes indicates corrosion." },
        { title: "Failed pipe seal or gasket", likelihood: "Moderate", likelihoodPercent: 20, expectedCostLow: 50, expectedCostHigh: 200, diyCheck: "Leaks at fixture connections often indicate a worn seal." },
        { title: "Freeze damage", likelihood: "Low", likelihoodPercent: 5, expectedCostLow: 200, expectedCostHigh: 2000, diyCheck: "Pipes in exterior walls or unheated areas are vulnerable in winter." },
      ],
      diySteps: { title: "Stop the leak", steps: ["Turn off water at the nearest shut-off valve.", "Place a bucket or towel to catch water.", "For a dripping joint, try tightening the fitting with a wrench.", "For a crack or hole, apply a pipe repair clamp or pipe tape as a temporary fix.", "Dry the area to prevent water damage."], stopCondition: "If water is spraying or you can't locate the shut-off valve, call a plumber immediately." },
      safetyWarnings: ["Water near electrical — turn off breaker first.", "Don't over-tighten fittings — you can crack them.", "Temporary fixes (tape, putty) are NOT permanent solutions."],
      redFlags: ["Plumber doesn't check for additional leaks in the area", "Excessive markup on simple fitting replacements"],
      pricingReference: { region: "US National Average", repairLow: 75, repairHigh: 350, replaceLow: 500, replaceHigh: 4000 },
    },
    {
      id: "slow-drain",
      symptom: "Slow or clogged drain",
      systemCategory: "plumbing",
      description: "Water drains slowly or not at all from sink, tub, or shower.",
      understanding: {
        whatItIs: "A partial or complete blockage in the drain pipe preventing water from flowing freely.",
        howItWorks: "Water flows by gravity through drain pipes. Hair, soap, grease, and debris accumulate and restrict flow over time.",
        keyComponents: ["Drain opening/stopper", "P-trap", "Branch drain line", "Main drain line", "Vent pipe"],
      },
      possibleCauses: [
        { title: "Hair and soap buildup", likelihood: "High", likelihoodPercent: 55, expectedCostLow: 0, expectedCostHigh: 15, diyCheck: "Remove the drain stopper and check for hair clumps. Very common in bathroom sinks and tubs." },
        { title: "Grease buildup (kitchen)", likelihood: "High", likelihoodPercent: 40, expectedCostLow: 0, expectedCostHigh: 50, diyCheck: "Kitchen drains accumulate grease over time. Hot water and dish soap can help." },
        { title: "Object in P-trap", likelihood: "Moderate", likelihoodPercent: 20, expectedCostLow: 0, expectedCostHigh: 30, diyCheck: "Small items can get caught in the P-trap under the sink." },
        { title: "Main line issue", likelihood: "Low", likelihoodPercent: 10, expectedCostLow: 200, expectedCostHigh: 600, diyCheck: "Multiple slow drains at once suggest a main line issue, not a local clog." },
      ],
      diySteps: { title: "Clear the clog", steps: ["Remove the drain stopper and clear visible hair/debris.", "Try a plunger — use a flat-bottom plunger for sinks, a flanged plunger for toilets.", "Pour boiling water down the drain (not for PVC/plastic pipes).", "Use a drain snake for deeper clogs ($10-20 at hardware stores).", "Baking soda + vinegar: 1/2 cup each, wait 30 min, flush with hot water."], stopCondition: "If multiple drains are slow, sewage smell is present, or water backs up into other fixtures." },
      safetyWarnings: ["Chemical drain cleaners can damage pipes — use sparingly or not at all.", "Wear gloves when handling drain snakes.", "Never mix different chemical drain cleaners."],
      redFlags: ["Plumber recommends hydro-jetting for a simple clog", "Excessive camera inspection fees for a single slow drain"],
      pricingReference: { region: "US National Average", repairLow: 100, repairHigh: 300, replaceLow: 300, replaceHigh: 800 },
    },
    {
      id: "running-toilet",
      symptom: "Toilet runs continuously",
      systemCategory: "plumbing",
      description: "Toilet continues to run after flushing or runs intermittently (phantom flushes).",
      understanding: {
        whatItIs: "Water continuously flows from the tank into the bowl, wasting water and money.",
        howItWorks: "After flushing, the flapper seals the tank, the fill valve refills it, and a float stops the fill when full. A failure in any of these parts causes running.",
        keyComponents: ["Flapper", "Fill valve", "Float mechanism", "Overflow tube", "Flush handle chain"],
        healthFactorNote: "A running toilet can waste 200+ gallons per day — that's $100+/month on your water bill.",
      },
      possibleCauses: [
        { title: "Worn flapper", likelihood: "High", likelihoodPercent: 60, expectedCostLow: 5, expectedCostHigh: 15, diyCheck: "Add a few drops of food coloring to the tank. If color appears in the bowl without flushing, the flapper is leaking." },
        { title: "Chain too long or short", likelihood: "Moderate", likelihoodPercent: 20, expectedCostLow: 0, expectedCostHigh: 5, diyCheck: "The chain should have about 1/2 inch of slack. Too long = catches under flapper. Too short = flapper can't seal." },
        { title: "Fill valve set too high", likelihood: "Moderate", likelihoodPercent: 15, expectedCostLow: 10, expectedCostHigh: 25, diyCheck: "Water level should be about 1 inch below the overflow tube." },
        { title: "Cracked overflow tube", likelihood: "Low", likelihoodPercent: 5, expectedCostLow: 20, expectedCostHigh: 60, diyCheck: "Inspect the overflow tube for cracks. Requires flush valve replacement." },
      ],
      diySteps: { title: "Fix a running toilet", steps: ["Remove tank lid and observe what's happening.", "Check if water is flowing over the overflow tube — if yes, adjust the float.", "Do the food coloring test for flapper leaks.", "If flapper is worn, replace it ($5-10, universal fit at any hardware store).", "Adjust the chain to 1/2 inch of slack."], stopCondition: "If the fill valve is continuously running and adjustments don't help, the fill valve may need replacement." },
      safetyWarnings: ["The water in the tank is clean — safe to put hands in.", "Be careful not to crack the porcelain tank lid."],
      redFlags: ["Plumber recommends full toilet replacement for a simple flapper issue", "Charging more than $200 for a flapper replacement"],
      pricingReference: { region: "US National Average", repairLow: 5, repairHigh: 60, replaceLow: 200, replaceHigh: 500 },
    },
    {
      id: "sewer-smell",
      symptom: "Sewer smell in house",
      systemCategory: "plumbing",
      description: "Rotten egg or sewage odor coming from drains or basement.",
      understanding: {
        whatItIs: "Sewer gases (hydrogen sulfide, methane, ammonia) are entering your living space through the plumbing system.",
        howItWorks: "P-traps under every fixture hold water that blocks sewer gas. Vent pipes allow air flow so drains work properly. If either fails, gas enters.",
        keyComponents: ["P-traps (water seals)", "Vent pipes (through roof)", "Wax ring (toilets)", "Drain connections"],
      },
      possibleCauses: [
        { title: "Dry P-trap", likelihood: "High", likelihoodPercent: 50, expectedCostLow: 0, expectedCostHigh: 0, diyCheck: "Unused sinks, tubs, or floor drains dry out. Simply run water for 30 seconds." },
        { title: "Cracked or missing wax ring", likelihood: "Moderate", likelihoodPercent: 25, expectedCostLow: 10, expectedCostHigh: 30, diyCheck: "Smell around the base of toilets. A failed wax ring leaks sewer gas." },
        { title: "Blocked vent pipe", likelihood: "Moderate", likelihoodPercent: 15, expectedCostLow: 100, expectedCostHigh: 300, diyCheck: "If drains gurgle when you flush, the vent may be blocked (often by leaves or bird nests on the roof)." },
        { title: "Cracked drain pipe", likelihood: "Low", likelihoodPercent: 10, expectedCostLow: 200, expectedCostHigh: 1500, diyCheck: "Smell from walls or floor may indicate a cracked drain pipe in the structure." },
      ],
      diySteps: { title: "Find the source", steps: ["Run water in all unused drains for 30 seconds to refill P-traps.", "Flush all toilets.", "Check for loose toilet connections at the floor.", "Pour a cup of baking soda + vinegar down smelly drains.", "Check the roof vent pipe opening for obstructions (if safely accessible)."], stopCondition: "If smell persists after refilling all P-traps, or if you hear gurgling, call a plumber." },
      safetyWarnings: ["Sewer gas contains methane — ventilate the area.", "Never enter a confined space with sewer gas without proper equipment.", "If the smell is very strong, open windows and consider leaving."],
      redFlags: ["Plumber wants to replace all drains without camera inspection", "No mention of vent pipe inspection"],
      pricingReference: { region: "US National Average", repairLow: 75, repairHigh: 300, replaceLow: 500, replaceHigh: 2000 },
    },
  ],
  electrical: [
    {
      id: "tripping-breaker",
      symptom: "Circuit breaker keeps tripping",
      systemCategory: "electrical",
      description: "Breaker trips repeatedly when reset.",
      understanding: {
        whatItIs: "A circuit breaker is a safety device that cuts power when it detects an overload, short circuit, or ground fault.",
        howItWorks: "Breakers are rated for specific amperages (15A, 20A, etc.). When the circuit draws more than rated, the breaker trips to prevent wire overheating and fire.",
        keyComponents: ["Circuit breaker", "Wiring", "Devices on circuit", "Panel bus bar"],
        healthFactorNote: "Repeatedly tripping breakers indicate an electrical safety issue that directly impacts home health.",
      },
      possibleCauses: [
        { title: "Overloaded circuit", likelihood: "High", likelihoodPercent: 45, expectedCostLow: 0, expectedCostHigh: 50, diyCheck: "Add up the wattage of everything on the circuit. A 15A circuit handles ~1,800W, a 20A handles ~2,400W." },
        { title: "Short circuit in device", likelihood: "Moderate", likelihoodPercent: 30, expectedCostLow: 0, expectedCostHigh: 100, diyCheck: "Unplug everything, reset breaker, plug items in one at a time." },
        { title: "Worn or faulty breaker", likelihood: "Moderate", likelihoodPercent: 15, expectedCostLow: 150, expectedCostHigh: 300, diyCheck: "Breakers have a lifespan of 25-40 years. Older breakers may trip prematurely." },
        { title: "Short circuit in wiring", likelihood: "Low", likelihoodPercent: 10, expectedCostLow: 200, expectedCostHigh: 800, diyCheck: "If breaker trips with nothing plugged in, the wiring itself may have a fault." },
      ],
      diySteps: { title: "Diagnose the trip", steps: ["Unplug ALL devices on the tripping circuit.", "Reset the breaker (flip fully OFF, then ON).", "If it stays on, plug devices in one at a time, waiting a minute between each.", "The device that causes the trip is the problem.", "If it trips with nothing plugged in, the wiring needs professional inspection."], stopCondition: "If breaker trips with nothing plugged in, or you smell burning, stop and call an electrician." },
      safetyWarnings: ["Never hold a breaker in the ON position.", "Never replace a breaker with a higher-amperage one.", "If you see scorch marks or smell burning at the panel, call an electrician immediately.", "A breaker that feels hot to the touch is a fire risk."],
      redFlags: ["Electrician suggests a higher-amp breaker instead of fixing the root cause", "No load calculation performed"],
      pricingReference: { region: "US National Average", repairLow: 100, repairHigh: 400, replaceLow: 1500, replaceHigh: 4000 },
    },
    {
      id: "dead-outlet",
      symptom: "Outlet not working",
      systemCategory: "electrical",
      description: "One or more outlets have no power.",
      understanding: {
        whatItIs: "An electrical outlet that's not providing power despite the circuit being energized.",
        howItWorks: "Outlets are wired in series or parallel along circuits. A problem at one outlet can affect downstream outlets.",
        keyComponents: ["Outlet/receptacle", "Circuit breaker", "GFCI outlets (upstream)", "Wiring connections"],
      },
      possibleCauses: [
        { title: "Tripped GFCI outlet upstream", likelihood: "High", likelihoodPercent: 45, expectedCostLow: 0, expectedCostHigh: 0, diyCheck: "Check all GFCI outlets (with TEST/RESET buttons) in kitchen, bathroom, garage, and outdoors. One tripped GFCI can kill multiple outlets." },
        { title: "Tripped circuit breaker", likelihood: "Moderate", likelihoodPercent: 30, expectedCostLow: 0, expectedCostHigh: 0, diyCheck: "Check your breaker panel. A tripped breaker sits in the middle position." },
        { title: "Loose wire connection", likelihood: "Moderate", likelihoodPercent: 15, expectedCostLow: 75, expectedCostHigh: 200, diyCheck: "If only one outlet is dead and breakers/GFCI are fine, a connection may be loose inside." },
        { title: "Failed outlet", likelihood: "Low", likelihoodPercent: 10, expectedCostLow: 50, expectedCostHigh: 150, diyCheck: "Outlets can wear out after decades of use. Look for discoloration or damage." },
      ],
      diySteps: { title: "Restore power", steps: ["Check all GFCI outlets in the home and press RESET on any that have tripped.", "Check the breaker panel — look for breakers in the middle (tripped) position.", "Test the outlet with a lamp or phone charger (not a sensitive device).", "If a single outlet is dead with everything else working, the outlet itself may need replacement."], stopCondition: "Do not open outlet covers if you're not comfortable with electrical work. No outlet repair should be done with the circuit energized." },
      safetyWarnings: ["Always turn off the breaker before working on any outlet.", "Use a non-contact voltage tester to verify power is off.", "Do not use outlets that are warm, discolored, or spark when plugging in."],
      redFlags: ["Electrician charges a full diagnostic fee to reset a GFCI", "Unnecessary outlet upgrades pushed"],
      pricingReference: { region: "US National Average", repairLow: 50, repairHigh: 200, replaceLow: 100, replaceHigh: 400 },
    },
    {
      id: "flickering-lights",
      symptom: "Lights flickering",
      systemCategory: "electrical",
      description: "Lights dim, flicker, or buzz.",
      understanding: {
        whatItIs: "Irregular power delivery to light fixtures causing visible fluctuations in brightness.",
        howItWorks: "Steady voltage is needed for consistent light output. Fluctuations can be caused by loose connections, overloaded circuits, or utility issues.",
        keyComponents: ["Bulb and socket", "Light switch", "Wiring connections", "Circuit breaker", "Utility connection"],
        healthFactorNote: "Persistent flickering throughout the house can indicate a dangerous neutral wire issue.",
      },
      possibleCauses: [
        { title: "Loose or incompatible bulb", likelihood: "High", likelihoodPercent: 35, expectedCostLow: 0, expectedCostHigh: 20, diyCheck: "Tighten the bulb. If LED on a dimmer, ensure the dimmer is LED-compatible." },
        { title: "Loose wire connection", likelihood: "Moderate", likelihoodPercent: 25, expectedCostLow: 75, expectedCostHigh: 250, diyCheck: "If one fixture flickers, the connection at the switch or fixture box may be loose." },
        { title: "Overloaded circuit", likelihood: "Moderate", likelihoodPercent: 20, expectedCostLow: 0, expectedCostHigh: 300, diyCheck: "Lights dim when appliance starts (AC, microwave). Brief dimming can be normal." },
        { title: "Utility or main connection issue", likelihood: "Low", likelihoodPercent: 10, expectedCostLow: 0, expectedCostHigh: 500, diyCheck: "Whole-house flickering, especially during wind, may indicate a loose utility connection." },
      ],
      diySteps: { title: "Identify the cause", steps: ["Tighten the bulb in the socket.", "If on a dimmer, try replacing with a non-dimmed LED-compatible dimmer.", "Note if flickering happens when specific appliances turn on.", "Check if neighbors have the same issue (utility problem).", "If isolated to one room, check the connections at the light switch (breaker off first)."], stopCondition: "Whole-house flickering or flickering that gets worse over time requires professional diagnosis." },
      safetyWarnings: ["Whole-house flickering can indicate a dangerous neutral issue — call an electrician.", "Burning smell with flickering is an emergency.", "Don't ignore flickering that's getting progressively worse."],
      redFlags: ["Electrician doesn't check the main panel connections", "Suggests rewiring the whole house for a single flickering light"],
      pricingReference: { region: "US National Average", repairLow: 75, repairHigh: 300, replaceLow: 200, replaceHigh: 1000 },
    },
    {
      id: "warm-outlet",
      symptom: "Outlet or switch plate feels warm",
      systemCategory: "electrical",
      description: "Electrical outlet or switch plate is warm or hot to the touch.",
      understanding: {
        whatItIs: "Heat at an outlet indicates excessive current draw, a loose connection, or a failing component.",
        howItWorks: "Electricity flowing through resistance creates heat. A properly wired outlet should not generate noticeable heat.",
        keyComponents: ["Outlet/receptacle", "Wire connections (backstab vs screw)", "Wire gauge", "Device load"],
        healthFactorNote: "A warm outlet is one of the top warning signs of an electrical fire risk.",
      },
      possibleCauses: [
        { title: "Overloaded outlet", likelihood: "High", likelihoodPercent: 40, expectedCostLow: 0, expectedCostHigh: 50, diyCheck: "Check total wattage of devices plugged in. Reduce the load." },
        { title: "Loose wire connection (backstab)", likelihood: "High", likelihoodPercent: 35, expectedCostLow: 75, expectedCostHigh: 200, diyCheck: "Many outlets use push-in (backstab) connections that loosen over time. These generate heat." },
        { title: "Failing outlet", likelihood: "Moderate", likelihoodPercent: 15, expectedCostLow: 50, expectedCostHigh: 150, diyCheck: "Internal springs wear out, creating a loose plug connection and heat." },
        { title: "Undersized wiring", likelihood: "Low", likelihoodPercent: 10, expectedCostLow: 300, expectedCostHigh: 1000, diyCheck: "In older homes, 14-gauge wire on 20-amp circuits can overheat." },
      ],
      diySteps: { title: "Reduce the risk", steps: ["Immediately unplug devices from the warm outlet.", "Reduce the load — don't plug high-wattage devices into the same outlet.", "Feel the outlet plate every day for a week — if it's warm with nothing plugged in, call an electrician immediately.", "Do not use the outlet until an electrician inspects it if it's hot to the touch."], stopCondition: "If the outlet is HOT (not just warm), discolored, or has a burning smell, turn off the breaker and call an electrician." },
      safetyWarnings: ["A hot outlet is a fire hazard — take it seriously.", "Never ignore discolored outlet plates.", "If you see melted plastic or scorch marks, turn off the breaker immediately.", "Dimmer switches are normally warm — but they shouldn't be hot."],
      redFlags: ["Electrician says warm outlets are normal", "No inspection of wire connections inside the outlet box"],
      pricingReference: { region: "US National Average", repairLow: 75, repairHigh: 250, replaceLow: 150, replaceHigh: 500 },
    },
  ],
  appliances: [
    {
      id: "fridge-not-cooling",
      symptom: "Refrigerator not cooling",
      systemCategory: "appliances",
      description: "Fridge running but food not staying cold.",
      understanding: {
        whatItIs: "Your refrigerator uses a compressor-driven refrigeration cycle to remove heat from the food compartment.",
        howItWorks: "Compressor compresses refrigerant → condenser coils release heat → expansion valve drops pressure → evaporator coils absorb heat from inside → cycle repeats.",
        keyComponents: ["Compressor", "Condenser coils (rear/bottom)", "Evaporator coils (inside)", "Thermostat", "Fans (condenser and evaporator)"],
        healthFactorNote: "Dirty condenser coils are the #1 preventable cause of refrigerator failure.",
      },
      possibleCauses: [
        { title: "Dirty condenser coils", likelihood: "High", likelihoodPercent: 40, expectedCostLow: 0, expectedCostHigh: 30, diyCheck: "Pull fridge from wall and check coils on the back or underneath. Dusty/pet-hair-covered coils can't release heat." },
        { title: "Blocked air vents", likelihood: "High", likelihoodPercent: 30, expectedCostLow: 0, expectedCostHigh: 0, diyCheck: "Cold air flows from the freezer to the fridge. Don't block the vents between compartments." },
        { title: "Failed evaporator fan", likelihood: "Moderate", likelihoodPercent: 15, expectedCostLow: 100, expectedCostHigh: 250, diyCheck: "Open the freezer — you should hear the fan running. No fan = no air circulation." },
        { title: "Compressor failure", likelihood: "Low", likelihoodPercent: 10, expectedCostLow: 300, expectedCostHigh: 600, diyCheck: "If the fridge is completely silent (no humming), the compressor may have failed." },
      ],
      diySteps: { title: "Restore cooling", steps: ["Check the temperature setting — it may have been bumped.", "Clean the condenser coils (unplug first, use a coil brush or vacuum).", "Ensure air vents between freezer and fridge aren't blocked.", "Check the door gasket seal — close a dollar bill in the door; if it slides out easily, the seal is worn.", "Don't overfill the fridge — air needs to circulate."], stopCondition: "If the compressor isn't running at all or makes clicking sounds, professional service is needed." },
      safetyWarnings: ["Unplug the fridge before cleaning coils.", "Food safety: Fridge should be below 40°F. Discard perishables if temp was above 40°F for 4+ hours."],
      redFlags: ["Repair tech recommends compressor replacement without checking simpler causes first", "Quoted repair cost exceeds 50% of new fridge price"],
      pricingReference: { region: "US National Average", repairLow: 100, repairHigh: 400, replaceLow: 800, replaceHigh: 2500 },
    },
    {
      id: "dishwasher-not-draining",
      symptom: "Dishwasher not draining",
      systemCategory: "appliances",
      description: "Standing water in dishwasher after cycle completes.",
      understanding: {
        whatItIs: "Water is not being pumped out of the dishwasher at the end of the wash or rinse cycle.",
        howItWorks: "A drain pump pushes water through the drain hose, which typically connects to the garbage disposal or a direct drain under the sink.",
        keyComponents: ["Drain pump", "Drain hose", "Air gap or high loop", "Garbage disposal connection", "Filter/trap"],
      },
      possibleCauses: [
        { title: "Clogged filter/trap", likelihood: "High", likelihoodPercent: 40, expectedCostLow: 0, expectedCostHigh: 0, diyCheck: "Remove the bottom rack, find the filter at the bottom, and clean it under running water." },
        { title: "Garbage disposal knockout plug", likelihood: "High", likelihoodPercent: 25, expectedCostLow: 0, expectedCostHigh: 100, diyCheck: "If you just installed a new garbage disposal, the knockout plug may not have been removed." },
        { title: "Kinked drain hose", likelihood: "Moderate", likelihoodPercent: 20, expectedCostLow: 0, expectedCostHigh: 50, diyCheck: "Check the drain hose under the sink for kinks or blockages." },
        { title: "Failed drain pump", likelihood: "Low", likelihoodPercent: 10, expectedCostLow: 150, expectedCostHigh: 350, diyCheck: "If you don't hear the pump activate during drain cycle, it may need replacement." },
      ],
      diySteps: { title: "Clear the drain", steps: ["Remove the bottom rack and check/clean the filter.", "Run the garbage disposal — the dishwasher drains through it.", "Check the drain hose under the sink for kinks.", "Pour 1 cup of baking soda and 1 cup of vinegar into the dishwasher, wait 15 min, then run a short cycle.", "Check the air gap (if present) on the countertop — remove the cap and clear any debris."], stopCondition: "If the drain pump makes no sound at all during the cycle, it likely needs replacement." },
      safetyWarnings: ["Don't use chemical drain cleaners in a dishwasher.", "Scoop out standing water with cups/towels before working underneath."],
      redFlags: ["Tech recommends new dishwasher for a simple clog", "No check of disposal connection"],
      pricingReference: { region: "US National Average", repairLow: 75, repairHigh: 250, replaceLow: 500, replaceHigh: 1200 },
    },
    {
      id: "washer-leaking",
      symptom: "Washing machine leaking",
      systemCategory: "appliances",
      description: "Water pooling around or under the washing machine.",
      understanding: {
        whatItIs: "Water is escaping from the washer during fill, wash, or drain cycles.",
        howItWorks: "Supply hoses bring water in, the tub holds it during wash, and a drain pump and hose remove it. Seals and gaskets prevent leaks throughout.",
        keyComponents: ["Supply hoses (hot and cold)", "Door gasket (front loaders)", "Drain hose", "Tub seal", "Water pump"],
        healthFactorNote: "Burst supply hoses are a leading cause of home water damage — $5,000+ average insurance claim.",
      },
      possibleCauses: [
        { title: "Loose or worn supply hoses", likelihood: "High", likelihoodPercent: 40, expectedCostLow: 10, expectedCostHigh: 30, diyCheck: "Check both supply hose connections for drips. Replace rubber hoses with braided stainless steel." },
        { title: "Worn door gasket (front loader)", likelihood: "Moderate", likelihoodPercent: 25, expectedCostLow: 50, expectedCostHigh: 200, diyCheck: "Inspect the rubber gasket around the door for tears, mold, or debris." },
        { title: "Overloading or too much detergent", likelihood: "Moderate", likelihoodPercent: 20, expectedCostLow: 0, expectedCostHigh: 0, diyCheck: "Excessive suds can cause leaks. Use HE detergent in HE machines." },
        { title: "Drain hose issue", likelihood: "Low", likelihoodPercent: 10, expectedCostLow: 20, expectedCostHigh: 100, diyCheck: "Check that the drain hose is secure in the standpipe and not cracked." },
      ],
      diySteps: { title: "Find and fix the leak", steps: ["Identify when the leak occurs: during fill, wash, or drain.", "Check supply hose connections — tighten or replace if dripping.", "For front loaders: clean the door gasket and check for tears.", "Reduce detergent amount and load size.", "Check the drain hose and standpipe connection."], stopCondition: "If the leak is from underneath the machine (internal pump/tub seal), professional repair is needed." },
      safetyWarnings: ["Unplug the washer before inspecting.", "Water near electrical outlets — turn off breaker if water is spreading.", "Supply hoses can burst — replace rubber hoses every 5 years."],
      redFlags: ["Repair tech doesn't check supply hoses first", "Charging for internal repair when the issue is an external hose"],
      pricingReference: { region: "US National Average", repairLow: 50, repairHigh: 300, replaceLow: 600, replaceHigh: 1500 },
    },
    {
      id: "dryer-not-heating",
      symptom: "Dryer not heating",
      systemCategory: "appliances",
      description: "Dryer tumbles but clothes stay wet.",
      understanding: {
        whatItIs: "The dryer's heating system has failed or is restricted, so clothes tumble in unheated air.",
        howItWorks: "Gas burner or electric heating element heats air → blower pushes hot air through the drum → moisture evaporates → humid air exits through the vent.",
        keyComponents: ["Heating element (electric) or gas ignitor/valve", "Thermal fuse", "Thermostat", "Dryer vent (exhaust duct)", "Lint trap"],
        healthFactorNote: "A clogged dryer vent is the #1 cause of dryer fires — 2,900+ fires per year in the US.",
      },
      possibleCauses: [
        { title: "Clogged dryer vent", likelihood: "High", likelihoodPercent: 40, expectedCostLow: 0, expectedCostHigh: 30, diyCheck: "Disconnect the vent from the back of the dryer and feel for blockage. Check the exterior flap." },
        { title: "Blown thermal fuse", likelihood: "High", likelihoodPercent: 30, expectedCostLow: 15, expectedCostHigh: 80, diyCheck: "A blown thermal fuse (usually from a clogged vent) prevents the heating element from activating." },
        { title: "Half-tripped breaker (electric)", likelihood: "Moderate", likelihoodPercent: 15, expectedCostLow: 0, expectedCostHigh: 0, diyCheck: "Electric dryers use 240V from a double-pole breaker. If one pole trips, the drum spins but no heat." },
        { title: "Failed heating element or ignitor", likelihood: "Low", likelihoodPercent: 10, expectedCostLow: 100, expectedCostHigh: 300, diyCheck: "If the vent is clear and the breaker is fine, the heating component may have failed." },
      ],
      diySteps: { title: "Restore dryer heat", steps: ["Clean the lint trap thoroughly.", "Disconnect and clean the dryer vent duct.", "Check that the exterior vent flap opens freely.", "For electric dryers: check that both poles of the 240V breaker are ON.", "Run the dryer for 5 minutes and check if the exhaust air is hot at the exterior vent."], stopCondition: "Gas dryers that don't heat after vent cleaning should be serviced by a professional." },
      safetyWarnings: ["Never vent a dryer indoors — carbon monoxide risk for gas dryers, moisture damage for all.", "Clean the lint trap before every load.", "Dryer vents should be cleaned annually — this prevents fires.", "For gas dryers: if you smell gas, turn off the gas valve and ventilate."],
      redFlags: ["Tech doesn't check or clean the dryer vent", "Recommends new dryer without checking thermal fuse or vent"],
      pricingReference: { region: "US National Average", repairLow: 50, repairHigh: 300, replaceLow: 500, replaceHigh: 1200 },
    },
    {
      id: "garbage-disposal-jammed",
      symptom: "Garbage disposal jammed",
      systemCategory: "appliances",
      description: "Disposal hums but doesn't spin, or won't turn on at all.",
      understanding: {
        whatItIs: "A motorized grinder installed in the sink drain that shreds food waste into small particles that can flow through plumbing.",
        howItWorks: "A motor spins a flywheel with impellers that fling food against a grinding ring, breaking it into small pieces.",
        keyComponents: ["Motor", "Flywheel and impellers", "Grinding ring", "Reset button (overload protector)", "Splash guard"],
      },
      possibleCauses: [
        { title: "Foreign object jamming flywheel", likelihood: "High", likelihoodPercent: 50, expectedCostLow: 0, expectedCostHigh: 0, diyCheck: "Bones, utensils, or hard items can jam the flywheel. Use an Allen wrench in the bottom hex hole to free it." },
        { title: "Tripped reset button", likelihood: "High", likelihoodPercent: 30, expectedCostLow: 0, expectedCostHigh: 0, diyCheck: "Press the red reset button on the bottom of the unit firmly." },
        { title: "Burned out motor", likelihood: "Low", likelihoodPercent: 15, expectedCostLow: 150, expectedCostHigh: 400, diyCheck: "If the unit makes no sound at all and reset doesn't help, the motor may be dead." },
        { title: "Tripped circuit breaker", likelihood: "Low", likelihoodPercent: 5, expectedCostLow: 0, expectedCostHigh: 0, diyCheck: "Check the breaker panel for a tripped breaker on the disposal circuit." },
      ],
      diySteps: { title: "Unjam the disposal", steps: ["Turn OFF the wall switch and unplug (or turn off breaker).", "Insert a 1/4-inch Allen wrench into the hex hole on the bottom of the disposal.", "Turn back and forth to free the jam.", "Use tongs or pliers (NEVER hands) to remove any debris from the top.", "Press the red reset button on the bottom.", "Plug back in and test."], stopCondition: "If the motor makes no sound at all, or the reset button won't stay pressed, the disposal likely needs replacement." },
      safetyWarnings: ["NEVER put your hand into a garbage disposal, even when off.", "Always disconnect power before attempting any fix.", "Don't pour chemical drain cleaners into a disposal."],
      redFlags: ["Plumber wants to replace a disposal that just needs an Allen wrench unjam", "Excessive labor charges for a 20-minute replacement"],
      pricingReference: { region: "US National Average", repairLow: 0, repairHigh: 50, replaceLow: 150, replaceHigh: 400 },
    },
  ],
};
