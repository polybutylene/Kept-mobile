/**
 * WORKFLOW 7: NEW HOME ONBOARDING ANALYSIS
 *
 * Trigger: user completes onboarding (systems registered, home profile filled)
 * Precondition: new user OR new property added to existing account
 *
 * Decision tree: analyze all systems → gotcha scan → risk prioritization →
 * initial savings plan → determine hook → build first impressions report.
 */
import type { GenericActionCtx } from "convex/server";
import type { DataModel } from "../../_generated/dataModel";
import { internal } from "../../_generated/api";
import {
  type WorkflowPreparation,
  classifyRiskTier,
  weibullFailureProbability,
  medianRemainingLife,
  calculateMonthlySavings,
  calculateHomeHealthScore,
  checkGotchaFactors,
  formatCurrency,
  formatPercent,
  ageFromInstallDate,
} from "./helpers";
import type { AgentContext } from "../context";

type ActionCtx = GenericActionCtx<DataModel>;

interface OnboardingSystemAnalysis {
  systemId: string;
  systemName: string;
  category: string;
  age: number | undefined;
  pFailure1yr: number;
  pFailure3yr: number;
  pFailure5yr: number;
  medRemaining: number;
  replacementCost: number;
  healthScore: number;
  gotchas: Array<{ id: string; description: string; severity: string; recommendation: string }>;
  hasSafetyCriticalGotcha: boolean;
  riskTier: string;
}

