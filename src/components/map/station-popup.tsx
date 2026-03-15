"use client";

import { Popup } from "react-map-gl/maplibre";
import type { StationFeature } from "@/hooks/use-stations";
import { FUEL_LABELS, type FuelType } from "@/hooks/use-fuel-filter";
import { FreshnessBadge, CmaBadge } from "@/components/ui/freshness-badge";

interface StationPopupProps {
  station: StationFeature;
  onClose: () => void;
}

function formatPrice(pence: number): string {
  return `${pence.toFixed(1)}p`;
}

export function StationPopup({ station, onClose }: StationPopupProps) {
  const { properties, geometry } = station;

  return (
    <Popup
      longitude={geometry.coordinates[0]}
      latitude={geometry.coordinates[1]}
      anchor="bottom"
      onClose={onClose}
      closeOnClick={false}
      className="station-popup"
    >
      <div className="min-w-[200px] p-1">
        <h3 className="font-heading text-sm font-bold italic uppercase tracking-wide text-foreground">{properties.brand}</h3>
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
            ([fuel, price]) => (
              <div key={fuel} className="flex justify-between text-sm">
                <span className="font-heading text-muted-foreground">
                  {FUEL_LABELS[fuel] ?? fuel}
                </span>
                <span className="font-heading font-semibold">{formatPrice(price)}</span>
              </div>
            ),
          )}
          {Object.keys(properties.prices).length === 0 && (
            <p className="text-xs text-muted-foreground">No price data available</p>
          )}
        </div>
      </div>
    </Popup>
  );
}
