"use client";

import React from "react";
import { BarChart3 } from "lucide-react";
import AdminPlaceholderPage from "@/components/admin/admin-placeholder";

export default function AdminReportsPage() {
  return (
    <AdminPlaceholderPage
      icon={BarChart3}
      title="Reports"
      subtitle="Operational analytics for inventory, sales, and performance."
      searchPlaceholder="Search reports..."
      description="Admin operational reports will surface pharmacy-wide KPIs here. Detailed charts connect as report endpoints become available."
    />
  );
}
