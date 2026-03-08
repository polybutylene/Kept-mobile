/**
 * Manual & Warranty Lookup
 *
 * Given a manufacturer and model number, returns URLs for finding
 * product manuals, warranty information, and parts lists.
 */

export interface ManualLookupResult {
  found: boolean;
  manufacturer: string;
  manualUrl: string | null;
  warrantyUrl: string | null;
  supportUrl: string | null;
  partsUrl: string | null;
  source: string;
}

interface ManufacturerUrls {
  names: string[];
  manualUrl?: string;
  warrantyUrl?: string;
  supportUrl?: string;
  partsUrl?: string;
  manualSearchTemplate?: string;
}

const MANUFACTURER_URLS: ManufacturerUrls[] = [
  // HVAC
  {
    names: ["carrier", "bryant", "payne", "day & night", "tempstar", "heil", "comfortmaker"],
    manualUrl: "https://www.carrier.com/residential/en/us/support/product-manuals/",
    warrantyUrl: "https://www.carrier.com/residential/en/us/support/warranty/",
    supportUrl: "https://www.carrier.com/residential/en/us/support/",
    manualSearchTemplate: "https://www.carrier.com/residential/en/us/support/product-manuals/?query={model}",
  },
  {
    names: ["trane", "american standard"],
    manualUrl: "https://www.trane.com/residential/en/resources/product-literature/",
    warrantyUrl: "https://www.trane.com/residential/en/warranty/",
    supportUrl: "https://www.trane.com/residential/en/support/",
  },
  {
    names: ["lennox", "ducane", "aire-flo", "armstrong air", "concord"],
    manualUrl: "https://www.lennox.com/support/product-literature",
    warrantyUrl: "https://www.lennox.com/support/warranty-information",
    supportUrl: "https://www.lennox.com/support",
  },
  {
    names: ["goodman", "amana"],
    manualUrl: "https://www.goodmanmfg.com/resources/library",
    warrantyUrl: "https://www.goodmanmfg.com/support/warranty",
    supportUrl: "https://www.goodmanmfg.com/support",
  },
  {
    names: ["rheem", "ruud"],
    manualUrl: "https://www.rheem.com/resources/literature-library/",
    warrantyUrl: "https://www.rheem.com/warranty/",
    supportUrl: "https://www.rheem.com/support/",
  },
  {
    names: ["york", "coleman", "luxaire"],
    manualUrl: "https://www.york.com/residential-equipment/resources/manuals",
    warrantyUrl: "https://www.york.com/residential-equipment/resources/warranty",
    supportUrl: "https://www.york.com/residential-equipment/support",
  },
  {
    names: ["mitsubishi", "mitsubishi electric", "mr. slim"],
    manualUrl: "https://www.mitsubishicomfort.com/resources/manuals",
    supportUrl: "https://www.mitsubishicomfort.com/support",
  },
  {
    names: ["fujitsu", "fujitsu general", "halcyon"],
    manualUrl: "https://www.fujitsugeneral.com/us/support/downloads/index.html",
    supportUrl: "https://www.fujitsugeneral.com/us/support/index.html",
  },
  {
    names: ["daikin"],
    manualUrl: "https://www.daikincomfort.com/resources/product-literature",
    supportUrl: "https://www.daikincomfort.com/support",
  },

  // Water Heaters
  {
    names: ["a.o. smith", "ao smith", "state", "reliance", "lochinvar"],
    manualUrl: "https://www.aosmith.com/support/product-support/",
    warrantyUrl: "https://www.aosmith.com/support/warranty/",
    supportUrl: "https://www.aosmith.com/support/",
    partsUrl: "https://www.aosmith.com/support/parts/",
  },
  {
    names: ["bradford white"],
    manualUrl: "https://www.bradfordwhite.com/support/product-literature",
    warrantyUrl: "https://www.bradfordwhite.com/support/warranty",
    supportUrl: "https://www.bradfordwhite.com/support",
  },
  {
    names: ["rinnai"],
    manualUrl: "https://www.rinnai.us/support/manuals-guides",
    warrantyUrl: "https://www.rinnai.us/support/warranty",
    supportUrl: "https://www.rinnai.us/support",
    partsUrl: "https://www.rinnai.us/support/parts",
  },
  {
    names: ["navien"],
    manualUrl: "https://www.navieninc.com/support/document-library",
    supportUrl: "https://www.navieninc.com/support",
    warrantyUrl: "https://www.navieninc.com/support/warranty",
  },
  {
    names: ["noritz"],
    manualUrl: "https://www.noritz.com/support/",
    supportUrl: "https://www.noritz.com/support/",
  },

  // Appliances
  {
    names: ["whirlpool", "maytag", "kitchenaid", "amana", "jenn-air", "roper"],
    manualUrl: "https://www.whirlpool.com/owners-manuals.html",
    warrantyUrl: "https://www.whirlpool.com/support/warranty.html",
    supportUrl: "https://www.whirlpool.com/support.html",
    partsUrl: "https://www.whirlpool.com/support/find-parts.html",
    manualSearchTemplate: "https://www.whirlpool.com/owners-manuals.html?query={model}",
  },
  {
    names: ["ge", "general electric", "ge profile", "café", "cafe", "monogram", "hotpoint", "haier"],
    manualUrl: "https://www.geappliances.com/support/manuals-and-downloads/",
    warrantyUrl: "https://www.geappliances.com/ge/service-and-support/warranty.htm",
    supportUrl: "https://www.geappliances.com/support/",
    partsUrl: "https://www.geappliances.com/ge/service-and-support/parts-and-accessories.htm",
  },
  {
    names: ["samsung"],
    manualUrl: "https://www.samsung.com/us/support/downloads/",
    warrantyUrl: "https://www.samsung.com/us/support/warranty/",
    supportUrl: "https://www.samsung.com/us/support/",
  },
  {
    names: ["lg", "lg electronics"],
    manualUrl: "https://www.lg.com/us/support/manuals-documents",
    warrantyUrl: "https://www.lg.com/us/support/warranty",
    supportUrl: "https://www.lg.com/us/support",
  },
  {
    names: ["bosch", "thermador"],
    manualUrl: "https://www.bosch-home.com/us/support/instruction-manuals",
    supportUrl: "https://www.bosch-home.com/us/support",
  },
  {
    names: ["frigidaire", "electrolux"],
    manualUrl: "https://www.frigidaire.com/support/manuals-and-downloads/",
    supportUrl: "https://www.frigidaire.com/support/",
  },
  {
    names: ["miele"],
    manualUrl: "https://www.mieleusa.com/e/operating-instructions-1486.htm",
    supportUrl: "https://www.mieleusa.com/e/customer-support-2099.htm",
  },
  {
    names: ["sub-zero", "sub zero", "wolf"],
    manualUrl: "https://www.subzero-wolf.com/assistance/product-guides",
    supportUrl: "https://www.subzero-wolf.com/assistance",
  },

  // Electrical
  {
    names: ["square d", "schneider electric"],
    manualUrl: "https://www.se.com/us/en/work/support/",
    supportUrl: "https://www.se.com/us/en/work/support/",
  },
  {
    names: ["eaton", "cutler-hammer"],
    manualUrl: "https://www.eaton.com/us/en-us/support.html",
    supportUrl: "https://www.eaton.com/us/en-us/support.html",
  },
  {
    names: ["siemens"],
    manualUrl: "https://www.siemens.com/us/en/products/energy/low-voltage/support.html",
    supportUrl: "https://www.siemens.com/us/en/products/energy/low-voltage/support.html",
  },
];

