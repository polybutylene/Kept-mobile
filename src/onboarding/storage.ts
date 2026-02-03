import * as SecureStore from "expo-secure-store";

const KEYS = {
  homeId: "onboarding_home_id",
  systemTypeIds: "onboarding_system_type_ids",
  systemInstallYears: "onboarding_system_install_years",
};

export async function setOnboardingHomeId(homeId: string) {
  await SecureStore.setItemAsync(KEYS.homeId, homeId);
}

export async function getOnboardingHomeId() {
  return SecureStore.getItemAsync(KEYS.homeId);
}

export async function setOnboardingSystemTypeIds(ids: string[]) {
  await SecureStore.setItemAsync(KEYS.systemTypeIds, JSON.stringify(ids));
}

export async function getOnboardingSystemTypeIds(): Promise<string[]> {
  const raw = await SecureStore.getItemAsync(KEYS.systemTypeIds);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function setOnboardingInstallYears(
  years: Record<string, string | null>,
) {
  await SecureStore.setItemAsync(KEYS.systemInstallYears, JSON.stringify(years));
}

export async function getOnboardingInstallYears(): Promise<Record<string, string | null>> {
  const raw = await SecureStore.getItemAsync(KEYS.systemInstallYears);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function clearOnboardingStorage() {
  await SecureStore.deleteItemAsync(KEYS.homeId);
  await SecureStore.deleteItemAsync(KEYS.systemTypeIds);
  await SecureStore.deleteItemAsync(KEYS.systemInstallYears);
}
