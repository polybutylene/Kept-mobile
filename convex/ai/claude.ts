"use node";

/**
 * Shared Claude API client
 *
 * All AI features use this single utility to call the Anthropic Messages API.
 * Pattern matches convex/knowledgeActions.ts (direct fetch, "use node" runtime).
 */

import { ActionCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-sonnet-4-20250514";

// ============================================================
// Types
// ============================================================

export interface ClaudeMessage {
  role: "user" | "assistant";
  content: string | ClaudeContentBlock[];
}

export interface ClaudeContentBlock {
  type: "text" | "image" | "document";
  text?: string;
  source?: {
    type: "base64";
    media_type: string;
    data: string;
  };
}

export interface ClaudeResponse {
  id: string;
  content: { type: string; text: string }[];
  usage: { input_tokens: number; output_tokens: number };
  model: string;
}

// ============================================================
// Main API call
// ============================================================

export async function callClaude(args: {
  systemPrompt: string;
  messages: ClaudeMessage[];
  maxTokens?: number;
  temperature?: number;
  model?: string;
  enablePdfSupport?: boolean;
}): Promise<ClaudeResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey?.trim()) {
    throw new Error("ANTHROPIC_API_KEY is not set in Convex dashboard. Add it under Settings → Environment Variables to use model plate scan.");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
  };

  if (args.enablePdfSupport) {
    headers["anthropic-beta"] = "pdfs-2024-09-25";
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: args.model ?? DEFAULT_MODEL,
      max_tokens: args.maxTokens ?? 2048,
      temperature: args.temperature ?? 0.7,
      system: args.systemPrompt,
      messages: args.messages,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error ${response.status}: ${error}`);
  }

  return response.json() as Promise<ClaudeResponse>;
}

// ============================================================
// Vision helper — converts Convex storage file to base64
// ============================================================

export async function fileToBase64(
  ctx: ActionCtx,
  storageId: Id<"_storage">
): Promise<{ data: string; mediaType: string }> {
  const blob = await ctx.storage.get(storageId);
  if (!blob) throw new Error(`File not found in storage: ${storageId}`);

  const arrayBuffer = await blob.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const mediaType = blob.type || "image/jpeg";

  return { data: base64, mediaType };
}

// ============================================================
// Response helper — extract text from Claude response
// ============================================================

export function extractResponseText(response: ClaudeResponse): string {
  if (!response?.content || !Array.isArray(response.content)) return "";
  return response.content
    .filter((block) => block && block.type === "text")
    .map((block) => (block as { type: string; text?: string }).text ?? "")
    .join("");
}
