"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  Timer,
  Calendar,
  Recycle,
  Download,
  Bell,
  Search,
  Trash2,
  Truck,
  Tag,
  Eye,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import ReportsNavTabs from "@/components/reports/reports-nav-tabs";
import ExpiryForecastChart from "@/components/reports/expiry-forecast-chart";
import ExpiryCategoryDonut from "@/components/reports/expiry-category-donut";
import SetExpiryAlertsModal from "@/components/reports/set-expiry-alerts-modal";
import { getExpiryReport, getExpiringInventory, getExpiryAlertSettings, updateExpiryAlertSettings } from "@/lib/api";
import { unwrapData } from "@/lib/api/client";
import { useApi, useMutation } from "@/lib/hooks/use-api";
import { PageState, InlineError } from "@/components/ui/page-state";
import type { InventoryItem } from "@/lib/types";

interface ExpiryItem {
  id: string;
  product: string;
  batchNo: string;
  expiryDate: string;
  status: "EXPIRED" | "14 DAYS" | "26 DAYS" | "70 DAYS" | "90 DAYS";
  qty: number;
  value: string;
  actionType: "dispose" | "return" | "clearance" | "monitor";
}

interface ExpiryStats {
  expiredUnits: number;
  expiredValue: string;
  expiringUnder30Units: number;
  expiringUnder30Value: string;
  expiring30to90Units: number;
  expiring30to90Value: string;
  wasteReduction: string;
  wasteSavings: string;
}

const EMPTY_EXPIRY_STATS: ExpiryStats = {
  expiredUnits: 0,
  expiredValue: "0.00 ETB",
  expiringUnder30Units: 0,
  expiringUnder30Value: "0.00 ETB",
  expiring30to90Units: 0,
  expiring30to90Value: "0.00 ETB",
  wasteReduction: "0%",
  wasteSavings: "0 ETB YTD",
};

function daysUntil(dateStr: string): number {
  const expiry = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatValue(value: unknown): string {
  if (typeof value === "string") {
    return value.includes("ETB") || value.includes("$") ? value : `${value} ETB`;
  }
  if (typeof value === "number") {
    return `${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`;
  }
  return "0.00 ETB";
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^0-9.-]/g, ""));
    if (!Number.isNaN(parsed)) return parsed;
  }
  return fallback;
}

function expiryStatus(daysLeft: number): ExpiryItem["status"] {
  if (daysLeft < 0) return "EXPIRED";
  if (daysLeft <= 14) return "14 DAYS";
  if (daysLeft <= 26) return "26 DAYS";
  if (daysLeft <= 70) return "70 DAYS";
  return "90 DAYS";
}

function actionTypeFor(daysLeft: number): ExpiryItem["actionType"] {
  if (daysLeft < 0) return "dispose";
  if (daysLeft <= 14) return "return";
  if (daysLeft <= 30) return "clearance";
  return "monitor";
}

function mapInventoryToExpiryItem(item: InventoryItem): ExpiryItem {
  const daysLeft = daysUntil(item.expiryDate);
  const stockValue = toNumber(item.unitPrice) * item.stock;

  return {
    id: item.id,
    product: item.name,
    batchNo: item.batchNo,
    expiryDate: formatDate(item.expiryDate),
    status: expiryStatus(daysLeft),
    qty: item.stock,
    value: formatValue(stockValue || item.unitPrice),
    actionType: actionTypeFor(daysLeft),
  };
}

function parseExpiryStats(raw: unknown): ExpiryStats {
  const data = unwrapData<Record<string, unknown>>(raw);
  const stats = (data.stats ?? data) as Record<string, unknown>;

  return {
    expiredUnits: toNumber(stats.expiredUnits ?? stats.expiredStock ?? stats.expired_units),
    expiredValue: formatValue(stats.expiredValue ?? stats.expired_value ?? 0),
    expiringUnder30Units: toNumber(
      stats.expiringUnder30Units ?? stats.expiringUnder30 ?? stats.expiring_under_30
    ),
    expiringUnder30Value: formatValue(
      stats.expiringUnder30Value ?? stats.expiring_under_30_value ?? 0
    ),
    expiring30to90Units: toNumber(
      stats.expiring30to90Units ?? stats.expiring30to90 ?? stats.expiring_30_90
    ),
    expiring30to90Value: formatValue(
      stats.expiring30to90Value ?? stats.expiring_30_90_value ?? 0
    ),
    wasteReduction: String(stats.wasteReduction ?? stats.waste_reduction ?? "0%"),
    wasteSavings: String(stats.wasteSavings ?? stats.waste_savings ?? "0 ETB YTD"),
  };
}

