"use node";

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";

const SOCIAL_SYSTEM_PROMPT = `You are the content strategist for Kept, a home maintenance intelligence platform.

BRAND VOICE:
- Friendly neighbor who happens to be a tradesman (not corporate, not salesy)
- Empowering homeowners with knowledge they don't currently have
- Data-driven but human — we predict failures using Weibull distribution modeling but we explain it as "we know when your stuff is going to break"
- Tone: Confident, slightly casual, educational, occasionally witty

KEY VALUE PROPS:
- Know WHEN your home systems will fail before they do
- See EXACTLY what replacements will cost (not vague estimates)
- Health Points system gamifies maintenance — makes it engaging not boring
- Built by a plumber who did thousands of service calls and saw the same problems

CONTENT PILLARS:
1. Education: Home maintenance tips, seasonal checklists, "did you know" facts
2. Product: Feature showcases, app walkthroughs, before/after scenarios
3. Social Proof: User stories, cost savings examples, testimonials
4. Engagement: Polls, quizzes, "guess the repair cost" games

NEVER: Use fear-based marketing, trash talk other apps, make claims we can't back up.`;

export const generateWeeklyContent = internalAction({
  args: { theme: v.string() },
  handler: async (ctx, args) => {
    const calendarTheme = await ctx.runQuery(
      internal.agents.socialContentMutations.getContentCalendar,
      {}
    );
    const theme = args.theme === "auto" ? (calendarTheme ?? "education") : args.theme;

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
        system: SOCIAL_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Generate a week of social media content for the theme: "${theme}".

Create exactly:
- 5 Facebook posts (longer, community-oriented, can be 1-3 paragraphs)
- 7 Instagram posts (visual-first, strong hooks, emoji-friendly, ~150 words max)
- 10 X (Twitter) posts (punchy, under 280 characters, conversation starters)

For each post include:
- platform: "facebook" | "instagram" | "x"
- content: the post text
- hashtags: 3-5 relevant hashtags
- mediaPrompt: a description of an ideal image/graphic to accompany this post (for AI image generation)
- bestTimeSlot: suggested time like "morning", "midday", "afternoon", "evening"

Return ONLY valid JSON: { "posts": [...] }`,
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
    if (!jsonMatch) {
      throw new Error("Claude did not return valid JSON");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const posts: any[] = parsed.posts ?? [];

    let stored = 0;
    for (const post of posts) {
      await ctx.runMutation(internal.agents.socialContentMutations.storePost, {
        platform: post.platform,
        content: post.content,
        hashtags: post.hashtags ?? [],
        mediaPrompt: post.mediaPrompt,
        status: "draft",
      });
      stored++;
    }

    console.log(`[Social Agent] Generated ${stored} posts for theme: "${theme}"`);
    return { postsCreated: stored };
  },
});

export const scheduleWeeklyPosts = internalAction({
  args: {},
  handler: async (ctx) => {
    const drafts = await ctx.runQuery(
      internal.agents.socialContentMutations.getDraftPosts,
      {}
    );

    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1);
    monday.setHours(0, 0, 0, 0);

    const timeSlots: Record<string, number[]> = {
      facebook: [10, 13, 15],
      instagram: [11, 14, 19],
      x: [8, 12, 17, 19, 21],
    };

    const platformPosts: Record<string, typeof drafts> = {
      facebook: [],
      instagram: [],
      x: [],
    };

    for (const post of drafts) {
      platformPosts[post.platform]?.push(post);
    }

    let scheduled = 0;
    for (const [platform, posts] of Object.entries(platformPosts)) {
      const slots = timeSlots[platform] ?? [12];
      let dayOffset = 0;
      let slotIndex = 0;

      for (const post of posts) {
        const scheduleDate = new Date(monday);
        scheduleDate.setDate(monday.getDate() + dayOffset);
        scheduleDate.setHours(slots[slotIndex] + 5, 0, 0, 0);

        await ctx.runMutation(
          internal.agents.socialContentMutations.updatePostSchedule,
          {
            postId: post._id,
            scheduledFor: scheduleDate.getTime(),
          }
        );
        scheduled++;

        slotIndex++;
        if (slotIndex >= slots.length) {
          slotIndex = 0;
          dayOffset++;
          if (dayOffset > 5) dayOffset = 0;
        }
      }
    }

    console.log(`[Social Agent] Scheduled ${scheduled} posts for the week`);
    return { postsScheduled: scheduled };
  },
});
