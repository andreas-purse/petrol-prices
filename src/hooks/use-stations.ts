"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export interface EvConnectorInfo {
  type: string;
  powerKw: number | null;
  quantity: number;
}

export interface StationFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    id: number;
    siteId: string;
    brand: string;
    address: string;
    postcode: string;
    prices: Record<string, number>;
    pricesReportedAt?: Record<string, string>;
    updatedAt: string;
    // EV-specific fields
    type?: "ev";
    operator?: string;
    title?: string;
    usageCost?: string;
    connectors?: EvConnectorInfo[];
    dateLastVerified?: string;
  };
}

export interface StationGeoJSON {
  type: "FeatureCollection";
  features: StationFeature[];
}

export function useStations(fuel?: string) {
  const url = fuel === "EV" ? "/api/stations?fuel=EV" : "/api/stations";
  const { data, error, isLoading, mutate } = useSWR<StationGeoJSON>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 5 * 60 * 1000,
      dedupingInterval: 60 * 1000,
    },
  );

  return {
    stations: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}
