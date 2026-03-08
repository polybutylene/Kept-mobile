/**
 * Context Builders
 *
 * Build structured context from the homeowner's data for AI consumption.
 * These are internal helper functions used by AI actions.
 * They run inside Convex actions via ctx.runQuery(internal.*) calls.
 */

import { QueryCtx } from "../_generated/server";
import { Id, Doc } from "../_generated/dataModel";
import {
  calculateAge,
  weibullSurvival,
  conditionalFailureProbability,
  expectedRemainingLife,
} from "../lib/weibull";

// ============================================================
// Types
// ============================================================

export interface HomeContext {
  home: {
    name: string | null;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    yearBuilt: number | null;
    squareFootage: number | null;
    climateZone: number | null;
    waterHardness: string | null;
    overallHealthScore: number;
  };
  systems: SystemSummary[];
}

export interface SystemSummary {
  id: string;
  name: string;
  category: string;
  manufacturer: string | null;
  modelNumber: string | null;
  installDate: string | null;
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
}

export interface ForecastContext {
  systemName: string;
  category: string;
  currentAge: number;
  weibullShape: number;
  weibullScale: number;
  defaultLifespan: number;
  currentFailureProbability: number;
  probabilityIn1Year: number;
  probabilityIn3Years: number;
  probabilityIn5Years: number;
  estimatedReplacementCostLow: number;
  estimatedReplacementCostMid: number;
  estimatedReplacementCostHigh: number;
  expectedRemainingLife: number;
  healthScore: number;
}

export interface DocumentContext {
  hasReceipts: boolean;
  hasWarrantyDocs: boolean;
  hasConditionPhotos: boolean;
  hasManuals: boolean;
  documentCount: number;
  documents: {
    type: string;
    fileName: string;
    vendor: string | null;
    date: string | null;
    totalAmount: number | null;
  }[];
  missingRecommendations: string[];
}

export interface MaintenanceContext {
  overdueTasks: {
    id: string;
    name: string;
    dueDate: string;
    priority: string;
    category: string | undefined;
    systemName: string | null;
  }[];
  upcomingTasks: {
    id: string;
    name: string;
    dueDate: string;
    priority: string;
    category: string | undefined;
    systemName: string | null;
  }[];
  recentlyCompleted: {
    id: string;
    name: string;
    completedDate: string;
    wasDiy: boolean | undefined;
  }[];
}

export interface TroubleshootingSessionContext {
  sessionId: string;
  symptom: string;
  guideName: string;
  systemCategory: string | undefined;
  pathSummary: {
    nodeKey: string;
    title: string;
    nodeType: string;
    selectedOption: string | undefined;
  }[];
  currentNode: {
    nodeKey: string;
    title: string;
    nodeType: string;
    content: string | undefined;
    severity: string | undefined;
    recommendedAction: string | undefined;
    shouldCallPro: boolean | undefined;
  } | null;
  outcome: string | undefined;
}

// ============================================================
// HOME CONTEXT
// ============================================================

export async function buildHomeContext(
  ctx: QueryCtx,
  homeId: Id<"homes">
): Promise<HomeContext> {
  const home = await ctx.db.get(homeId);
  if (!home) throw new Error("Home not found");

  // Fetch all active systems for this home
  const systems = await ctx.db
    .query("systems")
    .withIndex("by_home_active", (q) =>
      q.eq("homeId", homeId).eq("isArchived", false)
    )
    .collect();

  const systemSummaries: SystemSummary[] = [];

  for (const system of systems) {
    const systemType = await ctx.db.get(system.systemTypeId);
    if (!systemType) continue;

    const age = calculateAge(system.installDate, home.yearBuilt);
    const shape = systemType.weibullShape;
    const scale = systemType.weibullScale;
    const remaining = expectedRemainingLife(age, shape, scale);
    const prob1yr = conditionalFailureProbability(age, 1, shape, scale);
    const prob3yr = conditionalFailureProbability(age, 3, shape, scale);

    systemSummaries.push({
      id: system._id,
      name: system.name || systemType.name,
      category: systemType.category,
      manufacturer: system.manufacturer ?? null,
      modelNumber: system.modelNumber ?? null,
      installDate: system.installDate ?? null,
      age: Math.round(age * 10) / 10,
      healthScore: system.healthScore,
      expectedLifespan: systemType.defaultLifespanYears,
      remainingLife: Math.round(remaining * 10) / 10,
      failureProbability1yr: Math.round(prob1yr * 10) / 10,
      failureProbability3yr: Math.round(prob3yr * 10) / 10,
      estimatedReplacementCost: systemType.defaultReplacementCostMid,
      needsAttention: system.needsAttention,
      lastServiceDate: system.lastServiceDate ?? null,
      conditionNotes: system.conditionNotes ?? null,
    });
  }

  return {
    home: {
      name: home.name ?? null,
      address: home.addressLine1,
      city: home.city,
      state: home.state,
      zipCode: home.zipCode,
      yearBuilt: home.yearBuilt ?? null,
      squareFootage: home.squareFootage ?? null,
      climateZone: home.climateZone ?? null,
      waterHardness: home.waterHardness ?? null,
      overallHealthScore: home.overallHealthScore,
    },
    systems: systemSummaries,
  };
}

