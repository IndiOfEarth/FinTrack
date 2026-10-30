import React from "react";
import { TextInput } from "react-native";
import { theme } from "../../theme/theme";

// Neumorphic-ish "inset" input used across the app
export default function Input({ style, ...props }) {
  return (
    <TextInput
      {...props}
      placeholderTextColor="rgba(255,255,255,0.35)"
      selectionColor={theme.colors.accent}
      style={[
        {
          // Slightly lighter than base, but still "sunken"
          backgroundColor: "rgba(255,255,255,0.03)",
          color: theme.colors.text,

          borderRadius: theme.radius.lg,
          paddingVertical: 14,
          paddingHorizontal: 14,

          // Softer border so it doesn't look like a box inside a box
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.03)",

          // Optional: makes it feel a bit more inset on iOS
          shadowColor: theme.shadow.dark,
          shadowOpacity: 1,
          shadowRadius: 8,
          shadowOffset: { width: 4, height: 4 },
          elevation: 2,
        },
        style,
      ]}
    />
  );
}