// InvestingStack.jsx
// Navigation for the Investing section of the app.
// Reference: https://reactnavigation.org/docs/native-stack-navigator

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import InvestingScreen from "../screens/investing/InvestingScreen.jsx";
import InvestingQuizStack from "./InvestingQuizStack.jsx";

const Stack = createNativeStackNavigator();

export default function InvestingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Main Investing screen */}
      <Stack.Screen name="InvestingHome" component={InvestingScreen} />

      {/* Nested quiz flow */}
      <Stack.Screen name="InvestingQuiz" component={InvestingQuizStack} />
    </Stack.Navigator>
  );
}
