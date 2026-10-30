import React from "react";
import { View, Text, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../theme/theme"; 

export default function AppHeader({
  showBack = false,
  title = "theFinTrack",
  subtitle,
  right,
  logoSource,
  compact = false, // makes header tighter when needed
}) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const topPad = Math.max(insets.top, 10); // notch-safe but not huge
  const vPad = compact ? 8 : 24;

  return (
    <View
      style={{
        paddingTop: topPad + 2,
        paddingBottom: vPad,
        paddingHorizontal: theme.spacing.screen,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {/* Left */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
          {showBack ? (
            <Pressable
              onPress={() => navigation.goBack()}
              hitSlop={10}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Ionicons name="chevron-back" size={22} color={theme.colors.muted} />
            </Pressable>
          ) : null}

          {/* Logo bubble */}
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 12,
              backgroundColor: theme.colors.surface,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: theme.shadow.dark,
              shadowOpacity: 1,
              shadowRadius: 12,
              shadowOffset: { width: 6, height: 6 },
              elevation: 8,
              overflow: "hidden",
            }}
          >
            {logoSource ? (
              <Image source={logoSource} style={{ width: 22, height: 22, resizeMode: "contain" }} />
            ) : (
              <Text style={{ color: theme.colors.accent, fontSize: 16, fontWeight: "900" }}>↗</Text>
            )}
          </View>

          <View>
            <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 16 }}>
              {title}
            </Text>

            {subtitle ? (
              <Text style={{ color: theme.colors.muted, fontSize: 12, marginTop: 1 }}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Right */}
        <View style={{ minWidth: 40, alignItems: "flex-end" }}>{right ?? null}</View>
      </View>
    </View>
  );
}