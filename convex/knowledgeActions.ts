"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import OpenAI from "openai";
import {
  knowledgeArticleType,
  systemCategory,
} from "./schema";
import { knowledgeContentStatus } from "./schema";

const DEBUG_ENDPOINT =
  "http://127.0.0.1:7242/ingest/828c3aee-4e4e-49e8-a13e-49765d288d33";

const debugLog = (payload: Record<string, unknown>) => {
  // #region agent log
  fetch(DEBUG_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {});
  // #endregion
};

// Lazy-initialize OpenAI client to avoid deployment errors when key is not set
let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI();
  }
  return _openai;
}

// =====================================================
// CONTENT ENRICHMENT ACTIONS (OpenAI Integration)
// =====================================================

/**
 * System prompts for different enrichment types
 */
const ENRICHMENT_PROMPTS: Record<string, string> = {
  expand_sections: `You are an expert home maintenance writer creating Wikipedia-level depth content.
Given an article about home maintenance, expand it with additional detailed sections.
Focus on:
- Technical background and how things work
- Step-by-step procedures with precise details
- Common variations and edge cases
- Historical context where relevant
- Scientific principles behind the maintenance

Output valid markdown with ## headings for new sections.`,

  add_safety_warnings: `You are a home safety expert.
Review this home maintenance article and generate comprehensive safety warnings.
Include:
- Personal protective equipment needed
- Electrical/gas/water shutoff procedures
- Chemical hazards and proper ventilation
- When to stop and call a professional
- Common injuries and how to prevent them
- Tool safety tips

Output as a JSON array of warning strings.`,

  generate_troubleshooting: `You are an expert home repair diagnostician.
Based on this article, generate a troubleshooting FAQ section.
Include:
- Common problems and their solutions
- "If X happens, then Y" diagnostic patterns
- Quick fixes vs when professional help is needed
- Cost estimates for common repairs

Output valid markdown with ### headings for each problem.`,

  add_pro_tips: `You are a seasoned home maintenance professional with 20+ years experience.
Add insider "pro tips" to this article that homeowners wouldn't typically know.
Include:
- Time-saving shortcuts
- Money-saving alternatives
- Quality indicators to look for
- Common mistakes professionals see
- Industry secrets and best practices
- Tool recommendations from experience

Output valid markdown with a "## Pro Tips" section containing bullet points.`,
};

// Type for article data from getArticle query
interface ArticleData {
  _id: string;
  title: string;
  subtitle?: string;
  summary: string;
  contentMarkdown: string;
  articleType: string;
  systemCategory?: string;
  safetyWarnings?: string[];
  sections?: Array<{ _id: string; heading: string; contentMarkdown: string; order: number }>;
}

/**
 * Enrich article content using OpenAI GPT-4
 */
