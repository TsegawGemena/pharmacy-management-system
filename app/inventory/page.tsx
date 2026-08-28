"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Package,
  AlertTriangle,
  AlertCircle,
  Timer,
  Plus,
  Search,
  Download,
  RotateCcw,
  Filter as FilterIcon,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import InventoryNavTabs from "@/components/inventory/inventory-nav-tabs";
import RestockModal from "@/components/inventory/restock-modal";
import { PageState } from "@/components/ui/page-state";
import { getInventory, getProducts, restockInventory, updateProduct, getCategories, createCategory, updateCategory } from "@/lib/api";
import type { InventoryItem } from "@/lib/types";
import { useApi } from "@/lib/hooks/use-api";
import type { EditAndRestockFormData } from "@/components/inventory/restock-modal";

export default function InventoryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
        </div>
      }
    >
      <InventoryPageInner />
    </Suspense>
  );
}

function InventoryPageInner() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [stockStatus, setStockStatus] = useState<"all" | "in_stock" | "low_stock" | "out_of_stock">("all");
  const [expiryStatus, setExpiryStatus] = useState("Any Date");
  const [currentPage, setCurrentPage] = useState(1);
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("filter") === "expiring") {
      setExpiryStatus("Expiring Soon (<90d)");
    }
  }, [searchParams]);

  const { data, loading, error, refetch } = useApi(() => getInventory(), []);
  const { data: productsResult, refetch: refetchProducts } = useApi(
    () => getProducts({ limit: 200 }),
    []
  );
  const { data: categoriesData, refetch: refetchCategories } = useApi(
    getCategories,
    []
  );
  const items = data ?? [];
  const products = productsResult?.data ?? [];
  const categoryOptions = useMemo(() => {
    const fromApi = (categoriesData ?? []).map((c) => c.name);
    const fromProducts = products.map((p) => p.category).filter(Boolean);
    return Array.from(new Set([...fromApi, ...fromProducts])).sort();
  }, [categoriesData, products]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      showToast("Inventory data refreshed");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to refresh inventory");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleEditAndRestock = async (form: EditAndRestockFormData) => {
    try {
      await updateProduct(form.productId, {
        name: form.name,
        category: form.category,
        unit: form.unit,
        status: form.status,
        price: form.sellingPrice,
        sellingPrice: form.sellingPrice,
        purchasePrice: form.purchasePrice || undefined,
        stock: form.stockQuantity,
        expiryDate: form.expiryDate || undefined,
      });
      if (form.quantity > 0) {
        await restockInventory({
          productId: form.productId,
          quantity: form.quantity,
          purchasePrice: form.purchasePrice || undefined,
          sellingPrice: form.sellingPrice || undefined,
          unitPrice: form.sellingPrice || undefined,
          expiryDate: form.expiryDate || undefined,
        });
        showToast("Product updated and stock added");
      } else {
        showToast("Product updated");
      }
      await Promise.all([refetch(), refetchProducts()]);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save");
      throw err;
    }
  };

  const handleAddCategory = async (name: string) => {
    await createCategory(name);
    await refetchCategories();
    showToast(`Category "${name}" added`);
  };

  const handleRenameCategory = async (oldName: string, newName: string) => {
    const cat = (categoriesData ?? []).find(
      (c) => c.name.toLowerCase() === oldName.toLowerCase()
    );
    if (!cat) throw new Error(`Category "${oldName}" was not found.`);
    await updateCategory(cat.id, newName);
    await refetchCategories();
    await Promise.all([refetch(), refetchProducts()]);
    showToast(`Category renamed to "${newName}"`);
  };

  const handleExportCSV = () => {
    const headers = "Product Name,Category,Batch No,Stock Level,Min Stock,Expiry Date,Unit Price (ETB)\n";
    const rows = items
      .map(
        (i) =>
          `"${i.name}","${i.category}","${i.batchNo}",${i.stock},${i.minStock},"${i.expiryDate}",${i.unitPrice}`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Gammo_Inventory_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Exported inventory CSV file");
  };

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesBatch = item.batchNo.toLowerCase().includes(q);
        const matchesCat = item.category.toLowerCase().includes(q);
        if (!matchesName && !matchesBatch && !matchesCat) return false;
      }

      // Category
      if (categoryFilter !== "All Categories" && item.category !== categoryFilter) {
        return false;
      }

      // Stock Status
      if (stockStatus === "in_stock") {
        if (item.stock <= item.minStock) return false;
      } else if (stockStatus === "low_stock") {
        if (item.stock > item.minStock || item.stock === 0) return false;
      } else if (stockStatus === "out_of_stock") {
        if (item.stock > 0) return false;
      }

      // Expiry Status
      if (expiryStatus === "Expiring Soon (<90d)" && !item.isExpiringSoon) {
        return false;
      }
      if (expiryStatus === "Expired" && !item.expiryDate.includes("2024")) {
        return false;
      }

      return true;
    });
  }, [items, searchQuery, categoryFilter, stockStatus, expiryStatus]);

  const stats = useMemo(() => ({
    totalSkus: items.length,
    lowStock: items.filter((i) => i.stock <= i.minStock && i.stock > 0).length,
    critical: items.filter((i) => i.stock <= 20 && i.stock > 0).length,
    expiringSoon: items.filter((i) => i.isExpiringSoon).length,
  }), [items]);

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
            Inventory Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Monitor and manage your medicine stock levels and expiry dates.
          </p>
        </div>
        <button
          onClick={() => setIsRestockOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#006699] text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-[#005580] transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Edit & Restock</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total items */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs transition-colors">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <Package className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <span>TOTAL ITEMS</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-2.5 font-mono">
            {stats.totalSkus.toLocaleString()}
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs transition-colors">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-[11px] font-bold uppercase tracking-wider">
            <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400" />
            <span>LOW STOCK ITEMS</span>
          </div>
          <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-2.5 font-mono">
            {stats.lowStock}
          </div>
        </div>

        {/* Critical Stock */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 border-l-4 border-l-rose-500 dark:border-l-rose-500 p-5 shadow-2xs transition-colors">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-[11px] font-bold uppercase tracking-wider">
            <AlertCircle className="h-4 w-4 text-rose-500 dark:text-rose-400" />
            <span>CRITICAL STOCK</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-2.5 font-mono">
            {stats.critical}
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 border-l-4 border-l-orange-500 dark:border-l-orange-500 p-5 shadow-2xs transition-colors">
          <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 text-[11px] font-bold uppercase tracking-wider">
            <Timer className="h-4 w-4 text-orange-500 dark:text-orange-400" />
            <span>EXPIRING SOON</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-2.5 font-mono">
            {stats.expiringSoon}
          </div>
        </div>
      </div>

      {/* Main Content: Left Filter Sidebar + Right Inventory Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Filter Panel */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs space-y-6 transition-colors">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <FilterIcon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              Filters
            </h3>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              CATEGORY
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-sky-500 font-medium"
            >
              <option value="All Categories">All Categories</option>
              <option value="Antibiotics">Antibiotics</option>
              <option value="Pain Relief">Pain Relief</option>
              <option value="Cardiovascular">Cardiovascular</option>
              <option value="Vitamins">Vitamins</option>
              <option value="Gastrointestinal">Gastrointestinal</option>
              <option value="Diabetes Care">Diabetes Care</option>
            </select>
          </div>

          {/* Stock Status Radio */}
          <div className="space-y-2.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              STOCK STATUS
            </label>
            <div className="space-y-2">
              {[
                { id: "all", label: "All" },
                { id: "in_stock", label: "In Stock" },
                { id: "low_stock", label: "Low Stock" },
                { id: "out_of_stock", label: "Out of Stock" },
              ].map((option) => (
                <label
                  key={option.id}
                  className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300 select-none hover:text-slate-900 dark:hover:text-white"
                >
                  <input
                    type="radio"
                    name="stockStatus"
                    checked={stockStatus === option.id}
                    onChange={() => setStockStatus(option.id as any)}
                    className="h-3.5 w-3.5 text-[#006699] focus:ring-[#006699] border-slate-300 dark:border-slate-600"
                  />
                  <span className="font-medium">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Expiry Status Dropdown */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              EXPIRY STATUS
            </label>
            <select
              value={expiryStatus}
              onChange={(e) => setExpiryStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-sky-500 font-medium"
            >
              <option value="Any Date">Any Date</option>
              <option value="Expiring Soon (<90d)">Expiring Soon (&lt;90d)</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          {/* Reset Filters button if any active */}
          {(categoryFilter !== "All Categories" ||
            stockStatus !== "all" ||
            expiryStatus !== "Any Date" ||
            searchQuery !== "") && (
            <button
              onClick={() => {
                setCategoryFilter("All Categories");
                setStockStatus("all");
                setExpiryStatus("Any Date");
                setSearchQuery("");
              }}
              className="w-full py-1.5 text-xs text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 font-medium border border-sky-200 dark:border-sky-800 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-950/50 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Right Inventory Table */}
        <div className="lg:col-span-9 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
          {/* Table Toolbar */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter table..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-sky-500"
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={handleExportCSV}
                title="Export CSV"
                className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
              >
                <Download className="h-4 w-4" />
              </button>
              <button
                onClick={handleRefresh}
                title="Refresh Table"
                className={`p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg transition-all cursor-pointer ${
                  isRefreshing ? "rotate-180 duration-300" : ""
                }`}
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Table */}
          <PageState loading={loading} error={error} onRetry={refetch}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-[13px]">
              <thead className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3.5 px-5">PRODUCT NAME</th>
                  <th className="py-3.5 px-4">CATEGORY</th>
                  <th className="py-3.5 px-4 font-mono">BATCH NO.</th>
                  <th className="py-3.5 px-5">STOCK LEVEL</th>
                  <th className="py-3.5 px-4 text-center">EXPIRY DATE</th>
                  <th className="py-3.5 px-5 text-right font-mono">UNIT PRICE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                      No matching products found. Try adjusting your filters.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const isCritical = item.stock <= 20;
                    const isLow = item.stock <= item.minStock && !isCritical;
                    const max = item.maxStock || item.minStock * 2.5;
                    const percentage = Math.min(100, Math.max(5, (item.stock / max) * 100));

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                        {/* Product Name */}
                        <td className="py-3.5 px-5 font-semibold text-slate-800 dark:text-slate-200">
                          {item.name}
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-medium">
                          {item.category}
                        </td>

                        {/* Batch No */}
                        <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400 font-medium">
                          {item.batchNo}
                        </td>

                        {/* Stock Level with Custom Bar */}
                        <td className="py-3.5 px-5">
                          <div className="w-40 space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span
                                className={`font-bold ${
                                  isCritical
                                    ? "text-rose-600 dark:text-rose-400"
                                    : isLow
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-slate-700 dark:text-slate-300"
                                }`}
                              >
                                {item.stock}
                              </span>
                              <span className="text-slate-400 dark:text-slate-500 text-[10px]">
                                Min: {item.minStock}
                              </span>
                            </div>
                            {/* Bar container */}
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  isCritical
                                    ? "bg-rose-500"
                                    : isLow
                                    ? "bg-amber-500"
                                    : "bg-[#008080]"
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Expiry Date Pill */}
                        <td className="py-3.5 px-4 text-center">
                          {item.isExpiringSoon ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                              <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400 shrink-0" />
                              <span>{item.expiryDate}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
                              {item.expiryDate}
                            </span>
                          )}
                        </td>

                        {/* Unit Price */}
                        <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-800 dark:text-slate-100">
                          {item.unitPrice}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          </PageState>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div>Showing 1 to {filteredItems.length} of {items.length.toLocaleString()} entries</div>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <button
                onClick={() => setCurrentPage(1)}
                className={`w-7 h-7 flex items-center justify-center rounded text-xs font-semibold ${
                  currentPage === 1
                    ? "bg-[#0284c7] text-white"
                    : "border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                1
              </button>
              <button
                onClick={() => setCurrentPage(2)}
                className={`w-7 h-7 flex items-center justify-center rounded text-xs font-semibold ${
                  currentPage === 2
                    ? "bg-[#0284c7] text-white"
                    : "border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                2
              </button>
              <button
                onClick={() => setCurrentPage(3)}
                className={`w-7 h-7 flex items-center justify-center rounded text-xs font-semibold ${
                  currentPage === 3
                    ? "bg-[#0284c7] text-white"
                    : "border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                3
              </button>
              <span className="px-1 text-slate-400">...</span>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <RestockModal
        isOpen={isRestockOpen}
        onClose={() => setIsRestockOpen(false)}
        products={products}
        categories={categoryOptions}
        onSave={handleEditAndRestock}
        onAddCategory={handleAddCategory}
        onRenameCategory={handleRenameCategory}
        onCreateNewProduct={() => {
          window.location.href = "/products";
        }}
      />
    </div>
  );
}
