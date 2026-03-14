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
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            selected === fuel
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted text-muted-foreground hover:bg-border"
          }`}
        >
          {FUEL_LABELS[fuel]}
        </button>
      ))}
    </div>
  );
}
