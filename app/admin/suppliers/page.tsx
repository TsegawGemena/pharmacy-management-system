"use client";

import React, { useMemo, useState } from "react";
import { Search, Truck } from "lucide-react";
import AdminHeader from "@/components/admin/admin-header";
import { PageState } from "@/components/ui/page-state";
import { getSuppliers } from "@/lib/api";
import { useApi } from "@/lib/hooks/use-api";

export default function AdminSuppliersPage() {
  const { data, loading, error, refetch } = useApi(getSuppliers);
  const suppliers = data ?? [];
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return suppliers;
    return suppliers.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.category?.toLowerCase().includes(q) ||
        s.contact?.email?.toLowerCase().includes(q)
    );
  }, [suppliers, query]);

  return (
    <div>
      <AdminHeader
        title="Suppliers"
        subtitle="Manage vendor relationships, contacts, and supply categories."
        searchPlaceholder="Search suppliers..."
      />

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter suppliers..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 py-2 pl-9 pr-3 text-xs font-medium focus:border-sky-500 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        <PageState loading={loading} error={error} onRetry={refetch} empty={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Supplier</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5">Contact</th>
                  <th className="py-3.5 px-5">Rating</th>
                  <th className="py-3.5 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400">
                      <Truck className="h-5 w-5 mx-auto mb-2 opacity-50" />
                      No suppliers found
                    </td>
                  </tr>
                )}
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-5 font-semibold text-slate-800 dark:text-slate-100">
                      {s.name}
                    </td>
                    <td className="py-3.5 px-5 text-slate-600">{s.category || "—"}</td>
                    <td className="py-3.5 px-5 text-slate-600">
                      {s.contact?.name || s.contact?.email || "—"}
                    </td>
                    <td className="py-3.5 px-5 font-mono">
                      {s.rating != null ? s.rating.toFixed(1) : "—"}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600">
                        {s.status || "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PageState>
      </div>
    </div>
  );
}
