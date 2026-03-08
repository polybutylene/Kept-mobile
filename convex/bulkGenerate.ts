"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { systemCategory } from "./schema";

// =====================================================
// BULK CONTENT GENERATION (Anthropic Claude)
// =====================================================

/**
 * Content targets per category — these define what articles to generate
 */
const CONTENT_TARGETS: Record<
  string,
  Array<{
    topic: string;
    articleType: "guide" | "explainer" | "diagnostic" | "checklist" | "safety";
    difficulty: "beginner" | "intermediate" | "advanced" | "pro_only";
    seasonPreference?: "spring" | "summer" | "fall" | "winter" | "any";
  }>
> = {
  hvac: [
    // Guides
    { topic: "How to Replace Your HVAC Air Filter — Complete Guide", articleType: "guide", difficulty: "beginner", seasonPreference: "any" },
    { topic: "Thermostat Programming and Optimization for Energy Savings", articleType: "guide", difficulty: "beginner", seasonPreference: "any" },
    { topic: "DIY Duct Sealing — Find and Fix Air Leaks", articleType: "guide", difficulty: "intermediate", seasonPreference: "fall" },
    { topic: "Spring AC Preparation — Pre-Season Checklist and Maintenance", articleType: "guide", difficulty: "beginner", seasonPreference: "spring" },
    { topic: "Fall Furnace Preparation — Pre-Heating Season Maintenance", articleType: "guide", difficulty: "beginner", seasonPreference: "fall" },
    { topic: "Heat Pump Maintenance — Year-Round Care Guide", articleType: "guide", difficulty: "intermediate", seasonPreference: "spring" },
    { topic: "Whole-Home Humidity Control — Humidifiers and Dehumidifiers", articleType: "guide", difficulty: "intermediate", seasonPreference: "winter" },
    { topic: "Cleaning Your Condensate Drain Line — Prevent AC Water Damage", articleType: "guide", difficulty: "beginner", seasonPreference: "spring" },
    // Explainers
    { topic: "How Your Central Air Conditioning System Works — Complete Technical Guide", articleType: "explainer", difficulty: "beginner", seasonPreference: "any" },
    { topic: "How Gas and Electric Furnaces Work — Heating System Anatomy", articleType: "explainer", difficulty: "beginner", seasonPreference: "any" },
    { topic: "How Heat Pumps Work — The Science of Moving Heat", articleType: "explainer", difficulty: "intermediate", seasonPreference: "any" },
    { topic: "Understanding SEER, SEER2, and HSPF Energy Ratings", articleType: "explainer", difficulty: "intermediate", seasonPreference: "any" },
    { topic: "Home Ductwork Design — How Air Moves Through Your House", articleType: "explainer", difficulty: "intermediate", seasonPreference: "any" },
    // Checklists
    { topic: "Spring HVAC Readiness Checklist", articleType: "checklist", difficulty: "beginner", seasonPreference: "spring" },
    { topic: "Fall Heating Season Preparation Checklist", articleType: "checklist", difficulty: "beginner", seasonPreference: "fall" },
    { topic: "Summer AC Performance Checklist", articleType: "checklist", difficulty: "beginner", seasonPreference: "summer" },
  ],
  plumbing: [
    // Guides
    { topic: "How to Unclog Any Drain — Kitchen, Bathroom, and Floor Drains", articleType: "guide", difficulty: "beginner", seasonPreference: "any" },
    { topic: "Fix a Running Toilet — Complete Repair Guide", articleType: "guide", difficulty: "beginner", seasonPreference: "any" },
    { topic: "Replace a Faucet Cartridge — Stop Drips and Leaks", articleType: "guide", difficulty: "intermediate", seasonPreference: "any" },
    { topic: "Water Heater Flush and Anode Rod Inspection", articleType: "guide", difficulty: "intermediate", seasonPreference: "fall" },
    { topic: "Winterizing Your Pipes — Prevent Frozen and Burst Pipes", articleType: "guide", difficulty: "beginner", seasonPreference: "winter" },
    { topic: "Garbage Disposal Maintenance and Troubleshooting", articleType: "guide", difficulty: "beginner", seasonPreference: "any" },
    { topic: "How to Replace a Toilet Flapper and Fill Valve", articleType: "guide", difficulty: "beginner", seasonPreference: "any" },
    { topic: "Water Pressure Regulator — Testing and Replacement Guide", articleType: "guide", difficulty: "intermediate", seasonPreference: "any" },
    // Explainers
    { topic: "How Your Home Plumbing System Works — Supply, Drain, and Vent", articleType: "explainer", difficulty: "beginner", seasonPreference: "any" },
    { topic: "How Tank and Tankless Water Heaters Work", articleType: "explainer", difficulty: "beginner", seasonPreference: "any" },
    { topic: "Water Pressure Systems — Why Pressure Drops and How to Fix It", articleType: "explainer", difficulty: "intermediate", seasonPreference: "any" },
    { topic: "The Drain-Waste-Vent System — Why Your Drains Need Air", articleType: "explainer", difficulty: "intermediate", seasonPreference: "any" },
    // Checklists
    { topic: "Winter Plumbing Protection Checklist", articleType: "checklist", difficulty: "beginner", seasonPreference: "winter" },
    { topic: "Spring Plumbing Inspection Checklist", articleType: "checklist", difficulty: "beginner", seasonPreference: "spring" },
  ],
  electrical: [
    // Guides
    { topic: "GFCI Outlet Testing and Replacement — Complete Safety Guide", articleType: "guide", difficulty: "beginner", seasonPreference: "spring" },
    { topic: "Understanding Your Breaker Panel — Labels, Mapping, and Safety", articleType: "guide", difficulty: "beginner", seasonPreference: "any" },
    { topic: "How to Safely Replace an Outlet or Light Switch", articleType: "guide", difficulty: "intermediate", seasonPreference: "any" },
    { topic: "Smoke and CO Detector Testing, Battery Replacement, and Placement Guide", articleType: "guide", difficulty: "beginner", seasonPreference: "fall" },
    { topic: "Whole-Home Surge Protection — What It Is and Why You Need It", articleType: "guide", difficulty: "intermediate", seasonPreference: "spring" },
    // Explainers
    { topic: "Home Electrical Panel Anatomy — Breakers, Buses, and Safety", articleType: "explainer", difficulty: "beginner", seasonPreference: "any" },
    { topic: "Grounding and Bonding — Why Your Electrical System Needs Both", articleType: "explainer", difficulty: "intermediate", seasonPreference: "any" },
    { topic: "Circuit Capacity and Load Calculation — Avoid Overloaded Circuits", articleType: "explainer", difficulty: "intermediate", seasonPreference: "any" },
    // Checklists
    { topic: "Fall Electrical Safety Checklist — Before Winter Storms", articleType: "checklist", difficulty: "beginner", seasonPreference: "fall" },
    { topic: "Spring Outdoor Electrical Inspection Checklist", articleType: "checklist", difficulty: "beginner", seasonPreference: "spring" },
  ],
  appliances: [
    // Guides
    { topic: "Refrigerator Condenser Coil Cleaning — Extend Your Fridge's Life", articleType: "guide", difficulty: "beginner", seasonPreference: "summer" },
    { topic: "Dishwasher Maintenance — Filters, Spray Arms, and Door Seals", articleType: "guide", difficulty: "beginner", seasonPreference: "any" },
    { topic: "Washing Machine Hose Inspection and Replacement", articleType: "guide", difficulty: "beginner", seasonPreference: "spring" },
    { topic: "Dryer Vent Cleaning — Prevent Fires and Improve Efficiency", articleType: "guide", difficulty: "beginner", seasonPreference: "fall" },
    { topic: "Range Hood Filter Cleaning and Maintenance", articleType: "guide", difficulty: "beginner", seasonPreference: "any" },
    // Explainers
    { topic: "How Refrigeration Works — The Science Inside Your Fridge", articleType: "explainer", difficulty: "beginner", seasonPreference: "any" },
    { topic: "Appliance Energy Ratings — EnergyGuide Labels Explained", articleType: "explainer", difficulty: "beginner", seasonPreference: "any" },
    { topic: "Water Efficiency in Home Appliances — What the Numbers Mean", articleType: "explainer", difficulty: "beginner", seasonPreference: "any" },
    // Checklists
    { topic: "Summer Appliance Maintenance Checklist", articleType: "checklist", difficulty: "beginner", seasonPreference: "summer" },
    { topic: "Fall Kitchen and Laundry Appliance Checklist", articleType: "checklist", difficulty: "beginner", seasonPreference: "fall" },
  ],
};

