import React from "react";
import { BarChart3, TrendingUp, DollarSign, Package } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Pharmacy Reports & Analytics</h2>
        <p className="text-xs text-slate-500 mt-1">Financial performance, medication turnover, and stock analytics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Monthly Revenue</div>
          <div className="text-2xl font-bold text-slate-800 mt-2">554,800 ETB</div>
          <div className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" /> +14.2% vs last month
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Top Selling Category</div>
          <div className="text-2xl font-bold text-slate-800 mt-2">Antibiotics</div>
          <div className="text-xs text-slate-500 mt-2">42% of total store sales</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Total Prescriptions Dispensed</div>
          <div className="text-2xl font-bold text-slate-800 mt-2">1,842</div>
          <div className="text-xs text-emerald-600 font-semibold mt-2">+5.8% this week</div>
        </div>
      </div>
    </div>
  );
}
