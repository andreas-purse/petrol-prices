"use client";

import { useState, useEffect, useCallback } from "react";

export interface CalcSettings {
  regNumber: string;
  mpg: number | null;
  hourlyRate: number | null;
  tankLitres: number | null;
}

const DEFAULT_SETTINGS: CalcSettings = {
  regNumber: "",
  mpg: null,
  hourlyRate: null,
  tankLitres: null,
};

export function useCalcSettings() {
  const [settings, setSettingsState] = useState<CalcSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const saved = localStorage.getItem("driverCalc");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setSettingsState((s) => ({ ...s, ...data }));
      } catch {
        // ignore corrupt data
      }
    }
  }, []);

  const setSettings = useCallback((update: Partial<CalcSettings>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...update };
      localStorage.setItem("driverCalc", JSON.stringify(next));
      return next;
    });
  }, []);

  return { settings, setSettings };
}