/**
 * Diagnostic issue targets per category
 */
const DIAGNOSTIC_TARGETS: Record<
  string,
  Array<{
    issueId: string;
    symptom: string;
    description: string;
  }>
> = {
  hvac: [
    { issueId: "ac-not-cooling", symptom: "AC running but not cooling", description: "Air conditioner runs but doesn't cool the home effectively" },
    { issueId: "furnace-not-heating", symptom: "Furnace not producing heat", description: "Furnace cycles on but doesn't produce warm air" },
    { issueId: "weak-airflow", symptom: "Weak airflow from vents", description: "Reduced or weak air coming from supply vents" },
    { issueId: "hvac-strange-noises", symptom: "Strange noises from HVAC", description: "Unusual sounds like banging, squealing, or rattling from the HVAC system" },
    { issueId: "thermostat-issues", symptom: "Thermostat not responding", description: "Thermostat display is blank, unresponsive, or showing incorrect temperature" },
    { issueId: "short-cycling", symptom: "HVAC short cycling", description: "System turns on and off frequently without completing a full cycle" },
    { issueId: "high-energy-bills-hvac", symptom: "Unexpectedly high energy bills", description: "Energy costs higher than normal with no change in usage" },
  ],
  plumbing: [
    { issueId: "no-hot-water", symptom: "No hot water", description: "Water heater not producing hot water" },
    { issueId: "leaking-pipe", symptom: "Leaking or dripping pipe", description: "Visible water leak from pipe joints, fittings, or pipe body" },
    { issueId: "low-water-pressure", symptom: "Low water pressure", description: "Reduced water pressure at one or more fixtures" },
    { issueId: "running-toilet", symptom: "Toilet runs continuously", description: "Toilet continues to run after flushing or runs intermittently" },
    { issueId: "slow-drain", symptom: "Slow or clogged drain", description: "Water drains slowly or not at all from sink, tub, or shower" },
    { issueId: "sewer-smell", symptom: "Sewer smell in house", description: "Rotten egg or sewage odor coming from drains or basement" },
    { issueId: "water-heater-noises", symptom: "Water heater making noise", description: "Popping, rumbling, or whining sounds from the water heater" },
  ],
  electrical: [
    { issueId: "tripping-breaker", symptom: "Circuit breaker keeps tripping", description: "Breaker trips repeatedly when reset" },
    { issueId: "dead-outlet", symptom: "Outlet not working", description: "One or more outlets have no power" },
    { issueId: "flickering-lights", symptom: "Lights flickering", description: "Lights dim, flicker, or buzz" },
    { issueId: "buzzing-panel", symptom: "Buzzing from electrical panel", description: "Audible buzzing or humming from the breaker panel" },
    { issueId: "gfci-wont-reset", symptom: "GFCI outlet won't reset", description: "GFCI outlet trips immediately or the reset button won't stay in" },
    { issueId: "warm-outlet", symptom: "Outlet or switch plate feels warm", description: "Electrical outlet or switch plate is warm or hot to the touch" },
  ],
  appliances: [
    { issueId: "fridge-not-cooling", symptom: "Refrigerator not cooling", description: "Fridge running but food not staying cold" },
    { issueId: "dishwasher-not-draining", symptom: "Dishwasher not draining", description: "Standing water in dishwasher after cycle completes" },
    { issueId: "washer-leaking", symptom: "Washing machine leaking", description: "Water pooling around or under the washing machine" },
    { issueId: "dryer-not-heating", symptom: "Dryer not heating", description: "Dryer tumbles but clothes stay wet" },
    { issueId: "garbage-disposal-jammed", symptom: "Garbage disposal jammed", description: "Disposal hums but doesn't spin, or won't turn on at all" },
    { issueId: "dishwasher-not-cleaning", symptom: "Dishwasher not cleaning well", description: "Dishes come out dirty, spotted, or with food residue" },
  ],
};

