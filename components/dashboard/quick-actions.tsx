"use client";

import React from "react";
import Link from "next/link";
import {
  ShoppingCart,
  PlusCircle,
  PackagePlus,
  ReceiptText,
} from "lucide-react";

export default function QuickActions() {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between h-full">
      {/* Title */}
      <div>
        <h2 className="text-base lg:text-[17px] font-bold text-slate-800 tracking-tight">
          Quick Actions
        </h2>
      </div>

      {/* Button list */}
      <div className="flex flex-col gap-2.5 my-auto pt-3">
        {/* Action 1: + New Sale (Primary solid) */}
        <Link
          href="/pos"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-[#006699] hover:bg-[#005580] text-white text-xs sm:text-sm font-semibold transition-all duration-150 shadow-xs active:scale-[0.99]"
        >
          <ShoppingCart className="h-4 w-4" />
          <span>+ New Sale</span>
        </Link>

        {/* Action 2: + Add Product (Outline blue) */}
        <Link
          href="/products"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-white hover:bg-sky-50/60 border border-[#0284c7] text-[#0284c7] text-xs sm:text-sm font-semibold transition-all duration-150 shadow-2xs active:scale-[0.99]"
        >
          <PlusCircle className="h-4 w-4" />
          <span>+ Add Product</span>
        </Link>

        {/* Action 3: + Add Stock (Outline blue) */}
        <Link
          href="/inventory"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-white hover:bg-sky-50/60 border border-[#0284c7] text-[#0284c7] text-xs sm:text-sm font-semibold transition-all duration-150 shadow-2xs active:scale-[0.99]"
        >
          <PackagePlus className="h-4 w-4" />
          <span>+ Add Stock</span>
        </Link>

        {/* Action 4: View Invoices (Neutral outline) */}
        <Link
          href="/invoices"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-all duration-150 shadow-2xs active:scale-[0.99]"
        >
          <ReceiptText className="h-4 w-4 text-slate-500" />
          <span>View Invoices</span>
        </Link>
      </div>
    </div>
  );
}
