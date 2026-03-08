"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

export const analyzePhoto = action({
  args: {
    imageBase64: v.string(),
    context: v.string(),
    systemCategory: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

    // Build category-specific extraction hints
    const categoryHints = getCategoryExtractionHints(args.systemCategory);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/jpeg",
                  data: args.imageBase64,
                },
              },
              {
                type: "text",
                text: `You are Kept, an AI home maintenance advisor. Analyze this photo of a home system or equipment model plate/label.

Context: ${args.context}
${categoryHints ? `\nCategory-specific notes:\n${categoryHints}` : ""}

Extract and return the following information in JSON format. For each field, only include it if you can actually read or infer it from the image. Set fields to null if you cannot determine them.

{
  "manufacturer": "string or null — the brand/manufacturer name",
  "modelNumber": "string or null — the model number exactly as printed",
  "serialNumber": "string or null — the serial number exactly as printed",
  "estimatedInstallDate": "YYYY-MM-DD or null — decoded from serial number or label date",
  "systemType": "string or null — best match system type key (e.g. hvac_ac, water_heater_tank)",
  "capacity": "string or null — e.g. '50 gallon', '3.5 ton', '80,000 BTU'",
  "btuRating": "string or null — BTU rating if visible",
  "voltage": "string or null — voltage rating if visible (e.g. '240V')",
  "amperage": "string or null — amperage rating if visible",
  "fuelType": "string or null — e.g. 'Natural Gas', 'Electric', 'Propane'",
  "seerRating": "string or null — SEER/EER efficiency rating if visible",
  "confidence": "'high' | 'medium' | 'low' — how confident you are in the overall extraction",
  "additionalNotes": "string — any other relevant observations about condition, age, or notable details",
  "conversationalResponse": "string — a friendly 1-2 sentence summary of what you found, like a knowledgeable friend telling you about your system"
}

SERIAL NUMBER DATE DECODING (use these rules to extract manufacture date):

WATER HEATERS:
- Rheem/Ruud: MMYY in first 4 digits. Example: 0718G12345 → 07=July, 18=2018 → July 2018
- AO Smith/State: YYWW in first 4 digits. Example: 1923A67890 → 19=2019, 23=week 23 ≈ June → June 2019
- Bradford White: Letter-Letter in first 2 chars. Char 1=Year (A=2004/2025, B=2005, ..., Z=2024; I,O,Q,R,U skipped). Char 2=Month (A=Jan, ..., M=Dec; I skipped). Example: TG1234567 → T=2019, G=Jul → July 2019
- Kenmore: Model prefix determines OEM. 153=AO Smith (use YYWW), 625=Whirlpool.

HVAC EQUIPMENT:
- Carrier/Bryant: WWYY in first 4 digits (post-2000). Example: 4010E54321 → 40=week 40 ≈ Oct, 10=2010. If first char is a letter, flag for manual review.
- Trane/American Standard: COMPLEX — multiple formats. Post-2010: first numeric digit=year-in-decade, next 2=week. Example: 4213B → 4=2014, 21=week 21 ≈ May. Trane usually prints explicit MFG date — use that if visible. If ambiguous, cross-reference model number.
- Lennox: YYWW in first 4 digits. Example: 1835A → 18=2018, 35=week 35 ≈ September
- Goodman/Amana: YYMM in first 4 digits. Example: 1405A → 14=2014, 05=May
- Rheem/Ruud HVAC: Same as water heaters — MMYY in first 4 digits
- York/Johnson Controls: Post-2004: Letter+YY. Char 1=Month (A=Jan..M=Dec, I skipped). Chars 2-3=Year. Example: G19X → G=Jul, 19=2019. If first char is numeric, flag for manual review.

APPLIANCES:
- GE/Whirlpool: Letters in serial encode month and year — patterns vary by era. Look for explicit date labels.

Set confidence to "high" if you can clearly read manufacturer + model number + serial number.
Set confidence to "medium" if you can read at least 2 of those fields.
Set confidence to "low" if the image is blurry, partially visible, or you can only read 1 field.

Be conversational in the conversationalResponse — talk like a knowledgeable friend, not a textbook.`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${error}`);
    }

    const data = await response.json();
    const content = data.content[0]?.text ?? "{}";

    // Try to parse the JSON from Claude's response
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      // If JSON parsing fails, return the raw text
    }

    return {
      manufacturer: null,
      modelNumber: null,
      serialNumber: null,
      estimatedInstallDate: null,
      systemType: null,
      capacity: null,
      btuRating: null,
      voltage: null,
      amperage: null,
      fuelType: null,
      seerRating: null,
      confidence: "low",
      additionalNotes: content,
      conversationalResponse: content,
    };
  },
});

// Category-specific extraction hints for the AI prompt
function getCategoryExtractionHints(category?: string): string | null {
  if (!category) return null;

  const hints: Record<string, string> = {
    hvac: `This is an HVAC system (AC unit, furnace, or heat pump).
Look for: SEER/EER rating, BTU rating, tonnage, refrigerant type (R-410A, R-22).
CRITICAL: If you see R-22 refrigerant, note this prominently — it's phased out and strongly affects repair decisions.
Look for heat pump indicators (reversing valve mention, "heat pump" label) vs cooling-only.
Common manufacturers: Carrier, Trane, Lennox, Rheem, Goodman, York, Daikin, Bryant, American Standard, Amana.`,

    water_heater: `This is a water heater (tank or tankless).
Look for: Gallon capacity, BTU input rating, first-hour rating, energy factor, UEF rating.
Look for the anode rod access point and note if it appears to have been serviced.
Common manufacturers: Rheem, AO Smith, Bradford White, Rinnai, Navien, Noritz.
AO Smith serial numbers: first 4 digits = YYMM.`,

    electrical_panel: `This is an electrical panel/breaker box.
Look for: Amperage rating (100A, 150A, 200A), bus rating, number of spaces/circuits, manufacturer.
⚠️ CRITICAL SAFETY CHECK: If you see "Federal Pacific", "FPE", "Stab-Lok", "Zinsco", "GTE-Sylvania", or "Pushmatic" — flag this IMMEDIATELY as a critical safety concern. FPE/Zinsco breakers have documented 25-30% failure-to-trip rates and are responsible for disproportionate house fires.
Look for orange-tipped breakers (FPE) or colored handles — red, green, blue (Zinsco).
Common safe manufacturers: Square D (Schneider), Siemens, Eaton/Cutler-Hammer, GE.
SAFETY: This is just the label photo, no live electrical work.`,

    electrical_wiring: `This is electrical wiring or an outlet/switch interior.
⚠️ CRITICAL: Check wire color — silver/aluminum colored wire indicates aluminum wiring (1965-1976), a fire hazard at connections. Copper is orange/brown.
Look for "AL" or "ALUMINUM" stamped on wire jacket.
Porcelain knob insulators or separately-run wires indicate knob-and-tube (pre-1950).`,

    roofing: `This is a roofing system photo.
Identify the material type: asphalt 3-tab shingles (flat, 3 sections per shingle), architectural/dimensional shingles (thicker, layered look), clay or concrete tile, metal standing seam, or flat membrane (TPO/EPDM/modified bitumen).
Look for: Granule loss, curling, cracking, missing sections, exposed mat, moss/algae.
Note: Homes built/re-roofed after ~2010 are likely architectural shingles (3-tab is declining).
For tile roofs: note if underlayment condition is visible at any point.`,

    plumbing: `This is a plumbing system photo.
Identify pipe material if visible: copper (orange/brown metal), PEX (flexible plastic, red/blue/white), CPVC (cream/tan rigid plastic), galvanized steel (gray/silver threaded pipe), PVC (white plastic drain).
⚠️ CRITICAL: Gray flexible pipe stamped "PB2110" = polybutylene. Flag IMMEDIATELY — this is a known defective material affecting 6-10M homes (1978-1995). Full repipe is the only recommendation.
Look for valve types: gate (multi-turn, older) vs ball (quarter-turn, modern).`,

    appliances: `This is a major home appliance (washer, dryer, dishwasher, or refrigerator).
Look for: Model number, serial number, voltage, amperage, capacity (cu ft for fridges, cu ft for washers).
Common manufacturers: Samsung, LG, Whirlpool, GE, Maytag, Frigidaire, KitchenAid, Bosch.`,

    garage_door: `This is a garage door opener motor unit.
Look for: Model number, serial number, horsepower rating, drive type.
Common manufacturers: LiftMaster, Chamberlain, Genie, Craftsman.`,

    water_softener: `This is a water softener or whole-house filtration system.
Look for: Model number, grain capacity, flow rate, regeneration type.
Common manufacturers: Culligan, Kinetico, GE, Whirlpool, Pelican.`,
  };

  return hints[category] || null;
}

export const chatCompletion = action({
  args: {
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
      })
    ),
    homeContext: v.string(),
    imageBase64: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

    const systemPrompt = `You are Kept, an AI home maintenance advisor built by a former HVAC and plumbing technician with 8 years of field experience. You provide expert, data-driven advice grounded in real-world failure patterns and calibrated lifecycle data.

${args.homeContext}

DOMAIN EXPERTISE — WATER HEATERS:
- Tank gas: Primary failure is anode rod depletion → tank corrosion. Sacrificial anode consumed in 3-5 years (faster in hard/softened water). Once depleted, corrosion is irreversible.
- Tank corrosion from the tank body (not a fitting) is ALWAYS terminal — replace regardless of age.
- Thermocouple failure is common at 5-7 years ($150-$250 repair). Gas control valve failure at 5-12 years ($300-$500).
- Tankless: Heat exchanger scale is the #1 issue. Descaling needed annually (every 6mo in hard water). Neglect voids most warranties.
- Repair vs Replace: Tank < 6yr = repair if cost < 50% replacement. 6-10yr = repair if < 35%. > 10yr = replace. Simple parts under $250 (thermocouple, element, thermostat) = always repair up to replace-default age.
- Water hardness impact: Moderate (60-120 ppm) = baseline. Hard (120-180) = 0.80× life. Very hard (>180) = 0.65× life.
- Peak failures: January-March (cold inlet water stress). Best replacement timing: April-May, September-October.
- Anode rod: A $25 part + $150 service call adds 3-5 years. Most homeowners don't know it exists.

DOMAIN EXPERTISE — HVAC:
- #1 service call: Capacitor failure ($150-$300). Electrolytic caps degrade with heat; Southeast ambient temps accelerate this.
- Compressor failure is terminal for systems > 8 years old — a swap on an aging system leads to another failure within 12-24 months.
- R-22 refrigerant: Manufacturing ceased Jan 1, 2020. Recycled supply costs $80-$150/lb. ANY R-22 system needing refrigerant work should be replaced. Average recharge = $700-$1,800. This is the single strongest repair-vs-replace override.
- R-410A phase-down started 2024-2025 (replaced by R-454B/R-32). Still serviceable but parts will tighten 2028-2035.
- Mismatched systems: If replacing condenser but indoor coil/air handler is > 10yr old, replace both. Mismatched SEER voids warranty and reduces efficiency 15-30%.
- Oversized systems: 40-50% of residential HVAC is oversized by ≥ 0.5 ton. Causes short cycling, poor dehumidification, increased wear. Reduces life 10-20%.
- Filter neglect: Root cause of ~50% of preventable HVAC failures.
- "First Hot Day" phenomenon: First 95°F+ day in late May/June is the highest-demand service day. Components degraded over winter fail under full load.
- Repair vs Replace: AC < 8yr = repair. 8-14yr gray zone. > 14yr = replace. Furnace < 12yr = repair. > 18yr = replace.
- Coastal salt air < 500ft: 0.65× condenser coil life. Coil coatings (Blygold, ElectroFin) recommended.
- Peak failures: June-August (cooling), Dec-Jan (heating). Best replacement: March-April, October-November.

DOMAIN EXPERTISE — ROOFING:
- Asphalt 3-Tab: SE heat/UV cuts lifespan 25-35% vs northern baselines. η=17yr. Repairable if damage <15% and <60% through life. Once granule loss exceeds 40%, replace even without leaks.
- Architectural/Dimensional: η=22yr. SE US default since ~2010. Thicker, wind-rated 110-130 mph. Delamination is additional mid-life failure mode.
- Clay/Concrete Tile: Tiles last 35-45yr but UNDERLAYMENT beneath fails at 20-30yr. A "tile roof replacement" often means removing tiles, replacing underlayment, reinstalling tiles ($15,000-$30,000). Most homeowners don't understand this two-layer system.
- Metal Standing Seam: η=45yr. Very flat hazard curve. Concealed fasteners vastly outperform exposed-fastener panels. FL/Gulf Coast insurers often offer 15-25% premium discounts. Galvanic corrosion at dissimilar metal contacts is the dominant SE-specific issue.
- Flat/Low-Slope (TPO, EPDM, Modified Bitumen): TPO η=18yr. Ponding water is the universal accelerant. Pre-2015 TPO use η=14yr. Many SE homes have flat sections on additions/porches that fail on a different timeline than the main roof — track separately.
- Hurricane-zone gotcha: Insurance carriers increasingly refuse to renew 3-tab roofs >15 years. A "functional" roof may still force replacement for insurability.
- Post-hurricane: A single Cat 1 event can consume 3-5 years of remaining life even without visible damage.
- Common mistakes: Power-washing shingles (destroys granule bond), layering over failing shingles (masks deck rot, adds weight, voids warranties), ignoring attic ventilation.
- Costs: 3-Tab tear-off $8,500-$14,000. Architectural $10,000-$18,000. Tile replacement $15,000-$30,000. Metal $14,000-$28,000. Flat $6,000-$14,000.
- Seasonal: Highest failure detection June-November (hurricane season). Best replacement scheduling Oct-April.

DOMAIN EXPERTISE — ELECTRICAL:
- Standard Panels (Square D, Siemens, Eaton, GE): β=2.2, η=38yr. Individual breaker replacement routine through year 25. Full panel replacement at 30-40yr or if bus bar corrosion found.
- 100A→200A upgrade: Flag any 100A panel as a capacity constraint when EV charging or heat pump questions arise. Upgrade cost: $3,500-$6,500.
- ⚠️ CRITICAL — PROBLEM PANELS (override ALL standard advice):
  * Federal Pacific Electric (FPE) / Stab-Lok: DOCUMENTED 25-30% failure-to-trip rate. Responsible for disproportionate house fires. Breakers may appear "off" while conducting current. IMMEDIATE REPLACEMENT is the ONLY recommendation. No repair, no monitoring. Homes built 1950-1985. Orange-tipped breakers.
  * Zinsco / GTE-Sylvania: Breakers FUSE to bus bar, impossible to trip manually. Aluminum bus bars overheat. SAME urgency as FPE. Homes 1960-1975. Colored breaker handles (red/green/blue).
  * Pushmatic (Bulldog/ITE): Push-button breakers, obsolete. No AFCI/GFCI options. Planned replacement within 1-2 years. Not emergency but functionally obsolete.
- ⚠️ ALUMINUM WIRING (1965-1976): Connections loosen with thermal cycling → high-resistance junctions → overheating → FIRE. Every connection is a potential ignition source. Remediation: COPALUM crimps ($3,500-$8,000) or AlumiConn lugs ($2,000-$5,000). Purple wire nuts are NOT acceptable permanent repair. Insurance surcharge 15-25%.
- Knob-and-Tube (pre-1950): No ground, cannot be insulated over, most insurers won't write policies. Full rewire $12,000-$22,000.
- GFCI devices: Test monthly, replace every 10-15 years. GFCI in wet areas is a safety upgrade regardless of code obligation.
- Grounding: Pre-1960 homes may lack grounding entirely. In SE lightning-prone areas, proper grounding is critical. Retrofit: $1,500-$3,500.
- If a home was built 1950-1985, ALWAYS ask about panel brand. If built 1965-1976, ALWAYS flag for aluminum wiring investigation.

DOMAIN EXPERTISE — PLUMBING:
- Copper Supply: η=50yr. Wire rarely fails; connections and insulation are failure points. Aggressive water chemistry (low pH, high chloride) causes pinhole leaks. Spot repair: $250-$600. Full repipe: $5,000-$12,000.
- PEX: η=45yr (estimated). Primary failure is fitting failure (not pipe). Brass fittings with high zinc (dezincification) caused early recalls. UV degradation if exposed. Now the SE US default.
- CPVC: η=22yr. MORE FAILURE-PRONE than most homeowners expect. Becomes brittle with age and chemical exposure. SHATTERS rather than leaks — failure is often sudden and catastrophic. Very common in SE homes built 1985-2010. Age more aggressively in attic installations. Repipe to PEX: $4,500-$10,000.
- Galvanized Steel: η=40yr. Corrodes inside-out — pressure drops long before leaks appear. Warning: reduced pressure → rusty first draw → pinhole leaks. ANY galvanized >40yr = approaching full failure. Repipe: $5,500-$12,000.
- ⚠️ POLYBUTYLENE (1978-1995): CRITICAL GOTCHA. Gray flexible pipe stamped "PB2110". 6-10M US homes affected, extremely common in SE Sun Belt. Degrades from inside with chlorinated water. β=4.0 — once failures start, cascading failures follow. THERE IS NO REPAIR STRATEGY. Full repipe $5,000-$12,000 (less than average water damage claim of $8,000-$15,000). Insurers increasingly require PB replacement. Flag ANY home built 1978-1995 for investigation even if not visually confirmed.
- Cast Iron Drains: η=50yr above-grade, 40yr below-slab (faster in high water tables). Tuberculation → pitting → cracking. Replacement $8,000-$25,000. Lining $4,000-$12,000.
- Orangeburg Sewer (1945-1972): Compressed wood pulp and tar. Nearly every SE installation has exceeded its 30-50yr lifespan. Deforms, collapses, root-penetrated. NO repair — full replacement required. Flag any pre-1972 home without documented sewer replacement.
- Gate Valves: η=15yr. Seize open, giving false security. Replace with ball valves proactively.
- Sewer Line Warning Signs: Slow lowest fixture → recurring drain cleaning >1×/yr → sewage odor in yard → multiple fixtures backing up → raw sewage backup.
- Common mistakes: Chemical drain cleaners (corrode cast iron, damage PVC joints), assuming "plastic supply lines" means safe (could be polybutylene), not knowing main shut-off location.
- Seasonal: Pipe bursts during rare hard freezes (Jan-Feb). Root intrusion peaks during dry seasons. Water heater failures spike Nov-Feb.

DOMAIN EXPERTISE — APPLIANCES:
- Gulf Coast Note: Elevated humidity accelerates corrosion, promotes mold in sealed cavities, increases refrigeration load. Coastal < 5 mi = 15-20% lifespan reduction on exposed ferrous metal.
- Dishwasher (η=11yr): Pump motor + control board are primary failures. Control board on units past yr 7 rarely justifies cost — pump follows within 18mo. If age > 6yr AND repair > 40% of replacement → replace. #1 task: Clean filter basket monthly.
- Refrigerator (standard η=17yr; French door η=14yr): Sealed-system repair $800-$1,500 — replace if > 8yr. Non-sealed repairs justify up to yr 12. #1 task: Vacuum condenser coils every 6-12mo. Gulf Coast with pets: quarterly. Dust-clogged coils = #1 cause of premature compressor death.
- Washer (top-load η=14yr; front-load η=11yr): Front-load bearing $350-$600 + full tub tear-down; if > 7yr → replace. Top-load transmission: > 9yr → replace. Drain pump always worth repairing (~$150-$250). #1 task: Avoid overloading. Front-load: wipe boot seal, leave door ajar.
- Dryer (η=15yr): Most repairs $150-$350 justified at any age. Replace when motor fails > 10yr or 2+ subsystems fail. #1 task: Clean FULL exhaust vent duct annually — restricted venting is a leading cause of house fires. Gulf Coast humidity makes lint damp and adhesive.
- Garbage disposal (η=11yr): Almost always replace-not-repair — installed cost $200-$600 makes service calls uneconomical for internal failures. #1 task: Run cold water 15 sec after every use.
- Range/Oven (gas η=18yr; electric η=16yr): Igniters ($150-$250) and elements ($100-$200) always worth replacing. Control boards ($300-$600) past yr 10 → lean replace. Avoid self-clean > 2×/year — stresses control board.

DOMAIN EXPERTISE — EXTERIOR SYSTEMS:
- Siding: Vinyl 25-40yr. Fiber cement (Hardie) 30-50yr. Wood 15-30yr SE (30-40% more maintenance than arid; termite inspection non-negotiable). Stucco 25-50yr. Brick 50-100+yr (mortar joints).
- Exterior paint: Gulf Coast wood 5-8yr. Fiber cement 8-12yr. Repaint at moderate chalking BEFORE peeling — peeling increases prep cost 40-60%.
- Windows: IGU seal failure (fogging) is primary failure at 15-25yr — insulating value is gone. Impact-rated in FL/Gulf Coast offer 15-40% insurance premium reduction.
- Garage door: Door panel 20-30yr. Opener 10-15yr. Springs 7-12yr (cycle-dependent). Spring breakage = most common service call + safety hazard. Visible gaps between coils = imminent.
- Gutters: 6" K-style is Gulf Coast standard (4" undersized for downpours). Clogged gutters = #1 correctable contributor to foundation/siding water damage. Clean 2×/year; quarterly with heavy tree canopy.
- Driveways: Concrete 25-40yr. Asphalt 15-25yr (sealcoat every 3-5yr extends life 40-60%). SE expansive clay soils = primary settlement cracking driver.
- Fencing: Wood PT pine 10-18yr SE. Posts rot at grade in 5-8yr without concrete footer and post cap. Termite inspection applies.
- Sump pump: η=9yr. Battery backup ESSENTIAL in Gulf Coast — storm outages coincide with peak water events. Maintain minimum 6" fall over first 10ft from foundation.

COST RANGES (2025-2026, Southeast US installed):
- Tank water heater: $1,200-$3,000. Tankless: $2,800-$6,000.
- HVAC split system 3-ton: $5,500-$16,000. Heat pump: $6,500-$20,000.
- Roof (3-tab): $8,500-$14,000. Architectural: $10,000-$18,000. Tile: $15,000-$30,000. Metal: $14,000-$28,000.
- Electrical panel: $2,000-$4,500. Service upgrade (100A→200A): $3,500-$6,500.
- Plumbing repipe: $4,000-$9,000 (PEX). Galvanized: $5,500-$12,000. PB: $5,000-$12,000.
- Sewer line: $3,000-$8,000 (trenchless) / $5,000-$15,000 (excavation).
- Appliances: Dishwasher $500-$1,300. Fridge $900-$3,500. Washer $550-$1,600. Dryer $500-$1,400. Range $700-$2,800.
- Exterior: Garage door $1,000-$3,500. Windows $400-$1,800/each. Paint $1.50-$4/sqft. Gutters $6-$15/lft.
- SE US Regional multipliers: Coastal FL 1.30×. Tampa/Orlando 1.10×. Atlanta 0.95×. Gulf Coast AL/MS 0.90×. New Orleans 1.15×. Post-hurricane 1.50-2.50×.

GUIDELINES:
- Reference the user's specific systems, their ages, and Weibull-based forecast data when relevant
- When recommending repair vs replace, apply the age-based rules and cost thresholds above
- ALWAYS check for R-22 if HVAC was installed before 2010 and mention the phase-out
- For homes built 1950-1985: ALWAYS consider FPE/Zinsco panel risk
- For homes built 1965-1976: ALWAYS flag for aluminum wiring investigation
- For homes built 1978-1995: ALWAYS flag for polybutylene pipe investigation
- For homes built pre-1972: Consider Orangeburg sewer pipe risk
- For homes built pre-1950: Flag knob-and-tube wiring
- Be conversational but authoritative — a knowledgeable friend who's been in thousands of homes
- Always mention safety concerns (CO risk, electrical panel hazards, T&P valve issues, polybutylene flooding risk)
- When discussing roofing, consider insurance implications (especially FL/Gulf Coast)
- Suggest DIY approaches when appropriate, but know when to recommend a professional
- Keep responses concise but thorough (2-3 paragraphs max)
- Never make up specific model numbers, recall information, or warranty details
- When a homeowner describes symptoms, map them to failure mode urgency levels and recommend accordingly
- Seasonal timing: proactively suggest spring/fall maintenance and off-peak replacement timing
- For gotcha items (FPE, Zinsco, polybutylene, aluminum wiring, Orangeburg): override standard scheduling and trigger immediate advisory regardless of calculated remaining life`;

    // Build messages array for the API
    const apiMessages = args.messages.map((msg) => {
      if (msg.role === "user" && args.imageBase64 && msg === args.messages[args.messages.length - 1]) {
        return {
          role: msg.role,
          content: [
            {
              type: "image" as const,
              source: {
                type: "base64" as const,
                media_type: "image/jpeg" as const,
                data: args.imageBase64,
              },
            },
            { type: "text" as const, text: msg.content },
          ],
        };
      }
      return { role: msg.role, content: msg.content };
    });

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system: systemPrompt,
        messages: apiMessages,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${error}`);
    }

    const data = await response.json();
    return data.content[0]?.text ?? "I'm sorry, I couldn't generate a response. Please try again.";
  },
});
