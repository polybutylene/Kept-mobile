import { query } from "./_generated/server";
import { v } from "convex/values";
import {
  getCampaignForMonth,
  getSeasonForMonth,
  SEASONAL_CAMPAIGNS,
} from "./data/seasonalCampaigns";
import { OPTIMAL_MONTHS_FL_PANHANDLE } from "./data/optimalMonths";
import {
  getAgeMultiplier as getDetailedAgeMultiplier,
  AGE_MULTIPLIERS,
} from "./data/ageMultipliers";

// ---------------------------------------------------------------------------
// Internal helpers — not exported as Convex functions
// ---------------------------------------------------------------------------

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/**
 * Age-based maintenance frequency multiplier.
 * Mirrors the curve in forecasting.ts (getAgeUrgencyMultiplier) but returns
 * a divisor so that *frequency shrinks* (more frequent) as a system ages.
 */
function getAgeMultiplier(systemAge: number, lifespan: number): number {
  const ratio = systemAge / lifespan;
  if (ratio < 0.3) return 1.0;
  if (ratio < 0.5) return 1.1;
  if (ratio < 0.7) return 1.25;
  if (ratio < 0.85) return 1.5;
  return 1.75;
}

/**
 * Given a task's `seasonalMonths` from the catalog and a raw calculated date,
 * snap to the nearest seasonal month when within ~30 days.
 */
function snapToOptimalMonth(
  calculatedDate: Date,
  seasonalMonths: number[] | undefined,
): Date {
  if (!seasonalMonths || seasonalMonths.length === 0) return calculatedDate;

  const calcMonth = calculatedDate.getMonth() + 1;
  for (const month of seasonalMonths) {
    const diff = Math.abs(month - calcMonth);
    const wrappedDiff = Math.min(diff, 12 - diff);
    if (wrappedDiff <= 1) {
      const snapped = new Date(calculatedDate);
      snapped.setMonth(month - 1);
      snapped.setDate(15);
      return snapped;
    }
  }
  return calculatedDate;
}

/**
 * Return the next occurrence of `targetMonth` (1-12) from `fromDate`.
 */
function getNextOccurrenceOfMonth(
  targetMonth: number,
  fromDate: Date,
): Date {
  const result = new Date(fromDate);
  result.setDate(15);
  if (result.getMonth() + 1 >= targetMonth) {
    result.setFullYear(result.getFullYear() + 1);
  }
  result.setMonth(targetMonth - 1);
  return result;
}

/**
 * Calculate the next due date for a task given its base frequency, system age,
 * and seasonal preference data from the catalog.
 */
function calculateNextDueDate(
  baseFrequencyDays: number,
  lastCompletedDate: Date | null,
  systemAge: number,
  lifespan: number,
  seasonalMonths?: number[],
): Date {
  const multiplier = getAgeMultiplier(systemAge, lifespan);
  const adjustedDays = Math.max(
    7,
    Math.round(baseFrequencyDays / multiplier),
  );

  const from = lastCompletedDate ?? new Date();
  const raw = new Date(from.getTime() + adjustedDays * 86_400_000);

  return snapToOptimalMonth(raw, seasonalMonths);
}

/**
 * Build a Set<string> of all taskIds that belong to the campaign active in
 * `month`, for fast look-ups.
 */
function getCampaignTaskIds(month: number): Set<string> {
  const key = getCampaignForMonth(month);
  if (!key) return new Set();
  return new Set(SEASONAL_CAMPAIGNS[key].taskIds);
}

// ---------------------------------------------------------------------------
// Convex queries
// ---------------------------------------------------------------------------

/**
 * Get all seasonal campaigns, optionally filtered to a single month.
 * Each campaign is enriched with full task details from `maintenanceTaskCatalog`.
 */
