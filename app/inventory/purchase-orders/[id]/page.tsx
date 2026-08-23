"use client";

import React, { useState, use, useMemo } from "react";
import Link from "next/link";
import {
  Package,
  Building2,
  Printer,
  Ban,
  PackageCheck,
  Truck,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  History,
  CheckCircle2,
  FileText,
  Loader2,
} from "lucide-react";
import InventoryNavTabs from "@/components/inventory/inventory-nav-tabs";
import ReceiveItemsModal from "@/components/inventory/receive-items-modal";
import {
  cancelPurchaseOrder,
  getPurchaseOrder,
  receivePurchaseOrder,
} from "@/lib/api";
import { useApi, useMutation } from "@/lib/hooks/use-api";
import type { PurchaseOrder, PurchaseOrderStatus } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface OrderLineItem {
  name: string;
  pack?: string;
  sku: string;
  qty: number;
  unitPrice: string;
  subtotal: string;
}

type PurchaseOrderDetail = PurchaseOrder & {
  items?: Array<{
    name?: string;
    pack?: string;
    sku?: string;
    qty?: number;
    quantity?: number;
    unitPrice?: number | string;
    subtotal?: number | string;
  }>;
  supplier?: PurchaseOrder["supplier"] & {
    email?: string;
    phone?: string;
    address?: string;
  };
  paymentTerms?: string;
  subtotal?: string;
  tax?: string;
  shipping?: string;
};

