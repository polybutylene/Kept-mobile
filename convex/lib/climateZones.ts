/**
 * Climate Zone Inference
 *
 * Maps US states to climate zone IDs used by the climateModifiers table.
 * This is a deterministic lookup — no API calls needed.
 *
 * Zone IDs match the climateZoneId values in convex/data/climateModifiers.ts.
 */

// State abbreviation → climateZoneId
const STATE_TO_CLIMATE_ZONE: Record<string, string> = {
  // Gulf Coast / Subtropical
  FL: "gulf_coast_subtropical",
  LA: "gulf_coast_subtropical",

  // Deep South (non-coastal)
  AL: "deep_south",
  MS: "deep_south",
  GA: "deep_south",
  SC: "deep_south",
  AR: "deep_south",

  // Mid-Atlantic / Humid Continental
  NC: "mid_atlantic",
  VA: "mid_atlantic",
  MD: "mid_atlantic",
  DE: "mid_atlantic",
  DC: "mid_atlantic",
  WV: "mid_atlantic",
  KY: "mid_atlantic",
  TN: "mid_atlantic",

  // Coastal Northeast
  NJ: "coastal_northeast",
  CT: "coastal_northeast",
  RI: "coastal_northeast",
  MA: "coastal_northeast",
  NH: "coastal_northeast",
  ME: "coastal_northeast",
  NY: "coastal_northeast",
  PA: "coastal_northeast",

  // Upper Midwest / Great Lakes
  MN: "upper_midwest",
  WI: "upper_midwest",
  MI: "upper_midwest",
  IA: "upper_midwest",
  IL: "upper_midwest",
  IN: "upper_midwest",
  OH: "upper_midwest",
  ND: "upper_midwest",
  SD: "upper_midwest",
  NE: "upper_midwest",

  // Desert Southwest
  AZ: "desert_southwest",
  NV: "desert_southwest",
  NM: "desert_southwest",
  UT: "desert_southwest",

  // Mountain West
  CO: "mountain_west",
  WY: "mountain_west",
  MT: "mountain_west",
  ID: "mountain_west",

  // Pacific Northwest
  WA: "pacific_northwest",
  OR: "pacific_northwest",

  // Texas — Gulf Coast zone (dominant climate concern)
  TX: "gulf_coast_subtropical",

  // California — treat as desert southwest (inland majority)
  CA: "desert_southwest",

  // Kansas / Missouri / Oklahoma — Upper Midwest fringe
  KS: "upper_midwest",
  MO: "upper_midwest",
  OK: "deep_south",

  // Hawaii / Alaska — default to closest match
  HI: "gulf_coast_subtropical", // tropical humidity
  AK: "upper_midwest", // extreme cold
  VT: "coastal_northeast",
};

/**
 * Infer climate zone ID from a US state abbreviation.
 * Returns the climateZoneId string used by the climateModifiers table,
 * or null if the state is not recognized.
 */
export function inferClimateZoneId(state: string): string | null {
  // Normalize: uppercase, trim, take first 2 chars (handles "FL" and "Florida")
  const abbrev = state.trim().toUpperCase().slice(0, 2);
  return STATE_TO_CLIMATE_ZONE[abbrev] ?? null;
}

// ─────────────────────────────────────────────────────────────────────
// Regional Season Definitions
//
// Different climate zones have offset seasonal timing.  For example,
// "spring" work in Florida starts in February/March, while in the
// Upper Midwest it doesn't start until April/May.
//
// Each zone maps season labels → the months (1-12) that season
// actually spans for that region.
// ─────────────────────────────────────────────────────────────────────

export type SeasonLabel = "spring" | "summer" | "fall" | "winter" | "any";

interface RegionalSeasons {
  spring: number[];
  summer: number[];
  fall: number[];
  winter: number[];
}

const REGIONAL_SEASONS: Record<string, RegionalSeasons> = {
  gulf_coast_subtropical: {
    spring: [2, 3, 4],       // Feb-Apr  (warm early)
    summer: [5, 6, 7, 8, 9], // May-Sep  (long, hot)
    fall: [10, 11],          // Oct-Nov
    winter: [12, 1],         // Dec-Jan  (mild)
  },
  deep_south: {
    spring: [3, 4],          // Mar-Apr
    summer: [5, 6, 7, 8],   // May-Aug
    fall: [9, 10, 11],       // Sep-Nov
    winter: [12, 1, 2],     // Dec-Feb
  },
  mid_atlantic: {
    spring: [3, 4, 5],      // Mar-May
    summer: [6, 7, 8],      // Jun-Aug
    fall: [9, 10, 11],      // Sep-Nov
    winter: [12, 1, 2],     // Dec-Feb
  },
  coastal_northeast: {
    spring: [4, 5],          // Apr-May
    summer: [6, 7, 8],      // Jun-Aug
    fall: [9, 10, 11],      // Sep-Nov
    winter: [12, 1, 2, 3],  // Dec-Mar  (long winter)
  },
  upper_midwest: {
    spring: [4, 5],          // Apr-May
    summer: [6, 7, 8],      // Jun-Aug
    fall: [9, 10],           // Sep-Oct
    winter: [11, 12, 1, 2, 3], // Nov-Mar  (very long)
  },
  desert_southwest: {
    spring: [2, 3, 4],      // Feb-Apr
    summer: [5, 6, 7, 8, 9], // May-Sep (extreme heat)
    fall: [10, 11],          // Oct-Nov
    winter: [12, 1],         // Dec-Jan  (mild)
  },
  mountain_west: {
    spring: [4, 5],          // Apr-May
    summer: [6, 7, 8],      // Jun-Aug
    fall: [9, 10],           // Sep-Oct
    winter: [11, 12, 1, 2, 3], // Nov-Mar
  },
  pacific_northwest: {
    spring: [3, 4, 5],      // Mar-May
    summer: [6, 7, 8],      // Jun-Aug
    fall: [9, 10, 11],      // Sep-Nov
    winter: [12, 1, 2],     // Dec-Feb
  },
};

/** Default seasons used when no climate zone is available */
const DEFAULT_SEASONS: RegionalSeasons = {
  spring: [3, 4, 5],
  summer: [6, 7, 8],
  fall: [9, 10, 11],
  winter: [12, 1, 2],
};

/**
 * Get the regional season month mapping for a given climate zone ID.
 */
export function getRegionalSeasons(climateZoneId?: string | null): RegionalSeasons {
  if (climateZoneId && REGIONAL_SEASONS[climateZoneId]) {
    return REGIONAL_SEASONS[climateZoneId];
  }
  return DEFAULT_SEASONS;
}

/**
 * Determine the current season for a given climate zone.
 */
