import type { Dashboard } from "@/lib/types";
import { apiFetch, buildQuery } from "@/lib/api/client";

export async function getDashboard(): Promise<Dashboard> {
  const response = await apiFetch<unknown>("/dashboard");
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data: Dashboard }).data;
  }
  return response as Dashboard;
}

export async function getSalesReport(
  range: "today" | "week" | "month" = "today"
): Promise<unknown> {
  return apiFetch<unknown>(`/reports/sales${buildQuery({ range })}`);
}

export async function getRevenueProfitReport(): Promise<unknown> {
  return apiFetch<unknown>("/reports/revenue-profit");
}

export async function getCategoryReport(): Promise<unknown> {
  return apiFetch<unknown>("/reports/by-category");
}

export async function getExpiryReport(): Promise<unknown> {
  return apiFetch<unknown>("/reports/expiry");
}
