import { fetchAllFeeds } from "@/lib/feeds/fetcher";
import { upsertStations } from "./upsert";

export interface IngestionResult {
  totalStations: number;
  totalPricesInserted: number;
  feedResults: {
    retailer: string;
    stationCount: number;
    error?: string;
  }[];
  durationMs: number;
}

export async function runIngestion(): Promise<IngestionResult> {
  const start = Date.now();

  const feedResults = await fetchAllFeeds();

  let totalStations = 0;
  let totalPricesInserted = 0;
  const results: IngestionResult["feedResults"] = [];

  for (const feed of feedResults) {
    if (feed.error) {
      results.push({
        retailer: feed.retailer,
        stationCount: 0,
        error: feed.error,
      });
      console.error(`[ingest] ${feed.retailer}: ${feed.error}`);
      continue;
    }

    try {
      const { upserted, pricesInserted } = await upsertStations(feed.stations);
      totalStations += upserted;
      totalPricesInserted += pricesInserted;
      results.push({ retailer: feed.retailer, stationCount: upserted });
      console.log(`[ingest] ${feed.retailer}: ${upserted} stations, ${pricesInserted} prices`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      results.push({ retailer: feed.retailer, stationCount: 0, error: message });
      console.error(`[ingest] ${feed.retailer} upsert failed: ${message}`);
    }
  }

  return {
    totalStations,
    totalPricesInserted,
    feedResults: results,
    durationMs: Date.now() - start,
  };
}
