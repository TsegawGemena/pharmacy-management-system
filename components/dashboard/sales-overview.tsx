"use client";

import React, { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { getSalesReport } from "@/lib/api";
import { useApi } from "@/lib/hooks/use-api";
import { InlineError } from "@/components/ui/page-state";

type TimeRange = "Today" | "Week" | "Month";

const RANGE_MAP: Record<TimeRange, "today" | "week" | "month"> = {
  Today: "today",
  Week: "week",
  Month: "month",
};

interface ChartPoint {
  label: string;
  val: number;
  formatted: string;
}

interface ChartData {
  labels: string[];
  points: ChartPoint[];
  svgPath: string;
  svgArea: string;
  dots: { cx: number; cy: number; label: string; val: string }[];
}

const EMPTY_CHART: ChartData = {
  labels: ["—"],
  points: [{ label: "—", val: 0, formatted: "0 ETB" }],
  svgPath: "M 20,160 L 580,160",
  svgArea: "M 20,160 L 580,160 L 580,190 L 20,190 Z",
  dots: [],
};

function formatEtb(value: number): string {
  return `${value.toLocaleString("en-US")} ETB`;
}

function parseSalesPoints(data: unknown): { label: string; value: number }[] {
  if (!data || typeof data !== "object") return [];

  const payload =
    "data" in (data as object) ? (data as { data: unknown }).data : data;

  if (!payload || typeof payload !== "object") return [];

  const points = (payload as { points?: unknown }).points;
  if (!Array.isArray(points)) return [];

  return points
    .map((point) => {
      if (!point || typeof point !== "object") return null;
      const record = point as Record<string, unknown>;
      const label = String(record.label ?? record.name ?? "");
      const value = Number(record.value ?? record.val ?? record.amount ?? 0);
      if (!label) return null;
      return { label, value };
    })
    .filter((point): point is { label: string; value: number } => point !== null);
}

function buildChartData(rawPoints: { label: string; value: number }[]): ChartData {
  if (rawPoints.length === 0) return EMPTY_CHART;

  const startX = 20;
  const endX = 580;
  const minY = 20;
  const maxY = 160;
  const maxVal = Math.max(...rawPoints.map((p) => p.value), 1);

  const coords = rawPoints.map((point, index) => {
    const x =
      rawPoints.length === 1
        ? (startX + endX) / 2
        : startX + (index / (rawPoints.length - 1)) * (endX - startX);
    const y = maxY - (point.value / maxVal) * (maxY - minY);
    return { x, y, label: point.label, val: point.value };
  });

  const linePath = coords
    .map((coord, index) => {
      if (index === 0) return `M ${coord.x},${coord.y}`;
      const prev = coords[index - 1];
      const cpx = (prev.x + coord.x) / 2;
      return `C ${cpx},${prev.y} ${cpx},${coord.y} ${coord.x},${coord.y}`;
    })
    .join(" ");

  const last = coords[coords.length - 1];
  const first = coords[0];
  const svgArea = `${linePath} L ${last.x},190 L ${first.x},190 Z`;

  const dotIndices =
    coords.length <= 3
      ? coords.map((_, i) => i)
      : [0, Math.floor(coords.length / 2), coords.length - 1];

  const dots = dotIndices.map((i) => ({
    cx: coords[i].x,
    cy: coords[i].y,
    label: coords[i].label,
    val: formatEtb(coords[i].val),
  }));

  return {
    labels: rawPoints.map((p) => p.label),
    points: rawPoints.map((p) => ({
      label: p.label,
      val: p.value,
      formatted: formatEtb(p.value),
    })),
    svgPath: linePath,
    svgArea,
    dots,
  };
}

export default function SalesOverview() {
  const [range, setRange] = useState<TimeRange>("Today");
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    label: string;
    value: string;
  } | null>(null);

  const apiRange = RANGE_MAP[range];
  const { data, loading, error } = useApi(() => getSalesReport(apiRange), [apiRange]);

  const current = useMemo(() => {
    const parsed = parseSalesPoints(data);
    if (parsed.length > 0) return buildChartData(parsed);
    return EMPTY_CHART;
  }, [data]);

  const hasData = parseSalesPoints(data).length > 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs transition-colors flex flex-col justify-between h-full">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base lg:text-[17px] font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Sales Overview
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Revenue trends in ETB</p>
        </div>

        <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-1 text-xs font-medium shadow-2xs">
          {(["Today", "Week", "Month"] as TimeRange[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setRange(tab)}
              type="button"
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                range === tab
                  ? "bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-400 font-semibold border border-sky-200/60 dark:border-sky-800 shadow-2xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-3">
          <InlineError message={error} />
        </div>
      )}

      {!loading && !error && !hasData && (
        <p className="mb-3 text-xs text-slate-400 dark:text-slate-500 text-center">
          No sales data available for this period.
        </p>
      )}

      <div className="relative w-full pt-2">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-slate-900/60 rounded-lg">
            <Loader2 className="h-6 w-6 animate-spin text-sky-600" />
          </div>
        )}

        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-full mb-2 bg-slate-900 dark:bg-slate-800 text-white text-xs py-1 px-2.5 rounded shadow-lg flex flex-col items-center border border-slate-700"
            style={{
              left: `${(hoveredPoint.x / 600) * 100}%`,
              top: `${(hoveredPoint.y / 200) * 100}%`,
            }}
          >
            <span className="font-bold text-sky-300">{hoveredPoint.value}</span>
            <span className="text-[10px] text-slate-400">{hoveredPoint.label}</span>
            <div className="w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45 -mb-1 mt-0.5" />
          </div>
        )}

        <svg viewBox="0 0 600 200" className="w-full h-44 sm:h-52 overflow-visible">
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
              <stop offset="80%" stopColor="#0284c7" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </linearGradient>
          </defs>

          <line
            x1="20"
            y1="40"
            x2="580"
            y2="40"
            className="stroke-slate-200 dark:stroke-slate-800"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <line
            x1="20"
            y1="100"
            x2="580"
            y2="100"
            className="stroke-slate-200 dark:stroke-slate-800"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <line
            x1="20"
            y1="160"
            x2="580"
            y2="160"
            className="stroke-slate-200 dark:stroke-slate-800"
            strokeDasharray="4 4"
            strokeWidth="1"
          />

          <line
            x1="20"
            y1="190"
            x2="580"
            y2="190"
            className="stroke-slate-300 dark:stroke-slate-700"
            strokeWidth="1"
          />

          <path
            d={current.svgArea}
            fill="url(#salesGradient)"
            className="transition-all duration-300 ease-in-out"
          />

          <path
            d={current.svgPath}
            fill="none"
            stroke="#0284c7"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300 ease-in-out"
          />

          {current.dots.map((dot, idx) => (
            <g
              key={idx}
              className="cursor-pointer"
              onMouseEnter={() =>
                setHoveredPoint({
                  x: dot.cx,
                  y: dot.cy,
                  label: dot.label,
                  value: dot.val,
                })
              }
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <circle
                cx={dot.cx}
                cy={dot.cy}
                r="6"
                className="fill-white dark:fill-slate-900 stroke-[#0284c7] transition-transform hover:scale-125"
                strokeWidth="2"
              />
              <circle cx={dot.cx} cy={dot.cy} r="2.5" fill="#0284c7" />
            </g>
          ))}
        </svg>

        <div className="flex justify-between px-2 text-[11px] text-slate-400 dark:text-slate-500 font-medium pt-1">
          {current.labels.map((lbl, idx) => (
            <span key={idx}>{lbl}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
