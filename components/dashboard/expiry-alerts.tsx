"use client";

import React from "react";
import { TriangleAlert } from "lucide-react";

export default function ExpiryAlerts() {
  const expiryItems = [
    {
      product: "Paracetamol 500mg",
      batch: "PCM-2031",
      date: "Aug 20, 2026",
      daysLeft: 11,
      isCritical: true,
    },
    {
      product: "Amoxicillin 500mg",
      batch: "AMX-2401",
      date: "Sep 02, 2026",
      daysLeft: 24,
      isCritical: false,
      isWarning: true,
    },
    {
      product: "Azithromycin 500mg",
      batch: "AZM-1022",
      date: "Sep 10, 2026",
      daysLeft: 32,
      isCritical: false,
      isWarning: true,
    },
    {
      product: "Omeprazole 20mg",
      batch: "OMP-8821",
      date: "Sep 15, 2026",
      daysLeft: 37,
      isCritical: false,
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-amber-200/80 shadow-2xs overflow-hidden flex flex-col justify-between">
      {/* Amber Alert Header Box */}
      <div className="bg-amber-50/90 border-b border-amber-200/70 p-4">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-base">
          <TriangleAlert className="h-5 w-5 text-amber-600 shrink-0" />
          <span>Expiry Alerts</span>
        </div>
        <p className="text-xs text-amber-800/90 mt-1 font-medium">
          7 products expiring soon, 3 within 30 days,{" "}
          <span className="font-bold text-rose-600">1 critical.</span>
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="py-2.5 px-4">Product</th>
              <th className="py-2.5 px-4">Batch</th>
              <th className="py-2.5 px-4">Expiry</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {expiryItems.map((item, idx) => (
              <tr
                key={idx}
                className="hover:bg-slate-50/70 transition-colors"
              >
                <td className="py-2.5 px-4 font-semibold text-slate-800">
                  {item.product}
                </td>
                <td className="py-2.5 px-4 font-mono text-slate-500 text-[11.5px]">
                  {item.batch}
                </td>
                <td className="py-2.5 px-4 whitespace-nowrap">
                  <span className="text-slate-600">{item.date} </span>
                  <span
                    className={`font-semibold text-[11px] ${
                      item.isCritical
                        ? "text-rose-600"
                        : item.isWarning
                        ? "text-amber-600"
                        : "text-slate-500"
                    }`}
                  >
                    ({item.daysLeft} days remaining)
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
