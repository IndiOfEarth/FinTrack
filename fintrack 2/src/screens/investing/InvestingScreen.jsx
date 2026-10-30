import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

// Screens and utilities
import Screen from "../../components/common/Screen.jsx";
import Card from "../../components/common/Card.jsx";
import Button from "../../components/common/Button.jsx";
import Input from "../../components/common/Input.jsx";
import { theme } from "../../theme/theme";
import { formatMoney, currencySymbol } from "../../utils/money";
import { useAuth } from "../../store/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons"; // optional, you already have expo vector icons

// Services
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from "../../services/watchlistService";
import { searchStocks, getQuote } from "../../services/stocksService";

function formatFreshness(ageSec) {
  if (ageSec === null) return "Prices not loaded";
  if (ageSec < 15) return "Updated just now";
  if (ageSec < 60) return "Updated < 1 min";
  if (ageSec < 300) return "Updated < 5 mins";
  return "May be stale";
}

export default function InvestingScreen({ navigation }) {
  const [watchlist, setWatchlist] = useState([]);
  const [results, setResults] = useState([]);
  const [quotes, setQuotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const lastSearchAt = useRef(0);

  const [searchError, setSearchError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const { profile } = useAuth();

  const loadWatchlist = useCallback(async () => {
    const data = await getWatchlist();
    setWatchlist(data ?? []);
  }, []);

  const refreshQuotes = useCallback(
    async (items) => {
      const list = (items ?? watchlist).slice(0, 5);
      const next = {};

      for (const w of list) {
        const existing = quotes[w.symbol];

        // If we already fetched in last 60 seconds, skip
        if (existing && Date.now() - existing.fetchedAt < 60000) continue;

        try {
          const q = await getQuote(w.symbol, w.exchange);
          if (q) next[w.symbol] = q;
        } catch (err) {
          next[w.symbol] = {
            symbol: w.symbol,
            price: 0,
            changePct: 0,
            fetchedAt: Date.now(),
            error: err?.message || "Quote unavailable",
          };
        }
      }

      if (Object.keys(next).length > 0) {
        setQuotes((prev) => ({ ...prev, ...next }));
      }
    },
    [watchlist, quotes],
  );

  const load = useCallback(async () => {
    try {
      setLoading(true);
      await loadWatchlist();
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  }, [loadWatchlist]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleSearch = async () => {
    const q = query.trim();
    if (!q || searching) return;

    const now = Date.now();
    if (now - lastSearchAt.current < 600) return;
    lastSearchAt.current = now;

    try {
      setSearchError("");
      setSearching(true);
      const data = await searchStocks(q);
      setResults(data ?? []);
    } catch (e) {
      setResults([]);
      setSearchError(e.message);
    } finally {
      setSearching(false);
      setHasSearched(true);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadWatchlist();
      await refreshQuotes();
    } catch (e) {
      Alert.alert("Refresh failed", e.message);
    } finally {
      setRefreshing(false);
    }
  }, [loadWatchlist, refreshQuotes]);

  const refreshPrices = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshQuotes(watchlist);
      await Haptics.selectionAsync();
    } catch (e) {
      Alert.alert("Refresh failed", e.message);
    } finally {
      setRefreshing(false);
    }
  }, [refreshQuotes, watchlist]);

  const onChangeQuery = (t) => {
    setQuery(t);
    if (!t.trim()) {
      setResults([]);
      setHasSearched(false);
      setSearchError("");
    }
  };

  const addSymbol = async (symbol, exchange) => {
    try {
      await addToWatchlist({ symbol, exchange });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await loadWatchlist();
      setQuery("");
      setResults([]);
      setHasSearched(false);
    } catch (e) {
      Alert.alert("Add failed", e.message);
    }
  };

  const removeItem = async (id) => {
    try {
      await removeFromWatchlist(id);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      await loadWatchlist();
    } catch (e) {
      Alert.alert("Remove failed", e.message);
    }
  };

  // ---------- INSIGHTS ----------
  const investingInsights = useMemo(() => {
    const list = watchlist ?? [];

    const enriched = list.map((w) => {
      const q = quotes?.[w.symbol] ?? null;
      const changePct = q && Number.isFinite(q.changePct) ? q.changePct : null;
      const fetchedAt = q?.fetchedAt ?? null;

      const ex = (w.exchange ?? "").toUpperCase();
      const sym = (w.symbol ?? "").toUpperCase();
      const isUK =
        ex.includes("LSE") ||
        ex.includes("LONDON") ||
        ex.includes("UK") ||
        sym.endsWith(".L") ||
        sym.endsWith(".LON");

      return { ...w, q, changePct, fetchedAt, isUK };
    });

    const total = enriched.length;
    const loadedCount = enriched.filter((x) => x.q && !x.q.error).length;
    const errorCount = enriched.filter((x) => x.q && x.q.error).length;

    const movers = enriched
      .filter((x) => x.changePct !== null && !x.q?.error)
      .sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct));

    const topMover = movers[0] ?? null;

    const usCount = enriched.filter((x) => !x.isUK).length;
    const ukCount = enriched.filter((x) => x.isUK).length;

    const mostRecent = enriched
      .map((x) => x.fetchedAt ?? 0)
      .reduce((max, v) => Math.max(max, v), 0);

    const ageSec = mostRecent
      ? Math.floor((Date.now() - mostRecent) / 1000)
      : null;

    const status =
      total === 0
        ? { label: "Empty", tone: "muted" }
        : loadedCount === total
          ? { label: "Synced", tone: "good" }
          : loadedCount > 0
            ? { label: "Partial", tone: "warn" }
            : { label: "Not loaded", tone: "muted" };

    return {
      total,
      loadedCount,
      errorCount,
      usCount,
      ukCount,
      topMover,
      ageSec,
      status,
    };
  }, [watchlist, quotes]);

  const freshnessLabel = useMemo(
    () => formatFreshness(investingInsights.ageSec),
    [investingInsights.ageSec],
  );

  const chipStyle = useMemo(() => {
    const tone = investingInsights.status.tone;
    if (tone === "good") {
      return {
        backgroundColor: "rgba(167,139,250,0.10)",
        borderColor: "rgba(167,139,250,0.22)",
        textColor: theme.colors.text,
      };
    }
    if (tone === "warn") {
      return {
        backgroundColor: "rgba(255,255,255,0.06)",
        borderColor: "rgba(255,255,255,0.10)",
        textColor: theme.colors.text,
      };
    }
    return {
      backgroundColor: "rgba(255,255,255,0.04)",
      borderColor: "rgba(255,255,255,0.08)",
      textColor: theme.colors.muted,
    };
  }, [investingInsights.status.tone]);

  const showRefreshNow =
    investingInsights.total > 0 && investingInsights.loadedCount === 0;

  // ---------- WATCHLIST ITEM ----------
  const renderWatchItem = ({ item }) => {
    const q = quotes[item.symbol];
    const pct = q?.changePct ?? null;
    const pctText =
      pct === null ? null : `${pct > 0 ? "+" : ""}${pct.toFixed(2)}%`;
    const pctColor =
      pct === null
        ? theme.colors.muted
        : pct >= 0
          ? theme.colors.accent
          : theme.colors.danger;

    const subtitle = q?.error
      ? `Quote unavailable • ${item.exchange ?? "Unknown exchange"}`
      : q
        ? `${formatMoney(q.price, currencySymbol(profile?.currency))} • ${pctText ?? ""}`.trim()
        : "Tap Refresh to load price";

    return (
      <Card style={{ marginBottom: 12, paddingVertical: 14 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: theme.colors.text,
                fontWeight: "900",
                fontSize: 18,
              }}
            >
              {item.symbol}
            </Text>
            <Text
              style={{ color: theme.colors.muted, fontSize: 12, marginTop: 3 }}
            >
              {subtitle}
            </Text>
          </View>

          <View style={{ alignItems: "flex-end", gap: 8 }}>
            {pctText && !q?.error ? (
              <Text
                style={{ color: pctColor, fontWeight: "900", fontSize: 16 }}
              >
                {pctText}
              </Text>
            ) : null}

            <Pressable
              onPress={() => removeItem(item.id)}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 999,
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.06)",
              })}
            >
              <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
                Remove
              </Text>
            </Pressable>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <Screen>
      <FlatList
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.screen,
          paddingBottom: 24,
        }}
        data={watchlist}
        keyExtractor={(i) => i.id}
        renderItem={renderWatchItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View style={{ gap: 12 }}>
            {/* Title */}
            <Text
              style={{
                fontSize: 28,
                fontWeight: "800",
                color: theme.colors.text,
              }}
            >
              Investing
            </Text>
            <Text style={{ color: theme.colors.muted }}>
              Search stocks and build a watchlist (US + UK).
            </Text>

            <Pressable
              onPress={() => navigation.navigate("InvestingQuiz")} // or whatever your quiz stack route is called
              style={({ pressed }) => ({
                opacity: pressed ? 0.92 : 1,
                transform: [{ scale: pressed ? 0.995 : 1 }],
              })}
            >
              <View style={{ borderRadius: 22 }}>
                {/* Outer glow (soft) */}
                <View
                  style={{
                    position: "absolute",
                    top: -10,
                    left: -10,
                    right: -10,
                    bottom: -10,
                    borderRadius: 28,
                    backgroundColor: "rgba(168,85,247,0.12)", // purple glow base
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    top: -14,
                    left: 18,
                    width: 120,
                    height: 120,
                    borderRadius: 999,
                    backgroundColor: "rgba(255,122,24,0.12)", // orange bloom
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    bottom: -18,
                    right: 10,
                    width: 140,
                    height: 140,
                    borderRadius: 999,
                    backgroundColor: "rgba(168,85,247,0.14)", // purple bloom
                  }}
                />

                {/* Gradient button */}
                <LinearGradient
                  colors={[
                    "rgba(255,122,24,0.95)", // orange
                    "rgba(236,72,153,0.92)", // pink
                    "rgba(168,85,247,0.92)", // purple
                  ]}
                  start={{ x: 0, y: 0.2 }}
                  end={{ x: 1, y: 0.8 }}
                  style={{
                    borderRadius: 22,
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.14)",
                    overflow: "hidden",
                  }}
                >
                  {/* Inner sheen */}
                  <View
                    style={{
                      position: "absolute",
                      top: -30,
                      left: -20,
                      width: 220,
                      height: 120,
                      borderRadius: 999,
                      backgroundColor: "rgba(255,255,255,0.10)",
                      transform: [{ rotate: "-12deg" }],
                    }}
                  />

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <View
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 12,
                        backgroundColor: "rgba(0,0,0,0.18)",
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.18)",
                      }}
                    >
                      <Ionicons name="sparkles" size={18} color="white" />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: "rgba(255,255,255,0.9)",
                          fontSize: 12,
                          fontWeight: "800",
                        }}
                      >
                        Not sure where to start?
                      </Text>
                      <Text
                        style={{
                          color: "white",
                          fontSize: 16,
                          fontWeight: "900",
                          marginTop: 2,
                        }}
                      >
                        Not sure what to invest in? Start here
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="rgba(255,255,255,0.9)"
                    />
                  </View>
                </LinearGradient>
              </View>
            </Pressable>

            {/* Search */}
            <Card>
              <Text style={{ color: theme.colors.muted, marginBottom: 8 }}>
                Search
              </Text>

              <Input
                value={query}
                onChangeText={onChangeQuery}
                placeholder="Search stock or ticker (e.g. Apple, Microsoft)"
                returnKeyType="search"
                onSubmitEditing={handleSearch}
              />

              <View style={{ marginTop: 10 }}>
                <Button
                  title={searching ? "Searching..." : "Search"}
                  onPress={handleSearch}
                  disabled={searching}
                />
              </View>

              {searchError ? (
                <Text
                  style={{
                    color: theme.colors.danger,
                    marginTop: 10,
                    fontWeight: "800",
                  }}
                >
                  {searchError}
                </Text>
              ) : null}

              {results?.length ? (
                <View style={{ marginTop: 14, gap: 12 }}>
                  {results.map((r) => (
                    <View
                      key={r.symbol}
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderRadius: 16,
                        backgroundColor: "rgba(255,255,255,0.02)",
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.04)",
                      }}
                    >
                      <View style={{ flex: 1, paddingRight: 12 }}>
                        <Text
                          style={{
                            color: theme.colors.text,
                            fontWeight: "900",
                          }}
                        >
                          {r.symbol}
                        </Text>
                        <Text
                          style={{ color: theme.colors.muted, fontSize: 12 }}
                          numberOfLines={1}
                        >
                          {r.name} • {r.region}
                        </Text>
                      </View>

                      {/* pass exchange/region through */}
                      <Button
                        title="Add"
                        onPress={() => addSymbol(r.symbol, r.region)}
                      />
                    </View>
                  ))}
                </View>
              ) : hasSearched ? (
                <Text style={{ color: theme.colors.muted, marginTop: 12 }}>
                  No results yet — try another search.
                </Text>
              ) : null}
            </Card>

            {/* Watchlist header FIRST */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 6,
              }}
            >
              <Text style={{ color: theme.colors.text, fontWeight: "900" }}>
                Watchlist
              </Text>

              <Pressable
                onPress={refreshPrices}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 999,
                  backgroundColor: theme.colors.surface,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.06)",
                })}
              >
                <Text style={{ color: theme.colors.muted, fontWeight: "800" }}>
                  Refresh prices
                </Text>
              </Pressable>
            </View>

            {/* Insights card BELOW watchlist header */}
            <Card
              style={{
                padding: 0,
                overflow: "hidden",
                borderRadius: 22,
              }}
            >
              <View
                style={{
                  padding: 16,
                  backgroundColor: "rgba(255,255,255,0.015)",
                }}
              >
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
                    Insights
                  </Text>

                  <View
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 999,
                      backgroundColor: chipStyle.backgroundColor,
                      borderWidth: 1,
                      borderColor: chipStyle.borderColor,
                    }}
                  >
                    <Text
                      style={{
                        color: chipStyle.textColor,
                        fontSize: 12,
                        fontWeight: "900",
                      }}
                    >
                      {investingInsights.status.label}
                    </Text>
                  </View>
                </View>

                <Text
                  style={{
                    color: theme.colors.text,
                    fontSize: 20,
                    fontWeight: "900",
                    marginTop: 10,
                  }}
                >
                  Watchlist analytics
                </Text>

                <View
                  style={{
                    height: 1,
                    marginTop: 12,
                    backgroundColor: "rgba(167,139,250,0.18)",
                    shadowColor: theme.colors.accent,
                    shadowOpacity: 0.18,
                    shadowRadius: 12,
                    shadowOffset: { width: 0, height: 8 },
                  }}
                />

                {/* Refresh now CTA when nothing loaded */}
                {showRefreshNow ? (
                  <View style={{ marginTop: 14 }}>
                    <Button title="Refresh now" onPress={refreshPrices} />
                    <Text
                      style={{
                        color: theme.colors.muted,
                        fontSize: 12,
                        marginTop: 8,
                      }}
                    >
                      Prices load from an external API. Some UK listings may be
                      unavailable.
                    </Text>
                  </View>
                ) : null}

                <View style={{ flexDirection: "row", gap: 12, marginTop: 14 }}>
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
                      Quotes loaded
                    </Text>
                    <Text
                      style={{
                        color: theme.colors.text,
                        fontSize: 18,
                        fontWeight: "900",
                        marginTop: 6,
                      }}
                    >
                      {investingInsights.loadedCount}/{investingInsights.total}
                    </Text>
                    <Text
                      style={{
                        color: theme.colors.muted,
                        marginTop: 4,
                        fontSize: 12,
                      }}
                    >
                      {freshnessLabel}
                    </Text>
                  </View>

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
                      Market mix
                    </Text>
                    <Text
                      style={{
                        color: theme.colors.text,
                        fontSize: 18,
                        fontWeight: "900",
                        marginTop: 6,
                      }}
                    >
                      {investingInsights.usCount} US •{" "}
                      {investingInsights.ukCount} UK
                    </Text>
                    <Text
                      style={{
                        color: theme.colors.muted,
                        marginTop: 4,
                        fontSize: 12,
                      }}
                    >
                      Diversification check
                    </Text>
                  </View>
                </View>

                <View style={{ marginTop: 12 }}>
                  {investingInsights.topMover ? (
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
                        Biggest mover today
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
                            fontSize: 18,
                            fontWeight: "900",
                          }}
                        >
                          {investingInsights.topMover.symbol}
                        </Text>

                        <Text
                          style={{
                            color:
                              investingInsights.topMover.changePct >= 0
                                ? theme.colors.accent
                                : theme.colors.danger,
                            fontWeight: "900",
                            fontSize: 16,
                          }}
                        >
                          {investingInsights.topMover.changePct >= 0 ? "+" : ""}
                          {investingInsights.topMover.changePct.toFixed(2)}%
                        </Text>
                      </View>

                      <Text
                        style={{
                          color: theme.colors.muted,
                          marginTop: 4,
                          fontSize: 12,
                        }}
                      >
                        Tip: keep watchlist to 10–15 symbols for clarity.
                      </Text>
                    </View>
                  ) : (
                    <Text style={{ color: theme.colors.muted, marginTop: 6 }}>
                      Add a few stocks and tap “Refresh prices” to generate
                      insights.
                    </Text>
                  )}
                </View>
              </View>
            </Card>

            {/* Empty state + loading */}
            {!loading && watchlist.length === 0 ? (
              <Text style={{ color: theme.colors.muted }}>
                No watchlist items yet. Search and add one.
              </Text>
            ) : null}

            {loading ? (
              <Text style={{ color: theme.colors.muted }}>
                Loading watchlist...
              </Text>
            ) : null}
          </View>
        }
      />
    </Screen>
  );
}
