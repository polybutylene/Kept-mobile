"use node";

/**
 * IoT Platform Adapters
 *
 * Each platform adapter normalizes device data into a common reading format
 * and translates actions into platform-specific API calls. All adapters
 * implement the same PlatformAdapter interface so the sync engine is
 * platform-agnostic.
 */

export interface NormalizedReading {
  readingType: string;
  value: number;
  unit: string;
  timestamp: number;
}

export interface DeviceAction {
  actionType: string;
  parameters: Record<string, any>;
}

export interface DiscoveredDevice {
  externalId: string;
  name: string;
  type: string;
  model: string;
  capabilities: string[];
}

export interface TokenResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface PlatformAdapter {
  authenticate(code: string, redirectUri: string): Promise<TokenResult>;
  refreshToken(refreshToken: string): Promise<TokenResult>;
  listDevices(accessToken: string): Promise<DiscoveredDevice[]>;
  getReadings(accessToken: string, externalDeviceId: string): Promise<NormalizedReading[]>;
  executeAction(accessToken: string, externalDeviceId: string, action: DeviceAction): Promise<{ success: boolean; error?: string }>;
}

// ============================================================
// Ecobee Adapter — Most detailed HVAC runtime data
// ============================================================

export class EcobeeAdapter implements PlatformAdapter {
  private apiBase = "https://api.ecobee.com/1";
  private apiKey = process.env.ECOBEE_API_KEY ?? "";

