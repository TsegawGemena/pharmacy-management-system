import type { PaginatedResponse, PaginationMeta } from "@/lib/types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

export function unwrapList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as PaginatedResponse<T>).data)
  ) {
    return (payload as PaginatedResponse<T>).data;
  }
  return [];
}

export function unwrapMeta(payload: unknown): PaginationMeta | undefined {
  if (payload && typeof payload === "object" && "meta" in payload) {
    return (payload as PaginatedResponse<unknown>).meta;
  }
  return undefined;
}

export function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

type ApiFetchOptions = RequestInit & {
  auth?: boolean;
};

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { auth = true, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    ...(customHeaders as Record<string, string>),
  };

  if (!(rest.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  if (auth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers,
  });

  let data: unknown = {};
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    data = await response.json().catch(() => ({}));
  } else if (response.ok && contentType?.includes("text/csv")) {
    return (await response.text()) as T;
  }

  if (!response.ok) {
    const message =
      (data as { message?: string })?.message ||
      `Request failed (${response.status})`;
    throw new ApiError(response.status, message);
  }

  return data as T;
}

export function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}
