"use client";

import React, { useEffect, useMemo, useState } from "react";
import { X, Plus, PackageCheck, CheckCircle2, Pencil } from "lucide-react";
import { productCreationErrorMessage } from "@/lib/api/error-message";

export interface NewProductForm {
  name: string;
  category: string;
  unit: string;
  status: "Active" | "Inactive";
  quantity: number;
  expiryDate: string;
  purchasePrice: number | string;
  sellingPrice: number | string;
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: NewProductForm) => void | Promise<void>;
  categories?: string[];
  onAddCategory?: (name: string) => void | Promise<void>;
  onRenameCategory?: (oldName: string, newName: string) => void | Promise<void>;
}

const FALLBACK_CATEGORIES = [
  "Antibiotics",
  "Pain Relief",
  "Analgesics",
  "Vitamins",
];

export default function AddProductModal({
  isOpen,
  onClose,
  onAddProduct,
  categories,
  onAddCategory,
  onRenameCategory,
}: AddProductModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    unit: "Units",
    status: "Active" as "Active" | "Inactive",
    quantity: 0,
    expiryDate: "",
    purchasePrice: "",
    sellingPrice: "",
  });
  const [localCategories, setLocalCategories] = useState<string[]>([]);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [showRenameCategory, setShowRenameCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [renameCategoryName, setRenameCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [categorySuccess, setCategorySuccess] = useState<string | null>(null);
  const [addingCategory, setAddingCategory] = useState(false);
  const [renamingCategory, setRenamingCategory] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const categoryList = useMemo(() => {
    const base =
      categories && categories.length > 0 ? categories : FALLBACK_CATEGORIES;
    return Array.from(new Set([...base, ...localCategories])).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [categories, localCategories]);

  useEffect(() => {
    if (!isOpen) return;
    setFormData({
      name: "",
      category: "",
      unit: "Units",
      status: "Active",
      quantity: 0,
      expiryDate: "",
      purchasePrice: "",
      sellingPrice: "",
    });
    setLocalCategories([]);
    setShowCreateCategory(false);
    setShowRenameCategory(false);
    setNewCategoryName("");
    setRenameCategoryName("");
    setCategoryError(null);
    setCategorySuccess(null);
    setAddingCategory(false);
    setRenamingCategory(false);
    setSaving(false);
    setFormError(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) {
      setCategoryError("Category name is required.");
      setCategorySuccess(null);
      return;
    }

    const duplicate = categoryList.some(
      (c) => c.toLowerCase() === name.toLowerCase()
    );
    if (duplicate) {
      setCategoryError(`Category "${name}" already exists.`);
      setCategorySuccess(null);
      return;
    }

    if (!onAddCategory) {
      setLocalCategories((prev) => [...prev, name]);
      setFormData((f) => ({ ...f, category: name }));
      setNewCategoryName("");
      setShowCreateCategory(false);
      setCategoryError(null);
      setCategorySuccess(`Category "${name}" added successfully.`);
      return;
    }

    setAddingCategory(true);
    setCategoryError(null);
    try {
      await onAddCategory(name);
      setLocalCategories((prev) =>
        prev.some((c) => c.toLowerCase() === name.toLowerCase())
          ? prev
          : [...prev, name]
      );
      setFormData((f) => ({ ...f, category: name }));
      setNewCategoryName("");
      setShowCreateCategory(false);
      setCategorySuccess(`Category "${name}" added successfully.`);
    } catch (err) {
      setCategorySuccess(null);
      setCategoryError(
        err instanceof Error ? err.message : "Failed to create category"
      );
    } finally {
      setAddingCategory(false);
    }
  };

  const handleRenameCategory = async () => {
    const current = formData.category;
    const name = renameCategoryName.trim();
    if (!current) {
      setCategoryError("Select a category to rename.");
      return;
    }
    if (!name) {
      setCategoryError("Category name cannot be empty.");
      return;
    }
    if (
      name.toLowerCase() !== current.toLowerCase() &&
      categoryList.some((c) => c.toLowerCase() === name.toLowerCase())
    ) {
      setCategoryError(`Category "${name}" already exists.`);
      return;
    }
    if (!onRenameCategory) {
      setCategoryError("Category rename is not available.");
      return;
    }
    setRenamingCategory(true);
    setCategoryError(null);
    try {
      await onRenameCategory(current, name);
      setLocalCategories((prev) =>
        Array.from(
          new Set(prev.map((c) => (c === current ? name : c)).concat(name))
        )
      );
      setFormData((f) => ({ ...f, category: name }));
      setShowRenameCategory(false);
      setRenameCategoryName("");
      setCategorySuccess(`Category renamed to "${name}".`);
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
    setFormError(null);

    if (!formData.category.trim()) {
      setCategoryError("Please select or create a category.");
      return;
    }
    if (!formData.expiryDate) {
      setFormError("Expiry Date is required.");
      return;
    }
    if (formData.purchasePrice === "" || formData.sellingPrice === "") {
      setFormError("Purchase Price and Selling Price are required.");
      return;
    }

    const purchase = Number(formData.purchasePrice);
    const selling = Number(formData.sellingPrice);
    if (Number.isNaN(purchase) || purchase < 0) {
      setFormError("Purchase Price must be a number >= 0.");
      return;
    }
    if (Number.isNaN(selling) || selling < 0) {
      setFormError("Selling Price must be a number >= 0.");
      return;
    }

    setSaving(true);
    try {
      await onAddProduct({
        name: formData.name.trim(),
        category: formData.category.trim(),
        unit: formData.unit.trim() || "Units",
        status: formData.status,
        quantity: Number(formData.quantity) || 0,
        expiryDate: formData.expiryDate,
        purchasePrice: purchase.toFixed(2),
        sellingPrice: selling.toFixed(2),
      });
      onClose();
    } catch (err) {
      setFormError(productCreationErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const fieldClass =
    "w-full px-3.5 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg";
  const labelClass =
    "block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-100 dark:bg-sky-950/80 text-[#006699] dark:text-sky-400 rounded-lg">
              <PackageCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Add New Product
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {formError && (
            <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-lg px-3 py-2">
              {formError}
            </p>
          )}

          <section className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Product Information
            </h4>

            <div>
              <label className={labelClass}>Product Name *</label>
              <input
                type="text"
                required
                placeholder="Medicine name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={fieldClass}
              />
            </div>

            <div className="space-y-2">
              <label className={labelClass}>Category *</label>
              <select
                required={!showCreateCategory && !showRenameCategory}
                value={formData.category}
                onChange={(e) => {
                  setFormData({ ...formData, category: e.target.value });
                  setCategoryError(null);
                  setCategorySuccess(null);
                  setShowRenameCategory(false);
                }}
                className={fieldClass}
              >
                <option value="">Select existing category…</option>
                {categoryList.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {formData.category && !showCreateCategory && !showRenameCategory && (
                <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Category: {formData.category} ✓
                </p>
              )}

              {!showCreateCategory && !showRenameCategory ? (
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateCategory(true);
                      setShowRenameCategory(false);
                      setCategoryError(null);
                      setCategorySuccess(null);
                      setNewCategoryName("");
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#006699] dark:text-sky-400 hover:underline"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Create New Category
                  </button>
                  {formData.category && onRenameCategory && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowRenameCategory(true);
                        setShowCreateCategory(false);
                        setRenameCategoryName(formData.category);
                        setCategoryError(null);
                        setCategorySuccess(null);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:underline"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit category name
                    </button>
                  )}
                </div>
              ) : null}

              {showCreateCategory && (
                <div className="rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50/60 dark:bg-sky-950/30 p-3.5 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      New Category Name *
                    </label>
                    <input
                      type="text"
                      autoFocus
                      value={newCategoryName}
                      onChange={(e) => {
                        setNewCategoryName(e.target.value);
                        setCategoryError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          void handleAddCategory();
                        }
                      }}
                      placeholder="e.g. Dermatology"
                      className={fieldClass}
                    />
                  </div>
                  {categoryError && (
                    <p className="text-xs text-rose-600 dark:text-rose-400">
                      {categoryError}
                    </p>
                  )}
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      disabled={addingCategory}
                      onClick={() => {
                        setShowCreateCategory(false);
                        setNewCategoryName("");
                        setCategoryError(null);
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 rounded-lg hover:bg-white/80 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={addingCategory}
                      onClick={() => void handleAddCategory()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#006699] hover:bg-[#005580] rounded-lg disabled:opacity-60"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {addingCategory ? "Adding…" : "Add Category"}
                    </button>
                  </div>
                </div>
              )}

              {showRenameCategory && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 p-3.5 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Edit category name *
                    </label>
                    <input
                      type="text"
                      autoFocus
                      value={renameCategoryName}
                      onChange={(e) => {
                        setRenameCategoryName(e.target.value);
                        setCategoryError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          void handleRenameCategory();
                        }
                      }}
                      placeholder="Category name"
                      className={fieldClass}
                    />
                  </div>
                  {categoryError && (
                    <p className="text-xs text-rose-600 dark:text-rose-400">
                      {categoryError}
                    </p>
                  )}
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      disabled={renamingCategory}
                      onClick={() => {
                        setShowRenameCategory(false);
                        setCategoryError(null);
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 rounded-lg hover:bg-white/80 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={renamingCategory}
                      onClick={() => void handleRenameCategory()}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-[#006699] hover:bg-[#005580] rounded-lg disabled:opacity-60"
                    >
                      {renamingCategory ? "Saving…" : "Save name"}
                    </button>
                  </div>
                </div>
              )}

              {categorySuccess && (
                <p className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg px-3 py-2">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  {categorySuccess}
                </p>
              )}

              {categoryError && !showCreateCategory && !showRenameCategory && (
                <p className="text-xs text-rose-600 dark:text-rose-400">
                  {categoryError}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as "Active" | "Inactive",
                  })
                }
                className={fieldClass}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Unit of drug *</label>
              <select
                required
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                className={fieldClass}
              >
                <option value="Units">Units</option>
                <option value="Tablets">Tablets</option>
                <option value="Capsules">Capsules</option>
                <option value="Bottles">Bottles</option>
                <option value="Boxes">Boxes</option>
                <option value="Packs">Packs</option>
                <option value="Sachets">Sachets</option>
                <option value="Vials">Vials</option>
                <option value="Tubes">Tubes</option>
                <option value="ml">ml</option>
              </select>
            </div>
          </section>

          <section className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 pt-3">
              Initial Stock
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Quantity *</label>
                <input
                  type="number"
                  min={0}
                  required
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: Number(e.target.value),
                    })
                  }
                  className={`${fieldClass} font-mono`}
                />
              </div>
              <div>
                <label className={labelClass}>Expiry Date *</label>
                <input
                  type="date"
                  required
                  value={formData.expiryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expiryDate: e.target.value })
                  }
                  className={fieldClass}
                />
              </div>
            </div>
          </section>

          <section className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 pt-3">
              Pricing
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Purchase Price (ETB) *</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  required
                  placeholder="80.00"
                  value={formData.purchasePrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      purchasePrice: e.target.value,
                    })
                  }
                  className={`${fieldClass} font-mono`}
                />
              </div>
              <div>
                <label className={labelClass}>Selling Price (ETB) *</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  required
                  placeholder="100.00"
                  value={formData.sellingPrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sellingPrice: e.target.value,
                    })
                  }
                  className={`${fieldClass} font-mono`}
                />
              </div>
            </div>
          </section>

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
              {saving ? "Saving..." : "Add New Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
