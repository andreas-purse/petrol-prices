import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { stations, prices } from "@/db/schema";
import { sql, eq } from "drizzle-orm";
import { z } from "zod/v4";

const querySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(100).max(50000).default(5000),
  fuel: z.enum(["E10", "E5", "B7", "SDV"]).optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
});

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = querySchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid parameters", details: parsed.error.format() },
      { status: 400 },
    );
  }

  const { lat, lng, radius, fuel, limit } = parsed.data;

  try {
    // Haversine in pure SQL (works in SQLite)
    const degreeRadius = radius / 111_320;

    const nearbyStations = await db
      .select({
        id: stations.id,
        siteId: stations.siteId,
        brand: stations.brand,
        address: stations.address,
        postcode: stations.postcode,
        latitude: stations.latitude,
        longitude: stations.longitude,
        distance: sql<number>`(
          6371000 * 2 * asin(sqrt(
            pow(sin((radians(${stations.latitude}) - radians(${lat})) / 2), 2) +
            cos(radians(${lat})) * cos(radians(${stations.latitude})) *
            pow(sin((radians(${stations.longitude}) - radians(${lng})) / 2), 2)
          ))
        )`.as("distance"),
      })
      .from(stations)
      .where(
        sql`${stations.latitude} BETWEEN ${lat - degreeRadius} AND ${lat + degreeRadius}
        AND ${stations.longitude} BETWEEN ${lng - degreeRadius} AND ${lng + degreeRadius}`,
      )
      .orderBy(sql`distance`)
      .limit(limit);

    // Attach latest prices per station
    const results = await Promise.all(
      nearbyStations.map(async (s) => {
        const latestPrices = await db
          .select({
            fuelType: prices.fuelType,
            pricePence: prices.pricePence,
          })
          .from(prices)
          .where(
            eq(
              prices.id,
              sql`(SELECT p2.id FROM prices p2 WHERE p2.station_id = ${s.id} AND p2.fuel_type = ${prices.fuelType} ORDER BY p2.reported_at DESC LIMIT 1)`,
            ),
          );

        const priceMap: Record<string, number> = {};
        for (const p of latestPrices) {
          priceMap[p.fuelType] = p.pricePence;
        }

        return { ...s, prices: priceMap };
      }),
    );

    // Filter by fuel type if specified
    const filtered = fuel ? results.filter((s) => s.prices[fuel] !== undefined) : results;

    // Sort by selected fuel price if specified
    if (fuel) {
      filtered.sort((a, b) => (a.prices[fuel] ?? Infinity) - (b.prices[fuel] ?? Infinity));
    }

    return NextResponse.json(filtered);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
