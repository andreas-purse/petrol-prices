---
description: Database setup and data details
globs: src/db/**,src/lib/ingestion/**,src/lib/feeds/**
---

# Database

SQLite via Turso. Local dev uses `file:local.db`.

## Schema

Two tables:
- `stations` — id, brand, name, address, postcode, lat, lng, timestamps
- `prices` — station_id, fuel_type, price, timestamps

## Data

- ~4,079 stations ingested from 11 of 14 CMA feeds (as of 2026-04-03)
- BP returns HTTP 403 (blocks requests), Karan Retail endpoint is down
- Morrisons returns HTTP 404 (as of 2026-04-03 — was previously working, feed URL may have changed)
- Full ingestion takes ~28 minutes
- Don't re-run full ingestion casually — data is already there

## Conventions

- Fuel types: E10, E5, B7, SDV
- Prices in pence per litre
- All timestamps as ISO strings
- Coordinates validated to UK bounds (lat 49-61, lng -8 to 2)
