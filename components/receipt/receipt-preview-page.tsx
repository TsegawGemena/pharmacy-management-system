"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CircleHelp,
  Download,
  Loader2,
  Printer,
} from "lucide-react";
import ReceiptDocument from "@/components/receipt/receipt-document";
import ThemeToggle from "@/components/theme-toggle";
import { getStoredUser } from "@/lib/api";
import type { ReceiptData } from "@/lib/receipt";
import { downloadReceiptPdf, printReceiptA5Async } from "@/lib/receipt";
import { receiptDataFromInvoice } from "@/lib/receipt-data";

interface ReceiptPreviewPageProps {
  invoiceId: string;
  backHref: string;
  backLabel?: string;
}

export default function ReceiptPreviewPage({
  invoiceId,
  backHref,
  backLabel = "Back",
}: ReceiptPreviewPageProps) {
  const router = useRouter();
  const [data, setData] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"print" | "pdf" | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    receiptDataFromInvoice(invoiceId)
      .then((receipt) => {
        if (!cancelled) setData(receipt);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load receipt. Please try again."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [invoiceId]);

  const handlePrint = useCallback(() => {
    if (!data) return;
    setBusy("print");
    try {
      void printReceiptA5Async(data);
    } catch {
      setError("Unable to open the print dialog. Please try again.");
    } finally {
      setTimeout(() => setBusy(null), 400);
    }
  }, [data]);

  const handleDownload = useCallback(async () => {
    if (!data) return;
    setBusy("pdf");
    setError(null);
    try {
      await downloadReceiptPdf(data);
    } catch {
      setError("Unable to generate PDF. Please try again.");
    } finally {
      setBusy(null);
    }
  }, [data]);

  const pharmacyName = data?.pharmacyName || getStoredUser()?.name || "Gammo Pharmacy";

  return (
    <div className="min-h-screen flex flex-col bg-[#e8eef5] dark:bg-[#0b1220] text-slate-800 dark:text-slate-100">
      {/* App chrome — hidden when printing */}
      <header className="no-print sticky top-0 z-20 border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => router.push(backHref)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{backLabel}</span>
            </button>
            <span className="text-sm font-bold text-[#0c4a6e] dark:text-sky-400 truncate">
              {pharmacyName}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
              title="Help"
              aria-label="Help"
            >
              <CircleHelp className="h-4 w-4" />
            </button>
            <ThemeToggle />
            <button
              type="button"
              disabled={!data || busy !== null}
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0c4a6e] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0a3d5c] disabled:opacity-60"
            >
              {busy === "print" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Printer className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Print Receipt</span>
              <span className="sm:hidden">Print</span>
            </button>
            <button
              type="button"
              disabled={!data || busy !== null}
              onClick={() => void handleDownload()}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-60"
            >
              {busy === "pdf" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Download PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* Preview area */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 py-8 sm:py-10">
        {loading && (
          <div className="no-print flex flex-col items-center gap-3 py-20 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-[#0c4a6e]" />
            <p className="text-sm">Loading receipt…</p>
          </div>
        )}

        {!loading && error && (
          <div className="no-print max-w-md rounded-xl border border-rose-200 bg-rose-50 px-6 py-8 text-center dark:border-rose-900 dark:bg-rose-950/40">
            <p className="text-sm font-medium text-rose-700 dark:text-rose-300">
              {error}
            </p>
            <Link
              href={backHref}
              className="mt-4 inline-block text-xs font-semibold text-[#0c4a6e] hover:underline"
            >
              {backLabel}
            </Link>
          </div>
        )}

        {!loading && data && (
          <ReceiptDocument data={data} className="print-receipt" />
        )}
      </main>

      <footer className="no-print border-t border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 py-4">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 text-[10px] text-slate-500 sm:flex-row sm:px-6">
          <p>© 2024 Gammo Pharmacy Management System | v2.4.0</p>
          <div className="flex gap-4">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
