import { z } from "zod/v4";

export const rawPricesSchema = z.object({
  E10: z.union([z.number(), z.string(), z.null()]).optional(),
  E5: z.union([z.number(), z.string(), z.null()]).optional(),
  B7: z.union([z.number(), z.string(), z.null()]).optional(),
  SDV: z.union([z.number(), z.string(), z.null()]).optional(),
});

export const rawStationSchema = z.object({
  site_id: z.string(),
  brand: z.string(),
  address: z.string().optional().default(""),
  postcode: z.string().optional().default(""),
  location: z.object({
    latitude: z.union([z.number(), z.coerce.number()]),
    longitude: z.union([z.number(), z.coerce.number()]),
  }),
  prices: rawPricesSchema,
});

export const rawFeedSchema = z.object({
  last_updated: z.string().optional(),
  stations: z.array(rawStationSchema),
});

export type RawStation = z.infer<typeof rawStationSchema>;
export type RawFeed = z.infer<typeof rawFeedSchema>;

export interface NormalizedStation {
  siteId: string;
  brand: string;
  address: string;
  postcode: string;
  latitude: number;
  longitude: number;
  prices: Record<string, number>;
}

export interface FeedResult {
  retailer: string;
  stations: NormalizedStation[];
  error?: string;
}
