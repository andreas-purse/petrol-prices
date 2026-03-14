"use client";

import type { NearbyStation } from "@/hooks/use-nearby";
import { FUEL_LABELS, type FuelType } from "@/hooks/use-fuel-filter";

interface SearchResultsProps {
  stations: NearbyStation[];
  fuel: FuelType;
  isLoading: boolean;
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

function formatPrice(pence: number): string {
  return `${pence.toFixed(1)}p`;
}

export function SearchResults({ stations, fuel, isLoading }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-lg bg-muted p-3">
            <div className="mb-2 h-4 w-3/4 rounded bg-border" />
            <div className="h-3 w-1/2 rounded bg-border" />
          </div>
        ))}
      </div>
    );
  }

  if (stations.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No stations found nearby. Try a different location or increase the search radius.
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {stations.map((station) => (
        <div key={station.id} className="p-3 transition-colors hover:bg-muted/50">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-sm font-semibold">{station.brand}</h4>
              <p className="truncate text-xs text-muted-foreground">{station.address}</p>
              <p className="text-xs text-muted-foreground">
                {station.postcode} &middot; {formatDistance(station.distance)}
              </p>
            </div>
            {station.prices[fuel] !== undefined && (
              <div className="ml-2 text-right">
                <span className="text-lg font-bold text-primary">
                  {formatPrice(station.prices[fuel]!)}
                </span>
                <p className="text-xs text-muted-foreground">{FUEL_LABELS[fuel]}</p>
              </div>
            )}
          </div>
          {Object.keys(station.prices).length > 1 && (
            <div className="mt-1 flex gap-3">
              {(Object.entries(station.prices) as [FuelType, number][])
                .filter(([f]) => f !== fuel)
                .map(([f, p]) => (
                  <span key={f} className="text-xs text-muted-foreground">
                    {FUEL_LABELS[f] ?? f}: {formatPrice(p)}
                  </span>
                ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
