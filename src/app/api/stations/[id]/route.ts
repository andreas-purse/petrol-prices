import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { stations, prices } from "@/db/schema";
import { eq, desc, gte, and } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const stationId = parseInt(id, 10);
  if (isNaN(stationId)) {
    return NextResponse.json({ error: "Invalid station ID" }, { status: 400 });
  }

  try {
    const [station] = await db
      .select()
      .from(stations)
      .where(eq(stations.id, stationId))
      .limit(1);

    if (!station) {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }

    // Get 7-day price history
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const priceHistory = await db
      .select({
        fuelType: prices.fuelType,
        pricePence: prices.pricePence,
        reportedAt: prices.reportedAt,
      })
      .from(prices)
      .where(
        and(
          eq(prices.stationId, stationId),
          gte(prices.reportedAt, sevenDaysAgo.toISOString()),
        ),
      )
      .orderBy(desc(prices.reportedAt));

    return NextResponse.json({
      station,
      priceHistory,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
