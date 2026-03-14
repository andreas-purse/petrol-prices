"use client";

import { SearchBar } from "@/components/search/search-bar";
import { SearchResults } from "@/components/search/search-results";
import { FuelTypeFilter } from "@/components/filters/fuel-type-filter";
import type { FuelType } from "@/hooks/use-fuel-filter";
import type { NearbyStation } from "@/hooks/use-nearby";

interface NearbyPanelProps {
  fuel: FuelType;
  onFuelChange: (fuel: FuelType) => void;
  onSearch: (query: string) => void;
  onLocate: () => void;
  isSearching: boolean;
  searchError: string | null;
  nearbyStations: NearbyStation[];
  isLoadingNearby: boolean;
  hasSearched: boolean;
}

export function NearbyPanel({
  fuel,
  onFuelChange,
  onSearch,
  onLocate,
  isSearching,
  searchError,
  nearbyStations,
  isLoadingNearby,
  hasSearched,
}: NearbyPanelProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      <div className="border-b border-border p-4">
        <h1 className="mb-3 text-lg font-bold">Petrol Prices UK</h1>
        <SearchBar
          onSearch={onSearch}
          onLocate={onLocate}
          isSearching={isSearching}
          error={searchError}
        />
        <div className="mt-3">
          <FuelTypeFilter selected={fuel} onChange={onFuelChange} />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {hasSearched ? (
          <SearchResults
            stations={nearbyStations}
            fuel={fuel}
            isLoading={isLoadingNearby}
          />
        ) : (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Search by postcode or use your location to find nearby stations.
          </div>
        )}
      </div>
    </div>
  );
}
