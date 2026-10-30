import React from "react";
import {View, Text, Image, Pressable } from "react-native";
import Screen from "../../components/common/Screen.jsx";
import Card from "../../components/common/Card.jsx";
import { theme } from "../../theme/theme";

export default function ReceiptPreviewScreen({ route, navigation }) {
  const { signedUrl } = route.params || {};

  return (
    <Screen>
      <View style={{ flex: 1, padding: theme.spacing.screen, gap: 12 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: "800" }}>Receipt</Text>

          <Pressable onPress={() => navigation.goBack()} style={{ padding: 10 }}>
            <Text style={{ color: theme.colors.accent, fontWeight: "800" }}>Close</Text>
          </Pressable>
        </View>

        <Card style={{ flex: 1, padding: 10 }}>
          {!signedUrl ? (
            <Text style={{ color: theme.colors.muted }}>No receipt URL found.</Text>
          ) : (
            <Image
              source={{ uri: signedUrl }}
              style={{ width: "100%", height: "100%", borderRadius: 12 }}
              resizeMode="contain"
            />
          )}
        </Card>

        <Text style={{ color: theme.colors.muted, fontSize: 12 }}>
          (Signed URL expires automatically for security.)
        </Text>
      </View>
    </Screen>
  );
}