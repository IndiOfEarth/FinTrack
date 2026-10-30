# FinTrack

**Personal finance, without the spreadsheet.**

FinTrack is a personal finance and investing companion built with **React Native and Expo**. It brings everyday financial tracking into one mobile app: log expenses, manage budgets, attach receipts, see spending patterns, and explore stocks in a personal watchlist.

Developed for the **University of London BSc Computer Science Mobile Development module**. **Project grade: 91%.**

[**Watch the walkthrough on YouTube**](https://www.youtube.com/watch?v=prt-cVd6IuM)

[![FinTrack demonstration](https://img.youtube.com/vi/prt-cVd6IuM/hqdefault.jpg)](https://www.youtube.com/watch?v=prt-cVd6IuM)

## Why FinTrack?

A bank balance tells you what you have, but not necessarily where it went. I wanted to make everyday money management easier to understand without manually maintaining a spreadsheet. The main challenge was integrating a polished mobile experience with authentication, a relational database, image uploads and external financial data.

## Features

- **Income and expense tracking:** add and categorise transactions, view monthly history, and edit or delete entries.
- **Budgeting:** set monthly budgets by category and track progress visually.
- **Spending insights:** dashboard summaries, spending visualisations and contextual recommendations based on recorded transactions.
- **Receipts:** attach receipt images to transactions and view them later.
- **Investing watchlist:** search for stocks, track selected symbols and view market quotes.
- **Guided onboarding:** introduction to the app, investing preferences and interactive tooltips.
- **Accounts:** email/password authentication backed by Supabase.

## Technology

| Area | Tools |
| --- | --- |
| Mobile interface | React Native, Expo, React Navigation |
| Backend | Supabase |
| Database | PostgreSQL (via Supabase) |
| Authentication | Supabase Auth |
| Receipts | Supabase Storage |
| Market data | Financial Modeling Prep (FMP) via a Supabase Edge Function |

The application separates UI components, navigation, client-side utility functions and data services. **Market-data calls go through an authenticated Edge Function so the FMP API key is not shipped with the mobile app.**

## Setup

### Requirements

- A compatible Node.js installation and npm
- Expo Go or a supported iOS/Android simulator
- A Supabase project with the required database tables, storage bucket, and access policies
- An FMP API key for live stock-search and quote features

### 1. Install dependencies

```bash
npm install
```

### 2. Set local Supabase client configuration

Copy `.env.example` to `.env` and replace the placeholders with your Supabase **project URL** and **publishable** key:

```bash
cp .env.example .env
```

These are intended to be public client identifiers. **Never place your Supabase secret/service-role key, the FMP API key, or other private credentials in an `EXPO_PUBLIC_` variable.**

### 3. Configure the backend

The financial tracking features use an existing Supabase project. The source archive does **not** include SQL migrations, table definitions, or storage policies; create/restore those in your own project before using the app. The expected application tables include `profiles`, `transactions`, `categories`, `budgets` and `watchlist`, plus a `receipts` Storage bucket.

Before exposing it to real users, verify **Row-Level Security (RLS)** on every user-owned table and appropriate Storage policies for receipt images. Source code alone cannot prove that the live Supabase project is configured correctly.

### 4. Deploy the FMP proxy

The app invokes the Supabase Edge Function at `supabase/functions/market-data/index.ts` for market data. Use the [Supabase CLI](https://supabase.com/docs/guides/functions) to deploy `market-data` to your project with JWT verification enabled, and set a server-side function secret named `FMP_API_KEY` to your **new, rotated** FMP key. Do not commit this value.

The mobile application no longer makes requests to FMP with a key embedded in the bundle. **Stock search and quotes will not work until this function and its secret are configured.** Add rate limits and monitor usage before offering the function publicly.

### 5. Run

```bash
npx expo start
```

Open with Expo Go or an emulator. Camera, receipt capture, and haptics may work best on a physical device.

## Project structure

```text
.
├── assets/                 # App icons and artwork
├── src/
│   ├── components/         # Reusable interface elements
│   ├── navigation/         # App navigation
│   ├── screens/            # Dashboard, ledger, budgets, investing, auth
│   ├── services/           # Supabase and market-data integration
│   ├── store/              # App state and contexts
│   ├── theme/              # Visual theme
│   └── utils/              # Finance and other utilities
├── supabase/
│   └── functions/market-data/ # Server-side FMP proxy
├── .env.example            # Public-client variable template
├── App.js
├── app.json
└── package.json
```

## Testing and limitations

This upload does not include the original automated test files or a dependency lockfile. Tests referenced in previous coursework documentation therefore cannot be run from this repository as uploaded. The app has not been end-to-end tested against a fresh Supabase environment as part of the GitHub security preparation.

The included Edge Function is a starting point: it authenticates users and restricts FMP endpoints and arguments, but it does not yet implement rate limiting or production usage controls.

## Future improvements

Open Banking support, biometric login, richer spending insights, more comprehensive testing, and expanded investing features.

## Security

Please read [SECURITY.md](SECURITY.md) before deploying. Do not commit environment files or API keys. The key present in an earlier local coursework/demo ZIP must be revoked independently; removing it from this repository does not revoke it.

## Author

**Indi Caburian** · [GitHub](https://github.com/IndiOfEarth) · [Video demonstration](https://www.youtube.com/watch?v=prt-cVd6IuM)

*University coursework / portfolio project.*
