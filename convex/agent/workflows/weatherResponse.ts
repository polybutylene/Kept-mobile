/**
 * WORKFLOW 3: WEATHER EVENT RESPONSE
 *
 * Trigger: NWS API returns active alert for user's location
 * Precondition: user has location set, at least 1 system registered
 *
 * Decision tree: classify event → map to vulnerable systems → risk score →
 * generate prep actions → tiered notification delivery.
 */
import type { GenericActionCtx } from "convex/server";
import type { DataModel } from "../../_generated/dataModel";
import { internal } from "../../_generated/api";
import {
  type WorkflowPreparation,
  classifyWeatherEvent,
  calculateWeatherRisk,
  WEATHER_VULNERABILITY_MAP,
  formatCurrency,
  ageFromInstallDate,
} from "./helpers";
import type { AgentContext } from "../context";

type ActionCtx = GenericActionCtx<DataModel>;

// Event-specific prep action templates (what homeowners can do)
const WEATHER_PREP_ACTIONS: Record<string, Array<{
  systemCategory: string;
  action: string;
  timeMinutes: number;
  difficulty: string;
  priority: number;
}>> = {
  FREEZE: [
    { systemCategory: "plumbing", action: "Open cabinets under sinks to expose pipes to warm air", timeMinutes: 5, difficulty: "easy", priority: 90 },
    { systemCategory: "plumbing", action: "Drip faucets at the furthest point from where water enters your home", timeMinutes: 5, difficulty: "easy", priority: 85 },
    { systemCategory: "exterior", action: "Disconnect and drain garden hoses; close interior shut-off to outdoor faucets", timeMinutes: 15, difficulty: "easy", priority: 80 },
    { systemCategory: "hvac", action: "Set thermostat to at least 55°F even if away; never turn heat off completely", timeMinutes: 2, difficulty: "easy", priority: 95 },
    { systemCategory: "plumbing", action: "Know where your main water shut-off is — test it now before the freeze", timeMinutes: 10, difficulty: "easy", priority: 75 },
    { systemCategory: "hvac", action: "Check that your heat pump's defrost cycle is working; clear ice/snow from outdoor unit", timeMinutes: 15, difficulty: "easy", priority: 70 },
  ],
  EXTREME_HEAT: [
    { systemCategory: "hvac", action: "Replace AC filter if not done in last 30 days — dirty filters force the system to work harder", timeMinutes: 10, difficulty: "easy", priority: 90 },
    { systemCategory: "hvac", action: "Clear debris from around outdoor AC unit — needs 2ft clearance on all sides", timeMinutes: 15, difficulty: "easy", priority: 85 },
    { systemCategory: "hvac", action: "Close blinds/curtains on south and west-facing windows during peak heat", timeMinutes: 10, difficulty: "easy", priority: 70 },
    { systemCategory: "electrical", action: "Reduce load on circuits — avoid running dishwasher, oven, and dryer simultaneously", timeMinutes: 2, difficulty: "easy", priority: 60 },
  ],
  HAIL_WIND: [
    { systemCategory: "exterior", action: "Secure or store loose outdoor items (patio furniture, grills, planters)", timeMinutes: 30, difficulty: "easy", priority: 85 },
    { systemCategory: "structural", action: "Close and lock all windows — locked windows are more structurally secure", timeMinutes: 10, difficulty: "easy", priority: 80 },
    { systemCategory: "exterior", action: "If possible, park vehicles in garage to protect from hail damage", timeMinutes: 5, difficulty: "easy", priority: 75 },
    { systemCategory: "structural", action: "Photograph your roof and exterior BEFORE the storm for insurance comparison", timeMinutes: 15, difficulty: "easy", priority: 70 },
  ],
  FLOODING: [
    { systemCategory: "plumbing", action: "Test sump pump — pour water in the pit to verify it activates", timeMinutes: 10, difficulty: "easy", priority: 95 },
    { systemCategory: "electrical", action: "If flooding is imminent, turn off power to basement circuits at the breaker panel", timeMinutes: 5, difficulty: "moderate", priority: 90 },
    { systemCategory: "structural", action: "Clear gutters and downspouts — ensure water flows AWAY from foundation", timeMinutes: 30, difficulty: "moderate", priority: 85 },
    { systemCategory: "hvac", action: "If HVAC equipment is in basement, elevate portable items and electronics", timeMinutes: 20, difficulty: "moderate", priority: 80 },
  ],
  ICE_STORM: [
    { systemCategory: "structural", action: "Clear gutters to prevent ice dam formation on roof", timeMinutes: 30, difficulty: "moderate", priority: 85 },
    { systemCategory: "plumbing", action: "Insulate exposed pipes in unheated areas (attic, crawlspace, garage)", timeMinutes: 30, difficulty: "moderate", priority: 80 },
    { systemCategory: "exterior", action: "Trim any branches overhanging the roof or power lines if safely reachable", timeMinutes: 45, difficulty: "hard", priority: 75 },
  ],
  TORNADO: [
    { systemCategory: "structural", action: "Identify your safe room (interior room, lowest floor, away from windows)", timeMinutes: 5, difficulty: "easy", priority: 100 },
    { systemCategory: "exterior", action: "Secure all outdoor items immediately", timeMinutes: 20, difficulty: "easy", priority: 85 },
    { systemCategory: "structural", action: "Close interior doors to compartmentalize the home", timeMinutes: 5, difficulty: "easy", priority: 80 },
  ],
  HURRICANE: [
    { systemCategory: "structural", action: "Install storm shutters or board up windows with plywood", timeMinutes: 120, difficulty: "hard", priority: 95 },
    { systemCategory: "exterior", action: "Secure all outdoor furniture, decorations, and loose items", timeMinutes: 45, difficulty: "easy", priority: 85 },
    { systemCategory: "plumbing", action: "Fill bathtubs with water for emergency use if water supply is disrupted", timeMinutes: 10, difficulty: "easy", priority: 75 },
  ],
  WILDFIRE_SMOKE: [
    { systemCategory: "hvac", action: "Close all windows and run HVAC on recirculate mode — do NOT bring in outside air", timeMinutes: 5, difficulty: "easy", priority: 90 },
    { systemCategory: "hvac", action: "Upgrade to a high-MERV filter (MERV 13+) if available — standard filters don't catch smoke particles", timeMinutes: 15, difficulty: "easy", priority: 85 },
  ],
  LIGHTNING: [
    { systemCategory: "electrical", action: "Unplug sensitive electronics not on surge protectors", timeMinutes: 10, difficulty: "easy", priority: 80 },
    { systemCategory: "hvac", action: "Consider shutting off HVAC to protect compressor from power surge damage", timeMinutes: 5, difficulty: "easy", priority: 70 },
  ],
};

