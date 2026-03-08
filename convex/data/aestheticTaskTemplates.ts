export const AESTHETIC_TASK_TEMPLATES = [
  // Landscaping
  { category: "landscaping" as const, name: "Lawn mowing", frequencyMonths: 0.5, seasonPreference: "spring,summer,fall", estimatedTimeMinutes: 60, diyCostLow: 0, diyCostHigh: 20, proCostLow: 40, proCostHigh: 80 },
  { category: "landscaping" as const, name: "Hedge trimming", frequencyMonths: 3, seasonPreference: "spring,summer", estimatedTimeMinutes: 90, diyCostLow: 0, diyCostHigh: 15, proCostLow: 60, proCostHigh: 150 },
  { category: "landscaping" as const, name: "Flower bed maintenance", frequencyMonths: 3, seasonPreference: "spring,summer", estimatedTimeMinutes: 60, diyCostLow: 20, diyCostHigh: 50, proCostLow: 75, proCostHigh: 150 },
  { category: "landscaping" as const, name: "Mulch refresh", frequencyMonths: 6, seasonPreference: "spring,fall", estimatedTimeMinutes: 120, diyCostLow: 40, diyCostHigh: 100, proCostLow: 150, proCostHigh: 350 },
  { category: "landscaping" as const, name: "Irrigation system check", frequencyMonths: 6, seasonPreference: "spring", estimatedTimeMinutes: 30, diyCostLow: 0, diyCostHigh: 10, proCostLow: 50, proCostHigh: 100 },
  { category: "landscaping" as const, name: "Tree trimming", frequencyMonths: 12, seasonPreference: "winter", estimatedTimeMinutes: 180, diyCostLow: 30, diyCostHigh: 80, proCostLow: 200, proCostHigh: 600 },
  { category: "landscaping" as const, name: "Leaf removal", frequencyMonths: 12, seasonPreference: "fall", estimatedTimeMinutes: 120, diyCostLow: 0, diyCostHigh: 20, proCostLow: 50, proCostHigh: 120 },

  // Exterior cleaning
  { category: "exterior_cleaning" as const, name: "Driveway pressure washing", frequencyMonths: 6, seasonPreference: "spring,fall", estimatedTimeMinutes: 120, diyCostLow: 20, diyCostHigh: 40, proCostLow: 100, proCostHigh: 250 },
  { category: "exterior_cleaning" as const, name: "Patio/deck pressure washing", frequencyMonths: 3, seasonPreference: "spring,summer", estimatedTimeMinutes: 90, diyCostLow: 15, diyCostHigh: 30, proCostLow: 80, proCostHigh: 200 },
  { category: "exterior_cleaning" as const, name: "Exterior wall soft wash", frequencyMonths: 12, seasonPreference: "spring", estimatedTimeMinutes: 240, diyCostLow: 30, diyCostHigh: 60, proCostLow: 200, proCostHigh: 500 },
  { category: "exterior_cleaning" as const, name: "Window cleaning - exterior", frequencyMonths: 3, seasonPreference: "any", estimatedTimeMinutes: 120, diyCostLow: 10, diyCostHigh: 25, proCostLow: 80, proCostHigh: 200 },
  { category: "exterior_cleaning" as const, name: "Gutter cleaning", frequencyMonths: 6, seasonPreference: "spring,fall", estimatedTimeMinutes: 90, diyCostLow: 0, diyCostHigh: 10, proCostLow: 75, proCostHigh: 200 },
  { category: "exterior_cleaning" as const, name: "Pool deck cleaning", frequencyMonths: 1, seasonPreference: "spring,summer,fall", estimatedTimeMinutes: 60, diyCostLow: 10, diyCostHigh: 20, proCostLow: 50, proCostHigh: 100 },
  { category: "exterior_cleaning" as const, name: "Fence cleaning", frequencyMonths: 12, seasonPreference: "spring", estimatedTimeMinutes: 120, diyCostLow: 15, diyCostHigh: 30, proCostLow: 100, proCostHigh: 250 },
  { category: "exterior_cleaning" as const, name: "Roof soft wash", frequencyMonths: 12, seasonPreference: "spring,fall", estimatedTimeMinutes: 180, diyCostLow: 40, diyCostHigh: 80, proCostLow: 250, proCostHigh: 600 },

  // Interior aesthetics
  { category: "interior_aesthetics" as const, name: "Deep cleaning (beyond turnover)", frequencyMonths: 3, seasonPreference: "any", estimatedTimeMinutes: 240, diyCostLow: 30, diyCostHigh: 60, proCostLow: 150, proCostHigh: 350 },
  { category: "interior_aesthetics" as const, name: "Carpet deep clean / steam", frequencyMonths: 6, seasonPreference: "any", estimatedTimeMinutes: 180, diyCostLow: 40, diyCostHigh: 80, proCostLow: 100, proCostHigh: 300 },
  { category: "interior_aesthetics" as const, name: "Window cleaning - interior", frequencyMonths: 3, seasonPreference: "any", estimatedTimeMinutes: 60, diyCostLow: 5, diyCostHigh: 15, proCostLow: 50, proCostHigh: 120 },
  { category: "interior_aesthetics" as const, name: "Paint touch-ups", frequencyMonths: 12, seasonPreference: "any", estimatedTimeMinutes: 120, diyCostLow: 20, diyCostHigh: 50, proCostLow: 100, proCostHigh: 300 },
  { category: "interior_aesthetics" as const, name: "Grout cleaning and resealing", frequencyMonths: 12, seasonPreference: "any", estimatedTimeMinutes: 180, diyCostLow: 25, diyCostHigh: 60, proCostLow: 150, proCostHigh: 400 },
  { category: "interior_aesthetics" as const, name: "Furniture and upholstery deep clean", frequencyMonths: 6, seasonPreference: "any", estimatedTimeMinutes: 120, diyCostLow: 20, diyCostHigh: 40, proCostLow: 100, proCostHigh: 250 },
];
