import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// === VALIDATORS (reused across schema and functions) ===

export const userTier = v.union(
  v.literal("free"),
  v.literal("homeowner"),
  v.literal("premium"),
  // Deprecated — kept for backward compatibility with existing documents
  v.literal("homeowner_pro"),
  v.literal("pro_plus"),
  v.literal("property_manager"),
  v.literal("managed_homeowner"),
  v.literal("tenant")
);

// === PORTFOLIO / PROPERTY MANAGER VALIDATORS ===

export const portfolioSubscriptionStatus = v.union(
  v.literal("active"),
  v.literal("past_due"),
  v.literal("canceled"),
  v.literal("trialing")
);

export const portfolioPlan = v.union(
  v.literal("starter"),
  v.literal("professional"),
  v.literal("enterprise")
);

export const portfolioMemberRole = v.union(
  v.literal("owner_admin"),
  v.literal("admin"),
  v.literal("staff"),
  v.literal("viewer")
);

export const unitStatus = v.union(
  v.literal("vacant"),
  v.literal("pending_invite"),
  v.literal("owner_active"),
  v.literal("owner_inactive")
);

export const propertyType = v.union(
  v.literal("single_family"),
  v.literal("multi_family"),
  v.literal("condo"),
  v.literal("townhouse"),
  v.literal("apartment"),
  v.literal("commercial"),
  v.literal("mixed_use")
);

export const workOrderStatus = v.union(
  v.literal("draft"),
  v.literal("submitted"),
  v.literal("triaged"),
  v.literal("open"),
  v.literal("assigned"),
  v.literal("scheduled"),
  v.literal("in_progress"),
  v.literal("pending_review"),
  v.literal("completed"),
  v.literal("verified"),
  v.literal("cancelled"),
  v.literal("on_hold")
);

export const workOrderCategory = v.union(
  v.literal("repair"),
  v.literal("maintenance"),
  v.literal("emergency"),
  v.literal("inspection"),
  v.literal("improvement")
);

export const noticeType = v.union(
  v.literal("general"),
  v.literal("maintenance"),
  v.literal("emergency"),
  v.literal("policy"),
  v.literal("event")
);

export const noticeTargetType = v.union(
  v.literal("all"),
  v.literal("property_group"),
  v.literal("property"),
  v.literal("individual")
);

export const deliveryChannel = v.union(
  v.literal("in_app"),
  v.literal("email"),
  v.literal("sms")
);

export const serviceRequestCategory = v.union(
  v.literal("repair"),
  v.literal("maintenance"),
  v.literal("emergency"),
  v.literal("question"),
  v.literal("plumbing"),
  v.literal("hvac"),
  v.literal("electrical"),
  v.literal("appliance"),
  v.literal("structural"),
  v.literal("other")
);

export const serviceRequestPriority = v.union(
  v.literal("urgent"),
  v.literal("high"),
  v.literal("medium"),
  v.literal("low")
);

export const serviceRequestStatus = v.union(
  v.literal("submitted"),
  v.literal("triaged"),
  v.literal("acknowledged"),
  v.literal("in_progress"),
  v.literal("scheduled"),
  v.literal("resolved"),
  v.literal("closed")
);

export const serviceLinkType = v.union(
  v.literal("permanent"),
  v.literal("lease"),
  v.literal("one_time")
);

export const responsibilityScope = v.union(
  v.literal("all_properties"),
  v.literal("property_group"),
  v.literal("single_property")
);

export const responsibleParty = v.union(
  v.literal("owner"),
  v.literal("manager"),
  v.literal("shared")
);

export const managedRole = v.union(
  v.literal("homeowner"),
  v.literal("tenant")
);

export const systemCategory = v.union(
  v.literal("hvac"),
  v.literal("plumbing"),
  v.literal("electrical"),
  v.literal("appliances"),
  v.literal("structural"),
  v.literal("exterior")
);

export const maintenancePriority = v.union(
  v.literal("critical"),
  v.literal("high"),
  v.literal("medium"),
  v.literal("low"),
  v.literal("routine")
);

export const maintenanceStatus = v.union(
  v.literal("upcoming"),
  v.literal("due"),
  v.literal("overdue"),
  v.literal("completed"),
  v.literal("skipped"),
  v.literal("snoozed")
);

export const healthPointsSource = v.union(
  v.literal("task_completed"),
  v.literal("task_on_time_bonus"),
  v.literal("system_health_improvement"),
  v.literal("upgrade_documented"),
  v.literal("inspection_logged")
);

export const healthBundleKey = v.union(
  v.literal("bronze"),
  v.literal("silver"),
  v.literal("gold"),
  v.literal("platinum")
);

export const healthPointsRewardType = v.union(
  v.literal("badge"),
  v.literal("perk"),
  v.literal("reporting"),
  v.literal("discount")
);

// === NEW HP GAMIFICATION VALIDATORS ===

export const hpTier = v.union(
  v.literal("aware"),
  v.literal("stable"),
  v.literal("protected"),
  v.literal("optimized"),
  v.literal("exemplary")
);

export const hpEventType = v.union(
  v.literal("earn"),
  v.literal("decay"),
  v.literal("bonus"),
  v.literal("tier_change")
);

export const hpEarnReason = v.union(
  v.literal("system_added"),
  v.literal("maintenance_logged"),
  v.literal("diagnostic_completed"),
  v.literal("document_uploaded"),
  v.literal("budget_goal_set"),
  v.literal("budget_funded"),
  v.literal("system_replaced"),
  v.literal("campaign_item_completed"),
  v.literal("campaign_completed"),
  v.literal("on_time_bonus"),
  v.literal("streak_bonus")
);

export const hpDecayReason = v.union(
  v.literal("aging_decay"),
  v.literal("maintenance_lapse"),
  v.literal("monthly_decay")
);

export const campaignType = v.union(
  v.literal("spring"),
  v.literal("summer"),
  v.literal("fall"),
  v.literal("winter")
);

export const locationFloor = v.union(
  v.literal("basement"),
  v.literal("first"),
  v.literal("second"),
  v.literal("third"),
  v.literal("attic"),
  v.literal("exterior")
);

export const failureMode = v.union(
  v.literal("catastrophic"),
  v.literal("progressive"),
  v.literal("minor"),
  v.literal("non_damaging")
);

export const constructionType = v.union(
  v.literal("slab"),
  v.literal("crawlspace"),
  v.literal("basement")
);

export const mitigationType = v.union(
  v.literal("leak_sensor"),
  v.literal("auto_shutoff"),
  v.literal("whole_home_monitor"),
  v.literal("drain_pan_float"),
  v.literal("other")
);

export const weatherAdvisoryType = v.union(
  v.literal("freeze"),
  v.literal("heat"),
  v.literal("storm"),
  v.literal("wind"),
  v.literal("hurricane")
);

export const weatherAdvisorySeverity = v.union(
  v.literal("advisory"),
  v.literal("watch"),
  v.literal("warning")
);

export const notificationChannel = v.union(
  v.literal("email"),
  v.literal("sms")
);

// Knowledge base validators
export const knowledgeArticleType = v.union(
  v.literal("guide"),           // Step-by-step how-to
  v.literal("diagnostic"),      // Troubleshooting decision tree
  v.literal("explainer"),       // "How X works" deep dive
  v.literal("checklist"),       // Seasonal/periodic checklist
  v.literal("comparison"),      // Product/approach comparison
  v.literal("safety"),          // Safety warnings and procedures
  v.literal("glossary")         // Term definitions
);

export const knowledgeContentStatus = v.union(
  v.literal("draft"),
  v.literal("published"),
  v.literal("archived"),
  v.literal("needs_review")
);

export const diagnosticNodeType = v.union(
  v.literal("question"),        // Yes/No or multiple choice
  v.literal("observation"),     // Check this symptom
  v.literal("action"),          // Do this step
  v.literal("result"),          // Diagnosis conclusion
  v.literal("referral"),        // Call a pro
  v.literal("care-task-link")   // Links to a maintenance care task
);

// Model intelligence validators
export const modelIssueType = v.union(
  v.literal("common_failure"),    // Known failure point
  v.literal("recall"),            // Manufacturer recall
  v.literal("service_bulletin"),  // Service advisory
  v.literal("known_defect"),      // Design/manufacturing defect
  v.literal("maintenance_tip"),   // Model-specific maintenance
  v.literal("parts_info"),        // Parts/compatibility info
  v.literal("efficiency_tip")     // Model-specific efficiency advice
);

export const modelIssueSeverity = v.union(
  v.literal("info"),
  v.literal("warning"),
  v.literal("critical"),
  v.literal("recall")
);


// Service Call Companion validators
export const productTier = v.union(
  v.literal("economy"),
  v.literal("standard"),
  v.literal("premium"),
  v.literal("luxury")
);

export const serviceCallStatus = v.union(
  v.literal("planning"),
  v.literal("scheduled"),
  v.literal("in_progress"),
  v.literal("completed"),
  v.literal("follow_up")
);

export const serviceType = v.union(
  v.literal("repair"),
  v.literal("maintenance"),
  v.literal("replacement"),
  v.literal("inspection"),
  v.literal("quote")
);

export const questionCategory = v.union(
  v.literal("qualification"),
  v.literal("diagnosis"),
  v.literal("options"),
  v.literal("pricing"),
  v.literal("warranty")
);

export const serviceDocumentType = v.union(
  v.literal("invoice"),
  v.literal("quote"),
  v.literal("warranty"),
  v.literal("model_plate"),
  v.literal("manual"),
  v.literal("receipt"),
  v.literal("other")
);

// === VAULT VALIDATORS ===

export const vaultDocType = v.union(
  v.literal("warranty"),
  v.literal("invoice"),
  v.literal("receipt"),
  v.literal("manual"),
  v.literal("inspection_report"),
  v.literal("permit"),
  v.literal("insurance"),
  v.literal("maintenance_record"),
  v.literal("photo"),
  v.literal("other")
);

export const vaultParseStatus = v.union(
  v.literal("pending"),
  v.literal("processing"),
  v.literal("completed"),
  v.literal("failed")
);

export const vaultAlertType = v.union(
  v.literal("warranty_expiring"),
  v.literal("policy_renewal"),
  v.literal("service_due"),
  v.literal("permit_expiring")
);

export const vaultAlertSeverity = v.union(
  v.literal("info"),
  v.literal("warning"),
  v.literal("critical")
);

export const vaultAlertStatus = v.union(
  v.literal("active"),
  v.literal("dismissed"),
  v.literal("resolved")
);

export const replacementChoice = v.union(
  v.literal("one_to_one"),
  v.literal("upgrade")
);

// Home personalization validators
export const occupancyType = v.union(
  v.literal("primary"),
  v.literal("rental"),
  v.literal("vacation"),
  v.literal("investment")
);

export const plumbingMaterial = v.union(
  v.literal("copper"),
  v.literal("pex"),
  v.literal("galvanized"),
  v.literal("cpvc"),
  v.literal("unknown")
);

export const drainMaterial = v.union(
  v.literal("pvc"),
  v.literal("abs"),
  v.literal("cast_iron"),
  v.literal("unknown")
);

export const roofMaterial = v.union(
  v.literal("asphalt_shingle"),
  v.literal("metal"),
  v.literal("tile"),
  v.literal("slate"),
  v.literal("wood_shake"),
  v.literal("flat_membrane"),
  v.literal("unknown")
);

// Forecast snapshot validators
export const snapshotTriggerType = v.union(
  v.literal("data_added"),
  v.literal("invoice_added"),
  v.literal("system_changed"),
  v.literal("manual")
);

// Incident validators
export const incidentUrgency = v.union(
  v.literal("monitor"),
  v.literal("schedule"),
  v.literal("urgent")
);

export const incidentStatus = v.union(
  v.literal("open"),
  v.literal("packet_created"),
  v.literal("service_scheduled"),
  v.literal("resolved"),
  v.literal("closed")
);

export const recommendedAction = v.union(
  v.literal("diy"),
  v.literal("monitor"),
  v.literal("call_pro")
);

// Quote status validator
export const quoteStatus = v.union(
  v.literal("pending"),
  v.literal("accepted"),
  v.literal("declined"),
  v.literal("expired")
);


// Service line item category
export const lineItemCategory = v.union(
  v.literal("labor"),
  v.literal("parts"),
  v.literal("materials"),
  v.literal("diagnostic"),
  v.literal("permit"),
  v.literal("other")
);

// === SCHEMA ===

