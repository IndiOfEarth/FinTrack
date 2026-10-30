import React, { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
// import * as SplashScreen from "expo-splash-screen";
import AppNavigator from "./src/navigation/AppNavigator.jsx";
import { StatusBar } from "expo-status-bar";

// Keep the splash screen visible while we prepare the app
// SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // optional tasks here
      } finally {
        setAppReady(true);
      }
    })();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appReady) {
      await SplashScreen.hideAsync();
    }
  }, [appReady]);

  if (!appReady) return null;

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <StatusBar style="light" />
      <AppNavigator />
    </View>
  );
}


