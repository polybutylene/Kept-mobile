import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getActiveCampaigns = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db
      .query("seasonalCampaignDefs")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

export const getCampaignById = query({
  args: { campaignId: v.id("seasonalCampaignDefs") },
  handler: async (ctx, { campaignId }) => {
    return ctx.db.get(campaignId);
  },
});

export const getUserEnrollment = query({
  args: {
    userId: v.id("userProfiles"),
    campaignId: v.id("seasonalCampaignDefs"),
  },
  handler: async (ctx, { userId, campaignId }) => {
    return ctx.db
      .query("userCampaignEnrollment")
      .withIndex("by_user_campaign", (q) =>
        q.eq("userId", userId).eq("campaignId", campaignId)
      )
      .first();
  },
});

export const getUserCampaigns = query({
  args: { userId: v.id("userProfiles") },
  handler: async (ctx, { userId }) => {
    const enrollments = await ctx.db
      .query("userCampaignEnrollment")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const enriched = await Promise.all(
      enrollments.map(async (e) => {
        const campaign = await ctx.db.get(e.campaignId);
        return { ...e, campaign };
      })
    );

    return enriched.filter((e) => e.campaign !== null);
  },
});

export const enrollInCampaign = mutation({
  args: {
    userId: v.id("userProfiles"),
    campaignId: v.id("seasonalCampaignDefs"),
    homeId: v.id("homes"),
  },
  handler: async (ctx, { userId, campaignId, homeId }) => {
    const existing = await ctx.db
      .query("userCampaignEnrollment")
      .withIndex("by_user_campaign", (q) =>
        q.eq("userId", userId).eq("campaignId", campaignId)
      )
      .first();

    if (existing) return existing._id;

    const campaign = await ctx.db.get(campaignId);
    if (!campaign) throw new Error("Campaign not found");

    const now = Date.now();
    if (now > campaign.endDate) throw new Error("Campaign has ended");

    return ctx.db.insert("userCampaignEnrollment", {
      userId,
      campaignId,
      homeId,
      tasksCompleted: [],
      totalPointsEarned: 0,
      percentComplete: 0,
      status: "enrolled",
      enrolledAt: now,
    });
  },
});