export async function prepare(
  ctx: ActionCtx,
  agentContext: AgentContext,
  triggerDetails: Record<string, unknown>,
): Promise<WorkflowPreparation> {
  if (!agentContext.home) {
    return {
      additionalContext: "",
      workflowInstructions: "No home profile — cannot assess weather vulnerability.",
      preComputedData: {},
    };
  }

  const homeId = agentContext.home._id;
  const metadata = (triggerDetails.metadata ?? triggerDetails) as Record<string, unknown>;
  const alertType = (metadata.alertType ?? metadata.type ?? "unknown") as string;
  const severity = (metadata.severity ?? "moderate") as string;
  const headline = (metadata.headline ?? "") as string;
  const startTime = metadata.startTime as number | undefined;
  const endTime = metadata.endTime as number | undefined;

  // Classify the weather event
  const eventCategory = classifyWeatherEvent(alertType);
  const vulnerableCategories = WEATHER_VULNERABILITY_MAP[eventCategory] ?? [];

  // Get Weibull forecasts for risk scoring
  const forecastResults = await ctx.runQuery(
    internal.agent.workflows.queries.getForecastResultsForHome,
    { homeId },
  );
  const forecastBySystem = new Map<string, typeof forecastResults[0]>();
  for (const f of forecastResults) {
    forecastBySystem.set(f.systemId as string, f);
  }

  // Identify vulnerable systems and score them
  const vulnerableSystems: Array<{
    systemId: string;
    systemName: string;
    category: string;
    age: number | undefined;
    riskScore: number;
    pFailure1yr: number;
  }> = [];

  for (const sys of agentContext.systems) {
    if (!vulnerableCategories.includes(sys.category)) continue;

    const forecast = forecastBySystem.get(sys._id as string);
    const age = sys.age ?? ageFromInstallDate(sys.installDate);
    const conditionPercentile = forecast
      ? 1 - forecast.failureProbabilityNextYear
      : 0.5; // assume average if no data

    const riskScore = calculateWeatherRisk(
      age ?? 10,
      conditionPercentile,
      severity,
    );

    vulnerableSystems.push({
      systemId: sys._id as string,
      systemName: `${sys.type}${sys.brand ? ` (${sys.brand})` : ""}`,
      category: sys.category,
      age,
      riskScore,
      pFailure1yr: forecast?.failureProbabilityNextYear ?? 0.1,
    });
  }

  // Sort by risk score descending
  vulnerableSystems.sort((a, b) => b.riskScore - a.riskScore);

  // Calculate hours until event
  const hoursUntilEvent = startTime
    ? Math.max(0, Math.round((startTime - Date.now()) / (1000 * 60 * 60)))
    : 24; // default to 24hrs if unknown

  // Get applicable prep actions
  const prepActions = WEATHER_PREP_ACTIONS[eventCategory] ?? [];
  const applicableActions = prepActions
    .filter((a) => vulnerableSystems.some((vs) => vs.category === a.systemCategory))
    .filter((a) => a.timeMinutes <= hoursUntilEvent * 40) // feasibility check
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 7); // never more than 7 actions

  // Determine notification urgency
  let notificationUrgency: string;
  if (["extreme", "severe"].includes(severity.toLowerCase()) && hoursUntilEvent <= 24) {
    notificationUrgency = "IMMEDIATE";
  } else if (["extreme", "severe"].includes(severity.toLowerCase()) && hoursUntilEvent <= 72) {
    notificationUrgency = "HIGH";
  } else if (severity.toLowerCase() === "moderate") {
    notificationUrgency = "MEDIUM";
  } else {
    notificationUrgency = "LOW";
  }

  // ── Build prompt context ──────────────────────────────────────

  const contextLines: string[] = [
    "PRE-COMPUTED WEATHER RISK ASSESSMENT:",
    `Event: ${eventCategory} | Severity: ${severity} | Alert: "${headline}"`,
    `Hours until onset: ~${hoursUntilEvent}`,
    `Notification urgency: ${notificationUrgency}`,
  ];

  if (vulnerableSystems.length === 0) {
    contextLines.push("\nNo registered systems match this weather event's vulnerability profile.");
    contextLines.push("Send general safety information only (low priority).");
  } else {
    contextLines.push(`\nVulnerable systems (${vulnerableSystems.length}):`);
    for (const vs of vulnerableSystems) {
      contextLines.push(`  • ${vs.systemName} [${vs.systemId}] — Risk score: ${vs.riskScore}/100, Age: ${vs.age ?? "?"} yrs`);
    }

    if (applicableActions.length > 0) {
      contextLines.push("\nRecommended prep actions (pre-sorted by priority, filtered by feasibility):");
      for (let i = 0; i < applicableActions.length; i++) {
        const a = applicableActions[i];
        contextLines.push(`  ${i + 1}. [${a.difficulty}] ${a.action} (~${a.timeMinutes} min)`);
      }
    }
  }

  const additionalContext = contextLines.join("\n");

  // ── Build workflow instructions ───────────────────────────────

  const workflowInstructions = `
═══ WORKFLOW: WEATHER EVENT RESPONSE ═══

You are responding to a weather alert. Follow this decision tree:

STEP 1: ASSESS & NOTIFY
- Notification priority based on pre-computed urgency: ${notificationUrgency}
  - IMMEDIATE → send_notification priority "critical"
  - HIGH → send_notification priority "high"
  - MEDIUM → send_notification priority "medium"
  - LOW → send_notification priority "low"

STEP 2: SYSTEM-SPECIFIC RISK CALLOUTS
For each system with risk score > 70:
- Include a specific callout explaining WHY it's vulnerable
- Reference the system's age and condition
- E.g., "Your 15-year-old roof is particularly vulnerable to hail because..."

STEP 3: ACTION CHECKLIST
The pre-computed prep actions above are already sorted and filtered.
Format them as a numbered checklist in your notification:
- Include estimated time for each action
- Group by difficulty (easy stuff first)
- Total time estimate at the end

STEP 4: CREATE ACTION ITEMS
For the top 3-5 prep actions, create_action_item with:
- urgency based on notification urgency (IMMEDIATE→critical, HIGH→high, etc.)
- category "diy_maintenance" for easy actions, "safety" for critical ones
- due date = estimated event onset time

STEP 5: POST-EVENT FOLLOWUP
- Use schedule_future_check with checkDate = estimated event end time (or +24 hours)
- Reason: "Post-${eventCategory.toLowerCase()} damage inspection check-in"
- In your notification, mention: "After the ${eventCategory.toLowerCase().replace("_", " ")} passes, I'll check in about any damage to inspect for."

NOTIFICATION FORMAT:
- Headline: "${headline || `${eventCategory.replace("_", " ")} arriving in ${hoursUntilEvent} hours`}" — reference vulnerable systems
- Risk summary: "Your most vulnerable systems: [top 3 names]"
- Action checklist: numbered, time-estimated, sorted by priority
- High-risk callout: if any system has risk score > 70
- Post-event note: "After the storm passes, I'll check in..."

EDGE CASES:
- No vulnerable systems: Send brief general safety info, low priority
- Multiple simultaneous alerts: Merge into single notification, take highest severity
- < 6 hours until event: Focus on quick actions only (< 15 min each), increase urgency
- Post-event follow-up reports damage: Route to Workflow 2 (symptom diagnosis)`;

  return {
    additionalContext,
    workflowInstructions,
    preComputedData: {
      eventCategory,
      vulnerableSystems,
      applicableActions,
      notificationUrgency,
      hoursUntilEvent,
    },
  };
}
