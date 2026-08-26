"use client";

import React, { useMemo, useState } from "react";
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
import { PageState } from "@/components/ui/page-state";
import { getInventoryAlerts, getStockAlertSettings, updateStockAlertSettings } from "@/lib/api";
import type { InventoryItem } from "@/lib/types";
import { useApi, useMutation } from "@/lib/hooks/use-api";

interface StockAlertItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  status: "Critical" | "Low Stock";
  currentStock: number;
  unitType: "Units" | "Boxes" | "Bottles";
  threshold: number;
  iconType: "pill" | "tablet" | "gauze" | "capsule";
}

function mapToStockAlert(item: InventoryItem): StockAlertItem {
  const isCritical = item.stock <= 5 || item.stock === 0;
  return {
    id: item.id,
    name: item.name,
    sku: item.batchNo,
    category: item.category,
    status: isCritical ? "Critical" : "Low Stock",
    currentStock: item.stock,
    unitType: "Units",
    threshold: item.minStock,
    iconType: "pill",
  };
}

export default function LowStockAlertsPage() {
  const router = useRouter();
  const { data, loading, error, refetch, setData } = useApi(() => getInventoryAlerts(), []);
  const { data: stockAlertSettings, refetch: refetchAlertSettings } = useApi(
    getStockAlertSettings,
    []
  );
  const { mutate: saveAlertSettings } = useMutation(updateStockAlertSettings);
  const alerts = useMemo(() => (data ?? []).map(mapToStockAlert), [data]);
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

  const handleCreateBulkRestock = () => {
    if (selectedIds.length === 0) {
      showToast("Please select at least one item to restock");
      return;
    }
    const firstId = selectedIds[0];
    router.push(`/products?restock=1&productId=${encodeURIComponent(firstId)}`);
  };

  const handleRestockSingle = (item: StockAlertItem) => {
    router.push(
      `/products?restock=1&productId=${encodeURIComponent(item.id)}`
    );
  };

  const handleStartEditThreshold = (item: StockAlertItem) => {
    setEditingThresholdId(item.id);
    setEditingThresholdValue(item.threshold);
  };

  const handleSaveThreshold = (id: string) => {
    setData((prev) =>
      (prev ?? []).map((a) =>
        a.id === id ? { ...a, minStock: Number(editingThresholdValue) } : a
      )
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

  const stats = useMemo(() => ({
    critical: alerts.filter((a) => a.status === "Critical").length,
    lowStock: alerts.filter((a) => a.status === "Low Stock").length,
  }), [alerts]);

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
            Low Stock Alerts
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage inventory thresholds and restock medicines manually.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 rounded-lg transition-colors shadow-2xs cursor-pointer"
          >
            <SlidersHorizontal className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            <span>Alert Settings</span>
          </button>

          <button
            onClick={handleCreateBulkRestock}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#006699] hover:bg-[#005580] rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>
              {selectedIds.length > 0
                ? `Restock Selected (${selectedIds.length})`
                : "Restock"}
            </span>
          </button>
        </div>
      </div>

      {/* 3 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Critical Stock Card (Peach / Red Alert Background) */}
        <div className="bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-xl p-5 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-rose-300">
              CRITICAL STOCK
            </span>
            <div className="p-2 bg-rose-100/90 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 rounded-full">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-2 font-mono">
            {stats.critical}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-rose-700 dark:text-rose-300 font-semibold mt-1">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
            <span>Below 5 units</span>
          </div>
        </div>

        {/* Low Stock Threshold Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              LOW STOCK (THRESHOLD)
            </span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-full">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-2 font-mono">
            {stats.lowStock}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            <Info className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
            <span>Action required soon</span>
          </div>
        </div>

        {/* Pending Restock Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              PENDING RESTOCK
            </span>
            <div className="p-2 bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 rounded-full">
              <Truck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-2 font-mono">
            {alerts.length}
          </div>
          <Link
            href="/products?restock=1"
            className="inline-flex items-center gap-1 text-xs text-[#0284c7] dark:text-sky-400 font-semibold hover:underline mt-1"
          >
            <span>Go to Restock</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
        {/* Filter Pills & Sort Toolbar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
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
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  filterTab === tab.id
                    ? "bg-[#006699] text-white shadow-2xs"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span className="text-slate-400 dark:text-slate-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-sky-500"
            >
              <option value="urgency">Urgency (High to Low)</option>
              <option value="stock_asc">Stock Level (Lowest First)</option>
              <option value="name">Product Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Alerts Table */}
        <PageState loading={loading} error={error} onRetry={refetch}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-[13px]">
            <thead className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredAlerts.length > 0 &&
                      selectedIds.length === filteredAlerts.length
                    }
                    onChange={handleToggleSelectAll}
                    className="h-4 w-4 rounded text-[#006699] border-slate-300 dark:border-slate-600 focus:ring-[#006699]"
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
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
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
                          ? "bg-rose-50/35 dark:bg-rose-950/20 hover:bg-rose-50/60 dark:hover:bg-rose-950/30"
                          : "hover:bg-slate-50/60 dark:hover:bg-slate-800/50"
                      } ${isSelected ? "ring-1 ring-inset ring-sky-300 dark:ring-sky-600" : ""}`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(item.id)}
                          className="h-4 w-4 rounded text-[#006699] border-slate-300 dark:border-slate-600 focus:ring-[#006699]"
                        />
                      </td>

                      {/* Product Details with icon */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                            {item.iconType === "capsule" && <Pill className="h-4 w-4" />}
                            {item.iconType === "tablet" && <HeartPulse className="h-4 w-4" />}
                            {item.iconType === "gauze" && <Bandage className="h-4 w-4" />}
                            {item.iconType === "pill" && <Pill className="h-4 w-4" />}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800 dark:text-slate-200 text-[13px]">
                              {item.name}
                            </div>
                            <div className="text-[11px] text-slate-400 dark:text-slate-500">
                              Batch: {item.sku || "—"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400 font-medium text-[11px]">
                        {item.sku}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                        {item.category}
                      </td>

                      {/* Status / Stock */}
                      <td className="py-3.5 px-5 text-center">
                        <div className="inline-flex flex-col items-center gap-0.5">
                          {isCritical ? (
                            <>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300">
                                Critical
                              </span>
                              <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-xs">
                                {item.currentStock} {item.unitType}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                                Low Stock
                              </span>
                              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">
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
                              className="w-14 px-1.5 py-0.5 text-xs font-mono font-bold border border-sky-400 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded"
                            />
                            <button
                              onClick={() => handleSaveThreshold(item.id)}
                              className="p-1 bg-sky-600 text-white rounded text-[10px] font-bold cursor-pointer"
                            >
                              ✓
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartEditThreshold(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-medium hover:border-sky-400 dark:hover:border-sky-500 hover:bg-sky-50/50 dark:hover:bg-sky-950/50 transition-colors cursor-pointer"
                            title="Edit Minimum Threshold"
                          >
                            <span>{item.threshold}</span>
                            <Pencil className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => handleRestockSingle(item)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#006699] hover:bg-[#005580] rounded-lg transition-colors shadow-2xs cursor-pointer"
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
        </PageState>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div>Showing 1-{filteredAlerts.length} of {alerts.length} items</div>
          <div className="flex items-center gap-3">
            <button className="p-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 cursor-pointer">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-medium text-slate-700 dark:text-slate-300">Page 1 of 1</span>
            <button className="p-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Alert Settings Modal */}
      <AlertSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialSettings={stockAlertSettings}
        onSave={async (settings) => {
          const saved = await saveAlertSettings(settings);
          if (saved) {
            refetchAlertSettings();
            showToast("Alert threshold settings updated successfully");
          } else {
            showToast("Failed to update alert settings");
          }
        }}
      />
    </div>
  );
}
