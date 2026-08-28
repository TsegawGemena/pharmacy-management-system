"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ScanBarcode,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Pause,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  X,
  Printer,
  FileDown,
} from "lucide-react";
import { completeSale, getPosProducts, holdSale } from "@/lib/api";
import type { PosProduct as ApiPosProduct, PaymentMethod } from "@/lib/types";
import { PageState } from "@/components/ui/page-state";
import { downloadReceiptPdf, printReceiptA5Async } from "@/lib/receipt";
import type { ReceiptData } from "@/lib/receipt";
import { receiptPathForRole } from "@/lib/receipt-data";
import { getStoredUser } from "@/lib/api";

interface PosProduct {
  id: string;
  name: string;
  category: string;
  stock: number;
  stockUnit: string;
  price: number;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

function mapPosProduct(product: ApiPosProduct): PosProduct {
  return {
    ...product,
    stockUnit:
      product.stock === 0 ? "Out of Stock" : `${product.stock} units`,
  };
}

export default function PosPage() {
  const router = useRouter();
  const [products, setProducts] = useState<PosProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [invNumber, setInvNumber] = useState("New Sale");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [amountTendered, setAmountTendered] = useState<number>(0);
  const [isCompletingSale, setIsCompletingSale] = useState(false);
  const [isHoldingCart, setIsHoldingCart] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastReceipt, setLastReceipt] = useState<ReceiptData | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadProducts = useCallback(async (q?: string) => {
    setProductsLoading(true);
    setProductsError(null);
    try {
      const rows = await getPosProducts(q);
      setProducts(rows.map(mapPosProduct));
    } catch (err) {
      setProductsError(
        err instanceof Error ? err.message : "Failed to load products"
      );
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      void loadProducts(searchQuery.trim() || undefined);
    }, 280);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [searchQuery, loadProducts]);

