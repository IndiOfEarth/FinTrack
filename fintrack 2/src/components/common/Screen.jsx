import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../theme/theme";

export default function Screen({ children, style, edges = ["left", "right", "bottom"] }) {
  return (
    <SafeAreaView
      edges={edges}
      style={[{ flex: 1, backgroundColor: theme.colors.base }, style]}
    >
      {children}
    </SafeAreaView>
  );
}