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

export function saveAuthSession(token: string, user: User) {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("auth_user", JSON.stringify(user));
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

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  }
}