export const completeCampaignTask = mutation({
  args: {
    userId: v.id("userProfiles"),
    campaignId: v.id("seasonalCampaignDefs"),
    taskIndex: v.number(),
  },
  handler: async (ctx, { userId, campaignId, taskIndex }) => {
    const enrollment = await ctx.db
      .query("userCampaignEnrollment")
      .withIndex("by_user_campaign", (q) =>
        q.eq("userId", userId).eq("campaignId", campaignId)
      )
      .first();

    if (!enrollment) throw new Error("Not enrolled in this campaign");
    if (enrollment.status === "completed" || enrollment.status === "expired") {
      throw new Error("Campaign is no longer active");
    }

    const alreadyDone = enrollment.tasksCompleted.some(
      (t) => t.taskIndex === taskIndex
    );
    if (alreadyDone) return { alreadyCompleted: true };

    const campaign = await ctx.db.get(campaignId);
    if (!campaign) throw new Error("Campaign not found");

    const task = campaign.challengeTasks[taskIndex];
    if (!task) throw new Error("Invalid task index");

    const now = Date.now();
    let pointsEarned = task.pointsValue;

    if (task.bonusPoints && campaign.startDate) {
      const earlyDeadline = campaign.startDate + 30 * 24 * 60 * 60 * 1000;
      if (now < earlyDeadline) {
        pointsEarned += task.bonusPoints;
      }
    }

    const newTasksCompleted = [
      ...enrollment.tasksCompleted,
      { taskIndex, completedAt: now, pointsEarned },
    ];

    const newTotalPoints = enrollment.totalPointsEarned + pointsEarned;
    const percentComplete = Math.round(
      (newTasksCompleted.length / campaign.challengeTasks.length) * 100
    );

    const isComplete = newTasksCompleted.length === campaign.challengeTasks.length;

    let finalPoints = newTotalPoints;
    if (isComplete) {
      finalPoints += campaign.completionBonusPoints;
    }

    await ctx.db.patch(enrollment._id, {
      tasksCompleted: newTasksCompleted,
      totalPointsEarned: finalPoints,
      percentComplete,
      status: isComplete ? "completed" : "in_progress",
      completedAt: isComplete ? now : undefined,
    });

    await ctx.db.insert("pointTransactions", {
      userId,
      points: pointsEarned,
      type: "seasonal_challenge",
      description: `Campaign task: ${task.title}`,
      referenceId: campaignId,
      createdAt: now,
    });

    const profile = await ctx.db
      .query("userGameProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (profile) {
      const LEVELS = [
        { level: 1, minPoints: 0 },
        { level: 2, minPoints: 100 },
        { level: 3, minPoints: 400 },
        { level: 4, minPoints: 900 },
        { level: 5, minPoints: 1600 },
        { level: 6, minPoints: 2500 },
        { level: 7, minPoints: 3600 },
        { level: 8, minPoints: 4900 },
        { level: 9, minPoints: 6400 },
        { level: 10, minPoints: 8100 },
      ];
      const LEVEL_NAMES = [
        "New Homeowner", "Handy Helper", "DIY Apprentice", "Maintenance Pro",
        "Home Guardian", "Property Master", "System Sage", "Home Whisperer",
        "Estate Expert", "Legendary Keeper",
      ];

      const newTotal = profile.totalPoints + pointsEarned;
      let levelIdx = 0;
      for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (newTotal >= LEVELS[i].minPoints) { levelIdx = i; break; }
      }
      const nextMin = LEVELS[levelIdx + 1]?.minPoints ?? 0;

      await ctx.db.patch(profile._id, {
        totalPoints: newTotal,
        currentLevel: LEVELS[levelIdx].level,
        currentLevelName: LEVEL_NAMES[levelIdx],
        pointsToNextLevel: nextMin ? nextMin - newTotal : 0,
        seasonalChallengePoints: profile.seasonalChallengePoints + pointsEarned,
        updatedAt: now,
      });
    }

    if (isComplete) {
      await ctx.db.insert("pointTransactions", {
        userId,
        points: campaign.completionBonusPoints,
        type: "seasonal_challenge",
        description: `Completed campaign: ${campaign.name}`,
        referenceId: campaignId,
        createdAt: now,
      });

      await ctx.db.insert("appNotifications", {
        userId,
        type: "seasonal_campaign",
        title: "Campaign Complete!",
        body: `You completed ${campaign.name}! +${campaign.completionBonusPoints} bonus points!`,
        data: { campaignId },
        read: false,
        sentAt: now,
      });
    }

    return { pointsEarned, isComplete, percentComplete };
  },
});