/**
 * Diagnostic tree targets per category
 */
const DIAGNOSTIC_TREE_TARGETS: Record<
  string,
  Array<{
    slug: string;
    symptom: string;
  }>
> = {
  hvac: [
    { slug: "ac-not-cooling-tree", symptom: "My AC is running but not cooling the house" },
    { slug: "furnace-not-heating-tree", symptom: "My furnace won't produce heat" },
    { slug: "hvac-strange-noises-tree", symptom: "My HVAC is making strange noises" },
    { slug: "thermostat-not-working-tree", symptom: "My thermostat isn't responding correctly" },
  ],
  plumbing: [
    { slug: "no-hot-water-tree", symptom: "I have no hot water" },
    { slug: "leaking-pipe-tree", symptom: "I found a leaking pipe" },
    { slug: "slow-drain-tree", symptom: "My drain is slow or clogged" },
    { slug: "running-toilet-tree", symptom: "My toilet won't stop running" },
  ],
  electrical: [
    { slug: "tripping-breaker-tree", symptom: "My circuit breaker keeps tripping" },
    { slug: "dead-outlet-tree", symptom: "An outlet in my house isn't working" },
    { slug: "flickering-lights-tree", symptom: "My lights are flickering or dimming" },
  ],
  appliances: [
    { slug: "fridge-not-cooling-tree", symptom: "My refrigerator isn't keeping food cold" },
    { slug: "dishwasher-not-draining-tree", symptom: "My dishwasher has standing water" },
    { slug: "dryer-not-heating-tree", symptom: "My dryer isn't heating" },
  ],
};

