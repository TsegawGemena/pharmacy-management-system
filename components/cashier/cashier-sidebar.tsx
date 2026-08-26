"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  History,
  ReceiptText,
  Package,
  UserRound,
  LogOut,
  X,
} from "lucide-react";
import { getStoredUser, logout, logoutApi } from "@/lib/api";
import type { User } from "@/lib/types";

interface CashierSidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

const NAV_ITEMS = [
  { name: "Dashboard", href: "/cashier", icon: LayoutDashboard, exact: true },
  { name: "POS", href: "/cashier/pos", icon: ShoppingCart },
  { name: "Sales History", href: "/cashier/sales-history", icon: History },
  { name: "Invoices", href: "/cashier/invoices", icon: ReceiptText },
  { name: "Products", href: "/cashier/products", icon: Package },
  { name: "My Profile", href: "/cashier/profile", icon: UserRound },
];

export default function CashierSidebar({
  mobileOpen,
  setMobileOpen,
}: CashierSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      // still clear local session
    }
    logout();
    router.push("/login");
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-r border-slate-200/90 dark:border-slate-800">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Link
          href="/cashier"
          className="flex items-center gap-3 px-5 py-5 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition-colors"
        >
          <div className="relative h-11 w-11 shrink-0 rounded-xl overflow-hidden bg-white border border-slate-200/90 dark:border-slate-700 shadow-2xs p-0.5 flex items-center justify-center">
            <img
              src="/logo.jpg"
              alt="Gammo Pharmacy Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-[16px] font-bold text-[#0c3e66] dark:text-sky-400 tracking-tight leading-tight">
              Gammo Pharmacy
            </h1>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Cashier
            </p>
          </div>
        </Link>

        <nav className="px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen?.(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  active
                    ? "bg-[#0c3e66] text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-white" : "text-slate-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
        <div className="px-1">
          <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
            {user?.name || "Cashier"}
          </p>
          <p className="text-[10px] font-mono text-slate-400">
            {user?.employeeId || "—"}
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/60"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-[260px] lg:flex-col">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50"
            aria-label="Close menu"
            onClick={() => setMobileOpen?.(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[280px] max-w-[85vw] shadow-2xl">
            <div className="absolute top-3 right-3 z-10">
              <button
                type="button"
                onClick={() => setMobileOpen?.(false)}
                className="p-2 rounded-lg bg-white/90 dark:bg-slate-800 text-slate-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
