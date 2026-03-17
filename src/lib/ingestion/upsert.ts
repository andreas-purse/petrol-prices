import { db } from "@/db";
import { stations, prices } from "@/db/schema";
import { eq, inArray, and, desc } from "drizzle-orm";
import type { NormalizedStation } from "@/lib/feeds/types";

export async function upsertStations(normalized: NormalizedStation[]): Promise<{
  upserted: number;
  pricesInserted: number;
}> {
  if (normalized.length === 0) return { upserted: 0, pricesInserted: 0 };

  let upsertedCount = 0;
  let pricesInsertedCount = 0;

  // Batch upsert stations in chunks to avoid parameter limits (SQLite limit is ~32k)
  const chunkSize = 100;
  for (let i = 0; i < normalized.length; i += chunkSize) {
    const chunk = normalized.slice(i, i + chunkSize);
    
    // 1. Batch Upsert Stations
    const upsertedStations = await db
      .insert(stations)
      .values(chunk.map(s => ({
        siteId: s.siteId,
        brand: s.brand,
        address: s.address,
        postcode: s.postcode,
        latitude: s.latitude,
        longitude: s.longitude,
        updatedAt: new Date().toISOString(),
      })))
      .onConflictDoUpdate({
        target: stations.siteId,
        set: {
          brand: stations.brand,
          address: stations.address,
          postcode: stations.postcode,
          latitude: stations.latitude,
          longitude: stations.longitude,
          updatedAt: new Date().toISOString(),
        },
      })
      .returning({ id: stations.id, siteId: stations.siteId });

    upsertedCount += upsertedStations.length;

    // 2. Fetch current prices for these stations to compare
    const stationIds = upsertedStations.map(s => s.id);
    const currentPrices = await db
      .select({
        stationId: prices.stationId,
        fuelType: prices.fuelType,
        pricePence: prices.pricePence,
      })
      .from(prices)
      .where(inArray(prices.stationId, stationIds));

    // Group current prices by stationId and fuelType for quick lookup
    const currentPriceMap = new Map<string, number>();
    for (const p of currentPrices) {
      currentPriceMap.set(`${p.stationId}-${p.fuelType}`, p.pricePence);
    }

    // 3. Prepare batch price inserts
    const pricesToInsert = [];
    const now = new Date().toISOString();

    for (const s of upsertedStations) {
      const originalStation = chunk.find(c => c.siteId === s.siteId);
      if (!originalStation) continue;

      for (const [fuelType, pricePence] of Object.entries(originalStation.prices)) {
        const key = `${s.id}-${fuelType}`;
        const currentPrice = currentPriceMap.get(key);

        if (currentPrice === undefined || currentPrice !== pricePence) {
          pricesToInsert.push({
            stationId: s.id,
            fuelType,
            pricePence,
            reportedAt: now,
          });
        }
      }
    }

    // 4. Batch insert prices
    if (pricesToInsert.length > 0) {
      await db.insert(prices).values(pricesToInsert);
      pricesInsertedCount += pricesToInsert.length;
    }
  }

  return { upserted: upsertedCount, pricesInserted: pricesInsertedCount };
}
