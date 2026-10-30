// A luxury gradient + glow button
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../theme/theme";

export default function GlowButton({
  title,
  subtitle,
  onPress,
  icon = "sparkles",
  rightIcon = "chevron-forward",
  style,
  disabled = false,
  compact = false,
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.pressable,
        {
          opacity: disabled ? 0.55 : pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.995 : 1 }],
        },
        style,
      ]}
    >
      <View style={[styles.wrap, compact && styles.wrapCompact]}>
        {/* Outer glow blobs */}
        <View style={styles.glowBase} />
        <View style={styles.glowOrange} />
        <View style={styles.glowPurple} />

        {/* Gradient surface */}
        <LinearGradient
          colors={[
            "rgba(255,122,24,0.95)", // orange
            "rgba(236,72,153,0.92)", // pink
            "rgba(168,85,247,0.92)", // purple
          ]}
          start={{ x: 0, y: 0.2 }}
          end={{ x: 1, y: 0.85 }}
          style={[styles.gradient, compact && styles.gradientCompact]}
        >
          {/* Inner sheen */}
          <View style={styles.sheen} />

          <View style={styles.row}>
            {/* Icon chip */}
            <View style={[styles.iconChip, compact && styles.iconChipCompact]}>
              <Ionicons name={icon} size={compact ? 16 : 18} color="white" />
            </View>

            {/* Text */}
            <View style={{ flex: 1 }}>
              {subtitle ? (
                <Text
                  style={[styles.subtitle, compact && styles.subtitleCompact]}
                >
                  {subtitle}
                </Text>
              ) : null}

              <Text style={[styles.title, compact && styles.titleCompact]}>
                {title}
              </Text>
            </View>

            {/* Right arrow */}
            {rightIcon ? (
              <Ionicons
                name={rightIcon}
                size={compact ? 16 : 18}
                color="rgba(255,255,255,0.92)"
              />
            ) : null}
          </View>
        </LinearGradient>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: 22,
  },
  wrap: {
    borderRadius: 22,
    overflow: "visible",
  },
  wrapCompact: {
    borderRadius: 20,
  },

  // Glow layers
  glowBase: {
    position: "absolute",
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 28,
    backgroundColor: "rgba(168,85,247,0.12)", // purple haze
  },
  glowOrange: {
    position: "absolute",
    top: -14,
    left: 18,
    width: 120,
    height: 120,
    borderRadius: 999,
    backgroundColor: "rgba(255,122,24,0.12)", // orange bloom
  },
  glowPurple: {
    position: "absolute",
    bottom: -18,
    right: 10,
    width: 140,
    height: 140,
    borderRadius: 999,
    backgroundColor: "rgba(168,85,247,0.14)", // purple bloom
  },

  // Gradient button
  gradient: {
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    overflow: "hidden",
  },
  gradientCompact: {
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },

  sheen: {
    position: "absolute",
    top: -30,
    left: -20,
    width: 220,
    height: 120,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
    transform: [{ rotate: "-12deg" }],
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  iconChip: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.18)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  iconChipCompact: {
    width: 30,
    height: 30,
    borderRadius: 11,
  },

  subtitle: {
    color: "rgba(255,255,255,0.90)",
    fontSize: 12,
    fontWeight: "800",
  },
  subtitleCompact: {
    fontSize: 11,
  },

  title: {
    color: "white",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 2,
  },
  titleCompact: {
    fontSize: 15,
  },
});
