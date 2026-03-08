/**
 * Model & Serial Number Decoder
 *
 * Decodes manufacturer, model number, and serial number from US home
 * appliances and systems to extract age, capacity, efficiency, fuel type,
 * and other intelligence.
 *
 * Covers ~12 manufacturer families representing 90%+ of US residential equipment.
 */

// ============================================================
// Types
// ============================================================

export interface DecodedPlateData {
  // Age / manufacture date
  manufactureYear?: number;
  manufactureMonth?: number;
  manufactureWeek?: number;
  estimatedAge?: number; // years from today

  // Capacity
  capacityTons?: number; // HVAC
  capacityBTU?: number;
  capacityGallons?: number; // water heaters
  capacityCuFt?: number; // refrigerators, washers, dryers
  capacityHP?: number; // disposals
  capacityGrains?: number; // water softeners

  // Efficiency
  seerRating?: number; // HVAC
  afuePercent?: number; // furnaces
  energyFactor?: number; // water heaters

  // Equipment details
  fuelType?: string; // "natural_gas" | "electric" | "propane" | "dual_fuel"
  equipmentType?: string; // "central_ac" | "heat_pump" | "furnace" | "water_heater_tank" etc.
  configuration?: string; // "side_by_side" | "french_door" | "top_load" etc.
  mountType?: string; // "freestanding" | "slide_in" | "over_the_range" etc.

  // Brand intelligence
  parentCompany?: string;
  brandFamily?: string; // "whirlpool_corp" | "ge_appliances" | "carrier_global" etc.
  serialFormat?: string; // Description of how serial was decoded

  // Color / finish
  colorFinish?: string;

  // Warranty
  warrantyYears?: number;

  // Decoded flags
  decodedSerial: boolean;
  decodedModel: boolean;
  decodingNotes: string[];
}

// ============================================================
// Main entry point
// ============================================================

export function decodeModelPlate(
  manufacturer: string | undefined,
  modelNumber: string | undefined,
  serialNumber: string | undefined
): DecodedPlateData {
  const result: DecodedPlateData = {
    decodedSerial: false,
    decodedModel: false,
    decodingNotes: [],
  };

  if (!manufacturer && !modelNumber && !serialNumber) {
    return result;
  }

  const mfr = (manufacturer || "").toLowerCase().trim();
  const model = (modelNumber || "").toUpperCase().replace(/\s+/g, "");
  const serial = (serialNumber || "").toUpperCase().replace(/\s+/g, "");

  // Identify manufacturer family
  const family = identifyManufacturerFamily(mfr, model);
  if (family) {
    result.brandFamily = family.id;
    result.parentCompany = family.parentCompany;
  }

  // Decode model number
  if (model) {
    const modelInfo = decodeModel(model, mfr, family?.id);
    Object.assign(result, modelInfo);
    if (modelInfo.decodedModel) {
      result.decodedModel = true;
    }
  }

  // Decode serial number
  if (serial) {
    const serialInfo = decodeSerial(serial, mfr, family?.id, model);
    if (serialInfo.manufactureYear) {
      result.manufactureYear = serialInfo.manufactureYear;
      result.manufactureMonth = serialInfo.manufactureMonth;
      result.manufactureWeek = serialInfo.manufactureWeek;
      result.serialFormat = serialInfo.serialFormat;
      result.decodedSerial = true;

      const now = new Date();
      const estAge = now.getFullYear() - serialInfo.manufactureYear;
      result.estimatedAge = Math.max(0, estAge);
    }
    if (serialInfo.notes) {
      result.decodingNotes.push(...serialInfo.notes);
    }
  }

  return result;
}

// ============================================================
// Manufacturer family identification
// ============================================================

interface ManufacturerFamily {
  id: string;
  parentCompany: string;
  names: string[];
  modelPrefixes?: string[];
}

const MANUFACTURER_FAMILIES: ManufacturerFamily[] = [
  {
    id: "carrier_global",
    parentCompany: "Carrier Global",
    names: ["carrier", "bryant", "payne", "day & night", "day and night"],
    modelPrefixes: ["24", "25", "38", "40", "48", "50", "58", "59"],
  },
  {
    id: "trane_technologies",
    parentCompany: "Trane Technologies",
    names: ["trane", "american standard", "amstandard", "runtru"],
  },
  {
    id: "lennox",
    parentCompany: "Lennox International",
    names: ["lennox"],
  },
  {
    id: "daikin",
    parentCompany: "Daikin",
    names: ["goodman", "amana", "daikin"],
    modelPrefixes: ["GSX", "GSZ", "GSXC", "GSZC", "GMVC", "GMS", "GMEC", "ASX", "ASZ", "AMV", "ARUF", "ASPT"],
  },
  {
    id: "rheem",
    parentCompany: "Rheem Manufacturing",
    names: ["rheem", "ruud", "richmond"],
  },
  {
    id: "york",
    parentCompany: "Johnson Controls",
    names: ["york", "johnson controls", "coleman", "luxaire"],
  },
  {
    id: "whirlpool_corp",
    parentCompany: "Whirlpool Corporation",
    names: ["whirlpool", "maytag", "kitchenaid", "amana", "jenn-air", "jennair", "roper", "inglis", "estate", "gladiator", "crosley"],
    modelPrefixes: ["WRS", "WRF", "WRB", "WRT", "WDT", "WDF", "WTW", "WFW", "WED", "WGD", "WFG", "WFE", "WMH", "WMC", "MVW", "MHW", "MED", "MGD", "MDB", "MFI", "RED", "RGD", "RTW", "RAS", "KDTE", "KDFE"],
  },
  {
    id: "ge_appliances",
    parentCompany: "Haier (GE Appliances)",
    names: ["ge", "general electric", "ge appliances", "ge profile", "café", "cafe", "monogram", "hotpoint", "haier"],
  },
  {
    id: "electrolux",
    parentCompany: "Electrolux",
    names: ["frigidaire", "electrolux", "frigidaire gallery", "frigidaire professional"],
  },
  {
    id: "bsh",
    parentCompany: "BSH Home Appliances",
    names: ["bosch", "thermador", "gaggenau"],
  },
  {
    id: "samsung",
    parentCompany: "Samsung Electronics",
    names: ["samsung"],
  },
  {
    id: "lg",
    parentCompany: "LG Electronics",
    names: ["lg", "lg electronics", "lg signature"],
  },
  {
    id: "ao_smith",
    parentCompany: "A.O. Smith Corporation",
    names: ["a.o. smith", "ao smith", "a o smith", "state", "american", "lochinvar"],
  },
  {
    id: "bradford_white",
    parentCompany: "Bradford White Corporation",
    names: ["bradford white", "bradford-white"],
  },
  {
    id: "rinnai",
    parentCompany: "Rinnai Corporation",
    names: ["rinnai"],
  },
  {
    id: "navien",
    parentCompany: "Navien Inc.",
    names: ["navien"],
  },
  {
    id: "speed_queen",
    parentCompany: "Alliance Laundry Systems",
    names: ["speed queen"],
  },
  {
    id: "insinkErator",
    parentCompany: "Emerson Electric",
    names: ["insinkerator", "in-sink-erator", "insink erator"],
  },
  // Electrical panels
  {
    id: "square_d",
    parentCompany: "Schneider Electric",
    names: ["square d", "schneider electric", "schneider", "homeline", "qo"],
  },
  {
    id: "eaton",
    parentCompany: "Eaton Corporation",
    names: ["eaton", "cutler-hammer", "cutler hammer", "ch", "westinghouse", "murray"],
  },
  {
    id: "siemens_electrical",
    parentCompany: "Siemens AG",
    names: ["siemens", "ite", "gould"],
    modelPrefixes: ["S1", "P1", "BQ"],
  },
  {
    id: "federal_pacific",
    parentCompany: "Reliance Electric (defunct)",
    names: ["federal pacific", "fpe", "stab-lok", "stab lok", "federal pacific electric"],
  },
  {
    id: "zinsco",
    parentCompany: "Defunct",
    names: ["zinsco", "gte sylvania", "sylvania-zinsco", "magnetrip"],
  },
  // Mini-split / ductless
  {
    id: "mitsubishi_electric",
    parentCompany: "Mitsubishi Electric",
    names: ["mitsubishi", "mitsubishi electric", "mr. slim", "mr slim"],
    modelPrefixes: ["MSZ", "MUZ", "MSY", "MXZ", "MVZ", "SEZ", "SLZ", "PCA", "PKA"],
  },
  {
    id: "fujitsu",
    parentCompany: "Fujitsu General",
    names: ["fujitsu", "fujitsu general", "halcyon"],
    modelPrefixes: ["ASU", "AOU", "ARU", "AUU", "ABU"],
  },
  // Roofing
  {
    id: "gaf",
    parentCompany: "Standard Industries",
    names: ["gaf", "gaf-elk", "elk"],
  },
  {
    id: "certainteed",
    parentCompany: "Saint-Gobain",
    names: ["certainteed", "certain teed"],
  },
  {
    id: "owens_corning",
    parentCompany: "Owens Corning",
    names: ["owens corning", "owens-corning"],
  },
  // Miele
  {
    id: "miele",
    parentCompany: "Miele",
    names: ["miele"],
  },
  // Sub-Zero / Wolf
  {
    id: "sub_zero_wolf",
    parentCompany: "Sub-Zero Group",
    names: ["sub-zero", "sub zero", "subzero", "wolf"],
  },
];

