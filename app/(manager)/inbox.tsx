"use client";

import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { colors } from "../../src/theme/tokens";
import { useRouter } from "expo-router";

export default function ManagerInboxScreen() {
  const router = useRouter();
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.push("/(manager)")}>
          <Text style={styles.backText}>← Manager Overview</Text>
        </Pressable>
        <Text style={styles.title}>Inbox</Text>
        <Text style={styles.subtitle}>Communication hub</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Unit 4B — Leak reported</Text>
        <Text style={styles.cardMeta}>Today • 2:14 PM</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Building C — HVAC noise</Text>
        <Text style={styles.cardMeta}>Yesterday • 5:40 PM</Text>
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
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  cardMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
  },
});
