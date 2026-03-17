import { sqliteTable, text, real, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";

export const stations = sqliteTable(
  "stations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    siteId: text("site_id").notNull(),
    brand: text("brand").notNull(),
    address: text("address").notNull(),
    postcode: text("postcode").notNull(),
    latitude: real("latitude").notNull(),
    longitude: real("longitude").notNull(),
    createdAt: text("created_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text("updated_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [
    uniqueIndex("stations_site_id_idx").on(table.siteId),
    index("stations_lat_lng_idx").on(table.latitude, table.longitude),
  ],
);

export const prices = sqliteTable(
  "prices",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    stationId: integer("station_id")
      .notNull()
      .references(() => stations.id, { onDelete: "cascade" }),
    fuelType: text("fuel_type").notNull(),
    pricePence: real("price_pence").notNull(),
    reportedAt: text("reported_at").notNull(),
    createdAt: text("created_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [
    index("prices_station_fuel_reported_idx").on(
      table.stationId,
      table.fuelType,
      table.reportedAt,
    ),
  ],
);

export type Station = typeof stations.$inferSelect;
export type NewStation = typeof stations.$inferInsert;
export type Price = typeof prices.$inferSelect;
export type NewPrice = typeof prices.$inferInsert;

// EV Charging stations from Open Charge Map
export const evStations = sqliteTable(
  "ev_stations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ocmId: text("ocm_id").notNull(),
    operator: text("operator"),
    title: text("title").notNull(),
    address: text("address").notNull(),
    postcode: text("postcode").notNull(),
    town: text("town"),
    latitude: real("latitude").notNull(),
    longitude: real("longitude").notNull(),
    usageCost: text("usage_cost"),
    isOperational: integer("is_operational", { mode: "boolean" })
      .notNull()
      .default(true),
    dateLastVerified: text("date_last_verified"),
    dateLastStatusUpdate: text("date_last_status_update"),
    createdAt: text("created_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text("updated_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [
    uniqueIndex("ev_stations_ocm_id_idx").on(table.ocmId),
    index("ev_stations_lat_lng_idx").on(table.latitude, table.longitude),
  ],
);

export const evConnectors = sqliteTable(
  "ev_connectors",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    stationId: integer("station_id")
      .notNull()
      .references(() => evStations.id, { onDelete: "cascade" }),
    connectorType: text("connector_type").notNull(),
    powerKw: real("power_kw"),
    quantity: integer("quantity").default(1),
    createdAt: text("created_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [index("ev_connectors_station_idx").on(table.stationId)],
);

export type EvStation = typeof evStations.$inferSelect;
export type NewEvStation = typeof evStations.$inferInsert;
export type EvConnector = typeof evConnectors.$inferSelect;
export type NewEvConnector = typeof evConnectors.$inferInsert;
