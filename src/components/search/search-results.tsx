"use client";

import type { NearbyStation } from "@/hooks/use-nearby";
import { FUEL_LABELS, type FuelType } from "@/hooks/use-fuel-filter";
import { FreshnessBadge } from "@/components/ui/freshness-badge";
import { formatTimeAgo } from "@/lib/format-time-ago";
import { calculateWorthIt } from "@/components/calculator/driver-calculator";
import type { CalcSettings } from "@/hooks/use-calc-settings";

interface SearchResultsProps {
  stations: NearbyStation[];
  fuel: FuelType;
  isLoading: boolean;
  calcSettings?: CalcSettings;
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

function formatPrice(pence: number): string {
  return `${pence.toFixed(1)}p`;
}

export function SearchResults({ stations, fuel, isLoading, calcSettings }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-lg bg-white/[0.06] p-3">
            <div className="mb-2 h-4 w-3/4 rounded bg-white/10" />
            <div className="h-3 w-1/2 rounded bg-white/10" />
          </div>
        ))}
      </div>
    );
  }

  if (stations.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No stations found nearby. Try a different location or increase the search radius.
      </div>
    );
  }

  const isEv = fuel === "EV";

  // Reference price for worth-it calculation (nearest station)
  const referencePricePence = !isEv && stations.length > 0
    ? stations[0]!.prices[fuel]
    : undefined;

  const hasCalc = !isEv &&
    calcSettings?.mpg &&
    calcSettings?.hourlyRate &&
    calcSettings?.tankLitres &&
    referencePricePence;

  return (
    <div className="divide-y divide-white/10">
      {stations.map((station, index) => {
        const worthIt = hasCalc && index > 0 && station.prices[fuel]
          ? calculateWorthIt({
              distanceMeters: station.distance,
              mpg: calcSettings.mpg!,
              hourlyRate: calcSettings.hourlyRate!,
              tankLitres: calcSettings.tankLitres!,
              stationPricePence: station.prices[fuel]!,
              referencePricePence: referencePricePence!,
            })
          : null;

        return (
          <div
            key={station.id}
            className={`flex items-start p-3 transition-colors hover:bg-white/[0.08] ${index === 0 ? "border-l-3 border-l-[#FFD600] bg-white/[0.04]" : ""}`}
          >
            <span className="racing-heading mr-3 w-8 shrink-0 text-center text-2xl text-primary/30">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h4 className="font-heading truncate text-sm font-semibold uppercase tracking-wide">
                    {isEv ? station.title ?? station.operator ?? station.brand : station.brand}
                  </h4>
                  <p className="truncate text-xs text-muted-foreground">
                    {station.address}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {station.postcode} &middot; {formatDistance(station.distance)}
                  </p>
                  {station.updatedAt && (
                    <FreshnessBadge updatedAt={station.updatedAt} />
                  )}
                </div>

                {/* Price or EV info */}
                {isEv ? (
                  <div className="ml-2 text-right">
                    <span className="text-xs text-[#22C55E] font-semibold">
                      &#9889; EV
                    </span>
                    {station.usageCost && (
                      <p className="text-xs text-muted-foreground max-w-[100px] truncate">
                        {station.usageCost}
                      </p>
                    )}
                  </div>
                ) : (
                  station.prices[fuel] !== undefined && (
                    <div className="ml-2 text-right">
                      <span className="racing-heading text-lg text-primary">
                        {formatPrice(station.prices[fuel]!)}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {FUEL_LABELS[fuel]}
                      </p>
                      {station.pricesReportedAt?.[fuel] && (
                        <p className="text-[10px] text-muted-foreground">
                          {formatTimeAgo(station.pricesReportedAt[fuel]!)}
                        </p>
                      )}
                    </div>
                  )
                )}
              </div>

              {/* EV connector info */}
              {isEv && station.connectors && station.connectors.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {station.connectors.map((c, i) => (
                    <span key={i} className="text-xs rounded bg-white/[0.06] px-1.5 py-0.5 text-muted-foreground">
                      {c.type}{c.powerKw ? ` ${c.powerKw}kW` : ""}
                    </span>
                  ))}
                </div>
              )}

              {/* Other fuel prices */}
              {!isEv && Object.keys(station.prices).length > 1 && (
                <div className="mt-1 flex gap-3">
                  {(Object.entries(station.prices) as [FuelType, number][])
                    .filter(([f]) => f !== fuel)
                    .map(([f, p]) => (
                      <span key={f} className="text-xs text-muted-foreground">
                        {FUEL_LABELS[f] ?? f}: {formatPrice(p)}
                      </span>
                    ))}
                </div>
              )}

              {/* Worth-it indicator */}
              {worthIt && (
                <div
                  className={`mt-1.5 rounded px-2 py-1 text-xs font-medium ${
                    worthIt.worthIt
                      ? "bg-[#22C55E]/10 text-[#22C55E]"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {worthIt.worthIt ? "Worth the drive" : "Not worth it"}{" "}
                  <span className="text-muted-foreground">
                    ({worthIt.netBenefitPounds >= 0 ? "+" : ""}
                    &pound;{worthIt.netBenefitPounds.toFixed(2)})
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
