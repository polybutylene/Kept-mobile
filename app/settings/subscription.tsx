"use client";

import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Linking,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../../convex/_generated/api";
import { colors } from "../../src/theme/tokens";
import { Card, Button, Badge, LoadingState } from "../../src/components/ui";

const TIERS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "",
    features: [
      "1 home",
      "5 systems",
      "Basic health scores",
      "Task reminders",
    ],
    limitations: [
      "No DIY guides",
      "No cost forecasts",
      "No packet sharing",
    ],
  },
  {
    id: "homeowner_pro",
    name: "Pro",
    price: 7.99,
    period: "month",
    features: [
      "3 homes",
      "Unlimited systems",
      "Full DIY guides",
      "Cost forecasts",
      "Packet sharing",
      "5 scans/month",
    ],
    recommended: true,
  },
  {
    id: "pro_plus",
    name: "Pro+",
    price: 14.99,
    period: "month",
    features: [
      "5 homes",
      "Everything in Pro",
      "Unlimited scans",
      "Seasonal checklists",
      "Exportable reports",
      "Service directory",
    ],
  },
];

export default function SubscriptionScreen() {
  const router = useRouter();

  const profile = useQuery(api.users.getCurrentProfile, {});
  const subscription = useQuery(api.subscriptions.getUserSubscription, {});

  const handleUpgrade = async (tierId: string) => {
    // In a real app, this would redirect to Stripe checkout
    Alert.alert(
      "Upgrade",
      `Opening checkout for ${tierId}...`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          onPress: () => {
            // Open Stripe checkout or in-app purchase
            Linking.openURL(`https://kept.app/checkout?tier=${tierId}`);
          },
        },
      ]
    );
  };

  const handleManageSubscription = () => {
    // Open Stripe customer portal
    Linking.openURL("https://kept.app/billing");
  };

  if (!profile) {
    return <LoadingState message="Loading subscription..." />;
  }

  const currentTier = profile.tier || "free";
  const isSubscribed = currentTier !== "free";

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Subscription</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Current Plan Banner */}
        <Card style={styles.currentPlanCard}>
          <Text style={styles.currentPlanLabel}>Current Plan</Text>
          <Text style={styles.currentPlanName}>
            {TIERS.find((t) => t.id === currentTier)?.name || "Free"}
          </Text>
          {subscription && subscription.status === "active" && (
            <Text style={styles.renewalDate}>
              {subscription.cancelAtPeriodEnd ? "Cancels" : "Renews"}{" "}
              {subscription.currentPeriodEnd
                ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                : "—"}
            </Text>
          )}
        </Card>

        {/* Plans */}
        {TIERS.map((tier) => {
          const isCurrentTier = tier.id === currentTier;
          const canUpgrade = !isCurrentTier && TIERS.indexOf(tier) > TIERS.findIndex((t) => t.id === currentTier);

          return (
            <Card
              key={tier.id}
              style={[
                styles.tierCard,
                tier.recommended && styles.tierCardRecommended,
                isCurrentTier && styles.tierCardCurrent,
              ]}
            >
              {tier.recommended && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>Most Popular</Text>
                </View>
              )}

              <View style={styles.tierHeader}>
                <Text style={styles.tierName}>{tier.name}</Text>
                {isCurrentTier && <Badge variant="primary">Current</Badge>}
              </View>

              <View style={styles.tierPricing}>
                {tier.price > 0 ? (
                  <>
                    <Text style={styles.tierPrice}>${tier.price}</Text>
                    <Text style={styles.tierPeriod}>/{tier.period}</Text>
                  </>
                ) : (
                  <Text style={styles.tierPrice}>Free</Text>
                )}
              </View>

              <View style={styles.featuresList}>
                {tier.features.map((feature, i) => (
                  <View key={i} style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
                {tier.limitations?.map((limitation, i) => (
                  <View key={`lim-${i}`} style={styles.featureItem}>
                    <Ionicons name="close-circle" size={16} color={colors.textMuted} />
                    <Text style={styles.limitationText}>{limitation}</Text>
                  </View>
                ))}
              </View>

              {canUpgrade && (
                <Button
                  variant={tier.recommended ? "primary" : "outline"}
                  fullWidth
                  onPress={() => handleUpgrade(tier.id)}
                  style={styles.upgradeButton}
                >
                  Upgrade to {tier.name}
                </Button>
              )}

              {isCurrentTier && isSubscribed && (
                <Button
                  variant="ghost"
                  fullWidth
                  onPress={handleManageSubscription}
                  style={styles.manageButton}
                >
                  Manage Subscription
                </Button>
              )}
            </Card>
          );
        })}

        {/* FAQ */}
        <Card style={styles.faqCard}>
          <Text style={styles.faqTitle}>Frequently Asked Questions</Text>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Can I cancel anytime?</Text>
            <Text style={styles.faqAnswer}>
              Yes! Cancel anytime from your account settings. You'll keep access until your billing period ends.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>What payment methods do you accept?</Text>
            <Text style={styles.faqAnswer}>
              We accept all major credit cards, Apple Pay, and Google Pay.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Is there a trial period?</Text>
            <Text style={styles.faqAnswer}>
              New users get a 7-day free trial of Pro features. No credit card required.
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
    paddingBottom: 100,
  },
  currentPlanCard: {
    backgroundColor: colors.primary,
    marginBottom: 16,
    alignItems: "center",
  },
  currentPlanLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255,255,255,0.7)",
  },
  currentPlanName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 4,
  },
  renewalDate: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginTop: 8,
  },
  tierCard: {
    marginBottom: 16,
    position: "relative",
  },
  tierCardRecommended: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  tierCardCurrent: {
    backgroundColor: "#F0FDFA",
    borderWidth: 2,
    borderColor: colors.primary,
  },
  recommendedBadge: {
    position: "absolute",
    top: -12,
    right: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  tierHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tierName: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  tierPricing: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 8,
  },
  tierPrice: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  tierPeriod: {
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  featuresList: {
    marginTop: 16,
    gap: 8,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  limitationText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  upgradeButton: {
    marginTop: 16,
  },
  manageButton: {
    marginTop: 12,
  },
  faqCard: {
    backgroundColor: "#F0F9FF",
    borderColor: "#BAE6FD",
  },
  faqTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0369A1",
    marginBottom: 16,
  },
  faqItem: {
    marginBottom: 16,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0369A1",
    marginBottom: 4,
  },
  faqAnswer: {
    fontSize: 14,
    color: "#0284C7",
    lineHeight: 20,
  },
  bottomPadding: {
    height: 40,
  },
});
