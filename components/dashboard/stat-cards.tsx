"use client";

import React from "react";
import { TriangleAlert, Clock, Banknote, Loader2 } from "lucide-react";
import { getDashboard } from "@/lib/api";
import { useApi } from "@/lib/hooks/use-api";

function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between animate-pulse">
      <div className="flex items-start justify-between">
        <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-9 w-9 rounded-lg bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="mt-2.5 h-8 w-20 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mt-3.5 h-3 w-32 rounded bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}

function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}

export default function StatCards() {
  const { data, loading, error } = useApi(getDashboard);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/90 dark:bg-amber-950/40 p-6 text-sm text-amber-800 dark:text-amber-200">
        <Loader2 className="h-4 w-4 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  const stats = data?.stats;
  const totalProducts = stats?.totalProducts ?? 0;
  const lowStockCount = stats?.lowStockCount ?? 0;
  const expiringSoonCount = stats?.expiringSoonCount ?? 0;
  const todaySales = stats?.todaySales ?? 0;

  const cards = [
    {
      title: "Total Products",
      value: formatNumber(totalProducts),
      subtext: (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Active in inventory
        </span>
      ),
      icon: (
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100/90 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
          <svg
            className="h-5 w-5 fill-current"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 3C6.44772 3 6 3.44772 6 4V6H18V4C18 3.44772 17.5523 3 17 3H7ZM5 7C4.44772 7 4 7.44772 4 8V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8C20 7.44772 19.5523 7 19 7H5ZM11 10C11 9.44772 11.4477 9 12 9C12.5523 9 13 9.44772 13 10V13H16C16.5523 13 17 13.4477 17 14C17 14.5523 16.5523 15 16 15H13V18C13 18.5523 12.5523 19 12 19C11.4477 19 11 18.5523 11 18V15H8C7.44772 15 7 14.5523 7 14C7 13.4477 7.44772 13 8 13H11V10Z"
              fill="currentColor"
            />
          </svg>
        </div>
      ),
    },
    {
      title: "Low Stock",
      value: formatNumber(lowStockCount),
      subtext: (
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-600 dark:bg-rose-400 inline-block"></span>
            {lowStockCount > 0 ? "Needs attention" : "All stocked"}
          </span>
          {lowStockCount > 0 && (
            <span className="text-slate-500 dark:text-slate-400">require ordering</span>
          )}
        </div>
      ),
      icon: (
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100/90 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
          <TriangleAlert className="h-5 w-5" />
        </div>
      ),
    },
    {
      title: "Expiring Soon",
      value: formatNumber(expiringSoonCount),
      subtext: (
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-600 dark:bg-amber-400 inline-block"></span>
            {expiringSoonCount > 0 ? "Review batches" : "No upcoming expiry"}
          </span>
        </div>
      ),
      icon: (
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100/90 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
          <Clock className="h-5 w-5" />
        </div>
      ),
    },
    {
      title: "Today's Sales",
      value: (
        <div className="flex items-baseline gap-1.5">
          <span>{formatNumber(todaySales)}</span>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">ETB</span>
        </div>
      ),
      subtext: (
        <span className="text-xs text-slate-500 dark:text-slate-400">Today&apos;s revenue</span>
      ),
      icon: (
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100/90 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
          <Banknote className="h-5 w-5" />
        </div>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs hover:shadow-xs transition-colors flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {card.title}
            </span>
            {card.icon}
          </div>

          <div className="mt-2.5">
            <div className="text-[28px] font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-none">
              {card.value}
            </div>
          </div>

          <div className="mt-3.5 pt-1">{card.subtext}</div>
        </div>
      ))}
    </div>
  );
}