export const getSeasonalCampaigns = query({
  args: {
    month: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const entries = Object.values(SEASONAL_CAMPAIGNS);
    const campaigns =
      args.month !== undefined
        ? entries.filter((c) => c.months.includes(args.month!))
        : entries;

    const results = await Promise.all(
      campaigns.map(async (campaign) => {
        const tasks = (
          await Promise.all(
            campaign.taskIds.map((taskId) =>
              ctx.db
                .query("maintenanceTaskCatalog")
                .withIndex("by_taskId", (q) => q.eq("taskId", taskId))
                .first(),
            ),
          )
        ).filter((t): t is NonNullable<typeof t> => t != null);

        return {
          ...campaign,
          tasks: tasks.map((t) => ({
            taskId: t.taskId,
            taskName: t.taskName,
            category: t.category,
            difficulty: t.difficulty,
            estimatedTimeMinutes: t.estimatedTimeMinutes,
            diyCost: t.diyCost,
            proCost: t.proCost,
            shortDescription: t.shortDescription,
          })),
        };
      }),
    );

    return results;
  },
});

/**
 * Get a full year of scheduled tasks for a single system type, applying
 * age-based frequency adjustments and campaign context.
 */
export const getUpcomingTasksForSystem = query({
  args: {
    catalogId: v.string(),
    systemAge: v.number(),
    region: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const system = await ctx.db
      .query("systemCatalog")
      .withIndex("by_catalogId", (q) => q.eq("catalogId", args.catalogId))
      .first();

    if (!system) return { months: [], systemName: null };

    const taskIds = system.maintenanceTaskIds ?? [];
    const tasks = (
      await Promise.all(
        taskIds.map((id: string) =>
          ctx.db
            .query("maintenanceTaskCatalog")
            .withIndex("by_taskId", (q) => q.eq("taskId", id))
            .first(),
        ),
      )
    ).filter((t): t is NonNullable<typeof t> => t != null);

    const defaultLifespan = system.expectedLifeYears?.median ?? 20;

    // Build 12-month buckets
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    type MonthBucket = {
      month: number;
      monthName: string;
      season: string;
      campaign: {
        id: string;
        name: string;
        emoji: string;
      } | null;
      tasks: {
        taskId: string;
        taskName: string;
        catalogId: string;
        difficulty: string;
        estimatedTimeMinutes: number;
        diyCost: { low: number; high: number };
        proCost: { low: number; high: number };
        reason: string;
        isAgeTriggered: boolean;
        frequencyDays: number;
        adjustedFrequencyDays: number;
      }[];
    };
    const months: MonthBucket[] = [];

    for (let i = 0; i < 12; i++) {
      const m = ((currentMonth - 1 + i) % 12) + 1;
      const campaignKey = getCampaignForMonth(m);
      const campaignInfo = campaignKey
        ? {
            id: SEASONAL_CAMPAIGNS[campaignKey].id,
            name: SEASONAL_CAMPAIGNS[campaignKey].name,
            emoji: SEASONAL_CAMPAIGNS[campaignKey].emoji,
          }
        : null;

      months.push({
        month: m,
        monthName: MONTH_NAMES[m - 1],
        season: getSeasonForMonth(m),
        campaign: campaignInfo,
        tasks: [],
      });
    }

    for (const task of tasks) {
      const baseDays = task.frequencyValue ?? 365;
      const multiplier = getAgeMultiplier(args.systemAge, defaultLifespan);
      const adjustedDays = Math.max(7, Math.round(baseDays / multiplier));
      const isAgeTriggered = multiplier > 1.0;

      const catalogSeasonal: number[] = task.seasonalMonths ?? [];
      const optimalFb = OPTIMAL_MONTHS_FL_PANHANDLE[task.taskId] ?? [];
      const seasonal = catalogSeasonal.length > 0 ? catalogSeasonal : optimalFb;

      if (seasonal.length > 0) {
        for (const m of seasonal) {
          const bucket = months.find((b) => b.month === m);
          if (bucket) {
            bucket.tasks.push({
              taskId: task.taskId,
              taskName: task.taskName,
              catalogId: args.catalogId,
              difficulty: task.difficulty,
              estimatedTimeMinutes: task.estimatedTimeMinutes,
              diyCost: task.diyCost ?? { low: 0, high: 0 },
              proCost: task.proCost ?? { low: 0, high: 0 },
              reason: `Seasonal — optimal time for ${task.taskName} in NW Florida`,
              isAgeTriggered,
              frequencyDays: baseDays,
              adjustedFrequencyDays: adjustedDays,
            });
          }
        }
      } else {
        // Non-seasonal: distribute evenly across the year
        const occurrencesPerYear = Math.max(1, Math.round(365 / adjustedDays));
        const spacing = Math.round(12 / occurrencesPerYear);
        for (let occ = 0; occ < occurrencesPerYear && occ < 12; occ++) {
          const idx = (occ * spacing) % 12;
          months[idx].tasks.push({
            taskId: task.taskId,
            taskName: task.taskName,
            catalogId: args.catalogId,
            difficulty: task.difficulty,
            estimatedTimeMinutes: task.estimatedTimeMinutes,
            diyCost: task.diyCost ?? { low: 0, high: 0 },
            proCost: task.proCost ?? { low: 0, high: 0 },
            reason:
              occurrencesPerYear > 1
                ? `Every ~${adjustedDays} days (age-adjusted from ${baseDays}d)`
                : `Annual maintenance`,
            isAgeTriggered,
            frequencyDays: baseDays,
            adjustedFrequencyDays: adjustedDays,
          });
        }
      }
    }

    return {
      systemName: system.systemName,
      months: months.filter((m) => m.tasks.length > 0),
    };
  },
});

