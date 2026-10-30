import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SettingsScreen from "../screens/settings/SettingsScreen.jsx";
import BudgetsScreen from "../screens/settings/BudgetsScreen.jsx";

const Stack = createNativeStackNavigator();

// Defines the navigation flow inside the settings tab
export default function SettingsStack() {
  return (
    // When the settings tab opens it shows the Settings Screen
    // Can then navigate to the BudgetsScreen
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsHome" component={SettingsScreen} />
      <Stack.Screen name="Budgets" component={BudgetsScreen} />
    </Stack.Navigator>
  );
}
