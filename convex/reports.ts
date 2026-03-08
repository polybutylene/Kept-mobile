import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import {
  getProfileFromAuthId,
  getUserPortfolioId,
} from "./lib/permissions";

// =====================================================
// PORTFOLIO REPORTS
// =====================================================

/**
 * Get comprehensive portfolio summary
 */
export const getPortfolioSummary = query({
  args: {
    dateRange: v.optional(v.object({
      startDate: v.string(),
      endDate: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile || profile.tier !== "property_manager") return null;

    const portfolioId = await getUserPortfolioId(ctx, profile._id);
    if (!portfolioId) return null;

    const portfolio = await ctx.db.get(portfolioId);
    if (!portfolio) return null;

    // Get properties
    const properties = await ctx.db
      .query("properties")
      .withIndex("by_portfolio_active", (q) =>
        q.eq("portfolioId", portfolioId).eq("isArchived", false)
      )
      .take(200);

    // Get units
    const units = await ctx.db
      .query("units")
      .withIndex("by_portfolio", (q) => q.eq("portfolioId", portfolioId))
      .take(200);

    // Get work orders
    const workOrders = await ctx.db
      .query("workOrders")
      .withIndex("by_portfolio", (q) => q.eq("portfolioId", portfolioId))
      .take(200);

    // Get vendors
    const vendors = await ctx.db
      .query("vendors")
      .withIndex("by_portfolio_active", (q) =>
        q.eq("portfolioId", portfolioId).eq("isActive", true)
      )
      .take(200);

    // Calculate stats
    const activeOwners = units.filter((u) => u.status === "owner_active").length;
    const pendingInvites = units.filter((u) => u.status === "pending_invite").length;
    const vacantUnits = units.filter((u) => u.status === "vacant").length;

    const openWorkOrders = workOrders.filter((wo) =>
      ["submitted", "triaged", "open", "assigned", "scheduled"].includes(wo.status)
    ).length;
    const inProgressWorkOrders = workOrders.filter((wo) => wo.status === "in_progress").length;
    const completedThisMonth = workOrders.filter((wo) => {
      if (wo.status !== "completed" && wo.status !== "verified") return false;
      if (!wo.completedDate) return false;
      const completed = new Date(wo.completedDate);
      const now = new Date();
      return (
        completed.getMonth() === now.getMonth() &&
        completed.getFullYear() === now.getFullYear()
      );
    }).length;

    const overdueWorkOrders = workOrders.filter(
      (wo) =>
        wo.slaTargetAt &&
        Date.now() > wo.slaTargetAt &&
        !["completed", "verified", "cancelled"].includes(wo.status)
    ).length;

    // Calculate total costs this month
    const thisMonthCosts = workOrders
      .filter((wo) => {
        if (!wo.completedDate) return false;
        const completed = new Date(wo.completedDate);
        const now = new Date();
        return (
          completed.getMonth() === now.getMonth() &&
          completed.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, wo) => sum + (wo.totalCost || 0), 0);

    return {
      portfolio: {
        name: portfolio.name,
        plan: portfolio.plan,
        seatLimit: portfolio.seatLimit,
        currentSeats: portfolio.currentSeats,
      },
      properties: {
        total: properties.length,
        totalUnits: units.length,
        activeOwners,
        pendingInvites,
        vacantUnits,
        occupancyRate:
          units.length > 0
            ? Math.round((activeOwners / units.length) * 100)
            : 0,
      },
      workOrders: {
        open: openWorkOrders,
        inProgress: inProgressWorkOrders,
        completedThisMonth,
        overdue: overdueWorkOrders,
        total: workOrders.length,
      },
      vendors: {
        active: vendors.length,
        preferred: vendors.filter((v) => v.isPreferred).length,
      },
      costs: {
        thisMonth: Math.round(thisMonthCosts),
      },
    };
  },
});

/**
 * Get aging work orders report
 */
export const getAgingWorkOrders = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile || profile.tier !== "property_manager") return null;

    const workOrders = await ctx.db
      .query("workOrders")
      .withIndex("by_manager_status", (q) => q.eq("managerId", profile._id))
      .take(500);

    // Filter to open work orders only
    const openOrders = workOrders.filter((wo) =>
      ["submitted", "triaged", "open", "assigned", "scheduled", "in_progress"].includes(
        wo.status
      )
    );

    // Calculate age buckets
    const now = Date.now();
    const buckets = {
      under24h: [] as any[],
      "1to3days": [] as any[],
      "4to7days": [] as any[],
      over7days: [] as any[],
      over14days: [] as any[],
      over30days: [] as any[],
    };

    for (const wo of openOrders) {
      const ageHours = (now - wo._creationTime) / (1000 * 60 * 60);
      const ageDays = ageHours / 24;

      const home = await ctx.db.get(wo.homeId);

      const item = {
        _id: wo._id,
        title: wo.title,
        status: wo.status,
        priority: wo.priority,
        homeName: home?.name || home?.addressLine1,
        createdAt: wo._creationTime,
        ageHours: Math.round(ageHours),
        ageDays: Math.round(ageDays),
        isOverdue: wo.slaTargetAt ? now > wo.slaTargetAt : false,
      };

      if (ageDays > 30) {
        buckets.over30days.push(item);
      } else if (ageDays > 14) {
        buckets.over14days.push(item);
      } else if (ageDays > 7) {
        buckets.over7days.push(item);
      } else if (ageDays > 3) {
        buckets["4to7days"].push(item);
      } else if (ageDays > 1) {
        buckets["1to3days"].push(item);
      } else {
        buckets.under24h.push(item);
      }
    }

    return {
      buckets,
      totals: {
        under24h: buckets.under24h.length,
        "1to3days": buckets["1to3days"].length,
        "4to7days": buckets["4to7days"].length,
        over7days: buckets.over7days.length,
        over14days: buckets.over14days.length,
        over30days: buckets.over30days.length,
      },
      totalOpen: openOrders.length,
    };
  },
});

