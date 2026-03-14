# Next Session Plan

When you start a new session, Claude should automatically pick up this plan and start working through it. No prompting needed — just say "continue" or "let's go".

## Step 1: Deploy to Vercel (5 minutes)

The app works locally. Time to make it live.

1. Run `npx vercel` to link the project
2. Set environment variables in Vercel:
   - `TURSO_DATABASE_URL` (from .env)
   - `TURSO_AUTH_TOKEN` (from .env)
   - `INGEST_API_KEY` (from .env)
   - `NEXT_PUBLIC_MAP_STYLE_URL` = `https://tiles.openfreemap.org/styles/liberty`
3. Deploy with `npx vercel --prod`
4. Verify the live URL works

## Step 2: Set up scheduled price refresh

Prices go stale without auto-refresh. Vercel has free cron jobs.

1. Add `vercel.json` with a cron that hits `/api/ingest` every 30 minutes
2. Optimize the ingestion speed (batch inserts instead of one-by-one)
3. Deploy and verify cron is running

## Step 3: Fix the "1 Issue" error badge

There's a Next.js dev error indicator showing. Investigate and fix.

## Step 4: Test and polish the interactive features

Take screenshots after each fix:
1. Click a station marker → verify popup shows brand + prices
2. Search a postcode → verify map flies to location + nearby results appear
3. Switch fuel filters → verify marker colors change
4. Test on mobile layout

## Step 5: UI improvements

Based on what the screenshots reveal:
- Make the legend fully visible (currently cut off at bottom)
- Improve the mobile bottom sheet (drag handle, smooth animation)
- Add a loading skeleton while stations fetch
- Better styling for the search results list
