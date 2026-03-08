import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const seedKeywords = mutation({
  args: {
    keywords: v.array(
      v.object({
        keyword: v.string(),
        priority: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
      })
    ),
  },
  handler: async (ctx, args) => {
    const ids = [];
    for (const kw of args.keywords) {
      const id = await ctx.db.insert("seoKeywords", {
        keyword: kw.keyword,
        priority: kw.priority,
        status: "queued",
      });
      ids.push(id);
    }
    console.log(`[SEO Helpers] Seeded ${ids.length} keywords`);
    return { inserted: ids.length, ids };
  },
});
