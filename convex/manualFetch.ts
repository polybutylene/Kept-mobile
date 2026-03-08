"use node";

import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// ============================================================
// CONSTANTS
// ============================================================

const BRAVE_API_URL = "https://api.search.brave.com/res/v1/web/search";
const MAX_PDF_SIZE = 25 * 1024 * 1024;

const TRUSTED_DOMAINS = [
  "manualslib.com", "manualzz.com", "manualowl.com",
  "carrier.com", "trane.com", "lennox.com", "rheem.com",
  "goodmanmfg.com", "york.com", "daikin.com", "mitsubishicomfort.com",
  "lg.com", "samsung.com", "whirlpool.com", "ge.com", "geappliances.com",
  "maytag.com", "bosch-home.com", "frigidaire.com", "kohler.com",
  "moen.com", "ao-smith.com", "noritz.com", "rinnai.com",
  "navieninc.com", "honeywell.com", "generac.com",
  "americanstandardair.com", "ruud.com",
];

function normalizeKey(manufacturer: string, modelNumber: string): string {
  return (manufacturer + "::" + modelNumber)
    .toLowerCase()
    .replace(/[\s\-_\/\\]+/g, "");
}

// ============================================================
// PUBLIC: Trigger manual fetch for a system
// ============================================================

export const fetchManualForSystem = action({
  args: {
    systemId: v.id("systems"),
    homeId: v.id("homes"),
    manufacturer: v.string(),
    modelNumber: v.string(),
  },
  handler: async (ctx, args): Promise<{ status: string; title?: string; vaultDocumentId?: any; cacheId?: any }> => {
    const key = normalizeKey(args.manufacturer, args.modelNumber);

    const existing = await ctx.runQuery(internal.manualFetchHelpers.getCachedManualQuery, {
      normalizedKey: key,
    });

    if (existing && existing.fetchStatus === "parsed") {
      await ctx.runMutation(internal.manualFetchHelpers.touchCache, {
        cacheId: existing._id,
      });
      if (existing.vaultDocumentId) {
        await ctx.runMutation(internal.manualFetchHelpers.linkDocumentToSystem, {
          vaultDocumentId: existing.vaultDocumentId,
          systemId: args.systemId,
        });
      }
      return {
        status: "cached" as const,
        title: existing.title,
        vaultDocumentId: existing.vaultDocumentId,
      };
    }

    if (existing && (existing.fetchStatus === "searching" || existing.fetchStatus === "downloading")) {
      return { status: "in_progress" as const, cacheId: existing._id };
    }

    let cacheId: Id<"manualCache">;
    if (existing && existing.fetchStatus === "failed") {
      await ctx.runMutation(internal.manualFetchHelpers.updateCacheStatus, {
        cacheId: existing._id,
        fetchStatus: "searching",
      });
      cacheId = existing._id;
    } else {
      cacheId = await ctx.runMutation(internal.manualFetchHelpers.createCacheEntry, {
        manufacturer: args.manufacturer,
        modelNumber: args.modelNumber,
        normalizedKey: key,
      });
    }

    await ctx.scheduler.runAfter(0, internal.manualFetch.searchAndDownload, {
      cacheId,
      homeId: args.homeId,
      systemId: args.systemId,
      manufacturer: args.manufacturer,
      modelNumber: args.modelNumber,
    });

    return { status: "started" as const, cacheId };
  },
});

// ============================================================
// INTERNAL: Search Brave + Download PDF + Store in Vault
// ============================================================

