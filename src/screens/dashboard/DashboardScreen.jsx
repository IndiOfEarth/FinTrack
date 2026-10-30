import React, {
  useCallback,
  useState,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { View, Text, Pressable, Alert, ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../store/AuthContext";

// Adding theming and styling to dashboard
import Screen from "../../components/common/Screen.jsx";
import Card from "../../components/common/Card.jsx";
import Button from "../../components/common/Button.jsx";
import MonthPicker from "../../components/common/MonthPicker.jsx";
import GlowButton from "../../components/common/GlowButton.jsx";
import { theme } from "../../theme/theme";

import { getTransactions } from "../../services/transactionsService";
import { getBudgetsForMonth } from "../../services/budgetsService";
import LoadingOverlay from "../../components/common/LoadingOverlay.jsx";

// Utility function imports
import { formatMoney, currencySymbol } from "../../utils/money";
import {
  getMonthKey,
  filterTransactionsByMonth,
  sumExpenses,
  sumIncome,
  groupExpensesByCategory,
  getMonthStartDate,
  sumExpensesByCategory,
  progress,
  buildRecentMonths,
} from "../../utils/finance";

// Watchlist imports
import { getWatchlist } from "../../services/watchlistService";
import { getQuote } from "../../services/stocksService";

// Onboarding Overlay imports
import CoachMarkOverlay from "../../components/common/CoachMarkOverlay.jsx";
import { useTour } from "../../store/TourContext.js";

export default function DashboardScreen({ navigation }) {
  // States
  const [loading, setLoading] = useState(true); // decides whether screen is loading data
  const [tx, setTx] = useState([]); // stores all transactions loaded from supabase
  const [budgets, setBudgets] = useState([]);

  const [displayName, setDisplayName] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(getMonthKey(new Date()));
  const monthKey = selectedMonth; // current month yyyy-mm
  // Depends on change to 'selectedMonth' during render
  const monthStart = useMemo(() => {
    const months = buildRecentMonths(24);
    const found = months.find((m) => m.key === selectedMonth);
    return found ? found.monthStart : getMonthStartDate(new Date());
  }, [selectedMonth]);

  const monthTx = useMemo(
    () => filterTransactionsByMonth(tx, monthKey),
    [tx, monthKey],
  ); // filters transactions to only this month

  const totalSpent = useMemo(() => sumExpenses(monthTx), [monthTx]); // adds up all the expenses for this month
  const totalIncome = useMemo(() => sumIncome(monthTx), [monthTx]); // adds up all the income transactions for this month
  const spentByCategory = useMemo(
    () => sumExpensesByCategory(monthTx),
    [monthTx],
  );

  const { profile } = useAuth();

  const [watchlist, setWatchlist] = useState([]); // stores the current watchlist
  const [investQuotes, setInvestQuotes] = useState({}); // quotes for investing

  // ONBOARDING STATES AND VARIABLES
  // References to different parts of the screen
  // Tooltips can then anchor to these positions
  const monthPickerRef = useRef(null);
  const summaryCardRef = useRef(null);
  const budgetsCardRef = useRef(null);
  const watchlistCardRef = useRef(null);

  // Creating a helper function to measure position
  // request animation frame waits until the screen has fully rendered before measuring too early
  const measure = (ref, setRect) => {
    requestAnimationFrame(() => {
      // gets the size of the element (ref) passed in
      ref.current?.measureInWindow?.((x, y, width, height) => {
        setRect({ x, y, width, height });
      });
    });
  };

  const { step, setStep, complete } = useTour();

  const [monthRect, setMonthRect] = useState(null);
  const [summaryRect, setSummaryRect] = useState(null);
  const [budgetsRect, setBudgetsRect] = useState(null);
  const [watchRect, setWatchRect] = useState(null);

  useEffect(() => {
    // Only measure when we’re on a step that needs it
    if (step === 2) measure(monthPickerRef, setMonthRect);
    if (step === 3) measure(summaryCardRef, setSummaryRect);
    if (step === 4) measure(budgetsCardRef, setBudgetsRect);
    if (step === 5) measure(watchlistCardRef, setWatchRect);
  }, [step]);

  const budgetMap = useMemo(() => {
    const m = new Map();
    for (const b of budgets ?? []) {
      m.set(b.category_id, Number(b.limit_amount));
    }
    return m;
  }, [budgets]);

  // Custom bars/charts and insights
  // spending breakdowns: top 5 categories, horizontal bars, amount + % of total spend
  // small insights card: biggest category & share, over-budget count, and projection
  // future AI based insights
  const topSpend = useMemo(
    () => (spentByCategory ?? []).slice(0, 5),
    [spentByCategory],
  );

  const maxCategorySpend = useMemo(() => {
    if (!topSpend.length) return 0;
    return Math.max(...topSpend.map((c) => Number(c.spent) || 0));
  }, [topSpend]);

  const overBudgetCount = useMemo(() => {
    let count = 0;
    for (const c of spentByCategory ?? []) {
      const limit = budgetMap.get(c.category_id);
      if (limit && Number(c.spent) > Number(limit)) count++;
    }
    return count;
  }, [spentByCategory, budgetMap]);

  const primaryInsight = useMemo(() => {
    if (!topSpend.length || !totalSpent) return null;
    const top = topSpend[0];
    const spent = Number(top.spent) || 0;
    const pct = totalSpent > 0 ? (spent / totalSpent) * 100 : 0;
    return {
      label: `${top.icon ? `${top.icon} ` : ""}${top.name}`,
      pct: Number.isFinite(pct) ? pct : 0,
      spent,
    };
  }, [topSpend, totalSpent]);

  const projection = useMemo(() => {
    if (!totalSpent) return null;

    const now = new Date();
    const [y, m] = monthKey.split("-").map(Number);
    const isCurrentMonth = now.getFullYear() === y && now.getMonth() + 1 === m;

    const daysInMonth = new Date(y, m, 0).getDate(); // month is 1-based here
    const daysElapsed = isCurrentMonth
      ? Math.max(1, now.getDate())
      : Math.min(daysInMonth, 15);

    const dailyAvg = totalSpent / daysElapsed;
    const projected = dailyAvg * daysInMonth;

    return {
      dailyAvg,
      projected,
    };
  }, [totalSpent, monthKey]);

  const analyticsTone = useMemo(() => {
    // “quiet luxury” tone strings
    if (!totalSpent || totalSpent <= 0) return null;

    if (overBudgetCount > 0) {
      return {
        label: "Attention",
        value: `${overBudgetCount} over budget`,
        variant: "danger",
      };
    }
    return {
      label: "Status",
      value: "On track",
      variant: "ok",
    };
  }, [totalSpent, overBudgetCount]);

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const [txData, budgetData, wl] = await Promise.all([
        getTransactions(),
        getBudgetsForMonth(monthStart),
        getWatchlist(),
      ]);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      const uid = user?.id;

      if (uid) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", uid)
          .single();
        setDisplayName(profile?.display_name ?? "");
      }

      setTx(txData ?? []);
      setBudgets(budgetData ?? []);
      setWatchlist(wl ?? []);

      // Fetch up to 3 quotes (this makes the app rate-limit friendly)
      // Have to ensure that hitting the API-rate limit, means the dashboard and budgets will still work
      const top3 = (wl ?? []).slice(0, 3);
      const next = {};

      for (const item of top3) {
        try {
          const q = await getQuote(item.symbol);
          if (q) next[item.symbol] = q;
        } catch (e) {
          break; // for if the rate-limit hits, ensures the dashboard still loads
        }
      }

      setInvestQuotes((prev) => ({ ...prev, ...next }));
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  }, [monthStart]);

  // Every time the screen becomes active, reload the data
  // REFERENCE - https://reactnavigation.org/docs/use-focus-effect/
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <Screen>
      <LoadingOverlay visible={loading} label="Loading your data..." />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.screen,
          paddingBottom: 28,
        }}
      >
        {/* Header */}
        <View style={{ marginBottom: 18 }}>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 28,
              fontWeight: "900",
            }}
          >
            Hi,{" "}
            <Text style={{ color: theme.colors.accent }}>
              {displayName ? `${displayName}.` : "Friend."}
            </Text>
          </Text>

          {/* Month pill (smaller + left aligned like Figma) */}
          <View
            ref={monthPickerRef}
            style={{ marginTop: 14, alignItems: "flex-start" }}
          >
            <MonthPicker
              value={selectedMonth}
              onChange={setSelectedMonth}
              monthsCount={12}
              compact
              style={{ width: 160 }}
            />
          </View>
        </View>

        {loading ? (
          <Text style={{ color: theme.colors.muted }}>Loading...</Text>
        ) : (
          <>
            {/* Summary card */}
            <View ref={summaryCardRef}>
              <Card style={{ marginBottom: 16 }}>
                <Text style={{ color: theme.colors.muted, marginBottom: 8 }}>
                  This month
                </Text>

                <Text
                  style={{
                    color: theme.colors.text,
                    fontSize: 30,
                    fontWeight: "900",
                  }}
                >
                  Spent:{" "}
                  {formatMoney(totalSpent, currencySymbol(profile?.currency))}
                </Text>

                <Text style={{ color: theme.colors.muted, marginTop: 6 }}>
                  Income:{" "}
                  {formatMoney(totalIncome, currencySymbol(profile?.currency))}
                </Text>
              </Card>
            </View>

            {totalSpent > 0 ? (
              <Card
                style={{
                  marginBottom: 16,
                  padding: 0,
                  overflow: "hidden",
                  borderRadius: 22,
                }}
              >
                {/* Subtle tinted surface */}
                <View
                  style={{
                    padding: 16,
                    backgroundColor: "rgba(255,255,255,0.02)",
                  }}
                >
                  {/* Top row: label + status chip */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: theme.colors.muted,
                        fontSize: 12,
                        letterSpacing: 1.6,
                        textTransform: "uppercase",
                        fontWeight: "800",
                      }}
                    >
                      Analytics
                    </Text>

                    {/* Status chip */}
                    {analyticsTone ? (
                      <View
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderRadius: 999,
                          backgroundColor:
                            analyticsTone.variant === "danger"
                              ? "rgba(255,80,80,0.12)"
                              : "rgba(167,139,250,0.12)",
                          borderWidth: 1,
                          borderColor:
                            analyticsTone.variant === "danger"
                              ? "rgba(255,80,80,0.25)"
                              : "rgba(167,139,250,0.25)",
                        }}
                      >
                        <Text
                          style={{
                            color: theme.colors.text,
                            fontSize: 12,
                            fontWeight: "900",
                          }}
                        >
                          {analyticsTone.value}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Title */}
                  <Text
                    style={{
                      color: theme.colors.text,
                      fontSize: 20,
                      fontWeight: "900",
                      marginTop: 10,
                    }}
                  >
                    Spending breakdown
                  </Text>

                  <View style={{ marginTop: 12 }}>
                    <GlowButton
                      eyebrow="AI INSIGHTS"
                      title="Explain my spending"
                      subtitle="Highlights, projection, and budget risk"
                      onPress={() => {
                        // Quick “AI-like” summary using your existing computed values
                        const sym = currencySymbol(profile?.currency);

                        const top = primaryInsight
                          ? `${primaryInsight.label} (${primaryInsight.pct.toFixed(0)}%)`
                          : "None yet";

                        const proj = projection
                          ? `${formatMoney(projection.projected, sym)} (daily avg ${formatMoney(
                              projection.dailyAvg,
                              sym,
                            )})`
                          : "Not enough data";

                        Alert.alert(
                          "Spending insights",
                          `• Top category: ${top}\n• Over-budget categories: ${overBudgetCount}\n• Month projection: ${proj}`,
                        );
                      }}
                    />
                  </View>

                  {/* Accent “glow line” */}
                  <View
                    style={{
                      height: 1,
                      marginTop: 12,
                      backgroundColor: "rgba(167,139,250,0.18)",
                      shadowColor: theme.colors.accent,
                      shadowOpacity: 0.22,
                      shadowRadius: 12,
                      shadowOffset: { width: 0, height: 8 },
                    }}
                  />

                  {/* Breakdown list */}
                  <View style={{ marginTop: 14, gap: 14 }}>
                    {topSpend.length === 0 ? (
                      <Text style={{ color: theme.colors.muted }}>
                        No expenses to chart yet.
                      </Text>
                    ) : (
                      topSpend.map((c, index) => {
                        const spent = Number(c.spent) || 0;
                        const pctOfTotal =
                          totalSpent > 0 ? (spent / totalSpent) * 100 : 0;
                        const widthPct =
                          maxCategorySpend > 0
                            ? (spent / maxCategorySpend) * 100
                            : 0;
                        const isTop = index === 0;

                        // Subtle tiering: top category is more dominant
                        const barHeight = isTop ? 14 : 10;
                        const barOpacity = isTop ? 1 : 0.75;

                        return (
                          <View key={c.category_id} style={{ gap: 8 }}>
                            <View
                              style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "baseline",
                              }}
                            >
                              <Text
                                style={{
                                  color: theme.colors.text,
                                  fontWeight: "900",
                                  fontSize: isTop ? 16 : 14,
                                }}
                              >
                                {c.icon ? `${c.icon} ` : ""}
                                {c.name}
                              </Text>

                              <Text
                                style={{
                                  color: theme.colors.muted,
                                  fontSize: 12,
                                  fontWeight: "900",
                                }}
                              >
                                {formatMoney(
                                  spent,
                                  currencySymbol(profile?.currency),
                                )}{" "}
                                <Text
                                  style={{
                                    color: "rgba(255,255,255,0.45)",
                                    fontWeight: "900",
                                  }}
                                >
                                  ({pctOfTotal.toFixed(0)}%)
                                </Text>
                              </Text>
                            </View>

                            {/* Track */}
                            <View
                              style={{
                                height: barHeight,
                                backgroundColor: "rgba(255,255,255,0.06)",
                                borderRadius: 999,
                                overflow: "hidden",
                              }}
                            >
                              {/* Fill */}
                              <View
                                style={{
                                  height: "100%",
                                  width: `${widthPct}%`,
                                  opacity: barOpacity,
                                  backgroundColor: theme.colors.accent,

                                  // Glow only for top bar
                                  shadowColor: isTop
                                    ? theme.colors.accent
                                    : "transparent",
                                  shadowOpacity: isTop ? 0.35 : 0,
                                  shadowRadius: 14,
                                  shadowOffset: { width: 0, height: 10 },
                                }}
                              />

                              {/* Top highlight (gives it that “glass” feel) */}
                              <View
                                pointerEvents="none"
                                style={{
                                  position: "absolute",
                                  left: 0,
                                  right: 0,
                                  top: 0,
                                  height: Math.max(
                                    2,
                                    Math.floor(barHeight / 3),
                                  ),
                                  backgroundColor: "rgba(255,255,255,0.10)",
                                }}
                              />
                            </View>
                          </View>
                        );
                      })
                    )}
                  </View>

                  {/* Insights row (tiles) */}
                  <View style={{ marginTop: 18, gap: 12 }}>
                    {/* Primary highlight tile */}
                    {primaryInsight ? (
                      <View
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
                          Highest impact category
                        </Text>

                        <Text
                          style={{
                            color: theme.colors.text,
                            fontSize: 18,
                            fontWeight: "900",
                            marginTop: 6,
                          }}
                        >
                          {primaryInsight.label}
                        </Text>

                        <Text
                          style={{
                            color: theme.colors.muted,
                            marginTop: 4,
                            lineHeight: 18,
                          }}
                        >
                          {primaryInsight.pct.toFixed(0)}% of total spend •{" "}
                          {formatMoney(
                            primaryInsight.spent,
                            currencySymbol(profile?.currency),
                          )}
                        </Text>
                      </View>
                    ) : null}

                    {/* Two-column mini tiles */}
                    <View style={{ flexDirection: "row", gap: 12 }}>
                      {/* Budget tile */}
                      <View
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
                          Budget status
                        </Text>

                        <Text
                          style={{
                            marginTop: 6,
                            color:
                              overBudgetCount > 0
                                ? theme.colors.danger
                                : theme.colors.accent,
                            fontWeight: "900",
                            fontSize: 16,
                          }}
                        >
                          {overBudgetCount === 0
                            ? "On track"
                            : `${overBudgetCount} over`}
                        </Text>

                        <Text
                          style={{
                            color: theme.colors.muted,
                            marginTop: 4,
                            fontSize: 12,
                          }}
                        >
                          Based on budgets set
                        </Text>
                      </View>

                      {/* Projection tile */}
                      <View
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
                          Month projection
                        </Text>

                        <Text
                          style={{
                            marginTop: 6,
                            color: theme.colors.text,
                            fontWeight: "900",
                            fontSize: 16,
                          }}
                        >
                          {projection
                            ? formatMoney(
                                projection.projected,
                                currencySymbol(profile?.currency),
                              )
                            : "—"}
                        </Text>

                        <Text
                          style={{
                            color: theme.colors.muted,
                            marginTop: 4,
                            fontSize: 12,
                          }}
                        >
                          {projection
                            ? `Daily avg ${formatMoney(projection.dailyAvg, currencySymbol(profile?.currency))}`
                            : "Not enough data"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </Card>
            ) : null}

            {/* Empty state */}
            {monthTx.length === 0 ? (
              <Card
                style={{
                  alignItems: "center",
                  paddingVertical: 26,
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    color: theme.colors.text,
                    fontWeight: "900",
                    fontSize: 18,
                    marginBottom: 8,
                  }}
                >
                  No data for this month found
                </Text>

                <Text
                  style={{
                    color: theme.colors.muted,
                    textAlign: "center",
                    marginBottom: 18,
                  }}
                >
                  Start adding your expenses and income{"\n"}to see your budget
                  overview.
                </Text>

                <Button
                  title="+ Add Transaction"
                  onPress={() => navigation.navigate("Transaction")}
                />
              </Card>
            ) : (
              <>
                {/* Category budgets */}
                <View ref={budgetsCardRef}>
                  <Card style={{ marginBottom: 16 }}>
                    <Text
                      style={{
                        color: theme.colors.text,
                        fontSize: 18,
                        fontWeight: "900",
                        marginBottom: 14,
                      }}
                    >
                      What you’re spending on
                    </Text>

                    {spentByCategory.length === 0 ? (
                      <Text style={{ color: theme.colors.muted }}>
                        No expenses yet.
                      </Text>
                    ) : (
                      <View style={{ gap: 16 }}>
                        {spentByCategory.map((c) => {
                          const limit = budgetMap.get(c.category_id) ?? null;
                          const pct = limit ? progress(c.spent, limit) : 0;
                          const over = limit ? c.spent > limit : false;

                          return (
                            <View key={c.category_id}>
                              <View
                                style={{
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Text
                                  style={{
                                    color: theme.colors.text,
                                    fontWeight: "800",
                                  }}
                                >
                                  {c.icon ? `${c.icon} ` : ""}
                                  {c.name}
                                </Text>

                                {limit ? (
                                  <Text style={{ color: theme.colors.muted }}>
                                    {formatMoney(
                                      c.spent,
                                      currencySymbol(profile?.currency),
                                    )}{" "}
                                    /{" "}
                                    {formatMoney(
                                      limit,
                                      currencySymbol(profile?.currency),
                                    )}
                                  </Text>
                                ) : (
                                  <Text style={{ color: theme.colors.muted }}>
                                    No budget set
                                  </Text>
                                )}
                              </View>

                              {/* Progress bar */}
                              <View
                                style={{
                                  height: 10,
                                  backgroundColor: "rgba(255,255,255,0.06)",
                                  borderRadius: 999,
                                  marginTop: 10,
                                  overflow: "hidden",
                                }}
                              >
                                <View
                                  style={{
                                    height: "100%",
                                    width: `${pct * 100}%`,
                                    backgroundColor: over
                                      ? theme.colors.danger
                                      : theme.colors.accent,
                                  }}
                                />
                              </View>

                              {over ? (
                                <Text
                                  style={{
                                    color: theme.colors.danger,
                                    marginTop: 8,
                                    fontSize: 12,
                                    fontWeight: "700",
                                  }}
                                >
                                  Over budget by{" "}
                                  {formatMoney(
                                    c.spent - limit,
                                    currencySymbol(profile?.currency),
                                  )}
                                </Text>
                              ) : null}
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </Card>
                </View>

                {/* Tip card */}
                <Card style={{ marginBottom: 16 }}>
                  <Text style={{ color: theme.colors.muted, fontSize: 12 }}>
                    Tip: Set budgets in Settings → Budgets.
                  </Text>
                </Card>
              </>
            )}

            {/* Investing */}
            <View ref={watchlistCardRef}>
              <Card style={{ marginBottom: 8 }}>
                <Text
                  style={{
                    color: theme.colors.text,
                    fontSize: 18,
                    fontWeight: "900",
                    marginBottom: 14,
                  }}
                >
                  What you’re investing in
                </Text>

                {watchlist.length === 0 ? (
                  <Text style={{ color: theme.colors.muted }}>
                    No watchlist yet — add a stock in Investing.
                  </Text>
                ) : (
                  <View style={{ gap: 12 }}>
                    {watchlist.slice(0, 3).map((w) => {
                      const q = investQuotes[w.symbol];
                      const pct = q?.changePct ?? null;
                      const pctText =
                        pct === null
                          ? ""
                          : `${pct > 0 ? "+" : ""}${pct.toFixed(2)}%`;

                      return (
                        <View
                          key={w.id}
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <View>
                            <Text
                              style={{
                                color: theme.colors.text,
                                fontWeight: "900",
                              }}
                            >
                              {w.symbol}
                            </Text>
                            <Text
                              style={{
                                color: theme.colors.muted,
                                fontSize: 12,
                              }}
                            >
                              {q
                                ? `${formatMoney(q.price, currencySymbol(profile?.currency))} • ${pctText}`
                                : "Tap refresh in Investing for price"}
                            </Text>
                          </View>

                          {pct !== null ? (
                            <Text
                              style={{
                                color:
                                  pct >= 0
                                    ? theme.colors.accent
                                    : theme.colors.danger,
                                fontWeight: "900",
                              }}
                            >
                              {pctText}
                            </Text>
                          ) : null}
                        </View>
                      );
                    })}
                  </View>
                )}

                <View style={{ marginTop: 14 }}>
                  <Button
                    title="View watchlist"
                    variant="secondary"
                    onPress={() => navigation.navigate("Investing")}
                  />
                </View>
              </Card>
            </View>
          </>
        )}
      </ScrollView>

      <CoachMarkOverlay
        visible={step === 2}
        title="Choose a month"
        body="Use this picker to jump between months and review past spending."
        anchorRect={monthRect}
        primaryText="Next"
        secondaryText="Skip"
        onPrimary={() => setStep(3)}
        onSecondary={() => complete()}
      />

      <CoachMarkOverlay
        visible={step === 3}
        title="Monthly summary"
        body="This shows your total spent and income for the selected month."
        anchorRect={summaryRect}
        primaryText="Next"
        secondaryText="Skip"
        onPrimary={() => setStep(4)}
        onSecondary={() => complete()}
      />

      <CoachMarkOverlay
        visible={step === 4}
        title="Budget progress"
        body="See where your money is going and whether you’re on track."
        anchorRect={budgetsRect}
        primaryText="Next"
        secondaryText="Skip"
        onPrimary={() => setStep(5)}
        onSecondary={() => complete()}
      />

      <CoachMarkOverlay
        visible={step === 5}
        title="Investing watchlist"
        body="Track key stocks here. Add more anytime in the Investing tab."
        anchorRect={watchRect}
        primaryText="Done"
        secondaryText="Skip"
        onPrimary={() => complete()}
        onSecondary={() => complete()}
      />
    </Screen>
  );
}
