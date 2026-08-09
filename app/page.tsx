import React from "react";
import StatCards from "@/components/dashboard/stat-cards";
import SalesOverview from "@/components/dashboard/sales-overview";
import QuickActions from "@/components/dashboard/quick-actions";
import RecentSales from "@/components/dashboard/recent-sales";
import ExpiryAlerts from "@/components/dashboard/expiry-alerts";
import LowStockAlerts from "@/components/dashboard/low-stock-alerts";

export default function Home() {
  return (
    <div className="space-y-6">
      {/* 1. Top KPI Summary Cards (4 Cards) */}
      <section aria-label="Key Performance Indicators">
        <StatCards />
      </section>

      {/* 2. Middle Row: Sales Overview (Left 2/3) & Quick Actions (Right 1/3) */}
      <section
        aria-label="Sales and Actions"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch"
      >
        <div className="lg:col-span-2">
          <SalesOverview />
        </div>
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </section>

      {/* 3. Recent Sales Table */}
      <section aria-label="Recent Sales Transactions">
        <RecentSales />
      </section>

      {/* 4. Bottom Alerts Row: Expiry Alerts & Low Stock Alerts */}
      <section
        aria-label="Inventory Alerts"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch"
      >
        <ExpiryAlerts />
        <LowStockAlerts />
      </section>
    </div>
  );
}