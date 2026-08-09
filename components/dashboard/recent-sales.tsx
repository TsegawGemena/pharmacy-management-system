"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Banknote, Smartphone } from "lucide-react";

export default function RecentSales() {
  const sales = [
    {
      invoice: "INV-00124",
      product: "Amoxicillin 500mg (3 Units)",
      items: 3,
      amount: "3,850.00",
      paymentMethod: "Cash",
      paymentType: "cash",
      status: "PAID",
    },
    {
      invoice: "INV-00123",
      product: "Paracetamol 500mg (5 Units)",
      items: 5,
      amount: "1,240.00",
      paymentMethod: "Mobile Money",
      paymentType: "mobile",
      status: "PAID",
    },
    {
      invoice: "INV-00122",
      product: "Omeprazole 20mg (2 Units)",
      items: 2,
      amount: "420.00",
      paymentMethod: "Cash",
      paymentType: "cash",
      status: "PAID",
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* Card Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h2 className="text-base lg:text-[17px] font-bold text-slate-800 tracking-tight">
          Recent Sales
        </h2>
        <Link
          href="/invoices"
          className="text-xs sm:text-sm font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-6">Invoice</th>
              <th className="py-3 px-6">Product / Item</th>
              <th className="py-3 px-6">Items</th>
              <th className="py-3 px-6">Amount (ETB)</th>
              <th className="py-3 px-6">Payment</th>
              <th className="py-3 px-6 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
            {sales.map((sale) => (
              <tr
                key={sale.invoice}
                className="hover:bg-slate-50/70 transition-colors"
              >
                <td className="py-3.5 px-6 font-mono font-medium text-sky-600">
                  <Link href={`/invoices?id=${sale.invoice}`} className="hover:underline">
                    {sale.invoice}
                  </Link>
                </td>
                <td className="py-3.5 px-6 font-medium text-slate-800">
                  {sale.product}
                </td>
                <td className="py-3.5 px-6 text-slate-600 font-mono">
                  {sale.items}
                </td>
                <td className="py-3.5 px-6 font-mono font-bold text-slate-800">
                  {sale.amount}
                </td>
                <td className="py-3.5 px-6 text-slate-700">
                  <div className="flex items-center gap-1.5">
                    {sale.paymentType === "cash" ? (
                      <Banknote className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Smartphone className="h-4 w-4 text-sky-600" />
                    )}
                    <span>{sale.paymentMethod}</span>
                  </div>
                </td>
                <td className="py-3.5 px-6 text-center">
                  <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-700 border border-teal-200/60">
                    {sale.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
