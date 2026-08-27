"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import {
  getNotifications,
  getNotificationUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  type StockNotification,
} from "@/lib/api/notifications";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<StockNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const refreshCount = useCallback(async () => {
    try {
      const count = await getNotificationUnreadCount();
      setUnread(count);
    } catch {
      // keep previous
    }
  }, []);

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      setItems(data);
      setUnread(data.filter((n) => !n.read).length);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshCount();
    const id = setInterval(() => void refreshCount(), 30000);
    return () => clearInterval(id);
  }, [refreshCount]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) await loadList();
  };

  const handleMarkOne = async (id: string) => {
    try {
      await markNotificationRead(id);
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnread((c) => Math.max(0, c - 1));
    } catch {
      // ignore
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnread(0);
    } catch {
      // ignore
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => void toggle()}
        className="relative rounded-full p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[420px] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Stock notifications
            </h3>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => void handleMarkAll()}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 hover:underline"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>
          <div className="overflow-y-auto max-h-[360px]">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-xs text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading…
              </div>
            ) : items.length === 0 ? (
              <p className="py-10 text-center text-xs text-slate-400">
                No stock notifications yet.
              </p>
            ) : (
              <ul>
                {items.map((n) => (
                  <li
                    key={n.id}
                    className={`px-4 py-3 border-b border-slate-50 dark:border-slate-800 ${
                      n.read
                        ? "bg-white dark:bg-slate-900"
                        : "bg-sky-50/70 dark:bg-sky-950/30"
                    }`}
                  >
                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={() => {
                        if (!n.read) void handleMarkOne(n.id);
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="mt-1 h-2 w-2 rounded-full bg-sky-500 shrink-0" />
                        )}
                      </div>
                      <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        {n.message}
                      </p>
                      <p className="mt-1.5 text-[10px] text-slate-400">
                        {n.actorName ? `${n.actorName} · ` : ""}
                        {new Date(n.createdAt).toLocaleString()}
                        {n.batchNo ? ` · Batch ${n.batchNo}` : ""}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
