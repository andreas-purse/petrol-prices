import { fetchAllFeeds } from "@/lib/feeds/fetcher";
import { fetchEvStations } from "@/lib/feeds/ev-fetcher";
import { upsertStations } from "./upsert";
import { upsertEvStations } from "./ev-upsert";

export interface IngestionResult {
  totalStations: number;
  totalPricesInserted: number;
  evStationsUpserted: number;
  evConnectorsInserted: number;
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

  // EV charging stations from Open Charge Map
  let evStationsUpserted = 0;
  let evConnectorsInserted = 0;

  try {
    const evFeed = await fetchEvStations();
    if (evFeed.error) {
      results.push({ retailer: "Open Charge Map (EV)", stationCount: 0, error: evFeed.error });
      console.error(`[ingest] EV: ${evFeed.error}`);
    } else {
      const evResult = await upsertEvStations(evFeed.stations);
      evStationsUpserted = evResult.upserted;
      evConnectorsInserted = evResult.connectorsInserted;
      results.push({ retailer: "Open Charge Map (EV)", stationCount: evResult.upserted });
      console.log(`[ingest] EV: ${evResult.upserted} stations, ${evResult.connectorsInserted} connectors`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    results.push({ retailer: "Open Charge Map (EV)", stationCount: 0, error: message });
    console.error(`[ingest] EV upsert failed: ${message}`);
  }

  return {
    totalStations,
    totalPricesInserted,
    evStationsUpserted,
    evConnectorsInserted,
    feedResults: results,
    durationMs: Date.now() - start,
  };
}
