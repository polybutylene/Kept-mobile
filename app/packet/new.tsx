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

export default function NewPacketScreen() {
  const router = useRouter();
  const { activeHome, isLoading } = useActiveHome();
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);
  const [symptom, setSymptom] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const systems = useQuery(
    api.systems.getHomeSystems,
    activeHome ? { homeId: activeHome._id } : "skip"
  );

  const createPacket = useMutation(api.packets.createPacket);

  const handleCreate = async () => {
    if (!activeHome) {
      Alert.alert("Error", "No home selected");
      return;
    }

    if (!symptom.trim()) {
      Alert.alert("Error", "Please describe the symptom or issue");
      return;
    }

    setIsCreating(true);
    try {
      const packetId = await createPacket({
        homeId: activeHome._id,
        systemId: selectedSystemId as any,
        title: symptom.trim(),
        symptom: symptom.trim(),
        description: description.trim() || undefined,
      });
      router.replace(`/packet/${packetId}`);
    } catch (err) {
      Alert.alert("Error", "Failed to create packet");
      console.error(err);
    } finally {
      setIsCreating(false);
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
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>New Packet</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* System Selection */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Which system has the issue?</Text>
          <Text style={styles.sectionHint}>Optional - select if you know which system</Text>

          <View style={styles.systemsList}>
            <Pressable
              style={[styles.systemOption, !selectedSystemId && styles.systemOptionSelected]}
              onPress={() => setSelectedSystemId(null)}
            >
              <Text style={[styles.systemOptionText, !selectedSystemId && styles.systemOptionTextSelected]}>
                Not sure / General
              </Text>
              {!selectedSystemId && (
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              )}
            </Pressable>

            {systems?.map((system) => (
              <Pressable
                key={system._id}
                style={[styles.systemOption, selectedSystemId === system._id && styles.systemOptionSelected]}
                onPress={() => setSelectedSystemId(system._id)}
              >
                <View>
                  <Text
                    style={[
                      styles.systemOptionText,
                      selectedSystemId === system._id && styles.systemOptionTextSelected,
                    ]}
                  >
                    {system.name || system.systemType?.name}
                  </Text>
                  <Text style={styles.systemOptionCategory}>{system.systemType?.category}</Text>
                </View>
                {selectedSystemId === system._id && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                )}
              </Pressable>
            ))}
          </View>
        </Card>

        {/* Symptom */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>What's the issue?</Text>
          <Text style={styles.sectionHint}>Describe what you're experiencing</Text>

          <TextInput
            style={styles.input}
            placeholder="e.g., AC not cooling, water heater leaking..."
            placeholderTextColor={colors.textMuted}
            value={symptom}
            onChangeText={setSymptom}
          />
        </Card>

        {/* Description */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Additional details (optional)</Text>
          <Text style={styles.sectionHint}>Any other information that might help</Text>

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="When did it start? Any sounds or smells? Previous repairs?"
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </Card>

        {/* What's Included */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>Your packet will include:</Text>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.infoText}>System information and age</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.infoText}>Likely diagnosis based on symptoms</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.infoText}>Fair pricing estimates</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.infoText}>Questions to ask contractors</Text>
            </View>
          </View>
        </Card>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Create Button */}
      <View style={styles.footer}>
        <Button
          variant="primary"
          fullWidth
          onPress={handleCreate}
          loading={isCreating}
          disabled={!symptom.trim()}
        >
          Create Packet
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
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  sectionHint: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: 12,
  },
  systemsList: {
    gap: 8,
  },
  systemOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.border,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  systemOptionSelected: {
    backgroundColor: "#CCFBF1",
    borderColor: colors.primary,
  },
  systemOptionText: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  systemOptionTextSelected: {
    color: colors.primary,
  },
  systemOptionCategory: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    textTransform: "capitalize",
  },
  input: {
    backgroundColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textPrimary,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  infoCard: {
    backgroundColor: "#F0F9FF",
    borderColor: "#BAE6FD",
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0369A1",
    marginBottom: 12,
  },
  infoList: {
    gap: 8,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: "#0284C7",
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
