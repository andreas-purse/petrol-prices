"use client";

import { useCallback, useEffect } from "react";
import { Source, Layer } from "react-map-gl/maplibre";
import type { LayerProps, MapLayerMouseEvent } from "react-map-gl/maplibre";
import type { StationGeoJSON, StationFeature } from "@/hooks/use-stations";
import type { FuelType } from "@/hooks/use-fuel-filter";
import { useMap } from "react-map-gl/maplibre";

function getPriceColor(price: number | undefined): string {
  if (!price) return "#94a3b8"; // gray for no price
  if (price < 135) return "#16a34a"; // green
  if (price < 145) return "#65a30d"; // lime
  if (price < 150) return "#eab308"; // yellow
  if (price < 155) return "#f97316"; // orange
  return "#dc2626"; // red
}

interface StationSourceProps {
  geojson: StationGeoJSON;
  fuel: FuelType;
  onStationClick: (feature: StationFeature) => void;
}

export function StationSource({ geojson, fuel, onStationClick }: StationSourceProps) {
  const { current: map } = useMap();

  const coloredGeojson = {
    ...geojson,
    features: geojson.features.map((f) => ({
      ...f,
      properties: {
        ...f.properties,
        _color: getPriceColor(f.properties.prices[fuel]),
      },
    })),
  };

  const pointLayer: LayerProps = {
    id: "station-points",
    type: "circle",
    source: "stations",
    paint: {
      "circle-radius": 3.5,
      "circle-color": ["get", "_color"],
    },
  };

  const onClick = useCallback(
    (event: MapLayerMouseEvent) => {
      if (!map || !event.features?.length) return;

      const feature = event.features[0]!;
      const props = feature.properties;
      if (props) {
        const stationFeature: StationFeature = {
          type: "Feature",
          geometry: feature.geometry as StationFeature["geometry"],
          properties: {
            id: props.id,
            siteId: props.siteId,
            brand: props.brand,
            address: props.address,
            postcode: props.postcode,
            prices: typeof props.prices === "string" ? JSON.parse(props.prices) : props.prices,
            updatedAt: props.updatedAt,
          },
        };
        onStationClick(stationFeature);
      }
    },
    [map, onStationClick],
  );

  useEffect(() => {
    if (!map) return;

    map.on("click", "station-points", onClick);

    return () => {
      map.off("click", "station-points", onClick);
    };
  }, [map, onClick]);

  return (
    <Source id="stations" type="geojson" data={coloredGeojson}>
      <Layer {...pointLayer} />
    </Source>
  );
}
