"use client";

import React, { useState } from "react";

export default function RevenueProfitChart() {
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);

  const data = [
    { week: "Week 1", revenue: 145000, profit: 36000, revY: 220, profY: 260 },
    { week: "Week 2", revenue: 195000, profit: 54000, revY: 155, profY: 235 },
    { week: "Week 3", revenue: 170000, profit: 45000, revY: 230, profY: 245 },
    { week: "Week 4", revenue: 232500, profit: 60625, revY: 55, profY: 215 },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
      {/* Header & Legend */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-800 tracking-tight">
          Revenue vs. Profit
        </h3>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-[#006699]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#006699]" />
            <span>Revenue</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#008080]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#008080]" />
            <span>Profit</span>
          </div>
        </div>
      </div>

      {/* SVG Chart Area */}
      <div className="relative w-full h-64 sm:h-72">
        <svg
          viewBox="0 0 500 300"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Soft blue gradient for revenue area */}
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          <line x1="0" y1="60" x2="500" y2="60" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="0" y1="130" x2="500" y2="130" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="0" y1="200" x2="500" y2="200" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="0" y1="270" x2="500" y2="270" stroke="#e2e8f0" strokeWidth="1.5" />

          {/* Revenue Area Fill */}
          <path
            d="M 15 220 C 120 220, 160 155, 230 155 C 290 155, 330 230, 390 120 C 440 30, 480 50, 495 85 L 495 270 L 15 270 Z"
            fill="url(#revenueGradient)"
          />

          {/* Revenue Bold Wave Line */}
          <path
            d="M 15 220 C 120 220, 160 155, 230 155 C 290 155, 330 230, 390 120 C 440 30, 480 50, 495 85"
            fill="none"
            stroke="#006699"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Profit Dashed Wave Line */}
          <path
            d="M 15 260 C 120 260, 160 235, 230 235 C 290 235, 330 245, 390 225 C 440 210, 480 215, 495 220"
            fill="none"
            stroke="#008080"
            strokeWidth="3.5"
            strokeDasharray="6 6"
            strokeLinecap="round"
          />

          {/* Data Points */}
          {[
            { x: 30, y: 220, pY: 260, idx: 0 },
            { x: 175, y: 155, pY: 235, idx: 1 },
            { x: 330, y: 225, pY: 245, idx: 2 },
            { x: 465, y: 55, pY: 215, idx: 3 },
          ].map((pt) => (
            <g key={pt.idx} className="cursor-pointer">
              {/* Revenue dot */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredWeek === pt.idx ? "6" : "4.5"}
                fill="#006699"
                stroke="#ffffff"
                strokeWidth="2"
                onMouseEnter={() => setHoveredWeek(pt.idx)}
                onMouseLeave={() => setHoveredWeek(null)}
              />
              {/* Profit dot */}
              <circle
                cx={pt.x}
                cy={pt.pY}
                r={hoveredWeek === pt.idx ? "5.5" : "4"}
                fill="#008080"
                stroke="#ffffff"
                strokeWidth="2"
                onMouseEnter={() => setHoveredWeek(pt.idx)}
                onMouseLeave={() => setHoveredWeek(null)}
              />
            </g>
          ))}
        </svg>

        {/* Floating Tooltip when hovered */}
        {hoveredWeek !== null && (
          <div
            className="absolute -top-3 z-10 bg-slate-900/95 text-white p-2.5 rounded-lg shadow-xl text-xs space-y-1 backdrop-blur-xs border border-slate-700 pointer-events-none transition-all duration-150"
            style={{
              left: `${(hoveredWeek + 0.5) * 23}%`,
            }}
          >
            <div className="font-bold text-slate-200">
              {data[hoveredWeek].week}
            </div>
            <div className="flex items-center justify-between gap-3 text-sky-400 font-mono font-medium">
              <span>Revenue:</span>
              <span>{data[hoveredWeek].revenue.toLocaleString()} ETB</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-teal-400 font-mono font-medium">
              <span>Profit:</span>
              <span>{data[hoveredWeek].profit.toLocaleString()} ETB</span>
            </div>
          </div>
        )}
      </div>

      {/* X-Axis Labels */}
      <div className="flex items-center justify-between px-3 text-xs font-mono font-medium text-slate-500 pt-1">
        <span>Week 1</span>
        <span>Week 2</span>
        <span>Week 3</span>
        <span>Week 4</span>
      </div>
    </div>
  );
}
