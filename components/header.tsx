"use client";

import React from "react";
import { Search, Bell, Calendar, Menu } from "lucide-react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onOpenMobileMenu?: () => void;
}

export default function Header({
  title = "Dashboard Overview",
  subtitle,
  onOpenMobileMenu,
}: HeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-6 px-1">
      {/* Title */}
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
          <h1 className="text-2xl lg:text-[26px] font-bold text-[#0c3e66] tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 self-end sm:self-auto">
        {/* Search Bar */}
        <div className="relative w-64 md:w-72">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search products, invoices..."
            className="w-full rounded-full border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs md:text-sm text-slate-700 placeholder-slate-400 shadow-2xs focus:border-sky-500 focus:outline-hidden focus:ring-1 focus:ring-sky-500 transition-all"
          />
        </div>

        {/* Notifications */}
        <button
          type="button"
          className="relative rounded-full p-2.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        {/* Calendar / Date */}
        <button
          type="button"
          className="rounded-full p-2.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          aria-label="Calendar"
        >
          <Calendar className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
