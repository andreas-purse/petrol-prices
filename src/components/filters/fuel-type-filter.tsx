"use client";

import { FUEL_LABELS, type FuelType } from "@/hooks/use-fuel-filter";

const FUEL_TYPES: FuelType[] = ["E10", "E5", "B7", "SDV", "EV"];

interface FuelTypeFilterProps {
  selected: FuelType;
  onChange: (fuel: FuelType) => void;
}

export function FuelTypeFilter({ selected, onChange }: FuelTypeFilterProps) {
  return (
    <div className="flex flex-wrap gap-1" role="radiogroup" aria-label="Fuel type">
      {FUEL_TYPES.map((fuel) => (
        <button
          key={fuel}
          role="radio"
          aria-checked={selected === fuel}
          onClick={() => onChange(fuel)}
          className={`font-heading rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-all ${
            selected === fuel
              ? fuel === "EV"
                ? "bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40 border-b-2 border-b-[#22C55E] italic checkpoint-pulse shadow-[0_0_10px_rgba(34,197,94,0.2)]"
                : "bg-primary/20 text-primary border border-primary/40 border-b-2 border-b-primary italic checkpoint-pulse shadow-[0_0_10px_rgba(255,136,0,0.2)]"
              : "bg-white/[0.06] border border-transparent text-muted-foreground hover:bg-white/[0.12]"
          }`}
        >
          {fuel === "EV" && (
            <span className="mr-1">&#9889;</span>
          )}
          {FUEL_LABELS[fuel]}
        </button>
      ))}
    </div>
  );
}
