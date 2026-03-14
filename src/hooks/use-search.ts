"use client";

import { useState, useCallback } from "react";

interface SearchResult {
  postcode: string;
  latitude: number;
  longitude: number;
}

export function useSearch() {
  const [result, setResult] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        const data = await response.json();
        setError(data.error ?? "Search failed");
        setResult(null);
        return;
      }

      const data = await response.json();
      setResult(data);
    } catch {
      setError("Search failed");
      setResult(null);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, isSearching, error, search, clear };
}
