"use client";

import React, { useMemo, useState } from "react";
import { Package, Search } from "lucide-react";
import CashierHeader from "@/components/cashier/cashier-header";
import { useCashierMobileMenu } from "@/components/cashier/cashier-shell-context";
import { PageState } from "@/components/ui/page-state";
import { getProducts } from "@/lib/api";
import { useApi } from "@/lib/hooks/use-api";

/** Read-only product catalog for cashiers — no create/edit/restock actions. */
export default function CashierProductsPage() {
  const menu = useCashierMobileMenu();
  const { data, loading, error, refetch } = useApi(getProducts);
  const products = data?.data ?? [];
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
    );
  }, [products, query]);

  return (
    <div>
      <CashierHeader
        title="Products"
        subtitle="Read-only catalog. Selling price and stock for checkout reference."
        onOpenMobileMenu={menu?.open}
      />

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or category…"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 py-2 pl-9 pr-3 text-xs font-medium focus:border-sky-500 focus:outline-hidden"
            />
          </div>
        </div>

        <PageState loading={loading} error={error} onRetry={refetch} empty={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Product</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5 text-right">Selling Price</th>
                  <th className="py-3.5 px-5 text-center">Stock</th>
                  <th className="py-3.5 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400">
                      <Package className="h-5 w-5 mx-auto mb-2 opacity-50" />
                      No products found
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-5 font-semibold text-slate-800 dark:text-slate-100">
                        {p.name}
                      </td>
                      <td className="py-3.5 px-5 text-slate-600">
                        {p.category || "—"}
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono font-semibold">
                        {p.price} ETB
                      </td>
                      <td className="py-3.5 px-5 text-center font-mono">
                        {p.stock}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600">
                          {p.status || "—"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </PageState>
      </div>
    </div>
  );
}
