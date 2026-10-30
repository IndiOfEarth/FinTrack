import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, ScrollView, Alert } from "react-native";
import Screen from "../../components/common/Screen.jsx";
import Card from "../../components/common/Card.jsx";
import Button from "../../components/common/Button.jsx";
import { theme } from "../../theme/theme";
import { supabase } from "../../services/supabaseClient";

// Gets month start date from a particular date
function monthStartDate(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10); // YYYY-MM-01
}

export default function OnboardingBudgetsScreen({ navigation }) {
  // Defining states
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [values, setValues] = useState({}); // { category_id: "123.45" }

  const month = useMemo(() => monthStartDate(new Date()), []);

  // Runs once when the screen loads
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data: userRes } = await supabase.auth.getUser();
        const uid = userRes?.user?.id;
        if (!uid) return;

        const { data, error } = await supabase
          .from("categories")
          .select("id, name, icon")
          .eq("user_id", uid)
          .order("created_at", { ascending: true });

        if (error) throw error;

        // Income isn't a budgeted category - it's a singular thing
        const filtered = (data ?? []).filter(
          (c) => c.name.toLowerCase() !== "income",
        );
        setCategories(filtered);
      } catch (e) {
        Alert.alert("Error", e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Asynchronous function for saving the budgets as they are input by the user
  const saveBudgets = async () => {
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes?.user?.id;
      if (!uid) return;

      const rows = Object.entries(values)
        .map(([category_id, limitStr]) => ({
          user_id: uid,
          category_id,
          month, // YYYY-MM-01
          limit_amount: Number(limitStr),
        }))
        .filter((r) => Number.isFinite(r.limit_amount) && r.limit_amount > 0);

      // Allow empty (they can skip by just leaving blank)
      if (rows.length === 0) return;

      // Upsert using the following: (user_id, category_id, month)
      const { error } = await supabase
        .from("budgets")
        .upsert(rows, { onConflict: "user_id,category_id,month" });

      if (error) throw error;
    } catch (e) {
      Alert.alert("Couldn’t save budgets", e.message);
      throw e;
    }
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.screen,
          paddingBottom: 28,
        }}
      >
        <Text
          style={{
            color: theme.colors.text,
            fontSize: 22,
            fontWeight: "900",
            marginBottom: 8,
          }}
        >
          Set your monthly budgets
        </Text>
        <Text
          style={{
            color: theme.colors.muted,
            lineHeight: 20,
            marginBottom: 14,
          }}
        >
          Add budgets for the categories you spend on most. You can change these
          anytime in Settings → Budgets.
        </Text>

        <Card style={{ padding: 14, marginBottom: 16 }}>
          {loading ? (
            <Text style={{ color: theme.colors.muted }}>
              Loading categories...
            </Text>
          ) : (
            <View style={{ gap: 12 }}>
              {categories.slice(0, 6).map((c) => (
                <View
                  key={c.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
                    {c.icon ? `${c.icon} ` : ""}
                    {c.name}
                  </Text>

                  <View
                    style={{
                      width: 130,
                      borderRadius: 12,
                      backgroundColor: "rgba(255,255,255,0.06)",
                      paddingHorizontal: 10,
                      paddingVertical: 8,
                    }}
                  >
                    <TextInput
                      value={values[c.id] ?? ""}
                      onChangeText={(t) =>
                        setValues((prev) => ({
                          ...prev,
                          [c.id]: t.replace(/[^0-9.]/g, ""),
                        }))
                      }
                      placeholder="e.g. 250"
                      placeholderTextColor="rgba(255,255,255,0.35)"
                      keyboardType="decimal-pad"
                      style={{ color: theme.colors.text, fontWeight: "800" }}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}
        </Card>

        <Button
          title="Next: Pick watchlist"
          onPress={async () => {
            await saveBudgets();
            navigation.navigate("OnboardingWatchlist");
          }}
        />

        <View style={{ height: 12 }} />

        <Button
          title="Skip"
          variant="secondary"
          onPress={() => navigation.navigate("OnboardingWatchlist")}
        />
      </ScrollView>
    </Screen>
  );
}
