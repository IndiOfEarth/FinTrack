// PURPOSE - Creates the overlay component
// Shows a floating tooltip that points to something on the screen, while dimming the background

// What will happen here (what users see):
// Covers the whole screen
// Darkens the background
// Shows a positioned info bubble
// Has "Next" and "Skip" buttons
// Possibilty to anchor to a UI element

import React from "react";
import { Modal, View, Text, Pressable, Dimensions, StyleSheet } from "react-native";
import { theme }from "../../theme/theme";

// gets the screens width and height
// will be used to safely place the bubble at the correct point
const { width: W, height: H } = Dimensions.get("window");

export default function CoachMarkOverlay({
    // Component props (what is received by the component)
    visible,
    title,
    body,
    anchorRect,
    primaryText = "Next",
    secondaryText = "Skip",
    onPrimary,
    onSecondary
}) {
    if (!visible) return null; // render nothing if not visible (stops running in the background)

    // Basic bubble placement: below anchor if possible, otherwise above
    const bubbleWidth = Math.min(320, W - 32);
    const preferredTop = anchorRect ? (anchorRect.y + anchorRect.height + 12) : 120;
    const top = Math.min(preferredTop, H - 220);

    // horizontal positioning
    const left = anchorRect ? Math.min(Math.max(16, anchorRect.x + anchorRect.width / 2 - bubbleWidth / 2), W - bubbleWidth - 16) : 16;


    return (
        <Modal transparent animationType="fade" visible={visible}>
            <View style={{ flex: 1 }}>
                {/* Dim background */}
                <Pressable onPress={onSecondary} style={{ ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" }} />

                {/* Bubble */}
                <View
                    style={{
                        position: "absolute",
                        top,
                        left,
                        width: bubbleWidth,
                        backgroundColor: theme.colors.surface,
                        borderRadius: 16,
                        padding: 14,
                    }}
                >
                    <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "700", marginBottom: 6 }}>
                        {title}
                    </Text>
                    <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, lineHeight: 20 }}>
                        {body}
                    </Text>

                    <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
                        <Pressable onPress={onSecondary} style={{ paddingVertical: 8, paddingHorizontal: 10 }}>
                            <Text style={{ color: "rgba(255,255,255,0.7)", fontWeight: "600" }}>{secondaryText}</Text>
                        </Pressable>
                        <Pressable
                            onPress={onPrimary}
                            style={{ paddingVertical: 8, paddingHorizontal: 12, backgroundColor: theme.colors.accent, borderRadius: 12 }}
                        >
                            <Text style={{ color: "#fff", fontWeight: "700" }}>{primaryText}</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}