import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { isProUser } from "@/lib/pro";

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ isPro: false, signedIn: false });
  }

  const isPro = await isProUser(clerkId);
  return NextResponse.json({ isPro, signedIn: true });
}