export const searchAndDownload = internalAction({
  args: {
    cacheId: v.id("manualCache"),
    homeId: v.id("homes"),
    systemId: v.id("systems"),
    manufacturer: v.string(),
    modelNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.BRAVE_SEARCH_API_KEY;
    if (!apiKey) {
      await ctx.runMutation(internal.manualFetchHelpers.updateCacheStatus, {
        cacheId: args.cacheId,
        fetchStatus: "failed",
        fetchError: "BRAVE_SEARCH_API_KEY not configured",
      });
      return;
    }

    try {
      // ---- STEP 1: Search Brave ----
      const searchQuery = args.manufacturer + " \"" + args.modelNumber + "\" owner manual PDF";
      const searchUrl =
        BRAVE_API_URL + "?q=" + encodeURIComponent(searchQuery) + "&count=10&search_lang=en";

      console.log("[manual-fetch] Searching: " + searchQuery);

      const searchResp = await fetch(searchUrl, {
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip",
          "X-Subscription-Token": apiKey,
        },
      });

      if (!searchResp.ok) {
        const errText = await searchResp.text();
        throw new Error("Brave Search API " + searchResp.status + ": " + errText);
      }

      const searchData = await searchResp.json();
      const results: Array<{ title: string; url: string; description: string }> =
        searchData.web?.results || [];

      if (results.length === 0) {
        throw new Error("No search results found for this model");
      }

      const pdfResult = findBestPdfResult(results, args.manufacturer, args.modelNumber);
      if (!pdfResult) {
        throw new Error("No PDF manual found in search results");
      }

      console.log("[manual-fetch] Found: " + pdfResult.title + " at " + pdfResult.url);

      await ctx.runMutation(internal.manualFetchHelpers.updateCacheStatus, {
        cacheId: args.cacheId,
        fetchStatus: "downloading",
        sourceUrl: pdfResult.url,
        title: cleanTitle(pdfResult.title, args.manufacturer, args.modelNumber),
      });

      // ---- STEP 2: Try downloading PDF from ranked candidates ----
      const allCandidates = findAllPdfResults(results, args.manufacturer, args.modelNumber);
      let downloadedBuf: ArrayBuffer | null = null;
      let usedCandidate = pdfResult;

      for (const candidate of allCandidates) {
        try {
          const downloadUrl = candidate.url.replace(/^http:\/\//i, "https://");
          console.log("[manual-fetch] Trying: " + downloadUrl);

          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 20000);

          const pdfResp = await fetch(downloadUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              Accept: "application/pdf,application/octet-stream,*/*",
              "Accept-Language": "en-US,en;q=0.9",
            },
            redirect: "follow",
            signal: controller.signal,
          });
          clearTimeout(timeout);

          if (!pdfResp.ok) {
            console.log("[manual-fetch] HTTP " + pdfResp.status + " — skipping");
            continue;
          }

          const buf = await pdfResp.arrayBuffer();
          if (buf.byteLength < 5000) {
            console.log("[manual-fetch] Too small (" + buf.byteLength + "B) — likely error page");
            continue;
          }
          if (buf.byteLength > MAX_PDF_SIZE) {
            console.log("[manual-fetch] Too large (" + Math.round(buf.byteLength / 1024 / 1024) + "MB)");
            continue;
          }

          const magic = String.fromCharCode(...new Uint8Array(buf.slice(0, 5)));
          const ct = pdfResp.headers.get("content-type") || "";
          if (!magic.startsWith("%PDF") && !ct.includes("pdf")) {
            console.log("[manual-fetch] Not a valid PDF — skipping");
            continue;
          }

          downloadedBuf = buf;
          usedCandidate = candidate;
          console.log("[manual-fetch] Downloaded " + Math.round(buf.byteLength / 1024) + "KB from " + downloadUrl);
          break;
        } catch (dlErr: any) {
          console.log("[manual-fetch] Failed: " + (dlErr.name === "AbortError" ? "timeout" : dlErr.message));
          continue;
        }
      }

      if (!downloadedBuf) {
        throw new Error("Could not download a valid PDF from " + allCandidates.length + " search results");
      }

      // ---- STEP 3: Store in Convex ----
      const pdfBlob = new Blob([downloadedBuf], { type: "application/pdf" });
      const storageId = await ctx.storage.store(pdfBlob);

      await ctx.runMutation(internal.manualFetchHelpers.updateCacheStatus, {
        cacheId: args.cacheId,
        fetchStatus: "stored",
        storageId,
        fileSize: downloadedBuf.byteLength,
        sourceUrl: usedCandidate.url,
      });

      // ---- STEP 4: Create vault document + trigger parse ----
      const ownerInfo = await ctx.runQuery(internal.manualFetchHelpers.getSystemOwnerInfo, {
        systemId: args.systemId,
      });

      if (!ownerInfo?.profileId) {
        throw new Error("Could not determine system owner for vault document");
      }

      const title = cleanTitle(usedCandidate.title, args.manufacturer, args.modelNumber);
      const fileName = (args.manufacturer + "_" + args.modelNumber + "_manual.pdf").replace(/\s+/g, "_");

      const vaultDocumentId = await ctx.runMutation(
        internal.manualFetchHelpers.createVaultDocumentInternal,
        {
          homeId: args.homeId,
          uploadedBy: ownerInfo.profileId,
          title,
          storageId,
          fileName,
          fileSize: downloadedBuf.byteLength,
          linkedSystemId: args.systemId,
          category: ownerInfo.category,
        }
      );

      await ctx.runMutation(internal.manualFetchHelpers.updateCacheStatus, {
        cacheId: args.cacheId,
        fetchStatus: "parsed",
        vaultDocumentId,
        title,
      });

      console.log(
        "[manual-fetch] Success: " + fileName + " (" + Math.round(downloadedBuf.byteLength / 1024) + "KB)"
      );
    } catch (error: any) {
      console.error(
        "[manual-fetch] Failed for " + args.manufacturer + " " + args.modelNumber + ": " + error.message
      );
      await ctx.runMutation(internal.manualFetchHelpers.updateCacheStatus, {
        cacheId: args.cacheId,
        fetchStatus: "failed",
        fetchError: error.message || "Unknown error",
      });
    }
  },
});

