"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import AuthGuard from "@/components/auth-guard";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Login: standalone full-screen
  if (pathname === "/login") {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-white dark:bg-[#090d16] text-slate-800 dark:text-slate-100">
          {children}
        </div>
      </AuthGuard>
    );
  }

  // Admin portal uses its own layout under app/admin/layout.tsx
  if (pathname === "/admin" || pathname?.startsWith("/admin/")) {
    return <AuthGuard>{children}</AuthGuard>;
  }

  // Cashier portal uses its own layout under app/cashier/layout.tsx
  if (pathname === "/cashier" || pathname?.startsWith("/cashier/")) {
    // Receipt preview: standalone A5 page (no sidebar)
    if (pathname.includes("/receipt")) {
      return <AuthGuard>{children}</AuthGuard>;
    }
    return <AuthGuard>{children}</AuthGuard>;
  }

  // Pharmacist receipt preview: standalone A5 page (no sidebar)
  if (pathname?.includes("/invoices/") && pathname.endsWith("/receipt")) {
    return <AuthGuard>{children}</AuthGuard>;
  }

  // Pharmacist portal shell
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-800 dark:text-slate-100 transition-colors">
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
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
