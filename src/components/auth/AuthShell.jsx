import React from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { theme } from "../../theme/theme";
import Card from "../common/Card.jsx";

export default function AuthShell({ title, subtitle, children }) {
  const logo = require("../../../assets/logo.png");

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.base }}>
      {/* iOS/Android status bar icons white */}
      <StatusBar style="light" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: theme.spacing.screen,
            paddingVertical: 28,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header like Figma */}
          <View style={{ alignItems: "center", marginBottom: 18 }}>
            {/* Simple “logo” placeholder */}
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 18,
                backgroundColor: theme.colors.surface,
                shadowColor: theme.shadow.dark,
                shadowOpacity: 1,
                shadowRadius: 14,
                shadowOffset: { width: 8, height: 8 },
                elevation: 10,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 14,
              }}
            >
              <Image
                source={logo}
                style={{ width: 40, height: 40 }}
                resizeMode="contain"
              />
            </View>

            <Text
              style={{
                color: theme.colors.text,
                fontSize: 34,
                fontWeight: "900",
                letterSpacing: 0.2,
              }}
            >
              theFinTrack
            </Text>

            <Text
              style={{
                color: theme.colors.muted,
                marginTop: 6,
                fontSize: 15,
              }}
            >
              {subtitle}
            </Text>
          </View>

          {/* Form card like Figma */}
          <Card style={{ padding: 18 }}>
            <Text
              style={{
                color: theme.colors.text,
                fontSize: 22,
                fontWeight: "900",
                marginBottom: 14,
                textAlign: "center",
              }}
            >
              {title}
            </Text>

            {children}
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
