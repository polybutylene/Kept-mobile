"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { callClaude, fileToBase64, extractResponseText } from "./ai/claude";
import { decodeModelPlate } from "./lib/modelDecoder";
import { validateScanResult } from "./lib/scanValidator";
import { lookupManual } from "./lib/manualLookup";

/**
 * Extract data from a document image using Claude Vision
 */
export const extractDocumentData = action({
  args: {
    documentId: v.id("serviceDocuments"),
  },
  handler: async (ctx, args) => {
    const document = await ctx.runQuery(internal.scanning.getDocument, {
      documentId: args.documentId,
    });

    if (!document) {
      throw new Error("Document not found");
    }

    await ctx.runMutation(internal.scanning.updateDocumentStatus, {
      documentId: args.documentId,
      parseStatus: "processing",
    });

    try {
      // Convert Convex storage file to base64 for Claude Vision
      const image = await fileToBase64(ctx, document.storageId);

      const prompt = getExtractionPrompt(document.documentType);

      const response = await callClaude({
        systemPrompt:
          "You are a document analysis assistant. You extract structured data from images of equipment plates, invoices, receipts, warranties, and quotes. Always respond with valid JSON only — no markdown, no code fences, no explanation.",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: image.mediaType,
                  data: image.data,
                },
              },
              {
                type: "text",
                text: prompt,
              },
            ],
          },
        ],
        maxTokens: 1024,
        temperature: 0.1,
      });

      const content = extractResponseText(response);
      if (!content) {
        throw new Error("No response from Claude");
      }

      const extractedData = parseExtractionResponse(content);

      await ctx.runMutation(internal.scanning.updateDocumentWithExtractedData, {
        documentId: args.documentId,
        extractedData,
        parseStatus: "completed",
      });

      // Auto-link costs from invoices/receipts/quotes to service calls
      if (
        (document.documentType === "invoice" ||
          document.documentType === "receipt" ||
          document.documentType === "quote") &&
        extractedData.totalAmount &&
        document.serviceCallId
      ) {
        await ctx.runMutation(internal.scanning.linkCostToServiceCall, {
          serviceCallId: document.serviceCallId,
          amount: extractedData.totalAmount,
          costType: document.documentType === "quote" ? "quoted" : "actual",
          vendor: extractedData.vendor,
          documentId: args.documentId,
        });
      }

      // For model plate scans, run the decoder and validator
      if (document.documentType === "model_plate") {
        const rawDecoded = decodeModelPlate(
          extractedData.manufacturer,
          extractedData.modelNumber,
          extractedData.serialNumber
        );
        const decoded = stripNulls(rawDecoded);

        // Reconcile manufacture year: Claude reads text from the plate,
        // decoder parses serial number patterns. When both exist and
        // disagree, prefer Claude's reading and update decoded to match.
        const claudeYear = extractedData.yearManufactured
          ? parseInt(String(extractedData.yearManufactured), 10)
          : null;
        const decodedYear = decoded?.manufactureYear ?? null;

        if (claudeYear && !isNaN(claudeYear) && claudeYear >= 1950 && claudeYear <= 2030) {
          if (decoded) {
            decoded.manufactureYear = claudeYear;
            decoded.estimatedAge = new Date().getFullYear() - claudeYear;
          }
        } else if (decodedYear) {
          extractedData.yearManufactured = String(decodedYear);
        }

        // Run validation to catch bad parses and safety concerns
        const validation = validateScanResult(
          extractedData,
          decoded ?? null,
          decoded?.equipmentType
        );

        // Look up manual/warranty URLs
        const manualLookup = lookupManual(
          extractedData.manufacturer,
          extractedData.modelNumber,
        );

        console.log("[scan] Decoded plate intelligence:", JSON.stringify(decoded));
        console.log("[scan] Validation:", JSON.stringify(validation));
        return { ...extractedData, decoded, validation, manualLookup };
      }

      return extractedData;
    } catch (error: any) {
      await ctx.runMutation(internal.scanning.updateDocumentStatus, {
        documentId: args.documentId,
        parseStatus: "failed",
        parseError: error.message || "Extraction failed",
      });

      throw error;
    }
  },
});

