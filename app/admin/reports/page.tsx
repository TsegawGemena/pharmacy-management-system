"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  DollarSign,
  Receipt,
  RotateCw,
  TrendingUp,
  Wallet,
} from "lucide-react";
import AdminHeader from "@/components/admin/admin-header";
import CategoryDonutChart from "@/components/reports/category-donut-chart";
import RevenueProfitChart from "@/components/reports/revenue-profit-chart";
import {
  getCategoryReport,
  getExpiryReport,
  getRevenueProfitReport,
  getSalesReport,
} from "@/lib/api";
import { unwrapData } from "@/lib/api/client";
import { useApi } from "@/lib/hooks/use-api";
import { PageState } from "@/components/ui/page-state";

type ReportRange = "today" | "week" | "month";

type SalesSummary = {
  totalRevenue: number;
  netProfit: number;
  avgTransaction: number;
  inventoryTurnover: number;
  profitMargin: number;
  topProducts: Record<string, unknown>[];
  lowTurnover: Record<string, unknown>[];
};

type ExpirySummary = {
  expired: number;
  expiringSoon: number;
  ok: number;
};

const EMPTY_SALES: SalesSummary = {
  totalRevenue: 0,
  netProfit: 0,
  avgTransaction: 0,
  inventoryTurnover: 0,
  profitMargin: 0,
  topProducts: [],
  lowTurnover: [],
};

const EMPTY_EXPIRY: ExpirySummary = {
  expired: 0,
  expiringSoon: 0,
  ok: 0,
};

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, ""));
    if (!Number.isNaN(parsed)) return parsed;
  }
  return fallback;
}

function parseSalesReport(raw: unknown): SalesSummary {
  if (raw == null) return EMPTY_SALES;

  const unwrapped = unwrapData<Record<string, unknown> | null>(raw);
  const data =
    unwrapped && typeof unwrapped === "object" ? unwrapped : {};

  return {
    totalRevenue: toNumber(data.totalRevenue ?? data.total_revenue),
    netProfit: toNumber(data.netProfit ?? data.net_profit),
    avgTransaction: toNumber(data.avgTransaction ?? data.avg_transaction),
    inventoryTurnover: toNumber(data.inventoryTurnover ?? data.inventory_turnover),
    profitMargin: toNumber(data.profitMargin ?? data.profit_margin),
    topProducts: (Array.isArray(data.topProducts)
      ? data.topProducts
      : Array.isArray(data.top_products)
        ? data.top_products
        : []) as Record<string, unknown>[],
    lowTurnover: (Array.isArray(data.lowTurnover)
      ? data.lowTurnover
      : Array.isArray(data.low_turnover)
        ? data.low_turnover
        : []) as Record<string, unknown>[],
  };
}

function parseExpiryReport(raw: unknown): ExpirySummary {
  if (raw == null) return EMPTY_EXPIRY;

  const unwrapped = unwrapData<Record<string, unknown> | null>(raw);
  const data =
    unwrapped && typeof unwrapped === "object" ? unwrapped : {};
  const counts =
    data.counts && typeof data.counts === "object"
      ? (data.counts as Record<string, unknown>)
      : {};

  return {
    expired: toNumber(counts.expired),
    expiringSoon: toNumber(counts.expiringSoon ?? counts.expiring_soon),
    ok: toNumber(counts.ok ?? counts.healthy),
  };
}

function formatEtb(value: number): string {
  return `ETB ${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export default function AdminReportsPage() {
  const [range, setRange] = useState<ReportRange>("week");

  const {
    data: salesRaw,
    loading: salesLoading,
    error: salesError,
    refetch: refetchSales,
  } = useApi(() => getSalesReport(range), [range]);

  const { data: categoryRaw, loading: catLoading } = useApi(getCategoryReport);
  const { data: revenueRaw, loading: revLoading } = useApi(getRevenueProfitReport);
  const { data: expiryRaw, loading: expLoading } = useApi(getExpiryReport);

  const sales = useMemo(() => parseSalesReport(salesRaw), [salesRaw]);

  const expiry = useMemo(() => parseExpiryReport(expiryRaw), [expiryRaw]);

  const loading = salesLoading || catLoading || revLoading || expLoading;

  return (
    <div>
      <AdminHeader
        title="Reports"
        subtitle="Operational analytics for inventory, sales, and performance."
        searchPlaceholder="Search reports..."
      />

      <div className="flex items-center gap-2 mb-5">
        {(["today", "week", "month"] as ReportRange[]).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${
              range === r
                ? "bg-[#006699] text-white"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <PageState loading={loading && !salesRaw} error={salesError} onRetry={refetchSales}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            {
              label: "Total Revenue",
              value: formatEtb(sales.totalRevenue),
              icon: DollarSign,
            },
            {
              label: "Net Profit",
              value: formatEtb(sales.netProfit),
              icon: Wallet,
            },
            {
              label: "Avg Transaction",
              value: formatEtb(sales.avgTransaction),
              icon: Receipt,
            },
            {
              label: "Turnover",
              value: sales.inventoryTurnover.toFixed(2),
              icon: RotateCw,
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">
                    {card.label}
                  </p>
                  <Icon className="h-4 w-4 text-[#006699]" />
                </div>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {card.value}
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#006699]" />
              Revenue & profit
            </h3>
            <RevenueProfitChart data={revenueRaw} loading={revLoading} />
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="text-sm font-bold mb-3">Sales by category</h3>
            <CategoryDonutChart data={categoryRaw} loading={catLoading} />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Expiry risk
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-slate-500">Expired</span>
                <span className="font-bold text-rose-600">{expiry.expired}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-500">Expiring soon</span>
                <span className="font-bold text-amber-600">
                  {expiry.expiringSoon}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-500">Healthy</span>
                <span className="font-bold text-emerald-600">{expiry.ok}</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="text-sm font-bold mb-3">Top products</h3>
            {sales.topProducts.length === 0 ? (
              <p className="text-sm text-slate-400">No sales in this range</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-slate-400 text-left">
                  <tr>
                    <th className="pb-2">Product</th>
                    <th className="pb-2">Units</th>
                    <th className="pb-2 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.topProducts.map((p) => (
                    <tr
                      key={String(p.name)}
                      className="border-t border-slate-100 dark:border-slate-800"
                    >
                      <td className="py-2 font-medium">{String(p.name)}</td>
                      <td className="py-2">
                        {String(p.unitsSold ?? p.sold ?? 0)}
                      </td>
                      <td className="py-2 text-right font-semibold">
                        {formatEtb(toNumber(p.revenue))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </PageState>
    </div>
  );
}
