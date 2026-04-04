---
description: Log of map UI changes
globs: *
---

# Map Changes

## 2026-04-04 — Remove clustering, show individual points

- Removed cluster layer, cluster count layer, and cluster-click-to-zoom from `StationSource`.
- Stations now render as individual price-colored circle points at all zoom levels.
- Layer ID changed from `unclustered-point` to `station-points`.

## 2026-04-04 — Smaller points, no outline, price sorting

- Halved circle radius (7 → 3.5) and removed white stroke for cleaner look.
- Added `circle-sort-key` so cheapest stations (green) render on top of expensive ones.
- Uses negated price as sort key; stations with no price sort to bottom.
