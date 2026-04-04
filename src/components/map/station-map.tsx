"use client";

import { useRef } from "react";
import { Map, MapTileLayer, MapZoomControl, useMap } from "@/components/ui/map";
import { StationSource } from "./station-source";
import { useStations } from "@/hooks/use-stations";
import type { FuelType } from "@/hooks/use-fuel-filter";
import type { LatLngExpression } from "leaflet";

const UK_CENTER: LatLngExpression = [54.5, -2.5];
const INITIAL_ZOOM = 6;

interface StationMapProps {
  fuel: FuelType;
  searchLat?: number | null;
  searchLng?: number | null;
}

/** Imperatively fly to a location when searchLat/searchLng change */
function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const prevKey = useRef("");
  const key = `${lat},${lng}`;

  if (key !== prevKey.current) {
    prevKey.current = key;
    map.flyTo([lat, lng], 13, { duration: 1.5 });
  }

  return null;
}

export function StationMap({ fuel, searchLat, searchLng }: StationMapProps) {
  const { stations, isLoading } = useStations();

  return (
    <div className="relative h-full w-full">
      {isLoading && (
        <div className="absolute top-4 left-1/2 z-[1000] -translate-x-1/2 rounded-lg bg-white px-4 py-2 shadow-lg">
          <p className="text-sm text-muted-foreground">Loading stations...</p>
        </div>
      )}
      <Map
        center={UK_CENTER}
        zoom={INITIAL_ZOOM}
        zoomControl={false}
        maxBounds={[
          [48, -12],
          [62, 4],
        ]}
      >
        <MapTileLayer />
        <MapZoomControl />

        {searchLat && searchLng && (
          <FlyTo lat={searchLat} lng={searchLng} />
        )}

        {stations && <StationSource geojson={stations} fuel={fuel} />}
      </Map>
    </div>
  );
}
