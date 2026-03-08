import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByHome = query({
  args: { homeId: v.id("homes") },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("maintenanceTasks")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .collect();

    // Enrich with system data
    const enriched = await Promise.all(
      tasks.map(async (task) => {
        let system = null;
        if (task.systemId) {
          system = await ctx.db.get(task.systemId);
        }
        return { ...task, system };
      })
    );

    return enriched;
  },
});

export const listUpcoming = query({
  args: { homeId: v.id("homes") },
  handler: async (ctx, args) => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const nowStr = now.toISOString().split("T")[0];
    const futureStr = thirtyDaysFromNow.toISOString().split("T")[0];

    const tasks = await ctx.db
      .query("maintenanceTasks")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .collect();

    const upcoming = tasks.filter(
      (t) =>
        (t.status === "upcoming" || t.status === "due" || t.status === "overdue") &&
        t.dueDate &&
        t.dueDate <= futureStr
    );

    // Enrich with system data
    const enriched = await Promise.all(
      upcoming.map(async (task) => {
        let system = null;
        if (task.systemId) {
          system = await ctx.db.get(task.systemId);
        }
        return { ...task, system };
      })
    );

    return enriched.sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""));
  },
});

export const getById = query({
  args: { taskId: v.id("maintenanceTasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) return null;

    let system = null;
    if (task.systemId) {
      system = await ctx.db.get(task.systemId);
    }

    let template = null;
    if (task.templateId) {
      template = await ctx.db.get(task.templateId);
    }

    return { ...task, system, template };
  },
});

export const create = mutation({
  args: {
    homeId: v.id("homes"),
    systemId: v.optional(v.id("systems")),
    templateId: v.optional(v.id("maintenanceTemplates")),
    name: v.string(),
    description: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    priority: v.union(
      v.literal("critical"),
      v.literal("high"),
      v.literal("medium"),
      v.literal("low"),
      v.literal("routine")
    ),
    category: v.optional(
      v.union(
        v.literal("hvac"),
        v.literal("plumbing"),
        v.literal("electrical"),
        v.literal("appliances"),
        v.literal("structural"),
        v.literal("exterior")
      )
    ),
    isRecurring: v.optional(v.boolean()),
    recurrenceMonths: v.optional(v.number()),
    diyCostLow: v.optional(v.number()),
    diyCostHigh: v.optional(v.number()),
    proCostLow: v.optional(v.number()),
    proCostHigh: v.optional(v.number()),
    difficulty: v.optional(
      v.union(
        v.literal("easy"),
        v.literal("moderate"),
        v.literal("hard"),
        v.literal("pro_only")
      )
    ),
    estimatedTimeMinutes: v.optional(v.number()),
    diySteps: v.optional(v.array(v.string())),
    commonMistakes: v.optional(v.array(v.string())),
    whenToCallPro: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const taskId = await ctx.db.insert("maintenanceTasks", {
      ...args,
      status: "upcoming",
      snoozeCount: 0,
    });
    return taskId;
  },
});

export const complete = mutation({
  args: {
    taskId: v.id("maintenanceTasks"),
    wasDiy: v.optional(v.boolean()),
    costActual: v.optional(v.number()),
    completionPhotoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    const now = new Date().toISOString().split("T")[0];

    await ctx.db.patch(args.taskId, {
      status: "completed",
      completedDate: now,
      wasDiy: args.wasDiy,
      costActual: args.costActual,
      completionPhotoUrl: args.completionPhotoUrl,
    });

    // If recurring, create next occurrence
    if (task.isRecurring && task.recurrenceMonths && task.dueDate) {
      const dueDate = new Date(task.dueDate);
      dueDate.setMonth(dueDate.getMonth() + task.recurrenceMonths);
      const nextDueDate = dueDate.toISOString().split("T")[0];

      await ctx.db.insert("maintenanceTasks", {
        homeId: task.homeId,
        systemId: task.systemId,
        templateId: task.templateId,
        name: task.name,
        description: task.description,
        dueDate: nextDueDate,
        status: "upcoming",
        priority: task.priority,
        category: task.category,
        isRecurring: true,
        recurrenceMonths: task.recurrenceMonths,
        diyCostLow: task.diyCostLow,
        diyCostHigh: task.diyCostHigh,
        proCostLow: task.proCostLow,
        proCostHigh: task.proCostHigh,
        difficulty: task.difficulty,
        estimatedTimeMinutes: task.estimatedTimeMinutes,
        diySteps: task.diySteps,
        commonMistakes: task.commonMistakes,
        whenToCallPro: task.whenToCallPro,
        snoozeCount: 0,
      });
    }

    return args.taskId;
  },
});

export const dismiss = mutation({
  args: { taskId: v.id("maintenanceTasks") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, { status: "skipped" });
  },
});

export const snooze = mutation({
  args: {
    taskId: v.id("maintenanceTasks"),
    snoozeDays: v.number(),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    const snoozeUntil = new Date();
    snoozeUntil.setDate(snoozeUntil.getDate() + args.snoozeDays);

    await ctx.db.patch(args.taskId, {
      status: "snoozed",
      snoozedUntil: snoozeUntil.toISOString().split("T")[0],
      snoozeCount: (task.snoozeCount ?? 0) + 1,
    });
  },
});

export const generateSchedule = mutation({
  args: { homeId: v.id("homes"), systemId: v.id("systems") },
  handler: async (ctx, args) => {
    const system = await ctx.db.get(args.systemId);
    if (!system) throw new Error("System not found");

    const systemType = await ctx.db.get(system.systemTypeId);
    if (!systemType) throw new Error("System type not found");

    // Get maintenance templates for this system type
    const templates = await ctx.db
      .query("maintenanceTemplates")
      .withIndex("by_system_type", (q) => q.eq("systemTypeId", system.systemTypeId))
      .collect();

    const now = new Date();
    let tasksCreated = 0;

    for (const template of templates) {
      const dueDate = new Date(now);
      dueDate.setMonth(dueDate.getMonth() + template.frequencyMonths);

      await ctx.db.insert("maintenanceTasks", {
        homeId: args.homeId,
        systemId: args.systemId,
        templateId: template._id,
        name: template.name,
        description: template.description,
        dueDate: dueDate.toISOString().split("T")[0],
        status: "upcoming",
        priority: template.priority,
        category: systemType.category,
        isRecurring: true,
        recurrenceMonths: template.frequencyMonths,
        diyCostLow: template.diyCostLow,
        diyCostHigh: template.diyCostHigh,
        proCostLow: template.proCostLow,
        proCostHigh: template.proCostHigh,
        difficulty: template.difficulty,
        estimatedTimeMinutes: template.estimatedTimeMinutes,
        diySteps: template.diySteps,
        commonMistakes: template.commonMistakes,
        whenToCallPro: template.whenToCallPro,
        snoozeCount: 0,
      });

      tasksCreated++;
    }

    return tasksCreated;
  },
});
