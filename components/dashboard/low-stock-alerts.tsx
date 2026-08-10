"use client";

import React from "react";
import { Boxes } from "lucide-react";

export default function LowStockAlerts() {
  const stockItems = [
    {
      product: "Amoxicillin 500mg Caps",
      stock: 5,
      reorder: 15,
      status: "CRITICAL",
      isCritical: true,
    },
    {
      product: "Paracetamol 500mg",
      stock: 8,
      reorder: 20,
      status: "LOW STOCK",
      isCritical: false,
    },
    {
      product: "Ibuprofen 400mg",
      stock: 12,
      reorder: 25,
      status: "LOW STOCK",
      isCritical: false,
    },
    {
      product: "Ciprofloxacin 500mg",
      stock: 14,
      reorder: 30,
      status: "LOW STOCK",
      isCritical: false,
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors flex flex-col justify-between">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold text-base">
          <Boxes className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0" />
          <span>Low Stock Alerts</span>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Items falling below their designated reorder levels.
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="py-2.5 px-4">Product</th>
              <th className="py-2.5 px-4">Stock</th>
              <th className="py-2.5 px-4">Reorder Level</th>
              <th className="py-2.5 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {stockItems.map((item, idx) => (
              <tr
                key={idx}
                className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="py-2.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                  {item.product}
                </td>
                <td
                  className={`py-2.5 px-4 font-bold font-mono ${
                    item.isCritical ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {item.stock}
                </td>
                <td className="py-2.5 px-4 font-mono text-slate-500 dark:text-slate-400">
                  {item.reorder}
                </td>
                <td className="py-2.5 px-4 text-center">
                  <span
                    className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      item.isCritical
                        ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60"
                        : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60"
                    }`}
                  >
                    {item.status}
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
