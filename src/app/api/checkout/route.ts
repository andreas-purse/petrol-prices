import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key);
}

export async function POST(request: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  }

  try {
    const stripe = getStripe();
    const origin = request.headers.get("origin") ?? "https://petrol-prices-seven.vercel.app";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: "Find My Fuel Pro",
              description:
                "Unlock Optimal Station Finder, saved stations, and all Pro features. One-time payment.",
            },
            unit_amount: 100, // £1.00 in pence
          },
          quantity: 1,
        },
      ],
      metadata: { clerkId },
      success_url: `${origin}/?pro=success`,
      cancel_url: `${origin}/?pro=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
