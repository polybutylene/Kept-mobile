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
import { Card, LoadingState, SkeletonList } from "../../src/components/ui";

type TimeRange = 1 | 5 | 10;
type BudgetPeriod = "weekly" | "biweekly" | "monthly";

export default function ForecastScreen() {
  const router = useRouter();
  const { activeHome, isLoading } = useActiveHome();
  const [timeRange, setTimeRange] = useState<TimeRange>(1);
  const [budgetPeriod, setBudgetPeriod] = useState<BudgetPeriod>("biweekly");
  const [refreshing, setRefreshing] = useState(false);

  const forecast = useQuery(
    api.forecasting.getBudgetForecast,
    activeHome ? { homeId: activeHome._id, years: timeRange } : "skip"
  );

  const confidence = useQuery(
    api.forecasting.getForecastConfidence,
    activeHome ? { homeId: activeHome._id } : "skip"
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

  const getBudgetAmount = () => {
    if (!forecast?.summary) return 0;
    switch (budgetPeriod) {
      case "weekly":
        return Math.round((forecast.summary.perPaycheck || 0) / 2);
      case "biweekly":
        return forecast.summary.perPaycheck || 0;
      case "monthly":
        return forecast.summary.perMonth || 0;
      default:
        return 0;
    }
  };

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case "high":
        return colors.success;
      case "medium":
        return colors.warning;
      case "low":
        return colors.danger;
      default:
        return colors.textMuted;
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading forecast..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Forecast</Text>
        <Text style={styles.subtitle}>Lifecycle-based cost outlook</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          {[1, 5, 10].map((years) => (
            <Pressable
              key={years}
              style={[styles.timeRangeButton, timeRange === years && styles.timeRangeButtonActive]}
              onPress={() => setTimeRange(years as TimeRange)}
            >
              <Text
                style={[styles.timeRangeText, timeRange === years && styles.timeRangeTextActive]}
              >
                {years} Year{years > 1 ? "s" : ""}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Confidence Meter */}
        {confidence && (
          <Card style={styles.confidenceCard}>
            <View style={styles.confidenceHeader}>
              <View style={styles.confidenceInfo}>
                <Text style={styles.confidenceLabel}>Forecast Confidence</Text>
                <Text style={styles.confidenceDescription}>{confidence.description}</Text>
              </View>
              <View style={styles.confidenceScore}>
                <Text
                  style={[styles.confidenceValue, { color: getConfidenceColor(confidence.level) }]}
                >
                  {confidence.score}%
                </Text>
                <Text
                  style={[styles.confidenceLevel, { color: getConfidenceColor(confidence.level) }]}
                >
                  {confidence.level}
                </Text>
              </View>
            </View>

            {/* Confidence Progress Bar */}
            <View style={styles.confidenceBar}>
              <View
                style={[
                  styles.confidenceFill,
                  {
                    width: `${confidence.score}%`,
                    backgroundColor: getConfidenceColor(confidence.level),
                  },
                ]}
              />
            </View>

            {/* Improvements */}
            {confidence.topImprovements?.length > 0 && (
              <View style={styles.improvements}>
                <Text style={styles.improvementsTitle}>Improve accuracy:</Text>
                {confidence.topImprovements.slice(0, 2).map((item: any, i: number) => (
                  <Text key={i} style={styles.improvementItem}>
                    • {item.suggestion} (+{item.potentialGain}%)
                  </Text>
                ))}
              </View>
            )}
          </Card>
        )}

        {/* Main Summary Card */}
        {!forecast ? (
          <SkeletonList count={3} height={100} />
        ) : (
          <>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>
                Next {timeRange > 1 ? `${timeRange} Years` : "12 Months"}
              </Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(forecast.totals?.grandTotal || 0)}
              </Text>
              <Text style={styles.summaryHint}>Estimated total</Text>

              {/* Cost Breakdown */}
              <View style={styles.breakdownRow}>
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>Maintenance</Text>
                  <Text style={[styles.breakdownValue, styles.breakdownMaintenance]}>
                    {formatCurrency(forecast.totals?.maintenance || 0)}
                  </Text>
                  <Text style={styles.breakdownPercent}>
                    {Math.round(
                      ((forecast.totals?.maintenance || 0) / (forecast.totals?.grandTotal || 1)) * 100
                    )}
                    %
                  </Text>
                </View>
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>Repairs</Text>
                  <Text style={[styles.breakdownValue, styles.breakdownRepairs]}>
                    {formatCurrency(forecast.totals?.repairs || 0)}
                  </Text>
                  <Text style={styles.breakdownPercent}>
                    {Math.round(
                      ((forecast.totals?.repairs || 0) / (forecast.totals?.grandTotal || 1)) * 100
                    )}
                    %
                  </Text>
                </View>
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>Replacements</Text>
                  <Text style={[styles.breakdownValue, styles.breakdownReplacements]}>
                    {formatCurrency(forecast.totals?.replacements || 0)}
                  </Text>
                  <Text style={styles.breakdownPercent}>
                    {Math.round(
                      ((forecast.totals?.replacements || 0) / (forecast.totals?.grandTotal || 1)) * 100
                    )}
                    %
                  </Text>
                </View>
              </View>

              {/* DIY Savings Banner */}
              {forecast.insights?.totalDiySavings > 0 && (
                <View style={styles.savingsBanner}>
                  <Ionicons name="construct" size={16} color="#065F46" />
                  <Text style={styles.savingsText}>
                    DIY all tasks: Save {formatCurrency(forecast.insights.totalDiySavings)}
                  </Text>
                </View>
              )}
            </Card>

            {/* Budget Planner (1 Year Only) */}
            {timeRange === 1 && (
              <Card style={styles.budgetCard}>
                <Text style={styles.cardTitle}>Budget Planner</Text>
                <Text style={styles.cardSubtitle}>Set aside this much to stay ahead</Text>

                {/* Period Selector */}
                <View style={styles.periodSelector}>
                  {(["weekly", "biweekly", "monthly"] as BudgetPeriod[]).map((period) => (
                    <Pressable
                      key={period}
                      style={[
                        styles.periodButton,
                        budgetPeriod === period && styles.periodButtonActive,
                      ]}
                      onPress={() => setBudgetPeriod(period)}
                    >
                      <Text
                        style={[
                          styles.periodText,
                          budgetPeriod === period && styles.periodTextActive,
                        ]}
                      >
                        {period.charAt(0).toUpperCase() + period.slice(1)}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <View style={styles.budgetAmount}>
                  <Text style={styles.budgetValue}>{formatCurrency(getBudgetAmount())}</Text>
                  <Text style={styles.budgetPeriod}>per {budgetPeriod.replace("biweekly", "paycheck")}</Text>
                </View>

                <Text style={styles.budgetNote}>Includes 15% cushion for unexpected repairs</Text>
              </Card>
            )}

            {/* Smart Insights (5+ Years) */}
            {timeRange > 1 && forecast.insights && (
              <Card style={styles.insightsCard}>
                <Text style={styles.cardTitle}>Smart Insights</Text>

                {forecast.insights.peakYear && (
                  <View style={styles.insightItem}>
                    <View style={[styles.insightIcon, { backgroundColor: "#FEE2E2" }]}>
                      <Ionicons name="trending-up" size={16} color={colors.danger} />
                    </View>
                    <View style={styles.insightContent}>
                      <Text style={styles.insightTitle}>Peak Spending Year</Text>
                      <Text style={styles.insightValue}>
                        {forecast.insights.peakYear}: {formatCurrency(forecast.insights.peakAmount || 0)}
                      </Text>
                    </View>
                  </View>
                )}

                {forecast.insights.biggestExpense && (
                  <View style={styles.insightItem}>
                    <View style={[styles.insightIcon, { backgroundColor: "#FEF3C7" }]}>
                      <Ionicons name="alert-circle" size={16} color={colors.warning} />
                    </View>
                    <View style={styles.insightContent}>
                      <Text style={styles.insightTitle}>Biggest Expense</Text>
                      <Text style={styles.insightValue}>
                        {forecast.insights.biggestExpense.name}:{" "}
                        {formatCurrency(forecast.insights.biggestExpense.cost || 0)}
                      </Text>
                    </View>
                  </View>
                )}

                {forecast.insights.upcomingReplacements?.length > 0 && (
                  <View style={styles.replacementsList}>
                    <Text style={styles.replacementsTitle}>Upcoming Replacements</Text>
                    {forecast.insights.upcomingReplacements.slice(0, 3).map((item: any, i: number) => (
                      <View key={i} style={styles.replacementItem}>
                        <Text style={styles.replacementName}>{item.name}</Text>
                        <Text style={styles.replacementYear}>{item.year}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </Card>
            )}

            {/* Yearly Breakdown (5+ Years) */}
            {timeRange > 1 && forecast.yearlyBreakdown && (
              <Card style={styles.yearlyCard}>
                <Text style={styles.cardTitle}>Yearly Breakdown</Text>
                {forecast.yearlyBreakdown.map((year: any, i: number) => (
                  <View key={i} style={styles.yearRow}>
                    <Text style={styles.yearLabel}>{year.year}</Text>
                    <View style={styles.yearBarContainer}>
                      <View
                        style={[
                          styles.yearBar,
                          {
                            width: `${Math.min(100, (year.total / (forecast.insights?.peakAmount || year.total)) * 100)}%`,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.yearBarMaintenance,
                            { flex: year.maintenance / year.total },
                          ]}
                        />
                        <View
                          style={[styles.yearBarRepairs, { flex: year.repairs / year.total }]}
                        />
                        <View
                          style={[
                            styles.yearBarReplacements,
                            { flex: year.replacements / year.total },
                          ]}
                        />
                      </View>
                    </View>
                    <Text style={styles.yearTotal}>{formatCurrency(year.total)}</Text>
                  </View>
                ))}

                {/* Legend */}
                <View style={styles.legend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
                    <Text style={styles.legendText}>Maintenance</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
                    <Text style={styles.legendText}>Repairs</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: colors.danger }]} />
                    <Text style={styles.legendText}>Replacements</Text>
                  </View>
                </View>
              </Card>
            )}
          </>
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
    padding: 20,
    paddingBottom: 100,
  },
  timeRangeContainer: {
    flexDirection: "row",
    backgroundColor: colors.border,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  timeRangeButtonActive: {
    backgroundColor: colors.primary,
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  timeRangeTextActive: {
    color: "#FFFFFF",
  },
  confidenceCard: {
    marginBottom: 16,
  },
  confidenceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  confidenceInfo: {
    flex: 1,
  },
  confidenceLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  confidenceDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  confidenceScore: {
    alignItems: "flex-end",
  },
  confidenceValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  confidenceLevel: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  confidenceBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    marginTop: 12,
    overflow: "hidden",
  },
  confidenceFill: {
    height: "100%",
    borderRadius: 3,
  },
  improvements: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  improvementsTitle: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.textSecondary,
    marginBottom: 4,
  },
  improvementItem: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  summaryCard: {
    alignItems: "center",
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 42,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: 4,
  },
  summaryHint: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  breakdownRow: {
    flexDirection: "row",
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    width: "100%",
  },
  breakdownItem: {
    flex: 1,
    alignItems: "center",
  },
  breakdownLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  breakdownMaintenance: {
    color: colors.success,
  },
  breakdownRepairs: {
    color: colors.warning,
  },
  breakdownReplacements: {
    color: colors.danger,
  },
  breakdownPercent: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  savingsBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 24,
  },
  savingsText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#065F46",
  },
  budgetCard: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  periodSelector: {
    flexDirection: "row",
    backgroundColor: colors.border,
    borderRadius: 8,
    padding: 4,
    marginTop: 16,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: colors.card,
  },
  periodText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  periodTextActive: {
    color: colors.textPrimary,
  },
  budgetAmount: {
    alignItems: "center",
    marginTop: 20,
  },
  budgetValue: {
    fontSize: 36,
    fontWeight: "700",
    color: colors.primary,
  },
  budgetPeriod: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  budgetNote: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 12,
  },
  insightsCard: {
    marginBottom: 16,
  },
  insightItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
  },
  insightIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  insightValue: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
    marginTop: 2,
  },
  replacementsList: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  replacementsTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 8,
  },
  replacementItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  replacementName: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  replacementYear: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  yearlyCard: {
    marginBottom: 16,
  },
  yearRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
  },
  yearLabel: {
    width: 40,
    fontSize: 13,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  yearBarContainer: {
    flex: 1,
    height: 16,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  yearBar: {
    height: "100%",
    flexDirection: "row",
    borderRadius: 4,
    overflow: "hidden",
  },
  yearBarMaintenance: {
    backgroundColor: colors.success,
  },
  yearBarRepairs: {
    backgroundColor: colors.warning,
  },
  yearBarReplacements: {
    backgroundColor: colors.danger,
  },
  yearTotal: {
    width: 60,
    fontSize: 12,
    fontWeight: "600",
    color: colors.textPrimary,
    textAlign: "right",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  bottomPadding: {
    height: 40,
  },
});
