"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { callClaude, fileToBase64, extractResponseText } from "./ai/claude";

// ============================================================
// MAIN AI PARSING PIPELINE
// ============================================================

export const parseDocument = internalAction({
  args: { documentId: v.id("vaultDocuments") },
  handler: async (ctx, args) => {
    const doc = await ctx.runQuery(internal.vault.getDocumentInternal, {
      documentId: args.documentId,
    });
    if (!doc) throw new Error("Document not found");

    await ctx.runMutation(internal.vault.updateParseStatus, {
      documentId: args.documentId,
      parseStatus: "processing",
    });

    try {
      const { data, mediaType } = await fileToBase64(ctx, doc.storageId);
      const prompt = buildVaultExtractionPrompt(doc.docType);

      const isPdf = mediaType === "application/pdf";
      const fileBlock = isPdf
        ? { type: "document" as const, source: { type: "base64" as const, media_type: mediaType, data } }
        : { type: "image" as const, source: { type: "base64" as const, media_type: mediaType, data } };

      const response = await callClaude({
        systemPrompt:
          "You are a home document analysis assistant for Kept, a home intelligence platform. Extract structured data from home-related documents (invoices, warranties, receipts, manuals, inspection reports, permits, insurance policies, maintenance records, photos). Always respond with valid JSON only — no markdown, no code fences, no explanation.",
        messages: [
          {
            role: "user",
            content: [
              fileBlock,
              { type: "text", text: prompt },
            ],
          },
        ],
        maxTokens: 2048,
        temperature: 0.1,
        enablePdfSupport: isPdf,
      });

      const content = extractResponseText(response);
      if (!content) throw new Error("No response from Claude");

      const parsed = parseJsonResponse(content);
      const confidence = parsed.confidence ?? 0.7;
      const reviewNeeded = confidence < 0.6;

      // Auto-match to a system based on extracted manufacturer/model
      let matchedSystemId = doc.linkedSystemId ?? undefined;
      let matchedCategory = doc.category ?? undefined;

      if (!matchedSystemId && (parsed.manufacturer || parsed.modelNumber)) {
        const systems = await ctx.runQuery(internal.vault.getHomeSystems, {
          homeId: doc.homeId,
        });

        const match = findBestSystemMatch(systems, parsed);
        if (match) {
          matchedSystemId = match._id;
          matchedCategory = (match.category as any) ?? undefined;
        }
      }

      // Determine category from document content if not matched
      if (!matchedCategory && parsed.systemCategory) {
        const validCategories = [
          "hvac",
          "plumbing",
          "electrical",
          "appliances",
          "structural",
          "exterior",
        ] as const;
        if (validCategories.includes(parsed.systemCategory)) {
          matchedCategory = parsed.systemCategory as typeof validCategories[number];
        }
      }

      // Build extractedFields (strip out meta fields, sanitize types)
      const {
        confidence: _conf,
        suggestedTitle: _title,
        systemCategory: _cat,
        ...rawExtracted
      } = parsed;
      const extractedFields = sanitizeExtractedFields(stripNulls(rawExtracted) || {});

      await ctx.runMutation(internal.vault.updateParseResults, {
        documentId: args.documentId,
        extractedFields,
        aiGeneratedTitle: parsed.suggestedTitle,
        aiConfidence: confidence,
        reviewNeeded,
        linkedSystemId: matchedSystemId,
        category: matchedCategory as any,
      });

      // Generate proactive alerts from extracted dates
      const alerts = generateAlerts(parsed, doc.homeId);
      if (alerts.length > 0) {
        await ctx.runMutation(internal.vault.createAutoAlerts, {
          documentId: args.documentId,
          homeId: doc.homeId,
          systemId: matchedSystemId,
          alerts,
        });
      }

      // Auto-apply high-confidence extractions to linked system
      if (confidence >= 0.8 && matchedSystemId) {
        try {
          await ctx.runMutation(internal.vault.autoApplyToSystem, {
            documentId: args.documentId,
            systemId: matchedSystemId,
          });
        } catch (applyErr: any) {
          console.error("[vault-parse] Auto-apply failed:", applyErr.message);
        }
      }

      // Award HP for adding documentation
      try {
        await ctx.runMutation(internal.vault.awardDocumentHP, {
          homeId: doc.homeId,
          documentTitle: parsed.suggestedTitle || doc.fileName || "document",
        });
      } catch (hpErr: any) {
        console.error("[vault-parse] HP award failed:", hpErr.message);
      }
    } catch (error: any) {
      console.error("[vault-parse] Failed:", error);
      await ctx.runMutation(internal.vault.updateParseStatus, {
        documentId: args.documentId,
        parseStatus: "failed",
        parseError: error.message || "Extraction failed",
      });
    }
  },
});

