/**
 * Seasonal Campaigns
 * 
 * Manages seasonal readiness campaigns with checklists
 * and HP rewards for completing home maintenance tasks.
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { getProfileFromAuthId } from "./lib/permissions";
import {
  CAMPAIGN_DEFINITIONS,
  getCampaignDefinition,
  getActiveCampaignType,
  getNextCampaign,
  getCampaignEndDate,
  generateCampaignId,
  calculateCampaignMaxHP,
  getCampaignStatus,
  CampaignType,
} from "./lib/campaigns";
import { campaignType } from "./schema";

/**
 * Get all campaign definitions
 */
export const getCampaignDefinitions = query({
  args: {},
  handler: async () => {
    return CAMPAIGN_DEFINITIONS.map(campaign => ({
      ...campaign,
      maxHP: calculateCampaignMaxHP(campaign),
    }));
  },
});

/**
 * Get the currently active campaign for a home
 */
export const getActiveCampaign = query({
  args: {
    homeId: v.id("homes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) return null;

    const home = await ctx.db.get(args.homeId);
    if (!home || home.ownerId !== profile._id) return null;

    const climateZoneId = home.climateZoneId ?? null;

    // Check if there's an active campaign (region-aware)
    const activeCampaignType = getActiveCampaignType(climateZoneId);
    
    if (!activeCampaignType) {
      const next = getNextCampaign(climateZoneId);
      return {
        status: "between_campaigns" as const,
        nextCampaign: next ? {
          ...next.campaign,
          startsIn: next.startsIn,
          maxHP: calculateCampaignMaxHP(next.campaign),
        } : null,
      };
    }

    const campaignDef = getCampaignDefinition(activeCampaignType);
    const year = new Date().getFullYear();
    const campaignId = generateCampaignId(activeCampaignType, year);

    // Check if user has started this campaign
    let progress = await ctx.db
      .query("campaignProgress")
      .withIndex("by_home_campaign", (q) => 
        q.eq("homeId", args.homeId).eq("campaignId", campaignId)
      )
      .first();

    // If no progress record, return the campaign template
    if (!progress) {
      const endDate = getCampaignEndDate(campaignDef, year);
      const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

      return {
        status: "not_started" as const,
        campaign: {
          ...campaignDef,
          campaignId,
          maxHP: calculateCampaignMaxHP(campaignDef),
          daysRemaining,
          year,
        },
      };
    }

    // Calculate days remaining
    const daysRemaining = Math.max(0, Math.ceil((progress.expiresAt - Date.now()) / (1000 * 60 * 60 * 24)));

    return {
      status: progress.completedAt ? "completed" as const : "in_progress" as const,
      campaign: {
        ...campaignDef,
        campaignId,
        maxHP: calculateCampaignMaxHP(campaignDef),
        daysRemaining,
        year,
      },
      progress: {
        ...progress,
        checklistItems: progress.checklistItems.map(item => {
          const defItem = campaignDef.checklist.find(c => c.id === item.itemId);
          return {
            ...item,
            instructions: defItem?.instructions,
            systemCategory: defItem?.systemCategory,
            articleSlugs: defItem?.articleSlugs,
          };
        }),
      },
    };
  },
});

/**
 * Start a seasonal campaign for a home
 */
export const startCampaign = mutation({
  args: {
    homeId: v.id("homes"),
    campaignType: campaignType,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) throw new Error("Profile not found");

    const home = await ctx.db.get(args.homeId);
    if (!home || home.ownerId !== profile._id) {
      throw new Error("Permission denied");
    }

    const campaignDef = getCampaignDefinition(args.campaignType);
    const year = new Date().getFullYear();
    const campaignId = generateCampaignId(args.campaignType, year);

    // Check if already started
    const existing = await ctx.db
      .query("campaignProgress")
      .withIndex("by_home_campaign", (q) => 
        q.eq("homeId", args.homeId).eq("campaignId", campaignId)
      )
      .first();

    if (existing) {
      throw new Error("Campaign already started");
    }

    const now = Date.now();
    const endDate = getCampaignEndDate(campaignDef, year);

    // Create campaign progress record
    const progressId = await ctx.db.insert("campaignProgress", {
      homeId: args.homeId,
      campaignId,
      campaignType: args.campaignType,
      year,
      startedAt: now,
      expiresAt: endDate.getTime(),
      checklistItems: campaignDef.checklist.map(item => ({
        itemId: item.id,
        description: item.description,
        hpValue: item.hpValue,
        systemTypeId: undefined,
        systemId: undefined,
        completedAt: undefined,
        completionMethod: undefined,
        linkedTaskId: undefined,
      })),
      itemsCompleted: 0,
      totalItems: campaignDef.checklist.length,
      hpEarned: 0,
      maxHP: calculateCampaignMaxHP(campaignDef),
      bonusHP: campaignDef.completionBonusHP,
      bonusAwarded: false,
    });

    return { progressId, campaignId };
  },
});

/**
 * Complete a campaign checklist item
 */
