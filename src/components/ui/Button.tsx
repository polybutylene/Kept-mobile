import React from "react";
import { Pressable, Text, StyleSheet, ActivityIndicator, View, ViewStyle } from "react-native";
import { colors } from "../../theme/tokens";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const variantStyles: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
  primary: { bg: colors.primary, text: "#FFFFFF" },
  secondary: { bg: "#F3F4F6", text: colors.textPrimary },
  outline: { bg: "transparent", text: colors.primary, border: colors.primary },
  ghost: { bg: "transparent", text: colors.textSecondary },
  danger: { bg: colors.danger, text: "#FFFFFF" },
};

const sizeStyles: Record<ButtonSize, { height: number; paddingH: number; fontSize: number }> = {
  sm: { height: 36, paddingH: 12, fontSize: 13 },
  md: { height: 44, paddingH: 16, fontSize: 14 },
  lg: { height: 52, paddingH: 20, fontSize: 15 },
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  onPress,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
}: ButtonProps) {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: variantStyle.bg,
          height: sizeStyle.height,
          paddingHorizontal: sizeStyle.paddingH,
          borderWidth: variantStyle.border ? 1 : 0,
          borderColor: variantStyle.border,
          opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.text} size="small" />
      ) : (
        <View style={styles.content}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text style={[styles.text, { color: variantStyle.text, fontSize: sizeStyle.fontSize }]}>
            {children}
          </Text>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  fullWidth: {
    width: "100%",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    fontWeight: "600",
  },
  iconLeft: {
    marginRight: 6,
  },
  iconRight: {
    marginLeft: 6,
  },
});
