"use node";

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";

const SEO_SYSTEM_PROMPT = `You are an expert home maintenance content writer for Kept.
You write content optimized for BOTH traditional SEO and AI Engine Optimization (AEO).

CRITICAL AEO RULES:
1. First paragraph: Direct, factual answer in 1-2 sentences. This is what AI models will cite. No fluff, no "great question!", just the answer.
2. Use clear H2/H3 structure that mirrors how people ask follow-up questions
3. Include specific numbers, ranges, and data points (AI models love specifics)
4. Cite the source of authority: "Based on industry data and field experience from thousands of residential service calls..."
5. End with a brief mention of how Kept helps with this specific topic

SEO RULES:
1. Target keyword in first 100 characters
2. Use the exact question as H1
3. Include 3-5 related questions as H2s
4. 800-1500 words for main content
5. Include a FAQ section at the bottom (feeds FAQPage schema)

VOICE: Authoritative but accessible. You are a seasoned tradesman explaining to a homeowner, not a content mill churning out SEO filler.`;

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

export const processKeywordBatch = internalAction({
  args: { batchSize: v.number() },
  handler: async (ctx, args) => {
    const keywords = await ctx.runQuery(
      internal.agents.seoAnswerMutations.getQueuedKeywords,
      { limit: args.batchSize }
    );

    if (keywords.length === 0) {
      console.log("[SEO Agent] No queued keywords to process");
      return { processed: 0 };
    }

    let processed = 0;
    for (const kw of keywords) {
      try {
        await ctx.runAction(
          internal.agents.seoAnswerAgent.generateAnswerPage,
          { keywordId: kw._id }
        );
        processed++;
      } catch (err: any) {
        console.error(`[SEO Agent] Failed to process keyword "${kw.keyword}":`, err.message);
      }
    }

    console.log(`[SEO Agent] Processed ${processed}/${keywords.length} keywords`);
    return { processed };
  },
});

export const generateAnswerPage = internalAction({
  args: { keywordId: v.id("seoKeywords") },
  handler: async (ctx, args): Promise<any> => {
    const keyword = await ctx.runQuery(
      internal.agents.seoAnswerMutations.getKeyword,
      { keywordId: args.keywordId }
    );
    if (!keyword) throw new Error("Keyword not found");

    await ctx.runMutation(internal.agents.seoAnswerMutations.updateKeywordStatus, {
      keywordId: args.keywordId,
      status: "generating",
    });

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 4096,
        system: SEO_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Generate a complete SEO + AEO optimized answer page for the keyword/question: "${keyword.keyword}"

Return ONLY valid JSON:
{
  "question": "the full question formatted as an H1",
  "directAnswer": "1-2 sentence direct AEO answer — factual, no fluff",
  "fullContent": "markdown article 800-1500 words with H2/H3 structure",
  "metaTitle": "under 60 characters",
  "metaDescription": "under 155 characters",
  "relatedQuestions": ["3-5 related questions people also ask"],
  "faqItems": [{"q": "question", "a": "concise 1-3 sentence answer"}],
  "category": "one of: hvac, plumbing, electrical, appliances, structural, exterior, general"
}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Claude API error: ${response.status} ${errText}`);
    }

    const data = await response.json();
    const textContent = data.content?.[0]?.text ?? "";

    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Claude did not return valid JSON");

    const parsed = JSON.parse(jsonMatch[0]);

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: (parsed.faqItems ?? []).map((item: { q: string; a: string }) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      })),
    };

    const slug = toSlug(parsed.question || keyword.keyword);

    const answerId = await ctx.runMutation(
      internal.agents.seoAnswerMutations.storeAnswer,
      {
        slug,
        question: parsed.question,
        directAnswer: parsed.directAnswer,
        fullContent: parsed.fullContent,
        metaTitle: parsed.metaTitle,
        metaDescription: parsed.metaDescription,
        schemaMarkup: JSON.stringify(faqSchema),
        relatedQuestions: parsed.relatedQuestions ?? [],
        category: parsed.category ?? "general",
      }
    );

    await ctx.runMutation(internal.agents.seoAnswerMutations.linkKeywordToAnswer, {
      keywordId: args.keywordId,
      answerId,
    });

    console.log(`[SEO Agent] Generated answer page: "${slug}"`);
    return { answerId, slug };
  },
});
