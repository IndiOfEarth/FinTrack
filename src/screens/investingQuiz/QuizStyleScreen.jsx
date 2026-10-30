// Final quiz screen that captures the user's preferred investing style (blue chip / balanced / growth).
import React from "react";
import { View, Text, Pressable } from "react-native";
// React Native UI components + Pressable reference:
// https://reactnative.dev/docs/components-and-apis
// https://reactnative.dev/docs/pressable

import Screen from "../../components/common/Screen.jsx";
import Card from "../../components/common/Card.jsx";
import { theme } from "../../theme/theme";
import { useInvestingQuiz } from "../../store/InvestingQuizContext.jsx";
// React Context (sharing state across screens):
// https://react.dev/reference/react/useContext

// Options for the user's investing style
// Rendered with Array.map (MDN):
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
const options = [
  {
    key: "bluechip",
    label: "Solid blue chips",
    desc: "Stable, long-term core holdings",
  },
  { key: "balanced", label: "Balanced", desc: "Mix of stability + growth" },
  { key: "growth", label: "Growth", desc: "Higher upside (and volatility)" },
];

export default function QuizStyleScreen({ navigation }) {
  // Access current answers and updater function from quiz context
  const { answers, setAnswers } = useInvestingQuiz();

  return (
    <Screen>
      {/* Layout container using Flexbox (React Native layout system):
          https://reactnative.dev/docs/flexbox */}
      <View style={{ flex: 1, padding: theme.spacing.screen }}>
        {/* Step indicator */}
        <Text
          style={{
            color: theme.colors.muted,
            fontWeight: "900",
            letterSpacing: 2,
          }}
        >
          STEP 4 / 4
        </Text>

        {/* Screen heading */}
        <Text
          style={{
            color: theme.colors.text,
            fontSize: 26,
            fontWeight: "900",
            marginTop: 8,
          }}
        >
          What’s your style?
        </Text>

        {/* List of selectable options */}
        <View style={{ marginTop: 14, gap: 12 }}>
          {options.map((o) => {
            // Check if this option is currently selected
            const selected = answers.style === o.key;

            return (
              <Pressable
                key={o.key}
                // When pressed:
                // 1) update the quiz answer in context
                // 2) move to results screen
                // React Navigation reference:
                // https://reactnavigation.org/docs/navigation-prop
                onPress={() => {
                  // Functional update ensures we use the latest state
                  // React state update pattern:
                  // https://react.dev/reference/react/useState#updating-state-based-on-the-previous-state
                  setAnswers((p) => ({ ...p, style: o.key }));
                  navigation.navigate("QuizResults");
                }}
                // Slight opacity change when pressed for feedback
                style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
              >
                <Card
                  style={{
                    padding: 14,
                    borderWidth: 1,

                    // Conditional styling to highlight selection
                    borderColor: selected
                      ? "rgba(168,85,247,0.55)"
                      : "rgba(255,255,255,0.06)",
                    backgroundColor: selected
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
                    {o.label}
                  </Text>

                  <Text style={{ color: theme.colors.muted, marginTop: 6 }}>
                    {o.desc}
                  </Text>
                </Card>
              </Pressable>
            );
          })}
        </View>

        {/* Spacer pushes Back button to bottom */}
        <View style={{ flex: 1 }} />

        {/* Back navigation control */}
        <Pressable
          onPress={() => navigation.goBack()}
          style={{ paddingVertical: 10 }}
        >
          <Text style={{ color: theme.colors.muted, fontWeight: "800" }}>
            Back
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}
