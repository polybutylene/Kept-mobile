/**
 * IoT Data Aggregation + Retention
 *
 * Nightly jobs that roll up raw readings into hourly/daily/monthly aggregates
 * and clean up old data per the retention policy:
 *   - Raw readings: 7 days
 *   - Hourly aggregates: 90 days
 *   - Daily aggregates: 2 years
 *   - Monthly aggregates: forever
 */

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
const NINETY_DAYS = 90 * 24 * 60 * 60 * 1000;
const BATCH_SIZE = 500;

export const aggregateReadings = internalAction({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    const devices: any[] = await ctx.runQuery(
      internal.iot.queries.getConnectedDevicesByType,
      { deviceType: "thermostat" }
    );

    const allDevices = [...devices];
    for (const type of ["water_shutoff", "leak_sensor", "smart_plug", "smart_lock"]) {
      const more: any[] = await ctx.runQuery(
        internal.iot.queries.getConnectedDevicesByType,
        { deviceType: type }
      );
      allDevices.push(...more);
    }

    for (const device of allDevices) {
      const readingTypes = device.capabilities as string[];

      for (const readingType of readingTypes) {
        const readings: any[] = await ctx.runQuery(
          internal.iot.queries.getReadingsForDevice,
          { deviceId: device._id, readingType, since: oneDayAgo }
        );

        if (readings.length === 0) continue;

        const values = readings.map((r: any) => r.value as number);
        const sum = values.reduce((a: number, b: number) => a + b, 0);
        const avg = sum / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);

        const prevAggregates: any[] = await ctx.runQuery(
          internal.iot.queries.getAggregatesForSystem,
          { systemId: device.systemId ?? device._id, period: "daily" }
        );

        let changeFromPrevious: number | undefined;
        let trendDirection: string | undefined;
        let isAnomaly = false;
        let anomalyDescription: string | undefined;

        const prevDay = prevAggregates
          .filter((a: any) => a.readingType === readingType)
          .sort((a: any, b: any) => b.periodStart - a.periodStart)[0];

        if (prevDay?.avg) {
          const change = ((avg - prevDay.avg) / prevDay.avg) * 100;
          changeFromPrevious = Math.round(change * 10) / 10;
          trendDirection = change > 5 ? "increasing" : change < -5 ? "decreasing" : "stable";

          if (Math.abs(change) > 30) {
            isAnomaly = true;
            anomalyDescription = `${readingType} ${change > 0 ? "increased" : "decreased"} by ${Math.abs(Math.round(change))}% compared to previous day`;
          }
        }

        await ctx.runMutation(internal.iot.mutations.insertAggregate, {
          deviceId: device._id,
          homeId: device.homeId,
          systemId: device.systemId,
          period: "daily",
          periodStart: oneDayAgo,
          periodEnd: now,
          readingType,
          sum: ["hvac_runtime_minutes", "water_flow_gallons", "energy_kwh"].includes(readingType) ? sum : undefined,
          avg,
          min,
          max,
          count: readings.length,
          changeFromPrevious,
          trendDirection,
          isAnomaly,
          anomalyDescription,
        });
      }
    }
  },
});

export const cleanupOldReadings = internalAction({
  args: {},
  handler: async (ctx) => {
    const rawCutoff = Date.now() - SEVEN_DAYS;
    let deleted = 0;

    while (deleted < 5000) {
      const batch: any[] = await ctx.runQuery(
        internal.iot.queries.getRawReadingsOlderThan,
        { cutoff: rawCutoff, limit: BATCH_SIZE }
      );
      if (batch.length === 0) break;

      for (const reading of batch) {
        await ctx.runMutation(internal.iot.mutations.deleteReading, { readingId: reading._id });
        deleted++;
      }
    }

    const hourlyCutoff = Date.now() - NINETY_DAYS;
    let hourlyDeleted = 0;

    while (hourlyDeleted < 5000) {
      const batch: any[] = await ctx.runQuery(
        internal.iot.queries.getHourlyReadingsOlderThan,
        { cutoff: hourlyCutoff, limit: BATCH_SIZE }
      );
      if (batch.length === 0) break;

      for (const reading of batch) {
        await ctx.runMutation(internal.iot.mutations.deleteReading, { readingId: reading._id });
        hourlyDeleted++;
      }
    }
  },
});
