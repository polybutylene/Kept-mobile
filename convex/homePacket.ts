"use node";

/**
 * Home Packet — Structured data aggregation and packet generation
 *
 * Generates comprehensive home review or service prep packets
 * by aggregating system data, forecasts, and maintenance schedules,
 * then saving sequential structured messages to the conversation.
 */

import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";
import { callClaude, extractResponseText } from "./ai/claude";
import { getSeasonalContent } from "./data/seasonalContent";

// ============================================================
// Generate Comprehensive Packet
// ============================================================

export const generateComprehensivePacket = action({
  args: {
    conversationId: v.id("conversations"),
    homeId: v.id("homes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.runQuery(internal.ai.queries.getProfileByUserId, { userId });
    if (!profile) throw new Error("User profile not found");

    // 1. Aggregate all data
    const homeContext = await ctx.runQuery(internal.ai.queries.getHomeContextInternal, {
      homeId: args.homeId,
    });

    const maintenanceContext = await ctx.runQuery(internal.ai.queries.getMaintenanceContextInternal, {
      homeId: args.homeId,
    });

    // Build enriched system data with forecasts
    const systemsData: Array<{
      systemId: string;
      systemName: string;
      category: string;
      manufacturer: string | null;
      modelNumber: string | null;
      age: number;
      healthScore: number;
      expectedLifespan: number;
      remainingLife: number;
      failureProbability1yr: number;
      failureProbability3yr: number;
      estimatedReplacementCost: number;
      needsAttention: boolean;
      lastServiceDate: string | null;
      conditionNotes: string | null;
      lifespanProgress: number;
      costLow: number;
      costHigh: number;
    }> = [];
    for (const system of homeContext.systems) {
      const forecast = await ctx.runQuery(internal.ai.queries.getForecastContextInternal, {
        systemId: system.id as Id<"systems">,
      });

      systemsData.push({
        systemId: system.id,
        systemName: system.name,
        category: system.category,
        manufacturer: system.manufacturer,
        modelNumber: system.modelNumber,
        age: system.age,
        healthScore: system.healthScore,
        expectedLifespan: system.expectedLifespan,
        remainingLife: system.remainingLife,
        failureProbability1yr: system.failureProbability1yr,
        failureProbability3yr: system.failureProbability3yr,
        estimatedReplacementCost: system.estimatedReplacementCost,
        needsAttention: system.needsAttention,
        lastServiceDate: system.lastServiceDate,
        conditionNotes: system.conditionNotes,
        lifespanProgress: system.expectedLifespan > 0
          ? Math.min(1, system.age / system.expectedLifespan)
          : 0,
        costLow: forecast?.estimatedReplacementCostLow ?? system.estimatedReplacementCost * 0.8,
        costHigh: forecast?.estimatedReplacementCostHigh ?? system.estimatedReplacementCost * 1.3,
      });
    }

    // Sort by health score ascending (worst first)
    systemsData.sort((a, b) => a.healthScore - b.healthScore);

    // 2. Generate AI editorial content (brief status notes and summary)
    const editorialPrompt = `You are a concise home maintenance expert. Generate brief editorial content for a home packet.

Home: ${homeContext.home.address}, ${homeContext.home.city}, ${homeContext.home.state}
Year built: ${homeContext.home.yearBuilt ?? "Unknown"}
Health score: ${homeContext.home.overallHealthScore}
Systems: ${systemsData.length}

For each system below, write a ONE-LINE status note (max 20 words) that captures the current state:
${systemsData.map(s => `- ${s.systemName}: health ${s.healthScore}/100, age ${s.age} yrs, expected life ${s.expectedLifespan} yrs, ${s.needsAttention ? "needs attention" : "OK"}`).join("\n")}

Also write:
1. A ONE-LINE overall summary (max 25 words) of the home's state
2. A list of any systems that should have "Plan Replacement" shown (failure risk >10% this year OR past 75% of expected life)

Respond ONLY with JSON:
{
  "summaryLine": "Your overall one-liner",
  "systemNotes": { "systemId": "status note text", ... },
  "showReplacementFor": ["systemId1", "systemId2"]
}`;

    let editorial: {
      summaryLine: string;
      systemNotes: Record<string, string>;
      showReplacementFor: string[];
    };

    try {
      const response = await callClaude({
        systemPrompt: editorialPrompt,
        messages: [{ role: "user", content: "Generate the packet editorial content." }],
        maxTokens: 1000,
        temperature: 0.5,
      });
      const text = extractResponseText(response).replace(/```json\n?|```/g, "").trim();
      editorial = JSON.parse(text);
    } catch {
      // Fallback if AI fails
      editorial = {
        summaryLine: `Your home has ${systemsData.length} tracked systems with an overall health score of ${Math.round(homeContext.home.overallHealthScore)}.`,
        systemNotes: Object.fromEntries(
          systemsData.map(s => [s.systemId, s.needsAttention ? "Needs attention" : "In good condition"])
        ),
        showReplacementFor: systemsData
          .filter(s => s.failureProbability1yr > 10 || s.lifespanProgress > 0.75)
          .map(s => s.systemId),
      };
    }

    // 3. Build structured data for each section
    const now = new Date();
    const generatedDate = now.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    // Packet Header
    const headerData = {
      address: `${homeContext.home.address}, ${homeContext.home.city}, ${homeContext.home.state} ${homeContext.home.zipCode}`,
      generatedDate,
      yearBuilt: homeContext.home.yearBuilt ?? 0,
      systemCount: systemsData.length,
      homePulseScore: Math.round(homeContext.home.overallHealthScore),
      summaryLine: editorial.summaryLine,
    };

    // System health cards
    const systemHealthCards = systemsData.map(s => ({
      systemId: s.systemId,
      systemName: s.systemName,
      modelInfo: [s.manufacturer, s.modelNumber].filter(Boolean).join(" ") || s.category,
      healthScore: Math.round(s.healthScore),
      age: s.age,
      expectedLifespan: { low: Math.round(s.expectedLifespan * 0.8), high: Math.round(s.expectedLifespan * 1.2) },
      failureRiskThisYear: Math.round(s.failureProbability1yr),
      replacementCost: { low: Math.round(s.costLow), high: Math.round(s.costHigh) },
      lifespanProgress: Math.round(s.lifespanProgress * 100) / 100,
      statusNote: editorial.systemNotes[s.systemId] ?? (s.needsAttention ? "Needs attention" : "Good condition"),
      statusSeverity: s.healthScore >= 80 ? "good" : s.healthScore >= 60 ? "watch" : s.healthScore >= 40 ? "attention" : "critical",
      showReplacement: editorial.showReplacementFor.includes(s.systemId),
    }));

    // Priority actions
    const urgentItems = systemsData
      .filter(s => s.failureProbability1yr > 10 || s.lifespanProgress > 0.85)
      .map(s => ({
        id: s.systemId,
        task: `Plan ${s.systemName.toLowerCase()} replacement`,
        dueDate: "ASAP",
        priorityLevel: "urgent" as const,
        context: `${s.failureProbability1yr}% failure risk this year — ${s.age} yrs on a ${s.expectedLifespan}-yr expected life`,
        timeEstimate: "Planning",
        isDIY: false,
        isSafetyTask: false,
        actionType: "replacement" as const,
      }));

    const thisMonthItems = maintenanceContext.overdueTasks.concat(
      maintenanceContext.upcomingTasks.filter((t: any) => {
        const due = new Date(t.dueDate);
        const daysOut = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return daysOut <= 30;
      })
    ).slice(0, 5).map((t: any) => ({
      id: t.id,
      task: t.name,
      dueDate: t.dueDate,
      priorityLevel: t.priority === "critical" ? "urgent" as const : t.priority === "high" ? "high" as const : "medium" as const,
      context: `Due ${t.dueDate}${t.systemName ? ` · ${t.systemName}` : ""}`,
      timeEstimate: "15-30 min",
      isDIY: true,
      isSafetyTask: t.priority === "critical",
      actionType: "maintenance" as const,
    }));

    const nextQuarterItems = maintenanceContext.upcomingTasks.filter((t: any) => {
      const due = new Date(t.dueDate);
      const daysOut = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return daysOut > 30 && daysOut <= 90;
    }).slice(0, 5).map((t: any) => ({
      id: t.id,
      task: t.name,
      dueDate: t.dueDate,
      priorityLevel: "low" as const,
      context: `Due ${t.dueDate}`,
      timeEstimate: "",
      isDIY: true,
      isSafetyTask: false,
      actionType: "maintenance" as const,
    }));

    // Maintenance calendar
    const allTasks = [
      ...maintenanceContext.overdueTasks.map((t: any) => ({ ...t, taskType: "diy" as const, isOverdue: true })),
      ...maintenanceContext.upcomingTasks.map((t: any) => ({ ...t, taskType: "diy" as const, isOverdue: false })),
    ];

    // Replacement forecast horizons
    const horizon1to2 = systemsData.filter(s => s.remainingLife <= 2);
    const horizon3to5 = systemsData.filter(s => s.remainingLife > 2 && s.remainingLife <= 5);
    const horizon5to10 = systemsData.filter(s => s.remainingLife > 5 && s.remainingLife <= 10);
    const horizon10plus = systemsData.filter(s => s.remainingLife > 10);

    const buildHorizon = (label: string, systems: typeof systemsData) => ({
      label,
      estimatedTotal: systems.reduce((sum, s) => sum + s.estimatedReplacementCost, 0),
      systems: systems.map(s => ({
        systemId: s.systemId,
        systemName: s.systemName,
        estimatedCost: s.estimatedReplacementCost,
        urgencyBar: s.lifespanProgress,
        priorityLabel: s.failureProbability1yr > 10 ? "High priority" : s.lifespanProgress > 0.6 ? "Moderate priority" : "Low priority",
        contextNote: s.failureProbability1yr > 10
          ? `Plan now — ${s.failureProbability1yr}% failure chance this year`
          : `~${Math.round(s.remainingLife)} years remaining`,
        canPlanNow: s.failureProbability1yr > 10 || s.lifespanProgress > 0.75,
      })),
    });

    const horizons = [
      buildHorizon("1–2 Years", horizon1to2),
      buildHorizon("3–5 Years", horizon3to5),
      buildHorizon("5–10 Years", horizon5to10),
      buildHorizon("10+ Years", horizon10plus),
    ].filter(h => h.systems.length > 0);

    const nearTermTotal = [...horizon1to2, ...horizon3to5].reduce(
      (sum, s) => sum + s.estimatedReplacementCost, 0
    );

    // 4. Build grouped system data (by category)
    const categoryGroups: Record<string, typeof systemHealthCards> = {};
    for (const card of systemHealthCards) {
      const sys = systemsData.find(s => s.systemId === card.systemId);
      const cat = sys?.category ?? "other";
      if (!categoryGroups[cat]) categoryGroups[cat] = [];
      categoryGroups[cat].push(card);
    }

    const systemGroups = Object.entries(categoryGroups).map(([category, systems]) => ({
      category,
      systems: systems.sort((a, b) => a.healthScore - b.healthScore),
    }));

    // 5. Build seasonal timeline data
    const monthIndex = now.getMonth(); // 0-11
    const currentSeason =
      monthIndex >= 2 && monthIndex <= 4 ? "spring" :
      monthIndex >= 5 && monthIndex <= 8 ? "summer" :
      monthIndex >= 9 && monthIndex <= 11 ? "fall" : "winter";

    const seasonalData = getSeasonalContent(currentSeason);
    const homeCategories = [...new Set(systemsData.map(s => s.category))];

    const seasonMap = [
      { name: "Winter", months: "Jan–Feb", key: "winter" },
      { name: "Spring", months: "Mar–May", key: "spring" },
      { name: "Summer", months: "Jun–Sep", key: "summer" },
      { name: "Fall", months: "Oct–Dec", key: "fall" },
    ];

    const seasonTimeline = seasonMap.map(s => {
      const data = getSeasonalContent(s.key);
      const relevantTasks = (data?.tasks ?? [])
        .filter(t => homeCategories.includes(t.systemCategory))
        .map(t => t.name);
      const isAvoid = s.key === "summer" && homeCategories.includes("hvac");
      return {
        name: s.name,
        months: s.months,
        status: isAvoid ? "avoid" as const : relevantTasks.length > 0 ? "recommended" as const : "neutral" as const,
        tasks: relevantTasks.slice(0, 3),
        note: isAvoid ? "HVAC techs are busy — higher costs" : null,
      };
    });

    // 6. Build climate impact data
    const climateFactors: Array<{
      icon: string;
      name: string;
      impactLevel: "low" | "medium" | "high";
      description: string;
      actionItem: string | null;
    }> = [];

    const state = homeContext.home.state?.toLowerCase() ?? "";
    const isGulfCoast = state === "fl" || state === "florida" || state === "al" || state === "alabama" ||
      state === "ms" || state === "mississippi" || state === "la" || state === "louisiana" || state === "tx" || state === "texas";

    if (isGulfCoast) {
      climateFactors.push({
        icon: "💧",
        name: "Humidity",
        impactLevel: "high",
        description: "High humidity puts extra load on AC and accelerates corrosion on plumbing connections.",
        actionItem: "Monitor AC efficiency each cooling season.",
      });
      climateFactors.push({
        icon: "🌀",
        name: "Hurricane Prep",
        impactLevel: "medium",
        description: "Hurricane season (June–November) means potential power outages and water damage risk.",
        actionItem: "Review generator hookup options before June each year.",
      });
      climateFactors.push({
        icon: "🌡️",
        name: "Heat Load",
        impactLevel: "medium",
        description: "Extended cooling seasons mean your AC runs 8+ months per year, accelerating wear.",
        actionItem: "Annual AC tune-up is critical — not optional.",
      });
    } else {
      climateFactors.push({
        icon: "🌡️",
        name: "Temperature Swings",
        impactLevel: "medium",
        description: "Seasonal temperature changes stress HVAC and plumbing systems through expansion/contraction cycles.",
        actionItem: null,
      });
    }

    if (homeContext.home.waterHardness === "hard" || homeContext.home.waterHardness === "very_hard") {
      climateFactors.push({
        icon: "💧",
        name: "Hard Water",
        impactLevel: "high",
        description: "Hard water accelerates sediment buildup in water heaters and reduces appliance lifespan.",
        actionItem: "Flush water heater twice yearly instead of annually.",
      });
    }

    // 7. Build emergency info (empty state — user fills in)
    const emergencyContacts = [
      { id: "hvac", role: "HVAC Contractor", name: null, phone: null, isFilled: false },
      { id: "plumber", role: "Plumber", name: null, phone: null, isFilled: false },
      { id: "electrician", role: "Electrician", name: null, phone: null, isFilled: false },
      { id: "handyman", role: "General Handyman", name: null, phone: null, isFilled: false },
      { id: "insurance", role: "Insurance Agent", name: null, phone: null, isFilled: false },
    ];

    const emergencyShutoffs = [
      { id: "water", type: "Main Water Shutoff", icon: "water", location: null, isFilled: false },
      { id: "electrical", type: "Electrical Panel", icon: "electrical", location: null, isFilled: false },
      { id: "ac", type: "AC Unit (outdoor)", icon: "ac", location: null, isFilled: false },
    ];

    // 8. Save sequential messages to conversation
    const saveMsg = async (content: string, structuredContent?: { type: string; payload: unknown }) => {
      await ctx.runMutation(internal.ai.chatMutations.saveMessage, {
        conversationId: args.conversationId,
        role: "assistant",
        content,
        structuredContent,
      });
    };

    // Message 1: Header
    await saveMsg("", {
      type: "packet_header",
      payload: headerData,
    });

    // Message 2: Grouped System Grid
    await saveMsg("Here's your systems at a glance:", {
      type: "system_grouped_grid",
      payload: { groups: systemGroups, totalCount: systemsData.length },
    });

    // Message 3: Priority Actions
    if (urgentItems.length > 0 || thisMonthItems.length > 0 || nextQuarterItems.length > 0) {
      await saveMsg("A few things need attention:", {
        type: "priority_actions",
        payload: {
          urgent: urgentItems,
          thisMonth: thisMonthItems,
          nextQuarter: nextQuarterItems,
        },
      });
    }

    // Message 4: Seasonal Timeline
    await saveMsg("", {
      type: "seasonal_timeline",
      payload: {
        currentSeason,
        seasons: seasonTimeline,
        aiRecommendation: (seasonalData?.tasks ?? []).length > 0
          ? `${seasonMap.find(s => s.key === currentSeason)?.name ?? "This season"} is a good window. ${seasonalData?.tasks[0]?.whyNow ?? ""}`
          : "Keep up with your regular maintenance schedule.",
      },
    });

    // Message 5: Maintenance Calendar
    if (allTasks.length > 0) {
      await saveMsg("Here's your maintenance schedule:", {
        type: "maintenance_calendar",
        payload: {
          tasks: allTasks.map(t => ({
            id: t.id,
            taskName: t.name,
            dueDate: t.dueDate,
            taskType: t.priority === "critical" ? "safety" : "diy",
            priority: t.priority === "critical" ? "critical" : "recommended",
            isOverdue: "isOverdue" in t ? t.isOverdue : false,
          })),
        },
      });
    }

    // Message 6: Replacement Forecast
    if (horizons.length > 0) {
      await saveMsg("For budgeting:", {
        type: "replacement_forecast",
        payload: {
          horizons,
          totalNearTerm: {
            amount: nearTermTotal,
            years: 5,
            monthlyBudget: Math.round(nearTermTotal / 60),
          },
        },
      });
    }

    // Message 7: Climate Impact
    if (climateFactors.length > 0) {
      await saveMsg("", {
        type: "climate_impact_card",
        payload: {
          region: `${homeContext.home.city ?? ""}, ${homeContext.home.state ?? ""}`.replace(/^, |, $/g, "").trim() || "Your region",
          factors: climateFactors,
        },
      });
    }

    // Message 8: Emergency Info
    await saveMsg("One more thing — make sure you're emergency ready:", {
      type: "emergency_info_card",
      payload: {
        contacts: emergencyContacts,
        shutoffs: emergencyShutoffs,
      },
    });

    // Message 9: Packet Actions
    await saveMsg("That's your full home packet.", {
      type: "packet_actions",
      payload: {
        homeId: args.homeId,
        conversationId: args.conversationId,
      },
    });

    return { success: true };
  },
});

// ============================================================
// Generate Service Prep Packet
// ============================================================

export const generateServicePrepPacket = action({
  args: {
    conversationId: v.id("conversations"),
    homeId: v.id("homes"),
    systemId: v.id("systems"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // 1. Get system data
    const forecast = await ctx.runQuery(internal.ai.queries.getForecastContextInternal, {
      systemId: args.systemId,
    });

    const homeContext = await ctx.runQuery(internal.ai.queries.getHomeContextInternal, {
      homeId: args.homeId,
    });

    const system = homeContext.systems.find((s: any) => s.id === args.systemId);
    if (!system) throw new Error("System not found");

    const now = new Date();
    const generatedDate = now.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    // 2. Generate service-specific content via AI
    const prepPrompt = `You are a seasoned home maintenance expert. Generate service call preparation content for a ${system.name} (${system.category}).

System details:
- Age: ${system.age} years
- Health score: ${system.healthScore}/100
- Expected lifespan: ${system.expectedLifespan} years
- Failure probability (1yr): ${system.failureProbability1yr}%
- Replacement cost: $${system.estimatedReplacementCost}
- Location: ${homeContext.home.city}, ${homeContext.home.state}

Generate service call prep content. Respond ONLY with JSON:
{
  "duration": "30-60 min",
  "diagnosticCostLow": 75,
  "diagnosticCostHigh": 150,
  "repairCostLow": 100,
  "repairCostHigh": 400,
  "typicalSteps": ["Step 1 that a tech will do", "Step 2", ...],
  "proTip": "One important tip for the homeowner",
  "questionsToAsk": [
    { "question": "Question text", "context": "Why to ask this" },
    ...
  ],
  "redFlags": [
    { "flag": "Red flag to watch for", "explanation": "Why it matters" },
    ...
  ],
  "costGuide": [
    { "serviceName": "Service type", "costLow": 100, "costHigh": 200 },
    ...
  ]
}`;

    let prepContent: {
      duration: string;
      diagnosticCostLow: number;
      diagnosticCostHigh: number;
      repairCostLow: number;
      repairCostHigh: number;
      typicalSteps: string[];
      proTip: string;
      questionsToAsk: { question: string; context: string }[];
      redFlags: { flag: string; explanation: string }[];
      costGuide: { serviceName: string; costLow: number; costHigh: number }[];
    };

    try {
      const response = await callClaude({
        systemPrompt: prepPrompt,
        messages: [{ role: "user", content: "Generate the service prep content." }],
        maxTokens: 2000,
        temperature: 0.5,
      });
      const text = extractResponseText(response).replace(/```json\n?|```/g, "").trim();
      prepContent = JSON.parse(text);
    } catch {
      // Fallback
      prepContent = {
        duration: "30-60 min",
        diagnosticCostLow: 75,
        diagnosticCostHigh: 150,
        repairCostLow: 100,
        repairCostHigh: 500,
        typicalSteps: ["Inspect the system", "Test key components", "Provide diagnosis and estimate"],
        proTip: "If they recommend replacement, don't decide on the spot. Get a second opinion.",
        questionsToAsk: [
          { question: "What exactly did you find?", context: "Get specifics, not just 'it needs replacing'" },
          { question: "What are my repair vs. replacement options?", context: "Understand the full picture" },
        ],
        redFlags: [
          { flag: "Pressuring you to decide immediately", explanation: "A good tech gives you time" },
          { flag: "Won't show you the problem", explanation: "You have a right to see what they found" },
        ],
        costGuide: [
          { serviceName: "Service Call / Diagnostic", costLow: 75, costHigh: 150 },
        ],
      };
    }

    // 3. Save sequential messages
    const saveMsg = async (content: string, structuredContent?: { type: string; payload: unknown }) => {
      await ctx.runMutation(internal.ai.chatMutations.saveMessage, {
        conversationId: args.conversationId,
        role: "assistant",
        content,
        structuredContent,
      });
    };

    // Service Prep Header
    await saveMsg("", {
      type: "service_prep_header",
      payload: {
        systemName: system.name,
        modelInfo: [system.manufacturer, system.modelNumber].filter(Boolean).join(" ") || system.category,
        generatedDate,
      },
    });

    // System Health Card (standalone)
    const lifespanProgress = system.expectedLifespan > 0
      ? Math.min(1, system.age / system.expectedLifespan)
      : 0;

    await saveMsg("Here's where this system stands:", {
      type: "system_health_grid",
      payload: {
        systems: [{
          systemId: system.id,
          systemName: system.name,
          modelInfo: [system.manufacturer, system.modelNumber].filter(Boolean).join(" ") || system.category,
          healthScore: Math.round(system.healthScore),
          age: system.age,
          expectedLifespan: { low: Math.round(system.expectedLifespan * 0.8), high: Math.round(system.expectedLifespan * 1.2) },
          failureRiskThisYear: Math.round(system.failureProbability1yr),
          replacementCost: {
            low: Math.round(system.estimatedReplacementCost * 0.8),
            high: Math.round(system.estimatedReplacementCost * 1.3),
          },
          lifespanProgress: Math.round(lifespanProgress * 100) / 100,
          statusNote: system.needsAttention ? "Needs attention" : "Good condition",
          statusSeverity: system.healthScore >= 80 ? "good" : system.healthScore >= 60 ? "watch" : "attention",
          showReplacement: system.failureProbability1yr > 10 || lifespanProgress > 0.75,
        }],
      },
    });

    // What to Expect
    await saveMsg("Here's what to expect when the tech arrives:", {
      type: "what_to_expect",
      payload: {
        duration: prepContent.duration,
        diagnosticCost: { low: prepContent.diagnosticCostLow, high: prepContent.diagnosticCostHigh },
        repairCostRange: { low: prepContent.repairCostLow, high: prepContent.repairCostHigh },
        typicalSteps: prepContent.typicalSteps,
        proTip: prepContent.proTip,
      },
    });

    // Questions to Ask
    await saveMsg("Questions worth asking:", {
      type: "questions_to_ask",
      payload: { questions: prepContent.questionsToAsk },
    });

    // Red Flags
    await saveMsg("Watch for these red flags:", {
      type: "red_flags",
      payload: { flags: prepContent.redFlags },
    });

    // Cost Guide
    await saveMsg("What's reasonable for this service:", {
      type: "cost_guide",
      payload: {
        region: `${homeContext.home.city}, ${homeContext.home.state}`,
        updatedDate: generatedDate,
        services: prepContent.costGuide,
        warningNote: "If a quote is significantly above these ranges, get a second opinion.",
      },
    });

    // Post-Service Prompt
    await saveMsg("After the service call, come back and I'll help you make sense of everything.", {
      type: "post_service_prompt",
      payload: {},
    });

    return { success: true };
  },
});

// ============================================================
// Show System Selector (for service prep mode)
// ============================================================

export const showSystemSelector = action({
  args: {
    conversationId: v.id("conversations"),
    homeId: v.id("homes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get all systems for this home
    const homeContext = await ctx.runQuery(internal.ai.queries.getHomeContextInternal, {
      homeId: args.homeId,
    });

    const systems = homeContext.systems.map((s: { id: string; name: string; category: string }) => ({
      id: s.id,
      name: s.name,
      category: s.category,
    }));

    // Save the system selector message
    await ctx.runMutation(internal.ai.chatMutations.saveMessage, {
      conversationId: args.conversationId,
      role: "assistant",
      content: "Which system do you need the service packet for?",
      structuredContent: {
        type: "packet_system_selector",
        payload: { systems },
      },
    });

    return { success: true };
  },
});
