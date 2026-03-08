/**
 * WORKFLOW 2: SYMPTOM DIAGNOSIS
 *
 * Trigger: user sends free-text symptom report
 * Precondition: message classified as symptom_report
 *
 * Decision tree: safety screen → urgency classification → diagnosis →
 * forecast impact → recommendation routing → response generation.
 * Most of the reasoning is Claude's job; this module provides structure.
 */
import type { GenericActionCtx } from "convex/server";
import type { DataModel } from "../../_generated/dataModel";
import { internal } from "../../_generated/api";
import {
  type WorkflowPreparation,
  URGENCY_LABELS,
  formatCurrency,
  monthsBetween,
} from "./helpers";
import type { AgentContext } from "../context";

type ActionCtx = GenericActionCtx<DataModel>;

// Keywords that indicate potential safety concerns
const SAFETY_KEYWORDS = [
  "gas smell", "smells like gas", "rotten egg", "sulfur",
  "carbon monoxide", "co detector", "co alarm",
  "sparks", "sparking", "burning smell", "electrical fire", "shock", "electrocuted",
  "flooding", "burst pipe", "water everywhere", "gushing water",
  "smoke", "fire", "flames",
  "crack in foundation", "wall crack", "floor sinking",
  "no heat", "no heating", "furnace won't", "heater broken",
  "no ac", "no cooling", "air conditioner won't",
];

const SAFETY_CRITICAL_KEYWORDS = [
  "gas smell", "smells like gas", "rotten egg",
  "carbon monoxide", "co detector", "co alarm",
  "sparks", "electrical fire", "shock",
  "flooding", "burst pipe", "gushing",
  "smoke", "fire", "flames",
];

