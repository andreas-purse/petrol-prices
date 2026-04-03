# Find My Fuel

UK petrol station price comparison app. Interactive map showing live prices from 14 CMA-mandated public feeds (~7,000 stations).

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm typecheck    # TypeScript check
pnpm test         # Unit tests
pnpm db:push      # Push schema to database
pnpm ingest       # Run data ingestion from CMA feeds
```

## Key conventions

- Fuel types: E10 (unleaded), E5 (super unleaded), B7 (diesel), SDV (super diesel)
- Prices in pence per litre (e.g. 138.9)
- Timestamps stored as ISO strings
- Station coordinates validated to UK bounds (lat 49-61, lng -8 to 2)

## Context system

Detailed context lives in `.claude/rules/` subfolders — not in this file. See those rules for architecture, patterns, workflow preferences, and session logs.
