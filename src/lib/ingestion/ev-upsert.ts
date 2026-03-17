import { db } from "@/db";
import { evStations, evConnectors } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { NormalizedEvStation } from "@/lib/feeds/ev-normalizer";

export async function upsertEvStations(
  normalized: NormalizedEvStation[],
): Promise<{
  upserted: number;
  connectorsInserted: number;
}> {
  let upserted = 0;
  let connectorsInserted = 0;

  for (const station of normalized) {
    const existing = await db
      .select({ id: evStations.id })
      .from(evStations)
      .where(eq(evStations.ocmId, station.ocmId))
      .limit(1);

    let stationId: number;

    if (existing.length > 0) {
      stationId = existing[0]!.id;
      await db
        .update(evStations)
        .set({
          operator: station.operator,
          title: station.title,
          address: station.address,
          postcode: station.postcode,
          town: station.town,
          latitude: station.latitude,
          longitude: station.longitude,
          usageCost: station.usageCost,
          isOperational: station.isOperational,
          dateLastVerified: station.dateLastVerified,
          dateLastStatusUpdate: station.dateLastStatusUpdate,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(evStations.id, stationId));

      // Replace connectors on update
      await db
        .delete(evConnectors)
        .where(eq(evConnectors.stationId, stationId));
    } else {
      const inserted = await db
        .insert(evStations)
        .values({
          ocmId: station.ocmId,
          operator: station.operator,
          title: station.title,
          address: station.address,
          postcode: station.postcode,
          town: station.town,
          latitude: station.latitude,
          longitude: station.longitude,
          usageCost: station.usageCost,
          isOperational: station.isOperational,
          dateLastVerified: station.dateLastVerified,
          dateLastStatusUpdate: station.dateLastStatusUpdate,
        })
        .returning({ id: evStations.id });
      stationId = inserted[0]!.id;
    }
    upserted++;

    for (const conn of station.connectors) {
      await db.insert(evConnectors).values({
        stationId,
        connectorType: conn.connectorType,
        powerKw: conn.powerKw,
        quantity: conn.quantity,
      });
      connectorsInserted++;
    }
  }

  return { upserted, connectorsInserted };
}
