import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

// ════════════════════════════════════════════════════════════════════════
// WORKFLOW LIFECYCLE
// ════════════════════════════════════════════════════════════════════════

export const completeWorkflow = internalMutation({
  args: {
    workflowId: v.id("agentWorkflows"),
    status: v.string(),
    inputTokens: v.number(),
    outputTokens: v.number(),
    toolCallCount: v.number(),
    iterations: v.number(),
    durationMs: v.number(),
    resultSummary: v.optional(v.string()),
    estimatedCostUsd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { workflowId, ...fields } = args;
    await ctx.db.patch(workflowId, { ...fields, completedAt: Date.now() });
  },
});

export const failWorkflow = internalMutation({
  args: {
    workflowId: v.id("agentWorkflows"),
    error: v.string(),
    durationMs: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.workflowId, {
      status: "failed",
      error: args.error,
      durationMs: args.durationMs,
      completedAt: Date.now(),
    });
  },
});

export const markWorkflowRunning = internalMutation({
  args: {
    workflowId: v.id("agentWorkflows"),
    model: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.workflowId, {
      status: "running",
      model: args.model,
      startedAt: Date.now(),
    });
  },
});

// ════════════════════════════════════════════════════════════════════════
// AGENT ACTION LOG
// Records every tool call the agent makes for auditing and context.
// ════════════════════════════════════════════════════════════════════════

export const logAgentAction = internalMutation({
  args: {
    userId: v.id("users"),
    workflowId: v.id("agentWorkflows"),
    toolName: v.string(),
    toolInput: v.any(),
    result: v.any(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("agentActions", {
      userId: args.userId,
      workflowId: args.workflowId,
      toolName: args.toolName,
      toolInput: args.toolInput,
      result: args.result,
      status: args.status,
      executedAt: Date.now(),
    });
  },
});

// ════════════════════════════════════════════════════════════════════════
// TOOL MUTATIONS
// Each tool the agent can invoke maps to one of these mutations.
// Access checks go through homeId (systems belong to homes, not users).
// ════════════════════════════════════════════════════════════════════════

export const upsertForecast = internalMutation({
  args: {
    userId: v.id("users"),
    homeId: v.id("homes"),
    systemId: v.string(),
    forecastId: v.optional(v.string()),
    type: v.string(),
    title: v.string(),
    description: v.string(),
    urgency: v.string(),
    estimatedDate: v.optional(v.string()),
    costRangeLow: v.optional(v.number()),
    costRangeHigh: v.optional(v.number()),
    reasoning: v.string(),
  },
  handler: async (ctx, args) => {
    const sysId = args.systemId as Id<"systems">;

    // Verify system exists and belongs to the user's home
    const system = await ctx.db.get(sysId);
    if (!system || system.homeId !== args.homeId) {
      return { success: false, error: "System not found or access denied" };
    }

    const forecastData = {
      systemId: sysId,
      userId: args.userId,
      homeId: args.homeId,
      type: args.type,
      title: args.title,
      description: args.description,
      urgency: args.urgency,
      estimatedDate: args.estimatedDate,
      costRangeLow: args.costRangeLow,
      costRangeHigh: args.costRangeHigh,
      reasoning: args.reasoning,
      status: "active",
      createdBy: "agent",
      updatedAt: Date.now(),
    };

    if (args.forecastId) {
      const fId = args.forecastId as Id<"agentForecasts">;
      const existing = await ctx.db.get(fId);
      if (existing && existing.userId === args.userId) {
        await ctx.db.patch(fId, forecastData);
        return { success: true, action: "updated", forecastId: fId };
      }
    }

    const id = await ctx.db.insert("agentForecasts", {
      ...forecastData,
      createdAt: Date.now(),
    });
    return { success: true, action: "created", forecastId: id };
  },
});

export const createActionItem = internalMutation({
  args: {
    userId: v.id("users"),
    homeId: v.id("homes"),
    systemId: v.optional(v.string()),
    title: v.string(),
    description: v.string(),
    urgency: v.string(),
    category: v.string(),
    estimatedCostLow: v.optional(v.number()),
    estimatedCostHigh: v.optional(v.number()),
    dueDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("actionItems", {
      userId: args.userId,
      homeId: args.homeId,
      systemId: args.systemId
        ? (args.systemId as Id<"systems">)
        : undefined,
      title: args.title,
      description: args.description,
      urgency: args.urgency,
      category: args.category,
      estimatedCostLow: args.estimatedCostLow,
      estimatedCostHigh: args.estimatedCostHigh,
      dueDate: args.dueDate,
      status: "open",
      createdAt: Date.now(),
    });
    return { success: true, actionItemId: id };
  },
});

export const updateSystem = internalMutation({
  args: {
    userId: v.id("users"),
    homeId: v.id("homes"),
    systemId: v.string(),
    condition: v.optional(v.string()),
    age: v.optional(v.number()),
    lastServiceDate: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const sysId = args.systemId as Id<"systems">;
    const system = await ctx.db.get(sysId);
    if (!system || system.homeId !== args.homeId) {
      return { success: false, error: "System not found or access denied" };
    }

    const updates: Record<string, unknown> = {};
    if (args.condition !== undefined) updates.condition = args.condition;
    if (args.lastServiceDate !== undefined)
      updates.lastServiceDate = args.lastServiceDate;
    if (args.notes !== undefined) {
      // Append to existing notes
      updates.conditionNotes = system.conditionNotes
        ? `${system.conditionNotes}\n---\n${args.notes}`
        : args.notes;
    }

    await ctx.db.patch(sysId, updates);
    return { success: true, updatedFields: Object.keys(updates) };
  },
});

export const sendNotification = internalMutation({
  args: {
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    body: v.string(),
    priority: v.string(),
    relatedSystemId: v.optional(v.string()),
    relatedActionId: v.optional(v.id("pendingActions")),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      title: args.title,
      body: args.body,
      priority: args.priority,
      read: false,
      relatedSystemId: args.relatedSystemId
        ? (args.relatedSystemId as Id<"systems">)
        : undefined,
      relatedActionId: args.relatedActionId,
      createdAt: Date.now(),
    });
    return { success: true, notificationId: id };
  },
});

