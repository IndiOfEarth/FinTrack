// Screen that captures the user's investing experience level as part of the quiz flow.

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

// Static list of investor type options displayed to the user
// Array mapping logic based on MDN Array.prototype.map():
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
const options = [
  { key: "new", label: "I'm new", desc: "I want a safe starting point" },
  {
    key: "casual",
    label: "I invest occasionally",
    desc: "Some experience, still learning",
  },
  {
    key: "confident",
    label: "Confident",
    desc: "I follow markets and fundamentals",
  },
  {
    key: "experienced",
    label: "Experienced",
    desc: "I know my risk and strategy",
  },
];

export default function QuizInvestorTypeScreen({ navigation }) {
  // Access quiz state and updater function from context
  const { answers, setAnswers } = useInvestingQuiz();

  return (
    <Screen>
      {/* Main container layout using Flexbox (React Native layout system):
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
          STEP 1 / 4
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
          What kind of investor are you?
        </Text>

        {/* Render each investor option dynamically */}
        <View style={{ marginTop: 14, gap: 12 }}>
          {options.map((o) => {
            // Check if this option is currently selected
            const selected = answers.investorType === o.key;

            return (
              <Pressable
                key={o.key}
                // On selection:
                // 1. Update context state
                // 2. Navigate to next quiz screen
                // React Navigation reference:
                // https://reactnavigation.org/docs/navigation-prop
                onPress={() => {
                  setAnswers((p) => ({ ...p, investorType: o.key }));
                  navigation.navigate("QuizRisk");
                }}
                // Pressable API reference:
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

        {/* Back navigation button */}
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
