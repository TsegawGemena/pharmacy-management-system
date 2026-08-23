"use client";

import React, { useEffect, useState } from "react";
import { Settings } from "lucide-react";
import AdminHeader from "@/components/admin/admin-header";
import { getOrganization, getStoredUser } from "@/lib/api";
import { useApi } from "@/lib/hooks/use-api";
import type { User } from "@/lib/types";

export default function AdminSettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const { data: org } = useApi(getOrganization);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  return (
    <div>
      <AdminHeader
        title="Settings"
        subtitle="Admin account and organization preferences."
        searchPlaceholder="Search settings..."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xs">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-4 w-4 text-sky-600" />
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Admin Profile
            </h2>
          </div>
          <dl className="space-y-3 text-xs">
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Name</dt>
              <dd className="font-semibold text-slate-800 dark:text-slate-100">
                {user?.name || "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Employee ID</dt>
              <dd className="font-mono font-semibold">{user?.employeeId || "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Role</dt>
              <dd className="font-semibold">Admin</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Email</dt>
              <dd className="font-semibold">{user?.email || "—"}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xs">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">
            Organization
          </h2>
          <dl className="space-y-3 text-xs">
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Name</dt>
              <dd className="font-semibold text-slate-800 dark:text-slate-100">
                {org?.name || "Gammo Pharmacy"}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Phone</dt>
              <dd className="font-semibold">{org?.phone || "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Email</dt>
              <dd className="font-semibold">{org?.email || "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Address</dt>
              <dd className="font-semibold text-right max-w-[60%]">
                {org?.address || "—"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
