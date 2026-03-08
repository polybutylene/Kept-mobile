import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// ─── Daily: Sweep all forecasts for threshold crossings ──────────────
crons.daily(
  "daily-forecast-sweep",
  { hourUTC: 7, minuteUTC: 0 },
  internal.triggers.dailyForecastSweep
);

// ─── Weekly: Review overdue maintenance tasks (Mondays 8am UTC) ──────
crons.weekly(
  "weekly-maintenance-review",
  { dayOfWeek: "monday", hourUTC: 8, minuteUTC: 0 },
  internal.triggers.weeklyMaintenanceReview
);

// ─── Quarterly: Seasonal sweep (1st of Jan, Apr, Jul, Oct at 9am UTC)
crons.cron(
  "seasonal-sweep",
  "0 9 1 1,4,7,10 *",
  internal.triggers.seasonalSweep
);

// ─── Monthly: Refresh expired cost data (15th at 3am UTC) ────────────
crons.monthly(
  "cost-data-refresh",
  { dayOfMonth: 15, hourUTC: 3, minuteUTC: 0 },
  internal.triggers.costDataRefresh
);

// ─── Daily: Expire stale pending agent actions (12:30am UTC) ─────────
crons.daily(
  "expire-pending-actions",
  { hourUTC: 0, minuteUTC: 30 },
  internal.triggers.expirePendingActions
);

export default crons;
