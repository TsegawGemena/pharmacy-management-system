"use client";

import React, { useState, useMemo, Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Package,
  Building2,
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  FileText,
  Loader2,
} from "lucide-react";
import InventoryNavTabs from "@/components/inventory/inventory-nav-tabs";
import {
  createPurchaseOrder,
  getProducts,
  getSuppliers,
  submitPurchaseOrder,
} from "@/lib/api";
import { useApi, useMutation } from "@/lib/hooks/use-api";
import type { Product, Supplier } from "@/lib/types";

interface LineItem {
  id: string;
  productId?: string;
  name: string;
  sku: string;
  unitPrice: number;
  quantity: number;
}

interface CatalogItem {
  id: string;
  name: string;
  sku: string;
  unitPrice: number;
}

function CreatePurchaseOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supplierParam = searchParams.get("supplier");

  const { data: suppliersData, loading: suppliersLoading } = useApi(
    () => getSuppliers(),
    []
  );
  const { data: productsData, loading: productsLoading } = useApi(
    () => getProducts({ limit: 200 }),
    []
  );

  const suppliers = suppliersData ?? [];
  const catalogItems: CatalogItem[] = useMemo(
    () =>
      (productsData?.data ?? []).map((p: Product) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        unitPrice: parseFloat(p.price) || 0,
      })),
    [productsData]
  );

  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [orderDate, setOrderDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("Net 30");
  const [searchProductQuery, setSearchProductQuery] = useState("");
  const [items, setItems] = useState<LineItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { mutate: createOrder } = useMutation(createPurchaseOrder);
  const { mutate: submitOrder } = useMutation(submitPurchaseOrder);

  useEffect(() => {
    if (suppliers.length === 0) return;
    if (selectedSupplierId) return;
    const match = supplierParam
      ? suppliers.find(
          (s) => s.id === supplierParam || s.name === supplierParam
        )
      : null;
    setSelectedSupplierId(match?.id ?? suppliers[0].id);
  }, [suppliers, supplierParam, selectedSupplierId]);

  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Calculations
  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.unitPrice * (item.quantity || 0), 0);
  }, [items]);

  const vat = useMemo(() => {
    return subtotal * 0.15;
  }, [subtotal]);

  const shipping = 150.0;
  const grandTotal = useMemo(() => {
    return subtotal + vat + shipping;
  }, [subtotal, vat, shipping]);

  const handleQuantityChange = (id: string, qty: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: Math.max(0, qty) } : item))
    );
  };

  const handleUnitPriceChange = (id: string, price: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, unitPrice: Math.max(0, price) } : item))
    );
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddCatalogItem = (catalogItem: CatalogItem) => {
    const existing = items.find((i) => i.sku === catalogItem.sku);
    if (existing) {
      handleQuantityChange(existing.id, existing.quantity + 50);
      showToast(`Incremented quantity for ${catalogItem.name}`);
    } else {
      setItems((prev) => [
        ...prev,
        {
          id: `item-${Date.now()}`,
          productId: catalogItem.id,
          name: catalogItem.name,
          sku: catalogItem.sku,
          unitPrice: catalogItem.unitPrice,
          quantity: 1,
        },
      ]);
      showToast(`Added ${catalogItem.name} to order`);
    }
    setSearchProductQuery("");
  };

  const handleAddManualRow = () => {
    const newId = `item-${Date.now()}`;
    setItems((prev) => [
      ...prev,
      {
        id: newId,
        name: "",
        sku: "",
        unitPrice: 0,
        quantity: 1,
      },
    ]);
  };

  const buildOrderPayload = (status: "DRAFT" | "PENDING") => {
    if (!selectedSupplier) {
      throw new Error("Please select a supplier");
    }
    if (items.length === 0) {
      throw new Error("Add at least one line item");
    }
    return {
      supplier: { name: selectedSupplier.name },
      dateOrdered: orderDate,
      expectedDelivery: expectedDelivery || orderDate,
      total: grandTotal.toFixed(2),
      status,
      paymentTerms,
      items: items.map((item) => ({
        productId: item.productId,
        sku: item.sku,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    };
  };

  const handleSaveDraft = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const payload = buildOrderPayload("DRAFT");
      const created = await createOrder(payload);
      if (created) {
        showToast(`Purchase Order saved as Draft (${created.id})`);
      } else {
        showToast("Failed to save draft");
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
      const payload = buildOrderPayload("DRAFT");
      const created = await createOrder(payload);
      if (!created) {
        showToast("Failed to create purchase order");
        return;
      }
      await submitOrder(created.id);
      showToast("Purchase Order submitted successfully!");
      setTimeout(() => {
        router.push("/inventory/purchase-orders");
      }, 1200);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to submit order");
    } finally {
      setIsSaving(false);
    }
  };

  const formatRating = (supplier: Supplier) => {
    if (supplier.rating == null) return "—";
    return `${supplier.rating.toFixed(1)}/5`;
  };

  const filteredCatalog = catalogItems.filter((i) =>
    i.name.toLowerCase().includes(searchProductQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Sub Navigation Tabs */}
      <InventoryNavTabs />

      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-xl shadow-lg border border-slate-700 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
        <Link href="/inventory" className="hover:text-sky-600 dark:hover:text-sky-400">
          Inventory
        </Link>
        <span>&gt;</span>
        <Link href="/inventory/suppliers" className="hover:text-sky-600 dark:hover:text-sky-400">
          Suppliers
        </Link>
        <span>&gt;</span>
        <span className="text-slate-700 dark:text-slate-300 font-semibold">New PO</span>
      </div>

      {/* Header with Submit Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Create New Purchase Order
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Generate a new inventory request from approved suppliers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSaving || suppliersLoading}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 rounded-lg transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save as Draft"}
          </button>
          <button
            type="button"
            onClick={handleSubmitOrder}
            disabled={isSaving || suppliersLoading}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#006699] hover:bg-[#005580] rounded-lg transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isSaving ? "Submitting..." : "Submit Purchase Order"}
          </button>
        </div>
      </div>

      {/* 2-Column Form Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Supplier Information Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xs space-y-4 transition-colors">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold text-sm">
              <Building2 className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              <span>Supplier Information</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  SELECT SUPPLIER
                </label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  disabled={suppliersLoading || suppliers.length === 0}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-sky-500 font-medium disabled:opacity-50"
                >
                  {suppliersLoading && (
                    <option value="">Loading suppliers...</option>
                  )}
                  {!suppliersLoading && suppliers.length === 0 && (
                    <option value="">No suppliers available</option>
                  )}
                  {suppliers.map((sup) => (
                    <option key={sup.id} value={sup.id}>
                      {sup.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Supplier Preview Card */}
              {selectedSupplier && (
                <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                  <div className="p-2 bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 rounded-lg shrink-0 mt-0.5">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <div className="font-bold text-slate-800 dark:text-slate-100 text-[13px]">
                      {selectedSupplier.name}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 font-medium">
                      Rating:{" "}
                      <span className="text-amber-700 dark:text-amber-400 font-semibold">
                        {formatRating(selectedSupplier)}
                      </span>
                    </div>
                    <div className="text-slate-500 dark:text-slate-400">
                      Contact:{" "}
                      <span className="text-slate-700 dark:text-slate-300 font-mono">
                        {selectedSupplier.contact?.email || "—"}
                      </span>{" "}
                      |{" "}
                      <span className="text-slate-700 dark:text-slate-300 font-mono">
                        {selectedSupplier.contact?.phone || "—"}
                      </span>
                    </div>
                    {selectedSupplier.address && (
                      <div className="text-slate-500 dark:text-slate-400">
                        {selectedSupplier.address}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Line Items Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xs space-y-4 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold text-sm">
                <div className="p-1 bg-sky-100 dark:bg-sky-950/60 text-[#006699] dark:text-sky-400 rounded">
                  <Plus className="h-3.5 w-3.5" />
                </div>
                <span>Order Line Items</span>
              </div>

              {/* Search Product Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search product to add..."
                  value={searchProductQuery}
                  onChange={(e) => setSearchProductQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-sky-500"
                />

                {/* Search Dropdown */}
                {searchProductQuery.trim() && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg z-20 max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                    {productsLoading && (
                      <div className="px-3 py-2 text-xs text-slate-400 flex items-center gap-2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Loading products...
                      </div>
                    )}
                    {!productsLoading && filteredCatalog.length === 0 && (
                      <div className="px-3 py-2 text-xs text-slate-400">
                        No products found
                      </div>
                    )}
                    {filteredCatalog.map((p) => (
                      <button
                        key={p.sku}
                        type="button"
                        onClick={() => handleAddCatalogItem(p)}
                        className="w-full px-3 py-2 text-left text-xs hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{p.name}</div>
                          <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{p.sku}</div>
                        </div>
                        <span className="font-mono text-slate-600 dark:text-slate-300 font-bold">
                          {p.unitPrice.toFixed(2)} ETB
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs sm:text-[13px]">
                <thead className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="py-3 px-4">SKU / PRODUCT</th>
                    <th className="py-3 px-4 font-mono text-right">UNIT PRICE</th>
                    <th className="py-3 px-4 text-center">QUANTITY</th>
                    <th className="py-3 px-4 font-mono text-right">SUBTOTAL</th>
                    <th className="py-3 px-3 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                        No items added yet. Click "+ Add Row Manually" or search products above.
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => {
                      const itemSubtotal = item.unitPrice * (item.quantity || 0);
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                          {/* SKU / Product */}
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</div>
                            <div className="text-[10.5px] font-mono text-slate-400 dark:text-slate-500 uppercase">
                              SKU: {item.sku}
                            </div>
                          </td>

                          {/* Unit Price */}
                          <td className="py-3 px-4 text-right font-mono font-medium text-slate-700 dark:text-slate-300">
                            {item.unitPrice.toFixed(2)} ETB
                          </td>

                          {/* Quantity Input */}
                          <td className="py-3 px-4 text-center">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(item.id, Number(e.target.value))
                              }
                              className="w-20 px-2.5 py-1 text-center font-mono font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:border-sky-500 focus:outline-hidden"
                            />
                          </td>

                          {/* Subtotal */}
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-800 dark:text-slate-100">
                            {itemSubtotal.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{" "}
                            ETB
                          </td>

                          {/* Delete Action */}
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Add Row Button */}
            <button
              type="button"
              onClick={handleAddManualRow}
              className="w-full py-2.5 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-sky-400 dark:hover:border-sky-500 hover:bg-sky-50/50 dark:hover:bg-sky-950/30 rounded-xl text-xs sm:text-sm font-semibold text-[#006699] dark:text-sky-400 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Row Manually</span>
            </button>
          </div>
        </div>

        {/* Right Column (col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Order Details Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xs space-y-4 transition-colors">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold text-sm">
              <FileText className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              <span>Order Details</span>
            </div>

            <div className="space-y-3.5">
              {/* PO NUMBER (AUTO) */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  PO NUMBER (AUTO)
                </label>
                <input
                  type="text"
                  disabled
                  value="Generated on save"
                  className="w-full px-3 py-2 text-xs sm:text-sm font-mono font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-not-allowed"
                />
              </div>

              {/* ORDER DATE */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  ORDER DATE
                </label>
                <input
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-sky-500"
                />
              </div>

              {/* EXPECTED DELIVERY */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  EXPECTED DELIVERY
                </label>
                <input
                  type="date"
                  value={expectedDelivery}
                  onChange={(e) => setExpectedDelivery(e.target.value)}
                  placeholder="mm/dd/yyyy"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-sky-500"
                />
              </div>

              {/* TERMS */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  TERMS
                </label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-sky-500 font-medium"
                >
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Net 60">Net 60</option>
                  <option value="Due on Receipt">Due on Receipt</option>
                  <option value="Advance Payment">Advance Payment</option>
                </select>
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xs space-y-4 transition-colors">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold text-sm">
              <CreditCard className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              <span>Summary</span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                  {subtotal.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  ETB
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>VAT (15%)</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                  {vat.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  ETB
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Shipping</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                  {shipping.toFixed(2)} ETB
                </span>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex items-baseline justify-between">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Total</span>
                <span className="text-xl sm:text-2xl font-extrabold text-[#006699] dark:text-sky-400 font-mono">
                  {grandTotal.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  ETB
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreatePurchaseOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-400">
          Loading purchase order form...
        </div>
      }
    >
      <CreatePurchaseOrderContent />
    </Suspense>
  );
}
