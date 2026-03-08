"use node";

import { v } from "convex/values";
import { internalAction, internalQuery } from "../_generated/server";
import { internal } from "../_generated/api";
import type { GenericActionCtx } from "convex/server";
import type { DataModel, Id } from "../_generated/dataModel";
import Anthropic from "@anthropic-ai/sdk";
import { AGENT_TOOLS, APPROVAL_REQUIRED_TOOLS, SAFETY_TOOLS } from "./tools";
import { buildSystemPrompt } from "./prompt";
import type { WorkflowPreparation } from "./workflows/helpers";
import type { AgentContext } from "./context";

// ═══════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════

const DEFAULT_MODEL = "claude-sonnet-4-20250514";
const LIGHTWEIGHT_MODEL = "claude-haiku-4-5-20250929";
const MAX_LOOP_ITERATIONS = 12;
const MAX_TOKENS_PER_TURN = 4096;
const API_TIMEOUT_MS = 60_000;
const MAX_API_RETRIES = 3;

const MODEL_COSTS_PER_MILLION: Record<
  string,
  { input: number; output: number }
> = {
  [DEFAULT_MODEL]: { input: 3.0, output: 15.0 },
  [LIGHTWEIGHT_MODEL]: { input: 0.8, output: 4.0 },
};

/** Trigger types that use the lightweight model to save cost. */
const LIGHTWEIGHT_TRIGGERS = new Set([
  "scheduled_check",
  "periodic_review",
  "system_age_check",
  "costRefresh",
]);

// ═══════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════

type ActionCtx = GenericActionCtx<DataModel>;

interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
}

interface ToolCallEntry {
  name: string;
  status: "success" | "error" | "pending_approval";
  durationMs: number;
}

interface WorkflowResult {
  status: "completed" | "failed" | "max_iterations";
  summary: string;
  toolCalls: ToolCallEntry[];
  tokenUsage: TokenUsage;
  iterations: number;
  durationMs: number;
  estimatedCostUsd: number;
  finalResponse: string | null;
}

// ═══════════════════════════════════════════════════════════════════════
// CLAUDE API WRAPPER WITH RETRIES
// ═══════════════════════════════════════════════════════════════════════

async function callClaude(
  client: Anthropic,
  params: Anthropic.MessageCreateParamsNonStreaming,
): Promise<Anthropic.Message> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_API_RETRIES; attempt++) {
    try {
      const response = await Promise.race([
        client.messages.create(params),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error(`Claude API timeout after ${API_TIMEOUT_MS}ms`)),
            API_TIMEOUT_MS,
          ),
        ),
      ]);
      return response;
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error));

      const isRetryable =
        error instanceof Anthropic.RateLimitError ||
        error instanceof Anthropic.InternalServerError ||
        error instanceof Anthropic.APIConnectionError ||
        (error instanceof Error && error.message.includes("timeout"));

      if (isRetryable && attempt < MAX_API_RETRIES) {
        const baseDelay =
          error instanceof Anthropic.RateLimitError ? 5000 : 2000;
        const delay =
          baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        console.warn(
          `Claude API ${lastError.constructor.name} — ` +
            `retry ${attempt + 1}/${MAX_API_RETRIES} in ${Math.round(delay)}ms`,
        );
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw lastError;
    }
  }
  throw lastError ?? new Error("Claude API call failed after all retries");
}

// ═══════════════════════════════════════════════════════════════════════
// TRIGGER MESSAGE COMPOSITION
// Maps workflow trigger types to descriptive messages for Claude.
// ═══════════════════════════════════════════════════════════════════════

