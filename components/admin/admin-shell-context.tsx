"use client";

import React, { createContext, useContext } from "react";

const AdminMobileMenuContext = createContext<(() => void) | null>(null);

export function AdminMobileMenuProvider({
  open,
  children,
}: {
  open: () => void;
  children: React.ReactNode;
}) {
  return (
    <AdminMobileMenuContext.Provider value={open}>
      {children}
    </AdminMobileMenuContext.Provider>
  );
}

export function useAdminMobileMenu() {
  return useContext(AdminMobileMenuContext);
}
