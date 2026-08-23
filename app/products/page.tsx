"use client";

import React, { useMemo, useState } from "react";
import {
  Pill,
  Network,
  AlertTriangle,
  Ban,
  Plus,
  Search,
  CheckCircle2,
} from "lucide-react";
import AddProductModal from "@/components/inventory/add-product-modal";
import { PageState } from "@/components/ui/page-state";
import { getProducts, createProduct } from "@/lib/api";
import type { Product } from "@/lib/types";
import { useApi } from "@/lib/hooks/use-api";

export default function ProductManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { data, loading, error, refetch } = useApi(
    () => getProducts({ q: searchQuery, category: categoryFilter, status: statusFilter, page: currentPage }),
    [searchQuery, categoryFilter, statusFilter, currentPage]
  );

  const products = data?.data ?? [];
  const totalEntries = data?.meta?.total ?? products.length;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddProduct = async (newProd: {
    name: string;
    category: string;
    batchNo?: string;
    stock: number;
    unitPrice: number | string;
  }) => {
    try {
      await createProduct({
        name: newProd.name,
        category: newProd.category,
        sku: newProd.batchNo || undefined,
        manufacturer: "",
        price: Number(newProd.unitPrice).toFixed(2),
        stock: newProd.stock,
        status: "Active",
      });
      await refetch();
      showToast(`Added ${newProd.name} to catalog`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to add product");
    }
  };

  const stats = useMemo(() => {
    const activeCount = products.filter((p) => p.status === "Active").length;
    const categories = new Set(products.map((p) => p.category));
    const outOfStock = products.filter((p) => p.stock === 0).length;
    const discontinued = products.filter((p) => p.status === "Inactive").length;
    return { activeCount, categoryCount: categories.size, outOfStock, discontinued, categories };
  }, [products]);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-xl shadow-lg border border-slate-700 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Product Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your medicine catalog, pricing, and category classifications.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#006699] text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-[#005580] transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL PRODUCTS */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              TOTAL PRODUCTS
            </span>
            <div className="p-2 bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 rounded-lg">
              <Pill className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-mono mt-2">
            {totalEntries.toLocaleString()}
          </div>
          <div className="text-xs text-sky-600 dark:text-sky-400 font-semibold mt-1">
            {stats.activeCount.toLocaleString()} Active
          </div>
        </div>

        {/* CATEGORIES */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              CATEGORIES
            </span>
            <div className="p-2 bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 rounded-lg">
              <Network className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-mono mt-2">
            {stats.categoryCount}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 truncate">
            {stats.categories.size > 0
              ? [...stats.categories].slice(0, 3).join(", ") + (stats.categories.size > 3 ? "..." : "")
              : "No categories yet"}
          </div>
        </div>

        {/* OUT OF STOCK */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              OUT OF STOCK
            </span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-lg">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-mono mt-2">
            {stats.outOfStock}
          </div>
          <div className="text-xs text-rose-600 dark:text-rose-400 font-semibold mt-1">
            Needs replenishment
          </div>
        </div>

        {/* DISCONTINUED */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              DISCONTINUED
            </span>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg">
              <Ban className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-mono mt-2">
            {stats.discontinued}
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
            Inactive items
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search product name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-sky-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-sky-500 font-medium"
            >
              <option value="All Categories">All Categories</option>
              <option value="Antibiotics">Antibiotics</option>
              <option value="Analgesics">Analgesics</option>
              <option value="NSAID">NSAID</option>
              <option value="Supplements">Supplements</option>
              <option value="Gastrointestinal">Gastrointestinal</option>
              <option value="Antidiabetic">Antidiabetic</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-sky-500 font-medium"
            >
              <option value="All Statuses">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Products Table */}
        <PageState loading={loading} error={error} onRetry={refetch}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-[13px]">
              <thead className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3.5 px-6">Name</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-5 font-mono">SKU/ID</th>
                  <th className="py-3.5 px-5">Manufacturer</th>
                  <th className="py-3.5 px-5 text-right font-mono">Price (ETB)</th>
                  <th className="py-3.5 px-6 text-center">Stock</th>
                  <th className="py-3.5 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                      No products found matching your search.
                    </td>
                  </tr>
                ) : (
                  products.map((p: Product) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                    {/* Name */}
                    <td className="py-3.5 px-6 font-semibold text-slate-800 dark:text-slate-200">
                      {p.name}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-6 text-slate-600 dark:text-slate-400 font-medium">
                      {p.category}
                    </td>

                    {/* SKU/ID */}
                    <td className="py-3.5 px-5 font-mono text-slate-500 dark:text-slate-400 font-medium">
                      {p.sku}
                    </td>

                    {/* Manufacturer */}
                    <td className="py-3.5 px-5 text-slate-700 dark:text-slate-300">
                      {p.manufacturer}
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-800 dark:text-slate-100">
                      {p.price}
                    </td>

                    {/* Stock */}
                    <td className="py-3.5 px-6 text-center">
                      {p.stock === 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
                          0 units
                        </span>
                      ) : p.stock <= 20 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                          {p.stock} units
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
                          {p.stock} units
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-6">
                      {p.status === "Active" ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500">
                          <span className="h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-500" />
                          Inactive
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        </PageState>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div>Showing 1 to {products.length} of {totalEntries.toLocaleString()} entries</div>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40"
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
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddProduct={handleAddProduct}
      />
    </div>
  );
}
