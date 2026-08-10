"use client";

import React, { useState, useMemo } from "react";
import {
  Pill,
  Network,
  AlertTriangle,
  Ban,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  Package,
} from "lucide-react";
import AddProductModal from "@/components/inventory/add-product-modal";

interface ProductCatalogItem {
  id: string;
  name: string;
  category: string;
  sku: string;
  manufacturer: string;
  price: string;
  stock: number;
  status: "Active" | "Inactive";
}

const INITIAL_PRODUCTS: ProductCatalogItem[] = [
  {
    id: "1",
    name: "Amoxicillin 500mg Caps",
    category: "Antibiotics",
    sku: "AMX-001",
    manufacturer: "GSK",
    price: "120.00",
    stock: 145,
    status: "Active",
  },
  {
    id: "2",
    name: "Paracetamol 500mg Tabs",
    category: "Analgesics",
    sku: "PCM-022",
    manufacturer: "Local",
    price: "45.00",
    stock: 320,
    status: "Active",
  },
  {
    id: "3",
    name: "Ibuprofen 400mg Tabs",
    category: "NSAID",
    sku: "IBU-105",
    manufacturer: "Pfizer",
    price: "65.50",
    stock: 12,
    status: "Active",
  },
  {
    id: "4",
    name: "Vitamin C 1000mg",
    category: "Supplements",
    sku: "VIT-99",
    manufacturer: "Local",
    price: "210.00",
    stock: 0,
    status: "Inactive",
  },
  {
    id: "5",
    name: "Omeprazole 20mg Caps",
    category: "Gastrointestinal",
    sku: "OMP-020",
    manufacturer: "AstraZeneca",
    price: "180.00",
    stock: 89,
    status: "Active",
  },
  {
    id: "6",
    name: "Ceftriaxone 1g Inj",
    category: "Antibiotics",
    sku: "CEF-100",
    manufacturer: "Roche",
    price: "250.00",
    stock: 34,
    status: "Active",
  },
  {
    id: "7",
    name: "Metformin 500mg Tabs",
    category: "Antidiabetic",
    sku: "MET-500",
    manufacturer: "Sanofi",
    price: "35.00",
    stock: 220,
    status: "Active",
  },
  {
    id: "8",
    name: "Azithromycin 500mg",
    category: "Antibiotics",
    sku: "AZI-500",
    manufacturer: "Pfizer",
    price: "450.00",
    stock: 65,
    status: "Active",
  },
];

export default function ProductManagementPage() {
  const [products, setProducts] = useState<ProductCatalogItem[]>(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddProduct = (newProd: any) => {
    const item: ProductCatalogItem = {
      id: String(Date.now()),
      name: newProd.name,
      category: newProd.category,
      sku: newProd.batchNo || `SKU-${Math.floor(100 + Math.random() * 900)}`,
      manufacturer: "GSK",
      price: Number(newProd.unitPrice).toFixed(2),
      stock: newProd.stock,
      status: "Active",
    };
    setProducts((prev) => [item, ...prev]);
    showToast(`Added ${newProd.name} to catalog`);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchSku = item.sku.toLowerCase().includes(q);
        const matchCat = item.category.toLowerCase().includes(q);
        if (!matchName && !matchSku && !matchCat) return false;
      }
      if (categoryFilter !== "All Categories" && item.category !== categoryFilter) {
        return false;
      }
      if (statusFilter === "Active" && item.status !== "Active") return false;
      if (statusFilter === "Inactive" && item.status !== "Inactive") return false;
      if (statusFilter === "Out of Stock" && item.stock > 0) return false;
      if (statusFilter === "Low Stock" && (item.stock > 20 || item.stock === 0)) return false;
      return true;
    });
  }, [products, searchQuery, categoryFilter, statusFilter]);

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
            1,248
          </div>
          <div className="text-xs text-sky-600 dark:text-sky-400 font-semibold mt-1">
            1,196 Active
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
            14
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 truncate">
            Medicine, Surgical, Wellness...
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
            12
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
            5
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
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
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

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div>Showing 1 to {filteredProducts.length} of 1,248 entries</div>
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
