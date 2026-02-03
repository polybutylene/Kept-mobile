"use client";

import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  RefreshControl,
  Share,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../../convex/_generated/api";
import { colors } from "../../src/theme/tokens";
import { useActiveHome } from "../../src/hooks/useActiveHome";
import { Card, Button, LoadingState, EmptyPackets } from "../../src/components/ui";

export default function PacketScreen() {
  const router = useRouter();
  const { activeHome, isLoading } = useActiveHome();
  const [refreshing, setRefreshing] = useState(false);
  const [sharingPacketId, setSharingPacketId] = useState<string | null>(null);

  const packets = useQuery(
    api.packets.getHomePackets,
    activeHome ? { homeId: activeHome._id } : "skip"
  );

  const sharePacket = useMutation(api.packets.sharePacket);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleShare = async (packetId: string) => {
    setSharingPacketId(packetId);
    try {
      const token = await sharePacket({ packetId: packetId as any });
      const url = `https://kept.app/shared/${token}`;
      
      await Share.share({
        message: `Check out my home service packet: ${url}`,
        url: url,
      });
    } catch (err) {
      Alert.alert("Error", "Failed to share packet");
      console.error(err);
    } finally {
      setSharingPacketId(null);
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  if (isLoading) {
    return <LoadingState message="Loading packets..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Home Packet</Text>
        <Text style={styles.subtitle}>Share with contractors for better service</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Create New Packet CTA */}
        <Card style={styles.ctaCard}>
          <View style={styles.ctaContent}>
            <View style={styles.ctaText}>
              <Text style={styles.ctaTitle}>Need service? Start here.</Text>
              <Text style={styles.ctaDescription}>
                Create a professional packet to share with contractors. Get diagnostics, fair pricing, and questions to ask.
              </Text>
            </View>
            <Button
              variant="primary"
              onPress={() => router.push("/packet/new")}
              leftIcon={<Ionicons name="add" size={18} color="#FFFFFF" />}
            >
              New Packet
            </Button>
          </View>
        </Card>

        {/* Previous Packets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Packets</Text>

          {packets === undefined ? (
            <View style={styles.loadingPackets}>
              {[1, 2].map((i) => (
                <View key={i} style={styles.skeletonPacket} />
              ))}
            </View>
          ) : packets.length === 0 ? (
            <EmptyPackets onAdd={() => router.push("/packet/new")} />
          ) : (
            <View style={styles.packetsList}>
              {packets.map((packet) => (
                <Card
                  key={packet._id}
                  onPress={() => router.push(`/packet/${packet._id}`)}
                  style={styles.packetCard}
                >
                  <View style={styles.packetHeader}>
                    <View style={styles.packetInfo}>
                      <Text style={styles.packetTitle}>{packet.title}</Text>
                      {packet.symptom && (
                        <View style={styles.symptomBadge}>
                          <Text style={styles.symptomText}>{packet.symptom}</Text>
                        </View>
                      )}
                    </View>
                    <Pressable
                      style={styles.shareButton}
                      onPress={() => handleShare(packet._id)}
                      disabled={sharingPacketId === packet._id}
                    >
                      <Ionicons
                        name={packet.isShared ? "copy-outline" : "share-outline"}
                        size={20}
                        color={colors.primary}
                      />
                    </Pressable>
                  </View>

                  <View style={styles.packetMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={14} color={colors.textMuted} />
                      <Text style={styles.metaText}>
                        {formatTimeAgo(packet._creationTime)}
                      </Text>
                    </View>
                    {packet.isShared && (
                      <View style={styles.sharedBadge}>
                        <Ionicons name="eye-outline" size={12} color={colors.primary} />
                        <Text style={styles.sharedText}>{packet.viewsCount} views</Text>
                      </View>
                    )}
                  </View>

                  {/* Packet Summary */}
                  {packet.packetData && (
                    <View style={styles.packetSummary}>
                      {packet.packetData.systemInfo && (
                        <View style={styles.summaryItem}>
                          <Text style={styles.summaryLabel}>System</Text>
                          <Text style={styles.summaryValue}>
                            {packet.packetData.systemInfo.name || "General"}
                          </Text>
                        </View>
                      )}
                      {packet.packetData.diagnosis && (
                        <View style={styles.summaryItem}>
                          <Text style={styles.summaryLabel}>Likely Issue</Text>
                          <Text style={styles.summaryValue} numberOfLines={1}>
                            {packet.packetData.diagnosis.likelyIssue || "—"}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  <View style={styles.viewDetails}>
                    <Text style={styles.viewDetailsText}>View Details</Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                  </View>
                </Card>
              ))}
            </View>
          )}
        </View>

        {/* Help Section */}
        <Card style={styles.helpCard}>
          <Ionicons name="help-circle-outline" size={24} color={colors.primary} />
          <View style={styles.helpContent}>
            <Text style={styles.helpTitle}>What's a Home Packet?</Text>
            <Text style={styles.helpText}>
              A Home Packet contains your system details, symptom description, likely diagnosis, fair pricing estimates, and questions to ask contractors. Share it before getting quotes for better service.
            </Text>
          </View>
        </Card>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  ctaCard: {
    backgroundColor: "#CCFBF1",
    borderColor: "#99F6E4",
    marginBottom: 24,
  },
  ctaContent: {
    gap: 16,
  },
  ctaText: {
    gap: 4,
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#115E59",
  },
  ctaDescription: {
    fontSize: 14,
    color: "#0D9488",
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 12,
  },
  loadingPackets: {
    gap: 12,
  },
  skeletonPacket: {
    height: 120,
    backgroundColor: colors.border,
    borderRadius: 16,
  },
  packetsList: {
    gap: 12,
  },
  packetCard: {
    marginBottom: 0,
  },
  packetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  packetInfo: {
    flex: 1,
    gap: 8,
  },
  packetTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  symptomBadge: {
    backgroundColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  symptomText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  shareButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#CCFBF1",
    borderRadius: 20,
  },
  packetMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  sharedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#CCFBF1",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sharedText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.primary,
  },
  packetSummary: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 8,
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textPrimary,
    flex: 1,
    textAlign: "right",
  },
  viewDetails: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
  },
  helpCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#F0F9FF",
    borderColor: "#BAE6FD",
  },
  helpContent: {
    flex: 1,
    gap: 4,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0369A1",
  },
  helpText: {
    fontSize: 13,
    color: "#0284C7",
    lineHeight: 18,
  },
  bottomPadding: {
    height: 40,
  },
});
