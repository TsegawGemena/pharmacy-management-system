"use client";

import React, { useState, useMemo } from "react";
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
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import ReportsNavTabs from "@/components/reports/reports-nav-tabs";
import ExpiryForecastChart from "@/components/reports/expiry-forecast-chart";
import ExpiryCategoryDonut from "@/components/reports/expiry-category-donut";
import SetExpiryAlertsModal from "@/components/reports/set-expiry-alerts-modal";

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

const INITIAL_EXPIRY_ITEMS: ExpiryItem[] = [
  {
    id: "1",
    product: "Amoxicillin 500mg Caps",
    batchNo: "BX-7892",
    expiryDate: "Oct 15, 2023",
    status: "EXPIRED",
    qty: 24,
    value: "$120.00",
    actionType: "dispose",
  },
  {
    id: "2",
    product: "Lisinopril 10mg Tabs",
    batchNo: "LS-4410",
    expiryDate: "Nov 10, 2023",
    status: "14 DAYS",
    qty: 85,
    value: "$425.50",
    actionType: "return",
  },
  {
    id: "3",
    product: "Metformin 850mg Tabs",
    batchNo: "MF-9021",
    expiryDate: "Nov 22, 2023",
    status: "26 DAYS",
    qty: 120,
    value: "$360.00",
    actionType: "clearance",
  },
  {
    id: "4",
    product: "Atorvastatin 20mg Tabs",
    batchNo: "AT-1105",
    expiryDate: "Jan 05, 2024",
    status: "70 DAYS",
    qty: 450,
    value: "$1,800.00",
    actionType: "monitor",
  },
  {
    id: "5",
    product: "Ciprofloxacin 500mg",
    batchNo: "CP-3319",
    expiryDate: "Nov 02, 2023",
    status: "14 DAYS",
    qty: 50,
    value: "$210.00",
    actionType: "clearance",
  },
  {
    id: "6",
    product: "Omeprazole 20mg Caps",
    batchNo: "OM-8821",
    expiryDate: "Jan 20, 2024",
    status: "70 DAYS",
    qty: 180,
    value: "$540.00",
    actionType: "monitor",
  },
];

export default function ExpiryAnalyticsPage() {
  const [items, setItems] = useState<ExpiryItem[]>(INITIAL_EXPIRY_ITEMS);
  const [batchSearch, setBatchSearch] = useState("");
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAction = (item: ExpiryItem) => {
    if (item.actionType === "dispose") {
      setItems((prev) => prev.filter((i) => i.id !== item.id));
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
      items
        .map(
          (i) =>
            `"${i.product}","${i.batchNo}","${i.expiryDate}","${i.status}",${i.qty},"${i.value}"`
        )
        .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Expiry_Risk_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Exported expiry risk report CSV");
  };

  const filteredItems = useMemo(() => {
    if (!batchSearch.trim()) return items;
    const q = batchSearch.toLowerCase();
    return items.filter(
      (i) =>
        i.batchNo.toLowerCase().includes(q) ||
        i.product.toLowerCase().includes(q)
    );
  }, [items, batchSearch]);

  return (
    <div className="space-y-6">
      {/* Sub Navigation Tabs */}
      <ReportsNavTabs />

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

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* EXPIRED STOCK */}
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
            42 Units
          </div>
          <div className="text-xs text-rose-600 dark:text-rose-400 font-semibold mt-1">
            Value: $1,245.00
          </div>
          <div className="text-[11px] text-rose-500 dark:text-rose-400 font-medium mt-1 flex items-center gap-1">
            <span>↑ 12% vs last month</span>
          </div>
        </div>

        {/* EXPIRING < 30 DAYS */}
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
            156 Units
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-1">
            Value: $4,890.50
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1">
            ↑ Action Required
          </div>
        </div>

        {/* EXPIRING 30-90 DAYS */}
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
            342 Units
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">
            Value: $12,400.00
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-1">
            Monitor closely
          </div>
        </div>

        {/* WASTE REDUCTION */}
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
            18.5%
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            Savings: $3,200 YTD
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            ↑ 4% improvement
          </div>
        </div>
      </div>

      {/* Middle Row: 6-Month Expiry Forecast (60%) + Risk by Category (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7">
          <ExpiryForecastChart />
        </div>
        <div className="lg:col-span-5">
          <ExpiryCategoryDonut />
        </div>
      </div>

      {/* Bottom Row: High-Risk Inventory Actions Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
        {/* Toolbar with Search */}
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

        {/* Actions Table */}
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
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                    No high-risk batch items found.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                    {/* Product Name */}
                    <td className="py-3.5 px-6 font-semibold text-slate-800 dark:text-slate-200">
                      {item.product}
                    </td>

                    {/* Batch No */}
                    <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400 font-medium">
                      {item.batchNo}
                    </td>

                    {/* Expiry Date */}
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

                    {/* Status Badge */}
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
                    </td>

                    {/* Qty */}
                    <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-700 dark:text-slate-300">
                      {item.qty}
                    </td>

                    {/* Value */}
                    <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-800 dark:text-slate-100">
                      {item.value}
                    </td>

                    {/* Action Button */}
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div>Showing 1 to {filteredItems.length} of 28 entries</div>
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

      {/* Set Expiry Alerts Modal */}
      <SetExpiryAlertsModal
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
        onSave={() => showToast("Expiry alert rules saved")}
      />
    </div>
  );
}
