// Intro screen for the Investing Quiz feature.
// REFERENCE: https://reactnavigation.org/docs/navigation-prop

import React from "react";
import { View, Text } from "react-native";
import Screen from "../../components/common/Screen.jsx";
import Card from "../../components/common/Card.jsx";
import Button from "../../components/common/Button.jsx";
import { theme } from "../../theme/theme";
import { useInvestingQuiz } from "../../store/InvestingQuizContext.jsx";

export default function QuizIntroScreen({ navigation }) {
  // Access reset function from quiz context
  const { reset } = useInvestingQuiz();

  return (
    <Screen>
      {/* Main layout container */}
      <View
        style={{
          flex: 1,
          padding: theme.spacing.screen,
          justifyContent: "center",
        }}
      >
        <Card style={{ padding: 18 }}>
          {/* Section label */}
          <Text
            style={{
              color: theme.colors.muted,
              fontWeight: "900",
              letterSpacing: 2,
            }}
          >
            INVESTING QUIZ
          </Text>

          {/* Main heading */}
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 26,
              fontWeight: "900",
              marginTop: 10,
            }}
          >
            Not sure what to invest in?
          </Text>

          {/* Description text */}
          <Text
            style={{ color: theme.colors.muted, marginTop: 10, lineHeight: 20 }}
          >
            Answer a few questions and FinTrack will build a starter watchlist
            tailored to you.
            {"\n\n"}You can edit it anytime.
          </Text>

          {/* Start button */}
          <View style={{ marginTop: 16 }}>
            <Button
              title="Start"
              onPress={() => {
                // Reset previous quiz answers
                reset();

                // Navigate to first quiz question screen
                navigation.navigate("QuizInvestorType");
              }}
            />
          </View>

          {/* Spacer */}
          <View style={{ height: 10 }} />

          {/* Cancel button - returns to previous screen */}
          <Button
            title="Cancel"
            variant="secondary"
            onPress={() => navigation.goBack()}
          />
        </Card>
      </View>
    </Screen>
  );
}
