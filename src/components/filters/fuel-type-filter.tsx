"use client";

import { FUEL_LABELS, type FuelType } from "@/hooks/use-fuel-filter";

const FUEL_TYPES: FuelType[] = ["E10", "E5", "B7", "SDV"];

interface FuelTypeFilterProps {
  selected: FuelType;
  onChange: (fuel: FuelType) => void;
}

export function FuelTypeFilter({ selected, onChange }: FuelTypeFilterProps) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Fuel type">
      {FUEL_TYPES.map((fuel) => (
        <button
          key={fuel}
          role="radio"
          aria-checked={selected === fuel}
          onClick={() => onChange(fuel)}
          className={`rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-all ${
            selected === fuel
              ? "bg-primary/20 text-primary border border-primary/40 shadow-[0_0_10px_rgba(255,107,53,0.2)]"
              : "bg-white/[0.06] border border-transparent text-muted-foreground hover:bg-white/[0.12]"
          }`}
        >
          {FUEL_LABELS[fuel]}
        </button>
      ))}
    </div>
  );
}
