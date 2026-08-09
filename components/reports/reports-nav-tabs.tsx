"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, AlertOctagon, TrendingUp, Calendar } from "lucide-react";

export default function ReportsNavTabs() {
  const pathname = usePathname();

  const tabs = [
    {
      name: "Reports & Analytics",
      href: "/reports",
      icon: BarChart3,
      exact: true,
    },
    {
      name: "Expiry Analytics",
      href: "/reports/expiry",
      icon: AlertOctagon,
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
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 mb-6">
      <div className="flex items-center gap-2">
        {tabs.map((tab) => {
          const active = isTabActive(tab);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 ${
                active
                  ? "bg-[#0284c7] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? "text-white" : "text-slate-500"}`} />
              <span>{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
