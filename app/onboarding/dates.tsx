"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { api } from "../../../convex/_generated/api";
import { colors } from "../../src/theme/tokens";
import {
  clearOnboardingStorage,
  getOnboardingHomeId,
  getOnboardingInstallYears,
  getOnboardingSystemTypeIds,
  setOnboardingInstallYears,
} from "../../src/onboarding/storage";

export default function OnboardingDatesScreen() {
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const systemTypes = useQuery(api.systems.getSystemTypes, {});
  const createSystem = useMutation(api.systems.createSystem);
  const completeOnboarding = useMutation(api.users.completeOnboarding);

  const [homeId, setHomeId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [years, setYears] = useState<Record<string, string | null>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      getOnboardingHomeId(),
      getOnboardingSystemTypeIds(),
      getOnboardingInstallYears(),
    ]).then(([storedHomeId, ids, storedYears]) => {
      setHomeId(storedHomeId);
      setSelectedIds(ids);
      setYears(storedYears);
    });
  }, []);

  if (!isAuthenticated) {
    router.replace("/(auth)/login");
    return null;
  }

  const selectedTypes = useMemo(() => {
    return (systemTypes || []).filter((type) => selectedIds.includes(type._id));
  }, [systemTypes, selectedIds]);

  const handleFinish = async () => {
    if (!homeId) return;
    setIsLoading(true);
    try {
      await setOnboardingInstallYears(years);
      for (const type of selectedTypes) {
        const year = years[type._id];
        await createSystem({
          homeId,
          systemTypeId: type._id,
          installDate: year ? `${year}-01-01` : undefined,
        });
      }
      await completeOnboarding({});
      await clearOnboardingStorage();
      router.replace("/onboarding/complete");
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Install years</Text>
      <Text style={styles.subtitle}>
        Optional. If you know when a system was installed, add the year for better forecasts.
      </Text>

      {selectedTypes.map((type) => (
        <View key={type._id} style={styles.inputGroup}>
          <Text style={styles.label}>{type.name}</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={years[type._id] ?? ""}
            onChangeText={(value) =>
              setYears((prev) => ({ ...prev, [type._id]: value }))
            }
          />
        </View>
      ))}

      <Pressable style={styles.primaryButton} onPress={handleFinish} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color={colors.card} />
        ) : (
          <Text style={styles.primaryButtonText}>Finish Setup</Text>
        )}
      </Pressable>

      <View style={styles.progress}>
        <View style={styles.progressActive} />
        <View style={styles.progressActive} />
        <View style={styles.progressActive} />
        <View style={styles.progressActive} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 6,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.card,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  primaryButtonText: {
    color: colors.card,
    fontWeight: "600",
    fontSize: 16,
  },
  progress: {
    flexDirection: "row",
    gap: 8,
    marginTop: 18,
  },
  progressActive: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
});
