import type { PaginationMeta, User, UserRole, UserStatus } from "@/lib/types";
import { apiFetch, buildQuery, unwrapList, unwrapMeta } from "@/lib/api/client";

export interface EmployeeListParams {
  q?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface EmployeeStats {
  Admin: number;
  Pharmacist: number;
  Cashier: number;
  Active: number;
  Inactive: number;
  total: number;
}

export interface CreateEmployeePayload {
  employeeId: string;
  name: string;
  email?: string | null;
  password: string;
  role: UserRole;
  phone?: string | null;
  status?: UserStatus;
}

export type UpdateEmployeePayload = Partial<
  Omit<CreateEmployeePayload, "password">
> & { password?: string };

export async function getEmployees(
  params: EmployeeListParams = {}
): Promise<{ data: User[]; meta?: PaginationMeta }> {
  const response = await apiFetch<unknown>(
    `/users${buildQuery({
      q: params.q,
      role: params.role && params.role !== "All" ? params.role : undefined,
      status:
        params.status && params.status !== "All" ? params.status : undefined,
      page: params.page,
      limit: params.limit,
    })}`
  );
  return { data: unwrapList<User>(response), meta: unwrapMeta(response) };
}

export async function getEmployee(id: string): Promise<User> {
  const response = await apiFetch<{ data: User }>(`/users/${id}`);
  return response.data;
}

export async function createEmployee(
  payload: CreateEmployeePayload
): Promise<User> {
  const response = await apiFetch<{ data: User }>("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function updateEmployee(
  id: string,
  payload: UpdateEmployeePayload
): Promise<User> {
  const response = await apiFetch<{ data: User }>(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function updateEmployeeStatus(
  id: string,
  status: UserStatus
): Promise<User> {
  const response = await apiFetch<{ data: User }>(`/users/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return response.data;
}

export async function getEmployeeStats(): Promise<EmployeeStats> {
  const response = await apiFetch<{ data: EmployeeStats }>("/users/stats");
  return response.data;
}