  const refetchProducts = () => loadProducts(searchQuery.trim() || undefined);

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  }, [cart]);

  const vat = useMemo(() => {
    return subtotal * 0.15;
  }, [subtotal]);

  const total = useMemo(() => {
    return subtotal + vat;
  }, [subtotal, vat]);

  const changeDue = Math.max(0, amountTendered - total);

  const buildSalePayload = useCallback(
    () => ({
      items: cart.map((item) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        qty: item.qty,
      })),
      paymentMethod,
      amountTendered: paymentMethod === "cash" ? amountTendered : undefined,
    }),
    [cart, paymentMethod, amountTendered]
  );

  const handleAddToCart = (product: PosProduct) => {
    const currentProduct = products.find((p) => p.id === product.id) || product;
    const existingInCart = cart.find((item) => item.id === product.id);
    const inCartQty = existingInCart ? existingInCart.qty : 0;

    if (inCartQty >= currentProduct.stock) {
      showToast(`No more stock available for ${product.name}`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          qty: 1,
        },
      ];
    });
    showToast(`Added ${product.name} to current sale`);
  };

  const handleUpdateQty = (id: string, delta: number) => {
    const product = products.find((p) => p.id === id);
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            if (delta > 0 && product && newQty > product.stock) {
              showToast(`Only ${product.stock} units available in stock`);
              return item;
            }
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleSetQty = (id: string, qty: number) => {
    const product = products.find((p) => p.id === id);
    const next = Math.floor(Number(qty));
    if (!Number.isFinite(next) || next < 1) {
      setCart((prev) => prev.filter((item) => item.id !== id));
      return;
    }
    if (product && next > product.stock) {
      showToast(`Only ${product.stock} units available in stock`);
      setCart((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, qty: product.stock } : item
        )
      );
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty: next } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    setCart([]);
    showToast("Cart cleared");
  };

  const handleHoldCart = async () => {
    if (cart.length === 0 || isHoldingCart) return;
    setIsHoldingCart(true);
    try {
      const response = await holdSale(buildSalePayload());
      showToast(response.message || `Held order ${invNumber} for later recall`);
      setCart([]);
      setInvNumber("New Sale");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to hold cart");
    } finally {
      setIsHoldingCart(false);
    }
  };

  const handleCompleteSale = async () => {
    if (cart.length === 0 || isCompletingSale) return;
    setIsCompletingSale(true);
    try {
      const cartSnapshot = [...cart];
      const response = await completeSale(buildSalePayload());
      const receipt: ReceiptData = {
        pharmacyName: "Gammo Pharmacy",
        invoiceNumber: response.invoiceNumber,
        createdAt: response.createdAt || new Date().toISOString(),
        items: (response.items ?? cartSnapshot).map((i) => ({
          name: i.name,
          qty: i.qty,
          price: i.price,
        })),
        subtotal: response.subtotal,
        vat: response.vat,
        total: response.total,
        paymentMethod: response.paymentMethod,
        amountTendered:
          paymentMethod === "cash" ? amountTendered : response.total,
        changeDue: response.changeDue,
      };
      setLastReceipt(receipt);
      showToast(
        response.message ||
          `Payment of ${response.total.toFixed(2)} ETB confirmed! Stock updated.`
      );
      setIsPaymentModalOpen(false);
      setCart([]);
      if (response.invoiceNumber) {
        setInvNumber(response.invoiceNumber);
      } else {
        setInvNumber("New Sale");
      }
      await refetchProducts();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to complete sale");
    } finally {
      setIsCompletingSale(false);
    }
  };

  const filteredCatalog = useMemo(() => {
    return products.filter((item) => {
      if (
        selectedCategory !== "All Products" &&
        selectedCategory !== "Frequent" &&
        item.category !== selectedCategory
      ) {
        return false;
      }
      return true;
    });
  }, [products, selectedCategory]);

  const openPaymentModal = () => {
    setAmountTendered(Math.ceil(total));
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium rounded-xl shadow-lg border border-slate-700 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 xl:col-span-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search for medication by name…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-sky-500 shadow-2xs"
              />
              <button
                onClick={() => showToast("Barcode scanner active...")}
                className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 rounded"
                title="Scan barcode"
              >
                <ScanBarcode className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {[
                "All Products",
                "Pain Relief",
                "Antibiotics",
                "Vitamins",
                "First Aid",
                "Frequent",
              ].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${selectedCategory === cat
                    ? "bg-[#006699] text-white shadow-2xs"
                    : "bg-slate-100/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <PageState
            loading={productsLoading}
            error={productsError}
            onRetry={refetchProducts}
            empty={!productsLoading && !productsError && filteredCatalog.length === 0}
            emptyMessage={
              searchQuery.trim() ? "No medication found" : "No products found."
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-[13px]">
                <thead className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="py-3 px-5">Product Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-center">Stock</th>
                    <th className="py-3 px-5 text-right font-mono">Price (ETB)</th>
                    <th className="py-3 px-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredCatalog.map((product) => {
                    const cartItem = cart.find((item) => item.id === product.id);
                    const inCartQty = cartItem ? cartItem.qty : 0;
                    const availableStock = Math.max(0, product.stock - inCartQty);
                    const isOutOfStock = availableStock === 0;

                    return (
                      <tr
                        key={product.id}
                        onClick={() => !isOutOfStock && handleAddToCart(product)}
                        className={`transition-colors ${isOutOfStock
                          ? "opacity-60 cursor-not-allowed bg-slate-50/30 dark:bg-slate-800/20"
                          : "hover:bg-sky-50/40 dark:hover:bg-slate-800/60 cursor-pointer"
                          }`}
                      >
                        <td className="py-3.5 px-5 font-semibold text-slate-800 dark:text-slate-200">
                          {product.name}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-medium">
                          {product.category}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {isOutOfStock ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
                              Out of Stock
                            </span>
                          ) : availableStock <= 20 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                              <span>{availableStock} units</span>
                              {inCartQty > 0 && (
                                <span className="text-[9.5px] font-medium opacity-75">
                                  (-{inCartQty})
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
                              <span>{availableStock} units</span>
                              {inCartQty > 0 && (
                                <span className="text-[9.5px] font-medium opacity-75">
                                  (-{inCartQty})
                                </span>
                              )}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-800 dark:text-slate-100">
                          {product.price.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <button
                            disabled={isOutOfStock}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product);
                            }}
                            className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-sky-950 text-slate-700 dark:text-slate-300 hover:text-sky-700 dark:hover:text-sky-400 disabled:opacity-40 disabled:cursor-not-allowed"
                            title={isOutOfStock ? "Out of Stock" : `Add ${product.name}`}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </PageState>
        </div>

        <div className="lg:col-span-5 xl:col-span-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs space-y-4 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100 text-base">
              <ShoppingCart className="h-4 w-4 text-[#006699] dark:text-sky-400" />
              <span>Current Sale</span>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              {invNumber}
            </span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                Cart is empty. Select items from the catalog.
              </div>
            ) : (
              cart.map((item) => {
                const itemTotal = item.price * item.qty;
                const product = products.find((p) => p.id === item.id);
                const isMaxReached = product ? item.qty >= product.stock : false;

                return (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50/80 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                          {item.price.toFixed(2)} ETB / unit
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded"
                        title="Remove"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
                        <button
                          onClick={() => handleUpdateQty(item.id, -1)}
                          className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold"
                          title="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={product?.stock ?? undefined}
                          value={item.qty}
                          onChange={(e) => handleSetQty(item.id, Number(e.target.value))}
                          className="w-12 px-1 py-1 text-center font-mono font-bold text-xs text-slate-800 dark:text-slate-100 bg-transparent border-x border-slate-200 dark:border-slate-700 focus:outline-hidden"
                          title="Edit quantity"
                        />
                        <button
                          onClick={() => handleUpdateQty(item.id, 1)}
                          disabled={isMaxReached}
                          className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                          title={isMaxReached ? "Maximum stock reached" : "Increase quantity"}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="font-mono font-bold text-slate-800 dark:text-slate-100 text-sm">
                        {itemTotal.toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2 text-xs sm:text-sm">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal</span>
              <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                {subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span>VAT (15%)</span>
              <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                {vat.toFixed(2)}
              </span>
            </div>

            <div className="border-t border-slate-200/80 dark:border-slate-700/80 pt-2 flex items-baseline justify-between">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Total</span>
              <span className="text-xl font-extrabold text-[#006699] dark:text-sky-400 font-mono">
                {total.toFixed(2)} ETB
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleHoldCart}
              disabled={cart.length === 0 || isHoldingCart}
              className="inline-flex items-center justify-center gap-1.5 py-2 border border-sky-200 dark:border-sky-800 hover:bg-sky-50 dark:hover:bg-sky-950/50 text-[#006699] dark:text-sky-400 text-xs font-semibold rounded-lg transition-colors disabled:opacity-40"
            >
              <Pause className="h-3.5 w-3.5" />
              <span>{isHoldingCart ? "Holding..." : "Hold"}</span>
            </button>

            <button
              onClick={handleClearCart}
              disabled={cart.length === 0}
              className="inline-flex items-center justify-center gap-1.5 py-2 border border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-lg transition-colors disabled:opacity-40"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>Clear</span>
            </button>
          </div>

          <button
            onClick={openPaymentModal}
            disabled={cart.length === 0}
            className="w-full py-3 bg-[#006699] hover:bg-[#005580] disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <CreditCard className="h-4 w-4" />
            <span>Process Payment</span>
          </button>
        </div>
      </div>

      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden transition-colors">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.jpg"
                  alt="Logo"
                  className="h-9 w-9 object-contain rounded-lg border border-slate-200 dark:border-slate-700 bg-white p-0.5"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Checkout & Payment</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    Order: {invNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cash")}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-xs font-semibold transition-all cursor-pointer ${paymentMethod === "cash"
                    ? "border-sky-500 bg-sky-50 dark:bg-sky-950/60 text-[#006699] dark:text-sky-400"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                >
                  <Banknote className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Cash</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("telebirr")}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-xs font-semibold transition-all cursor-pointer ${paymentMethod === "telebirr"
                    ? "border-sky-500 bg-sky-50 dark:bg-sky-950/60 text-[#006699] dark:text-sky-400"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                >
                  <Smartphone className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                  <span>Telebirr</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-xs font-semibold transition-all cursor-pointer ${paymentMethod === "card"
                    ? "border-sky-500 bg-sky-50 dark:bg-sky-950/60 text-[#006699] dark:text-sky-400"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                >
                  <CreditCard className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Card</span>
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/70 p-4 rounded-xl space-y-2 border border-slate-200/80 dark:border-slate-700/80">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Total Due</span>
                  <span className="text-xl font-extrabold text-[#006699] dark:text-sky-400 font-mono">
                    {total.toFixed(2)} ETB
                  </span>
                </div>

                {paymentMethod === "cash" && (
                  <>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Amount Tendered</span>
                      <input
                        type="number"
                        min={total}
                        value={amountTendered}
                        onChange={(e) => setAmountTendered(Number(e.target.value))}
                        className="w-24 px-2 py-1 text-right font-mono font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:border-sky-500"
                      />
                    </div>

                    <div className="flex justify-between items-baseline pt-1">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Change Due</span>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        {changeDue.toFixed(2)} ETB
                      </span>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={handleCompleteSale}
                disabled={isCompletingSale}
                className="w-full py-3 bg-[#006699] hover:bg-[#005580] disabled:opacity-70 text-white rounded-xl text-sm font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{isCompletingSale ? "Processing..." : "Confirm & Print Receipt"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {lastReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold">Sale completed</h3>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                {lastReceipt.invoiceNumber}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => {
                  const role = getStoredUser()?.role;
                  router.push(
                    receiptPathForRole(lastReceipt.invoiceNumber, role)
                  );
                }}
                className="inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#006699] text-white text-sm font-semibold"
              >
                <Printer className="h-4 w-4" />
                View &amp; Print Receipt
              </button>
              <button
                type="button"
                onClick={() => void printReceiptA5Async(lastReceipt)}
                className="inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold"
              >
                <Printer className="h-4 w-4" />
                Quick Print (A5)
              </button>
              <button
                type="button"
                onClick={() => void downloadReceiptPdf(lastReceipt)}
                className="inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold"
              >
                <FileDown className="h-4 w-4" />
                Download PDF (A5)
              </button>
              <button
                type="button"
                onClick={() => setLastReceipt(null)}
                className="py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