export const seedSeasonalCampaigns = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("seasonalCampaignDefs").first();
    if (existing) return { status: "already_seeded", count: 0 };

    const now = Date.now();
    const year = new Date().getFullYear();

    const campaigns = [
      {
        name: "Spring Home Revival",
        description: "Recover from winter, prepare for storms. Homes that complete spring prep have 68% fewer emergency AC calls in summer.",
        season: "spring" as const,
        year,
        startDate: new Date(year, 2, 15).getTime(),
        endDate: new Date(year, 4, 31, 23, 59, 59).getTime(),
        climateZones: ["3A", "3B", "4A", "4B", "4C", "5A", "5B", "6A", "6B", "7"],
        challengeTasks: [
          { title: "Clean gutters and downspouts", description: "Remove debris and verify drainage away from foundation", category: "exterior", pointsValue: 60, estimatedMinutes: 45, estimatedCost: 0 },
          { title: "Test sump pump operation", description: "Pour water into pit and verify pump activates and drains", category: "plumbing", pointsValue: 40, estimatedMinutes: 15 },
          { title: "Inspect roof for winter damage", description: "Look for missing shingles, damaged flashing, and attic moisture", category: "roofing", pointsValue: 50, estimatedMinutes: 30 },
          { title: "Service AC before summer", description: "Schedule tune-up or clean filters and check refrigerant", category: "hvac", pointsValue: 80, bonusPoints: 20, estimatedMinutes: 30, estimatedCost: 150 },
          { title: "Check window and door caulking", description: "Repair any cracked or missing caulk around windows and doors", category: "exterior", pointsValue: 40, estimatedMinutes: 30, estimatedCost: 15 },
          { title: "Test smoke and CO detectors", description: "Press test button on each detector and replace batteries if needed", category: "electrical", pointsValue: 30, estimatedMinutes: 15 },
          { title: "Flush water heater tank", description: "Drain sediment to improve efficiency and extend lifespan", category: "plumbing", pointsValue: 50, estimatedMinutes: 30 },
          { title: "Inspect foundation for frost heave cracks", description: "Walk perimeter looking for new cracks from freeze/thaw cycles", category: "foundation", pointsValue: 60, estimatedMinutes: 20 },
          { title: "Clean dryer vent", description: "Remove lint buildup from vent duct to prevent fire risk", category: "appliance", pointsValue: 40, estimatedMinutes: 30 },
          { title: "Check irrigation system startup", description: "Verify all zones activate and check for leaks or broken heads", category: "exterior", pointsValue: 40, estimatedMinutes: 30, estimatedCost: 0 },
        ],
        completionBonusPoints: 200,
        totalPossiblePoints: 690,
        isActive: true,
        createdAt: now,
      },
      {
        name: "Summer Shield",
        description: "Peak performance and efficiency. Summer puts maximum stress on cooling and water systems. Mid-year checkup prevents August breakdowns.",
        season: "summer" as const,
        year,
        startDate: new Date(year, 5, 1).getTime(),
        endDate: new Date(year, 7, 31, 23, 59, 59).getTime(),
        climateZones: ["1A", "2A", "2B", "3A", "3B", "4A"],
        challengeTasks: [
          { title: "Replace HVAC filters", description: "Install fresh filters for maximum summer cooling efficiency", category: "hvac", pointsValue: 40, estimatedMinutes: 15, estimatedCost: 20 },
          { title: "Clean condenser coils", description: "Spray down outdoor AC unit to remove debris", category: "hvac", pointsValue: 60, estimatedMinutes: 30 },
          { title: "Check refrigerant levels", description: "Schedule professional check if cooling seems weak", category: "hvac", pointsValue: 50, estimatedMinutes: 15, estimatedCost: 100 },
          { title: "Inspect ceiling fans", description: "Clean blades and verify counterclockwise rotation for summer", category: "electrical", pointsValue: 30, estimatedMinutes: 15 },
          { title: "Check attic ventilation", description: "Ensure attic vents and fans are clear to reduce heat buildup", category: "insulation", pointsValue: 50, estimatedMinutes: 20 },
          { title: "Test sprinkler system efficiency", description: "Verify coverage, check for leaks, adjust for summer heat", category: "exterior", pointsValue: 40, estimatedMinutes: 20 },
          { title: "Inspect weatherstripping", description: "Check door and window seals to keep cool air inside", category: "exterior", pointsValue: 40, estimatedMinutes: 20, estimatedCost: 15 },
          { title: "Check water heater temperature", description: "Verify setting is 120°F — not higher", category: "plumbing", pointsValue: 30, estimatedMinutes: 5 },
          { title: "Clean range hood filter", description: "Remove grease buildup for proper ventilation", category: "appliance", pointsValue: 20, estimatedMinutes: 15 },
          { title: "Run water meter leak test", description: "Turn off all water, check if meter moves — indicates hidden leak", category: "plumbing", pointsValue: 60, estimatedMinutes: 30 },
        ],
        completionBonusPoints: 200,
        totalPossiblePoints: 620,
        isActive: true,
        createdAt: now,
      },
      {
        name: "Fall Fortress",
        description: "Prepare for heating season and freezing temps. 73% fewer emergency heating calls November through February for homes completing Fall prep.",
        season: "fall" as const,
        year,
        startDate: new Date(year, 8, 1).getTime(),
        endDate: new Date(year, 10, 30, 23, 59, 59).getTime(),
        climateZones: ["3A", "3B", "4A", "4B", "4C", "5A", "5B", "6A", "6B", "7"],
        challengeTasks: [
          { title: "Schedule furnace tune-up", description: "Professional inspection before heating season", category: "hvac", pointsValue: 80, bonusPoints: 20, estimatedMinutes: 60, estimatedCost: 150 },
          { title: "Replace furnace filter", description: "Install fresh filter for heating season", category: "hvac", pointsValue: 40, estimatedMinutes: 10, estimatedCost: 20 },
          { title: "Reverse ceiling fan direction", description: "Clockwise rotation pushes warm air down in winter", category: "electrical", pointsValue: 20, estimatedMinutes: 5 },
          { title: "Insulate exposed pipes", description: "Add foam insulation to pipes in unheated areas", category: "plumbing", pointsValue: 50, estimatedMinutes: 30, estimatedCost: 15 },
          { title: "Clean gutters (fallen leaves)", description: "Remove leaves before winter freeze traps them", category: "exterior", pointsValue: 60, estimatedMinutes: 45 },
          { title: "Test heating system", description: "Run furnace and verify even heating throughout home", category: "hvac", pointsValue: 50, estimatedMinutes: 15 },
          { title: "Seal gaps around doors and windows", description: "Apply caulk or weatherstripping to prevent drafts", category: "exterior", pointsValue: 50, estimatedMinutes: 30, estimatedCost: 20 },
          { title: "Drain and store garden hoses", description: "Disconnect, drain, and store to prevent freeze damage", category: "plumbing", pointsValue: 30, estimatedMinutes: 15 },
          { title: "Inspect chimney and fireplace", description: "Schedule professional inspection if you use fireplace", category: "hvac", pointsValue: 50, estimatedMinutes: 15, estimatedCost: 200 },
          { title: "Test sump pump backup battery", description: "Verify backup power is ready for spring thaw", category: "plumbing", pointsValue: 40, estimatedMinutes: 10 },
        ],
        completionBonusPoints: 200,
        totalPossiblePoints: 670,
        isActive: true,
        createdAt: now,
      },
      {
        name: "Winter Warrior",
        description: "Protect against the cold, plan for spring. Winter is planning season — set up your entire year and budget accurately.",
        season: "winter" as const,
        year,
        startDate: new Date(year, 11, 1).getTime(),
        endDate: new Date(year + 1, 1, 28, 23, 59, 59).getTime(),
        climateZones: ["4A", "4B", "4C", "5A", "5B", "6A", "6B", "7"],
        challengeTasks: [
          { title: "Monitor pipe temps in vulnerable areas", description: "Check crawl spaces and unheated areas weekly during cold snaps", category: "plumbing", pointsValue: 40, estimatedMinutes: 10 },
          { title: "Check for ice dams on roof", description: "Look for ice buildup at eaves and in gutters", category: "roofing", pointsValue: 40, estimatedMinutes: 15 },
          { title: "Test emergency heating backup", description: "Verify space heaters or fireplace are operational", category: "hvac", pointsValue: 50, estimatedMinutes: 15 },
          { title: "Check attic insulation", description: "Verify insulation depth and coverage for heat retention", category: "insulation", pointsValue: 50, estimatedMinutes: 20 },
          { title: "Monitor indoor humidity (30-50%)", description: "Use a hygrometer to prevent too-dry or too-damp conditions", category: "hvac", pointsValue: 30, estimatedMinutes: 5, estimatedCost: 15 },
          { title: "Inspect water heater anode rod", description: "Replace if significantly corroded to extend tank life", category: "plumbing", pointsValue: 60, estimatedMinutes: 30 },
          { title: "Check for drafts with incense test", description: "Hold incense near windows and doors to find air leaks", category: "exterior", pointsValue: 40, estimatedMinutes: 20 },
          { title: "Service winter equipment", description: "Maintain snowblower, check ice melt supplies", category: "exterior", pointsValue: 30, estimatedMinutes: 20, estimatedCost: 25 },
          { title: "Inspect exterior for ice damage", description: "Monthly check for ice-related damage to siding, foundation, walkways", category: "exterior", pointsValue: 40, estimatedMinutes: 15 },
          { title: "Plan spring maintenance schedule", description: "Review Kept forecast and pre-schedule spring tasks", category: "general", pointsValue: 50, estimatedMinutes: 20 },
        ],
        completionBonusPoints: 200,
        totalPossiblePoints: 630,
        isActive: true,
        createdAt: now,
      },
    ];

    let count = 0;
    for (const c of campaigns) {
      await ctx.db.insert("seasonalCampaignDefs", c);
      count++;
    }

    return { status: "seeded", count };
  },
});
