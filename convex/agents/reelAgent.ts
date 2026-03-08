"use node";

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { v } from "convex/values";

const REEL_SYSTEM_PROMPT = `You write viral short-form video scripts for Kept, a home maintenance app.

FORMAT RULES:
- Hook in first 2 seconds (question, shocking stat, or pattern interrupt)
- Total length: 15-45 seconds when spoken aloud
- Include [VISUAL CUE] markers for B-roll or screen recording moments
- End with clear CTA

PROVEN HOOKS FOR HOME CONTENT:
- "Your [system] is probably going to fail in [timeframe] and here's why..."
- "I've been in thousands of homes as a plumber and I see this mistake every time..."
- "This $[amount] repair was 100% preventable. Here's how..."
- "Stop doing this to your [system]. Seriously."
- "POV: Your water heater just died and you had no idea it was coming"

STYLE TYPES:
- educational: Teach something specific, data-heavy
- myth-busting: Correct a common misconception
- product-demo: Walk through a Kept feature with screen recording cues
- story: Tell a real scenario from field experience
- engagement: Ask a question, run a poll, "guess the cost" format`;

const ROTATING_TOPICS = [
  "water heater lifespan",
  "HVAC maintenance",
  "roof inspection",
  "plumbing myths",
  "seasonal prep",
  "Health Points explainer",
  "cost prediction demo",
  "equipment scanning walkthrough",
];

const ROTATING_STYLES = [
  "educational",
  "myth-busting",
  "product-demo",
  "story",
  "engagement",
];

export const generateReelScript = internalAction({
  args: { topic: v.string(), style: v.string() },
  handler: async (ctx, args): Promise<{ projectId: Id<"reelProjects">; script: any }> => {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 2048,
        system: REEL_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Generate a short-form video script about "${args.topic}" in the "${args.style}" style.

Return ONLY valid JSON:
{
  "hook": "first 2 seconds text — the attention grabber",
  "script": "full narration text (15-45 seconds spoken)",
  "visualCues": [{"timestamp": "0:00", "description": "what to show on screen"}],
  "duration": 30,
  "captionSegments": ["line 1", "line 2"],
  "cta": "call to action text"
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

    const projectId = await ctx.runMutation(
      internal.agents.reelMutations.createProject,
      {
        topic: args.topic,
        style: args.style,
        script: JSON.stringify(parsed),
        status: "scripted",
      }
    );

    console.log(`[Reel Agent] Script generated for "${args.topic}" (${args.style})`);
    return { projectId, script: parsed };
  },
});

export const generateVoiceover = internalAction({
  args: { projectId: v.id("reelProjects") },
  handler: async (ctx, args) => {
    const project = await ctx.runQuery(
      internal.agents.reelMutations.getProject,
      { projectId: args.projectId }
    );
    if (!project || !project.script) throw new Error("Project or script not found");

    const scriptData = JSON.parse(project.script);
    const narration = scriptData.script;

    const voiceId = process.env.ELEVENLABS_VOICE_ID;
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!voiceId || !apiKey) {
      throw new Error("ELEVENLABS_VOICE_ID or ELEVENLABS_API_KEY not configured");
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text: narration,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      await ctx.runMutation(internal.agents.reelMutations.updateProject, {
        projectId: args.projectId,
        status: "failed",
      });
      throw new Error(`ElevenLabs API error: ${response.status} ${errText}`);
    }

    const audioBlob = await response.blob();
    const storageId = await ctx.storage.store(audioBlob);

    await ctx.runMutation(internal.agents.reelMutations.updateProject, {
      projectId: args.projectId,
      status: "voiced",
      voiceoverStorageId: storageId,
    });

    console.log(`[Reel Agent] Voiceover generated for project ${args.projectId}`);
    return { storageId };
  },
});

export const generateVisuals = internalAction({
  args: { projectId: v.id("reelProjects") },
  handler: async (ctx, args) => {
    const project = await ctx.runQuery(
      internal.agents.reelMutations.getProject,
      { projectId: args.projectId }
    );
    if (!project || !project.script) throw new Error("Project or script not found");

    const scriptData = JSON.parse(project.script);
    const cues = scriptData.visualCues ?? [];

    const runwayKey = process.env.RUNWAY_API_KEY;
    if (!runwayKey) {
      console.log("[Reel Agent] RUNWAY_API_KEY not set — skipping visual generation");
      await ctx.runMutation(internal.agents.reelMutations.updateProject, {
        projectId: args.projectId,
        status: "visual",
      });
      return { visualAssets: [] };
    }

    const storageIds: string[] = [];

    for (const cue of cues) {
      try {
        const response = await fetch("https://api.runwayml.com/v1/image_to_video", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${runwayKey}`,
          },
          body: JSON.stringify({
            text_prompt: cue.description,
            duration: 4,
          }),
        });

        if (!response.ok) {
          console.error(`[Reel Agent] Runway failed for cue: ${cue.description}`);
          continue;
        }

        const videoBlob = await response.blob();
        const storageId = await ctx.storage.store(videoBlob);
        storageIds.push(storageId);
      } catch (err: any) {
        console.error(`[Reel Agent] Visual generation failed:`, err.message);
      }
    }

    await ctx.runMutation(internal.agents.reelMutations.updateProject, {
      projectId: args.projectId,
      status: "visual",
      visualAssets: storageIds,
    });

    console.log(`[Reel Agent] Generated ${storageIds.length} visual assets`);
    return { visualAssets: storageIds };
  },
});

export const processReelPipeline = internalAction({
  args: { topic: v.string(), style: v.string() },
  handler: async (ctx, args): Promise<any> => {
    const { projectId } = await ctx.runAction(
      internal.agents.reelAgent.generateReelScript,
      { topic: args.topic, style: args.style }
    );

    try {
      await ctx.runAction(
        internal.agents.reelAgent.generateVoiceover,
        { projectId }
      );
    } catch (err: any) {
      console.error(`[Reel Pipeline] Voiceover failed:`, err.message);
      return { projectId, stoppedAt: "voiceover" };
    }

    try {
      await ctx.runAction(
        internal.agents.reelAgent.generateVisuals,
        { projectId }
      );
    } catch (err: any) {
      console.error(`[Reel Pipeline] Visuals failed:`, err.message);
      return { projectId, stoppedAt: "visuals" };
    }

    console.log(`[Reel Pipeline] Complete for project ${projectId}`);
    return { projectId, stoppedAt: null };
  },
});

export const batchGenerateScripts = internalAction({
  args: { count: v.number() },
  handler: async (ctx, args): Promise<any> => {
    const results = [];
    for (let i = 0; i < args.count; i++) {
      const topic = ROTATING_TOPICS[i % ROTATING_TOPICS.length];
      const style = ROTATING_STYLES[i % ROTATING_STYLES.length];

      try {
        const result = await ctx.runAction(
          internal.agents.reelAgent.generateReelScript,
          { topic, style }
        );
        results.push({ topic, style, projectId: result.projectId });
      } catch (err: any) {
        console.error(`[Reel Agent] Batch script failed for "${topic}":`, err.message);
        results.push({ topic, style, error: err.message });
      }
    }

    console.log(`[Reel Agent] Batch generated ${results.filter((r) => "projectId" in r).length}/${args.count} scripts`);
    return results;
  },
});
