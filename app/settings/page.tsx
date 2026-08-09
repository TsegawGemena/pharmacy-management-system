"use client";

import React, { useState } from "react";
import {
  Building2,
  Shield,
  Bell,
  User,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  Save,
  MapPin,
  Phone,
  Mail,
  Receipt,
  FileBadge,
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "branding" | "tax" | "users">("general");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [pharmacyName, setPharmacyName] = useState("Gammo Pharmacy - Clinical Management");
  const [orgName, setOrgName] = useState("Gamo Development Association (ጋሞ ልማት ማህበር)");
  const [motto, setMotto] = useState("GAAMMO DICHCHA ISSIPETETHTHA");
  const [address, setAddress] = useState("Arba Minch & Addis Ababa, Ethiopia");
  const [licenseNo, setLicenseNo] = useState("EFDA/PH-2024/0981");
  const [tinNumber, setTinNumber] = useState("0049281726");
  const [vatRate, setVatRate] = useState(15);
  const [currency, setCurrency] = useState("ETB (Ethiopian Birr)");
  const [leadDays, setLeadDays] = useState(90);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Settings & branding updated successfully!");
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-xl shadow-lg border border-slate-700 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            System Settings
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure organization identity, official branding, tax, and system preferences.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#006699] hover:bg-[#005580] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors"
        >
          <Save className="h-4 w-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Pharmacy Hero Showcase Card */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-gradient-to-r from-sky-900 via-slate-900 to-teal-950 text-white p-6 sm:p-8">
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Logo Badge */}
          <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl bg-white p-2 shrink-0 shadow-lg border border-white/20 flex items-center justify-center">
            <img
              src="/logo.jpg"
              alt="Gamo Development Association Logo"
              className="h-full w-full object-contain"
            />
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/15 text-sky-200 backdrop-blur-xs border border-white/10">
              <span>{motto}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {orgName}
            </h3>
            <p className="text-sm font-medium text-sky-100/90">
              {pharmacyName}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-300 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-sky-400" />
                {address}
              </span>
              <span className="flex items-center gap-1">
                <FileBadge className="h-3.5 w-3.5 text-teal-400" />
                License: {licenseNo}
              </span>
            </div>
          </div>
        </div>

        {/* Decorative blur backdrop */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Settings Grid */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Organization & Branding Info Card */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-sm font-bold text-slate-800">
            <Building2 className="h-4 w-4 text-[#006699]" />
            <span>Organization & Branding Profile</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Pharmacy / Branch Name *
              </label>
              <input
                type="text"
                required
                value={pharmacyName}
                onChange={(e) => setPharmacyName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 text-slate-800 focus:outline-hidden focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Parent Association (Amharic & English) *
              </label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 text-slate-800 focus:outline-hidden focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Official Motto / Slogan
              </label>
              <input
                type="text"
                value={motto}
                onChange={(e) => setMotto(e.target.value)}
                className="w-full px-3.5 py-2 text-sm font-semibold text-slate-800 rounded-lg border border-slate-200 focus:outline-hidden focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Branch Location & Physical Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 text-slate-800 focus:outline-hidden focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                EFDA Pharmacy License Number
              </label>
              <input
                type="text"
                value={licenseNo}
                onChange={(e) => setLicenseNo(e.target.value)}
                className="w-full px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-200 text-slate-800 focus:outline-hidden focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                TIN (Tax Identification Number)
              </label>
              <input
                type="text"
                value={tinNumber}
                onChange={(e) => setTinNumber(e.target.value)}
                className="w-full px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-200 text-slate-800 focus:outline-hidden focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Financial & Operational Parameters */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-sm font-bold text-slate-800">
            <Receipt className="h-4 w-4 text-[#006699]" />
            <span>Financial & Stock Thresholds</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Operating Currency
              </label>
              <input
                type="text"
                disabled
                value={currency}
                className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Standard VAT / Tax Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={vatRate}
                onChange={(e) => setVatRate(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-200 text-slate-800 focus:outline-hidden focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Expiry Alert Lead Time
              </label>
              <select
                value={leadDays}
                onChange={(e) => setLeadDays(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-sky-500 font-medium"
              >
                <option value={30}>30 Days</option>
                <option value={60}>60 Days</option>
                <option value={90}>90 Days</option>
                <option value={180}>180 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer save */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#006699] hover:bg-[#005580] text-white text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Save All Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
