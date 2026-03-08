import { mutation } from "./_generated/server";

/**
 * Seed sample knowledge content for testing
 * Run with: npx convex run knowledgeSeed:seedSampleContent
 */
export const seedSampleContent = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db
      .query("knowledgeArticles")
      .withIndex("by_slug", (q) => q.eq("slug", "hvac-filter-replacement"))
      .first();

    if (existing) {
      return { message: "Already seeded" };
    }

    // =========================================
    // SAMPLE GUIDE: HVAC Filter Replacement
    // =========================================
    const filterGuideId = await ctx.db.insert("knowledgeArticles", {
      slug: "hvac-filter-replacement",
      articleType: "guide",
      systemCategory: "hvac",
      title: "How to Replace Your HVAC Air Filter",
      subtitle: "A complete guide to maintaining optimal air quality",
      summary:
        "Learn how to locate, remove, and replace your HVAC air filter. This routine maintenance task improves air quality, extends system life, and reduces energy costs.",
      contentMarkdown: `
# How to Replace Your HVAC Air Filter

Replacing your HVAC filter is one of the most important maintenance tasks you can do. A clean filter improves air quality, reduces energy consumption, and prevents costly system damage.

## Why Filter Replacement Matters

Your HVAC filter captures dust, pollen, pet dander, and other airborne particles. Over time, this buildup restricts airflow, forcing your system to work harder. This leads to:

- **Higher energy bills** — A clogged filter can increase energy consumption by 5-15%
- **Reduced air quality** — Saturated filters allow particles to bypass into your home
- **System strain** — Restricted airflow can cause overheating and premature failure
- **Uneven heating/cooling** — Some rooms may feel warmer or cooler than others

## How Often to Replace

| Filter Type | Replacement Frequency |
|-------------|----------------------|
| 1" fiberglass | Every 30 days |
| 1" pleated | Every 60-90 days |
| 2" pleated | Every 3-4 months |
| 4" pleated | Every 6-12 months |
| HEPA | Per manufacturer (typically 12 months) |

**Factors that require more frequent replacement:**
- Pets in the home
- Allergies or asthma
- Recent construction or renovation
- Dusty environment
- Running system continuously

## Step-by-Step Replacement

### Step 1: Locate Your Filter

Common filter locations:
- **Return air vent** — Large vent on wall or ceiling
- **Air handler/furnace** — Inside the blower compartment
- **Basement or utility room** — Near the furnace

Look for a slotted opening with a removable cover, typically 1-2 feet wide.

### Step 2: Turn Off the System

For safety and to prevent unfiltered air from circulating:

1. Set thermostat to "OFF" position
2. Wait 30 seconds for blower to stop

### Step 3: Remove the Old Filter

1. Open or remove the filter access cover
2. Note the airflow direction arrow on the filter frame
3. Slide the filter out carefully
4. Inspect the filter — if it's gray and opaque, it's definitely time to replace

### Step 4: Check Filter Size

Read the dimensions printed on the filter frame (e.g., 16x25x1 or 20x20x4). Always replace with the same size.

### Step 5: Insert the New Filter

1. Find the airflow direction arrow on the new filter
2. Point arrow **toward the blower/furnace** (with airflow direction)
3. Slide filter into slot until snug
4. Replace the access cover

### Step 6: Turn System Back On

1. Set thermostat to desired setting
2. Listen for normal operation
3. Check that air flows from vents

## Choosing the Right Filter

### MERV Rating Guide

| MERV | Filters Out | Best For |
|------|-------------|----------|
| 1-4 | Large dust, pollen | Minimal filtration |
| 5-8 | Mold spores, dust mites | Standard residential |
| 9-12 | Fine dust, legionella | Better air quality |
| 13-16 | Bacteria, smoke | Allergies, asthma |
| 17-20 | Viruses, carbon dust | Hospital-grade (special equipment needed) |

**Recommended:** MERV 8-11 for most homes. Higher isn't always better — very high MERV filters can restrict airflow in standard systems.

## Common Mistakes to Avoid

1. **Installing backwards** — Always check the airflow arrow
2. **Wrong size** — Gaps allow unfiltered air to bypass
3. **Running without a filter** — Never do this, even briefly
4. **Forgetting to replace** — Set a calendar reminder

## Signs Your Filter Needs Replacement

- Visible dust buildup on vents
- Increased dust on furniture
- Allergy symptoms worsening
- System running longer than usual
- Higher energy bills
- Musty or dusty smell from vents
`,
      difficulty: "beginner",
      estimatedReadMinutes: 8,
      estimatedTaskMinutes: 10,
      toolsRequired: ["None required"],
      partsRequired: ["Replacement filter (correct size)"],
      safetyWarnings: [
        "Turn off HVAC system before replacing filter",
        "Dispose of old filter in sealed bag to contain dust",
      ],
      keywords: [
        "hvac filter",
        "air filter",
        "furnace filter",
        "ac filter",
        "air quality",
        "MERV rating",
      ],
      status: "published",
      version: 1,
      viewCount: 0,
      helpfulCount: 0,
      notHelpfulCount: 0,
    });

    // Add sections for the filter guide
    await ctx.db.insert("knowledgeSections", {
      articleId: filterGuideId,
      order: 1,
      heading: "Why Filter Replacement Matters",
      slug: "why-it-matters",
      contentMarkdown:
        "Your HVAC filter captures dust, pollen, pet dander, and other airborne particles...",
      isCollapsible: false,
      defaultExpanded: true,
    });

    // =========================================
    // SAMPLE DIAGNOSTIC: AC Not Cooling
    // =========================================
    const acDiagnosticId = await ctx.db.insert("diagnosticTrees", {
      slug: "ac-not-cooling",
      systemCategory: "hvac",
      title: "AC Not Cooling Troubleshooter",
      description:
        "Step-by-step diagnosis when your air conditioner is running but not cooling your home",
      entrySymptom: "Air conditioner running but not cooling",
      status: "published",
      version: 1,
      completionCount: 0,
    });

    // Add diagnostic nodes
    const nodes = [
      {
        nodeKey: "start",
        nodeType: "question" as const,
        title: "Is the AC unit running?",
        contentMarkdown:
          "Check if you can hear the outdoor unit running and feel air coming from vents inside.",
        options: [
          { label: "Yes, running but warm air", nextNodeKey: "check_thermostat" },
          { label: "No, unit won't start", nextNodeKey: "check_power" },
          { label: "Running intermittently", nextNodeKey: "check_cycling" },
        ],
      },
      {
        nodeKey: "check_thermostat",
        nodeType: "observation" as const,
        title: "Check thermostat settings",
        contentMarkdown: `
Verify your thermostat is set correctly:
1. Mode should be set to "COOL" (not "HEAT" or "FAN ONLY")
2. Temperature should be set **below** current room temperature
3. Fan setting should be "AUTO" for normal operation

If thermostat uses batteries, ensure they're not low.
        `,
        options: [
          { label: "Settings correct, still not cooling", nextNodeKey: "check_filter" },
          { label: "Found the issue, fixed it", nextNodeKey: "resolved_thermostat" },
        ],
      },
      {
        nodeKey: "check_filter",
        nodeType: "action" as const,
        title: "Inspect the air filter",
        contentMarkdown: `
A clogged filter is the #1 cause of AC problems.

1. Locate your filter (return vent or air handler)
2. Remove and inspect it
3. If dirty/clogged, replace immediately
4. Run system for 30 minutes and check again

A severely clogged filter can cause the evaporator coil to freeze.
        `,
        options: [
          { label: "Filter was dirty, replaced it", nextNodeKey: "wait_after_filter" },
          { label: "Filter looks clean", nextNodeKey: "check_outdoor" },
        ],
      },
      {
        nodeKey: "wait_after_filter",
        nodeType: "action" as const,
        title: "Wait and monitor",
        contentMarkdown: `
After replacing a dirty filter:
1. Run the system for 30-60 minutes
2. Check if cool air is now coming from vents
3. If the coil was frozen, it may take several hours to fully recover

**Important:** If the coil was frozen, you may see water dripping as it thaws. This is normal.
        `,
        options: [
          { label: "Now cooling properly", nextNodeKey: "resolved_filter" },
          { label: "Still not cooling", nextNodeKey: "check_outdoor" },
        ],
      },
      {
        nodeKey: "check_outdoor",
        nodeType: "observation" as const,
        title: "Inspect the outdoor unit",
        contentMarkdown: `
Go outside and check the condenser unit:

1. **Is it running?** You should hear the compressor and see the fan spinning
2. **Is it clear?** Remove any debris, leaves, or objects blocking airflow
3. **Is it clean?** Dirty coils reduce efficiency significantly
4. **Is ice forming?** Ice on refrigerant lines indicates a problem

The unit needs at least 2 feet of clearance on all sides.
        `,
        options: [
          { label: "Unit not running", nextNodeKey: "outdoor_not_running" },
          { label: "Unit dirty/blocked", nextNodeKey: "clean_outdoor" },
          { label: "Ice on unit or lines", nextNodeKey: "frozen_system" },
          { label: "Unit running and clear", nextNodeKey: "check_vents" },
        ],
      },
      {
        nodeKey: "frozen_system",
        nodeType: "result" as const,
        title: "Frozen System Detected",
        contentMarkdown: `
Ice on your AC indicates a serious issue that needs attention.

**Immediate steps:**
1. Turn AC to "OFF" at thermostat
2. Set fan to "ON" to help thaw the coil
3. Let system thaw completely (4-24 hours)

**Common causes:**
- Low refrigerant (leak)
- Restricted airflow (dirty filter/coils)
- Failed blower motor
- Blocked return vents
        `,
        diagnosisCode: "FROZEN_EVAP",
        severity: "moderate",
        recommendedAction:
          "Let system thaw, replace filter, then test. If it freezes again, call a pro.",
        estimatedCost: {
          diyLow: 20,
          diyHigh: 50,
          proLow: 150,
          proHigh: 500,
        },
        shouldCallPro: true,
        proSpecialty: "HVAC technician",
      },
      {
        nodeKey: "check_power",
        nodeType: "action" as const,
        title: "Check power supply",
        contentMarkdown: `
Verify the system has power:

1. **Circuit breaker** — Check your electrical panel for tripped breakers (both indoor and outdoor units have separate breakers)
2. **Disconnect switch** — The outdoor unit has a disconnect box nearby. Ensure it's in the ON position
3. **Thermostat** — If screen is blank, check batteries or verify it has power

Reset any tripped breakers by flipping fully OFF, then ON.
        `,
        options: [
          { label: "Found tripped breaker", nextNodeKey: "breaker_tripped" },
          { label: "All breakers OK", nextNodeKey: "call_pro_electrical" },
        ],
      },
      {
        nodeKey: "breaker_tripped",
        nodeType: "question" as const,
        title: "Did the breaker trip again?",
        contentMarkdown:
          "After resetting the breaker, monitor the system. A breaker that trips repeatedly indicates a serious electrical issue.",
        options: [
          { label: "Breaker stays on, system works", nextNodeKey: "resolved_breaker" },
          {
            label: "Breaker trips again",
            nextNodeKey: "call_pro_electrical",
          },
        ],
      },
      {
        nodeKey: "call_pro_electrical",
        nodeType: "referral" as const,
        title: "Call an HVAC Professional",
        contentMarkdown: `
Repeated electrical issues require professional diagnosis.

**Do not attempt to repair:**
- Electrical components
- Refrigerant issues
- Compressor problems

A licensed HVAC technician can safely diagnose and repair electrical faults.
        `,
        shouldCallPro: true,
        proSpecialty: "Licensed HVAC technician",
        urgency: "Same day if possible, within 24-48 hours",
        estimatedCost: {
          diyLow: 0,
          diyHigh: 0,
          proLow: 150,
          proHigh: 800,
        },
      },
      {
        nodeKey: "resolved_thermostat",
        nodeType: "result" as const,
        title: "Issue Resolved: Thermostat Settings",
        contentMarkdown:
          "Great! The issue was incorrect thermostat settings. Monitor your system to ensure it continues cooling properly.",
        diagnosisCode: "THERMOSTAT_SETTINGS",
        severity: "minor",
        recommendedAction: "No further action needed",
      },
      {
        nodeKey: "resolved_filter",
        nodeType: "result" as const,
        title: "Issue Resolved: Dirty Filter",
        contentMarkdown: `
The dirty filter was restricting airflow and reducing cooling capacity.

**Prevent future issues:**
- Set a reminder to check filter monthly
- Replace every 1-3 months depending on type
- Consider upgrading to a higher-quality filter
        `,
        diagnosisCode: "DIRTY_FILTER",
        severity: "minor",
        recommendedAction: "Maintain regular filter replacement schedule",
      },
      {
        nodeKey: "resolved_breaker",
        nodeType: "result" as const,
        title: "Issue Resolved: Tripped Breaker",
        contentMarkdown: `
The circuit breaker had tripped, cutting power to your AC.

**If this happens occasionally:** May be a minor power surge, nothing to worry about.

**If this happens repeatedly:** Have an electrician inspect the circuit — could indicate wiring issues or an overloaded circuit.
        `,
        diagnosisCode: "TRIPPED_BREAKER",
        severity: "minor",
        recommendedAction:
          "Monitor for repeat occurrences. If frequent, call an electrician.",
      },
    ];

    for (const node of nodes) {
      await ctx.db.insert("diagnosticNodes", {
        treeId: acDiagnosticId,
        nodeKey: node.nodeKey,
        nodeType: node.nodeType,
        title: node.title,
        contentMarkdown: node.contentMarkdown,
        options: node.options,
        diagnosisCode: (node as any).diagnosisCode,
        severity: (node as any).severity,
        recommendedAction: (node as any).recommendedAction,
        estimatedCost: (node as any).estimatedCost,
        shouldCallPro: (node as any).shouldCallPro,
        proSpecialty: (node as any).proSpecialty,
        urgency: (node as any).urgency,
      });
    }

    // =========================================
    // SAMPLE EXPLAINER: How Heat Pumps Work
    // =========================================
    await ctx.db.insert("knowledgeArticles", {
      slug: "how-heat-pumps-work",
      articleType: "explainer",
      systemCategory: "hvac",
      title: "How Heat Pumps Work: A Complete Guide",
      subtitle: "Understanding the technology that heats and cools your home",
      summary:
        "Heat pumps move heat rather than generate it, making them highly efficient. Learn how they work, when they're ideal, and how to maintain them.",
      contentMarkdown: `
# How Heat Pumps Work

A heat pump is a versatile HVAC system that can both heat and cool your home. Unlike furnaces that generate heat by burning fuel, heat pumps **move heat** from one place to another, making them remarkably efficient.

## The Basic Principle

Heat naturally flows from warm areas to cool areas. A heat pump uses refrigerant and a compressor to **reverse this flow**, moving heat in the direction you want:

- **Cooling mode:** Moves heat from inside your home to outside
- **Heating mode:** Moves heat from outside air into your home

Yes, even cold outside air contains heat energy that can be extracted!

## Components of a Heat Pump

### Outdoor Unit (Condenser/Evaporator)
Contains the compressor, a coil, and a fan. In cooling mode, it releases heat. In heating mode, it absorbs heat.

### Indoor Unit (Air Handler)
Contains a coil and blower fan. Distributes conditioned air throughout your home.

### Refrigerant
A special fluid that absorbs and releases heat as it changes between liquid and gas states. Modern systems use R-410A, which is more environmentally friendly than older refrigerants.

### Reversing Valve
The "magic" component that allows the system to switch between heating and cooling by reversing refrigerant flow direction.

### Expansion Valve
Controls refrigerant flow and creates the pressure difference needed for the heat transfer cycle.

## The Refrigeration Cycle

### Cooling Mode (Summer)
1. Warm indoor air passes over the cold indoor coil
2. Refrigerant absorbs the heat, evaporating into a gas
3. Compressor pumps the hot gas to the outdoor unit
4. Outdoor coil releases heat to the outside air
5. Refrigerant condenses back to liquid and cycles back inside

### Heating Mode (Winter)
1. Outdoor coil absorbs heat from outside air (even at 30°F, there's extractable heat)
2. Compressor increases refrigerant temperature and pressure
3. Hot refrigerant flows to indoor coil
4. Indoor coil releases heat into your home
5. Refrigerant returns outside to absorb more heat

## Types of Heat Pumps

### Air-Source Heat Pumps
Most common type. Transfers heat between indoor air and outdoor air.

**Pros:** Lower cost, easier installation
**Cons:** Efficiency drops in extreme cold

### Ground-Source (Geothermal)
Uses the stable temperature underground (50-60°F year-round) as a heat source/sink.

**Pros:** Highest efficiency, consistent performance
**Cons:** High installation cost, requires land for ground loops

### Mini-Split (Ductless)
Individual units for each room, connected to an outdoor compressor.

**Pros:** No ductwork needed, zone control
**Cons:** Multiple indoor units needed for whole-home

## Efficiency Ratings

### SEER (Cooling Efficiency)
Seasonal Energy Efficiency Ratio. Higher = more efficient. Modern units range from 14-25 SEER.

### HSPF (Heating Efficiency)
Heating Seasonal Performance Factor. Higher = more efficient. Look for 8.5+ HSPF.

### COP (Coefficient of Performance)
Ratio of heat output to energy input. A COP of 3 means 3 units of heat for every 1 unit of electricity.

## When Heat Pumps Excel

- Mild to moderate climates (rarely below 25°F)
- Homes with good insulation
- Areas with expensive natural gas
- New construction or major renovations
- Desire for both heating and cooling from one system

## Cold Climate Considerations

Traditional heat pumps lose efficiency below 40°F and may need backup heat below 25°F. However, **cold climate heat pumps** now work efficiently down to -15°F or colder.

## Maintenance Tips

1. **Change filters monthly** during heavy use
2. **Keep outdoor unit clear** of debris, snow, ice
3. **Schedule annual tune-ups** before each season
4. **Don't block vents** for proper airflow
5. **Listen for unusual sounds** — early detection prevents costly repairs
      `,
      difficulty: "beginner",
      estimatedReadMinutes: 12,
      keywords: [
        "heat pump",
        "hvac",
        "heating",
        "cooling",
        "energy efficiency",
        "geothermal",
        "mini split",
      ],
      status: "published",
      version: 1,
      viewCount: 0,
      helpfulCount: 0,
      notHelpfulCount: 0,
    });

    return {
      message: "Seeded knowledge content",
      articles: 2,
      diagnostics: 1,
    };
  },
});
