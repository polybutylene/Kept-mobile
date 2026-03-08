import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";
import {
  knowledgeArticleType,
  knowledgeContentStatus,
  systemCategory,
  diagnosticNodeType,
} from "./schema";

// =====================================================
// ARTICLE QUERIES
// =====================================================

/**
 * Get article by slug
 */
export const getArticleBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const article = await ctx.db
      .query("knowledgeArticles")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .filter((q) => q.eq(q.field("status"), "published"))
      .first();

    if (!article) return null;

    // Get sections
    const sections = await ctx.db
      .query("knowledgeSections")
      .withIndex("by_article", (q) => q.eq("articleId", article._id))
      .collect();

    // Get related articles
    const relations = await ctx.db
      .query("knowledgeRelations")
      .withIndex("by_from", (q) => q.eq("fromArticleId", article._id))
      .collect();

    const relatedArticles = await Promise.all(
      relations.map(async (rel) => {
        const related = await ctx.db.get(rel.toArticleId);
        if (!related || related.status !== "published") return null;
        return {
          ...related,
          relationType: rel.relationType,
        };
      })
    );

    // Get system type info if linked
    let systemType = null;
    if (article.systemTypeId) {
      systemType = await ctx.db.get(article.systemTypeId);
    }

    // Increment view count (fire and forget)
    // In production, batch this or use a separate analytics system

    return {
      ...article,
      sections: sections.sort((a, b) => a.order - b.order),
      relatedArticles: relatedArticles.filter(Boolean),
      systemType,
    };
  },
});

/**
 * Get article by ID
 */
export const getArticle = query({
  args: {
    articleId: v.id("knowledgeArticles"),
  },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.articleId);
    if (!article) return null;

    const sections = await ctx.db
      .query("knowledgeSections")
      .withIndex("by_article", (q) => q.eq("articleId", args.articleId))
      .collect();

    return {
      ...article,
      sections: sections.sort((a, b) => a.order - b.order),
    };
  },
});

/**
 * List articles by type/category
 */
export const listArticles = query({
  args: {
    articleType: v.optional(knowledgeArticleType),
    systemCategory: v.optional(systemCategory),
    systemTypeId: v.optional(v.id("systemTypes")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let articles;

    if (args.systemTypeId) {
      articles = await ctx.db
        .query("knowledgeArticles")
        .withIndex("by_systemType", (q) => q.eq("systemTypeId", args.systemTypeId))
        .filter((q) => q.eq(q.field("status"), "published"))
        .collect();
    } else if (args.systemCategory) {
      articles = await ctx.db
        .query("knowledgeArticles")
        .withIndex("by_category", (q) => q.eq("systemCategory", args.systemCategory))
        .filter((q) => q.eq(q.field("status"), "published"))
        .collect();
    } else if (args.articleType) {
      const articleType = args.articleType;
      articles = await ctx.db
        .query("knowledgeArticles")
        .withIndex("by_type", (q) => q.eq("articleType", articleType))
        .filter((q) => q.eq(q.field("status"), "published"))
        .collect();
    } else {
      articles = await ctx.db
        .query("knowledgeArticles")
        .withIndex("by_status", (q) => q.eq("status", "published"))
        .collect();
    }

    // Apply additional filters
    if (args.articleType && args.systemCategory) {
      articles = articles.filter((a) => a.articleType === args.articleType);
    }

    // Sort by view count (popularity)
    articles = articles.sort((a, b) => b.viewCount - a.viewCount);

    return args.limit ? articles.slice(0, args.limit) : articles;
  },
});

/**
 * Search articles
 */
export const searchArticles = query({
  args: {
    query: v.string(),
    articleType: v.optional(knowledgeArticleType),
    systemCategory: v.optional(systemCategory),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let searchQuery = ctx.db
      .query("knowledgeArticles")
      .withSearchIndex("search_articles", (q) => {
        let search = q.search("title", args.query);
        if (args.articleType) {
          search = search.eq("articleType", args.articleType);
        }
        if (args.systemCategory) {
          search = search.eq("systemCategory", args.systemCategory);
        }
        search = search.eq("status", "published");
        return search;
      });

    const results = await searchQuery.take(args.limit || 20);
    return results;
  },
});

/**
 * Get guides for a specific task template
 */
export const getGuidesForTask = query({
  args: {
    taskTemplateId: v.id("maintenanceTaskTemplates"),
  },
  handler: async (ctx, args) => {
    const articles = await ctx.db
      .query("knowledgeArticles")
      .withIndex("by_taskTemplate", (q) => q.eq("taskTemplateId", args.taskTemplateId))
      .filter((q) => q.eq(q.field("status"), "published"))
      .collect();

    return articles;
  },
});

/**
 * Get guides for a system type
 */
export const getGuidesForSystemType = query({
  args: {
    systemTypeId: v.id("systemTypes"),
  },
  handler: async (ctx, args) => {
    const articles = await ctx.db
      .query("knowledgeArticles")
      .withIndex("by_systemType", (q) => q.eq("systemTypeId", args.systemTypeId))
      .filter((q) => q.eq(q.field("status"), "published"))
      .collect();

    // Group by type
    const guides = articles.filter((a) => a.articleType === "guide");
    const diagnostics = articles.filter((a) => a.articleType === "diagnostic");
    const explainers = articles.filter((a) => a.articleType === "explainer");
    const safety = articles.filter((a) => a.articleType === "safety");

    return { guides, diagnostics, explainers, safety };
  },
});

// =====================================================
// DIAGNOSTIC TREE QUERIES
// =====================================================

/**
 * Get diagnostic tree by slug
 */
export const getDiagnosticTree = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const tree = await ctx.db
      .query("diagnosticTrees")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .filter((q) => q.eq(q.field("status"), "published"))
      .first();

    if (!tree) return null;

    const nodes = await ctx.db
      .query("diagnosticNodes")
      .withIndex("by_tree", (q) => q.eq("treeId", tree._id))
      .collect();

    // Build node map for easy navigation
    const nodeMap: Record<string, any> = {};
    for (const node of nodes) {
      nodeMap[node.nodeKey] = node;
    }

    return {
      ...tree,
      nodes,
      nodeMap,
      startNode: nodeMap["start"] || nodes[0],
    };
  },
});

