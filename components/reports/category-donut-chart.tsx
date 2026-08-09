"use client";

import React from "react";

export default function CategoryDonutChart() {
  const categories = [
    { name: "Antibiotics", percentage: 45, value: "540K", color: "#0c4a6e" },
    { name: "Pain Relief", percentage: 30, value: "360K", color: "#0d9488" },
    { name: "Vitamins", percentage: 25, value: "300K", color: "#f59e0b" },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4 flex flex-col justify-between">
      <h3 className="text-base font-bold text-slate-800 tracking-tight">
        Stock Value by Category
      </h3>

      {/* Donut Chart Visual */}
      <div className="relative flex items-center justify-center my-2">
        <svg className="w-48 h-48 -rotate-90 transform" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth="12"
          />

          {/* Antibiotics (45%) -> circumference = 2 * PI * 38 = 238.76. 45% = 107.44 */}
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="transparent"
            stroke="#0c4a6e"
            strokeWidth="12"
            strokeDasharray="107.44 131.32"
            strokeDashoffset="0"
            className="transition-all duration-500 hover:opacity-85"
          />

          {/* Pain Relief (30%) -> 30% = 71.63 */}
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="transparent"
            stroke="#0d9488"
            strokeWidth="12"
            strokeDasharray="71.63 167.13"
            strokeDashoffset="-107.44"
            className="transition-all duration-500 hover:opacity-85"
          />

          {/* Vitamins (25%) -> 25% = 59.69 */}
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="transparent"
            stroke="#f59e0b"
            strokeWidth="12"
            strokeDasharray="59.69 179.07"
            strokeDashoffset="-179.07"
            className="transition-all duration-500 hover:opacity-85"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-extrabold text-slate-800 font-mono tracking-tight">
            1.2M
          </span>
          <span className="text-[10.5px] font-medium text-slate-400">
            Total Value (ETB)
          </span>
        </div>
      </div>

      {/* Category Legend with exact amounts */}
      <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
        {categories.map((cat) => (
          <div key={cat.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-slate-700 font-medium">
                {cat.name} ({cat.percentage}%)
              </span>
            </div>
            <span className="font-mono font-bold text-slate-800">
              {cat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
