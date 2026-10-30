// Screen that lets the user select up to 3 preferred industries for recommendations.
import React from "react";
import { View, Text, Pressable } from "react-native";
// React Native components + Pressable:
// https://reactnative.dev/docs/components-and-apis
// https://reactnative.dev/docs/pressable

import Screen from "../../components/common/Screen.jsx";
import Card from "../../components/common/Card.jsx";
import Button from "../../components/common/Button.jsx";
import { theme } from "../../theme/theme";
import { useInvestingQuiz } from "../../store/InvestingQuizContext.jsx";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// React Context API (shared state between screens):
// https://react.dev/reference/react/useContext

// List of industries the user can choose from
// Rendered using Array.map (MDN):
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
const options = [
  { key: "tech", label: "Tech" },
  { key: "ai", label: "AI" },
  { key: "health", label: "Healthcare" },
  { key: "energy", label: "Energy" },
  { key: "finance", label: "Finance" },
  { key: "consumer", label: "Consumer" },
];

export default function QuizIndustriesScreen({ navigation }) {
  // Get quiz answers and updater function from context
  const { answers, setAnswers } = useInvestingQuiz();
  const insets = useSafeAreaInsets();

  // Current selected industries (fallback to empty array)
  const selected = answers.industries ?? [];

  // Toggle an industry on/off (max 3 selections)
  const toggle = (k) => {
    // Functional state update ensures we use the latest state value
    // React setState pattern reference:
    // https://react.dev/reference/react/useState#updating-state-based-on-the-previous-state
    setAnswers((p) => {
      const cur = p.industries ?? [];

      // Check if item already exists in array (MDN includes):
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes
      const exists = cur.includes(k);

      // If already selected, remove it (MDN filter):
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
      if (exists) return { ...p, industries: cur.filter((x) => x !== k) };

      // Prevent selecting more than 3
      if (cur.length >= 3) return p;

      // Otherwise add it (spread syntax):
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
      return { ...p, industries: [...cur, k] };
    });
  };

  // The bottom tab bar overlays the screen.
  // Give the ScrollView extra bottom padding so "Next" / "Back" can always be reached.
  const TAB_BAR_OVERLAY = 90; // default overlay size
  const bottomSpace = TAB_BAR_OVERLAY + insets.bottom + 18;

  return (
    <Screen>
      {/* Layout container using React Native Flexbox:
          https://reactnative.dev/docs/flexbox */}
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.screen,
          paddingBottom: bottomSpace,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text
          style={{
            color: theme.colors.muted,
            fontWeight: "900",
            letterSpacing: 2,
          }}
        >
          STEP 3 / 4
        </Text>

        <Text
          style={{
            color: theme.colors.text,
            fontSize: 26,
            fontWeight: "900",
            marginTop: 8,
          }}
        >
          What industries do you like?
        </Text>

        <Text style={{ color: theme.colors.muted, marginTop: 8 }}>
          Pick up to 3.
        </Text>

        {/* Option list */}
        <View style={{ marginTop: 14, gap: 12 }}>
          {options.map((o) => {
            // Determine if this option is selected
            const isOn = selected.includes(o.key);

            return (
              <Pressable
                key={o.key}
                onPress={() => toggle(o.key)}
                style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
              >
                <Card
                  style={{
                    padding: 14,
                    borderWidth: 1,

                    // Highlight selected options with different border/background
                    borderColor: isOn
                      ? "rgba(168,85,247,0.55)"
                      : "rgba(255,255,255,0.06)",
                    backgroundColor: isOn
                      ? "rgba(168,85,247,0.10)"
                      : theme.colors.surface,
                  }}
                >
                  <Text
                    style={{
                      color: theme.colors.text,
                      fontWeight: "900",
                      fontSize: 16,
                    }}
                  >
                    {o.label} {isOn ? "✓" : ""}
                  </Text>
                </Card>
              </Pressable>
            );
          })}
        </View>

        <View style={{ height: 22 }} />

        {/* Navigate to next quiz screen */}
        {/* React Navigation reference:
            https://reactnavigation.org/docs/navigation-prop */}
        <Button title="Next" onPress={() => navigation.navigate("QuizStyle")} />

        <View style={{ height: 10 }} />

        {/* Go back to previous screen */}
        <Button
          title="Back"
          variant="secondary"
          onPress={() => navigation.goBack()}
        />
      </ScrollView>
    </Screen>
  );
}
