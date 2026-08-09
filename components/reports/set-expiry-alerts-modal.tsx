"use client";

import React, { useState } from "react";
import { X, Bell, CheckCircle2, ShieldAlert } from "lucide-react";

interface SetExpiryAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: any) => void;
}

export default function SetExpiryAlertsModal({
  isOpen,
  onClose,
  onSave,
}: SetExpiryAlertsModalProps) {
  const [leadDays, setLeadDays] = useState(90);
  const [criticalDays, setCriticalDays] = useState(30);
  const [autoDiscount, setAutoDiscount] = useState(true);
  const [emailNotification, setEmailNotification] = useState(true);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      leadDays,
      criticalDays,
      autoDiscount,
      emailNotification,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Set Expiry Alerts</h3>
              <p className="text-xs text-slate-500">Configure expiration thresholds & automated actions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Warning Window (Days before expiry)
            </label>
            <input
              type="number"
              min="30"
              max="180"
              value={leadDays}
              onChange={(e) => setLeadDays(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-hidden focus:border-sky-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Items flagged for monitoring and potential clearance promotions.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Critical Urgency Window (Days)
            </label>
            <input
              type="number"
              min="7"
              max="60"
              value={criticalDays}
              onChange={(e) => setCriticalDays(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-hidden focus:border-sky-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Requires immediate action (Return to vendor or clearance markdowns).
            </p>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoDiscount}
                onChange={(e) => setAutoDiscount(e.target.checked)}
                className="h-4 w-4 rounded text-[#006699] border-slate-300 focus:ring-[#006699]"
              />
              <span className="text-xs font-medium text-slate-700">
                Flag for clearance pricing when under 30 days
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={emailNotification}
                onChange={(e) => setEmailNotification(e.target.checked)}
                className="h-4 w-4 rounded text-[#006699] border-slate-300 focus:ring-[#006699]"
              />
              <span className="text-xs font-medium text-slate-700">
                Send weekly expiration risk summary to pharmacist
              </span>
            </label>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#006699] hover:bg-[#005580] rounded-lg transition-colors shadow-xs"
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
