"use client";

import React from "react";
import { Banknote } from "lucide-react";
import AdminPlaceholderPage from "@/components/admin/admin-placeholder";

export default function AdminFinancialReportsPage() {
  return (
    <AdminPlaceholderPage
      icon={Banknote}
      title="Financial Reports"
      subtitle="Revenue, margins, and payment-method performance."
      searchPlaceholder="Search financial reports..."
      description="Financial reporting for Admin oversight. Figures will populate from revenue and invoice APIs when those services are live."
    />
  );
}
