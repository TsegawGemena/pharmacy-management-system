"use client";

import React, { useMemo, useState } from "react";
import {
  RefreshCw,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  ClipboardList,
  Plus,
  Download,
  Filter as FilterIcon,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  MoreVertical,
  FileEdit,
} from "lucide-react";
import InventoryNavTabs from "@/components/inventory/inventory-nav-tabs";
import CreateAdjustmentModal from "@/components/inventory/create-adjustment-modal";
import { PageState } from "@/components/ui/page-state";
import { getAdjustments, createAdjustment, updateAdjustment, deleteAdjustment, updateProduct, getCategories, createCategory } from "@/lib/api";
import type { Adjustment } from "@/lib/types";
import { useApi } from "@/lib/hooks/use-api";

export default function StockAdjustmentsPage() {
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Adjustment | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { data, loading, error, refetch } = useApi(() => getAdjustments(), []);
  const { data: categoriesData, refetch: refetchCategories } = useApi(getCategories, []);
  const adjustments = data ?? [];
  const categories = (categoriesData ?? []).map((c) => c.name);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveAdjustment = async (payload: Partial<Adjustment>) => {
    try {
      if (payload.productId) {
        await updateProduct(payload.productId, {
          name: payload.productName,
          category: payload.category,
          sku: payload.sku,
          price: payload.price,
        });
      }
      if (payload.id) {
        await updateAdjustment(payload.id, payload);
        showToast("Adjustment updated");
      } else {
        const created = await createAdjustment(payload);
        showToast(`Created stock adjustment ${created.id}`);
      }
      await refetch();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save adjustment");
      throw err;
    }
  };

  const handleAddCategory = async (name: string) => {
    await createCategory(name);
    await refetchCategories();
    showToast(`Category "${name}" added`);
  };

  const handleDeleteAdjustment = async (id: string) => {
    try {
      await deleteAdjustment(id);
      await refetch();
      showToast("Adjustment deleted");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete adjustment");
    }
  };

  const handleExportReport = () => {
    const headers = "Adjustment ID,Date,Product Name,SKU,Type,Qty Change,Adjusted By,Status\n";
    const rows = adjustments
      .map(
        (a) =>
          `"${a.id}","${a.date}","${a.productName}","${a.sku}","${a.type}",${a.qtyChange},"${a.adjustedBy}","${a.status}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Stock_Adjustments_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Exported adjustment report CSV");
  };

  const filteredAdjustments = useMemo(() => {
    return adjustments.filter((a) => {
      if (typeFilter !== "All Types" && a.type !== typeFilter) {
        return false;
      }
      return true;
    });
  }, [adjustments, typeFilter]);

  const stats = useMemo(() => ({
    total: adjustments.length,
    damagedExpired: adjustments.filter((a) => a.type === "Expired" || a.type === "Damaged").length,
    pendingReview: adjustments.filter((a) => a.status === "Pending Review").length,
  }), [adjustments]);

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

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Stock Adjustments
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage discrepancies, damages, and expired inventory records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 rounded-lg transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            <span>Export Report</span>
          </button>

          <button
            onClick={() => {
              setEditing(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#006699] hover:bg-[#005580] rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create Adjustment</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Adjustments */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-bold">
              Total Adjustments (Month)
            </span>
            <FileEdit className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          </div>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-mono">{stats.total}</span>
          </div>
        </div>

        {/* Value of Discrepancies */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] font-bold">
                Value of Discrepancies
              </span>
              <DollarSign className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-mono">—</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">ETB</span>
            </div>
          </div>
          {/* Dual tone bottom bar */}
          <div className="h-1.5 w-full bg-sky-100 dark:bg-slate-800 rounded-full mt-3 overflow-hidden flex">
            <div className="w-1/3 bg-rose-500 rounded-l-full" />
            <div className="w-2/3 bg-sky-400 rounded-r-full" />
          </div>
        </div>

        {/* Damaged / Expired */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-bold">
              Damaged / Expired
            </span>
            <AlertTriangle className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 font-mono">{stats.damagedExpired}</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Items</span>
          </div>
        </div>

        {/* Pending Review */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-bold">
              Pending Review
            </span>
            <ClipboardList className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">{stats.pendingReview}</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Records</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Type Dropdown */}
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="pl-8 pr-4 py-2 text-xs sm:text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-sky-500"
              >
                <option value="All Types">All Types</option>
                <option value="Expired">Expired</option>
                <option value="Inventory Count">Inventory Count</option>
                <option value="Damaged">Damaged</option>
                <option value="Theft / Lost">Theft / Lost</option>
                <option value="Write-off">Write-off</option>
              </select>
              <FilterIcon className="absolute left-2.5 top-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Date Range Dropdown */}
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="pl-8 pr-4 py-2 text-xs sm:text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-sky-500"
              >
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="This Month">This Month</option>
                <option value="Custom Range">Custom Range</option>
              </select>
              <Calendar className="absolute left-2.5 top-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Pagination summary on right */}
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span>1-{filteredAdjustments.length} of {adjustments.length}</span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <PageState loading={loading} error={error} onRetry={refetch}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-[13px]">
            <thead className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3.5 px-6">ID</th>
                <th className="py-3.5 px-5">DATE</th>
                <th className="py-3.5 px-6">PRODUCT NAME</th>
                <th className="py-3.5 px-4 font-mono">SKU</th>
                <th className="py-3.5 px-5 text-center">TYPE</th>
                <th className="py-3.5 px-5 text-center font-mono">QTY CHANGE</th>
                <th className="py-3.5 px-5">ADJUSTED BY</th>
                <th className="py-3.5 px-5 text-center">STATUS</th>
                <th className="py-3.5 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAdjustments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                    No adjustment records found.
                  </td>
                </tr>
              ) : (
                filteredAdjustments.map((adj) => (
                  <tr key={adj.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                    {/* ID */}
                    <td className="py-3.5 px-6 font-mono font-bold text-[#0284c7] dark:text-sky-400">
                      {adj.id}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-5 text-slate-600 dark:text-slate-400 font-medium">
                      {adj.date}
                    </td>

                    {/* Product Name */}
                    <td className="py-3.5 px-6 font-semibold text-slate-800 dark:text-slate-200">
                      {adj.productName}
                    </td>

                    {/* SKU */}
                    <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400 font-medium text-[11px]">
                      {adj.sku}
                    </td>

                    {/* Type Badge */}
                    <td className="py-3.5 px-5 text-center">
                      {adj.type === "Expired" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
                          Expired
                        </span>
                      )}
                      {adj.type === "Inventory Count" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60">
                          Inventory Count
                        </span>
                      )}
                      {adj.type === "Damaged" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800/60">
                          Damaged
                        </span>
                      )}
                      {adj.type === "Theft / Lost" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                          Theft / Lost
                        </span>
                      )}
                      {adj.type === "Write-off" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          Write-off
                        </span>
                      )}
                    </td>

                    {/* Qty Change */}
                    <td className="py-3.5 px-5 text-center font-mono font-bold">
                      <span
                        className={
                          adj.qtyChange < 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                        }
                      >
                        {adj.qtyChange > 0 ? `+${adj.qtyChange}` : adj.qtyChange}
                      </span>
                    </td>

                    {/* Adjusted By */}
                    <td className="py-3.5 px-5 text-slate-700 dark:text-slate-300 font-medium">
                      {adj.adjustedBy}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-5 text-center">
                      {adj.status === "Completed" ? (
                        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-semibold border border-emerald-500 text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-800">
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300">
                          Pending Review
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setEditing(adj);
                          setIsModalOpen(true);
                        }}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        title="Edit adjustment"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        </PageState>
      </div>

      <CreateAdjustmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditing(null);
        }}
        onSave={handleSaveAdjustment}
        onDelete={handleDeleteAdjustment}
        initial={editing}
        categories={categories}
        onAddCategory={handleAddCategory}
      />
    </div>
  );
}
