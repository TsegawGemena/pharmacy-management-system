import type { Adjustment } from "@/lib/types";
import { apiFetch, unwrapList } from "@/lib/api/client";

export async function getAdjustments(): Promise<Adjustment[]> {
  const response = await apiFetch<unknown>("/adjustments");
  return unwrapList<Adjustment>(response);
}

export async function createAdjustment(
  adjustment: Partial<Adjustment>
): Promise<Adjustment> {
  const response = await apiFetch<unknown>("/adjustments", {
    method: "POST",
    body: JSON.stringify(adjustment),
  });
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data: Adjustment }).data;
  }
  return response as Adjustment;
}
