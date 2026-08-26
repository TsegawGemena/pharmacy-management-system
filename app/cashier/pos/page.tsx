"use client";

import React from "react";
import CashierHeader from "@/components/cashier/cashier-header";
import { useCashierMobileMenu } from "@/components/cashier/cashier-shell-context";
import PosPage from "@/app/pos/page";

/** Cashier POS — reuses the shared checkout UI (price is not editable). */
export default function CashierPosPage() {
  const menu = useCashierMobileMenu();

  return (
    <div>
      <CashierHeader
        title="Point of Sale"
        subtitle="Search medicines, build the cart, and complete checkout."
        onOpenMobileMenu={menu?.open}
      />
      <PosPage />
    </div>
  );
}
