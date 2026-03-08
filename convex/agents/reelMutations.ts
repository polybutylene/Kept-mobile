import { internalMutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";

const reelStatus = v.union(
  v.literal("scripted"),
  v.literal("voiced"),
  v.literal("visual"),
  v.literal("assembled"),
  v.literal("published"),
  v.literal("failed")
);

export const createProject = internalMutation({
  args: {
    topic: v.string(),
    style: v.string(),
    script: v.optional(v.string()),
    status: reelStatus,
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("reelProjects", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getProject = internalQuery({
  args: { projectId: v.id("reelProjects") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.projectId);
  },
});

export const updateProject = internalMutation({
  args: {
    projectId: v.id("reelProjects"),
    status: reelStatus,
    voiceoverStorageId: v.optional(v.string()),
    visualAssets: v.optional(v.array(v.string())),
    finalVideoStorageId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { projectId, ...fields } = args;
    const patch: Record<string, any> = { status: fields.status };
    if (fields.voiceoverStorageId) patch.voiceoverStorageId = fields.voiceoverStorageId;
    if (fields.visualAssets) patch.visualAssets = fields.visualAssets;
    if (fields.finalVideoStorageId) patch.finalVideoStorageId = fields.finalVideoStorageId;
    await ctx.db.patch(projectId, patch);
  },
});

export const getProjectsByStatus = internalQuery({
  args: { status: reelStatus },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reelProjects")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});
