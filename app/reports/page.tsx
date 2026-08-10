"use client";

import React, { useState } from "react";
import {
  DollarSign,
  Wallet,
  Receipt,
  RotateCw,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Download,
  CheckCircle2,
} from "lucide-react";
import ReportsNavTabs from "@/components/reports/reports-nav-tabs";
import RevenueProfitChart from "@/components/reports/revenue-profit-chart";
import CategoryDonutChart from "@/components/reports/category-donut-chart";

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExportData = () => {
    const csvContent =
      "Report,Metric,Value,Period\n" +
      "Financial,Total Revenue,742500 ETB,Last 30 Days\n" +
      "Financial,Net Profit,185625 ETB,Last 30 Days\n" +
      "Financial,Avg Transaction,420 ETB,Last 30 Days\n" +
      "Inventory,Inventory Turnover,4.2x,Last 30 Days\n" +
      "Top Product,Amoxicillin 500mg Caps,148800 ETB,+15%\n" +
      "Top Product,Paracetamol 500mg Tabs,62000 ETB,+8%\n" +
      "Top Product,Ibuprofen 400mg Tabs,58800 ETB,+12%\n" +
      "Top Product,Ceftriaxone 1g Inj,105000 ETB,+2%\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Pharmacy_Analytics_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Exported reports & analytics CSV");
  };

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
            Reports & Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Detailed insights into pharmacy performance and inventory trends.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Range Dropdown */}
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="pl-8 pr-4 py-2 text-xs sm:text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-sky-500 shadow-2xs"
            >
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="This Quarter">This Quarter</option>
              <option value="This Year">This Year</option>
            </select>
            <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Export Data Button */}
          <button
            onClick={handleExportData}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#006699] hover:bg-[#005580] rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL REVENUE */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              TOTAL REVENUE
            </span>
            <div className="p-2 bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 rounded-lg">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-mono">
              742,500
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">ETB</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+12% vs last period</span>
          </div>
        </div>

        {/* NET PROFIT */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              NET PROFIT
            </span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-mono">
              185,625
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">ETB</span>
          </div>
          <div className="mt-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60">
              25% margin
            </span>
          </div>
        </div>

        {/* AVG TRANSACTION */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              AVG TRANSACTION
            </span>
            <div className="p-2 bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 rounded-lg">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-mono">
              420
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">ETB</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+5% vs last period</span>
          </div>
        </div>

        {/* INVENTORY TURNOVER */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              INVENTORY TURNOVER
            </span>
            <div className="p-2 bg-orange-50 dark:bg-orange-950/60 text-orange-500 dark:text-orange-400 rounded-lg">
              <RotateCw className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-mono">
              4.2x
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
            <span>Slightly below target (4.5x)</span>
          </div>
        </div>
      </div>

      {/* Middle Row: Revenue vs Profit (60%) + Stock Value by Category (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7">
          <RevenueProfitChart />
        </div>
        <div className="lg:col-span-5">
          <CategoryDonutChart />
        </div>
      </div>

      {/* Bottom Row: Top Performing Products (50%) + Low Turnover / Dead Stock (50%) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Top Performing Products */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              Top Performing Products
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Highest revenue drivers this period.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-[13px]">
              <thead className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-5">PRODUCT NAME</th>
                  <th className="py-3 px-4 text-center font-mono">UNITS SOLD</th>
                  <th className="py-3 px-4 text-right font-mono">REVENUE (ETB)</th>
                  <th className="py-3 px-5 text-right font-mono">GROWTH</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  {
                    name: "Amoxicillin 500mg Caps",
                    sold: "1,240",
                    revenue: "148,800",
                    growth: "+15%",
                  },
                  {
                    name: "Paracetamol 500mg Tabs",
                    sold: "3,100",
                    revenue: "62,000",
                    growth: "+8%",
                  },
                  {
                    name: "Ibuprofen 400mg Tabs",
                    sold: "980",
                    revenue: "58,800",
                    growth: "+12%",
                  },
                  {
                    name: "Ceftriaxone 1g Inj",
                    sold: "420",
                    revenue: "105,000",
                    growth: "+2%",
                  },
                ].map((item) => (
                  <tr key={item.name} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-800 dark:text-slate-200">
                      {item.name}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-700 dark:text-slate-300">
                      {item.sold}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800 dark:text-slate-100">
                      {item.revenue}
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {item.growth}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Turnover / Dead Stock */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              Low Turnover / Dead Stock
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Items tying up capital with slow movement.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-[13px]">
              <thead className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-5">PRODUCT NAME</th>
                  <th className="py-3 px-4 text-center font-mono">STOCK QTY</th>
                  <th className="py-3 px-4 text-right font-mono">VALUE (ETB)</th>
                  <th className="py-3 px-5 text-center">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  {
                    name: "Specialized Knee Brace (L)",
                    qty: 12,
                    value: "24,000",
                    status: "Overstocked",
                    statusStyle: "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60",
                  },
                  {
                    name: "Rare Herbal Supp. X",
                    qty: 45,
                    value: "13,500",
                    status: "Slow Moving",
                    statusStyle: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60",
                  },
                  {
                    name: "Obsolete Test Kit A",
                    qty: 8,
                    value: "4,000",
                    status: "Near Expiry",
                    statusStyle: "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60",
                  },
                  {
                    name: "Niche Derm Cream",
                    qty: 20,
                    value: "18,000",
                    status: "Slow Moving",
                    statusStyle: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60",
                  },
                ].map((item) => (
                  <tr key={item.name} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-800 dark:text-slate-200">
                      {item.name}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-700 dark:text-slate-300">
                      {item.qty}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800 dark:text-slate-100">
                      {item.value}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${item.statusStyle}`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
