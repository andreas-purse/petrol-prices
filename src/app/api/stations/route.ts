import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { stations, prices, evStations, evConnectors } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const fuel = request.nextUrl.searchParams.get("fuel");

    // EV stations
    if (fuel === "EV") {
      const allEvStations = await db.select().from(evStations);
      const allConnectors = await db.select().from(evConnectors);

      // Group connectors by station
      const connectorsByStation = new Map<
        number,
        { type: string; powerKw: number | null; quantity: number | null }[]
      >();
      for (const c of allConnectors) {
        if (!connectorsByStation.has(c.stationId)) {
          connectorsByStation.set(c.stationId, []);
        }
        connectorsByStation.get(c.stationId)!.push({
          type: c.connectorType,
          powerKw: c.powerKw,
          quantity: c.quantity,
        });
      }

      const features = allEvStations.map((s) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [s.longitude, s.latitude],
        },
        properties: {
          id: s.id,
          siteId: s.ocmId,
          brand: s.operator ?? "EV Charger",
          address: s.address,
          postcode: s.postcode,
          prices: {} as Record<string, number>,
          pricesReportedAt: {} as Record<string, string>,
          updatedAt: s.updatedAt,
          type: "ev" as const,
          operator: s.operator,
          title: s.title,
          usageCost: s.usageCost,
          connectors: connectorsByStation.get(s.id) ?? [],
          dateLastVerified: s.dateLastVerified,
        },
      }));

      return NextResponse.json(
        { type: "FeatureCollection" as const, features },
        {
          headers: {
            "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
          },
        },
      );
    }

    // Regular fuel stations
    const allStations = await db.select().from(stations);

    // Get latest price per station+fuelType using SQLite-compatible subquery
    const latestPrices = await db
      .select({
        stationId: prices.stationId,
        fuelType: prices.fuelType,
        pricePence: prices.pricePence,
        reportedAt: prices.reportedAt,
      })
      .from(prices)
      .where(
        eq(
          prices.id,
          sql`(SELECT p2.id FROM prices p2 WHERE p2.station_id = ${prices.stationId} AND p2.fuel_type = ${prices.fuelType} ORDER BY p2.reported_at DESC LIMIT 1)`,
        ),
      );

    // Group prices and reportedAt by station
    const pricesByStation = new Map<number, Record<string, number>>();
    const reportedAtByStation = new Map<number, Record<string, string>>();
    for (const p of latestPrices) {
      if (!pricesByStation.has(p.stationId)) {
        pricesByStation.set(p.stationId, {});
        reportedAtByStation.set(p.stationId, {});
      }
      pricesByStation.get(p.stationId)![p.fuelType] = p.pricePence;
      reportedAtByStation.get(p.stationId)![p.fuelType] = p.reportedAt;
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
        pricesReportedAt: reportedAtByStation.get(s.id) ?? {},
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
