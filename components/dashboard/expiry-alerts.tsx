"use client";

import React from "react";
import { TriangleAlert, Loader2 } from "lucide-react";
import { getExpiringInventory } from "@/lib/api";
import { useApi } from "@/lib/hooks/use-api";
import type { InventoryItem } from "@/lib/types";

interface ExpiryRow {
  product: string;
  batch: string;
  date: string;
  daysLeft: number;
  isCritical: boolean;
  isWarning: boolean;
}

function daysUntil(dateStr: string): number {
  const expiry = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function mapExpiryItem(item: InventoryItem): ExpiryRow {
  const daysLeft = daysUntil(item.expiryDate);
  return {
    product: item.name,
    batch: item.batchNo,
    date: formatDate(item.expiryDate),
    daysLeft,
    isCritical: daysLeft <= 30 || item.isExpiringSoon === true,
    isWarning: daysLeft > 30 && daysLeft <= 60,
  };
}

export default function ExpiryAlerts() {
  const { data, loading, error } = useApi(getExpiringInventory);

  const expiryItems = (data ?? []).map(mapExpiryItem);
  const criticalCount = expiryItems.filter((item) => item.isCritical).length;
  const within30Days = expiryItems.filter((item) => item.daysLeft <= 30).length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-amber-200/80 dark:border-amber-900/50 shadow-2xs overflow-hidden transition-colors flex flex-col justify-between">
      <div className="bg-amber-50/90 dark:bg-amber-950/40 border-b border-amber-200/70 dark:border-amber-900/40 p-4">
        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold text-base">
          <TriangleAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>Expiry Alerts</span>
        </div>
        <p className="text-xs text-amber-800/90 dark:text-amber-400/90 mt-1 font-medium">
          {loading ? (
            "Loading expiry alerts..."
          ) : error ? (
            error
          ) : expiryItems.length === 0 ? (
            "No products expiring soon."
          ) : (
            <>
              {expiryItems.length} product{expiryItems.length !== 1 ? "s" : ""} expiring soon
              {within30Days > 0 && `, ${within30Days} within 30 days`}
              {criticalCount > 0 && (
                <>
                  ,{" "}
                  <span className="font-bold text-rose-600 dark:text-rose-400">
                    {criticalCount} critical.
                  </span>
                </>
              )}
            </>
          )}
        </p>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="py-2.5 px-4">Product</th>
              <th className="py-2.5 px-4">Batch</th>
              <th className="py-2.5 px-4">Expiry</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {loading ? (
              <tr>
                <td colSpan={3} className="py-10 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
                    <Loader2 className="h-5 w-5 animate-spin text-sky-600" />
                    <span className="text-xs font-medium">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : expiryItems.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-10 text-center text-slate-400 dark:text-slate-500">
                  No expiry alerts at this time.
                </td>
              </tr>
            ) : (
              expiryItems.map((item, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-2.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    {item.product}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-slate-500 dark:text-slate-400 text-[11.5px]">
                    {item.batch}
                  </td>
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    <span className="text-slate-600 dark:text-slate-300">{item.date} </span>
                    <span
                      className={`font-semibold text-[11px] ${
                        item.isCritical
                          ? "text-rose-600 dark:text-rose-400"
                          : item.isWarning
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      ({item.daysLeft} days remaining)
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
