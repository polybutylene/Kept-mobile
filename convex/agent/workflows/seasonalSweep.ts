/**
 * WORKFLOW 5: SEASONAL MAINTENANCE SWEEP
 *
 * Trigger: quarterly cron — Jan 1, Apr 1, Jul 1, Oct 1
 * Precondition: user has ≥ 1 system, account active > 7 days
 *
 * Decision tree: determine season → gather tasks per system → prioritize →
 * bundle related tasks → check for carryover → build seasonal plan.
 */
import type { GenericActionCtx } from "convex/server";
import type { DataModel } from "../../_generated/dataModel";
import { internal } from "../../_generated/api";
import {
  type WorkflowPreparation,
  determineSeason,
  calculateTaskPriority,
  formatCurrency,
  monthsBetween,
  ageFromInstallDate,
} from "./helpers";
import type { AgentContext } from "../context";

type ActionCtx = GenericActionCtx<DataModel>;

// Seasonal task relevance by category and season
const SEASONAL_RELEVANCE: Record<string, Record<string, number>> = {
  hvac: { spring: 0.9, summer: 0.6, fall: 0.9, winter: 0.6 },
  plumbing: { spring: 0.5, summer: 0.4, fall: 0.7, winter: 0.8 },
  electrical: { spring: 0.4, summer: 0.5, fall: 0.4, winter: 0.5 },
  structural: { spring: 0.8, summer: 0.5, fall: 0.7, winter: 0.3 },
  exterior: { spring: 0.9, summer: 0.6, fall: 0.8, winter: 0.3 },
  appliances: { spring: 0.4, summer: 0.5, fall: 0.4, winter: 0.5 },
};

interface ScoredTask {
  systemId: string;
  systemName: string;
  category: string;
  taskName: string;
  taskDescription: string;
  priority: number;
  estimatedTimeMinutes: number;
  difficulty: string;
  isOverdue: boolean;
  isCarryover: boolean;
  skipConsequence: string;
  lastCompleted: string | null;
  monthsSinceCompleted: number | null;
}

