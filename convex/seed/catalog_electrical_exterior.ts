// System catalog seed data: Electrical, Roof, and Exterior categories
// Weibull parameters sourced from ASHRAE, NRCA, manufacturer data, and field studies

interface LifeRange {
  low: number;
  median: number;
  high: number;
}

interface CostRange {
  low: number;
  median: number;
  high: number;
}

interface RegionalFactor {
  region: string;
  adjustmentFactor: number;
  reason: string;
}

interface DataField {
  fieldName: string;
  fieldType: "text" | "number" | "select" | "boolean" | "date";
  options?: string[];
  required: boolean;
  inspectorField: boolean;
  homeownerField: boolean;
}

interface CatalogEntry {
  catalogId: string;
  category: string;
  subcategory: string;
  systemName: string;
  trackingLevel: "major_system" | "component" | "fixture" | "material" | "cosmetic";
  visibleToHomeowner: boolean;
  inspectorOnly: boolean;
  expectedLifeYears: LifeRange;
  weibullShape: number;
  weibullScale: number;
  regionalFactors?: RegionalFactor[];
  replacementCost: CostRange;
  dataFields?: DataField[];
  maintenanceTaskIds: string[];
  iotCompatible?: boolean;
  iotDeviceTypes?: string[];
  careKitProductTypes?: string[];
  isActive: boolean;
  lastUpdated: number;
}

// ============================================================
// ELECTRICAL
// ============================================================

