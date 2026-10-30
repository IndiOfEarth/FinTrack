import { supabase } from "./supabaseClient";

// Stock data is fetched via an authenticated Supabase Edge Function.
// Keep the FMP key on the server; an EXPO_PUBLIC_ key would be exposed in the built app.
async function requestMarketData(action, payload) {
    const { data, error } = await supabase.functions.invoke("market-data", {
        body: { action, ...payload },
    });

    if (error) {
        return {
            ok: false,
            json: { error: "Market data is unavailable. Check the market-data Edge Function setup." },
        };
    }
    return { ok: true, json: data };
}

function safeJsonErrorMessage(json) {
    return json?.["Error Message"] || json?.error || json?.message || null;
}

/**
 * Simple in-memory TTL cache
 * - search cache: 10 mins
 * - quote cache: 60 secs (matches your existing logic)
 */
const _cache = {
    search: new Map(), // key: normalized query -> { data, expiresAt }
    quote: new Map(),  // key: SYMBOL -> { data, expiresAt }
};

const TTL = {
    searchMs: 10 * 60 * 1000,
    quoteMs: 60 * 1000,
};

export function clearStockCache() {
    _cache.search.clear();
    _cache.quote.clear();
}

function getCached(map, key) {
    const hit = map.get(key);
    if (!hit) return null;
    if (Date.now() > hit.expiresAt) {
      map.delete(key);
      return null;
    }
    return hit.data;
}

function setCached(map, key, data, ttlMs) {
    map.set(key, { data, expiresAt: Date.now() + ttlMs });
}

// Helper function - primarily for UK exchange ticker symbols
function normalizeQuoteSymbol(symbol, exchange) {
  const s = symbol?.trim()?.toUpperCase();
  if (!s) return null;

  // keep suffix if already there (e.g. "SHEL.L")
  if (s.includes(".")) return s;

  const ex = (exchange ?? "").toUpperCase();

  // LSE/London tickers often require .L
  if (ex.includes("LSE") || ex.includes("LONDON") || ex.includes("UK")) {
    return `${s}.L`;
  }

  return s;
}


// --- SEARCH ---
export async function searchStocks(query) {
    const qRaw = query?.trim();
    if (!qRaw) return [];

    // Normalize query for caching (so "Microsoft" === "microsoft")
    const q = qRaw.toLowerCase();
    const cached = getCached(_cache.search, q);
    if (cached) return cached;

    const [resA, resB] = await Promise.all([
        requestMarketData("search-symbol", { query: qRaw }),
        requestMarketData("search-name", { query: qRaw }),
    ]);
    const [jsonA, jsonB] = [resA.json, resB.json];

    const msgA = safeJsonErrorMessage(jsonA);
    const msgB = safeJsonErrorMessage(jsonB);

    if (!resA.ok && !resB.ok) {
        throw new Error(msgA || msgB || "Stock search failed. Please try again.");
    }

    const listA = Array.isArray(jsonA) ? jsonA : [];
    const listB = Array.isArray(jsonB) ? jsonB : [];

    const mapped = [...listA, ...listB]
      .map((r) => ({
        symbol: r.symbol?.toUpperCase(),
        name: r.name ?? "",
        region: r.exchange ?? r.stockExchange ?? "",
        currency: r.currency ?? "",
      }))
      .filter((x) => x.symbol);

    const seen = new Set();
    const deduped = [];
    for (const item of mapped) {
        if (seen.has(item.symbol)) continue;
        seen.add(item.symbol);
        deduped.push(item);
    }

    const score = (x) => {
        const ex = (x.region || "").toUpperCase();
        if (ex.includes("NASDAQ") || ex.includes("NYSE")) return 0;
        if (ex.includes("LSE") || ex.includes("LONDON")) return 1;
        return 2;
    };

    const final = deduped.sort((a, b) => score(a) - score(b));

    // Cache search results
    setCached(_cache.search, q, final, TTL.searchMs);

    return final;
}

// --- QUOTE ---
export async function getQuote(symbol, exchange) {
    const s = normalizeQuoteSymbol(symbol, exchange);
    if (!s) return null;

    const cached = getCached(_cache.quote, s);
    if (cached) return cached;

    const res = await requestMarketData("quote", { symbol: s });
    const json = res.json;

    const msg = safeJsonErrorMessage(json);
    if (!res.ok) throw new Error(msg || "Quote fetch failed. Please try again.");
    if (msg) throw new Error(msg);

    const q = Array.isArray(json) ? json[0] : null;
    if (!q) return null;

    const price = Number(q.price);
    const changePct = Number(q.changesPercentage ?? q.changePercent ?? q.changePercentage ?? 0);

    const shaped = {
        symbol: s,
        price: Number.isFinite(price) ? price : 0,
        changePct: Number.isFinite(changePct) ? changePct : 0,
        fetchedAt: Date.now(),
    };

    // Cache quote result
    setCached(_cache.quote, s, shaped, TTL.quoteMs);

    return shaped;
}