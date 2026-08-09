import React from "react";
import { Pill, Plus, Search, Filter } from "lucide-react";

export default function ProductsPage() {
  const products = [
    { id: "PRD-001", name: "Amoxicillin 500mg", category: "Antibiotics", price: "280.00 ETB", stock: 124, status: "Active" },
    { id: "PRD-002", name: "Paracetamol 500mg", category: "Analgesics", price: "120.00 ETB", stock: 450, status: "Active" },
    { id: "PRD-003", name: "Azithromycin 500mg", category: "Antibiotics", price: "450.00 ETB", stock: 85, status: "Active" },
    { id: "PRD-004", name: "Omeprazole 20mg", category: "Gastrointestinal", price: "210.00 ETB", stock: 64, status: "Active" },
    { id: "PRD-005", name: "Ibuprofen 400mg", category: "NSAIDs", price: "150.00 ETB", stock: 210, status: "Active" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Products Catalog</h2>
          <p className="text-xs text-slate-500 mt-1">Manage pharmaceutical products and pricing.</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#006699] text-white rounded-lg text-sm font-semibold hover:bg-[#005580] transition-colors shadow-xs">
          <Plus className="h-4 w-4" />
          <span>Add New Product</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-sky-500"
            />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="py-3 px-6">Product ID</th>
                <th className="py-3 px-6">Product Name</th>
                <th className="py-3 px-6">Category</th>
                <th className="py-3 px-6">Price</th>
                <th className="py-3 px-6">Stock</th>
                <th className="py-3 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-6 font-mono text-sky-600 font-medium">{item.id}</td>
                  <td className="py-3 px-6 font-semibold text-slate-800">{item.name}</td>
                  <td className="py-3 px-6 text-slate-600">{item.category}</td>
                  <td className="py-3 px-6 font-mono font-medium text-slate-800">{item.price}</td>
                  <td className="py-3 px-6 font-mono text-slate-700">{item.stock}</td>
                  <td className="py-3 px-6">
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
