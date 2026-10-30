// PURPOSE
// Works alongside the month picker on the ledger screen
// Component is embedded into spending ledger.

import React, { useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { theme } from "../../theme/theme";

export default function CategoryPicker({
  categories,
  value,
  onChange,
  compact = false,
  style,
}) {
  const [open, setOpen] = useState(false);

  const items = useMemo(() => {
    return [
      { id: "all", name: "All", icon: "" },
      ...(categories ?? []),
    ];
  }, [categories]);

  const current = items.find((c) => c.id === value) ?? items[0];

  const CONTROL_H = compact ? 42 : 50;

  return (
    <View style={[{ gap: 10 }, style]}>
      {/* Pill control */}
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

          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.05)",

          shadowColor: theme.shadow.dark,
          shadowOpacity: 1,
          shadowRadius: 10,
          shadowOffset: { width: 6, height: 6 },
          elevation: 6,
        }}
      >
        <Text style={{ color: theme.colors.muted }}>Category</Text>

        <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
          {current?.icon ? `${current.icon} ` : ""}
          {current?.name ?? "All"}{" "}
          <Text style={{ color: theme.colors.muted }}>{open ? "▲" : "▼"}</Text>
        </Text>
      </Pressable>

      {/* Dropdown panel */}
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
          {items.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => {
                onChange(c.id);
                setOpen(false);
              }}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 12,
                backgroundColor:
                  c.id === value ? "rgba(255,255,255,0.06)" : "transparent",
              }}
            >
              <Text
                style={{
                  color: theme.colors.text,
                  fontWeight: c.id === value ? "800" : "600",
                }}
              >
                {c.icon ? `${c.icon} ` : ""}
                {c.name}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}