function composeTriggerMessage(trigger: {
  type: string;
  sourceId?: string;
  details?: Record<string, unknown>;
  userMessage?: string;
}): string {
  if (trigger.userMessage) return trigger.userMessage;

  const d = trigger.details ?? {};
  const meta = (d.metadata ?? {}) as Record<string, unknown>;

  const templates: Record<string, string> = {
    // ── Workflow trigger types (from crons and events) ──
    forecastThresholdCrossed:
      `A system forecast has crossed the ${(d.thresholdCrossed as number ?? 0) * 100}% cumulative failure threshold. ` +
      `System ID: ${d.systemId ?? "unknown"}. Forecast ID: ${d.forecastId ?? "unknown"}. ` +
      `Analyze the system's current state, recommend whether to plan replacement or continue monitoring, ` +
      `and provide a budget timeline.`,
    maintenanceOverdue:
      `${meta.overdueCount ?? "Multiple"} maintenance tasks are overdue by more than 14 days. ` +
      `Task IDs: ${JSON.stringify(meta.overdueTaskIds ?? [])}. ` +
      `Review each overdue item, assess health impact, prioritize the catch-up schedule, ` +
      `and notify the homeowner with specific next steps.`,
    weatherAlert:
      `A ${meta.severity ?? ""} weather alert has been issued: "${meta.headline ?? "Weather event"}". ` +
      `Type: ${meta.alertType ?? "unknown"}. ` +
      `Review all registered systems for weather vulnerability, generate preparedness actions, ` +
      `and flag any systems that need immediate attention.`,
    userSymptomReport:
      `The homeowner has reported a symptom: "${d.userMessage ?? "No details provided"}". ` +
      `${d.systemId ? `Related system: ${d.systemId}. ` : ""}` +
      `Diagnose the likely cause using domain knowledge and the home's system profile. ` +
      `Provide specific guidance and recommend next steps.`,
    userPhotoUpload:
      `The homeowner has uploaded a photo for analysis. ` +
      `Storage ID: ${d.photoStorageId ?? "unknown"}. ` +
      `${d.systemId ? `Related system: ${d.systemId}. ` : ""}` +
      `${d.userMessage ? `Context: "${d.userMessage}". ` : ""}` +
      `Analyze the photo context and provide actionable guidance.`,
    userQuoteInput:
      `The homeowner has received a contractor quote of $${(((d.quoteAmountCents as number) ?? 0) / 100).toFixed(2)}. ` +
      `System: ${d.systemId ?? "unknown"}. ` +
      `${meta.contractorName ? `Contractor: ${meta.contractorName}. ` : ""}` +
      `${d.userMessage ? `Scope: "${d.userMessage}". ` : ""}` +
      `Evaluate whether this quote is fair based on regional cost data and the system's condition.`,
    systemFailureReport:
      `A system has been reported as FAILED. System: ${d.systemId ?? "unknown"}. ` +
      `Description: "${d.userMessage ?? "No details"}". ` +
      `Emergency: ${meta.isEmergency ?? false}. ` +
      `Provide immediate guidance, assess repair vs. replace based on age and condition, ` +
      `and create an emergency action plan if needed.`,
    onboardingComplete:
      `The homeowner has completed onboarding with ${meta.systemCount ?? 0} systems registered. ` +
      `System IDs: ${JSON.stringify(meta.systemIds ?? [])}. ` +
      `Generate initial forecasts for all systems, create a welcome health summary, ` +
      `identify the top 3 immediate priorities, and schedule first maintenance reminders.`,
    seasonalSweep:
      `Perform a ${meta.season ?? "seasonal"} maintenance review (Q${meta.quarter ?? "?"} ${meta.year ?? ""}). ` +
      `Evaluate every registered system for seasonal prep tasks. Prioritize the top 3-5 items. ` +
      `Include both DIY and professional service items.`,
    costRefresh:
      `Cost data needs refreshing. ${meta.expiredCount ?? 0} entries have expired across ` +
      `${(meta.categories as string[])?.length ?? 0} categories. Note: cost refresh logic pending.`,
    dailySweep:
      `Run a daily forecast sweep. Check all systems for any changes that warrant attention.`,
    weeklySweep:
      `Run a weekly review. Check overdue tasks and system health across the entire home.`,

    // ── Direct trigger types (from engine invocations) ──
    system_added:
      `A new system was added to the home (system ID: ${trigger.sourceId}). ` +
      `Analyze it in the context of the full home profile. Create forecasts for upcoming ` +
      `maintenance needs and identify any immediate concerns or safety issues.`,
    maintenance_logged:
      `Maintenance was logged for system ${trigger.sourceId}: ${JSON.stringify(d)}. ` +
      `Update relevant forecasts, note how this affects the system's outlook, ` +
      `and identify any follow-up actions.`,
    forecast_due:
      `Forecast coming due — ID: ${trigger.sourceId}. Details: ${JSON.stringify(d)}. ` +
      `Provide actionable, specific guidance for the homeowner.`,
    seasonal_check:
      `Perform a seasonal maintenance review for ${meta.season ?? "the current season"}. ` +
      `Evaluate every registered system for seasonal prep tasks. Prioritize the top 3-5 items.`,
    system_age_alert:
      `System ${trigger.sourceId} has hit an age milestone. Details: ${JSON.stringify(d)}. ` +
      `Evaluate remaining useful life, proactive replacement planning, and cost outlook.`,
    periodic_review:
      `Run a comprehensive periodic review of the entire home. Check all systems, ` +
      `refresh forecasts, identify overlooked items, and surface the 2-3 highest-priority actions. ` +
      `Include a 12-month cost outlook.`,
    scheduled_check:
      `Scheduled re-check for system ${trigger.sourceId}. Reason: ${meta.reason ?? "periodic review"}. ` +
      `Re-evaluate condition and update forecasts.`,
    user_question: (meta.question as string) ?? "The homeowner has a question about their home.",
  };

  return (
    templates[trigger.type] ??
    `Trigger: ${trigger.type}. Source: ${trigger.sourceId ?? "N/A"}. ` +
      `Details: ${JSON.stringify(d)}. Analyze and take appropriate action.`
  );
}

