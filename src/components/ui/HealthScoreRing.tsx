import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { colors } from "../../theme/tokens";

interface HealthScoreRingProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const sizeConfig = {
  sm: { size: 48, strokeWidth: 4, fontSize: 14 },
  md: { size: 72, strokeWidth: 5, fontSize: 20 },
  lg: { size: 100, strokeWidth: 6, fontSize: 28 },
};

export function HealthScoreRing({ score, size = "md", showLabel = true }: HealthScoreRingProps) {
  const config = sizeConfig[size];
  const radius = (config.size - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, score)) / 100;
  const strokeDashoffset = circumference * (1 - progress);

  const getScoreColor = (s: number) => {
    if (s >= 90) return "#059669"; // emerald-600
    if (s >= 70) return colors.primary;
    if (s >= 50) return colors.warning;
    return colors.danger;
  };

  const getScoreLabel = (s: number) => {
    if (s >= 90) return "Excellent";
    if (s >= 70) return "Good";
    if (s >= 50) return "Fair";
    return "Needs Attention";
  };

  const scoreColor = getScoreColor(score);

  return (
    <View style={styles.container}>
      <Svg width={config.size} height={config.size}>
        {/* Background circle */}
        <Circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={config.strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <Circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          stroke={scoreColor}
          strokeWidth={config.strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${config.size / 2} ${config.size / 2})`}
        />
      </Svg>
      <View style={[styles.labelContainer, { width: config.size, height: config.size }]}>
        <Text style={[styles.score, { fontSize: config.fontSize, color: scoreColor }]}>
          {Math.round(score)}
        </Text>
        {showLabel && size !== "sm" && (
          <Text style={styles.label}>{getScoreLabel(score)}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  labelContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  score: {
    fontWeight: "700",
  },
  label: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
});
