import { apiFetch, unwrapList } from "@/lib/api/client";

export interface AttendanceRecord {
  id?: string;
  date?: string;
  clockIn?: string;
  clockOut?: string;
  hours?: number;
  status?: string;
}

export interface ActivityRecord {
  id?: string;
  action?: string;
  timestamp?: string;
  details?: string;
}

export async function getAttendance(): Promise<AttendanceRecord[]> {
  const response = await apiFetch<unknown>("/attendance");
  return unwrapList<AttendanceRecord>(response);
}

export async function clockInApi(): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/attendance/clock-in", { method: "POST" });
}

export async function clockOutApi(): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/attendance/clock-out", { method: "POST" });
}

export async function getActivity(): Promise<ActivityRecord[]> {
  const response = await apiFetch<unknown>("/activity");
  return unwrapList<ActivityRecord>(response);
}