export const enrichArticleContent = action({
  args: {
    articleId: v.id("knowledgeArticles"),
    enrichmentType: v.union(
      v.literal("expand_sections"),
      v.literal("add_safety_warnings"),
      v.literal("generate_troubleshooting"),
      v.literal("add_pro_tips")
    ),
  },
  handler: async (ctx, args): Promise<{
    enrichmentType: string;
    originalTitle: string;
    suggestedAdditions: Array<{ type: string; heading?: string; content: string }>;
    rawContent: string;
    model: string;
    timestamp: number;
  }> => {
    // Get current article
    const article = await ctx.runQuery(api.knowledge.getArticle, {
      articleId: args.articleId,
    }) as ArticleData | null;

    if (!article) {
      throw new Error("Article not found");
    }

    const systemPrompt = ENRICHMENT_PROMPTS[args.enrichmentType];

    // Call OpenAI GPT-4
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 4096,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Please enrich this article:

Title: ${article.title}
${article.subtitle ? `Subtitle: ${article.subtitle}` : ""}
Category: ${article.systemCategory || "general"}

Current Content:
${article.contentMarkdown}

${article.safetyWarnings?.length ? `Existing Safety Warnings:\n${article.safetyWarnings.join("\n")}` : ""}

Please provide the enriched content for "${args.enrichmentType}".`,
        },
      ],
    });

    // Extract text content from response
    const generatedContent = response.choices[0]?.message?.content || "";

    // Parse response based on enrichment type
    let suggestedAdditions: Array<{ type: string; heading?: string; content: string }> = [];

    if (args.enrichmentType === "add_safety_warnings") {
      // Try to parse as JSON array
      try {
        const warnings = JSON.parse(generatedContent);
        suggestedAdditions = [
          {
            type: "safety_warnings",
            content: Array.isArray(warnings) ? warnings.join("\n") : generatedContent,
          },
        ];
      } catch {
        // If not valid JSON, treat as markdown list
        suggestedAdditions = [
          {
            type: "safety_warnings",
            content: generatedContent,
          },
        ];
      }
    } else {
      // For markdown content, split by ## headings
      const sections = generatedContent.split(/(?=^## )/m).filter(Boolean);
      suggestedAdditions = sections.map((section) => {
        const headingMatch = section.match(/^## (.+)/);
        return {
          type: "section",
          heading: headingMatch ? headingMatch[1].trim() : "Additional Content",
          content: section,
        };
      });
    }

    return {
      enrichmentType: args.enrichmentType,
      originalTitle: article.title,
      suggestedAdditions,
      rawContent: generatedContent,
      model: "gpt-4o-mini",
      timestamp: Date.now(),
    };
  },
});

/**
 * Generate a complete article from a topic using OpenAI GPT-4
 */
export const generateArticle = action({
  args: {
    topic: v.string(),
    articleType: knowledgeArticleType,
    systemCategory: v.optional(systemCategory),
    difficulty: v.optional(
      v.union(
        v.literal("beginner"),
        v.literal("intermediate"),
        v.literal("advanced"),
        v.literal("pro_only")
      )
    ),
  },
  handler: async (ctx, args) => {
    const systemPrompt = `You are an expert home maintenance content writer creating Wikipedia-level depth articles.
Your articles should be:
- Comprehensive and authoritative
- Written for homeowners (${args.difficulty || "beginner"} level)
- Include step-by-step instructions where applicable
- Include safety warnings prominently
- Include cost estimates (DIY vs professional)
- Include time estimates
- Well-structured with clear headings
- Include tables where useful for comparison

Output format (JSON):
{
  "title": "Article title",
  "subtitle": "Optional subtitle",
  "summary": "1-2 sentence summary",
  "contentMarkdown": "Full markdown content",
  "difficulty": "beginner|intermediate|advanced|pro_only",
  "estimatedReadMinutes": number,
  "estimatedTaskMinutes": number (if applicable),
  "toolsRequired": ["tool1", "tool2"],
  "partsRequired": ["part1", "part2"],
  "safetyWarnings": ["warning1", "warning2"],
  "keywords": ["keyword1", "keyword2"]
}`;

    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 8192,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Create a comprehensive ${args.articleType} article about: "${args.topic}"
${args.systemCategory ? `Category: ${args.systemCategory}` : ""}
${args.difficulty ? `Target difficulty: ${args.difficulty}` : ""}

Please output valid JSON matching the specified format.`,
        },
      ],
    });

    const generatedText = response.choices[0]?.message?.content || "{}";

    // Parse the JSON response
    let articleData;
    try {
      articleData = JSON.parse(generatedText);
    } catch (e) {
      throw new Error(`Failed to parse AI response as JSON: ${e}`);
    }

    return {
      ...articleData,
      articleType: args.articleType,
      systemCategory: args.systemCategory,
      slug: articleData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
      model: "gpt-4o-mini",
      timestamp: Date.now(),
    };
  },
});

/**
 * Generate a deep-dive article from a topic using Anthropic Claude
 */
