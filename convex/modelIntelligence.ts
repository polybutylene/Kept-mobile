import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import {
  modelIssueType,
  modelIssueSeverity,
  systemCategory,
} from "./schema";

// =====================================================
// MANUFACTURER QUERIES
// =====================================================

/**
 * Search for a manufacturer by name (fuzzy match)
 */
export const findManufacturer = query({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const searchTerm = args.name.toLowerCase().trim();
    
    // First try exact match
    const exactMatch = await ctx.db
      .query("manufacturers")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
    
    if (exactMatch) return exactMatch;
    
    // Search for partial matches
    const allManufacturers = await ctx.db
      .query("manufacturers")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();
    
    // Check aliases and fuzzy match
    for (const mfr of allManufacturers) {
      // Check canonical name
      if (mfr.name.toLowerCase().includes(searchTerm) || 
          searchTerm.includes(mfr.name.toLowerCase())) {
        return mfr;
      }
      
      // Check aliases
      for (const alias of mfr.aliases) {
        if (alias.toLowerCase().includes(searchTerm) || 
            searchTerm.includes(alias.toLowerCase())) {
          return mfr;
        }
      }
    }
    
    return null;
  },
});

/**
 * List all manufacturers, optionally filtered by category
 */
export const listManufacturers = query({
  args: {
    category: v.optional(systemCategory),
  },
  handler: async (ctx, args) => {
    let manufacturers = await ctx.db
      .query("manufacturers")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();
    
    if (args.category) {
      manufacturers = manufacturers.filter((m) => 
        m.categories.includes(args.category!)
      );
    }
    
    return manufacturers.sort((a, b) => a.name.localeCompare(b.name));
  },
});

// =====================================================
// MODEL DATABASE QUERIES
// =====================================================

/**
 * Find a model by manufacturer and model number
 */
export const findModel = query({
  args: {
    manufacturer: v.string(),
    modelNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const searchModel = args.modelNumber.toUpperCase().replace(/\s+/g, "");
    
    // First find the manufacturer
    const mfr = await ctx.db
      .query("manufacturers")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();
    
    const matchedMfr = mfr.find((m) => {
      const mfrName = m.name.toLowerCase();
      const searchMfr = args.manufacturer.toLowerCase();
      return mfrName.includes(searchMfr) || 
             searchMfr.includes(mfrName) ||
             m.aliases.some((a) => a.toLowerCase().includes(searchMfr));
    });
    
    if (!matchedMfr) return null;
    
    // Search for the model
    const models = await ctx.db
      .query("modelDatabase")
      .withIndex("by_manufacturer", (q) => q.eq("manufacturerId", matchedMfr._id))
      .collect();
    
    // Try exact match first
    let match = models.find((m) => 
      m.modelNumber.toUpperCase().replace(/\s+/g, "") === searchModel
    );
    
    // Try pattern match if no exact match
    if (!match) {
      match = models.find((m) => {
        if (!m.modelPattern) return false;
        try {
          const regex = new RegExp(m.modelPattern, "i");
          return regex.test(args.modelNumber);
        } catch {
          return false;
        }
      });
    }
    
    // Try partial match
    if (!match) {
      match = models.find((m) => 
        m.modelNumber.toUpperCase().includes(searchModel) ||
        searchModel.includes(m.modelNumber.toUpperCase())
      );
    }
    
    if (!match) return null;
    
    // Get system type info
    const systemType = await ctx.db.get(match.systemTypeId);
    
    return {
      ...match,
      manufacturer: matchedMfr,
      systemType,
    };
  },
});

/**
 * Get model by ID with all related data
 */
