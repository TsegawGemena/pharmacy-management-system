"use client";

import React, { useMemo } from "react";
import { Loader2, SlidersHorizontal } from "lucide-react";
import { unwrapData } from "@/lib/api/client";

const COLORS = ["#0284c7", "#06b6d4", "#38bdf8", "#f59e0b", "#94a3b8"];

interface CategoryLegend {
  name: string;
  color: string;
  percentage: number;
}

function parseRiskCategories(raw: unknown): CategoryLegend[] {
  const payload = unwrapData<Record<string, unknown>>(raw);
  const items = (payload.riskByCategory ?? payload.byCategory ?? payload.categories) as
    | Record<string, unknown>[]
    | undefined;

  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  return items.slice(0, 5).map((item, index) => ({
    name: String(item.name ?? item.category ?? `Category ${index + 1}`),
    color: String(item.color ?? COLORS[index % COLORS.length]),
    percentage: Number(item.percentage ?? item.percent ?? 0) || 10,
  }));
}

function buildDashArray(percentage: number, circumference = 238.76) {
  const segment = (percentage / 100) * circumference;
  return `${segment} ${circumference - segment}`;
}

interface ExpiryCategoryDonutProps {
  data?: unknown;
  loading?: boolean;
}

export default function ExpiryCategoryDonut({ data, loading }: ExpiryCategoryDonutProps) {
  const categories = useMemo(() => parseRiskCategories(data ?? {}), [data]);
  let offset = 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs space-y-4 flex flex-col justify-between transition-colors relative">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 dark:bg-slate-900/70 rounded-xl">
          <Loader2 className="h-6 w-6 animate-spin text-sky-600" />
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          Risk by Category
        </h3>
        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800">
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </div>

      {categories.length === 0 && !loading ? (
        <div className="flex items-center justify-center py-12 text-sm text-slate-400 dark:text-slate-500">
          No category risk data available yet.
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-around gap-6 my-auto py-2">
          <div className="relative flex items-center justify-center">
            <svg className="w-40 h-40 -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                strokeWidth="13"
                className="stroke-slate-100 dark:stroke-slate-800"
              />

              {categories.map((cat) => {
                const dash = buildDashArray(cat.percentage);
                const currentOffset = -offset;
                offset += (cat.percentage / 100) * 238.76;
                return (
                  <circle
                    key={cat.name}
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke={cat.color}
                    strokeWidth="13"
                    strokeDasharray={dash}
                    strokeDashoffset={currentOffset}
                  />
                );
              })}
            </svg>
          </div>

          <div className="space-y-2 text-xs">
            {categories.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2.5">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
