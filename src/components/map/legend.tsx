"use client";

import { useStations } from "@/hooks/use-stations";
import { useFuelFilter } from "@/hooks/use-fuel-filter";
import { computeThresholds } from "./station-source";

const COLORS = ["#16a34a", "#65a30d", "#eab308", "#f97316", "#dc2626"];
const NO_DATA_COLOR = "#94a3b8";

function formatPrice(p: number) {
  return `${p.toFixed(1)}p`;
}

export function Legend() {
  const { stations } = useStations();
  const { fuel } = useFuelFilter();

  const features = stations?.features ?? [];
  const t = computeThresholds(features, fuel);

  const items = [
    { color: COLORS[0]!, label: `< ${formatPrice(t.p20)}` },
    { color: COLORS[1]!, label: `${formatPrice(t.p20)}–${formatPrice(t.p40)}` },
    { color: COLORS[2]!, label: `${formatPrice(t.p40)}–${formatPrice(t.p60)}` },
    { color: COLORS[3]!, label: `${formatPrice(t.p60)}–${formatPrice(t.p80)}` },
    { color: COLORS[4]!, label: `> ${formatPrice(t.p80)}` },
    { color: NO_DATA_COLOR, label: "No data" },
  ];

  return (
    <div className="rounded-lg bg-white/95 p-3 shadow-lg backdrop-blur-sm">
      <h4 className="mb-2 text-xs font-semibold text-foreground">Price per litre</h4>
      <div className="space-y-1">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
