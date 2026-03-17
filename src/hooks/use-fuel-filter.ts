"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

export type FuelType = "E10" | "E5" | "B7" | "SDV" | "EV";

export const FUEL_LABELS: Record<FuelType, string> = {
  E10: "Unleaded (E10)",
  E5: "Super Unleaded (E5)",
  B7: "Diesel",
  SDV: "Super Diesel",
  EV: "EV Charging",
};

export function useFuelFilter() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const fuel = (searchParams.get("fuel") as FuelType) ?? "E10";

  const setFuel = useCallback(
    (newFuel: FuelType) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("fuel", newFuel);
      router.replace(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname],
  );

  return { fuel, setFuel };
}