export const generateDeepDiveArticle = action({
  args: {
    topic: v.string(),
    articleType: knowledgeArticleType,
    systemCategory: v.optional(systemCategory),
    difficulty: v.optional(
      v.union(
        v.literal("beginner"),
        v.literal("intermediate"),
        v.literal("advanced"),
        v.literal("pro_only")
      )
    ),
    status: v.optional(knowledgeContentStatus),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    articleId: string;
    slug: string;
    model: string;
    timestamp: number;
  }> => {
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
      throw new Error("ANTHROPIC_API_KEY is not set");
    }

    const prompt = `You are a home maintenance technical author writing Wikipedia-level depth guides for the Kept home intelligence platform.
Write with comprehensive, authoritative detail for homeowners. Be precise and practical.
You MUST produce layered content: a quick-skim layer, a full article, and a deep-dive layer.

Output format — respond with ONLY valid JSON, no markdown fencing:
{
  "title": "Article title (clear, descriptive)",
  "subtitle": "Concise subtitle or tagline",
  "summary": "1-2 sentence overview suitable for card previews",
  "quickSkim": [
    "3-5 actionable bullet points that give the reader the key takeaways in 15 seconds",
    "Each bullet should be a complete, useful sentence",
    "Focus on what to do, when, and why it matters"
  ],
  "contentMarkdown": "Full Wikipedia-depth markdown article. Use ## and ### headings. Include step-by-step procedures with numbered lists, comparison tables where helpful, cost estimates (DIY vs pro), time estimates, and tool/parts lists. Aim for 1500-2500 words. Be specific — include actual temperatures, measurements, part numbers where relevant.",
  "deepDiveContent": {
    "whyItMatters": "2-3 paragraphs explaining the real-world impact of this topic on home health, safety, and finances. Include statistics or data points where possible.",
    "scienceBehind": "Technical explanation of the underlying science/engineering. Why does this system work this way? What are the physics/chemistry involved?",
    "failureModes": ["Common failure mode 1 with description", "Failure mode 2", "Failure mode 3"],
    "proTips": ["Insider tip from experienced technicians", "Money-saving shortcut", "Quality indicator to look for", "Common DIY mistake to avoid"]
  },
  "difficulty": "beginner|intermediate|advanced|pro_only",
  "estimatedReadMinutes": number,
  "estimatedTaskMinutes": number,
  "toolsRequired": ["specific tool 1", "specific tool 2"],
  "partsRequired": ["specific part 1 with size/spec", "part 2"],
  "safetyWarnings": ["Specific safety warning 1", "Warning 2"],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "seasonPreference": "spring|summer|fall|winter|any",
  "optimalMonths": [3, 4, 5]
}

IMPORTANT RULES:
- seasonPreference: Pick the single best season. Use "any" only if truly year-round.
- optimalMonths: Array of 1-12 month numbers when this task is most relevant.
- contentMarkdown MUST be substantial (1500+ words) with real procedures, not vague summaries.
- quickSkim MUST be 3-5 bullets, each a complete actionable sentence.
- All cost estimates should use realistic 2025 US national averages.

Topic: ${args.topic}
Article type: ${args.articleType}
System category: ${args.systemCategory || "general"}
Target difficulty: ${args.difficulty || "beginner"}`;

    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8192,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!anthropicResponse.ok) {
      const errText = await anthropicResponse.text();
      throw new Error(`Anthropic error: ${anthropicResponse.status} ${errText}`);
    }

    const anthropicJson = await anthropicResponse.json();
    const rawText = anthropicJson?.content?.[0]?.text || "{}";
    // Strip markdown code fencing if present
    const content = rawText.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");

    let articleData: Record<string, unknown>;
    try {
      articleData = JSON.parse(content);
    } catch (err) {
      throw new Error(`Failed to parse Anthropic JSON: ${String(err)}`);
    }

    const toNumber = (val: unknown) =>
      typeof val === "number" ? val : Number.isFinite(Number(val)) ? Number(val) : undefined;
    const toStringArray = (val: unknown) =>
      Array.isArray(val) ? val.filter((item) => typeof item === "string") : undefined;
    const toNumberArray = (val: unknown) =>
      Array.isArray(val) ? val.filter((item) => typeof item === "number") : undefined;

    // Validate seasonPreference
    const validSeasons = ["spring", "summer", "fall", "winter", "any"];
    const season = typeof articleData.seasonPreference === "string" && validSeasons.includes(articleData.seasonPreference)
      ? articleData.seasonPreference as "spring" | "summer" | "fall" | "winter" | "any"
      : "any";

    // Validate deepDiveContent
    let deepDiveContent: { whyItMatters: string; scienceBehind?: string; failureModes?: string[]; proTips?: string[] } | undefined;
    if (articleData.deepDiveContent && typeof articleData.deepDiveContent === "object") {
      const dd = articleData.deepDiveContent as Record<string, unknown>;
      if (typeof dd.whyItMatters === "string") {
        deepDiveContent = {
          whyItMatters: dd.whyItMatters,
          scienceBehind: typeof dd.scienceBehind === "string" ? dd.scienceBehind : undefined,
          failureModes: toStringArray(dd.failureModes),
          proTips: toStringArray(dd.proTips),
        };
      }
    }

    const title = String(articleData.title || args.topic || "Untitled");
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const result: { articleId: string } = await ctx.runMutation(
      api.knowledge.upsertArticle,
      {
        slug,
        articleType: args.articleType,
        systemCategory: args.systemCategory,
        title,
        subtitle:
          typeof articleData.subtitle === "string" ? (articleData.subtitle as string) : undefined,
        summary: typeof articleData.summary === "string" ? (articleData.summary as string) : "",
        contentMarkdown:
          typeof articleData.contentMarkdown === "string"
            ? (articleData.contentMarkdown as string)
            : "",
        difficulty:
          typeof articleData.difficulty === "string"
            ? (articleData.difficulty as "beginner" | "intermediate" | "advanced" | "pro_only")
            : args.difficulty,
        estimatedReadMinutes: toNumber(articleData.estimatedReadMinutes),
        estimatedTaskMinutes: toNumber(articleData.estimatedTaskMinutes),
        toolsRequired: toStringArray(articleData.toolsRequired),
        partsRequired: toStringArray(articleData.partsRequired),
        safetyWarnings: toStringArray(articleData.safetyWarnings),
        keywords: toStringArray(articleData.keywords),
        quickSkim: toStringArray(articleData.quickSkim),
        deepDiveContent,
        seasonPreference: season,
        optimalMonths: toNumberArray(articleData.optimalMonths),
        status: args.status || "published",
      }
    );

    return {
      articleId: result.articleId,
      slug,
      model: "claude-sonnet-4-20250514",
      timestamp: Date.now(),
    };
  },
});

