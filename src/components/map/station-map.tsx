"use client";

import { useState, useCallback, useRef } from "react";
import Map, { NavigationControl, GeolocateControl } from "react-map-gl/maplibre";
import type { MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { StationSource } from "./station-source";
import { StationPopup } from "./station-popup";
import { useStations, type StationFeature } from "@/hooks/use-stations";
import type { FuelType } from "@/hooks/use-fuel-filter";

const MAP_STYLE =
  process.env.NEXT_PUBLIC_MAP_STYLE_URL || "https://tiles.openfreemap.org/styles/liberty";

const UK_CENTER = { latitude: 54.5, longitude: -2.5 };
const INITIAL_ZOOM = 6;

interface StationMapProps {
  fuel: FuelType;
  searchLat?: number | null;
  searchLng?: number | null;
}

export function StationMap({ fuel, searchLat, searchLng }: StationMapProps) {
  const mapRef = useRef<MapRef>(null);
  const { stations, isLoading } = useStations();
  const [selectedStation, setSelectedStation] = useState<StationFeature | null>(null);

  const onStationClick = useCallback((feature: StationFeature) => {
    setSelectedStation(feature);
  }, []);

  const onPopupClose = useCallback(() => {
    setSelectedStation(null);
  }, []);

  // Fly to search result
  const prevSearch = useRef<string>("");
  const searchKey = `${searchLat},${searchLng}`;
  if (searchKey !== prevSearch.current && searchLat && searchLng) {
    prevSearch.current = searchKey;
    mapRef.current?.flyTo({
      center: [searchLng, searchLat],
      zoom: 13,
      duration: 1500,
    });
  }

  return (
    <div className="relative h-full w-full">
      {isLoading && (
        <div className="absolute top-4 left-1/2 z-10 -translate-x-1/2 rounded-xl bg-card px-4 py-2 shadow-lg">
          <p className="text-sm text-muted-foreground">Loading stations...</p>
        </div>
      )}
      <Map
        ref={mapRef}
        initialViewState={{
          ...UK_CENTER,
          zoom: INITIAL_ZOOM,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={MAP_STYLE}
        maxBounds={[-12, 48, 4, 62]}
      >
        <NavigationControl position="top-right" />
        <GeolocateControl
          position="top-right"
          trackUserLocation
          showAccuracyCircle={false}
        />

        {stations && (
          <StationSource
            geojson={stations}
            fuel={fuel}
            onStationClick={onStationClick}
          />
        )}

        {selectedStation && (
          <StationPopup station={selectedStation} onClose={onPopupClose} />
        )}
      </Map>
    </div>
  );
}
