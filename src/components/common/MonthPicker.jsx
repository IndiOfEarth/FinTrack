// PURPOSE
// A month picker component that can be embedded into any screen
// Allows selecting of month, that is then used to fetch transactions from Supabase

import React, { useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { theme } from "../../theme/theme";
import { buildRecentMonths } from "../../utils/finance";

export default function MonthPicker({ value, onChange, monthsCount = 12, compact = false, style }) {
  const months = useMemo(() => buildRecentMonths(monthsCount), [monthsCount]);
  const [open, setOpen] = useState(false);

  const current = months.find((m) => m.key === value) ?? months[0];

  const CONTROL_H = compact ? 42 : 50;

  return (
    <View style={[{ gap: 10 }, style]}>
      <Pressable
        onPress={() => setOpen((p) => !p)}
        style={{
          height: CONTROL_H,
          borderRadius: theme.radius.pill,
          backgroundColor: theme.colors.surface,
          paddingHorizontal: 14,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",

          // subtle neumorphic-ish depth
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.05)",
          shadowColor: theme.shadow.dark,
          shadowOpacity: 1,
          shadowRadius: 10,
          shadowOffset: { width: 6, height: 6 },
          elevation: 6,
        }}
      >
        <Text style={{ color: theme.colors.muted }}>Month</Text>

        <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
          {current?.label ?? value} {" "}
          <Text style={{ color: theme.colors.muted }}>{open ? "▲" : "▼"}</Text>
        </Text>
      </Pressable>

      {open ? (
        <View
          style={{
                marginTop: -8, // 👈 slightly overlap pill
                backgroundColor: theme.colors.surface,
                borderRadius: theme.radius.lg,
                padding: 10,

                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.05)",

                shadowColor: theme.shadow.dark,
                shadowOpacity: 1,
                shadowRadius: 14,
                shadowOffset: { width: 6, height: 6 },
                elevation: 8
          }}
        >
          {months.map((m) => (
            <Pressable
              key={m.key}
              onPress={() => {
                onChange(m.key);
                setOpen(false);
              }}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 12,
                backgroundColor: m.key === value ? "rgba(255,255,255,0.06)" : "transparent",
              }}
            >
              <Text style={{ color: theme.colors.text, fontWeight: m.key === value ? "800" : "600" }}>
                {m.label}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}