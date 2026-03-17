import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";

const DVLA_URL =
  "https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles";

const querySchema = z.object({
  reg: z.string().min(2).max(10),
});

export async function GET(request: NextRequest) {
  const apiKey = process.env.DVLA_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "DVLA API key not configured" },
      { status: 503 },
    );
  }

  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = querySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid registration number" },
      { status: 400 },
    );
  }

  const regNumber = parsed.data.reg.replace(/\s+/g, "").toUpperCase();

  try {
    const response = await fetch(DVLA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({ registrationNumber: regNumber }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Vehicle not found" },
          { status: 404 },
        );
      }
      return NextResponse.json(
        { error: `DVLA API error: ${response.status}` },
        { status: 502 },
      );
    }

    const data = await response.json();

    // Estimate MPG from CO2 emissions
    const co2 = data.co2Emissions;
    const fuelType = data.fuelType;
    let estimatedMpg: number | null = null;

    if (co2 && co2 > 0) {
      if (fuelType === "PETROL") {
        estimatedMpg = Math.round(6526 / co2);
      } else if (fuelType === "DIESEL") {
        estimatedMpg = Math.round(7176 / co2);
      }
    }

    return NextResponse.json({
      make: data.make,
      fuelType: data.fuelType,
      co2Emissions: data.co2Emissions,
      engineCapacity: data.engineCapacity,
      estimatedMpg,
      registrationNumber: regNumber,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
