import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MainTabs from "./MainTabs.jsx";
import OnboardingStack from "./OnboardingStack.jsx";
import { useAuth } from "../store/AuthContext.js";

import StackHeader from "./StackHeader.jsx";
import { theme } from "../theme/theme";
import AddTransactionScreen from "../screens/transaction/AddTransactionScreen.jsx";

const Stack = createNativeStackNavigator();

export default function AppStack() {
  const { profile, profileLoading } = useAuth();

  if (profileLoading || !profile) {
    // You can replace with a nicer splash later
    return null;
  }

  const needsOnboarding = profile.has_seen_onboarding === false;

  return (
    <Stack.Navigator
      screenOptions={{
        header: (props) => <StackHeader {...props} />,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: theme.colors.base },
      }}
    >
      <Stack.Screen
        name="Main"
        component={needsOnboarding ? OnboardingStack : MainTabs}
        options={{}}
      />

      <Stack.Screen
        name="AddTransaction"
        component={AddTransactionScreen}
        options={{ presentation: "modal", headerShown: false }}
      />
    </Stack.Navigator>
  );
}