// ============================================================
// PROMPT BUILDER
// ============================================================

function buildVaultExtractionPrompt(docType: string): string {
  const base =
    "Analyze this document image and extract all relevant structured data. Return valid JSON only.";

  const commonFields = `
Always include these meta fields:
- "suggestedTitle": a concise, descriptive title for this document (e.g. "Carrier AC Warranty Certificate", "Smith Plumbing Invoice - Water Heater Repair")
- "confidence": number 0-1 indicating how confident you are in the extraction
- "systemCategory": one of "hvac", "plumbing", "electrical", "appliances", "structural", "exterior" if detectable, otherwise omit`;

  switch (docType) {
    case "warranty":
      return `${base}
${commonFields}

Extract from this warranty document:
{
  "vendor": "manufacturer or issuing company",
  "warrantyInfo": "summary of coverage terms",
  "warrantyExpiry": "YYYY-MM-DD expiration date",
  "manufacturer": "product manufacturer",
  "modelNumber": "covered product model",
  "serialNumber": "covered product serial",
  "installDate": "YYYY-MM-DD installation date if listed",
  "coverageAmount": dollar amount of coverage if specified (number only),
  "companyName": "installing/servicing company if listed"
}
Omit fields you cannot determine.`;

    case "invoice":
    case "receipt":
      return `${base}
${commonFields}

Extract from this invoice/receipt:
{
  "vendor": "company name",
  "companyName": "company name",
  "date": "YYYY-MM-DD",
  "totalAmount": total as number,
  "lineItems": [{"description": "item", "amount": number}],
  "serviceDescription": "brief summary of work performed",
  "partsReplaced": ["list of parts replaced"],
  "technicianName": "technician name if visible",
  "manufacturer": "equipment manufacturer if referenced",
  "modelNumber": "equipment model if referenced",
  "serialNumber": "equipment serial if referenced",
  "nextServiceDate": "YYYY-MM-DD recommended next service if mentioned",
  "nextServiceDescription": "what the next service should be",
  "warrantyInfo": "any warranty notes on the work"
}
Omit fields you cannot determine.`;

    case "manual":
      return `${base}
${commonFields}

Extract from this equipment manual/documentation:
{
  "manufacturer": "brand/manufacturer",
  "modelNumber": "model number",
  "serialNumber": "serial number if on cover page",
  "serviceDescription": "what type of equipment this covers",
  "warrantyInfo": "warranty information if included"
}
Omit fields you cannot determine.`;

    case "inspection_report":
      return `${base}
${commonFields}

Extract from this inspection report:
{
  "vendor": "inspection company",
  "companyName": "inspection company",
  "date": "YYYY-MM-DD inspection date",
  "technicianName": "inspector name",
  "serviceDescription": "summary of findings",
  "partsReplaced": ["any noted deficiencies or items needing attention"],
  "nextServiceDate": "YYYY-MM-DD next inspection due if mentioned",
  "nextServiceDescription": "recommended follow-up actions"
}
Omit fields you cannot determine.`;

    case "permit":
      return `${base}
${commonFields}

Extract from this permit document:
{
  "permitNumber": "permit number",
  "permitExpiry": "YYYY-MM-DD expiration date",
  "vendor": "issuing authority",
  "companyName": "contractor name if listed",
  "date": "YYYY-MM-DD issue date",
  "serviceDescription": "work description the permit covers"
}
Omit fields you cannot determine.`;

    case "insurance":
      return `${base}
${commonFields}

Extract from this insurance document:
{
  "vendor": "insurance company",
  "companyName": "insurance company",
  "policyNumber": "policy number",
  "coverageAmount": coverage amount as number,
  "date": "YYYY-MM-DD policy effective date",
  "warrantyExpiry": "YYYY-MM-DD policy expiration date (use this field for insurance expiry)",
  "serviceDescription": "coverage summary"
}
Omit fields you cannot determine.`;

    case "maintenance_record":
      return `${base}
${commonFields}

Extract from this maintenance record:
{
  "vendor": "service company",
  "companyName": "service company",
  "date": "YYYY-MM-DD service date",
  "totalAmount": cost as number,
  "serviceDescription": "summary of maintenance performed",
  "partsReplaced": ["parts replaced or serviced"],
  "technicianName": "technician name",
  "manufacturer": "equipment manufacturer if noted",
  "modelNumber": "equipment model if noted",
  "nextServiceDate": "YYYY-MM-DD next service due",
  "nextServiceDescription": "recommended next maintenance"
}
Omit fields you cannot determine.`;

    case "photo":
      return `${base}
${commonFields}

This is a photo of a home system or component. Describe what you see:
{
  "serviceDescription": "detailed description of what is shown in the photo",
  "manufacturer": "brand/manufacturer if visible on equipment",
  "modelNumber": "model number if visible",
  "serialNumber": "serial number if visible"
}
Omit fields you cannot determine.`;

    default:
      return `${base}
${commonFields}

Extract any relevant information:
{
  "vendor": "company name if visible",
  "date": "YYYY-MM-DD any date",
  "totalAmount": any monetary amount as number,
  "serviceDescription": "description of document contents",
  "manufacturer": "any manufacturer",
  "modelNumber": "any model number",
  "serialNumber": "any serial number"
}
Omit fields you cannot determine.`;
  }
}

