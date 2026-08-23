import type { Supplier } from "@/lib/types";
import { apiFetch, unwrapList } from "@/lib/api/client";

export async function getSuppliers(): Promise<Supplier[]> {
  const response = await apiFetch<unknown>("/suppliers");
  return unwrapList<Supplier>(response);
}

export async function createSupplier(
  supplier: Partial<Supplier>
): Promise<Supplier> {
  const response = await apiFetch<unknown>("/suppliers", {
    method: "POST",
    body: JSON.stringify(supplier),
  });
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data: Supplier }).data;
  }
  return response as Supplier;
}

export async function updateSupplier(
  id: string,
  supplier: Partial<Supplier>
): Promise<Supplier> {
  const response = await apiFetch<unknown>(`/suppliers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(supplier),
  });
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data: Supplier }).data;
  }
  return response as Supplier;
}

export async function deleteSupplier(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/suppliers/${id}`, { method: "DELETE" });
}
