import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/tokens";
import { Button } from "./Button";

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={48} color={colors.textMuted} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onAction && (
        <Button onPress={onAction} style={styles.button}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
}

export function EmptyHomes({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon="home-outline"
      title="Add your first home"
      description="Set up a property to unlock forecasts and maintenance tracking."
      actionLabel="Add Home"
      onAction={onAdd}
    />
  );
}

export function EmptyTasks() {
  return (
    <EmptyState
      icon="checkmark-circle-outline"
      title="All caught up!"
      description="No upcoming maintenance tasks. Great job keeping your home in shape!"
    />
  );
}

export function EmptySystems({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon="construct-outline"
      title="No systems yet"
      description="Add systems to get maintenance predictions and cost forecasts."
      actionLabel="Add System"
      onAction={onAdd}
    />
  );
}

export function EmptyPackets({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon="document-text-outline"
      title="No packets yet"
      description="Create a packet when something breaks or needs service."
      actionLabel="New Packet"
      onAction={onAdd}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 32,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});