export function getCurrentSeason(climateZoneId?: string | null): SeasonLabel {
  const month = new Date().getMonth() + 1; // 1-12
  const seasons = getRegionalSeasons(climateZoneId);

  if (seasons.spring.includes(month)) return "spring";
  if (seasons.summer.includes(month)) return "summer";
  if (seasons.fall.includes(month)) return "fall";
  return "winter";
}

/**
 * Compute the optimal due date for a maintenance task based on its
 * season preference and the home's climate zone.
 *
 * Strategy:
 * 1. If the task has `optimalMonths` → find the next occurrence of one
 *    of those months within a 12-month window from today.
 * 2. If the task has `seasonPreference` (not "any") → use the regional
 *    season months for the home's climate zone, then find the next
 *    occurrence of one of those months.
 * 3. If "any" or no preference → use `frequencyMonths` from today as-is.
 *
 * The returned date always falls within the next 12 months.
 */
export function computeSeasonalDueDate(
  frequencyMonths: number,
  seasonPreference?: string | null,
  optimalMonths?: number[] | null,
  climateZoneId?: string | null,
  referenceDate?: Date
): string {
  const today = referenceDate ?? new Date();
  const currentMonth = today.getMonth() + 1; // 1-12
  const currentYear = today.getFullYear();

  // Determine which months are valid for this task
  let targetMonths: number[] | null = null;

  if (optimalMonths && optimalMonths.length > 0) {
    targetMonths = optimalMonths;
  } else if (
    seasonPreference &&
    seasonPreference !== "any"
  ) {
    const seasons = getRegionalSeasons(climateZoneId);
    const seasonKey = seasonPreference as keyof RegionalSeasons;
    if (seasons[seasonKey]) {
      targetMonths = seasons[seasonKey];
    }
  }

  // If no seasonal target, fall back to frequency-based scheduling
  if (!targetMonths || targetMonths.length === 0) {
    const fallback = new Date(today);
    fallback.setMonth(fallback.getMonth() + frequencyMonths);
    return fallback.toISOString().split("T")[0];
  }

  // Find the earliest target month that is at least 2 weeks in the future
  // within the next 12 months.
  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() + 14); // at least 2 weeks out

  for (let offset = 0; offset < 12; offset++) {
    const candidateMonth = ((currentMonth - 1 + offset) % 12) + 1;
    const candidateYear =
      currentYear + Math.floor((currentMonth - 1 + offset) / 12);

    if (targetMonths.includes(candidateMonth)) {
      // Place the due date on the 15th of that month (mid-month)
      const candidate = new Date(candidateYear, candidateMonth - 1, 15);
      if (candidate >= minDate) {
        return candidate.toISOString().split("T")[0];
      }
    }
  }

  // Safety fallback: if nothing found within 12 months (shouldn't happen),
  // use frequency-based scheduling
  const fallback = new Date(today);
  fallback.setMonth(fallback.getMonth() + frequencyMonths);
  return fallback.toISOString().split("T")[0];
}

/**
 * Approximate latitude/longitude from US zip code prefix.
 * Uses the first 3 digits of the zip code to estimate coordinates.
 * This is a rough approximation (±50 miles) but sufficient for
 * weather.gov API calls which use grid-based lookups.
 *
 * Returns null if the zip code is not recognized.
 */
export function approximateCoordsFromZip(zipCode: string): {
  latitude: number;
  longitude: number;
} | null {
  const prefix = zipCode.slice(0, 3);
  const coords = ZIP_PREFIX_COORDS[prefix];
  if (!coords) return null;
  return { latitude: coords[0], longitude: coords[1] };
}

