"use client";

import React, { useEffect, useState } from "react";
import { Pencil, X, Check, Tags } from "lucide-react";
import {
  getCategories,
  updateCategory,
  type Category,
} from "@/lib/api/categories";

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

export default function CategoryManagerModal({
  isOpen,
  onClose,
  onUpdated,
}: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await getCategories();
      setCategories(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) void load();
  }, [isOpen]);

  if (!isOpen) return null;

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setError(null);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const name = editName.trim();
    if (!name) {
      setError("Category name cannot be empty.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await updateCategory(editingId, name);
      setCategories((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
      setEditingId(null);
      onUpdated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update category");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Tags className="h-4 w-4 text-sky-600" />
            <h3 className="text-sm font-bold">Manage Categories</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {error && (
            <p className="mb-3 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}
          {loading ? (
            <p className="text-xs text-slate-400 py-8 text-center">Loading…</p>
          ) : categories.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">
              No categories yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li
                  key={cat.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800"
                >
                  {editingId === cat.id ? (
                    <>
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-2 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") void saveEdit();
                          if (e.key === "Escape") setEditingId(null);
                        }}
                      />
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => void saveEdit()}
                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                        title="Save"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
                        title="Cancel"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {cat.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => startEdit(cat)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-[#006699] hover:bg-sky-50 dark:hover:bg-sky-950/40 rounded-lg"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
