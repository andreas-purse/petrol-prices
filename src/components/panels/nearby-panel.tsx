"use client";

import { SearchBar } from "@/components/search/search-bar";
import { SearchResults } from "@/components/search/search-results";
import { FuelTypeFilter } from "@/components/filters/fuel-type-filter";
import { AuthButtons } from "@/components/auth/auth-buttons";
import type { FuelType } from "@/hooks/use-fuel-filter";
import type { NearbyStation } from "@/hooks/use-nearby";

function FuelIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 32 32" className="shrink-0">
      <defs>
        <linearGradient id="panelIconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD600"/>
          <stop offset="100%" stopColor="#FF4060"/>
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="4" fill="url(#panelIconGrad)"/>
      <path d="M10 8h8v14h-8z" fill="white" rx="1"/>
      <path d="M18 12h2a2 2 0 012 2v6h-2v-5h-2" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="12" y="10" width="4" height="4" rx="0.5" fill="#FF8800" opacity="0.6"/>
      <path d="M10 22h8" stroke="white" strokeWidth="1.5"/>
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
    <div className="flex h-full flex-col overflow-hidden bg-[#0d1220]/95 backdrop-blur-xl">
      <div className="border-b border-white/10 p-4">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <FuelIcon />
            <div>
              <h1 className="horizon-gradient-text racing-heading text-xl">Find My Fuel</h1>
              <p className="font-heading text-xs tracking-wide text-muted-foreground">
                Save time and money. Find cheap fuel close by.
              </p>
            </div>
          </div>
          <AuthButtons />
        </div>
        <div className="speed-stripe mt-3 mb-3" />
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
      <div className="border-t border-white/10 p-3 text-center">
        <a href="/about" className="text-xs text-muted-foreground hover:text-secondary hover:underline">
          About our data — CMA verified sources
        </a>
      </div>
    </div>
  );
}
