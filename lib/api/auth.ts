import type {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginResponse,
  UpdateProfileRequest,
  User,
} from "@/lib/types";
import { apiFetch } from "@/lib/api/client";

export async function loginApi(
  employeeId: string,
  password: string
): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ employeeId, password }),
  });
}

export async function forgotPasswordApi(
  payload: ForgotPasswordRequest
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    auth: false,
    body: JSON.stringify(payload),
  });
}

export async function getMeApi(): Promise<User> {
  const response = await apiFetch<{ data: User }>("/auth/me");
  return response.data;
}

export async function logoutApi(): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/logout", { method: "POST" });
}

export async function changePasswordApi(
  payload: ChangePasswordRequest
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/change-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getUserProfileApi(): Promise<User> {
  const response = await apiFetch<{ data: User }>("/users/me");
  return response.data;
}

export async function updateUserProfileApi(
  payload: UpdateProfileRequest
): Promise<User> {
  const response = await apiFetch<{ data: User }>("/users/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return response.data;
}

export type AppRole = "Admin" | "Pharmacist" | "Cashier";

const SELECTED_ROLE_KEY = "auth_selected_role";

export function saveAuthSession(
  token: string,
  user: User,
  selectedRole?: AppRole
) {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("auth_user", JSON.stringify(user));
    if (selectedRole) {
      localStorage.setItem(SELECTED_ROLE_KEY, selectedRole);
    }
  }
}

export function getStoredUser(): User | null {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("auth_user");
    if (userStr) {
      try {
        return JSON.parse(userStr) as User;
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function getSelectedRole(): AppRole | null {
  if (typeof window === "undefined") return null;
  const role = localStorage.getItem(SELECTED_ROLE_KEY);
  if (role === "Admin" || role === "Pharmacist" || role === "Cashier") {
    return role;
  }
  return null;
}

/** Normalize role strings for comparison (e.g. "pharmacist", "Pharmacist"). */
export function normalizeRole(role: string | null | undefined): string {
  return (role ?? "").trim().toLowerCase();
}

/**
 * Resolve the active session role from login selection or stored user.
 */
export function getSessionRole(): AppRole | null {
  const selected = getSelectedRole();
  if (selected) return selected;
  const user = getStoredUser();
  const role = normalizeRole(user?.role);
  if (role === "admin") return "Admin";
  if (role === "pharmacist") return "Pharmacist";
  if (role === "cashier") return "Cashier";
  return null;
}

export function isPharmacistSession(): boolean {
  return getSessionRole() === "Pharmacist";
}

export function isAdminSession(): boolean {
  return getSessionRole() === "Admin";
}

/** Default home path for the signed-in role. */
export function getRoleHomePath(role?: AppRole | null): string {
  const r = role ?? getSessionRole();
  if (r === "Admin") return "/admin";
  if (r === "Pharmacist") return "/";
  return "/login";
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem(SELECTED_ROLE_KEY);
  }
}
