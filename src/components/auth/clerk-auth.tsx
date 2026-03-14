"use client";

import { useAuth, UserButton, SignInButton } from "@clerk/nextjs";

export function ClerkAuth() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <UserButton />;
  }

  return (
    <SignInButton mode="modal">
      <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
        Sign in
      </button>
    </SignInButton>
  );
}
