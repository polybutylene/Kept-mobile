"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

export const generateReport = action({
  args: { inspectionId: v.id("inspections") },
  handler: async (ctx, args): Promise<{ shareToken: string; summary: string; overallCondition: string }> => {
    const inspection = await ctx.runQuery(api.inspector.getInspection, {
      inspectionId: args.inspectionId,
    });
    if (!inspection) throw new Error("Inspection not found");

    const systemsSummary = (inspection.systems || [])
      .map(
        (s: any) =>
          `${s.systemName} (${s.category}): condition=${s.condition}, make=${s.make || "unknown"}, year=${s.yearManufactured || "unknown"}, concerns=${(s.checklist || []).filter((c: any) => c.flagged).length}`
      )
      .join("\n");

    const prompt = `You are a home inspection report AI. Generate an executive summary.

Property: ${inspection.propertyAddress}, ${inspection.propertyType}, built ${inspection.yearBuilt}, ${inspection.squareFootage} sqft
Systems: ${inspection.systemsCompleted}/${inspection.systemsTotal}

${systemsSummary}

Respond with JSON only: {"summary":"...","overallCondition":"good|fair|poor","fiveYearLow":number,"fiveYearHigh":number}`;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    let summary = `This ${inspection.squareFootage} sqft ${inspection.propertyType} home, built in ${inspection.yearBuilt}, was inspected on ${new Date(inspection.inspectionDate).toLocaleDateString()}.`;
    let overallCondition = "fair";
    let fiveYearLow = 8000;
    let fiveYearHigh = 15000;

    if (apiKey) {
      try {
        const resp = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1500,
            messages: [{ role: "user", content: prompt }],
          }),
        });
        const data = await resp.json();
        const text = data.content?.[0]?.text || "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          summary = parsed.summary || summary;
          overallCondition = parsed.overallCondition || overallCondition;
          fiveYearLow = parsed.fiveYearLow || fiveYearLow;
          fiveYearHigh = parsed.fiveYearHigh || fiveYearHigh;
        }
      } catch (e) {
        console.error("Claude API error:", e);
      }
    }

    const shareToken = Math.random().toString(36).slice(2) + Date.now().toString(36);

    await ctx.runMutation(api.inspector.updateInspection, {
      inspectionId: args.inspectionId,
      executiveSummary: summary,
      overallCondition,
      fiveYearCostEstimate: { low: fiveYearLow, high: fiveYearHigh },
      reportShareToken: shareToken,
      status: "completed",
    });

    return { shareToken, summary, overallCondition };
  },
});

export const deliverReport = action({
  args: { inspectionId: v.id("inspections") },
  handler: async (ctx, args) => {
    await ctx.runMutation(api.inspector.updateInspection, {
      inspectionId: args.inspectionId,
      status: "delivered",
    });
    return { success: true };
  },
});