/**
 * Extract structured quote data from a contractor quote image.
 */
export const extractQuoteData = action({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const image = await fileToBase64(ctx, args.storageId);

    const response = await callClaude({
      systemPrompt:
        "You are a document analysis assistant. You extract structured data from contractor quote images. Always respond with valid JSON only — no markdown, no code fences, no explanation.",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: image.mediaType,
                data: image.data,
              },
            },
            {
              type: "text",
              text: `Analyze this contractor quote/estimate image. Extract the following as valid JSON only:
{
  "providerName": "company name",
  "unitQuoted": "specific equipment make/model being quoted",
  "totalCost": number (total cost as a number),
  "breakdown": {
    "labor": "labor cost description or amount",
    "permit": "permit cost description or 'Included'",
    "disposal": "old unit disposal cost or 'Included'"
  },
  "laborWarranty": "labor warranty terms (e.g. '1 year labor warranty')",
  "additionalNotes": "any other important details"
}

If a field cannot be determined, omit it from the JSON.`,
            },
          ],
        },
      ],
      maxTokens: 1024,
      temperature: 0.1,
    });

    const content = extractResponseText(response);
    if (!content) throw new Error("No response from Claude");

    return parseExtractionResponse(content);
  },
});

// ============================================================
// Prompt builders
// ============================================================

