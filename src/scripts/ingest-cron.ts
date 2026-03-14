import "dotenv/config";
import { runIngestion } from "../lib/ingestion/ingest";

async function main() {
  console.log("[cron] Starting ingestion...");

  try {
    const result = await runIngestion();

    console.log(
      JSON.stringify({
        event: "ingestion_complete",
        totalStations: result.totalStations,
        totalPricesInserted: result.totalPricesInserted,
        durationMs: result.durationMs,
        feeds: result.feedResults,
      }),
    );

    process.exit(0);
  } catch (err) {
    console.error("[cron] Ingestion failed:", err);
    process.exit(1);
  }
}

main();
