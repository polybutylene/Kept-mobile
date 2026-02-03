import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { colors } from "../../theme/tokens";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

export function SkeletonCard({ height = 80 }: { height?: number }) {
  return (
    <View style={[styles.skeleton, { height }]}>
      <View style={styles.skeletonInner} />
    </View>
  );
}

export function SkeletonList({ count = 3, height = 80 }: { count?: number; height?: number }) {
  return (
    <View style={styles.skeletonList}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} height={height} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: colors.background,
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
  },
  skeleton: {
    backgroundColor: colors.border,
    borderRadius: 16,
    overflow: "hidden",
  },
  skeletonInner: {
    flex: 1,
    backgroundColor: "#E5E7EB",
  },
  skeletonList: {
    gap: 12,
  },
});
