"use client";

import { useState, type FormEvent } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onLocate: () => void;
  isSearching: boolean;
  error: string | null;
}

export function SearchBar({ onSearch, onLocate, isSearching, error }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ENTER DESTINATION..."
          className="font-heading flex-1 rounded-lg border border-white/15 bg-white/[0.06] px-4 py-2 text-sm uppercase tracking-wide text-foreground shadow-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:shadow-[0_0_15px_rgba(255,136,0,0.25)]"
          aria-label="Search by postcode"
        />
        <button
          type="submit"
          disabled={isSearching || !query.trim()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-bold italic uppercase tracking-wide text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-[0_0_15px_rgba(255,136,0,0.4)] disabled:opacity-50"
        >
          {isSearching ? "..." : "GO"}
        </button>
        <button
          type="button"
          onClick={onLocate}
          className="rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2 text-sm shadow-sm transition-all hover:bg-white/[0.12] hover:shadow-[0_0_10px_rgba(255,136,0,0.15)]"
          title="Use my location"
          aria-label="Use my location"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          </svg>
        </button>
      </form>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
