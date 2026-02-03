"use client";

import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { colors } from "../../src/theme/tokens";
import { Card, Badge, StatusBadge, PriorityBadge, CategoryBadge, Button, LoadingState } from "../../src/components/ui";

const DIFFICULTY_INFO: Record<string, { label: string; bgColor: string; textColor: string }> = {
  easy: { label: "Easy", bgColor: "#D1FAE5", textColor: "#065F46" },
  moderate: { label: "Moderate", bgColor: "#FEF3C7", textColor: "#92400E" },
  hard: { label: "Hard", bgColor: "#FED7AA", textColor: "#9A3412" },
  pro_only: { label: "Pro Only", bgColor: "#FEE2E2", textColor: "#991B1B" },
};

export default function TaskDetailScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const router = useRouter();
  const [isCompleting, setIsCompleting] = useState(false);
  const [isSnoozing, setIsSnoozing] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["quickSkim"]));

  const task = useQuery(
    api.maintenance.getTask,
    taskId ? { taskId: taskId as Id<"scheduledMaintenance"> } : "skip"
  );

  const completeTask = useMutation(api.maintenance.completeTask);
  const snoozeTask = useMutation(api.maintenance.snoozeTask);

  const isPastDate = (dateStr: string) => new Date(dateStr) < new Date();

  const handleComplete = async (wasDiy: boolean) => {
    setIsCompleting(true);
    try {
      await completeTask({
        taskId: taskId as Id<"scheduledMaintenance">,
        wasDiy,
      });
      router.back();
    } catch (err) {
      Alert.alert("Error", "Failed to complete task");
      console.error(err);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleSnooze = async () => {
    setIsSnoozing(true);
    try {
      await snoozeTask({
        taskId: taskId as Id<"scheduledMaintenance">,
        days: 7,
      });
      router.back();
    } catch (err) {
      Alert.alert("Error", "Failed to snooze task");
      console.error(err);
    } finally {
      setIsSnoozing(false);
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
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
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!task) {
    return <LoadingState message="Loading task details..." />;
  }

  const template = task.template as any;
  const isOverdue = isPastDate(task.dueDate) && task.status !== "completed";
  const isCompleted = task.status === "completed";
  const difficulty = template?.difficulty || "moderate";
  const difficultyInfo = DIFFICULTY_INFO[difficulty];

  const diyAvg = ((task.diyCostLow || 0) + (task.diyCostHigh || 0)) / 2;
  const proAvg = ((task.proCostLow || 0) + (task.proCostHigh || 0)) / 2;
  const savings = Math.max(0, proAvg - diyAvg);

  const getStatusBarColor = () => {
    if (isCompleted) return colors.success;
    if (isOverdue) return colors.danger;
    if (task.status === "due") return colors.warning;
    if (task.status === "snoozed") return colors.textMuted;
    return colors.primary;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Task Details</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Status Bar */}
      <View style={[styles.statusBar, { backgroundColor: getStatusBarColor() }]} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Main Info Card */}
        <Card style={styles.mainCard}>
          <View style={styles.titleRow}>
            <Text style={styles.taskTitle}>{task.name}</Text>
            <StatusBadge status={task.status} />
          </View>
          <Text style={styles.systemName}>{task.system?.name || "General Maintenance"}</Text>

          <View style={styles.badgeRow}>
            {task.category && <CategoryBadge category={task.category} />}
            <PriorityBadge priority={task.priority} />
            {difficultyInfo && (
              <View style={[styles.difficultyBadge, { backgroundColor: difficultyInfo.bgColor }]}>
                <Ionicons name="construct" size={12} color={difficultyInfo.textColor} />
                <Text style={[styles.difficultyText, { color: difficultyInfo.textColor }]}>
                  {difficultyInfo.label}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.dateRow}>
            <Ionicons name="calendar" size={16} color={colors.textMuted} />
            <Text style={[styles.dateText, isOverdue && styles.dateTextOverdue]}>
              {isOverdue ? "Overdue: " : "Due: "}
              {formatDate(task.dueDate)}
            </Text>
          </View>

          {template?.estimatedTimeMinutes && (
            <View style={styles.dateRow}>
              <Ionicons name="time" size={16} color={colors.textMuted} />
              <Text style={styles.dateText}>{template.estimatedTimeMinutes} minutes</Text>
            </View>
          )}
        </Card>

        {/* Quick Skim */}
        {template?.quickSkim && template.quickSkim.length > 0 && (
          <CollapsibleSection
            title="Quick Skim"
            icon="list"
            isExpanded={expandedSections.has("quickSkim")}
            onToggle={() => toggleSection("quickSkim")}
            badge={`${template.quickSkim.length} points`}
          >
            {template.quickSkim.map((item: string, i: number) => (
              <View key={i} style={styles.listItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.listItemText}>{item}</Text>
              </View>
            ))}
          </CollapsibleSection>
        )}

        {/* Cost Comparison */}
        {(task.diyCostLow || task.proCostLow) && (
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="cash" size={20} color={colors.success} />
              <Text style={styles.sectionTitle}>Cost Comparison</Text>
            </View>

            <View style={styles.costGrid}>
              <View style={[styles.costCard, styles.costCardDiy]}>
                <Text style={styles.costLabel}>DIY Cost</Text>
                <Text style={styles.costValueDiy}>
                  {formatCurrency(task.diyCostLow || 0)} - {formatCurrency(task.diyCostHigh || 0)}
                </Text>
              </View>
              <View style={[styles.costCard, styles.costCardPro]}>
                <Text style={styles.costLabel}>Pro Cost</Text>
                <Text style={styles.costValuePro}>
                  {formatCurrency(task.proCostLow || 0)} - {formatCurrency(task.proCostHigh || 0)}
                </Text>
              </View>
            </View>

            {savings > 0 && (
              <Text style={styles.savingsText}>
                Save up to {formatCurrency(savings)} by doing it yourself!
              </Text>
            )}
          </Card>
        )}

        {/* When to Call a Pro */}
        {template?.whenToCallPro && template.whenToCallPro.length > 0 && (
          <CollapsibleSection
            title="When to Call a Pro"
            icon="call"
            isExpanded={expandedSections.has("callPro")}
            onToggle={() => toggleSection("callPro")}
          >
            {template.whenToCallPro.map((item: string, i: number) => (
              <View key={i} style={styles.listItem}>
                <Ionicons name="arrow-forward" size={14} color={colors.info} />
                <Text style={styles.listItemText}>{item}</Text>
              </View>
            ))}
          </CollapsibleSection>
        )}

        {/* DIY Steps */}
        {template?.diySteps && template.diySteps.length > 0 && (
          <CollapsibleSection
            title="DIY Step-by-Step Guide"
            icon="construct"
            isExpanded={expandedSections.has("diySteps")}
            onToggle={() => toggleSection("diySteps")}
            badge={`${template.diySteps.length} steps`}
          >
            {/* Safety Warnings */}
            {template.safetyWarnings?.length > 0 && (
              <View style={styles.safetyBox}>
                <View style={styles.safetyHeader}>
                  <Ionicons name="warning" size={16} color={colors.warning} />
                  <Text style={styles.safetyTitle}>Safety Warnings</Text>
                </View>
                {template.safetyWarnings.map((warning: string, i: number) => (
                  <Text key={i} style={styles.safetyText}>
                    • {warning}
                  </Text>
                ))}
              </View>
            )}

            {/* Steps */}
            {template.diySteps.map((step: string, i: number) => (
              <View key={i} style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{i + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}

            {/* Common Mistakes */}
            {template.commonMistakes?.length > 0 && (
              <View style={styles.mistakesBox}>
                <View style={styles.mistakesHeader}>
                  <Ionicons name="alert-circle" size={16} color={colors.warning} />
                  <Text style={styles.mistakesTitle}>Common Mistakes to Avoid</Text>
                </View>
                {template.commonMistakes.map((mistake: string, i: number) => (
                  <View key={i} style={styles.listItem}>
                    <Text style={styles.warningBullet}>⚠</Text>
                    <Text style={styles.listItemText}>{mistake}</Text>
                  </View>
                ))}
              </View>
            )}
          </CollapsibleSection>
        )}

        {/* Deep Dive */}
        {(template?.deepDiveContent?.whyItMatters || template?.deepDiveContent?.scienceBehind) && (
          <CollapsibleSection
            title="Deep Dive"
            icon="book"
            isExpanded={expandedSections.has("deepDive")}
            onToggle={() => toggleSection("deepDive")}
          >
            {template.deepDiveContent.whyItMatters && (
              <View style={styles.deepDiveSection}>
                <View style={styles.deepDiveHeader}>
                  <Ionicons name="bulb" size={16} color={colors.warning} />
                  <Text style={styles.deepDiveTitle}>Why This Matters</Text>
                </View>
                <Text style={styles.deepDiveText}>{template.deepDiveContent.whyItMatters}</Text>
              </View>
            )}

            {template.deepDiveContent.scienceBehind && (
              <View style={[styles.deepDiveSection, styles.scienceBox]}>
                <Text style={styles.scienceTitle}>The Science</Text>
                <Text style={styles.scienceText}>{template.deepDiveContent.scienceBehind}</Text>
              </View>
            )}

            {template.deepDiveContent.proTips?.length > 0 && (
              <View style={[styles.deepDiveSection, styles.tipsBox]}>
                <View style={styles.tipsHeader}>
                  <Ionicons name="bulb" size={16} color="#059669" />
                  <Text style={styles.tipsTitle}>Pro Tips</Text>
                </View>
                {template.deepDiveContent.proTips.map((tip: string, i: number) => (
                  <Text key={i} style={styles.tipText}>
                    💡 {tip}
                  </Text>
                ))}
              </View>
            )}
          </CollapsibleSection>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Action Buttons */}
      {!isCompleted && (
        <View style={styles.actionBar}>
          <Button
            variant="outline"
            onPress={handleSnooze}
            loading={isSnoozing}
            style={styles.actionButton}
            leftIcon={<Ionicons name="pause" size={16} color={colors.primary} />}
          >
            Snooze 7 Days
          </Button>
          <Button
            variant="primary"
            onPress={() => handleComplete(true)}
            loading={isCompleting}
            style={styles.actionButton}
            leftIcon={<Ionicons name="checkmark" size={16} color="#FFFFFF" />}
          >
            Mark Complete
          </Button>
        </View>
      )}
    </View>
  );
}

interface CollapsibleSectionProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: string;
}

function CollapsibleSection({
  title,
  icon,
  isExpanded,
  onToggle,
  children,
  badge,
}: CollapsibleSectionProps) {
  return (
    <Card style={styles.section}>
      <Pressable style={styles.collapsibleHeader} onPress={onToggle}>
        <View style={styles.collapsibleTitle}>
          <Ionicons name={icon} size={20} color={colors.primary} />
          <Text style={styles.sectionTitle}>{title}</Text>
          {badge && (
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>{badge}</Text>
            </View>
          )}
        </View>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={colors.textMuted}
        />
      </Pressable>
      {isExpanded && <View style={styles.collapsibleContent}>{children}</View>}
    </Card>
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
    fontSize: 17,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  statusBar: {
    height: 4,
    marginHorizontal: 20,
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  mainCard: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  taskTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  systemName: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  badgeRow: {
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
    fontSize: 12,
    fontWeight: "600",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  dateText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  dateTextOverdue: {
    color: colors.danger,
    fontWeight: "600",
  },
  section: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  collapsibleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  collapsibleTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionBadge: {
    backgroundColor: "#CCFBF1",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  sectionBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.primary,
  },
  collapsibleContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  listItemText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  costGrid: {
    flexDirection: "row",
    gap: 12,
  },
  costCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
  },
  costCardDiy: {
    backgroundColor: "#D1FAE5",
  },
  costCardPro: {
    backgroundColor: colors.border,
  },
  costLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  costValueDiy: {
    fontSize: 16,
    fontWeight: "700",
    color: "#065F46",
  },
  costValuePro: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  savingsText: {
    textAlign: "center",
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
    color: colors.success,
  },
  safetyBox: {
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  safetyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  safetyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400E",
  },
  safetyText: {
    fontSize: 13,
    color: "#92400E",
    marginBottom: 4,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#CCFBF1",
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  mistakesBox: {
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  mistakesHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  mistakesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400E",
  },
  warningBullet: {
    fontSize: 12,
    color: colors.warning,
  },
  deepDiveSection: {
    marginBottom: 16,
  },
  deepDiveHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  deepDiveTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  deepDiveText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  scienceBox: {
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    padding: 12,
  },
  scienceTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3730A3",
    marginBottom: 8,
  },
  scienceText: {
    fontSize: 13,
    color: "#4338CA",
    lineHeight: 20,
  },
  tipsBox: {
    backgroundColor: "#D1FAE5",
    borderRadius: 12,
    padding: 12,
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#065F46",
  },
  tipText: {
    fontSize: 13,
    color: "#065F46",
    marginBottom: 4,
  },
  bottomPadding: {
    height: 40,
  },
  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 12,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flex: 1,
  },
});
