"use client";

import { FUEL_LABELS, type FuelType } from "@/hooks/use-fuel-filter";

interface StationDetailProps {
  station: {
    brand: string;
    address: string;
    postcode: string;
    prices: Record<string, number>;
  };
  onClose: () => void;
}

function formatPrice(pence: number): string {
  return `${pence.toFixed(1)}p`;
}

export function StationDetail({ station, onClose }: StationDetailProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-card p-4 shadow-lg">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="font-bold">{station.brand}</h3>
          <p className="text-sm text-muted-foreground">{station.address}</p>
          <p className="text-sm text-muted-foreground">{station.postcode}</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground hover:bg-white/10"
          aria-label="Close"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="space-y-2">
        {(Object.entries(station.prices) as [FuelType, number][]).map(([fuel, price]) => (
          <div key={fuel} className="flex justify-between rounded-md bg-white/[0.06] px-3 py-2">
            <span className="text-sm">{FUEL_LABELS[fuel] ?? fuel}</span>
            <span className="font-semibold">{formatPrice(price)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
