/**
 * Seasonal Intelligence Content — NW Florida baseline
 *
 * Structured seasonal maintenance tasks, alerts, and guidance for each season.
 * Used by the proactive insights engine and AI advisor to surface timely,
 * region-specific advice.
 *
 * Baseline: NW Florida (Panama City / Pensacola / Gulf Coast)
 * Climate: Subtropical, high humidity, hurricane zone, hard water, salt air
 */

export interface SeasonalTask {
  name: string;
  description: string;
  systemCategory: string;
  priority: "low" | "medium" | "high" | "urgent";
  estimatedCost?: { diy: string; pro: string };
  whyNow: string;
  tipFromField?: string;
}

export interface SeasonalAlert {
  title: string;
  body: string;
  type: "weather" | "pest" | "efficiency" | "safety" | "budget";
  priority: "low" | "medium" | "high" | "urgent";
}

export interface SeasonalContent {
  season: string;
  months: string;
  description: string;
  tasks: SeasonalTask[];
  alerts: SeasonalAlert[];
}

// ============================================================
// SPRING — March through May
// ============================================================

const spring: SeasonalContent = {
  season: "spring",
  months: "March–May",
  description: "Transition from mild winter to full cooling season. Pollen peaks, humidity climbs, and hurricane prep window opens. The single best time of year to get ahead of your home's biggest stressors.",
  tasks: [
    {
      name: "Schedule HVAC tune-up",
      description: "Professional pre-season AC service: check refrigerant levels, clean evaporator coil, inspect electrical connections, verify thermostat calibration, and clear the condensate drain line.",
      systemCategory: "hvac",
      priority: "high",
      estimatedCost: { diy: "N/A", pro: "$80-$150" },
      whyNow: "HVAC companies are less busy in March/April than during the summer emergency rush. You'll get better scheduling, lower prices, and avoid being without AC when it's 95°F in July.",
      tipFromField: "Book before April 15. After that, every AC company in NW Florida is slammed and you're looking at 2-3 week waits."
    },
    {
      name: "Replace HVAC air filter",
      description: "Spring pollen in NW Florida is intense (pine, oak, and grass). Replace the filter even if it was recently changed — pollen loads can clog a filter in 2-3 weeks.",
      systemCategory: "hvac",
      priority: "high",
      estimatedCost: { diy: "$5-$30", pro: "N/A" },
      whyNow: "Pollen season peaks March-April. A clogged filter reduces cooling efficiency and can trigger allergy symptoms inside the home.",
      tipFromField: "If you have pine trees near your outdoor unit, check the condenser too — pine pollen creates a thick yellow-green film on the coil fins."
    },
    {
      name: "Clear and treat AC condensate drain line",
      description: "Pour 1 cup of vinegar or 50/50 bleach-water mix down the drain line cleanout. Algae growth accelerates rapidly as humidity climbs.",
      systemCategory: "hvac",
      priority: "high",
      estimatedCost: { diy: "$2", pro: "$75-$125" },
      whyNow: "As humidity returns, algae and biofilm start growing in the drain line immediately. A clogged drain line is the #1 cause of AC shutoffs in our region. Get ahead of it now.",
      tipFromField: "Start monthly treatments in March and continue through October. A $2 bottle of vinegar every month prevents a $100+ emergency service call."
    },
    {
      name: "Schedule termite inspection",
      description: "Annual termite inspection by a licensed pest control company. NW Florida is in the highest termite pressure zone in the country.",
      systemCategory: "structural",
      priority: "high",
      estimatedCost: { diy: "N/A", pro: "$75-$100" },
      whyNow: "Subterranean termite swarm season peaks in March-May in the Gulf Coast. If you see winged insects near windows or foundations, don't wait.",
      tipFromField: "Formosan termites (common here) can cause more damage in 6 months than native species cause in 5 years. Don't skip this one."
    },
    {
      name: "Pressure wash exterior",
      description: "Clean siding, driveway, walkways, and patio. Gulf Coast humidity creates mold, mildew, and algae growth on every exterior surface.",
      systemCategory: "exterior",
      priority: "medium",
      estimatedCost: { diy: "$0 (if you own the washer)", pro: "$200-$400" },
      whyNow: "Winter moisture combined with warming temperatures creates peak mold/mildew growth. Cleaning now prevents staining and surface degradation.",
      tipFromField: "Go easy on vinyl siding — high pressure will blow water behind the siding. Use a wide fan tip and keep 12+ inches away."
    },
    {
      name: "Begin hurricane preparedness planning",
      description: "Review your hurricane plan: verify shutters/plywood are accessible, check generator fuel and operation, inventory emergency supplies, verify insurance documentation is current.",
      systemCategory: "exterior",
      priority: "medium",
      estimatedCost: { diy: "$0-$200", pro: "N/A" },
      whyNow: "Hurricane season starts June 1. Supplies sell out fast once forecasts start. Plywood, generators, and water disappear from stores within hours of a tropical system forming.",
      tipFromField: "Know the location of your main water shutoff, gas shutoff, and main electrical breaker. If you evacuate, shut all three off."
    },
    {
      name: "Flush water heater",
      description: "Drain and flush the tank to remove sediment buildup. Hard water from the FL limestone aquifer accelerates buildup at ~2x the national rate.",
      systemCategory: "plumbing",
      priority: "medium",
      estimatedCost: { diy: "$0", pro: "$100-$150" },
      whyNow: "Spring is an ideal time — the tank has worked through cooler months and sediment has settled. Flushing before summer's peak demand keeps the system efficient.",
      tipFromField: "If you're on well water in NW Florida, your hardness might be 300+ ppm. Flush every 6 months minimum. Municipal water is usually 180-250 ppm — still hard."
    },
  ],
  alerts: [
    {
      title: "Pollen season peak — check your filter",
      body: "NW Florida pine and oak pollen peaks in March-April. Your HVAC filter may need changing twice as often during this period. Check it every 2 weeks.",
      type: "efficiency",
      priority: "medium",
    },
    {
      title: "Termite swarm season active",
      body: "Subterranean termites swarm in NW Florida from March through May. Watch for winged insects near windows, foundations, and in bathrooms. If you see them, call a licensed pest company immediately.",
      type: "pest",
      priority: "high",
    },
    {
      title: "Hurricane prep window open",
      body: "June 1 is the official start of hurricane season. Stock up on supplies, verify insurance, and test your generator NOW while everything is available and calm.",
      type: "safety",
      priority: "medium",
    },
  ],
};

