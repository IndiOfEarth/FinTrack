import React, { useState } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { theme } from "../../theme/theme";

export default function Button({
    title,
    onPress,
    variant = "primary", // primary | secondary
    style,
    disabled, }) {
    const [pressed, setPressed] = useState(false);

    const isPrimary = variant === "primary";
    const bg = isPrimary ? theme.colors.accent : theme.colors.surface;

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
            style={[
                styles.hit,
                { opacity: disabled ? 0.55 : 1 },
                style,
            ]}
        >
            {/* OUTER: raised shadow container */}
            {!pressed && !disabled ? <View style={styles.shadowDark} /> : null}

            {/* SURFACE */}
            <View
                style={[
                    styles.surface,
                    {
                        backgroundColor: pressed && isPrimary ? theme.colors.accentDark : bg,
                        borderColor: "rgba(255,255,255,0.06)",
                    },

                    // Secondary buttons look “carved” slightly
                    !isPrimary ? styles.secondarySurface : null,

                    // Pressed = inset look (tight rim + no outer shadow)
                    pressed && !disabled ? styles.pressedSurface : null,
                    ]}
            >
                {/* Highlight rim (top-left) */}
                {!pressed && !disabled ? <View pointerEvents="none" style={styles.highlightRim} /> : null}

                {/* Inset shadow when pressed */}
                {pressed && !disabled ? <View pointerEvents="none" style={styles.insetShadow} /> : null}

                <Text
                style={[
                    styles.text,
                    { color: isPrimary ? "white" : theme.colors.text },
                ]}
                >
                    {title}
                </Text>
            </View>
        </Pressable>
    );
    }

const styles = StyleSheet.create({
    hit: {
        position: "relative",
        borderRadius: theme.radius.pill
    },
    shadowDark: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: theme.radius.pill,
        shadowColor: theme.shadow.dark,
        shadowOpacity: 1,
        shadowRadius: 16,
        shadowOffset: { width: 10, height: 10 },
        elevation: 10
    },
    surface: {
        borderRadius: theme.radius.pill,
        paddingVertical: 14,
        paddingHorizontal: 18,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        // tiny lift so it “sits” above the shadow layer
        transform: [{ translateX: -1 }, { translateY: -1 }]
    },
    secondarySurface: {
        backgroundColor: theme.colors.surface
    },
    pressedSurface: {
        transform: [{ translateX: 0 }, { translateY: 0 }]
    },
    highlightRim: {
        position: "absolute",
        top: 1,
        left: 1,
        right: 1,
        bottom: 1,
        borderRadius: theme.radius.pill,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderColor: "rgba(255,255,255,0.07)"
    },
    insetShadow: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: theme.radius.pill,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.35)"
    },
    text: {
        fontWeight: "800",
        letterSpacing: 0.2
    }
});