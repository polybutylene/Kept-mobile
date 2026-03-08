import { internalMutation } from "../_generated/server";
import { Id } from "../_generated/dataModel";

/**
 * Seed diagnostic trees for 5 common troubleshooting scenarios.
 * Each tree has a set of nodes that guide the user through diagnosis.
 *
 * Trees:
 * 1. No Hot Water
 * 2. AC Not Cooling
 * 3. Circuit Breaker Keeps Tripping
 * 4. Toilet Running Constantly
 * 5. Furnace Not Heating
 */

interface TreeDef {
  slug: string;
  systemCategory: "plumbing" | "hvac" | "electrical" | "appliances" | "structural" | "exterior";
  title: string;
  description: string;
  entrySymptom: string;
}

interface NodeDef {
  nodeKey: string;
  nodeType: "question" | "observation" | "action" | "result" | "referral";
  title: string;
  contentMarkdown?: string;
  options?: { label: string; nextNodeKey: string; explanation?: string }[];
  diagnosisCode?: string;
  severity?: "minor" | "moderate" | "serious" | "critical";
  recommendedAction?: string;
  estimatedCost?: { diyLow: number; diyHigh: number; proLow: number; proHigh: number };
  shouldCallPro?: boolean;
  proSpecialty?: string;
  urgency?: string;
}

