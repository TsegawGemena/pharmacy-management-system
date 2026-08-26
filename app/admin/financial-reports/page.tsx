"use client";

import React, { useMemo } from "react";
import { Banknote, CreditCard, PieChart, Smartphone } from "lucide-react";
import AdminHeader from "@/components/admin/admin-header";
import RevenueProfitChart from "@/components/reports/revenue-profit-chart";
import { getInvoices, getRevenueProfitReport, getSalesReport } from "@/lib/api";
import { unwrapData } from "@/lib/api/client";
import { useApi } from "@/lib/hooks/use-api";
import { PageState } from "@/components/ui/page-state";

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, ""));
    if (!Number.isNaN(parsed)) return parsed;
  }
  return fallback;
}

function formatEtb(value: number): string {
  return `ETB ${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

type FinancialSummary = {
  revenue: number;
  cost: number;
  profit: number;
  marginPercent: number;
  currency: string;
  paymentMix: Array<{ paymentMethod: string; amount: number }>;
};

type MonthSalesSummary = {
  totalRevenue: number;
  totalSales: number;
  avgTransaction: number;
};

const EMPTY_FINANCIAL: FinancialSummary = {
  revenue: 0,
  cost: 0,
  profit: 0,
  marginPercent: 0,
  currency: "ETB",
  paymentMix: [],
};

const EMPTY_MONTH_SALES: MonthSalesSummary = {
  totalRevenue: 0,
  totalSales: 0,
  avgTransaction: 0,
};

function parseFinancialReport(raw: unknown): FinancialSummary {
  if (raw == null) return EMPTY_FINANCIAL;

  const unwrapped = unwrapData<Record<string, unknown> | null>(raw);
  const data =
    unwrapped && typeof unwrapped === "object" ? unwrapped : {};

  return {
    revenue: toNumber(data.revenue ?? data.totalRevenue ?? data.total_revenue),
    cost: toNumber(data.cost ?? data.totalCost ?? data.total_cost),
    profit: toNumber(data.profit ?? data.netProfit ?? data.net_profit),
    marginPercent: toNumber(
      data.marginPercent ?? data.margin_percent ?? data.profitMargin
    ),
    currency: String(data.currency ?? "ETB"),
    paymentMix: (Array.isArray(data.paymentMix)
      ? data.paymentMix
      : Array.isArray(data.payment_mix)
        ? data.payment_mix
        : []) as Array<{ paymentMethod: string; amount: number }>,
  };
}

function parseMonthSales(raw: unknown): MonthSalesSummary {
  if (raw == null) return EMPTY_MONTH_SALES;

  const unwrapped = unwrapData<Record<string, unknown> | null>(raw);
  const data =
    unwrapped && typeof unwrapped === "object" ? unwrapped : {};

  return {
    totalRevenue: toNumber(data.totalRevenue ?? data.total_revenue),
    totalSales: toNumber(data.totalSales ?? data.total_sales ?? data.salesCount),
    avgTransaction: toNumber(data.avgTransaction ?? data.avg_transaction),
  };
}

export default function AdminFinancialReportsPage() {
  const {
    data: revenueRaw,
    loading: revLoading,
    error: revError,
    refetch,
  } = useApi(getRevenueProfitReport);
  const { data: salesRaw, loading: salesLoading } = useApi(() =>
    getSalesReport("month")
  );
  const { data: invoices, loading: invLoading } = useApi(() => getInvoices(), []);

  const financial = useMemo(() => parseFinancialReport(revenueRaw), [revenueRaw]);

  const monthSales = useMemo(() => parseMonthSales(salesRaw), [salesRaw]);

  const invoiceMix = useMemo(() => {
    if (financial.paymentMix.length > 0) return financial.paymentMix;
    const map = new Map<string, number>();
    for (const inv of invoices ?? []) {
      const amount = toNumber(inv.amount);
      map.set(
        inv.paymentMethod || "Other",
        (map.get(inv.paymentMethod || "Other") || 0) + amount
      );
    }
    return [...map.entries()].map(([paymentMethod, amount]) => ({
      paymentMethod,
      amount,
    }));
  }, [financial.paymentMix, invoices]);

  const loading = revLoading || salesLoading || invLoading;

  return (
    <div>
      <AdminHeader
        title="Financial Reports"
        subtitle="Revenue, cost, profit, and payment mix across the pharmacy."
        searchPlaceholder="Search financial reports..."
      />

      <PageState loading={loading && !revenueRaw} error={revError} onRetry={refetch}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Revenue", value: formatEtb(financial.revenue), icon: Banknote },
            { label: "Total Cost", value: formatEtb(financial.cost), icon: CreditCard },
            { label: "Net Profit", value: formatEtb(financial.profit), icon: PieChart },
            {
              label: "Margin",
              value: `${financial.marginPercent.toFixed(1)}%`,
              icon: Smartphone,
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

        <div className="grid lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="text-sm font-bold mb-3">Revenue & profit trend</h3>
            <RevenueProfitChart data={revenueRaw} loading={revLoading} />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="text-sm font-bold mb-3">Payment mix</h3>
            {invoiceMix.length === 0 ? (
              <p className="text-sm text-slate-400">No invoice payments yet</p>
            ) : (
              <ul className="space-y-3">
                {invoiceMix.map((row) => (
                  <li
                    key={row.paymentMethod}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-slate-600 dark:text-slate-300">
                      {row.paymentMethod}
                    </span>
                    <span className="font-bold">
                      {formatEtb(toNumber(row.amount))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <h3 className="text-sm font-bold mb-3">This month snapshot</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-400 text-xs uppercase font-semibold">
                Sales count
              </p>
              <p className="text-xl font-bold mt-1">{monthSales.totalSales}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase font-semibold">
                Revenue
              </p>
              <p className="text-xl font-bold mt-1">
                {formatEtb(monthSales.totalRevenue)}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase font-semibold">
                Avg ticket
              </p>
              <p className="text-xl font-bold mt-1">
                {formatEtb(monthSales.avgTransaction)}
              </p>
            </div>
          </div>
        </div>
      </PageState>
    </div>
  );
}
