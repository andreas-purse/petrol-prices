"use client";

import dynamic from "next/dynamic";

const ClerkAuth = dynamic(() => import("./clerk-auth").then((m) => m.ClerkAuth), {
  ssr: false,
  loading: () => null,
});

const clerkEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export function AuthButtons() {
  if (!clerkEnabled) return null;
  return <ClerkAuth />;
}