const trees: { tree: TreeDef; nodes: NodeDef[] }[] = [
  // ============================================================
  // 1. NO HOT WATER
  // ============================================================
  {
    tree: {
      slug: "no-hot-water",
      systemCategory: "plumbing",
      title: "No Hot Water Troubleshooter",
      description: "Diagnose why you have no hot water. Covers electric and gas water heaters, common causes from pilot light issues to failed elements.",
      entrySymptom: "No hot water or water not getting hot enough",
    },
    nodes: [
      {
        nodeKey: "start",
        nodeType: "question",
        title: "What type of water heater do you have?",
        contentMarkdown: "Look at your water heater. Gas units have a gas line (copper or black pipe) running to them and a vent pipe on top. Electric units have a thick electrical cable and no vent.",
        options: [
          { label: "Gas (tank)", nextNodeKey: "gas_pilot" },
          { label: "Electric (tank)", nextNodeKey: "electric_breaker" },
          { label: "Tankless", nextNodeKey: "tankless_error" },
          { label: "I'm not sure", nextNodeKey: "identify_heater" },
        ],
      },
      {
        nodeKey: "identify_heater",
        nodeType: "observation",
        title: "How to identify your water heater type",
        contentMarkdown: "Look for these clues:\n\n- **Gas line** (copper or black iron pipe) going to the bottom of the tank → Gas\n- **Thick electrical cable** (no gas line, no vent pipe on top) → Electric\n- **Small wall-mounted unit** with no tank → Tankless\n\nIf you see a vent pipe on top going to the roof or chimney, it's likely gas.",
        options: [
          { label: "It's gas", nextNodeKey: "gas_pilot" },
          { label: "It's electric", nextNodeKey: "electric_breaker" },
          { label: "It's tankless", nextNodeKey: "tankless_error" },
        ],
      },
      // Gas path
      {
        nodeKey: "gas_pilot",
        nodeType: "question",
        title: "Is the pilot light on?",
        contentMarkdown: "Look through the small viewing window at the bottom of the tank. You should see a small blue flame. On newer models, check the status light — a steady green light usually means the pilot is lit.",
        options: [
          { label: "Pilot is out / no flame", nextNodeKey: "gas_relight" },
          { label: "Pilot is on / green light", nextNodeKey: "gas_thermostat" },
          { label: "I see a flashing or red light", nextNodeKey: "gas_error_code" },
        ],
      },
      {
        nodeKey: "gas_relight",
        nodeType: "action",
        title: "Try relighting the pilot",
        contentMarkdown: "⚠️ **Safety first:** If you smell a strong gas odor (rotten eggs), do NOT attempt to relight. Leave the house immediately and call your gas company.\n\n**To relight:**\n1. Turn the gas valve knob to OFF and wait 5 minutes for any gas to dissipate\n2. Turn the knob to PILOT\n3. Press and hold the pilot button while clicking the igniter (or holding a long lighter to the pilot opening)\n4. Continue holding the pilot button for 60 seconds after the flame lights\n5. Release the button — the flame should stay lit\n6. Turn the knob to ON\n\nWait 30-60 minutes for the tank to heat up.",
        options: [
          { label: "Pilot relit successfully!", nextNodeKey: "result_pilot_relit" },
          { label: "Pilot won't stay lit", nextNodeKey: "result_thermocouple" },
          { label: "I smell gas", nextNodeKey: "result_gas_leak" },
        ],
      },
      {
        nodeKey: "gas_thermostat",
        nodeType: "question",
        title: "Check the temperature setting",
        contentMarkdown: "The thermostat dial on the front of the water heater should be set between 120°F and 140°F. Most manufacturers recommend 120°F.\n\nIs the dial set to a reasonable temperature?",
        options: [
          { label: "Yes, it's set correctly", nextNodeKey: "gas_age_check" },
          { label: "It was turned down or off", nextNodeKey: "result_thermostat_adjusted" },
        ],
      },
      {
        nodeKey: "gas_age_check",
        nodeType: "question",
        title: "How old is your water heater?",
        contentMarkdown: "Check the serial number sticker on the side. Many manufacturers encode the date in the first 4 characters (e.g., '0821' = August 2021).",
        options: [
          { label: "Less than 8 years", nextNodeKey: "result_gas_pro_diagnose" },
          { label: "8-12 years old", nextNodeKey: "result_gas_aging" },
          { label: "Over 12 years", nextNodeKey: "result_gas_replacement" },
        ],
      },
      {
        nodeKey: "gas_error_code",
        nodeType: "referral",
        title: "Error code detected",
        contentMarkdown: "A flashing or red status light indicates a fault code. The pattern of flashes corresponds to a specific error. Check the sticker on the water heater for the code chart.\n\nCommon codes include:\n- **1 flash**: Normal operation\n- **2 flashes**: Thermopile voltage low\n- **4 flashes**: Temperature exceeded limit\n- **7 flashes**: Gas valve failure\n\nThis typically requires professional diagnosis.",
        shouldCallPro: true,
        proSpecialty: "Plumber or water heater specialist",
        urgency: "Same day if no hot water",
        severity: "moderate",
        estimatedCost: { diyLow: 0, diyHigh: 0, proLow: 150, proHigh: 400 },
      },
      // Electric path
      {
        nodeKey: "electric_breaker",
        nodeType: "question",
        title: "Check the circuit breaker",
        contentMarkdown: "Go to your electrical panel and find the breaker labeled 'Water Heater' (it should be a double-pole breaker — takes up two slots). Is it tripped?",
        options: [
          { label: "Breaker is tripped", nextNodeKey: "electric_reset_breaker" },
          { label: "Breaker is ON", nextNodeKey: "electric_thermostat_check" },
          { label: "I can't find a water heater breaker", nextNodeKey: "result_electric_pro" },
        ],
      },
      {
        nodeKey: "electric_reset_breaker",
        nodeType: "action",
        title: "Reset the breaker",
        contentMarkdown: "Push the breaker fully to OFF, then back to ON. Wait 30-60 minutes for the water to heat.\n\n⚠️ If the breaker trips again within a few hours, **do not keep resetting it**. A repeatedly tripping breaker indicates a short circuit or failed heating element — this needs professional repair.",
        options: [
          { label: "Breaker stayed on, hot water returned", nextNodeKey: "result_breaker_reset" },
          { label: "Breaker tripped again", nextNodeKey: "result_electric_element" },
        ],
      },
      {
        nodeKey: "electric_thermostat_check",
        nodeType: "question",
        title: "Check the high-limit reset button",
        contentMarkdown: "⚠️ **Turn off the breaker first!**\n\nRemove the upper access panel on the water heater (usually held by 2 screws). Behind the insulation, find the upper thermostat. There's a red reset button — press it.\n\nRestore power and wait 30-60 minutes.",
        options: [
          { label: "Reset button clicked, water heating up", nextNodeKey: "result_high_limit_reset" },
          { label: "Button didn't click / still no heat", nextNodeKey: "result_electric_element" },
        ],
      },
      // Tankless path
      {
        nodeKey: "tankless_error",
        nodeType: "question",
        title: "Is there an error code displayed?",
        contentMarkdown: "Check the digital display on your tankless unit. Most tankless water heaters show error codes when something goes wrong.",
        options: [
          { label: "Yes, there's an error code", nextNodeKey: "result_tankless_error" },
          { label: "No error code, unit seems dead", nextNodeKey: "result_tankless_power" },
          { label: "No error, but water is lukewarm", nextNodeKey: "result_tankless_demand" },
        ],
      },
      // Results
      {
        nodeKey: "result_pilot_relit",
        nodeType: "result",
        title: "Pilot light was out — relighting fixed it",
        diagnosisCode: "WH-PILOT-OUT",
        severity: "minor",
        recommendedAction: "Your pilot light went out. This can happen from drafts, a brief gas supply interruption, or dirty pilot assembly. If it goes out again within a week, the thermocouple may be failing and should be checked by a professional.",
        estimatedCost: { diyLow: 0, diyHigh: 0, proLow: 75, proHigh: 150 },
      },
      {
        nodeKey: "result_thermocouple",
        nodeType: "result",
        title: "Likely failed thermocouple",
        diagnosisCode: "WH-THERMOCOUPLE",
        severity: "moderate",
        recommendedAction: "The thermocouple (or thermopile) is a safety sensor that detects whether the pilot is lit. When it fails, the gas valve shuts off the pilot. This is a common part (~$10-20) that a handy homeowner can replace, or a plumber can handle in about 30 minutes.",
        estimatedCost: { diyLow: 10, diyHigh: 25, proLow: 100, proHigh: 250 },
        shouldCallPro: false,
      },
      {
        nodeKey: "result_gas_leak",
        nodeType: "result",
        title: "⚠️ Possible gas leak — leave immediately",
        diagnosisCode: "WH-GAS-LEAK",
        severity: "critical",
        recommendedAction: "DO NOT operate any switches, lights, or appliances. Leave the house immediately and call your gas company's emergency line from outside. Do not re-enter until cleared by a professional.",
        shouldCallPro: true,
        proSpecialty: "Gas company emergency line",
        urgency: "Immediate — call now",
      },
      {
        nodeKey: "result_thermostat_adjusted",
        nodeType: "result",
        title: "Thermostat was set too low",
        diagnosisCode: "WH-THERMOSTAT-LOW",
        severity: "minor",
        recommendedAction: "Turn the thermostat to 120°F (the 'warm' or 'B' setting on many models). Wait 30-60 minutes for the tank to heat. If someone turned it down, check if there's a reason (e.g., child safety, vacation mode). 120°F is the recommended setting — hot enough for comfort while preventing scalding.",
        estimatedCost: { diyLow: 0, diyHigh: 0, proLow: 0, proHigh: 0 },
      },
      {
        nodeKey: "result_gas_pro_diagnose",
        nodeType: "referral",
        title: "Needs professional diagnosis",
        diagnosisCode: "WH-GAS-UNKNOWN",
        severity: "moderate",
        recommendedAction: "With a relatively new gas water heater that has a lit pilot and correct thermostat setting but isn't producing hot water, the issue may be a failed gas valve, dip tube, or control board. A plumber can diagnose this with testing.",
        shouldCallPro: true,
        proSpecialty: "Plumber",
        urgency: "Within 1-2 days",
        estimatedCost: { diyLow: 0, diyHigh: 0, proLow: 150, proHigh: 500 },
      },
      {
        nodeKey: "result_gas_aging",
        nodeType: "result",
        title: "Water heater is aging — may need service or replacement soon",
        diagnosisCode: "WH-AGING",
        severity: "moderate",
        recommendedAction: "At 8-12 years old, your gas water heater is in the second half of its lifespan. Have a plumber inspect the anode rod, check for sediment buildup, and test the gas valve. If the repair cost exceeds $500, consider replacing the unit. Start budgeting $1,200-$2,500 for a replacement in the next 2-4 years.",
        shouldCallPro: true,
        proSpecialty: "Plumber",
        urgency: "This week",
        estimatedCost: { diyLow: 0, diyHigh: 0, proLow: 150, proHigh: 600 },
      },
      {
        nodeKey: "result_gas_replacement",
        nodeType: "result",
        title: "Water heater likely needs replacement",
        diagnosisCode: "WH-EOL",
        severity: "serious",
        recommendedAction: "At over 12 years old, your gas water heater has exceeded the typical lifespan. While repair may be possible, the cost-benefit often favors replacement. Get quotes from 2-3 plumbers. Consider upgrading to a high-efficiency model for long-term savings.",
        shouldCallPro: true,
        proSpecialty: "Plumber",
        urgency: "This week",
        estimatedCost: { diyLow: 0, diyHigh: 0, proLow: 1200, proHigh: 3000 },
      },
      {
        nodeKey: "result_breaker_reset",
        nodeType: "result",
        title: "Breaker trip was a one-time event",
        diagnosisCode: "WH-BREAKER-ONCE",
        severity: "minor",
        recommendedAction: "A one-time breaker trip can be caused by a power surge or brief electrical anomaly. Monitor it over the next few days. If the breaker trips again, you likely have a failing heating element or thermostat that needs professional attention.",
        estimatedCost: { diyLow: 0, diyHigh: 0, proLow: 0, proHigh: 0 },
      },
      {
        nodeKey: "result_electric_element",
        nodeType: "result",
        title: "Likely failed heating element or thermostat",
        diagnosisCode: "WH-ELEMENT",
        severity: "moderate",
        recommendedAction: "A repeatedly tripping breaker or no heat with power on usually means a failed upper or lower heating element, or a failed thermostat. Elements are ~$15-30 parts but require draining the tank. Most homeowners prefer to have a professional handle this.",
        shouldCallPro: true,
        proSpecialty: "Plumber or electrician",
        urgency: "Within 1-2 days",
        estimatedCost: { diyLow: 15, diyHigh: 50, proLow: 150, proHigh: 350 },
      },
      {
        nodeKey: "result_high_limit_reset",
        nodeType: "result",
        title: "High-limit safety switch had tripped",
        diagnosisCode: "WH-HIGHLIMIT",
        severity: "moderate",
        recommendedAction: "The high-limit switch trips when water temperature exceeds safe limits (~170°F). This can be caused by a stuck thermostat, failed element, or sediment buildup. If it trips again, have a professional inspect the thermostats and elements — repeated trips indicate a safety issue.",
        estimatedCost: { diyLow: 0, diyHigh: 0, proLow: 150, proHigh: 300 },
      },
      {
        nodeKey: "result_electric_pro",
        nodeType: "referral",
        title: "Can't locate breaker — needs electrician",
        diagnosisCode: "WH-ELEC-UNKNOWN",
        severity: "moderate",
        shouldCallPro: true,
        proSpecialty: "Electrician",
        urgency: "Within 1-2 days",
        recommendedAction: "If you can't find a dedicated water heater breaker, the circuit may be improperly labeled or shared with another circuit. An electrician can trace the wiring and diagnose the issue.",
        estimatedCost: { diyLow: 0, diyHigh: 0, proLow: 100, proHigh: 300 },
      },
      {
        nodeKey: "result_tankless_error",
        nodeType: "referral",
        title: "Tankless error code — needs professional",
        diagnosisCode: "WH-TANKLESS-ERROR",
        severity: "moderate",
        shouldCallPro: true,
        proSpecialty: "Plumber (tankless specialist)",
        urgency: "Within 1-2 days",
        recommendedAction: "Note the error code and contact a plumber who services your brand. Common codes relate to ignition failure, flow sensor issues, or exhaust venting problems. Tankless units require brand-specific training to service properly.",
        estimatedCost: { diyLow: 0, diyHigh: 0, proLow: 150, proHigh: 500 },
      },
      {
        nodeKey: "result_tankless_power",
        nodeType: "result",
        title: "Tankless unit has no power",
        diagnosisCode: "WH-TANKLESS-POWER",
        severity: "minor",
        recommendedAction: "Check the dedicated breaker in your electrical panel. For gas tankless units, also verify the gas supply valve is open. Some units have a power switch on the unit itself. If power is confirmed but the unit is unresponsive, it needs professional service.",
        estimatedCost: { diyLow: 0, diyHigh: 0, proLow: 100, proHigh: 250 },
      },
      {
        nodeKey: "result_tankless_demand",
        nodeType: "result",
        title: "Hot water demand exceeds capacity",
        diagnosisCode: "WH-TANKLESS-DEMAND",
        severity: "minor",
        recommendedAction: "Tankless water heaters have a maximum flow rate (typically 3-5 GPM). Running multiple hot water fixtures simultaneously (shower + dishwasher + washing machine) can exceed the unit's capacity, resulting in lukewarm water. Try reducing simultaneous hot water use. If this is a frequent issue, you may need a larger unit or a second tankless unit.",
        estimatedCost: { diyLow: 0, diyHigh: 0, proLow: 0, proHigh: 0 },
      },
    ],
  },

  // ============================================================
  // 2. AC NOT COOLING
  // ============================================================
  {
    tree: {
      slug: "ac-not-cooling",
      systemCategory: "hvac",
      title: "AC Not Cooling Troubleshooter",
      description: "Diagnose why your air conditioning isn't cooling properly. Covers common issues from dirty filters to refrigerant problems.",
      entrySymptom: "AC is running but not cooling the house, or not running at all",
    },
    nodes: [
      {
        nodeKey: "start",
        nodeType: "question",
        title: "Is the outdoor unit running?",
        contentMarkdown: "Go outside and check the big metal box (condenser unit). Is the fan spinning? Can you hear the compressor humming?",
        options: [
          { label: "Yes, outdoor unit is running", nextNodeKey: "check_airflow" },
          { label: "No, outdoor unit is completely off", nextNodeKey: "check_thermostat" },
          { label: "Fan runs but I hear clicking/buzzing", nextNodeKey: "result_capacitor" },
        ],
      },
      {
        nodeKey: "check_thermostat",
        nodeType: "question",
        title: "Check your thermostat settings",
        contentMarkdown: "Make sure the thermostat is:\n- Set to **COOL** mode (not heat or off)\n- Set **below** the current room temperature (at least 3°F lower)\n- Fan set to **AUTO** (not just fan-only)",
        options: [
          { label: "Settings were wrong, fixed it", nextNodeKey: "result_thermostat_fix" },
          { label: "Settings are correct, still not running", nextNodeKey: "check_breaker" },
        ],
      },
      {
        nodeKey: "check_breaker",
        nodeType: "question",
        title: "Check the circuit breaker and outdoor disconnect",
        contentMarkdown: "Check two things:\n1. **Electrical panel**: Find the AC/HVAC breaker (double-pole). Is it tripped?\n2. **Outdoor disconnect**: There's a box on the wall near the outdoor unit with a pull-out handle. Is it in the ON position?",
        options: [
          { label: "Breaker was tripped — reset it", nextNodeKey: "result_breaker_ac" },
          { label: "Disconnect was off — turned it on", nextNodeKey: "result_disconnect" },
          { label: "Both are on", nextNodeKey: "result_ac_pro_needed" },
        ],
      },
      {
        nodeKey: "check_airflow",
        nodeType: "question",
        title: "Check the air filter",
        contentMarkdown: "Pull out the return air filter. Hold it up to a light source.\n\n- Can you see light through it? → Filter is okay\n- Is it gray/dark with no light visible? → Filter is clogged\n\nA severely clogged filter is the #1 cause of poor cooling performance.",
        options: [
          { label: "Filter is clogged / dirty", nextNodeKey: "result_dirty_filter" },
          { label: "Filter looks clean", nextNodeKey: "check_vents" },
        ],
      },
      {
        nodeKey: "check_vents",
        nodeType: "question",
        title: "Check supply registers and outdoor unit",
        contentMarkdown: "Put your hand in front of a supply register (the vents blowing air into the room).\n\n- Is the air **cool** but weak?\n- Is the air **warm/room temperature**?\n\nAlso check: Is the outdoor unit covered in debris, leaves, or overgrown plants?",
        options: [
          { label: "Air is cool but weak", nextNodeKey: "result_duct_issue" },
          { label: "Air is warm / not cold", nextNodeKey: "check_ice" },
          { label: "Outdoor unit is covered in debris", nextNodeKey: "result_dirty_condenser" },
        ],
      },
      {
        nodeKey: "check_ice",
        nodeType: "question",
        title: "Check for ice on the refrigerant line",
        contentMarkdown: "Look at the larger copper pipe going from the outdoor unit into the house (the suction line — it should be insulated). Is there frost or ice on it? Also check inside at the air handler — do you see ice on the coil?",
        options: [
          { label: "Yes, I see ice/frost", nextNodeKey: "result_frozen_coil" },
          { label: "No ice visible", nextNodeKey: "result_refrigerant" },
        ],
      },
      // Results
      {
        nodeKey: "result_thermostat_fix",
        nodeType: "result",
        title: "Thermostat settings were incorrect",
        diagnosisCode: "AC-TSTAT",
        severity: "minor",
        recommendedAction: "Give the system 15-30 minutes to start cooling. If it still doesn't cool after settings are correct, proceed with further troubleshooting.",
        estimatedCost: { diyLow: 0, diyHigh: 0, proLow: 0, proHigh: 0 },
      },
      {
        nodeKey: "result_breaker_ac",
        nodeType: "result",
        title: "Breaker was tripped",
        diagnosisCode: "AC-BREAKER",
        severity: "minor",
        recommendedAction: "The breaker tripping once can be a fluke (power surge, lightning). If it trips again within 24 hours, do NOT keep resetting it — you likely have an electrical issue (bad capacitor, compressor short, or wiring problem). Call an HVAC technician.",
        estimatedCost: { diyLow: 0, diyHigh: 0, proLow: 0, proHigh: 0 },
      },
      {
        nodeKey: "result_disconnect",
        nodeType: "result",
        title: "Outdoor disconnect was off",
        diagnosisCode: "AC-DISCONNECT",
        severity: "minor",
        recommendedAction: "Someone may have turned off the outdoor disconnect during a repair or accidentally. With power restored, the system should start working within 15-30 minutes.",
        estimatedCost: { diyLow: 0, diyHigh: 0, proLow: 0, proHigh: 0 },
      },
      {
        nodeKey: "result_ac_pro_needed",
        nodeType: "referral",
        title: "Outdoor unit won't start — needs pro",
        diagnosisCode: "AC-NO-START",
        severity: "moderate",
        shouldCallPro: true,
        proSpecialty: "HVAC technician",
        urgency: "Same day if hot weather",
        recommendedAction: "With power confirmed but the outdoor unit not starting, common causes include a failed capacitor ($150-300), failed contactor ($100-250), or a compressor issue ($1,500-3,000). An HVAC tech can diagnose on-site.",
        estimatedCost: { diyLow: 0, diyHigh: 0, proLow: 100, proHigh: 350 },
      },
      {
        nodeKey: "result_capacitor",
        nodeType: "result",
        title: "Likely failed capacitor",
        diagnosisCode: "AC-CAPACITOR",
        severity: "moderate",
        shouldCallPro: true,
        proSpecialty: "HVAC technician",
        urgency: "Same day",
        recommendedAction: "Buzzing or clicking at the outdoor unit without the compressor or fan starting strongly suggests a failed run capacitor. This is the most common AC repair — a $15-50 part plus labor. Capacitors store lethal voltage; this is not a safe DIY repair unless you have electrical training.",
        estimatedCost: { diyLow: 15, diyHigh: 50, proLow: 150, proHigh: 300 },
      },
      {
        nodeKey: "result_dirty_filter",
        nodeType: "result",
        title: "Clogged air filter — replace immediately",
        diagnosisCode: "AC-FILTER",
        severity: "minor",
        recommendedAction: "Replace the filter now. A clogged filter restricts airflow, causing the evaporator coil to freeze, the compressor to overwork, and cooling to drop. After replacing the filter, run the system for 1-2 hours and check for improvement. Set a reminder to change it every 30 days during cooling season.",
        estimatedCost: { diyLow: 3, diyHigh: 15, proLow: 0, proHigh: 0 },
      },
      {
        nodeKey: "result_duct_issue",
        nodeType: "result",
        title: "Possible ductwork issue",
        diagnosisCode: "AC-DUCT",
        severity: "moderate",
        recommendedAction: "Cool air at the unit but weak flow at registers usually means a duct problem — disconnected ductwork in the attic, a collapsed flex duct, or a closed damper. Check accessible ductwork in the attic for disconnections. Also make sure all supply registers are open.",
        estimatedCost: { diyLow: 0, diyHigh: 30, proLow: 150, proHigh: 500 },
      },
      {
        nodeKey: "result_dirty_condenser",
        nodeType: "result",
        title: "Dirty condenser coil — clean it",
        diagnosisCode: "AC-CONDENSER-DIRTY",
        severity: "minor",
        recommendedAction: "Turn off the system, clear all debris and vegetation from around the outdoor unit (maintain 2 feet of clearance on all sides), and spray the coils with a garden hose from inside out. Do NOT use a pressure washer. This alone can restore 10-30% of lost cooling capacity.",
        estimatedCost: { diyLow: 0, diyHigh: 20, proLow: 100, proHigh: 250 },
      },
      {
        nodeKey: "result_frozen_coil",
        nodeType: "result",
        title: "Frozen evaporator coil",
        diagnosisCode: "AC-FROZEN",
        severity: "moderate",
        recommendedAction: "Turn the system OFF but leave the fan running on AUTO or ON to melt the ice (takes 2-4 hours). Check and replace the air filter. If the coil freezes again after thawing, the cause is likely low refrigerant (leak) or a blower motor issue — call an HVAC tech.",
        estimatedCost: { diyLow: 0, diyHigh: 15, proLow: 200, proHigh: 600 },
      },
      {
        nodeKey: "result_refrigerant",
        nodeType: "referral",
        title: "Likely low refrigerant — needs pro",
        diagnosisCode: "AC-REFRIGERANT",
        severity: "serious",
        shouldCallPro: true,
        proSpecialty: "HVAC technician (EPA certified)",
        urgency: "Within 1-2 days",
        recommendedAction: "Warm air from supply vents with the system running and no ice formation usually indicates low refrigerant charge. Refrigerant doesn't 'run out' — a low charge means there's a leak somewhere. An HVAC tech needs to find and repair the leak, then recharge the system.",
        estimatedCost: { diyLow: 0, diyHigh: 0, proLow: 200, proHigh: 800 },
      },
    ],
  },

  // ============================================================
  // 3. CIRCUIT BREAKER KEEPS TRIPPING
  // ============================================================
  {
    tree: {
      slug: "breaker-tripping",
      systemCategory: "electrical",
      title: "Circuit Breaker Keeps Tripping",
      description: "Diagnose why a circuit breaker keeps tripping. Covers overloaded circuits, short circuits, and ground faults.",
      entrySymptom: "A circuit breaker trips repeatedly or won't stay reset",
    },
    nodes: [
      {
        nodeKey: "start",
        nodeType: "question",
        title: "Which breaker is tripping?",
        contentMarkdown: "Look at your electrical panel. Which breaker is in the tripped (middle) position?",
        options: [
          { label: "A regular 15A or 20A breaker (single)", nextNodeKey: "check_overload" },
          { label: "A large 30A-50A breaker (double-pole)", nextNodeKey: "large_breaker" },
          { label: "A GFCI or AFCI breaker (has a test button)", nextNodeKey: "gfci_afci" },
          { label: "The main breaker", nextNodeKey: "result_main_breaker" },
        ],
      },
      {
        nodeKey: "check_overload",
        nodeType: "question",
        title: "Is the circuit overloaded?",
        contentMarkdown: "Think about what's plugged into that circuit. Common overload culprits:\n- Space heaters (1,500W each)\n- Hair dryers (1,200-1,800W)\n- Window AC units (500-1,500W)\n- Multiple kitchen appliances running simultaneously\n\nA 15A circuit handles ~1,800W. A 20A circuit handles ~2,400W. Were you running multiple high-draw devices?",
        options: [
          { label: "Yes, probably too many things running", nextNodeKey: "result_overload" },
          { label: "No, nothing unusual was running", nextNodeKey: "check_trip_timing" },
        ],
      },
      {
        nodeKey: "check_trip_timing",
        nodeType: "question",
        title: "When does it trip?",
        contentMarkdown: "Understanding when the breaker trips helps identify the cause.",
        options: [
          { label: "Immediately when I reset it", nextNodeKey: "result_short_circuit" },
          { label: "After a few minutes", nextNodeKey: "result_intermittent_short" },
          { label: "Only when I use a specific appliance", nextNodeKey: "result_appliance_fault" },
          { label: "Randomly / no pattern", nextNodeKey: "result_bad_breaker" },
        ],
      },
      {
        nodeKey: "large_breaker",
        nodeType: "question",
        title: "What does this breaker control?",
        contentMarkdown: "Large double-pole breakers typically serve:\n- HVAC / Air conditioner\n- Electric water heater\n- Electric dryer\n- Electric range/oven\n- Electric vehicle charger",
        options: [
          { label: "HVAC / AC unit", nextNodeKey: "result_hvac_breaker" },
          { label: "Water heater", nextNodeKey: "result_wh_breaker" },
          { label: "Dryer or range", nextNodeKey: "result_appliance_breaker" },
          { label: "Not sure / not labeled", nextNodeKey: "result_pro_electrician" },
        ],
      },
      {
        nodeKey: "gfci_afci",
        nodeType: "question",
        title: "GFCI/AFCI breaker trips are often different from overloads",
        contentMarkdown: "GFCI breakers protect against ground faults (electrical shock risk). AFCI breakers protect against arc faults (fire risk). These trip for different reasons than standard breakers.\n\nDoes the breaker protect a wet area (bathroom, kitchen, outdoor, garage)?",
        options: [
          { label: "Yes, it's for a wet area", nextNodeKey: "result_gfci_wet" },
          { label: "No, it's for bedrooms or living areas", nextNodeKey: "result_afci_trip" },
        ],
      },
      // Results
      {
        nodeKey: "result_overload",
        nodeType: "result",
        title: "Circuit overload — reduce the load",
        diagnosisCode: "ELEC-OVERLOAD",
        severity: "minor",
        recommendedAction: "Redistribute devices across different circuits. Avoid running multiple high-wattage devices on the same circuit simultaneously. If you frequently overload circuits, consider having an electrician add a dedicated circuit for high-draw appliances.",
        estimatedCost: { diyLow: 0, diyHigh: 0, proLow: 200, proHigh: 500 },
      },
      {
        nodeKey: "result_short_circuit",
        nodeType: "referral",
        title: "⚠️ Likely short circuit — do not keep resetting",
        diagnosisCode: "ELEC-SHORT",
        severity: "serious",
        shouldCallPro: true,
        proSpecialty: "Licensed electrician",
        urgency: "Same day",
        recommendedAction: "A breaker that trips instantly on reset indicates a direct short circuit. This could be a damaged wire, a failed outlet, or a shorted appliance. Leave the breaker OFF and call an electrician. Do not keep resetting — this can cause wire overheating and fire risk.",
        estimatedCost: { diyLow: 0, diyHigh: 0, proLow: 150, proHigh: 500 },
      },
      {
        nodeKey: "result_intermittent_short",
        nodeType: "result",
        title: "Intermittent short or overheating connection",
        diagnosisCode: "ELEC-INTERMITTENT",
        severity: "moderate",
        shouldCallPro: true,
        proSpecialty: "Licensed electrician",
        urgency: "Within 1-2 days",
        recommendedAction: "A breaker that trips after a few minutes suggests a loose connection that heats up under load, or a wire with damaged insulation making intermittent contact. An electrician can test with a thermal camera and megger to find the fault.",
        estimatedCost: { diyLow: 0, diyHigh: 0, proLow: 150, proHigh: 400 },
      },
      {
        nodeKey: "result_appliance_fault",
        nodeType: "result",
        title: "Faulty appliance causing the trip",
        diagnosisCode: "ELEC-APPLIANCE",
        severity: "moderate",
        recommendedAction: "Unplug the suspect appliance and reset the breaker. If the breaker holds, the appliance is the problem. Try the appliance on a different circuit to confirm. The appliance may have a short in its cord, plug, or internal wiring. Have it repaired or replace it.",
        estimatedCost: { diyLow: 0, diyHigh: 0, proLow: 50, proHigh: 200 },
      },
      {
        nodeKey: "result_bad_breaker",
        nodeType: "result",
        title: "Possibly a worn-out breaker",
        diagnosisCode: "ELEC-BAD-BREAKER",
        severity: "moderate",
        shouldCallPro: true,
        proSpecialty: "Licensed electrician",
        urgency: "Within a week",
        recommendedAction: "Breakers can wear out over time, especially if they've tripped many times. The internal trip mechanism weakens and trips at lower currents. An electrician can test the breaker and replace it if needed (~$10-50 for the breaker, plus labor).",
        estimatedCost: { diyLow: 10, diyHigh: 50, proLow: 100, proHigh: 250 },
      },
      {
        nodeKey: "result_hvac_breaker",
        nodeType: "referral",
        title: "HVAC breaker tripping — call HVAC tech",
        diagnosisCode: "ELEC-HVAC",
        severity: "moderate",
        shouldCallPro: true,
        proSpecialty: "HVAC technician",
        urgency: "Same day if hot/cold weather",
        recommendedAction: "Common HVAC causes: failed compressor (locked rotor draws 5-10x normal amps), bad capacitor, contactor welded shut, or a ground fault in the compressor windings. Do not keep resetting the breaker — call an HVAC tech.",
        estimatedCost: { diyLow: 0, diyHigh: 0, proLow: 150, proHigh: 3000 },
      },
      {
        nodeKey: "result_wh_breaker",
        nodeType: "referral",
        title: "Water heater breaker tripping",
        diagnosisCode: "ELEC-WH",
        severity: "moderate",
        shouldCallPro: true,
        proSpecialty: "Plumber or electrician",
        urgency: "Within 1-2 days",
        recommendedAction: "Usually caused by a failed heating element that has shorted to the tank (grounded element). A plumber can test the elements with a multimeter and replace the failed one.",
        estimatedCost: { diyLow: 15, diyHigh: 50, proLow: 150, proHigh: 350 },
      },
      {
        nodeKey: "result_appliance_breaker",
        nodeType: "result",
        title: "Large appliance breaker trip",
        diagnosisCode: "ELEC-LARGE-APPLIANCE",
        severity: "moderate",
        recommendedAction: "For dryers: check the lint trap and exhaust vent (a clogged vent causes overheating, which can trip breakers). For ranges: check if a specific burner or oven element causes the trip. Unplug the appliance and reset the breaker to test.",
        estimatedCost: { diyLow: 0, diyHigh: 0, proLow: 100, proHigh: 400 },
      },
      {
        nodeKey: "result_pro_electrician",
        nodeType: "referral",
        title: "Unknown breaker — needs electrician",
        diagnosisCode: "ELEC-UNKNOWN",
        severity: "moderate",
        shouldCallPro: true,
        proSpecialty: "Licensed electrician",
        urgency: "Within 1-2 days",
        recommendedAction: "An unlabeled breaker that keeps tripping needs professional diagnosis. An electrician can map the circuit, identify what it serves, find the fault, and properly label the panel.",
        estimatedCost: { diyLow: 0, diyHigh: 0, proLow: 150, proHigh: 400 },
      },
      {
        nodeKey: "result_main_breaker",
        nodeType: "referral",
        title: "⚠️ Main breaker tripping — serious issue",
        diagnosisCode: "ELEC-MAIN",
        severity: "critical",
        shouldCallPro: true,
        proSpecialty: "Licensed electrician — emergency",
        urgency: "Immediate",
        recommendedAction: "The main breaker tripping indicates a major problem: whole-house overload, a fault in the main panel, or a problem from the utility. Do not keep resetting. Call an electrician immediately. If you see burn marks, smell burning, or hear buzzing from the panel, call the fire department.",
        estimatedCost: { diyLow: 0, diyHigh: 0, proLow: 200, proHigh: 2000 },
      },
      {
        nodeKey: "result_gfci_wet",
        nodeType: "result",
        title: "GFCI trip in wet area — check for moisture",
        diagnosisCode: "ELEC-GFCI-WET",
        severity: "minor",
        recommendedAction: "GFCI breakers trip when they detect current leaking to ground (a shock hazard). In wet areas, water in an outlet box, a damp appliance cord, or a failed appliance can cause trips. Unplug all devices on that circuit, dry any visible moisture, and reset. If it trips with nothing plugged in, the wiring itself has a ground fault.",
        estimatedCost: { diyLow: 0, diyHigh: 0, proLow: 100, proHigh: 300 },
      },
      {
        nodeKey: "result_afci_trip",
        nodeType: "result",
        title: "AFCI breaker nuisance trip",
        diagnosisCode: "ELEC-AFCI",
        severity: "minor",
        recommendedAction: "AFCI breakers can be sensitive to certain devices (vacuum cleaners, treadmills, some LED dimmers). Try unplugging devices one at a time to find the culprit. If a specific device consistently causes trips, try it on a different circuit. Persistent AFCI trips with no identifiable cause may indicate a wiring issue — have an electrician check the circuit.",
        estimatedCost: { diyLow: 0, diyHigh: 0, proLow: 100, proHigh: 300 },
      },
    ],
  },

  // ============================================================
  // 4. TOILET RUNNING CONSTANTLY
  // ============================================================
  {
    tree: {
      slug: "toilet-running",
      systemCategory: "plumbing",
      title: "Toilet Running Constantly",
      description: "Diagnose why your toilet won't stop running. Covers flapper issues, fill valve problems, and float adjustments.",
      entrySymptom: "Toilet runs continuously or cycles on and off (phantom flush)",
    },
    nodes: [
      {
        nodeKey: "start",
        nodeType: "question",
        title: "How is the toilet running?",
        contentMarkdown: "Remove the tank lid and observe what's happening inside.",
        options: [
          { label: "Water is constantly flowing into the overflow tube", nextNodeKey: "check_float" },
          { label: "Water seems to be leaking from the bottom of the tank", nextNodeKey: "check_flapper" },
          { label: "Toilet runs for a few seconds every 10-15 minutes", nextNodeKey: "phantom_flush" },
          { label: "Toilet runs after flushing and won't stop", nextNodeKey: "check_fill_valve" },
        ],
      },
      {
        nodeKey: "check_float",
        nodeType: "action",
        title: "The water level is too high — adjust the float",
        contentMarkdown: "The water is flowing into the overflow tube because the fill valve isn't shutting off.\n\n**For a ball-float valve** (old style with a ball on an arm):\n- Bend the float arm down slightly to lower the water level\n- The water should stop about 1 inch below the top of the overflow tube\n\n**For a modern fill valve** (like Fluidmaster):\n- Locate the adjustment screw or clip on the valve\n- Turn the screw clockwise or slide the clip down to lower the water level",
        options: [
          { label: "Adjusted the float, water stopped", nextNodeKey: "result_float_fixed" },
          { label: "Float is adjusted but water still flows", nextNodeKey: "result_fill_valve" },
        ],
      },
      {
        nodeKey: "check_flapper",
        nodeType: "action",
        title: "Check the flapper seal",
        contentMarkdown: "The flapper is the rubber piece at the bottom of the tank that seals the flush valve.\n\n1. Push down on the flapper with your hand. Does the running stop?\n2. Lift the flapper and inspect it — feel for warping, cracks, or mineral buildup\n3. Run your finger around the flush valve seat (the ring the flapper sits on) — feel for roughness or buildup",
        options: [
          { label: "Pressing the flapper stops the running", nextNodeKey: "result_flapper" },
          { label: "Flapper seems fine, still running", nextNodeKey: "check_fill_valve" },
        ],
      },
      {
        nodeKey: "phantom_flush",
        nodeType: "result",
        title: "Phantom flush — slow leak past the flapper",
        diagnosisCode: "TOILET-PHANTOM",
        severity: "minor",
        recommendedAction: "A toilet that runs briefly every 10-15 minutes has a slow leak past the flapper. The tank slowly drains down until the fill valve kicks in to refill it. Replace the flapper ($5-10 at any hardware store). This is wasting 200+ gallons per day — fix it ASAP.",
        estimatedCost: { diyLow: 5, diyHigh: 10, proLow: 75, proHigh: 150 },
      },
      {
        nodeKey: "check_fill_valve",
        nodeType: "question",
        title: "Is the fill valve the problem?",
        contentMarkdown: "The fill valve is the tall mechanism on the left side of the tank that refills the tank after a flush.\n\nLift the float all the way up by hand. Does the water stop flowing?",
        options: [
          { label: "Yes, water stops when I lift the float", nextNodeKey: "result_float_adjusted" },
          { label: "No, water keeps flowing even with float up", nextNodeKey: "result_fill_valve" },
        ],
      },
      // Results
      {
        nodeKey: "result_float_fixed",
        nodeType: "result",
        title: "Float was set too high — now adjusted",
        diagnosisCode: "TOILET-FLOAT-HIGH",
        severity: "minor",
        recommendedAction: "The float just needed adjustment. The water level should sit about 1 inch below the top of the overflow tube. If this happens again or the float doesn't hold its position, the fill valve may need replacement.",
        estimatedCost: { diyLow: 0, diyHigh: 0, proLow: 0, proHigh: 0 },
      },
      {
        nodeKey: "result_flapper",
        nodeType: "result",
        title: "Worn flapper — replace it",
        diagnosisCode: "TOILET-FLAPPER",
        severity: "minor",
        recommendedAction: "The flapper is worn and not sealing properly. This is the most common toilet repair:\n\n1. Turn off the water supply valve (behind the toilet)\n2. Flush to empty the tank\n3. Unhook the old flapper from the flush valve ears\n4. Take it to the hardware store to match the size\n5. Hook the new flapper on and reconnect the chain\n6. Turn water back on and test\n\nTotal time: 10 minutes. Total cost: $5-10.",
        estimatedCost: { diyLow: 5, diyHigh: 10, proLow: 75, proHigh: 150 },
      },
      {
        nodeKey: "result_float_adjusted",
        nodeType: "result",
        title: "Float needs proper adjustment",
        diagnosisCode: "TOILET-FLOAT-ADJ",
        severity: "minor",
        recommendedAction: "The fill valve works but the float is set incorrectly. Adjust as described above. If the float mechanism is corroded, stiff, or won't hold position, replace the entire fill valve assembly ($10-20 part, 20-minute job).",
        estimatedCost: { diyLow: 0, diyHigh: 20, proLow: 75, proHigh: 150 },
      },
      {
        nodeKey: "result_fill_valve",
        nodeType: "result",
        title: "Fill valve needs replacement",
        diagnosisCode: "TOILET-FILL-VALVE",
        severity: "minor",
        recommendedAction: "The fill valve isn't shutting off properly — it needs to be replaced. A universal fill valve (like Fluidmaster 400A) costs $8-15 and takes about 20 minutes to install:\n\n1. Turn off water supply and flush the tank\n2. Disconnect the water supply line from the bottom of the tank\n3. Remove the old fill valve (one nut underneath)\n4. Install the new valve, adjust height, and reconnect\n5. Turn water on and adjust the float\n\nThis is one of the easiest plumbing repairs.",
        estimatedCost: { diyLow: 8, diyHigh: 15, proLow: 100, proHigh: 200 },
      },
    ],
  },

  // ============================================================
  // 5. FURNACE NOT HEATING
  // ============================================================
  {
    tree: {
      slug: "furnace-not-heating",
      systemCategory: "hvac",
      title: "Furnace Not Heating Troubleshooter",
      description: "Diagnose why your furnace isn't producing heat. Covers gas and electric furnaces, common causes from thermostat issues to flame sensor problems.",
      entrySymptom: "Furnace won't turn on, produces no heat, or shuts off shortly after starting",
    },
    nodes: [
      {
        nodeKey: "start",
        nodeType: "question",
        title: "What's happening with your furnace?",
        contentMarkdown: "Describe the symptom that best matches your situation.",
        options: [
          { label: "Furnace won't turn on at all", nextNodeKey: "check_thermostat_heat" },
          { label: "Blower runs but no heat comes out", nextNodeKey: "check_ignition" },
          { label: "Furnace starts then shuts off after a few seconds", nextNodeKey: "short_cycle" },
          { label: "Furnace runs but house is still cold", nextNodeKey: "weak_heat" },
        ],
      },
      {
        nodeKey: "check_thermostat_heat",
        nodeType: "question",
        title: "Check the thermostat",
        contentMarkdown: "Verify:\n- Mode is set to **HEAT** (not cool or off)\n- Temperature is set **above** current room temperature (at least 3°F higher)\n- Display is on (not blank)\n- If battery-powered, try fresh batteries",
        options: [
          { label: "Thermostat was set wrong, fixed it", nextNodeKey: "result_thermostat_heat" },
          { label: "Thermostat screen is blank", nextNodeKey: "result_thermostat_power" },
          { label: "Thermostat is set correctly", nextNodeKey: "check_power_furnace" },
        ],
      },
      {
        nodeKey: "check_power_furnace",
        nodeType: "question",
        title: "Check furnace power and gas",
        contentMarkdown: "Check these three things:\n\n1. **Furnace switch**: There's a light switch (usually red or near the furnace) — is it ON?\n2. **Circuit breaker**: Is the furnace breaker tripped?\n3. **Gas valve**: Is the gas supply valve open? (Handle parallel to pipe = open, perpendicular = closed)",
        options: [
          { label: "Switch was off / breaker tripped", nextNodeKey: "result_power_restored" },
          { label: "Gas valve was closed", nextNodeKey: "result_gas_valve" },
          { label: "Everything is on", nextNodeKey: "check_ignition" },
        ],
      },
      {
        nodeKey: "check_ignition",
        nodeType: "question",
        title: "Listen and watch the furnace startup sequence",
        contentMarkdown: "Set the thermostat to call for heat. Go to the furnace and observe:\n\n1. You should hear the **draft inducer motor** start (small motor/fan sound)\n2. Then the **igniter** should glow or click\n3. Then you should hear the **gas valve open** and see/hear ignition\n4. After 30-60 seconds, the **blower motor** starts\n\nWhat do you observe?",
        options: [
          { label: "I hear the inducer but no ignition", nextNodeKey: "result_flame_sensor" },
          { label: "Nothing happens at all", nextNodeKey: "result_control_board" },
          { label: "Inducer runs, gas ignites, then shuts off", nextNodeKey: "short_cycle" },
          { label: "Everything runs but air isn't hot", nextNodeKey: "weak_heat" },
        ],
      },
      {
        nodeKey: "short_cycle",
        nodeType: "question",
        title: "How quickly does it shut off?",
        contentMarkdown: "The furnace starts heating but shuts down prematurely. The timing helps identify the cause.",
        options: [
          { label: "Within 3-10 seconds of flame", nextNodeKey: "result_flame_sensor" },
          { label: "After 1-3 minutes", nextNodeKey: "result_high_limit_furnace" },
          { label: "After 5-10 minutes", nextNodeKey: "result_overheating" },
        ],
      },
      {
        nodeKey: "weak_heat",
        nodeType: "question",
        title: "Check the air filter and vents",
        contentMarkdown: "When heat output is weak:\n1. Check the air filter — is it clogged?\n2. Are all supply registers open and unblocked?\n3. Feel the supply air — is it warm but not hot enough?",
        options: [
          { label: "Filter is clogged", nextNodeKey: "result_filter_furnace" },
          { label: "Registers were blocked", nextNodeKey: "result_registers_blocked" },
          { label: "Air is barely warm", nextNodeKey: "result_gas_pressure" },
        ],
      },
      // Results
      {
        nodeKey: "result_thermostat_heat",
        nodeType: "result",
        title: "Thermostat settings corrected",
        diagnosisCode: "FURN-TSTAT",
        severity: "minor",
        recommendedAction: "Give the furnace 5-10 minutes to start up and begin heating. The draft inducer runs first, then ignition, then the blower starts after a warm-up delay.",
        estimatedCost: { diyLow: 0, diyHigh: 0, proLow: 0, proHigh: 0 },
      },
      {
        nodeKey: "result_thermostat_power",
        nodeType: "result",
        title: "Thermostat has no power",
        diagnosisCode: "FURN-TSTAT-POWER",
        severity: "minor",
        recommendedAction: "For battery-powered thermostats: replace the batteries. For hardwired thermostats: check the furnace breaker and the furnace door switch (the furnace won't run with the blower compartment door open — this also kills thermostat power on many models).",
        estimatedCost: { diyLow: 3, diyHigh: 8, proLow: 50, proHigh: 150 },
      },
      {
        nodeKey: "result_power_restored",
        nodeType: "result",
        title: "Power was off — now restored",
        diagnosisCode: "FURN-POWER",
        severity: "minor",
        recommendedAction: "The furnace switch or breaker was off. This could have been accidental (someone bumped it) or intentional (service work). With power restored, the furnace should start within 5 minutes. If the breaker trips again, see the circuit breaker troubleshooter.",
        estimatedCost: { diyLow: 0, diyHigh: 0, proLow: 0, proHigh: 0 },
      },
      {
        nodeKey: "result_gas_valve",
        nodeType: "result",
        title: "Gas valve was closed",
        diagnosisCode: "FURN-GAS-CLOSED",
        severity: "minor",
        recommendedAction: "Open the gas valve (handle parallel to pipe). Wait a few minutes for gas to reach the furnace. The furnace should start on the next thermostat call for heat. If you smell gas after opening the valve, close it immediately and call your gas company.",
        estimatedCost: { diyLow: 0, diyHigh: 0, proLow: 0, proHigh: 0 },
      },
      {
        nodeKey: "result_flame_sensor",
        nodeType: "result",
        title: "Likely dirty flame sensor — the #1 furnace fix",
        diagnosisCode: "FURN-FLAME-SENSOR",
        severity: "moderate",
        recommendedAction: "This is the most common furnace repair call. The flame sensor is a small metal rod that proves to the control board that the burner is lit. When it gets oxidized, it can't sense the flame and shuts off the gas as a safety measure.\n\n**DIY fix (15 minutes):**\n1. Turn off the furnace and gas\n2. Find the flame sensor — a thin metal rod mounted near the burners, held by one screw\n3. Remove the screw, pull out the sensor\n4. Clean the rod with fine emery cloth or steel wool until shiny\n5. Reinstall and test\n\nA $150+ service call for a 15-minute cleaning.",
        estimatedCost: { diyLow: 0, diyHigh: 10, proLow: 100, proHigh: 200 },
      },
      {
        nodeKey: "result_control_board",
        nodeType: "referral",
        title: "Possible control board or wiring issue",
        diagnosisCode: "FURN-CONTROL",
        severity: "serious",
        shouldCallPro: true,
        proSpecialty: "HVAC technician",
        urgency: "Same day if below freezing",
        recommendedAction: "If the furnace does nothing at all (no sounds, no lights on the control board), the issue may be a failed control board, blown fuse on the board, or a wiring problem. Check if there's an LED light on the control board visible through the blower door window — the blink pattern indicates the error code.",
        estimatedCost: { diyLow: 0, diyHigh: 0, proLow: 200, proHigh: 800 },
      },
      {
        nodeKey: "result_high_limit_furnace",
        nodeType: "result",
        title: "High-limit switch tripping — airflow issue",
        diagnosisCode: "FURN-HIGH-LIMIT",
        severity: "moderate",
        recommendedAction: "The furnace overheats and the high-limit safety switch shuts it down. Almost always caused by restricted airflow:\n\n1. **Replace the air filter** (most common cause)\n2. Check that all supply registers are open\n3. Make sure nothing is blocking the return air grille\n4. Check if the blower wheel is dirty (reduces airflow)\n\nIf the filter is clean and registers are open, call an HVAC tech to check the blower motor.",
        estimatedCost: { diyLow: 5, diyHigh: 15, proLow: 100, proHigh: 300 },
      },
      {
        nodeKey: "result_overheating",
        nodeType: "referral",
        title: "Furnace overheating — possible blower or duct issue",
        diagnosisCode: "FURN-OVERHEAT",
        severity: "moderate",
        shouldCallPro: true,
        proSpecialty: "HVAC technician",
        urgency: "Within 1-2 days",
        recommendedAction: "If the furnace runs for 5-10 minutes then shuts off, the heat exchanger is overheating. After replacing the filter and checking registers, the next suspects are a failing blower motor (not moving enough air), dirty blower wheel, or ductwork restrictions.",
        estimatedCost: { diyLow: 0, diyHigh: 0, proLow: 150, proHigh: 600 },
      },
      {
        nodeKey: "result_filter_furnace",
        nodeType: "result",
        title: "Clogged filter — replace it",
        diagnosisCode: "FURN-FILTER",
        severity: "minor",
        recommendedAction: "A clogged filter is the #1 cause of furnace problems. Replace it immediately. With a clean filter, the furnace should resume normal operation within 30 minutes. Set a monthly reminder to check and replace as needed.",
        estimatedCost: { diyLow: 5, diyHigh: 15, proLow: 0, proHigh: 0 },
      },
      {
        nodeKey: "result_registers_blocked",
        nodeType: "result",
        title: "Supply registers were blocked",
        diagnosisCode: "FURN-REGISTERS",
        severity: "minor",
        recommendedAction: "Open all supply registers and move any furniture, rugs, or items blocking them. The furnace needs adequate airflow through the duct system to operate properly. Closing too many registers can cause the same overheating issues as a clogged filter.",
        estimatedCost: { diyLow: 0, diyHigh: 0, proLow: 0, proHigh: 0 },
      },
      {
        nodeKey: "result_gas_pressure",
        nodeType: "referral",
        title: "Possible gas pressure or burner issue",
        diagnosisCode: "FURN-GAS-PRESSURE",
        severity: "moderate",
        shouldCallPro: true,
        proSpecialty: "HVAC technician",
        urgency: "Within 1-2 days",
        recommendedAction: "Barely warm air despite the furnace running could indicate low gas pressure, dirty burners, or a partially blocked heat exchanger. An HVAC tech can measure gas pressure with a manometer and perform a combustion analysis to diagnose the issue.",
        estimatedCost: { diyLow: 0, diyHigh: 0, proLow: 100, proHigh: 400 },
      },
    ],
  },
];

