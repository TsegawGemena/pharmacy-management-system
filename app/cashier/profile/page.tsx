"use client";

import React, { useEffect, useState } from "react";
import { KeyRound, UserRound } from "lucide-react";
import CashierHeader from "@/components/cashier/cashier-header";
import { useCashierMobileMenu } from "@/components/cashier/cashier-shell-context";
import EditProfileModal from "@/components/settings/edit-profile-modal";
import {
  changePasswordApi,
  getStoredUser,
  getUserProfileApi,
  saveAuthSession,
  updateUserProfileApi,
  getAuthToken,
  getSelectedRole,
} from "@/lib/api";
import type { User } from "@/lib/types";

export default function CashierProfilePage() {
  const menu = useCashierMobileMenu();
  const [user, setUser] = useState<User | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
    getUserProfileApi()
      .then((u) => {
        setUser(u);
        const token = getAuthToken();
        if (token) saveAuthSession(token, u, getSelectedRole() ?? undefined);
      })
      .catch(() => {
        // keep stored user
      });
  }, []);

  const handleSaveProfile = async (data: {
    fullName: string;
    phone: string;
    email: string;
  }) => {
    try {
      const updated = await updateUserProfileApi({
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
      });
      setUser(updated);
      const token = getAuthToken();
      if (token) saveAuthSession(token, updated, getSelectedRole() ?? undefined);
      setMessage("Profile updated");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    setSavingPw(true);
    try {
      const res = await changePasswordApi({
        currentPassword,
        newPassword,
      });
      setMessage(res.message || "Password changed");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div>
      <CashierHeader
        title="My Profile"
        subtitle="View your account and change your password. Role and employee ID are locked."
        onOpenMobileMenu={menu?.open}
      />

      {(message || error) && (
        <div
          className={`mb-4 px-4 py-2.5 rounded-xl text-xs font-medium ${
            error
              ? "bg-rose-50 text-rose-700 border border-rose-200"
              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
          }`}
        >
          {error || message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-sky-600" />
              <h2 className="text-sm font-bold">Profile</h2>
            </div>
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="text-xs font-semibold text-[#006699] hover:underline"
            >
              Edit contact info
            </button>
          </div>
          <dl className="space-y-3 text-xs">
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Name</dt>
              <dd className="font-semibold">{user?.name || "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Employee ID</dt>
              <dd className="font-mono font-semibold text-slate-400">
                {user?.employeeId || "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Role</dt>
              <dd className="font-semibold text-slate-400">Cashier</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Email</dt>
              <dd className="font-semibold">{user?.email || "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Phone</dt>
              <dd className="font-semibold">{user?.phone || "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Status</dt>
              <dd className="font-semibold text-slate-400">
                {user?.status || "—"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xs">
          <div className="flex items-center gap-2 mb-4">
            <KeyRound className="h-4 w-4 text-sky-600" />
            <h2 className="text-sm font-bold">Change password</h2>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Current password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                New password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Confirm new password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
            <button
              type="submit"
              disabled={savingPw}
              className="w-full py-2.5 rounded-xl bg-[#0c3e66] text-white text-xs font-semibold disabled:opacity-60"
            >
              {savingPw ? "Updating…" : "Update password"}
            </button>
          </form>
        </div>
      </div>

      <EditProfileModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleSaveProfile}
        initialData={{
          fullName: user?.name || "",
          phone: user?.phone || "",
          email: user?.email || "",
        }}
      />
    </div>
  );
}
