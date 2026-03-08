export interface AgeRange {
  minAge: number;
  maxAge: number;
  frequencyMultiplier: number;
  additionalTasks: string[];
  note: string;
}

export interface AgeMultiplier {
  systemType: string;
  ageRanges: AgeRange[];
}

export const AGE_MULTIPLIERS: AgeMultiplier[] = [
  {
    systemType: "central_ac",
    ageRanges: [
      { minAge: 0, maxAge: 5, frequencyMultiplier: 1.0, additionalTasks: [], note: "New system — standard maintenance schedule" },
      { minAge: 6, maxAge: 10, frequencyMultiplier: 1.0, additionalTasks: ["hvac.capacitor_check"], note: "Entering mid-life. Add annual capacitor check — #1 failure part on AC systems aged 6-10" },
      { minAge: 11, maxAge: 14, frequencyMultiplier: 0.75, additionalTasks: ["hvac.capacitor_check", "hvac.contactor_inspect", "hvac.compressor_amp_draw"], note: "Approaching end of expected life in FL. Increase service frequency. Monitor compressor health closely. Begin budgeting for replacement." },
      { minAge: 15, maxAge: 99, frequencyMultiplier: 0.5, additionalTasks: ["hvac.capacitor_check", "hvac.contactor_inspect", "hvac.compressor_amp_draw", "hvac.full_system_evaluation"], note: "Beyond expected life for Florida climate. Service every 6 months. Any repair over 50% of replacement cost → recommend replacing." },
    ],
  },
  {
    systemType: "heat_pump",
    ageRanges: [
      { minAge: 0, maxAge: 4, frequencyMultiplier: 1.0, additionalTasks: [], note: "New system — standard maintenance" },
      { minAge: 5, maxAge: 9, frequencyMultiplier: 1.0, additionalTasks: ["hvac.capacitor_check", "hvac.reversing_valve_check"], note: "Heat pumps run year-round in FL (heating + cooling). Reversing valve stress begins earlier than pure AC." },
      { minAge: 10, maxAge: 13, frequencyMultiplier: 0.75, additionalTasks: ["hvac.capacitor_check", "hvac.reversing_valve_check", "hvac.compressor_amp_draw"], note: "Approaching end of life for FL heat pumps (dual-mode operation wears faster). Semi-annual service recommended." },
      { minAge: 14, maxAge: 99, frequencyMultiplier: 0.5, additionalTasks: ["hvac.capacitor_check", "hvac.reversing_valve_check", "hvac.compressor_amp_draw", "hvac.full_system_evaluation"], note: "Past expected life. Strongly recommend proactive replacement planning." },
    ],
  },
  {
    systemType: "water_heater_tank_gas",
    ageRanges: [
      { minAge: 0, maxAge: 3, frequencyMultiplier: 1.0, additionalTasks: [], note: "New — standard annual flush and inspection" },
      { minAge: 4, maxAge: 7, frequencyMultiplier: 1.0, additionalTasks: ["plumbing.wh_anode_rod_inspect"], note: "Anode rod inspection critical. First check at year 3-4, then every 2-3 years. Hard water in FL accelerates depletion." },
      { minAge: 8, maxAge: 10, frequencyMultiplier: 0.75, additionalTasks: ["plumbing.wh_anode_rod_inspect", "plumbing.wh_leak_inspect_monthly"], note: "Entering end-of-life window for FL (hard water). Flush every 6-8 months. Begin visual leak inspections monthly." },
      { minAge: 11, maxAge: 99, frequencyMultiplier: 0.5, additionalTasks: ["plumbing.wh_anode_rod_inspect", "plumbing.wh_leak_inspect_monthly", "plumbing.wh_replacement_planning"], note: "Past expected life in FL. At risk of catastrophic tank failure. Strongly recommend proactive replacement." },
    ],
  },
  {
    systemType: "water_heater_tank_electric",
    ageRanges: [
      { minAge: 0, maxAge: 3, frequencyMultiplier: 1.0, additionalTasks: [], note: "Standard schedule" },
      { minAge: 4, maxAge: 7, frequencyMultiplier: 1.0, additionalTasks: ["plumbing.wh_anode_rod_inspect"], note: "Add anode rod inspection — electric heaters corrode at same rate as gas in FL hard water" },
      { minAge: 8, maxAge: 10, frequencyMultiplier: 0.75, additionalTasks: ["plumbing.wh_anode_rod_inspect", "plumbing.wh_element_check", "plumbing.wh_leak_inspect_monthly"], note: "Approaching end of life. Monitor elements and tank integrity closely." },
      { minAge: 11, maxAge: 99, frequencyMultiplier: 0.5, additionalTasks: ["plumbing.wh_anode_rod_inspect", "plumbing.wh_element_check", "plumbing.wh_leak_inspect_monthly", "plumbing.wh_replacement_planning"], note: "Past expected life. Recommend replacement before catastrophic tank failure." },
    ],
  },
  {
    systemType: "roof_asphalt_shingle",
    ageRanges: [
      { minAge: 0, maxAge: 10, frequencyMultiplier: 1.0, additionalTasks: [], note: "New roof — standard biannual visual inspection" },
      { minAge: 11, maxAge: 15, frequencyMultiplier: 1.0, additionalTasks: ["roof.shingle_granule_check"], note: "Check for granule loss in gutters — early aging signal in FL heat and UV" },
      { minAge: 16, maxAge: 20, frequencyMultiplier: 0.75, additionalTasks: ["roof.shingle_granule_check", "roof.detailed_inspect"], note: "Asphalt shingles degrade faster in FL UV. Inspect after every major storm. Budget for replacement." },
      { minAge: 21, maxAge: 99, frequencyMultiplier: 0.5, additionalTasks: ["roof.shingle_granule_check", "roof.detailed_inspect", "roof.replacement_planning"], note: "Past expected life for FL. Any storm damage = replacement trigger. Get annual professional inspection." },
    ],
  },
  {
    systemType: "electrical_panel",
    ageRanges: [
      { minAge: 0, maxAge: 20, frequencyMultiplier: 1.0, additionalTasks: [], note: "Standard annual visual inspection + GFCI/AFCI testing" },
      { minAge: 21, maxAge: 30, frequencyMultiplier: 1.0, additionalTasks: ["electrical.panel_thermal_scan"], note: "Consider thermal scanning for hot spots. Check for corroded breakers in humid FL climate." },
      { minAge: 31, maxAge: 99, frequencyMultiplier: 0.75, additionalTasks: ["electrical.panel_thermal_scan", "electrical.panel_professional_eval"], note: "Old panel. If 60A or fuse box, recommend upgrade. Professional evaluation every 2-3 years." },
    ],
  },
  {
    systemType: "dishwasher",
    ageRanges: [
      { minAge: 0, maxAge: 5, frequencyMultiplier: 1.0, additionalTasks: [], note: "Standard monthly cleaning cycle" },
      { minAge: 6, maxAge: 9, frequencyMultiplier: 1.0, additionalTasks: ["appliance.dishwasher_door_seal_inspect"], note: "Add door seal inspection — seals degrade and cause leaks, especially in humid FL" },
      { minAge: 10, maxAge: 99, frequencyMultiplier: 0.75, additionalTasks: ["appliance.dishwasher_door_seal_inspect", "appliance.dishwasher_spray_arm_check", "appliance.dishwasher_replacement_eval"], note: "At or past expected life. Any repair over $200 — evaluate replacement." },
    ],
  },
  {
    systemType: "washing_machine",
    ageRanges: [
      { minAge: 0, maxAge: 4, frequencyMultiplier: 1.0, additionalTasks: [], note: "Standard maintenance" },
      { minAge: 5, maxAge: 8, frequencyMultiplier: 1.0, additionalTasks: ["appliance.washer_hose_inspect"], note: "Supply hoses become critical failure risk after 5 years. Inspect every 6 months, replace proactively at year 5-7. Burst hoses cause $5K+ damage." },
      { minAge: 9, maxAge: 99, frequencyMultiplier: 0.75, additionalTasks: ["appliance.washer_hose_inspect", "appliance.washer_bearing_listen", "appliance.washer_replacement_eval"], note: "Past expected reliable life. Hose burst risk increases significantly. Proactively replace hoses if not done." },
    ],
  },
  {
    systemType: "refrigerator",
    ageRanges: [
      { minAge: 0, maxAge: 7, frequencyMultiplier: 1.0, additionalTasks: [], note: "Standard — coil cleaning every 6 months, filter every 6 months" },
      { minAge: 8, maxAge: 12, frequencyMultiplier: 0.85, additionalTasks: ["appliance.fridge_compressor_listen"], note: "Listen for compressor strain. Increasing energy usage signals decline. Clean coils every 4 months." },
      { minAge: 13, maxAge: 99, frequencyMultiplier: 0.75, additionalTasks: ["appliance.fridge_compressor_listen", "appliance.fridge_temp_monitor", "appliance.fridge_replacement_eval"], note: "Past median life. Any compressor repair = replace. Monitor internal temp for drift." },
    ],
  },
  {
    systemType: "dryer",
    ageRanges: [
      { minAge: 0, maxAge: 7, frequencyMultiplier: 1.0, additionalTasks: [], note: "Standard — vent cleaning annual, lint trap quarterly" },
      { minAge: 8, maxAge: 12, frequencyMultiplier: 1.0, additionalTasks: ["appliance.dryer_bearing_listen"], note: "Listen for bearing noise. Check drum seals. Vent cleaning becomes more critical as lint buildup increases with age." },
      { minAge: 13, maxAge: 99, frequencyMultiplier: 0.75, additionalTasks: ["appliance.dryer_bearing_listen", "appliance.dryer_heating_element_check", "appliance.dryer_replacement_eval"], note: "Past expected life. Heating element and motor are primary failure modes. Fire risk increases with age." },
    ],
  },
  {
    systemType: "garage_door",
    ageRanges: [
      { minAge: 0, maxAge: 10, frequencyMultiplier: 1.0, additionalTasks: [], note: "Standard — lubricate every 6 months, safety test monthly" },
      { minAge: 11, maxAge: 18, frequencyMultiplier: 1.0, additionalTasks: ["exterior.garage_door_spring_fatigue_check"], note: "Torsion springs typically last 10,000-15,000 cycles (~7-12 years). At this age, inspect for fatigue signs." },
      { minAge: 19, maxAge: 99, frequencyMultiplier: 0.75, additionalTasks: ["exterior.garage_door_spring_fatigue_check", "exterior.garage_door_panel_inspect"], note: "Springs likely at or past cycle life. Budget for spring replacement. Inspect panels for warping and seal degradation." },
    ],
  },
  {
    systemType: "furnace_gas",
    ageRanges: [
      { minAge: 0, maxAge: 10, frequencyMultiplier: 1.0, additionalTasks: [], note: "Standard annual tune-up and inspection" },
      { minAge: 11, maxAge: 17, frequencyMultiplier: 1.0, additionalTasks: ["hvac.heat_exchanger_detailed_inspect"], note: "Heat exchanger cracks become a concern. CO risk increases. Annual professional inspection critical." },
      { minAge: 18, maxAge: 99, frequencyMultiplier: 0.75, additionalTasks: ["hvac.heat_exchanger_detailed_inspect", "hvac.furnace_replacement_planning"], note: "Past expected reliable life. Heat exchanger failure = immediate replacement (CO hazard). Budget for replacement." },
    ],
  },
];

export function getAgeMultiplier(
  systemType: string,
  age: number,
): { multiplier: number; additionalTasks: string[]; note: string } {
  const config = AGE_MULTIPLIERS.find((m) => m.systemType === systemType);
  if (!config) return { multiplier: 1.0, additionalTasks: [], note: "No age data for this system type" };

  const range = config.ageRanges.find(
    (r) => age >= r.minAge && age <= r.maxAge,
  );
  if (!range) return { multiplier: 1.0, additionalTasks: [], note: "Age out of defined range" };

  return {
    multiplier: range.frequencyMultiplier,
    additionalTasks: range.additionalTasks,
    note: range.note,
  };
}
