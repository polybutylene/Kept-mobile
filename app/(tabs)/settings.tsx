"use client";

import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../../convex/_generated/api";
import { colors } from "../../src/theme/tokens";
import { useActiveHome } from "../../src/hooks/useActiveHome";
import { Card, Badge, LoadingState, Button } from "../../src/components/ui";

export default function SettingsScreen() {
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const { activeHome, homes, isLoading } = useActiveHome();

  const profile = useQuery(api.users.getCurrentProfile, {});
  const subscription = useQuery(api.subscriptions.getUserSubscription, {});

  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            setIsSigningOut(true);
            try {
              // Clear auth state and redirect
              router.replace("/");
            } catch (err) {
              console.error(err);
            } finally {
              setIsSigningOut(false);
            }
          },
        },
      ]
    );
  };

  const getTierLabel = (tier: string) => {
    const labels: Record<string, string> = {
      free: "Free",
      homeowner_pro: "Pro",
      pro_plus: "Pro+",
      property_manager: "Property Manager",
    };
    return labels[tier] || tier;
  };

  const getTierColor = (tier: string) => {
    if (tier === "free") return "default" as const;
    if (tier === "homeowner_pro") return "primary" as const;
    return "success" as const;
  };

  if (isLoading) {
    return <LoadingState message="Loading settings..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        {profile && (
          <Card style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {profile.fullName?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || "U"}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{profile.fullName || "User"}</Text>
                <Text style={styles.profileEmail}>{profile.email}</Text>
              </View>
            </View>

            <View style={styles.tierRow}>
              <Text style={styles.tierLabel}>Current Plan</Text>
              <Badge variant={getTierColor(profile.tier || "free")}>
                {getTierLabel(profile.tier || "free")}
              </Badge>
            </View>

            {profile.tier === "free" && (
              <Pressable style={styles.upgradeButton} onPress={() => router.push("/settings/subscription")}>
                <Ionicons name="star" size={16} color="#FFFFFF" />
                <Text style={styles.upgradeButtonText}>Upgrade to Pro — $7.99/mo</Text>
              </Pressable>
            )}
          </Card>
        )}

        {/* Active Home */}
        {activeHome && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Active Home</Text>
            <Pressable style={styles.homeRow} onPress={() => router.push("/settings/home-details")}>
              <View style={styles.homeInfo}>
                <Text style={styles.homeName}>{activeHome.name || "My Home"}</Text>
                <Text style={styles.homeAddress}>
                  {activeHome.addressLine1 || "No address set"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>

            {homes.length > 1 && (
              <View style={styles.otherHomes}>
                <Text style={styles.otherHomesLabel}>
                  {homes.length - 1} other home{homes.length > 2 ? "s" : ""}
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* Subscription */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          <Pressable style={styles.menuItem} onPress={() => router.push("/settings/subscription")}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="card-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.menuItemText}>Manage Subscription</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>

          {subscription && subscription.status === "active" && (
            <View style={styles.subscriptionInfo}>
              <Text style={styles.subscriptionLabel}>
                {subscription.cancelAtPeriodEnd
                  ? "Cancels on"
                  : "Renews on"}{" "}
                {subscription.currentPeriodEnd
                  ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                  : "—"}
              </Text>
            </View>
          )}
        </Card>

        {/* Account Settings */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <Pressable style={styles.menuItem} onPress={() => router.push("/settings/home-details")}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="home-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.menuItemText}>Home Details</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>

          <Pressable style={styles.menuItem} onPress={() => router.push("/onboarding/systems")}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="construct-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.menuItemText}>Manage Systems</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>

          <Pressable style={styles.menuItem} onPress={() => router.push("/(manager)")}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="business-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.menuItemText}>Portfolio Manager</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>
        </Card>

        {/* Support */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <Pressable 
            style={styles.menuItem} 
            onPress={() => Linking.openURL("mailto:support@kept.app")}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.menuItemText}>Contact Support</Text>
            </View>
            <Ionicons name="open-outline" size={18} color={colors.textMuted} />
          </Pressable>

          <Pressable 
            style={styles.menuItem} 
            onPress={() => Linking.openURL("https://kept.app/help")}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="help-circle-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.menuItemText}>Help Center</Text>
            </View>
            <Ionicons name="open-outline" size={18} color={colors.textMuted} />
          </Pressable>

          <Pressable 
            style={styles.menuItem} 
            onPress={() => Linking.openURL("https://kept.app/privacy")}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="shield-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.menuItemText}>Privacy Policy</Text>
            </View>
            <Ionicons name="open-outline" size={18} color={colors.textMuted} />
          </Pressable>

          <Pressable 
            style={styles.menuItem} 
            onPress={() => Linking.openURL("https://kept.app/terms")}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="document-text-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.menuItemText}>Terms of Service</Text>
            </View>
            <Ionicons name="open-outline" size={18} color={colors.textMuted} />
          </Pressable>
        </Card>

        {/* Sign Out */}
        <Card style={styles.section}>
          <Pressable style={styles.signOutButton} onPress={handleSignOut} disabled={isSigningOut}>
            <Ionicons name="log-out-outline" size={20} color={colors.danger} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </Card>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>Kept</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appTagline}>Home Intelligence, kept simple.</Text>
        </View>

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  profileCard: {
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  profileEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tierRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tierLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  upgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  upgradeButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  homeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  homeInfo: {
    flex: 1,
  },
  homeName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  homeAddress: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  otherHomes: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  otherHomesLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuItemText: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  subscriptionInfo: {
    marginTop: 8,
  },
  subscriptionLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.danger,
  },
  appInfo: {
    alignItems: "center",
    paddingVertical: 24,
  },
  appName: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
  },
  appVersion: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  appTagline: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  bottomPadding: {
    height: 40,
  },
});