/**
 * Generate a single diagnostic issue using Anthropic
 */
async function generateDiagnosticIssue(
  anthropicKey: string,
  category: string,
  target: { issueId: string; symptom: string; description: string }
): Promise<Record<string, unknown>> {
  const prompt = `You are an expert home maintenance diagnostician. Generate comprehensive diagnostic data for a homeowner experiencing this issue.

System category: ${category}
Symptom: ${target.symptom}
Description: ${target.description}

Output ONLY valid JSON (no markdown fencing):
{
  "understanding": {
    "whatItIs": "Clear explanation of what's happening (2-3 sentences)",
    "howItWorks": "How the affected system normally works (2-3 sentences)",
    "keyComponents": ["Component 1 involved", "Component 2"],
    "healthFactorNote": "How this impacts overall home health score"
  },
  "possibleCauses": [
    {
      "title": "Most likely cause",
      "likelihood": "High",
      "likelihoodPercent": 45,
      "expectedCostLow": 0,
      "expectedCostHigh": 50,
      "diyCheck": "Specific step the homeowner can take to check this"
    },
    {
      "title": "Second most likely cause",
      "likelihood": "Moderate",
      "likelihoodPercent": 30,
      "expectedCostLow": 50,
      "expectedCostHigh": 200,
      "diyCheck": "How to check for this"
    },
    {
      "title": "Third cause",
      "likelihood": "Low",
      "likelihoodPercent": 15,
      "expectedCostLow": 200,
      "expectedCostHigh": 800,
      "diyCheck": "How to check"
    }
  ],
  "diySteps": {
    "title": "Safe DIY Troubleshooting Steps",
    "steps": [
      "Step 1: Specific actionable step",
      "Step 2: Next step",
      "Step 3: etc."
    ],
    "stopCondition": "When to stop DIY and call a professional"
  },
  "safetyWarnings": [
    "Specific safety warning relevant to this issue"
  ],
  "redFlags": [
    "Serious symptom that means call a pro immediately"
  ],
  "pricingReference": {
    "region": "US National Average",
    "repairLow": 75,
    "repairHigh": 300,
    "replaceLow": 500,
    "replaceHigh": 3000
  },
  "seasonPreference": "any"
}

Use realistic 2025 US pricing. Be specific and actionable. Include 3-5 possible causes sorted by likelihood.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": anthropicKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Anthropic error for ${target.issueId}: ${response.status} ${errText}`);
  }

  const json = await response.json();
  const rawText = json?.content?.[0]?.text || "{}";
  const cleaned = rawText.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  return JSON.parse(cleaned);
}

