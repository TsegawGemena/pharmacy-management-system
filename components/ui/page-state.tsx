"use client";

import React from "react";
import { Loader2, AlertCircle } from "lucide-react";

interface PageStateProps {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyMessage?: string;
  onRetry?: () => void;
  children: React.ReactNode;
}

export function PageState({
  loading,
  error,
  empty,
  emptyMessage = "No data found.",
  onRetry,
  children,
}: PageStateProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-500 dark:text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-sky-600 mb-3" />
        <p className="text-sm font-medium">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-4">
        <AlertCircle className="h-8 w-8 text-amber-500 mb-3" />
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 max-w-md">
          {error}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-sky-600 text-white hover:bg-sky-700"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  if (empty) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-500">
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
}

export function InlineError({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/40 px-4 py-3 text-xs text-amber-800 dark:text-amber-200">
      {message}
    </div>
  );
}