export const ELECTRICAL_CATALOG: CatalogEntry[] = [
  {
    catalogId: "electrical.main_panel",
    category: "electrical",
    subcategory: "service_panel",
    systemName: "Main Electrical Panel",
    trackingLevel: "major_system",
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 25, median: 40, high: 60 },
    weibullShape: 2.0,
    weibullScale: 40,
    regionalFactors: [
      { region: "florida_panhandle", adjustmentFactor: 0.88, reason: "Humidity and condensation inside panel; outdoor panels common in Gulf Coast with more weather exposure" },
      { region: "coastal", adjustmentFactor: 0.82, reason: "Salt air corrosion on bus bars, breakers, and connections" },
    ],
    replacementCost: { low: 1500, median: 3000, high: 6000 },
    dataFields: [
      { fieldName: "make", fieldType: "text", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "amperage", fieldType: "select", options: ["60A", "100A", "125A", "150A", "200A", "400A"], required: true, inspectorField: true, homeownerField: true },
      { fieldName: "panel_type", fieldType: "select", options: ["Circuit breaker", "Fuse box"], required: true, inspectorField: true, homeownerField: true },
      { fieldName: "known_defective", fieldType: "select", options: ["No", "Federal Pacific", "Zinsco", "Pushmatic"], required: true, inspectorField: true, homeownerField: false },
      { fieldName: "wiring_type", fieldType: "select", options: ["Copper", "Aluminum branch", "Copper clad aluminum", "Knob and tube", "Mixed"], required: false, inspectorField: true, homeownerField: false },
    ],
    maintenanceTaskIds: [
      "electrical.panel_inspection",
      "electrical.breaker_exercise",
      "electrical.thermal_scan",
    ],
    iotCompatible: true,
    iotDeviceTypes: ["smart_breaker_panel", "energy_monitor"],
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    catalogId: "electrical.sub_panel",
    category: "electrical",
    subcategory: "service_panel",
    systemName: "Sub Panel",
    trackingLevel: "component",
    visibleToHomeowner: false,
    inspectorOnly: true,
    expectedLifeYears: { low: 25, median: 40, high: 60 },
    weibullShape: 2.0,
    weibullScale: 40,
    regionalFactors: [
      { region: "florida_panhandle", adjustmentFactor: 0.88, reason: "Humidity exposure, especially in garages and outdoor installations" },
      { region: "coastal", adjustmentFactor: 0.82, reason: "Salt air corrosion on connections and bus bars" },
    ],
    replacementCost: { low: 800, median: 1500, high: 3000 },
    dataFields: [
      { fieldName: "amperage", fieldType: "select", options: ["30A", "60A", "100A", "125A", "200A"], required: true, inspectorField: true, homeownerField: false },
      { fieldName: "location", fieldType: "text", required: false, inspectorField: true, homeownerField: false },
      { fieldName: "fed_from", fieldType: "text", required: false, inspectorField: true, homeownerField: false },
    ],
    maintenanceTaskIds: [
      "electrical.panel_inspection",
      "electrical.breaker_exercise",
    ],
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    catalogId: "electrical.whole_house_surge",
    category: "electrical",
    subcategory: "surge_protection",
    systemName: "Whole House Surge Protector",
    trackingLevel: "component",
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 3, median: 5, high: 10 },
    weibullShape: 3.0,
    weibullScale: 5,
    regionalFactors: [
      { region: "florida_panhandle", adjustmentFactor: 0.60, reason: "80+ thunderstorm days/year; lightning is the #1 cause of HVAC compressor failure and electronics damage" },
      { region: "gulf_coast", adjustmentFactor: 0.65, reason: "Extreme lightning frequency consumes SPD capacity rapidly" },
    ],
    replacementCost: { low: 150, median: 275, high: 500 },
    dataFields: [
      { fieldName: "make", fieldType: "text", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "indicator_status", fieldType: "select", options: ["Protected", "Depleted", "Unknown"], required: false, inspectorField: true, homeownerField: true },
    ],
    maintenanceTaskIds: [
      "electrical.surge_protector_check",
    ],
    careKitProductTypes: ["surge_protector_replacement"],
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    catalogId: "electrical.generator_standby",
    category: "electrical",
    subcategory: "backup_power",
    systemName: "Standby Generator",
    trackingLevel: "major_system",
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 15, median: 25, high: 35 },
    weibullShape: 2.0,
    weibullScale: 25,
    regionalFactors: [
      { region: "florida_panhandle", adjustmentFactor: 0.82, reason: "Hurricane outages cause extended run hours; salt air corrodes outdoor unit" },
      { region: "coastal", adjustmentFactor: 0.85, reason: "Salt air corrosion on enclosure and engine components" },
    ],
    replacementCost: { low: 8000, median: 15000, high: 30000 },
    dataFields: [
      { fieldName: "make", fieldType: "text", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "model", fieldType: "text", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "fuel_type", fieldType: "select", options: ["Natural gas", "Propane", "Diesel"], required: true, inspectorField: true, homeownerField: true },
      { fieldName: "capacity_kw", fieldType: "number", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "transfer_switch_type", fieldType: "select", options: ["Automatic", "Manual"], required: false, inspectorField: true, homeownerField: false },
    ],
    maintenanceTaskIds: [
      "electrical.generator_oil_change",
      "electrical.generator_battery_check",
      "electrical.generator_exercise_test",
      "electrical.generator_annual_service",
    ],
    iotCompatible: true,
    iotDeviceTypes: ["generator_monitor"],
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    catalogId: "electrical.ev_charger",
    category: "electrical",
    subcategory: "ev_charging",
    systemName: "EV Charger (Level 2)",
    trackingLevel: "component",
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 8, median: 12, high: 20 },
    weibullShape: 2.5,
    weibullScale: 13,
    regionalFactors: [
      { region: "florida_panhandle", adjustmentFactor: 0.88, reason: "Humidity and heat exposure in unconditioned garages; outdoor-mounted units face weather" },
      { region: "coastal", adjustmentFactor: 0.85, reason: "Salt air corrosion on connectors and enclosure" },
    ],
    replacementCost: { low: 500, median: 1200, high: 2500 },
    dataFields: [
      { fieldName: "make", fieldType: "text", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "amperage", fieldType: "select", options: ["16A", "24A", "32A", "40A", "48A", "50A"], required: false, inspectorField: true, homeownerField: true },
      { fieldName: "hardwired_or_plug", fieldType: "select", options: ["Hardwired", "NEMA 14-50 plug", "NEMA 6-50 plug"], required: false, inspectorField: true, homeownerField: true },
    ],
    maintenanceTaskIds: [
      "electrical.ev_charger_inspection",
    ],
    iotCompatible: true,
    iotDeviceTypes: ["smart_ev_charger"],
    isActive: true,
    lastUpdated: Date.now(),
  },
];

// ============================================================
// ROOF
// ============================================================

