"use client";

import { Legend } from "./legend";

export function MapControls() {
  return (
    <div className="absolute bottom-4 left-4 z-10">
      <Legend />
    </div>
  );
}
