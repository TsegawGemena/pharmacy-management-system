"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  AlertTriangle,
  TrendingDown,
  Truck,
  SlidersHorizontal,
  ShoppingCart,
  Pill,
  Bandage,
  HeartPulse,
  Plus,
  Pencil,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Info,
} from "lucide-react";
import InventoryNavTabs from "@/components/inventory/inventory-nav-tabs";
import AlertSettingsModal from "@/components/inventory/alert-settings-modal";

interface StockAlertItem {
  id: string;
  name: string;
  supplier: string;
  sku: string;
  category: string;
  status: "Critical" | "Low Stock";
  currentStock: number;
  unitType: "Units" | "Boxes" | "Bottles";
  threshold: number;
  iconType: "pill" | "tablet" | "gauze" | "capsule";
}

const INITIAL_ALERTS: StockAlertItem[] = [
  {
    id: "1",
    name: "Amoxicillin 500mg Capsules",
    supplier: "PharmaCorp Inc.",
    sku: "MED-AMX-500",
    category: "Antibiotics",
    status: "Critical",
    currentStock: 2,
    unitType: "Units",
    threshold: 20,
    iconType: "capsule",
  },
  {
    id: "2",
    name: "Lisinopril 10mg Tablets",
    supplier: "Global Health Supplies",
    sku: "MED-LIS-010",
    category: "Cardiovascular",
    status: "Critical",
    currentStock: 4,
    unitType: "Units",
    threshold: 30,
    iconType: "tablet",
  },
  {
    id: "3",
    name: "Sterile Gauze Pads 4x4",
    supplier: "MedEquip Direct",
    sku: "SUP-GAZ-4X4",
    category: "First Aid / Supplies",
    status: "Low Stock",
    currentStock: 15,
    unitType: "Boxes",
    threshold: 25,
    iconType: "gauze",
  },
  {
    id: "4",
    name: "Ibuprofen 400mg Tablets",
    supplier: "PharmaCorp Inc.",
    sku: "MED-IBU-400",
    category: "Analgesics",
    status: "Low Stock",
    currentStock: 45,
    unitType: "Units",
    threshold: 50,
    iconType: "pill",
  },
  {
    id: "5",
    name: "Omeprazole 20mg Delayed-Release",
    supplier: "GlaxoSmithKline (GSK)",
    sku: "MED-OME-020",
    category: "Gastrointestinal",
    status: "Critical",
    currentStock: 3,
    unitType: "Units",
    threshold: 25,
    iconType: "capsule",
  },
  {
    id: "6",
    name: "Disposable Syringes 5ml",
    supplier: "Medline Industries",
    sku: "SUP-SYR-005",
    category: "Medical Supplies",
    status: "Low Stock",
    currentStock: 60,
    unitType: "Boxes",
    threshold: 100,
    iconType: "gauze",
  },
];

