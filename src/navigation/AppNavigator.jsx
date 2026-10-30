import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider, useAuth } from "../store/AuthContext.js";
import AuthStack from "./AuthStack.jsx";
import MainTabs from "./MainTabs.jsx";
import AppStack from "./AppStack.jsx";
import { View, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import OnboardingStack from "./OnboardingStack.jsx";
import { TourProvider } from "../store/TourContext.js";

// Decides whether to show the login screen or the main app screens
// Dependent on whether there is a Supabase session
// Wraps the app in the AuthProvider setup in AuthContext.jsx
// Sets up React Navigation (NavigationContainer)
// Chooses which navigator to show: If logged out: AuthStack. If logged in: MainTabs. If still loading: Loading screen/Splash screen

function RootNavigator() {
  // Gets the auth status from the context
  // session - if 'session' exists the user is logged in
  // initialising - still checking if the user is logged in
  // profileLoading - flag for if profile is loading
  const { session, initialising, profileLoading } = useAuth();

  // Better looking boot splash instead of blank spinner
  if (initialising) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0B0B10",
        }}
      >
        <ActivityIndicator size="large" color="#a855f7" />
      </View>
    );
  }

  // For loading a profile after login, gate it too
  if (profileLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0B0B10",
        }}
      >
        <ActivityIndicator size="large" color="#a855f7" />
      </View>
    );
  }

  // If not logged-in yet
  if (!session) return <AuthStack />;

  // Gates the other content that requires an account.
  // if the session exists, show the main app tabs, otherwise show login/signup screens
  return <AppStack />;
}

export default function AppNavigator() {
  return (
    // RootNavigator and all screens can call useAuth()
    <AuthProvider>
      <TourProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </TourProvider>
    </AuthProvider>
  );
}