/**
 * Scrub a public URL and generate a knowledge article using Anthropic.
 */
export const scrubUrlToArticle = action({
  args: {
    url: v.string(),
    articleType: knowledgeArticleType,
    systemCategory: v.optional(systemCategory),
    status: v.optional(knowledgeContentStatus),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    articleId: string;
    slug: string;
    sourceUrl: string;
    model: string;
    timestamp: number;
  }> => {
    debugLog({
      sessionId: "debug-session",
      runId: "scrub-pre",
      hypothesisId: "H1",
      location: "convex/knowledgeActions.ts:310",
      message: "scrubUrlToArticle start",
      data: { url: args.url, articleType: args.articleType, systemCategory: args.systemCategory },
      timestamp: Date.now(),
    });

    const res = await fetch(args.url, {
      headers: {
        "User-Agent":
          "KeptScrubber/1.0 (+https://kept-app.vercel.app) knowledge-ingest",
      },
    });

    debugLog({
      sessionId: "debug-session",
      runId: "scrub-pre",
      hypothesisId: "H1",
      location: "convex/knowledgeActions.ts:324",
      message: "scrubUrlToArticle fetch response",
      data: { status: res.status, ok: res.ok },
      timestamp: Date.now(),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch URL: ${res.status}`);
    }

    const html = await res.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 12000);

    debugLog({
      sessionId: "debug-session",
      runId: "scrub-pre",
      hypothesisId: "H2",
      location: "convex/knowledgeActions.ts:345",
      message: "scrubUrlToArticle extracted text",
      data: { textLength: text.length },
      timestamp: Date.now(),
    });

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
      throw new Error("ANTHROPIC_API_KEY is not set");
    }

    const prompt = `You are a home maintenance content writer. Convert this source material into a clean, structured article.
Output format (JSON):
{
  "title": "Article title",
  "subtitle": "Optional subtitle",
  "summary": "1-2 sentence summary",
  "contentMarkdown": "Full markdown content",
  "difficulty": "beginner|intermediate|advanced|pro_only",
  "estimatedReadMinutes": number,
  "estimatedTaskMinutes": number,
  "toolsRequired": ["tool1", "tool2"],
  "partsRequired": ["part1", "part2"],
  "safetyWarnings": ["warning1", "warning2"],
  "keywords": ["keyword1", "keyword2"]
}

Source URL: ${args.url}
Article type: ${args.articleType}
System category: ${args.systemCategory || "general"}

Source text:
${text}`;

    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    debugLog({
      sessionId: "debug-session",
      runId: "scrub-pre",
      hypothesisId: "H3",
      location: "convex/knowledgeActions.ts:392",
      message: "anthropic response status",
      data: { status: anthropicResponse.status, ok: anthropicResponse.ok },
      timestamp: Date.now(),
    });

    if (!anthropicResponse.ok) {
      const errText = await anthropicResponse.text();
      throw new Error(`Anthropic error: ${anthropicResponse.status} ${errText}`);
    }

    const anthropicJson = await anthropicResponse.json();
    const content = anthropicJson?.content?.[0]?.text || "{}";

    let articleData;
    try {
      articleData = JSON.parse(content);
    } catch (err) {
      throw new Error(`Failed to parse Anthropic JSON: ${String(err)}`);
    }

    const slug = String(articleData.title || "untitled")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const result: { articleId: string } = await ctx.runMutation(
      api.knowledge.upsertArticle,
      {
      slug,
      articleType: args.articleType,
      systemCategory: args.systemCategory,
      title: articleData.title || "Untitled",
      subtitle: articleData.subtitle,
      summary: articleData.summary || "",
      contentMarkdown: articleData.contentMarkdown || "",
      difficulty: articleData.difficulty,
      estimatedReadMinutes: articleData.estimatedReadMinutes,
      estimatedTaskMinutes: articleData.estimatedTaskMinutes,
      toolsRequired: articleData.toolsRequired,
      partsRequired: articleData.partsRequired,
      safetyWarnings: articleData.safetyWarnings,
      keywords: articleData.keywords,
      status: args.status || "draft",
      sourceUrl: args.url,
      }
    );

    debugLog({
      sessionId: "debug-session",
      runId: "scrub-pre",
      hypothesisId: "H4",
      location: "convex/knowledgeActions.ts:442",
      message: "scrubUrlToArticle saved",
      data: { articleId: result.articleId, slug },
      timestamp: Date.now(),
    });

    return {
      articleId: result.articleId,
      slug,
      sourceUrl: args.url,
      model: "claude-3-5-sonnet-20240620",
      timestamp: Date.now(),
    };
  },
});

/**
 * Generate diagnostic tree from symptom description using OpenAI GPT-4
 */
export const generateDiagnosticTree = action({
  args: {
    systemCategory: systemCategory,
    symptomDescription: v.string(),
  },
  handler: async (ctx, args) => {
    const systemPrompt = `You are an expert home repair diagnostician creating interactive troubleshooting flows.
Create a decision tree that guides homeowners through diagnosing a problem step by step.

Rules:
- Start with the most common/simple causes first
- Each node should be clear and actionable
- Include specific things to look for or check
- End nodes should have clear diagnosis and recommended action
- Flag when professional help is needed
- Include cost estimates where possible

Output format (JSON):
{
  "title": "Troubleshooter title",
  "description": "What this troubleshooter helps diagnose",
  "entrySymptom": "The starting symptom",
  "nodes": [
    {
      "nodeKey": "start",
      "nodeType": "question|observation|action|result|referral",
      "title": "Node title/question",
      "contentMarkdown": "Detailed explanation (optional)",
      "options": [
        {"label": "Option text", "nextNodeKey": "next_node_key", "explanation": "optional"}
      ],
      "diagnosisCode": "CODE (for result nodes)",
      "severity": "minor|moderate|serious|critical (for result nodes)",
      "recommendedAction": "What to do (for result nodes)",
      "shouldCallPro": true/false,
      "proSpecialty": "Type of pro to call",
      "urgency": "How urgent",
      "estimatedCost": {"diyLow": 0, "diyHigh": 0, "proLow": 0, "proHigh": 0}
    }
  ]
}

Node types:
- question: Ask user to choose from options
- observation: Tell user to check something, then choose
- action: Tell user to do something, then choose
- result: Final diagnosis with recommendation
- referral: Recommend calling a professional`;

    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 8192,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Create a comprehensive diagnostic troubleshooting tree for:

System Category: ${args.systemCategory}
Symptom: "${args.symptomDescription}"

Please create at least 8-12 nodes covering common causes and solutions. Output valid JSON.`,
        },
      ],
    });

    const generatedText = response.choices[0]?.message?.content || "{}";

    // Parse the JSON response
    let treeData;
    try {
      treeData = JSON.parse(generatedText);
    } catch (e) {
      throw new Error(`Failed to parse AI response as JSON: ${e}`);
    }

    return {
      ...treeData,
      systemCategory: args.systemCategory,
      slug: treeData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
      model: "gpt-4o-mini",
      timestamp: Date.now(),
    };
  },
});

