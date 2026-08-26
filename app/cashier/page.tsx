"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  Banknote,
  ReceiptText,
  ShoppingCart,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import CashierHeader from "@/components/cashier/cashier-header";
import { useCashierMobileMenu } from "@/components/cashier/cashier-shell-context";
import { PageState } from "@/components/ui/page-state";
import { getInvoices } from "@/lib/api";
import { useApi } from "@/lib/hooks/use-api";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function parseAmount(value: string | number | undefined): number {
  if (typeof value === "number") return value;
  if (!value) return 0;
  return Number(String(value).replace(/[^0-9.-]/g, "")) || 0;
}

export default function CashierDashboardPage() {
  const menu = useCashierMobileMenu();
  const { data, loading, error, refetch } = useApi(() => getInvoices(), []);
  const invoices = data ?? [];
  const today = todayISO();

  const stats = useMemo(() => {
    const todays = invoices.filter((inv) =>
      String(inv.date || "").startsWith(today)
    );
    const totalSales = todays.reduce(
      (sum, inv) => sum + parseAmount(inv.amount),
      0
    );
    const cashReceived = todays
      .filter((inv) =>
        String(inv.paymentMethod || "")
          .toLowerCase()
          .includes("cash")
      )
      .reduce((sum, inv) => sum + parseAmount(inv.amount), 0);

    return {
      totalSales,
      transactions: todays.length,
      cashReceived,
      recent: todays.slice(0, 8),
    };
  }, [invoices, today]);

  return (
    <div>
      <CashierHeader
        title="Cashier Dashboard"
        subtitle="Today’s sales overview and quick checkout."
        onOpenMobileMenu={menu?.open}
      />

      <div className="flex justify-end mb-4">
        <Link
          href="/cashier/pos"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0c3e66] text-white text-sm font-semibold shadow-xs hover:bg-[#0a3354]"
        >
          <ShoppingCart className="h-4 w-4" />
          New Sale
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Today&apos;s Sales
            </span>
            <TrendingUp className="h-4 w-4 text-sky-600" />
          </div>
          <p className="mt-2 text-2xl font-extrabold font-mono text-slate-800 dark:text-slate-100">
            {stats.totalSales.toFixed(2)}{" "}
            <span className="text-sm font-semibold text-slate-400">ETB</span>
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Transactions
            </span>
            <ReceiptText className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-extrabold font-mono text-slate-800 dark:text-slate-100">
            {stats.transactions}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Cash Received
            </span>
            <Banknote className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-extrabold font-mono text-slate-800 dark:text-slate-100">
            {stats.cashReceived.toFixed(2)}{" "}
            <span className="text-sm font-semibold text-slate-400">ETB</span>
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Recent Transactions
          </h2>
          <Link
            href="/cashier/sales-history"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#006699] hover:underline"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <PageState loading={loading} error={error} onRetry={refetch} empty={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-5">Invoice</th>
                  <th className="py-3 px-5">Customer</th>
                  <th className="py-3 px-5">Method</th>
                  <th className="py-3 px-5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {stats.recent.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-slate-400">
                      No sales recorded today yet.
                    </td>
                  </tr>
                ) : (
                  stats.recent.map((inv) => (
                    <tr key={inv.id}>
                      <td className="py-3 px-5 font-mono font-semibold">
                        {inv.id}
                      </td>
                      <td className="py-3 px-5">{inv.customerName || "—"}</td>
                      <td className="py-3 px-5">{inv.paymentMethod || "—"}</td>
                      <td className="py-3 px-5 text-right font-mono font-semibold">
                        {inv.amount} ETB
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </PageState>
      </div>
    </div>
  );
}
