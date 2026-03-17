"use client";

import { Popup } from "react-map-gl/maplibre";
import type { StationFeature } from "@/hooks/use-stations";
import { FUEL_LABELS, type FuelType } from "@/hooks/use-fuel-filter";
import { FreshnessBadge, CmaBadge } from "@/components/ui/freshness-badge";
import { formatTimeAgo } from "@/lib/format-time-ago";

interface StationPopupProps {
  station: StationFeature;
  onClose: () => void;
}

function formatPrice(pence: number): string {
  return `${pence.toFixed(1)}p`;
}

export function StationPopup({ station, onClose }: StationPopupProps) {
  const { properties, geometry } = station;
  const isEv = properties.type === "ev";

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
        <h3 className="font-heading text-sm font-bold italic uppercase tracking-wide text-foreground">
          {isEv ? properties.title ?? properties.operator ?? "EV Charger" : properties.brand}
        </h3>
        <p className="text-xs text-muted-foreground">{properties.address}</p>
        {properties.postcode && (
          <p className="text-xs text-muted-foreground">{properties.postcode}</p>
        )}

        <div className="mt-1.5 flex items-center gap-2">
          {isEv ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#22C55E]/10 px-2 py-0.5 text-xs font-medium text-[#22C55E]">
              &#9889; EV Charging
            </span>
          ) : (
            <CmaBadge />
          )}
          {properties.updatedAt && (
            <FreshnessBadge updatedAt={properties.updatedAt} />
          )}
        </div>

        {/* EV-specific info */}
        {isEv && (
          <div className="mt-2 space-y-1">
            {properties.operator && (
              <p className="text-xs text-muted-foreground">
                Operator: <span className="text-foreground">{properties.operator}</span>
              </p>
            )}
            {properties.usageCost && (
              <p className="text-xs text-muted-foreground">
                Cost: <span className="text-foreground">{properties.usageCost}</span>
              </p>
            )}
            {properties.connectors && properties.connectors.length > 0 && (
              <div className="mt-1">
                <p className="text-xs font-medium text-muted-foreground">Connectors:</p>
                {properties.connectors.map((c, i) => (
                  <p key={i} className="text-xs text-foreground">
                    {c.type}
                    {c.powerKw ? ` — ${c.powerKw}kW` : ""}
                    {c.quantity && c.quantity > 1 ? ` (x${c.quantity})` : ""}
                  </p>
                ))}
              </div>
            )}
            {properties.dateLastVerified && (
              <p className="text-xs text-muted-foreground">
                Verified: {formatTimeAgo(properties.dateLastVerified)}
              </p>
            )}
          </div>
        )}

        {/* Fuel prices */}
        {!isEv && (
          <div className="mt-2 space-y-1">
            {(Object.entries(properties.prices) as [FuelType, number][]).map(
              ([fuel, price]) => (
                <div key={fuel} className="flex justify-between text-sm">
                  <span className="font-heading text-muted-foreground">
                    {FUEL_LABELS[fuel] ?? fuel}
                  </span>
                  <div className="text-right">
                    <span className="font-heading font-semibold">
                      {formatPrice(price)}
                    </span>
                    {properties.pricesReportedAt?.[fuel] && (
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        {formatTimeAgo(properties.pricesReportedAt[fuel]!)}
                      </span>
                    )}
                  </div>
                </div>
              ),
            )}
            {Object.keys(properties.prices).length === 0 && (
              <p className="text-xs text-muted-foreground">
                No price data available
              </p>
            )}
          </div>
        )}
      </div>
    </Popup>
  );
}
