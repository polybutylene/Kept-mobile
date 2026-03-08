import { query } from "./_generated/server";

// ════════════════════════════════════════════════════════════════════
// Client-facing query for the Agent Activity Feed.
// Returns a chronological feed of agent tool executions for the
// AgentActivityFeedView on iOS.
// ════════════════════════════════════════════════════════════════════

// ── Helper: Convert tool call to human-readable message ───────────

function toolCallToMessage(toolName: string, toolInput: any): string {
  switch (toolName) {
    case "create_insight":
      return `Generated insight: ${toolInput?.title || "analysis complete"}`;
    case "create_action_item":
      return `Created action item: ${toolInput?.title || "new recommendation"}`;
    case "send_notification":
      return `Sent notification: ${toolInput?.title || "alert delivered"}`;
    case "log_maintenance_event":
      return `Logged maintenance: ${toolInput?.description || "event recorded"}`;
    case "update_system_condition":
      return `Updated system condition to "${toolInput?.condition || "assessed"}"`;
    case "schedule_future_check":
      return `Scheduled follow-up check${toolInput?.checkDate ? ` for ${toolInput.checkDate}` : ""}`;
    case "manage_savings_plan": {
      const action = toolInput?.action || "updated";
      return `${action === "create" ? "Created" : "Updated"} savings plan`;
    }
    case "archive_system":
      return "Archived system for replacement tracking";
    case "assess_quote":
      return `Assessed contractor quote${toolInput?.amount ? `: $${Number(toolInput.amount).toLocaleString()}` : ""}`;
    default:
      return `Executed agent action: ${toolName.replace(/_/g, " ")}`;
  }
}

// ── Helper: Extract detail text from tool input ───────────────────

function toolCallToDetail(toolName: string, toolInput: any): string | null {
  if (toolInput?.reasoning) return toolInput.reasoning;
  // Don't repeat description for maintenance events (already in message)
  if (toolInput?.description && toolName !== "log_maintenance_event") {
    return toolInput.description;
  }
  if (toolInput?.body) return toolInput.body;
  return null;
}

// ── Helper: Determine if a tool call had user-visible impact ──────

const IMPACT_TOOLS = new Set([
  "create_insight",
  "create_action_item",
  "send_notification",
  "manage_savings_plan",
  "archive_system",
  "assess_quote",
  "update_system_condition",
]);

// ── Query: Recent activity ────────────────────────────────────────

export const recent = query({
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

    // Get recent tool call log entries, ordered newest-first
    const actions = await ctx.db
      .query("agentActions")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(100);

    return actions.map((a) => ({
      _id: a._id,
      message: toolCallToMessage(a.toolName, a.toolInput),
      detail: toolCallToDetail(a.toolName, a.toolInput),
      category: a.toolName,
      hadImpact: IMPACT_TOOLS.has(a.toolName),
      timestamp: a.executedAt,
    }));
  },
});
