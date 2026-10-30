// A "smart" modal that explains the currently visible/filtered transactions.
// Purely local insights (no AI calls) so it's fast + reliable.
import React, { useMemo } from "react";
import { Modal, View, Text, Pressable, ScrollView } from "react-native";
import Card from "./Card.jsx";
import Button from "./Button.jsx";
import { theme } from "../../theme/theme";
import { formatMoney, currencySymbol } from "../../utils/money";

function safeNumber(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

function daysInMonthFromKey(monthKey) {
  const [y, m] = String(monthKey).split("-").map(Number);
  if (!y || !m) return 30;
  return new Date(y, m, 0).getDate();
}

function normalizeMerchant(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function SpendLensModal({
  visible,
  onClose,
  transactions = [],
  monthKey,
  categoryLabel,
  typeLabel, // "All" | "Expense" | "Income"
  searchQuery,
  currency, // profile?.currency like "GBP"
}) {
  const symbol = currencySymbol(currency);

  const insights = useMemo(() => {
    const list = Array.isArray(transactions) ? transactions : [];
    const total = list.length;

    // Split expense/income
    const expenses = list.filter(
      (t) => (t?.type ?? "").toLowerCase() === "expense",
    );
    const incomes = list.filter(
      (t) => (t?.type ?? "").toLowerCase() === "income",
    );

    const totalSpent = expenses.reduce(
      (sum, t) => sum + safeNumber(t?.amount),
      0,
    );
    const totalIncome = incomes.reduce(
      (sum, t) => sum + safeNumber(t?.amount),
      0,
    );

    // Biggest transaction (absolute)
    const biggest =
      [...list].sort(
        (a, b) =>
          Math.abs(safeNumber(b?.amount)) - Math.abs(safeNumber(a?.amount)),
      )[0] ?? null;

    // Top category by spend (expenses only)
    const byCategory = new Map();
    for (const t of expenses) {
      const name = t?.category_name ?? t?.category?.name ?? "Uncategorised";
      byCategory.set(name, (byCategory.get(name) ?? 0) + safeNumber(t?.amount));
    }
    const topCategory =
      [...byCategory.entries()].sort((a, b) => b[1] - a[1])[0] ?? null;

    // “Recurring merchant” heuristic using description (works surprisingly well)
    const merchantCounts = new Map();
    for (const t of expenses) {
      const desc = normalizeMerchant(t?.description ?? t?.note ?? "");
      if (!desc) continue;
      // keep it short-ish as a "merchant-like" key
      const key = desc.split(" ").slice(0, 3).join(" ");
      merchantCounts.set(key, (merchantCounts.get(key) ?? 0) + 1);
    }
    const recurring =
      [...merchantCounts.entries()]
        .filter(([k, c]) => k.length >= 3 && c >= 2)
        .sort((a, b) => b[1] - a[1])[0] ?? null;

    // Month pace (avg per day)
    const dim = monthKey ? daysInMonthFromKey(monthKey) : 30;
    const avgPerDay = totalSpent / Math.max(1, dim);

    // Simple “tone” chip
    let tone = { label: "Stable", hint: "Nothing unusual detected." };
    if (total === 0)
      tone = { label: "Empty", hint: "No transactions match your filters." };
    else if (totalSpent > 0 && totalIncome > 0 && totalSpent > totalIncome)
      tone = {
        label: "Overspending",
        hint: "Spending is higher than income for this view.",
      };
    else if (totalSpent > 0 && recurring)
      tone = {
        label: "Pattern found",
        hint: "You have at least one repeating spend.",
      };

    return {
      total,
      expensesCount: expenses.length,
      incomesCount: incomes.length,
      totalSpent,
      totalIncome,
      biggest,
      topCategory,
      recurring,
      avgPerDay,
      dim,
      tone,
    };
  }, [transactions, monthKey]);

  const headerContext = useMemo(() => {
    const bits = [];
    if (monthKey) bits.push(monthKey);
    if (typeLabel && typeLabel !== "All") bits.push(typeLabel);
    if (categoryLabel && categoryLabel !== "All") bits.push(categoryLabel);
    if (searchQuery?.trim()) bits.push(`“${searchQuery.trim()}”`);
    return bits.length ? bits.join(" • ") : "Current view";
  }, [monthKey, categoryLabel, typeLabel, searchQuery]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.55)",
          padding: theme.spacing.screen,
          justifyContent: "center",
        }}
      >
        {/* Stop click-through */}
        <Pressable
          onPress={() => {}}
          style={{
            borderRadius: 24,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.10)",
            backgroundColor: "rgba(15,15,20,0.92)",
          }}
        >
          {/* Top glow accents */}
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: -40,
              left: -40,
              width: 160,
              height: 160,
              borderRadius: 999,
              backgroundColor: "rgba(255,122,24,0.16)",
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              bottom: -60,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: 999,
              backgroundColor: "rgba(168,85,247,0.18)",
            }}
          />

          <ScrollView
            contentContainerStyle={{
              padding: 16,
              paddingBottom: 14,
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* Title row */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text
                  style={{
                    color: theme.colors.muted,
                    fontSize: 12,
                    letterSpacing: 1.6,
                    textTransform: "uppercase",
                    fontWeight: "800",
                  }}
                >
                  Your Spending
                </Text>
                <Text
                  style={{
                    color: theme.colors.text,
                    fontSize: 22,
                    fontWeight: "900",
                    marginTop: 6,
                  }}
                >
                  Analyse my spending behaviour
                </Text>
                <Text style={{ color: theme.colors.muted, marginTop: 6 }}>
                  {headerContext}
                </Text>
              </View>

              {/* Tone chip */}
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 999,
                  backgroundColor: "rgba(255,255,255,0.06)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.10)",
                }}
              >
                <Text
                  style={{
                    color: theme.colors.text,
                    fontWeight: "900",
                    fontSize: 12,
                  }}
                >
                  {insights.tone.label}
                </Text>
              </View>
            </View>

            {/* Divider line */}
            <View
              style={{
                height: 1,
                marginTop: 14,
                backgroundColor: "rgba(167,139,250,0.18)",
                shadowColor: theme.colors.accent,
                shadowOpacity: 0.18,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 8 },
              }}
            />

            {/* Tiles */}
            <View style={{ flexDirection: "row", gap: 12, marginTop: 14 }}>
              <Card
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 18,
                  backgroundColor: "rgba(255,255,255,0.03)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.08)",
                }}
              >
                <Text
                  style={{
                    color: theme.colors.muted,
                    fontSize: 12,
                    fontWeight: "800",
                  }}
                >
                  Transactions
                </Text>
                <Text
                  style={{
                    color: theme.colors.text,
                    fontSize: 18,
                    fontWeight: "900",
                    marginTop: 6,
                  }}
                >
                  {insights.total}
                </Text>
                <Text
                  style={{
                    color: theme.colors.muted,
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  {insights.expensesCount} expense • {insights.incomesCount}{" "}
                  income
                </Text>
              </Card>

              <Card
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 18,
                  backgroundColor: "rgba(255,255,255,0.03)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.08)",
                }}
              >
                <Text
                  style={{
                    color: theme.colors.muted,
                    fontSize: 12,
                    fontWeight: "800",
                  }}
                >
                  Spend total
                </Text>
                <Text
                  style={{
                    color: theme.colors.text,
                    fontSize: 18,
                    fontWeight: "900",
                    marginTop: 6,
                  }}
                >
                  {formatMoney(insights.totalSpent, symbol)}
                </Text>
                <Text
                  style={{
                    color: theme.colors.muted,
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  ~{formatMoney(insights.avgPerDay, symbol)}/day
                </Text>
              </Card>
            </View>

            {/* Highlights */}
            <View style={{ marginTop: 12, gap: 12 }}>
              <Card
                style={{
                  padding: 14,
                  borderRadius: 18,
                  backgroundColor: "rgba(167,139,250,0.08)",
                  borderWidth: 1,
                  borderColor: "rgba(167,139,250,0.22)",
                }}
              >
                <Text
                  style={{
                    color: theme.colors.muted,
                    fontSize: 12,
                    fontWeight: "800",
                  }}
                >
                  Quick highlight
                </Text>
                <Text
                  style={{
                    color: theme.colors.text,
                    fontSize: 16,
                    fontWeight: "900",
                    marginTop: 6,
                  }}
                >
                  {insights.tone.hint}
                </Text>
              </Card>

              {insights.topCategory ? (
                <Card style={{ padding: 14, borderRadius: 18 }}>
                  <Text
                    style={{
                      color: theme.colors.muted,
                      fontSize: 12,
                      fontWeight: "800",
                    }}
                  >
                    Highest impact category
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      marginTop: 6,
                    }}
                  >
                    <Text
                      style={{
                        color: theme.colors.text,
                        fontSize: 16,
                        fontWeight: "900",
                      }}
                    >
                      {insights.topCategory[0]}
                    </Text>
                    <Text
                      style={{ color: theme.colors.text, fontWeight: "900" }}
                    >
                      {formatMoney(insights.topCategory[1], symbol)}
                    </Text>
                  </View>
                </Card>
              ) : null}

              {insights.recurring ? (
                <Card style={{ padding: 14, borderRadius: 18 }}>
                  <Text
                    style={{
                      color: theme.colors.muted,
                      fontSize: 12,
                      fontWeight: "800",
                    }}
                  >
                    Possible recurring spend
                  </Text>
                  <Text
                    style={{
                      color: theme.colors.text,
                      fontSize: 16,
                      fontWeight: "900",
                      marginTop: 6,
                    }}
                  >
                    {insights.recurring[0]}
                  </Text>
                  <Text style={{ color: theme.colors.muted, marginTop: 4 }}>
                    Appears {insights.recurring[1]} times in this view.
                  </Text>
                </Card>
              ) : null}

              {insights.biggest ? (
                <Card style={{ padding: 14, borderRadius: 18 }}>
                  <Text
                    style={{
                      color: theme.colors.muted,
                      fontSize: 12,
                      fontWeight: "800",
                    }}
                  >
                    Biggest transaction
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      marginTop: 6,
                    }}
                  >
                    <Text
                      style={{
                        color: theme.colors.text,
                        fontSize: 16,
                        fontWeight: "900",
                        flex: 1,
                        paddingRight: 10,
                      }}
                    >
                      {insights.biggest?.description ??
                        insights.biggest?.note ??
                        "Transaction"}
                    </Text>
                    <Text
                      style={{ color: theme.colors.text, fontWeight: "900" }}
                    >
                      {formatMoney(
                        safeNumber(insights.biggest?.amount),
                        symbol,
                      )}
                    </Text>
                  </View>
                </Card>
              ) : null}
            </View>

            {/* Actions */}
            <View style={{ marginTop: 14 }}>
              <Button title="Close" variant="secondary" onPress={onClose} />
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
