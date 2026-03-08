// Preventative Care Guidelines — Strategic recommendations for extending system life
// Separate from maintenance tasks (which are scheduled actions). These are
// proactive investments and behavioral recommendations.
// Source: Field-calibrated system profiles authored by Solomon

export interface PreventativeCareGuideline {
  systemTypeName: string; // Matches systemTypes.name
  guidelineId: string;
  name: string;
  description: string;
  lifespanExtensionEstimate: string;
  costCategory: "free" | "low" | "medium" | "high";
  costEstimate: string;
  implementationNotes: string;
  sortOrder: number;
}

// ============================================
// WATER HEATER (TANK) — 6 PREVENTATIVE CARE GUIDELINES
// Source: convex/data/profiles/tank_water_heater_electric.json
// ============================================

export const waterHeaterTankPreventativeCare: PreventativeCareGuideline[] = [
  {
    systemTypeName: "Water Heater (Tank)",
    guidelineId: "ewh_proactive_anode_replacement",
    name: "Proactive Anode Rod Replacement Program",
    description: "Rather than waiting for the anode rod to fully deplete (by which time tank corrosion may have already started), replace the anode rod on a fixed schedule based on your water chemistry. In moderate water conditions, replace every 4-5 years. In hard water or softened water, replace every 2-3 years. This is the single highest-ROI maintenance investment for a tank water heater — a $25-$35 part that can add 5+ years of life to a $1,200 appliance.",
    lifespanExtensionEstimate: "3-6 additional years depending on water chemistry and rod material selection",
    costCategory: "low",
    costEstimate: "$25-$35 per replacement; $75-$150 total over heater life",
    implementationNotes: "Buy 2-3 rods when you purchase the water heater so you always have one on hand. Use magnesium rods for standard municipal water, aluminum/zinc rods for water with high sulfate content (reduces rotten egg smell), and consider a powered anode rod ($80-$150) if you want a permanent solution that never depletes. Powered (or impressed current) anodes use a small electrical current instead of a sacrificial metal — they last the life of the tank.",
    sortOrder: 1,
  },
  {
    systemTypeName: "Water Heater (Tank)",
    guidelineId: "ewh_install_leak_detector",
    name: "Install a Smart Water Leak Detector",
    description: "A water leak detector placed in the drip pan or on the floor next to the water heater provides an immediate alert when moisture is detected — often hours or days before a small leak becomes a flood. Smart leak detectors (WiFi-connected) can send push notifications to your phone, and some integrate with automatic shutoff valves that can stop the water supply without anyone being home. For an appliance with 'Critical' consequential damage potential, early detection is the highest-value loss prevention strategy available.",
    lifespanExtensionEstimate: "Does not extend lifespan directly, but reduces consequential damage cost from catastrophic failure by 80-95%",
    costCategory: "low",
    costEstimate: "$20-$40 for a basic smart leak detector (Govee, YoLink, Honeywell). $200-$400 for a detector paired with an automatic shutoff valve (Flo by Moen, Phyn, LeakSmart).",
    implementationNotes: "Place the sensor disc flat in the drip pan or on the floor directly below the tank where a leak would collect first. For WiFi models, confirm the signal reaches the detector location — garages and utility closets often have weak coverage. Battery-powered models need annual battery checks. The automatic shutoff valve option provides the greatest protection for homes that are frequently vacant or for vacation homes, but requires professional installation on the main water line.",
    sortOrder: 2,
  },
  {
    systemTypeName: "Water Heater (Tank)",
    guidelineId: "ewh_install_drip_pan_drain",
    name: "Install or Upgrade Drip Pan and Drain Line",
    description: "Every indoor or enclosed water heater installation should have an appropriately sized drip pan with a drain line routed to a visible exterior location or floor drain. The pan catches slow leaks and contains initial water from a tank failure, while the drain line prevents the pan from overflowing. If your water heater was installed without one (common in older construction), adding it is a straightforward project that dramatically reduces catastrophic water damage risk.",
    lifespanExtensionEstimate: "Does not extend lifespan directly, but limits consequential water damage from any leak or failure by containing and routing water away from finished spaces",
    costCategory: "low",
    costEstimate: "$15-$25 for a pan; $30-$80 total with PVC drain line to exterior (materials). Professional installation: $100-$200 if combined with other service.",
    implementationNotes: "The pan should be aluminum or plastic, sized 2-4 inches wider than the tank diameter. A 3/4-inch PVC drain line should be glued (not friction-fit) into the pan fitting and routed to the exterior or to a floor drain with continuous downward slope. Do not run the drain line to a location that is not visible — you want to be able to see if water is coming out. In slab-on-grade homes without floor drains, route to the nearest exterior wall and through to outside.",
    sortOrder: 3,
  },
  {
    systemTypeName: "Water Heater (Tank)",
    guidelineId: "ewh_water_treatment_hard_water",
    name: "Address Hard Water with Treatment or Conditioning",
    description: "If your municipal or well water exceeds 120 ppm (7 gpg) hardness, dissolved minerals will precipitate out of the heated water and accumulate as sediment in the tank — regardless of how often you flush it. A whole-home water softener or conditioning system reduces the mineral load entering the water heater, dramatically slowing sediment accumulation and extending tank, element, and anode rod life. The tradeoff: softened water is slightly more corrosive to the anode rod, so rod replacement frequency increases, but overall system life improves significantly because the tank lining and elements are protected from mineral scale.",
    lifespanExtensionEstimate: "2-4 additional years in hard water areas (>150 ppm). In extremely hard water (>250 ppm, common in Gulf Coast FL and Desert Southwest), the extension can reach 4-6 years.",
    costCategory: "high",
    costEstimate: "$800-$2,500 for a whole-home water softener (installed). $200-$500 for a point-of-entry scale inhibitor system.",
    implementationNotes: "A traditional ion-exchange water softener is the most effective option but requires salt replenishment and produces a brine discharge. Salt-free conditioners (TAC or template-assisted crystallization) do not actually remove minerals but change their structure to reduce scaling — less effective but maintenance-free. For homes with very hard water (>200 ppm), a traditional softener is the better investment. Check the anode rod annually if using a softener, as softened water consumes magnesium rods faster.",
    sortOrder: 4,
  },
  {
    systemTypeName: "Water Heater (Tank)",
    guidelineId: "ewh_pipe_insulation",
    name: "Insulate Hot Water Pipes and Tank",
    description: "Insulating exposed hot water pipes (especially the first 6-10 feet from the water heater) and the tank itself (if it is in an unconditioned space) reduces standby heat loss, allowing the water heater to cycle less frequently. Fewer heating cycles mean less thermal stress on elements, thermostats, and tank fittings — and lower energy bills.",
    lifespanExtensionEstimate: "0.5-1 year lifespan extension from reduced thermal cycling. 5-12% reduction in annual operating cost.",
    costCategory: "low",
    costEstimate: "$15-$40 for pipe insulation sleeves and a water heater blanket",
    implementationNotes: "Use foam pipe insulation sleeves (available in 6-foot sections at any hardware store) on all accessible hot water pipes within 10 feet of the heater. A water heater insulation blanket (R-10 or higher) wraps around the tank exterior. Do NOT insulate over the thermostat access panels, the T&P valve, or the top of the tank. Follow the blanket manufacturer's instructions. For electric water heaters, a blanket is safe on all sides; for gas, additional clearance rules apply.",
    sortOrder: 5,
  },
  {
    systemTypeName: "Water Heater (Tank)",
    guidelineId: "ewh_proactive_replacement_planning",
    name: "Plan Proactive Replacement at 8-10 Years",
    description: "The most effective 'preventative care' for a water heater past year 8 is acknowledging where it sits on the failure curve and planning a controlled replacement before an emergency failure forces your hand. An emergency replacement after a flood costs 20-40% more (emergency plumber rates, water damage mitigation, limited equipment selection) and causes vastly more disruption and damage than a planned swap. Use the Weibull failure curve to understand your risk exposure and make a financial decision, not an emotional one.",
    lifespanExtensionEstimate: "Does not extend lifespan — instead, eliminates the consequential damage cost of an unplanned failure, where the real financial exposure lies",
    costCategory: "medium",
    costEstimate: "Replacement cost is the same whether planned or emergency ($1,200-$2,000), but total cost of emergency failure with water damage can be $10,000-$50,000+",
    implementationNotes: "At year 8, begin budgeting $100-$150/month toward replacement. Get quotes from 2-3 plumbers before you need them — not during a flood. If the tank shows any signs of decline (rusty water, increased sediment, weeping fittings, rumbling noises), accelerate the timeline. The best day to replace a water heater is the day before it fails.",
    sortOrder: 6,
  },
];

// ============================================
// ALL PREVENTATIVE CARE GUIDELINES EXPORT
// ============================================
export const allPreventativeCareGuidelines: PreventativeCareGuideline[] = [
  ...waterHeaterTankPreventativeCare,
];
