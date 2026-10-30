// Expo replaces EXPO_PUBLIC_* references at build time.
// Only non-secret Supabase public client settings belong here.
// Never put an FMP API key or Supabase service_role/secret key in this file.
export const ENV = {
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
  SUPABASE_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
};
