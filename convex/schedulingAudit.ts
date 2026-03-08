import { query } from "./_generated/server";
import { OPTIMAL_MONTHS_FL_PANHANDLE } from "./data/optimalMonths";
import { AGE_MULTIPLIERS } from "./data/ageMultipliers";
import { SEASONAL_CAMPAIGNS } from "./data/seasonalCampaigns";

/**
 * Audit the entire task catalog, optimal months mapping, age multipliers,
 * and seasonal campaigns for completeness and consistency.
 */
export const auditTaskScheduling = query({
  args: {},
  handler: async (ctx) => {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Load all tasks from the catalog
    const allTasks = await ctx.db.query("maintenanceTaskCatalog").collect();
    const allSystems = await ctx.db.query("systemCatalog").collect();

    // ═══ CHECK 1: Every task must have optimal months defined ═══
    for (const task of allTasks) {
      const months = OPTIMAL_MONTHS_FL_PANHANDLE[task.taskId];
      if (!months || months.length === 0) {
        const hasCatalogSeasonal =
          task.seasonalMonths && task.seasonalMonths.length > 0;
        if (!hasCatalogSeasonal) {
          issues.push(
            `MISSING_SCHEDULE: ${task.taskId} — no optimal months and no seasonalMonths in catalog`,
          );
        } else {
          warnings.push(
            `NO_OPTIMAL_MAP: ${task.taskId} — using catalog seasonalMonths as fallback`,
          );
        }
      }
    }

    // ═══ CHECK 2: Frequency vs optimal month count consistency ═══
    for (const task of allTasks) {
      if (task.frequencyType === "interval" && task.frequencyValue) {
        const optMonths = OPTIMAL_MONTHS_FL_PANHANDLE[task.taskId];
        if (optMonths && optMonths.length > 0 && optMonths.length < 12) {
          const expectedOccurrences = Math.round(365 / task.frequencyValue);
          if (Math.abs(optMonths.length - expectedOccurrences) > 2) {
            warnings.push(
              `FREQUENCY_MISMATCH: ${task.taskId} — frequency suggests ${expectedOccurrences}x/year but has ${optMonths.length} optimal months`,
            );
          }
        }
      }
    }

    // ═══ CHECK 3: Seasonal tasks must have seasonal months ═══
    for (const task of allTasks) {
      if (task.frequencyType === "seasonal") {
        const hasCatalog =
          task.seasonalMonths && task.seasonalMonths.length > 0;
        const hasOptimal =
          OPTIMAL_MONTHS_FL_PANHANDLE[task.taskId] &&
          OPTIMAL_MONTHS_FL_PANHANDLE[task.taskId].length > 0;
        if (!hasCatalog && !hasOptimal) {
          issues.push(
            `SEASONAL_NO_MONTHS: ${task.taskId} — marked as seasonal but no months defined anywhere`,
          );
        }
      }
    }

    // ═══ CHECK 4: Every task must have a difficulty ═══
    for (const task of allTasks) {
      if (!task.difficulty) {
        issues.push(`MISSING_DIFFICULTY: ${task.taskId}`);
      }
    }

    // ═══ CHECK 5: Every task must have cost estimates ═══
    for (const task of allTasks) {
      if (!task.diyCost) {
        issues.push(`MISSING_DIY_COST: ${task.taskId}`);
      }
      if (!task.proCost) {
        issues.push(`MISSING_PRO_COST: ${task.taskId}`);
      }
    }

    // ═══ CHECK 6: Professional tasks should not have DIY instructions ═══
    for (const task of allTasks) {
      if (task.difficulty === "professional" && task.detailedInstructions) {
        warnings.push(
          `PRO_WITH_DIY: ${task.taskId} — marked professional but has DIY instructions`,
        );
      }
    }

    // ═══ CHECK 7: DIY tasks should have instructions ═══
    for (const task of allTasks) {
      if (task.difficulty !== "professional" && !task.detailedInstructions) {
        issues.push(
          `DIY_NO_INSTRUCTIONS: ${task.taskId} — difficulty is ${task.difficulty} but missing instructions`,
        );
      }
    }

    // ═══ CHECK 8: whyItMatters and whatHappensIfSkipped ═══
    for (const task of allTasks) {
      if (!task.whyItMatters) {
        issues.push(`MISSING_WHY: ${task.taskId}`);
      }
      if (!task.whatHappensIfSkipped) {
        issues.push(`MISSING_CONSEQUENCES: ${task.taskId}`);
      }
    }

    // ═══ CHECK 9: Climate adjustments for hot_humid ═══
    for (const task of allTasks) {
      const hasHotHumid = task.climateAdjustments?.some(
        (c: { climateZone: string }) =>
          c.climateZone === "hot_humid" || c.climateZone === "2A",
      );
      if (!hasHotHumid) {
        warnings.push(
          `NO_FL_CLIMATE: ${task.taskId} — no hot-humid climate adjustment`,
        );
      }
    }

    // ═══ CHECK 10: Care Kit links for supply tasks ═══
    const supplyKeywords = [
      "filter",
      "enzyme",
      "condensate",
      "clean",
      "salt",
      "seal",
      "battery",
      "oil",
    ];
    for (const task of allTasks) {
      const isSupplyTask = supplyKeywords.some((kw) =>
        task.taskId.toLowerCase().includes(kw),
      );
      if (
        isSupplyTask &&
        (!task.careKitProductIds || task.careKitProductIds.length === 0)
      ) {
        warnings.push(
          `NO_CARE_KIT: ${task.taskId} — supply-dependent task without Care Kit link`,
        );
      }
    }

    // ═══ CHECK 11: Age multipliers cover major system types ═══
    const majorSystems = [
      "central_ac",
      "heat_pump",
      "furnace_gas",
      "water_heater_tank_gas",
      "water_heater_tank_electric",
      "roof_asphalt_shingle",
      "electrical_panel",
      "dishwasher",
      "washing_machine",
      "refrigerator",
      "dryer",
      "garage_door",
    ];
    for (const sys of majorSystems) {
      if (!AGE_MULTIPLIERS.some((m) => m.systemType === sys)) {
        issues.push(
          `MISSING_AGE_MULTIPLIER: ${sys} — no age-based frequency adjustments`,
        );
      }
    }

    // ═══ CHECK 12: All campaign task IDs exist in catalog ═══
    for (const [key, campaign] of Object.entries(SEASONAL_CAMPAIGNS)) {
      for (const taskId of campaign.taskIds) {
        const exists = allTasks.some((t) => t.taskId === taskId);
        if (!exists) {
          warnings.push(
            `CAMPAIGN_ORPHAN: ${key} references ${taskId} which is not in the task catalog`,
          );
        }
      }
    }

    // ═══ CHECK 13: Optimal months map has entries not in catalog ═══
    const catalogTaskIds = new Set(allTasks.map((t) => t.taskId));
    for (const taskId of Object.keys(OPTIMAL_MONTHS_FL_PANHANDLE)) {
      if (!catalogTaskIds.has(taskId)) {
        warnings.push(
          `ORPHAN_OPTIMAL_MAP: ${taskId} — in optimal months mapping but not in task catalog`,
        );
      }
    }

    // ═══ CHECK 14: System catalog tasks reference existing task IDs ═══
    for (const sys of allSystems) {
      for (const taskId of sys.maintenanceTaskIds ?? []) {
        if (!catalogTaskIds.has(taskId)) {
          issues.push(
            `BROKEN_LINK: System ${sys.catalogId} references task ${taskId} which doesn't exist`,
          );
        }
      }
    }

    // ═══ CHECK 15: Validate optimal months are 1-12 ═══
    for (const [taskId, months] of Object.entries(
      OPTIMAL_MONTHS_FL_PANHANDLE,
    )) {
      for (const m of months) {
        if (m < 1 || m > 12 || !Number.isInteger(m)) {
          issues.push(
            `INVALID_MONTH: ${taskId} has invalid month value ${m}`,
          );
        }
      }
    }

    // ═══ SUMMARY ═══
    const taskCoverage = {
      totalTasksInCatalog: allTasks.length,
      tasksWithOptimalMonths: allTasks.filter(
        (t) => OPTIMAL_MONTHS_FL_PANHANDLE[t.taskId]?.length > 0,
      ).length,
      tasksWithCatalogSeasonal: allTasks.filter(
        (t) => t.seasonalMonths && t.seasonalMonths.length > 0,
      ).length,
      tasksWithEitherSchedule: allTasks.filter(
        (t) =>
          (OPTIMAL_MONTHS_FL_PANHANDLE[t.taskId]?.length > 0) ||
          (t.seasonalMonths && t.seasonalMonths.length > 0),
      ).length,
      totalOptimalMonthEntries: Object.keys(OPTIMAL_MONTHS_FL_PANHANDLE).length,
      totalSystemsInCatalog: allSystems.length,
      systemTypesWithAgeMultipliers: AGE_MULTIPLIERS.length,
      seasonalCampaigns: Object.keys(SEASONAL_CAMPAIGNS).length,
    };

    const categoryBreakdown: Record<string, number> = {};
    for (const task of allTasks) {
      const cat = task.category || "uncategorized";
      categoryBreakdown[cat] = (categoryBreakdown[cat] ?? 0) + 1;
    }

    const difficultyBreakdown: Record<string, number> = {};
    for (const task of allTasks) {
      const diff = task.difficulty || "unset";
      difficultyBreakdown[diff] = (difficultyBreakdown[diff] ?? 0) + 1;
    }

    return {
      passed: issues.length === 0,
      issues,
      warnings,
      coverage: taskCoverage,
      categoryBreakdown,
      difficultyBreakdown,
      issueCount: issues.length,
      warningCount: warnings.length,
    };
  },
});

