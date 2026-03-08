import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const loadKnowledgeBase = mutation({
  args: {
    articles: v.array(
      v.object({
        topic: v.string(),
        content: v.string(),
        keywords: v.array(v.string()),
        category: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const ids = [];
    for (const article of args.articles) {
      const id = await ctx.db.insert("supportKnowledgeBase", article);
      ids.push(id);
    }
    console.log(`[KB Loader] Inserted ${ids.length} knowledge base articles`);
    return { inserted: ids.length, ids };
  },
});
