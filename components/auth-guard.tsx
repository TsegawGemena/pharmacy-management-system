"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  getAuthToken,
  getSessionRole,
  logout,
} from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(pathname === "/login");

  useEffect(() => {
    if (pathname === "/login") {
      setReady(true);
      return;
    }

    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    const role = getSessionRole();
    const isAdminRoute = pathname === "/admin" || pathname?.startsWith("/admin/");

    if (isAdminRoute) {
      if (role !== "Admin") {
        if (role === "Pharmacist") {
          router.replace("/");
        } else {
          logout();
          router.replace("/login?portal=admin");
        }
        return;
      }
      setReady(true);
      return;
    }

    // Pharmacist app routes (everything outside /admin and /login)
    if (role !== "Pharmacist") {
      if (role === "Admin") {
        router.replace("/admin");
      } else {
        logout();
        router.replace("/login");
      }
      return;
    }

    setReady(true);
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] dark:bg-[#090d16]">
        <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
      </div>
    );
  }

  return <>{children}</>;
}
