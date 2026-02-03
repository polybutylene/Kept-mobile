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
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { colors } from "../../src/theme/tokens";
import { Card, Badge, HealthScoreRing, LoadingState } from "../../src/components/ui";

type TabType = "overview" | "tasks" | "issues" | "library";

const SEVERITY_COLORS: Record<string, { bg: string; text: string }> = {
  minor: { bg: "#F3F4F6", text: colors.textSecondary },
  moderate: { bg: "#FEF3C7", text: "#92400E" },
  major: { bg: "#FED7AA", text: "#9A3412" },
  critical: { bg: "#FEE2E2", text: "#991B1B" },
};

const DIFFICULTY_INFO: Record<string, { label: string; bg: string; text: string }> = {
  easy: { label: "Easy", bg: "#D1FAE5", text: "#065F46" },
  moderate: { label: "Moderate", bg: "#FEF3C7", text: "#92400E" },
  hard: { label: "Hard", bg: "#FED7AA", text: "#9A3412" },
  pro_only: { label: "Pro Only", bg: "#FEE2E2", text: "#991B1B" },
};

export default function SystemDetailScreen() {
  const { systemId } = useLocalSearchParams<{ systemId: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [refreshing, setRefreshing] = useState(false);

  const system = useQuery(
    api.systems.getSystem,
    systemId ? { systemId: systemId as Id<"systems"> } : "skip"
  );

  const systemTasks = useQuery(
    api.maintenance.getTasksForSystem,
    systemId ? { systemId: systemId as Id<"systems">, includeCompleted: true } : "skip"
  );

  const issues = useQuery(
    api.issues.getIssuesForSystem,
    systemId ? { systemId: systemId as Id<"systems"> } : "skip"
  );

  const templates = useQuery(
    api.maintenance.getTemplatesForSystemType,
    system?.systemTypeId ? { systemTypeId: system.systemTypeId } : "skip"
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      year: "numeric",
    });
  };

  const isPastDate = (dateStr: string) => new Date(dateStr) < new Date();

  if (!system) {
    return <LoadingState message="Loading system details..." />;
  }

  // Calculate system age
  let systemAge = 0;
  if (system.installDate) {
    const installDate = new Date(system.installDate);
    const now = new Date();
    systemAge = Math.round(((now.getTime() - installDate.getTime()) / (1000 * 60 * 60 * 24 * 365)) * 10) / 10;
  }

  const activeTasks = systemTasks?.filter((t) => !["completed", "skipped"].includes(t.status)) || [];
  const completedTasks = systemTasks?.filter((t) => t.status === "completed") || [];
  const overdueTasks = activeTasks.filter((t) => t.status === "overdue" || isPastDate(t.dueDate));

  const tabs: { value: TabType; label: string }[] = [
    { value: "overview", label: "Overview" },
    { value: "tasks", label: "Tasks" },
    { value: "issues", label: "Issues" },
    { value: "library", label: "DIY Library" },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {system.name || system.systemType?.name}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* System Header Card */}
        <Card style={styles.headerCard}>
          <View style={styles.headerRow}>
            <HealthScoreRing score={system.healthScore} size="md" />
            <View style={styles.headerInfo}>
              <Text style={styles.systemName}>{system.name || system.systemType?.name}</Text>
              <Text style={styles.systemCategory}>{system.systemType?.category}</Text>

              <View style={styles.headerMeta}>
                {system.installDate && (
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar" size={14} color={colors.textMuted} />
                    <Text style={styles.metaText}>Installed {formatDate(system.installDate)}</Text>
                  </View>
                )}
                {systemAge > 0 && (
                  <View style={styles.metaItem}>
                    <Ionicons name="time" size={14} color={colors.textMuted} />
                    <Text style={styles.metaText}>{systemAge} years old</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{activeTasks.length}</Text>
              <Text style={styles.statLabel}>Active Tasks</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, overdueTasks.length > 0 && styles.statValueDanger]}>
                {overdueTasks.length}
              </Text>
              <Text style={styles.statLabel}>Overdue</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, styles.statValueSuccess]}>{completedTasks.length}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
        </Card>

        {/* Tab Navigation */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabRow}
        >
          {tabs.map((tab) => (
            <Pressable
              key={tab.value}
              style={[styles.tab, activeTab === tab.value && styles.tabActive]}
              onPress={() => setActiveTab(tab.value)}
            >
              <Text style={[styles.tabText, activeTab === tab.value && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <View style={styles.tabContent}>
            {/* Lifecycle Forecast */}
            {system.estimatedReplacementYear && (
              <Card style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="trending-up" size={20} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Lifecycle Forecast</Text>
                </View>

                <View style={styles.lifecycleContent}>
                  <View style={styles.lifecycleRow}>
                    <Text style={styles.lifecycleLabel}>Remaining Life</Text>
                    <Text style={styles.lifecycleValue}>
                      {system.remainingLifePercent ? `${Math.round(system.remainingLifePercent)}%` : "—"}
                    </Text>
                  </View>

                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${system.remainingLifePercent || 0}%`,
                          backgroundColor:
                            (system.remainingLifePercent || 0) > 50
                              ? colors.success
                              : (system.remainingLifePercent || 0) > 25
                                ? colors.warning
                                : colors.danger,
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.lifecycleMeta}>
                    <View>
                      <Text style={styles.metaLabel}>Expected Replacement</Text>
                      <Text style={styles.metaValue}>{system.estimatedReplacementYear}</Text>
                    </View>
                    {system.estimatedReplacementCost && (
                      <View style={styles.metaRight}>
                        <Text style={styles.metaLabel}>Estimated Cost</Text>
                        <Text style={styles.metaValue}>
                          {formatCurrency(system.estimatedReplacementCost)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </Card>
            )}

            {/* Top Issues Preview */}
            {issues && issues.length > 0 && (
              <Card style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="alert-circle" size={20} color={colors.warning} />
                    <Text style={styles.sectionTitle}>Top Risks at {Math.round(systemAge)} Years</Text>
                  </View>
                  <Pressable onPress={() => setActiveTab("issues")}>
                    <Text style={styles.seeAll}>See all</Text>
                  </Pressable>
                </View>

                {issues.slice(0, 3).map((issue) => (
                  <View key={issue._id} style={styles.issuePreview}>
                    <View>
                      <Text style={styles.issueName}>{issue.issueName}</Text>
                      <View
                        style={[
                          styles.severityBadge,
                          { backgroundColor: SEVERITY_COLORS[issue.severity]?.bg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.severityText,
                            { color: SEVERITY_COLORS[issue.severity]?.text },
                          ]}
                        >
                          {issue.severity}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.issueProbability}>
                      <Text style={styles.probabilityValue}>{issue.currentProbability}%</Text>
                      <Text style={styles.probabilityLabel}>likelihood</Text>
                    </View>
                  </View>
                ))}
              </Card>
            )}

            {/* Upcoming Tasks Preview */}
            {activeTasks.length > 0 && (
              <Card style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="construct" size={20} color={colors.primary} />
                    <Text style={styles.sectionTitle}>Upcoming Maintenance</Text>
                  </View>
                  <Pressable onPress={() => setActiveTab("tasks")}>
                    <Text style={styles.seeAll}>See all</Text>
                  </Pressable>
                </View>

                {activeTasks.slice(0, 3).map((task) => {
                  const isOverdue = task.status === "overdue" || isPastDate(task.dueDate);
                  return (
                    <Pressable
                      key={task._id}
                      style={styles.taskPreview}
                      onPress={() => router.push(`/care/${task._id}`)}
                    >
                      <View style={styles.taskInfo}>
                        <View
                          style={[
                            styles.taskDot,
                            { backgroundColor: isOverdue ? colors.danger : colors.primary },
                          ]}
                        />
                        <Text style={styles.taskName}>{task.name}</Text>
                      </View>
                      <View style={styles.taskRight}>
                        <Text style={[styles.taskDate, isOverdue && styles.taskDateOverdue]}>
                          {isOverdue ? "Overdue" : formatDate(task.dueDate)}
                        </Text>
                        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                      </View>
                    </Pressable>
                  );
                })}
              </Card>
            )}
          </View>
        )}

        {activeTab === "tasks" && (
          <View style={styles.tabContent}>
            {systemTasks?.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Ionicons name="checkmark-circle" size={48} color={colors.border} />
                <Text style={styles.emptyTitle}>No maintenance tasks</Text>
                <Text style={styles.emptyText}>Tasks will appear when you add this system</Text>
              </Card>
            ) : (
              <>
                {activeTasks.length > 0 && (
                  <View style={styles.taskSection}>
                    <Text style={styles.taskSectionTitle}>Active ({activeTasks.length})</Text>
                    {activeTasks.map((task) => {
                      const isOverdue = task.status === "overdue" || isPastDate(task.dueDate);
                      return (
                        <Card
                          key={task._id}
                          onPress={() => router.push(`/care/${task._id}`)}
                          borderLeft={isOverdue ? colors.danger : colors.primary}
                          style={styles.taskCard}
                        >
                          <Text style={styles.taskCardName}>{task.name}</Text>
                          <Text style={[styles.taskCardDate, isOverdue && styles.taskCardDateOverdue]}>
                            {isOverdue ? "Overdue" : `Due ${formatDate(task.dueDate)}`}
                          </Text>
                        </Card>
                      );
                    })}
                  </View>
                )}

                {completedTasks.length > 0 && (
                  <View style={styles.taskSection}>
                    <Text style={styles.taskSectionTitle}>Completed ({completedTasks.length})</Text>
                    {completedTasks.slice(0, 10).map((task) => (
                      <Card
                        key={task._id}
                        onPress={() => router.push(`/care/${task._id}`)}
                        style={[styles.taskCard, styles.taskCardCompleted]}
                      >
                        <View style={styles.completedRow}>
                          <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                          <View>
                            <Text style={styles.taskCardNameCompleted}>{task.name}</Text>
                            <Text style={styles.taskCardDateCompleted}>
                              Completed {task.completedDate && formatDate(task.completedDate)}
                            </Text>
                          </View>
                        </View>
                      </Card>
                    ))}
                  </View>
                )}
              </>
            )}
          </View>
        )}

        {activeTab === "issues" && (
          <View style={styles.tabContent}>
            {!issues || issues.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Ionicons name="checkmark-circle" size={48} color={colors.border} />
                <Text style={styles.emptyTitle}>No known issues tracked</Text>
                <Text style={styles.emptyText}>Issue data coming soon</Text>
              </Card>
            ) : (
              <>
                <Text style={styles.issuesIntro}>
                  Based on your system's age ({Math.round(systemAge)} years), here are the most likely issues:
                </Text>
                {issues.map((issue) => (
                  <Card key={issue._id} style={styles.issueCard}>
                    <View style={styles.issueHeader}>
                      <View style={styles.issueInfo}>
                        <Text style={styles.issueCardName}>{issue.issueName}</Text>
                        <View
                          style={[
                            styles.severityBadge,
                            { backgroundColor: SEVERITY_COLORS[issue.severity]?.bg },
                          ]}
                        >
                          <Text
                            style={[
                              styles.severityText,
                              { color: SEVERITY_COLORS[issue.severity]?.text },
                            ]}
                          >
                            {issue.severity}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.issueRisk}>
                        <Text style={styles.riskValue}>{issue.currentProbability}%</Text>
                        <Text style={styles.riskLabel}>current risk</Text>
                      </View>
                    </View>

                    <Text style={styles.issueDescription}>{issue.description}</Text>

                    {/* Probability Timeline */}
                    <View style={styles.probabilityTimeline}>
                      <View style={styles.probabilityBar}>
                        <View
                          style={[
                            styles.probabilityFill,
                            {
                              width: `${issue.currentProbability}%`,
                              backgroundColor:
                                issue.currentProbability > 50
                                  ? colors.danger
                                  : issue.currentProbability > 25
                                    ? colors.warning
                                    : colors.success,
                            },
                          ]}
                        />
                      </View>
                      <View style={styles.probabilityLabels}>
                        <Text style={styles.probLabel}>Now: {issue.currentProbability}%</Text>
                        <Text style={styles.probLabel}>3yr: {issue.probability3yr}%</Text>
                        <Text style={styles.probLabel}>5yr: {issue.probability5yr}%</Text>
                      </View>
                    </View>

                    {/* Cost */}
                    <View style={styles.issueCost}>
                      <Text style={styles.costLabel}>Repair cost range</Text>
                      <Text style={styles.costValue}>
                        {formatCurrency(issue.repairCostLow)} - {formatCurrency(issue.repairCostHigh)}
                      </Text>
                    </View>

                    {issue.isDiyFixable && (
                      <View style={styles.diyBadge}>
                        <Ionicons name="construct" size={14} color="#065F46" />
                        <Text style={styles.diyText}>
                          DIY fixable ({issue.diyDifficulty || "moderate"})
                        </Text>
                      </View>
                    )}
                  </Card>
                ))}
              </>
            )}
          </View>
        )}

        {activeTab === "library" && (
          <View style={styles.tabContent}>
            {!templates || templates.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Ionicons name="book" size={48} color={colors.border} />
                <Text style={styles.emptyTitle}>No DIY guides available</Text>
                <Text style={styles.emptyText}>Guides coming soon for this system type</Text>
              </Card>
            ) : (
              <>
                <Text style={styles.libraryIntro}>
                  {templates.length} maintenance guides for {system.systemType?.name}
                </Text>
                {templates.map((template) => {
                  const difficulty = DIFFICULTY_INFO[template.difficulty];
                  return (
                    <Card key={template._id} style={styles.templateCard}>
                      <Text style={styles.templateName}>{template.name}</Text>
                      <Text style={styles.templateDescription} numberOfLines={2}>
                        {template.description}
                      </Text>

                      <View style={styles.templateMeta}>
                        {difficulty && (
                          <View style={[styles.difficultyBadge, { backgroundColor: difficulty.bg }]}>
                            <Ionicons name="construct" size={10} color={difficulty.text} />
                            <Text style={[styles.difficultyText, { color: difficulty.text }]}>
                              {difficulty.label}
                            </Text>
                          </View>
                        )}
                        {template.estimatedTimeMinutes && (
                          <View style={styles.timeBadge}>
                            <Ionicons name="time" size={10} color={colors.textSecondary} />
                            <Text style={styles.timeText}>{template.estimatedTimeMinutes} min</Text>
                          </View>
                        )}
                        <View style={styles.freqBadge}>
                          <Text style={styles.freqText}>Every {template.frequencyMonths} mo</Text>
                        </View>
                      </View>

                      {(template.diyCostLow || template.proCostLow) && (
                        <View style={styles.templateCost}>
                          <Text style={styles.costLabel}>DIY</Text>
                          <Text style={styles.diyCost}>{formatCurrency(template.diyCostLow || 0)}</Text>
                        </View>
                      )}
                    </Card>
                  );
                })}
              </>
            )}
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
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    color: colors.textPrimary,
    textAlign: "center",
    marginHorizontal: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  headerCard: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    gap: 16,
  },
  headerInfo: {
    flex: 1,
  },
  systemName: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  systemCategory: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
    textTransform: "capitalize",
  },
  headerMeta: {
    marginTop: 12,
    gap: 4,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: "row",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  statValueDanger: {
    color: colors.danger,
  },
  statValueSuccess: {
    color: colors.success,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  tabRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  tabContent: {
    gap: 12,
  },
  section: {
    marginBottom: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.primary,
  },
  lifecycleContent: {
    marginTop: 12,
  },
  lifecycleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  lifecycleLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  lifecycleValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  lifecycleMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  metaLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  metaValue: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
    marginTop: 2,
  },
  metaRight: {
    alignItems: "flex-end",
  },
  issuePreview: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.border,
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  issueName: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  severityText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  issueProbability: {
    alignItems: "flex-end",
  },
  probabilityValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  probabilityLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  taskPreview: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.border,
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  taskInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  taskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  taskName: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  taskRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  taskDate: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  taskDateOverdue: {
    color: colors.danger,
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  taskSection: {
    marginBottom: 16,
  },
  taskSectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  taskCard: {
    marginBottom: 8,
  },
  taskCardCompleted: {
    opacity: 0.75,
  },
  taskCardName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  taskCardDate: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  taskCardDateOverdue: {
    color: colors.danger,
  },
  completedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  taskCardNameCompleted: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textMuted,
    textDecorationLine: "line-through",
  },
  taskCardDateCompleted: {
    fontSize: 12,
    color: colors.textMuted,
  },
  issuesIntro: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  issueCard: {
    marginBottom: 12,
  },
  issueHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  issueInfo: {
    flex: 1,
  },
  issueCardName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  issueRisk: {
    alignItems: "flex-end",
  },
  riskValue: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  riskLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  issueDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 8,
    lineHeight: 18,
  },
  probabilityTimeline: {
    marginTop: 12,
  },
  probabilityBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  probabilityFill: {
    height: "100%",
    borderRadius: 3,
  },
  probabilityLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  probLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  issueCost: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.border,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  costLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  costValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  diyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  diyText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#065F46",
  },
  libraryIntro: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  templateCard: {
    marginBottom: 12,
  },
  templateName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  templateDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  templateMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  difficultyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: "600",
  },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  timeText: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  freqBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  freqText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#1E40AF",
  },
  templateCost: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  diyCost: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.success,
  },
  bottomPadding: {
    height: 40,
  },
});