export async function prepare(
  ctx: ActionCtx,
  agentContext: AgentContext,
  triggerDetails: Record<string, unknown>,
): Promise<WorkflowPreparation> {
  if (!agentContext.home) {
    return {
      additionalContext: "",
      workflowInstructions: "No home profile — skip seasonal sweep.",
      preComputedData: {},
    };
  }

  const homeId = agentContext.home._id;
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const season = (triggerDetails.metadata as any)?.season ??
    determineSeason(currentMonth, agentContext.home.climateZone ?? undefined);

  // Gather data
  const [maintenanceTasks, forecastResults, latestSweep] = await Promise.all([
    ctx.runQuery(internal.agent.workflows.queries.getMaintenanceTasksForHome, { homeId }),
    ctx.runQuery(internal.agent.workflows.queries.getForecastResultsForHome, { homeId }),
    ctx.runQuery(internal.agent.workflows.queries.getLatestSweep, { homeId }),
  ]);

  // Build forecast lookup
  const forecastBySystem = new Map<string, typeof forecastResults[0]>();
  for (const f of forecastResults) {
    forecastBySystem.set(f.systemId as string, f);
  }

  // Build task completion lookup (from maintenance tasks)
  const completedTasks = maintenanceTasks.filter((t) => t.status === "completed");
  const overdueTasks = maintenanceTasks.filter((t) =>
    t.status === "overdue" || (t.status === "due" && t.dueDate && new Date(t.dueDate) < now),
  );

  // Check for carryover from prior sweep
  const priorSweepTasks: string[] = [];
  if (latestSweep?.tasks) {
    try {
      const tasks = Array.isArray(latestSweep.tasks) ? latestSweep.tasks : [];
      for (const t of tasks) {
        if (t && typeof t === "object" && t.status !== "completed") {
          priorSweepTasks.push(t.taskName ?? t.name ?? "Unknown task");
        }
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Score all tasks
  const allScoredTasks: ScoredTask[] = [];

  for (const sys of agentContext.systems) {
    const forecast = forecastBySystem.get(sys._id as string);
    const age = sys.age ?? ageFromInstallDate(sys.installDate);
    const pFailure1yr = forecast?.failureProbabilityNextYear ?? 0.1;
    const seasonRelevance = SEASONAL_RELEVANCE[sys.category]?.[season] ?? 0.5;

    // Find this system's overdue tasks
    const systemOverdue = overdueTasks.filter((t) => (t.systemId as string) === (sys._id as string));

    for (const task of systemOverdue) {
      const monthsSince = task.completedDate
        ? monthsBetween(task.completedDate, Date.now())
        : null;

      const isCarryover = priorSweepTasks.some(
        (pt) => pt.toLowerCase().includes((task.name ?? "").toLowerCase()),
      );

      let priority = calculateTaskPriority({
        isOverdue: true,
        skipRisk: task.priority === "critical" || task.priority === "high" ? "high" : "medium",
        systemAgeYears: age ?? 10,
        pFailure1yr,
        seasonRelevance,
      });

      // Boost carryover tasks
      if (isCarryover) priority = Math.min(priority + 20, 100);

      allScoredTasks.push({
        systemId: sys._id as string,
        systemName: `${sys.type}${sys.brand ? ` (${sys.brand})` : ""}`,
        category: sys.category,
        taskName: task.name,
        taskDescription: task.description ?? "",
        priority,
        estimatedTimeMinutes: task.estimatedTimeMinutes ?? 30,
        difficulty: task.difficulty ?? "moderate",
        isOverdue: true,
        isCarryover,
        skipConsequence: task.priority === "critical" ? "Could cause system damage or safety risk" :
          task.priority === "high" ? "Accelerates wear and shortens system life" :
          "Minor efficiency or lifespan impact",
        lastCompleted: task.completedDate ?? null,
        monthsSinceCompleted: monthsSince,
      });
    }

    // Add seasonal maintenance tasks that aren't already overdue
    // (These come from the system's maintenance history patterns)
    const systemCompleted = completedTasks.filter(
      (t) => (t.systemId as string) === (sys._id as string),
    );
    const lastServiceDate = sys.lastServiceDate
      ? new Date(sys.lastServiceDate)
      : null;

    // Check if system needs seasonal attention based on category
    if (seasonRelevance >= 0.7 && !systemOverdue.length) {
      const monthsSinceService = lastServiceDate
        ? monthsBetween(lastServiceDate.toISOString(), Date.now())
        : 12; // Assume overdue if no service history

      if (monthsSinceService >= 6) {
        const priority = calculateTaskPriority({
          isOverdue: monthsSinceService >= 12,
          skipRisk: "medium",
          systemAgeYears: age ?? 10,
          pFailure1yr,
          seasonRelevance,
        });

        allScoredTasks.push({
          systemId: sys._id as string,
          systemName: `${sys.type}${sys.brand ? ` (${sys.brand})` : ""}`,
          category: sys.category,
          taskName: `${season.charAt(0).toUpperCase() + season.slice(1)} maintenance for ${sys.type}`,
          taskDescription: `Seasonal ${season} check for ${sys.type}. Last service: ${lastServiceDate ? lastServiceDate.toISOString().slice(0, 10) : "unknown"}.`,
          priority,
          estimatedTimeMinutes: 30,
          difficulty: "moderate",
          isOverdue: monthsSinceService >= 12,
          isCarryover: false,
          skipConsequence: "May miss early warning signs of developing issues",
          lastCompleted: sys.lastServiceDate ?? null,
          monthsSinceCompleted: monthsSinceService,
        });
      }
    }
  }

  // Sort by priority descending
  allScoredTasks.sort((a, b) => b.priority - a.priority);

  // Tier the tasks
  const mustDo = allScoredTasks.filter((t) => t.priority >= 70).slice(0, 5);
  const shouldDo = allScoredTasks.filter((t) => t.priority >= 40 && t.priority < 70).slice(0, 4);
  const niceToDo = allScoredTasks.filter((t) => t.priority < 40).slice(0, 3);

  // Anti-overwhelm consolidation
  const totalTasks = mustDo.length + shouldDo.length + niceToDo.length;
  const isFirstSweep = !latestSweep;
  const totalTimeMinutes = [...mustDo, ...shouldDo, ...niceToDo].reduce(
    (sum, t) => sum + t.estimatedTimeMinutes, 0,
  );

  // ── Build prompt context ──────────────────────────────────────

  const contextLines: string[] = [
    `PRE-COMPUTED SEASONAL SWEEP: ${season.toUpperCase()} ${currentYear}`,
    `Climate zone: ${agentContext.home.climateZone ?? "unknown"}`,
    `Total tasks identified: ${allScoredTasks.length}`,
    `Total estimated time: ~${totalTimeMinutes} minutes`,
    isFirstSweep ? "⭐ This is the user's FIRST seasonal sweep." : "",
    priorSweepTasks.length > 0
      ? `⚠ ${priorSweepTasks.length} tasks from last quarter still incomplete.`
      : "",
  ].filter(Boolean);

  const formatTaskList = (tasks: ScoredTask[], label: string): string => {
    if (tasks.length === 0) return `\n${label}: (none)`;
    const lines = [`\n${label}:`];
    for (const t of tasks) {
      lines.push(`  • [P${t.priority}] ${t.taskName} — ${t.systemName}`);
      lines.push(`    ${t.difficulty} | ~${t.estimatedTimeMinutes}min | ${t.isOverdue ? "OVERDUE" : "due"}${t.isCarryover ? " | CARRYOVER" : ""}`);
      if (t.skipConsequence) lines.push(`    Skip risk: ${t.skipConsequence}`);
    }
    return lines.join("\n");
  };

  contextLines.push(formatTaskList(mustDo, "DO THIS FIRST (priority ≥70)"));
  contextLines.push(formatTaskList(shouldDo, "ALSO IMPORTANT (priority 40-69)"));
  contextLines.push(formatTaskList(niceToDo, "IF YOU HAVE TIME (priority <40)"));

  const additionalContext = contextLines.join("\n");

  // ── Build workflow instructions ───────────────────────────────

  const workflowInstructions = `
═══ WORKFLOW: SEASONAL MAINTENANCE SWEEP ═══

You are running the ${season} seasonal maintenance sweep. Follow this decision tree:

SEASON-SPECIFIC FOCUS:
${season === "spring" ? "Focus: AC prep, roof inspection after winter, gutter cleaning, exterior paint/caulk check, foundation drainage check" :
  season === "summer" ? "Focus: AC performance, attic ventilation, pest entry points, deck inspection, irrigation check" :
  season === "fall" ? "Focus: Heating system prep, chimney/flue inspection, weatherstripping, gutter cleaning, pipe insulation" :
  "Focus: Pipe freeze prevention, heating system check, ice dam prevention, emergency kit check"}

STEP 1: GENERATE TASK LIST
The pre-computed tasks above are already scored and tiered. Use them as your foundation.
For each system, consider additional ${season}-specific tasks from your domain knowledge.

STEP 2: CREATE ACTION ITEMS
For each task in "DO THIS FIRST" and "ALSO IMPORTANT":
- create_action_item with appropriate urgency and category
- Include estimated time and difficulty in description
- Set due date within the next 30 days

STEP 3: BUNDLE RELATED TASKS
Group tasks that can be done together:
- "While you're on the roof checking vents, also inspect flashing"
- "While checking the furnace, also inspect the humidifier"
Note these bundles in your notification.

STEP 4: HANDLE CARRYOVER
${priorSweepTasks.length > 0
  ? `There are ${priorSweepTasks.length} incomplete tasks from last quarter. Mention these prominently and explain why they matter.`
  : "No carryover tasks."}

STEP 5: ANTI-OVERWHELM RULES
${isFirstSweep
  ? "⭐ FIRST SWEEP: Limit to top 3 tasks. Preface with: 'This is your first seasonal check-in. Don't worry about catching everything at once — let's start with the 3 most important things.'"
  : totalTasks > 10
  ? "Many tasks identified — consolidate. Show top 5 must-do items, summarize the rest as 'and N more when you have time.'"
  : totalTasks === 0
  ? "No tasks needed! Celebrate: 'You're fully caught up! Nothing needed this quarter. 🏠'"
  : "Manageable task count — show the full tiered list."}

STEP 6: BUILD NOTIFICATION
send_notification with:
- priority "medium" (seasonal sweeps are important but not urgent)
- type "reminder"
- Headline: "${season.charAt(0).toUpperCase() + season.slice(1)} Home Maintenance Plan"
- Include total estimated time
- Include the tiered task list
- CTA: "See your full maintenance plan"

STEP 7: SCHEDULE FOLLOWUP
schedule_future_check for 30 days from now:
- reason: "${season} sweep 30-day check-in — verify progress on top tasks"

NOTIFICATION FORMAT:
"${season.charAt(0).toUpperCase() + season.slice(1)} is ${season === "winter" ? "here" : "approaching"} — here are the ${Math.min(totalTasks, 7)} things that matter most for your home."
Then: tiered list (Do This First / Also Important / If You Have Time)
Then: total time estimate ("This should take about X hours over a weekend or two")

EDGE CASES:
- User in mild climate (zones 1-2): Fewer seasonal tasks. Acknowledge: "Your climate is forgiving — just a few things to check."
- All tasks completed: "You're fully caught up! Nothing needed this quarter."
- No completions in 2+ quarters: "I sent some tasks last quarter but didn't hear back. Want to do a quick check-in?"
- New construction: Skip heavy maintenance, focus on warranty documentation`;

  return {
    additionalContext,
    workflowInstructions,
    preComputedData: {
      season,
      totalTasks: allScoredTasks.length,
      totalTimeMinutes,
      isFirstSweep,
      carryoverCount: priorSweepTasks.length,
      mustDoCount: mustDo.length,
    },
  };
}
