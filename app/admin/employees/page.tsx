"use client";

import React from "react";
import { Users } from "lucide-react";
import AdminPlaceholderPage from "@/components/admin/admin-placeholder";

export default function AdminEmployeesPage() {
  return (
    <AdminPlaceholderPage
      icon={Users}
      title="Employees"
      subtitle="Manage pharmacists, cashiers, and admin staff accounts."
      searchPlaceholder="Search employees..."
      description="Employee administration will list staff, roles, and status once the employees API is available. This Admin Console page is visible only to Admin users."
    />
  );
}
