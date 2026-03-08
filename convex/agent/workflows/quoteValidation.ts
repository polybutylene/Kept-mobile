/**
 * WORKFLOW 4: QUOTE VALIDATION
 *
 * Trigger: user submits a contractor quote (amount, description, optional attachment)
 * Precondition: quote amount > 0, description non-empty
 *
 * Decision tree: parse quote → market comparison → price assessment →
 * scope review → additional quotes recommendation → response.
 */
import type { GenericActionCtx } from "convex/server";
import type { DataModel } from "../../_generated/dataModel";
import { internal } from "../../_generated/api";
import {
  type WorkflowPreparation,
  classifyQuotePrice,
  formatCurrency,
} from "./helpers";
import type { AgentContext } from "../context";

type ActionCtx = GenericActionCtx<DataModel>;

// Expected line items by work type (for scope review)
const EXPECTED_ITEMS: Record<string, Array<{
  item: string;
  importance: "critical" | "standard" | "optional";
}>> = {
  hvac_replacement: [
    { item: "Equipment/unit cost", importance: "critical" },
    { item: "Labor/installation", importance: "critical" },
    { item: "Removal and disposal of old unit", importance: "critical" },
    { item: "Refrigerant lines", importance: "standard" },
    { item: "Thermostat (new or compatibility check)", importance: "standard" },
    { item: "Ductwork modifications", importance: "standard" },
    { item: "Permit fees", importance: "standard" },
    { item: "Electrical work", importance: "optional" },
    { item: "Startup and commissioning", importance: "standard" },
  ],
  water_heater_replacement: [
    { item: "Unit cost", importance: "critical" },
    { item: "Installation labor", importance: "critical" },
    { item: "Removal and disposal", importance: "critical" },
    { item: "New water lines/connections", importance: "standard" },
    { item: "Expansion tank", importance: "standard" },
    { item: "Permit", importance: "standard" },
    { item: "Venting modifications", importance: "optional" },
  ],
  roof_replacement: [
    { item: "Tear-off of existing roof", importance: "critical" },
    { item: "New underlayment", importance: "critical" },
    { item: "New shingles/material", importance: "critical" },
    { item: "Flashing replacement", importance: "critical" },
    { item: "Ridge vent", importance: "standard" },
    { item: "Drip edge", importance: "standard" },
    { item: "Ice and water shield", importance: "standard" },
    { item: "Cleanup and disposal", importance: "critical" },
    { item: "Permit", importance: "standard" },
  ],
  plumbing_repair: [
    { item: "Parts/materials", importance: "critical" },
    { item: "Labor", importance: "critical" },
    { item: "Diagnostic/service call fee", importance: "standard" },
    { item: "Cleanup", importance: "optional" },
  ],
  electrical_panel: [
    { item: "New panel", importance: "critical" },
    { item: "Labor", importance: "critical" },
    { item: "Permit and inspection", importance: "critical" },
    { item: "Grounding work", importance: "standard" },
    { item: "Circuit labeling", importance: "standard" },
  ],
  general_repair: [
    { item: "Parts/materials", importance: "critical" },
    { item: "Labor", importance: "critical" },
    { item: "Warranty on work", importance: "standard" },
  ],
  general_replacement: [
    { item: "Equipment/materials", importance: "critical" },
    { item: "Installation labor", importance: "critical" },
    { item: "Removal/disposal of old", importance: "standard" },
    { item: "Permit (if required)", importance: "standard" },
    { item: "Warranty details", importance: "standard" },
  ],
};

