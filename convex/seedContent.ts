"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { systemCategory } from "./schema";

/**
 * Orchestration script: generates all articles, diagnostics, and trees for all 4 categories.
 *
 * Usage:
 *   npx convex run --prod seedContent:generateAll
 *
 * This calls Anthropic ~100+ times. Estimated cost: ~$2-5 in API credits.
 * Each category is processed sequentially with delays to avoid rate limiting.
 */
export const generateAll = action({
  args: {},
  handler: async (ctx) => {
    const categories = ["hvac", "plumbing", "electrical", "appliances"] as const;
    const results: Record<string, { articles: unknown; diagnostics: unknown; trees: unknown }> = {};

    for (const category of categories) {
      console.log(`\n========== Generating content for: ${category.toUpperCase()} ==========\n`);

      // Generate articles (may take several minutes per category)
      console.log(`  [${category}] Generating articles...`);
      let articleResult;
      try {
        articleResult = await ctx.runAction(api.bulkGenerate.bulkGenerateArticles, {
          category,
        });
        console.log(`  [${category}] Articles: ${(articleResult as { generated: number }).generated} generated, ${(articleResult as { errors: string[] }).errors.length} errors`);
      } catch (err) {
        console.error(`  [${category}] Article generation failed:`, err);
        articleResult = { generated: 0, errors: [String(err)] };
      }

      await new Promise((r) => setTimeout(r, 3000));

      // Generate diagnostic issues
      console.log(`  [${category}] Generating diagnostic issues...`);
      let diagnosticResult;
      try {
        diagnosticResult = await ctx.runAction(api.bulkGenerate.bulkGenerateDiagnostics, {
          category,
        });
        console.log(`  [${category}] Diagnostics: ${(diagnosticResult as { generated: number }).generated} generated, ${(diagnosticResult as { errors: string[] }).errors.length} errors`);
      } catch (err) {
        console.error(`  [${category}] Diagnostic generation failed:`, err);
        diagnosticResult = { generated: 0, errors: [String(err)] };
      }

      await new Promise((r) => setTimeout(r, 3000));

      // Generate diagnostic trees
      console.log(`  [${category}] Generating diagnostic trees...`);
      let treeResult;
      try {
        treeResult = await ctx.runAction(api.bulkGenerate.bulkGenerateDiagnosticTrees, {
          category,
        });
        console.log(`  [${category}] Trees: ${(treeResult as { generated: number }).generated} generated, ${(treeResult as { errors: string[] }).errors.length} errors`);
      } catch (err) {
        console.error(`  [${category}] Tree generation failed:`, err);
        treeResult = { generated: 0, errors: [String(err)] };
      }

      results[category] = {
        articles: articleResult,
        diagnostics: diagnosticResult,
        trees: treeResult,
      };

      await new Promise((r) => setTimeout(r, 5000));
    }

    console.log("\n========== GENERATION COMPLETE ==========\n");
    return results;
  },
});

/**
 * Generate all content for a single category. Useful for retrying a specific category.
 *
 * Usage:
 *   npx convex run --prod seedContent:generateCategory '{"category":"hvac"}'
 */
export const generateCategory = action({
  args: {
    category: systemCategory,
  },
  handler: async (ctx, args): Promise<{ articles: unknown; diagnostics: unknown; trees: unknown }> => {
    console.log(`Generating all content for: ${args.category}`);

    const articles: unknown = await ctx.runAction(api.bulkGenerate.bulkGenerateArticles, {
      category: args.category,
    });

    await new Promise((r) => setTimeout(r, 3000));

    const diagnostics: unknown = await ctx.runAction(api.bulkGenerate.bulkGenerateDiagnostics, {
      category: args.category,
    });

    await new Promise((r) => setTimeout(r, 3000));

    const trees: unknown = await ctx.runAction(api.bulkGenerate.bulkGenerateDiagnosticTrees, {
      category: args.category,
    });

    return { articles, diagnostics, trees };
  },
});

/**
 * Generate articles in small batches (useful if hitting timeout limits).
 *
 * Usage:
 *   npx convex run --prod seedContent:generateArticleBatch '{"category":"hvac","startIndex":0,"count":5}'
 */
export const generateArticleBatch = action({
  args: {
    category: systemCategory,
    startIndex: v.number(),
    count: v.number(),
  },
  handler: async (ctx, args): Promise<unknown> => {
    return await ctx.runAction(api.bulkGenerate.bulkGenerateArticles, {
      category: args.category,
      startIndex: args.startIndex,
      count: args.count,
    });
  },
});
