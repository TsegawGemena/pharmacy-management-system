"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-9 w-9 sm:w-24 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border transition-all duration-200 shadow-2xs group cursor-pointer active:scale-95 ${
        isDark
          ? "border-slate-700 bg-slate-900 text-sky-400 hover:bg-slate-800 hover:border-slate-600 hover:text-sky-300"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900"
      }`}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <div className="relative flex items-center justify-center">
        {isDark ? (
          <Moon className="h-4 w-4 text-sky-400 transition-transform group-hover:-rotate-12 duration-200" />
        ) : (
          <Sun className="h-4 w-4 text-amber-500 transition-transform group-hover:rotate-45 duration-200" />
        )}
      </div>
      <span className="text-xs font-semibold select-none hidden sm:inline">
        {isDark ? "Dark Mode" : "Light Mode"}
      </span>
    </button>
  );
}
