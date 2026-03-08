/**
 * WORKFLOW 1: PROACTIVE REPLACEMENT PLANNING
 *
 * Trigger: daily_forecast_cron OR system_profile_update
 * Precondition: user has ≥ 1 system with age data
 *
 * Decision tree: classify each system into risk tiers (RED/ORANGE/YELLOW/
 * GREEN_WATCH/GREEN), check for gotcha factors, calculate savings gaps,
 * and generate tiered notifications with first-alert vs. repeat-alert logic.
 */
import type { GenericActionCtx } from "convex/server";
import type { DataModel, Id } from "../../_generated/dataModel";
import { internal } from "../../_generated/api";
import {
  type WorkflowPreparation,
  type RiskTier,
  classifyRiskTier,
  tierRank,
  isEscalation,
  weibullFailureProbability,
  medianRemainingLife,
  calculateMonthlySavings,
  checkGotchaFactors,
  formatCurrency,
  formatPercent,
  ageFromInstallDate,
} from "./helpers";
import type { AgentContext } from "../context";

type ActionCtx = GenericActionCtx<DataModel>;

interface SystemRiskProfile {
  systemId: string;
  systemName: string;
  category: string;
  age: number | undefined;
  tier: RiskTier;
  pFailure1yr: number;
  pFailure3yr: number;
  pFailure5yr: number;
  medianRemainingLifeYears: number;
  replacementCostEstimate: number;
  isFirstAlertAtTier: boolean;
  escalated: boolean;
  savingsPlanStatus: string | null;
  savingsBalance: number;
  savingsMonthly: number;
  suggestedMonthly: number;
  gotchas: string[];
}

