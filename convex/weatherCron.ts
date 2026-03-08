import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { fetchWeatherFromAPI, isCacheFresh } from "./lib/weatherService";
import { generateAdvisories } from "./lib/advisoryEngine";

const NOTIFICATION_COOLDOWN_MS = 6 * 60 * 60 * 1000;

export const getHomesWithWeather = internalQuery({
  args: {},
  handler: async (ctx) => {
    const homes = await ctx.db.query("homes").take(1000);
    return homes.filter(
      (h) =>
        !h.isArchived &&
        h.weatherLatitude !== undefined &&
        h.weatherLongitude !== undefined
    );
  },
});

export const getWeatherCache = internalQuery({
  args: { latitude: v.number(), longitude: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("weatherCache")
      .withIndex("by_location", (q) =>
        q.eq("latitude", args.latitude).eq("longitude", args.longitude)
      )
      .first();
  },
});

export const updateWeatherCache = internalMutation({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    forecast: v.any(),
    alerts: v.any(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("weatherCache")
      .withIndex("by_location", (q) =>
        q.eq("latitude", args.latitude).eq("longitude", args.longitude)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        fetchedAt: now,
        forecast: args.forecast,
        alerts: args.alerts,
      });
    } else {
      await ctx.db.insert("weatherCache", {
        latitude: args.latitude,
        longitude: args.longitude,
        fetchedAt: now,
        forecast: args.forecast,
        alerts: args.alerts,
      });
    }
  },
});

export const getHomeContext = internalQuery({
  args: { homeId: v.id("homes") },
  handler: async (ctx, args) => {
    const home = await ctx.db.get(args.homeId);
    if (!home) return null;

    const systems = await ctx.db
      .query("systems")
      .withIndex("by_home_active", (q) =>
        q.eq("homeId", args.homeId).eq("isArchived", false)
      )
      .collect();

    const systemTypeIds = [...new Set(systems.map((s) => s.systemTypeId))];
    const systemTypes = (
      await Promise.all(systemTypeIds.map((id) => ctx.db.get(id)))
    ).filter(Boolean);

    return { home, systems, systemTypes };
  },
});

export const checkAllPropertiesWeather = internalAction({
  args: {},
  handler: async (ctx) => {
    const homes = await ctx.runQuery(internal.weatherCron.getHomesWithWeather);
    let processed = 0;

    for (const home of homes) {
      try {
        const lat = home.weatherLatitude!;
        const lon = home.weatherLongitude!;

        const cached = await ctx.runQuery(internal.weatherCron.getWeatherCache, {
          latitude: lat,
          longitude: lon,
        });

        let forecast: any;
        let alerts: any;

        if (isCacheFresh(cached)) {
          forecast = cached!.forecast;
          alerts = cached!.alerts;
        } else {
          const fresh = await fetchWeatherFromAPI(lat, lon);
          if (!fresh) {
            if (cached) {
              forecast = cached.forecast;
              alerts = cached.alerts;
            } else {
              continue;
            }
          } else {
            forecast = fresh.forecast;
            alerts = fresh.alerts;
            await ctx.runMutation(internal.weatherCron.updateWeatherCache, {
              latitude: lat,
              longitude: lon,
              forecast,
              alerts,
            });
          }
        }

        const homeCtx = await ctx.runQuery(internal.weatherCron.getHomeContext, {
          homeId: home._id,
        });
        if (!homeCtx) continue;

        const advisories = generateAdvisories({
          forecast,
          alerts,
          systems: homeCtx.systems as any[],
          systemTypes: homeCtx.systemTypes as any[],
          homeYearBuilt: homeCtx.home.yearBuilt,
        });

        await ctx.runMutation(internal.weatherAdvisories.upsertHomeAdvisories, {
          homeId: home._id,
          advisories,
        });

        await ctx.runMutation(internal.weatherCron.sendNotificationsIfNeeded, {
          homeId: home._id,
          advisories: advisories.map((a) => ({
            severity: a.severity,
            title: a.title,
            description: a.description,
          })),
        });

        processed++;
      } catch (error) {
        console.error(`Weather check failed for home ${home._id}:`, error);
      }
    }

    return { processed };
  },
});

export const sendNotificationsIfNeeded = internalMutation({
  args: {
    homeId: v.id("homes"),
    advisories: v.array(
      v.object({
        severity: v.string(),
        title: v.string(),
        description: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    if (args.advisories.length === 0) return;

    const highSeverity = args.advisories.filter((a) => a.severity === "warning");
    if (highSeverity.length === 0) return;

    const prefs = await ctx.db
      .query("weatherNotificationPrefs")
      .withIndex("by_home", (q) => q.eq("homeId", args.homeId))
      .first();

    const now = Date.now();
    if (prefs?.lastSentAt && now - prefs.lastSentAt < NOTIFICATION_COOLDOWN_MS) {
      return;
    }

    const home = await ctx.db.get(args.homeId);
    if (!home) return;

    const owner = await ctx.db.get(home.ownerId);
    if (!owner) return;

    const channels = prefs?.channels || ["email"];
    const headline = highSeverity[0]?.title || "Weather Advisory";
    const body = highSeverity
      .slice(0, 3)
      .map((a) => `- ${a.title}: ${a.description}`)
      .join("\n");

    if (channels.includes("email") && owner.email) {
      await ctx.scheduler.runAfter(0, internal.notifications.sendEmail, {
        to: owner.email,
        subject: `Kept Weather Alert: ${headline}`,
        body: `
          <h2 style="margin:0 0 12px 0;">${headline}</h2>
          <p style="color:#4b5563;">${home.weatherLocationLabel || home.addressLine1}</p>
          <div style="margin-top:12px; color:#111827; line-height:1.6;">
            ${body}
          </div>
          <p style="margin-top:16px; color:#6b7280;">
            Open Kept to see recommended actions.
          </p>
        `,
      });
    }

    if (channels.includes("sms") && owner.phone) {
      const smsBody = `${headline} - ${home.weatherLocationLabel || home.addressLine1}. Open Kept for actions.`;
      await ctx.scheduler.runAfter(0, internal.notifications.sendSMS, {
        to: owner.phone,
        body: smsBody,
      });
    }

    if (prefs) {
      await ctx.db.patch(prefs._id, { lastSentAt: now });
    } else {
      await ctx.db.insert("weatherNotificationPrefs", {
        homeId: args.homeId,
        channels,
        lastSentAt: now,
      });
    }
  },
});