function formatDisplayDate(dateStr: string): string {
  if (!dateStr || dateStr === "--") return "--";
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(value: number | string): string {
  const num = typeof value === "number" ? value : parseFloat(String(value).replace(/,/g, ""));
  if (Number.isNaN(num)) return String(value);
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function mapOrderItems(order: PurchaseOrderDetail | null): OrderLineItem[] {
  if (!order?.items?.length) return [];
  return order.items.map((item) => {
    const qty = item.qty ?? item.quantity ?? 0;
    const unitNum =
      typeof item.unitPrice === "number"
        ? item.unitPrice
        : parseFloat(String(item.unitPrice ?? "0").replace(/,/g, ""));
    const subtotalNum =
      typeof item.subtotal === "number"
        ? item.subtotal
        : qty * (Number.isNaN(unitNum) ? 0 : unitNum);
    return {
      name: item.name ?? "Unknown Product",
      pack: item.pack,
      sku: item.sku ?? "—",
      qty,
      unitPrice: `${formatCurrency(unitNum)} ETB`,
      subtotal: `${formatCurrency(subtotalNum)} ETB`,
    };
  });
}

const ACTIONABLE_STATUSES: PurchaseOrderStatus[] = [
  "SHIPPED",
  "PENDING",
];

export default function PurchaseOrderDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const poId = resolvedParams.id;

  const { data: order, loading, error, refetch, setData } = useApi(
    () => getPurchaseOrder(poId) as Promise<PurchaseOrderDetail>,
    [poId]
  );
  const { mutate: receiveOrder, loading: receiving } = useMutation(
    receivePurchaseOrder
  );
  const { mutate: cancelOrder, loading: cancelling } = useMutation(
    cancelPurchaseOrder
  );

  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const status = order?.status ?? "PENDING";
  const orderItems = useMemo(() => mapOrderItems(order), [order]);

  const timeline = useMemo(() => {
    const steps = [];
    if (status === "RECEIVED") {
      steps.push({
        title: "Items Received & Stocked",
        detail: "Inventory updated",
        time: "Recently",
        icon: PackageCheck,
        color: "bg-emerald-100 text-emerald-700 border-emerald-300",
      });
    }
    if (status === "SHIPPED" || status === "RECEIVED") {
      steps.push({
        title: "Order Shipped",
        detail: "In transit from supplier",
        time: formatDisplayDate(order?.dateOrdered ?? ""),
        icon: Truck,
        color: "bg-sky-100 text-sky-600 border-sky-200",
      });
    }
    if (status !== "DRAFT" && status !== "CANCELLED") {
      steps.push({
        title: "Order Approved",
        detail: "Submitted for fulfillment",
        time: formatDisplayDate(order?.dateOrdered ?? ""),
        icon: CheckCircle2,
        color: "bg-slate-100 text-slate-700 border-slate-200",
      });
    }
    steps.push({
      title: "Order Created",
      detail: "Generated in system",
      time: formatDisplayDate(order?.dateOrdered ?? ""),
      icon: FileText,
      color: "bg-slate-100 text-slate-700 border-slate-200",
    });
    return steps;
  }, [order, status]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCancelOrder = async () => {
    if (!confirm("Are you sure you want to cancel this purchase order?")) return;
    const result = await cancelOrder(poId);
    if (result) {
      setData((prev) => (prev ? { ...prev, status: "CANCELLED" } : prev));
      showToast(result.message || "Purchase order has been cancelled");
      refetch();
    } else {
      showToast("Failed to cancel purchase order");
    }
  };

  const handleConfirmReceive = async (data: { notes?: string }) => {
    const result = await receiveOrder(poId);
    if (result) {
      setData((prev) => (prev ? { ...prev, status: "RECEIVED" } : prev));
      showToast(
        result.message ||
          `Shipment for ${poId} successfully received and stocked into inventory!`
      );
      refetch();
    } else {
      showToast("Failed to receive purchase order");
    }
  };

  const canReceiveOrCancel = ACTIONABLE_STATUSES.includes(status);
  const totalDisplay = order?.total
    ? `${formatCurrency(order.total)} ETB`
    : "—";

  if (loading) {
    return (
      <div className="space-y-6">
        <InventoryNavTabs />
        <div className="py-16 flex items-center justify-center gap-2 text-slate-400 text-xs">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading purchase order...
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <InventoryNavTabs />
        <div className="py-16 text-center space-y-3">
          <p className="text-xs text-rose-600 dark:text-rose-400">
            {error || "Purchase order not found"}
          </p>
          <Link
            href="/inventory/purchase-orders"
            className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
          >
            Back to Purchase Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sub Navigation Tabs */}
      <div className="print:hidden">
        <InventoryNavTabs />
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-xl shadow-lg border border-slate-700 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Printable Official Gamo Pharmacy Header (Visible when printing) */}
      <div className="hidden print:flex items-center justify-between border-b-2 border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-4">
          <img src="/logo.jpg" alt="Logo" className="h-16 w-16 object-contain" />
          <div>
            <h1 className="text-xl font-bold text-slate-900">GAMO DEVELOPMENT ASSOCIATION</h1>
            <h2 className="text-sm font-semibold text-sky-800">Gammo Pharmacy - Clinical Operations</h2>
            <p className="text-xs text-slate-500">Addis Ababa & Arba Minch, Ethiopia | EFDA License: EFDA/PH-2024/0981</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-base font-bold font-mono text-slate-900">{poId}</div>
          <div className="text-xs text-slate-500">Official Purchase Order</div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 print:hidden">
        <Link href="/inventory" className="hover:text-sky-600 dark:hover:text-sky-400">
          Inventory
        </Link>
        <span>&gt;</span>
        <Link href="/inventory/purchase-orders" className="hover:text-sky-600 dark:hover:text-sky-400">
          Purchase Orders
        </Link>
        <span>&gt;</span>
        <span className="text-slate-700 dark:text-slate-300 font-semibold font-mono">{poId}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              Purchase Order Details
            </h2>
            {status === "SHIPPED" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60">
                <Truck className="h-3.5 w-3.5" />
                SHIPPED
              </span>
            )}
            {status === "PENDING" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                PENDING
              </span>
            )}
            {status === "DRAFT" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                DRAFT
              </span>
            )}
            {status === "RECEIVED" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                <CheckCircle2 className="h-3.5 w-3.5" />
                RECEIVED
              </span>
            )}
            {status === "CANCELLED" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
                <Ban className="h-3.5 w-3.5" />
                CANCELLED
              </span>
            )}
          </div>
          <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">{poId}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 rounded-lg transition-colors shadow-2xs cursor-pointer"
          >
            <Printer className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <span>Print PO</span>
          </button>

          {canReceiveOrCancel && (
            <>
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
              >
                <span>{cancelling ? "Cancelling..." : "Cancel Order"}</span>
              </button>

              <button
                onClick={() => setIsReceiveModalOpen(true)}
                disabled={receiving}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#006699] hover:bg-[#005580] rounded-lg transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                <PackageCheck className="h-4 w-4" />
                <span>{receiving ? "Receiving..." : "Receive Items"}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Supplier Information Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xs space-y-4 transition-colors">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold text-sm border-b border-slate-100 dark:border-slate-800 pb-3">
              <Building2 className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              <span>Supplier Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
              <div className="space-y-1.5">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  COMPANY
                </span>
                <div className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                  {order.supplier?.name ?? "—"}
                </div>
                {order.supplier?.address && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                    {order.supplier.address}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  CONTACT & DELIVERY
                </span>
                <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {order.supplier?.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                      <span className="font-mono">{order.supplier.email}</span>
                    </div>
                  )}
                  {order.supplier?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                      <span className="font-mono">{order.supplier.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
                    <Calendar className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                    <span>Expected: {formatDisplayDate(order.expectedDelivery)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xs space-y-4 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold text-sm">
                <div className="p-1 bg-sky-100 dark:bg-sky-950/60 text-[#006699] dark:text-sky-400 rounded">
                  <Package className="h-3.5 w-3.5" />
                </div>
                <span>Order Items</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {orderItems.length} Item{orderItems.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              {orderItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No line items available for this order.
                </div>
              ) : (
                <table className="w-full text-left text-xs sm:text-[13px]">
                  <thead className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="py-3 px-4">PRODUCT</th>
                      <th className="py-3 px-4 font-mono">SKU / NDC</th>
                      <th className="py-3 px-4 text-center">QTY</th>
                      <th className="py-3 px-4 font-mono text-right">UNIT PRICE</th>
                      <th className="py-3 px-4 font-mono text-right">SUBTOTAL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {orderItems.map((item) => (
                      <tr key={item.sku} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800 dark:text-slate-200">{item.name}</div>
                          {item.pack && (
                            <div className="text-[11px] text-slate-400 dark:text-slate-500">{item.pack}</div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400 font-medium">
                          {item.sku}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800 dark:text-slate-100">
                          {item.qty}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-700 dark:text-slate-300">
                          {item.unitPrice}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800 dark:text-slate-100">
                          {item.subtotal}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Order Summary Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xs space-y-4 transition-colors">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold text-sm">
              <CreditCard className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              <span>Order Summary</span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              {order.subtotal && (
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                    {formatCurrency(order.subtotal)} ETB
                  </span>
                </div>
              )}

              {order.tax && (
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Tax (15% VAT)</span>
                  <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                    {formatCurrency(order.tax)} ETB
                  </span>
                </div>
              )}

              {order.shipping && (
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Shipping</span>
                  <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                    {formatCurrency(order.shipping)} ETB
                  </span>
                </div>
              )}

              <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex items-baseline justify-between">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Total</span>
                <span className="text-xl sm:text-2xl font-extrabold text-[#006699] dark:text-sky-400 font-mono">
                  {totalDisplay}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xs space-y-4 transition-colors">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold text-sm">
              <History className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              <span>Timeline</span>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {timeline.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={idx} className="relative group">
                    <div
                      className={`absolute -left-6 top-0.5 h-5 w-5 rounded-full border flex items-center justify-center ${step.color}`}
                    >
                      <Icon className="h-3 w-3" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {step.title}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {step.detail}
                      </p>
                      <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-0.5 block">
                        {step.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Receive Items Modal */}
      <ReceiveItemsModal
        isOpen={isReceiveModalOpen}
        onClose={() => setIsReceiveModalOpen(false)}
        poNumber={poId}
        items={orderItems.map((item) => ({
          name: item.name,
          sku: item.sku,
          qty: item.qty,
          unitPrice: item.unitPrice,
        }))}
        onConfirmReceive={handleConfirmReceive}
      />
    </div>
  );
}
