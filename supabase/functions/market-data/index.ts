// Deploy as a Supabase Edge Function. FMP_API_KEY is a server-side secret.
// Require an authenticated user and deploy with JWT verification enabled.
import { createClient } from "npm:@supabase/supabase-js@2";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
};

const respond = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers });

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers });
  if (request.method !== "POST") return respond({ error: "Method not allowed" }, 405);

  const tokenHeader = request.headers.get("Authorization");
  if (!tokenHeader?.startsWith("Bearer ")) return respond({ error: "Authentication required" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const fmpKey = Deno.env.get("FMP_API_KEY");
  if (!supabaseUrl || !supabaseAnonKey || !fmpKey) {
    return respond({ error: "Market data is not configured" }, 503);
  }

  // Validate the user's access token, not just the presence of an Authorization header.
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: tokenHeader } },
  });
  const { data: { user }, error } = await client.auth.getUser(tokenHeader.slice(7));
  if (error || !user) return respond({ error: "Authentication required" }, 401);

  let input: { action?: unknown; query?: unknown; symbol?: unknown };
  try { input = await request.json(); }
  catch { return respond({ error: "Invalid JSON body" }, 400); }

  const action = input.action;
  const validActions = ["search-symbol", "search-name", "quote"];
  if (typeof action !== "string" || !validActions.includes(action)) {
    return respond({ error: "Unsupported market-data action" }, 400);
  }

  const value = action === "quote" ? input.symbol : input.query;
  if (typeof value !== "string" || !value.trim()) {
    return respond({ error: "Missing query or symbol" }, 400);
  }
  const cleaned = value.trim();
  if (action === "quote" && !/^[A-Za-z0-9.\^\-]{1,24}$/.test(cleaned)) {
    return respond({ error: "Invalid ticker symbol" }, 400);
  }
  if (action !== "quote" && cleaned.length > 80) {
    return respond({ error: "Search query too long" }, 400);
  }

  const upstream = new URL(`https://financialmodelingprep.com/stable/${action}`);
  upstream.searchParams.set(action === "quote" ? "symbol" : "query", cleaned);
  upstream.searchParams.set("apikey", fmpKey);
  try {
    const response = await fetch(upstream, { signal: AbortSignal.timeout(10000) });
    const payload = await response.json();
    if (!response.ok) return respond({ error: "Financial data provider error" }, 502);
    return respond(payload);
  } catch {
    return respond({ error: "Market data provider unavailable" }, 502);
  }
});
