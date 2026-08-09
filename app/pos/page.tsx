"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  ScanBarcode,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Pause,
  RotateCcw,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  Printer,
  X,
  User,
  AlertCircle,
} from "lucide-react";

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

const CATALOG_ITEMS: PosProduct[] = [
  {
    id: "1",
    name: "Amoxicillin 500mg Caps",
    category: "Antibiotics",
    stock: 145,
    stockUnit: "145 units",
    price: 120.0,
  },
  {
    id: "2",
    name: "Paracetamol 500mg Tabs",
    category: "Pain Relief",
    stock: 320,
    stockUnit: "320 units",
    price: 45.0,
  },
  {
    id: "3",
    name: "Ibuprofen 400mg Tabs",
    category: "Pain Relief",
    stock: 12,
    stockUnit: "12 units",
    price: 65.5,
  },
  {
    id: "4",
    name: "Vitamin C 1000mg Effervescent",
    category: "Vitamins",
    stock: 0,
    stockUnit: "Out of Stock",
    price: 210.0,
  },
  {
    id: "5",
    name: "Omeprazole 20mg Caps",
    category: "Gastrointestinal",
    stock: 89,
    stockUnit: "89 units",
    price: 180.0,
  },
  {
    id: "6",
    name: "Ceftriaxone 1g Inj",
    category: "Antibiotics",
    stock: 34,
    stockUnit: "34 units",
    price: 250.0,
  },
  {
    id: "7",
    name: "Metformin 500mg Tabs",
    category: "Antidiabetic",
    stock: 220,
    stockUnit: "220 units",
    price: 35.0,
  },
  {
    id: "8",
    name: "Sterile Gauze Bandage 4x4",
    category: "First Aid",
    stock: 60,
    stockUnit: "60 units",
    price: 30.0,
  },
];

