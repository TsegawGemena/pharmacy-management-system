"use client";

import { use } from "react";
import ReceiptPreviewPage from "@/components/receipt/receipt-preview-page";

export default function PharmacistReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <ReceiptPreviewPage
      invoiceId={decodeURIComponent(id)}
      backHref="/invoices"
      backLabel="Back to Invoices"
    />
  );
}