  async authenticate(code: string, redirectUri: string): Promise<TokenResult> {
    const response = await fetch("https://api.ecobee.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: this.apiKey,
      }),
    });
    const data = await response.json();
    return { accessToken: data.access_token, refreshToken: data.refresh_token, expiresIn: data.expires_in };
  }

  async refreshToken(refreshToken: string): Promise<TokenResult> {
    const response = await fetch("https://api.ecobee.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: this.apiKey,
      }),
    });
    const data = await response.json();
    return { accessToken: data.access_token, refreshToken: data.refresh_token, expiresIn: data.expires_in };
  }

  async listDevices(accessToken: string): Promise<DiscoveredDevice[]> {
    const params = JSON.stringify({
      selection: { selectionType: "registered", selectionMatch: "", includeSettings: true },
    });
    const response = await fetch(`${this.apiBase}/thermostat?json=${encodeURIComponent(params)}`, {
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    });
    const data = await response.json();
    return (data.thermostatList ?? []).map((t: any) => ({
      externalId: t.identifier,
      name: t.name,
      type: "thermostat",
      model: t.modelNumber ?? "Ecobee",
      capabilities: ["temperature", "humidity", "hvac_runtime_minutes", "hvac_mode", "target_temperature", "fan_runtime"],
    }));
  }

  async getReadings(accessToken: string, deviceId: string): Promise<NormalizedReading[]> {
    const params = JSON.stringify({
      selection: {
        selectionType: "thermostats",
        selectionMatch: deviceId,
        includeRuntime: true,
        includeSensors: true,
        includeExtendedRuntime: true,
        includeSettings: true,
      },
    });
    const response = await fetch(`${this.apiBase}/thermostat?json=${encodeURIComponent(params)}`, {
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    });
    const data = await response.json();
    const thermostat = data.thermostatList?.[0];
    if (!thermostat) return [];

    const runtime = thermostat.runtime;
    const now = Date.now();
    const readings: NormalizedReading[] = [];

    if (runtime?.actualTemperature != null) {
      readings.push({ readingType: "temperature", value: runtime.actualTemperature / 10, unit: "°F", timestamp: now });
    }
    if (runtime?.actualHumidity != null) {
      readings.push({ readingType: "humidity", value: runtime.actualHumidity, unit: "%", timestamp: now });
    }

    const ext = thermostat.extendedRuntime;
    if (ext?.runtimeInterval) {
      let coolMin = 0, heatMin = 0, fanMin = 0;
      for (const interval of ext.runtimeInterval) {
        coolMin += (interval.cool1 ?? 0) + (interval.cool2 ?? 0);
        heatMin += (interval.heat1 ?? 0) + (interval.heat2 ?? 0) + (interval.auxHeat1 ?? 0);
        fanMin += interval.fan ?? 0;
      }
      readings.push({ readingType: "hvac_cool_runtime_minutes", value: coolMin, unit: "minutes", timestamp: now });
      readings.push({ readingType: "hvac_heat_runtime_minutes", value: heatMin, unit: "minutes", timestamp: now });
      readings.push({ readingType: "hvac_fan_runtime_minutes", value: fanMin, unit: "minutes", timestamp: now });
      readings.push({ readingType: "hvac_runtime_minutes", value: coolMin + heatMin, unit: "minutes", timestamp: now });
    }

    return readings;
  }

  async executeAction(accessToken: string, deviceId: string, action: DeviceAction): Promise<{ success: boolean; error?: string }> {
    const functions: any[] = [];
    switch (action.actionType) {
      case "set_temperature":
        functions.push({
          type: "setHold",
          params: {
            holdType: "nextTransition",
            coolHoldTemp: (action.parameters.temperature ?? 72) * 10,
            heatHoldTemp: ((action.parameters.temperature ?? 72) - 3) * 10,
          },
        });
        break;
      case "set_mode":
        functions.push({ type: "setHvacMode", params: { mode: action.parameters.mode ?? "auto" } });
        break;
      case "resume_schedule":
        functions.push({ type: "resumeProgram", params: { resumeAll: true } });
        break;
      default:
        return { success: false, error: `Unsupported action: ${action.actionType}` };
    }

    const body = JSON.stringify({
      selection: { selectionType: "thermostats", selectionMatch: deviceId },
      functions,
    });
    const response = await fetch(`${this.apiBase}/thermostat?json=${encodeURIComponent(body)}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    });
    const result = await response.json();
    return { success: result.status?.code === 0, error: result.status?.message };
  }
}

// ============================================================
// Google Nest Adapter — Smart Device Management API
// ============================================================

export class NestAdapter implements PlatformAdapter {
  private apiBase = "https://smartdevicemanagement.googleapis.com/v1";
  private projectId = process.env.NEST_PROJECT_ID ?? "";
  private clientId = process.env.NEST_CLIENT_ID ?? "";
  private clientSecret = process.env.NEST_CLIENT_SECRET ?? "";

  async authenticate(code: string, redirectUri: string): Promise<TokenResult> {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    });
    const data = await response.json();
    return { accessToken: data.access_token, refreshToken: data.refresh_token, expiresIn: data.expires_in };
  }

  async refreshToken(refreshToken: string): Promise<TokenResult> {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    });
    const data = await response.json();
    return { accessToken: data.access_token, refreshToken: data.refresh_token ?? refreshToken, expiresIn: data.expires_in };
  }

  async listDevices(accessToken: string): Promise<DiscoveredDevice[]> {
    const response = await fetch(`${this.apiBase}/enterprises/${this.projectId}/devices`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await response.json();
    return (data.devices ?? []).map((d: any) => {
      const type = d.type?.includes("THERMOSTAT") ? "thermostat" : d.type?.includes("SMOKE") ? "smoke_detector" : "unknown";
      return {
        externalId: d.name?.split("/").pop() ?? d.name,
        name: d.traits?.["sdm.devices.traits.Info"]?.customName ?? d.parentRelations?.[0]?.displayName ?? "Nest Device",
        type,
        model: d.type?.split(".")?.pop() ?? "Nest",
        capabilities: type === "thermostat"
          ? ["temperature", "humidity", "hvac_mode", "target_temperature", "eco_mode"]
          : ["battery_percent", "smoke_detected", "co_detected"],
      };
    });
  }

  async getReadings(accessToken: string, deviceId: string): Promise<NormalizedReading[]> {
    const response = await fetch(`${this.apiBase}/enterprises/${this.projectId}/devices/${deviceId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await response.json();
    const traits = data.traits ?? {};
    const now = Date.now();
    const readings: NormalizedReading[] = [];

    const temp = traits["sdm.devices.traits.Temperature"];
    if (temp?.ambientTemperatureCelsius != null) {
      readings.push({ readingType: "temperature", value: temp.ambientTemperatureCelsius * 9 / 5 + 32, unit: "°F", timestamp: now });
    }

    const humidity = traits["sdm.devices.traits.Humidity"];
    if (humidity?.ambientHumidityPercent != null) {
      readings.push({ readingType: "humidity", value: humidity.ambientHumidityPercent, unit: "%", timestamp: now });
    }

    const hvac = traits["sdm.devices.traits.ThermostatHvac"];
    if (hvac?.status) {
      const modeValue = hvac.status === "COOLING" ? 1 : hvac.status === "HEATING" ? 2 : 0;
      readings.push({ readingType: "hvac_mode", value: modeValue, unit: "mode", timestamp: now });
    }

    return readings;
  }

  async executeAction(accessToken: string, deviceId: string, action: DeviceAction): Promise<{ success: boolean; error?: string }> {
    let command = "";
    let params: any = {};

    switch (action.actionType) {
      case "set_temperature": {
        const tempC = ((action.parameters.temperature ?? 72) - 32) * 5 / 9;
        command = "sdm.devices.commands.ThermostatTemperatureSetpoint.SetCool";
        params = { coolCelsius: tempC };
        break;
      }
      case "set_mode":
        command = "sdm.devices.commands.ThermostatMode.SetMode";
        params = { mode: (action.parameters.mode ?? "HEAT").toUpperCase() };
        break;
      case "set_eco":
        command = "sdm.devices.commands.ThermostatEco.SetMode";
        params = { mode: "MANUAL_ECO" };
        break;
      default:
        return { success: false, error: `Unsupported action: ${action.actionType}` };
    }

    const response = await fetch(
      `${this.apiBase}/enterprises/${this.projectId}/devices/${deviceId}:executeCommand`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ command, params }),
      }
    );
    return { success: response.ok, error: response.ok ? undefined : await response.text() };
  }
}

