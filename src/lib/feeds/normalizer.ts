import type { RawStation, NormalizedStation } from "./types";
import { rawStationSchema } from "./types";

const UK_BOUNDS = {
  latMin: 49,
  latMax: 61,
  lngMin: -8,
  lngMax: 2,
};

const FUEL_TYPES = ["E10", "E5", "B7", "SDV"] as const;

function normalizeBrand(brand: string): string {
  return brand.trim().replace(/\s+/g, " ");
}

function parsePrice(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const num = typeof value === "string" ? parseFloat(value) : Number(value);
  if (isNaN(num) || num <= 0 || num > 999) return null;
  return num;
}

function isValidUKCoordinate(lat: number, lng: number): boolean {
  return (
    lat >= UK_BOUNDS.latMin &&
    lat <= UK_BOUNDS.latMax &&
    lng >= UK_BOUNDS.lngMin &&
    lng <= UK_BOUNDS.lngMax
  );
}

export function normalizeStation(raw: unknown): NormalizedStation | null {
  const parsed = rawStationSchema.safeParse(raw);
  if (!parsed.success) return null;

  const station = parsed.data;
  const lat = Number(station.location.latitude);
  const lng = Number(station.location.longitude);

  if (isNaN(lat) || isNaN(lng) || !isValidUKCoordinate(lat, lng)) {
    return null;
  }

  const prices: Record<string, number> = {};
  for (const fuelType of FUEL_TYPES) {
    const price = parsePrice(station.prices[fuelType]);
    if (price !== null) {
      prices[fuelType] = price;
    }
  }

  if (Object.keys(prices).length === 0) {
    return null;
  }

  return {
    siteId: station.site_id,
    brand: normalizeBrand(station.brand),
    address: station.address ?? "",
    postcode: station.postcode ?? "",
    latitude: lat,
    longitude: lng,
    prices,
  };
}

export function normalizeStations(rawStations: unknown[]): NormalizedStation[] {
  const results: NormalizedStation[] = [];
  for (const raw of rawStations) {
    const normalized = normalizeStation(raw);
    if (normalized) {
      results.push(normalized);
    }
  }
  return results;
}