export default function LowStockAlertsPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<StockAlertItem[]>(INITIAL_ALERTS);
  const [filterTab, setFilterTab] = useState<"all" | "critical" | "medications" | "supplies">("all");
  const [sortBy, setSortBy] = useState<"urgency" | "stock_asc" | "name">("urgency");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingThresholdId, setEditingThresholdId] = useState<string | null>(null);
  const [editingThresholdValue, setEditingThresholdValue] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Toggle selection
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredAlerts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAlerts.map((a) => a.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCreateBulkPO = () => {
    if (selectedIds.length === 0) {
      showToast("Please select at least one item to create bulk PO");
      return;
    }
    showToast(`Generating bulk PO for ${selectedIds.length} items...`);
    setTimeout(() => {
      router.push("/inventory/purchase-orders/new");
    }, 800);
  };

  const handleRestockSingle = (item: StockAlertItem) => {
    showToast(`Initiating Purchase Order for ${item.name}`);
    router.push(
      `/inventory/purchase-orders/new?supplier=${encodeURIComponent(
        item.supplier.includes("PharmaCorp")
          ? "PharmaCorp East Africa"
          : item.supplier.includes("GSK")
          ? "GlaxoSmithKline (GSK)"
          : "Medline Industries"
      )}`
    );
  };

  const handleStartEditThreshold = (item: StockAlertItem) => {
    setEditingThresholdId(item.id);
    setEditingThresholdValue(item.threshold);
  };

  const handleSaveThreshold = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, threshold: Number(editingThresholdValue) } : a))
    );
    setEditingThresholdId(null);
    showToast("Updated minimum stock threshold");
  };

  const filteredAlerts = useMemo(() => {
    return alerts
      .filter((item) => {
        if (filterTab === "critical") return item.status === "Critical";
        if (filterTab === "medications")
          return item.category !== "First Aid / Supplies" && item.category !== "Medical Supplies";
        if (filterTab === "supplies")
          return item.category === "First Aid / Supplies" || item.category === "Medical Supplies";
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "urgency") {
          if (a.status === "Critical" && b.status !== "Critical") return -1;
          if (b.status === "Critical" && a.status !== "Critical") return 1;
          return a.currentStock - b.currentStock;
        }
        if (sortBy === "stock_asc") return a.currentStock - b.currentStock;
        return a.name.localeCompare(b.name);
      });
  }, [alerts, filterTab, sortBy]);

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
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            Low Stock Alerts
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage inventory thresholds and initiate purchase orders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs"
          >
            <SlidersHorizontal className="h-4 w-4 text-slate-600" />
            <span>Alert Settings</span>
          </button>

          <button
            onClick={handleCreateBulkPO}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#006699] hover:bg-[#005580] rounded-lg transition-colors shadow-xs"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>
              {selectedIds.length > 0
                ? `Create Bulk PO (${selectedIds.length})`
                : "Create Bulk PO"}
            </span>
          </button>
        </div>
      </div>

      {/* 3 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Critical Stock Card (Peach / Red Alert Background) */}
        <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              CRITICAL STOCK
            </span>
            <div className="p-2 bg-rose-100/90 text-rose-600 rounded-full">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-rose-600 mt-2 font-mono">
            12
          </div>
          <div className="flex items-center gap-1.5 text-xs text-rose-700 font-semibold mt-1">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
            <span>Below 5 units</span>
          </div>
        </div>

        {/* Low Stock Threshold Card */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              LOW STOCK (THRESHOLD)
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-full">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-800 mt-2 font-mono">
            34
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
            <Info className="h-3.5 w-3.5 text-slate-400" />
            <span>Action required soon</span>
          </div>
        </div>

        {/* Pending Restock Card */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              PENDING RESTOCK
            </span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-full">
              <Truck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-800 mt-2 font-mono">
            8
          </div>
          <Link
            href="/inventory/purchase-orders"
            className="inline-flex items-center gap-1 text-xs text-[#0284c7] font-semibold hover:underline mt-1"
          >
            <span>View active POs</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Filter Pills & Sort Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "All Alerts" },
              { id: "critical", label: "Critical Only" },
              { id: "medications", label: "Medications" },
              { id: "supplies", label: "Supplies" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  filterTab === tab.id
                    ? "bg-[#006699] text-white shadow-2xs"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="text-slate-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-hidden focus:border-sky-500"
            >
              <option value="urgency">Urgency (High to Low)</option>
              <option value="stock_asc">Stock Level (Lowest First)</option>
              <option value="name">Product Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Alerts Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-[13px]">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredAlerts.length > 0 &&
                      selectedIds.length === filteredAlerts.length
                    }
                    onChange={handleToggleSelectAll}
                    className="h-4 w-4 rounded text-[#006699] border-slate-300 focus:ring-[#006699]"
                  />
                </th>
                <th className="py-3.5 px-5">PRODUCT DETAILS</th>
                <th className="py-3.5 px-4 font-mono">SKU</th>
                <th className="py-3.5 px-4">CATEGORY</th>
                <th className="py-3.5 px-5 text-center">STATUS / STOCK</th>
                <th className="py-3.5 px-5 text-center">THRESHOLD</th>
                <th className="py-3.5 px-5 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No alert items found in this category.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((item) => {
                  const isCritical = item.status === "Critical";
                  const isSelected = selectedIds.includes(item.id);

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isCritical
                          ? "bg-rose-50/35 hover:bg-rose-50/60"
                          : "hover:bg-slate-50/60"
                      } ${isSelected ? "ring-1 ring-inset ring-sky-300" : ""}`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(item.id)}
                          className="h-4 w-4 rounded text-[#006699] border-slate-300 focus:ring-[#006699]"
                        />
                      </td>

                      {/* Product Details with icon */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                            {item.iconType === "capsule" && <Pill className="h-4 w-4" />}
                            {item.iconType === "tablet" && <HeartPulse className="h-4 w-4" />}
                            {item.iconType === "gauze" && <Bandage className="h-4 w-4" />}
                            {item.iconType === "pill" && <Pill className="h-4 w-4" />}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800 text-[13px]">
                              {item.name}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Supplier: {item.supplier}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-3.5 px-4 font-mono text-slate-600 font-medium text-[11px]">
                        {item.sku}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {item.category}
                      </td>

                      {/* Status / Stock */}
                      <td className="py-3.5 px-5 text-center">
                        <div className="inline-flex flex-col items-center gap-0.5">
                          {isCritical ? (
                            <>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-100 text-rose-700">
                                Critical
                              </span>
                              <span className="font-mono font-bold text-rose-600 text-xs">
                                {item.currentStock} {item.unitType}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-100 text-amber-800">
                                Low Stock
                              </span>
                              <span className="font-mono font-bold text-slate-800 text-xs">
                                {item.currentStock} {item.unitType}
                              </span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Threshold with edit inline */}
                      <td className="py-3.5 px-5 text-center">
                        {editingThresholdId === item.id ? (
                          <div className="inline-flex items-center gap-1">
                            <input
                              type="number"
                              min="1"
                              value={editingThresholdValue}
                              onChange={(e) =>
                                setEditingThresholdValue(Number(e.target.value))
                              }
                              className="w-14 px-1.5 py-0.5 text-xs font-mono font-bold border border-sky-400 rounded"
                            />
                            <button
                              onClick={() => handleSaveThreshold(item.id)}
                              className="p-1 bg-sky-600 text-white rounded text-[10px] font-bold"
                            >
                              ✓
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartEditThreshold(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 bg-white text-slate-700 font-mono font-medium hover:border-sky-400 hover:bg-sky-50/50 transition-colors"
                            title="Edit Minimum Threshold"
                          >
                            <span>{item.threshold}</span>
                            <Pencil className="h-3 w-3 text-slate-400" />
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => handleRestockSingle(item)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#006699] hover:bg-[#005580] rounded-lg transition-colors shadow-2xs"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Restock</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>Showing 1-{filteredAlerts.length} of 46 items</div>
          <div className="flex items-center gap-3">
            <button className="p-1 rounded border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-medium text-slate-700">Page 1 of 12</span>
            <button className="p-1 rounded border border-slate-200 hover:bg-slate-50 text-slate-600">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Alert Settings Modal */}
      <AlertSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={() => showToast("Alert threshold settings updated successfully")}
      />
    </div>
  );
}
