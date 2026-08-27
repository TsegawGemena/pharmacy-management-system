import type { PaymentMethod } from "@/lib/types";

export interface ReceiptLineItem {
  name: string;
  qty: number;
  price: number | string;
}

export interface ReceiptData {
  pharmacyName?: string;
  invoiceNumber: string;
  createdAt?: string;
  date?: string;
  items: ReceiptLineItem[];
  subtotal: number | string;
  vat: number | string;
  total: number | string;
  paymentMethod?: string | PaymentMethod;
  amountTendered?: number | string;
  changeDue?: number | string;
}

function toNum(v: number | string | undefined): number {
  if (typeof v === "number") return v;
  if (!v) return 0;
  return Number(String(v).replace(/[^0-9.-]/g, "")) || 0;
}

function formatMoney(v: number | string | undefined): string {
  return toNum(v).toFixed(2);
}

function formatDateTime(iso?: string, dateOnly?: string): string {
  if (iso) {
    const d = new Date(iso);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleString();
    }
  }
  if (dateOnly) return dateOnly;
  return new Date().toLocaleString();
}

function paymentLabel(method?: string): string {
  if (!method) return "—";
  const m = method.toLowerCase();
  if (m === "cash") return "Cash";
  if (m === "telebirr") return "Telebirr";
  if (m === "card") return "Card";
  return method;
}

