"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Banknote,
  Boxes,
  Loader2,
  Package,
  Pill,
  ShoppingBag,
  Users,
} from "lucide-react";
import AdminHeader from "@/components/admin/admin-header";
import {
  getDashboard,
  getInventory,
  getInventoryAlerts,
  getExpiringInventory,
  getInvoices,
} from "@/lib/api";
import { useApi } from "@/lib/hooks/use-api";
import type { InventoryItem, Invoice } from "@/lib/types";

function formatEtb(value: number): string {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });
}

function daysUntil(dateStr: string): number | null {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function AdminDashboardPage() {
  const [range, setRange] = useState<"7d" | "30d" | "3m">("30d");

  const { data: dashboard, loading: dashLoading } = useApi(getDashboard);
  const { data: inventory } = useApi(getInventory);
  const { data: lowStock } = useApi(getInventoryAlerts);
  const { data: expiring } = useApi(getExpiringInventory);
  const { data: invoices } = useApi(() => getInvoices(), []);

  const items = inventory ?? [];
  const alerts = lowStock ?? [];
  const expiryItems = expiring ?? [];
  const invoiceList = invoices ?? [];

  const inventoryStatus = useMemo(() => {
    let healthy = 0;
    let low = 0;
    let critical = 0;
    let expiringSoon = 0;
    let expired = 0;

    for (const item of items) {
      const days = daysUntil(item.expiryDate);
      if (days != null && days < 0) expired += 1;
      else if (item.isExpiringSoon || (days != null && days <= 30)) expiringSoon += 1;

      if (item.stock <= 0 || item.stock <= Math.max(1, Math.floor(item.minStock / 2))) {
        critical += 1;
      } else if (item.stock <= item.minStock) {
        low += 1;
      } else {
        healthy += 1;
      }
    }

    return { healthy, low, critical, expiringSoon, expired };
  }, [items]);

  const paymentBreakdown = useMemo(() => {
    const totals = { Cash: 0, Telebirr: 0, Card: 0, Other: 0 };
    for (const inv of invoiceList) {
      const amount = Number(String(inv.amount).replace(/[^0-9.-]/g, "")) || 0;
      const method = (inv.paymentMethod || "").toLowerCase();
      if (method.includes("cash")) totals.Cash += amount;
      else if (method.includes("tele") || method.includes("mobile")) totals.Telebirr += amount;
      else if (method.includes("card")) totals.Card += amount;
      else totals.Other += amount;
    }
    const sum = totals.Cash + totals.Telebirr + totals.Card + totals.Other;
    const pct = (n: number) => (sum > 0 ? Math.round((n / sum) * 100) : 0);
    return [
      { label: "Cash", pct: pct(totals.Cash), color: "#0284c7" },
      { label: "Mobile Money", pct: pct(totals.Telebirr), color: "#0f766e" },
      { label: "Card", pct: pct(totals.Card), color: "#ea580c" },
    ];
  }, [invoiceList]);

  const totalRevenue = useMemo(() => {
    return invoiceList.reduce((sum, inv) => {
      const amount = Number(String(inv.amount).replace(/[^0-9.-]/g, "")) || 0;
      return sum + amount;
    }, 0);
  }, [invoiceList]);

  const todaySales = dashboard?.stats?.todaySales ?? 0;
  const totalProducts = dashboard?.stats?.totalProducts ?? items.length;
  const lowStockCount = dashboard?.stats?.lowStockCount ?? alerts.length;

  const stats = [
    {
      title: "Total Revenue",
      value: `ETB ${formatEtb(totalRevenue)}`,
      hint: invoiceList.length ? "From recent invoices" : "No invoice data yet",
      icon: Banknote,
      iconBg: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400",
    },
    {
      title: "Today's Sales",
      value: `ETB ${formatEtb(todaySales)}`,
      hint: "Today's revenue",
      icon: ShoppingBag,
      iconBg: "bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-400",
    },
    {
      title: "Total Products",
      value: formatEtb(totalProducts),
      hint: lowStockCount > 0 ? `${lowStockCount} low stock` : "All stocked",
      icon: Package,
      iconBg: "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400",
      hintTone: lowStockCount > 0 ? "text-amber-700 dark:text-amber-400 font-semibold" : undefined,
    },
    {
      title: "Employees",
      value: "—",
      hint: "Employee module pending API",
      icon: Users,
      iconBg: "bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-400",
    },
  ];

  const topExpiry = expiryItems[0];
  const topExpiryDays = topExpiry ? daysUntil(topExpiry.expiryDate) : null;

  return (
    <div>
      <AdminHeader greeting searchPlaceholder="Search inventory, sales..." />

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {stats.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {card.title}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    {dashLoading && card.title === "Today's Sales" ? (
                      <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                    ) : (
                      card.value
                    )}
                  </p>
                  <p className={`mt-2 text-xs ${card.hintTone ?? "text-slate-500 dark:text-slate-400"}`}>
                    {card.hint}
                  </p>
                </div>
                <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Sales Overview
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Revenue & sales activity
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
              {(["7d", "30d", "3m"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRange(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    range === key
                      ? "bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-2xs"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
          <div className="h-56 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-center px-6 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {invoiceList.length === 0
                ? "No sales chart data yet. Charts will populate when revenue reports are available from the backend."
                : `Showing ${range} overview from ${invoiceList.length} recent invoice(s). Full interactive chart connects when the sales report API is live.`}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
            Revenue by Payment
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Share of recent invoice payments
          </p>
          <div className="flex items-center justify-center mb-4">
            <div
              className="relative h-36 w-36 rounded-full"
              style={{
                background: `conic-gradient(${paymentBreakdown
                  .map((p, i) => {
                    const start = paymentBreakdown
                      .slice(0, i)
                      .reduce((s, x) => s + x.pct, 0);
                    return `${p.color} ${start}% ${start + p.pct}%`;
                  })
                  .join(", ")}${paymentBreakdown.every((p) => p.pct === 0) ? ", #e2e8f0 0% 100%" : ""})`,
              }}
            >
              <div className="absolute inset-4 rounded-full bg-white dark:bg-slate-900 flex flex-col items-center justify-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {paymentBreakdown.reduce((s, p) => s + p.pct, 0) || 0}%
                </span>
              </div>
            </div>
          </div>
          <ul className="space-y-2">
            {paymentBreakdown.map((p) => (
              <li key={p.label} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-medium text-slate-600 dark:text-slate-300">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                  {p.label}
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{p.pct}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Status / alerts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs">
          <div className="flex items-center gap-2 mb-4">
            <Boxes className="h-4 w-4 text-sky-600" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Inventory Status
            </h3>
          </div>
          <ul className="space-y-2.5 text-xs">
            {[
              { label: "Healthy", value: inventoryStatus.healthy, color: "bg-emerald-500" },
              { label: "Low Stock", value: inventoryStatus.low, color: "bg-amber-500" },
              { label: "Critical", value: inventoryStatus.critical, color: "bg-rose-500" },
              { label: "Expiring Soon", value: inventoryStatus.expiringSoon, color: "bg-orange-500" },
              { label: "Expired", value: inventoryStatus.expired, color: "bg-rose-700" },
            ].map((row) => (
              <li key={row.label} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <span className={`h-2 w-2 rounded-full ${row.color}`} />
                  {row.label}
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  {row.value.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">
            Low Stock Alert
          </h3>
          <ul className="space-y-3">
            {alerts.slice(0, 3).map((item: InventoryItem) => (
              <li key={item.id} className="flex items-center justify-between gap-2 text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-200 truncate">
                  {item.name}
                </span>
                <span className="shrink-0 px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 font-bold border border-rose-200 dark:border-rose-800">
                  {item.stock} units
                </span>
              </li>
            ))}
            {alerts.length === 0 && (
              <li className="text-xs text-slate-400">No low stock items</li>
            )}
          </ul>
          <Link
            href="/admin/inventory"
            className="mt-4 inline-flex text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline"
          >
            View All Low Stock
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-rose-200/80 dark:border-rose-900/50 p-5 shadow-2xs bg-gradient-to-br from-rose-50/80 to-white dark:from-rose-950/30 dark:to-slate-900">
          <h3 className="text-sm font-bold text-rose-800 dark:text-rose-300 mb-3">
            Expiry Alerts
          </h3>
          {topExpiry ? (
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {topExpiry.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Batch: {topExpiry.batchNo || "—"}
              </p>
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400 mt-2">
                {topExpiryDays != null
                  ? topExpiryDays < 0
                    ? "Expired"
                    : `Exp: ${topExpiryDays} Days`
                  : `Exp: ${topExpiry.expiryDate}`}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400">No expiry alerts</p>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">
            Personnel
          </h3>
          <ul className="space-y-3 text-xs">
            {[
              { label: "Pharmacist", icon: Pill, value: "—" },
              { label: "Cashier", icon: ShoppingBag, value: "—" },
              { label: "Admin", icon: Users, value: "—" },
            ].map((row) => {
              const Icon = row.icon;
              return (
                <li key={row.label} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
                    <Icon className="h-3.5 w-3.5 text-slate-400" />
                    {row.label}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    {row.value}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-[10px] text-slate-400">
            Counts appear when the employees API is available.
          </p>
        </div>
      </div>

      {/* Recent sales */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Recent Sales
          </h2>
          <Link
            href="/admin/sales-history"
            className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline"
          >
            View All
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-5 font-semibold">Invoice</th>
                <th className="py-3 px-5 font-semibold">Customer</th>
                <th className="py-3 px-5 font-semibold">Payment</th>
                <th className="py-3 px-5 font-semibold">Status</th>
                <th className="py-3 px-5 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoiceList.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No recent sales found
                  </td>
                </tr>
              )}
              {invoiceList.slice(0, 6).map((inv: Invoice) => (
                <tr key={inv.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-5 font-mono font-semibold text-slate-700 dark:text-slate-200">
                    {inv.id}
                  </td>
                  <td className="py-3 px-5 text-slate-600 dark:text-slate-300">
                    {inv.customerName || "—"}
                  </td>
                  <td className="py-3 px-5 text-slate-600 dark:text-slate-300">
                    {inv.paymentMethod || "—"}
                  </td>
                  <td className="py-3 px-5">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {inv.status || "—"}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-right font-mono font-semibold text-slate-800 dark:text-slate-100">
                    ETB {inv.amount ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
