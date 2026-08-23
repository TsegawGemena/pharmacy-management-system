"use client";

import React from "react";
import { ShoppingCart } from "lucide-react";
import AdminPlaceholderPage from "@/components/admin/admin-placeholder";

export default function AdminPosPage() {
  return (
    <AdminPlaceholderPage
      icon={ShoppingCart}
      title="Point of Sale"
      subtitle="Process sales and payments from the Admin Console."
      searchPlaceholder="Search POS..."
      description="Admin POS oversight is available here. Day-to-day cashier checkout can use a dedicated Cashier portal later; this route is Admin-only."
    />
  );
}