export function lookupManual(
  manufacturer: string,
  modelNumber?: string,
): ManualLookupResult {
  const mfrLower = (manufacturer || "").toLowerCase().trim();

  if (!mfrLower) {
    return {
      found: false,
      manufacturer: manufacturer || "",
      manualUrl: null,
      warrantyUrl: null,
      supportUrl: null,
      partsUrl: null,
      source: "no_manufacturer",
    };
  }

  for (const entry of MANUFACTURER_URLS) {
    const match = entry.names.some((name) => mfrLower.includes(name));
    if (!match) continue;

    let manualUrl = entry.manualUrl ?? null;

    // If there's a search template and a model number, build a direct search link
    if (entry.manualSearchTemplate && modelNumber) {
      manualUrl = entry.manualSearchTemplate.replace("{model}", encodeURIComponent(modelNumber));
    }

    return {
      found: true,
      manufacturer,
      manualUrl,
      warrantyUrl: entry.warrantyUrl ?? null,
      supportUrl: entry.supportUrl ?? null,
      partsUrl: entry.partsUrl ?? null,
      source: entry.names[0],
    };
  }

  return {
    found: false,
    manufacturer,
    manualUrl: null,
    warrantyUrl: null,
    supportUrl: null,
    partsUrl: null,
    source: "not_found",
  };
}
