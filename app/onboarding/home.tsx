"use client";

import { useState } from "react";
import { useRouter } from "expo-router";
import { useConvexAuth, useMutation } from "convex/react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { api } from "../../../convex/_generated/api";
import { colors } from "../../src/theme/tokens";
import { setOnboardingHomeId } from "../../src/onboarding/storage";

const STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY",
];

export default function OnboardingHomeScreen() {
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const createHome = useMutation(api.homes.createHome);

  const [form, setForm] = useState({
    name: "",
    addressLine1: "",
    city: "",
    state: "",
    zipCode: "",
    yearBuilt: "",
    squareFootage: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthenticated) {
    router.replace("/(auth)/login");
    return null;
  }

  const handleSubmit = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const homeId = await createHome({
        name: form.name || undefined,
        addressLine1: form.addressLine1,
        city: form.city,
        state: form.state,
        zipCode: form.zipCode,
        yearBuilt: form.yearBuilt ? parseInt(form.yearBuilt, 10) : undefined,
        squareFootage: form.squareFootage ? parseInt(form.squareFootage, 10) : undefined,
      });
      await setOnboardingHomeId(homeId);
      router.push("/onboarding/systems");
    } catch (err: any) {
      setError(err?.message || "Failed to create home");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Add your home</Text>
      <Text style={styles.subtitle}>Tell us about your property.</Text>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {[
        { key: "name", label: "Home Name (optional)", placeholder: "My House" },
        { key: "addressLine1", label: "Street Address", placeholder: "123 Main St" },
        { key: "city", label: "City", placeholder: "Springfield" },
        { key: "state", label: "State (2-letter)", placeholder: "CA" },
        { key: "zipCode", label: "ZIP Code", placeholder: "90210" },
        { key: "yearBuilt", label: "Year Built (optional)", placeholder: "2001" },
        { key: "squareFootage", label: "Square Footage (optional)", placeholder: "2000" },
      ].map((field) => (
        <View key={field.key} style={styles.inputGroup}>
          <Text style={styles.label}>{field.label}</Text>
          <TextInput
            style={styles.input}
            placeholder={field.placeholder}
            placeholderTextColor={colors.textMuted}
            value={(form as any)[field.key]}
            onChangeText={(text) =>
              setForm((prev) => ({ ...prev, [field.key]: text }))
            }
          />
        </View>
      ))}

      <Pressable style={styles.primaryButton} onPress={handleSubmit} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color={colors.card} />
        ) : (
          <Text style={styles.primaryButtonText}>Continue</Text>
        )}
      </Pressable>

      <View style={styles.progress}>
        <View style={styles.progressActive} />
        <View style={styles.progressActive} />
        <View style={styles.progressInactive} />
        <View style={styles.progressInactive} />
      </View>

      <Text style={styles.helper}>
        Tip: Use a friendly name like “Brickles House” so it shows up in your
        dashboard.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 6,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.card,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  primaryButtonText: {
    color: colors.card,
    fontWeight: "600",
    fontSize: 16,
  },
  progress: {
    flexDirection: "row",
    gap: 8,
    marginTop: 18,
  },
  progressActive: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  progressInactive: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.border,
  },
  helper: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 10,
  },
  errorBox: {
    backgroundColor: "#FEE2E2",
    borderColor: "#FCA5A5",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 13,
  },
});
