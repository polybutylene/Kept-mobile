// ─────────────────────────────────────────────────────────────────────────────
// System Catalog Seed Data — HVAC & Plumbing
// Source: ASHRAE equipment life expectancy, ACCA service records, manufacturer
//         warranty data, NAHI home inspection data, field experience.
// Cost basis: 2025 US National Average
// Regional focus: Florida Panhandle (Gulf Coast hot-humid)
// ─────────────────────────────────────────────────────────────────────────────

export const HVAC_CATALOG = [
  // ================================================================
  // 1. CENTRAL AIR CONDITIONER (Split System)
  // ================================================================
  {
    catalogId: "hvac.central_ac",
    category: "hvac",
    subcategory: "cooling",
    systemName: "Central Air Conditioner (Split System)",
    trackingLevel: "major_system" as const,
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 10, median: 15, high: 22 },
    weibullShape: 3.5,
    weibullScale: 17.2,
    regionalFactors: [
      { region: "gulf_coast", adjustmentFactor: 0.82, reason: "Continuous summer run cycles 8-10 months/year, high condensate load, salt air corrosion in coastal panhandle" },
      { region: "southeast_humid", adjustmentFactor: 0.85, reason: "Extended cooling season accelerates compressor wear" },
      { region: "northeast", adjustmentFactor: 1.08, reason: "Shorter cooling seasons reduce compressor run hours" },
      { region: "desert_southwest", adjustmentFactor: 0.88, reason: "Extreme heat and dust infiltration degrade condenser coils" },
      { region: "pacific_northwest", adjustmentFactor: 0.78, reason: "Salt air corrosion dominant on outdoor components in coastal areas" },
    ],
    replacementCost: { low: 3500, median: 5200, high: 7500 },
    dataFields: [
      { fieldName: "make", fieldType: "text", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "model", fieldType: "text", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "serial_number", fieldType: "text", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "year_installed", fieldType: "number", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "tonnage", fieldType: "select", options: ["1.5", "2", "2.5", "3", "3.5", "4", "5"], required: false, inspectorField: true, homeownerField: true },
      { fieldName: "seer_rating", fieldType: "number", required: false, inspectorField: true, homeownerField: false },
      { fieldName: "refrigerant_type", fieldType: "select", options: ["R-22", "R-410A", "R-32", "R-454B"], required: false, inspectorField: true, homeownerField: false },
      { fieldName: "condition_rating", fieldType: "select", options: ["excellent", "good", "fair", "poor", "failed"], required: false, inspectorField: true, homeownerField: false },
      { fieldName: "condenser_location", fieldType: "select", options: ["side_yard", "backyard", "front", "rooftop"], required: false, inspectorField: true, homeownerField: false },
    ],
    maintenanceTaskIds: [
      "hvac_cac_001", "hvac_cac_002", "hvac_cac_003", "hvac_cac_004",
      "hvac_cac_005", "hvac_cac_006", "hvac_cac_007", "hvac_cac_008",
      "hvac_cac_009", "hvac_cac_010",
    ],
    iotCompatible: true,
    iotDeviceTypes: ["smart_thermostat", "temperature_sensor", "energy_monitor"],
    careKitProductTypes: ["hvac_filter", "coil_cleaner", "condensate_tablets"],
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // 2. HEAT PUMP
  // ================================================================
  {
    catalogId: "hvac.heat_pump",
    category: "hvac",
    subcategory: "cooling",
    systemName: "Heat Pump (Air-Source)",
    trackingLevel: "major_system" as const,
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 10, median: 15, high: 21 },
    weibullShape: 3.2,
    weibullScale: 16.0,
    regionalFactors: [
      { region: "gulf_coast", adjustmentFactor: 0.85, reason: "Year-round operation with heavy cooling demand; reversing valve sees constant use" },
      { region: "northeast", adjustmentFactor: 0.80, reason: "Cold-climate defrost cycles and low-temperature stress on compressor" },
      { region: "desert_southwest", adjustmentFactor: 0.88, reason: "Heavy cooling demand plus heating in winter" },
      { region: "pacific_northwest", adjustmentFactor: 0.82, reason: "Salt air corrosion, but mild temps reduce thermal stress" },
    ],
    replacementCost: { low: 4500, median: 6500, high: 9000 },
    dataFields: [
      { fieldName: "make", fieldType: "text", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "model", fieldType: "text", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "serial_number", fieldType: "text", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "year_installed", fieldType: "number", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "tonnage", fieldType: "select", options: ["1.5", "2", "2.5", "3", "3.5", "4", "5"], required: false, inspectorField: true, homeownerField: true },
      { fieldName: "seer_rating", fieldType: "number", required: false, inspectorField: true, homeownerField: false },
      { fieldName: "hspf_rating", fieldType: "number", required: false, inspectorField: true, homeownerField: false },
      { fieldName: "refrigerant_type", fieldType: "select", options: ["R-22", "R-410A", "R-32", "R-454B"], required: false, inspectorField: true, homeownerField: false },
      { fieldName: "has_aux_heat", fieldType: "boolean", required: false, inspectorField: true, homeownerField: false },
    ],
    maintenanceTaskIds: [
      "hvac_hp_001", "hvac_hp_002", "hvac_hp_003", "hvac_hp_004", "hvac_hp_005",
      "hvac_cac_001", "hvac_cac_003", "hvac_cac_005",
    ],
    iotCompatible: true,
    iotDeviceTypes: ["smart_thermostat", "temperature_sensor", "energy_monitor"],
    careKitProductTypes: ["hvac_filter", "coil_cleaner", "condensate_tablets"],
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // 3. GAS FURNACE
  // ================================================================
  {
    catalogId: "hvac.furnace_gas",
    category: "hvac",
    subcategory: "heating",
    systemName: "Gas Furnace",
    trackingLevel: "major_system" as const,
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 12, median: 20, high: 27 },
    weibullShape: 3.8,
    weibullScale: 21.0,
    regionalFactors: [
      { region: "gulf_coast", adjustmentFactor: 1.15, reason: "Light use — 2-3 months/year in mild winters extends life significantly" },
      { region: "northeast", adjustmentFactor: 0.85, reason: "6-7 months of heavy use with maximum thermal cycling" },
      { region: "midwest", adjustmentFactor: 0.88, reason: "Extended heating season with hard-run cycles" },
      { region: "pacific_northwest", adjustmentFactor: 1.05, reason: "Mild heating demand, gentle operation" },
    ],
    replacementCost: { low: 2500, median: 3800, high: 6500 },
    dataFields: [
      { fieldName: "make", fieldType: "text", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "model", fieldType: "text", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "serial_number", fieldType: "text", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "year_installed", fieldType: "number", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "btu_rating", fieldType: "select", options: ["40000", "60000", "80000", "100000", "120000"], required: false, inspectorField: true, homeownerField: false },
      { fieldName: "afue_rating", fieldType: "number", required: false, inspectorField: true, homeownerField: false },
      { fieldName: "fuel_type", fieldType: "select", options: ["natural_gas", "propane"], required: true, inspectorField: true, homeownerField: true },
      { fieldName: "stages", fieldType: "select", options: ["single", "two_stage", "modulating"], required: false, inspectorField: true, homeownerField: false },
      { fieldName: "venting_type", fieldType: "select", options: ["natural_draft", "induced_draft", "direct_vent", "condensing"], required: false, inspectorField: true, homeownerField: false },
      { fieldName: "heat_exchanger_condition", fieldType: "select", options: ["good", "surface_rust", "cracked", "unknown"], required: false, inspectorField: true, homeownerField: false },
    ],
    maintenanceTaskIds: [
      "hvac_gf_001", "hvac_gf_002", "hvac_gf_003", "hvac_gf_004",
      "hvac_gf_005", "hvac_gf_006", "hvac_gf_007",
    ],
    iotCompatible: true,
    iotDeviceTypes: ["smart_thermostat", "co_detector", "temperature_sensor"],
    careKitProductTypes: ["hvac_filter", "combustion_analyzer_service"],
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // 4. ELECTRIC FURNACE
  // ================================================================
  {
    catalogId: "hvac.furnace_electric",
    category: "hvac",
    subcategory: "heating",
    systemName: "Electric Furnace",
    trackingLevel: "major_system" as const,
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 12, median: 20, high: 29 },
    weibullShape: 2.5,
    weibullScale: 22.0,
    regionalFactors: [
      { region: "gulf_coast", adjustmentFactor: 1.15, reason: "Minimal use in mild winters; heating elements barely cycle" },
      { region: "northeast", adjustmentFactor: 0.85, reason: "Heavy use, high element cycling 6+ months" },
      { region: "desert_southwest", adjustmentFactor: 1.05, reason: "Short heating season" },
    ],
    replacementCost: { low: 1500, median: 2300, high: 3500 },
    dataFields: [
      { fieldName: "make", fieldType: "text", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "model", fieldType: "text", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "serial_number", fieldType: "text", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "year_installed", fieldType: "number", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "kw_rating", fieldType: "select", options: ["10", "15", "20", "25"], required: false, inspectorField: true, homeownerField: false },
    ],
    maintenanceTaskIds: ["hvac_cac_001", "hvac_gf_002"],
    iotCompatible: true,
    iotDeviceTypes: ["smart_thermostat", "temperature_sensor"],
    careKitProductTypes: ["hvac_filter"],
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // 5. AIR HANDLER
  // ================================================================
  {
    catalogId: "hvac.air_handler",
    category: "hvac",
    subcategory: "air_distribution",
    systemName: "Air Handler",
    trackingLevel: "major_system" as const,
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 10, median: 17, high: 24 },
    weibullShape: 3.2,
    weibullScale: 18.0,
    regionalFactors: [
      { region: "gulf_coast", adjustmentFactor: 0.82, reason: "Constant condensate exposure, drain pan corrosion, coil stress from continuous cooling 8+ months" },
      { region: "southeast_humid", adjustmentFactor: 0.85, reason: "High moisture environment accelerates corrosion" },
      { region: "northeast", adjustmentFactor: 1.02, reason: "Less cooling demand, electric heat strips add some wear" },
      { region: "pacific_northwest", adjustmentFactor: 0.88, reason: "Moisture concerns in crawlspace installations" },
    ],
    replacementCost: { low: 2000, median: 3200, high: 5000 },
    dataFields: [
      { fieldName: "make", fieldType: "text", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "model", fieldType: "text", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "serial_number", fieldType: "text", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "year_installed", fieldType: "number", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "tonnage", fieldType: "select", options: ["2", "2.5", "3", "3.5", "4", "5"], required: false, inspectorField: true, homeownerField: true },
      { fieldName: "has_electric_heat_strips", fieldType: "boolean", required: false, inspectorField: true, homeownerField: false },
      { fieldName: "drain_pan_condition", fieldType: "select", options: ["good", "surface_rust", "corroded", "leaking"], required: false, inspectorField: true, homeownerField: false },
    ],
    maintenanceTaskIds: ["hvac_cac_001", "hvac_cac_003", "hvac_cac_005", "hvac_cac_009"],
    iotCompatible: true,
    iotDeviceTypes: ["smart_thermostat", "leak_sensor", "temperature_sensor"],
    careKitProductTypes: ["hvac_filter", "coil_cleaner", "condensate_tablets", "drain_pan_treatment"],
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // 6. MINI-SPLIT (SINGLE ZONE)
  // ================================================================
  {
    catalogId: "hvac.mini_split_single",
    category: "hvac",
    subcategory: "cooling",
    systemName: "Ductless Mini-Split (Single Zone)",
    trackingLevel: "major_system" as const,
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 8, median: 14, high: 20 },
    weibullShape: 3.0,
    weibullScale: 15.5,
    regionalFactors: [
      { region: "gulf_coast", adjustmentFactor: 0.85, reason: "Continuous cooling operation; condensate management critical in high humidity" },
      { region: "northeast", adjustmentFactor: 0.82, reason: "Cold-climate models essential; standard units lose capacity below 15°F" },
      { region: "pacific_northwest", adjustmentFactor: 0.80, reason: "Salt air on outdoor unit in coastal areas" },
    ],
    replacementCost: { low: 2000, median: 3500, high: 5000 },
    dataFields: [
      { fieldName: "make", fieldType: "text", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "model", fieldType: "text", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "serial_number", fieldType: "text", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "year_installed", fieldType: "number", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "btu_capacity", fieldType: "select", options: ["9000", "12000", "15000", "18000", "24000"], required: false, inspectorField: true, homeownerField: true },
      { fieldName: "indoor_head_location", fieldType: "text", required: false, inspectorField: true, homeownerField: true },
    ],
    maintenanceTaskIds: ["hvac_ms_001", "hvac_ms_002", "hvac_ms_003", "hvac_ms_004"],
    iotCompatible: true,
    iotDeviceTypes: ["smart_thermostat", "temperature_sensor"],
    careKitProductTypes: ["mini_split_cleaner", "coil_cleaner"],
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // 7. MINI-SPLIT (MULTI ZONE)
  // ================================================================
  {
    catalogId: "hvac.mini_split_multi",
    category: "hvac",
    subcategory: "cooling",
    systemName: "Ductless Mini-Split (Multi Zone)",
    trackingLevel: "major_system" as const,
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 8, median: 13, high: 19 },
    weibullShape: 2.8,
    weibullScale: 14.5,
    regionalFactors: [
      { region: "gulf_coast", adjustmentFactor: 0.83, reason: "Heavy year-round load across multiple zones in sustained heat" },
      { region: "northeast", adjustmentFactor: 0.78, reason: "Compressor works hardest in extreme cold across multiple zones" },
      { region: "pacific_northwest", adjustmentFactor: 0.80, reason: "Salt air corrosion on outdoor unit" },
    ],
    replacementCost: { low: 5000, median: 9000, high: 15000 },
    dataFields: [
      { fieldName: "make", fieldType: "text", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "model", fieldType: "text", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "serial_number", fieldType: "text", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "year_installed", fieldType: "number", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "zone_count", fieldType: "select", options: ["2", "3", "4", "5"], required: true, inspectorField: true, homeownerField: true },
      { fieldName: "total_btu", fieldType: "select", options: ["24000", "36000", "48000", "60000"], required: false, inspectorField: true, homeownerField: false },
    ],
    maintenanceTaskIds: ["hvac_ms_001", "hvac_ms_002", "hvac_ms_003", "hvac_ms_004"],
    iotCompatible: true,
    iotDeviceTypes: ["smart_thermostat", "temperature_sensor", "zone_controller"],
    careKitProductTypes: ["mini_split_cleaner", "coil_cleaner"],
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // 8. GAS BOILER
  // ================================================================
  {
    catalogId: "hvac.boiler_gas",
    category: "hvac",
    subcategory: "heating",
    systemName: "Gas Boiler (Hydronic)",
    trackingLevel: "major_system" as const,
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 15, median: 24, high: 33 },
    weibullShape: 3.5,
    weibullScale: 26.0,
    regionalFactors: [
      { region: "gulf_coast", adjustmentFactor: 1.10, reason: "Rare in hot climates; very light use when present extends life" },
      { region: "northeast", adjustmentFactor: 0.88, reason: "6-7 months heavy operation with maximum thermal cycling" },
      { region: "midwest", adjustmentFactor: 0.90, reason: "Extended heating season with hard use" },
      { region: "pacific_northwest", adjustmentFactor: 1.0, reason: "Mild heating load, steady operation" },
    ],
    replacementCost: { low: 4000, median: 7500, high: 12000 },
    dataFields: [
      { fieldName: "make", fieldType: "text", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "model", fieldType: "text", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "serial_number", fieldType: "text", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "year_installed", fieldType: "number", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "btu_rating", fieldType: "select", options: ["75000", "100000", "150000", "200000"], required: false, inspectorField: true, homeownerField: false },
      { fieldName: "afue_rating", fieldType: "number", required: false, inspectorField: true, homeownerField: false },
      { fieldName: "boiler_type", fieldType: "select", options: ["cast_iron", "condensing", "steam"], required: false, inspectorField: true, homeownerField: false },
      { fieldName: "distribution_type", fieldType: "select", options: ["baseboard", "radiator", "radiant_floor", "fan_coil"], required: false, inspectorField: true, homeownerField: false },
    ],
    maintenanceTaskIds: ["hvac_gf_003", "hvac_gf_005"],
    iotCompatible: true,
    iotDeviceTypes: ["smart_thermostat", "boiler_monitor", "co_detector"],
    careKitProductTypes: ["boiler_water_treatment"],
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // 9. DUCTWORK
  // ================================================================
  {
    catalogId: "hvac.ductwork",
    category: "hvac",
    subcategory: "air_distribution",
    systemName: "Ductwork",
    trackingLevel: "component" as const,
    visibleToHomeowner: false,
    inspectorOnly: true,
    expectedLifeYears: { low: 15, median: 30, high: 55 },
    weibullShape: 3.8,
    weibullScale: 32.0,
    regionalFactors: [
      { region: "gulf_coast", adjustmentFactor: 0.80, reason: "Condensation on cold duct surfaces in humid air causes corrosion; flex duct outer jacket deteriorates in 150°F+ attics" },
      { region: "southeast_humid", adjustmentFactor: 0.82, reason: "High humidity accelerates joint seal and insulation degradation" },
      { region: "northeast", adjustmentFactor: 0.95, reason: "Temperature extremes in unconditioned spaces stress joints" },
      { region: "desert_southwest", adjustmentFactor: 1.05, reason: "Dry conditions preserve ductwork; dust accumulation is the main concern" },
    ],
    replacementCost: { low: 2000, median: 5000, high: 12000 },
    dataFields: [
      { fieldName: "duct_material", fieldType: "select", options: ["sheet_metal", "flex", "fiberglass_duct_board", "mixed"], required: true, inspectorField: true, homeownerField: false },
      { fieldName: "duct_location", fieldType: "select", options: ["attic", "crawlspace", "basement", "interior_walls", "slab"], required: true, inspectorField: true, homeownerField: false },
      { fieldName: "insulation_condition", fieldType: "select", options: ["good", "damaged", "missing", "compressed"], required: false, inspectorField: true, homeownerField: false },
      { fieldName: "visible_leaks", fieldType: "boolean", required: false, inspectorField: true, homeownerField: false },
      { fieldName: "estimated_leakage", fieldType: "select", options: ["tight_under_5pct", "moderate_5_15pct", "leaky_15_plus_pct"], required: false, inspectorField: true, homeownerField: false },
    ],
    maintenanceTaskIds: ["hvac_duct_001", "hvac_duct_002", "hvac_duct_003", "hvac_duct_004"],
    iotCompatible: false,
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // 10. THERMOSTAT
  // ================================================================
  {
    catalogId: "hvac.thermostat",
    category: "hvac",
    subcategory: "controls",
    systemName: "Thermostat",
    trackingLevel: "component" as const,
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 5, median: 10, high: 20 },
    weibullShape: 1.8,
    weibullScale: 12.0,
    replacementCost: { low: 50, median: 200, high: 350 },
    dataFields: [
      { fieldName: "make", fieldType: "text", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "model", fieldType: "text", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "thermostat_type", fieldType: "select", options: ["manual", "programmable", "smart_wifi"], required: true, inspectorField: true, homeownerField: true },
      { fieldName: "has_c_wire", fieldType: "boolean", required: false, inspectorField: true, homeownerField: false },
    ],
    maintenanceTaskIds: ["hvac_tstat_001", "hvac_tstat_002", "hvac_tstat_003"],
    iotCompatible: true,
    iotDeviceTypes: ["smart_thermostat"],
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // 11. PACKAGE UNIT
  // ================================================================
  {
    catalogId: "hvac.package_unit",
    category: "hvac",
    subcategory: "cooling",
    systemName: "Package Unit (Self-Contained)",
    trackingLevel: "major_system" as const,
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 8, median: 14, high: 20 },
    weibullShape: 3.2,
    weibullScale: 15.8,
    regionalFactors: [
      { region: "gulf_coast", adjustmentFactor: 0.78, reason: "Full outdoor exposure accelerates degradation; very common unit type in Gulf Coast manufactured/slab homes" },
      { region: "southeast_humid", adjustmentFactor: 0.80, reason: "All components exposed to weather year-round" },
      { region: "northeast", adjustmentFactor: 1.05, reason: "Shorter cooling season when present" },
      { region: "pacific_northwest", adjustmentFactor: 0.75, reason: "Aggressive salt corrosion on entire unit in coastal areas" },
    ],
    replacementCost: { low: 4000, median: 5800, high: 8500 },
    dataFields: [
      { fieldName: "make", fieldType: "text", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "model", fieldType: "text", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "serial_number", fieldType: "text", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "year_installed", fieldType: "number", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "tonnage", fieldType: "select", options: ["2", "2.5", "3", "3.5", "4", "5"], required: false, inspectorField: true, homeownerField: true },
      { fieldName: "mounting", fieldType: "select", options: ["ground_slab", "rooftop", "elevated_platform"], required: false, inspectorField: true, homeownerField: false },
      { fieldName: "fuel_type", fieldType: "select", options: ["electric_electric", "gas_electric"], required: false, inspectorField: true, homeownerField: false },
    ],
    maintenanceTaskIds: [
      "hvac_cac_001", "hvac_cac_002", "hvac_cac_003", "hvac_cac_005",
      "hvac_cac_006", "hvac_cac_010",
    ],
    iotCompatible: true,
    iotDeviceTypes: ["smart_thermostat", "energy_monitor"],
    careKitProductTypes: ["hvac_filter", "coil_cleaner", "condensate_tablets"],
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // 12. WHOLE-HOUSE DEHUMIDIFIER
  // ================================================================
  {
    catalogId: "hvac.whole_house_dehumidifier",
    category: "hvac",
    subcategory: "air_quality",
    systemName: "Whole-House Dehumidifier",
    trackingLevel: "component" as const,
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 6, median: 10, high: 15 },
    weibullShape: 3.0,
    weibullScale: 11.0,
    regionalFactors: [
      { region: "gulf_coast", adjustmentFactor: 0.75, reason: "Runs almost continuously 8-10 months/year; maximum compressor hours; essential equipment in panhandle" },
      { region: "southeast_humid", adjustmentFactor: 0.78, reason: "Extended humidity season demands near-continuous operation" },
      { region: "northeast", adjustmentFactor: 1.15, reason: "Only needed in summer, low annual hours" },
      { region: "desert_southwest", adjustmentFactor: 1.30, reason: "Rarely needed in dry climate" },
    ],
    replacementCost: { low: 1500, median: 2200, high: 3500 },
    dataFields: [
      { fieldName: "make", fieldType: "text", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "model", fieldType: "text", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "year_installed", fieldType: "number", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "pints_per_day", fieldType: "select", options: ["70", "90", "120", "150"], required: false, inspectorField: true, homeownerField: false },
      { fieldName: "ducted", fieldType: "boolean", required: false, inspectorField: true, homeownerField: false },
    ],
    maintenanceTaskIds: ["hvac_hd_001", "hvac_hd_002"],
    iotCompatible: true,
    iotDeviceTypes: ["humidity_sensor", "smart_dehumidifier_controller"],
    careKitProductTypes: ["dehumidifier_filter", "condensate_tablets"],
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // 13. CONDENSATE PUMP
  // ================================================================
  {
    catalogId: "hvac.condensate_pump",
    category: "hvac",
    subcategory: "air_distribution",
    systemName: "Condensate Pump",
    trackingLevel: "component" as const,
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 3, median: 6, high: 10 },
    weibullShape: 2.5,
    weibullScale: 7.0,
    regionalFactors: [
      { region: "gulf_coast", adjustmentFactor: 0.70, reason: "Extremely high condensate volume; runs constantly during 8+ month cooling season; #1 HVAC service call in panhandle" },
      { region: "southeast_humid", adjustmentFactor: 0.75, reason: "Heavy condensate production overwhelms pumps" },
      { region: "northeast", adjustmentFactor: 1.05, reason: "Low cooling-season condensate" },
      { region: "desert_southwest", adjustmentFactor: 1.10, reason: "Low condensate volume in dry climate" },
    ],
    replacementCost: { low: 100, median: 175, high: 300 },
    dataFields: [
      { fieldName: "make", fieldType: "text", required: false, inspectorField: true, homeownerField: false },
      { fieldName: "year_installed", fieldType: "number", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "has_safety_switch", fieldType: "boolean", required: false, inspectorField: true, homeownerField: false },
    ],
    maintenanceTaskIds: ["hvac_cac_009"],
    iotCompatible: true,
    iotDeviceTypes: ["leak_sensor", "float_switch_monitor"],
    careKitProductTypes: ["condensate_tablets", "algae_treatment"],
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // 14. UV AIR PURIFIER
  // ================================================================
  {
    catalogId: "hvac.uv_air_purifier",
    category: "hvac",
    subcategory: "air_quality",
    systemName: "UV-C Air Purifier (In-Duct)",
    trackingLevel: "component" as const,
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 2, median: 3, high: 5 },
    weibullShape: 4.0,
    weibullScale: 3.5,
    regionalFactors: [
      { region: "gulf_coast", adjustmentFactor: 0.90, reason: "Continuous operation reduces bulb life; highly recommended for mold prevention on evaporator coils" },
      { region: "northeast", adjustmentFactor: 1.05, reason: "Less continuous operation during heating season" },
    ],
    replacementCost: { low: 50, median: 100, high: 200 },
    dataFields: [
      { fieldName: "make", fieldType: "text", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "model", fieldType: "text", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "year_installed", fieldType: "number", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "uv_type", fieldType: "select", options: ["coil_sterilization", "air_sterilization", "photocatalytic"], required: false, inspectorField: true, homeownerField: false },
    ],
    maintenanceTaskIds: [],
    iotCompatible: false,
    careKitProductTypes: ["uv_replacement_bulb"],
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // 15. BATHROOM EXHAUST FAN
  // ================================================================
  {
    catalogId: "hvac.bathroom_exhaust_fan",
    category: "hvac",
    subcategory: "ventilation",
    systemName: "Bathroom Exhaust Fan",
    trackingLevel: "fixture" as const,
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 5, median: 10, high: 17 },
    weibullShape: 2.5,
    weibullScale: 12.0,
    regionalFactors: [
      { region: "gulf_coast", adjustmentFactor: 0.80, reason: "Constant moisture exposure; critical for mold prevention in panhandle; run frequently year-round" },
      { region: "southeast_humid", adjustmentFactor: 0.82, reason: "Heavy moisture load accelerates bearing wear" },
      { region: "desert_southwest", adjustmentFactor: 1.10, reason: "Low moisture, infrequent use" },
    ],
    replacementCost: { low: 100, median: 200, high: 350 },
    dataFields: [
      { fieldName: "make", fieldType: "text", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "cfm_rating", fieldType: "select", options: ["50", "80", "110", "150"], required: false, inspectorField: true, homeownerField: false },
      { fieldName: "has_humidity_sensor", fieldType: "boolean", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "vented_to_exterior", fieldType: "boolean", required: false, inspectorField: true, homeownerField: false },
      { fieldName: "noise_level", fieldType: "select", options: ["quiet_under_1_sone", "moderate_1_3_sone", "loud_over_3_sone"], required: false, inspectorField: true, homeownerField: false },
    ],
    maintenanceTaskIds: ["hvac_exh_001", "hvac_exh_002", "hvac_exh_003"],
    iotCompatible: true,
    iotDeviceTypes: ["humidity_sensor", "smart_switch"],
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // 16. ERV / HRV
  // ================================================================
  {
    catalogId: "hvac.erv_hrv",
    category: "hvac",
    subcategory: "ventilation",
    systemName: "Energy Recovery Ventilator (ERV) / Heat Recovery Ventilator (HRV)",
    trackingLevel: "component" as const,
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 9, median: 15, high: 22 },
    weibullShape: 3.0,
    weibullScale: 17.0,
    regionalFactors: [
      { region: "gulf_coast", adjustmentFactor: 0.90, reason: "Year-round operation; ERV preferred over HRV for moisture management in humid panhandle" },
      { region: "northeast", adjustmentFactor: 0.88, reason: "Heavy winter use; frost management important in extreme cold" },
      { region: "pacific_northwest", adjustmentFactor: 0.92, reason: "Important for moisture-laden air; steady year-round use" },
    ],
    replacementCost: { low: 1500, median: 2500, high: 4000 },
    dataFields: [
      { fieldName: "make", fieldType: "text", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "model", fieldType: "text", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "year_installed", fieldType: "number", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "unit_type", fieldType: "select", options: ["ERV", "HRV"], required: true, inspectorField: true, homeownerField: true },
      { fieldName: "cfm_rating", fieldType: "select", options: ["70", "100", "150", "200"], required: false, inspectorField: true, homeownerField: false },
      { fieldName: "ducted_to_hvac", fieldType: "boolean", required: false, inspectorField: true, homeownerField: false },
    ],
    maintenanceTaskIds: [],
    iotCompatible: true,
    iotDeviceTypes: ["air_quality_monitor", "humidity_sensor"],
    careKitProductTypes: ["erv_filter"],
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // 17. ELECTRIC BASEBOARD HEATER
  // ================================================================
  {
    catalogId: "hvac.baseboard_electric",
    category: "hvac",
    subcategory: "heating",
    systemName: "Electric Baseboard Heater",
    trackingLevel: "component" as const,
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 10, median: 21, high: 35 },
    weibullShape: 2.0,
    weibullScale: 25.0,
    regionalFactors: [
      { region: "gulf_coast", adjustmentFactor: 1.20, reason: "Rarely used in mild panhandle winters; very long life when present" },
      { region: "northeast", adjustmentFactor: 0.85, reason: "Heavy use 6+ months in cold climates" },
      { region: "desert_southwest", adjustmentFactor: 1.10, reason: "Light heating use" },
    ],
    replacementCost: { low: 150, median: 250, high: 400 },
    dataFields: [
      { fieldName: "wattage", fieldType: "select", options: ["500", "750", "1000", "1500"], required: false, inspectorField: true, homeownerField: false },
      { fieldName: "length_ft", fieldType: "select", options: ["4", "6", "8", "10"], required: false, inspectorField: true, homeownerField: false },
      { fieldName: "room_location", fieldType: "text", required: false, inspectorField: true, homeownerField: true },
    ],
    maintenanceTaskIds: [],
    iotCompatible: false,
    isActive: true,
    lastUpdated: Date.now(),
  },
];

