import { mutation } from "./_generated/server";

export const seedAllBadges = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("badges").first();
    if (existing) {
      return { status: "already_seeded", count: 0 };
    }

    const now = Date.now();
    const badges = [
      // ── Milestone badges ──
      { name: "First Task", description: "Complete your first maintenance task", iconName: "CheckCircle", category: "milestone" as const, requirement: { type: "tasks_completed", threshold: 1 }, pointsValue: 50, rarity: "common" as const },
      { name: "Task Master 10", description: "Complete 10 maintenance tasks", iconName: "ListChecks", category: "milestone" as const, requirement: { type: "tasks_completed", threshold: 10 }, pointsValue: 100, rarity: "common" as const },
      { name: "Task Master 50", description: "Complete 50 maintenance tasks", iconName: "Medal", category: "milestone" as const, requirement: { type: "tasks_completed", threshold: 50 }, pointsValue: 200, rarity: "uncommon" as const },
      { name: "Century Club", description: "Complete 100 maintenance tasks", iconName: "Award", category: "milestone" as const, requirement: { type: "tasks_completed", threshold: 100 }, pointsValue: 500, rarity: "rare" as const },
      { name: "Task Legend", description: "Complete 500 maintenance tasks", iconName: "Crown", category: "milestone" as const, requirement: { type: "tasks_completed", threshold: 500 }, pointsValue: 1000, rarity: "legendary" as const },

      // ── Streak badges ──
      { name: "Week Warrior", description: "Maintain a 7-day activity streak", iconName: "Flame", category: "streak" as const, requirement: { type: "streak_days", threshold: 7 }, pointsValue: 50, rarity: "common" as const },
      { name: "Month Strong", description: "Maintain a 4-week activity streak", iconName: "Flame", category: "streak" as const, requirement: { type: "streak_weeks", threshold: 4 }, pointsValue: 150, rarity: "uncommon" as const },
      { name: "Quarter Champion", description: "Maintain a 13-week activity streak", iconName: "Zap", category: "streak" as const, requirement: { type: "streak_weeks", threshold: 13 }, pointsValue: 300, rarity: "rare" as const },
      { name: "Year Round", description: "Maintain a 52-week activity streak", iconName: "Trophy", category: "streak" as const, requirement: { type: "streak_weeks", threshold: 52 }, pointsValue: 1000, rarity: "legendary" as const },

      // ── Weather badges ──
      { name: "Storm Ready", description: "Complete your first weather checklist", iconName: "CloudRain", category: "weather" as const, requirement: { type: "weather_checklists_completed", threshold: 1 }, pointsValue: 75, rarity: "common" as const },
      { name: "Weather Warrior", description: "Complete 5 weather checklists", iconName: "CloudLightning", category: "weather" as const, requirement: { type: "weather_checklists_completed", threshold: 5 }, pointsValue: 200, rarity: "uncommon" as const },
      { name: "Force of Nature", description: "Complete 20 weather checklists", iconName: "Tornado", category: "weather" as const, requirement: { type: "weather_checklists_completed", threshold: 20 }, pointsValue: 400, rarity: "rare" as const },
      { name: "Storm Chaser", description: "Complete checklists for 5 different weather types", iconName: "Wind", category: "weather" as const, requirement: { type: "weather_types_completed", threshold: 5 }, pointsValue: 500, rarity: "epic" as const },

      // ── Savings badges ──
      { name: "Smart Saver", description: "Estimated $500 in preventive savings", iconName: "PiggyBank", category: "savings" as const, requirement: { type: "savings_estimated", threshold: 500 }, pointsValue: 100, rarity: "common" as const },
      { name: "Budget Boss", description: "Estimated $2,500 in preventive savings", iconName: "TrendingDown", category: "savings" as const, requirement: { type: "savings_estimated", threshold: 2500 }, pointsValue: 200, rarity: "uncommon" as const },
      { name: "Money Master", description: "Estimated $10,000 in preventive savings", iconName: "DollarSign", category: "savings" as const, requirement: { type: "savings_estimated", threshold: 10000 }, pointsValue: 400, rarity: "rare" as const },
      { name: "Fortune Keeper", description: "Estimated $25,000+ in preventive savings", iconName: "Gem", category: "savings" as const, requirement: { type: "savings_estimated", threshold: 25000 }, pointsValue: 750, rarity: "epic" as const },

      // ── Seasonal badges ──
      { name: "Spring Cleaner", description: "Complete Spring seasonal campaign", iconName: "Flower2", category: "seasonal" as const, requirement: { type: "campaign_completed", threshold: 1, metadata: { season: "spring" } }, pointsValue: 200, rarity: "uncommon" as const },
      { name: "Summer Shield", description: "Complete Summer seasonal campaign", iconName: "Sun", category: "seasonal" as const, requirement: { type: "campaign_completed", threshold: 1, metadata: { season: "summer" } }, pointsValue: 200, rarity: "uncommon" as const },
      { name: "Fall Fortress", description: "Complete Fall seasonal campaign", iconName: "Leaf", category: "seasonal" as const, requirement: { type: "campaign_completed", threshold: 1, metadata: { season: "fall" } }, pointsValue: 200, rarity: "uncommon" as const },
      { name: "Winter Warrior", description: "Complete Winter seasonal campaign", iconName: "Snowflake", category: "seasonal" as const, requirement: { type: "campaign_completed", threshold: 1, metadata: { season: "winter" } }, pointsValue: 200, rarity: "uncommon" as const },
      { name: "Four Season Champion", description: "Complete all 4 seasonal campaigns in one year", iconName: "Star", category: "seasonal" as const, requirement: { type: "all_campaigns_one_year", threshold: 4 }, pointsValue: 1000, rarity: "legendary" as const },

      // ── System mastery badges ──
      { name: "Plumbing Pro", description: "Complete 10 plumbing maintenance tasks", iconName: "Wrench", category: "system_mastery" as const, requirement: { type: "category_tasks_completed", threshold: 10, metadata: { category: "plumbing" } }, pointsValue: 150, rarity: "uncommon" as const },
      { name: "HVAC Hero", description: "Complete 10 HVAC maintenance tasks", iconName: "Thermometer", category: "system_mastery" as const, requirement: { type: "category_tasks_completed", threshold: 10, metadata: { category: "hvac" } }, pointsValue: 150, rarity: "uncommon" as const },
      { name: "Electrical Eagle", description: "Complete 10 electrical maintenance tasks", iconName: "Zap", category: "system_mastery" as const, requirement: { type: "category_tasks_completed", threshold: 10, metadata: { category: "electrical" } }, pointsValue: 150, rarity: "uncommon" as const },
      { name: "Roof Ranger", description: "Complete 10 roofing maintenance tasks", iconName: "Home", category: "system_mastery" as const, requirement: { type: "category_tasks_completed", threshold: 10, metadata: { category: "roofing" } }, pointsValue: 150, rarity: "uncommon" as const },
      { name: "Full Spectrum", description: "Earn mastery badges in 5+ system categories", iconName: "Shield", category: "system_mastery" as const, requirement: { type: "mastery_categories", threshold: 5 }, pointsValue: 500, rarity: "epic" as const },

      // ── Community badges ──
      { name: "Good Neighbor", description: "Refer your first friend to Kept", iconName: "Users", category: "community" as const, requirement: { type: "referrals", threshold: 1 }, pointsValue: 200, rarity: "common" as const },
      { name: "Block Captain", description: "Refer 5 friends to Kept", iconName: "UserPlus", category: "community" as const, requirement: { type: "referrals", threshold: 5 }, pointsValue: 400, rarity: "rare" as const },
    ];

    let count = 0;
    for (const badge of badges) {
      await ctx.db.insert("badges", {
        ...badge,
        isActive: true,
        createdAt: now,
      });
      count++;
    }

    return { status: "seeded", count };
  },
});
