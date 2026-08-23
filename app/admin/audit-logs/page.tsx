"use client";

import React, { useMemo } from "react";
import { Shield } from "lucide-react";
import AdminHeader from "@/components/admin/admin-header";
import { PageState } from "@/components/ui/page-state";
import { getActivity } from "@/lib/api";
import { useApi } from "@/lib/hooks/use-api";

export default function AdminAuditLogsPage() {
  const { data, loading, error, refetch } = useApi(getActivity);
  const activities = data ?? [];

  const rows = useMemo(() => activities, [activities]);

  return (
    <div>
      <AdminHeader
        title="Audit Logs"
        subtitle="Security and activity trail across pharmacy operations."
        searchPlaceholder="Search audit logs..."
      />

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
        <PageState loading={loading} error={error} onRetry={refetch} empty={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Action</th>
                  <th className="py-3.5 px-5">Details</th>
                  <th className="py-3.5 px-5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-10 text-center text-slate-400">
                      <Shield className="h-5 w-5 mx-auto mb-2 opacity-50" />
                      No audit log entries found
                    </td>
                  </tr>
                )}
                {rows.map((item, idx) => (
                  <tr
                    key={item.id ?? idx}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                  >
                    <td className="py-3.5 px-5 font-semibold text-slate-800 dark:text-slate-100">
                      {item.action || "Activity"}
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300">
                      {item.details || "—"}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-slate-500">
                      {item.timestamp
                        ? new Date(item.timestamp).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PageState>
      </div>
    </div>
  );
}
