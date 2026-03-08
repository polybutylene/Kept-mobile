import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Send daily purchase reminders for Premium users with tasks due in ~7 days.
 * Matches products to upcoming tasks and sends push notifications.
 */
export const sendDailyReminders = internalAction({
  args: {},
  handler: async (ctx) => {
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const sevenDaysFromNow = now + sevenDaysMs;

    const upcomingTasks: any[] = await ctx.runQuery(
      internal.purchaseReminderCronQueries.getUpcomingTasks,
      { from: now, to: sevenDaysFromNow }
    );

    for (const task of upcomingTasks) {
      if (!task.homeId) continue;

      // Look up home owner to check their subscription tier
      const homeOwner: any = await ctx.runQuery(
        internal.purchaseReminderCronQueries.getHomeOwner,
        { homeId: task.homeId }
      );
      if (!homeOwner || homeOwner.tier !== "premium") continue;

      const existingReminder: any = await ctx.runQuery(
        internal.purchaseReminderCronQueries.getExistingReminder,
        { taskId: task._id }
      );
      if (existingReminder) continue;

      const products: any[] = await ctx.runQuery(
        internal.purchaseReminderCronQueries.getProductsForTaskType,
        { taskType: task.name?.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") || "" }
      );
      if (products.length === 0) continue;

      await ctx.runMutation(internal.purchaseReminderCronQueries.createReminder, {
        userId: homeOwner.userId,
        taskId: task._id,
        productId: products[0].productId,
        purchaseUrl: products[0].purchaseLinks?.[0]?.url,
      });

      const daysUntilDue = Math.ceil(
        (new Date(task.dueDate).getTime() - now) / (24 * 60 * 60 * 1000)
      );

      try {
        if (homeOwner.profileId) {
          await ctx.scheduler.runAfter(0, internal.pushNotifications.sendPushNotification, {
            userId: homeOwner.profileId,
            title: "Supplies needed for upcoming maintenance",
            body: `"${task.name}" is due in ${daysUntilDue} days. Order your ${products[0].name} now so it arrives in time.`,
          });
        }
      } catch {
        // Push is non-critical
      }
    }
  },
});
