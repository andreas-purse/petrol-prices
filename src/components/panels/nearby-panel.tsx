"use client";

import { SearchBar } from "@/components/search/search-bar";
import { SearchResults } from "@/components/search/search-results";
import { FuelTypeFilter } from "@/components/filters/fuel-type-filter";
import { AuthButtons } from "@/components/auth/auth-buttons";
import type { FuelType } from "@/hooks/use-fuel-filter";
import type { NearbyStation } from "@/hooks/use-nearby";

function CarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 32 32" className="shrink-0">
      <rect width="32" height="32" rx="7" fill="#F7DC6F"/>
      <rect x="3" y="10" width="26" height="14" rx="7" fill="#E8453C"/>
      <rect x="8" y="5" width="16" height="9" rx="5" fill="#E8453C"/>
      <ellipse cx="11" cy="15" rx="3.5" ry="4" fill="white"/>
      <circle cx="12" cy="15.5" r="2" fill="#2C1810"/>
      <circle cx="10.5" cy="13.5" r="1" fill="white"/>
      <ellipse cx="21" cy="15" rx="3.5" ry="4" fill="white"/>
      <circle cx="22" cy="15.5" r="2" fill="#2C1810"/>
      <circle cx="20.5" cy="13.5" r="1" fill="white"/>
      <path d="M11 21 Q16 24 21 21" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

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
    <div className="flex h-full flex-col overflow-hidden bg-card">
      <div className="border-b border-border p-4">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <CarIcon />
            <div>
              <h1 className="font-heading text-lg font-bold text-primary">Find My Fuel</h1>
              <p className="text-xs text-muted-foreground">
                Save time and money. Find cheap fuel close by.
              </p>
            </div>
          </div>
          <AuthButtons />
        </div>
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
      <div className="border-t border-border p-3 text-center">
        <a href="/about" className="text-xs text-muted-foreground hover:text-secondary hover:underline">
          About our data — CMA verified sources
        </a>
      </div>
    </div>
  );
}
