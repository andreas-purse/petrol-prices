import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { stations, prices, evStations, evConnectors } from "@/db/schema";
import { sql, eq } from "drizzle-orm";
import { z } from "zod/v4";

const querySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(100).max(50000).default(5000),
  fuel: z.enum(["E10", "E5", "B7", "SDV", "EV"]).optional(),
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
    const degreeRadius = radius / 111_320;

    // EV nearby search
    if (fuel === "EV") {
      const nearbyEv = await db
        .select({
          id: evStations.id,
          ocmId: evStations.ocmId,
          operator: evStations.operator,
          title: evStations.title,
          address: evStations.address,
          postcode: evStations.postcode,
          latitude: evStations.latitude,
          longitude: evStations.longitude,
          usageCost: evStations.usageCost,
          dateLastVerified: evStations.dateLastVerified,
          updatedAt: evStations.updatedAt,
          distance: sql<number>`(
            6371000 * 2 * asin(sqrt(
              pow(sin((radians(${evStations.latitude}) - radians(${lat})) / 2), 2) +
              cos(radians(${lat})) * cos(radians(${evStations.latitude})) *
              pow(sin((radians(${evStations.longitude}) - radians(${lng})) / 2), 2)
            ))
          )`.as("distance"),
        })
        .from(evStations)
        .where(
          sql`${evStations.latitude} BETWEEN ${lat - degreeRadius} AND ${lat + degreeRadius}
          AND ${evStations.longitude} BETWEEN ${lng - degreeRadius} AND ${lng + degreeRadius}`,
        )
        .orderBy(sql`distance`)
        .limit(limit);

      // Attach connectors
      const results = await Promise.all(
        nearbyEv.map(async (s) => {
          const conns = await db
            .select({
              connectorType: evConnectors.connectorType,
              powerKw: evConnectors.powerKw,
              quantity: evConnectors.quantity,
            })
            .from(evConnectors)
            .where(eq(evConnectors.stationId, s.id));

          return {
            id: s.id,
            siteId: s.ocmId,
            brand: s.operator ?? "EV Charger",
            address: s.address,
            postcode: s.postcode,
            latitude: s.latitude,
            longitude: s.longitude,
            updatedAt: s.updatedAt,
            distance: s.distance,
            prices: {} as Record<string, number>,
            type: "ev" as const,
            operator: s.operator,
            title: s.title,
            usageCost: s.usageCost,
            connectors: conns.map((c) => ({
              type: c.connectorType,
              powerKw: c.powerKw,
              quantity: c.quantity,
            })),
            dateLastVerified: s.dateLastVerified,
          };
        }),
      );

      return NextResponse.json(results);
    }

    // Regular fuel nearby search
    const nearbyStations = await db
      .select({
        id: stations.id,
        siteId: stations.siteId,
        brand: stations.brand,
        address: stations.address,
        postcode: stations.postcode,
        latitude: stations.latitude,
        longitude: stations.longitude,
        updatedAt: stations.updatedAt,
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
            reportedAt: prices.reportedAt,
          })
          .from(prices)
          .where(
            eq(
              prices.id,
              sql`(SELECT p2.id FROM prices p2 WHERE p2.station_id = ${s.id} AND p2.fuel_type = ${prices.fuelType} ORDER BY p2.reported_at DESC LIMIT 1)`,
            ),
          );

        const priceMap: Record<string, number> = {};
        const reportedAtMap: Record<string, string> = {};
        for (const p of latestPrices) {
          priceMap[p.fuelType] = p.pricePence;
          reportedAtMap[p.fuelType] = p.reportedAt;
        }

        return { ...s, prices: priceMap, pricesReportedAt: reportedAtMap };
      }),
    );

    // Filter by fuel type if specified
    const filtered = fuel
      ? results.filter((s) => s.prices[fuel] !== undefined)
      : results;

    // Sort by selected fuel price if specified
    if (fuel) {
      filtered.sort(
        (a, b) => (a.prices[fuel] ?? Infinity) - (b.prices[fuel] ?? Infinity),
      );
    }

    return NextResponse.json(filtered);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
