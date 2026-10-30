import React, { useMemo, useState, useCallback, useEffect } from "react";
import { View, Text, Pressable, Alert, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Screen from "../../components/common/Screen.jsx";
import Card from "../../components/common/Card.jsx";
import Button from "../../components/common/Button.jsx";
import LoadingOverlay from "../../components/common/LoadingOverlay.jsx";
import { theme } from "../../theme/theme";

import { useAuth } from "../../store/AuthContext.js";
import { useTour } from "../../store/TourContext.js";

function Divider() {
  return (
    <View style={{ height: 1, backgroundColor: "rgba(255,255,255,0.06)" }} />
  );
}

function SectionTitle({ children }) {
  return (
    <Text
      style={{
        color: "rgba(255,255,255,0.55)",
        fontWeight: "900",
        letterSpacing: 1.4,
        fontSize: 12,
        marginBottom: 10,
        marginTop: 18,
      }}
    >
      {String(children).toUpperCase()}
    </Text>
  );
}

function Row({ icon, title, subtitle, right, onPress, disabled }) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => ({
        opacity: disabled ? 0.45 : pressed ? 0.75 : 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        gap: 12,
      })}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            backgroundColor: "rgba(255,255,255,0.06)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name={icon} size={18} color={theme.colors.text} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.colors.text, fontWeight: "900" }}>
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={{ color: theme.colors.muted, fontSize: 12, marginTop: 2 }}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      {right ? (
        <Text style={{ color: theme.colors.muted, fontWeight: "800" }}>
          {right}
        </Text>
      ) : (
        <Ionicons
          name="chevron-forward"
          size={18}
          color="rgba(255,255,255,0.35)"
        />
      )}
    </Pressable>
  );
}

