"use client";

import { useStations } from "@/hooks/use-stations";
import { useFuelFilter } from "@/hooks/use-fuel-filter";
import { computeThresholds } from "./station-source";

const COLORS = ["#00FF88", "#00D4FF", "#FFD600", "#FF8C00", "#FF3355"];
const NO_DATA_COLOR = "#3A4055";
const HEATMAP_GRADIENT =
  "linear-gradient(to right, #0044FF, #00D4FF, #00FF88, #FFD600, #FF8C00, #FF3355)";

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
    <div className="glass-panel rounded-lg p-3 shadow-lg" style={{ boxShadow: '0 0 20px rgba(255,136,0,0.1), 0 8px 32px rgba(0,0,0,0.3)' }}>
      <h4 className="racing-heading mb-2 text-xs text-foreground">FUEL PRICES</h4>
      {/* Heatmap gradient bar */}
      <div className="mb-2">
        <div
          className="h-2.5 w-full rounded-full"
          style={{ background: HEATMAP_GRADIENT }}
        />
        <div className="mt-0.5 flex justify-between text-[10px] text-muted-foreground">
          <span>Cheap</span>
          <span>Expensive</span>
        </div>
      </div>
      {/* Point color legend */}
      <div className="space-y-1">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="font-heading text-xs text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
