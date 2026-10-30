// Displays recommended starter stocks based on quiz answers and applies them to the user's watchlist.
import React, { useMemo, useState } from "react";
import { View, Text, Alert } from "react-native";
// React Native components + Alert reference:
// https://reactnative.dev/docs/components-and-apis
// https://reactnative.dev/docs/alert

import Screen from "../../components/common/Screen.jsx";
import Card from "../../components/common/Card.jsx";
import Button from "../../components/common/Button.jsx";
import { theme } from "../../theme/theme";

import { useInvestingQuiz } from "../../store/InvestingQuizContext.jsx";
// React Context reference (shared quiz state):
// https://react.dev/reference/react/useContext

import { buildWatchlistRecommendations } from "../../utils/recommendations";
// useMemo reference (memoising computed values):
// https://react.dev/reference/react/useMemo

import { replaceWatchlist } from "../../services/watchlistService";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function QuizResultsScreen({ navigation }) {
  // Access quiz answers + reset function from context
  const { answers, reset } = useInvestingQuiz();
  const insets = useSafeAreaInsets();

  // Local state for showing loading/disabled UI while saving
  const [saving, setSaving] = useState(false);
  // useState reference:
  // https://react.dev/reference/react/useState

  // Build recommendations based on answers
  // useMemo avoids recalculating unless answers change (performance optimisation)
  const recs = useMemo(
    () => buildWatchlistRecommendations(answers, 6),
    [answers],
  );

  // Apply recommendations to the user's watchlist (async operation)
  const apply = async () => {
    try {
      setSaving(true);

      // Replace user's watchlist with the new recommended symbols
      // Array.map reference (MDN):
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
      await replaceWatchlist(
        recs.map((r) => ({ symbol: r.symbol, exchange: null })),
      );

      // Clear quiz answers so the quiz starts fresh next time
      reset();

      // Return user to the InvestingHome screen
      // React Navigation reference:
      // https://reactnavigation.org/docs/navigation-prop
      navigation.popToTop();
      navigation.goBack(); // exit quiz stack to InvestingHome
    } catch (e) {
      // Display an error message if the watchlist save fails
      Alert.alert("Couldn’t apply watchlist", e.message);
    } finally {
      // Always stop loading state (success or failure)
      setSaving(false);
    }
  };

  // IMPORTANT:
  // Tabs remain visible, so the tab bar overlays the bottom of the screen.
  // Give ScrollView enough bottom padding so buttons never sit behind the tabs.
  const TAB_BAR_OVERLAY = 90;
  const bottomSpace = TAB_BAR_OVERLAY + insets.bottom + 18;

  return (
    <Screen>
      {/* Main container layout using Flexbox:
          https://reactnative.dev/docs/flexbox */}
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.screen,
          paddingBottom: bottomSpace,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            color: theme.colors.muted,
            fontWeight: "900",
            letterSpacing: 2,
          }}
        >
          YOUR STARTER WATCHLIST
        </Text>

        <Text
          style={{
            color: theme.colors.text,
            fontSize: 26,
            fontWeight: "900",
            marginTop: 8,
          }}
        >
          Tailored for you
        </Text>

        <Text style={{ color: theme.colors.muted, marginTop: 10 }}>
          Based on your answers, here are 6 stocks to start with. This will
          replace your current watchlist.
        </Text>

        {/* Render each recommended stock */}
        <View style={{ marginTop: 14, gap: 12 }}>
          {recs.map((r) => (
            <Card key={r.symbol} style={{ padding: 14 }}>
              <Text
                style={{
                  color: theme.colors.text,
                  fontWeight: "900",
                  fontSize: 16,
                }}
              >
                {r.symbol}
              </Text>
              <Text style={{ color: theme.colors.muted, marginTop: 4 }}>
                {r.name}
              </Text>
            </Card>
          ))}
        </View>

        <View style={{ height: 18 }} />

        {/* Apply / Save button */}
        <Button
          title={saving ? "Applying..." : "Add to my watchlist (replace)"}
          onPress={apply}
          disabled={saving} // prevent double-submitting while saving
        />

        <View style={{ height: 10 }} />

        {/* Cancel button */}
        <Button
          title="Cancel"
          variant="secondary"
          onPress={() => navigation.goBack()}
          disabled={saving}
        />
      </ScrollView>
    </Screen>
  );
}
