"use client";

import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../../convex/_generated/api";
import { colors } from "../../src/theme/tokens";
import { useActiveHome } from "../../src/hooks/useActiveHome";
import { Card, Badge, HealthScoreRing, LoadingState, EmptySystems } from "../../src/components/ui";

const CATEGORY_FILTERS = [
  { value: "", label: "All" },
  { value: "hvac", label: "HVAC" },
  { value: "plumbing", label: "Plumbing" },
  { value: "electrical", label: "Electrical" },
  { value: "appliances", label: "Appliances" },
  { value: "structural", label: "Structural" },
  { value: "exterior", label: "Exterior" },
];

export default function SystemsScreen() {
  const router = useRouter();
  const { activeHome, isLoading } = useActiveHome();
  const [categoryFilter, setCategoryFilter] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const systems = useQuery(
    api.systems.getHomeSystems,
    activeHome ? { homeId: activeHome._id } : "skip"
  );

  const filteredSystems = systems?.filter((system) => {
    if (!categoryFilter) return true;
    return system.systemType?.category === categoryFilter;
  });

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getHealthGrade = (score: number) => {
    if (score >= 90) return { label: "Excellent", variant: "success" as const };
    if (score >= 70) return { label: "Good", variant: "success" as const };
    if (score >= 50) return { label: "Fair", variant: "warning" as const };
    if (score >= 30) return { label: "Needs Attention", variant: "warning" as const };
    return { label: "Critical", variant: "danger" as const };
  };

  const calculateAge = (installDate?: string, yearBuilt?: number) => {
    const currentYear = new Date().getFullYear();
    if (installDate) {
      return currentYear - new Date(installDate).getFullYear();
    }
    if (yearBuilt) {
      return currentYear - yearBuilt;
    }
    return 0;
  };

  if (isLoading) {
    return <LoadingState message="Loading systems..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Systems</Text>
        <Pressable style={styles.addButton} onPress={() => router.push("/onboarding/systems")}>
          <Ionicons name="add" size={24} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Category Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {CATEGORY_FILTERS.map((filter) => (
            <Pressable
              key={filter.value}
              style={[styles.filterPill, categoryFilter === filter.value && styles.filterPillActive]}
              onPress={() => setCategoryFilter(filter.value)}
            >
              <Text
                style={[
                  styles.filterPillText,
                  categoryFilter === filter.value && styles.filterPillTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Systems List */}
        {systems === undefined ? (
          <View style={styles.loadingSystems}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={styles.skeletonSystem} />
            ))}
          </View>
        ) : filteredSystems?.length === 0 ? (
          categoryFilter ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No systems in this category</Text>
            </Card>
          ) : (
            <EmptySystems onAdd={() => router.push("/onboarding/systems")} />
          )
        ) : (
          <View style={styles.systemsGrid}>
            {filteredSystems?.map((system) => {
              const grade = getHealthGrade(system.healthScore);
              const age = calculateAge(system.installDate, activeHome?.yearBuilt);

              return (
                <Card
                  key={system._id}
                  onPress={() => router.push(`/systems/${system._id}`)}
                  style={styles.systemCard}
                >
                  <View style={styles.systemHeader}>
                    <View style={styles.systemInfo}>
                      <Text style={styles.systemName} numberOfLines={1}>
                        {system.name || system.systemType?.name}
                      </Text>
                      {system.systemType?.category && (
                        <View style={styles.categoryBadge}>
                          <Text style={styles.categoryBadgeText}>
                            {system.systemType.category.toUpperCase()}
                          </Text>
                        </View>
                      )}
                    </View>
                    <HealthScoreRing score={system.healthScore} size="sm" showLabel={false} />
                  </View>

                  <View style={styles.systemMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
                      <Text style={styles.metaText}>
                        {age > 0 ? `${age} years old` : "Age unknown"}
                      </Text>
                    </View>
                    {system.systemType?.defaultLifespanYears && (
                      <Text style={styles.lifespanText}>
                        / {system.systemType.defaultLifespanYears} yr lifespan
                      </Text>
                    )}
                  </View>

                  {system.manufacturer && (
                    <Text style={styles.manufacturerText} numberOfLines={1}>
                      {system.manufacturer} {system.modelNumber || ""}
                    </Text>
                  )}

                  <View style={styles.systemFooter}>
                    <Badge variant={grade.variant}>{grade.label}</Badge>
                    {system.needsAttention && (
                      <View style={styles.attentionBadge}>
                        <Ionicons name="alert-circle" size={14} color={colors.danger} />
                        <Text style={styles.attentionText}>Needs Attention</Text>
                      </View>
                    )}
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  addButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#CCFBF1",
    borderRadius: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  filterPillTextActive: {
    color: "#FFFFFF",
  },
  loadingSystems: {
    gap: 12,
  },
  skeletonSystem: {
    height: 140,
    backgroundColor: colors.border,
    borderRadius: 16,
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  systemsGrid: {
    gap: 12,
  },
  systemCard: {
    marginBottom: 0,
  },
  systemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  systemInfo: {
    flex: 1,
  },
  systemName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  categoryBadge: {
    backgroundColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  systemMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  lifespanText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  manufacturerText: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  systemFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  attentionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  attentionText: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.danger,
  },
  bottomPadding: {
    height: 40,
  },
});
