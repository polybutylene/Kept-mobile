"use node";

/**
 * Inspector AI Companion
 *
 * Convex action that calls Claude API for the Inspector app.
 * Three modes: chat, report_language, checklist_review
 */

import { action } from "./_generated/server";
import { v } from "convex/values";

const INSPECTOR_AGENT_BASE_PROMPT = `You are the Kept Inspector AI — an InterNACHI-trained home inspection assistant embedded in the Kept inspection platform. You help licensed home inspectors perform thorough, compliant inspections in the state of Florida.

## YOUR IDENTITY
- You are a knowledgeable, experienced inspection companion — not the inspector
- You reference InterNACHI SOP requirements accurately and cite section numbers
- You know Florida-specific requirements (DBPR Chapter 468, Rule 61-30)
- You speak in practical, field-ready language — not academic or legalistic
- You are concise — inspectors are on a clock, typically 2-3 hours per inspection

## CORE RULES — NEVER VIOLATE THESE

1. ACCURACY: Never invent SOP requirements that don't exist. If you're unsure whether something is required, say "Check your local SOP requirements" rather than guessing.

2. SCOPE BOUNDARIES: Always distinguish between:
   - "The SOP REQUIRES you to..." (mandatory)
   - "Best practice is to..." (recommended but not required)
   - "This is OUTSIDE the scope of a standard inspection" (excluded)

3. NO DIAGNOSES: Inspectors identify defects, they do NOT determine causes. Never tell an inspector to state WHY something is broken. The SOP explicitly excludes determining "the cause or reason of any condition."

4. NO LIFE EXPECTANCY CLAIMS: The SOP explicitly states inspectors are not required to determine service life expectancy. When the inspector asks about expected life, frame it as: "Per the SOP, you're not required to determine service life. However, Kept's predictive analysis estimates [X] based on manufacturer data and Weibull modeling."

5. SAFETY FIRST: If a condition poses an immediate safety hazard, always recommend the inspector flag it prominently regardless of other considerations.

6. LIABILITY PROTECTION: When an inspector asks about edge cases, always mention what they are NOT required to do. Protecting the inspector from overstepping scope is as important as ensuring they don't miss required items.

7. RECOMMEND SPECIALISTS: When something is outside scope, recommend the appropriate specialist: "Recommend evaluation by a qualified [electrician / plumber / structural engineer / HVAC technician / roofer]."

8. FLORIDA AWARENESS: You know Florida-specific issues including:
   - Hurricane damage patterns (especially Bay County post-Michael 2018)
   - Wind mitigation inspections (OIR-B1-1802 form)
   - 4-point insurance inspections
   - Common Florida materials (CBS construction, stucco, tile roofs, CPVC, PB pipe)
   - Florida Building Code transition points (pre-2002 vs post-2002)
   - Coastal corrosion and saltwater exposure in Walton County
   - High humidity effects on all systems

## RESPONSE FORMAT
- Keep responses under 150 words unless the question requires detailed explanation
- Use bullet points for checklists and requirements
- Bold critical warnings or safety items with **text**
- Always cite the SOP section number when referencing a requirement (e.g., "Per SOP 3.6...")
- If suggesting report language, wrap it in quotes so the inspector can copy/paste

## InterNACHI SOP SECTION REFERENCE
- 3.1: Structural Components
- 3.2: Exterior
- 3.3: Roof System
- 3.4: Plumbing System
- 3.5: Electrical System
- 3.6: Heating/HVAC
- 3.7: Air Conditioning / Heat Pumps
- 3.8: Interiors
- 3.9: Insulation and Ventilation
- 3.10: Fireplaces and Solid Fuel
- 3.11: Appliances (if included)
`;

