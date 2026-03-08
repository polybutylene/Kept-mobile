import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";
import { responsibilityScope, responsibleParty } from "./schema";

export const getResponsibilityRules = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!profile || profile.tier !== "property_manager") return [];

    return await ctx.db
      .query("responsibilityRules")
      .withIndex("by_manager", (q) => q.eq("managerId", profile._id))
      .collect();
  },
});

export const setResponsibilityRule = mutation({
  args: {
    scope: responsibilityScope,
    scopeId: v.optional(v.union(v.id("homes"), v.string())),
    maintenanceTemplateId: v.optional(v.id("maintenanceTaskTemplates")),
    systemTypeId: v.optional(v.id("systemTypes")),
    responsibleParty: responsibleParty,
    ownerPercent: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!profile || profile.tier !== "property_manager") {
      throw new Error("Not authorized");
    }

    const existingRules = await ctx.db
      .query("responsibilityRules")
      .withIndex("by_manager", (q) => q.eq("managerId", profile._id))
      .collect();

    const existing = existingRules.find(
      (rule) =>
        rule.scope === args.scope &&
        rule.scopeId === args.scopeId &&
        rule.maintenanceTemplateId === args.maintenanceTemplateId &&
        rule.systemTypeId === args.systemTypeId
    );

    if (existing) {
      await ctx.db.patch(existing._id, {
        responsibleParty: args.responsibleParty,
        ownerPercent: args.ownerPercent,
      });
      return existing._id;
    }

    return await ctx.db.insert("responsibilityRules", {
      managerId: profile._id,
      scope: args.scope,
      scopeId: args.scopeId,
      maintenanceTemplateId: args.maintenanceTemplateId,
      systemTypeId: args.systemTypeId,
      responsibleParty: args.responsibleParty,
      ownerPercent: args.ownerPercent,
      createdAt: Date.now(),
    });
  },
});

export const getResponsibilityForTask = query({
  args: {
    homeId: v.id("homes"),
    taskId: v.id("scheduledMaintenance"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!profile) return null;

    const home = await ctx.db.get(args.homeId);
    if (!home) return null;

    const task = await ctx.db.get(args.taskId);
    if (!task) return null;

    let managerId: typeof profile._id | null = null;
    if (profile.tier === "property_manager") {
      managerId = profile._id;
    } else {
      const managed = await ctx.db
        .query("managedMembers")
        .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
        .filter((q) => q.eq(q.field("memberId"), profile._id))
        .first();
      managerId = managed?.managerId || null;
    }

    if (!managerId) {
      return { responsibleParty: "owner", ownerPercent: 100 };
    }

    const rules = await ctx.db
      .query("responsibilityRules")
      .withIndex("by_manager", (q) => q.eq("managerId", managerId))
      .collect();

    const selected = selectBestRule(rules, {
      templateId: task.templateId || undefined,
      systemTypeId: task.systemId
        ? (await ctx.db.get(task.systemId))?.systemTypeId
        : undefined,
      homeId: args.homeId,
      propertyGroup: home.propertyGroup,
    });

    if (!selected) {
      return { responsibleParty: "owner", ownerPercent: 100 };
    }

    return {
      responsibleParty: selected.responsibleParty,
      ownerPercent: selected.ownerPercent ?? 100,
    };
  },
});

function selectBestRule(
  rules: any[],
  context: {
    templateId?: Id<"maintenanceTaskTemplates">;
    systemTypeId?: Id<"systemTypes">;
    homeId: Id<"homes">;
    propertyGroup?: string;
  }
) {
  const scopePriority = ["single_property", "property_group", "all_properties"];

  for (const scope of scopePriority) {
    const scoped = rules.filter((rule) => rule.scope === scope);

    const scopedMatch = scoped.filter((rule) => {
      if (scope === "single_property") return rule.scopeId === context.homeId;
      if (scope === "property_group") return rule.scopeId === context.propertyGroup;
      return true;
    });

    const templateMatch = scopedMatch.find(
      (rule) => rule.maintenanceTemplateId && rule.maintenanceTemplateId === context.templateId
    );
    if (templateMatch) return templateMatch;

    const systemMatch = scopedMatch.find(
      (rule) => rule.systemTypeId && rule.systemTypeId === context.systemTypeId
    );
    if (systemMatch) return systemMatch;
  }

  return null;
}