function identifyManufacturerFamily(
  mfr: string,
  model: string
): ManufacturerFamily | null {
  // Direct name match
  for (const fam of MANUFACTURER_FAMILIES) {
    for (const name of fam.names) {
      if (mfr.includes(name)) return fam;
    }
  }

  // Model prefix match
  for (const fam of MANUFACTURER_FAMILIES) {
    if (fam.modelPrefixes) {
      for (const prefix of fam.modelPrefixes) {
        if (model.startsWith(prefix)) return fam;
      }
    }
  }

  // Whirlpool/Roper/Maytag/KitchenAid model patterns
  if (/^W[RFTDE][SFBTDEG]/.test(model) || /^M[FHVDE][IWBDV]/.test(model) || /^K[RD][FB]/.test(model) || /^R[ETGA][DWST]/.test(model)) {
    return MANUFACTURER_FAMILIES.find((f) => f.id === "whirlpool_corp") || null;
  }
  // GE model patterns
  if (/^[GPCgpc][SDTF][SWTFP]/.test(model) || /^J[GBVES]/.test(model)) {
    return MANUFACTURER_FAMILIES.find((f) => f.id === "ge_appliances") || null;
  }
  // Samsung appliance patterns
  if (/^(R[FSTB]|N[XE]|DW|DV[EG]|W[FA]|M[ECW])\d/.test(model)) {
    return MANUFACTURER_FAMILIES.find((f) => f.id === "samsung") || null;
  }
  // LG patterns
  if (/^L[RMDW][A-Z]/.test(model)) {
    return MANUFACTURER_FAMILIES.find((f) => f.id === "lg") || null;
  }
  // Frigidaire patterns
  if (/^F[FGP][A-Z]{2}\d/.test(model)) {
    return MANUFACTURER_FAMILIES.find((f) => f.id === "electrolux") || null;
  }
  // Bosch dishwasher
  if (/^SH[PVEX]/.test(model)) {
    return MANUFACTURER_FAMILIES.find((f) => f.id === "bsh") || null;
  }

  return null;
}

// ============================================================
// Model number decoders
// ============================================================

interface ModelDecodeResult {
  decodedModel: boolean;
  equipmentType?: string;
  capacityTons?: number;
  capacityBTU?: number;
  capacityGallons?: number;
  capacityCuFt?: number;
  capacityHP?: number;
  capacityGrains?: number;
  seerRating?: number;
  afuePercent?: number;
  fuelType?: string;
  configuration?: string;
  mountType?: string;
  colorFinish?: string;
  warrantyYears?: number;
  decodingNotes: string[];
}

function decodeModel(model: string, mfr: string, familyId?: string): ModelDecodeResult {
  const r: ModelDecodeResult = { decodedModel: false, decodingNotes: [] };

  // HVAC capacity extraction: 3-digit ton code anywhere in model
  const tonMatch = model.match(/(?:^|\D)(018|024|030|036|042|048|060)(?:\D|$)/);
  if (tonMatch) {
    const code = parseInt(tonMatch[1], 10);
    r.capacityTons = code / 12;
    r.capacityBTU = code * 1000;
    r.decodedModel = true;
    r.decodingNotes.push(`Capacity: ${r.capacityTons}T (${r.capacityBTU.toLocaleString()} BTU)`);
  }

  // Try family-specific decoding
  switch (familyId) {
    case "carrier_global":
      return decodeCarrierModel(model, r);
    case "trane_technologies":
      return decodeTraneModel(model, r);
    case "daikin":
      return decodeGoodmanModel(model, r);
    case "rheem":
      return decodeRheemModel(model, r);
    case "whirlpool_corp":
      return decodeWhirlpoolModel(model, r);
    case "ge_appliances":
      return decodeGEModel(model, r);
    case "samsung":
      return decodeSamsungModel(model, r);
    case "lg":
      return decodeLGModel(model, r);
    case "electrolux":
      return decodeFrigidaireModel(model, r);
    case "bsh":
      return decodeBoschModel(model, r);
    case "ao_smith":
      return decodeAOSmithModel(model, r);
    case "bradford_white":
      return decodeBradfordWhiteModel(model, r);
    case "rinnai":
      return decodeRinnaiModel(model, r);
    case "navien":
      return decodeNavienModel(model, r);
    case "lennox":
      return decodeLennoxModel(model, r);
    case "speed_queen":
      return decodeSpeedQueenModel(model, r);
    case "insinkErator":
      return decodeInSinkEratorModel(model, r);
    case "square_d":
    case "eaton":
    case "siemens_electrical":
    case "federal_pacific":
    case "zinsco":
      return decodeElectricalPanelModel(model, r, familyId);
    case "mitsubishi_electric":
      return decodeMitsubishiModel(model, r);
    case "fujitsu":
      return decodeFujitsuModel(model, r);
    default:
      return decodeGenericModel(model, r);
  }
}

// --- Carrier/Bryant ---
function decodeCarrierModel(model: string, r: ModelDecodeResult): ModelDecodeResult {
  if (/^(24|25|38)/.test(model)) {
    r.equipmentType = model.startsWith("25") || model.startsWith("38") ? "heat_pump" : "central_ac";
    r.fuelType = "electric";
  } else if (/^(58|59)/.test(model)) {
    r.equipmentType = "furnace";
    r.fuelType = "natural_gas";
    const btuMatch = model.match(/(\d{3})(?=V|[A-Z]\d{2})/);
    if (btuMatch) {
      r.capacityBTU = parseInt(btuMatch[1], 10) * 1000;
      r.decodingNotes.push(`Furnace input: ${r.capacityBTU.toLocaleString()} BTU`);
    }
  } else if (/^(40|48|50)/.test(model)) {
    r.equipmentType = "packaged_unit";
  }
  // SEER from series name (approximate from common models)
  const seerMatch = model.match(/^(?:24|25)ACC(\d)/);
  if (seerMatch) r.seerRating = parseInt(seerMatch[1], 10) + 10;

  r.decodedModel = true;
  return r;
}

// --- Trane/American Standard ---
function decodeTraneModel(model: string, r: ModelDecodeResult): ModelDecodeResult {
  if (/^4TT[RW]/i.test(model)) {
    r.equipmentType = model.includes("W") ? "heat_pump" : "central_ac";
    r.fuelType = "electric";
    const seerDigit = model.match(/^4TT[RW](\d)/);
    if (seerDigit) r.seerRating = parseInt(seerDigit[1], 10) + 10;
  } else if (/^(TUH|TUD|S9V)/i.test(model)) {
    r.equipmentType = "furnace";
    r.fuelType = "natural_gas";
  }
  r.decodedModel = true;
  return r;
}

// --- Goodman/Amana ---
function decodeGoodmanModel(model: string, r: ModelDecodeResult): ModelDecodeResult {
  const typeMatch = model.match(/^(G[SM][XZV]C?|A[SM][XZV]C?|ARUF|ASPT)/);
  if (typeMatch) {
    const prefix = typeMatch[1];
    if (prefix.startsWith("GSX") || prefix.startsWith("ASX")) {
      r.equipmentType = "central_ac";
      r.fuelType = "electric";
    } else if (prefix.startsWith("GSZ") || prefix.startsWith("ASZ")) {
      r.equipmentType = "heat_pump";
      r.fuelType = "electric";
    } else if (prefix.startsWith("GMV") || prefix.startsWith("GMS") || prefix.startsWith("GME") || prefix.startsWith("AMV")) {
      r.equipmentType = "furnace";
      r.fuelType = "natural_gas";
    } else if (prefix === "ARUF" || prefix === "ASPT") {
      r.equipmentType = "air_handler";
      r.fuelType = "electric";
    }
    // SEER from 2 digits after type
    const seerMatch = model.match(/^[A-Z]{3,4}(\d{2})/);
    if (seerMatch) r.seerRating = parseInt(seerMatch[1], 10);
  }
  r.decodedModel = true;
  return r;
}