// ============================================================
// FORECAST CONTEXT — For a specific system
// ============================================================

export async function buildForecastContext(
  ctx: QueryCtx,
  systemId: Id<"systems">
): Promise<ForecastContext | null> {
  const system = await ctx.db.get(systemId);
  if (!system) return null;

  const home = await ctx.db.get(system.homeId);
  if (!home) return null;

  const systemType = await ctx.db.get(system.systemTypeId);
  if (!systemType) return null;

  const age = calculateAge(system.installDate, home.yearBuilt);
  const shape = systemType.weibullShape;
  const scale = systemType.weibullScale;

  const survival = weibullSurvival(age, shape, scale);
  const prob1yr = conditionalFailureProbability(age, 1, shape, scale);
  const prob3yr = conditionalFailureProbability(age, 3, shape, scale);
  const prob5yr = conditionalFailureProbability(age, 5, shape, scale);
  const remaining = expectedRemainingLife(age, shape, scale);

  return {
    systemName: system.name || systemType.name,
    category: systemType.category,
    currentAge: Math.round(age * 10) / 10,
    weibullShape: shape,
    weibullScale: scale,
    defaultLifespan: systemType.defaultLifespanYears,
    currentFailureProbability: Math.round((1 - survival) * 100 * 10) / 10,
    probabilityIn1Year: Math.round(prob1yr * 10) / 10,
    probabilityIn3Years: Math.round(prob3yr * 10) / 10,
    probabilityIn5Years: Math.round(prob5yr * 10) / 10,
    estimatedReplacementCostLow: systemType.defaultReplacementCostLow,
    estimatedReplacementCostMid: systemType.defaultReplacementCostMid,
    estimatedReplacementCostHigh: systemType.defaultReplacementCostHigh,
    expectedRemainingLife: Math.round(remaining * 10) / 10,
    healthScore: system.healthScore,
  };
}

// ============================================================
// DOCUMENT CONTEXT — Documents/photos for a home or system
// ============================================================

