"use client";

import React, { useEffect, useState } from "react";
import { X, Pencil, Plus, CheckCircle2 } from "lucide-react";
import type { Product, ProductStatus } from "@/lib/types";
import type { Category } from "@/lib/api/categories";

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  categories: Category[];
  onSave: (id: string, data: Partial<Product>) => Promise<void> | void;
  onAddCategory?: (name: string) => Promise<void> | void;
}

export default function EditProductModal({
  isOpen,
  onClose,
  product,
  categories,
  onSave,
  onAddCategory,
}: EditProductModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState<ProductStatus>("Active");
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [categorySuccess, setCategorySuccess] = useState<string | null>(null);
  const [addingCategory, setAddingCategory] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !product) return;
    setName(product.name || "");
    setCategory(product.category || "");
    setSku(product.sku || "");
    setPrice(String(product.price ?? ""));
    setStatus((product.status as ProductStatus) || "Active");
    setShowCreateCategory(false);
    setNewCategoryName("");
    setCategoryError(null);
    setCategorySuccess(null);
    setError(null);
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const categoryOptions = Array.from(
    new Set([
      ...categories.map((c) => c.name),
      ...(product.category ? [product.category] : []),
      ...(category ? [category] : []),
    ])
  ).filter(Boolean);

  const handleAddCategory = async () => {
    const value = newCategoryName.trim();
    if (!value) {
      setCategoryError("Category name is required.");
      return;
    }
    if (
      categoryOptions.some((c) => c.toLowerCase() === value.toLowerCase())
    ) {
      setCategoryError(`Category "${value}" already exists.`);
      return;
    }
    if (!onAddCategory) return;
    setAddingCategory(true);
    setCategoryError(null);
    try {
      await onAddCategory(value);
      setCategory(value);
      setNewCategoryName("");
      setShowCreateCategory(false);
      setCategorySuccess(`Category "${value}" added successfully.`);
    } catch (err) {
      setCategoryError(
        err instanceof Error ? err.message : "Failed to add category"
      );
    } finally {
      setAddingCategory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Medicine name is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(product.id, {
        name: name.trim(),
        category: category.trim(),
        sku: sku.trim(),
        price: price.trim(),
        status,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-100 dark:bg-sky-950/60 text-[#006699] dark:text-sky-400 rounded-lg">
              <Pencil className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Edit Product
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update medicine catalog details
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <p className="text-xs text-rose-600 bg-rose-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Name *
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg"
            >
              <option value="">Select existing category…</option>
              {categoryOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {!showCreateCategory ? (
              <button
                type="button"
                onClick={() => {
                  setShowCreateCategory(true);
                  setCategoryError(null);
                  setCategorySuccess(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#006699] hover:underline"
              >
                <Plus className="h-3.5 w-3.5" />
                Create New Category
              </button>
            ) : (
              <div className="rounded-xl border border-sky-200 bg-sky-50/60 dark:bg-sky-950/30 p-3 space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  New Category Name *
                </label>
                <input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg"
                  placeholder="e.g. Dermatology"
                />
                {categoryError && (
                  <p className="text-xs text-rose-600">{categoryError}</p>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateCategory(false)}
                    className="px-3 py-1.5 text-xs rounded-lg text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={addingCategory}
                    onClick={() => void handleAddCategory()}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#006699] text-white disabled:opacity-60"
                  >
                    {addingCategory ? "Adding…" : "Add Category"}
                  </button>
                </div>
              </div>
            )}
            {categorySuccess && (
              <p className="inline-flex items-center gap-1.5 text-xs text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {categorySuccess}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                SKU
              </label>
              <input
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Selling Price (ETB)
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProductStatus)}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-[#006699] text-white hover:bg-[#005580] disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
