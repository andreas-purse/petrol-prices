import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { stations, prices } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(_request: NextRequest) {
  try {
    const allStations = await db.select().from(stations);

    // Get latest price per station+fuelType using SQLite-compatible subquery
    const latestPrices = await db
      .select({
        stationId: prices.stationId,
        fuelType: prices.fuelType,
        pricePence: prices.pricePence,
      })
      .from(prices)
      .where(
        eq(
          prices.id,
          sql`(SELECT p2.id FROM prices p2 WHERE p2.station_id = ${prices.stationId} AND p2.fuel_type = ${prices.fuelType} ORDER BY p2.reported_at DESC LIMIT 1)`,
        ),
      );

    // Group prices by station
    const pricesByStation = new Map<number, Record<string, number>>();
    for (const p of latestPrices) {
      if (!pricesByStation.has(p.stationId)) {
        pricesByStation.set(p.stationId, {});
      }
      pricesByStation.get(p.stationId)![p.fuelType] = p.pricePence;
    }

    // Build GeoJSON
    const features = allStations.map((s) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [s.longitude, s.latitude],
      },
      properties: {
        id: s.id,
        siteId: s.siteId,
        brand: s.brand,
        address: s.address,
        postcode: s.postcode,
        prices: pricesByStation.get(s.id) ?? {},
        updatedAt: s.updatedAt,
      },
    }));

    const geojson = {
      type: "FeatureCollection" as const,
      features,
    };

    return NextResponse.json(geojson, {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
