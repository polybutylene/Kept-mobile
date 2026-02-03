"use client";

import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../../convex/_generated/api";
import { colors } from "../../src/theme/tokens";
import { useActiveHome } from "../../src/hooks/useActiveHome";
import { Card, Button, LoadingState } from "../../src/components/ui";

const COMMON_SYMPTOMS = [
  { id: "no-cool", label: "AC not cooling", icon: "snow-outline" },
  { id: "no-heat", label: "No heat", icon: "flame-outline" },
  { id: "water-leak", label: "Water leak", icon: "water-outline" },
  { id: "no-hot-water", label: "No hot water", icon: "thermometer-outline" },
  { id: "electrical", label: "Electrical issue", icon: "flash-outline" },
  { id: "strange-noise", label: "Strange noise", icon: "volume-high-outline" },
  { id: "smell", label: "Unusual smell", icon: "warning-outline" },
  { id: "other", label: "Other issue", icon: "help-circle-outline" },
];

export default function TroubleshootScreen() {
  const router = useRouter();
  const { activeHome, isLoading } = useActiveHome();
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null);
  const [customSymptom, setCustomSymptom] = useState("");

  const systems = useQuery(
    api.systems.getHomeSystems,
    activeHome ? { homeId: activeHome._id } : "skip"
  );

  const handleContinue = () => {
    const symptom = selectedSymptom === "other" ? customSymptom : 
      COMMON_SYMPTOMS.find(s => s.id === selectedSymptom)?.label || "";
    
    if (symptom) {
      // Navigate to create packet with symptom pre-filled
      router.push({
        pathname: "/packet/new",
        params: { symptom },
      });
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Troubleshoot</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="help-circle" size={48} color={colors.warning} />
          </View>
          <Text style={styles.heroTitle}>Something's not right?</Text>
          <Text style={styles.heroSubtitle}>
            Let's figure out what's going on and get you help fast.
          </Text>
        </View>

        {/* Common Symptoms */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>What's happening?</Text>
          <Text style={styles.sectionHint}>Select the symptom that best matches your issue</Text>

          <View style={styles.symptomGrid}>
            {COMMON_SYMPTOMS.map((symptom) => (
              <Pressable
                key={symptom.id}
                style={[
                  styles.symptomCard,
                  selectedSymptom === symptom.id && styles.symptomCardSelected,
                ]}
                onPress={() => setSelectedSymptom(symptom.id)}
              >
                <Ionicons
                  name={symptom.icon as any}
                  size={24}
                  color={selectedSymptom === symptom.id ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.symptomLabel,
                    selectedSymptom === symptom.id && styles.symptomLabelSelected,
                  ]}
                >
                  {symptom.label}
                </Text>
                {selectedSymptom === symptom.id && (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  </View>
                )}
              </Pressable>
            ))}
          </View>

          {/* Custom symptom input */}
          {selectedSymptom === "other" && (
            <View style={styles.customInput}>
              <Text style={styles.customInputLabel}>Describe the issue:</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Water stain on ceiling, furnace cycling frequently..."
                placeholderTextColor={colors.textMuted}
                value={customSymptom}
                onChangeText={setCustomSymptom}
                multiline
              />
            </View>
          )}
        </Card>

        {/* What Happens Next */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>What happens next?</Text>
          <View style={styles.infoSteps}>
            <View style={styles.infoStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>We'll analyze your symptom and system data</Text>
            </View>
            <View style={styles.infoStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>Get a likely diagnosis and cost estimate</Text>
            </View>
            <View style={styles.infoStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>Create a packet to share with contractors</Text>
            </View>
          </View>
        </Card>

        {/* Quick Links */}
        {systems && systems.length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Or browse by system</Text>
            <View style={styles.systemLinks}>
              {systems.slice(0, 4).map((system) => (
                <Pressable
                  key={system._id}
                  style={styles.systemLink}
                  onPress={() => router.push(`/systems/${system._id}`)}
                >
                  <Text style={styles.systemLinkText}>
                    {system.name || system.systemType?.name}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </Pressable>
              ))}
            </View>
          </Card>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <Button
          variant="primary"
          fullWidth
          onPress={handleContinue}
          disabled={!selectedSymptom || (selectedSymptom === "other" && !customSymptom.trim())}
        >
          Continue
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
  hero: {
    alignItems: "center",
    marginBottom: 24,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  sectionHint: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: 16,
  },
  symptomGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  symptomCard: {
    width: "47%",
    backgroundColor: colors.border,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
  },
  symptomCardSelected: {
    backgroundColor: "#CCFBF1",
    borderColor: colors.primary,
  },
  symptomLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: "center",
  },
  symptomLabelSelected: {
    color: colors.primary,
    fontWeight: "600",
  },
  checkmark: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  customInput: {
    marginTop: 16,
  },
  customInputLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textPrimary,
    minHeight: 80,
    textAlignVertical: "top",
  },
  infoCard: {
    backgroundColor: "#F0F9FF",
    borderColor: "#BAE6FD",
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0369A1",
    marginBottom: 12,
  },
  infoSteps: {
    gap: 12,
  },
  infoStep: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#0284C7",
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    color: "#0284C7",
  },
  systemLinks: {
    marginTop: 12,
    gap: 8,
  },
  systemLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  systemLinkText: {
    fontSize: 15,
    color: colors.textPrimary,
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
