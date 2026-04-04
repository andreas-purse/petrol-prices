"use client";

import { Suspense, useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/layout/header";
import { MobileSheet } from "@/components/layout/mobile-sheet";
import { NearbyPanel } from "@/components/panels/nearby-panel";
import { MapControls } from "@/components/map/map-controls";
import { useSearch } from "@/hooks/use-search";
import { useNearby } from "@/hooks/use-nearby";
import { useFuelFilter } from "@/hooks/use-fuel-filter";

// Dynamically import map to avoid SSR issues with Leaflet
const StationMap = dynamic(
  () => import("@/components/map/station-map").then((mod) => ({ default: mod.StationMap })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-muted">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    ),
  },
);

function HomePage() {
  const { fuel, setFuel } = useFuelFilter();
  const { result: searchResult, isSearching, error: searchError, search } = useSearch();
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const searchLat = searchResult?.latitude ?? userLocation?.lat ?? null;
  const searchLng = searchResult?.longitude ?? userLocation?.lng ?? null;

  const { nearby, isLoading: isLoadingNearby } = useNearby(
    searchLat,
    searchLng,
    fuel,
    8000,
  );

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        // silently fail
      },
    );
  }, []);

  const hasSearched = searchResult !== null || userLocation !== null;

  const panel = (
    <NearbyPanel
      fuel={fuel}
      onFuelChange={setFuel}
      onSearch={search}
      onLocate={handleLocate}
      isSearching={isSearching}
      searchError={searchError}
      nearbyStations={nearby}
      isLoadingNearby={isLoadingNearby}
      hasSearched={hasSearched}
    />
  );

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="relative flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden w-[380px] flex-shrink-0 border-r border-border md:block">
          {panel}
        </div>

        {/* Map */}
        <div className="flex-1">
          <StationMap fuel={fuel} searchLat={searchLat} searchLng={searchLng} />
          <MapControls />
        </div>

        {/* Mobile bottom sheet */}
        <MobileSheet>{panel}</MobileSheet>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <HomePage />
    </Suspense>
  );
}
