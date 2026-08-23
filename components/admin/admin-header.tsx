"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Calendar, Menu, Search, Settings } from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";
import { useAdminMobileMenu } from "@/components/admin/admin-shell-context";
import { getStoredUser } from "@/lib/api";
import type { User } from "@/lib/types";

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  greeting?: boolean;
  onOpenMobileMenu?: () => void;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatHeaderDate(date = new Date()): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminHeader({
  title,
  subtitle,
  searchPlaceholder = "Search inventory, sales...",
  greeting = false,
  onOpenMobileMenu,
}: AdminHeaderProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const openFromLayout = useAdminMobileMenu();
  const openMenu = onOpenMobileMenu ?? openFromLayout ?? undefined;

  useEffect(() => {
    setUser(getStoredUser());
  }, [pathname]);

  const firstName = useMemo(() => {
    const name = user?.name?.trim() || "Admin";
    return name.split(/\s+/)[0];
  }, [user]);

  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-4 sm:py-5 border-b border-slate-200/80 dark:border-slate-800/90 mb-6 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        {openMenu && (
          <button
            onClick={openMenu}
            className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div className="min-w-0">
          {greeting ? (
            <>
              <h1 className="text-xl lg:text-[22px] font-bold text-[#0c3e66] dark:text-sky-400 tracking-tight truncate">
                {getGreeting()}, {firstName}{" "}
                <span aria-hidden="true">👋</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {formatHeaderDate()}
              </p>
            </>
          ) : (
            <>
              <h1 className="text-xl lg:text-[22px] font-bold text-[#0c3e66] dark:text-sky-400 tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {subtitle}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2.5 self-end sm:self-auto">
        <div className="relative w-48 sm:w-56 md:w-64 lg:w-72">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-1.5 pl-9 pr-4 text-xs md:text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 shadow-2xs focus:border-sky-500 focus:outline-hidden focus:ring-1 focus:ring-sky-500 transition-all"
          />
        </div>

        <ThemeToggle />

        <button
          type="button"
          className="relative p-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
        </button>

        <Link
          href="/admin/settings"
          className="p-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
          aria-label="Settings"
        >
          <Settings className="h-4 w-4" />
        </Link>

        <Link
          href="/admin/settings"
          className="relative h-9 w-9 overflow-hidden rounded-full border border-slate-200 dark:border-slate-700 shrink-0"
        >
          <img
            src={user?.avatarUrl || "/pharmacist-avatar.png"}
            alt={user?.name || "Admin"}
            className="h-full w-full object-cover"
          />
        </Link>
      </div>
    </header>
  );
}