// --- Rheem/Ruud ---
function decodeRheemModel(model: string, r: ModelDecodeResult): ModelDecodeResult {
  if (/^(RA|UA)/i.test(model)) {
    r.equipmentType = "central_ac";
    r.fuelType = "electric";
  } else if (/^(RP|UP)/i.test(model)) {
    r.equipmentType = "heat_pump";
    r.fuelType = "electric";
  } else if (/^R[89]\d{2}/i.test(model)) {
    r.equipmentType = "furnace";
    r.fuelType = "natural_gas";
    const afueMatch = model.match(/^R(\d{2})/);
    if (afueMatch) r.afuePercent = parseInt(afueMatch[1], 10);
  }
  // SEER
  const seerMatch = model.match(/^[RU][AP](\d{2})/);
  if (seerMatch) r.seerRating = parseInt(seerMatch[1], 10);

  // Water heater detection
  const whMatch = model.match(/^[A-Z]{2,4}(\d{2})[TS]/);
  if (whMatch) {
    r.equipmentType = "water_heater_tank";
    r.capacityGallons = parseInt(whMatch[1], 10);
    if (model.endsWith("N")) r.fuelType = "natural_gas";
    else if (model.match(/LP$/)) r.fuelType = "propane";
    const warrantyMatch = model.match(/(\d{2})(?=[A-Z\d]{2,}$)/);
    if (warrantyMatch) {
      const wVal = parseInt(warrantyMatch[1], 10);
      if (wVal >= 6 && wVal <= 15) r.warrantyYears = wVal;
    }
  }

  r.decodedModel = true;
  return r;
}

// --- Whirlpool Corp (Whirlpool, Maytag, KitchenAid, Amana) ---
function decodeWhirlpoolModel(model: string, r: ModelDecodeResult): ModelDecodeResult {
  // Refrigerators
  if (/^W[R]S/i.test(model)) { r.equipmentType = "refrigerator"; r.configuration = "side_by_side"; }
  else if (/^W[R]F/i.test(model)) { r.equipmentType = "refrigerator"; r.configuration = "french_door"; }
  else if (/^W[R]B/i.test(model)) { r.equipmentType = "refrigerator"; r.configuration = "bottom_freezer"; }
  else if (/^W[R]T/i.test(model)) { r.equipmentType = "refrigerator"; r.configuration = "top_freezer"; }
  else if (/^M[FR]I/i.test(model)) { r.equipmentType = "refrigerator"; r.configuration = "french_door"; }
  // Dishwashers
  else if (/^WDT/i.test(model)) { r.equipmentType = "dishwasher"; r.configuration = "top_controls"; }
  else if (/^WDF/i.test(model)) { r.equipmentType = "dishwasher"; r.configuration = "front_controls"; }
  else if (/^MDB/i.test(model)) { r.equipmentType = "dishwasher"; }
  else if (/^KD[TF]E/i.test(model)) { r.equipmentType = "dishwasher"; }
  // Washers
  else if (/^WTW/i.test(model)) { r.equipmentType = "washer"; r.configuration = "top_load"; }
  else if (/^WFW/i.test(model)) { r.equipmentType = "washer"; r.configuration = "front_load"; }
  else if (/^MVW/i.test(model)) { r.equipmentType = "washer"; r.configuration = "top_load"; }
  else if (/^MHW/i.test(model)) { r.equipmentType = "washer"; r.configuration = "front_load"; }
  // Dryers (Whirlpool: WED/WGD, Maytag: MED/MGD, Roper: RED/RGD)
  else if (/^[WR]ED/i.test(model)) { r.equipmentType = "dryer"; r.fuelType = "electric"; }
  else if (/^[WR]GD/i.test(model)) { r.equipmentType = "dryer"; r.fuelType = "natural_gas"; }
  else if (/^MED/i.test(model)) { r.equipmentType = "dryer"; r.fuelType = "electric"; }
  else if (/^MGD/i.test(model)) { r.equipmentType = "dryer"; r.fuelType = "natural_gas"; }
  // Washers (Roper: RTW)
  else if (/^RTW/i.test(model)) { r.equipmentType = "washer"; r.configuration = "top_load"; }
  else if (/^RAS/i.test(model)) { r.equipmentType = "range"; r.fuelType = "electric"; }
  // Ranges
  else if (/^WFG/i.test(model)) { r.equipmentType = "range"; r.fuelType = "natural_gas"; }
  else if (/^WFE/i.test(model)) { r.equipmentType = "range"; r.fuelType = "electric"; }
  // Microwaves
  else if (/^WMH/i.test(model)) { r.equipmentType = "microwave"; r.mountType = "over_the_range"; }
  else if (/^WMC/i.test(model)) { r.equipmentType = "microwave"; r.mountType = "countertop"; }
  // Water softeners
  else if (/^WHES/i.test(model)) {
    r.equipmentType = "water_softener";
    const grainMatch = model.match(/WHES(\d{2})/);
    if (grainMatch) r.capacityGrains = parseInt(grainMatch[1], 10) * 1000;
  }

  // Color decode (last 1-2 chars)
  r.colorFinish = decodeWhirlpoolColor(model);

  r.decodedModel = true;
  return r;
}

function decodeWhirlpoolColor(model: string): string | undefined {
  const last2 = model.slice(-2);
  const last1 = model.slice(-1);
  if (last2 === "HZ" || last2 === "HV") return "Fingerprint-Resistant Stainless";
  if (last1 === "Z" || last2 === "SS") return "Stainless Steel";
  if (last1 === "W" || last2 === "WW") return "White";
  if (last1 === "B" || last2 === "BB") return "Black";
  return undefined;
}

// --- GE / Profile / Café ---
function decodeGEModel(model: string, r: ModelDecodeResult): ModelDecodeResult {
  if (/^G[S]S/i.test(model)) { r.equipmentType = "refrigerator"; r.configuration = "side_by_side"; }
  else if (/^[GP]FE/i.test(model) || /^CFE/i.test(model)) { r.equipmentType = "refrigerator"; r.configuration = "french_door"; }
  else if (/^G[D]T/i.test(model) || /^PDT/i.test(model)) { r.equipmentType = "dishwasher"; r.configuration = "top_controls"; }
  else if (/^G[D]F/i.test(model)) { r.equipmentType = "dishwasher"; r.configuration = "front_controls"; }
  else if (/^GTW/i.test(model) || /^PTW/i.test(model)) { r.equipmentType = "washer"; r.configuration = "top_load"; }
  else if (/^GFW/i.test(model) || /^PFW/i.test(model)) { r.equipmentType = "washer"; r.configuration = "front_load"; }
  else if (/^GTD/i.test(model) || /^PTD/i.test(model)) {
    r.equipmentType = "dryer";
    if (/E[A-Z\d]*[A-Z]$/.test(model) || /B[A-Z\d]*[A-Z]$/.test(model)) r.fuelType = "electric";
    else if (model.includes("G")) r.fuelType = "natural_gas";
  }
  else if (/^JGB/i.test(model) || /^PGB/i.test(model)) { r.equipmentType = "range"; r.fuelType = "natural_gas"; }
  else if (/^JB\d/i.test(model)) { r.equipmentType = "range"; r.fuelType = "electric"; }
  else if (/^JVM/i.test(model) || /^PVM/i.test(model)) { r.equipmentType = "microwave"; r.mountType = "over_the_range"; }
  else if (/^JES/i.test(model)) { r.equipmentType = "microwave"; r.mountType = "countertop"; }

  // Capacity from digits
  const capMatch = model.match(/(?:^[A-Z]{3})(\d{2})/);
  if (capMatch) {
    const cap = parseInt(capMatch[1], 10);
    if (r.equipmentType === "refrigerator" && cap >= 15 && cap <= 32) r.capacityCuFt = cap;
  }

  r.colorFinish = decodeGEColor(model);
  r.decodedModel = true;
  return r;
}