export const escalateSafety = internalMutation({
  args: {
    userId: v.id("users"),
    homeId: v.id("homes"),
    systemId: v.optional(v.string()),
    severity: v.string(),
    concern: v.string(),
    immediateAction: v.string(),
    professionalNeeded: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Create critical action item
    const actionId = await ctx.db.insert("actionItems", {
      userId: args.userId,
      homeId: args.homeId,
      systemId: args.systemId
        ? (args.systemId as Id<"systems">)
        : undefined,
      title: `SAFETY: ${args.concern}`,
      description: `Immediate action required: ${args.immediateAction}`,
      urgency: "critical",
      category: "safety",
      status: "open",
      createdAt: Date.now(),
    });

    // Always send critical notification
    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "safety",
      title: `Safety Alert: ${args.concern}`,
      body: args.immediateAction,
      priority: "critical",
      read: false,
      relatedSystemId: args.systemId
        ? (args.systemId as Id<"systems">)
        : undefined,
      createdAt: Date.now(),
    });

    return { success: true, actionItemId: actionId, severity: args.severity };
  },
});

export const requestInformation = internalMutation({
  args: {
    userId: v.id("users"),
    question: v.string(),
    context: v.string(),
    relatedSystemId: v.optional(v.string()),
    suggestedOptions: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("informationRequests", {
      userId: args.userId,
      question: args.question,
      context: args.context,
      relatedSystemId: args.relatedSystemId
        ? (args.relatedSystemId as Id<"systems">)
        : undefined,
      suggestedOptions: args.suggestedOptions,
      status: "pending",
      createdAt: Date.now(),
    });

    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "action_required",
      title: "Quick question about your home",
      body: args.question,
      priority: "medium",
      read: false,
      createdAt: Date.now(),
    });

    return { success: true, requestId: id };
  },
});

