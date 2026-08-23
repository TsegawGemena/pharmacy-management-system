import type { PurchaseOrder } from "@/lib/types";
import { apiFetch, unwrapList } from "@/lib/api/client";

export async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
  const response = await apiFetch<unknown>("/purchase-orders");
  return unwrapList<PurchaseOrder>(response);
}

export async function createPurchaseOrder(
  order: Partial<PurchaseOrder>
): Promise<PurchaseOrder> {
  const response = await apiFetch<unknown>("/purchase-orders", {
    method: "POST",
    body: JSON.stringify(order),
  });
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data: PurchaseOrder }).data;
  }
  return response as PurchaseOrder;
}

export async function getPurchaseOrder(id: string): Promise<PurchaseOrder> {
  const response = await apiFetch<unknown>(`/purchase-orders/${id}`);
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data: PurchaseOrder }).data;
  }
  return response as PurchaseOrder;
}

export async function updatePurchaseOrder(
  id: string,
  order: Partial<PurchaseOrder>
): Promise<PurchaseOrder> {
  const response = await apiFetch<unknown>(`/purchase-orders/${id}`, {
    method: "PATCH",
    body: JSON.stringify(order),
  });
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data: PurchaseOrder }).data;
  }
  return response as PurchaseOrder;
}

export async function submitPurchaseOrder(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/purchase-orders/${id}/submit`, {
    method: "POST",
  });
}

export async function receivePurchaseOrder(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/purchase-orders/${id}/receive`, {
    method: "POST",
  });
}

export async function cancelPurchaseOrder(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/purchase-orders/${id}/cancel`, {
    method: "POST",
  });
}
