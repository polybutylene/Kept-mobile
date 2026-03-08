"use node";

import { action, internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";

const SUPPORT_SYSTEM_PROMPT = `You are Kept's AI support assistant. You help homeowners with:
- Understanding their home's Health Points and what they mean
- Interpreting failure predictions and replacement cost estimates
- Navigating the app (adding homes, scanning equipment, reading reports)
- General home maintenance questions

RULES:
1. Be warm, helpful, and concise. You are a friendly neighbor, not a call center.
2. If you have the user's home data in context, reference it specifically.
3. If you cannot answer confidently, say "Let me connect you with Solomon, Kept's founder, to help with this" and set escalate=true. NEVER make up an answer.
4. For billing, account deletion, or refund issues, ALWAYS escalate.
5. For feature requests, thank them, acknowledge the idea, and log the category as "feature_request".
6. Keep responses under 150 words unless the question requires a detailed explanation.`;

export const handleSupportMessage = action({
  args: {
    conversationId: v.optional(v.id("supportConversations")),
    userId: v.id("users"),
    message: v.string(),
  },
  handler: async (ctx, args): Promise<any> => {
    const userContext = await ctx.runQuery(
      internal.agents.supportMutations.getUserContext,
      { userId: args.userId }
    );

    const kbResults = await ctx.runQuery(
      internal.agents.supportMutations.searchKnowledgeBase,
      { query: args.message }
    );

    let conversationHistory: { role: string; content: string; timestamp: number }[] = [];
    let conversationId = args.conversationId;

    if (conversationId) {
      const convo = await ctx.runQuery(
        internal.agents.supportMutations.getConversation,
        { conversationId }
      );
      if (convo) {
        conversationHistory = convo.messages.slice(-10);
      }
    }

    const contextBlock = [
      "## User Profile",
      JSON.stringify(userContext, null, 2),
      "",
      "## Relevant Knowledge Base Articles",
      kbResults.map((kb: any) => `### ${kb.topic}\n${kb.content}`).join("\n\n"),
      "",
      "## Conversation History",
      conversationHistory
        .map((m: any) => `${m.role}: ${m.content}`)
        .join("\n"),
    ].join("\n");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 1024,
        system: SUPPORT_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Context:\n${contextBlock}\n\n---\n\nUser message: "${args.message}"\n\nRespond with ONLY valid JSON:\n{"response": "your reply", "escalate": false, "category": "general|billing|technical|feature_request|maintenance"}`,
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
    const aiResponse = parsed.response ?? "I'm sorry, I couldn't process that. Let me connect you with Solomon.";
    const escalate = parsed.escalate ?? false;
    const category = parsed.category ?? "general";

    const now = Date.now();

    if (conversationId) {
      await ctx.runMutation(internal.agents.supportMutations.appendMessage, {
        conversationId,
        messages: [
          { role: "user" as const, content: args.message, timestamp: now },
          { role: "assistant" as const, content: aiResponse, timestamp: now + 1 },
        ],
        category,
      });
    } else {
      conversationId = await ctx.runMutation(
        internal.agents.supportMutations.createConversation,
        {
          userId: args.userId,
          messages: [
            { role: "user" as const, content: args.message, timestamp: now },
            { role: "assistant" as const, content: aiResponse, timestamp: now + 1 },
          ],
          category,
        }
      );
    }

    if (escalate) {
      await ctx.runMutation(internal.agents.supportMutations.escalateConversation, {
        conversationId: conversationId!,
      });
      await ctx.runAction(internal.agents.supportAgent.sendEscalation, {
        userId: args.userId,
        message: args.message,
        aiResponse,
      });
    }

    return { response: aiResponse, escalate, conversationId, category };
  },
});

export const sendEscalation = internalAction({
  args: {
    userId: v.id("users"),
    message: v.string(),
    aiResponse: v.string(),
  },
  handler: async (_ctx, args) => {
    // TODO: Replace with email webhook (e.g. Resend) or Slack webhook
    console.log(
      `[ESCALATION] User: ${args.userId} | Message: ${args.message} | AI said: ${args.aiResponse}`
    );
  },
});
