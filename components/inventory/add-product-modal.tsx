"use client";

import React, { useEffect, useState } from "react";
import { X, Plus, PackageCheck } from "lucide-react";

export interface NewProductForm {
  name: string;
  category: string;
  batchNo?: string;
  stock: number;
  unitPrice: number | string;
  manufacturer?: string;
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: NewProductForm) => void | Promise<void>;
  categories?: string[];
  onAddCategory?: (name: string) => void | Promise<void>;
}

const FALLBACK_CATEGORIES = [
  "Antibiotics",
  "Pain Relief",
  "Cardiovascular",
  "Vitamins",
  "Gastrointestinal",
  "Diabetes Care",
  "Respiratory",
  "Dermatology",
];

export default function AddProductModal({
  isOpen,
  onClose,
  onAddProduct,
  categories,
  onAddCategory,
}: AddProductModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    batchNo: "",
    manufacturer: "",
    stock: 0,
    unitPrice: 0,
  });
  const [newCategory, setNewCategory] = useState("");
  const [saving, setSaving] = useState(false);

  const categoryList =
    categories && categories.length > 0 ? categories : FALLBACK_CATEGORIES;

  useEffect(() => {
    if (!isOpen) return;
    setFormData({
      name: "",
      category: categoryList[0] || "",
      batchNo: "",
      manufacturer: "",
      stock: 0,
      unitPrice: 0,
    });
    setNewCategory("");
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onAddProduct({
        name: formData.name,
        category: formData.category,
        batchNo: formData.batchNo,
        manufacturer: formData.manufacturer,
        stock: Number(formData.stock),
        unitPrice: Number(formData.unitPrice).toFixed(2),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-100 dark:bg-sky-950/80 text-[#006699] dark:text-sky-400 rounded-lg">
              <PackageCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Create New Product
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Add a medicine that does not exist in the catalog yet
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
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Product Name & Strength *
            </label>
            <input
              type="text"
              required
              placeholder="Medicine name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
              >
                {categoryList.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
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
                      setFormData((f) => ({ ...f, category: newCategory.trim() }));
                      setNewCategory("");
                    }}
                    className="px-2 py-1.5 text-xs font-semibold text-[#006699] border border-sky-200 rounded-lg"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                SKU
              </label>
              <input
                type="text"
                value={formData.batchNo}
                onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
                className="w-full px-3 py-2 text-sm font-mono border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Manufacturer
            </label>
            <input
              type="text"
              value={formData.manufacturer}
              onChange={(e) =>
                setFormData({ ...formData, manufacturer: e.target.value })
              }
              className="w-full px-3.5 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Initial Stock Qty
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-sm font-mono border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Unit Price (ETB) *
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                required
                value={formData.unitPrice}
                onChange={(e) =>
                  setFormData({ ...formData, unitPrice: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-sm font-mono border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
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
              {saving ? "Saving..." : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
