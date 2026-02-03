"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { useConvexAuth, useQuery } from "convex/react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { api } from "../../../convex/_generated/api";
import { colors } from "../../src/theme/tokens";
import {
  getOnboardingHomeId,
  getOnboardingSystemTypeIds,
  setOnboardingSystemTypeIds,
} from "../../src/onboarding/storage";

export default function OnboardingSystemsScreen() {
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const systemTypes = useQuery(api.systems.getSystemTypes, {});

  const [selected, setSelected] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getOnboardingSystemTypeIds().then(setSelected);
  }, []);

  if (!isAuthenticated) {
    router.replace("/(auth)/login");
    return null;
  }

  const grouped = useMemo(() => {
    const groups: Record<string, typeof systemTypes> = {};
    (systemTypes || []).forEach((type) => {
      if (!groups[type.category]) groups[type.category] = [];
      groups[type.category].push(type);
    });
    return groups;
  }, [systemTypes]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleContinue = async () => {
    setIsLoading(true);
    await setOnboardingSystemTypeIds(selected);
    router.push("/onboarding/dates");
    setIsLoading(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Select your systems</Text>
      <Text style={styles.subtitle}>
        Choose the systems you have now. You can add more later.
      </Text>

      {!systemTypes && (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {systemTypes && Object.keys(grouped).map((category) => (
        <View key={category} style={styles.group}>
          <Text style={styles.groupTitle}>{category.toUpperCase()}</Text>
          <View style={styles.chipWrap}>
            {grouped[category]?.map((type) => {
              const isActive = selected.includes(type._id);
              return (
                <Pressable
                  key={type._id}
                  onPress={() => toggle(type._id)}
                  style={[
                    styles.chip,
                    isActive && styles.chipActive,
                  ]}
                >
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                    {type.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}

      <Pressable
        style={[styles.primaryButton, selected.length === 0 && styles.buttonDisabled]}
        onPress={handleContinue}
        disabled={selected.length === 0 || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.card} />
        ) : (
          <Text style={styles.primaryButtonText}>Continue</Text>
        )}
      </Pressable>

      <View style={styles.progress}>
        <View style={styles.progressActive} />
        <View style={styles.progressActive} />
        <View style={styles.progressActive} />
        <View style={styles.progressInactive} />
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
  loadingWrap: {
    alignItems: "center",
    marginTop: 20,
  },
  group: {
    marginBottom: 16,
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 8,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.card,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: colors.textPrimary,
  },
  chipTextActive: {
    color: colors.card,
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
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
  progressInactive: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.border,
  },
});