// Zip code 3-digit prefix → [latitude, longitude]
// Covers all US 3-digit prefixes with approximate center points
const ZIP_PREFIX_COORDS: Record<string, [number, number]> = {
  // Northeast
  "010": [42.1, -72.6], // Springfield MA
  "011": [42.1, -72.6],
  "012": [42.4, -73.2], // Pittsfield MA
  "013": [42.1, -72.6],
  "014": [42.3, -71.8], // Worcester MA
  "015": [42.3, -71.8],
  "016": [42.3, -71.8],
  "017": [42.5, -71.2], // Framingham MA
  "018": [42.5, -71.2],
  "019": [42.5, -71.0], // Lynn MA
  "020": [42.4, -71.1], // Boston MA
  "021": [42.4, -71.1],
  "022": [42.3, -71.1],
  "023": [41.8, -71.1], // Brockton MA
  "024": [42.5, -71.2],
  "025": [41.7, -70.3], // Cape Cod MA
  "026": [41.7, -70.0], // Cape Cod MA
  "027": [41.8, -71.4], // Providence RI
  "028": [41.8, -71.4],
  "029": [41.5, -71.3],
  "030": [43.0, -71.5], // Manchester NH
  "031": [43.0, -71.5],
  "032": [43.2, -71.5],
  "033": [43.6, -71.5], // Concord NH
  "034": [43.6, -71.5],
  "035": [43.2, -72.5], // White River VT
  "036": [43.2, -72.5],
  "037": [44.5, -72.6], // Montpelier VT
  "038": [43.6, -72.3],
  "039": [44.3, -69.8], // Augusta ME
  "040": [43.7, -70.3], // Portland ME
  "041": [43.7, -70.3],
  "042": [43.7, -70.3],
  "043": [44.3, -69.0], // Augusta ME
  "044": [44.8, -68.8], // Bangor ME
  "045": [44.8, -68.8],
  "046": [46.9, -68.0], // Northern ME
  "047": [46.9, -68.0],
  "048": [46.9, -68.0],
  "049": [43.5, -70.5],
  "050": [44.5, -72.6], // Vermont
  "051": [44.5, -72.6],
  "052": [44.5, -72.6],
  "053": [44.5, -72.6],
  "054": [44.5, -72.6],
  "055": [42.3, -72.6], // MA
  "056": [44.5, -72.6],
  "057": [44.5, -72.6],
  "058": [44.5, -72.6],
  "059": [44.5, -72.6],
  "060": [41.8, -72.7], // Hartford CT
  "061": [41.8, -72.7],
  "062": [41.3, -72.9], // New Haven CT
  "063": [41.2, -73.2], // Bridgeport CT
  "064": [41.3, -72.1], // New London CT
  "065": [41.1, -73.2], // Stamford CT
  "066": [41.1, -73.2],
  "067": [41.6, -72.7],
  "068": [41.6, -72.7],
  "069": [41.6, -72.7],
  // New York / New Jersey
  "070": [40.7, -74.2], // Newark NJ
  "071": [40.7, -74.2],
  "072": [40.5, -74.3], // Elizabeth NJ
  "073": [40.8, -74.1], // Jersey City
  "074": [40.9, -74.2], // Paterson NJ
  "075": [40.9, -74.2],
  "076": [40.5, -74.5], // Hackensack NJ
  "077": [40.3, -74.0], // Red Bank NJ
  "078": [40.6, -74.6], // Somerville NJ
  "079": [40.9, -74.8], // Summit NJ
  "080": [39.9, -75.0], // South Jersey
  "081": [39.9, -74.9],
  "082": [39.4, -74.5], // Atlantic City NJ
  "083": [39.4, -75.0],
  "084": [39.7, -75.1],
  "085": [40.2, -74.8], // Trenton NJ
  "086": [40.2, -74.8],
  "087": [40.2, -74.8],
  "088": [40.5, -74.4],
  "089": [40.5, -74.4],
  "100": [40.8, -73.9], // New York NY
  "101": [40.8, -73.9],
  "102": [40.8, -73.9],
  "103": [40.6, -74.1], // Staten Island
  "104": [40.9, -73.9], // Bronx
  "105": [41.0, -73.8], // Westchester
  "106": [41.0, -73.8],
  "107": [41.0, -73.8],
  "108": [41.0, -73.8],
  "109": [41.4, -74.0], // Suffern NY
  "110": [40.7, -73.5], // Queens / LI
  "111": [40.7, -73.8],
  "112": [40.6, -74.0], // Brooklyn
  "113": [40.7, -73.9], // Flushing
  "114": [40.8, -73.5], // Jamaica
  "115": [40.8, -73.4], // Floral Park
  "116": [40.8, -73.3], // Long Island
  "117": [40.8, -73.1],
  "118": [40.9, -72.7], // Hicksville
  "119": [41.0, -72.3], // Riverhead
  // Mid-Atlantic
  "120": [42.7, -73.7], // Albany NY
  "121": [42.7, -73.7],
  "122": [42.7, -73.7],
  "123": [42.4, -73.2],
  "124": [41.7, -74.0], // Kingston NY
  "125": [41.0, -73.9], // Poughkeepsie
  "126": [41.0, -73.9],
  "127": [41.5, -74.5],
  "128": [42.5, -75.0], // Gloversville NY
  "129": [42.8, -74.0],
  "130": [43.0, -76.1], // Syracuse NY
  "131": [43.0, -76.1],
  "132": [43.0, -76.1],
  "133": [43.1, -77.0], // Utica NY
  "134": [43.1, -77.0],
  "135": [43.1, -77.0],
  "136": [44.7, -75.5], // Watertown NY
  "137": [43.0, -75.2], // Binghamton
  "138": [42.1, -76.8],
  "139": [42.1, -76.8],
  "140": [42.9, -78.9], // Buffalo NY
  "141": [42.9, -78.9],
  "142": [42.9, -78.9],
  "143": [43.2, -77.6], // Rochester NY
  "144": [43.2, -77.6],
  "145": [43.2, -77.6],
  "146": [43.2, -77.6],
  "147": [42.1, -79.2], // Jamestown NY
  "148": [42.3, -76.5], // Elmira NY
  "149": [42.3, -76.5],
  // Pennsylvania
  "150": [40.4, -80.0], // Pittsburgh PA
  "151": [40.4, -80.0],
  "152": [40.4, -80.0],
  "153": [40.3, -79.0], // Washington PA
  "154": [40.3, -79.0],
  "155": [40.3, -78.9], // Johnstown PA
  "156": [40.5, -78.4], // Greensburg PA
  "157": [41.2, -79.4], // Indiana PA
  "158": [41.4, -79.0], // DuBois PA
  "159": [41.4, -79.0],
  "160": [41.1, -77.0], // New Castle PA
  "161": [41.1, -77.0],
  "162": [41.1, -77.0],
  "163": [42.1, -80.1], // Erie PA
  "164": [42.1, -80.1],
  "165": [42.1, -80.1],
  "166": [40.5, -78.4], // Altoona PA
  "167": [40.9, -77.8],
  "168": [40.9, -77.8],
  "169": [41.2, -76.0], // Wellsboro PA
  "170": [40.3, -76.9], // Harrisburg PA
  "171": [40.3, -76.9],
  "172": [40.3, -76.9],
  "173": [40.0, -76.3], // Lancaster PA
  "174": [40.0, -76.3],
  "175": [40.0, -76.3],
  "176": [40.3, -76.0], // Reading PA
  "177": [41.2, -76.0], // Williamsport PA
  "178": [41.2, -76.0],
  "179": [40.0, -76.3],
  "180": [40.6, -75.5], // Lehigh Valley PA
  "181": [40.6, -75.5],
  "182": [41.4, -75.7], // Wilkes-Barre PA
  "183": [41.4, -75.7],
  "184": [41.4, -75.7], // Scranton PA
  "185": [41.4, -75.7],
  "186": [41.4, -75.7],
  "187": [41.4, -75.7],
  "188": [41.0, -75.2], // Stroudsburg PA
  "189": [40.1, -75.0], // Doylestown PA
  "190": [40.0, -75.2], // Philadelphia PA
  "191": [40.0, -75.2],
  "192": [40.0, -75.2],
  "193": [40.0, -75.6], // SE PA
  "194": [40.0, -75.6],
  "195": [40.3, -75.9], // Reading PA
  "196": [40.0, -75.6],
  // Delaware / DC / Maryland
  "197": [39.7, -75.5], // Wilmington DE
  "198": [39.7, -75.5],
  "199": [39.2, -75.5], // Dover DE
  "200": [38.9, -77.0], // Washington DC
  "201": [38.9, -77.0],
  "202": [38.9, -77.0],
  "203": [38.9, -77.0],
  "204": [38.9, -77.0],
  "205": [38.9, -77.0],
  "206": [38.8, -76.7], // Southern MD
  "207": [38.8, -76.7],
  "208": [38.8, -76.7],
  "209": [39.2, -76.6], // Silver Spring MD
  "210": [39.3, -76.6], // Baltimore MD
  "211": [39.3, -76.6],
  "212": [39.3, -76.6],
  "214": [39.4, -77.4], // Annapolis MD
  "215": [39.4, -76.5],
  "216": [39.3, -76.6],
  "217": [39.6, -77.7], // Frederick MD
  "218": [38.3, -75.6], // Salisbury MD
  "219": [39.6, -78.8], // Cumberland MD
  // Virginia
  "220": [38.8, -77.1], // Northern VA
  "221": [38.8, -77.1],
  "222": [38.9, -77.2], // Arlington VA
  "223": [38.8, -77.3], // Alexandria VA
  "224": [38.3, -77.5], // Fredericksburg VA
  "225": [38.3, -77.5],
  "226": [38.4, -78.9], // Winchester VA
  "227": [38.0, -79.4], // Bluefield VA
  "228": [37.5, -79.4], // Charlottesville VA
  "229": [37.3, -79.9], // Lynchburg VA
  "230": [37.5, -77.4], // Richmond VA
  "231": [37.5, -77.4],
  "232": [37.5, -77.4],
  "233": [36.8, -76.3], // Norfolk VA
  "234": [36.8, -76.3],
  "235": [36.8, -76.3], // Newport News VA
  "236": [36.8, -76.3],
  "237": [37.1, -76.5],
  "238": [37.5, -77.4],
  "239": [37.5, -77.4],
  "240": [37.3, -80.1], // Roanoke VA
  "241": [37.3, -80.1],
  "242": [36.6, -82.2], // Bristol VA
  "243": [37.8, -79.4],
  "244": [37.3, -79.9],
  "245": [37.3, -79.9],
  "246": [36.6, -81.5],
  // Carolinas
  "247": [37.8, -81.2], // Bluefield WV
  "248": [38.3, -81.6], // Charleston WV
  "249": [37.8, -80.4], // Lewisburg WV
  "250": [38.3, -81.6], // Charleston WV
  "251": [38.3, -81.6],
  "252": [38.3, -81.6],
  "253": [38.4, -82.4], // Huntington WV
  "254": [39.3, -80.0], // Martinsburg WV
  "255": [38.3, -81.6],
  "256": [38.3, -81.6],
  "257": [39.3, -80.0], // Huntington WV
  "258": [39.3, -80.0],
  "259": [39.3, -80.0],
  "260": [39.5, -80.1], // Wheeling WV
  "261": [39.5, -80.1],
  "262": [39.3, -80.0],
  "263": [39.3, -80.0],
  "264": [39.3, -80.0],
  "265": [39.3, -80.0],
  "266": [39.3, -80.0],
  "267": [39.5, -79.9], // Cumberland WV
  "268": [39.5, -79.9],
  // North Carolina
  "270": [36.1, -79.8], // Greensboro NC
  "271": [36.1, -79.8],
  "272": [35.8, -78.6], // Raleigh NC
  "273": [35.8, -78.6],
  "274": [35.8, -78.6],
  "275": [35.8, -78.6],
  "276": [36.1, -80.2], // Winston-Salem NC
  "277": [36.1, -80.2],
  "278": [35.6, -82.6], // Asheville NC
  "279": [35.2, -80.8], // Charlotte NC
  "280": [35.2, -80.8],
  "281": [35.2, -80.8],
  "282": [35.2, -80.8],
  "283": [35.1, -77.1], // Fayetteville NC
  "284": [34.2, -77.9], // Wilmington NC
  "285": [35.6, -77.4], // Kinston NC
  "286": [35.6, -77.4],
  // South Carolina
  "290": [34.0, -81.0], // Columbia SC
  "291": [34.0, -81.0],
  "292": [34.0, -81.0],
  "293": [34.8, -82.4], // Greenville SC
  "294": [32.8, -80.0], // Charleston SC
  "295": [34.2, -79.0], // Florence SC
  "296": [34.2, -79.0],
  "297": [32.8, -80.0],
  "298": [32.4, -80.7], // Beaufort SC
  "299": [32.1, -81.1], // Savannah GA area
  // Georgia
  "300": [33.7, -84.4], // Atlanta GA
  "301": [33.7, -84.4],
  "302": [33.7, -84.4],
  "303": [33.7, -84.4],
  "304": [34.2, -84.5], // Statesboro GA
  "305": [33.5, -84.4],
  "306": [33.5, -83.0],
  "307": [32.5, -83.6], // Macon GA
  "308": [33.5, -83.0], // Augusta GA
  "309": [33.5, -83.0],
  "310": [32.1, -81.1], // Savannah GA
  "311": [33.7, -84.4],
  "312": [33.7, -84.4],
  "313": [32.1, -81.1],
  "314": [30.8, -83.3], // Waycross GA
  "315": [31.6, -84.2], // Albany GA
  "316": [31.6, -84.2],
  "317": [31.6, -84.2],
  "318": [32.5, -84.9], // Columbus GA
  "319": [32.5, -84.9],
  // Florida
  "320": [30.3, -81.7], // Jacksonville FL
  "321": [28.5, -81.4], // Daytona Beach FL
  "322": [30.4, -87.2], // Pensacola FL (Gulf Coast)
  "323": [30.2, -85.7], // Panama City FL (Gulf Coast)
  "324": [30.2, -85.7],
  "325": [30.4, -84.3], // Tallahassee FL
  "326": [29.2, -82.1], // Gainesville FL
  "327": [28.5, -81.4], // Orlando FL
  "328": [28.5, -81.4],
  "329": [28.5, -81.4],
  "330": [25.8, -80.2], // Miami FL
  "331": [25.8, -80.2],
  "332": [25.8, -80.2],
  "333": [26.1, -80.1], // Fort Lauderdale FL
  "334": [26.7, -80.1], // West Palm Beach FL
  "335": [27.8, -82.6], // Tampa FL
  "336": [27.8, -82.6],
  "337": [27.3, -82.5], // St. Petersburg FL
  "338": [28.0, -81.9], // Lakeland FL
  "339": [26.6, -81.9], // Fort Myers FL
  "340": [27.8, -82.6],
  "341": [26.6, -81.9],
  "342": [28.2, -82.7],
  "344": [29.2, -82.1], // Gainesville FL
  "346": [27.5, -82.5], // Tampa FL
  "347": [28.5, -81.4], // Orlando FL
  "349": [26.2, -81.8], // Fort Myers FL
  // Alabama
  "350": [33.5, -86.8], // Birmingham AL
  "351": [33.5, -86.8],
  "352": [33.5, -86.8],
  "354": [34.7, -87.0], // Tuscaloosa AL
  "355": [33.5, -86.8],
  "356": [34.7, -86.6], // Huntsville AL
  "357": [34.7, -86.6],
  "358": [34.7, -86.6],
  "359": [34.7, -86.6],
  "360": [32.4, -86.3], // Montgomery AL
  "361": [32.4, -86.3],
  "362": [33.2, -87.6], // Anniston AL
  "363": [31.2, -85.4], // Dothan AL
  "364": [31.3, -85.8], // Evergreen AL
  "365": [30.7, -88.1], // Mobile AL
  "366": [30.7, -88.1],
  // Tennessee
  "370": [36.2, -86.8], // Nashville TN
  "371": [36.2, -86.8],
  "372": [36.2, -86.8],
  "373": [35.0, -85.3], // Chattanooga TN
  "374": [35.0, -85.3],
  "375": [35.1, -90.0], // Memphis TN
  "376": [36.3, -82.4], // Johnson City TN
  "377": [35.9, -84.1], // Knoxville TN
  "378": [35.9, -84.1],
  "379": [35.1, -90.0],
  // Mississippi
  "386": [32.3, -90.2], // Jackson MS
  "387": [34.3, -89.5], // Greenville MS
  "388": [34.3, -89.5],
  "389": [32.3, -90.2],
  "390": [32.3, -90.2],
  "391": [32.3, -90.2],
  "392": [31.3, -89.3], // Hattiesburg MS
  "393": [31.3, -89.3],
  "394": [30.4, -89.1], // Biloxi MS
  "395": [30.4, -89.1], // Gulfport MS
  "396": [33.5, -88.7], // Columbus MS
  "397": [31.3, -89.3],
  // Louisiana / Arkansas / Oklahoma / Texas
  "700": [30.0, -90.1], // New Orleans LA
  "701": [30.0, -90.1],
  "703": [30.2, -92.0], // Thibodaux LA
  "704": [30.5, -91.2], // Hammond LA
  "705": [30.5, -91.2], // Lafayette LA
  "706": [30.2, -93.2], // Lake Charles LA
  "707": [30.5, -91.2], // Baton Rouge LA
  "708": [30.5, -91.2],
  "710": [32.5, -93.7], // Shreveport LA
  "711": [32.5, -93.7],
  "712": [31.3, -92.4], // Alexandria LA
  "713": [31.3, -92.4],
  "714": [32.5, -93.7],
  "716": [32.5, -92.1], // Monroe LA
  "717": [32.5, -92.1],
  "718": [32.5, -93.7],
  "719": [32.5, -92.1],
  "720": [72.6, -92.0], // AR - typo placeholder
  "721": [34.7, -92.3], // Little Rock AR
  "722": [34.7, -92.3],
  "723": [35.4, -94.4], // Memphis/West AR
  "724": [35.4, -94.4],
  "725": [33.7, -92.0], // Pine Bluff AR
  "726": [36.1, -94.2], // Harrison AR
  "727": [36.4, -94.2], // Fayetteville AR
  "728": [33.2, -93.2], // Texarkana AR
  "729": [35.8, -90.7], // Fort Smith AR
  "730": [35.5, -97.5], // Oklahoma City OK
  "731": [35.5, -97.5],
  "734": [36.1, -95.9], // Tulsa OK
  "735": [36.1, -95.9],
  "736": [36.1, -95.9],
  "737": [34.2, -97.1], // Enid OK
  "738": [34.6, -98.4], // Woodward OK
  "739": [35.0, -97.9], // Liberal OK
  "740": [36.1, -95.9],
  "741": [35.5, -97.5],
  "743": [36.7, -97.1], // Miami OK
  "744": [34.8, -96.7], // Muskogee OK
  "745": [34.2, -95.8], // McAlester OK
  "746": [34.2, -97.1], // Ponca City OK
  "747": [34.6, -98.4], // Durant OK
  "748": [34.6, -99.3], // Lawton OK
  "749": [36.4, -99.4], // Enid OK
  "750": [32.8, -96.8], // Dallas TX
  "751": [32.8, -96.8],
  "752": [32.8, -96.8],
  "753": [32.8, -96.8],
  "754": [33.2, -97.2], // Greenville TX
  "755": [33.5, -94.4], // Texarkana TX
  "756": [32.4, -99.7], // Longview TX
  "757": [32.4, -95.0], // Tyler TX
  "758": [31.3, -94.7], // Palestine TX
  "759": [31.3, -94.7], // Lufkin TX
  "760": [32.7, -97.3], // Fort Worth TX
  "761": [32.7, -97.3],
  "762": [32.8, -96.8],
  "763": [31.5, -97.2], // Waco TX
  "764": [31.1, -97.7], // Stephenville TX
  "765": [31.5, -97.2], // Temple TX
  "766": [31.5, -97.2],
  "767": [31.5, -97.2],
  "768": [32.4, -99.7], // Abilene TX
  "769": [31.4, -100.4], // San Angelo TX
  "770": [29.8, -95.4], // Houston TX
  "771": [29.8, -95.4],
  "772": [29.8, -95.4],
  "773": [30.1, -93.7], // Conroe TX
  "774": [30.1, -94.1], // Richmond TX
  "775": [29.3, -94.8], // Galveston TX
  "776": [30.1, -94.1], // Beaumont TX
  "777": [30.1, -94.1],
  "778": [28.8, -97.0], // Bryan TX
  "779": [28.4, -96.5], // Victoria TX
  "780": [29.4, -98.5], // San Antonio TX
  "781": [29.4, -98.5],
  "782": [29.4, -98.5],
  "783": [27.8, -97.4], // Corpus Christi TX
  "784": [27.8, -97.4],
  "785": [26.2, -98.2], // McAllen TX
  "786": [30.3, -97.7], // Austin TX
  "787": [30.3, -97.7],
  "788": [30.3, -97.7],
  "789": [30.3, -97.7],
  "790": [33.6, -101.8], // Amarillo TX
  "791": [33.6, -101.8],
  "792": [34.2, -101.7],
  "793": [33.6, -101.8], // Lubbock TX
  "794": [33.6, -101.8],
  "795": [32.4, -100.4], // Abilene TX
  "796": [32.4, -100.4],
  "797": [31.8, -106.4], // Midland TX
  "798": [31.8, -106.4], // El Paso TX
  "799": [31.8, -106.4],
  // Midwest
  "400": [38.3, -85.8], // Louisville KY
  "401": [38.3, -85.8],
  "402": [38.3, -85.8],
  "403": [37.1, -84.1], // Lexington KY
  "404": [37.1, -84.1],
  "405": [37.1, -84.1],
  "406": [38.1, -84.5], // Frankfort KY
  "407": [36.9, -83.1], // Corbin KY
  "408": [36.9, -83.1],
  "409": [37.1, -84.1],
  "410": [39.1, -84.5], // Cincinnati OH
  "411": [38.0, -84.5], // Ashland KY
  "412": [38.0, -82.7],
  "413": [37.8, -87.6], // Campton KY
  "414": [37.8, -87.6],
  "415": [37.8, -84.3], // Pikeville KY
  "416": [37.8, -84.3],
  "417": [37.1, -86.3], // Hazard KY
  "418": [37.1, -86.3],
  "420": [36.7, -87.5], // Paducah KY
  "421": [37.0, -85.9], // Bowling Green KY
  "422": [37.0, -85.9],
  "423": [37.0, -87.5], // Owensboro KY
  "424": [37.0, -87.5], // Evansville IN
  "425": [37.0, -87.5],
  "426": [37.0, -87.5],
  "427": [37.0, -85.9],
  "430": [41.5, -81.7], // Columbus OH
  "431": [41.5, -81.7],
  "432": [40.0, -83.0],
  "433": [40.0, -83.0],
  "434": [40.8, -81.4], // Toledo OH
  "435": [40.8, -81.4],
  "436": [41.7, -83.5], // Toledo OH
  "437": [41.1, -81.5], // Zanesville OH
  "438": [41.1, -81.5],
  "439": [41.2, -80.8], // Steubenville OH
  "440": [41.5, -81.7], // Cleveland OH
  "441": [41.5, -81.7],
  "442": [41.1, -81.5], // Akron OH
  "443": [41.1, -81.5],
  "444": [41.1, -80.6], // Youngstown OH
  "445": [40.8, -81.4], // Canton OH
  "446": [40.8, -81.4],
  "447": [40.0, -82.0],
  "448": [40.0, -82.0], // Mansfield OH
  "449": [40.0, -82.0],
  "450": [39.1, -84.5], // Cincinnati OH
  "451": [39.1, -84.5],
  "452": [39.1, -84.5],
  "453": [39.8, -84.2], // Dayton OH
  "454": [39.8, -84.2],
  "455": [39.8, -84.2], // Springfield OH
  "456": [39.3, -82.1], // Chillicothe OH
  "457": [40.8, -84.6], // Athens OH
  "458": [40.8, -84.6], // Lima OH
  "459": [39.1, -84.5],
  "460": [39.8, -86.2], // Indianapolis IN
  "461": [39.8, -86.2],
  "462": [39.8, -86.2],
  "463": [39.8, -86.2],
  "464": [40.5, -86.1], // Gary IN
  "465": [40.5, -86.1],
  "466": [40.8, -85.1], // Fort Wayne IN
  "467": [40.8, -85.1],
  "468": [40.8, -85.1],
  "469": [41.1, -85.1],
  "470": [39.1, -86.5], // Terre Haute IN
  "471": [38.3, -85.8], // New Albany IN
  "472": [40.0, -86.5], // Columbus IN
  "473": [40.4, -86.9], // Muncie IN
  "474": [39.2, -85.9], // Bloomington IN
  "475": [38.0, -87.6], // Washington IN
  "476": [38.0, -87.6], // Evansville IN
  "477": [38.0, -87.6],
  "478": [39.5, -87.4], // Terre Haute IN
  "479": [40.4, -86.9], // Lafayette IN
  "480": [42.3, -83.0], // Detroit MI
  "481": [42.3, -83.0],
  "482": [42.3, -83.0],
  "483": [42.3, -83.0],
  "484": [42.7, -83.3], // Flint MI
  "485": [42.7, -83.3],
  "486": [43.4, -83.9], // Saginaw MI
  "487": [43.4, -83.9],
  "488": [42.3, -85.0], // Lansing MI
  "489": [42.3, -85.2], // Kalamazoo MI
  "490": [42.3, -85.2], // Battle Creek MI
  "491": [42.3, -85.2],
  "492": [42.9, -85.7], // Jackson MI
  "493": [42.9, -85.7], // Grand Rapids MI
  "494": [42.9, -85.7],
  "495": [43.7, -85.5], // Grand Rapids MI
  "496": [44.3, -85.4], // Traverse City MI
  "497": [44.8, -84.7], // Gaylord MI
  "498": [46.5, -87.4], // Iron Mountain MI
  "499": [46.5, -87.4],
  // Iowa / Minnesota / Dakotas / Nebraska / Kansas
  "500": [41.6, -93.6], // Des Moines IA
  "501": [41.6, -93.6],
  "502": [41.6, -93.6],
  "503": [41.6, -93.6],
  "504": [41.3, -96.0], // Mason City IA
  "505": [42.5, -96.4], // Fort Dodge IA
  "506": [42.0, -94.4], // Waterloo IA
  "507": [42.5, -92.3],
  "508": [42.0, -90.7], // Creston IA
  "509": [42.0, -90.7],
  "510": [41.3, -95.9], // Sioux City IA
  "511": [41.3, -95.9],
  "512": [42.0, -93.5], // Sheldon IA
  "513": [41.0, -92.0],
  "514": [41.6, -93.6],
  "515": [41.3, -95.9], // Omaha NE area
  "516": [41.3, -96.0],
  "520": [42.5, -90.7], // Dubuque IA
  "521": [41.7, -91.5], // Decorah IA
  "522": [41.7, -91.5], // Cedar Rapids IA
  "523": [41.7, -91.5],
  "524": [41.0, -91.7], // Cedar Rapids IA
  "525": [40.8, -91.1], // Ottumwa IA
  "526": [41.0, -91.7], // Burlington IA
  "527": [41.0, -91.7],
  "528": [42.5, -90.7],
  "530": [43.1, -89.4], // Milwaukee WI
  "531": [43.0, -87.9], // Milwaukee WI
  "532": [43.0, -87.9],
  "534": [42.7, -89.0], // Racine WI
  "535": [43.1, -89.4], // Madison WI
  "537": [43.1, -89.4],
  "538": [43.1, -89.4],
  "539": [43.8, -88.4], // Portage WI
  "540": [44.5, -88.0], // Wausau WI
  "541": [44.5, -88.0],
  "542": [44.5, -88.0], // Green Bay WI
  "543": [44.5, -88.0],
  "544": [44.5, -89.6], // Wausau WI
  "545": [44.5, -89.6],
  "546": [44.8, -91.5], // La Crosse WI
  "547": [44.8, -91.5], // Eau Claire WI
  "548": [44.8, -91.5],
  "549": [44.8, -87.0], // Oshkosh WI
  "550": [44.9, -93.3], // St Paul MN
  "551": [44.9, -93.3],
  "553": [44.9, -93.3], // Minneapolis MN
  "554": [44.9, -93.3],
  "555": [44.9, -93.3],
  "556": [46.8, -92.1], // Duluth MN
  "557": [46.8, -92.1],
  "558": [46.8, -92.1],
  "559": [44.1, -94.0], // Rochester MN
  "560": [44.1, -94.0], // Mankato MN
  "561": [45.6, -94.2], // Monticello MN
  "562": [45.6, -94.2],
  "563": [45.6, -94.2], // St Cloud MN
  "564": [46.3, -96.1], // Brainerd MN
  "565": [47.5, -94.9], // Detroit Lakes MN
  "566": [47.9, -97.1], // Bemidji MN
  "567": [48.2, -96.6], // Thief River Falls MN
  "570": [43.5, -96.7], // Sioux Falls SD
  "571": [43.5, -96.7],
  "572": [44.4, -100.4], // Watertown SD
  "573": [44.4, -100.4], // Mitchell SD
  "574": [44.4, -98.2], // Aberdeen SD
  "575": [44.4, -100.4], // Pierre SD
  "576": [43.9, -99.3], // Mobridge SD
  "577": [44.1, -103.2], // Rapid City SD
  "580": [46.9, -96.8], // Fargo ND
  "581": [46.9, -96.8],
  "582": [47.9, -97.1], // Grand Forks ND
  "583": [47.0, -98.7], // Devils Lake ND
  "584": [47.0, -100.8], // Jamestown ND
  "585": [46.8, -100.8], // Bismarck ND
  "586": [48.2, -101.3], // Dickinson ND
  "587": [48.2, -103.6], // Minot ND
  "588": [48.2, -103.6], // Williston ND
  // Nebraska
  "680": [41.3, -96.0], // Omaha NE
  "681": [41.3, -96.0],
  "683": [40.8, -96.7], // Lincoln NE
  "684": [40.8, -96.7],
  "685": [40.8, -96.7],
  "686": [40.7, -99.1], // Columbus NE
  "687": [40.7, -99.1], // Norfolk NE
  "688": [40.9, -100.8], // Grand Island NE
  "689": [41.1, -100.8], // Hastings NE
  "690": [40.9, -100.8], // McCook NE
  "691": [41.9, -103.7], // North Platte NE
  "692": [42.9, -100.5], // Valentine NE
  "693": [41.9, -103.7], // Alliance NE
  // Kansas
  "660": [39.1, -94.6], // Kansas City KS
  "661": [39.1, -94.6],
  "662": [39.1, -94.6],
  "664": [39.0, -95.7], // Topeka KS
  "665": [39.0, -95.7],
  "666": [39.0, -95.7],
  "667": [38.7, -99.3], // Fort Scott KS
  "668": [39.0, -95.7],
  "669": [38.0, -97.3], // Salina KS
  "670": [37.7, -97.3], // Wichita KS
  "671": [37.7, -97.3],
  "672": [37.7, -97.3],
  "673": [38.9, -99.3], // Independence KS
  "674": [38.9, -99.3], // Salina KS
  "675": [38.9, -99.3], // Hutchinson KS
  "676": [38.9, -100.5], // Hays KS
  "677": [37.8, -100.5], // Colby KS
  "678": [37.8, -100.5], // Dodge City KS
  "679": [37.1, -100.5], // Liberal KS
  // Illinois / Missouri
  "600": [41.9, -87.6], // Chicago IL (North)
  "601": [41.9, -87.6],
  "602": [41.9, -87.6],
  "603": [41.9, -87.6],
  "604": [41.9, -87.6], // Chicago S suburbs
  "605": [41.9, -87.6],
  "606": [41.9, -87.6],
  "607": [41.9, -87.6],
  "608": [41.9, -87.6],
  "609": [41.5, -88.1], // Kankakee IL
  "610": [42.3, -89.1], // Rockford IL
  "611": [42.3, -89.1],
  "612": [42.3, -89.1],
  "613": [41.5, -90.6], // La Salle IL
  "614": [40.7, -89.6], // Galesburg IL
  "615": [40.7, -89.6],
  "616": [40.7, -89.6], // Peoria IL
  "617": [40.7, -89.6], // Bloomington IL
  "618": [40.1, -88.2], // Champaign IL
  "619": [40.1, -88.2],
  "620": [39.8, -89.6], // Springfield IL (East)
  "622": [38.6, -90.2], // East St Louis IL
  "623": [38.5, -89.0], // Quincy IL
  "624": [38.5, -89.0], // Effingham IL
  "625": [39.8, -89.6], // Springfield IL
  "626": [39.8, -89.6],
  "627": [39.8, -89.6],
  "628": [37.7, -89.2], // Centralia IL
  "629": [37.7, -89.2], // Carbondale IL
  "630": [38.6, -90.2], // St Louis MO
  "631": [38.6, -90.2],
  "633": [38.6, -90.2],
  "634": [38.6, -90.2],
  "635": [38.6, -90.2],
  "636": [38.6, -90.2],
  "637": [38.6, -91.0],
  "638": [38.6, -91.0],
  "639": [38.6, -91.0],
  "640": [39.1, -94.6], // Kansas City MO
  "641": [39.1, -94.6],
  "644": [39.8, -93.6], // St Joseph MO
  "645": [39.8, -93.6],
  "646": [38.6, -92.2], // Chillicothe MO
  "647": [37.2, -93.3], // Harrisonville MO
  "648": [38.6, -92.2], // Jefferson City MO
  "649": [38.6, -92.2],
  "650": [38.6, -92.2],
  "651": [38.6, -92.2],
  "652": [38.6, -92.2], // Columbia MO
  "653": [37.8, -90.4], // Sedalia MO
  "654": [37.2, -93.3], // Springfield MO
  "655": [37.2, -93.3],
  "656": [37.2, -93.3],
  "657": [37.2, -93.3],
  "658": [37.2, -93.3],
  // Mountain / West
  "800": [39.7, -105.0], // Denver CO
  "801": [39.7, -105.0],
  "802": [39.7, -105.0],
  "803": [39.7, -105.0],
  "804": [39.7, -105.0],
  "805": [40.0, -105.3], // Longmont CO
  "806": [40.6, -105.1], // Fort Collins CO
  "807": [40.6, -105.1],
  "808": [38.8, -104.8], // Colorado Springs CO
  "809": [38.8, -104.8],
  "810": [38.3, -104.6], // Pueblo CO
  "811": [37.3, -108.6], // Alamosa CO
  "812": [37.3, -108.6],
  "813": [37.3, -107.9], // Durango CO
  "814": [39.1, -108.6], // Grand Junction CO
  "815": [39.1, -108.6],
  "816": [39.6, -106.3], // Glenwood Springs CO
  "820": [41.1, -104.8], // Cheyenne WY
  "821": [41.3, -105.6], // Yellowstone WY
  "822": [42.9, -106.3], // Wheatland WY
  "823": [42.9, -106.3], // Rawlins WY
  "824": [44.8, -106.9], // Sheridan WY
  "825": [43.0, -108.4], // Riverton WY
  "826": [42.8, -106.3], // Casper WY
  "827": [44.8, -106.9],
  "828": [44.8, -106.9],
  "829": [42.9, -110.0], // Rock Springs WY
  "830": [42.9, -110.0],
  "831": [42.9, -110.0],
  // Idaho / Montana
  "832": [43.6, -116.2], // Pocatello ID
  "833": [42.9, -112.5], // Twin Falls ID
  "834": [43.6, -116.2], // Boise ID
  "835": [46.7, -117.0], // Lewiston ID
  "836": [46.7, -117.0],
  "837": [43.6, -116.2],
  "838": [47.7, -116.8], // Spokane WA area
  "590": [46.9, -110.4], // Billings MT
  "591": [46.9, -110.4],
  "592": [47.5, -111.3], // Wolf Point MT
  "593": [47.5, -111.3], // Miles City MT
  "594": [46.6, -112.0], // Great Falls MT
  "595": [46.6, -112.0],
  "596": [46.6, -112.0], // Helena MT
  "597": [45.8, -108.5], // Butte MT
  "598": [48.0, -114.3], // Missoula MT
  "599": [48.0, -114.3], // Kalispell MT
  // Utah / Nevada / New Mexico / Arizona
  "840": [40.8, -111.9], // Salt Lake City UT
  "841": [40.8, -111.9],
  "842": [40.8, -111.9],
  "843": [40.2, -111.7], // Ogden UT
  "844": [40.2, -111.7],
  "845": [39.7, -111.9], // Provo UT
  "846": [39.7, -111.9],
  "847": [38.6, -109.6], // Price UT
  "850": [33.4, -112.0], // Phoenix AZ
  "851": [33.4, -112.0],
  "852": [33.4, -112.0],
  "853": [33.4, -112.0],
  "855": [33.4, -112.0], // Globe AZ
  "856": [32.2, -110.9], // Tucson AZ
  "857": [32.2, -110.9],
  "859": [33.4, -112.0], // Show Low AZ
  "860": [35.2, -111.7], // Flagstaff AZ
  "863": [34.5, -114.4], // Prescott AZ
  "864": [34.5, -114.4],
  "865": [34.5, -114.4],
  "870": [35.1, -106.6], // Albuquerque NM
  "871": [35.1, -106.6],
  "873": [36.7, -105.9], // Gallup NM
  "874": [36.7, -105.9], // Farmington NM
  "875": [35.7, -105.9], // Santa Fe NM
  "877": [35.1, -107.9], // Las Vegas NM
  "878": [34.1, -106.9], // Socorro NM
  "879": [34.4, -103.2], // Truth or Consequences NM
  "880": [32.3, -106.7], // Las Cruces NM
  "881": [32.3, -106.7], // Clovis NM
  "882": [32.4, -104.2], // Roswell NM
  "883": [32.4, -104.2], // Carlsbad NM
  "884": [33.4, -104.5], // Tucumcari NM
  "885": [31.8, -106.4], // El Paso TX area
  "889": [36.2, -115.1], // Las Vegas NV
  "890": [36.2, -115.1],
  "891": [36.2, -115.1],
  "893": [39.5, -119.8], // Ely NV
  "894": [39.5, -119.8], // Reno NV
  "895": [39.5, -119.8],
  "897": [39.5, -119.8], // Carson City NV
  "898": [39.5, -119.8], // Elko NV
  // Pacific Coast
  "900": [34.1, -118.2], // Los Angeles CA
  "901": [34.1, -118.2],
  "902": [33.8, -118.4], // Inglewood CA
  "903": [33.8, -118.4],
  "904": [34.2, -118.5], // Santa Monica CA
  "905": [33.8, -118.2], // Torrance CA
  "906": [34.1, -118.2], // Whittier CA
  "907": [34.1, -118.2],
  "908": [34.1, -118.2], // Long Beach CA
  "910": [34.1, -118.2], // Pasadena CA
  "911": [34.2, -118.2],
  "912": [34.2, -118.2], // Glendale CA
  "913": [34.4, -118.5], // Oxnard CA
  "914": [34.3, -118.4], // Van Nuys CA
  "915": [34.2, -118.6], // Burbank CA
  "916": [34.4, -118.5], // North Hollywood
  "917": [34.8, -118.9], // Industry CA
  "918": [34.4, -118.5], // Arleta CA
  "919": [33.7, -117.8], // San Diego CA area
  "920": [32.7, -117.2], // San Diego CA
  "921": [32.7, -117.2],
  "922": [33.8, -116.5], // Palm Springs
  "923": [33.3, -117.2], // San Bernardino CA
  "924": [34.1, -117.3],
  "925": [33.8, -117.9], // Riverside CA
  "926": [33.7, -117.8], // Santa Ana CA
  "927": [33.7, -117.8],
  "928": [34.1, -117.3], // Anaheim CA
  "930": [34.4, -119.7], // Oxnard CA
  "931": [34.4, -119.7], // Santa Barbara CA
  "932": [35.4, -119.0], // Bakersfield CA
  "933": [35.4, -119.0],
  "934": [34.9, -120.4], // Santa Maria CA
  "935": [36.7, -121.7], // Mojave CA
  "936": [36.3, -119.3], // Fresno CA
  "937": [36.3, -119.3],
  "938": [36.3, -119.3],
  "939": [36.6, -121.9], // Salinas CA
  "940": [37.8, -122.4], // San Francisco CA
  "941": [37.8, -122.4],
  "942": [37.8, -122.4], // Sacramento CA
  "943": [37.3, -121.9], // Palo Alto CA
  "944": [37.3, -121.9], // San Mateo CA
  "945": [37.5, -122.2], // Oakland CA
  "946": [37.5, -122.2],
  "947": [37.9, -122.3], // Berkeley CA
  "948": [37.9, -122.5], // Richmond CA
  "949": [37.9, -122.5], // San Rafael CA
  "950": [37.3, -121.9], // San Jose CA
  "951": [37.3, -121.9],
  "952": [37.3, -121.9], // Stockton CA
  "953": [37.3, -121.9],
  "954": [38.0, -122.0], // Santa Rosa CA
  "955": [38.6, -121.5], // Eureka CA
  "956": [38.6, -121.5], // Sacramento CA
  "957": [38.6, -121.5],
  "958": [38.6, -121.5],
  "959": [39.2, -121.1], // Marysville CA
  "960": [40.6, -122.4], // Redding CA
  "961": [40.6, -122.4], // Reno NV area
  // Oregon
  "970": [45.5, -122.7], // Portland OR
  "971": [45.5, -122.7],
  "972": [45.5, -122.7],
  "973": [44.9, -123.0], // Salem OR
  "974": [44.1, -123.1], // Eugene OR
  "975": [42.3, -122.9], // Medford OR
  "976": [44.6, -121.2], // Bend OR
  "977": [44.6, -121.2],
  "978": [45.7, -121.5], // Pendleton OR
  "979": [44.6, -121.2],
  // Washington
  "980": [47.6, -122.3], // Seattle WA
  "981": [47.6, -122.3],
  "982": [48.5, -122.2], // Everett WA
  "983": [47.2, -122.4], // Tacoma WA
  "984": [47.2, -122.4],
  "985": [47.0, -122.9], // Olympia WA
  "986": [45.6, -122.7], // Portland OR area / Vancouver WA
  "988": [46.6, -120.5], // Wenatchee WA
  "989": [46.6, -120.5], // Yakima WA
  "990": [47.7, -117.4], // Spokane WA
  "991": [47.7, -117.4],
  "992": [47.7, -117.4],
  "993": [46.3, -119.3], // Pasco WA
  "994": [46.3, -119.3],
  // Alaska / Hawaii
  "995": [61.2, -149.9], // Anchorage AK
  "996": [64.8, -147.7], // Fairbanks AK
  "997": [58.3, -134.4], // Juneau AK
  "998": [58.3, -134.4], // Ketchikan AK
  "999": [58.3, -134.4],
  "967": [21.3, -157.8], // Honolulu HI
  "968": [21.3, -157.8],
};
