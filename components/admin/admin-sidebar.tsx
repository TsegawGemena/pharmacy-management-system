"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Boxes,
  Users,
  Truck,
  ShoppingCart,
  ReceiptText,
  History,
  BarChart3,
  Banknote,
  Shield,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { getStoredUser, logout, logoutApi } from "@/lib/api";
import type { User } from "@/lib/types";

interface AdminSidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

/** Customers intentionally omitted — Admin console does not include a Customers module. */
const NAV_ITEMS = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Inventory", href: "/admin/inventory", icon: Boxes },
  { name: "Employees", href: "/admin/employees", icon: Users },
  { name: "Suppliers", href: "/admin/suppliers", icon: Truck },
  { name: "Point of Sale", href: "/admin/pos", icon: ShoppingCart },
  { name: "Invoices", href: "/admin/invoices", icon: ReceiptText },
  { name: "Sales History", href: "/admin/sales-history", icon: History },
  { name: "Reports", href: "/admin/reports", icon: BarChart3 },
  { name: "Financial Reports", href: "/admin/financial-reports", icon: Banknote },
  { name: "Audit Logs", href: "/admin/audit-logs", icon: Shield },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar({ mobileOpen, setMobileOpen }: AdminSidebarProps) {
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
      // Clear local session even if API logout fails
    }
    logout();
    router.push("/login");
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-r border-slate-200/90 dark:border-slate-800">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Link
          href="/admin"
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
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-wider">
              Admin Console
            </p>
          </div>
        </Link>

        <nav className="mt-4 px-3 pb-4">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname?.startsWith(item.href);
              const Icon = item.icon;

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen?.(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-[#0284c7] text-white shadow-xs font-semibold"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon
                      className={`h-[17px] w-[17px] shrink-0 ${
                        isActive ? "text-white" : "text-slate-500 dark:text-slate-400"
                      }`}
                    />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="border-t border-slate-200/80 dark:border-slate-800 p-3 mx-2 mb-2 shrink-0">
        <div className="flex items-center justify-between gap-2 px-2 py-2 rounded-lg">
          <Link
            href="/admin/settings"
            className="flex items-center gap-2.5 min-w-0 flex-1 group"
          >
            <div className="relative h-8 w-8 overflow-hidden rounded-full border border-slate-300 dark:border-slate-700 shrink-0">
              <img
                src={user?.avatarUrl || "/pharmacist-avatar.png"}
                alt={user?.name || "Admin"}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                {user?.name || "Admin"}
              </p>
              <p className="truncate text-[10.5px] text-slate-400 dark:text-slate-500">
                Admin
              </p>
            </div>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            title="Sign Out"
            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex lg:w-[260px] lg:flex-col lg:fixed lg:inset-y-0 lg:z-30">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setMobileOpen?.(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[280px] max-w-[85vw] shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileOpen?.(false)}
              className="absolute top-3 right-3 z-10 p-2 rounded-lg bg-white/90 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
