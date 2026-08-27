"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Calendar, Menu } from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";
import MedicationSearch from "@/components/medication-search";
import NotificationBell from "@/components/notification-bell";
import { getStoredUser } from "@/lib/api";
import type { Product, User } from "@/lib/types";

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
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, [pathname]);

  let displayTitle = title;
  let searchPlaceholder = "Search for medication…";

  if (!displayTitle) {
    if (pathname === "/") {
      displayTitle = "Dashboard Overview";
    } else if (pathname?.startsWith("/inventory")) {
      displayTitle = "Gammo Pharmacy";
      searchPlaceholder = "Search for medication…";
    } else if (pathname?.startsWith("/products")) {
      displayTitle = "Products Catalog";
      searchPlaceholder = "Search for medication…";
    } else if (pathname?.startsWith("/pos")) {
      displayTitle = "Point of Sale";
      searchPlaceholder = "Search for medication…";
    } else if (pathname?.startsWith("/invoices")) {
      displayTitle = "Invoices & Billing";
      searchPlaceholder = "Search for medication…";
    } else if (pathname?.startsWith("/reports")) {
      displayTitle = "Reports & Analytics";
      searchPlaceholder = "Search for medication…";
    } else if (pathname?.startsWith("/settings")) {
      displayTitle = "My Profile";
      searchPlaceholder = "Search for medication…";
    } else {
      displayTitle = "Gammo Pharmacy";
    }
  }

  const handleSelectMedication = (product: Product) => {
    if (pathname?.startsWith("/pos")) {
      router.push(`/pos?productId=${encodeURIComponent(product.id)}`);
      return;
    }
    router.push(`/products?q=${encodeURIComponent(product.name)}`);
  };

  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-4 sm:py-5 border-b border-slate-200/80 dark:border-slate-800/90 mb-6 transition-colors">
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div>
          <h1 className="text-xl lg:text-[22px] font-bold text-[#0c3e66] dark:text-sky-400 tracking-tight">
            {displayTitle}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 self-end sm:self-auto">
        <MedicationSearch
          className="w-56 md:w-64 lg:w-72"
          placeholder={searchPlaceholder}
          onSelect={handleSelectMedication}
        />

        <ThemeToggle />

        <NotificationBell />

        <button
          type="button"
          className="rounded-full p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Calendar"
        >
          <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        <Link
          href="/settings"
          className="relative h-9 w-9 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-2xs hover:scale-105 transition-transform shrink-0"
          title="View Profile Settings"
        >
          <img
            src={user?.avatarUrl || "/pharmacist-avatar.png"}
            alt={user?.name || "User profile"}
            className="h-full w-full object-cover"
          />
        </Link>
      </div>
    </header>
  );
}
