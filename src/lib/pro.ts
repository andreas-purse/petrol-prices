import { db } from "@/db";
import { users, purchases } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function isProUser(clerkId: string): Promise<boolean> {
  const user = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  if (user.length === 0) return false;

  const purchase = await db
    .select({ id: purchases.id })
    .from(purchases)
    .where(eq(purchases.userId, user[0]!.id))
    .limit(1);

  return purchase.length > 0;
}
