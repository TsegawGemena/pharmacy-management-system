"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Package, Search } from "lucide-react";
import { getProducts } from "@/lib/api";
import type { Product } from "@/lib/types";

export interface MedicationSearchProps {
  placeholder?: string;
  onSelect: (product: Product) => void;
  className?: string;
  /** When true, clears the input after selection */
  clearOnSelect?: boolean;
  autoFocus?: boolean;
}

/**
 * Live medication search against GET /api/products?q=
 */
export default function MedicationSearch({
  placeholder = "Search for medication…",
  onSelect,
  className = "",
  clearOnSelect = true,
  autoFocus = false,
}: MedicationSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await getProducts({ q: trimmed, limit: 25 });
      setResults(data);
      setSearched(true);
      setOpen(true);
    } catch {
      setResults([]);
      setSearched(true);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      void runSearch(query);
    }, 280);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, runSearch]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const handleSelect = (product: Product) => {
    onSelect(product);
    if (clearOnSelect) setQuery("");
    else setQuery(product.name);
    setOpen(false);
    setResults([]);
    setSearched(false);
  };

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Search className="h-4 w-4" />
        )}
      </div>
      <input
        type="text"
        value={query}
        autoFocus={autoFocus}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          if (results.length > 0 || searched) setOpen(true);
        }}
        placeholder={placeholder}
        className="w-full rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-1.5 pl-9 pr-4 text-xs md:text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 shadow-2xs focus:border-sky-500 focus:outline-hidden focus:ring-1 focus:ring-sky-500 transition-all"
        aria-label="Search for medication"
        autoComplete="off"
      />

      {open && query.trim() && (
        <div className="absolute z-50 mt-1.5 w-full min-w-[280px] max-h-80 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg">
          {loading && results.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-slate-400">
              Searching…
            </div>
          ) : searched && results.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-slate-500">
              <Package className="h-5 w-5 mx-auto mb-2 opacity-40" />
              No medication found
            </div>
          ) : (
            <ul className="py-1">
              {results.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(p)}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0"
                  >
                    <div className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                      {p.name}
                    </div>
                    <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{p.category || "—"}</span>
                      <span className="font-mono">{p.stock} units</span>
                      <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">
                        {p.price} ETB
                      </span>
                      {p.status && <span>{p.status}</span>}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
