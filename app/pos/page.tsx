import React from "react";
import { ShoppingCart, Search, CreditCard, Banknote, Smartphone, Trash2 } from "lucide-react";

export default function PosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Point of Sale (POS)</h2>
        <p className="text-xs text-slate-500 mt-1">Dispense medications and issue sales receipts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product selection */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search or scan medication barcode..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { name: "Amoxicillin 500mg", price: "280 ETB", stock: "124 in stock" },
              { name: "Paracetamol 500mg", price: "120 ETB", stock: "450 in stock" },
              { name: "Azithromycin 500mg", price: "450 ETB", stock: "85 in stock" },
              { name: "Omeprazole 20mg", price: "210 ETB", stock: "64 in stock" },
              { name: "Ibuprofen 400mg", price: "150 ETB", stock: "210 in stock" },
              { name: "Ciprofloxacin 500mg", price: "320 ETB", stock: "14 in stock" },
            ].map((item, idx) => (
              <button
                key={idx}
                className="p-3 text-left rounded-lg border border-slate-200 hover:border-sky-500 hover:bg-sky-50/40 transition-all"
              >
                <div className="font-semibold text-slate-800 text-xs sm:text-sm truncate">{item.name}</div>
                <div className="text-sky-600 font-bold font-mono text-xs mt-1">{item.price}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{item.stock}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Current Cart Checkout */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base pb-3 border-b border-slate-100 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-sky-600" />
              <span>Current Order</span>
            </h3>

            <div className="divide-y divide-slate-100 py-3 space-y-2">
              <div className="flex justify-between items-center text-xs pt-2">
                <div>
                  <p className="font-semibold text-slate-800">Amoxicillin 500mg</p>
                  <p className="text-slate-400">3 x 280.00 ETB</p>
                </div>
                <p className="font-mono font-bold text-slate-800">840.00 ETB</p>
              </div>

              <div className="flex justify-between items-center text-xs pt-2">
                <div>
                  <p className="font-semibold text-slate-800">Paracetamol 500mg</p>
                  <p className="text-slate-400">2 x 120.00 ETB</p>
                </div>
                <p className="font-mono font-bold text-slate-800">240.00 ETB</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3">
            <div className="flex justify-between text-sm font-bold text-slate-800">
              <span>Total Payable</span>
              <span className="text-base text-sky-700 font-mono">1,080.00 ETB</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button className="flex items-center justify-center gap-1.5 py-2 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50">
                <Banknote className="h-4 w-4 text-emerald-600" />
                <span>Cash</span>
              </button>
              <button className="flex items-center justify-center gap-1.5 py-2 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50">
                <Smartphone className="h-4 w-4 text-sky-600" />
                <span>Telebirr</span>
              </button>
            </div>

            <button className="w-full py-2.5 bg-[#006699] hover:bg-[#005580] text-white rounded-lg text-sm font-bold shadow-xs">
              Complete Sale & Print Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