export async function prepare(
  ctx: ActionCtx,
  agentContext: AgentContext,
  triggerDetails: Record<string, unknown>,
): Promise<WorkflowPreparation> {
  const symptomText = (triggerDetails.userMessage as string) ?? "";
  const reportedSystemId = triggerDetails.systemId as string | undefined;

  // Pre-screen for safety keywords
  const lowerSymptom = symptomText.toLowerCase();
  const matchedSafetyKeywords = SAFETY_KEYWORDS.filter((kw) =>
    lowerSymptom.includes(kw),
  );
  const hasSafetyCriticalKeywords = SAFETY_CRITICAL_KEYWORDS.some((kw) =>
    lowerSymptom.includes(kw),
  );

  // Check for repeat symptoms (same system, within 60 days)
  let repeatSymptom = false;
  let previousReportDate: string | undefined;
  if (reportedSystemId && agentContext.maintenanceHistory.length > 0) {
    const recentForSystem = agentContext.maintenanceHistory.find(
      (h) =>
        (h.systemId as string) === reportedSystemId &&
        h.type === "inspection" &&
        monthsBetween(h.date, Date.now()) <= 2,
    );
    if (recentForSystem) {
      repeatSymptom = true;
      previousReportDate = recentForSystem.date;
    }
  }

  // Gather forecast data for the affected system
  let systemForecast = null;
  if (reportedSystemId) {
    systemForecast = await ctx.runQuery(
      internal.agent.workflows.queries.getForecastResultForSystem,
      { systemId: reportedSystemId as any },
    );
  }

  // Check for previous quotes for this system
  let previousQuotes: any[] = [];
  if (reportedSystemId) {
    previousQuotes = await ctx.runQuery(
      internal.agent.workflows.queries.getQuoteRecordsForSystem,
      { systemId: reportedSystemId as any },
    );
  }

  // ── Build prompt context ──────────────────────────────────────

  const contextLines: string[] = ["PRE-SCREENED SYMPTOM ANALYSIS:"];
  contextLines.push(`Reported symptom: "${symptomText}"`);

  if (reportedSystemId) {
    const sys = agentContext.systems.find((s) => (s._id as string) === reportedSystemId);
    if (sys) {
      contextLines.push(`Identified system: ${sys.type} (${sys.category}) — Age: ${sys.age ?? "unknown"}, Condition: ${sys.condition ?? "unknown"}`);
    }
  }

  if (hasSafetyCriticalKeywords) {
    contextLines.push(`\n⚠ SAFETY KEYWORDS DETECTED: ${matchedSafetyKeywords.join(", ")}`);
    contextLines.push("→ SAFETY SCREEN IS POSITIVE. You MUST run safety protocol FIRST.");
  } else if (matchedSafetyKeywords.length > 0) {
    contextLines.push(`\nSafety-adjacent keywords detected: ${matchedSafetyKeywords.join(", ")}`);
    contextLines.push("→ Evaluate for safety implications but may not be critical.");
  }

  if (repeatSymptom) {
    contextLines.push(`\n⚡ REPEAT SYMPTOM: User reported similar issue on ${previousReportDate}. Escalate urgency by 1 tier.`);
  }

  if (systemForecast) {
    contextLines.push(`\nSystem forecast data: failure prob 1yr=${Math.round(systemForecast.failureProbabilityNextYear * 100)}%, remaining life ~${Math.round(systemForecast.medianRemainingLifeMonths)} months`);
    contextLines.push(`Replacement cost estimate: ${formatCurrency(systemForecast.estimatedReplacementCost)}`);
  }

  if (previousQuotes.length > 0) {
    contextLines.push(`\nPrevious quotes on file for this system: ${previousQuotes.length}`);
    for (const q of previousQuotes.slice(0, 3)) {
      contextLines.push(`  - ${formatCurrency(q.amount)} (${q.workType}) — ${q.priceFlag ?? "unassessed"}`);
    }
  }

  const additionalContext = contextLines.join("\n");

  // ── Build workflow instructions ───────────────────────────────

  const workflowInstructions = `
═══ WORKFLOW: SYMPTOM DIAGNOSIS ═══

You are diagnosing a homeowner's reported symptom. Follow this decision tree STRICTLY:

STEP 1: SAFETY SCREEN (ALWAYS FIRST)
${hasSafetyCriticalKeywords
  ? "⚠ SAFETY KEYWORDS ALREADY DETECTED. You MUST call escalate_safety_concern BEFORE anything else.\n  Give SPECIFIC immediate actions — not 'call someone' but 'turn off gas at the meter, ventilate the house, call 911.'"
  : "Check if the symptom could involve: gas leaks, CO risk, electrical hazards, structural instability, fire, active flooding.\n  If ANY safety concern: call escalate_safety_concern IMMEDIATELY, then continue diagnosis."}

STEP 2: SYSTEM MATCHING
${reportedSystemId
  ? "System already identified in the report."
  : "Parse the symptom to identify which system is affected.\n  If ambiguous, use request_information with suggested options (e.g., 'Is this coming from your furnace or your water heater?').\n  If the system isn't in their profile, suggest they add it."}

STEP 3: URGENCY CLASSIFICATION
Classify into one of 4 tiers:
- TIER 1 EMERGENCY: Active safety risk, active water damage, total system failure in extreme weather
- TIER 2 URGENT: System non-functional but no safety risk, progressive water leak
- TIER 3 SOON: Intermittent failure, performance degradation, unusual noise/smell (non-safety)
- TIER 4 MONITOR: Cosmetic issue, minor anomaly, no functional impact
${repeatSymptom ? "\n⚡ REPEAT SYMPTOM FLAG: Escalate urgency by 1 tier (Tier 3 → Tier 2, etc.)" : ""}

STEP 4: DIAGNOSIS
Using your domain knowledge and the system's profile (age, brand, condition, maintenance history):
1. Identify the 1-3 most probable causes
2. For each: estimate probability, typical fix, DIY feasibility, cost range
3. State what you're confident about and what you're guessing

STEP 5: RECOMMENDATION ROUTING
Based on urgency tier:
- Tier 1: "CALL_PROFESSIONAL_NOW" — create_action_item urgency "critical" category "safety"
- Tier 2 + DIY feasible + cost < $150: "TRY_DIY_FIRST" — create_action_item category "diy_maintenance"
- Tier 2 + not DIY: "SCHEDULE_PROFESSIONAL_SOON" — create_action_item category "schedule_professional"
- Tier 3 + DIY: create_action_item category "diy_maintenance"
- Tier 3 + not DIY: create_action_item category "schedule_professional" with timeline "1-2 weeks"
- Tier 4: "MONITOR" — schedule_future_check for 14 days with followup question

STEP 6: FORECAST IMPACT
If the diagnosis changes the system's replacement outlook significantly:
- Call upsert_forecast to update the system's forecast
- Note the change in your response: "This changes my outlook on your {system}."

STEP 7: RESPONSE FORMAT
Structure your text response as:
1. Empathy opener (1 sentence — acknowledge the frustration/concern)
2. Diagnosis summary ("Based on what you're describing, the most likely cause is...")
3. If multiple causes: "Less likely but possible: ..."
4. Action plan (specific, numbered steps)
5. If DIY recommended: step-by-step guide
6. If professional needed: "Typical cost for this repair: $X-$Y" + "Want me to help you find a contractor?"
7. If forecast changed: note the update
8. Prevention tip if applicable

EDGE CASES:
- Multiple symptoms described: Ask "Let's tackle these one at a time — which is most urgent?"
- Symptom doesn't match any system: Suggest closest match, offer freeform routing
- User seems panicked (urgent language, ALL CAPS, exclamation marks): Lead with calming language, simplify to single immediate action step
- Repeat symptom: "You reported this same issue on {date}. Has it worsened?"

TOOL CHAIN:
- Safety: escalate_safety_concern → send_notification (critical)
- Diagnosis: create_action_item → upsert_forecast (if outlook changed)
- Monitoring: schedule_future_check (14 days) → request_information (if data needed)
- Always: send_notification with diagnosis summary`;

  return {
    additionalContext,
    workflowInstructions,
    preComputedData: {
      hasSafetyCriticalKeywords,
      matchedSafetyKeywords,
      repeatSymptom,
      previousReportDate,
    },
  };
}