function decodeGEColor(model: string): string | undefined {
  const last2 = model.slice(-2);
  if (last2 === "SS") return "Stainless Steel";
  if (last2 === "FS") return "Fingerprint-Resistant Stainless";
  if (last2 === "WW") return "White";
  if (last2 === "BB") return "Black";
  return undefined;
}

// --- Samsung ---
function decodeSamsungModel(model: string, r: ModelDecodeResult): ModelDecodeResult {
  if (/^RF/i.test(model)) { r.equipmentType = "refrigerator"; r.configuration = "french_door"; }
  else if (/^RS/i.test(model)) { r.equipmentType = "refrigerator"; r.configuration = "side_by_side"; }
  else if (/^RT/i.test(model)) { r.equipmentType = "refrigerator"; r.configuration = "top_freezer"; }
  else if (/^RB/i.test(model)) { r.equipmentType = "refrigerator"; r.configuration = "bottom_freezer"; }
  else if (/^NX/i.test(model)) { r.equipmentType = "range"; r.fuelType = "natural_gas"; }
  else if (/^NE/i.test(model)) { r.equipmentType = "range"; r.fuelType = "electric"; }
  else if (/^DW/i.test(model)) { r.equipmentType = "dishwasher"; }
  else if (/^DVE/i.test(model)) { r.equipmentType = "dryer"; r.fuelType = "electric"; }
  else if (/^DVG/i.test(model)) { r.equipmentType = "dryer"; r.fuelType = "natural_gas"; }
  else if (/^WF/i.test(model)) { r.equipmentType = "washer"; r.configuration = "front_load"; }
  else if (/^WA/i.test(model)) { r.equipmentType = "washer"; r.configuration = "top_load"; }
  else if (/^ME/i.test(model)) { r.equipmentType = "microwave"; r.mountType = "over_the_range"; }
  else if (/^MC/i.test(model)) { r.equipmentType = "microwave"; r.mountType = "countertop"; }

  // Capacity from digits
  const capMatch = model.match(/^[A-Z]{2}(\d{2})/);
  if (capMatch) {
    const cap = parseInt(capMatch[1], 10);
    if (r.equipmentType === "refrigerator" && cap >= 15 && cap <= 32) r.capacityCuFt = cap;
    if (r.equipmentType === "washer" && cap >= 40 && cap <= 60) r.capacityCuFt = cap / 10;
    if (r.equipmentType === "microwave" && cap >= 15 && cap <= 25) r.capacityCuFt = cap / 10;
  }

  r.decodedModel = true;
  return r;
}

// --- LG ---
function decodeLGModel(model: string, r: ModelDecodeResult): ModelDecodeResult {
  if (/^LR[MF]/i.test(model)) { r.equipmentType = "refrigerator"; r.configuration = "french_door"; }
  else if (/^LRS/i.test(model)) { r.equipmentType = "refrigerator"; r.configuration = "side_by_side"; }
  else if (/^LRT/i.test(model)) { r.equipmentType = "refrigerator"; r.configuration = "top_freezer"; }
  else if (/^LMV/i.test(model)) { r.equipmentType = "microwave"; r.mountType = "over_the_range"; }
  else if (/^LMC/i.test(model)) { r.equipmentType = "microwave"; r.mountType = "countertop"; }
  else if (/^LRG/i.test(model) || /^LSG/i.test(model)) { r.equipmentType = "range"; r.fuelType = "natural_gas"; }
  else if (/^LRE/i.test(model) || /^LSE/i.test(model)) { r.equipmentType = "range"; r.fuelType = "electric"; }
  else if (/^LDP/i.test(model) || /^LDF/i.test(model)) { r.equipmentType = "dishwasher"; }
  else if (/^WM/i.test(model)) { r.equipmentType = "washer"; r.configuration = "front_load"; }
  else if (/^WT/i.test(model)) { r.equipmentType = "washer"; r.configuration = "top_load"; }
  else if (/^DLE/i.test(model)) { r.equipmentType = "dryer"; r.fuelType = "electric"; }
  else if (/^DLG/i.test(model)) { r.equipmentType = "dryer"; r.fuelType = "natural_gas"; }

  r.decodedModel = true;
  return r;
}

// --- Frigidaire/Electrolux ---
function decodeFrigidaireModel(model: string, r: ModelDecodeResult): ModelDecodeResult {
  if (/^F[FG]HB/i.test(model)) { r.equipmentType = "refrigerator"; r.configuration = "french_door"; }
  else if (/^F[FG]SS/i.test(model)) { r.equipmentType = "refrigerator"; r.configuration = "side_by_side"; }
  else if (/^F[FG]TR/i.test(model)) { r.equipmentType = "refrigerator"; r.configuration = "top_freezer"; }
  else if (/^F[FG]ID/i.test(model)) { r.equipmentType = "dishwasher"; }
  else if (/^FFCD/i.test(model)) { r.equipmentType = "dishwasher"; }
  else if (/^F[FG]GH/i.test(model)) { r.equipmentType = "range"; r.fuelType = "natural_gas"; }
  else if (/^F[FG]EF/i.test(model)) { r.equipmentType = "range"; r.fuelType = "electric"; }
  else if (/^FGMV/i.test(model) || /^FFMV/i.test(model)) { r.equipmentType = "microwave"; r.mountType = "over_the_range"; }

  r.decodedModel = true;
  return r;
}

// --- Bosch/Thermador ---
function decodeBoschModel(model: string, r: ModelDecodeResult): ModelDecodeResult {
  if (/^SH[PVEX]/i.test(model)) {
    r.equipmentType = "dishwasher";
    if (/^SHP/i.test(model)) r.decodingNotes.push("800 Series");
    else if (/^SHE/i.test(model)) r.decodingNotes.push("500/300 Series");
    else if (/^SHV/i.test(model)) r.decodingNotes.push("800+ Series");
  }
  r.decodedModel = true;
  return r;
}

// --- A.O. Smith ---
function decodeAOSmithModel(model: string, r: ModelDecodeResult): ModelDecodeResult {
  r.equipmentType = "water_heater_tank";
  const capMatch = model.match(/(\d{2})(?=[TS])/);
  if (capMatch) r.capacityGallons = parseInt(capMatch[1], 10);
  if (model.startsWith("G")) r.fuelType = "natural_gas";
  else if (model.startsWith("E")) r.fuelType = "electric";
  r.decodedModel = true;
  return r;
}

// --- Bradford White ---
function decodeBradfordWhiteModel(model: string, r: ModelDecodeResult): ModelDecodeResult {
  r.equipmentType = "water_heater_tank";
  const capMatch = model.match(/(\d{2})[TS]/);
  if (capMatch) r.capacityGallons = parseInt(capMatch[1], 10);
  if (model.endsWith("N")) r.fuelType = "natural_gas";
  else if (model.match(/LP$/)) r.fuelType = "propane";
  r.decodedModel = true;
  return r;
}

// --- Rinnai ---
function decodeRinnaiModel(model: string, r: ModelDecodeResult): ModelDecodeResult {
  r.equipmentType = "water_heater_tankless";
  const btuMatch = model.match(/(\d{3})/);
  if (btuMatch) r.capacityBTU = parseInt(btuMatch[1], 10) * 1000;
  if (model.includes("N")) r.fuelType = "natural_gas";
  else if (model.includes("P")) r.fuelType = "propane";
  if (model.toLowerCase().includes("i")) r.configuration = "interior";
  else if (model.toLowerCase().includes("e")) r.configuration = "exterior";
  r.decodedModel = true;
  return r;
}

// --- Navien ---
function decodeNavienModel(model: string, r: ModelDecodeResult): ModelDecodeResult {
  r.equipmentType = "water_heater_tankless";
  if (/^NPE/i.test(model)) {
    r.decodingNotes.push("Condensing tankless water heater");
    const btuMatch = model.match(/NPE-?(\d{3})/i);
    if (btuMatch) {
      const code = parseInt(btuMatch[1], 10);
      if (code === 240) r.capacityBTU = 199000;
      else if (code === 210) r.capacityBTU = 180000;
      else if (code === 180) r.capacityBTU = 150000;
      else r.capacityBTU = code * 1000;
    }
  }
  r.fuelType = "natural_gas";
  r.decodedModel = true;
  return r;
}