// ============================================================
// SYSTEM MATCHING
// ============================================================

function findBestSystemMatch(
  systems: Array<{
    _id: any;
    name: string | undefined;
    manufacturer: string | undefined;
    modelNumber: string | undefined;
    serialNumber: string | undefined;
    category: string | null;
    systemTypeName: string | null;
  }>,
  parsed: Record<string, any>
): (typeof systems)[number] | null {
  if (!systems.length) return null;

  let bestMatch: (typeof systems)[number] | null = null;
  let bestScore = 0;

  for (const sys of systems) {
    let score = 0;

    // Serial number match is strongest signal
    if (
      parsed.serialNumber &&
      sys.serialNumber &&
      normalize(parsed.serialNumber) === normalize(sys.serialNumber)
    ) {
      score += 10;
    }

    // Model number match
    if (
      parsed.modelNumber &&
      sys.modelNumber &&
      normalize(parsed.modelNumber) === normalize(sys.modelNumber)
    ) {
      score += 5;
    }

    // Manufacturer match
    if (
      parsed.manufacturer &&
      sys.manufacturer &&
      normalize(parsed.manufacturer).includes(normalize(sys.manufacturer))
    ) {
      score += 3;
    }

    // Category match
    if (
      parsed.systemCategory &&
      sys.category &&
      parsed.systemCategory === sys.category
    ) {
      score += 1;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = sys;
    }
  }

  // Only match if we have meaningful confidence (at least manufacturer match)
  return bestScore >= 3 ? bestMatch : null;
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[\s\-_]/g, "");
}

// ============================================================
// ALERT GENERATION
// ============================================================