// ============================================================
// Flo by Moen Adapter — Water shutoff + leak sensors
// ============================================================

export class FloAdapter implements PlatformAdapter {
  private apiBase = "https://api-gw.meetflo.com/api/v2";

  async authenticate(code: string, _redirectUri: string): Promise<TokenResult> {
    const response = await fetch(`${this.apiBase}/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grant_type: "authorization_code", code }),
    });
    const data = await response.json();
    return { accessToken: data.access_token, refreshToken: data.refresh_token, expiresIn: data.expires_in ?? 3600 };
  }

  async refreshToken(refreshToken: string): Promise<TokenResult> {
    const response = await fetch(`${this.apiBase}/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grant_type: "refresh_token", refresh_token: refreshToken }),
    });
    const data = await response.json();
    return { accessToken: data.access_token, refreshToken: data.refresh_token ?? refreshToken, expiresIn: data.expires_in ?? 3600 };
  }

  async listDevices(accessToken: string): Promise<DiscoveredDevice[]> {
    const response = await fetch(`${this.apiBase}/devices`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await response.json();
    return (data.items ?? data ?? []).map((d: any) => ({
      externalId: d.id,
      name: d.nickname ?? d.name ?? "Flo Device",
      type: d.deviceType === "puck" ? "leak_sensor" : "water_shutoff",
      model: d.deviceModel ?? "Flo by Moen",
      capabilities: d.deviceType === "puck"
        ? ["leak_detected", "temperature", "humidity", "battery_percent"]
        : ["water_flow_gallons", "water_pressure_psi", "water_temperature", "valve_state", "leak_detected"],
    }));
  }

  async getReadings(accessToken: string, deviceId: string): Promise<NormalizedReading[]> {
    const response = await fetch(`${this.apiBase}/devices/${deviceId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await response.json();
    const now = Date.now();
    const readings: NormalizedReading[] = [];

    if (data.telemetry) {
      const t = data.telemetry;
      if (t.current?.gpm != null) readings.push({ readingType: "water_flow_gallons", value: t.current.gpm, unit: "gpm", timestamp: now });
      if (t.current?.psi != null) readings.push({ readingType: "water_pressure_psi", value: t.current.psi, unit: "psi", timestamp: now });
      if (t.current?.tempF != null) readings.push({ readingType: "water_temperature", value: t.current.tempF, unit: "°F", timestamp: now });
    }

    if (data.valve?.lastKnown) {
      readings.push({ readingType: "valve_state", value: data.valve.lastKnown === "open" ? 1 : 0, unit: "boolean", timestamp: now });
    }

    if (data.notifications?.pending?.some((n: any) => n.severity === "critical")) {
      readings.push({ readingType: "leak_detected", value: 1, unit: "boolean", timestamp: now });
    }

    if (data.battery?.level != null) {
      readings.push({ readingType: "battery_percent", value: data.battery.level, unit: "%", timestamp: now });
    }

    return readings;
  }

  async executeAction(accessToken: string, deviceId: string, action: DeviceAction): Promise<{ success: boolean; error?: string }> {
    let endpoint = "";
    let body: any = {};

    switch (action.actionType) {
      case "close_valve":
        endpoint = `${this.apiBase}/devices/${deviceId}/valve`;
        body = { target: "closed" };
        break;
      case "open_valve":
        endpoint = `${this.apiBase}/devices/${deviceId}/valve`;
        body = { target: "open" };
        break;
      case "run_health_test":
        endpoint = `${this.apiBase}/devices/${deviceId}/healthTest`;
        body = { type: "full" };
        break;
      default:
        return { success: false, error: `Unsupported action: ${action.actionType}` };
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return { success: response.ok, error: response.ok ? undefined : await response.text() };
  }
}

// ============================================================
// August/Yale Adapter — Smart locks
// ============================================================

export class AugustAdapter implements PlatformAdapter {
  private apiBase = "https://api.august.com";

  async authenticate(code: string, redirectUri: string): Promise<TokenResult> {
    const response = await fetch("https://account.august.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirectUri }),
    });
    const data = await response.json();
    return { accessToken: data.access_token, refreshToken: data.refresh_token, expiresIn: data.expires_in ?? 86400 };
  }

  async refreshToken(refreshToken: string): Promise<TokenResult> {
    const response = await fetch("https://account.august.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken }),
    });
    const data = await response.json();
    return { accessToken: data.access_token, refreshToken: data.refresh_token ?? refreshToken, expiresIn: data.expires_in ?? 86400 };
  }

  async listDevices(accessToken: string): Promise<DiscoveredDevice[]> {
    const response = await fetch(`${this.apiBase}/locks`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await response.json();
    const locks = typeof data === "object" && !Array.isArray(data) ? Object.values(data) : (data ?? []);
    return (locks as any[]).map((l: any) => ({
      externalId: l.LockID ?? l.id,
      name: l.LockName ?? l.name ?? "Smart Lock",
      type: "smart_lock",
      model: l.skuNumber ?? "August Lock",
      capabilities: ["lock_state", "battery_percent", "door_state"],
    }));
  }

  async getReadings(accessToken: string, deviceId: string): Promise<NormalizedReading[]> {
    const response = await fetch(`${this.apiBase}/locks/${deviceId}/status`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await response.json();
    const now = Date.now();
    const readings: NormalizedReading[] = [];

    if (data.status) {
      readings.push({ readingType: "lock_state", value: data.status === "locked" ? 1 : 0, unit: "boolean", timestamp: now });
    }
    if (data.doorState) {
      readings.push({ readingType: "door_state", value: data.doorState === "closed" ? 1 : 0, unit: "boolean", timestamp: now });
    }
    if (data.battery != null) {
      readings.push({ readingType: "battery_percent", value: data.battery, unit: "%", timestamp: now });
    }

    return readings;
  }

  async executeAction(accessToken: string, deviceId: string, action: DeviceAction): Promise<{ success: boolean; error?: string }> {
    let endpoint = "";
    let method = "PUT";

    switch (action.actionType) {
      case "lock":
        endpoint = `${this.apiBase}/locks/${deviceId}/lock`;
        break;
      case "unlock":
        endpoint = `${this.apiBase}/locks/${deviceId}/unlock`;
        break;
      default:
        return { success: false, error: `Unsupported action: ${action.actionType}` };
    }

    const response = await fetch(endpoint, { method, headers: { Authorization: `Bearer ${accessToken}` } });
    return { success: response.ok, error: response.ok ? undefined : await response.text() };
  }
}

// ============================================================
// Kasa (TP-Link) Adapter — Smart plugs + energy monitoring
// ============================================================

export class KasaAdapter implements PlatformAdapter {
  private apiBase = "https://wap.tplinkcloud.com";

  async authenticate(code: string, _redirectUri: string): Promise<TokenResult> {
    const response = await fetch(this.apiBase, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method: "login", params: { token: code } }),
    });
    const data = await response.json();
    return { accessToken: data.result?.token ?? "", refreshToken: "", expiresIn: 86400 };
  }

  async refreshToken(_refreshToken: string): Promise<TokenResult> {
    return { accessToken: "", refreshToken: "", expiresIn: 0 };
  }

  async listDevices(accessToken: string): Promise<DiscoveredDevice[]> {
    const response = await fetch(`${this.apiBase}?token=${accessToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method: "getDeviceList" }),
    });
    const data = await response.json();
    return (data.result?.deviceList ?? []).map((d: any) => ({
      externalId: d.deviceId,
      name: d.alias ?? "Kasa Device",
      type: d.deviceType === "IOT.SMARTPLUGSWITCH" ? "smart_plug" : "light",
      model: d.deviceModel ?? "Kasa",
      capabilities: d.deviceType === "IOT.SMARTPLUGSWITCH"
        ? ["energy_kwh", "power_watts", "on_off_state"]
        : ["on_off_state", "brightness"],
    }));
  }

  async getReadings(accessToken: string, deviceId: string): Promise<NormalizedReading[]> {
    const response = await fetch(`${this.apiBase}?token=${accessToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        method: "passthrough",
        params: { deviceId, requestData: JSON.stringify({ emeter: { get_realtime: {} }, system: { get_sysinfo: {} } }) },
      }),
    });
    const data = await response.json();
    const now = Date.now();
    const readings: NormalizedReading[] = [];

    try {
      const parsed = JSON.parse(data.result?.responseData ?? "{}");
      const emeter = parsed.emeter?.get_realtime;
      if (emeter) {
        if (emeter.power_mw != null) readings.push({ readingType: "power_watts", value: emeter.power_mw / 1000, unit: "W", timestamp: now });
        if (emeter.total_wh != null) readings.push({ readingType: "energy_kwh", value: emeter.total_wh / 1000, unit: "kWh", timestamp: now });
      }
      const sysinfo = parsed.system?.get_sysinfo;
      if (sysinfo?.relay_state != null) {
        readings.push({ readingType: "on_off_state", value: sysinfo.relay_state, unit: "boolean", timestamp: now });
      }
    } catch { /* parse failure — non-critical */ }

    return readings;
  }

  async executeAction(accessToken: string, deviceId: string, action: DeviceAction): Promise<{ success: boolean; error?: string }> {
    let requestData = "";
    switch (action.actionType) {
      case "turn_on":
        requestData = JSON.stringify({ system: { set_relay_state: { state: 1 } } });
        break;
      case "turn_off":
        requestData = JSON.stringify({ system: { set_relay_state: { state: 0 } } });
        break;
      default:
        return { success: false, error: `Unsupported action: ${action.actionType}` };
    }

    const response = await fetch(`${this.apiBase}?token=${accessToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method: "passthrough", params: { deviceId, requestData } }),
    });
    return { success: response.ok };
  }
}