// ============================================================
// SUMMER — June through August
// ============================================================

const summer: SeasonalContent = {
  season: "summer",
  months: "June–August",
  description: "Peak cooling demand, hurricane season active, and the hardest 3 months on your AC system. Humidity is relentless (75-90%), afternoon thunderstorms are daily, and everything outside corrodes faster.",
  tasks: [
    {
      name: "Check and replace HVAC filter monthly",
      description: "The AC runs nearly 24/7 in NW Florida summers. Filters clog faster when the system runs continuously. Check every 30 days, replace if dirty.",
      systemCategory: "hvac",
      priority: "high",
      estimatedCost: { diy: "$5-$30", pro: "N/A" },
      whyNow: "A clogged filter in summer forces your AC to work harder, increases energy bills 10-15%, and can cause the evaporator coil to freeze.",
      tipFromField: "In July-August, I've pulled filters that were completely matted after just 3 weeks. If your house has pets, check every 2 weeks."
    },
    {
      name: "Clear condensate drain line monthly",
      description: "Pour vinegar down the drain line cleanout each month. In peak humidity, algae can clog the line in 3-4 weeks.",
      systemCategory: "hvac",
      priority: "high",
      estimatedCost: { diy: "$2", pro: "$75-$125" },
      whyNow: "The AC is pulling gallons of moisture from the air daily. All that water flows through the drain line, creating a perfect algae breeding ground. Monthly treatment prevents the #1 summer AC emergency.",
      tipFromField: "If you ever come home to a puddle around the air handler or the AC just stopped working — the drain line is the first thing to check. 9 times out of 10, that's it."
    },
    {
      name: "Monitor indoor humidity levels",
      description: "Indoor humidity should stay between 45-55%. If it's consistently above 60%, your AC may be oversized (short-cycling) or the fan is set to ON instead of AUTO.",
      systemCategory: "hvac",
      priority: "medium",
      estimatedCost: { diy: "$10-$30 (hygrometer)", pro: "N/A" },
      whyNow: "Summer humidity in NW Florida regularly exceeds 80% outdoors. Your AC is your primary dehumidifier. If it's not doing its job, you'll see mold, musty smells, and condensation on windows.",
      tipFromField: "A $15 hygrometer from Amazon is one of the best investments you can make. Put it in a central hallway. If it reads above 60% consistently, something needs adjusting."
    },
    {
      name: "Inspect outdoor condenser unit",
      description: "Check for debris buildup, bent fins, vegetation encroachment, and corrosion. Rinse with a garden hose monthly during peak season.",
      systemCategory: "hvac",
      priority: "medium",
      estimatedCost: { diy: "$0", pro: "N/A" },
      whyNow: "Daily thunderstorms blow debris into the unit, and organic growth is aggressive. A dirty condenser can reduce cooling capacity 10-25%.",
      tipFromField: "After every major thunderstorm, glance at the condenser. I've seen palm fronds, shingle pieces, and even trash bags wrapped around units after storms."
    },
    {
      name: "Verify hurricane readiness",
      description: "Verify shutters work, generator has fresh fuel, water supply is stocked, insurance documents are accessible, and you know your shutoff locations.",
      systemCategory: "exterior",
      priority: "urgent",
      estimatedCost: { diy: "$0-$100", pro: "N/A" },
      whyNow: "Peak hurricane season is August-October. Be ready BEFORE a system enters the Gulf. Once a storm is named and heading this way, you're out of time.",
      tipFromField: "Know your three shutoffs: main water valve, main gas valve (if applicable), and main electrical breaker. Write the locations down and tape the list inside your breaker panel."
    },
  ],
  alerts: [
    {
      title: "Peak AC demand — monitor your system",
      body: "Your AC is working its hardest right now. If it's struggling to keep up (running constantly but house won't cool below 78°F), that's a sign of a problem — don't wait for it to fail completely.",
      type: "efficiency",
      priority: "high",
    },
    {
      title: "Hurricane season active",
      body: "Hurricane season runs June 1 through November 30. Peak activity is August through October. Have your plan ready and supplies stocked.",
      type: "safety",
      priority: "urgent",
    },
    {
      title: "Lightning surge risk elevated",
      body: "NW Florida has some of the highest lightning strike density in the US. Daily afternoon thunderstorms bring significant surge risk. Verify your surge protection is working.",
      type: "safety",
      priority: "medium",
    },
  ],
};

