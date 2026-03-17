"use client";

import { useCallback, useEffect, useMemo } from "react";
import { Source, Layer } from "react-map-gl/maplibre";
import type { LayerProps, MapLayerMouseEvent } from "react-map-gl/maplibre";
import type { StationGeoJSON, StationFeature } from "@/hooks/use-stations";
import type { FuelType } from "@/hooks/use-fuel-filter";
import { useMap } from "react-map-gl/maplibre";

const PRICE_COLORS = [
  "#00FF88", // neon green  — cheapest 20%
  "#00D4FF", // cyan        — 20-40%
  "#FFD600", // gold        — 40-60%
  "#FF8C00", // orange      — 60-80%
  "#FF3355", // hot pink    — most expensive 20%
] as const;

const NO_DATA_COLOR = "#3A4055";
const EV_COLOR = "#22C55E";

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
  if (fuel === "EV") {
    return { p20: 0, p40: 0, p60: 0, p80: 0 };
  }

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
  const isEv = fuel === "EV";

  const thresholds = computeThresholds(geojson.features, fuel);

  // Compute min/max prices for heatmap weight normalization
  const priceRange = useMemo(() => {
    if (isEv) return { min: 0, max: 1 };
    const prices = geojson.features
      .map((f) => f.properties.prices[fuel])
      .filter((p): p is number => typeof p === "number" && p > 0);
    if (prices.length === 0) return { min: 120, max: 160 };
    let min = Infinity;
    let max = -Infinity;
    for (const p of prices) {
      if (p < min) min = p;
      if (p > max) max = p;
    }
    return { min, max };
  }, [geojson, fuel, isEv]);

  // Add _color and _price properties for each feature
  const coloredGeojson = useMemo(
    () => ({
      ...geojson,
      features: geojson.features.map((f) => {
        if (isEv) {
          return {
            ...f,
            properties: {
              ...f.properties,
              _color: EV_COLOR,
              _price: 0,
            },
          };
        }
        const price = f.properties.prices[fuel];
        return {
          ...f,
          properties: {
            ...f.properties,
            _color: getPriceColor(price, thresholds),
            _price: typeof price === "number" && price > 0 ? price : 0,
          },
        };
      }),
    }),
    [geojson, fuel, thresholds, isEv]
  );

  // Heatmap layer — hidden for EV, visible at low zoom for fuel
  const heatmapLayer: LayerProps = {
    id: "station-heat",
    type: "heatmap",
    source: "stations",
    paint: {
      "heatmap-weight": isEv
        ? 0
        : ([
            "interpolate",
            ["linear"],
            ["get", "_price"],
            0, 0,
            priceRange.min, 0.15,
            priceRange.max, 1,
          ] as maplibregl.ExpressionSpecification),
      "heatmap-intensity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        0, 0.6,
        6, 1,
        10, 1.5,
      ] as maplibregl.ExpressionSpecification,
      "heatmap-color": [
        "interpolate",
        ["linear"],
        ["heatmap-density"],
        0, "rgba(0,0,0,0)",
        0.1, "#0044FF",
        0.25, "#00D4FF",
        0.4, "#00FF88",
        0.6, "#FFD600",
        0.8, "#FF8C00",
        1, "#FF3355",
      ] as maplibregl.ExpressionSpecification,
      "heatmap-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        0, 4,
        5, 12,
        8, 20,
        11, 30,
        13, 40,
      ] as maplibregl.ExpressionSpecification,
      "heatmap-opacity": isEv
        ? 0
        : ([
            "interpolate",
            ["linear"],
            ["zoom"],
            10, 0.8,
            12, 0.3,
            14, 0,
          ] as maplibregl.ExpressionSpecification),
    },
  };

  // Individual station points
  const pointLayer: LayerProps = {
    id: "unclustered-point",
    type: "circle",
    source: "stations",
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        ...(isEv ? [4, 4, 10, 6, 13, 8, 16, 10] : [10, 3, 13, 7, 16, 10]),
      ],
      "circle-stroke-width": 2,
      "circle-stroke-color": isEv ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.3)",
      "circle-color": ["get", "_color"],
      // EV points visible at all zooms, fuel points fade in
      "circle-opacity": isEv
        ? 0.9
        : ([
            "interpolate",
            ["linear"],
            ["zoom"],
            10, 0,
            12, 0.7,
            14, 1,
          ] as maplibregl.ExpressionSpecification),
      "circle-stroke-opacity": isEv
        ? 0.9
        : ([
            "interpolate",
            ["linear"],
            ["zoom"],
            10, 0,
            12, 0.7,
            14, 1,
          ] as maplibregl.ExpressionSpecification),
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
            pricesReportedAt: typeof props.pricesReportedAt === "string" ? JSON.parse(props.pricesReportedAt) : props.pricesReportedAt,
            updatedAt: props.updatedAt,
            // EV fields
            ...(props.type === "ev"
              ? {
                  type: "ev" as const,
                  operator: props.operator,
                  title: props.title,
                  usageCost: props.usageCost,
                  connectors:
                    typeof props.connectors === "string"
                      ? JSON.parse(props.connectors)
                      : props.connectors,
                  dateLastVerified: props.dateLastVerified,
                }
              : {}),
          },
        };
        onStationClick(stationFeature);
      }
    },
    [map, onStationClick],
  );

  // Register click + cursor handlers for points
  useEffect(() => {
    if (!map) return;

    const onEnter = () => { map.getCanvas().style.cursor = "pointer"; };
    const onLeave = () => { map.getCanvas().style.cursor = ""; };

    map.on("click", "unclustered-point", onClick);
    map.on("mouseenter", "unclustered-point", onEnter);
    map.on("mouseleave", "unclustered-point", onLeave);

    return () => {
      map.off("click", "unclustered-point", onClick);
      map.off("mouseenter", "unclustered-point", onEnter);
      map.off("mouseleave", "unclustered-point", onLeave);
    };
  }, [map, onClick]);

  return (
    <Source
      id="stations"
      type="geojson"
      data={coloredGeojson}
    >
      <Layer {...heatmapLayer} />
      <Layer {...pointLayer} />
    </Source>
  );
}
