"use client";

import { useState, useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../../convex/_generated/api";
import { colors } from "../../src/theme/tokens";
import { useActiveHome } from "../../src/hooks/useActiveHome";
import { Card, Badge, PriorityBadge, LoadingState, EmptyTasks, Button } from "../../src/components/ui";

type TabType = "upcoming" | "completed";
type SortType = "date" | "priority" | "cost" | "difficulty";

const CATEGORY_FILTERS = [
  { value: "", label: "All" },
  { value: "hvac", label: "HVAC" },
  { value: "plumbing", label: "Plumbing" },
  { value: "electrical", label: "Electrical" },
  { value: "appliances", label: "Appliances" },
  { value: "structural", label: "Structural" },
  { value: "exterior", label: "Exterior" },
];

const DIFFICULTY_LABELS: Record<string, { label: string; bgColor: string; textColor: string }> = {
  easy: { label: "Easy", bgColor: "#D1FAE5", textColor: "#065F46" },
  moderate: { label: "Moderate", bgColor: "#FEF3C7", textColor: "#92400E" },
  hard: { label: "Hard", bgColor: "#FED7AA", textColor: "#9A3412" },
  pro_only: { label: "Pro Only", bgColor: "#FEE2E2", textColor: "#991B1B" },
};

export default function CareScreen() {
  const router = useRouter();
  const { activeHome, isLoading } = useActiveHome();
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortType>("date");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const allTasks = useQuery(
    api.maintenance.getEnhancedTasks,
    activeHome ? { homeId: activeHome._id, includeCompleted: true } : "skip"
  );

  const taskStats = useQuery(
    api.maintenance.getTaskStats,
    activeHome ? { homeId: activeHome._id } : "skip"
  );

  const completeTask = useMutation(api.maintenance.completeTask);

  const isPastDate = (dateStr: string) => new Date(dateStr) < new Date();
  const getDaysDiff = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const filteredTasks = useMemo(() => {
    if (!allTasks) return [];

    return allTasks
      .filter((task) => {
        const matchesTab =
          activeTab === "completed"
            ? task.status === "completed"
            : !["completed", "skipped"].includes(task.status);

        const matchesCategory = !categoryFilter || task.category === categoryFilter;

        const matchesStatus =
          !statusFilter ||
          (statusFilter === "overdue"
            ? task.status === "overdue" || isPastDate(task.dueDate)
            : statusFilter === "due"
              ? task.status === "due" || (getDaysDiff(task.dueDate) <= 7 && !isPastDate(task.dueDate))
              : statusFilter === "upcoming"
                ? task.status === "upcoming" && getDaysDiff(task.dueDate) > 7
                : true);

        const matchesSearch =
          !searchQuery ||
          task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.system?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.category?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesTab && matchesCategory && matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "priority") {
          const priorityMap: Record<string, number> = {
            critical: 0,
            high: 1,
            medium: 2,
            low: 3,
            routine: 4,
          };
          return (priorityMap[a.priority] ?? 99) - (priorityMap[b.priority] ?? 99);
        }
        if (sortBy === "cost") {
          const aCost = ((a.proCostLow || 0) + (a.proCostHigh || 0)) / 2;
          const bCost = ((b.proCostLow || 0) + (b.proCostHigh || 0)) / 2;
          return bCost - aCost;
        }
        if (sortBy === "difficulty") {
          const diffMap: Record<string, number> = { easy: 0, moderate: 1, hard: 2, pro_only: 3 };
          const aDiff = diffMap[a.template?.difficulty || "moderate"] ?? 1;
          const bDiff = diffMap[b.template?.difficulty || "moderate"] ?? 1;
          return aDiff - bDiff;
        }
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
  }, [allTasks, activeTab, categoryFilter, statusFilter, searchQuery, sortBy]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleQuickComplete = async (taskId: string) => {
    try {
      await completeTask({ taskId: taskId as any, wasDiy: true });
    } catch (err) {
      console.error("Failed to complete task:", err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getDiySavings = (task: any) => {
    const proAvg = ((task.proCostLow || 0) + (task.proCostHigh || 0)) / 2;
    const diyAvg = ((task.diyCostLow || 0) + (task.diyCostHigh || 0)) / 2;
    return Math.max(0, Math.round(proAvg - diyAvg));
  };

  const getStatusColor = (status: string, dueDate: string) => {
    if (status === "completed") return colors.success;
    if (status === "overdue" || isPastDate(dueDate)) return colors.danger;
    if (status === "due" || getDaysDiff(dueDate) <= 7) return colors.warning;
    if (status === "snoozed") return colors.textMuted;
    return colors.primary;
  };

  const formatTaskDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  const getTimeAgo = (dateStr: string) => {
    const days = Math.abs(getDaysDiff(dateStr));
    if (days === 0) return "Today";
    if (days === 1) return isPastDate(dateStr) ? "Yesterday" : "Tomorrow";
    if (days < 7) return `${days} days ${isPastDate(dateStr) ? "ago" : ""}`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ${isPastDate(dateStr) ? "ago" : ""}`;
    return formatTaskDate(dateStr);
  };

  if (isLoading) {
    return <LoadingState message="Loading tasks..." />;
  }

  const overdueCount = taskStats?.overdue || 0;
  const dueCount = taskStats?.due || 0;
  const upcomingCount = taskStats?.upcoming || 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Care</Text>
        <Text style={styles.subtitle}>Stay ahead of maintenance</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")} style={styles.clearButton}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>

        {/* Stats Cards */}
        {activeTab === "upcoming" && (
          <View style={styles.statsRow}>
            <Pressable
              style={[
                styles.statCard,
                statusFilter === "overdue" && styles.statCardActive,
                overdueCount > 0 && styles.statCardDanger,
              ]}
              onPress={() => setStatusFilter(statusFilter === "overdue" ? null : "overdue")}
            >
              <View style={styles.statHeader}>
                <Ionicons
                  name="alert-circle"
                  size={16}
                  color={overdueCount > 0 ? colors.danger : colors.textMuted}
                />
                <Text style={styles.statLabel}>Overdue</Text>
              </View>
              <Text style={[styles.statValue, overdueCount > 0 && styles.statValueDanger]}>
                {overdueCount}
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.statCard,
                statusFilter === "due" && styles.statCardActiveWarning,
                dueCount > 0 && styles.statCardWarning,
              ]}
              onPress={() => setStatusFilter(statusFilter === "due" ? null : "due")}
            >
              <View style={styles.statHeader}>
                <Ionicons
                  name="time"
                  size={16}
                  color={dueCount > 0 ? colors.warning : colors.textMuted}
                />
                <Text style={styles.statLabel}>Due Soon</Text>
              </View>
              <Text style={[styles.statValue, dueCount > 0 && styles.statValueWarning]}>
                {dueCount}
              </Text>
            </Pressable>

            <Pressable
              style={[styles.statCard, statusFilter === "upcoming" && styles.statCardActivePrimary]}
              onPress={() => setStatusFilter(statusFilter === "upcoming" ? null : "upcoming")}
            >
              <View style={styles.statHeader}>
                <Ionicons name="checkmark-circle" size={16} color={colors.textMuted} />
                <Text style={styles.statLabel}>Upcoming</Text>
              </View>
              <Text style={styles.statValue}>{upcomingCount}</Text>
            </Pressable>
          </View>
        )}

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <View style={styles.tabSwitcher}>
            <Pressable
              style={[styles.tab, activeTab === "upcoming" && styles.tabActive]}
              onPress={() => setActiveTab("upcoming")}
            >
              <Text style={[styles.tabText, activeTab === "upcoming" && styles.tabTextActive]}>
                Upcoming
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tab, activeTab === "completed" && styles.tabActive]}
              onPress={() => setActiveTab("completed")}
            >
              <Text style={[styles.tabText, activeTab === "completed" && styles.tabTextActive]}>
                Completed
              </Text>
            </Pressable>
          </View>

          {/* Sort Dropdown */}
          <View style={styles.sortContainer}>
            <Pressable style={styles.sortButton}>
              <Text style={styles.sortLabel}>
                {sortBy === "date"
                  ? "Date"
                  : sortBy === "priority"
                    ? "Priority"
                    : sortBy === "cost"
                      ? "Cost"
                      : "Difficulty"}
              </Text>
              <Ionicons name="chevron-down" size={14} color={colors.textSecondary} />
            </Pressable>
          </View>
        </View>

        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {CATEGORY_FILTERS.map((filter) => (
            <Pressable
              key={filter.value}
              style={[styles.categoryPill, categoryFilter === filter.value && styles.categoryPillActive]}
              onPress={() => setCategoryFilter(filter.value)}
            >
              <Text
                style={[
                  styles.categoryPillText,
                  categoryFilter === filter.value && styles.categoryPillTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Active Filters */}
        {(statusFilter || categoryFilter || searchQuery) && (
          <View style={styles.activeFilters}>
            <Text style={styles.activeFiltersLabel}>Filtering by:</Text>
            {searchQuery && (
              <View style={styles.filterChip}>
                <Text style={styles.filterChipText}>"{searchQuery}"</Text>
                <Pressable onPress={() => setSearchQuery("")}>
                  <Ionicons name="close" size={12} color={colors.textSecondary} />
                </Pressable>
              </View>
            )}
            {statusFilter && (
              <View style={styles.filterChip}>
                <Text style={styles.filterChipText}>{statusFilter}</Text>
                <Pressable onPress={() => setStatusFilter(null)}>
                  <Ionicons name="close" size={12} color={colors.textSecondary} />
                </Pressable>
              </View>
            )}
            {categoryFilter && (
              <View style={styles.filterChip}>
                <Text style={styles.filterChipText}>
                  {CATEGORY_FILTERS.find((c) => c.value === categoryFilter)?.label}
                </Text>
                <Pressable onPress={() => setCategoryFilter("")}>
                  <Ionicons name="close" size={12} color={colors.textSecondary} />
                </Pressable>
              </View>
            )}
            <Pressable
              onPress={() => {
                setStatusFilter(null);
                setCategoryFilter("");
                setSearchQuery("");
              }}
            >
              <Text style={styles.clearFilters}>Clear all</Text>
            </Pressable>
          </View>
        )}

        {/* Task List */}
        {allTasks === undefined ? (
          <View style={styles.loadingTasks}>
            {[1, 2, 3, 4, 5].map((i) => (
              <View key={i} style={styles.skeletonTask} />
            ))}
          </View>
        ) : filteredTasks.length === 0 ? (
          activeTab === "completed" ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No completed tasks yet</Text>
            </Card>
          ) : (
            <EmptyTasks />
          )
        ) : (
          <View style={styles.taskList}>
            {filteredTasks.map((task) => {
              const savings = getDiySavings(task);
              const isCompleted = task.status === "completed";
              const isOverdue = task.status === "overdue" || (!isCompleted && isPastDate(task.dueDate));
              const isDue =
                !isOverdue && !isCompleted && (task.status === "due" || getDaysDiff(task.dueDate) <= 7);
              const difficulty = task.template?.difficulty || "moderate";
              const difficultyInfo = DIFFICULTY_LABELS[difficulty];

              return (
                <Card
                  key={task._id}
                  borderLeft={getStatusColor(task.status, task.dueDate)}
                  onPress={() => router.push(`/care/${task._id}`)}
                  style={styles.taskCard}
                >
                  <View style={styles.taskHeader}>
                    <View style={styles.taskTitleRow}>
                      <Text
                        style={[styles.taskName, isCompleted && styles.taskNameCompleted]}
                        numberOfLines={1}
                      >
                        {task.name}
                      </Text>
                      <PriorityBadge priority={task.priority} />
                    </View>

                    <View style={styles.taskMeta}>
                      <Text style={styles.taskSystem}>{task.system?.name || "General"}</Text>
                      {difficultyInfo && (
                        <>
                          <Text style={styles.metaDot}>•</Text>
                          <View
                            style={[styles.difficultyBadge, { backgroundColor: difficultyInfo.bgColor }]}
                          >
                            <Ionicons name="construct" size={10} color={difficultyInfo.textColor} />
                            <Text style={[styles.difficultyText, { color: difficultyInfo.textColor }]}>
                              {difficultyInfo.label}
                            </Text>
                          </View>
                        </>
                      )}
                      {task.template?.estimatedTimeMinutes && (
                        <>
                          <Text style={styles.metaDot}>•</Text>
                          <Ionicons name="time-outline" size={12} color={colors.textMuted} />
                          <Text style={styles.taskMeta}>{task.template.estimatedTimeMinutes}m</Text>
                        </>
                      )}
                    </View>
                  </View>

                  <View style={styles.taskFooter}>
                    {isCompleted ? (
                      <View style={styles.taskDateContainer}>
                        <Text style={styles.taskDateLabel}>Completed</Text>
                        <Text style={styles.taskDateCompleted}>
                          {task.completedDate && formatTaskDate(task.completedDate)}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.taskDateContainer}>
                        <Text
                          style={[
                            styles.taskDate,
                            isOverdue && styles.taskDateOverdue,
                            isDue && styles.taskDateDue,
                          ]}
                        >
                          {isOverdue ? "Overdue" : formatTaskDate(task.dueDate)}
                        </Text>
                        {!isOverdue && (
                          <Text style={styles.taskTimeAgo}>{getTimeAgo(task.dueDate)}</Text>
                        )}
                        {savings > 0 && (
                          <View style={styles.savingsBadge}>
                            <Text style={styles.savingsText}>Save {formatCurrency(savings)}</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>

                  {!isCompleted && (
                    <View style={styles.taskActions}>
                      <Pressable
                        style={styles.completeButton}
                        onPress={() => handleQuickComplete(task._id)}
                      >
                        <Ionicons name="checkmark" size={14} color={colors.primary} />
                        <Text style={styles.completeButtonText}>Mark Complete</Text>
                      </Pressable>
                    </View>
                  )}
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
    color: colors.textPrimary,
  },
  clearButton: {
    padding: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statCardActive: {
    borderColor: colors.danger,
    borderWidth: 2,
    backgroundColor: "#FEE2E2",
  },
  statCardActiveWarning: {
    borderColor: colors.warning,
    borderWidth: 2,
    backgroundColor: "#FEF3C7",
  },
  statCardActivePrimary: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: "#CCFBF1",
  },
  statCardDanger: {
    backgroundColor: "#FEF2F2",
  },
  statCardWarning: {
    backgroundColor: "#FFFBEB",
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: 4,
  },
  statValueDanger: {
    color: colors.danger,
  },
  statValueWarning: {
    color: colors.warning,
  },
  tabContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  tabSwitcher: {
    flexDirection: "row",
    backgroundColor: colors.border,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: colors.card,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.textPrimary,
  },
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  categoryRow: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 12,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryPillActive: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  categoryPillTextActive: {
    color: colors.card,
  },
  activeFilters: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  activeFiltersLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  filterChipText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  clearFilters: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.primary,
  },
  loadingTasks: {
    gap: 12,
  },
  skeletonTask: {
    height: 100,
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
  taskList: {
    gap: 12,
  },
  taskCard: {
    marginBottom: 0,
  },
  taskHeader: {
    gap: 8,
  },
  taskTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  taskName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  taskNameCompleted: {
    color: colors.textMuted,
    textDecorationLine: "line-through",
  },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexWrap: "wrap",
  },
  taskSystem: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  metaDot: {
    color: colors.textMuted,
  },
  difficultyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: "500",
  },
  taskFooter: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  taskDateContainer: {
    gap: 2,
  },
  taskDateLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  taskDate: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  taskDateOverdue: {
    color: colors.danger,
  },
  taskDateDue: {
    color: colors.warning,
  },
  taskDateCompleted: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.success,
  },
  taskTimeAgo: {
    fontSize: 11,
    color: colors.textMuted,
  },
  savingsBadge: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  savingsText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#065F46",
  },
  taskActions: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#CCFBF1",
  },
  completeButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
  bottomPadding: {
    height: 40,
  },
});