export default function PosPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [selectedCustomer, setSelectedCustomer] = useState("Walking Customer");
  const [invNumber, setInvNumber] = useState("#INV-2023-089");

  const [cart, setCart] = useState<CartItem[]>([
    {
      id: "1",
      name: "Amoxicillin 500mg Caps",
      price: 120.0,
      qty: 2,
    },
    {
      id: "2",
      name: "Paracetamol 500mg Tabs",
      price: 45.0,
      qty: 1,
    },
  ]);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "telebirr" | "card">("cash");
  const [amountTendered, setAmountTendered] = useState<number>(350);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Calculations
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

  // Cart operations
  const handleAddToCart = (product: PosProduct) => {
    if (product.stock === 0) {
      showToast(`${product.name} is currently out of stock`);
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
    showToast(`Added ${product.name} to cart`);
  };

  const handleUpdateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
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

  const handleHoldCart = () => {
    if (cart.length === 0) return;
    showToast(`Held order ${invNumber} for later recall`);
    setCart([]);
    setInvNumber(`#INV-2023-${Math.floor(100 + Math.random() * 900)}`);
  };

  const handleCompleteSale = () => {
    showToast(`Payment of ${total.toFixed(2)} ETB confirmed! Receipt printed.`);
    setIsPaymentModalOpen(false);
    setCart([]);
    setInvNumber(`#INV-2023-${Math.floor(100 + Math.random() * 900)}`);
  };

  const filteredCatalog = useMemo(() => {
    return CATALOG_ITEMS.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesCat = item.category.toLowerCase().includes(q);
        if (!matchesName && !matchesCat) return false;
      }
      if (
        selectedCategory !== "All Products" &&
        selectedCategory !== "Frequent" &&
        item.category !== selectedCategory
      ) {
        return false;
      }
      return true;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-xl shadow-lg border border-slate-700 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main 2-Column POS Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Search, Category Filters, Products Catalog (~65%) */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
          {/* Top Bar: Search with barcode scanner */}
          <div className="p-4 border-b border-slate-100 space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search medicine by name or barcode (F2)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-sky-500 shadow-2xs"
              />
              <button
                onClick={() => showToast("Barcode scanner active...")}
                className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-sky-600 rounded"
                title="Scan barcode"
              >
                <ScanBarcode className="h-4 w-4" />
              </button>
            </div>

            {/* Filter Pills */}
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
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    selectedCategory === cat
                      ? "bg-[#006699] text-white shadow-2xs"
                      : "bg-slate-100/80 text-slate-700 hover:bg-slate-200/80"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Products Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-[13px]">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3 px-5">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">Stock</th>
                  <th className="py-3 px-5 text-right font-mono">Price (ETB)</th>
                  <th className="py-3 px-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCatalog.map((product) => {
                  const isOutOfStock = product.stock === 0;

                  return (
                    <tr
                      key={product.id}
                      onClick={() => !isOutOfStock && handleAddToCart(product)}
                      className={`transition-colors ${
                        isOutOfStock
                          ? "opacity-60 cursor-not-allowed bg-slate-50/30"
                          : "hover:bg-sky-50/40 cursor-pointer"
                      }`}
                    >
                      {/* Product Name */}
                      <td className="py-3.5 px-5 font-semibold text-slate-800">
                        {product.name}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {product.category}
                      </td>

                      {/* Stock Badge */}
                      <td className="py-3.5 px-4 text-center">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Out of Stock
                          </span>
                        ) : product.stock <= 20 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {product.stockUnit}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                            {product.stockUnit}
                          </span>
                        )}
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-800">
                        {product.price.toFixed(2)}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          disabled={isOutOfStock}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                          className="p-1 rounded bg-slate-100 hover:bg-sky-100 text-slate-700 hover:text-sky-700 disabled:opacity-40"
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
        </div>

        {/* Right Column: Current Sale Checkout (~35%) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-base">
              <ShoppingCart className="h-4 w-4 text-[#006699]" />
              <span>Current Sale</span>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {invNumber}
            </span>
          </div>

          {/* Customer Dropdown */}
          <div>
            <div className="relative">
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full pl-8 pr-4 py-2 text-xs sm:text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-sky-500"
              >
                <option value="Walking Customer">Walking Customer</option>
                <option value="Abebe Kebede">Abebe Kebede</option>
                <option value="Tigist Alemu">Tigist Alemu</option>
                <option value="Dr. Tadesse">Dr. Tadesse</option>
                <option value="+ Add Customer">+ Add Customer</option>
              </select>
              <User className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Cart Item Cards List */}
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Cart is empty. Select items from the catalog.
              </div>
            ) : (
              cart.map((item) => {
                const itemTotal = item.price * item.qty;
                return (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-slate-800 text-xs sm:text-sm">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {item.price.toFixed(2)} ETB / unit
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded"
                        title="Remove"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {/* Quantity Stepper */}
                      <div className="flex items-center rounded-lg border border-slate-200 bg-white overflow-hidden shadow-2xs">
                        <button
                          onClick={() => handleUpdateQty(item.id, -1)}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-100 text-xs font-bold"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-3 py-1 font-mono font-bold text-xs text-slate-800">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => handleUpdateQty(item.id, 1)}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-100 text-xs font-bold"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="font-mono font-bold text-slate-800 text-sm">
                        {itemTotal.toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pricing Summary */}
          <div className="border-t border-slate-100 pt-3 space-y-2 text-xs sm:text-sm">
            <div className="flex items-center justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-mono font-medium text-slate-800">
                {subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span>VAT (15%)</span>
              <span className="font-mono font-medium text-slate-800">
                {vat.toFixed(2)}
              </span>
            </div>

            <div className="border-t border-slate-200/80 pt-2 flex items-baseline justify-between">
              <span className="text-sm font-bold text-slate-800">Total</span>
              <span className="text-xl font-extrabold text-[#006699] font-mono">
                {total.toFixed(2)} ETB
              </span>
            </div>
          </div>

          {/* Hold & Clear Actions */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleHoldCart}
              disabled={cart.length === 0}
              className="inline-flex items-center justify-center gap-1.5 py-2 border border-sky-200 hover:bg-sky-50 text-[#006699] text-xs font-semibold rounded-lg transition-colors disabled:opacity-40"
            >
              <Pause className="h-3.5 w-3.5" />
              <span>Hold</span>
            </button>

            <button
              onClick={handleClearCart}
              disabled={cart.length === 0}
              className="inline-flex items-center justify-center gap-1.5 py-2 border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold rounded-lg transition-colors disabled:opacity-40"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>Clear</span>
            </button>
          </div>

          {/* Process Payment Button */}
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            disabled={cart.length === 0}
            className="w-full py-3 bg-[#006699] hover:bg-[#005580] disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold shadow-xs flex items-center justify-center gap-2 transition-colors"
          >
            <CreditCard className="h-4 w-4" />
            <span>Process Payment</span>
          </button>
        </div>
      </div>

      {/* Payment Processing Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.jpg"
                  alt="Logo"
                  className="h-9 w-9 object-contain rounded-lg border border-slate-200 bg-white p-0.5"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Checkout & Payment</h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Order: {invNumber} • {selectedCustomer}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Payment Methods */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cash")}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-xs font-semibold transition-all ${
                    paymentMethod === "cash"
                      ? "border-sky-500 bg-sky-50 text-[#006699]"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Banknote className="h-5 w-5 text-emerald-600" />
                  <span>Cash</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("telebirr")}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-xs font-semibold transition-all ${
                    paymentMethod === "telebirr"
                      ? "border-sky-500 bg-sky-50 text-[#006699]"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Smartphone className="h-5 w-5 text-sky-600" />
                  <span>Telebirr</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-xs font-semibold transition-all ${
                    paymentMethod === "card"
                      ? "border-sky-500 bg-sky-50 text-[#006699]"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <CreditCard className="h-5 w-5 text-indigo-600" />
                  <span>Card</span>
                </button>
              </div>

              {/* Total & Tendered */}
              <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200/80">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-semibold text-slate-600">Total Due</span>
                  <span className="text-xl font-extrabold text-[#006699] font-mono">
                    {total.toFixed(2)} ETB
                  </span>
                </div>

                {paymentMethod === "cash" && (
                  <>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                      <span className="text-xs font-semibold text-slate-600">Amount Tendered</span>
                      <input
                        type="number"
                        min={total}
                        value={amountTendered}
                        onChange={(e) => setAmountTendered(Number(e.target.value))}
                        className="w-24 px-2 py-1 text-right font-mono font-bold text-slate-800 border border-slate-200 rounded-md focus:border-sky-500"
                      />
                    </div>

                    <div className="flex justify-between items-baseline pt-1">
                      <span className="text-xs font-semibold text-slate-600">Change Due</span>
                      <span className="text-sm font-bold text-emerald-600 font-mono">
                        {changeDue.toFixed(2)} ETB
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Complete Action */}
              <button
                onClick={handleCompleteSale}
                className="w-full py-3 bg-[#006699] hover:bg-[#005580] text-white rounded-xl text-sm font-bold shadow-xs flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Confirm & Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
