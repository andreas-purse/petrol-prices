"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export interface NearbyStation {
  id: number;
  siteId: string;
  brand: string;
  address: string;
  postcode: string;
  latitude: number;
  longitude: number;
  updatedAt: string;
  distance: number;
  prices: Record<string, number>;
}

export function useNearby(
  lat: number | null,
  lng: number | null,
  fuel?: string,
  radius = 5000,
) {
  const params = new URLSearchParams();
  if (lat !== null) params.set("lat", lat.toString());
  if (lng !== null) params.set("lng", lng.toString());
  params.set("radius", radius.toString());
  if (fuel) params.set("fuel", fuel);

  const key = lat !== null && lng !== null ? `/api/stations/nearby?${params}` : null;

  const { data, error, isLoading } = useSWR<NearbyStation[]>(key, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    nearby: data ?? [],
    isLoading,
    isError: !!error,
  };
}