export async function buildDocumentContext(
  ctx: QueryCtx,
  homeId: Id<"homes">,
  systemId?: Id<"systems">
): Promise<DocumentContext> {
  // Query service documents for this home
  let docs: Doc<"serviceDocuments">[];
  if (systemId) {
    docs = await ctx.db
      .query("serviceDocuments")
      .withIndex("by_system", (q) => q.eq("systemId", systemId))
      .collect();
  } else {
    docs = await ctx.db
      .query("serviceDocuments")
      .withIndex("by_home", (q) => q.eq("homeId", homeId))
      .collect();
  }

  const hasReceipts = docs.some(
    (d) => d.documentType === "invoice" || d.documentType === "receipt"
  );
  const hasWarrantyDocs = docs.some((d) => d.documentType === "warranty");
  const hasConditionPhotos = docs.some(
    (d) => d.mimeType?.startsWith("image/") && d.documentType !== "model_plate"
  );
  const hasManuals = docs.some((d) => d.documentType === "manual");

  const missingRecommendations: string[] = [];
  if (!hasReceipts) {
    missingRecommendations.push(
      "Upload a purchase receipt or invoice to track exact age and service history"
    );
  }
  if (!hasWarrantyDocs) {
    missingRecommendations.push(
      "Upload your warranty document for expiration tracking"
    );
  }
  if (!hasConditionPhotos) {
    missingRecommendations.push(
      "Upload a current photo for AI condition assessment"
    );
  }
  if (!hasManuals) {
    missingRecommendations.push(
      "Upload the owner's manual for maintenance schedule reference"
    );
  }

  // Also pull Smart Vault documents for richer context
  let vaultDocs: any[] = [];
  try {
    if (systemId) {
      vaultDocs = await ctx.db
        .query("vaultDocuments")
        .withIndex("by_system", (q) => q.eq("linkedSystemId", systemId))
        .collect();
    } else {
      vaultDocs = await ctx.db
        .query("vaultDocuments")
        .withIndex("by_home", (q) => q.eq("homeId", homeId))
        .collect();
    }
  } catch {
    // Vault tables may not exist in all environments
  }

  return {
    hasReceipts: hasReceipts || vaultDocs.some((d: any) => d.docType === "receipt" || d.docType === "invoice"),
    hasWarrantyDocs: hasWarrantyDocs || vaultDocs.some((d: any) => d.docType === "warranty"),
    hasConditionPhotos: hasConditionPhotos || vaultDocs.some((d: any) => d.docType === "photo"),
    hasManuals: hasManuals || vaultDocs.some((d: any) => d.docType === "manual"),
    documentCount: docs.length + vaultDocs.length,
    documents: [
      ...docs.map((d) => ({
        type: d.documentType,
        fileName: d.fileName,
        vendor: d.extractedData?.vendor ?? null,
        date: d.extractedData?.date ?? null,
        totalAmount: d.extractedData?.totalAmount ?? null,
      })),
      ...vaultDocs
        .filter((d: any) => d.parseStatus === "completed" && d.extractedFields)
        .map((d: any) => ({
          type: d.docType as string,
          fileName: d.title || d.fileName,
          vendor: d.extractedFields?.vendor ?? null,
          date: d.extractedFields?.date ?? null,
          totalAmount: d.extractedFields?.totalAmount ?? null,
        })),
    ],
    missingRecommendations,
  };
}

// ============================================================
// MAINTENANCE CONTEXT — Upcoming/overdue tasks for the home
// ============================================================

export async function buildMaintenanceContext(
  ctx: QueryCtx,
  homeId: Id<"homes">
): Promise<MaintenanceContext> {
  // Fetch tasks for this home
  const tasks = await ctx.db
    .query("scheduledMaintenance")
    .withIndex("by_home", (q) => q.eq("homeId", homeId))
    .collect();

  const now = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const overdueTasks = [];
  const upcomingTasks = [];
  const recentlyCompleted = [];

  for (const task of tasks) {
    // Get system name if linked
    let systemName: string | null = null;
    if (task.systemId) {
      const system = await ctx.db.get(task.systemId);
      if (system) {
        const systemType = await ctx.db.get(system.systemTypeId);
        systemName = system.name || systemType?.name || null;
      }
    }

    if (task.status === "overdue") {
      overdueTasks.push({
        id: task._id,
        name: task.name,
        dueDate: task.dueDate,
        priority: task.priority,
        category: task.category,
        systemName,
      });
    } else if (
      task.status === "upcoming" ||
      task.status === "due"
    ) {
      upcomingTasks.push({
        id: task._id,
        name: task.name,
        dueDate: task.dueDate,
        priority: task.priority,
        category: task.category,
        systemName,
      });
    } else if (task.status === "completed" && task.completedDate) {
      // Only include completions from the last 90 days
      const completedDate = new Date(task.completedDate);
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      if (completedDate >= ninetyDaysAgo) {
        recentlyCompleted.push({
          id: task._id,
          name: task.name,
          completedDate: task.completedDate,
          wasDiy: task.wasDiy,
        });
      }
    }
  }

  // Sort by due date
  overdueTasks.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  upcomingTasks.sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  return {
    overdueTasks: overdueTasks.slice(0, 10),
    upcomingTasks: upcomingTasks.slice(0, 10),
    recentlyCompleted: recentlyCompleted.slice(0, 10),
  };
}

// ============================================================
// TROUBLESHOOTING SESSION CONTEXT — For advisor escalation
// ============================================================

