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
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-100">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#006699] text-white shadow-xs">
            <svg
              className="h-6 w-6 fill-current"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.5 4C10.5 3.17157 11.1716 2.5 12 2.5C12.8284 2.5 13.5 3.17157 13.5 4V9H18.5C19.3284 9 20 9.67157 20 10.5C20 11.3284 19.3284 12 18.5 12H13.5V17C13.5 17.8284 12.8284 18.5 12 18.5C11.1716 18.5 10.5 17.8284 10.5 17V12H5.5C4.67157 12 4 11.3284 4 10.5C4 9.67157 4.67157 9 5.5 9H10.5V4Z"
                fill="white"
              />
              <circle cx="12" cy="20" r="1.5" fill="#38bdf8" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1 leading-tight">
              <h1 className="text-[17px] font-bold text-[#0c3e66] tracking-tight">
                Gammo
              </h1>
            </div>
            <h2 className="text-[17px] font-bold text-[#0c3e66] leading-tight tracking-tight">
              Pharmacy
            </h2>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">
              Clinical Management
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3.5">
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
                    className={`flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-[13.5px] font-medium transition-all duration-150 ${
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
      <div className="border-t border-slate-200/80 p-4 mx-2 mb-2">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-50 transition-colors">
          <div className="relative h-8 w-8 overflow-hidden rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center shrink-0">
            {/* Pharmacist avatar */}
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