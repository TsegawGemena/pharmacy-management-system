"use client";

import React, { useState } from "react";
import CashierSidebar from "@/components/cashier/cashier-sidebar";
import { CashierMobileMenuProvider } from "@/components/cashier/cashier-shell-context";

export default function CashierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <CashierMobileMenuProvider open={() => setMobileOpen(true)}>
      <div className="flex min-h-screen bg-[#f1f5f9] dark:bg-[#090d16] text-slate-800 dark:text-slate-100 transition-colors">
        <CashierSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <div className="flex-1 flex flex-col min-w-0 lg:pl-[260px]">
          <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-10">{children}</main>
        </div>
      </div>
    </CashierMobileMenuProvider>
  );
}
