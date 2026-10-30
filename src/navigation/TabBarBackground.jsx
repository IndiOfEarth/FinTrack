import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../theme/theme";

export default function TabBarBackground() {
    const insets = useSafeAreaInsets();

    return (
        <View style={{
                position: "absolute",
                left: 14,
                right: 14,
                bottom: 8 + insets.bottom,
                height: 62,
                borderRadius: 26,
                backgroundColor: theme.colors.surface
            }}
        >
            {/* Inner highlight (top-left) */}
            <View
                pointerEvents="none"
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: 26,
                    shadowColor: theme.shadow.light,
                    shadowOpacity: 1,
                    shadowRadius: 18,
                    shadowOffset: { width: -8, height: -10 }
                }}
            />
        </View>
    )
}