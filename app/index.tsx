"use client";

import { useRouter } from "expo-router";
import { useConvexAuth } from "convex/react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors } from "../src/theme/tokens";

export default function LandingScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isAuthenticated) {
    router.replace("/(tabs)");
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Kept Home Intelligence</Text>
        <Text style={styles.title}>Know what your home needs before it breaks.</Text>
        <Text style={styles.subtitle}>
          Scan model plates, forecast failures, and automate maintenance for every system
          in your home or portfolio.
        </Text>

        <View style={styles.ctaGroup}>
          <Pressable onPress={() => router.push("/(auth)/login")} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/(auth)/login")} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Sign In</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.previewWrap}>
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>Live Preview</Text>
          <Text style={styles.previewSubtitle}>
            Your home’s health score, risk alerts, and forecasted costs — all in one place.
          </Text>

          <View style={styles.previewSection}>
            <View style={styles.previewTile}>
              <Text style={styles.previewLabel}>Overall Health</Text>
              <Text style={styles.previewValue}>92 / 100</Text>
              <View style={styles.progressTrack}>
                <View style={styles.progressFill} />
              </View>
            </View>

            <View style={styles.previewTile}>
              <Text style={styles.previewLabel}>Next Maintenance</Text>
              <Text style={styles.previewTask}>HVAC Filter Replacement</Text>
              <Text style={styles.previewDue}>Due in 3 days</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 40,
  },
  kicker: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    lineHeight: 24,
  },
  ctaGroup: {
    marginTop: 28,
    gap: 12,
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
  secondaryButton: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontWeight: "600",
    fontSize: 16,
  },
  previewWrap: {
    paddingHorizontal: 24,
    paddingBottom: 64,
  },
  previewCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  previewSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
  },
  previewSection: {
    marginTop: 16,
    gap: 12,
  },
  previewTile: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  previewLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  previewValue: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: 6,
  },
  progressTrack: {
    marginTop: 10,
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.border,
  },
  progressFill: {
    height: 8,
    borderRadius: 999,
    width: "92%",
    backgroundColor: colors.primary,
  },
  previewTask: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
    marginTop: 6,
  },
  previewDue: {
    fontSize: 12,
    color: colors.warning,
    marginTop: 6,
  },
});