// ============================================================
// HELPERS
// ============================================================

function findAllPdfResults(
  results: Array<{ title: string; url: string; description: string }>,
  manufacturer: string,
  modelNumber: string
): Array<{ title: string; url: string }> {
  const mfgLower = manufacturer.toLowerCase();
  const modelLower = modelNumber.toLowerCase();
  type Scored = { title: string; url: string; score: number };
  const scored: Scored[] = [];
  for (const r of results) {
    const url = r.url.toLowerCase();
    const title = r.title.toLowerCase();
    const desc = (r.description || "").toLowerCase();
    let score = 0;
    const isPdfUrl = url.endsWith(".pdf") || url.includes("/pdf/") || url.includes("pdf");
    const isManualPage = title.includes("manual") || title.includes("owner") || title.includes("guide") || desc.includes("manual") || desc.includes("owner");
    if (!isPdfUrl && !isManualPage) continue;
    if (url.endsWith(".pdf")) score += 20;
    else if (url.includes(".pdf")) score += 15;
    if (url.includes(modelLower.replace(/[\s\-]/g, ""))) score += 15;
    if (title.includes(modelLower)) score += 10;
    if (url.includes(mfgLower)) score += 5;
    if (title.includes(mfgLower)) score += 5;
    if (title.includes("owner")) score += 3;
    if (title.includes("installation")) score += 2;
    const domain = extractDomain(r.url);
    if (TRUSTED_DOMAINS.some((d) => domain.includes(d.toLowerCase()))) score += 8;
    if (domain.includes(mfgLower)) score += 12;
    if (score > 0) scored.push({ title: r.title, url: r.url, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 5);
}

function findBestPdfResult(
  results: Array<{ title: string; url: string; description: string }>,
  manufacturer: string,
  modelNumber: string
): { title: string; url: string } | null {
  const mfgLower = manufacturer.toLowerCase();
  const modelLower = modelNumber.toLowerCase();

  type Scored = { title: string; url: string; score: number };
  const scored: Scored[] = [];

  for (const r of results) {
    const url = r.url.toLowerCase();
    const title = r.title.toLowerCase();
    const desc = (r.description || "").toLowerCase();
    let score = 0;

    const isPdfUrl = url.endsWith(".pdf") || url.includes("/pdf/") || url.includes("pdf");
    const isManualPage =
      title.includes("manual") ||
      title.includes("owner") ||
      title.includes("guide") ||
      desc.includes("manual") ||
      desc.includes("owner");

    if (!isPdfUrl && !isManualPage) continue;

    if (url.endsWith(".pdf")) score += 20;
    else if (url.includes(".pdf")) score += 15;

    if (url.includes(modelLower.replace(/[\s\-]/g, ""))) score += 15;
    if (title.includes(modelLower)) score += 10;

    if (url.includes(mfgLower)) score += 5;
    if (title.includes(mfgLower)) score += 5;

    if (title.includes("owner")) score += 3;
    if (title.includes("installation")) score += 2;
    if (title.includes("service")) score += 1;

    const domain = extractDomain(r.url);
    if (TRUSTED_DOMAINS.some((d) => domain.includes(d.toLowerCase()))) {
      score += 8;
    }
    if (domain.includes(mfgLower)) score += 12;

    if (score > 0) {
      scored.push({ title: r.title, url: r.url, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.length > 0 ? scored[0] : null;
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function cleanTitle(rawTitle: string, manufacturer: string, modelNumber: string): string {
  let title = rawTitle
    .replace(/\s*\|\s*.*/g, "")
    .replace(/\s*-\s*ManualsLib.*$/i, "")
    .replace(/\s*-\s*Free PDF.*$/i, "")
    .replace(/\.pdf$/i, "")
    .trim();

  if (title.length < 10) {
    title = manufacturer + " " + modelNumber + " Owner's Manual";
  }

  if (title.length > 100) {
    title = title.substring(0, 97) + "...";
  }

  return title;
}