export async function buildTroubleshootingSessionContext(
  ctx: QueryCtx,
  sessionId: Id<"troubleshootingSessions">
): Promise<TroubleshootingSessionContext | null> {
  const session = await ctx.db.get(sessionId);
  if (!session) return null;

  const tree = await ctx.db.get(session.diagnosticTreeId);
  if (!tree) return null;

  // Fetch all nodes for this tree
  const nodes = await ctx.db
    .query("diagnosticNodes")
    .withIndex("by_tree", (q) => q.eq("treeId", tree._id))
    .collect();

  // Build path summary
  const pathSummary = session.nodesVisited.map((visit) => {
    const node = nodes.find((n) => n.nodeKey === visit.nodeKey);
    return {
      nodeKey: visit.nodeKey,
      title: node?.title ?? visit.nodeKey,
      nodeType: node?.nodeType ?? "unknown",
      selectedOption: visit.selectedOption,
    };
  });

  // Get current (last) node
  const lastVisit =
    session.nodesVisited[session.nodesVisited.length - 1];
  const currentNode = lastVisit
    ? nodes.find((n) => n.nodeKey === lastVisit.nodeKey)
    : null;

  return {
    sessionId: session._id,
    symptom: tree.entrySymptom,
    guideName: tree.title,
    systemCategory: tree.systemCategory,
    pathSummary,
    currentNode: currentNode
      ? {
          nodeKey: currentNode.nodeKey,
          title: currentNode.title,
          nodeType: currentNode.nodeType,
          content: currentNode.contentMarkdown,
          severity: currentNode.severity,
          recommendedAction: currentNode.recommendedAction,
          shouldCallPro: currentNode.shouldCallPro,
        }
      : null,
    outcome: session.outcome,
  };
}

// ============================================================
// KNOWLEDGE CONTEXT — Component templates, climate modifiers
// ============================================================

export interface KnowledgeContext {
  systemName: string;
  category: string;
  /** Component templates matching this system's category */
  components: {
    name: string;
    description: string;
    medianLifespan: number;
    commonBrands: string[];
    replacementCostRange: { low: number; mid: number; high: number };
    regionalAdjustments: Record<string, { multiplier: number; reason: string }>;
    criticality: string;
    warrantyInfo?: { partsYears: number; laborYears: number; notes: string };
  }[];
  /** Climate modifiers for this home's zone and system category */
  climateModifier?: {
    zoneName: string;
    factors: string[];
    impactDescription: string;
    lifespanModifierPercent: number;
    adjustedLifespanMedian: number;
    maintenanceAdjustments: { task: string; adjustedMonths: number; rationale: string }[];
    additionalTasks: { task: string; frequency: string; rationale: string }[];
    guidelines: string[];
  };
}

