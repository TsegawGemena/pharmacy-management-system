"use client";

import React, { useMemo, useState } from "react";
import { Package, PackagePlus, Pencil, Plus, Search } from "lucide-react";
import AdminHeader from "@/components/admin/admin-header";
import AddProductModal from "@/components/inventory/add-product-modal";
import RestockModal from "@/components/inventory/restock-modal";
import EditProductModal from "@/components/inventory/edit-product-modal";
import { PageState } from "@/components/ui/page-state";
import {
  getProducts,
  createProduct,
  updateProduct,
  restockInventory,
  getCategories,
  createCategory,
} from "@/lib/api";
import type { Product } from "@/lib/types";
import type { Category } from "@/lib/api/categories";
import { useApi } from "@/lib/hooks/use-api";

export default function AdminProductsPage() {
  const { data, loading, error, refetch } = useApi(getProducts);
  const {
    data: categoriesData,
    refetch: refetchCategories,
  } = useApi(getCategories, []);
  const products = data?.data ?? [];
  const categories = categoriesData ?? [];
  const [query, setQuery] = useState("");
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [restockProductId, setRestockProductId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q)
    );
  }, [products, query]);

  const categoryOptions = useMemo(() => {
    const fromApi = categories.map((c) => c.name);
    const fromProducts = products.map((p) => p.category).filter(Boolean);
    return Array.from(new Set([...fromApi, ...fromProducts])).sort();
  }, [categories, products]);

  const handleAddCategory = async (name: string) => {
    await createCategory(name);
    await refetchCategories();
    showToast(`Category "${name}" added`);
  };

  const handleCreateProduct = async (newProd: {
    name: string;
    category: string;
    batchNo?: string;
    stock: number;
    unitPrice: number | string;
    manufacturer?: string;
  }) => {
    const created = await createProduct({
      name: newProd.name,
      category: newProd.category,
      sku: newProd.batchNo || undefined,
      manufacturer: newProd.manufacturer || "",
      price: Number(newProd.unitPrice).toFixed(2),
      stock: newProd.stock,
      status: "Active",
    });
    await refetch();
    showToast(`Created ${newProd.name}`);
    if (created?.id) {
      setRestockProductId(created.id);
      setIsRestockOpen(true);
    }
  };

  const handleRestock = async (form: {
    productId: string;
    quantity: number;
    unitPrice: string;
    batchNo: string;
    expiryDate: string;
  }) => {
    await restockInventory({
      productId: form.productId,
      quantity: form.quantity,
      unitPrice: form.unitPrice || undefined,
      batchNo: form.batchNo || undefined,
      expiryDate: form.expiryDate || undefined,
    });
    await refetch();
    showToast("Stock added successfully");
  };

  const handleSaveProduct = async (id: string, payload: Partial<Product>) => {
    await updateProduct(id, payload);
    await refetch();
    showToast("Product updated");
  };

  return (
    <div>
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-xl shadow-lg">
          {toastMessage}
        </div>
      )}

      <AdminHeader
        title="Products"
        subtitle="Manage the pharmacy product catalog, categories, and pricing."
        searchPlaceholder="Search products..."
      />

      <div className="flex justify-end gap-2 mb-4 -mt-2">
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold"
        >
          <Plus className="h-3.5 w-3.5" />
          Create New Product
        </button>
        <button
          type="button"
          onClick={() => {
            setRestockProductId(null);
            setIsRestockOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0c3e66] text-white text-xs font-semibold"
        >
          <PackagePlus className="h-3.5 w-3.5" />
          Restock
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search catalog..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 py-2 pl-9 pr-3 text-xs font-medium focus:border-sky-500 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        <PageState loading={loading} error={error} onRetry={refetch} empty={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Product</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5">SKU</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Price (ETB)</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      <Package className="h-5 w-5 mx-auto mb-2 opacity-50" />
                      No products found
                    </td>
                  </tr>
                )}
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-5 font-semibold text-slate-800 dark:text-slate-100">
                      {p.name}
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300">
                      {p.category || "—"}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-slate-500">
                      {p.sku || "—"}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600">
                        {p.status || "—"}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono font-semibold">
                      {p.price ?? "—"}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingProduct(p)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRestockProductId(p.id);
                            setIsRestockOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#0c3e66] text-white text-[11px] font-semibold"
                        >
                          <PackagePlus className="h-3 w-3" />
                          Restock
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PageState>
      </div>

      <RestockModal
        isOpen={isRestockOpen}
        onClose={() => {
          setIsRestockOpen(false);
          setRestockProductId(null);
        }}
        products={products}
        initialProductId={restockProductId}
        onRestock={handleRestock}
        onCreateNewProduct={() => setIsCreateOpen(true)}
      />

      <AddProductModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onAddProduct={handleCreateProduct}
        categories={categoryOptions}
        onAddCategory={handleAddCategory}
      />

      <EditProductModal
        isOpen={Boolean(editingProduct)}
        onClose={() => setEditingProduct(null)}
        product={editingProduct}
        categories={categories as Category[]}
        onSave={handleSaveProduct}
        onAddCategory={handleAddCategory}
      />
    </div>
  );
}
