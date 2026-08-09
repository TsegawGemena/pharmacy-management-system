"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // If on login route, render standalone full-screen page
  if (pathname === "/login") {
    return <div className="min-h-screen bg-white">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
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
  );
}