export async function buildKnowledgeContext(
  ctx: QueryCtx,
  systemId: Id<"systems">
): Promise<KnowledgeContext | null> {
  const system = await ctx.db.get(systemId);
  if (!system) return null;

  const home = await ctx.db.get(system.homeId);
  if (!home) return null;

  const systemType = await ctx.db.get(system.systemTypeId);
  if (!systemType) return null;

  // Fetch component templates for this system's category
  const componentTemplates = await ctx.db
    .query("componentTemplates")
    .withIndex("by_system", (q) => q.eq("systemCategory", systemType.category))
    .collect();

  const components = componentTemplates.slice(0, 8).map((ct) => ({
    name: ct.name,
    description: ct.description,
    medianLifespan: ct.weibull.medianLifespan,
    commonBrands: ct.commonBrands.slice(0, 5),
    replacementCostRange: {
      low: ct.costRange.replacementLow,
      mid: ct.costRange.replacementMedian,
      high: ct.costRange.replacementHigh,
    },
    regionalAdjustments: {
      hotHumid: { multiplier: ct.regionalAdjustments.hotHumid.scaleMultiplier, reason: ct.regionalAdjustments.hotHumid.reason },
      hotDry: { multiplier: ct.regionalAdjustments.hotDry.scaleMultiplier, reason: ct.regionalAdjustments.hotDry.reason },
      coldHarsh: { multiplier: ct.regionalAdjustments.coldHarsh.scaleMultiplier, reason: ct.regionalAdjustments.coldHarsh.reason },
      marine: { multiplier: ct.regionalAdjustments.marine.scaleMultiplier, reason: ct.regionalAdjustments.marine.reason },
    },
    criticality: ct.criticality,
    warrantyInfo: ct.warrantyCoverage
      ? { partsYears: ct.warrantyCoverage.typicalPartsYears, laborYears: ct.warrantyCoverage.typicalLaborYears, notes: ct.warrantyCoverage.notes }
      : undefined,
  }));

  // Fetch climate modifier for this zone + system type
  let climateModifier: KnowledgeContext["climateModifier"] = undefined;

  // Map home climate zone to a climate zone ID
  const climateZoneId = mapClimateZoneToId(home.climateZone ?? undefined, home.state);
  if (climateZoneId) {
    const modifiers = await ctx.db
      .query("climateModifiers")
      .withIndex("by_zone", (q) => q.eq("climateZoneId", climateZoneId))
      .collect();

    // Find one matching this system type (by systemTypeId)
    const match = modifiers.find((m) => m.systemTypeId === system.systemTypeId);
    if (match) {
      climateModifier = {
        zoneName: match.climateZoneName,
        factors: match.climateFactors,
        impactDescription: match.impactDescription,
        lifespanModifierPercent: match.lifespanModifierPercent,
        adjustedLifespanMedian: match.adjustedLifespanMedian,
        maintenanceAdjustments: (match.maintenanceAdjustments ?? []).map((a) => ({
          task: a.taskName,
          adjustedMonths: a.adjustedFrequencyMonths,
          rationale: a.rationale,
        })),
        additionalTasks: (match.additionalTasks ?? []).map((t) => ({
          task: t.taskName,
          frequency: t.frequency,
          rationale: t.rationale,
        })),
        guidelines: match.additionalGuidelines ?? [],
      };
    }
  }

  return {
    systemName: system.name || systemType.name,
    category: systemType.category,
    components,
    climateModifier,
  };
}

/**
 * Map a numeric IECC climate zone + state to our climate modifier zone IDs.
 * Falls back to state-based heuristic.
 */
function mapClimateZoneToId(
  climateZone: number | undefined,
  state: string
): string | null {
  // State-based mapping (covers the most common cases)
  const stateToZone: Record<string, string> = {
    FL: "gulf_coast_subtropical",
    LA: "gulf_coast_subtropical",
    AL: "deep_south_piedmont",
    MS: "deep_south_piedmont",
    GA: "deep_south_piedmont",
    SC: "deep_south_piedmont",
    TX: "gulf_coast_subtropical",
    MA: "coastal_northeast",
    CT: "coastal_northeast",
    RI: "coastal_northeast",
    NJ: "mid_atlantic_temperate",
    NY: "coastal_northeast",
    ME: "coastal_northeast",
    NH: "coastal_northeast",
    MN: "upper_midwest_great_lakes",
    WI: "upper_midwest_great_lakes",
    MI: "upper_midwest_great_lakes",
    OH: "upper_midwest_great_lakes",
    IN: "upper_midwest_great_lakes",
    IL: "upper_midwest_great_lakes",
    IA: "upper_midwest_great_lakes",
    ND: "upper_midwest_great_lakes",
    SD: "upper_midwest_great_lakes",
    AZ: "desert_southwest",
    NV: "desert_southwest",
    NM: "desert_southwest",
    OR: "pacific_northwest",
    WA: "pacific_northwest",
    CO: "mountain_west",
    UT: "mountain_west",
    ID: "mountain_west",
    MT: "mountain_west",
    WY: "mountain_west",
    VA: "mid_atlantic_temperate",
    MD: "mid_atlantic_temperate",
    PA: "mid_atlantic_temperate",
    DE: "mid_atlantic_temperate",
    NC: "deep_south_piedmont",
  };

  return stateToZone[state] ?? null;
}

// ============================================================
// CONVERSATION HISTORY — For multi-turn chat context
// ============================================================

export async function buildConversationHistory(
  ctx: QueryCtx,
  conversationId: Id<"conversations">,
  maxMessages: number = 20
): Promise<{ role: "user" | "assistant"; content: string }[]> {
  const msgs = await ctx.db
    .query("aiMessages")
    .withIndex("by_conversation", (q) =>
      q.eq("conversationId", conversationId)
    )
    .order("asc")
    .collect();

  // Filter to user and assistant messages only (skip system injections)
  // Take the last maxMessages to stay within token limits
  return msgs
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(-maxMessages)
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
}
