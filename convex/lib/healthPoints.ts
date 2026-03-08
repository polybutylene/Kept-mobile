import { Id } from "../_generated/dataModel";

export type BundleDefinition = {
  key: "bronze" | "silver" | "gold" | "platinum";
  name: string;
  pointsRequired: number;
  rewardType: "badge" | "perk" | "reporting" | "discount";
  description: string;
};

export const DEFAULT_BUNDLES: BundleDefinition[] = [
  {
    key: "bronze",
    name: "Bronze Health Bundle",
    pointsRequired: 100,
    rewardType: "badge",
    description: "Great start - consistent upkeep.",
  },
  {
    key: "silver",
    name: "Silver Health Bundle",
    pointsRequired: 250,
    rewardType: "perk",
    description: "Proactive maintenance habit.",
  },
  {
    key: "gold",
    name: "Gold Health Bundle",
    pointsRequired: 500,
    rewardType: "reporting",
    description: "Strong preventive record.",
  },
  {
    key: "platinum",
    name: "Platinum Health Bundle",
    pointsRequired: 1000,
    rewardType: "discount",
    description: "Top-tier home stewardship.",
  },
];

type AwardPointsArgs = {
  userId: Id<"userProfiles">;
  homeId?: Id<"homes">;
  systemId?: Id<"systems">;
  taskId?: Id<"scheduledMaintenance">;
  portfolioId?: Id<"portfolioAccounts">;
  workOrderId?: Id<"workOrders">;
  sourceType:
    | "task_completed"
    | "task_on_time_bonus"
    | "system_health_improvement"
    | "upgrade_documented"
    | "inspection_logged"
    | "work_order_completed"
    | "work_order_on_time";
  points: number;
  reason?: string;
  metadata?: any;
  occurredAt?: number;
};

export async function awardHealthPoints(
  ctx: any,
  args: AwardPointsArgs
): Promise<{
  balanceId: Id<"healthPointsBalances">;
  currentPoints: number;
  lifetimePoints: number;
  newlyAchieved: Array<{ key: BundleDefinition["key"]; achievedAt: number }>;
}> {
  const occurredAt = args.occurredAt ?? Date.now();

  const balanceQuery = ctx.db
    .query("healthPointsBalances")
    .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
    .filter((q: any) => q.eq(q.field("homeId"), args.homeId));

  let balance = await balanceQuery.first();

  if (!balance) {
    const balanceId = await ctx.db.insert("healthPointsBalances", {
      userId: args.userId,
      homeId: args.homeId,
      currentPoints: 0,
      lifetimePoints: 0,
      lastEarnedAt: occurredAt,
    });
    balance = await ctx.db.get(balanceId);
  }

  if (!balance) {
    throw new Error("Failed to create points balance");
  }

  if (!args.points || args.points <= 0) {
    return {
      balanceId: balance._id,
      currentPoints: balance.currentPoints,
      lifetimePoints: balance.lifetimePoints,
      newlyAchieved: [],
    };
  }

  await ctx.db.insert("healthPointsEvents", {
    userId: args.userId,
    homeId: args.homeId,
    systemId: args.systemId,
    taskId: args.taskId,
    sourceType: args.sourceType,
    points: args.points,
    reason: args.reason,
    metadata: args.metadata,
    occurredAt,
  });

  const newCurrent = balance.currentPoints + args.points;
  const newLifetime = balance.lifetimePoints + args.points;

  await ctx.db.patch(balance._id, {
    currentPoints: newCurrent,
    lifetimePoints: newLifetime,
    lastEarnedAt: occurredAt,
  });

  const newlyAchieved: Array<{ key: BundleDefinition["key"]; achievedAt: number }> = [];

  for (const bundle of DEFAULT_BUNDLES) {
    if (newCurrent < bundle.pointsRequired) continue;

    const existing = await ctx.db
      .query("healthPointsBundles")
      .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
      .filter((q: any) => q.eq(q.field("homeId"), args.homeId))
      .filter((q: any) => q.eq(q.field("bundleKey"), bundle.key))
      .first();

    if (!existing) {
      await ctx.db.insert("healthPointsBundles", {
        userId: args.userId,
        homeId: args.homeId,
        bundleKey: bundle.key,
        bundleName: bundle.name,
        pointsRequired: bundle.pointsRequired,
        rewardType: bundle.rewardType,
        achievedAt: occurredAt,
        metadata: { description: bundle.description },
      });
      newlyAchieved.push({ key: bundle.key, achievedAt: occurredAt });
    }
  }

  return {
    balanceId: balance._id,
    currentPoints: newCurrent,
    lifetimePoints: newLifetime,
    newlyAchieved,
  };
}