// ============================================================
// FALL — September through November
// ============================================================

const fall: SeasonalContent = {
  season: "fall",
  months: "September–November",
  description: "Hurricane season continues through November 30. Cooling demand drops in October-November. This is the ideal window for major maintenance, inspections, and planning work that's hard to do in summer heat.",
  tasks: [
    {
      name: "Post-hurricane season inspection",
      description: "Once the immediate threat has passed (November 30), do a thorough exterior inspection: roof, gutters, soffits, screens, outdoor HVAC unit, fencing, and drainage.",
      systemCategory: "exterior",
      priority: "high",
      estimatedCost: { diy: "$0", pro: "$200-$400 (professional inspection)" },
      whyNow: "Even if you didn't take a direct hit, tropical storms and strong thunderstorms can cause damage that isn't immediately obvious. Loose shingles, lifted flashing, and gutter damage compound over time.",
      tipFromField: "Walk around the house and look UP. Missing or lifted shingles, damaged soffit panels, and bent gutter hangers are easy to spot from ground level with binoculars."
    },
    {
      name: "Clean gutters and downspouts",
      description: "Remove leaves, pine needles, and debris from gutters. Check that downspouts discharge at least 3-4 feet from the foundation.",
      systemCategory: "exterior",
      priority: "high",
      estimatedCost: { diy: "$0", pro: "$100-$200" },
      whyNow: "Fall leaf drop plus summer storm debris creates the perfect gutter clog. Clogged gutters cause fascia rot, foundation issues, and landscape erosion in our heavy rain environment.",
      tipFromField: "Pine needles are the worst — they mat together and create a dam that looks fine from below but is completely blocked. If you have pine trees, check gutters quarterly."
    },
    {
      name: "Water heater maintenance",
      description: "Flush the tank, inspect the anode rod, test the T&P valve, and check for leaks or corrosion. Fall is the perfect time — moderate temperatures and lower demand.",
      systemCategory: "plumbing",
      priority: "high",
      estimatedCost: { diy: "$0-$30", pro: "$100-$150" },
      whyNow: "Before the mild 'winter' demand spike (tank works a bit harder heating cooler inlet water), service the unit. This extends its life and catches problems before the holiday season.",
      tipFromField: "If the anode rod is less than 1/2 inch thick or heavily pitted, replace it now. A $30 anode rod can add 2-3 years to a tank's life."
    },
    {
      name: "Inspect roof condition",
      description: "Visually inspect the roof from ground level with binoculars. Look for missing, curled, or damaged shingles, damaged flashing, and any signs of wear.",
      systemCategory: "structural",
      priority: "medium",
      estimatedCost: { diy: "$0", pro: "$250-$500 (professional inspection)" },
      whyNow: "After hurricane season's wind and rain, fall is the right time to assess roof condition. Catching minor damage now prevents leaks during winter rain events.",
      tipFromField: "Look at the roof valleys and around any penetrations (vents, chimney, satellite dish). That's where 90% of leaks start."
    },
    {
      name: "Winterize hose bibs (freeze protection)",
      description: "Disconnect garden hoses, close interior shutoff valves to outdoor spigots if available, and install foam covers on exposed hose bibs.",
      systemCategory: "plumbing",
      priority: "medium",
      estimatedCost: { diy: "$5-$15", pro: "N/A" },
      whyNow: "NW Florida gets freezing nights 10-20 times per winter. Exposed hose bibs can crack and cause interior wall flooding when they thaw. A $3 foam cover prevents a $500+ repair.",
      tipFromField: "The hose bib on the north side of the house is always the most vulnerable. Don't forget the one in the garage that nobody uses."
    },
    {
      name: "HVAC system transition check",
      description: "Test heating mode if you have a heat pump. Switch the thermostat to HEAT and verify the system produces warm air. This is also a good time to replace the filter.",
      systemCategory: "hvac",
      priority: "medium",
      estimatedCost: { diy: "$0", pro: "N/A" },
      whyNow: "You haven't used heat since last winter. Testing now catches problems while the weather is still mild — you don't want to discover a broken heat pump on the first 30°F night.",
      tipFromField: "When you first switch to heat mode, you might smell a slight burning smell from the heat strips or burner — that's dust burning off. Normal for the first 15-30 minutes. If it persists or smells like plastic/rubber, turn it off and call for service."
    },
  ],
  alerts: [
    {
      title: "Hurricane season continues through Nov 30",
      body: "Some of the most damaging Gulf Coast hurricanes have formed in October and November. Keep your hurricane supplies accessible until December 1.",
      type: "safety",
      priority: "medium",
    },
    {
      title: "Best time for major HVAC work",
      body: "Fall is the ideal window for HVAC replacement or major repair scheduling. Companies are less busy, temperatures are mild, and you won't be without AC during a heat wave.",
      type: "budget",
      priority: "medium",
    },
  ],
};

