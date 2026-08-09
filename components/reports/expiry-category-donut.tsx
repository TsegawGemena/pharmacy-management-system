"use client";

import React from "react";
import { SlidersHorizontal } from "lucide-react";

export default function ExpiryCategoryDonut() {
  const categories = [
    { name: "Antibiotics", color: "#0284c7" },
    { name: "Chronic Care", color: "#06b6d4" },
    { name: "Vitamins", color: "#38bdf8" },
    { name: "Topicals", color: "#f59e0b" },
    { name: "Other", color: "#94a3b8" },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-800 tracking-tight">
          Risk by Category
        </h3>
        <button className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-50">
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 my-auto py-2">
        {/* Donut Chart Visual */}
        <div className="relative flex items-center justify-center">
          <svg className="w-40 h-40 -rotate-90 transform" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="transparent"
              stroke="#f1f5f9"
              strokeWidth="13"
            />

            {/* Antibiotics (35%) -> circ = 238.76 -> 83.56 */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="transparent"
              stroke="#0284c7"
              strokeWidth="13"
              strokeDasharray="83.56 155.2"
              strokeDashoffset="0"
            />

            {/* Chronic Care (25%) -> 59.69 */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="transparent"
              stroke="#06b6d4"
              strokeWidth="13"
              strokeDasharray="59.69 179.07"
              strokeDashoffset="-83.56"
            />

            {/* Vitamins (20%) -> 47.75 */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="transparent"
              stroke="#38bdf8"
              strokeWidth="13"
              strokeDasharray="47.75 191.01"
              strokeDashoffset="-143.25"
            />

            {/* Topicals (12%) -> 28.65 */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="transparent"
              stroke="#f59e0b"
              strokeWidth="13"
              strokeDasharray="28.65 210.11"
              strokeDashoffset="-191.0"
            />

            {/* Other (8%) -> 19.1 */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="transparent"
              stroke="#94a3b8"
              strokeWidth="13"
              strokeDasharray="19.1 219.66"
              strokeDashoffset="-219.65"
            />
          </svg>
        </div>

        {/* Legend */}
        <div className="space-y-2 text-xs">
          {categories.map((cat) => (
            <div key={cat.name} className="flex items-center gap-2.5">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-slate-700 font-medium">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
