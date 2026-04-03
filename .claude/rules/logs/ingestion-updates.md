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
