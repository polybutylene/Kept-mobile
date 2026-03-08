import { ServiceCallPrep } from "./types";

export const hvacPreps: ServiceCallPrep[] = [
  {
    issueSlug: "general_hvac",
    systemCategory: "hvac",
    expectations: {
      typicalDuration: "45–90 minutes",
      costRange: { low: 89, high: 250 },
      whatTechWillDo: [
        "Check thermostat operation and settings",
        "Inspect the air filter condition",
        "Measure supply and return air temperatures",
        "Check refrigerant levels and pressures",
        "Inspect electrical connections and capacitors",
        "Check the condensate drain",
        "Inspect the outdoor condenser unit",
      ],
      dontDecideOnSpot: "If they recommend a new system, take the diagnosis and get 2–3 quotes. A new HVAC system is a $5,000–15,000 decision.",
    },
    questionsToAsk: [
      {
        question: "What's the temperature split between supply and return air?",
        context: "Should be 15–20°F difference. Less than that means the system isn't cooling effectively.",
      },
      {
        question: "How do the capacitors look? Have they started to swell?",
        context: "Capacitors are cheap parts (~$15) but failing ones cause compressor and fan motor failures ($$$). Proactive replacement is smart.",
      },
      {
        question: "Is the refrigerant charge where it should be?",
        context: "Low refrigerant means a leak somewhere. Topping off without fixing the leak is a temporary fix that wastes money.",
      },
      {
        question: "If you're adding refrigerant, where's the leak and can it be fixed?",
        context: "If they say 'just needs a recharge,' ask where the refrigerant went. Systems don't consume refrigerant — if it's low, it's leaking.",
      },
      {
        question: "How old is the outdoor unit's compressor? Any signs of wear?",
        context: "The compressor is the most expensive component. If it's showing wear on an older system, replacement planning should start.",
      },
    ],
    redFlags: [
      {
        flag: "Recommends a full system replacement after only a quick visual inspection",
        explanation: "A proper HVAC diagnostic includes measurements and testing. If they didn't measure pressures, temperatures, or amperage, the diagnosis is incomplete.",
      },
      {
        flag: "Suggests adding refrigerant without identifying or fixing the leak",
        explanation: "Refrigerant 'top-offs' without a leak repair are throwing money away. The system will just leak down again.",
      },
      {
        flag: "Quotes a major repair without explaining what's wrong in terms you understand",
        explanation: "A good tech explains the problem in plain language. If they can't explain it, they may not fully understand it themselves.",
      },
      {
        flag: "Pushes proprietary maintenance contracts before completing the diagnostic",
        explanation: "Upselling before diagnosing is a sign of a sales-driven operation, not a service-driven one.",
      },
      {
        flag: "Uses scare tactics about safety or legality",
        explanation: "While some issues are genuinely urgent, a tech who leads with fear is often trying to close a sale. Get a second opinion.",
      },
    ],
  },
  {
    issueSlug: "ac_not_cooling",
    systemCategory: "hvac",
    expectations: {
      typicalDuration: "30–60 minutes",
      costRange: { low: 89, high: 350 },
      whatTechWillDo: [
        "Check thermostat settings and operation",
        "Inspect air filter",
        "Measure refrigerant pressures",
        "Check the capacitor and contactor",
        "Inspect the compressor for damage",
        "Check the condensate drain for clogs",
        "Measure amperage on the compressor",
      ],
      dontDecideOnSpot: "A compressor replacement on an older system often doesn't make financial sense. If quoted for a compressor, get a full system replacement quote too.",
    },
    questionsToAsk: [
      {
        question: "Is the compressor running? What are the amp readings?",
        context: "High amps on the compressor can mean it's working harder than it should — a sign of impending failure.",
      },
      {
        question: "If it needs refrigerant, what type does my system use?",
        context: "R-22 (old systems) is extremely expensive because it's been phased out. If your system runs R-22 and has a leak, replacement often makes more sense than repair.",
      },
    ],
    redFlags: [
      {
        flag: "Diagnoses a 'bad compressor' without checking the capacitor and contactor first",
        explanation: "A failed capacitor ($15 part, $150 repair) can mimic compressor failure. It's the first thing a competent tech checks.",
      },
      {
        flag: "Charges extra for 'leak detection' after already charging a diagnostic fee",
        explanation: "Basic leak detection should be part of the diagnostic. Specialized electronic leak detection may be extra, but dye tests should be included.",
      },
    ],
  },
];
