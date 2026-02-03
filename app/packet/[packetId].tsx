"use client";

import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Share,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { colors } from "../../src/theme/tokens";
import { Card, Button, LoadingState } from "../../src/components/ui";

export default function PacketDetailScreen() {
  const { packetId } = useLocalSearchParams<{ packetId: string }>();
  const router = useRouter();
  const [isSharing, setIsSharing] = useState(false);

  const packet = useQuery(
    api.packets.getPacket,
    packetId ? { packetId: packetId as Id<"homePackets"> } : "skip"
  );

  const sharePacket = useMutation(api.packets.sharePacket);

  const handleShare = async () => {
    if (!packet) return;
    setIsSharing(true);
    try {
      const token = await sharePacket({ packetId: packet._id });
      const url = `https://kept.app/shared/${token}`;
      
      await Share.share({
        message: `Check out my home service packet: ${url}`,
        url: url,
      });
    } catch (err) {
      Alert.alert("Error", "Failed to share packet");
      console.error(err);
    } finally {
      setIsSharing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!packet) {
    return <LoadingState message="Loading packet..." />;
  }

  const packetData = packet.packetData as any;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Packet Details</Text>
        <Pressable style={styles.shareButton} onPress={handleShare} disabled={isSharing}>
          <Ionicons name="share-outline" size={22} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Title Card */}
        <Card style={styles.titleCard}>
          <Text style={styles.packetTitle}>{packet.title}</Text>
          {packet.symptom && (
            <View style={styles.symptomBadge}>
              <Text style={styles.symptomText}>{packet.symptom}</Text>
            </View>
          )}
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={14} color={colors.textMuted} />
            <Text style={styles.metaText}>
              Created {new Date(packet._creationTime).toLocaleDateString()}
            </Text>
            {packet.isShared && (
              <>
                <Text style={styles.metaDot}>•</Text>
                <Ionicons name="eye-outline" size={14} color={colors.primary} />
                <Text style={styles.metaTextPrimary}>{packet.viewsCount} views</Text>
              </>
            )}
          </View>
        </Card>

        {/* System Information */}
        {packetData?.systemInfo && (
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="hardware-chip-outline" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>System Information</Text>
            </View>

            <View style={styles.infoGrid}>
              {packetData.systemInfo.name && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>System</Text>
                  <Text style={styles.infoValue}>{packetData.systemInfo.name}</Text>
                </View>
              )}
              {packetData.systemInfo.age && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Age</Text>
                  <Text style={styles.infoValue}>{packetData.systemInfo.age} years</Text>
                </View>
              )}
              {packetData.systemInfo.manufacturer && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Brand</Text>
                  <Text style={styles.infoValue}>{packetData.systemInfo.manufacturer}</Text>
                </View>
              )}
              {packetData.systemInfo.modelNumber && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Model</Text>
                  <Text style={styles.infoValue}>{packetData.systemInfo.modelNumber}</Text>
                </View>
              )}
            </View>
          </Card>
        )}

        {/* Diagnosis */}
        {packetData?.diagnosis && (
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="medical-outline" size={20} color={colors.warning} />
              <Text style={styles.sectionTitle}>Likely Diagnosis</Text>
            </View>

            {packetData.diagnosis.likelyIssue && (
              <View style={styles.diagnosisBox}>
                <Text style={styles.diagnosisTitle}>{packetData.diagnosis.likelyIssue}</Text>
                {packetData.diagnosis.confidence && (
                  <Text style={styles.diagnosisConfidence}>
                    {packetData.diagnosis.confidence}% confidence
                  </Text>
                )}
              </View>
            )}

            {packetData.diagnosis.explanation && (
              <Text style={styles.diagnosisExplanation}>{packetData.diagnosis.explanation}</Text>
            )}

            {packetData.diagnosis.alternativeCauses?.length > 0 && (
              <View style={styles.alternativesBox}>
                <Text style={styles.alternativesTitle}>Other Possibilities</Text>
                {packetData.diagnosis.alternativeCauses.map((cause: string, i: number) => (
                  <Text key={i} style={styles.alternativeItem}>• {cause}</Text>
                ))}
              </View>
            )}
          </Card>
        )}

        {/* Cost Estimates */}
        {packetData?.costEstimate && (
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="cash-outline" size={20} color={colors.success} />
              <Text style={styles.sectionTitle}>Fair Pricing</Text>
            </View>

            <View style={styles.costGrid}>
              <View style={[styles.costCard, styles.costCardDiy]}>
                <Text style={styles.costLabel}>DIY Cost</Text>
                <Text style={styles.costValueDiy}>
                  {formatCurrency(packetData.costEstimate.diyLow || 0)} -{" "}
                  {formatCurrency(packetData.costEstimate.diyHigh || 0)}
                </Text>
              </View>
              <View style={[styles.costCard, styles.costCardPro]}>
                <Text style={styles.costLabel}>Pro Cost</Text>
                <Text style={styles.costValuePro}>
                  {formatCurrency(packetData.costEstimate.proLow || 0)} -{" "}
                  {formatCurrency(packetData.costEstimate.proHigh || 0)}
                </Text>
              </View>
            </View>

            {packetData.costEstimate.factors?.length > 0 && (
              <View style={styles.factorsBox}>
                <Text style={styles.factorsTitle}>Price Factors</Text>
                {packetData.costEstimate.factors.map((factor: string, i: number) => (
                  <Text key={i} style={styles.factorItem}>• {factor}</Text>
                ))}
              </View>
            )}
          </Card>
        )}

        {/* Questions to Ask */}
        {packetData?.questionsToAsk?.length > 0 && (
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="help-circle-outline" size={20} color={colors.info} />
              <Text style={styles.sectionTitle}>Questions to Ask</Text>
            </View>

            {packetData.questionsToAsk.map((question: string, i: number) => (
              <View key={i} style={styles.questionItem}>
                <Text style={styles.questionNumber}>{i + 1}</Text>
                <Text style={styles.questionText}>{question}</Text>
              </View>
            ))}
          </Card>
        )}

        {/* Red Flags */}
        {packetData?.redFlags?.length > 0 && (
          <Card style={[styles.section, styles.redFlagsCard]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="warning-outline" size={20} color={colors.danger} />
              <Text style={styles.sectionTitle}>Red Flags to Watch For</Text>
            </View>

            {packetData.redFlags.map((flag: string, i: number) => (
              <View key={i} style={styles.redFlagItem}>
                <Ionicons name="alert-circle" size={16} color={colors.danger} />
                <Text style={styles.redFlagText}>{flag}</Text>
              </View>
            ))}
          </Card>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Share Footer */}
      <View style={styles.footer}>
        <Button
          variant="primary"
          fullWidth
          onPress={handleShare}
          loading={isSharing}
          leftIcon={<Ionicons name="share-outline" size={18} color="#FFFFFF" />}
        >
          Share with Contractor
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
  shareButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#CCFBF1",
    borderRadius: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  titleCard: {
    marginBottom: 16,
  },
  packetTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  symptomBadge: {
    backgroundColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  symptomText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  metaText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  metaDot: {
    color: colors.textMuted,
  },
  metaTextPrimary: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.primary,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  infoItem: {
    width: "47%",
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textPrimary,
    marginTop: 2,
  },
  diagnosisBox: {
    backgroundColor: "#FEF3C7",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  diagnosisTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#92400E",
  },
  diagnosisConfidence: {
    fontSize: 13,
    color: "#B45309",
    marginTop: 4,
  },
  diagnosisExplanation: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  alternativesBox: {
    backgroundColor: colors.border,
    padding: 12,
    borderRadius: 8,
  },
  alternativesTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 8,
  },
  alternativeItem: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  costGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  costCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  costCardDiy: {
    backgroundColor: "#D1FAE5",
  },
  costCardPro: {
    backgroundColor: colors.border,
  },
  costLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  costValueDiy: {
    fontSize: 14,
    fontWeight: "700",
    color: "#065F46",
  },
  costValuePro: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  factorsBox: {
    backgroundColor: colors.border,
    padding: 12,
    borderRadius: 8,
  },
  factorsTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 8,
  },
  factorItem: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  questionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  questionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#DBEAFE",
    textAlign: "center",
    lineHeight: 24,
    fontSize: 12,
    fontWeight: "600",
    color: "#1E40AF",
  },
  questionText: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  redFlagsCard: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  redFlagItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
  },
  redFlagText: {
    flex: 1,
    fontSize: 14,
    color: "#991B1B",
    lineHeight: 20,
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
