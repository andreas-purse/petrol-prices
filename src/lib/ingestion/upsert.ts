import { db } from "@/db";
import { stations, prices } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import type { NormalizedStation } from "@/lib/feeds/types";

export async function upsertStations(normalized: NormalizedStation[]): Promise<{
  upserted: number;
  pricesInserted: number;
}> {
  let upserted = 0;
  let pricesInserted = 0;

  for (const station of normalized) {
    // Upsert station
    const existing = await db
      .select({ id: stations.id })
      .from(stations)
      .where(eq(stations.siteId, station.siteId))
      .limit(1);

    let stationId: number;

    if (existing.length > 0) {
      stationId = existing[0]!.id;
      await db
        .update(stations)
        .set({
          brand: station.brand,
          address: station.address,
          postcode: station.postcode,
          latitude: station.latitude,
          longitude: station.longitude,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(stations.id, stationId));
    } else {
      const inserted = await db
        .insert(stations)
        .values({
          siteId: station.siteId,
          brand: station.brand,
          address: station.address,
          postcode: station.postcode,
          latitude: station.latitude,
          longitude: station.longitude,
        })
        .returning({ id: stations.id });
      stationId = inserted[0]!.id;
    }
    upserted++;

    // Insert prices only if changed
    for (const [fuelType, pricePence] of Object.entries(station.prices)) {
      const latestPrice = await db
        .select({ pricePence: prices.pricePence })
        .from(prices)
        .where(and(eq(prices.stationId, stationId), eq(prices.fuelType, fuelType)))
        .orderBy(desc(prices.reportedAt))
        .limit(1);

      if (latestPrice.length === 0 || latestPrice[0]!.pricePence !== pricePence) {
        await db.insert(prices).values({
          stationId,
          fuelType,
          pricePence,
          reportedAt: new Date().toISOString(),
        });
        pricesInserted++;
      }
    }
  }

  return { upserted, pricesInserted };
}
