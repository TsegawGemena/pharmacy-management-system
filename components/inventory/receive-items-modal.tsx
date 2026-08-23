"use client";

import React, { useState } from "react";
import { X, PackageCheck, CheckCircle2, AlertCircle } from "lucide-react";

interface ReceiveItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  poNumber: string;
  items: Array<{
    name: string;
    sku: string;
    qty: number;
    unitPrice: string;
  }>;
  onConfirmReceive: (data: any) => void;
}

export default function ReceiveItemsModal({
  isOpen,
  onClose,
  poNumber,
  items,
  onConfirmReceive,
}: ReceiveItemsModalProps) {
  const [receivedQtys, setReceivedQtys] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    items.forEach((item) => {
      initial[item.sku] = item.qty;
    });
    return initial;
  });

  const [batchNumbers, setBatchNumbers] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    items.forEach((item) => {
      initial[item.sku] = "";
    });
    return initial;
  });

  const [storageLocations, setStorageLocations] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    items.forEach((item) => {
      initial[item.sku] = "";
    });
    return initial;
  });

  const [notes, setNotes] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      onConfirmReceive({
        poNumber,
        receivedQtys,
        batchNumbers,
        storageLocations,
        notes,
        receivedAt: new Date().toISOString(),
      });
      setIsSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-xl overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 rounded-lg">
              <PackageCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Receive Shipment Items</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verify quantities and assign batch numbers for <span className="font-mono font-semibold text-sky-600 dark:text-sky-400">{poNumber}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleConfirm} className="p-6 space-y-4">
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3">Ordered</th>
                  <th className="py-2.5 px-3">Receiving Qty</th>
                  <th className="py-2.5 px-3">Batch Assigned</th>
                  <th className="py-2.5 px-3">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((item) => (
                  <tr key={item.sku} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      <div>{item.name}</div>
                      <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{item.sku}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400 font-medium">
                      {item.qty} units
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min="1"
                        max={item.qty * 2}
                        value={receivedQtys[item.sku] ?? item.qty}
                        onChange={(e) =>
                          setReceivedQtys({
                            ...receivedQtys,
                            [item.sku]: Number(e.target.value),
                          })
                        }
                        className="w-16 px-2 py-1 text-xs font-mono font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-md focus:border-sky-500"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={batchNumbers[item.sku] ?? ""}
                        onChange={(e) =>
                          setBatchNumbers({
                            ...batchNumbers,
                            [item.sku]: e.target.value,
                          })
                        }
                        className="w-24 px-2 py-1 text-xs font-mono border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-md focus:border-sky-500"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={storageLocations[item.sku] ?? ""}
                        onChange={(e) =>
                          setStorageLocations({
                            ...storageLocations,
                            [item.sku]: e.target.value,
                          })
                        }
                        className="w-20 px-2 py-1 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-md focus:border-sky-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Receiving Notes / Quality Inspection
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-hidden focus:border-sky-500"
            />
          </div>

          <div className="bg-sky-50 dark:bg-sky-950/50 border border-sky-100 dark:border-sky-800/60 rounded-lg p-3 text-xs text-sky-800 dark:text-sky-300 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
            <span>
              Confirming receipt will automatically increment stock quantities in your active inventory ledger and update this Purchase Order status to <strong className="font-semibold">RECEIVED</strong>.
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSuccess}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSuccess}
              className={`inline-flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-semibold text-white rounded-lg transition-all shadow-xs cursor-pointer ${
                isSuccess
                  ? "bg-emerald-600"
                  : "bg-[#006699] hover:bg-[#005580]"
              }`}
            >
              {isSuccess ? (
                <>
                  <CheckCircle2 className="h-4 w-4 animate-bounce" />
                  <span>Stock Updated!</span>
                </>
              ) : (
                <>
                  <PackageCheck className="h-4 w-4" />
                  <span>Confirm & Stock In</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
