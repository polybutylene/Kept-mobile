import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../theme/tokens";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "primary";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md";
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  default: { bg: "#F3F4F6", text: colors.textSecondary },
  success: { bg: "#D1FAE5", text: "#065F46" },
  warning: { bg: "#FEF3C7", text: "#92400E" },
  danger: { bg: "#FEE2E2", text: "#991B1B" },
  info: { bg: "#DBEAFE", text: "#1E40AF" },
  primary: { bg: "#CCFBF1", text: "#115E59" },
};

export function Badge({ children, variant = "default", size = "sm" }: BadgeProps) {
  const colorScheme = variantColors[variant];
  
  return (
    <View style={[
      styles.badge, 
      { backgroundColor: colorScheme.bg },
      size === "md" && styles.badgeMd,
    ]}>
      <Text style={[
        styles.text, 
        { color: colorScheme.text },
        size === "md" && styles.textMd,
      ]}>
        {children}
      </Text>
    </View>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { variant: BadgeVariant; label: string }> = {
    overdue: { variant: "danger", label: "Overdue" },
    due: { variant: "warning", label: "Due Soon" },
    upcoming: { variant: "primary", label: "Upcoming" },
    completed: { variant: "success", label: "Completed" },
    snoozed: { variant: "default", label: "Snoozed" },
  };

  const config = statusConfig[status] || { variant: "default", label: status };
  
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  const priorityConfig: Record<string, { variant: BadgeVariant; label: string }> = {
    critical: { variant: "danger", label: "Critical" },
    high: { variant: "warning", label: "High" },
    medium: { variant: "info", label: "Medium" },
    low: { variant: "default", label: "Low" },
    routine: { variant: "default", label: "Routine" },
  };

  const config = priorityConfig[priority] || { variant: "default", label: priority };
  
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function CategoryBadge({ category }: { category: string }) {
  const categoryLabels: Record<string, string> = {
    hvac: "HVAC",
    plumbing: "Plumbing",
    electrical: "Electrical",
    appliances: "Appliances",
    structural: "Structural",
    exterior: "Exterior",
  };

  return <Badge variant="default">{categoryLabels[category] || category}</Badge>;
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  badgeMd: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: "600",
  },
  textMd: {
    fontSize: 12,
  },
});