export const completeCampaignItem = mutation({
  args: {
    homeId: v.id("homes"),
    campaignId: v.string(),
    itemId: v.string(),
    linkedTaskId: v.optional(v.id("scheduledMaintenance")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) throw new Error("Profile not found");

    const home = await ctx.db.get(args.homeId);
    if (!home || home.ownerId !== profile._id) {
      throw new Error("Permission denied");
    }

    // Get campaign progress
    const progress = await ctx.db
      .query("campaignProgress")
      .withIndex("by_home_campaign", (q) => 
        q.eq("homeId", args.homeId).eq("campaignId", args.campaignId)
      )
      .first();

    if (!progress) {
      throw new Error("Campaign not started");
    }

    if (progress.completedAt) {
      throw new Error("Campaign already completed");
    }

    // Check if campaign has expired
    if (Date.now() > progress.expiresAt) {
      throw new Error("Campaign has expired");
    }

    // Find the item
    const itemIndex = progress.checklistItems.findIndex(i => i.itemId === args.itemId);
    if (itemIndex === -1) {
      throw new Error("Item not found");
    }

    const item = progress.checklistItems[itemIndex];
    if (item.completedAt) {
      throw new Error("Item already completed");
    }

    const now = Date.now();

    // Update the item
    const updatedItems = [...progress.checklistItems];
    updatedItems[itemIndex] = {
      ...item,
      completedAt: now,
      completionMethod: args.linkedTaskId ? "task_linked" : "manual",
      linkedTaskId: args.linkedTaskId,
    };

    const newItemsCompleted = progress.itemsCompleted + 1;
    const newHPEarned = progress.hpEarned + item.hpValue;

    // Check if all items completed
    const allCompleted = newItemsCompleted === progress.totalItems;
    let totalHPAwarded = item.hpValue;

    // Update progress
    await ctx.db.patch(progress._id, {
      checklistItems: updatedItems,
      itemsCompleted: newItemsCompleted,
      hpEarned: newHPEarned,
      completedAt: allCompleted ? now : undefined,
      bonusAwarded: allCompleted,
      badgeEarned: allCompleted ? `${progress.campaignType.charAt(0).toUpperCase() + progress.campaignType.slice(1)} ${progress.year} Ready` : undefined,
    });

    // Award HP for item completion
    const hpState = await ctx.db
      .query("homeHPState")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .first();

    await ctx.db.insert("hpEvents", {
      homeId: args.homeId,
      eventType: "earn",
      hpChange: item.hpValue,
      newBalance: (hpState?.currentHP ?? 0) + item.hpValue,
      reason: "campaign_item_completed",
      description: item.description,
      metadata: {
        campaignId: args.campaignId,
        campaignItemId: args.itemId,
      },
      occurredAt: now,
    });

    // Award bonus if all completed
    if (allCompleted) {
      totalHPAwarded += progress.bonusHP;

      await ctx.db.insert("hpEvents", {
        homeId: args.homeId,
        eventType: "bonus",
        hpChange: progress.bonusHP,
        newBalance: (hpState?.currentHP ?? 0) + item.hpValue + progress.bonusHP,
        reason: "campaign_completed",
        description: `Completed ${progress.campaignType.charAt(0).toUpperCase() + progress.campaignType.slice(1)} Readiness campaign!`,
        metadata: {
          campaignId: args.campaignId,
        },
        occurredAt: now,
      });
    }

    // Update HP state
    if (hpState) {
      await ctx.db.patch(hpState._id, {
        currentHP: hpState.currentHP + totalHPAwarded,
        lifetimeHPEarned: hpState.lifetimeHPEarned + totalHPAwarded,
        hpChangeThisWeek: hpState.hpChangeThisWeek + totalHPAwarded,
        hpChangeThisMonth: hpState.hpChangeThisMonth + totalHPAwarded,
      });
    }

    return {
      hpAwarded: totalHPAwarded,
      allCompleted,
      badgeEarned: allCompleted ? `${progress.campaignType.charAt(0).toUpperCase() + progress.campaignType.slice(1)} ${progress.year} Ready` : null,
    };
  },
});

/**
 * Get campaign history for a home
 */
export const getCampaignHistory = query({
  args: {
    homeId: v.id("homes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) return [];

    const home = await ctx.db.get(args.homeId);
    if (!home || home.ownerId !== profile._id) return [];

    const campaigns = await ctx.db
      .query("campaignProgress")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .order("desc")
      .collect();

    return campaigns.map(c => ({
      campaignId: c.campaignId,
      campaignType: c.campaignType,
      year: c.year,
      status: c.completedAt ? "completed" : (Date.now() > c.expiresAt ? "expired" : "in_progress"),
      itemsCompleted: c.itemsCompleted,
      totalItems: c.totalItems,
      hpEarned: c.hpEarned,
      maxHP: c.maxHP,
      badgeEarned: c.badgeEarned,
      completedAt: c.completedAt,
    }));
  },
});

/**
 * Get earned badges for a home
 */
export const getEarnedBadges = query({
  args: {
    homeId: v.id("homes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile) return [];

    const home = await ctx.db.get(args.homeId);
    if (!home || home.ownerId !== profile._id) return [];

    const completedCampaigns = await ctx.db
      .query("campaignProgress")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .filter((q) => q.neq(q.field("completedAt"), undefined))
      .collect();

    return completedCampaigns
      .filter(c => c.badgeEarned)
      .map(c => ({
        badge: c.badgeEarned,
        campaignType: c.campaignType,
        year: c.year,
        earnedAt: c.completedAt,
      }));
  },
});
