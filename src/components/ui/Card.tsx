import React from "react";
import { View, StyleSheet, ViewStyle, Pressable } from "react-native";
import { colors } from "../../theme/tokens";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: "none" | "sm" | "md" | "lg";
  onPress?: () => void;
  borderLeft?: string;
}

export function Card({ children, style, padding = "md", onPress, borderLeft }: CardProps) {
  const paddingValue = padding === "none" ? 0 : padding === "sm" ? 12 : padding === "lg" ? 20 : 16;
  
  const cardStyle: ViewStyle = {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: paddingValue,
    borderWidth: 1,
    borderColor: colors.border,
    ...(borderLeft && {
      borderLeftWidth: 4,
      borderLeftColor: borderLeft,
    }),
    ...style,
  };

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [cardStyle, pressed && styles.pressed]}>
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.99 }],
  },
});
