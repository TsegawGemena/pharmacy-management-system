"use client";

import React from "react";
import AdminHeader from "@/components/admin/admin-header";
import { type LucideIcon } from "lucide-react";

interface AdminPlaceholderProps {
  title: string;
  subtitle: string;
  searchPlaceholder?: string;
  icon: LucideIcon;
  description: string;
}

export default function AdminPlaceholderPage({
  title,
  subtitle,
  searchPlaceholder = "Search...",
  icon: Icon,
  description,
}: AdminPlaceholderProps) {
  return (
    <div>
      <AdminHeader
        title={title}
        subtitle={subtitle}
        searchPlaceholder={searchPlaceholder}
      />
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-10 shadow-2xs flex flex-col items-center justify-center text-center min-h-[360px]">
        <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-[#006699] dark:text-sky-400 mb-4">
          <Icon className="h-8 w-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h2>
        <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {description}
        </p>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Admin Console · Pharmacist portal remains separate
        </p>
      </div>
    </div>
  );
}
