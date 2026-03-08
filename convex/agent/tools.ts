/**
 * Tool definitions for the Kept maintenance intelligence agent.
 *
 * Each tool maps to a mutation in mutations.ts that performs the actual
 * database operation. The agent calls these via Claude's tool_use mechanism.
 */

// Using the Anthropic SDK tool type shape inline to avoid
// requiring the SDK in non-node files.
interface ToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required: string[];
  };
}

export const AGENT_TOOLS: ToolDefinition[] = [
  {
    name: "upsert_forecast",
    description:
      "Create or update a maintenance/replacement forecast for a home system. " +
      "Use when analysis reveals upcoming maintenance needs, replacement timelines, " +
      "or when existing forecasts need revision based on new data.",
    input_schema: {
      type: "object" as const,
      properties: {
        systemId: {
          type: "string",
          description: "The _id of the system this forecast applies to",
        },
        forecastId: {
          type: "string",
          description:
            "If updating an existing forecast, its _id. Omit to create new.",
        },
        type: {
          type: "string",
          enum: ["maintenance", "replacement", "inspection"],
        },
        title: {
          type: "string",
          description: "Concise title, e.g. 'HVAC Filter Change Due'",
        },
        description: {
          type: "string",
          description: "Detailed description with recommended action",
        },
        urgency: {
          type: "string",
          enum: ["routine", "soon", "urgent", "critical"],
          description:
            "routine = 6+ months, soon = 1-6 months, urgent = <1 month, critical = immediate",
        },
        estimatedDate: {
          type: "string",
          description: "ISO 8601 date for when this should be addressed",
        },
        costRangeLow: { type: "number", description: "Low end of cost in USD" },
        costRangeHigh: { type: "number", description: "High end of cost in USD" },
        reasoning: {
          type: "string",
          description:
            "Your reasoning chain — the specific data points and logic. Stored for audit.",
        },
      },
      required: [
        "systemId",
        "type",
        "title",
        "description",
        "urgency",
        "reasoning",
      ],
    },
  },
  {
    name: "create_action_item",
    description:
      "Create a concrete, actionable task for the homeowner. " +
      "These appear in their task list. Use for specific next steps.",
    input_schema: {
      type: "object" as const,
      properties: {
        systemId: { type: "string", description: "Related system _id" },
        title: { type: "string" },
        description: { type: "string", description: "What to do and why" },
        urgency: {
          type: "string",
          enum: ["low", "medium", "high", "critical"],
        },
        category: {
          type: "string",
          enum: [
            "diy_maintenance",
            "schedule_professional",
            "purchase",
            "inspection",
            "safety",
          ],
        },
        estimatedCostLow: { type: "number" },
        estimatedCostHigh: { type: "number" },
        dueDate: { type: "string", description: "Suggested completion date, ISO" },
      },
      required: ["title", "description", "urgency", "category"],
    },
  },
  {
    name: "update_system_record",
    description:
      "Update a home system's record with new or corrected information. " +
      "Use when analysis reveals the record is incomplete or when the user provides new details.",
    input_schema: {
      type: "object" as const,
      properties: {
        systemId: { type: "string" },
        condition: {
          type: "string",
          enum: ["excellent", "good", "fair", "poor", "critical", "unknown"],
        },
        age: { type: "number", description: "Estimated age in years" },
        lastServiceDate: { type: "string" },
        notes: { type: "string", description: "Appended to existing notes" },
      },
      required: ["systemId"],
    },
  },
  {
    name: "send_notification",
    description:
      "Surface a notification to the homeowner in-app. Use for important insights, " +
      "time-sensitive reminders, or summarized analysis results worth seeing.",
    input_schema: {
      type: "object" as const,
      properties: {
        type: {
          type: "string",
          enum: [
            "insight",
            "reminder",
            "safety",
            "action_required",
            "approval_request",
            "info",
          ],
        },
        title: { type: "string", description: "Notification headline" },
        body: {
          type: "string",
          description: "2-4 sentence body. Be specific and actionable.",
        },
        priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
        relatedSystemId: { type: "string" },
      },
      required: ["type", "title", "body", "priority"],
    },
  },
  {
    name: "escalate_safety_concern",
    description:
      "IMMEDIATELY flag a safety hazard. Use for gas leaks, CO risk, electrical hazards, " +
      "structural concerns, fire risk, or ANY condition threatening occupant safety. " +
      "This always auto-executes and sends a high-priority notification.",
    input_schema: {
      type: "object" as const,
      properties: {
        systemId: { type: "string" },
        severity: { type: "string", enum: ["warning", "danger", "emergency"] },
        concern: { type: "string", description: "What the hazard is" },
        immediateAction: {
          type: "string",
          description:
            "Exactly what the homeowner should do RIGHT NOW, step by step",
        },
        professionalNeeded: { type: "boolean" },
      },
      required: [
        "severity",
        "concern",
        "immediateAction",
        "professionalNeeded",
      ],
    },
  },
  {
    name: "request_information",
    description:
      "Ask the homeowner for specific missing information needed for reliable analysis. " +
      "Use when the answer materially changes your recommendation. " +
      "Don't ask for nice-to-haves — only ask when it matters.",
    input_schema: {
      type: "object" as const,
      properties: {
        question: { type: "string" },
        context: {
          type: "string",
          description: "Why you need this — what changes depending on the answer",
        },
        relatedSystemId: { type: "string" },
        suggestedOptions: {
          type: "array",
          items: { type: "string" },
          description: "Optional multiple-choice to make answering easy",
        },
      },
      required: ["question", "context"],
    },
  },
  {
    name: "log_maintenance_record",
    description:
      "Record a maintenance event in the home's history. Use when the user reports " +
      "completed work or when recording a service event.",
    input_schema: {
      type: "object" as const,
      properties: {
        systemId: { type: "string" },
        date: { type: "string", description: "ISO date of the maintenance" },
        description: { type: "string" },
        type: {
          type: "string",
          enum: [
            "repair",
            "maintenance",
            "inspection",
            "replacement",
            "cleaning",
          ],
        },
        cost: { type: "number" },
        provider: { type: "string" },
        notes: { type: "string" },
      },
      required: ["systemId", "date", "description", "type"],
    },
  },
  {
    name: "schedule_future_check",
    description:
      "Schedule the agent to automatically re-evaluate a system at a future date. " +
      "Use when a condition should be monitored over time or when a follow-up is needed.",
    input_schema: {
      type: "object" as const,
      properties: {
        systemId: { type: "string" },
        checkDate: { type: "string", description: "ISO date for re-check" },
        reason: { type: "string" },
        priority: { type: "string", enum: ["low", "medium", "high"] },
      },
      required: ["checkDate", "reason"],
    },
  },
  // ── Workflow decision tree tools ────────────────────────────────
  {
    name: "manage_savings_plan",
    description:
      "Create, update, or close a savings plan for a system replacement. " +
      "Use during proactive replacement planning and onboarding " +
      "to help the homeowner budget for upcoming replacements.",
    input_schema: {
      type: "object" as const,
      properties: {
        systemId: {
          type: "string",
          description: "The _id of the system this savings plan covers",
        },
        action: {
          type: "string",
          enum: ["create", "adjust", "close", "pause", "dormant"],
          description: "What to do with the savings plan",
        },
        targetAmount: {
          type: "number",
          description: "Total replacement cost target in USD",
        },
        monthlyAmount: {
          type: "number",
          description: "Suggested monthly savings amount in USD (rounded to nearest $25, minimum $25)",
        },
        reason: {
          type: "string",
          description: "Why this plan is being created/adjusted",
        },
      },
      required: ["systemId", "action", "reason"],
    },
  },
  {
    name: "archive_system",
    description:
      "Archive a system that has been replaced or permanently removed. " +
      "Records the replacement event for forecast accuracy tracking. " +
      "Optionally creates a new system record for the replacement unit.",
    input_schema: {
      type: "object" as const,
      properties: {
        systemId: {
          type: "string",
          description: "The _id of the system being archived",
        },
        failureMode: {
          type: "string",
          description: "How the system failed: sudden, gradual, proactive_replacement, warranty_claim",
        },
        actualCost: {
          type: "number",
          description: "Actual replacement cost in USD",
        },
        newBrand: {
          type: "string",
          description: "Brand of replacement system",
        },
        newModel: {
          type: "string",
          description: "Model of replacement system",
        },
        warrantyYears: {
          type: "number",
          description: "Warranty duration on new system in years",
        },
      },
      required: ["systemId"],
    },
  },
  {
    name: "assess_quote",
    description:
      "Store a contractor quote with price assessment and scope analysis. " +
      "Use during quote validation to record findings and price comparison.",
    input_schema: {
      type: "object" as const,
      properties: {
        systemId: { type: "string", description: "Related system _id" },
        contractorName: { type: "string" },
        amount: { type: "number", description: "Total quote amount in USD" },
        workType: {
          type: "string",
          enum: ["repair", "replacement", "maintenance"],
        },
        priceFlag: {
          type: "string",
          enum: ["SUSPICIOUSLY_LOW", "GOOD_VALUE", "TYPICAL", "ABOVE_AVERAGE", "HIGH"],
          description: "Price assessment classification",
        },
        percentile: {
          type: "number",
          description: "Estimated percentile within market range (0-100)",
        },
        scopeFlags: {
          type: "array",
          items: {
            type: "object",
            properties: {
              severity: { type: "string", enum: ["WARNING", "INFO"] },
              message: { type: "string" },
            },
          },
          description: "Missing items or scope concerns",
        },
        recommendation: {
          type: "string",
          description: "Overall assessment and recommended next steps",
        },
      },
      required: ["amount", "workType", "priceFlag", "recommendation"],
    },
  },
  // ── Vault tools ────────────────────────────────────────────────
  {
    name: "search_vault",
    description:
      "Search the homeowner's document vault for specific items — receipts, warranties, " +
      "photos, permits, inspection reports, or manuals. Use when the homeowner asks about " +
      "a document (\"do I have a warranty for...\") or when you need evidence to back up a " +
      "recommendation. Returns matching vault items with key metadata.",
    input_schema: {
      type: "object" as const,
      properties: {
        systemId: {
          type: "string",
          description: "Search within a specific system's vault items. Omit to search the entire home.",
        },
        type: {
          type: "string",
          enum: ["photo", "receipt", "warranty", "document", "permit", "manual", "insurance", "inspection_report"],
          description: "Filter by document type",
        },
        query: {
          type: "string",
          description: "Free-text search query for title matching",
        },
      },
      required: [],
    },
  },
  {
    name: "suggest_vault_upload",
    description:
      "Suggest that the homeowner upload a specific type of document or photo. " +
      "Use when information gaps exist that would improve assessment accuracy. " +
      "Frame suggestions as helpful, not demanding.",
    input_schema: {
      type: "object" as const,
      properties: {
        systemId: { type: "string", description: "The system this upload would help" },
        suggestedType: {
          type: "string",
          enum: ["photo", "receipt", "warranty", "permit", "manual"],
        },
        reason: {
          type: "string",
          description: "Why this upload would help — what changes with the information",
        },
      },
      required: ["suggestedType", "reason"],
    },
  },
  // ── Upgrade planning tools ──────────────────────────────────────
  {
    name: "generate_upgrade_comparison",
    description:
      "Creates a side-by-side comparison of replacement/upgrade options for a specific system, " +
      "including installed cost, operating cost difference, payback period, total cost of ownership, " +
      "rebate eligibility, and Kept's recommendation with reasoning. Research only — no action taken.",
    input_schema: {
      type: "object" as const,
      properties: {
        systemId: { type: "string", description: "The _id of the system to compare upgrades for" },
        includeFinancing: {
          type: "boolean",
          description: "Whether to model financing options alongside cash scenarios",
        },
        triggerReason: {
          type: "string",
          description: "Why this comparison is being generated (threshold, user request, seasonal, symptom)",
        },
      },
      required: ["systemId", "triggerReason"],
    },
  },
  {
    name: "create_upgrade_savings_plan",
    description:
      "Once user selects a replacement/upgrade option, creates a personalized savings plan with " +
      "monthly targets, timeline, and milestones. Factors in available rebates to reduce the target.",
    input_schema: {
      type: "object" as const,
      properties: {
        systemId: { type: "string", description: "The _id of the system" },
        comparisonId: { type: "string", description: "The _id of the upgradeComparison" },
        selectedTier: {
          type: "string",
          enum: ["same_for_same", "moderate_upgrade", "technology_change"],
        },
        estimatedCost: { type: "number", description: "Midpoint of cost range" },
        targetDate: { type: "string", description: "ISO date when funds should be ready" },
        applyRebates: { type: "boolean", description: "Reduce target by expected rebate amounts" },
      },
      required: ["systemId", "comparisonId", "selectedTier", "estimatedCost", "targetDate"],
    },
  },
  {
    name: "initiate_upgrade_planning",
    description:
      "Proactive trigger tool. When a system crosses a planning threshold (50%, 70%, 85% Weibull), " +
      "generates the upgrade comparison and presents it as an interactive decision guide with a " +
      "personalized conversation starter. Just presenting information — no action taken.",
    input_schema: {
      type: "object" as const,
      properties: {
        systemId: { type: "string", description: "The _id of the system" },
        triggerReason: {
          type: "string",
          description: "Why now — threshold crossed, user request, seasonal opportunity, gotcha factor",
        },
        urgency: {
          type: "string",
          enum: ["low", "medium", "high", "critical"],
        },
      },
      required: ["systemId", "triggerReason", "urgency"],
    },
  },
  {
    name: "model_financing_scenario",
    description:
      "For higher-cost upgrades, models what financing would look like (home equity, personal loan, " +
      "manufacturer financing). Purely informational — no connection to any lender. No side effects.",
    input_schema: {
      type: "object" as const,
      properties: {
        estimatedCost: { type: "number", description: "Total cost to finance" },
        scenarios: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: {
                type: "string",
                enum: ["home_equity", "personal_loan", "manufacturer_financing", "credit_card"],
              },
              apr: { type: "number", description: "Annual percentage rate" },
              termMonths: { type: "number", description: "Loan term in months" },
            },
          },
          description: "Financing scenarios to model",
        },
      },
      required: ["estimatedCost", "scenarios"],
    },
  },
];

/**
 * Tools that require explicit user approval before execution.
 * Everything else auto-executes.
 */
export const APPROVAL_REQUIRED_TOOLS = new Set<string>([
  "schedule_future_check",
  "create_upgrade_savings_plan", // Modifies user's savings allocations
]);

/**
 * Tools that bypass all gating — executed immediately even in conservative mode.
 */
export const SAFETY_TOOLS = new Set<string>(["escalate_safety_concern"]);
