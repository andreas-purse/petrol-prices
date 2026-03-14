"use client";

import { Legend } from "./legend";

export function MapControls() {
  return (
    <div className="absolute bottom-[200px] left-4 z-10 md:bottom-4">
      <Legend />
    </div>
  );
}
