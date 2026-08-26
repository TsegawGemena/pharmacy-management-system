"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Pill,
  Network,
  AlertTriangle,
  Ban,
  PackagePlus,
  Search,
  CheckCircle2,
  Pencil,
  Plus,
  Loader2,
} from "lucide-react";
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

function ProductManagementPage() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [restockProductId, setRestockProductId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { data, loading, error, refetch } = useApi(
    () =>
      getProducts({
        q: searchQuery,
        category: categoryFilter,
        status: statusFilter,
        page: currentPage,
      }),
    [searchQuery, categoryFilter, statusFilter, currentPage]
  );

  const {
    data: categoriesData,
    refetch: refetchCategories,
  } = useApi(getCategories, []);

  const products = data?.data ?? [];
  const totalEntries = data?.meta?.total ?? products.length;
  const categories = categoriesData ?? [];

  useEffect(() => {
    if (searchParams.get("restock") === "1") {
      const productId = searchParams.get("productId");
      if (productId) setRestockProductId(productId);
      setIsRestockOpen(true);
    }
  }, [searchParams]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const categoryOptions = useMemo(() => {
    const fromApi = categories.map((c) => c.name);
    const fromProducts = products.map((p) => p.category).filter(Boolean);
    return Array.from(new Set([...fromApi, ...fromProducts])).sort();
  }, [categories, products]);

  const handleCreateProduct = async (newProd: {
    name: string;
    category: string;
    batchNo?: string;
    stock: number;
    unitPrice: number | string;
    manufacturer?: string;
  }) => {
    try {
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
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to create product");
      throw err;
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

  const handleAddCategory = async (name: string) => {
    await createCategory(name);
    await refetchCategories();
    showToast(`Category "${name}" added`);
  };

  const stats = useMemo(() => {
    const activeCount = products.filter((p) => p.status === "Active").length;
    const cats = new Set(products.map((p) => p.category).filter(Boolean));
    const outOfStock = products.filter((p) => p.stock === 0).length;
    const discontinued = products.filter((p) => p.status === "Inactive").length;
    return {
      activeCount,
      categoryCount: Math.max(cats.size, categories.length),
      outOfStock,
      discontinued,
      categories: cats,
    };
  }, [products, categories.length]);

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-xl shadow-lg border border-slate-700 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Product Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your medicine catalog, pricing, and restock inventory manually.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-xs sm:text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Product</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setRestockProductId(null);
              setIsRestockOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#006699] text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-[#005580] transition-colors shadow-xs"
          >
            <PackagePlus className="h-4 w-4" />
            <span>Restock</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              TOTAL PRODUCTS
            </span>
            <div className="p-2 bg-sky-50 dark:bg-sky-950/60 text-sky-600 rounded-lg">
              <Pill className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-mono mt-2">
            {totalEntries.toLocaleString()}
          </div>
          <div className="text-xs text-sky-600 font-semibold mt-1">
            {stats.activeCount.toLocaleString()} Active
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              CATEGORIES
            </span>
            <div className="p-2 bg-sky-50 dark:bg-sky-950/60 text-sky-600 rounded-lg">
              <Network className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-mono mt-2">
            {stats.categoryCount}
          </div>
          <div className="text-xs text-slate-500 mt-1 truncate">
            {categoryOptions.slice(0, 3).join(", ") || "No categories yet"}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              OUT OF STOCK
            </span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/60 text-rose-600 rounded-lg">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono mt-2">{stats.outOfStock}</div>
          <div className="text-xs text-rose-600 font-semibold mt-1">Needs restock</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              DISCONTINUED
            </span>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg">
              <Ban className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono mt-2">{stats.discontinued}</div>
          <div className="text-xs text-slate-400 mt-1">Inactive items</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search product name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
            >
              <option value="All Categories">All Categories</option>
              {categoryOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
            >
              <option value="All Statuses">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <PageState loading={loading} error={error} onRetry={refetch}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-[13px]">
              <thead className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-6">Name</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-5 font-mono">SKU/ID</th>
                  <th className="py-3.5 px-5">Manufacturer</th>
                  <th className="py-3.5 px-5 text-right font-mono">Price (ETB)</th>
                  <th className="py-3.5 px-6 text-center">Stock</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                      No products found. Create a new medicine or clear filters.
                    </td>
                  </tr>
                ) : (
                  products.map((p: Product) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50">
                      <td className="py-3.5 px-6 font-semibold text-slate-800 dark:text-slate-200">
                        {p.name}
                      </td>
                      <td className="py-3.5 px-6 text-slate-600">{p.category || "—"}</td>
                      <td className="py-3.5 px-5 font-mono text-slate-500">{p.sku || "—"}</td>
                      <td className="py-3.5 px-5 text-slate-700">{p.manufacturer || "—"}</td>
                      <td className="py-3.5 px-5 text-right font-mono font-bold">{p.price}</td>
                      <td className="py-3.5 px-6 text-center">
                        {p.stock === 0 ? (
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            0 units
                          </span>
                        ) : p.stock <= 20 ? (
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            {p.stock} units
                          </span>
                        ) : (
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                            {p.stock} units
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-6">
                        {p.status === "Active" ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                            <span className="h-2 w-2 rounded-full bg-slate-400" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingProduct(p)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-sky-700"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRestockProductId(p.id);
                              setIsRestockOpen(true);
                            }}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#006699] hover:underline"
                          >
                            <PackagePlus className="h-3.5 w-3.5" />
                            Restock
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </PageState>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing 1 to {products.length} of {totalEntries.toLocaleString()} entries
          </div>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded border border-slate-200 disabled:opacity-40"
            >
              Prev
            </button>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-2.5 py-1 rounded border border-slate-200"
            >
              Next
            </button>
          </div>
        </div>
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

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
        </div>
      }
    >
      <ProductManagementPage />
    </Suspense>
  );
}
