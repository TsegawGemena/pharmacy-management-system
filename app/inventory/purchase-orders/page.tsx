"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  FileText,
  Truck,
  DollarSign,
  AlertTriangle,
  Plus,
  Search,
  Download,
  Package,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import InventoryNavTabs from "@/components/inventory/inventory-nav-tabs";
import { getPurchaseOrders } from "@/lib/api";
import { useApi } from "@/lib/hooks/use-api";
import type { PurchaseOrder, PurchaseOrderStatus } from "@/lib/types";

const AVATAR_COLORS = [
  "bg-sky-500",
  "bg-emerald-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-orange-500",
];

function formatDisplayDate(dateStr: string): string {
  if (!dateStr || dateStr === "--") return "--";
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTotal(total: string): string {
  const num = parseFloat(total.replace(/,/g, ""));
  if (Number.isNaN(num)) return total;
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getSupplierAvatar(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getAvatarColor(name: string): string {
  const idx =
    name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

export default function PurchaseOrdersPage() {
  const { data: apiOrders, loading, error, refetch } = useApi(
    () => getPurchaseOrders(),
    []
  );
  const orders = apiOrders ?? [];
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExportCSV = () => {
    const headers = "PO Number,Supplier,Date Ordered,Expected Delivery,Total (ETB),Status\n";
    const rows = orders
      .map(
        (o) =>
          `"${o.id}","${o.supplier.name}","${o.dateOrdered}","${o.expectedDelivery}",${o.total},"${o.status}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Purchase_Orders_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Exported purchase orders CSV file");
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = order.id.toLowerCase().includes(q);
        const matchesSup = order.supplier.name.toLowerCase().includes(q);
        if (!matchesId && !matchesSup) return false;
      }
      if (statusFilter !== "ALL" && order.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [orders, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const pendingFulfillment = orders.filter(
      (o) => o.status === "PENDING" || o.status === "SHIPPED"
    ).length;
    const delayed = orders.filter((o) => o.isDelayed).length;
    const now = new Date();
    const monthSpend = orders.reduce((sum, o) => {
      const ordered = new Date(o.dateOrdered);
      if (
        !Number.isNaN(ordered.getTime()) &&
        ordered.getMonth() === now.getMonth() &&
        ordered.getFullYear() === now.getFullYear()
      ) {
        const val = parseFloat(o.total.replace(/,/g, ""));
        return sum + (Number.isNaN(val) ? 0 : val);
      }
      return sum;
    }, 0);
    const spendLabel =
      monthSpend >= 1000
        ? `ETB ${(monthSpend / 1000).toFixed(1)}K`
        : `ETB ${monthSpend.toFixed(0)}`;
    return {
      total: orders.length,
      pendingFulfillment,
      delayed,
      monthSpend: spendLabel,
    };
  }, [orders]);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const statusFilters: Array<PurchaseOrderStatus | "ALL"> = [
    "ALL",
    "SHIPPED",
    "PENDING",
    "DRAFT",
    "RECEIVED",
  ];

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

      {/* Breadcrumb & Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <Link href="/inventory" className="hover:text-sky-600 dark:hover:text-sky-400 flex items-center gap-1">
            <Package className="h-3.5 w-3.5" />
            <span>Inventory</span>
          </Link>
          <span>&gt;</span>
          <span className="text-slate-700 dark:text-slate-300 font-semibold">Purchase Orders</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              Purchase Orders
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage supplier orders and track deliveries.
            </p>
          </div>
          <Link
            href="/inventory/purchase-orders/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#006699] text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-[#005580] transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create New PO</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL ORDERS */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              TOTAL ORDERS
            </span>
            <div className="p-2 bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 rounded-lg">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-mono">
              {loading ? "—" : stats.total}
            </span>
            {!loading && stats.total > 0 && (
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                total orders
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Active currently</p>
        </div>

        {/* PENDING FULFILLMENT */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              PENDING FULFILLMENT
            </span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-lg">
              <Truck className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-mono">
              {loading ? "—" : stats.pendingFulfillment}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Orders awaiting receipt</p>
        </div>

        {/* TOTAL SPEND (MONTH) */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              TOTAL SPEND (MONTH)
            </span>
            <div className="p-2 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-lg">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl lg:text-[26px] font-extrabold text-slate-800 dark:text-slate-100 font-mono">
              {loading ? "—" : stats.monthSpend}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Current month</p>
        </div>

        {/* DELAYED ORDERS */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 border-l-4 border-l-rose-500 dark:border-l-rose-500 p-5 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-rose-600 dark:text-rose-400 text-[11px] font-bold uppercase tracking-wider">
              DELAYED ORDERS
            </span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-lg">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 font-mono">
              {loading ? "—" : stats.delayed}
            </span>
          </div>
          <p className="text-[11px] text-rose-600/90 dark:text-rose-400/90 font-medium mt-1">
            Requires immediate attention
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search PO number or supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-sky-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800 text-xs">
              {statusFilters.map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setStatusFilter(st);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                    statusFilter === st
                      ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-2xs font-semibold"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <button
              onClick={handleExportCSV}
              title="Export POs"
              className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* PO Table */}
        <div className="overflow-x-auto">
          {error && (
            <div className="p-6 text-center">
              <p className="text-xs text-rose-600 dark:text-rose-400 mb-2">{error}</p>
              <button
                onClick={() => refetch()}
                className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
              >
                Retry
              </button>
            </div>
          )}
          {loading && !error && (
            <div className="py-12 flex items-center justify-center gap-2 text-slate-400 dark:text-slate-500 text-xs">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading purchase orders...</span>
            </div>
          )}
          {!loading && !error && (
          <table className="w-full text-left text-xs sm:text-[13px]">
            <thead className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3.5 px-6">PO NUMBER</th>
                <th className="py-3.5 px-6">SUPPLIER</th>
                <th className="py-3.5 px-6">DATE ORDERED</th>
                <th className="py-3.5 px-6">EXPECTED DEL.</th>
                <th className="py-3.5 px-6 text-right">TOTAL (ETB)</th>
                <th className="py-3.5 px-6 text-center">STATUS</th>
                <th className="py-3.5 px-6 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                    No purchase orders found.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((po) => {
                  const avatar =
                    po.supplier.avatar || getSupplierAvatar(po.supplier.name);
                  const bgColor = getAvatarColor(po.supplier.name);
                  return (
                  <tr key={po.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                    {/* PO Number */}
                    <td className="py-3.5 px-6 font-mono font-bold">
                      <Link
                        href={`/inventory/purchase-orders/${po.id}`}
                        className="text-[#0284c7] dark:text-sky-400 hover:underline"
                      >
                        {po.id}
                      </Link>
                    </td>

                    {/* Supplier */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`h-7 w-7 rounded-full text-white text-[11px] font-bold flex items-center justify-center shrink-0 ${bgColor}`}
                        >
                          {avatar}
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {po.supplier.name}
                        </span>
                      </div>
                    </td>

                    {/* Date Ordered */}
                    <td className="py-3.5 px-6 text-slate-600 dark:text-slate-400 font-medium">
                      {formatDisplayDate(po.dateOrdered)}
                    </td>

                    {/* Expected Delivery */}
                    <td className="py-3.5 px-6">
                      <span
                        className={`font-medium ${
                          po.isDelayed
                            ? "text-rose-600 dark:text-rose-400 font-bold"
                            : "text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {formatDisplayDate(po.expectedDelivery)}
                      </span>
                    </td>

                    {/* Total (ETB) */}
                    <td className="py-3.5 px-6 text-right font-mono font-bold text-slate-800 dark:text-slate-100">
                      {formatTotal(po.total)}
                    </td>

                    {/* Status Pill Badge */}
                    <td className="py-3.5 px-6 text-center">
                      {po.status === "SHIPPED" && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60">
                          SHIPPED
                        </span>
                      )}
                      {po.status === "PENDING" && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                          PENDING
                        </span>
                      )}
                      {po.status === "DRAFT" && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          DRAFT
                        </span>
                      )}
                      {po.status === "RECEIVED" && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                          RECEIVED
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-6 text-right">
                      <Link
                        href={`/inventory/purchase-orders/${po.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950/50 rounded-lg transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div>
            {filteredOrders.length === 0
              ? "No orders"
              : `Showing ${(currentPage - 1) * pageSize + 1}-${Math.min(
                  currentPage * pageSize,
                  filteredOrders.length
                )} of ${filteredOrders.length} orders`}
          </div>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 flex items-center justify-center rounded text-xs font-semibold ${
                    currentPage === page
                      ? "bg-[#0284c7] text-white"
                      : "border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {page}
                </button>
              )
            )}
            {totalPages > 5 && <span className="px-1 text-slate-400">...</span>}
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
