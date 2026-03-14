import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, savedStations, stations, prices } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

async function getOrCreateUser(clerkId: string) {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  if (existing.length > 0) return existing[0]!;

  const inserted = await db
    .insert(users)
    .values({ clerkId })
    .returning();

  return inserted[0]!;
}

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getOrCreateUser(clerkId);

  const saved = await db
    .select({
      id: savedStations.id,
      stationId: stations.id,
      siteId: stations.siteId,
      brand: stations.brand,
      address: stations.address,
      postcode: stations.postcode,
      latitude: stations.latitude,
      longitude: stations.longitude,
      updatedAt: stations.updatedAt,
      savedAt: savedStations.createdAt,
    })
    .from(savedStations)
    .innerJoin(stations, eq(savedStations.stationId, stations.id))
    .where(eq(savedStations.userId, user.id));

  // Attach latest prices
  const results = await Promise.all(
    saved.map(async (s) => {
      const latestPrices = await db
        .select({
          fuelType: prices.fuelType,
          pricePence: prices.pricePence,
        })
        .from(prices)
        .where(
          eq(
            prices.id,
            sql`(SELECT p2.id FROM prices p2 WHERE p2.station_id = ${s.stationId} AND p2.fuel_type = ${prices.fuelType} ORDER BY p2.reported_at DESC LIMIT 1)`,
          ),
        );

      const priceMap: Record<string, number> = {};
      for (const p of latestPrices) {
        priceMap[p.fuelType] = p.pricePence;
      }

      return { ...s, prices: priceMap };
    }),
  );

  return NextResponse.json(results);
}

export async function POST(request: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const stationId = body.stationId;

  if (!stationId || typeof stationId !== "number") {
    return NextResponse.json({ error: "stationId is required" }, { status: 400 });
  }

  const user = await getOrCreateUser(clerkId);

  // Check if already saved
  const existing = await db
    .select()
    .from(savedStations)
    .where(
      and(
        eq(savedStations.userId, user.id),
        eq(savedStations.stationId, stationId),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json({ message: "Already saved" });
  }

  await db.insert(savedStations).values({
    userId: user.id,
    stationId,
  });

  return NextResponse.json({ message: "Saved" }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const stationId = Number(searchParams.get("stationId"));

  if (!stationId) {
    return NextResponse.json({ error: "stationId is required" }, { status: 400 });
  }

  const user = await getOrCreateUser(clerkId);

  await db
    .delete(savedStations)
    .where(
      and(
        eq(savedStations.userId, user.id),
        eq(savedStations.stationId, stationId),
      ),
    );

  return NextResponse.json({ message: "Removed" });
}
