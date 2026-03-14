# Petrol Prices UK

## Project overview

Interactive map showing live UK petrol station prices. Data comes from 14 CMA-mandated public JSON feeds covering ~7,000 stations.

## Tech stack

- **Framework**: Next.js (App Router, TypeScript)
- **Database**: SQLite via Turso (libSQL) + Drizzle ORM
- **Map**: MapLibre GL JS via react-map-gl
- **Styling**: Tailwind CSS v4
- **Testing**: Vitest (unit/component), Playwright (e2e/screenshots)
- **Deployment**: Vercel (frontend) + Turso (database)

## Commands

```bash
pnpm dev          # Start dev server (Turbopack)
pnpm build        # Production build
pnpm typecheck    # TypeScript check
pnpm test         # Unit tests (vitest)
pnpm snapshot     # Take screenshots with Playwright (saves to snapshots/)
pnpm e2e          # Full Playwright e2e tests
pnpm db:push      # Push schema to database
pnpm ingest       # Run data ingestion from CMA feeds
```

## Visual verification workflow

**After making any UI changes, you MUST verify them visually:**

1. Make sure the dev server is running (`pnpm dev`)
2. Run `pnpm snapshot` to take screenshots of all key pages
3. Read the screenshot files from `snapshots/` to visually verify your changes look correct
4. If something looks wrong, fix it and repeat from step 2

Screenshot files are saved to:
- `snapshots/desktop-homepage.png` — Full desktop layout
- `snapshots/mobile-homepage.png` — Mobile layout
- `snapshots/desktop-search-filled.png` — Search bar with input
- `snapshots/mobile-search-filled.png` — Mobile search
- `snapshots/desktop-diesel-selected.png` — Diesel filter active
- `snapshots/mobile-diesel-selected.png` — Mobile diesel filter

**Do not consider a UI task complete until you have taken and reviewed screenshots.**

## Project structure

- `src/app/` — Next.js pages and API routes
- `src/components/` — React components (map, search, filters, panels, layout)
- `src/db/` — Drizzle schema and database client
- `src/hooks/` — Client-side React hooks (SWR data fetching)
- `src/lib/feeds/` — CMA retailer feed fetching and normalization
- `src/lib/ingestion/` — Database upsert logic
- `e2e/` — Playwright tests and snapshot specs
- `snapshots/` — Screenshot output (gitignored)

## Database

Uses SQLite via Turso. For local dev, defaults to `file:local.db` (no setup needed).

Set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` for production. See `.env.example`.

## Key conventions

- All timestamps stored as ISO strings (SQLite has no native timestamp type)
- Fuel types: E10 (unleaded), E5 (super unleaded), B7 (diesel), SDV (super diesel)
- Prices in pence per litre (e.g. 138.9)
- Station coordinates validated to UK bounds (lat 49-61, lng -8 to 2)