export async function prepare(
  ctx: ActionCtx,
  agentContext: AgentContext,
  triggerDetails: Record<string, unknown>,
): Promise<WorkflowPreparation> {
  const quoteAmount = ((triggerDetails.quoteAmountCents as number) ?? 0) / 100 || (triggerDetails.amount as number) ?? 0;
  const quoteDescription = (triggerDetails.userMessage as string) ?? "";
  const systemId = triggerDetails.systemId as string | undefined;

  // Get system details
  let systemInfo: typeof agentContext.systems[0] | undefined;
  if (systemId) {
    systemInfo = agentContext.systems.find((s) => (s._id as string) === systemId);
  }

  // Get cost data for market comparison
  let costData: any = null;
  if (systemInfo && agentContext.home?.region) {
    costData = await ctx.runQuery(
      internal.agent.workflows.queries.getCostData,
      {
        systemCategory: systemInfo.category,
        systemSubtype: systemInfo.type,
        region: agentContext.home.region,
      },
    );
  }

  // Get previous quotes for this system
  let previousQuotes: any[] = [];
  if (systemId) {
    previousQuotes = await ctx.runQuery(
      internal.agent.workflows.queries.getQuoteRecordsForSystem,
      { systemId: systemId as any },
    );
  }

  // Get forecast for context
  let forecast: any = null;
  if (systemId) {
    forecast = await ctx.runQuery(
      internal.agent.workflows.queries.getForecastResultForSystem,
      { systemId: systemId as any },
    );
  }

  // Get savings plan
  let savingsPlan: any = null;
  if (systemId) {
    savingsPlan = await ctx.runQuery(
      internal.agent.workflows.queries.getSavingsPlanForSystem,
      { systemId: systemId as any },
    );
  }

  // ── Pre-compute market comparison ─────────────────────────────

  let marketContext = "";
  let estimatedPercentile: number | null = null;
  let priceClassification: { flag: string; note: string } | null = null;

  if (costData && costData.costLow && costData.costHigh) {
    // Estimate percentile from cost data
    const range = costData.costHigh - costData.costLow;
    if (range > 0) {
      estimatedPercentile = Math.round(
        Math.min(100, Math.max(0, ((quoteAmount - costData.costLow) / range) * 100)),
      );
      priceClassification = classifyQuotePrice(estimatedPercentile);
    }

    marketContext = [
      "MARKET DATA AVAILABLE:",
      `  Region: ${costData.region}`,
      `  Category: ${costData.systemCategory} / ${costData.systemSubtype}`,
      `  Cost type: ${costData.costType}`,
      `  Market range: ${formatCurrency(costData.costLow)} – ${formatCurrency(costData.costHigh)} (median: ${formatCurrency(costData.costMid)})`,
      `  Quote amount: ${formatCurrency(quoteAmount)}`,
      estimatedPercentile !== null ? `  Estimated percentile: ${estimatedPercentile}th` : "",
      priceClassification ? `  Pre-classification: ${priceClassification.flag} — ${priceClassification.note}` : "",
      `  Data freshness: ${costData.fetchedAt ? Math.round((Date.now() - costData.fetchedAt) / (30.44 * 24 * 60 * 60 * 1000)) + " months" : "unknown"}`,
    ].filter(Boolean).join("\n");
  } else {
    marketContext = [
      "LIMITED MARKET DATA:",
      "  No specific local cost data available for this system type.",
      "  Use your domain knowledge for typical national cost ranges.",
      "  Note wider confidence interval in your assessment.",
    ].join("\n");
  }

  // ── Build prompt context ──────────────────────────────────────

  const contextLines: string[] = [
    "PRE-COMPUTED QUOTE ANALYSIS:",
    `Quote amount: ${formatCurrency(quoteAmount)}`,
    `Description: "${quoteDescription}"`,
  ];

  if (systemInfo) {
    contextLines.push(`System: ${systemInfo.type} (${systemInfo.category}) — Age: ${systemInfo.age ?? "unknown"}, Condition: ${systemInfo.condition ?? "unknown"}`);
  }

  contextLines.push("");
  contextLines.push(marketContext);

  if (previousQuotes.length > 0) {
    contextLines.push(`\nPREVIOUS QUOTES (${previousQuotes.length}):`);
    for (const q of previousQuotes) {
      contextLines.push(`  - ${formatCurrency(q.amount)} from ${q.contractorName ?? "unknown"} (${q.workType}) — ${q.priceFlag ?? "unassessed"}`);
    }
  }

  if (savingsPlan) {
    contextLines.push(`\nSAVINGS PLAN: Balance ${formatCurrency(savingsPlan.currentBalance)} / Target ${formatCurrency(savingsPlan.targetAmount)}`);
    const gap = Math.max(0, quoteAmount - savingsPlan.currentBalance);
    if (gap > 0) {
      contextLines.push(`  Gap if this quote accepted: ${formatCurrency(gap)}`);
    }
  }

  if (forecast) {
    contextLines.push(`\nSYSTEM FORECAST: failure prob 1yr=${Math.round(forecast.failureProbabilityNextYear * 100)}%, replacement cost est: ${formatCurrency(forecast.estimatedReplacementCost)}`);
  }

  const additionalContext = contextLines.join("\n");

  // ── Determine expected line items ─────────────────────────────

  let expectedItemsKey = "general_repair";
  if (systemInfo) {
    const cat = systemInfo.category.toLowerCase();
    const type = systemInfo.type.toLowerCase();
    if (cat === "hvac" && quoteAmount > 2000) expectedItemsKey = "hvac_replacement";
    else if (type.includes("water heater") && quoteAmount > 1000) expectedItemsKey = "water_heater_replacement";
    else if (type.includes("roof")) expectedItemsKey = "roof_replacement";
    else if (cat === "plumbing" && quoteAmount < 1000) expectedItemsKey = "plumbing_repair";
    else if (cat === "electrical" && type.includes("panel")) expectedItemsKey = "electrical_panel";
    else if (quoteAmount > 2000) expectedItemsKey = "general_replacement";
  }
  const expectedItems = EXPECTED_ITEMS[expectedItemsKey] ?? EXPECTED_ITEMS.general_repair;

  // ── Build workflow instructions ───────────────────────────────

  const workflowInstructions = `
═══ WORKFLOW: QUOTE VALIDATION ═══

You are evaluating a contractor quote for the homeowner. Follow this decision tree:

STEP 1: PARSE QUOTE
From the description, identify:
- System type and work type (repair vs replacement vs maintenance)
- Any mentioned line items, materials, brands
- Whether warranty is mentioned
- Whether permits are mentioned
- Contractor name if provided

STEP 2: PRICE ASSESSMENT
${priceClassification
  ? `Pre-computed classification: ${priceClassification.flag}\n${priceClassification.note}`
  : "No market data available — use your domain knowledge for typical cost ranges."}

${!costData
  ? "Without local market data, estimate ranges from your domain knowledge. Note: 'Based on national averages, confidence is moderate.'"
  : ""}

Price flag definitions:
- SUSPICIOUSLY_LOW (≤15th %ile): Verify scope is complete. May indicate missing work.
- GOOD_VALUE (16-40th %ile): Fair deal. Proceed with confidence.
- TYPICAL (41-70th %ile): Normal range. No concerns.
- ABOVE_AVERAGE (71-90th %ile): Worth comparing. May be justified by quality.
- HIGH (>90th %ile): Significantly above market. Recommend more quotes.

STEP 3: SCOPE REVIEW
Expected line items for this type of work:
${expectedItems.map((i) => `  [${i.importance}] ${i.item}`).join("\n")}

Check the quote description against these items. Flag:
- Missing CRITICAL items → severity "WARNING"
- Missing STANDARD items → severity "INFO"
- No warranty mentioned for replacement work → severity "WARNING"
- No permit mentioned when typically required → severity "WARNING"

STEP 4: ADDITIONAL QUOTES RECOMMENDATION
Recommend getting more quotes if:
- Price flag is HIGH, ABOVE_AVERAGE, or SUSPICIOUSLY_LOW
- Critical scope items are missing
- Quote > $2,000 and user has < 2 quotes for this system
Otherwise: "This quote looks reasonable. You can proceed with confidence."

STEP 5: STORE ANALYSIS
Call assess_quote with your findings:
- priceFlag, percentile (estimate if no market data)
- scopeFlags for any concerns
- recommendation text

STEP 6: BUILD RESPONSE
Structure your text response as:
1. Price assessment: visual framing of where this falls + note
2. Market range: "$X – $Y typical for this work in your area" (or nationally)
3. Scope review: any missing items or concerns
4. Additional quotes recommendation (if applicable)
${savingsPlan ? `5. Savings context: "You have ${formatCurrency(savingsPlan.currentBalance)} saved. This quote would leave a gap of ${formatCurrency(Math.max(0, quoteAmount - savingsPlan.currentBalance))}."` : ""}
6. Questions to ask the contractor (3-5 specific questions based on gaps)

${previousQuotes.length > 0
  ? `COMPARISON: User has ${previousQuotes.length} previous quote(s) for this system. Compare side by side if relevant.`
  : ""}

EDGE CASES:
- Quote for unknown system: Ask user to identify; use request_information
- Bundled multi-system quote: Note "bundled quotes can obscure individual pricing" and break down components
- Very low quotes: Emphasize verification — "A price this low warrants extra scrutiny on what's included"
- Very high quotes: Be diplomatic — "This is above typical market rates, but could reflect premium materials or warranty"

TOOL CHAIN:
- assess_quote (always — stores the analysis)
- send_notification with summary
- create_action_item if follow-up actions needed (get more quotes, ask contractor questions)
- request_information if system identification needed`;

  return {
    additionalContext,
    workflowInstructions,
    preComputedData: {
      quoteAmount,
      estimatedPercentile,
      priceClassification,
      expectedItemsKey,
      previousQuoteCount: previousQuotes.length,
    },
  };
}