// --- Lennox ---
function decodeLennoxModel(model: string, r: ModelDecodeResult): ModelDecodeResult {
  // AC/HP models like XC25-036-230, 14ACX-036-230, EL16XC1-036-230
  const seerMatch = model.match(/^XC(\d{2})/i);
  if (seerMatch) {
    r.seerRating = parseInt(seerMatch[1], 10);
    r.equipmentType = "central_ac";
    r.fuelType = "electric";
  } else if (/^\d{2}ACX/i.test(model)) {
    const seer2 = model.match(/^(\d{2})ACX/i);
    if (seer2) r.seerRating = parseInt(seer2[1], 10);
    r.equipmentType = "central_ac";
    r.fuelType = "electric";
  } else if (/^EL\d{2}/i.test(model)) {
    const seer3 = model.match(/^EL(\d{2})/i);
    if (seer3) r.seerRating = parseInt(seer3[1], 10);
    r.equipmentType = "central_ac";
    r.fuelType = "electric";
  }
  // Furnace models like SL280UHV070P36B
  else if (/^SL\d{2}/i.test(model)) {
    r.equipmentType = "furnace";
    r.fuelType = "natural_gas";
    const afueMatch = model.match(/^SL(\d{2})/i);
    if (afueMatch) r.afuePercent = parseInt(afueMatch[1], 10);
    const btuMatch = model.match(/(\d{3})(?=P)/i);
    if (btuMatch) {
      r.capacityBTU = parseInt(btuMatch[1], 10) * 1000;
      r.decodingNotes.push(`Furnace input: ${r.capacityBTU.toLocaleString()} BTU`);
    }
  }
  r.decodedModel = true;
  return r;
}

// --- Speed Queen ---
function decodeSpeedQueenModel(model: string, r: ModelDecodeResult): ModelDecodeResult {
  if (/^TR/i.test(model)) { r.equipmentType = "washer"; r.configuration = "top_load"; }
  else if (/^FF/i.test(model)) { r.equipmentType = "washer"; r.configuration = "front_load"; }
  else if (/^DR/i.test(model)) {
    r.equipmentType = "dryer";
    if (model.match(/E$/)) r.fuelType = "electric";
    else if (model.match(/G$/)) r.fuelType = "natural_gas";
  }
  r.decodedModel = true;
  return r;
}

// --- InSinkErator ---
function decodeInSinkEratorModel(model: string, r: ModelDecodeResult): ModelDecodeResult {
  r.equipmentType = "garbage_disposal";

  // Name-based HP lookup
  const nameLower = model.toLowerCase();
  if (nameLower.includes("badger 1") || model === "1-79") r.capacityHP = 1 / 3;
  else if (nameLower.includes("badger 5") || model === "1-83") r.capacityHP = 0.5;
  else if (nameLower.includes("badger 900")) r.capacityHP = 0.75;
  else if (nameLower.includes("compact")) r.capacityHP = 0.75;
  else if (nameLower.includes("essential")) r.capacityHP = 0.75;
  else if (nameLower.includes("excel")) r.capacityHP = 1.0;
  else if (nameLower.includes("pro")) r.capacityHP = 1.1;
  else if (/^SS-?200/i.test(model)) r.capacityHP = 0.75;

  // Numeric model: 1-XX format
  const numMatch = model.match(/^(\d)-(\d{2,3})/);
  if (numMatch) r.decodingNotes.push(`InSinkErator model ${numMatch[0]}`);

  r.decodedModel = true;
  return r;
}

// --- Waste King ---
function decodeWasteKingModel(model: string, r: ModelDecodeResult): ModelDecodeResult {
  r.equipmentType = "garbage_disposal";
  const seriesMatch = model.match(/L?-?(\d{4})/);
  if (seriesMatch) {
    const series = parseInt(seriesMatch[1], 10);
    if (series <= 1200) r.capacityHP = 1 / 3;
    else if (series <= 2700) r.capacityHP = 0.5;
    else if (series <= 3400) r.capacityHP = 0.75;
    else if (series <= 8100) r.capacityHP = 1.0;
    else r.capacityHP = 1.0;
  }
  r.decodedModel = true;
  return r;
}

// --- Moen Disposal ---
function decodeMoenModel(model: string, r: ModelDecodeResult): ModelDecodeResult {
  r.equipmentType = "garbage_disposal";
  if (/GX50/i.test(model)) r.capacityHP = 0.5;
  else if (/GXS?75/i.test(model)) r.capacityHP = 0.75;
  else if (/GX100/i.test(model)) r.capacityHP = 1.0;
  r.decodedModel = true;
  return r;
}

// --- Electrical Panels ---
function decodeElectricalPanelModel(model: string, r: ModelDecodeResult, familyId?: string): ModelDecodeResult {
  r.equipmentType = "electrical_panel";

  // Amperage from model number
  const ampMatch = model.match(/(\d{2,3})(?:\s*A(?:MP)?)/i) || model.match(/(?:^|\D)(100|125|150|200|225|400)(?:\D|$)/);
  if (ampMatch) {
    const amps = parseInt(ampMatch[1], 10);
    if (amps >= 60 && amps <= 400) {
      r.decodingNotes.push(`Panel rated ${amps}A`);
    }
  }

  if (familyId === "federal_pacific") {
    r.decodingNotes.push("⚠️ SAFETY: Federal Pacific (FPE) Stab-Lok panel — known high breaker failure rate. Recommend evaluation by licensed electrician.");
  }
  if (familyId === "zinsco") {
    r.decodingNotes.push("⚠️ SAFETY: Zinsco panel — breakers may melt to bus bar and fail to trip. Recommend evaluation by licensed electrician.");
  }

  r.decodedModel = true;
  return r;
}

// --- Mitsubishi Electric mini-splits ---
function decodeMitsubishiModel(model: string, r: ModelDecodeResult): ModelDecodeResult {
  if (/^MSZ/i.test(model)) {
    r.equipmentType = "ductless_indoor";
    r.fuelType = "electric";
  } else if (/^MUZ/i.test(model)) {
    r.equipmentType = "ductless_outdoor";
    r.fuelType = "electric";
  } else if (/^MXZ/i.test(model)) {
    r.equipmentType = "multi_zone_outdoor";
    r.fuelType = "electric";
  } else if (/^MVZ/i.test(model)) {
    r.equipmentType = "ducted_air_handler";
    r.fuelType = "electric";
  }

  // Capacity from BTU code embedded in model (e.g., MSZ-GL09NA = 9,000 BTU)
  const btuMatch = model.match(/(?:^[A-Z]{3}-?[A-Z]{2})(\d{2})/);
  if (btuMatch) {
    const code = parseInt(btuMatch[1], 10);
    r.capacityBTU = code * 1000;
    r.capacityTons = code / 12;
    r.decodingNotes.push(`Ductless: ${r.capacityBTU.toLocaleString()} BTU (${r.capacityTons.toFixed(1)}T)`);
  }

  r.decodedModel = true;
  return r;
}

// --- Fujitsu mini-splits ---
function decodeFujitsuModel(model: string, r: ModelDecodeResult): ModelDecodeResult {
  if (/^ASU/i.test(model)) {
    r.equipmentType = "ductless_indoor";
    r.fuelType = "electric";
  } else if (/^AOU/i.test(model)) {
    r.equipmentType = "ductless_outdoor";
    r.fuelType = "electric";
  } else if (/^ARU/i.test(model)) {
    r.equipmentType = "ducted_air_handler";
    r.fuelType = "electric";
  }

  const btuMatch = model.match(/(\d{2})(?=[A-Z]{2,})/);
  if (btuMatch) {
    const code = parseInt(btuMatch[1], 10);
    if (code >= 7 && code <= 48) {
      r.capacityBTU = code * 1000;
      r.capacityTons = code / 12;
    }
  }

  r.decodedModel = true;
  return r;
}

// --- Generic fallback ---
function decodeGenericModel(model: string, r: ModelDecodeResult): ModelDecodeResult {
  // Water softener patterns
  if (/^GX[A-Z]{2}\d{2}/i.test(model)) {
    r.equipmentType = "water_softener";
    const capMatch = model.match(/GX[A-Z]{2}(\d{2})/i);
    if (capMatch) r.capacityGrains = parseInt(capMatch[1], 10) * 1000;
    r.decodedModel = true;
    return r;
  }
  // Kenmore softener
  if (/^625\./i.test(model)) {
    r.equipmentType = "water_softener";
    r.decodingNotes.push("Kenmore (Sears) water treatment product");
    r.decodedModel = true;
    return r;
  }
  // Waste King disposal
  if (/^L-?\d{4}/i.test(model)) return decodeWasteKingModel(model, r);
  // InSinkErator numeric
  if (/^\d-\d{2,3}[A-Z]?$/i.test(model)) return decodeInSinkEratorModel(model, r);
  // Moen disposal
  if (/^GX[S]?\d{2}/i.test(model)) return decodeMoenModel(model, r);

  // Try to detect water heater
  const whCapMatch = model.match(/(\d{2})[TS]\d/);
  if (whCapMatch) {
    const gal = parseInt(whCapMatch[1], 10);
    if (gal >= 20 && gal <= 100) {
      r.equipmentType = "water_heater_tank";
      r.capacityGallons = gal;
      r.decodedModel = true;
    }
  }
  return r;
}

