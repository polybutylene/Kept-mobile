"use client";

import { useMemo } from "react";
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
import { Card, HealthScoreRing, Badge, LoadingState, EmptyHomes, EmptyTasks } from "../../src/components/ui";
import { useState } from "react";

export default function HomeScreen() {
  const router = useRouter();
  const { activeHome, isLoading } = useActiveHome();
  const [refreshing, setRefreshing] = useState(false);

  const tasks = useQuery(
    api.maintenance.getUpcomingTasks,
    activeHome ? { homeId: activeHome._id, limit: 5 } : "skip"
  );

  const systems = useQuery(
    api.systems.getHomeSystems,
    activeHome ? { homeId: activeHome._id } : "skip"
  );

  const pointsProgress = useQuery(
    api.healthPoints.getBundleProgress,
    activeHome ? { homeId: activeHome._id } : "skip"
  );

  const forecast = useQuery(
    api.forecasting.getBudgetForecast,
    activeHome ? { homeId: activeHome._id, years: 1 } : "skip"
  );

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isPastDate = (dateStr: string) => {
    return new Date(dateStr) < new Date();
  };

  const getDaysDiff = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getTaskStatusColor = (status: string, dueDate: string) => {
    if (status === "overdue" || isPastDate(dueDate)) return colors.danger;
    if (status === "due" || getDaysDiff(dueDate) <= 7) return colors.warning;
    if (status === "snoozed") return colors.textMuted;
    return colors.primary;
  };

  const getDiySavings = (task: any) => {
    const proAvg = ((task.proCostLow || 0) + (task.proCostHigh || 0)) / 2;
    const diyAvg = ((task.diyCostLow || 0) + (task.diyCostHigh || 0)) / 2;
    return Math.max(0, Math.round(proAvg - diyAvg));
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "#059669";
    if (score >= 70) return colors.primary;
    if (score >= 50) return colors.warning;
    return colors.danger;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Fair";
    return "Needs Attention";
  };

  if (isLoading) {
    return <LoadingState message="Loading your home..." />;
  }

  if (!activeHome) {
    return (
      <View style={styles.emptyContainer}>
        <EmptyHomes onAdd={() => router.push("/onboarding/home")} />
      </View>
    );
  }

  const hasOverdue = tasks?.some(
    (t) => t.status === "overdue" || isPastDate(t.dueDate)
  );
  const healthScore = activeHome.overallHealthScore ?? 100;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandTitle}>Kept</Text>
          <Text style={styles.brandSubtitle}>Home Intelligence, kept simple.</Text>
        </View>
        <Pressable style={styles.homeSelector} onPress={() => router.push("/settings")}>
          <Text style={styles.homeName} numberOfLines={1}>
            {activeHome.name || "My Home"}
          </Text>
          <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Action Items Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, hasOverdue && styles.sectionTitleDanger]}>
            {hasOverdue ? "Action Required" : "Next Up"}
          </Text>
          <Pressable onPress={() => router.push("/care")}>
            <Text style={styles.viewAll}>View all</Text>
          </Pressable>
        </View>

        {!tasks ? (
          <View style={styles.loadingCards}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={styles.skeletonCard} />
            ))}
          </View>
        ) : tasks.length === 0 ? (
          <EmptyTasks />
        ) : (
          <View style={styles.taskList}>
            {tasks.map((task) => {
              const savings = getDiySavings(task);
              const isOverdue = task.status === "overdue" || isPastDate(task.dueDate);
              const statusColor = getTaskStatusColor(task.status, task.dueDate);

              return (
                <Card
                  key={task._id}
                  padding="sm"
                  borderLeft={statusColor}
                  onPress={() => router.push(`/care/${task._id}`)}
                  style={styles.taskCard}
                >
                  <Text style={styles.taskName} numberOfLines={1}>
                    {task.name}
                  </Text>
                  <Text style={[styles.taskDue, isOverdue && styles.taskDueOverdue]}>
                    {isOverdue ? "Overdue: " : "Due: "}
                    {new Date(task.dueDate).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                  {savings > 0 && (
                    <Text style={styles.taskSavings}>Save ${savings} with DIY</Text>
                  )}
                </Card>
              );
            })}
          </View>
        )}
      </View>

      {/* Financial & Health Row */}
      <View style={styles.gridRow}>
        {/* Financial Health Card */}
        <Card style={styles.gridCard}>
          <Text style={styles.cardLabel}>Financial Health</Text>
          {forecast ? (
            <>
              <Text style={styles.cardValueLarge}>
                {formatCurrency(forecast.summary?.perMonth || 0)}
              </Text>
              <Text style={styles.cardHint}>per month budget</Text>
              <View style={styles.forecastBreakdown}>
                <View style={styles.forecastItem}>
                  <View style={[styles.forecastDot, { backgroundColor: colors.success }]} />
                  <Text style={styles.forecastLabel}>Maintenance</Text>
                </View>
                <View style={styles.forecastItem}>
                  <View style={[styles.forecastDot, { backgroundColor: colors.warning }]} />
                  <Text style={styles.forecastLabel}>Repairs</Text>
                </View>
                <View style={styles.forecastItem}>
                  <View style={[styles.forecastDot, { backgroundColor: colors.danger }]} />
                  <Text style={styles.forecastLabel}>Replacements</Text>
                </View>
              </View>
            </>
          ) : (
            <Text style={styles.cardHint}>Loading forecast...</Text>
          )}
        </Card>

        {/* Home Health Card */}
        <Card style={styles.gridCard}>
          <Text style={styles.cardLabel}>Home Health</Text>
          <View style={styles.healthContent}>
            <View>
              <Text style={[styles.cardValueLarge, { color: getScoreColor(healthScore) }]}>
                {Math.round(healthScore)}
              </Text>
              <Text style={styles.cardHint}>{getScoreLabel(healthScore)}</Text>
            </View>
            <HealthScoreRing score={healthScore} size="sm" showLabel={false} />
          </View>
          {hasOverdue && (
            <View style={styles.healthAlert}>
              <Ionicons name="alert-circle" size={14} color={colors.danger} />
              <Text style={styles.healthAlertText}>Overdue tasks affecting score</Text>
            </View>
          )}
        </Card>
      </View>

      {/* Health Points */}
      {pointsProgress && (
        <Card style={styles.section}>
          <View style={styles.pointsHeader}>
            <View>
              <Text style={styles.cardTitle}>Health Points</Text>
              <Text style={styles.cardHint}>Earn points to unlock milestones</Text>
            </View>
            <View style={styles.pointsValue}>
              <Text style={styles.pointsNumber}>{pointsProgress.currentPoints}</Text>
              <Text style={styles.pointsLifetime}>
                {pointsProgress.lifetimePoints} lifetime
              </Text>
            </View>
          </View>

          {pointsProgress.nextBundle && (
            <View style={styles.progressContainer}>
              <View style={styles.progressLabels}>
                <Text style={styles.progressLabel}>
                  Next: {pointsProgress.nextBundle.name}
                </Text>
                <Text style={styles.progressValue}>
                  {pointsProgress.nextBundle.remainingPoints} pts to go
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${pointsProgress.nextBundle.progressPercent}%` },
                  ]}
                />
              </View>
            </View>
          )}

          <View style={styles.bundleBadges}>
            {pointsProgress.bundles.map((bundle) => (
              <Badge
                key={bundle.key}
                variant={bundle.achievedAt ? "success" : "default"}
              >
                {bundle.name.replace(" Health Bundle", "")}
              </Badge>
            ))}
          </View>
        </Card>
      )}

      {/* My Systems */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Systems</Text>
          <Pressable onPress={() => router.push("/systems")}>
            <Text style={styles.viewAll}>Manage</Text>
          </Pressable>
        </View>

        {!systems ? (
          <View style={styles.systemsRow}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={styles.systemSkeleton} />
            ))}
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.systemsRow}
          >
            {systems.slice(0, 5).map((system) => (
              <Pressable
                key={system._id}
                style={styles.systemCard}
                onPress={() => router.push(`/systems/${system._id}`)}
              >
                <Text style={styles.systemName} numberOfLines={1}>
                  {system.name || system.systemType?.name}
                </Text>
                <Text style={styles.systemLabel}>{getScoreLabel(system.healthScore)}</Text>
                <View style={styles.systemScoreRow}>
                  <Text style={[styles.systemScore, { color: getScoreColor(system.healthScore) }]}>
                    {Math.round(system.healthScore)}
                  </Text>
                  <Text style={styles.systemScoreMax}>/100</Text>
                </View>
              </Pressable>
            ))}
            <Pressable style={styles.systemViewAll} onPress={() => router.push("/systems")}>
              <Ionicons name="arrow-forward" size={20} color={colors.textMuted} />
            </Pressable>
          </ScrollView>
        )}
      </View>

      {/* Something's Wrong Button */}
      <Pressable
        style={styles.troubleButton}
        onPress={() => router.push("/troubleshoot")}
      >
        <View style={styles.troubleIcon}>
          <Ionicons name="help-circle-outline" size={24} color="#FFFFFF" />
        </View>
        <View style={styles.troubleText}>
          <Text style={styles.troubleTitle}>Something's Wrong?</Text>
          <Text style={styles.troubleSubtitle}>Get help troubleshooting an issue</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
      </Pressable>

      {/* Quick Actions Grid */}
      <View style={styles.quickActions}>
        <Pressable style={styles.quickAction} onPress={() => router.push("/home")}>
          <View style={[styles.quickActionIcon, styles.quickActionIconActive]}>
            <Ionicons name="home" size={20} color={colors.primary} />
          </View>
          <Text style={styles.quickActionLabel}>Home</Text>
        </Pressable>
        <Pressable style={styles.quickAction} onPress={() => router.push("/care")}>
          <View style={styles.quickActionIcon}>
            <Ionicons name="construct-outline" size={20} color={colors.textSecondary} />
          </View>
          <Text style={styles.quickActionLabelMuted}>Care</Text>
        </Pressable>
        <Pressable style={styles.quickAction} onPress={() => router.push("/forecast")}>
          <View style={styles.quickActionIcon}>
            <Ionicons name="bar-chart-outline" size={20} color={colors.textSecondary} />
          </View>
          <Text style={styles.quickActionLabelMuted}>Forecast</Text>
        </Pressable>
        <Pressable style={styles.quickAction} onPress={() => router.push("/packet")}>
          <View style={styles.quickActionIcon}>
            <Ionicons name="document-text-outline" size={20} color={colors.textSecondary} />
          </View>
          <Text style={styles.quickActionLabelMuted}>Packet</Text>
        </Pressable>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  brandSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  homeSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: 140,
  },
  homeName: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
    marginRight: 4,
  },
  section: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  sectionTitleDanger: {
    color: colors.danger,
  },
  viewAll: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  loadingCards: {
    gap: 12,
  },
  skeletonCard: {
    height: 72,
    backgroundColor: colors.border,
    borderRadius: 16,
  },
  taskList: {
    gap: 12,
  },
  taskCard: {
    marginBottom: 0,
  },
  taskName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  taskDue: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  taskDueOverdue: {
    color: colors.danger,
    fontWeight: "500",
  },
  taskSavings: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.warning,
    marginTop: 4,
  },
  gridRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  gridCard: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  cardValueLarge: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  cardHint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  forecastBreakdown: {
    marginTop: 12,
    gap: 4,
  },
  forecastItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  forecastDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  forecastLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  healthContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  healthAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  healthAlertText: {
    fontSize: 11,
    color: colors.danger,
  },
  pointsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  pointsValue: {
    alignItems: "flex-end",
  },
  pointsNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.primary,
  },
  pointsLifetime: {
    fontSize: 11,
    color: colors.textMuted,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  progressValue: {
    fontSize: 13,
    color: colors.textMuted,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  bundleBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
  },
  systemsRow: {
    flexDirection: "row",
    gap: 12,
    paddingRight: 20,
  },
  systemSkeleton: {
    width: 130,
    height: 100,
    backgroundColor: colors.border,
    borderRadius: 16,
  },
  systemCard: {
    width: 130,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  systemName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  systemLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
  },
  systemScoreRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 12,
  },
  systemScore: {
    fontSize: 28,
    fontWeight: "700",
  },
  systemScoreMax: {
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: 2,
  },
  systemViewAll: {
    width: 60,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  troubleButton: {
    marginHorizontal: 20,
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F59E0B",
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  troubleIcon: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  troubleText: {
    flex: 1,
  },
  troubleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  troubleSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 20,
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  quickAction: {
    alignItems: "center",
    gap: 8,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionIconActive: {
    backgroundColor: "#CCFBF1",
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  quickActionLabelMuted: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  bottomPadding: {
    height: 40,
  },
});
