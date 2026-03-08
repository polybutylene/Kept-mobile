"use node";

import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const sendPushNotification = internalAction({
  args: {
    userId: v.id("userProfiles"),
    title: v.string(),
    body: v.string(),
    data: v.optional(v.any()),
  },
  handler: async (ctx, args): Promise<{ sent: number; result?: any; error?: string }> => {
    const tokens: Array<{ token: string }> = await ctx.runQuery(
      internal.pushNotificationQueries.getUserTokens,
      { userId: args.userId }
    );

    if (!tokens || tokens.length === 0) return { sent: 0 };

    const messages: Array<Record<string, unknown>> = tokens.map((t) => ({
      to: t.token,
      sound: "default",
      title: args.title,
      body: args.body,
      data: args.data ?? {},
    }));

    try {
      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messages),
      });

      const result = await response.json();
      return { sent: messages.length, result };
    } catch (error) {
      console.error("[Push] Failed to send:", error);
      return { sent: 0, error: String(error) };
    }
  },
});

export const sendBatchPushNotifications = internalAction({
  args: {
    notifications: v.array(v.object({
      userId: v.id("userProfiles"),
      title: v.string(),
      body: v.string(),
      data: v.optional(v.any()),
    })),
  },
  handler: async (ctx, args) => {
    let totalSent = 0;
    for (const notif of args.notifications) {
      try {
        await ctx.runAction(internal.pushNotifications.sendPushNotification, notif);
        totalSent++;
      } catch (e) {
        console.error(`[Push] Failed for user ${notif.userId}:`, e);
      }
    }
    return { totalSent };
  },
});
