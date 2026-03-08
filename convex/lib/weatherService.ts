const WEATHER_CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours
const USER_AGENT = "Kept (support@kept.app)";

interface WeatherPointResponse {
  properties: {
    forecast: string;
    forecastHourly?: string;
  };
}

export interface WeatherFetchResult {
  forecast: any;
  alerts: any;
  fetchedAt: number;
}

export interface WeatherCacheEntry {
  _id: any;
  latitude: number;
  longitude: number;
  fetchedAt: number;
  forecast: any;
  alerts: any;
}

export function isCacheFresh(cached: WeatherCacheEntry | null): boolean {
  if (!cached) return false;
  return Date.now() - cached.fetchedAt < WEATHER_CACHE_TTL_MS;
}

/**
 * Fetch weather data from NWS API (HTTP calls only, no DB access).
 * Must be called from a Convex action, not a mutation.
 */
export async function fetchWeatherFromAPI(
  latitude: number,
  longitude: number
): Promise<{ forecast: any; alerts: any } | null> {
  try {
    const pointRes = await fetch(
      `https://api.weather.gov/points/${latitude},${longitude}`,
      {
        headers: { "User-Agent": USER_AGENT, Accept: "application/geo+json" },
      }
    );

    if (!pointRes.ok) {
      throw new Error(`Weather.gov points error: ${pointRes.status}`);
    }

    const pointData = (await pointRes.json()) as WeatherPointResponse;
    const forecastUrl = pointData.properties.forecast;

    const [forecastRes, alertsRes] = await Promise.all([
      fetch(forecastUrl, {
        headers: { "User-Agent": USER_AGENT, Accept: "application/geo+json" },
      }),
      fetch(
        `https://api.weather.gov/alerts/active?point=${latitude},${longitude}`,
        { headers: { "User-Agent": USER_AGENT, Accept: "application/geo+json" } }
      ),
    ]);

    const forecast = forecastRes.ok ? await forecastRes.json() : null;
    const alerts = alertsRes.ok ? await alertsRes.json() : null;

    return { forecast, alerts };
  } catch (error) {
    console.error("Weather fetch error:", error);
    return null;
  }
}
