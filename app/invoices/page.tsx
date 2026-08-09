import React from "react";
import { ReceiptText, Download, Filter, Search } from "lucide-react";

export default function InvoicesPage() {
  const invoices = [
    { id: "INV-00124", customer: "Walk-in Customer", date: "2026-08-09", items: 3, total: "3,850.00 ETB", payment: "Cash", status: "PAID" },
    { id: "INV-00123", customer: "Hana Customer", date: "2026-08-09", items: 5, total: "1,240.00 ETB", payment: "Mobile Money", status: "PAID" },
    { id: "INV-00122", customer: "Mohammed Customer", date: "2026-08-09", items: 2, total: "420.00 ETB", payment: "Cash", status: "PAID" },
    { id: "INV-00121", customer: "Yohannes Bekele", date: "2026-08-08", items: 4, total: "2,150.00 ETB", payment: "Telebirr", status: "PAID" },
    { id: "INV-00120", customer: "Aster Tesfaye", date: "2026-08-08", items: 1, total: "580.00 ETB", payment: "Cash", status: "PAID" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Sales Invoices</h2>
          <p className="text-xs text-slate-500 mt-1">View, filter, and export customer invoices and receipts.</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-2xs">
          <Download className="h-4 w-4 text-slate-500" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="py-3 px-6">Invoice #</th>
                <th className="py-3 px-6">Customer</th>
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6">Items</th>
                <th className="py-3 px-6">Total Amount</th>
                <th className="py-3 px-6">Payment Method</th>
                <th className="py-3 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-6 font-mono text-sky-600 font-medium">{inv.id}</td>
                  <td className="py-3.5 px-6 font-medium text-slate-800">{inv.customer}</td>
                  <td className="py-3.5 px-6 text-slate-500 font-mono">{inv.date}</td>
                  <td className="py-3.5 px-6 font-mono text-slate-600">{inv.items}</td>
                  <td className="py-3.5 px-6 font-mono font-bold text-slate-800">{inv.total}</td>
                  <td className="py-3.5 px-6 text-slate-700">{inv.payment}</td>
                  <td className="py-3.5 px-6 text-center">
                    <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-700 border border-teal-200/60">
                      {inv.status}
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
