// InvestingQuizStack.jsx
// Navigation flow for the Investing Quiz feature.
// Reference: https://reactnavigation.org/docs/native-stack-navigator

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Importing all the other screens that are part of this flow
import QuizIntroScreen from "../screens/investingQuiz/QuizIntroScreen.jsx";
import QuizInvestorTypeScreen from "../screens/investingQuiz/QuizInvestorTypeScreen.jsx";
import QuizRiskScreen from "../screens/investingQuiz/QuizRiskScreen.jsx";
import QuizIndustriesScreen from "../screens/investingQuiz/QuizIndustriesScreen.jsx";
import QuizStyleScreen from "../screens/investingQuiz/QuizStyleScreen.jsx";
import QuizResultsScreen from "../screens/investingQuiz/QuizResultsScreen.jsx";

import { InvestingQuizProvider } from "../store/InvestingQuizContext.jsx";

// Create a stack navigator instance
const Stack = createNativeStackNavigator();

export default function InvestingQuizStack() {
  return (
    // InvestingQuizProvider wraps the quiz flow
    // This allows quiz answers to be shared across all quiz screens
    <InvestingQuizProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="QuizIntro" component={QuizIntroScreen} />
        <Stack.Screen
          name="QuizInvestorType"
          component={QuizInvestorTypeScreen}
        />
        <Stack.Screen name="QuizRisk" component={QuizRiskScreen} />
        <Stack.Screen name="QuizIndustries" component={QuizIndustriesScreen} />
        <Stack.Screen name="QuizStyle" component={QuizStyleScreen} />
        <Stack.Screen name="QuizResults" component={QuizResultsScreen} />
      </Stack.Navigator>
    </InvestingQuizProvider>
  );
}
