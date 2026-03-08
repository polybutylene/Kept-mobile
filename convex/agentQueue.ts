import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ════════════════════════════════════════════════════════════════════
// Client-facing queries and mutations for the Agent Action Queue.
// Used by the iOS AgentActionQueueView to display and respond to
// pending agent recommendations that require homeowner approval.
// ════════════════════════════════════════════════════════════════════

// ── Helper: Map tool name to client-facing action type ────────────

function mapToolToActionType(toolName: string, toolInput: any): string {
  if (toolInput?.actionType) return toolInput.actionType;

  switch (toolName) {
    case "manage_savings_plan":
      return "savingsAdjustment";
    case "archive_system":
    case "update_system_condition":
      return "replacementPlan";
    case "assess_quote":
      return "quoteAnalysis";
    case "send_notification": {
      const type = (toolInput?.type || "").toLowerCase();
      const priority = (toolInput?.priority || "").toLowerCase();
      if (priority === "critical" || type.includes("safety"))
        return "safetyFlag";
      if (type.includes("weather")) return "weatherAlert";
      return "maintenanceReminder";
    }
    case "create_action_item": {
      const cat = (toolInput?.category || "").toLowerCase();
      const urg = (toolInput?.urgency || "").toLowerCase();
      if (urg === "critical") return "safetyFlag";
      if (cat.includes("weather")) return "weatherAlert";
      return "maintenanceReminder";
    }
    case "schedule_future_check":
      return "maintenanceReminder";
    default:
      return "maintenanceReminder";
  }
}

// ── Helper: Derive urgency from tool input ────────────────────────

function mapToolToUrgency(toolInput: any, reason: string): string {
  if (toolInput?.urgency) {
    const u = toolInput.urgency.toLowerCase();
    if (["critical", "high", "medium", "low"].includes(u)) return u;
  }
  if (toolInput?.priority) {
    const p = toolInput.priority.toLowerCase();
    if (["critical", "high", "medium", "low"].includes(p)) return p;
  }
  const reasonLower = (reason || "").toLowerCase();
  if (reasonLower.includes("safety") || reasonLower.includes("emergency"))
    return "critical";
  if (reasonLower.includes("urgent") || reasonLower.includes("immediate"))
    return "high";
  return "medium";
}

// ── Helper: Derive user-friendly title from tool call ─────────────

function deriveTitle(toolName: string, toolInput: any): string {
  if (toolInput?.title) return toolInput.title;

  switch (toolName) {
    case "manage_savings_plan": {
      const action = toolInput?.action || "Adjust";
      const cap = action.charAt(0).toUpperCase() + action.slice(1);
      return `${cap} Savings Plan`;
    }
    case "archive_system":
      return "System Replacement Record";
    case "assess_quote":
      return toolInput?.amount
        ? `Quote Analysis: $${Number(toolInput.amount).toLocaleString()}`
        : "Quote Analysis";
    case "send_notification":
      return toolInput?.title || "Agent Alert";
    case "create_action_item":
      return toolInput?.title || "Recommended Action";
    case "update_system_condition":
      return "System Condition Update";
    case "schedule_future_check":
      return "Scheduled Follow-up";
    default:
      return "Agent Recommendation";
  }
}

// ── Helper: Derive recommended action text ────────────────────────

function deriveRecommendedAction(toolName: string, toolInput: any): string {
  if (toolInput?.description) return toolInput.description;

  switch (toolName) {
    case "manage_savings_plan": {
      const action = toolInput?.action || "adjust";
      const monthly = toolInput?.monthlyAmount;
      if (monthly)
        return `${action === "create" ? "Start" : "Adjust"} savings plan to $${monthly}/month.`;
      return `${action === "create" ? "Create" : "Update"} your replacement savings plan.`;
    }
    case "archive_system":
      return "Archive this system and create a record for the replacement unit.";
    case "assess_quote":
      return `Analyze contractor quote${toolInput?.amount ? ` of $${Number(toolInput.amount).toLocaleString()}` : ""}.`;
    case "send_notification":
      return toolInput?.body || "Review this notification.";
    case "create_action_item":
      return toolInput?.description || "Review and approve this recommendation.";
    case "update_system_condition":
      return `Update system condition to "${toolInput?.condition || "assessed"}".`;
    case "schedule_future_check":
      return `Schedule a follow-up check${toolInput?.checkDate ? ` for ${toolInput.checkDate}` : ""}.`;
    default:
      return "Review and approve this recommendation.";
  }
}

// ── Query: List pending actions ───────────────────────────────────

export const listPending = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) return [];

    const pending = await ctx.db
      .query("pendingActions")
      .withIndex("by_userId_status", (q) =>
        q.eq("userId", user._id).eq("status", "pending")
      )
      .collect();

    // Filter out expired actions
    const now = Date.now();
    const active = pending.filter(
      (pa) => !pa.expiresAt || pa.expiresAt > now
    );

    return active.map((pa) => ({
      _id: pa._id,
      title: deriveTitle(pa.toolName, pa.toolInput),
      reasoning: pa.reason,
      recommendedAction: deriveRecommendedAction(pa.toolName, pa.toolInput),
      actionType: mapToolToActionType(pa.toolName, pa.toolInput),
      urgency: mapToolToUrgency(pa.toolInput as any, pa.reason),
      createdAt: pa.createdAt,
      estimatedSavings: (pa.toolInput as any)?.estimatedSavings ?? null,
      relatedSystemId: (pa.toolInput as any)?.systemId ?? null,
    }));
  },
});

// ── Mutation: Respond to a pending action ─────────────────────────

export const respond = mutation({
  args: {
    actionId: v.id("pendingActions"),
    response: v.union(
      v.literal("approved"),
      v.literal("dismissed"),
      v.literal("modified")
    ),
    userNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const action = await ctx.db.get(args.actionId);
    if (!action) throw new Error("Action not found");

    // Verify ownership
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user || action.userId !== user._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.actionId, {
      status: args.response,
      resolvedAt: Date.now(),
    });

    // If modified, store user notes on the tool input for re-processing
    if (args.response === "modified" && args.userNotes) {
      const updatedInput = {
        ...(typeof action.toolInput === "object" && action.toolInput !== null
          ? action.toolInput
          : {}),
        userModificationNotes: args.userNotes,
      };
      await ctx.db.patch(args.actionId, {
        toolInput: updatedInput,
      });
    }
  },
});