export const ROOF_CATALOG: CatalogEntry[] = [
  {
    catalogId: "roof.asphalt_shingle",
    category: "roof",
    subcategory: "covering",
    systemName: "Roof — Asphalt Shingle",
    trackingLevel: "major_system",
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 15, median: 22, high: 30 },
    weibullShape: 3.0,
    weibullScale: 22,
    regionalFactors: [
      { region: "florida_panhandle", adjustmentFactor: 0.75, reason: "Extreme UV exposure, 150°F+ attic temps, algae growth, and hurricane wind damage — shortest shingle life in the country" },
      { region: "gulf_coast", adjustmentFactor: 0.78, reason: "UV, high heat, algae, and tropical storm wind damage" },
      { region: "desert_southwest", adjustmentFactor: 0.82, reason: "Extreme UV and thermal cycling degrade asphalt rapidly" },
    ],
    replacementCost: { low: 6000, median: 14000, high: 25000 },
    dataFields: [
      { fieldName: "layers", fieldType: "select", options: ["1", "2", "3+"], required: true, inspectorField: true, homeownerField: false },
      { fieldName: "shingle_type", fieldType: "select", options: ["3-tab", "Architectural", "Luxury"], required: true, inspectorField: true, homeownerField: true },
      { fieldName: "roof_geometry", fieldType: "select", options: ["Hip", "Gable", "Flat", "Combination", "Gambrel", "Mansard"], required: false, inspectorField: true, homeownerField: false },
      { fieldName: "year_installed", fieldType: "number", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "hurricane_straps", fieldType: "select", options: ["Clips", "Single wraps", "Double wraps", "Structural", "None", "Unknown"], required: false, inspectorField: true, homeownerField: false },
      { fieldName: "secondary_water_resistance", fieldType: "boolean", required: false, inspectorField: true, homeownerField: false },
    ],
    maintenanceTaskIds: [
      "roof.visual_inspection",
      "roof.gutter_clean",
      "roof.attic_ventilation_check",
      "roof.post_storm_inspection",
      "roof.moss_algae_treatment",
    ],
    iotCompatible: true,
    iotDeviceTypes: ["roof_moisture_sensor", "attic_temp_humidity_sensor"],
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    catalogId: "roof.metal",
    category: "roof",
    subcategory: "covering",
    systemName: "Roof — Metal",
    trackingLevel: "major_system",
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 30, median: 50, high: 70 },
    weibullShape: 2.0,
    weibullScale: 50,
    regionalFactors: [
      { region: "florida_panhandle", adjustmentFactor: 0.88, reason: "Best roof choice for Gulf Coast wind resistance; salt air can affect steel (galvalume) — aluminum preferred coastal" },
      { region: "coastal", adjustmentFactor: 0.85, reason: "Salt air on steel roofs — use aluminum for coastal marine environments" },
    ],
    replacementCost: { low: 12000, median: 22000, high: 40000 },
    dataFields: [
      { fieldName: "metal_type", fieldType: "select", options: ["Standing seam", "Exposed fastener", "Metal shingle", "Corrugated"], required: true, inspectorField: true, homeownerField: true },
      { fieldName: "material", fieldType: "select", options: ["Galvalume steel", "Aluminum", "Copper", "Zinc"], required: false, inspectorField: true, homeownerField: false },
      { fieldName: "year_installed", fieldType: "number", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "finish_type", fieldType: "select", options: ["Kynar/PVDF", "SMP", "Acrylic", "Mill finish"], required: false, inspectorField: true, homeownerField: false },
    ],
    maintenanceTaskIds: [
      "roof.visual_inspection",
      "roof.fastener_check",
      "roof.sealant_inspection",
      "roof.post_storm_inspection",
    ],
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    catalogId: "roof.tile_concrete",
    category: "roof",
    subcategory: "covering",
    systemName: "Roof — Concrete Tile",
    trackingLevel: "major_system",
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 35, median: 50, high: 75 },
    weibullShape: 2.0,
    weibullScale: 50,
    regionalFactors: [
      { region: "florida_panhandle", adjustmentFactor: 0.85, reason: "Tile itself lasts but underlayment degrades faster in extreme heat; hurricane winds can lift tiles" },
      { region: "gulf_coast", adjustmentFactor: 0.88, reason: "UV and wind stress; underlayment replacement needed at 15-20 years" },
    ],
    replacementCost: { low: 10000, median: 20000, high: 40000 },
    dataFields: [
      { fieldName: "tile_profile", fieldType: "select", options: ["Flat", "S-tile", "Barrel/Mission", "Roman"], required: false, inspectorField: true, homeownerField: false },
      { fieldName: "year_installed", fieldType: "number", required: true, inspectorField: true, homeownerField: true },
      { fieldName: "underlayment_condition", fieldType: "select", options: ["Good", "Fair", "Needs replacement", "Unknown"], required: false, inspectorField: true, homeownerField: false },
    ],
    maintenanceTaskIds: [
      "roof.visual_inspection",
      "roof.tile_reseating",
      "roof.underlayment_inspection",
      "roof.post_storm_inspection",
    ],
    isActive: true,
    lastUpdated: Date.now(),
  },
];

// ============================================================
// EXTERIOR
// ============================================================

