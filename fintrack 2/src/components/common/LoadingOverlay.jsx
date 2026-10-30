import React from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { theme } from "../../theme/theme";

export default function LoadingOverlay({ visible, label = "Working..." }) {
  if (!visible) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.55)",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        zIndex: 999,
      }}
    >
      <View
        style={{
          width: "100%",
          maxWidth: 340,
          backgroundColor: "rgba(20,20,24,0.92)",
          borderRadius: 22,
          padding: 18,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.10)",
        }}
      >
        <Text
          style={{
            color: theme.colors.text,
            fontWeight: "900",
            marginBottom: 10,
          }}
        >
          {label}
        </Text>
        <ActivityIndicator />
        <Text
          style={{ color: theme.colors.muted, marginTop: 10, fontSize: 12 }}
        >
          Please wait…
        </Text>
      </View>
    </View>
  );
}
