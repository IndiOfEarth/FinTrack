import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens (part of the onboarding process)
import OnboardingWelcomeScreen from "../screens/onboarding/OnboardingWelcomeScreen.jsx";
import OnboardingFirstTransactionScreen from "../screens/onboarding/OnboardingFirstTransactionScreen.jsx";
import OnboardingBudgetsScreen from "../screens/onboarding/OnboardingBudgetsScreen.jsx";
import OnboardingWatchlistScreen from "../screens/onboarding/OnboardingWatchlistScreen.jsx";

const Stack = createNativeStackNavigator(); // navigating screens on the stack

export default function OnboardingStack() {
     return (
        <Stack.Navigator screenOptions={{ headerShown: false}}>
            <Stack.Screen name="OnboardingWelcome" component={OnboardingWelcomeScreen} />
            <Stack.Screen name="OnboardingFirstTransaction" component={OnboardingFirstTransactionScreen} />
            <Stack.Screen name="OnboardingBudgets" component={OnboardingBudgetsScreen} />
            <Stack.Screen name="OnboardingWatchlist" component={OnboardingWatchlistScreen} />
        </Stack.Navigator>
     );
}