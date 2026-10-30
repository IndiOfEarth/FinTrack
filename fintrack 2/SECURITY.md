# Security notes for FinTrack

This repository is prepared for public sharing, not a production security certification.

## Actions required before public deployment

1. **Rotate the old FMP API key.** An earlier version of `env.js` included an FMP key in source code. The cleaned copy does not include it, but the original key may remain usable and may exist in older coursework/Expo Snack submissions. Revoke/regenerate it in your provider dashboard.
2. **Deploy the authenticated market-data Edge Function**, and supply `FMP_API_KEY` through server-side Supabase function secrets. Do **not** put an FMP key in `.env`, `EXPO_PUBLIC_*`, `env.js`, Expo configuration, or another mobile client file.
3. **Verify Supabase access policies.** Publishable Supabase keys are intended for client use, but user privacy depends on database Row-Level Security (RLS) and Storage policies. This archive has no Supabase SQL schema or policy definitions, so the database/storage security could not be verified.
4. **Confirm receipt privacy.** Ensure the `receipts` bucket is private and Storage policies restrict uploads and signed URL generation to the owner of each user-scoped path.
5. **Implement abuse controls.** The provided Edge Function validates an authenticated user and input, but it does not include distributed rate limiting. Configure rate limiting, quotas, API budget alerts and logs before production use.
6. **Review dependencies and permissions** before release. The package has no lockfile or test suite in the uploaded archive; dependency vulnerability scanning and complete functional testing were not possible from this ZIP alone.
7. **Do not upload the original ZIP.** Upload only the cleaned files/ZIP, and keep `.env` and all local secrets out of commits.

## Key classification

- `EXPO_PUBLIC_SUPABASE_URL`: public project endpoint; safe as client configuration.
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: designed for client applications, provided RLS/security policies are correct.
- `FMP_API_KEY`: private provider credential, must remain server-side.
- Supabase `service_role` / `sb_secret_*`: privileged credentials; never place in this client repository.

## Reporting issues

If a credential is published accidentally, revoke it at its provider first. Deleting a commit does not reliably remove copies from Git history, forks or external caches.