/**
 * Get vendor performance report
 */
export const getVendorPerformance = query({
  args: {
    dateRange: v.optional(v.object({
      startDate: v.string(),
      endDate: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile || profile.tier !== "property_manager") return null;

    const portfolioId = await getUserPortfolioId(ctx, profile._id);
    if (!portfolioId) return null;

    const vendors = await ctx.db
      .query("vendors")
      .withIndex("by_portfolio", (q) => q.eq("portfolioId", portfolioId))
      .collect();

    const vendorPerformance = await Promise.all(
      vendors.map(async (vendor) => {
        // Get work orders assigned to this vendor
        const workOrders = await ctx.db
          .query("workOrders")
          .withIndex("by_assignedVendor", (q) => q.eq("assignedVendorId", vendor._id))
          .collect();

        // Calculate metrics
        const completedOrders = workOrders.filter(
          (wo) => wo.status === "completed" || wo.status === "verified"
        );

        const totalCost = completedOrders.reduce(
          (sum, wo) => sum + (wo.totalCost || 0),
          0
        );

        const onTimeCounts = completedOrders.filter((wo) => wo.slaMet === true).length;
        const onTimeRate =
          completedOrders.length > 0
            ? Math.round((onTimeCounts / completedOrders.length) * 100)
            : null;

        // Get ratings
        const ratings = await ctx.db
          .query("vendorRatings")
          .withIndex("by_vendor", (q) => q.eq("vendorId", vendor._id))
          .collect();

        const avgRating =
          ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.overallRating, 0) / ratings.length
            : null;

        return {
          _id: vendor._id,
          companyName: vendor.companyName,
          specialties: vendor.specialties,
          isPreferred: vendor.isPreferred,
          isActive: vendor.isActive,
          metrics: {
            totalJobs: workOrders.length,
            completedJobs: completedOrders.length,
            totalCost: Math.round(totalCost),
            avgJobCost:
              completedOrders.length > 0
                ? Math.round(totalCost / completedOrders.length)
                : 0,
            onTimeRate,
            avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
            reviewCount: ratings.length,
          },
        };
      })
    );

    // Sort by completed jobs (most active first)
    return vendorPerformance.sort(
      (a, b) => b.metrics.completedJobs - a.metrics.completedJobs
    );
  },
});

/**
 * Get work order completion trends
 */
export const getCompletionTrends = query({
  args: {
    months: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile || profile.tier !== "property_manager") return null;

    const monthsToShow = args.months || 6;
    const workOrders = await ctx.db
      .query("workOrders")
      .withIndex("by_manager_status", (q) => q.eq("managerId", profile._id))
      .take(500);

    // Group by month
    const monthlyData: Record<
      string,
      { created: number; completed: number; totalCost: number }
    > = {};

    // Initialize months
    for (let i = 0; i < monthsToShow; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthlyData[key] = { created: 0, completed: 0, totalCost: 0 };
    }

    for (const wo of workOrders) {
      // Created
      const createdDate = new Date(wo._creationTime);
      const createdKey = `${createdDate.getFullYear()}-${String(
        createdDate.getMonth() + 1
      ).padStart(2, "0")}`;
      if (monthlyData[createdKey]) {
        monthlyData[createdKey].created++;
      }

      // Completed
      if (
        wo.completedDate &&
        (wo.status === "completed" || wo.status === "verified")
      ) {
        const completedDate = new Date(wo.completedDate);
        const completedKey = `${completedDate.getFullYear()}-${String(
          completedDate.getMonth() + 1
        ).padStart(2, "0")}`;
        if (monthlyData[completedKey]) {
          monthlyData[completedKey].completed++;
          monthlyData[completedKey].totalCost += wo.totalCost || 0;
        }
      }
    }

    // Convert to array sorted by date
    const trends = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        label: new Date(month + "-01").toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        }),
        ...data,
        totalCost: Math.round(data.totalCost),
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return trends;
  },
});

