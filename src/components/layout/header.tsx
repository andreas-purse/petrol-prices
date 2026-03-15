"use client";

import { AuthButtons } from "@/components/auth/auth-buttons";

function CarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 32 32" className="shrink-0">
      <rect width="32" height="32" rx="7" fill="#F7DC6F"/>
      <rect x="3" y="10" width="26" height="14" rx="7" fill="#E8453C"/>
      <rect x="8" y="5" width="16" height="9" rx="5" fill="#E8453C"/>
      <ellipse cx="11" cy="15" rx="3.5" ry="4" fill="white"/>
      <circle cx="12" cy="15.5" r="2" fill="#2C1810"/>
      <circle cx="10.5" cy="13.5" r="1" fill="white"/>
      <ellipse cx="21" cy="15" rx="3.5" ry="4" fill="white"/>
      <circle cx="22" cy="15.5" r="2" fill="#2C1810"/>
      <circle cx="20.5" cy="13.5" r="1" fill="white"/>
      <path d="M11 21 Q16 24 21 21" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

export function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 shadow-sm md:hidden">
      <div className="flex items-center gap-2">
        <CarIcon />
        <h1 className="font-heading text-lg font-bold text-primary">Find My Fuel</h1>
      </div>
      <AuthButtons />
    </header>
  );
}
