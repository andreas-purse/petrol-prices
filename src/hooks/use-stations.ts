"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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
    updatedAt: string;
  };
}

export interface StationGeoJSON {
  type: "FeatureCollection";
  features: StationFeature[];
}

export function useStations() {
  const { data, error, isLoading, mutate } = useSWR<StationGeoJSON>(
    "/api/stations",
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 5 * 60 * 1000, // 5 minutes
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
