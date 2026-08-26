"use client";

import React, { useEffect, useState } from "react";
import { X, Plus, RefreshCw, Trash2 } from "lucide-react";
import { getStoredUser } from "@/lib/api";
import type { Adjustment, AdjustmentStatus, AdjustmentType } from "@/lib/types";

const EMPTY_FORM = {
  productName: "",
  sku: "",
  category: "",
  price: "",
  type: "Expired" as AdjustmentType,
  qtyChange: -1,
  adjustedBy: "",
  reason: "",
  status: "Completed" as AdjustmentStatus,
};

interface AdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (adj: Partial<Adjustment>) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
  initial?: Adjustment | null;
  categories?: string[];
  onAddCategory?: (name: string) => void | Promise<void>;
}

export default function CreateAdjustmentModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initial = null,
  categories = [],
  onAddCategory,
}: AdjustmentModalProps) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const isEdit = Boolean(initial?.id);

  useEffect(() => {
    if (!isOpen) return;
    if (initial) {
      setFormData({
        productName: initial.productName || "",
        sku: initial.sku || "",
        category: initial.category || "",
        price: initial.price || "",
        type: initial.type || "Expired",
        qtyChange: initial.qtyChange ?? -1,
        adjustedBy: initial.adjustedBy || "",
        reason: initial.reason || "",
        status: initial.status || "Completed",
      });
    } else {
      const user = getStoredUser();
      setFormData({
        ...EMPTY_FORM,
        adjustedBy: user?.name ?? "",
      });
    }
  }, [isOpen, initial]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productName.trim()) return;
    setSaving(true);
    try {
      await onSave({
        ...(initial?.id ? { id: initial.id } : {}),
        date: initial?.date || new Date().toISOString().split("T")[0],
        productName: formData.productName.trim(),
        sku: formData.sku.trim() || formData.productName.trim(),
        category: formData.category.trim() || undefined,
        price: formData.price.trim() || undefined,
        type: formData.type,
        qtyChange: formData.qtyChange,
        adjustedBy: formData.adjustedBy,
        status: formData.status,
        reason: formData.reason,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-100 dark:bg-sky-950/60 text-[#006699] dark:text-sky-400 rounded-lg">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                {isEdit ? "Edit Stock Adjustment" : "Create Stock Adjustment"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Edit medicine details and stock change
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Medicine name *
            </label>
            <input
              type="text"
              required
              value={formData.productName}
              onChange={(e) =>
                setFormData({ ...formData, productName: e.target.value })
              }
              className="w-full px-3.5 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg"
            />
          </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Category
              </label>
              {categories.length > 0 ? (
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg"
                >
                  <option value="">Select category</option>
                  {Array.from(
                    new Set(
                      [...categories, formData.category].filter(Boolean)
                    )
                  ).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg"
                />
              )}
              {onAddCategory && (
                <div className="flex gap-2 mt-2">
                  <input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="New category"
                    className="flex-1 px-2 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!newCategory.trim()) return;
                      await onAddCategory(newCategory.trim());
                      setFormData((f) => ({
                        ...f,
                        category: newCategory.trim(),
                      }));
                      setNewCategory("");
                    }}
                    className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-[#006699] border border-sky-200 rounded-lg"
                  >
                    <Plus className="h-3 w-3" />
                    Add
                  </button>
                </div>
              )}
            </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Selling price (ETB)
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-3 py-2 text-sm font-mono border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Adjustment type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => {
                  const newType = e.target.value as AdjustmentType;
                  setFormData({
                    ...formData,
                    type: newType,
                    qtyChange:
                      newType === "Inventory Count"
                        ? formData.qtyChange || 1
                        : -Math.abs(formData.qtyChange || 1),
                  });
                }}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
              >
                <option value="Expired">Expired</option>
                <option value="Damaged">Damaged</option>
                <option value="Inventory Count">Inventory Count (+/-)</option>
                <option value="Theft / Lost">Theft / Lost</option>
                <option value="Write-off">Write-off</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Qty change (+ or -) *
              </label>
              <input
                type="number"
                required
                value={formData.qtyChange}
                onChange={(e) =>
                  setFormData({ ...formData, qtyChange: Number(e.target.value) })
                }
                className={`w-full px-3 py-2 text-sm font-mono font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg ${
                  formData.qtyChange < 0 ? "text-rose-600" : "text-emerald-600"
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Adjusted by *
              </label>
              <input
                type="text"
                required
                value={formData.adjustedBy}
                onChange={(e) =>
                  setFormData({ ...formData, adjustedBy: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as AdjustmentStatus,
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
              >
                <option value="Completed">Completed</option>
                <option value="Pending Review">Pending Review</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Reason
            </label>
            <textarea
              rows={2}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg"
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            {isEdit && onDelete && initial?.id ? (
              <button
                type="button"
                onClick={async () => {
                  if (!confirm("Delete this adjustment?")) return;
                  await onDelete(initial.id);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[#006699] hover:bg-[#005580] rounded-lg disabled:opacity-60"
              >
                <Plus className="h-4 w-4" />
                {saving ? "Saving..." : isEdit ? "Save" : "Record Adjustment"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
