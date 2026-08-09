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
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between">
      {/* Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
          <Boxes className="h-5 w-5 text-sky-600 shrink-0" />
          <span>Low Stock Alerts</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Items falling below their designated reorder levels.
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="py-2.5 px-4">Product</th>
              <th className="py-2.5 px-4">Stock</th>
              <th className="py-2.5 px-4">Reorder Level</th>
              <th className="py-2.5 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {stockItems.map((item, idx) => (
              <tr
                key={idx}
                className="hover:bg-slate-50/70 transition-colors"
              >
                <td className="py-2.5 px-4 font-semibold text-slate-800">
                  {item.product}
                </td>
                <td
                  className={`py-2.5 px-4 font-bold font-mono ${
                    item.isCritical ? "text-rose-600" : "text-amber-600"
                  }`}
                >
                  {item.stock}
                </td>
                <td className="py-2.5 px-4 font-mono text-slate-500">
                  {item.reorder}
                </td>
                <td className="py-2.5 px-4 text-center">
                  <span
                    className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      item.isCritical
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
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