export const getModel = query({
  args: {
    modelId: v.id("modelDatabase"),
  },
  handler: async (ctx, args) => {
    const model = await ctx.db.get(args.modelId);
    if (!model) return null;
    
    const manufacturer = await ctx.db.get(model.manufacturerId);
    const systemType = await ctx.db.get(model.systemTypeId);
    
    // Get issues for this model
    const issues = await ctx.db
      .query("modelIssues")
      .withIndex("by_model", (q) => q.eq("modelId", args.modelId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    // Get parts for this model
    const parts = await ctx.db
      .query("modelParts")
      .withIndex("by_model", (q) => q.eq("modelId", args.modelId))
      .collect();
    
    // Get linked troubleshooting tree
    let troubleshootingTree = null;
    if (model.troubleshootingTreeId) {
      troubleshootingTree = await ctx.db.get(model.troubleshootingTreeId);
    }
    
    // Get linked maintenance guide
    let maintenanceGuide = null;
    if (model.maintenanceGuideId) {
      maintenanceGuide = await ctx.db.get(model.maintenanceGuideId);
    }
    
    return {
      ...model,
      manufacturer,
      systemType,
      issues,
      parts,
      troubleshootingTree,
      maintenanceGuide,
    };
  },
});

// =====================================================
// SYSTEM-SPECIFIC INTELLIGENCE
// =====================================================

/**
 * Get intelligence for a specific system based on its model info
 * This is the main entry point for model-specific guides
 */
export const getSystemIntelligence = query({
  args: {
    systemId: v.id("systems"),
  },
  handler: async (ctx, args) => {
    const system = await ctx.db.get(args.systemId);
    if (!system) return null;
    
    const systemType = await ctx.db.get(system.systemTypeId);
    
    // Result object
    const result: {
      system: typeof system;
      systemType: typeof systemType;
      modelMatch: any;
      issues: any[];
      recalls: any[];
      maintenanceTips: any[];
      troubleshootingGuides: any[];
      genericGuides: any[];
      decodedAge: { year?: number; month?: number } | null;
    } = {
      system,
      systemType,
      modelMatch: null,
      issues: [],
      recalls: [],
      maintenanceTips: [],
      troubleshootingGuides: [],
      genericGuides: [],
      decodedAge: null,
    };
    
    // Try to find model match if we have manufacturer and model
    if (system.manufacturer && system.modelNumber) {
      // Find manufacturer
      const manufacturers = await ctx.db
        .query("manufacturers")
        .withIndex("by_isActive", (q) => q.eq("isActive", true))
        .collect();
      
      const mfrSearch = system.manufacturer.toLowerCase();
      const matchedMfr = manufacturers.find((m) => {
        return m.name.toLowerCase().includes(mfrSearch) ||
               mfrSearch.includes(m.name.toLowerCase()) ||
               m.aliases.some((a) => a.toLowerCase().includes(mfrSearch));
      });
      
      if (matchedMfr) {
        // Search for model
        const models = await ctx.db
          .query("modelDatabase")
          .withIndex("by_manufacturer", (q) => q.eq("manufacturerId", matchedMfr._id))
          .collect();
        
        const modelSearch = system.modelNumber.toUpperCase().replace(/\s+/g, "");
        let modelMatch = models.find((m) => 
          m.modelNumber.toUpperCase().replace(/\s+/g, "") === modelSearch
        );
        
        // Pattern match
        if (!modelMatch) {
          modelMatch = models.find((m) => {
            if (!m.modelPattern) return false;
            try {
              return new RegExp(m.modelPattern, "i").test(system.modelNumber!);
            } catch {
              return false;
            }
          });
        }
        
        if (modelMatch) {
          result.modelMatch = {
            ...modelMatch,
            manufacturer: matchedMfr,
          };
          
          // Get model-specific issues
          const allIssues = await ctx.db
            .query("modelIssues")
            .withIndex("by_model", (q) => q.eq("modelId", modelMatch._id))
            .filter((q) => q.eq(q.field("isActive"), true))
            .collect();
          
          // Categorize issues
          result.recalls = allIssues.filter((i) => i.issueType === "recall");
          result.issues = allIssues.filter((i) => 
            i.issueType === "common_failure" || 
            i.issueType === "known_defect" ||
            i.issueType === "service_bulletin"
          );
          result.maintenanceTips = allIssues.filter((i) => 
            i.issueType === "maintenance_tip" ||
            i.issueType === "efficiency_tip"
          );
          
          // Get linked troubleshooting
          if (modelMatch.troubleshootingTreeId) {
            const tree = await ctx.db.get(modelMatch.troubleshootingTreeId);
            if (tree) {
              result.troubleshootingGuides.push(tree);
            }
          }
        }
        
        // Try to decode serial number for age
        if (system.serialNumber) {
          const patterns = await ctx.db
            .query("serialPatterns")
            .withIndex("by_manufacturer", (q) => q.eq("manufacturerId", matchedMfr._id))
            .collect();
          
          for (const pattern of patterns) {
            try {
              const regex = new RegExp(pattern.pattern);
              if (regex.test(system.serialNumber)) {
                result.decodedAge = decodeSerialAge(system.serialNumber, pattern);
                break;
              }
            } catch {
              continue;
            }
          }
        }
      }
    }
    
    // Get generic guides for system type (fallback or supplemental)
    if (systemType) {
      const genericArticles = await ctx.db
        .query("knowledgeArticles")
        .withIndex("by_systemType", (q) => q.eq("systemTypeId", system.systemTypeId))
        .filter((q) => q.eq(q.field("status"), "published"))
        .collect();
      
      result.genericGuides = genericArticles;
      
      // Get generic diagnostic trees
      const genericTrees = await ctx.db
        .query("diagnosticTrees")
        .withIndex("by_systemType", (q) => q.eq("systemTypeId", system.systemTypeId))
        .filter((q) => q.eq(q.field("status"), "published"))
        .collect();
      
      // Add to troubleshooting (avoiding duplicates)
      const existingTreeIds = new Set(result.troubleshootingGuides.map((t: any) => t._id));
      for (const tree of genericTrees) {
        if (!existingTreeIds.has(tree._id)) {
          result.troubleshootingGuides.push(tree);
        }
      }
    }
    
    return result;
  },
});

/**
 * Helper to decode serial number age
 */
function decodeSerialAge(
  serial: string, 
  pattern: {
    yearPosition?: { start: number; length: number; format: string };
    monthPosition?: { start: number; length: number; format: string };
  }
): { year?: number; month?: number } | null {
  const result: { year?: number; month?: number } = {};
  
  try {
    if (pattern.yearPosition) {
      const yearStr = serial.substring(
        pattern.yearPosition.start,
        pattern.yearPosition.start + pattern.yearPosition.length
      );
      
      switch (pattern.yearPosition.format) {
        case "year_2digit":
          const yr = parseInt(yearStr, 10);
          result.year = yr > 50 ? 1900 + yr : 2000 + yr;
          break;
        case "year_4digit":
          result.year = parseInt(yearStr, 10);
          break;
        case "year_letter":
          // A=2001, B=2002, etc. (common HVAC pattern)
          const letterCode = yearStr.toUpperCase().charCodeAt(0) - 65;
          result.year = 2001 + letterCode;
          break;
        case "week_year":
          // WWYY format
          const week = parseInt(yearStr.substring(0, 2), 10);
          const year = parseInt(yearStr.substring(2), 10);
          result.year = year > 50 ? 1900 + year : 2000 + year;
          break;
      }
    }
    
    if (pattern.monthPosition) {
      const monthStr = serial.substring(
        pattern.monthPosition.start,
        pattern.monthPosition.start + pattern.monthPosition.length
      );
      
      switch (pattern.monthPosition.format) {
        case "month_2digit":
          result.month = parseInt(monthStr, 10);
          break;
        case "month_letter":
          // A=1, B=2, etc.
          result.month = monthStr.toUpperCase().charCodeAt(0) - 64;
          break;
      }
    }
    
    return Object.keys(result).length > 0 ? result : null;
  } catch {
    return null;
  }
}

// =====================================================
// MODEL ISSUES QUERIES
// =====================================================

/**
 * Get all active recalls for a system type
 */
export const getActiveRecalls = query({
  args: {
    systemTypeId: v.optional(v.id("systemTypes")),
    manufacturerId: v.optional(v.id("manufacturers")),
  },
  handler: async (ctx, args) => {
    let issues = await ctx.db
      .query("modelIssues")
      .withIndex("by_type", (q) => q.eq("issueType", "recall"))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    // Filter by manufacturer if specified
    if (args.manufacturerId) {
      const mfrId = args.manufacturerId;
      const models = await ctx.db
        .query("modelDatabase")
        .withIndex("by_manufacturer", (q) => q.eq("manufacturerId", mfrId))
        .collect();
      const modelIds = new Set(models.map((m) => m._id));
      issues = issues.filter((i) => modelIds.has(i.modelId));
    }
    
    // Filter by system type if specified
    if (args.systemTypeId) {
      const sysTypeId = args.systemTypeId;
      const models = await ctx.db
        .query("modelDatabase")
        .withIndex("by_systemType", (q) => q.eq("systemTypeId", sysTypeId))
        .collect();
      const modelIds = new Set(models.map((m) => m._id));
      issues = issues.filter((i) => modelIds.has(i.modelId));
    }
    
    // Enrich with model and manufacturer info
    const enriched = await Promise.all(
      issues.map(async (issue) => {
        const model = await ctx.db.get(issue.modelId);
        const manufacturer = model ? await ctx.db.get(model.manufacturerId) : null;
        return {
          ...issue,
          model,
          manufacturer,
        };
      })
    );
    
    return enriched;
  },
});

/**
 * Check if a specific serial number is affected by any recalls
 */
export const checkRecallBySerial = query({
  args: {
    manufacturer: v.string(),
    modelNumber: v.string(),
    serialNumber: v.string(),
  },
  handler: async (ctx, args) => {
    // Find the model
    const manufacturers = await ctx.db
      .query("manufacturers")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();
    
    const mfrSearch = args.manufacturer.toLowerCase();
    const matchedMfr = manufacturers.find((m) => 
      m.name.toLowerCase().includes(mfrSearch) ||
      m.aliases.some((a) => a.toLowerCase().includes(mfrSearch))
    );
    
    if (!matchedMfr) return { recalled: false, recalls: [] };
    
    const models = await ctx.db
      .query("modelDatabase")
      .withIndex("by_manufacturer", (q) => q.eq("manufacturerId", matchedMfr._id))
      .collect();
    
    const modelSearch = args.modelNumber.toUpperCase().replace(/\s+/g, "");
    const matchedModel = models.find((m) => 
      m.modelNumber.toUpperCase().replace(/\s+/g, "").includes(modelSearch) ||
      modelSearch.includes(m.modelNumber.toUpperCase().replace(/\s+/g, ""))
    );
    
    if (!matchedModel) return { recalled: false, recalls: [] };
    
    // Get recalls for this model
    const recalls = await ctx.db
      .query("modelIssues")
      .withIndex("by_model", (q) => q.eq("modelId", matchedModel._id))
      .filter((q) => 
        q.and(
          q.eq(q.field("issueType"), "recall"),
          q.eq(q.field("isActive"), true)
        )
      )
      .collect();
    
    // Check if serial is in affected range
    const affectedRecalls = recalls.filter((recall) => {
      if (!recall.affectedSerialRanges || recall.affectedSerialRanges.length === 0) {
        return true; // All serials affected if no range specified
      }
      
      return recall.affectedSerialRanges.some((range) => {
        return args.serialNumber >= range.start && args.serialNumber <= range.end;
      });
    });
    
    return {
      recalled: affectedRecalls.length > 0,
      recalls: affectedRecalls,
      model: matchedModel,
      manufacturer: matchedMfr,
    };
  },
});

// =====================================================
// DATA MANAGEMENT MUTATIONS
// =====================================================

/**
 * Add a new manufacturer
 */
export const addManufacturer = mutation({
  args: {
    name: v.string(),
    aliases: v.optional(v.array(v.string())),
    website: v.optional(v.string()),
    supportPhone: v.optional(v.string()),
    supportUrl: v.optional(v.string()),
    warrantyLookupUrl: v.optional(v.string()),
    partsLookupUrl: v.optional(v.string()),
    categories: v.array(systemCategory),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("manufacturers", {
      name: args.name,
      aliases: args.aliases || [],
      website: args.website,
      supportPhone: args.supportPhone,
      supportUrl: args.supportUrl,
      warrantyLookupUrl: args.warrantyLookupUrl,
      partsLookupUrl: args.partsLookupUrl,
      categories: args.categories,
      isActive: true,
    });
    return { id };
  },
});

/**
 * Add a model to the database
 */
export const addModel = mutation({
  args: {
    manufacturerId: v.id("manufacturers"),
    systemTypeId: v.id("systemTypes"),
    modelNumber: v.string(),
    modelPattern: v.optional(v.string()),
    modelSeries: v.optional(v.string()),
    productName: v.optional(v.string()),
    description: v.optional(v.string()),
    yearsProduced: v.optional(v.object({
      start: v.number(),
      end: v.optional(v.number()),
    })),
    specs: v.optional(v.object({
      capacity: v.optional(v.string()),
      efficiency: v.optional(v.string()),
      fuelType: v.optional(v.string()),
      voltage: v.optional(v.string()),
      dimensions: v.optional(v.string()),
    })),
    expectedLifespanYears: v.optional(v.number()),
    typicalFailurePoints: v.optional(v.array(v.string())),
    manualUrl: v.optional(v.string()),
    partsListUrl: v.optional(v.string()),
    installGuideUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("modelDatabase", args);
    return { id };
  },
});

/**
 * Add a model issue (recall, common problem, etc.)
 */
export const addModelIssue = mutation({
  args: {
    modelId: v.id("modelDatabase"),
    issueType: modelIssueType,
    severity: modelIssueSeverity,
    title: v.string(),
    description: v.string(),
    symptoms: v.optional(v.array(v.string())),
    affectedSerialRanges: v.optional(v.array(v.object({
      start: v.string(),
      end: v.string(),
    }))),
    affectedYears: v.optional(v.array(v.number())),
    fixDescription: v.optional(v.string()),
    diyPossible: v.boolean(),
    estimatedCost: v.optional(v.object({
      diyLow: v.number(),
      diyHigh: v.number(),
      proLow: v.number(),
      proHigh: v.number(),
    })),
    partsNeeded: v.optional(v.array(v.string())),
    recallNumber: v.optional(v.string()),
    recallDate: v.optional(v.string()),
    recallUrl: v.optional(v.string()),
    relatedArticleId: v.optional(v.id("knowledgeArticles")),
    relatedDiagnosticId: v.optional(v.id("diagnosticTrees")),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("modelIssues", {
      ...args,
      isActive: true,
      verifiedAt: Date.now(),
    });
    return { id };
  },
});

/**
 * Add serial number decoding pattern for a manufacturer
 */
export const addSerialPattern = mutation({
  args: {
    manufacturerId: v.id("manufacturers"),
    pattern: v.string(),
    description: v.string(),
    yearPosition: v.optional(v.object({
      start: v.number(),
      length: v.number(),
      format: v.union(
        v.literal("year_2digit"),
        v.literal("year_4digit"),
        v.literal("year_letter"),
        v.literal("week_year")
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
    exampleSerial: v.optional(v.string()),
    exampleDecoded: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("serialPatterns", args);
    return { id };
  },
});
