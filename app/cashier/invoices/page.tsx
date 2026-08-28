"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Download, Printer, ReceiptText, Search, X } from "lucide-react";
import CashierHeader from "@/components/cashier/cashier-header";
import { useCashierMobileMenu } from "@/components/cashier/cashier-shell-context";
import { PageState } from "@/components/ui/page-state";
import { getInvoice, getInvoices } from "@/lib/api";
import { downloadReceiptPdf, printReceiptA5Async } from "@/lib/receipt";
import { receiptDataFromInvoice } from "@/lib/receipt-data";
import type { Invoice } from "@/lib/types";
import { useApi } from "@/lib/hooks/use-api";

export default function CashierInvoicesPage() {
  const menu = useCashierMobileMenu();
  const { data, loading, error, refetch } = useApi(() => getInvoices(), []);
  const invoices = data ?? [];
  const [query, setQuery] = useState("");
  const [viewing, setViewing] = useState<Invoice | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return invoices;
    return invoices.filter(
      (inv) =>
        inv.id.toLowerCase().includes(q) ||
        inv.paymentMethod?.toLowerCase().includes(q)
    );
  }, [invoices, query]);

  const handlePrint = async (id: string) => {
    setBusyId(id);
    try {
      await printReceiptA5Async(await receiptDataFromInvoice(id));
    } catch {
      // keep UI quiet; print dialog may be blocked
    } finally {
      setBusyId(null);
    }
  };

  const handleDownloadPdf = async (id: string) => {
    setBusyId(id);
    try {
      await downloadReceiptPdf(await receiptDataFromInvoice(id));
    } catch {
      // ignore
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <CashierHeader
        title="Invoices"
        subtitle="Search and print receipts. Totals and payment details are read-only."
        onOpenMobileMenu={menu?.open}
      />

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search invoice or payment…"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 py-2 pl-9 pr-3 text-xs font-medium focus:border-sky-500 focus:outline-hidden"
            />
          </div>
        </div>

        <PageState loading={loading} error={error} onRetry={refetch} empty={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Invoice</th>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Amount</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400">
                      <ReceiptText className="h-5 w-5 mx-auto mb-2 opacity-50" />
                      No invoices found
                    </td>
                  </tr>
                ) : (
                  filtered.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-5 font-mono font-semibold">{inv.id}</td>
                      <td className="py-3.5 px-5 text-slate-500">{inv.date || "—"}</td>
                      <td className="py-3.5 px-5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800">
                          {inv.status || "—"}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono font-semibold">
                        {inv.amount} ETB
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            href={`/cashier/invoices/${encodeURIComponent(inv.id)}/receipt`}
                            className="text-xs font-semibold text-[#006699] hover:underline"
                          >
                            Receipt
                          </Link>
                          <button
                            type="button"
                            disabled={busyId === inv.id}
                            onClick={() => void handlePrint(inv.id)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#006699] hover:underline disabled:opacity-50"
                          >
                            <Printer className="h-3.5 w-3.5" />
                            Print
                          </button>
                          <button
                            type="button"
                            disabled={busyId === inv.id}
                            onClick={() => void handleDownloadPdf(inv.id)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-sky-700 disabled:opacity-50"
                          >
                            <Download className="h-3.5 w-3.5" />
                            PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </PageState>
      </div>

      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold">Invoice details</h3>
              <button
                type="button"
                onClick={() => setViewing(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <dl className="p-5 space-y-3 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Invoice</dt>
                <dd className="font-mono font-semibold">{viewing.id}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Date</dt>
                <dd className="font-semibold">{viewing.date || "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Payment</dt>
                <dd className="font-semibold">{viewing.paymentMethod || "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Status</dt>
                <dd className="font-semibold">{viewing.status || "—"}</dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-slate-100 dark:border-slate-800 pt-3">
                <dt className="text-slate-500">Total</dt>
                <dd className="font-mono font-bold text-base">
                  {viewing.amount} ETB
                </dd>
              </div>
            </dl>
            <div className="px-5 pb-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setViewing(null)}
                className="px-3 py-2 text-xs rounded-lg text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                type="button"
                disabled={busyId === viewing.id}
                onClick={() => void handleDownloadPdf(viewing.id)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-50"
              >
                <Download className="h-3.5 w-3.5" />
                PDF
              </button>
              <button
                type="button"
                disabled={busyId === viewing.id}
                onClick={() => void handlePrint(viewing.id)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-[#0c3e66] text-white disabled:opacity-50"
              >
                <Printer className="h-3.5 w-3.5" />
                Print receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
