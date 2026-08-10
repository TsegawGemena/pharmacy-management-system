"use client";

import React, { useState, useMemo } from "react";
import {
  FileText,
  Download,
  Filter as FilterIcon,
  Calendar,
  AlertTriangle,
  TrendingUp,
  CreditCard,
  Banknote,
  CheckCircle2,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Eye,
  Printer,
} from "lucide-react";

interface InvoiceRecord {
  id: string; // e.g. "INV-2023-0891"
  customerName: string;
  date: string;
  amount: string;
  paymentMethod: "Cash" | "Card" | "Bank Transfer" | "Telebirr";
  status: "Paid" | "Pending" | "Overdue" | "Cancelled";
}

const INITIAL_INVOICES: InvoiceRecord[] = [
  {
    id: "INV-2023-0891",
    customerName: "Abebe Kebede",
    date: "Oct 24, 2023",
    amount: "4,500.00",
    paymentMethod: "Cash",
    status: "Paid",
  },
  {
    id: "INV-2023-0890",
    customerName: "Tigist Alemu",
    date: "Oct 24, 2023",
    amount: "1,250.00",
    paymentMethod: "Card",
    status: "Pending",
  },
  {
    id: "INV-2023-0885",
    customerName: "Dawit Bekele",
    date: "Oct 15, 2023",
    amount: "8,900.00",
    paymentMethod: "Bank Transfer",
    status: "Overdue",
  },
  {
    id: "INV-2023-0880",
    customerName: "Walk-in Customer",
    date: "Oct 14, 2023",
    amount: "350.00",
    paymentMethod: "Cash",
    status: "Paid",
  },
  {
    id: "INV-2023-0878",
    customerName: "Dr. Tadesse Bekele",
    date: "Oct 12, 2023",
    amount: "3,200.00",
    paymentMethod: "Card",
    status: "Paid",
  },
  {
    id: "INV-2023-0875",
    customerName: "Aster Tesfaye",
    date: "Oct 10, 2023",
    amount: "1,850.00",
    paymentMethod: "Telebirr",
    status: "Paid",
  },
  {
    id: "INV-2023-0870",
    customerName: "Yohannes Haile",
    date: "Oct 08, 2023",
    amount: "5,400.00",
    paymentMethod: "Bank Transfer",
    status: "Pending",
  },
];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(INITIAL_INVOICES);
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExportReport = () => {
    const headers = "Invoice ID,Customer Name,Date,Amount (ETB),Payment Method,Status\n";
    const rows = invoices
      .map(
        (i) =>
          `"${i.id}","${i.customerName}","${i.date}",${i.amount},"${i.paymentMethod}","${i.status}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Invoices_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Exported invoices report CSV");
  };

  const handleGenerateStatement = () => {
    showToast("Monthly Account Statement generated & ready for download");
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (statusFilter !== "All Statuses" && inv.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [invoices, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-xl shadow-lg border border-slate-700 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Invoices
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage and track billing across all points of sale.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateStatement}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors shadow-2xs cursor-pointer"
          >
            <FileText className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <span>Generate Statement</span>
          </button>

          <button
            onClick={handleExportReport}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#006699] hover:bg-[#005580] rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL INVOICED */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs transition-colors">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            TOTAL INVOICED
          </span>
          <div className="text-2xl lg:text-[26px] font-extrabold text-slate-800 dark:text-slate-100 font-mono mt-2">
            ETB 142,500
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+12% this month</span>
          </div>
        </div>

        {/* PAID */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs transition-colors">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            PAID
          </span>
          <div className="text-2xl lg:text-[26px] font-extrabold text-emerald-700 dark:text-emerald-400 font-mono mt-2">
            ETB 98,200
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            342 Invoices
          </div>
        </div>

        {/* PENDING */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs transition-colors">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            PENDING
          </span>
          <div className="text-2xl lg:text-[26px] font-extrabold text-amber-700 dark:text-amber-400 font-mono mt-2">
            ETB 32,100
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            45 Invoices
          </div>
        </div>

        {/* OVERDUE */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs relative overflow-hidden transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              OVERDUE
            </span>
            <div className="p-1.5 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-lg">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl lg:text-[26px] font-extrabold text-rose-600 dark:text-rose-400 font-mono mt-2">
            ETB 12,200
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            12 Invoices
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-sky-500 font-medium shadow-2xs"
            >
              <option value="All Statuses">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-sky-500 font-medium shadow-2xs"
            >
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="This Month">This Month</option>
              <option value="Custom Range">Custom Range</option>
            </select>
          </div>

          <button
            onClick={() => showToast("Opening advanced filters")}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs sm:text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium shadow-2xs cursor-pointer"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            <span>More Filters</span>
          </button>
        </div>

        {/* Invoices Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-[13px]">
            <thead className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3.5 px-6 font-mono">Invoice ID</th>
                <th className="py-3.5 px-6">Customer Name</th>
                <th className="py-3.5 px-5">Date</th>
                <th className="py-3.5 px-5 text-right font-mono">Amount (ETB)</th>
                <th className="py-3.5 px-5">Payment Method</th>
                <th className="py-3.5 px-5 text-center">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                    No invoices matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                    {/* ID */}
                    <td className="py-3.5 px-6 font-mono font-bold text-slate-800 dark:text-slate-100">
                      {inv.id}
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-6 font-medium text-slate-800 dark:text-slate-200">
                      {inv.customerName}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-5 text-slate-600 dark:text-slate-400">
                      {inv.date}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-800 dark:text-slate-100">
                      {inv.amount}
                    </td>

                    {/* Payment Method */}
                    <td className="py-3.5 px-5 text-slate-700 dark:text-slate-300">
                      {inv.paymentMethod}
                    </td>

                    {/* Status Pill */}
                    <td className="py-3.5 px-5 text-center">
                      {inv.status === "Paid" && (
                        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
                          Paid
                        </span>
                      )}
                      {inv.status === "Pending" && (
                        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                          Pending
                        </span>
                      )}
                      {inv.status === "Overdue" && (
                        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
                          Overdue
                        </span>
                      )}
                      {inv.status === "Cancelled" && (
                        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          Cancelled
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => showToast(`Printing receipt for ${inv.id}`)}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                        title="Print Invoice"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div>Showing 1 to {filteredInvoices.length} of 450 entries</div>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(1)}
              className={`w-7 h-7 flex items-center justify-center rounded text-xs font-semibold ${
                currentPage === 1
                  ? "bg-[#0284c7] text-white"
                  : "border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              1
            </button>
            <button
              onClick={() => setCurrentPage(2)}
              className={`w-7 h-7 flex items-center justify-center rounded text-xs font-semibold ${
                currentPage === 2
                  ? "bg-[#0284c7] text-white"
                  : "border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              2
            </button>
            <button
              onClick={() => setCurrentPage(3)}
              className={`w-7 h-7 flex items-center justify-center rounded text-xs font-semibold ${
                currentPage === 3
                  ? "bg-[#0284c7] text-white"
                  : "border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              3
            </button>
            <span className="px-1 text-slate-400">...</span>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Confidential Footer Notice */}
      <div className="text-center text-[11px] font-mono text-slate-400 pt-2">
        Gammo Pharmacy Clinical Ops System - CONFIDENTIAL
      </div>
    </div>
  );
}
