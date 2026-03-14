import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { stations, prices } from "@/db/schema";
import { sql, eq } from "drizzle-orm";
import { z } from "zod/v4";
import { isProUser } from "@/lib/pro";

const querySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  fuel: z.enum(["E10", "E5", "B7", "SDV"]).default("E10"),
  radius: z.coerce.number().min(1000).max(30000).default(8000),
});

interface ScoredStation {
  id: number;
  brand: string;
  address: string;
  postcode: string;
  latitude: number;
  longitude: number;
  updatedAt: string;
  distance: number;
  price: number;
  score: number;
  reason: string;
}

export async function GET(request: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Sign in to use Optimal Finder" }, { status: 401 });
  }

  const isPro = await isProUser(clerkId);
  if (!isPro) {
    return NextResponse.json(
      { error: "Pro feature — unlock for £1", requiresPro: true },
      { status: 403 },
    );
  }

  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = querySchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid parameters", details: parsed.error.format() },
      { status: 400 },
    );
  }

  const { lat, lng, fuel, radius } = parsed.data;
  const degreeRadius = radius / 111_320;

  // Get nearby stations with distance
  const nearbyStations = await db
    .select({
      id: stations.id,
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
    .limit(100);

  // Get prices and score each station
  const scored: ScoredStation[] = [];

  for (const s of nearbyStations) {
    const latestPrice = await db
      .select({ pricePence: prices.pricePence })
      .from(prices)
      .where(
        eq(
          prices.id,
          sql`(SELECT p2.id FROM prices p2 WHERE p2.station_id = ${s.id} AND p2.fuel_type = ${fuel} ORDER BY p2.reported_at DESC LIMIT 1)`,
        ),
      );

    if (latestPrice.length === 0) continue;

    const price = latestPrice[0]!.pricePence;
    const distanceKm = s.distance / 1000;

    // Score: lower is better
    // Price component: normalized to 0-100 scale (130p=0, 160p=100)
    const priceScore = Math.max(0, Math.min(100, ((price - 130) / 30) * 100));
    // Distance component: 0-100 (0km=0, 10km=100)
    const distanceScore = Math.min(100, (distanceKm / 10) * 100);
    // Combined: price matters more (70%) than distance (30%)
    const score = priceScore * 0.7 + distanceScore * 0.3;

    // Generate human-readable reason
    const reason = generateReason(price, s.distance, nearbyStations[0]!.distance);

    scored.push({ ...s, price, score, reason });
  }

  // Sort by score (lowest = best)
  scored.sort((a, b) => a.score - b.score);

  return NextResponse.json(scored.slice(0, 5));
}

function generateReason(price: number, distance: number, closestDistance: number): string {
  const distKm = (distance / 1000).toFixed(1);
  const extraKm = ((distance - closestDistance) / 1000).toFixed(1);

  if (distance <= closestDistance * 1.1) {
    return `${price.toFixed(1)}p — one of your closest stations`;
  }
  if (Number(extraKm) <= 0.5) {
    return `${price.toFixed(1)}p — only ${extraKm}km further than the nearest`;
  }
  return `${price.toFixed(1)}p — ${distKm}km away`;
}
