"use client";

import React from "react";
import { TriangleAlert, Clock, Banknote, TrendingUp } from "lucide-react";

export default function StatCards() {
  const cards = [
    {
      title: "Total Products",
      value: "1,248",
      subtext: (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          1,196 active in inventory
        </span>
      ),
      icon: (
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100/90 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
          <svg
            className="h-5 w-5 fill-current"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 3C6.44772 3 6 3.44772 6 4V6H18V4C18 3.44772 17.5523 3 17 3H7ZM5 7C4.44772 7 4 7.44772 4 8V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8C20 7.44772 19.5523 7 19 7H5ZM11 10C11 9.44772 11.4477 9 12 9C12.5523 9 13 9.44772 13 10V13H16C16.5523 13 17 13.4477 17 14C17 14.5523 16.5523 15 16 15H13V18C13 18.5523 12.5523 19 12 19C11.4477 19 11 18.5523 11 18V15H8C7.44772 15 7 14.5523 7 14C7 13.4477 7.44772 13 8 13H11V10Z"
              fill="currentColor"
            />
          </svg>
        </div>
      ),
    },
    {
      title: "Low Stock",
      value: "18",
      subtext: (
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-600 dark:bg-rose-400 inline-block"></span>
            5 critical
          </span>
          <span className="text-slate-500 dark:text-slate-400">require ordering</span>
        </div>
      ),
      icon: (
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100/90 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
          <TriangleAlert className="h-5 w-5" />
        </div>
      ),
    },
    {
      title: "Expiring Soon",
      value: "7",
      subtext: (
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-600 dark:bg-amber-400 inline-block"></span>
            3 within 30 days
          </span>
        </div>
      ),
      icon: (
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100/90 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
          <Clock className="h-5 w-5" />
        </div>
      ),
    },
    {
      title: "Today's Sales",
      value: (
        <div className="flex items-baseline gap-1.5">
          <span>24,850</span>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">ETB</span>
        </div>
      ),
      subtext: (
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
            <TrendingUp className="h-3.5 w-3.5 inline" />
            +8.5%
          </span>
          <span className="text-slate-500 dark:text-slate-400">vs yesterday</span>
        </div>
      ),
      icon: (
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100/90 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
          <Banknote className="h-5 w-5" />
        </div>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs hover:shadow-xs transition-colors flex flex-col justify-between"
        >
          {/* Card Top */}
          <div className="flex items-start justify-between">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {card.title}
            </span>
            {card.icon}
          </div>

          {/* Card Number */}
          <div className="mt-2.5">
            <div className="text-[28px] font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-none">
              {card.value}
            </div>
          </div>

          {/* Card Footer */}
          <div className="mt-3.5 pt-1">{card.subtext}</div>
        </div>
      ))}
    </div>
  );
}
