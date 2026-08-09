"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Shield,
  Clock,
  Activity,
  Phone,
  Mail,
  Calendar,
  Building2,
  CheckCircle2,
  XCircle,
  KeyRound,
  Smartphone,
  Laptop,
  LogOut,
  Edit3,
  Image as ImageIcon,
  RotateCcw,
  Check,
  FileBadge,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import EditProfileModal from "@/components/settings/edit-profile-modal";

export default function SettingsAndProfilePage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "attendance" | "security" | "activity" | "organization"
  >("overview");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Profile Information
  const [profile, setProfile] = useState({
    fullName: "Abebe Kebede",
    employeeId: "EMP-2841",
    role: "Pharmacist",
    status: "Active",
    phone: "+251 911 123456",
    email: "abebe.k@gammopharmacy.com",
    dateJoined: "Sep 12, 2023",
    avatar: "/pharmacist-avatar.png",
  });

  // Shift & Clock state
  const [isClockedIn, setIsClockedIn] = useState(true);
  const [shiftHours, setShiftHours] = useState(6.5);
  const [currentTime, setCurrentTime] = useState("07:08:34");

  // Running digital clock
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toTimeString().split(" ")[0]);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleProfileSave = (data: { fullName: string; phone: string; email: string }) => {
    setProfile((prev) => ({
      ...prev,
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
    }));
    showToast("Profile details updated successfully!");
  };

  const handleClockToggle = () => {
    if (isClockedIn) {
      setIsClockedIn(false);
      showToast("Clocked out successfully for today's shift.");
    } else {
      setIsClockedIn(true);
      showToast("Clocked in! Shift timer active.");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl pb-10">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium rounded-xl shadow-lg border border-slate-700 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            {/* Pharmacist Photo */}
            <div className="relative h-20 w-20 sm:h-22 sm:w-22 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 shrink-0 shadow-sm">
              <img
                src={profile.avatar}
                alt={profile.fullName}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Pharmacist Details */}
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                  {profile.fullName}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span className="font-mono">{profile.employeeId}</span>
                <span>•</span>
                <span>{profile.role}</span>
              </div>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors shadow-2xs"
            >
              <ImageIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <span>Update Photo</span>
            </button>

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#006699] hover:bg-[#005580] rounded-xl transition-colors shadow-xs"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Sub Navigation Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <div className="flex space-x-6 sm:space-x-8 overflow-x-auto text-xs sm:text-sm font-semibold">
          {[
            { id: "overview", label: "OVERVIEW" },
            { id: "attendance", label: "WORK & ATTENDANCE" },
            { id: "security", label: "SECURITY" },
            { id: "activity", label: "ACTIVITY" },
            { id: "organization", label: "ORGANIZATION & BRANDING" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3.5 border-b-2 transition-all whitespace-nowrap uppercase tracking-wider text-xs ${
                activeTab === tab.id
                  ? "border-[#006699] text-[#006699] dark:text-sky-400 dark:border-sky-400 font-bold"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW (Image 1) */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Contact Information Card */}
            <div className="md:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xs space-y-5 transition-colors">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold text-sm">
                <User className="h-4 w-4 text-[#006699] dark:text-sky-400" />
                <span>Contact Information</span>
              </div>

              <div className="space-y-4 text-xs sm:text-[13px]">
                <div>
                  <span className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Phone Number
                  </span>
                  <span className="font-mono font-medium text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {profile.phone}
                  </span>
                </div>

                <div>
                  <span className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Email Address
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                    {profile.email}
                  </span>
                </div>

                <div>
                  <span className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Date Joined
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {profile.dateJoined}
                  </span>
                </div>
              </div>
            </div>

            {/* Current Shift Card */}
            <div className="md:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xs space-y-5 transition-colors">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold text-sm">
                <Clock className="h-4 w-4 text-[#006699] dark:text-sky-400" />
                <span>Current Shift</span>
              </div>

              {/* Progress Gauge */}
              <div className="flex flex-col items-center justify-center py-2 space-y-3">
                <div className="relative h-28 w-28 flex items-center justify-center">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100 dark:text-slate-800 stroke-current"
                      strokeWidth="3.5"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#006699] dark:text-sky-400 stroke-current"
                      strokeDasharray="75, 100"
                      strokeLinecap="round"
                      strokeWidth="3.5"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-mono">
                      {shiftHours}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      HRS
                    </span>
                  </div>
                </div>

                <div className="text-center space-y-0.5">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Clocked in at <strong className="text-slate-800 dark:text-slate-200">08:30 AM</strong>
                  </p>
                  <p className="text-xs font-bold text-[#006699] dark:text-sky-400 uppercase tracking-wider">
                    STATUS: ON DUTY
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleClockToggle}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl hover:bg-rose-100 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Clock Out</span>
                </button>

                <button
                  onClick={() => setActiveTab("attendance")}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
                  <span>History</span>
                </button>
              </div>
            </div>

            {/* Recent Activity Card */}
            <div className="md:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xs space-y-4 transition-colors">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold text-sm">
                  <Activity className="h-4 w-4 text-[#006699] dark:text-sky-400" />
                  <span>Recent Activity</span>
                </div>
                <button
                  onClick={() => setActiveTab("activity")}
                  className="text-xs font-semibold text-[#006699] dark:text-sky-400 hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="space-y-4 pt-1">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-sky-50 dark:bg-sky-950 text-[#006699] dark:text-sky-400 rounded-lg shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      Completed Sale
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Processed transaction <span className="font-mono font-semibold text-sky-600 dark:text-sky-400">#INV-2045</span>
                    </p>
                    <span className="text-[10px] text-slate-400 block mt-0.5">10 mins ago</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 rounded-lg shrink-0 mt-0.5">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      Updated Inventory
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Adjusted stock levels for Paracetamol 500mg
                    </p>
                    <span className="text-[10px] text-slate-400 block mt-0.5">45 mins ago</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg shrink-0 mt-0.5">
                    <Laptop className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      System Login
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Logged in from workstation WS-04
                    </p>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Today, 08:30 AM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Permissions Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xs space-y-4 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold text-sm">
                <Shield className="h-4 w-4 text-[#006699] dark:text-sky-400" />
                <span>System Permissions</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                READ-ONLY
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">POS Access</span>
                <CheckCircle2 className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Inventory Management</span>
                <CheckCircle2 className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Invoice Generation</span>
                <CheckCircle2 className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 opacity-70">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">System Configuration</span>
                <XCircle className="h-4 w-4 text-slate-400" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 opacity-70">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">User Management</span>
                <XCircle className="h-4 w-4 text-slate-400" />
              </div>
            </div>

            <p className="text-[11px] text-slate-400 dark:text-slate-500 italic pt-1">
              Permissions are managed by the System Administrator. Contact support for changes.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: WORK & ATTENDANCE (Image 2) */}
      {/* ========================================================================= */}
      {activeTab === "attendance" && (
        <div className="space-y-6">
          {/* Header Bar with Live Clock */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xs transition-colors">
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                Work & Attendance
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage your clinical hours and shift history.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  CURRENT TIME (EAT)
                </span>
                <span className="text-lg font-extrabold font-mono text-slate-800 dark:text-slate-100">
                  {currentTime}
                </span>
              </div>

              <button
                onClick={() => showToast("Clocked in")}
                className="px-4 py-2 bg-[#006699] hover:bg-[#005580] text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-xs"
              >
                Clock In
              </button>

              <button
                onClick={() => showToast("Clocked out")}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold rounded-xl transition-colors"
              >
                Clock Out
              </button>
            </div>
          </div>

          {/* 4 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>TODAY</span>
                <Clock className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              </div>
              <div className="text-2xl lg:text-[28px] font-extrabold text-slate-800 dark:text-slate-100 font-mono mt-2">
                8h 0m
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>THIS WEEK</span>
                <Calendar className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="text-2xl lg:text-[28px] font-extrabold text-slate-800 dark:text-slate-100 font-mono mt-2">
                42h 30m
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>THIS MONTH</span>
                <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="text-2xl lg:text-[28px] font-extrabold text-slate-800 dark:text-slate-100 font-mono mt-2">
                168h 0m
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>OVERTIME (MO)</span>
                <RotateCcw className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="text-2xl lg:text-[28px] font-extrabold text-slate-800 dark:text-slate-100 font-mono mt-2">
                4h 15m
              </div>
            </div>
          </div>

          {/* Bottom Grid: Attendance History Table + Weekly Chart & Schedule */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Attendance History Table */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Attendance History
                </h4>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                  <button className="px-3 py-1 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg shadow-2xs">
                    This Week
                  </button>
                  <button className="px-3 py-1 text-slate-600 dark:text-slate-400 hover:text-slate-900">
                    This Month
                  </button>
                  <button className="px-3 py-1 text-slate-600 dark:text-slate-400 hover:text-slate-900">
                    Custom
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-[13px]">
                  <thead className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="py-3 px-5">DATE</th>
                      <th className="py-3 px-4 font-mono">CLOCK IN</th>
                      <th className="py-3 px-4 font-mono">CLOCK OUT</th>
                      <th className="py-3 px-4 font-mono">TOTAL</th>
                      <th className="py-3 px-4 font-mono">OVERTIME</th>
                      <th className="py-3 px-5 text-center">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-5 font-semibold text-slate-800 dark:text-slate-200">
                        Oct 24, 2023
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                        08:00 AM
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                        05:00 PM
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-100">
                        8h 0m
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">-</td>
                      <td className="py-3.5 px-5 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                          Present
                        </span>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-5 font-semibold text-slate-800 dark:text-slate-200">
                        Oct 23, 2023
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                        08:15 AM
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                        06:30 PM
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-100">
                        9h 15m
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-rose-600 dark:text-rose-400">
                        1h 15m
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          Late
                        </span>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-5 font-semibold text-slate-800 dark:text-slate-200">
                        Oct 20, 2023
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                        07:55 AM
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                        05:05 PM
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-100">
                        8h 10m
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">-</td>
                      <td className="py-3.5 px-5 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                          Present
                        </span>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-5 font-semibold text-slate-800 dark:text-slate-200">
                        Oct 19, 2023
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                        08:00 AM
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                        05:00 PM
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-100">
                        8h 0m
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">-</td>
                      <td className="py-3.5 px-5 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                          Present
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Hours Last 7 Days + Current Schedule */}
            <div className="lg:col-span-4 space-y-6">
              {/* Bar Chart */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs space-y-4">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Hours - Last 7 Days
                </h4>
                <div className="h-36 flex items-end justify-between gap-2 pt-2 px-2">
                  {[
                    { day: "W", h: "75%", active: false },
                    { day: "T", h: "85%", active: false },
                    { day: "F", h: "95%", active: true },
                    { day: "S", h: "0%", active: false },
                    { day: "S", h: "0%", active: false },
                    { day: "M", h: "80%", active: false },
                    { day: "T", h: "45%", active: false },
                  ].map((bar, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 flex-1">
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-28 rounded-lg flex items-end justify-center p-0.5">
                        <div
                          style={{ height: bar.h }}
                          className={`w-full rounded-md transition-all ${
                            bar.active
                              ? "bg-[#006699] dark:bg-sky-500 shadow-xs"
                              : "bg-sky-200 dark:bg-sky-900/60"
                          }`}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        {bar.day}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Schedule */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs space-y-3">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Current Schedule
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Shift Pattern</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Standard Day</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Expected Hours</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">08:00 - 17:00</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 dark:text-slate-400">Break Entitlement</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">60 mins (Unpaid)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SECURITY (Image 4) */}
      {/* ========================================================================= */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (8 cols): Auth & Active Sessions */}
            <div className="lg:col-span-8 space-y-6">
              {/* Authentication & Security Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xs space-y-6">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-bold text-sm">
                  <KeyRound className="h-4 w-4 text-[#006699] dark:text-sky-400" />
                  <span>Authentication & Security</span>
                </div>

                {/* Password Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      Password
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Last changed 3 months ago
                    </p>
                  </div>
                  <button
                    onClick={() => showToast("Password change link dispatched to your email")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-2xs"
                  >
                    <KeyRound className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                    <span>Change Password</span>
                  </button>
                </div>

                {/* 2FA Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        Two-Factor Authentication (2FA)
                      </h5>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        ENABLED
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Protect your account with an extra layer of security.
                    </p>
                  </div>
                  <button
                    onClick={() => showToast("2FA Settings management modal")}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-2xs"
                  >
                    Manage 2FA
                  </button>
                </div>
              </div>

              {/* Active Sessions Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold text-sm">
                    <Laptop className="h-4 w-4 text-[#006699] dark:text-sky-400" />
                    <span>Active Sessions</span>
                  </div>
                  <button
                    onClick={() => showToast("Signed out all other devices")}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:hover:text-rose-400"
                  >
                    <LogOut className="h-3 w-3" />
                    <span>Sign out all others</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Session 1: Windows Desktop */}
                  <div className="p-4 rounded-xl border border-sky-100 dark:border-sky-950 bg-sky-50/50 dark:bg-sky-950/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-sky-100 dark:bg-sky-900 text-[#006699] dark:text-sky-300 rounded-xl">
                        <Laptop className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                            Windows Desktop
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300">
                            THIS DEVICE
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Addis Ababa, ET • <span className="font-mono">197.156.12.4</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Session 2: iPhone 13 */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl">
                        <Smartphone className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          iPhone 13
                        </span>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Addis Ababa, ET • Logged in 2 hours ago
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (4 cols): Security Activity Audit */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold text-sm">
                  <Activity className="h-4 w-4 text-[#006699] dark:text-sky-400" />
                  <span>Recent Activity</span>
                </div>
              </div>

              <div className="space-y-4 relative pl-4 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                <div className="relative">
                  <div className="absolute -left-5 top-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-900" />
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    Successful Login
                  </div>
                  <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    197.156.12.4
                  </p>
                  <span className="text-[10px] text-slate-400">Today, 08:30 AM</span>
                </div>

                <div className="relative">
                  <div className="absolute -left-5 top-0.5 h-3 w-3 rounded-full bg-sky-500 ring-4 ring-white dark:ring-slate-900" />
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    Password Changed
                  </div>
                  <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    10.0.0.45
                  </p>
                  <span className="text-[10px] text-slate-400">Oct 12, 2023</span>
                </div>

                <div className="relative">
                  <div className="absolute -left-5 top-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-900" />
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    Successful Login
                  </div>
                  <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    197.156.12.4
                  </p>
                  <span className="text-[10px] text-slate-400">Oct 10, 2023</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  onClick={() => showToast("Opening full audit log export")}
                  className="text-xs font-semibold text-[#006699] dark:text-sky-400 hover:underline"
                >
                  View Full Log
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ACTIVITY (Full Log) */}
      {/* ========================================================================= */}
      {activeTab === "activity" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Pharmacist Activity Audit Trail
            </h3>
            <button
              onClick={() => showToast("Activity logs exported")}
              className="text-xs font-semibold text-[#006699] dark:text-sky-400 hover:underline"
            >
              Export CSV
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {[
              {
                action: "Dispensed Prescription",
                target: "Amoxicillin 500mg (2 Boxes) to Abebe Kebede",
                time: "Today, 11:45 AM",
                icon: CheckCircle2,
                color: "text-emerald-600",
              },
              {
                action: "Completed Sale",
                target: "Processed transaction #INV-2045 (327.75 ETB)",
                time: "Today, 11:20 AM",
                icon: CheckCircle2,
                color: "text-sky-600",
              },
              {
                action: "Stock Count Verification",
                target: "Verified 145 units of Amoxicillin 500mg",
                time: "Today, 10:15 AM",
                icon: Calendar,
                color: "text-teal-600",
              },
              {
                action: "System Login",
                target: "Logged in from workstation WS-04",
                time: "Today, 08:30 AM",
                icon: Laptop,
                color: "text-indigo-600",
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${item.color} shrink-0`} />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-100">
                        {item.action}
                      </span>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                        {item.target}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono shrink-0">
                    {item.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ORGANIZATION & BRANDING */}
      {/* ========================================================================= */}
      {activeTab === "organization" && (
        <div className="space-y-6">
          {/* Pharmacy Hero Showcase Card */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-gradient-to-r from-sky-900 via-slate-900 to-teal-950 text-white p-6 sm:p-8">
            <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl bg-white p-2 shrink-0 shadow-lg border border-white/20 flex items-center justify-center">
                <img
                  src="/logo.jpg"
                  alt="Gamo Development Association Logo"
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="space-y-2 text-center sm:text-left flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/15 text-sky-200 backdrop-blur-xs border border-white/10">
                  <span>GAAMMO DICHCHA ISSIPETETHTHA</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  Gamo Development Association (ጋሞ ልማት ማህበር)
                </h3>
                <p className="text-sm font-medium text-sky-100/90">
                  Gammo Pharmacy - Clinical Operations & Management
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-300 pt-1">
                  <span>Addis Ababa & Arba Minch, Ethiopia</span>
                  <span>EFDA License: EFDA/PH-2024/0981</span>
                  <span>TIN: 0049281726</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleProfileSave}
        initialData={{
          fullName: profile.fullName,
          phone: profile.phone,
          email: profile.email,
        }}
      />
    </div>
  );
}
