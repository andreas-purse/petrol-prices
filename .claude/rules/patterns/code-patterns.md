---
description: Code patterns and conventions used in this project
globs: src/**
---

# Code Patterns

## API routes

- All in `src/app/api/` using Next.js App Router route handlers
- Return JSON responses with appropriate status codes
- `/api/stations` — list all stations with latest prices
- `/api/stations/[id]` — single station detail
- `/api/stations/nearby` — geospatial proximity search
- `/api/search` — postcode/name search
- `/api/ingest` — trigger data ingestion (protected by API key)
- `/api/health` — health check

## Client-side data fetching

- Uses SWR hooks in `src/hooks/`
- `useStations()` — all stations for map display
- `useNearby()` — nearby stations by lat/lng
- `useSearch()` — search by postcode or name
- `useFuelFilter()` — fuel type toggle state

## Components

- Map components in `src/components/map/` — MapLibre via react-map-gl
- Station data rendered as GeoJSON source layer
- Search bar with debounced input
- Mobile layout uses a bottom sheet (`mobile-sheet.tsx`)
