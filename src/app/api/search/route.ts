import { NextRequest, NextResponse } from "next/server";
import { geocodePostcode } from "@/lib/postcodes";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  if (!query || query.trim().length < 2) {
    return NextResponse.json(
      { error: "Query must be at least 2 characters" },
      { status: 400 },
    );
  }

  try {
    const result = await geocodePostcode(query);

    if (!result) {
      return NextResponse.json(
        { error: "Postcode not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
