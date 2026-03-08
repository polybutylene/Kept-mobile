"use node";

import { internalAction } from "../_generated/server";
import { api, internal } from "../_generated/api";

export const testSocialGeneration = internalAction({
  args: {},
  handler: async (ctx): Promise<any> => {
    console.log("[Test] Starting social content generation test...");

    try {
      const result = await ctx.runAction(
        internal.agents.socialContentAgent.generateWeeklyContent,
        { theme: "spring maintenance tips" }
      );

      console.log(`[Test] Social generation complete — ${result.postsCreated} posts created`);
      return { success: true, postsCreated: result.postsCreated };
    } catch (err: any) {
      console.error("[Test] Social generation failed:", err.message);
      return { success: false, error: err.message };
    }
  },
});

export const testAnswerGeneration = internalAction({
  args: {},
  handler: async (ctx): Promise<any> => {
    console.log("[Test] Starting answer page generation test...");

    try {
      await ctx.runMutation(api.agents.seoAnswerHelpers.seedKeywords, {
        keywords: [
          { keyword: "how long does a water heater last", priority: "high" as const },
          { keyword: "when to replace hvac system", priority: "high" as const },
          { keyword: "signs your roof needs replacement", priority: "medium" as const },
        ],
      });
      console.log("[Test] Seeded 3 test keywords");

      const result = await ctx.runAction(
        internal.agents.seoAnswerAgent.processKeywordBatch,
        { batchSize: 1 }
      );

      console.log(`[Test] Answer generation complete — ${result.processed} pages processed`);
      return { success: true, processed: result.processed };
    } catch (err: any) {
      console.error("[Test] Answer generation failed:", err.message);
      return { success: false, error: err.message };
    }
  },
});

export const testReelScript = internalAction({
  args: {},
  handler: async (ctx): Promise<any> => {
    console.log("[Test] Starting reel script generation test...");

    try {
      const result = await ctx.runAction(
        internal.agents.reelAgent.generateReelScript,
        { topic: "water heater lifespan", style: "educational" }
      );

      console.log("[Test] Reel script generated:");
      console.log(JSON.stringify(result.script, null, 2));
      return { success: true, projectId: result.projectId, script: result.script };
    } catch (err: any) {
      console.error("[Test] Reel script failed:", err.message);
      return { success: false, error: err.message };
    }
  },
});

export const testSupportBot = internalAction({
  args: {},
  handler: async (ctx): Promise<any> => {
    console.log("[Test] Starting support bot test...");

    try {
      await ctx.runMutation(api.agents.supportKBLoader.loadKnowledgeBase, {
        articles: [
          {
            topic: "Health Points System",
            content:
              "Health Points (HP) are Kept's proprietary scoring system that rates the condition of your home systems on a 0-100 scale. " +
              "Each system starts at 100 HP and naturally decays over time based on its age and expected lifespan using Weibull distribution modeling. " +
              "Completing maintenance tasks earns back HP, while skipping tasks causes faster decay. " +
              "Your overall Home HP is a weighted average of all system scores. " +
              "A score above 80 means your home is in great shape. 50-80 means some systems need attention. Below 50 means critical maintenance is overdue.",
            keywords: ["health points", "HP", "score", "home health", "system health"],
            category: "general",
          },
        ],
      });
      console.log("[Test] KB article inserted");

      const testUserId = await ctx.runQuery(
        internal.agents.testHelpers.getAnyUserId,
        {}
      );

      if (!testUserId) {
        console.log("[Test] No users found in the system — skipping support bot test");
        return { success: false, error: "No users found" };
      }

      const result = await ctx.runAction(
        api.agents.supportAgent.handleSupportMessage,
        {
          userId: testUserId,
          message: "What are Health Points and how do they work?",
        }
      );

      console.log("[Test] Support bot response:");
      console.log(result.response);
      console.log(`[Test] Category: ${result.category}, Escalated: ${result.escalate}`);
      return { success: true, response: result.response, category: result.category };
    } catch (err: any) {
      console.error("[Test] Support bot failed:", err.message);
      return { success: false, error: err.message };
    }
  },
});
