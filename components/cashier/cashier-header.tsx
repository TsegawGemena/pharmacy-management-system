"use client";

import React from "react";
import { Menu, Search } from "lucide-react";

interface CashierHeaderProps {
  title: string;
  subtitle?: string;
  searchPlaceholder?: string;
  onOpenMobileMenu?: () => void;
}

export default function CashierHeader({
  title,
  subtitle,
  searchPlaceholder,
  onOpenMobileMenu,
}: CashierHeaderProps) {
  return (
    <div className="pt-6 pb-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {onOpenMobileMenu && (
            <button
              type="button"
              onClick={onOpenMobileMenu}
              className="lg:hidden mt-0.5 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>
          )}
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {searchPlaceholder && (
        <div className="relative mt-4 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            readOnly
            placeholder={searchPlaceholder}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-9 pr-3 text-xs font-medium text-slate-400"
          />
        </div>
      )}
    </div>
  );
}
