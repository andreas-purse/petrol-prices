export interface NormalizedEvConnector {
  connectorType: string;
  powerKw: number | null;
  quantity: number;
}

export interface NormalizedEvStation {
  ocmId: string;
  operator: string | null;
  title: string;
  address: string;
  postcode: string;
  town: string;
  latitude: number;
  longitude: number;
  usageCost: string | null;
  isOperational: boolean;
  dateLastVerified: string | null;
  dateLastStatusUpdate: string | null;
  connectors: NormalizedEvConnector[];
}

// UK bounding box
const UK_LAT_MIN = 49;
const UK_LAT_MAX = 61;
const UK_LNG_MIN = -8;
const UK_LNG_MAX = 2;

/* eslint-disable @typescript-eslint/no-explicit-any */
export function normalizeEvStation(raw: any): NormalizedEvStation | null {
  try {
    const addr = raw.AddressInfo;
    if (!addr?.Latitude || !addr?.Longitude) return null;

    const lat = Number(addr.Latitude);
    const lng = Number(addr.Longitude);
    if (isNaN(lat) || isNaN(lng)) return null;
    if (lat < UK_LAT_MIN || lat > UK_LAT_MAX) return null;
    if (lng < UK_LNG_MIN || lng > UK_LNG_MAX) return null;

    const connectors: NormalizedEvConnector[] = (raw.Connections ?? []).map(
      (c: any) => ({
        connectorType: c.ConnectionType?.Title ?? "Unknown",
        powerKw: c.PowerKW ? Number(c.PowerKW) : null,
        quantity: c.Quantity ?? 1,
      }),
    );
    if (connectors.length === 0) return null;

    return {
      ocmId: String(raw.ID),
      operator: raw.OperatorInfo?.Title ?? null,
      title:
        addr.Title ?? addr.AddressLine1 ?? "EV Charging Station",
      address:
        [addr.AddressLine1, addr.AddressLine2].filter(Boolean).join(", ") ||
        addr.Title ||
        "",
      postcode: addr.Postcode ?? "",
      town: addr.Town ?? "",
      latitude: lat,
      longitude: lng,
      usageCost: raw.UsageCost || null,
      isOperational: raw.StatusType?.IsOperational !== false,
      dateLastVerified: raw.DateLastVerified ?? null,
      dateLastStatusUpdate: raw.DateLastStatusUpdate ?? null,
      connectors,
    };
  } catch {
    return null;
  }
}

export function normalizeEvStations(rawArray: any[]): NormalizedEvStation[] {
  return rawArray
    .map(normalizeEvStation)
    .filter((s): s is NormalizedEvStation => s !== null);
}
