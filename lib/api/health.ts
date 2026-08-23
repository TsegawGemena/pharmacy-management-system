import type { HealthResponse } from "@/lib/types";
import { apiFetch } from "@/lib/api/client";

export async function healthCheckApi(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>("/health", { auth: false });
}