/**
 * Generate the complete yearly maintenance schedule for an array of systems.
 * This is the primary query the Care tab calls.
 */
export const generateYearlySchedule = query({
  args: {
    systems: v.array(
      v.object({
        catalogId: v.string(),
        installYear: v.number(),
        systemName: v.optional(v.string()),
      }),
    ),
    region: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    type ScheduledTask = {
      taskId: string;
      taskName: string;
      systemName: string;
      catalogId: string;
      difficulty: string;
      estimatedTimeMinutes: number;
      diyCost: { low: number; high: number };
      proCost: { low: number; high: number };
      reason: string;
      isAgeTriggered: boolean;
    };

    type MonthEntry = {
      month: number;
      monthName: string;
      season: string;
      campaign: { id: string; name: string; emoji: string } | null;
      tasks: ScheduledTask[];
    };

    // Pre-build month buckets for a rolling 12-month window
    const monthMap = new Map<number, MonthEntry>();
    for (let i = 0; i < 12; i++) {
      const m = ((currentMonth - 1 + i) % 12) + 1;
      const campaignKey = getCampaignForMonth(m);
      monthMap.set(m, {
        month: m,
        monthName: MONTH_NAMES[m - 1],
        season: getSeasonForMonth(m),
        campaign: campaignKey
          ? {
              id: SEASONAL_CAMPAIGNS[campaignKey].id,
              name: SEASONAL_CAMPAIGNS[campaignKey].name,
              emoji: SEASONAL_CAMPAIGNS[campaignKey].emoji,
            }
          : null,
        tasks: [],
      });
    }

    // Aggregate cost + difficulty tallies
    let totalTasks = 0;
    const costDiy = { low: 0, high: 0 };
    const costPro = { low: 0, high: 0 };
    const byDifficulty: Record<string, number> = {
      easy: 0,
      moderate: 0,
      hard: 0,
      professional: 0,
    };

    for (const sys of args.systems) {
      const catalogEntry = await ctx.db
        .query("systemCatalog")
        .withIndex("by_catalogId", (q) => q.eq("catalogId", sys.catalogId))
        .first();
      if (!catalogEntry) continue;

      const defaultLifespan = catalogEntry.expectedLifeYears?.median ?? 20;
      const systemAge = Math.max(0, currentYear - sys.installYear);
      const displayName =
        sys.systemName ?? catalogEntry.systemName ?? sys.catalogId;

      const taskIds: string[] = catalogEntry.maintenanceTaskIds ?? [];
      const tasks = (
        await Promise.all(
          taskIds.map((id) =>
            ctx.db
              .query("maintenanceTaskCatalog")
              .withIndex("by_taskId", (q) => q.eq("taskId", id))
              .first(),
          ),
        )
      ).filter((t): t is NonNullable<typeof t> => t != null);

      const multiplier = getAgeMultiplier(systemAge, defaultLifespan);
      const isAgeTriggered = multiplier > 1.0;

      for (const task of tasks) {
        const baseDays = task.frequencyValue ?? 365;
        const adjustedDays = Math.max(7, Math.round(baseDays / multiplier));
        const seasonal: number[] = task.seasonalMonths ?? [];
        const diy = task.diyCost ?? { low: 0, high: 0 };
        const pro = task.proCost ?? { low: 0, high: 0 };

        const scheduledTask: ScheduledTask = {
          taskId: task.taskId,
          taskName: task.taskName,
          systemName: displayName,
          catalogId: sys.catalogId,
          difficulty: task.difficulty ?? "moderate",
          estimatedTimeMinutes: task.estimatedTimeMinutes ?? 30,
          diyCost: diy,
          proCost: pro,
          reason: "",
          isAgeTriggered,
        };

        const placeTask = (m: number, reason: string) => {
          const bucket = monthMap.get(m);
          if (!bucket) return;
          bucket.tasks.push({ ...scheduledTask, reason });
          totalTasks++;
          costDiy.low += diy.low;
          costDiy.high += diy.high;
          costPro.low += pro.low;
          costPro.high += pro.high;
          const diff = (task.difficulty ?? "moderate").toLowerCase();
          const key =
            diff === "pro_only"
              ? "professional"
              : diff in byDifficulty
                ? diff
                : "moderate";
          byDifficulty[key] = (byDifficulty[key] ?? 0) + 1;
        };

        if (seasonal.length > 0) {
          // Place at each seasonal month that falls in the 12-month window
          for (const m of seasonal) {
            const campaignTaskIds = getCampaignTaskIds(m);
            const inCampaign = campaignTaskIds.has(task.taskId);
            const reason = inCampaign
              ? `Seasonal campaign — optimal time for ${task.taskName} in NW Florida`
              : `Seasonal — optimal time for ${task.taskName}`;
            placeTask(m, reason);
          }
        } else {
          // Non-seasonal: distribute evenly
          const perYear = Math.max(1, Math.round(365 / adjustedDays));
          const spacing = Math.max(1, Math.round(12 / perYear));
          for (let occ = 0; occ < perYear && occ < 12; occ++) {
            const m = ((currentMonth - 1 + occ * spacing) % 12) + 1;
            const reason =
              perYear > 1
                ? `Every ~${adjustedDays} days${isAgeTriggered ? " (age-adjusted)" : ""}`
                : "Annual maintenance";
            placeTask(m, reason);
          }
        }
      }
    }

    // Assemble ordered months (rolling from current month)
    const orderedMonths: MonthEntry[] = [];
    for (let i = 0; i < 12; i++) {
      const m = ((currentMonth - 1 + i) % 12) + 1;
      const entry = monthMap.get(m)!;
      orderedMonths.push(entry);
    }

    return {
      months: orderedMonths,
      summary: {
        totalTasks,
        estimatedDiyCostTotal: costDiy,
        estimatedProCostTotal: costPro,
        tasksByDifficulty: byDifficulty,
      },
    };
  },
});

