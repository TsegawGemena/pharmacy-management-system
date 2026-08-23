import type { InventoryItem } from "@/lib/types";
import { apiFetch, unwrapList } from "@/lib/api/client";

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

export async function getInventoryAlerts(): Promise<InventoryItem[]> {
  const response = await apiFetch<unknown>("/inventory/alerts");
  return unwrapList<InventoryItem>(response);
}

export async function getExpiringInventory(): Promise<InventoryItem[]> {
  const response = await apiFetch<unknown>("/inventory/expiring");
  return unwrapList<InventoryItem>(response);
}
