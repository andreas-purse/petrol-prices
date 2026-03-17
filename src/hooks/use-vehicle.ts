"use client";

import { useState, useCallback } from "react";

export interface VehicleInfo {
  make: string;
  fuelType: string;
  co2Emissions: number | null;
  engineCapacity: number | null;
  estimatedMpg: number | null;
  registrationNumber: string;
}

export function useVehicle() {
  const [vehicle, setVehicle] = useState<VehicleInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookup = useCallback(async (regNumber: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/vehicle?reg=${encodeURIComponent(regNumber)}`,
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Error ${res.status}`);
      }
      const data = await res.json();
      setVehicle(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed");
      setVehicle(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { vehicle, isLoading, error, lookup };
}
