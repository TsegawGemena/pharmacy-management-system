"use client";

import React, { useState } from "react";
import { Sun, Moon, Sparkles, ChevronDown } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
        aria-label="Toggle theme"
        title="Switch theme (Light, Dark, Night)"
      >
        {theme === "light" && <Sun className="h-4 w-4 text-amber-500" />}
        {theme === "dark" && <Moon className="h-4 w-4 text-sky-400" />}
        {theme === "night" && <Sparkles className="h-4 w-4 text-indigo-400" />}
        <ChevronDown className="h-3 w-3 text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-36 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => {
                setTheme("light");
                setIsOpen(false);
              }}
              className={`flex w-full items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                theme === "light"
                  ? "bg-sky-50 dark:bg-sky-950 text-[#006699] dark:text-sky-400"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Sun className="h-4 w-4 text-amber-500" />
              <span>Light Mode</span>
            </button>

            <button
              onClick={() => {
                setTheme("dark");
                setIsOpen(false);
              }}
              className={`flex w-full items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                theme === "dark"
                  ? "bg-sky-50 dark:bg-sky-950 text-[#006699] dark:text-sky-400"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Moon className="h-4 w-4 text-sky-400" />
              <span>Dark Mode</span>
            </button>

            <button
              onClick={() => {
                setTheme("night");
                setIsOpen(false);
              }}
              className={`flex w-full items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                theme === "night"
                  ? "bg-sky-50 dark:bg-sky-950 text-[#006699] dark:text-sky-400"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span>Night / OLED</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
