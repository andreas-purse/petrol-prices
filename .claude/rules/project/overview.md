---
description: Core project architecture and deployment info
globs: *
---

# Project Overview

**Find My Fuel** — live at https://petrol-prices-seven.vercel.app

## Tech stack

- **Framework**: Next.js (App Router, TypeScript)
- **Database**: SQLite via Turso (libSQL) + Drizzle ORM
- **Map**: MapLibre GL JS via react-map-gl
- **Styling**: Tailwind CSS v4
- **Deployment**: Vercel (frontend) + Turso (database)

## Project structure

- `src/app/` — Pages and API routes
- `src/components/` — UI components (map/, search/, filters/, panels/, layout/, ui/)
- `src/db/` — Drizzle schema and database client
- `src/hooks/` — Client-side React hooks (SWR data fetching)
- `src/lib/feeds/` — CMA retailer feed fetching and normalization
- `src/lib/ingestion/` — Database upsert logic
- `src/scripts/` — One-off scripts
- `e2e/` — Playwright tests

## Deployment

- Vercel auto-deploys from `main` branch
- Nightly ingestion via GitHub Actions at midnight UK time (`.github/workflows/nightly-ingest.yml`)
- Turso DB: libsql://petrol-prices-andreas-purse.aws-eu-west-1.turso.io
- Env vars on Vercel: TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, INGEST_API_KEY, NEXT_PUBLIC_MAP_STYLE_URL, CRON_SECRET