/**
 * Bulk generate articles for a single category
 */
export const bulkGenerateArticles = action({
  args: {
    category: systemCategory,
    startIndex: v.optional(v.number()),
    count: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const targets = CONTENT_TARGETS[args.category];
    if (!targets || targets.length === 0) {
      return { generated: 0, errors: [], category: args.category };
    }

    const start = args.startIndex ?? 0;
    const count = args.count ?? targets.length;
    const batch = targets.slice(start, start + count);

    const results: string[] = [];
    const errors: string[] = [];

    for (const target of batch) {
      try {
        const result = await ctx.runAction(api.knowledgeActions.generateDeepDiveArticle, {
          topic: target.topic,
          articleType: target.articleType,
          systemCategory: args.category,
          difficulty: target.difficulty,
          status: "published",
        });
        results.push(result.slug);
        // Small delay to avoid rate limiting
        await new Promise((r) => setTimeout(r, 1000));
      } catch (err) {
        errors.push(`${target.topic}: ${String(err)}`);
      }
    }

    return {
      generated: results.length,
      slugs: results,
      errors,
      category: args.category,
      totalTargets: targets.length,
    };
  },
});

/**
 * Bulk generate diagnostic issues for a single category
 */
export const bulkGenerateDiagnostics = action({
  args: {
    category: systemCategory,
  },
  handler: async (ctx, args) => {
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) throw new Error("ANTHROPIC_API_KEY is not set");

    const targets = DIAGNOSTIC_TARGETS[args.category];
    if (!targets || targets.length === 0) {
      return { generated: 0, errors: [], category: args.category };
    }

    const results: string[] = [];
    const errors: string[] = [];

    for (const target of targets) {
      try {
        const issueData = await generateDiagnosticIssue(anthropicKey, args.category, target);

        // Validate and normalize the data
        const validSeasons = ["spring", "summer", "fall", "winter", "any"];
        const season = typeof issueData.seasonPreference === "string" && validSeasons.includes(issueData.seasonPreference)
          ? issueData.seasonPreference as "spring" | "summer" | "fall" | "winter" | "any"
          : "any";

        await ctx.runMutation(api.knowledge.upsertDiagnosticIssue, {
          issueId: target.issueId,
          systemCategory: args.category,
          symptom: target.symptom,
          description: target.description,
          understanding: issueData.understanding as {
            whatItIs: string;
            howItWorks: string;
            keyComponents?: string[];
            healthFactorNote?: string;
          },
          possibleCauses: (issueData.possibleCauses as Array<{
            title: string;
            likelihood: "High" | "Moderate" | "Low";
            likelihoodPercent: number;
            expectedCostLow: number;
            expectedCostHigh: number;
            diyCheck: string;
          }>),
          diySteps: issueData.diySteps as {
            title: string;
            steps: string[];
            stopCondition: string;
          },
          safetyWarnings: issueData.safetyWarnings as string[],
          redFlags: issueData.redFlags as string[],
          pricingReference: issueData.pricingReference as {
            region: string;
            repairLow: number;
            repairHigh: number;
            replaceLow: number;
            replaceHigh: number;
          },
          seasonPreference: season,
        });

        results.push(target.issueId);
        await new Promise((r) => setTimeout(r, 1000));
      } catch (err) {
        errors.push(`${target.issueId}: ${String(err)}`);
      }
    }

    return {
      generated: results.length,
      issueIds: results,
      errors,
      category: args.category,
    };
  },
});

