"use client";

import { useRouter } from "expo-router";
import { useConvexAuth } from "convex/react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors } from "../../src/theme/tokens";

export default function OnboardingWelcome() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    router.replace("/(auth)/login");
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.title}>Welcome to Kept</Text>
        <Text style={styles.subtitle}>
          Let’s set up your first home so we can start predicting failures and
          optimizing your maintenance plan.
        </Text>

        <View style={styles.benefits}>
          {[
            "Health scores for every system",
            "Personalized maintenance schedules",
            "Lifecycle-based budget forecasting",
            "DIY guides that save money",
          ].map((item) => (
            <View key={item} style={styles.benefitRow}>
              <View style={styles.benefitDot} />
              <Text style={styles.benefitText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.progress}>
          <View style={styles.progressActive} />
          <View style={styles.progressInactive} />
          <View style={styles.progressInactive} />
          <View style={styles.progressInactive} />
        </View>

        <Pressable
          onPress={() => router.push("/onboarding/home")}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    justifyContent: "center",
  },
  heroCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 10,
    lineHeight: 20,
  },
  benefits: {
    marginTop: 16,
    gap: 10,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  benefitDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  benefitText: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  progress: {
    flexDirection: "row",
    gap: 8,
    marginTop: 18,
    marginBottom: 20,
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
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: colors.card,
    fontWeight: "600",
    fontSize: 16,
  },
});
