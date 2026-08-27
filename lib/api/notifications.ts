import { apiFetch, unwrapList } from "@/lib/api/client";

export interface StockNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  productId?: string | null;
  productName: string;
  quantityChange?: number | null;
  quantityBefore?: number | null;
  quantityAfter?: number | null;
  batchNo?: string | null;
  actorId?: string | null;
  actorName?: string | null;
  createdAt: string;
  read: boolean;
}

export async function getNotifications(): Promise<StockNotification[]> {
  const response = await apiFetch<unknown>("/notifications");
  return unwrapList<StockNotification>(response);
}

export async function getNotificationUnreadCount(): Promise<number> {
  const response = await apiFetch<{ unread: number }>(
    "/notifications/unread-count"
  );
  return response.unread ?? 0;
}

export async function markNotificationRead(
  id: string
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/notifications/${id}/read`, {
    method: "POST",
  });
}

export async function markAllNotificationsRead(): Promise<{
  message: string;
  count: number;
}> {
  return apiFetch<{ message: string; count: number }>(
    "/notifications/read-all",
    { method: "POST" }
  );
}
