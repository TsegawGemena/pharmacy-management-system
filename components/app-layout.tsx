"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import AuthGuard from "@/components/auth-guard";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // If on login route, render standalone full-screen page
  if (pathname === "/login") {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-white dark:bg-[#090d16] text-slate-800 dark:text-slate-100">
          {children}
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
    <div className="flex min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-800 dark:text-slate-100 transition-colors">
      {/* Sidebar */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-10">
          <Header onOpenMobileMenu={() => setMobileOpen(true)} />
          {children}
        </main>
      </div>
    </div>
    </AuthGuard>
  );
}
