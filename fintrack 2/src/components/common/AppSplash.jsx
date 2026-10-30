import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { theme } from "../../theme/theme";

export default function AppSplash({ label = "Loading FinTrack..." }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.base,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <Text
        style={{ color: theme.colors.text, fontSize: 24, fontWeight: "900" }}
      >
        theFinTrack
      </Text>

      <Text
        style={{ color: theme.colors.muted, marginTop: 10, marginBottom: 18 }}
      >
        {label}
      </Text>

      <ActivityIndicator />
    </View>
  );
}
