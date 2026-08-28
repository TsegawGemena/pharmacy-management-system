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
  onRenameCategory?: (oldName: string, newName: string) => Promise<void> | void;
}

/** Edit only catalog basics — stock, batch, SKU, and purchase price are not editable here. */
export default function EditProductModal({
  isOpen,
  onClose,
  product,
  categories,
  onSave,
  onAddCategory,
  onRenameCategory,
}: EditProductModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<ProductStatus>("Active");
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [showRenameCategory, setShowRenameCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [renameCategoryName, setRenameCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [categorySuccess, setCategorySuccess] = useState<string | null>(null);
  const [addingCategory, setAddingCategory] = useState(false);
  const [renamingCategory, setRenamingCategory] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !product) return;
    setName(product.name || "");
    setCategory(product.category || "");
    setStatus((product.status as ProductStatus) || "Active");
    setShowCreateCategory(false);
    setShowRenameCategory(false);
    setNewCategoryName("");
    setRenameCategoryName("");
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
    if (categoryOptions.some((c) => c.toLowerCase() === value.toLowerCase())) {
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

  const handleRenameCategory = async () => {
    const value = renameCategoryName.trim();
    if (!category) {
      setCategoryError("Select a category to rename.");
      return;
    }
    if (!value) {
      setCategoryError("Category name cannot be empty.");
      return;
    }
    if (
      value.toLowerCase() !== category.toLowerCase() &&
      categoryOptions.some((c) => c.toLowerCase() === value.toLowerCase())
    ) {
      setCategoryError(`Category "${value}" already exists.`);
      return;
    }
    if (!onRenameCategory) {
      setCategoryError("Category rename is not available.");
      return;
    }
    setRenamingCategory(true);
    setCategoryError(null);
    try {
      await onRenameCategory(category, value);
      setCategory(value);
      setShowRenameCategory(false);
      setRenameCategoryName("");
      setCategorySuccess(`Category renamed to "${value}".`);
    } catch (err) {
      setCategoryError(
        err instanceof Error ? err.message : "Failed to rename category"
      );
    } finally {
      setRenamingCategory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Medicine name is required.");
      return;
    }
    if (!category.trim()) {
      setError("Category is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(product.id, {
        name: name.trim(),
        category: category.trim(),
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
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
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
                Fix name, category, or status only
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
              onChange={(e) => {
                setCategory(e.target.value);
                setShowRenameCategory(false);
                setCategoryError(null);
              }}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg"
            >
              <option value="">Select existing category…</option>
              {categoryOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {!showCreateCategory && !showRenameCategory ? (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateCategory(true);
                    setShowRenameCategory(false);
                    setCategoryError(null);
                    setCategorySuccess(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#006699] hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create New Category
                </button>
                {category && onRenameCategory && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowRenameCategory(true);
                      setShowCreateCategory(false);
                      setRenameCategoryName(category);
                      setCategoryError(null);
                      setCategorySuccess(null);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:underline"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit category name
                  </button>
                )}
              </div>
            ) : null}

            {showCreateCategory && (
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

            {showRenameCategory && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 p-3 space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Edit category name *
                </label>
                <input
                  value={renameCategoryName}
                  onChange={(e) => setRenameCategoryName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg"
                  placeholder="Category name"
                />
                {categoryError && (
                  <p className="text-xs text-rose-600">{categoryError}</p>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRenameCategory(false)}
                    className="px-3 py-1.5 text-xs rounded-lg text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={renamingCategory}
                    onClick={() => void handleRenameCategory()}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#006699] text-white disabled:opacity-60"
                  >
                    {renamingCategory ? "Saving…" : "Save name"}
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

          <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2">
            Stock quantity, prices, batch, and expiry are set when adding or
            restocking — not when editing the product.
          </p>

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
