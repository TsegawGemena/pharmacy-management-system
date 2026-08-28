import { getInvoice } from "@/lib/api/invoices";
import type { Invoice } from "@/lib/types";
import type { ReceiptData } from "@/lib/receipt";
import { enrichReceiptData } from "@/lib/receipt";
import {
  displayReceiptNumber,
  splitReceiptDateTime,
} from "@/lib/receipt-format";

export { displayReceiptNumber as formatReceiptNumber, splitReceiptDateTime };

export function mapInvoiceToReceiptData(
  inv: Invoice & {
    amountTendered?: string;
    changeDue?: string;
    pharmacyName?: string;
  }
): ReceiptData {
  const items = (inv.items ?? []).map((i) => ({
    name: i.name,
    qty: i.qty,
    price: i.price,
    unit: (i as { unit?: string }).unit,
  }));

  return {
    pharmacyName: inv.pharmacyName,
    invoiceNumber: inv.id,
    date: inv.date,
    createdAt: inv.createdAt,
    items:
      items.length > 0
        ? items
        : [
            {
              name: `Invoice ${inv.id}`,
              qty: 1,
              price: inv.total ?? inv.amount,
            },
          ],
    subtotal: inv.subtotal ?? inv.amount,
    vat: inv.vat ?? 0,
    total: inv.total ?? inv.amount,
    paymentMethod: inv.paymentMethod,
    amountTendered: inv.amountTendered,
    changeDue: inv.changeDue,
  };
}

export async function receiptDataFromInvoice(id: string): Promise<ReceiptData> {
  const inv = await getInvoice(id);
  const base = mapInvoiceToReceiptData(inv);
  return enrichReceiptData(base);
}

export function receiptPathForRole(
  invoiceId: string,
  role?: string | null
): string {
  const id = encodeURIComponent(invoiceId);
  if (role === "Cashier") {
    return `/cashier/invoices/${id}/receipt`;
  }
  return `/invoices/${id}/receipt`;
}
