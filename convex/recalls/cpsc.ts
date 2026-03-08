"use node";

/**
 * CPSC Recall Checking Service
 *
 * Queries the U.S. Consumer Product Safety Commission's public REST API
 * to check user equipment against known recalls.
 *
 * API docs: https://www.saferproducts.gov/RestWebServices
 * No authentication required. Free public API.
 */

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";

// ============================================================
// Types
// ============================================================

interface CPSCRecall {
  RecallID: number;
  RecallNumber: string;
  RecallDate: string;
  Description: string;
  URL: string;
  Title: string;
  ConsumerContact: string;
  LastPublishDate: string;
  Products: Array<{
    Name: string;
    Description: string;
    Type: string;
    CategoryID: string;
    NumberOfUnits: string;
  }>;
  Hazards: Array<{
    Name: string;
    HazardType: string;
    HazardTypeID: string;
  }>;
  Remedies: Array<{
    Name: string;
  }>;
  Manufacturers: Array<{
    Name: string;
    CompanyID: string;
  }>;
  Images: Array<{
    URL: string;
  }>;
}

interface RecallMatch {
  recallNumber: string;
  recallDate: string;
  productName: string;
  description: string;
  hazardDescription: string;
  remedyDescription: string;
  recallUrl: string;
  matchScore: number;
  matchedOn: string;
}

// ============================================================
// Fuzzy matching utilities
// ============================================================

/**
 * Normalizes a string for comparison: lowercase, strip punctuation, collapse whitespace.
 */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Checks if all words from `needle` appear in `haystack` (order-independent).
 */
function wordsMatch(needle: string, haystack: string): boolean {
  const needleWords = normalize(needle).split(" ").filter(Boolean);
  const haystackNorm = normalize(haystack);
  return needleWords.every((w) => haystackNorm.includes(w));
}

/**
 * Scores how well a CPSC recall matches a piece of user equipment.
 * Returns 0 for no match, up to 1.0 for strong match.
 */
function scoreRecallMatch(
  recall: CPSCRecall,
  brand: string,
  productType: string
): { score: number; matchedOn: string } {
  let score = 0;
  const reasons: string[] = [];

  const brandNorm = normalize(brand);

  // Check manufacturer match
  const manufacturerMatch = recall.Manufacturers?.some((m) =>
    normalize(m.Name).includes(brandNorm) || brandNorm.includes(normalize(m.Name))
  );
  if (manufacturerMatch) {
    score += 0.5;
    reasons.push("brand");
  }

  // Check product name/type match
  const productTypeNorm = normalize(productType);
  const productMatch = recall.Products?.some((p) => {
    const nameNorm = normalize(p.Name);
    const descNorm = normalize(p.Description || "");
    return (
      wordsMatch(productType, nameNorm) ||
      wordsMatch(productType, descNorm) ||
      nameNorm.includes(productTypeNorm)
    );
  });
  if (productMatch) {
    score += 0.3;
    reasons.push("product");
  }

  // Check title/description for product type keywords
  const titleDescMatch =
    normalize(recall.Title || "").includes(productTypeNorm) ||
    normalize(recall.Description || "").includes(productTypeNorm);
  if (titleDescMatch) {
    score += 0.2;
    reasons.push("description");
  }

  return { score: Math.min(score, 1.0), matchedOn: reasons.join("+") };
}

// ============================================================
// CPSC API Client
// ============================================================

const CPSC_BASE_URL = "https://www.saferproducts.gov/RestWebServices/Recall";
const MIN_MATCH_SCORE = 0.5; // Only surface recalls at or above this threshold

/**
 * Query the CPSC API for recalls matching a brand/product.
 */