// ============================================================
// Serial number decoders
// ============================================================

interface SerialDecodeResult {
  manufactureYear?: number;
  manufactureMonth?: number;
  manufactureWeek?: number;
  serialFormat?: string;
  notes: string[];
}

function decodeSerial(serial: string, mfr: string, familyId?: string, model?: string): SerialDecodeResult {
  switch (familyId) {
    case "carrier_global":
      return decodeCarrierSerial(serial);
    case "trane_technologies":
      return decodeTraneSerial(serial);
    case "daikin":
      return decodeGoodmanSerial(serial);
    case "rheem":
      return decodeRheemSerial(serial);
    case "york":
      return decodeYorkSerial(serial);
    case "whirlpool_corp":
      return decodeWhirlpoolSerial(serial);
    case "ge_appliances":
      return decodeGESerial(serial);
    case "bsh":
      return decodeBoschSerial(serial);
    case "ao_smith":
      return decodeAOSmithSerial(serial);
    case "bradford_white":
      return decodeBradfordWhiteSerial(serial);
    case "lennox":
      return decodeLennoxSerial(serial);
    case "samsung":
      return decodeSamsungSerial(serial);
    case "lg":
      return decodeLGSerial(serial);
    case "electrolux":
      return decodeElectroluxSerial(serial);
    case "rinnai":
    case "navien":
      return decodeTanklessSerial(serial);
    case "mitsubishi_electric":
    case "fujitsu":
      return decodeMiniSplitSerial(serial);
    default:
      return decodeGenericSerial(serial);
  }
}

// --- Carrier/Bryant: [WW][YY][plant][sequence] ---
function decodeCarrierSerial(serial: string): SerialDecodeResult {
  const r: SerialDecodeResult = { notes: [] };
  if (serial.length >= 4 && /^\d{4}/.test(serial)) {
    const week = parseInt(serial.substring(0, 2), 10);
    const year = parseInt(serial.substring(2, 4), 10);
    if (week >= 1 && week <= 52 && year >= 0 && year <= 99) {
      r.manufactureYear = year > 50 ? 1900 + year : 2000 + year;
      r.manufactureWeek = week;
      r.serialFormat = "Carrier WWYY (week-year)";
    }
  }
  return r;
}

// --- Trane: [Y][WW][sequence] (post-2002, decade inferred) ---
function decodeTraneSerial(serial: string): SerialDecodeResult {
  const r: SerialDecodeResult = { notes: [] };
  if (serial.length >= 3 && /^\d{3}/.test(serial)) {
    const yearDigit = parseInt(serial[0], 10);
    const week = parseInt(serial.substring(1, 3), 10);
    if (week >= 1 && week <= 52) {
      // Decade must be inferred — try 2020s first, then 2010s
      const now = new Date().getFullYear();
      let baseYear = 2020 + yearDigit;
      if (baseYear > now + 1) baseYear -= 10;
      r.manufactureYear = baseYear;
      r.manufactureWeek = week;
      r.serialFormat = "Trane Y-WW (single year digit + week)";
      r.notes.push("Trane serial year digit cycles every 10 years — decade inferred from context");
    }
  }
  return r;
}

// --- Goodman/Amana: [YY][MM][sequence] ---
function decodeGoodmanSerial(serial: string): SerialDecodeResult {
  const r: SerialDecodeResult = { notes: [] };
  if (serial.length >= 4 && /^\d{4}/.test(serial)) {
    const year = parseInt(serial.substring(0, 2), 10);
    const month = parseInt(serial.substring(2, 4), 10);
    if (month >= 1 && month <= 12) {
      r.manufactureYear = year > 50 ? 1900 + year : 2000 + year;
      r.manufactureMonth = month;
      r.serialFormat = "Goodman/Amana YYMM (year-month)";
    }
  }
  return r;
}

// --- Rheem: letter-month or numeric MMYY format ---
function decodeRheemSerial(serial: string): SerialDecodeResult {
  const r: SerialDecodeResult = { notes: [] };

  // Format 1: Letter-month code (A=Jan..M=Dec, skipping I) + 2-digit year
  // e.g., F1812345678 → F=June, 18=2018
  const monthLetters = "ABCDEFGHJKLM";
  if (serial.length >= 3) {
    const firstChar = serial[0];
    const monthIdx = monthLetters.indexOf(firstChar);
    if (monthIdx !== -1) {
      const yearStr = serial.substring(1, 3);
      const yy = parseInt(yearStr, 10);
      if (!isNaN(yy)) {
        r.manufactureMonth = monthIdx + 1;
        r.manufactureYear = yy > 50 ? 1900 + yy : 2000 + yy;
        r.serialFormat = "Rheem [month letter][YY] (A=Jan..M=Dec, I skipped)";
        return r;
      }
    }
  }

  // Format 2: [plant letter][MMYY][sequence]
  if (serial.length >= 5 && /^[A-Z]\d{4}/.test(serial)) {
    const d1 = parseInt(serial.substring(1, 3), 10);
    const d2 = parseInt(serial.substring(3, 5), 10);
    if (d1 >= 1 && d1 <= 12 && d2 >= 0 && d2 <= 99) {
      r.manufactureMonth = d1;
      r.manufactureYear = d2 > 50 ? 1900 + d2 : 2000 + d2;
      r.serialFormat = "Rheem [plant][MMYY]";
    } else if (d1 >= 1 && d1 <= 52) {
      r.manufactureWeek = d1;
      r.manufactureYear = d2 > 50 ? 1900 + d2 : 2000 + d2;
      r.serialFormat = "Rheem [plant][WWYY]";
    }
  }

  // Format 3: Pure numeric MMYY at start (Rheem water heaters)
  if (!r.manufactureYear && serial.length >= 4 && /^\d{4}/.test(serial)) {
    const mm = parseInt(serial.substring(0, 2), 10);
    const yy = parseInt(serial.substring(2, 4), 10);
    if (mm >= 1 && mm <= 12) {
      r.manufactureMonth = mm;
      r.manufactureYear = yy > 50 ? 1900 + yy : 2000 + yy;
      r.serialFormat = "Rheem MMYY (water heater format)";
    }
  }

  return r;
}

// --- York: [plant letter][year letter][month letter][sequence] ---
const YORK_YEAR_LETTERS: Record<string, number[]> = {
  A: [1971, 1994, 2020], B: [1972, 1995, 2021], C: [1973, 1996, 2022],
  D: [1974, 2000], E: [1975, 2001], F: [1976, 2002], G: [1977, 2003],
  H: [1978, 2004], J: [1979, 2005], K: [1980, 2006], L: [1981, 2007],
  M: [1982, 2008], N: [1983, 2009], P: [1984, 2010], R: [1985, 2011],
  S: [1986, 2012], T: [1987, 2013], U: [1988, 2014], V: [1989, 2015],
  W: [1990, 2016], X: [1991, 2017], Y: [1992, 2018], Z: [1993, 2019],
};

function decodeYorkSerial(serial: string): SerialDecodeResult {
  const r: SerialDecodeResult = { notes: [] };
  if (serial.length >= 3) {
    const yearLetter = serial[1];
    const monthLetter = serial[2];
    const years = YORK_YEAR_LETTERS[yearLetter];
    if (years) {
      const now = new Date().getFullYear();
      r.manufactureYear = years.reduce((best, y) => Math.abs(y - now) < Math.abs(best - now) ? y : best);
      // Month: A=Jan through L=Dec (skipping I)
      const monthMap = "ABCDEFGHJKL";
      const monthIdx = monthMap.indexOf(monthLetter);
      if (monthIdx >= 0) r.manufactureMonth = monthIdx + 1;
      r.serialFormat = "York [plant][year letter][month letter]";
    }
  }
  return r;
}

