"use client";

import React, { useMemo, useState } from "react";
import {
  Loader2,
  Plus,
  Search,
  UserCheck,
  UserX,
  Users,
  X,
} from "lucide-react";
import AdminHeader from "@/components/admin/admin-header";
import {
  createEmployee,
  getEmployees,
  updateEmployee,
  updateEmployeeStatus,
} from "@/lib/api";
import { useApi } from "@/lib/hooks/use-api";
import type { User, UserRole, UserStatus } from "@/lib/types";
import { PageState } from "@/components/ui/page-state";

const ROLES: Array<UserRole | "All"> = ["All", "Admin", "Pharmacist", "Cashier"];
const STATUSES: Array<UserStatus | "All"> = ["All", "Active", "Inactive"];

const emptyForm = {
  employeeId: "",
  name: "",
  email: "",
  phone: "",
  password: "",
  role: "Pharmacist" as UserRole,
  status: "Active" as UserStatus,
};

export default function AdminEmployeesPage() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState<UserRole | "All">("All");
  const [status, setStatus] = useState<UserStatus | "All">("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    data: employeesResult,
    loading,
    error,
    refetch,
  } = useApi(
    () => getEmployees({ q: q || undefined, role, status, limit: 100 }),
    [q, role, status]
  );

  const rows = useMemo(() => {
    const list = employeesResult?.data;
    return Array.isArray(list) ? list : [];
  }, [employeesResult]);

  const stats = useMemo(() => {
    return {
      total: rows.length,
      active: rows.filter((e) => e.status === "Active").length,
      pharmacists: rows.filter((e) => e.role === "Pharmacist").length,
      cashiers: rows.filter((e) => e.role === "Cashier").length,
      admins: rows.filter((e) => e.role === "Admin").length,
    };
  }, [rows]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (user: User) => {
    setEditing(user);
    setForm({
      employeeId: user.employeeId,
      name: user.name,
      email: user.email || "",
      phone: user.phone || "",
      password: "",
      role: (user.role as UserRole) || "Pharmacist",
      status: (user.status as UserStatus) || "Active",
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      if (editing) {
        await updateEmployee(editing.id, {
          employeeId: form.employeeId,
          name: form.name,
          email: form.email || null,
          phone: form.phone || null,
          role: form.role,
          status: form.status,
          ...(form.password ? { password: form.password } : {}),
        });
      } else {
        await createEmployee({
          employeeId: form.employeeId,
          name: form.name,
          email: form.email || null,
          phone: form.phone || null,
          password: form.password,
          role: form.role,
          status: form.status,
        });
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (user: User) => {
    const next = user.status === "Active" ? "Inactive" : "Active";
    try {
      await updateEmployeeStatus(user.id, next);
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Status update failed");
    }
  };

  return (
    <div>
      <AdminHeader
        title="Employees"
        subtitle="Manage pharmacists, cashiers, and admin staff accounts."
        searchPlaceholder="Search employees..."
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Total", value: stats.total },
          { label: "Active", value: stats.active },
          { label: "Admins", value: stats.admins },
          { label: "Pharmacists", value: stats.pharmacists },
          { label: "Cashiers", value: stats.cashiers },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4"
          >
            <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">
              {s.label}
            </p>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, ID, or email..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole | "All")}
            className="text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r === "All" ? "All roles" : r}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as UserStatus | "All")}
            className="text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === "All" ? "All statuses" : s}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#006699] text-white text-sm font-semibold hover:bg-[#005580]"
          >
            <Plus className="h-4 w-4" />
            Add employee
          </button>
        </div>

        <PageState loading={loading} error={error} onRetry={refetch}>
          {rows.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
              No employees found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((user) => (
                    <tr
                      key={user.id}
                      className="border-t border-slate-100 dark:border-slate-800"
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800 dark:text-slate-100">
                          {user.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {user.employeeId}
                          {user.email ? ` · ${user.email}` : ""}
                        </div>
                      </td>
                      <td className="px-4 py-3">{user.role}</td>
                      <td className="px-4 py-3">{user.phone || "—"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                            user.status === "Active"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {user.status || "Active"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {user.dateJoined
                          ? new Date(user.dateJoined).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => openEdit(user)}
                          className="text-[#006699] font-semibold hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleStatus(user)}
                          className="inline-flex items-center gap-1 text-slate-600 font-semibold hover:underline"
                        >
                          {user.status === "Active" ? (
                            <>
                              <UserX className="h-3.5 w-3.5" /> Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-3.5 w-3.5" /> Activate
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </PageState>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-slate-100">
                {editing ? "Edit employee" : "Add employee"}
              </h3>
              <button type="button" onClick={() => setModalOpen(false)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-3">
              {formError && (
                <p className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">
                  {formError}
                </p>
              )}
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs font-semibold text-slate-500 col-span-1">
                  Employee ID
                  <input
                    required
                    value={form.employeeId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, employeeId: e.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-500">
                  Role
                  <select
                    value={form.role}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        role: e.target.value as UserRole,
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Pharmacist">Pharmacist</option>
                    <option value="Cashier">Cashier</option>
                  </select>
                </label>
              </div>
              <label className="block text-xs font-semibold text-slate-500">
                Full name
                <input
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs font-semibold text-slate-500">
                  Email
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-500">
                  Phone
                  <input
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm"
                  />
                </label>
              </div>
              <label className="block text-xs font-semibold text-slate-500">
                {editing ? "New password (optional)" : "Password"}
                <input
                  type="password"
                  required={!editing}
                  minLength={editing ? undefined : 8}
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-xs font-semibold text-slate-500">
                Status
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      status: e.target.value as UserStatus,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-[#006699] text-white font-semibold disabled:opacity-60"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editing ? "Save changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
