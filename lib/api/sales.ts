import type {
  PosProduct,
  SaleCheckoutRequest,
  SaleCheckoutResponse,
} from "@/lib/types";
import { apiFetch, unwrapList } from "@/lib/api/client";

export async function getPosProducts(): Promise<PosProduct[]> {
  const response = await apiFetch<unknown>("/pos/products");
  return unwrapList<PosProduct>(response);
}

export async function completeSale(
  payload: SaleCheckoutRequest
): Promise<SaleCheckoutResponse> {
  return apiFetch<SaleCheckoutResponse>("/sales", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function holdSale(
  payload: SaleCheckoutRequest
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/sales/hold", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