// --- Whirlpool/Roper/Maytag/KitchenAid serial formats ---
// Format 1: [plant][Y][WW][sequence]  — e.g. C5032xxxxx (plant C, year 5, week 03)
// Format 2: [alpha][alpha][YYWW][sequence] — e.g. MR2415xxxxx
// Format 3: [2 letters][digits] where pos 2-3 are year, 4-5 are week
function decodeWhirlpoolSerial(serial: string): SerialDecodeResult {
  const r: SerialDecodeResult = { notes: [] };
  const now = new Date().getFullYear();

  // Format 1: [letter][digit][2-digit week][sequence] — most common
  if (serial.length >= 4 && /^[A-Z]\d{3}/.test(serial)) {
    const yearDigit = parseInt(serial[1], 10);
    const week = parseInt(serial.substring(2, 4), 10);
    if (week >= 1 && week <= 52) {
      let baseYear = 2020 + yearDigit;
      if (baseYear > now + 1) baseYear -= 10;
      r.manufactureYear = baseYear;
      r.manufactureWeek = week;
      r.serialFormat = "Whirlpool [plant][Y][WW] (year digit + week)";
      r.notes.push("Whirlpool year digit cycles every 10 years");
      return r;
    }
  }

  // Format 2: [2 letters (plant)][1 year digit][2 week digits][sequence]
  // Most common Whirlpool/Roper format — e.g. MU5213045
  if (serial.length >= 5 && /^[A-Z]{2}\d{3}/.test(serial)) {
    const yearDigit = parseInt(serial[2], 10);
    const week = parseInt(serial.substring(3, 5), 10);
    if (week >= 1 && week <= 52) {
      let baseYear = 2020 + yearDigit;
      if (baseYear > now + 1) baseYear -= 10;
      r.manufactureYear = baseYear;
      r.manufactureWeek = week;
      r.serialFormat = "Whirlpool [plant][plant][Y][WW] (year digit + week)";
      r.notes.push("Whirlpool year digit cycles every 10 years");
      return r;
    }
  }

  // Format 3: [2 letters][YYWW or YYMM][sequence] — newer format
  if (serial.length >= 6 && /^[A-Z]{2}\d{4}/.test(serial)) {
    const d1 = parseInt(serial.substring(2, 4), 10);
    const d2 = parseInt(serial.substring(4, 6), 10);
    if (d1 >= 0 && d1 <= 30 && d2 >= 1 && d2 <= 52) {
      r.manufactureYear = 2000 + d1;
      r.manufactureWeek = d2;
      r.serialFormat = "Whirlpool [plant][plant][YY][WW]";
      return r;
    }
    if (d1 >= 0 && d1 <= 30 && d2 >= 1 && d2 <= 12) {
      r.manufactureYear = 2000 + d1;
      r.manufactureMonth = d2;
      r.serialFormat = "Whirlpool [plant][plant][YY][MM]";
      return r;
    }
  }

  // Format 4: [letter][2-digit year][2-digit week][sequence]
  if (serial.length >= 5 && /^[A-Z]\d{4}/.test(serial)) {
    const yr = parseInt(serial.substring(1, 3), 10);
    const wk = parseInt(serial.substring(3, 5), 10);
    if (yr >= 0 && yr <= 30 && wk >= 1 && wk <= 52) {
      r.manufactureYear = 2000 + yr;
      r.manufactureWeek = wk;
      r.serialFormat = "Whirlpool [plant][YY][WW]";
      return r;
    }
  }

  return r;
}

// --- GE: [month letter][year letter][sequence] ---
const GE_MONTH_LETTERS: Record<string, number> = {
  A: 1, B: 2, D: 3, E: 4, F: 5, G: 6, H: 7, J: 8, K: 9, L: 10, M: 11,
  // Note: some sources map slightly differently
};
const GE_YEAR_LETTERS: Record<string, number> = {
  D: 2000, F: 2001, G: 2002, H: 2003, J: 2004, K: 2005, L: 2006, M: 2007,
  N: 2008, P: 2009, R: 2011, S: 2012, T: 2013, V: 2014, W: 2015, X: 2016,
  Y: 2017, Z: 2018, A: 2019, B: 2020, D2: 2021, F2: 2022, G2: 2023,
};

function decodeGESerial(serial: string): SerialDecodeResult {
  const r: SerialDecodeResult = { notes: [] };
  if (serial.length >= 2 && /^[A-Z]{2}/.test(serial)) {
    const monthLetter = serial[0];
    const yearLetter = serial[1];
    const month = GE_MONTH_LETTERS[monthLetter];
    let year = GE_YEAR_LETTERS[yearLetter];

    // Handle the cycling (D, F, G appear twice)
    if (year && month) {
      const now = new Date().getFullYear();
      if (year < 2010 && now > 2018) {
        // Might be second cycle
        const secondCycle: Record<string, number> = { D: 2021, F: 2022, G: 2023 };
        if (secondCycle[yearLetter]) year = secondCycle[yearLetter];
      }
      r.manufactureYear = year;
      r.manufactureMonth = month;
      r.serialFormat = "GE [month letter][year letter]";
    }
  }
  return r;
}

// --- Bosch: FD[YY][MM][sequence] ---
function decodeBoschSerial(serial: string): SerialDecodeResult {
  const r: SerialDecodeResult = { notes: [] };
  if (serial.startsWith("FD") && serial.length >= 6) {
    const year = parseInt(serial.substring(2, 4), 10);
    const month = parseInt(serial.substring(4, 6), 10);
    if (month >= 1 && month <= 12) {
      r.manufactureYear = year > 50 ? 1900 + year : 2000 + year;
      r.manufactureMonth = month;
      r.serialFormat = "Bosch FD[YY][MM]";
    }
  }
  return r;
}

// --- A.O. Smith: [YY][WW][plant][sequence] ---
function decodeAOSmithSerial(serial: string): SerialDecodeResult {
  const r: SerialDecodeResult = { notes: [] };
  if (serial.length >= 4 && /^\d{4}/.test(serial)) {
    const year = parseInt(serial.substring(0, 2), 10);
    const week = parseInt(serial.substring(2, 4), 10);
    if (week >= 1 && week <= 52) {
      r.manufactureYear = year > 50 ? 1900 + year : 2000 + year;
      r.manufactureWeek = week;
      r.serialFormat = "A.O. Smith [YY][WW]";
    }
  }
  return r;
}

// --- Bradford White: [plant letter][year letter][week 2 digits][sequence] ---
const BW_YEAR_LETTERS: Record<string, number[]> = {
  A: [1964, 1984, 2004], B: [1965, 1985, 2005], C: [1966, 1986, 2006],
  D: [1967, 1987, 2007], E: [1968, 1988, 2008], F: [1969, 1989, 2009],
  G: [1970, 1990, 2010], H: [1971, 1991, 2011], J: [1972, 1992, 2012],
  K: [1973, 1993, 2013], L: [1974, 1994, 2014], M: [1975, 1995, 2015],
  N: [1977, 1997, 2017], P: [1978, 1998, 2018], R: [1979, 1999, 2019],
  S: [1980, 2000, 2020], T: [1981, 2001, 2021], U: [1982, 2002, 2022],
  V: [1983, 2003, 2023],
};

function decodeBradfordWhiteSerial(serial: string): SerialDecodeResult {
  const r: SerialDecodeResult = { notes: [] };
  if (serial.length >= 4 && /^[A-Z]{2}\d{2}/.test(serial)) {
    const yearLetter = serial[1];
    const week = parseInt(serial.substring(2, 4), 10);
    const years = BW_YEAR_LETTERS[yearLetter];
    if (years && week >= 1 && week <= 52) {
      const now = new Date().getFullYear();
      r.manufactureYear = years.reduce((best, y) => Math.abs(y - now) < Math.abs(best - now) ? y : best);
      r.manufactureWeek = week;
      r.serialFormat = "Bradford White [plant][year letter][WW]";
    }
  }
  return r;
}

// --- Lennox: [prefix 2-4 chars][YY][WW][sequence] ---
function decodeLennoxSerial(serial: string): SerialDecodeResult {
  const r: SerialDecodeResult = { notes: [] };
  // Lennox serials vary, but common recent format: chars 3-4 = year, chars 5-6 = week
  // Some start with 2-4 letter prefix (plant code)
  const match = serial.match(/^[A-Z]{2,4}(\d{2})(\d{2})/);
  if (match) {
    const year = parseInt(match[1], 10);
    const weekOrMonth = parseInt(match[2], 10);
    if (year >= 0 && year <= 30) {
      r.manufactureYear = 2000 + year;
      if (weekOrMonth >= 1 && weekOrMonth <= 52) {
        r.manufactureWeek = weekOrMonth;
      }
      r.serialFormat = "Lennox [plant prefix][YY][WW]";
    }
  }
  // Fallback: try pure numeric start like 5816E → plant 58, year 16, week via letter
  if (!r.manufactureYear && /^\d{4}[A-Z]/.test(serial)) {
    const year2 = parseInt(serial.substring(2, 4), 10);
    if (year2 >= 0 && year2 <= 30) {
      r.manufactureYear = 2000 + year2;
      r.serialFormat = "Lennox [plant digits][YY][week letter]";
      r.notes.push("Lennox week encoding uses letter mapping — approximate");
    }
  }
  return r;
}