export default function ExpiryAnalyticsPage() {
  const [batchSearch, setBatchSearch] = useState("");
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  const {
    data: expiryReportRaw,
    loading: reportLoading,
    error: reportError,
    refetch: refetchReport,
  } = useApi(getExpiryReport);

  const {
    data: inventoryData,
    loading: inventoryLoading,
    error: inventoryError,
    refetch: refetchInventory,
  } = useApi(getExpiringInventory);

  const { data: expiryAlertSettings, refetch: refetchExpiryAlertSettings } = useApi(
    getExpiryAlertSettings,
    []
  );
  const { mutate: saveExpiryAlertSettings } = useMutation(updateExpiryAlertSettings);

  const stats = useMemo(
    () => (expiryReportRaw ? parseExpiryStats(expiryReportRaw) : EMPTY_EXPIRY_STATS),
    [expiryReportRaw]
  );

  const items = useMemo(() => {
    return (inventoryData ?? [])
      .map(mapInventoryToExpiryItem)
      .filter((item) => !removedIds.has(item.id));
  }, [inventoryData, removedIds]);

  const filteredItems = useMemo(() => {
    if (!batchSearch.trim()) return items;
    const q = batchSearch.toLowerCase();
    return items.filter(
      (i) =>
        i.batchNo.toLowerCase().includes(q) ||
        i.product.toLowerCase().includes(q)
    );
  }, [items, batchSearch]);

  const isLoading = reportLoading || inventoryLoading;
  const hasError = reportError || inventoryError;
  const errorMessage = reportError || inventoryError;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAction = (item: ExpiryItem) => {
    if (item.actionType === "dispose") {
      setRemovedIds((prev) => new Set(prev).add(item.id));
      showToast(`Logged safe disposal for ${item.product} (Batch: ${item.batchNo})`);
    } else if (item.actionType === "return") {
      showToast(`Initiated vendor return request for ${item.product}`);
    } else if (item.actionType === "clearance") {
      showToast(`Applied 30% clearance discount for ${item.product} in POS`);
    } else {
      showToast(`Flagged ${item.product} for weekly monitoring`);
    }
  };

  const handleExportReport = () => {
    const csvContent =
      "Product,Batch No,Expiry Date,Status,Quantity,Value\n" +
      filteredItems
        .map(
          (i) =>
            `"${i.product}","${i.batchNo}","${i.expiryDate}","${i.status}",${i.qty},"${i.value}"`
        )
        .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Expiry_Risk_Report_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("Exported expiry risk report CSV");
  };

  const handleRetry = () => {
    refetchReport();
    refetchInventory();
  };

  return (
    <div className="space-y-6">
      <ReportsNavTabs />

      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-xl shadow-lg border border-slate-700 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Expiry Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor approaching medication expirations and reduce dead stock losses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <span>Export Report</span>
          </button>

          <button
            onClick={() => setIsAlertsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#006699] hover:bg-[#005580] rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Bell className="h-4 w-4" />
            <span>Set Alerts</span>
          </button>
        </div>
      </div>

      {hasError && !isLoading && (
        <InlineError message={errorMessage ?? "Failed to load expiry data."} />
      )}

      <PageState loading={isLoading} error={null} onRetry={handleRetry}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  EXPIRED STOCK
                </span>
                <div className="p-2 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-lg">
                  <AlertTriangle className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl lg:text-[26px] font-extrabold text-slate-800 dark:text-slate-100 font-mono mt-2">
                {stats.expiredUnits} Units
              </div>
              <div className="text-xs text-rose-600 dark:text-rose-400 font-semibold mt-1">
                Value: {stats.expiredValue}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  EXPIRING &lt; 30 DAYS
                </span>
                <div className="p-2 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-lg">
                  <Timer className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl lg:text-[26px] font-extrabold text-slate-800 dark:text-slate-100 font-mono mt-2">
                {stats.expiringUnder30Units} Units
              </div>
              <div className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-1">
                Value: {stats.expiringUnder30Value}
              </div>
              <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1">
                ↑ Action Required
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  EXPIRING 30-90 DAYS
                </span>
                <div className="p-2 bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 rounded-lg">
                  <Calendar className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl lg:text-[26px] font-extrabold text-slate-800 dark:text-slate-100 font-mono mt-2">
                {stats.expiring30to90Units} Units
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">
                Value: {stats.expiring30to90Value}
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-1">
                Monitor closely
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  WASTE REDUCTION
                </span>
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  <Recycle className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl lg:text-[26px] font-extrabold text-slate-800 dark:text-slate-100 font-mono mt-2">
                {stats.wasteReduction}
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                Savings: {stats.wasteSavings}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-7">
              <ExpiryForecastChart data={expiryReportRaw} loading={reportLoading} />
            </div>
            <div className="lg:col-span-5">
              <ExpiryCategoryDonut data={expiryReportRaw} loading={reportLoading} />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                High-Risk Inventory Actions
              </h3>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter batch..."
                  value={batchSearch}
                  onChange={(e) => setBatchSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-sky-500"
                />
              </div>
            </div>

            <PageState
              loading={false}
              error={null}
              empty={filteredItems.length === 0}
              emptyMessage="No high-risk batch items found."
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-[13px]">
                  <thead className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="py-3.5 px-6">PRODUCT</th>
                      <th className="py-3.5 px-4 font-mono">BATCH #</th>
                      <th className="py-3.5 px-5">EXPIRY DATE</th>
                      <th className="py-3.5 px-4 text-center">STATUS</th>
                      <th className="py-3.5 px-4 text-center font-mono">QTY</th>
                      <th className="py-3.5 px-5 text-right font-mono">VALUE</th>
                      <th className="py-3.5 px-6 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3.5 px-6 font-semibold text-slate-800 dark:text-slate-200">
                          {item.product}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400 font-medium">
                          {item.batchNo}
                        </td>
                        <td className="py-3.5 px-5 font-medium">
                          <span
                            className={
                              item.status === "EXPIRED"
                                ? "text-rose-600 dark:text-rose-400 font-bold"
                                : item.status.includes("DAYS") && parseInt(item.status) <= 30
                                ? "text-amber-600 dark:text-amber-400 font-semibold"
                                : "text-slate-600 dark:text-slate-400"
                            }
                          >
                            {item.expiryDate}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {item.status === "EXPIRED" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
                              EXPIRED
                            </span>
                          )}
                          {item.status === "14 DAYS" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                              14 DAYS
                            </span>
                          )}
                          {item.status === "26 DAYS" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                              26 DAYS
                            </span>
                          )}
                          {item.status === "70 DAYS" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              70 DAYS
                            </span>
                          )}
                          {item.status === "90 DAYS" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              90 DAYS
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-700 dark:text-slate-300">
                          {item.qty}
                        </td>
                        <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-800 dark:text-slate-100">
                          {item.value}
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          {item.actionType === "dispose" && (
                            <button
                              onClick={() => handleAction(item)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Dispose</span>
                            </button>
                          )}
                          {item.actionType === "return" && (
                            <button
                              onClick={() => handleAction(item)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950/50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                            >
                              <Truck className="h-3.5 w-3.5" />
                              <span>Return</span>
                            </button>
                          )}
                          {item.actionType === "clearance" && (
                            <button
                              onClick={() => handleAction(item)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950/50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                            >
                              <Tag className="h-3.5 w-3.5" />
                              <span>Clearance</span>
                            </button>
                          )}
                          {item.actionType === "monitor" && (
                            <button
                              onClick={() => handleAction(item)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>Monitor</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </PageState>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div>
                Showing 1 to {filteredItems.length} of {filteredItems.length} entries
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="p-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </PageState>

      <SetExpiryAlertsModal
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
        initialSettings={expiryAlertSettings}
        onSave={async (settings) => {
          const saved = await saveExpiryAlertSettings(settings);
          if (saved) {
            refetchExpiryAlertSettings();
            showToast("Expiry alert rules saved");
          } else {
            showToast("Failed to save expiry alert rules");
          }
        }}
      />
    </div>
  );
}
