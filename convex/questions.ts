import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { questionCategory } from "./schema";

/**
 * Get questions for a service call
 * Returns general questions plus system-specific ones
 */
export const getQuestionsForServiceCall = query({
  args: {
    systemTypeId: v.optional(v.id("systemTypes")),
    categories: v.optional(v.array(questionCategory)),
  },
  handler: async (ctx, args) => {
    // Get general questions (systemTypeId is null)
    let generalQuestions = await ctx.db
      .query("technicianQuestions")
      .filter((q) =>
        q.and(
          q.eq(q.field("systemTypeId"), undefined),
          q.eq(q.field("isActive"), true)
        )
      )
      .collect();

    // Get system-specific questions if systemTypeId provided
    let systemQuestions: typeof generalQuestions = [];
    if (args.systemTypeId) {
      systemQuestions = await ctx.db
        .query("technicianQuestions")
        .withIndex("by_systemType", (q) =>
          q.eq("systemTypeId", args.systemTypeId!)
        )
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();
    }

    let allQuestions = [...generalQuestions, ...systemQuestions];

    // Filter by categories if specified
    if (args.categories && args.categories.length > 0) {
      allQuestions = allQuestions.filter((q) =>
        args.categories!.includes(q.category)
      );
    }

    // Sort by sortOrder
    allQuestions.sort((a, b) => a.sortOrder - b.sortOrder);

    // Group by category
    const byCategory = {
      qualification: allQuestions.filter((q) => q.category === "qualification"),
      diagnosis: allQuestions.filter((q) => q.category === "diagnosis"),
      options: allQuestions.filter((q) => q.category === "options"),
      pricing: allQuestions.filter((q) => q.category === "pricing"),
      warranty: allQuestions.filter((q) => q.category === "warranty"),
    };

    return {
      all: allQuestions,
      byCategory,
    };
  },
});

/**
 * Get questions by category
 */
export const getQuestionsByCategory = query({
  args: {
    category: questionCategory,
    systemTypeId: v.optional(v.id("systemTypes")),
  },
  handler: async (ctx, args) => {
    if (args.systemTypeId) {
      return await ctx.db
        .query("technicianQuestions")
        .withIndex("by_systemType_category", (q) =>
          q.eq("systemTypeId", args.systemTypeId!).eq("category", args.category)
        )
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();
    }

    // Get both general and any (for when no specific system)
    const questions = await ctx.db
      .query("technicianQuestions")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return questions.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

/**
 * Get a single question
 */
export const getQuestion = query({
  args: {
    questionId: v.id("technicianQuestions"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.questionId);
  },
});

/**
 * Get all questions (for admin)
 */
export const getAllQuestions = query({
  args: {
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let questions = await ctx.db.query("technicianQuestions").collect();

    if (!args.includeInactive) {
      questions = questions.filter((q) => q.isActive);
    }

    return questions.sort((a, b) => {
      // Sort by category first, then by sortOrder
      if (a.category !== b.category) {
        const categoryOrder = [
          "qualification",
          "diagnosis",
          "options",
          "pricing",
          "warranty",
        ];
        return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
      }
      return a.sortOrder - b.sortOrder;
    });
  },
});

// ============================================
// ADMIN/SEED MUTATIONS
// ============================================

/**
 * Create a new question
 */
export const createQuestion = mutation({
  args: {
    systemTypeId: v.optional(v.id("systemTypes")),
    category: questionCategory,
    question: v.string(),
    whyAsk: v.optional(v.string()),
    goodAnswer: v.optional(v.string()),
    redFlag: v.optional(v.string()),
    followUpQuestions: v.optional(v.array(v.string())),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const questionId = await ctx.db.insert("technicianQuestions", {
      ...args,
      isActive: true,
    });
    return questionId;
  },
});

/**
 * Update a question
 */
export const updateQuestion = mutation({
  args: {
    questionId: v.id("technicianQuestions"),
    systemTypeId: v.optional(v.id("systemTypes")),
    category: v.optional(questionCategory),
    question: v.optional(v.string()),
    whyAsk: v.optional(v.string()),
    goodAnswer: v.optional(v.string()),
    redFlag: v.optional(v.string()),
    followUpQuestions: v.optional(v.array(v.string())),
    sortOrder: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { questionId, ...updates } = args;
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    await ctx.db.patch(args.questionId, cleanUpdates);
    return await ctx.db.get(args.questionId);
  },
});

/**
 * Delete a question (soft delete)
 */
export const deleteQuestion = mutation({
  args: {
    questionId: v.id("technicianQuestions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.questionId, { isActive: false });
    return true;
  },
});

/**
 * Bulk create questions (for seeding)
 */
export const bulkCreateQuestions = mutation({
  args: {
    questions: v.array(
      v.object({
        systemTypeId: v.optional(v.id("systemTypes")),
        category: questionCategory,
        question: v.string(),
        whyAsk: v.optional(v.string()),
        goodAnswer: v.optional(v.string()),
        redFlag: v.optional(v.string()),
        followUpQuestions: v.optional(v.array(v.string())),
        sortOrder: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const ids = [];
    for (const question of args.questions) {
      const id = await ctx.db.insert("technicianQuestions", {
        ...question,
        isActive: true,
      });
      ids.push(id);
    }
    return ids;
  },
});
