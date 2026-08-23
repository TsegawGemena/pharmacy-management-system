"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Truck,
  Package,
  Clock,
  Wallet,
  Plus,
  Search,
  Filter as FilterIcon,
  Download,
  Star,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  FilePlus2,
} from "lucide-react";
import InventoryNavTabs from "@/components/inventory/inventory-nav-tabs";
import AddSupplierModal from "@/components/inventory/add-supplier-modal";
import { PageState } from "@/components/ui/page-state";
import { getSuppliers, createSupplier, getPurchaseOrders } from "@/lib/api";
import type { Supplier } from "@/lib/types";
import { useApi } from "@/lib/hooks/use-api";

export default function SupplierManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { data, loading, error, refetch } = useApi(() => getSuppliers(), []);
  const { data: purchaseOrders } = useApi(() => getPurchaseOrders(), []);
  const suppliers = data ?? [];
  const orders = purchaseOrders ?? [];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddSupplier = async (newSup: Partial<Supplier>) => {
    try {
      await createSupplier(newSup);
      await refetch();
      showToast(`Added supplier "${newSup.name}"`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to add supplier");
    }
  };

  const handleExportCSV = () => {
    const headers = "Supplier ID,Name,Category,Contact Name,Contact Email,Rating,Status\n";
    const rows = suppliers
      .map(
        (s) =>
          `"${s.id}","${s.name}","${s.category}","${s.contact?.name ?? ""}","${s.contact?.email ?? ""}",${s.rating ?? 0},"${s.status ?? ""}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Suppliers_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Exported suppliers CSV file");
  };

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesId = s.id.toLowerCase().includes(q);
        const matchesContact = s.contact?.name?.toLowerCase().includes(q) ?? false;
        if (!matchesName && !matchesId && !matchesContact) return false;
      }
      if (categoryFilter !== "All Categories" && s.category !== categoryFilter) {
        return false;
      }
      return true;
    });
  }, [suppliers, searchQuery, categoryFilter]);

  const stats = useMemo(() => {
    const active = suppliers.filter((s) => s.status === "Active").length;
    const pendingDeliveries = orders.filter(
      (o) => o.status === "PENDING" || o.status === "SHIPPED"
    ).length;
    const rated = suppliers.filter((s) => s.rating != null);
    const avgFulfillment =
      rated.length > 0
        ? rated.reduce((sum, s) => sum + (s.rating ?? 0), 0) / rated.length
        : 0;
    const monthSpend = orders.reduce((sum, o) => {
      const total = parseFloat(String(o.total).replace(/,/g, ""));
      return sum + (Number.isNaN(total) ? 0 : total);
    }, 0);

    return {
      total: suppliers.length,
      active,
      pendingDeliveries,
      avgFulfillment,
      monthSpend,
    };
  }, [suppliers, orders]);

  return (
    <div className="space-y-6">
      {/* Sub Navigation Tabs */}
      <InventoryNavTabs />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-xl shadow-lg border border-slate-700 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb & Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <Link href="/inventory" className="hover:text-sky-600 dark:hover:text-sky-400 flex items-center gap-1">
            <Package className="h-3.5 w-3.5" />
            <span>Inventory</span>
          </Link>
          <span>&gt;</span>
          <span className="text-slate-700 dark:text-slate-300 font-semibold">Suppliers</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              Supplier Management
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage approved pharmaceutical suppliers and track vendor performance.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#006699] text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-[#005580] transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Supplier</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL SUPPLIERS */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              TOTAL SUPPLIERS
            </span>
            <div className="p-2 bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 rounded-lg">
              <Truck className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-mono">{stats.active}</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active</span>
          </div>
        </div>

        {/* PENDING DELIVERIES */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 border-l-4 border-l-amber-500 dark:border-l-amber-500 p-5 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              PENDING DELIVERIES
            </span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-lg">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-mono">
              {loading ? "—" : stats.pendingDeliveries}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Shipments expected</span>
          </div>
        </div>

        {/* AVG. FULFILLMENT */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              AVG. FULFILLMENT
            </span>
            <div className="p-2 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-lg">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-mono">
              {loading ? "—" : stats.avgFulfillment > 0 ? stats.avgFulfillment.toFixed(1) : "—"}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Days</span>
          </div>
        </div>

        {/* PROCUREMENT SPEND */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              PROCUREMENT SPEND
            </span>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl lg:text-[26px] font-extrabold text-slate-800 dark:text-slate-100 font-mono">
              {loading
                ? "—"
                : stats.monthSpend > 0
                  ? `${stats.monthSpend.toLocaleString("en-US", { maximumFractionDigits: 0 })} ETB`
                  : "—"}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">This Month</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
        {/* Search & Filter bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search supplier by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-sky-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-sky-500 font-medium"
            >
              <option value="All Categories">All Categories</option>
              <option value="Medications">Medications</option>
              <option value="Medical Supplies">Medical Supplies</option>
              <option value="Equipment">Equipment</option>
              <option value="Diagnostics">Diagnostics</option>
            </select>

            <button
              onClick={() => {
                setCategoryFilter("All Categories");
                setSearchQuery("");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs sm:text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium cursor-pointer"
            >
              <FilterIcon className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
              <span>Filter</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              title="Export Suppliers"
              className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Suppliers Table */}
        <PageState loading={loading} error={error} onRetry={refetch}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-[13px]">
            <thead className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3.5 px-6">SUPPLIER NAME</th>
                <th className="py-3.5 px-6">CATEGORY</th>
                <th className="py-3.5 px-6">CONTACT</th>
                <th className="py-3.5 px-6">PERFORMANCE</th>
                <th className="py-3.5 px-6">STATUS</th>
                <th className="py-3.5 px-6 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                    No suppliers found matching your query.
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier) => {
                  const isInactive = supplier.status === "Inactive";
                  const rating = supplier.rating ?? 0;

                  return (
                    <tr
                      key={supplier.id}
                      className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors ${
                        isInactive ? "opacity-75" : ""
                      }`}
                    >
                      {/* Name & ID */}
                      <td className="py-3.5 px-6">
                        <div>
                          <div
                            className={`font-semibold ${
                              isInactive
                                ? "text-slate-400 dark:text-slate-500 line-through"
                                : "text-[#0284c7] dark:text-sky-400 hover:underline cursor-pointer"
                            }`}
                          >
                            {supplier.name}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                            ID: {supplier.id}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-6 text-slate-700 dark:text-slate-300 font-medium">
                        {supplier.category}
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-6">
                        <div className="text-slate-800 dark:text-slate-200 font-medium">
                          {supplier.contact?.name ?? "—"}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                          {supplier.contact?.email ?? "—"}
                        </div>
                      </td>

                      {/* Performance Stars */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3.5 w-3.5 ${
                                star <= rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-200 dark:text-slate-700"
                              }`}
                            />
                          ))}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-6">
                        {supplier.status === "Active" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/inventory/purchase-orders/new?supplier=${encodeURIComponent(
                              supplier.name
                            )}`}
                            title="Create PO with this Supplier"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#006699] dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/50 rounded-lg transition-colors border border-sky-200 dark:border-sky-800"
                          >
                            <FilePlus2 className="h-3 w-3" />
                            <span>Order</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        </PageState>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div>Showing 1-{filteredSuppliers.length} of {stats.total} Suppliers</div>
          <div className="flex items-center gap-3">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-medium text-slate-700 dark:text-slate-300">Page {currentPage} of 6</span>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Supplier Modal */}
      <AddSupplierModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddSupplier={handleAddSupplier}
      />
    </div>
  );
}
