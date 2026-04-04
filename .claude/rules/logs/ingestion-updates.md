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
- Manual test run succeeded — 37 minutes, all good.

## 2026-04-04 — Feed fixes (Morrisons + BP)

- Morrisons: URL needed `www.` prefix (`https://www.morrisons.com/...`). Without it, 404. Now returns 200.
- BP: Needed browser-like User-Agent header. Was returning 403 with custom UA. Now returns 200.
- Karan Retail: API server (`devapi.krlpos.com`) completely offline. No fix possible on our end.
- 13 of 14 feeds now working. Only Karan Retail remains down.

## 2026-04-04 — CI lint fix

- Removed `pnpm lint` step from CI. Next.js 16 dropped the `next lint` subcommand, and `eslint-plugin-react` is incompatible with ESLint 10.
- Typecheck and tests still run in CI.