export const EXTERIOR_CATALOG: CatalogEntry[] = [
  {
    catalogId: "exterior.gutters.aluminum",
    category: "exterior",
    subcategory: "gutters",
    systemName: "Gutters (Aluminum)",
    trackingLevel: "component",
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 15, median: 22, high: 30 },
    weibullShape: 3.0,
    weibullScale: 22,
    regionalFactors: [
      { region: "florida_panhandle", adjustmentFactor: 0.82, reason: "Heavy rainfall, pine needles, algae growth; cleaning needed 3-4x/year" },
      { region: "coastal", adjustmentFactor: 0.85, reason: "Salt air corrosion at joints and hangers" },
    ],
    replacementCost: { low: 800, median: 2000, high: 4000 },
    dataFields: [
      { fieldName: "style", fieldType: "select", options: ["K-style 5\"", "K-style 6\"", "Half-round"], required: false, inspectorField: true, homeownerField: true },
      { fieldName: "gutter_guards", fieldType: "boolean", required: false, inspectorField: true, homeownerField: true },
    ],
    maintenanceTaskIds: [
      "exterior.gutter_clean",
      "exterior.gutter_inspect_hangers",
      "exterior.downspout_check",
    ],
    careKitProductTypes: ["gutter_guard", "gutter_sealant"],
    isActive: true,
    lastUpdated: Date.now(),
  },

  // --- Siding ---
  {
    catalogId: "exterior.siding.vinyl",
    category: "exterior",
    subcategory: "siding",
    systemName: "Siding — Vinyl",
    trackingLevel: "major_system",
    visibleToHomeowner: false,
    inspectorOnly: true,
    expectedLifeYears: { low: 20, median: 30, high: 50 },
    weibullShape: 2.5,
    weibullScale: 32,
    regionalFactors: [
      { region: "florida_panhandle", adjustmentFactor: 0.80, reason: "UV fading and embrittlement, moisture trapped behind panels, hurricane wind uplift" },
      { region: "coastal", adjustmentFactor: 0.85, reason: "Salt deposit buildup and UV degradation" },
    ],
    replacementCost: { low: 5000, median: 10000, high: 18000 },
    dataFields: [
      { fieldName: "thickness", fieldType: "select", options: ["Standard (0.040\")", "Premium (0.044\")", "Super Premium (0.046\"+)"], required: false, inspectorField: true, homeownerField: false },
      { fieldName: "insulated", fieldType: "boolean", required: false, inspectorField: true, homeownerField: false },
    ],
    maintenanceTaskIds: [
      "exterior.siding_wash",
      "exterior.siding_inspect",
    ],
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    catalogId: "exterior.siding.stucco",
    category: "exterior",
    subcategory: "siding",
    systemName: "Siding — Stucco",
    trackingLevel: "major_system",
    visibleToHomeowner: false,
    inspectorOnly: true,
    expectedLifeYears: { low: 25, median: 45, high: 70 },
    weibullShape: 2.0,
    weibullScale: 45,
    regionalFactors: [
      { region: "florida_panhandle", adjustmentFactor: 0.80, reason: "Moisture intrusion behind stucco is the #1 failure; tropical rain drives water into hairline cracks, causing hidden rot" },
      { region: "gulf_coast", adjustmentFactor: 0.82, reason: "High moisture and wind-driven rain; stucco cracks allow water intrusion behind the surface" },
    ],
    replacementCost: { low: 8000, median: 16000, high: 30000 },
    dataFields: [
      { fieldName: "stucco_type", fieldType: "select", options: ["Traditional (3-coat)", "EIFS (synthetic)", "One-coat"], required: false, inspectorField: true, homeownerField: false },
      { fieldName: "crack_severity", fieldType: "select", options: ["None", "Hairline", "Moderate", "Severe"], required: false, inspectorField: true, homeownerField: false },
    ],
    maintenanceTaskIds: [
      "exterior.stucco_crack_inspect",
      "exterior.stucco_wash",
      "exterior.stucco_caulk_repair",
    ],
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    catalogId: "exterior.siding.hardie_fiber_cement",
    category: "exterior",
    subcategory: "siding",
    systemName: "Siding — Fiber Cement",
    trackingLevel: "major_system",
    visibleToHomeowner: false,
    inspectorOnly: true,
    expectedLifeYears: { low: 25, median: 40, high: 60 },
    weibullShape: 2.5,
    weibullScale: 42,
    regionalFactors: [
      { region: "florida_panhandle", adjustmentFactor: 0.88, reason: "Moisture can wick into cut edges if not sealed; humid conditions test paint adhesion" },
      { region: "coastal", adjustmentFactor: 0.85, reason: "Salt air accelerates paint weathering; siding itself is durable" },
    ],
    replacementCost: { low: 10000, median: 18000, high: 30000 },
    dataFields: [
      { fieldName: "brand", fieldType: "text", required: false, inspectorField: true, homeownerField: false },
      { fieldName: "style", fieldType: "select", options: ["Lap siding", "Panel", "Shake/shingle", "Board and batten"], required: false, inspectorField: true, homeownerField: false },
      { fieldName: "factory_painted", fieldType: "boolean", required: false, inspectorField: true, homeownerField: false },
    ],
    maintenanceTaskIds: [
      "exterior.siding_wash",
      "exterior.siding_inspect",
      "exterior.siding_repaint",
      "exterior.siding_caulk_check",
    ],
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    catalogId: "exterior.siding.wood",
    category: "exterior",
    subcategory: "siding",
    systemName: "Siding — Wood",
    trackingLevel: "major_system",
    visibleToHomeowner: false,
    inspectorOnly: true,
    expectedLifeYears: { low: 15, median: 30, high: 50 },
    weibullShape: 2.2,
    weibullScale: 30,
    regionalFactors: [
      { region: "florida_panhandle", adjustmentFactor: 0.70, reason: "Extreme moisture, termite pressure, mold, and rot; wood siding has the shortest life in hot-humid climates" },
      { region: "gulf_coast", adjustmentFactor: 0.72, reason: "Moisture, insects, and UV combine to degrade rapidly without diligent maintenance" },
      { region: "coastal", adjustmentFactor: 0.75, reason: "Salt air, moisture, and wind erosion" },
    ],
    replacementCost: { low: 8000, median: 16000, high: 28000 },
    dataFields: [
      { fieldName: "wood_species", fieldType: "select", options: ["Cedar", "Redwood", "Pine", "Cypress", "Engineered wood"], required: false, inspectorField: true, homeownerField: false },
      { fieldName: "finish_type", fieldType: "select", options: ["Paint", "Stain", "Natural/unfinished"], required: false, inspectorField: true, homeownerField: false },
    ],
    maintenanceTaskIds: [
      "exterior.siding_wash",
      "exterior.siding_inspect",
      "exterior.wood_siding_stain_paint",
      "exterior.wood_rot_check",
    ],
    isActive: true,
    lastUpdated: Date.now(),
  },

  // --- Windows ---
  {
    catalogId: "exterior.windows",
    category: "exterior",
    subcategory: "windows",
    systemName: "Windows",
    trackingLevel: "major_system",
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 15, median: 25, high: 40 },
    weibullShape: 2.5,
    weibullScale: 27,
    regionalFactors: [
      { region: "florida_panhandle", adjustmentFactor: 0.82, reason: "UV degrades seals and weatherstripping; hurricane exposure requires impact-rated glass for insurance credit" },
      { region: "coastal", adjustmentFactor: 0.80, reason: "Salt air corrodes aluminum frames and degrades seals prematurely" },
    ],
    replacementCost: { low: 5000, median: 12000, high: 25000 },
    dataFields: [
      { fieldName: "type", fieldType: "select", options: ["Single pane", "Double pane", "Triple pane", "Impact rated"], required: true, inspectorField: true, homeownerField: true },
      { fieldName: "frame_material", fieldType: "select", options: ["Vinyl", "Aluminum", "Wood", "Fiberglass", "Composite"], required: true, inspectorField: true, homeownerField: true },
      { fieldName: "seal_condition", fieldType: "select", options: ["Good", "Fogging between panes", "Failed", "Unknown"], required: false, inspectorField: true, homeownerField: false },
    ],
    maintenanceTaskIds: [
      "exterior.window_seal_inspect",
      "exterior.window_weatherstrip_check",
      "exterior.window_hardware_lubricate",
      "exterior.window_wash",
    ],
    iotCompatible: true,
    iotDeviceTypes: ["window_contact_sensor"],
    isActive: true,
    lastUpdated: Date.now(),
  },

  // --- Doors ---
  {
    catalogId: "exterior.entry_doors",
    category: "exterior",
    subcategory: "doors",
    systemName: "Entry Doors",
    trackingLevel: "component",
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 20, median: 30, high: 50 },
    weibullShape: 2.2,
    weibullScale: 32,
    regionalFactors: [
      { region: "florida_panhandle", adjustmentFactor: 0.82, reason: "UV on south/west-facing doors; wind-driven rain tests weatherstripping and thresholds" },
      { region: "coastal", adjustmentFactor: 0.80, reason: "Salt air corrodes hardware and degrades finishes" },
    ],
    replacementCost: { low: 500, median: 1800, high: 5000 },
    dataFields: [
      { fieldName: "material", fieldType: "select", options: ["Steel", "Fiberglass", "Wood", "Composite"], required: false, inspectorField: true, homeownerField: true },
      { fieldName: "impact_rated", fieldType: "boolean", required: false, inspectorField: true, homeownerField: true },
    ],
    maintenanceTaskIds: [
      "exterior.door_weatherstrip_check",
      "exterior.door_hardware_lubricate",
      "exterior.door_finish_inspect",
    ],
    iotCompatible: true,
    iotDeviceTypes: ["smart_lock", "door_contact_sensor", "video_doorbell"],
    isActive: true,
    lastUpdated: Date.now(),
  },

  // --- Garage ---
  {
    catalogId: "exterior.garage_door",
    category: "exterior",
    subcategory: "garage",
    systemName: "Garage Door",
    trackingLevel: "major_system",
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 15, median: 25, high: 35 },
    weibullShape: 3.0,
    weibullScale: 27,
    regionalFactors: [
      { region: "florida_panhandle", adjustmentFactor: 0.82, reason: "Salt air, humidity on springs and hardware; wind-rated doors required in hurricane zones" },
      { region: "coastal", adjustmentFactor: 0.78, reason: "Aggressive salt corrosion on springs, hardware, and tracks" },
    ],
    replacementCost: { low: 1200, median: 2800, high: 6000 },
    dataFields: [
      { fieldName: "material", fieldType: "select", options: ["Steel", "Aluminum", "Wood", "Composite", "Fiberglass"], required: false, inspectorField: true, homeownerField: true },
      { fieldName: "insulated", fieldType: "boolean", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "wind_rated", fieldType: "boolean", required: false, inspectorField: true, homeownerField: false },
      { fieldName: "size", fieldType: "select", options: ["Single (8x7)", "Single (9x7)", "Double (16x7)", "Double (18x7)", "Other"], required: false, inspectorField: true, homeownerField: true },
    ],
    maintenanceTaskIds: [
      "exterior.garage_door_lubricate",
      "exterior.garage_door_spring_inspect",
      "exterior.garage_door_balance_test",
      "exterior.garage_door_weatherstrip",
    ],
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    catalogId: "exterior.garage_door_opener",
    category: "exterior",
    subcategory: "garage",
    systemName: "Garage Door Opener",
    trackingLevel: "component",
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 8, median: 13, high: 20 },
    weibullShape: 2.5,
    weibullScale: 14,
    regionalFactors: [
      { region: "florida_panhandle", adjustmentFactor: 0.85, reason: "Humidity exposure on electronics and motor in unconditioned garage; salt air in coastal areas" },
    ],
    replacementCost: { low: 250, median: 450, high: 800 },
    dataFields: [
      { fieldName: "drive_type", fieldType: "select", options: ["Belt drive", "Chain drive", "Screw drive", "Wall-mount (jackshaft)"], required: false, inspectorField: true, homeownerField: true },
      { fieldName: "smart_enabled", fieldType: "boolean", required: false, inspectorField: false, homeownerField: true },
      { fieldName: "battery_backup", fieldType: "boolean", required: false, inspectorField: true, homeownerField: true },
    ],
    maintenanceTaskIds: [
      "exterior.garage_opener_lubricate",
      "exterior.garage_opener_safety_test",
      "exterior.garage_opener_force_adjust",
    ],
    iotCompatible: true,
    iotDeviceTypes: ["smart_garage_controller"],
    isActive: true,
    lastUpdated: Date.now(),
  },

  // --- Decks ---
  {
    catalogId: "exterior.deck_wood",
    category: "exterior",
    subcategory: "decks",
    systemName: "Deck — Wood",
    trackingLevel: "major_system",
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 10, median: 18, high: 30 },
    weibullShape: 2.5,
    weibullScale: 19,
    regionalFactors: [
      { region: "florida_panhandle", adjustmentFactor: 0.72, reason: "Extreme moisture, termites, UV, and mold combine for rapid degradation; pressure-treated pine decays faster than in dry climates" },
      { region: "gulf_coast", adjustmentFactor: 0.75, reason: "High humidity and insect pressure accelerate wood decay" },
    ],
    replacementCost: { low: 3000, median: 8000, high: 20000 },
    dataFields: [
      { fieldName: "wood_type", fieldType: "select", options: ["Pressure-treated pine", "Cedar", "Redwood", "Ipe/tropical hardwood"], required: false, inspectorField: true, homeownerField: true },
      { fieldName: "finish_type", fieldType: "select", options: ["Stain", "Paint", "Sealer", "Unfinished"], required: false, inspectorField: true, homeownerField: true },
    ],
    maintenanceTaskIds: [
      "exterior.deck_inspect_structure",
      "exterior.deck_clean",
      "exterior.deck_stain_seal",
      "exterior.deck_hardware_check",
    ],
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    catalogId: "exterior.deck_composite",
    category: "exterior",
    subcategory: "decks",
    systemName: "Deck — Composite",
    trackingLevel: "major_system",
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 20, median: 30, high: 50 },
    weibullShape: 2.5,
    weibullScale: 32,
    regionalFactors: [
      { region: "florida_panhandle", adjustmentFactor: 0.88, reason: "UV fading and mold/mildew on capped composite; uncapped composite absorbs moisture" },
    ],
    replacementCost: { low: 5000, median: 14000, high: 30000 },
    dataFields: [
      { fieldName: "brand", fieldType: "text", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "capped", fieldType: "boolean", required: false, inspectorField: true, homeownerField: false },
      { fieldName: "substructure", fieldType: "select", options: ["Pressure-treated wood", "Steel", "Aluminum"], required: false, inspectorField: true, homeownerField: false },
    ],
    maintenanceTaskIds: [
      "exterior.deck_inspect_structure",
      "exterior.deck_clean",
      "exterior.deck_hardware_check",
    ],
    isActive: true,
    lastUpdated: Date.now(),
  },

  // --- Fences ---
  {
    catalogId: "exterior.fence_wood",
    category: "exterior",
    subcategory: "fencing",
    systemName: "Fence — Wood",
    trackingLevel: "component",
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 8, median: 15, high: 25 },
    weibullShape: 2.5,
    weibullScale: 16,
    regionalFactors: [
      { region: "florida_panhandle", adjustmentFactor: 0.72, reason: "Termites, moisture, mold, and UV; fence posts rot at ground level within 5-8 years without proper treatment" },
      { region: "gulf_coast", adjustmentFactor: 0.75, reason: "Constant moisture and insect pressure" },
    ],
    replacementCost: { low: 1500, median: 4000, high: 10000 },
    dataFields: [
      { fieldName: "wood_type", fieldType: "select", options: ["Pressure-treated pine", "Cedar", "Redwood", "Cypress"], required: false, inspectorField: true, homeownerField: true },
      { fieldName: "style", fieldType: "select", options: ["Privacy", "Picket", "Split rail", "Board on board", "Shadowbox"], required: false, inspectorField: false, homeownerField: true },
    ],
    maintenanceTaskIds: [
      "exterior.fence_inspect",
      "exterior.fence_stain_seal",
      "exterior.fence_post_check",
    ],
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    catalogId: "exterior.fence_vinyl",
    category: "exterior",
    subcategory: "fencing",
    systemName: "Fence — Vinyl",
    trackingLevel: "component",
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 20, median: 30, high: 50 },
    weibullShape: 2.5,
    weibullScale: 32,
    regionalFactors: [
      { region: "florida_panhandle", adjustmentFactor: 0.85, reason: "UV causes yellowing and embrittlement over time; hurricane winds can snap vinyl panels" },
    ],
    replacementCost: { low: 2000, median: 5000, high: 12000 },
    maintenanceTaskIds: [
      "exterior.fence_inspect",
      "exterior.fence_vinyl_wash",
    ],
    isActive: true,
    lastUpdated: Date.now(),
  },

  // --- Driveways ---
  {
    catalogId: "exterior.driveway_concrete",
    category: "exterior",
    subcategory: "driveway",
    systemName: "Driveway — Concrete",
    trackingLevel: "component",
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 20, median: 30, high: 50 },
    weibullShape: 2.5,
    weibullScale: 32,
    regionalFactors: [
      { region: "florida_panhandle", adjustmentFactor: 0.88, reason: "Tree root heaving and settlement in sandy soils; no freeze-thaw but UV and heat cause surface degradation" },
    ],
    replacementCost: { low: 3000, median: 7000, high: 15000 },
    dataFields: [
      { fieldName: "finish", fieldType: "select", options: ["Broom finish", "Stamped", "Exposed aggregate", "Stained"], required: false, inspectorField: false, homeownerField: true },
    ],
    maintenanceTaskIds: [
      "exterior.driveway_seal",
      "exterior.driveway_crack_repair",
    ],
    isActive: true,
    lastUpdated: Date.now(),
  },
  {
    catalogId: "exterior.driveway_asphalt",
    category: "exterior",
    subcategory: "driveway",
    systemName: "Driveway — Asphalt",
    trackingLevel: "component",
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 12, median: 20, high: 30 },
    weibullShape: 3.0,
    weibullScale: 21,
    regionalFactors: [
      { region: "florida_panhandle", adjustmentFactor: 0.80, reason: "Extreme heat softens asphalt, UV degrades binder; sealcoating every 2-3 years is essential" },
    ],
    replacementCost: { low: 2500, median: 5500, high: 12000 },
    maintenanceTaskIds: [
      "exterior.driveway_sealcoat",
      "exterior.driveway_crack_fill",
    ],
    isActive: true,
    lastUpdated: Date.now(),
  },

  // --- Patio ---
  {
    catalogId: "exterior.patio_concrete",
    category: "exterior",
    subcategory: "patio",
    systemName: "Patio — Concrete",
    trackingLevel: "component",
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 20, median: 30, high: 50 },
    weibullShape: 2.5,
    weibullScale: 32,
    regionalFactors: [
      { region: "florida_panhandle", adjustmentFactor: 0.88, reason: "Sandy soil settlement; tree root heaving; algae/mold growth on shaded surfaces" },
    ],
    replacementCost: { low: 2000, median: 5000, high: 12000 },
    maintenanceTaskIds: [
      "exterior.patio_clean",
      "exterior.patio_crack_repair",
      "exterior.patio_seal",
    ],
    isActive: true,
    lastUpdated: Date.now(),
  },

  // --- Exterior Paint ---
  {
    catalogId: "exterior.exterior_paint",
    category: "exterior",
    subcategory: "finishes",
    systemName: "Exterior Paint",
    trackingLevel: "cosmetic",
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 5, median: 8, high: 12 },
    weibullShape: 3.5,
    weibullScale: 9,
    regionalFactors: [
      { region: "florida_panhandle", adjustmentFactor: 0.75, reason: "Intense UV, salt air, high humidity, and driving rain cause paint to chalk, peel, and fade faster than almost anywhere in the US" },
      { region: "gulf_coast", adjustmentFactor: 0.78, reason: "UV, humidity, and mildew degrade paint rapidly" },
      { region: "coastal", adjustmentFactor: 0.80, reason: "Salt air and UV accelerate chalking and adhesion failure" },
    ],
    replacementCost: { low: 3000, median: 6000, high: 12000 },
    dataFields: [
      { fieldName: "paint_type", fieldType: "select", options: ["Acrylic latex", "Oil-based", "Elastomeric"], required: false, inspectorField: true, homeownerField: true },
      { fieldName: "substrate", fieldType: "select", options: ["Wood", "Stucco", "Fiber cement", "Concrete block", "Metal"], required: false, inspectorField: true, homeownerField: false },
      { fieldName: "year_last_painted", fieldType: "number", required: false, inspectorField: true, homeownerField: true },
    ],
    maintenanceTaskIds: [
      "exterior.paint_inspect",
      "exterior.paint_touch_up",
      "exterior.pressure_wash",
    ],
    careKitProductTypes: ["exterior_caulk", "touch_up_paint"],
    isActive: true,
    lastUpdated: Date.now(),
  },

  // --- Screen Enclosure ---
  {
    catalogId: "exterior.screen_enclosure",
    category: "exterior",
    subcategory: "enclosures",
    systemName: "Screen Enclosure (Lanai)",
    trackingLevel: "component",
    visibleToHomeowner: true,
    inspectorOnly: false,
    expectedLifeYears: { low: 15, median: 22, high: 35 },
    weibullShape: 2.5,
    weibullScale: 24,
    regionalFactors: [
      { region: "florida_panhandle", adjustmentFactor: 0.78, reason: "Hurricane winds tear screens; aluminum frame corrosion from salt air; very common structure in Florida — nearly every home has one" },
      { region: "gulf_coast", adjustmentFactor: 0.80, reason: "Wind and storm damage; screen deterioration from UV and debris" },
    ],
    replacementCost: { low: 3000, median: 8000, high: 20000 },
    dataFields: [
      { fieldName: "frame_material", fieldType: "select", options: ["Aluminum", "Steel"], required: false, inspectorField: true, homeownerField: true },
      { fieldName: "screen_type", fieldType: "select", options: ["Standard fiberglass", "Super screen (heavier gauge)", "Pet-resistant", "Solar/shade screen"], required: false, inspectorField: true, homeownerField: true },
      { fieldName: "pool_enclosure", fieldType: "boolean", required: false, inspectorField: true, homeownerField: true },
      { fieldName: "roof_type", fieldType: "select", options: ["Screen roof", "Solid roof (insulated)", "Partial solid"], required: false, inspectorField: true, homeownerField: true },
    ],
    maintenanceTaskIds: [
      "exterior.screen_inspect",
      "exterior.screen_patch_repair",
      "exterior.screen_frame_inspect",
      "exterior.screen_clean",
      "exterior.screen_post_storm_check",
    ],
    isActive: true,
    lastUpdated: Date.now(),
  },
];
