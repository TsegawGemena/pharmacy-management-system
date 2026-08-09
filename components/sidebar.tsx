"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Pill,
  Boxes,
  ShoppingCart,
  ReceiptText,
  BarChart3,
  Settings,
  X,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export default function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();

  const navigationItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Products", href: "/products", icon: Pill },
    { name: "Inventory", href: "/inventory", icon: Boxes },
    { name: "Point of Sale", href: "/pos", icon: ShoppingCart },
    { name: "Invoices", href: "/invoices", icon: ReceiptText },
    { name: "Reports", href: "/reports", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white text-slate-800">
      {/* Top Section */}
      <div>
        {/* Brand Header with Official Gamo Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 px-5 py-5 border-b border-slate-100 hover:bg-slate-50/60 transition-colors group"
        >
          <div className="relative h-11 w-11 shrink-0 rounded-xl overflow-hidden bg-white border border-slate-200/90 shadow-2xs p-0.5 flex items-center justify-center">
            <img
              src="/logo.jpg"
              alt="Gamo Development Association Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-1 leading-tight">
              <h1 className="text-[16px] font-bold text-[#0c3e66] tracking-tight">
                Gammo
              </h1>
            </div>
            <h2 className="text-[16px] font-bold text-[#0c3e66] leading-tight tracking-tight">
              Pharmacy
            </h2>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">
              Clinical Ops v1.0
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="mt-5 px-3">
          <ul className="space-y-1">
            {navigationItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(item.href);
              const Icon = item.icon;

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen && setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-[#0284c7] text-white shadow-xs font-semibold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon
                      className={`h-[18px] w-[18px] shrink-0 ${
                        isActive ? "text-white" : "text-slate-500"
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

      {/* User Profile Footer */}
      <div className="border-t border-slate-200/80 p-3 mx-2 mb-2">
        <div className="flex items-center justify-between gap-2 px-2 py-2 rounded-lg hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative h-8 w-8 overflow-hidden rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center shrink-0">
              <div className="h-full w-full bg-gradient-to-tr from-sky-600 to-teal-600 flex items-center justify-center text-white font-bold text-xs">
                👨‍⚕️
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-800">
                Abebe Kebede
              </p>
              <p className="truncate text-[10.5px] text-slate-400">Pharmacist</p>
            </div>
          </div>
          <Link
            href="/login"
            title="Sign Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex w-56 xl:w-60 flex-col border-r border-slate-200 bg-white min-h-screen shrink-0 sticky top-0 h-screen z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen && setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 max-w-full bg-white shadow-2xl flex flex-col z-50">
            <div className="flex justify-end p-2 border-b border-slate-100">
              <button
                onClick={() => setMobileOpen && setMobileOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{sidebarContent}</div>
          </div>
        </div>
      )}
    </>
  );
}