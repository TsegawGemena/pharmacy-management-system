"use client";

import React, { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { unwrapData } from "@/lib/api/client";

interface ChartPoint {
  week: string;
  revenue: number;
  profit: number;
  revY: number;
  profY: number;
}

const EMPTY_CHART: ChartPoint[] = [];

const CHART_POINTS = [
  { x: 30, idx: 0 },
  { x: 175, idx: 1 },
  { x: 330, idx: 2 },
  { x: 465, idx: 3 },
];

function parseRevenueProfitData(raw: unknown): ChartPoint[] {
  const payload = unwrapData<Record<string, unknown>>(raw);
  const series = (payload.series ?? payload.points ?? payload.weeks) as
    | Record<string, unknown>[]
    | undefined;

  if (!Array.isArray(series) || series.length === 0) {
    return EMPTY_CHART;
  }

  const maxRevenue = Math.max(
    ...series.map((item) => Number(item.revenue ?? item.total ?? 0)),
    1
  );

  return series.slice(0, 4).map((item, index) => {
    const revenue = Number(item.revenue ?? item.total ?? 0);
    const profit = Number(item.profit ?? item.netProfit ?? revenue * 0.25);
    const revY = 270 - (revenue / maxRevenue) * 215;
    const profY = 270 - (profit / maxRevenue) * 215;
    return {
      week: String(item.label ?? item.week ?? `Week ${index + 1}`),
      revenue,
      profit,
      revY: Number.isFinite(revY) ? revY : 220,
      profY: Number.isFinite(profY) ? profY : 260,
    };
  });
}

interface RevenueProfitChartProps {
  data?: unknown;
  loading?: boolean;
}

export default function RevenueProfitChart({ data, loading }: RevenueProfitChartProps) {
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);
  const chartData = useMemo(() => parseRevenueProfitData(data ?? {}), [data]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs space-y-4 transition-colors relative">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 dark:bg-slate-900/70 rounded-xl">
          <Loader2 className="h-6 w-6 animate-spin text-sky-600" />
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          Revenue vs. Profit
        </h3>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-[#006699] dark:text-sky-400">
            <span className="h-2.5 w-2.5 rounded-full bg-[#006699] dark:bg-sky-400" />
            <span>Revenue</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#008080] dark:text-teal-400">
            <span className="h-2.5 w-2.5 rounded-full bg-[#008080] dark:bg-teal-400" />
            <span>Profit</span>
          </div>
        </div>
      </div>

      {chartData.length === 0 && !loading ? (
        <div className="flex items-center justify-center h-64 sm:h-72 text-sm text-slate-400 dark:text-slate-500">
          No revenue data available yet.
        </div>
      ) : (
        <>
          <div className="relative w-full h-64 sm:h-72">
            <svg
              viewBox="0 0 500 300"
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              <line x1="0" y1="60" x2="500" y2="60" className="stroke-slate-100 dark:stroke-slate-800/80" strokeWidth="1" />
              <line x1="0" y1="130" x2="500" y2="130" className="stroke-slate-100 dark:stroke-slate-800/80" strokeWidth="1" />
              <line x1="0" y1="200" x2="500" y2="200" className="stroke-slate-100 dark:stroke-slate-800/80" strokeWidth="1" />
              <line x1="0" y1="270" x2="500" y2="270" className="stroke-slate-200 dark:stroke-slate-700" strokeWidth="1.5" />

              <path
                d="M 15 220 C 120 220, 160 155, 230 155 C 290 155, 330 230, 390 120 C 440 30, 480 50, 495 85 L 495 270 L 15 270 Z"
                fill="url(#revenueGradient)"
              />

              <path
                d="M 15 220 C 120 220, 160 155, 230 155 C 290 155, 330 230, 390 120 C 440 30, 480 50, 495 85"
                fill="none"
                stroke="#006699"
                strokeWidth="4"
                strokeLinecap="round"
                className="dark:stroke-sky-400"
              />

              <path
                d="M 15 260 C 120 260, 160 235, 230 235 C 290 235, 330 245, 390 225 C 440 210, 480 215, 495 220"
                fill="none"
                stroke="#008080"
                strokeWidth="3.5"
                strokeDasharray="6 6"
                strokeLinecap="round"
                className="dark:stroke-teal-400"
              />

              {CHART_POINTS.filter((pt) => chartData[pt.idx]).map((pt) => (
                <g key={pt.idx} className="cursor-pointer">
                  <circle
                    cx={pt.x}
                    cy={chartData[pt.idx]?.revY ?? 220}
                    r={hoveredWeek === pt.idx ? "6" : "4.5"}
                    fill="#006699"
                    strokeWidth="2"
                    className="stroke-white dark:stroke-slate-900 dark:fill-sky-400"
                    onMouseEnter={() => setHoveredWeek(pt.idx)}
                    onMouseLeave={() => setHoveredWeek(null)}
                  />
                  <circle
                    cx={pt.x}
                    cy={chartData[pt.idx]?.profY ?? 260}
                    r={hoveredWeek === pt.idx ? "5.5" : "4"}
                    fill="#008080"
                    strokeWidth="2"
                    className="stroke-white dark:stroke-slate-900 dark:fill-teal-400"
                    onMouseEnter={() => setHoveredWeek(pt.idx)}
                    onMouseLeave={() => setHoveredWeek(null)}
                  />
                </g>
              ))}
            </svg>

            {hoveredWeek !== null && chartData[hoveredWeek] && (
              <div
                className="absolute -top-3 z-10 bg-slate-900/95 dark:bg-slate-800/95 text-white p-2.5 rounded-lg shadow-xl text-xs space-y-1 backdrop-blur-xs border border-slate-700 pointer-events-none transition-all duration-150"
                style={{ left: `${(hoveredWeek + 0.5) * 23}%` }}
              >
                <div className="font-bold text-slate-200">{chartData[hoveredWeek].week}</div>
                <div className="flex items-center justify-between gap-3 text-sky-400 font-mono font-medium">
                  <span>Revenue:</span>
                  <span>{chartData[hoveredWeek].revenue.toLocaleString()} ETB</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-teal-400 font-mono font-medium">
                  <span>Profit:</span>
                  <span>{chartData[hoveredWeek].profit.toLocaleString()} ETB</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between px-3 text-xs font-mono font-medium text-slate-500 dark:text-slate-400 pt-1">
            {chartData.map((point) => (
              <span key={point.week}>{point.week}</span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
