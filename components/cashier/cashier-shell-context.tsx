"use client";

import React, { createContext, useContext } from "react";

const CashierMenuContext = createContext<{ open: () => void } | null>(null);

export function CashierMobileMenuProvider({
  open,
  children,
}: {
  open: () => void;
  children: React.ReactNode;
}) {
  return (
    <CashierMenuContext.Provider value={{ open }}>
      {children}
    </CashierMenuContext.Provider>
  );
}

export function useCashierMobileMenu() {
  return useContext(CashierMenuContext);
}