export const sendInspectorChat = action({
  args: {
    systemCategory: v.string(),
    systemName: v.string(),
    userMessage: v.string(),
    mode: v.union(v.literal("chat"), v.literal("report_language"), v.literal("checklist_review")),
    conversationHistory: v.optional(v.array(v.object({
      role: v.string(),
      content: v.string(),
    }))),
    currentFindings: v.optional(v.array(v.string())),
    sopItems: v.optional(v.array(v.object({
      label: v.string(),
      required: v.boolean(),
      liabilityNote: v.optional(v.string()),
      commonDefects: v.array(v.string()),
    }))),
    flaggedItem: v.optional(v.string()),
    condition: v.optional(v.string()),
    inspectorNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

    let modeInstruction = "";

    switch (args.mode) {
      case "chat":
        modeInstruction = `The inspector is asking you a question while on-site inspecting the ${args.systemName} system (category: ${args.systemCategory}).
Answer concisely and practically. Reference SOP section numbers. Protect their liability.
If the question is about something outside scope, say so clearly.`;
        break;

      case "report_language":
        modeInstruction = `The inspector needs professional report language for a finding on the ${args.systemName} system.
Generate clear, neutral, factual language suitable for an inspection report.
- Use passive/observational tone ("Evidence of X was observed" not "The X is broken")
- Never state causes — only observed conditions
- Always end with a recommendation ("Recommend evaluation by a qualified [specialist]")
- Keep to 2-4 sentences maximum
- Include suggested severity level: MINOR / MODERATE / MAJOR / SAFETY HAZARD

${args.flaggedItem ? `FLAGGED ITEM: ${args.flaggedItem}` : ""}
${args.condition ? `CONDITION RATED: ${args.condition}` : ""}
${args.inspectorNotes ? `INSPECTOR'S NOTES: ${args.inspectorNotes}` : ""}

Respond in this exact JSON format:
{
  "text": "report language here",
  "severity": "MODERATE",
  "recommendedAction": "Recommend evaluation by...",
  "photoGuidance": "Photograph the..."
}`;
        break;

      case "checklist_review":
        modeInstruction = `Review the inspector's current findings for the ${args.systemName} system against SOP requirements.
Compare against the SOP requirements. Identify:
1. Any required inspection items that appear to be MISSING
2. Any findings that need more detail
3. Any concerns that should be elevated in severity
4. Confirm which SOP requirements have been satisfied
Keep response structured and scannable.

${args.currentFindings ? `INSPECTOR'S CURRENT FINDINGS:\n${args.currentFindings.map((f) => `- ${f}`).join("\n")}` : ""}`;
        break;
    }

    let sopContext = "";
    if (args.sopItems && args.sopItems.length > 0) {
      sopContext = `\n## SOP CHECKLIST FOR ${args.systemName.toUpperCase()}\n`;
      sopContext += args.sopItems.map((item) => {
        let line = `- ${item.required ? "[REQUIRED]" : "[OPTIONAL]"} ${item.label}`;
        if (item.liabilityNote) line += ` (⚠️ ${item.liabilityNote})`;
        if (item.commonDefects.length > 0) line += `\n  Common defects: ${item.commonDefects.join(", ")}`;
        return line;
      }).join("\n");
    }

    const systemPrompt = `${INSPECTOR_AGENT_BASE_PROMPT}\n\n${modeInstruction}\n\n${sopContext}`;

    const messages = [
      ...(args.conversationHistory || []).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: args.userMessage },
    ];

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 1000,
        temperature: 0.5,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Claude API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const responseText = data.content
      .filter((block: any) => block.type === "text")
      .map((block: any) => block.text)
      .join("\n");

    return { response: responseText, model: data.model };
  },
});

export const generateReportLanguage = action({
  args: {
    systemCategory: v.string(),
    systemName: v.string(),
    flaggedItem: v.string(),
    condition: v.string(),
    inspectorNotes: v.optional(v.string()),
    sopItems: v.optional(v.array(v.object({
      label: v.string(),
      required: v.boolean(),
      liabilityNote: v.optional(v.string()),
      commonDefects: v.array(v.string()),
    }))),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

    const prompt = `The inspector just flagged a concern on the ${args.systemName} system:

FLAGGED ITEM: ${args.flaggedItem}
CONDITION RATED: ${args.condition}
${args.inspectorNotes ? `INSPECTOR'S NOTES: ${args.inspectorNotes}` : ""}

Generate professional report language. Respond ONLY with this JSON:
{
  "text": "2-4 sentence report language, observational tone, no cause determination, ends with recommendation",
  "severity": "MINOR or MODERATE or MAJOR or SAFETY HAZARD",
  "recommendedAction": "Recommend evaluation by a qualified [specialist type]",
  "photoGuidance": "What specific photos to capture"
}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 500,
        temperature: 0.3,
        system: INSPECTOR_AGENT_BASE_PROMPT,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error ${response.status}`);
    }

    const data = await response.json();
    const text = data.content
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("");

    try {
      const cleaned = text.replace(/```json|```/g, "").trim();
      return JSON.parse(cleaned);
    } catch {
      return {
        text,
        severity: "MODERATE",
        recommendedAction: "Recommend evaluation by a qualified professional.",
        photoGuidance: "Photograph the observed condition from multiple angles.",
      };
    }
  },
});

export const reviewChecklist = action({
  args: {
    systemCategory: v.string(),
    systemName: v.string(),
    checklist: v.array(v.object({
      item: v.string(),
      checked: v.boolean(),
      flagged: v.boolean(),
    })),
    condition: v.optional(v.string()),
    notes: v.optional(v.string()),
    sopItems: v.array(v.object({
      label: v.string(),
      required: v.boolean(),
      commonDefects: v.array(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

    const prompt = `Review this inspection for SOP compliance on the ${args.systemName} system.

INSPECTOR'S CHECKLIST:
${args.checklist.map((c) => `- [${c.checked ? "✓" : " "}]${c.flagged ? " ⚠️" : ""} ${c.item}`).join("\n")}

CONDITION: ${args.condition || "Not rated"}
NOTES: ${args.notes || "None"}

SOP REQUIREMENTS:
${args.sopItems.map((s) => `- [${s.required ? "REQUIRED" : "OPTIONAL"}] ${s.label}`).join("\n")}

Respond ONLY with JSON:
{
  "status": "complete" or "incomplete" or "concerns",
  "missingItems": ["items from SOP not checked"],
  "elevationSuggestions": ["findings that may need higher severity"],
  "complianceNotes": ["general compliance notes"]
}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 800,
        temperature: 0.3,
        system: INSPECTOR_AGENT_BASE_PROMPT,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error ${response.status}`);
    }

    const data = await response.json();
    const text = data.content
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("");

    try {
      return JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch {
      return {
        status: "complete",
        missingItems: [],
        elevationSuggestions: [],
        complianceNotes: ["Unable to perform automated review — manual review recommended"],
      };
    }
  },
});