export default function SettingsScreen({ navigation }) {
  const { signOut, profile, updateProfile } = useAuth();
  const { start, setStep } = useTour();

  const [busy, setBusy] = useState(false);

  // local-only prefs (no native notif setup needed)
  const [notifEnabled, setNotifEnabled] = useState(true);

  const displayName = useMemo(
    () => profile?.display_name ?? "Friend",
    [profile],
  );
  const currency = useMemo(() => profile?.currency ?? "GBP", [profile]);

  // Load notif toggle from storage
  useEffect(() => {
    (async () => {
      try {
        const v = await AsyncStorage.getItem("fintrack_notif_enabled");
        if (v !== null) setNotifEnabled(v === "1");
      } catch {}
    })();
  }, []);

  const setNotif = useCallback(async (next) => {
    setNotifEnabled(next);
    try {
      await AsyncStorage.setItem("fintrack_notif_enabled", next ? "1" : "0");
    } catch {}
  }, []);

  const handleSignOut = useCallback(() => {
    Alert.alert("Sign out?", "You can sign back in anytime.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          try {
            setBusy(true);
            await Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Warning,
            );
            await signOut();
          } catch (e) {
            Alert.alert("Sign out failed", e.message);
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  }, [signOut]);

  // Currency picker: updates profile.currency
  const handleCurrency = useCallback(() => {
    Alert.alert("Currency", "Choose your default currency.", [
      {
        text: "GBP (£)",
        onPress: async () => {
          try {
            setBusy(true);
            await Haptics.selectionAsync();
            await updateProfile({ currency: "GBP" });
          } catch (e) {
            Alert.alert("Update failed", e.message);
          } finally {
            setBusy(false);
          }
        },
      },
      {
        text: "USD ($)",
        onPress: async () => {
          try {
            setBusy(true);
            await Haptics.selectionAsync();
            await updateProfile({ currency: "USD" });
          } catch (e) {
            Alert.alert("Update failed", e.message);
          } finally {
            setBusy(false);
          }
        },
      },
      {
        text: "EUR (€)",
        onPress: async () => {
          try {
            setBusy(true);
            await Haptics.selectionAsync();
            await updateProfile({ currency: "EUR" });
          } catch (e) {
            Alert.alert("Update failed", e.message);
          } finally {
            setBusy(false);
          }
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  }, [updateProfile]);

  // Notifications toggle: local setting
  const handleNotifications = useCallback(() => {
    const next = !notifEnabled;
    Haptics.selectionAsync();
    setNotif(next);
    Alert.alert(
      "Notifications",
      next ? "Budget alerts enabled." : "Budget alerts disabled.",
    );
  }, [notifEnabled, setNotif]);

  // Reset onboarding + tooltips
  const handleHelpReset = useCallback(() => {
    Alert.alert(
      "Help & onboarding",
      "What would you like to do?",
      [
        {
          text: "Replay tooltips",
          onPress: async () => {
            try {
              setBusy(true);
              await Haptics.selectionAsync();

              // Resets flags in profiles
              await updateProfile({
                has_seen_tooltips: false,
                tooltips_seen: {},
              });

              // Restart tour overlay at step 0
              setStep(null);
              start();

              Alert.alert("Done", "Tooltips will show again on the main tabs.");
            } catch (e) {
              Alert.alert("Error", e.message);
            } finally {
              setBusy(false);
            }
          },
        },
        {
          text: "Replay onboarding flow",
          onPress: async () => {
            try {
              setBusy(true);
              await Haptics.selectionAsync();

              await updateProfile({
                has_seen_onboarding: false,
              });

              Alert.alert(
                "Done",
                "Onboarding will show on next app open / session.",
              );
            } catch (e) {
              Alert.alert("Error", e.message);
            } finally {
              setBusy(false);
            }
          },
        },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true },
    );
  }, [updateProfile, setStep, start]);

  return (
    <Screen>
      <LoadingOverlay visible={busy} label="Updating..." />

      {/* ScrollView ensures can reach 'sign out' button */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.screen,
          paddingBottom: 140,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={{ alignItems: "center", paddingTop: 6, marginBottom: 14 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "950",
              color: theme.colors.text,
            }}
          >
            Settings
          </Text>
          <Text style={{ color: theme.colors.muted, marginTop: 6 }}>
            Budgets, preferences and account.
          </Text>
        </View>

        {/* Account */}
        <Card style={{ padding: 16 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.colors.muted, fontSize: 12 }}>
                Signed in as
              </Text>
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 18,
                  fontWeight: "950",
                  marginTop: 2,
                }}
              >
                {displayName}
              </Text>
            </View>

            <Pressable
              onPress={handleCurrency}
              style={({ pressed }) => ({
                opacity: pressed ? 0.75 : 1,
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 999,
                backgroundColor: "rgba(255,255,255,0.06)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
              })}
            >
              <Text style={{ color: theme.colors.text, fontWeight: "900" }}>
                {currency}
              </Text>
            </Pressable>
          </View>
        </Card>

        {/* Finance */}
        <SectionTitle>Finance</SectionTitle>
        <Card style={{ paddingHorizontal: 16, paddingVertical: 6 }}>
          <Row
            icon="wallet"
            title="Manage budgets"
            subtitle="Set monthly limits per category"
            onPress={async () => {
              await Haptics.selectionAsync();
              navigation.navigate("Budgets");
            }}
          />
          <Divider />
          <Row
            icon="cash-outline"
            title="Currency"
            subtitle="Used for totals and formatting"
            right={currency}
            onPress={handleCurrency}
          />
        </Card>

        {/* Preferences */}
        <SectionTitle>Preferences</SectionTitle>
        <Card style={{ paddingHorizontal: 16, paddingVertical: 6 }}>
          <Row
            icon="notifications-outline"
            title="Notifications"
            subtitle="Budget alerts and reminders"
            right={notifEnabled ? "On" : "Off"}
            onPress={handleNotifications}
          />
          <Divider />
          <Row
            icon="help-circle-outline"
            title="Help & onboarding"
            subtitle="Replay tooltips / onboarding"
            right="Open"
            onPress={handleHelpReset}
          />
        </Card>

        {/* Sign out */}
        <View style={{ marginTop: 18 }}>
          <Button title="Sign Out" onPress={handleSignOut} />
        </View>

        <Text
          style={{
            color: "rgba(255,255,255,0.35)",
            textAlign: "center",
            marginTop: 14,
            fontSize: 12,
          }}
        >
          FinTrack v1 • Expo + Supabase
        </Text>
      </ScrollView>
    </Screen>
  );
}
