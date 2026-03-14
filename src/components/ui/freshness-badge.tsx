"use client";

function getHoursAgo(isoString: string): number {
  return (Date.now() - new Date(isoString).getTime()) / (1000 * 60 * 60);
}

function formatTimeAgo(isoString: string): string {
  const hoursAgo = getHoursAgo(isoString);
  if (hoursAgo < 1) return "Just now";
  if (hoursAgo < 24) return `${Math.round(hoursAgo)}h ago`;
  const days = Math.round(hoursAgo / 24);
  return `${days}d ago`;
}

interface FreshnessBadgeProps {
  updatedAt: string;
}

export function FreshnessBadge({ updatedAt }: FreshnessBadgeProps) {
  const hoursAgo = getHoursAgo(updatedAt);

  let colorClass: string;
  let label: string;

  if (hoursAgo < 12) {
    colorClass = "bg-cheap";
    label = "Fresh";
  } else if (hoursAgo < 48) {
    colorClass = "bg-mid";
    label = "Aging";
  } else {
    colorClass = "bg-expensive";
    label = "Stale";
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
      className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
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
