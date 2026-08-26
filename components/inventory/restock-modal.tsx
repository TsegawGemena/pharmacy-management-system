"use client";

import React, { useEffect, useMemo, useState } from "react";
import { X, PackagePlus, Search, Plus } from "lucide-react";
import type { Product } from "@/lib/types";

export interface RestockFormData {
  productId: string;
  quantity: number;
  unitPrice: string;
  batchNo: string;
  expiryDate: string;
}

interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  initialProductId?: string | null;
  onRestock: (data: RestockFormData) => Promise<void> | void;
  onCreateNewProduct?: () => void;
}

export default function RestockModal({
  isOpen,
  onClose,
  products,
  initialProductId,
  onRestock,
  onCreateNewProduct,
}: RestockModalProps) {
  const [search, setSearch] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState("");
  const [batchNo, setBatchNo] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
    );
  }, [products, search]);

  const selected = products.find((p) => p.id === productId) ?? null;

  useEffect(() => {
    if (!isOpen) return;
    setSearch("");
    setQuantity(1);
    setBatchNo("");
    setExpiryDate("");
    setError(null);
    const initial =
      initialProductId && products.some((p) => p.id === initialProductId)
        ? initialProductId
        : products[0]?.id ?? "";
    setProductId(initial);
    const prod = products.find((p) => p.id === initial);
    setUnitPrice(prod?.price ? String(prod.price) : "");
  }, [isOpen, initialProductId, products]);

  useEffect(() => {
    if (!selected) return;
    setUnitPrice(selected.price ? String(selected.price) : "");
  }, [selected?.id]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) {
      setError("Please select a medicine to restock.");
      return;
    }
    if (quantity <= 0) {
      setError("Quantity to add must be greater than 0.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onRestock({
        productId,
        quantity,
        unitPrice,
        batchNo,
        expiryDate,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to restock");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden transition-colors max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-100 dark:bg-sky-950/60 text-[#006699] dark:text-sky-400 rounded-lg">
              <PackagePlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Restock / Add Stock
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Increase inventory for an existing medicine
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <p className="text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Search medicine *
            </label>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or SKU..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:outline-hidden focus:border-sky-500"
              />
            </div>
            <select
              required
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:outline-hidden focus:border-sky-500"
            >
              {filtered.length === 0 && (
                <option value="">No medicines found</option>
              )}
              {filtered.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku || "no SKU"}) — stock {p.stock}
                </option>
              ))}
            </select>
          </div>

          {selected && (
            <div className="rounded-xl border border-sky-100 dark:border-sky-900/50 bg-sky-50/60 dark:bg-sky-950/30 p-3 text-xs space-y-1.5">
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Medicine</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100 text-right">
                  {selected.name}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">SKU</span>
                <span className="font-mono">{selected.sku || "—"}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Current stock</span>
                <span className="font-bold">{selected.stock} units</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Current price</span>
                <span className="font-mono">ETB {selected.price}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Quantity to add *
              </label>
              <input
                type="number"
                min={1}
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:outline-hidden focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Unit price (ETB)
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:outline-hidden focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Batch number
              </label>
              <input
                type="text"
                value={batchNo}
                onChange={(e) => setBatchNo(e.target.value)}
                placeholder="Optional"
                className="w-full px-3 py-2 text-sm font-mono border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:outline-hidden focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Expiry date
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:outline-hidden focus:border-sky-500"
              />
            </div>
          </div>

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
              Medicine not listed? Create new product
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
              {saving ? "Saving..." : "Add Stock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
