"use client";

import { useEffect } from "react";
import { useState } from "react";
import { useVehicle } from "@/hooks/use-vehicle";
import type { CalcSettings } from "@/hooks/use-calc-settings";

interface DriverCalculatorProps {
  settings: CalcSettings;
  onSettingsChange: (update: Partial<CalcSettings>) => void;
}

export function DriverCalculator({
  settings,
  onSettingsChange,
}: DriverCalculatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { vehicle, isLoading: isLoadingVehicle, error, lookup } = useVehicle();

  // Auto-fill MPG from vehicle lookup
  useEffect(() => {
    if (vehicle?.estimatedMpg) {
      onSettingsChange({ mpg: vehicle.estimatedMpg });
    }
  }, [vehicle, onSettingsChange]);

  const handleLookup = () => {
    if (settings.regNumber.trim()) {
      lookup(settings.regNumber.trim());
    }
  };

  return (
    <div className="border-t border-white/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="font-heading flex w-full items-center justify-between p-3 text-left text-sm uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
      >
        <span>Driver Calculator</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="space-y-3 px-3 pb-3">
          {/* Number plate lookup */}
          <div>
            <label className="text-xs text-muted-foreground">
              Number Plate
            </label>
            <div className="mt-1 flex gap-2">
              <input
                type="text"
                value={settings.regNumber}
                onChange={(e) =>
                  onSettingsChange({
                    regNumber: e.target.value.toUpperCase(),
                  })
                }
                placeholder="AB12 CDE"
                className="flex-1 rounded-md border border-white/10 bg-white/[0.08] px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none"
              />
              <button
                onClick={handleLookup}
                disabled={isLoadingVehicle || !settings.regNumber.trim()}
                className="rounded-md border border-primary/30 bg-primary/20 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/30 disabled:opacity-50"
              >
                {isLoadingVehicle ? "..." : "Lookup"}
              </button>
            </div>
            {vehicle && (
              <p className="mt-1 text-xs text-secondary">
                {vehicle.make} &middot; {vehicle.fuelType} &middot; ~
                {vehicle.estimatedMpg ?? "?"} MPG
              </p>
            )}
            {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
          </div>

          {/* MPG */}
          <div>
            <label className="text-xs text-muted-foreground">
              MPG (miles per gallon)
            </label>
            <input
              type="number"
              value={settings.mpg ?? ""}
              onChange={(e) =>
                onSettingsChange({
                  mpg: e.target.value ? Number(e.target.value) : null,
                })
              }
              placeholder="e.g. 45"
              className="mt-1 w-full rounded-md border border-white/10 bg-white/[0.08] px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none"
            />
          </div>

          {/* Hourly rate */}
          <div>
            <label className="text-xs text-muted-foreground">
              Hourly Rate (&pound;)
            </label>
            <input
              type="number"
              value={settings.hourlyRate ?? ""}
              onChange={(e) =>
                onSettingsChange({
                  hourlyRate: e.target.value ? Number(e.target.value) : null,
                })
              }
              placeholder="e.g. 15"
              className="mt-1 w-full rounded-md border border-white/10 bg-white/[0.08] px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none"
            />
          </div>

          {/* Tank size */}
          <div>
            <label className="text-xs text-muted-foreground">
              Tank Size (litres)
            </label>
            <input
              type="number"
              value={settings.tankLitres ?? ""}
              onChange={(e) =>
                onSettingsChange({
                  tankLitres: e.target.value ? Number(e.target.value) : null,
                })
              }
              placeholder="e.g. 50"
              className="mt-1 w-full rounded-md border border-white/10 bg-white/[0.08] px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none"
            />
          </div>

          {settings.mpg && settings.hourlyRate && settings.tankLitres && (
            <div className="rounded-md bg-white/[0.04] p-2 text-xs text-muted-foreground">
              Calculator ready — view nearby stations to see if they&apos;re
              worth the drive.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Calculate whether driving to a station is worth it */
export function calculateWorthIt(params: {
  distanceMeters: number;
  mpg: number;
  hourlyRate: number;
  tankLitres: number;
  stationPricePence: number;
  referencePricePence: number;
}) {
  const {
    distanceMeters,
    mpg,
    hourlyRate,
    tankLitres,
    stationPricePence,
    referencePricePence,
  } = params;

  const distanceMiles = distanceMeters / 1609.344;
  const travelTimeHours = distanceMiles / 30; // 30mph average

  // Fuel cost for round trip
  const gallonsUsed = (distanceMiles * 2) / mpg;
  const litresUsed = gallonsUsed * 4.546;
  const fuelCostPence = litresUsed * referencePricePence;

  // Opportunity cost for round trip
  const opportunityCostPence = travelTimeHours * 2 * hourlyRate * 100;

  // Savings from cheaper price (full tank)
  const savingsPence =
    (referencePricePence - stationPricePence) * tankLitres;

  // Net benefit
  const netBenefitPence = savingsPence - fuelCostPence - opportunityCostPence;

  return {
    distanceMiles: Math.round(distanceMiles * 10) / 10,
    travelTimeMinutes: Math.round(travelTimeHours * 60),
    fuelCostPounds: Math.round(fuelCostPence) / 100,
    opportunityCostPounds: Math.round(opportunityCostPence) / 100,
    savingsPounds: Math.round(savingsPence) / 100,
    netBenefitPounds: Math.round(netBenefitPence) / 100,
    worthIt: netBenefitPence > 0,
  };
}
