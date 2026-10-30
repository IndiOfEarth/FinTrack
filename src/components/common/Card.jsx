import React from "react";
import { View, StyleSheet } from "react-native";
import { theme } from "../../theme/theme";

/**
 * Neumorphic "raised" card:
 * - base surface
 * - dark shadow bottom-right
 * - light highlight top-left (overlay rim)
 * - subtle border to separate from bg
 */
export default function Card({ children, style }) {
    return (
        <View style={[styles.wrap, style]}>
        {/* Dark shadow layer */}
        <View style={styles.shadowDark} />

        {/* Main surface */}
        <View style={styles.surface}>
            {/* Light rim/highlight overlay */}
            <View pointerEvents="none" style={styles.highlightRim} />
            {children}
        </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        position: "relative",
    },
    shadowDark: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: theme.radius.lg,
        // Outer shadow (dark) - works great on iOS, okay on Android with elevation
        shadowColor: theme.shadow.dark,
        shadowOpacity: 0.9,
        shadowRadius: 12,
        shadowOffset: { width: 6, height: 6 },
        elevation: 6,
    },
    surface: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        padding: 16,
        // subtle border so the surface reads against bg
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.04)",
        // slight “lift” to separate from the dark shadow layer
        transform: [{ translateX: -1 }, { translateY: -1 }],
    },
    highlightRim: {
        position: "absolute",
        top: 1,
        left: 1,
        right: 1,
        bottom: 1,
        borderRadius: theme.radius.lg,
        // border for the soft highlight
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderColor: "rgba(255,255,255,0.06)",
        // faint soft glow too
        shadowColor: theme.shadow.light,
        shadowOpacity: 0.35,
        shadowRadius: 10,
        shadowOffset: { width: -6, height: -6 },
    },
});