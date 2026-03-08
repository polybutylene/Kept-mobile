/**
 * WORKFLOW 6: POST-FAILURE EVENT PROCESSING
 *
 * Trigger: user reports system failure or confirms replacement
 * Precondition: system exists in profile (or can be created)
 *
 * Decision tree: capture event data → update system → track forecast accuracy →
 * adjust savings plans → generate updated health summary → respond.
 */
import type { GenericActionCtx } from "convex/server";
import type { DataModel } from "../../_generated/dataModel";
import { internal } from "../../_generated/api";
import {
  type WorkflowPreparation,
  formatCurrency,
  ageFromInstallDate,
  monthsBetween,
} from "./helpers";
import type { AgentContext } from "../context";

type ActionCtx = GenericActionCtx<DataModel>;

export async function prepare(
  ctx: ActionCtx,
  agentContext: AgentContext,
  triggerDetails: Record<string, unknown>,
): Promise<WorkflowPreparation> {
  if (!agentContext.home) {
    return {
      additionalContext: "",
      workflowInstructions: "No home profile — cannot process failure event.",
      preComputedData: {},
    };
  }

  const homeId = agentContext.home._id;
  const systemId = triggerDetails.systemId as string | undefined;
  const userMessage = (triggerDetails.userMessage as string) ?? "";
  const isEmergency = (triggerDetails.metadata as any)?.isEmergency ?? false;

  // Get affected system details
  let systemInfo: typeof agentContext.systems[0] | undefined;
  if (systemId) {
    systemInfo = agentContext.systems.find((s) => (s._id as string) === systemId);
  }

  // Gather workflow-specific data
  const [forecastResults, savingsPlans, alertHistory, systemArchives] = await Promise.all([
    ctx.runQuery(internal.agent.workflows.queries.getForecastResultsForHome, { homeId }),
    ctx.runQuery(internal.agent.workflows.queries.getSavingsPlansForHome, { homeId }),
    systemId
      ? ctx.runQuery(internal.agent.workflows.queries.getAlertHistoryForSystem, {
          systemId: systemId as any,
        })
      : Promise.resolve([]),
    ctx.runQuery(internal.agent.workflows.queries.getSystemArchivesForHome, { homeId }),
  ]);

  // Get forecast for this specific system
  const systemForecast = forecastResults.find((f) => (f.systemId as string) === systemId);
  const systemSavingsPlan = savingsPlans.find((sp) => (sp.systemId as string) === systemId);

  // Calculate prediction vs actual
  let predictionAccuracy: Record<string, unknown> = {};
  if (systemInfo && systemForecast) {
    const age = systemInfo.age ?? ageFromInstallDate(systemInfo.installDate);
    const predictedMedianLife = systemForecast.medianRemainingLifeMonths
      ? (systemForecast.currentAgeMonths + systemForecast.medianRemainingLifeMonths) / 12
      : undefined;

    predictionAccuracy = {
      predictedLifespan: predictedMedianLife,
      actualLifespan: age,
      predictedReplacementCost: systemForecast.estimatedReplacementCost,
      failureProbWas: Math.round(systemForecast.failureProbabilityNextYear * 100),
    };

    if (predictedMedianLife && age) {
      const accuracy = Math.round((1 - Math.abs(predictedMedianLife - age) / predictedMedianLife) * 100);
      (predictionAccuracy as any).accuracyPercent = Math.max(0, accuracy);
    }
  }

  // Check for first alert date (lead time)
  const firstAlert = alertHistory.length > 0
    ? alertHistory[alertHistory.length - 1] // oldest alert (sorted desc, so last = oldest)
    : null;
  const alertLeadTimeMonths = firstAlert
    ? Math.round(monthsBetween(firstAlert.createdAt, Date.now()))
    : null;

  // Savings plan state
  const savingsContext = systemSavingsPlan
    ? {
        status: systemSavingsPlan.status,
        balance: systemSavingsPlan.currentBalance,
        target: systemSavingsPlan.targetAmount,
      }
    : null;

  // Identify next highest-risk system (for "what to watch next" guidance)
  const otherSystems = forecastResults
    .filter((f) => (f.systemId as string) !== systemId)
    .sort((a, b) => b.failureProbabilityNextYear - a.failureProbabilityNextYear);
  const nextPriority = otherSystems[0];
  const nextPrioritySystem = nextPriority
    ? agentContext.systems.find((s) => (s._id as string) === (nextPriority.systemId as string))
    : null;

  // ── Build prompt context ──────────────────────────────────────

  const contextLines: string[] = [
    "PRE-COMPUTED FAILURE EVENT CONTEXT:",
    `User report: "${userMessage}"`,
    `Emergency: ${isEmergency}`,
  ];

  if (systemInfo) {
    contextLines.push(`\nAffected system: ${systemInfo.type} (${systemInfo.category})`);
    contextLines.push(`  Age: ${systemInfo.age ?? "unknown"} years | Condition: ${systemInfo.condition ?? "unknown"}`);
    contextLines.push(`  Brand: ${systemInfo.brand ?? "unknown"} | Model: ${systemInfo.model ?? "unknown"}`);
  }

  if (Object.keys(predictionAccuracy).length > 0) {
    contextLines.push("\nFORECAST ACCURACY:");
    if ((predictionAccuracy as any).predictedLifespan) {
      contextLines.push(`  Predicted lifespan: ~${((predictionAccuracy as any).predictedLifespan as number).toFixed(1)} years`);
    }
    if ((predictionAccuracy as any).actualLifespan) {
      contextLines.push(`  Actual lifespan: ~${((predictionAccuracy as any).actualLifespan as number).toFixed(1)} years`);
    }
    if ((predictionAccuracy as any).accuracyPercent !== undefined) {
      contextLines.push(`  Forecast accuracy: ${(predictionAccuracy as any).accuracyPercent}%`);
    }
    contextLines.push(`  1-year failure probability was: ${(predictionAccuracy as any).failureProbWas}%`);
    if (systemForecast) {
      contextLines.push(`  Predicted replacement cost: ${formatCurrency(systemForecast.estimatedReplacementCost)}`);
    }
  }

  if (alertLeadTimeMonths !== null) {
    contextLines.push(`\nALERT LEAD TIME: First Kept alert was ${alertLeadTimeMonths} months ago.`);
  } else {
    contextLines.push("\nNo prior Kept alerts for this system — this was an unforecasted event.");
  }

  if (savingsContext) {
    contextLines.push(`\nSAVINGS PLAN: ${savingsContext.status} | Balance: ${formatCurrency(savingsContext.balance)} / ${formatCurrency(savingsContext.target)}`);
  } else {
    contextLines.push("\nNo savings plan was in place for this system.");
  }

  if (nextPrioritySystem) {
    contextLines.push(`\nNEXT SYSTEM TO WATCH: ${nextPrioritySystem.type} — failure prob 1yr: ${Math.round(nextPriority!.failureProbabilityNextYear * 100)}%`);
    contextLines.push(`  Replacement cost: ${formatCurrency(nextPriority!.estimatedReplacementCost)}`);
  }

  const additionalContext = contextLines.join("\n");

  // ── Build workflow instructions ───────────────────────────────

  const workflowInstructions = `
═══ WORKFLOW: POST-FAILURE EVENT PROCESSING ═══

A system has been reported as failed or replaced. Follow this decision tree:

STEP 1: CAPTURE EVENT DATA
From the user's report, identify:
- Type: REPLACEMENT (full system swap) or REPAIR (component fix)
- Actual cost (if provided, or ask via request_information)
- What failed (failure mode: sudden, gradual, proactive, warranty)
- Who did the work (DIY vs professional)
- Replacement brand/model (if applicable)
- Warranty info on new system

If critical details are missing, use request_information — but don't block on it.
Process what you have and update when they respond.

STEP 2: UPDATE SYSTEM RECORDS
FOR REPLACEMENT:
- Call archive_system with: systemId, failureMode, actualCost, newBrand, newModel, warrantyYears
  This will: archive the old system, create the new one, close savings plans, calculate accuracy
- Call update_system_record on the OLD system with condition "failed"

FOR REPAIR:
- Call update_system_record with updated condition and notes
- Call log_maintenance_record with the repair details
- Do NOT archive — the system continues with updated data

STEP 3: FORECAST ACCURACY NOTE
${Object.keys(predictionAccuracy).length > 0
  ? `Include in your response: "Your ${systemInfo?.type ?? "system"} lasted ${(predictionAccuracy as any).actualLifespan?.toFixed(0) ?? "?"} years${
    (predictionAccuracy as any).predictedLifespan
      ? ` — ${
        (predictionAccuracy as any).accuracyPercent > 80
          ? "right in line with"
          : (predictionAccuracy as any).accuracyPercent > 60
          ? "close to"
          : "different from"
      } our forecast of ~${(predictionAccuracy as any).predictedLifespan?.toFixed(0)} years.`
      : "."
    }"`
  : "No forecast data to compare — note this was an unforecasted event for model improvement."}