/**
 * Get property performance breakdown
 */
export const getPropertyPerformance = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile || profile.tier !== "property_manager") return null;

    const portfolioId = await getUserPortfolioId(ctx, profile._id);
    if (!portfolioId) return null;

    const properties = await ctx.db
      .query("properties")
      .withIndex("by_portfolio_active", (q) =>
        q.eq("portfolioId", portfolioId).eq("isArchived", false)
      )
      .take(200);

    const propertyPerformance = await Promise.all(
      properties.map(async (property) => {
        // Get units for this property
        const units = await ctx.db
          .query("units")
          .withIndex("by_property", (q) => q.eq("propertyId", property._id))
          .collect();

        // Get homes linked to these units
        const homeIds = units
          .filter((u) => u.homeId)
          .map((u) => u.homeId!);

        // Get work orders for these homes
        let totalWorkOrders = 0;
        let openWorkOrders = 0;
        let totalCost = 0;

        for (const homeId of homeIds) {
          const workOrders = await ctx.db
            .query("workOrders")
            .withIndex("by_home", (q) => q.eq("homeId", homeId))
            .collect();

          totalWorkOrders += workOrders.length;
          openWorkOrders += workOrders.filter((wo) =>
            ["submitted", "triaged", "open", "assigned", "scheduled", "in_progress"].includes(
              wo.status
            )
          ).length;
          totalCost += workOrders
            .filter(
              (wo) => wo.status === "completed" || wo.status === "verified"
            )
            .reduce((sum, wo) => sum + (wo.totalCost || 0), 0);
        }

        return {
          _id: property._id,
          name: property.name,
          address: `${property.city}, ${property.state}`,
          metrics: {
            totalUnits: units.length,
            activeOwners: units.filter((u) => u.status === "owner_active").length,
            occupancyRate:
              units.length > 0
                ? Math.round(
                    (units.filter((u) => u.status === "owner_active").length /
                      units.length) *
                      100
                  )
                : 0,
            totalWorkOrders,
            openWorkOrders,
            totalCost: Math.round(totalCost),
          },
        };
      })
    );

    return propertyPerformance.sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  },
});

/**
 * Get activity log for audit purposes
 */
export const getActivityLog = query({
  args: {
    limit: v.optional(v.number()),
    eventTypes: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await getProfileFromAuthId(ctx, userId);
    if (!profile || profile.tier !== "property_manager") return [];

    const portfolioId = await getUserPortfolioId(ctx, profile._id);
    if (!portfolioId) return [];

    // Get work order events as activity
    const workOrderEvents = await ctx.db
      .query("workOrderEvents")
      .order("desc")
      .take(args.limit || 50);

    // Enrich with context
    const enriched = await Promise.all(
      workOrderEvents.map(async (event) => {
        const workOrder = await ctx.db.get(event.workOrderId);
        const user = await ctx.db.get(event.userId);

        return {
          _id: event._id,
          timestamp: event._creationTime,
          eventType: event.eventType,
          description: formatEventDescription(event),
          userName: user?.fullName || user?.email || "Unknown",
          workOrderTitle: workOrder?.title,
          workOrderId: event.workOrderId,
          previousValue: event.previousValue,
          newValue: event.newValue,
          note: event.note,
        };
      })
    );

    return enriched;
  },
});

function formatEventDescription(event: any): string {
  switch (event.eventType) {
    case "created":
      return "Work order created";
    case "status_changed":
      return `Status changed from ${event.previousValue} to ${event.newValue}`;
    case "assigned":
      return `Assigned to ${event.newValue}`;
    case "scheduled":
      return `Scheduled for ${event.newValue}`;
    case "rescheduled":
      return `Rescheduled from ${event.previousValue} to ${event.newValue}`;
    case "completed":
      return "Work order completed";
    case "note_added":
      return "Note added";
    default:
      return event.eventType.replace(/_/g, " ");
  }
}
