"use client";

import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../../convex/_generated/api";
import { colors } from "../../src/theme/tokens";
import { useActiveHome } from "../../src/hooks/useActiveHome";
import { Card, Button, LoadingState } from "../../src/components/ui";

export default function HomeDetailsScreen() {
  const router = useRouter();
  const { activeHome, isLoading } = useActiveHome();

  const [name, setName] = useState(activeHome?.name || "");
  const [addressLine1, setAddressLine1] = useState(activeHome?.addressLine1 || "");
  const [city, setCity] = useState(activeHome?.city || "");
  const [state, setState] = useState(activeHome?.state || "");
  const [zipCode, setZipCode] = useState(activeHome?.zipCode || "");
  const [yearBuilt, setYearBuilt] = useState(activeHome?.yearBuilt?.toString() || "");
  const [squareFootage, setSquareFootage] = useState(activeHome?.squareFootage?.toString() || "");
  const [isSaving, setIsSaving] = useState(false);

  const updateHome = useMutation(api.homes.updateHome);

  const handleSave = async () => {
    if (!activeHome) return;

    setIsSaving(true);
    try {
      await updateHome({
        homeId: activeHome._id,
        name: name.trim() || undefined,
        addressLine1: addressLine1.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        zipCode: zipCode.trim() || undefined,
        yearBuilt: yearBuilt ? parseInt(yearBuilt) : undefined,
        squareFootage: squareFootage ? parseInt(squareFootage) : undefined,
      });
      Alert.alert("Success", "Home details updated");
      router.back();
    } catch (err) {
      Alert.alert("Error", "Failed to update home details");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !activeHome) {
    return <LoadingState message="Loading home details..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Home Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Basic Info */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Home Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Main House, Vacation Home"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.fieldRow}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>Year Built</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 2005"
                placeholderTextColor={colors.textMuted}
                value={yearBuilt}
                onChangeText={setYearBuilt}
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>Square Footage</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 2500"
                placeholderTextColor={colors.textMuted}
                value={squareFootage}
                onChangeText={setSquareFootage}
                keyboardType="number-pad"
              />
            </View>
          </View>
        </Card>

        {/* Address */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Street Address</Text>
            <TextInput
              style={styles.input}
              placeholder="123 Main Street"
              placeholderTextColor={colors.textMuted}
              value={addressLine1}
              onChangeText={setAddressLine1}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>City</Text>
            <TextInput
              style={styles.input}
              placeholder="City"
              placeholderTextColor={colors.textMuted}
              value={city}
              onChangeText={setCity}
            />
          </View>

          <View style={styles.fieldRow}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>State</Text>
              <TextInput
                style={styles.input}
                placeholder="TX"
                placeholderTextColor={colors.textMuted}
                value={state}
                onChangeText={setState}
                maxLength={2}
                autoCapitalize="characters"
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>ZIP Code</Text>
              <TextInput
                style={styles.input}
                placeholder="12345"
                placeholderTextColor={colors.textMuted}
                value={zipCode}
                onChangeText={setZipCode}
                keyboardType="number-pad"
                maxLength={5}
              />
            </View>
          </View>
        </Card>

        {/* Stats */}
        <Card style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Home Stats</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{activeHome.systemsCount || 0}</Text>
              <Text style={styles.statLabel}>Systems</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Math.round(activeHome.overallHealthScore || 0)}</Text>
              <Text style={styles.statLabel}>Health Score</Text>
            </View>
          </View>
        </Card>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <Button
          variant="primary"
          fullWidth
          onPress={handleSave}
          loading={isSaving}
        >
          Save Changes
        </Button>
      </View>
    </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  fieldRow: {
    flexDirection: "row",
    gap: 12,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textPrimary,
  },
  statsCard: {
    backgroundColor: "#F0FDFA",
    borderColor: "#99F6E4",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.primary,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  bottomPadding: {
    height: 40,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 36,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
