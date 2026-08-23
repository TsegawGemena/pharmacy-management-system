import type { Invoice, InvoiceStatus } from "@/lib/types";
import { apiFetch, buildQuery, unwrapList } from "@/lib/api/client";

export interface InvoiceListParams {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  q?: string;
}

export async function getInvoices(
  params: InvoiceListParams = {}
): Promise<Invoice[]> {
  const response = await apiFetch<unknown>(
    `/invoices${buildQuery({
      status: params.status !== "All Statuses" ? params.status : undefined,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      q: params.q,
    })}`
  );
  return unwrapList<Invoice>(response);
}

export async function getInvoice(id: string): Promise<Invoice> {
  const response = await apiFetch<unknown>(`/invoices/${id}`);
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data: Invoice }).data;
  }
  return response as Invoice;
}

export async function updateInvoiceStatus(
  id: string,
  status: InvoiceStatus
): Promise<Invoice> {
  const response = await apiFetch<unknown>(`/invoices/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data: Invoice }).data;
  }
  return response as Invoice;
}

export async function exportInvoices(
  params: InvoiceListParams = {}
): Promise<string> {
  return apiFetch<string>(
    `/invoices/export${buildQuery({
      status: params.status !== "All Statuses" ? params.status : undefined,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      q: params.q,
    })}`,
    { auth: true }
  );
}
