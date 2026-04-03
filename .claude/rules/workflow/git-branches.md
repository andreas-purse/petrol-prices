---
description: Git branch strategy and what's on each branch
globs: *
---

# Git Branches

## main (active)

Clean Phase 2 baseline:
- Interactive map with station markers
- Search by postcode/station name
- Fuel type filter (E10/B7)
- CMA Verified badges + freshness indicators
- /about page
- Daily cron ingestion

## experimental (remote only)

Everything up to latest — EV charging, driver calculator, number plate MPG lookup, price-colored points, Clerk/Stripe stripped out.

## full-featured (remote only)

Racing UI redesign (Forza theme), Clerk auth, Stripe payments. Branched before those were removed.