/**
 * Quick summary of scheduling readiness for a sample home.
 * Pass a set of common systems and see what the year looks like.
 */
export const auditSampleSchedule = query({
  args: {},
  handler: async (ctx) => {
    const sampleSystems = [
      "hvac.central_ac",
      "plumbing.water_heater.tank_gas",
      "electrical.main_panel",
      "roof.asphalt_shingle",
      "appliance.refrigerator",
      "appliance.dishwasher",
      "appliance.washing_machine",
      "appliance.dryer",
    ];

    const results: Array<{
      catalogId: string;
      systemName: string | null;
      taskCount: number;
      monthsWithTasks: number;
    }> = [];

    for (const catId of sampleSystems) {
      const sys = await ctx.db
        .query("systemCatalog")
        .withIndex("by_catalogId", (q) => q.eq("catalogId", catId))
        .first();

      if (!sys) {
        results.push({
          catalogId: catId,
          systemName: null,
          taskCount: 0,
          monthsWithTasks: 0,
        });
        continue;
      }

      const taskIds: string[] = sys.maintenanceTaskIds ?? [];
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

      const monthsUsed = new Set<number>();
      for (const task of tasks) {
        const seasonal = task.seasonalMonths ?? [];
        const optimal = OPTIMAL_MONTHS_FL_PANHANDLE[task.taskId] ?? [];
        const months = seasonal.length > 0 ? seasonal : optimal;
        months.forEach((m: number) => monthsUsed.add(m));
      }

      results.push({
        catalogId: catId,
        systemName: sys.systemName,
        taskCount: tasks.length,
        monthsWithTasks: monthsUsed.size,
      });
    }

    return {
      sampleSystems: results,
      totalTasksAcrossSystems: results.reduce((s, r) => s + r.taskCount, 0),
    };
  },
});