function generateAlerts(
  parsed: Record<string, any>,
  homeId: any
): Array<{
  alertType:
    | "warranty_expiring"
    | "policy_renewal"
    | "service_due"
    | "permit_expiring";
  title: string;
  description: string;
  dueDate?: number;
  severity: "info" | "warning" | "critical";
}> {
  const alerts: Array<{
    alertType:
      | "warranty_expiring"
      | "policy_renewal"
      | "service_due"
      | "permit_expiring";
    title: string;
    description: string;
    dueDate?: number;
    severity: "info" | "warning" | "critical";
  }> = [];

  const now = Date.now();
  const SIXTY_DAYS = 60 * 24 * 60 * 60 * 1000;
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

  // Warranty expiring
  if (parsed.warrantyExpiry) {
    const expiry = new Date(parsed.warrantyExpiry).getTime();
    if (!isNaN(expiry) && expiry > now && expiry - now < SIXTY_DAYS) {
      const daysLeft = Math.ceil((expiry - now) / (24 * 60 * 60 * 1000));
      alerts.push({
        alertType: "warranty_expiring",
        title: "Warranty Expiring Soon",
        description: `${parsed.manufacturer || "Equipment"} warranty expires in ${daysLeft} days (${parsed.warrantyExpiry})`,
        dueDate: expiry,
        severity: daysLeft <= 14 ? "critical" : "warning",
      });
    }
  }

  // Permit expiring
  if (parsed.permitExpiry) {
    const expiry = new Date(parsed.permitExpiry).getTime();
    if (!isNaN(expiry) && expiry > now && expiry - now < SIXTY_DAYS) {
      const daysLeft = Math.ceil((expiry - now) / (24 * 60 * 60 * 1000));
      alerts.push({
        alertType: "permit_expiring",
        title: "Permit Expiring",
        description: `Permit ${parsed.permitNumber || ""} expires in ${daysLeft} days`,
        dueDate: expiry,
        severity: daysLeft <= 14 ? "critical" : "warning",
      });
    }
  }

  // Insurance / policy renewal
  if (parsed.policyNumber && parsed.warrantyExpiry) {
    const expiry = new Date(parsed.warrantyExpiry).getTime();
    if (!isNaN(expiry) && expiry > now && expiry - now < SIXTY_DAYS) {
      const daysLeft = Math.ceil((expiry - now) / (24 * 60 * 60 * 1000));
      alerts.push({
        alertType: "policy_renewal",
        title: "Policy Renewal Due",
        description: `Policy ${parsed.policyNumber} renewal in ${daysLeft} days`,
        dueDate: expiry,
        severity: daysLeft <= 14 ? "critical" : "warning",
      });
    }
  }

  // Service due
  if (parsed.nextServiceDate) {
    const serviceDate = new Date(parsed.nextServiceDate).getTime();
    if (
      !isNaN(serviceDate) &&
      serviceDate > now &&
      serviceDate - now < THIRTY_DAYS
    ) {
      const daysLeft = Math.ceil(
        (serviceDate - now) / (24 * 60 * 60 * 1000)
      );
      alerts.push({
        alertType: "service_due",
        title: "Service Due Soon",
        description:
          parsed.nextServiceDescription ||
          `Scheduled service in ${daysLeft} days`,
        dueDate: serviceDate,
        severity: "info",
      });
    }
  }

  return alerts;
}

// ============================================================
// HELPERS
// ============================================================


// Fields the schema expects as v.string() — if Claude returns an object, stringify it
const STRING_FIELDS = new Set([
  "vendor", "date", "modelNumber", "serialNumber", "manufacturer",
  "warrantyInfo", "warrantyExpiry", "serviceDescription",
  "nextServiceDate", "nextServiceDescription", "policyNumber",
  "permitNumber", "permitExpiry", "installDate", "technicianName",
  "companyName",
]);

const NUMBER_FIELDS = new Set(["totalAmount", "coverageAmount"]);

const STRING_ARRAY_FIELDS = new Set(["partsReplaced"]);

function sanitizeExtractedFields(raw: Record<string, any>): Record<string, any> {
  const clean: Record<string, any> = {};

  for (const [key, value] of Object.entries(raw)) {
    if (value === null || value === undefined) continue;

    if (STRING_FIELDS.has(key)) {
      if (typeof value === "string") {
        clean[key] = value;
      } else if (typeof value === "object") {
        clean[key] = JSON.stringify(value);
      } else {
        clean[key] = String(value);
      }
    } else if (NUMBER_FIELDS.has(key)) {
      if (typeof value === "number") {
        clean[key] = value;
      } else if (typeof value === "string") {
        const n = parseFloat(value.replace(/[^0-9.\-]/g, ""));
        if (!isNaN(n)) clean[key] = n;
      }
    } else if (STRING_ARRAY_FIELDS.has(key)) {
      if (Array.isArray(value)) {
        clean[key] = value.map((v: any) => typeof v === "string" ? v : JSON.stringify(v));
      }
    } else if (key === "lineItems" && Array.isArray(value)) {
      clean[key] = value
        .filter((item: any) => item && typeof item === "object")
        .map((item: any) => ({
          description: typeof item.description === "string" ? item.description : String(item.description || ""),
          ...(typeof item.amount === "number" ? { amount: item.amount } : {}),
        }));
    } else {
      // Unknown field — skip it so it doesn't break schema
    }
  }

  return clean;
}

function parseJsonResponse(content: string): Record<string, any> {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[vault-parse] No JSON in response:", content);
      return {};
    }
    return stripNulls(JSON.parse(jsonMatch[0]));
  } catch (error) {
    console.error("[vault-parse] JSON parse failed:", content);
    return {};
  }
}

function stripNulls(obj: any): any {
  if (obj === null || obj === undefined) return undefined;
  if (Array.isArray(obj))
    return obj.map(stripNulls).filter((v: any) => v !== undefined);
  if (typeof obj === "object") {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      const v = stripNulls(value);
      if (v !== undefined) cleaned[key] = v;
    }
    return cleaned;
  }
  return obj;
}
