"use client";

import { MapCircleMarker, MapPopup } from "@/components/ui/map";
import type { StationGeoJSON, StationFeature } from "@/hooks/use-stations";
import type { FuelType } from "@/hooks/use-fuel-filter";
import { FUEL_LABELS } from "@/hooks/use-fuel-filter";
import { FreshnessBadge, CmaBadge } from "@/components/ui/freshness-badge";

function getPriceColor(price: number | undefined): string {
  if (!price) return "#94a3b8"; // gray for no price
  if (price < 135) return "#16a34a"; // green
  if (price < 145) return "#65a30d"; // lime
  if (price < 150) return "#eab308"; // yellow
  if (price < 155) return "#f97316"; // orange
  return "#dc2626"; // red
}

function formatPrice(pence: number): string {
  return `${pence.toFixed(1)}p`;
}

interface StationSourceProps {
  geojson: StationGeoJSON;
  fuel: FuelType;
}

export function StationSource({ geojson, fuel }: StationSourceProps) {
  // Sort so cheapest stations render on top (last in array = on top in SVG/canvas)
  const sorted = [...geojson.features].sort((a, b) => {
    const pa = a.properties.prices[fuel] ?? 9999;
    const pb = b.properties.prices[fuel] ?? 9999;
    return pb - pa; // expensive first, cheap last (on top)
  });

  return (
    <>
      {sorted.map((f) => {
        const price = f.properties.prices[fuel];
        const color = getPriceColor(price);
        const [lng, lat] = f.geometry.coordinates;

        return (
          <MapCircleMarker
            key={f.properties.id}
            center={[lat!, lng!]}
            radius={4}
            pathOptions={{
              fillColor: color,
              fillOpacity: 1,
              stroke: false,
            }}
          >
            <MapPopup>
              <StationPopupContent station={f} />
            </MapPopup>
          </MapCircleMarker>
        );
      })}
    </>
  );
}

function StationPopupContent({ station }: { station: StationFeature }) {
  const { properties } = station;

  return (
    <div className="min-w-[200px]">
      <h3 className="text-sm font-bold text-foreground">{properties.brand}</h3>
      <p className="text-xs text-muted-foreground">{properties.address}</p>
      {properties.postcode && (
        <p className="text-xs text-muted-foreground">{properties.postcode}</p>
      )}
      <div className="mt-1.5 flex items-center gap-2">
        <CmaBadge />
        {properties.updatedAt && (
          <FreshnessBadge updatedAt={properties.updatedAt} />
        )}
      </div>
      <div className="mt-2 space-y-1">
        {(Object.entries(properties.prices) as [FuelType, number][]).map(
          ([fuelType, price]) => (
            <div key={fuelType} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {FUEL_LABELS[fuelType] ?? fuelType}
              </span>
              <span className="font-semibold">{formatPrice(price)}</span>
            </div>
          ),
        )}
        {Object.keys(properties.prices).length === 0 && (
          <p className="text-xs text-muted-foreground">No price data available</p>
        )}
      </div>
    </div>
  );
}