async function queryCPSC(
  brand: string,
  productType?: string
): Promise<CPSCRecall[]> {
  const params = new URLSearchParams({ format: "json" });

  // Search by brand name as ProductName (CPSC indexes on this broadly)
  if (brand) {
    params.set("ProductName", brand);
  }

  const url = `${CPSC_BASE_URL}?${params.toString()}`;

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      console.error(`CPSC API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();

    // API returns an array directly
    if (!Array.isArray(data)) {
      return [];
    }

    return data as CPSCRecall[];
  } catch (error) {
    console.error("CPSC API request failed:", error);
    return [];
  }
}

/**
 * Query CPSC for recent recalls since a given date.
 */
async function queryRecentRecalls(sinceDaysAgo: number = 7): Promise<CPSCRecall[]> {
  const since = new Date();
  since.setDate(since.getDate() - sinceDaysAgo);
  const sinceStr = since.toISOString().split("T")[0]; // YYYY-MM-DD

  const params = new URLSearchParams({
    format: "json",
    RecallDateStart: sinceStr,
  });

  const url = `${CPSC_BASE_URL}?${params.toString()}`;

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? (data as CPSCRecall[]) : [];
  } catch (error) {
    console.error("CPSC recent recalls query failed:", error);
    return [];
  }
}

// ============================================================
// Convex Actions
// ============================================================

/**
 * Check a single system against the CPSC recall database.
 * Called when a user adds/scans new equipment.
 */
export const checkSystemRecalls = internalAction({
  args: {
    systemId: v.id("systems"),
  },
  handler: async (ctx, args): Promise<{ matchCount: number }> => {
    // Get system details
    const system = await ctx.runQuery(internal.recalls.queries.getSystemForRecallCheck, {
      systemId: args.systemId,
    });

    if (!system || !system.manufacturer) {
      return { matchCount: 0 };
    }

    // Query CPSC
    const recalls = await queryCPSC(system.manufacturer, system.systemTypeName ?? undefined);

    if (recalls.length === 0) {
      return { matchCount: 0 };
    }

    // Score and filter matches
    const matches: RecallMatch[] = [];

    for (const recall of recalls) {
      const { score, matchedOn } = scoreRecallMatch(
        recall,
        system.manufacturer,
        system.systemTypeName || ""
      );

      if (score >= MIN_MATCH_SCORE) {
        // Check if we already have this recall for this system
        const existing = await ctx.runQuery(
          internal.recalls.queries.getExistingAlert,
          { systemId: args.systemId, recallNumber: recall.RecallNumber }
        );

        if (!existing) {
          matches.push({
            recallNumber: recall.RecallNumber,
            recallDate: recall.RecallDate || "",
            productName: recall.Products?.[0]?.Name || recall.Title || "",
            description: recall.Description || "",
            hazardDescription:
              recall.Hazards?.map((h) => h.Name).join("; ") || "",
            remedyDescription:
              recall.Remedies?.map((r) => r.Name).join("; ") || "",
            recallUrl: recall.URL || "",
            matchScore: score,
            matchedOn,
          });
        }
      }
    }

    // Store matches
    if (matches.length > 0) {
      await ctx.runMutation(internal.recalls.mutations.createAlerts, {
        systemId: args.systemId,
        homeId: system.homeId,
        matches,
      });
    }

    return { matchCount: matches.length };
  },
});

/**
 * Weekly cron: check all active systems across all homes
 * for new CPSC recalls published in the last 7 days.
 */
export const weeklyRecallScan = internalAction({
  args: {},
  handler: async (ctx): Promise<void> => {
    // 1. Get recent recalls from CPSC
    const recentRecalls = await queryRecentRecalls(7);

    if (recentRecalls.length === 0) {
      console.log("Weekly recall scan: no new recalls in last 7 days.");
      return;
    }

    console.log(`Weekly recall scan: ${recentRecalls.length} new recalls found. Cross-referencing with user equipment...`);

    // 2. Get all active systems with manufacturer data
    const systems = await ctx.runQuery(
      internal.recalls.queries.getAllSystemsWithManufacturer
    );

    let totalMatches = 0;

    // 3. Cross-reference each system against new recalls
    for (const system of systems) {
      if (!system.manufacturer) continue;

      for (const recall of recentRecalls) {
        const { score, matchedOn } = scoreRecallMatch(
          recall,
          system.manufacturer,
          system.systemTypeName || ""
        );

        if (score >= MIN_MATCH_SCORE) {
          // Check if already exists
          const existing = await ctx.runQuery(
            internal.recalls.queries.getExistingAlert,
            { systemId: system._id, recallNumber: recall.RecallNumber }
          );

          if (!existing) {
            await ctx.runMutation(internal.recalls.mutations.createAlerts, {
              systemId: system._id,
              homeId: system.homeId,
              matches: [
                {
                  recallNumber: recall.RecallNumber,
                  recallDate: recall.RecallDate || "",
                  productName: recall.Products?.[0]?.Name || recall.Title || "",
                  description: recall.Description || "",
                  hazardDescription:
                    recall.Hazards?.map((h) => h.Name).join("; ") || "",
                  remedyDescription:
                    recall.Remedies?.map((r) => r.Name).join("; ") || "",
                  recallUrl: recall.URL || "",
                  matchScore: score,
                  matchedOn,
                },
              ],
            });
            totalMatches++;
          }
        }
      }
    }

    console.log(`Weekly recall scan complete. ${totalMatches} new alerts created.`);
  },
});
