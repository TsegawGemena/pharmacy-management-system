"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Banknote, Loader2, Smartphone } from "lucide-react";
import { getDashboard, getInvoices } from "@/lib/api";
import { useApi } from "@/lib/hooks/use-api";
import type { Invoice } from "@/lib/types";

const RECENT_LIMIT = 5;

interface SaleRow {
  invoice: string;
  product: string;
  items: number;
  amount: string;
  paymentMethod: string;
  paymentType: "cash" | "mobile";
  status: string;
}

function normalizePaymentType(method: unknown): "cash" | "mobile" {
  const value = String(method ?? "").toLowerCase();
  if (value.includes("cash")) return "cash";
  return "mobile";
}

function formatAmount(value: unknown): string {
  if (typeof value === "number") {
    return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return String(value ?? "0.00");
}

function productLabelFromUnknown(item: Record<string, unknown>): string {
  if (typeof item.product === "string" && item.product.trim()) return item.product;
  if (typeof item.productName === "string" && item.productName.trim()) {
    return item.productName;
  }
  if (Array.isArray(item.items)) {
    const names = item.items
      .map((line) => {
        if (!line || typeof line !== "object") return "";
        const row = line as Record<string, unknown>;
        return String(row.name ?? row.productName ?? "").trim();
      })
      .filter(Boolean);
    if (names.length > 0) return names.join(", ");
  }
  return "—";
}

function mapDashboardSale(item: Record<string, unknown>): SaleRow {
  const paymentMethod = String(item.paymentMethod ?? "Cash");
  const product = productLabelFromUnknown(item);
  const itemCount = Array.isArray(item.items)
    ? item.items.length
    : Number(item.itemCount ?? item.qty ?? 1);
  return {
    invoice: String(item.invoice ?? item.invoiceNumber ?? item.id ?? "—"),
    product,
    items: Number.isFinite(itemCount) && itemCount > 0 ? itemCount : 1,
    amount: formatAmount(item.amount ?? item.total),
    paymentMethod,
    paymentType: normalizePaymentType(item.paymentMethod),
    status: String(item.status ?? "PAID").toUpperCase(),
  };
}

function mapInvoice(invoice: Invoice): SaleRow {
  const names = (invoice.items ?? []).map((i) => i.name).filter(Boolean);
  return {
    invoice: invoice.id,
    product: names.length > 0 ? names.join(", ") : "—",
    items: names.length > 0 ? names.length : 1,
    amount: invoice.amount,
    paymentMethod: invoice.paymentMethod,
    paymentType: normalizePaymentType(invoice.paymentMethod),
    status: invoice.status.toUpperCase(),
  };
}

export default function RecentSales() {
  const { data: dashboard, loading: dashboardLoading } = useApi(getDashboard);
  const hasDashboardSales = (dashboard?.recentSales?.length ?? 0) > 0;

  const { data: invoices, loading: invoicesLoading } = useApi(
    () => getInvoices().then((list) => list.slice(0, RECENT_LIMIT)),
    [],
    { enabled: !dashboardLoading && !hasDashboardSales }
  );

  const loading = dashboardLoading || (!hasDashboardSales && invoicesLoading);

  const sales: SaleRow[] = hasDashboardSales
    ? (dashboard!.recentSales as Record<string, unknown>[]).map(mapDashboardSale).slice(0, RECENT_LIMIT)
    : (invoices ?? []).map(mapInvoice);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-base lg:text-[17px] font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          Recent Sales
        </h2>
        <Link
          href="/invoices"
          className="text-xs sm:text-sm font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 flex items-center gap-1 transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="py-3 px-6">Invoice</th>
              <th className="py-3 px-6">Product / Item</th>
              <th className="py-3 px-6">Items</th>
              <th className="py-3 px-6">Amount (ETB)</th>
              <th className="py-3 px-6">Payment</th>
              <th className="py-3 px-6 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin text-sky-600" />
                    <span className="text-sm font-medium">Loading recent sales...</span>
                  </div>
                </td>
              </tr>
            ) : sales.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-slate-400 dark:text-slate-500">
                  No recent sales found.
                </td>
              </tr>
            ) : (
              sales.map((sale) => (
                <tr
                  key={sale.invoice}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-3.5 px-6 font-mono font-medium text-sky-600 dark:text-sky-400">
                    <Link href={`/invoices?id=${sale.invoice}`} className="hover:underline">
                      {sale.invoice}
                    </Link>
                  </td>
                  <td className="py-3.5 px-6 font-medium text-slate-800 dark:text-slate-200">
                    {sale.product}
                  </td>
                  <td className="py-3.5 px-6 text-slate-600 dark:text-slate-400 font-mono">
                    {sale.items}
                  </td>
                  <td className="py-3.5 px-6 font-mono font-bold text-slate-800 dark:text-slate-100">
                    {sale.amount}
                  </td>
                  <td className="py-3.5 px-6 text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      {sale.paymentType === "cash" ? (
                        <Banknote className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Smartphone className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                      )}
                      <span>{sale.paymentMethod}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-6 text-center">
                    <span className="inline-flex items-center rounded-full bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60">
                      {sale.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