// --- Samsung: [plant][year digit][month 2-digit][sequence] ---
function decodeSamsungSerial(serial: string): SerialDecodeResult {
  const r: SerialDecodeResult = { notes: [] };
  const now = new Date().getFullYear();

  // Format: [1 letter plant][1 digit year][2 digit month][sequence]
  // e.g., B80612ABCDE → B=plant, 8=2018, 06=June
  if (serial.length >= 4 && /^[A-Z]\d{3}/.test(serial)) {
    const yearDigit = parseInt(serial[1], 10);
    const month = parseInt(serial.substring(2, 4), 10);
    if (month >= 1 && month <= 12) {
      let baseYear = 2020 + yearDigit;
      if (baseYear > now + 1) baseYear -= 10;
      r.manufactureYear = baseYear;
      r.manufactureMonth = month;
      r.serialFormat = "Samsung [plant][Y][MM]";
      r.notes.push("Samsung year digit cycles every 10 years — decade inferred");
      return r;
    }
  }

  // Alternate: [2+ letters][2-digit year][2-digit month][sequence]
  if (serial.length >= 6 && /^[A-Z]{2,}\d{4}/.test(serial)) {
    const numStart = serial.search(/\d/);
    if (numStart >= 1 && numStart <= 4) {
      const yy = parseInt(serial.substring(numStart, numStart + 2), 10);
      const mm = parseInt(serial.substring(numStart + 2, numStart + 4), 10);
      if (yy >= 0 && yy <= 30 && mm >= 1 && mm <= 12) {
        r.manufactureYear = 2000 + yy;
        r.manufactureMonth = mm;
        r.serialFormat = "Samsung [prefix][YY][MM]";
        return r;
      }
    }
  }

  return r;
}

// --- LG: [3 chars model/plant][YY][MM][sequence] ---
function decodeLGSerial(serial: string): SerialDecodeResult {
  const r: SerialDecodeResult = { notes: [] };

  // Most common: positions 4-5 = year, 6-7 = month
  if (serial.length >= 7) {
    const numSequence = serial.replace(/^[A-Z]+/, "");
    if (numSequence.length >= 4) {
      const yy = parseInt(numSequence.substring(0, 2), 10);
      const mm = parseInt(numSequence.substring(2, 4), 10);
      if (yy >= 5 && yy <= 30 && mm >= 1 && mm <= 12) {
        r.manufactureYear = 2000 + yy;
        r.manufactureMonth = mm;
        r.serialFormat = "LG [prefix][YY][MM]";
        return r;
      }
    }
  }

  // Fallback: try YYMM at various positions
  const match = serial.match(/(\d{2})(0[1-9]|1[0-2])/);
  if (match) {
    const yy = parseInt(match[1], 10);
    if (yy >= 5 && yy <= 30) {
      r.manufactureYear = 2000 + yy;
      r.manufactureMonth = parseInt(match[2], 10);
      r.serialFormat = "LG [YY][MM] embedded";
      return r;
    }
  }

  return r;
}

// --- Electrolux/Frigidaire ---
function decodeElectroluxSerial(serial: string): SerialDecodeResult {
  const r: SerialDecodeResult = { notes: [] };

  // Format: [2 letters][YY][WW or MM][sequence]
  if (serial.length >= 6 && /^[A-Z]{2}\d{4}/.test(serial)) {
    const yy = parseInt(serial.substring(2, 4), 10);
    const mm = parseInt(serial.substring(4, 6), 10);
    if (yy >= 0 && yy <= 30 && mm >= 1 && mm <= 12) {
      r.manufactureYear = 2000 + yy;
      r.manufactureMonth = mm;
      r.serialFormat = "Electrolux [plant][YY][MM]";
      return r;
    }
    if (yy >= 0 && yy <= 30 && mm >= 1 && mm <= 52) {
      r.manufactureYear = 2000 + yy;
      r.manufactureWeek = mm;
      r.serialFormat = "Electrolux [plant][YY][WW]";
      return r;
    }
  }

  return r;
}

// --- Rinnai/Navien tankless ---
function decodeTanklessSerial(serial: string): SerialDecodeResult {
  const r: SerialDecodeResult = { notes: [] };

  // Common: YYMM at start
  if (serial.length >= 4 && /^\d{4}/.test(serial)) {
    const yy = parseInt(serial.substring(0, 2), 10);
    const mm = parseInt(serial.substring(2, 4), 10);
    if (yy >= 0 && yy <= 30 && mm >= 1 && mm <= 12) {
      r.manufactureYear = 2000 + yy;
      r.manufactureMonth = mm;
      r.serialFormat = "Tankless YYMM";
      return r;
    }
  }

  // With letter prefix
  if (/^[A-Z]\d{4}/.test(serial)) {
    const yy = parseInt(serial.substring(1, 3), 10);
    const mm = parseInt(serial.substring(3, 5), 10);
    if (yy >= 0 && yy <= 30 && mm >= 1 && mm <= 12) {
      r.manufactureYear = 2000 + yy;
      r.manufactureMonth = mm;
      r.serialFormat = "Tankless [prefix][YY][MM]";
      return r;
    }
  }

  return r;
}

// --- Mitsubishi/Fujitsu mini-split ---
function decodeMiniSplitSerial(serial: string): SerialDecodeResult {
  const r: SerialDecodeResult = { notes: [] };
  const now = new Date().getFullYear();

  // Mitsubishi: single year digit + week, similar to Trane
  if (serial.length >= 3 && /^\d{3}/.test(serial)) {
    const yearDigit = parseInt(serial[0], 10);
    const week = parseInt(serial.substring(1, 3), 10);
    if (week >= 1 && week <= 52) {
      let baseYear = 2020 + yearDigit;
      if (baseYear > now + 1) baseYear -= 10;
      r.manufactureYear = baseYear;
      r.manufactureWeek = week;
      r.serialFormat = "Mini-split [Y][WW]";
      r.notes.push("Year digit cycles every 10 years");
      return r;
    }
  }

  // Try YYMM format
  if (serial.length >= 4 && /^\d{4}/.test(serial)) {
    const yy = parseInt(serial.substring(0, 2), 10);
    const mm = parseInt(serial.substring(2, 4), 10);
    if (yy >= 0 && yy <= 30 && mm >= 1 && mm <= 12) {
      r.manufactureYear = 2000 + yy;
      r.manufactureMonth = mm;
      r.serialFormat = "Mini-split YYMM";
      return r;
    }
  }

  return r;
}

// --- Generic fallback ---
function decodeGenericSerial(serial: string): SerialDecodeResult {
  const r: SerialDecodeResult = { notes: [] };

  // Try Bosch FD prefix
  if (serial.startsWith("FD")) return decodeBoschSerial(serial);

  // Try YYMM (Goodman-style)
  if (/^\d{4}/.test(serial)) {
    const d1 = parseInt(serial.substring(0, 2), 10);
    const d2 = parseInt(serial.substring(2, 4), 10);
    if (d2 >= 1 && d2 <= 12 && d1 >= 0 && d1 <= 30) {
      r.manufactureYear = 2000 + d1;
      r.manufactureMonth = d2;
      r.serialFormat = "Generic YYMM";
      return r;
    }
    if (d1 >= 1 && d1 <= 52 && d2 >= 0 && d2 <= 30) {
      r.manufactureWeek = d1;
      r.manufactureYear = 2000 + d2;
      r.serialFormat = "Generic WWYY";
      return r;
    }
  }

  // Try [letter][digit][2 digits] (Whirlpool-style)
  if (/^[A-Z]\d{3}/.test(serial)) {
    return decodeWhirlpoolSerial(serial);
  }

  // Try [letter][letter] (GE-style)
  if (/^[A-Z]{2}\d{6,}/.test(serial)) {
    return decodeGESerial(serial);
  }

  return r;
}