// ============================================================
// WINTER — December through February
// ============================================================

const winter: SeasonalContent = {
  season: "winter",
  months: "December–February",
  description: "NW Florida winters are mild but include freeze events (typically 10-20 nights below 32°F). The AC is mostly off, making this the perfect time for HVAC replacement planning, system inspections, and budget-friendly projects.",
  tasks: [
    {
      name: "Monitor freeze warnings and protect pipes",
      description: "When freeze warnings are issued: drip exposed faucets, open cabinet doors under sinks on exterior walls, and verify hose bibs are covered and disconnected.",
      systemCategory: "plumbing",
      priority: "urgent",
      estimatedCost: { diy: "$0", pro: "N/A" },
      whyNow: "NW Florida homes are NOT built for sustained freezing. Pipes are often in exterior walls, attics, and crawl spaces with minimal insulation. A burst pipe is one of the most expensive home emergencies.",
      tipFromField: "Set your thermostat to at least 55°F even if you're away. The pipe in the exterior wall behind your kitchen sink is usually the first to freeze. Open that cabinet door on cold nights."
    },
    {
      name: "Test and inspect heating system",
      description: "Run the heat for 30 minutes and verify all rooms are receiving warm air. Check for unusual noises, smells, or cycling patterns.",
      systemCategory: "hvac",
      priority: "high",
      estimatedCost: { diy: "$0", pro: "$80-$150" },
      whyNow: "You need reliable heat on freeze nights. Most Gulf Coast homes use heat pumps — verify it's producing warm air (not just moving room-temperature air). If the outdoor unit is icing up, it may need a refrigerant check.",
      tipFromField: "Heat pump air feels cooler than furnace air — around 90-95°F vs 120-140°F from a gas furnace. That's normal. If the air feels cold or room temperature, something's wrong."
    },
    {
      name: "Inspect anode rod (water heater)",
      description: "Check the anode rod condition. In NW Florida's hard water, anode rods deplete 30-50% faster than the national average.",
      systemCategory: "plumbing",
      priority: "medium",
      estimatedCost: { diy: "$20-$40 (replacement)", pro: "$100-$150" },
      whyNow: "Winter is low-demand season for plumbers — easier to schedule. The anode rod is the sacrificial component that protects your tank from internal corrosion. In our water, it needs checking annually.",
      tipFromField: "If the rod is less than half its original diameter or the steel core wire is visible, replace it. A powered (impressed current) anode rod is a great upgrade — lasts forever instead of 3-5 years."
    },
    {
      name: "Plan and budget for major replacements",
      description: "Review your system ages and Kept forecast data. Winter is the best time to plan and schedule major work: HVAC replacement, water heater swap, roof repairs, or appliance upgrades.",
      systemCategory: "hvac",
      priority: "medium",
      estimatedCost: { diy: "N/A", pro: "Varies" },
      whyNow: "HVAC and plumbing contractors have their lightest schedules in January-February. You'll get better pricing, more scheduling flexibility, and less risk of emergency-rate charges.",
      tipFromField: "If your AC is 12+ years old and the forecast shows high failure probability, schedule the replacement for February-March. You'll be first in line when the good installers still have open calendars."
    },
    {
      name: "Clean and inspect dryer vent",
      description: "Disconnect the dryer, pull it away from the wall, and clean the vent hose and exterior vent flap. Remove any lint buildup.",
      systemCategory: "appliances",
      priority: "medium",
      estimatedCost: { diy: "$0", pro: "$75-$150" },
      whyNow: "Lint buildup is a fire hazard year-round, but winter is when dryers run more (heavier clothing, holiday guests). A clean vent also improves dryer efficiency and reduces energy costs.",
      tipFromField: "Check the exterior vent flap — it should open freely when the dryer runs and close when it stops. If it's stuck or missing the flap, critters and moisture get in."
    },
  ],
  alerts: [
    {
      title: "Freeze protocol active",
      body: "NW Florida freeze events can catch homeowners off guard. When temps drop below 32°F: drip faucets, open cabinet doors, set thermostat to 55°F minimum, and cover exposed hose bibs.",
      type: "weather",
      priority: "urgent",
    },
    {
      title: "Best pricing for HVAC replacement",
      body: "January-February is the slowest season for HVAC contractors in the Gulf Coast. If your system is aging and Kept shows high failure probability, now is the time to get quotes and schedule replacement — before the summer rush.",
      type: "budget",
      priority: "medium",
    },
    {
      title: "Carbon monoxide awareness",
      body: "If you use any gas appliances for heating (gas furnace, gas logs, portable heaters), make sure your CO detector is working. Replace batteries annually and replace the unit every 5-7 years.",
      type: "safety",
      priority: "high",
    },
  ],
};

// ============================================================
// EXPORTS
// ============================================================

export const seasonalContentLibrary: Record<string, SeasonalContent> = {
  spring,
  summer,
  fall,
  winter,
};

/**
 * Get seasonal content for the current season
 */
export function getSeasonalContent(season: string): SeasonalContent | null {
  return seasonalContentLibrary[season.toLowerCase()] ?? null;
}

/**
 * Get all seasonal tasks across all seasons, sorted by priority
 */
export function getAllSeasonalTasks(): (SeasonalTask & { season: string })[] {
  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  const tasks: (SeasonalTask & { season: string })[] = [];

  for (const [season, content] of Object.entries(seasonalContentLibrary)) {
    for (const task of content.tasks) {
      tasks.push({ ...task, season });
    }
  }

  return tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}
