"use node";

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";

export const publishScheduledPosts = internalAction({
  args: {},
  handler: async (ctx) => {
    const readyPosts = await ctx.runQuery(
      internal.agents.socialPublisherMutations.getReadyPosts,
      {}
    );

    if (readyPosts.length === 0) {
      return { published: 0, failed: 0 };
    }

    let published = 0;
    let failed = 0;

    for (const post of readyPosts) {
      try {
        const hashtagString = post.hashtags.map((h: string) => (h.startsWith("#") ? h : `#${h}`)).join(" ");
        const fullText = `${post.content}\n\n${hashtagString}`;

        const publerKey = process.env.PUBLER_API_KEY;
        if (!publerKey) {
          throw new Error("PUBLER_API_KEY not configured");
        }

        const response = await fetch("https://publer.io/api/v1/posts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publerKey}`,
          },
          body: JSON.stringify({
            text: fullText,
            is_draft: false,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Publer API ${response.status}: ${errText}`);
        }

        await ctx.runMutation(internal.agents.socialPublisherMutations.markPublished, {
          postId: post._id,
        });
        published++;
      } catch (err: any) {
        console.error(`[Publisher] Failed to publish post ${post._id}:`, err.message);
        await ctx.runMutation(internal.agents.socialPublisherMutations.markFailed, {
          postId: post._id,
        });
        failed++;
      }
    }

    console.log(`[Publisher] Published: ${published}, Failed: ${failed}`);
    return { published, failed };
  },
});