/**
 * Get the schedule for a specific home by resolving its systems from the DB,
 * then delegating to the same logic as `generateYearlySchedule`.
 */
export const getScheduleForHome = query({
  args: {
    homeId: v.id("homes"),
  },
  handler: async (ctx, args) => {
    const home = await ctx.db.get(args.homeId);
    if (!home) return null;

    const systems = await ctx.db
      .query("systems")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .collect();

    const activeSystems = systems.filter((s) => !s.isArchived);
    if (activeSystems.length === 0) {
      return { months: [], summary: null, systemCount: 0 };
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    type ScheduledTask = {
      taskId: string;
      taskName: string;
      systemName: string;
      catalogId: string;
      difficulty: string;
      estimatedTimeMinutes: number;
      diyCost: { low: number; high: number };
      proCost: { low: number; high: number };
      reason: string;
      isAgeTriggered: boolean;
    };

    type MonthEntry = {
      month: number;
      monthName: string;
      season: string;
      campaign: { id: string; name: string; emoji: string } | null;
      tasks: ScheduledTask[];
    };

    const monthMap = new Map<number, MonthEntry>();
    for (let i = 0; i < 12; i++) {
      const m = ((currentMonth - 1 + i) % 12) + 1;
      const campaignKey = getCampaignForMonth(m);
      monthMap.set(m, {
        month: m,
        monthName: MONTH_NAMES[m - 1],
        season: getSeasonForMonth(m),
        campaign: campaignKey
          ? {
              id: SEASONAL_CAMPAIGNS[campaignKey].id,
              name: SEASONAL_CAMPAIGNS[campaignKey].name,
              emoji: SEASONAL_CAMPAIGNS[campaignKey].emoji,
            }
          : null,
        tasks: [],
      });
    }

    let totalTasks = 0;
    const costDiy = { low: 0, high: 0 };
    const costPro = { low: 0, high: 0 };
    const byDifficulty: Record<string, number> = {
      easy: 0,
      moderate: 0,
      hard: 0,
      professional: 0,
    };

    // Pre-fetch all system types in parallel to avoid N+1
    const systemTypes = await Promise.all(
      activeSystems.map((sys) =>
        sys.systemTypeId ? ctx.db.get(sys.systemTypeId) : null,
      ),
    );

    // Pre-fetch all catalog entries in parallel
    const catalogEntries = await Promise.all(
      systemTypes.map((st) =>
        st?.key
          ? ctx.db
              .query("systemCatalog")
              .withIndex("by_catalogId", (q) =>
                q.eq("catalogId", st.key ?? ""),
              )
              .first()
          : null,
      ),
    );

    for (let sIdx = 0; sIdx < activeSystems.length; sIdx++) {
      const sys = activeSystems[sIdx];
      const systemType = systemTypes[sIdx];
      const catalogEntry = catalogEntries[sIdx];

      const defaultLifespan =
        catalogEntry?.expectedLifeYears?.median ??
        systemType?.defaultLifespanYears ??
        20;
      const installYear = sys.installDate
        ? new Date(sys.installDate).getFullYear()
        : home.yearBuilt ?? currentYear;
      const systemAge = Math.max(0, currentYear - installYear);
      const displayName = sys.name ?? systemType?.name ?? "System";

      // Get tasks either from catalog linkage or system type templates
      const taskIds: string[] = catalogEntry?.maintenanceTaskIds ?? [];
      const tasks =
        taskIds.length > 0
          ? (
              await Promise.all(
                taskIds.map((id) =>
                  ctx.db
                    .query("maintenanceTaskCatalog")
                    .withIndex("by_taskId", (q) => q.eq("taskId", id))
                    .first(),
                ),
              )
            ).filter((t): t is NonNullable<typeof t> => t != null)
          : [];

      const multiplier = getAgeMultiplier(systemAge, defaultLifespan);
      const isAgeTriggered = multiplier > 1.0;

      for (const task of tasks) {
        const baseDays = task.frequencyValue ?? 365;
        const adjustedDays = Math.max(7, Math.round(baseDays / multiplier));
        const seasonal: number[] = task.seasonalMonths ?? [];
        const diy = task.diyCost ?? { low: 0, high: 0 };
        const pro = task.proCost ?? { low: 0, high: 0 };

        const base = {
          taskId: task.taskId,
          taskName: task.taskName,
          systemName: displayName,
          catalogId: catalogEntry?.catalogId ?? "",
          difficulty: task.difficulty ?? "moderate",
          estimatedTimeMinutes: task.estimatedTimeMinutes ?? 30,
          diyCost: diy,
          proCost: pro,
          isAgeTriggered,
        };

        const placeTask = (m: number, reason: string) => {
          const bucket = monthMap.get(m);
          if (!bucket) return;
          bucket.tasks.push({ ...base, reason });
          totalTasks++;
          costDiy.low += diy.low;
          costDiy.high += diy.high;
          costPro.low += pro.low;
          costPro.high += pro.high;
          const diff = (task.difficulty ?? "moderate").toLowerCase();
          const key =
            diff === "pro_only"
              ? "professional"
              : diff in byDifficulty
                ? diff
                : "moderate";
          byDifficulty[key] = (byDifficulty[key] ?? 0) + 1;
        };

        const optimalFb = OPTIMAL_MONTHS_FL_PANHANDLE[task.taskId] ?? [];
        const effectiveSeasonal = seasonal.length > 0 ? seasonal : optimalFb;

        if (effectiveSeasonal.length > 0) {
          for (const m of effectiveSeasonal) {
            const campaignIds = getCampaignTaskIds(m);
            const reason = campaignIds.has(task.taskId)
              ? `Seasonal campaign — optimal for ${task.taskName}`
              : `Seasonal — optimal for ${task.taskName}`;
            placeTask(m, reason);
          }
        } else {
          const perYear = Math.max(1, Math.round(365 / adjustedDays));
          const spacing = Math.max(1, Math.round(12 / perYear));
          for (let occ = 0; occ < perYear && occ < 12; occ++) {
            const m = ((currentMonth - 1 + occ * spacing) % 12) + 1;
            const reason =
              perYear > 1
                ? `Every ~${adjustedDays} days${isAgeTriggered ? " (age-adjusted)" : ""}`
                : "Annual maintenance";
            placeTask(m, reason);
          }
        }
      }
    }

    const orderedMonths: MonthEntry[] = [];
    for (let i = 0; i < 12; i++) {
      const m = ((currentMonth - 1 + i) % 12) + 1;
      orderedMonths.push(monthMap.get(m)!);
    }

    return {
      months: orderedMonths,
      summary: {
        totalTasks,
        estimatedDiyCostTotal: costDiy,
        estimatedProCostTotal: costPro,
        tasksByDifficulty: byDifficulty,
      },
      systemCount: activeSystems.length,
    };
  },
});

/**
 * Return the age-adjusted frequency for a system type and its base frequency.
 * Also flags whether the system's age triggers additional inspection tasks.
 */
export const getAgeAdjustedFrequency = query({
  args: {
    systemType: v.string(),
    systemAge: v.number(),
    baseFrequencyDays: v.number(),
  },
  handler: async (_ctx, args) => {
    // Use detailed per-system-type multiplier when available
    const detailed = getDetailedAgeMultiplier(args.systemType, args.systemAge);
    const hasDetailedData = AGE_MULTIPLIERS.some(
      (m) => m.systemType === args.systemType,
    );

    let multiplier: number;
    let additionalTasks: string[];
    let note: string;

    if (hasDetailedData) {
      // 1/multiplier because detailed data uses <1 = more frequent
      multiplier = 1 / detailed.multiplier;
      additionalTasks = detailed.additionalTasks;
      note = detailed.note;
    } else {
      // Fallback to ratio-based curve
      const lifespan = 20;
      multiplier = getAgeMultiplier(args.systemAge, lifespan);
      additionalTasks = [];
      note = "Using default age curve (no system-specific data)";
      const ageRatio = args.systemAge / lifespan;
      if (ageRatio >= 0.7) {
        additionalTasks.push("Professional condition assessment recommended");
      }
      if (ageRatio >= 0.85) {
        additionalTasks.push(
          "Replacement planning — get quotes before emergency",
        );
      }
    }

    const adjustedDays = Math.max(
      7,
      Math.round(args.baseFrequencyDays / multiplier),
    );

    return {
      originalFrequencyDays: args.baseFrequencyDays,
      adjustedFrequencyDays: adjustedDays,
      ageMultiplier: Math.round(multiplier * 100) / 100,
      additionalAgeTasks: additionalTasks,
      note,
    };
  },
});
