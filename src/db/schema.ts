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

export const users = sqliteTable(
  "users",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    clerkId: text("clerk_id").notNull(),
    email: text("email"),
    createdAt: text("created_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [uniqueIndex("users_clerk_id_idx").on(table.clerkId)],
);

export const savedStations = sqliteTable(
  "saved_stations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    stationId: integer("station_id")
      .notNull()
      .references(() => stations.id, { onDelete: "cascade" }),
    createdAt: text("created_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [
    index("saved_stations_user_idx").on(table.userId),
    uniqueIndex("saved_stations_user_station_idx").on(table.userId, table.stationId),
  ],
);

export const purchases = sqliteTable(
  "purchases",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    stripePaymentId: text("stripe_payment_id").notNull(),
    amount: integer("amount").notNull(), // in pence
    status: text("status").notNull().default("completed"),
    createdAt: text("created_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [
    uniqueIndex("purchases_stripe_payment_idx").on(table.stripePaymentId),
    index("purchases_user_idx").on(table.userId),
  ],
);

export type Station = typeof stations.$inferSelect;
export type NewStation = typeof stations.$inferInsert;
export type Price = typeof prices.$inferSelect;
export type NewPrice = typeof prices.$inferInsert;
export type User = typeof users.$inferSelect;
export type SavedStation = typeof savedStations.$inferSelect;
export type Purchase = typeof purchases.$inferSelect;