export async function prepare(
  ctx: ActionCtx,
  agentContext: AgentContext,
  triggerDetails: Record<string, unknown>,
): Promise<WorkflowPreparation> {
  if (!agentContext.home) {
    return {
      additionalContext: "",
      workflowInstructions: "No home profile — cannot run onboarding analysis.",
      preComputedData: {},
    };
  }

  const homeId = agentContext.home._id;
  const metadata = (triggerDetails.metadata ?? {}) as Record<string, unknown>;
  const yearBuilt = agentContext.home.yearBuilt;
  const isNewConstruction = yearBuilt && yearBuilt > new Date().getFullYear() - 2;
  const isVeryOldHome = yearBuilt && yearBuilt < 1960;

  // Get Weibull forecast data (may not exist yet for new systems)
  const forecastResults = await ctx.runQuery(
    internal.agent.workflows.queries.getForecastResultsForHome,
    { homeId },
  );
  const forecastBySystem = new Map<string, typeof forecastResults[0]>();
  for (const f of forecastResults) {
    forecastBySystem.set(f.systemId as string, f);
  }

  // Analyze each system
  const systemAnalyses: OnboardingSystemAnalysis[] = [];
  let hasSafetyCritical = false;

  for (const sys of agentContext.systems) {
    const forecast = forecastBySystem.get(sys._id as string);
    const age = sys.age ?? ageFromInstallDate(sys.installDate);
    const installYear = sys.installDate ? new Date(sys.installDate).getFullYear() : yearBuilt;

    // Calculate failure probabilities
    let p1yr: number, p3yr: number, p5yr: number, medRemaining: number;
    let replacementCost: number;
    let healthScore: number;

    if (forecast) {
      p1yr = forecast.failureProbabilityNextYear;
      p3yr = forecast.failureProbabilityNext5Years * 0.6; // approximate 3yr from 5yr
      p5yr = forecast.failureProbabilityNext5Years;
      medRemaining = forecast.medianRemainingLifeMonths / 12;
      replacementCost = forecast.estimatedReplacementCost;
      healthScore = Math.round((1 - p1yr) * 100);
    } else {
      // Conservative estimates for systems without forecasts
      p1yr = isNewConstruction ? 0.01 : age && age > 15 ? 0.2 : age && age > 10 ? 0.1 : 0.03;
      p3yr = isNewConstruction ? 0.03 : age && age > 12 ? 0.35 : age && age > 8 ? 0.15 : 0.08;
      p5yr = isNewConstruction ? 0.05 : age && age > 10 ? 0.45 : age && age > 5 ? 0.25 : 0.12;
      medRemaining = isNewConstruction ? 15 : Math.max(15 - (age ?? 0), 1);
      replacementCost = 3000; // conservative default
      healthScore = Math.round((1 - p1yr) * 100);
    }

    // Gotcha scan
    const gotchas = checkGotchaFactors({
      systemType: sys.type,
      systemCategory: sys.category,
      manufacturer: sys.brand,
      installYear: installYear ?? undefined,
    });
    const hasSafetyCriticalGotcha = gotchas.some((g) => g.severity === "safety_critical");
    if (hasSafetyCriticalGotcha) hasSafetyCritical = true;

    const riskTier = classifyRiskTier(p1yr, p3yr, p5yr);

    systemAnalyses.push({
      systemId: sys._id as string,
      systemName: `${sys.type}${sys.brand ? ` (${sys.brand})` : ""}`,
      category: sys.category,
      age,
      pFailure1yr: p1yr,
      pFailure3yr: p3yr,
      pFailure5yr: p5yr,
      medRemaining,
      replacementCost,
      healthScore,
      gotchas,
      hasSafetyCriticalGotcha,
      riskTier,
    });
  }

  // Sort by risk (highest risk first)
  systemAnalyses.sort((a, b) => b.pFailure3yr - a.pFailure3yr);

  // Calculate home health score
  const homeHealthScore = calculateHomeHealthScore(
    systemAnalyses.map((s) => ({
      healthScore: s.healthScore,
      failureProbability1yr: s.pFailure1yr,
      replacementCost: s.replacementCost,
    })),
  );

  // 3-year financial exposure
  const exposedSystems = systemAnalyses.filter((s) => s.pFailure3yr > 0.30);
  const total3yrExposure = exposedSystems.reduce((sum, s) => sum + s.replacementCost, 0);

  // Initial savings plan calculations
  const savingsCandidates = systemAnalyses
    .filter((s) => s.pFailure5yr > 0.25)
    .slice(0, 5);
  let totalMonthlySavings = 0;
  const savingsAllocations: Array<{
    systemName: string;
    systemId: string;
    monthly: number;
    target: number;
    timelineMonths: number;
  }> = [];

  for (const sys of savingsCandidates) {
    const monthly = calculateMonthlySavings(sys.replacementCost, sys.medRemaining * 12);
    totalMonthlySavings += monthly;
    savingsAllocations.push({
      systemName: sys.systemName,
      systemId: sys.systemId,
      monthly,
      target: sys.replacementCost,
      timelineMonths: Math.round(sys.medRemaining * 12),
    });
  }

  // Determine primary hook (the single most compelling value-proof)
  let hookType: string;
  let hookDescription: string;

  const highestRisk = systemAnalyses[0];

  if (hasSafetyCritical) {
    const safetySystem = systemAnalyses.find((s) => s.hasSafetyCriticalGotcha)!;
    hookType = "SAFETY_GOTCHA";
    hookDescription = `Safety concern found: ${safetySystem.gotchas.find((g) => g.severity === "safety_critical")?.description ?? "Known safety issue detected"}`;
  } else if (highestRisk && highestRisk.pFailure1yr > 0.40) {
    hookType = "IMMINENT_REPLACEMENT";
    hookDescription = `Your ${highestRisk.systemName} is ${highestRisk.age ?? "?"} years old and likely needs replacement soon. Typical cost: ${formatCurrency(highestRisk.replacementCost)}.`;
  } else if (systemAnalyses.some((s) => s.gotchas.length > 0)) {
    const gotchaSystem = systemAnalyses.find((s) => s.gotchas.length > 0)!;
    hookType = "GOTCHA_AWARENESS";
    hookDescription = `Your ${gotchaSystem.systemName} has a quirk: ${gotchaSystem.gotchas[0].description}`;
  } else if (total3yrExposure > 10000) {
    hookType = "FINANCIAL_EXPOSURE";
    hookDescription = `Over the next 3 years, you could face ~${formatCurrency(total3yrExposure)} in replacements across ${exposedSystems.length} systems.`;
  } else {
    hookType = "PEACE_OF_MIND";
    hookDescription = "Your home systems are in solid shape. Kept will monitor everything and alert you when it's time to act.";
  }

  // ── Build prompt context ──────────────────────────────────────

  const contextLines: string[] = [
    "PRE-COMPUTED ONBOARDING ANALYSIS:",
    `Systems analyzed: ${systemAnalyses.length}`,
    `Home health score: ${homeHealthScore}/100`,
    `Year built: ${yearBuilt ?? "unknown"}`,
    isNewConstruction ? "⭐ NEW CONSTRUCTION — skip heavy forecasting, focus on warranty tracking." : "",
    isVeryOldHome ? "⚠ PRE-1960 HOME — elevated gotcha probability, check for legacy materials." : "",
    `\nPRIMARY HOOK: ${hookType}`,
    `  ${hookDescription}`,
  ].filter(Boolean);

  // System-by-system breakdown
  contextLines.push("\nSYSTEM RISK RANKING (highest risk first):");
  for (const sys of systemAnalyses) {
    contextLines.push(`\n  • ${sys.systemName} [${sys.systemId}] — Tier: ${sys.riskTier}`);
    contextLines.push(`    Age: ${sys.age ?? "?"} yrs | Health: ${sys.healthScore}/100`);
    contextLines.push(`    Failure prob: 1yr=${formatPercent(sys.pFailure1yr)}, 3yr=${formatPercent(sys.pFailure3yr)}`);
    contextLines.push(`    Replacement cost: ${formatCurrency(sys.replacementCost)}`);
    if (sys.gotchas.length > 0) {
      for (const g of sys.gotchas) {
        contextLines.push(`    ⚡ GOTCHA [${g.severity}]: ${g.description}`);
      }
    }
  }

  if (total3yrExposure > 0) {
    contextLines.push(`\n3-YEAR FINANCIAL EXPOSURE: ${formatCurrency(total3yrExposure)} across ${exposedSystems.length} systems`);
  }

  if (savingsAllocations.length > 0) {
    contextLines.push("\nSUGGESTED SAVINGS PLAN:");
    contextLines.push(`  Total monthly: ${formatCurrency(totalMonthlySavings)}/mo`);
    for (const sa of savingsAllocations) {
      contextLines.push(`  - ${sa.systemName}: ${formatCurrency(sa.monthly)}/mo → ${formatCurrency(sa.target)} over ${sa.timelineMonths} months`);
    }
  }

  const additionalContext = contextLines.join("\n");

  // ── Build workflow instructions ───────────────────────────────

  const workflowInstructions = `
═══ WORKFLOW: NEW HOME ONBOARDING ANALYSIS ═══

You are generating the user's first Home Health Report. This is the MOST IMPORTANT moment for user retention — the report must demonstrate Kept's value immediately.

STEP 1: SAFETY GOTCHAS FIRST
${hasSafetyCritical
  ? "⚠ SAFETY-CRITICAL GOTCHA DETECTED. Call escalate_safety_concern IMMEDIATELY for each safety issue."
  : "No safety-critical gotchas found. Proceed to analysis."}

STEP 2: SYSTEM FORECASTS
For EACH system in the analysis above:
- Call upsert_forecast with the system's risk assessment
- Set urgency based on risk tier: RED→critical, ORANGE→urgent, YELLOW→soon, GREEN_WATCH→routine
- Include the pre-computed failure probabilities and cost estimates in reasoning

STEP 3: GOTCHA FLAGGING
For each system with gotchas:
- Financial gotchas: include in forecast description and send_notification
- Informational gotchas: mention in notification body
- Safety gotchas: already handled in Step 1

STEP 4: SAVINGS PLANS
${savingsAllocations.length > 0
  ? `Create savings plans for ${savingsAllocations.length} systems:\n${savingsAllocations.map((sa) =>
    `  - call manage_savings_plan: systemId="${sa.systemId}", action="create", targetAmount=${sa.target}, monthlyAmount=${sa.monthly}`
  ).join("\n")}`
  : "No savings plans needed — all systems have low replacement risk."}

STEP 5: DETERMINE WHAT TO LEAD WITH
Hook type: ${hookType}
${hookType === "SAFETY_GOTCHA"
  ? "Lead with the safety concern. Be direct but not alarming. Explain what to do."
  : hookType === "IMMINENT_REPLACEMENT"
  ? "Lead with the approaching replacement. Frame it as 'the good news is we caught it in time to plan.'"
  : hookType === "GOTCHA_AWARENESS"
  ? "Lead with the interesting gotcha. Frame it as 'here's something most homeowners don't know about your [system].'"
  : hookType === "FINANCIAL_EXPOSURE"
  ? "Lead with the 3-year cost picture. Frame it as 'here's what to expect — and how to prepare.'"
  : "Lead with reassurance. 'Good news — your home is in great shape. Here's how to keep it that way.'"}

STEP 6: BUILD THE FIRST IMPRESSIONS REPORT
send_notification with type "insight", priority "high":
- Headline: "Your Home Health Report"
- Body structure:
  1. Home health score: ${homeHealthScore}/100
  2. Hook section (from Step 5)
  3. Systems overview (sorted by risk, with status indicators)
  4. Gotcha section (if any)
  5. Savings plan proposal: "${formatCurrency(totalMonthlySavings)}/mo covers your upcoming needs"
  6. Next steps: what to do first

STEP 7: SCHEDULE FOLLOWUPS
- schedule_future_check: 3 days from now — "Onboarding follow-up: Had a chance to look at your home report?"
- schedule_future_check: next quarter start — "First seasonal maintenance sweep"

RESPONSE FORMAT:
Your text response should be the full Home Health Report content — comprehensive, specific, grounded in the data above. This is what the user sees first. Make it count.

EDGE CASES:
- Very few systems (< 3): Note "Add more systems to improve accuracy" in next steps
${isNewConstruction ? "- NEW CONSTRUCTION: All ages ~0. Focus on warranty tracking and maintenance scheduling. Hook = PEACE_OF_MIND." : ""}
${isVeryOldHome ? "- PRE-1960 HOME: Flag elevated gotcha probability. Prompt for inspection report upload. Mention legacy materials (lead paint, knob-and-tube, cast iron)." : ""}
- User skipped photos: Mark all systems as "unverified" in notes; lower confidence in assessments
- No systems at all: Send encouraging notification to complete setup

TOOL CHAIN (in order):
1. escalate_safety_concern (if safety gotchas)
2. upsert_forecast × N (one per system)
3. manage_savings_plan × N (for systems needing savings)
4. create_action_item (top 3 immediate priorities)
5. send_notification (the Home Health Report)
6. schedule_future_check × 2 (3-day follow-up + first sweep)`;

  return {
    additionalContext,
    workflowInstructions,
    preComputedData: {
      homeHealthScore,
      hookType,
      total3yrExposure,
      totalMonthlySavings,
      systemCount: systemAnalyses.length,
      hasSafetyCritical,
      savingsAllocations,
    },
  };
}
