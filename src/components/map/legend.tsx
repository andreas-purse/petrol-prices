"use client";

const LEGEND_ITEMS = [
  { color: "#16a34a", label: "< 135p" },
  { color: "#65a30d", label: "135-145p" },
  { color: "#eab308", label: "145-150p" },
  { color: "#f97316", label: "150-155p" },
  { color: "#dc2626", label: "> 155p" },
  { color: "#94a3b8", label: "No data" },
];

export function Legend() {
  return (
    <div className="rounded-lg bg-white/95 p-3 shadow-lg backdrop-blur-sm">
      <h4 className="mb-2 text-xs font-semibold text-foreground">Price per litre</h4>
      <div className="space-y-1">
        {LEGEND_ITEMS.map((item) => (
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
