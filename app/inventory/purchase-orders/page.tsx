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
  Filter as FilterIcon,
  Download,
  Package,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
} from "lucide-react";
import InventoryNavTabs from "@/components/inventory/inventory-nav-tabs";

interface PurchaseOrder {
  id: string; // e.g. "PO-2023-1045"
  supplier: {
    name: string;
    avatar: string;
    bgColor?: string;
  };
  dateOrdered: string;
  expectedDelivery: string;
  isDelayed?: boolean;
  total: string;
  status: "SHIPPED" | "PENDING" | "DRAFT" | "RECEIVED";
}

const INITIAL_POS: PurchaseOrder[] = [
  {
    id: "PO-2023-1045",
    supplier: {
      name: "PharmaCorp East Africa",
      avatar: "PE",
      bgColor: "bg-sky-500",
    },
    dateOrdered: "Oct 12, 2023",
    expectedDelivery: "Oct 18, 2023",
    isDelayed: false,
    total: "45,200.00",
    status: "SHIPPED",
  },
  {
    id: "PO-2023-1042",
    supplier: {
      name: "EthioMed Logistics",
      avatar: "EL",
      bgColor: "bg-emerald-500",
    },
    dateOrdered: "Oct 05, 2023",
    expectedDelivery: "Oct 10, 2023",
    isDelayed: true,
    total: "12,500.50",
    status: "PENDING",
  },
  {
    id: "PO-2023-1046",
    supplier: {
      name: "Global Meds Inc.",
      avatar: "GM",
      bgColor: "bg-indigo-500",
    },
    dateOrdered: "--",
    expectedDelivery: "--",
    isDelayed: false,
    total: "8,900.00",
    status: "DRAFT",
  },
  {
    id: "PO-2023-1040",
    supplier: {
      name: "BioSupply Distributors",
      avatar: "BS",
      bgColor: "bg-teal-500",
    },
    dateOrdered: "Oct 01, 2023",
    expectedDelivery: "Oct 05, 2023",
    isDelayed: false,
    total: "105,600.00",
    status: "RECEIVED",
  },
  {
    id: "PO-2023-1039",
    supplier: {
      name: "GlaxoSmithKline (GSK)",
      avatar: "GS",
      bgColor: "bg-orange-500",
    },
    dateOrdered: "Sep 28, 2023",
    expectedDelivery: "Oct 04, 2023",
    isDelayed: false,
    total: "74,300.00",
    status: "RECEIVED",
  },
];

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>(INITIAL_POS);
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
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Link href="/inventory" className="hover:text-sky-600 flex items-center gap-1">
            <Package className="h-3.5 w-3.5" />
            <span>Inventory</span>
          </Link>
          <span>&gt;</span>
          <span className="text-slate-700 font-semibold">Purchase Orders</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              Purchase Orders
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage supplier orders and track deliveries.
            </p>
          </div>
          <Link
            href="/inventory/purchase-orders/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#006699] text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-[#005580] transition-colors shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Create New PO</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL ORDERS */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              TOTAL ORDERS
            </span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-slate-800 font-mono">142</span>
            <span className="text-xs font-medium text-slate-500">/ 856 Total</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Active currently</p>
        </div>

        {/* PENDING FULFILLMENT */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              PENDING FULFILLMENT
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Truck className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-slate-800 font-mono">28</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Orders awaiting receipt</p>
        </div>

        {/* TOTAL SPEND (MONTH) */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              TOTAL SPEND (MONTH)
            </span>
            <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl lg:text-[26px] font-extrabold text-slate-800 font-mono">
              ETB 450.2K
            </span>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            +12% vs last month
          </p>
        </div>

        {/* DELAYED ORDERS */}
        <div className="bg-white rounded-xl border border-slate-200/90 border-l-4 border-l-rose-500 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-rose-600 text-[11px] font-bold uppercase tracking-wider">
              DELAYED ORDERS
            </span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-rose-600 font-mono">3</span>
          </div>
          <p className="text-[11px] text-rose-600/90 font-medium mt-1">
            Requires immediate attention
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search PO number or supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 text-slate-700 placeholder-slate-400 focus:outline-hidden focus:border-sky-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
              {["ALL", "SHIPPED", "PENDING", "DRAFT", "RECEIVED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    statusFilter === st
                      ? "bg-white text-slate-800 shadow-2xs font-semibold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <button
              onClick={handleExportCSV}
              title="Export POs"
              className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* PO Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-[13px]">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
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
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No purchase orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* PO Number */}
                    <td className="py-3.5 px-6 font-mono font-bold">
                      <Link
                        href={`/inventory/purchase-orders/${po.id}`}
                        className="text-[#0284c7] hover:underline"
                      >
                        {po.id}
                      </Link>
                    </td>

                    {/* Supplier */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`h-7 w-7 rounded-full text-white text-[11px] font-bold flex items-center justify-center shrink-0 ${
                            po.supplier.bgColor || "bg-sky-500"
                          }`}
                        >
                          {po.supplier.avatar}
                        </div>
                        <span className="font-semibold text-slate-800">
                          {po.supplier.name}
                        </span>
                      </div>
                    </td>

                    {/* Date Ordered */}
                    <td className="py-3.5 px-6 text-slate-600 font-medium">
                      {po.dateOrdered}
                    </td>

                    {/* Expected Delivery */}
                    <td className="py-3.5 px-6">
                      <span
                        className={`font-medium ${
                          po.isDelayed
                            ? "text-rose-600 font-bold"
                            : "text-slate-600"
                        }`}
                      >
                        {po.expectedDelivery}
                      </span>
                    </td>

                    {/* Total (ETB) */}
                    <td className="py-3.5 px-6 text-right font-mono font-bold text-slate-800">
                      {po.total}
                    </td>

                    {/* Status Pill Badge */}
                    <td className="py-3.5 px-6 text-center">
                      {po.status === "SHIPPED" && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                          SHIPPED
                        </span>
                      )}
                      {po.status === "PENDING" && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          PENDING
                        </span>
                      )}
                      {po.status === "DRAFT" && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          DRAFT
                        </span>
                      )}
                      {po.status === "RECEIVED" && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          RECEIVED
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-6 text-right">
                      <Link
                        href={`/inventory/purchase-orders/${po.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded-lg transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>Showing 1-{filteredOrders.length} of 142 orders</div>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage(1)}
              className={`w-7 h-7 flex items-center justify-center rounded text-xs font-semibold ${
                currentPage === 1
                  ? "bg-[#0284c7] text-white"
                  : "border border-slate-200 hover:bg-slate-50 text-slate-700"
              }`}
            >
              1
            </button>
            <button
              onClick={() => setCurrentPage(2)}
              className={`w-7 h-7 flex items-center justify-center rounded text-xs font-semibold ${
                currentPage === 2
                  ? "bg-[#0284c7] text-white"
                  : "border border-slate-200 hover:bg-slate-50 text-slate-700"
              }`}
            >
              2
            </button>
            <button
              onClick={() => setCurrentPage(3)}
              className={`w-7 h-7 flex items-center justify-center rounded text-xs font-semibold ${
                currentPage === 3
                  ? "bg-[#0284c7] text-white"
                  : "border border-slate-200 hover:bg-slate-50 text-slate-700"
              }`}
            >
              3
            </button>
            <span className="px-1 text-slate-400">...</span>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-1 rounded border border-slate-200 hover:bg-slate-50 text-slate-600"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
