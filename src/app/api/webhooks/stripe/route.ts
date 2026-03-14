import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/db";
import { users, purchases } from "@/db/schema";
import { eq } from "drizzle-orm";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key);
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const clerkId = session.metadata?.clerkId;

    if (clerkId && session.payment_intent) {
      // Find or create user
      let userRecord = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkId))
        .then((rows) => rows[0]);

      if (!userRecord) {
        const inserted = await db
          .insert(users)
          .values({ clerkId, email: session.customer_details?.email ?? null })
          .returning();
        userRecord = inserted[0]!;
      }

      // Record purchase
      const paymentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent.id;

      await db.insert(purchases).values({
        userId: userRecord.id,
        stripePaymentId: paymentId,
        amount: session.amount_total ?? 100,
        status: "completed",
      });
    }
  }

  return NextResponse.json({ received: true });
}
