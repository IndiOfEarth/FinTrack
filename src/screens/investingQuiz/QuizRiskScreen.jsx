// Screen that captures the user's risk tolerance as part of the investing quiz.
import React from "react";
import { View, Text, Pressable } from "react-native";
// React Native components documentation:
// https://reactnative.dev/docs/components-and-apis

import Screen from "../../components/common/Screen.jsx";
import Card from "../../components/common/Card.jsx";
import { theme } from "../../theme/theme";
import { useInvestingQuiz } from "../../store/InvestingQuizContext.jsx";
// React Context API reference:
// https://react.dev/reference/react/useContext

// Risk tolerance options rendered dynamically using Array.map()
// MDN reference for Array.prototype.map():
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
const options = [
  { key: "low", label: "Low risk", desc: "Stability first" },
  { key: "medium", label: "Medium risk", desc: "Balanced long-term growth" },
  { key: "high", label: "High risk", desc: "More upside, more volatility" },
  { key: "yolo", label: "YOLO", desc: "Speculative growth bets" },
];

export default function QuizRiskScreen({ navigation }) {
  // Access shared quiz state and update function
  const { answers, setAnswers } = useInvestingQuiz();

  return (
    <Screen>
      {/* Layout container using React Native Flexbox system:
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
          STEP 2 / 4
        </Text>

        {/* Main question heading */}
        <Text
          style={{
            color: theme.colors.text,
            fontSize: 26,
            fontWeight: "900",
            marginTop: 8,
          }}
        >
          Do you like risk?
        </Text>

        {/* Dynamically render each risk option */}
        <View style={{ marginTop: 14, gap: 12 }}>
          {options.map((o) => {
            // Determine if this option is currently selected
            const selected = answers.risk === o.key;

            return (
              <Pressable
                key={o.key}
                // When selected:
                // 1. Update risk value in context
                // 2. Navigate to next quiz step
                // React Navigation reference:
                // https://reactnavigation.org/docs/navigation-prop
                onPress={() => {
                  setAnswers((p) => ({ ...p, risk: o.key }));
                  navigation.navigate("QuizIndustries");
                }}
                // Pressable component allows touch interaction
                // https://reactnative.dev/docs/pressable
                style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
              >
                <Card
                  style={{
                    padding: 14,
                    borderWidth: 1,

                    // Conditional styling based on selection state
                    borderColor: selected
                      ? "rgba(168,85,247,0.55)"
                      : "rgba(255,255,255,0.06)",

                    backgroundColor: selected
                      ? "rgba(168,85,247,0.10)"
                      : theme.colors.surface,
                  }}
                >
                  {/* Option title */}
                  <Text
                    style={{
                      color: theme.colors.text,
                      fontWeight: "900",
                      fontSize: 16,
                    }}
                  >
                    {o.label}
                  </Text>

                  {/* Option description */}
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