export const seed = internalMutation({
  handler: async (ctx) => {
    let treesCreated = 0;
    let nodesCreated = 0;

    for (const { tree, nodes } of trees) {
      // Check if tree already exists
      const existing = await ctx.db
        .query("diagnosticTrees")
        .withIndex("by_slug", (q) => q.eq("slug", tree.slug))
        .first();

      if (existing) {
        console.log(`Diagnostic tree "${tree.slug}" already exists, skipping`);
        continue;
      }

      // Create the tree
      const treeId = await ctx.db.insert("diagnosticTrees", {
        slug: tree.slug,
        systemCategory: tree.systemCategory,
        title: tree.title,
        description: tree.description,
        entrySymptom: tree.entrySymptom,
        status: "published",
        version: 1,
        completionCount: 0,
      });

      treesCreated++;

      // Create all nodes
      for (const node of nodes) {
        await ctx.db.insert("diagnosticNodes", {
          treeId,
          nodeKey: node.nodeKey,
          nodeType: node.nodeType,
          title: node.title,
          contentMarkdown: node.contentMarkdown,
          options: node.options,
          diagnosisCode: node.diagnosisCode,
          severity: node.severity,
          recommendedAction: node.recommendedAction,
          estimatedCost: node.estimatedCost,
          shouldCallPro: node.shouldCallPro,
          proSpecialty: node.proSpecialty,
          urgency: node.urgency,
        });
        nodesCreated++;
      }

      console.log(`Created diagnostic tree "${tree.slug}" with ${nodes.length} nodes`);
    }

    console.log(`Seeding complete: ${treesCreated} trees, ${nodesCreated} nodes created`);
  },
});
