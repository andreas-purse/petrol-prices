"use client";

import { formatTimeAgo, getHoursAgo } from "@/lib/format-time-ago";

interface FreshnessBadgeProps {
  updatedAt: string;
}

export function FreshnessBadge({ updatedAt }: FreshnessBadgeProps) {
  const hoursAgo = getHoursAgo(updatedAt);

  let colorClass: string;

  if (hoursAgo < 12) {
    colorClass = "bg-cheap";
  } else if (hoursAgo < 48) {
    colorClass = "bg-mid";
  } else {
    colorClass = "bg-expensive";
  }

  return (
    <span
      className="inline-flex items-center gap-1 text-xs text-muted-foreground"
      title={`Last updated ${formatTimeAgo(updatedAt)}`}
    >
      <span className={`inline-block h-2 w-2 rounded-full ${colorClass}`} />
      {formatTimeAgo(updatedAt)}
    </span>
  );
}

export function CmaBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-medium text-secondary"
      title="Official data from CMA-mandated retailer feeds"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-3 w-3"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
      CMA Verified
    </span>
  );
}
