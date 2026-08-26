import type { InventoryItem } from "@/lib/types";
import { apiFetch, unwrapList } from "@/lib/api/client";

export interface RestockPayload {
  productId: string;
  quantity: number;
  unitPrice?: number | string;
  batchNo?: string;
  expiryDate?: string;
  minStock?: number;
}

export async function getInventory(): Promise<InventoryItem[]> {
  const response = await apiFetch<unknown>("/inventory");
  return unwrapList<InventoryItem>(response);
}

export async function createInventoryItem(
  item: Partial<InventoryItem>
): Promise<InventoryItem> {
  const response = await apiFetch<unknown>("/inventory", {
    method: "POST",
    body: JSON.stringify(item),
  });
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data: InventoryItem }).data;
  }
  return response as InventoryItem;
}

export async function updateInventoryItem(
  id: string,
  item: Partial<InventoryItem>
): Promise<InventoryItem> {
  const response = await apiFetch<unknown>(`/inventory/${id}`, {
    method: "PATCH",
    body: JSON.stringify(item),
  });
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data: InventoryItem }).data;
  }
  return response as InventoryItem;
}

/** Increase stock for an existing product (does not create a new Product). */
export async function restockInventory(
  payload: RestockPayload
): Promise<InventoryItem> {
  const response = await apiFetch<unknown>("/inventory/restock", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data: InventoryItem }).data;
  }
  return response as InventoryItem;
}

export async function getInventoryAlerts(): Promise<InventoryItem[]> {
  const response = await apiFetch<unknown>("/inventory/alerts");
  return unwrapList<InventoryItem>(response);
}

export async function getExpiringInventory(): Promise<InventoryItem[]> {
  const response = await apiFetch<unknown>("/inventory/expiring");
  return unwrapList<InventoryItem>(response);
}
