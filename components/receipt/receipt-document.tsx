"use client";

import React, { useCallback, useMemo, useRef } from "react";
import type { ReceiptData } from "@/lib/receipt";
import { buildReceiptHtml } from "@/lib/receipt";

interface ReceiptDocumentProps {
  data: ReceiptData;
  className?: string;
}

/**
 * Renders the shared receipt HTML template in an A5 iframe so preview,
 * browser print, and PDF download all use the exact same design.
 */
export default function ReceiptDocument({
  data,
  className = "",
}: ReceiptDocumentProps) {
  const html = useMemo(() => buildReceiptHtml(data), [data]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const syncHeight = useCallback(() => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    if (!iframe || !doc?.documentElement) return;
    iframe.style.height = `${doc.documentElement.scrollHeight}px`;
  }, []);

  return (
    <iframe
      ref={iframeRef}
      id="receipt-print-root"
      title="Pharmacy receipt"
      srcDoc={html}
      onLoad={syncHeight}
      className={`print-receipt border-0 bg-white shadow-lg print:shadow-none ${className}`}
      style={{ width: "148mm", minHeight: "210mm" }}
    />
  );
}