/** Shared A5 receipt HTML used for print and PDF. */
export function buildReceiptHtml(data: ReceiptData): string {
  const pharmacy = data.pharmacyName || "Gammo Pharmacy";
  const rows = data.items
    .map((item) => {
      const unit = toNum(item.price);
      const line = unit * item.qty;
      return `<tr>
        <td style="padding:6px 4px;border-bottom:1px solid #e2e8f0;">${escapeHtml(item.name)}</td>
        <td style="padding:6px 4px;border-bottom:1px solid #e2e8f0;text-align:center;">${item.qty}</td>
        <td style="padding:6px 4px;border-bottom:1px solid #e2e8f0;text-align:right;">${unit.toFixed(2)}</td>
        <td style="padding:6px 4px;border-bottom:1px solid #e2e8f0;text-align:right;">${line.toFixed(2)}</td>
      </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Receipt ${escapeHtml(data.invoiceNumber)}</title>
  <style>
    @page { size: A5; margin: 12mm; }
    * { box-sizing: border-box; }
    body {
      font-family: "Segoe UI", Helvetica, Arial, sans-serif;
      color: #0f172a;
      margin: 0;
      padding: 0;
      font-size: 11px;
      width: 148mm;
    }
    .receipt { width: 100%; max-width: 148mm; margin: 0 auto; padding: 8px 4px; }
    h1 { font-size: 18px; margin: 0 0 4px; color: #0c3e66; }
    .muted { color: #64748b; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th { text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; padding: 4px; border-bottom: 2px solid #0c3e66; }
    .totals { margin-top: 14px; width: 100%; }
    .totals td { padding: 3px 0; }
    .totals .label { color: #64748b; }
    .totals .value { text-align: right; font-variant-numeric: tabular-nums; }
    .grand { font-size: 14px; font-weight: 700; border-top: 2px solid #0c3e66; padding-top: 8px !important; }
    .footer { margin-top: 18px; text-align: center; color: #94a3b8; font-size: 10px; }
    @media print {
      body { width: auto; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <h1>${escapeHtml(pharmacy)}</h1>
    <div class="muted">Pharmacy Sales Receipt</div>
    <div style="margin-top:10px;line-height:1.6;">
      <div><strong>Receipt #:</strong> ${escapeHtml(data.invoiceNumber)}</div>
      <div><strong>Date:</strong> ${escapeHtml(formatDateTime(data.createdAt, data.date))}</div>
      <div><strong>Payment:</strong> ${escapeHtml(paymentLabel(data.paymentMethod))}</div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Medication</th>
          <th style="text-align:center;">Qty</th>
          <th style="text-align:right;">Unit</th>
          <th style="text-align:right;">Amount</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <table class="totals">
      <tr><td class="label">Subtotal</td><td class="value">${formatMoney(data.subtotal)} ETB</td></tr>
      <tr><td class="label">VAT (15%)</td><td class="value">${formatMoney(data.vat)} ETB</td></tr>
      <tr class="grand"><td>Total</td><td class="value">${formatMoney(data.total)} ETB</td></tr>
      ${
        data.amountTendered !== undefined
          ? `<tr><td class="label">Amount received</td><td class="value">${formatMoney(data.amountTendered)} ETB</td></tr>`
          : ""
      }
      ${
        data.changeDue !== undefined
          ? `<tr><td class="label">Change</td><td class="value">${formatMoney(data.changeDue)} ETB</td></tr>`
          : ""
      }
    </table>
    <div class="footer">Thank you for choosing ${escapeHtml(pharmacy)}</div>
  </div>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Open a print window sized for A5 — does not print the app chrome. */
export function printReceiptA5(data: ReceiptData): void {
  const html = buildReceiptHtml(data);
  const win = window.open("", "_blank", "width=560,height=800");
  if (!win) {
    alert("Please allow pop-ups to print the receipt.");
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, 250);
}

/** Escape PDF string literals. */
function pdfEscape(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

/**
 * Build a minimal single-page A5 PDF (148mm × 210mm) without external deps.
 * Content mirrors the printed receipt layout.
 */
function buildReceiptPdfBytes(data: ReceiptData): Uint8Array {
  // A5 in points (1 pt = 1/72 in); 148mm ≈ 419.53, 210mm ≈ 595.28
  const pageW = 419.53;
  const pageH = 595.28;
  const left = 40;
  let y = pageH - 48;
  const lines: string[] = [];

  const push = (text: string, size = 10, bold = false) => {
    const font = bold ? "F2" : "F1";
    lines.push(`BT /${font} ${size} Tf ${left} ${y.toFixed(2)} Td (${pdfEscape(text)}) Tj ET`);
    y -= size + 4;
  };

  const pharmacy = data.pharmacyName || "Gammo Pharmacy";
  push(pharmacy, 16, true);
  push("Pharmacy Sales Receipt", 9);
  y -= 4;
  push(`Receipt #: ${data.invoiceNumber}`, 10);
  push(`Date: ${formatDateTime(data.createdAt, data.date)}`, 10);
  push(`Payment: ${paymentLabel(data.paymentMethod)}`, 10);
  y -= 6;
  push("Medication                  Qty    Unit     Amount", 9, true);

  for (const item of data.items) {
    const unit = toNum(item.price);
    const amount = unit * item.qty;
    const name = item.name.length > 28 ? `${item.name.slice(0, 25)}...` : item.name;
    const row = `${name.padEnd(28)} ${String(item.qty).padStart(3)}  ${unit
      .toFixed(2)
      .padStart(7)}  ${amount.toFixed(2).padStart(8)}`;
    push(row, 9);
    if (y < 80) break;
  }

  y -= 6;
  push(`Subtotal: ${formatMoney(data.subtotal)} ETB`, 10);
  push(`VAT (15%): ${formatMoney(data.vat)} ETB`, 10);
  push(`Total: ${formatMoney(data.total)} ETB`, 12, true);
  if (data.amountTendered !== undefined) {
    push(`Amount received: ${formatMoney(data.amountTendered)} ETB`, 10);
  }
  if (data.changeDue !== undefined) {
    push(`Change: ${formatMoney(data.changeDue)} ETB`, 10);
  }
  y -= 8;
  push(`Thank you for choosing ${pharmacy}`, 8);

  const content = lines.join("\n");
  const objects: string[] = [];
  objects.push("1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n");
  objects.push("2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n");
  objects.push(
    `3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>endobj\n`
  );
  objects.push(
    `4 0 obj<< /Length ${content.length} >>stream\n${content}\nendstream\nendobj\n`
  );
  objects.push(
    "5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\n"
  );
  objects.push(
    "6 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>endobj\n"
  );

  let pdf = "%PDF-1.4\n";
  const encoder = new TextEncoder();
  const offsets: number[] = [0];
  let offset = encoder.encode(pdf).length;
  for (const obj of objects) {
    offsets.push(offset);
    pdf += obj;
    offset += encoder.encode(obj).length;
  }
  const xrefStart = offset;
  let xref = `xref\n0 ${objects.length + 1}\n`;
  xref += "0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i++) {
    xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  xref += `trailer<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  xref += `startxref\n${xrefStart}\n%%EOF`;
  pdf += xref;

  return encoder.encode(pdf);
}

/** Generate and download an A5 PDF matching the printed receipt. */
export async function downloadReceiptPdf(data: ReceiptData): Promise<void> {
  try {
    const bytes = buildReceiptPdfBytes(data);
    const blob = new Blob([bytes.buffer as ArrayBuffer], {
      type: "application/pdf",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${data.invoiceNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch {
    printReceiptA5(data);
  }
}

