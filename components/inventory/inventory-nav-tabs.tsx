"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, PackagePlus, AlertTriangle, RefreshCw } from "lucide-react";

export default function InventoryNavTabs() {
  const pathname = usePathname();

  const tabs = [
    {
      name: "Inventory Stock",
      href: "/inventory",
      icon: Boxes,
      exact: true,
    },
    {
      name: "Low Stock Alerts",
      href: "/inventory/alerts",
      icon: AlertTriangle,
      exact: false,
    },
    {
      name: "Stock Adjustments",
      href: "/inventory/adjustments",
      icon: RefreshCw,
      exact: false,
    },
  ];

  const isTabActive = (tab: (typeof tabs)[0]) => {
    if (tab.exact) {
      return pathname === tab.href;
    }
    return pathname?.startsWith(tab.href);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3 mb-6">
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {tabs.map((tab) => {
          const active = isTabActive(tab);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-[13px] font-semibold transition-all duration-150 ${
                active
                  ? "bg-[#0284c7] text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800"
              }`}
            >
              <Icon
                className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                  active ? "text-white" : "text-slate-500 dark:text-slate-400"
                }`}
              />
              <span>{tab.name}</span>
            </Link>
          );
        })}
      </div>

      <Link
        href="/products?restock=1"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#006699] dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/50 border border-sky-200 dark:border-sky-800 rounded-lg transition-colors"
      >
        <PackagePlus className="h-3.5 w-3.5" />
        <span>Restock</span>
      </Link>
    </div>
  );
}
