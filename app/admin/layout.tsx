"use client";

import React, { useState } from "react";
import AdminSidebar from "@/components/admin/admin-sidebar";
import { AdminMobileMenuProvider } from "@/components/admin/admin-shell-context";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AdminMobileMenuProvider open={() => setMobileOpen(true)}>
      <div className="flex min-h-screen bg-[#f1f5f9] dark:bg-[#090d16] text-slate-800 dark:text-slate-100 transition-colors">
        <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <div className="flex-1 flex flex-col min-w-0 lg:pl-[260px]">
          <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-10">{children}</main>
        </div>
      </div>
    </AdminMobileMenuProvider>
  );
}