/**
 * Generate expanded content for a specific section
 */
export const expandSection = action({
  args: {
    topic: v.string(),
    currentContent: v.optional(v.string()),
    targetDepth: v.union(
      v.literal("overview"),
      v.literal("detailed"),
      v.literal("comprehensive"),
      v.literal("expert")
    ),
  },
  handler: async (ctx, args) => {
    const depthInstructions: Record<string, string> = {
      overview: "Provide a clear, concise overview suitable for someone unfamiliar with the topic. 2-3 paragraphs.",
      detailed: "Provide detailed information with explanations of how and why. Include relevant examples. 4-6 paragraphs.",
      comprehensive: "Provide comprehensive coverage including technical details, variations, edge cases, and expert insights. 8-12 paragraphs with subheadings.",
      expert: "Provide expert-level depth suitable for professionals or advanced DIYers. Include technical specifications, industry standards, code requirements, and professional techniques. Use tables and detailed lists where appropriate.",
    };

    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 4096,
      messages: [
        {
          role: "system",
          content: `You are an expert home maintenance technical writer.
${depthInstructions[args.targetDepth]}

Write in clear, accessible language but don't oversimplify technical concepts.
Use markdown formatting with appropriate headings, lists, and emphasis.`,
        },
        {
          role: "user",
          content: `Expand on this topic: "${args.topic}"
${args.currentContent ? `\nCurrent content to expand upon:\n${args.currentContent}` : ""}

Target depth: ${args.targetDepth}`,
        },
      ],
    });

    const expandedContent = response.choices[0]?.message?.content || "";

    return {
      topic: args.topic,
      targetDepth: args.targetDepth,
      expandedContent,
      model: "gpt-4o-mini",
      timestamp: Date.now(),
    };
  },
});

/**
 * Answer a specific question about home maintenance using AI
 */
export const askQuestion = action({
  args: {
    question: v.string(),
    context: v.optional(v.object({
      systemCategory: v.optional(systemCategory),
      systemType: v.optional(v.string()),
      homeDetails: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 2048,
      messages: [
        {
          role: "system",
          content: `You are an expert home maintenance advisor. Provide helpful, accurate, and safety-conscious answers about home maintenance, repair, and improvement.

Guidelines:
- Be specific and actionable
- Always prioritize safety
- Mention when professional help is recommended
- Include cost estimates when relevant
- Explain the "why" behind recommendations
- Use clear, non-technical language when possible`,
        },
        {
          role: "user",
          content: `${args.context ? `Context:
- System Category: ${args.context.systemCategory || "general"}
- System Type: ${args.context.systemType || "not specified"}
- Home Details: ${args.context.homeDetails || "not specified"}

` : ""}Question: ${args.question}`,
        },
      ],
    });

    const answer = response.choices[0]?.message?.content || "";

    return {
      question: args.question,
      answer,
      model: "gpt-4o-mini",
      timestamp: Date.now(),
    };
  },
});