export async function prepare(
  ctx: ActionCtx,
  agentContext: AgentContext,
  _triggerDetails: Record<string, unknown>,
): Promise<WorkflowPreparation> {
  if (!agentContext.home) {
    return {
      additionalContext: "",
      workflowInstructions: "No home profile — skip proactive replacement analysis.",
      preComputedData: {},
    };
  }

  const homeId = agentContext.home._id;

  // Gather workflow-specific data
  const [forecastResults, alertHistory, savingsPlans] = await Promise.all([
    ctx.runQuery(internal.agent.workflows.queries.getForecastResultsForHome, { homeId }),
    ctx.runQuery(internal.agent.workflows.queries.getAlertHistoryForHome, { homeId }),
    ctx.runQuery(internal.agent.workflows.queries.getSavingsPlansForHome, { homeId }),
  ]);

  // Build forecast lookup by systemId
  const forecastBySystem = new Map<string, typeof forecastResults[0]>();
  for (const f of forecastResults) {
    forecastBySystem.set(f.systemId as string, f);
  }

  // Build alert history lookup by systemId → tier[]
  const alertsBySystem = new Map<string, Array<{ tier: string; createdAt: number }>>();
  for (const a of alertHistory) {
    const key = a.systemId as string;
    if (!alertsBySystem.has(key)) alertsBySystem.set(key, []);
    alertsBySystem.get(key)!.push({ tier: a.tier, createdAt: a.createdAt });
  }

  // Build savings plan lookup by systemId
  const savingsBySystem = new Map<string, typeof savingsPlans[0]>();
  for (const sp of savingsPlans) {
    savingsBySystem.set(sp.systemId as string, sp);
  }

  // Classify each system
  const systemRisks: SystemRiskProfile[] = [];
  const newConstruction = agentContext.home.yearBuilt && agentContext.home.yearBuilt > (new Date().getFullYear() - 2);

  for (const sys of agentContext.systems) {
    // Skip new construction
    if (newConstruction) continue;

    const forecast = forecastBySystem.get(sys._id as string);
    const age = sys.age ?? ageFromInstallDate(sys.installDate);

    // Need either forecast data or age data to assess
    if (!forecast && age === undefined) continue;

    // Calculate failure probabilities
    let p1yr: number, p3yr: number, p5yr: number, medRemaining: number;
    let replacementCost: number;

    if (forecast) {
      p1yr = forecast.failureProbabilityNextYear;
      p3yr = weibullFailureProbability(
        forecast.currentAgeMonths / 12,
        3,
        2.0, // default shape if not available
        forecast.medianRemainingLifeMonths / 12 + forecast.currentAgeMonths / 12,
      );
      p5yr = forecast.failureProbabilityNext5Years;
      medRemaining = forecast.medianRemainingLifeMonths / 12;
      replacementCost = forecast.estimatedReplacementCost;
    } else {
      // Fallback: use conservative estimates
      p1yr = age && age > 15 ? 0.2 : 0.05;
      p3yr = age && age > 12 ? 0.35 : 0.15;
      p5yr = age && age > 10 ? 0.45 : 0.25;
      medRemaining = Math.max(15 - (age ?? 0), 1);
      replacementCost = 3000; // conservative default
    }

    const tier = classifyRiskTier(p1yr, p3yr, p5yr);
    if (tier === "GREEN") continue;

    // First-alert vs. repeat logic
    const previousAlerts = alertsBySystem.get(sys._id as string) ?? [];
    const isFirstAlertAtTier = !previousAlerts.some((a) => a.tier === tier);
    const lastAlertTier = previousAlerts.length > 0 ? previousAlerts[0].tier : null;
    const escalated = lastAlertTier !== null && isEscalation(tier, lastAlertTier);

    // Check for dismissed alerts (90-day suppression)
    // If dismissed at this tier in the last 90 days, skip unless escalated
    const recentDismissal = alertHistory.find(
      (a) =>
        (a.systemId as string) === (sys._id as string) &&
        a.tier === tier &&
        a.dismissedAt &&
        Date.now() - a.dismissedAt < 90 * 24 * 60 * 60 * 1000,
    );
    if (recentDismissal && !escalated) continue;

    // Savings plan analysis
    const savings = savingsBySystem.get(sys._id as string);
    const suggestedMonthly = calculateMonthlySavings(
      replacementCost,
      medRemaining * 12,
      savings?.currentBalance ?? 0,
    );

    // Gotcha factors
    const gotchas = checkGotchaFactors({
      systemType: sys.type,
      systemCategory: sys.category,
      manufacturer: sys.brand,
      installYear: sys.installDate ? new Date(sys.installDate).getFullYear() : undefined,
    });

    systemRisks.push({
      systemId: sys._id as string,
      systemName: `${sys.type}${sys.brand ? ` (${sys.brand})` : ""}`,
      category: sys.category,
      age,
      tier,
      pFailure1yr: p1yr,
      pFailure3yr: p3yr,
      pFailure5yr: p5yr,
      medianRemainingLifeYears: medRemaining,
      replacementCostEstimate: replacementCost,
      isFirstAlertAtTier: isFirstAlertAtTier,
      escalated,
      savingsPlanStatus: savings?.status ?? null,
      savingsBalance: savings?.currentBalance ?? 0,
      savingsMonthly: savings?.monthlyAmount ?? 0,
      suggestedMonthly,
      gotchas: gotchas.map((g) => `[${g.severity}] ${g.description}`),
    });
  }

  // Sort by tier (highest risk first), then by failure probability
  systemRisks.sort((a, b) => tierRank(b.tier) - tierRank(a.tier) || b.pFailure1yr - a.pFailure1yr);

  // Portfolio-level exposure
  const redOrange = systemRisks.filter((s) => s.tier === "RED" || s.tier === "ORANGE");
  const totalExposure = redOrange.reduce((sum, s) => sum + s.replacementCostEstimate, 0);

  // ── Build prompt context ──────────────────────────────────────

  let additionalContext = "";

  if (newConstruction) {
    additionalContext = "HOME IS NEW CONSTRUCTION (<2 years old). Skip all forecasting. Communicate: 'Your systems are new — nothing to worry about yet.'";
  } else if (systemRisks.length === 0) {
    additionalContext = "All systems are in GREEN tier — no elevated replacement risk detected.";
  } else {
    const lines: string[] = ["PRE-COMPUTED RISK ASSESSMENT:"];
    for (const sr of systemRisks) {
      lines.push(`\n• ${sr.systemName} [${sr.systemId}] — TIER: ${sr.tier}`);
      lines.push(`  Age: ${sr.age !== undefined ? `~${sr.age} years` : "unknown"}`);
      lines.push(`  Failure probability: 1yr=${formatPercent(sr.pFailure1yr)}, 3yr=${formatPercent(sr.pFailure3yr)}, 5yr=${formatPercent(sr.pFailure5yr)}`);
      lines.push(`  Median remaining life: ~${sr.medianRemainingLifeYears.toFixed(1)} years`);
      lines.push(`  Replacement cost estimate: ${formatCurrency(sr.replacementCostEstimate)}`);
      lines.push(`  Alert status: ${sr.isFirstAlertAtTier ? "FIRST ALERT at this tier" : sr.escalated ? "ESCALATED from lower tier" : "repeat alert"}`);

      if (sr.savingsPlanStatus) {
        lines.push(`  Savings plan: ${sr.savingsPlanStatus} | Balance: ${formatCurrency(sr.savingsBalance)} | Monthly: ${formatCurrency(sr.savingsMonthly)}/mo`);
        if (sr.suggestedMonthly > sr.savingsMonthly * 1.25) {
          lines.push(`  ⚠ Savings adjustment needed: suggest increasing to ${formatCurrency(sr.suggestedMonthly)}/mo`);
        }
      } else {
        lines.push(`  No savings plan — suggest ${formatCurrency(sr.suggestedMonthly)}/mo to cover replacement`);
      }

      if (sr.gotchas.length > 0) {
        lines.push(`  Gotcha factors: ${sr.gotchas.join("; ")}`);
      }
    }

    if (redOrange.length >= 2 && totalExposure > 5000) {
      lines.push(`\nPORTFOLIO EXPOSURE: ${redOrange.length} systems in RED/ORANGE tier, total ~${formatCurrency(totalExposure)}`);
    }

    additionalContext = lines.join("\n");
  }

  // ── Build workflow instructions ───────────────────────────────

  const workflowInstructions = `
═══ WORKFLOW: PROACTIVE REPLACEMENT PLANNING ═══

You are running the proactive replacement check. For each system with a non-GREEN tier above, follow this decision tree:

TIER-SPECIFIC ACTIONS:

RED (replacement likely within 12 months):
- If FIRST ALERT or ESCALATED: Use send_notification with priority "high" + create_action_item with urgency "high" + upsert_forecast with urgency "critical"
- If repeat: Use send_notification with priority "medium" (don't over-notify)
- Content: Headline "{system}: Replacement likely within 12 months", include cost range, gotchas, timeline
- CTA: "Start getting quotes" primary, savings plan secondary

ORANGE (elevated near-term risk):
- If FIRST ALERT: send_notification priority "high" + upsert_forecast urgency "urgent"
- If repeat: send_notification priority "medium"
- Content: Headline "{system}: Elevated replacement risk this year"

YELLOW (plan-ahead window):
- If FIRST ALERT: send_notification priority "medium" + upsert_forecast urgency "soon"
- If repeat: send_notification priority "low"
- Content: Headline "{system}: Worth planning ahead"

GREEN_WATCH (early signal):
- send_notification priority "low" only if FIRST ALERT
- Content: "{system}: On our radar — no action needed now"

UPGRADE PLANNING (NEW — use these tools for guided replacement decisions):
- For RED/ORANGE systems OR any system with gotcha factors:
  call initiate_upgrade_planning with urgency matching the tier (RED=critical/high, ORANGE=high/medium)
  - This generates a comparison and sends a notification inviting the user to explore options
- For YELLOW systems approaching 50%+ Weibull threshold:
  call generate_upgrade_comparison to pre-compute options (user can access later)
- The upgrade comparison replaces the generic savings plan — it creates a savings plan
  that is tied to a specific upgrade tier the user selects
- If a user has MULTIPLE RED/ORANGE systems: this is a multi-system planning trigger
  (the UI will show the MultiSystemTimelineView)

LEGACY SAVINGS PLAN LOGIC (fallback when upgrade data not available):
- For RED/ORANGE/YELLOW systems: call manage_savings_plan
  - If no plan exists: action="create" with suggested monthly amount from pre-computed data
  - If plan exists but monthly needs increase (>25% gap): action="adjust"
  - If plan is on track: skip

GOTCHA HANDLING:
- If ANY gotcha has severity "safety_critical": call escalate_safety_concern IMMEDIATELY
- For "financial" gotchas: include in notification body and forecast reasoning
- For "informational" gotchas: mention in notification body

PORTFOLIO EXPOSURE (if flagged above):
- Send ONE additional summary notification covering all RED/ORANGE systems
- Include prioritized replacement sequence: which to replace first based on failure probability + cost
- Headline: "Multiple systems approaching replacement"

NOTIFICATION FREQUENCY RULES:
- First alert at a tier: full notification with all details
- Repeat at same tier: brief update only, no push notification
- Escalation to higher tier: treat as first alert at new tier
- User dismissed this tier in last 90 days (already filtered above): skip unless escalated

EDGE CASES:
- System age unknown: Note "age unverified" in all outputs; use request_information to ask user
- Brand not in database: Note "wider confidence interval" in forecast reasoning
- New construction (<2yr): Already filtered — communicate reassurance only`;

  return {
    additionalContext,
    workflowInstructions,
    preComputedData: {
      systemRisks,
      totalExposure,
      portfolioAlertNeeded: redOrange.length >= 2 && totalExposure > 5000,
    },
  };
}
