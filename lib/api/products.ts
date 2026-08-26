import type { PaginationMeta, Product } from "@/lib/types";
import { apiFetch, buildQuery, unwrapList, unwrapMeta } from "@/lib/api/client";

export interface ProductListParams {
  q?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export async function getProducts(
  params: ProductListParams = {}
): Promise<{ data: Product[]; meta?: PaginationMeta }> {
  const response = await apiFetch<unknown>(
    `/products${buildQuery({
      q: params.q,
      category: params.category !== "All Categories" ? params.category : undefined,
      status: params.status !== "All Statuses" ? params.status : undefined,
      page: params.page,
      limit: params.limit,
    })}`
  );
  return { data: unwrapList<Product>(response), meta: unwrapMeta(response) };
}

export async function getProduct(id: string): Promise<Product> {
  const response = await apiFetch<unknown>(`/products/${id}`);
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data: Product }).data;
  }
  return response as Product;
}

export interface CreateProductPayload {
  name: string;
  category: string;
  sku?: string;
  status?: "Active" | "Inactive";
  quantity?: number;
  stock?: number;
  batchNo?: string;
  expiryDate?: string;
  purchasePrice: number | string;
  sellingPrice: number | string;
  price?: number | string;
  priceValidFrom?: string;
  priceValidUntil?: string | null;
}

export async function createProduct(
  product: CreateProductPayload | Partial<Product>
): Promise<Product> {
  const response = await apiFetch<unknown>("/products", {
    method: "POST",
    body: JSON.stringify(product),
  });
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data: Product }).data;
  }
  return response as Product;
}

export async function updateProduct(
  id: string,
  product: Partial<Product>
): Promise<Product> {
  const response = await apiFetch<unknown>(`/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(product),
  });
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data: Product }).data;
  }
  return response as Product;
}

export async function deleteProduct(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/products/${id}`, { method: "DELETE" });
}
