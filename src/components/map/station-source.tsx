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

const clusterLayer: LayerProps = {
  id: "clusters",
  type: "circle",
  source: "stations",
  filter: ["has", "point_count"],
  paint: {
    "circle-color": [
      "step",
      ["get", "point_count"],
      "#60a5fa",
      50,
      "#3b82f6",
      200,
      "#2563eb",
      500,
      "#1d4ed8",
    ],
    "circle-radius": ["step", ["get", "point_count"], 18, 50, 24, 200, 30, 500, 36],
    "circle-stroke-width": 2,
    "circle-stroke-color": "#ffffff",
  },
};

const clusterCountLayer: LayerProps = {
  id: "cluster-count",
  type: "symbol",
  source: "stations",
  filter: ["has", "point_count"],
  layout: {
    "text-field": "{point_count_abbreviated}",
    "text-size": 13,
  },
  paint: {
    "text-color": "#ffffff",
  },
};

interface StationSourceProps {
  geojson: StationGeoJSON;
  fuel: FuelType;
  onStationClick: (feature: StationFeature) => void;
}

export function StationSource({ geojson, fuel, onStationClick }: StationSourceProps) {
  const { current: map } = useMap();

  // Color unclustered points by price
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

  const dynamicPointLayer: LayerProps = {
    id: "unclustered-point",
    type: "circle",
    source: "stations",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-radius": 7,
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
      "circle-color": ["get", "_color"],
    },
  };

  const onClick = useCallback(
    (event: MapLayerMouseEvent) => {
      if (!map || !event.features?.length) return;

      const feature = event.features[0]!;

      if (feature.properties?.cluster) {
        const clusterId = feature.properties.cluster_id;
        const source = map.getSource("stations");
        if (source && "getClusterExpansionZoom" in source) {
          (source as { getClusterExpansionZoom: (id: number) => Promise<number> })
            .getClusterExpansionZoom(clusterId)
            .then((zoom) => {
              const coords = (feature.geometry as GeoJSON.Point).coordinates;
              map.easeTo({
                center: [coords[0]!, coords[1]!],
                zoom,
              });
            });
        }
        return;
      }

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

  // Register click handlers properly with cleanup
  useEffect(() => {
    if (!map) return;

    map.on("click", "clusters", onClick);
    map.on("click", "unclustered-point", onClick);

    return () => {
      map.off("click", "clusters", onClick);
      map.off("click", "unclustered-point", onClick);
    };
  }, [map, onClick]);

  return (
    <Source
      id="stations"
      type="geojson"
      data={coloredGeojson}
      cluster
      clusterMaxZoom={14}
      clusterRadius={50}
    >
      <Layer {...clusterLayer} />
      <Layer {...clusterCountLayer} />
      <Layer {...dynamicPointLayer} />
    </Source>
  );
}
