"use client";

import { useState } from "react";

interface MobileSheetProps {
  children: React.ReactNode;
}

export function MobileSheet({ children }: MobileSheetProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-20 rounded-t-2xl bg-white shadow-2xl transition-transform duration-300 md:hidden ${
        isExpanded ? "h-[70vh]" : "h-[180px]"
      }`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-center py-2"
        aria-label={isExpanded ? "Collapse panel" : "Expand panel"}
      >
        <div className="h-1 w-10 rounded-full bg-border" />
      </button>
      <div className="h-[calc(100%-24px)] overflow-y-auto">{children}</div>
    </div>
  );
}
