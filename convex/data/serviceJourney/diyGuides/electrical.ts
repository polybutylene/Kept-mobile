import { DIYGuide } from "./types";

export const electricalGuides: DIYGuide[] = [
  {
    issueSlug: "tripped_breaker",
    title: "Reset a Tripped Circuit Breaker",
    applicableTo: ["electrical", "electrical_panel"],
    difficulty: "easy",
    estimatedTime: "5 minutes",
    toolsNeeded: ["Flashlight"],
    safetyWarnings: [
      "If the breaker trips repeatedly, STOP and call an electrician — there may be a wiring issue.",
      "Never touch the panel with wet hands or while standing on a wet surface.",
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Find the tripped breaker",
        instruction: "Open your electrical panel and look for a breaker that's in the middle position (not fully ON or OFF). It may also show an orange or red indicator.",
        details: "Breakers trip when they detect an overload or short circuit — it's a safety feature. The tripped breaker will be between ON and OFF, not aligned with the others.",
      },
      {
        stepNumber: 2,
        title: "Reset it",
        instruction: "Push the breaker firmly to the OFF position first, then flip it back to ON. You should hear a solid click.",
        details: "You have to push it to full OFF before it will reset to ON. If it immediately trips again, you have an active overload or short — leave it off and call an electrician.",
      },
      {
        stepNumber: 3,
        title: "Check what caused it",
        instruction: "Think about what was running when it tripped. Unplug any new or suspect devices from that circuit. If the breaker stays on without those devices, one of them is the problem.",
        details: "Common causes: too many high-draw appliances on one circuit (space heaters, hair dryers, microwaves), a failing appliance motor, or water damage to an outlet. If it trips with nothing plugged in, call an electrician.",
      },
    ],
  },
  {
    issueSlug: "gfci_tripped",
    title: "Reset a GFCI Outlet",
    applicableTo: ["electrical"],
    difficulty: "easy",
    estimatedTime: "2 minutes",
    toolsNeeded: [],
    safetyWarnings: [
      "If the GFCI won't stay reset, there may be a ground fault in the circuit — call an electrician.",
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Find the GFCI outlet",
        instruction: "GFCI outlets have TEST and RESET buttons between the plug slots. They're required in kitchens, bathrooms, garages, and outdoor areas. One GFCI outlet often protects several regular outlets downstream.",
        details: "If an outlet in your bathroom goes dead, the GFCI might be in the garage or another bathroom. Check all GFCI locations in your home.",
      },
      {
        stepNumber: 2,
        title: "Press RESET",
        instruction: "Press the RESET button firmly. You should hear a click and any connected devices should power on.",
        details: "If the RESET button won't stay in, unplug all devices from the GFCI and downstream outlets, then try again. If it still won't reset, the GFCI outlet itself may have failed — they wear out after about 10 years.",
      },
    ],
  },
];
