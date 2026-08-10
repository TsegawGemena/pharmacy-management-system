"use client";

import React, { useState, useMemo } from "react";
import {
  Package,
  AlertTriangle,
  AlertCircle,
  Timer,
  Plus,
  Search,
  Download,
  RotateCcw,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Filter as FilterIcon,
  CheckCircle2,
} from "lucide-react";
import InventoryNavTabs from "@/components/inventory/inventory-nav-tabs";
import AddProductModal from "@/components/inventory/add-product-modal";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  batchNo: string;
  stock: number;
  minStock: number;
  maxStock?: number;
  expiryDate: string; // "Oct 2025", "Nov 2024", etc.
  isExpiringSoon?: boolean;
  unitPrice: string;
}

const INITIAL_ITEMS: InventoryItem[] = [
  {
    id: "1",
    name: "Amoxicillin 500mg Caps",
    category: "Antibiotics",
    batchNo: "BX-7821",
    stock: 450,
    minStock: 100,
    maxStock: 500,
    expiryDate: "Oct 2025",
    isExpiringSoon: false,
    unitPrice: "245.00",
  },
  {
    id: "2",
    name: "Paracetamol 500mg Tabs",
    category: "Pain Relief",
    batchNo: "PT-1182",
    stock: 85,
    minStock: 200,
    maxStock: 500,
    expiryDate: "Jan 2026",
    isExpiringSoon: false,
    unitPrice: "45.00",
  },
  {
    id: "3",
    name: "Lisinopril 10mg Tabs",
    category: "Cardiovascular",
    batchNo: "LS-9941",
    stock: 320,
    minStock: 50,
    maxStock: 400,
    expiryDate: "Nov 2024",
    isExpiringSoon: true,
    unitPrice: "310.50",
  },
  {
    id: "4",
    name: "Vitamin C 1000mg Effervescent",
    category: "Vitamins",
    batchNo: "VC-0021",
    stock: 12,
    minStock: 100,
    maxStock: 300,
    expiryDate: "Dec 2025",
    isExpiringSoon: false,
    unitPrice: "120.00",
  },
  {
    id: "5",
    name: "Omeprazole 20mg Caps",
    category: "Gastrointestinal",
    batchNo: "OM-3310",
    stock: 180,
    minStock: 60,
    maxStock: 250,
    expiryDate: "Aug 2026",
    isExpiringSoon: false,
    unitPrice: "185.00",
  },
  {
    id: "6",
    name: "Metformin 500mg Tabs",
    category: "Diabetes Care",
    batchNo: "MF-5520",
    stock: 24,
    minStock: 150,
    maxStock: 400,
    expiryDate: "Dec 2024",
    isExpiringSoon: true,
    unitPrice: "95.00",
  },
  {
    id: "7",
    name: "Azithromycin 250mg Tabs",
    category: "Antibiotics",
    batchNo: "AZ-4412",
    stock: 92,
    minStock: 120,
    maxStock: 250,
    expiryDate: "Mar 2026",
    isExpiringSoon: false,
    unitPrice: "410.00",
  },
  {
    id: "8",
    name: "Ibuprofen 400mg Caps",
    category: "Pain Relief",
    batchNo: "IB-2004",
    stock: 520,
    minStock: 100,
    maxStock: 600,
    expiryDate: "May 2027",
    isExpiringSoon: false,
    unitPrice: "65.00",
  },
  {
    id: "9",
    name: "Atorvastatin 20mg Tabs",
    category: "Cardiovascular",
    batchNo: "AT-9021",
    stock: 140,
    minStock: 50,
    maxStock: 200,
    expiryDate: "Nov 2025",
    isExpiringSoon: false,
    unitPrice: "380.00",
  },
  {
    id: "10",
    name: "Ciprofloxacin 500mg",
    category: "Antibiotics",
    batchNo: "CP-1108",
    stock: 70,
    minStock: 80,
    maxStock: 200,
    expiryDate: "Jan 2025",
    isExpiringSoon: true,
    unitPrice: "290.00",
  },
];

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_ITEMS);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [stockStatus, setStockStatus] = useState<"all" | "in_stock" | "low_stock" | "out_of_stock">("all");
  const [expiryStatus, setExpiryStatus] = useState("Any Date");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast("Inventory data refreshed");
    }, 400);
  };

  const handleAddProduct = (newProd: any) => {
    const formatted: InventoryItem = {
      id: newProd.id,
      name: newProd.name,
      category: newProd.category,
      batchNo: newProd.batchNo,
      stock: newProd.stock,
      minStock: newProd.minStock,
      maxStock: Math.max(newProd.stock * 1.5, newProd.minStock * 2),
      expiryDate: newProd.expiryDate,
      isExpiringSoon: false,
      unitPrice: newProd.unitPrice,
    };
    setItems((prev) => [formatted, ...prev]);
    showToast(`Added "${newProd.name}" to inventory`);
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
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#006699] text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-[#005580] transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total SKUs */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs transition-colors">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <Package className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <span>TOTAL SKUS</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-2.5 font-mono">
            1,248
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs transition-colors">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-[11px] font-bold uppercase tracking-wider">
            <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400" />
            <span>LOW STOCK ITEMS</span>
          </div>
          <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-2.5 font-mono">
            18
          </div>
        </div>

        {/* Critical Stock */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 border-l-4 border-l-rose-500 dark:border-l-rose-500 p-5 shadow-2xs transition-colors">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-[11px] font-bold uppercase tracking-wider">
            <AlertCircle className="h-4 w-4 text-rose-500 dark:text-rose-400" />
            <span>CRITICAL STOCK</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-2.5 font-mono">
            5
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 border-l-4 border-l-orange-500 dark:border-l-orange-500 p-5 shadow-2xs transition-colors">
          <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 text-[11px] font-bold uppercase tracking-wider">
            <Timer className="h-4 w-4 text-orange-500 dark:text-orange-400" />
            <span>EXPIRING SOON</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-2.5 font-mono">
            7
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

          {/* Pagination Footer */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div>Showing 1 to {filteredItems.length} of 1,248 entries</div>
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

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddProduct={handleAddProduct}
      />
    </div>
  );
}