// ================================================================
// PLUMBING CATALOG
// ================================================================

export const PLUMBING_CATALOG = [
  // ================================================================
  // 1. WATER HEATER — TANK, GAS
  // ================================================================
  {
    catalogId: "plumbing.water_heater.tank_gas",
    category: "plumbing",
    subcategory: "water_heating",
    systemName: "Water Heater (Tank, Gas)",
    trackingLevel: "major_system" as const,
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 7, median: 12, high: 16 },
    weibullShape: 4.2,
    weibullScale: 12.5,
    regionalFactors: [
      { region: "gulf_coast", adjustmentFactor: 0.88, reason: "High humidity in unconditioned spaces accelerates exterior corrosion; warm inlet water reduces thermal cycling but hard water in panhandle accelerates anode consumption" },
      { region: "desert_southwest", adjustmentFactor: 0.82, reason: "Hard water is the #1 life reducer; sediment accumulation and anode rod consumption accelerated 30-50%" },
      { region: "northeast", adjustmentFactor: 1.05, reason: "Cold inlet water means more thermal cycling but less sediment activity" },
      { region: "pacific_northwest", adjustmentFactor: 0.85, reason: "Salt air in unconditioned spaces plus moderate water hardness" },
    ],
    replacementCost: { low: 1200, median: 1800, high: 2800 },
    dataFields: [
      { fieldName: "make", fieldType: "text", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "model", fieldType: "text", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "serial_number", fieldType: "text", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "year_installed", fieldType: "number", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "gallon_capacity", fieldType: "select", options: ["30", "40", "50", "65", "75"], required: true, inspectorField: true, homeownerField: true },
      { fieldName: "fuel_type", fieldType: "select", options: ["natural_gas", "propane"], required: true, inspectorField: true, homeownerField: true },
      { fieldName: "uef_rating", fieldType: "number", required: false, inspectorField: true, homeownerField: false },
      { fieldName: "venting_type", fieldType: "select", options: ["atmospheric", "power_vent", "direct_vent"], required: false, inspectorField: true, homeownerField: false },
      { fieldName: "location", fieldType: "select", options: ["garage", "utility_closet", "attic", "basement", "exterior_closet"], required: false, inspectorField: true, homeownerField: true },
      { fieldName: "has_expansion_tank", fieldType: "boolean", required: false, inspectorField: true, homeownerField: false },
      { fieldName: "drain_pan_present", fieldType: "boolean", required: false, inspectorField: true, homeownerField: false },
    ],
    maintenanceTaskIds: [
      "plumb_twh_001", "plumb_twh_002", "plumb_twh_003",
      "plumb_twh_004", "plumb_twh_005",
    ],
    iotCompatible: true,
    iotDeviceTypes: ["leak_sensor", "temperature_sensor", "smart_water_shutoff"],
    careKitProductTypes: ["anode_rod", "drain_valve_hose", "tpr_valve"],
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // 2. WATER HEATER — TANK, ELECTRIC
  // ================================================================
  {
    catalogId: "plumbing.water_heater.tank_electric",
    category: "plumbing",
    subcategory: "water_heating",
    systemName: "Water Heater (Tank, Electric)",
    trackingLevel: "major_system" as const,
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 7, median: 12, high: 17 },
    weibullShape: 3.8,
    weibullScale: 13.0,
    regionalFactors: [
      { region: "gulf_coast", adjustmentFactor: 0.88, reason: "Humidity and hard water in panhandle accelerate tank corrosion and anode depletion" },
      { region: "desert_southwest", adjustmentFactor: 0.82, reason: "Extreme hard water accelerates sediment and anode consumption" },
      { region: "northeast", adjustmentFactor: 1.0, reason: "Moderate conditions" },
    ],
    replacementCost: { low: 800, median: 1400, high: 2200 },
    dataFields: [
      { fieldName: "make", fieldType: "text", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "model", fieldType: "text", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "serial_number", fieldType: "text", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "year_installed", fieldType: "number", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "gallon_capacity", fieldType: "select", options: ["30", "40", "50", "65", "80"], required: true, inspectorField: true, homeownerField: true },
      { fieldName: "uef_rating", fieldType: "number", required: false, inspectorField: true, homeownerField: false },
      { fieldName: "location", fieldType: "select", options: ["garage", "utility_closet", "attic", "basement"], required: false, inspectorField: true, homeownerField: true },
      { fieldName: "has_expansion_tank", fieldType: "boolean", required: false, inspectorField: true, homeownerField: false },
    ],
    maintenanceTaskIds: [
      "plumb_twh_001", "plumb_twh_002", "plumb_twh_003",
      "plumb_twh_004", "plumb_twh_005",
    ],
    iotCompatible: true,
    iotDeviceTypes: ["leak_sensor", "temperature_sensor", "smart_water_shutoff"],
    careKitProductTypes: ["anode_rod", "drain_valve_hose", "heating_element"],
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // 3. WATER HEATER — TANKLESS, GAS
  // ================================================================
  {
    catalogId: "plumbing.water_heater.tankless_gas",
    category: "plumbing",
    subcategory: "water_heating",
    systemName: "Water Heater (Tankless, Gas)",
    trackingLevel: "major_system" as const,
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 12, median: 20, high: 25 },
    weibullShape: 3.5,
    weibullScale: 21.0,
    regionalFactors: [
      { region: "gulf_coast", adjustmentFactor: 0.85, reason: "Hard water in panhandle causes scale buildup in heat exchanger; annual descaling critical" },
      { region: "desert_southwest", adjustmentFactor: 0.78, reason: "Extreme hard water is the #1 killer of tankless units; scale destroys heat exchangers" },
      { region: "northeast", adjustmentFactor: 1.05, reason: "Cold inlet water increases BTU demand but soft water preserves heat exchanger" },
    ],
    replacementCost: { low: 2500, median: 4000, high: 6000 },
    dataFields: [
      { fieldName: "make", fieldType: "text", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "model", fieldType: "text", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "serial_number", fieldType: "text", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "year_installed", fieldType: "number", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "gpm_rating", fieldType: "select", options: ["5", "6.5", "8", "9.5", "11"], required: false, inspectorField: true, homeownerField: true },
      { fieldName: "fuel_type", fieldType: "select", options: ["natural_gas", "propane"], required: true, inspectorField: true, homeownerField: true },
      { fieldName: "venting_type", fieldType: "select", options: ["direct_vent", "power_vent", "outdoor_rated"], required: false, inspectorField: true, homeownerField: false },
      { fieldName: "recirculation_pump", fieldType: "boolean", required: false, inspectorField: true, homeownerField: true },
    ],
    maintenanceTaskIds: ["plumb_tkl_001", "plumb_tkl_002", "plumb_tkl_003"],
    iotCompatible: true,
    iotDeviceTypes: ["leak_sensor", "smart_water_shutoff", "flow_monitor"],
    careKitProductTypes: ["descaling_solution", "inlet_filter"],
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // 4. WATER HEATER — TANKLESS, ELECTRIC
  // ================================================================
  {
    catalogId: "plumbing.water_heater.tankless_electric",
    category: "plumbing",
    subcategory: "water_heating",
    systemName: "Water Heater (Tankless, Electric)",
    trackingLevel: "major_system" as const,
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 10, median: 18, high: 23 },
    weibullShape: 3.2,
    weibullScale: 19.0,
    regionalFactors: [
      { region: "gulf_coast", adjustmentFactor: 0.88, reason: "Hard water scale buildup on heating elements; warm inlet water helps capacity but scale shortens life" },
      { region: "desert_southwest", adjustmentFactor: 0.80, reason: "Extreme hard water destroys heating elements faster" },
      { region: "northeast", adjustmentFactor: 0.92, reason: "Cold inlet water demands higher wattage, stressing elements; may not meet flow demand in cold climates" },
    ],
    replacementCost: { low: 1500, median: 2500, high: 4000 },
    dataFields: [
      { fieldName: "make", fieldType: "text", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "model", fieldType: "text", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "serial_number", fieldType: "text", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "year_installed", fieldType: "number", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "kw_rating", fieldType: "select", options: ["11", "18", "24", "27", "36"], required: false, inspectorField: true, homeownerField: false },
      { fieldName: "gpm_rating", fieldType: "select", options: ["2", "3.5", "5", "6"], required: false, inspectorField: true, homeownerField: true },
      { fieldName: "whole_house_or_point_of_use", fieldType: "select", options: ["whole_house", "point_of_use"], required: false, inspectorField: true, homeownerField: true },
    ],
    maintenanceTaskIds: ["plumb_tkl_001", "plumb_tkl_002", "plumb_tkl_003"],
    iotCompatible: true,
    iotDeviceTypes: ["leak_sensor", "smart_water_shutoff"],
    careKitProductTypes: ["descaling_solution", "inlet_filter"],
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // 5. WATER HEATER — HEAT PUMP / HYBRID
  // ================================================================
  {
    catalogId: "plumbing.water_heater.heat_pump",
    category: "plumbing",
    subcategory: "water_heating",
    systemName: "Water Heater (Heat Pump / Hybrid)",
    trackingLevel: "major_system" as const,
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 8, median: 13, high: 18 },
    weibullShape: 3.0,
    weibullScale: 14.0,
    regionalFactors: [
      { region: "gulf_coast", adjustmentFactor: 0.92, reason: "Excellent performance in warm ambient temps; compressor runs efficiently in panhandle heat but humidity requires drain management" },
      { region: "northeast", adjustmentFactor: 0.88, reason: "Cold ambient temps in unconditioned spaces reduce heat pump efficiency; reverts to resistance backup" },
      { region: "desert_southwest", adjustmentFactor: 0.90, reason: "Hot garage temps may exceed compressor operating range in summer" },
    ],
    replacementCost: { low: 1800, median: 3000, high: 4500 },
    dataFields: [
      { fieldName: "make", fieldType: "text", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "model", fieldType: "text", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "serial_number", fieldType: "text", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "year_installed", fieldType: "number", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "gallon_capacity", fieldType: "select", options: ["50", "65", "80"], required: true, inspectorField: true, homeownerField: true },
      { fieldName: "uef_rating", fieldType: "number", required: false, inspectorField: true, homeownerField: false },
      { fieldName: "location", fieldType: "select", options: ["garage", "basement", "utility_room"], required: false, inspectorField: true, homeownerField: true },
      { fieldName: "condensate_drain", fieldType: "boolean", required: false, inspectorField: true, homeownerField: false },
    ],
    maintenanceTaskIds: [
      "plumb_twh_001", "plumb_twh_002", "plumb_twh_003",
      "plumb_twh_004", "plumb_twh_005",
    ],
    iotCompatible: true,
    iotDeviceTypes: ["leak_sensor", "energy_monitor", "smart_water_shutoff"],
    careKitProductTypes: ["anode_rod", "air_filter", "condensate_tablets"],
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // 6. SUPPLY LINES — COPPER
  // ================================================================
  {
    catalogId: "plumbing.supply_lines.copper",
    category: "plumbing",
    subcategory: "supply_piping",
    systemName: "Supply Lines (Copper)",
    trackingLevel: "component" as const,
    visibleToHomeowner: false,
    inspectorOnly: true,
    expectedLifeYears: { low: 40, median: 60, high: 80 },
    weibullShape: 4.5,
    weibullScale: 62.0,
    regionalFactors: [
      { region: "gulf_coast", adjustmentFactor: 0.88, reason: "Acidic or hard water in panhandle causes pinhole leak corrosion; chloramine disinfection in municipal water accelerates copper pitting" },
      { region: "northeast", adjustmentFactor: 1.0, reason: "Moderate water chemistry; standard conditions" },
      { region: "desert_southwest", adjustmentFactor: 0.82, reason: "Hard alkaline water causes scale and accelerates joint corrosion" },
    ],
    replacementCost: { low: 3000, median: 8000, high: 15000 },
    dataFields: [
      { fieldName: "pipe_type", fieldType: "select", options: ["type_M", "type_L", "type_K"], required: false, inspectorField: true, homeownerField: false },
      { fieldName: "approximate_year", fieldType: "number", required: false, inspectorField: true, homeownerField: false },
      { fieldName: "visible_corrosion", fieldType: "boolean", required: false, inspectorField: true, homeownerField: false },
      { fieldName: "pinhole_leak_history", fieldType: "boolean", required: false, inspectorField: true, homeownerField: false },
    ],
    maintenanceTaskIds: ["plumb_sp_001", "plumb_sp_002"],
    iotCompatible: true,
    iotDeviceTypes: ["leak_sensor", "smart_water_shutoff", "flow_monitor"],
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // 7. SUPPLY LINES — CPVC
  // ================================================================
  {
    catalogId: "plumbing.supply_lines.cpvc",
    category: "plumbing",
    subcategory: "supply_piping",
    systemName: "Supply Lines (CPVC)",
    trackingLevel: "component" as const,
    visibleToHomeowner: false,
    inspectorOnly: true,
    expectedLifeYears: { low: 20, median: 35, high: 50 },
    weibullShape: 3.0,
    weibullScale: 37.0,
    regionalFactors: [
      { region: "gulf_coast", adjustmentFactor: 0.85, reason: "CPVC becomes brittle in hot attics (150°F+) common in panhandle; chlorinated water accelerates degradation; contact with certain chemicals causes cracking" },
      { region: "desert_southwest", adjustmentFactor: 0.82, reason: "Extreme heat exposure through walls and attics degrades CPVC faster" },
      { region: "northeast", adjustmentFactor: 1.05, reason: "Cooler ambient temps reduce thermal degradation" },
    ],
    replacementCost: { low: 2500, median: 6000, high: 12000 },
    dataFields: [
      { fieldName: "approximate_year", fieldType: "number", required: false, inspectorField: true, homeownerField: false },
      { fieldName: "location", fieldType: "select", options: ["attic", "walls", "crawlspace", "slab"], required: false, inspectorField: true, homeownerField: false },
      { fieldName: "brittleness_observed", fieldType: "boolean", required: false, inspectorField: true, homeownerField: false },
      { fieldName: "leak_history", fieldType: "boolean", required: false, inspectorField: true, homeownerField: false },
    ],
    maintenanceTaskIds: ["plumb_sp_001", "plumb_sp_002"],
    iotCompatible: true,
    iotDeviceTypes: ["leak_sensor", "smart_water_shutoff"],
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // 8. SUPPLY LINES — PEX
  // ================================================================
  {
    catalogId: "plumbing.supply_lines.pex",
    category: "plumbing",
    subcategory: "supply_piping",
    systemName: "Supply Lines (PEX)",
    trackingLevel: "component" as const,
    visibleToHomeowner: false,
    inspectorOnly: true,
    expectedLifeYears: { low: 30, median: 50, high: 75 },
    weibullShape: 4.0,
    weibullScale: 52.0,
    regionalFactors: [
      { region: "gulf_coast", adjustmentFactor: 0.92, reason: "UV exposure in attic penetrations degrades PEX; high chlorine in municipal water slowly breaks down cross-linking" },
      { region: "desert_southwest", adjustmentFactor: 0.88, reason: "Extreme heat in attics and walls; UV exposure at exterior penetrations" },
      { region: "northeast", adjustmentFactor: 1.02, reason: "Freeze risk if improperly installed but PEX is more freeze-tolerant than rigid pipe" },
    ],
    replacementCost: { low: 2000, median: 5000, high: 10000 },
    dataFields: [
      { fieldName: "pex_type", fieldType: "select", options: ["PEX-A", "PEX-B", "PEX-C"], required: false, inspectorField: true, homeownerField: false },
      { fieldName: "approximate_year", fieldType: "number", required: false, inspectorField: true, homeownerField: false },
      { fieldName: "fitting_type", fieldType: "select", options: ["crimp", "expansion", "push_fit", "clamp"], required: false, inspectorField: true, homeownerField: false },
      { fieldName: "manifold_system", fieldType: "boolean", required: false, inspectorField: true, homeownerField: false },
    ],
    maintenanceTaskIds: ["plumb_sp_001"],
    iotCompatible: true,
    iotDeviceTypes: ["leak_sensor", "smart_water_shutoff", "flow_monitor"],
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // 9. SUPPLY LINES — POLYBUTYLENE (FLAGGED MATERIAL)
  // ================================================================
  {
    catalogId: "plumbing.supply_lines.polybutylene",
    category: "plumbing",
    subcategory: "supply_piping",
    systemName: "Supply Lines (Polybutylene)",
    trackingLevel: "component" as const,
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 10, median: 20, high: 30 },
    weibullShape: 2.2,
    weibullScale: 22.0,
    regionalFactors: [
      { region: "gulf_coast", adjustmentFactor: 0.75, reason: "CRITICAL: Chlorinated municipal water in panhandle reacts with polybutylene causing micro-fracturing. Extremely common in 1978-1995 Florida construction. Replacement strongly recommended." },
      { region: "southeast_humid", adjustmentFactor: 0.78, reason: "Chlorinated water systems degrade PB pipe; warm water accelerates reaction" },
      { region: "northeast", adjustmentFactor: 0.85, reason: "Chlorinated water still causes degradation but cooler temps slow the process" },
    ],
    replacementCost: { low: 4000, median: 8000, high: 15000 },
    dataFields: [
      { fieldName: "approximate_year", fieldType: "number", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "location", fieldType: "select", options: ["attic", "walls", "crawlspace", "slab", "underground_to_meter"], required: true, inspectorField: true, homeownerField: false },
      { fieldName: "fitting_type", fieldType: "select", options: ["plastic_acetal", "metal_insert", "copper_crimp"], required: false, inspectorField: true, homeownerField: false },
      { fieldName: "leak_history", fieldType: "boolean", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "insurance_aware", fieldType: "boolean", required: false, inspectorField: true, homeownerField: true },
    ],
    maintenanceTaskIds: ["plumb_sp_001", "plumb_sp_003", "plumb_sp_004"],
    iotCompatible: true,
    iotDeviceTypes: ["leak_sensor", "smart_water_shutoff", "flow_monitor"],
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // 10. SUPPLY LINES — GALVANIZED STEEL (AGE CONCERN)
  // ================================================================
  {
    catalogId: "plumbing.supply_lines.galvanized",
    category: "plumbing",
    subcategory: "supply_piping",
    systemName: "Supply Lines (Galvanized Steel)",
    trackingLevel: "component" as const,
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 30, median: 50, high: 70 },
    weibullShape: 3.5,
    weibullScale: 52.0,
    regionalFactors: [
      { region: "gulf_coast", adjustmentFactor: 0.80, reason: "Hard water and humidity accelerate interior corrosion and scale buildup; reduced water pressure is early warning" },
      { region: "desert_southwest", adjustmentFactor: 0.78, reason: "Hard water causes severe interior scale buildup restricting flow" },
      { region: "northeast", adjustmentFactor: 0.95, reason: "Moderate water chemistry; most homes with galvanized are now 50+ years old" },
    ],
    replacementCost: { low: 4000, median: 10000, high: 20000 },
    dataFields: [
      { fieldName: "approximate_year", fieldType: "number", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "water_pressure_psi", fieldType: "number", required: false, inspectorField: true, homeownerField: false },
      { fieldName: "rust_colored_water", fieldType: "boolean", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "low_pressure_complaints", fieldType: "boolean", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "partial_replacement_done", fieldType: "boolean", required: false, inspectorField: true, homeownerField: true },
    ],
    maintenanceTaskIds: ["plumb_sp_001", "plumb_sp_003", "plumb_sp_004"],
    iotCompatible: true,
    iotDeviceTypes: ["leak_sensor", "smart_water_shutoff", "pressure_monitor"],
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // 11. DRAIN LINES — PVC/ABS
  // ================================================================
  {
    catalogId: "plumbing.drain_dwv.pvc",
    category: "plumbing",
    subcategory: "drain_waste_vent",
    systemName: "Drain Lines (PVC/ABS)",
    trackingLevel: "component" as const,
    visibleToHomeowner: false,
    inspectorOnly: true,
    expectedLifeYears: { low: 40, median: 75, high: 100 },
    weibullShape: 4.0,
    weibullScale: 78.0,
    regionalFactors: [
      { region: "gulf_coast", adjustmentFactor: 0.95, reason: "UV exposure on above-grade exterior sections; root intrusion in sandy panhandle soil is primary underground failure mode" },
      { region: "northeast", adjustmentFactor: 1.0, reason: "Standard conditions; freeze/thaw can crack exposed sections" },
    ],
    replacementCost: { low: 2000, median: 6000, high: 15000 },
    dataFields: [
      { fieldName: "material", fieldType: "select", options: ["PVC", "ABS"], required: false, inspectorField: true, homeownerField: false },
      { fieldName: "approximate_year", fieldType: "number", required: false, inspectorField: true, homeownerField: false },
      { fieldName: "under_slab", fieldType: "boolean", required: false, inspectorField: true, homeownerField: false },
      { fieldName: "root_intrusion_history", fieldType: "boolean", required: false, inspectorField: true, homeownerField: false },
    ],
    maintenanceTaskIds: ["plumb_wp_001", "plumb_wp_002"],
    iotCompatible: false,
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // 12. DRAIN LINES — CAST IRON (AGE CONCERN)
  // ================================================================
  {
    catalogId: "plumbing.drain_dwv.cast_iron",
    category: "plumbing",
    subcategory: "drain_waste_vent",
    systemName: "Drain Lines (Cast Iron)",
    trackingLevel: "component" as const,
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 40, median: 60, high: 80 },
    weibullShape: 3.8,
    weibullScale: 62.0,
    regionalFactors: [
      { region: "gulf_coast", adjustmentFactor: 0.75, reason: "CRITICAL in panhandle: Humid crawlspaces and high water tables accelerate exterior corrosion. Many homes built 1950s-1980s have cast iron approaching or past end-of-life. Under-slab cast iron in Florida is a major concern." },
      { region: "southeast_humid", adjustmentFactor: 0.78, reason: "Humid crawlspaces accelerate exterior corrosion on horizontal runs" },
      { region: "northeast", adjustmentFactor: 0.92, reason: "Interior corrosion from drain chemicals; basement sections last longer in dry conditions" },
    ],
    replacementCost: { low: 3000, median: 8000, high: 25000 },
    dataFields: [
      { fieldName: "approximate_year", fieldType: "number", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "location", fieldType: "select", options: ["under_slab", "crawlspace", "basement", "walls", "underground_to_street"], required: true, inspectorField: true, homeownerField: false },
      { fieldName: "visible_corrosion", fieldType: "boolean", required: false, inspectorField: true, homeownerField: false },
      { fieldName: "camera_inspection_done", fieldType: "boolean", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "slow_drain_complaints", fieldType: "boolean", required: false, inspectorField: true, homeownerField: true },
    ],
    maintenanceTaskIds: ["plumb_wp_001", "plumb_wp_002", "plumb_wp_003"],
    iotCompatible: false,
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // 13. KITCHEN FAUCET
  // ================================================================
  {
    catalogId: "plumbing.fixture.kitchen_faucet",
    category: "plumbing",
    subcategory: "fixture",
    systemName: "Kitchen Faucet",
    trackingLevel: "fixture" as const,
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 8, median: 15, high: 22 },
    weibullShape: 2.8,
    weibullScale: 16.0,
    regionalFactors: [
      { region: "gulf_coast", adjustmentFactor: 0.88, reason: "Hard water in panhandle causes mineral buildup in cartridge and aerator; accelerates valve seat wear" },
      { region: "desert_southwest", adjustmentFactor: 0.82, reason: "Extreme hard water deposits clog cartridges and aerators" },
    ],
    replacementCost: { low: 150, median: 350, high: 800 },
    dataFields: [
      { fieldName: "make", fieldType: "text", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "faucet_type", fieldType: "select", options: ["pull_down", "pull_out", "standard", "pot_filler", "touchless"], required: false, inspectorField: false, homeownerField: true },
      { fieldName: "finish", fieldType: "select", options: ["chrome", "brushed_nickel", "matte_black", "bronze"], required: false, inspectorField: false, homeownerField: true },
    ],
    maintenanceTaskIds: [],
    iotCompatible: true,
    iotDeviceTypes: ["leak_sensor"],
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // 14. BATHROOM FAUCET
  // ================================================================
  {
    catalogId: "plumbing.fixture.bathroom_faucet",
    category: "plumbing",
    subcategory: "fixture",
    systemName: "Bathroom Faucet",
    trackingLevel: "fixture" as const,
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 10, median: 18, high: 25 },
    weibullShape: 2.5,
    weibullScale: 19.0,
    regionalFactors: [
      { region: "gulf_coast", adjustmentFactor: 0.90, reason: "Hard water mineral buildup in cartridge; less use than kitchen faucet extends life" },
      { region: "desert_southwest", adjustmentFactor: 0.85, reason: "Hard water scale on cartridge and aerator" },
    ],
    replacementCost: { low: 100, median: 250, high: 600 },
    dataFields: [
      { fieldName: "make", fieldType: "text", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "faucet_type", fieldType: "select", options: ["single_handle", "double_handle", "widespread", "wall_mount"], required: false, inspectorField: false, homeownerField: true },
    ],
    maintenanceTaskIds: [],
    iotCompatible: true,
    iotDeviceTypes: ["leak_sensor"],
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // 15. TOILET
  // ================================================================
  {
    catalogId: "plumbing.fixture.toilet",
    category: "plumbing",
    subcategory: "fixture",
    systemName: "Toilet",
    trackingLevel: "fixture" as const,
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 25, median: 50, high: 100 },
    weibullShape: 2.0,
    weibullScale: 55.0,
    regionalFactors: [
      { region: "gulf_coast", adjustmentFactor: 0.92, reason: "Hard water causes mineral buildup in jets and trap; internal components (flapper, fill valve) replaced more frequently" },
      { region: "desert_southwest", adjustmentFactor: 0.88, reason: "Hard water mineral buildup clogs rim jets and siphon" },
    ],
    replacementCost: { low: 200, median: 400, high: 1200 },
    dataFields: [
      { fieldName: "make", fieldType: "text", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "gpf_rating", fieldType: "select", options: ["1.0", "1.28", "1.6", "3.5_plus_older"], required: false, inspectorField: true, homeownerField: false },
      { fieldName: "toilet_type", fieldType: "select", options: ["gravity", "pressure_assist", "dual_flush", "wall_hung"], required: false, inspectorField: true, homeownerField: true },
      { fieldName: "wax_ring_condition", fieldType: "select", options: ["good", "leaking", "unknown"], required: false, inspectorField: true, homeownerField: false },
      { fieldName: "floor_damage_around_base", fieldType: "boolean", required: false, inspectorField: true, homeownerField: false },
    ],
    maintenanceTaskIds: [],
    iotCompatible: true,
    iotDeviceTypes: ["leak_sensor"],
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // 16. SHOWER VALVE / CARTRIDGE
  // ================================================================
  {
    catalogId: "plumbing.fixture.shower_valve",
    category: "plumbing",
    subcategory: "fixture",
    systemName: "Shower Valve / Cartridge",
    trackingLevel: "fixture" as const,
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 8, median: 15, high: 25 },
    weibullShape: 2.5,
    weibullScale: 16.0,
    regionalFactors: [
      { region: "gulf_coast", adjustmentFactor: 0.85, reason: "Hard water scale buildup on cartridge seals and seats; frequent use with warm humid conditions" },
      { region: "desert_southwest", adjustmentFactor: 0.80, reason: "Hard water is extremely aggressive on valve cartridges" },
    ],
    replacementCost: { low: 150, median: 350, high: 800 },
    dataFields: [
      { fieldName: "make", fieldType: "text", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "valve_type", fieldType: "select", options: ["pressure_balance", "thermostatic", "manual_two_handle"], required: false, inspectorField: true, homeownerField: false },
      { fieldName: "anti_scald_compliant", fieldType: "boolean", required: false, inspectorField: true, homeownerField: false },
    ],
    maintenanceTaskIds: [],
    iotCompatible: false,
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // 17. GARBAGE DISPOSAL
  // ================================================================
  {
    catalogId: "plumbing.fixture.garbage_disposal",
    category: "plumbing",
    subcategory: "fixture",
    systemName: "Garbage Disposal",
    trackingLevel: "fixture" as const,
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 6, median: 10, high: 15 },
    weibullShape: 3.0,
    weibullScale: 11.0,
    regionalFactors: [
      { region: "gulf_coast", adjustmentFactor: 0.90, reason: "Humidity under sink can corrode external housing; hard water scale on grinding components" },
    ],
    replacementCost: { low: 150, median: 300, high: 600 },
    dataFields: [
      { fieldName: "make", fieldType: "text", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "horsepower", fieldType: "select", options: ["1/3", "1/2", "3/4", "1"], required: false, inspectorField: true, homeownerField: true },
      { fieldName: "batch_or_continuous", fieldType: "select", options: ["batch_feed", "continuous_feed"], required: false, inspectorField: true, homeownerField: false },
    ],
    maintenanceTaskIds: ["plumb_gd_001", "plumb_gd_002", "plumb_gd_003"],
    iotCompatible: false,
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // 18. MAIN WATER SHUTOFF VALVE
  // ================================================================
  {
    catalogId: "plumbing.fixture.shutoff_valve_main",
    category: "plumbing",
    subcategory: "valves",
    systemName: "Main Water Shutoff Valve",
    trackingLevel: "component" as const,
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 15, median: 25, high: 40 },
    weibullShape: 2.5,
    weibullScale: 27.0,
    regionalFactors: [
      { region: "gulf_coast", adjustmentFactor: 0.85, reason: "Mineral buildup from hard panhandle water seizes gate valves; exterior valves corrode in humid environment" },
      { region: "desert_southwest", adjustmentFactor: 0.82, reason: "Hard water scale seizes valves that aren't exercised regularly" },
    ],
    replacementCost: { low: 200, median: 500, high: 1200 },
    dataFields: [
      { fieldName: "valve_type", fieldType: "select", options: ["gate", "ball", "globe"], required: true, inspectorField: true, homeownerField: false },
      { fieldName: "location", fieldType: "select", options: ["exterior_wall", "basement", "crawlspace", "garage", "utility_closet", "at_meter"], required: true, inspectorField: true, homeownerField: true },
      { fieldName: "operable", fieldType: "boolean", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "valve_material", fieldType: "select", options: ["brass", "plastic", "galvanized"], required: false, inspectorField: true, homeownerField: false },
    ],
    maintenanceTaskIds: ["plumb_msl_001", "plumb_msl_002", "plumb_msl_003"],
    iotCompatible: true,
    iotDeviceTypes: ["smart_water_shutoff", "leak_sensor"],
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // 19. SUPPLY SHUTOFF VALVE (INDIVIDUAL)
  // ================================================================
  {
    catalogId: "plumbing.fixture.supply_shutoff_valve",
    category: "plumbing",
    subcategory: "valves",
    systemName: "Supply Shutoff Valve (Individual)",
    trackingLevel: "fixture" as const,
    visibleToHomeowner: false,
    inspectorOnly: true,
    expectedLifeYears: { low: 10, median: 20, high: 30 },
    weibullShape: 2.2,
    weibullScale: 22.0,
    regionalFactors: [
      { region: "gulf_coast", adjustmentFactor: 0.82, reason: "Hard water scale seizes valves not exercised regularly; plastic valve stems become brittle in attic heat" },
      { region: "desert_southwest", adjustmentFactor: 0.80, reason: "Hard water mineral deposits seize valve mechanisms" },
    ],
    replacementCost: { low: 50, median: 150, high: 300 },
    dataFields: [
      { fieldName: "valve_type", fieldType: "select", options: ["gate", "ball", "compression", "quarter_turn"], required: false, inspectorField: true, homeownerField: false },
      { fieldName: "fixture_served", fieldType: "text", required: false, inspectorField: true, homeownerField: false },
      { fieldName: "operable", fieldType: "boolean", required: true, inspectorField: true, homeownerField: false },
    ],
    maintenanceTaskIds: ["plumb_msl_001"],
    iotCompatible: false,
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // 20. HOSE BIBB / OUTDOOR SPIGOT
  // ================================================================
  {
    catalogId: "plumbing.fixture.hose_bibb",
    category: "plumbing",
    subcategory: "fixture",
    systemName: "Hose Bibb / Outdoor Spigot",
    trackingLevel: "fixture" as const,
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 10, median: 20, high: 35 },
    weibullShape: 2.5,
    weibullScale: 22.0,
    regionalFactors: [
      { region: "gulf_coast", adjustmentFactor: 0.85, reason: "UV exposure, hard water scale, humidity-driven exterior corrosion in panhandle; freeze protection less critical than north" },
      { region: "northeast", adjustmentFactor: 0.82, reason: "Freeze damage is primary failure mode; frost-free hose bibbs essential" },
      { region: "pacific_northwest", adjustmentFactor: 0.88, reason: "Constant moisture exposure" },
    ],
    replacementCost: { low: 75, median: 200, high: 400 },
    dataFields: [
      { fieldName: "type", fieldType: "select", options: ["standard", "frost_free", "vacuum_breaker"], required: false, inspectorField: true, homeownerField: false },
      { fieldName: "anti_siphon", fieldType: "boolean", required: false, inspectorField: true, homeownerField: false },
      { fieldName: "leaking", fieldType: "boolean", required: false, inspectorField: true, homeownerField: true },
    ],
    maintenanceTaskIds: [],
    iotCompatible: true,
    iotDeviceTypes: ["leak_sensor", "smart_hose_timer"],
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // 21. WATER SOFTENER
  // ================================================================
  {
    catalogId: "plumbing.water_softener",
    category: "plumbing",
    subcategory: "water_treatment",
    systemName: "Water Softener",
    trackingLevel: "major_system" as const,
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 8, median: 15, high: 22 },
    weibullShape: 3.0,
    weibullScale: 16.0,
    regionalFactors: [
      { region: "gulf_coast", adjustmentFactor: 0.85, reason: "Extremely hard well water in panhandle (15-25 gpg) runs softener more frequently; resin bed depletes faster with high iron content" },
      { region: "desert_southwest", adjustmentFactor: 0.80, reason: "Very hard water demands frequent regeneration cycles" },
      { region: "northeast", adjustmentFactor: 1.05, reason: "Moderate water hardness; less regeneration demand" },
    ],
    replacementCost: { low: 800, median: 2000, high: 4000 },
    dataFields: [
      { fieldName: "make", fieldType: "text", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "model", fieldType: "text", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "year_installed", fieldType: "number", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "grain_capacity", fieldType: "select", options: ["24000", "32000", "48000", "64000", "80000"], required: false, inspectorField: true, homeownerField: false },
      { fieldName: "water_source", fieldType: "select", options: ["municipal", "well"], required: false, inspectorField: true, homeownerField: true },
      { fieldName: "hardness_gpg", fieldType: "number", required: false, inspectorField: true, homeownerField: false },
      { fieldName: "regeneration_type", fieldType: "select", options: ["timer", "demand_metered"], required: false, inspectorField: true, homeownerField: false },
    ],
    maintenanceTaskIds: ["plumb_ws_001", "plumb_ws_002", "plumb_ws_003", "plumb_ws_004"],
    iotCompatible: true,
    iotDeviceTypes: ["salt_level_monitor", "flow_monitor", "smart_water_softener"],
    careKitProductTypes: ["softener_salt", "resin_cleaner", "iron_out"],
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // 22. WHOLE HOUSE WATER FILTER
  // ================================================================
  {
    catalogId: "plumbing.water_filter_whole_house",
    category: "plumbing",
    subcategory: "water_treatment",
    systemName: "Whole House Water Filter",
    trackingLevel: "component" as const,
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 8, median: 15, high: 25 },
    weibullShape: 2.8,
    weibullScale: 16.0,
    regionalFactors: [
      { region: "gulf_coast", adjustmentFactor: 0.85, reason: "High sediment and iron in panhandle well water clogs filters faster; housing O-rings degrade in heat" },
      { region: "desert_southwest", adjustmentFactor: 0.82, reason: "Heavy sediment and mineral content demand frequent filter changes" },
    ],
    replacementCost: { low: 300, median: 800, high: 2000 },
    dataFields: [
      { fieldName: "make", fieldType: "text", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "year_installed", fieldType: "number", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "filter_type", fieldType: "select", options: ["sediment", "carbon", "multi_stage", "reverse_osmosis"], required: false, inspectorField: true, homeownerField: true },
      { fieldName: "micron_rating", fieldType: "select", options: ["1", "5", "10", "20", "50"], required: false, inspectorField: true, homeownerField: false },
    ],
    maintenanceTaskIds: ["plumb_whf_001", "plumb_whf_002", "plumb_whf_003"],
    iotCompatible: true,
    iotDeviceTypes: ["pressure_differential_monitor", "flow_monitor"],
    careKitProductTypes: ["replacement_filter_cartridge", "housing_o_ring"],
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // 23. SUMP PUMP
  // ================================================================
  {
    catalogId: "plumbing.sump_pump",
    category: "plumbing",
    subcategory: "drainage",
    systemName: "Sump Pump",
    trackingLevel: "major_system" as const,
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 5, median: 10, high: 15 },
    weibullShape: 3.2,
    weibullScale: 10.5,
    regionalFactors: [
      { region: "gulf_coast", adjustmentFactor: 0.78, reason: "High water table in panhandle means pump runs frequently; sandy soil debris clogs impeller; hurricane season demands reliable operation" },
      { region: "southeast_humid", adjustmentFactor: 0.80, reason: "High water table and frequent heavy rain events" },
      { region: "northeast", adjustmentFactor: 0.90, reason: "Spring snowmelt demands heavy use; freezing discharge lines can burn out pump" },
      { region: "desert_southwest", adjustmentFactor: 1.20, reason: "Rarely needed; when present, low-use extends life" },
    ],
    replacementCost: { low: 400, median: 800, high: 2000 },
    dataFields: [
      { fieldName: "make", fieldType: "text", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "year_installed", fieldType: "number", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "pump_type", fieldType: "select", options: ["submersible", "pedestal"], required: false, inspectorField: true, homeownerField: false },
      { fieldName: "horsepower", fieldType: "select", options: ["1/4", "1/3", "1/2", "3/4", "1"], required: false, inspectorField: true, homeownerField: false },
      { fieldName: "has_battery_backup", fieldType: "boolean", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "has_alarm", fieldType: "boolean", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "check_valve_present", fieldType: "boolean", required: false, inspectorField: true, homeownerField: false },
      { fieldName: "discharge_location", fieldType: "select", options: ["yard", "storm_drain", "dry_well"], required: false, inspectorField: true, homeownerField: false },
    ],
    maintenanceTaskIds: ["plumb_sp_001", "plumb_sp_002", "plumb_sp_003"],
    iotCompatible: true,
    iotDeviceTypes: ["water_level_sensor", "leak_sensor", "pump_monitor", "battery_backup_monitor"],
    careKitProductTypes: ["check_valve", "battery_backup"],
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // 24. PRESSURE REGULATOR
  // ================================================================
  {
    catalogId: "plumbing.pressure_regulator",
    category: "plumbing",
    subcategory: "valves",
    systemName: "Pressure Reducing Valve (PRV)",
    trackingLevel: "component" as const,
    visibleToHomeowner: false,
    inspectorOnly: true,
    expectedLifeYears: { low: 7, median: 12, high: 20 },
    weibullShape: 2.8,
    weibullScale: 13.0,
    regionalFactors: [
      { region: "gulf_coast", adjustmentFactor: 0.85, reason: "Hard water and sediment in panhandle cause diaphragm and spring failure; high municipal pressure common in newer developments" },
      { region: "desert_southwest", adjustmentFactor: 0.80, reason: "Hard water sediment degrades internal components" },
    ],
    replacementCost: { low: 200, median: 450, high: 800 },
    dataFields: [
      { fieldName: "make", fieldType: "text", required: false, inspectorField: true, homeownerField: false },
      { fieldName: "set_pressure_psi", fieldType: "number", required: false, inspectorField: true, homeownerField: false },
      { fieldName: "inlet_pressure_psi", fieldType: "number", required: false, inspectorField: true, homeownerField: false },
      { fieldName: "location", fieldType: "select", options: ["at_meter", "at_main_shutoff", "interior"], required: false, inspectorField: true, homeownerField: false },
    ],
    maintenanceTaskIds: [],
    iotCompatible: true,
    iotDeviceTypes: ["pressure_monitor"],
    isActive: true,
    lastUpdated: Date.now(),
  },

  // ================================================================
  // 25. EXPANSION TANK
  // ================================================================
  {
    catalogId: "plumbing.expansion_tank",
    category: "plumbing",
    subcategory: "water_heating",
    systemName: "Thermal Expansion Tank",
    trackingLevel: "component" as const,
    visibleToHomeowner: false,
    inspectorOnly: true,
    expectedLifeYears: { low: 4, median: 8, high: 12 },
    weibullShape: 3.0,
    weibullScale: 8.5,
    regionalFactors: [
      { region: "gulf_coast", adjustmentFactor: 0.85, reason: "Hard water and high water pressure in panhandle stress bladder; hot attic or garage mounting accelerates bladder degradation" },
      { region: "desert_southwest", adjustmentFactor: 0.82, reason: "Extreme heat and hard water accelerate bladder failure" },
      { region: "northeast", adjustmentFactor: 1.0, reason: "Standard conditions; required by code in closed-loop systems" },
    ],
    replacementCost: { low: 100, median: 250, high: 450 },
    dataFields: [
      { fieldName: "gallon_size", fieldType: "select", options: ["2", "4.5", "10"], required: false, inspectorField: true, homeownerField: false },
      { fieldName: "pre_charge_psi", fieldType: "number", required: false, inspectorField: true, homeownerField: false },
      { fieldName: "mounting_orientation", fieldType: "select", options: ["vertical_hanging", "horizontal", "on_floor"], required: false, inspectorField: true, homeownerField: false },
      { fieldName: "waterlogged", fieldType: "boolean", required: false, inspectorField: true, homeownerField: false },
    ],
    maintenanceTaskIds: [],
    iotCompatible: false,
    isActive: true,
    lastUpdated: Date.now(),
  },
];