/**
 * List diagnostic trees for a category
 */
export const listDiagnosticTrees = query({
  args: {
    systemCategory: v.optional(systemCategory),
    systemTypeId: v.optional(v.id("systemTypes")),
  },
  handler: async (ctx, args) => {
    let trees;

    if (args.systemTypeId) {
      trees = await ctx.db
        .query("diagnosticTrees")
        .withIndex("by_systemType", (q) => q.eq("systemTypeId", args.systemTypeId))
        .filter((q) => q.eq(q.field("status"), "published"))
        .collect();
    } else if (args.systemCategory) {
      trees = await ctx.db
        .query("diagnosticTrees")
        .withIndex("by_category", (q) => q.eq("systemCategory", args.systemCategory))
        .filter((q) => q.eq(q.field("status"), "published"))
        .collect();
    } else {
      trees = await ctx.db
        .query("diagnosticTrees")
        .withIndex("by_status", (q) => q.eq("status", "published"))
        .collect();
    }

    return trees;
  },
});

// =====================================================
// CONTENT MUTATIONS
// =====================================================

/**
 * Create or update an article
 */
export const upsertArticle = mutation({
  args: {
    id: v.optional(v.id("knowledgeArticles")),
    slug: v.string(),
    articleType: knowledgeArticleType,
    systemTypeId: v.optional(v.id("systemTypes")),
    systemCategory: v.optional(systemCategory),
    taskTemplateId: v.optional(v.id("maintenanceTaskTemplates")),
    title: v.string(),
    subtitle: v.optional(v.string()),
    summary: v.string(),
    contentMarkdown: v.string(),
    difficulty: v.optional(
      v.union(
        v.literal("beginner"),
        v.literal("intermediate"),
        v.literal("advanced"),
        v.literal("pro_only")
      )
    ),
    estimatedReadMinutes: v.optional(v.number()),
    estimatedTaskMinutes: v.optional(v.number()),
    toolsRequired: v.optional(v.array(v.string())),
    partsRequired: v.optional(v.array(v.string())),
    safetyWarnings: v.optional(v.array(v.string())),
    keywords: v.optional(v.array(v.string())),
    // Layered depth
    quickSkim: v.optional(v.array(v.string())),
    deepDiveContent: v.optional(v.object({
      whyItMatters: v.string(),
      scienceBehind: v.optional(v.string()),
      failureModes: v.optional(v.array(v.string())),
      proTips: v.optional(v.array(v.string())),
    })),
    // Seasonal
    seasonPreference: v.optional(v.union(
      v.literal("spring"),
      v.literal("summer"),
      v.literal("fall"),
      v.literal("winter"),
      v.literal("any")
    )),
    optimalMonths: v.optional(v.array(v.number())),
    status: v.optional(knowledgeContentStatus),
    sourceUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (args.id) {
      // Update existing
      const existing = await ctx.db.get(args.id);
      if (!existing) throw new Error("Article not found");

      const { id, ...updates } = args;
      await ctx.db.patch(id, {
        ...updates,
        version: existing.version + 1,
      });
      return { articleId: id };
    } else {
      // Create new
      const profile = userId
        ? await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .first()
        : null;

      const articleId = await ctx.db.insert("knowledgeArticles", {
        slug: args.slug,
        articleType: args.articleType,
        systemTypeId: args.systemTypeId,
        systemCategory: args.systemCategory,
        taskTemplateId: args.taskTemplateId,
        title: args.title,
        subtitle: args.subtitle,
        summary: args.summary,
        contentMarkdown: args.contentMarkdown,
        difficulty: args.difficulty,
        estimatedReadMinutes: args.estimatedReadMinutes,
        estimatedTaskMinutes: args.estimatedTaskMinutes,
        toolsRequired: args.toolsRequired,
        partsRequired: args.partsRequired,
        safetyWarnings: args.safetyWarnings,
        keywords: args.keywords,
        quickSkim: args.quickSkim,
        deepDiveContent: args.deepDiveContent,
        seasonPreference: args.seasonPreference,
        optimalMonths: args.optimalMonths,
        status: args.status || "draft",
        version: 1,
        authorId: profile?._id,
        sourceUrl: args.sourceUrl,
        viewCount: 0,
        helpfulCount: 0,
        notHelpfulCount: 0,
      });
      return { articleId };
    }
  },
});

