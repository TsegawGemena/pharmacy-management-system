"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Search, Bell, Calendar, Menu, HelpCircle } from "lucide-react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onOpenMobileMenu?: () => void;
}

export default function Header({
  title,
  subtitle,
  onOpenMobileMenu,
}: HeaderProps) {
  const pathname = usePathname();

  // Dynamic header title based on current route if not explicitly passed
  let displayTitle = title;
  let searchPlaceholder = "Search products, invoices...";

  if (!displayTitle) {
    if (pathname === "/") {
      displayTitle = "Dashboard Overview";
    } else if (pathname?.startsWith("/inventory")) {
      displayTitle = "Gammo Pharmacy";
      searchPlaceholder = "Search inventory, orders...";
    } else if (pathname?.startsWith("/products")) {
      displayTitle = "Products Catalog";
      searchPlaceholder = "Search medications...";
    } else if (pathname?.startsWith("/pos")) {
      displayTitle = "Point of Sale";
      searchPlaceholder = "Scan or search items...";
    } else if (pathname?.startsWith("/invoices")) {
      displayTitle = "Invoices & Billing";
      searchPlaceholder = "Search invoices...";
    } else if (pathname?.startsWith("/reports")) {
      displayTitle = "Reports & Analytics";
      searchPlaceholder = "Search metrics...";
    } else if (pathname?.startsWith("/settings")) {
      displayTitle = "System Settings";
      searchPlaceholder = "Search settings...";
    } else {
      displayTitle = "Gammo Pharmacy";
    }
  }

  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-4 sm:py-5 border-b border-slate-200/70 mb-6">
      {/* Title / Brand */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div>
          <h1 className="text-xl lg:text-[22px] font-bold text-[#0c3e66] tracking-tight">
            {displayTitle}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 self-end sm:self-auto">
        {/* Search Bar */}
        <div className="relative w-60 md:w-72 lg:w-80">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full rounded-full border border-slate-200 bg-white py-1.5 pl-9 pr-4 text-xs md:text-sm text-slate-700 placeholder-slate-400 shadow-2xs focus:border-sky-500 focus:outline-hidden focus:ring-1 focus:ring-sky-500 transition-all"
          />
        </div>

        {/* Notifications */}
        <button
          type="button"
          className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        {/* Calendar / Date */}
        <button
          type="button"
          className="rounded-full p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          aria-label="Calendar"
        >
          <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        {/* User avatar on right header */}
        <div className="relative h-8 w-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center shrink-0 text-white font-bold text-xs bg-gradient-to-tr from-sky-600 to-teal-600">
          AK
        </div>
      </div>
    </header>
  );
}