export const logMaintenanceRecord = internalMutation({
  args: {
    userId: v.id("users"),
    homeId: v.id("homes"),
    systemId: v.string(),
    date: v.string(),
    description: v.string(),
    type: v.string(),
    cost: v.optional(v.number()),
    provider: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const sysId = args.systemId as Id<"systems">;
    const system = await ctx.db.get(sysId);
    if (!system || system.homeId !== args.homeId) {
      return { success: false, error: "System not found or access denied" };
    }

    const id = await ctx.db.insert("maintenanceHistory", {
      systemId: sysId,
      userId: args.userId,
      homeId: args.homeId,
      date: args.date,
      description: args.description,
      type: args.type,
      cost: args.cost,
      provider: args.provider,
      notes: args.notes,
      createdAt: Date.now(),
    });

    // Update the system's lastServiceDate
    await ctx.db.patch(sysId, { lastServiceDate: args.date });

    return { success: true, recordId: id };
  },
});

export const scheduleFutureCheck = internalMutation({
  args: {
    userId: v.id("users"),
    systemId: v.optional(v.string()),
    checkDate: v.string(),
    reason: v.string(),
    priority: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("scheduledChecks", {
      userId: args.userId,
      systemId: args.systemId
        ? (args.systemId as Id<"systems">)
        : undefined,
      checkDate: args.checkDate,
      reason: args.reason,
      priority: args.priority ?? "medium",
      status: "scheduled",
      createdAt: Date.now(),
    });
    return { success: true, scheduledCheckId: id };
  },
});

