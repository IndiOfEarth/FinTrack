import { supabase } from "./supabaseClient";

// Service for the watchlist (CRUD operations)

// Searches the watchlist table
// returns the data or empty array
export async function getWatchlist() {
    const { data, error } = await supabase
        .from("watchlist")
        .select("id, symbol, exchange, created_at")
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
}


// adding a stock/symbol to the user's watchlist
export async function addToWatchlist({ symbol, exchange }) {
    const {
        data: { user },
        error: userErr,
    } = await supabase.auth.getUser();

    if (userErr) throw userErr;
    if (!user) throw new Error("Not logged in.");

    const clean = symbol?.trim()?.toUpperCase();
    if (!clean) throw new Error("Missing symbol.");

    const { error } = await supabase
        .from("watchlist")
        .upsert(
        {
            user_id: user.id,
            symbol: clean,
            exchange: exchange ?? null,
        },
        // uses unique constraint for this column (user_id, symbol)
        { onConflict: "user_id,symbol" }
        );

    if (error) throw error;
}

// removing a stock/symbol from the user's watchlist
export async function removeFromWatchlist(id) {
    // delete where id matches stock id for user
    const { error } = await supabase.from("watchlist").delete().eq("id", id);
    if (error) throw error;
}

// Replace the user's watchlist with a new curated list
// items: [{ symbol: "AAPL", exchange?: "NASDAQ" | null }, ...]
export async function replaceWatchlist(items) {
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr) throw userErr;
  if (!user) throw new Error("Not logged in.");

  // 1) Clear current watchlist for this user
  const { error: delErr } = await supabase
    .from("watchlist")
    .delete()
    .eq("user_id", user.id);

  if (delErr) throw delErr;

  // 2) Insert new items (allow empty = just clears)
  const cleaned = (items ?? [])
    .map((x) => ({
      user_id: user.id,
      symbol: x?.symbol?.trim()?.toUpperCase(),
      exchange: x?.exchange ?? null,
    }))
    .filter((x) => x.symbol);

  if (cleaned.length === 0) return [];

  // Use upsert to respect unique constraint (user_id, symbol)
  const { error: upsertErr } = await supabase
    .from("watchlist")
    .upsert(cleaned, { onConflict: "user_id,symbol" });

  if (upsertErr) throw upsertErr;

  return await getWatchlist();
}