// ═══════════════════════════════════════════════════════════════════════
// WORKFLOW ROUTER
// Maps trigger types to their decision tree prepare() functions.
// Each workflow pre-computes data and returns prompt additions for Claude.
// ═══════════════════════════════════════════════════════════════════════

// Dynamic imports to avoid bundling all workflow code unless needed.
// Each workflow module exports: prepare(ctx, agentContext, triggerDetails)

const WORKFLOW_TRIGGER_MAP: Record<string, string> = {
  // Workflow 1: Proactive Replacement Planning
  forecastThresholdCrossed: "proactiveReplacement",
  dailySweep: "proactiveReplacement",
  system_age_alert: "proactiveReplacement",

  // Workflow 2: Symptom Diagnosis
  userSymptomReport: "symptomDiagnosis",

  // Workflow 3: Weather Event Response
  weatherAlert: "weatherResponse",

  // Workflow 4: Quote Validation
  userQuoteInput: "quoteValidation",

  // Workflow 5: Seasonal Maintenance Sweep
  seasonalSweep: "seasonalSweep",
  seasonal_check: "seasonalSweep",

  // Workflow 6: Post-Failure Event Processing
  systemFailureReport: "failureProcessing",

  // Workflow 7: New Home Onboarding Analysis
  onboardingComplete: "onboardingAnalysis",
};

