export interface PostcodeResult {
  postcode: string;
  latitude: number;
  longitude: number;
}

export async function geocodePostcode(query: string): Promise<PostcodeResult | null> {
  const cleaned = query.trim().toUpperCase().replace(/\s+/g, " ");
  if (!cleaned) return null;

  try {
    const response = await fetch(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(cleaned)}`,
    );
    if (!response.ok) return null;

    const data = await response.json();
    if (data.status !== 200 || !data.result) return null;

    return {
      postcode: data.result.postcode,
      latitude: data.result.latitude,
      longitude: data.result.longitude,
    };
  } catch {
    return null;
  }
}

export async function autocompletePostcode(query: string): Promise<string[]> {
  const cleaned = query.trim();
  if (cleaned.length < 2) return [];

  try {
    const response = await fetch(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(cleaned)}/autocomplete`,
    );
    if (!response.ok) return [];

    const data = await response.json();
    return data.result ?? [];
  } catch {
    return [];
  }
}
