import React, { useState } from "react";
import { View, Text } from "react-native";
import Screen from "../../components/common/Screen.jsx";
import Button from "../../components/common/Button.jsx";
import { theme } from "../../theme/theme";
import { useAuth } from "../../store/AuthContext.js";

export default function OnboardingFirstTransactionScreen({ navigation }) {
  const { updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);

  const finish = async () => {
    setSaving(true);
    try {
      await updateProfile({ has_seen_onboarding: true });
      // RootNavigator will now stop showing onboarding automatically
    } finally {
      setSaving(false);
      navigation.goBack();
    }
  };

  return (
    <Screen>
      <View style={{ flex: 1, padding: 18, justifyContent: "center" }}>
        <Text
          style={{
            color: theme.colors.text,
            fontSize: 22,
            fontWeight: "700",
            marginBottom: 8,
          }}
        >
          Add your first transaction
        </Text>
        <Text
          style={{
            color: "rgba(255,255,255,0.75)",
            fontSize: 15,
            lineHeight: 22,
            marginBottom: 18,
          }}
        >
          Tap the + button any time to add an income or expense. Want to try
          now?
        </Text>

        <Button
          title="Add a New Transaction"
          onPress={() => navigation.getParent()?.navigate("AddTransaction")}
        />

        <View style={{ height: 12 }} />

        {/* Goes to the next section of onboarding - budgets */}
        <Button
          title="Next: Set budgets"
          onPress={() => navigation.navigate("OnboardingBudgets")}
        />

        <View style={{ height: 12 }} />

        <Button
          title="Skip setup"
          variant="secondary"
          onPress={async () => {
            await updateProfile({ has_seen_onboarding: true });
          }}
        />
      </View>
    </Screen>
  );
}