/**
 * Add/update article sections
 */
export const upsertSection = mutation({
  args: {
    id: v.optional(v.id("knowledgeSections")),
    articleId: v.id("knowledgeArticles"),
    order: v.number(),
    heading: v.string(),
    slug: v.string(),
    contentMarkdown: v.string(),
    isCollapsible: v.optional(v.boolean()),
    defaultExpanded: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (args.id) {
      const { id, ...updates } = args;
      await ctx.db.patch(id, updates);
      return { sectionId: id };
    } else {
      const sectionId = await ctx.db.insert("knowledgeSections", {
        articleId: args.articleId,
        order: args.order,
        heading: args.heading,
        slug: args.slug,
        contentMarkdown: args.contentMarkdown,
        isCollapsible: args.isCollapsible ?? false,
        defaultExpanded: args.defaultExpanded ?? true,
      });
      return { sectionId };
    }
  },
});

/**
 * Create diagnostic tree with nodes
 */
export const createDiagnosticTree = mutation({
  args: {
    slug: v.string(),
    systemTypeId: v.optional(v.id("systemTypes")),
    systemCategory: v.optional(systemCategory),
    title: v.string(),
    description: v.string(),
    entrySymptom: v.string(),
    nodes: v.array(
      v.object({
        nodeKey: v.string(),
        nodeType: diagnosticNodeType,
        title: v.string(),
        contentMarkdown: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
        videoUrl: v.optional(v.string()),
        options: v.optional(
          v.array(
            v.object({
              label: v.string(),
              nextNodeKey: v.string(),
              explanation: v.optional(v.string()),
            })
          )
        ),
        diagnosisCode: v.optional(v.string()),
        severity: v.optional(
          v.union(
            v.literal("minor"),
            v.literal("moderate"),
            v.literal("serious"),
            v.literal("critical")
          )
        ),
        recommendedAction: v.optional(v.string()),
        estimatedCost: v.optional(
          v.object({
            diyLow: v.number(),
            diyHigh: v.number(),
            proLow: v.number(),
            proHigh: v.number(),
          })
        ),
        shouldCallPro: v.optional(v.boolean()),
        proSpecialty: v.optional(v.string()),
        urgency: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const treeId = await ctx.db.insert("diagnosticTrees", {
      slug: args.slug,
      systemTypeId: args.systemTypeId,
      systemCategory: args.systemCategory,
      title: args.title,
      description: args.description,
      entrySymptom: args.entrySymptom,
      status: "draft",
      version: 1,
      completionCount: 0,
    });

    // Insert all nodes
    for (const node of args.nodes) {
      await ctx.db.insert("diagnosticNodes", {
        treeId,
        nodeKey: node.nodeKey,
        nodeType: node.nodeType,
        title: node.title,
        contentMarkdown: node.contentMarkdown,
        imageUrl: node.imageUrl,
        videoUrl: node.videoUrl,
        options: node.options,
        diagnosisCode: node.diagnosisCode,
        severity: node.severity,
        recommendedAction: node.recommendedAction,
        estimatedCost: node.estimatedCost,
        shouldCallPro: node.shouldCallPro,
        proSpecialty: node.proSpecialty,
        urgency: node.urgency,
      });
    }

    return { treeId };
  },
});

/**
 * Record article view
 */
export const recordView = mutation({
  args: {
    articleId: v.id("knowledgeArticles"),
  },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.articleId);
    if (!article) return;

    await ctx.db.patch(args.articleId, {
      viewCount: article.viewCount + 1,
    });
  },
});

/**
 * Submit feedback on an article
 */
export const submitFeedback = mutation({
  args: {
    articleId: v.id("knowledgeArticles"),
    wasHelpful: v.boolean(),
    feedbackText: v.optional(v.string()),
    contextTaskId: v.optional(v.id("scheduledMaintenance")),
    contextSystemId: v.optional(v.id("systems")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    let profile = null;
    if (userId) {
      profile = await ctx.db
        .query("userProfiles")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .first();
    }

    await ctx.db.insert("knowledgeFeedback", {
      articleId: args.articleId,
      userId: profile?._id,
      wasHelpful: args.wasHelpful,
      feedbackText: args.feedbackText,
      contextTaskId: args.contextTaskId,
      contextSystemId: args.contextSystemId,
    });

    // Update article counts
    const article = await ctx.db.get(args.articleId);
    if (article) {
      await ctx.db.patch(args.articleId, {
        helpfulCount: article.helpfulCount + (args.wasHelpful ? 1 : 0),
        notHelpfulCount: article.notHelpfulCount + (args.wasHelpful ? 0 : 1),
      });
    }

    return { success: true };
  },
});

/**
 * Record diagnostic completion
 */
export const recordDiagnosticCompletion = mutation({
  args: {
    treeId: v.id("diagnosticTrees"),
    stepsCount: v.number(),
    resultNodeKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const tree = await ctx.db.get(args.treeId);
    if (!tree) return;

    const newCount = tree.completionCount + 1;
    const currentAvg = tree.avgStepsToResolution || args.stepsCount;
    const newAvg = (currentAvg * tree.completionCount + args.stepsCount) / newCount;

    await ctx.db.patch(args.treeId, {
      completionCount: newCount,
      avgStepsToResolution: newAvg,
    });
  },
});

// =====================================================
// DIAGNOSTIC ISSUES MUTATIONS / QUERIES
// =====================================================

/**
 * Upsert a diagnostic issue (for bulk generation)
 */
export const upsertDiagnosticIssue = mutation({
  args: {
    issueId: v.string(),
    systemCategory: systemCategory,
    symptom: v.string(),
    description: v.string(),
    understanding: v.object({
      whatItIs: v.string(),
      howItWorks: v.string(),
      keyComponents: v.optional(v.array(v.string())),
      healthFactorNote: v.optional(v.string()),
    }),
    possibleCauses: v.array(v.object({
      title: v.string(),
      likelihood: v.union(v.literal("High"), v.literal("Moderate"), v.literal("Low")),
      likelihoodPercent: v.number(),
      expectedCostLow: v.number(),
      expectedCostHigh: v.number(),
      diyCheck: v.string(),
    })),
    diySteps: v.object({
      title: v.string(),
      steps: v.array(v.string()),
      stopCondition: v.string(),
    }),
    safetyWarnings: v.array(v.string()),
    redFlags: v.array(v.string()),
    pricingReference: v.object({
      region: v.string(),
      repairLow: v.number(),
      repairHigh: v.number(),
      replaceLow: v.number(),
      replaceHigh: v.number(),
    }),
    seasonPreference: v.optional(v.union(
      v.literal("spring"),
      v.literal("summer"),
      v.literal("fall"),
      v.literal("winter"),
      v.literal("any")
    )),
  },
  handler: async (ctx, args) => {
    // Check if exists
    const existing = await ctx.db
      .query("diagnosticIssues")
      .withIndex("by_issueId", (q) => q.eq("issueId", args.issueId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        status: "published",
      });
      return { id: existing._id };
    } else {
      const id = await ctx.db.insert("diagnosticIssues", {
        ...args,
        status: "published",
      });
      return { id };
    }
  },
});

/**
 * List diagnostic issues by category
 */
export const listDiagnosticIssues = query({
  args: {
    systemCategory: v.optional(systemCategory),
  },
  handler: async (ctx, args) => {
    if (args.systemCategory) {
      return await ctx.db
        .query("diagnosticIssues")
        .withIndex("by_category", (q) => q.eq("systemCategory", args.systemCategory!))
        .filter((q) => q.eq(q.field("status"), "published"))
        .collect();
    }
    return await ctx.db
      .query("diagnosticIssues")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();
  },
});

/**
 * Get a single diagnostic issue by issueId
 */
export const getDiagnosticIssue = query({
  args: {
    issueId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("diagnosticIssues")
      .withIndex("by_issueId", (q) => q.eq("issueId", args.issueId))
      .first();
  },
});

/**
 * List articles by season
 */
export const listArticlesBySeason = query({
  args: {
    seasonPreference: v.union(
      v.literal("spring"),
      v.literal("summer"),
      v.literal("fall"),
      v.literal("winter"),
      v.literal("any")
    ),
    articleType: v.optional(knowledgeArticleType),
  },
  handler: async (ctx, args) => {
    let articles = await ctx.db
      .query("knowledgeArticles")
      .withIndex("by_season", (q) => q.eq("seasonPreference", args.seasonPreference))
      .filter((q) => q.eq(q.field("status"), "published"))
      .collect();

    if (args.articleType) {
      articles = articles.filter((a) => a.articleType === args.articleType);
    }

    return articles;
  },
});

// ============================================================
// Cross-reference: Get related care tasks for a diagnostic node
// ============================================================

/**
 * Get care tasks linked to diagnostic tree nodes
 * via the relatedCareTaskKey field on diagnosticNodes
 */
export const getRelatedCareTasks = query({
  args: {
    diagnosticTreeId: v.id("diagnosticTrees"),
    nodeKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Get all nodes for this tree
    const nodes = await ctx.db
      .query("diagnosticNodes")
      .withIndex("by_tree", (q) => q.eq("treeId", args.diagnosticTreeId))
      .collect();

    // Filter to nodes with care task links
    const linkedNodes = args.nodeKey
      ? nodes.filter(
          (n) => n.nodeKey === args.nodeKey && n.relatedCareTaskKey
        )
      : nodes.filter((n) => n.relatedCareTaskKey);

    if (linkedNodes.length === 0) return [];

    // Look up the care tasks by key
    const tasks = [];
    for (const node of linkedNodes) {
      if (!node.relatedCareTaskKey) continue;
      const task = await ctx.db
        .query("maintenanceTasks")
        .withIndex("by_key", (q) => q.eq("key", node.relatedCareTaskKey!))
        .first();
      if (task) {
        tasks.push({
          ...task,
          linkedFromNodeKey: node.nodeKey,
          linkedFromNodeTitle: node.title,
        });
      }
    }

    return tasks;
  },
});

// AI-powered content enrichment actions are in knowledgeActions.ts
