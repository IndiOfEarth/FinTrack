import React, { useCallback, useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Alert,
  RefreshControl,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useFocusEffect } from "@react-navigation/native";

import Screen from "../../components/common/Screen.jsx";
import Card from "../../components/common/Card.jsx";
import MonthPicker from "../../components/common/MonthPicker.jsx";
import CategoryPicker from "../../components/common/CategoryPicker.jsx";
import Input from "../../components/common/Input.jsx";
import SpendLensModal from "../../components/common/SpendLensModal.jsx";
import GlowButton from "../../components/common/GlowButton.jsx";
import { theme } from "../../theme/theme";

import { getReceiptSignedUrl } from "../../services/receiptsService";
import { getCategories } from "../../services/categoriesServices";
import { getMonthKey, filterTransactionsByMonth } from "../../utils/finance";
import {
  getTransactionsForMonth,
  deleteTransaction,
} from "../../services/transactionsService";
import { formatMoney, currencySymbol } from "../../utils/money";
import { useAuth } from "../../store/AuthContext.js";

function SegmentedPill({ label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        paddingVertical: 12,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? 0.8 : 1,
        backgroundColor: active ? theme.colors.accent : theme.colors.surface,
        borderWidth: active ? 0 : 1,
        borderColor: "rgba(255,255,255,0.06)",
      })}
    >
      <Text style={{ color: theme.colors.text, fontWeight: "900" }}>
        {label}
      </Text>
    </Pressable>
  );
}

function ReceiptChip({ onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        alignSelf: "flex-start",
        opacity: pressed ? 0.7 : 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.03)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.06)",
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
        marginTop: 10,
      })}
    >
      <Text style={{ color: theme.colors.accent, fontWeight: "900" }}>🧾</Text>
      <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
        View receipt
      </Text>
    </Pressable>
  );
}

