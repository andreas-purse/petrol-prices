"use client";

import { AuthButtons } from "@/components/auth/auth-buttons";

function FuelIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 32 32" className="shrink-0">
      <defs>
        <linearGradient id="headerIconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6B35"/>
          <stop offset="100%" stopColor="#E040A0"/>
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="7" fill="url(#headerIconGrad)"/>
      <path d="M10 8h8v14h-8z" fill="white" rx="1"/>
      <path d="M18 12h2a2 2 0 012 2v6h-2v-5h-2" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="12" y="10" width="4" height="4" rx="0.5" fill="#FF6B35" opacity="0.6"/>
      <path d="M10 22h8" stroke="white" strokeWidth="1.5"/>
    </svg>
  );
}

export function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-white/10 bg-[#0d1220]/95 px-4 shadow-lg backdrop-blur-xl md:hidden">
      <div className="flex items-center gap-2">
        <FuelIcon />
        <h1 className="horizon-gradient-text font-heading text-lg font-bold uppercase tracking-wider">Find My Fuel</h1>
      </div>
      <AuthButtons />
    </header>
  );
}
