import React from "react";
import { View, Text } from "react-native";
import Screen from "../../components/common/Screen.jsx";
import Card from "../../components/common/Card.jsx";
import Button from "../../components/common/Button.jsx";
import { theme } from "../../theme/theme";
import { Ionicons } from "@expo/vector-icons";

// The first screen the users see during onboarding
// Shows a welcome message, explains the app, has a continue button, and navigates to next onboarding step
export default function OnboardingWelcomeScreen({ navigation }) {
    return (
        <Screen>
            <View style={{ flex: 1, paddingHorizontal: theme.spacing.screen, paddingTop: 28, paddingBottom: 24 }}>
                {/* Brand row */}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 26 }}>
                    <View
                        style={{
                        width: 40,
                        height: 40,
                        borderRadius: 14,
                        backgroundColor: "rgba(166, 90, 255, 0.18)",
                        borderWidth: 1,
                        borderColor: "rgba(166, 90, 255, 0.35)",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        overflow: "hidden"
                        }}
                    >
                        {/* soft glow */}
                        <View
                            pointerEvents="none"
                            style={{
                                position: "absolute",
                                width: 80,
                                height: 80,
                                borderRadius: 80,
                                backgroundColor: "rgba(166, 90, 255, 0.20)",
                                top: -25,
                                left: -25
                            }}
                        />
                        <Ionicons name="trending-up" size={20} color={theme.colors.accent} />
                    </View>

                    <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "900" }}>
                        theFinTrack
                    </Text>
                </View>

                {/* Headline */}
                <Text style={{ color: theme.colors.text, fontSize: 32, fontWeight: "900", lineHeight: 38 }}>
                    Welcome to{" "}
                    <Text style={{ color: theme.colors.accent }}>FinTrack</Text>.
                </Text>

                <Text style={{ color: theme.colors.muted, fontSize: 15, lineHeight: 22, marginTop: 10 }}>
                    A minimalist finance dashboard for people who want clarity — not clutter.
                    You’ll be set up in under a minute.
                </Text>

                {/* Feature bullets */}
                <Card style={{ marginTop: 18, padding: 14 }}>
                    <FeatureRow
                        icon="receipt-outline"
                        title="Track spending"
                        subtitle="Log income & expenses in seconds."
                    />
                    <Divider />
                    <FeatureRow
                        icon="speedometer-outline"
                        title="Set budgets"
                        subtitle="Know what’s left before the month ends."
                    />
                    <Divider />
                    <FeatureRow
                        icon="trending-up-outline"
                        title="Build a watchlist"
                        subtitle="Track 3–5 stocks you actually care about."
                    />
                </Card>

                {/* Spacer */}
                <View style={{ flex: 1 }} />

                {/* Progress and Actions */}
                <View style={{ marginBottom: 10 }}>
                    <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: "800" }}>
                        STEP 1 OF 3
                    </Text>
                </View>

                <Button
                    title="Get started"
                    onPress={() => navigation.navigate("OnboardingFirstTransaction")}
                />

                <View style={{ height: 12 }} />

                <Button
                    title="Skip setup"
                    variant="secondary"
                    onPress={() => navigation.navigate("OnboardingFirstTransaction")}
                />
            </View>
        </Screen>
    );
}

function FeatureRow({ icon, title, subtitle }) {
    return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 }}>
            <View
                style={{
                    width: 34,
                    height: 34,
                    borderRadius: 12,
                    backgroundColor: "rgba(255,255,255,0.06)",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.08)",
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                <Ionicons name={icon} size={18} color="rgba(255,255,255,0.8)" />
            </View>

            <View style={{ flex: 1 }}>
                <Text style={{ color: theme.colors.text, fontWeight: "900" }}>{title}</Text>
                <Text style={{ color: theme.colors.muted, fontSize: 12, marginTop: 2 }}>{subtitle}</Text>
            </View>
        </View>
    );
}

function Divider() {
    return (
            <View
                style={{
                    height: 1,
                    backgroundColor: "rgba(255,255,255,0.06)"
                }}
            />
    );
}