async function getWorkflowPreparation(
  ctx: ActionCtx,
  triggerType: string,
  agentContext: AgentContext,
  triggerDetails: Record<string, unknown>,
): Promise<WorkflowPreparation | null> {
  const workflowKey = WORKFLOW_TRIGGER_MAP[triggerType];
  if (!workflowKey) return null;

  try {
    // Use dynamic dispatch to the appropriate workflow module
    let prepare: (
      ctx: ActionCtx,
      agentContext: AgentContext,
      triggerDetails: Record<string, unknown>,
    ) => Promise<WorkflowPreparation>;

    switch (workflowKey) {
      case "proactiveReplacement": {
        const mod = await import("./workflows/proactiveReplacement");
        prepare = mod.prepare;
        break;
      }
      case "symptomDiagnosis": {
        const mod = await import("./workflows/symptomDiagnosis");
        prepare = mod.prepare;
        break;
      }
      case "weatherResponse": {
        const mod = await import("./workflows/weatherResponse");
        prepare = mod.prepare;
        break;
      }
      case "quoteValidation": {
        const mod = await import("./workflows/quoteValidation");
        prepare = mod.prepare;
        break;
      }
      case "seasonalSweep": {
        const mod = await import("./workflows/seasonalSweep");
        prepare = mod.prepare;
        break;
      }
      case "failureProcessing": {
        const mod = await import("./workflows/failureProcessing");
        prepare = mod.prepare;
        break;
      }
      case "onboardingAnalysis": {
        const mod = await import("./workflows/onboardingAnalysis");
        prepare = mod.prepare;
        break;
      }
      default:
        return null;
    }

    return await prepare(ctx, agentContext, triggerDetails);
  } catch (error) {
    console.warn(
      `[agent] Workflow preparation failed for ${workflowKey}:`,
      error instanceof Error ? error.message : String(error),
    );
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════
// TOOL EXECUTION DISPATCHER
// Maps tool names to their corresponding mutations.
// ═══════════════════════════════════════════════════════════════════════

function buildToolMutationMap() {
  return {
    upsert_forecast: {
      ref: internal.agent.mutations.upsertForecast,
      argMapper: (input: any, userId: Id<"users">, homeId: Id<"homes">) => ({
        ...input,
        userId,
        homeId,
      }),
    },
    create_action_item: {
      ref: internal.agent.mutations.createActionItem,
      argMapper: (input: any, userId: Id<"users">, homeId: Id<"homes">) => ({
        ...input,
        userId,
        homeId,
      }),
    },
    update_system_record: {
      ref: internal.agent.mutations.updateSystem,
      argMapper: (input: any, userId: Id<"users">, homeId: Id<"homes">) => ({
        ...input,
        userId,
        homeId,
      }),
    },
    send_notification: {
      ref: internal.agent.mutations.sendNotification,
      argMapper: (input: any, userId: Id<"users">) => ({ ...input, userId }),
    },
    escalate_safety_concern: {
      ref: internal.agent.mutations.escalateSafety,
      argMapper: (input: any, userId: Id<"users">, homeId: Id<"homes">) => ({
        ...input,
        userId,
        homeId,
      }),
    },
    request_information: {
      ref: internal.agent.mutations.requestInformation,
      argMapper: (input: any, userId: Id<"users">) => ({ ...input, userId }),
    },
    log_maintenance_record: {
      ref: internal.agent.mutations.logMaintenanceRecord,
      argMapper: (input: any, userId: Id<"users">, homeId: Id<"homes">) => ({
        ...input,
        userId,
        homeId,
      }),
    },
    schedule_future_check: {
      ref: internal.agent.mutations.scheduleFutureCheck,
      argMapper: (input: any, userId: Id<"users">) => ({ ...input, userId }),
    },
    // ── Workflow decision tree tools ──
    manage_savings_plan: {
      ref: internal.agent.mutations.manageSavingsPlan,
      argMapper: (input: any, userId: Id<"users">, homeId: Id<"homes">) => ({
        ...input,
        userId,
        homeId,
      }),
    },
    archive_system: {
      ref: internal.agent.mutations.archiveSystemForReplacement,
      argMapper: (input: any, userId: Id<"users">, homeId: Id<"homes">) => ({
        ...input,
        userId,
        homeId,
      }),
    },
    assess_quote: {
      ref: internal.agent.mutations.assessQuote,
      argMapper: (input: any, userId: Id<"users">, homeId: Id<"homes">) => ({
        ...input,
        userId,
        homeId,
      }),
    },
    // ── Vault tools ──
    search_vault: {
      ref: internal.agent.mutations.searchVault,
      argMapper: (input: any, userId: Id<"users">, homeId: Id<"homes">) => ({
        ...input,
        userId,
        homeId,
      }),
    },
    suggest_vault_upload: {
      ref: internal.agent.mutations.suggestVaultUpload,
      argMapper: (input: any, userId: Id<"users">, homeId: Id<"homes">) => ({
        ...input,
        userId,
        homeId,
      }),
    },
    // ── Upgrade planning tools ──
    generate_upgrade_comparison: {
      ref: internal.agent.upgradeTools.generateUpgradeComparison,
      argMapper: (input: any, userId: Id<"users">, homeId: Id<"homes">) => ({
        ...input,
        userId,
        homeId,
      }),
    },
    create_upgrade_savings_plan: {
      ref: internal.agent.upgradeTools.createUpgradeSavingsPlan,
      argMapper: (input: any, userId: Id<"users">, homeId: Id<"homes">) => ({
        ...input,
        userId,
        homeId,
      }),
    },
    initiate_upgrade_planning: {
      ref: internal.agent.upgradeTools.initiateUpgradePlanning,
      argMapper: (input: any, userId: Id<"users">, homeId: Id<"homes">) => ({
        ...input,
        userId,
        homeId,
      }),
    },
    model_financing_scenario: {
      ref: internal.agent.upgradeTools.modelFinancing,
      argMapper: (input: any, userId: Id<"users">) => ({
        ...input,
        userId,
      }),
    },
  } as Record<
    string,
    { ref: any; argMapper: (input: any, userId: Id<"users">, homeId: Id<"homes">) => any }
  >;
}

async function executeTool(
  ctx: ActionCtx,
  toolName: string,
  toolInput: Record<string, unknown>,
  userId: Id<"users">,
  homeId: Id<"homes">,
): Promise<Record<string, unknown>> {
  const map = buildToolMutationMap();
  const mapping = map[toolName];
  if (!mapping) throw new Error(`Unknown tool: ${toolName}`);
  return await ctx.runMutation(
    mapping.ref,
    mapping.argMapper(toolInput, userId, homeId),
  );
}

// ═══════════════════════════════════════════════════════════════════════
// WORKFLOW LOADER
// ═══════════════════════════════════════════════════════════════════════

export const getWorkflow = internalQuery({
  args: { workflowId: v.id("agentWorkflows") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.workflowId);
  },
});

// ═══════════════════════════════════════════════════════════════════════
// MAIN AGENT LOOP
//
// Entry point: accepts a workflowId (created by triggers/events).
// Loads the workflow, gathers context, runs Claude with tools,
// and records all actions and outcomes.
// ═══════════════════════════════════════════════════════════════════════

export const run = internalAction({
  args: {
    workflowId: v.id("agentWorkflows"),
  },
  handler: async (ctx, args): Promise<WorkflowResult> => {
    const startTime = Date.now();

    const tokenUsage: TokenUsage = {
      inputTokens: 0,
      outputTokens: 0,
      cacheReadTokens: 0,
      cacheCreationTokens: 0,
    };
    const toolCallLog: ToolCallEntry[] = [];

    try {
      // ── 1. Load the workflow record ─────────────────────
      const workflow = await ctx.runQuery(
        internal.agent.engine.getWorkflow,
        { workflowId: args.workflowId },
      );
      if (!workflow) {
        throw new Error(`Workflow ${args.workflowId} not found`);
      }

      const userId = workflow.userId;
      const triggerType = workflow.triggerType;
      const triggerDetails = (workflow.triggerDetails ?? {}) as Record<string, unknown>;

      // Select model based on trigger complexity
      const model = LIGHTWEIGHT_TRIGGERS.has(triggerType)
        ? LIGHTWEIGHT_MODEL
        : DEFAULT_MODEL;

      // ── 2. Mark workflow as running ─────────────────────
      await ctx.runMutation(internal.agent.mutations.markWorkflowRunning, {
        workflowId: args.workflowId,
        model,
      });

      // ── 3. Gather full context ──────────────────────────
      const context = await ctx.runQuery(
        internal.agent.context.gatherAgentContext,
        { userId, homeId: workflow.homeId ?? undefined },
      );

      // Handle no home profile — prompt user to set up
      if (!context.home) {
        await ctx.runMutation(internal.agent.mutations.sendNotification, {
          userId,
          type: "info",
          title: "Set up your home profile",
          body:
            "Add your home details and systems so Kept can provide " +
            "personalized maintenance intelligence.",
          priority: "medium",
        });

        const result: WorkflowResult = {
          status: "completed",
          summary: "No home profile — prompted user to complete setup.",
          toolCalls: [],
          tokenUsage,
          iterations: 0,
          durationMs: Date.now() - startTime,
          estimatedCostUsd: 0,
          finalResponse: null,
        };
        await ctx.runMutation(internal.agent.mutations.completeWorkflow, {
          workflowId: args.workflowId,
          status: result.status,
          inputTokens: 0,
          outputTokens: 0,
          toolCallCount: 0,
          iterations: 0,
          durationMs: result.durationMs,
          resultSummary: result.summary,
        });
        return result;
      }

      // ── 4. Run workflow decision tree preparation ──────
      const workflowPrep = await getWorkflowPreparation(
        ctx,
        triggerType,
        context,
        triggerDetails,
      );

      if (workflowPrep) {
        console.log(
          `[agent] Workflow prep complete for ${triggerType}: ` +
            `context=${workflowPrep.additionalContext.length} chars, ` +
            `instructions=${workflowPrep.workflowInstructions.length} chars`,
        );
      }

      // ── 5. Build prompt & messages ──────────────────────
      const trigger = {
        type: triggerType,
        sourceId: workflow.triggerSourceId ?? (triggerDetails.systemId as string),
        details: triggerDetails,
        userMessage: triggerDetails.userMessage as string | undefined,
      };

      const systemPrompt = buildSystemPrompt(
        context,
        trigger,
        workflowPrep?.additionalContext,
        workflowPrep?.workflowInstructions,
      );

      const messages: Anthropic.MessageParam[] = [];
      messages.push({
        role: "user",
        content: composeTriggerMessage(trigger),
      });

      // ── 6. Agent loop ───────────────────────────────────
      const client = new Anthropic();
      let iterations = 0;
      let finalTextResponse: string | null = null;
      let continueLoop = true;

      while (continueLoop && iterations < MAX_LOOP_ITERATIONS) {
        iterations++;

        const response = await callClaude(client, {
          model,
          max_tokens: MAX_TOKENS_PER_TURN,
          system: systemPrompt,
          tools: AGENT_TOOLS as Anthropic.Tool[],
          messages,
        });

        // Track tokens
        tokenUsage.inputTokens += response.usage.input_tokens;
        tokenUsage.outputTokens += response.usage.output_tokens;
        const anyUsage = response.usage as any;
        tokenUsage.cacheReadTokens +=
          anyUsage.cache_read_input_tokens ?? 0;
        tokenUsage.cacheCreationTokens +=
          anyUsage.cache_creation_input_tokens ?? 0;

        // Append assistant response to conversation
        messages.push({ role: "assistant", content: response.content });

        // Capture text blocks
        for (const block of response.content) {
          if (block.type === "text" && block.text.trim()) {
            finalTextResponse = block.text;
          }
        }

        // ── Process tool calls ────────────────────────────
        if (response.stop_reason === "tool_use") {
          const toolResultBlocks: Anthropic.ToolResultBlockParam[] = [];

          for (const block of response.content) {
            if (block.type !== "tool_use") continue;

            const toolStart = Date.now();
            const { name: toolName, input: toolInput, id: toolUseId } = block;
            const input = toolInput as Record<string, unknown>;

            try {
              // ── Approval gate ──────────────────────────
              if (
                APPROVAL_REQUIRED_TOOLS.has(toolName) &&
                !SAFETY_TOOLS.has(toolName)
              ) {
                const pendingId = await ctx.runMutation(
                  internal.agent.mutations.createPendingAction,
                  {
                    userId,
                    workflowId: args.workflowId,
                    toolName,
                    toolInput: input,
                    reason: `"${toolName.replace(/_/g, " ")}" requires your approval.`,
                  },
                );

                await ctx.runMutation(
                  internal.agent.mutations.sendNotification,
                  {
                    userId,
                    type: "approval_request",
                    title: `Approval needed: ${toolName.replace(/_/g, " ")}`,
                    body:
                      `Your maintenance agent wants to ${toolName.replace(/_/g, " ")}. ` +
                      `Review the details and approve or dismiss in the app.`,
                    priority: "medium",
                    relatedActionId: pendingId,
                  },
                );

                toolCallLog.push({
                  name: toolName,
                  status: "pending_approval",
                  durationMs: Date.now() - toolStart,
                });

                await ctx.runMutation(
                  internal.agent.mutations.logAgentAction,
                  {
                    userId,
                    workflowId: args.workflowId,
                    toolName,
                    toolInput: input,
                    result: { pendingActionId: pendingId },
                    status: "pending_approval",
                  },
                );

                toolResultBlocks.push({
                  type: "tool_result",
                  tool_use_id: toolUseId,
                  content: JSON.stringify({
                    status: "queued_for_approval",
                    message:
                      "Queued for homeowner approval. They've been notified. " +
                      "Continue your analysis — do not wait for approval.",
                  }),
                });

                continue;
              }

              // ── Auto-execute ──────────────────────────
              const result = await executeTool(
                ctx,
                toolName,
                input,
                userId,
                context.home._id,
              );

              toolCallLog.push({
                name: toolName,
                status: "success",
                durationMs: Date.now() - toolStart,
              });

              await ctx.runMutation(
                internal.agent.mutations.logAgentAction,
                {
                  userId,
                  workflowId: args.workflowId,
                  toolName,
                  toolInput: input,
                  result,
                  status: "success",
                },
              );

              toolResultBlocks.push({
                type: "tool_result",
                tool_use_id: toolUseId,
                content: JSON.stringify(result),
              });
            } catch (toolError: unknown) {
              const errMsg =
                toolError instanceof Error
                  ? toolError.message
                  : String(toolError);
              console.error(`Tool [${toolName}] failed:`, errMsg);

              toolCallLog.push({
                name: toolName,
                status: "error",
                durationMs: Date.now() - toolStart,
              });

              await ctx.runMutation(
                internal.agent.mutations.logAgentAction,
                {
                  userId,
                  workflowId: args.workflowId,
                  toolName,
                  toolInput: input,
                  result: { error: errMsg },
                  status: "error",
                },
              );

              toolResultBlocks.push({
                type: "tool_result",
                tool_use_id: toolUseId,
                content: JSON.stringify({
                  status: "error",
                  error: errMsg,
                  instruction:
                    "This tool call failed. Adapt your approach or inform the homeowner.",
                }),
                is_error: true,
              });
            }
          }

          messages.push({ role: "user", content: toolResultBlocks });
        } else {
          // stop_reason: "end_turn" or "max_tokens" → exit loop
          continueLoop = false;
        }
      }

      // ── 7. Compute cost & finalize ──────────────────────
      const costs =
        MODEL_COSTS_PER_MILLION[model] ?? MODEL_COSTS_PER_MILLION[DEFAULT_MODEL];
      const estimatedCostUsd =
        (tokenUsage.inputTokens / 1_000_000) * costs.input +
        (tokenUsage.outputTokens / 1_000_000) * costs.output;

      const result: WorkflowResult = {
        status:
          iterations >= MAX_LOOP_ITERATIONS ? "max_iterations" : "completed",
        summary:
          finalTextResponse?.slice(0, 500) ??
          "Agent completed with tool actions only.",
        toolCalls: toolCallLog,
        tokenUsage,
        iterations,
        durationMs: Date.now() - startTime,
        estimatedCostUsd,
        finalResponse: finalTextResponse,
      };

      await ctx.runMutation(internal.agent.mutations.completeWorkflow, {
        workflowId: args.workflowId,
        status: result.status,
        inputTokens: tokenUsage.inputTokens,
        outputTokens: tokenUsage.outputTokens,
        toolCallCount: toolCallLog.length,
        iterations,
        durationMs: result.durationMs,
        resultSummary: result.summary,
        estimatedCostUsd,
      });

      console.log(
        `[agent] ${result.status} | model=${model} | iter=${iterations} | ` +
          `tools=${toolCallLog.length} | ` +
          `tokens=${tokenUsage.inputTokens}in+${tokenUsage.outputTokens}out | ` +
          `cost=$${estimatedCostUsd.toFixed(4)} | ${result.durationMs}ms`,
      );

      return result;
    } catch (error: unknown) {
      // ── Top-level error handling ────────────────────────
      const errMsg =
        error instanceof Error ? error.message : String(error);
      const errStack =
        error instanceof Error ? error.stack : undefined;
      console.error("[agent] Workflow failed:", errMsg, errStack);

      await ctx.runMutation(internal.agent.mutations.failWorkflow, {
        workflowId: args.workflowId,
        error: errMsg.slice(0, 2000),
        durationMs: Date.now() - startTime,
      });

      // Notify user for user-facing triggers
      const workflow = await ctx.runQuery(
        internal.agent.engine.getWorkflow,
        { workflowId: args.workflowId },
      );
      const userFacingTriggers = new Set([
        "userSymptomReport",
        "userPhotoUpload",
        "systemFailureReport",
        "userQuoteInput",
      ]);
      if (workflow && userFacingTriggers.has(workflow.triggerType)) {
        try {
          await ctx.runMutation(
            internal.agent.mutations.sendNotification,
            {
              userId: workflow.userId,
              type: "info",
              title: "Analysis temporarily unavailable",
              body:
                "Our maintenance analysis hit a snag. We're on it. " +
                "If this is urgent, consult a local licensed professional.",
              priority: "medium",
            },
          );
        } catch {
          // Don't let notification failure mask the original error
        }
      }

      return {
        status: "failed",
        summary: `Workflow failed: ${errMsg}`,
        toolCalls: toolCallLog,
        tokenUsage,
        iterations: 0,
        durationMs: Date.now() - startTime,
        estimatedCostUsd: 0,
        finalResponse: null,
      };
    }
  },
});
