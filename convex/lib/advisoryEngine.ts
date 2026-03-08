import { Doc } from "../_generated/dataModel";
import { calculateAge, conditionalFailureProbability } from "./weibull";

export type AdvisorySeverity = "advisory" | "watch" | "warning";
export type AdvisoryType = "freeze" | "heat" | "storm" | "wind" | "hurricane";
export type AdvisorySource = "forecast" | "alert";

export interface RecommendedAction {
  actionId: string;
  priority: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  relatedSystemCategory?: Doc<"systemTypes">["category"];
  estimatedMinutes?: number;
}

export interface WeatherAdvisory {
  advisoryType: AdvisoryType;
  severity: AdvisorySeverity;
  title: string;
  description: string;
  startsAt?: number;
  expiresAt?: number;
  actions: RecommendedAction[];
  source: AdvisorySource;
}

interface ForecastPeriod {
  name: string;
  temperature: number;
  temperatureUnit: string;
  shortForecast: string;
  windSpeed: string;
  probabilityOfPrecipitation?: { value: number | null };
  startTime?: string;
  endTime?: string;
}

const FREEZE_THRESHOLDS = { advisory: 36, watch: 32, warning: 28 };
const HEAT_THRESHOLDS = { advisory: 95, watch: 100, warning: 105 };
const WIND_THRESHOLDS = { advisory: 25, watch: 35, warning: 50 };
const STORM_POP_THRESHOLD = 60;

const BASE_ACTIONS: Record<AdvisoryType, RecommendedAction[]> = {
  freeze: [
    {
      actionId: "freeze-001",
      priority: "high",
      title: "Disconnect outdoor hoses",
      description: "Prevent frozen pipes and damaged spigots by disconnecting hoses and draining lines.",
      relatedSystemCategory: "plumbing",
      estimatedMinutes: 15,
    },
    {
      actionId: "freeze-002",
      priority: "medium",
      title: "Insulate exposed pipes",
      description: "Wrap pipes in unheated areas to reduce freeze risk.",
      relatedSystemCategory: "plumbing",
      estimatedMinutes: 25,
    },
  ],
  heat: [
    {
      actionId: "heat-001",
      priority: "medium",
      title: "Check HVAC filters",
      description: "Clean filters improve airflow and reduce system strain during heat events.",
      relatedSystemCategory: "hvac",
      estimatedMinutes: 10,
    },
    {
      actionId: "heat-002",
      priority: "low",
      title: "Shade exterior condensers",
      description: "Clear debris and keep airflow unobstructed for efficient cooling.",
      relatedSystemCategory: "hvac",
      estimatedMinutes: 15,
    },
  ],
  storm: [
    {
      actionId: "storm-001",
      priority: "high",
      title: "Secure outdoor items",
      description: "Bring in or secure loose items to prevent damage in high winds.",
      relatedSystemCategory: "exterior",
      estimatedMinutes: 20,
    },
    {
      actionId: "storm-002",
      priority: "medium",
      title: "Check sump pump operation",
      description: "Test sump pump and clear drains to reduce flooding risk.",
      relatedSystemCategory: "plumbing",
      estimatedMinutes: 15,
    },
  ],
  wind: [
    {
      actionId: "wind-001",
      priority: "medium",
      title: "Inspect roof and gutters",
      description: "Check for loose shingles and clear gutters to reduce wind damage.",
      relatedSystemCategory: "structural",
      estimatedMinutes: 20,
    },
  ],
  hurricane: [
    {
      actionId: "hurricane-001",
      priority: "critical",
      title: "Secure openings and protect windows",
      description: "Use storm shutters or plywood to protect glazing before landfall.",
      relatedSystemCategory: "structural",
      estimatedMinutes: 60,
    },
    {
      actionId: "hurricane-002",
      priority: "high",
      title: "Prepare emergency water shutoff",
      description: "Locate shutoff valves and know how to stop water quickly.",
      relatedSystemCategory: "plumbing",
      estimatedMinutes: 15,
    },
  ],
};

