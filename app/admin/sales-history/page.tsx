"use client";

import React, { useMemo, useState } from "react";
import { History, Search } from "lucide-react";
import AdminHeader from "@/components/admin/admin-header";
import { PageState } from "@/components/ui/page-state";
import { getInvoices } from "@/lib/api";
import { useApi } from "@/lib/hooks/use-api";

export default function AdminSalesHistoryPage() {
  const { data, loading, error, refetch } = useApi(() => getInvoices(), []);
  const invoices = data ?? [];
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return invoices;
    return invoices.filter(
      (inv) =>
        inv.id.toLowerCase().includes(q) ||
        inv.customerName?.toLowerCase().includes(q) ||
        inv.paymentMethod?.toLowerCase().includes(q)
    );
  }, [invoices, query]);

  return (
    <div>
      <AdminHeader
        title="Sales History"
        subtitle="Browse historical sales and completed transactions."
        searchPlaceholder="Search sales history..."
      />

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter sales..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 py-2 pl-9 pr-3 text-xs font-medium focus:border-sky-500 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        <PageState loading={loading} error={error} onRetry={refetch} empty={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Sale / Invoice</th>
                  <th className="py-3.5 px-5">Customer</th>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5">Method</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Amount (ETB)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      <History className="h-5 w-5 mx-auto mb-2 opacity-50" />
                      No sales history found
                    </td>
                  </tr>
                )}
                {filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-5 font-mono font-semibold">{inv.id}</td>
                    <td className="py-3.5 px-5">{inv.customerName || "—"}</td>
                    <td className="py-3.5 px-5 text-slate-500">{inv.date || "—"}</td>
                    <td className="py-3.5 px-5">{inv.paymentMethod || "—"}</td>
                    <td className="py-3.5 px-5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800">
                        {inv.status || "—"}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono font-semibold">
                      {inv.amount ?? "—"}
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
