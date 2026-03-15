"use client";

import { useStations } from "@/hooks/use-stations";
import { useFuelFilter } from "@/hooks/use-fuel-filter";
import { computeThresholds } from "./station-source";

const COLORS = ["#00FF88", "#00D4FF", "#FFD600", "#FF8C00", "#FF3355"];
const NO_DATA_COLOR = "#3A4055";

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
    <div className="glass-panel rounded-xl p-3 shadow-lg" style={{ boxShadow: '0 0 20px rgba(255,107,53,0.1), 0 8px 32px rgba(0,0,0,0.3)' }}>
      <h4 className="mb-2 font-heading text-xs font-semibold uppercase tracking-wide text-foreground">Price per litre</h4>
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