const SYSTEM_RISK_ACTIONS: Record<string, RecommendedAction> = {
  plumbing: {
    actionId: "risk-plumbing-001",
    priority: "high",
    title: "Inspect older plumbing components",
    description: "Older plumbing systems have higher failure risk in severe weather.",
    relatedSystemCategory: "plumbing",
    estimatedMinutes: 30,
  },
  hvac: {
    actionId: "risk-hvac-001",
    priority: "medium",
    title: "Schedule HVAC checkup",
    description: "Older HVAC systems are more likely to fail during extreme temperature swings.",
    relatedSystemCategory: "hvac",
    estimatedMinutes: 30,
  },
};

export function generateAdvisories(params: {
  forecast: any;
  alerts: any;
  systems: Doc<"systems">[];
  systemTypes: Doc<"systemTypes">[];
  homeYearBuilt?: number;
}): WeatherAdvisory[] {
  const advisories: WeatherAdvisory[] = [];
  const periods: ForecastPeriod[] = params.forecast?.properties?.periods || [];

  const next24h = periods.slice(0, 4);
  const minTemp = getMinTemp(next24h);
  const maxTemp = getMaxTemp(next24h);
  const maxWind = getMaxWind(next24h);
  const stormy = hasStormSignal(next24h);

  if (minTemp !== null) {
    const severity = getThresholdSeverity(minTemp, FREEZE_THRESHOLDS, "lte");
    if (severity) {
      advisories.push({
        advisoryType: "freeze",
        severity,
        title: severity === "warning" ? "Hard Freeze Warning" : "Freeze Advisory",
        description: `Forecast low of ${minTemp}°F in the next 24 hours.`,
        startsAt: toTimestamp(next24h[0]?.startTime),
        expiresAt: toTimestamp(next24h[next24h.length - 1]?.endTime),
        actions: buildActions("freeze", params),
        source: "forecast",
      });
    }
  }

  if (maxTemp !== null) {
    const severity = getThresholdSeverity(maxTemp, HEAT_THRESHOLDS, "gte");
    if (severity) {
      advisories.push({
        advisoryType: "heat",
        severity,
        title: severity === "warning" ? "Extreme Heat Warning" : "Heat Advisory",
        description: `Forecast high of ${maxTemp}°F in the next 24 hours.`,
        startsAt: toTimestamp(next24h[0]?.startTime),
        expiresAt: toTimestamp(next24h[next24h.length - 1]?.endTime),
        actions: buildActions("heat", params),
        source: "forecast",
      });
    }
  }

  if (maxWind !== null) {
    const severity = getThresholdSeverity(maxWind, WIND_THRESHOLDS, "gte");
    if (severity) {
      advisories.push({
        advisoryType: "wind",
        severity,
        title: severity === "warning" ? "High Wind Warning" : "Wind Advisory",
        description: `Forecast wind speeds up to ${maxWind} mph.`,
        startsAt: toTimestamp(next24h[0]?.startTime),
        expiresAt: toTimestamp(next24h[next24h.length - 1]?.endTime),
        actions: buildActions("wind", params),
        source: "forecast",
      });
    }
  }

  if (stormy) {
    advisories.push({
      advisoryType: "storm",
      severity: "watch",
      title: "Storm Watch",
      description: "Thunderstorms likely in the next 24 hours.",
      startsAt: toTimestamp(next24h[0]?.startTime),
      expiresAt: toTimestamp(next24h[next24h.length - 1]?.endTime),
      actions: buildActions("storm", params),
      source: "forecast",
    });
  }

  const alertAdvisories = buildAlertAdvisories(params.alerts, params);
  return [...advisories, ...alertAdvisories];
}

