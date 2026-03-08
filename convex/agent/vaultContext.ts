/**
 * Vault Context Builder for the AI Agent.
 *
 * Builds structured context from the document vault so the agent can
 * reference specific documents, receipts, warranties, and condition photos
 * when answering homeowner questions about their systems.
 */

import { internalQuery } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";

// ════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════

export interface VaultContext {
  /** Whether a purchase receipt exists for this system. */
  hasReceipt: boolean;
  /** Purchase date from the receipt (if available). */
  purchaseDate: string | null;
  /** Vendor from the receipt. */
  purchaseVendor: string | null;
  /** Purchase amount from the receipt. */
  purchaseAmount: number | null;
  /** Warranty expiration date (if a warranty document exists). */
  warrantyExpiration: string | null;
  /** Whether warranty is still active. */
  warrantyActive: boolean;
  /** Whether any condition photos exist. */
  hasConditionPhotos: boolean;
  /** Date of the most recent condition photo. */
  latestConditionPhotoDate: string | null;
  /** Number of condition photos. */
  conditionPhotoCount: number;
  /** AI condition grade, if ever analyzed (FUTURE). */
  conditionGrade: number | null;
  /** AI compliance flags, if ever analyzed (FUTURE). */
  complianceFlags: Array<{
    code: string;
    description: string;
    severity: string;
    recommendation: string;
  }>;
  /** Brief summaries of stored documents. */
  documentSummaries: string[];
  /** What the user SHOULD upload to improve assessment accuracy. */
  missingRecommendations: string[];
  /** Total vault items for this system. */
  totalItems: number;
}

// ════════════════════════════════════════════════════════════════════
// QUERY — Agent calls this to build context
// ════════════════════════════════════════════════════════════════════

/**
 * Build vault context for a system or home.
 * The agent calls this before generating responses about specific systems.
 */