STEP 4: SAVINGS PLAN HANDLING
${savingsContext
  ? savingsContext.status === "active"
    ? `Active savings plan with ${formatCurrency(savingsContext.balance)} balance.\n- Call manage_savings_plan with action "close"\n- If balance > actual cost: mention residual and suggest reallocation to next highest-risk system\n- If balance < actual cost: note the gap for the user's awareness`
    : "Savings plan exists but is not active. Note this in your response."
  : "No savings plan was in place. If this was an unforecasted event, emphasize: 'This is exactly what Kept helps avoid next time.'"}

STEP 5: UPDATED HEALTH SUMMARY
${nextPrioritySystem
  ? `With this system handled, the next priority is: ${nextPrioritySystem.type} (${Math.round(nextPriority!.failureProbabilityNextYear * 100)}% failure probability).\nInclude: "With your [old system] handled, your ${nextPrioritySystem.type} is now the one to keep an eye on."`
  : "No other high-risk systems identified."}

STEP 6: BUILD RESPONSE
Structure:
1. Acknowledgment: "Got it — I've updated your [system] records."
2. If REPLACEMENT: "Your new [system] is now tracked. You won't need to think about this one for a long time."
3. If warranty info: "I've logged your [duration] warranty. I'll remind you before it expires."
4. Forecast accuracy note (Step 3)
5. Updated home dashboard context (next system to watch)
6. If next priority changed: "With your [old] handled, [next system] is now the one to watch."

TOOL CHAIN:
- Replacement: archive_system → update_system_record (old) → manage_savings_plan (close) → send_notification → upsert_forecast (for new system, dormant)
- Repair: update_system_record → log_maintenance_record → upsert_forecast (update) → send_notification
${isEmergency ? "\n⚠ EMERGENCY: This was reported as an emergency. Lead with empathy and immediate practical guidance." : ""}

EDGE CASES:
- User doesn't know actual cost: Accept "unknown"; use request_information to ask later; use market estimate
- Partial replacement (component only): Do NOT archive; apply partial condition improvement
- Emergency replacement (no prior alert): Emphasize "This is exactly what Kept helps avoid next time"
- Warranty replacement ($0 cost): Log $0 user cost; still track for accuracy; note new warranty`;

  return {
    additionalContext,
    workflowInstructions,
    preComputedData: {
      predictionAccuracy,
      alertLeadTimeMonths,
      savingsContext,
      nextPrioritySystemId: nextPrioritySystem?._id,
      isEmergency,
    },
  };
}