// ============================================================
// Honeywell Home Adapter — Thermostats + water devices
// ============================================================

export class HoneywellAdapter implements PlatformAdapter {
  private apiBase = "https://api.honeywell.com/v2";
  private clientId = process.env.HONEYWELL_CLIENT_ID ?? "";
  private clientSecret = process.env.HONEYWELL_CLIENT_SECRET ?? "";

  async authenticate(code: string, redirectUri: string): Promise<TokenResult> {
    const response = await fetch("https://api.honeywell.com/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirectUri }),
    });
    const data = await response.json();
    return { accessToken: data.access_token, refreshToken: data.refresh_token, expiresIn: data.expires_in };
  }

  async refreshToken(refreshToken: string): Promise<TokenResult> {
    const response = await fetch("https://api.honeywell.com/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken }),
    });
    const data = await response.json();
    return { accessToken: data.access_token, refreshToken: data.refresh_token ?? refreshToken, expiresIn: data.expires_in };
  }

  async listDevices(accessToken: string): Promise<DiscoveredDevice[]> {
    const response = await fetch(`${this.apiBase}/devices?apikey=${this.clientId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await response.json();
    return (data ?? []).map((d: any) => ({
      externalId: d.deviceID,
      name: d.userDefinedDeviceName ?? d.name ?? "Honeywell Device",
      type: d.deviceClass === "Thermostat" ? "thermostat" : d.deviceClass === "LeakDetector" ? "leak_sensor" : "water_shutoff",
      model: d.deviceModel ?? "Honeywell",
      capabilities: d.deviceClass === "Thermostat"
        ? ["temperature", "humidity", "hvac_runtime_minutes", "hvac_mode", "target_temperature"]
        : ["leak_detected", "temperature", "battery_percent"],
    }));
  }

  async getReadings(accessToken: string, deviceId: string): Promise<NormalizedReading[]> {
    const response = await fetch(`${this.apiBase}/devices/thermostats/${deviceId}?apikey=${this.clientId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await response.json();
    const now = Date.now();
    const readings: NormalizedReading[] = [];

    if (data.indoorTemperature != null) {
      readings.push({ readingType: "temperature", value: data.indoorTemperature, unit: "°F", timestamp: now });
    }
    if (data.indoorHumidity != null) {
      readings.push({ readingType: "humidity", value: data.indoorHumidity, unit: "%", timestamp: now });
    }
    if (data.changeableValues?.mode) {
      const mode = data.changeableValues.mode;
      const modeValue = mode === "Cool" ? 1 : mode === "Heat" ? 2 : mode === "Auto" ? 3 : 0;
      readings.push({ readingType: "hvac_mode", value: modeValue, unit: "mode", timestamp: now });
    }

    return readings;
  }

  async executeAction(accessToken: string, deviceId: string, action: DeviceAction): Promise<{ success: boolean; error?: string }> {
    switch (action.actionType) {
      case "set_temperature": {
        const response = await fetch(`${this.apiBase}/devices/thermostats/${deviceId}?apikey=${this.clientId}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: action.parameters.mode ?? "Cool",
            coolSetpoint: action.parameters.temperature ?? 72,
            heatSetpoint: (action.parameters.temperature ?? 72) - 3,
          }),
        });
        return { success: response.ok };
      }
      case "set_mode": {
        const response = await fetch(`${this.apiBase}/devices/thermostats/${deviceId}?apikey=${this.clientId}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ mode: action.parameters.mode ?? "Auto" }),
        });
        return { success: response.ok };
      }
      default:
        return { success: false, error: `Unsupported action: ${action.actionType}` };
    }
  }
}

// ============================================================
// Adapter Factory
// ============================================================

export function getAdapter(platform: string): PlatformAdapter {
  switch (platform) {
    case "google_nest": return new NestAdapter();
    case "ecobee": return new EcobeeAdapter();
    case "flo_moen": return new FloAdapter();
    case "august_yale": return new AugustAdapter();
    case "kasa_tp_link": return new KasaAdapter();
    case "honeywell_home": return new HoneywellAdapter();
    default: throw new Error(`Unsupported IoT platform: ${platform}`);
  }
}
