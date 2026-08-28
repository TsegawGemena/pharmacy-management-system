"use client";

import React, { useEffect, useMemo, useState } from "react";
import { X, PackagePlus, Plus, CheckCircle2 } from "lucide-react";
import type { Product, ProductStatus } from "@/lib/types";
import MedicationSearch from "@/components/medication-search";

export interface EditAndRestockFormData {
  productId: string;
  name: string;
  category: string;
  unit: string;
  status: ProductStatus;
  /** Absolute quantity on hand (editable). */
  stockQuantity: number;
  /** Extra units to add as a restock. */
  quantity: number;
  purchasePrice: string;
  sellingPrice: string;
  expiryDate: string;
}

interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  categories?: string[];
  initialProductId?: string | null;
  onSave: (data: EditAndRestockFormData) => Promise<void> | void;
  onAddCategory?: (name: string) => Promise<void> | void;
  onRenameCategory?: (oldName: string, newName: string) => Promise<void> | void;
  onCreateNewProduct?: () => void;
}

export default function RestockModal({
  isOpen,
  onClose,
  products,
  categories = [],
  initialProductId,
  onSave,
  onAddCategory,
  onRenameCategory,
  onCreateNewProduct,
}: RestockModalProps) {
  const [search, setSearch] = useState("");
  const [productId, setProductId] = useState("");
  const [apiPick, setApiPick] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  /** Category name when the product (or select) was last applied — used to detect rename on save. */
  const [categoryOriginal, setCategoryOriginal] = useState("");
  const [unit, setUnit] = useState("Units");
  const [status, setStatus] = useState<ProductStatus>("Active");
  const [stockQuantity, setStockQuantity] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [purchasePrice, setPurchasePrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [localCategories, setLocalCategories] = useState<string[]>([]);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoryList = useMemo(() => {
    const fromProducts = products.map((p) => p.category).filter(Boolean);
    return Array.from(
      new Set([...categories, ...fromProducts, ...localCategories, category])
    )
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }, [categories, products, localCategories, category]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
    );
  }, [products, search]);

  const selected =
    products.find((p) => p.id === productId) ??
    (apiPick && apiPick.id === productId ? apiPick : null);

  const applyProduct = (prod: Product | null | undefined) => {
    if (!prod) {
      setName("");
      setCategory("");
      setCategoryOriginal("");
      setUnit("Units");
      setStatus("Active");
      setStockQuantity(0);
      setPurchasePrice("");
      setSellingPrice("");
      return;
    }
    setName(prod.name || "");
    setCategory(prod.category || "");
    setCategoryOriginal(prod.category || "");
    setUnit(prod.unit?.trim() || "Units");
    setStatus((prod.status as ProductStatus) || "Active");
    setStockQuantity(Math.max(0, Number(prod.stock) || 0));
    setSellingPrice(prod.price ? String(prod.price) : "");
    setPurchasePrice(prod.price ? String(prod.price) : "");
  };

  useEffect(() => {
    if (!isOpen) return;
    setSearch("");
    setQuantity(0);
    setExpiryDate("");
    setError(null);
    setShowCreateCategory(false);
    setNewCategoryName("");
    setCategoryError(null);
    setLocalCategories([]);
    setCategoryOriginal("");
    const initial =
      initialProductId && products.some((p) => p.id === initialProductId)
        ? initialProductId
        : products[0]?.id ?? "";
    setProductId(initial);
    applyProduct(products.find((p) => p.id === initial));
  }, [isOpen, initialProductId, products]);

  useEffect(() => {
    if (!isOpen || !selected) return;
    applyProduct(selected);
  }, [selected?.id]);

  if (!isOpen) return null;

  const handleAddCategory = async () => {
    const value = newCategoryName.trim();
    if (!value) {
      setCategoryError("Category name is required.");
      return;
    }
    if (categoryList.some((c) => c.toLowerCase() === value.toLowerCase())) {
      setCategoryError(`Category "${value}" already exists.`);
      return;
    }
    if (onAddCategory) {
      await onAddCategory(value);
    }
    setLocalCategories((prev) => [...prev, value]);
    setCategory(value);
    setCategoryOriginal(value);
    setNewCategoryName("");
    setShowCreateCategory(false);
    setCategoryError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) {
      setError("Please select a medicine.");
      return;
    }
    if (!name.trim()) {
      setError("Medicine name is required.");
      return;
    }
    const nextCategory = category.trim();
    if (!nextCategory) {
      setError("Category is required.");
      return;
    }
    const nextUnit = unit.trim() || "Units";
    if (stockQuantity < 0) {
      setError("Quantity on hand cannot be negative.");
      return;
    }
    if (quantity < 0) {
      setError("Quantity to add cannot be negative.");
      return;
    }

    const currentStock = selected?.stock ?? 0;
    const stockIncreased = stockQuantity > currentStock;
    const needsExpiry =
      quantity > 0 || (stockIncreased && currentStock === 0);
    if (needsExpiry && !expiryDate) {
      setError("Expiry date is required when adding or setting new stock.");
      return;
    }

    const selling = Number(sellingPrice);
    const purchase = Number(purchasePrice);
    if (sellingPrice !== "" && (Number.isNaN(selling) || selling < 0)) {
      setError("Selling price must be >= 0.");
      return;
    }
    if (purchasePrice !== "" && (Number.isNaN(purchase) || purchase < 0)) {
      setError("Purchase price must be >= 0.");
      return;
    }

    setSaving(true);
    setError(null);
    setCategoryError(null);
    try {
      if (
        onRenameCategory &&
        categoryOriginal &&
        nextCategory !== categoryOriginal
      ) {
        const collides = categoryList.some(
          (c) =>
            c.toLowerCase() === nextCategory.toLowerCase() &&
            c.toLowerCase() !== categoryOriginal.toLowerCase()
        );
        if (!collides) {
          await onRenameCategory(categoryOriginal, nextCategory);
          setLocalCategories((prev) =>
            Array.from(
              new Set(
                prev
                  .map((c) => (c === categoryOriginal ? nextCategory : c))
                  .concat(nextCategory)
              )
            )
          );
          setCategoryOriginal(nextCategory);
        }
      } else if (
        onAddCategory &&
        nextCategory &&
        !categoryList.some((c) => c.toLowerCase() === nextCategory.toLowerCase())
      ) {
        await onAddCategory(nextCategory);
        setLocalCategories((prev) => [...prev, nextCategory]);
        setCategoryOriginal(nextCategory);
      }

      await onSave({
        productId,
        name: name.trim(),
        category: nextCategory,
        unit: nextUnit,
        status,
        stockQuantity,
        quantity,
        purchasePrice,
        sellingPrice,
        expiryDate,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const fieldClass =
    "w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:outline-hidden focus:border-sky-500";
  const labelClass =
    "block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden transition-colors max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-100 dark:bg-sky-950/60 text-[#006699] dark:text-sky-400 rounded-lg">
              <PackagePlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Edit & Restock
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Fix product details and/or add stock in one step
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <p className="text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div>
            <label className={labelClass}>Search for medication *</label>
            <MedicationSearch
              placeholder="Search for medication…"
              clearOnSelect={false}
              onSelect={(p) => {
                setApiPick(p);
                setProductId(p.id);
                setSearch(p.name);
                applyProduct(p);
              }}
            />
            <p className="mt-1.5 text-[11px] text-slate-500">
              Or pick from the list below
            </p>
            <select
              required
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className={`${fieldClass} mt-2`}
            >
              {filtered.length === 0 && (
                <option value="">No medication found</option>
              )}
              {filtered.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.stock} {p.unit || "units"} — {p.price} ETB
                </option>
              ))}
            </select>
          </div>

          <section className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Product details
            </h4>

            <div>
              <label className={labelClass}>Name *</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={fieldClass}
              />
            </div>

            <div className="space-y-2">
              <label className={labelClass}>Category *</label>
              <select
                value={
                  categoryList.some((c) => c === category) ? category : ""
                }
                onChange={(e) => {
                  const value = e.target.value;
                  setCategory(value);
                  setCategoryOriginal(value);
                  setCategoryError(null);
                  setShowCreateCategory(false);
                }}
                className={fieldClass}
              >
                <option value="">Select category…</option>
                {categoryList.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <input
                required
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setCategoryError(null);
                }}
                className={fieldClass}
                placeholder="Edit category name here…"
                aria-label="Category name"
              />
              <p className="text-[10px] text-slate-400">
                Change the name above and save to rename this category for all products.
              </p>

              {!showCreateCategory ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateCategory(true);
                    setCategoryError(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#006699] hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create New Category
                </button>
              ) : (
                <div className="rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50/50 dark:bg-sky-950/30 p-3 space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    New Category Name *
                  </label>
                  <input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className={fieldClass}
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
                      onClick={() => void handleAddCategory()}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#006699] text-white"
                    >
                      Add Category
                    </button>
                  </div>
                </div>
              )}

              {categoryError && !showCreateCategory && (
                <p className="text-xs text-rose-600">{categoryError}</p>
              )}

              {category && !showCreateCategory && (
                <p className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Category: {category} ✓
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProductStatus)}
                className={fieldClass}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </section>

          <section className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 pt-3">
              Pricing & stock
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Purchase price (ETB)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className={`${fieldClass} font-mono`}
                />
              </div>
              <div>
                <label className={labelClass}>Selling price (ETB)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  className={`${fieldClass} font-mono`}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Quantity (units on hand) *</label>
              <input
                type="number"
                min={0}
                step={1}
                required
                value={stockQuantity}
                onChange={(e) =>
                  setStockQuantity(Math.max(0, Number(e.target.value) || 0))
                }
                className={`${fieldClass} font-mono text-base`}
              />
              <p className="mt-1 text-[10px] text-slate-400">
                Correct the stock number here (e.g. change 18 to 16). Current
                recorded stock: {selected?.stock ?? 0}.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Add stock (optional)</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(0, Number(e.target.value) || 0))
                  }
                  className={`${fieldClass} font-mono`}
                  placeholder="Extra units to add"
                />
                <p className="mt-1 text-[10px] text-slate-400">
                  Use only when receiving new stock on top of the quantity above.
                </p>
              </div>
              <div>
                <label className={labelClass}>
                  Expiry date
                  {quantity > 0 ||
                  (stockQuantity > (selected?.stock ?? 0) &&
                    (selected?.stock ?? 0) === 0)
                    ? " *"
                    : ""}
                </label>
                <input
                  type="date"
                  required={
                    quantity > 0 ||
                    (stockQuantity > (selected?.stock ?? 0) &&
                      (selected?.stock ?? 0) === 0)
                  }
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className={fieldClass}
                />
              </div>
            </div>
          </section>

          {onCreateNewProduct && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onCreateNewProduct();
              }}
              className="text-xs font-semibold text-[#006699] dark:text-sky-400 hover:underline inline-flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              Medicine not listed? Add new product
            </button>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !productId}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#006699] hover:bg-[#005580] rounded-lg disabled:opacity-60"
            >
              <PackagePlus className="h-4 w-4" />
              {saving
                ? "Saving..."
                : quantity > 0
                  ? "Save & Add Stock"
                  : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
