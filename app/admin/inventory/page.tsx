"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  Download,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Timer,
} from "lucide-react";
import AdminHeader from "@/components/admin/admin-header";
import { PageState } from "@/components/ui/page-state";
import { getInventory } from "@/lib/api";
import { useApi } from "@/lib/hooks/use-api";
import type { InventoryItem } from "@/lib/types";

function daysUntil(dateStr: string): number | null {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr || "—";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

type RowStatus = "HEALTHY" | "LOW STOCK" | "EXPIRING" | "CRITICAL";

function getRowStatus(item: InventoryItem): RowStatus {
  const days = daysUntil(item.expiryDate);
  if (days != null && days <= 30 && days >= 0) return "EXPIRING";
  if (item.isExpiringSoon) return "EXPIRING";
  if (item.stock <= 0) return "CRITICAL";
  if (item.stock <= item.minStock) return "LOW STOCK";
  return "HEALTHY";
}

const STATUS_STYLES: Record<RowStatus, string> = {
  HEALTHY:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800",
  "LOW STOCK":
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
  EXPIRING:
    "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800",
  CRITICAL:
    "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-700",
};

export default function AdminInventoryPage() {
  const { data, loading, error, refetch } = useApi(getInventory);
  const items = data ?? [];

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category).filter(Boolean));
    return ["All", ...Array.from(set).sort()];
  }, [items]);

  const kpis = useMemo(() => {
    const totalStock = items.reduce((s, i) => s + (i.stock || 0), 0);
    const totalValue = items.reduce((s, i) => {
      const price = Number(String(i.unitPrice).replace(/[^0-9.-]/g, "")) || 0;
      return s + price * (i.stock || 0);
    }, 0);
    const lowStock = items.filter((i) => i.stock <= i.minStock).length;
    const expiringSoon = items.filter((i) => {
      const days = daysUntil(i.expiryDate);
      return i.isExpiringSoon || (days != null && days >= 0 && days <= 30);
    }).length;
    return { totalStock, totalValue, lowStock, expiringSoon };
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.batchNo?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q);
      const status = getRowStatus(item);
      const matchesStatus =
        statusFilter === "All Statuses" || status === statusFilter;
      const matchesCategory =
        categoryFilter === "All" || item.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [items, searchQuery, statusFilter, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(currentPage, totalPages);
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleExport = () => {
    const headers =
      "Product Name,Batch No,Quantity,Unit Price (ETB),Expiry Date,Status\n";
    const rows = filtered
      .map((i) => {
        const status = getRowStatus(i);
        return `"${i.name}","${i.batchNo}",${i.stock},${i.unitPrice},"${i.expiryDate}","${status}"`;
      })
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Admin_Inventory_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <AdminHeader
        title="Inventory Control"
        subtitle="Manage stock levels, pricing, and monitor expirations."
        searchPlaceholder="Search inventory..."
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 mb-5 -mt-2">
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <Download className="h-3.5 w-3.5" />
          Export
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#0c3e66] hover:bg-[#0a3354] text-white text-xs font-semibold shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          Adjust Stock
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Stock
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {kpis.totalStock.toLocaleString()}
              </p>
              <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Across all batches
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-400">
              <Package className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Value
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
            ETB{" "}
            {kpis.totalValue >= 1_000_000
              ? `${(kpis.totalValue / 1_000_000).toFixed(1)}M`
              : kpis.totalValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </p>
          <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            At selling unit price
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Low Stock Alerts
              </p>
              <p className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
                {kpis.lowStock}
              </p>
              <p className="mt-2 text-xs text-slate-500">Items below threshold</p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Expiring Soon
              </p>
              <p className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">
                {kpis.expiringSoon}
              </p>
              <p className="mt-2 text-xs text-slate-500">Within 30 days</p>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400">
              <Timer className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filter by product..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 py-2 pl-9 pr-3 text-xs font-medium focus:border-sky-500 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              <option>All Statuses</option>
              <option>HEALTHY</option>
              <option>LOW STOCK</option>
              <option>EXPIRING</option>
              <option>CRITICAL</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "All" ? "Category: All" : c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <PageState loading={loading} error={error} onRetry={refetch} empty={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Product Name</th>
                  <th className="py-3.5 px-5">Batch No.</th>
                  <th className="py-3.5 px-5 text-right">Quantity</th>
                  <th className="py-3.5 px-5 text-right">Purchase Price</th>
                  <th className="py-3.5 px-5 text-right">Selling Price</th>
                  <th className="py-3.5 px-5">Expiry Date</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {pageItems.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400">
                      No inventory items found
                    </td>
                  </tr>
                )}
                {pageItems.map((item) => {
                  const status = getRowStatus(item);
                  const qtyClass =
                    status === "LOW STOCK" || status === "CRITICAL"
                      ? "text-amber-600 dark:text-amber-400 font-bold"
                      : "text-slate-800 dark:text-slate-100 font-semibold";
                  const expiryClass =
                    status === "EXPIRING"
                      ? "text-rose-600 dark:text-rose-400 font-semibold"
                      : "text-slate-600 dark:text-slate-300";

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-slate-800 dark:text-slate-100">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {item.category || "—"}
                        </div>
                      </td>
                      <td className="py-3.5 px-5 font-mono text-slate-600 dark:text-slate-300">
                        {item.batchNo || "—"}
                      </td>
                      <td className={`py-3.5 px-5 text-right font-mono ${qtyClass}`}>
                        {item.stock.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono text-slate-500">
                        —
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono text-slate-700 dark:text-slate-200">
                        ETB {item.unitPrice ?? "—"}
                      </td>
                      <td className={`py-3.5 px-5 ${expiryClass}`}>
                        <span className="inline-flex items-center gap-1">
                          {status === "EXPIRING" && (
                            <AlertTriangle className="h-3.5 w-3.5" />
                          )}
                          {formatDate(item.expiryDate)}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_STYLES[status]}`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          type="button"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                          aria-label="Row actions"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <span>
              Showing{" "}
              {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}-
              {Math.min(page * pageSize, filtered.length)} of {filtered.length}{" "}
              items
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(
                (n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setCurrentPage(n)}
                    className={`h-8 w-8 rounded-lg text-xs font-semibold ${
                      page === n
                        ? "bg-[#0c3e66] text-white"
                        : "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {n}
                  </button>
                )
              )}
            </div>
          </div>
        </PageState>
      </div>
    </div>
  );
}
