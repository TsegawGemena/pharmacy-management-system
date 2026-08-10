"use client";

import React, { useState } from "react";

type TimeRange = "Today" | "Week" | "Month";

export default function SalesOverview() {
  const [range, setRange] = useState<TimeRange>("Today");
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    label: string;
    value: string;
  } | null>(null);

  // Data sets for interactive toggle
  const dataMap = {
    Today: {
      labels: ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"],
      points: [
        { label: "08:00", val: 3200, formatted: "3,200 ETB" },
        { label: "10:00", val: 14800, formatted: "14,800 ETB" },
        { label: "12:00", val: 12400, formatted: "12,400 ETB" },
        { label: "14:00", val: 16500, formatted: "16,500 ETB" },
        { label: "16:00", val: 18200, formatted: "18,200 ETB" },
        { label: "18:00", val: 24850, formatted: "24,850 ETB" },
      ],
      // Precise SVG spline points for viewBox 0 0 600 200
      svgPath:
        "M 20,155 C 60,150 95,115 140,110 C 180,105 210,132 260,128 C 300,125 330,100 370,100 C 420,100 460,85 520,40 L 580,20",
      svgArea:
        "M 20,155 C 60,150 95,115 140,110 C 180,105 210,132 260,128 C 300,125 330,100 370,100 C 420,100 460,85 520,40 L 580,20 L 580,190 L 20,190 Z",
      dots: [
        { cx: 140, cy: 110, label: "10:00", val: "14,800 ETB" },
        { cx: 370, cy: 100, label: "14:00", val: "16,500 ETB" },
        { cx: 580, cy: 20, label: "18:00", val: "24,850 ETB" },
      ],
    },
    Week: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      points: [
        { label: "Mon", val: 18500, formatted: "18,500 ETB" },
        { label: "Tue", val: 21200, formatted: "21,200 ETB" },
        { label: "Wed", val: 19800, formatted: "19,800 ETB" },
        { label: "Thu", val: 23400, formatted: "23,400 ETB" },
        { label: "Fri", val: 27900, formatted: "27,900 ETB" },
        { label: "Sat", val: 24850, formatted: "24,850 ETB" },
      ],
      svgPath:
        "M 20,130 C 70,110 110,95 140,90 C 190,85 220,110 260,105 C 310,98 340,70 370,65 C 430,55 470,30 520,25 L 580,45",
      svgArea:
        "M 20,130 C 70,110 110,95 140,90 C 190,85 220,110 260,105 C 310,98 340,70 370,65 C 430,55 470,30 520,25 L 580,45 L 580,190 L 20,190 Z",
      dots: [
        { cx: 140, cy: 90, label: "Tue", val: "21,200 ETB" },
        { cx: 370, cy: 65, label: "Thu", val: "23,400 ETB" },
        { cx: 580, cy: 45, label: "Sat", val: "24,850 ETB" },
      ],
    },
    Month: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      points: [
        { label: "Week 1", val: 110000, formatted: "110,000 ETB" },
        { label: "Week 2", val: 142000, formatted: "142,000 ETB" },
        { label: "Week 3", val: 135000, formatted: "135,000 ETB" },
        { label: "Week 4", val: 168000, formatted: "168,000 ETB" },
      ],
      svgPath: "M 20,140 C 120,130 180,80 260,75 C 340,70 420,90 480,50 L 580,30",
      svgArea:
        "M 20,140 C 120,130 180,80 260,75 C 340,70 420,90 480,50 L 580,30 L 580,190 L 20,190 Z",
      dots: [
        { cx: 260, cy: 75, label: "Week 2", val: "142,000 ETB" },
        { cx: 480, cy: 50, label: "Week 3", val: "135,000 ETB" },
        { cx: 580, cy: 30, label: "Week 4", val: "168,000 ETB" },
      ],
    },
  };

  const current = dataMap[range];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs transition-colors flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base lg:text-[17px] font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Sales Overview
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Revenue trends in ETB</p>
        </div>

        {/* Timeframe Pill Switcher */}
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

      {/* Chart Visualization */}
      <div className="relative w-full pt-2">
        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-full mb-2 bg-slate-900 dark:bg-slate-800 text-white text-xs py-1 px-2.5 rounded shadow-lg flex flex-col items-center border border-slate-700"
            style={{
              left: `${(hoveredPoint.x / 600) * 100}%`,
              top: `${(hoveredPoint.y / 200) * 100}%`,
            }}
          >
            <span className="font-bold text-sky-300">
              {hoveredPoint.value}
            </span>
            <span className="text-[10px] text-slate-400">
              {hoveredPoint.label}
            </span>
            <div className="w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45 -mb-1 mt-0.5" />
          </div>
        )}

        <svg
          viewBox="0 0 600 200"
          className="w-full h-44 sm:h-52 overflow-visible"
        >
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
              <stop offset="80%" stopColor="#0284c7" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
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

          {/* Bottom baseline */}
          <line
            x1="20"
            y1="190"
            x2="580"
            y2="190"
            className="stroke-slate-300 dark:stroke-slate-700"
            strokeWidth="1"
          />

          {/* Gradient area fill */}
          <path
            d={current.svgArea}
            fill="url(#salesGradient)"
            className="transition-all duration-300 ease-in-out"
          />

          {/* Spline curve stroke */}
          <path
            d={current.svgPath}
            fill="none"
            stroke="#0284c7"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300 ease-in-out"
          />

          {/* Key point indicator dots */}
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
              {/* Outer halo */}
              <circle
                cx={dot.cx}
                cy={dot.cy}
                r="6"
                className="fill-white dark:fill-slate-900 stroke-[#0284c7] transition-transform hover:scale-125"
                strokeWidth="2"
              />
              {/* Inner dot */}
              <circle cx={dot.cx} cy={dot.cy} r="2.5" fill="#0284c7" />
            </g>
          ))}
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between px-2 text-[11px] text-slate-400 dark:text-slate-500 font-medium pt-1">
          {current.labels.map((lbl, idx) => (
            <span key={idx}>{lbl}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
