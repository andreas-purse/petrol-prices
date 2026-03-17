import { normalizeEvStations, type NormalizedEvStation } from "./ev-normalizer";

const OCM_BASE_URL = "https://api.openchargemap.io/v3/poi/";
const FETCH_TIMEOUT_MS = 30_000;
const MAX_RESULTS = 5000;

export interface EvFeedResult {
  stations: NormalizedEvStation[];
  error?: string;
}

export async function fetchEvStations(): Promise<EvFeedResult> {
  const apiKey = process.env.OCM_API_KEY;
  if (!apiKey) {
    return { stations: [], error: "OCM_API_KEY not configured" };
  }

  try {
    const params = new URLSearchParams({
      countrycode: "GB",
      maxresults: MAX_RESULTS.toString(),
      compact: "true",
      verbose: "false",
      key: apiKey,
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(`${OCM_BASE_URL}?${params}`, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "FindMyFuel/1.0",
      },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return { stations: [], error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      return { stations: [], error: "Response is not an array" };
    }

    const stations = normalizeEvStations(data);
    return { stations };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { stations: [], error: message };
  }
}
