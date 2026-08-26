"use client";

import React, { useMemo, useState } from "react";
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
import {
  getCategoryReport,
  getRevenueProfitReport,
  getSalesReport,
} from "@/lib/api";
import { unwrapData } from "@/lib/api/client";
import { useApi } from "@/lib/hooks/use-api";
import { PageState, InlineError } from "@/components/ui/page-state";

type ReportRange = "today" | "week" | "month";

interface TopProductRow {
  name: string;
  sold: string;
  revenue: string;
  growth: string;
}

interface LowTurnoverRow {
  name: string;
  qty: number;
  value: string;
  status: string;
  statusStyle: string;
}

interface SalesReportView {
  totalRevenue: number;
  netProfit: number;
  avgTransaction: number;
  inventoryTurnover: number;
  revenueChange?: number;
  profitMargin?: number;
  avgTransactionChange?: number;
  turnoverTarget?: number;
  topProducts: TopProductRow[];
  lowTurnover: LowTurnoverRow[];
}

const EMPTY_SALES_REPORT: SalesReportView = {
  totalRevenue: 0,
  netProfit: 0,
  avgTransaction: 0,
  inventoryTurnover: 0,
  revenueChange: 0,
  profitMargin: 0,
  avgTransactionChange: 0,
  turnoverTarget: 0,
  topProducts: [],
  lowTurnover: [],
};

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, ""));
    if (!Number.isNaN(parsed)) return parsed;
  }
  return fallback;
}

function formatNumber(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function statusStyleFor(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized.includes("overstock") || normalized.includes("expiry")) {
    return "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60";
  }
  return "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60";
}

function parseSalesReport(raw: unknown): SalesReportView {
  if (raw == null) return EMPTY_SALES_REPORT;

  const unwrapped = unwrapData<Record<string, unknown> | null>(raw);
  const data =
    unwrapped && typeof unwrapped === "object" ? unwrapped : {};

  const topProductsRaw = (data.topProducts ?? data.top_products) as
    | Record<string, unknown>[]
    | undefined;
  const lowTurnoverRaw = (data.lowTurnover ?? data.low_turnover ?? data.deadStock) as
    | Record<string, unknown>[]
    | undefined;

  const topProducts =
    Array.isArray(topProductsRaw) && topProductsRaw.length > 0
      ? topProductsRaw.map((item) => ({
          name: String(item.name ?? item.product ?? "Unknown"),
          sold: formatNumber(toNumber(item.unitsSold ?? item.units_sold ?? item.sold)),
          revenue: formatNumber(toNumber(item.revenue ?? item.totalRevenue)),
          growth: String(item.growth ?? item.change ?? "+0%"),
        }))
      : [];

  const lowTurnover =
    Array.isArray(lowTurnoverRaw) && lowTurnoverRaw.length > 0
      ? lowTurnoverRaw.map((item) => {
          const status = String(item.status ?? "Slow Moving");
          return {
            name: String(item.name ?? item.product ?? "Unknown"),
            qty: toNumber(item.stockQty ?? item.stock_qty ?? item.qty),
            value: formatNumber(toNumber(item.value ?? item.stockValue)),
            status,
            statusStyle: statusStyleFor(status),
          };
        })
      : [];

  return {
    totalRevenue: toNumber(data.totalRevenue ?? data.total_revenue),
    netProfit: toNumber(data.netProfit ?? data.net_profit),
    avgTransaction: toNumber(data.avgTransaction ?? data.avg_transaction),
    inventoryTurnover: toNumber(data.inventoryTurnover ?? data.inventory_turnover),
    revenueChange: toNumber(data.revenueChange ?? data.revenue_change),
    profitMargin: toNumber(data.profitMargin ?? data.profit_margin),
    avgTransactionChange: toNumber(data.avgTransactionChange ?? data.avg_transaction_change),
    turnoverTarget: toNumber(data.turnoverTarget ?? data.turnover_target),
    topProducts,
    lowTurnover,
  };
}

function mapDateRangeToApi(range: string): ReportRange {
  if (range === "Last 7 Days") return "week";
  if (range === "This Quarter" || range === "This Year") return "month";
  return "month";
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const apiRange = mapDateRangeToApi(dateRange);

  const {
    data: salesRaw,
    loading: salesLoading,
    error: salesError,
    refetch: refetchSales,
  } = useApi(() => getSalesReport(apiRange), [apiRange]);

  const {
    data: revenueRaw,
    loading: revenueLoading,
    error: revenueError,
    refetch: refetchRevenue,
  } = useApi(getRevenueProfitReport);

  const {
    data: categoryRaw,
    loading: categoryLoading,
    error: categoryError,
    refetch: refetchCategory,
  } = useApi(getCategoryReport);

  const salesReport = useMemo(
    () => (salesRaw ? parseSalesReport(salesRaw) : null),
    [salesRaw]
  );

  const isLoading = salesLoading || revenueLoading || categoryLoading;
  const hasError = salesError || revenueError || categoryError;
  const errorMessage = salesError || revenueError || categoryError;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExportData = () => {
    const report = salesReport;
    const csvContent =
      "Report,Metric,Value,Period\n" +
      `Financial,Total Revenue,${report?.totalRevenue ?? 0} ETB,${dateRange}\n` +
      `Financial,Net Profit,${report?.netProfit ?? 0} ETB,${dateRange}\n` +
      `Financial,Avg Transaction,${report?.avgTransaction ?? 0} ETB,${dateRange}\n` +
      `Inventory,Inventory Turnover,${report?.inventoryTurnover ?? 0}x,${dateRange}\n` +
      (report?.topProducts ?? [])
        .map((item) => `Top Product,${item.name},${item.revenue} ETB,${item.growth}`)
        .join("\n") +
      "\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Pharmacy_Analytics_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("Exported reports & analytics CSV");
  };

  const handleRetry = () => {
    refetchSales();
    refetchRevenue();
    refetchCategory();
  };

  const report = salesReport ?? EMPTY_SALES_REPORT;

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
            Reports & Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Detailed insights into pharmacy performance and inventory trends.
          </p>
        </div>

        <div className="flex items-center gap-3">
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

          <button
            onClick={handleExportData}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#006699] hover:bg-[#005580] rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {hasError && !isLoading && (
        <InlineError message={errorMessage ?? "Failed to load report data."} />
      )}

      <PageState loading={isLoading} error={null} onRetry={handleRetry}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  {formatNumber(report.totalRevenue)}
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">ETB</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>+{report.revenueChange ?? 0}% vs last period</span>
              </div>
            </div>

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
                  {formatNumber(report.netProfit)}
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">ETB</span>
              </div>
              <div className="mt-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60">
                  {report.profitMargin ?? 25}% margin
                </span>
              </div>
            </div>

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
                  {formatNumber(report.avgTransaction)}
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">ETB</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>+{report.avgTransactionChange ?? 0}% vs last period</span>
              </div>
            </div>

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
                  {report.inventoryTurnover}x
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                <span>
                  {report.inventoryTurnover < (report.turnoverTarget ?? 4.5)
                    ? `Slightly below target (${report.turnoverTarget ?? 4.5}x)`
                    : `On target (${report.turnoverTarget ?? 4.5}x)`}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-7">
              <RevenueProfitChart data={revenueRaw} loading={revenueLoading} />
            </div>
            <div className="lg:col-span-5">
              <CategoryDonutChart data={categoryRaw} loading={categoryLoading} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
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
                    {report.topProducts.map((item) => (
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
                    {report.lowTurnover.map((item) => (
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
      </PageState>
    </div>
  );
}
