---
description: Log of data ingestion runs and feed status changes
globs: *
---

# Ingestion Updates

## 2026-04-03 — Full ingestion run

- Ran `pnpm ingest`. 4,079 stations updated, 12,670 prices inserted, ~28 minutes (1,691,192ms).
- 11 of 14 CMA feeds succeeded.
- BP: HTTP 403 (known — blocks requests).
- Karan Retail: fetch failed (known — endpoint down).
- Morrisons: HTTP 404 — **NEW failure**. Was previously working. Feed URL may have changed; needs investigation.

## 2026-04-04 — Nightly ingestion via GitHub Actions

- Added `.github/workflows/nightly-ingest.yml` — runs `pnpm ingest` at midnight UK time (23:00 UTC) with 45-min timeout.
- Replaces Vercel cron approach which couldn't handle the ~28 min ingestion due to serverless function timeouts.
- Requires `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` as GitHub repo secrets. Also supports manual trigger via `workflow_dispatch`.
