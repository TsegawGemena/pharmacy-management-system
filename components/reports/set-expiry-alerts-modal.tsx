"use client";

import React, { useEffect, useState } from "react";
import { X, CheckCircle2, ShieldAlert } from "lucide-react";
import type { AlertSettings } from "@/lib/api/settings";

interface SetExpiryAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSettings?: AlertSettings | null;
  onSave: (settings: AlertSettings) => void;
}

export default function SetExpiryAlertsModal({
  isOpen,
  onClose,
  initialSettings,
  onSave,
}: SetExpiryAlertsModalProps) {
  const [leadDays, setLeadDays] = useState(0);
  const [criticalDays, setCriticalDays] = useState(0);
  const [autoDiscount, setAutoDiscount] = useState(false);
  const [emailNotification, setEmailNotification] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLeadDays(Number(initialSettings?.daysBeforeExpiry ?? 0));
    setCriticalDays(Number(initialSettings?.criticalDays ?? 0));
    setAutoDiscount(Boolean(initialSettings?.autoDiscount ?? false));
    setEmailNotification(Boolean(initialSettings?.enabled ?? false));
  }, [isOpen, initialSettings]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      daysBeforeExpiry: leadDays,
      criticalDays,
      autoDiscount,
      enabled: emailNotification,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 rounded-lg">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Set Expiry Alerts</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Configure expiration thresholds & automated actions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Warning Window (Days before expiry)
            </label>
            <input
              type="number"
              min="0"
              max="180"
              value={leadDays}
              onChange={(e) => setLeadDays(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-sm font-mono border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-hidden focus:border-sky-500"
            />
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              Items flagged for monitoring and potential clearance promotions.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Critical Urgency Window (Days)
            </label>
            <input
              type="number"
              min="0"
              max="60"
              value={criticalDays}
              onChange={(e) => setCriticalDays(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-sm font-mono border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-hidden focus:border-sky-500"
            />
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              Requires immediate action (Return to vendor or clearance markdowns).
            </p>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoDiscount}
                onChange={(e) => setAutoDiscount(e.target.checked)}
                className="h-4 w-4 rounded text-[#006699] border-slate-300 dark:border-slate-600 focus:ring-[#006699]"
              />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Flag for clearance pricing when under 30 days
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={emailNotification}
                onChange={(e) => setEmailNotification(e.target.checked)}
                className="h-4 w-4 rounded text-[#006699] border-slate-300 dark:border-slate-600 focus:ring-[#006699]"
              />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Send weekly expiration risk summary to pharmacist
              </span>
            </label>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#006699] hover:bg-[#005580] rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Save Rules</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