/**
 * Bulk generate diagnostic trees for a single category
 */
export const bulkGenerateDiagnosticTrees = action({
  args: {
    category: systemCategory,
  },
  handler: async (ctx, args) => {
    const targets = DIAGNOSTIC_TREE_TARGETS[args.category];
    if (!targets || targets.length === 0) {
      return { generated: 0, errors: [], category: args.category };
    }

    const results: string[] = [];
    const errors: string[] = [];

    for (const target of targets) {
      try {
        // Generate tree data via existing action
        const treeData = await ctx.runAction(api.knowledgeActions.generateDiagnosticTree, {
          systemCategory: args.category,
          symptomDescription: target.symptom,
        });

        // Save it using the mutation
        await ctx.runMutation(api.knowledge.createDiagnosticTree, {
          slug: target.slug,
          systemCategory: args.category,
          title: treeData.title || `${target.symptom} Troubleshooter`,
          description: treeData.description || target.symptom,
          entrySymptom: target.symptom,
          nodes: (treeData.nodes || []).map((n: Record<string, unknown>) => ({
            nodeKey: String(n.nodeKey || "unknown"),
            nodeType: (["question", "observation", "action", "result", "referral"].includes(String(n.nodeType)) 
              ? String(n.nodeType) 
              : "question") as "question" | "observation" | "action" | "result" | "referral",
            title: String(n.title || ""),
            contentMarkdown: typeof n.contentMarkdown === "string" ? n.contentMarkdown : undefined,
            options: Array.isArray(n.options) ? n.options.map((o: Record<string, unknown>) => ({
              label: String(o.label || ""),
              nextNodeKey: String(o.nextNodeKey || ""),
              explanation: typeof o.explanation === "string" ? o.explanation : undefined,
            })) : undefined,
            diagnosisCode: typeof n.diagnosisCode === "string" ? n.diagnosisCode : undefined,
            severity: (["minor", "moderate", "serious", "critical"].includes(String(n.severity))
              ? String(n.severity)
              : undefined) as "minor" | "moderate" | "serious" | "critical" | undefined,
            recommendedAction: typeof n.recommendedAction === "string" ? n.recommendedAction : undefined,
            estimatedCost: n.estimatedCost && typeof n.estimatedCost === "object" ? {
              diyLow: Number((n.estimatedCost as Record<string, unknown>).diyLow) || 0,
              diyHigh: Number((n.estimatedCost as Record<string, unknown>).diyHigh) || 0,
              proLow: Number((n.estimatedCost as Record<string, unknown>).proLow) || 0,
              proHigh: Number((n.estimatedCost as Record<string, unknown>).proHigh) || 0,
            } : undefined,
            shouldCallPro: typeof n.shouldCallPro === "boolean" ? n.shouldCallPro : undefined,
            proSpecialty: typeof n.proSpecialty === "string" ? n.proSpecialty : undefined,
            urgency: typeof n.urgency === "string" ? n.urgency : undefined,
          })),
        });

        results.push(target.slug);
        await new Promise((r) => setTimeout(r, 2000));
      } catch (err) {
        errors.push(`${target.slug}: ${String(err)}`);
      }
    }

    return {
      generated: results.length,
      slugs: results,
      errors,
      category: args.category,
    };
  },
});
