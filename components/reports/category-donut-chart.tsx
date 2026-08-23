"use client";

import React, { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { unwrapData } from "@/lib/api/client";

const COLORS = ["#0284c7", "#0d9488", "#f59e0b", "#6366f1", "#ec4899"];

interface CategorySlice {
  name: string;
  percentage: number;
  value: string;
  color: string;
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
  return String(Math.round(value));
}

function parseCategoryData(raw: unknown): { categories: CategorySlice[]; totalLabel: string } {
  const payload = unwrapData<Record<string, unknown>>(raw);
  const items = (payload.categories ?? payload.byCategory ?? payload.items) as
    | Record<string, unknown>[]
    | undefined;

  if (!Array.isArray(items) || items.length === 0) {
    return { categories: [], totalLabel: "0" };
  }

  const total = items.reduce(
    (sum, item) => sum + Number(item.value ?? item.amount ?? item.total ?? 0),
    0
  );

  const categories = items.slice(0, 5).map((item, index) => {
    const value = Number(item.value ?? item.amount ?? item.total ?? 0);
    const percentage = Number(
      item.percentage ?? item.percent ?? (total > 0 ? (value / total) * 100 : 0)
    );
    return {
      name: String(item.name ?? item.category ?? `Category ${index + 1}`),
      percentage: Math.round(percentage),
      value: String(item.formattedValue ?? formatCompact(value)),
      color: String(item.color ?? COLORS[index % COLORS.length]),
    };
  });

  return {
    categories,
    totalLabel: formatCompact(total),
  };
}

function buildDashArray(percentage: number, circumference = 238.76) {
  const segment = (percentage / 100) * circumference;
  return `${segment} ${circumference - segment}`;
}

interface CategoryDonutChartProps {
  data?: unknown;
  loading?: boolean;
}

export default function CategoryDonutChart({ data, loading }: CategoryDonutChartProps) {
  const { categories, totalLabel } = useMemo(
    () => parseCategoryData(data ?? {}),
    [data]
  );
  let offset = 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs space-y-4 flex flex-col justify-between transition-colors relative">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 dark:bg-slate-900/70 rounded-xl">
          <Loader2 className="h-6 w-6 animate-spin text-sky-600" />
        </div>
      )}

      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
        Stock Value by Category
      </h3>

      {categories.length === 0 && !loading ? (
        <div className="flex items-center justify-center py-16 text-sm text-slate-400 dark:text-slate-500">
          No category data available yet.
        </div>
      ) : (
        <>
          <div className="relative flex items-center justify-center my-2">
            <svg className="w-48 h-48 -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                strokeWidth="12"
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
                    strokeWidth="12"
                    strokeDasharray={dash}
                    strokeDashoffset={currentOffset}
                    className="transition-all duration-500 hover:opacity-85"
                  />
                );
              })}
            </svg>

            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-mono tracking-tight">
                {totalLabel}
              </span>
              <span className="text-[10.5px] font-medium text-slate-400 dark:text-slate-500">
                Total Value (ETB)
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            {categories.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {cat.name} ({cat.percentage}%)
                  </span>
                </div>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                  {cat.value}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
