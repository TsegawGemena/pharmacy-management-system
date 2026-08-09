import React from "react";
import { Settings, Shield, Building, Bell, User } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">System Settings</h2>
        <p className="text-xs text-slate-500 mt-1">Configure pharmacy branch information, tax, and user preferences.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-2xs max-w-2xl space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Pharmacy Branch Name</label>
          <input
            type="text"
            defaultValue="Gammo Development Pharmacy - Main Branch"
            className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 text-slate-800 focus:outline-hidden focus:border-sky-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Default Currency</label>
          <input
            type="text"
            defaultValue="ETB (Ethiopian Birr)"
            disabled
            className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-600"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Expiry Warning Threshold</label>
          <select className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 text-slate-800 focus:outline-hidden focus:border-sky-500">
            <option value="30">30 Days</option>
            <option value="60">60 Days</option>
            <option value="90">90 Days</option>
          </select>
        </div>

        <button className="px-5 py-2 bg-[#006699] hover:bg-[#005580] text-white text-sm font-semibold rounded-lg shadow-xs transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
}