export const buildVaultContext = internalQuery({
  args: {
    homeId: v.id("homes"),
    systemId: v.optional(v.id("systems")),
  },
  handler: async (ctx, args): Promise<VaultContext> => {
    // Fetch vault items scoped to system (if provided) or home
    let items;
    if (args.systemId) {
      items = await ctx.db
        .query("vaultItems")
        .withIndex("by_system", (q) =>
          q.eq("systemId", args.systemId!).eq("isArchived", false)
        )
        .collect();
    } else {
      items = await ctx.db
        .query("vaultItems")
        .withIndex("by_home", (q) =>
          q.eq("homeId", args.homeId).eq("isArchived", false)
        )
        .collect();
    }

    // Categorize
    const receipts = items.filter((i) => i.type === "receipt");
    const warranties = items.filter((i) => i.type === "warranty");
    const photos = items.filter((i) => i.type === "photo");
    const documents = items.filter(
      (i) => i.type === "document" || i.type === "inspection_report" || i.type === "manual"
    );
    const permits = items.filter((i) => i.type === "permit");

    // Extract key facts from receipts
    const latestReceipt = receipts
      .filter((r) => r.financialMetadata?.purchaseDate)
      .sort(
        (a, b) =>
          new Date(b.financialMetadata!.purchaseDate!).getTime() -
          new Date(a.financialMetadata!.purchaseDate!).getTime()
      )[0];

    // Extract warranty info
    const activeWarranties = warranties.filter((w) => {
      const exp = w.financialMetadata?.warrantyExpiration;
      return exp && new Date(exp) > new Date();
    });

    // Condition photos (sorted by date)
    const sortedPhotos = photos.sort(
      (a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()
    );

    // AI analysis (future — check if any photos have been analyzed)
    const analyzedPhoto = photos.find((p) => p.aiAnalysis?.conditionGrade);
    const complianceFlags = photos
      .flatMap((p) => p.aiAnalysis?.complianceFlags ?? []);

    // Document summaries
    const documentSummaries: string[] = [];
    for (const doc of [...documents, ...permits].slice(0, 5)) {
      const extracted = doc.documentMetadata?.extractedText;
      if (extracted) {
        // First 200 chars of extracted text
        documentSummaries.push(
          `[${doc.type}: ${doc.title}] ${extracted.slice(0, 200)}...`
        );
      } else {
        documentSummaries.push(`[${doc.type}: ${doc.title}] (no text extracted)`);
      }
    }

    // Missing recommendations
    const missingRecommendations: string[] = [];
    if (receipts.length === 0) {
      missingRecommendations.push(
        "Upload the purchase receipt to establish exact purchase date and warranty baseline."
      );
    }
    if (warranties.length === 0) {
      missingRecommendations.push(
        "Upload the warranty documentation so Kept can track coverage and alert you before it expires."
      );
    }
    if (photos.length === 0) {
      missingRecommendations.push(
        "Upload a current photo of this system to help assess its visual condition."
      );
    }
    if (permits.length === 0 && args.systemId) {
      missingRecommendations.push(
        "If you have the installation permit, uploading it helps verify code compliance and installation date."
      );
    }

    return {
      hasReceipt: receipts.length > 0,
      purchaseDate: latestReceipt?.financialMetadata?.purchaseDate ?? null,
      purchaseVendor: latestReceipt?.financialMetadata?.vendor ?? null,
      purchaseAmount: latestReceipt?.financialMetadata?.amount ?? null,
      warrantyExpiration: activeWarranties[0]?.financialMetadata?.warrantyExpiration ?? null,
      warrantyActive: activeWarranties.length > 0,
      hasConditionPhotos: photos.length > 0,
      latestConditionPhotoDate: sortedPhotos[0]?.capturedAt ?? null,
      conditionPhotoCount: photos.length,
      conditionGrade: analyzedPhoto?.aiAnalysis?.conditionGrade ?? null,
      complianceFlags,
      documentSummaries,
      missingRecommendations,
      totalItems: items.length,
    };
  },
});

/**
 * Format vault context into a human-readable string for the agent prompt.
 */
export function formatVaultContextForPrompt(
  vaultCtx: VaultContext,
  systemName: string
): string {
  if (vaultCtx.totalItems === 0) {
    return (
      `VAULT: No documents or photos for "${systemName}". ` +
      `Recommendations: ${vaultCtx.missingRecommendations.join("; ")}`
    );
  }

  const lines: string[] = [`VAULT CONTEXT for "${systemName}":`];

  if (vaultCtx.hasReceipt) {
    lines.push(
      `  • Receipt: Purchased ${vaultCtx.purchaseDate ?? "date unknown"}` +
        (vaultCtx.purchaseVendor ? ` from ${vaultCtx.purchaseVendor}` : "") +
        (vaultCtx.purchaseAmount ? ` for $${vaultCtx.purchaseAmount}` : "")
    );
  }

  if (vaultCtx.warrantyExpiration) {
    const isActive = vaultCtx.warrantyActive;
    lines.push(
      `  • Warranty: Expires ${vaultCtx.warrantyExpiration} (${isActive ? "ACTIVE" : "EXPIRED"})`
    );
  }

  if (vaultCtx.hasConditionPhotos) {
    lines.push(
      `  • Condition photos: ${vaultCtx.conditionPhotoCount} photo(s), ` +
        `latest from ${vaultCtx.latestConditionPhotoDate}`
    );
  }

  if (vaultCtx.conditionGrade !== null) {
    lines.push(`  • AI condition grade: ${vaultCtx.conditionGrade}/10`);
  }

  if (vaultCtx.complianceFlags.length > 0) {
    lines.push(
      `  • Compliance flags: ${vaultCtx.complianceFlags.map((f) => `[${f.severity}] ${f.description}`).join("; ")}`
    );
  }

  if (vaultCtx.documentSummaries.length > 0) {
    lines.push(`  • Documents: ${vaultCtx.documentSummaries.join("; ")}`);
  }

  if (vaultCtx.missingRecommendations.length > 0) {
    lines.push(
      `  • Missing: ${vaultCtx.missingRecommendations.join("; ")}`
    );
  }

  return lines.join("\n");
}
