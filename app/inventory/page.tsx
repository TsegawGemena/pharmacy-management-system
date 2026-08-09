import React from "react";
import { Boxes, Plus, AlertTriangle, ArrowUpDown } from "lucide-react";

export default function InventoryPage() {
  const inventoryItems = [
    { batch: "BAT-8091", product: "Amoxicillin 500mg", qty: 124, minQty: 30, expiry: "2026-11-20", location: "Shelf A-12" },
    { batch: "BAT-7721", product: "Paracetamol 500mg", qty: 450, minQty: 100, expiry: "2027-02-15", location: "Shelf B-04" },
    { batch: "BAT-6652", product: "Azithromycin 500mg", qty: 85, minQty: 25, expiry: "2026-09-10", location: "Shelf C-01" },
    { batch: "BAT-5519", product: "Omeprazole 20mg", qty: 64, minQty: 20, expiry: "2026-09-15", location: "Shelf A-08" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Inventory & Batches</h2>
          <p className="text-xs text-slate-500 mt-1">Track stock levels, batch numbers, and storage locations.</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#006699] text-white rounded-lg text-sm font-semibold hover:bg-[#005580] transition-colors shadow-xs">
          <Plus className="h-4 w-4" />
          <span>Stock In / Receive</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="py-3 px-6">Batch No</th>
                <th className="py-3 px-6">Product</th>
                <th className="py-3 px-6">Quantity</th>
                <th className="py-3 px-6">Min Threshold</th>
                <th className="py-3 px-6">Expiry Date</th>
                <th className="py-3 px-6">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inventoryItems.map((item) => (
                <tr key={item.batch} className="hover:bg-slate-50/70">
                  <td className="py-3 px-6 font-mono text-sky-600 font-medium">{item.batch}</td>
                  <td className="py-3 px-6 font-semibold text-slate-800">{item.product}</td>
                  <td className="py-3 px-6 font-mono font-bold text-slate-800">{item.qty} units</td>
                  <td className="py-3 px-6 font-mono text-slate-500">{item.minQty} units</td>
                  <td className="py-3 px-6 text-slate-600 font-mono">{item.expiry}</td>
                  <td className="py-3 px-6 text-slate-600">{item.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
