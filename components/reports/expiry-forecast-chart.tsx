"use client";

import React, { useState } from "react";
import { MoreVertical } from "lucide-react";

export default function ExpiryForecastChart() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const months = [
    { month: "Nov", value: 4900, heightPct: 70 },
    { month: "Dec", value: 6300, heightPct: 90 },
    { month: "Jan", value: 3400, heightPct: 48 },
    { month: "Feb", value: 1800, heightPct: 26 },
    { month: "Mar", value: 4500, heightPct: 64 },
    { month: "Apr", value: 2400, heightPct: 34 },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-800 tracking-tight">
          6-Month Expiry Forecast (Value)
        </h3>
        <button className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-50">
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative flex items-end justify-between h-64 pt-6 pb-2 px-2">
        {/* Y-Axis Grid Lines & Labels */}
        <div className="absolute inset-x-0 inset-y-6 pointer-events-none flex flex-col justify-between text-[10px] font-mono text-slate-400">
          {[7000, 6000, 5000, 4000, 3000, 2000, 1000, 0].map((val) => (
            <div key={val} className="flex items-center gap-2">
              <span className="w-9 text-right">${val}</span>
              <div className="flex-1 border-b border-slate-100" />
            </div>
          ))}
        </div>

        {/* Bars Container */}
        <div className="relative z-10 w-full pl-12 pr-4 flex items-end justify-around h-full">
          {months.map((item, idx) => (
            <div
              key={item.month}
              className="flex flex-col items-center gap-2 h-full justify-end group cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Tooltip on hover */}
              {hoveredIdx === idx && (
                <div className="absolute -top-1 bg-slate-900 text-white text-[11px] font-mono py-1 px-2 rounded shadow-md pointer-events-none transition-all">
                  ${item.value.toLocaleString()}
                </div>
              )}

              {/* Bar */}
              <div
                className="w-10 sm:w-12 bg-[#0284c7] hover:bg-[#0369a1] rounded-t-md transition-all duration-300 shadow-2xs"
                style={{ height: `${item.heightPct}%` }}
              />

              {/* Month label */}
              <span className="text-xs font-medium text-slate-600">
                {item.month}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