function buildAlertAdvisories(alerts: any, params: any): WeatherAdvisory[] {
  const results: WeatherAdvisory[] = [];
  const features = alerts?.features || [];

  for (const feature of features) {
    const props = feature.properties || {};
    const event = String(props.event || "").toLowerCase();
    const severity = mapAlertSeverity(props.severity);
    const startsAt = toTimestamp(props.onset);
    const expiresAt = toTimestamp(props.ends);

    if (event.includes("hurricane")) {
      results.push({
        advisoryType: "hurricane",
        severity,
        title: props.headline || "Hurricane Alert",
        description: props.description || "Hurricane conditions expected.",
        startsAt,
        expiresAt,
        actions: buildActions("hurricane", params),
        source: "alert",
      });
      continue;
    }

    if (event.includes("wind")) {
      results.push({
        advisoryType: "wind",
        severity,
        title: props.headline || "Wind Alert",
        description: props.description || "High winds expected.",
        startsAt,
        expiresAt,
        actions: buildActions("wind", params),
        source: "alert",
      });
    }

    if (event.includes("freeze") || event.includes("cold")) {
      results.push({
        advisoryType: "freeze",
        severity,
        title: props.headline || "Freeze Alert",
        description: props.description || "Freezing temperatures expected.",
        startsAt,
        expiresAt,
        actions: buildActions("freeze", params),
        source: "alert",
      });
    }

    if (event.includes("heat")) {
      results.push({
        advisoryType: "heat",
        severity,
        title: props.headline || "Heat Alert",
        description: props.description || "Extreme heat expected.",
        startsAt,
        expiresAt,
        actions: buildActions("heat", params),
        source: "alert",
      });
    }

    if (event.includes("storm") || event.includes("thunderstorm")) {
      results.push({
        advisoryType: "storm",
        severity,
        title: props.headline || "Storm Alert",
        description: props.description || "Severe storms expected.",
        startsAt,
        expiresAt,
        actions: buildActions("storm", params),
        source: "alert",
      });
    }
  }

  return results;
}

function buildActions(type: AdvisoryType, params: any): RecommendedAction[] {
  const actions = [...BASE_ACTIONS[type]];
  const riskAction = getSystemRiskAction(params.systems, params.systemTypes, params.homeYearBuilt);
  if (riskAction) actions.push(riskAction);
  return actions;
}

function getSystemRiskAction(
  systems: Doc<"systems">[],
  systemTypes: Doc<"systemTypes">[],
  homeYearBuilt?: number
): RecommendedAction | null {
  for (const system of systems) {
    const type = systemTypes.find((st) => st._id === system.systemTypeId);
    if (!type) continue;
    const age = calculateAge(system.installDate, homeYearBuilt);
    const failureProb = conditionalFailureProbability(
      age,
      1,
      type.weibullShape,
      type.weibullScale
    );

    if (failureProb >= 0.5 && SYSTEM_RISK_ACTIONS[type.category]) {
      return SYSTEM_RISK_ACTIONS[type.category];
    }
  }

  return null;
}

function getMinTemp(periods: ForecastPeriod[]): number | null {
  const temps = periods.map((p) => p.temperature).filter((t) => typeof t === "number");
  return temps.length ? Math.min(...temps) : null;
}

function getMaxTemp(periods: ForecastPeriod[]): number | null {
  const temps = periods.map((p) => p.temperature).filter((t) => typeof t === "number");
  return temps.length ? Math.max(...temps) : null;
}

function getMaxWind(periods: ForecastPeriod[]): number | null {
  const winds = periods
    .map((p) => parseWindSpeed(p.windSpeed))
    .filter((t) => typeof t === "number");
  return winds.length ? Math.max(...winds) : null;
}

function parseWindSpeed(windSpeed: string): number | null {
  if (!windSpeed) return null;
  const match = windSpeed.match(/\d+/);
  return match ? Number(match[0]) : null;
}

function hasStormSignal(periods: ForecastPeriod[]): boolean {
  return periods.some((p) => {
    const pop = p.probabilityOfPrecipitation?.value ?? 0;
    const forecast = p.shortForecast?.toLowerCase() || "";
    return pop >= STORM_POP_THRESHOLD || forecast.includes("thunder");
  });
}

function getThresholdSeverity(
  value: number,
  thresholds: { advisory: number; watch: number; warning: number },
  comparator: "lte" | "gte"
): AdvisorySeverity | null {
  if (comparator === "lte") {
    if (value <= thresholds.warning) return "warning";
    if (value <= thresholds.watch) return "watch";
    if (value <= thresholds.advisory) return "advisory";
    return null;
  }

  if (value >= thresholds.warning) return "warning";
  if (value >= thresholds.watch) return "watch";
  if (value >= thresholds.advisory) return "advisory";
  return null;
}

function mapAlertSeverity(severity: string): AdvisorySeverity {
  const value = (severity || "").toLowerCase();
  if (value === "extreme" || value === "severe") return "warning";
  if (value === "moderate") return "watch";
  return "advisory";
}

function toTimestamp(iso?: string): number | undefined {
  if (!iso) return undefined;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? undefined : date.getTime();
}
