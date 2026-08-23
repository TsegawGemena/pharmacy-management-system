"use client";

import React, { useMemo, useState } from "react";
import { Loader2, MoreVertical } from "lucide-react";
import { unwrapData } from "@/lib/api/client";

interface MonthBar {
  month: string;
  value: number;
  heightPct: number;
}

function parseForecastData(raw: unknown): MonthBar[] {
  const payload = unwrapData<Record<string, unknown>>(raw);
  const forecast = (payload.forecast ?? payload.months ?? payload.series) as
    | Record<string, unknown>[]
    | undefined;

  if (!Array.isArray(forecast) || forecast.length === 0) {
    return [];
  }

  const maxValue = Math.max(
    ...forecast.map((item) => Number(item.value ?? item.amount ?? 0)),
    1
  );

  return forecast.slice(0, 6).map((item, index) => {
    const value = Number(item.value ?? item.amount ?? 0);
    return {
      month: String(item.month ?? item.label ?? `M${index + 1}`),
      value,
      heightPct: Math.max(10, Math.round((value / maxValue) * 90)),
    };
  });
}

interface ExpiryForecastChartProps {
  data?: unknown;
  loading?: boolean;
}

export default function ExpiryForecastChart({ data, loading }: ExpiryForecastChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const months = useMemo(() => parseForecastData(data ?? {}), [data]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs space-y-4 transition-colors relative">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 dark:bg-slate-900/70 rounded-xl">
          <Loader2 className="h-6 w-6 animate-spin text-sky-600" />
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          6-Month Expiry Forecast (Value)
        </h3>
        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800">
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      {months.length === 0 && !loading ? (
        <div className="flex items-center justify-center h-56 text-sm text-slate-400 dark:text-slate-500">
          No forecast data available yet.
        </div>
      ) : (
        <div className="relative h-56 flex items-end justify-between gap-3 px-2 pt-6">
          {months.map((m, idx) => (
            <div
              key={m.month}
              className="flex-1 flex flex-col items-center gap-2 group cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {hoveredIdx === idx && (
                <div className="absolute -top-1 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded shadow-xs">
                  {m.value.toLocaleString()} ETB
                </div>
              )}
              <div
                className="w-full max-w-[48px] rounded-t-md bg-gradient-to-t from-sky-600 to-sky-400 dark:from-sky-500 dark:to-sky-300 transition-all duration-300 group-hover:opacity-90"
                style={{ height: `${m.heightPct}%` }}
              />
              <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400">
                {m.month}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
