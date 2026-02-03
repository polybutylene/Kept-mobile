"use client";

import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { colors } from "../../src/theme/tokens";
import { useRouter } from "expo-router";

export default function ManagerOverviewScreen() {
  const router = useRouter();
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.push("/(tabs)/settings")}>
          <Text style={styles.backText}>← Back to Settings</Text>
        </Pressable>
        <Text style={styles.title}>Portfolio Overview</Text>
        <Text style={styles.subtitle}>42 Properties • 312 Systems</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Portfolio Health</Text>
        <Text style={styles.cardValue}>88 / 100</Text>
        <Text style={styles.cardMeta}>5 properties need attention this week</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>CapEx Forecast</Text>
        <Text style={styles.cardValue}>$42k Q3</Text>
        <Text style={styles.cardMeta}>Roof replacement — Building C</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Manager Tools</Text>
        <Pressable
          style={styles.actionCard}
          onPress={() => router.push("/(manager)/inbox")}
        >
          <Text style={styles.actionTitle}>Inbox</Text>
          <Text style={styles.actionSubtitle}>Resident messages and updates</Text>
        </Pressable>
        <Pressable
          style={styles.actionCard}
          onPress={() => router.push("/(manager)/worklogs")}
        >
          <Text style={styles.actionTitle}>Work Logs</Text>
          <Text style={styles.actionSubtitle}>Recent work orders and notes</Text>
        </Pressable>
        <Pressable
          style={styles.actionCard}
          onPress={() => router.push("/(manager)/vendors")}
        >
          <Text style={styles.actionTitle}>Vendors</Text>
          <Text style={styles.actionSubtitle}>Preferred vendors and contacts</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 12,
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
  },
  backText: {
    fontSize: 12,
    color: colors.primary,
    marginBottom: 10,
  },
  card: {
    backgroundColor: colors.card,
    marginHorizontal: 24,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
    marginTop: 6,
  },
  cardMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 8,
  },
  actionCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  actionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
  },
});
