/**
 * IoT Platform Definitions
 *
 * Each supported manufacturer/cloud platform is defined here with its
 * OAuth URLs, API base, capabilities per device type, supported actions,
 * and recommended poll interval.
 */

export interface PlatformConfig {
  id: string;
  name: string;
  color: string;
  deviceTypes: readonly string[];
  authMethod: "oauth2";
  authUrl: string;
  tokenUrl: string;
  apiBase: string;
  scopes: readonly string[];
  capabilities: Record<string, readonly string[]>;
  actions: Record<string, readonly string[]>;
  pollIntervalMinutes: number;
}

export const IOT_PLATFORMS: Record<string, PlatformConfig> = {
  google_nest: {
    id: "google_nest",
    name: "Google Nest",
    color: "#4285F4",
    deviceTypes: ["thermostat", "smoke_detector"],
    authMethod: "oauth2",
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    apiBase: "https://smartdevicemanagement.googleapis.com/v1",
    scopes: ["https://www.googleapis.com/auth/sdm.service"],
    capabilities: {
      thermostat: ["temperature", "humidity", "hvac_runtime_minutes", "hvac_mode", "target_temperature", "eco_mode"],
      smoke_detector: ["battery_percent", "smoke_detected", "co_detected"],
    },
    actions: {
      thermostat: ["set_temperature", "set_mode", "set_eco"],
    },
    pollIntervalMinutes: 5,
  },

  ecobee: {
    id: "ecobee",
    name: "Ecobee",
    color: "#00B24A",
    deviceTypes: ["thermostat", "sensor"],
    authMethod: "oauth2",
    authUrl: "https://api.ecobee.com/authorize",
    tokenUrl: "https://api.ecobee.com/token",
    apiBase: "https://api.ecobee.com/1",
    scopes: ["smartRead", "smartWrite"],
    capabilities: {
      thermostat: ["temperature", "humidity", "hvac_runtime_minutes", "hvac_mode", "target_temperature", "fan_runtime", "compressor_stage"],
      sensor: ["temperature", "humidity", "occupancy"],
    },
    actions: {
      thermostat: ["set_temperature", "set_mode", "set_hold", "resume_schedule"],
    },
    pollIntervalMinutes: 5,
  },

  flo_moen: {
    id: "flo_moen",
    name: "Flo by Moen",
    color: "#00A4E4",
    deviceTypes: ["water_shutoff", "leak_sensor"],
    authMethod: "oauth2",
    authUrl: "https://api.meetflo.com/api/v2/auth",
    tokenUrl: "https://api.meetflo.com/api/v2/auth/token",
    apiBase: "https://api-gw.meetflo.com/api/v2",
    scopes: [],
    capabilities: {
      water_shutoff: ["water_flow_gallons", "water_pressure_psi", "water_temperature", "valve_state", "leak_detected", "daily_usage_gallons"],
      leak_sensor: ["leak_detected", "temperature", "humidity", "battery_percent"],
    },
    actions: {
      water_shutoff: ["open_valve", "close_valve", "run_health_test"],
    },
    pollIntervalMinutes: 15,
  },

  august_yale: {
    id: "august_yale",
    name: "August / Yale",
    color: "#FF6B35",
    deviceTypes: ["smart_lock"],
    authMethod: "oauth2",
    authUrl: "https://account.august.com/authorize",
    tokenUrl: "https://account.august.com/token",
    apiBase: "https://api.august.com",
    scopes: [],
    capabilities: {
      smart_lock: ["lock_state", "battery_percent", "door_state", "last_activity"],
    },
    actions: {
      smart_lock: ["lock", "unlock", "set_guest_code", "remove_guest_code"],
    },
    pollIntervalMinutes: 15,
  },

  kasa_tp_link: {
    id: "kasa_tp_link",
    name: "Kasa (TP-Link)",
    color: "#4EC6E0",
    deviceTypes: ["smart_plug", "light"],
    authMethod: "oauth2",
    authUrl: "https://wap.tplinkcloud.com",
    tokenUrl: "https://wap.tplinkcloud.com",
    apiBase: "https://wap.tplinkcloud.com",
    scopes: [],
    capabilities: {
      smart_plug: ["energy_kwh", "power_watts", "on_off_state", "runtime_minutes"],
      light: ["on_off_state", "brightness", "color_temperature"],
    },
    actions: {
      smart_plug: ["turn_on", "turn_off"],
      light: ["turn_on", "turn_off", "set_brightness", "set_scene"],
    },
    pollIntervalMinutes: 15,
  },

  honeywell_home: {
    id: "honeywell_home",
    name: "Honeywell Home",
    color: "#DA291C",
    deviceTypes: ["thermostat", "leak_sensor", "water_shutoff"],
    authMethod: "oauth2",
    authUrl: "https://api.honeywell.com/oauth2/authorize",
    tokenUrl: "https://api.honeywell.com/oauth2/token",
    apiBase: "https://api.honeywell.com/v2",
    scopes: [],
    capabilities: {
      thermostat: ["temperature", "humidity", "hvac_runtime_minutes", "hvac_mode", "target_temperature"],
      leak_sensor: ["leak_detected", "temperature", "humidity", "battery_percent"],
      water_shutoff: ["valve_state", "water_flow_gallons", "leak_detected"],
    },
    actions: {
      thermostat: ["set_temperature", "set_mode"],
      water_shutoff: ["open_valve", "close_valve"],
    },
    pollIntervalMinutes: 5,
  },
} as const;

export type PlatformId = keyof typeof IOT_PLATFORMS;

export function getPlatformConfig(platform: string): PlatformConfig | undefined {
  return IOT_PLATFORMS[platform];
}

export function getSupportedPlatforms(): PlatformConfig[] {
  return Object.values(IOT_PLATFORMS);
}
