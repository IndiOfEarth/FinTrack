import { createClient } from "@supabase/supabase-js";
import { ENV } from "../../env";

const { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } = ENV;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    "Missing Supabase configuration. Copy .env.example to .env and set the EXPO_PUBLIC_SUPABASE_* variables."
  );
}

// The publishable/anon key is public by design. Protect user data with RLS policies.
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