export default defineSchema({
  // Convex Auth tables (users, sessions, etc.)
  ...authTables,

  // Backward-compatible users shape (auth + legacy app fields)
  users: defineTable({
    // Convex Auth fields
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),

    // Legacy/user-app fields still present in existing documents
    tokenIdentifier: v.optional(v.string()),
    fullName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    tier: v.optional(userTier),
    healthPoints: v.optional(v.number()),
    streakDays: v.optional(v.number()),
    lastActiveAt: v.optional(v.number()),
  })
    .index("email", ["email"]),

  // --- USER PROFILE (extends auth user) ---
  userProfiles: defineTable({
    userId: v.id("users"),
    email: v.string(),
    fullName: v.optional(v.string()),
    phone: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    tier: userTier,
    maxHomes: v.number(),
    onboardingCompletedAt: v.optional(v.number()), // timestamp
    referralCode: v.string(),
    referredByCode: v.optional(v.string()),
    isFoundingMember: v.optional(v.boolean()),
    foundingMemberSince: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_email", ["email"])
    .index("by_referralCode", ["referralCode"])
    .index("by_tier", ["tier"]),

  // --- SUBSCRIPTIONS (Stripe billing) ---
  subscriptions: defineTable({
    userId: v.id("users"),
    profileId: v.id("userProfiles"),
    tier: userTier,
    status: v.union(
      v.literal("active"),
      v.literal("past_due"),
      v.literal("canceled"),
      v.literal("trialing"),
      v.literal("incomplete")
    ),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.optional(v.string()),
    billingPeriod: v.union(v.literal("monthly"), v.literal("yearly")),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.boolean(),
    trialEnd: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_stripeCustomerId", ["stripeCustomerId"])
    .index("by_stripeSubscriptionId", ["stripeSubscriptionId"]),

  // --- WAITLIST ---
  waitlist: defineTable({
    email: v.string(),
    firstName: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    tier: v.union(
      v.literal("free"),
      v.literal("founding_member"),
      v.literal("founding_member_intent")
    ),
    stripePaymentId: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    amountPaid: v.optional(v.number()),
    paymentStatus: v.optional(v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("refunded")
    )),
    position: v.number(),
    emailOptIn: v.boolean(),
    referredBy: v.optional(v.string()),
    referralCode: v.string(),
    referralCount: v.number(),
    source: v.optional(v.string()),
    utmSource: v.optional(v.string()),
    utmMedium: v.optional(v.string()),
    utmCampaign: v.optional(v.string()),
    convertedToUser: v.boolean(),
    userId: v.optional(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_tier", ["tier"])
    .index("by_referralCode", ["referralCode"])
    .index("by_position", ["position"]),

  // --- HOMES ---
  homes: defineTable({
    ownerId: v.id("userProfiles"),
    name: v.optional(v.string()),
    addressLine1: v.string(),
    addressLine2: v.optional(v.string()),
    city: v.string(),
    state: v.string(),
    zipCode: v.string(),
    yearBuilt: v.optional(v.number()),
    squareFootage: v.optional(v.number()),
    climateZone: v.optional(v.number()),
    climateZoneId: v.optional(v.string()), // e.g. "gulf_coast_subtropical" — links to climateModifiers
    waterHardness: v.optional(v.string()),
    homeValue: v.optional(v.number()),
    stories: v.optional(v.number()),
    constructionType: v.optional(constructionType),
    weatherLatitude: v.optional(v.number()),
    weatherLongitude: v.optional(v.number()),
    weatherLocationLabel: v.optional(v.string()),
    overallHealthScore: v.number(), // 0-100
    systemsCount: v.number(),
    isArchived: v.boolean(),
    // Personalization fields for forecast confidence
    occupancyType: v.optional(occupancyType),
    numberOfStories: v.optional(v.number()),
    hasBasement: v.optional(v.boolean()),
    basementFinished: v.optional(v.boolean()),
    roofMaterialType: v.optional(roofMaterial),
    roofAgeYears: v.optional(v.number()),
    plumbingSupplyMaterial: v.optional(plumbingMaterial),
    drainMaterialType: v.optional(drainMaterial),
    lastPersonalizationUpdate: v.optional(v.number()), // timestamp
    // Portfolio manager fields
    propertyGroup: v.optional(v.string()),
    propertyType: v.optional(v.string()),
    // STR (short-term rental) fields
    hoaStatus: v.optional(v.union(
      v.literal("hoa"),
      v.literal("coa"),
      v.literal("both"),
      v.literal("none")
    )),
    hoaMonthlyFee: v.optional(v.number()),
    strPlatforms: v.optional(v.array(v.string())),
    typicalOccupancyPercent: v.optional(v.number()),
    peakSeasonMonths: v.optional(v.array(v.number())),
    maxGuests: v.optional(v.number()),
    bedrooms: v.optional(v.number()),
    amenities: v.optional(v.array(v.string())),
    cleaningTeamContact: v.optional(v.string()),
    strListingUrl: v.optional(v.string()),
  })
    .index("by_owner", ["ownerId"])
    .index("by_owner_active", ["ownerId", "isArchived"]),

  // --- SYSTEM TYPES (reference data â€” 45 rows, seeded once) ---
  systemTypes: defineTable({
    category: systemCategory,
    key: v.optional(v.string()),
    name: v.string(),
    description: v.optional(v.string()),
    iconName: v.optional(v.string()),
    defaultLifespanYears: v.number(),
    weibullShape: v.number(), // typically 1.5-4.0
    weibullScale: v.number(), // typically lifespan * 1.1
    weibullLocation: v.optional(v.number()),
    defaultReplacementCostLow: v.number(),
    defaultReplacementCostMid: v.number(),
    defaultReplacementCostHigh: v.number(),
    maintenanceImpactFactor: v.optional(v.number()), // 0.8-1.2
    sortOrder: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  })
    .index("by_category", ["category"])
    .index("by_active", ["isActive"]),

  // --- SYSTEMS (installed in homes) ---
  systems: defineTable({
    homeId: v.id("homes"),
    systemTypeId: v.id("systemTypes"),
    name: v.optional(v.string()),
    locationInHome: v.optional(v.string()),
    locationFloor: v.optional(locationFloor),
    locationRoom: v.optional(v.string()),
    manufacturer: v.optional(v.string()),
    modelNumber: v.optional(v.string()),
    serialNumber: v.optional(v.string()),
    installDate: v.optional(v.string()), // ISO date string "2020-06-15"
    purchaseDate: v.optional(v.string()),
    warrantyExpiry: v.optional(v.string()),
    healthScore: v.number(), // 0-100
    remainingLifePercent: v.optional(v.number()),
    estimatedReplacementYear: v.optional(v.number()),
    estimatedReplacementCost: v.optional(v.number()),
    needsAttention: v.boolean(),
    conditionNotes: v.optional(v.string()),
    lastServiceDate: v.optional(v.string()),
    failureMode: v.optional(failureMode),
    damagePotentialBase: v.optional(v.number()),
    isArchived: v.boolean(),
    commonAreaId: v.optional(v.id("commonAreas")),
  })
    .index("by_home", ["homeId"])
    .index("by_home_active", ["homeId", "isArchived"])
    .index("by_systemType", ["systemTypeId"])
    .index("by_needsAttention", ["needsAttention"]),

  // --- MAINTENANCE TASK TEMPLATES (reference data) ---
  maintenanceTaskTemplates: defineTable({
    systemTypeId: v.id("systemTypes"),
    name: v.string(),
    description: v.optional(v.string()),
    quickSkim: v.optional(v.array(v.string())),
    frequencyMonths: v.number(),
    priority: maintenancePriority,
    difficulty: v.union(
      v.literal("easy"),
      v.literal("moderate"),
      v.literal("hard"),
      v.literal("pro_only")
    ),
    estimatedTimeMinutes: v.optional(v.number()),
    diyCostLow: v.optional(v.number()),
    diyCostHigh: v.optional(v.number()),
    proCostLow: v.optional(v.number()),
    proCostHigh: v.optional(v.number()),
    diySteps: v.optional(v.array(v.string())),
    commonMistakes: v.optional(v.array(v.string())),
    whenToCallPro: v.optional(v.array(v.string())),
    healthImpactIfSkipped: v.optional(v.number()),
    
    // === NEW: Seasonality ===
    seasonPreference: v.optional(v.union(
      v.literal("spring"),
      v.literal("summer"),
      v.literal("fall"),
      v.literal("winter"),
      v.literal("any")
    )),
    optimalMonths: v.optional(v.array(v.number())), // [3,4,5] for spring
    
    // === NEW: Tools & Materials ===
    requiredTools: v.optional(v.array(v.string())),
    requiredMaterials: v.optional(v.array(v.object({
      name: v.string(),
      estimatedCost: v.optional(v.number()),
      purchaseUrl: v.optional(v.string()),
    }))),
    
    // === NEW: Safety ===
    safetyWarnings: v.optional(v.array(v.string())),
    safetyLevel: v.optional(v.union(
      v.literal("safe"),
      v.literal("caution"),
      v.literal("danger")
    )),
    
    // === NEW: Deep Dive Content ===
    deepDiveContent: v.optional(v.object({
      whyItMatters: v.string(),
      scienceBehind: v.optional(v.string()),
      failureModes: v.optional(v.array(v.string())),
      proTips: v.optional(v.array(v.string())),
      videoUrl: v.optional(v.string()),
      externalResources: v.optional(v.array(v.object({
        title: v.string(),
        url: v.string(),
      }))),
    })),
    
    // === NEW: Age-based urgency modifier ===
    urgencyByAge: v.optional(v.object({
      baseUrgency: v.number(), // 1.0 = normal
      increasePerYear: v.number(), // 0.05 = +5% per year
      maxMultiplier: v.number(), // 2.0 = caps at 2x
    })),
    
    // === Cross-system links ===
    relatedDiagnosticSlugs: v.optional(v.array(v.string())),
    relatedArticleSlugs: v.optional(v.array(v.string())),
  }).index("by_systemType", ["systemTypeId"]),

  // --- SCHEDULED MAINTENANCE (tasks for specific homes) ---
  scheduledMaintenance: defineTable({
    homeId: v.id("homes"),
    systemId: v.optional(v.id("systems")),
    templateId: v.optional(v.id("maintenanceTaskTemplates")),
    name: v.string(),
    description: v.optional(v.string()),
    dueDate: v.string(), // ISO date "2026-03-15"
    completedDate: v.optional(v.string()),
    status: maintenanceStatus,
    priority: maintenancePriority,
    isRecurring: v.boolean(),
    recurrenceMonths: v.optional(v.number()),
    diyCostLow: v.optional(v.number()),
    diyCostHigh: v.optional(v.number()),
    proCostLow: v.optional(v.number()),
    proCostHigh: v.optional(v.number()),
    costActual: v.optional(v.number()),
    wasDiy: v.optional(v.boolean()),
    snoozedUntil: v.optional(v.string()),
    snoozeCount: v.number(),
    category: v.optional(systemCategory),
    sourceArticleSlug: v.optional(v.string()),
    // Portfolio manager work order linking
    assignedTo: v.optional(v.string()),
    assignedAt: v.optional(v.number()),
    // STR fields
    turnoverId: v.optional(v.id("turnovers")),
    isAestheticCare: v.optional(v.boolean()),
    hoaManaged: v.optional(v.boolean()),
  })
    .index("by_home", ["homeId"])
    .index("by_home_status", ["homeId", "status"])
    .index("by_system", ["systemId"])
    .index("by_dueDate", ["dueDate"])
    .index("by_status", ["status"])
    .index("by_turnover", ["turnoverId"]),

  // --- FEATURE FLAGS (one doc per tier) ---
  featureFlags: defineTable({
    tier: userTier,
    maxHomes: v.number(),
    maxSystemsPerHome: v.number(),
    canViewDiyInstructions: v.boolean(),
    canViewCostBreakdown: v.boolean(),
    canViewForecast: v.boolean(),
    canViewHealthDrivers: v.boolean(),
    canScanModelPlates: v.boolean(),
    monthlyScanLimit: v.number(),
    canSharePackets: v.boolean(),
    monthlyPacketLimit: v.number(),
    canViewQuickSkim: v.boolean(),
    canExportReports: v.boolean(),
    hasPriorityNotifications: v.boolean(),
    hasWebDashboard: v.boolean(),
  }).index("by_tier", ["tier"]),

  // --- HOME PACKETS ---
  homePackets: defineTable({
    homeId: v.id("homes"),
    createdBy: v.id("userProfiles"),
    title: v.string(),
    symptom: v.optional(v.string()),
    systemTypeId: v.optional(v.id("systemTypes")), // Link to system type for questions
    packetData: v.any(), // JSON blob
    shareToken: v.optional(v.string()),
    isShared: v.boolean(),
    sharedAt: v.optional(v.number()),
    viewsCount: v.number(),
  })
    .index("by_home", ["homeId"])
    .index("by_shareToken", ["shareToken"]),

  // --- DOCUMENTS (uploaded files) ---
  documents: defineTable({
    homeId: v.id("homes"),
    systemId: v.optional(v.id("systems")),
    userId: v.id("userProfiles"),
    docType: v.union(
      v.literal("inspection_report"),
      v.literal("warranty"),
      v.literal("manual"),
      v.literal("invoice"),
      v.literal("permit"),
      v.literal("insurance"),
      v.literal("other")
    ),
    fileName: v.string(),
    storageId: v.id("_storage"), // Convex file storage
    fileSize: v.optional(v.number()),
    mimeType: v.optional(v.string()),
    parseStatus: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    parsedData: v.optional(v.any()),
  })
    .index("by_home", ["homeId"])
    .index("by_system", ["systemId"]),

  // --- MODEL PLATE SCANS ---
  modelPlateScans: defineTable({
    homeId: v.id("homes"),
    systemId: v.optional(v.id("systems")),
    userId: v.id("userProfiles"),
    imageStorageId: v.id("_storage"),
    parsedData: v.optional(v.any()), // { manufacturer, model, serial, year, ... }
    parseStatus: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    rawOcrText: v.optional(v.string()),
  })
    .index("by_home", ["homeId"])
    .index("by_user", ["userId"]),

  // --- ACTIVITY LOG ---
  activityLog: defineTable({
    userId: v.id("userProfiles"),
    homeId: v.optional(v.id("homes")),
    systemId: v.optional(v.id("systems")),
    taskId: v.optional(v.id("scheduledMaintenance")),
    action: v.union(
      v.literal("task_completed"),
      v.literal("task_overdue"),
      v.literal("task_snoozed"),
      v.literal("system_added"),
      v.literal("system_removed"),
      v.literal("home_added"),
      v.literal("health_score_changed")
    ),
    description: v.string(),
    metadata: v.optional(v.any()),
  })
    .index("by_user", ["userId"])
    .index("by_home", ["homeId"]),

  // --- CREDIT BALANCES ---
  creditBalances: defineTable({
    homeId: v.id("homes"),
    onboardingCreditsRemaining: v.number(),
    monthlyCreditsRemaining: v.number(),
    monthlyAllowance: v.number(),
    currentMonthStart: v.string(), // ISO date
  }).index("by_home", ["homeId"]),

  // ============================================
  // SERVICE CALL COMPANION TABLES
  // ============================================

  // --- PRODUCT CATALOG ---
  products: defineTable({
    systemTypeId: v.id("systemTypes"),
    brand: v.string(),
    modelLine: v.string(),
    modelNumber: v.string(),
    tier: productTier,
    // Specs
    efficiencyRating: v.optional(v.string()), // SEER, EF, AFUE, etc.
    capacityRange: v.optional(v.string()), // "2-5 ton", "40-75 gal"
    features: v.array(v.string()),
    warrantyYears: v.optional(v.number()),
    expectedLifespan: v.optional(v.number()),
    // Pricing
    msrpLow: v.number(),
    msrpHigh: v.number(),
    installCostLow: v.number(),
    installCostHigh: v.number(),
    // Metadata
    imageUrl: v.optional(v.string()),
    specSheetUrl: v.optional(v.string()),
    productUrl: v.optional(v.string()),
    isActive: v.boolean(),
  })
    .index("by_systemType", ["systemTypeId"])
    .index("by_tier", ["tier"])
    .index("by_brand", ["brand"])
    .index("by_systemType_tier", ["systemTypeId", "tier"])
    .index("by_isActive", ["isActive"]),

  // --- SERVICE CALLS ---
  serviceCalls: defineTable({
    homeId: v.id("homes"),
    systemId: v.id("systems"),
    createdBy: v.id("userProfiles"),
    // Status tracking
    status: serviceCallStatus,
    serviceType: serviceType,
    // Before call - Planning phase
    symptomDescription: v.optional(v.string()),
    plannedQuestions: v.array(v.string()), // Question IDs or text
    selectedProductId: v.optional(v.id("products")), // For replacement planning
    replacementChoice: v.optional(replacementChoice),
    // During call
    technicianName: v.optional(v.string()),
    companyName: v.optional(v.string()),
    companyPhone: v.optional(v.string()),
    technicianNotes: v.optional(v.string()),
    questionResponses: v.optional(v.array(v.object({
      question: v.string(),
      response: v.optional(v.string()),
      rating: v.optional(v.number()), // 1-5
    }))),
    qualificationScore: v.optional(v.number()), // 1-5 average
    // After call
    scheduledDate: v.optional(v.string()),
    completedDate: v.optional(v.string()),
    diagnosis: v.optional(v.string()),
    workPerformed: v.optional(v.string()),
    // Costs
    quotedCost: v.optional(v.number()),
    actualCost: v.optional(v.number()),
    wasDiy: v.boolean(),
    // Replacement tracking
    wasReplacement: v.boolean(),
    newSystemId: v.optional(v.id("systems")), // If system was replaced
    // Rating
    serviceRating: v.optional(v.number()), // 1-5
    serviceNotes: v.optional(v.string()),
    wouldRecommend: v.optional(v.boolean()),
  })
    .index("by_home", ["homeId"])
    .index("by_system", ["systemId"])
    .index("by_status", ["status"])
    .index("by_home_status", ["homeId", "status"])
    .index("by_createdBy", ["createdBy"]),

  // --- TECHNICIAN QUESTIONS ---
  technicianQuestions: defineTable({
    systemTypeId: v.optional(v.id("systemTypes")), // null = general question
    category: questionCategory,
    question: v.string(),
    whyAsk: v.optional(v.string()), // Why this question is important
    goodAnswer: v.optional(v.string()), // What a good answer looks like
    redFlag: v.optional(v.string()), // Warning signs in the answer
    followUpQuestions: v.optional(v.array(v.string())),
    sortOrder: v.number(),
    isActive: v.boolean(),
  })
    .index("by_systemType", ["systemTypeId"])
    .index("by_category", ["category"])
    .index("by_systemType_category", ["systemTypeId", "category"]),

  // --- SERVICE DOCUMENTS ---
  serviceDocuments: defineTable({
    homeId: v.optional(v.id("homes")),
    serviceCallId: v.optional(v.id("serviceCalls")),
    systemId: v.optional(v.id("systems")),
    uploadedBy: v.id("userProfiles"),
    documentType: serviceDocumentType,
    fileName: v.string(),
    storageId: v.id("_storage"),
    fileSize: v.optional(v.number()),
    mimeType: v.optional(v.string()),
    // AI-extracted data
    extractedData: v.optional(v.object({
      vendor: v.optional(v.string()),
      date: v.optional(v.string()),
      totalAmount: v.optional(v.number()),
      lineItems: v.optional(v.array(v.object({
        description: v.string(),
        amount: v.number(),
      }))),
      modelNumber: v.optional(v.string()),
      serialNumber: v.optional(v.string()),
      manufacturer: v.optional(v.string()),
      warrantyInfo: v.optional(v.string()),
      warrantyExpiry: v.optional(v.string()),
      // Model plate extraction fields
      yearManufactured: v.optional(v.string()),
      btuRating: v.optional(v.string()),
      voltage: v.optional(v.string()),
      refrigerantType: v.optional(v.string()),
      seerRating: v.optional(v.string()),
      ampsRating: v.optional(v.string()),
      phaseType: v.optional(v.string()),
      capacityInfo: v.optional(v.string()),
    })),
    parseStatus: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    parseError: v.optional(v.string()),
    // AI condition grading (from vault photo analysis)
    aiConditionGrade: v.optional(v.number()),
    aiConditionLabel: v.optional(v.string()),
    aiConditionConfidence: v.optional(v.number()),
    aiConditionObservations: v.optional(v.array(v.string())),
    aiConditionConcerns: v.optional(v.array(v.string())),
    aiConditionRecommendations: v.optional(v.array(v.string())),
    // AI code compliance check
    aiComplianceStatus: v.optional(v.union(
      v.literal("compliant"),
      v.literal("concerns"),
      v.literal("violations_likely")
    )),
    aiComplianceFlags: v.optional(v.array(v.object({
      code: v.string(),
      description: v.string(),
      severity: v.union(v.literal("info"), v.literal("warning"), v.literal("violation")),
      observation: v.string(),
      recommendation: v.string(),
    }))),
    aiAnalyzedAt: v.optional(v.number()),
  })
    .index("by_serviceCall", ["serviceCallId"])
    .index("by_system", ["systemId"])
    .index("by_type", ["documentType"])
    .index("by_home", ["homeId"]),

  // --- SMART VAULT ---

  vaultDocuments: defineTable({
    homeId: v.id("homes"),
    uploadedBy: v.id("userProfiles"),
    title: v.string(),
    docType: vaultDocType,
    // File storage
    storageId: v.id("_storage"),
    thumbnailStorageId: v.optional(v.id("_storage")),
    fileName: v.string(),
    fileSize: v.optional(v.number()),
    mimeType: v.optional(v.string()),
    // Classification
    category: v.optional(systemCategory),
    linkedSystemId: v.optional(v.id("systems")),
    // AI parsing
    parseStatus: vaultParseStatus,
    parseError: v.optional(v.string()),
    aiGeneratedTitle: v.optional(v.string()),
    aiConfidence: v.optional(v.number()),
    extractedFields: v.optional(v.object({
      vendor: v.optional(v.string()),
      date: v.optional(v.string()),
      totalAmount: v.optional(v.number()),
      lineItems: v.optional(v.array(v.object({
        description: v.string(),
        amount: v.optional(v.number()),
      }))),
      modelNumber: v.optional(v.string()),
      serialNumber: v.optional(v.string()),
      manufacturer: v.optional(v.string()),
      warrantyInfo: v.optional(v.string()),
      warrantyExpiry: v.optional(v.string()),
      serviceDescription: v.optional(v.string()),
      partsReplaced: v.optional(v.array(v.string())),
      nextServiceDate: v.optional(v.string()),
      nextServiceDescription: v.optional(v.string()),
      policyNumber: v.optional(v.string()),
      coverageAmount: v.optional(v.number()),
      permitNumber: v.optional(v.string()),
      permitExpiry: v.optional(v.string()),
      installDate: v.optional(v.string()),
      technicianName: v.optional(v.string()),
      companyName: v.optional(v.string()),
    })),
    // Condition grading (from photo analysis)
    aiConditionGrade: v.optional(v.number()),
    aiConditionLabel: v.optional(v.string()),
    aiConditionConfidence: v.optional(v.number()),
    aiConditionObservations: v.optional(v.array(v.string())),
    aiConditionConcerns: v.optional(v.array(v.string())),
    aiConditionRecommendations: v.optional(v.array(v.string())),
    // Metadata
    uploadedAt: v.number(),
    reviewNeeded: v.boolean(),
  })
    .index("by_home", ["homeId"])
    .index("by_system", ["linkedSystemId"])
    .index("by_type", ["docType"])
    .index("by_home_and_type", ["homeId", "docType"])
    .index("by_parseStatus", ["parseStatus"])
    .index("by_home_and_review", ["homeId", "reviewNeeded"]),

  vaultAlerts: defineTable({
    homeId: v.id("homes"),
    vaultDocumentId: v.id("vaultDocuments"),
    systemId: v.optional(v.id("systems")),
    alertType: vaultAlertType,
    title: v.string(),
    description: v.string(),
    dueDate: v.optional(v.number()),
    status: vaultAlertStatus,
    severity: vaultAlertSeverity,
  })
    .index("by_home", ["homeId"])
    .index("by_status", ["status"])
    .index("by_home_and_status", ["homeId", "status"])
    .index("by_document", ["vaultDocumentId"]),

  // =====================================================
  // ML/ANALYTICS DATA TABLES
  // =====================================================

  /**
   * Regional cost data aggregation for ML forecasting
   * Aggregates costs by region, system type, and service type
   */
  regionalCostData: defineTable({
    state: v.string(),
    city: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    climateZone: v.optional(v.number()),
    systemTypeId: v.id("systemTypes"),
    serviceType: v.union(
      v.literal("repair"),
      v.literal("replacement"),
      v.literal("maintenance"),
      v.literal("inspection")
    ),
    // Aggregated cost metrics
    avgCost: v.number(),
    minCost: v.number(),
    maxCost: v.number(),
    medianCost: v.optional(v.number()),
    sampleCount: v.number(),
    // Time window for this aggregation
    periodStart: v.optional(v.number()),
    periodEnd: v.optional(v.number()),
    lastUpdated: v.number(),
  })
    .index("by_region_system", ["state", "systemTypeId"])
    .index("by_zip_system", ["zipCode", "systemTypeId"])
    .index("by_state", ["state"])
    .index("by_system_type", ["systemTypeId"]),

  /**
   * Historical cost tracking for time-series analysis
   * Individual cost records with full regional context
   */
  costHistory: defineTable({
    homeId: v.id("homes"),
    systemId: v.optional(v.id("systems")),
    systemTypeId: v.id("systemTypes"),
    // Source references
    serviceCallId: v.optional(v.id("serviceCalls")),
    taskId: v.optional(v.id("scheduledMaintenance")),
    documentId: v.optional(v.id("serviceDocuments")),
    // Cost details
    costType: v.union(
      v.literal("actual"),
      v.literal("quoted"),
      v.literal("estimated")
    ),
    amount: v.number(),
    wasDiy: v.boolean(),
    vendor: v.optional(v.string()),
    description: v.optional(v.string()),
    // Service type
    serviceType: v.union(
      v.literal("repair"),
      v.literal("replacement"),
      v.literal("maintenance"),
      v.literal("inspection")
    ),
    // Regional context for ML
    state: v.string(),
    city: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    climateZone: v.optional(v.number()),
    // Home context for ML
    homeAge: v.optional(v.number()),
    homeSquareFootage: v.optional(v.number()),
    // Timestamps
    serviceDate: v.number(),
    recordedAt: v.number(),
  })
    .index("by_home", ["homeId"])
    .index("by_system", ["systemId"])
    .index("by_system_type", ["systemTypeId", "serviceDate"])
    .index("by_region", ["state", "systemTypeId", "serviceDate"])
    .index("by_zip", ["zipCode", "systemTypeId"])
    .index("by_service_type", ["serviceType", "serviceDate"]),

  /**
   * Climate modifiers — region-specific adjustments to system Weibull parameters
   * Each row represents one climate zone × one system type combination.
   * Used to adjust lifespan forecasts, maintenance frequencies, and
   * risk calculations based on the home's geographic location.
   */
  climateModifiers: defineTable({
    // Identification
    climateZoneId: v.string(), // e.g. "gulf_coast_subtropical"
    climateZoneName: v.string(), // e.g. "Gulf Coast / Subtropical"
    systemTypeId: v.id("systemTypes"),
    
    // Regions covered
    regions: v.array(v.string()), // e.g. ["Gulf Coast FL", "Coastal LA", ...]
    climateFactors: v.array(v.string()), // e.g. ["high_humidity", "salt_air", "hard_water"]
    
    // Impact description (field-authored narrative)
    impactDescription: v.string(),
    
    // Weibull adjustments
    lifespanModifierPercent: v.number(), // e.g. -20 for 20% reduction
    adjustedLifespanMin: v.number(),
    adjustedLifespanMax: v.number(),
    adjustedLifespanMedian: v.number(),
    weibullScaleAdjustment: v.number(), // Multiplier, e.g. 0.80
    adjustedWeibullScale: v.number(), // Pre-calculated adjusted scale
    weibullShapeNotes: v.optional(v.string()),
    
    // Maintenance frequency adjustments
    maintenanceAdjustments: v.optional(v.array(v.object({
      taskName: v.string(), // Matches maintenance template name
      originalFrequencyMonths: v.number(),
      adjustedFrequencyMonths: v.number(),
      rationale: v.string(),
    }))),
    
    // Additional tasks specific to this climate zone
    additionalTasks: v.optional(v.array(v.object({
      taskName: v.string(),
      frequency: v.string(), // e.g. "semi_annual", "annual"
      description: v.string(),
      rationale: v.string(),
      seasonalRelevance: v.optional(v.array(v.string())),
    }))),
    
    // Additional preventative care guidelines
    additionalGuidelines: v.optional(v.array(v.string())),
    
    // Troubleshooting priority adjustments
    troubleshootingAdjustments: v.optional(v.array(v.object({
      symptomName: v.string(),
      adjustment: v.string(),
    }))),
    
    isActive: v.boolean(),
  })
    .index("by_zone", ["climateZoneId"])
    .index("by_systemType", ["systemTypeId"])
    .index("by_zone_system", ["climateZoneId", "systemTypeId"]),

  /**
   * Preventative care guidelines — proactive recommendations for extending system life
   * Separate from maintenance tasks (which are scheduled actions). These are
   * strategic recommendations like "install a water softener" or "plan proactive replacement."
   */
  preventativeCareGuidelines: defineTable({
    systemTypeId: v.id("systemTypes"),
    guidelineId: v.string(), // e.g. "ewh_proactive_anode_replacement"
    name: v.string(),
    description: v.string(), // Field-authored narrative
    lifespanExtensionEstimate: v.string(), // e.g. "3-6 additional years"
    costCategory: v.union(
      v.literal("free"),
      v.literal("low"),
      v.literal("medium"),
      v.literal("high")
    ),
    costEstimate: v.string(), // e.g. "$25-$35 per replacement"
    implementationNotes: v.string(),
    sortOrder: v.number(),
    isActive: v.boolean(),
  })
    .index("by_systemType", ["systemTypeId"])
    .index("by_active", ["isActive"]),

  /**
   * Regional cost multipliers for adjusting national averages
   * Used to scale cost estimates based on location
   */
  regionalCostMultipliers: defineTable({
    state: v.string(),
    city: v.optional(v.string()),
    systemCategory: systemCategory,
    // Cost multipliers (1.0 = national average)
    multiplier: v.number(),
    laborMultiplier: v.number(),
    partsMultiplier: v.number(),
    // Confidence and sample info
    confidence: v.optional(v.union(
      v.literal("high"),
      v.literal("medium"),
      v.literal("low")
    )),
    sampleCount: v.optional(v.number()),
    lastUpdated: v.number(),
  })
    .index("by_state_category", ["state", "systemCategory"])
    .index("by_state", ["state"]),

  /**
   * System lifecycle data for ML model training
   * Tracks actual system lifespans vs predicted
   */
  lifecycleData: defineTable({
    systemTypeId: v.id("systemTypes"),
    // Regional context
    state: v.string(),
    climateZone: v.optional(v.number()),
    // Lifecycle data
    actualLifespanYears: v.number(),
    predictedLifespanYears: v.number(),
    installYear: v.number(),
    failureYear: v.number(),
    failureReason: v.optional(v.string()),
    // Maintenance history
    maintenanceFrequency: v.optional(v.string()), // "regular", "occasional", "none"
    totalMaintenanceCost: v.optional(v.number()),
    // Home context
    homeAge: v.optional(v.number()),
    waterHardness: v.optional(v.string()),
    // Timestamps
    recordedAt: v.number(),
  })
    .index("by_system_type", ["systemTypeId"])
    .index("by_region", ["state", "systemTypeId"])
    .index("by_climate", ["climateZone", "systemTypeId"]),

  // =====================================================
  // COMPREHENSIVE MAINTENANCE SYSTEM TABLES
  // =====================================================

  /**
   * Common issues by system type with age-based probability curves
   * Powers the "Common Issues" section in System Hub pages
   */
  issuesBySystemType: defineTable({
    systemTypeId: v.id("systemTypes"),
    issueName: v.string(),
    description: v.string(),
    
    // Probability modeling (Weibull-based)
    baseOccurrenceRate: v.number(), // Annual probability at year 0 (0-1)
    weibullShape: v.number(), // Shape parameter for age curve (k)
    weibullScale: v.number(), // Scale parameter in years (Î»)
    
    // Symptoms & Detection
    symptoms: v.array(v.string()),
    earlyWarningSigns: v.optional(v.array(v.string())),
    
    // Cost & Severity
    severity: v.union(
      v.literal("minor"),
      v.literal("moderate"),
      v.literal("major"),
      v.literal("critical")
    ),
    repairCostLow: v.number(),
    repairCostHigh: v.number(),
    
    // DIY feasibility
    isDiyFixable: v.boolean(),
    diyDifficulty: v.optional(v.union(
      v.literal("easy"),
      v.literal("moderate"),
      v.literal("hard")
    )),
    diyFixSteps: v.optional(v.array(v.string())),
    
    // Prevention info
    preventionTips: v.optional(v.array(v.string())),
    relatedMaintenanceTasks: v.optional(v.array(v.string())), // Task names
    preventionEffectiveness: v.optional(v.number()), // 0-1, how much maintenance reduces risk
    
    sortOrder: v.number(),
    isActive: v.boolean(),
  })
    .index("by_systemType", ["systemTypeId"])
    .index("by_severity", ["severity"])
    .index("by_active", ["isActive"]),

  /**
   * User preferences for maintenance display and focus systems
   * One record per user-home combination
   */
  userMaintenancePreferences: defineTable({
    userId: v.id("userProfiles"),
    homeId: v.id("homes"),
    
    // System Focus - which systems to prioritize in Care feed
    focusSystemIds: v.optional(v.array(v.id("systems"))), // User's installed systems to focus on
    hiddenSystemIds: v.optional(v.array(v.id("systems"))), // Systems to de-prioritize
    
    // Display preferences
    defaultDetailLevel: v.union(
      v.literal("summary"),
      v.literal("standard"),
      v.literal("expert")
    ),
    showSeasonalBadges: v.boolean(),
    showCostEstimates: v.boolean(),
    showDifficultyIndicators: v.boolean(),
    showAgeAlerts: v.boolean(),
    
    // Notification preferences
    reminderDaysBefore: v.number(), // 7, 14, 30
    seasonalReminders: v.boolean(),
  })
    .index("by_user_home", ["userId", "homeId"])
    .index("by_user", ["userId"]),

  // =====================================================
  // HEALTH POINTS TABLES
  // =====================================================

  /**
   * Health points events - immutable points ledger
   */
  healthPointsEvents: defineTable({
    userId: v.id("userProfiles"),
    homeId: v.optional(v.id("homes")),
    systemId: v.optional(v.id("systems")),
    taskId: v.optional(v.id("scheduledMaintenance")),
    sourceType: healthPointsSource,
    points: v.number(),
    reason: v.optional(v.string()),
    metadata: v.optional(v.any()),
    occurredAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_home", ["homeId"])
    .index("by_source", ["sourceType"])
    .index("by_task", ["taskId"]),

  /**
   * Health points balances - current/lifetime totals per scope
   */
  healthPointsBalances: defineTable({
    userId: v.id("userProfiles"),
    homeId: v.optional(v.id("homes")),
    currentPoints: v.number(),
    lifetimePoints: v.number(),
    lastEarnedAt: v.optional(v.number()),
    lastBundleAchievedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_home", ["homeId"]),

  /**
   * Health points bundles - milestone achievements
   */
  healthPointsBundles: defineTable({
    userId: v.id("userProfiles"),
    homeId: v.optional(v.id("homes")),
    bundleKey: healthBundleKey,
    bundleName: v.string(),
    pointsRequired: v.number(),
    rewardType: healthPointsRewardType,
    achievedAt: v.number(),
    metadata: v.optional(v.any()),
  })
    .index("by_user", ["userId"])
    .index("by_home", ["homeId"])
    .index("by_bundleKey", ["bundleKey"]),

  // =====================================================
  // HP GAMIFICATION SYSTEM (NEW)
  // =====================================================

  /**
   * Home HP State - Current HP and tier for each home
   * Ties HP directly to Weibull-based risk forecasting
   */
  homeHPState: defineTable({
    homeId: v.id("homes"),
    // Current HP value (risk-weighted sum of all system HP)
    currentHP: v.number(),
    // Maximum possible HP for this home (used for percentage calculations)
    maxPossibleHP: v.number(),
    // Dollar value protected (currentHP * 100)
    dollarValueProtected: v.number(),
    // Dollar value at risk (maxPossibleHP * 100 - dollarValueProtected)
    dollarValueAtRisk: v.number(),
    // Replacement Value at Risk (RVaR)
    replacementAtRisk: v.optional(v.number()),
    // Damage Exposure Index (DEI)
    damageExposure: v.optional(v.number()),
    damageExposureRaw: v.optional(v.number()),
    damageExposureMultiplier: v.optional(v.number()),
    damageExposureToReplacementRatio: v.optional(v.number()),
    // Current tier based on HP and requirements
    currentTier: hpTier,
    // When the current tier was achieved
    tierAchievedAt: v.number(),
    // Tier requirements status
    tierRequirementsMet: v.optional(v.object({
      majorSystemsDocumented: v.boolean(),
      noSystemsCritical: v.boolean(),
      allInstallDatesSet: v.boolean(),
      maintenanceCurrent: v.boolean(),
      budgetFundedPercent: v.number(),
      campaignsCompleted: v.number(),
      streakDaysWithoutLapse: v.number(),
    })),
    // Lifetime stats
    lifetimeHPEarned: v.number(),
    lifetimeHPDecayed: v.number(),
    // Decay tracking
    lastDecayCalculation: v.number(),
    monthlyDecayRate: v.number(), // HP lost per month from aging
    overdueDecayRate: v.number(), // Additional HP lost from overdue tasks
    // Streak tracking
    streakDaysWithoutLapse: v.number(),
    lastStreakUpdate: v.optional(v.number()),
    // Weekly/monthly summaries for UI
    hpChangeThisWeek: v.number(),
    hpChangeThisMonth: v.number(),
  })
    .index("by_home", ["homeId"])
    .index("by_tier", ["currentTier"]),

  /**
   * HP Events - Detailed log of all HP changes
   * Rich event type for both earnings and decay
   */
  hpEvents: defineTable({
    homeId: v.id("homes"),
    systemId: v.optional(v.id("systems")),
    // Event classification
    eventType: hpEventType,
    // HP change (positive for earn/bonus, negative for decay)
    hpChange: v.number(),
    // New balance after this event
    newBalance: v.number(),
    // Reason code for the event
    reason: v.string(),
    // Human-readable description
    description: v.string(),
    // Optional metadata for context
    metadata: v.optional(v.object({
      // For tier changes
      previousTier: v.optional(hpTier),
      newTier: v.optional(hpTier),
      // For maintenance events
      taskId: v.optional(v.id("scheduledMaintenance")),
      maintenanceType: v.optional(v.string()),
      // For campaign events
      campaignId: v.optional(v.string()),
      campaignItemId: v.optional(v.string()),
      // For system events
      systemName: v.optional(v.string()),
      replacementCost: v.optional(v.number()),
      survivalProbability: v.optional(v.number()),
      // For document uploads and other labeled events
      label: v.optional(v.string()),
      // For decay events
      decayBreakdown: v.optional(v.array(v.object({
        systemId: v.optional(v.id("systems")),
        systemName: v.string(),
        decayAmount: v.number(),
        reason: v.string(),
      }))),
    })),
    occurredAt: v.number(),
  })
    .index("by_home", ["homeId"])
    .index("by_home_date", ["homeId", "occurredAt"])
    .index("by_system", ["systemId"])
    .index("by_type", ["eventType"])
    .index("by_reason", ["reason"]),

  /**
   * Campaign Progress - Seasonal readiness campaign tracking
   */
  campaignProgress: defineTable({
    homeId: v.id("homes"),
    // Campaign identification
    campaignId: v.string(), // e.g., "fall_2026"
    campaignType: campaignType,
    year: v.number(),
    // Campaign timing
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    expiresAt: v.number(), // Campaign end date
    // Checklist items with completion status
    checklistItems: v.array(v.object({
      itemId: v.string(),
      description: v.string(),
      hpValue: v.number(),
      systemTypeId: v.optional(v.id("systemTypes")), // Optional link to system type
      systemId: v.optional(v.id("systems")), // Optional link to specific system
      completedAt: v.optional(v.number()),
      // How the item was completed
      completionMethod: v.optional(v.union(
        v.literal("manual"),
        v.literal("task_linked"),
        v.literal("auto_detected")
      )),
      linkedTaskId: v.optional(v.id("scheduledMaintenance")),
    })),
    // Progress tracking
    itemsCompleted: v.number(),
    totalItems: v.number(),
    hpEarned: v.number(),
    maxHP: v.number(),
    // Bonus tracking
    bonusHP: v.number(), // Bonus for completing all items
    bonusAwarded: v.boolean(),
    // Badge earned
    badgeEarned: v.optional(v.string()), // e.g., "Fall 2026 Ready"
  })
    .index("by_home", ["homeId"])
    .index("by_home_campaign", ["homeId", "campaignId"])
    .index("by_campaign_type", ["campaignType", "year"])
    .index("by_active", ["expiresAt"]),

  /**
   * System HP Contribution - Cached HP values per system
   * Updated when system data changes or decay runs
   */
  systemHPContribution: defineTable({
    systemId: v.id("systems"),
    homeId: v.id("homes"),
    // Current HP contribution from this system
    currentHP: v.number(),
    // Maximum possible HP for this system
    maxHP: v.number(),
    // Component values of the HP formula
    baseValue: v.number(), // replacementCost / 100
    survivalProbability: v.number(), // 1 - Weibull CDF
    conditionMultiplier: v.number(), // 1.0, 0.8, 0.5, 0.2
    documentationBonus: v.number(), // 1.2 or 1.0
    // Decay rates
    monthlyAgingDecay: v.number(), // HP lost per month from aging
    lapseDecay: v.number(), // Additional decay from overdue maintenance
    // Last calculation timestamp
    lastCalculated: v.number(),
    // Weibull parameters for this system (cached)
    systemAge: v.number(), // in years
    weibullShape: v.number(),
    weibullScale: v.number(),
  })
    .index("by_system", ["systemId"])
    .index("by_home", ["homeId"]),

  /**
   * System Mitigations - protection measures reducing damage exposure
   */
  systemMitigations: defineTable({
    homeId: v.id("homes"),
    systemId: v.id("systems"),
    mitigationType: mitigationType,
    reductionFactor: v.number(), // 0.3 - 1.0
    installDate: v.optional(v.string()),
  })
    .index("by_system", ["systemId"])
    .index("by_home", ["homeId"])
    .index("by_home_system", ["homeId", "systemId"])
    .index("by_type", ["mitigationType"]),

  /**
   * Weather cache - Weather.gov responses cached per location
   */
  weatherCache: defineTable({
    latitude: v.number(),
    longitude: v.number(),
    fetchedAt: v.number(),
    forecast: v.any(),
    alerts: v.any(),
  })
    .index("by_location", ["latitude", "longitude"])
    .index("by_fetched", ["fetchedAt"]),

  /**
   * Weather advisories - generated by advisory engine
   */
  weatherAdvisories: defineTable({
    homeId: v.id("homes"),
    advisoryType: weatherAdvisoryType,
    severity: weatherAdvisorySeverity,
    title: v.string(),
    description: v.string(),
    startsAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    actions: v.array(v.object({
      actionId: v.string(),
      priority: v.union(
        v.literal("critical"),
        v.literal("high"),
        v.literal("medium"),
        v.literal("low")
      ),
      title: v.string(),
      description: v.string(),
      relatedSystemCategory: v.optional(systemCategory),
      estimatedMinutes: v.optional(v.number()),
    })),
    source: v.union(v.literal("forecast"), v.literal("alert")),
    createdAt: v.number(),
    isActive: v.boolean(),
  })
    .index("by_home", ["homeId"])
    .index("by_home_active", ["homeId", "isActive"])
    .index("by_home_type", ["homeId", "advisoryType"])
    .index("by_severity", ["severity"])
    .index("by_active", ["isActive"]),

  /**
   * Weather notification preferences
   */
  weatherNotificationPrefs: defineTable({
    homeId: v.id("homes"),
    channels: v.array(notificationChannel),
    lastSentAt: v.optional(v.number()),
  })
    .index("by_home", ["homeId"]),

  // =====================================================
  // KNOWLEDGE BASE TABLES
  // =====================================================

  /**
   * Knowledge articles - rich markdown content for DIY guides, diagnostics, explainers
   */
  knowledgeArticles: defineTable({
    // Classification
    slug: v.string(), // URL-friendly unique identifier
    articleType: knowledgeArticleType,
    
    // Linking to system types (optional)
    systemTypeId: v.optional(v.id("systemTypes")),
    systemCategory: v.optional(systemCategory),
    taskTemplateId: v.optional(v.id("maintenanceTaskTemplates")),
    
    // Content
    title: v.string(),
    subtitle: v.optional(v.string()),
    summary: v.string(), // 1-2 sentence summary
    contentMarkdown: v.string(), // Full markdown content
    
    // Metadata
    difficulty: v.optional(v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced"),
      v.literal("pro_only")
    )),
    estimatedReadMinutes: v.optional(v.number()),
    estimatedTaskMinutes: v.optional(v.number()),
    toolsRequired: v.optional(v.array(v.string())),
    partsRequired: v.optional(v.array(v.string())),
    safetyWarnings: v.optional(v.array(v.string())),
    
    // SEO / search
    keywords: v.optional(v.array(v.string())),

    // Layered depth
    quickSkim: v.optional(v.array(v.string())),
    deepDiveContent: v.optional(v.object({
      whyItMatters: v.string(),
      scienceBehind: v.optional(v.string()),
      failureModes: v.optional(v.array(v.string())),
      proTips: v.optional(v.array(v.string())),
    })),

    // Seasonal
    seasonPreference: v.optional(v.union(
      v.literal("spring"),
      v.literal("summer"),
      v.literal("fall"),
      v.literal("winter"),
      v.literal("any")
    )),
    optimalMonths: v.optional(v.array(v.number())),
    
    // Status
    status: knowledgeContentStatus,
    version: v.number(),
    
    // Attribution
    authorId: v.optional(v.id("userProfiles")),
    sourceUrl: v.optional(v.string()),
    lastReviewedAt: v.optional(v.number()),
    
    // Engagement
    viewCount: v.number(),
    helpfulCount: v.number(),
    notHelpfulCount: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_type", ["articleType"])
    .index("by_systemType", ["systemTypeId"])
    .index("by_category", ["systemCategory"])
    .index("by_taskTemplate", ["taskTemplateId"])
    .index("by_status", ["status"])
    .index("by_season", ["seasonPreference"])
    .searchIndex("search_articles", {
      searchField: "title",
      filterFields: ["articleType", "systemCategory", "status"],
    }),

  /**
   * Knowledge sections - break articles into navigable sections
   */
  knowledgeSections: defineTable({
    articleId: v.id("knowledgeArticles"),
    order: v.number(),
    heading: v.string(),
    slug: v.string(), // For anchor links
    contentMarkdown: v.string(),
    isCollapsible: v.boolean(),
    defaultExpanded: v.boolean(),
  })
    .index("by_article", ["articleId"]),

  /**
   * Diagnostic trees - decision-tree troubleshooting flows
   */
  diagnosticTrees: defineTable({
    // Classification
    slug: v.string(),
    systemTypeId: v.optional(v.id("systemTypes")),
    systemCategory: v.optional(systemCategory),
    
    // Content
    title: v.string(), // e.g., "AC Not Cooling Troubleshooter"
    description: v.string(),
    entrySymptom: v.string(), // Starting symptom
    
    // Status
    status: knowledgeContentStatus,
    version: v.number(),
    
    // Stats
    completionCount: v.number(),
    avgStepsToResolution: v.optional(v.number()),
  })
    .index("by_slug", ["slug"])
    .index("by_systemType", ["systemTypeId"])
    .index("by_category", ["systemCategory"])
    .index("by_status", ["status"]),

  /**
   * Diagnostic nodes - individual steps in a diagnostic tree
   */
  diagnosticNodes: defineTable({
    treeId: v.id("diagnosticTrees"),
    nodeKey: v.string(), // Unique within tree (e.g., "start", "check_filter")
    nodeType: diagnosticNodeType,
    
    // Content
    title: v.string(),
    contentMarkdown: v.optional(v.string()), // Detailed explanation
    imageUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    
    // For questions
    options: v.optional(v.array(v.object({
      label: v.string(),
      nextNodeKey: v.string(),
      explanation: v.optional(v.string()),
    }))),
    
    // For results
    diagnosisCode: v.optional(v.string()),
    severity: v.optional(v.union(
      v.literal("minor"),
      v.literal("moderate"),
      v.literal("serious"),
      v.literal("critical")
    )),
    recommendedAction: v.optional(v.string()),
    estimatedCost: v.optional(v.object({
      diyLow: v.number(),
      diyHigh: v.number(),
      proLow: v.number(),
      proHigh: v.number(),
    })),
    shouldCallPro: v.optional(v.boolean()),
    
    // For referrals
    proSpecialty: v.optional(v.string()),
    urgency: v.optional(v.string()),
    
    // Linked content
    relatedArticleId: v.optional(v.id("knowledgeArticles")),
    
    // Cross-system links
    relatedCareTaskKey: v.optional(v.string()), // Links to maintenanceTasks.key
  })
    .index("by_tree", ["treeId"])
    .index("by_nodeKey", ["treeId", "nodeKey"]),

  /**
   * Article relations - link related articles together
   */
  knowledgeRelations: defineTable({
    fromArticleId: v.id("knowledgeArticles"),
    toArticleId: v.id("knowledgeArticles"),
    relationType: v.union(
      v.literal("see_also"),
      v.literal("prerequisite"),
      v.literal("next_step"),
      v.literal("alternative"),
      v.literal("deep_dive")
    ),
  })
    .index("by_from", ["fromArticleId"])
    .index("by_to", ["toArticleId"]),

  /**
   * User article feedback - track helpfulness
   */
  knowledgeFeedback: defineTable({
    articleId: v.id("knowledgeArticles"),
    userId: v.optional(v.id("userProfiles")),
    sessionId: v.optional(v.string()), // For anonymous users
    wasHelpful: v.boolean(),
    feedbackText: v.optional(v.string()),
    contextTaskId: v.optional(v.id("scheduledMaintenance")),
    contextSystemId: v.optional(v.id("systems")),
  })
    .index("by_article", ["articleId"])
    .index("by_user", ["userId"]),

  /**
   * Diagnostic issues - symptom-based diagnostic data for home packets
   */
  diagnosticIssues: defineTable({
    issueId: v.string(), // e.g. "ac-not-cooling"
    systemCategory: systemCategory,
    symptom: v.string(),
    description: v.string(),
    understanding: v.object({
      whatItIs: v.string(),
      howItWorks: v.string(),
      keyComponents: v.optional(v.array(v.string())),
      healthFactorNote: v.optional(v.string()),
    }),
    possibleCauses: v.array(v.object({
      title: v.string(),
      likelihood: v.union(v.literal("High"), v.literal("Moderate"), v.literal("Low")),
      likelihoodPercent: v.number(),
      expectedCostLow: v.number(),
      expectedCostHigh: v.number(),
      diyCheck: v.string(),
    })),
    diySteps: v.object({
      title: v.string(),
      steps: v.array(v.string()),
      stopCondition: v.string(),
    }),
    safetyWarnings: v.array(v.string()),
    redFlags: v.array(v.string()),
    pricingReference: v.object({
      region: v.string(),
      repairLow: v.number(),
      repairHigh: v.number(),
      replaceLow: v.number(),
      replaceHigh: v.number(),
    }),
    seasonPreference: v.optional(v.union(
      v.literal("spring"),
      v.literal("summer"),
      v.literal("fall"),
      v.literal("winter"),
      v.literal("any")
    )),
    status: knowledgeContentStatus,
  })
    .index("by_issueId", ["issueId"])
    .index("by_category", ["systemCategory"])
    .index("by_status", ["status"]),

  // =====================================================
  // MODEL INTELLIGENCE TABLES
  // =====================================================

  /**
   * Manufacturers - canonical manufacturer database
   */
  manufacturers: defineTable({
    name: v.string(), // Canonical name (e.g., "Carrier")
    aliases: v.array(v.string()), // Alternative names/spellings
    website: v.optional(v.string()),
    supportPhone: v.optional(v.string()),
    supportUrl: v.optional(v.string()),
    warrantyLookupUrl: v.optional(v.string()),
    partsLookupUrl: v.optional(v.string()),
    // Categories this manufacturer covers
    categories: v.array(systemCategory),
    logoUrl: v.optional(v.string()),
    isActive: v.boolean(),
  })
    .index("by_name", ["name"])
    .index("by_isActive", ["isActive"])
    .searchIndex("search_manufacturer", {
      searchField: "name",
      filterFields: ["isActive"],
    }),

  /**
   * Model database - specific models with metadata
   */
  modelDatabase: defineTable({
    manufacturerId: v.id("manufacturers"),
    systemTypeId: v.id("systemTypes"),
    
    // Model identification
    modelNumber: v.string(), // Exact model number
    modelPattern: v.optional(v.string()), // Regex pattern to match variants
    modelSeries: v.optional(v.string()), // Series name (e.g., "Infinity Series")
    
    // Product info
    productName: v.optional(v.string()),
    description: v.optional(v.string()),
    yearsProduced: v.optional(v.object({
      start: v.number(),
      end: v.optional(v.number()), // null if still in production
    })),
    
    // Specifications
    specs: v.optional(v.object({
      capacity: v.optional(v.string()), // e.g., "3 ton", "50 gallon"
      efficiency: v.optional(v.string()), // e.g., "16 SEER", "95% AFUE"
      fuelType: v.optional(v.string()),
      voltage: v.optional(v.string()),
      dimensions: v.optional(v.string()),
    })),
    
    // Lifecycle data
    expectedLifespanYears: v.optional(v.number()),
    typicalFailurePoints: v.optional(v.array(v.string())),
    
    // Links
    manualUrl: v.optional(v.string()),
    partsListUrl: v.optional(v.string()),
    installGuideUrl: v.optional(v.string()),
    
    // Linked knowledge content
    troubleshootingTreeId: v.optional(v.id("diagnosticTrees")),
    maintenanceGuideId: v.optional(v.id("knowledgeArticles")),
  })
    .index("by_manufacturer", ["manufacturerId"])
    .index("by_systemType", ["systemTypeId"])
    .index("by_modelNumber", ["modelNumber"])
    .searchIndex("search_model", {
      searchField: "modelNumber",
      filterFields: ["manufacturerId", "systemTypeId"],
    }),

  /**
   * Model issues - known problems, recalls, service bulletins
   */
  modelIssues: defineTable({
    modelId: v.id("modelDatabase"),
    
    // Issue classification
    issueType: modelIssueType,
    severity: modelIssueSeverity,
    
    // Content
    title: v.string(),
    description: v.string(),
    symptoms: v.optional(v.array(v.string())),
    affectedSerialRanges: v.optional(v.array(v.object({
      start: v.string(),
      end: v.string(),
    }))),
    affectedYears: v.optional(v.array(v.number())),
    
    // Resolution
    fixDescription: v.optional(v.string()),
    diyPossible: v.boolean(),
    estimatedCost: v.optional(v.object({
      diyLow: v.number(),
      diyHigh: v.number(),
      proLow: v.number(),
      proHigh: v.number(),
    })),
    partsNeeded: v.optional(v.array(v.string())),
    
    // For recalls
    recallNumber: v.optional(v.string()),
    recallDate: v.optional(v.string()),
    recallUrl: v.optional(v.string()),
    
    // Linked content
    relatedArticleId: v.optional(v.id("knowledgeArticles")),
    relatedDiagnosticId: v.optional(v.id("diagnosticTrees")),
    
    // Status
    isActive: v.boolean(),
    verifiedAt: v.optional(v.number()),
  })
    .index("by_model", ["modelId"])
    .index("by_type", ["issueType"])
    .index("by_severity", ["severity"])
    .index("by_active", ["isActive"]),

  /**
   * Model parts - common replacement parts for models
   */
  modelParts: defineTable({
    modelId: v.id("modelDatabase"),
    
    partNumber: v.string(),
    partName: v.string(),
    description: v.optional(v.string()),
    
    // Compatibility
    isOem: v.boolean(),
    compatiblePartNumbers: v.optional(v.array(v.string())), // Aftermarket alternatives
    
    // Pricing
    estimatedCostLow: v.optional(v.number()),
    estimatedCostHigh: v.optional(v.number()),
    
    // Where to buy
    purchaseUrls: v.optional(v.array(v.object({
      vendor: v.string(),
      url: v.string(),
    }))),
    
    // Maintenance relevance
    typicalReplacementIntervalYears: v.optional(v.number()),
    failureIndicators: v.optional(v.array(v.string())),
  })
    .index("by_model", ["modelId"])
    .index("by_partNumber", ["partNumber"]),

  /**
   * Serial number patterns - decode manufacture date from serial
   */
  serialPatterns: defineTable({
    manufacturerId: v.id("manufacturers"),
    
    // Pattern definition
    pattern: v.string(), // Regex pattern
    description: v.string(),
    
    // Decoding rules (simplified - could be more complex)
    yearPosition: v.optional(v.object({
      start: v.number(),
      length: v.number(),
      format: v.union(
        v.literal("year_2digit"),
        v.literal("year_4digit"),
        v.literal("year_letter"), // A=2001, B=2002, etc.
        v.literal("week_year")    // WWYY format
      ),
    })),
    monthPosition: v.optional(v.object({
      start: v.number(),
      length: v.number(),
      format: v.union(
        v.literal("month_2digit"),
        v.literal("month_letter")
      ),
    })),
    
    // Example
    exampleSerial: v.optional(v.string()),
    exampleDecoded: v.optional(v.string()),
  })
    .index("by_manufacturer", ["manufacturerId"]),

  /**
   * Scan corrections — track user edits to scan results for accuracy improvement
   */
  scanCorrections: defineTable({
    documentId: v.optional(v.id("serviceDocuments")),
    homeId: v.optional(v.id("homes")),
    systemId: v.optional(v.id("systems")),
    userId: v.id("userProfiles"),

    originalManufacturer: v.optional(v.string()),
    originalModel: v.optional(v.string()),
    originalSerial: v.optional(v.string()),
    originalDecodedYear: v.optional(v.number()),

    correctedManufacturer: v.optional(v.string()),
    correctedModel: v.optional(v.string()),
    correctedSerial: v.optional(v.string()),
    correctedYear: v.optional(v.number()),

    correctionType: v.string(),
    correctionNote: v.optional(v.string()),

    platePhotoStorageId: v.optional(v.id("_storage")),
    createdAt: v.number(),
  })
    .index("by_manufacturer", ["originalManufacturer"])
    .index("by_user", ["userId"])
    .index("by_createdAt", ["createdAt"]),

  // =====================================================
  // HOMEOWNER EXPERIENCE ENHANCEMENT TABLES
  // =====================================================

  /**
   * Forecast snapshots for tracking changes over time
   */
  forecastSnapshots: defineTable({
    homeId: v.id("homes"),
    snapshotDate: v.number(),
    triggerType: snapshotTriggerType,
    triggerDescription: v.string(),
    confidenceScore: v.number(),
    forecastSummary: v.object({
      year1Total: v.number(),
      year5Total: v.number(),
      year10Total: v.number(),
    }),
    changes: v.optional(v.array(v.object({
      field: v.string(),
      oldValue: v.optional(v.string()),
      newValue: v.string(),
      impactDescription: v.string(),
      costDelta: v.optional(v.number()),
    }))),
  })
    .index("by_home", ["homeId"])
    .index("by_home_date", ["homeId", "snapshotDate"]),

  /**
   * Home incidents - tracks issues reported through triage wizard
   */
  incidents: defineTable({
    homeId: v.id("homes"),
    systemId: v.optional(v.id("systems")),
    systemTypeId: v.optional(v.id("systemTypes")),
    issueId: v.string(),
    symptomDescription: v.string(),
    userAnswers: v.array(v.object({
      questionId: v.string(),
      answer: v.string(),
    })),
    urgency: incidentUrgency,
    likelyCauses: v.array(v.string()),
    recommendedAction: recommendedAction,
    safetyStepsTaken: v.optional(v.array(v.string())),
    status: incidentStatus,
    packetId: v.optional(v.id("homePackets")),
    serviceEventId: v.optional(v.id("homeownerServiceEvents")),
    resolvedAt: v.optional(v.number()),
    resolutionNotes: v.optional(v.string()),
  })
    .index("by_home", ["homeId"])
    .index("by_home_status", ["homeId", "status"])
    .index("by_system", ["systemId"]),

  /**
   * Homeowner service events - records of completed service work
   */
  homeownerServiceEvents: defineTable({
    homeId: v.id("homes"),
    systemId: v.optional(v.id("systems")),
    incidentId: v.optional(v.id("incidents")),
    packetId: v.optional(v.id("homePackets")),
    eventType: serviceType,
    eventDate: v.string(),
    description: v.string(),
    providerName: v.optional(v.string()),
    providerPhone: v.optional(v.string()),
    providerEmail: v.optional(v.string()),
    totalCost: v.number(),
    wasDiy: v.boolean(),
    estimatedCostAtTime: v.optional(v.number()),
    warrantyMonths: v.optional(v.number()),
    warrantyExpires: v.optional(v.string()),
    warrantyNotes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  })
    .index("by_home", ["homeId"])
    .index("by_system", ["systemId"])
    .index("by_home_date", ["homeId", "eventDate"])
    .index("by_incident", ["incidentId"]),

  /**
   * Line items for service events
   */
  serviceLineItems: defineTable({
    serviceEventId: v.id("homeownerServiceEvents"),
    category: lineItemCategory,
    description: v.string(),
    amount: v.number(),
    quantity: v.optional(v.number()),
  })
    .index("by_event", ["serviceEventId"]),

  /**
   * Quotes from service providers
   */
  quotes: defineTable({
    homeId: v.id("homes"),
    incidentId: v.optional(v.id("incidents")),
    packetId: v.optional(v.id("homePackets")),
    providerName: v.string(),
    providerPhone: v.optional(v.string()),
    quoteDate: v.string(),
    expiresAt: v.optional(v.string()),
    scope: v.string(),
    lineItemsText: v.optional(v.string()),
    totalAmount: v.number(),
    warrantyOffered: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: quoteStatus,
    acceptedAt: v.optional(v.number()),
    serviceEventId: v.optional(v.id("homeownerServiceEvents")),
  })
    .index("by_home", ["homeId"])
    .index("by_incident", ["incidentId"])
    .index("by_packet", ["packetId"])
    .index("by_home_status", ["homeId", "status"]),

  // =====================================================
  // AI INTELLIGENCE LAYER TABLES
  // =====================================================

  /**
   * Conversations — Chat threads between user and AI advisor
   */
  conversations: defineTable({
    homeId: v.id("homes"),
    userId: v.id("userProfiles"),
    title: v.string(),
    status: v.union(v.literal("active"), v.literal("archived")),
    referencedSystemIds: v.optional(v.array(v.id("systems"))),
    lastMessageAt: v.number(),
    
    // Cross-system links
    troubleshootingSessionId: v.optional(v.id("troubleshootingSessions")),
    primaryTopic: v.optional(v.string()),
    resolution: v.optional(v.union(
      v.literal("resolved"),
      v.literal("referred_to_pro"),
      v.literal("care_task_created"),
      v.literal("ongoing"),
      v.literal("abandoned")
    )),
    rating: v.optional(v.number()), // 1-5
  })
    .index("by_home", ["homeId", "status", "lastMessageAt"])
    .index("by_user", ["userId", "status"]),

  /**
   * Messages — Individual messages within a conversation
   */
  aiMessages: defineTable({
    conversationId: v.id("conversations"),
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("system")
    ),
    content: v.string(),
    references: v.optional(v.array(v.object({
      type: v.union(
        v.literal("system"),
        v.literal("forecast"),
        v.literal("document"),
        v.literal("action_item"),
        v.literal("care_task"),
        v.literal("troubleshooting_guide")
      ),
      id: v.string(),
      label: v.string(),
      snippet: v.optional(v.string()),
    }))),
    suggestedActions: v.optional(v.array(v.object({
      type: v.union(
        v.literal("upload_photo"),
        v.literal("schedule_maintenance"),
        v.literal("view_forecast"),
        v.literal("view_document"),
        v.literal("contact_professional"),
        v.literal("request_analysis"),
        v.literal("start_troubleshooting"),
        v.literal("view_care_task"),
        v.literal("start_replacement"),
        v.literal("start_journey"),
        v.literal("update_diagnosis"),
        v.literal("advance_phase"),
        v.literal("show_packet_selector")
      ),
      label: v.string(),
      metadata: v.optional(v.any()),
    }))),
    tokenUsage: v.optional(v.object({
      inputTokens: v.number(),
      outputTokens: v.number(),
      model: v.string(),
    })),

    // Structured content for interactive UI blocks (replacement flow, etc.)
    structuredContent: v.optional(v.object({
      type: v.string(), // "replacement_assessment" | "decision_step" | "replacement_recommendation" | "replacement_action_plan"
      payload: v.any(), // Typed payload rendered by the frontend
    })),

    createdAt: v.number(),
  })
    .index("by_conversation", ["conversationId", "createdAt"]),

  /**
   * AI Insights — Proactive intelligence pushed to dashboard
   */
  aiInsights: defineTable({
    homeId: v.id("homes"),
    userId: v.id("userProfiles"),
    type: v.union(
      v.literal("maintenance_reminder"),
      v.literal("condition_alert"),
      v.literal("cost_forecast"),
      v.literal("seasonal_tip"),
      v.literal("warranty_expiring"),
      v.literal("upload_suggestion"),
      v.literal("efficiency_tip")
    ),
    title: v.string(),
    body: v.string(),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    relatedSystemId: v.optional(v.id("systems")),
    suggestedAction: v.optional(v.object({
      type: v.string(),
      label: v.string(),
      metadata: v.optional(v.any()),
    })),
    isRead: v.boolean(),
    isDismissed: v.boolean(),
    expiresAt: v.optional(v.number()),
    generatedAt: v.number(),
  })
    .index("by_home_active", ["homeId", "isDismissed", "priority"])
    .index("by_home_unread", ["homeId", "isRead"]),

  /**
   * Walkthrough Sessions — AI-assisted onboarding via photo analysis
   */
  walkthroughSessions: defineTable({
    homeId: v.id("homes"),
    userId: v.id("userProfiles"),
    status: v.union(
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("abandoned")
    ),
    completedAreas: v.optional(v.array(v.object({
      area: v.string(),
      photosAnalyzed: v.number(),
      systemsDetected: v.array(v.object({
        systemType: v.string(),
        name: v.string(),
        confidence: v.number(),
        details: v.optional(v.any()),
        confirmed: v.boolean(),
      })),
    }))),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_home", ["homeId"])
    .index("by_user_status", ["userId", "status"]),

  // =====================================================
  // CPSC RECALL ALERTS
  // =====================================================

  /**
   * Recall Alerts — CPSC recall matches for user equipment
   */
  recallAlerts: defineTable({
    systemId: v.id("systems"),
    homeId: v.id("homes"),

    // CPSC recall data
    recallNumber: v.string(),
    recallDate: v.string(),
    productName: v.string(),
    description: v.string(),
    hazardDescription: v.string(),
    remedyDescription: v.string(),
    recallUrl: v.optional(v.string()),

    // Match quality
    matchScore: v.number(), // 0.0–1.0 fuzzy match confidence
    matchedOn: v.string(),  // What field matched (e.g., "brand+product")

    // User-facing state
    isRead: v.boolean(),
    isDismissed: v.boolean(),

    checkedAt: v.number(),
  })
    .index("by_system", ["systemId"])
    .index("by_home", ["homeId", "isDismissed"])
    .index("by_recall_number", ["recallNumber"]),

  // ============================================================
  // SYSTEM CATEGORIES — Master list of home system types
  // ============================================================
  systemCategories: defineTable({
    key: v.string(),
    name: v.string(),
    description: v.string(),
    icon: v.string(),
    sortOrder: v.number(),
    subsystems: v.array(v.string()),
  }).index("by_key", ["key"]),

  // ============================================================
  // COMPONENT TEMPLATES — Every component type with Weibull params
  // ============================================================
  componentTemplates: defineTable({
    key: v.string(),
    systemCategory: v.string(),
    subsystem: v.string(),
    name: v.string(),
    description: v.string(),
    commonBrands: v.array(v.string()),
    weibull: v.object({
      shape: v.number(),
      scale: v.number(),
      medianLifespan: v.number(),
      p10Life: v.number(),
      p90Life: v.number(),
      dataSource: v.string(),
      notes: v.string(),
    }),
    costRange: v.object({
      replacementLow: v.number(),
      replacementHigh: v.number(),
      replacementMedian: v.number(),
      laborPercent: v.number(),
      year: v.number(),
      notes: v.string(),
    }),
    regionalAdjustments: v.object({
      hotHumid: v.object({ scaleMultiplier: v.number(), reason: v.string() }),
      hotDry: v.object({ scaleMultiplier: v.number(), reason: v.string() }),
      coldHarsh: v.object({ scaleMultiplier: v.number(), reason: v.string() }),
      coldModerate: v.object({ scaleMultiplier: v.number(), reason: v.string() }),
      marine: v.object({ scaleMultiplier: v.number(), reason: v.string() }),
      mixed: v.object({ scaleMultiplier: v.number(), reason: v.string() }),
    }),
    efficiencyRatings: v.optional(v.object({
      metric: v.string(),
      minimumCode: v.number(),
      goodRating: v.number(),
      excellentRating: v.number(),
      notes: v.string(),
    })),
    fuelType: v.optional(v.string()),
    typicalCapacities: v.optional(v.array(v.string())),
    warrantyCoverage: v.optional(v.object({
      typicalPartsYears: v.number(),
      typicalLaborYears: v.number(),
      extendedAvailable: v.boolean(),
      notes: v.string(),
    })),
    criticality: v.union(
      v.literal("critical"),
      v.literal("high"),
      v.literal("medium"),
      v.literal("low")
    ),
    tags: v.array(v.string()),
  })
    .index("by_key", ["key"])
    .index("by_system", ["systemCategory"]),

  // ============================================================
  // MAINTENANCE TASKS — Complete task library per component
  // ============================================================
  maintenanceTasks: defineTable({
    key: v.string(),
    componentTemplateKey: v.string(),
    systemCategory: v.string(),
    name: v.string(),
    description: v.string(),
    whyItMatters: v.string(),
    instructions: v.array(v.string()),
    frequency: v.object({
      intervalMonths: v.number(),
      seasonalAdjustments: v.optional(v.any()),
      triggerConditions: v.optional(v.array(v.string())),
    }),
    difficulty: v.union(
      v.literal("easy"),
      v.literal("moderate"),
      v.literal("advanced"),
      v.literal("professional")
    ),
    diyFriendly: v.boolean(),
    estimatedMinutes: v.number(),
    toolsRequired: v.array(v.string()),
    materialsCost: v.object({ low: v.number(), high: v.number() }),
    professionalCost: v.object({ low: v.number(), high: v.number() }),
    skipConsequences: v.object({
      shortTerm: v.string(),
      longTerm: v.string(),
      costOfNeglect: v.string(),
    }),
    safetyNotes: v.array(v.string()),
    seasonalRelevance: v.array(v.string()),
    priority: v.union(
      v.literal("critical"),
      v.literal("high"),
      v.literal("medium"),
      v.literal("low")
    ),
    tags: v.array(v.string()),
  })
    .index("by_key", ["key"])
    .index("by_component", ["componentTemplateKey"])
    .index("by_system", ["systemCategory"]),

  // ============================================================
  // REGIONAL PROFILES — US climate zones
  // ============================================================
  regionalProfiles: defineTable({
    key: v.string(),
    name: v.string(),
    climateZones: v.array(v.string()),
    states: v.array(v.string()),
    majorCities: v.array(v.string()),
    climate: v.object({
      avgSummerHighF: v.number(),
      avgWinterLowF: v.number(),
      avgAnnualRainfallInches: v.number(),
      avgHumidityPercent: v.number(),
      heatingDegreeDays: v.number(),
      coolingDegreeDays: v.number(),
    }),
    environmentalStressors: v.array(v.object({
      factor: v.string(),
      severity: v.union(
        v.literal("extreme"),
        v.literal("high"),
        v.literal("moderate"),
        v.literal("low")
      ),
      description: v.string(),
      affectedSystems: v.array(v.string()),
    })),
    seasonalProfile: v.object({
      spring: v.object({
        months: v.array(v.string()),
        conditions: v.string(),
        priorities: v.array(v.string()),
      }),
      summer: v.object({
        months: v.array(v.string()),
        conditions: v.string(),
        priorities: v.array(v.string()),
      }),
      fall: v.object({
        months: v.array(v.string()),
        conditions: v.string(),
        priorities: v.array(v.string()),
      }),
      winter: v.object({
        months: v.array(v.string()),
        conditions: v.string(),
        priorities: v.array(v.string()),
      }),
    }),
    buildingCodeNotes: v.array(v.string()),
    insuranceConsiderations: v.array(v.string()),
    weibullZoneKey: v.string(),
  }).index("by_key", ["key"]),

  // ============================================================
  // TROUBLESHOOTING TREES
  // ============================================================
  troubleshootingTrees: defineTable({
    key: v.string(),
    systemCategory: v.string(),
    symptom: v.string(),
    urgency: v.union(
      v.literal("emergency"),
      v.literal("urgent"),
      v.literal("moderate"),
      v.literal("low")
    ),
    safetyWarning: v.optional(v.string()),
    steps: v.array(v.object({
      id: v.string(),
      question: v.string(),
      context: v.optional(v.string()),
      options: v.array(v.object({
        answer: v.string(),
        nextStepId: v.optional(v.string()),
        diagnosis: v.optional(v.string()),
        severity: v.optional(v.string()),
        action: v.optional(v.string()),
        estimatedCost: v.optional(v.string()),
        professional: v.optional(v.boolean()),
      })),
    })),
    relatedProblems: v.array(v.string()),
    tags: v.array(v.string()),
  })
    .index("by_key", ["key"])
    .index("by_system", ["systemCategory"]),

  // =====================================================
  // REPLACEMENT SESSIONS — Guided replacement planning flows
  // =====================================================

  replacementSessions: defineTable({
    homeId: v.id("homes"),
    systemId: v.id("systems"),
    conversationId: v.id("conversations"),
    userId: v.id("userProfiles"),
    systemType: v.string(), // e.g. "water_heater", "central_ac", "furnace"

    status: v.union(
      v.literal("assessing"),
      v.literal("deciding"),
      v.literal("recommended"),
      v.literal("planned"),
      v.literal("completed"),
      v.literal("abandoned")
    ),

    // Decision tree state
    currentStep: v.number(),
    decisions: v.array(v.object({
      stepId: v.string(),
      question: v.string(),
      selectedOption: v.string(),
      selectedValue: v.string(),
      timestamp: v.number(),
    })),

    // Assessment data (populated at session start)
    assessment: v.optional(v.object({
      systemName: v.string(),
      systemAge: v.number(),
      healthScore: v.number(),
      failureProbability1yr: v.number(),
      triggerReason: v.string(),
      conditionSignals: v.array(v.string()),
    })),

    // Final recommendation (populated after decision tree completes)
    recommendation: v.optional(v.object({
      productType: v.string(),
      specificProduct: v.optional(v.string()),
      estimatedCost: v.object({ low: v.number(), high: v.number() }),
      estimatedLifespan: v.object({ low: v.number(), high: v.number() }),
      annualSavings: v.optional(v.number()),
      rationale: v.string(),
      alternative: v.optional(v.object({
        productType: v.string(),
        estimatedCost: v.object({ low: v.number(), high: v.number() }),
        tradeoffNote: v.string(),
      })),
    })),

    // Action plan (populated after recommendation accepted)
    actionPlan: v.optional(v.array(v.object({
      stepId: v.string(),
      label: v.string(),
      actionType: v.string(),
      completed: v.boolean(),
      completedAt: v.optional(v.number()),
    }))),

    // Financial context
    financialContext: v.optional(v.object({
      emergencySavings: v.optional(v.string()),
      rebateInfo: v.optional(v.string()),
      financingNote: v.optional(v.string()),
    })),

    startedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_home", ["homeId"])
    .index("by_system", ["systemId"])
    .index("by_conversation", ["conversationId"])
    .index("by_user", ["userId"]),

  // =====================================================
  // TROUBLESHOOTING SESSIONS — Track user paths through diagnostic trees
  // =====================================================

  troubleshootingSessions: defineTable({
    userId: v.id("userProfiles"),
    diagnosticTreeId: v.id("diagnosticTrees"),
    homeId: v.id("homes"),
    systemId: v.optional(v.id("systems")),

    // Path tracking
    nodesVisited: v.array(v.object({
      nodeKey: v.string(),
      selectedOption: v.optional(v.string()),
      timestamp: v.number(),
    })),

    // Outcome
    finalNodeKey: v.optional(v.string()),
    outcome: v.optional(v.union(
      v.literal("resolved_diy"),
      v.literal("scheduled_pro"),
      v.literal("escalated_to_advisor"),
      v.literal("abandoned"),
      v.literal("in_progress")
    )),

    // Feedback
    wasHelpful: v.optional(v.boolean()),
    feedbackNote: v.optional(v.string()),

    startedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_tree", ["diagnosticTreeId"])
    .index("by_home", ["homeId"]),

  // =====================================================
  // SERVICE JOURNEYS — Full lifecycle engine for home issues
  // =====================================================

  serviceJourneys: defineTable({
    homeId: v.id("homes"),
    systemId: v.id("systems"),
    conversationId: v.id("conversations"),
    userId: v.id("userProfiles"),
    systemType: v.string(), // e.g. "water_heater", "central_ac"

    // Journey state machine
    status: v.union(
      v.literal("triaging"),           // Phase 1: asking diagnostic questions
      v.literal("diagnosed"),          // Phase 1 complete: diagnosis card shown
      v.literal("diy_in_progress"),    // Phase 2: walking through DIY steps
      v.literal("diy_completed"),      // Phase 2: DIY attempted
      v.literal("prep_service_call"),  // Phase 3: preparing for tech visit
      v.literal("awaiting_service"),   // Phase 3: prep done, waiting for appointment
      v.literal("post_service"),       // Phase 4: debriefing after service call
      v.literal("planning_replacement"), // Phase 5: in replacement decision tree
      v.literal("executing_replacement"), // Phase 5: action plan in progress
      v.literal("resolved"),           // Issue resolved
      v.literal("monitoring")          // Handed off to ongoing monitoring
    ),

    // Phase 1: Triage / Diagnosis
    diagnosis: v.optional(v.object({
      likelyCause: v.string(),
      severity: v.union(
        v.literal("low"),
        v.literal("moderate"),
        v.literal("high"),
        v.literal("emergency")
      ),
      urgencyNote: v.string(),
      isDiyAppropriate: v.boolean(),
      diagnosticAnswers: v.array(v.object({
        question: v.string(),
        answer: v.string(),
        timestamp: v.number(),
      })),
    })),

    // Phase 2: DIY
    diyAttempt: v.optional(v.object({
      guideSlug: v.optional(v.string()), // Reference to hardcoded guide
      stepsTotal: v.number(),
      stepsCompleted: v.number(),
      currentStep: v.number(),
      outcome: v.optional(v.union(
        v.literal("resolved"),
        v.literal("not_resolved"),
        v.literal("abandoned")
      )),
      completedAt: v.optional(v.number()),
    })),

    // Phase 3: Service Call Prep
    serviceCallPrep: v.optional(v.object({
      questionsGenerated: v.boolean(),
      redFlagsGenerated: v.boolean(),
      expectedCostRange: v.optional(v.object({
        low: v.number(),
        high: v.number(),
      })),
      appointmentReminder: v.optional(v.number()),
    })),

    // Phase 4: Post-Service
    serviceRecord: v.optional(v.object({
      providerName: v.string(),
      technicianName: v.optional(v.string()),
      date: v.number(),
      cost: v.number(),
      workPerformed: v.array(v.string()),
      techNotes: v.optional(v.string()),
      documents: v.array(v.id("_storage")),
      extractedData: v.optional(v.object({
        partsUsed: v.optional(v.array(v.string())),
        warrantyInfo: v.optional(v.string()),
        modelSerial: v.optional(v.string()),
      })),
      forecastUpdated: v.boolean(),
    })),

    // Phase 5: Replacement (links to existing replacementSession)
    replacementSessionId: v.optional(v.id("replacementSessions")),

    // Quote comparison
    quotes: v.optional(v.array(v.object({
      id: v.string(), // unique quote id
      providerName: v.string(),
      unitQuoted: v.string(),
      totalCost: v.number(),
      breakdown: v.optional(v.object({
        labor: v.optional(v.string()),
        permit: v.optional(v.string()),
        disposal: v.optional(v.string()),
      })),
      laborWarranty: v.optional(v.string()),
      documentId: v.optional(v.id("_storage")),
      isChosen: v.boolean(),
    }))),

    // Lifecycle timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
    resolvedAt: v.optional(v.number()),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_home", ["homeId"])
    .index("by_system", ["systemId"])
    .index("by_user", ["userId"]),

  // ====================================================================
  // PORTFOLIO / PROPERTY MANAGER TABLES
  // ====================================================================

  portfolioAccounts: defineTable({
    name: v.string(),
    ownerId: v.id("userProfiles"),
    subscriptionStatus: v.string(),
    plan: v.string(),
    seatLimit: v.number(),
    currentSeats: v.number(),
    supportEmail: v.optional(v.string()),
    supportPhone: v.optional(v.string()),
    website: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
  })
    .index("by_owner", ["ownerId"]),

  portfolioMembers: defineTable({
    portfolioId: v.id("portfolioAccounts"),
    userId: v.id("userProfiles"),
    role: v.string(),
    invitedAt: v.number(),
    acceptedAt: v.optional(v.number()),
    isActive: v.boolean(),
  })
    .index("by_portfolio", ["portfolioId"])
    .index("by_user", ["userId"]),

  properties: defineTable({
    portfolioId: v.id("portfolioAccounts"),
    name: v.string(),
    addressLine1: v.string(),
    addressLine2: v.optional(v.string()),
    city: v.string(),
    state: v.string(),
    zipCode: v.string(),
    propertyType: v.optional(v.string()),
    yearBuilt: v.optional(v.number()),
    totalUnits: v.number(),
    activeUnits: v.number(),
    isArchived: v.boolean(),
  })
    .index("by_portfolio", ["portfolioId"])
    .index("by_portfolio_active", ["portfolioId", "isArchived"]),

  units: defineTable({
    propertyId: v.id("properties"),
    portfolioId: v.id("portfolioAccounts"),
    unitLabel: v.string(),
    ownerEmail: v.optional(v.string()),
    ownerName: v.optional(v.string()),
    ownerUserId: v.optional(v.id("userProfiles")),
    homeId: v.optional(v.id("homes")),
    status: v.string(),
    floor: v.optional(v.number()),
    bedrooms: v.optional(v.number()),
    bathrooms: v.optional(v.number()),
    squareFootage: v.optional(v.number()),
    notes: v.optional(v.string()),
  })
    .index("by_property", ["propertyId"])
    .index("by_portfolio", ["portfolioId"]),

  ownerInvites: defineTable({
    unitId: v.id("units"),
    portfolioId: v.id("portfolioAccounts"),
    email: v.string(),
    ownerName: v.optional(v.string()),
    token: v.string(),
    expiresAt: v.number(),
    invitedByUserId: v.id("userProfiles"),
    acceptedAt: v.optional(v.number()),
    reminderSentAt: v.optional(v.number()),
    reminderCount: v.number(),
  })
    .index("by_unit", ["unitId"])
    .index("by_token", ["token"]),

  billingPlans: defineTable({
    portfolioId: v.id("portfolioAccounts"),
    basePrice: v.number(),
    perOwnerPrice: v.number(),
    ownerCount: v.number(),
    billingInterval: v.string(),
    nextBillDate: v.number(),
    lastBillDate: v.optional(v.number()),
    lastBillAmount: v.optional(v.number()),
  })
    .index("by_portfolio", ["portfolioId"]),

  vendors: defineTable({
    portfolioId: v.id("portfolioAccounts"),
    companyName: v.string(),
    contactName: v.optional(v.string()),
    email: v.string(),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    specialties: v.array(v.string()),
    serviceArea: v.optional(v.array(v.string())),
    isInsured: v.boolean(),
    isLicensed: v.boolean(),
    insuranceExpiry: v.optional(v.string()),
    licenseNumber: v.optional(v.string()),
    licenseExpiry: v.optional(v.string()),
    w9OnFile: v.boolean(),
    coiOnFile: v.boolean(),
    defaultHourlyRate: v.optional(v.number()),
    minimumServiceFee: v.optional(v.number()),
    emergencyRateMultiplier: v.optional(v.number()),
    isActive: v.boolean(),
    isPreferred: v.boolean(),
    notes: v.optional(v.string()),
    totalJobs: v.number(),
    completedJobs: v.number(),
    avgRating: v.optional(v.number()),
  })
    .index("by_portfolio", ["portfolioId"])
    .index("by_portfolio_active", ["portfolioId", "isActive"])
    .index("by_email", ["email"]),

  vendorMembers: defineTable({
    vendorId: v.id("vendors"),
    userId: v.optional(v.id("userProfiles")),
    name: v.string(),
    email: v.optional(v.string()),
    role: v.optional(v.string()),
  })
    .index("by_vendor", ["vendorId"]),

  vendorInvites: defineTable({
    portfolioId: v.id("portfolioAccounts"),
    invitedByUserId: v.id("userProfiles"),
    email: v.string(),
    companyName: v.string(),
    token: v.string(),
    expiresAt: v.number(),
    acceptedAt: v.optional(v.number()),
  })
    .index("by_portfolio", ["portfolioId"])
    .index("by_email", ["email"]),

  vendorRatings: defineTable({
    vendorId: v.id("vendors"),
    workOrderId: v.id("workOrders"),
    ratedByUserId: v.id("userProfiles"),
    overallRating: v.number(),
    qualityRating: v.optional(v.number()),
    timelinesRating: v.optional(v.number()),
    communicationRating: v.optional(v.number()),
    valueRating: v.optional(v.number()),
    comment: v.optional(v.string()),
    wouldRecommend: v.optional(v.boolean()),
    isPublic: v.boolean(),
  })
    .index("by_vendor", ["vendorId"]),

  quoteRequests: defineTable({
    portfolioId: v.id("portfolioAccounts"),
    workOrderId: v.optional(v.id("workOrders")),
    createdByUserId: v.id("userProfiles"),
    title: v.string(),
    description: v.string(),
    category: v.string(),
    priority: v.string(),
    homeId: v.id("homes"),
    unitId: v.optional(v.id("units")),
    systemId: v.optional(v.id("systems")),
    neededByDate: v.optional(v.string()),
    preferredWindow: v.optional(v.object({
      startDate: v.string(),
      endDate: v.string(),
    })),
    targetVendorIds: v.optional(v.array(v.id("vendors"))),
    broadcastToAll: v.boolean(),
    status: v.string(),
    expiresAt: v.number(),
  })
    .index("by_portfolio", ["portfolioId"]),

  vendorQuotes: defineTable({
    quoteRequestId: v.id("quoteRequests"),
    vendorId: v.id("vendors"),
    submittedByUserId: v.id("userProfiles"),
    totalAmount: v.number(),
    laborCost: v.optional(v.number()),
    materialCost: v.optional(v.number()),
    taxAmount: v.optional(v.number()),
    lineItems: v.optional(v.array(v.object({
      description: v.string(),
      quantity: v.optional(v.number()),
      unitPrice: v.optional(v.number()),
      amount: v.number(),
    }))),
    estimatedDuration: v.optional(v.string()),
    availableStartDate: v.optional(v.string()),
    validUntil: v.optional(v.string()),
    warrantyTerms: v.optional(v.string()),
    paymentTerms: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.string(),
    acceptedAt: v.optional(v.number()),
    declineReason: v.optional(v.string()),
  })
    .index("by_quoteRequest", ["quoteRequestId"]),

  workOrders: defineTable({
    managerId: v.id("userProfiles"),
    portfolioId: v.optional(v.id("portfolioAccounts")),
    homeId: v.id("homes"),
    unitId: v.optional(v.id("units")),
    systemId: v.optional(v.id("systems")),
    incidentId: v.optional(v.id("incidents")),
    packetId: v.optional(v.id("homePackets")),
    serviceRequestId: v.optional(v.id("serviceRequests")),
    serviceEventId: v.optional(v.id("homeownerServiceEvents")),
    workerId: v.optional(v.id("maintenanceWorkers")),
    assignedVendorId: v.optional(v.id("vendors")),
    taskId: v.optional(v.id("scheduledMaintenance")),
    category: v.string(),
    status: v.string(),
    priority: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    scheduledDate: v.optional(v.string()),
    scheduledTime: v.optional(v.string()),
    completedDate: v.optional(v.string()),
    preferredWindow: v.optional(v.object({
      startDate: v.string(),
      endDate: v.string(),
      timePreference: v.optional(v.string()),
    })),
    accessNotes: v.optional(v.string()),
    contactOnSite: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    estimatedHours: v.optional(v.number()),
    actualHours: v.optional(v.number()),
    hourlyRateSnapshot: v.optional(v.number()),
    materialCost: v.optional(v.number()),
    laborCost: v.optional(v.number()),
    totalCost: v.optional(v.number()),
    partsUsed: v.optional(v.array(v.object({
      name: v.string(),
      quantity: v.number(),
      cost: v.optional(v.number()),
    }))),
    vendorInvoiceNumber: v.optional(v.string()),
    resolutionSummary: v.optional(v.string()),
    notes: v.optional(v.string()),
    internalNotes: v.optional(v.string()),
    slaTargetAt: v.optional(v.number()),
    slaMet: v.optional(v.boolean()),
  })
    .index("by_manager_status", ["managerId"])
    .index("by_home", ["homeId"])
    .index("by_assignedVendor", ["assignedVendorId"])
    .index("by_portfolio", ["portfolioId"]),

  workOrderEvents: defineTable({
    workOrderId: v.id("workOrders"),
    userId: v.id("userProfiles"),
    eventType: v.string(),
    previousValue: v.optional(v.string()),
    newValue: v.optional(v.string()),
    note: v.optional(v.string()),
    metadata: v.optional(v.any()),
  })
    .index("by_workOrder", ["workOrderId"]),

  workOrderAttachments: defineTable({
    workOrderId: v.id("workOrders"),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.optional(v.number()),
    uploadedByUserId: v.id("userProfiles"),
  })
    .index("by_workOrder", ["workOrderId"]),

  maintenanceWorkers: defineTable({
    managerId: v.id("userProfiles"),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    type: v.string(),
    specialties: v.optional(v.array(v.string())),
    defaultHourlyRate: v.optional(v.number()),
    isActive: v.boolean(),
  })
    .index("by_manager_active", ["managerId", "isActive"]),

  organizationSettings: defineTable({
    managerId: v.id("userProfiles"),
    companyName: v.optional(v.string()),
    defaultLaborRate: v.optional(v.number()),
    defaultMaterialMarkup: v.optional(v.number()),
    inflationRateOverride: v.optional(v.number()),
    activeHomeownerSeats: v.optional(v.number()),
    activeTenantSeats: v.optional(v.number()),
  })
    .index("by_manager", ["managerId"]),

  commonAreas: defineTable({
    managerId: v.id("userProfiles"),
    name: v.string(),
    propertyGroup: v.optional(v.string()),
    isArchived: v.boolean(),
  })
    .index("by_manager", ["managerId"]),

  serviceNotices: defineTable({
    managerId: v.id("userProfiles"),
    title: v.string(),
    body: v.string(),
    noticeType: v.string(),
    targetType: v.string(),
    targetIds: v.array(v.string()),
    deliveryChannels: v.array(v.string()),
    scheduledFor: v.optional(v.number()),
    sentAt: v.optional(v.number()),
    totalRecipients: v.number(),
    deliveredCount: v.number(),
  })
    .index("by_manager", ["managerId"]),

  notificationDeliveries: defineTable({
    noticeId: v.id("serviceNotices"),
    recipientId: v.id("userProfiles"),
    channel: v.string(),
    status: v.string(),
    deliveredAt: v.optional(v.number()),
    readAt: v.optional(v.any()),
  })
    .index("by_notice", ["noticeId"])
    .index("by_recipient", ["recipientId"])
    .index("by_recipient_unread", ["recipientId", "readAt"]),

  serviceLinks: defineTable({
    linkId: v.string(),
    propertyId: v.id("homes"),
    managerId: v.id("userProfiles"),
    type: v.string(),
    startsAt: v.number(),
    expiresAt: v.optional(v.number()),
    isRevoked: v.boolean(),
    usedAt: v.optional(v.number()),
    renterName: v.optional(v.string()),
    renterEmail: v.optional(v.string()),
    renterPhone: v.optional(v.string()),
    unitLabel: v.optional(v.string()),
    createdAt: v.number(),
    lastAccessedAt: v.optional(v.number()),
    accessCount: v.number(),
  })
    .index("by_linkId", ["linkId"])
    .index("by_propertyId", ["propertyId"])
    .index("by_managerId", ["managerId"]),

  serviceRequests: defineTable({
    homeId: v.id("homes"),
    submittedBy: v.optional(v.id("userProfiles")),
    managerId: v.optional(v.id("userProfiles")),
    linkId: v.optional(v.string()),
    systemId: v.optional(v.id("systems")),
    category: v.string(),
    priority: v.string(),
    title: v.string(),
    description: v.string(),
    photoStorageIds: v.optional(v.array(v.id("_storage"))),
    status: v.string(),
    assignedWorkerId: v.optional(v.id("maintenanceWorkers")),
    workOrderId: v.optional(v.id("workOrders")),
    pmNotes: v.optional(v.string()),
    resolutionSummary: v.optional(v.string()),
    resolvedAt: v.optional(v.number()),
    // Renter portal fields
    renterName: v.optional(v.string()),
    renterEmail: v.optional(v.string()),
    renterPhone: v.optional(v.string()),
    unitLabel: v.optional(v.string()),
    area: v.optional(v.string()),
    urgency: v.optional(v.string()),
    availableTimes: v.optional(v.string()),
    permissionToEnter: v.optional(v.boolean()),
    // AI triage results
    aiTriage: v.optional(v.object({
      priorityScore: v.number(),
      priorityLevel: v.string(),
      systemHealthConcern: v.number(),
      experienceConcern: v.number(),
      matchedSystemId: v.optional(v.id("systems")),
      matchedSystemName: v.optional(v.string()),
      matchedSystemHealth: v.optional(v.number()),
      reasoning: v.string(),
      recommendation: v.string(),
      estimatedCost: v.optional(v.string()),
      suggestedTimeline: v.string(),
      autoScheduled: v.boolean(),
    })),
    updatedAt: v.optional(v.number()),
  })
    .index("by_home", ["homeId"])
    .index("by_submitter", ["submittedBy"])
    .index("by_managerId", ["managerId"])
    .index("by_linkId", ["linkId"])
    .index("by_status", ["status"]),

  responsibilityRules: defineTable({
    managerId: v.id("userProfiles"),
    scope: v.string(),
    scopeId: v.optional(v.string()),
    maintenanceTemplateId: v.optional(v.id("maintenanceTaskTemplates")),
    systemTypeId: v.optional(v.id("systemTypes")),
    responsibleParty: v.string(),
    ownerPercent: v.optional(v.number()),
    createdAt: v.optional(v.number()),
  })
    .index("by_manager", ["managerId"]),

  memberInvites: defineTable({
    managerId: v.id("userProfiles"),
    homeId: v.id("homes"),
    email: v.string(),
    role: v.string(),
    inviteToken: v.string(),
    expiresAt: v.number(),
    acceptedAt: v.optional(v.number()),
  })
    .index("by_manager", ["managerId"])
    .index("by_email", ["email"])
    .index("by_token", ["inviteToken"]),

  managedMembers: defineTable({
    managerId: v.id("userProfiles"),
    memberId: v.id("userProfiles"),
    homeId: v.id("homes"),
    role: v.string(),
    monthlyRate: v.optional(v.number()),
    status: v.string(),
    invitedAt: v.optional(v.number()),
    activatedAt: v.optional(v.number()),
  })
    .index("by_manager", ["managerId"])
    .index("by_manager_status", ["managerId", "status"])
    .index("by_member", ["memberId"])
    .index("by_home", ["homeId"]),

  availabilityRules: defineTable({
    portfolioId: v.id("portfolioAccounts"),
    name: v.string(),
    dayOfWeek: v.number(),
    startTime: v.string(),
    endTime: v.string(),
    slotDurationMinutes: v.number(),
    bufferMinutes: v.number(),
    maxAppointmentsPerSlot: v.number(),
    appliesToType: v.string(),
    workerId: v.optional(v.id("maintenanceWorkers")),
    vendorId: v.optional(v.id("vendors")),
    isActive: v.boolean(),
  })
    .index("by_portfolio", ["portfolioId"]),

  availabilityBlocks: defineTable({
    portfolioId: v.id("portfolioAccounts"),
    blockType: v.string(),
    title: v.optional(v.string()),
    startDate: v.string(),
    endDate: v.string(),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    isAllDay: v.boolean(),
    appliesToType: v.string(),
    workerId: v.optional(v.id("maintenanceWorkers")),
    vendorId: v.optional(v.id("vendors")),
    isRecurring: v.boolean(),
    notes: v.optional(v.string()),
  })
    .index("by_portfolio", ["portfolioId"]),

  appointments: defineTable({
    portfolioId: v.id("portfolioAccounts"),
    workOrderId: v.id("workOrders"),
    homeId: v.id("homes"),
    unitId: v.optional(v.id("units")),
    assigneeType: v.string(),
    workerId: v.optional(v.id("maintenanceWorkers")),
    vendorId: v.optional(v.id("vendors")),
    scheduledDate: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    durationMinutes: v.number(),
    status: v.string(),
    accessInstructions: v.optional(v.string()),
    contactName: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    internalNotes: v.optional(v.string()),
    customerNotes: v.optional(v.string()),
    confirmedByUserId: v.optional(v.id("userProfiles")),
    confirmedAt: v.optional(v.number()),
    confirmationNote: v.optional(v.string()),
    previousAppointmentId: v.optional(v.id("appointments")),
    rescheduleCount: v.number(),
    rescheduleReason: v.optional(v.string()),
  })
    .index("by_portfolio", ["portfolioId"])
    .index("by_workOrder", ["workOrderId"]),

  portfolioConversations: defineTable({
    portfolioId: v.id("portfolioAccounts"),
    contextType: v.string(),
    workOrderId: v.optional(v.id("workOrders")),
    unitId: v.optional(v.id("units")),
    subject: v.string(),
    status: v.string(),
    unreadCount: v.number(),
    lastMessageAt: v.optional(v.number()),
    lastMessagePreview: v.optional(v.string()),
  })
    .index("by_portfolio", ["portfolioId"])
    .index("by_workOrder", ["workOrderId"]),

  portfolioConversationParticipants: defineTable({
    conversationId: v.id("portfolioConversations"),
    userId: v.id("userProfiles"),
    role: v.string(),
    notifyEmail: v.boolean(),
    notifyInApp: v.boolean(),
    unreadCount: v.number(),
    isActive: v.boolean(),
    lastReadAt: v.optional(v.number()),
    leftAt: v.optional(v.number()),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_user", ["userId"]),

  portfolioMessages: defineTable({
    conversationId: v.id("portfolioConversations"),
    senderId: v.id("userProfiles"),
    content: v.string(),
    contentType: v.string(),
    attachments: v.optional(v.array(v.object({
      storageId: v.id("_storage"),
      fileName: v.string(),
      fileType: v.string(),
      fileSize: v.optional(v.number()),
    }))),
    isEdited: v.boolean(),
    isDeleted: v.boolean(),
  })
    .index("by_conversation", ["conversationId"]),

  // =========================================================
  // STR (SHORT-TERM RENTAL) TABLES
  // =========================================================

  bookings: defineTable({
    homeId: v.id("homes"),
    checkIn: v.string(),
    checkOut: v.string(),
    guestName: v.optional(v.string()),
    guestCount: v.optional(v.number()),
    platform: v.optional(v.union(
      v.literal("airbnb"),
      v.literal("vrbo"),
      v.literal("booking_com"),
      v.literal("direct"),
      v.literal("other")
    )),
    status: v.union(
      v.literal("confirmed"),
      v.literal("pending"),
      v.literal("cancelled"),
      v.literal("completed")
    ),
    externalId: v.optional(v.string()),
    notes: v.optional(v.string()),
    source: v.union(v.literal("manual"), v.literal("ical")),
    icalFeedId: v.optional(v.id("icalFeeds")),
  })
    .index("by_home", ["homeId"])
    .index("by_home_checkin", ["homeId", "checkIn"])
    .index("by_status", ["status"])
    .index("by_externalId", ["externalId"]),

  turnovers: defineTable({
    homeId: v.id("homes"),
    checkoutTime: v.string(),
    nextCheckinTime: v.string(),
    windowMinutes: v.number(),
    status: v.union(
      v.literal("upcoming"),
      v.literal("in_progress"),
      v.literal("completed")
    ),
    bookingBeforeId: v.optional(v.id("bookings")),
    bookingAfterId: v.optional(v.id("bookings")),
    notes: v.optional(v.string()),
  })
    .index("by_home", ["homeId"])
    .index("by_home_checkout", ["homeId", "checkoutTime"])
    .index("by_status", ["status"]),

  turnoverChecklists: defineTable({
    turnoverId: v.id("turnovers"),
    homeId: v.id("homes"),
    category: v.union(
      v.literal("cleaning"),
      v.literal("inspection"),
      v.literal("maintenance"),
      v.literal("aesthetic")
    ),
    name: v.string(),
    isCompleted: v.boolean(),
    completedAt: v.optional(v.number()),
    assignedTo: v.optional(v.string()),
    sortOrder: v.number(),
  })
    .index("by_turnover", ["turnoverId"])
    .index("by_home", ["homeId"]),

  icalFeeds: defineTable({
    homeId: v.id("homes"),
    ownerId: v.id("userProfiles"),
    platformName: v.string(),
    feedUrl: v.string(),
    lastSyncedAt: v.optional(v.number()),
    lastSyncStatus: v.optional(v.union(
      v.literal("success"),
      v.literal("error")
    )),
    lastSyncError: v.optional(v.string()),
    syncIntervalMinutes: v.number(),
    isActive: v.boolean(),
  })
    .index("by_home", ["homeId"])
    .index("by_active", ["isActive"]),

  hoaResponsibilities: defineTable({
    homeId: v.id("homes"),
    systemCategory: v.string(),
    responsibleParty: v.union(
      v.literal("owner"),
      v.literal("hoa"),
      v.literal("coa")
    ),
    notes: v.optional(v.string()),
  })
    .index("by_home", ["homeId"]),

  aestheticTaskTemplates: defineTable({
    category: v.union(
      v.literal("landscaping"),
      v.literal("exterior_cleaning"),
      v.literal("interior_aesthetics")
    ),
    name: v.string(),
    description: v.optional(v.string()),
    frequencyMonths: v.number(),
    seasonPreference: v.optional(v.string()),
    estimatedTimeMinutes: v.optional(v.number()),
    diyCostLow: v.optional(v.number()),
    diyCostHigh: v.optional(v.number()),
    proCostLow: v.optional(v.number()),
    proCostHigh: v.optional(v.number()),
  })
    .index("by_category", ["category"]),

  vendorAssignments: defineTable({
    homeId: v.id("homes"),
    taskCategory: v.string(),
    vendorId: v.optional(v.id("vendors")),
    vendorName: v.optional(v.string()),
    vendorPhone: v.optional(v.string()),
    vendorEmail: v.optional(v.string()),
    notes: v.optional(v.string()),
  })
    .index("by_home", ["homeId"])
    .index("by_home_category", ["homeId", "taskCategory"]),

  // ============================================================
  // Marketing & Automation Agents
  // ============================================================

  socialPosts: defineTable({
    platform: v.union(v.literal("facebook"), v.literal("instagram"), v.literal("x")),
    content: v.string(),
    hashtags: v.array(v.string()),
    mediaPrompt: v.optional(v.string()),
    status: v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("published"),
      v.literal("failed")
    ),
    scheduledFor: v.optional(v.number()),
    publishedAt: v.optional(v.number()),
    engagementData: v.optional(v.object({
      likes: v.number(),
      shares: v.number(),
      comments: v.number(),
    })),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_platform", ["platform", "status"]),

  contentCalendar: defineTable({
    weekOf: v.string(),
    theme: v.string(),
    pillar: v.union(
      v.literal("education"),
      v.literal("product"),
      v.literal("social_proof"),
      v.literal("engagement")
    ),
    posts: v.array(v.id("socialPosts")),
  })
    .index("by_weekOf", ["weekOf"]),

  answerPages: defineTable({
    slug: v.string(),
    question: v.string(),
    directAnswer: v.string(),
    fullContent: v.string(),
    metaTitle: v.string(),
    metaDescription: v.string(),
    schemaMarkup: v.string(),
    relatedQuestions: v.array(v.string()),
    category: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("updating")
    ),
    publishedAt: v.optional(v.number()),
    lastUpdated: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category"])
    .index("by_status", ["status"]),

  seoKeywords: defineTable({
    keyword: v.string(),
    searchVolume: v.optional(v.number()),
    difficulty: v.optional(v.number()),
    priority: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    answerId: v.optional(v.id("answerPages")),
    status: v.union(
      v.literal("queued"),
      v.literal("generating"),
      v.literal("published")
    ),
  })
    .index("by_status", ["status"]),

  reelProjects: defineTable({
    topic: v.string(),
    style: v.string(),
    script: v.optional(v.string()),
    voiceoverStorageId: v.optional(v.string()),
    visualAssets: v.optional(v.array(v.string())),
    finalVideoStorageId: v.optional(v.string()),
    status: v.union(
      v.literal("scripted"),
      v.literal("voiced"),
      v.literal("visual"),
      v.literal("assembled"),
      v.literal("published"),
      v.literal("failed")
    ),
    publishedTo: v.optional(v.array(v.string())),
    createdAt: v.number(),
  })
    .index("by_status", ["status"]),

  supportConversations: defineTable({
    userId: v.id("users"),
    messages: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
      content: v.string(),
      timestamp: v.number(),
    })),
    status: v.union(
      v.literal("active"),
      v.literal("resolved"),
      v.literal("escalated")
    ),
    escalatedAt: v.optional(v.number()),
    resolvedAt: v.optional(v.number()),
    category: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  supportKnowledgeBase: defineTable({
    topic: v.string(),
    content: v.string(),
    keywords: v.array(v.string()),
    category: v.string(),
  })
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["category"],
    }),

  // ============================================================
  // Weather Advisor — Trigger-Based Checklists
  // ============================================================

  weatherTriggers: defineTable({
    name: v.string(),
    description: v.string(),
    triggerType: v.union(
      v.literal("freeze_warning"),
      v.literal("heat_wave"),
      v.literal("hurricane_watch"),
      v.literal("heavy_rain"),
      v.literal("hail_warning"),
      v.literal("tornado_watch"),
      v.literal("snow_storm"),
      v.literal("ice_storm"),
      v.literal("high_wind"),
      v.literal("flooding"),
      v.literal("drought"),
      v.literal("wildfire_risk"),
      v.literal("extreme_cold"),
      v.literal("spring_thaw"),
      v.literal("humidity_alert")
    ),
    severity: v.union(
      v.literal("advisory"),
      v.literal("watch"),
      v.literal("warning"),
      v.literal("emergency")
    ),
    applicableRegions: v.array(v.string()),
    applicableStates: v.optional(v.array(v.string())),
    isActive: v.boolean(),
  })
    .index("by_type", ["triggerType"])
    .index("by_active", ["isActive"]),

  weatherChecklistTemplates: defineTable({
    triggerId: v.id("weatherTriggers"),
    triggerType: v.string(),
    title: v.string(),
    description: v.string(),
    tasks: v.array(v.object({
      title: v.string(),
      description: v.string(),
      priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
      category: v.string(),
      estimatedMinutes: v.number(),
      estimatedCost: v.optional(v.number()),
      pointsValue: v.number(),
      diyDifficulty: v.union(v.literal("easy"), v.literal("moderate"), v.literal("hard"), v.literal("professional")),
      proTip: v.optional(v.string()),
    })),
    preparationLeadDays: v.number(),
    climateZones: v.array(v.string()),
    createdAt: v.number(),
  })
    .index("by_trigger", ["triggerId"])
    .index("by_trigger_type", ["triggerType"]),

  weatherChecklistAlerts: defineTable({
    homeId: v.id("homes"),
    userId: v.id("userProfiles"),
    triggerId: v.id("weatherTriggers"),
    templateId: v.id("weatherChecklistTemplates"),
    triggerType: v.string(),
    severity: v.string(),
    weatherData: v.object({
      temperature: v.optional(v.number()),
      windSpeed: v.optional(v.number()),
      precipitation: v.optional(v.number()),
      humidity: v.optional(v.number()),
      forecast: v.string(),
      source: v.string(),
      alertTitle: v.string(),
    }),
    tasksGenerated: v.array(v.id("scheduledMaintenance")),
    status: v.union(
      v.literal("active"),
      v.literal("acknowledged"),
      v.literal("completed"),
      v.literal("expired")
    ),
    sentAt: v.number(),
    acknowledgedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    expiresAt: v.number(),
  })
    .index("by_home", ["homeId"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  // ============================================================
  // Gamification — Badges, Levels & Streaks
  // ============================================================

  badges: defineTable({
    name: v.string(),
    description: v.string(),
    iconName: v.string(),
    category: v.union(
      v.literal("milestone"),
      v.literal("streak"),
      v.literal("seasonal"),
      v.literal("weather"),
      v.literal("savings"),
      v.literal("system_mastery"),
      v.literal("community"),
      v.literal("special")
    ),
    requirement: v.object({
      type: v.string(),
      threshold: v.number(),
      metadata: v.optional(v.any()),
    }),
    pointsValue: v.number(),
    rarity: v.union(
      v.literal("common"),
      v.literal("uncommon"),
      v.literal("rare"),
      v.literal("epic"),
      v.literal("legendary")
    ),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_rarity", ["rarity"]),

  userBadges: defineTable({
    userId: v.id("userProfiles"),
    badgeId: v.id("badges"),
    earnedAt: v.number(),
    metadata: v.optional(v.any()),
  })
    .index("by_user", ["userId"])
    .index("by_badge", ["badgeId"])
    .index("by_user_badge", ["userId", "badgeId"]),

  userGameProfiles: defineTable({
    userId: v.id("userProfiles"),
    totalPoints: v.number(),
    currentLevel: v.number(),
    currentLevelName: v.string(),
    pointsToNextLevel: v.number(),
    currentStreak: v.number(),
    longestStreak: v.number(),
    totalTasksCompleted: v.number(),
    totalSavingsEstimated: v.number(),
    seasonalChallengePoints: v.number(),
    weeklyActivityCount: v.number(),
    lastActivityDate: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_points", ["totalPoints"])
    .index("by_level", ["currentLevel"]),

  pointTransactions: defineTable({
    userId: v.id("userProfiles"),
    points: v.number(),
    type: v.union(
      v.literal("task_completed"),
      v.literal("streak_bonus"),
      v.literal("badge_earned"),
      v.literal("weather_prep"),
      v.literal("seasonal_challenge"),
      v.literal("referral_bonus"),
      v.literal("health_score_improvement"),
      v.literal("first_system_added"),
      v.literal("onboarding_complete")
    ),
    description: v.string(),
    referenceId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_type", ["type"])
    .index("by_user_date", ["userId", "createdAt"]),

  // ============================================================
  // Seasonal Campaigns (DB-stored definitions)
  // ============================================================

  seasonalCampaignDefs: defineTable({
    name: v.string(),
    description: v.string(),
    season: v.union(v.literal("spring"), v.literal("summer"), v.literal("fall"), v.literal("winter")),
    year: v.number(),
    startDate: v.number(),
    endDate: v.number(),
    climateZones: v.array(v.string()),
    applicableStates: v.optional(v.array(v.string())),
    challengeTasks: v.array(v.object({
      title: v.string(),
      description: v.string(),
      category: v.string(),
      pointsValue: v.number(),
      bonusPoints: v.optional(v.number()),
      estimatedMinutes: v.number(),
      estimatedCost: v.optional(v.number()),
    })),
    completionBadgeId: v.optional(v.id("badges")),
    completionBonusPoints: v.number(),
    totalPossiblePoints: v.number(),
    bannerImageUrl: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_season", ["season"])
    .index("by_active", ["isActive"])
    .index("by_year_season", ["year", "season"]),

  userCampaignEnrollment: defineTable({
    userId: v.id("userProfiles"),
    campaignId: v.id("seasonalCampaignDefs"),
    homeId: v.id("homes"),
    tasksCompleted: v.array(v.object({
      taskIndex: v.number(),
      completedAt: v.number(),
      pointsEarned: v.number(),
    })),
    totalPointsEarned: v.number(),
    percentComplete: v.number(),
    status: v.union(
      v.literal("enrolled"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("expired")
    ),
    enrolledAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_campaign", ["campaignId"])
    .index("by_user_campaign", ["userId", "campaignId"]),

  // ============================================================
  // Push Notifications & In-App Notification Feed
  // ============================================================

  appNotifications: defineTable({
    userId: v.id("userProfiles"),
    type: v.union(
      v.literal("weather_alert"),
      v.literal("task_reminder"),
      v.literal("failure_prediction"),
      v.literal("weekly_pulse"),
      v.literal("seasonal_campaign"),
      v.literal("streak_reminder"),
      v.literal("badge_earned"),
      v.literal("level_up"),
      v.literal("health_score_change"),
      v.literal("system_alert")
    ),
    title: v.string(),
    body: v.string(),
    data: v.optional(v.any()),
    read: v.boolean(),
    sentAt: v.number(),
    readAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_read", ["userId", "read"]),

  pushTokens: defineTable({
    userId: v.id("userProfiles"),
    token: v.string(),
    platform: v.union(v.literal("ios"), v.literal("android")),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"]),

  // ============================================================
  // Emergency Contacts & Shutoff Locations
  // ============================================================

  emergencyContacts: defineTable({
    homeId: v.id("homes"),
    category: v.union(v.literal("trusted_pro"), v.literal("shutoff")),
    type: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    location: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_home", ["homeId"])
    .index("by_home_category", ["homeId", "category"]),
  // ============================================================
  // Auto-Fetched Model Manuals Cache
  // ============================================================

  manualCache: defineTable({
    manufacturer: v.string(),
    modelNumber: v.string(),
    normalizedKey: v.string(),
    title: v.string(),
    sourceUrl: v.string(),
    storageId: v.optional(v.id("_storage")),
    vaultDocumentId: v.optional(v.id("vaultDocuments")),
    fileSize: v.optional(v.number()),
    fetchStatus: v.union(
      v.literal("searching"),
      v.literal("downloading"),
      v.literal("stored"),
      v.literal("parsed"),
      v.literal("failed")
    ),
    fetchError: v.optional(v.string()),
    createdAt: v.number(),
    lastAccessedAt: v.optional(v.number()),
  })
    .index("by_normalizedKey", ["normalizedKey"])
    .index("by_status", ["fetchStatus"])
    .index("by_manufacturer", ["manufacturer"]),
  // ============================================================
  // Home Inspector Tool
  // ============================================================

  inspectorProfiles: defineTable({
    userId: v.id("userProfiles"),
    companyName: v.string(),
    licenseNumber: v.optional(v.string()),
    licenseState: v.optional(v.string()),
    yearsExperience: v.string(),
    inspectionsPerMonth: v.optional(v.string()),
    serviceAreaZips: v.array(v.string()),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise")),
    planExpiresAt: v.optional(v.number()),
    trialStartedAt: v.optional(v.number()),
    logoStorageId: v.optional(v.id("_storage")),
    brandColors: v.optional(v.object({
      primary: v.string(),
      accent: v.string(),
    })),
    reportHeaderText: v.optional(v.string()),
    contactInfo: v.object({
      phone: v.string(),
      email: v.string(),
      website: v.optional(v.string()),
    }),
    stats: v.object({
      totalInspections: v.number(),
      activeSubscribers: v.number(),
      totalCommission: v.number(),
    }),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_plan", ["plan"]),

  inspections: defineTable({
    inspectorId: v.id("inspectorProfiles"),
    status: v.union(
      v.literal("draft"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("delivered")
    ),
    propertyAddress: v.string(),
    propertyCity: v.optional(v.string()),
    propertyState: v.optional(v.string()),
    propertyZip: v.optional(v.string()),
    propertyType: v.string(),
    yearBuilt: v.number(),
    squareFootage: v.number(),
    stories: v.number(),
    foundationType: v.string(),
    buyerName: v.string(),
    buyerEmail: v.string(),
    buyerPhone: v.optional(v.string()),
    realtorName: v.optional(v.string()),
    realtorEmail: v.optional(v.string()),
    inspectionDate: v.number(),
    systemsTotal: v.number(),
    systemsCompleted: v.number(),
    concernsCount: v.number(),
    photosCount: v.number(),
    overallCondition: v.optional(v.string()),
    executiveSummary: v.optional(v.string()),
    reportShareToken: v.optional(v.string()),
    reportPdfStorageId: v.optional(v.id("_storage")),
    keptHomeId: v.optional(v.id("homes")),
    keptSubscriptionStatus: v.optional(v.string()),
    fiveYearCostEstimate: v.optional(v.object({
      low: v.number(),
      high: v.number(),
    })),
    completedAt: v.optional(v.number()),
    deliveredAt: v.optional(v.number()),
  })
    .index("by_inspector", ["inspectorId"])
    .index("by_inspector_status", ["inspectorId", "status"])
    .index("by_date", ["inspectionDate"])
    .index("by_shareToken", ["reportShareToken"]),

  inspectionSystems: defineTable({
    inspectionId: v.id("inspections"),
    category: v.string(),
    systemName: v.string(),
    sortOrder: v.number(),
    make: v.optional(v.string()),
    model: v.optional(v.string()),
    serialNumber: v.optional(v.string()),
    yearManufactured: v.optional(v.number()),
    systemType: v.optional(v.string()),
    capacity: v.optional(v.string()),
    fuelType: v.optional(v.string()),
    condition: v.union(
      v.literal("good"),
      v.literal("fair"),
      v.literal("poor"),
      v.literal("immediate_attention"),
      v.literal("not_inspected")
    ),
    checklist: v.array(v.object({
      item: v.string(),
      passed: v.boolean(),
      flagged: v.boolean(),
      note: v.optional(v.string()),
    })),
    notes: v.optional(v.string()),
    photoStorageIds: v.array(v.id("_storage")),
    predictedLife: v.optional(v.object({
      remainingYearsLow: v.number(),
      remainingYearsHigh: v.number(),
    })),
    predictedReplacementCost: v.optional(v.object({
      low: v.number(),
      high: v.number(),
    })),
    riskLevel: v.optional(v.union(
      v.literal("low"),
      v.literal("moderate"),
      v.literal("high"),
      v.literal("critical")
    )),
    maintenanceRecommendations: v.optional(v.array(v.string())),
    isComplete: v.boolean(),
  })
    .index("by_inspection", ["inspectionId"])
    .index("by_inspection_category", ["inspectionId", "category"]),

  inspectorCommissions: defineTable({
    inspectorId: v.id("inspectorProfiles"),
    inspectionId: v.id("inspections"),
    keptHomeId: v.optional(v.id("homes")),
    subscribedAt: v.optional(v.number()),
    plan: v.string(),
    amount: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("cancelled")
    ),
    paidAt: v.optional(v.number()),
  })
    .index("by_inspector", ["inspectorId"])
    .index("by_status", ["status"]),


  sopChecklists: defineTable({
    category: v.string(),
    label: v.string(),
    required: v.boolean(),
    liabilityNote: v.optional(v.string()),
    excludedNote: v.optional(v.string()),
    commonDefects: v.optional(v.array(v.string())),
    sortOrder: v.optional(v.number()),
  })
    .index("by_category", ["category"]),

  // ══════════════════════════════════════════════════════════════
  // INTERNACHI SOP KNOWLEDGE BASE
  // ══════════════════════════════════════════════════════════════

  sopSystems: defineTable({
    sectionNumber: v.string(),
    systemId: v.string(),
    systemName: v.string(),
    category: v.string(),
    shallInspect: v.array(v.string()),
    shallDescribe: v.array(v.string()),
    shallReport: v.array(v.string()),
    notRequired: v.array(v.string()),
    floridaSpecific: v.array(v.string()),
    inspectionTips: v.array(v.string()),
    liabilityNotes: v.array(v.string()),
  })
    .index("by_systemId", ["systemId"])
    .index("by_category", ["category"]),

  sopDefects: defineTable({
    systemId: v.string(),
    defectName: v.string(),
    severity: v.string(),
    description: v.string(),
    whatToLookFor: v.array(v.string()),
    reportLanguage: v.string(),
    photoGuidance: v.string(),
    isFloridaRelevant: v.boolean(),
  })
    .index("by_systemId", ["systemId"])
    .index("by_severity", ["severity"]),

  sopReportTemplates: defineTable({
    systemId: v.string(),
    condition: v.string(),
    defectType: v.string(),
    templateText: v.string(),
    recommendAction: v.string(),
    severity: v.string(),
  })
    .index("by_systemId", ["systemId"])
    .index("by_defectType", ["defectType"]),

  floridaInspections: defineTable({
    inspectionType: v.string(),
    formNumber: v.optional(v.string()),
    description: v.string(),
    requiredSystems: v.array(v.string()),
    requirements: v.array(v.string()),
    notes: v.array(v.string()),
  })
    .index("by_inspectionType", ["inspectionType"]),

  // ══════════════════════════════════════════════════════════════
  // CONTINUOUS LEARNING INTELLIGENCE SYSTEM
  // ══════════════════════════════════════════════════════════════

  // --- PHASE 1: OUTCOME TRACKING ---

  advisorInteractions: defineTable({
    userId: v.id("userProfiles"),
    sessionId: v.string(),
    systemId: v.optional(v.id("systems")),
    questionCategory: v.string(),
    questionText: v.string(),
    responseText: v.string(),
    recommendationType: v.string(),
    recommendedAction: v.optional(v.string()),
    systemSnapshot: v.optional(v.object({
      systemType: v.string(),
      make: v.optional(v.string()),
      model: v.optional(v.string()),
      age: v.optional(v.number()),
      healthScore: v.optional(v.number()),
      condition: v.optional(v.string()),
    })),
    region: v.optional(v.string()),
    climateZone: v.optional(v.string()),
    feedbackRating: v.optional(v.string()),
    feedbackNote: v.optional(v.string()),
    feedbackAt: v.optional(v.number()),
    followUpAction: v.optional(v.string()),
    followUpAt: v.optional(v.number()),
    actualDiagnosis: v.optional(v.string()),
    actualCost: v.optional(v.number()),
    advisorWasAccurate: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_questionCategory", ["questionCategory"])
    .index("by_feedbackRating", ["feedbackRating"])
    .index("by_region", ["region"])
    .index("by_createdAt", ["createdAt"]),

  taskOutcomes: defineTable({
    userId: v.id("userProfiles"),
    taskId: v.id("scheduledMaintenance"),
    systemId: v.optional(v.id("systems")),
    taskType: v.string(),
    taskSource: v.string(),
    completedAt: v.optional(v.number()),
    completionMethod: v.optional(v.string()),
    difficultyRating: v.optional(v.string()),
    timeSpentMinutes: v.optional(v.number()),
    outcomeRating: v.optional(v.string()),
    outcomeNote: v.optional(v.string()),
    diyCost: v.optional(v.number()),
    proCost: v.optional(v.number()),
    productUsed: v.optional(v.string()),
    productEffective: v.optional(v.boolean()),
    region: v.optional(v.string()),
    systemType: v.optional(v.string()),
    systemMake: v.optional(v.string()),
    systemAge: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_taskType", ["taskType"])
    .index("by_systemType", ["systemType"])
    .index("by_region", ["region"])
    .index("by_outcomeRating", ["outcomeRating"])
    .index("by_userId", ["userId"]),

  systemEvents: defineTable({
    userId: v.id("userProfiles"),
    systemId: v.id("systems"),
    eventType: v.string(),
    eventDate: v.number(),
    systemType: v.string(),
    make: v.optional(v.string()),
    model: v.optional(v.string()),
    ageAtEvent: v.number(),
    healthScoreAtEvent: v.optional(v.number()),
    failureMode: v.optional(v.string()),
    symptoms: v.optional(v.array(v.string())),
    wasGradual: v.optional(v.boolean()),
    repairCost: v.optional(v.number()),
    replacementCost: v.optional(v.number()),
    wasWarrantyCovered: v.optional(v.boolean()),
    providerDiagnosis: v.optional(v.string()),
    keptPredictedFailureYear: v.optional(v.number()),
    actualFailureYear: v.number(),
    predictionError: v.optional(v.number()),
    region: v.optional(v.string()),
    climateZone: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_systemType", ["systemType"])
    .index("by_make", ["make"])
    .index("by_region", ["region"])
    .index("by_eventType", ["eventType"])
    .index("by_userId", ["userId"]),

  costReports: defineTable({
    userId: v.id("userProfiles"),
    systemId: v.optional(v.id("systems")),
    costType: v.string(),
    serviceCategory: v.string(),
    description: v.string(),
    actualCost: v.number(),
    systemType: v.optional(v.string()),
    systemMake: v.optional(v.string()),
    region: v.string(),
    zipCode: v.optional(v.string()),
    keptEstimateLow: v.optional(v.number()),
    keptEstimateHigh: v.optional(v.number()),
    reportedAt: v.number(),
  })
    .index("by_serviceCategory", ["serviceCategory"])
    .index("by_region", ["region"])
    .index("by_systemType", ["systemType"])
    .index("by_userId", ["userId"]),

  // --- PHASE 2: INTELLIGENCE TABLES (aggregated output) ---

  systemReliabilityProfiles: defineTable({
    systemType: v.string(),
    make: v.optional(v.string()),
    region: v.optional(v.string()),
    climateZone: v.optional(v.string()),
    sampleSize: v.number(),
    isBootstrapped: v.boolean(),
    weibullShape: v.number(),
    weibullScale: v.number(),
    medianLifespan: v.number(),
    p10Lifespan: v.number(),
    p90Lifespan: v.number(),
    defaultWeibullScale: v.number(),
    adjustmentFactor: v.number(),
    commonFailureModes: v.array(v.object({
      mode: v.string(),
      frequency: v.number(),
      averageAgeAtFailure: v.number(),
    })),
    preFailureSymptoms: v.array(v.object({
      symptom: v.string(),
      frequencyPercent: v.number(),
      averageLeadTime: v.number(),
    })),
    lastUpdated: v.number(),
  })
    .index("by_systemType", ["systemType"])
    .index("by_make", ["make"])
    .index("by_region", ["region"]),

  troubleshootingIntelligence: defineTable({
    systemType: v.string(),
    symptom: v.string(),
    sampleSize: v.number(),
    solutions: v.array(v.object({
      solution: v.string(),
      resolutionRate: v.number(),
      averageCost: v.optional(v.number()),
      diySuccess: v.number(),
      requiresPro: v.boolean(),
    })),
    proDiagnoses: v.array(v.object({
      diagnosis: v.string(),
      frequency: v.number(),
      averageCost: v.number(),
    })),
    region: v.optional(v.string()),
    lastUpdated: v.number(),
  })
    .index("by_systemType_symptom", ["systemType", "symptom"])
    .index("by_region", ["region"]),

  regionalCostBenchmarks: defineTable({
    region: v.string(),
    serviceCategory: v.string(),
    costType: v.string(),
    sampleSize: v.number(),
    averageCost: v.number(),
    medianCost: v.number(),
    p25Cost: v.number(),
    p75Cost: v.number(),
    minCost: v.number(),
    maxCost: v.number(),
    costTrend: v.string(),
    yearOverYearChange: v.optional(v.number()),
    specificItems: v.optional(v.array(v.object({
      item: v.string(),
      averageCost: v.number(),
      sampleSize: v.number(),
    }))),
    lastUpdated: v.number(),
  })
    .index("by_region_category", ["region", "serviceCategory"]),

  seasonalPatterns: defineTable({
    region: v.string(),
    systemType: v.string(),
    monthlyData: v.array(v.object({
      month: v.number(),
      issueFrequency: v.number(),
      topIssues: v.array(v.string()),
      proactiveTasks: v.array(v.string()),
    })),
    sampleSize: v.number(),
    lastUpdated: v.number(),
  })
    .index("by_region_system", ["region", "systemType"]),

  productEffectiveness: defineTable({
    productId: v.string(),
    taskType: v.string(),
    sampleSize: v.number(),
    effectivenessRate: v.number(),
    averageRating: v.number(),
    commonFeedback: v.array(v.object({
      feedback: v.string(),
      frequency: v.number(),
    })),
    lastUpdated: v.number(),
  })
    .index("by_productId", ["productId"]),

  // ================================================================
  // KEPT PREMIUM — Care Kits, Smart Vault Intelligence, Voice Concierge
  // ================================================================

  careKitProducts: defineTable({
    productId: v.string(),
    name: v.string(),
    category: v.string(),
    subcategory: v.optional(v.string()),
    description: v.string(),
    matchType: v.string(),
    matchCriteria: v.optional(v.object({
      systemTypes: v.optional(v.array(v.string())),
      filterSize: v.optional(v.string()),
      modelPatterns: v.optional(v.array(v.string())),
      applianceType: v.optional(v.string()),
      brandMatch: v.optional(v.string()),
    })),
    purchaseLinks: v.array(v.object({
      retailer: v.string(),
      url: v.string(),
      price: v.optional(v.number()),
      primeEligible: v.optional(v.boolean()),
    })),
    imageUrl: v.optional(v.string()),
    estimatedPrice: v.object({ low: v.number(), high: v.number() }),
    rating: v.optional(v.number()),
    isActive: v.boolean(),
    lastPriceCheck: v.optional(v.number()),
  })
    .index("by_category", ["category"])
    .index("by_matchType", ["matchType"])
    .index("by_productId", ["productId"]),

  taskProductLinks: defineTable({
    taskType: v.string(),
    productIds: v.array(v.string()),
    isPrimary: v.boolean(),
    notes: v.optional(v.string()),
  })
    .index("by_taskType", ["taskType"]),

  purchaseReminders: defineTable({
    userId: v.id("users"),
    taskId: v.id("scheduledMaintenance"),
    productId: v.string(),
    reminderDate: v.number(),
    status: v.string(),
    purchaseUrl: v.optional(v.string()),
    sentAt: v.optional(v.number()),
    clickedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_taskId", ["taskId"]),

  manualIntelligence: defineTable({
    userId: v.id("users"),
    systemId: v.id("systems"),
    sourceDocumentId: v.id("vaultDocuments"),
    extractionStatus: v.string(),
    extractedAt: v.optional(v.number()),
    maintenanceSchedule: v.optional(v.array(v.object({
      task: v.string(),
      frequency: v.string(),
      instructions: v.string(),
      manufacturerWarning: v.optional(v.string()),
      page: v.optional(v.string()),
    }))),
    troubleshooting: v.optional(v.array(v.object({
      symptom: v.string(),
      possibleCauses: v.array(v.string()),
      diyFixes: v.array(v.string()),
      whenToCallPro: v.string(),
      severity: v.string(),
    }))),
    warranty: v.optional(v.object({
      duration: v.string(),
      coverageDescription: v.string(),
      exclusions: v.array(v.string()),
      claimProcess: v.string(),
      registrationRequired: v.boolean(),
      transferable: v.boolean(),
    })),
    specifications: v.optional(v.object({
      filterSize: v.optional(v.string()),
      capacity: v.optional(v.string()),
      voltage: v.optional(v.string()),
      fuelType: v.optional(v.string()),
      compatibleParts: v.optional(v.array(v.string())),
      dimensions: v.optional(v.string()),
    })),
    safetyWarnings: v.optional(v.array(v.string())),
    careInstructions: v.optional(v.array(v.object({
      area: v.string(),
      instruction: v.string(),
    }))),
    rawExtractedText: v.optional(v.string()),
  })
    .index("by_systemId", ["systemId"])
    .index("by_userId", ["userId"])
    .index("by_sourceDocument", ["sourceDocumentId"]),

  voiceServiceRequests: defineTable({
    userId: v.id("users"),
    systemId: v.optional(v.id("systems")),
    requestType: v.string(),
    serviceCategory: v.string(),
    description: v.string(),
    urgency: v.string(),
    systemContext: v.optional(v.object({
      make: v.optional(v.string()),
      model: v.optional(v.string()),
      age: v.optional(v.number()),
      issue: v.optional(v.string()),
      healthScore: v.optional(v.number()),
    })),
    preferredDays: v.optional(v.array(v.string())),
    preferredTimeWindow: v.optional(v.string()),
    homeownerPhone: v.string(),
    homeownerAddress: v.string(),
    status: v.string(),
    callAttempts: v.array(v.object({
      providerName: v.string(),
      providerPhone: v.string(),
      callId: v.optional(v.string()),
      callStartedAt: v.number(),
      callEndedAt: v.optional(v.number()),
      duration: v.optional(v.number()),
      outcome: v.string(),
      notes: v.optional(v.string()),
      transcript: v.optional(v.string()),
    })),
    appointmentDate: v.optional(v.number()),
    appointmentTime: v.optional(v.string()),
    appointmentProvider: v.optional(v.string()),
    appointmentProviderPhone: v.optional(v.string()),
    estimatedCost: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"]),

  serviceProviders: defineTable({
    name: v.string(),
    phone: v.string(),
    category: v.string(),
    serviceArea: v.array(v.string()),
    rating: v.optional(v.number()),
    isPreferred: v.boolean(),
    isStratumCo: v.boolean(),
    notes: v.optional(v.string()),
    hoursOfOperation: v.optional(v.string()),
    lastCalledAt: v.optional(v.number()),
  })
    .index("by_category", ["category"]),

  // ================================================================
  // IoT INTEGRATION — Smart Device Data + Remote Management
  // ================================================================

  iotDevices: defineTable({
    userId: v.id("users"),
    homeId: v.id("homes"),
    systemId: v.optional(v.id("systems")),

    platform: v.string(),
    deviceType: v.string(),
    externalDeviceId: v.string(),
    deviceName: v.string(),
    deviceModel: v.optional(v.string()),

    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    tokenExpiry: v.optional(v.number()),

    connectionStatus: v.string(),
    lastSeenAt: v.optional(v.number()),
    lastSyncAt: v.optional(v.number()),
    lastError: v.optional(v.string()),

    capabilities: v.array(v.string()),

    syncIntervalMinutes: v.number(),
    alertsEnabled: v.boolean(),
    autoActionsEnabled: v.boolean(),

    connectedAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_homeId", ["homeId"])
    .index("by_systemId", ["systemId"])
    .index("by_platform", ["platform"])
    .index("by_deviceType", ["deviceType"])
    .index("by_connectionStatus", ["connectionStatus"]),

  iotReadings: defineTable({
    deviceId: v.id("iotDevices"),
    homeId: v.id("homes"),
    systemId: v.optional(v.id("systems")),

    readingType: v.string(),
    value: v.number(),
    unit: v.string(),

    granularity: v.string(),
    periodStart: v.number(),
    periodEnd: v.optional(v.number()),

    timestamp: v.number(),
  })
    .index("by_deviceId_type", ["deviceId", "readingType"])
    .index("by_deviceId_timestamp", ["deviceId", "timestamp"])
    .index("by_homeId_type", ["homeId", "readingType"])
    .index("by_systemId_type", ["systemId", "readingType"])
    .index("by_timestamp", ["timestamp"]),

  iotAggregates: defineTable({
    deviceId: v.id("iotDevices"),
    systemId: v.optional(v.id("systems")),
    homeId: v.id("homes"),

    period: v.string(),
    periodStart: v.number(),
    periodEnd: v.number(),

    readingType: v.string(),

    sum: v.optional(v.number()),
    avg: v.optional(v.number()),
    min: v.optional(v.number()),
    max: v.optional(v.number()),
    count: v.number(),

    changeFromPrevious: v.optional(v.number()),
    trendDirection: v.optional(v.string()),

    isAnomaly: v.optional(v.boolean()),
    anomalyDescription: v.optional(v.string()),

    computedAt: v.number(),
  })
    .index("by_deviceId_period", ["deviceId", "period"])
    .index("by_systemId_period", ["systemId", "period"])
    .index("by_homeId_period", ["homeId", "period"]),

  iotAlerts: defineTable({
    userId: v.id("users"),
    deviceId: v.id("iotDevices"),
    homeId: v.id("homes"),
    systemId: v.optional(v.id("systems")),

    alertType: v.string(),
    severity: v.string(),

    title: v.string(),
    message: v.string(),

    triggerReading: v.optional(v.object({
      readingType: v.string(),
      value: v.number(),
      threshold: v.number(),
    })),

    autoActionTaken: v.optional(v.string()),

    status: v.string(),
    acknowledgedAt: v.optional(v.number()),
    resolvedAt: v.optional(v.number()),

    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_homeId", ["homeId"])
    .index("by_status", ["status"])
    .index("by_severity", ["severity"]),

  strAutomationRules: defineTable({
    userId: v.id("users"),
    homeId: v.id("homes"),
    propertyId: v.optional(v.id("properties")),

    ruleName: v.string(),
    ruleType: v.string(),
    isEnabled: v.boolean(),

    trigger: v.object({
      event: v.string(),
      conditions: v.optional(v.object({
        timeOffset: v.optional(v.number()),
        readingType: v.optional(v.string()),
        threshold: v.optional(v.number()),
        operator: v.optional(v.string()),
      })),
    }),

    action: v.object({
      deviceId: v.id("iotDevices"),
      actionType: v.string(),
      parameters: v.optional(v.object({
        temperature: v.optional(v.number()),
        mode: v.optional(v.string()),
        lockCode: v.optional(v.string()),
        lightScene: v.optional(v.string()),
      })),
    }),

    lastTriggeredAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_homeId", ["homeId"])
    .index("by_propertyId", ["propertyId"])
    .index("by_ruleType", ["ruleType"]),


  // ============================================================
  // MASTER SYSTEM CATALOG — Canonical reference for all trackable
  // systems, components, materials, and fixtures across all apps
  // ============================================================
  systemCatalog: defineTable({
    catalogId: v.string(),
    category: v.string(),
    subcategory: v.string(),
    systemName: v.string(),

    trackingLevel: v.string(),
    visibleToHomeowner: v.boolean(),
    inspectorOnly: v.boolean(),

    expectedLifeYears: v.object({
      low: v.number(),
      median: v.number(),
      high: v.number(),
    }),
    weibullShape: v.number(),
    weibullScale: v.number(),

    regionalFactors: v.optional(v.array(v.object({
      region: v.string(),
      adjustmentFactor: v.number(),
      reason: v.string(),
    }))),

    replacementCost: v.object({
      low: v.number(),
      median: v.number(),
      high: v.number(),
    }),

    dataFields: v.optional(v.array(v.object({
      fieldName: v.string(),
      fieldType: v.string(),
      options: v.optional(v.array(v.string())),
      required: v.boolean(),
      inspectorField: v.boolean(),
      homeownerField: v.boolean(),
    }))),

    maintenanceTaskIds: v.array(v.string()),

    iotCompatible: v.optional(v.boolean()),
    iotDeviceTypes: v.optional(v.array(v.string())),
    careKitProductTypes: v.optional(v.array(v.string())),

    isActive: v.boolean(),
    lastUpdated: v.number(),
  })
    .index("by_catalogId", ["catalogId"])
    .index("by_category", ["category"])
    .index("by_trackingLevel", ["trackingLevel"])
    .index("by_visibleToHomeowner", ["visibleToHomeowner"])
    .index("by_isActive", ["isActive"]),

  // ============================================================
  // MASTER MAINTENANCE TASK CATALOG — Every preventive task with
  // frequency, difficulty, cost, instructions, and climate data
  // ============================================================
  maintenanceTaskCatalog: defineTable({
    taskId: v.string(),
    taskName: v.string(),

    category: v.string(),
    applicableSystemIds: v.array(v.string()),

    frequencyType: v.string(),
    frequencyValue: v.optional(v.number()),
    frequencyUnit: v.optional(v.string()),
    seasonalMonths: v.optional(v.array(v.number())),

    climateAdjustments: v.optional(v.array(v.object({
      climateZone: v.string(),
      adjustedFrequencyDays: v.number(),
      reason: v.string(),
    }))),

    difficulty: v.string(),
    estimatedTimeMinutes: v.number(),
    diyCost: v.object({ low: v.number(), high: v.number() }),
    proCost: v.object({ low: v.number(), high: v.number() }),

    shortDescription: v.string(),
    detailedInstructions: v.optional(v.string()),
    whyItMatters: v.string(),
    whatHappensIfSkipped: v.string(),

    toolsNeeded: v.optional(v.array(v.string())),
    suppliesNeeded: v.optional(v.array(v.string())),

    careKitProductIds: v.optional(v.array(v.string())),
    estimatedSavings: v.optional(v.string()),
    source: v.string(),

    isActive: v.boolean(),
    lastUpdated: v.number(),
  })
    .index("by_taskId", ["taskId"])
    .index("by_category", ["category"])
    .index("by_isActive", ["isActive"]),


  // ════════════════════════════════════════════════════════════
  // RETENTION FEATURES
  // ════════════════════════════════════════════════════════════

  timelineEvents: defineTable({
    userId: v.id("users"),
    homeId: v.id("homes"),
    systemId: v.optional(v.id("systems")),
    eventType: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    icon: v.string(),
    color: v.string(),
    linkedTaskId: v.optional(v.id("scheduledMaintenance")),
    linkedServiceRequestId: v.optional(v.id("serviceRequests")),
    linkedDocumentId: v.optional(v.id("vaultDocuments")),
    linkedPhotoIds: v.optional(v.array(v.id("_storage"))),
    linkedReceiptId: v.optional(v.id("serviceReceipts")),
    cost: v.optional(v.number()),
    costType: v.optional(v.string()),
    performedBy: v.optional(v.string()),
    isUserGenerated: v.boolean(),
    isAutoGenerated: v.boolean(),
    metadata: v.optional(v.any()),
    timestamp: v.number(),
  })
    .index("by_homeId", ["homeId"])
    .index("by_homeId_timestamp", ["homeId", "timestamp"])
    .index("by_userId_timestamp", ["userId", "timestamp"])
    .index("by_systemId", ["systemId"])
    .index("by_eventType", ["eventType"]),

  serviceReceipts: defineTable({
    userId: v.id("users"),
    homeId: v.id("homes"),
    systemId: v.optional(v.id("systems")),
    taskId: v.optional(v.id("scheduledMaintenance")),
    serviceRequestId: v.optional(v.id("serviceRequests")),
    vendor: v.string(),
    description: v.string(),
    amount: v.number(),
    date: v.number(),
    category: v.string(),
    receiptImageId: v.optional(v.id("_storage")),
    extractedData: v.optional(v.object({
      invoiceNumber: v.optional(v.string()),
      vendorAddress: v.optional(v.string()),
      vendorPhone: v.optional(v.string()),
      lineItems: v.optional(v.array(v.object({
        description: v.string(),
        amount: v.number(),
      }))),
      taxAmount: v.optional(v.number()),
      warrantyNotes: v.optional(v.string()),
    })),
    isTaxDeductible: v.boolean(),
    taxCategory: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_homeId", ["homeId"])
    .index("by_systemId", ["systemId"])
    .index("by_userId_date", ["userId", "date"])
    .index("by_category", ["category"]),

  householdMembers: defineTable({
    homeId: v.id("homes"),
    ownerUserId: v.id("users"),
    memberUserId: v.optional(v.id("users")),
    memberEmail: v.string(),
    role: v.string(),
    status: v.string(),
    invitedAt: v.number(),
    joinedAt: v.optional(v.number()),
  })
    .index("by_homeId", ["homeId"])
    .index("by_memberUserId", ["memberUserId"])
    .index("by_ownerUserId", ["ownerUserId"])
    .index("by_memberEmail", ["memberEmail"]),

  milestoneEvents: defineTable({
    userId: v.id("users"),
    homeId: v.id("homes"),
    systemId: v.optional(v.id("systems")),
    milestoneType: v.string(),
    title: v.string(),
    description: v.string(),
    icon: v.string(),
    value: v.optional(v.number()),
    isRead: v.boolean(),
    isDismissed: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_homeId", ["homeId"])
    .index("by_userId", ["userId"])
    .index("by_userId_unread", ["userId", "isRead"])
    .index("by_milestoneType", ["milestoneType"]),

  annualReports: defineTable({
    userId: v.id("users"),
    homeId: v.id("homes"),
    year: v.number(),
    reportData: v.any(),
    shareToken: v.optional(v.string()),
    shareExpiresAt: v.optional(v.number()),
    generatedAt: v.number(),
  })
    .index("by_homeId_year", ["homeId", "year"])
    .index("by_userId", ["userId"])
    .index("by_shareToken", ["shareToken"]),

  realtorContacts: defineTable({
    inspectorId: v.id("users"),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    totalReferrals: v.number(),
    referralsThisMonth: v.number(),
    referralsThisYear: v.number(),
    lastReferralDate: v.optional(v.number()),
    firstReferralDate: v.optional(v.number()),
    lastContactDate: v.optional(v.number()),
    notes: v.optional(v.string()),
    status: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_inspectorId", ["inspectorId"])
    .index("by_totalReferrals", ["totalReferrals"]),

  rateLimits: defineTable({
    userId: v.string(),
    action: v.string(),
    timestamp: v.number(),
  })
    .index("by_userId_action", ["userId", "action"])
    .index("by_timestamp", ["timestamp"]),

  errorLogs: defineTable({
    functionName: v.string(),
    error: v.string(),
    stack: v.optional(v.string()),
    args: v.optional(v.string()),
    userId: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_functionName", ["functionName"]),

});
