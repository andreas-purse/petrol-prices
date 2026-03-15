"use client";

import { useCallback, useEffect, useMemo } from "react";
import { Source, Layer } from "react-map-gl/maplibre";
import type { LayerProps, MapLayerMouseEvent } from "react-map-gl/maplibre";
import type { StationGeoJSON, StationFeature } from "@/hooks/use-stations";
import type { FuelType } from "@/hooks/use-fuel-filter";
import { useMap } from "react-map-gl/maplibre";

const PRICE_COLORS = [
  "#16a34a", // green  — cheapest 20%
  "#65a30d", // lime   — 20-40%
  "#eab308", // yellow — 40-60%
  "#f97316", // orange — 60-80%
  "#dc2626", // red    — most expensive 20%
] as const;

const NO_DATA_COLOR = "#94a3b8";

export interface PriceThresholds {
  p20: number;
  p40: number;
  p60: number;
  p80: number;
}

export function computeThresholds(
  features: StationFeature[],
  fuel: FuelType
): PriceThresholds {
  const prices = features
    .map((f) => f.properties.prices[fuel])
    .filter((p): p is number => typeof p === "number" && p > 0)
    .sort((a, b) => a - b);

  if (prices.length === 0) {
    return { p20: 130, p40: 135, p60: 140, p80: 145 };
  }

  const percentile = (pct: number) =>
    prices[Math.floor((pct / 100) * (prices.length - 1))]!;

  return {
    p20: percentile(20),
    p40: percentile(40),
    p60: percentile(60),
    p80: percentile(80),
  };
}

function getPriceColor(
  price: number | undefined,
  thresholds: PriceThresholds
): string {
  if (!price) return NO_DATA_COLOR;
  if (price <= thresholds.p20) return PRICE_COLORS[0];
  if (price <= thresholds.p40) return PRICE_COLORS[1];
  if (price <= thresholds.p60) return PRICE_COLORS[2];
  if (price <= thresholds.p80) return PRICE_COLORS[3];
  return PRICE_COLORS[4];
}

interface StationSourceProps {
  geojson: StationGeoJSON;
  fuel: FuelType;
  onStationClick: (feature: StationFeature) => void;
}

export function StationSource({ geojson, fuel, onStationClick }: StationSourceProps) {
  const { current: map } = useMap();

  const thresholds = computeThresholds(geojson.features, fuel);

  // Color unclustered points by price, add _price for cluster aggregation
  const coloredGeojson = useMemo(
    () => ({
      ...geojson,
      features: geojson.features.map((f) => {
        const price = f.properties.prices[fuel];
        return {
          ...f,
          properties: {
            ...f.properties,
            _color: getPriceColor(price, thresholds),
            _price: typeof price === "number" && price > 0 ? price : 0,
            _hasPrice: typeof price === "number" && price > 0 ? 1 : 0,
          },
        };
      }),
    }),
    [geojson, fuel, thresholds]
  );

  // Build cluster color expression using dynamic thresholds
  const clusterColorExpr: maplibregl.ExpressionSpecification = [
    "case",
    // If no stations in cluster have prices, show gray
    ["==", ["get", "priceCount"], 0],
    NO_DATA_COLOR,
    // Otherwise color by average price using thresholds
    ["<=", ["/", ["get", "priceSum"], ["get", "priceCount"]], thresholds.p20],
    PRICE_COLORS[0],
    ["<=", ["/", ["get", "priceSum"], ["get", "priceCount"]], thresholds.p40],
    PRICE_COLORS[1],
    ["<=", ["/", ["get", "priceSum"], ["get", "priceCount"]], thresholds.p60],
    PRICE_COLORS[2],
    ["<=", ["/", ["get", "priceSum"], ["get", "priceCount"]], thresholds.p80],
    PRICE_COLORS[3],
    PRICE_COLORS[4],
  ];

  const clusterLayer: LayerProps = {
    id: "clusters",
    type: "circle",
    source: "stations",
    filter: ["has", "point_count"],
    paint: {
      "circle-color": clusterColorExpr,
      "circle-radius": ["step", ["get", "point_count"], 18, 50, 24, 200, 30, 500, 36],
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
    },
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
      clusterProperties={{
        priceSum: ["+", ["get", "_price"]],
        priceCount: ["+", ["get", "_hasPrice"]],
      }}
    >
      <Layer {...clusterLayer} />
      <Layer {...dynamicPointLayer} />
    </Source>
  );
}
