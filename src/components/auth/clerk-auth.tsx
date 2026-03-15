"use client";

import { useAuth, UserButton, SignInButton } from "@clerk/nextjs";

export function ClerkAuth() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <UserButton />;
  }

  return (
    <SignInButton mode="modal">
      <button className="rounded-xl bg-primary px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-[0_0_15px_rgba(255,107,53,0.4)]">
        Sign in
      </button>
    </SignInButton>
  );
}
