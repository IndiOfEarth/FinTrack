import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import Screen from "../../components/common/Screen.jsx";
import Card from "../../components/common/Card.jsx";
import Button from "../../components/common/Button.jsx";
import { theme } from "../../theme/theme";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../store/AuthContext.js";

// These stocks are available to add to the watchlist upon sign-up
// Encourages the watchlist usage straight away - better user experience
const STOCKS = [
    { symbol: "AAPL", name: "Apple", tags: ["Blue Chip", "Tech"], exchange: "NASDAQ" },
    { symbol: "MSFT", name: "Microsoft", tags: ["Blue Chip", "AI"], exchange: "NASDAQ" },
    { symbol: "GOOGL", name: "Alphabet", tags: ["Tech", "AI"], exchange: "NASDAQ" },
    { symbol: "AMZN", name: "Amazon", tags: ["Tech"], exchange: "NASDAQ" },
    { symbol: "NVDA", name: "NVIDIA", tags: ["AI", "Tech"], exchange: "NASDAQ" },
    { symbol: "TSLA", name: "Tesla", tags: ["Tech"], exchange: "NASDAQ" },
    { symbol: "JPM", name: "JPMorgan", tags: ["Blue Chip", "Finance"], exchange: "NYSE" },
    { symbol: "JNJ", name: "Johnson & Johnson", tags: ["Blue Chip", "Pharma"], exchange: "NYSE" },
    { symbol: "PFE", name: "Pfizer", tags: ["Pharma"], exchange: "NYSE" },
    { symbol: "ASML", name: "ASML", tags: ["Tech"], exchange: "NASDAQ" },
    { symbol: "SHEL", name: "Shell", tags: ["UK", "Blue Chip"], exchange: "LSE" },
    { symbol: "AZN", name: "AstraZeneca", tags: ["UK", "Pharma"], exchange: "LSE" },
    { symbol: "BARC", name: "Barclays", tags: ["UK", "Finance"], exchange: "LSE" },
];

export default function OnboardingWatchlistScreen() {
    const { updateProfile } = useAuth();
    const [selected, setSelected] = useState({}); // { SYMBOL: true }
    const chosenCount = useMemo(() => Object.values(selected).filter(Boolean).length, [selected]);

    const toggle = (sym) => {
        setSelected((prev) => {
            const next = { ...prev, [sym]: !prev[sym] };
            return next;
        });
    };

    const finish = async () => {
        try {
            if (chosenCount < 3 || chosenCount > 5) {
                Alert.alert("Pick 3–5 stocks", "Choose at least 3 and no more than 5.");
                return;
            }

            const picks = STOCKS.filter((s) => selected[s.symbol]);

            const { data: userRes } = await supabase.auth.getUser();
            const uid = userRes?.user?.id;
            if (!uid) return;

            const rows = picks.map((p) => ({
                user_id: uid,
                symbol: p.symbol,
                exchange: p.exchange,
            }));

            // adds to the watchlist table - user_id and symbol
            const { error } = await supabase
                .from("watchlist")
                .upsert(rows, { onConflict: "user_id,symbol" });

            if (error) throw error;

            // Mark onboarding done (AppStack swaps to MainTabs)
            await updateProfile({ has_seen_onboarding: true });

        } 
        catch (e) {
            Alert.alert("Error", e.message);
        }
    };

    // Rendering the UI
    return (
        <Screen>
            <ScrollView contentContainerStyle={{ padding: theme.spacing.screen, paddingBottom: 28 }}>
                <Text style={{ color: theme.colors.text, fontSize: 22, fontWeight: "900", marginBottom: 8 }}>
                    Build your watchlist
                </Text>
                <Text style={{ color: theme.colors.muted, lineHeight: 20, marginBottom: 14 }}>
                    Pick 3–5 stocks to track. You can add or remove any time in Investing.
                </Text>

                <Card style={{ padding: 14, marginBottom: 16 }}>
                    <View style={{ gap: 10 }}>
                        {/* For each stock in the potential to add to watchlist, make a pressable button */}
                        {STOCKS.map((s) => {
                            const isOn = !!selected[s.symbol];
                            return (
                                <Pressable
                                    key={s.symbol}
                                    onPress={() => toggle(s.symbol)}
                                    style={{
                                        padding: 12,
                                        borderRadius: 14,
                                        backgroundColor: isOn ? "rgba(166, 90, 255, 0.18)" : "rgba(255,255,255,0.06)",
                                        borderWidth: 1,
                                        borderColor: isOn ? "rgba(166, 90, 255, 0.5)" : "rgba(255,255,255,0.08)",
                                    }}
                                >
                                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                        <View>
                                            <Text style={{ color: theme.colors.text, fontWeight: "900" }}>
                                                {s.symbol} <Text style={{ color: theme.colors.muted, fontWeight: "700" }}>• {s.name}</Text>
                                            </Text>
                                            <Text style={{ color: theme.colors.muted, marginTop: 4, fontSize: 12 }}>
                                                {s.tags.join(" • ")} • {s.exchange}
                                            </Text>
                                        </View>

                                        <Text style={{ color: isOn ? theme.colors.accent : "rgba(255,255,255,0.35)", fontWeight: "900" }}>
                                            {isOn ? "Selected" : "Tap"}
                                        </Text>
                                    </View>
                                </Pressable>
                            );
                        })}
                    </View>
                </Card>

                <Text style={{ color: theme.colors.muted, marginBottom: 12 }}>
                    Selected: {chosenCount} / 5
                </Text>

                <Button title="Finish setup" onPress={finish} />

                <View style={{ height: 12 }} />

                <Button
                    title="Skip"
                    variant="secondary"
                    onPress={async () => {
                        await updateProfile({ has_seen_onboarding: true });
                    }}
                />
            </ScrollView>
        </Screen>
    );
}