import { NextRequest, NextResponse } from "next/server";
import { runIngestion } from "@/lib/ingestion/ingest";

// Allow up to 60s for ingestion (requires Pro plan; Hobby caps at 10s)
export const maxDuration = 60;

function isAuthorized(request: NextRequest): boolean {
  // x-api-key header (manual/POST requests)
  const apiKey = request.headers.get("x-api-key");
  const expectedKey = process.env.INGEST_API_KEY;
  if (expectedKey && apiKey === expectedKey) return true;

  // Authorization header (Vercel cron sends Bearer <CRON_SECRET>)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) return true;

  return false;
}

async function handleIngest(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runIngestion();
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = handleIngest;
export const POST = handleIngest;