function getExtractionPrompt(documentType: string): string {
  const baseInstruction =
    "Analyze this image and extract the relevant information. Return valid JSON only — no markdown, no code fences, no explanation text.";

  switch (documentType) {
    case "invoice":
    case "receipt":
      return `${baseInstruction}

Extract the following from this invoice/receipt:
{
  "vendor": "company name",
  "date": "YYYY-MM-DD format",
  "totalAmount": number (just the number, no currency symbol),
  "lineItems": [
    {"description": "item description", "amount": number}
  ]
}

If any field cannot be determined, omit it from the JSON.`;

    case "quote":
      return `${baseInstruction}

Extract the following from this quote/estimate:
{
  "vendor": "company name",
  "date": "YYYY-MM-DD format",
  "totalAmount": number (total quoted amount),
  "lineItems": [
    {"description": "item/service description", "amount": number}
  ]
}

If any field cannot be determined, omit it from the JSON.`;

    case "model_plate":
      return `You are analyzing a photograph of an equipment data plate, rating plate, or model plate from residential home equipment. Extract ALL readable information with maximum accuracy.

EXTRACTION RULES:
1. Extract EXACTLY what is printed. Do not guess, infer, or autocomplete partial text.
2. If a character is unclear, provide your best read AND note it in uncertainCharacters.
3. If a field is completely unreadable, omit it — do NOT fabricate data.
4. The MODEL NUMBER and SERIAL NUMBER are different fields. Model identifies the product type. Serial is unique to this unit.
5. If you see a date printed explicitly (MFG DATE, DATE, MFR DATE, FD, etc.), extract it as yearManufactured — this is more reliable than serial decoding.
6. Read ALL specifications: voltage, amps, watts, BTU, capacity, refrigerant, fuel type, phase, Hz, pressure ratings, SEER, AFUE, EER, HSPF, UEF.
7. Note the BRAND/MANUFACTURER name exactly as printed.

COMMON FIELD LABELS TO LOOK FOR:
"MOD:", "MODEL:", "M/N:", "SER:", "SERIAL:", "S/N:", "MFG:", "MFG DATE:", "MFR DATE:", "DATE:", "FD:", "E-Nr:", "BTU", "BTU/HR", "VOLTS", "VOLTAGE", "AMPS", "RLA", "LRA", "FLA", "WATTS", "SEER", "SEER2", "AFUE", "EER", "HSPF", "HSPF2", "UEF", "REFRIGERANT", "CHARGE", "MAX FUSE", "MIN CIRCUIT AMPACITY", "PHASE", "HZ", "CAPACITY", "FIRST HOUR RATING", "RECOVERY", "INPUT"

EQUIPMENT-SPECIFIC GUIDANCE:
- HVAC: Look for tonnage in model number (018=1.5T, 024=2T, 030=2.5T, 036=3T, 048=4T, 060=5T). Refrigerant is critical (R-22 vs R-410A).
- Water Heater: Look for capacity (gallons), BTU input (gas) or wattage (electric), First Hour Rating, UEF/Energy Factor.
- Electrical Panel: Look for manufacturer, amperage rating, voltage, phase, AIC rating. CHECK for Federal Pacific (FPE/Stab-Lok) or Zinsco — these are KNOWN DEFECTIVE.
- Appliances: Look for FD code (Bosch factory date), E-Nr (Bosch model).

Return valid JSON only — no markdown, no code fences:
{
  "manufacturer": "brand/manufacturer name exactly as printed",
  "modelNumber": "full model number exactly as printed",
  "serialNumber": "full serial number exactly as printed",
  "yearManufactured": "manufacture year if explicitly printed (YYYY format)",
  "btuRating": "BTU/hr rating if visible",
  "voltage": "voltage rating if visible (e.g. '208/230V')",
  "refrigerantType": "refrigerant type if visible (e.g. 'R-410A')",
  "seerRating": "SEER efficiency rating if visible",
  "ampsRating": "amperage if visible",
  "phaseType": "single or three phase if visible",
  "capacityInfo": "capacity info (tons, gallons, cu ft, HP, grains) if visible",
  "maxFuseSize": "maximum fuse/breaker size if visible",
  "energyFactor": "UEF or Energy Factor if visible",
  "firstHourRating": "first hour rating if visible (water heaters)",
  "refrigerantCharge": "refrigerant charge amount if visible",
  "afueRating": "AFUE percentage if visible (furnaces)",
  "additionalSpecs": "any other readable specifications on the plate",
  "confidence": {
    "overall": "high or medium or low",
    "modelNumber": "high or medium or low",
    "serialNumber": "high or medium or low",
    "manufacturer": "high or medium or low",
    "uncertainCharacters": ["list specific uncertain characters, e.g. 'Serial digit 5: could be 3 or 8'"]
  },
  "safetyFlags": ["list any safety concerns detected, e.g. 'Federal Pacific Stab-Lok panel detected'"],
  "plateQuality": "clear or partial or poor"
}

Transcribe model and serial numbers character-by-character. If a character is ambiguous between letter O and digit 0, or letter I/l and digit 1, note it in uncertainCharacters. Only include fields you can read.`;

    case "warranty":
      return `${baseInstruction}

Extract the following from this warranty document:
{
  "vendor": "company or manufacturer name",
  "warrantyInfo": "brief description of coverage",
  "warrantyExpiry": "expiration date in YYYY-MM-DD format if visible",
  "modelNumber": "covered product model if visible",
  "serialNumber": "covered product serial if visible"
}

If any field cannot be determined, omit it from the JSON.`;

    default:
      return `${baseInstruction}

Extract any relevant information you can find:
{
  "vendor": "company name if visible",
  "date": "any date in YYYY-MM-DD format",
  "totalAmount": any monetary amount as number,
  "modelNumber": "any model number",
  "serialNumber": "any serial number"
}

If any field cannot be determined, omit it from the JSON.`;
  }
}

// ============================================================
// Response parsing
// ============================================================

function parseExtractionResponse(content: string): any {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in response:", content);
      return {};
    }

    const raw = JSON.parse(jsonMatch[0]);

    // Convex doesn't accept null values — strip them so the field is
    // simply absent (undefined) rather than explicitly null.
    return stripNulls(raw);
  } catch (error) {
    console.error("Failed to parse extraction response:", content);
    return {};
  }
}

/**
 * Recursively remove keys whose value is null from an object/array,
 * so Convex schema validation doesn't reject `null` where it expects
 * `v.optional(v.string())` (which means the field should be absent).
 */
function stripNulls(obj: any): any {
  if (obj === null || obj === undefined) return undefined;
  if (Array.isArray(obj)) return obj.map(stripNulls).filter((v: any) => v !== undefined);
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
