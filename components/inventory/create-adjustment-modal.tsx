"use client";

import React, { useState } from "react";
import { X, Plus, AlertCircle, RefreshCw } from "lucide-react";

interface CreateAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAdjustment: (adj: any) => void;
}

export default function CreateAdjustmentModal({
  isOpen,
  onClose,
  onAddAdjustment,
}: CreateAdjustmentModalProps) {
  const [formData, setFormData] = useState({
    productName: "Amoxicillin 500mg Capsules",
    sku: "AMX-500-CP",
    type: "Expired", // Expired, Inventory Count, Damaged, Theft / Lost, Return
    qtyChange: -5,
    adjustedBy: "Dr. Tadesse",
    reason: "Damaged packaging during shelf relocation.",
    status: "Completed",
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddAdjustment({
      id: `#ADJ-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      productName: formData.productName,
      sku: formData.sku,
      type: formData.type,
      qtyChange: formData.qtyChange,
      adjustedBy: formData.adjustedBy,
      status: formData.status,
      reason: formData.reason,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-100 text-[#006699] rounded-lg">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Create Stock Adjustment</h3>
              <p className="text-xs text-slate-500">Record discrepancy, damaged, or expired stock</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Product & SKU *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                required
                placeholder="Product Name"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                className="col-span-2 px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-sky-500"
              />
              <input
                type="text"
                required
                placeholder="SKU"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="col-span-1 px-3 py-2 text-xs sm:text-sm font-mono border border-slate-200 rounded-lg focus:outline-hidden focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Adjustment Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => {
                  const newType = e.target.value;
                  setFormData({
                    ...formData,
                    type: newType,
                    qtyChange: newType === "Inventory Count" ? 10 : -Math.abs(formData.qtyChange),
                  });
                }}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-sky-500 bg-white"
              >
                <option value="Expired">Expired</option>
                <option value="Damaged">Damaged</option>
                <option value="Inventory Count">Inventory Count (+/-)</option>
                <option value="Theft / Lost">Theft / Lost</option>
                <option value="Return to Supplier">Return to Supplier</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Qty Change (+ or -) *
              </label>
              <input
                type="number"
                required
                value={formData.qtyChange}
                onChange={(e) => setFormData({ ...formData, qtyChange: Number(e.target.value) })}
                className={`w-full px-3 py-2 text-xs sm:text-sm font-mono font-bold border border-slate-200 rounded-lg focus:outline-hidden focus:border-sky-500 ${
                  formData.qtyChange < 0 ? "text-rose-600" : "text-emerald-600"
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Adjusted By *
              </label>
              <input
                type="text"
                required
                value={formData.adjustedBy}
                onChange={(e) => setFormData({ ...formData, adjustedBy: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-sky-500 bg-white"
              >
                <option value="Completed">Completed</option>
                <option value="Pending Review">Pending Review</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Reason / Discrepancy Note
            </label>
            <textarea
              rows={2}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-sky-500"
            />
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
              <Plus className="h-4 w-4" />
              <span>Record Adjustment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
