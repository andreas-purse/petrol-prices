import { NextResponse } from "next/server";
import { db } from "@/db";
import { stations, prices } from "@/db/schema";
import { count, max } from "drizzle-orm";

export async function GET() {
  try {
    const [stationCount] = await db.select({ count: count() }).from(stations);
    const [latestPrice] = await db
      .select({ lastIngestion: max(prices.createdAt) })
      .from(prices);

    return NextResponse.json({
      status: "ok",
      stations: stationCount?.count ?? 0,
      lastIngestion: latestPrice?.lastIngestion ?? null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}
