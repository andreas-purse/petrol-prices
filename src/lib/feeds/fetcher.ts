import { RETAILER_FEEDS } from "./retailer-feeds";
import { normalizeStations } from "./normalizer";
import type { FeedResult } from "./types";

const FETCH_TIMEOUT_MS = 15_000;

async function fetchFeed(name: string, url: string): Promise<FeedResult> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return { retailer: name, stations: [], error: `HTTP ${response.status}` };
    }

    const data = await response.json();

    const rawStations = data?.stations ?? data?.data?.stations ?? [];
    if (!Array.isArray(rawStations)) {
      return { retailer: name, stations: [], error: "No stations array found in response" };
    }

    const stations = normalizeStations(rawStations);
    return { retailer: name, stations };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { retailer: name, stations: [], error: message };
  }
}

export async function fetchAllFeeds(): Promise<FeedResult[]> {
  const results = await Promise.allSettled(
    RETAILER_FEEDS.map((feed) => fetchFeed(feed.name, feed.url)),
  );

  return results.map((result, i) => {
    if (result.status === "fulfilled") {
      return result.value;
    }
    return {
      retailer: RETAILER_FEEDS[i]!.name,
      stations: [],
      error: result.reason?.message ?? "Promise rejected",
    };
  });
}
