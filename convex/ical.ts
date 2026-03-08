"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

function parseIcalEvents(icalText: string): Array<{
  uid: string;
  dtstart: string;
  dtend: string;
  summary: string;
}> {
  const events: Array<{ uid: string; dtstart: string; dtend: string; summary: string }> = [];
  const eventBlocks = icalText.split("BEGIN:VEVENT");

  for (let i = 1; i < eventBlocks.length; i++) {
    const block = eventBlocks[i].split("END:VEVENT")[0];
    const getField = (name: string): string => {
      const regex = new RegExp(`^${name}[;:](.*)$`, "m");
      const match = block.match(regex);
      return match ? match[1].trim() : "";
    };
    const uid = getField("UID");
    const dtstartRaw = getField("DTSTART");
    const dtendRaw = getField("DTEND");
    const summary = getField("SUMMARY");
    if (!uid || !dtstartRaw || !dtendRaw) continue;

    const parseDate = (raw: string): string => {
      const cleaned = raw.replace(/^VALUE=DATE:?/, "").replace(/^VALUE=DATE-TIME:?/, "");
      if (cleaned.length === 8) {
        return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}T00:00:00.000Z`;
      }
      if (cleaned.includes("T")) {
        const d = cleaned.replace(/Z$/, "");
        if (d.length >= 15) {
          return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}T${d.slice(9, 11)}:${d.slice(11, 13)}:${d.slice(13, 15)}.000Z`;
        }
      }
      return new Date(cleaned).toISOString();
    };

    events.push({ uid, dtstart: parseDate(dtstartRaw), dtend: parseDate(dtendRaw), summary: summary || "Guest" });
  }
  return events;
}

export const syncFeedAction = internalAction({
  args: { feedId: v.id("icalFeeds") },
  handler: async (ctx, args) => {
    const feed = await ctx.runQuery(internal.icalMutations.getFeed, { feedId: args.feedId });
    if (!feed || !feed.isActive) return;

    try {
      const response = await fetch(feed.feedUrl);
      if (!response.ok) {
        await ctx.runMutation(internal.icalMutations.updateFeedStatus, {
          feedId: args.feedId, status: "error",
          error: `HTTP ${response.status}: ${response.statusText}`,
        });
        return;
      }
      const icalText = await response.text();
      const events = parseIcalEvents(icalText);

      await ctx.runMutation(internal.bookings.upsertFromIcal, {
        homeId: feed.homeId,
        icalFeedId: args.feedId,
        events: events.map((e) => ({
          externalId: e.uid, checkIn: e.dtstart, checkOut: e.dtend, summary: e.summary,
        })),
      });

      await ctx.runMutation(internal.icalMutations.updateFeedStatus, {
        feedId: args.feedId, status: "success",
      });
    } catch (error: any) {
      await ctx.runMutation(internal.icalMutations.updateFeedStatus, {
        feedId: args.feedId, status: "error", error: error.message || "Unknown error",
      });
    }
  },
});

export const syncAllFeeds = internalAction({
  args: {},
  handler: async (ctx) => {
    const feeds = await ctx.runQuery(internal.icalMutations.getActiveFeeds);
    for (const feed of feeds) {
      await ctx.runAction(internal.ical.syncFeedAction, { feedId: feed._id });
    }
  },
});