export default function LedgerScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // all | expense | income
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(getMonthKey(new Date()));
  const [categories, setCategories] = useState([]);

  const { profile } = useAuth();
  const [lensOpen, setLensOpen] = useState(false);

  // Same array currently rendering in the list (after month/category/type/search filters)
  const visibleTx = useMemo(() => {
    return transactions;
  }, [transactions]);

  const monthTx = useMemo(() => {
    return filterTransactionsByMonth(transactions ?? [], selectedMonth);
  }, [transactions, selectedMonth]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return (monthTx ?? []).filter((t) => {
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      if (categoryFilter !== "all" && t.category?.id !== categoryFilter)
        return false;
      if (!s) return true;

      const hay = [
        t.note ?? "",
        t.category?.name ?? "",
        t.type ?? "",
        String(t.amount ?? ""),
        t.date ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return hay.includes(s);
    });
  }, [monthTx, search, typeFilter, categoryFilter]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [txData, catData] = await Promise.all([
        getTransactionsForMonth(selectedMonth),
        getCategories(),
      ]);
      setTransactions(txData ?? []);
      setCategories(catData ?? []);
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useFocusEffect(
    React.useCallback(() => {
      load();
    }, [load]),
  );

  useEffect(() => {
    setSearch("");
    setTypeFilter("all");
    setCategoryFilter("all");
  }, [selectedMonth]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const handleDelete = (id) => {
    Alert.alert("Delete transaction?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTransaction(id);
            await Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Warning,
            );
            await load();
          } catch (e) {
            Alert.alert("Delete failed", e.message);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => {
    const isExpense = item.type === "expense";
    const sign = isExpense ? "-" : "+";
    const amountText = `${sign}${formatMoney(item.amount, currencySymbol(profile?.currency))}`;

    return (
      <Pressable
        onPress={() =>
          navigation.navigate("TransactionDetails", { transaction: item })
        }
        onLongPress={() => handleDelete(item.id)}
        delayLongPress={350}
        style={{ marginBottom: 12 }}
      >
        <Card style={{ paddingVertical: 14 }}>
          <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
            {/* Left icon bubble */}
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "rgba(255,255,255,0.03)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.06)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 18 }}>
                {item.category?.icon
                  ? item.category.icon
                  : isExpense
                    ? "🛒"
                    : "💸"}
              </Text>
            </View>

            {/* Middle */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: theme.colors.text,
                  fontWeight: "900",
                  fontSize: 16,
                }}
              >
                {item.category?.name ?? "Category"}
              </Text>
              <Text
                style={{ color: theme.colors.muted, marginTop: 2 }}
                numberOfLines={1}
              >
                {item.note ?? (isExpense ? "Expense" : "Income")}
              </Text>
            </View>

            {/* Right */}
            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={{
                  color: theme.colors.text,
                  fontWeight: "900",
                  fontSize: 16,
                }}
              >
                {amountText}
              </Text>
              <Text
                style={{
                  color: theme.colors.muted,
                  marginTop: 2,
                  fontSize: 12,
                }}
              >
                {item.date}
              </Text>
            </View>
          </View>

          {/* Subtle divider line */}
          <View
            style={{
              height: 1,
              backgroundColor: "rgba(255,255,255,0.04)",
              marginTop: 12,
            }}
          />

          {/* Receipt chip (small, not a huge button) */}
          {item.receipt_path ? (
            <ReceiptChip
              onPress={async () => {
                try {
                  const signedUrl = await getReceiptSignedUrl(
                    item.receipt_path,
                  );
                  navigation.navigate("ReceiptPreview", { signedUrl });
                } catch (e) {
                  Alert.alert("Could not load receipt", e.message);
                }
              }}
            />
          ) : null}

          {/* One-time hint is handled in the header (below) */}
        </Card>
      </Pressable>
    );
  };

  return (
    <Screen>
      <FlatList
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.screen,
          paddingBottom: 28,
        }}
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View style={{ gap: 12 }}>
            {/* Title row (Figma-like) */}
            <View style={{ marginBottom: 4 }}>
              <Text
                style={{
                  fontSize: 30,
                  fontWeight: "900",
                  color: theme.colors.text,
                }}
              >
                Spending
              </Text>
              <Text style={{ color: theme.colors.muted, marginTop: 6 }}>
                Tip: long press a transaction to delete.
              </Text>
            </View>

            {/* Pickers row */}
            <View style={{ flexDirection: "row", gap: 12 }}>
              <MonthPicker
                value={selectedMonth}
                onChange={setSelectedMonth}
                monthsCount={12}
                compact
                style={{ flex: 1 }}
              />
              <CategoryPicker
                categories={categories}
                value={categoryFilter}
                onChange={setCategoryFilter}
                compact
                style={{ flex: 1 }}
              />
            </View>

            {/* Search + filter card */}
            <Card style={{ padding: 14 }}>
              <Text style={{ color: theme.colors.muted, marginBottom: 10 }}>
                Search
              </Text>

              <Input
                value={search}
                onChangeText={setSearch}
                placeholder="Search transactions..."
                returnKeyType="search"
              />

              <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
                <SegmentedPill
                  label="All"
                  active={typeFilter === "all"}
                  onPress={() => setTypeFilter("all")}
                />
                <SegmentedPill
                  label="Expense"
                  active={typeFilter === "expense"}
                  onPress={() => setTypeFilter("expense")}
                />
                <SegmentedPill
                  label="Income"
                  active={typeFilter === "income"}
                  onPress={() => setTypeFilter("income")}
                />
              </View>
            </Card>

            <GlowButton
              title="Smart spending review"
              subtitle="Highlights, patterns and recurring spends"
              onPress={() => setLensOpen(true)}
            />

            <SpendLensModal
              visible={lensOpen}
              onClose={() => setLensOpen(false)}
              transactions={visibleTx}
              monthKey={selectedMonth}
              categoryLabel={categoryFilter}
              typeLabel={typeFilter}
              searchQuery={search}
              currency={profile?.currency}
            />

            {/* Empty/loading messages */}
            {loading ? (
              <Text style={{ color: theme.colors.muted }}>
                Loading transactions...
              </Text>
            ) : filtered.length === 0 ? (
              <Text style={{ color: theme.colors.muted }}>
                No matching transactions for these filters.
              </Text>
            ) : null}
          </View>
        }
      />
    </Screen>
  );
}
