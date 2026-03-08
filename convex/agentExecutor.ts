/**
 * Legacy agent executor — now delegates to the full agent engine.
 *
 * The actual execution logic lives in convex/agent/engine.ts.
 * This file is kept for backward compatibility with any references
 * that haven't been migrated to internal.agent.engine.run yet.
 */

import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const run = internalAction({
  args: { workflowId: v.id("agentWorkflows") },
  handler: async (ctx, args) => {
    // Delegate to the full agent engine
    return await ctx.runAction(internal.agent.engine.run, {
      workflowId: args.workflowId,
    });
  },
});

// Keep these for any existing references

export const getWorkflow = internalQuery({
  args: { workflowId: v.id("agentWorkflows") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.workflowId);
  },
});

export const updateWorkflowStatus = internalMutation({
  args: {
    workflowId: v.id("agentWorkflows"),
    status: v.string(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, any> = { status: args.status };
    if (args.startedAt !== undefined) patch.startedAt = args.startedAt;
    if (args.completedAt !== undefined) patch.completedAt = args.completedAt;
    if (args.error !== undefined) patch.error = args.error;
    await ctx.db.patch(args.workflowId, patch);
  },
});