export const createPendingAction = internalMutation({
  args: {
    userId: v.id("users"),
    workflowId: v.id("agentWorkflows"),
    toolName: v.string(),
    toolInput: v.any(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("pendingActions", {
      userId: args.userId,
      workflowId: args.workflowId,
      toolName: args.toolName,
      toolInput: args.toolInput,
      reason: args.reason,
      status: "pending",
      createdAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7-day default expiry
    });
  },
});

// ════════════════════════════════════════════════════════════════════════
// WORKFLOW DECISION TREE MUTATIONS
// ════════════════════════════════════════════════════════════════════════

export const manageSavingsPlan = internalMutation({
  args: {
    userId: v.id("users"),
    homeId: v.id("homes"),
    systemId: v.string(),
    action: v.string(),
    targetAmount: v.optional(v.number()),
    monthlyAmount: v.optional(v.number()),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const sysId = args.systemId as Id<"systems">;
    const system = await ctx.db.get(sysId);
    if (!system || system.homeId !== args.homeId) {
      return { success: false, error: "System not found or access denied" };
    }

    const existing = await ctx.db
      .query("savingsPlans")
      .withIndex("by_systemId", (q) => q.eq("systemId", sysId))
      .first();

    const now = Date.now();

    switch (args.action) {
      case "create": {
        if (existing && existing.status === "active") {
          return { success: false, error: "Active savings plan already exists. Use 'adjust' instead." };
        }
        const id = await ctx.db.insert("savingsPlans", {
          userId: args.userId,
          homeId: args.homeId,
          systemId: sysId,
          targetAmount: args.targetAmount ?? 0,
          currentBalance: 0,
          monthlyAmount: args.monthlyAmount ?? 25,
          status: "active",
          createdAt: now,
          updatedAt: now,
        });
        return { success: true, action: "created", planId: id };
      }
      case "adjust": {
        if (!existing) {
          return { success: false, error: "No existing plan to adjust" };
        }
        const updates: Record<string, unknown> = { updatedAt: now };
        if (args.targetAmount !== undefined) updates.targetAmount = args.targetAmount;
        if (args.monthlyAmount !== undefined) updates.monthlyAmount = args.monthlyAmount;
        await ctx.db.patch(existing._id, updates);
        return { success: true, action: "adjusted", planId: existing._id };
      }
      case "close":
      case "pause":
      case "dormant": {
        if (!existing) {
          return { success: false, error: "No existing plan" };
        }
        const newStatus = args.action === "close" ? "completed" : args.action;
        await ctx.db.patch(existing._id, {
          status: newStatus as "active" | "paused" | "completed" | "dormant",
          updatedAt: now,
          ...(args.action === "dormant"
            ? { recheckDate: new Date(now + 5 * 365.25 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) }
            : {}),
        });
        return { success: true, action: args.action, planId: existing._id };
      }
      default:
        return { success: false, error: `Unknown action: ${args.action}` };
    }
  },
});

export const archiveSystemForReplacement = internalMutation({
  args: {
    userId: v.id("users"),
    homeId: v.id("homes"),
    systemId: v.string(),
    failureMode: v.optional(v.string()),
    actualCost: v.optional(v.number()),
    newBrand: v.optional(v.string()),
    newModel: v.optional(v.string()),
    warrantyYears: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const sysId = args.systemId as Id<"systems">;
    const system = await ctx.db.get(sysId);
    if (!system || system.homeId !== args.homeId) {
      return { success: false, error: "System not found or access denied" };
    }

    // Calculate age at failure
    let ageAtFailure: number | undefined;
    if (system.installDate) {
      const installed = new Date(system.installDate);
      if (!isNaN(installed.getTime())) {
        ageAtFailure = Math.round(
          ((Date.now() - installed.getTime()) / (365.25 * 24 * 60 * 60 * 1000)) * 10
        ) / 10;
      }
    }

    // Get Weibull forecast for accuracy comparison
    const forecast = await ctx.db
      .query("forecastResults")
      .withIndex("by_system", (q) => q.eq("systemId", sysId))
      .first();

    // Check if there was an active savings plan
    const savingsPlan = await ctx.db
      .query("savingsPlans")
      .withIndex("by_systemId", (q) => q.eq("systemId", sysId))
      .first();

    // Check alert history for lead time calculation
    const firstAlert = await ctx.db
      .query("alertHistory")
      .withIndex("by_systemId", (q) => q.eq("systemId", sysId))
      .order("asc")
      .first();

    let alertLeadTimeMonths: number | undefined;
    if (firstAlert) {
      alertLeadTimeMonths = Math.round(
        (Date.now() - firstAlert.createdAt) / (30.44 * 24 * 60 * 60 * 1000)
      );
    }

    // Snapshot and archive the old system
    const systemSnapshot = {
      name: system.name,
      manufacturer: system.manufacturer,
      modelNumber: system.modelNumber,
      installDate: system.installDate,
      condition: system.condition,
      healthScore: system.healthScore,
      conditionNotes: system.conditionNotes,
    };

    const archiveId = await ctx.db.insert("systemArchive", {
      userId: args.userId,
      homeId: args.homeId,
      originalSystemId: sysId,
      systemData: systemSnapshot,
      failureMode: args.failureMode,
      actualCost: args.actualCost,
      ageAtFailure,
      predictedLifespan: forecast?.medianRemainingLifeMonths
        ? (forecast.currentAgeMonths + forecast.medianRemainingLifeMonths) / 12
        : undefined,
      wasProactivelyPlanned: savingsPlan?.status === "active",
      alertLeadTimeMonths,
      archivedAt: Date.now(),
    });

    // Mark old system as archived
    await ctx.db.patch(sysId, { isArchived: true });

    // Create replacement system if info provided
    let newSystemId: Id<"systems"> | undefined;
    if (args.newBrand || args.newModel) {
      const today = new Date().toISOString().slice(0, 10);
      newSystemId = await ctx.db.insert("systems", {
        homeId: args.homeId,
        systemTypeId: system.systemTypeId,
        name: system.name,
        locationInHome: system.locationInHome,
        manufacturer: args.newBrand,
        modelNumber: args.newModel,
        installDate: today,
        warrantyExpiry: args.warrantyYears
          ? new Date(Date.now() + args.warrantyYears * 365.25 * 24 * 60 * 60 * 1000)
              .toISOString().slice(0, 10)
          : undefined,
        condition: "good",
        isArchived: false,
      });
      await ctx.db.patch(archiveId, { replacementSystemId: newSystemId });
    }

    // Close active savings plan
    if (savingsPlan && savingsPlan.status === "active") {
      await ctx.db.patch(savingsPlan._id, {
        status: "completed",
        updatedAt: Date.now(),
      });
    }

    return {
      success: true,
      archiveId,
      newSystemId,
      ageAtFailure,
      wasProactivelyPlanned: savingsPlan?.status === "active",
      residualSavings: savingsPlan
        ? Math.max(0, savingsPlan.currentBalance - (args.actualCost ?? 0))
        : 0,
    };
  },
});

export const assessQuote = internalMutation({
  args: {
    userId: v.id("users"),
    homeId: v.id("homes"),
    systemId: v.optional(v.string()),
    contractorName: v.optional(v.string()),
    amount: v.number(),
    workType: v.string(),
    description: v.optional(v.string()),
    priceFlag: v.string(),
    percentile: v.optional(v.number()),
    scopeFlags: v.optional(v.any()),
    recommendation: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("quoteRecords", {
      userId: args.userId,
      homeId: args.homeId,
      systemId: args.systemId ? (args.systemId as Id<"systems">) : undefined,
      contractorName: args.contractorName,
      amount: args.amount,
      description: args.description ?? "",
      workType: args.workType as "repair" | "replacement" | "maintenance",
      priceFlag: args.priceFlag,
      percentile: args.percentile,
      scopeFlags: args.scopeFlags,
      analysis: { recommendation: args.recommendation },
      createdAt: Date.now(),
    });
    return { success: true, quoteRecordId: id };
  },
});

// ════════════════════════════════════════════════════════════════════
// VAULT TOOL MUTATIONS
// ════════════════════════════════════════════════════════════════════

export const searchVault = internalMutation({
  args: {
    userId: v.id("users"),
    homeId: v.id("homes"),
    systemId: v.optional(v.string()),
    type: v.optional(v.string()),
    query: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let items;

    if (args.systemId) {
      const sysId = args.systemId as Id<"systems">;
      items = await ctx.db
        .query("vaultItems")
        .withIndex("by_system", (q) => q.eq("systemId", sysId).eq("isArchived", false))
        .collect();
    } else if (args.type) {
      items = await ctx.db
        .query("vaultItems")
        .withIndex("by_type", (q) =>
          q.eq("homeId", args.homeId).eq("type", args.type as any).eq("isArchived", false)
        )
        .collect();
    } else {
      items = await ctx.db
        .query("vaultItems")
        .withIndex("by_home", (q) => q.eq("homeId", args.homeId).eq("isArchived", false))
        .collect();
    }

    // Simple title filtering if query provided
    if (args.query) {
      const q = args.query.toLowerCase();
      items = items.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          (i.description?.toLowerCase().includes(q) ?? false) ||
          (i.tags?.some((t) => t.toLowerCase().includes(q)) ?? false)
      );
    }

    // Return summarized results (not full file data)
    return {
      success: true,
      count: items.length,
      items: items.slice(0, 10).map((i) => ({
        id: i._id,
        type: i.type,
        title: i.title,
        capturedAt: i.capturedAt,
        systemId: i.systemId,
        hasFinancialData: !!i.financialMetadata,
        warrantyExpiration: i.financialMetadata?.warrantyExpiration,
        purchaseDate: i.financialMetadata?.purchaseDate,
        vendor: i.financialMetadata?.vendor,
        amount: i.financialMetadata?.amount,
        hasAiAnalysis: !!i.aiAnalysis?.conditionGrade,
        conditionGrade: i.aiAnalysis?.conditionGrade,
      })),
    };
  },
});

export const suggestVaultUpload = internalMutation({
  args: {
    userId: v.id("users"),
    homeId: v.id("homes"),
    systemId: v.optional(v.string()),
    suggestedType: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    // Create a notification suggesting the upload
    const typeLabels: Record<string, string> = {
      photo: "condition photo",
      receipt: "purchase receipt",
      warranty: "warranty document",
      permit: "installation permit",
      manual: "owner's manual",
    };
    const typeLabel = typeLabels[args.suggestedType] ?? args.suggestedType;

    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "info",
      title: `Upload a ${typeLabel}`,
      body: args.reason,
      priority: "low",
      read: false,
      relatedSystemId: args.systemId
        ? (args.systemId as Id<"systems">)
        : undefined,
      createdAt: Date.now(),
    });

    return { success: true, suggestedType: args.suggestedType };
  },
});
